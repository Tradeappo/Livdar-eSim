#!/usr/bin/env python3
"""
Acquire openly licensed GTFS feeds and reduce each to a connected-pair graph.

WHY THIS EXISTS. reports/livdar-expiry-freeze-2026-09-30/1M-CAPACITY-CEILING-2026-10-07.md
measured the inventory ceiling at roughly 692,000 against a target of 1,000,000 and named
exactly one acquisition that closes the gap without touching a quality gate: transport
routing data. The competitor measurement behind that finding is rome2rio at 1,850,129
organic keywords, built on an ordered pair over a heterogeneous transport node set.

WHAT MAKES THIS DIFFERENT FROM THE AIR AND RAIL PAIRS ALREADY ON DISK. Those rest on an
airport list and a Wikidata adjacency graph, so a pair page can say the two places are
connected and how far apart they are, and nothing else. The brief forbids inventing a
timetable, a fare, a frequency or a duration. GTFS CARRIES all four as source data, so a
page built from it can state a real scheduled duration and a real service frequency and
cite the agency that published them. That is the information gain the pair axis was
missing.

SELECTION. Task #100 approved "Mobility Database GTFS feeds with a stated licence only".
This takes that literally and goes further: a licence URL is not enough, it has to be a
licence this project can recognise and name. Of 1,554 no-auth feeds with a direct
download, 105 carry a recognised open licence (OGL v3.0, CC BY, CC0, Licence Ouverte,
ODbL, Licence Quebec). The other 996 state no licence at all and 400-odd point at bespoke
terms pages that would each have to be read by a person; none of those are taken.

DISK. The container has a fixed writable allowance, so a feed is downloaded, read FROM
the zip without extracting, reduced to a pair aggregate, and the zip is deleted before
the next one starts. Peak extra disk is one feed.

RESUMABLE. One output file per feed plus a .done marker, so an interrupted run continues.

Output: data/atlas/sources/transport/gtfs/pairs-<mdb_id>.json.gz per feed, each holding
the stops it kept and the directly served pairs with their measured durations.
"""
import json, gzip, os, sys, csv, io, zipfile, urllib.request, collections, time, statistics

ROOT = '/home/user/Livdar-eSim/'
SEL = sys.argv[1] if len(sys.argv) > 1 else (
    '/tmp/claude-0/-home-user-Livdar-eSim/0540a0b3-118a-5774-8362-353683713b83/'
    'scratchpad/gtfs-catalog/selected.json')
OUT = ROOT + 'data/atlas/sources/transport/gtfs/'
TMP = '/tmp/gtfs-work/'
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)

FEEDS = json.load(open(SEL))

# GTFS route_type. The pair axis is only interesting where the service is one a traveller
# plans a journey around. A city bus stop pair is a real connection and a worthless page:
# there are millions of them, they carry no name a person searches, and they would be the
# arbitrary Cartesian product the brief forbids in all but name. So the node gate below
# keeps stations and interchanges, and this table keeps the modes.
RAIL_LIKE = {'0': 'tram', '1': 'subway', '2': 'rail', '4': 'ferry', '5': 'cable_tram',
             '6': 'aerial_lift', '7': 'funicular', '11': 'trolleybus', '12': 'monorail'}
BUS = {'3': 'bus'}


def rd(z, name):
    """Read one GTFS member as dicts. Missing members are normal: stop_times.txt is
    mandatory but frequencies.txt is not, and a feed may ship either."""
    try:
        with z.open(name) as f:
            data = f.read()
    except KeyError:
        return []
    # GTFS is UTF-8 but BOMs are common and a BOM on the first header breaks the key
    txt = data.decode('utf-8-sig', 'replace')
    return list(csv.DictReader(io.StringIO(txt)))


def secs(hhmmss):
    """GTFS times pass 24:00:00 for a service running past midnight, which is legal and
    must not be parsed as a clock time."""
    try:
        h, m, s = (int(x) for x in hhmmss.split(':'))
        return h * 3600 + m * 60 + s
    except Exception:
        return None


def harvest(feed):
    mid = feed['mdb_source_id']
    done = OUT + f'.done-{mid}'
    if os.path.exists(done):
        return 'skip'
    # A published catalogue decays: of the first 27 feeds tried, 11 failed on a dead
    # publisher URL (404), a moved host (DNS), a 403, or an HTML error page served with a
    # .zip name. The Mobility Database mirrors every feed at urls.latest, so that is tried
    # second rather than writing the feed off. Both URLs are recorded on the failure so a
    # reader can tell a dead feed from a transient one.
    zp = TMP + f'{mid}.zip'
    errs = []
    for url in [u for u in (feed['urls.direct_download'], feed['urls.latest']) if u]:
        try:
            req = urllib.request.Request(
                url, headers={'User-Agent': 'livdar-atlas/1.0 (atlas@livdar)'})
            with urllib.request.urlopen(req, timeout=300) as r, open(zp, 'wb') as f:
                while True:
                    b = r.read(1 << 20)
                    if not b: break
                    f.write(b)
            if zipfile.is_zipfile(zp):
                break
            errs.append(f'{url[:70]}: not a zip')
        except Exception as e:
            errs.append(f'{url[:70]}: {type(e).__name__}: {str(e)[:90]}')
        if os.path.exists(zp): os.remove(zp)
    else:
        json.dump({'mdb_source_id': mid, 'errors': errs},
                  open(OUT + f'failed-{mid}.json', 'w'), indent=1)
        return 'fail'

    try:
        z = zipfile.ZipFile(zp)
        stops = {s['stop_id']: s for s in rd(z, 'stops.txt')}
        routes = {r['route_id']: r for r in rd(z, 'routes.txt')}
        trips = {t['trip_id']: t for t in rd(z, 'trips.txt')}
        st = rd(z, 'stop_times.txt')
        agency = rd(z, 'agency.txt')
        z.close()
    except Exception as e:
        json.dump({'mdb_source_id': mid, 'error': f'unzip: {type(e).__name__}: {str(e)[:200]}'},
                  open(OUT + f'failed-{mid}.json', 'w'))
        if os.path.exists(zp): os.remove(zp)
        return 'fail'
    finally:
        if os.path.exists(zp): os.remove(zp)

    # ---- how many distinct routes serve each stop; an interchange is a stop many routes meet
    stop_routes = collections.defaultdict(set)
    by_trip = collections.defaultdict(list)
    for r in st:
        tid = r.get('trip_id')
        if not tid: continue
        by_trip[tid].append(r)
        t = trips.get(tid)
        if t: stop_routes[r.get('stop_id')].add(t.get('route_id'))

    # ---- NODE GATE. A pair page needs two places a reader would name.
    # Kept: a stop GTFS itself calls a station (location_type 1), a stop that is the parent
    # of others, or a stop where at least three distinct routes meet. Everything else is a
    # roadside stop and is dropped.
    parents = {s.get('parent_station') for s in stops.values() if s.get('parent_station')}
    keep = {}
    for sid, s in stops.items():
        lt = (s.get('location_type') or '0').strip() or '0'
        nroutes = len(stop_routes.get(sid, ()))
        if lt == '1' or sid in parents or nroutes >= 3:
            name = (s.get('stop_name') or '').strip()
            if not name:
                continue
            try:
                lat, lon = float(s['stop_lat']), float(s['stop_lon'])
            except Exception:
                continue
            keep[sid] = {'name': name, 'lat': lat, 'lon': lon, 'routes': nroutes,
                         'location_type': lt, 'code': (s.get('stop_code') or '').strip()}

    # ---- PAIRS. Only stops that share one trip, which is a DIRECT service and a fact the
    # feed states. Durations come from the stop_times of that trip, so the number on the page
    # is the published schedule and not an estimate.
    pairs = collections.defaultdict(lambda: {'trips': 0, 'durations': [], 'modes': set(),
                                             'routes': set(), 'route_names': set()})
    for tid, rowsl in by_trip.items():
        t = trips.get(tid)
        if not t: continue
        rt = routes.get(t.get('route_id') or '')
        if not rt: continue
        rtype = (rt.get('route_type') or '').strip()
        mode = RAIL_LIKE.get(rtype) or BUS.get(rtype)
        if not mode:
            continue
        try:
            rowsl.sort(key=lambda r: int(r.get('stop_sequence') or 0))
        except Exception:
            continue
        seq = [(r.get('stop_id'), secs(r.get('departure_time') or r.get('arrival_time') or ''))
               for r in rowsl]
        seq = [(sid, tm) for sid, tm in seq if sid in keep]
        if len(seq) < 2:
            continue
        rname = ((rt.get('route_short_name') or '').strip() or
                 (rt.get('route_long_name') or '').strip())
        for i in range(len(seq)):
            for j in range(i + 1, len(seq)):
                a, b = seq[i][0], seq[j][0]
                if a == b: continue
                k = (a, b) if a < b else (b, a)
                p = pairs[k]
                p['trips'] += 1
                if seq[i][1] is not None and seq[j][1] is not None:
                    d = seq[j][1] - seq[i][1]
                    if 0 < d <= 24 * 3600:
                        p['durations'].append(d)
                p['modes'].add(mode)
                p['routes'].add(t.get('route_id'))
                if rname: p['route_names'].add(rname)

    out = {
        'mdb_source_id': mid, 'provider': feed['provider'], 'feed_name': feed['name'],
        'country': feed['location.country_code'],
        'subdivision': feed['location.subdivision_name'],
        'municipality': feed['location.municipality'],
        'licence': feed['_lic'], 'licence_url': feed['urls.license'],
        'agency': [{'name': a.get('agency_name'), 'url': a.get('agency_url')} for a in agency[:5]],
        'stops_in_feed': len(stops), 'stops_kept': len(keep),
        'pairs_direct_service': len(pairs),
        'stops': keep,
        'pairs': [{'a': k[0], 'b': k[1], 'trips': v['trips'],
                   'median_duration_s': int(statistics.median(v['durations'])) if v['durations'] else None,
                   'min_duration_s': min(v['durations']) if v['durations'] else None,
                   'modes': sorted(v['modes']), 'routes': len(v['routes']),
                   'route_names': sorted(v['route_names'])[:6]}
                  for k, v in pairs.items()],
    }
    with gzip.open(OUT + f'pairs-{mid}.json.gz', 'wt', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False)
    open(done, 'w').close()
    return f'ok stops {len(keep):,}/{len(stops):,} pairs {len(pairs):,}'


if __name__ == '__main__':
    t0 = time.time()
    tally = collections.Counter()
    for i, feed in enumerate(FEEDS, 1):
        r = harvest(feed)
        tally[r.split()[0]] += 1
        print(f'[{i}/{len(FEEDS)}] {feed["location.country_code"]:3} '
              f'{(feed["provider"] or "")[:44]:44} {r}', flush=True)
    print(f'DONE in {time.time()-t0:.0f}s  {dict(tally)}', flush=True)

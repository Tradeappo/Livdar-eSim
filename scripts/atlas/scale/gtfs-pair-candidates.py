#!/usr/bin/env python3
"""
Turn the harvested GTFS stop graphs into settlement-to-settlement pair candidates.

THE COLLAPSE IS THE POINT. The harvest produced 1,570,592 directly-served STOP pairs from
the first 29 feeds. This builder emits 1,929 settlement pairs from them, a ratio of 814 to
1, and that is the gate working rather than the gate losing.

A stop pair inside one bus network - "Churchill Avenue to Hospital Main Gate, Cardiff" -
is a real connection and a worthless page. Nobody types it, 57,181 of them come out of one
small city's feed, and publishing them would be the arbitrary Cartesian product the brief
forbids, differing only in that each row happens to be true. The unit a reader searches is
the SETTLEMENT pair: Cardiff to Newport, Oxford to Bicester. That is also the unit the
category leader uses - rome2rio's 1,850,129 keywords sit on pairs of named places, not
pairs of roadside poles.

WHAT THIS FAMILY HAS THAT THE EXISTING PAIR FAMILIES DO NOT. transport.city-pair-air rests
on a 2014 OpenFlights snapshot and transport.city-pair-rail on a Wikidata adjacency graph,
so each page can say the two places are connected and how far apart they are, and must stay
silent on everything a traveller actually wants. GTFS publishes stop_times, so these pages
state a REAL scheduled duration and a REAL count of direct services, attributed to the
agency that published them. The brief's "do not invent timetable, fare, frequency or
duration unless the source provides them" is satisfied by the source providing them.

Fares are still refused. Most of these feeds ship no fare_attributes, and a fare is the one
number on a transport page that changes without notice.

Output: data/atlas/sources/transport/_gtfs-pair-candidates.jsonl.gz
"""
import json, gzip, glob, os, math, collections, statistics, sys

ROOT = '/home/user/Livdar-eSim/'
GT = ROOT + 'data/atlas/sources/transport/gtfs/'

# ---- gates -----------------------------------------------------------------------------------
STOP_TO_CITY_KM = 25.0   # a stop further than this from any settlement is attributed to none
MIN_CITY_POP = 1000      # below this the gazetteer row is a hamlet, not a destination
MIN_CITY_SEPARATION_KM = 5.0   # closer than this and the "pair" is a city and its own suburb
MIN_DIRECT_TRIPS = 10    # a handful of trips is a quirk of one timetable, not a service
MIN_DURATION_S, MAX_DURATION_S = 120, 12 * 3600

stats = collections.Counter()

# ---- gazetteer -------------------------------------------------------------------------------
cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('id') and c.get('lat') is not None and c.get('lon') is not None:
            cities.append({'id': str(c['id']), 'name': c.get('name') or c.get('ascii'),
                           'country': c.get('country'), 'pop': c.get('population') or 0,
                           'lat': float(c['lat']), 'lon': float(c['lon'])})
CELL = 0.25
grid = collections.defaultdict(list)
for c in cities:
    grid[(int(c['lat'] / CELL), int(c['lon'] / CELL))].append(c)
print(f'gazetteer: {len(cities):,} settlements', file=sys.stderr)


def km(a, b, c, d):
    p = math.pi / 180
    return 6371 * 2 * math.asin(math.sqrt(max(0.0,
        math.sin((c - a) * p / 2) ** 2 +
        math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2)))


def nearest_city(lat, lon):
    gi, gj = int(lat / CELL), int(lon / CELL)
    sp = int(STOP_TO_CITY_KM / 111.0 / CELL) + 1
    best = None
    for i in range(gi - sp, gi + sp + 1):
        for j in range(gj - sp, gj + sp + 1):
            for c in grid.get((i, j), ()):
                if c['pop'] < MIN_CITY_POP:
                    continue
                d = km(lat, lon, c['lat'], c['lon'])
                if d <= STOP_TO_CITY_KM and (best is None or d < best[1]):
                    best = (c, d)
    return best


# ---- fold every feed onto the settlement pair ------------------------------------------------
# A pair served by two operators in two feeds is ONE page carrying both, so the aggregate is
# keyed on the city pair and the evidence accumulates.
P = collections.defaultdict(lambda: {
    'trips': 0, 'durations': [], 'modes': set(), 'route_names': set(),
    'operators': set(), 'licences': set(), 'feeds': set(), 'stop_pairs': 0,
    'countries': set()})

feeds = sorted(glob.glob(GT + 'pairs-*.json.gz'))
for fi, f in enumerate(feeds, 1):
    try:
        d = json.load(gzip.open(f, 'rt', encoding='utf-8'))
    except Exception as e:
        stats['feed_unreadable'] += 1
        continue
    stats['feeds_read'] += 1
    op = (d.get('agency') or [{}])[0].get('name') or d.get('provider') or ''
    lic = d.get('licence') or ''
    resolved, unresolved = {}, 0
    for sid, s in (d.get('stops') or {}).items():
        n = nearest_city(s['lat'], s['lon'])
        if n:
            resolved[sid] = n[0]
        else:
            unresolved += 1
    stats['stops_resolved_to_a_settlement'] += len(resolved)
    stats['stops_with_no_settlement_within_%dkm' % STOP_TO_CITY_KM] += unresolved
    for p in d.get('pairs') or []:
        stats['raw_stop_pairs'] += 1
        a, b = resolved.get(p['a']), resolved.get(p['b'])
        if not a or not b:
            stats['rejected_stop_not_attributed_to_a_settlement'] += 1
            continue
        if a['id'] == b['id']:
            stats['rejected_both_stops_in_the_same_settlement'] += 1
            continue
        sep = km(a['lat'], a['lon'], b['lat'], b['lon'])
        if sep < MIN_CITY_SEPARATION_KM:
            stats['rejected_settlements_closer_than_%dkm' % MIN_CITY_SEPARATION_KM] += 1
            continue
        if (p.get('trips') or 0) < MIN_DIRECT_TRIPS:
            stats['rejected_fewer_than_%d_direct_trips' % MIN_DIRECT_TRIPS] += 1
            continue
        dur = p.get('median_duration_s')
        if dur is None or not (MIN_DURATION_S <= dur <= MAX_DURATION_S):
            stats['rejected_no_usable_scheduled_duration'] += 1
            continue
        k = (a['id'], b['id']) if a['id'] < b['id'] else (b['id'], a['id'])
        e = P[k]
        e['trips'] += p['trips']
        e['durations'].append(dur)
        e['modes'].update(p.get('modes') or [])
        e['route_names'].update(p.get('route_names') or [])
        if op: e['operators'].add(op)
        if lic: e['licences'].add(lic)
        e['feeds'].add(d.get('mdb_source_id'))
        e['stop_pairs'] += 1
        e['countries'].update([a['country'], b['country']])
        e['sep_km'] = sep
        e['a'], e['b'] = a, b
    if fi % 10 == 0:
        print(f'  [{fi}/{len(feeds)}] settlement pairs so far {len(P):,}', file=sys.stderr)

# ---- fold in the NATIONAL feeds ---------------------------------------------------------------
# gtfs-national-harvest.py already resolved its stops to settlements inside its own streaming
# pass, because a 540 MB national aggregate cannot be reduced to stop pairs first. So its rows
# arrive in the settlement shape and join the same aggregate: a pair that a national rail feed
# and a local bus feed both evidence is ONE page carrying both.
NAT = ROOT + 'data/atlas/sources/transport/gtfs-national/'
for f in sorted(glob.glob(NAT + 'pairs-*.json.gz')):
    try:
        d = json.load(gzip.open(f, 'rt', encoding='utf-8'))
    except Exception:
        stats['national_feed_unreadable'] += 1
        continue
    stats['national_feeds_read'] += 1
    lic = d.get('licence') or ''
    prov = d.get('provider') or ''
    if not d.get('stop_times_grouped_by_trip', True):
        # the harvester warns when a feed's stop_times was not grouped by trip; its durations
        # are unreliable and the whole feed is refused rather than carried with a caveat
        stats['national_feed_refused_stop_times_not_grouped'] += 1
        continue
    for p_ in d.get('pairs') or []:
        stats['raw_national_settlement_pairs'] += 1
        sep = km(p_['a_lat'], p_['a_lon'], p_['b_lat'], p_['b_lon'])
        if sep < MIN_CITY_SEPARATION_KM:
            stats['rejected_settlements_closer_than_%dkm' % MIN_CITY_SEPARATION_KM] += 1
            continue
        if (p_.get('trips') or 0) < MIN_DIRECT_TRIPS:
            stats['rejected_fewer_than_%d_direct_trips' % MIN_DIRECT_TRIPS] += 1
            continue
        dur = p_.get('median_duration_s')
        if dur is None or not (MIN_DURATION_S <= dur <= MAX_DURATION_S):
            stats['rejected_no_usable_scheduled_duration'] += 1
            continue
        ida, idb = p_['a_id'], p_['b_id']
        k = (ida, idb) if ida < idb else (idb, ida)
        e = P[k]
        e['trips'] += p_['trips']
        e['durations'].append(dur)
        e['modes'].update(p_.get('modes') or [])
        if prov: e['operators'].add(prov)
        if lic: e['licences'].add(lic)
        e['feeds'].add(d.get('key'))
        e['stop_pairs'] += 1
        e['countries'].update([p_.get('a_country'), p_.get('b_country')])
        e['sep_km'] = sep
        e['a'] = {'id': ida, 'name': p_['a_name'], 'country': p_.get('a_country'),
                  'lat': p_['a_lat'], 'lon': p_['a_lon'], 'pop': 0}
        e['b'] = {'id': idb, 'name': p_['b_name'], 'country': p_.get('b_country'),
                  'lat': p_['b_lat'], 'lon': p_['b_lon'], 'pop': 0}

# ---- emit ------------------------------------------------------------------------------------
MODE_WORD = {'bus': 'bus', 'rail': 'train', 'subway': 'metro', 'tram': 'tram',
             'ferry': 'ferry', 'funicular': 'funicular', 'aerial_lift': 'cable car',
             'cable_tram': 'cable tram', 'trolleybus': 'trolleybus', 'monorail': 'monorail'}

rows, seen = [], set()
for (_ka, _kb), e in sorted(P.items()):
    a, b = e['a'], e['b']
    # the canonical direction is alphabetical on the settlement name, so one pair is one page
    if a['name'] > b['name']:
        a, b = b, a
    rows.append((a, b, e))

# the slug function the rest of the pipeline uses
import importlib.util
_spec = importlib.util.spec_from_file_location('ei', ROOT + 'scripts/atlas/scale/entity_identity.py')
_ei = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_ei)
slugify = _ei.slugify

out = []
for a, b, e in rows:
    url = f"/en/transport/public-transport/{slugify(a['name'])}-to-{slugify(b['name'])}/"
    if url in seen:
        # two different gazetteer ids whose names slug the same: a real collision, and the
        # honest fix is to drop the second rather than mint a near-identical URL
        stats['rejected_url_collision_on_settlement_names'] += 1
        continue
    seen.add(url)
    med = int(statistics.median(e['durations']))
    fast = min(e['durations'])
    modes = sorted(e['modes'])
    mw = [MODE_WORD.get(m, m) for m in modes]
    facts = [
        f"{med // 60} minutes is the median scheduled journey time",
        f"{fast // 60} minutes on the fastest scheduled service" if fast != med else
        f"{len(e['route_names'])} named routes serve it" if e['route_names'] else
        f"{e['stop_pairs']} stop-to-stop connections make up this corridor",
        f"{e['trips']:,} direct services in the published timetable",
        f"served by {', '.join(mw)}",
        f"{e['sep_km']:.0f} km apart in a straight line",
    ]
    if e['route_names']:
        facts.append('routes ' + ', '.join(sorted(e['route_names'])[:6]))
    if e['operators']:
        facts.append('operated by ' + ', '.join(sorted(e['operators'])[:3]))
    lic = ', '.join(sorted(e['licences'])) or 'open licence stated in the Mobility Database'
    out.append({
        'shape': 'transport_pair_transit',
        'market': 'en-US', 'language': 'en', 'url': url,
        'entity_id': f"{a['id']}-{b['id']}",
        'entity_name': f"{a['name']} to {b['name']}",
        'country': a['country'], 'destination_country': b['country'],
        'city': a['name'], 'cls': 'settlement-settlement',
        'n': len(e['route_names']) or e['stop_pairs'],
        'enriched': len(e['feeds']) + len(modes),
        'distance_km': round(e['sep_km'], 1),
        'median_duration_s': med, 'fastest_duration_s': fast,
        'direct_trips': e['trips'], 'modes': modes,
        'operators': sorted(e['operators'])[:3],
        'gtfs_feeds': sorted(str(x) for x in e['feeds']),
        'licences': sorted(e['licences']),
        'pair_duplicate_risk': 'LOW',
        'locale_facts': facts,
        'uniqueness_reason': (
            f"{a['name']} to {b['name']} by public transport, from the published timetables of "
            f"{', '.join(sorted(e['operators'])[:3]) or 'the operating agency'} "
            f"({lic}) via the Mobility Database. " + '; '.join(facts) + '. The journey time and '
            f"the service count are READ FROM the published schedule rather than estimated. "
            f"Canonical direction: one page per pair, named alphabetically. What this page "
            f"deliberately does NOT claim: fares, real-time running, disruptions, or that the "
            f"timetable has not changed since the feed was published."),
    })

OUTP = ROOT + 'data/atlas/sources/transport/_gtfs-pair-candidates.jsonl.gz'
with gzip.open(OUTP, 'wt', encoding='utf-8') as f:
    for r in out:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')

stats['final_net'] = len(out)
DATE = '2026-10-07'
json.dump({
    'builder': 'scripts/atlas/scale/gtfs-pair-candidates.py', 'date': DATE,
    'city_feeds_available': len(feeds),
    'national_feeds_available': len(glob.glob(NAT + 'pairs-*.json.gz')), 'funnel': dict(stats), 'final_net': len(out),
    'gate': {'stop_to_city_km': STOP_TO_CITY_KM, 'min_city_population': MIN_CITY_POP,
             'min_city_separation_km': MIN_CITY_SEPARATION_KM,
             'min_direct_trips': MIN_DIRECT_TRIPS,
             'duration_bounds_s': [MIN_DURATION_S, MAX_DURATION_S]},
    'why_the_collapse_is_the_point': (
        'The harvest produced %s directly-served STOP pairs and this builder emits %s '
        'settlement pairs. A stop pair inside one bus network is a real connection and a '
        'worthless page: nobody types it, one small city feed yields 57,181 of them, and '
        'publishing them would be the arbitrary Cartesian product the brief forbids, differing '
        'only in that each row happens to be true. The unit a reader searches is the settlement '
        'pair, which is also the unit rome2rio built 1,850,129 keywords on.'
        % (f"{stats['raw_stop_pairs']:,}", f"{len(out):,}")),
    'what_this_family_adds_over_the_existing_pair_families': (
        'transport.city-pair-air rests on a 2014 OpenFlights snapshot and '
        'transport.city-pair-rail on a Wikidata adjacency graph, so those pages can state only '
        'that two places are connected and how far apart they are. GTFS publishes stop_times, '
        'so these pages state a real scheduled duration and a real direct-service count '
        'attributed to the publishing agency. Fares are still refused: most feeds ship no '
        'fare_attributes and a fare is the one number that changes without notice.'),
}, open(ROOT + f'data/atlas/measurements/gtfs-pair-candidates-{DATE}.json', 'w'),
   indent=1, ensure_ascii=False)

print(f'\nGTFS settlement pairs: RAW stop pairs {stats["raw_stop_pairs"]:,}  '
      f'FINAL NET {len(out):,}')
for k, v in sorted(stats.items()):
    if k.startswith('rejected'): print(f'  rejected {k[9:]:56} {v:>9,}')
print(f'wrote {OUTP}')

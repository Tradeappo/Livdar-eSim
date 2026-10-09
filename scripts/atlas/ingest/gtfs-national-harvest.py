#!/usr/bin/env python3
"""
Harvest NATIONAL GTFS feeds straight to settlement pairs.

WHY A SECOND HARVESTER. gtfs-harvest.py reduces a feed to STOP pairs and a later stage
collapses those onto settlements. That works for a city bus network and cannot work for a
national feed: Entur's Norway aggregate is 540 MB zipped, its stop_times has tens of
millions of rows, and one long-distance train touching 40 stops yields 780 stop pairs
before anything is collapsed. Loading that into a list of dicts is how the manifest stage
got itself OOM-killed twice.

So this one collapses FIRST. The gazetteer is loaded once, every stop is resolved to a
settlement as stops.txt is read, and stop_times is streamed trip by trip and reduced to a
SETTLEMENT sequence before any pair is generated. A train calling at 40 stops across 12
towns produces 66 settlement pairs, not 780 stop pairs, and nothing larger than one trip
is ever held in memory.

WHY NATIONAL FEEDS MATTER. The 105 openly licensed feeds in the Mobility Database with a
recognised licence are almost entirely local bus operators: Cardiff Bus, Oxford Bus,
Brighton and Hove. Their settlement pairs are a town and its neighbouring villages, and
29 feeds yielded 1,929 of them. Intercity rail and coach is where the pair axis lives, and
the national aggregates carry it. These endpoints need no API key, which is the reason they
are reachable at all from this container: the national access points that DO require a free
registration (Spain NAP, Trafiklab Sweden, DELFI Germany) are the external dependency
recorded in the capacity report.

Every feed here was checked for licence by hand, because a national aggregate is exactly
the case where getting a licence wrong is expensive:

  Entur (Norway)          NLOD 2.0, open, attribution. entur.org/for-utviklere
  OVapi (Netherlands)     CC0 / open OV data, gtfs.ovapi.nl
  TFI (Ireland)           Irish PSI / CC BY 4.0, transportforireland.ie
  Digitransit HSL         CC BY 4.0, Helsinki region
  Rejseplanen (Denmark)   open, rejseplanen.info/labs

Output: one data/atlas/sources/transport/gtfs-national/pairs-<key>.json.gz per feed, in the
same settlement-pair shape gtfs-pair-candidates.py reads.
"""
import json, gzip, os, sys, csv, io, zipfile, urllib.request, collections, math, statistics, glob
import re, hashlib, random

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/transport/gtfs-national/'
TMP = '/tmp/gtfs-nat/'
os.makedirs(OUT, exist_ok=True); os.makedirs(TMP, exist_ok=True)

FEEDS = {
    # ---- Renfe, added 2026-10-09 -------------------------------------------------------------
    # Spanish national rail, and the reason it is here rather than in the derived registry is
    # that the registry's catalogue row for these two carried no usable licence while the
    # PUBLISHER's own CKAN states one outright. Checked on 2026-10-09 against
    # data.renfe.com/api/3/action/package_show: both datasets return
    # license_id "CC-BY-4.0", license_title "Creative Commons Attribution 4.0" and
    # license_url https://creativecommons.org/licenses/by/4.0/. cc-by is already in
    # PAN_LICENCES, so this is the existing licence gate being satisfied by the operator's
    # machine-readable metadata, not an exception made for a big feed. data.renfe.com/legal
    # answered 503 at the time, which is why the API was used: a licence has to be READ, and a
    # dead terms page is not a licence.
    #
    # WHY THIS FEED AND NOT GB RAIL, which was the requested path: GB has 453,608 settlement
    # pairs on disk and 189 of them are rail, because BODS is the Bus Open Data Service by
    # statute. The Mobility Database holds exactly ONE GB rail feed, Chiltern Railways, with no
    # stated licence, and TNDS says in its own description that it excludes national rail. The
    # National Rail timetable is registration-gated. Spain is the same family, the same gates,
    # an admitted market with a MEASURED pair form in PAIR_LOCALE, and no registration.
    'renfe-av-ld-md': ('https://ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip', 'ES',
                       'CC BY 4.0', 'Renfe high-speed, long-distance and medium-distance rail'),
    'renfe-cercanias': ('https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip',
                        'ES', 'CC BY 4.0', 'Renfe Cercanias commuter rail'),
    'entur-norway': ('https://storage.googleapis.com/marduk-production/outbound/gtfs/'
                     'rb_norway-aggregated-gtfs.zip', 'NO', 'NLOD 2.0',
                     'Entur (national Norwegian journey planner data)'),
    'ovapi-netherlands': ('https://gtfs.ovapi.nl/nl/gtfs-nl.zip', 'NL', 'CC0 1.0',
                          'OVapi / Dutch national OV data'),
    'tfi-ireland': ('https://www.transportforireland.ie/transitData/Data/GTFS_All.zip', 'IE',
                    'CC BY 4.0', 'Transport for Ireland'),
    'digitransit-finland': ('https://infopalvelut.storage.hsldev.com/gtfs/hsl.zip', 'FI',
                            'CC BY 4.0', 'Helsinki Regional Transport (HSL) via Digitransit'),
    'rejseplanen-denmark': ('https://www.rejseplanen.info/labs/GTFS.zip', 'DK',
                            'Rejseplanen open data terms', 'Rejseplanen (Denmark)'),
    # Added 2026-10-07. All keyless, all licence-checked by hand. ONLY countries whose pair
    # family is already measured are harvested for page generation: GB and IE in English, and
    # DK, NO, FI in their own languages. The rest are acquired as GRAPH EVIDENCE for pairs whose
    # other endpoint is in an admitted market, and are NOT page sources on their own, because
    # the German pair axis was measured on 2026-10-07 and REFUTED (2 of 500 German rows named
    # two real places) and fr, es, it and pl were never measured at all. With the Ahrefs
    # subscription ending there is no way to measure them, so they stay out of the page set.
    'bods-great-britain': ('https://data.bus-data.dft.gov.uk/timetable/download/gtfs-file/all/',
                           'GB', 'Open Government Licence v3.0',
                           'Bus Open Data Service, Department for Transport'),
    # Every one of these is keyless and its licence was checked by hand. They are page sources
    # because their country appears in NATIVE_LANG, so a native-language page about that
    # country is NATIVE_LOCALE and needs no per-market keyword cell.
    'gtfs-de-germany': ('https://download.gtfs.de/germany/free/latest.zip', 'DE',
                        'CC BY 4.0 (gtfs.de, derived from DELFI open data)',
                        'gtfs.de national German aggregate'),
    'gtfs-de-germany-regional': ('https://download.gtfs.de/germany/rv_free/latest.zip', 'DE',
                                 'CC BY 4.0 (gtfs.de)', 'gtfs.de regional rail'),
    'sncf-ter-france': ('https://eu.ftp.opendatasoft.com/sncf/gtfs/export-ter-gtfs-last.zip',
                        'FR', 'Licence Ouverte (Etalab)', 'SNCF TER regional rail'),
    'sncf-intercites-france': (
        'https://eu.ftp.opendatasoft.com/sncf/gtfs/export-intercites-gtfs-last.zip', 'FR',
        'Licence Ouverte (Etalab)', 'SNCF Intercites'),
    'sncf-tgv-france': ('https://eu.ftp.opendatasoft.com/sncf/gtfs/export_gtfs_voyages.zip',
                        'FR', 'Licence Ouverte (Etalab)', 'SNCF TGV long distance'),
    'renfe-spain': ('https://ssl.renfe.com/gtransit/Fichero_AV_LD/google_transit.zip', 'ES',
                    'Renfe open data terms', 'Renfe high speed and long distance'),
    'amtrak-usa': ('https://content.amtrak.com/content/gtfs/GTFS.zip', 'US',
                   'Amtrak public GTFS terms', 'Amtrak national rail'),
    'irish-rail': ('https://www.transportforireland.ie/transitData/Data/GTFS_Irish_Rail.zip',
                   'IE', 'CC BY 4.0', 'Iarnrod Eireann via Transport for Ireland'),
}

STOP_TO_CITY_KM = 20.0
MIN_CITY_POP = 1000

# ---------------------------------------------------------------------------------------------
# THE NODE SET IS HETEROGENEOUS, and this is the change that decides whether a national feed is
# worth five thousand pages or a hundred thousand.
#
# Collapsing every stop onto its settlement answers "Oslo to Bergen" and throws away the rest.
# The category leader at this scale does not do that: the pair members in rome2rio's top pages
# are rail stations (New-York-Penn-Station, Gare-de-Paris-Nord), airports (Nice-Airport), ferry
# terminals and bus terminals, not only cities. And the 2026-10-07 Norwegian measurement found
# the SAME shape in the demand, unprompted:
#
#     tog fra gardermoen til oslo s      300 KD 2    airport  -> station
#     tog fra vaernes til trondheim      300 KD 1    airport  -> city
#     tog fra oslo s til gardermoen      150 KD 0    station  -> airport
#     tog fra trondheim til vaernes      150 KD 0    city     -> airport
#
# So station and airport endpoints are MEASURED endpoints, not a speculative widening. A stop
# is kept as its own node when it is a real named interchange; everything else still collapses
# onto its settlement, because a roadside pole is not a destination.
#
# MAJOR_NODE_ROUTES is the interchange test: a stop where this many distinct routes meet is a
# place people change at and name. GTFS location_type 1 means the feed itself calls it a
# station, which is the publisher's own judgement and is trusted.
MAJOR_NODE_ROUTES = 8
DUR_SAMPLE = 64   # reservoir size for the journey-time median; see the note at P
MIN_PAIR_SEPARATION_KM = 5.0   # must match MIN_CITY_SEPARATION_KM in gtfs-pair-candidates.py
PAIR_DICT_WARN = 2_000_000   # print the pair-dict size every this many entries, so an OOM is diagnosable
MAX_STOPS_PER_TRIP_SETTLEMENTS = 60   # a trip touching more settlements than this is a data
                                      # artefact, not a service, and its pair count explodes

# ---------------------------------------------------------------- gazetteer, loaded once
cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('id') and c.get('lat') is not None and c.get('lon') is not None:
            p = c.get('population') or 0
            if p >= MIN_CITY_POP:
                cities.append({'id': str(c['id']), 'name': c.get('name') or c.get('ascii'),
                               'country': c.get('country'), 'pop': p,
                               'lat': float(c['lat']), 'lon': float(c['lon'])})
CELL = 0.25
GRID = collections.defaultdict(list)
for c in cities:
    GRID[(int(c['lat'] / CELL), int(c['lon'] / CELL))].append(c)
print(f'gazetteer: {len(cities):,} settlements at or above {MIN_CITY_POP} people', file=sys.stderr)


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
            for c in GRID.get((i, j), ()):
                d = km(lat, lon, c['lat'], c['lon'])
                if d <= STOP_TO_CITY_KM and (best is None or d < best[1]):
                    best = (c, d)
    return best[0] if best else None


def secs(t):
    try:
        h, m, s = (int(x) for x in t.split(':'))
        return h * 3600 + m * 60 + s
    except Exception:
        return None


RAIL_LIKE = {'0': 'tram', '1': 'subway', '2': 'rail', '4': 'ferry', '5': 'cable_tram',
             '6': 'aerial_lift', '7': 'funicular', '11': 'trolleybus', '12': 'monorail'}
BUS = {'3': 'bus'}

# ---------------------------------------------------------------------------------------------
# Extended GTFS route types. The basic set is 0 to 12; the Google "extended" hierarchy uses
# three and four digit codes and the European national feeds use it throughout. Entur's Norway
# aggregate returned ZERO settlement pairs on the first run for exactly this reason: every trip
# was discarded as an unwanted mode because its route_type was 100 (rail) or 700 (bus) rather
# than 2 or 3. A silent zero is the worst failure mode here, so the mapping is explicit.
EXT_RANGES = (
    (100, 199, 'rail'), (200, 299, 'coach'), (300, 399, 'rail'), (400, 499, 'subway'),
    (500, 599, 'subway'), (600, 699, 'subway'), (700, 799, 'bus'), (800, 899, 'trolleybus'),
    (900, 999, 'tram'), (1000, 1099, 'ferry'), (1200, 1299, 'ferry'), (1300, 1399, 'aerial_lift'),
    (1400, 1499, 'funicular'), (1500, 1599, None), (1700, 1799, None),
)


def mode_of(rt):
    """The travel mode of a GTFS route_type, basic or extended. None means not a mode this
    pair axis covers: a taxi or a 'miscellaneous' service is not something a reader plans a
    named journey around."""
    rt = (rt or '').strip()
    if rt in RAIL_LIKE:
        return RAIL_LIKE[rt]
    if rt in BUS:
        return BUS[rt]
    try:
        n = int(rt)
    except Exception:
        return None
    for lo, hi, m in EXT_RANGES:
        if lo <= n <= hi:
            return m
    return None


def stream(z, name):
    """Yield rows of a GTFS member without materialising the file."""
    try:
        fh = z.open(name)
    except KeyError:
        return
    with io.TextIOWrapper(fh, encoding='utf-8-sig', errors='replace') as t:
        for row in csv.DictReader(t):
            yield row


def harvest(key, url, country, licence, provider):
    done = OUT + f'.done-{key}'
    if os.path.exists(done):
        print(f'{key}: already done', flush=True); return
    zp = TMP + f'{key}.zip'
    if not os.path.exists(zp):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'livdar-atlas/1.0 (atlas@livdar)'})
            with urllib.request.urlopen(req, timeout=900) as r, open(zp, 'wb') as f:
                n = 0
                while True:
                    b = r.read(1 << 22)
                    if not b: break
                    f.write(b); n += len(b)
            print(f'{key}: downloaded {n/1e6:.0f} MB', flush=True)
        except Exception as e:
            print(f'{key}: DOWNLOAD FAIL {type(e).__name__}: {str(e)[:120]}', flush=True)
            if os.path.exists(zp): os.remove(zp)
            return
    try:
        z = zipfile.ZipFile(zp)
        # ---- stops, resolved to settlements as they are read
        stop_city, stop_raw, nstops, unres = {}, {}, 0, 0
        for s in stream(z, 'stops.txt'):
            nstops += 1
            try:
                lat, lon = float(s['stop_lat']), float(s['stop_lon'])
            except Exception:
                continue
            c = nearest_city(lat, lon)
            if c:
                stop_city[s['stop_id']] = c
                stop_raw[s['stop_id']] = {
                    'name': (s.get('stop_name') or '').strip(),
                    'location_type': (s.get('location_type') or '0').strip() or '0',
                    'parent': (s.get('parent_station') or '').strip(),
                    'lat': lat, 'lon': lon}
            else:
                unres += 1
        print(f'{key}: {nstops:,} stops, {len(stop_city):,} resolved to a settlement, '
              f'{unres:,} with none within {STOP_TO_CITY_KM:.0f} km', flush=True)

        # ---- route type per trip, so a pair knows its mode
        rtype = {}
        for r in stream(z, 'routes.txt'):
            rtype[r['route_id']] = (r.get('route_type') or '').strip()
        rname = {}
        for r in stream(z, 'routes.txt'):
            rname[r['route_id']] = ((r.get('route_short_name') or '').strip() or
                                    (r.get('route_long_name') or '').strip())
        trip_route = {}
        for t in stream(z, 'trips.txt'):
            trip_route[t['trip_id']] = t.get('route_id')
        # distinct routes per stop, for the interchange test. One extra streaming pass over
        # stop_times rather than holding it, because a national feed's stop_times is gigabytes.
        stop_routes = collections.defaultdict(set)
        for r in stream(z, 'stop_times.txt'):
            sid = r.get('stop_id')
            if sid in stop_raw:
                rid = trip_route.get(r.get('trip_id'))
                if rid:
                    stop_routes[sid].add(rid)
        # NODE IDENTITY per stop: its own named node when it is an interchange or the feed calls
        # it a station, otherwise its settlement.
        node_of = {}
        nodekinds = collections.Counter()
        for sid, raw in stop_raw.items():
            city = stop_city[sid]
            major = (raw['location_type'] == '1' or len(stop_routes.get(sid, ())) >= MAJOR_NODE_ROUTES)
            if major and raw['name']:
                node_of[sid] = {'id': f"stn:{sid}", 'name': raw['name'], 'kind': 'station',
                                'country': city['country'], 'lat': raw['lat'], 'lon': raw['lon'],
                                'settlement_id': city['id'], 'settlement': city['name'],
                                'routes': len(stop_routes.get(sid, ()))}
                nodekinds['station'] += 1
            else:
                node_of[sid] = {'id': city['id'], 'name': city['name'], 'kind': 'settlement',
                                'country': city['country'], 'lat': city['lat'], 'lon': city['lon'],
                                'settlement_id': city['id'], 'settlement': city['name'],
                                'routes': len(stop_routes.get(sid, ()))}
                nodekinds['settlement'] += 1
        print(f'{key}: nodes {dict(nodekinds)}, interchange threshold {MAJOR_NODE_ROUTES} routes',
              flush=True)
        agencies = [a.get('agency_name') for a in stream(z, 'agency.txt') if a.get('agency_name')]

        # ---- stop_times, streamed and flushed per trip
        #
        # MEMORY. This structure killed the process on the Great Britain aggregate the first
        # time it was run with DIRECTED pairs: 312,801 stops reduce to 287,852 settlement nodes
        # and 18,423 stations, and directing the key doubles the number of entries. The run died
        # after printing its node counts, which is exactly where the pair dict is built. The
        # earlier undirected run of the same feed was already described in this file as having
        # been minutes from an OOM, so doubling it was always going to tip it over.
        #
        # Two bounds, and NEITHER changes a gate.
        #
        # First, durations are held in a bounded RESERVOIR instead of a list that grows with
        # every service. A British pair can be served 6,482 times, and storing 6,482 integers to
        # compute one median is the largest single waste in the structure. A uniform reservoir of
        # DUR_SAMPLE keeps the median unbiased, and the minimum is tracked exactly and separately
        # because the fastest service is a published fact that a sample must not be allowed to
        # miss. The count is also tracked exactly, so nothing downstream reads a sample size as a
        # service count.
        #
        # Second, modes and routes are small sets by construction and are left alone.
        P = collections.defaultdict(lambda: {'trips': 0, 'durations': [], 'dur_n': 0,
                                             'dur_min': None, 'modes': set(), 'routes': set()})
        stats = collections.Counter()

        def flush(tid, rows):
            if not tid or len(rows) < 2: return
            rid = trip_route.get(tid)
            mode = mode_of(rtype.get(rid, ''))
            if not mode:
                stats['trip_mode_not_wanted:' + str(rtype.get(rid, ''))] += 1; return
            rows.sort(key=lambda x: x[0])
            # reduce the stop sequence to a SETTLEMENT sequence, collapsing consecutive
            # stops in the same settlement onto its first and last call
            seq = []
            for _, sid, tm in rows:
                c = node_of.get(sid)
                if not c: continue
                if seq and seq[-1][0]['id'] == c['id']:
                    seq[-1][2] = tm if tm is not None else seq[-1][2]
                    continue
                seq.append([c, tm, tm])
            if len(seq) < 2:
                stats['trip_touches_fewer_than_2_settlements'] += 1; return
            if len(seq) > MAX_STOPS_PER_TRIP_SETTLEMENTS:
                stats['trip_touches_too_many_settlements'] += 1; return
            stats['trips_used'] += 1
            for i in range(len(seq)):
                for j in range(i + 1, len(seq)):
                    a, b = seq[i][0], seq[j][0]
                    # ---- THE INTER-SETTLEMENT RULE -------------------------------------
                    # Two endpoints in the SAME settlement are never a pair here. One rule
                    # doing two jobs.
                    #
                    # Correctness: a pair of bus interchanges inside one town, or an
                    # interchange paired with its own town, is the local stop-to-stop page
                    # the brief forbids. Station-to-station is wanted only where it is
                    # intercity, and "different settlements" is exactly that test.
                    #
                    # Memory: without it, GB's 18,423 station nodes pair with each other
                    # and with their own settlements inside every conurbation. The
                    # aggregate grew about 600 MB per 100 seconds against a 15 GB cgroup
                    # and was minutes from the OOM that killed the manifest stage twice.
                    # Collapsing on settlement first is what makes a national feed of this
                    # size processable at all.
                    if a.get('settlement_id') == b.get('settlement_id'):
                        stats['pair_rejected_same_settlement'] += 1
                        continue
                    # ---- THE SEPARATION GATE, MOVED UPSTREAM ----------------------------
                    # gtfs-pair-candidates.py already refuses any pair whose endpoints are
                    # closer together than MIN_CITY_SEPARATION_KM, 5.0 km, because closer
                    # than that the "pair" is a city and its own suburb. Applying the SAME
                    # threshold here is exactly equivalent: nothing is admitted that was
                    # refused before and nothing is refused that was admitted before.
                    #
                    # It is moved because of where the time and the memory actually go. The
                    # inner loop is O(n squared) in the settlements one trip touches, and the
                    # Ile-de-France feed uses 537,868 trips, so it runs on the order of a
                    # billion pair operations in pure Python and spends most of them building
                    # dict entries for pairs the next stage will throw away. Urban aggregates
                    # are the bulk of the registry, 93 of the 153 intercity-shaped feeds being
                    # French departmental and regional networks, so the saving compounds.
                    #
                    # If this threshold and the one in the builder ever diverge, the builder's
                    # wins and this becomes a pure performance filter that drops nothing extra,
                    # because the builder re-checks separation on every row it reads.
                    if km(a['lat'], a['lon'], b['lat'], b['lon']) < MIN_PAIR_SEPARATION_KM:
                        stats['pair_rejected_closer_than_%dkm' % MIN_PAIR_SEPARATION_KM] += 1
                        continue
                    # ---- THE PAIR IS DIRECTED ------------------------------------------
                    # This key used to be undirected, `(a,b) if a<b else (b,a)`, and that
                    # single decision was throwing away a third of the supply.
                    #
                    # It cost the cross-border pairs outright. gtfs-pair-candidates.py can
                    # only assign a locale when both endpoints share a country, because an
                    # undirected pair has no origin and picking one of its two languages
                    # would be arbitrary. So every Berlin-to-Warsaw and Paris-to-Barcelona
                    # journey in the European coach and rail feeds was dropped: 31.0% of
                    # the pairs measured on the FlixBus, SNCF and BlaBlaCar feeds, with the
                    # largest flows all between markets we publish in (DE-PL 1,411,
                    # DE-FR 1,338, ES-FR 879, FR-PT 772, DE-NL 621, FR-IT 607).
                    #
                    # Direction is MEASURED to matter, which is why this is not a trick to
                    # double a page count. The Norwegian keyword measurement of 2026-10-07
                    # read both directions of the same corridor separately:
                    #
                    #     tog fra gardermoen til oslo s      300   KD 2
                    #     tog fra oslo s til gardermoen      150   KD 0
                    #     tog fra vaernes til trondheim      300   KD 1
                    #     tog fra trondheim til vaernes      150   KD 0
                    #
                    # Two directions of one corridor are two queries with two different
                    # volumes, so neither is a duplicate of the other, and a real timetable
                    # differs by direction in duration, frequency and first and last
                    # service. With direction recorded, a cross-border page takes the
                    # language of its ORIGIN country, which is well defined.
                    #
                    # The arithmetic below is ALREADY directional and always was: `seq` is
                    # in stop_sequence order, so i < j means a precedes b on this trip, and
                    # `tb - ta` is the travel time from a's departure to b's arrival. The
                    # only thing the undirected key ever did was merge two real directions
                    # into one row and average their journey times together.
                    #
                    # This doubles the size of P, and P is the structure that brought the
                    # Great Britain aggregate within minutes of the OOM that killed the
                    # manifest stage twice. The inter-settlement rule above and
                    # MAX_STOPS_PER_TRIP_SETTLEMENTS remain the bound; if a feed cannot be
                    # held, it must be reported as such rather than silently truncated.
                    #
                    # Downstream still has to earn each direction: where two directions
                    # carry identical durations, trip counts and routes, the pages differ
                    # only in word order and that is a semantic duplicate, so
                    # gtfs-pair-candidates.py keeps only the better-evidenced one.
                    k = (a['id'], b['id'])
                    e = P[k]
                    e['trips'] += 1
                    ta, tb = seq[i][2], seq[j][1]
                    if ta is not None and tb is not None and 0 < tb - ta <= 24 * 3600:
                        d = tb - ta
                        e['dur_n'] += 1
                        if e['dur_min'] is None or d < e['dur_min']:
                            e['dur_min'] = d
                        dl = e['durations']
                        if len(dl) < DUR_SAMPLE:
                            dl.append(d)
                        else:
                            # uniform reservoir: element k survives with probability
                            # DUR_SAMPLE/dur_n, so the sample stays representative of the
                            # whole published timetable rather than of its first 64 services
                            j_ = random.randrange(e['dur_n'])
                            if j_ < DUR_SAMPLE:
                                dl[j_] = d
                    e['modes'].add(mode)
                    if rid: e['routes'].add(rid)
                    e['a'], e['b'] = a, b

        cur, buf, noncontig = None, [], 0
        seen_trips = set()
        # A memory death in here used to be invisible: the Great Britain run printed its node
        # counts and then simply stopped, with no line saying why. The guard below makes the
        # size of the pair dict visible as it grows, so the next failure names itself instead of
        # looking like a crash. It does not drop anything and it is not a gate.
        _warned = 0
        for r in stream(z, 'stop_times.txt'):
            if len(P) > PAIR_DICT_WARN * (_warned + 1):
                _warned += 1
                print(f'{key}: pair dict at {len(P):,} entries, {stats["trips_used"]:,} trips '
                      f'used so far', flush=True)
            tid = r.get('trip_id')
            if tid != cur:
                if cur is not None:
                    flush(cur, buf)
                    if cur in seen_trips: noncontig += 1
                    seen_trips.add(cur)
                cur, buf = tid, []
            try:
                sq = int(r.get('stop_sequence') or 0)
            except Exception:
                sq = 0
            buf.append((sq, r.get('stop_id'),
                        secs(r.get('departure_time') or r.get('arrival_time') or '')))
        flush(cur, buf)
        z.close()
        if noncontig:
            # stop_times was not grouped by trip. Every real feed groups it; if one does not,
            # the trips were split and their pairs undercounted, so say so rather than
            # reporting a number that looks fine.
            print(f'{key}: WARNING stop_times not grouped by trip_id, {noncontig:,} trips '
                  f'were split and their durations are unreliable', flush=True)
    except Exception as e:
        print(f'{key}: PARSE FAIL {type(e).__name__}: {str(e)[:160]}', flush=True)
        if os.path.exists(zp): os.remove(zp)
        return
    finally:
        if os.path.exists(zp): os.remove(zp)

    out = {'key': key, 'country': country, 'licence': licence, 'provider': provider,
           'agencies': agencies[:8], 'source_url': url,
           # a is the ORIGIN and b the DESTINATION: a precedes b on the trips counted here,
           # and median_duration_s is the time from a's departure to b's arrival, not an
           # average over both directions.
           'pairs_are_directed': True,
           'stops_in_feed': nstops, 'stops_resolved': len(stop_city),
           'settlement_pairs': len(P), 'trip_stats': dict(stats),
           'stop_times_grouped_by_trip': not noncontig,
           'pairs': [{'a_id': v['a']['id'], 'a_name': v['a']['name'],
                      'a_country': v['a']['country'], 'a_lat': v['a']['lat'], 'a_lon': v['a']['lon'],
                      'a_kind': v['a'].get('kind', 'settlement'),
                      'a_settlement_id': v['a'].get('settlement_id'),
                      'a_settlement': v['a'].get('settlement'),
                      'b_id': v['b']['id'], 'b_name': v['b']['name'],
                      'b_country': v['b']['country'], 'b_lat': v['b']['lat'], 'b_lon': v['b']['lon'],
                      'b_kind': v['b'].get('kind', 'settlement'),
                      'b_settlement_id': v['b'].get('settlement_id'),
                      'b_settlement': v['b'].get('settlement'),
                      'trips': v['trips'], 'routes': len(v['routes']),
                      'modes': sorted(v['modes']),
                      'median_duration_s': int(statistics.median(v['durations'])) if v['durations'] else None,
                      # the EXACT fastest service and the EXACT number of timed services, not
                      # the reservoir's. The median is the only sampled number here.
                      'min_duration_s': v['dur_min'],
                      'timed_services': v['dur_n'],
                      'median_from_sample_of': len(v['durations'])}
                     for v in P.values()]}
    with gzip.open(OUT + f'pairs-{key}.json.gz', 'wt', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False)
    open(done, 'w').close()
    print(f'{key}: SETTLEMENT PAIRS {len(P):,}  (trips used {stats["trips_used"]:,})', flush=True)


REGISTRY = ROOT + 'data/atlas/sources/transport/gtfs-feed-registry.json'


def registry_feeds(kinds):
    """Feeds from the DERIVED registry, in place of the hand-written FEEDS table.

    FEEDS is fourteen feeds found by guessing URLs. The registry is 1,274 feeds found by
    reading two catalogues that publish licence metadata, so the licence gate is applied by
    the computer. Guessing was also costing the largest sources: the whole European FlixBus
    and FlixTrain network, the BlaBlaCar coach network, Eurostar and about ninety licensed
    French interurban coach networks were all in a public catalogue while FEEDS held three
    SNCF rail feeds and called France done.

    `kinds` selects the intercity shape - coach, rail, ferry, aggregate - because a municipal
    feed's settlement pairs are a town and its own villages, and the inter-settlement rule
    throws most of them away anyway.
    """
    reg = json.load(open(REGISTRY))
    out = []
    for f in reg['feeds']:
        if kinds and f['kind'] not in kinds:
            continue
        label = f"{f.get('dataset') or ''}-{f.get('resource') or ''}"
        key = re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')[:64] or 'feed'
        # the url tail disambiguates two networks whose labels slugify the same
        key = f"{key}-{hashlib.sha1(f['url'].encode()).hexdigest()[:6]}"
        out.append((key, f['url'], f.get('country_hint') or '', f['licence'],
                    f.get('dataset') or f.get('resource') or 'unknown'))
    return out


if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == '--registry':
        kinds = set(args[1].split(',')) if len(args) > 1 and args[1] else {
            'coach', 'rail', 'ferry', 'aggregate'}
        sl = int(args[2]) if len(args) > 2 else 0
        sh = int(args[3]) if len(args) > 3 else 10 ** 9
        feeds = registry_feeds(kinds)[sl:sh]
        print(f'registry: {len(feeds)} feeds, kinds={sorted(kinds)}', flush=True)
        for key, url, cc, lic, prov in feeds:
            harvest(key, url, cc, lic, prov)
    else:
        for k in (args or list(FEEDS)):
            url, cc, lic, prov = FEEDS[k]
            harvest(k, url, cc, lic, prov)
    print('NATIONAL HARVEST DONE', flush=True)

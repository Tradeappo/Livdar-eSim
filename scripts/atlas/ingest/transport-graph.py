#!/usr/bin/env python3
"""Build a normalised transport graph: nodes, edges, and the connected pairs it supports.

Section 4 of the brief. Nodes carry a stable id, a type, a name, a country, a city parent
and coordinates. Edges carry an origin, a destination, a mode, the source that evidences
them, a distance and, where the source supports it, an operator count. Nothing is joined
on name alone: an airport reaches a city through its OurAirports municipality AND a
proximity check, and a route reaches an airport through its IATA code.

What this does NOT do, because the brief forbids it and the sources do not support it:
no live schedules, no fares, no real-time availability, no current delays. The air edge
table is corridor evidence, not a timetable, and it is dated so a reader is never told a
flight exists today on the strength of a 2014 row.

Writes data/atlas/sources/transport/graph-{nodes,edges}.jsonl.gz and a measurement file.
Generates no pages.
"""
import collections, csv, gzip, json, math, os, re, sys, unicodedata

ROOT = '/home/user/Livdar-eSim/'
T = ROOT + 'data/atlas/sources/transport/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity as ei                                        # noqa: E402

AIR_SOURCE_DATE = 'OpenFlights routes.dat, last broad refresh 2014; corridor evidence only'


def norm(s):
    s = unicodedata.normalize('NFKD', (s or '').lower())
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def km(a_lat, a_lon, b_lat, b_lon):
    p = math.pi / 180.0
    h = (0.5 - math.cos((b_lat - a_lat) * p) / 2
         + math.cos(a_lat * p) * math.cos(b_lat * p) * (1 - math.cos((b_lon - a_lon) * p)) / 2)
    return round(12742 * math.asin(math.sqrt(max(0.0, min(1.0, h)))), 1)


def main():
    gaz = ei.load_gazetteer()
    cities = list(gaz.by_id.values())
    print(f'cities in the gazetteer: {len(cities):,}', file=sys.stderr)

    # A coarse spatial index so an airport finds its city without a full scan.
    grid = collections.defaultdict(list)
    byname = collections.defaultdict(list)
    for c in cities:
        if c.get('lat') is None:
            continue
        grid[(c['country'], int(c['lat']), int(c['lon']))].append(c)
        byname[(c['country'], norm(c['name']))].append(c)

    # ---- airports -----------------------------------------------------------------------
    air = list(csv.DictReader(open(T + 'ourairports-airports.csv', encoding='utf-8')))
    sched = [r for r in air if r['scheduled_service'] == 'yes' and r['iata_code']]
    nodes, by_iata = {}, {}
    matched_name = matched_near = unmatched = 0
    for r in sched:
        try:
            lat, lon = float(r['latitude_deg']), float(r['longitude_deg'])
        except Exception:
            continue
        iso = r['iso_country']
        # 1. the municipality OurAirports states, matched by name inside the same country,
        #    and then confirmed by distance so a same-name city elsewhere cannot win.
        city = None
        for cand in byname.get((iso, norm(r['municipality'])), ()):
            if cand.get('lat') is None:
                continue
            if km(lat, lon, float(cand['lat']), float(cand['lon'])) <= 120:
                city = cand
                matched_name += 1
                break
        # 2. no municipality match: the nearest populated city within 60km, which is an
        #    access relationship a reader recognises, not an attribution claim.
        if city is None:
            best, bd = None, 1e9
            for dla in (-1, 0, 1):
                for dlo in (-1, 0, 1):
                    for cand in grid.get((iso, int(lat) + dla, int(lon) + dlo), ()):
                        if (cand.get('population') or 0) < 5000:
                            continue
                        d = km(lat, lon, float(cand['lat']), float(cand['lon']))
                        if d < bd:
                            bd, best = d, cand
            if best and bd <= 60:
                city, matched_near = best, matched_near + 1
            else:
                unmatched += 1
        nid = 'airport:' + r['ident']
        nodes[nid] = {
            'node_id': nid, 'type': 'airport', 'name': r['name'], 'iata': r['iata_code'],
            'icao': r['icao_code'] or '', 'country': iso, 'region': r['iso_region'],
            'city': (city or {}).get('name'), 'city_id': (city or {}).get('id'),
            'lat': lat, 'lon': lon, 'size': r['type'],
            'parent': ('city:' + city['id']) if city else None,
            'source': 'ourairports', 'licence': 'Public Domain',
        }
        by_iata[r['iata_code']] = nid
    print(f'airport nodes: {len(nodes):,}  (city by municipality {matched_name:,}, '
          f'by proximity {matched_near:,}, no city {unmatched:,})', file=sys.stderr)

    # ---- city nodes, only those a transport node actually reaches -------------------------
    used_cities = {n['city_id'] for n in nodes.values() if n['city_id']}

    # ---- air edges ------------------------------------------------------------------------
    # routes.dat columns: airline, airline_id, src, src_id, dst, dst_id, codeshare, stops, equip
    pair_airlines = collections.defaultdict(set)
    raw_rows = skipped_unknown = skipped_stops = 0
    with open(T + 'openflights-routes.dat', encoding='utf-8') as fh:
        for line in fh:
            f = line.rstrip('\n').split(',')
            if len(f) < 9:
                continue
            raw_rows += 1
            if f[7] not in ('0', ''):      # a multi-stop row is not a direct corridor
                skipped_stops += 1
                continue
            a, b = f[2].strip(), f[4].strip()
            if a not in by_iata or b not in by_iata or a == b:
                skipped_unknown += 1
                continue
            pair_airlines[tuple(sorted((a, b)))].add(f[0].strip())
    print(f'air route rows read: {raw_rows:,}  kept pairs: {len(pair_airlines):,}  '
          f'(dropped {skipped_unknown:,} whose airport is not a current scheduled airport, '
          f'{skipped_stops:,} multi-stop)', file=sys.stderr)

    edges = []
    for (a, b), airlines in pair_airlines.items():
        na, nb = nodes[by_iata[a]], nodes[by_iata[b]]
        edges.append({
            'origin': na['node_id'], 'destination': nb['node_id'], 'mode': 'air',
            'bidirectional': True,
            'operators': len(airlines), 'operator_sample': sorted(airlines)[:4],
            'distance_km': km(na['lat'], na['lon'], nb['lat'], nb['lon']),
            'duration_min': None,
            'source': 'openflights', 'licence': 'ODbL 1.0',
            'source_note': AIR_SOURCE_DATE,
            'route_confidence': 'high' if len(airlines) >= 3 else
                                ('medium' if len(airlines) == 2 else 'low'),
        })

    # ---- airport to city access edges ------------------------------------------------------
    access = 0
    for n in nodes.values():
        if not n['parent']:
            continue
        c = gaz.by_id[n['city_id']]
        edges.append({
            'origin': n['node_id'], 'destination': n['parent'], 'mode': 'airport_access',
            'bidirectional': True, 'operators': None, 'operator_sample': [],
            'distance_km': km(n['lat'], n['lon'], float(c['lat']), float(c['lon'])),
            'duration_min': None,
            'source': 'ourairports', 'licence': 'Public Domain',
            'source_note': 'the municipality OurAirports states for the airport, confirmed '
                           'by distance, or the nearest city of 5,000 or more within 60km',
            'route_confidence': 'high',
        })
        access += 1
    print(f'airport access edges: {access:,}', file=sys.stderr)

    # ---- city nodes written for every city a node reaches ----------------------------------
    for cid in sorted(used_cities):
        c = gaz.by_id[cid]
        nodes['city:' + cid] = {
            'node_id': 'city:' + cid, 'type': 'city', 'name': c['name'], 'iata': '',
            'icao': '', 'country': c['country'], 'region': c.get('admin1') or '',
            'city': c['name'], 'city_id': cid, 'lat': c['lat'], 'lon': c['lon'],
            'size': None, 'population': c.get('population'),
            'parent': None, 'source': 'geonames', 'licence': 'CC BY 4.0',
        }

    os.makedirs(T, exist_ok=True)
    with gzip.open(T + 'graph-nodes.jsonl.gz', 'wt', encoding='utf-8') as fh:
        for n in nodes.values():
            fh.write(json.dumps(n, ensure_ascii=False) + '\n')
    with gzip.open(T + 'graph-edges.jsonl.gz', 'wt', encoding='utf-8') as fh:
        for e in edges:
            fh.write(json.dumps(e, ensure_ascii=False) + '\n')

    nt = collections.Counter(n['type'] for n in nodes.values())
    et = collections.Counter(e['mode'] for e in edges)
    conf = collections.Counter(e['route_confidence'] for e in edges if e['mode'] == 'air')
    summary = {
        'measured_at': '2026-10-07',
        'nodes_total': len(nodes), 'nodes_by_type': dict(nt),
        'edges_total': len(edges), 'edges_by_mode': dict(et),
        'air_edge_confidence': dict(conf),
        'airport_city_match': {'by_municipality': matched_name, 'by_proximity_60km': matched_near,
                               'no_city_found': unmatched},
        'air_rows_read': raw_rows, 'air_rows_dropped_airport_not_current': skipped_unknown,
        'air_rows_dropped_multi_stop': skipped_stops,
        'sources': {
            'ourairports': {'licence': 'Public Domain', 'role': 'airport nodes, city access'},
            'openflights': {'licence': 'ODbL 1.0 with Database Contents License',
                            'role': 'air corridor edges', 'freshness': AIR_SOURCE_DATE},
            'geonames': {'licence': 'CC BY 4.0', 'role': 'city nodes'},
        },
        'what_is_deliberately_absent': [
            'live schedules', 'fares', 'real-time availability', 'current delays',
            'any claim that a specific flight operates today',
        ],
    }
    with open(ROOT + 'data/atlas/measurements/transport-graph-2026-10-07.json',
              'w', encoding='utf-8') as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=1)
    print(f'\nNODES {len(nodes):,}  {dict(nt)}')
    print(f'EDGES {len(edges):,}  {dict(et)}')
    print(f'air edge confidence: {dict(conf)}')


if __name__ == '__main__':
    main()

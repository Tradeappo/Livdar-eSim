#!/usr/bin/env python3
"""Materialise rail city-pair candidates through the same gates as the air pairs.

The rail graph is Wikidata P197 adjacent-station statements, CC0. It is PARTIAL: 115,459
stations carry only 95,724 adjacency statements, a mean degree of 1.66, so some lines are
recorded and some are not. That makes every count here a FLOOR, and it is recorded as one.

Bounds, so this is reachability and not a Cartesian product: both endpoint cities at or
above 50,000 people, the straight line between 25 and 800 km, and a rail path of at most
12 city hops. The graph's own sparsity does most of the bounding, with a mean city degree
of about 2.2, because a rail network is a set of chains rather than a mesh.

What a page may state: the two cities, the stations at each end, the straight-line
distance, the number of city hops along the recorded path, the intermediate cities on it,
and the source. What it may NOT state: departure times, journey duration, fares, operators
or seat availability, none of which this source carries.
"""
import collections, gzip, json, math, os, sys

ROOT = '/home/user/Livdar-eSim/'
T = ROOT + 'data/atlas/sources/transport/'
OUT = T + '_rail-pair-candidates.jsonl.gz'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity as ei                                        # noqa: E402

slug = ei.slugify
POP, DMIN, DMAX, HOPS, MAXK = 50_000, 25.0, 800.0, 12, 15.0


def km(a0, a1, b0, b1):
    p = math.pi / 180.0
    h = (0.5 - math.cos((b0 - a0) * p) / 2
         + math.cos(a0 * p) * math.cos(b0 * p) * (1 - math.cos((b1 - a1) * p)) / 2)
    return round(12742 * math.asin(math.sqrt(max(0.0, min(1.0, h)))), 1)


def main():
    gaz = ei.load_gazetteer()
    cities = [c for c in gaz.by_id.values() if c.get('lat') is not None]
    grid = collections.defaultdict(list)
    for c in cities:
        grid[(int(c['lat']), int(c['lon']))].append(c)

    st = {}
    for l in gzip.open(T + 'rail-stations.jsonl.gz', 'rt', encoding='utf-8'):
        s = json.loads(l)
        st[s['qid']] = s

    s2c, city_station = {}, collections.defaultdict(list)
    for q, s in st.items():
        best, bd = None, 1e9
        for dla in (-1, 0, 1):
            for dlo in (-1, 0, 1):
                for c in grid.get((int(s['lat']) + dla, int(s['lon']) + dlo), ()):
                    d = km(s['lat'], s['lon'], float(c['lat']), float(c['lon']))
                    if d < bd:
                        bd, best = d, c
        if best and bd <= MAXK:
            s2c[q] = best['id']
            city_station[best['id']].append(s['name'])

    cadj = collections.defaultdict(set)
    for l in gzip.open(T + 'rail-edges.jsonl.gz', 'rt', encoding='utf-8'):
        e = json.loads(l)
        a, b = s2c.get(e['a']), s2c.get(e['b'])
        if a and b and a != b:
            cadj[a].add(b)
            cadj[b].add(a)

    elig = {c for c in cadj if (gaz.by_id[c].get('population') or 0) >= POP}
    rej = collections.Counter()
    cands = {}
    for a in sorted(elig):
        A = gaz.by_id[a]
        # BFS keeping the path so the page can name the intermediate cities it passes.
        prev = {a: None}
        dq = collections.deque([a])
        while dq:
            x = dq.popleft()
            d0 = 0
            y0 = x
            while prev[y0] is not None:
                d0 += 1
                y0 = prev[y0]
            if d0 >= HOPS:
                continue
            for y in cadj[x]:
                if y in prev:
                    continue
                prev[y] = x
                dq.append(y)
        for b in prev:
            if b == a or b not in elig:
                continue
            k = tuple(sorted((a, b)))
            if k in cands:
                continue
            B = gaz.by_id[b]
            d = km(float(A['lat']), float(A['lon']), float(B['lat']), float(B['lon']))
            if d < DMIN:
                rej['endpoints_are_the_same_urban_area'] += 1
                continue
            if d > DMAX:
                rej['beyond_800km_where_rail_is_rarely_the_answer'] += 1
                continue
            # rebuild the path
            path, y = [], b
            while y is not None:
                path.append(y)
                y = prev[y]
            hops = len(path) - 1
            mids = [gaz.by_id[x]['name'] for x in path[1:-1]][:6]
            sa = sorted(set(city_station[a]))[:3]
            sb = sorted(set(city_station[b]))[:3]
            facts = [f'{d:,.0f} km apart in a straight line',
                     f'{hops} city hops along the recorded rail path',
                     f'{len(city_station[a])} recorded station(s) at {A["name"]} and '
                     f'{len(city_station[b])} at {B["name"]}']
            if mids:
                facts.append('the recorded path runs through ' + ', '.join(mids))
            cands[k] = {
                'family': 'transport.city-pair-rail', 'pair_type': 'city-city-rail',
                'origin_type': 'city', 'destination_type': 'city',
                'origin_id': a, 'origin_name': A['name'], 'origin_country': A['country'],
                'destination_id': b, 'destination_name': B['name'],
                'destination_country': B['country'],
                'distance_km': d, 'modes': ['rail'], 'hops': hops,
                'intermediate_cities': mids,
                'origin_stations': sa, 'destination_stations': sb,
                'route_confidence': 'high' if hops <= 3 else ('medium' if hops <= 7 else 'low'),
                'data_density': len(facts),
                'utility_score': max(20, 90 - 5 * hops),
                'facts': facts,
                'sources': ['wikidata P197 adjacent station (CC0 1.0)',
                            'geonames (CC BY 4.0)'],
                'source_note': 'rail network adjacency, not a timetable; no departure time, '
                               'journey duration, fare, operator or availability is stated, '
                               'because the source carries none of them',
                'source_completeness': 'PARTIAL. 115,459 stations carry 95,724 adjacency '
                                       'statements, so some lines are recorded and some are '
                                       'not. Counts from this graph are floors.',
                'canonical_direction': 'unordered; one page per pair',
            }

    # duplicate risk, same rule as the air pairs
    band = collections.Counter()
    for k, r in cands.items():
        band[(r['origin_id'], round(r['distance_km'] / 100))] += 1
    kept = []
    for k, r in cands.items():
        n = band[(r['origin_id'], round(r['distance_km'] / 100))]
        r['sibling_count_same_origin_and_distance_band'] = n
        r['duplicate_risk'] = 'HIGH' if n >= 12 else ('MEDIUM' if n >= 6 else 'LOW')
        if r['data_density'] < 3:
            rej['fewer_than_three_statable_facts'] += 1
            continue
        if r['route_confidence'] == 'low' and r['duplicate_risk'] == 'HIGH':
            rej['long_indirect_path_in_a_crowded_distance_band'] += 1
            continue
        if not slug(r['origin_name']) or not slug(r['destination_name']):
            rej['endpoint_name_does_not_slug'] += 1
            continue
        r['url_pattern'] = (f"/en/transport/rail/{slug(r['origin_name'])}-"
                            f"{slug(r['destination_name'])}/")
        kept.append(r)

    seen, final = {}, []
    for r in sorted(kept, key=lambda x: -x['utility_score']):
        if r['url_pattern'] in seen:
            rej['url_collision_with_another_pair'] += 1
            continue
        seen[r['url_pattern']] = 1
        final.append(r)

    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for r in final:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')

    conf = collections.Counter(r['route_confidence'] for r in final)
    dup = collections.Counter(r['duplicate_risk'] for r in final)
    hop = collections.Counter(r['hops'] for r in final)
    summary = {
        'measured_at': '2026-10-07',
        'stations': len(st), 'stations_mapped_to_a_city': len(s2c),
        'cities_with_rail': len(cadj), 'cities_above_pop_floor': len(elig),
        'RAW_candidates': len(cands), 'REJECTED': dict(rej.most_common()),
        'REJECTED_total': sum(rej.values()), 'FINAL_NET': len(final),
        'final_by_route_confidence': dict(conf), 'final_by_duplicate_risk': dict(dup),
        'final_by_hop_count': {str(k): v for k, v in sorted(hop.items())},
        'bounds': {'pop_floor': POP, 'min_km': DMIN, 'max_km': DMAX, 'max_hops': HOPS,
                   'station_to_city_max_km': MAXK},
        'source_completeness': 'PARTIAL, mean station degree 1.66; every count is a floor',
    }
    with open(ROOT + 'data/atlas/measurements/rail-pair-pilot-2026-10-07.json', 'w',
              encoding='utf-8') as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=1)
    print(f'RAW      {len(cands):,}')
    print(f'REJECTED {sum(rej.values()):,}')
    print(f'FINAL    {len(final):,}')
    print(f'confidence {dict(conf)}')
    print(f'duplicate risk {dict(dup)}')
    print('rejections:')
    for k, v in rej.most_common():
        print(f'  {v:>8}  {k}')


if __name__ == '__main__':
    main()

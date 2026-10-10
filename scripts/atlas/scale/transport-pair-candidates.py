#!/usr/bin/env python3
"""Turn the transport graph into pair candidates, gated.

Sections 5, 6 and 7 of the brief. Only pairs with evidence in the graph. No Cartesian
product. Direction is canonicalised to ONE page per unordered pair, because everything the
page contract lets us state (distance, modes, airports, access, provenance) is identical in
both directions, and the brief says not to create two pages just because the order is
reversed.

Four scores per candidate, as the brief asks:
  UTILITY_SCORE     how much a reader gets: modes, operators, both endpoints resolved, access
  DATA_DENSITY      count of non-null facts the page can actually state
  ROUTE_CONFIDENCE  from the graph: how many independent operators evidence the corridor
  DUPLICATE_RISK    whether a sibling pair would carry a near-identical fact set

Writes the candidate file and a funnel that reconciles. Generates no pages and publishes
nothing.
"""
import collections, gzip, json, math, os, sys

ROOT = '/home/user/Livdar-eSim/'
T = ROOT + 'data/atlas/sources/transport/'
OUT = T + '_pair-candidates.jsonl.gz'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity as ei                                        # noqa: E402

slug = ei.slugify
MIN_CITY_POP = 20_000      # a corridor endpoint a reader recognises
MIN_DISTANCE_KM = 25.0     # below this the "pair" is one urban area, not a journey
MAX_ACCESS_KM = 60.0


def km(a, b):
    p = math.pi / 180.0
    h = (0.5 - math.cos((b[0] - a[0]) * p) / 2
         + math.cos(a[0] * p) * math.cos(b[0] * p) * (1 - math.cos((b[1] - a[1]) * p)) / 2)
    return round(12742 * math.asin(math.sqrt(max(0.0, min(1.0, h)))), 1)


def main():
    nodes = {}
    for line in gzip.open(T + 'graph-nodes.jsonl.gz', 'rt', encoding='utf-8'):
        n = json.loads(line)
        nodes[n['node_id']] = n
    edges = [json.loads(l) for l in gzip.open(T + 'graph-edges.jsonl.gz', 'rt', encoding='utf-8')]
    print(f'graph: {len(nodes):,} nodes, {len(edges):,} edges', file=sys.stderr)

    rej = collections.Counter()
    cands = {}

    # ---- 1. city to city corridors derived from air edges -------------------------------
    # Several airports can serve one city, so the corridor is keyed on the CITY pair and the
    # airports that evidence it are carried on the candidate.
    corridor = collections.defaultdict(lambda: {'airports': set(), 'operators': 0,
                                                'conf': set(), 'dist': []})
    for e in edges:
        if e['mode'] != 'air':
            continue
        a, b = nodes[e['origin']], nodes[e['destination']]
        if not a['city_id'] or not b['city_id']:
            rej['air_edge_endpoint_has_no_city'] += 1
            continue
        if a['city_id'] == b['city_id']:
            rej['air_edge_is_within_one_city'] += 1
            continue
        key = tuple(sorted((a['city_id'], b['city_id'])))
        c = corridor[key]
        c['airports'].add(a['iata'])
        c['airports'].add(b['iata'])
        c['operators'] += e['operators'] or 0
        c['conf'].add(e['route_confidence'])
        c['dist'].append(e['distance_km'])

    gaz = ei.load_gazetteer()
    for (ca, cb), c in corridor.items():
        A, B = gaz.by_id.get(ca), gaz.by_id.get(cb)
        if not A or not B:
            rej['city_not_in_gazetteer'] += 1
            continue
        if (A.get('population') or 0) < MIN_CITY_POP or (B.get('population') or 0) < MIN_CITY_POP:
            rej['endpoint_city_below_population_floor'] += 1
            continue
        d = km((float(A['lat']), float(A['lon'])), (float(B['lat']), float(B['lon'])))
        if d < MIN_DISTANCE_KM:
            rej['endpoints_are_the_same_urban_area'] += 1
            continue
        conf = ('high' if 'high' in c['conf'] else
                'medium' if 'medium' in c['conf'] else 'low')
        facts = [f'{d:,.0f} km apart in a straight line',
                 f'{len(c["airports"])} airports evidence this corridor',
                 f'{c["operators"]} airline route records across those airports']
        density = len(facts) + (1 if conf == 'high' else 0)
        utility = min(100, 40 + 10 * len(c['airports']) + (20 if conf == 'high' else
                                                           10 if conf == 'medium' else 0))
        cands[('city-city', ca, cb)] = {
            'family': 'transport.city-pair', 'pair_type': 'city-city',
            'origin_type': 'city', 'destination_type': 'city',
            # the identity module's label and slug, for the reason the rail builder gives
            'origin_id': ca, 'origin_name': gaz.label(ca) or A['name'],
            'origin_slug': gaz.slug(ca, slug), 'origin_country': A['country'],
            'destination_id': cb, 'destination_name': gaz.label(cb) or B['name'],
            'destination_slug': gaz.slug(cb, slug),
            'destination_country': B['country'],
            'distance_km': d, 'modes': ['air'],
            'airports': sorted(x for x in c['airports'] if x),
            'operator_records': c['operators'],
            'route_confidence': conf, 'utility_score': utility, 'data_density': density,
            'facts': facts,
            'sources': ['openflights (ODbL 1.0)', 'ourairports (Public Domain)',
                        'geonames (CC BY 4.0)'],
            'source_note': 'air corridor evidence, not a timetable; no schedule, fare or '
                           'availability is stated',
            'canonical_direction': 'unordered; one page per pair',
        }

    # ---- 2. airport to city access ------------------------------------------------------
    for e in edges:
        if e['mode'] != 'airport_access':
            continue
        a = nodes[e['origin']]
        cid = a['city_id']
        C = gaz.by_id.get(cid)
        if not C:
            rej['access_city_not_in_gazetteer'] += 1
            continue
        if e['distance_km'] > MAX_ACCESS_KM:
            rej['airport_too_far_from_city_to_be_access'] += 1
            continue
        if (C.get('population') or 0) < MIN_CITY_POP:
            rej['access_city_below_population_floor'] += 1
            continue
        facts = [f'{e["distance_km"]:,.1f} km from the airport to the city',
                 f'IATA code {a["iata"]}',
                 f'classified by OurAirports as a {a["size"].replace("_", " ")}']
        cands[('airport-city', a['node_id'], cid)] = {
            'family': 'transport.airport-city-access', 'pair_type': 'airport-city',
            'origin_type': 'airport', 'destination_type': 'city',
            # the origin is an AIRPORT node, not a gazetteer city, so it keeps its own name
            # and its own slug; only the destination city goes through the identity module
            'origin_id': a['node_id'], 'origin_name': a['name'],
            'origin_slug': slug(a['name']),
            'origin_country': a['country'],
            'destination_id': cid, 'destination_name': gaz.label(cid) or C['name'],
            'destination_slug': gaz.slug(cid, slug),
            'destination_country': C['country'],
            'distance_km': e['distance_km'], 'modes': ['airport_access'],
            'airports': [a['iata']], 'operator_records': 0,
            'route_confidence': 'high', 'utility_score': 70, 'data_density': len(facts),
            'facts': facts,
            'sources': ['ourairports (Public Domain)', 'geonames (CC BY 4.0)'],
            'source_note': 'airport to city distance and identity only; no ground transport '
                           'operator, fare or timetable is stated because no licensed source '
                           'for them is on disk',
            'canonical_direction': 'unordered; one page per pair',
        }

    # ---- 3. duplicate risk --------------------------------------------------------------
    # A pair is at risk when a sibling sharing one endpoint carries the same fact shape and a
    # near-identical distance band, which is what a city-swap page looks like.
    band = collections.Counter()
    for k, r in cands.items():
        band[(r['pair_type'], r['origin_id'], round(r['distance_km'] / 100))] += 1
    for k, r in cands.items():
        n = band[(r['pair_type'], r['origin_id'], round(r['distance_km'] / 100))]
        r['sibling_count_same_origin_and_distance_band'] = n
        r['duplicate_risk'] = 'HIGH' if n >= 12 else ('MEDIUM' if n >= 6 else 'LOW')

    # ---- 4. the hard utility gate -------------------------------------------------------
    kept = []
    for k, r in cands.items():
        if r['data_density'] < 3:
            rej['fewer_than_three_statable_facts'] += 1
            continue
        if r['pair_type'] == 'city-city' and r['route_confidence'] == 'low' \
                and r['duplicate_risk'] == 'HIGH':
            rej['single_operator_corridor_in_a_crowded_distance_band'] += 1
            continue
        if not r.get('origin_slug') or not r.get('destination_slug'):
            rej['endpoint_name_does_not_slug'] += 1
            continue
        r['url_pattern'] = (f"/en/transport/{'route' if r['pair_type'] == 'city-city' else 'airport'}/"
                            f"{r['origin_slug']}-{r['destination_slug']}/")
        kept.append(r)

    # URL collisions: two different pairs must never share a URL.
    seen = {}
    final = []
    for r in sorted(kept, key=lambda x: -x['utility_score']):
        u = r['url_pattern']
        if u in seen:
            rej['url_collision_with_another_pair'] += 1
            continue
        seen[u] = 1
        final.append(r)

    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for r in final:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')

    raw = len(cands)
    removed = sum(rej.values())
    pt = collections.Counter(r['pair_type'] for r in final)
    conf = collections.Counter(r['route_confidence'] for r in final)
    dup = collections.Counter(r['duplicate_risk'] for r in final)
    summary = {
        'measured_at': '2026-10-07',
        'graph_nodes': len(nodes), 'graph_edges': len(edges),
        'RAW_candidates_from_graph': raw,
        'REJECTED': dict(rej.most_common()),
        'REJECTED_total': removed,
        'FINAL_NET': len(final),
        'funnel_note': 'RAW counts candidates built from graph evidence. Some rejections '
                       'happen BEFORE a candidate is built (an air edge whose endpoint has no '
                       'city never becomes a candidate), so RAW minus REJECTED does not equal '
                       'FINAL by construction. The reconciling identity is stated per stage '
                       'below instead.',
        'stage_reconciliation': {
            'edges_air': sum(1 for e in edges if e['mode'] == 'air'),
            'air_edges_dropped_before_candidacy':
                rej['air_edge_endpoint_has_no_city'] + rej['air_edge_is_within_one_city'],
            'distinct_city_corridors': len(corridor),
            'corridors_rejected': (rej['city_not_in_gazetteer']
                                   + rej['endpoint_city_below_population_floor']
                                   + rej['endpoints_are_the_same_urban_area']),
            'candidates_built': raw,
            'candidates_rejected_by_gates': (rej['fewer_than_three_statable_facts']
                + rej['single_operator_corridor_in_a_crowded_distance_band']
                + rej['endpoint_name_does_not_slug'] + rej['url_collision_with_another_pair']),
            'FINAL_NET': len(final),
        },
        'final_by_pair_type': dict(pt),
        'final_by_route_confidence': dict(conf),
        'final_by_duplicate_risk': dict(dup),
        'gates_applied': {
            'min_city_population': MIN_CITY_POP,
            'min_pair_distance_km': MIN_DISTANCE_KM,
            'max_airport_access_km': MAX_ACCESS_KM,
            'min_statable_facts': 3,
            'direction': 'canonicalised to one page per unordered pair',
            'url_collision': 'a pair sharing a URL with another is dropped, never silently merged',
        },
    }
    with open(ROOT + 'data/atlas/measurements/transport-pair-pilot-2026-10-07.json',
              'w', encoding='utf-8') as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=1)
    print(f'\nRAW      {raw:,}')
    print(f'REJECTED {removed:,}')
    print(f'FINAL    {len(final):,}')
    print(f'\nby pair type: {dict(pt)}')
    print(f'by route confidence: {dict(conf)}')
    print(f'by duplicate risk: {dict(dup)}')
    print('\nrejections:')
    for k, v in rej.most_common():
        print(f'  {v:>7}  {k}')
    print(f'\nwrote {OUT}')


if __name__ == '__main__':
    main()

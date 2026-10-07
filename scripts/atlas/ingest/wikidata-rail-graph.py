#!/usr/bin/env python3
"""Fetch a rail network graph from Wikidata: stations as nodes, adjacent stations as edges.

Wikidata holds 280,733 P197 "adjacent station" statements, which is a real rail network
rather than a guess at one. Licence is CC0. Queried per country so each request stays
inside the endpoint's timeout, politely paced.

Writes data/atlas/sources/transport/rail-stations.jsonl.gz and rail-edges.jsonl.gz.
Generates no pages.
"""
import collections, gzip, json, os, sys, time, urllib.parse, urllib.request

ROOT = '/home/user/Livdar-eSim/'
T = ROOT + 'data/atlas/sources/transport/'
UA = 'LivdarAtlas/1.0 (offline research; contact via repo)'

# Market countries first, then the rest of Europe and the larger rail networks, because a
# rail corridor is only useful where a market or a measured destination sits.
COUNTRIES = [
    'Q183',  # Germany
    'Q142',  # France
    'Q145',  # United Kingdom
    'Q38',   # Italy
    'Q29',   # Spain
    'Q55',   # Netherlands
    'Q36',   # Poland
    'Q45',   # Portugal
    'Q43',   # Turkey
    'Q17',   # Japan
    'Q30',   # United States
    'Q155',  # Brazil
    'Q408',  # Australia
    'Q865',  # Taiwan
    'Q40',   # Austria
    'Q39',   # Switzerland
    'Q31',   # Belgium
    'Q213',  # Czechia
    'Q28',   # Hungary
    'Q218',  # Romania
    'Q34',   # Sweden
    'Q20',   # Norway
    'Q35',   # Denmark
    'Q33',   # Finland
    'Q27',   # Ireland
    'Q214',  # Slovakia
    'Q215',  # Slovenia
    'Q224',  # Croatia
    'Q219',  # Bulgaria
    'Q41',   # Greece
    'Q212',  # Ukraine
    'Q668',  # India
    'Q148',  # China
    'Q884',  # South Korea
    'Q96',   # Mexico
    'Q414',  # Argentina
    'Q298',  # Chile
    'Q252',  # Indonesia
    'Q869',  # Thailand
    'Q881',  # Vietnam
    'Q833',  # Malaysia
    'Q334',  # Singapore
    'Q79',   # Egypt
    'Q1033', # Nigeria
    'Q258',  # South Africa
    'Q16',   # Canada
]

Q = """SELECT ?s ?sLabel ?lat ?lon ?adj WHERE {
  ?s wdt:P31/wdt:P279* wd:Q55488 .
  ?s wdt:P17 wd:%s .
  ?s p:P625/psv:P625 ?co .
  ?co wikibase:geoLatitude ?lat .
  ?co wikibase:geoLongitude ?lon .
  OPTIONAL { ?s wdt:P197 ?adj }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de,fr,it,es,nl,pl,pt,tr,ja". }
}"""


def ask(q, tries=3):
    url = 'https://query.wikidata.org/sparql?' + urllib.parse.urlencode(
        {'query': q, 'format': 'json'})
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={
                'Accept': 'application/sparql-results+json', 'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except Exception as e:
            if i == tries - 1:
                raise
            print(f'    retry {i + 1} after {e}', file=sys.stderr)
            time.sleep(5 * (i + 1))


def main():
    stations, edges = {}, set()
    iso = {}
    for qid in COUNTRIES:
        try:
            res = ask(Q % qid)
        except Exception as e:
            print(f'{qid}: FAILED {e}', file=sys.stderr)
            continue
        n0, e0 = len(stations), len(edges)
        for b in res['results']['bindings']:
            sid = b['s']['value'].rsplit('/', 1)[-1]
            if sid not in stations:
                stations[sid] = {
                    'node_id': 'station:' + sid, 'qid': sid, 'type': 'train_station',
                    'name': b.get('sLabel', {}).get('value') or sid,
                    'lat': float(b['lat']['value']), 'lon': float(b['lon']['value']),
                    'country_qid': qid,
                    'source': 'wikidata', 'licence': 'CC0 1.0',
                }
            if 'adj' in b:
                a = b['adj']['value'].rsplit('/', 1)[-1]
                if a != sid:
                    edges.add(tuple(sorted((sid, a))))
        print(f'{qid}: +{len(stations) - n0:,} stations, +{len(edges) - e0:,} edges '
              f'(running {len(stations):,} / {len(edges):,})', file=sys.stderr)
        time.sleep(1.2)

    os.makedirs(T, exist_ok=True)
    with gzip.open(T + 'rail-stations.jsonl.gz', 'wt', encoding='utf-8') as fh:
        for s in stations.values():
            fh.write(json.dumps(s, ensure_ascii=False) + '\n')
    kept = 0
    with gzip.open(T + 'rail-edges.jsonl.gz', 'wt', encoding='utf-8') as fh:
        for a, b in sorted(edges):
            # An edge is only usable when BOTH endpoints were fetched with coordinates,
            # otherwise there is nothing to compute a distance from.
            if a in stations and b in stations:
                fh.write(json.dumps({'a': a, 'b': b, 'mode': 'rail',
                                     'source': 'wikidata P197 adjacent station',
                                     'licence': 'CC0 1.0'}, ensure_ascii=False) + '\n')
                kept += 1
    summary = {'measured_at': '2026-10-07', 'countries_queried': len(COUNTRIES),
               'stations': len(stations), 'adjacency_pairs_seen': len(edges),
               'edges_with_both_endpoints_resolved': kept,
               'licence': 'CC0 1.0', 'property': 'P197 adjacent station',
               'note': 'An adjacency whose other endpoint was not fetched with coordinates is '
                       'dropped rather than kept with a missing node.'}
    with open(ROOT + 'data/atlas/measurements/wikidata-rail-graph-2026-10-07.json',
              'w', encoding='utf-8') as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=1)
    print(f'\nSTATIONS {len(stations):,}  ADJACENCIES {len(edges):,}  USABLE EDGES {kept:,}')


if __name__ == '__main__':
    main()

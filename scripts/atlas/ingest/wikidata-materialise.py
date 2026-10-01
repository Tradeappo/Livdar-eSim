#!/usr/bin/env python3
"""
Materialise Wikidata entities for the Livdar markets. CC0, so no share-alike.

Resumable and atomic by construction: one output file per (class, country), written to
.tmp and renamed on success, with a .done marker per pair. The endpoint throttles hard,
so every request backs off exponentially and the script can be re-run indefinitely until
every pair is marked done.

Only entities with a label AND coordinates are kept: a Wikidata item with neither cannot
support a page, and keeping it would pad the count.
"""
import urllib.parse, urllib.request, json, time, os, gzip, sys, collections

OUT = '/home/user/Livdar-eSim/data/atlas/sources/wikidata/'
os.makedirs(OUT, exist_ok=True)
MARK = '/tmp/wd_marks/'
os.makedirs(MARK, exist_ok=True)

# classes that can carry a durable page: notable, visitable or institution-shaped.
CLASSES = [('Q33506','museum'),('Q7075','library'),('Q16917','hospital'),
           ('Q24354','theatre'),('Q40080','beach'),('Q11315','shopping_mall'),
           ('Q207694','art_museum'),('Q3918','university'),('Q483110','stadium'),
           ('Q167346','botanical_garden'),('Q23413','castle'),('Q22698','park'),
           ('Q46169','national_park'),('Q2259749','zoo'),('Q839954','archaeological_site'),
           ('Q4989906','monument'),('Q12280','bridge'),('Q174782','public_square'),
           ('Q41253','movie_theater'),('Q194195','amusement_park'),('Q1007870','art_gallery'),
           ('Q55488','railway_station'),('Q1248784','airport'),('Q39614','cemetery')]
COUNTRIES = [('Q30','US'),('Q183','DE'),('Q142','FR'),('Q38','IT'),('Q29','ES'),
             ('Q55','NL'),('Q36','PL'),('Q155','BR'),('Q145','GB'),('Q17','JP'),('Q865','TW')]
LANG = {'US':'en','GB':'en','DE':'de','FR':'fr','IT':'it','ES':'es','NL':'nl',
        'PL':'pl','BR':'pt','JP':'ja','TW':'zh-hant'}

def fetch(qid, cq, iso, offset, limit=10000):
    lang = LANG[iso]
    q = f"""SELECT ?x ?xLabel ?lat ?lon ?site WHERE {{
  ?x wdt:P31 wd:{qid} ; wdt:P17 wd:{cq} .
  ?x p:P625/psv:P625 [ wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon ] .
  OPTIONAL {{ ?x wdt:P856 ?site }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "{lang},en". }}
}} LIMIT {limit} OFFSET {offset}"""
    url = 'https://query.wikidata.org/sparql?format=json&query=' + urllib.parse.quote(q)
    for attempt in range(6):
        try:
            rq = urllib.request.Request(url, headers={
                'User-Agent': 'LivdarCandidateInventory/1.0 (offline research inventory)',
                'Accept': 'application/sparql-results+json'})
            with urllib.request.urlopen(rq, timeout=180) as r:
                return json.load(r)['results']['bindings']
        except Exception:
            time.sleep(15 * (attempt + 1))
    return None

total = 0
stats = collections.Counter()
for qid, cname in CLASSES:
    for cq, iso in COUNTRIES:
        mark = f'{MARK}{cname}_{iso}.done'
        if os.path.exists(mark): continue
        rows = []
        offset = 0
        while True:
            b = fetch(qid, cq, iso, offset)
            if b is None:
                print(f'  {cname}/{iso} UNREACHABLE after retries, leaving unmarked', flush=True)
                break
            for r in b:
                lbl = r.get('xLabel', {}).get('value', '')
                qidv = r['x']['value'].rsplit('/', 1)[1]
                if not lbl or lbl == qidv: continue       # unlabelled: cannot make a page
                rows.append({'id': qidv, 'kind': 'wd', 'cls': cname, 'name': lbl,
                             'country': iso, 'lat': round(float(r['lat']['value']), 6),
                             'lon': round(float(r['lon']['value']), 6),
                             **({'web': r['site']['value'][:160]} if r.get('site') else {})})
            if len(b) < 10000: break
            offset += 10000
            time.sleep(3)
        else:
            pass
        if rows:
            dst = f'{OUT}wd-{cname}-{iso}.jsonl.gz'
            with gzip.open(dst + '.tmp', 'wt', encoding='utf-8') as f:
                for r in rows: f.write(json.dumps(r, ensure_ascii=False) + '\n')
            os.replace(dst + '.tmp', dst)
            total += len(rows); stats[cname] += len(rows)
            print(f'  {cname}/{iso}: {len(rows):,}', flush=True)
        open(mark, 'w').close()
        time.sleep(4)
print(f'\nTOTAL materialised: {total:,}')
print('by class:', dict(stats.most_common()))

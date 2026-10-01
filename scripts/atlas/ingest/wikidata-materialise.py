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

# The endpoint's own result cap is the open question here. Every file this has produced
# sits at or below 10,000 rows and exactly one, wd-park-US, sits at 9,992, which is the
# shape truncation would take: if WDQS caps the underlying result set at 10,000, then
# OFFSET 10000 returns nothing even though more entities exist, and the loop below reads
# that as the end of the data. It could not be verified because WDQS went into an active
# outage mid-pass, answering 429 with "Aggressively rate-limiting to 1 req / min - this
# rule was created during active wdqs outage". VERIFY_WHEN_WDQS_RECOVERS: run a COUNT for
# park/US against the file's row count, and if they differ, page by a sort key rather than
# by OFFSET, which is the standard way around a result cap.
WDQS_OUTAGE_NOTE = ('WDQS was rate-limiting to 1 request per minute during this pass, so '
                    'the Wikidata corpus is a floor rather than a total')


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
        except Exception as e:
            # 429 during the outage means wait a full minute, not back off from seconds
            wait = 70 if '429' in str(e) else 15 * (attempt + 1)
            time.sleep(wait)
    return None

# Partition the work so several workers can run at once without doing it twice.
# One worker takes about 1.2 minutes per class-country pair, which is four hours for the
# 264 pairs; four workers is one hour. STRIDE and OFFSET split the pair list
# deterministically, and a claim directory makes the split safe even if two workers are
# given the same offset by mistake: mkdir is atomic, so the second one loses and moves on.
STRIDE = int(os.environ.get('WD_STRIDE', '1'))
OFFSET = int(os.environ.get('WD_OFFSET', '0'))

PAIRS = [(qid, cname, cq, iso) for qid, cname in CLASSES for cq, iso in COUNTRIES]
PAIRS = [p for i, p in enumerate(PAIRS) if i % STRIDE == OFFSET]
print(f'worker offset {OFFSET} of stride {STRIDE}: {len(PAIRS)} pairs to try', flush=True)

total = 0
stats = collections.Counter()
for qid, cname, cq, iso in PAIRS:
    if True:
        mark = f'{MARK}{cname}_{iso}.done'
        claim = f'{MARK}{cname}_{iso}.claim'
        if os.path.exists(mark): continue
        try:
            os.mkdir(claim)
        except FileExistsError:
            continue                      # another worker holds this pair
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
            time.sleep(65)        # the endpoint asked for one request per minute
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
        try:
            os.rmdir(claim)
        except OSError:
            pass
        time.sleep(65)
print(f'\nTOTAL materialised: {total:,}')
print('by class:', dict(stats.most_common()))

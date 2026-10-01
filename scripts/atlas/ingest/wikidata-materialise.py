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

# VERIFIED 2026-10-01: the result cap is real and it did truncate.
# The earlier pass left this as an open question because WDQS was in an active outage. It
# has since answered, and a COUNT over exactly the population the materialiser paginates
# puts United States parks at 56,755 while the file this script produced holds 9,992. So
# the shape I suspected was the shape it took: the first page returned the full 10,000,
# OFFSET 10000 returned nothing because the cap applies to the underlying result set, and
# the loop below read an empty page as the end of the data. 83 per cent of that pair was
# lost silently, which is the worst kind of loss because the file looks complete.
#
# Only one of the 125 files carried the signature. Every other file sits well below 10,000,
# which means its result set ended naturally rather than being cut off. The damage was one
# pair; the defect was in every pair, waiting for a large enough class.
#
# The fix is to stop paginating by OFFSET at all. Instead each pair is collected in
# latitude bands, and a band that comes back at or above the cap is not trusted: it is
# split in half and both halves are re-asked. A band can therefore never be quietly
# truncated, because a full band is treated as evidence of truncation rather than as a
# complete answer. Points carry one latitude each and the bands are half-open, so no entity
# is counted twice and none falls between two bands.

# Two endpoints, each with its own rate budget. The outage rule is one request per minute
# and it is enforced per host, which measurement showed: two requests to one host a second
# apart gave 200 then 429, while one request to each host gave 200 twice. Alternating them
# under a per-host minute gives one request roughly every 31 seconds without asking either
# host for more than it said it would give.
ENDPOINTS = ['https://query-main.wikidata.org/sparql',
             'https://query.wikidata.org/sparql']
_last = {e: 0.0 for e in ENDPOINTS}
_turn = [0]
CAP = 10000


def ask(q, timeout=180):
    """One SPARQL query, routed to whichever endpoint has waited longest."""
    for attempt in range(8):
        ep = ENDPOINTS[_turn[0] % len(ENDPOINTS)]
        _turn[0] += 1
        gap = 62 - (time.time() - _last[ep])
        if gap > 0:
            time.sleep(gap)
        url = ep + '?format=json&query=' + urllib.parse.quote(q)
        try:
            rq = urllib.request.Request(url, headers={
                'User-Agent': 'LivdarCandidateInventory/1.0 (offline research inventory)',
                'Accept': 'application/sparql-results+json'})
            _last[ep] = time.time()
            with urllib.request.urlopen(rq, timeout=timeout) as r:
                return json.load(r)['results']['bindings']
        except Exception as e:
            _last[ep] = time.time()
            if '429' in str(e):
                continue            # the alternation already spaces the next attempt
            time.sleep(10 * (attempt + 1))
    return None


def fetch_band(qid, cq, iso, lo, hi, limit=CAP):
    """Entities of one class in one country whose latitude falls in [lo, hi)."""
    lang = LANG[iso]
    q = f"""SELECT ?x ?xLabel ?lat ?lon ?site WHERE {{
  ?x wdt:P31 wd:{qid} ; wdt:P17 wd:{cq} .
  ?x p:P625/psv:P625 [ wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon ] .
  FILTER(?lat >= {lo} && ?lat < {hi})
  OPTIONAL {{ ?x wdt:P856 ?site }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "{lang},en". }}
}} LIMIT {limit}"""
    return ask(q)


def fetch(qid, cq, iso, offset, limit=CAP):
    """Kept so nothing that imports this module breaks; the band path is what runs."""
    return fetch_band(qid, cq, iso, -90.0, 90.0, limit)

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
        # Latitude bands, deepest-first, with a full band treated as truncation.
        seen = {}
        # Start split rather than whole. One band from pole to pole is the single most
        # expensive form the query can take, and three pairs timed out on exactly that
        # before anything had a chance to subdivide. Eight opening bands cost eight cheap
        # queries instead of one that cannot finish.
        queue = [(lo, lo + 22.5, 0) for lo in
                 [-90.0, -67.5, -45.0, -22.5, 0.0, 22.5, 45.0, 67.5]]
        unreachable = False
        truncated_bands = []
        MAX_DEPTH = 14
        while queue:
            lo, hi, depth = queue.pop()
            bnd = fetch_band(qid, cq, iso, lo, hi)
            if bnd is None:
                # A band that cannot be answered is usually a band that is too heavy, not a
                # band behind a closed door: WDQS has a 60 second query timeout and the label
                # service over a whole class in a whole country exceeds it. Measurement
                # settled which it was here: a cheap COUNT against both endpoints returned
                # 200 at the same moment three pairs were being abandoned as UNREACHABLE.
                # So an unanswerable band is split exactly like a full one. Giving up on it
                # instead was the same defect as trusting a full page, wearing a different
                # hat: in both cases the loop accepted a non-answer as an answer.
                if depth < MAX_DEPTH:
                    mid = (lo + hi) / 2.0
                    print(f'  {cname}/{iso} band {lo}..{hi} did not answer, splitting',
                          flush=True)
                    queue.append((lo, mid, depth + 1))
                    queue.append((mid, hi, depth + 1))
                    continue
                print(f'  {cname}/{iso} band {lo}..{hi} did not answer even at depth '
                      f'{depth}, leaving the pair unmarked so a later run retries it',
                      flush=True)
                unreachable = True
                break
            if len(bnd) >= CAP:
                # Do not believe a full band. Either it is exactly the cap by coincidence or
                # it was cut off, and there is no way to tell from the response, so split.
                if depth >= MAX_DEPTH:
                    truncated_bands.append([lo, hi, len(bnd)])
                    print(f'  {cname}/{iso} band {lo}..{hi} still full at depth {depth}: '
                          f'recording it as truncated rather than claiming it is complete',
                          flush=True)
                else:
                    mid = (lo + hi) / 2.0
                    queue.append((lo, mid, depth + 1))
                    queue.append((mid, hi, depth + 1))
                    continue
            for r in bnd:
                lbl = r.get('xLabel', {}).get('value', '')
                qidv = r['x']['value'].rsplit('/', 1)[1]
                if not lbl or lbl == qidv: continue       # unlabelled: cannot make a page
                seen[qidv] = {'id': qidv, 'kind': 'wd', 'cls': cname, 'name': lbl,
                              'country': iso, 'lat': round(float(r['lat']['value']), 6),
                              'lon': round(float(r['lon']['value']), 6),
                              **({'web': r['site']['value'][:160]} if r.get('site') else {})}
        if unreachable:
            os.rmdir(claim)
            continue
        rows = sorted(seen.values(), key=lambda r: r['id'])
        if truncated_bands:
            # Say so in the data rather than only in the log, so a later reader of the file
            # cannot mistake it for a complete class.
            with open(f'{OUT}wd-{cname}-{iso}.truncated.json', 'w') as tf:
                json.dump({'class': cname, 'country': iso, 'rows_kept': len(rows),
                           'bands_still_full_at_max_depth': truncated_bands,
                           'meaning': 'this class in this country is a floor, not a total'},
                          tf, indent=2)
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

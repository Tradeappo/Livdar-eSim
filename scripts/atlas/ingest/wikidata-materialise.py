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
import subprocess, tempfile

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
             ('Q55','NL'),('Q36','PL'),('Q155','BR'),('Q145','GB'),('Q17','JP'),('Q865','TW'),
             # The fourteen destination countries this container cannot reach by any OSM route.
             # download.openstreetmap.fr does not carry them, download.geofabrik.de and every
             # Overpass endpoint tested are reset mid-exchange by the network policy, and the three
             # other mirrors hold the whole planet only. Wikidata IS reachable, it is CC0 with no
             # share-alike, and it carries beaches, peaks, castles, lakes and national parks with
             # coordinates, which is most of what the outdoor families are built from. So the
             # blocked countries get an entity layer from a different source rather than no layer.
             #
             # What each one is worth, measured 2026-10-02: machu picchu 230,000 in en-US, the
             # largest volume anywhere in this project; jeju 19,000 and esim korea 15,000 in ja-JP;
             # ha long bay 31,000 in en-US; saranda 26,000 in it-IT; meteora 26,000 in en-US;
             # plitvicer seen 18,000 in de-DE; kotor 5,400 and lago di bled 7,100 in it-IT.
             ('Q41','GR'),('Q224','HR'),('Q869','TH'),('Q881','VN'),('Q884','KR'),
             ('Q222','AL'),('Q189','IS'),('Q215','SI'),('Q28','HU'),('Q236','ME'),
             ('Q233','MT'),('Q419','PE'),('Q739','CO'),('Q664','NZ')]
# The label language asked of Wikidata. For a market country it is that market's own language. For
# a destination country it is ENGLISH, deliberately: the page will be written in a market language
# and the destination axis supplies the per-entity language mark separately, so asking Wikidata for
# Greek labels on Greek beaches would fetch the one language no Livdar market reads.
LANG = {'US':'en','GB':'en','DE':'de','FR':'fr','IT':'it','ES':'es','NL':'nl',
        'PL':'pl','BR':'pt','JP':'ja','TW':'zh-hant',
        'GR':'en','HR':'en','TH':'en','VN':'en','KR':'en','AL':'en','IS':'en','SI':'en',
        'HU':'en','ME':'en','MT':'en','PE':'en','CO':'en','NZ':'en'}

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

# Two endpoints, alternated, because spreading load across both is good manners and costs
# nothing.
#
# THE PER-MINUTE RULE WAS NEVER WIKIDATA'S. The comment that stood here said the outage rule
# is one request per minute enforced per host, on a measurement that two requests to one host
# a second apart gave 200 then 429. That measurement was real and its CAUSE was misread: it
# was made with urllib, which speaks HTTP/1.1 to this endpoint, and Wikimedia's limiter reads
# the connection rather than the request. Re-run on 2026-10-08 with curl over HTTP/2 - THREE
# consecutive requests to query.wikidata.org, the same host, one second apart, all HTTP 200,
# 5,388 bindings each, 20 to 28 seconds apiece. Same query, same host, same second spacing.
#
# What that cost: a 62-second per-host gap on every request made the Wikidata truncation
# refetch impractical, so the largest single closure path in 1M-GAP-TO-TARGET.csv - 46,763
# rows - carried the status REFETCH RATE-LIMITED for days, blocked by a client library rather
# than by any limit Wikidata applies. The 20 to 28 seconds a band query genuinely takes is
# query COST and is left alone; only the invented wait is gone.
#
# PAUSE stays non-zero deliberately. The experiment proves three requests a second apart are
# served; it does not prove a thousand are, and the 429 retry below is kept untouched.
ENDPOINTS = ['https://query-main.wikidata.org/sparql',
             'https://query.wikidata.org/sparql']
_last = {e: 0.0 for e in ENDPOINTS}
# seconds a single host waits between its own requests. Was 62, on a misread limiter.
PAUSE = float(os.environ.get('WD_HOST_PAUSE', '2.0'))
_turn = [0]
CAP = 10000


def ask(q, timeout=180):
    """One SPARQL query, routed to whichever endpoint has waited longest."""
    for attempt in range(8):
        ep = ENDPOINTS[_turn[0] % len(ENDPOINTS)]
        _turn[0] += 1
        gap = PAUSE - (time.time() - _last[ep])
        if gap > 0:
            time.sleep(gap)
        try:
            with tempfile.NamedTemporaryFile('w', suffix='.rq', delete=False) as tf:
                tf.write(q)
                qp = tf.name
            try:
                _last[ep] = time.time()
                r = subprocess.run(
                    ['curl', '-sS', '--compressed', '--http2',
                     '--max-time', str(timeout),
                     '-A', 'LivdarCandidateInventory/1.0 (offline research inventory)',
                     '-H', 'Accept: application/sparql-results+json',
                     '--data-urlencode', 'query@' + qp, '--data', 'format=json',
                     '-w', '\n%{http_code}', ep],
                    capture_output=True, text=True)
            finally:
                os.unlink(qp)
            if r.returncode != 0:
                raise RuntimeError(f'curl exit {r.returncode}: {r.stderr[:160]}')
            body, _, code = r.stdout.rpartition('\n')
            code = (code or '').strip()
            if code == '429':
                print(f'    429 from {ep}, attempt {attempt + 1}', flush=True)
                time.sleep(20 * (attempt + 1))
                continue
            if code != '200':
                raise RuntimeError(f'http {code} from {ep}')
            return json.loads(body)['results']['bindings']
        except Exception as e:
            _last[ep] = time.time()
            print(f'    ask failed on {ep}: {type(e).__name__}: {str(e)[:120]}', flush=True)
            time.sleep(5 * (attempt + 1))
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

# Pairs that already have a file are REFETCHES, and a refetch exists because the pair was
# large enough to hit the result cap, which is exactly what makes it slow: many bands, each
# costing a minute or more under the per-host rate limit. Put them last.
#
# Clearing park_US's done-mark to force its refetch put the single most expensive pair at the
# front of the queue, and 135 pairs that could each finish in one or two requests sat behind
# it for nineteen minutes while it produced nothing but band splits. The queue order decided
# how much got done, and I had it backwards. Cheap, unstarted pairs first; known-expensive
# refetches with the time that is left.
def _is_refetch(pair):
    _qid, cname, _cq, iso = pair
    return os.path.exists(f'{OUT}wd-{cname}-{iso}.jsonl.gz')

PAIRS.sort(key=_is_refetch)
print(f'queue order: {sum(1 for p in PAIRS if not _is_refetch(p))} unstarted pairs first, '
      f'then {sum(1 for p in PAIRS if _is_refetch(p))} refetches',
      flush=True)
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
        # Start whole, and let the split handle the expensive case. Pre-splitting into eight
        # opening bands was belt added to braces and it cost 8x on every pair that needed one
        # request: most class and country pairs hold tens or hundreds of entities and answer
        # a global band immediately. With 135 such pairs queued at roughly 31 seconds a
        # request, the pre-split turned about ninety minutes of work into nine hours and
        # produced nothing in the first few minutes. Since a band that does not answer is now
        # split anyway, one global band is self-correcting: a small pair costs one request, a
        # large one costs a single wasted request before it subdivides.
        queue = [(-90.0, 90.0, 0)]
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
        time.sleep(float(os.environ.get('WD_CLASS_PAUSE', '2.0')))
print(f'\nTOTAL materialised: {total:,}')
print('by class:', dict(stats.most_common()))

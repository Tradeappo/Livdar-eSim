#!/usr/bin/env python3
"""The same enrichment as wikidata-outdoor-facts.py, read from the Action API instead of WDQS.

WHY A SECOND READER FOR THE SAME FACTS.

wikidata-outdoor-facts.py asks the Wikidata Query Service for twelve properties over a VALUES
block of qids. It works and its output is the file this one appends to, so the two are
interchangeable and either can resume the other's work. But WDQS rate-limits per IP on query
COST, and a 220-value block carrying twelve OPTIONAL clauses is an expensive query. Measured on
2026-10-08: 240 qids took 285 seconds and drew seven HTTP 429s, and the whole 52,585 projected
to about five hours. The Action API answers the same question for fifty entities a call at a
flat cost, because it is a document fetch rather than a graph query.

WHAT IS IDENTICAL, so the two readers cannot disagree:
  - the same twelve properties, imported from the SPARQL script rather than restated here
  - the same output path, the same row shape, the same licence string
  - the same resume rule: a qid already in the file is not fetched again
  - the same gate downstream. This supplies a FACT to features that pass notability and fail
    the fact test. A feature with no fact after this is still refused.

WHAT DIFFERS, and it is only the reading of a value:
  - a quantity arrives as {'amount': '+1823', 'unit': '.../Q11573'}; wdt: in SPARQL returns the
    bare number in the item's own unit, so amount is the same value and the unit is recorded
  - a time arrives as {'time': '+1180-01-01T00:00:00Z'}; the year is the fact a reader came for,
    exactly as the SPARQL script takes v[:4]
  - an item-valued property arrives as a qid, which is what the SPARQL script kept for operator
  - PREFERRED RANK WINS. The API hands back every statement including deprecated and disputed
    ones; wdt: in SPARQL returns only the best rank. So this reader filters to the best rank
    itself, or it would write a number WDQS would not have written.
"""
import gzip, json, os, subprocess, sys, time, urllib.parse, urllib.error, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# The property table is NOT restated. It is imported from the SPARQL reader, so the two cannot
# drift apart: changing one property changes both readers or neither.
import importlib.util
_spec = importlib.util.spec_from_file_location(
    'wd_sparql', os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              'wikidata-outdoor-facts.py'))
_mod = importlib.util.module_from_spec(_spec)
_mod.__name__ = 'wd_sparql'          # keeps its __main__ guard shut
_spec.loader.exec_module(_mod)
PROPS = _mod.PROPS
PROP_KEY = {p: k for p, k in PROPS}

OUT = os.environ.get('WD_OUT') or (ROOT + 'data/atlas/sources/osm-outdoor/_wikidata-facts.jsonl.gz')
QIDS_IN = os.environ.get('WD_QIDS', '/tmp/enrich-qids.txt')
API = 'https://www.wikidata.org/w/api.php'
BATCH = int(os.environ.get('WD_BATCH', '50'))        # the API's own limit for anonymous callers
PAUSE = float(os.environ.get('WD_PAUSE', '0.2'))
LICENCE = 'Wikidata (CC0 1.0, public domain dedication)'


def fetch(ids):
    """Fetched with curl, and the reason is measured rather than stylistic.

    Python's urllib speaks HTTP/1.1 to this endpoint and Wikimedia answers it 429 Too Many
    Requests on the FIRST call of a session, with nothing else of mine running. curl, over
    HTTP/2, answers 200 on the identical URL with the identical User-Agent. Tested on
    2026-10-08 against action=wbgetentities&ids=Q42: urllib 429 with and without
    Accept-Encoding, curl 200. The rate limiter is reading the connection, not the request, so
    the fix belongs in the transport.
    """
    q = urllib.parse.urlencode({'action': 'wbgetentities', 'ids': '|'.join(ids),
                                'props': 'claims', 'format': 'json', 'formatversion': '2',
                                'maxlag': '5'})
    r = subprocess.run(['curl', '-sS', '--compressed', '--http2', '--max-time', '120',
                        '-A', 'livdar-atlas/1.0 (atlas@livdar)',
                        '-H', 'Accept: application/json',
                        '-w', '\n%{http_code}', API + '?' + q],
                       capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f'curl exit {r.returncode}: {r.stderr[:160]}')
    body, _, code = r.stdout.rpartition('\n')
    code = (code or '').strip()
    if code != '200':
        raise urllib.error.HTTPError(API, int(code or 0), 'http ' + code, None, None)
    return json.loads(body)


def value_of(prop, claims):
    """The best-rank value of one property, read the way wdt: reads it.

    Returns (value, unit) or (None, None). Rank order is preferred then normal; deprecated is
    never returned, because wdt: would not have returned it either.
    """
    best = None
    for st in claims.get(prop) or ():
        if st.get('rank') == 'deprecated':
            continue
        if best is None or (st.get('rank') == 'preferred' and best.get('rank') != 'preferred'):
            best = st
    if best is None:
        return None, None
    dv = ((best.get('mainsnak') or {}).get('datavalue') or {})
    v, t = dv.get('value'), dv.get('type')
    if v is None:
        return None, None
    if t == 'quantity':
        amt = str(v.get('amount') or '').lstrip('+')
        unit = (v.get('unit') or '').rsplit('/', 1)[-1]
        try: return round(float(amt), 3), (unit if unit and unit != '1' else None)
        except ValueError: return None, None
    if t == 'time':
        s = str(v.get('time') or '')
        # the year is the fact a reader came for, and a BCE year keeps its sign
        neg = s.startswith('-')
        y = s.lstrip('+-')[:4]
        return (('-' + y) if neg else y), None
    if t == 'wikibase-entityid':
        return v.get('id'), None
    if t == 'string':
        return v, None
    if t == 'monolingualtext':
        return v.get('text'), None
    return None, None


def main():
    qids = [q.strip() for q in open(QIDS_IN) if q.strip()]
    print(f'{len(qids):,} qids to enrich, batches of {BATCH} via the Action API', file=sys.stderr)
    done = set()
    if os.path.exists(OUT):
        try:
            for l in gzip.open(OUT, 'rt', encoding='utf-8'):
                try: done.add(json.loads(l)['qid'])
                except Exception: pass
        except Exception:
            pass
        print(f'resuming: {len(done):,} already fetched', file=sys.stderr)
    todo = [q for q in qids if q not in done]
    stats = collections.Counter()
    failed = []
    fh = gzip.open(OUT, 'at', encoding='utf-8')
    t0 = time.time()
    for i in range(0, len(todo), BATCH):
        chunk = todo[i:i + BATCH]
        res = None
        for attempt in range(4):
            try:
                res = fetch(chunk)
                if 'error' in res:                   # maxlag and throttling arrive as errors
                    stats['api_error_' + str((res.get('error') or {}).get('code'))] += 1
                    res = None
                    time.sleep(5 * (attempt + 1)); continue
                break
            except urllib.error.HTTPError as e:
                stats[f'http_{e.code}'] += 1
                time.sleep(5 * (attempt + 1)); res = None
            except Exception as e:
                stats['err_' + type(e).__name__] += 1
                time.sleep(5 * (attempt + 1)); res = None
        if res is None:
            stats['batch_failed'] += 1
            failed.extend(chunk)
            continue
        ents = res.get('entities') or {}
        for qid in chunk:
            e = ents.get(qid) or {}
            if 'missing' in e or 'redirects' in e and not e.get('claims'):
                stats['qid_missing_or_redirected'] += 1
            claims = e.get('claims') or {}
            attr, units = {}, {}
            for prop, key in PROPS:
                if prop not in claims:
                    continue
                v, unit = value_of(prop, claims)
                if v in (None, ''):
                    continue
                attr.setdefault(key, v)
                if unit: units[key] = unit
            if attr:
                stats['enriched'] += 1
                row = {'qid': qid, 'attr': attr, 'source': LICENCE,
                       'properties': {k: p for p, k in PROPS if k in attr}}
                if units: row['units'] = units
                fh.write(json.dumps(row, ensure_ascii=False) + '\n')
            else:
                stats['no_fact_in_wikidata_either'] += 1
        fh.flush()
        n = i + len(chunk)
        el = time.time() - t0
        rate = n / el if el else 0
        eta = (len(todo) - n) / rate / 60 if rate else 0
        print(f'  [{n:,}/{len(todo):,}] enriched {stats["enriched"]:,} '
              f'({rate:.1f} qid/s, eta {eta:.0f} min)', file=sys.stderr, flush=True)
        time.sleep(PAUSE)
    if failed:
        print(f'  retry pass over {len(failed):,} qids', file=sys.stderr, flush=True)
        for i in range(0, len(failed), BATCH):
            chunk = failed[i:i + BATCH]
            try:
                res = fetch(chunk)
            except Exception:
                stats['retry_still_failed'] += 1
                time.sleep(10); continue
            ents = res.get('entities') or {}
            for qid in chunk:
                claims = (ents.get(qid) or {}).get('claims') or {}
                attr, units = {}, {}
                for prop, key in PROPS:
                    if prop in claims:
                        v, unit = value_of(prop, claims)
                        if v not in (None, ''):
                            attr.setdefault(key, v)
                            if unit: units[key] = unit
                if attr:
                    stats['enriched'] += 1
                    row = {'qid': qid, 'attr': attr, 'source': LICENCE,
                           'properties': {k: p for p, k in PROPS if k in attr}}
                    if units: row['units'] = units
                    fh.write(json.dumps(row, ensure_ascii=False) + '\n')
                else:
                    stats['no_fact_in_wikidata_either'] += 1
            fh.flush()
            stats['retry_recovered_batches'] += 1
            time.sleep(PAUSE)
    fh.close()
    print(f'\nenriched {stats["enriched"]:,}; no fact in Wikidata either '
          f'{stats["no_fact_in_wikidata_either"]:,}')
    for k, v in sorted(stats.items()):
        if k not in ('enriched', 'no_fact_in_wikidata_either'): print(f'  {k}: {v}')
    print(f'wrote {OUT}')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Fetch the missing fact for outdoor features that are notable and carry no number.

THE GATE THIS SERVES, and why this is enrichment rather than relaxation.

outdoor-feature-candidates.py admits a feature only when it is NOTABLE (a Wikidata item or a
Wikipedia article) AND carries at least one fact a reader came for: a measurable number, or a
practical detail like a website or opening hours. The 2026-10-07 reject diagnostic counted
40,123 features that pass the notability test and fail the fact test. They are real,
recognised places with nothing on the page but their name.

The gate is right and is not being touched. What is missing is DATA, and for these features
the data exists: every one of them holds a Wikidata item, and Wikidata carries exactly the
numbers the gate asks for. Fetching them supplies the fact. A feature that still has no fact
after this is still refused.

MAPPING, Wikidata property to the OSM attribute key the gate already reads:

  P2044 elevation above sea level   -> ele          the dominant fact for peaks
  P2660 topographic prominence      -> prominence
  P2661 topographic isolation       -> isolation
  P2046 area                        -> area
  P2043 length                      -> length
  P2049 width                       -> width
  P2048 height                      -> height         towers, lighthouses, windmills
  P4511 vertical depth              -> depth          caves
  P571  inception                   -> start_date     castles, archaeological sites
  P1083 maximum capacity            -> capacity
  P856  official website            -> website        practical
  P137  operator                    -> operator      practical

Composition of the target, which is why inception and height matter as much as elevation:
17,229 archaeological sites, 11,525 castles, 8,312 peaks, 3,667 ruins, 2,352 monuments,
2,177 beaches, 1,642 towers, 1,505 lighthouses, 1,217 caves.

PROVENANCE IS CARRIED, not implied. Every value is written with its property, its unit where
Wikidata gives one, and the licence: Wikidata is CC0, so there is no share-alike obligation
and no attribution requirement, but the row still records where the number came from so a page
can say so and a later reader can check it.

Transport: the Wikidata Query Service over SPARQL, in VALUES batches. wbgetentities was tried
first on 2026-10-07 and rate-limited at HTTP 429; WDQS answers and is the documented bulk
route. Batches are small enough to stay inside the service's one-minute query timeout.
"""
import gzip, json, os, sys, time, urllib.parse, urllib.request, urllib.error, collections

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/osm-outdoor/_wikidata-facts.jsonl.gz'
WDQS = 'https://query.wikidata.org/sparql'
BATCH = int(os.environ.get('WD_BATCH', '220'))
PAUSE = float(os.environ.get('WD_PAUSE', '1.2'))
UA = 'livdar-atlas/1.0 (offline SEO inventory research; contact via repository)'

PROPS = [
    ('P2044', 'ele'), ('P2660', 'prominence'), ('P2661', 'isolation'),
    ('P2046', 'area'), ('P2043', 'length'), ('P2049', 'width'), ('P2048', 'height'),
    ('P4511', 'depth'), ('P571', 'start_date'), ('P1083', 'capacity'),
    ('P856', 'website'), ('P137', 'operator'),
]

SELECT = ' '.join(f'?{k}' for _p, k in PROPS)
OPTIONALS = '\n'.join(
    f'  OPTIONAL {{ ?item wdt:{p} ?{k} . }}' for p, k in PROPS)


def query(qids):
    values = ' '.join(f'wd:{q}' for q in qids)
    sparql = f'''SELECT ?item {SELECT} WHERE {{
  VALUES ?item {{ {values} }}
{OPTIONALS}
}}'''
    url = WDQS + '?' + urllib.parse.urlencode({'query': sparql, 'format': 'json'})
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/sparql-results+json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read())


def main():
    qids = [q.strip() for q in open('/tmp/enrich-qids.txt') if q.strip()]
    print(f'{len(qids):,} qids to enrich, batches of {BATCH}', file=sys.stderr)
    done = set()
    if os.path.exists(OUT):
        try:
            for l in gzip.open(OUT, 'rt', encoding='utf-8'):
                try: done.add(json.loads(l)['qid'])
                except Exception: pass
            print(f'resuming: {len(done):,} already fetched', file=sys.stderr)
        except Exception:
            done = set()
    todo = [q for q in qids if q not in done]
    stats = collections.Counter()
    fh = gzip.open(OUT, 'at', encoding='utf-8')
    for i in range(0, len(todo), BATCH):
        chunk = todo[i:i + BATCH]
        for attempt in range(4):
            try:
                res = query(chunk)
                break
            except urllib.error.HTTPError as e:
                stats[f'http_{e.code}'] += 1
                if e.code in (429, 503):
                    time.sleep(10 * (attempt + 1)); continue
                res = None; break
            except Exception as e:
                stats['err_' + type(e).__name__] += 1
                time.sleep(5 * (attempt + 1)); res = None
        else:
            res = None
        if res is None:
            stats['batch_failed'] += 1
            continue
        got = {}
        for b in res.get('results', {}).get('bindings', []):
            qid = b['item']['value'].rsplit('/', 1)[-1]
            facts = got.setdefault(qid, {})
            for _p, k in PROPS:
                if k in b and b[k].get('value') not in (None, ''):
                    v = b[k]['value']
                    if k == 'start_date':
                        v = v[:4]          # the year is the fact a reader came for
                    elif k in ('website', 'operator'):
                        v = v.rsplit('/', 1)[-1] if k == 'operator' else v
                    else:
                        try: v = round(float(v), 3)
                        except ValueError: pass
                    facts.setdefault(k, v)
        for qid in chunk:
            f = got.get(qid) or {}
            if f:
                stats['enriched'] += 1
                fh.write(json.dumps({'qid': qid, 'attr': f,
                                     'source': 'Wikidata (CC0 1.0, public domain dedication)',
                                     'properties': {k: p for p, k in PROPS if k in f}},
                                    ensure_ascii=False) + '\n')
            else:
                stats['no_fact_in_wikidata_either'] += 1
        fh.flush()
        if (i // BATCH) % 10 == 0:
            print(f'  [{i + len(chunk):,}/{len(todo):,}] enriched {stats["enriched"]:,}',
                  file=sys.stderr, flush=True)
        time.sleep(PAUSE)
    fh.close()
    print(f'\nenriched {stats["enriched"]:,}; no fact in Wikidata either '
          f'{stats["no_fact_in_wikidata_either"]:,}')
    for k, v in sorted(stats.items()):
        if k not in ('enriched', 'no_fact_in_wikidata_either'): print(f'  {k}: {v}')
    print(f'wrote {OUT}')


if __name__ == '__main__':
    main()

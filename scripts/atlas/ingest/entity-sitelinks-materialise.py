"""Which Wikipedia languages carry an article about each OSM entity that has a Wikidata item?

The destination axis needs a per-entity, per-language mark, and OpenStreetMap carries two: the
wikipedia tag and the name:xx tags. Both turned out to be thin outside the market countries. The
feature fan-out measured it: of 37,437 outdoor feature candidates, 19,550 carry no name or article
in any language at all, and the Turkish layer rejected 17,121 features for exactly that reason.

But the same layers carry 264,422 distinct Wikidata items, and a Wikidata item resolves to every
Wikipedia that has an article about it through one API call per fifty items. A German Wikipedia
article about Nemrut Dagi is the mark: it is written and maintained by German speakers because
German speakers look it up. The city pass already proved the route; this generalises it from the
64,418 gazetteer cities to every entity in every layer.

It is a PROXY for interest and never a measured volume, and every row built on it says so.

Licences: Wikidata is CC0 1.0, a public domain dedication with no share-alike. The Wikidata ids
themselves come out of OpenStreetMap, which is ODbL 1.0 and already attributed by every row that
uses the OSM layers.

Resumable and polite: one call a second, 30 seconds and up on a 429, and a checkpoint every fifty
batches, because the first city run lost nothing to a 429 storm only because it checkpointed.

Output: data/atlas/sources/wikidata/entity-sitelinks.jsonl.gz, one row per Wikidata item that has
an article in at least one Livdar language.
"""
import collections, glob, gzip, json, os, sys, time
import urllib.error, urllib.parse, urllib.request

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/wikidata/entity-sitelinks.jsonl.gz'
PROV = ROOT + 'data/atlas/sources/wikidata/entity-sitelinks.provenance.json'
API = 'https://www.wikidata.org/w/api.php'
WIKIS = {'dewiki': 'de', 'enwiki': 'en', 'eswiki': 'es', 'frwiki': 'fr', 'itwiki': 'it',
         'jawiki': 'ja', 'nlwiki': 'nl', 'plwiki': 'pl', 'ptwiki': 'pt', 'zhwiki': 'zh'}
LAYERS = [
    ('outdoor', 'data/atlas/sources/osm-outdoor/outdoor-*.jsonl.gz'),
    ('trails', 'data/atlas/sources/osm-trails/trails-*.jsonl.gz'),
    ('places', 'data/atlas/sources/osm-places/places-*.jsonl.gz'),
    ('places_poi', 'data/atlas/sources/osm-poi/places-*.jsonl.gz'),
    ('parents', 'data/atlas/sources/osm-parents/parents-*.jsonl.gz'),
    ('poi', 'data/atlas/sources/osm-poi/poi-*.jsonl.gz'),
]

want = {}
per_layer = collections.Counter()
for label, pat in LAYERS:
    for f in sorted(glob.glob(ROOT + pat)):
        try:
            for line in gzip.open(f, 'rt', encoding='utf-8'):
                line = line.strip()
                if not line:
                    continue
                try:
                    r = json.loads(line)
                except Exception:
                    continue
                q = r.get('qid')
                if q and isinstance(q, str) and q.startswith('Q') and q[1:].isdigit():
                    if q not in want:
                        want[q] = r.get('country')
                        per_layer[label] += 1
        except (EOFError, OSError) as e:
            print(f'  unreadable, skipped: {os.path.basename(f)} ({e})', file=sys.stderr)
print(f'distinct Wikidata items across every layer on disk: {len(want):,}', file=sys.stderr)
print(f'  first seen in: {dict(per_layer.most_common())}', file=sys.stderr)

done = {}
if os.path.exists(OUT):
    try:
        for line in gzip.open(OUT, 'rt', encoding='utf-8'):
            line = line.strip()
            if line:
                r = json.loads(line)
                done[r['qid']] = r
    except (EOFError, OSError):
        pass
print(f'already fetched: {len(done):,}', file=sys.stderr)

todo = [q for q in want if q not in done]
batches = [todo[i:i + 50] for i in range(0, len(todo), 50)]
print(f'to fetch: {len(todo):,} items in {len(batches):,} batches of 50', file=sys.stderr)


def flush():
    with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as w:
        for q in sorted(done):
            w.write(json.dumps(done[q], ensure_ascii=False) + '\n')
    os.replace(OUT + '.tmp', OUT)


sitefilter = '|'.join(WIKIS)
t0 = time.time()
kept = 0
for bi, batch in enumerate(batches):
    url = API + '?' + urllib.parse.urlencode(
        {'action': 'wbgetentities', 'ids': '|'.join(batch), 'props': 'sitelinks',
         'sitefilter': sitefilter, 'format': 'json'})
    data = None
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'livdar-atlas/1.0 (per-entity language mark for destination pages)'})
            with urllib.request.urlopen(req, timeout=90) as r:
                data = json.loads(r.read().decode('utf-8'))
            break
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as e:
            is429 = isinstance(e, urllib.error.HTTPError) and e.code == 429
            if attempt == 4:
                print(f'  batch {bi} failed after 5 attempts: {e}', file=sys.stderr, flush=True)
            else:
                time.sleep((30 * (attempt + 1)) if is429 else (2 ** attempt))
    if data:
        for qid, ent in (data.get('entities') or {}).items():
            if qid not in want:
                continue
            sl = ent.get('sitelinks') or {}
            langs = {lang: sl[wiki].get('title', '')
                     for wiki, lang in WIKIS.items() if wiki in sl}
            # An item with no article in any Livdar language is recorded as empty rather than
            # skipped, so a resume does not ask for it again every time.
            done[qid] = {'qid': qid, 'country': want.get(qid), 'wikipedia_languages': langs}
            if langs:
                kept += 1
    time.sleep(1.0)
    if (bi + 1) % 50 == 0:
        flush()
        el = time.time() - t0
        print(f'  {bi+1:,}/{len(batches):,} batches, {len(done):,} items, {kept:,} with an '
              f'article, {el/60:.1f} min, {(len(batches)-bi-1)*el/max(bi+1,1)/60:.0f} min left',
              file=sys.stderr, flush=True)
flush()

per_lang = collections.Counter()
by_country = collections.Counter()
for r in done.values():
    if r['wikipedia_languages']:
        by_country[r.get('country')] += 1
    for lang in r['wikipedia_languages']:
        per_lang[lang] += 1
print(f'\nwritten {OUT}: {len(done):,} items, '
      f'{sum(1 for r in done.values() if r["wikipedia_languages"]):,} with at least one article',
      file=sys.stderr)
print(f'  per language: {dict(per_lang.most_common())}', file=sys.stderr)
print(f'  top countries: {dict(by_country.most_common(15))}', file=sys.stderr)
json.dump({
  'source': 'Wikidata action API, wbgetentities, sitelinks only',
  'ids_from': 'the Wikidata ids OpenStreetMap carries on the entities in every captured layer',
  'licences': ['Wikidata CC0 1.0, public domain dedication, no share-alike',
               'the ids come from OpenStreetMap, ODbL 1.0, already attributed by every row'],
  'fetched_on': '2026-10-02',
  'items_requested': len(want),
  'items_fetched': len(done),
  'items_with_an_article_in_a_livdar_language':
      sum(1 for r in done.values() if r['wikipedia_languages']),
  'per_language': dict(per_lang.most_common()),
  'why': ('the per-entity, per-language mark the destination axis requires. The two marks '
          'OpenStreetMap carries, the wikipedia tag and name:xx, are thin outside the market '
          'countries: 19,550 of 37,437 outdoor feature candidates carry neither in any language. '
          'A Wikidata item does resolve to every Wikipedia that has an article about it.'),
  'what_it_is_NOT': ('a measurement of search volume. An article is evidence that speakers of a '
                     'language look an entity up, which is a proxy, and every row built on it '
                     'says so in its own uniqueness reason.'),
  'known_limit': 'zhwiki is one Wikipedia for Traditional and Simplified Chinese.',
}, open(PROV, 'w'), ensure_ascii=False, indent=1)
print('provenance written', file=sys.stderr)

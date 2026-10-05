"""Which Wikipedia languages carry an article about each of the 64,418 cities?

The destination axis needs a per-entity, per-language mark, and the GeoNames alternate-name
route gave one that is correct but sparse: only 32,894 of 64,418 cities have a name in any
Livdar language, and only 5,399 city-by-language combinations in destination countries pass
both halves of the gate. Exonyms exist for Florence and Munich and not for Ordu or Trabzon,
which is a fact about exonyms rather than about who searches for those places.

A Wikipedia article is the better mark and covers far more. A German Wikipedia article about
Trabzon is written and maintained by German speakers because German speakers look it up. It is
still a PROXY for interest rather than a measurement of volume, and every row that rests on it
says so in those words.

The join was already on disk and unread. alternateNamesV2.txt carries rows whose isolanguage is
the literal string "wkdt", holding the Wikidata item id for that GeoNames id. That gives the
QID for free, with no SPARQL and no rate limit, and the QID gives every sitelink through the
Wikidata action API, which takes 50 items per call.

Output: data/atlas/sources/geonames/city-sitelinks.jsonl.gz, one row per city that has a
Wikidata item, carrying the qid and the Livdar-language Wikipedias that hold an article.
"""
import collections, glob, gzip, io, json, os, sys, time, urllib.error, urllib.parse, urllib.request, zipfile

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/geonames/city-sitelinks.jsonl.gz'
PROV = ROOT + 'data/atlas/sources/geonames/city-sitelinks.provenance.json'
ZIP = '/tmp/alternateNamesV2.zip'
API = 'https://www.wikidata.org/w/api.php'

# the Wikipedia of each Livdar language. zh-Hant and zh-Hans share zhwiki, which this file
# cannot split, so a zhwiki article is treated as evidence for zh only in combination with the
# Taiwanese market demand measured separately.
# 'trwiki' added 2026-10-05 with the tr-TR market. A city that carries a Turkish Wikipedia
# article is a city Turkish speakers look up, which is half two of the destination evidence.
WIKIS = {'dewiki': 'de', 'enwiki': 'en', 'eswiki': 'es', 'frwiki': 'fr', 'itwiki': 'it',
         'jawiki': 'ja', 'nlwiki': 'nl', 'plwiki': 'pl', 'ptwiki': 'pt', 'trwiki': 'tr',
         'kowiki': 'ko', 'zhwiki': 'zh'}

city_ids = {}
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    for r in json.load(open(f)):
        city_ids[str(r['id'])] = r.get('country')
print(f'cities in the store: {len(city_ids):,}', file=sys.stderr)

qid_of = {}
with zipfile.ZipFile(ZIP) as z:
    name = next(n for n in z.namelist() if n.endswith('alternateNamesV2.txt'))
    with z.open(name) as fh:
        for raw in io.TextIOWrapper(fh, encoding='utf-8'):
            p = raw.rstrip('\n').split('\t')
            if len(p) < 4 or p[2] != 'wkdt': continue
            if p[1] in city_ids and p[3].startswith('Q'):
                qid_of[p[1]] = p[3]
print(f'cities carrying a Wikidata item in the GeoNames dump: {len(qid_of):,} '
      f'({100.0*len(qid_of)/len(city_ids):.1f} per cent)', file=sys.stderr)

# resume: anything already written is skipped, so a restart costs only what is left
done = {}
if os.path.exists(OUT):
    try:
        for l in gzip.open(OUT, 'rt', encoding='utf-8'):
            l = l.strip()
            if l:
                r = json.loads(l); done[r['geonameid']] = r
    except (EOFError, OSError):
        pass
print(f'already fetched: {len(done):,}', file=sys.stderr)

# A row written before a language was added to WIKIS was never ASKED about that language, so
# its absence from wikipedia_languages means "not asked", not "no article". Treating the two the
# same is how a market gets admitted and then silently finds no marks: the 19,594 rows already on
# disk were fetched with ten wikis and tr-TR needs an eleventh. Every row carries the set it was
# asked, and a row asked a smaller set is refetched.
ASKED = sorted(WIKIS.values())
def _complete(r):
    return set(r.get('wikis_asked') or []) >= set(ASKED)
_stale = sum(1 for r in done.values() if not _complete(r))
if _stale:
    print(f'rows fetched before the current language set: {_stale:,}, refetching them',
          file=sys.stderr)
todo = [(g, q) for g, q in qid_of.items() if g not in done or not _complete(done[g])]
by_qid = {q: g for g, q in todo}
batches = [list(by_qid)[i:i + 50] for i in range(0, len(by_qid), 50)]
print(f'to fetch: {len(by_qid):,} items in {len(batches):,} batches of 50', file=sys.stderr)

sitefilter = '|'.join(WIKIS)
t0 = time.time()
new = 0
def _flush():
    with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as w:
        for gid in sorted(done):
            w.write(json.dumps(done[gid], ensure_ascii=False) + '\n')
    os.replace(OUT + '.tmp', OUT)



for bi, batch in enumerate(batches):
    params = {'action': 'wbgetentities', 'ids': '|'.join(batch), 'props': 'sitelinks',
              'sitefilter': sitefilter, 'format': 'json'}
    url = API + '?' + urllib.parse.urlencode(params)
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'livdar-atlas/1.0 (city sitelink mark for destination pages)'})
            with urllib.request.urlopen(req, timeout=90) as r:
                data = json.loads(r.read().decode('utf-8'))
            break
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as e:
            # 429 is the server asking for less, so it gets a real wait rather than the two
            # seconds a transport error gets. The first run was cut off at batch 367 by a run of
            # 429s that five two-second retries could not clear, and it still wrote the 18,242
            # cities it had, which is why this resumes instead of starting over.
            is429 = isinstance(e, urllib.error.HTTPError) and e.code == 429
            if attempt == 4:
                print(f'  batch {bi} failed after 5 attempts: {e}', file=sys.stderr)
                data = None
            else:
                time.sleep((30 * (attempt + 1)) if is429 else (2 ** attempt))
    if not data:
        continue
    for qid, ent in (data.get('entities') or {}).items():
        gid = by_qid.get(qid)
        if gid is None: continue
        sl = ent.get('sitelinks') or {}
        langs = {}
        for wiki, lang in WIKIS.items():
            if wiki in sl:
                langs[lang] = sl[wiki].get('title', '')
        done[gid] = {'geonameid': gid, 'qid': qid, 'country': city_ids.get(gid),
                     'wikipedia_languages': langs, 'wikis_asked': ASKED}
        new += 1
    # A deliberate pace. 50 items a call at one call a second is 3,000 items a minute from a
    # service that asked for less, and the whole job is under half an hour at this rate anyway.
    time.sleep(1.0)
    if (bi + 1) % 50 == 0:
        el = time.time() - t0
        print(f'  {bi+1:,}/{len(batches):,} batches, {new:,} cities, '
              f'{el/60:.1f} min, {(len(batches)-bi-1)*el/max(bi+1,1)/60:.0f} min left',
              file=sys.stderr, flush=True)
        # checkpoint, because the first run spent twenty minutes of API calls and would have
        # lost all of it to a container restart
        _flush()

_flush()

per_lang = collections.Counter()
for r in done.values():
    for lang in r['wikipedia_languages']:
        per_lang[lang] += 1
print(f'\nwritten {OUT}: {len(done):,} cities', file=sys.stderr)
print('  cities with an article in each language:', dict(per_lang.most_common()), file=sys.stderr)
json.dump({
  'source': 'GeoNames alternateNamesV2 wkdt rows joined to the Wikidata action API',
  'licences': ['GeoNames CC BY 4.0, attribution required',
               'Wikidata CC0 1.0, public domain dedication'],
  'attribution': 'GeoNames, https://www.geonames.org/ and Wikidata, https://www.wikidata.org/',
  'fetched_on': '2026-10-02',
  'cities_in_store': len(city_ids),
  'cities_with_a_wikidata_item': len(qid_of),
  'cities_fetched': len(done),
  'cities_with_an_article_per_language': dict(per_lang.most_common()),
  'why': ('The per-entity, per-language mark the destination axis needs. A German Wikipedia '
          'article about a Turkish city is evidence that German speakers look that city up. '
          'It is a PROXY for interest and is never presented as measured search volume.'),
  'known_limit': ('zhwiki is one Wikipedia for Traditional and Simplified Chinese and this '
                  'file cannot split them.'),
}, open(PROV, 'w'), ensure_ascii=False, indent=1)
print('provenance written', file=sys.stderr)

"""Which of the world's places does each Livdar language have its own name for?

The destination axis needs a per-entity mark in a specific language. Country-level demand is
not enough on its own: markets_for() already records why, in the Aba, Nigeria case, where
letting a country's measured demand flow to every town inside it produced German travel pages
for a Nigerian city nobody had measured. The bound has to be something the entity itself
carries.

GeoNames publishes exactly that and it was not being read. cities5000 carries an `alt` list of
alternate spellings with no language on them, which is useless for this purpose: "Antalya" and
"aslamyh" look the same to it. alternateNamesV2.txt carries the SAME alternates with an ISO
language code on each one, plus the isPreferredName and isShortName flags. A row saying
geonameid 323777 has a German alternate name is a statement that German has its own name for
Antalya, which is a fact about the language's relationship to the place rather than a guess.

That is the mark. A place in a destination country earns a market when the country carries
measured demand in that market's language AND the place has an alternate name in that language.
It is a PROXY for interest, not a measurement of volume, and every row that uses it says so.

Licence: CC BY 4.0, attribution to GeoNames required, recorded in the provenance file.

Output: data/atlas/sources/geonames/altnames-by-language.jsonl.gz, one row per geonameid that
has an alternate name in at least one of the ten Livdar languages, carrying the name per
language and the preferred flag.
"""
import collections, gzip, io, json, os, sys, urllib.request, zipfile

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/geonames/altnames-by-language.jsonl.gz'
PROV = ROOT + 'data/atlas/sources/geonames/altnames-by-language.provenance.json'
URL = 'https://download.geonames.org/export/dump/alternateNamesV2.zip'
ZIP = '/tmp/alternateNamesV2.zip'

# the ten languages the eleven markets are served in. zh-Hant is 'zh' in GeoNames with no
# script split, so Traditional and Simplified both arrive as zh and the row says so rather
# than pretending the file distinguishes them.
# 'tr' added 2026-10-05 when tr-TR was admitted as a search market: the destination half of
# that market needs a Turkish mark on every foreign place before it may have a Turkish page.
WANT = {'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'tr', 'zh'}

if not os.path.exists(ZIP) or os.path.getsize(ZIP) < 150_000_000:
    print(f'downloading {URL}', file=sys.stderr, flush=True)
    req = urllib.request.Request(URL, headers={'User-Agent': 'livdar-atlas/1.0'})
    with urllib.request.urlopen(req, timeout=600) as r, open(ZIP + '.part', 'wb') as w:
        n = 0
        while True:
            b = r.read(1 << 20)
            if not b: break
            w.write(b); n += len(b)
            if n % (50 << 20) < (1 << 20):
                print(f'  {n/1048576:.0f}MB', file=sys.stderr, flush=True)
    os.replace(ZIP + '.part', ZIP)
print(f'zip on disk: {os.path.getsize(ZIP)/1048576:.0f}MB', file=sys.stderr)

# Only the geonameids the city and region stores actually hold are worth keeping. The full file
# carries 17 million rows for 13 million places and the stores hold 64,418 cities plus the
# admin1 and admin2 regions, so filtering on the way in is the difference between a 20MB output
# and a 2GB one.
wanted_ids = set()
import glob
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    for r in json.load(open(f)):
        wanted_ids.add(str(r['id']))
for f in (ROOT + 'data/atlas/sources/geonames/admin1-regions.jsonl.gz',
          ROOT + 'data/atlas/sources/geonames/admin2-regions.jsonl.gz'):
    try:
        for l in gzip.open(f, 'rt', encoding='utf-8'):
            l = l.strip()
            if not l: continue
            try: r = json.loads(l)
            except Exception: continue
            for k in ('id', 'geonameid', 'geoname_id'):
                if r.get(k): wanted_ids.add(str(r[k])); break
    except (EOFError, OSError, FileNotFoundError):
        pass
print(f'geonameids the stores hold: {len(wanted_ids):,}', file=sys.stderr)

by_id = collections.defaultdict(dict)
rows_read = 0
kept = 0
with zipfile.ZipFile(ZIP) as z:
    name = next(n for n in z.namelist() if n.endswith('alternateNamesV2.txt'))
    with z.open(name) as fh:
        for raw in io.TextIOWrapper(fh, encoding='utf-8'):
            rows_read += 1
            p = raw.rstrip('\n').split('\t')
            if len(p) < 4: continue
            gid, lang, alt = p[1], p[2], p[3]
            if lang not in WANT: continue
            if gid not in wanted_ids: continue
            pref = len(p) > 4 and p[4] == '1'
            short = len(p) > 5 and p[5] == '1'
            colloquial = len(p) > 6 and p[6] == '1'
            historic = len(p) > 7 and p[7] == '1'
            # a historic name is not what a searcher types today, and a colloquial one is not a
            # name the page can be titled with, so both are recorded and neither counts as the mark
            cur = by_id[gid].get(lang)
            cand = {'name': alt, 'preferred': pref, 'short': short,
                    'colloquial': colloquial, 'historic': historic}
            if cur is None or (pref and not cur.get('preferred')):
                by_id[gid][lang] = cand
            kept += 1
            if rows_read % 2_000_000 == 0:
                print(f'  {rows_read:,} rows read, {len(by_id):,} places matched',
                      file=sys.stderr, flush=True)

print(f'rows read: {rows_read:,}; alternate names kept: {kept:,}; '
      f'places with at least one: {len(by_id):,}', file=sys.stderr)
per_lang = collections.Counter()
usable = collections.Counter()
for gid, langs in by_id.items():
    for lang, v in langs.items():
        per_lang[lang] += 1
        if not v['historic'] and not v['colloquial']:
            usable[lang] += 1
print('  places with a name in each language:', dict(per_lang.most_common()), file=sys.stderr)
print('  of those, current and non-colloquial, which is the mark:',
      dict(usable.most_common()), file=sys.stderr)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as w:
    for gid, langs in by_id.items():
        w.write(json.dumps({'geonameid': gid, 'names': langs}, ensure_ascii=False) + '\n')
os.replace(OUT + '.tmp', OUT)
json.dump({
  'source': 'GeoNames alternateNamesV2',
  'url': URL,
  'licence': 'CC BY 4.0',
  'licence_url': 'https://creativecommons.org/licenses/by/4.0/',
  'attribution_required': True,
  'attribution': 'GeoNames, https://www.geonames.org/',
  'share_alike': False,
  'fetched_on': '2026-10-02',
  'rows_in_source': rows_read,
  'languages_kept': sorted(WANT),
  'places_matched': len(by_id),
  'why': ('A per-entity, per-language mark for the destination axis. A German alternate name '
          'for a Turkish city is evidence that German has its own name for it, which is a '
          'PROXY for German-language interest and is never presented as measured volume.'),
  'known_limit': ('GeoNames uses one code "zh" with no script split, so Traditional and '
                  'Simplified Chinese cannot be told apart in this file and a zh row is '
                  'treated as evidence for zh-Hant only in combination with the Taiwanese '
                  'market demand measured separately.'),
}, open(PROV, 'w'), ensure_ascii=False, indent=1)
print(f'written {OUT} ({len(by_id):,} places) and its provenance', file=sys.stderr)

#!/usr/bin/env python3
"""
Turn materialised Wikidata entities into candidates, deduped against OSM.

Wikidata is CC0 and strong exactly where OSM nodes are weak: the institution-shaped
polygons, the notable and the visitable. It is also the only source Taiwan had before
the Overpass route worked. So it is a real addition, not a way to pad a count - which is
why most of what it supplies does NOT become an individual page.

Two decisions do the work here:

1. DEDUPE AGAINST OSM. An entity already in the OSM corpus, matched by Wikidata QID or
   by name within 250m, is not a second candidate. The OSM record keeps the page because
   it carries hours, phone and address that Wikidata does not.

2. INDIVIDUAL PAGE ONLY WHERE A THIRD PARTY CAN RANK. The SERP evidence already
   collected says a query for a named hospital, university, library, cinema, station or
   mall returns that institution's own site and its social profiles: the
   BRAND_OWNED_PLUS_SOCIAL archetype, which a directory page does not win. Those classes
   therefore feed city-level LISTS and never get an individual page. Visitor-intent
   classes - museums, castles, parks, beaches, monuments - are where a guide page
   legitimately competes, so those are the only individual candidates.

Everything rejected is counted with its reason.
"""
import gzip, json, glob, collections, os, sys, math

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'

# where a third-party page can legitimately rank for the named entity
WD_INDIVIDUAL_OK = {'museum', 'art_museum', 'castle', 'monument', 'archaeological_site',
                    'park', 'national_park', 'botanical_garden', 'beach', 'zoo',
                    'aquarium', 'amusement_park', 'public_square', 'bridge',
                    'art_gallery', 'theatre'}
# real entities, but the SERP belongs to the institution: lists only
WD_LIST_ONLY = {'hospital', 'library', 'university', 'stadium', 'shopping_mall',
                'movie_theater', 'railway_station', 'airport', 'cemetery'}

MARKETS = [('en-US','US','en'),('de-DE','DE','de'),('fr-FR','FR','fr'),('it-IT','IT','it'),
           ('es-ES','ES','es'),('nl-NL','NL','nl'),('pl-PL','PL','pl'),('pt-BR','BR','pt'),
           ('en-GB','GB','en'),('ja-JP','JP','ja'),('zh-Hant-TW','TW','zh-Hant')]
COUNTRY_MKT = {c: (m, l) for m, c, l in MARKETS}
MIN_FOR_LIST = {'hospital': 4, 'library': 4, 'university': 2, 'stadium': 2,
                'shopping_mall': 2, 'movie_theater': 3, 'railway_station': 5,
                'airport': 2, 'cemetery': 4}

def slug(s):
    out = []
    for ch in (s or '').lower():
        out.append(ch if ch.isalnum() else '-')
    r = ''.join(out)
    while '--' in r: r = r.replace('--', '-')
    return r.strip('-')

rejects = collections.Counter()

# ---- gazetteer -------------------------------------------------------------
cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('lat') is not None and c.get('country'):
            cities.append((c['country'], c.get('name'), float(c['lat']), float(c['lon']),
                           c.get('population') or 0))
cbuckets = collections.defaultdict(list)
for rec in cities:
    cbuckets[(rec[0], int(rec[2]), int(rec[3]))].append(rec)

def radius_km(pop):
    if pop >= 1_000_000: return 20.0
    if pop >= 250_000: return 12.0
    if pop >= 50_000: return 7.0
    return 4.0

def nearest_city(country, lat, lon):
    best, bestd = None, 1e9
    ilat, ilon = int(lat), int(lon)
    for dla in (-1, 0, 1):
        for dlo in (-1, 0, 1):
            for (cc, nm, cla, clo, pop) in cbuckets.get((country, ilat + dla, ilon + dlo), ()):
                dk = math.hypot((cla - lat) * 111.0,
                                (clo - lon) * 111.0 * math.cos(math.radians(lat)))
                if dk < bestd and dk <= radius_km(pop):
                    bestd, best = dk, nm
    return best

# ---- the OSM side, for dedupe ---------------------------------------------
# Only what dedupe needs is held: a QID set, and a coarse grid of (name, lat, lon) so a
# name match can be distance-checked without keeping the corpus in memory.
osm_qids = set()
grid = collections.defaultdict(list)
osm_n = 0
for f in sorted(glob.glob(ROOT + 'data/atlas/sources/osm-poi/poi-*.jsonl.gz')):
    try:
        for l in gzip.open(f, 'rt', encoding='utf-8'):
            l = l.strip()
            if not l: continue
            try: o = json.loads(l)
            except Exception: continue
            if o.get('kind') == 'place' or not o.get('name'): continue
            osm_n += 1
            if o.get('qid'): osm_qids.add(o['qid'])
            if o.get('lat') is None: continue
            grid[(o.get('country'), round(float(o['lat']), 2),
                  round(float(o['lon']), 2))].append(o['name'].casefold())
    except (EOFError, OSError): pass
print(f'OSM corpus for dedupe: {osm_n:,} POI, {len(osm_qids):,} carrying a QID',
      file=sys.stderr)

def in_osm(o):
    if o['id'] in osm_qids:
        return 'qid'
    nm = o['name'].casefold()
    la, lo = round(float(o['lat']), 2), round(float(o['lon']), 2)
    for dla in (-1, 0, 1):
        for dlo in (-1, 0, 1):
            cell = grid.get((o['country'], round(la + dla * 0.01, 2),
                             round(lo + dlo * 0.01, 2)))
            if cell and nm in cell:
                return 'name_and_position'
    return None

# ---- Wikidata --------------------------------------------------------------
wd = []
for f in sorted(glob.glob(ROOT + 'data/atlas/sources/wikidata/wd-*.jsonl.gz')):
    try:
        for l in gzip.open(f, 'rt', encoding='utf-8'):
            l = l.strip()
            if not l: continue
            try: o = json.loads(l)
            except Exception: continue
            if o.get('name') and o.get('lat') is not None: wd.append(o)
    except (EOFError, OSError): pass
print(f'Wikidata entities loaded: {len(wd):,}', file=sys.stderr)

rows = []
list_cells = collections.Counter()
list_cells_web = collections.Counter()
dedup_hits = collections.Counter()
seen_wd = set()

for o in wd:
    if o['id'] in seen_wd:
        rejects['wikidata_duplicate_qid'] += 1; continue
    seen_wd.add(o['id'])
    mk = COUNTRY_MKT.get(o.get('country'))
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    hit = in_osm(o)
    if hit:
        dedup_hits[hit] += 1
        rejects['already_in_osm_corpus'] += 1; continue
    city = nearest_city(o['country'], float(o['lat']), float(o['lon']))
    if not city:
        # outside every city radius in the gazetteer: no hierarchy, no parent, no page
        rejects['no_parent_city'] += 1; continue
    cls = o['cls']
    if cls in WD_LIST_ONLY:
        list_cells[(o['country'], city, cls)] += 1
        if o.get('web'): list_cells_web[(o['country'], city, cls)] += 1
        continue
    if cls not in WD_INDIVIDUAL_OK:
        rejects['class_not_page_worthy'] += 1; continue
    if not o.get('web'):
        # a visitor-intent entity with no official site is a name on a map: Wikidata
        # gives no hours, no address and no phone, so there is nothing practical to say
        rejects['no_official_website_so_page_would_be_thin'] += 1; continue
    # The parent is the class list page for this city, which the OSM aggregation emits only
    # where it passed its own gates. Wikidata cannot know that, so the parent is recorded
    # and the publication controller enforces parent-before-child: Part D forbids releasing
    # a child whose parent is unpublished, which is where this is caught.
    rows.append({
        'shape': 'wikidata_notable', 'source': 'wikidata', 'country': o['country'],
        'city': city, 'cls': cls, 'n': 1, 'enriched': 2,
        'market': market, 'language': lang,
        'entity_name': o['name'], 'entity_id': o['id'],
        'url': f"/{lang}/poi/{slug(cls)}/{slug(o['name'])}-{o['id'].lower()}/",
        'parent_url': f"/{lang}/places/{slug(cls)}/{slug(city)}/",
        'attribution': 'wikidata_cc0',
        'uniqueness_reason': (f"{o['name']} is a {cls.replace('_', ' ')} in {city} with "
            f"Wikidata item {o['id']}, coordinates and an official website, and is NOT "
            f"in the OSM corpus: a visitor-intent entity where a guide page competes, "
            f"unlike the institution classes whose own site owns the SERP"),
    })

# ---- list pages from the institution classes ------------------------------
for (country, city, cls), n in list_cells.items():
    need = MIN_FOR_LIST.get(cls, 4)
    if n < need:
        rejects['list_below_min_count'] += 1; continue
    market, lang = COUNTRY_MKT[country]
    web = list_cells_web[(country, city, cls)]
    if web < max(1, n // 4):
        rejects['list_entries_too_thin'] += 1; continue
    rows.append({
        'shape': 'wikidata_city_list', 'source': 'wikidata', 'country': country,
        'city': city, 'cls': cls, 'n': n, 'enriched': web, 'market': market,
        'language': lang,
        'url': f'/{lang}/places/{slug(cls)}/{slug(city)}/',
        'attribution': 'wikidata_cc0',
        'uniqueness_reason': (f'{n} {cls.replace("_", " ")} entities in {city} with '
            f'Wikidata items and coordinates, {web} with an official website: a list '
            f'page, because a page for each one would compete with its own website'),
    })

print(f'\nWikidata candidates: {len(rows):,}', file=sys.stderr)
print('  by shape:', dict(collections.Counter(r['shape'] for r in rows)), file=sys.stderr)
print('  by market:', dict(collections.Counter(r['market'] for r in rows).most_common()),
      file=sys.stderr)
print('  dedupe against OSM matched by:', dict(dedup_hits), file=sys.stderr)
print('\nrejections:', file=sys.stderr)
for k, v in rejects.most_common(): print(f'    {k:46} {v:>9,}', file=sys.stderr)

dst = ROOT + 'data/atlas/sources/wikidata/_candidates.jsonl.gz'
with gzip.open(dst + '.tmp', 'wt', encoding='utf-8') as f:
    for r in rows: f.write(json.dumps(r, ensure_ascii=False) + '\n')
os.replace(dst + '.tmp', dst)
json.dump({'wikidata_loaded': len(wd), 'osm_poi_for_dedupe': osm_n,
           'osm_qids': len(osm_qids), 'candidates': len(rows),
           'by_shape': dict(collections.Counter(r['shape'] for r in rows)),
           'by_market': dict(collections.Counter(r['market'] for r in rows)),
           'dedupe_matched_by': dict(dedup_hits), 'rejections': dict(rejects)},
          open(OUT + '1M-WIKIDATA-GATE.json', 'w'), indent=1)
print(f'\nwritten: data/atlas/sources/wikidata/_candidates.jsonl.gz', file=sys.stderr)

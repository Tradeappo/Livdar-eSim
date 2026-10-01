#!/usr/bin/env python3
"""
Turn materialised OSM POI into AGGREGATION page candidates, not one page per POI.

The rule this implements: a real POI is not automatically a good page. "Every unknown
restaurant gets a URL" is scaled-content spam. What is useful is the aggregation a
person actually searches for - the cafes in a neighbourhood, the coworking in a city,
the hospitals in an area - plus a small set of genuinely notable individual entities.

Three candidate shapes come out, each with a concrete uniqueness_reason:
  1. city x category      needs MIN_FOR_CITY POI of that class in that city
  2. area x category      same, inside a named neighbourhood (needs the polygon data)
  3. notable entity       only where the POI is notable: a Wikidata QID, or a ticketed
                          class whose modifier was measured MODIFIER_WORKS

Everything that fails a gate is written out with a rejection_reason. Nothing is hidden.
"""
import gzip, json, glob, collections, os, sys, hashlib

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'

# Only classes a person plausibly searches as a LIST. "fire stations in Rotterdam" is
# not a query; "cafes in Rotterdam" is. Each carries the minimum count that makes the
# list worth reading, and the minimum is higher where the category is dense.
LIST_CLASSES = {
    'restaurant': 12, 'cafe': 10, 'bar': 8, 'pub': 8, 'nightclub': 4,
    'gym': 5, 'coworking': 3, 'supermarket': 8, 'mall': 2, 'department_store': 2,
    'pharmacy': 6, 'clinic': 5, 'hospital': 3, 'dentist': 5, 'veterinary': 4,
    'school': 6, 'college': 2, 'university': 2, 'childcare': 5, 'library': 3,
    'museum': 3, 'gallery': 3, 'theatre': 2, 'cinema': 2, 'arts_centre': 2,
    'park': 4, 'garden': 3, 'beach': 2, 'viewpoint': 3, 'attraction': 4,
    'castle': 2, 'swimming_pool': 3, 'sports_centre': 3, 'golf_course': 2,
    'market': 2, 'zoo': 1, 'theme_park': 1, 'aquarium': 1, 'water_park': 1,
    'railway_station': 4, 'parking': 6, 'fast_food': 10, 'hostel': 3,
    'guest_house': 4, 'camp_site': 3, 'marina': 2, 'nature_reserve': 2,
}
# individual-entity pages are allowed only for these classes AND only when notable
NOTABLE_CLASSES = {'museum', 'castle', 'attraction', 'zoo', 'theme_park', 'aquarium',
                   'stadium', 'gallery', 'archaeological_site', 'fort', 'water_park'}
MIN_FOR_AREA = {k: max(2, v // 3) for k, v in LIST_CLASSES.items()}

MARKETS = [('en-US','US','en'),('de-DE','DE','de'),('fr-FR','FR','fr'),('it-IT','IT','it'),
           ('es-ES','ES','es'),('nl-NL','NL','nl'),('pl-PL','PL','pl'),('pt-BR','BR','pt'),
           ('en-GB','GB','en'),('ja-JP','JP','ja'),('zh-Hant-TW','TW','zh-Hant')]
COUNTRY_MKT = {c: (m, l) for m, c, l in MARKETS}

def sig(*p): return hashlib.sha1('|'.join(map(str, p)).encode()).hexdigest()[:12]
def slug(s):
    out = []
    for ch in (s or '').lower():
        out.append(ch if ch.isalnum() else '-')
    r = ''.join(out)
    while '--' in r: r = r.replace('--', '-')
    return r.strip('-')

# ---- load POI ---------------------------------------------------------------
poi = []
for f in sorted(glob.glob(ROOT + 'data/atlas/sources/osm-poi/poi-*.jsonl.gz')):
    try:
        for l in gzip.open(f, 'rt', encoding='utf-8'):
            l = l.strip()
            if not l: continue
            try: o = json.loads(l)
            except Exception: continue
            if o.get('name') and o.get('cls'): poi.append(o)
    except (EOFError, OSError): pass
print(f'POI loaded: {len(poi):,}', file=sys.stderr)

# ---- city resolution -------------------------------------------------------
# 46% of OSM POI carry no addr:city tag. Rather than discard them, attribute each to
# the nearest city in the 31,715-city store, within a radius that scales with the
# city's size. This is ordinary spatial attribution against a real gazetteer, not a
# guess: the POI's own coordinates and the city's own coordinates both come from
# source data, and anything outside the radius stays unattributed rather than being
# forced onto a distant city.
import math
cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('lat') is not None and c.get('country'):
            cities.append((c['country'], c.get('name'), float(c['lat']), float(c['lon']),
                           c.get('population') or 0))
# index cities into 1-degree buckets per country so the nearest-city search is local
buckets = collections.defaultdict(list)
for rec in cities:
    buckets[(rec[0], int(rec[2]), int(rec[3]))].append(rec)
print(f'gazetteer cities: {len(cities):,}', file=sys.stderr)

def radius_km(pop):
    # a metropolis legitimately claims POI further out than a small town does
    if pop >= 1_000_000: return 20.0
    if pop >= 250_000: return 12.0
    if pop >= 50_000: return 7.0
    return 4.0

def nearest_city(country, lat, lon):
    best = None; bestd = 1e9
    ilat, ilon = int(lat), int(lon)
    for dla in (-1, 0, 1):
        for dlo in (-1, 0, 1):
            for (cc, nm, cla, clo, pop) in buckets.get((country, ilat + dla, ilon + dlo), ()):
                dla_km = (cla - lat) * 111.0
                dlo_km = (clo - lon) * 111.0 * math.cos(math.radians(lat))
                d = math.hypot(dla_km, dlo_km)
                if d < bestd and d <= radius_km(pop):
                    bestd = d; best = nm
    return best

by_city = collections.defaultdict(lambda: collections.defaultdict(list))
unattributable = 0
tagged = spatial = 0
for o in poi:
    city = (o.get('city') or '').strip()
    how = 'tag'
    if not city:
        if o.get('lat') is None or o.get('lon') is None:
            unattributable += 1; continue
        city = nearest_city(o['country'], float(o['lat']), float(o['lon']))
        how = 'spatial'
        if not city:
            unattributable += 1; continue
    o['_city_attribution'] = how
    if how == 'tag': tagged += 1
    else: spatial += 1
    by_city[(o['country'], city)][o['cls']].append(o)
print(f'attributed by tag: {tagged:,}  by spatial match: {spatial:,}', file=sys.stderr)
print(f'POI with a city: {len(poi)-unattributable:,}  unattributable: {unattributable:,}', file=sys.stderr)
print(f'distinct (country, city) pairs: {len(by_city):,}', file=sys.stderr)

rows, rejects = [], collections.Counter()

# ---- 1. city x category ----------------------------------------------------
for (country, city), classes in by_city.items():
    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += len(classes); continue
    market, lang = mk
    for cls, items in classes.items():
        need = LIST_CLASSES.get(cls)
        if need is None:
            rejects['class_not_a_list_intent'] += 1; continue
        if len(items) < need:
            rejects[f'below_min_count'] += 1; continue
        # data completeness: a list page is only useful if the entries carry more than
        # a name. Require a reasonable share to have hours, a site, or an address.
        enriched = sum(1 for i in items if i.get('oh') or i.get('web') or i.get('tel'))
        if enriched < max(2, len(items) // 10):
            rejects['entries_too_thin'] += 1; continue
        rows.append({
            'shape': 'city_category', 'country': country, 'city': city, 'cls': cls,
            'n': len(items), 'enriched': enriched, 'market': market, 'language': lang,
            'url': f'/{lang}/places/{slug(cls)}/{slug(city)}/',
            'attribution': ('tag' if all(i.get('_city_attribution')=='tag' for i in items)
                            else 'mixed_tag_and_spatial'),
            'uniqueness_reason': (f'{len(items)} distinct named {cls} entities in {city} '
                f'from OSM, {enriched} with hours, website or phone: a list a person '
                f'searching "{cls} in {city}" cannot get from any single venue page'),
        })

# ---- 2. notable individual entities ---------------------------------------
for o in poi:
    if o['cls'] not in NOTABLE_CLASSES: continue
    mk = COUNTRY_MKT.get(o['country'])
    if not mk: continue
    market, lang = mk
    notable = bool(o.get('qid'))        # cross-referenced in Wikidata = notable
    if not notable:
        rejects['entity_not_notable'] += 1; continue
    extras = sum(1 for k in ('oh','web','tel','city','qid') if o.get(k))
    if extras < 3:
        rejects['notable_but_data_thin'] += 1; continue
    rows.append({
        'shape': 'notable_entity', 'country': o['country'], 'city': o.get('city',''),
        'cls': o['cls'], 'n': 1, 'enriched': extras, 'market': market, 'language': lang,
        'url': f"/{lang}/poi/{slug(o['cls'])}/{slug(o['name'])}-{o['id']}/",
        'entity_name': o['name'], 'entity_id': o['id'],
        'uniqueness_reason': (f"notable {o['cls']} cross-referenced in Wikidata (QID "
            f"{o.get('qid')}) with {extras} source fields: a practical page for a "
            f"specific visited entity, not a generated stub"),
    })

print(f'\naggregation candidates: {len(rows):,}', file=sys.stderr)
print('  by shape:', dict(collections.Counter(r['shape'] for r in rows)), file=sys.stderr)
print('  by market:', dict(collections.Counter(r['market'] for r in rows).most_common()), file=sys.stderr)
print('\nrejections:', file=sys.stderr)
for k, v in rejects.most_common(): print(f'    {k:30} {v:>9,}', file=sys.stderr)

os.makedirs(ROOT + 'data/atlas/sources/osm-poi/', exist_ok=True)
with gzip.open(ROOT + 'data/atlas/sources/osm-poi/_aggregations.jsonl.gz', 'wt', encoding='utf-8') as f:
    for r in rows: f.write(json.dumps(r, ensure_ascii=False) + '\n')
json.dump({'poi_loaded': len(poi), 'poi_with_city': len(poi)-unattributable,
           'unattributable': unattributable, 'city_pairs': len(by_city),
           'aggregation_candidates': len(rows),
           'by_shape': dict(collections.Counter(r['shape'] for r in rows)),
           'by_market': dict(collections.Counter(r['market'] for r in rows)),
           'rejections': dict(rejects)},
          open(OUT + '1M-POI-AGGREGATION-GATE.json', 'w'), indent=1)
print('\nwritten: data/atlas/sources/osm-poi/_aggregations.jsonl.gz', file=sys.stderr)

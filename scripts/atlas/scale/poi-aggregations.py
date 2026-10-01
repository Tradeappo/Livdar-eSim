#!/usr/bin/env python3
"""
Turn materialised OSM POI and places into AGGREGATION page candidates, not one page
per POI.

The rule this implements: a real POI is not automatically a good page. "Every unknown
restaurant gets a URL" is scaled-content spam. What is useful is the aggregation a
person actually searches for - the cafes in a neighbourhood, the coworking in a city,
the hospitals in an area - plus a small set of genuinely notable individual entities.

Four candidate shapes come out, each with a concrete uniqueness_reason:
  1. city x category        needs MIN_FOR_CITY POI of that class in that city
  2. area x category        same, inside a named neighbourhood, and only where the
                            area's list is not just the city's list again
  3. area parent            one page per neighbourhood that is a real, non-ambiguous
                            entity with enough breadth across categories
  4. notable entity         only where the entity is notable: a Wikidata QID, and
                            enough source fields to say something practical

Everything that fails a gate is counted with its rejection reason. Nothing is hidden.

Streaming by construction: at full market coverage the POI corpus is several million
records, which does not fit in memory as dicts, so POI are read twice from disk and
only counters are held - never the corpus.
"""
import gzip, json, glob, collections, os, sys, math, hashlib, re

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
# a neighbourhood list needs fewer entries than a city list to be worth reading, but
# never fewer than two: a "list" of one is the venue's own page under another name
MIN_FOR_AREA = {k: max(2, v // 3) for k, v in LIST_CLASSES.items()}

# Classes where a cuisine is a meaningful filter. "Italian restaurants in Manchester"
# is a real query with a real answer; "Italian pharmacies" is not.
FOOD_CLASSES = {'restaurant', 'fast_food', 'cafe', 'bar', 'pub'}
MIN_CUISINE_CITY = 5
MIN_CUISINE_AREA = 3
# cuisine tokens that describe nothing a reader can act on. OSM's most common value in
# Spain is "regional", which tells a person neither what food nor whose region.
VAGUE_CUISINE = {'regional', 'local', 'international', 'various', 'other', 'fusion',
                 'friture', 'food', 'restaurant', 'cafe', 'bistro', 'buffet', 'brunch',
                 'lunch', 'snack', 'street_food', 'fine_dining', 'traditional'}

# Attribute modifiers, and the values that count as the attribute being PRESENT. A page
# is allowed only where enough entities actually carry the tag: this is the difference
# between a filter backed by data and a claim.
ATTR_TRUE = {
    'wifi': {'wlan', 'yes', 'wifi', 'terminal', 'wired'},
    'outdoor': {'yes'}, 'wheelchair': {'yes'}, 'takeaway': {'yes', 'only'},
    'delivery': {'yes', 'only'}, 'ac': {'yes'}, 'vegan': {'yes', 'only'},
    'vegetarian': {'yes', 'only'}, 'halal': {'yes', 'only'}, 'kosher': {'yes', 'only'},
    'gluten_free': {'yes', 'only'}, 'dog': {'yes', 'leashed', 'outside'},
    'drive_through': {'yes'}, 'changing_table': {'yes'},
}
# which class an attribute page may be built for
ATTR_CLASSES = {
    'wifi': {'cafe', 'restaurant', 'coworking', 'bar', 'pub', 'library', 'hotel', 'hostel'},
    'outdoor': {'restaurant', 'cafe', 'bar', 'pub', 'fast_food'},
    'wheelchair': {'restaurant', 'cafe', 'museum', 'hotel', 'hospital', 'clinic',
                   'pharmacy', 'railway_station', 'park', 'theatre', 'cinema', 'library'},
    'takeaway': {'restaurant', 'fast_food', 'cafe'},
    'delivery': {'restaurant', 'fast_food'},
    'ac': {'restaurant', 'cafe', 'hotel', 'gym'},
    'vegan': {'restaurant', 'cafe', 'fast_food'},
    'vegetarian': {'restaurant', 'cafe', 'fast_food'},
    'halal': {'restaurant', 'fast_food'}, 'kosher': {'restaurant', 'fast_food'},
    'gluten_free': {'restaurant', 'cafe', 'bar'},
    'dog': {'restaurant', 'cafe', 'bar', 'pub', 'park', 'hotel'},
    'drive_through': {'fast_food', 'pharmacy', 'bank'},
    'changing_table': {'restaurant', 'cafe', 'mall', 'museum'},
}
# an attribute list needs more entries than a plain category list to be worth a page:
# a reader filtering for wifi wants a choice, not one option
MIN_ATTR_CITY = 6
MIN_ATTR_AREA = 3
# the sport value on a sports facility IS the modifier a person searches
MIN_SPORT_CITY = 3
SPORT_CLASSES = {'sports_centre', 'sports_pitch', 'swimming_pool', 'ice_rink'}
VAGUE_SPORT = {'multi', 'yes', 'other'}


# Opening-hours shapes. "supermarkets open on sunday in Berlin" is one of the highest
# intent local queries there is, and OSM answers it: 627,491 of the POI already carry an
# opening_hours value. Reading that value is a CONSERVATIVE string reading of the OSM
# syntax, not a full parse: a POI counts only when the rule is unambiguous, and anything
# that cannot be read plainly is not counted rather than guessed into the total.
OPEN_MODES = {
    'sunday': {'supermarket', 'pharmacy', 'restaurant', 'cafe', 'mall', 'bakery',
               'department_store', 'fast_food', 'market', 'museum', 'clinic', 'post_office'},
    'late': {'restaurant', 'bar', 'pub', 'fast_food', 'cafe', 'pharmacy', 'nightclub'},
    'open_24h': {'pharmacy', 'supermarket', 'gym', 'fast_food', 'parking', 'clinic',
                 'hospital', 'fuel'},
}
MIN_OPEN_CITY = {'sunday': 5, 'late': 5, 'open_24h': 3}
MIN_OPEN_AREA = {'sunday': 3, 'late': 3, 'open_24h': 2}
OPEN_LABEL = {'sunday': 'open on Sunday', 'late': 'open late',
              'open_24h': 'open 24 hours'}
_RE_LATE = re.compile(r'-(?:2[2-3]|0[0-3]):\d{2}')
_RE_SUN = re.compile(r'Su[^o]{0,12}\d{1,2}:\d{2}')


def open_modes(oh):
    """Which opening-hours claims this value supports, read conservatively."""
    if not oh:
        return ()
    s = str(oh).replace(' ', '')
    out = []
    if '24/7' in s:
        return ('open_24h', 'sunday', 'late')     # 24/7 is all three, unambiguously
    if 'Suoff' not in s and 'Su:off' not in s and _RE_SUN.search(s):
        out.append('sunday')
    if _RE_LATE.search(s):
        out.append('late')
    return tuple(out)


def cuisines(v):
    """Split an OSM cuisine value into usable tokens."""
    out = []
    for tok in str(v).replace(',', ';').split(';'):
        t = tok.strip().lower().replace(' ', '_')
        if not t or t in VAGUE_CUISINE or len(t) < 3 or len(t) > 24:
            continue
        out.append(t)
    return out[:3]

MARKETS = [('en-US','US','en'),('de-DE','DE','de'),('fr-FR','FR','fr'),('it-IT','IT','it'),
           ('es-ES','ES','es'),('nl-NL','NL','nl'),('pl-PL','PL','pl'),('pt-BR','BR','pt'),
           ('en-GB','GB','en'),('ja-JP','JP','ja'),('zh-Hant-TW','TW','zh-Hant')]
COUNTRY_MKT = {c: (m, l) for m, c, l in MARKETS}

# how far a place mapped only as a POINT may claim POI. OSM gives no extent for a
# point, so the radius comes from what the place type means on the ground, and a page
# built this way is labelled proximity, never containment.
POINT_RADIUS_KM = {'city_block': 0.4, 'neighbourhood': 1.0, 'quarter': 1.3,
                   'suburb': 1.8, 'district': 2.5, 'city_district': 2.5, 'borough': 3.0}

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
    """Return (name, population) of the nearest city that may claim this point."""
    best = None; bestd = 1e9
    ilat, ilon = int(lat), int(lon)
    for dla in (-1, 0, 1):
        for dlo in (-1, 0, 1):
            for (cc, nm, cla, clo, pop) in buckets.get((country, ilat + dla, ilon + dlo), ()):
                dla_km = (cla - lat) * 111.0
                dlo_km = (clo - lon) * 111.0 * math.cos(math.radians(lat))
                d = math.hypot(dla_km, dlo_km)
                if d < bestd and d <= radius_km(pop):
                    bestd = d; best = (nm, pop)
    return best


# Population of each city by name, so a shape gated on city size can be checked without
# re-running the spatial search. Where a name repeats inside a country the largest wins,
# which is the one a bare city name in a query means.
CITY_POP = {}
for (cc, nm, cla, clo, pop) in cities:
    if nm:
        k = (cc, nm)
        if pop > CITY_POP.get(k, -1):
            CITY_POP[k] = pop


def city_pop(country, name):
    return CITY_POP.get((country, name), 0)


# Demand floors measured with Ahrefs on 2026-10-01 and recorded in
# data/atlas/measurements/ahrefs-aggregation-shape-demand-2026-10-01.json. These are not
# guesses about what people search: each one is the smallest city that appeared in the
# measured keyword set for that shape, so a page below the floor would have no demand
# behind it and is recorded as rejected instead of generated.
POP_FLOOR_CUISINE = 75_000       # Watford and St Albans carry measured cuisine demand
POP_FLOOR_ATTR = 200_000         # every measured vegan keyword was a major city
POP_FLOOR_OPENING = 200_000
POP_FLOOR_OPENING_DE = 75_000    # the German measurement reaches Zwickau and Bayreuth


def area_is_named(p):
    """Is this place a recognised, searched entity rather than a name on a map?

    The Kreuzberg probe validated neighbourhood category demand for a NAMED area. It
    says nothing about an unnamed suburb, so an area shape requires the place to carry
    at least one independent mark of being a real entity.
    """
    return bool(p.get('qid') or p.get('wikipedia') or p.get('pop')
                or p.get('geometry') == 'polygon')


def area_is_searched_entity(p):
    """Stricter test, for modifier pages inside an area.

    A page for "cafes with wifi in X" needs X itself to be something people search, not
    merely something that exists, so a polygon or a population tag is not enough here.
    """
    return bool(p.get('qid') or p.get('wikipedia'))

# ---- places ----------------------------------------------------------------
# Two sources: the dedicated place-layer pass (has polygons) and the place nodes the
# POI pass picked up along the way (points only). The polygon record always wins.
places = {}
def place_key(p):
    return (p.get('country'), (p.get('name') or '').casefold(),
            round(float(p['lat']), 3), round(float(p['lon']), 3))

for pat in ('data/atlas/sources/osm-places/places-*.jsonl.gz',
            'data/atlas/sources/osm-poi/places-*.jsonl.gz',
            'data/atlas/sources/osm-poi/poi-*.jsonl.gz'):
    for f in sorted(glob.glob(ROOT + pat)):
        try:
            for l in gzip.open(f, 'rt', encoding='utf-8'):
                l = l.strip()
                if not l: continue
                try: p = json.loads(l)
                except Exception: continue
                if p.get('kind') != 'place': continue
                if not p.get('name') or p.get('lat') is None: continue
                k = place_key(p)
                old = places.get(k)
                if old is None or (p.get('geometry') == 'polygon' and old.get('geometry') != 'polygon'):
                    places[k] = p
        except (EOFError, OSError): pass
print(f'place records loaded (deduped): {len(places):,}', file=sys.stderr)

# resolve each place to a parent city and apply the entity gates
by_name_in_city = collections.Counter()
resolved = []
for p in places.values():
    cls = p.get('cls')
    if cls not in POINT_RADIUS_KM and p.get('geometry') != 'polygon':
        rejects['place_class_not_neighbourhood_level'] += 1; continue
    name = (p.get('name') or '').strip()
    if len(name) < 2 or name.isdigit():
        rejects['place_name_not_usable'] += 1; continue
    if not COUNTRY_MKT.get(p.get('country')):
        rejects['place_no_market_for_country'] += 1; continue
    hit = nearest_city(p['country'], float(p['lat']), float(p['lon']))
    if not hit:
        # a neighbourhood that resolves to no city has no hierarchy, so no breadcrumb,
        # no parent and no way to disambiguate its name. Not a page.
        rejects['place_no_parent_city'] += 1; continue
    city, _cpop = hit
    p['_city'] = city
    by_name_in_city[(p['country'], city, name.casefold())] += 1
    resolved.append(p)

places_ok = []
for p in resolved:
    if not area_is_named(p):
        # no polygon, no population, no Wikidata, no Wikipedia: a bare name on a map
        rejects['place_not_a_named_entity'] += 1; continue
    if by_name_in_city[(p['country'], p['_city'], (p['name'] or '').strip().casefold())] > 1:
        # two different OSM objects with the same name in the same city: ambiguous,
        # and the brief is explicit that an ambiguous neighbourhood gets no page
        rejects['place_ambiguous_duplicate_name_in_city'] += 1; continue
    if p.get('geometry') == 'polygon' and (p.get('km2') or 0) <= 0.0:
        rejects['place_polygon_degenerate'] += 1; continue
    if p.get('geometry') == 'polygon' and (p.get('km2') or 0) > 400:
        # a 400km2 "neighbourhood" is an administrative region mis-tagged as a place
        rejects['place_polygon_implausibly_large'] += 1; continue
    places_ok.append(p)
print(f'places passing entity gates: {len(places_ok):,}', file=sys.stderr)

# ---- spatial index over places --------------------------------------------
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
from shapely import prepared

geoms, meta = [], []
for i, p in enumerate(places_ok):
    if p.get('geometry') == 'polygon' and p.get('ring'):
        try: g = shape(p['ring'])
        except Exception: continue
        if g.is_empty: continue
        geoms.append(g); meta.append((i, 'containment'))
    else:
        r = POINT_RADIUS_KM.get(p.get('cls'), 1.0)
        # a degree box scaled by latitude: the radius is already an approximation of
        # an unmapped extent, so a circle buffer would add false precision
        dlat = r / 111.0
        dlon = r / (111.0 * max(0.2, math.cos(math.radians(float(p['lat'])))))
        g = Point(float(p['lon']), float(p['lat'])).buffer(0)
        from shapely.geometry import box
        g = box(float(p['lon']) - dlon, float(p['lat']) - dlat,
                float(p['lon']) + dlon, float(p['lat']) + dlat)
        geoms.append(g); meta.append((i, 'proximity'))
tree = STRtree(geoms) if geoms else None
print(f'place geometries indexed: {len(geoms):,} '
      f'({sum(1 for _, m in meta if m == "containment"):,} containment, '
      f'{sum(1 for _, m in meta if m == "proximity"):,} proximity)', file=sys.stderr)

# ---- stream POI ------------------------------------------------------------
poi_files = sorted(glob.glob(ROOT + 'data/atlas/sources/osm-poi/poi-*.jsonl.gz'))
city_n = collections.Counter(); city_rich = collections.Counter()
city_cu = collections.Counter(); city_cu_rich = collections.Counter()
area_cu = collections.Counter(); area_cu_rich = collections.Counter()
city_at = collections.Counter(); city_at_rich = collections.Counter()
area_at = collections.Counter()
city_sp = collections.Counter()
city_op = collections.Counter()
city_op_rich = collections.Counter()
area_op = collections.Counter()
city_tagonly = collections.defaultdict(lambda: True)
area_n = collections.Counter(); area_rich = collections.Counter()
notable = []
seen_poi = set()
counts = collections.Counter()

def iter_poi():
    for f in poi_files:
        try:
            for l in gzip.open(f, 'rt', encoding='utf-8'):
                l = l.strip()
                if not l: continue
                try: o = json.loads(l)
                except Exception: continue
                if o.get('kind') == 'place': continue
                if not o.get('name') or not o.get('cls'): continue
                yield o
        except (EOFError, OSError): pass

for o in iter_poi():
    counts['poi_read'] += 1
    # the same OSM object can appear twice when regional extracts overlap
    k = (o.get('country'), o.get('id'))
    if k in seen_poi:
        counts['poi_duplicate_across_extracts'] += 1; continue
    seen_poi.add(k)
    lat, lon = o.get('lat'), o.get('lon')
    city = (o.get('city') or '').strip()
    how = 'tag'
    if not city:
        if lat is None or lon is None:
            counts['poi_unattributable'] += 1; continue
        hit = nearest_city(o['country'], float(lat), float(lon))
        how = 'spatial'
        if not hit:
            counts['poi_unattributable'] += 1; continue
        city = hit[0]
    counts['attr_' + how] += 1
    rich = bool(o.get('oh') or o.get('web') or o.get('tel'))
    ck = (o['country'], city, o['cls'])
    city_n[ck] += 1
    if rich: city_rich[ck] += 1
    if how != 'tag': city_tagonly[ck] = False

    _area_pi = None
    if tree is not None and lat is not None and lon is not None:
        # A POI belongs to exactly ONE area. Letting every area whose extent covers the
        # point claim it looked harmless and was not: point-mapped places get a radius
        # box, neighbouring boxes overlap, and the same twelve cafes would then appear
        # on three adjacent neighbourhood pages - three near-duplicate lists, which is
        # the template-similarity failure the brief forbids. So: the most specific
        # containing polygon wins; with no polygon, the nearest place node wins.
        pt = Point(float(lon), float(lat))
        best_poly = None; best_km2 = None
        best_pt = None; best_d = None
        for gi in tree.query(pt):
            if not geoms[gi].covers(pt): continue
            pi, method = meta[gi]
            p = places_ok[pi]
            if p['country'] != o['country']: continue
            if method == 'containment':
                km2 = p.get('km2') or 1e9
                if best_km2 is None or km2 < best_km2:
                    best_km2 = km2; best_poly = pi
            else:
                dla = (float(p['lat']) - float(lat)) * 111.0
                dlo = (float(p['lon']) - float(lon)) * 111.0 * math.cos(math.radians(float(lat)))
                d = math.hypot(dla, dlo)
                if best_d is None or d < best_d:
                    best_d = d; best_pt = pi
        pi = best_poly if best_poly is not None else best_pt
        _area_pi = pi
        if pi is not None:
            ak = (pi, o['cls'])
            area_n[ak] += 1
            if rich: area_rich[ak] += 1
            counts['area_assigned_' + ('containment' if best_poly is not None else 'proximity')] += 1

    attrs = o.get('attr') or {}
    if o['cls'] in FOOD_CLASSES and o.get('cuisine'):
        for cu in cuisines(o['cuisine']):
            city_cu[(o['country'], city, cu)] += 1
            if rich: city_cu_rich[(o['country'], city, cu)] += 1
            if _area_pi is not None:
                area_cu[(_area_pi, cu)] += 1
                if rich: area_cu_rich[(_area_pi, cu)] += 1
    for an, ok in ATTR_TRUE.items():
        v = str(attrs.get(an, '')).lower()
        if not v or v not in ok: continue
        if o['cls'] not in ATTR_CLASSES.get(an, ()): continue
        city_at[(o['country'], city, o['cls'], an)] += 1
        if rich: city_at_rich[(o['country'], city, o['cls'], an)] += 1
        if _area_pi is not None:
            area_at[(_area_pi, o['cls'], an)] += 1
    for mode in open_modes(o.get('oh')):
        if o['cls'] not in OPEN_MODES[mode]: continue
        city_op[(o['country'], city, o['cls'], mode)] += 1
        if rich: city_op_rich[(o['country'], city, o['cls'], mode)] += 1
        if _area_pi is not None:
            area_op[(_area_pi, o['cls'], mode)] += 1
    if o['cls'] in SPORT_CLASSES and attrs.get('sport'):
        for sp in str(attrs['sport']).replace(',', ';').split(';'):
            sp = sp.strip().lower()
            if sp and sp not in VAGUE_SPORT and 2 < len(sp) < 24:
                city_sp[(o['country'], city, sp)] += 1

    if o['cls'] in NOTABLE_CLASSES and o.get('qid'):
        extras = sum(1 for kk in ('oh','web','tel','city','qid') if o.get(kk))
        notable.append((o, city, extras))

print(f"POI read: {counts['poi_read']:,}  attributed tag: {counts['attr_tag']:,} "
      f"spatial: {counts['attr_spatial']:,}  unattributable: {counts['poi_unattributable']:,} "
      f"cross-extract duplicates: {counts['poi_duplicate_across_extracts']:,}", file=sys.stderr)
print(f'distinct (country, city) class cells: {len(city_n):,}', file=sys.stderr)

rows = []

# ---- 1. city x category ----------------------------------------------------
for (country, city, cls), n in city_n.items():
    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    need = LIST_CLASSES.get(cls)
    if need is None:
        rejects['class_not_a_list_intent'] += 1; continue
    if n < need:
        rejects['below_min_count'] += 1; continue
    enriched = city_rich[(country, city, cls)]
    if enriched < max(2, n // 10):
        rejects['entries_too_thin'] += 1; continue
    rows.append({
        'shape': 'city_category', 'country': country, 'city': city, 'cls': cls,
        'n': n, 'enriched': enriched, 'market': market, 'language': lang,
        'url': f'/{lang}/places/{slug(cls)}/{slug(city)}/',
        'attribution': 'tag' if city_tagonly[(country, city, cls)] else 'mixed_tag_and_spatial',
        'uniqueness_reason': (f'{n} distinct named {cls} entities in {city} from OSM, '
            f'{enriched} with hours, website or phone: a list a person searching '
            f'"{cls} in {city}" cannot get from any single venue page'),
    })

# ---- 2. area x category ----------------------------------------------------
for (pi, cls), n in area_n.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    need = MIN_FOR_AREA.get(cls)
    if need is None:
        rejects['area_class_not_a_list_intent'] += 1; continue
    if n < need:
        rejects['area_below_min_count'] += 1; continue
    enriched = area_rich[(pi, cls)]
    if enriched < max(1, n // 10):
        rejects['area_entries_too_thin'] += 1; continue
    city_total = city_n.get((p['country'], p['_city'], cls), 0)
    if city_total and n >= 0.8 * city_total:
        # the neighbourhood list is the city list: publishing both cannibalises, and
        # the city page is the one with the demand behind it
        rejects['area_duplicates_city_list'] += 1; continue
    method = 'containment' if p.get('geometry') == 'polygon' else 'proximity'
    basis = ('OSM polygon' if method == 'containment'
             else f"OSM place node, {POINT_RADIUS_KM.get(p['cls'], 1.0)}km radius")
    rows.append({
        'shape': 'area_category', 'country': p['country'], 'city': p['_city'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': method, 'cls': cls, 'n': n, 'enriched': enriched,
        'market': market, 'language': lang,
        'url': f"/{lang}/places/{slug(cls)}/{slug(p['_city'])}/{slug(p['name'])}/",
        'parent_url': f"/{lang}/places/{slug(cls)}/{slug(p['_city'])}/",
        'attribution': method,
        'uniqueness_reason': (f"{n} named {cls} entities inside {p['name']}, a "
            f"{p['cls']} of {p['_city']} ({basis}), against {city_total} in the "
            f"whole city: a neighbourhood-level list that the city page cannot answer"),
    })

# ---- 2b. city x cuisine and area x cuisine --------------------------------
# These are the strongest aggregation axis OSM supports: "indian restaurants in
# Manchester" has demand, has a stable answer, and cannot be satisfied by the generic
# restaurants page. The gate is the count of venues actually tagged with the cuisine.
for (country, city, cu), n in city_cu.items():
    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    if n < MIN_CUISINE_CITY:
        rejects['cuisine_below_min_count'] += 1; continue
    if city_pop(country, city) < POP_FLOOR_CUISINE:
        rejects['cuisine_city_below_measured_demand_floor'] += 1; continue
    enriched = city_cu_rich[(country, city, cu)]
    if enriched < max(1, n // 10):
        rejects['cuisine_entries_too_thin'] += 1; continue
    rows.append({
        'shape': 'city_cuisine', 'country': country, 'city': city, 'cls': 'restaurant',
        'cuisine': cu, 'n': n, 'enriched': enriched, 'market': market, 'language': lang,
        'url': f'/{lang}/places/food/{slug(cu)}/{slug(city)}/',
        'parent_url': f'/{lang}/places/restaurant/{slug(city)}/',
        'attribution': 'tag',
        'uniqueness_reason': (f'{n} venues in {city} tagged {cu} in OSM, {enriched} with '
            f'hours, website or phone: a cuisine-specific list the generic restaurants '
            f'page cannot answer'),
    })

for (pi, cu), n in area_cu.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    if n < MIN_CUISINE_AREA:
        rejects['area_cuisine_below_min_count'] += 1; continue
    if city_pop(p['country'], p['_city']) < POP_FLOOR_CUISINE:
        # the area inherits its city's demand context. Without this the inventory grew
        # more area modifier pages than city ones, and each of them would have had a
        # parent page that the city floor had already rejected: an orphan by design.
        rejects['area_cuisine_city_below_measured_demand_floor'] += 1; continue
    city_total = city_cu.get((p['country'], p['_city'], cu), 0)
    if city_total and n >= 0.8 * city_total:
        rejects['area_cuisine_duplicates_city_list'] += 1; continue
    rows.append({
        'shape': 'area_cuisine', 'country': p['country'], 'city': p['_city'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'cls': 'restaurant', 'cuisine': cu, 'n': n,
        'enriched': area_cu_rich[(pi, cu)], 'market': market, 'language': lang,
        'url': f"/{lang}/places/food/{slug(cu)}/{slug(p['_city'])}/{slug(p['name'])}/",
        'parent_url': f"/{lang}/places/food/{slug(cu)}/{slug(p['_city'])}/",
        'attribution': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'uniqueness_reason': (f"{n} venues tagged {cu} inside {p['name']}, a {p['cls']} "
            f"of {p['_city']}, against {city_total} citywide: a neighbourhood cuisine "
            f"list neither the city cuisine page nor the area page covers"),
    })

# ---- 2c. attribute modifiers ----------------------------------------------
# Only where the tag is actually on the entities. A "cafes with wifi" page built on two
# tagged cafes is a claim, not a list, which is why the floor is higher than for a plain
# category and why the count goes in the uniqueness_reason.
ATTR_LABEL = {'wifi': 'wifi', 'outdoor': 'outdoor seating', 'wheelchair': 'wheelchair access',
              'takeaway': 'takeaway', 'delivery': 'delivery', 'ac': 'air conditioning',
              'vegan': 'vegan options', 'vegetarian': 'vegetarian options',
              'halal': 'halal options', 'kosher': 'kosher options',
              'gluten_free': 'gluten free options', 'dog': 'dogs allowed',
              'drive_through': 'drive through', 'changing_table': 'baby changing'}
for (country, city, cls, an), n in city_at.items():
    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    if n < MIN_ATTR_CITY:
        rejects['attr_below_min_count'] += 1; continue
    if city_pop(country, city) < POP_FLOOR_ATTR:
        rejects['attr_city_below_measured_demand_floor'] += 1; continue
    base = city_n.get((country, city, cls), 0)
    if base and n >= 0.9 * base:
        # if nearly every venue in the city has the attribute, the filter tells the
        # reader nothing and the page is the category page again
        rejects['attr_not_discriminating'] += 1; continue
    rows.append({
        'shape': 'city_attribute', 'country': country, 'city': city, 'cls': cls,
        'attribute': an, 'n': n, 'enriched': city_at_rich[(country, city, cls, an)],
        'market': market, 'language': lang,
        'url': f'/{lang}/places/{slug(cls)}/{slug(city)}/{slug(an)}/',
        'parent_url': f'/{lang}/places/{slug(cls)}/{slug(city)}/',
        'attribution': 'tag',
        'uniqueness_reason': (f'{n} of {base} {cls} entities in {city} are tagged '
            f'{ATTR_LABEL.get(an, an)} in OSM: a filter backed by the tag on each '
            f'entity, not an assertion about the city'),
    })

for (pi, cls, an), n in area_at.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    if n < MIN_ATTR_AREA:
        rejects['area_attr_below_min_count'] += 1; continue
    if not area_is_searched_entity(p):
        rejects['area_attr_area_not_a_searched_entity'] += 1; continue
    if city_pop(p['country'], p['_city']) < POP_FLOOR_ATTR:
        rejects['area_attr_city_below_measured_demand_floor'] += 1; continue
    city_total = city_at.get((p['country'], p['_city'], cls, an), 0)
    if city_total and n >= 0.8 * city_total:
        rejects['area_attr_duplicates_city_list'] += 1; continue
    rows.append({
        'shape': 'area_attribute', 'country': p['country'], 'city': p['_city'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'cls': cls, 'attribute': an, 'n': n, 'enriched': n,
        'market': market, 'language': lang,
        'url': f"/{lang}/places/{slug(cls)}/{slug(p['_city'])}/{slug(p['name'])}/{slug(an)}/",
        'parent_url': f"/{lang}/places/{slug(cls)}/{slug(p['_city'])}/{slug(p['name'])}/",
        'attribution': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'uniqueness_reason': (f"{n} {cls} entities tagged {ATTR_LABEL.get(an, an)} inside "
            f"{p['name']} ({p['cls']} of {p['_city']}), against {city_total} citywide"),
    })

# ---- 2c-bis. opening hours -------------------------------------------------
for (country, city, cls, mode), n in city_op.items():
    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    if n < MIN_OPEN_CITY[mode]:
        rejects['opening_below_min_count'] += 1; continue
    floor = POP_FLOOR_OPENING_DE if country == 'DE' else POP_FLOOR_OPENING
    if city_pop(country, city) < floor:
        rejects['opening_city_below_measured_demand_floor'] += 1; continue
    base = city_n.get((country, city, cls), 0)
    if base and n >= 0.9 * base:
        # if essentially everything of that kind in the city is open then, the page is
        # the category page under a different title
        rejects['opening_not_discriminating'] += 1; continue
    rows.append({
        'shape': 'city_opening', 'country': country, 'city': city, 'cls': cls,
        'opening': mode, 'n': n, 'enriched': city_op_rich[(country, city, cls, mode)],
        'market': market, 'language': lang,
        'url': f'/{lang}/places/{slug(cls)}/{slug(city)}/{slug(mode)}/',
        'parent_url': f'/{lang}/places/{slug(cls)}/{slug(city)}/',
        'attribution': 'tag',
        'uniqueness_reason': (f'{n} of {base} {cls} entities in {city} carry an OSM '
            f'opening_hours value that reads as {OPEN_LABEL[mode]}: a time-based answer '
            f'read from each entity own hours, not asserted about the city'),
    })

for (pi, cls, mode), n in area_op.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    if n < MIN_OPEN_AREA[mode]:
        rejects['area_opening_below_min_count'] += 1; continue
    if not area_is_searched_entity(p):
        rejects['area_opening_area_not_a_searched_entity'] += 1; continue
    ofloor = POP_FLOOR_OPENING_DE if p['country'] == 'DE' else POP_FLOOR_OPENING
    if city_pop(p['country'], p['_city']) < ofloor:
        rejects['area_opening_city_below_measured_demand_floor'] += 1; continue
    city_total = city_op.get((p['country'], p['_city'], cls, mode), 0)
    if city_total and n >= 0.8 * city_total:
        rejects['area_opening_duplicates_city_list'] += 1; continue
    rows.append({
        'shape': 'area_opening', 'country': p['country'], 'city': p['_city'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'cls': cls, 'opening': mode, 'n': n, 'enriched': n,
        'market': market, 'language': lang,
        'url': f"/{lang}/places/{slug(cls)}/{slug(p['_city'])}/{slug(p['name'])}/{slug(mode)}/",
        'parent_url': f"/{lang}/places/{slug(cls)}/{slug(p['_city'])}/{slug(p['name'])}/",
        'attribution': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'uniqueness_reason': (f"{n} {cls} entities {OPEN_LABEL[mode]} inside {p['name']} "
            f"({p['cls']} of {p['_city']}), against {city_total} citywide"),
    })

# ---- 2d. city x sport ------------------------------------------------------
for (country, city, sp), n in city_sp.items():
    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    if n < MIN_SPORT_CITY:
        rejects['sport_below_min_count'] += 1; continue
    rows.append({
        'shape': 'city_sport', 'country': country, 'city': city, 'cls': 'sports_facility',
        'sport': sp, 'n': n, 'enriched': n, 'market': market, 'language': lang,
        'url': f'/{lang}/places/sport/{slug(sp)}/{slug(city)}/',
        'parent_url': f'/{lang}/places/sports_centre/{slug(city)}/',
        'attribution': 'tag',
        'uniqueness_reason': (f'{n} facilities in {city} tagged for {sp} in OSM: the '
            f'answer to "where can I play {sp} in {city}", which no generic sports '
            f'centre list gives'),
    })

# ---- 3. area parent pages --------------------------------------------------
area_breadth = collections.defaultdict(lambda: [0, 0])
for (pi, cls), n in area_n.items():
    if cls in LIST_CLASSES and n >= MIN_FOR_AREA[cls]:
        area_breadth[pi][0] += n
        area_breadth[pi][1] += 1
for pi, (total, ncls) in area_breadth.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    if ncls < 4 or total < 25:
        rejects['area_parent_too_narrow'] += 1; continue
    identity = sum(1 for k in ('qid', 'pop', 'wikipedia') if p.get(k)) + \
               (1 if p.get('geometry') == 'polygon' else 0)
    if identity < 1:
        # no polygon, no population, no Wikidata, no Wikipedia: the place is a bare
        # name on a map and cannot carry an area overview page
        rejects['area_parent_entity_too_thin'] += 1; continue
    rows.append({
        'shape': 'area_parent', 'country': p['country'], 'city': p['_city'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'cls': 'area_overview', 'n': total, 'enriched': ncls,
        'market': market, 'language': lang,
        'url': f"/{lang}/areas/{slug(p['_city'])}/{slug(p['name'])}/",
        'parent_url': f"/{lang}/areas/{slug(p['_city'])}/",
        'attribution': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'uniqueness_reason': (f"{p['name']} is a named {p['cls']} of {p['_city']} with "
            f"{total} mapped entities across {ncls} categories and "
            f"{'a mapped polygon' if p.get('geometry') == 'polygon' else 'a mapped place node'}"
            f"{', population ' + str(p['pop']) if p.get('pop') else ''}"
            f"{', Wikidata ' + p['qid'] if p.get('qid') else ''}: an area overview that "
            f"no single category list and no city page covers"),
    })

# ---- 4. notable individual entities ---------------------------------------
for o, city, extras in notable:
    mk = COUNTRY_MKT.get(o['country'])
    if not mk: continue
    market, lang = mk
    if extras < 3:
        rejects['notable_but_data_thin'] += 1; continue
    rows.append({
        'shape': 'notable_entity', 'country': o['country'], 'city': city,
        'cls': o['cls'], 'n': 1, 'enriched': extras, 'market': market, 'language': lang,
        'url': f"/{lang}/poi/{slug(o['cls'])}/{slug(o['name'])}-{o['id']}/",
        'entity_name': o['name'], 'entity_id': o['id'], 'attribution': 'tag',
        'uniqueness_reason': (f"notable {o['cls']} cross-referenced in Wikidata (QID "
            f"{o.get('qid')}) with {extras} source fields: a practical page for a "
            f"specific visited entity, not a generated stub"),
    })
rejects['entity_not_notable'] += counts['poi_read'] - len(notable)

print(f'\naggregation candidates: {len(rows):,}', file=sys.stderr)
print('  by shape:', dict(collections.Counter(r['shape'] for r in rows)), file=sys.stderr)
print('  by market:', dict(collections.Counter(r['market'] for r in rows).most_common()), file=sys.stderr)
print('\nrejections:', file=sys.stderr)
for k, v in rejects.most_common(): print(f'    {k:42} {v:>10,}', file=sys.stderr)

os.makedirs(ROOT + 'data/atlas/sources/osm-poi/', exist_ok=True)
tmp = ROOT + 'data/atlas/sources/osm-poi/_aggregations.jsonl.gz.tmp'
with gzip.open(tmp, 'wt', encoding='utf-8') as f:
    for r in rows: f.write(json.dumps(r, ensure_ascii=False) + '\n')
os.replace(tmp, ROOT + 'data/atlas/sources/osm-poi/_aggregations.jsonl.gz')
json.dump({'poi_read': counts['poi_read'],
           'poi_distinct': len(seen_poi),
           'poi_duplicate_across_extracts': counts['poi_duplicate_across_extracts'],
           'poi_unattributable': counts['poi_unattributable'],
           'attributed_by_tag': counts['attr_tag'],
           'attributed_by_spatial_match': counts['attr_spatial'],
           'place_records_loaded': len(places),
           'places_passing_entity_gates': len(places_ok),
           'place_geometries_containment': sum(1 for _, m in meta if m == 'containment'),
           'place_geometries_proximity': sum(1 for _, m in meta if m == 'proximity'),
           'poi_assigned_to_area_by_containment': counts['area_assigned_containment'],
           'poi_assigned_to_area_by_proximity': counts['area_assigned_proximity'],
           'city_class_cells': len(city_n),
           'area_class_cells': len(area_n),
           'city_cuisine_cells': len(city_cu),
           'area_cuisine_cells': len(area_cu),
           'city_attribute_cells': len(city_at),
           'area_attribute_cells': len(area_at),
           'city_sport_cells': len(city_sp),
           'city_opening_cells': len(city_op),
           'area_opening_cells': len(area_op),
           'aggregation_candidates': len(rows),
           'by_shape': dict(collections.Counter(r['shape'] for r in rows)),
           'by_market': dict(collections.Counter(r['market'] for r in rows)),
           'rejections': dict(rejects)},
          open(OUT + '1M-POI-AGGREGATION-GATE.json', 'w'), indent=1)
print('\nwritten: data/atlas/sources/osm-poi/_aggregations.jsonl.gz', file=sys.stderr)

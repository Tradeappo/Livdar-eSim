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
import gzip, json, glob, collections, os, sys, math, hashlib, re, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                      # noqa: E402

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'

# One run at a time. This pass takes tens of minutes over five million POI, so it is easy
# to start a second one by accident - a manual run and the pipeline, for instance - and two
# runs writing one output file is the failure this project has already hit twice. The lock
# is a directory because mkdir is atomic; a second run waits for the first rather than
# skipping, so a caller that needs fresh output gets it.
_LOCK = '/tmp/poi_aggregations.lock'
_waited = 0
while True:
    try:
        os.mkdir(_LOCK)
        break
    except FileExistsError:
        if _waited == 0:
            print('another aggregation run holds the lock; waiting for it to finish',
                  file=sys.stderr)
        time.sleep(20)
        _waited += 20
        if _waited > 5400:
            print('lock held for 90 minutes, assuming it is stale and taking it',
                  file=sys.stderr)
            break
import atexit
atexit.register(lambda: os.rmdir(_LOCK) if os.path.isdir(_LOCK) else None)

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


# A cuisine has to be common enough across the whole corpus to be a category a reader
# recognises. "pancake" passed the per-city floor on three venues in one Paris quarter and
# produced a page for a cuisine nobody searches as a cuisine. The floor is measured from
# the corpus rather than guessed from a list, so it adapts as more markets are ingested.
MIN_CUISINE_CORPUS = 400
CUISINE_OK = set()          # filled by a counting pass before any row is emitted


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

# Long dashes come in from OSM, which is entitled to its own spelling: "Core-Columbia" in
# San Diego and "La Alma-Lincoln Park" in Denver are both written with an en dash there, and
# 63 Wikidata venue names carry one too. The project rule is that nothing Livdar renders may
# contain one, so the name is normalised the moment it is read rather than at each of the
# dozen places it is later interpolated into a title, an intent or a uniqueness reason.
# Normalising at the point of use is how 670 of them reached the generated partitions while
# the dash check reported a clean repository: the check could not see inside a .gz, and the
# normalisation was not where the data entered. Every record that was changed carries
# dash_normalised so the capture and the rendered form can still be told apart.
LONG_DASHES = {'\u2010': '-', '\u2011': '-', '\u2012': '-', '\u2013': '-', '\u2014': '-',
               '\u2015': '-', '\u2212': '-', '\ufe58': '-', '\ufe63': '-', '\uff0d': '-'}

def undash(s):
    if not s: return s
    out = s
    for bad, good in LONG_DASHES.items():
        if bad in out: out = out.replace(bad, good)
    return out

def undash_record(r, *fields):
    """Normalise the named fields in place, flagging the record if anything changed."""
    changed = False
    for k in fields:
        v = r.get(k)
        if isinstance(v, str):
            n = undash(v)
            if n != v:
                r[k] = n
                changed = True
    if changed: r['dash_normalised'] = True
    return r

# One slug function for the whole pipeline, in the module that owns identity. This file used
# to carry its own, and the copies disagreed on whether a slash becomes a separator and on
# what an empty result should be, which is how one place can get two paths.
slug = entity_identity.slugify

rejects = collections.Counter()

# ---- gazetteer -------------------------------------------------------------
def radius_km(pop):
    # a metropolis legitimately claims POI further out than a small town does
    if pop >= 1_000_000: return 20.0
    if pop >= 250_000: return 12.0
    if pop >= 50_000: return 7.0
    return 4.0


cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if c and c.get('lat') is not None and c.get('country'):
            cities.append((c['country'], c.get('name'), float(c['lat']), float(c['lon']),
                           c.get('population') or 0, str(c.get('id') or '')))
# A gazetteer "city" that sits inside a much larger city is a QUARTER of it, not a city.
# GeoNames lists Quinze-Vingts with 26,265 people and feature class PPL, and it is the
# 12th arrondissement of Paris; Natahoyo is a district of Gijon. Left as cities they
# produced pages like "pancake restaurants in Faubourg Saint-Antoine, a suburb of
# Quinze-Vingts, against 0 citywide" - a sub-area of a sub-area, with a parent page that
# could not exist. The test is relational, not a name list: a place inside the radius of
# another place at least five times its size is that place's quarter.
_city_by_cell = collections.defaultdict(list)
for rec in cities:
    _city_by_cell[(rec[0], int(rec[2]), int(rec[3]))].append(rec)

SUBAREA_OF = {}
SUBAREA_POP_CEILING = 35_000      # see the note below
for (cc, nm, la, lo, pop, cid) in cities:
    if not nm or pop >= SUBAREA_POP_CEILING:
        # A population ceiling is required, or the test demotes real cities: Yonkers at
        # 200,000 and Newark at 300,000 both sit inside New York's radius and are both
        # less than a fifth of its size, and both are cities people search by name. The
        # places this is meant to catch are small: Quinze-Vingts 26,265, Natahoyo 20,000,
        # Franconia Virginia 18,245. The ceiling is 35,000 rather than 50,000 because Newark,
        # California, at 45,336, was being demoted as a quarter of Fremont, and it is an
        # incorporated city. This heuristic cannot tell an incorporated suburb from a city
        # quarter, so the ceiling is set where the measured false positives stop.
        continue
    best = None
    for dla in (-1, 0, 1):
        for dlo in (-1, 0, 1):
            for (c2, n2, la2, lo2, p2, id2) in _city_by_cell.get((cc, int(la) + dla, int(lo) + dlo), ()):
                if n2 == nm or p2 < max(50_000, pop * 5):
                    continue
                d = math.hypot((la2 - la) * 111.0,
                               (lo2 - lo) * 111.0 * math.cos(math.radians(la)))
                if d <= radius_km(p2) and (best is None or p2 > best[1]):
                    best = (n2, p2)
    if best:
        SUBAREA_OF[cid] = best[0]

# POI attribute to real cities only, so a quarter never becomes the parent of an area
buckets = collections.defaultdict(list)
for rec in cities:
    if rec[5] in SUBAREA_OF:
        continue
    buckets[(rec[0], int(rec[2]), int(rec[3]))].append(rec)
print(f'gazetteer cities: {len(cities):,}; of those {len(SUBAREA_OF):,} sit inside a '
      f'larger city and are treated as its quarters, not as cities', file=sys.stderr)

def nearest_city(country, lat, lon):
    """Return (name, population, id) of the nearest city that may claim this point."""
    best = None; bestd = 1e9
    ilat, ilon = int(lat), int(lon)
    for dla in (-1, 0, 1):
        for dlo in (-1, 0, 1):
            for (cc, nm, cla, clo, pop, cid) in buckets.get((country, ilat + dla, ilon + dlo), ()):
                dla_km = (cla - lat) * 111.0
                dlo_km = (clo - lon) * 111.0 * math.cos(math.radians(lat))
                d = math.hypot(dla_km, dlo_km)
                if d < bestd and d <= radius_km(pop):
                    bestd = d; best = (nm, pop, cid)
    return best


# ---- identity, not names ---------------------------------------------------------------
# The OSM addr:city tag is a STRING, and matching it against the gazetteer by string is a
# name-only join: every Woodstock in the United States was being merged into one page, and
# every Kariya in Japan likewise. That is worse than a duplicate URL, because the counts on
# the page are then the sum of several different towns.
#
# Coordinates settle it. Where a tagged name matches more than one city in the country, the
# nearest candidate to the POI wins, and only when it is close enough to be plausible; a
# tagged name that matches nothing in the gazetteer falls through to spatial attribution,
# which was always the path for untagged POI. Nothing is guessed from the name alone.
BY_NAME = collections.defaultdict(list)
for (cc, nm, cla, clo, pop, cid) in cities:
    if nm:
        BY_NAME[(cc, nm.strip().casefold())].append((cla, clo, pop, cid, nm))

CITY_REC = {}
for (cc, nm, cla, clo, pop, cid) in cities:
    if cid:
        CITY_REC[cid] = {'country': cc, 'name': nm, 'lat': cla, 'lon': clo, 'pop': pop}

name_resolution = collections.Counter()

# The labels and slugs come from the one module both URL builders share, so the manifest and
# this file cannot disagree about which Woodstock is which.
GAZ = entity_identity.load_gazetteer()
CITY_LABEL = {cid: GAZ.label(cid) for cid in GAZ.by_id}
CITY_COUNTRY = {cid: GAZ.by_id[cid]['country'] for cid in GAZ.by_id}
CITY_ADMIN1 = {cid: GAZ.by_id[cid]['admin1'] for cid in GAZ.by_id}
_CITY_SLUGS = None


def city_slug(cid):
    global _CITY_SLUGS
    if _CITY_SLUGS is None:
        _CITY_SLUGS = GAZ.slugs(slug)
    return _CITY_SLUGS.get(str(cid), '')


def city_label(cid):
    return CITY_LABEL.get(str(cid), '')


def resolve_tagged_city(country, name, lat, lon):
    """A tagged city name plus coordinates, to one gazetteer id. '' when it cannot be done."""
    cands = BY_NAME.get((country, (name or '').strip().casefold()))
    if not cands:
        name_resolution['tag_name_not_in_gazetteer'] += 1
        return ''
    if len(cands) == 1:
        name_resolution['tag_name_unique_in_country'] += 1
        return cands[0][3]
    if lat is None or lon is None:
        # several candidates and nothing to choose between them. Guessing would attribute
        # POI to the wrong town, so the POI is left for the spatial path or dropped.
        name_resolution['tag_name_ambiguous_and_no_coordinates'] += 1
        return ''
    best, bestd = '', 1e9
    for (cla, clo, pop, cid, _nm) in cands:
        dla = (cla - float(lat)) * 111.0
        dlo = (clo - float(lon)) * 111.0 * math.cos(math.radians(float(lat)))
        d = math.hypot(dla, dlo)
        if d < bestd:
            bestd, best = d, cid
    if not best:
        return ''
    pop = CITY_REC.get(best, {}).get('pop', 0)
    if bestd > max(radius_km(pop), 25.0):
        # the nearest city of that name is implausibly far away, so the tag is probably not
        # this gazetteer city at all
        name_resolution['tag_name_ambiguous_nearest_too_far'] += 1
        return ''
    name_resolution['tag_name_ambiguous_resolved_by_coordinates'] += 1
    return best


# Population of each city by name, so a shape gated on city size can be checked without
# re-running the spatial search. Where a name repeats inside a country the largest wins,
# which is the one a bare city name in a query means.
CITY_POP = {}
for (cc, nm, cla, clo, pop, cid) in cities:
    if nm:
        k = (cc, nm)
        if pop > CITY_POP.get(k, -1):
            CITY_POP[k] = pop


def city_pop(country, name):
    return CITY_POP.get((country, name), 0)


def city_pop_id(cid):
    """Population by stable id. The name-keyed lookup above took the LARGEST city of a
    repeated name, which was the right answer for a bare query and the wrong one for a
    specific city: it let a small Woodstock inherit a big Woodstock's population and clear a
    floor it does not reach."""
    return (CITY_REC.get(str(cid)) or {}).get('pop', 0)


# Demand floors measured with Ahrefs on 2026-10-01 and recorded in
# data/atlas/measurements/ahrefs-aggregation-shape-demand-2026-10-01.json. These are not
# guesses about what people search: each one is the smallest city that appeared in the
# measured keyword set for that shape, so a page below the floor would have no demand
# behind it and is recorded as rejected instead of generated.
POP_FLOOR_CUISINE = 75_000       # Watford and St Albans carry measured cuisine demand
POP_FLOOR_ATTR = 200_000         # every measured vegan keyword was a major city
POP_FLOOR_OPENING = 200_000
POP_FLOOR_OPENING_DE = 75_000    # the German measurement reaches Zwickau and Bayreuth


# ---- the exclusive POI density mark ----------------------------------------------------------
# Measured 2026-10-02 by scripts/atlas/scale/place-poi-density.py: of 334,319 places failing
# area_is_named(), 16,129 hold twenty or more named POI that NO OTHER PLACE can claim. The
# densest are Republique, Bastille, Opera and Faubourg Saint-Denis, Paris neighbourhoods any
# reader would call real places, rejected only because OSM carries them as a bare node.
#
# The exclusivity is what makes this safe rather than the count. An earlier version of the same
# measurement counted POI within each place's radius and reported 128,216, eight times too many,
# because neighbourhood radii overlap and the same restaurants were counted for Bastille and for
# its neighbour. Pages built on that would have duplicated each other's content. Under exclusive
# assignment every named POI belongs to exactly one place, so no two pages built from this file
# can list the same POI, and the distinctness is a property of the data rather than a check
# bolted on afterwards.
DENSITY_FLOOR = 20
_density = {}
try:
    for _l in gzip.open(ROOT + 'data/atlas/sources/places/poi-density.jsonl.gz', 'rt',
                        encoding='utf-8'):
        _l = _l.strip()
        if not _l: continue
        try: _r = json.loads(_l)
        except Exception: continue
        if (_r.get('exclusive_named_poi') or 0) >= DENSITY_FLOOR:
            _density[(_r.get('country'), _r.get('place_id'))] = _r['exclusive_named_poi']
except (EOFError, OSError, FileNotFoundError, NameError):
    pass
if _density:
    print(f'places carrying the exclusive-POI density mark at {DENSITY_FLOOR} or more: '
          f'{len(_density):,}', file=sys.stderr)


def area_has_density_mark(p):
    """Does this place hold enough EXCLUSIVE named POI to carry a page on its own?"""
    return (p.get('country'), p.get('id')) in _density


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
    # Two decimals is about a kilometre. Three was too strict: a polygon centroid and the
    # place node for the same suburb are routinely more than 100 metres apart, so the same
    # neighbourhood arrived twice, once as a polygon and once as a point, and would have
    # produced two sets of area pages for one place.
    return (p.get('country'), (p.get('name') or '').casefold(),
            round(float(p['lat']), 2), round(float(p['lon']), 2))

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
                undash_record(p, 'name')
                k = place_key(p)
                old = places.get(k)
                if old is None or (p.get('geometry') == 'polygon' and old.get('geometry') != 'polygon'):
                    places[k] = p
        except (EOFError, OSError): pass
# Second pass for the cases a grid key still misses: drop a POINT place when a POLYGON
# place of the same name sits within 3km of it, because that is the same neighbourhood
# mapped twice and the polygon is the better record.
_poly_by_name = collections.defaultdict(list)
for p in places.values():
    if p.get('geometry') == 'polygon':
        _poly_by_name[(p.get('country'), (p.get('name') or '').casefold())].append(p)
_dropped_points = 0
for k in list(places):
    p = places[k]
    if p.get('geometry') == 'polygon':
        continue
    for q in _poly_by_name.get((p.get('country'), (p.get('name') or '').casefold()), ()):
        d = math.hypot((float(q['lat']) - float(p['lat'])) * 111.0,
                       (float(q['lon']) - float(p['lon'])) * 111.0
                       * math.cos(math.radians(float(p['lat']))))
        if d <= 3.0:
            del places[k]
            _dropped_points += 1
            break
print(f'place records loaded (deduped): {len(places):,}; point records dropped because a '
      f'polygon of the same name sits within 3km: {_dropped_points:,}', file=sys.stderr)

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
    _cname, _cpop, _cid = hit
    if not _cid:
        rejects['place_parent_city_has_no_stable_id'] += 1; continue
    # the parent is the city IDENTITY; _city is the label a reader sees, which may carry the
    # region where two cities in this country share a name
    p['_city_id'] = _cid
    p['_city'] = city_label(_cid)
    p['_cslug'] = city_slug(_cid)
    # Keyed on the SLUG, not the casefolded name. Two places in Lille named Bois-Blancs and
    # Bois Blancs are different names and one URL, so a name-space check passed both and the
    # URL collided. This is the same lesson the city slugs needed: the property a URL depends
    # on is slug uniqueness, which is not the same as name uniqueness.
    by_name_in_city[(_cid, slug(name))] += 1
    resolved.append(p)

places_ok = []
for p in resolved:
    if not area_is_named(p) and not area_has_density_mark(p):
        # no polygon, no population, no Wikidata, no Wikipedia, and fewer than twenty named
        # POI it can call its own: a bare name on a map
        rejects['place_not_a_named_entity'] += 1; continue
    if not area_is_named(p):
        # recovered on density alone. Recorded on the place so the candidate rows built from it
        # can say which evidence they rest on rather than leaving a reader to assume a polygon.
        p['_recovered_on_density'] = _density[(p.get('country'), p.get('id'))]
    if by_name_in_city[(p['_city_id'], slug((p['name'] or '').strip()))] > 1:
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
                undash_record(o, 'name')
                yield o
        except (EOFError, OSError): pass

cuisine_corpus = collections.Counter()
for o in iter_poi():
    if o['cls'] in FOOD_CLASSES and o.get('cuisine'):
        for cu in cuisines(o['cuisine']):
            cuisine_corpus[cu] += 1
CUISINE_OK = {c for c, n in cuisine_corpus.items() if n >= MIN_CUISINE_CORPUS}
print(f'cuisine values in the corpus: {len(cuisine_corpus):,}; common enough to carry a '
      f'page (>= {MIN_CUISINE_CORPUS}): {len(CUISINE_OK):,}', file=sys.stderr)

for o in iter_poi():
    counts['poi_read'] += 1
    # the same OSM object can appear twice when regional extracts overlap
    k = (o.get('country'), o.get('id'))
    if k in seen_poi:
        counts['poi_duplicate_across_extracts'] += 1; continue
    seen_poi.add(k)
    lat, lon = o.get('lat'), o.get('lon')
    tagged = (o.get('city') or '').strip()
    how = 'tag'
    cid = ''
    if tagged:
        cid = resolve_tagged_city(o['country'], tagged, lat, lon)
    if not cid:
        # either untagged, or a tag that could not be resolved to one gazetteer city
        if lat is None or lon is None:
            counts['poi_unattributable'] += 1; continue
        hit = nearest_city(o['country'], float(lat), float(lon))
        how = 'spatial'
        if not hit:
            counts['poi_unattributable'] += 1; continue
        cid = hit[2]
        if not cid:
            counts['poi_unattributable'] += 1; continue
    counts['attr_' + how] += 1
    rich = bool(o.get('oh') or o.get('web') or o.get('tel'))
    ck = (cid, o['cls'])
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
            if cu not in CUISINE_OK:
                continue
            city_cu[(cid, cu)] += 1
            if rich: city_cu_rich[(cid, cu)] += 1
            if _area_pi is not None:
                area_cu[(_area_pi, cu)] += 1
                if rich: area_cu_rich[(_area_pi, cu)] += 1
    for an, ok in ATTR_TRUE.items():
        v = str(attrs.get(an, '')).lower()
        if not v or v not in ok: continue
        if o['cls'] not in ATTR_CLASSES.get(an, ()): continue
        city_at[(cid, o['cls'], an)] += 1
        if rich: city_at_rich[(cid, o['cls'], an)] += 1
        if _area_pi is not None:
            area_at[(_area_pi, o['cls'], an)] += 1
    for mode in open_modes(o.get('oh')):
        if o['cls'] not in OPEN_MODES[mode]: continue
        city_op[(cid, o['cls'], mode)] += 1
        if rich: city_op_rich[(cid, o['cls'], mode)] += 1
        if _area_pi is not None:
            area_op[(_area_pi, o['cls'], mode)] += 1
    if o['cls'] in SPORT_CLASSES and attrs.get('sport'):
        for sp in str(attrs['sport']).replace(',', ';').split(';'):
            sp = sp.strip().lower()
            if sp and sp not in VAGUE_SPORT and 2 < len(sp) < 24:
                city_sp[(cid, sp)] += 1

    if o['cls'] in NOTABLE_CLASSES and o.get('qid'):
        extras = sum(1 for kk in ('oh','web','tel','city','qid') if o.get(kk))
        notable.append((o, cid, extras))

print(f"POI read: {counts['poi_read']:,}  attributed tag: {counts['attr_tag']:,} "
      f"spatial: {counts['attr_spatial']:,}  unattributable: {counts['poi_unattributable']:,} "
      f"cross-extract duplicates: {counts['poi_duplicate_across_extracts']:,}", file=sys.stderr)
# What happened to every tagged city name, because the change from name to identity moved
# 350,313 POI into the unattributable bucket and that number needs an explanation rather than
# a shrug. The old code used the OSM addr:city STRING as the city, so a POI tagged with a
# place that is not in the gazetteer at all still produced a city cell, and city_category has
# no population floor to catch it. Those pages were about places the entity store had never
# heard of. They are gone now, and this counter says how many of each kind.
print('tagged city name resolution:', file=sys.stderr)
for k, v in name_resolution.most_common():
    print(f'    {v:>9,}  {k}', file=sys.stderr)
print(f'distinct (city id, class) cells: {len(city_n):,}', file=sys.stderr)

rows = []
# Which city-level pages were actually accepted. An area page whose parent city page was
# rejected is an orphan by construction: the QA pass found 1,193 such area cuisine pages
# and 542 area overviews, each pointing at a parent that does not exist. A city can fail
# while one of its areas passes because the floors differ, so the parent has to be
# checked rather than assumed.
accepted_city = set()
accepted_city_cuisine = set()
accepted_city_attr = set()
accepted_city_open = set()

# ---- 1. city x category ----------------------------------------------------
for (cid, cls), n in city_n.items():
    # country, display label and slug all come from the stable id, so two cities of the
    # same name are two pages and the label tells a reader which is which.
    country = CITY_COUNTRY.get(cid, '')
    city = city_label(cid)
    cslug = city_slug(cid)

    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    need = LIST_CLASSES.get(cls)
    if need is None:
        rejects['class_not_a_list_intent'] += 1; continue
    if n < need:
        rejects['below_min_count'] += 1; continue
    enriched = city_rich[(cid, cls)]
    if enriched < max(2, n // 10):
        rejects['entries_too_thin'] += 1; continue
    rows.append({
        'shape': 'city_category', 'country': country, 'city': city, 'city_id': cid, 'cls': cls,
        'n': n, 'enriched': enriched, 'market': market, 'language': lang,
        'url': f'/{lang}/places/{slug(cls)}/{cslug}/',
        'attribution': 'tag' if city_tagonly[(cid, cls)] else 'mixed_tag_and_spatial',
        'uniqueness_reason': (f'{n} distinct named {cls} entities in {city} from OSM, '
            f'{enriched} with hours, website or phone: a list a person searching '
            f'"{cls} in {city}" cannot get from any single venue page'),
    })
    accepted_city.add((cid, cls))

# ---- 2. area x category ----------------------------------------------------
for (pi, cls), n in area_n.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    need = MIN_FOR_AREA.get(cls)
    if need is None:
        rejects['area_class_not_a_list_intent'] += 1; continue
    if (p['_city_id'], cls) not in accepted_city:
        rejects['area_parent_city_page_not_accepted'] += 1; continue
    if n < need:
        rejects['area_below_min_count'] += 1; continue
    enriched = area_rich[(pi, cls)]
    if enriched < max(1, n // 10):
        rejects['area_entries_too_thin'] += 1; continue
    city_total = city_n.get((p['_city_id'], cls), 0)
    if city_total and n >= 0.8 * city_total:
        # the neighbourhood list is the city list: publishing both cannibalises, and
        # the city page is the one with the demand behind it
        rejects['area_duplicates_city_list'] += 1; continue
    method = 'containment' if p.get('geometry') == 'polygon' else 'proximity'
    basis = ('OSM polygon' if method == 'containment'
             else f"OSM place node, {POINT_RADIUS_KM.get(p['cls'], 1.0)}km radius")
    rows.append({
        'shape': 'area_category', 'country': p['country'], 'city': p['_city'], 'city_id': p['_city_id'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': method, 'cls': cls, 'n': n, 'enriched': enriched,
        'market': market, 'language': lang,
        'url': f"/{lang}/places/{slug(cls)}/{p['_cslug']}/{slug(p['name'])}/",
        'parent_url': f"/{lang}/places/{slug(cls)}/{p['_cslug']}/",
        'attribution': method,
        'uniqueness_reason': (f"{n} named {cls} entities inside {p['name']}, a "
            f"{p['cls']} of {p['_city']} ({basis}), against {city_total} in the "
            f"whole city: a neighbourhood-level list that the city page cannot answer"),
    })

# ---- 2b. city x cuisine and area x cuisine --------------------------------
# These are the strongest aggregation axis OSM supports: "indian restaurants in
# Manchester" has demand, has a stable answer, and cannot be satisfied by the generic
# restaurants page. The gate is the count of venues actually tagged with the cuisine.
for (cid, cu), n in city_cu.items():
    # country, display label and slug all come from the stable id, so two cities of the
    # same name are two pages and the label tells a reader which is which.
    country = CITY_COUNTRY.get(cid, '')
    city = city_label(cid)
    cslug = city_slug(cid)

    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    if n < MIN_CUISINE_CITY:
        rejects['cuisine_below_min_count'] += 1; continue
    if city_pop_id(cid) < POP_FLOOR_CUISINE:
        rejects['cuisine_city_below_measured_demand_floor'] += 1; continue
    if (cid, 'restaurant') not in accepted_city:
        # a cuisine page sits under the city's restaurant list, which has its own gates
        rejects['cuisine_parent_restaurant_list_not_accepted'] += 1; continue
    enriched = city_cu_rich[(cid, cu)]
    if enriched < max(1, n // 10):
        rejects['cuisine_entries_too_thin'] += 1; continue
    rows.append({
        'shape': 'city_cuisine', 'country': country, 'city': city, 'city_id': cid, 'cls': 'restaurant',
        'cuisine': cu, 'n': n, 'enriched': enriched, 'market': market, 'language': lang,
        'url': f'/{lang}/places/food/{slug(cu)}/{cslug}/',
        'parent_url': f'/{lang}/places/restaurant/{cslug}/',
        'attribution': 'tag',
        'uniqueness_reason': (f'{n} venues in {city} tagged {cu} in OSM, {enriched} with '
            f'hours, website or phone: a cuisine-specific list the generic restaurants '
            f'page cannot answer'),
    })
    accepted_city_cuisine.add((cid, cu))

for (pi, cu), n in area_cu.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    if n < MIN_CUISINE_AREA:
        rejects['area_cuisine_below_min_count'] += 1; continue
    if (p['_city_id'], cu) not in accepted_city_cuisine:
        rejects['area_cuisine_parent_page_not_accepted'] += 1; continue
    if city_pop_id(p['_city_id']) < POP_FLOOR_CUISINE:
        # the area inherits its city's demand context. Without this the inventory grew
        # more area modifier pages than city ones, and each of them would have had a
        # parent page that the city floor had already rejected: an orphan by design.
        rejects['area_cuisine_city_below_measured_demand_floor'] += 1; continue
    city_total = city_cu.get((p['_city_id'], cu), 0)
    if city_total and n >= 0.8 * city_total:
        rejects['area_cuisine_duplicates_city_list'] += 1; continue
    rows.append({
        'shape': 'area_cuisine', 'country': p['country'], 'city': p['_city'], 'city_id': p['_city_id'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'cls': 'restaurant', 'cuisine': cu, 'n': n,
        'enriched': area_cu_rich[(pi, cu)], 'market': market, 'language': lang,
        'url': f"/{lang}/places/food/{slug(cu)}/{p['_cslug']}/{slug(p['name'])}/",
        'parent_url': f"/{lang}/places/food/{slug(cu)}/{p['_cslug']}/",
        'attribution': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'uniqueness_reason': (f"{n} venues tagged {cu} inside {p['name']}, a {p['cls']} "
            f"of {p['_city']}, against {city_total} citywide: a neighbourhood cuisine "
            f"list neither the city cuisine page nor the area page covers"),
    })

# Which area category pages were accepted, so an area modifier page can require the page
# it declares as its parent. Gating these on the CITY attribute page was not enough: the
# QA pass still found 54 area attribute and 48 area opening orphans, because their
# parent_url points at the area category page rather than the city one.
accepted_area_cat = {(r['area_id'], r['cls']) for r in rows if r['shape'] == 'area_category'}

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
for (cid, cls, an), n in city_at.items():
    # country, display label and slug all come from the stable id, so two cities of the
    # same name are two pages and the label tells a reader which is which.
    country = CITY_COUNTRY.get(cid, '')
    city = city_label(cid)
    cslug = city_slug(cid)

    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    if n < MIN_ATTR_CITY:
        rejects['attr_below_min_count'] += 1; continue
    if city_pop_id(cid) < POP_FLOOR_ATTR:
        rejects['attr_city_below_measured_demand_floor'] += 1; continue
    if (cid, cls) not in accepted_city:
        # the modifier page hangs off the plain class list, so without it there is nothing
        # on the site linking down to this page
        rejects['attr_parent_city_page_not_accepted'] += 1; continue
    base = city_n.get((cid, cls), 0)
    if base and n >= 0.9 * base:
        # if nearly every venue in the city has the attribute, the filter tells the
        # reader nothing and the page is the category page again
        rejects['attr_not_discriminating'] += 1; continue
    rows.append({
        'shape': 'city_attribute', 'country': country, 'city': city, 'city_id': cid, 'cls': cls,
        'attribute': an, 'n': n, 'enriched': city_at_rich[(cid, cls, an)],
        'market': market, 'language': lang,
        'url': f'/{lang}/places/{slug(cls)}/{cslug}/{slug(an)}/',
        'parent_url': f'/{lang}/places/{slug(cls)}/{cslug}/',
        'attribution': 'tag',
        'uniqueness_reason': (f'{n} of {base} {cls} entities in {city} are tagged '
            f'{ATTR_LABEL.get(an, an)} in OSM: a filter backed by the tag on each '
            f'entity, not an assertion about the city'),
    })
    accepted_city_attr.add((cid, cls, an))

for (pi, cls, an), n in area_at.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    if n < MIN_ATTR_AREA:
        rejects['area_attr_below_min_count'] += 1; continue
    if (p['_city_id'], cls, an) not in accepted_city_attr:
        rejects['area_attr_parent_page_not_accepted'] += 1; continue
    if not area_is_searched_entity(p):
        rejects['area_attr_area_not_a_searched_entity'] += 1; continue
    if city_pop_id(p['_city_id']) < POP_FLOOR_ATTR:
        rejects['area_attr_city_below_measured_demand_floor'] += 1; continue
    if (p['id'], cls) not in accepted_area_cat:
        rejects['area_attr_parent_area_page_not_accepted'] += 1; continue
    city_total = city_at.get((p['_city_id'], cls, an), 0)
    if city_total and n >= 0.8 * city_total:
        rejects['area_attr_duplicates_city_list'] += 1; continue
    rows.append({
        'shape': 'area_attribute', 'country': p['country'], 'city': p['_city'], 'city_id': p['_city_id'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'cls': cls, 'attribute': an, 'n': n, 'enriched': n,
        'market': market, 'language': lang,
        'url': f"/{lang}/places/{slug(cls)}/{p['_cslug']}/{slug(p['name'])}/{slug(an)}/",
        'parent_url': f"/{lang}/places/{slug(cls)}/{p['_cslug']}/{slug(p['name'])}/",
        'attribution': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'uniqueness_reason': (f"{n} {cls} entities tagged {ATTR_LABEL.get(an, an)} inside "
            f"{p['name']} ({p['cls']} of {p['_city']}), against {city_total} citywide"),
    })

# ---- 2c-bis. opening hours -------------------------------------------------
for (cid, cls, mode), n in city_op.items():
    # country, display label and slug all come from the stable id, so two cities of the
    # same name are two pages and the label tells a reader which is which.
    country = CITY_COUNTRY.get(cid, '')
    city = city_label(cid)
    cslug = city_slug(cid)

    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    if n < MIN_OPEN_CITY[mode]:
        rejects['opening_below_min_count'] += 1; continue
    floor = POP_FLOOR_OPENING_DE if country == 'DE' else POP_FLOOR_OPENING
    if city_pop_id(cid) < floor:
        rejects['opening_city_below_measured_demand_floor'] += 1; continue
    if (cid, cls) not in accepted_city:
        rejects['opening_parent_city_page_not_accepted'] += 1; continue
    base = city_n.get((cid, cls), 0)
    if base and n >= 0.9 * base:
        # if essentially everything of that kind in the city is open then, the page is
        # the category page under a different title
        rejects['opening_not_discriminating'] += 1; continue
    rows.append({
        'shape': 'city_opening', 'country': country, 'city': city, 'city_id': cid, 'cls': cls,
        'opening': mode, 'n': n, 'enriched': city_op_rich[(cid, cls, mode)],
        'market': market, 'language': lang,
        'url': f'/{lang}/places/{slug(cls)}/{cslug}/{slug(mode)}/',
        'parent_url': f'/{lang}/places/{slug(cls)}/{cslug}/',
        'attribution': 'tag',
        'uniqueness_reason': (f'{n} of {base} {cls} entities in {city} carry an OSM '
            f'opening_hours value that reads as {OPEN_LABEL[mode]}: a time-based answer '
            f'read from each entity own hours, not asserted about the city'),
    })
    accepted_city_open.add((cid, cls, mode))

for (pi, cls, mode), n in area_op.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    if n < MIN_OPEN_AREA[mode]:
        rejects['area_opening_below_min_count'] += 1; continue
    if (p['_city_id'], cls, mode) not in accepted_city_open:
        rejects['area_opening_parent_page_not_accepted'] += 1; continue
    if not area_is_searched_entity(p):
        rejects['area_opening_area_not_a_searched_entity'] += 1; continue
    ofloor = POP_FLOOR_OPENING_DE if p['country'] == 'DE' else POP_FLOOR_OPENING
    if city_pop_id(p['_city_id']) < ofloor:
        rejects['area_opening_city_below_measured_demand_floor'] += 1; continue
    if (p['id'], cls) not in accepted_area_cat:
        rejects['area_opening_parent_area_page_not_accepted'] += 1; continue
    city_total = city_op.get((p['_city_id'], cls, mode), 0)
    if city_total and n >= 0.8 * city_total:
        rejects['area_opening_duplicates_city_list'] += 1; continue
    rows.append({
        'shape': 'area_opening', 'country': p['country'], 'city': p['_city'], 'city_id': p['_city_id'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'cls': cls, 'opening': mode, 'n': n, 'enriched': n,
        'market': market, 'language': lang,
        'url': f"/{lang}/places/{slug(cls)}/{p['_cslug']}/{slug(p['name'])}/{slug(mode)}/",
        'parent_url': f"/{lang}/places/{slug(cls)}/{p['_cslug']}/{slug(p['name'])}/",
        'attribution': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'uniqueness_reason': (f"{n} {cls} entities {OPEN_LABEL[mode]} inside {p['name']} "
            f"({p['cls']} of {p['_city']}), against {city_total} citywide"),
    })

# ---- 2d. city x sport ------------------------------------------------------
for (cid, sp), n in city_sp.items():
    # country, display label and slug all come from the stable id, so two cities of the
    # same name are two pages and the label tells a reader which is which.
    country = CITY_COUNTRY.get(cid, '')
    city = city_label(cid)
    cslug = city_slug(cid)

    mk = COUNTRY_MKT.get(country)
    if not mk:
        rejects['no_market_for_country'] += 1; continue
    market, lang = mk
    if n < MIN_SPORT_CITY:
        rejects['sport_below_min_count'] += 1; continue
    if (cid, 'sports_centre') not in accepted_city:
        # a sport page sits under the city's sports centre list, which has its own gate
        rejects['sport_parent_city_page_not_accepted'] += 1; continue
    rows.append({
        'shape': 'city_sport', 'country': country, 'city': city, 'city_id': cid, 'cls': 'sports_facility',
        'sport': sp, 'n': n, 'enriched': n, 'market': market, 'language': lang,
        'url': f'/{lang}/places/sport/{slug(sp)}/{cslug}/',
        # slug(), not the raw class key. The city list page for this class lives at
        # slug('sports_centre') which is "sports-centre" with a hyphen, so hardcoding the
        # underscore made every city_sport page declare a parent URL that cannot exist.
        # That was all 37 remaining orphans: the gate above was correct and the string was
        # not, which is why the count looked fine from every angle except the link graph.
        'parent_url': f"/{lang}/places/{slug('sports_centre')}/{cslug}/",
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
areas_in_city = collections.Counter()
for pi, (total, ncls) in area_breadth.items():
    if ncls >= 4 and total >= 25:
        pp = places_ok[pi]
        if COUNTRY_MKT.get(pp['country']):
            areas_in_city[pp['_city_id']] += 1

for pi, (total, ncls) in area_breadth.items():
    p = places_ok[pi]
    mk = COUNTRY_MKT.get(p['country'])
    if not mk: continue
    market, lang = mk
    if ncls < 4 or total < 25:
        rejects['area_parent_too_narrow'] += 1; continue
    if areas_in_city[p['_city_id']] < 3:
        # the city areas hub needs three described neighbourhoods to be a list worth
        # reading, so an overview in a city with fewer has no parent to live under. The QA
        # pass found 864 of these: a page that nothing links down to is not reachable.
        rejects['area_parent_city_has_no_areas_hub'] += 1; continue
    identity = sum(1 for k in ('qid', 'pop', 'wikipedia') if p.get(k)) + \
               (1 if p.get('geometry') == 'polygon' else 0)
    if identity < 1:
        # no polygon, no population, no Wikidata, no Wikipedia: the place is a bare
        # name on a map and cannot carry an area overview page
        rejects['area_parent_entity_too_thin'] += 1; continue
    rows.append({
        'shape': 'area_parent', 'country': p['country'], 'city': p['_city'], 'city_id': p['_city_id'],
        'area': p['name'], 'area_id': p['id'], 'area_class': p['cls'],
        'area_method': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'cls': 'area_overview', 'n': total, 'enriched': ncls,
        'market': market, 'language': lang,
        'url': f"/{lang}/areas/{p['_cslug']}/{slug(p['name'])}/",
        'parent_url': f"/{lang}/areas/{p['_cslug']}/",
        'attribution': 'containment' if p.get('geometry') == 'polygon' else 'proximity',
        'uniqueness_reason': (f"{p['name']} is a named {p['cls']} of {p['_city']} with "
            f"{total} mapped entities across {ncls} categories and "
            f"{'a mapped polygon' if p.get('geometry') == 'polygon' else 'a mapped place node'}"
            f"{', population ' + str(p['pop']) if p.get('pop') else ''}"
            f"{', Wikidata ' + p['qid'] if p.get('qid') else ''}: an area overview that "
            f"no single category list and no city page covers"),
    })

# ---- 3b. the city areas hub ------------------------------------------------
# An area overview page needs somewhere to be listed. Without this hub the QA pass found
# 542 area overviews whose parent URL led nowhere. The hub is a real page in its own
# right - which neighbourhoods a city has and what each is like - and it only exists
# where there are enough area pages to make a list worth reading.
areas_by_city = collections.defaultdict(list)
for r in rows:
    if r['shape'] == 'area_parent':
        areas_by_city[(r['country'], r.get('city_id') or r['city'])].append(r)
for (country, _ckey), lst in areas_by_city.items():
    city = lst[0]['city']
    cid = lst[0].get('city_id') or ''
    cslug = city_slug(cid) if cid else slug(city)
    if len(lst) < 3:
        rejects['areas_hub_too_few_areas'] += 1; continue
    market, lang = COUNTRY_MKT[country]
    named = sum(1 for r in lst if r['area_method'] == 'containment')
    rows.append({
        'shape': 'city_areas_hub', 'country': country, 'city': city, 'city_id': cid,
        'cls': 'areas_index', 'n': len(lst), 'enriched': named,
        'market': market, 'language': lang,
        'url': f'/{lang}/areas/{cslug}/',
        'attribution': 'containment' if named == len(lst) else 'mixed',
        'uniqueness_reason': (f'{len(lst)} named neighbourhoods of {city} that each have '
            f'enough mapped entities to describe, {named} of them with a mapped polygon: '
            f'the index a person comparing areas of {city} needs, and the parent every '
            f'area page links up to'),
    })

# ---- 4. notable individual entities ---------------------------------------
# A notable entity page needs somewhere to be listed. Its natural parent is the city list
# for its own class, which may not have been accepted, and the QA pass found 2,650 such
# orphans. So the parent is resolved against pages that actually exist: the class list
# first, then the city areas hub. An entity with neither has no home on the site and is
# rejected rather than published into nowhere.
hub_cities = {(r['country'], r.get('city_id') or r['city'])
              for r in rows if r['shape'] == 'city_areas_hub'}
for o, _ncid, extras in notable:
    city = city_label(_ncid)
    cslug = city_slug(_ncid)
    mk = COUNTRY_MKT.get(o['country'])
    if not mk: continue
    market, lang = mk
    if extras < 3:
        rejects['notable_but_data_thin'] += 1; continue
    if (_ncid, o['cls']) in accepted_city:
        parent = f"/{lang}/places/{slug(o['cls'])}/{cslug}/"
    elif (o['country'], _ncid) in hub_cities:
        parent = f'/{lang}/areas/{cslug}/'
    else:
        rejects['notable_entity_has_no_parent_page'] += 1; continue
    rows.append({
        'shape': 'notable_entity', 'city_id': _ncid, 'country': o['country'], 'city': city,
        'parent_url': parent,
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

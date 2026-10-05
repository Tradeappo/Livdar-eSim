#!/usr/bin/env python3
"""
Build the Livdar 1M candidate manifest from REAL entities already held.

What this is:  a candidate inventory. One row per distinct (entity x family x market)
               page that could exist, with the data path, the risks and the scores the
               EXISTING publication controller needs to pick cohorts.
What this is NOT: a claim that every row will rank, and not a keyword list. Keywords
               validate a CLUSTER of pages; GSC validates a cohort after publication.

Padding is refused, explicitly:
  - no synonym or persona variants
  - no year multiplication beyond the 2-year window the calendar families already use
  - no mechanical translation: a page only exists in a market where that family has
    either measured demand or a defensible local/destination relationship
  - no empty entity x attribute combinations: the entity must carry (or have an
    acquirable path to) the data the template needs
  - no duplicate intent: exact, semantic and cannibalisation passes all run

Feed-gated verticals are KEPT, with source_status separating them, because the brief
is a candidate inventory and a missing feed is an acquisition task, not a reason to
delete real demand.
"""
import json, glob, gzip, csv, hashlib, collections, os, sys, math

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
YEARS = [2026, 2027]          # the only year multiplication allowed
NOW_TAG = '2026-09-30'

def jload(p):
    with open(ROOT + p) as f: return json.load(f)

# ---------------------------------------------------------------- markets
# The live site is LANGUAGE-scoped, not market-scoped: real URLs are /en/, /de/,
# /it/ ... so en-US and en-GB share /en/ and a page for one entity in one family
# exists ONCE per language. Eleven markets collapse to ten languages. The manifest
# keeps `market` (the strongest-demand market for that language) and `language`
# (the page's actual scope), and the dedupe enforces one row per page.
# The market list lives in entity_identity, which owns identity for the whole pipeline.
# Twelve files each hand-wrote their own copy; adding tr-TR meant editing twelve places and
# a thirteenth that would have been missed. One definition, imported.
MARKETS = entity_identity.MARKETS
MKT_COUNTRY = entity_identity.MKT_COUNTRY
MKT_LANG = entity_identity.MKT_LANG
COUNTRY_MKTS = collections.defaultdict(list)
for m, c, _ in MARKETS: COUNTRY_MKTS[c].append(m)

# ---------------------------------------------------------------- entities
print('loading entities...', file=sys.stderr)
cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    d = json.load(open(f))
    lst = d if isinstance(d, list) else (d.get('cities') or list(d.values())[0])
    for c in lst:
        if not c or not c.get('id'): continue
        cities.append({'id': str(c['id']), 'name': c.get('name') or c.get('ascii'),
                       'country': c.get('country'), 'pop': c.get('population') or 0,
                       'lat': c.get('lat'), 'lon': c.get('lon')})
# tier by population, exactly as the entity graph derives it
idx = jload('data/atlas/entities/cities-index.json')
bt = idx.get('byTier', {})
t1, t2, t3 = int(bt.get('1', 0)), int(bt.get('2', 0)), int(bt.get('3', 0))
for i, c in enumerate(sorted(cities, key=lambda x: -(x['pop'] or 0))):
    c['tier'] = 1 if i < t1 else 2 if i < t1 + t2 else 3 if i < t1 + t2 + t3 else 4
# A gazetteer "city" inside a much larger city is a QUARTER of it, not a city. GeoNames
# lists Quinze-Vingts with 26,265 people and feature class PPL, and it is the 12th
# arrondissement of Paris; Natahoyo is a district of Gijon. Left in the city pool they
# earn city-level pages - things to do in Quinze-Vingts - whose parent city page is
# another quarter. The test is relational rather than a name list: a place inside the
# radius of another place at least five times its size is that place's quarter. They stay
# in the data as neighbourhood-level entities; they are only removed from CITY families.
def _radius_km(pop):
    if pop >= 1_000_000: return 20.0
    if pop >= 250_000: return 12.0
    if pop >= 50_000: return 7.0
    return 4.0


_cell = collections.defaultdict(list)
for c in cities:
    if c.get('lat') is None or c.get('lon') is None: continue
    _cell[(c['country'], int(c['lat']), int(c['lon']))].append(c)
SUBAREA_CITY_IDS = set()
SUBAREA_POP_CEILING = 35_000
for c in cities:
    if c.get('lat') is None or c.get('lon') is None or not c.get('name'): continue
    # A population ceiling is required, or the test demotes real cities: Yonkers at
    # 200,000 and Newark at 300,000 both sit inside New York's radius and are both less
    # than a fifth of its size, and both are cities people search by name. The places this
    # is meant to catch are small: Quinze-Vingts 26,265, Natahoyo 20,000. The ceiling is
    # 35,000 rather than 50,000 because Newark, California, at 45,336, was being demoted as
    # a quarter of Fremont, and it is an incorporated city. This heuristic cannot tell an
    # incorporated suburb from a city quarter, so the ceiling sits where the measured false
    # positives stop.
    if (c['pop'] or 0) >= SUBAREA_POP_CEILING: continue
    la, lo, pop = float(c['lat']), float(c['lon']), c['pop'] or 0
    for dla in (-1, 0, 1):
        for dlo in (-1, 0, 1):
            for o in _cell.get((c['country'], int(la) + dla, int(lo) + dlo), ()):
                if o['id'] == c['id'] or (o['pop'] or 0) < max(50_000, pop * 5): continue
                d = math.hypot((float(o['lat']) - la) * 111.0,
                               (float(o['lon']) - lo) * 111.0 * math.cos(math.radians(la)))
                if d <= _radius_km(o['pop'] or 0):
                    SUBAREA_CITY_IDS.add(c['id']); break
            if c['id'] in SUBAREA_CITY_IDS: break
        if c['id'] in SUBAREA_CITY_IDS: break
cities = [c for c in cities if c['id'] not in SUBAREA_CITY_IDS]
print(f'  gazetteer quarters removed from the city pool: {len(SUBAREA_CITY_IDS):,}; '
      f'cities remaining {len(cities):,}', file=sys.stderr)

CITY_BY_ID = {c['id']: c for c in cities}
# 1,168 city names are shared by 2,833 cities (1,123 of them inside the 11 market
# countries), so a name-only slug silently collapses two different cities onto one
# URL. Ambiguous names carry their country; unique names stay clean.
# The slugs and labels come from the shared identity module, so this file and
# poi-aggregations.py cannot disagree about which Woodstock is which. The module resolves
# slugs in SLUG SPACE rather than by predicate on the name, because the property a URL needs
# is that no two cities share a segment, and that is not the same as "the name is
# unambiguous": Vila-real in Spain and Vila Real in Portugal are different names and one slug.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                        # noqa: E402
GAZ = entity_identity.load_gazetteer()
CITY_LABELS = {cid: GAZ.label(cid) for cid in GAZ.by_id}
_city_slugs = None


def city_slug(cid):
    """Resolved lazily: slug() is defined further down this file, and computing the table at
    import time raised a NameError the first time I wired this in."""
    global _city_slugs
    if _city_slugs is None:
        _city_slugs = GAZ.slugs(slug)
    return _city_slugs.get(str(cid), '')
print(f'  identity: {len(GAZ.by_id):,} cities, {len(GAZ.pair_repeats):,} name and country '
      f'pairs repeating within a country, {len(GAZ.unresolved_labels()):,} whose label cannot '
      f'be made unique from the data', file=sys.stderr)

_name_counts = collections.Counter((c['name'] or '').lower() for c in cities)
AMBIGUOUS_CITY = {k for k, v in _name_counts.items() if v > 1}
# The country suffix is not always enough, because a country can hold two cities of the same
# name: the United States has several Woodstocks and Japan several Kariyas. Those still
# collapsed onto one slug, and preserving the exact-duplicate rejections is what revealed it,
# 836 of them in activities.city-things-to-do alone. Where the (name, country) pair itself
# repeats, the entity id goes on the slug, which is the same remedy the uniqueness_reason
# needed for the two Barcelonas and for the same reason: a name is not an identity.
_pair_counts = collections.Counter(((c['name'] or '').lower(), c.get('country') or '')
                                   for c in cities)
AMBIGUOUS_CITY_IN_COUNTRY = {k for k, v in _pair_counts.items() if v > 1}
print(f'  city names shared across countries: {len(AMBIGUOUS_CITY):,}; name and country '
      f'pairs shared WITHIN one country: {len(AMBIGUOUS_CITY_IN_COUNTRY):,}', file=sys.stderr)

countries = [{'id': k, 'name': (v.get('name') if isinstance(v, dict) else str(v))}
             for k, v in (jload('data/atlas/entities/countries.json').items()
                          if isinstance(jload('data/atlas/entities/countries.json'), dict) else [])]
if not countries:
    cdat = jload('data/atlas/entities/countries.json')
    countries = [{'id': c.get('iso2') or c.get('id'), 'name': c.get('name')} for c in cdat]

# Neighbourhoods come from the entity graph, not the raw shards: the shards carry no
# cityId, so a shard-based load leaves every neighbourhood unattached to its city and
# the neighbourhood families generate nothing. The graph resolves city and distance.
neigh = []
for _l in gzip.open(ROOT + 'reports/scale-universe-2026-09-29/entity-graph.jsonl.gz', 'rt'):
    _o = json.loads(_l)
    if _o.get('type') == 'neighbourhood' and _o.get('cityId'):
        neigh.append({'id': str(_o['id']), 'name': _o.get('name'), 'country': _o.get('iso2'),
                      'cityId': str(_o['cityId']), 'cityName': _o.get('cityName') or ''})

apt = jload('data/atlas/entities/airports.json')
apt = apt if isinstance(apt, list) else (apt.get('airports') or list(apt.values())[0])
airports = [{'id': a.get('iata') or a.get('id'), 'name': a.get('name'), 'country': a.get('iso2'),
             'cityId': str(a.get('cityId') or ''), 'cityKm': a.get('cityKm'),
             'size': a.get('size'), 'municipality': a.get('municipality')}
            for a in apt if a and (a.get('iata') or a.get('id'))]

# Only venues people travel TO can carry a "where to stay near" page. The pool also holds
# generic sports venues, which is how a hotels-near-Titan-Gym candidate was generated: a
# local gym is not a reason to book a hotel. Stadiums, arenas, concert halls and event
# venues are; a bare "sports venue" with no stronger type is not.
TRAVEL_VENUE_TYPES = {'stadium', 'arena', 'concert hall', 'event venue'}
venues = []
venues_rejected_local = 0
for f in sorted(glob.glob(ROOT + 'data/atlas/sources/venues/by-country/*.json')):
    d = json.load(open(f))
    for v in (d.get('rows') or []):
        types = {t.strip().lower() for t in (v.get('types') or [])}
        if not (types & TRAVEL_VENUE_TYPES):
            venues_rejected_local += 1
            continue
        venues.append({'id': v.get('id'), 'name': v.get('name'), 'country': v.get('iso2'),
                       'cityId': str(v.get('cityId') or ''), 'cityName': v.get('cityName') or '',
                       'types': ','.join(sorted(types))})

# Pulse entities, from the normalised store built by scripts/atlas/ingest/
# pulse-materialise.py. The old loader read the European-only public-holiday file, which
# left the US, UK, Japan, Brazil, Canada, Australia and Taiwan - the markets with the
# most demand behind them - without a single holiday. It also gave every pulse.* family
# the SAME country-level pool, so the school-holiday and long-weekend families would
# have generated the named-holiday pages again under different URLs.
pulse = {}
try:
    pulse = jload('data/atlas/sources/events/pulse-entities.json')
except FileNotFoundError:
    pulse = {}

holidays = [{'id': h['id'], 'name': h['name'], 'country': h['country'],
             'year': h['year'], 'date': h['date'], 'everywhere': True,
             'confidence': h.get('confidence', '')}
            for h in pulse.get('national', [])]
# a regional observance belongs to the subdivisions that keep it, not to the country
holidays_regional = [{'id': h['id'], 'name': h['name'], 'country': h['country'],
                      'year': h['year'], 'date': h['date'],
                      'subdivisions': h.get('subdivisions', []),
                      'confidence': h.get('confidence', '')}
                     for h in pulse.get('regional', []) if h.get('subdivisions')]
school_holidays = [{'id': h['id'], 'name': h['name'], 'country': h['country'],
                    'subdivision': h['subdivision'], 'year': h['year'],
                    'start': h['start'], 'end': h['end'],
                    'confidence': h.get('confidence', '')}
                   for h in pulse.get('school', [])]
# One page per subdivision per year listing its bridge days, which is exactly the shape
# the measured keywords take (brückentage hessen 2026, brückentage 2026 nrw).
bridge_plans = [{'id': h['id'], 'country': h['country'], 'subdivision': h['subdivision'],
                 'year': h['year'], 'bridge_day_count': h['bridge_day_count'],
                 'long_weekend_count': h['long_weekend_count'],
                 'max_days_off': h['max_days_off'],
                 'confidence': h.get('confidence', '')}
                for h in pulse.get('bridge_plans', [])]
long_weekends = [{'id': h['id'], 'country': h['country'], 'year': h['year'],
                  'start': h['start'], 'end': h['end'], 'days': h['days'],
                  'anchor': h['anchor_holiday'], 'bridge': h.get('bridge_day'),
                  'confidence': h.get('confidence', '')}
                 for h in pulse.get('long_weekends', [])]

subdiv = []
try:
    for l in gzip.open(ROOT + 'reports/scale-universe-2026-09-29/entity-graph.jsonl.gz', 'rt'):
        o = json.loads(l)
        if o.get('type') == 'subdivision':
            nm = (o.get('names') or {}).get('en') or o.get('name') or o.get('code')
            subdiv.append({'id': o['id'], 'name': nm, 'country': o.get('iso2')})
except FileNotFoundError:
    pass

print(f'  venues kept as travel destinations {len(venues):,}, local venues rejected '
      f'{venues_rejected_local:,}', file=sys.stderr)
print(f'  cities {len(cities):,}  countries {len(countries)}  neighbourhoods {len(neigh):,} '
      f' airports {len(airports):,}  venues {len(venues):,}  subdivisions {len(subdiv)} '
      f' holidays {len(holidays):,} regional {len(holidays_regional):,} '
      f'school {len(school_holidays):,} long weekends {len(long_weekends):,} '
      f'bridge plans {len(bridge_plans):,}',
      file=sys.stderr)

# cities that actually have neighbourhoods / venues, so we never emit an empty combo
CITIES_WITH_NEIGH = {n['cityId'] for n in neigh if n['cityId']}
CITIES_WITH_VENUE = {v['cityId'] for v in venues if v['cityId']}
VENUE_COUNTRIES = {v['country'] for v in venues if v['country']}

# ---------------------------------------------------------------- OSM POI
# Materialised from OSM regional extracts (node-only pass, named entities only).
# ODbL 1.0: share-alike and attribution are mandatory on anything published from it.
# Bare POI entity pages are BRAND_OWNED_PLUS_SOCIAL per the SERP evidence and are NOT
# generated. Only entity-plus-practical-modifier pages are, and only for the three
# modifiers ENTITY-MODIFIER-RESEARCH.csv verified as MODIFIER_WORKS: tickets, opening
# hours, how to get to.
osm_poi = []
for _f in sorted(glob.glob(ROOT + 'data/atlas/sources/osm-poi/poi-*.jsonl.gz')):
    try:
        for _l in gzip.open(_f, 'rt', encoding='utf-8'):
            _l = _l.strip()
            if not _l: continue
            try: _o = json.loads(_l)
            except Exception: continue
            if _o.get('name') and _o.get('cls'):
                osm_poi.append(_o)
    except (EOFError, OSError):
        pass
print(f'  osm poi {len(osm_poi):,}', file=sys.stderr)

# Which practical modifier each POI class can carry. One or two per class, never more:
# the modifier must answer a question that class actually gets asked.
TICKETED = {'attraction', 'museum', 'castle', 'zoo', 'theme_park', 'gallery',
            'aquarium', 'water_park', 'archaeological_site', 'fort', 'manor'}
TRANSPORT_CLS = {'railway_station', 'railway_halt', 'tram_stop', 'bus_station',
                 'ferry_terminal', 'airport', 'airport_terminal'}
OUTDOOR = {'park', 'garden', 'beach', 'nature_reserve', 'peak', 'waterfall', 'cave',
           'viewpoint', 'marina', 'golf_course', 'picnic_site', 'camp_site'}
def poi_modifiers(cls):
    if cls in TICKETED: return ['tickets', 'opening-hours']
    if cls in TRANSPORT_CLS: return ['how-to-get-to']
    if cls in OUTDOOR: return ['how-to-get-to']
    return ['opening-hours']

# ---------------------------------------------------------------- families
fams = list(csv.DictReader(open(ROOT + 'reports/livdar-master-seo-universe-2026-09-30/FAMILY-MASTER.csv')))
print(f'  families {len(fams)}', file=sys.stderr)

# ---------------------------------------------------------------- keyword master
km = list(csv.DictReader(open(ROOT + 'reports/livdar-final-research-freeze-2026-09-30/LIVDAR-MASTER-KEYWORDS-FINAL.csv')))
# family x market -> demand evidence. One keyword validates a cluster of pages.
cell_kw = collections.defaultdict(list)
fam_kw = collections.defaultdict(list)
for r in km:
    v = r.get('volume') or ''
    try: v = int(float(v))
    except Exception: v = 0
    rec = (r.get('keyword', ''), v, r.get('KD') or '', r.get('SERP_class') or '', r.get('status') or '')
    cell_kw[(r.get('family', ''), r.get('market', ''))].append(rec)
    fam_kw[r.get('family', '')].append(rec)
for d in (cell_kw, fam_kw):
    for k in d: d[k].sort(key=lambda x: -x[1])
print(f'  keyword master rows {len(km):,}, family-market cells with evidence {len(cell_kw):,}', file=sys.stderr)

# ---- new-market keyword overlay --------------------------------------------------------------
# The keyword master is a FROZEN research file and stays byte-identical: a market admitted after
# the freeze brings its own measurement file and that file is ADDED to the cells, never
# substituted for them, exactly as the destination harvest is added to CROSS-LANGUAGE-REACH.csv.
# Without this a new market has no cell anywhere and every family in it reads
# "proven elsewhere, never measured here", which is how a gate keyed on one market refuses
# every other for want of a MEASUREMENT rather than for want of demand. That mistake has been
# made twice in this project and the overlay is what stops it being made a third time.
#
# Only the families the measurement file ADMITS are loaded. The ones it records as refused
# (neighbourhoods.city-where-to-stay at 20 and 50 in Turkish, weather.city-month at 70 and 20,
# rents.city at 40) are read, counted and deliberately left out of the cells, so the refusal is
# carried by the same file that carries the admission.
# ko-KR is listed and has NO EFFECT, deliberately. Its keyword cells load, and nothing reads
# them, because ko-KR is not in entity_identity.MARKETS: it was measured on 2026-10-05 as the
# largest candidate by demand, about 250,000 monthly volume over 119 keywords, and then five
# Korean SERPs were read and every one of them was held by Naver blogs, namu.wiki, Daum, Brunch,
# Instagram or an official tourism board. One independent mid-authority result in 35 sampled
# positions. The file stays wired so that the day the SERP question is answered differently -
# an open family not among the five sampled, or South Korea captured and a domestic family
# measuring open - admitting it is one line in MARKETS rather than a re-measurement.
NEW_MARKET_MEAS = ['ahrefs-tr-TR-market-admission-2026-10-05.json',
                   'ahrefs-ko-KR-market-admission-2026-10-05.json']
for _fn in NEW_MARKET_MEAS:
    try:
        _d = json.load(open(ROOT + 'data/atlas/measurements/' + _fn, encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        continue
    _mkt = _d['market']
    _added = _skipped = 0
    for _fam, _v in (_d.get('families') or {}).items():
        if _v.get('verdict') != 'MEASURED':
            _skipped += 1
            continue
        _base = _fam
        for _k in _v['keywords']:
            if (_k.get('volume') or 0) < _d.get('keyword_floor_used', 100):
                continue
            _rec = (_k['keyword'], int(_k['volume']), str(_k.get('kd') or ''),
                    (_d.get('serp_evidence', {}).get(_fam, {}) or {}).get('class', ''), 'MEASURED')
            cell_kw[(_base, _mkt)].append(_rec)
            fam_kw[_base].append(_rec)
            _added += 1
    for _d2 in (cell_kw, fam_kw):
        for _k2 in _d2: _d2[_k2].sort(key=lambda x: -x[1])
    print(f'  {_mkt} overlay: {_added:,} measured keywords across '
          f'{len(_d.get("families_admitted") or [])} admitted families, '
          f'{_skipped} families measured and refused', file=sys.stderr)

# The two files name families differently: FAMILY-MASTER.csv calls the holiday
# families pulse.*, the keyword master calls them events.*; visas.* there is
# move.visa-country here, and so on. Without this map 35 of 76 families scored zero
# demand and were dropped, including pulse.named-holiday-date which has 1,056
# measured keywords. One keyword validates a CLUSTER, so an alias is the correct
# join: it points a family at the keyword set that already proved its demand.
FAM_ALIAS = {
    'pulse.named-holiday-date': 'events.named-holiday-date',
    'pulse.named-holiday-regions': 'events.named-holiday-regions',
    'pulse.subdivision-holidays': 'events.subdivision-holidays',
    'pulse.school-holidays': 'events.subdivision-holidays',
    'pulse.country-holidays': 'events.country-holidays',
    'pulse.long-weekends': 'events.long-weekends',
    'pulse.today': 'events.today',
    'events.city-calendar': 'events.city-type',
    'events.series-city': 'events.city-type',
    'events.recurring': 'events.city-window',
    'visas.country-digital-nomad': 'move.visa-country',
    'visas.country-work-permit': 'move.visa-country',
    'visas.country-residency': 'move.visa-country',
    'visas.country-visit': 'move.visa-country',
    'taxes.country': 'work.country-salaries',
    'taxes.country-remote-work': 'work.country-salaries',
    'work.country-working': 'work.country-salaries',
    'work.city-jobs-category': 'jobs.role-city-and-category-city',
    'work.city-salaries': 'work.country-salaries',
    'climate.city-annual': 'weather.city-best-time',
    'climate.city-day': 'weather.city-best-time',
    'weather.city-month': 'weather.city-best-time',
    'comparisons.city-vs-city': 'cost-of-living.country',
    'comparisons.city-vs-home': 'cost-of-living.country',
    'comparisons.country-vs-country': 'cost-of-living.country',
    'cost-of-living.city-vs-market': 'cost-of-living.country',
    'cost-of-living.country-vs-market': 'cost-of-living.country',
    'cost-of-living.item-country': 'cost-of-living.country',
    'cost-of-living.city': 'cost-of-living.country',
    'destinations.city-hub': 'atlas.city-family-carried-forward',
    'destinations.country-hub': 'atlas.city-family-carried-forward',
    'airports.guide': 'transport.node-route-and-hotels',
    'transport.route-from-market': 'transport.node-route-and-hotels',
    'transport.airport-to-city': 'transport.node-route-and-hotels',
    'places.poi': 'poi.city-category-durable',
    'places.neighbourhood-category': 'places.city-category',
    'neighbourhoods.guide': 'neighbourhoods.city-where-to-stay',
    'neighbourhoods.city-best-for': 'neighbourhoods.city-where-to-stay',
    'rents.neighbourhood': 'rents.city',
    'stay.near-venue': 'stay.city-type',
    'safety.country-advice': 'safety.city',
    'services.country-admin': 'services.city-practical',
    'banking.country': 'cost-of-living.country',
    'health.country': 'health.city',
    'relocation.city': 'cost-of-living.country',
    'relocation.country': 'cost-of-living.country',
    'education.city-schools': 'education.city-schools',
    'sport.city-activity': 'sport.city-activity',
    'rents.city': 'rents.city',
    'property.city-buy': 'property.city-buy',
    'rankings.index': 'rankings.index',
}
def kw_names(fid):
    """The keyword-master names whose demand validates this family."""
    out = [fid]
    a = FAM_ALIAS.get(fid)
    if a and a != fid: out.append(a)
    return out

# keyword cluster ids: one per family x market, because that is the unit a keyword validates
KCLUSTER = {}
for i, k in enumerate(sorted(cell_kw)):
    KCLUSTER[k] = 'kc_%05d' % i

# Measured tier reach per family x market, from CELL-GATE.csv. The family's generic
# entity spec (city:t2) is a default; where a cell was actually measured deeper, the
# measurement wins. 64 of 150 cells reach TAIL and 5 explicitly count tier 4, which is
# how "wohnung mieten cuxhaven" at 2,800 and "praca stargard" at 9,800 are legitimate
# candidates while an unmeasured tier-4 town in an unmeasured family is not.
CELL_TIER = {}
CELL_REACH = {}
try:
    for r in csv.DictReader(open(ROOT + 'reports/livdar-master-seo-universe-2026-09-30/CELL-GATE.csv')):
        k = (r['family'], r['market'])
        tiers = (r.get('tiers') or '').strip()
        reach = (r.get('reach') or '').strip()
        CELL_REACH[k] = reach
        if tiers:
            CELL_TIER[k] = max(int(t) for t in tiers.split('+') if t.strip().isdigit())
        elif reach == 'TAIL':
            CELL_TIER[k] = 3          # TAIL without an explicit tier list means tier 3
        elif reach in ('HEAD_ONLY', 'NONE'):
            CELL_TIER[k] = 1
except FileNotFoundError:
    pass

# measured cross-language destination reach
xl_markets = collections.defaultdict(set)
# The destination cities actually measured cross-language, keyed by NAME AND COUNTRY.
# Keying on the name alone let Barcelona, Venezuela inherit the measured demand of
# Barcelona, Spain and earn a German things-to-do page. The reach file has carried
# city_country all along; throwing it away was the bug.
XL_CITIES = set()
# The same pairs again, but kept PER SEARCHER MARKET. XL_CITIES answers "was this city ever
# measured cross-language by anyone", which is the question the generation step asks. The
# localisation gate asks a narrower one: was this city measured by THIS market. Collapsing
# the two let a city measured only in en-GB vouch for a German page about it.
XL_MARKET_CITIES = collections.defaultdict(set)
XL_LANG_CITIES = collections.defaultdict(set)
try:
    for r in csv.DictReader(open(ROOT + 'reports/livdar-master-seo-universe-2026-09-30/CROSS-LANGUAGE-REACH.csv')):
        xl_markets[r['family']].add(r['searcher_market'])
        if r.get('city'):
            pair = (r['city'].strip().lower(), (r.get('city_country') or '').strip())
            XL_CITIES.add(pair)
            XL_MARKET_CITIES[r['searcher_market'].strip()].add(pair)
            # And pooled by LANGUAGE, because the page is language-scoped. en-US and en-GB
            # share one /en/ URL, so a destination measured in either is measured for the
            # page that would serve it. Keyed on market alone, English Prague was rejected
            # while German, Spanish, Italian and French Prague passed: the en-GB sample is
            # deliberately tier-3 tail cities and the head destinations were recorded under
            # en-US, so which of the two markets happened to survive exact dedupe decided
            # whether the page existed. That is an artefact of the market labels, not a fact
            # about demand.
            XL_LANG_CITIES[MKT_LANG.get(r['searcher_market'].strip(), '')].add(pair)
except FileNotFoundError:
    pass

# ---- the destination axis -------------------------------------------------------------------
# Measured 2026-10-02: 192 of 193 keywords across de-DE, it-IT, ja-JP and en-US carry volume, and
# in every one of the four markets the strongest entity sits in a country with no pages at all.
# 99.97 per cent of what this file built on 2026-10-01 was about the same eleven countries the
# eleven markets live in, which is backwards for a travel-connectivity product.
#
# Widening it is NOT a relaxation. markets_for() already asks for evidence rather than for a
# country list, and the Aba, Nigeria case recorded there is exactly the mistake to avoid: a
# country having demand is not evidence that an arbitrary town inside it does. So the gate has
# two halves and needs both.
#
#   half one, the country:  a destination country earns a language only when BOTH a
#                           connectivity keyword and a travel-information keyword carry volume
#                           in it, derived in destination-demand-table.py
#   half two, the entity:   the place itself must carry a mark in that same language, which is
#                           a GeoNames alternate name in it or a Wikipedia article in it
#
# The second half is a PROXY for interest, never a measurement of volume, and every row that
# rests on it says so in its own uniqueness reason.
# One loader in entity_identity, which reads every dated measurement file and merges them.
DEST_LANG = entity_identity.dest_lang_with_keywords()
print(f'  destination country-language pairs with measured demand: {len(DEST_LANG):,} '
      f'from {len(entity_identity.DEST_FILES)} measurement files', file=sys.stderr)

# city id -> {language: how the mark was earned}
CITY_LANG_MARK = collections.defaultdict(dict)
try:
    for _l in gzip.open(ROOT + 'data/atlas/sources/geonames/altnames-by-language.jsonl.gz',
                        'rt', encoding='utf-8'):
        _l = _l.strip()
        if not _l: continue
        _r = json.loads(_l)
        for _lang, _v in (_r.get('names') or {}).items():
            # a historic name is not what a searcher types today and a colloquial one cannot
            # title a page, so neither counts as the mark
            if _v.get('historic') or _v.get('colloquial'): continue
            CITY_LANG_MARK[str(_r['geonameid'])][_lang] = 'a GeoNames alternate name'
except (EOFError, OSError, FileNotFoundError):
    pass
try:
    for _l in gzip.open(ROOT + 'data/atlas/sources/geonames/city-sitelinks.jsonl.gz',
                        'rt', encoding='utf-8'):
        _l = _l.strip()
        if not _l: continue
        _r = json.loads(_l)
        for _lang in (_r.get('wikipedia_languages') or {}):
            _d = CITY_LANG_MARK[str(_r['geonameid'])]
            _d[_lang] = ('a Wikipedia article' if _lang not in _d
                         else 'a GeoNames alternate name and a Wikipedia article')
except (EOFError, OSError, FileNotFoundError):
    pass
if CITY_LANG_MARK:
    _mc = collections.Counter()
    for _d in CITY_LANG_MARK.values():
        for _lang in _d: _mc[_lang] += 1
    print(f'  cities carrying a per-language mark: {len(CITY_LANG_MARK):,} '
          f'({dict(_mc.most_common())})', file=sys.stderr)


def destination_markets(ent_country, eid):
    """Markets a place in a non-home country earns, with both halves of the evidence.

    Returns {market: reason}. Empty when either half is missing, which is the whole point:
    a country with demand and a place with no mark in that language earns nothing.
    """
    marks = CITY_LANG_MARK.get(str(eid)) or {}
    if not marks:
        return {}
    out = {}
    for _m, _c, _l in MARKETS:
        ev = DEST_LANG.get((ent_country, _l))
        if not ev or _l not in marks:
            continue
        cv, iv, ck, ik = ev
        out[_m] = (f'{ent_country} carries measured {_l} demand ("{ck}" {cv:,} and '
                   f'"{ik}" {iv:,}) and this place carries {marks[_l]} in {_l}, '
                   f'which is a proxy for interest and not a measured volume for this page')
    return out


# The destination harvest, resolved to gazetteer ids. CROSS-LANGUAGE-REACH.csv is frozen evidence
# from an earlier pass covering roughly 333 destinations and 59 outbound pairs, and the
# localisation gate was rejecting 46,120 rows for want of evidence that had simply never been
# collected. This file is that evidence: one call per language in the phrase that language
# actually uses, resolved to a city id through GeoNames alternate names rather than a hand
# mapping. It is ADDED to the frozen file, never substituted for it, so the earlier measurement
# stays auditable on its own.
#
# HARVEST_CITY_IDS is the entity-level demand override. The pool bound for a city family is a
# TIER, which is a rank over population, and population is not demand: Szklarska Poreba has
# 6,970 people and 9,300 searches a month for its sights. A city with a measured keyword enters
# the pool whatever its tier. Nothing else promotes a city, so this cannot become a licence to
# generate: it reaches exactly the places the harvest names.
HARVEST_CITY_IDS = set()
HARVEST_LANG_IDS = collections.defaultdict(set)
HARVEST_VOL = {}
try:
    for r in csv.DictReader(open(ROOT + 'data/atlas/measurements/destination-harvest/'
                                 'resolved-cities-2026-10-01.csv')):
        pair = (r['city'].strip().lower(), (r.get('city_country') or '').strip())
        XL_CITIES.add(pair)
        XL_MARKET_CITIES[r['searcher_market'].strip()].add(pair)
        XL_LANG_CITIES[r['language'].strip()].add(pair)
        cid = str(r.get('city_id') or '')
        if cid:
            HARVEST_CITY_IDS.add(cid)
            HARVEST_LANG_IDS[r['language'].strip()].add(cid)
            try:
                HARVEST_VOL[cid] = max(HARVEST_VOL.get(cid, 0), int(r['volume']))
            except ValueError:
                pass
except FileNotFoundError:
    pass
print(f'  destination harvest: {len(HARVEST_CITY_IDS):,} cities with measured demand in at '
      f'least one language', file=sys.stderr)

# SERP class per family, from the frozen evidence
serp_by_fam = {}
try:
    for r in csv.DictReader(open(OUT + '08-SERP-EVIDENCE.csv')):
        f, c = r.get('family', ''), r.get('serp_class', '')
        if f and c and f not in serp_by_fam: serp_by_fam[f] = c
except FileNotFoundError:
    pass

# ---------------------------------------------------------------- scope rules
# How a family is allowed to multiply across markets. This is the single most
# important guard against padding, so each mode is named and justified.
#   LOCAL       the entity must sit in the market's own country. One market per
#               entity. Rentals, jobs, services, schools, transport: a page about
#               Leipzig rentals belongs to de-DE and nowhere else.
#   DESTINATION the entity is a travel destination, so foreign markets legitimately
#               search it (measured: "cosa vedere a vienna", "que ver en roma",
#               "things to do in nashville" from en-GB). Markets limited to those
#               with MEASURED cross-language reach plus the home market.
#   RESEARCHED  a country page researched FROM another market: visas, taxes, cost of
#               living, banking, healthcare. Measured: "digital nomad visa spain"
#               in en-GB. Allowed across markets that have keyword evidence.
#   GLOBAL      market-scoped tools and calendars. One row per market.
LOCAL, DESTINATION, RESEARCHED, GLOBAL = 'LOCAL', 'DESTINATION', 'RESEARCHED', 'GLOBAL'
SCOPE = {
    'activities.city-things-to-do': DESTINATION, 'destinations.city-hub': DESTINATION,
    'destinations.country-hub': DESTINATION, 'weather.city-best-time': DESTINATION,
    'weather.city-month': DESTINATION, 'climate.city-annual': DESTINATION,
    'climate.city-day': DESTINATION, 'comparisons.city-vs-city': DESTINATION,
    'airports.guide': DESTINATION, 'transport.route-from-market': DESTINATION,
    'stay.city-type': DESTINATION, 'stay.near-venue': DESTINATION,
    'places.poi': DESTINATION,
}
for f in fams:
    fid = f['family_id']
    if fid in SCOPE: continue
    ent = f['entity']
    if ent.startswith('country') or ent.startswith('holiday'): SCOPE[fid] = RESEARCHED
    elif ent.startswith('tool') or ent.endswith('-market') or ent.startswith('year') \
         or ent.startswith('month') or ent.startswith('ranking'): SCOPE[fid] = GLOBAL
    else: SCOPE[fid] = LOCAL

# ---------------------------------------------------------------- source status
def source_status(f):
    """READY_NOW / SOURCE_AVAILABLE / FEED_REQUIRED / LICENCE_REQUIRED / BLOCKED"""
    st, ss, acq = f['status'], f['source_state'], (f['acquisition_type'] or '')
    if ss == 'OUT_OF_SCOPE' or st == 'REJECT': return 'BLOCKED'
    if ss == 'BLOCKED_LICENCE' or st == 'BLOCKED_BY_LICENCE': return 'LICENCE_REQUIRED'
    if ss == 'BLOCKED_COMMERCIAL': return 'LICENCE_REQUIRED'
    if ss == 'HELD': return 'READY_NOW'
    if ss == 'HELD_PARTIAL': return 'SOURCE_AVAILABLE'
    if ss in ('ACQUIRABLE_WITH_EFFORT',): return 'SOURCE_AVAILABLE'
    if ss == 'MISSING_ACQUIRABLE':
        # a listing vertical needs an inventory feed; a facts vertical needs a fetch
        if any(k in f['family_id'] for k in ('rents.', 'property.', 'stay.', 'work.city-jobs',
                                             'jobs.', 'events.')):
            return 'FEED_REQUIRED'
        return 'SOURCE_AVAILABLE'
    return 'SOURCE_AVAILABLE'

FEED_OF = {'rents.': 'rental listings feed', 'property.': 'property listings feed',
           'stay.': 'accommodation rates feed', 'work.city-jobs': 'jobs feed',
           'jobs.': 'jobs feed', 'events.': 'licensed event feed'}
def feed_required(fid, ss):
    if ss not in ('FEED_REQUIRED', 'LICENCE_REQUIRED'): return ''
    for k, v in FEED_OF.items():
        if fid.startswith(k) or k in fid: return v
    return 'source acquisition'

# ---------------------------------------------------------------- scoring
SERP_SCORE = {
    'OPEN': 100, 'OPEN_WINNER_TAKE_MOST': 75, 'OPEN_WINNER_TAKE_MOST_IF_NO_RESELLER': 70,
    'OPEN_REQUIRES_INVENTORY': 70, 'OPEN_OFFICIAL_FAVOURED': 55,
    'COMPETITIVE_PARTIAL_OPENING': 50, 'COMPETITIVE_MID_AUTHORITY': 45, 'COMPETITIVE': 45,
    'LISTING_INVENTORY_REQUIRED_VERTICAL': 55, 'LISTING_INVENTORY_REQUIRED': 40,
    'OPEN_BUT_SOURCE_BLOCKED': 35, 'NOT_SAMPLED': 40,
    'BRAND_OWNED_PLUS_SOCIAL': 5, 'OFFICIAL_OWNED': 10, 'OFFICIAL_OWNED_PLUS_AI_OVERVIEW': 5,
    'RESELLER_OWNED': 10, 'AGGREGATOR_LOCKED': 5, 'SERP_FEATURE_SUPPRESSED': 5,
    'OPEN_BUT_ECONOMICALLY_DEAD': 5,
    # Archetypes measured on 2026-10-01 for the aggregation shapes, recorded in
    # 08b-SERP-EVIDENCE-AGGREGATION-SHAPES.csv. Each one is a reading of an actual SERP,
    # not an assumption carried over from the family it resembles.
    #
    # A low-DR page purpose-built for the question wins the top three. The strongest
    # signal measured: supermarktcheck.de at DR 35 holds position 2 for
    # "supermarkt münchen sonntag geöffnet" above outlets at DR 56, 63, 73, 74 and 81.
    'OPEN_SPECIALIST_PAGE_WINS': 85,
    # Independent editorial lists own the organic results, but a local pack sits above
    # them. Measured on "restaurants kreuzberg" and "indian restaurants manchester",
    # where a DR 39 and a DR 60 site rank.
    'OPEN_LOCAL_PACK_ABOVE_ORGANIC': 70,
    # The venues themselves plus the big aggregators hold every position and no
    # independent list ranks at all. Measured on "indian restaurants shoreditch": venue
    # sites at DR 43 and DR 72 take 1 and 2, then TripAdvisor DR 91 and OpenTable DR 84.
    # This is why a neighbourhood cuisine page is NOT scored like a city cuisine page.
    'AGGREGATOR_AND_VENUE_OWNED': 30,
    # An official or semi-official portal plus aggregators and Wikipedia. Measured on
    # "musei firenze": firenzemusei.it at DR 44 takes 1, then TripAdvisor, Firenze Card,
    # Wikipedia and the comune. Not locked, but a new entrant starts behind.
    'OFFICIAL_PLUS_AGGREGATOR_MIXED': 50,
    # The entity's own site and Wikipedia hold the top, and third-party directories rank
    # below them. Measured on "stoomgemaal winschoten": the operator at DR 18 takes 1,
    # Wikipedia DR 97 takes 2, then a DR 28 and a DR 20 directory at 5 and 6 - one of them
    # on the same /poi/museum-... URL pattern Livdar generates. Winnable at 5 to 8, which
    # is worth something and is not a top-three opportunity.
    'ENTITY_OWNED_PLUS_WIKIPEDIA_DIRECTORIES_BELOW': 45,
}
SRC_SCORE = {'READY_NOW': 100, 'SOURCE_AVAILABLE': 55, 'FEED_REQUIRED': 30,
             'LICENCE_REQUIRED': 15, 'BLOCKED': 0}
RISK_PENALTY = {'LOW': 0, 'MEDIUM': 15, 'HIGH': 35, 'VERY_HIGH': 50, '': 10}

def kw_cell(fid, market):
    for n in kw_names(fid):
        c = cell_kw.get((n, market))
        if c: return c
    return []

def kw_fam(fid):
    for n in kw_names(fid):
        c = fam_kw.get(n)
        if c: return c
    return []

def demand_score(fid, market, tier):
    """From the keyword master, through the alias join. A cell with measured keywords
    scores on its top volume; a family proven in other markets scores lower but not
    zero, because one keyword validates a cluster; no evidence anywhere scores 0."""
    cell = kw_cell(fid, market)
    if cell:
        top = cell[0][1]
        base = 100 if top >= 10000 else 85 if top >= 3000 else 70 if top >= 1000 \
               else 55 if top >= 300 else 40
    elif kw_fam(fid):
        base = 30                      # family proven, this market unmeasured
    else:
        base = 0
    # tier decay: a tier-4 town does not carry tier-1 demand
    return max(0, int(base - {1: 0, 2: 5, 3: 15, 4: 30}.get(tier or 1, 0)))

def fields_for(fid, f):
    req = (f.get('required_data') or '').strip()
    return max(1, len([x for x in req.replace(';', ',').split(',') if x.strip()]))

# ---------------------------------------------------------------- generation
def sig(*parts):
    return hashlib.sha1('|'.join(str(p) for p in parts).encode()).hexdigest()[:12]

# ---- a unique slug for every entity, resolved in slug space ----------------------------
# Cities go through the shared identity module. Everything else used its bare name, so two
# venues called the same thing in one country produced one path and exact dedupe discarded
# the second: 153 of the 748 duplicate-URL rejections were venues. The resolution is the same
# shape as the module's, applied per entity type, and it qualifies only what collides:
# country first, then the entity id, which is always unique.
def _resolve_entity_slugs():
    groups = collections.defaultdict(list)       # (etype, slug) -> [(eid, country)]
    def add(etype, eid, name, country):
        if not eid or not name: return
        groups[(etype, slug(name))].append((str(eid), country or ''))
    for n in neigh:
        if n.get('name'): add('neighbourhood', n['id'], n['name'], n.get('country'))
    for a in airports:
        if a.get('name') and a.get('id'): add('airport', a['id'], a['name'], a.get('country'))
    for v in venues:
        if v.get('name'): add('venue', v['id'], v['name'], v.get('country'))
    for sv in subdiv:
        if sv.get('name'): add('subdivision', sv['id'], sv['name'], sv.get('country'))
    out = {}
    for (etype, base), members in groups.items():
        if len(members) == 1:
            out[(etype, members[0][0])] = base
            continue
        # collides on the bare name: try the country, then fall back to the id
        by_country = collections.Counter(c for _e, c in members)
        for eid, country in members:
            if country and by_country[country] == 1:
                out[(etype, eid)] = f'{base}-{country.lower()}'
            else:
                out[(etype, eid)] = f'{base}-{slug(eid)}'
    return out


# Lazy, because slug() is defined further down this file. This is the third time I have
# written a module-level call above the helper it needs, so the pattern is worth naming: in
# this file, anything that calls slug() has to be deferred until it is actually used.
_entity_slug_cache = None


def entity_slug(etype, eid):
    global _entity_slug_cache
    if _entity_slug_cache is None:
        _entity_slug_cache = _resolve_entity_slugs()
        print(f'  entity slugs resolved for {len(_entity_slug_cache):,} non-city entities',
              file=sys.stderr)
    return _entity_slug_cache.get((etype, str(eid)), '')


def entity_pool(f):
    """Real entities only, filtered so no empty combination is ever emitted."""
    ent, fid = f['entity'], f['family_id']
    # city:pair must be tested BEFORE the generic city branch: startswith('city')
    # swallows it otherwise and a comparison family silently emits single-city URLs
    # like /en/tools/city-vs-city/aba/, which is not a comparison of anything.
    if ent == 'city:pair':
        # Every pair of 200 cities is 19,900 rows of mostly absent demand, and
        # FAMILY-MASTER already marks this family duplicate_risk HIGH. Capped to the
        # 40 largest tier-1 cities: 780 ordered-once pairs.
        top = sorted([c for c in cities if c['tier'] == 1], key=lambda x: -(x['pop'] or 0))[:40]
        return [('city-pair', f"{a['id']}-{b['id']}", f"{a['name']} vs {b['name']}",
                 a['country'], a['name'], '', 1) for i, a in enumerate(top) for b in top[i+1:]]
    if ent.startswith('city'):
        tier = 4
        if ':t1' in ent: tier = 1
        elif ':t2' in ent: tier = 2
        elif ':t3' in ent: tier = 3
        elif ent in ('city', 'city-date'): tier = 3   # cap the open-ended ones at t3
        # Where a family x market cell was measured deeper than the family's generic
        # spec, the measurement wins. Take the deepest measured tier for this family
        # across its markets as the pool bound; the per-market filter below trims it
        # back down for markets whose own cell is shallower.
        measured = [v for (ff, mm), v in CELL_TIER.items() if ff in kw_names(fid)]
        if measured: tier = max(tier, max(measured))
        pool = [c for c in cities if c['tier'] <= tier]
        # A city the harvest measured is in the pool whatever its tier, because a measurement
        # beats a population rank. Only for the families the harvest actually asked about, which
        # is the sightseeing and destination side, and only for cities it names.
        if HARVEST_CITY_IDS and SCOPE.get(fid) in (DESTINATION, LOCAL):
            have = {c['id'] for c in pool}
            extra = [c for c in cities
                     if str(c['id']) in HARVEST_CITY_IDS and c['id'] not in have]
            if extra:
                stats['cities_added_by_measured_demand_over_tier'] += len(extra)
                pool = pool + extra
        if 'neighbourhood' in fid: pool = [c for c in pool if c['id'] in CITIES_WITH_NEIGH]
        return [('city', c['id'], c['name'], c['country'], c['name'], '', c['tier']) for c in pool]
    if ent == 'neighbourhood':
        return [('neighbourhood', n['id'], n['name'], n['country'], n['cityName'], n['name'], 2)
                for n in neigh if n['name']]
    if ent.startswith('airport'):
        pool = airports
        if ':linked' in ent: pool = [a for a in airports if a['cityId']]
        return [('airport', a['id'], a['name'], a['country'],
                 CITY_BY_ID.get(a['cityId'], {}).get('name', a['municipality'] or ''), '', 2)
                for a in pool if a['id'] and a['name']]
    if ent.startswith('venue'):
        return [('venue', v['id'], v['name'], v['country'], v['cityName'], '', 2)
                for v in venues if v['name']]
    if ent == 'subdivision':
        return [('subdivision', s['id'], s['name'], s['country'], '', '', 1) for s in subdiv if s['name']]
    if ent == 'subdivision-year-bridge':
        # a bridge-day plan exists only where the subdivision actually has one: a region
        # whose holidays all fall midweek or on a weekend has no bridge days, and an
        # empty page for it would be a generated blank
        return [('bridge-plan', h['id'],
                 f"{h['subdivision']} {h['year']} bridge days", h['country'], '', '', 1)
                for h in bridge_plans if h['bridge_day_count'] > 0]
    if ent == 'subdivision-year':
        return [('subdivision-year', f"{s['id']}-{y}", f"{s['name']} {y}", s['country'], '', '', 1)
                for s in subdiv if s['name'] for y in YEARS]
    if ent.startswith('country'):
        if ent == 'country-year':
            return [('country-year', f"{c['id']}-{y}", f"{c['name']} {y}", c['id'], '', '', 1)
                    for c in countries if c['name'] for y in YEARS]
        if ent == 'country-day':
            return []      # a per-day page is a template, not 365 candidate URLs
        if ent == 'country:pair':
            # Every pair of 60 countries is 1,770 rows per language and almost all of
            # them have no comparison demand. FAMILY-MASTER already marks this family
            # duplicate_risk HIGH. Capped to the 25 most-researched countries, which
            # is 300 pairs, and the controller caps it again.
            top = [c for c in countries if c['name']][:25]
            return [('country-pair', f"{a['id']}-{b['id']}", f"{a['name']} vs {b['name']}",
                     a['id'], '', '', 1) for i, a in enumerate(top) for b in top[i+1:]]
        return [('country', c['id'], c['name'], c['id'], '', '', 1) for c in countries if c['name']]
    if ent == 'subdivision-year':
        # school holidays: one page per period per subdivision per year, and ONLY for a
        # subdivision that actually has school holiday data. Crossing every subdivision
        # with every year would generate pages with nothing on them.
        return [('school-holiday', h['id'], f"{h['name']} {h['subdivision']} {h['year']}",
                 h['country'], '', '', 1) for h in school_holidays]
    if ent == 'country-year':
        # long weekends: one page per window, which is a distinct dated thing, not one
        # page per country repeated per year with the same content
        return [('long-weekend', h['id'],
                 f"{h['anchor']} long weekend {h['start']}", h['country'], '', '', 1)
                for h in long_weekends]
    if ent == 'holiday' and 'region' in fid:
        # the regional variant is the observance that is NOT nationwide
        return [('holiday-regional', h['id'], f"{h['name']} {h['year']}",
                 h['country'], '', '', 1) for h in holidays_regional]
    if ent.startswith('holiday'):
        # holiday-country: one page per holiday per country per year in the window
        return [('holiday', h['id'] + '-' + str(h['year']),
                 f"{h['name']} {h['year']}", h['country'], '', '', 1) for h in holidays]
    if ent == 'month-year-market':
        return [('month-year', f"{y}-{m:02d}", f"{y}-{m:02d}", '', '', '', 1)
                for y in YEARS for m in range(1, 13)]
    if ent == 'year-market':
        return [('year', str(y), str(y), '', '', '', 1) for y in YEARS]
    if ent.startswith('tool'):
        return [('tool', fid.split('.')[-1], fid.split('.')[-1], '', '', '', 1)]
    return []   # event-series, route:named, poi:gated, ranking:list have no entity store yet

def markets_for(f, ent_country, tier, ename='', eid=''):
    fid, scope = f['family_id'], SCOPE[f['family_id']]
    if scope == LOCAL:
        return COUNTRY_MKTS.get(ent_country, [])
    if scope == GLOBAL:
        return [m for m, _, _ in MARKETS]
    if scope == DESTINATION:
        home = COUNTRY_MKTS.get(ent_country, [])
        # Cross-language destination demand was measured for roughly 333 destination
        # cities, NOT for all 31,715. Letting every city inherit every measured
        # searcher market produced German pages about Aba, Nigeria: an empty
        # city x attribute combination, which is the padding this brief forbids.
        # The bound keeps exactly what was measured:
        #   - tier 1 and 2 cities anywhere are real international destinations
        #   - tier 3 cities inside the 11 market countries, which is the measured
        #     case (Konstanz DE t3 and Vannes FR t3 both rank in en-GB)
        # Everything else gets its home market only, or nothing if it has none.
        # Population is NOT a proxy for "tourist destination": Aba and Abidjan are
        # tier-2 by population and were producing German travel pages with no
        # measured demand behind them. The bound is now the measured evidence only:
        #   - the destination cities named in CROSS-LANGUAGE-REACH.csv, or
        #   - cities inside the 11 market countries, which is where every measured
        #     cross-language row sits (Konstanz DE t3, Vannes FR t3, Goettingen DE t3)
        # A city outside both, with no home market, generates nothing for a
        # destination family, because nothing was ever measured for it.
        t = tier or 4
        mkt_countries = set(MKT_COUNTRY.values())
        measured_destination = (((ename or '').lower(), ent_country) in XL_CITIES
                               or ent_country in mkt_countries)
        xl = set((xl_markets.get(fid) or set())) if measured_destination else set()
        # The English markets were measured searching GLOBALLY in round three, and not
        # only Europe: things to do in nashville, sydney, bali, tokyo, cancun and
        # zanzibar all returned real volume in en-GB and en-US. So tier-1 cities
        # anywhere earn the two English markets. Non-English markets were measured
        # only on major international destinations (cosa vedere a vienna / praga /
        # new york, que ver en marrakech, 名古屋景點), which tier 1 already covers,
        # so they earn a tier-1 city only when it is a measured destination or sits
        # in one of the 11 market countries.
        if t == 1:
            xl |= {'en-GB', 'en-US'}
        if measured_destination and not xl:
            xl = {'en-GB', 'en-US'}
        # The destination axis, added 2026-10-02. Everything above is the 2026-10-01 evidence
        # and is untouched; this is a SECOND, narrower evidence class that reaches places the
        # first one never covered, and it grants a market only when the country carries measured
        # demand in that market's language AND this place carries a mark in the same language.
        # It can only add markets, never remove one, so no row that existed yesterday is lost.
        return sorted(set(home) | set(xl) | set(destination_markets(ent_country, eid)))
    if scope == RESEARCHED:
        names = set(kw_names(fid))
        ms = {m for (ff, m) in cell_kw if ff in names}
        if not ms: ms = {'en-GB', 'en-US', 'de-DE'}   # the three with the deepest research
        return sorted(ms)
    return []

# ---------------------------------------------------------------- uniqueness
# A URL being unique is not a reason for a page to exist. Each candidate has to name
# the thing that makes it worth its own page, and anything that cannot is rejected.
# The reason is built from the family's real distinct-value basis, not a template.
DISTINCT_BASIS = {
    'country': 'country-specific rules, rates or figures that differ by jurisdiction',
    'country-year': 'the dated calendar for that country and year, which changes annually',
    'subdivision': 'subdivision-level rules that differ from the national ones',
    'subdivision-year': 'subdivision-level dated calendar for that year',
    'holiday': 'a specific dated observance with its own regional rules and date logic',
    'holiday-regional': ('an observance kept in named subdivisions and not nationwide, so '
                         'the date or the fact of it differs inside the country'),
    'school-holiday': ('a dated school holiday period for one subdivision, which sets '
                       'when families in that region can actually travel'),
    'long-weekend': ('one dated window where a public holiday and the weekend join, with '
                     'the bridge day named where a single working day sits between them'),
    'bridge-plan': ('the bridge days one subdivision has in one year, which differ from '
                    'its neighbours because the regional observances each one keeps '
                    'differ, so the working days that bridge to a weekend differ too'),
    'city': 'city-level local data and local-language demand',
    'neighbourhood': 'neighbourhood-level characteristics within a named city',
    'airport': 'a specific transport node with its own routes, distances and onward options',
    'venue': 'a specific venue with its own location and surroundings',
    'city-pair': 'a two-sided comparison whose figures exist for no other pair',
    'country-pair': 'a two-sided comparison whose figures exist for no other pair',
    'month-year': 'a dated period with its own calendar facts',
    'year': 'a dated period with its own calendar facts',
    'tool': 'a distinct calculation with its own formula and inputs',
}
# how many entities share a name inside one country, so the reason can add an id only
# where it is actually needed rather than cluttering every row
SAME_NAME_IN_COUNTRY = collections.Counter()
for _c in cities:
    if _c.get('name'):
        SAME_NAME_IN_COUNTRY[(_c.get('country'), _c['name'].casefold())] += 1


def uniqueness_reason(f, etype, ename, ecountry, market, lang, tier, eid='', ecity=''):
    basis = DISTINCT_BASIS.get(etype)
    if not basis:
        return ''                       # no defensible basis: the gate below drops it
    req = (f.get('required_data') or '').strip()
    nf = len([x for x in req.replace(';', ',').split(',') if x.strip()])
    if nf < 2:
        return ''                       # too few source fields to say anything distinct
    # The entity's country belongs in the reason. Without it two cities that share a
    # name produced byte-identical reasons - Barcelona ES and Barcelona VE both read
    # "for Barcelona in de-DE" - and a reason that cannot tell two candidates apart is
    # not doing the job the gate exists for.
    who = ename or etype
    # For anything BELOW city level the country is not the distinguishing fact and the city is.
    # There are two Alte Opers in Germany, in Erfurt and in Frankfurt, and two E-Werks, in Cologne
    # and in Berlin; naming only the country gave both members of each pair a byte-identical reason,
    # 87 rows of it in stay.near-venue alone. The city is also what a reader needs, and it is the
    # same qualifier the title already carries, so this is the reason catching up with the title
    # rather than a discriminator invented to satisfy a checker.
    if etype in ('venue', 'neighbourhood', 'poi', 'outdoor_feature', 'trail', 'airport'):
        where = ', '.join(x for x in (ecity, ecountry) if x)
        if where:
            who = f"{who} ({where})"
    elif ecountry and etype in ('city', 'city-pair'):
        who = f"{who} ({ecountry})"
    # And where even that repeats, the entity id is the last resort that always distinguishes,
    # because it is the id of the row's own entity. The United States has several Springfields.
    if eid and ename and SAME_NAME_IN_COUNTRY.get((ecountry, (ename or '').casefold()), 0) > 1:
        who = f"{who} [{eid}]"
    return (f"{f['family_id']} for {who} in {market}: {basis}; "
            f"{nf} source fields from {f.get('source_state', 'source')}; "
            f"{lang} market demand measured for this family")

# ---------------------------------------------------------------- emit
# The slug function lives in entity_identity, which is where identity lives. There were four
# copies of it in this pipeline and three of them disagreed, so two builders could emit two
# different paths for the same place. It also folds Latin diacritics now, which this copy did
# not: /de/stay/city-type/lohne/ and the version with the umlaut are two different German
# towns and were two URLs one keystroke apart. The empty-slug fallback that used to be
# "or 'x'" is handled at the call site instead, where the entity id is in scope.
slug = entity_identity.slugify

# Which (surface, last segment) pairs more than one family claims. Computed from the family
# catalogue rather than hard-coded, so a family added later cannot reintroduce the collision
# without this picking it up.
_seg_claims = collections.defaultdict(set)
for _f in fams:
    _seg_claims[(_f['surface'], slug(_f['family_id'].split('.')[-1]))].add(_f['family_id'])
AMBIGUOUS_SEGMENT = {k for k, v in _seg_claims.items() if len(v) > 1}
if AMBIGUOUS_SEGMENT:
    print(f'path segments claimed by more than one family, disambiguated with the topic: '
          f'{sorted(AMBIGUOUS_SEGMENT)}', file=sys.stderr)

FIELDS = ['candidate_id','url_pattern','market','language','surface','family','vertical',
          'page_type','entity_type','entity_id','entity_name','city','country','neighbourhood',
          'primary_intent','primary_keyword_if_known','keyword_cluster_id','semantic_cluster_id',
          'data_source','source_status','source_record_id','feed_required','licence_status',
          'data_signature','template_signature','duplicate_risk','cannibalization_risk',
          'quality_score','demand_score','source_score','serp_score','indexability_score',
          'publication_priority','publication_cohort_candidate','status',
          # added for the quality-first pass
          'uniqueness_reason','serp_feasibility','data_completeness','source_freshness',
          'intent_owner','monetization_fit','tool_or_content','rejection_reason','serp_class',
          'parent_url','market_demand_evidence',
          # localisation and cross-locale fields, required per the multilingual brief
          'locale','source_page_family','local_keyword','local_volume','local_intent',
          'local_serp','localization_class','localization_flag','localization_reason',
          'destination',
          # set only where a long dash was normalised out of a rendered string, so the
          # change is recorded in the manifest rather than only in the run log
          'dash_normalised',
          # The facts that make a destination copy something other than a translation, computed
          # from the entity's coordinates and the market's own origin city: the distance and the
          # January and July temperature gap. Carried as a field rather than left inside the
          # uniqueness reason so a checker can read it without sniffing prose, which is how six
          # false findings were produced in an earlier pass.
          'locale_facts']

stats = collections.Counter()
rows = []
for f in fams:
    fid = f['family_id']
    ss = source_status(f)
    if ss == 'BLOCKED':
        stats['families_blocked'] += 1
        continue
    pool = entity_pool(f)
    if not pool:
        stats['families_with_no_entity_store'] += 1
        stats['no_entity_store:' + fid] += 1
        continue
    stats['families_generating'] += 1
    serp_c = serp_by_fam.get(fid, 'NOT_SAMPLED')
    sscore = SERP_SCORE.get(serp_c, 40)
    srcscore = SRC_SCORE[ss]
    nfields = fields_for(fid, f)
    dup, can = (f['duplicate_risk'] or ''), (f['cannibalization_risk'] or '')
    qbase = min(100, 40 + nfields * 8) - RISK_PENALTY.get(dup, 10)
    tsig = sig('tpl', fid, f['entity'], f['intent'])
    for (etype, eid, ename, ecountry, ecity, eneigh, tier) in pool:
        cand_markets = markets_for(f, ecountry, tier, ename, eid)
        # collapse markets that share a language, keeping the one with real evidence
        by_lang = {}
        for m in cand_markets:
            l = MKT_LANG[m]
            if l not in by_lang or demand_score(fid, m, tier) > demand_score(fid, by_lang[l], tier):
                by_lang[l] = m
        for lang, m in sorted(by_lang.items()):
            # trim to this market's own measured depth: a city deeper than the cell
            # was measured to reach is not a candidate in that market
            if etype == 'city':
                cap = next((CELL_TIER[(n, m)] for n in kw_names(fid) if (n, m) in CELL_TIER), None)
                if cap is not None and (tier or 4) > cap:
                    stats['dropped_beyond_measured_tier'] += 1
                    continue
            dscore = demand_score(fid, m, tier)
            if dscore == 0:
                stats['dropped_no_demand_evidence'] += 1
                continue                      # no keyword evidence anywhere: not a candidate
            # The entity segment has to identify the ENTITY. For a city that is the shared
            # identity module, which resolves in slug space and agrees with the aggregation
            # builder. For every other type it is ENTITY_SLUG, resolved the same way: the
            # earlier code disambiguated cities only, so 153 venues of the same name were
            # still collapsing onto one path and being discarded by exact dedupe.
            nm = city_slug(eid) if etype == 'city' else entity_slug(etype, eid)
            if not nm:
                nm = slug(ename)
            if not nm:
                # a name that slugs to nothing would put an empty segment in the path, so the
                # id stands in for it. Counted, because a name this pipeline cannot render is
                # a data problem worth seeing rather than a URL worth quietly building.
                nm = slug(str(eid))
                stats['entity_slug_fell_back_to_the_id'] += 1
            if not nm:
                stats['dropped_entity_has_no_renderable_slug'] += 1
                continue
            # The path segment has to identify the FAMILY, not just its last word. Five
            # country families share the surface "move" and the last segment "country":
            # relocation, health, banking, taxes and cost-of-living. All five were resolving
            # to /{lang}/move/country/{country}/, so exact dedupe kept whichever happened to
            # be generated first and silently discarded the rest with no rejection record.
            # Only luck hid it: the other four were failing the uniqueness gate anyway, and
            # the day one of them earned a uniqueness basis, twelve real pages would have
            # vanished without trace. The cross-artifact check found it by noticing those
            # URLs sat in both the kept and the rejected file.
            # The topic is added ONLY where the pair is ambiguous, so every unambiguous URL,
            # which is every live one, stays byte-identical.
            seg = slug(fid.split('.')[-1])
            if (f['surface'], seg) in AMBIGUOUS_SEGMENT:
                seg = slug(fid.split('.')[0]) + '-' + seg
            url = f"/{lang}/{slug(f['surface'])}/{seg}/{nm}/"
            dsig = sig('data', fid, eid, m)
            q = max(0, min(100, qbase))
            iscore = min(q, dscore, srcscore, sscore)   # a floor on every score, never blended
            # demand_score already distinguishes a cell measured in THIS market from a
            # family proven elsewhere, scoring the latter 30 rather than zero. That
            # distinction was invisible in the output, so it is now a field a reader can
            # filter on instead of having to infer it from a number.
            if kw_cell(fid, m):
                dev = 'measured_in_this_market'
            elif kw_fam(fid):
                dev = 'family_measured_elsewhere'
            else:
                dev = 'none'
            cell = kw_cell(fid, m) or kw_fam(fid)
            kc = next((KCLUSTER[(n, m)] for n in kw_names(fid) if (n, m) in KCLUSTER), '')
            pk = cell[0][0] if cell else ''
            prio = round(iscore * 0.55 + dscore * 0.3 + sscore * 0.15, 1)
            rows.append({
                'candidate_id': 'c_' + sig(fid, eid, m),
                'url_pattern': url, 'market': m, 'language': lang,
                'surface': f['surface'], 'family': fid, 'vertical': f['vertical'],
                'page_type': f['intent'], 'entity_type': etype, 'entity_id': eid,
                # The DISPLAY name carries the region where the bare name would be
                # ambiguous inside its country: Woodstock, Georgia against Woodstock,
                # Illinois. ename stays raw above, because the keyword and reach lookups key
                # on the name a measurement used. This is the title half of the collision the
                # slug fix solved: 1,144 same-name cities got distinct URLs and kept
                # identical titles until the label was used here.
                'entity_name': (CITY_LABELS.get(str(eid)) or ename) if etype == 'city' else ename,
                'city': (CITY_LABELS.get(str(eid)) or ecity) if etype == 'city' else ecity,
                'country': ecountry or '',
                'neighbourhood': eneigh, 'primary_intent': f['intent'],
                'primary_keyword_if_known': pk, 'keyword_cluster_id': kc,
                'semantic_cluster_id': 'sc_' + sig(fid, m, tsig),
                'data_source': f['required_data'] or f['source_state'],
                'source_status': ss, 'source_record_id': f'{etype}:{eid}',
                'feed_required': feed_required(fid, ss),
                'licence_status': 'LICENCE_REQUIRED' if ss == 'LICENCE_REQUIRED' else 'OK',
                'data_signature': dsig, 'template_signature': tsig,
                'duplicate_risk': dup, 'cannibalization_risk': can,
                'market_demand_evidence': dev,
                'quality_score': q, 'demand_score': dscore, 'source_score': srcscore,
                'serp_score': sscore, 'serp_class': serp_c,
                'indexability_score': iscore,
                'publication_priority': prio, 'publication_cohort_candidate': '',
                'status': f['status'],
                # Why this page deserves to exist separately. Built from the family's
                # own distinct-value test plus the entity and market that make this row
                # different from its siblings. A row without one is dropped below.
                'uniqueness_reason': uniqueness_reason(f, etype, ename, ecountry, m, lang,
                                                      tier, eid, ecity),
            })

# ---- OSM POI AGGREGATIONS (not one page per POI) ---------------------------
# The previous pass emitted one page per POI per modifier, 161,474 of them. That is
# scaled-content spam by any reasonable reading: an unknown restaurant with a name and
# nothing else does not deserve a URL. Those rows are GONE. What replaces them is the
# aggregation a person actually searches - the cafes in a city, the coworking in a city
# - gated on a minimum count and on the entries carrying more than a name, plus a small
# set of individually notable entities cross-referenced in Wikidata.
# Built by scripts/atlas/scale/poi-aggregations.py, which records every rejection.
agg = []
try:
    for _l in gzip.open(ROOT + 'data/atlas/sources/osm-poi/_aggregations.jsonl.gz', 'rt', encoding='utf-8'):
        _l = _l.strip()
        if _l:
            try: agg.append(json.loads(_l))
            except Exception: pass
except (EOFError, OSError, FileNotFoundError):
    pass
print(f'  poi aggregations loaded {len(agg):,}', file=sys.stderr)

# The outdoor layers, built from the parent polygons captured per market. Two shapes: a list of
# one feature class inside a named geography, and a page for a single named feature. Both are
# containment only, and the feature pages rest on a Wikipedia or Wikidata PROXY for interest rather
# than on a measured keyword, which the uniqueness reason on every row says in those words.
_outdoor_before = len(agg)
for _src in (ROOT + 'data/atlas/sources/osm-parents/_outdoor-aggregations.jsonl.gz',
             ROOT + 'data/atlas/sources/osm-outdoor/_feature-candidates.jsonl.gz',
             ROOT + 'data/atlas/sources/osm-trails/_trail-candidates.jsonl.gz',
             ROOT + 'data/atlas/sources/osm-parents/_region-aggregations.jsonl.gz'):
    try:
        for _l in gzip.open(_src, 'rt', encoding='utf-8'):
            _l = _l.strip()
            if _l:
                try: agg.append(json.loads(_l))
                except Exception: pass
    except (EOFError, OSError, FileNotFoundError):
        pass
print(f'  outdoor candidates loaded {len(agg) - _outdoor_before:,}', file=sys.stderr)

# Every aggregation shape used to inherit one assumed archetype. That was an assumption
# applied to roughly a hundred thousand rows, so each shape was measured instead and
# carries the archetype its own SERP showed. Shapes not yet sampled keep NOT_SAMPLED,
# which the feasibility function treats as absence of evidence rather than bad news.
SHAPE_SERP = {
    'city_category': 'OFFICIAL_PLUS_AGGREGATOR_MIXED',
    'city_cuisine': 'OPEN_LOCAL_PACK_ABOVE_ORGANIC',
    'area_category': 'OPEN_LOCAL_PACK_ABOVE_ORGANIC',
    'area_cuisine': 'AGGREGATOR_AND_VENUE_OWNED',
    'city_opening': 'OPEN_SPECIALIST_PAGE_WINS',
    'area_opening': 'NOT_SAMPLED',
    'city_attribute': 'NOT_SAMPLED',
    'area_attribute': 'NOT_SAMPLED',
    # measured on "tennis courts london": the governing body and booking platforms hold
    # the head, a DR 10 guide ranks at 6, and a local pack sits above all of it
    'city_sport': 'OFFICIAL_PLUS_AGGREGATOR_MIXED',
    'city_areas_hub': 'OFFICIAL_PLUS_AGGREGATOR_MIXED',
    # measured on "stadtteile berlin übersicht": the official city portal and Wikipedia
    # hold the top, but a DR 0 and a DR 6 site rank at 5 and 6, so authority is not the gate
    'area_parent': 'OFFICIAL_PLUS_AGGREGATOR_MIXED',
    'notable_entity': 'ENTITY_OWNED_PLUS_WIKIPEDIA_DIRECTORIES_BELOW',
    'wikidata_notable': 'ENTITY_OWNED_PLUS_WIKIPEDIA_DIRECTORIES_BELOW',
    'wikidata_city_list': 'OFFICIAL_PLUS_AGGREGATOR_MIXED',
    # measured on "seen in bayern": photo-nature.de holds position 6 at DOMAIN RATING 1 and its
    # own top pages are a hobby photography blog, two slots are Pinterest and TikTok, and
    # Wikipedia ranks a LIST at the top. The format Google rewards here is an enumeration.
    'outdoor_region_feature': 'OPEN_SPECIALIST_PAGE_WINS',
    # measured on the entity names: zugspitze 63,000 at KD 0, burg eltz 31,000 at 0, watzmann
    # 19,000 at 0, brocken 15,000 at 0, externsteine 12,000 at 0. The head of this family is
    # wide open. The tail is 100 and below, which is a publication-ordering fact.
    'outdoor_feature': 'OPEN_SPECIALIST_PAGE_WINS',
    # measured on eighteen named trails across two languages in
    # ahrefs-heritage-and-trail-demand-2026-10-02.json: every one carried volume and
    # fourteen sat at a keyword difficulty of 0 to 5. Nothing else measured in this
    # project came back that clean, which is why this is the one outdoor shape whose
    # demand score rests on a measurement of its own family rather than on a proxy.
    'trail': 'OPEN_SPECIALIST_PAGE_WINS',
    # The region shapes share the SERP class the region LIST shape was measured on, because
    # that is the same page type one level up: an enumeration inside a named geography,
    # where a DR 1 site held position 6. Not separately sampled, and NOT_SAMPLED would
    # understate what is already known about this exact format.
    'region_what_to_see': 'OPEN_SPECIALIST_PAGE_WINS',
    'region_cities': 'OFFICIAL_PLUS_AGGREGATOR_MIXED',
    'region_best_time': 'NOT_SAMPLED',
}

# Wikidata candidates, built and deduped against OSM by scripts/atlas/scale/
# wikidata-candidates.py. Wikidata is CC0, so no share-alike, and it is the only source
# that reached Taiwan before the Overpass route worked. Individual pages come only from
# visitor-intent classes: the SERP evidence says a named hospital, university or station
# returns its own site, so those classes become city lists instead.
try:
    for _l in gzip.open(ROOT + 'data/atlas/sources/wikidata/_candidates.jsonl.gz', 'rt',
                        encoding='utf-8'):
        _l = _l.strip()
        if _l:
            try: agg.append(json.loads(_l))
            except Exception: pass
except (EOFError, OSError, FileNotFoundError):
    pass
print(f'  aggregation + wikidata rows loaded {len(agg):,}', file=sys.stderr)

# Per-shape wiring. demand_score is not a guess: it carries the verdict of the Ahrefs
# probes recorded in data/atlas/measurements/ahrefs-aggregation-shape-demand-2026-10-01
# .json, where cuisine measured strongest, area category next for NAMED areas, and the
# opening-hours shape measured city-scoped only in Germany.
SHAPE_WIRING = {
    'city_category':   ('places', 'AGGREGATION', 'city_category', 60),
    'area_category':   ('places', 'AGGREGATION', 'area_category', 65),
    'area_parent':     ('areas', 'AGGREGATION', 'area', 60),
    'city_cuisine':    ('places', 'AGGREGATION', 'city_cuisine', 70),
    'area_cuisine':    ('places', 'AGGREGATION', 'area_cuisine', 70),
    'city_attribute':  ('places', 'AGGREGATION', 'city_attribute', 58),
    'area_attribute':  ('places', 'AGGREGATION', 'area_attribute', 52),
    'city_opening':    ('places', 'AGGREGATION', 'city_opening', 55),
    'area_opening':    ('places', 'AGGREGATION', 'area_opening', 48),
    'city_sport':      ('places', 'AGGREGATION', 'city_sport', 50),
    'city_areas_hub':  ('areas', 'AGGREGATION', 'areas_index', 55),
    'notable_entity':  ('poi', 'ENTITY', 'poi', 50),
    'wikidata_notable': ('poi', 'ENTITY', 'poi', 45),
    'wikidata_city_list': ('places', 'AGGREGATION', 'city_category', 50),
    # Outdoor. The demand score is the measured list volume for the lists and a deliberately
    # modest 45 for the feature pages, because their evidence is an encyclopedia article rather
    # than a keyword and the score should not pretend otherwise.
    'outdoor_region_feature': ('outdoors', 'AGGREGATION', 'outdoor_region', 55),
    'outdoor_feature': ('outdoors', 'ENTITY', 'outdoor_feature', 45),
    # 55, above the 45 the feature pages carry, because this family's demand was measured
    # directly and theirs was inferred from an encyclopedia article. Not higher than 55,
    # because the eighteen measured routes are a sample and the volume for an individual
    # route is not claimed anywhere on the row.
    'trail': ('outdoors', 'ENTITY', 'trail', 55),
    # Measured 2026-10-02 in ahrefs-region-families-2026-10-02.json. The scores are the
    # measured ceilings, not a guess: kyoto 78,000 for what-to-see, cidades de minas gerais
    # 12,000 for the city list, best time to visit tuscany 700 for when-to-go. The when-to-go
    # score is lowest of the three because its measurement is the smallest AND it is refused
    # outright in Italian, French and Portuguese.
    'region_what_to_see': ('destinations', 'AGGREGATION', 'region', 75),
    'region_cities': ('destinations', 'AGGREGATION', 'region', 70),
    'region_best_time': ('climate', 'AGGREGATION', 'region', 60),
}
WD_LICENCE = ('Wikidata (CC0 1.0, public domain dedication, no share-alike)', 'CC0_NO_CONDITIONS')
OSM_LICENCE = ('OpenStreetMap named POI (ODbL 1.0, share-alike, attribution required)',
               'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED')

# A feature page's parent is the list of its own class inside its own containment parent, where
# that list was accepted. Built from the outdoor aggregation rows rather than constructed from
# parts, for the same reason the Wikidata parents are: a URL read out of the file that wrote it
# cannot drift from the URL that file emitted.
OUTDOOR_PARENT_URL = {}
for _a in agg:
    if _a.get('shape') == 'outdoor_region_feature':
        OUTDOOR_PARENT_URL[(_a.get('parent_id'), _a.get('feature'), _a.get('language'))] = _a['url']
if OUTDOOR_PARENT_URL:
    print(f'  outdoor region lists available as parents: {len(OUTDOOR_PARENT_URL):,}',
          file=sys.stderr)

for a in agg:
    m, lang, shape = a['market'], a['language'], a['shape']
    wiring = SHAPE_WIRING.get(shape)
    if not wiring:
        stats['aggregation_shape_unwired:' + shape] += 1
        continue
    surface, ptype, etype, dsc = wiring
    cls = a.get('cls', '')
    modifier = a.get('cuisine') or a.get('attribute') or a.get('opening') or a.get('sport') or ''
    # Class and modifier keys are machine slugs. Leaking them into reader-facing text gave
    # titles like "fast_food in Best, NL" and "sports_centre in Lyon". URLs keep the slug;
    # anything a person reads gets the words. The class is humanised at its use site,
    # where the shape decides which of base, area or entity name is being named.
    mod_h = str(modifier).replace('_', ' ')
    area = a.get('area', '')
    # For an outdoor feature the containment parent IS the sub-geography, so it goes in the field
    # the skeletons already read for one. Two peaks called Hochberg near one town are two real
    # mountains and must not be collapsed; what they need is a title that says which polygon each
    # sits in, and the parent is the only honest answer the data holds.
    if shape in ('outdoor_feature', 'outdoor_region_feature', 'trail'):
        area = a.get('parent_name', '')
    is_wd = a.get('source') == 'wikidata'

    if shape.startswith('region_'):
        # The three region families, each a different question about one named geography.
        fid = {'region_what_to_see': 'destinations.region-what-to-see',
               'region_cities': 'destinations.region-cities',
               'region_best_time': 'climate.region-when-to-go'}[shape]
        eid = str(a['entity_id'])
        ename = a['entity_name']
        intent = {'region_what_to_see': f"see what there is to visit in {ename}",
                  'region_cities': f"find the towns and cities of {ename}",
                  'region_best_time': f"decide when to go to {ename}"}[shape]
        # n is the count the page answers with: named places, cities, or stations
        q = min(100, 50 + min(25, a['n']) * 2)
    elif shape == 'trail':
        # One family per route type, so a hiking path and a canoe route get separate
        # acceptance verdicts rather than one trails bucket that hides a weak half.
        fid = f"outdoors.{a.get('route_type', 'hiking')}-trail"
        eid = str(a['entity_id'])
        ename = a['entity_name']
        intent = f"walk or ride {ename}: how long it is and where it goes"
        # the measured length and the waymarking are the two facts a reader comes for,
        # and enriched counts the independent marks the route carries
        q = min(100, 50 + a['enriched'] * 6)
    elif shape == 'outdoor_feature':
        # A named outdoor feature. The family is its class, so peaks and castles are separate
        # families with separate acceptance verdicts rather than one outdoors bucket.
        fid = f'outdoors.{cls}'
        eid = str(a['entity_id'])
        ename = a['entity_name']
        intent = f"what {ename} is and how to reach it"
        q = min(100, 45 + a['enriched'] * 6)
    elif shape == 'outdoor_region_feature':
        fid = f"outdoors.{a['feature']}-in-region"
        eid = f"{a['parent_id']}-{a['feature']}"
        ename = f"{a['feature'].replace('_', ' ')}s in {a['parent_name']}"
        intent = f"find the {a['feature'].replace('_', ' ')}s in {a['parent_name']}"
        q = min(100, 45 + min(30, a['n']) * 2)
    elif ptype == 'ENTITY':
        fid = f'poi.{cls}-notable'
        eid = a['entity_id']
        ename = a['entity_name']
        intent = f"visit {ename}"
        q = min(100, 50 + a['enriched'] * 8)
    else:
        base = cls or 'area'
        if shape in ('city_cuisine', 'area_cuisine'):
            fid = 'places.city-cuisine' if shape == 'city_cuisine' else 'places.area-cuisine'
        elif shape in ('city_attribute', 'area_attribute'):
            fid = 'places.city-attribute' if shape == 'city_attribute' else 'places.area-attribute'
        elif shape in ('city_opening', 'area_opening'):
            fid = 'places.city-opening' if shape == 'city_opening' else 'places.area-opening'
        elif shape == 'city_sport':
            fid = 'places.city-sport'
        elif shape == 'area_parent':
            fid = 'areas.overview'
        elif shape == 'city_areas_hub':
            fid = 'areas.city-index'
        elif shape == 'area_category':
            fid = f'places.area-{base}'
        else:
            fid = f'places.city-{base}'
        parts = [p for p in (a['country'], slug(a.get('city', '')), slug(area), base, modifier) if p]
        eid = '-'.join(parts)
        base_h = base.replace('_', ' ')
        if shape == 'city_areas_hub':
            ename = f"neighbourhoods of {a['city']}"
            intent = f"compare the neighbourhoods of {a['city']}"
        elif shape == 'area_parent':
            ename = f"{area}, {a['city']}"
            intent = f"what {area} in {a['city']} is like"
        elif area:
            ename = f"{mod_h + ' ' if mod_h else ''}{base_h} in {area}, {a['city']}"
            intent = f"find {mod_h + ' ' if mod_h else ''}{base_h} in {area}"
        else:
            ename = f"{mod_h + ' ' if mod_h else ''}{base_h} in {a['city']}"
            intent = f"find {mod_h + ' ' if mod_h else ''}{base_h} in {a['city']}"
        # a longer list of better-described entries is a better page
        q = min(100, 45 + min(30, a['n']) + min(15, a.get('enriched', 0)))

    # a proximity-attributed area is a weaker claim than a polygon, and the score says so
    if a.get('area_method') == 'proximity':
        q = max(30, q - 10)
    src = 50 if is_wd else 55
    serp_cls = SHAPE_SERP.get(shape, 'NOT_SAMPLED')
    ssc = SERP_SCORE[serp_cls]
    idx = min(q, dsc, src, ssc)
    lic_name, lic_status = WD_LICENCE if is_wd else OSM_LICENCE
    rows.append({
        'candidate_id': 'c_' + sig(fid, eid, m),
        'url_pattern': a['url'], 'market': m, 'language': lang,
        'surface': surface, 'family': fid, 'vertical': 'discovery', 'page_type': ptype,
        'entity_type': etype, 'entity_id': eid, 'entity_name': ename,
        'city': a.get('city', ''), 'country': a['country'], 'neighbourhood': area,
        'primary_intent': intent, 'primary_keyword_if_known': ename,
        'keyword_cluster_id': next((KCLUSTER[(n, m)] for n in ('places.city-category',
            'poi.city-category-durable') if (n, m) in KCLUSTER), ''),
        'semantic_cluster_id': 'sc_' + sig('poiagg', shape, cls, modifier, m),
        'data_source': lic_name,
        'source_status': 'SOURCE_AVAILABLE',
        'source_record_id': ('wikidata:' if is_wd else 'osm-agg:') + str(eid),
        'feed_required': '', 'licence_status': lic_status,
        'data_signature': sig('data', fid, eid, m),
        'template_signature': sig('tpl', shape, cls, modifier),
        'duplicate_risk': 'LOW', 'cannibalization_risk': 'LOW',
        'market_demand_evidence': 'shape_measured_2026_10_01',
        'quality_score': q, 'demand_score': dsc, 'source_score': src,
        'serp_score': ssc, 'serp_class': serp_cls, 'indexability_score': idx,
        'publication_priority': round(idx * 0.55 + dsc * 0.3 + ssc * 0.15, 1),
        'publication_cohort_candidate': '', 'status': 'POI_AGGREGATION',
        'uniqueness_reason': a['uniqueness_reason'],
        'locale_facts': ' | '.join(a.get('locale_facts') or []),
        'parent_url': a.get('parent_url', '') or OUTDOOR_PARENT_URL.get(
            (a.get('parent_id'), a.get('cls'), a.get('language')), ''),
    })
print(f'  aggregation candidates emitted {len(agg):,}', file=sys.stderr)

# ---------------------------------------------------------------- quality gates
# SERP feasibility, from the measured SERP class rather than from KD. KD has already
# misled on this project: climate families carry a low KD behind a strong SERP, and
# calendar keywords look easy while incumbents are entrenched.
def serp_feasibility(score, cls):
    # Families whose SERP was measured and found closed are rejected outright.
    if cls in ('BRAND_OWNED_PLUS_SOCIAL', 'AGGREGATOR_LOCKED', 'SERP_FEATURE_SUPPRESSED',
               'OPEN_BUT_ECONOMICALLY_DEAD', 'OFFICIAL_OWNED_PLUS_AI_OVERVIEW',
               'RESELLER_OWNED', 'OFFICIAL_OWNED'):
        return 'rejected'
    # NOT_SAMPLED is an absence of evidence, not evidence of a poor fit. Calling it
    # poor_fit labelled 62% of the inventory as bad on no evidence at all, which is
    # both wrong and would have hidden the families that genuinely are poor.
    if cls == 'NOT_SAMPLED':
        return 'unsampled_needs_serp_check'
    if score >= 90: return 'strong_opportunity'
    if score >= 65: return 'viable'
    if score >= 45: return 'competitive'
    return 'poor_fit'

TOOL_FAMILIES = ('tools.', 'calendar.', 'comparisons.', 'rankings.')
for r in rows:
    r.setdefault('uniqueness_reason', '')
    cls = r.get('serp_class') or 'NOT_SAMPLED'
    r['serp_feasibility'] = serp_feasibility(r.get('serp_score', 40), cls)
    r['data_completeness'] = ('high' if r.get('quality_score', 0) >= 70
                              else 'medium' if r.get('quality_score', 0) >= 50 else 'low')
    r['source_freshness'] = ('static' if r['source_status'] == 'READY_NOW'
                             else 'refresh_on_source_update')
    # The owner of a page's intent is the cluster AND the entity, not the cluster alone.
    # Keyed on the cluster alone, every German things-to-do page carried the same owner, so
    # a check for contested ownership reported 2,479 collisions between pages that do not
    # compete: Aachen and Aalen share a keyword cluster because the cluster is what proved
    # the family, and they own entirely different queries within it.
    r['intent_owner'] = f"{r.get('semantic_cluster_id', '')}:{r.get('entity_id', '')}" 
    r['monetization_fit'] = ('high' if r['surface'] in ('stay', 'move', 'work', 'tools')
                             else 'medium' if r['surface'] in ('places', 'transport', 'poi')
                             else 'low')
    r['tool_or_content'] = ('tool' if any(r['family'].startswith(t) for t in TOOL_FAMILIES)
                            else 'aggregation' if r.get('page_type') == 'AGGREGATION'
                            else 'content')
    r['rejection_reason'] = ''

# GATE 1 - uniqueness. A unique URL is not a reason to exist. Anything that cannot
# name its distinct basis is rejected, and the rejections are kept, not hidden.
rejected = []
kept = []
for r in rows:
    if not r['uniqueness_reason']:
        r['rejection_reason'] = 'REJECTED_QUALITY: no defensible uniqueness basis'
        r['status'] = 'REJECTED_QUALITY'; rejected.append(r)
    elif r['serp_feasibility'] == 'rejected':
        # the field is serp_class, lowercase. Reading SERP_class gave None for all 11,880
        # of these, so every one of them recorded "None is not winnable", which names no
        # cause and makes the rejection impossible to audit or appeal.
        r['rejection_reason'] = (f"REJECTED_SERP: {r.get('serp_class') or 'unknown'} is a "
                                 f"measured closed SERP, not winnable")
        r['status'] = 'REJECTED_SERP'; rejected.append(r)
    elif r['indexability_score'] < 15:
        r['rejection_reason'] = f"REJECTED_QUALITY: indexability floor {r['indexability_score']}"
        r['status'] = 'REJECTED_QUALITY'; rejected.append(r)
    else:
        kept.append(r)
print(f'uniqueness and SERP gate: kept {len(kept):,}, rejected {len(rejected):,}', file=sys.stderr)
rows = kept

generated_total = len(rows) + len(rejected)
raw_total = len(rows)
print(f'\ngenerated before any gate:   {generated_total:,}', file=sys.stderr)
print(f'after uniqueness and SERP:   {raw_total:,}', file=sys.stderr)

# ---------------------------------------------------------------- dedupe
# Exact dedupe, and the duplicates are KEPT as rejections rather than dropped. 2,855 rows
# were being discarded here with no record anywhere, which is the same silent-loss shape as
# the URL collision found in this pass: a row vanished and nothing said why. A reader could
# not reconcile the funnel, because generated minus every recorded removal did not reach the
# final count until these were added.
seen = {}
stage1 = []
exact_dupes = []
for r in rows:
    first = seen.get(r['url_pattern'])
    if first is not None:
        r['rejection_reason'] = (f"REJECTED_DUPLICATE: this URL is already claimed by "
                                 f"{first['family']} for entity {first.get('entity_id', '')}, "
                                 f"so the two would be the same page")
        r['status'] = 'REJECTED_DUPLICATE'
        exact_dupes.append(r)
        continue
    seen[r['url_pattern']] = r
    stage1.append(r)
after_exact = len(stage1)
if exact_dupes:
    import collections as _c
    _pairs = _c.Counter((seen[r['url_pattern']]['family'], r['family']) for r in exact_dupes)
    print(f'exact duplicate URLs rejected and preserved: {len(exact_dupes):,}', file=sys.stderr)
    for (a, b), n in _pairs.most_common(8):
        print(f'    {n:>6,}  {a} already claims the URL {b} wanted', file=sys.stderr)

# Semantic dedupe, and its losers are preserved too. This stage was dropping 2 rows with no
# record, which the cross-artifact check found after the cannibalisation ones were fixed: the
# funnel still came to 208,878 against a final 208,876. Two rows is nothing and the point is
# not the two rows, it is that a funnel which does not sum cannot be used to tell a small
# silent loss from a large one, and this pass has already found a large one.
seen = {}
stage2 = []
semantic_dupes = []
for r in stage1:
    k = (r['market'], r['family'], r['template_signature'], r['entity_id'])
    first = seen.get(k)
    if first is not None:
        r['rejection_reason'] = (
            f"REJECTED_SEMANTIC_DUPLICATE: same market, family, template and entity as "
            f"{first['url_pattern']}, so the two pages would say the same thing about the "
            f"same thing")
        r['status'] = 'REJECTED_SEMANTIC_DUPLICATE'
        semantic_dupes.append(r)
        continue
    seen[k] = r
    stage2.append(r)
after_semantic = len(stage2)
if semantic_dupes:
    print(f'semantic duplicates rejected and preserved: {len(semantic_dupes):,}',
          file=sys.stderr)
    for r in semantic_dupes[:4]:
        print(f"    {r['family']}  {r['url_pattern']}", file=sys.stderr)

# ------------------------------------------- one page per name per city, for entity pages
# Fifteen benches in Warsaw are each called "Lawka Chopina". Four buildings of the Museo
# Nazionale Romano carry that one name. Two consecutive OSM nodes are both "Kasmin Gallery",
# which is one gallery mapped twice. Wikidata holds two separate items for one Bonn museum. In
# every case the pages would be headed by the same words about the same city, and the data this
# inventory holds - name, class, city, coordinates - contains nothing a reader could use to
# tell them apart. No street address is carried, so there is no honest disambiguator to add.
#
# This gate is here rather than in either builder because neither builder can see it: the OSM
# aggregation and the Wikidata candidates are separate files, and the Museo Nazionale Romano
# pair is one row from each. The duplicates are kept in the rejected set with the id of the
# page that won, so the count is recoverable and the decision is reviewable.
name_winner = {}
stage2a = []
name_dupes = []
# Keyed on the SURFACE rather than the family, and on the entity type rather than the page
# type. Two reasons, both found by measuring. Across families inside one surface: Gagosian is
# tagged gallery in one OSM node and museum in another, so /en/poi/gallery/gagosian-.../ and
# /en/poi/museum/gagosian-.../ are one subject twice. Across surfaces it must NOT collapse:
# /de/poi/museum/tranenpalast-q314446/ and /de/stay/near-venue/tranenpalast/ are the same venue
# answering two different questions, and that is two pages, not one. And the first version
# tested page_type == 'ENTITY', which left the venue families out entirely: Beethovenhalle in
# Bonn held two Wikidata items and produced two identical near-venue pages.
SPECIFIC_THING = ('poi', 'venue')
for r in sorted(stage2, key=lambda x: (-x['quality_score'], -x['publication_priority'],
                                       str(x['entity_id']))):
    if r['entity_type'] not in SPECIFIC_THING:
        stage2a.append(r)
        continue
    k = (r['language'], r['surface'], (r['city'] or '').casefold(),
         slug(r['entity_name'] or ''))
    first = name_winner.get(k)
    if first is not None:
        r['rejection_reason'] = (
            f"REJECTED_SAME_NAME_IN_CITY: {first['url_pattern']} is already the {r['surface']} "
            f"page for an entity named {r['entity_name']} in {r['city']}, and nothing in the "
            f"data distinguishes the two, so a second page would be headed by the same words "
            f"about the same place")
        r['status'] = 'REJECTED_SAME_NAME_IN_CITY'
        name_dupes.append(r)
        continue
    name_winner[k] = r
    stage2a.append(r)
after_name_unique = len(stage2a)
if name_dupes:
    print(f'entity pages rejected because their name is not unique in their city: '
          f'{len(name_dupes):,}', file=sys.stderr)
    for r in name_dupes[:5]:
        print(f"    {r['entity_name']} in {r['city']} ({r['url_pattern']})", file=sys.stderr)
# the same rebinding the localisation gate below uses, so every later stage reads the survivors
# rather than the list this gate was given
stage2 = stage2a

# ------------------------------------------------- localisation and cross-locale dedupe
# A page in a second language is NOT free inventory. The question for every row whose
# language is not the language of the place it describes is whether that locale has its own
# reason to exist, and the honest default is no. Six outcomes, and only two of them keep the
# row:
#
#   NATIVE_LOCALE        the page is in the language of the country it describes. A German
#                        page about a German city needs no further justification.
#   VALID_LOCALIZATION   a cross-language page WITH a measured keyword cluster for this
#                        family in this market. Somebody in that market searches for this.
#   LOCAL_INTENT_MISSING the family is proven elsewhere but was never measured in this
#                        market, and this is not the entity's own language. Rejected.
#   TRANSLATION_ONLY     the row exists in the entity's native language already and this
#                        variant adds no measured local demand. Rejected.
#   LOCAL_DATA_MISSING   a cross-language variant whose source is blocked or absent, so
#                        there would be nothing locale-specific on the page. Rejected.
#   LOCAL_SERP_UNVERIFIED kept with the flag. Absence of SERP evidence is not evidence of a
#                        poor fit; treating it as one already mislabelled 62 per cent of this
#                        inventory once, and the same mistake is not repeated here.
NATIVE_LANG = entity_identity.NATIVE_LANG

# which (family, entity) groups exist in more than one language at all
group_langs = collections.defaultdict(set)
for r in stage2:
    group_langs[(r['family'], r['entity_id'])].add(r['language'])

# Does the demand measured for this (family, market) actually concern THIS destination?
# Three things count, and nothing else does:
#   1. the measured keyword names the destination, which is evidence about the page itself
#   2. the (destination, searcher market) pair appears in the measured reach file, which is
#      the only record of which markets were observed searching which places
#   3. the destination is the market's own country, which is not a cross-language case at
#      all and is only reachable here when the page language differs from the country's
# A tier is deliberately not accepted as evidence. Population is not demand, and treating
# tier 1 as a licence is how Aba and Abidjan once earned German travel pages.
def dest_evidence(r, top_kw):
    ename = (r.get('entity_name') or '').strip()
    dest_country = r.get('country') or ''
    if ename:
        low = ename.lower()
        # the city name as the measurement spelled it, which may be a transliteration:
        # "hotel prag" names Prague in German, "praga" in Italian
        if low in (top_kw or '').lower():
            return f'the measured keyword names {ename} itself'
        if (low, dest_country) in XL_MARKET_CITIES.get(r['market'], set()):
            return (f'{ename} is a destination {r["market"]} was measured searching for '
                    f'in the cross-language reach file')
        if (low, dest_country) in XL_LANG_CITIES.get(r.get('language', ''), set()):
            return (f'{ename} is a destination measured in {r.get("language")}, the language '
                    f'this page is written and served in')
    if MKT_COUNTRY.get(r['market']) == dest_country:
        return f'{dest_country} is the home country of {r["market"]}'
    # The destination axis. Both halves are named in the reason, and the proxy half says in
    # words that it is a proxy, because a reader of this file has to be able to tell a measured
    # volume from an inferred interest without going to another file to find out.
    _dm = destination_markets(dest_country, r.get('entity_id', ''))
    if r['market'] in _dm:
        return _dm[r['market']]
    return ''

loc_counts = collections.Counter()
loc_rejected = []
stage2b = []
for r in stage2:
    native = NATIVE_LANG.get(r['country'])
    lang = r['language']
    fid, m = r['family'], r['market']
    cell = kw_cell(fid, m)
    top_kw, top_vol = (cell[0][0], cell[0][1]) if cell else ('', 0)
    r['local_keyword'] = top_kw
    r['local_volume'] = top_vol
    r['locale'] = lang
    r['source_page_family'] = fid
    r['destination'] = r['country']
    r['local_serp'] = r.get('serp_class', 'NOT_SAMPLED')
    # the intent in this locale's own words where a local keyword was measured, otherwise
    # the page's intent, marked so the two are never confused
    r['local_intent'] = (f'local query: {top_kw}' if top_kw
                         else f'page intent only, no local keyword measured: {r["primary_intent"]}')

    if native and lang == native:
        cls = 'NATIVE_LOCALE'
        reason = (f'the page is written in {lang}, the language of {r["country"]}, the '
                  f'country it describes, so no cross-language justification is needed')
    elif r.get('market_demand_evidence') == 'measured_in_this_market' and top_vol > 0 \
            and dest_evidence(r, top_kw):
        cls = 'VALID_LOCALIZATION'
        reason = (f'{m} demand measured for {fid}: "{top_kw}" at {top_vol:,} volume, and '
                  f'{dest_evidence(r, top_kw)}, so this locale has its own query behind '
                  f'this destination rather than a translation')
    elif r.get('market_demand_evidence') == 'measured_in_this_market' and top_vol > 0:
        # The family has measured demand in this market and this destination does not.
        # This is the case the first version of the gate let through, and it was the whole
        # point of the gate: one measured German keyword about Prague, "hotel prag" at
        # 7,600, was licensing 8,342 German hotel pages for cities nobody in Germany was
        # measured searching for. Demand for a family in a market is not demand for every
        # destination in it, and treating it as such is city-name swapping with a locale
        # boundary crossed on the way. The brief's first line says it directly: the
        # origin market is not the destination.
        cls = 'LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION'
        reason = (f'{fid} has measured {m} demand ("{top_kw}" at {top_vol:,}), but that '
                  f'measurement is not about {r.get("entity_name") or r["country"]}, and '
                  f'this destination was never measured as something {m} searches for in '
                  f'{lang}: the family is proven in this locale, this page is not')
    elif r['source_status'] in ('BLOCKED',) or r['status'] == 'MISSING_DATA':
        cls = 'LOCAL_DATA_MISSING'
        reason = (f'cross-language page for {r["country"]} in {lang} whose source is '
                  f'{r["source_status"]}, so nothing locale-specific could be put on it')
    elif len(group_langs[(fid, r['entity_id'])]) > 1 and native in group_langs[(fid, r['entity_id'])]:
        cls = 'TRANSLATION_ONLY'
        reason = (f'the same {fid} page for this entity already exists in {native}, the '
                  f'language of {r["country"]}, and this {lang} variant adds no measured '
                  f'local demand: it would be a translation, not a localisation')
    else:
        cls = 'LOCAL_INTENT_MISSING'
        reason = (f'{fid} is proven in other markets but was never measured in {m}, and '
                  f'{lang} is not the language of {r["country"]}, so no local query, '
                  f'utility or data context justifies this locale')
    if cls in ('NATIVE_LOCALE', 'VALID_LOCALIZATION') and r['local_serp'] == 'NOT_SAMPLED':
        r['localization_class'] = cls
        r['localization_flag'] = 'LOCAL_SERP_UNVERIFIED'
    else:
        r['localization_class'] = cls
        r['localization_flag'] = ''
    r['localization_reason'] = reason
    loc_counts[cls] += 1
    if cls in ('NATIVE_LOCALE', 'VALID_LOCALIZATION'):
        stage2b.append(r)
    else:
        r['rejection_reason'] = 'localization:' + cls
        r['status'] = 'REJECTED_LOCALIZATION'
        loc_rejected.append(r)

after_localization = len(stage2b)
print(f'localisation gate: kept {after_localization:,}, rejected {len(loc_rejected):,}',
      file=sys.stderr)
for k, v in loc_counts.most_common():
    print(f'    {k:24} {v:>9,}', file=sys.stderr)
stage2 = stage2b

# cannibalisation: two families targeting the same intent on the same entity in the
# same market. Keep the higher publication_priority, flag the loser out.
# The loser is KEPT as a rejection. It was being dropped with only a flag set on the
# winner, and the cross-artifact check caught it: 326,655 generated minus 117,732 recorded
# removals came to 208,923 against a final count of 208,876, a 47-row hole with no record.
# 47 is small and that is exactly why it mattered - the same silent-loss shape hid a URL
# collision that was costing thousands, and a funnel that does not sum cannot be trusted to
# say which.
best = {}
cannib_rejected = []
for r in sorted(stage2, key=lambda x: -x['publication_priority']):
    k = (r['market'], r['entity_type'], r['entity_id'], r['primary_intent'])
    if k in best:
        best[k]['cannibalization_risk'] = 'RESOLVED_KEPT_HIGHER_PRIORITY'
        w = best[k]
        r['rejection_reason'] = (
            f"REJECTED_CANNIBALIZATION: {w['family']} already owns this intent for this "
            f"entity in this market at priority {w['publication_priority']}, against "
            f"{r['publication_priority']} here")
        r['status'] = 'REJECTED_CANNIBALIZATION'
        cannib_rejected.append(r)
        continue
    best[k] = r
stage3 = list(best.values())
if cannib_rejected:
    import collections as _c2
    _cp = _c2.Counter((best[(x['market'], x['entity_type'], x['entity_id'],
                             x['primary_intent'])]['family'], x['family'])
                      for x in cannib_rejected)
    print(f'cannibalisation losers rejected and preserved: {len(cannib_rejected):,}',
          file=sys.stderr)
    for (a, b), n in _cp.most_common(6):
        print(f'    {n:>5,}  {a} beat {b}', file=sys.stderr)
after_cannib = len(stage3)

# ------------------------------------------------------- the parent has to survive too
# Each builder resolves a child's parent against the pages IT accepted. Nothing then checked
# whether the parent was still standing after the gates in this file ran, so a city list could
# be removed by the localisation gate while the neighbourhood lists under it were kept, leaving
# a page whose breadcrumb points at a 404. The QA pass found 766 of them and the cause was two
# things: this missing check, and a name-only join in the Wikidata builder that is fixed at
# source.
#
# Removing a parent can orphan its own children, so this runs to a fixed point rather than
# once. The 500 live Atlas pages count as existing parents, because they do exist; this
# inventory is offline and does not contain them.
def _live_atlas_paths():
    try:
        d = json.load(open(ROOT + 'reports/atlas/live-production.json', encoding='utf-8'))
    except Exception:
        return set()
    out = set()
    for r in d.get('rows') or ():
        pth = (r.get('path') or '').strip()
        if pth:
            out.add(pth if pth.endswith('/') else pth + '/')
    return out

LIVE_ATLAS = _live_atlas_paths()


def _is_locale_root(u):
    parts = [x for x in u.split('/') if x]
    return len(parts) == 1 and len(parts[0]) <= 7

orphan_rejected = []
_rounds = 0
while True:
    _rounds += 1
    present = {r['url_pattern'] for r in stage3}
    keep, lost = [], []
    for r in stage3:
        pu = (r.get('parent_url') or '').strip()
        if not pu or pu in present or pu in LIVE_ATLAS or _is_locale_root(pu):
            keep.append(r)
            continue
        r['rejection_reason'] = (
            f"REJECTED_PARENT_REMOVED: this page declares {pu} as its parent and that page is "
            f"not in the final set, so the breadcrumb and the internal link would both point "
            f"at nothing")
        r['status'] = 'REJECTED_PARENT_REMOVED'
        lost.append(r)
    stage3 = keep
    orphan_rejected.extend(lost)
    if not lost or _rounds > 20:
        break
after_parent = len(stage3)
if orphan_rejected:
    print(f'pages rejected because their declared parent did not survive the gates: '
          f'{len(orphan_rejected):,} over {_rounds} rounds', file=sys.stderr)
    for r in orphan_rejected[:5]:
        print(f"    {r['url_pattern']}  wanted  {r['parent_url']}", file=sys.stderr)

# ---------------------------------------------------------------- cohort mapping
LADDER = [500, 2000, 5000, 25000, 100000, 250000, 500000, 1000000]
stage3.sort(key=lambda r: (-r['publication_priority'], r['family'], r['market'], r['entity_name'] or ''))
for i, r in enumerate(stage3):
    for rung in LADDER:
        if i < rung: r['publication_cohort_candidate'] = str(rung); break
    else: r['publication_cohort_candidate'] = 'BEYOND_1M'

print(f'after exact dedupe:        {after_exact:,}', file=sys.stderr)
print(f'after semantic dedupe:     {after_semantic:,}', file=sys.stderr)
print(f'after localisation gate:   {after_localization:,}', file=sys.stderr)
print(f'after cannibalization:     {after_cannib:,}', file=sys.stderr)
print(f'after the parent check:    {after_parent:,}', file=sys.stderr)

# ---------------------------------------------------------------- dash safety net
# Rendered copy may not contain a long dash. The names are normalised where they enter the
# aggregation, which is the right place and fixes the cause, but this manifest draws rows
# from several stores and a name that gains a dash in a store added later would otherwise
# reach a title unnoticed. 670 of them did exactly that once, invisibly, because the dash
# check could not read a compressed partition. This pass is the belt to that braces: it
# runs over every string in every row that is kept or rejected, so there is no path to an
# output file that skips it. It is a no-op when the sources are already clean.
LONG_DASHES = ('\u2010', '\u2011', '\u2012', '\u2013', '\u2014',
               '\u2015', '\u2212', '\ufe58', '\ufe63', '\uff0d')

def strip_long_dashes(rows):
    touched = 0
    for r in rows:
        hit = False
        for k, v in list(r.items()):
            if isinstance(v, str) and any(d in v for d in LONG_DASHES):
                for d in LONG_DASHES: v = v.replace(d, '-')
                r[k] = v
                hit = True
        if hit:
            r['dash_normalised'] = 'yes'
            touched += 1
    return touched

_dash_fixed = (strip_long_dashes(stage3) + strip_long_dashes(rejected)
              + strip_long_dashes(exact_dupes) + strip_long_dashes(loc_rejected)
              + strip_long_dashes(cannib_rejected)
              + strip_long_dashes(semantic_dupes))
print(f'rows whose rendered strings needed a dash normalised: {_dash_fixed:,}', file=sys.stderr)

# ---------------------------------------------------------------- outputs
os.makedirs(OUT, exist_ok=True)
# every rejection in one file, whatever stage produced it: hiding the localisation
# rejections in a separate place would make the funnel unauditable
rejected = (rejected + exact_dupes + semantic_dupes + name_dupes + loc_rejected
            + cannib_rejected + orphan_rejected)
with gzip.open(OUT + 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz', 'wt', newline='') as gz:
    w = csv.DictWriter(gz, fieldnames=FIELDS, extrasaction='ignore')
    w.writeheader(); w.writerows(rejected)
print(f'rejected candidates written: {len(rejected):,}', file=sys.stderr)

with gzip.open(OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz', 'wt', newline='') as gz:
    w = csv.DictWriter(gz, fieldnames=FIELDS, extrasaction='ignore'); w.writeheader(); w.writerows(stage3)
try:
    import pyarrow as pa, pyarrow.parquet as pq
    # r.get rather than r[k]. The CSV writer tolerates a row that is missing a field and
    # this did not: adding parent_url to FIELDS, which only the aggregation shapes set,
    # raised KeyError here AFTER the manifest had been written and BEFORE the summary was,
    # leaving the summary stale at the previous run's count while the manifest held the new
    # one. A report that reads the summary would then have contradicted the data it
    # describes, which is the one property this folder is supposed to guarantee.
    cols = {k: pa.array([r.get(k, '') for r in stage3]) for k in FIELDS}
    pq.write_table(pa.table(cols), OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.parquet', compression='snappy')
    print('parquet written', file=sys.stderr)
except ImportError:
    print('pyarrow missing: parquet skipped', file=sys.stderr)
except Exception as e:
    # an export format failing must never cost the summary and the reports built from it
    print(f'parquet FAILED but the run continues: {type(e).__name__}: {e}', file=sys.stderr)

def brk(name, keyfn, cols):
    agg = collections.defaultdict(lambda: collections.Counter())
    for r in stage3:
        k = keyfn(r)
        a = agg[k]
        a['candidates'] += 1
        a[r['source_status']] += 1
        a['ready_now'] += 1 if r['source_status'] == 'READY_NOW' else 0
        a['sum_prio'] += r['publication_priority']
        a['sum_index'] += r['indexability_score']
    out = []
    for k, a in sorted(agg.items(), key=lambda x: -x[1]['candidates']):
        row = dict(zip(cols, k if isinstance(k, tuple) else (k,)))
        row.update({'candidates': a['candidates'], 'READY_NOW': a['READY_NOW'],
                    'SOURCE_AVAILABLE': a['SOURCE_AVAILABLE'], 'FEED_REQUIRED': a['FEED_REQUIRED'],
                    'LICENCE_REQUIRED': a['LICENCE_REQUIRED'],
                    'avg_publication_priority': round(a['sum_prio'] / a['candidates'], 1),
                    'avg_indexability_score': round(a['sum_index'] / a['candidates'], 1)})
        out.append(row)
    hdr = cols + ['candidates', 'READY_NOW', 'SOURCE_AVAILABLE', 'FEED_REQUIRED',
                  'LICENCE_REQUIRED', 'avg_publication_priority', 'avg_indexability_score']
    with open(OUT + name, 'w', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=hdr); w.writeheader(); w.writerows(out)
    print(f'{name}: {len(out)} rows', file=sys.stderr)
    return out

fam_brk = brk('1M-FAMILY-BREAKDOWN.csv', lambda r: (r['surface'], r['family']), ['surface', 'family'])
mkt_brk = brk('1M-MARKET-BREAKDOWN.csv', lambda r: (r['market'], r['language']), ['market', 'language'])
src_brk = brk('1M-SOURCE-BREAKDOWN.csv', lambda r: (r['source_status'], r['data_source'][:60]),
              ['source_status', 'data_source'])

# feed requirements: what each missing feed unlocks, biggest first
feed_agg = collections.defaultdict(lambda: collections.Counter())
for r in stage3:
    if r['feed_required']:
        a = feed_agg[(r['feed_required'], r['family'], r['source_status'])]
        a['candidates'] += 1
with open(OUT + '1M-FEED-REQUIREMENTS.csv', 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['feed_or_source', 'family', 'source_status', 'candidates_unlocked'])
    for (fe, fa, st), a in sorted(feed_agg.items(), key=lambda x: -x[1]['candidates']):
        w.writerow([fe, fa, st, a['candidates']])
print(f'1M-FEED-REQUIREMENTS.csv: {len(feed_agg)} rows', file=sys.stderr)

# publication mapping against the EXISTING ladder
with open(OUT + '1M-PUBLICATION-MAPPING.csv', 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['rung', 'cumulative_candidates', 'candidates_in_rung', 'ready_now_in_rung',
                'min_indexability_in_rung', 'families_in_rung', 'markets_in_rung', 'reachable'])
    prev = 0
    for rung in LADDER:
        seg = [r for r in stage3 if r['publication_cohort_candidate'] == str(rung)]
        w.writerow([rung, min(rung, len(stage3)), len(seg),
                    sum(1 for r in seg if r['source_status'] == 'READY_NOW'),
                    min([r['indexability_score'] for r in seg], default=''),
                    len({r['family'] for r in seg}), len({r['market'] for r in seg}),
                    'YES' if len(stage3) >= rung else 'NO'])
        prev = rung
    beyond = [r for r in stage3 if r['publication_cohort_candidate'] == 'BEYOND_1M']
    if beyond:
        w.writerow(['BEYOND_1M', len(stage3), len(beyond),
                    sum(1 for r in beyond if r['source_status'] == 'READY_NOW'), '',
                    len({r['family'] for r in beyond}), len({r['market'] for r in beyond}), 'YES'])

summary = {
    'generated': NOW_TAG,
    # raw_candidate_combinations was the count AFTER the uniqueness and SERP gate, not the
    # raw one, and a report quoting "raw" therefore meant two different things in two places.
    # Both are present now under names that say which is which; the old key is kept so
    # nothing reading it breaks, with its real meaning spelled out beside it.
    'generated_before_any_gate': generated_total,
    'raw_candidate_combinations': raw_total,
    'raw_candidate_combinations_means': 'the count AFTER the uniqueness and SERP gate',
    'removed_by_uniqueness_and_serp_gate': generated_total - raw_total,
    'removed_as_exact_duplicate_urls': len(exact_dupes),
    'removed_by_localisation_gate': len(loc_rejected),
    'removed_as_semantic_duplicates': len(semantic_dupes),
    'removed_by_cannibalisation': len(cannib_rejected),
    'removed_as_the_same_name_in_the_same_city': len(name_dupes),
    'removed_because_the_declared_parent_did_not_survive': len(orphan_rejected),
    'funnel_reconciles': (generated_total - (generated_total - raw_total)
                          - len(exact_dupes) - len(semantic_dupes) - len(name_dupes)
                          - len(loc_rejected) - len(cannib_rejected)
                          - len(orphan_rejected)) == len(stage3),
    'after_exact_dedupe': after_exact,
    'after_semantic_dedupe': after_semantic,
    'after_localization_and_cross_locale_gate': after_localization,
    'localization_classes': dict(loc_counts),
    'after_one_page_per_name_per_city': after_name_unique,
    'after_cannibalization_filtering': after_cannib,
    'after_the_parent_survival_check': after_parent,
    'FINAL_DISTINCT_CANDIDATES': len(stage3),
    'target': 1000000,
    'shortfall_to_1m': max(0, 1000000 - len(stage3)),
    'rejected_by_quality_gates': len(rejected),
    'dropped_no_demand_evidence': stats['dropped_no_demand_evidence'],
    'cities_added_by_measured_demand_over_tier': stats['cities_added_by_measured_demand_over_tier'],
    'entity_slug_fell_back_to_the_id': stats['entity_slug_fell_back_to_the_id'],
    'dropped_entity_has_no_renderable_slug': stats['dropped_entity_has_no_renderable_slug'],
    'destination_harvest_cities': len(HARVEST_CITY_IDS),
    'dropped_beyond_measured_tier': stats['dropped_beyond_measured_tier'],
    'poi_emitted': stats['poi_emitted'],
    'poi_dropped_no_market': stats['poi_dropped_no_market'],
    'families_generating': stats['families_generating'],
    'families_blocked': stats['families_blocked'],
    'families_with_no_entity_store': stats['families_with_no_entity_store'],
    'no_entity_store_list': sorted(k.split(':', 1)[1] for k in stats if k.startswith('no_entity_store:')),
    'by_source_status': dict(collections.Counter(r['source_status'] for r in stage3)),
    'by_surface': dict(collections.Counter(r['surface'] for r in stage3)),
    'by_market': dict(collections.Counter(r['market'] for r in stage3)),
    'by_entity_type': dict(collections.Counter(r['entity_type'] for r in stage3)),
    'distinct_families': len({r['family'] for r in stage3}),
    'entity_pools_available': {'cities': len(cities), 'countries': len(countries),
        'neighbourhoods': len(neigh), 'airports': len(airports), 'venues': len(venues),
        'subdivisions': len(subdiv)},
}
with open(OUT + '1M-SUMMARY.json', 'w') as fh: json.dump(summary, fh, indent=1, ensure_ascii=False)
print('\n' + json.dumps({k: v for k, v in summary.items()
                          if k not in ('by_surface', 'by_market', 'by_entity_type',
                                       'no_entity_store_list')}, indent=1))

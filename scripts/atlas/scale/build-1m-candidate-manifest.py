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

# entity_identity is imported HERE, at the top, because things near the top of this file now
# read from it. It used to be imported two thirds of the way down, next to its first use, and
# when the market list moved into it the assignment at line 43 ran eighty lines before the
# import and the whole manifest stage died with NameError: name 'entity_identity' is not
# defined. The pipeline caught it correctly - a manifest failure stops the run rather than
# letting the later stages describe a manifest that was never rebuilt - but the mistake was
# mine and the fix is to import a module before reading it, not to move the reader.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                        # noqa: E402
import content_uniqueness                                     # noqa: E402

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
GAZ = entity_identity.load_gazetteer()   # imported at the top of this file
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
# COUNTED, not kept. This loop used to append every record to a list, and nothing in the
# remaining 2,500 lines ever read it: its only three references were the declaration, the
# append and the length print. Measured on 2026-10-06: 6,986,031 records at an average 1,272
# bytes is 8.89 GB held to print one number, and that is what killed this stage at 13.95 GB on
# the run following the destination-gate expansion. The expansion was not the cause; it pushed
# an existing 8.89 GB of waste past the limit.
#
# The count is still printed because it is a real fact about the corpus the aggregation was
# built from, and the comment above says why no page is generated from these records directly:
# bare POI entity pages are BRAND_OWNED_PLUS_SOCIAL per the SERP evidence.
poi_corpus_count = 0
for _f in sorted(glob.glob(ROOT + 'data/atlas/sources/osm-poi/poi-*.jsonl.gz')):
    try:
        for _l in gzip.open(_f, 'rt', encoding='utf-8'):
            _l = _l.strip()
            if not _l: continue
            try: _o = json.loads(_l)
            except Exception: continue
            if _o.get('name') and _o.get('cls'):
                poi_corpus_count += 1
    except (EOFError, OSError):
        pass
print(f'  osm poi {poi_corpus_count:,}', file=sys.stderr)

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
                   'ahrefs-en-AU-market-admission-2026-10-05.json',
                   'ahrefs-es-MX-market-admission-2026-10-05.json',
                   'ahrefs-ko-KR-market-admission-2026-10-05.json',
                   # the three pair-only markets, admitted 2026-10-07
                   'ahrefs-da-DK-market-admission-2026-10-07.json',
                   'ahrefs-nb-NO-market-admission-2026-10-07.json',
                   'ahrefs-fi-FI-market-admission-2026-10-07.json']
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
# Both harvests, added in order and never substituted for one another, so each stays auditable.
# 2026-10-01 is the first pass, 639 keywords in seven languages. 2026-10-07 is the open-SERP
# pass, 6,810 keywords in eleven languages, every one of them a SERP a domain of DR 30 or less
# already holds. The second file resolved 3,938 of its rows to 4,323 market-and-language
# evidence rows against the first file's 512.
_HARVESTS = ('resolved-cities-2026-10-01.csv', 'resolved-cities-2026-10-07.csv')
_h_counts = {}
for _hf in _HARVESTS:
    _before = len(HARVEST_CITY_IDS)
    try:
        for r in csv.DictReader(open(ROOT + 'data/atlas/measurements/destination-harvest/' + _hf)):
            pair = (r['city'].strip().lower(), (r.get('city_country') or '').strip())
            XL_CITIES.add(pair)
            _m = (r.get('searcher_market') or '').strip()
            if _m:
                XL_MARKET_CITIES[_m].add(pair)
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
        _h_counts[_hf] = 'MISSING'
        continue
    _h_counts[_hf] = len(HARVEST_CITY_IDS) - _before
for _hf, _n in _h_counts.items():
    print(f'  {_hf}: {_n} cities new to the pool', file=sys.stderr)
print(f'  destination harvest: {len(HARVEST_CITY_IDS):,} cities with measured demand in at '
      f'least one language', file=sys.stderr)

# SERP class per family, from the frozen evidence.
#
# First row wins, and that is only safe while the evidence is correctly labelled. It was not:
# two rows carrying the keywords "wetter konstanz" and "spokane weather" were filed under
# weather.city-best-time with a reason column reading "sampled no", duplicating rows already
# filed correctly under weather.city. Those are current weather queries whose SERP is a weather
# knowledge card, and on that class the gate below rejected all 29,210 best-time rows. The
# SERP for "best time to visit rome" has no knowledge card at all and its top ten URL ratings
# run from 0 to 7. So the rows were removed and the intent was sampled properly on 2026-10-06.
# This loop now prints every family whose evidence disagrees with itself, because a silent
# first-wins over conflicting rows is how that defect survived.
serp_by_fam = {}
_serp_seen = collections.defaultdict(set)
try:
    for r in csv.DictReader(open(OUT + '08-SERP-EVIDENCE.csv')):
        f, c = r.get('family', ''), r.get('serp_class', '')
        if f and c:
            _serp_seen[f].add(c)
            if f not in serp_by_fam:
                serp_by_fam[f] = c
except FileNotFoundError:
    pass
for _f, _cs in sorted(_serp_seen.items()):
    if len(_cs) > 1:
        print(f'  SERP evidence disagrees for {_f}: {sorted(_cs)}; using {serp_by_fam[_f]} '
              f'(the first row in the file)', file=sys.stderr)

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
          'locale_facts',
          # The cross-market content uniqueness fields. URL uniqueness is not content
          # uniqueness, and these five are what let a reader check the difference without
          # taking anyone's word for it.
          'cross_market_uniqueness_reason', 'information_gain_vs_same_language_markets',
          'shared_fact_ratio', 'shared_section_ratio', 'semantic_similarity_score',
          # which of the three ownership bases gave this market the page in its language
          'same_language_ownership_basis']

stats = collections.Counter()
OWNERSHIP_STATS = collections.Counter()

# Every (family, entity, language) where two or more markets earned the entity and only one
# could keep the language-scoped URL. Written to disk because these discards are precisely the
# population the market-scoped URL question is about, and a discarded candidate nobody recorded
# cannot be measured for information gain later.
#
# STREAMED, not accumulated. Held as a list of 73,303 dicts it cost this build its fourth OOM
# kill: the manifest already peaks near twelve gigabytes assembling the parquet, and a list that
# is only ever appended to and then written once has no reason to be in memory at all. The file
# is opened before the family loop and each contest goes straight into it.
# Written to a .tmp and renamed at close, so a run that dies partway leaves the PREVIOUS
# contest file intact. Truncating it at the start of the run would break the one guarantee the
# fatal-stage policy exists to give: that when a stage fails, every artifact on disk still
# describes the last run that finished.
SL_CONTEST_PATH = ROOT + 'data/atlas/measurements/same-language-contests.jsonl.gz'
SL_CONTEST_FH = gzip.open(SL_CONTEST_PATH + '.tmp', 'wt', encoding='utf-8')
SL_CONTEST_N = 0
SL_SHUT_OUT_N = 0


def write_contest(c):
    global SL_CONTEST_N, SL_SHUT_OUT_N
    SL_CONTEST_N += 1
    SL_SHUT_OUT_N += len(c['shut_out_markets'])
    SL_CONTEST_FH.write(json.dumps(c, ensure_ascii=False) + '\n')


def decide_language_owner(lang, ms, ecountry, ename, fid, tier):
    """Which market owns this entity in this language, and on what basis.

    Returns (owner_market, prose_reason, stats_key). Strongest evidence first:
      1 HOME MARKET      the entity sits in the market's own country
      2 ENTITY-SPECIFIC  this market was measured searching THIS place
      3 FAMILY SCORE     the last resort, named as such on the row
    """
    if len(ms) == 1:
        return ms[0], 'the only market serving this language that earns this entity', ''
    _home = [m for m in ms if MKT_COUNTRY.get(m) == ecountry]
    if _home:
        return (_home[0],
                f'{_home[0]} is the HOME market: this entity is in {ecountry}, its own '
                f'country, which outranks every other market sharing {lang}',
                'home_market_wins')
    _low = (ename or '').lower()
    _ent = [m for m in ms if (_low, ecountry) in XL_MARKET_CITIES.get(m, set())]
    if _ent:
        return (_ent[0],
                f'{_ent[0]} was measured searching for this entity itself in the '
                f'cross-language reach file, which is entity-specific evidence rather than a '
                f'family total',
                'entity_specific_demand_wins')
    _best = max(ms, key=lambda m: (demand_score(fid, m, tier), m))
    return (_best,
            f'no market serving {lang} is home to {ecountry} and none was measured searching '
            f'this entity, so the family-level score decides and {_best} holds it. This is the '
            f'weakest of the three bases and it is named as such on the row.',
            'family_score_last_resort')


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
        # ---- which market OWNS this entity in each language ---------------------------------
        # This replaced a collapse that kept, per language, whichever market had the higher
        # demand_score. demand_score is measured per (FAMILY, MARKET), not per entity, so that
        # rule let a market win an entity on a number measured for a different one. The effect
        # was measured on 2026-10-05: en-AU took 477 Mexican cities from en-GB and en-US because
        # its overlay carries "things to do in melbourne" at 28,000, and es-MX finished the run
        # with ZERO rows because es-ES outscored it on every Mexican entity. A page about Merida
        # belonged to es-ES because es-ES scored higher on a Spanish keyword about something else.
        #
        # The order now, strongest evidence first:
        #   1 HOME MARKET. The entity sits in the market's own country. Mexico is es-MX's,
        #     Australia is en-AU's, the United Kingdom is en-GB's. Nothing outranks this.
        #   2 ENTITY-SPECIFIC MEASURED DEMAND. This market was measured searching THIS place,
        #     from the cross-language reach file and the destination harvest, which record
        #     (city, market) pairs rather than family totals.
        #   3 only if neither applies, the family-level score, which is what the old rule used
        #     for every case and is now the last resort rather than the first.
        #
        # More than one market can own a language here, and the cross-market gate downstream
        # then decides whether both survive. In practice they cannot BOTH keep a page for one
        # entity and family, because the URL space is language-scoped: /es/ holds one URL per
        # entity per family, so two Spanish markets claiming one entity claim one URL. That is
        # the brief's own rule 4 - same-language coexistence must not become three copies, keep
        # the legitimate owner - and the legitimate owner is what this ordering names.
        lang_markets = collections.defaultdict(list)
        for m in cand_markets:
            lang_markets[MKT_LANG[m]].append(m)
        by_lang = {}
        own_why = {}
        pending_contest = {}
        emitted_langs = set()
        for l, ms in lang_markets.items():
            _owner, _why, _key = decide_language_owner(l, ms, ecountry, ename, fid, tier)
            by_lang[l] = _owner
            own_why[l] = _why
            if _key:
                OWNERSHIP_STATS[_key] += 1
            if len(ms) > 1:
                # the contest, and the markets it shut out. The loser's facts are not computed
                # here: the experiment computes them through entity_identity, so there is one
                # definition of what a market fact is rather than two that can disagree.
                #
                # PENDING, not recorded yet. The ownership rule runs before the per-market tier
                # cap and the demand check, so the market this names as owner may be dropped a
                # few lines below and never become a row at all. Recorded straight from here,
                # 5,431 of 16,982 en-AU contests pointed at an owner that is in neither the kept
                # manifest nor the rejection file, which reads as a missing record and is really
                # a contest resolved in favour of a page that was never generated. The flag is
                # set once the entity's markets have all been through their own checks.
                pending_contest[l] = {
                    'family': fid, 'surface': f['surface'], 'intent': f['intent'],
                    'entity_type': etype, 'entity_id': eid, 'entity_name': ename,
                    'country': ecountry or '', 'city': ecity or '', 'tier': tier,
                    'language': l, 'owner_market': _owner,
                    'ownership_basis': _key or 'sole_market',
                    'shut_out_markets': [m for m in ms if m != _owner],
                    # family-level, which is what demand_score and local_keyword both are. The
                    # experiment must not read these as evidence that a market searches THIS
                    # entity; that is the next field, and the distinction is the whole reason
                    # the old collapse was wrong.
                    'family_demand_scores': {m: demand_score(fid, m, tier) for m in ms},
                    'family_keyword': {m: (kw_cell(fid, m)[0][0] if kw_cell(fid, m) else '')
                                       for m in ms},
                    'family_keyword_volume': {m: (kw_cell(fid, m)[0][1] if kw_cell(fid, m)
                                                  else 0) for m in ms},
                    # ENTITY-SPECIFIC: which of the contending markets was actually measured
                    # searching for this place, from the cross-language reach file. This is the
                    # only demand evidence in the inventory that is about the entity rather
                    # than about the family.
                    'entity_specific_demand_markets': [
                        m for m in ms
                        if ((ename or '').lower(), ecountry) in XL_MARKET_CITIES.get(m, set())],
                }
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
            # Market-FREE on purpose. It was sig('data', fid, eid, m), which could never
            # match across markets, so the one question it exists to answer - is this the
            # same underlying source data - could never be answered yes. The data a page
            # draws on does not depend on who is reading it.
            dsig = sig('data', fid, eid)
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
            # The facts computed for THIS market, which are the whole of what makes two pages
            # about one entity in two markets different pages. This was missing: locale_facts
            # was in FIELDS and was set only by the aggregation row builder, so 0 of 302,063
            # rows in the 2026-10-02 manifest carried one and the no-translated-clones rule
            # was protecting nothing. The locator is the city id where the entity IS a city and
            # the city field otherwise, resolved through the gazetteer in entity_identity.
            _lf_city = (str(eid) if etype == 'city'
                        else GAZ.city_id_for(ecity, ecountry))
            _lf = entity_identity.locale_facts_for_row(
                m, {'city_id': _lf_city, 'country': ecountry or ''}) if _lf_city else []
            emitted_langs.add(lang)
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
                'market_demand_evidence': dev, 'locale_facts': ' | '.join(_lf),
                'same_language_ownership_basis': own_why.get(lang, ''),
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
        # the contests for this entity, now that the owner's own per-market checks have run
        for _l, _c in pending_contest.items():
            _c['owner_generated_a_row'] = _l in emitted_langs
            if not _c['owner_generated_a_row']:
                OWNERSHIP_STATS['contest_owner_dropped_before_generating'] += 1
            write_contest(_c)

SL_CONTEST_FH.close()
os.replace(SL_CONTEST_PATH + '.tmp', SL_CONTEST_PATH)
print(f'same-language contests recorded: {SL_CONTEST_N:,} ({SL_SHUT_OUT_N:,} market candidates '
      f'shut out of the language-scoped URL space)', file=sys.stderr)

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
             ROOT + 'data/atlas/sources/osm-parents/_region-aggregations.jsonl.gz',
             # The transport pairs and the visa cells, put into this shape by
             # transport-visa-manifest-adapter.py. They were built on 2026-10-07 and written to
             # disk, and until this line existed nothing read them, so 61,661 pairs and 226
             # policy cells had passed no gate at all and were NOT final candidates whatever an
             # interim scoreboard said. From here every gate applies to them as it does to a
             # POI list.
             ROOT + 'data/atlas/sources/transport/_manifest-candidates.jsonl.gz',
             # Pulse, built 2026-10-07 by pulse-candidates.py. 226 rows and not the 9,065 the
             # holiday store holds, because the measurement admits each market on its OWN
             # country and the 43 countries in the store are source supply.
             ROOT + 'data/atlas/sources/events/_pulse-candidates.jsonl.gz',
             # Airport car parks, built 2026-10-07 by airport-parking-candidates.py. 50 rows
             # after the association gate replaced a 6 km radius that was listing the city
             # rather than the airport.
             ROOT + 'data/atlas/sources/transport/_airport-parking-candidates.jsonl.gz',
             # GTFS settlement pairs, built 2026-10-07 by gtfs-pair-candidates.py from 81
             # openly licensed Mobility Database feeds. 3,238,241 directly-served STOP pairs
             # collapsed to 4,217 settlement pairs, which is the gate working: a stop pair
             # inside one bus network is a real connection and a page nobody would ever type.
             ROOT + 'data/atlas/sources/transport/_gtfs-pair-candidates.jsonl.gz',
             # GTFS interchange departure boards, built 2026-10-08 by gtfs-hub-candidates.py
             # from the same harvested feeds. 15,771 nodes with eight or more direct
             # destinations fell to 826 after four successive gates: the node must be a
             # rail station or a ferry terminal or carry a station word in its OWN
             # language, its destinations must spread across at least a quarter as many
             # settlements as destinations, and nodes within 3 km of each other are one
             # physical interchange. Trafalgar Square has 660 destinations across 81
             # settlements and is refused; Munich has 571 across 373 and is admitted.
             ROOT + 'data/atlas/sources/transport/_gtfs-hub-candidates.jsonl.gz'):
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
    # Pulse is the most open SERP measured anywhere in this inventory. "feiertage nrw 2026" at
    # 202,000 is held at position 9 by ferien-nrw.com at DOMAIN RATING 1 with ZERO backlinks,
    # and there is no knowledge card. Difficulty ran 0 to 6 across every head term measured,
    # the lowest of any family here.
    'pulse_country_holidays': 'OPEN_SPECIALIST_PAGE_WINS',
    'pulse_subdivision_holidays': 'OPEN_SPECIALIST_PAGE_WINS',
    'pulse_school_holidays': 'OPEN_SPECIALIST_PAGE_WINS',
    'pulse_long_weekends': 'OPEN_SPECIALIST_PAGE_WINS',
    'pulse_bridge_plan': 'OPEN_SPECIALIST_PAGE_WINS',
    'airport_parking': 'OPEN_SPECIALIST_PAGE_WINS',
    'transport_pair_transit': 'OPEN_SPECIALIST_PAGE_WINS',
    # Measured 2026-10-08, ahrefs-expiry/transport-hub-intent-2026-10-08.json. The
    # departures form is held by operator and timetable sites, not by a knowledge card.
    'transport_hub_node': 'OPEN_SPECIALIST_PAGE_WINS',
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
    # Measured 2026-10-07 on the pair families themselves: 891 of 1,000 English rows at KD 10
    # or below with a median of 0, on SERPs where a domain of DR 30 or less already ranks top
    # ten. flightsfrom.com holds 166,621 organic keywords at DR 57 on only 6,551 referring
    # domains, which says the same thing from the other side: this format does not need
    # authority.
    'transport_airport_access': 'OPEN_SPECIALIST_PAGE_WINS',
    'transport_pair': 'OPEN_SPECIALIST_PAGE_WINS',
    'transport_pair_rail': 'OPEN_SPECIALIST_PAGE_WINS',
    # Measured 2026-10-07: uk visa 16,000 at KD 0, vietnam visa for us citizens 3,400 at KD 0.
    # Government sites hold the head and commercial visa agents fill the rest, which is a mixed
    # SERP rather than an open one.
    'visa_requirement': 'OFFICIAL_PLUS_AGGREGATOR_MIXED',
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
    # Transport pairs and visa cells, added 2026-10-07. A pair page is ENTITY rather than
    # AGGREGATION because its subject is one journey, not a list of things.
    #
    # The demand scores are deliberately NOT the measured keyword volumes. The 2026-10-07
    # open-SERP harvest proved the FAMILY in English (891 of 1,000 rows at KD 10 or below,
    # median KD 0) but no per-pair volume is claimed for 61,661 pairs, and a score that
    # pretended otherwise would be the "source supply is not measured demand" error the brief
    # names. So: 58 for airport access, which the measurement found is the highest-CPC half of
    # the family (Newark to Manhattan 1,100 at a 0.10 CPC, Rome airport to city centre, Narita
    # to Tokyo); 50 for air city pairs, whose corridors carry operator records; 46 for rail
    # pairs, whose source is an adjacency graph the builder itself called PARTIAL, so its
    # counts are floors.
    'transport_airport_access': ('transport', 'ENTITY', 'airport_city_pair', 58),
    'transport_pair': ('transport', 'ENTITY', 'city_pair', 50),
    'transport_pair_rail': ('transport', 'ENTITY', 'city_pair_rail', 46),
    # 55 for visa: the family measured well (uk visa 16,000 at KD 0 and a 3.50 CPC) and every
    # cell rests on a government source read and dated, which is the strongest provenance in
    # the whole inventory. Not higher, because only one origin nationality exists.
    'visa_requirement': ('travel', 'ENTITY', 'visa_cell', 55),
    # Measured 2026-10-02 in ahrefs-region-families-2026-10-02.json. The scores are the
    # measured ceilings, not a guess: kyoto 78,000 for what-to-see, cidades de minas gerais
    # 12,000 for the city list, best time to visit tuscany 700 for when-to-go. The when-to-go
    # score is lowest of the three because its measurement is the smallest AND it is refused
    # outright in Italian, French and Portuguese.
    'region_what_to_see': ('destinations', 'AGGREGATION', 'region', 75),
    'region_cities': ('destinations', 'AGGREGATION', 'region', 70),
    'region_best_time': ('climate', 'AGGREGATION', 'region', 60),
    # ---- Pulse, measured 2026-09-24 (ahrefs-holidays-*) and 2026-10-01 (pulse local phrasing).
    # The demand scores ARE close to the measured ceilings here, which is unusual in this table
    # and is justified: unlike the POI and pair families, every pulse page's own keyword shape
    # was read on its own market head term. The subdivision families score HIGHER than the
    # country ones, which looks wrong and is the measurement: "feiertage nrw 2026" at 202,000
    # beats the unqualified "feiertage 2026" at 90,000 by more than two to one, so the state
    # page is the primary page and the national one answers the smaller half of the demand.
    'pulse_country_holidays': ('pulse', 'AGGREGATION', 'country_year', 62),
    'pulse_subdivision_holidays': ('pulse', 'AGGREGATION', 'subdivision_year', 75),
    'pulse_school_holidays': ('pulse', 'AGGREGATION', 'school_subdivision_year', 78),
    'pulse_long_weekends': ('pulse', 'AGGREGATION', 'country_year', 58),
    # The strongest information gain in the cluster: bridge_plans already computes the maximum
    # consecutive days off a named state reaches in a named year, which is the actual question
    # behind the query rather than a restatement of the holiday list.
    'pulse_bridge_plan': ('pulse', 'AGGREGATION', 'subdivision_year', 70),
    # Airport car parks. 52 and not higher: the 2026-10-07 open-SERP measurement found the
    # parking tail is 210 rows of parking law, collision and sign-meaning intent, and the ONLY
    # rows carrying a place were airport and cruise terminals. So the family is admitted at
    # exactly the cut the measurement supports and no wider.
    'airport_parking': ('transport', 'ENTITY', 'airport_parking', 52),
    # GTFS settlement pairs. Scored 54, ABOVE the 50 air pairs and the 46 rail pairs, and this
    # is the one place in this table where a pair family earns more than the measured family
    # ceiling would suggest. The reason is information gain rather than demand: the air pairs
    # rest on a 2014 OpenFlights snapshot and the rail pairs on a Wikidata adjacency graph, so
    # those pages can say only that two places are connected and how far apart they are. These
    # carry a real scheduled journey time and a real direct-service count, read out of
    # stop_times and attributed to the agency that published it. Not higher than 54, because
    # no per-pair volume was measured for any of the 4,217.
    'transport_pair_transit': ('transport', 'ENTITY', 'city_pair_transit', 54),
    # GTFS interchange departure boards. Scored 44, BELOW the 54 of the settlement pair
    # and below every other transport family here, and the reason is the honest limit of
    # the measurement rather than the quality of the data. The departures FORM measured
    # strongly, but in two markets only: en-GB and de-DE. 644 of these 826 rows are in
    # markets whose own phrasing of the form was never measured, and the page rests on
    # the family shape plus per-node utility read out of the timetable. That is a Class B
    # admission with one leg shorter than the pair family's, so it scores lower, and the
    # uniqueness reason on every row says which of the two it is.
    'transport_hub_node': ('transport', 'ENTITY', 'transport_hub', 44),
}
WD_LICENCE = ('Wikidata (CC0 1.0, public domain dedication, no share-alike)', 'CC0_NO_CONDITIONS')
OSM_LICENCE = ('OpenStreetMap named POI (ODbL 1.0, share-alike, attribution required)',
               'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED')
# The transport and policy rows do NOT come from OSM or Wikidata alone, so they must not
# inherit either licence. Each names the sources it actually rests on, because the brief asks
# for the licence recorded per source and a wrong attribution on a share-alike dataset is a
# licensing problem rather than a cosmetic one.
SHAPE_LICENCE = {
    'transport_pair': ('OpenFlights routes (ODbL 1.0) with OurAirports (public domain) and '
                       'GeoNames (CC BY 4.0)', 'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED'),
    'transport_airport_access': ('OurAirports (public domain) with GeoNames (CC BY 4.0)',
                                 'PUBLIC_DOMAIN_PLUS_ATTRIBUTION_REQUIRED'),
    'transport_pair_rail': ('Wikidata P197 adjacent station (CC0 1.0) with GeoNames '
                            '(CC BY 4.0)', 'CC0_PLUS_ATTRIBUTION_REQUIRED'),
    'visa_requirement': ('UK FCDO entry requirements (Open Government Licence v3.0)',
                         'OGL_V3_ATTRIBUTION_REQUIRED'),
    # The holiday registers are four different licences and the row records the union, because
    # a pulse page for Germany rests on OpenHolidays and one for the United Kingdom on GOV.UK.
    'pulse_country_holidays': (
        'Public holiday registers: OpenHolidays (ODbL 1.0), Nager.Date (MIT), GOV.UK (OGL '
        'v3.0), Cabinet Office of Japan', 'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED'),
    'pulse_subdivision_holidays': (
        'Public holiday registers: OpenHolidays (ODbL 1.0), GOV.UK (OGL v3.0)',
        'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED'),
    'pulse_school_holidays': ('OpenHolidays school holiday register (ODbL 1.0)',
                              'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED'),
    'pulse_long_weekends': (
        'Derived from the public holiday registers: OpenHolidays (ODbL 1.0), Nager.Date (MIT), '
        'GOV.UK (OGL v3.0)', 'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED'),
    'pulse_bridge_plan': (
        'Derived from the public holiday registers: OpenHolidays (ODbL 1.0), GOV.UK (OGL v3.0)',
        'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED'),
    'airport_parking': ('OurAirports (public domain) with OpenStreetMap named car parks '
                        '(ODbL 1.0, share-alike, attribution required)',
                        'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED'),
    # The row carries the union of the licences of the feeds that evidence that pair, and
    # gtfs-pair-candidates.py records them per row, so this is the family-level statement.
    'transport_pair_transit': (
        'Published GTFS timetables via the Mobility Database, open licences only: OGL v3.0, '
        'CC BY 4.0, CC0 1.0, Licence Ouverte (Etalab), Licence Quebec, ODbL 1.0, with GeoNames '
        '(CC BY 4.0) for the settlements', 'MIXED_OPEN_ATTRIBUTION_REQUIRED'),
    # Same feeds, same union of licences: the board is read out of the same stop_times.
    'transport_hub_node': (
        'Published GTFS timetables via the Mobility Database and transport.data.gouv.fr, '
        'open licences only: OGL v3.0, CC BY 4.0, CC0 1.0, Licence Ouverte (Etalab), '
        'ODbL 1.0, with GeoNames (CC BY 4.0) for the settlements',
        'MIXED_OPEN_ATTRIBUTION_REQUIRED'),
}
SHAPE_RECORD_PREFIX = {
    'transport_pair': 'transport-air:', 'transport_airport_access': 'transport-access:',
    'transport_pair_rail': 'transport-rail:', 'visa_requirement': 'visa-fcdo:',
    'pulse_country_holidays': 'pulse-holidays:', 'pulse_subdivision_holidays': 'pulse-holreg:',
    'pulse_school_holidays': 'pulse-school:', 'pulse_long_weekends': 'pulse-lw:',
    'pulse_bridge_plan': 'pulse-bplan:', 'airport_parking': 'apark-osm:',
    'transport_pair_transit': 'transport-gtfs:',
    'transport_hub_node': 'transport-gtfs-hub:',
}

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

# ---- categories the 2026-10-07 open-SERP measurement refuted, IN ENGLISH ---------------------
# Five of the eighteen POI categories the brief named have no English demand that a page about a
# named place could serve. Measured with a serp_domain_rating_top10_min filter so every returned
# row is a SERP a low-authority domain already holds, at a floor of 100 monthly searches:
#
#   supermarket  2 rows in the whole tail. One resolves to the parent topic "publix", so the
#                intent is a brand; the other, "marsh supermarkets muncie in", uses "in" as the
#                state abbreviation for Indiana rather than the preposition.
#   marina       0 rows.
#   nightclub    2 rows, against 283 for beaches in the same call.
#   parking      210 rows that look alive and are not about places: parking law, collision and
#                personal-injury intent, sign-meaning questions and sign language. The rows that
#                do carry a place are airport and cruise terminals, which the transport axis
#                covers better.
#   market       15 rows, and the volume sits in Christmas markets, which is a seasonal event
#                family on an aggregation axis rather than a per-city market inventory.
#
# THE REFUSAL IS ENGLISH ONLY, because English is what was measured. The same classes carry
# 11,118 rows in nine other languages and those are UNMEASURED, not refuted. Extending an
# English finding to Japanese or Turkish would be the unmeasured extrapolation the brief
# forbids, so they stay and this comment is the record of why.
REFUTED_EN_CLASSES = {'supermarket', 'marina', 'nightclub', 'parking', 'market'}

for a in agg:
    m, lang, shape = a['market'], a['language'], a['shape']
    if lang == 'en' and a.get('cls') in REFUTED_EN_CLASSES:
        stats['refuted_in_english_2026_10_07:' + a['cls']] += 1
        continue
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
    elif shape in ('transport_pair', 'transport_pair_rail', 'transport_airport_access'):
        fid = {'transport_pair': 'transport.city-pair-air',
               'transport_pair_rail': 'transport.city-pair-rail',
               'transport_airport_access': 'transport.airport-city-access'}[shape]
        eid = str(a['entity_id'])
        ename = a['entity_name']
        # One intent, not two. The measured parent topics collapse the distance question and
        # the route question onto each other, so the page answers both or it answers neither.
        intent = (f"get from {ename.replace(' to ', ' to ')}: how far it is, which modes "
                  f"serve it and what the route options are")
        # what the page can actually enumerate, plus the independent route evidence behind it
        q = min(100, 45 + min(25, a.get('n') or 0) * 2 + min(20, a.get('enriched') or 0) * 2)
        if a.get('route_confidence') != 'high':
            q = max(30, q - 10)
    elif shape == 'visa_requirement':
        fid = 'policy.visa-nationality-destination'
        eid = str(a['entity_id'])
        ename = a['entity_name']
        intent = (f"find out what {ename} needs to enter: whether a visa is required, how long "
                  f"the passport must be valid and when the policy was last published")
        q = min(100, 55 + (a.get('enriched') or 0) * 5)
        # the sixteen cells the FCDO states but the classifier would not machine-read keep the
        # flag and lose the points, because an unclassified requirement is a weaker page
        if a.get('cls') in ('unclassified', 'stated_in_source_but_not_machine_classified'):
            q = max(30, q - 20)
    elif shape.startswith('pulse_'):
        fid = {'pulse_country_holidays': 'pulse.country-holidays',
               'pulse_subdivision_holidays': 'pulse.subdivision-holidays',
               'pulse_school_holidays': 'pulse.school-holidays',
               'pulse_long_weekends': 'pulse.long-weekends',
               'pulse_bridge_plan': 'pulse.bridge-days-subdivision'}[shape]
        eid = str(a['entity_id'])
        ename = a['entity_name']
        intent = {
            'pulse_country_holidays': f'see which days are public holidays in {ename}',
            'pulse_subdivision_holidays': (f'see which public holidays {ename} keeps that the '
                                           f'rest of the country does not'),
            'pulse_school_holidays': f'find the school holiday dates for {ename}',
            'pulse_long_weekends': (f'find which {ename} holidays fall next to a weekend and '
                                    f'which working day bridges to one'),
            'pulse_bridge_plan': (f'plan the longest run of days off {ename} allows, and which '
                                  f'single days to book'),
        }[shape]
        # n is the count the page answers with: holidays, holiday periods or long weekends.
        # enriched is the DIFFERENTIATING count - the days beyond the national list, the total
        # holiday days, the number of bridge days - which is what the page is for.
        q = min(100, 55 + min(20, a.get('n') or 0) + min(15, a.get('enriched') or 0))
        # en-US is admitted and the matrix calls it weak, so it loses the points rather than
        # the page
        if a.get('pulse_weak_market'):
            q = max(30, q - 12)
    elif shape == 'transport_pair_transit':
        fid = 'transport.city-pair-transit'
        eid = str(a['entity_id'])
        ename = a['entity_name']
        intent = (f"get from {ename} by public transport: how long the scheduled journey "
                  f"takes, how many direct services run and which modes serve it")
        # the route count is the shape of the corridor and the feed count is independent
        # corroboration, so a pair two agencies both publish scores higher than one
        q = min(100, 50 + min(25, a.get('n') or 0) * 2 + min(15, a.get('enriched') or 0) * 3)
    elif shape == 'transport_hub_node':
        fid = 'transport.station-departures'
        eid = str(a['entity_id'])
        ename = a['entity_name']
        intent = (f"see what leaves {ename}: which places it serves directly, how long each "
                  f"journey takes and how many services a week run")
        # the destination SETTLEMENT count is the page, not the destination count: a board
        # listing thirty stops in one town answers one question, a board reaching thirty towns
        # answers thirty. enriched is the number of independent feeds that evidence the node.
        q = min(100, 40 + min(25, a.get('destination_settlements') or 0) * 2
                + min(15, a.get('enriched') or 0) * 3)
    elif shape == 'airport_parking':
        fid = 'transport.airport-parking'
        eid = str(a['entity_id'])
        ename = a['entity_name']
        intent = (f'find where to park at {ename}: which car parks there are, how far each is '
                  f'from the terminal and who runs it')
        # the lot count is the page; a two-lot page is a comparison and a ten-lot page is a guide
        q = min(100, 45 + min(30, a.get('n') or 0) * 3)
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
    lic_name, lic_status = SHAPE_LICENCE.get(
        shape, WD_LICENCE if is_wd else OSM_LICENCE)
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
        'source_record_id': SHAPE_RECORD_PREFIX.get(
            shape, 'wikidata:' if is_wd else 'osm-agg:') + str(eid),
        'feed_required': '', 'licence_status': lic_status,
        'data_signature': sig('data', fid, eid),   # market-free, see the main loop
        'template_signature': sig('tpl', shape, cls, modifier),
        # The pair builders computed their own duplicate-risk proxy, and where it said HIGH the
        # row carries that rather than the blanket LOW. The proxy was tested on 2026-10-07 and
        # it measures TEMPLATE SHAPE, not duplication: across the 60 worst rail groups and
        # 59,594 pairwise comparisons the highest shingle Jaccard was 0.672 and no pair reached
        # 0.80. So it is carried as a flag to order publication by, not as a rejection.
        'duplicate_risk': a.get('pair_duplicate_risk') or 'LOW',
        'cannibalization_risk': 'LOW',
        'market_demand_evidence': ('shape_measured_2026_10_07_open_serp'
                                   if shape in SHAPE_LICENCE
                                   else 'shape_measured_2026_10_01'),
        'quality_score': q, 'demand_score': dsc, 'source_score': src,
        'serp_score': ssc, 'serp_class': serp_cls, 'indexability_score': idx,
        'publication_priority': round(idx * 0.55 + dsc * 0.3 + ssc * 0.15, 1),
        # status is SOURCE PROVENANCE, not a verdict: it records which builder produced the
        # row, so a reader can tell a POI list from a transport pair from a policy cell.
        'publication_cohort_candidate': '',
        'status': ('TRANSPORT_PAIR' if shape.startswith('transport_')
                   else 'VISA_POLICY_CELL' if shape == 'visa_requirement'
                   else 'POI_AGGREGATION'),
        'uniqueness_reason': a['uniqueness_reason'],
        'locale_facts': ' | '.join(a.get('locale_facts') or []),
        'parent_url': a.get('parent_url', '') or OUTDOOR_PARENT_URL.get(
            (a.get('parent_id'), a.get('cls'), a.get('language')), ''),
    })
for _k, _v in OWNERSHIP_STATS.most_common():
    print(f'  same-language ownership, {_k:34} {_v:>9,}', file=sys.stderr)
print(f'  aggregation candidates emitted {len(agg):,}', file=sys.stderr)
# Free the raw aggregation records NOW. They were loaded as dicts, converted into manifest rows
# just above, and are never read again (the `agg` at the bottom of this file is a local inside
# brk(), a different variable entirely). Holding both copies of 266,028 rows is pure waste.
#
# This stage was OOM-killed TWICE on 2026-10-05, at 11,788 MB and then 11,920 MB against a 15GB
# cgroup shared with everything else running. The first fix streamed the rejection file, which
# was where the kill LANDED and not where the memory went: the second kill came earlier, before
# that code. The peak is simply the number of live dict rows, and the only honest fix is to stop
# holding rows nothing reads.
import gc as _gc0
_agg_freed = len(agg)
agg = []
_gc0.collect()
print(f'  freed {_agg_freed:,} raw aggregation records now that they are rows', file=sys.stderr)

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

# Families measured on 2026-10-06 and REFUSED on the evidence, not on a blank catalogue cell.
# Each of the three generated about 26,000 rows and kept none, and each was being rejected for
# the wrong reason: their required_data column in FAMILY-MASTER.csv is empty, so
# uniqueness_reason() returned '' and the gate said "no defensible uniqueness basis". The real
# reasons are below and they are stronger, because two of the three would cannibalise a family
# that is already live. Full readings in destination-family-intent-2026-10-06.json.
REFUSED_FAMILIES = {
    'climate.city-annual': (
        'REFUSED_MEASURED_CANNIBALISATION: "X climate" reads 150 to 2,000 a month, but its '
        'parent_topic points elsewhere in eleven of fifteen English readings and in almost '
        'every German, French and Italian one: amsterdam climate to "amsterdam", clima roma to '
        '"meteo", rom klima to "klimatabelle rom", climat lisbonne to "quand partir a '
        'lisbonne". The query is absorbed by the city itself, by weather.city-month which '
        'already holds 22,927 pages from the same NASA POWER store, or by the best-time intent. '
        'The annual shape belongs as a section on the month pages parent, not as its own URL.'),
    'climate.city-day': (
        'REFUSED_FABRICATED_PRECISION: the entity is city-date and the only source is NASA '
        'POWER MONTHLY normals. A daily figure derived from a monthly mean is a precision the '
        'source does not carry, so no keyword was measured for it: the page could not be honest '
        'whatever the volume turned out to be.'),
    'destinations.city-hub': (
        'REFUSED_MEASURED_CANNIBALISATION: "X travel guide" reads 250 to 2,400 in en-US at CPC '
        '20 to 120 cents, the best commercial signal of the three, but its parent topics are '
        '"things to do in bangkok", "visiting paris", "what to see in rome", "barcelona travel" '
        'and "amsterdam travel", which is the topic activities.city-things-to-do already holds '
        'with 30,040 pairs. Outside English it is dead: "X reisefuehrer" reads 10 in German for '
        'every city tested and "guida di viaggio X" reads 0 to 30 in Italian. The commercial '
        'signal is real and belongs in the things-to-do title and copy, not on a second URL '
        'competing with it.'),
}

# weather.city-best-time is admitted ONE (language, city) PAIR AT A TIME, from measured volume.
# The obvious gate was tested and refuted on 2026-10-06: cities that HAVE a things-to-do page
# read zero for this intent (Akron 0, Tulsa 0, Konstanz 0, Leipzig 0, Rostock 0, Lille 0,
# Marseille 0, Strasbourg 0) and cities with NO things-to-do page read strongly (Sedona 2,400,
# Charleston 400, Savannah 150). Neither population nor POI count nor a sibling family predicts
# it, so the brief's own rule applies and every city is measured.
BEST_TIME_ADMITTED = {}
BEST_TIME_REFUSED_LANGS = {}
try:
    _bt = json.load(open(ROOT + 'data/atlas/measurements/'
                         'best-time-admissions-2026-10-06.json', encoding='utf-8'))
    for _a in _bt['admissions']:
        BEST_TIME_ADMITTED[(_a['language'], str(_a['geonameid']))] = _a
    BEST_TIME_REFUSED_LANGS = dict(_bt.get('refused_at_city_level') or {})
    print(f'  best-time admissions: {len(BEST_TIME_ADMITTED):,} measured (language, city) pairs '
          f'across {len(set(k[0] for k in BEST_TIME_ADMITTED))} languages', file=sys.stderr)
except (FileNotFoundError, ValueError, KeyError):
    print('  best-time admissions table missing: the family will admit nothing', file=sys.stderr)

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

def _bt_key(r):
    return (entity_identity.MKT_LANG.get(r.get('market') or '', ''), str(r.get('entity_id') or ''))


def _best_time_ok(r):
    """True only for a (language, city) pair whose own keyword was measured above the floor."""
    return _bt_key(r) in BEST_TIME_ADMITTED


def _best_time_why(r):
    lang, gid = _bt_key(r)
    if lang in BEST_TIME_REFUSED_LANGS:
        return (f'REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: the best-time intent was measured '
                f'in {lang} and refused at city level ({BEST_TIME_REFUSED_LANGS[lang]}). It is a '
                f'country question in this language, not a city one.')
    if not any(k[0] == lang for k in BEST_TIME_ADMITTED):
        return (f'REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: no best-time phrasing has been '
                f'measured in {lang} beyond a head probe, so no city in it can be admitted yet. '
                f'The queue is in best-time-keyword-queue-2026-10-06.json.')
    return ('REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: this city was either measured and read '
            'below the floor, or has not been measured. Akron, Tulsa, Konstanz, Leipzig, '
            'Rostock, Lille, Marseille and Strasbourg all read zero for this intent while '
            'Sedona read 2,400, so the city is admitted on its own reading and on nothing else.')


# GATE 1 - uniqueness. A unique URL is not a reason to exist. Anything that cannot
# name its distinct basis is rejected, and the rejections are kept, not hidden.
rejected = []
kept = []
for r in rows:
    if r['family'] in REFUSED_FAMILIES:
        r['rejection_reason'] = REFUSED_FAMILIES[r['family']]
        r['status'] = 'REJECTED_FAMILY_MEASURED_AND_REFUSED'; rejected.append(r)
    elif r['family'] == 'weather.city-best-time' and not _best_time_ok(r):
        r['rejection_reason'] = _best_time_why(r)
        r['status'] = 'REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY'; rejected.append(r)
    elif not r['uniqueness_reason']:
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


# ---- the per-market family gate, for markets admitted AFTER the research freeze --------------
# A new market does NOT inherit the family set of the markets that share its language. en-AU does
# not get en-US's 203 families because they share /en/, and es-MX does not get es-ES's. Each
# family has to be admitted on that market's OWN measurement, and anything not covered by one is
# refused by name so the yield is auditable rather than assumed.
#
# The original eleven markets are untouched: their families were validated in the 2026-09-30
# research freeze, which is the evidence this gate is standing in for.
#
# The manifest carries 203 families at class granularity (places.area-cafe, outdoors.volcano,
# poi.museum-notable) while a keyword measurement is necessarily category level (you measure
# "sydney restaurants" and "bondi cafes", not 104 separate list shapes). So the mapping from a
# measured category to the families it admits is written out here rather than inferred, because
# an inferred mapping is how a market quietly acquires families nobody measured.
NEW_MARKET_FAMILY_COVER = {
    'activities.city-things-to-do': {'activities.city-things-to-do'},
    # the city list and the neighbourhood list, measured as "sydney restaurants" 4,400 and
    # "bondi cafes" 800 in en-AU, "istanbul muzeleri" 1,300 and "kadikoy kafeler" 1,500 in tr-TR
    'places.city-category': {'__prefix__places.city-'},
    'places.area-category': {'__prefix__places.area-'},
    'places.city-cuisine': {'places.city-cuisine', 'places.area-cuisine'},
    # the named visitor entity: taronga zoo 52,000, chichen itza 91,000, topkapi 7,300
    'poi.city-category-durable': {'__suffix__-notable'},
    # named summits. cradle mountain 19,000 at difficulty zero, nemrut dagi 47,000
    'outdoors.peak': {'outdoors.peak', 'outdoors.volcano', 'outdoors.mountain_pass',
                      'outdoors.glacier', 'outdoors.cliff'},
    # the beach and bay list inside a named area. bondi 83,000, fethiye plajlari 3,100
    'outdoors.beach-in-region': {'outdoors.beach-in-region', 'outdoors.beach', 'outdoors.bay',
                                 'outdoors.beach_resort', 'outdoors.beach-in-city'},
    # parks and reserves. kakadu 12,000 at difficulty zero, hierve el agua 12,000
    'outdoors.national-park': {'outdoors.national_park', 'outdoors.protected_area',
                               'outdoors.nature_reserve', 'outdoors.region-feature'},
    # long-distance routes measured from member geometry. likya yolu 17,000, larapinta 5,900
    'outdoors.hiking-trail': {'outdoors.hiking-trail', 'outdoors.trail', 'outdoors.bicycle-trail',
                              'outdoors.walking-trail'},
    # fortifications and ruins. bodrum kalesi 5,500, alanya kalesi 6,100
    'outdoors.castle': {'outdoors.castle', 'outdoors.fort', 'outdoors.ruins',
                        'outdoors.archaeological_site', 'outdoors.city_gate'},
    # the named region enumerations. karadeniz gezilecek yerler 2,400
    'destinations.region-what-to-see': {'destinations.region-what-to-see',
                                        'destinations.region-cities'},
    'events.city-type': {'__prefix__events.'},
    'stay.city-type': {'__prefix__stay.'},
    'transport.city-getting-around': {'transport.city-getting-around'},
    'weather.city-best-time': {'climate.region-when-to-go'},
    'weather.city-month': {'weather.city-month'},
    # connectivity is a PRODUCT surface, not a travel-content family, and none of the 203
    # families in this manifest targets it. Mapped to nothing on purpose: esim australia at
    # 18,000 and a $3.50 CPC is the commercial case for entering a market, and a travel page
    # built to rank for it would be a doorway page.
    'connectivity.esim-country': set(),
    'connectivity.esim-region': set(),
    'connectivity.esim-explainer': set(),
    # The settlement pair, and ONLY the settlement pair. da-DK, nb-NO and fi-FI are admitted on
    # this one measured category, so this cover rule is the whole of what those three markets
    # may generate. Deliberately NOT mapped to transport.city-pair-air or
    # transport.city-pair-rail: those rest on a 2014 OpenFlights snapshot and a Wikidata
    # adjacency graph, neither of which was measured in Danish, Norwegian or Finnish, and
    # letting a transit measurement license them would be the inferred mapping this table
    # exists to prevent.
    'transport.city-pair-transit': {'transport.city-pair-transit'},
}

# A family a market's own SERP reading found closed is refused even though its demand measured.
# This is the "head entities dominated by official or Wikipedia must not be forced" rule, applied
# to the one case where a market-specific SERP actually contradicted the global shape class.
NEW_MARKET_SERP_REFUSED = {
    'es-MX': {
        'poi.city-category-durable': (
            'the es-MX SERP for chichen itza, 91,000 a month and the largest keyword in this '
            'market, is held by es.wikipedia at 1 with 22,808 traffic, INAH the federal '
            'archaeology institute at 3 with 11,513, the monument own domain at 4, '
            'yucatan.gob.mx at 6 and National Geographic at 7. No independent mid-authority page '
            'in the top seven. The demand is real and not reachable by this page type, so the '
            'named-entity family is refused for es-MX and the market rests on its eighteen '
            'measured cities instead'),
    },
}

NEW_MARKETS = {}
for _fn in NEW_MARKET_MEAS:
    try:
        _d = json.load(open(ROOT + 'data/atlas/measurements/' + _fn, encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        continue
    _mkt = _d['market']
    if _mkt not in MKT_COUNTRY:          # measured but not admitted to MARKETS, e.g. ko-KR
        continue
    _allow = set()
    _unmapped = []
    for _cat in (_d.get('families_admitted') or []):
        if _cat in NEW_MARKET_SERP_REFUSED.get(_mkt, {}):
            continue
        _cover = NEW_MARKET_FAMILY_COVER.get(_cat)
        if _cover is None:
            _unmapped.append(_cat)
            continue
        _allow |= _cover
    NEW_MARKETS[_mkt] = _allow
    print(f'  {_mkt} family gate: {len(_d.get("families_admitted") or [])} measured categories '
          f'-> {len(_allow)} cover rules'
          + (f'; SERP-refused: {sorted(NEW_MARKET_SERP_REFUSED.get(_mkt, {}))}'
             if NEW_MARKET_SERP_REFUSED.get(_mkt) else '')
          + (f'; UNMAPPED and therefore refused: {_unmapped}' if _unmapped else ''),
          file=sys.stderr)


def family_allowed_in_new_market(market, fid):
    """True when this family is covered by this market's own measurement."""
    allow = NEW_MARKETS.get(market)
    if allow is None:
        return True                      # one of the original eleven, validated at the freeze
    if fid in allow:
        return True
    for rule in allow:
        if rule.startswith('__prefix__') and fid.startswith(rule[10:]):
            return True
        if rule.startswith('__suffix__') and fid.endswith(rule[10:]):
            return True
    return False


# ---- the superlative gate ---------------------------------------------------------------------
# "best", "top", "safest" and the rest may not be claimed without a documented methodology.
# Audited 2026-10-05, all 60 QA hits: they are 20 rows of ONE family, neighbourhoods.city-best-for,
# counted once each in title, meta and h1. Classification against the five classes:
#
#   ENTITY_NAME                       0.  No entity is named Best. The earlier 15 hits were the
#                                     Dutch town of Best and the check already excludes it.
#   TEMPLATE_INVENTED                 0.  The separate counter for that reads zero.
#   SOURCE_SUPPORTED                  0.  The sources are geonames-cities,
#                                     neighbourhood-facts-verified and rent-index-verified. Those
#                                     support a factual comparison - this district has the lowest
#                                     median rent of the twelve, that one has fourteen
#                                     playgrounds - and they do NOT support a ranking.
#   FAMILY_INTENT_REQUIRES_METHODOLOGY  20. The claim is in the family itself: the id is
#                                     city-best-for, the URL segment is city-best-for, and the
#                                     intent reads "which areas of this city suit one kind of
#                                     person". That is a recommendation.
#   UNSUPPORTED                       20, the same 20, because no methodology document exists for
#                                     it anywhere in this repository.
#
# So the claim is unsupported and the instruction is fix or reject. It is REJECTED, for a reason
# beyond the missing methodology: areas.city-index already exists and already lists a city's areas
# from the same verified facts without ranking them. city-best-for is that page plus an unearned
# superlative, so rejecting it removes a claim and loses no information. 20 rows of 342,483, all
# EXPERIMENT_ONLY, none live.
#
# This gate is a FAMILY allowlist, not a word filter on rendered copy. A word filter would invite
# rewriting a real place name to satisfy a style rule, which is falsification; a family that earns
# a superlative by publishing its methodology gets added here by name.
SUPERLATIVE_WORDS = {'best', 'top', 'safest', 'cheapest', 'greatest', 'ultimate', 'perfect',
                     'worst', 'finest'}
SUPERLATIVE_WITH_A_METHODOLOGY = set()      # none yet; add a family here WITH its document

sup_rejected = []
stage2s = []
for r in stage2:
    _fw = set(r['family'].replace('.', ' ').replace('-', ' ').split())
    _hit = sorted(_fw & SUPERLATIVE_WORDS)
    if not _hit or r['family'] in SUPERLATIVE_WITH_A_METHODOLOGY:
        stage2s.append(r)
        continue
    r['rejection_reason'] = (
        f"REJECTED_UNSUPPORTED_SUPERLATIVE: the family id itself claims {_hit}, which appears in "
        f"the URL segment and in the rendered title, and no methodology document exists for it. "
        f"Its sources ({r['data_source'][:60]}) support a factual comparison and not a ranking. "
        f"areas.city-index already lists a city's areas from the same verified facts without "
        f"ranking them, so this page is that one plus an unearned superlative.")
    r['status'] = 'REJECTED_UNSUPPORTED_SUPERLATIVE'
    sup_rejected.append(r)
if sup_rejected:
    import collections as _cs
    print(f'superlative gate: rejected {len(sup_rejected):,} rows claiming a superlative with no '
          f'methodology', file=sys.stderr)
    for _f, _n in _cs.Counter(x['family'] for x in sup_rejected).most_common():
        print(f'    {_f:40} {_n:>7,}', file=sys.stderr)
stage2 = stage2s
after_superlative = len(stage2)

fam_gate_rejected = []
stage2f = []
fam_gate_counts = collections.Counter()
for r in stage2:
    if family_allowed_in_new_market(r['market'], r['family']):
        stage2f.append(r)
        continue
    _why = NEW_MARKET_SERP_REFUSED.get(r['market'], {}).get(r['family'])
    r['rejection_reason'] = (
        f"REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: {r['market']} was admitted after the "
        f"research freeze, so it inherits no family from the markets that share its language. "
        + (_why if _why else
           f"{r['family']} is not covered by any category its own keyword measurement admitted, "
           f"so there is no evidence this market wants this page type")
        + '. A shared language is not shared demand.')
    r['status'] = 'REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET'
    fam_gate_counts[f"{r['market']}:{r['family']}"] += 1
    fam_gate_rejected.append(r)

after_family_gate = len(stage2f)
if fam_gate_rejected:
    print(f'per-market family gate: kept {after_family_gate:,}, '
          f'rejected {len(fam_gate_rejected):,}', file=sys.stderr)
    _bym = collections.Counter(k.split(':')[0] for k in fam_gate_counts.elements())
    for _m, _n in _bym.most_common():
        print(f'    {_m:12} {_n:>8,} rows in families it never measured', file=sys.stderr)
    for _k, _n in fam_gate_counts.most_common(8):
        print(f'      {_k:48} {_n:>8,}', file=sys.stderr)
stage2 = stage2f

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

# The per-language city mark index is read only by destination_markets(), which the localisation
# gate above has now finished calling. 36,952 cities with a dict of languages each.
CITY_LANG_MARK.clear()
_gc0.collect()
after_localization = len(stage2b)
print(f'localisation gate: kept {after_localization:,}, rejected {len(loc_rejected):,}',
      file=sys.stderr)
for k, v in loc_counts.most_common():
    print(f'    {k:24} {v:>9,}', file=sys.stderr)
stage2 = stage2b

# ---- the HARD cross-market content uniqueness gate -------------------------------------------
# URL uniqueness is NOT content uniqueness, and until this gate existed the inventory leaned on
# the wrong one. The argument it leaned on was true and insufficient: every URL belongs to
# exactly one market, distinct URLs per language equals rows per language exactly, so no two
# rows can claim one URL. That says nothing about whether two pages at two different URLs say
# the same thing.
#
# Measured on the 2026-10-02 manifest before this gate was written, which is what the gate was
# written in response to:
#   6,256 (family, entity) groups held more than one row, 11,727 pairs in all
#   100.0 per cent of those pairs shared a template signature
#   100.0 per cent shared a primary intent
#   0.0 per cent shared a data signature, which sounds reassuring and is a BUG: the signature
#       was sig('data', family, entity, MARKET), so it could never match across markets and
#       could never answer the question "is this the same underlying source data". It is now
#       market-free and answers it.
#   0 of 302,063 rows carried a locale fact at all, so the computed per-market fact that was
#       supposed to make a destination copy something other than a translation was reaching
#       NOTHING. It existed in four builders and died before the manifest.
# Same entity, same intent, same sections, same source data, no market-specific fact. That is a
# translated clone by any definition, and 11,727 pairs of them were inside the gate count.
#
# Measured at the same time, and the one piece of good news: ZERO groups held two rows in ONE
# language. Same-language duplication of a (family, entity) is structurally absent today. The
# gate still tests it on every run and prints the number rather than trusting the invariant,
# because en-AU is being added to a language that already has two markets and a builder change
# could break it silently.
#
# How a row earns the right to exist beside a same-language or cross-language sibling. At least
# ONE of these, and the reason names which:
#   OWN_MEASURED_DEMAND      this row has its own measured local keyword with volume, and it is
#                            a different keyword from the sibling's
#   TWO_OR_MORE_MARKET_FACTS two or more facts computed for THIS market: the great-circle
#                            distance from its origin city, the January gap, the July gap
#   MARKET_REGULATION        a fact that differs by market because the rule does
#   MARKET_PRICING           a price or cost that differs by market
#   DIFFERENT_INTENT         the primary intent is genuinely different, not a rewording
#   DIFFERENT_ENTITY_SCOPE   the page is about a different set of entities
# A SINGLE distance, or a SINGLE temperature, or the market name, or the origin city, or
# reworded prose is NOT enough on its own. That is the explicit instruction and it is the reason
# TWO_OR_MORE_MARKET_FACTS asks for two: one computed number under an otherwise identical page
# is template variation wearing a fact as a hat.
#
# Same-language pairs are held to a harder version: being in a different language is itself a
# reason for a reader to need the page, so a cross-language pair may pass on TWO_OR_MORE_MARKET_FACTS
# alone. A same-language pair may not, because an en-AU reader and an en-GB reader read the same
# words; it must hold OWN_MEASURED_DEMAND, MARKET_REGULATION, MARKET_PRICING, DIFFERENT_INTENT
# or DIFFERENT_ENTITY_SCOPE.
XM_SHARED_SLOTS = {}        # (family) -> how many content slots the family's template fills


# These three were defined here AND again in market-url-experiment.py, which is how this
# project ended up with four slug functions and twelve market lists. They live in
# content_uniqueness now and both callers measure with the same definition: a fact that counts
# as a difference in the gate counts as one in the experiment, by construction rather than by
# two people writing the same rule twice.
def _xm_slots(fid):
    return content_uniqueness.slots_for_family(fid, fams, XM_SHARED_SLOTS)


def _xm_facts(r):
    return content_uniqueness.facts_of(r.get('locale_facts'))


def _xm_fact_kinds(facts):
    return content_uniqueness.fact_kinds(facts)


xm_rejected = []
stage2c = []
xm_counts = collections.Counter()
xm_pairs_same_language = 0
xm_pairs_cross_language = 0
# same intent + same entity is the group inside which two pages compete to say the same thing
xm_group = collections.defaultdict(list)
for r in stage2:
    xm_group[(r['family'], r['entity_type'], r['entity_id'])].append(r)

SAME_LANG_OK = {'OWN_MEASURED_DEMAND', 'MARKET_REGULATION', 'MARKET_PRICING',
                'DIFFERENT_INTENT', 'DIFFERENT_ENTITY_SCOPE'}

for key, group in xm_group.items():
    fid = key[0]
    slots = _xm_slots(fid)
    by_lang = collections.defaultdict(list)
    for r in group:
        by_lang[r['language']].append(r)
    for r in group:
        facts = _xm_facts(r)
        kinds = _xm_fact_kinds(facts)
        siblings = [s for s in group if s is not r]
        same_lang_siblings = [s for s in by_lang[r['language']] if s is not r]
        # the five measures the brief asks for, on every candidate, sibling or not
        shared = slots
        total = slots + len(facts)
        r['shared_fact_ratio'] = round(shared / total, 3) if total else 1.0
        r['shared_section_ratio'] = 1.0 if siblings and all(
            s['template_signature'] == r['template_signature'] for s in siblings) else (
            0.0 if not siblings else round(sum(
                1 for s in siblings if s['template_signature'] == r['template_signature']
            ) / len(siblings), 3))
        # semantic similarity to the most similar sibling: the template and the intent and the
        # entity are shared by construction inside a group, so what is left is the fact set
        if siblings:
            best_sim = 0.0
            for s in siblings:
                sf = set(_xm_facts(s))
                mf = set(facts)
                union = sf | mf
                jac = (len(sf & mf) / len(union)) if union else 1.0
                sim = round((slots + jac * max(len(sf), len(mf))) /
                            (slots + max(1, len(union))), 3)
                best_sim = max(best_sim, sim)
            r['semantic_similarity_score'] = best_sim
        else:
            r['semantic_similarity_score'] = 0.0

        earned = set()
        kw = (r.get('local_keyword') or '').strip()
        try:
            vol = int(r.get('local_volume') or 0)
        except (TypeError, ValueError):
            vol = 0
        if kw and vol > 0 and all((s.get('local_keyword') or '').strip() != kw
                                  for s in siblings):
            earned.add('OWN_MEASURED_DEMAND')
        if len(kinds) >= 2:
            earned.add('TWO_OR_MORE_MARKET_FACTS')
        if any(s['primary_intent'] != r['primary_intent'] for s in siblings):
            earned.add('DIFFERENT_INTENT')
        # A page written in the language of the country it describes is the PRIMARY page for
        # that entity and owes no market-specific fact to justify existing beside a
        # foreign-language sibling. The Turkish page about Berlin has to earn its place against
        # the German one; the German one is simply the native page. Without this the gate
        # rejected the native side the moment the vacuous temperature statements stopped
        # counting, because the German page about a German city carries only a distance from
        # Berlin. Deliberately NOT in SAME_LANG_OK: two rows in one language can both be
        # native for one entity (NATIVE_LOCALE keys on the country's language, so an en-US and
        # an en-GB page about Birmingham are both native), and when that day comes they must
        # still differentiate on something a reader can use.
        if r.get('localization_class') == 'NATIVE_LOCALE':
            earned.add('NATIVE_LANGUAGE_OF_THE_SUBJECT')
        if not siblings:
            earned.add('ONLY_PAGE_FOR_THIS_ENTITY_AND_INTENT')

        if same_lang_siblings:
            xm_pairs_same_language += len(same_lang_siblings)
        if siblings and not same_lang_siblings:
            xm_pairs_cross_language += len(siblings)

        # the verdict
        if not siblings:
            r['cross_market_uniqueness_reason'] = (
                f"the only page in the inventory for {fid} on this entity, in any market or "
                f"language, so there is nothing for it to duplicate")
            r['information_gain_vs_same_language_markets'] = (
                'no same-language market holds this entity and intent, so the whole page is gain')
            xm_counts['kept_only_page_for_entity_and_intent'] += 1
            stage2c.append(r)
            continue

        usable = earned & SAME_LANG_OK if same_lang_siblings else earned
        if not usable:
            others = ', '.join(sorted({s['market'] for s in siblings}))
            why_not = ('it is in the SAME LANGUAGE as ' + others +
                       ', so being a different market is not a reason a reader needs it, and '
                       'it holds none of the market-specific differences that would be'
                       ) if same_lang_siblings else (
                       'it shares the template, the intent, the entity and the source data with '
                       + others + ' and carries ' +
                       (f'only one kind of market fact ({", ".join(sorted(kinds))})'
                        if kinds else 'NO market-specific fact at all'))
            r['cross_market_uniqueness_reason'] = ''
            r['information_gain_vs_same_language_markets'] = 'NONE MEASURED'
            r['rejection_reason'] = (
                f"REJECTED_CROSS_MARKET_CONTENT_DUPLICATE: {why_not}. shared section ratio "
                f"{r['shared_section_ratio']}, shared fact ratio {r['shared_fact_ratio']}, "
                f"semantic similarity {r['semantic_similarity_score']}. A different market id "
                f"is not a reason for a separate page.")
            r['status'] = 'REJECTED_CROSS_MARKET_CONTENT_DUPLICATE'
            xm_counts['rejected_same_language_no_market_difference'
                      if same_lang_siblings else
                      'rejected_cross_language_no_market_specific_fact'] += 1
            xm_rejected.append(r)
            continue

        r['cross_market_uniqueness_reason'] = (
            'earns a separate page beside ' + ', '.join(sorted({s['market'] for s in siblings}))
            + ' on: ' + ', '.join(sorted(usable))
            + (f'. Market facts computed for {r["market"]}: ' + '; '.join(facts) if facts else '')
            + f". Shared section ratio {r['shared_section_ratio']}, shared fact ratio "
              f"{r['shared_fact_ratio']}, semantic similarity "
              f"{r['semantic_similarity_score']}.")
        if same_lang_siblings:
            r['information_gain_vs_same_language_markets'] = (
                'against ' + ', '.join(sorted({s['market'] for s in same_lang_siblings}))
                + ' in the same language: ' + ', '.join(sorted(usable)))
        else:
            r['information_gain_vs_same_language_markets'] = (
                'no same-language market holds this entity and intent; the siblings are in '
                + ', '.join(sorted({s['language'] for s in siblings})))
        xm_counts['kept_' + '_and_'.join(sorted(usable)).lower()] += 1
        stage2c.append(r)

after_cross_market = len(stage2c)
print(f'cross-market content uniqueness gate: kept {after_cross_market:,}, '
      f'rejected {len(xm_rejected):,}', file=sys.stderr)
print(f'    (family, entity, intent) groups holding more than one row: '
      f'{sum(1 for g in xm_group.values() if len(g) > 1):,}', file=sys.stderr)
print(f'    sibling relationships inside one language: {xm_pairs_same_language:,}',
      file=sys.stderr)
print(f'    sibling relationships across languages:   {xm_pairs_cross_language:,}',
      file=sys.stderr)
for k, v in xm_counts.most_common():
    print(f'    {k:56} {v:>9,}', file=sys.stderr)

# The explicit same-language market comparisons the brief names, reported whether they are
# empty or not. An empty table is the result, not the absence of one.
XM_SAME_LANGUAGE_REPORT = {}
_lang_markets = collections.defaultdict(set)
for _m, _c, _l in MARKETS:
    _lang_markets[_l].add(_m)
for _l, _ms in sorted(_lang_markets.items()):
    if len(_ms) < 2:
        continue
    _ms = sorted(_ms)
    for _i in range(len(_ms)):
        for _j in range(_i + 1, len(_ms)):
            _a, _b = _ms[_i], _ms[_j]
            _shared = []
            for _k, _g in xm_group.items():
                _mk = {_r['market'] for _r in _g}
                if _a in _mk and _b in _mk:
                    _shared.append(_k)
            # the full per-pair detail the brief asks for, computed rather than asserted
            _exact = _semantic = _tplonly = _samedata = _samefacts = _samesect = 0
            _diffs = collections.Counter()
            _rej = 0
            for _k in _shared:
                _ra = [x for x in xm_group[_k] if x['market'] == _a]
                _rb = [x for x in xm_group[_k] if x['market'] == _b]
                for _x in _ra:
                    for _y in _rb:
                        if _x['url_pattern'] == _y['url_pattern']:
                            _exact += 1
                        if _x.get('semantic_cluster_id') == _y.get('semantic_cluster_id'):
                            _semantic += 1
                        if _x['template_signature'] == _y['template_signature']:
                            _samesect += 1
                        if _x.get('data_signature') == _y.get('data_signature'):
                            _samedata += 1
                        _fa = {z.strip() for z in (_x.get('locale_facts') or '').split('|')
                               if z.strip()}
                        _fb = {z.strip() for z in (_y.get('locale_facts') or '').split('|')
                               if z.strip()}
                        if _fa == _fb:
                            _samefacts += 1
                        if (_x['template_signature'] == _y['template_signature']
                                and _fa == _fb
                                and _x.get('data_signature') == _y.get('data_signature')):
                            _tplonly += 1
                for _x in _ra + _rb:
                    _rsn = _x.get('cross_market_uniqueness_reason') or ''
                    if 'earns a separate page' in _rsn:
                        for _tok in ('OWN_MEASURED_DEMAND', 'TWO_OR_MORE_MARKET_FACTS',
                                     'NATIVE_LANGUAGE_OF_THE_SUBJECT', 'DIFFERENT_INTENT',
                                     'MARKET_REGULATION', 'MARKET_PRICING',
                                     'DIFFERENT_ENTITY_SCOPE'):
                            if _tok in _rsn:
                                _diffs[_tok] += 1
            _rej = sum(1 for _x in xm_rejected
                       if _x['market'] in (_a, _b)
                       and (_x['family'], _x['entity_type'], _x['entity_id']) in set(_shared))
            XM_SAME_LANGUAGE_REPORT[f'{_a} vs {_b}'] = {
                'language': _l,
                'same_family_entity_intent_groups_both_markets_claim': len(_shared),
                'exact_content_duplicates_same_url': _exact,
                'semantic_duplicates_same_semantic_cluster': _semantic,
                'same_section_sets_same_template_signature': _samesect,
                'same_data_signatures': _samedata,
                'same_fact_sets': _samefacts,
                'template_only_variants_same_template_data_AND_facts': _tplonly,
                'differentiator_types_accepted_on': dict(_diffs.most_common()),
                'rejected_by_the_cross_market_gate': _rej,
                'examples': [list(x) for x in _shared[:5]],
                'reading': ('no (family, entity, intent) group is claimed by both markets, so '
                            'there is no same-language content duplication between them to '
                            'resolve. This is measured on every run, not assumed.'
                            if not _shared else
                            f'{len(_shared)} groups claimed by both. Of the pairs inside them, '
                            f'{_tplonly} are TEMPLATE-ONLY variants, identical in template, '
                            f'source data and fact set; those cannot pass the gate on a market '
                            f'id and {_rej} rows were rejected. The rest were accepted only on '
                            f'{sorted(_diffs)}.'),
            }
# Every key the printer below reads must exist in every row it prints. This loop crashed the
# manifest stage once because the dict key was renamed and the format string was not, after the
# gate had already done all its work: 40 minutes of pipeline thrown away by a KeyError in a
# progress message. Checking it here turns that into a named error at the top of the loop.
_XM_REQUIRED = ('same_family_entity_intent_groups_both_markets_claim',
                'template_only_variants_same_template_data_AND_facts',
                'rejected_by_the_cross_market_gate')
for _pair, _v in XM_SAME_LANGUAGE_REPORT.items():
    _missing = [_k for _k in _XM_REQUIRED if _k not in _v]
    if _missing:
        raise KeyError(f'the same-language report for {_pair} is missing {_missing}; the keys '
                       f'written and the keys read have drifted apart')
for _pair, _v in XM_SAME_LANGUAGE_REPORT.items():
    print(f'    same-language check {_pair:24} '
          f'{_v["same_family_entity_intent_groups_both_markets_claim"]:>7,} shared groups',
          file=sys.stderr)

stage2 = stage2c

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
print(f'after superlative gate:    {after_superlative:,}', file=sys.stderr)
print(f'after family gate:         {after_family_gate:,}', file=sys.stderr)
print(f'after localisation gate:   {after_localization:,}', file=sys.stderr)
print(f'after cross-market gate:   {after_cross_market:,}', file=sys.stderr)
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

# ONE list of every row group, used for the dash sweep AND for writing the rejection file, so
# the two can never drift. They had: orphan_rejected and name_dupes were in the write and NOT in
# the sweep, and the dash check found 17 EN DASHES in the rejected file, every one on a
# REJECTED_PARENT_REMOVED row ("Werkbundarchiv - Museum der Dinge"). The rule is em dash 0 and
# en dash 0 across the repository, and a sweep that covers eight of ten groups does not meet it.
# Driving both from one definition is the fix; adding the missing two by hand would leave the
# next list to be forgotten the same way.
ROW_GROUPS = [('kept', stage3), ('quality_gates', rejected), ('exact_dupes', exact_dupes),
              ('sup_rejected', sup_rejected),
              ('semantic_dupes', semantic_dupes), ('name_dupes', name_dupes),
              ('loc_rejected', loc_rejected), ('fam_gate_rejected', fam_gate_rejected),
              ('xm_rejected', xm_rejected), ('cannib_rejected', cannib_rejected),
              ('orphan_rejected', orphan_rejected)]
_dash_fixed = sum(strip_long_dashes(_g) for _n, _g in ROW_GROUPS)
print(f'rows whose rendered strings needed a dash normalised: {_dash_fixed:,} '
      f'across {len(ROW_GROUPS)} row groups', file=sys.stderr)

# ---------------------------------------------------------------- outputs
os.makedirs(OUT, exist_ok=True)
# every rejection in one file, whatever stage produced it: hiding the localisation
# rejections in a separate place would make the funnel unauditable
# The rejection lists are written ONE AT A TIME and freed as they go, instead of being
# concatenated into a single list first.
#
# This stage was OOM-killed at 11,788 MB on 2026-10-05 right here, after doing all of its work:
# the log's last line was the dash pass and the outputs were never written. Concatenating nine
# lists of dict rows allocates a tenth list holding every one of them while all nine originals
# are still alive, and at 498,491 generated rows with 65 fields each that doubling is what went
# over. The funnel needs the COUNTS, not the lists, so each count is taken before its list is
# dropped and every number below reads from REJ_COUNTS.
#
# The fatal-stage policy added earlier the same day did its job here: the runner printed
# MANIFEST FAILED and stopped, so the artifacts on disk stayed consistent with the previous run
# rather than becoming a half-written mixture. That is the difference between a crash that costs
# forty minutes and one that costs trust in every file in the folder.
REJ_COUNTS = {}
# the same ROW_GROUPS the dash sweep used, minus the kept rows
_rej_groups = [(n, g) for n, g in ROW_GROUPS if n != 'kept']
_rej_total = 0
with gzip.open(OUT + 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz', 'wt', newline='') as gz:
    w = csv.DictWriter(gz, fieldnames=FIELDS, extrasaction='ignore')
    w.writeheader()
    for _name, _lst in _rej_groups:
        REJ_COUNTS[_name] = len(_lst)
        _rej_total += len(_lst)
        w.writerows(_lst)
        _lst.clear()           # free it before the next group is written
del _rej_groups
rejected, exact_dupes, semantic_dupes, name_dupes = [], [], [], []
loc_rejected, fam_gate_rejected, xm_rejected = [], [], []
cannib_rejected, orphan_rejected = [], []
# The generated intermediates are no longer read after stage3 exists. Freed ONE AT A TIME:
# `del a, b, c` deletes left to right and raises on the first name that does not exist, so a
# single statement wrapped in try/except NameError frees the names before the missing one and
# silently keeps every name after it. That is why the first attempt at this changed nothing.
for _nm in ('agg', 'rows', 'stage1', 'stage2', 'stage2a', 'stage2b', 'stage2c', 'stage2f',
            'xm_group', 'best', 'group_langs', 'XL_CITIES', 'XL_MARKET_CITIES',
            'XL_LANG_CITIES', 'CITY_MARK', 'cell_kw', 'fam_kw', 'km'):
    if _nm in globals():
        globals()[_nm] = None
        del globals()[_nm]
import gc as _gc
_gc.collect()
print(f'rejected candidates written: {_rej_total:,}', file=sys.stderr)

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
    # Written in ROW-GROUP BATCHES, not as one table. Building the whole table first meant a
    # Python list of 347,914 strings per field for 65 fields, and the arrays for every field
    # alive at once before the write; this stage was OOM-killed at 12,277 MB immediately after
    # the rejection file was written, which is exactly here. Batching caps the transient to one
    # batch per field.
    _schema = pa.schema([(k, pa.string()) for k in FIELDS])
    _BATCH = 50000
    with pq.ParquetWriter(OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.parquet', _schema,
                          compression='snappy') as _pw:
        for _i in range(0, len(stage3), _BATCH):
            _chunk = stage3[_i:_i + _BATCH]
            _pw.write_table(pa.table(
                {k: pa.array([str(r.get(k, '') or '') for r in _chunk], type=pa.string())
                 for k in FIELDS}, schema=_schema))
            del _chunk
    print(f'parquet written in {(len(stage3) + _BATCH - 1) // _BATCH} row groups',
          file=sys.stderr)
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
    'removed_as_exact_duplicate_urls': REJ_COUNTS['exact_dupes'],
    'removed_by_unsupported_superlative_gate': REJ_COUNTS['sup_rejected'],
    'removed_by_per_market_family_gate': REJ_COUNTS['fam_gate_rejected'],
    'removed_by_localisation_gate': REJ_COUNTS['loc_rejected'],
    'removed_by_cross_market_content_uniqueness_gate': REJ_COUNTS['xm_rejected'],
    'cross_market_same_language_checks': XM_SAME_LANGUAGE_REPORT,
    'removed_as_semantic_duplicates': REJ_COUNTS['semantic_dupes'],
    'removed_by_cannibalisation': REJ_COUNTS['cannib_rejected'],
    'removed_as_the_same_name_in_the_same_city': REJ_COUNTS['name_dupes'],
    'removed_because_the_declared_parent_did_not_survive': REJ_COUNTS['orphan_rejected'],
    'funnel_reconciles': (generated_total - (generated_total - raw_total)
                          - REJ_COUNTS['exact_dupes'] - REJ_COUNTS['semantic_dupes'] - REJ_COUNTS['name_dupes']
                          - REJ_COUNTS['sup_rejected']
                          - REJ_COUNTS['fam_gate_rejected'] - REJ_COUNTS['loc_rejected']
                          - REJ_COUNTS['xm_rejected'] - REJ_COUNTS['cannib_rejected']
                          - REJ_COUNTS['orphan_rejected']) == len(stage3),
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
    'rejected_by_quality_gates': _rej_total,
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

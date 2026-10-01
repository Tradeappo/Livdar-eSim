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
MARKETS = [
    # market, country, language
    ('en-US', 'US', 'en'), ('de-DE', 'DE', 'de'), ('fr-FR', 'FR', 'fr'),
    ('it-IT', 'IT', 'it'), ('es-ES', 'ES', 'es'), ('nl-NL', 'NL', 'nl'),
    ('pl-PL', 'PL', 'pl'), ('pt-BR', 'BR', 'pt'), ('en-GB', 'GB', 'en'),
    ('ja-JP', 'JP', 'ja'), ('zh-Hant-TW', 'TW', 'zh-Hant'),
]
MKT_COUNTRY = {m: c for m, c, _ in MARKETS}
MKT_LANG = {m: l for m, _, l in MARKETS}
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
for c in cities:
    if c.get('lat') is None or c.get('lon') is None or not c.get('name'): continue
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
_name_counts = collections.Counter((c['name'] or '').lower() for c in cities)
AMBIGUOUS_CITY = {k for k, v in _name_counts.items() if v > 1}

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
try:
    for r in csv.DictReader(open(ROOT + 'reports/livdar-master-seo-universe-2026-09-30/CROSS-LANGUAGE-REACH.csv')):
        xl_markets[r['family']].add(r['searcher_market'])
        if r.get('city'):
            XL_CITIES.add((r['city'].strip().lower(), (r.get('city_country') or '').strip()))
except FileNotFoundError:
    pass

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

def markets_for(f, ent_country, tier, ename=''):
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
        return sorted(set(home) | set(xl))
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


def uniqueness_reason(f, etype, ename, ecountry, market, lang, tier, eid=''):
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
    if ecountry and etype in ('city', 'city-pair', 'neighbourhood', 'venue', 'airport'):
        who = f"{who} ({ecountry})"
    # A country is not always enough: the United States has several Springfields, and two
    # of them produced identical reasons. The entity id is the last resort that always
    # distinguishes, because it is the id of the row's own entity.
    if eid and ename and SAME_NAME_IN_COUNTRY.get((ecountry, (ename or '').casefold()), 0) > 1:
        who = f"{who} [{eid}]"
    return (f"{f['family_id']} for {who} in {market}: {basis}; "
            f"{nf} source fields from {f.get('source_state', 'source')}; "
            f"{lang} market demand measured for this family")

# ---------------------------------------------------------------- emit
def slug(s):
    s = (s or '').lower()
    out = []
    for ch in s:
        if ch.isalnum(): out.append(ch)
        elif ch in ' -_/': out.append('-')
    r = ''.join(out)
    while '--' in r: r = r.replace('--', '-')
    return r.strip('-') or 'x'

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
          'parent_url','market_demand_evidence']

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
        cand_markets = markets_for(f, ecountry, tier, ename)
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
            nm = slug(ename)
            if etype == 'city' and (ename or '').lower() in AMBIGUOUS_CITY and ecountry:
                nm = f"{nm}-{ecountry.lower()}"
            url = f"/{lang}/{slug(f['surface'])}/{slug(fid.split('.')[-1])}/{nm}/"
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
                'entity_name': ename, 'city': ecity, 'country': ecountry or '',
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
                'uniqueness_reason': uniqueness_reason(f, etype, ename, ecountry, m, lang, tier, eid),
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
}
WD_LICENCE = ('Wikidata (CC0 1.0, public domain dedication, no share-alike)', 'CC0_NO_CONDITIONS')
OSM_LICENCE = ('OpenStreetMap named POI (ODbL 1.0, share-alike, attribution required)',
               'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED')

for a in agg:
    m, lang, shape = a['market'], a['language'], a['shape']
    wiring = SHAPE_WIRING.get(shape)
    if not wiring:
        stats['aggregation_shape_unwired:' + shape] += 1
        continue
    surface, ptype, etype, dsc = wiring
    cls = a.get('cls', '')
    modifier = a.get('cuisine') or a.get('attribute') or a.get('opening') or a.get('sport') or ''
    area = a.get('area', '')
    is_wd = a.get('source') == 'wikidata'

    if ptype == 'ENTITY':
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
        if shape == 'city_areas_hub':
            ename = f"neighbourhoods of {a['city']}"
            intent = f"compare the neighbourhoods of {a['city']}"
        elif shape == 'area_parent':
            ename = f"{area}, {a['city']}"
            intent = f"what {area} in {a['city']} is like"
        elif area:
            ename = f"{modifier + ' ' if modifier else ''}{base} in {area}, {a['city']}"
            intent = f"find {modifier + ' ' if modifier else ''}{base} in {area}"
        else:
            ename = f"{modifier + ' ' if modifier else ''}{base} in {a['city']}"
            intent = f"find {modifier + ' ' if modifier else ''}{base} in {a['city']}"
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
        'parent_url': a.get('parent_url', ''),
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
    r['intent_owner'] = r.get('semantic_cluster_id', '')
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
        r['rejection_reason'] = f"REJECTED_SERP: {r.get('SERP_class')} is not winnable"
        r['status'] = 'REJECTED_SERP'; rejected.append(r)
    elif r['indexability_score'] < 15:
        r['rejection_reason'] = f"REJECTED_QUALITY: indexability floor {r['indexability_score']}"
        r['status'] = 'REJECTED_QUALITY'; rejected.append(r)
    else:
        kept.append(r)
print(f'uniqueness and SERP gate: kept {len(kept):,}, rejected {len(rejected):,}', file=sys.stderr)
rows = kept

raw_total = len(rows)
print(f'\nraw candidate combinations: {raw_total:,}', file=sys.stderr)

# ---------------------------------------------------------------- dedupe
seen = set(); stage1 = []
for r in rows:
    if r['url_pattern'] in seen: continue
    seen.add(r['url_pattern']); stage1.append(r)
after_exact = len(stage1)

seen = set(); stage2 = []
for r in stage1:
    k = (r['market'], r['family'], r['template_signature'], r['entity_id'])
    if k in seen: continue
    seen.add(k); stage2.append(r)
after_semantic = len(stage2)

# cannibalisation: two families targeting the same intent on the same entity in the
# same market. Keep the higher publication_priority, flag the loser out.
best = {}
for r in sorted(stage2, key=lambda x: -x['publication_priority']):
    k = (r['market'], r['entity_type'], r['entity_id'], r['primary_intent'])
    if k in best:
        best[k]['cannibalization_risk'] = 'RESOLVED_KEPT_HIGHER_PRIORITY'
        continue
    best[k] = r
stage3 = list(best.values())
after_cannib = len(stage3)

# ---------------------------------------------------------------- cohort mapping
LADDER = [500, 2000, 5000, 25000, 100000, 250000, 500000, 1000000]
stage3.sort(key=lambda r: (-r['publication_priority'], r['family'], r['market'], r['entity_name'] or ''))
for i, r in enumerate(stage3):
    for rung in LADDER:
        if i < rung: r['publication_cohort_candidate'] = str(rung); break
    else: r['publication_cohort_candidate'] = 'BEYOND_1M'

print(f'after exact dedupe:        {after_exact:,}', file=sys.stderr)
print(f'after semantic dedupe:     {after_semantic:,}', file=sys.stderr)
print(f'after cannibalization:     {after_cannib:,}', file=sys.stderr)

# ---------------------------------------------------------------- outputs
os.makedirs(OUT, exist_ok=True)
with gzip.open(OUT + 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz', 'wt', newline='') as gz:
    w = csv.DictWriter(gz, fieldnames=FIELDS, extrasaction='ignore')
    w.writeheader(); w.writerows(rejected)
print(f'rejected candidates written: {len(rejected):,}', file=sys.stderr)

with gzip.open(OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz', 'wt', newline='') as gz:
    w = csv.DictWriter(gz, fieldnames=FIELDS, extrasaction='ignore'); w.writeheader(); w.writerows(stage3)
try:
    import pyarrow as pa, pyarrow.parquet as pq
    cols = {k: pa.array([r[k] for r in stage3]) for k in FIELDS}
    pq.write_table(pa.table(cols), OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.parquet', compression='snappy')
    print('parquet written', file=sys.stderr)
except ImportError:
    print('pyarrow missing: parquet skipped', file=sys.stderr)

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
    'raw_candidate_combinations': raw_total,
    'after_exact_dedupe': after_exact,
    'after_semantic_dedupe': after_semantic,
    'after_cannibalization_filtering': after_cannib,
    'FINAL_DISTINCT_CANDIDATES': len(stage3),
    'target': 1000000,
    'shortfall_to_1m': max(0, 1000000 - len(stage3)),
    'rejected_by_quality_gates': len(rejected),
    'dropped_no_demand_evidence': stats['dropped_no_demand_evidence'],
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

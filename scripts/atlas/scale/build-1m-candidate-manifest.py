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
import json, glob, gzip, csv, hashlib, collections, os, sys

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

venues = []
for f in sorted(glob.glob(ROOT + 'data/atlas/sources/venues/by-country/*.json')):
    d = json.load(open(f))
    for v in (d.get('rows') or []):
        venues.append({'id': v.get('id'), 'name': v.get('name'), 'country': v.get('iso2'),
                       'cityId': str(v.get('cityId') or ''), 'cityName': v.get('cityName') or '',
                       'types': ','.join(v.get('types') or [])})

# Holiday entities, from the public-holiday store. pulse.named-holiday-date is a
# VALIDATED, live family with 1,056 measured keywords, so leaving it without an
# entity pool silently dropped one of the strongest families on the site.
holidays = []
try:
    _hs = jload('data/atlas/sources/events/public-holidays.json').get('store', {})
    for _iso, _c in _hs.items():
        for _y, _lst in (_c.get('holidays') or {}).items():
            for _h in _lst:
                _nm = (_h.get('names') or {}).get('en') or (list((_h.get('names') or {}).values()) or [''])[0]
                if not _nm: continue
                holidays.append({'id': f"{_iso}-{_h.get('date')}", 'name': _nm,
                                 'country': _iso, 'year': int(_y), 'date': _h.get('date'),
                                 'everywhere': bool(_h.get('everywhere'))})
except FileNotFoundError:
    pass

subdiv = []
try:
    for l in gzip.open(ROOT + 'reports/scale-universe-2026-09-29/entity-graph.jsonl.gz', 'rt'):
        o = json.loads(l)
        if o.get('type') == 'subdivision':
            nm = (o.get('names') or {}).get('en') or o.get('name') or o.get('code')
            subdiv.append({'id': o['id'], 'name': nm, 'country': o.get('iso2')})
except FileNotFoundError:
    pass

print(f'  cities {len(cities):,}  countries {len(countries)}  neighbourhoods {len(neigh):,} '
      f' airports {len(airports):,}  venues {len(venues):,}  subdivisions {len(subdiv)} '
      f' holidays {len(holidays):,}', file=sys.stderr)

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
XL_CITIES = set()          # the destination cities actually measured cross-language
try:
    for r in csv.DictReader(open(ROOT + 'reports/livdar-master-seo-universe-2026-09-30/CROSS-LANGUAGE-REACH.csv')):
        xl_markets[r['family']].add(r['searcher_market'])
        if r.get('city'): XL_CITIES.add(r['city'].strip().lower())
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
        measured_destination = ((ename or '').lower() in XL_CITIES
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
          'publication_priority','publication_cohort_candidate','status']

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
                'quality_score': q, 'demand_score': dscore, 'source_score': srcscore,
                'serp_score': sscore, 'indexability_score': iscore,
                'publication_priority': prio, 'publication_cohort_candidate': '',
                'status': f['status'],
            })

# ---- OSM POI x validated modifier ------------------------------------------
# A POI only generates in the market whose country it sits in: a Dutch restaurant is a
# Dutch-language page and nowhere else. No cross-market multiplication.
POI_SERP = 'OPEN_WINNER_TAKE_MOST_IF_NO_RESELLER'
poi_emitted = 0
for o in osm_poi:
    cty = o.get('country')
    mkts = COUNTRY_MKTS.get(cty, [])
    if not mkts:
        stats['poi_dropped_no_market'] += 1
        continue
    # one language per POI; pick the market for that country
    m = mkts[0]
    lang = MKT_LANG[m]
    cls = o['cls']
    for mod in poi_modifiers(cls):
        fid = f'poi.{cls}-{mod}'
        nm = slug(o['name'])
        if not nm or nm == 'x':
            stats['poi_dropped_unslugged'] += 1
            continue
        url = f"/{lang}/poi/{slug(cls)}/{nm}-{o['id']}/{mod}/"
        # data richness drives quality: a POI with hours, site and phone supports a
        # fuller page than a bare name
        extras = sum(1 for k in ('oh', 'web', 'tel', 'city', 'qid', 'cuisine') if o.get(k))
        q = min(100, 35 + extras * 10)
        dsc = 55 if cls in TICKETED else 45 if cls in TRANSPORT_CLS else 40
        src = 55                      # SOURCE_AVAILABLE: held now, ODbL obligations
        ssc = SERP_SCORE[POI_SERP]
        idx = min(q, dsc, src, ssc)
        rows.append({
            'candidate_id': 'c_' + sig(fid, o['id'], m),
            'url_pattern': url, 'market': m, 'language': lang,
            'surface': 'poi', 'family': fid, 'vertical': 'discovery',
            'page_type': 'ENTITY_MODIFIER', 'entity_type': 'poi', 'entity_id': o['id'],
            'entity_name': o['name'], 'city': o.get('city', ''), 'country': cty,
            'neighbourhood': '', 'primary_intent': mod.replace('-', ' '),
            'primary_keyword_if_known': f"{o['name']} {mod.replace('-', ' ')}",
            'keyword_cluster_id': next((KCLUSTER[(n, m)] for n in ('poi.entity-tickets',
                'poi.entity-opening-hours', 'poi.entity-how-to-get-to') if (n, m) in KCLUSTER), ''),
            'semantic_cluster_id': 'sc_' + sig('poi', cls, mod, m),
            'data_source': 'OpenStreetMap named POI (ODbL 1.0, share-alike, attribution required)',
            'source_status': 'SOURCE_AVAILABLE', 'source_record_id': f"osm:{o['id']}",
            'feed_required': '', 'licence_status': 'ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED',
            'data_signature': sig('data', fid, o['id'], m),
            'template_signature': sig('tpl', 'poi', cls, mod),
            'duplicate_risk': 'LOW' if extras >= 2 else 'MEDIUM',
            'cannibalization_risk': 'LOW',
            'quality_score': q, 'demand_score': dsc, 'source_score': src,
            'serp_score': ssc, 'indexability_score': idx,
            'publication_priority': round(idx * 0.55 + dsc * 0.3 + ssc * 0.15, 1),
            'publication_cohort_candidate': '', 'status': 'POI_SOURCE_AVAILABLE',
        })
        poi_emitted += 1
stats['poi_emitted'] = poi_emitted
print(f'  poi candidates emitted {poi_emitted:,}', file=sys.stderr)

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
with gzip.open(OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz', 'wt', newline='') as gz:
    w = csv.DictWriter(gz, fieldnames=FIELDS); w.writeheader(); w.writerows(stage3)
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

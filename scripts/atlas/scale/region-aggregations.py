#!/usr/bin/env python3
"""Three region-scoped families the measurement of 2026-10-02 opened.

No family in this pipeline built a page for a region, and the measurement says that was the
largest unexamined level of the hierarchy. 155 keywords across nine markets, recorded in
ahrefs-region-families-2026-10-02.json, and 40 of 51 family-by-market cells pass. The three
shapes built here are the three the existing outdoor list family does not cover:

  region_what_to_see   what there is to see in a region, as a counted list by class.
                       kyoto 78,000, hokkaido 44,000, okinawa 41,000, nagano 35,000,
                       umbria cosa vedere 7,800, que faire en bretagne 2,200,
                       andalusien sehenswuerdigkeiten 2,200, things to do in tuscany 1,600.
                       Refused in Spanish at 30, which is recorded and respected.
  region_cities        the cities and towns in a region, with population and elevation.
                       cidades de minas gerais 12,000, cidades de santa catarina 7,300,
                       cinque terre towns 2,700, pueblos de galicia 1,400, bayern staedte 500.
  region_best_time     when to go, from the monthly climate normals of the region's own cities.
                       best time to visit tuscany 700, hokkaido 700, andalusien beste reisezeit
                       250. Refused in Italian, French and Portuguese, and refused in German for
                       GERMAN regions while passing for foreign ones, which is why the gate is
                       keyed on the market and not on the family.

Counties are deliberately absent. Every county-level keyword measured is at or near zero:
landkreis miesbach sehenswuerdigkeiten 0, provinz florenz 0, provinz siena 10, siena province 20,
things to do in county kerry 30. That is 47,643 admin2 units left unbuilt on evidence rather than
48,000 pages built because the rows existed.

Everything here is containment and aggregation. A city is in a region because it is inside its
polygon; a count is the number of things found and the page says so; nothing is ranked, because
no ranking methodology is documented.

Usage: region-aggregations.py
Reads  data/atlas/sources/osm-parents/parents-*.jsonl.gz
       data/atlas/sources/osm-poi/_parent-assignment.jsonl.gz
       data/atlas/entities/cities/*.json
       data/atlas/sources/climate/power/power-*.jsonl
Writes data/atlas/sources/osm-parents/_region-aggregations.jsonl.gz
"""
import collections, glob, gzip, json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                            # noqa: E402

ROOT = '/home/user/Livdar-eSim/'
PARENTS = ROOT + 'data/atlas/sources/osm-parents/'
ASSIGN = ROOT + 'data/atlas/sources/osm-poi/_parent-assignment.jsonl.gz'
OUT = PARENTS + '_region-aggregations.jsonl.gz'
MEAS = ROOT + 'data/atlas/measurements/ahrefs-region-families-2026-10-02.json'
slug = entity_identity.slugify

# The market list lives in entity_identity, which owns identity for the whole pipeline.
# Twelve files each hand-wrote their own copy; adding tr-TR meant editing twelve places and
# a thirteenth that would have been missed. One definition, imported.
COUNTRY_MKT = entity_identity.COUNTRY_MKT
LANG_MKT = entity_identity.LANG_MKT

# Only a parent class a reader would call a region. A landcover forest polygon and a university
# campus are not regions; the same list the outdoor family uses, minus park and garden, which are
# places to visit rather than places that contain towns.
REGION_OK = {
    'region': 'region', 'national_park': 'national park', 'protected_area': 'protected area',
    'nature_reserve': 'nature reserve', 'island': 'island', 'archipelago': 'archipelago',
    'mountain_range': 'mountain range', 'ski_area': 'ski area', 'peninsula': 'peninsula',
    'county': 'county',
}
# A county is loaded as a parent because the outdoor family uses it, and is then refused here for
# the three shapes this file builds. Measured, not assumed: see the module docstring.
COUNTY_REFUSED = {'county'}

MIN_KM2 = 5.0
MIN_CITIES = 5          # a list of four towns is not a list of the towns in a region
MIN_POI = 10            # below this a what-to-see page has nothing to see
MIN_POI_CLASSES = 3     # ten of one thing is a class list, not a what-to-see page
MIN_CLIMATE_CITIES = 3  # a regional normal from one station is a city normal with a region's name

# the family by market cells that passed, read back from the measurement rather than restated
cells = {}
try:
    _m = json.load(open(MEAS))
    for k, v in _m['cells'].items():
        fam, mkt = k.split('|', 1)
        if v.get('passes'):
            cells[(fam, mkt)] = v
except (FileNotFoundError, KeyError, ValueError) as e:
    print(f'cannot read {MEAS}: {e}', file=sys.stderr)
    sys.exit(2)
# en-GB shares the /en/ URL with en-US, so a shape measured in either is measured for the page
for (fam, mkt) in list(cells):
    if mkt == 'en-US':
        cells.setdefault((fam, 'en-GB'), cells[(fam, mkt)])
print(f'family by market cells that passed: {len(cells)}', file=sys.stderr)
for fam in ('things_to_do', 'cities', 'best_time'):
    ms = sorted(m for (f, m) in cells if f == fam)
    print(f'  {fam:<14} {ms}', file=sys.stderr)

# One loader in entity_identity, which reads every dated measurement file and merges them.
# This was six copies of the same loop; see DEST_FILES there for why each file stays separate.
DEST_LANG = entity_identity.dest_lang_by_country()


def markets_for_parent(country, p):
    # ONE definition, in entity_identity. This function was copied into five builders and four
    # of them agreed; the fifth rejected destination countries outright, which is why no
    # destination country had ever produced a POI page. The decision lives there now and only
    # the sentence lives here, because the sentence is this family's copy.
    # The BASIS travels with the sentence. The home-market tests below used to read the PROSE
    # (`why.startswith('the home market')`), which happens to still hold now that the sentence
    # is generated, and that is exactly why it is being changed: a test that passes by accident
    # of wording is a test that breaks the next time the wording is improved.
    return [(mkt, lang,
             entity_identity.destination_basis_sentence(country, lang, basis, 'region'),
             basis == 'home')
            for mkt, lang, basis in entity_identity.markets_for_entity(
                country, p, dest_lang=DEST_LANG, marks=entity_identity.marks_for(p))]


# ---- the country hub, which is what a region page hangs under ---------------------------------
# Read out of the file that WROTE those URLs rather than reconstructed from parts, which is the
# same discipline the Wikidata and outdoor parents use and for the same reason: a URL rebuilt from
# a name and a pattern drifts from the URL the other file emitted, and then 421 pages declare a
# parent that does not exist. That is exactly what the first run of this file did.
HUB = {}
try:
    for _l in gzip.open(ROOT + 'data/atlas/candidates/family=destinations.country-hub/'
                        'candidates.jsonl.gz', 'rt', encoding='utf-8'):
        _l = _l.strip()
        if not _l:
            continue
        _r = json.loads(_l)
        _u = _r.get('url_pattern') or _r.get('url') or ''
        if _u:
            HUB[(_r.get('country'), _r.get('language'))] = _u
except (EOFError, OSError, FileNotFoundError):
    pass
print(f'country hub pages available as parents: {len(HUB):,}', file=sys.stderr)

from shapely.geometry import shape as _shape, Point              # noqa: E402
from shapely.strtree import STRtree                                # noqa: E402

# ---- parents ----------------------------------------------------------------------------------
# Through the shared loader, which drops the ring as it hands each record out. The class
# filter stays here because REGION_OK is this file's own policy, not a property of a parent.
regions, _rgeoms = [], []
for _slim, _g in entity_identity.iter_parent_polygons(_shape, min_km2=MIN_KM2):
    if _slim.get('cls') not in REGION_OK:
        continue
    regions.append(_slim)
    _rgeoms.append(_g)
if not regions:
    print('no region polygons; run the parents pass first', file=sys.stderr)
    sys.exit(2)
print(f'region polygons: {len(regions):,} '
      f'({dict(collections.Counter(p["cls"] for p in regions).most_common())})', file=sys.stderr)

# The geometries came back with the records from the loader, so there is no second pass over
# rings to do: idx is the identity because a record is only kept when its geometry built.
geoms, idx = _rgeoms, list(range(len(regions)))
tree = STRtree(geoms)
print(f'indexed: {len(geoms):,}', file=sys.stderr)

# ---- cities inside each region ----------------------------------------------------------------
# Containment, and deliberately NOT exclusive. Siena is in the Province of Siena and also in
# Tuscany, and the Tuscany page should list it: nesting is what a hierarchy IS. Two regions whose
# city lists would be identical are caught by the name dedupe at the end, which is the real risk.
cities = []
for f in sorted(glob.glob(ROOT + 'data/atlas/entities/cities/*.json')):
    for c in json.load(open(f)):
        if c.get('lat') is None:
            continue
        cities.append(c)
print(f'cities in the store: {len(cities):,}', file=sys.stderr)

in_region = collections.defaultdict(list)
for c in cities:
    pt = Point(float(c['lon']), float(c['lat']))
    for h in tree.query(pt):
        i = idx[h]
        if regions[i].get('country') != c.get('country'):
            continue
        if geoms[h].covers(pt):
            in_region[i].append(c)
print(f'regions holding at least one city: {len(in_region):,}', file=sys.stderr)

# ---- named POI inside each region, by class ---------------------------------------------------
poi_cls = collections.defaultdict(collections.Counter)
poi_ex = collections.defaultdict(list)
pid_to_i = {}
for i, p in enumerate(regions):
    pid_to_i[(p['country'], p['id'])] = i
if os.path.exists(ASSIGN):
    for line in gzip.open(ASSIGN, 'rt', encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        try:
            a = json.loads(line)
        except Exception:
            continue
        i = pid_to_i.get((a.get('country'), a.get('parent_id')))
        if i is None:
            continue
        poi_cls[i][a.get('cls') or 'other'] += 1
        if a.get('name') and len(poi_ex[i]) < 25:
            poi_ex[i].append({'name': a['name'], 'cls': a.get('cls')})
else:
    print(f'no parent assignment at {ASSIGN}: what-to-see will be empty', file=sys.stderr)
print(f'regions holding at least one named POI: {len(poi_cls):,}', file=sys.stderr)

# ---- climate normals, keyed on city id -------------------------------------------------------
normals = {}
for f in sorted(glob.glob(ROOT + 'data/atlas/sources/climate/power/power-*.jsonl')):
    try:
        for line in open(f, encoding='utf-8'):
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except Exception:
                continue
            if r.get('city_id') is not None:
                normals[str(r['city_id'])] = r
    except OSError:
        pass
print(f'cities with monthly climate normals: {len(normals):,}', file=sys.stderr)

MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December']
MCODE = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
MDAYS = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

# NASA POWER's T2M_MAX is the single highest temperature in the whole 2001-2020 record for that
# month, not the mean daily high: Berlin's June reads 37.74C. Putting that on a page as "the
# warmest month is 38 degrees" would be wrong in a way a reader would notice on arrival, so the
# series this file builds is T2M, the monthly MEAN, and the record extreme is carried separately
# and labelled a record. PRECTOTCORR is millimetres per DAY, so a monthly total is that times the
# days in the month.
def month_series(rows, var):
    """The regional monthly mean of one POWER variable, over the region's own stations."""
    out = []
    for m in range(12):
        vals = []
        for r in rows:
            v = ((r.get('months') or {}).get(MCODE[m]) or {}).get(var)
            if v is not None:
                vals.append(float(v))
        out.append(round(sum(vals) / len(vals), 1) if vals else None)
    return out


rows, rejects = [], collections.Counter()
for i, p in enumerate(regions):
    country = p.get('country')
    if p['cls'] in COUNTY_REFUSED:
        rejects['county_level_measured_at_or_near_zero_in_every_market'] += 1
        continue
    mkts = markets_for_parent(country, p)
    if not mkts:
        rejects['no_market_and_no_destination_evidence_for_country'] += 1
        continue
    cs = sorted(in_region.get(i, ()), key=lambda c: -(c.get('population') or 0))
    classes = poi_cls.get(i) or collections.Counter()
    npoi = sum(classes.values())
    clim = [normals[str(c['id'])] for c in cs if str(c['id']) in normals]
    name = p['name']
    sl = slug(name)
    pid = slug(p['id'])

    for (market, lang, why, is_home) in mkts:
        # Same requirement as every other shape: a copy served to a market whose country this is
        # not has to carry at least one fact computed for THAT market, or it is a translation.
        lf = ([] if is_home
              else entity_identity.locale_facts_for_row(market, dict(p, parent_id=p['id'])))
        if not is_home and not lf:
            rejects['no_locale_specific_fact_could_be_computed'] += 1
            continue
        # The what-to-see page is the region's own page and the other two hang under it, so its
        # eligibility is decided BEFORE either of them is written. Where it is not eligible the
        # other two hang under the country hub instead, and where there is no country hub either
        # they are not written at all rather than written as orphans.
        hub = HUB.get((country, lang), '')
        own = f'/{lang}/destinations/region/{sl}-{pid}/'
        wts_ok = (('things_to_do', market) in cells and npoi >= MIN_POI
                  and len([k for k, v in classes.items() if v >= 2]) >= MIN_POI_CLASSES)
        under = own if wts_ok else hub
        # ---- what to see ---------------------------------------------------------------------
        if ('things_to_do', market) in cells:
            if npoi < MIN_POI:
                rejects['what_to_see_below_ten_named_poi'] += 1
            elif len([k for k, v in classes.items() if v >= 2]) < MIN_POI_CLASSES:
                rejects['what_to_see_too_few_distinct_classes'] += 1
            elif not hub:
                rejects['no_country_hub_page_to_hang_this_region_under'] += 1
            else:
                c = cells[('things_to_do', market)]
                rows.append({
                    'shape': 'region_what_to_see', 'country': country, 'market': market,
                    'language': lang, 'parent_id': p['id'], 'parent_name': name,
                    'parent_cls': p['cls'], 'parent_km2': p.get('km2'),
                    'entity_id': p['id'], 'entity_name': name,
                    'n': npoi, 'distinct_classes': len(classes),
                    'class_mix': dict(classes.most_common(20)),
                    'examples': poi_ex.get(i, [])[:20],
                    'cities_inside': len(cs),
                    'url': own, 'parent_url': hub,
                    'attribution': 'containment', 'market_reason': why, 'locale_facts': lf,
                    'qid': p.get('qid'), 'wikipedia': p.get('wikipedia'),
                    'count_answer': (
                        f'{npoi:,} named places across {len(classes)} kinds are mapped inside '
                        f'{name} in the OpenStreetMap extract this was built from'),
                    'measured_demand': (
                        f'the what-to-see shape measured at {c["top_volume"]:,} a month in '
                        f'{market} on "{c["top_keyword"]}", difficulty {c["top_difficulty"]}'),
                    'uniqueness_reason': (
                        f'{npoi:,} named places inside {name}, a {REGION_OK[p["cls"]]}, broken '
                        f'down across {len(classes)} kinds and each attached by containment '
                        f'within its polygon rather than by distance to its centre. No single '
                        f'place page carries the breakdown or the count.'),
                    'no_superlative': True,
                })
        # ---- cities and towns ----------------------------------------------------------------
        if ('cities', market) in cells:
            if len(cs) < MIN_CITIES:
                rejects['cities_below_five_inside_the_region'] += 1
            elif not under:
                rejects['no_parent_page_to_hang_this_region_list_under'] += 1
            else:
                c = cells[('cities', market)]
                withpop = [x for x in cs if (x.get('population') or 0) > 0]
                rows.append({
                    'shape': 'region_cities', 'country': country, 'market': market,
                    'language': lang, 'parent_id': p['id'], 'parent_name': name,
                    'parent_cls': p['cls'], 'parent_km2': p.get('km2'),
                    'entity_id': p['id'], 'entity_name': name,
                    'n': len(cs), 'with_population': len(withpop),
                    'cities': [{'name': x['name'], 'id': x['id'],
                                'population': x.get('population'),
                                'elevation': x.get('elevation')} for x in cs[:60]],
                    'url': own + 'cities/', 'parent_url': under,
                    'attribution': 'containment', 'market_reason': why, 'locale_facts': lf,
                    'qid': p.get('qid'), 'wikipedia': p.get('wikipedia'),
                    'count_answer': (
                        f'{len(cs):,} cities and towns of 5,000 people or more sit inside '
                        f'{name}, {len(withpop):,} of them with a published population'),
                    'measured_demand': (
                        f'the city-list shape measured at {c["top_volume"]:,} a month in '
                        f'{market} on "{c["top_keyword"]}", difficulty {c["top_difficulty"]}'),
                    'uniqueness_reason': (
                        f'the {len(cs):,} cities and towns inside {name}, each one inside its '
                        f'polygon rather than near its centre, with the population and elevation '
                        f'GeoNames publishes for each. The set is different for every region by '
                        f'construction, because a city is in one polygon or it is not.'),
                    'no_superlative': True,
                })
        # ---- when to go ----------------------------------------------------------------------
        if ('best_time', market) in cells:
            if len(clim) < MIN_CLIMATE_CITIES:
                rejects['best_time_below_three_cities_with_normals'] += 1
            elif not under:
                rejects['no_parent_page_to_hang_this_region_climate_under'] += 1
            else:
                tmean = month_series(clim, 'T2M')
                rec_hi = month_series(clim, 'T2M_MAX')
                rec_lo = month_series(clim, 'T2M_MIN')
                rpd = month_series(clim, 'PRECTOTCORR')
                rain = [None if rpd[m] is None else round(rpd[m] * MDAYS[m], 0)
                        for m in range(12)]
                have = [m for m in range(12) if tmean[m] is not None]
                if len(have) < 12:
                    rejects['best_time_incomplete_monthly_series'] += 1
                    continue
                warm = max(have, key=lambda m: tmean[m])
                cool = min(have, key=lambda m: tmean[m])
                wet = (max((m for m in range(12) if rain[m] is not None),
                           key=lambda m: rain[m], default=None))
                c = cells[('best_time', market)]
                rows.append({
                    'shape': 'region_best_time', 'country': country, 'market': market,
                    'language': lang, 'parent_id': p['id'], 'parent_name': name,
                    'parent_cls': p['cls'], 'parent_km2': p.get('km2'),
                    'entity_id': p['id'], 'entity_name': name,
                    'n': len(clim), 'stations': len(clim),
                    'mean_temp_c': tmean, 'precip_mm_per_month': rain,
                    'record_high_c': rec_hi, 'record_low_c': rec_lo,
                    'warmest_month': MONTHS[warm], 'coolest_month': MONTHS[cool],
                    'wettest_month': (MONTHS[wet] if wet is not None else None),
                    'url': own + 'when-to-go/', 'parent_url': under,
                    'attribution': 'containment', 'market_reason': why, 'locale_facts': lf,
                    'qid': p.get('qid'), 'wikipedia': p.get('wikipedia'),
                    'count_answer': (
                        f'averaged over {len(clim)} places inside {name}, the warmest month is '
                        f'{MONTHS[warm]} at a mean of {tmean[warm]:.0f}C and the coolest is '
                        f'{MONTHS[cool]} at {tmean[cool]:.0f}C'
                        + (f', with the most rain in {MONTHS[wet]} at about {rain[wet]:.0f}mm'
                           if wet is not None else '')),
                    'measured_demand': (
                        f'the when-to-go shape measured at {c["top_volume"]:,} a month in '
                        f'{market} on "{c["top_keyword"]}", difficulty {c["top_difficulty"]}'),
                    'uniqueness_reason': (
                        f'a twelve-month mean temperature and rainfall normal for {name}, computed '
                        f'from the NASA POWER daily record for the {len(clim)} places inside its '
                        f'polygon and not from one station with a region\'s name on it. The '
                        f'station count is stated on the page because an average of three is not '
                        f'an average of thirty.'),
                    'no_superlative': True,
                })

# Two region polygons can carry one name: Saechsische Schweiz is a protected area and a national
# park, and in Italy twenty admin_level=4 relations are small rocks mis-tagged as regions. Their
# URLs differ by the OSM id so no page is lost to a collision, but two pages titled the same way
# are two pages a reader cannot tell apart. Keep the one holding more, which for a rock against a
# region is never close.
group = collections.defaultdict(list)
for r in rows:
    group[(r['language'], r['shape'], slug(r['parent_name']))].append(r)
drop = []
for k, g in group.items():
    if len(g) < 2:
        continue
    keep = max(g, key=lambda r: (r['n'], r.get('parent_km2') or 0))
    for r in g:
        if r is not keep:
            drop.append(r)
if drop:
    ids = {id(r) for r in drop}
    rows = [r for r in rows if id(r) not in ids]
    rejects['same_region_name_in_one_language_kept_the_one_holding_more'] += len(drop)

print(f'\nregion candidates: {len(rows):,}', file=sys.stderr)
print('  by shape:', dict(collections.Counter(r['shape'] for r in rows).most_common()),
      file=sys.stderr)
print('  by market:', dict(collections.Counter(r['market'] for r in rows).most_common()),
      file=sys.stderr)
print('  by country:', dict(collections.Counter(r['country'] for r in rows).most_common()),
      file=sys.stderr)
print(f'  earned by destination evidence rather than a home market: '
      f'{sum(1 for r in rows if not r["market_reason"].startswith("the home market")):,}',
      file=sys.stderr)
print('  rejections, every one counted:', file=sys.stderr)
for k, v in rejects.most_common():
    print(f'    {v:>8,}  {k}', file=sys.stderr)

with gzip.GzipFile(OUT, 'wb', compresslevel=6, mtime=0) as gz:
    for r in sorted(rows, key=lambda r: (r['country'], r['shape'], r['parent_name'],
                                         r['language'])):
        gz.write((json.dumps(r, ensure_ascii=False) + '\n').encode('utf-8'))
print(f'written {OUT} with {len(rows):,} rows', file=sys.stderr)

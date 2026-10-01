#!/usr/bin/env python3
"""
Ingest a market that has no downloadable country extract, via Overpass.

Taiwan is the case this exists for: the openstreetmap.fr mirror carries no Taiwan
extract and neither does bbbike, which is not the same as the data not existing. One
Overpass mirror (kumi.systems) answers, so Taiwan is fetched tag group by tag group
instead of being written off.

The output schema is identical to the pbf path, so downstream code cannot tell which
route a market arrived by - only the source_method field records it.

Resumable and atomic: one file per tag group, a .done marker per group, long backoff
because a public Overpass instance will refuse a burst, and the group list is ordered
so the dense commercial classes land first.

Usage: osm-overpass-market.py <ISO2> <area_iso_code>
"""
import json, gzip, os, sys, time, urllib.parse, urllib.request, importlib.util, collections

ISO, AREA = sys.argv[1], sys.argv[2]
OUT = f'/home/user/Livdar-eSim/data/atlas/sources/osm-poi/'
MARK = f'/tmp/overpass_{ISO}/'
os.makedirs(OUT, exist_ok=True); os.makedirs(MARK, exist_ok=True)
ENDPOINTS = ['https://overpass.kumi.systems/api/interpreter',
             'https://overpass-api.de/api/interpreter']

# reuse the classification tables so a Taiwan record is classified exactly like a
# German one: divergent class vocabularies would break every aggregation downstream
spec = importlib.util.spec_from_file_location(
    'poix', '/home/user/Livdar-eSim/scripts/atlas/ingest/osm-poi-extract.py')
poix = importlib.util.module_from_spec(spec)
sys.modules['poix'] = poix
spec.loader.exec_module(poix)

GROUPS = [
    ('food', '["amenity"~"^(restaurant|cafe|fast_food|bar|pub|nightclub|biergarten)$"]'),
    ('health', '["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy|veterinary)$"]'),
    ('education', '["amenity"~"^(school|college|university|kindergarten|childcare|library)$"]'),
    ('culture', '["amenity"~"^(theatre|cinema|arts_centre|community_centre|casino)$"]'),
    ('civic', '["amenity"~"^(marketplace|parking|bus_station|ferry_terminal|townhall|post_office|bank|police|fire_station|courthouse|social_facility)$"]'),
    ('shop', '["shop"~"^(mall|department_store|supermarket)$"]'),
    ('leisure', '["leisure"~"^(fitness_centre|sports_centre|sports_hall|swimming_pool|stadium|pitch|park|garden|golf_course|marina|ice_rink|water_park|beach_resort|nature_reserve)$"]'),
    ('tourism', '["tourism"~"^(attraction|museum|gallery|zoo|theme_park|viewpoint|aquarium|hotel|hostel|guest_house|apartment|motel|camp_site|picnic_site)$"]'),
    ('historic', '["historic"~"^(castle|monument|memorial|archaeological_site|ruins|fort|manor|city_gate)$"]'),
    ('natural', '["natural"~"^(beach|peak|waterfall|cave_entrance)$"]'),
    ('office', '["office"="coworking"]'),
    ('railway', '["railway"~"^(station|halt|tram_stop)$"]'),
    ('aeroway', '["aeroway"~"^(aerodrome|terminal)$"]'),
    ('place', '["place"~"^(suburb|neighbourhood|quarter|borough|city_block|city_district)$"]'),
]


def fetch(sel):
    q = (f'[out:json][timeout:280];area["ISO3166-1"="{AREA}"][admin_level=2]->.a;'
         f'(nwr{sel}["name"](area.a););out tags center;')
    for attempt in range(5):
        ep = ENDPOINTS[attempt % len(ENDPOINTS)]
        try:
            data = urllib.parse.urlencode({'data': q}).encode()
            rq = urllib.request.Request(ep, data=data, headers={
                'User-Agent': 'LivdarCandidateInventory/1.0 (offline research inventory)'})
            with urllib.request.urlopen(rq, timeout=320) as r:
                return json.load(r).get('elements', [])
        except Exception as e:
            print(f'    {ep.split("/")[2]} attempt {attempt + 1}: {e}', flush=True)
            time.sleep(30 * (attempt + 1))
    return None


def record(el):
    t = el.get('tags') or {}
    name = t.get('name')
    if not name:
        return None
    lat = el.get('lat') or (el.get('center') or {}).get('lat')
    lon = el.get('lon') or (el.get('center') or {}).get('lon')
    if lat is None or lon is None:
        return None
    kindchar = {'node': 'n', 'way': 'w', 'relation': 'r'}.get(el['type'], 'n')
    pl = poix.classify_place(t)
    base = {'id': f"{kindchar}{el['id']}", 'country': ISO, 'name': name,
            'lat': round(float(lat), 6), 'lon': round(float(lon), 6),
            'source_method': 'overpass'}
    if pl:
        r = {**base, 'kind': 'place', 'cls': pl}
        for a, b in (('population', 'pop'), ('wikidata', 'qid'),
                     ('is_in:city', 'in_city'), ('addr:city', 'city')):
            if t.get(a): r[b] = str(t[a])[:120]
        return r
    cls = poix.classify(t)
    if not cls:
        return None
    r = {**base, 'kind': 'poi', 'cls': cls}
    for a, b in (('addr:city', 'city'), ('website', 'web'), ('opening_hours', 'oh'),
                 ('phone', 'tel'), ('wikidata', 'qid'), ('cuisine', 'cuisine'),
                 ('addr:postcode', 'pc'), ('operator', 'op')):
        if t.get(a): r[b] = str(t[a])[:120]
    attr = {}
    for a, b in (('internet_access', 'wifi'), ('outdoor_seating', 'outdoor'),
                 ('wheelchair', 'wheelchair'), ('takeaway', 'takeaway'),
                 ('delivery', 'delivery'), ('air_conditioning', 'ac'),
                 ('diet:vegan', 'vegan'), ('diet:vegetarian', 'vegetarian'),
                 ('diet:halal', 'halal'), ('diet:kosher', 'kosher'),
                 ('diet:gluten_free', 'gluten_free'), ('dog', 'dog'),
                 ('drive_through', 'drive_through'), ('fee', 'fee'), ('sport', 'sport'),
                 ('stars', 'stars'), ('changing_table', 'changing_table'),
                 ('reservation', 'reservation'), ('brand', 'brand')):
        if t.get(a): attr[b] = str(t[a])[:40]
    if attr: r['attr'] = attr
    return r


stats = collections.Counter()
for gname, sel in GROUPS:
    mark = MARK + gname + '.done'
    dst = f'{OUT}poi-{ISO}-{gname}.jsonl.gz'
    if os.path.exists(mark):
        print(f'  {gname}: already done', flush=True); continue
    print(f'  {gname}: fetching', flush=True)
    els = fetch(sel)
    if els is None:
        print(f'  {gname}: UNREACHABLE after retries, left unmarked', flush=True)
        continue
    rows = [r for r in (record(e) for e in els) if r]
    with gzip.open(dst + '.tmp', 'wt', encoding='utf-8') as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')
    os.replace(dst + '.tmp', dst)
    open(mark, 'w').close()
    stats[gname] = len(rows)
    print(f'  {gname}: {len(els):,} elements -> {len(rows):,} named records', flush=True)
    time.sleep(12)

print(f'\n{ISO} total: {sum(stats.values()):,}')
print(dict(stats))

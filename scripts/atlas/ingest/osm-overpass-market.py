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
    # the dense classes go one value per query: asking for all seven at once is what
    # made the server time out rather than answer
    ('food_restaurant', '["amenity"="restaurant"]'),
    ('food_cafe', '["amenity"="cafe"]'),
    ('food_fast_food', '["amenity"="fast_food"]'),
    ('food_bar_pub', '["amenity"~"^(bar|pub|biergarten)$"]'),
    ('food_nightclub', '["amenity"="nightclub"]'),
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


# A whole-country query with an area lookup times out on a public instance: the food
# group returned 504 on the first try. Bounding-box tiles are far cheaper to plan, so the
# market is cut into tiles and each tag group is fetched tile by tile. The tiles overlap
# nothing and the union is the country; anything outside the land area simply returns no
# elements.
TILES = {
    'TW': [(21.7, 119.2, 22.8, 121.0), (21.7, 121.0, 22.8, 122.2),
           (22.8, 119.2, 23.9, 121.0), (22.8, 121.0, 23.9, 122.2),
           (23.9, 119.2, 24.7, 121.0), (23.9, 121.0, 24.7, 122.2),
           (24.7, 119.2, 25.5, 121.3), (24.7, 121.3, 25.5, 122.2)],
}


def fetch_tile(sel, bbox):
    south, west, north, east = bbox
    q = ('[out:json][timeout:170];\n'
         f'nwr{sel}["name"]({south},{west},{north},{east});\n'
         'out tags center;')
    for attempt in range(5):
        ep = ENDPOINTS[attempt % len(ENDPOINTS)]
        try:
            data = urllib.parse.urlencode({'data': q}).encode()
            rq = urllib.request.Request(ep, data=data, headers={
                'User-Agent': 'LivdarCandidateInventory/1.0 (offline research inventory)'})
            with urllib.request.urlopen(rq, timeout=320) as r:
                body = json.load(r)
            # Overpass answers a timeout or a load-shedding refusal with HTTP 200 and a
            # "remark" field. Reading that as an empty result silently lost every
            # restaurant in Taiwan: the food group reported 0 elements and was marked
            # done. A remark is a failure and must retry.
            remark = body.get('remark')
            if remark:
                raise RuntimeError(f'overpass remark: {remark[:120]}')
            return body.get('elements', [])
        except Exception as e:
            print(f'    {ep.split("/")[2]} attempt {attempt + 1}: {e}', flush=True)
            time.sleep(20 * (attempt + 1))
    return None


def quarter(bbox):
    s_, w_, n_, e_ = bbox
    mlat, mlon = (s_ + n_) / 2, (w_ + e_) / 2
    return [(s_, w_, mlat, mlon), (s_, mlon, mlat, e_),
            (mlat, w_, n_, mlon), (mlat, mlon, n_, e_)]


def fetch(sel, max_depth=3):
    """Fetch one tag group across every tile, splitting a tile that will not answer.

    A fixed tile grid cannot work for every tag group at once: restaurants in the Taipei
    tile are dense enough that the public instance times out, while the same tile answers
    instantly for hospitals. Rather than pick one grid and lose the dense classes, a tile
    that fails is quartered and retried, down to max_depth. A tile that still fails at
    full depth makes the whole group unreachable, so it is left unmarked and retried on
    the next run rather than being recorded as zero.
    """
    out = []
    queue = [(b, 0) for b in TILES[ISO]]
    while queue:
        bbox, depth = queue.pop(0)
        els = fetch_tile(sel, bbox)
        if els is None:
            if depth >= max_depth:
                return None
            print(f'    tile {bbox} did not answer, splitting', flush=True)
            queue.extend((b, depth + 1) for b in quarter(bbox))
            continue
        out.extend(els)
        time.sleep(6)
    return out


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

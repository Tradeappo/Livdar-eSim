#!/usr/bin/env python3
"""
Attach POI to the geography they are actually inside, and measure how many can be.

This exists because of a measurement, not a hope. 1,665,240 materialised POI carry no city
attribution, and of a 533,415-row sample 65 per cent sit 12km or more from the nearest city
and 38 per cent beyond 20km. The classes that dominate are rural by nature: 66,280 mountain
peaks, 30,169 memorials, 12,654 archaeological sites. Widening the city radius to reach them
was tested and rejected, because a peak 20km from a town is not in that town and saying so to
raise a page count is city-name swapping in geographic form.

What those POI do have is a real parent that is not a city: a national park, a nature reserve,
an island, a lake, a forest, a ski area, a campus, an airport complex. OSM carries those as
named polygons. This step tests CONTAINMENT against them and nothing else. A POI is attached
because it is inside the polygon; never because it is near the centroid, which is the mistake
the city radius already makes and the reason it was left alone.

The output is two things. A per-POI parent assignment, and the counts that say whether this
pool is worth building families on at all. If the containment rate is low the honest answer is
that OSM does not carry enough parent polygons, and that is a finding rather than a failure.

Usage: poi-parent-assign.py [--limit N]
"""
import collections, glob, gzip, json, math, os, sys

ROOT = '/home/user/Livdar-eSim/'
PARENTS = ROOT + 'data/atlas/sources/osm-parents/'
POI = ROOT + 'data/atlas/sources/osm-poi/'
OUT = ROOT + 'data/atlas/sources/osm-poi/_parent-assignment.jsonl.gz'

try:
    from shapely.geometry import shape, Point
    from shapely.strtree import STRtree
except ImportError:
    print('shapely is required', file=sys.stderr)
    raise

LIMIT = None
if '--limit' in sys.argv:
    LIMIT = int(sys.argv[sys.argv.index('--limit') + 1])

# A parent must be big enough to contain things and small enough to mean something. A 40,000
# km2 "forest" polygon is a landcover artefact, not a place a person visits; a 0.01 km2 garden
# cannot be the parent of anything but itself.
MIN_KM2 = 0.05
MAX_KM2 = 20_000.0

# Classes whose POI are the ones this is for. A restaurant outside a town is a roadside
# restaurant and belongs to no park; a peak, a trail marker or a memorial does.
OUTDOOR_POI = {
    'peak', 'viewpoint', 'memorial', 'archaeological_site', 'attraction', 'ruins',
    'picnic_site', 'shelter', 'spring', 'waterfall', 'cave_entrance', 'bench',
    'information', 'guidepost', 'camp_site', 'beach', 'bird_hide', 'monument',
    'castle', 'tower', 'nature_reserve', 'wayside_cross', 'wayside_shrine',
}

parents = []
for f in sorted(glob.glob(PARENTS + 'parents-*.jsonl.gz')):
    with gzip.open(f, 'rt', encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if not line: continue
            try: p = json.loads(line)
            except Exception: continue
            if p.get('geometry') != 'polygon': continue
            km2 = p.get('km2') or 0
            if km2 < MIN_KM2 or km2 > MAX_KM2: continue
            if not p.get('ring'): continue
            parents.append(p)

if not parents:
    print('no parent polygons found; run scripts/atlas/ingest/osm-parents-run.sh first',
          file=sys.stderr)
    sys.exit(2)

print(f'parent polygons usable: {len(parents):,}', file=sys.stderr)
by_cls = collections.Counter(p['cls'] for p in parents)
for c, n in by_cls.most_common():
    print(f'    {n:>7,}  {c}', file=sys.stderr)

geoms, meta = [], []
for i, p in enumerate(parents):
    try:
        g = shape(p['ring'])
    except Exception:
        continue
    if g.is_empty: continue
    geoms.append(g)
    meta.append(i)
tree = STRtree(geoms)
print(f'indexed {len(geoms):,} parent geometries', file=sys.stderr)

countries = {p['country'] for p in parents}
stats = collections.Counter()
assigned_by_cls = collections.Counter()
parent_poi = collections.Counter()           # parent index -> POI count
parent_poi_cls = collections.defaultdict(collections.Counter)
rows = []
seen = set()

for f in sorted(glob.glob(POI + 'poi-*.jsonl.gz')):
    # The country comes from the RECORD, not from the filename. Parsing it out of the name with
    # basename(f)[4:-10] took one character too many off the end and produced "D" for poi-DE, so
    # every file was skipped and this script reported "outdoor POI tested: 0". It printed a zero
    # rather than an empty success, which is the only reason the bug was visible at all; a
    # filename is a guess about the data and the data was carrying the answer the whole time.
    # The US is sharded by region (poi-US-west), which a filename parse has to special-case and
    # a record read does not.
    file_isos = set()
    with gzip.open(f, 'rt', encoding='utf-8') as fh:
        for line in fh:
            line = line.strip()
            if not line: continue
            try: o = json.loads(line)
            except Exception: continue
            if (o.get('country') or '') not in countries:
                stats['poi_outside_the_countries_with_a_parent_layer'] += 1
                continue
            file_isos.add(o.get('country') or '')
            if o.get('kind') == 'place': continue
            cls = o.get('cls')
            if cls not in OUTDOOR_POI:
                stats['skipped_class_not_outdoor'] += 1
                continue
            lat, lon = o.get('lat'), o.get('lon')
            if lat is None or lon is None:
                stats['skipped_no_coordinates'] += 1
                continue
            key = (o.get('id'), o.get('country'))
            if key in seen:
                continue
            seen.add(key)
            stats['tested'] += 1
            pt = Point(float(lon), float(lat))
            best_i, best_km2 = None, None
            for gi in tree.query(pt):
                if not geoms[gi].covers(pt):
                    continue
                pi = meta[gi]
                if parents[pi]['country'] != o.get('country'):
                    continue
                km2 = parents[pi].get('km2') or 1e9
                # most specific containing parent wins, the same rule the area layer uses:
                # a peak inside a reserve inside a national park belongs to the reserve
                if best_km2 is None or km2 < best_km2:
                    best_km2, best_i = km2, pi
            if best_i is None:
                stats['no_containing_parent'] += 1
                continue
            stats['assigned'] += 1
            assigned_by_cls[cls] += 1
            parent_poi[best_i] += 1
            parent_poi_cls[best_i][cls] += 1
            rows.append({
                'poi_id': o.get('id'), 'country': o.get('country'), 'cls': cls,
                'name': o.get('name'), 'lat': lat, 'lon': lon,
                'parent_id': parents[best_i]['id'],
                'parent_name': parents[best_i]['name'],
                'parent_cls': parents[best_i]['cls'],
                'parent_km2': parents[best_i].get('km2'),
                'basis': 'containment',
            })
            if LIMIT and stats['assigned'] >= LIMIT:
                break
    if LIMIT and stats['assigned'] >= LIMIT:
        break

with gzip.GzipFile(OUT, 'wb', compresslevel=6, mtime=0) as gz:
    for r in sorted(rows, key=lambda r: (r['country'], r['parent_id'], str(r['poi_id']))):
        gz.write((json.dumps(r, ensure_ascii=False) + '\n').encode('utf-8'))

tested = stats['tested'] or 1
print('', file=sys.stderr)
print(f"outdoor POI tested:        {stats['tested']:,}", file=sys.stderr)
print(f"attached to a parent:      {stats['assigned']:,} "
      f"({100.0 * stats['assigned'] / tested:.1f}% of those tested)", file=sys.stderr)
print(f"inside no parent polygon:  {stats['no_containing_parent']:,}", file=sys.stderr)
print(f"skipped, class not outdoor:{stats['skipped_class_not_outdoor']:,}", file=sys.stderr)
print('', file=sys.stderr)
print('attached POI by class:', file=sys.stderr)
for c, n in assigned_by_cls.most_common(15):
    print(f'    {n:>8,}  {c}', file=sys.stderr)
print('', file=sys.stderr)
# how many parents hold enough POI to be worth a page: the same question the city shapes ask
for floor in (3, 5, 10, 25):
    k = sum(1 for _i, n in parent_poi.items() if n >= floor)
    print(f'parents holding at least {floor:>2} attached POI: {k:,}', file=sys.stderr)
print('', file=sys.stderr)
print('the largest parents by attached POI:', file=sys.stderr)
for pi, n in parent_poi.most_common(12):
    p = parents[pi]
    mix = ', '.join(f'{c} {m}' for c, m in parent_poi_cls[pi].most_common(4))
    print(f"    {n:>6,}  {p['name'][:40]:40} {p['cls']:20} {p['country']}  [{mix}]",
          file=sys.stderr)
print(f'\nwritten {OUT}', file=sys.stderr)

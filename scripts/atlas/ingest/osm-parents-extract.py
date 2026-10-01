#!/usr/bin/env python3
"""
Materialise PARENT GEOGRAPHIES - the real things that rural POI belong to.

The measurement that made this necessary: 1,314,927 materialised POI carry no city
attribution, and of a 533,415-row sample 65 per cent sit 12km or more from the nearest city
and 38 per cent beyond 20km. The classes that dominate are rural by nature - 66,280 mountain
peaks, 30,169 memorials, 12,654 archaeological sites. Widening the city radius to reach them
was tested and rejected: a restaurant 4.5km outside a 10,000-person town is not in that town,
and saying so to raise a page count is city-name swapping in geographic form.

But those POI are real, and they do belong to something. A peak belongs to a range or a
national park. A trail marker belongs to a trail. A bench belongs to a park. What was missing
was the PARENT, not the POI, and the parent is a named area OSM already carries. The POI pass
never captured these because it reads nodes only and filters for amenity-shaped tags; a
protected area is a way or a relation tagged as landuse or boundary.

So this is a separate pass over a parent-only extract, the same shape as the place pass and
for the same reason: assembling areas over a whole country costs about twenty times a node
read, and a tag-filtered extract is small enough that the cost disappears.

Containment only. Every POI this later attaches to a parent is attached because it is INSIDE
the parent's polygon, never because it is near its centroid. A parent mapped only as a node
is kept and flagged, so the assignment step can refuse to let it ground a containment claim.

Usage: osm-parents-extract.py <parent-layer.pbf> <country_iso2> <out.jsonl.gz>
"""
import sys, gzip, json, collections
import osmium
from shapely import from_wkb
from shapely.geometry import mapping

# Each entry maps an OSM tag pair to the parent class a page would be about. The classes are
# the ones the brief names, kept narrow on purpose: a parent has to be something a person
# would recognise as a place they could go to, not any polygon that happens to exist.
PARENT_TAGS = {
    ('leisure', 'nature_reserve'): 'nature_reserve',
    ('leisure', 'park'): 'park',
    ('leisure', 'garden'): 'garden',
    ('leisure', 'marina'): 'marina',
    ('boundary', 'protected_area'): 'protected_area',
    ('boundary', 'national_park'): 'national_park',
    ('boundary', 'aboriginal_lands'): 'protected_area',
    ('place', 'island'): 'island',
    ('place', 'islet'): 'island',
    ('place', 'archipelago'): 'archipelago',
    ('natural', 'bay'): 'bay',
    ('natural', 'peninsula'): 'peninsula',
    ('natural', 'beach'): 'beach_area',
    ('natural', 'wood'): 'forest',
    ('landuse', 'forest'): 'forest',
    ('landuse', 'winter_sports'): 'ski_area',
    ('aeroway', 'aerodrome'): 'airport_complex',
    ('amenity', 'university'): 'campus',
    ('historic', 'archaeological_site'): 'archaeological_area',
    ('historic', 'memorial'): 'memorial_complex',
    ('tourism', 'theme_park'): 'theme_park',
    ('tourism', 'zoo'): 'zoo_complex',
}
# water needs the subtype, because natural=water covers everything from a pond to a lake
WATER_OK = {'lake', 'reservoir', 'lagoon'}
# a hiking or cycling route relation is a trail SYSTEM, which is a parent for trail markers,
# viewpoints and shelters along it
ROUTE_OK = {'hiking', 'foot', 'bicycle', 'mtb', 'piste'}

IN, ISO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
wkbfab = osmium.geom.WKBFactory()


def parent_class(t):
    if t.get('natural') == 'water':
        return 'lake' if (t.get('water') in WATER_OK) else None
    if t.get('natural') == 'mountain_range' or t.get('region:type') == 'mountain_area':
        return 'mountain_range'
    for (k, v), cls in PARENT_TAGS.items():
        if t.get(k) == v:
            return cls
    return None


def numint(v):
    try:
        return int(str(v).replace(' ', '').replace(',', ''))
    except (TypeError, ValueError):
        return None


class Parents(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.stats = collections.Counter()
        self.seen = set()

    def _row(self, t, name, cls):
        return {
            'kind': 'parent', 'country': ISO, 'name': name, 'cls': cls,
            'qid': t.get('wikidata'),
            'wikipedia': t.get('wikipedia'),
            'protect_class': t.get('protect_class'),
            'protection_title': t.get('protection_title'),
            'operator': t.get('operator'),
            'website': (t.get('website') or t.get('contact:website') or '')[:160] or None,
            'ele': numint(t.get('ele')),
        }

    def area(self, a):
        t = dict(a.tags)
        name = (t.get('name') or '').strip()
        if not name or len(name) < 2:
            self.stats['area_unnamed'] += 1
            return
        cls = parent_class(t)
        if not cls:
            return
        key = ('w' if a.from_way() else 'r', a.orig_id())
        if key in self.seen:
            return
        self.seen.add(key)
        try:
            geom = from_wkb(wkbfab.create_multipolygon(a), hex=True)
        except Exception:
            self.stats['area_geometry_failed'] += 1
            return
        if geom.is_empty:
            self.stats['area_geometry_empty'] += 1
            return
        c = geom.centroid
        minx, miny, maxx, maxy = geom.bounds
        # square degrees to km2, scaled by latitude so a polar polygon is not overstated
        import math
        km2 = geom.area * (111.0 ** 2) * max(0.05, math.cos(math.radians(c.y)))
        r = self._row(t, name, cls)
        r.update({
            'id': f"{key[0]}{key[1]}", 'geometry': 'polygon',
            'lat': round(c.y, 6), 'lon': round(c.x, 6),
            'bbox': [round(minx, 6), round(miny, 6), round(maxx, 6), round(maxy, 6)],
            'km2': round(km2, 4),
            'ring': mapping(geom),
        })
        self.rows.append(r)
        self.stats['area_' + cls] += 1

    def node(self, n):
        t = dict(n.tags)
        name = (t.get('name') or '').strip()
        if not name or len(name) < 2:
            return
        cls = parent_class(t)
        if not cls:
            return
        key = ('n', n.id)
        if key in self.seen:
            return
        self.seen.add(key)
        r = self._row(t, name, cls)
        r.update({'id': f'n{n.id}', 'geometry': 'point',
                  'lat': round(n.location.lat, 6), 'lon': round(n.location.lon, 6)})
        self.rows.append(r)
        self.stats['point_' + cls] += 1

    def relation(self, r):
        t = dict(r.tags)
        if t.get('type') != 'route' or t.get('route') not in ROUTE_OK:
            return
        name = (t.get('name') or '').strip()
        if not name or len(name) < 2:
            return
        key = ('route', r.id)
        if key in self.seen:
            return
        self.seen.add(key)
        # A route relation has no polygon. It is kept as a named parent WITHOUT geometry, so
        # the assignment step can only attach POI to it through an explicit route membership
        # or a named reference, never by containment it cannot test.
        row = self._row(t, name, 'trail_system')
        row.update({'id': f'route{r.id}', 'geometry': 'route',
                    'route_type': t.get('route'),
                    'distance': t.get('distance'),
                    'members': len(r.members)})
        self.rows.append(row)
        self.stats['route_trail_system'] += 1


h = Parents()
h.apply_file(IN, locations=True, idx='flex_mem')

with gzip.GzipFile(OUT, 'wb', compresslevel=6, mtime=0) as gz:
    for r in sorted(h.rows, key=lambda x: (x['cls'], x['name'], x['id'])):
        gz.write((json.dumps(r, ensure_ascii=False) + '\n').encode('utf-8'))

by_cls = collections.Counter(r['cls'] for r in h.rows)
by_geom = collections.Counter(r['geometry'] for r in h.rows)
print(f'{ISO}: {len(h.rows):,} parent entities written to {OUT}', file=sys.stderr)
print(f'  by geometry: {dict(by_geom)}', file=sys.stderr)
for c, n in by_cls.most_common():
    print(f'    {n:>7,}  {c}', file=sys.stderr)

#!/usr/bin/env python3
"""
Materialise NAMED PLACE entities - neighbourhoods, suburbs, quarters, districts,
boroughs - with real geometry where OSM carries it.

Why this is a separate pass from the POI pass: a neighbourhood boundary is a way or a
relation, not a node. The POI pass reads nodes only because reading areas costs about
twenty times as much over a whole country, and POI are overwhelmingly nodes. Places
are the opposite: the useful ones are mapped as areas. So places get their own pass
over a place-only extract, which is a few MB rather than several GB, and the area
assembly is cheap at that size.

Output per place: name, place type, centroid, bounding box, area in km2, the polygon
ring (so containment tests do not need the pbf again), population and Wikidata QID
where tagged. A place mapped only as a node is kept too, flagged geometry=point, so
the aggregation step can decide what each geometry kind is allowed to support: point
places cannot ground a containment claim, only a proximity one.

Usage: osm-places-extract.py <place-layer.pbf> <country_iso2> <out.jsonl.gz>
"""
import sys, gzip, json, collections
import osmium
from shapely import from_wkb
from shapely.geometry import mapping

PLACE_TYPES = {'suburb', 'neighbourhood', 'quarter', 'borough', 'city_block',
               'city_district', 'district'}

IN, ISO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
wkbfab = osmium.geom.WKBFactory()


def popint(v):
    try:
        return int(str(v).replace(' ', '').replace(',', ''))
    except (TypeError, ValueError):
        return None


class Places(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.stats = collections.Counter()
        self.seen = set()

    def _common(self, t, name):
        return {
            'kind': 'place', 'country': ISO, 'name': name,
            'cls': t.get('place'),
            'pop': popint(t.get('population')),
            'qid': t.get('wikidata'),
            'wikipedia': t.get('wikipedia'),
            'admin_level': t.get('admin_level'),
            'in_city': t.get('is_in:city') or t.get('addr:city'),
        }

    def node(self, n):
        t = dict(n.tags)
        if t.get('place') not in PLACE_TYPES:
            return
        name = t.get('name')
        if not name:
            self.stats['unnamed'] += 1
            return
        key = ('n', n.id)
        if key in self.seen:
            return
        self.seen.add(key)
        r = self._common(t, name)
        r.update({'id': f'n{n.id}', 'geometry': 'point',
                  'lat': round(n.location.lat, 6), 'lon': round(n.location.lon, 6)})
        self.rows.append(r)
        self.stats['point'] += 1

    def area(self, a):
        t = dict(a.tags)
        if t.get('place') not in PLACE_TYPES:
            return
        name = t.get('name')
        if not name:
            self.stats['unnamed'] += 1
            return
        # a.orig_id plus from_way tells us which source object this area came from, so
        # the same suburb mapped as both a node and an area is not counted twice
        key = ('w' if a.from_way() else 'r', a.orig_id())
        if key in self.seen:
            return
        self.seen.add(key)
        try:
            geom = from_wkb(bytes.fromhex(wkbfab.create_multipolygon(a)))
        except Exception:
            self.stats['geometry_failed'] += 1
            return
        if geom.is_empty:
            self.stats['geometry_empty'] += 1
            return
        c = geom.centroid
        minx, miny, maxx, maxy = geom.bounds
        # equal-area is not needed for a gate: a degree-based area scaled by latitude
        # is accurate enough to reject a polygon that is too small or absurdly large
        import math
        km2 = geom.area * 111.0 * 111.0 * math.cos(math.radians(c.y))
        r = self._common(t, name)
        r.update({
            'id': f"{'w' if a.from_way() else 'r'}{a.orig_id()}",
            'geometry': 'polygon',
            'lat': round(c.y, 6), 'lon': round(c.x, 6),
            'bbox': [round(minx, 6), round(miny, 6), round(maxx, 6), round(maxy, 6)],
            'km2': round(km2, 4),
            'ring': mapping(geom),
        })
        self.rows.append(r)
        self.stats['polygon'] += 1


h = Places()
h.apply_file(IN, locations=True, idx='flex_mem')

with gzip.open(OUT, 'wt', encoding='utf-8') as f:
    for r in h.rows:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')

json.dump({'country': ISO, 'kept': len(h.rows), **dict(h.stats),
           'by_class': dict(collections.Counter(r['cls'] for r in h.rows)),
           'with_pop': sum(1 for r in h.rows if r.get('pop')),
           'with_qid': sum(1 for r in h.rows if r.get('qid'))},
          sys.stdout, indent=1)
print()

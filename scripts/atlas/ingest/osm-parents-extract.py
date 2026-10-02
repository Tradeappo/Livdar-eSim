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
import sys, gzip, json, collections, math
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
    # place=region is the tag OSM uses for a NAMED geographic or tourist region that is
    # not an administrative unit, and it was missing. Measured 2026-10-02: the strongest
    # region keywords in German are exactly these, not the administrative ones. Allgaeu
    # 2,100 and Schwarzwald 1,900 for sehenswuerdigkeiten, Schwarzwald 1,800 for wandern,
    # against Bayern at 1,600, and Allgaeu is not a Bundesland, a Landkreis or a park. It
    # was in no class this filter accepted, so it was in no page the pipeline could build.
    ('place', 'region'): 'region',
    ('natural', 'bay'): 'bay',
    ('natural', 'peninsula'): 'peninsula',
    ('natural', 'beach'): 'beach_area',
    ('natural', 'wood'): 'forest',
    ('landuse', 'forest'): 'forest',
    ('landuse', 'winter_sports'): 'ski_area',
    ('aeroway', 'aerodrome'): 'airport_complex',
    ('amenity', 'university'): 'campus',
    # historic=memorial and historic=archaeological_site are NOT parents, they are the POI
    # this whole exercise is trying to find parents FOR. Including them produced 75,725
    # "memorial complexes" in Germany that were simply the 75,725 memorial nodes, which would
    # have made each memorial its own parent and answered nothing. A memorial complex worth a
    # page is tagged as a park, a protected area or a named site, and those are already here.
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


# Administrative regions, because the measured demand is REGION-scoped far more often than
# park-scoped: "seen in bayern" is 8,600 a month at difficulty 0 and Bavaria is a state, not a
# park; "best beaches in cornwall" is 1,800 and Cornwall is a county. Only the levels a reader
# would recognise as a place: 4 is a state or region in most countries, 6 a county or
# department. Lower levels are countries, higher ones are municipalities the city layer
# already covers.
ADMIN_LEVEL_CLASS = {'4': 'region', '6': 'county'}


def parent_class(t):
    if t.get('boundary') == 'administrative':
        return ADMIN_LEVEL_CLASS.get(str(t.get('admin_level') or ''))
    if t.get('natural') == 'water':
        return 'lake' if (t.get('water') in WATER_OK) else None
    if t.get('natural') == 'mountain_range' or t.get('region:type') == 'mountain_area':
        return 'mountain_range'
    # region:type carries the rest: natural_area for a named landscape, and anything else
    # a mapper thought was a region. Only when the object also has a name, which the
    # extractor already requires of every parent.
    if t.get('region:type'):
        return 'region'
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
            # Every name:xx. It is the per-entity language mark the destination axis needs: a
            # region tagged name:de=Andalusien is a region German speakers have a word for, and
            # the wikipedia tag alone is far too sparse to stand in for that.
            'local_names': {k[5:]: v for k, v in t.items()
                            if k.startswith('name:') and len(k) <= 12 and v and len(v) < 120},
            'admin_level': t.get('admin_level'),
            'iso_code': t.get('ISO3166-2') or t.get('ref:nuts'),
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
            # create_multipolygon returns a HEX STRING. shapely 2's from_wkb has no hex
            # argument, so from_wkb(s, hex=True) raises TypeError, and the except below was
            # counting it as a geometry failure in a counter that was never printed. The
            # result was 0 polygons out of Germany, which read as "OSM has no parent areas"
            # when it meant "this code cannot parse them". Decode the hex explicitly, the way
            # the place extractor already does.
            geom = from_wkb(bytes.fromhex(wkbfab.create_multipolygon(a)))
        except Exception as e:
            self.stats['area_geometry_failed'] += 1
            # Print the first few, because an unprinted failure counter is
            # indistinguishable from an absence of data, and that is exactly how the
            # from_wkb bug above survived a whole country run.
            if self.stats['area_geometry_failed'] <= 3:
                print(f'  area geometry failed: {type(e).__name__}: {e}', file=sys.stderr)
            return
        if geom.is_empty:
            self.stats['area_geometry_empty'] += 1
            return
        c = geom.centroid
        minx, miny, maxx, maxy = geom.bounds
        # square degrees to km2, scaled by latitude so a polar polygon is not overstated
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

if h.stats:
    print('  handler stats:', file=sys.stderr)
    for k, v in h.stats.most_common():
        print(f'    {v:>8,}  {k}', file=sys.stderr)
by_cls = collections.Counter(r['cls'] for r in h.rows)
by_geom = collections.Counter(r['geometry'] for r in h.rows)
print(f'{ISO}: {len(h.rows):,} parent entities written to {OUT}', file=sys.stderr)
print(f'  by geometry: {dict(by_geom)}', file=sys.stderr)
for c, n in by_cls.most_common():
    print(f'    {n:>7,}  {c}', file=sys.stderr)

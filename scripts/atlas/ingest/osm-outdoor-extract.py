#!/usr/bin/env python3
"""
Outdoor FEATURES with the attributes that make a page possible.

Why a second pass over the same extract. The POI ingest captured 246,255 named mountain peaks
and kept, for each one, an id, a class, a name, a country and a coordinate. Nothing else. No
elevation, no prominence, no Wikipedia link, no range. That is a name on a map, and this
project already refused to build pages out of those: a Wikidata entity with no website was
rejected as thin for exactly the same reason. So the 246,255 peaks were never a scale path,
they were a count. Elevation is the difference between "Zugspitze exists" and "Zugspitze is
2,962m, the highest point in Germany, inside the Wetterstein range, 20km from Garmisch".

The parent pass re-downloads each country extract anyway, so this reads the same file in the
same visit rather than paying for it twice. It keeps the tags a page would actually render, and
it keeps the local-language names, because a Japanese page about a Japanese peak should carry
the Japanese name and the POI pass dropped those too.

Notability is NOT decided here. This materialises a source; the demand and usefulness gates
downstream decide what is page-worthy. What IS recorded here is the evidence those gates need:
whether the feature carries a Wikidata item, a Wikipedia article, an elevation, a prominence,
an operator, a website, an access rule or a difficulty grade.

Usage: osm-outdoor-extract.py <feature-layer.pbf> <country_iso2> <out.jsonl.gz>
"""
import sys, gzip, json, collections
import osmium

IN, ISO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

# Each entry maps a tag pair to the feature class. Narrow on purpose: a thing a person could
# go to and would recognise, with attributes worth reading. A bench is not here; a waterfall is.
FEATURE_TAGS = {
    ('natural', 'peak'): 'peak',
    ('natural', 'volcano'): 'volcano',
    ('natural', 'saddle'): 'mountain_pass',
    ('natural', 'cave_entrance'): 'cave',
    ('natural', 'spring'): 'spring',
    ('natural', 'hot_spring'): 'hot_spring',
    ('natural', 'geyser'): 'geyser',
    ('natural', 'arch'): 'natural_arch',
    ('natural', 'glacier'): 'glacier',
    ('natural', 'dune'): 'dune',
    ('natural', 'sinkhole'): 'sinkhole',
    ('natural', 'beach'): 'beach',
    ('natural', 'bay'): 'bay',
    ('natural', 'cliff'): 'cliff',
    ('waterway', 'waterfall'): 'waterfall',
    ('tourism', 'viewpoint'): 'viewpoint',
    ('tourism', 'camp_site'): 'camp_site',
    ('tourism', 'caravan_site'): 'caravan_site',
    ('tourism', 'wilderness_hut'): 'wilderness_hut',
    ('tourism', 'alpine_hut'): 'mountain_hut',
    ('tourism', 'picnic_site'): 'picnic_site',
    ('leisure', 'beach_resort'): 'beach_resort',
    ('leisure', 'slipway'): 'slipway',
    ('leisure', 'bird_hide'): 'bird_hide',
    ('historic', 'castle'): 'castle',
    ('historic', 'fort'): 'fort',
    ('historic', 'ruins'): 'ruins',
    ('historic', 'archaeological_site'): 'archaeological_site',
    ('historic', 'monument'): 'monument',
    ('historic', 'city_gate'): 'city_gate',
    ('historic', 'aqueduct'): 'aqueduct',
    ('man_made', 'lighthouse'): 'lighthouse',
    ('man_made', 'observatory'): 'observatory',
    ('man_made', 'windmill'): 'windmill',
    ('man_made', 'watermill'): 'watermill',
    ('man_made', 'pier'): 'pier',
    ('amenity', 'ranger_station'): 'ranger_station',
    ('climbing', 'crag'): 'climbing_crag',
}
# A tower is a page only when it is a thing people visit, which the type tag says
TOWER_OK = {'observation', 'bell_tower', 'defensive', 'lighthouse'}
# route relations that are a trail, a cycle way or a piste: the parent for everything along them
ROUTE_OK = {'hiking', 'foot', 'bicycle', 'mtb', 'piste', 'ski'}

# The attributes worth keeping, by the question each one answers on a page.
ATTR_KEYS = (
    'ele', 'prominence', 'isolation',                         # how high, how much of a summit
    'depth', 'length', 'width', 'height', 'area',             # how big
    'sac_scale', 'mtb:scale', 'climbing:grade:uiaa', 'piste:difficulty',   # how hard
    'access', 'fee', 'opening_hours', 'wheelchair', 'dog',    # can you go, on what terms
    'operator', 'website', 'contact:website', 'phone',        # who runs it
    'protect_class', 'protection_title', 'designation',       # what status it has
    'start_date', 'building:architecture', 'material',        # what it is
    'direction', 'tower:type', 'summit:cross', 'capacity',
    'network', 'ref', 'route', 'distance', 'ascent', 'descent',   # route relations
    'tents', 'caravans', 'power_supply', 'shower', 'drinking_water',   # camp sites
)
NUMERIC = {'ele', 'prominence', 'isolation', 'depth', 'length', 'width', 'height',
           'capacity', 'distance', 'ascent', 'descent', 'tents', 'caravans'}


def feature_class(t):
    if t.get('man_made') == 'tower':
        return 'tower' if (t.get('tower:type') in TOWER_OK) else None
    for (k, v), cls in FEATURE_TAGS.items():
        if t.get(k) == v:
            return cls
    return None


def num(v):
    """A number out of an OSM value, which may carry units or a comma."""
    if v is None:
        return None
    s = str(v).strip().lower().replace(',', '.')
    for unit in (' m', 'm', ' metres', ' meters', ' km', 'km', ' ft', 'ft'):
        if s.endswith(unit):
            s = s[:-len(unit)].strip()
            if unit.strip() == 'km':
                try:
                    return round(float(s) * 1000, 1)
                except ValueError:
                    return None
            if unit.strip() == 'ft':
                try:
                    return round(float(s) * 0.3048, 1)
                except ValueError:
                    return None
            break
    try:
        f = float(s)
    except ValueError:
        return None
    return int(f) if f == int(f) else round(f, 2)


def local_names(t):
    """Every name:xx, because a page in that language should use the name that language uses."""
    out = {}
    for k, v in t.items():
        if k.startswith('name:') and len(k) <= 12 and v and len(v) < 120:
            out[k[5:]] = v
    return out


class Features(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.stats = collections.Counter()
        self.seen = set()

    def _emit(self, t, cls, oid, kindchar, lat, lon):
        key = (kindchar, oid)
        if key in self.seen:
            self.stats['duplicate_object'] += 1
            return
        self.seen.add(key)
        attrs = {}
        for k in ATTR_KEYS:
            v = t.get(k)
            if v is None or v == '':
                continue
            attrs[k] = num(v) if k in NUMERIC else str(v)[:160]
        row = {
            'id': kindchar + str(oid), 'kind': 'outdoor', 'cls': cls, 'country': ISO,
            'name': (t.get('name') or '').strip(),
            'qid': t.get('wikidata') or None,
            'wikipedia': t.get('wikipedia') or None,
            'lat': lat, 'lon': lon,
            'attr': attrs,
        }
        ln = local_names(t)
        if ln:
            row['names'] = ln
        self.rows.append(row)
        self.stats['cls:' + cls] += 1
        if row['qid']:
            self.stats['has_wikidata'] += 1
        if row['wikipedia']:
            self.stats['has_wikipedia'] += 1
        if 'ele' in attrs:
            self.stats['has_elevation'] += 1

    def node(self, n):
        t = dict(n.tags)
        if not (t.get('name') or '').strip():
            self.stats['node_unnamed'] += 1
            return
        cls = feature_class(t)
        if not cls:
            return
        self._emit(t, cls, n.id, 'n', round(n.location.lat, 6), round(n.location.lon, 6))

    def way(self, w):
        t = dict(w.tags)
        if not (t.get('name') or '').strip():
            return
        cls = feature_class(t)
        if not cls:
            return
        # the centre of the way's nodes is enough: a cliff or a beach is located, not pinned
        try:
            lats = [nd.location.lat for nd in w.nodes if nd.location.valid()]
            lons = [nd.location.lon for nd in w.nodes if nd.location.valid()]
        except Exception:
            self.stats['way_no_locations'] += 1
            return
        if not lats:
            self.stats['way_no_locations'] += 1
            return
        self._emit(t, cls, w.id, 'w',
                   round(sum(lats) / len(lats), 6), round(sum(lons) / len(lons), 6))

    def relation(self, r):
        t = dict(r.tags)
        if t.get('type') != 'route' or t.get('route') not in ROUTE_OK:
            return
        name = (t.get('name') or '').strip()
        if not name:
            self.stats['route_unnamed'] += 1
            return
        # a route relation has no single point, and inventing one would be the proximity
        # mistake again. It is a parent, and the assignment step works from its members.
        self._emit(t, 'trail_route', r.id, 'r', None, None)


h = Features()
h.apply_file(IN, locations=True, idx='flex_mem')

print(f'[{ISO}] outdoor features: {len(h.rows):,}', file=sys.stderr)
for k, v in sorted(h.stats.items()):
    if k.startswith('cls:'):
        continue
    print(f'    {k:28} {v:>9,}', file=sys.stderr)
print(f'  by class:', file=sys.stderr)
for k, v in sorted(((k[4:], v) for k, v in h.stats.items() if k.startswith('cls:')),
                   key=lambda x: -x[1]):
    print(f'    {k:28} {v:>9,}', file=sys.stderr)

with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as f:
    for r in h.rows:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')
import os
os.replace(OUT + '.tmp', OUT)
print(f'[{ISO}] written {OUT}', file=sys.stderr)

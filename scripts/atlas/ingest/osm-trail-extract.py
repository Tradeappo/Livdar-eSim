#!/usr/bin/env python3
"""
Named long distance routes, with their real length, from OSM route relations and their members.

Why this is the strongest family found in the whole project. Every named German trail tested
carries volume at a difficulty of nearly nothing: Malerweg 6,600 at KD 3, Moselsteig 5,600 at 1,
Rheinsteig 5,400 at 0, Heidschnuckenweg 4,700 at 0, Rothaarsteig 4,600 at 0, Harzer Hexenstieg
1,700 at 5. In Italian, Sentiero degli Dei 14,000 at KD 1 and Via Francigena 10,000 at 29. Ten out
of ten tested had demand. Nothing else measured in this project comes back that clean.

Why it was not built until now. The outdoor pass captured 70,975 German route relations and 18,984
Italian ones and could do nothing with them, because a relation carries no geometry of its own: its
shape lives in the member ways. Holding a route with no length is holding a name, and a name is
what this project refuses to build pages from.

So this is a TWO PASS read of the same filtered layer:

    pass one    every route relation of a walking, cycling or piste type, with its tags and the
                ids of its member ways
    pass two    every way, with node locations, measuring its length and handing it to the routes
                that reference it

Length is the sum of the member way lengths, which is the real figure for a linear route and not an
estimate from a bounding box. A route whose members are missing from the extract comes out with a
partial length, and that is recorded as a coverage ratio rather than presented as a total: a trail
reported at 40km when it is 240km would be worse than no trail page at all.

Usage: osm-trail-extract.py <layer.pbf> <country_iso2> <out.jsonl.gz>
"""
import collections, gzip, json, math, os, sys
import osmium

IN, ISO, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

ROUTE_OK = {'hiking', 'foot', 'walking', 'bicycle', 'mtb', 'piste', 'ski', 'horse', 'canoe',
            'inline_skates', 'running'}
# A network tag says who waymarks the route and at what reach: iwn international, nwn national,
# rwn regional, lwn local. It is the single best available signal that a route is a thing people
# follow rather than a line somebody drew, and the gate downstream uses it.
KEEP_TAGS = ('name', 'ref', 'network', 'route', 'operator', 'symbol', 'osmc:symbol', 'distance',
             'ascent', 'descent', 'roundtrip', 'from', 'to', 'via', 'website', 'wikidata',
             'wikipedia', 'description', 'sac_scale', 'mtb:scale', 'piste:difficulty', 'colour',
             'state', 'trail_visibility', 'surface')


def num(v):
    if v is None:
        return None
    s = str(v).strip().lower().replace(',', '.')
    mult = 1.0
    for unit, m in ((' km', 1.0), ('km', 1.0), (' mi', 1.60934), ('mi', 1.60934),
                    (' m', 0.001), ('m', 0.001)):
        if s.endswith(unit):
            s, mult = s[:-len(unit)].strip(), m
            break
    try:
        return round(float(s) * mult, 2)
    except ValueError:
        return None


class Routes(osmium.SimpleHandler):
    """Pass one: the relations, and which ways each is built from."""

    def __init__(self):
        super().__init__()
        self.routes = []
        self.way_to_routes = collections.defaultdict(list)
        self.stats = collections.Counter()

    def relation(self, r):
        t = dict(r.tags)
        if t.get('type') != 'route':
            return
        rt = t.get('route')
        if rt not in ROUTE_OK:
            self.stats['route_type_not_wanted:' + str(rt)] += 1
            return
        name = (t.get('name') or '').strip()
        if not name:
            self.stats['route_unnamed'] += 1
            return
        idx = len(self.routes)
        attrs = {k: str(t[k])[:200] for k in KEEP_TAGS if t.get(k)}
        members = [m.ref for m in r.members if m.type == 'w']
        for w in members:
            self.way_to_routes[w].append(idx)
        self.routes.append({
            'id': 'r' + str(r.id), 'kind': 'trail', 'country': ISO, 'cls': 'trail',
            'name': name, 'route': rt,
            'qid': t.get('wikidata'), 'wikipedia': t.get('wikipedia'),
            'attr': attrs,
            'member_ways': len(members),
            '_lat': [], '_lon': [], '_len_km': 0.0, '_ways_seen': 0,
        })
        self.stats['route_kept'] += 1


class Ways(osmium.SimpleHandler):
    """Pass two: the ways, measured, and handed back to the routes that reference them."""

    def __init__(self, routes, way_to_routes):
        super().__init__()
        self.routes = routes
        self.w2r = way_to_routes
        self.stats = collections.Counter()

    def way(self, w):
        hits = self.w2r.get(w.id)
        if not hits:
            return
        pts = []
        for nd in w.nodes:
            try:
                if nd.location.valid():
                    pts.append((nd.location.lat, nd.location.lon))
            except Exception:
                continue
        if len(pts) < 2:
            self.stats['way_without_usable_locations'] += 1
            return
        km = 0.0
        for (la1, lo1), (la2, lo2) in zip(pts, pts[1:]):
            km += math.hypot((la2 - la1) * 111.0,
                             (lo2 - lo1) * 111.0 * math.cos(math.radians((la1 + la2) / 2)))
        mid = pts[len(pts) // 2]
        for i in hits:
            r = self.routes[i]
            r['_len_km'] += km
            r['_ways_seen'] += 1
            # a handful of sample points is enough to place the route and to find its parents,
            # and keeping every node would make the file enormous for no gain
            if len(r['_lat']) < 40:
                r['_lat'].append(round(mid[0], 5))
                r['_lon'].append(round(mid[1], 5))
        self.stats['way_measured'] += 1


print(f'[{ISO}] pass one: route relations', file=sys.stderr, flush=True)
h1 = Routes()
h1.apply_file(IN)
print(f'[{ISO}] named routes of a wanted type: {len(h1.routes):,}; '
      f'member ways referenced: {len(h1.way_to_routes):,}', file=sys.stderr)
if not h1.routes:
    print(f'[{ISO}] no named routes in this layer, nothing to do', file=sys.stderr)
    sys.exit(1)

print(f'[{ISO}] pass two: measuring member ways', file=sys.stderr, flush=True)
h2 = Ways(h1.routes, h1.way_to_routes)
h2.apply_file(IN, locations=True, idx='flex_mem')
for k, v in h2.stats.items():
    print(f'    {k:36} {v:>9,}', file=sys.stderr)

rows, drop = [], collections.Counter()
for r in h1.routes:
    seen, total = r.pop('_ways_seen'), r['member_ways']
    lats, lons = r.pop('_lat'), r.pop('_lon')
    km = round(r.pop('_len_km'), 2)
    if total and seen / total < 0.6:
        # the extract does not hold enough of this route to state a length. Saying 40km for a
        # 240km trail would be worse than saying nothing, so it is dropped and counted.
        drop[f'member_coverage_below_60_percent'] += 1
        continue
    if km < 1.0:
        drop['shorter_than_a_kilometre'] += 1
        continue
    if not lats:
        drop['no_usable_coordinates'] += 1
        continue
    r['length_km'] = km
    r['member_coverage'] = round(seen / total, 3) if total else None
    r['lat'] = round(sum(lats) / len(lats), 6)
    r['lon'] = round(sum(lons) / len(lons), 6)
    r['points'] = [[a, b] for a, b in zip(lats, lons)]
    r['tagged_distance_km'] = num(r['attr'].get('distance'))
    rows.append(r)

print(f'\n[{ISO}] trails with a measured length: {len(rows):,}', file=sys.stderr)
print('  by route type:', dict(collections.Counter(r['route'] for r in rows).most_common(8)),
      file=sys.stderr)
print('  by network reach:',
      dict(collections.Counter(r['attr'].get('network', 'none') for r in rows).most_common(8)),
      file=sys.stderr)
print(f'  carrying a Wikidata item: {sum(1 for r in rows if r.get("qid")):,}', file=sys.stderr)
print(f'  carrying a tagged distance to check the measurement against: '
      f'{sum(1 for r in rows if r["tagged_distance_km"]):,}', file=sys.stderr)
_long = sum(1 for r in rows if r['length_km'] >= 20)
print(f'  at least 20km long: {_long:,}', file=sys.stderr)
print('  dropped:', dict(drop), file=sys.stderr)

with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as f:
    for r in rows:
        f.write(json.dumps(r, ensure_ascii=False) + '\n')
os.replace(OUT + '.tmp', OUT)
print(f'[{ISO}] written {OUT}', file=sys.stderr)

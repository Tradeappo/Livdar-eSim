"""How many named POI does each place EXCLUSIVELY contain?

The measurement on 2026-10-02 found that of 334,319 places failing area_is_named(), 128,216
have at least 20 named POI inside their radius. The densest are Republique, Bastille, Opera and
Faubourg Saint-Denis: Paris neighbourhoods that any reader would call real places, rejected
because OSM happens to carry them as a bare node with no population tag, no Wikidata item and
no Wikipedia article. That is a false negative, and a large one.

But "POI inside my radius" is not a safe basis for a page, because neighbourhood radii overlap.
Bastille and Faubourg Saint-Antoine share a boundary and would share most of their POI, and two
pages listing the same restaurants is duplicate content whatever the headings say.

So this pass does not count POI near a place. It assigns every POI to EXACTLY ONE place and
counts what each place exclusively holds. Containment wins over proximity, and the smallest
containing polygon wins over a larger one, because a POI in Kreuzberg is in Kreuzberg and not
in the borough that contains Kreuzberg. Where no polygon contains it, the POI goes to the
nearest point-place whose radius reaches it, measured as distance over radius so a POI 300m
from a city_block (radius 400m) beats one 1.5km from a suburb (radius 1.8km).

The consequence is the property the brief asks for, by construction rather than by a later
check: no two places can list the same POI as their own, so no two pages built from this file
can carry the same content.

Output: data/atlas/sources/places/poi-density.jsonl.gz, one row per place that holds at least
one exclusive named POI, carrying the count, the category mix, and the names, so the candidate
builder can gate on the count and the page can be built from the mix.
"""
import collections, glob, gzip, json, math, os, sys

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'data/atlas/sources/places/poi-density.jsonl.gz'

# the same radii poi-aggregations.py uses, so a place is treated identically in both passes
POINT_RADIUS_KM = {'suburb': 1.8, 'quarter': 1.2, 'neighbourhood': 0.8, 'city_block': 0.4,
                   'borough': 3.0, 'village': 1.5, 'town': 2.5, 'hamlet': 0.7,
                   'locality': 1.0, 'islet': 1.0, 'island': 3.0, 'district': 3.0}

places = []
seen = set()
for f in sorted(glob.glob(ROOT + 'data/atlas/sources/osm-places/places-*.jsonl.gz')) + \
         sorted(glob.glob(ROOT + 'data/atlas/sources/osm-poi/places-*.jsonl.gz')):
    try:
        for l in gzip.open(f, 'rt', encoding='utf-8'):
            l = l.strip()
            if not l: continue
            try: p = json.loads(l)
            except Exception: continue
            if not (p.get('name') or '').strip(): continue
            if p.get('lat') is None: continue
            k = (p.get('country'), p.get('id'))
            if k in seen: continue
            seen.add(k)
            if p.get('geometry') == 'polygon' and p.get('ring'):
                places.append(p)
            elif p.get('cls') in POINT_RADIUS_KM:
                places.append(p)
    except (EOFError, OSError) as e:
        print(f'  unreadable, skipped: {os.path.basename(f)} ({e})', file=sys.stderr)
print(f'places with a geometry or a class radius: {len(places):,}', file=sys.stderr)
print('  by kind: ' + str(collections.Counter(
    'polygon' if p.get('geometry') == 'polygon' else 'point' for p in places)), file=sys.stderr)

from shapely.geometry import shape, Point, box
from shapely.strtree import STRtree

geoms, kind = [], []
for i, p in enumerate(places):
    if p.get('geometry') == 'polygon' and p.get('ring'):
        try: g = shape(p['ring'])
        except Exception: g = None
        if g is None or g.is_empty:
            geoms.append(None); kind.append(None); continue
        geoms.append(g); kind.append('containment')
    else:
        r = POINT_RADIUS_KM[p['cls']]
        la = float(p['lat']); lo = float(p['lon'])
        dla = r / 111.0
        dlo = r / (111.0 * max(0.2, math.cos(math.radians(la))))
        geoms.append(box(lo - dlo, la - dla, lo + dlo, la + dla)); kind.append('proximity')
live = [i for i, g in enumerate(geoms) if g is not None]
tree = STRtree([geoms[i] for i in live])
print(f'indexed: {len(live):,} geometries '
      f'({sum(1 for i in live if kind[i] == "containment"):,} containment, '
      f'{sum(1 for i in live if kind[i] == "proximity"):,} proximity)', file=sys.stderr)

# polygon area in square degrees, used only to prefer the SMALLEST containing polygon
poly_area = {i: (geoms[i].area if kind[i] == 'containment' else None) for i in live}

count = collections.Counter()
cats = collections.defaultdict(collections.Counter)
names = collections.defaultdict(list)
rich = collections.Counter()
assigned = 0
read = 0
for f in sorted(glob.glob(ROOT + 'data/atlas/sources/osm-poi/poi-*.jsonl.gz')):
    try:
        for l in gzip.open(f, 'rt', encoding='utf-8'):
            l = l.strip()
            if not l: continue
            try: o = json.loads(l)
            except Exception: continue
            if o.get('kind') == 'place': continue
            nm = (o.get('name') or '').strip()
            if not nm or o.get('lat') is None: continue
            read += 1
            la = float(o['lat']); lo = float(o['lon'])
            pt = Point(lo, la)
            hits = tree.query(pt)
            if len(hits) == 0: continue
            best_poly = None; best_poly_area = None
            best_pt = None; best_ratio = None
            for h in hits:
                i = live[h]
                g = geoms[i]
                if kind[i] == 'containment':
                    if not g.covers(pt): continue
                    a = poly_area[i]
                    if best_poly_area is None or a < best_poly_area:
                        best_poly, best_poly_area = i, a
                else:
                    p = places[i]
                    r = POINT_RADIUS_KM[p['cls']]
                    if p.get('country') != o.get('country'): continue
                    dk = math.hypot((float(p['lat']) - la) * 111.0,
                                    (float(p['lon']) - lo) * 111.0 * math.cos(math.radians(la)))
                    if dk > r: continue
                    ratio = dk / r
                    if best_ratio is None or ratio < best_ratio:
                        best_pt, best_ratio = i, ratio
            # containment beats proximity: a POI inside a drawn boundary belongs to it
            i = best_poly if best_poly is not None else best_pt
            if i is None: continue
            assigned += 1
            count[i] += 1
            cats[i][o.get('cat') or o.get('category') or o.get('cls') or 'other'] += 1
            if len(names[i]) < 40: names[i].append(nm)
            if o.get('website') or o.get('phone') or o.get('opening_hours') or o.get('qid'):
                rich[i] += 1
    except (EOFError, OSError) as e:
        print(f'  unreadable, skipped: {os.path.basename(f)} ({e})', file=sys.stderr)
print(f'named POI read: {read:,}; assigned to exactly one place: {assigned:,} '
      f'({100.0*assigned/max(read,1):.1f} per cent)', file=sys.stderr)

for floor in (3, 5, 10, 20, 50):
    print(f'  places holding at least {floor:>2} EXCLUSIVE named POI: '
          f'{sum(1 for v in count.values() if v >= floor):,}', file=sys.stderr)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
n = 0
with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as w:
    for i, c in count.items():
        p = places[i]
        w.write(json.dumps({
            'country': p.get('country'), 'place_id': p.get('id'),
            'name': p.get('name'), 'cls': p.get('cls'),
            'geometry': p.get('geometry'), 'lat': p.get('lat'), 'lon': p.get('lon'),
            'attribution': kind[i],
            'exclusive_named_poi': c,
            'exclusive_rich_poi': rich[i],
            'distinct_categories': len(cats[i]),
            'category_mix': dict(cats[i].most_common(25)),
            'sample_names': names[i],
            'already_a_named_entity': bool(p.get('qid') or p.get('wikipedia') or p.get('pop')
                                           or p.get('geometry') == 'polygon'),
        }, ensure_ascii=False) + '\n')
        n += 1
os.replace(OUT + '.tmp', OUT)
print(f'written {OUT}: {n:,} places with at least one exclusive named POI', file=sys.stderr)
recoverable = sum(1 for i, c in count.items() if c >= 20
                  and not (places[i].get('qid') or places[i].get('wikipedia')
                           or places[i].get('pop') or places[i].get('geometry') == 'polygon'))
print(f'of those, {recoverable:,} hold 20 or more AND fail area_is_named() today, which is '
      f'the recoverable population', file=sys.stderr)

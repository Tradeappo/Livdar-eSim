#!/usr/bin/env python3
"""
A page per named, waymarked, measured long distance route.

The demand behind this family was measured before it was designed, across two languages and
eighteen named trails, and every one came back with volume at a keyword difficulty of 0 to 5:
Sentiero degli Dei 14,000 at KD 1, Via Francigena 10,000, Malerweg 6,600 at 3, Moselsteig 5,600 at
1, Rheinsteig 5,400 at 0, Heidschnuckenweg 4,700 at 0. Nothing else measured in this project comes
back that clean.

The gates, and what each one is for:

  A NAME            a route with no name is a line somebody drew.
  A LENGTH          measured as the sum of its member ways, and only where at least 60 per cent of
                    the members are present in the extract. The extractor drops the rest rather
                    than reporting a 240km trail as 40km.
  5 KM              below that it is a town loop, not a destination. The measured sample is all
                    long distance routes and says nothing about a 2km path.
  INDEPENDENT MARK  a waymarking network (iwn, nwn, rwn), a Wikidata item, a Wikipedia article, an
                    operator or a tagged distance. A waymarking network means an organisation
                    signposts the route on the ground, which is stronger evidence that it is a real
                    thing than an encyclopedia article is.
  A PARENT          the containment polygons it runs through, where a parent layer exists for the
                    country, plus the nearest town for bearing. Containment, never proximity.

On the demand evidence, said plainly: the eighteen trails were measured, the other tens of
thousands were not, and no keyword volume is claimed for them. What IS claimed is that the sample
was unanimous and that official waymarking is a source-backed mark of a route people follow. That
is a proxy, it is labelled a proxy on every row, and it is a different kind of evidence from the
measured keyword behind the city families.

Usage: trail-candidates.py
Reads  data/atlas/sources/osm-trails/trails-*.jsonl.gz
       data/atlas/sources/osm-parents/parents-*.jsonl.gz
Writes data/atlas/sources/osm-trails/_trail-candidates.jsonl.gz
"""
import collections, glob, gzip, json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                            # noqa: E402
from shapely.geometry import Point, shape                          # noqa: E402
from shapely.strtree import STRtree                                # noqa: E402

ROOT = '/home/user/Livdar-eSim/'
TRAILS = ROOT + 'data/atlas/sources/osm-trails/'
PARENTS = ROOT + 'data/atlas/sources/osm-parents/'
OUT = TRAILS + '_trail-candidates.jsonl.gz'
slug = entity_identity.slugify

COUNTRY_MKT = {
    'US': ('en-US', 'en'), 'GB': ('en-GB', 'en'), 'DE': ('de-DE', 'de'),
    'FR': ('fr-FR', 'fr'), 'IT': ('it-IT', 'it'), 'ES': ('es-ES', 'es'),
    'NL': ('nl-NL', 'nl'), 'PL': ('pl-PL', 'pl'), 'BR': ('pt-BR', 'pt'),
    'JP': ('ja-JP', 'ja'), 'TW': ('zh-Hant-TW', 'zh-Hant'),
}
MIN_KM = 5.0
NETWORK_REACH = {'iwn': 'international', 'nwn': 'national', 'rwn': 'regional', 'lwn': 'local',
                 'icn': 'international cycle', 'ncn': 'national cycle', 'rcn': 'regional cycle',
                 'lcn': 'local cycle'}
ROUTE_WORD = {'hiking': 'hiking trail', 'foot': 'walking route', 'walking': 'walking route',
              'bicycle': 'cycle route', 'mtb': 'mountain bike route', 'piste': 'piste',
              'ski': 'ski route', 'horse': 'riding route', 'canoe': 'canoe route',
              'running': 'running route', 'inline_skates': 'skating route'}

# ---- parents, for containment -----------------------------------------------
parents, geoms, meta = [], [], []
for f in sorted(glob.glob(PARENTS + 'parents-*.jsonl.gz')):
    for line in gzip.open(f, 'rt', encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        try:
            p = json.loads(line)
        except Exception:
            continue
        if p.get('geometry') != 'polygon' or not p.get('ring'):
            continue
        km2 = p.get('km2') or 0
        if km2 < 1.0 or km2 > 60_000.0:
            continue
        parents.append(p)
for i, p in enumerate(parents):
    try:
        g = shape(p['ring'])
    except Exception:
        continue
    if g.is_empty:
        continue
    geoms.append(g)
    meta.append(i)
tree = STRtree(geoms) if geoms else None
print(f'parent polygons for containment: {len(geoms):,}', file=sys.stderr)

GAZ = entity_identity.load_gazetteer()
cgrid = collections.defaultdict(list)
for cid, c in GAZ.by_id.items():
    if c.get('lat') is None:
        continue
    cgrid[(c['country'], int(c['lat']), int(c['lon']))].append(c)


def towns_along(country, points, min_pop=5000, max_km=8.0, cap=6):
    """The towns a walker would pass or start from, by distance to the sampled points."""
    best = {}
    for la, lo in points:
        for dla in (-1, 0, 1):
            for dlo in (-1, 0, 1):
                for c in cgrid.get((country, int(la) + dla, int(lo) + dlo), ()):
                    if (c['population'] or 0) < min_pop:
                        continue
                    dk = math.hypot((float(c['lat']) - la) * 111.0,
                                    (float(c['lon']) - lo) * 111.0 * math.cos(math.radians(la)))
                    if dk <= max_km and dk < best.get(c['id'], (1e9,))[0]:
                        best[c['id']] = (dk, c)
    out = sorted(best.values(), key=lambda x: x[0])[:cap]
    return [(c, round(d, 1)) for d, c in out]


rows, rejects = [], collections.Counter()
for f in sorted(glob.glob(TRAILS + 'trails-*.jsonl.gz')):
    for line in gzip.open(f, 'rt', encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        try:
            t = json.loads(line)
        except Exception:
            continue
        iso = t.get('country')
        mk = COUNTRY_MKT.get(iso)
        if not mk:
            rejects['no_market_for_country'] += 1
            continue
        market, lang = mk
        km = t.get('length_km') or 0
        if km < MIN_KM:
            rejects['shorter_than_five_km_so_not_a_destination'] += 1
            continue
        attr = t.get('attr') or {}
        net = (attr.get('network') or '').lower()
        marks = []
        if net in NETWORK_REACH:
            marks.append(f'waymarked as a {NETWORK_REACH[net]} route')
        if t.get('qid'):
            marks.append('a Wikidata item')
        if t.get('wikipedia'):
            marks.append('a Wikipedia article')
        if attr.get('operator'):
            marks.append(f"maintained by {attr['operator']}")
        if attr.get('distance'):
            marks.append('a published distance')
        if not marks:
            rejects['no_independent_mark_that_it_is_a_real_route'] += 1
            continue
        pts = [(p[0], p[1]) for p in (t.get('points') or [])]
        if not pts:
            rejects['no_coordinates'] += 1
            continue
        # containment: every parent polygon the sampled points fall inside, most specific first
        hit = {}
        if tree is not None:
            for la, lo in pts[:25]:
                pt = Point(lo, la)
                for gi in tree.query(pt):
                    if not geoms[gi].covers(pt):
                        continue
                    pi = meta[gi]
                    if parents[pi]['country'] != iso:
                        continue
                    hit[parents[pi].get('id') or parents[pi]['name']] = parents[pi]
        through = sorted(hit.values(), key=lambda p: (p.get('km2') or 1e9))[:6]
        towns = towns_along(iso, pts)
        sl = slug(t.get('name') or '')
        if not sl:
            rejects['name_does_not_slug'] += 1
            continue
        rtype = t.get('route') or 'hiking'
        facts = [f"{km:,.0f}km measured from its mapped route"]
        if attr.get('distance'):
            facts.append(f"a published distance of {attr['distance']}")
        for k, lbl in (('ascent', 'total ascent'), ('descent', 'total descent')):
            if attr.get(k):
                facts.append(f"{lbl} {attr[k]}m")
        if net in NETWORK_REACH:
            facts.append(f"waymarked as a {NETWORK_REACH[net]} route")
        if attr.get('symbol') or attr.get('osmc:symbol'):
            facts.append('a waymarking symbol recorded in OpenStreetMap')
        for k in ('sac_scale', 'mtb:scale', 'piste:difficulty'):
            if attr.get(k):
                facts.append(f"graded {attr[k]} on the {k.replace(':', ' ')} scale")
        if attr.get('from') and attr.get('to'):
            facts.append(f"running from {attr['from']} to {attr['to']}")
        if through:
            facts.append(f"passing through {len(through)} named geographies")
        if towns:
            facts.append(f"within 8km of {len(towns)} "
                         f"{'town' if len(towns) == 1 else 'towns'}")
        rows.append({
            'shape': 'trail', 'source': 'osm_trails', 'country': iso,
            'market': market, 'language': lang, 'cls': 'trail',
            'entity_id': t['id'], 'entity_name': t['name'],
            'route_type': rtype, 'length_km': km,
            'network': net or None, 'network_reach': NETWORK_REACH.get(net),
            'member_coverage': t.get('member_coverage'),
            'n': 1, 'enriched': len(facts),
            'url': f"/{lang}/outdoors/trail/{sl}-{t['id']}/",
            'parent_name': (through[0]['name'] if through else (towns[0][0]['name'] if towns else '')),
            'parent_cls': (through[0]['cls'] if through else 'city'),
            'parent_id': (through[0].get('id') if through else (towns[0][0]['id'] if towns else '')),
            'through': [{'name': p['name'], 'cls': p['cls']} for p in through],
            'towns': [{'name': GAZ.label(c['id']), 'id': c['id'], 'km': d} for c, d in towns],
            'city': GAZ.label(towns[0][0]['id']) if towns else '',
            'city_id': towns[0][0]['id'] if towns else '',
            'qid': t.get('qid'), 'wikipedia': t.get('wikipedia'),
            'attribution': 'containment',
            'facts': facts,
            'demand_evidence': 'measured_sample_plus_official_waymarking_proxy',
            'uniqueness_reason': (
                f"{t['name']} is a named {ROUTE_WORD.get(rtype, 'route')} in {iso} measured at "
                f"{km:,.0f}km from its mapped member ways, with "
                f"{', '.join(facts[1:4]) if len(facts) > 1 else 'no further attributes'}. It is "
                f"evidenced as a real route by " + ' and '.join(marks[:2]) + ". The demand for "
                f"this FAMILY was measured on eighteen named trails across two languages, every "
                f"one of which had volume at a difficulty of 0 to 5; the volume for THIS route "
                f"was not measured and none is claimed."),
            'no_superlative': True,
        })

# one page per name per market: two routes of one name in one country cannot be told apart
key = collections.defaultdict(list)
for r in rows:
    key[(r['language'], slug(r['entity_name']))].append(r)
dropped = []
for k, g in key.items():
    if len(g) < 2:
        continue
    keep = max(g, key=lambda r: (r['length_km'], r['enriched']))
    for r in g:
        if r is not keep:
            dropped.append(r)
if dropped:
    ids = {id(r) for r in dropped}
    rows = [r for r in rows if id(r) not in ids]
    rejects['same_name_in_one_language_kept_the_longest'] += len(dropped)

print(f'\ntrail candidates: {len(rows):,}', file=sys.stderr)
print('  by market:', dict(collections.Counter(r['market'] for r in rows).most_common()),
      file=sys.stderr)
print('  by route type:', dict(collections.Counter(r['route_type'] for r in rows).most_common(8)),
      file=sys.stderr)
print('  by network reach:',
      dict(collections.Counter(r['network_reach'] or 'none' for r in rows).most_common()),
      file=sys.stderr)
if rows:
    ls = sorted(r['length_km'] for r in rows)
    print(f'  length km: min {ls[0]:,.0f} median {ls[len(ls)//2]:,.0f} max {ls[-1]:,.0f}',
          file=sys.stderr)
    print(f'  with a containment parent: {sum(1 for r in rows if r["through"]):,}', file=sys.stderr)
print('  rejections, every one counted:', file=sys.stderr)
for k, v in rejects.most_common():
    print(f'    {v:>8,}  {k}', file=sys.stderr)

os.makedirs(TRAILS, exist_ok=True)
with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as fh:
    for r in rows:
        fh.write(json.dumps(r, ensure_ascii=False) + '\n')
os.replace(OUT + '.tmp', OUT)
print(f'\nwritten {OUT} with {len(rows):,} rows', file=sys.stderr)

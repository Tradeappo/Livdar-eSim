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
import collections, glob, gzip, json, math, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                            # noqa: E402
from shapely.geometry import Point, shape                          # noqa: E402
from shapely.strtree import STRtree                                # noqa: E402

ROOT = '/home/user/Livdar-eSim/'
TRAILS = ROOT + 'data/atlas/sources/osm-trails/'
PARENTS = ROOT + 'data/atlas/sources/osm-parents/'
OUT = TRAILS + '_trail-candidates.jsonl.gz'
slug = entity_identity.slugify

# The market list lives in entity_identity, which owns identity for the whole pipeline.
# Twelve files each hand-wrote their own copy; adding tr-TR meant editing twelve places and
# a thirteenth that would have been missed. One definition, imported.
COUNTRY_MKT = entity_identity.COUNTRY_MKT
MIN_KM = 5.0

# ---- the destination axis, for routes outside the eleven market countries ---------------------
# A route in Turkey had no market at all and was simply rejected: 268 of them on the first run.
# That is the same blind spot the city families had, and the fix is the same two-part evidence.
# Half one is the country-by-language table derived from the 2026-10-02 keyword measurement; half
# two has to be something the ROUTE itself carries, and a route has no GeoNames id to look up. It
# does carry its own wikipedia tag, whose prefix IS a language: a route tagged
# wikipedia=de:Lykischer_Weg has a German encyclopedia article written about it, which is
# evidence that German speakers look it up. That is a PROXY for interest and the uniqueness
# reason on every such row says so.
# One loader in entity_identity, which reads every dated measurement file and merges them.
# This was six copies of the same loop; see DEST_FILES there for why each file stays separate.
DEST_LANG = entity_identity.dest_lang_by_country()
LANG_MKT = entity_identity.LANG_MKT


def markets_for_route(iso, t):
    """Every (market, language) this route earns, home market first.

    A route in a market country earns that market outright, as before. On top of that, any
    language in which its own country carries measured demand AND the route carries a Wikipedia
    article earns that language's market too.
    """
    # ONE definition, in entity_identity, shared with the four other geographic builders. This
    # file's own compact reason string stays here, because it is this family's copy.
    out = []
    for mkt, lang, basis in entity_identity.markets_for_entity(
            iso, t, dest_lang=DEST_LANG, marks=entity_identity.marks_for(t)):
        if basis == 'home':
            out.append((mkt, lang, 'home'))
        else:
            _, conn, info, mark = basis
            out.append((mkt, lang, f'destination:{conn:,}/{info:,}:{mark}'))
    return out
NETWORK_REACH = {'iwn': 'international', 'nwn': 'national', 'rwn': 'regional', 'lwn': 'local',
                 'icn': 'international cycle', 'ncn': 'national cycle', 'rcn': 'regional cycle',
                 'lcn': 'local cycle'}
ROUTE_WORD = {'hiking': 'hiking trail', 'foot': 'walking route', 'walking': 'walking route',
              'bicycle': 'cycle route', 'mtb': 'mountain bike route', 'piste': 'piste',
              'ski': 'ski route', 'horse': 'riding route', 'canoe': 'canoe route',
              'running': 'running route', 'inline_skates': 'skating route'}

# ---- parents, for containment -----------------------------------------------
parents, geoms, meta = [], [], []
# Through the shared loader: it builds the geometry and drops the ring in one pass, so the
# two-pass form that held every ring twice cannot be written here any more.
for _slim, _g in entity_identity.iter_parent_polygons(shape, min_km2=1.0, max_km2=60_000.0):
    meta.append(len(parents))
    parents.append(_slim)
    geoms.append(_g)
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
        mkts = markets_for_route(iso, t)
        if not mkts:
            rejects['no_market_and_no_destination_evidence_for_country'] += 1
            continue
        market, lang, why = mkts[0]
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
            'market_reason': why,
        })
        # Fan out to any further market the destination evidence allows. Each copy is a different
        # LANGUAGE and therefore a different URL and a different page; the facts are the same
        # facts because they are facts about one route, and the skeleton that renders them is
        # language-scoped. A copy is never made for a language this route has no mark in.
        for (m2, l2, why2) in mkts[1:]:
            lf = entity_identity.locale_facts_for_row(m2, rows[-1])
            if not lf:
                rejects['no_locale_specific_fact_could_be_computed'] += 1
                continue
            r2 = dict(rows[-1])
            r2['market'], r2['language'], r2['market_reason'] = m2, l2, why2
            r2['locale_facts'] = lf
            r2['url'] = f"/{l2}/outdoors/trail/{sl}-{t['id']}/"
            r2['uniqueness_reason'] = (
                r2['uniqueness_reason'].rstrip('.') +
                f". This page is served to {m2} because {iso} carries measured {l2} demand and "
                f"this route carries {why2.split(':', 3)[-1]}, which is a proxy for {l2} "
                f"interest in it and not a measured volume for this page. For this market it is "
                + ' and '.join(lf) + '.')
            rows.append(r2)

# ---- numbered stages collapse into the route they are stages OF -------------------------------
# Measured on the Dutch layer: 680 of 4,333 candidates were one numbered stage of a long-distance
# route. Westerborkpad alone had 29, Zuiderzeepad 26, Airbornepad Market Garden 27. Twenty-nine
# pages titled "Westerborkpad - 00" through "Westerborkpad - 28" would be twenty-nine pages
# saying almost exactly the same thing, which is the thin content and the near-duplication this
# brief forbids outright.
#
# Dropping them would be the easy answer and it would throw away a good page. A walker searching
# Westerborkpad wants the route: how long it is in total, how many waymarked stages it comes in,
# which towns it passes. Every one of those facts is the SUM of the stages, so collapsing the
# series into one row is aggregation of real data, not invention, and it turns twenty-nine bad
# pages into one that is better than any of them.
#
# Where the full route also exists as its own relation, that row is kept and gains the stage
# count; where it does not, one row is synthesised for the series and says in its own facts that
# its length is the sum of its mapped stages.
STAGE = re.compile(r'(?i)\s*[-,:\u2013(]?\s*\b(etappe|tappe|tappa|stage|stap|deel|dag|'
                   r'section|abschnitt|part|teil|route|etapa|etape)\b\.?\s*0*(\d+)\w*\)?\s*$')
BARE_NUM = re.compile(r'\s*[-,:(]\s*0*(\d+)\s*\)?\s*$')


def stage_stem(name):
    """The route a numbered stage belongs to, or None when the name is not a stage."""
    st = STAGE.sub('', name)
    if st == name:
        st = BARE_NUM.sub('', name)
    st = st.strip(' -,:(\u2013')
    return st if st != name.strip() and len(st) > 3 else None


series = collections.defaultdict(list)
for r in rows:
    st = stage_stem(r['entity_name'])
    if st:
        series[(r['language'], r['country'], st)].append(r)
# three or more siblings is a series. Two could easily be two unrelated routes whose names happen
# to end in a number, and guessing wrong would merge two real places into one page.
series = {k: v for k, v in series.items() if len(v) >= 3}
if series:
    by_name = {(r['language'], r['country'], r['entity_name'].strip()): r for r in rows}
    collapsed, synthesised, absorbed = [], 0, 0
    for (lang, iso, stem), members in series.items():
        total = sum(m['length_km'] for m in members)
        towns, seen_t = [], set()
        through, seen_p = [], set()
        for m in sorted(members, key=lambda x: x['entity_name']):
            for t in m['towns']:
                if t['id'] not in seen_t: seen_t.add(t['id']); towns.append(t)
            for p in m['through']:
                if p['name'] not in seen_p: seen_p.add(p['name']); through.append(p)
        rtype = collections.Counter(m['route_type'] for m in members).most_common(1)[0][0]
        net = collections.Counter(m['network'] for m in members if m['network']).most_common(1)
        reach = collections.Counter(m['network_reach'] for m in members
                                    if m['network_reach']).most_common(1)
        stage_fact = (f"waymarked in {len(members)} stages totalling {total:,.0f}km, "
                      f"measured by summing the mapped member ways of every stage")
        whole = by_name.get((lang, iso, stem))
        if whole is not None:
            # the full route is mapped in its own right: keep it and let it carry the stages
            whole['facts'] = [whole['facts'][0], stage_fact] + whole['facts'][1:]
            whole['enriched'] = len(whole['facts'])
            whole['stage_count'] = len(members)
            whole['uniqueness_reason'] = (
                whole['uniqueness_reason'].rstrip('.') +
                f". It is {stage_fact}, and those stage relations are deliberately NOT given "
                f"pages of their own: {len(members)} pages differing only by a stage number "
                f"would be near duplicates of each other.")
            collapsed.extend(members); absorbed += 1
            continue
        base = max(members, key=lambda m: m['length_km'])
        sl = slug(stem)
        row = dict(base)
        row.update({
            'entity_name': stem, 'length_km': round(total, 2), 'n': len(members),
            'route_type': rtype,
            'network': (net[0][0] if net else None),
            'network_reach': (reach[0][0] if reach else None),
            'url': f"/{lang}/outdoors/trail/{sl}-{base['entity_id']}/",
            'towns': towns, 'through': [{'name': p['name'], 'cls': p['cls']} for p in through],
            'stage_count': len(members),
            'built_from': 'the numbered stages of this route, summed',
        })
        row['facts'] = [f"{total:,.0f}km in total", stage_fact] + [
            f for f in base['facts'] if 'km measured' not in f][:3]
        row['enriched'] = len(row['facts'])
        row['uniqueness_reason'] = (
            f"{stem} is a named {ROUTE_WORD.get(rtype, 'route')} in {iso} mapped as "
            f"{len(members)} waymarked stages and {stage_fact}. The stages are deliberately NOT "
            f"given pages of their own, because {len(members)} pages differing only by a stage "
            f"number would be near duplicates of each other; this one page carries the whole "
            f"route, which is what a walker searching the name is looking for. The demand for "
            f"this FAMILY was measured on eighteen named trails across two languages, every one "
            f"of which had volume at a difficulty of 0 to 5; the volume for THIS route was not "
            f"measured and none is claimed.")
        rows.append(row)
        collapsed.extend(members); synthesised += 1
    ids = {id(r) for r in collapsed}
    rows = [r for r in rows if id(r) not in ids]
    rejects['numbered_stages_collapsed_into_the_whole_route'] += len(collapsed)
    print(f'  stage series found: {len(series)}; stage rows collapsed: {len(collapsed):,}; '
          f'absorbed into an existing whole-route row: {absorbed}; '
          f'whole-route rows synthesised: {synthesised}', file=sys.stderr)

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

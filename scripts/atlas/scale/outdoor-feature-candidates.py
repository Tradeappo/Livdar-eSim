#!/usr/bin/env python3
"""
A page per named outdoor feature, where the data makes one possible.

The measurement that justifies this family, and the one that bounds it. Individual outdoor
features carry their demand in their own name and at a difficulty of nearly zero: Zugspitze
63,000 a month at KD 0, Burg Eltz 31,000 at 0, Watzmann 19,000 at 0, Brocken 15,000 at 0,
Externsteine 12,000 at 0, Teufelshoehle Pottenstein 2,100 at 0. And the tail falls hard:
Berchtesgadener Hochthron 100, Jenner Berchtesgaden 100 with no parent topic of its own. That is
a power law, which is what an entity family always looks like, and it means the family is real
AND its traffic is concentrated. Both halves of that are carried forward rather than one.

What makes a page possible is the attribute set the POI ingest threw away. The old corpus held
246,255 named peaks as an id, a class, a name, a country and a coordinate, which is a name on a
map; this project had already refused to build pages out of exactly that, when it rejected
Wikidata entities with no website as thin. The re-read German extract gives Berchtesgadener
Hochthron an elevation of 1,972m, a prominence of 1,278m, a summit cross, a Wikidata item, a
Wikipedia article and a local-language name. That is a page.

Three gates, and a feature has to clear the first two:

  NOTABLE     a Wikidata item or a Wikipedia article. Someone wrote an encyclopedia entry about
              it. This is a PROXY for interest, not a demand measurement, and it is labelled as
              one everywhere it is used: no keyword volume was bought for 23,540 German features
              and none is claimed.
  MEASURABLE  a number a reader came for: elevation, prominence, depth, length, height, a
              difficulty grade, a capacity. Or, where there is no such number, something
              PRACTICAL that governs a visit: a website, an operator, opening hours, a fee, an
              access rule. A feature with neither is a name and a link, and 8,281 German features
              are exactly that.
  PARENT      a containment parent from the parent layer, so the page sits in a hierarchy and
              can say where the thing is in terms a reader recognises. Attached by polygon, never
              by distance to a centroid.

Usage: outdoor-feature-candidates.py
Reads  data/atlas/sources/osm-outdoor/outdoor-*.jsonl.gz
       data/atlas/sources/osm-parents/parents-*.jsonl.gz
Writes data/atlas/sources/osm-outdoor/_feature-candidates.jsonl.gz
"""
import collections, glob, gzip, json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import entity_identity                                            # noqa: E402
from shapely.geometry import Point, shape                          # noqa: E402
from shapely.strtree import STRtree                                # noqa: E402

ROOT = '/home/user/Livdar-eSim/'
OUTD = ROOT + 'data/atlas/sources/osm-outdoor/'
PARENTS = ROOT + 'data/atlas/sources/osm-parents/'
OUT = OUTD + '_feature-candidates.jsonl.gz'
AGG_ONLY = OUTD + '_aggregate-only-features.jsonl.gz'
slug = entity_identity.slugify

# ---- the destination axis ---------------------------------------------------------------------
# A named peak in Turkey had no market at all and was simply rejected. The fix is the two halves of
# evidence the city families use, and a feature is unusually well placed to carry half two itself:
# the outdoor extract keeps the wikipedia tag and every name:xx from the start, so a mountain
# tagged name:de has a German name because German speakers refer to it. Measured in the Turkish
# layer: of the first 5,000 features, 1,477 carry a Wikidata item, 542 carry a name:xx and 249
# carry a Wikipedia article.
# One loader in entity_identity, which reads every dated measurement file and merges them.
# This was six copies of the same loop; see DEST_FILES there for why each file stays separate.
DEST_LANG = entity_identity.dest_lang_by_country()
# The market list lives in entity_identity, which owns identity for the whole pipeline.
# Twelve files each hand-wrote their own copy; adding tr-TR meant editing twelve places and
# a thirteenth that would have been missed. One definition, imported.
LANG_MKT = entity_identity.LANG_MKT


def feature_marks(o):
    """The languages this feature itself carries a name or an article in.

    One shared implementation in entity_identity, because five builders asking this same question
    five ways is how two of them end up disagreeing about what counts as evidence. It reads the
    Wikidata sitelink index first, which is the mark with real coverage: the OSM wikipedia tag and
    name:xx together left 19,550 of 37,437 feature candidates with no mark in any language.
    """
    return {L: why for L, why in entity_identity.marks_for(o).items() if L in LANG_MKT}

COUNTRY_MKT = entity_identity.COUNTRY_MKT
# Classes that are a destination in their own right. A spring, a cliff and a pier are features of
# a landscape rather than places people go to by name, and they are left out rather than included
# at a lower bar: 6,608 named springs in Germany would be 6,608 pages about water coming out of
# the ground.
PAGE_CLASSES = {
    'peak', 'volcano', 'mountain_pass', 'cave', 'waterfall', 'hot_spring', 'geyser',
    'natural_arch', 'glacier', 'castle', 'fort', 'ruins', 'archaeological_site', 'monument',
    'city_gate', 'aqueduct', 'lighthouse', 'observatory', 'windmill', 'watermill',
    'camp_site', 'caravan_site', 'mountain_hut', 'wilderness_hut', 'beach', 'beach_resort',
    'viewpoint', 'tower', 'climbing_crag', 'bird_hide', 'theme_park',
}
MEASURABLE = ('ele', 'prominence', 'isolation', 'depth', 'length', 'width', 'height', 'area',
              'sac_scale', 'mtb:scale', 'climbing:grade:uiaa', 'piste:difficulty', 'distance',
              'ascent', 'capacity', 'tents', 'caravans', 'start_date')
PRACTICAL = ('website', 'contact:website', 'operator', 'opening_hours', 'fee', 'access',
             'phone', 'wheelchair')
MIN_PARENT_KM2 = 0.05
MAX_PARENT_KM2 = 20_000.0

# ---- parents ---------------------------------------------------------------
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
        if km2 < MIN_PARENT_KM2 or km2 > MAX_PARENT_KM2:
            continue
        # Build the geometry and DROP THE RING in the same pass. Holding both is the exact
        # defect that OOM-killed poi-parent-assign.py at 11,114 MB earlier in this session, and
        # it was sitting here too: `parents.append(p)` keeps the whole record including its ring
        # as a list of Python floats, and `shape(p['ring'])` below then holds every ring a
        # second time as a shapely geometry. Measured on 2026-10-06: killed at 3,356 MB sharing
        # the box, and still climbing past 9,494 MB with the box to itself.
        #
        # Nothing downstream reads the ring. Lines 205 to 218 use the tree for the spatial
        # query and then only country, km2 and the parent's identity, so the ring's only
        # purpose is to become the geometry, and once it has there is no reason to keep it.
        try:
            g = shape(p['ring'])
        except Exception:
            continue
        del p['ring']
        if g.is_empty:
            continue
        # meta maps a GEOMETRY index to a PARENT index, and appending to both only when the
        # geometry is good keeps them aligned by construction rather than by a parallel counter.
        meta.append(len(parents))
        parents.append(p)
        geoms.append(g)
if not parents:
    print('no parent polygons on disk; run the parents pass first', file=sys.stderr)
    sys.exit(2)
tree = STRtree(geoms)
countries = {p['country'] for p in parents}
print(f'parent polygons: {len(geoms):,} across {sorted(countries)}', file=sys.stderr)

# A reader locates a feature by the nearest town, not by a polygon id, so the gazetteer is here
# too. This is NOT attribution: the parent is the containment polygon and the town is a bearing.
GAZ = entity_identity.load_gazetteer()
cgrid = collections.defaultdict(list)
for cid, c in GAZ.by_id.items():
    if c.get('lat') is None:
        continue
    cgrid[(c['country'], int(c['lat']), int(c['lon']))].append(c)


def nearest_town(country, lat, lon, min_pop=5000):
    best, bestd = None, 1e9
    for dla in (-1, 0, 1):
        for dlo in (-1, 0, 1):
            for c in cgrid.get((country, int(lat) + dla, int(lon) + dlo), ()):
                if (c['population'] or 0) < min_pop:
                    continue
                dk = math.hypot((float(c['lat']) - lat) * 111.0,
                                (float(c['lon']) - lon) * 111.0 * math.cos(math.radians(lat)))
                if dk < bestd:
                    bestd, best = dk, c
    return (best, round(bestd, 1)) if best else (None, None)


rows, rejects = [], collections.Counter()
agg_only = []          # features that belong in a list of their parent, not on their own page
seen_slug = {}
for f in sorted(glob.glob(OUTD + 'outdoor-*.jsonl.gz')):
    for line in gzip.open(f, 'rt', encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        try:
            o = json.loads(line)
        except Exception:
            continue
        cls, iso = o.get('cls'), o.get('country')
        if cls not in PAGE_CLASSES:
            rejects[f'class_is_not_a_destination_{cls}'] += 1
            continue
        if iso not in countries:
            rejects['no_parent_layer_for_this_country'] += 1
            continue
        mk = COUNTRY_MKT.get(iso)
        if mk:
            market, lang = mk
        else:
            # No home market, so the BASE row is written in the destination language this feature
            # has the strongest evidence for, and the fan-out below adds any others. Writing a row
            # with no market at all is what produced the earlier "no_market_for_country" rejections
            # for every Turkish peak, and the same omission in poi-aggregations.py is why no
            # destination country had ever produced a POI page. The choice now comes from
            # entity_identity so all five builders make it the same way.
            _s = entity_identity.strongest_destination_language(
                iso, o, dest_lang=DEST_LANG, marks=feature_marks(o))
            if not _s:
                rejects['no_market_and_no_destination_evidence_for_this_feature'] += 1
                continue
            market, lang = _s[0], _s[1]
        attr = o.get('attr') or {}
        notable = bool(o.get('qid') or o.get('wikipedia'))
        measurable = [k for k in MEASURABLE if k in attr]
        practical = [k for k in PRACTICAL if k in attr]
        if not notable:
            rejects['not_notable_no_wikidata_or_wikipedia'] += 1
            continue
        if not measurable and not practical:
            rejects['notable_but_carries_no_fact_a_reader_came_for'] += 1
            continue
        if o.get('lat') is None:
            rejects['no_coordinates'] += 1
            continue
        lat, lon = float(o['lat']), float(o['lon'])
        pt = Point(lon, lat)
        best_i, best_km2 = None, None
        for gi in tree.query(pt):
            if not geoms[gi].covers(pt):
                continue
            pi = meta[gi]
            if parents[pi]['country'] != iso:
                continue
            km2 = parents[pi].get('km2') or 1e9
            # the most specific containing parent wins, the same rule the area layer uses
            if best_km2 is None or km2 < best_km2:
                best_i, best_km2 = pi, km2
        if best_i is None:
            rejects['inside_no_parent_polygon'] += 1
            continue
        par = parents[best_i]
        town, dist = nearest_town(iso, lat, lon)
        name = (o.get('name') or '').strip()
        sl = slug(name)
        if not sl:
            rejects['name_does_not_slug'] += 1
            continue
        # The URL carries the OSM id, because two peaks of one name in one country are ordinary
        # and a slug that collides is a page that disappears into exact dedupe.
        url = f"/{lang}/outdoors/{slug(cls)}/{sl}-{o['id']}/"
        facts = []
        if 'ele' in attr:
            facts.append(f"{attr['ele']}m above sea level")
        if 'prominence' in attr:
            facts.append(f"a prominence of {attr['prominence']}m")
        if 'depth' in attr:
            facts.append(f"{attr['depth']}m deep")
        if 'length' in attr:
            facts.append(f"{attr['length']}m long")
        if 'height' in attr:
            facts.append(f"{attr['height']}m high")
        if 'start_date' in attr:
            facts.append(f"dated to {attr['start_date']}")
        if 'sac_scale' in attr:
            facts.append(f"graded {attr['sac_scale']} on the SAC scale")
        if 'capacity' in attr:
            facts.append(f"a capacity of {attr['capacity']}")
        for k in ('operator', 'opening_hours', 'fee', 'access'):
            if k in attr:
                facts.append(f"{k.replace('_', ' ')}: {attr[k]}")
        where = f"inside {par['name']}, a {par['cls'].replace('_', ' ')}"
        if town:
            where += f", {dist}km from {GAZ.label(town['id'])}"
        # ---- is this entity worth a page of its own, or does it belong in a list? ----------
        # A named hill whose entire content is one elevation, a containing polygon and a
        # distance to the nearest town is not false, it is thin, and 83,612 of them with one
        # number changed is a template rather than an inventory. The rule, in the order the
        # brief sets out:
        #
        #   two or more measured attributes        a reader gets more than one number
        #   a Wikipedia article IN THE PAGE LANGUAGE   somebody wrote an encyclopedia article
        #                                          about it in the reader's own language
        #
        # A Wikidata item alone is NOT enough. It was the old notability test and it admits
        # "45 Hill" and "A Four Mountain" alongside the Zugspitze. The same-language article is
        # the condition that separates them, and the 2026-10-01 entity-demand measurement is
        # the evidence: of its eight measured German head features, the six present in this
        # layer ALL carry a de Wikipedia article, and two of those six - Feldberg at 11,000 a
        # month and Ochsenkopf at 5,800 - carry only ONE measured attribute. An attribute
        # count on its own would have rejected two features with five-figure demand.
        #
        # Everything that fails goes to AGG_ONLY, not to nothing: the aggregation layer counts
        # every feature assigned to a parent whether or not it became a page, so a rejected
        # peak still appears in "peaks in the Berchtesgadener Alpen" with its name and its
        # elevation. One useful list instead of forty pages that each say one number.
        _wp = (o.get('wikipedia') or '')
        _wl = _wp.split(':', 1)[0].strip().lower() if ':' in _wp else ''
        _nattr = len(measurable) + len(practical)
        if _nattr >= 2:
            _basis = f'{_nattr} measured attributes, more than one number for a reader'
        elif _wl == lang:
            _basis = (f'one measured attribute and its own {lang} Wikipedia article, which is '
                      f'an encyclopedia entry written in the language of this page')
        else:
            rejects['thin_one_attribute_and_no_article_in_the_page_language'] += 1
            # The facts go with it. A rejected peak is not discarded, it becomes a ROW in
            # its parent's list - "Grosser Arber, 1,456m above sea level" - which is what
            # makes the list a useful page rather than eight example names.
            agg_only.append({'country': iso, 'cls': cls, 'entity_id': o['id'],
                             'entity_name': name, 'language': lang, 'attributes': _nattr,
                             'wikipedia': _wp, 'facts': facts,
                             'parent_id': par.get('id') or par.get('name'),
                             'parent_name': par['name'], 'parent_cls': par['cls'],
                             'city': GAZ.label(town['id']) if town else '',
                             'km_from_city': dist,
                             'why': 'one measured attribute and no Wikipedia article in the '
                                    'page language, so it belongs in a list of its parent '
                                    'rather than on a page of its own'})
            continue
        rows.append({
            'individual_page_basis': _basis,
            'shape': 'outdoor_feature', 'source': 'osm_outdoor', 'country': iso,
            'market': market, 'language': lang, 'cls': cls,
            'entity_id': o['id'], 'entity_name': name,
            'n': 1, 'enriched': len(measurable) + len(practical) + (1 if o.get('names') else 0),
            'url': url,
            'parent_id': par.get('id') or par.get('name'),
            'parent_name': par['name'], 'parent_cls': par['cls'],
            'city': GAZ.label(town['id']) if town else '',
            'city_id': town['id'] if town else '',
            'km_from_city': dist,
            'qid': o.get('qid'), 'wikipedia': o.get('wikipedia'),
            'local_names': o.get('names') or {},
            'facts': facts,
            'attribution': 'containment',
            'uniqueness_reason': (
                f"{name} is a named {cls.replace('_', ' ')} in {iso} recorded in OpenStreetMap "
                f"with {len(measurable) + len(practical)} measured attributes "
                f"({', '.join(facts[:3])}), {where}. Its notability is evidenced by "
                + ('a Wikipedia article' if o.get('wikipedia') else 'a Wikidata item')
                + ", which is a proxy for public interest and NOT a measured search volume."),
            'no_superlative': True,
        })
        seen_slug[(lang, slug(cls), sl)] = seen_slug.get((lang, slug(cls), sl), 0) + 1

# ---- the discriminator of last resort, from the data the feature carries --------------------
# 1,415 German features share a name within one language and class. The containment parent and the
# nearest town separate most of them, and 188 pairs survive both: two summits of one ridge that
# carry one name, or one hill mapped twice. A page each is indefensible without something that
# tells them apart, and the data already holds it. An elevation is a discriminator a reader can
# use; an id is not. So where the name, the parent and the town all repeat, the measured fact goes
# into the name, and where there is no measured fact the pair is rejected rather than published as
# two pages saying the same words.
_key = collections.defaultdict(list)
for r in rows:
    # Keyed on the parent NAME, not the parent id, because a title collision is about what a
    # reader sees. Two polygons can carry one name, and keying on the id let two German
    # lighthouses through with identical titles: the ids differed, the words did not.
    _key[(r['language'], r['cls'], slug(r['entity_name']), slug(r['parent_name']),
          r['city'])].append(r)
_disamb, _dropped = 0, []
for k, group in _key.items():
    if len(group) < 2:
        continue
    # The fact has to DISCRIMINATE, not merely exist. Two castles called Haus Katz in one county
    # both carry "dated to 1706", so appending it to both produced the same title twice and the
    # first version of this counted that as solved. The candidate facts are compared across the
    # group and the first slot that differs for every member wins. Where no fact separates them,
    # the best-sourced one is kept and the rest are dropped, because two pages headed by the same
    # words about the same thing is the failure this gate exists to prevent.
    def _candidates(r):
        out = []
        for f in r['facts']:
            if ('above sea level' in f or f.endswith('m deep') or f.endswith('m high')
                    or f.endswith('m long') or f.startswith('dated to')
                    or f.startswith('a prominence') or f.startswith('a capacity')):
                out.append(f.replace(' above sea level', ''))
        return out
    cands = [_candidates(r) for r in group]
    chosen = None
    for slot in range(4):
        vals = [(c[slot] if len(c) > slot else None) for c in cands]
        if all(v is not None for v in vals) and len(set(vals)) == len(vals):
            chosen = slot
            break
    if chosen is not None:
        for r, c in zip(group, cands):
            r['entity_name'] = f"{r['entity_name']} ({c[chosen]})"
            _disamb += 1
    else:
        keep = max(group, key=lambda r: r['enriched'])
        for r in group:
            if r is not keep:
                _dropped.append(r)
if _dropped:
    _drop_ids = {id(r) for r in _dropped}
    rows = [r for r in rows if id(r) not in _drop_ids]
    rejects['same_name_same_parent_same_town_and_no_fact_to_tell_them_apart'] += len(_dropped)
print(f'\nfeatures given a measured discriminator in the name: {_disamb:,}', file=sys.stderr)
print(f'features dropped because nothing in the data separated them: {len(_dropped):,}',
      file=sys.stderr)

# ---- fan out to the markets the destination evidence allows ------------------------------------
# Done once over the finished rows rather than inside the emit loop, for the same reason the POI
# aggregation does it that way: one place to get right instead of several. A copy is made only
# where the FEATURE ITSELF carries a name or an article in that language, so the page is about
# something that language already has a word for, which is the difference between a destination
# page and a translated clone.
_fan, _fs = [], collections.Counter()
for r in rows:
    iso = r.get('country')
    langs = DEST_LANG.get(iso) or {}
    if not langs:
        continue
    fmk = feature_marks(r)
    if not fmk:
        _fs['feature_carries_no_name_or_article_in_any_language'] += 1
        continue
    for lang, ev in langs.items():
        if lang == r.get('language'):
            continue
        mkt = LANG_MKT.get(lang)
        if not mkt:
            continue
        mark = fmk.get(lang)
        if not mark:
            _fs['no_mark_in_this_language'] += 1
            continue
        lf = entity_identity.locale_facts_for_row(mkt, r)
        if not lf:
            _fs['no_locale_specific_fact_could_be_computed'] += 1
            continue
        r2 = dict(r)
        r2['market'], r2['language'] = mkt, lang
        r2['locale_facts'] = lf
        if r.get('url') and r.get('language'):
            r2['url'] = '/' + lang + r['url'][len(r['language']) + 1:]
        r2['market_reason'] = (f'{iso} carries measured {lang} demand ({ev[0]:,} connectivity, '
                               f'{ev[1]:,} information) and this feature carries {mark}')
        r2['uniqueness_reason'] = (
            str(r.get('uniqueness_reason') or '').rstrip('.') +
            f'. This page is served to {mkt} because {iso} carries measured {lang} demand and '
            f'this feature carries {mark}, which is a proxy for {lang} interest in it and not a '
            f'measured volume for this page. For this market it is ' + ' and '.join(lf) + '.')
        _fan.append(r2)
        _fs['copied:' + mkt] += 1
if _fan:
    rows.extend(_fan)
    print(f'destination fan-out: {len(_fan):,} feature pages added', file=sys.stderr)
for _k, _v in _fs.most_common():
    print(f'    {_k:52} {_v:>10,}', file=sys.stderr)
    if not _k.startswith('copied:'):
        rejects['destination_fanout_' + _k] += _v

print(f'\noutdoor feature candidates: {len(rows):,}', file=sys.stderr)
print('  by class:', dict(collections.Counter(r['cls'] for r in rows).most_common(14)),
      file=sys.stderr)
print('  by market:', dict(collections.Counter(r['market'] for r in rows)), file=sys.stderr)
print('  by parent class:',
      dict(collections.Counter(r['parent_cls'] for r in rows).most_common(10)), file=sys.stderr)
print(f'  with a local-language name: {sum(1 for r in rows if r["local_names"]):,}',
      file=sys.stderr)
print(f'  names repeating within a language and class: '
      f'{sum(1 for v in seen_slug.values() if v > 1):,} (the id in the URL keeps them apart)',
      file=sys.stderr)
print('\n  rejections, every one counted:', file=sys.stderr)
for k, v in rejects.most_common(18):
    print(f'    {k:54} {v:>8,}', file=sys.stderr)

print(f'\n  sent to the aggregation layer instead of a page of their own: {len(agg_only):,}',
      file=sys.stderr)
print('    by class:',
      dict(collections.Counter(a['cls'] for a in agg_only).most_common(10)), file=sys.stderr)
with gzip.open(AGG_ONLY + '.tmp', 'wt', encoding='utf-8') as fh:
    for a in agg_only:
        fh.write(json.dumps(a, ensure_ascii=False) + '\n')
os.replace(AGG_ONLY + '.tmp', AGG_ONLY)
print(f'  written {AGG_ONLY}', file=sys.stderr)

with gzip.open(OUT + '.tmp', 'wt', encoding='utf-8') as fh:
    for r in rows:
        fh.write(json.dumps(r, ensure_ascii=False) + '\n')
os.replace(OUT + '.tmp', OUT)
print(f'\nwritten {OUT}', file=sys.stderr)

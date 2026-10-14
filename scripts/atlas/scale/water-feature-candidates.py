#!/usr/bin/env python3
"""A page per named lake, river, island, waterfall or protected area, where the data allows one.

THE SAME FAMILY, A DIFFERENT SOURCE, AND ONE GATE REPLACED BY A MEASUREMENT.

outdoor-feature-candidates.py builds a page per named outdoor feature from the OpenStreetMap
extract under three gates: NOTABLE, MEASURABLE, PARENT. This file puts the Wikidata water and
protected-area capture through the same shape of funnel, with one deliberate difference, and
the difference makes the gate STRONGER rather than weaker:

  NOTABLE, as the outdoor family states it, is "a Wikidata item or a Wikipedia article", and
  that family's own docstring calls it a PROXY for interest, not a demand measurement. Applied
  to this capture the proxy is not weak, it is VACUOUS: every row in the capture is a Wikidata
  item, so the test admits all 123,887 entities and distinguishes nothing.

  So here NOTABLE is the measured Wikimedia search-referred readership of the entity's article
  in the language of the page, against the floor in 1M-ENTITY-SEARCH-DEMAND-FLOOR.json. That
  floor is the 25th percentile of the positive readings among the outdoor_feature rows the
  paid-gated pipeline ALREADY ADMITTED, so a lake clearing it is at least as attested as the
  weakest outdoor feature this inventory already publishes.

The other two gates are unchanged and are not negotiable:

  MEASURABLE  two or more facts Wikidata states about the entity. Every entity read here
              already clears that by construction: the capture's own provenance counts them.
  PARENT      a containment parent from the parent layer, attached BY POLYGON, never by
              distance to a centroid. 34 countries have a parent layer and the capture spans
              262, so this is the binding constraint and the funnel reports it as one.

AND A FOURTH GATE THAT IS NEW, because the data forced it. The capture fetched facts over
`wdt:`, which returns a quantity's AMOUNT and not its UNIT. "15.0" for a lake's depth is
enough to COUNT as a fact and not enough to STATE one: writing "15 m deep" would assert a unit
Wikidata never told us, and writing "15.0 deep" is not a page. So a row is refused unless the
unit store has a stated unit for each fact it would print. The funnel counts those separately,
because they are recoverable by one more capture and the other rejections are not.

SIDE. Only the home side is built. Measured: the manifest holds 33,836 outdoor_feature rows
and every one of them is home-side, while the OpenStreetMap builder PRODUCED 10,832
destination-side rows that the manifest admitted none of. So there is no destination-side
reference class to calibrate a floor against, and a floor chosen without one is a number
somebody picked. The destination side stays unbuilt here, for a measured reason, and the
counterfactual is reported.

Usage: water-feature-candidates.py [--min-facts 2] [--survivors PATH]
Reads  data/atlas/sources/wikidata/water-and-protected-*.jsonl.gz
       data/atlas/sources/wikidata/country-iso.json
       data/atlas/sources/wikidata/water-and-protected-sitelinks.jsonl.gz
       data/atlas/sources/wikimedia/entity-search-demand.jsonl.gz
       reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json
       data/atlas/sources/osm-parents/parents-<CC>.jsonl.gz, one country at a time
       data/atlas/sources/wikidata/water-and-protected-units.jsonl.gz, if it exists
Writes data/atlas/sources/wikidata/_water-feature-candidates.jsonl.gz
       data/atlas/sources/wikidata/_water-feature-funnel.json
       data/atlas/sources/wikidata/_water-feature-survivors.txt
"""
import collections, glob, gzip, json, math, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                   # noqa: E402
from shapely.geometry import Point, shape                                 # noqa: E402
from shapely.strtree import STRtree                                       # noqa: E402

SRC = ROOT + 'data/atlas/sources/wikidata/'
PARENTS = ROOT + 'data/atlas/sources/osm-parents/'
OUT = SRC + '_water-feature-candidates.jsonl.gz'
FUNNEL = SRC + '_water-feature-funnel.json'
SURVIVORS = SRC + '_water-feature-survivors.txt'
UNITS = SRC + 'water-and-protected-units.jsonl.gz'
READING = ROOT + 'data/atlas/sources/wikimedia/entity-search-demand.jsonl.gz'
FLOORS = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json'

slug = entity_identity.slugify
dashes = entity_identity.normalise_long_dashes
COUNTRY_MKT = entity_identity.COUNTRY_MKT
LANG_EDITION = {'zh-Hant': 'zh'}
# Same bounds as the outdoor builder: below the first a polygon is a building footprint, above
# the second it is a region and locates nothing.
MIN_PARENT_KM2, MAX_PARENT_KM2 = 0.05, 20_000.0

# The phrase each fact is printed as, and the SI unit Wikidata normalises that property to.
# A fact with no entry here is never printed, so a property added to the capture cannot start
# appearing on pages with a unit this file guessed.
FACT_PHRASE = {
    'area': ('an area of %s', 'square metre'),
    'length': ('%s long', 'metre'),
    'vertical_depth': ('%s deep', 'metre'),
    'max_depth': ('a maximum depth of %s', 'metre'),
    'elevation': ('%s above sea level', 'metre'),
    'height': ('%s high', 'metre'),
    'watershed_area': ('a watershed of %s', 'square metre'),
    'discharge': ('a discharge of %s', 'cubic metre per second'),
    'inception': ('established in %s', None),          # a date, which carries no unit
}


def load_floors():
    d = json.load(open(FLOORS, encoding='utf-8'))
    return d['floor_by_language_and_side'], d


def load_reading():
    out = {}
    for line in gzip.open(READING, 'rt', encoding='utf-8'):
        line = line.strip()
        if line:
            r = json.loads(line)
            out[r['qid']] = r.get('clicks') or {}
    return out


def load_titles():
    out = {}
    p = SRC + 'water-and-protected-sitelinks.jsonl.gz'
    for line in gzip.open(p, 'rt', encoding='utf-8'):
        line = line.strip()
        if line:
            r = json.loads(line)
            if r.get('titles'):
                out[r['qid']] = r['titles']
    return out


def load_units():
    """qid -> {fact: {'amount': str, 'unit': str}}. Absent until the unit capture has run."""
    out = {}
    if not os.path.exists(UNITS):
        return out
    for line in gzip.open(UNITS, 'rt', encoding='utf-8'):
        line = line.strip()
        if line:
            r = json.loads(line)
            if r.get('qid') and r.get('facts'):
                out[r['qid']] = r['facts']
    return out


# An entity can state two of the captured classes: Wikidata says of several German lakes that
# they are a lake AND a protected area, so the same item appears in two class files. Two rows
# for one item is two URLs for one thing, and while the manifest's Wikidata-item dedupe would
# catch it downstream, a builder that emits it is a builder that does not know what it built.
# The order below decides which class the page is about, and it is the order a reader would
# use: the PHYSICAL feature first, because that is what somebody types, and the more specific
# designation before the general one.
CLASS_PREFERENCE = ['waterfall', 'lake', 'river', 'island', 'national_park', 'protected_area']


def load_entities(min_facts, iso):
    """ISO country -> [entity], and the two rejections that need no geometry to decide."""
    by_cc = collections.defaultdict(list)
    rej = collections.Counter()
    read = 0
    # qid -> the row kept, so the second class a Wikidata item states does not become a
    # second page
    best = {}
    dropped_second_class = collections.Counter()
    for f in sorted(glob.glob(SRC + 'water-and-protected-*.jsonl.gz')):
        if 'sitelinks' in f or 'units' in f:
            continue
        for line in gzip.open(f, 'rt', encoding='utf-8'):
            line = line.strip()
            if not line:
                continue
            try:
                r = json.loads(line)
            except Exception:
                continue
            if len(r.get('facts') or {}) < min_facts:
                continue
            read += 1
            cc = iso.get(r.get('country_qid') or '')
            if not cc:
                rej['country_qid_carries_no_iso_code'] += 1
                continue
            r['_cc'] = cc
            q = r.get('qid')
            prev = best.get(q)
            if prev is None:
                best[q] = r
                continue
            def rank(x):
                c = x.get('cls')
                return CLASS_PREFERENCE.index(c) if c in CLASS_PREFERENCE else 99
            keep, drop = (r, prev) if rank(r) < rank(prev) else (prev, r)
            best[q] = keep
            dropped_second_class['%s_also_stated_as_%s' % (keep.get('cls'), drop.get('cls'))] += 1
    for r in best.values():
        by_cc[r['_cc']].append(r)
    if dropped_second_class:
        rej['second_class_stated_for_an_item_already_counted'] = sum(
            dropped_second_class.values())
    return by_cc, rej, read, dict(dropped_second_class.most_common())


def parent_tree(cc):
    """One country's parent polygons. Loaded and discarded per country: the whole layer is
    1.3 GB on disk and holding it all at once spent ten minutes and three gigabytes before
    the first entity was tested, while no entity is ever compared against another country's
    polygons anyway."""
    parents, geoms, meta = [], [], []
    for f in sorted(glob.glob(PARENTS + 'parents-%s.jsonl.gz' % cc)) + \
             sorted(glob.glob(PARENTS + 'parents-%s-*.jsonl.gz' % cc)):
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
            try:
                g = shape(p['ring'])
            except Exception:
                continue
            # the ring is dropped in the same pass that builds the geometry: holding both is
            # what OOM-killed an earlier parent pass at 11,114 MB
            del p['ring']
            if g.is_empty or p.get('country') != cc:
                continue
            meta.append(len(parents))
            parents.append(p)
            geoms.append(g)
    return (parents, geoms, meta, STRtree(geoms)) if geoms else None


def facts_for(qid, raw, units):
    """The printable facts, and the reason when there are none.

    A fact is printed only when the unit store states its unit AND that unit is the one
    Wikidata normalises that property to. Anything else is refused rather than printed with a
    guess. Returns (printable, facts whose unit is absent, facts whose unit is the wrong one),
    because those last two are different problems: the first is fixed by running the unit
    capture, the second is a statement error upstream and running anything again will not
    change it.
    """
    have = units.get(qid) or {}
    out, missing, wrong = [], [], []
    for k in sorted(raw or {}):
        ph = FACT_PHRASE.get(k)
        if not ph:
            continue
        phrase, want_unit = ph
        if want_unit is None:
            # a date: the amount is the whole fact
            v = (have.get(k) or {}).get('amount') or raw.get(k)
            if v:
                out.append(phrase % str(v)[:10])
            continue
        got = have.get(k)
        if not got or not got.get('unit'):
            missing.append(k)
            continue
        if got['unit'] != want_unit:
            # Wikidata normalises each property to one SI unit, so a unit that is not the
            # expected one is a statement error rather than a different convention. Measured
            # on the 7,321-entity unit capture: one river states its DISCHARGE in cubic metres,
            # a volume where a flow rate belongs. Printing it would read "a discharge of 1,234
            # cubic metre", which is not a unit conversion away from right, it is a different
            # quantity. Refused and counted, never printed.
            wrong.append('%s_stated_in_%s' % (k, got['unit'].replace(' ', '_')))
            continue
        out.append(phrase % _render(got['amount'], got['unit']))
    return out, missing, wrong


def _render(amount, unit):
    """A stated amount in a stated unit, in the form a reader uses.

    Wikidata's normalised value is in SI, so a lake area arrives in square metres and a
    length in metres. Converting square metres to square kilometres and metres to kilometres
    where the number is large is a change of SCALE, not of fact, and the alternative is a page
    reading "an area of 1430000 square metre".
    """
    try:
        v = float(amount)
    except (TypeError, ValueError):
        return '%s %s' % (amount, unit)
    if unit == 'square metre':
        return ('%s km2' % _num(v / 1e6)) if v >= 1e5 else ('%s m2' % _num(v))
    if unit == 'metre':
        return ('%s km' % _num(v / 1000.0)) if v >= 2000 else ('%s m' % _num(v))
    if unit == 'cubic metre per second':
        return '%s m3/s' % _num(v)
    return '%s %s' % (_num(v), unit)


def _num(v):
    if abs(v - round(v)) < 0.005:
        return '{:,}'.format(int(round(v)))
    return '{:,.2f}'.format(v)


def main():
    min_facts = 2
    for i, a in enumerate(sys.argv):
        if a == '--min-facts': min_facts = int(sys.argv[i + 1])

    iso = json.load(open(SRC + 'country-iso.json', encoding='utf-8'))['iso']
    floors, floor_doc = load_floors()
    reading = load_reading()
    titles = load_titles()
    units = load_units()
    print('floors %d cells, readings %d entities, titles %d entities, unit rows %d'
          % (len(floors), len(reading), len(titles), len(units)), file=sys.stderr)

    by_cc, rej, read, two_class = load_entities(min_facts, iso)
    print('fact-bearing entities read %d across %d ISO countries' % (read, len(by_cc)),
          file=sys.stderr)

    GAZ = entity_identity.load_gazetteer()
    cgrid = collections.defaultdict(list)
    for cid, c in GAZ.by_id.items():
        if c.get('lat') is not None:
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

    rows, survivors = [], set()
    missing_units = collections.Counter()
    wrong_units = collections.Counter()
    admitted_cc = collections.Counter()
    admitted_cls = collections.Counter()
    floor_pass = collections.Counter()
    # Counted but not built, so the cost of the missing parent layers is a number rather than
    # an impression.
    would_pass_but_for_parent = collections.Counter()
    t0 = time.time()
    for cc in sorted(by_cc):
        ents = by_cc[cc]
        mk = COUNTRY_MKT.get(cc)
        if not mk:
            # No home market. The destination side has no reference class and therefore no
            # floor, for the reason in the docstring, so these are counted and left.
            rej['no_home_market_and_the_destination_side_has_no_calibrated_floor'] += len(ents)
            continue
        market, lang = mk
        ed = LANG_EDITION.get(lang, lang)
        floor = floors.get('%s|home' % ed)
        tree = parent_tree(cc)
        if tree is None:
            rej['no_parent_layer_for_this_country'] += len(ents)
            for e in ents:
                t = titles.get(e['qid']) or {}
                v = (reading.get(e['qid']) or {}).get(ed)
                if ed in t and floor is not None and v is not None and v >= floor:
                    would_pass_but_for_parent[cc] += 1
            continue
        parents, geoms, meta, idx = tree
        for e in ents:
            qid = e['qid']
            co = e.get('coord') or ''
            try:
                lon, lat = co[co.index('(') + 1:co.index(')')].split()
                lat, lon = float(lat), float(lon)
            except Exception:
                rej['coordinate_does_not_parse'] += 1
                continue
            pt = Point(lon, lat)
            best_i, best_km2 = None, None
            for gi in idx.query(pt):
                if not geoms[gi].covers(pt):
                    continue
                pi = meta[gi]
                km2 = parents[pi].get('km2') or 1e9
                if best_km2 is None or km2 < best_km2:
                    best_i, best_km2 = pi, km2
            if best_i is None:
                rej['inside_no_parent_polygon'] += 1
                continue
            par = parents[best_i]
            t = titles.get(qid) or {}
            if ed not in t:
                rej['no_article_in_the_language_of_this_page'] += 1
                continue
            if floor is None:
                rej['no_calibrated_floor_for_this_cell_so_the_gate_is_inert'] += 1
                continue
            v = (reading.get(qid) or {}).get(ed)
            if v is None:
                rej['no_readership_capture_asked_about_this_entity'] += 1
                continue
            if v < floor:
                rej['readership_below_the_calibrated_entity_floor'] += 1
                continue
            floor_pass['%s|home' % ed] += 1
            # The name is the title the language community gave the article, normalised at THIS
            # boundary: the capture stays a faithful record of the fetch and the row we write is
            # ours, which is where the dash rule applies.
            name = dashes(t[ed]).strip()
            # A title like "Lake Garda (Italy)" carries a disambiguator that belongs in a title,
            # not in a name. Taken off only when it is parenthesised at the end, which is the
            # one shape Wikipedia uses for it.
            if name.endswith(')') and '(' in name:
                name = name[:name.rindex('(')].strip() or name
            sl = slug(name)
            if not sl:
                rej['name_does_not_slug'] += 1
                continue
            printable, missing, wrong = facts_for(qid, e.get('facts'), units)
            for _w in wrong:
                wrong_units[_w] += 1
            if missing or len(printable) < 2:
                rej['facts_carry_no_stated_unit_so_they_cannot_be_printed'] += 1
                for k in missing:
                    missing_units[k] += 1
                survivors.add(qid)
                continue
            survivors.add(qid)
            cls = e.get('cls')
            town, dist = nearest_town(cc, lat, lon)
            where = 'inside %s, a %s' % (dashes(par['name']), par['cls'].replace('_', ' '))
            if town:
                where += ', %skm from %s' % (dist, GAZ.label(town['id']))
            rows.append({
                'individual_page_basis': (
                    '%d facts Wikidata states about this entity, and %d search-referred '
                    'readers a month for its %s article against a floor of %d calibrated on '
                    'the outdoor features this inventory already publishes'
                    % (len(printable), v, ed, floor)),
                'shape': 'outdoor_feature', 'source': 'wikidata_water', 'country': cc,
                'market': market, 'language': lang, 'cls': cls,
                'entity_id': qid, 'entity_name': name,
                'n': 1, 'enriched': len(printable),
                'url': '/%s/outdoors/%s/%s-%s/' % (lang, slug(cls), sl, qid.lower()),
                'parent_id': par.get('id') or par.get('name'),
                'parent_name': dashes(par['name']), 'parent_cls': par['cls'],
                'city': GAZ.label(town['id']) if town else '',
                'city_id': town['id'] if town else '',
                'km_from_city': dist,
                'qid': qid, 'wikipedia': '%s:%s' % (ed, t[ed]),
                'local_names': {l: dashes(x) for l, x in t.items()},
                'facts': printable,
                'attribution': 'containment',
                'search_readership': v,
                'search_readership_floor': floor,
                'uniqueness_reason': (
                    '%s is a named %s in %s recorded in Wikidata with %d stated facts (%s), '
                    '%s. Its notability is a MEASURED count and not a proxy: %d readers a '
                    'month reached its %s Wikipedia article from a search engine, against a '
                    'floor of %d taken from the outdoor features this inventory already '
                    'publishes.'
                    % (name, cls.replace('_', ' '), cc, len(printable),
                       ', '.join(printable[:3]), where, v, ed, floor)),
                'no_superlative': True,
            })
            admitted_cc[cc] += 1
            admitted_cls[cls] += 1
        del parents, geoms, meta, idx, tree
        print('  %s: %d entities, %d rows so far, %.0fs'
              % (cc, len(ents), len(rows), time.time() - t0), file=sys.stderr, flush=True)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')
    with open(SURVIVORS, 'w', encoding='utf-8') as fh:
        for q in sorted(survivors, key=lambda x: int(x[1:]) if x[1:].isdigit() else 0):
            fh.write(q + '\n')
    funnel = {
        'built_on': time.strftime('%Y-%m-%d'),
        'min_facts': min_facts,
        'fact_bearing_entities_read': read,
        'distinct_items_after_the_two_class_fold': sum(len(v) for v in by_cc.values()),
        'items_stating_two_captured_classes': two_class,
        'rejections': dict(rej.most_common()),
        'rows_emitted': len(rows),
        'entities_past_every_gate_but_the_unit_gate': len(survivors),
        'admitted_by_country': dict(admitted_cc.most_common()),
        'admitted_by_class': dict(admitted_cls.most_common()),
        'cleared_the_floor_by_cell': dict(floor_pass.most_common()),
        'facts_whose_unit_is_not_stated': dict(missing_units.most_common()),
        'facts_refused_because_wikidata_states_the_wrong_unit_for_that_property':
            dict(wrong_units.most_common()),
        'would_clear_every_gate_but_has_no_parent_layer': dict(
            would_pass_but_for_parent.most_common()),
        'side': 'home only; the destination side has no admitted reference class and so no '
                'calibrated floor, which is recorded rather than worked around',
        'floor_source': 'reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json',
        'floor_percentile': floor_doc.get('percentile'),
    }
    json.dump(funnel, open(FUNNEL, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('\nfact-bearing entities read: %d' % read)
    for k, v in rej.most_common():
        print('   %-62s %7d' % (k, v))
    print('   %-62s %7d' % ('ROWS EMITTED', len(rows)))
    print('\npast every gate but the unit gate: %d entities' % len(survivors))
    if missing_units:
        print('facts whose unit is not stated: %s' % dict(missing_units.most_common()))
    if wrong_units:
        print('facts refused because the stated unit is the wrong one for that property: %s'
              % dict(wrong_units.most_common()))
    if would_pass_but_for_parent:
        print('\nwould clear every gate but has no parent layer:')
        for cc, n in would_pass_but_for_parent.most_common(12):
            print('   %s %6d' % (cc, n))
    print('\nwrote %s and %s' % (OUT, FUNNEL))


if __name__ == '__main__':
    main()

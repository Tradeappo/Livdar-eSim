#!/usr/bin/env python3
"""A page per listed building in England, where the register and the readership both support one.

THE REFUSAL THIS REVISITS, and why revisiting it is not relaxing it. The captured register's own
provenance note says individual pages only for Grade I and Grade II*, because "a page for each
of the 348,219 Grade II entries would be thin and would read as a doorway". That was right about
the REGISTER and it was a judgement about the population rather than a measurement of its
members: it refused 348,219 entries wholesale without asking which of them anybody looks up.

Wikidata states the Historic England list entry number as P1216, so the register joins to
Wikipedia, and from there to the Wikimedia clickstream, which COUNTS the readers who reached an
article from a search engine. Measured 2026-10-18 over the whole register:

  379,685  entries captured
   19,561  carry P1216 and an English Wikipedia article
   16,924  of those match a captured register row
   12,625  have a positive readership
    7,884  read AT OR ABOVE the calibrated entity floor of 28 a month
           median 82, maximum 22,614, and 2,975 of them are Grade II

Those 2,975 Grade II entries are not the thin tail the earlier note refused. They are the
individually attested exceptions to it, and each one is admitted on its own measured number
rather than on its grade.

THE GATES, and every one of them is the existing bar rather than a new one:

  OFFICIAL    the entry must carry its Historic England grade, listing year, official record
              URL and coordinates. Four stated facts from the register, none computed here.
  MEASURED    search-referred readership of its English article at or above the floor in
              1M-ENTITY-SEARCH-DEMAND-FLOOR.json, which is the 25th percentile of the positive
              readings among the outdoor_feature rows this inventory already publishes. The
              same bar the water layer cleared.
  PARENT      a containment parent from the GB parent layer, attached BY POLYGON, with a
              nearest town as a bearing. Identical to the outdoor family's third gate.

DUPLICATE PROTECTION, and the first version of this file got it wrong. Many Grade I entries
are castles, abbeys and monuments the outdoor layer ALREADY pages, with Wikidata as the
identity in both. The first version left that to the manifest's one-page-per-Wikidata-item
dedupe, and that dedupe does not fire here: its key is (language, SURFACE, item), and this
family's surface is `heritage` while the outdoor layer's is `outdoors`. The scoping is
deliberate, so that a city can hold a places page and a weather page about the same city, but
it means two pages asking nearly the same question about one castle pass straight through.
Measured: 381 of the 5,593 rows were exactly that.

So the exclusion is made HERE, where it can be seen: an item already carried by the outdoor or
water candidate layers is refused by name. The builder also refuses two list entries that
resolve to one item.

Licence: Historic England under the Open Government Licence v3.0, attribution required and
carried on every row; Wikidata CC0; the clickstream CC0.

Usage: heritage-listed-candidates.py
Writes data/atlas/sources/heritage/_listed-candidates.jsonl.gz
       data/atlas/sources/heritage/_listed-funnel.json
"""
import collections, glob, gzip, json, math, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                  # noqa: E402
from shapely.geometry import Point, shape                                # noqa: E402
from shapely.strtree import STRtree                                      # noqa: E402

SRC = ROOT + 'data/atlas/sources/heritage/'
OUT = SRC + '_listed-candidates.jsonl.gz'
FUNNEL = SRC + '_listed-funnel.json'
PARENTS = ROOT + 'data/atlas/sources/osm-parents/'
CLICKS = ROOT + 'data/atlas/sources/wikimedia/search-clicks.en.tsv.gz'
FLOORS = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json'

slug = entity_identity.slugify
dashes = entity_identity.normalise_long_dashes
MIN_PARENT_KM2, MAX_PARENT_KM2 = 0.05, 20_000.0
ATTRIBUTION = ('Contains Historic England data licensed under the Open Government Licence '
               'v3.0; Wikidata CC0 1.0; Wikimedia clickstream CC0 1.0')


def main():
    floor = json.load(open(FLOORS, encoding='utf-8'))['floor_by_language_and_side']['en|home']
    wiki = json.load(open(SRC + 'nhle-wikipedia.json', encoding='utf-8'))['entries']
    reg = {}
    for line in gzip.open(SRC + 'england-nhle.jsonl.gz', 'rt', encoding='utf-8'):
        line = line.strip()
        if line:
            d = json.loads(line)
            reg[str(d['id'])] = d
    print('register %d, wikipedia-joined %d, floor %d' % (len(reg), len(wiki), floor),
          file=sys.stderr)

    want = {}
    rej = collections.Counter()
    for nhle, w in wiki.items():
        if nhle not in reg:
            rej['wikidata_states_a_list_entry_this_capture_does_not_hold'] += 1
            continue
        want.setdefault(w['en_title'].replace(' ', '_'), []).append(nhle)

    clicks = {}
    with gzip.open(CLICKS, 'rt', encoding='utf-8') as fh:
        next(fh, None)
        for line in fh:
            a, _, rest = line.rstrip('\n').partition('\t')
            if a in want:
                v = int(rest.split('\t')[0])
                for n in want[a]:
                    clicks[n] = v

    # GB parent polygons, loaded once: this is one country, so the whole-layer memory problem
    # the water builder had does not arise.
    parents, geoms, meta = [], [], []
    for f in sorted(glob.glob(PARENTS + 'parents-GB.jsonl.gz')):
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
            del p['ring']
            if g.is_empty:
                continue
            meta.append(len(parents))
            parents.append(p)
            geoms.append(g)
    if not geoms:
        sys.exit('no GB parent polygons on disk')
    tree = STRtree(geoms)
    print('GB parent polygons: %d' % len(geoms), file=sys.stderr)

    GAZ = entity_identity.load_gazetteer()
    grid = collections.defaultdict(list)
    for cid, c in GAZ.by_id.items():
        if c.get('country') == 'GB' and c.get('lat') is not None:
            grid[(int(c['lat']), int(c['lon']))].append(c)

    def nearest_town(lat, lon, min_pop=5000):
        best, bestd = None, 1e9
        for dla in (-1, 0, 1):
            for dlo in (-1, 0, 1):
                for c in grid.get((int(lat) + dla, int(lon) + dlo), ()):
                    if (c['population'] or 0) < min_pop:
                        continue
                    dk = math.hypot((float(c['lat']) - lat) * 111.0,
                                    (float(c['lon']) - lon) * 111.0
                                    * math.cos(math.radians(lat)))
                    if dk < bestd:
                        bestd, best = dk, c
        return (best, round(bestd, 1)) if best else (None, None)

    # Items the outdoor and water layers already page. Read from the candidate files rather
    # than guessed at, so this cannot drift from what those builders actually emitted.
    already = set()
    for rel in ('data/atlas/sources/osm-outdoor/_feature-candidates.jsonl.gz',
                'data/atlas/sources/wikidata/_water-feature-candidates.jsonl.gz'):
        try:
            for line in gzip.open(ROOT + rel, 'rt', encoding='utf-8'):
                line = line.strip()
                if line:
                    q = json.loads(line).get('qid')
                    if q:
                        already.add(q)
        except (EOFError, OSError, FileNotFoundError):
            print('  %s not on disk; the overlap it would exclude is NOT excluded' % rel,
                  file=sys.stderr)
    print('items already paged by the outdoor or water layers: %d' % len(already),
          file=sys.stderr)

    rows, seen_qid, seen_slug = [], {}, collections.Counter()
    by_grade = collections.Counter()
    for nhle, w in sorted(wiki.items(), key=lambda kv: -clicks.get(kv[0], 0)):
        e = reg.get(nhle)
        if not e:
            continue
        v = clicks.get(nhle, 0)
        if v < floor:
            rej['readership_below_the_calibrated_entity_floor'] += 1
            continue
        if not (e.get('grade') and e.get('listed_year') and e.get('official_url')
                and e.get('lat') is not None):
            rej['register_row_is_missing_one_of_the_four_official_facts'] += 1
            continue
        qid = w['qid']
        if qid in already:
            # one castle, one page. The outdoor layer got there first and asks nearly the same
            # question about the same object, so a second page here would rest on one piece of
            # evidence about one thing.
            rej['the_outdoor_or_water_layer_already_pages_this_wikidata_item'] += 1
            continue
        if qid in seen_qid:
            # two list entries, one Wikidata item: one building recorded twice
            rej['a_second_list_entry_for_an_item_already_taken'] += 1
            continue
        lat, lon = float(e['lat']), float(e['lon'])
        pt = Point(lon, lat)
        best_i, best_km2 = None, None
        for gi in tree.query(pt):
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
        # the article title is the name a reader knows; the register's own name is often an
        # address in capitals, which is a record and not a page title
        name = dashes(w['en_title']).strip()
        if name.endswith(')') and '(' in name:
            name = name[:name.rindex('(')].strip() or name
        sl = slug(name)
        if not sl:
            rej['name_does_not_slug'] += 1
            continue
        seen_qid[qid] = nhle
        seen_slug[sl] += 1
        town, dist = nearest_town(lat, lon)
        _pc = par['cls'].replace('_', ' ')
        where = 'inside %s, %s %s' % (dashes(par['name']),
                                      'an' if _pc[:1].lower() in 'aeiou' else 'a', _pc)
        if town:
            where += ', %skm from %s' % (dist, GAZ.label(town['id']))
        facts = ['Grade %s listed' % e['grade'], 'listed in %s' % e['listed_year']]
        by_grade[e['grade']] += 1
        rows.append({
            'shape': 'heritage_listed_building', 'source': 'historic_england_nhle',
            'country': 'GB', 'market': 'en-GB', 'language': 'en', 'cls': 'listed_building',
            'grade': e['grade'], 'listed_year': e['listed_year'],
            'entity_id': nhle, 'entity_name': name, 'n': 1, 'enriched': 4,
            'url': '/en/heritage/listed-building/%s-%s/' % (sl, nhle),
            'parent_id': par.get('id') or par.get('name'),
            'parent_name': dashes(par['name']), 'parent_cls': par['cls'],
            'city': GAZ.label(town['id']) if town else '',
            'city_id': town['id'] if town else '',
            'km_from_city': dist,
            'qid': qid, 'wikipedia': 'en:%s' % w['en_title'],
            'official_url': e['official_url'],
            'search_readership': v, 'search_readership_floor': floor,
            'facts': facts,
            'attribution': ATTRIBUTION,
            'licence_note': 'Open Government Licence v3.0, attribution required',
            'individual_page_basis': (
                'four facts stated by the official register and %d search-referred readers a '
                'month for its English article against a floor of %d' % (v, floor)),
            'uniqueness_reason': (
                '%s is a Grade %s listed building in England, listed in %s, recorded by '
                'Historic England as list entry %s, %s. Its notability is a MEASURED count '
                'and not a proxy: %d readers a month reached its English Wikipedia article '
                'from a search engine, against a floor of %d taken from the outdoor features '
                'this inventory already publishes.'
                % (name, e['grade'], e['listed_year'], nhle, where, v, floor)),
            'no_superlative': True,
        })

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with gzip.open(OUT, 'wt', encoding='utf-8') as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')
    funnel = {
        'built_on': time.strftime('%Y-%m-%d'),
        'register_entries': len(reg),
        'joined_to_an_english_article_via_p1216': len(wiki),
        'rejections': dict(rej.most_common()),
        'rows_emitted': len(rows),
        'by_grade': dict(by_grade.most_common()),
        'floor_used': floor,
        'floor_source': 'reports/livdar-expiry-freeze-2026-09-30/'
                        '1M-ENTITY-SEARCH-DEMAND-FLOOR.json, en|home',
        'grade_ii_admitted_individually': by_grade.get('II', 0),
        'why_grade_ii_is_here': 'the earlier refusal of Grade II was a judgement about the '
                                'population, not a measurement of its members; each row here '
                                'clears the readership floor on its own number',
        'attribution': ATTRIBUTION,
    }
    json.dump(funnel, open(FUNNEL, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('register entries read: %d' % len(reg))
    for k, v in rej.most_common():
        print('   %-58s %7d' % (k, v))
    print('   %-58s %7d' % ('ROWS EMITTED', len(rows)))
    print('by grade: %s' % dict(by_grade.most_common()))
    print('wrote %s' % OUT)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""An index page per class of landmark inside one administrative area, or near one city.

WHAT THIS IS AND WHY IT IS NOT A SECOND PAGE ABOUT THE SAME THING. The landmark layer builds
one page per entity. This builds the page a reader wants BEFORE they know which entity they
are after: the twelve castles in a district, with what is on record about each. It is the
same shape as outdoor_region_feature, which this manifest has held for weeks - 1,954 rows,
admitted at three members or more - and it is built here from the landmark rows rather than
from the OpenStreetMap parent layer, so it reaches the whole world instead of 34 countries.

THE MEMBERS ARE THE CONTENT, which is what keeps this off the thin-page pile. Every member
is a row the landmark builder already admitted, so every member carries a measured readership
in this page's language and at least two facts Wikidata states about it. A list of twelve
such entities is twelve attested entities with their facts on one page, not twelve names.

THREE AXES, BECAUSE P131 IS OFTEN TOO SMALL TO BE A PAGE. The administrative area Wikidata
states for a landmark is whatever the nearest level of the hierarchy is, which for a German
church is a Gemeinde of two thousand people. Grouping on that alone produced 82 lists from
1,665 groups in a trial run: almost every group had one or two members. So a second grouping
runs beside it on the nearest settlement of 5,000 or more within 50km, which is the question
a traveller actually asks - the castles near Munich, not the castles in Oberhaching. A group
whose member set is identical to one already emitted is dropped, so a district that holds
exactly the same entities as the city beside it gives one page and not two.

AND A THIRD AXIS UP THE HIERARCHY, measured after the first two ran. 56,074 of the 62,361
groups held fewer than three members and 62,381 rows sat in them, not because the places are
scattered but because P131 names the NEAREST administrative level: three churches in one
Gemeinde is rare, three churches in the Landkreis above it is ordinary. So the chain
Wikidata states is climbed one and two levels, never a radius: a circle would group a church
in one country with a church in another wherever the border runs close, and stated
containment is what this project uses everywhere else.

The coarser axes are refused where they would take someone else's page. An ancestor holding
more than MAX_COARSE_MEMBERS is a REGION list and the region layer owns that shape. An
ancestor that is a country is not a page here at all. And an ancestor whose name and class
match a row the region or outdoor aggregation already emitted in this language is that row,
reached by a different key, so it is counted as a collision rather than built twice.

THREE, AND NOT A NUMBER CHOSEN HERE. The floor is the one outdoor_region_feature already
uses, so this family is admitted on the same rule as the family it copies rather than on a
rule invented for it. 338 of those 1,954 rows sit at exactly three members.

NO SUPERLATIVES, and the reason is sharper than the gate that would catch them. This file can
say the earliest DATE IN THIS LIST, because that is a fact about the list. It cannot say the
oldest castle in the district, because it has no knowledge of castles the landmark layer did
not admit, and a claim about the world made from a filtered set is false even when every
number in it is right.

Usage: landmark-area-list-candidates.py [--min-members 3]
Reads  data/atlas/sources/wikidata/_landmark-candidates.jsonl.gz
Writes data/atlas/sources/wikidata/_landmark-area-candidates.jsonl.gz
       data/atlas/sources/wikidata/_landmark-area-funnel.json
"""
import collections, gzip, json, os, re, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                    # noqa: E402

SRC = ROOT + 'data/atlas/sources/wikidata/_landmark-candidates.jsonl.gz'
CHAIN = ROOT + 'data/atlas/sources/wikidata/landmark/_containment-chain.jsonl.gz'
OUT = ROOT + 'data/atlas/sources/wikidata/_landmark-area-candidates.jsonl.gz'
FUNNEL = ROOT + 'data/atlas/sources/wikidata/_landmark-area-funnel.json'
slug = entity_identity.slugify
MIN_MEMBERS = 3
# Above this a list is a REGION page, and the region aggregation layer already owns that
# shape with its own measured demand. Taken from that layer rather than chosen here: its
# 1,954 rows top out at a 12-plus bucket, and sixty is five times its largest ordinary
# group, which is the point at which "the castles in X" stops being a list and starts being
# an index of a province.
MAX_COARSE_MEMBERS = 60
# An ancestor of one of these classes is a container, not a place a list belongs to.
TOO_COARSE = ('country', 'sovereign state', 'federal state', 'continent',
              'constituent country', 'island country', 'microstate')
YEAR = re.compile(r'(?:dating from|opened in) (\d{1,4})(?: BC)?$')


def load_chain():
    """{qid: {label, cls, parents}} for every administrative item above a landmark."""
    out = {}
    try:
        for l in gzip.open(CHAIN, 'rt', encoding='utf-8'):
            d = json.loads(l)
            out[d['qid']] = d
    except (EOFError, OSError, FileNotFoundError):
        pass
    return out


def ancestors(chain, qid, level):
    """The items exactly `level` steps above qid, following every stated P131.

    Every value is followed, not the first: a commune really can sit in two arrondissements
    and choosing one would be a silent decision about which page a landmark appears on.
    """
    frontier = {qid}
    for _ in range(level):
        nxt = set()
        for q in frontier:
            for p in (chain.get(q) or {}).get('parents') or ():
                nxt.add(p)
        frontier = nxt
        if not frontier:
            break
    return frontier


def existing_aggregation_keys():
    """(language, class, folded parent name) of every list the older layers already emit.

    Those layers key their parents by OpenStreetMap relation id and this one keys them by
    Wikidata item, so the two can never collide on an id. They collide on the PLACE, which
    is what a reader would see, so the check is on the name and the class in the language.
    """
    keys = set()
    for rel, clskey in (
            ('data/atlas/sources/osm-parents/_region-aggregations.jsonl.gz', 'cls'),
            ('data/atlas/sources/osm-parents/_outdoor-aggregations.jsonl.gz', 'feature')):
        try:
            for l in gzip.open(ROOT + rel, 'rt', encoding='utf-8'):
                d = json.loads(l)
                if d.get('parent_name') and d.get('language'):
                    keys.add((d['language'], str(d.get(clskey) or ''),
                              slug(d['parent_name'])))
        except (EOFError, OSError, FileNotFoundError):
            pass
    return keys


def main():
    args = sys.argv[1:]
    floor = (int(args[args.index('--min-members') + 1]) if '--min-members' in args
             else MIN_MEMBERS)
    chain = load_chain()
    taken = existing_aggregation_keys()
    groups = collections.defaultdict(list)
    n_in = 0
    NEAR_KM = 50.0
    for l in gzip.open(SRC, 'rt', encoding='utf-8'):
        d = json.loads(l)
        n_in += 1
        groups[('area', d['language'], d['cls'], d['parent_id'],
                d['parent_name'])].append(d)
        if d.get('city_id') and (d.get('km_from_city') or 999) <= NEAR_KM:
            groups[('near', d['language'], d['cls'], str(d['city_id']),
                    d['city'])].append(d)
        for lvl in (1, 2):
            for anc in ancestors(chain, d['parent_id'], lvl):
                node = chain.get(anc) or {}
                if not node.get('label'):
                    continue
                groups[('up%d' % lvl, d['language'], d['cls'], anc,
                        node['label'])].append(d)

    rej = collections.Counter()
    rows = []
    by_cls = collections.Counter()
    by_lang = collections.Counter()
    seen_sets = {}
    # FINEST AXIS FIRST, so the member-set dedupe below keeps the most specific page when
    # a Gemeinde and the Landkreis above it hold exactly the same three churches. Sorting
    # by size alone would have kept whichever came out of the dict first.
    AXIS_ORDER = {'area': 0, 'near': 1, 'up1': 2, 'up2': 3}
    for (axis, lang, cls, pid, pname), ms in sorted(
            groups.items(), key=lambda kv: (AXIS_ORDER[kv[0][0]], -len(kv[1]), kv[0])):
        if len(ms) < floor:
            rej['fewer_than_%d_admitted_landmarks_of_this_class_in_this_%s'
                % (floor, {'area': 'area', 'near': 'city_radius'}.get(axis, axis))] += 1
            continue
        if axis in ('up1', 'up2'):
            node = chain.get(pid) or {}
            if (node.get('cls') or '').lower() in TOO_COARSE:
                rej['the_ancestor_is_a_country_rather_than_a_place_a_list_belongs_to'] += 1
                continue
            if len(ms) > MAX_COARSE_MEMBERS:
                rej['more_than_%d_members_so_this_is_a_region_list_and_the_region_layer_'
                    'owns_it' % MAX_COARSE_MEMBERS] += 1
                continue
            if (lang, cls, slug(pname)) in taken:
                rej['the_region_or_outdoor_aggregation_already_lists_this_class_here'] += 1
                continue
        key = (lang, cls, tuple(sorted(m['qid'] for m in ms)))
        if key in seen_sets:
            rej['the_same_members_are_already_listed_on_the_%s_page' % seen_sets[key]] += 1
            continue
        seen_sets[key] = axis
        ms.sort(key=lambda m: (-(m.get('search_readership') or 0), m['entity_name']))
        head = ms[0]
        cls_words = cls.replace('_', ' ')
        where = {'area': 'inside %s' % pname,
                 'near': 'within %dkm of %s' % (int(NEAR_KM), pname)}.get(
                     axis, 'inside %s, the administrative area %s above them'
                           % (pname, 'one level' if axis == 'up1' else 'two levels'))
        years = sorted(int(y) for y in
                       (YEAR.search(f).group(1) for m in ms for f in m['facts']
                        if YEAR.search(f)))
        with_site = sum(1 for m in ms if 'an official website' in m['facts'])
        facts = ['%d of them with a page here' % len(ms),
                 '%d facts Wikidata states across them'
                 % sum(len(m['facts']) for m in ms)]
        if len(years) >= 2 and years[0] != years[-1]:
            facts.append('the dates on this list run from %d to %d' % (years[0], years[-1]))
        if with_site:
            facts.append('%d with an official website' % with_site)
        reason = ('%d %ss %s, each one a page in this inventory in its own right: every '
                  'member clears the measured readership floor for %s and carries at least '
                  'two facts Wikidata states about it. %s. The list is this inventory\'s '
                  'own, so its dates describe the entities on it and make no claim about '
                  '%s as a whole.'
                  % (len(ms), cls_words, where, lang, '; '.join(facts), pname))
        rows.append({
            'individual_page_basis': ('%d admitted landmark pages of one class inside one '
                                      'administrative area' % len(ms)),
            'shape': 'landmark_area_list',
            'source': 'wikidata_landmark',
            'country': head['country'], 'market': head['market'], 'language': lang,
            'side': head['side'],
            'cls': cls, 'entity_id': '%s:%s:%s' % (axis, pid, cls),
            'entity_name': pname, 'axis': axis,
            'n': len(ms), 'enriched': sum(len(m['facts']) for m in ms),
            'url': '/%s/landmarks/%s/%s%s-%s/' % (
                lang, cls.replace('_', '-'),
                {'area': '', 'near': 'near-'}.get(axis, 'across-'),
                slug(pname), pid.lower()),
            'parent_id': pid, 'parent_name': pname,
            'parent_cls': ('settlement' if axis == 'near'
                           else (chain.get(pid) or {}).get('cls') or 'administrative area'),
            'city': head.get('city'), 'city_id': head.get('city_id'),
            'qid': None,
            'members': [m['entity_name'] for m in ms],
            'member_urls': [m['url'] for m in ms],
            'facts': facts,
            'attribution': 'wikidata_cc0',
            # The members ARE the page, so the signature is the member set. Two areas whose
            # lists hold the same entities would be one page, and nothing else about the
            # group distinguishes them.
            'data_signature': '|'.join(sorted(m['qid'] for m in ms)),
            'uniqueness_reason': reason,
            'no_superlative': True,
        })
        by_cls[cls] += 1
        by_lang[lang] += 1

    tmp = OUT + '.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + '\n')
    os.replace(tmp, OUT)
    json.dump({
        'built_on': '2026-10-18',
        'landmark_rows_read': n_in,
        'groups_of_language_class_and_area_or_city': len(groups),
        'city_radius_km': NEAR_KM,
        'coarse_axis_member_ceiling': MAX_COARSE_MEMBERS,
        'containment_items_in_the_chain': len(chain),
        'aggregation_keys_already_taken_by_an_older_layer': len(taken),
        'minimum_members': floor,
        'minimum_members_source': ('outdoor_region_feature, which this manifest already '
                                   'holds at three members or more'),
        'rejections': dict(rej.most_common()),
        'rows_emitted': len(rows),
        'members_covered': sum(r['n'] for r in rows),
        'by_axis': dict(collections.Counter(r['axis'] for r in rows)),
        'by_class': dict(by_cls.most_common(30)),
        'by_language': dict(by_lang.most_common()),
        'attribution': 'Wikidata CC0 1.0; Wikimedia clickstream CC0 1.0',
    }, open(FUNNEL, 'w'), indent=1, ensure_ascii=False)
    for k, v in rej.most_common():
        print('%-62s %8d' % (k, v), file=sys.stderr)
    print('rows emitted %d covering %d members'
          % (len(rows), sum(r['n'] for r in rows)), file=sys.stderr)


if __name__ == '__main__':
    main()

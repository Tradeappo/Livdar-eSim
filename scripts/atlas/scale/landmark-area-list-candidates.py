#!/usr/bin/env python3
"""An index page per class of landmark inside one administrative area.

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
OUT = ROOT + 'data/atlas/sources/wikidata/_landmark-area-candidates.jsonl.gz'
FUNNEL = ROOT + 'data/atlas/sources/wikidata/_landmark-area-funnel.json'
slug = entity_identity.slugify
MIN_MEMBERS = 3
YEAR = re.compile(r'(?:dating from|opened in) (\d{1,4})(?: BC)?$')


def main():
    args = sys.argv[1:]
    floor = (int(args[args.index('--min-members') + 1]) if '--min-members' in args
             else MIN_MEMBERS)
    groups = collections.defaultdict(list)
    n_in = 0
    for l in gzip.open(SRC, 'rt', encoding='utf-8'):
        d = json.loads(l)
        n_in += 1
        groups[(d['language'], d['cls'], d['parent_id'])].append(d)

    rej = collections.Counter()
    rows = []
    by_cls = collections.Counter()
    by_lang = collections.Counter()
    for (lang, cls, pid), ms in groups.items():
        if len(ms) < floor:
            rej['fewer_than_%d_admitted_landmarks_of_this_class_in_this_area' % floor] += 1
            continue
        ms.sort(key=lambda m: (-(m.get('search_readership') or 0), m['entity_name']))
        head = ms[0]
        pname = head['parent_name']
        cls_words = cls.replace('_', ' ')
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
        reason = ('%d %ss inside %s, each one a page in this inventory in its own right: '
                  'every member clears the measured readership floor for %s and carries at '
                  'least two facts Wikidata states about it. %s. The list is this '
                  'inventory\'s own, so its dates describe the entities on it and make no '
                  'claim about %s as a whole.'
                  % (len(ms), cls_words, pname, lang, '; '.join(facts), pname))
        rows.append({
            'individual_page_basis': ('%d admitted landmark pages of one class inside one '
                                      'administrative area' % len(ms)),
            'shape': 'landmark_area_list',
            'source': 'wikidata_landmark',
            'country': head['country'], 'market': head['market'], 'language': lang,
            'side': head['side'],
            'cls': cls, 'entity_id': '%s:%s' % (pid, cls), 'entity_name': pname,
            'n': len(ms), 'enriched': sum(len(m['facts']) for m in ms),
            'url': '/%s/landmarks/%s/%s-%s/' % (lang, cls.replace('_', '-'),
                                                slug(pname), pid.lower()),
            'parent_id': pid, 'parent_name': pname,
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
        'groups_of_language_class_and_area': len(groups),
        'minimum_members': floor,
        'minimum_members_source': ('outdoor_region_feature, which this manifest already '
                                   'holds at three members or more'),
        'rejections': dict(rej.most_common()),
        'rows_emitted': len(rows),
        'members_covered': sum(r['n'] for r in rows),
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

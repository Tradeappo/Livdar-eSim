#!/usr/bin/env python3
"""
How thin is an entity page, measured rather than asserted.

Every outdoor entity page records, in its own uniqueness_reason, how many measured attributes
the source gave it: "with 1 measured attributes (270m above sea level)". That sentence is the
page's whole factual content beyond its name, its containing polygon and a distance to the
nearest town. This file counts the distribution, counts how many of those pages share their
name with another page of the same family in the same market, and prices two candidate gates.

It decides nothing. It exists so the decision is taken against numbers.

Usage: measure-thin-entity-pages.py
Writes data/atlas/measurements/thin-entity-pages-2026-10-06.json
"""
import collections, csv, gzip, json, re

ROOT = '/home/user/Livdar-eSim/'
SRC = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
OUT = ROOT + 'data/atlas/measurements/thin-entity-pages-2026-10-06.json'
ATTRS = re.compile(r'with (\d+) measured attributes?')

rows = []
with gzip.open(SRC, 'rt', encoding='utf-8', newline='') as fh:
    for r in csv.DictReader(fh):
        m = ATTRS.search(r.get('uniqueness_reason') or '')
        rows.append((r['market'], r['family'], r['entity_name'],
                     int(m.group(1)) if m else None))

total = len(rows)
scored = [r for r in rows if r[3] is not None]
# A name is shared when two pages of the same family in the same market carry it. Their titles
# differ, because the containing polygon disambiguates them, but a reader comparing the two
# sees the same sentence with one number changed, which is the definition of a duplicate.
name_n = collections.Counter((r[0], r[1], r[2]) for r in scored)
by_attrs = collections.Counter(r[3] for r in scored)
one_attr = [r for r in scored if r[3] < 2]
one_attr_shared_name = [r for r in one_attr if name_n[(r[0], r[1], r[2])] > 1]

per_family = {}
for fam in sorted({r[1] for r in scored}):
    fr = [r for r in scored if r[1] == fam]
    one = [r for r in fr if r[3] < 2]
    per_family[fam] = {
        'pages': len(fr),
        'with_exactly_one_measured_attribute': len(one),
        'share_one_attribute': round(len(one) / len(fr), 3),
        'one_attribute_and_a_name_shared_with_another_page_in_the_same_market':
            sum(1 for r in one if name_n[(r[0], r[1], r[2])] > 1),
    }

worst = collections.Counter()
for (mkt, fam, name), n in name_n.items():
    if n > 1:
        worst[f'{name} ({fam}, {mkt})'] = n

json.dump({
    'generated': '2026-10-06',
    'question': 'how much of the inventory is one measured attribute wearing a page',
    'inventory_rows': total,
    'rows_that_record_an_attribute_count': len(scored),
    'attribute_count_distribution': {str(k): v for k, v in sorted(by_attrs.items())},
    'rows_with_exactly_one_measured_attribute': len(one_attr),
    'share_of_the_attribute_recording_rows': round(len(one_attr) / len(scored), 3),
    'rows_with_one_attribute_and_a_name_shared_in_the_same_market': len(one_attr_shared_name),
    'distinct_shared_names': sum(1 for v in name_n.values() if v > 1),
    'the_most_repeated_names': dict(worst.most_common(25)),
    'candidate_gates': {
        'an_entity_page_needs_two_or_more_measured_attributes': {
            'removes': len(one_attr),
            'leaves': total - len(one_attr),
            'cost': ('it removes a page about a real hill whose only published fact is its '
                     'height. That page is not false, it is thin, and it is the shape Google '
                     'treats as scaled content abuse when there are tens of thousands of it.'),
        },
        'one_attribute_is_enough_only_if_the_name_is_unique_in_its_market_and_family': {
            'removes': len(one_attr_shared_name),
            'leaves': total - len(one_attr_shared_name),
            'cost': ('it keeps the single peak called Aarnest and removes the fifty-four called '
                     'Round Top, which is the narrower reading: a lone thin page is thin, '
                     'fifty-four of them with one number changed is a template.'),
        },
    },
    'per_family': per_family,
    'what_this_does_not_say': (
        'nothing here says these entities are not real or that the attribute is wrong. The '
        'source is OpenStreetMap and the heights are measured. The question is whether one '
        'measured number plus a containing polygon plus a distance is a page, and that is a '
        'publication decision rather than a data decision, so this file does not take it.'),
}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('written', OUT)

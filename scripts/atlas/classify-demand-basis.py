#!/usr/bin/env python3
"""
Split the 1M manifest into DEMAND_PROVEN, UTILITY_PROVEN and AGGREGATION, from the
evidence each row actually carries.

    python3 scripts/atlas/classify-demand-basis.py [--json OUT]

THE TRAP THIS AVOIDS. `local_volume` and `market_demand_evidence` describe the
FAMILY x MARKET keyword cell, not the entity: every German weather row carried
`wetter rom` and its volume. Reading them as per-page demand claims a measurement
nobody made (cohort 003 hit exactly this on 2026-10-20). So a row is DEMAND_PROVEN
only on evidence that names THIS entity:

  - entity_demand_evidence is set (search-referred readers of the entity's own
    Wikipedia article, Wikimedia clickstream, CC0), or
  - its uniqueness_reason says it was "Admitted on demand" / "on the register and on
    demand" (the landmark and heritage contracts record the readership there), or
  - its measured keyword contains the entity's own name and has volume > 0.

Otherwise the subject decides: a page about ONE thing is UTILITY_PROVEN (it rests on
source facts, with the family's query pattern measured in its market); a page about
a SET or a PAIR (a category list, a cuisine list, a city pair) is AGGREGATION, admitted
on its member count and the family's measured pattern, never on per-page volume.

Note `status` = POI_AGGREGATION is NOT used: it is the adapter label for every row
that entered through the aggregation path, single-entity Wikidata pages included.
"""
import csv, gzip, json, os, re, sys, unicodedata, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) + '/'
D = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.parts/'
csv.field_size_limit(1 << 30)

SET_OR_PAIR = {
    'area_category', 'city_category', 'area_cuisine', 'city_cuisine', 'landmark_area',
    'area_opening', 'city_opening', 'area_attribute', 'city_attribute', 'city_pair_transit',
    'city_pair_rail', 'city_pair', 'airport_city_pair', 'region', 'outdoor_region',
    'areas_index', 'visa_cell', 'city-pair', 'country-pair', 'city_sport',
    'subdivision_year', 'school_subdivision_year', 'country_year',
}
CJK = re.compile(r'[぀-ヿ㐀-鿿]')


def fold(s):
    s = (s or '').lower()
    if not CJK.search(s):
        s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9぀-ヿ㐀-鿿]+', ' ', s).strip()


def classify(r):
    u = r.get('uniqueness_reason') or ''
    if r.get('entity_demand_evidence') or re.search(r'Admitted on (demand|the register and on demand)', u):
        return 'DEMAND_PROVEN'
    try:
        vol = float(r.get('local_volume') or 0)
    except ValueError:
        vol = 0
    kw, nm = fold(r.get('primary_keyword_if_known')), fold((r.get('entity_name') or '').split(',')[0])
    if vol > 0 and len(nm) >= 3 and nm in kw:
        return 'DEMAND_PROVEN'
    return 'AGGREGATION' if r.get('entity_type') in SET_OR_PAIR else 'UTILITY_PROVEN'


def main():
    c = collections.Counter()
    by_type = collections.defaultdict(collections.Counter)
    by_surface = collections.defaultdict(collections.Counter)
    for p in json.load(open(D + '_parts-index.json'))['parts']:
        with gzip.open(D + p['part'], 'rt', encoding='utf-8') as f:
            for r in csv.DictReader(f):
                k = classify(r)
                c[k] += 1
                by_type[k][r['entity_type']] += 1
                by_surface[k][r['surface']] += 1
    out = {
        'total': sum(c.values()),
        'classes': dict(c),
        'by_entity_type': {k: dict(v.most_common()) for k, v in by_type.items()},
        'by_surface': {k: dict(v.most_common()) for k, v in by_surface.items()},
        'rule': __doc__.split('THE TRAP THIS AVOIDS.')[1].strip(),
    }
    print(json.dumps({'total': out['total'], 'classes': out['classes']}, indent=1))
    if '--json' in sys.argv:
        json.dump(out, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main()

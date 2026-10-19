#!/usr/bin/env python3
"""Index the tail classes that are administrative containers, for the area contract.

THE CLASS-LEVEL TEST CANNOT CARRY THIS ON ITS OWN, and measuring it twice is what showed
that. Tested against the three NUMBERED roots - first, second and third-level administrative
country subdivision - only 48 of 2,460 tail classes answer, 2,275 readable items, because
Wikidata models a canton of France under "administrative division of France" and not under
the numbered levels at all. Tested against those three plus the generic administrative
territorial entity root, 1,227 answer and the set fills up with airbases, barracks,
observation towers, priories and Japanese castles, which reach that root through the subclass
graph. Neither number is the set of containers.

SO THE CONTAINER TEST IS THE ONE THE AREA CONTRACT ALREADY MAKES. P131 is "located in the
administrative territorial entity", so an item that five pages this inventory builds name as
their P131 within two levels IS an administrative container, by Wikidata's own usage of the
property rather than by its subclass graph. That test is measured per ITEM in
area-candidates.py and it is strictly stronger than any class-level walk: an airbase is
nobody's P131, so the leak costs nothing but a rejection line.

WHICH IS WHY NOTHING IS MOVED. The classes stay in landmark/, so every one of these items is
still offered to the landmark contract first and keeps the page it earns there. The area
contract then runs a SECOND time over the same directory, sees only the items the landmark
and settlement passes did not page, and admits one only on all three of its own tests. A
file moved out of landmark/ would have taken 303,524 readable items out of the contract most
of them belong to, to offer them a contract almost none of them can pass.

Usage: wikidata-admin-tail-route.py [--include-generic-root]
Reads  data/atlas/sources/wikidata/landmark/_class-tail-levels.json
       data/atlas/sources/wikidata/landmark/<class>.jsonl.gz
Writes data/atlas/sources/wikidata/landmark/_area-class-qids.json   {item: [class, ...]}
       data/atlas/sources/wikidata/landmark/_area-class-test.json   the admissible classes
       data/atlas/sources/wikidata/landmark/_area-class-labels.json {class: English label}
       data/atlas/sources/wikidata/landmark/_area-routing.json
"""
import collections, gzip, importlib.util, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
_spec = importlib.util.spec_from_file_location(
    'tail_capture', ROOT + 'scripts/atlas/ingest/wikidata-class-tail-capture.py')
TC = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(TC)

SRC = ROOT + 'data/atlas/sources/wikidata/landmark/'
LEVELS = SRC + '_class-tail-levels.json'
CENSUS = SRC + '_class-tail-census.json'


def main():
    # The generic root is included by default, because the per-item P131 test above is what
    # refuses a non-container and it is stronger than the class walk. --include-generic-root
    # is kept as the explicit name of that decision; passing nothing means the same thing.
    lv = json.load(open(LEVELS, encoding='utf-8'))
    cen = {c['qid']: c for c in json.load(open(CENSUS, encoding='utf-8'))['classes']}
    levelled = set(lv['administrative_classes'])
    generic = set(lv.get('generic_root_only') or ())

    take, settlements, vacuous, absent = [], [], [], []
    for q in sorted(levelled | generic):
        c = cen.get(q) or {}
        lab = c.get('label') or ''
        if not lab or TC.VACUOUS.search(lab):
            vacuous.append(lab)
            continue
        # A class whose label names a settlement answers to the settlement contract, which
        # is the stricter one for it: a French commune is both a settlement and a
        # second-level subdivision, and the risk on a commune page is the templated
        # population sentence rather than an empty container.
        if TC.SETTLE.search(lab):
            settlements.append(lab)
            continue
        sl = TC.slug_of(lab)
        if not os.path.exists(SRC + sl + '.jsonl.gz'):
            absent.append(lab)
            continue
        take.append((q, sl, lab))

    class_of, labels, rows = collections.defaultdict(list), {}, 0
    for q, sl, lab in take:
        labels[q] = lab
        for line in gzip.open(SRC + sl + '.jsonl.gz', 'rt', encoding='utf-8'):
            line = line.strip()
            if not line:
                continue
            rows += 1
            class_of[json.loads(line)['qid']].append(q)
    json.dump({k: sorted(set(v)) for k, v in class_of.items()},
              open(SRC + '_area-class-qids.json', 'w'))
    json.dump({'admin_classes': sorted(labels),
               'source': 'wikidata-class-level-test.py + wikidata-admin-tail-route.py',
               'test': 'P279* to a first, second or third-level administrative country '
                       'subdivision OR to the generic administrative territorial entity; '
                       'the generic root is leaky and the per-item P131 children test in '
                       'area-candidates.py is what refuses a non-container',
               'classes_at_a_named_level': len(levelled),
               'classes_at_the_generic_root_only': len(generic)},
              open(SRC + '_area-class-test.json', 'w'), indent=1)
    json.dump(labels, open(SRC + '_area-class-labels.json', 'w'), indent=1,
              ensure_ascii=False)
    json.dump({'built_on': time.strftime('%Y-%m-%d'),
               'classes_offered_to_the_area_contract': len(take),
               'rows_in_them': rows, 'distinct_items': len(class_of),
               'classes_left_to_the_settlement_contract': sorted(settlements),
               'classes_refused_as_vacuous': sorted(vacuous),
               'classes_not_captured_so_nothing_to_index': sorted(absent)},
              open(SRC + '_area-routing.json', 'w'), indent=1, ensure_ascii=False)
    print('%d classes offered to the area contract, %d rows, %d distinct items'
          % (len(take), rows, len(class_of)))
    print('%d left to the settlement contract, %d refused as vacuous, %d not captured'
          % (len(settlements), len(vacuous), len(absent)))


if __name__ == '__main__':
    main()

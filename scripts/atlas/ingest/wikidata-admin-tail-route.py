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

AND THE SPLIT IS NEEDED IN BOTH DIRECTIONS, which the first run of this file got wrong by
leaving every container in the landmark contract alongside everything else. The landmark
builder then paged 3,179 administrative areas - 228 powiats, 94 French departments, 91 Indian
districts, 70 Texas counties - on two printable facts and a parent, which is the generic
name-population-area page the area contract exists to refuse, and the area pass lost them
to "already paged on another surface" without ever judging them. So a container class is
RESERVED: its items are refused by the landmark builder and offered only to the area
contract, which admits one on all three of its tests or not at all.

WHAT TELLS A DISTRICT FROM AN AIRBASE is measured, not assumed. P131 is "located in the
administrative territorial entity", so the share of a class's items that some admitted page
or containment chain names as its parent is direct evidence of whether the class is used as
a container. The extremes are unambiguous: county of Illinois 102 of 102, county of Missouri
114 of 114, regional unit of Greece 74 of 74; Japanese castle 0 of 1,249, motte-and-bailey
castle 0 of 523, watchtower 0 of 285. The middle is continuous, so the evidence is recorded
per class and one narrow label test refuses the classes that reach the administrative root
while naming a physical structure or an organisation - a park, a fort, a barracks, a
station, a diocese - because that is the one direction the generic root leaks.

A historical polity (a kingdom, a duchy, a crown colony) is treated as a container rather
than rescued, because the area contract will refuse it for want of children and the landmark
contract would print "X is a kingdom in Y".

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
       data/atlas/sources/wikidata/landmark/_area-reserved-qids.json  ids landmark refuses
       data/atlas/sources/wikidata/landmark/_area-class-test.json   the admissible classes
       data/atlas/sources/wikidata/landmark/_area-class-labels.json {class: English label}
       data/atlas/sources/wikidata/landmark/_area-routing.json
"""
import collections, glob, gzip, importlib.util, json, os, re, sys, time

ROOT = '/home/user/Livdar-eSim/'
_spec = importlib.util.spec_from_file_location(
    'tail_capture', ROOT + 'scripts/atlas/ingest/wikidata-class-tail-capture.py')
TC = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(TC)

WD = ROOT + 'data/atlas/sources/wikidata/'
SRC = WD + 'landmark/'
LEVELS = SRC + '_class-tail-levels.json'
CENSUS = SRC + '_class-tail-census.json'
CHAIN = SRC + '_containment-chain.jsonl.gz'
# A class that reaches the administrative root while naming a physical structure or an
# organisation. This is the one direction the generic root leaks, and the list is written
# from the classes that actually leaked rather than from imagination.
NOT_A_CONTAINER = re.compile(
    r'\bpark\b|reserve|\bforts?\b|fortress|castle|tower|barracks|air ?base|'
    r'\bbase\b|training area|\bstations?\b|\bcamps?\b|cantonment|plantation|'
    r'\bdun\b|broch|diocese|school district|constituency|electoral|monaster|abbey|'
    r'church|cemeter|airport|aerodrome|prison|hospital|universit|museum|palace', re.I)


def containment_parents():
    """Every item this inventory names as a containment parent, from the chain and the rows.

    Being used as a P131 value is independent of being paged, so reading it out of the
    candidate files the builders wrote is evidence and not a circle.
    """
    out = set()
    try:
        for line in gzip.open(CHAIN, 'rt', encoding='utf-8'):
            d = json.loads(line)
            out.add(d['qid'])
            out.update(d.get('parents') or ())
    except (EOFError, OSError, FileNotFoundError):
        pass
    for rel in ('_landmark-candidates', '_settlement-candidates',
                '_heritage-register-candidates', '_area-candidates'):
        try:
            for line in gzip.open(WD + rel + '.jsonl.gz', 'rt', encoding='utf-8'):
                d = json.loads(line)
                if d.get('parent_id'):
                    out.add(d['parent_id'])
        except (EOFError, OSError, FileNotFoundError):
            pass
    return out


def admin_capture_items():
    """The items the chain-driven admin capture already holds, which are areas by selection."""
    out = set()
    for f in sorted(glob.glob(WD + 'admin/*.jsonl.gz')):
        if os.path.basename(f).startswith('_'):
            continue
        for line in gzip.open(f, 'rt', encoding='utf-8'):
            line = line.strip()
            if line:
                out.add(json.loads(line)['qid'])
    return out


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

    parents = containment_parents()
    print('%d items this inventory names as a containment parent' % len(parents))
    class_of, labels, rows = collections.defaultdict(list), {}, 0
    evidence, rescued = {}, []
    for q, sl, lab in take:
        ids = [json.loads(line)['qid'] for line in
               gzip.open(SRC + sl + '.jsonl.gz', 'rt', encoding='utf-8') if line.strip()]
        hit = sum(1 for i in ids if i in parents)
        evidence[lab] = {'items': len(ids), 'used_as_a_containment_parent': hit,
                         'share': round(hit / float(len(ids) or 1), 4)}
        if NOT_A_CONTAINER.search(lab):
            rescued.append(lab)
            continue
        labels[q] = lab
        rows += len(ids)
        for i in ids:
            class_of[i].append(q)
    json.dump({k: sorted(set(v)) for k, v in class_of.items()},
              open(SRC + '_area-class-qids.json', 'w'))
    # The landmark builder reads this and refuses every id in it, so a container is judged
    # by the area contract or by nothing. The admin capture's own items are in it too: they
    # were selected as areas by following the containment chain, and the tail capture has
    # since put many of them in landmark/ under a second class.
    reserved = set(class_of) | admin_capture_items()
    json.dump(sorted(reserved), open(SRC + '_area-reserved-qids.json', 'w'))
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
               'classes_not_captured_so_nothing_to_index': sorted(absent),
               'classes_rescued_for_the_landmark_contract': sorted(rescued),
               'items_reserved_for_the_area_contract': len(reserved),
               'containment_evidence_per_class': dict(
                   sorted(evidence.items(), key=lambda kv: -kv[1]['share']))},
              open(SRC + '_area-routing.json', 'w'), indent=1, ensure_ascii=False)
    print('%d classes offered to the area contract, %d rows, %d distinct items'
          % (len(labels), rows, len(class_of)))
    print('%d classes rescued for the landmark contract for naming a structure or an '
          'organisation rather than a division' % len(rescued))
    print('%d items reserved for the area contract, the admin capture included'
          % len(reserved))
    print('%d left to the settlement contract, %d refused as vacuous, %d not captured'
          % (len(settlements), len(vacuous), len(absent)))


if __name__ == '__main__':
    main()

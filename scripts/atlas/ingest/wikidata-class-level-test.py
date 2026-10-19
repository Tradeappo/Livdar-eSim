#!/usr/bin/env python3
"""Which of the tail census classes are administrative subdivisions, tested structurally.

WHY THIS IS A SEPARATE PASS. The census flagged a class as administrative only if it came
from the containment chain and was NOT in the ranked candidate list, which is an artefact of
how the two lists were combined rather than a property of the class: of 2,460 tail classes
exactly 2 carried the flag, while the list plainly contains cantons of France, municipalities
of Slovakia and communes of Romania. Routing those by the flag would send a canton to the
landmark contract, and a canton judged as a landmark is the generic administrative page this
inventory refuses to build.

So every tail class is tested here, by the same reverse-VALUES shape the census used for the
chain classes - `VALUES ?c {...}` and a UNION of `?c wdt:P279* wd:<level root>` - because the
forward shape (`?c wdt:P279* wd:Q13220204 . ?x wdt:P31 ?c`) times out at every endpoint.

Usage: wikidata-class-level-test.py [--batch 100]
Reads  data/atlas/sources/wikidata/landmark/_class-tail-census.json
Writes data/atlas/sources/wikidata/landmark/_class-tail-levels.json
"""
import collections, json, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/ingest')
import wd_sparql as W                                                     # noqa: E402

CENSUS = ROOT + 'data/atlas/sources/wikidata/landmark/_class-tail-census.json'
OUT = ROOT + 'data/atlas/sources/wikidata/landmark/_class-tail-levels.json'
LEVEL_ROOTS = ['Q10864048', 'Q13220204', 'Q13221722', 'Q56061']


def main():
    args = sys.argv[1:]
    batch = int(args[args.index('--batch') + 1]) if '--batch' in args else 100
    census = args[args.index('--census') + 1] if '--census' in args else CENSUS
    out = args[args.index('--out') + 1] if '--out' in args else OUT
    doc = json.load(open(census, encoding='utf-8'))
    ids = [d['qid'] for d in doc['classes']]
    # PER ROOT, NOT A UNION, because the union answers a question too coarse to route on.
    # Tested as one set, 1,227 of 2,460 tail classes came back "administrative", among them
    # airbase, barracks, observation tower, priory and Japanese castle. They reach
    # Q56061 administrative territorial entity through Wikidata's subclass graph, which is
    # leaky in exactly this direction, and routing an airbase to the administrative-area
    # contract would judge it on how many pages stand inside it. The three LEVEL roots are
    # specific - first, second and third-level administrative country subdivision - so a
    # class that reaches one of those is a container of places by construction, and the
    # generic root is recorded separately rather than trusted.
    found, failed, t0 = collections.defaultdict(set), [], time.time()
    for i in range(0, len(ids), batch):
        chunk = ids[i:i + batch]
        rows = W.ask(W.PREFIXES + 'SELECT DISTINCT ?c ?r WHERE { VALUES ?c { %s } '
                                  'VALUES ?r { %s } ?c wdt:P279* ?r }'
                     % (' '.join('wd:%s' % c for c in chunk),
                        ' '.join('wd:%s' % r for r in LEVEL_ROOTS)),
                     timeout=600, attempts=3)
        if rows is None:
            failed += chunk
            print('  batch %d-%d failed every attempt' % (i, i + len(chunk)), flush=True)
            continue
        for r in rows:
            c, rt = W.entity_of(r['c']['value']), W.entity_of(r['r']['value'])
            if c and rt:
                found[rt].add(c)
        print('  %d/%d tested, %d at a named level, %.0fs'
              % (i + len(chunk), len(ids), len(set.union(*found.values()) if found else set()),
                 time.time() - t0), flush=True)
    lab = {d['qid']: d['label'] for d in doc['classes']}
    readable = {d['qid']: d['readable'] for d in doc['classes']}
    # The three numbered levels are what admin-tail routing uses; Q56061 is reported beside
    # them so the size of the leak is on the record rather than inferred.
    levelled = set().union(*[found[r] for r in LEVEL_ROOTS[:3]]) if found else set()
    generic = found.get('Q56061', set()) - levelled
    json.dump({'built_on': time.strftime('%Y-%m-%d'),
               'level_roots': LEVEL_ROOTS,
               'classes_tested': len(ids),
               'classes_that_did_not_answer': failed,
               'per_root': {r: sorted(found.get(r, ())) for r in LEVEL_ROOTS},
               'administrative_classes': sorted(levelled),
               'administrative_readable_items': sum(readable.get(c, 0) for c in levelled),
               'generic_root_only': sorted(generic),
               'generic_root_only_readable_items': sum(readable.get(c, 0) for c in generic),
               'labels': {c: lab.get(c) for c in sorted(levelled | generic)}},
              open(out, 'w'), indent=1, ensure_ascii=False)
    print('%d of %d tail classes sit at a named administrative level, %d readable items'
          % (len(levelled), len(ids), sum(readable.get(c, 0) for c in levelled)))
    print('%d more reach only the generic administrative root and are NOT routed as areas, '
          '%d readable items' % (len(generic), sum(readable.get(c, 0) for c in generic)))


if __name__ == '__main__':
    main()

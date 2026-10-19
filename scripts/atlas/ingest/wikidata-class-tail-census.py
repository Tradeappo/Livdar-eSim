#!/usr/bin/env python3
"""The tail of the class census, counted in batches instead of one class at a time.

WHY A SECOND CENSUS. The first one ranked the classes under two geographic roots, took the
top 400 of each, and counted the readable items of the 200 largest that the landmark capture
did not already read. Everything below that was never measured, and "small classes are
useless" was an assumption rather than a finding: four hundred classes of three hundred
readable items each is a hundred and twenty thousand items, which is the size of the gap.

TWO CHANGES MAKE THE TAIL AFFORDABLE.

First, the candidate ranking goes deeper and wider: 1,500 per root instead of 400, and the
roots now include the administrative subdivision levels, discovered by a method that does
not time out (see below).

Second, and this is the one that matters, the readable count is asked for a BATCH of classes
in one query rather than one class per query. The first census spent 1,998 seconds on 199
classes because each one was its own round trip. Grouping fifty classes into a VALUES clause
and a GROUP BY answers all fifty at once, and the per-class cost falls by more than an order
of magnitude. It works precisely because these classes are SMALL: the thing that made the
one-step census time out was a grouped aggregate over millions of items, and a grouped
aggregate over fifty classes of a few hundred items each is nothing like it.

THE ADMINISTRATIVE LEVELS ARE DISCOVERED FROM KNOWN CLASS IDS, not from a subclass tree.
`?c wdt:P279* wd:Q13220204 . ?x wdt:P31 ?c` timed out at every endpoint, twice, for the
second and third levels. The shape that works is the reverse: take the 2,350 class ids that
actually appear in the containment chain above this inventory's landmarks, and ASK which of
them are subclasses of the level roots, in VALUES batches of a hundred. That query answered
368 of 400 in one pass. It finds every level-2 and level-3 class that any landmark is
actually inside, which is the set this inventory can use.

Usage: wikidata-class-tail-census.py [--per-root 1500] [--batch 50] [--floor 25]
Writes data/atlas/sources/wikidata/landmark/_class-tail-census.json
"""
import collections, glob, gzip, importlib.util, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/ingest')
import wd_sparql as W                                                     # noqa: E402

OUT = ROOT + 'data/atlas/sources/wikidata/landmark/_class-tail-census.json'
CHAIN = ROOT + 'data/atlas/sources/wikidata/landmark/_containment-chain.jsonl.gz'
CLASSQ = ROOT + 'data/atlas/sources/wikidata/admin/_class-qids.json'

ROOTS = [('Q2221906', 'geographic location'), ('Q811979', 'architectural structure'),
         ('Q10864048', 'first-level administrative country subdivision'),
         ('Q56061', 'administrative territorial entity')]
LEVEL_ROOTS = ['Q10864048', 'Q13220204', 'Q13221722', 'Q56061']


def captured_already():
    """Every class id the three captures in this repository already read."""
    out = set()
    for rel in ('scripts/atlas/ingest/wikidata-landmark-capture.py',
                'scripts/atlas/ingest/wikidata-settlement-capture.py'):
        src = open(ROOT + rel, encoding='utf-8').read()
        body = src[src.index('CLASSES = ['):]
        body = body[:body.index('\n]') + 2]
        ns = {}
        exec(body, ns)                                                    # noqa: S102
        out |= {q for q, _s, _l, _n in ns['CLASSES']}
    return out


def rank_roots(per_root):
    """Classes under each root, by how many items with coordinates state them."""
    out = {}
    for root, name in ROOTS:
        rows = W.ask(W.PREFIXES + """SELECT ?c (COUNT(?x) AS ?n) WHERE {
  ?c wdt:P279* wd:%s .
  ?x wdt:P31 ?c ; wdt:P625 ?coord .
}
GROUP BY ?c
ORDER BY DESC(?n)
LIMIT %d""" % (root, per_root), timeout=900, attempts=3)
        if rows is None:
            print('  %s: no answer' % name, flush=True)
            continue
        for r in rows:
            c = W.entity_of(r['c']['value'])
            if c:
                out[c] = max(out.get(c, 0), int(r['n']['value']))
        print('  %s: %d classes' % (name, len(rows)), flush=True)
    return out


def chain_classes():
    """Class ids that appear above this inventory's landmarks, from the containment chain."""
    if not os.path.exists(CLASSQ):
        return []
    per = json.load(open(CLASSQ))
    return sorted({c for v in per.values() for c in v})


def level_classes(cands, batch):
    """Which of these class ids are administrative subdivisions of any level.

    The reverse of the query that timed out: it asks about a KNOWN set of class ids instead
    of walking a subclass tree downward over millions of instances.
    """
    found = set()
    union = ' UNION '.join('{ ?c wdt:P279* wd:%s }' % r for r in LEVEL_ROOTS)
    for i in range(0, len(cands), batch):
        chunk = cands[i:i + batch]
        rows = W.ask(W.PREFIXES + 'SELECT DISTINCT ?c WHERE { VALUES ?c { %s } %s }'
                     % (' '.join('wd:%s' % c for c in chunk), union),
                     timeout=300, attempts=3)
        if rows is None:
            continue
        for r in rows:
            c = W.entity_of(r['c']['value'])
            if c:
                found.add(c)
    return found


def readable_batch(classes, batch):
    """{class: items with coordinates AND an article in a measurable edition}, batched."""
    got, failed = {}, []
    t0 = time.time()
    for i in range(0, len(classes), batch):
        chunk = classes[i:i + batch]
        rows = W.ask(W.PREFIXES + """SELECT ?c (COUNT(DISTINCT ?x) AS ?n) WHERE {
  VALUES ?c { %s }
  ?x wdt:P31 ?c ; wdt:P625 ?coord .
  ?site schema:about ?x .
  FILTER(%s)
}
GROUP BY ?c""" % (' '.join('wd:%s' % c for c in chunk), W.SITE_FILTER),
                     timeout=600, attempts=3)
        if rows is None:
            failed += chunk
            print('  batch %d-%d failed every attempt' % (i, i + len(chunk)), flush=True)
            continue
        for r in rows:
            c = W.entity_of(r['c']['value'])
            if c:
                got[c] = int(r['n']['value'])
        if (i // batch) % 10 == 0:
            print('  %d/%d classes, %.0fs' % (i + len(chunk), len(classes),
                                              time.time() - t0), flush=True)
    return got, failed


def labels_for(ids, batch=200):
    out = {}
    for i in range(0, len(ids), batch):
        chunk = ids[i:i + batch]
        rows = W.ask(W.PREFIXES + 'SELECT ?c ?l WHERE { VALUES ?c { %s } ?c rdfs:label ?l . '
                                  'FILTER(LANG(?l) = "en") }'
                     % ' '.join('wd:%s' % c for c in chunk), timeout=300) or []
        for r in rows:
            out[W.entity_of(r['c']['value'])] = r['l']['value']
    return out


def main():
    args = sys.argv[1:]
    per_root = int(args[args.index('--per-root') + 1]) if '--per-root' in args else 1500
    batch = int(args[args.index('--batch') + 1]) if '--batch' in args else 50
    floor = int(args[args.index('--floor') + 1]) if '--floor' in args else 25

    have = captured_already()
    print('%d class ids already captured' % len(have), flush=True)
    cands = rank_roots(per_root)
    chain = chain_classes()
    print('%d ranked candidates, %d class ids seen in the containment chain'
          % (len(cands), len(chain)), flush=True)
    levels = level_classes([c for c in chain if c not in cands], batch=100)
    print('%d chain classes are administrative subdivisions and were not in the ranking'
          % len(levels), flush=True)
    todo = sorted(set(list(cands) + list(levels)) - have)
    print('%d classes to count' % len(todo), flush=True)

    got, failed = readable_batch(todo, batch)
    labs = labels_for([c for c, n in got.items() if n >= floor])
    rows = [{'qid': c, 'label': labs.get(c), 'readable': n,
             'items_with_coordinates': cands.get(c),
             'is_administrative_subdivision': c in levels}
            for c, n in got.items() if n >= floor]
    rows.sort(key=lambda d: -d['readable'])
    json.dump({
        'built_on': time.strftime('%Y-%m-%d'),
        'per_root_limit': per_root, 'count_batch': batch, 'readable_floor': floor,
        'roots': [r[1] for r in ROOTS],
        'classes_already_captured': len(have),
        'classes_counted': len(got),
        'classes_that_did_not_answer': failed,
        'classes_at_or_above_the_floor': len(rows),
        'readable_items_in_them': sum(d['readable'] for d in rows),
        'administrative_subdivision_classes_found': len(levels),
        'classes': rows,
    }, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print('%d classes at or above %d readable, %d readable items in them'
          % (len(rows), floor, sum(d['readable'] for d in rows)))
    for d in rows[:40]:
        print('  %-12s %7d  %s%s' % (d['qid'], d['readable'], d['label'],
                                     '  [admin]' if d['is_administrative_subdivision'] else ''))


if __name__ == '__main__':
    main()

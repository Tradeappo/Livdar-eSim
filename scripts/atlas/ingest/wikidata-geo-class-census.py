#!/usr/bin/env python3
"""Which classes the readable geographic entities actually belong to, counted rather than recalled.

THE CLASS LIST IN wikidata-landmark-capture.py WAS WRITTEN FROM MEMORY AND IT SHOWS. Seven of
its sixty-six ids named something other than what the name beside them said, which a label
check now catches. The deeper problem that check does not catch is the opposite error: the
classes that were never listed at all. 626,746 items were captured under fifty-eight classes,
and nothing in that run says whether that is most of the readable geographic entities on
Wikidata or a fifth of them.

So this counts them. For each of the eleven Wikipedia editions whose clickstream this project
holds, it asks for the P31 values of the items that carry coordinates and an article in that
edition, with the count of each. The union across editions is the census, and subtracting the
fifty-eight already captured leaves exactly the list of classes a second capture pass would
be for, ordered by how many readable entities each one holds.

TWO STEPS, because the one-step form does not answer. Asking for the P31 distribution of
items that carry coordinates AND an article timed out at all three endpoints, both as one
query over the eleven editions and as eleven queries one edition each. Splitting it works:
step one ranks the classes under the geographic roots by how many items with coordinates
state them, which is a plain aggregate over the P31 index and answers 400 classes in under a
minute; step two puts the article condition back one class at a time, which is the cheap
query this project has already run fifty-eight times.

THIS SCRIPT DECIDES NOTHING. A class appearing here is a class that exists, not a class that
should have pages: Q4167410 is a disambiguation page and Q13406463 is a list article, and
both carry coordinates often enough to rank. The output is a measurement for a person to read.

Usage: wikidata-geo-class-census.py [--limit 400] [--count-top 200]
Writes data/atlas/sources/wikidata/landmark/_class-census.json
"""
import collections, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/ingest')
import wd_sparql as W                                                     # noqa: E402

OUT = ROOT + 'data/atlas/sources/wikidata/landmark/_class-census.json'
CAPTURE = ROOT + 'scripts/atlas/ingest/wikidata-landmark-capture.py'


def already_captured():
    """The class ids the landmark capture already reads, taken from that file's own list."""
    src = open(CAPTURE, encoding='utf-8').read()
    body = src[src.index('CLASSES = ['):]
    body = body[:body.index('\n]') + 2]
    ns = {}
    exec(body, ns)                                                        # noqa: S102
    return {q for q, _slug, _label, _n in ns['CLASSES']}


ROOTS = [('Q2221906', 'geographic location'), ('Q811979', 'architectural structure')]


def candidate_classes(limit):
    """The classes under the geographic roots, ranked by how many items with coordinates
    state them.

    NO SITELINK JOIN HERE, and that is the whole reason this formulation works. The first
    one asked for the P31 distribution of items that have coordinates AND an article in a
    given edition, one edition at a time, and timed out on every one of the eleven at all
    three endpoints. Dropping the article condition makes it a plain aggregate over the P31
    index and it answers 400 classes in under a minute. The article condition then comes
    back in the second step, one class at a time, where it is the cheap query this project
    has already run fifty-eight times.
    """
    out = {}
    for root, name in ROOTS:
        q = W.PREFIXES + """SELECT ?c (COUNT(?x) AS ?n) WHERE {
  ?c wdt:P279* wd:%s .
  ?x wdt:P31 ?c ; wdt:P625 ?coord .
}
GROUP BY ?c
ORDER BY DESC(?n)
LIMIT %d""" % (root, limit)
        rows = W.ask(q, timeout=600, attempts=3)
        if rows is None:
            print('  %s: no answer' % name, flush=True)
            continue
        for r in rows:
            c = W.qid_of(r['c']['value'])
            if c:
                out[c] = max(out.get(c, 0), int(r['n']['value']))
        print('  %s: %d classes' % (name, len(rows)), flush=True)
    return out


def readable_count(qid):
    """Items of this class with coordinates AND an article in one of the eleven editions."""
    rows = W.ask(W.PREFIXES + """SELECT (COUNT(DISTINCT ?x) AS ?n) WHERE {
  ?x wdt:P31 wd:%s .
  ?x wdt:P625 ?coord .
  ?site schema:about ?x .
  FILTER(%s)
}""" % (qid, W.SITE_FILTER), timeout=600, attempts=3)
    return int(rows[0]['n']['value']) if rows else None


def main():
    args = sys.argv[1:]
    limit = int(args[args.index('--limit') + 1]) if '--limit' in args else 400
    top = int(args[args.index('--count-top') + 1]) if '--count-top' in args else 200
    have = already_captured()
    cands = candidate_classes(limit)
    ranked = [(c, n) for c, n in sorted(cands.items(), key=lambda kv: -kv[1])
              if c not in have]
    print('%d candidate classes, %d of them not already captured; counting the top %d'
          % (len(cands), len(ranked), top), flush=True)

    labels = {}
    for i in range(0, min(len(ranked), top), 200):
        chunk = [c for c, _ in ranked[i:i + 200]]
        rows = W.ask(W.PREFIXES + 'SELECT ?c ?l WHERE { VALUES ?c { %s } ?c rdfs:label ?l . '
                                  'FILTER(LANG(?l) = "en") }'
                     % ' '.join('wd:%s' % c for c in chunk), timeout=300) or []
        for r in rows:
            labels[W.qid_of(r['c']['value'])] = r['l']['value']

    measured, unanswered = [], []
    t0 = time.time()
    for c, raw in ranked[:top]:
        n = readable_count(c)
        if n is None:
            unanswered.append(c)
            continue
        measured.append({'qid': c, 'label': labels.get(c), 'items_with_coordinates': raw,
                         'also_with_an_article_this_project_can_measure': n})
        print('  %-12s %8d of %9d  %s' % (c, n, raw, labels.get(c)), flush=True)
    measured.sort(key=lambda d: -d['also_with_an_article_this_project_can_measure'])
    out = {
        'built_on': time.strftime('%Y-%m-%d'),
        'what': 'classes under the geographic roots that the landmark capture does not read, '
                'with how many of their items carry coordinates and an article in one of the '
                'eleven editions whose clickstream this project holds',
        'roots': [r[1] for r in ROOTS],
        'candidate_classes_ranked': len(cands),
        'classes_already_captured': len(have),
        'classes_counted_here': len(measured),
        'classes_that_did_not_answer': unanswered,
        'readable_items_in_the_uncaptured_classes_counted': sum(
            d['also_with_an_article_this_project_can_measure'] for d in measured),
        'already_captured_for_comparison': 626746,
        'classes': measured,
        'what_this_does_not_say': 'that these should have pages. A class appearing here is a '
                                  'class that exists. Disambiguation pages and list articles '
                                  'carry coordinates and rank in any such list.',
    }
    json.dump(out, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print('counted %d classes in %.0fs; %d readable items in them against 626,746 captured'
          % (len(measured), time.time() - t0, out[
              'readable_items_in_the_uncaptured_classes_counted']))


if __name__ == '__main__':
    main()

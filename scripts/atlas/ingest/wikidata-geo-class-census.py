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

ONE EDITION AT A TIME, because the same aggregate over all eleven at once was asked for twice
and timed out at both Wikimedia hosts and on the mirror. The per-edition form is the same
question in eleven cheaper pieces, and an edition that fails is an edition missing from the
census rather than a census that failed.

THIS SCRIPT DECIDES NOTHING. A class appearing here is a class that exists, not a class that
should have pages: Q4167410 is a disambiguation page and Q13406463 is a list article, and
both carry coordinates often enough to rank. The output is a measurement for a person to read.

Usage: wikidata-geo-class-census.py [--limit 400]
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


def census_for(lang, limit):
    q = W.PREFIXES + """SELECT ?c (COUNT(DISTINCT ?x) AS ?n) WHERE {
  ?x wdt:P625 ?coord .
  ?site schema:about ?x .
  FILTER(STRSTARTS(STR(?site), "https://%s.wikipedia.org/wiki/"))
  ?x wdt:P31 ?c .
}
GROUP BY ?c
ORDER BY DESC(?n)
LIMIT %d""" % (lang, limit)
    rows = W.ask(q, timeout=900, attempts=4)
    if rows is None:
        return None
    return {W.qid_of(r['c']['value']): int(r['n']['value']) for r in rows
            if W.qid_of(r['c']['value'])}


def main():
    args = sys.argv[1:]
    limit = int(args[args.index('--limit') + 1]) if '--limit' in args else 400
    have = already_captured()
    total = collections.Counter()
    per_lang, missing = {}, []
    for lang in W.WIKIS:
        t0 = time.time()
        got = census_for(lang, limit)
        if got is None:
            missing.append(lang)
            print('  %s: no answer, left out of the census' % lang, flush=True)
            continue
        per_lang[lang] = len(got)
        for c, n in got.items():
            total[c] += n
        print('  %s: %d classes, %.0fs' % (lang, len(got), time.time() - t0), flush=True)
    new = [(c, n) for c, n in total.most_common() if c not in have]
    labels = {}
    for i in range(0, len(new), 200):
        chunk = [c for c, _ in new[i:i + 200]]
        rows = W.ask(W.PREFIXES + 'SELECT ?c ?l WHERE { VALUES ?c { %s } ?c rdfs:label ?l . '
                                  'FILTER(LANG(?l) = "en") }'
                     % ' '.join('wd:%s' % c for c in chunk), timeout=300) or []
        for r in rows:
            labels[W.qid_of(r['c']['value'])] = r['l']['value']
    out = {
        'built_on': time.strftime('%Y-%m-%d'),
        'what': 'P31 values of the items carrying coordinates and an article in each of the '
                'eleven editions, summed across editions. An item with articles in four '
                'editions is counted four times, so these are ARTICLE counts and not item '
                'counts, and they rank classes rather than size them.',
        'editions_counted': per_lang,
        'editions_with_no_answer': missing,
        'limit_per_edition': limit,
        'classes_already_captured': len(have),
        'classes_not_captured': len(new),
        'not_captured': [{'qid': c, 'label': labels.get(c), 'article_count': n}
                         for c, n in new],
    }
    json.dump(out, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print('%d classes beyond the %d already captured; top 40:' % (len(new), len(have)))
    for c, n in new[:40]:
        print('  %-12s %9d  %s' % (c, n, labels.get(c)))


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Every class the readable geographic entities belong to, with NO root restriction.

WHAT THE THREE EARLIER CENSUSES COULD NOT SEE. All of them rank classes under roots -
geographic location, architectural structure, the administrative subdivision levels - because
the root-free form timed out at every endpoint, as one query and as eleven. So every class
outside those roots has been invisible from the start, and plenty of readable places sit
outside them: a company's headquarters, a sports venue, a battlefield, a diocese, a
neighbourhood modelled as an organisation. Nothing measured says how much supply that is, and
"the roots cover it" is an assumption, not a finding.

THE PARTITION IS LATITUDE, which is the one thing in this repository that has made a
too-large Wikidata query answerable three times now. A grouped aggregate over every readable
item on Earth does not answer; the same aggregate over the items in a twelfth of the planet
does, and the union of twelve answers is the census. Each band also reports its DISTINCT
ITEM COUNT, so summing the bands gives the size of the whole readable-with-coordinates
universe - the ceiling of this instrument - against which everything captured so far can be
compared.

WHAT THIS DOES NOT SAY, same as the others: a class appearing here is a class that exists.
Disambiguation pages and list articles carry coordinates and will rank. The output is a
measurement for a person to read.

Usage: wikidata-readable-class-census.py [--bands 12] [--per-band 2000] [--floor 500]
Writes data/atlas/sources/wikidata/landmark/_readable-class-census.json
"""
import collections, glob, gzip, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/ingest')
import wd_sparql as W                                                     # noqa: E402

OUT = ROOT + 'data/atlas/sources/wikidata/landmark/_readable-class-census.json'
DIRS = ('landmark', 'settlement', 'admin', 'heritage-register')


def captured_classes():
    """The class ids every capture in this repository reads, from those files' own lists."""
    out = set()
    for rel in ('scripts/atlas/ingest/wikidata-landmark-capture.py',
                'scripts/atlas/ingest/wikidata-settlement-capture.py',
                'scripts/atlas/ingest/wikidata-heritage-register-capture.py'):
        src = open(ROOT + rel, encoding='utf-8').read()
        body = src[src.index('CLASSES = ['):]
        body = body[:body.index('\n]') + 2]
        ns = {}
        exec(body, ns)                                                    # noqa: S102
        out |= {q for q, _s, _l, _n in ns['CLASSES']}
    for rel in ('data/atlas/sources/wikidata/landmark/_class-tail-census.json',):
        try:
            doc = json.load(open(ROOT + rel, encoding='utf-8'))
            out |= {d['qid'] for d in doc['classes']}
        except (OSError, ValueError, KeyError):
            pass
    return out


def captured_items():
    """How many distinct items the captures on disk hold, for the comparison at the end."""
    seen = set()
    for d in DIRS:
        for f in sorted(glob.glob(ROOT + 'data/atlas/sources/wikidata/%s/*.jsonl.gz' % d)):
            if os.path.basename(f).startswith('_'):
                continue
            try:
                for line in gzip.open(f, 'rt', encoding='utf-8'):
                    line = line.strip()
                    if line:
                        seen.add(json.loads(line)['qid'])
            except (EOFError, OSError):
                pass
    return len(seen)


def band(lo, hi, per_band):
    rows = W.ask(W.PREFIXES + """SELECT ?c (COUNT(DISTINCT ?x) AS ?n) WHERE {
  ?x wdt:P31 ?c .
  ?x p:P625/psv:P625 [ wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon ] .
  FILTER(xsd:double(?lat) >= %s && xsd:double(?lat) < %s)
  ?site schema:about ?x .
  FILTER(%s)
}
GROUP BY ?c
ORDER BY DESC(?n)
LIMIT %d""" % (lo, hi, W.SITE_FILTER, per_band), timeout=900, attempts=3)
    return rows


def band_items(lo, hi):
    rows = W.ask(W.PREFIXES + """SELECT (COUNT(DISTINCT ?x) AS ?n) WHERE {
  ?x p:P625/psv:P625 [ wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon ] .
  FILTER(xsd:double(?lat) >= %s && xsd:double(?lat) < %s)
  ?site schema:about ?x .
  FILTER(%s)
}""" % (lo, hi, W.SITE_FILTER), timeout=900, attempts=3)
    return int(rows[0]['n']['value']) if rows else None


def labels_for(ids, batch=200):
    out = {}
    for i in range(0, len(ids), batch):
        rows = W.ask(W.PREFIXES + 'SELECT ?c ?l WHERE { VALUES ?c { %s } ?c rdfs:label ?l . '
                                  "FILTER(LANG(?l) = 'en') }"
                     % ' '.join('wd:%s' % c for c in ids[i:i + batch]), timeout=300) or []
        for r in rows:
            out[W.entity_of(r['c']['value'])] = r['l']['value']
    return out


def main():
    args = sys.argv[1:]
    nb = int(args[args.index('--bands') + 1]) if '--bands' in args else 12
    per = int(args[args.index('--per-band') + 1]) if '--per-band' in args else 2000
    floor = int(args[args.index('--floor') + 1]) if '--floor' in args else 500

    have = captured_classes()
    print('%d class ids already read by a capture or counted by the tail census' % len(have),
          flush=True)
    per_class = collections.Counter()
    items, failed, t0 = 0, [], time.time()
    step = 180.0 / nb
    for i in range(nb):
        lo, hi = -90.0 + i * step, -90.0 + (i + 1) * step
        rows = band(lo, hi, per)
        if rows is None:
            failed.append([lo, hi])
            print('  band [%s, %s) did not answer' % (lo, hi), flush=True)
            continue
        for r in rows:
            c = W.entity_of(r['c']['value'])
            if c:
                per_class[c] += int(r['n']['value'])
        n = band_items(lo, hi)
        items += n or 0
        print('  band [%6.1f, %6.1f)  %5d classes  %8s readable items  %5.0fs'
              % (lo, hi, len(rows), n, time.time() - t0), flush=True)
        # A band that returns exactly the cap has more classes than it reported, and the
        # tail of a band's class list is where an unexplored class would hide.
        if len(rows) >= per:
            print('    that band filled the %d-class limit, so its tail is unread' % per,
                  flush=True)

    new = [(c, n) for c, n in per_class.items() if c not in have and n >= floor]
    new.sort(key=lambda t: -t[1])
    labs = labels_for([c for c, _n in new])
    json.dump({'built_on': time.strftime('%Y-%m-%d'),
               'bands': nb, 'per_band_class_limit': per, 'floor': floor,
               'bands_that_did_not_answer': failed,
               'readable_items_with_coordinates_on_earth': items,
               'distinct_items_in_the_captures_on_disk': captured_items(),
               'classes_seen': len(per_class),
               'classes_already_known': len(have),
               'classes_new_at_or_above_the_floor': len(new),
               'readable_items_in_those_new_classes': sum(n for _c, n in new),
               'classes': [{'qid': c, 'label': labs.get(c), 'readable_sum_over_bands': n}
                           for c, n in new]},
              open(OUT, 'w'), indent=1, ensure_ascii=False)
    print('%d readable items with coordinates on Earth; %d classes new at or above %d, '
          'holding %d of them'
          % (items, len(new), floor, sum(n for _c, n in new)))
    for c, n in new[:50]:
        print('  %-12s %8d  %s' % (c, n, labs.get(c)))


if __name__ == '__main__':
    main()

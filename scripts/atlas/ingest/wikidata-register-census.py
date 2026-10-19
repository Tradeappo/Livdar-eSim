#!/usr/bin/env python3
"""Every heritage register Wikidata holds an identifier for, counted by readable supply.

WHY A CENSUS OF REGISTERS AND NOT OF CLASSES. The register layer is the one model measured
here whose conversion rate is known and high: 51,248 entries carried coordinates and a
measurable article across the Dutch, Polish and French registers, and 8,432 pages survived
every gate, 16 per cent, against 13 per cent for the landmark classes. And a register selects
differently from a class: an item is in the Rijksmonument register because it STATES a
Rijksmonument ID, so the register reaches the listed farmhouse, the wayside cross and the
canal house whose Wikidata class no class list names. Three registers were chosen by hand
from four countries this project happened to know about. This asks the question properly:
which of Wikidata's thirteen thousand properties is a heritage register identifier, and how
many readable items state each one.

THE SHAPE IS THE CENSUS'S, with the predicate as the variable. `VALUES ?p { wdt:P649 ... }`
and `?x ?p ?id` counts a batch of registers in one query the same way the class census
counted a batch of classes, and for the same reason: one round trip per register would cost
hours and answer nothing a batch cannot.

THE CANDIDATE LIST IS READ, NOT WRITTEN. Hard-coding a list of register properties is how
the landmark capture ended up with seven class ids naming something else. So every property
label is fetched and filtered on words that name a register of places, and the filter is
deliberately loose: a property that turns out to be a charity register or an author index
counts a handful of readable items and ranks itself out, which costs one row in the output.

Usage: wikidata-register-census.py [--batch 12] [--floor 500]
Writes data/atlas/sources/wikidata/heritage-register/_register-census.json
"""
import json, os, re, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/ingest')
import wd_sparql as W                                                     # noqa: E402

OUT = ROOT + 'data/atlas/sources/wikidata/heritage-register/_register-census.json'
# Words that name a register OF PLACES. 'historic' and 'inventory' pull in author indexes and
# newspaper archives, which is why the floor below is what decides, not this.
WORDS = re.compile(r'heritage|monument|listed building|protected|landmark|conservation|'
                   r'historic|denkmal|patrimoni|patrimoine|cultural propert|rijksmonument|'
                   r'NRHP|national register|cultural site|immovable|archaeolog', re.I)
# Already built, so they are counted for the record and not re-listed as new supply.
BUILT = {'P380': 'fr_merimee', 'P3424': 'pl_nid', 'P359': 'nl_rijksmonument',
         'P1216': 'gb_england_nhle'}


def candidates():
    rows = W.ask(W.PREFIXES + 'SELECT ?p ?l WHERE { ?p a wikibase:Property ; rdfs:label ?l . '
                              "FILTER(LANG(?l) = 'en') }", timeout=900)
    if rows is None:
        raise RuntimeError('no property list, so no register can be named')
    out = {}
    for r in rows:
        p = W.entity_of(r['p']['value'])
        lab = r['l']['value']
        if p and p.startswith('P') and WORDS.search(lab):
            out[p] = lab
    print('%d properties, %d whose label names a register of places' % (len(rows), len(out)),
          flush=True)
    return out


def counts(props, batch):
    got, failed, t0 = {}, [], time.time()
    ids = sorted(props)
    for i in range(0, len(ids), batch):
        chunk = ids[i:i + batch]
        rows = W.ask(W.PREFIXES + """SELECT ?p (COUNT(DISTINCT ?x) AS ?n) WHERE {
  VALUES ?p { %s }
  ?x ?p ?id .
  ?x wdt:P625 ?coord .
  ?site schema:about ?x .
  FILTER(%s)
}
GROUP BY ?p""" % (' '.join('wdt:%s' % p for p in chunk), W.SITE_FILTER),
                     timeout=900, attempts=3)
        if rows is None:
            failed += chunk
            print('  batch %d-%d failed every attempt' % (i, i + len(chunk)), flush=True)
            continue
        for r in rows:
            # property_of, not entity_of: ?p is bound in the predicate position and comes
            # back as .../prop/direct/P649, which entity_of refuses. It refused all 299 of
            # them on the first run and the census reported that no register holds five
            # hundred readable items.
            p = W.property_of(r['p']['value'])
            if p:
                got[p] = int(r['n']['value'])
        print('  %d/%d registers counted, %.0fs' % (i + len(chunk), len(ids),
                                                    time.time() - t0), flush=True)
    return got, failed


def main():
    args = sys.argv[1:]
    batch = int(args[args.index('--batch') + 1]) if '--batch' in args else 12
    floor = int(args[args.index('--floor') + 1]) if '--floor' in args else 500
    props = candidates()
    got, failed = counts(props, batch)
    rows = [{'property': p, 'label': props[p], 'readable_items': n,
             'already_built_as': BUILT.get(p)}
            for p, n in got.items() if n >= floor]
    rows.sort(key=lambda d: -d['readable_items'])
    new = [d for d in rows if not d['already_built_as']]
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({'built_on': time.strftime('%Y-%m-%d'),
               'floor': floor, 'count_batch': batch,
               'properties_considered': len(props),
               'properties_that_did_not_answer': failed,
               'registers_at_or_above_the_floor': len(rows),
               'registers_not_yet_built': len(new),
               'readable_items_not_yet_built': sum(d['readable_items'] for d in new),
               'registers': rows}, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print('%d registers hold %d or more readable items; %d are not yet built, '
          '%d readable items in them'
          % (len(rows), floor, len(new), sum(d['readable_items'] for d in new)))
    for d in rows[:40]:
        print('  %-8s %7d  %s%s' % (d['property'], d['readable_items'], d['label'],
                                    '  [built]' if d['already_built_as'] else ''))


if __name__ == '__main__':
    main()

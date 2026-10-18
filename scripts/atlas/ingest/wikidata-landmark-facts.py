#!/usr/bin/env python3
"""The facts a landmark page would print, fetched by id with their units stated.

WHAT A FACT HAS TO BE HERE. A number with no unit is not a fact a page can print: "15.0" is
not "15 m deep", and writing the second from the first asserts something Wikidata never said.
`wdt:` returns a quantity's amount and discards its unit, which is enough to COUNT a fact and
not enough to STATE one, so every dimensioned property below is read over `p:/psn:` instead,
which returns the SI-normalised amount together with the unit item it is in. The unit is then
checked against the one this file expects for that property, and a value stated in the wrong
unit is refused and counted rather than printed: Wikidata holds real statements that give a
river's discharge in cubic metres, and one of them reached a shipped row once.

Four kinds of property, read four ways, because they are four different things:

  DIMENSIONED   height, area, length, elevation, width, depth. p:/psn:, amount plus unit.
  COUNTED       floors, capacity, students, employees, beds, yearly visitors. These are
                dimensionless by definition, so wdt: is correct and there is no unit to check.
  DATED         inception, opening. wdt:, and only the year is ever printed: Wikidata stores a
                precision alongside a date and a page that prints "1 January 1850" for a value
                precise to the year has invented a day.
  ITEM-VALUED   architect, architectural style, operator, material, religion, heritage status,
                and P131, the administrative area the thing is inside. wdt: on an item-valued
                property returns an IRI, so asking for the id and printing it gives a reader
                "operator: Q1025341" - which 345 shipped rows once said. Every one of these is
                asked for BY LABEL, in the page language and in English, and the item id is
                kept beside the label so the claim can be checked.

P131 IS NOT A FACT, IT IS THE PARENT. It is fetched here because it is one more OPTIONAL on a
query that is already being made, and because it replaces the gate that costs this inventory
the most: the water layer refused 15,679 entities for sitting in a country with no OpenStreetMap
parent layer, and another 1,458 for falling inside no parent polygon. A containment parent that
Wikidata STATES is better evidence than one this project computes, and it exists for every
country rather than for thirty-four.

Usage: wikidata-landmark-facts.py --qids FILE --out PATH [--batch 200]
"""
import collections, gzip, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/ingest')
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import wd_sparql as W                                                     # noqa: E402
import entity_identity                                                    # noqa: E402

# property, key, the SI unit Wikidata normalises it to
DIMENSIONED = [('P2048', 'height', 'metre'), ('P2046', 'area', 'square metre'),
               ('P2043', 'length', 'metre'), ('P2044', 'elevation', 'metre'),
               ('P2049', 'width', 'metre'), ('P4511', 'vertical_depth', 'metre'),
               ('P2047', 'duration', 'second'), ('P2386', 'diameter', 'metre')]
COUNTED = [('P1101', 'floors'), ('P1083', 'capacity'), ('P2196', 'students'),
           ('P1128', 'employees'), ('P6801', 'beds'), ('P1174', 'visitors_per_year'),
           ('P1436', 'collection_size'), ('P1110', 'attendance')]
DATED = [('P571', 'inception'), ('P1619', 'opened')]
ITEM_VALUED = [('P84', 'architect'), ('P149', 'architectural_style'),
               ('P137', 'operator'), ('P186', 'material'), ('P140', 'religion'),
               ('P1435', 'heritage_status'), ('P131', 'located_in'), ('P17', 'country'),
               ('P138', 'named_after'), ('P641', 'sport')]
PLAIN = [('P856', 'website')]

# The unit items Wikidata normalises to, by label. Read from the IRI rather than asked for,
# because the set is closed and small and one fewer OPTIONAL is one fewer thing to go wrong.
UNIT_LABEL = {'Q11573': 'metre', 'Q25343': 'square metre', 'Q3647172': 'square metre',
              'Q11574': 'second', 'Q25517': 'cubic metre'}


def build_query(qids, lang):
    vals = ' '.join('wd:%s' % q for q in qids)
    sel, opt = ['?item'], []
    for p, k, _u in DIMENSIONED:
        sel += ['?%s' % k, '?%s_unit' % k]
        opt.append('  OPTIONAL { ?item p:%s/psn:%s [ wikibase:quantityAmount ?%s ; '
                   'wikibase:quantityUnit ?%s_unit ] . }' % (p, p, k, k))
    for p, k in COUNTED + DATED + PLAIN:
        sel.append('?%s' % k)
        opt.append('  OPTIONAL { ?item wdt:%s ?%s . }' % (p, k))
    for p, k in ITEM_VALUED:
        sel += ['?%s_item' % k, '?%s' % k, '?%s_en' % k]
        opt.append('  OPTIONAL { ?item wdt:%s ?%s_item .\n'
                   '    OPTIONAL { ?%s_item rdfs:label ?%s . FILTER(LANG(?%s) = "%s") }\n'
                   '    OPTIONAL { ?%s_item rdfs:label ?%s_en . FILTER(LANG(?%s_en) = "en") } }'
                   % (p, k, k, k, k, lang, k, k, k))
    return W.PREFIXES + 'SELECT %s WHERE {\n  VALUES ?item { %s }\n%s\n}' % (
        ' '.join(sel), vals, '\n'.join(opt))


def _add(bag, key, value):
    """Keep EVERY distinct value a property holds, not the first one the engine happened to
    return.

    A property with two values is not a property with one. The Eiffel Tower states four
    official websites, one per language edition of its own site, and the first draft of this
    file kept whichever came back first: an English page would have cited the Italian URL
    about a quarter of the time, with nothing in the row to show a choice had been made. The
    same shape is worse on a number - a building with two stated heights has an ambiguity
    that picking one hides - so the decision moves to the builder, which can refuse a fact
    whose values disagree and list the ones where listing is natural.
    """
    vals = bag.setdefault(key, [])
    if value not in vals:
        vals.append(value)


def read(r, k):
    v = r.get(k)
    return v.get('value') if v else None


def main():
    args = sys.argv[1:]
    qpath = args[args.index('--qids') + 1]
    out = args[args.index('--out') + 1]
    lang = args[args.index('--lang') + 1] if '--lang' in args else 'en'
    batch = int(args[args.index('--batch') + 1]) if '--batch' in args else 200
    ids = [x.strip() for x in open(qpath) if x.strip()]
    ok, bad = entity_identity.split_askable(ids)
    ok = list(dict.fromkeys(ok))
    print('%d ids asked, %d malformed and skipped' % (len(ok), len(bad)), flush=True)

    done = set()
    if os.path.exists(out):
        for l in gzip.open(out, 'rt', encoding='utf-8'):
            try:
                done.add(json.loads(l)['qid'])
            except Exception:
                pass
        print('%d already in %s, resuming' % (len(done), out), flush=True)
    todo = [q for q in ok if q not in done]

    stats = collections.Counter()
    t0 = time.time()
    fh = gzip.open(out, 'at', encoding='utf-8')
    try:
        for i in range(0, len(todo), batch):
            chunk = todo[i:i + batch]
            rows = W.ask(build_query(chunk, lang), timeout=300)
            if rows is None:
                stats['batches_that_failed_every_attempt'] += 1
                print('  batch %d-%d failed every attempt' % (i, i + len(chunk)), flush=True)
                continue
            per = {}
            for r in rows:
                q = W.qid_of(read(r, 'item'))
                if not q:
                    continue
                e = per.setdefault(q, {'qid': q, 'facts': {}, 'items': {}})
                for p, k, want in DIMENSIONED:
                    v, u = read(r, k), read(r, k + '_unit')
                    if v is None:
                        continue
                    got = UNIT_LABEL.get(W.qid_of(u) or '')
                    if got != want:
                        stats['%s_stated_in_%s' % (k, got or 'an_unlisted_unit')] += 1
                        continue
                    _add(e['facts'], k, {'amount': v, 'unit': want})
                for p, k in COUNTED:
                    v = read(r, k)
                    if v is not None:
                        _add(e['facts'], k, {'count': v})
                for p, k in DATED:
                    v = read(r, k)
                    if v is not None:
                        _add(e['facts'], k, {'date': v})
                for p, k in PLAIN:
                    v = read(r, k)
                    if v is not None:
                        _add(e['facts'], k, {'text': v})
                for p, k in ITEM_VALUED:
                    it = W.qid_of(read(r, k + '_item'))
                    if not it:
                        continue
                    lb = read(r, k) or read(r, k + '_en')
                    if not lb:
                        stats['%s_has_no_label_so_it_is_dropped' % k] += 1
                        continue
                    _add(e['items'], k, {'qid': it, 'label': lb})
            for q in chunk:
                e = per.get(q) or {'qid': q, 'facts': {}, 'items': {}}
                stats['entities_written'] += 1
                if e['facts'] or e['items']:
                    stats['entities_with_something'] += 1
                fh.write(json.dumps(e, ensure_ascii=False) + '\n')
            if (i // batch) % 25 == 0:
                fh.flush()
                print('  %d/%d  %.0fs' % (i + len(chunk), len(todo), time.time() - t0),
                      flush=True)
    finally:
        fh.close()
    for k, v in stats.most_common():
        print('%-48s %8d' % (k, v))


if __name__ == '__main__':
    main()

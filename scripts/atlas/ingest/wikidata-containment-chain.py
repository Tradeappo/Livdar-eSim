#!/usr/bin/env python3
"""The administrative chain above a set of places, one level at a time.

WHY A CHAIN AND NOT A RADIUS. 56,074 of the landmark layer's 62,361 class-in-area groups hold
fewer than three members, and they hold 62,381 rows between them. The reason is not that the
places are scattered: it is that P131 names whatever the NEAREST administrative level is, and
for a German church that is a Gemeinde of two thousand people. Three churches in one Gemeinde
is rare; three churches in the Landkreis above it is ordinary.

The fix is to climb the hierarchy Wikidata states, never to draw a circle. A circle would
group a church in one country with a church in another wherever the border happens to run
close, and the containment this project uses everywhere else is stated containment: the
outdoor layer learned that by attaching features to a centroid and getting it wrong.

Each level is one pass: ask the current frontier for its P131, its label and its class, keep
what comes back, and make the newly seen parents the next frontier. An item with several
P131 values has several parents and all of them are kept, because a commune really can sit in
two arrondissements and picking one would be a silent choice.

Usage: wikidata-containment-chain.py --qids FILE --out PATH [--levels 3] [--lang en]
Writes one JSON object per item: {qid, label, cls, parents: [qid, ...], level}
"""
import collections, gzip, json, os, sys, time

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/ingest')
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import wd_sparql as W                                                     # noqa: E402
import entity_identity                                                    # noqa: E402

BATCH = 600


def fetch(qids, lang):
    """label, class label and every P131 value, for one batch of items."""
    vals = ' '.join('wd:%s' % q for q in qids)
    q = W.PREFIXES + """SELECT ?item ?lab ?labEn ?parent ?clsLab WHERE {
  VALUES ?item { %s }
  OPTIONAL { ?item rdfs:label ?lab . FILTER(LANG(?lab) = "%s") }
  OPTIONAL { ?item rdfs:label ?labEn . FILTER(LANG(?labEn) = "en") }
  OPTIONAL { ?item wdt:P131 ?parent . }
  OPTIONAL { ?item wdt:P31 ?cls . ?cls rdfs:label ?clsLab .
             FILTER(LANG(?clsLab) = "en") }
}""" % (vals, lang)
    return W.ask(q, timeout=300)


def main():
    args = sys.argv[1:]
    qpath = args[args.index('--qids') + 1]
    out = args[args.index('--out') + 1]
    levels = int(args[args.index('--levels') + 1]) if '--levels' in args else 3
    lang = args[args.index('--lang') + 1] if '--lang' in args else 'en'

    ids = [x.strip() for x in open(qpath) if x.strip()]
    ok, bad = entity_identity.split_askable(ids)
    frontier = list(dict.fromkeys(ok))
    print('%d ids asked, %d malformed and skipped' % (len(frontier), len(bad)), flush=True)

    seen = {}
    stats = collections.Counter()
    t0 = time.time()
    for level in range(levels):
        todo = [q for q in frontier if q not in seen]
        if not todo:
            break
        print('level %d: %d items' % (level, len(todo)), flush=True)
        nxt = set()
        for i in range(0, len(todo), BATCH):
            chunk = todo[i:i + BATCH]
            rows = fetch(chunk, lang)
            if rows is None:
                stats['batches_that_failed_every_attempt'] += 1
                continue
            for r in rows:
                qid = W.qid_of((r.get('item') or {}).get('value'))
                if not qid:
                    continue
                e = seen.setdefault(qid, {'qid': qid, 'label': None, 'cls': None,
                                          'parents': [], 'level': level})
                lab = (r.get('lab') or {}).get('value') or (r.get('labEn') or {}).get('value')
                if lab and not e['label']:
                    e['label'] = lab
                cl = (r.get('clsLab') or {}).get('value')
                if cl and not e['cls']:
                    e['cls'] = cl
                p = W.qid_of((r.get('parent') or {}).get('value'))
                if p and p not in e['parents']:
                    e['parents'].append(p)
                    nxt.add(p)
            for q in chunk:
                seen.setdefault(q, {'qid': q, 'label': None, 'cls': None,
                                    'parents': [], 'level': level})
            if (i // BATCH) % 10 == 0:
                print('  %d/%d  %.0fs' % (i + len(chunk), len(todo), time.time() - t0),
                      flush=True)
        frontier = sorted(nxt)
        stats['level_%d_items' % level] = len(todo)
        stats['level_%d_new_parents' % level] = len(nxt)

    tmp = out + '.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for v in seen.values():
            fh.write(json.dumps(v, ensure_ascii=False) + '\n')
    os.replace(tmp, out)
    stats['items_written'] = len(seen)
    stats['items_with_no_parent_stated'] = sum(1 for v in seen.values() if not v['parents'])
    for k, v in sorted(stats.items()):
        print('%-42s %8d' % (k, v))


if __name__ == '__main__':
    main()

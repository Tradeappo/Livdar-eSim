#!/usr/bin/env python3
"""The one language each landmark's page is written in, decided before anything is fetched.

THIS STEP EXISTS BECAUSE OF A LOCALISATION BUG THAT WOULD HAVE SHIPPED. The facts a landmark
page prints include item-valued statements - the architect, the architectural style, the
material, the administrative area it stands in, the country - and Wikidata returns those as
item ids, so they have to be asked for BY LABEL in some language. The first plan fetched every
label in English and chose the page language afterwards, which would have put "in Schwangau,
Germany, in the Romanesque Revival architecture style" on a German page. Deciding the language
first means the labels are fetched in the language that will print them.

HOW THE LANGUAGE IS CHOSEN. Not simply the most-read edition. Each language has its own floor
in 1M-ENTITY-SEARCH-DEMAND-FLOOR.json, calibrated on that language's own reference class, and
those floors differ by a factor of four: 19 for Dutch, 76 for Turkish. An entity read 50 times
in Turkish and 30 times in English is read MORE in Turkish and clears only in English, so the
ranking is the reading divided by that language's floor, which is the same question as "in
which edition is this entity most clearly above the bar". Ties break on the raw reading and
then on the language code, so the choice is deterministic.

Usage: landmark-choose-language.py
Reads  data/atlas/sources/wikidata/landmark/*.jsonl.gz
       data/atlas/sources/wikimedia/entity-search-demand.jsonl.gz
       reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json
Writes data/atlas/sources/wikidata/landmark/_language.jsonl.gz
       data/atlas/sources/wikidata/landmark/_qids-<lang>.txt, one per language, for the
       facts fetcher to read with --lang set to match
"""
import collections, glob, gzip, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
sys.path.insert(0, ROOT + 'scripts/atlas/scale')
import entity_identity                                                    # noqa: E402

SRC = ROOT + 'data/atlas/sources/wikidata/landmark/'
READING = ROOT + 'data/atlas/sources/wikimedia/entity-search-demand.jsonl.gz'
FLOORS = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-ENTITY-SEARCH-DEMAND-FLOOR.json'
CLICKSTREAM_PRIVACY_FLOOR = 10
MKT_OF_LANG = dict(entity_identity.LANG_MKT)
MKT_OF_LANG['zh'] = entity_identity.LANG_MKT.get('zh-Hant')


def main():
    fl = json.load(open(FLOORS))['admitted_distribution']
    floor = {k.split('|')[0]: v['floor'] for k, v in fl.items()
             if k.endswith('|home') and v.get('floor')}
    reading = {}
    for l in gzip.open(READING, 'rt', encoding='utf-8'):
        d = json.loads(l)
        reading[d['qid']] = d.get('clicks') or {}

    chosen, stats = {}, collections.Counter()
    for f in sorted(glob.glob(SRC + '*.jsonl.gz')):
        if os.path.basename(f).startswith('_'):
            continue
        for l in gzip.open(f, 'rt', encoding='utf-8'):
            d = json.loads(l)
            q = d['qid']
            if q in chosen:
                continue
            r = reading.get(q)
            if r is None:
                stats['no_readership_row_so_the_join_never_saw_it'] += 1
                continue
            read = [(lg, int(v)) for lg, v in r.items()
                    if lg in d['titles'] and MKT_OF_LANG.get(lg)
                    and int(v) >= CLICKSTREAM_PRIVACY_FLOOR]
            cand = [t for t in read if floor.get(t[0])]
            if not cand:
                # An edition that is read and has NO calibrated floor cannot be judged, and
                # the difference between that and an unread entity is worth counting. Chinese
                # is the whole of it: zhwiki is one encyclopedia for Traditional and
                # Simplified and the floor file has no zh cell, so 17,477 Chinese articles
                # above the clickstream's own floor have no bar to be measured against.
                stats['read_only_in_an_edition_with_no_calibrated_floor' if read
                      else 'no_edition_reads_ten_a_month'] += 1
                for lg, _v in read:
                    stats['unjudgeable_' + lg] += 1
                continue
            lg, v = max(cand, key=lambda t: (t[1] / float(floor[t[0]]), t[1], t[0]))
            chosen[q] = {'qid': q, 'lang': lg, 'reads': v, 'floor': floor[lg],
                         'clears_floor': v >= floor[lg],
                         'editions_considered': len(cand)}
            stats['chosen'] += 1
            stats['chose_' + lg] += 1
            stats['clears_its_floor' if v >= floor[lg] else 'below_its_floor'] += 1

    tmp = SRC + '_language.jsonl.gz.tmp'
    with gzip.open(tmp, 'wt', encoding='utf-8') as fh:
        for v in chosen.values():
            fh.write(json.dumps(v, ensure_ascii=False) + '\n')
    os.replace(tmp, SRC + '_language.jsonl.gz')

    per = collections.defaultdict(list)
    for q, v in chosen.items():
        per[v['lang']].append(q)
    for p in glob.glob(SRC + '_qids-*.txt'):
        os.unlink(p)
    for lg, qs in per.items():
        with open(SRC + '_qids-%s.txt' % lg, 'w') as fh:
            fh.write('\n'.join(sorted(qs, key=lambda x: int(x[1:]))) + '\n')
    for k, v in stats.most_common():
        print('%-48s %8d' % (k, v))


if __name__ == '__main__':
    main()

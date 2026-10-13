#!/usr/bin/env python3
"""Compare two URL Inspection runs over the same 500 URLs. Read only.

WHY THIS EXISTS AS A SCRIPT. The crawl-path fix went live on 2026-10-12 at 22:42Z and the
inspection that followed it ran under an hour later, so it measured Google's state from BEFORE
the fix could have had any effect: all ten indexed pages were crawled on 2026-10-11, a day
earlier. The question the experiment actually asks is what Google does once the 500 pages are
reachable, and that needs elapsed time. This runs at each checkpoint and answers it the same
way every time, so two checkpoints cannot differ because the analysis changed between them.

TWO THINGS IT IS CAREFUL ABOUT.

coverageState comes back in the language of the row: 19 distinct strings across the first two
runs for 3 states. Indexed is therefore decided on `verdict == PASS`, which is language
independent, and the not-indexed split matches every localised form explicitly. Anything
unmatched is reported as UNCLASSIFIED and counted separately rather than folded into a bucket
it may not belong in. An earlier pass of this comparison silently bucketed 41 rows wrong and
understated "unknown to Google" by that much.

A crawl date is the evidence for causation, not the state change. A page can change state
without being re-crawled, and a page crawled before a deployment cannot have been affected by
it. So every state change is reported alongside whether the crawl that produced it happened
after the fix went live, and the summary refuses to call a change attributable when it did not.

Usage:
  python3 scripts/atlas/analysis/compare-inspections.py BEFORE.json AFTER.json [--since ISO8601]
"""
import argparse, collections, json, sys

# Every localised form of the three not-indexed states seen so far. Extend by adding, never by
# loosening to a substring that could match two states in different languages.
DISCOVERED = ['Discovered', 'Gefunden', 'Descubierta', 'Détectée', 'Rilevata', 'wykryta',
              'Detectada', '検出', 'Gevonden']
UNKNOWN = ['unknown to Google', 'ne reconnaît pas', 'no reconoce', 'nicht bekannt',
           'sconosciuto a', 'onbekend bij', 'nieznany', '認識されていません',
           'não reconhece', 'non riconosce']
SERVER_ERROR = ['5xx', 'Server error', 'Error de servidor', 'Serverfehler',
                'Errore del server', 'Erreur de serveur', 'Serverfout', 'Błąd serwera']


def state(row):
    """INDEXED from verdict, which is language independent. The rest from coverageState."""
    if (row.get('verdict') or '').strip().upper() == 'PASS':
        return 'INDEXED'
    cs = row.get('coverageState') or ''
    for keys, name in ((SERVER_ERROR, 'SERVER_ERROR'), (UNKNOWN, 'UNKNOWN_TO_GOOGLE'),
                       (DISCOVERED, 'DISCOVERED_NOT_INDEXED')):
        if any(k in cs for k in keys):
            return name
    return 'UNCLASSIFIED'


def load(path):
    rows = json.load(open(path, encoding='utf-8'))['rows']
    return {r['path']: r for r in rows}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('before')
    ap.add_argument('after')
    ap.add_argument('--since', default='2026-10-12T22:42:19Z',
                    help='when the crawl-path fix went live; a crawl before this cannot be '
                         'evidence that the fix did anything')
    a = ap.parse_args()

    old, new = load(a.before), load(a.after)
    os_ = {p: state(r) for p, r in old.items()}
    ns = {p: state(r) for p, r in new.items()}
    loc = lambda p: p.split('/')[1]

    unclassified = sorted(p for p, s in ns.items() if s == 'UNCLASSIFIED')
    if unclassified:
        print(f'WARNING: {len(unclassified)} rows could not be classified. Their coverageState '
              'is a string this script does not know, so the totals below are incomplete '
              'until it is added. Examples:', file=sys.stderr)
        for p in unclassified[:5]:
            print(f'  {p}  {new[p].get("coverageState")!r}', file=sys.stderr)

    ORDER = ['INDEXED', 'DISCOVERED_NOT_INDEXED', 'UNKNOWN_TO_GOOGLE', 'SERVER_ERROR',
             'UNCLASSIFIED']
    per = collections.defaultdict(collections.Counter)
    perold = collections.defaultdict(collections.Counter)
    for p, s in ns.items():
        per[loc(p)][s] += 1
    for p, s in os_.items():
        perold[loc(p)][s] += 1

    print(f'before : {a.before}')
    print(f'after  : {a.after}')
    print(f'fix live: {a.since}\n')
    print(f'{"loc":5s} {"n":>4s} | {"indexed":>7s} {"discov":>7s} {"unknown":>8s} {"5xx":>4s} '
          f'| {"was idx":>7s}')
    tot, totold = collections.Counter(), collections.Counter()
    for l in sorted(per):
        c, o = per[l], perold[l]
        tot.update(c)
        totold.update(o)
        print(f'{l:5s} {sum(c.values()):4d} | {c["INDEXED"]:7d} {c["DISCOVERED_NOT_INDEXED"]:7d} '
              f'{c["UNKNOWN_TO_GOOGLE"]:8d} {c["SERVER_ERROR"]:4d} | {o["INDEXED"]:7d}')
    print(f'{"ALL":5s} {sum(tot.values()):4d} | {tot["INDEXED"]:7d} '
          f'{tot["DISCOVERED_NOT_INDEXED"]:7d} {tot["UNKNOWN_TO_GOOGLE"]:8d} '
          f'{tot["SERVER_ERROR"]:4d} | {totold["INDEXED"]:7d}')

    print('\nstate changes')
    moved = [(p, os_.get(p, 'ABSENT'), s) for p, s in ns.items() if os_.get(p, 'ABSENT') != s]
    for (x, y), n in sorted(collections.Counter((b, c) for _, b, c in moved).items(),
                            key=lambda z: -z[1]):
        print(f'  {n:4d}  {x:22s} -> {y}')
    print(f'  {len(ns) - len(moved):4d}  unchanged')

    # Causation, separated from correlation on purpose.
    after_fix = [p for p, _, _ in moved if (new[p].get('lastCrawlTime') or '') > a.since]
    crawled_after = [p for p in ns if (new[p].get('lastCrawlTime') or '') > a.since]
    newly_indexed = [p for p, b, c in moved if c == 'INDEXED']
    ni_after = [p for p in newly_indexed if (new[p].get('lastCrawlTime') or '') > a.since]
    print('\nattribution')
    print(f'  URLs Google crawled since the fix went live : {len(crawled_after)}')
    print(f'  state changes on a crawl after the fix      : {len(after_fix)} of {len(moved)}')
    print(f'  newly indexed                               : {len(newly_indexed)}')
    print(f'  newly indexed AND crawled after the fix     : {len(ni_after)}')
    if newly_indexed and not ni_after:
        print('  => none of the new indexations can be attributed to the fix: every one of them\n'
              '     rests on a crawl that predates it. Report them as movement, not as effect.')
    elif ni_after:
        print('  => these are the first indexations that could be an effect of the fix, because\n'
              '     Google re-fetched the page after it went live:')
        for p in sorted(ni_after):
            print(f'       {p}  crawled {new[p].get("lastCrawlTime")}')
    if not crawled_after:
        print('  => Google has not re-crawled ANY of the 500 since the fix. This checkpoint\n'
              '     carries no information about the fix either way; it is too early.')
    return 1 if unclassified else 0


if __name__ == '__main__':
    sys.exit(main())

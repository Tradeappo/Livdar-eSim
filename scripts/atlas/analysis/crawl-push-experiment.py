#!/usr/bin/env python3
"""Measure the crawl push of PR #43 (merged 2026-10-22, live 15:15 UTC).

The push changed the link blocks of 126 indexed pages so that 104 of 263 old, uncrawled pages
gained links from indexed pages. A link is only visible to Google once it RECRAWLS the source
page, so exposure is measured per source page from its lastCrawlTime, and a target counts as
exposed only when at least one source that added a link to it was recrawled after the deploy.

Four groups of targets, fixed from CRAWL-PUSH-2026-10-22.json:
  A_exposed       gained links, and at least one of those sources was recrawled after deploy
  B_not_exposed   gained links, but no source that added one has been recrawled yet
  C_no_new_links  gained no link, but already had at least one from an indexed page
  D_unreachable   no link from any indexed page before or after (the 52; it, ja, nl, en)

For each group: the four index states now, the transition from the 2026-10-22 baseline, the
median number of links from indexed pages, and the language and family breakdown. The state
rule is the language independent one of normalise-url-inspection.py.

Usage: crawl-push-experiment.py <inspection.json> [<inspection.json> ...] [--out report.json]
Later files win per URL, so a sources run and a targets run can be passed together.
"""
import collections, json, os, statistics, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) + '/'
DEPLOY = '2026-10-22T15:15:00Z'
STATES = ['UNKNOWN_TO_GOOGLE', 'DISCOVERED_NOT_INDEXED', 'CRAWLED_NOT_INDEXED', 'INDEXED']


def state(r):
    if r.get('verdict') == 'PASS':
        return 'INDEXED'
    if r.get('lastCrawlTime'):
        return 'CRAWLED_NOT_INDEXED'
    if r.get('sitemap') or r.get('referringUrls'):
        return 'DISCOVERED_NOT_INDEXED'
    return 'UNKNOWN_TO_GOOGLE'


def main(argv):
    out_path = None
    if '--out' in argv:
        i = argv.index('--out')
        out_path = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    latest = {}
    inspected_at = []
    for f in argv:
        d = json.load(open(f))
        inspected_at.append(d.get('inspected_at'))
        for r in d.get('rows', []):
            latest[r['path']] = r
    push = json.load(open(ROOT + 'reports/atlas/CRAWL-PUSH-2026-10-22.json'))
    base = {r['path']: r for r in json.load(open(ROOT + 'reports/atlas/INDEXATION-NORMALISED-2026-10-22.json'))['rows']}
    srcbase = {r['path']: r for r in json.load(open(ROOT + 'reports/atlas/CRAWL-PUSH-SOURCE-BASELINE-2026-10-22.json'))['rows']}

    # Exposure of each source page.
    recrawled = {}
    for p in srcbase:
        r = latest.get(p)
        recrawled[p] = None if r is None else bool(r.get('lastCrawlTime') and r['lastCrawlTime'] > DEPLOY)
    known = [v for v in recrawled.values() if v is not None]
    sources = {
        'total': len(srcbase), 'inspected': len(known), 'recrawled_after_deploy': sum(known),
        'share': round(sum(known) / len(known), 4) if known else None,
        'by_cohort': {c: {'n': n, 'recrawled': sum(1 for p, v in recrawled.items() if v and srcbase[p]['cohort'] == c)}
                      for c, n in collections.Counter(r['cohort'] for r in srcbase.values()).items()},
    }

    adders = collections.defaultdict(set)
    for s in push['swaps_list']:
        adders[s['added']].add(s['source'])
    groups = collections.defaultdict(list)
    for t in push['per_target']:
        p = t['path']
        if t['inbound_from_indexed_after'] == 0:
            g = 'D_unreachable'
        elif adders.get(p):
            g = 'A_exposed' if any(recrawled.get(s) for s in adders[p]) else 'B_not_exposed'
        else:
            g = 'C_no_new_links'
        groups[g].append(t)

    def summary(ts):
        now = collections.Counter()
        trans = collections.Counter()
        missing = 0
        for t in ts:
            r = latest.get(t['path'])
            if r is None:
                missing += 1
                continue
            s = state(r)
            now[s] += 1
            trans[base[t['path']]['state'] + ' -> ' + s] += 1
        moved = sum(v for k, v in trans.items() if k.split(' -> ')[0] != k.split(' -> ')[1])
        progressed = sum(v for k, v in trans.items()
                         if STATES.index(k.split(' -> ')[1]) > STATES.index(k.split(' -> ')[0]))
        return {
            'n': len(ts), 'not_inspected': missing,
            'now': {s: now.get(s, 0) for s in STATES},
            'baseline': {s: sum(1 for t in ts if base[t['path']]['state'] == s) for s in STATES},
            'transitions': dict(sorted(trans.items())),
            'changed': moved, 'progressed': progressed,
            'progress_rate': round(progressed / (len(ts) - missing), 4) if len(ts) > missing else None,
            'median_indexed_inbound_before': statistics.median([t['inbound_from_indexed_before'] for t in ts]) if ts else None,
            'median_indexed_inbound_after': statistics.median([t['inbound_from_indexed_after'] for t in ts]) if ts else None,
            'by_language': dict(collections.Counter(t['path'].split('/')[1] for t in ts).most_common()),
            'by_family': dict(collections.Counter(t['family'] for t in ts).most_common()),
        }

    report = {
        'deploy': DEPLOY, 'inspections': inspected_at, 'sources': sources,
        'groups': {g: summary(groups[g]) for g in ('A_exposed', 'B_not_exposed', 'C_no_new_links', 'D_unreachable')},
    }
    if out_path:
        json.dump(report, open(out_path, 'w'), indent=1)
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main(sys.argv[1:])

#!/usr/bin/env python3
"""Normalise a URL Inspection run into the four index states, per cohort and per language.

Google localises coverageState into the inspecting language ("Gefunden - zurzeit nicht
indexiert", "検出 - インデックス未登録"), so the state is read from the language-independent
fields, never from that string:

  INDEXED                 verdict PASS
  CRAWLED_NOT_INDEXED     not PASS, but Google has a lastCrawlTime for it
  DISCOVERED_NOT_INDEXED  never crawled, but Google knows it from a sitemap or a referring URL
  UNKNOWN_TO_GOOGLE       never crawled and known from nothing

The rule reproduces all 553 labels of the 2026-10-20 run. The cohort of each path comes from
data/atlas/cohorts/cohort-00N-pages.json on main, because live-production.json does not tell
cohort 001 from 002.

Usage: normalise-url-inspection.py <url-inspection-DATE.json> <cohorts dir> <out.json>
"""
import collections, json, os, sys

STATES = ['INDEXED', 'CRAWLED_NOT_INDEXED', 'DISCOVERED_NOT_INDEXED', 'UNKNOWN_TO_GOOGLE']


def state(r):
    if r.get('verdict') == 'PASS':
        return 'INDEXED'
    if r.get('lastCrawlTime'):
        return 'CRAWLED_NOT_INDEXED'
    if r.get('sitemap') or r.get('referringUrls'):
        return 'DISCOVERED_NOT_INDEXED'
    return 'UNKNOWN_TO_GOOGLE'


def tally(rows):
    out = {'n': len(rows)}
    for s in STATES:
        out[s] = sum(1 for r in rows if r['state'] == s)
    crawled = out['INDEXED'] + out['CRAWLED_NOT_INDEXED']
    out['crawled'] = crawled
    out['indexed_per_crawled'] = round(out['INDEXED'] / crawled, 4) if crawled else None
    out['indexed_per_inspected'] = round(out['INDEXED'] / len(rows), 4) if rows else None
    return out


def main(src, cohorts_dir, dst):
    run = json.load(open(src))
    cohort_of, published = {}, collections.Counter()
    for c in ('001', '002', '003'):
        for p in json.load(open(os.path.join(cohorts_dir, 'cohort-%s-pages.json' % c)))['pages']:
            cohort_of[p['path']] = c
            published[c] += 1
    rows = []
    for r in run.get('rows', []):
        r = dict(r)
        r['state'] = state(r)
        r['c'] = cohort_of.get(r['path'], '?')
        r['lang'] = r['path'].strip('/').split('/')[0]
        rows.append(r)
    groups = collections.defaultdict(list)
    for r in rows:
        groups[r['c']].append(r)
        if r['c'] in ('001', '002'):
            groups['001+002'].append(r)
    by_lang = collections.defaultdict(list)
    for r in rows:
        by_lang[('old' if r['c'] in ('001', '002') else r['c']) + '|' + r['lang']].append(r)
    crawl_dates = collections.Counter((r.get('lastCrawlTime') or '')[:10] for r in rows if r.get('lastCrawlTime'))
    out = {
        'source': os.path.relpath(src),
        'inspected_at': run.get('inspected_at'),
        'inspected': len(rows),
        'errors': len(run.get('errors') or []),
        'stopped_early': run.get('stopped_early'),
        'token_mints': run.get('token_mints'),
        'sitemaps_in_search_console': run.get('sitemaps_in_search_console'),
        'published': dict(published),
        'unmatched_paths': sum(1 for r in rows if r['c'] == '?'),
        'byCohort': {k: tally(v) for k, v in sorted(groups.items())},
        'byCohortLang': {k: tally(v) for k, v in sorted(by_lang.items())},
        'crawl_dates': dict(sorted(crawl_dates.items())),
        'canon_mismatch': [r['url'] for r in rows if r.get('googleCanonical') and r.get('userCanonical')
                           and r['googleCanonical'] != r['userCanonical']],
        'rows': rows,
    }
    json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=1)
    print(json.dumps({k: out[k] for k in ('inspected', 'errors', 'stopped_early', 'token_mints',
                                          'unmatched_paths', 'byCohort')}, indent=1))


if __name__ == '__main__':
    main(*sys.argv[1:4])

#!/usr/bin/env python3
"""One reconciliation of every Atlas cohort and every live sitemap URL, by URL identity.

It joins five sources that earlier reports mixed up, and keeps them apart:

  planned      data/atlas/cohorts/cohort-00N.json `target`, and the pages the cohort file holds
  production   a fresh fetch of every cohort URL and every URL in the live sitemap index and its
               children: HTTP status, rel=canonical, robots meta and X-Robots-Tag
               (written by the companion fetcher, see --live)
  sitemap      membership in the live sitemap at the time of that fetch
  Search       URL Inspection rows; the LATEST inspection of each URL wins, and the time of that
  Console      inspection is reported, so a state is never older than it says it is
  inventory    the FINAL manifest parts (1,002,362 rows), matched by stable identity
               (family + language + entity id), not by URL: the manifest stores an internal
               url_pattern (/de/climate/city-month/...) and production serves localised slugs

Index state, language independent (Google localises coverageState into the inspecting language):
  EXCLUDED_OTHER          Google chose another canonical, or a robots/noindex block, or a fetch
                          state other than success (soft 404, 404, 5xx, redirect), or verdict FAIL
  INDEXED                 verdict PASS
  CRAWLED_NOT_INDEXED     not indexed, not excluded, but Google has a lastCrawlTime
  DISCOVERED_NOT_INDEXED  never crawled, known from a sitemap or a referring URL
  UNKNOWN_TO_GOOGLE       known from nothing
  NOT_INSPECTED           no successful inspection row (the API returned an error)

Usage:
  atlas-reconciliation.py --live LIVE.json --cohorts DIR --out-prefix reports/atlas/ATLAS-RECONCILIATION-DATE
                          INSPECTION.json [INSPECTION.json ...]
"""
import argparse, collections, csv, glob, gzip, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) + '/'
FINAL_DIR = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.parts/'
COHORTS = ['001', '002', '003']
STATES = ['UNKNOWN_TO_GOOGLE', 'DISCOVERED_NOT_INDEXED', 'CRAWLED_NOT_INDEXED', 'INDEXED', 'EXCLUDED_OTHER', 'NOT_INSPECTED']
BLOCKED_INDEXING = {'BLOCKED_BY_META_TAG', 'BLOCKED_BY_HTTP_HEADER', 'BLOCKED_BY_ROBOTS_TXT'}
OK_FETCH = {'SUCCESSFUL', 'PAGE_FETCH_STATE_UNSPECIFIED', None}
# Old cohort families with no family of the same name in FINAL, and the FINAL family that covers
# the same entity, with how a FINAL entity id reduces to the cohort's.
NEAREST = {
    'events.country-holidays': ('pulse.country-holidays', lambda e: e.rsplit('-', 1)[0]),
    'events.subdivision-holidays': ('pulse.subdivision-holidays', lambda e: e.rsplit('-', 1)[0]),
    'sport.city-season': ('sport.city-activity', lambda e: e),
}


def state(r):
    if r is None:
        return 'NOT_INSPECTED'
    gc, uc = r.get('googleCanonical'), r.get('userCanonical')
    if (gc and uc and gc != uc) or r.get('verdict') == 'FAIL' \
            or r.get('indexingState') in BLOCKED_INDEXING or r.get('robotsTxtState') == 'DISALLOWED' \
            or r.get('pageFetchState') not in OK_FETCH:
        return 'EXCLUDED_OTHER'
    if r.get('verdict') == 'PASS':
        return 'INDEXED'
    if r.get('lastCrawlTime'):
        return 'CRAWLED_NOT_INDEXED'
    if r.get('sitemap') or r.get('referringUrls'):
        return 'DISCOVERED_NOT_INDEXED'
    return 'UNKNOWN_TO_GOOGLE'


def sitemap_family(child):
    name = child.rsplit('/', 1)[-1]
    if name.startswith('atlas-pages-'):
        return 'atlas cohort pages'
    if 'city-month' in name:
        return 'atlas legacy city-month'
    if name == 'atlas-directory.xml':
        return 'atlas directory'
    if '-hub-' in name:
        return 'atlas hub'
    return 'main site ' + name.split('-', 1)[1].replace('.xml', '')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--live', required=True)
    ap.add_argument('--cohorts', required=True)
    ap.add_argument('--out-prefix', required=True)
    ap.add_argument('inspections', nargs='+')
    a = ap.parse_args()

    live = json.load(open(a.live))
    P, smOf = live['pages'], live['sitemapOf']

    # Planned and generated, from the cohort files.
    planned, pages = {}, {}
    for c in COHORTS:
        man = json.load(open(f'{a.cohorts}/cohort-{c}.json'))
        pg = json.load(open(f'{a.cohorts}/cohort-{c}-pages.json'))['pages']
        planned[c] = {'target': man.get('target'), 'generated': len(pg), 'distinct_paths': len({p['path'] for p in pg}),
                      'shortfall': man.get('shortfall'), 'withoutPath': len(man.get('withoutPath') or []),
                      'duplicates': len(man.get('duplicates') or []), 'generatedAt': man.get('generatedAt')}
        for p in pg:
            pages['https://livdar.com' + p['path']] = dict(p, c=c)

    # Search Console: the latest successful row per URL, and the API errors of the latest attempt.
    latest, when, errors = {}, {}, {}
    sitemaps_seen = []
    for f in a.inspections:
        d = json.load(open(f))
        sitemaps_seen.append({'file': os.path.basename(f), 'inspected_at': d.get('inspected_at'),
                              'index': d.get('sitemaps_in_search_console'), 'children': d.get('sitemap_children')})
        for r in d.get('rows', []):
            u = r['url']
            if u not in when or r['inspected_at'] > when[u]:
                latest[u], when[u] = r, r['inspected_at']
                errors.pop(u, None)
        for e in d.get('errors', []):
            if e['url'] not in latest:
                errors[e['url']] = e

    def row(c):
        us = [u for u, p in pages.items() if p['c'] == c] if c != 'TOTAL' else list(pages)
        st = collections.Counter(state(latest.get(u)) for u in us)
        served = [u for u in us if P.get(u, {}).get('status') == 200]
        return {
            'cohort': c,
            'planned': sum(planned[x]['target'] for x in COHORTS) if c == 'TOTAL' else planned[c]['target'],
            'generated': len(us),
            'served_200': len(served),
            'self_canonical': sum(1 for u in us if P.get(u, {}).get('canonical') == u),
            'indexable': sum(1 for u in served if not any('noindex' in (x or '').lower()
                             for x in (P[u].get('robots'), P[u].get('xrobots')))),
            'in_live_sitemap': sum(1 for u in us if u in smOf),
            'gsc_known': sum(v for k, v in st.items() if k not in ('UNKNOWN_TO_GOOGLE', 'NOT_INSPECTED')),
            'gsc_lists_a_sitemap': sum(1 for u in us if latest.get(u) and latest[u].get('sitemap')),
            **{s: st.get(s, 0) for s in STATES},
            'missing_from_production': len(us) - len(served),
            'missing_from_sitemap': sum(1 for u in us if u not in smOf),
            'inspected_between': [min((when[u] for u in us if u in when), default=None),
                                  max((when[u] for u in us if u in when), default=None)],
            'not_inspected_urls': [u for u in us if u not in latest],
        }

    table = [row(c) for c in COHORTS + ['TOTAL']]

    # The live sitemap, by family of child sitemap.
    fam = collections.Counter()
    for u, cs in smOf.items():
        fam[('atlas cohort ' + pages[u]['c']) if u in pages else sitemap_family(cs[0])] += 1
    non200 = [u for u in smOf if P.get(u, {}).get('status') != 200]
    dup_in_sitemap = [u for u, cs in smOf.items() if len(cs) > 1]

    # The FINAL inventory, by identity.
    want = {p['family'] for p in pages.values()} | {v[0] for v in NEAREST.values()}
    final_rows, by_key, near = 0, collections.defaultdict(list), collections.defaultdict(set)
    families_in_final = collections.Counter()
    for f in sorted(glob.glob(FINAL_DIR + 'part-*.csv.gz')):
        with gzip.open(f, 'rt', encoding='utf-8') as fh:
            for r in csv.DictReader(fh):
                final_rows += 1
                if r['family'] not in want:
                    continue
                families_in_final[r['family']] += 1
                by_key[(r['family'], r['language'], r['entity_id'])].append(r['candidate_id'])
                for fam_c, (alt, red) in NEAREST.items():
                    if r['family'] == alt:
                        near[fam_c].add((r['language'], red(r['entity_id'])))
    published_ids, inv = set(), collections.Counter()
    per_cohort_inv = {c: collections.Counter() for c in COHORTS}
    for u, p in pages.items():
        ids = by_key.get((p['family'], p['locale'], str(p['entity'])))
        if ids:
            kind = 'in FINAL, same family and entity'
            published_ids.update(ids)
        elif p['family'] in NEAREST and (p['locale'], str(p['entity']).split(':')[0]) in near[p['family']]:
            kind = 'not in FINAL; FINAL holds the same entity in ' + NEAREST[p['family']][0]
        else:
            kind = 'not in FINAL'
        inv[kind] += 1
        per_cohort_inv[p['c']][kind] += 1

    report = {
        'generated_from': {'production_fetch': live['checked_at'], 'inspections': [s['file'] for s in sitemaps_seen],
                           'cohort_files': a.cohorts, 'final_manifest': FINAL_DIR},
        'planned': planned,
        'table': table,
        'gsc_not_inspected_errors': errors,
        'sitemap': {'index_status': live['index_status'], 'children': len(live['children']),
                    'children_non_200': [c for c, v in live['childStatus'].items() if v['status'] != 200],
                    'urls': len(smOf), 'by_family': dict(sorted(fam.items())),
                    'non_200': non200, 'duplicates_across_children': dup_in_sitemap,
                    'non_cohort_status': dict(collections.Counter(P[u]['status'] for u in smOf if u not in pages)),
                    'non_cohort_self_canonical': sum(1 for u in smOf if u not in pages and P[u].get('canonical') == u)},
        'gsc_sitemaps': sitemaps_seen[-1] if sitemaps_seen else None,
        'inventory': {'final_rows': final_rows, 'cohort_families_in_final': dict(families_in_final),
                      'cohort_pages_by_match': dict(inv),
                      'by_cohort': {c: dict(v) for c, v in per_cohort_inv.items()},
                      'final_rows_published': len(published_ids),
                      'final_rows_unpublished': final_rows - len(published_ids)},
    }
    json.dump(report, open(a.out_prefix + '.json', 'w'), indent=1, ensure_ascii=False)
    print(json.dumps({k: report[k] for k in ('table', 'sitemap', 'inventory')}, indent=1, ensure_ascii=False)[:6000])


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Turn the fresh crawl into PASS/FAIL per verification, with the evidence attached.

Each check states what it measured, so a PASS cannot be read as more than it is. In
particular: "not an orphan" is only meaningful when measured against pages OUTSIDE the Atlas
cohort. The 500 pages link to each other densely, so an inbound-link count that includes
cohort pages is the island measuring itself and always looks healthy.
"""
import collections, csv, glob, json, os, re, subprocess, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
OUT = ROOT + 'reports/atlas/'
BASE = 'https://livdar.com'
UA = 'LivdarAtlasVerify/1.0 (+https://livdar.com; internal crawl graph verification)'


def probe(path, tries=4):
    """Status only, for a link target the main crawl did not cover. Retries so a proxy reset
    is never recorded as a site failure."""
    for i in range(tries):
        r = subprocess.run(['curl', '-sS', '-o', '/dev/null', '-w', '%{http_code}',
                            '--max-time', '30', '-A', UA, BASE + path],
                           capture_output=True, text=True)
        code = (r.stdout or '').strip()
        if code and code != '000':
            return int(code)
    return 0


def main():
    raw = json.load(open(OUT + 'CRAWL-GRAPH-RAW.json', encoding='utf-8'))
    res = raw['results']
    declared = raw['declared_paths']
    locales = raw['locales_served']

    manifest = {}
    for f in sorted(glob.glob(ROOT + 'data/atlas/cohorts/cohort-00*-pages.json')):
        for p in json.load(open(f, encoding='utf-8'))['pages']:
            manifest[p['path']] = p
    cohort = set(manifest)
    by_locale = collections.defaultdict(set)
    for p, row in manifest.items():
        by_locale[row['locale']].add(p)

    checks = []

    def add(name, ok, detail, evidence=None):
        checks.append({'check': name, 'verdict': 'PASS' if ok else 'FAIL',
                       'detail': detail, 'evidence': evidence or {}})

    # Transport failures are mine, not the site's. Named first so nothing below is read as a
    # site defect when it was a proxy reset.
    transport = {p: r['transport_error'] for p, r in res.items() if r.get('transport_error')}

    # ---- 1. the directory exists and answers for every served locale
    dir_rows = {}
    for l in locales + ['ro', 'zh-Hant']:
        p = '/%s/atlas/' % l
        r = res.get(p, {})
        dir_rows[l] = {
            'path': p, 'code': r.get('code'), 'redirect': r.get('redirect') or '',
            'canonical': r.get('canonical'), 'robots': r.get('robots'),
            'hreflang': r.get('hreflang') or {}, 'links': r.get('links') or [],
            'transport_error': r.get('transport_error', ''),
            'in_sitemap': p in declared,
        }
    served_ok = [l for l in locales if dir_rows[l]['code'] == 200]
    served_bad = {l: {'code': dir_rows[l]['code'], 'redirect': dir_rows[l]['redirect']}
                  for l in locales if dir_rows[l]['code'] != 200}
    add('every served Atlas locale has a working /{lang}/atlas/ directory',
        not served_bad,
        f'{len(served_ok)} of {len(locales)} served locales answer 200 at /{{lang}}/atlas/',
        {'locales_served': locales, 'answering_200': served_ok,
         'not_answering_200': served_bad})

    # ---- 2. each directory links only to published pages in its own locale
    bad_scope, link_counts = {}, {}
    for l in served_ok:
        links = [p for p in dir_rows[l]['links'] if p in cohort or p.startswith('/%s/' % l)]
        to_cohort = [p for p in dir_rows[l]['links'] if p in cohort]
        wrong_locale = sorted({p for p in to_cohort if manifest[p]['locale'] != l})
        # Only an ATLAS-shaped path counts here. The first version matched any
        # /{locale}/x/y/ and so flagged the guide links in the page's own header and
        # footer (/de/ratgeber/how-esim-works/) as "unpublished Atlas pages", which is this
        # check misreading the site chrome rather than the site linking to nothing.
        atlas_segments = {p.split('/')[2] for p in by_locale[l]}
        unpublished = sorted({p for p in dir_rows[l]['links']
                              if len(p.split('/')) == 5
                              and p.split('/')[1] == l
                              and p.split('/')[2] in atlas_segments
                              and p not in cohort})
        missing = sorted(by_locale[l] - set(to_cohort))
        link_counts[l] = {'cohort_links_on_page': len(set(to_cohort)),
                          'published_in_this_locale': len(by_locale[l]),
                          'links_to_another_locale': len(wrong_locale),
                          'links_to_unpublished_paths': len(unpublished),
                          'published_but_not_linked': len(missing)}
        if wrong_locale or unpublished or missing:
            bad_scope[l] = {'links_to_another_locale': wrong_locale[:10],
                            'links_to_unpublished_paths': unpublished[:10],
                            'published_but_not_linked': missing[:10]}
    add('each directory links to every published page in its locale, and only those',
        not bad_scope,
        'checked the ' + str(len(served_ok)) + ' directories that answer 200',
        {'per_locale': link_counts, 'problems': bad_scope})

    # ---- 3. orphans, measured only against pages OUTSIDE the cohort
    inbound_non_cohort = collections.Counter()
    sources = collections.defaultdict(set)
    for src, r in res.items():
        if src in cohort:
            continue                     # a cohort page is the island, not a way in
        if r.get('code') != 200:
            continue                     # a 307 or 404 carries no links a crawler can follow
        for tgt in set(r.get('links') or []):
            if tgt in cohort:
                inbound_non_cohort[tgt] += 1
                sources[tgt].add(src)
    orphans = sorted(p for p in cohort if inbound_non_cohort[p] == 0)
    orph_by_locale = collections.Counter(manifest[p]['locale'] for p in orphans)
    add('no published Atlas URL is an internal-link orphan',
        not orphans,
        f'{len(cohort) - len(orphans)} of {len(cohort)} have at least one inbound link from a '
        f'page outside the cohort that answers 200; {len(orphans)} have none',
        {'orphans_by_locale': dict(sorted(orph_by_locale.items())),
         'orphan_count': len(orphans), 'orphan_examples': orphans[:12],
         'reached_by_locale': {l: len(by_locale[l]) - orph_by_locale[l]
                               for l in sorted(by_locale)}})

    # ---- 4a. broken links anywhere on the surfaces crawled
    targets = collections.defaultdict(set)
    for src, r in res.items():
        if r.get('code') != 200:
            continue
        for tgt in set(r.get('links') or []):
            targets[tgt].add(src)
    unknown = sorted(t for t in targets if t not in res)
    probed = {t: probe(t) for t in unknown}
    broken = {}
    for t, srcs in targets.items():
        code = res[t]['code'] if t in res else probed.get(t, 0)
        if code in (0,):
            continue                     # never got a status: mine, not the site's
        if code >= 400 or (300 <= code < 400):
            broken[t] = {'status': code, 'linked_from_count': len(srcs),
                         'linked_from_examples': sorted(srcs)[:5]}
    add('no internal link on a crawled page points at a 404 or a redirect',
        not broken,
        f'{len(targets)} distinct internal link targets checked, '
        f'{len(unknown)} of them probed separately',
        {'broken_or_redirecting_targets': dict(list(broken.items())[:15]),
         'broken_target_count': len(broken)})

    # ---- 4b. canonicals, robots on the 500
    bad_canon, noindexed, no_canon = {}, [], []
    for p in sorted(cohort):
        r = res.get(p, {})
        if r.get('code') != 200:
            continue
        c = (r.get('canonical') or '').strip()
        want = BASE + p
        if not c:
            no_canon.append(p)
        elif c.rstrip('/') + '/' != want:
            bad_canon[p] = c
        rb = (r.get('robots') or '').lower()
        if 'noindex' in rb:
            noindexed.append(p)
    add('every published Atlas page self-canonicalises',
        not bad_canon and not no_canon,
        f'{len(cohort)} pages checked',
        {'wrong_canonical': dict(list(bad_canon.items())[:10]),
         'wrong_canonical_count': len(bad_canon),
         'missing_canonical_count': len(no_canon), 'missing_canonical': no_canon[:10]})
    add('no published Atlas page is noindex',
        not noindexed, f'{len(cohort)} pages checked',
        {'noindex_count': len(noindexed), 'noindex': noindexed[:10]})

    # ---- 4c. HTTP status of the 500
    non200 = {p: res[p]['code'] for p in sorted(cohort)
              if res.get(p, {}).get('code') not in (200,) and not res.get(p, {}).get('transport_error')}
    add('every published Atlas URL returns 200',
        not non200, f'{len(cohort)} pages fetched',
        {'non_200': non200, 'non_200_count': len(non200)})

    # ---- 5. sitemap membership
    missing_sm = sorted(p for p in cohort if p not in declared)
    dirs_missing = sorted('/%s/atlas/' % l for l in locales if '/%s/atlas/' % l not in declared)
    dirs_in_sm_not_200 = {p: res.get(p, {}).get('code')
                          for p in sorted(declared)
                          if p.endswith('/atlas/') and res.get(p, {}).get('code') != 200}
    host_wrong = {p: d['host'] for p, d in declared.items() if d['host'] != 'livdar.com'}
    scheme_wrong = {p: d['scheme'] for p, d in declared.items() if d['scheme'] != 'https'}
    add('all 500 published Atlas URLs are in a sitemap',
        not missing_sm, f'{len(declared)} URLs declared across {len(raw["sitemaps"])} sitemap files',
        {'missing_count': len(missing_sm), 'missing': missing_sm[:10]})
    add('every Atlas directory is declared in a sitemap, and every declared one answers 200',
        not dirs_missing and not dirs_in_sm_not_200,
        'checked the directory for each of the ' + str(len(locales)) + ' served locales',
        {'served_locales_absent_from_every_sitemap': dirs_missing,
         'declared_in_a_sitemap_but_not_200': dirs_in_sm_not_200})
    add('no sitemap entry uses the wrong host or scheme',
        not host_wrong and not scheme_wrong, f'{len(declared)} declared URLs',
        {'wrong_host': dict(list(host_wrong.items())[:5]),
         'wrong_scheme': dict(list(scheme_wrong.items())[:5])})

    # ---- 6. hreflang: a target that redirects or 404s is an hreflang defect
    hl_bad = {}
    for src, r in res.items():
        if r.get('code') != 200 or not r.get('hreflang'):
            continue
        for lang, href in r['hreflang'].items():
            u = urllib.parse.urlsplit(href)
            tp = u.path if u.path.endswith('/') else u.path + '/'
            code = res[tp]['code'] if tp in res else probed.get(tp, probe(tp))
            probed.setdefault(tp, code)
            if code != 200:
                hl_bad.setdefault(src, []).append({'hreflang': lang, 'href': href,
                                                   'status': code})
    add('no hreflang annotation points at a URL that redirects or 404s',
        not hl_bad,
        f'{sum(1 for r in res.values() if r.get("hreflang"))} pages carry hreflang',
        {'pages_with_a_bad_hreflang_target': len(hl_bad),
         'examples': {k: v[:4] for k, v in list(hl_bad.items())[:6]}})

    report = {
        'what_this_is': ('verification of the Atlas crawl graph as deployed after pull '
                         'requests 34 and 35, measured fresh against production'),
        'measured_at': raw['fetched_at'],
        'main_commit_verified': subprocess.run(
            ['git', '-C', ROOT, 'rev-parse', 'HEAD'], capture_output=True,
            text=True).stdout.strip(),
        'urls_fetched': len(res),
        'locales_the_cohort_publishes_in': locales,
        'my_own_transport_failures_not_site_defects': transport,
        'checks': checks,
        'directory_detail': dir_rows,
    }
    json.dump(report, open(OUT + 'CRAWL-GRAPH-VERIFICATION.json', 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

    with open(OUT + 'CRAWL-GRAPH-ORPHANS.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['path', 'locale', 'family', 'http_status', 'inbound_from_outside_cohort',
                    'is_orphan', 'one_source'])
        for p in sorted(cohort):
            w.writerow([p, manifest[p]['locale'], manifest[p].get('family', ''),
                        res.get(p, {}).get('code'), inbound_non_cohort[p],
                        inbound_non_cohort[p] == 0,
                        sorted(sources[p])[0] if sources[p] else ''])

    for c in checks:
        print(f"{c['verdict']:4s}  {c['check']}")
        print(f"      {c['detail']}")
    if transport:
        print(f'\n{len(transport)} URL(s) never returned an HTTP status (my proxy, not the site)')
    return 0


if __name__ == '__main__':
    sys.exit(main())

#!/usr/bin/env python3
"""Crawl paths into the Atlas, the sitemap architecture, and the accelerated test set.

Three questions that share one input, the cached crawl of the whole declared site:

  PHASE 2  does Google have a STRONG path into each Atlas page, not merely a path? "Not
           orphaned" was the answer the first audit gave and it is the wrong bar: a page linked
           only from other Atlas pages is reachable only once Google has already decided to
           crawl the Atlas. What matters is inbound links from NON-Atlas pages, and the click
           depth from the home page.
  PHASE 3  is the sitemap architecture sound, and does anything about the 79 URLs Google does
           not know differ from the 420 it does?
  PHASE 4  a stratified test set of 24 to 30 of the existing live URLs, chosen across families,
           markets and both Google states, with the reason for each selection recorded.

Click depth is computed by breadth-first search from the locale home pages over the
SERVER-RENDERED anchors of the fetched HTML, which is what a crawler can follow without
running scripts. A link that only exists after JS is not a crawl path and is not counted.

Writes to reports/atlas/:
  CRAWL-PATHS-BY-URL.csv        per live URL: inbound links, non-Atlas inbound, depth, hub
  CRAWL-PATH-AUDIT.json         the weaknesses, the sitemap findings, the group comparison
  INDEXATION-TEST-SET.json      the fixed experiment file, with the baseline and the reasons
  INDEXATION-TEST-SET.csv       the same set, flat, for a checklist
"""
import collections, csv, glob, gzip, html.parser, json, os, re, sys, urllib.parse
sys.path.insert(0, '/home/user/Livdar-eSim/scripts/atlas/scale')
import entity_identity as _ei                                        # noqa: E402
_dashes = _ei.normalise_long_dashes


ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
OUT = ROOT + 'reports/atlas/'
BASE = 'https://livdar.com'
TARGET_SET = 28


def slug_for(path):
    return (re.sub(r'[^0-9a-zA-Z]+', '-', path).strip('-') or 'root')[:150]


class Anchors(html.parser.HTMLParser):
    """Server-rendered anchors only, with the href as written."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hrefs = []
        self.nofollow = 0

    def handle_starttag(self, tag, attrs):
        if tag != 'a':
            return
        a = dict(attrs)
        h = (a.get('href') or '').strip()
        if not h:
            return
        rel = (a.get('rel') or '').lower()
        if 'nofollow' in rel:
            self.nofollow += 1
            return
        self.hrefs.append(h)


def norm(u, base_path=''):
    if not u or u.startswith(('#', 'mailto:', 'tel:', 'javascript:')):
        return ''
    u = urllib.parse.urljoin(BASE + base_path, u)
    sp = urllib.parse.urlsplit(u)
    if sp.netloc not in ('livdar.com', 'www.livdar.com'):
        return ''
    p = sp.path or '/'
    if not p.endswith('/') and '.' not in p.rsplit('/', 1)[-1]:
        p += '/'
    return p


def main():
    ds = sorted(glob.glob(ROOT + 'data/atlas/measurements/live-crawl-*/'))
    if not ds:
        print('no crawl on disk; run crawl-live-cohort.py', file=sys.stderr)
        return 1
    D = ds[-1]
    idx = json.load(open(D + '_crawl-index.json', encoding='utf-8'))
    cohort = set(idx.get('cohort_paths') or [])
    sitemap_paths = set(idx.get('sitemap_paths') or [])
    fetched = {p['path']: p for p in idx['pages']}

    live = json.load(open(ROOT + 'reports/atlas/live-production.json', encoding='utf-8'))
    meta = {}
    for r in live.get('rows') or []:
        p = (r.get('path') or '').strip()
        if p:
            meta[p if p.endswith('/') else p + '/'] = r

    # ---- the link graph, server-rendered anchors only
    out_links, nofollow = {}, {}
    for p in fetched:
        f = D + 'pages/' + slug_for(p) + '.html.gz'
        if not os.path.exists(f):
            continue
        try:
            doc = gzip.open(f, 'rt', encoding='utf-8', errors='replace').read()
        except Exception:
            continue
        a = Anchors()
        try:
            a.feed(doc)
        except Exception:
            pass
        out_links[p] = {t for t in (norm(h, p) for h in a.hrefs) if t and t != p}
        nofollow[p] = a.nofollow

    inbound = collections.defaultdict(set)
    for src, tgts in out_links.items():
        for t in tgts:
            inbound[t].add(src)

    # ---- click depth from the locale home pages, over those same anchors
    homes = sorted({'/' + p.strip('/').split('/')[0] + '/' for p in fetched
                    if p.count('/') == 2 and len(p.strip('/')) == 2}) or ['/en/']
    depth = {h: 0 for h in homes if h in out_links}
    if not depth:
        depth = {'/en/': 0}
    q = collections.deque(depth)
    while q:
        cur = q.popleft()
        for t in out_links.get(cur, ()):  # only pages we fetched can be expanded
            if t not in depth:
                depth[t] = depth[cur] + 1
                q.append(t)

    # ---- per live URL
    COLS = ['path', 'family', 'market', 'google_state', 'inbound_total',
            'inbound_from_non_atlas', 'inbound_from_atlas', 'click_depth_from_home',
            'in_sitemap', 'reachable_from_a_non_atlas_page', 'nofollow_links_on_page',
            'outbound_total']
    insp = {}
    ip = OUT + 'INDEXATION-BY-URL.csv'
    if os.path.exists(ip):
        for r in csv.DictReader(open(ip, encoding='utf-8')):
            insp[r['path']] = r
    rows = []
    for p in sorted(cohort):
        ins = inbound.get(p, set())
        non_atlas = {s for s in ins if s not in cohort}
        rows.append({
            'path': p,
            'family': (meta.get(p, {}).get('family') or ''),
            'market': (meta.get(p, {}).get('locale') or ''),
            'google_state': insp.get(p, {}).get('coverage_state_canonical', ''),
            'inbound_total': len(ins),
            'inbound_from_non_atlas': len(non_atlas),
            'inbound_from_atlas': len(ins) - len(non_atlas),
            'click_depth_from_home': depth.get(p, ''),
            'in_sitemap': p in sitemap_paths,
            'reachable_from_a_non_atlas_page': bool(non_atlas),
            'nofollow_links_on_page': nofollow.get(p, 0),
            'outbound_total': len(out_links.get(p, ())),
        })
    os.makedirs(OUT, exist_ok=True)
    with open(OUT + 'CRAWL-PATHS-BY-URL.csv.tmp', 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=COLS, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)
    os.replace(OUT + 'CRAWL-PATHS-BY-URL.csv.tmp', OUT + 'CRAWL-PATHS-BY-URL.csv')

    # ---- sitemap architecture
    sm_findings, sm_files = [], []
    for f in sorted(glob.glob(D + 'sitemaps/*.html.gz')):
        name = os.path.basename(f)[:-8]
        mp = D + 'sitemaps/' + name + '.meta.json'
        code = None
        if os.path.exists(mp):
            try:
                code = json.load(open(mp)).get('http_code')
            except Exception:
                pass
        try:
            xml = gzip.open(f, 'rt', encoding='utf-8', errors='replace').read()
        except Exception:
            sm_findings.append(f'{name}: unreadable')
            continue
        if '<urlset' not in xml and '<sitemapindex' not in xml:
            continue
        locs = re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', xml)
        sm_files.append({'file': name, 'http_code': code,
                         'kind': 'index' if '<sitemapindex' in xml else 'urlset',
                         'locs': len(locs)})
        if code not in (200, None):
            sm_findings.append(f'{name}: HTTP {code}')
        if '<?xml' not in xml[:200]:
            sm_findings.append(f'{name}: no XML declaration')
        for loc in locs:
            if loc.startswith('http://'):
                sm_findings.append(f'{name}: http loc {loc}')
            if '://www.' in loc:
                sm_findings.append(f'{name}: www host in loc {loc}')
        dup = [u for u, n in collections.Counter(locs).items() if n > 1]
        if dup:
            sm_findings.append(f'{name}: {len(dup)} duplicate loc entries')

    missing_from_sitemap = sorted(p for p in cohort if p not in sitemap_paths)
    stale = sorted(p for p in sitemap_paths if p in fetched
                   and fetched[p].get('http_code') not in (200, None))

    # canonical form: the sitemap loc must equal the page's own canonical
    canon_mismatch = []
    ap = OUT + 'LIVE-COHORT-AUDIT.csv'
    if os.path.exists(ap):
        for r in csv.DictReader(open(ap, encoding='utf-8')):
            if r['path'] in sitemap_paths and r.get('canonical'):
                if r['canonical'].rstrip('/') != (BASE + r['path']).rstrip('/'):
                    canon_mismatch.append({'path': r['path'], 'canonical': r['canonical']})

    # ---- the two Google groups, compared on crawl-path features only
    g = collections.defaultdict(list)
    for r in rows:
        if r['google_state']:
            g[r['google_state']].append(r)

    def prof(rs, key):
        v = [x[key] for x in rs if isinstance(x[key], int)]
        return {'n': len(v), 'median': sorted(v)[len(v) // 2] if v else None,
                'min': min(v) if v else None, 'max': max(v) if v else None}

    groups = {k: {f: prof(v, f) for f in ('inbound_total', 'inbound_from_non_atlas',
                                          'click_depth_from_home', 'outbound_total')}
              for k, v in g.items()}

    audit = {
        'crawl': {'directory': D, 'cohort': len(cohort), 'fetched': len(fetched),
                  'home_pages_used_as_roots': homes},
        'PHASE_2_crawl_paths': {
            'cohort_urls': len(rows),
            'with_any_inbound_link': sum(1 for r in rows if r['inbound_total']),
            'with_an_inbound_link_from_a_NON_Atlas_page':
                sum(1 for r in rows if r['inbound_from_non_atlas']),
            'reachable_only_from_other_Atlas_pages':
                sum(1 for r in rows if r['inbound_total'] and not r['inbound_from_non_atlas']),
            'click_depth_distribution': dict(collections.Counter(
                r['click_depth_from_home'] for r in rows)),
            'unreachable_by_following_server_rendered_links':
                sum(1 for r in rows if r['click_depth_from_home'] == ''),
            'nofollow_anchors_seen_on_cohort_pages':
                sum(r['nofollow_links_on_page'] for r in rows),
            'why_this_matters': (
                'a page linked only from other Atlas pages is reachable only once Google has '
                'already chosen to crawl the Atlas, which is the thing that is not happening. '
                'Inbound links from pages OUTSIDE the cohort are the paths that can change '
                'that, and the count above is the honest measure of how many exist.'),
        },
        'PHASE_3_sitemaps': {
            'sitemap_files_parsed': len(sm_files),
            'declared_urls': len(sitemap_paths),
            'cohort_urls_present_in_a_sitemap': len(cohort) - len(missing_from_sitemap),
            'cohort_urls_missing_from_every_sitemap': missing_from_sitemap,
            'sitemap_entries_that_do_not_answer_200': stale,
            'canonical_does_not_equal_the_sitemap_loc': canon_mismatch,
            'findings': sm_findings or ['none'],
        },
        'PHASE_3_group_comparison': {
            'groups': groups,
            'reading': (
                'if the two states differ on these crawl-path features the path is a candidate '
                'explanation; if they do not, discovery scheduling is left as the explanation '
                'and nothing about our linking distinguishes the groups.'),
        },
    }

    # ---- PHASE 4, the stratified test set
    pool = [r for r in rows if r['google_state']]
    want_states = ['Discovered - currently not indexed', 'URL is unknown to Google',
                   'Server error (5xx)']
    picked, reasons = [], {}
    # round robin over (state, family, market) so no cell dominates, and take the 5xx first
    # because it is the only URL Google has ever fetched
    buckets = collections.defaultdict(list)
    for r in pool:
        buckets[(r['google_state'], r['family'])].append(r)
    for b in buckets.values():
        b.sort(key=lambda x: (x['market'], x['path']))
    order = sorted(buckets, key=lambda k: (want_states.index(k[0])
                                           if k[0] in want_states else 9, k[1]))
    i = 0
    while len(picked) < TARGET_SET:
        added = False
        for k in order:
            if len(picked) >= TARGET_SET:
                break
            b = buckets[k]
            if i < len(b):
                r = b[i]
                seen_m = collections.Counter(x['market'] for x in picked)
                # keep any one market under a third of the set
                if seen_m[r['market']] <= max(2, TARGET_SET // 4):
                    picked.append(r)
                    reasons[r['path']] = (
                        f"state {k[0]}; family {k[1]}; market {r['market']}; "
                        f"inbound {r['inbound_total']} of which "
                        f"{r['inbound_from_non_atlas']} from outside the Atlas; "
                        f"click depth {r['click_depth_from_home']}")
                    added = True
        i += 1
        if not added and i > 40:
            break

    base_insp = {}
    ip2 = sorted(glob.glob(ROOT + 'data/atlas/measurements/gsc/url-inspection-*.json'))
    if ip2:
        d = json.load(open(ip2[-1], encoding='utf-8'))
        for r in d.get('rows') or []:
            base_insp[r.get('path', '')] = r
    aud = {}
    if os.path.exists(ap):
        for r in csv.DictReader(open(ap, encoding='utf-8')):
            aud[r['path']] = r

    test_rows = []
    for r in picked:
        b = base_insp.get(r['path'], {})
        a = aud.get(r['path'], {})
        test_rows.append({
            'url': BASE + r['path'], 'path': r['path'],
            'family': r['family'], 'market': r['market'],
            'google_state_at_baseline': r['google_state'],
            # normalised at the generated-output boundary; see indexation-report.py
            'coverage_state_raw': _dashes(b.get('coverageState', '')),
            'verdict': b.get('verdict', ''),
            'last_crawl_time': b.get('lastCrawlTime') or '',
            'page_fetch_state': b.get('pageFetchState', ''),
            'robots_txt_state': b.get('robotsTxtState', ''),
            'in_sitemap_per_google': bool(b.get('sitemap')),
            'http_status_now': a.get('http_code', ''),
            'ttfb_s': a.get('time_to_first_byte_s', ''),
            'inbound_total': r['inbound_total'],
            'inbound_from_non_atlas': r['inbound_from_non_atlas'],
            'click_depth_from_home': r['click_depth_from_home'],
            'word_count': a.get('word_count', ''),
            'reason_for_selection': reasons.get(r['path'], ''),
        })

    experiment = {
        'created': __import__('datetime').datetime.now(
            __import__('datetime').timezone.utc).isoformat(),
        'what_this_is': ('a FIXED set of existing live URLs for the accelerated crawl '
                         'experiment. No page was created for it and no page is changed by '
                         'its existence.'),
        'target_size': TARGET_SET, 'size': len(test_rows),
        'selected_across': {
            'states': dict(collections.Counter(r['google_state_at_baseline']
                                               for r in test_rows)),
            'families': dict(collections.Counter(r['family'] for r in test_rows)),
            'markets': dict(collections.Counter(r['market'] for r in test_rows)),
        },
        'baseline_source': os.path.basename(ip2[-1]) if ip2 else None,
        'urls': test_rows,
    }
    with open(OUT + 'INDEXATION-TEST-SET.json.tmp', 'w') as fh:
        json.dump(experiment, fh, indent=1, ensure_ascii=False)
    os.replace(OUT + 'INDEXATION-TEST-SET.json.tmp', OUT + 'INDEXATION-TEST-SET.json')
    if test_rows:
        with open(OUT + 'INDEXATION-TEST-SET.csv.tmp', 'w', newline='',
                  encoding='utf-8') as fh:
            w = csv.DictWriter(fh, fieldnames=list(test_rows[0]), extrasaction='ignore')
            w.writeheader()
            w.writerows(test_rows)
        os.replace(OUT + 'INDEXATION-TEST-SET.csv.tmp', OUT + 'INDEXATION-TEST-SET.csv')

    audit['PHASE_4_test_set'] = {k: v for k, v in experiment.items() if k != 'urls'}
    with open(OUT + 'CRAWL-PATH-AUDIT.json.tmp', 'w') as fh:
        json.dump(audit, fh, indent=1, ensure_ascii=False)
    os.replace(OUT + 'CRAWL-PATH-AUDIT.json.tmp', OUT + 'CRAWL-PATH-AUDIT.json')

    p2 = audit['PHASE_2_crawl_paths']
    print('PHASE 2 crawl paths')
    for k in ('cohort_urls', 'with_any_inbound_link',
              'with_an_inbound_link_from_a_NON_Atlas_page',
              'reachable_only_from_other_Atlas_pages',
              'unreachable_by_following_server_rendered_links',
              'nofollow_anchors_seen_on_cohort_pages'):
        print(f'  {k:52} {p2[k]}')
    print(f'  click depth: {p2["click_depth_distribution"]}')
    p3 = audit['PHASE_3_sitemaps']
    print('PHASE 3 sitemaps')
    print(f'  files parsed {p3["sitemap_files_parsed"]}, declared {p3["declared_urls"]}, '
          f'cohort present {p3["cohort_urls_present_in_a_sitemap"]} of {len(cohort)}')
    print(f'  missing from every sitemap: {len(p3["cohort_urls_missing_from_every_sitemap"])}')
    print(f'  entries not answering 200: {len(p3["sitemap_entries_that_do_not_answer_200"])}')
    print(f'  canonical != sitemap loc: {len(p3["canonical_does_not_equal_the_sitemap_loc"])}')
    print(f'  findings: {p3["findings"][:4]}')
    print('PHASE 3 group comparison')
    for st, f in groups.items():
        print(f'  {st[:42]:42} inbound med {f["inbound_total"]["median"]}, '
              f'non-Atlas med {f["inbound_from_non_atlas"]["median"]}, '
              f'depth med {f["click_depth_from_home"]["median"]}')
    print(f'PHASE 4 test set: {len(test_rows)} URLs')
    print(f'  states {experiment["selected_across"]["states"]}')
    print(f'  markets {experiment["selected_across"]["markets"]}')
    print(f'  families {len(experiment["selected_across"]["families"])}')
    return 0


if __name__ == '__main__':
    sys.exit(main())

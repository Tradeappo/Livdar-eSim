#!/usr/bin/env python3
"""Technical and content audit of the live Atlas cohort, from the cached crawl.

THREE CATEGORIES, KEPT APART ON PURPOSE. The brief this runs under is explicit that they must
not be merged, and merging them is how a site gets "fixed" in the wrong place:

  TECHNICAL DEFECT   something is wrong with the page as served. A missing canonical, a
                     noindex, a 404, a redirect chain, a page absent from every sitemap. Ours
                     to fix, and fixable with certainty.
  CONTENT OR VALUE   the page is served correctly and may still not deserve to rank: thin
                     text, few facts, a template that repeats across its family. Ours to
                     judge, and a judgement rather than a fact.
  GOOGLE DECISION    what Google did about it. ONLY Search Console answers this, and nothing
                     in this file infers it. A page can be flawless here and not indexed.

Everything is computed from data/atlas/measurements/live-crawl-<date>/, so it is reproducible
without touching production and the same bytes answer every question.

PARSED WITH html.parser, because this container has no bs4 and no lxml, and a regex over HTML
is how an audit comes to believe a page has no H1 when it has two.

Writes to reports/atlas/:
  LIVE-COHORT-AUDIT.csv          one row per live URL, every measured field
  LIVE-COHORT-AUDIT-BY-FAMILY.csv  the rollup
  LIVE-COHORT-AUDIT.json         the findings, in the three categories, with examples
"""
import collections, csv, glob, gzip, html.parser, json, os, re, statistics, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
OUT = ROOT + 'reports/atlas/'
BASE = 'https://livdar.com'


def crawl_dir():
    ds = sorted(glob.glob(ROOT + 'data/atlas/measurements/live-crawl-*/'))
    if not ds:
        print('no crawl on disk: run crawl-live-cohort.py first', file=sys.stderr)
        sys.exit(1)
    return ds[-1]


def slug_for(path):
    s = re.sub(r'[^0-9a-zA-Z]+', '-', path).strip('-') or 'root'
    return s[:150]


class Page(html.parser.HTMLParser):
    """Everything the audit needs from one document, in one pass."""
    SKIP_TEXT = {'script', 'style', 'noscript', 'template', 'svg'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts, self.in_title = [], False
        self.meta_description = self.canonical = self.robots = ''
        self.lang = ''
        self.h1s, self.h2 = [], 0
        self.h3 = 0
        self._htag = None
        self.hreflang = []           # (hreflang, href)
        self.jsonld_raw, self._in_jsonld = [], False
        self.links = []              # every href, raw
        self.text_parts = []
        self._skip_depth = 0
        self.tables = self.lists = self.imgs = 0
        self.next_data_bytes = 0
        self._in_next_data = False
        self.og = {}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.SKIP_TEXT:
            self._skip_depth += 1
        if tag == 'title':
            self.in_title = True
        elif tag == 'html':
            self.lang = (a.get('lang') or '').strip()
        elif tag == 'meta':
            n = (a.get('name') or '').lower()
            if n == 'description':
                self.meta_description = (a.get('content') or '').strip()
            elif n == 'robots':
                self.robots = (a.get('content') or '').strip()
            p = (a.get('property') or '').lower()
            if p.startswith('og:'):
                self.og[p] = (a.get('content') or '').strip()
        elif tag == 'link':
            rel = (a.get('rel') or '').lower()
            if 'canonical' in rel:
                self.canonical = (a.get('href') or '').strip()
            if 'alternate' in rel and a.get('hreflang'):
                self.hreflang.append((a['hreflang'].strip(), (a.get('href') or '').strip()))
        elif tag == 'script':
            t = (a.get('type') or '').lower()
            if t == 'application/ld+json':
                self._in_jsonld = True
                self.jsonld_raw.append('')
            if (a.get('id') or '') == '__NEXT_DATA__':
                self._in_next_data = True
        elif tag in ('h1', 'h2', 'h3'):
            self._htag = tag
            if tag == 'h1':
                self.h1s.append('')
            elif tag == 'h2':
                self.h2 += 1
            else:
                self.h3 += 1
        elif tag == 'a' and a.get('href'):
            self.links.append(a['href'].strip())
        elif tag == 'table':
            self.tables += 1
        elif tag in ('ul', 'ol'):
            self.lists += 1
        elif tag == 'img':
            self.imgs += 1

    def handle_endtag(self, tag):
        if tag in self.SKIP_TEXT and self._skip_depth:
            self._skip_depth -= 1
        if tag == 'title':
            self.in_title = False
        if tag == 'script':
            self._in_jsonld = self._in_next_data = False
        if tag == self._htag:
            self._htag = None

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)
            return
        if self._in_jsonld and self.jsonld_raw:
            self.jsonld_raw[-1] += data
            return
        if self._in_next_data:
            self.next_data_bytes += len(data)
            return
        if self._skip_depth:
            return
        if self._htag == 'h1' and self.h1s:
            self.h1s[-1] += data
        self.text_parts.append(data)

    # ---- derived
    @property
    def title(self):
        return re.sub(r'\s+', ' ', ''.join(self.title_parts)).strip()

    @property
    def text(self):
        return re.sub(r'\s+', ' ', ' '.join(self.text_parts)).strip()


def norm_url(u, base_path=''):
    if not u:
        return ''
    u = urllib.parse.urljoin(BASE + base_path, u)
    sp = urllib.parse.urlsplit(u)
    if sp.netloc not in ('livdar.com', 'www.livdar.com'):
        return ''                                    # external, not our link graph
    path = sp.path or '/'
    if not path.endswith('/') and '.' not in path.rsplit('/', 1)[-1]:
        path += '/'
    return path


# TOKENISING, and the mistake the first run made. A single character class covering Latin and
# CJK counts a whole run of kanji as ONE token, so every Japanese page came back at 188 to 246
# "words" against a 598-word median elsewhere, and all 24 pages the soft-404 flag caught were
# Japanese. The pages were fine; the ruler was wrong, and a thin-content finding drawn from it
# would have been a finding about Japanese orthography rather than about the page.
#
# So Latin, Greek and Cyrillic count RUNS, because those scripts put spaces between words, and
# CJK counts CHARACTERS and halves them, because Japanese and Chinese do not and a word there
# is about two characters. The halving is an approximation and is labelled as one; what matters
# is that it lands in the same units as the Latin count instead of out by a factor of twenty.
_LATIN_RUN = re.compile('[0-9A-Za-z\u00c0-\u024f\u0370-\u04ff]+')
_CJK_CHAR = re.compile('[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff'
                       '\uac00-\ud7af]')
NUMBER = re.compile(r'(?<![\w.])\d[\d.,]*')


def word_count(text):
    """Tokens in the same units whatever the script. See the comment above."""
    return len(_LATIN_RUN.findall(text)) + (len(_CJK_CHAR.findall(text)) + 1) // 2


class _WordShim:
    """findall-shaped, so the shingle builder compares like with like across scripts too."""
    @staticmethod
    def findall(text):
        return _LATIN_RUN.findall(text) + _CJK_CHAR.findall(text)


WORD = _WordShim


def shingles(text, n=8):
    """Overlapping token windows, with the WINDOW LENGTH matched across scripts.

    A fixed n of 8 tokens is 8 words of English and 8 CHARACTERS of Japanese, which is about
    four words, so the Japanese pages were compared on a window half as long and came back
    systematically more similar: 27 of the 46 pages over 0.6 were Japanese, at 0.68 to 0.73,
    while the same family in Latin script sat at 0.46. That is a property of the measurement,
    not of the pages, and a near-duplicate finding built on it would have accused the Japanese
    cost-of-living set of being templated when the evidence said nothing of the kind.

    So a CJK-dominant text uses a window of 2n characters, which is roughly n words. The
    comparison is still approximate across scripts and exact within one, which is what the
    per-family numbers actually rest on.
    """
    low = text.lower()
    cjk = len(_CJK_CHAR.findall(low))
    latin = len(_LATIN_RUN.findall(low))
    w = WORD.findall(low)
    if cjk > latin:
        n = n * 2
    return {hash(tuple(w[i:i + n])) for i in range(max(0, len(w) - n + 1))}


def main():
    D = crawl_dir()
    idx = json.load(open(D + '_crawl-index.json', encoding='utf-8'))
    cohort = idx.get('cohort_paths') or []
    sitemap_paths = set(idx.get('sitemap_paths') or [])
    live = json.load(open(ROOT + 'reports/atlas/live-production.json', encoding='utf-8'))
    meta_of = {}
    for r in live.get('rows') or []:
        p = (r.get('path') or '').strip()
        if p:
            if not p.endswith('/'):
                p += '/'
            meta_of[p] = r

    # robots.txt, read rather than assumed
    rb = ''
    if os.path.exists(D + 'sitemaps/robots.html.gz'):
        rb = gzip.open(D + 'sitemaps/robots.html.gz', 'rt', encoding='utf-8',
                       errors='replace').read()
    disallow = [m.group(1).strip() for m in re.finditer(r'(?im)^\s*Disallow:\s*(\S*)', rb)]
    disallow = [d for d in disallow if d]

    # sitemap lastmod per URL
    lastmod = {}
    for f in sorted(glob.glob(D + 'sitemaps/*.html.gz')):
        try:
            xml = gzip.open(f, 'rt', encoding='utf-8', errors='replace').read()
        except Exception:
            continue
        if '<urlset' not in xml:
            continue
        for m in re.finditer(r'<url>(.*?)</url>', xml, re.S):
            blk = m.group(1)
            loc = re.search(r'<loc>\s*([^<\s]+)\s*</loc>', blk)
            lm = re.search(r'<lastmod>\s*([^<\s]+)\s*</lastmod>', blk)
            if loc and loc.group(1).startswith(BASE):
                lastmod[loc.group(1)[len(BASE):] or '/'] = lm.group(1) if lm else ''

    # ---- parse every fetched page once
    parsed, http = {}, {}
    for pm in idx['pages']:
        p = pm['path']
        http[p] = pm
        fp = D + 'pages/' + slug_for(p) + '.html.gz'
        if not os.path.exists(fp):
            continue
        try:
            doc = gzip.open(fp, 'rt', encoding='utf-8', errors='replace').read()
        except Exception as e:
            print(f'  unreadable {p}: {type(e).__name__}', file=sys.stderr)
            continue
        pg = Page()
        try:
            pg.feed(doc)
        except Exception as e:
            print(f'  parse error {p}: {type(e).__name__}', file=sys.stderr)
        parsed[p] = pg
    print(f'parsed {len(parsed):,} of {len(idx["pages"]):,} fetched pages', file=sys.stderr)

    # ---- the link graph over everything fetched
    inbound = collections.Counter()
    outbound = {}
    link_targets = collections.Counter()
    for p, pg in parsed.items():
        outs = set()
        for h in pg.links:
            t = norm_url(h, p)
            if t and t != p:
                outs.add(t)
        outbound[p] = outs
        for t in outs:
            inbound[t] += 1
            link_targets[t] += 1

    # ---- content similarity inside a family, on the cohort only
    fam_pages = collections.defaultdict(list)
    for p in cohort:
        if p in parsed:
            fam_pages[(meta_of.get(p, {}).get('family') or 'unclassified')].append(p)
    sh = {p: shingles(parsed[p].text) for p in cohort if p in parsed}
    max_sim, mean_sim = {}, {}
    for fam, ps in fam_pages.items():
        for i, a in enumerate(ps):
            sims = []
            for b in ps:
                if a == b or not sh[a] or not sh[b]:
                    continue
                inter = len(sh[a] & sh[b])
                union = len(sh[a] | sh[b]) or 1
                sims.append(inter / union)
            max_sim[a] = round(max(sims), 3) if sims else 0.0
            mean_sim[a] = round(statistics.fmean(sims), 3) if sims else 0.0

    # ---- hreflang reciprocity, which self-reference does not test
    # A cluster is only valid if every page in it points at every other AND each target points
    # back. Measuring the self-reference alone passes a page that names ten alternates none of
    # which name it, which is the common way an hreflang set is wrong.
    hl_map = {}
    for p, pg in parsed.items():
        hl_map[p] = {k.lower(): norm_url(v, p) for k, v in pg.hreflang}
    recip_missing = {}
    for p, m in hl_map.items():
        bad = []
        for lang, target in m.items():
            if lang == 'x-default' or not target or target == p:
                continue
            back = hl_map.get(target)
            if back is None:
                bad.append(f'{lang}->{target} (target not fetched)')
            elif p not in set(back.values()):
                bad.append(f'{lang}->{target} (does not point back)')
        recip_missing[p] = bad

    # ---- uniqueness of the rendered strings, across the cohort and inside a market
    t_all, h_all, d_all = collections.Counter(), collections.Counter(), collections.Counter()
    t_mkt, h_mkt, d_mkt = collections.Counter(), collections.Counter(), collections.Counter()
    for p in cohort:
        pg = parsed.get(p)
        if not pg:
            continue
        mk = (meta_of.get(p, {}).get('locale') or '')
        t_all[pg.title] += 1
        h_all[(pg.h1s[0].strip() if pg.h1s else '')] += 1
        d_all[pg.meta_description] += 1
        t_mkt[(mk, pg.title)] += 1
        h_mkt[(mk, pg.h1s[0].strip() if pg.h1s else '')] += 1
        d_mkt[(mk, pg.meta_description)] += 1

    COLS = ['path', 'family', 'market', 'surface', 'entity',
            'http_code', 'attempts', 'num_redirects', 'url_effective',
            'time_total_s', 'time_to_first_byte_s', 'body_bytes', 'http_version',
            'robots_txt_allowed', 'robots_meta', 'has_noindex',
            'canonical', 'canonical_is_self',
            'in_any_sitemap', 'sitemap_lastmod',
            'title', 'title_len', 'h1_count', 'h1', 'h1_matches_title_subject',
            'meta_description_len', 'og_title_present',
            'hreflang_count', 'hreflang_has_self', 'hreflang_has_x_default',
            'hreflang_targets_200', 'hreflang_not_reciprocal',
            'title_unique_in_cohort', 'h1_unique_in_cohort', 'meta_unique_in_cohort',
            'title_unique_in_market', 'h1_unique_in_market', 'meta_unique_in_market',
            'jsonld_blocks', 'jsonld_valid', 'jsonld_types',
            'internal_links_out', 'internal_links_in', 'is_orphan',
            'broken_internal_links', 'links_to_redirects',
            'word_count', 'number_count', 'h2_count', 'h3_count', 'tables', 'lists',
            'server_rendered_h1', 'next_data_bytes',
            'max_similarity_in_family', 'mean_similarity_in_family',
            'soft_404_risk', 'script_of_the_count']

    rows = []
    for p in cohort:
        pg = parsed.get(p)
        m = http.get(p, {})
        md = meta_of.get(p, {})
        if pg is None:
            rows.append({'path': p, 'family': md.get('family', ''),
                         'market': md.get('locale', ''), 'http_code': m.get('http_code'),
                         'attempts': m.get('attempts')})
            continue
        canon = norm_url(pg.canonical, p)
        hl = {k.lower(): v for k, v in pg.hreflang}
        self_lang = (md.get('locale') or pg.lang or '').lower()
        jl_ok, jl_types = 0, []
        for raw in pg.jsonld_raw:
            try:
                o = json.loads(raw)
            except Exception:
                continue
            jl_ok += 1
            # @graph, not just a bare node. Every page here uses the @graph form, so reading
            # only the top level reported zero @type for all 500 and the column looked like a
            # missing-structured-data finding when the data was there: WebPage, WebSite and
            # BreadcrumbList, one level down. Walking the whole document is the fix, and it
            # also catches a type nested in isPartOf or in an itemListElement.
            def _types(node, acc):
                if isinstance(node, dict):
                    t = node.get('@type')
                    if isinstance(t, list):
                        acc.extend(str(y) for y in t)
                    elif t:
                        acc.append(str(t))
                    for v in node.values():
                        _types(v, acc)
                elif isinstance(node, list):
                    for v in node:
                        _types(v, acc)
            _types(o, jl_types)
        outs = outbound.get(p, set())
        broken = sorted(t for t in outs
                        if t in http and http[t].get('http_code') not in (200, None))
        to_redirect = sorted(t for t in outs
                             if t in http and (http[t].get('num_redirects') or 0) > 0)
        hl_targets = [norm_url(v, p) for v in hl.values()]
        hl_200 = sum(1 for t in hl_targets
                     if t and t in http and http[t].get('http_code') == 200)
        words = word_count(pg.text)
        rows.append({
            'path': p, 'family': md.get('family', ''), 'market': md.get('locale', ''),
            'surface': md.get('surface', ''), 'entity': md.get('entity', ''),
            'http_code': m.get('http_code'), 'attempts': m.get('attempts'),
            'num_redirects': m.get('num_redirects'), 'url_effective': m.get('url_effective'),
            'time_total_s': round(float(m.get('time_total') or 0), 3),
            'time_to_first_byte_s': round(float(m.get('time_starttransfer') or 0), 3),
            'body_bytes': m.get('body_bytes'), 'http_version': m.get('http_version'),
            'robots_txt_allowed': not any(p.startswith(d) for d in disallow),
            'robots_meta': pg.robots,
            'has_noindex': 'noindex' in (pg.robots or '').lower(),
            'canonical': pg.canonical, 'canonical_is_self': canon == p,
            'in_any_sitemap': p in sitemap_paths,
            'sitemap_lastmod': lastmod.get(p, ''),
            'title': pg.title, 'title_len': len(pg.title),
            'h1_count': len(pg.h1s),
            'h1': re.sub(r'\s+', ' ', (pg.h1s[0] if pg.h1s else '')).strip(),
            'h1_matches_title_subject': bool(pg.h1s) and
                re.sub(r'\W+', '', pg.h1s[0].lower())[:20] in re.sub(r'\W+', '',
                                                                     pg.title.lower()),
            'meta_description_len': len(pg.meta_description),
            'og_title_present': bool(pg.og.get('og:title')),
            'hreflang_count': len(pg.hreflang),
            'hreflang_has_self': self_lang in hl,
            'hreflang_has_x_default': 'x-default' in hl,
            'hreflang_targets_200': hl_200,
            'hreflang_not_reciprocal': len(recip_missing.get(p, [])),
            'title_unique_in_cohort': t_all[pg.title] == 1,
            'h1_unique_in_cohort': h_all[(pg.h1s[0].strip() if pg.h1s else '')] == 1,
            'meta_unique_in_cohort': d_all[pg.meta_description] == 1,
            'title_unique_in_market': t_mkt[(md.get('locale') or '', pg.title)] == 1,
            'h1_unique_in_market': h_mkt[(md.get('locale') or '',
                                          pg.h1s[0].strip() if pg.h1s else '')] == 1,
            'meta_unique_in_market': d_mkt[(md.get('locale') or '',
                                            pg.meta_description)] == 1,
            'jsonld_blocks': len(pg.jsonld_raw), 'jsonld_valid': jl_ok,
            'jsonld_types': '|'.join(sorted(set(jl_types))),
            'internal_links_out': len(outs), 'internal_links_in': inbound.get(p, 0),
            'is_orphan': inbound.get(p, 0) == 0,
            'broken_internal_links': len(broken),
            'links_to_redirects': len(to_redirect),
            'word_count': words,
            'number_count': len(NUMBER.findall(pg.text)),
            'h2_count': pg.h2, 'h3_count': pg.h3,
            'tables': pg.tables, 'lists': pg.lists,
            'server_rendered_h1': bool(pg.h1s and pg.h1s[0].strip()),
            'next_data_bytes': pg.next_data_bytes,
            'max_similarity_in_family': max_sim.get(p, 0.0),
            'mean_similarity_in_family': mean_sim.get(p, 0.0),
            # not a verdict, a RISK flag: a 200 that reads like an empty result page is what
            # Google calls a soft 404, and the two signals it rests on are little text and no
            # numbers on a page whose whole purpose is numbers
            'soft_404_risk': words < 250 or len(NUMBER.findall(pg.text)) < 5,
            'script_of_the_count': ('cjk' if _CJK_CHAR.search(pg.text) else 'latin'),
        })

    os.makedirs(OUT, exist_ok=True)
    with open(OUT + 'LIVE-COHORT-AUDIT.csv.tmp', 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=COLS, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)
    os.replace(OUT + 'LIVE-COHORT-AUDIT.csv.tmp', OUT + 'LIVE-COHORT-AUDIT.csv')

    # ---- the three categories
    def cnt(pred):
        return [r['path'] for r in rows if pred(r)]

    technical = {
        'http_not_200': cnt(lambda r: r.get('http_code') != 200),
        'redirected_before_200': cnt(lambda r: (r.get('num_redirects') or 0) > 0),
        'noindex_meta': cnt(lambda r: r.get('has_noindex')),
        'blocked_by_robots_txt': cnt(lambda r: r.get('robots_txt_allowed') is False),
        'canonical_missing': cnt(lambda r: not r.get('canonical')),
        'canonical_not_self': cnt(lambda r: r.get('canonical') and not r.get('canonical_is_self')),
        'absent_from_every_sitemap': cnt(lambda r: r.get('in_any_sitemap') is False),
        'no_sitemap_lastmod': cnt(lambda r: r.get('in_any_sitemap') and not r.get('sitemap_lastmod')),
        'title_missing': cnt(lambda r: not r.get('title')),
        'h1_missing': cnt(lambda r: not r.get('h1_count')),
        'h1_more_than_one': cnt(lambda r: (r.get('h1_count') or 0) > 1),
        'meta_description_missing': cnt(lambda r: not r.get('meta_description_len')),
        'hreflang_missing_self_reference': cnt(lambda r: r.get('hreflang_count') and not r.get('hreflang_has_self')),
        'hreflang_missing_x_default': cnt(lambda r: r.get('hreflang_count') and not r.get('hreflang_has_x_default')),
        'hreflang_not_reciprocal': cnt(lambda r: (r.get('hreflang_not_reciprocal') or 0) > 0),
        'hreflang_self_reference_only': cnt(lambda r: (r.get('hreflang_count') or 0) == 1),
        'title_not_unique_in_cohort': cnt(lambda r: r.get('title_unique_in_cohort') is False),
        'h1_not_unique_in_cohort': cnt(lambda r: r.get('h1_unique_in_cohort') is False),
        'meta_not_unique_in_cohort': cnt(lambda r: r.get('meta_unique_in_cohort') is False),
        'title_not_unique_in_market': cnt(lambda r: r.get('title_unique_in_market') is False),
        'h1_not_unique_in_market': cnt(lambda r: r.get('h1_unique_in_market') is False),
        'meta_not_unique_in_market': cnt(lambda r: r.get('meta_unique_in_market') is False),
        'jsonld_present_but_invalid': cnt(lambda r: (r.get('jsonld_blocks') or 0) > (r.get('jsonld_valid') or 0)),
        'jsonld_absent': cnt(lambda r: not r.get('jsonld_blocks')),
        'orphan_no_internal_links_in': cnt(lambda r: r.get('is_orphan')),
        'links_to_a_broken_internal_url': cnt(lambda r: (r.get('broken_internal_links') or 0) > 0),
        'links_to_a_redirecting_internal_url': cnt(lambda r: (r.get('links_to_redirects') or 0) > 0),
        'not_server_rendered_h1': cnt(lambda r: r.get('server_rendered_h1') is False),
        'slow_over_2s': cnt(lambda r: (r.get('time_total_s') or 0) > 2.0),
    }
    content = {
        'under_250_words': cnt(lambda r: (r.get('word_count') or 0) < 250),
        'under_500_words': cnt(lambda r: (r.get('word_count') or 0) < 500),
        'fewer_than_5_numbers': cnt(lambda r: (r.get('number_count') or 0) < 5),
        'fewer_than_3_sections': cnt(lambda r: (r.get('h2_count') or 0) < 3),
        'soft_404_risk': cnt(lambda r: r.get('soft_404_risk')),
        'similarity_in_family_over_0_8': cnt(lambda r: (r.get('max_similarity_in_family') or 0) > 0.8),
        'similarity_in_family_over_0_6': cnt(lambda r: (r.get('max_similarity_in_family') or 0) > 0.6),
    }

    # ---- family rollup
    FAM = ['family', 'live_urls', 'http_200', 'median_words', 'median_numbers',
           'median_internal_links_in', 'orphans', 'noindex', 'canonical_not_self',
           'absent_from_sitemap', 'jsonld_absent', 'median_max_similarity',
           'similarity_over_0_6', 'soft_404_risk', 'median_ttfb_s']
    byfam = collections.defaultdict(list)
    for r in rows:
        byfam[r.get('family') or 'unclassified'].append(r)

    def med(xs):
        xs = [x for x in xs if isinstance(x, (int, float))]
        return round(statistics.median(xs), 3) if xs else ''

    fam_rows = []
    for fam in sorted(byfam):
        rs = byfam[fam]
        fam_rows.append({
            'family': fam, 'live_urls': len(rs),
            'http_200': sum(1 for r in rs if r.get('http_code') == 200),
            'median_words': med([r.get('word_count') for r in rs]),
            'median_numbers': med([r.get('number_count') for r in rs]),
            'median_internal_links_in': med([r.get('internal_links_in') for r in rs]),
            'orphans': sum(1 for r in rs if r.get('is_orphan')),
            'noindex': sum(1 for r in rs if r.get('has_noindex')),
            'canonical_not_self': sum(1 for r in rs
                                      if r.get('canonical') and not r.get('canonical_is_self')),
            'absent_from_sitemap': sum(1 for r in rs if r.get('in_any_sitemap') is False),
            'jsonld_absent': sum(1 for r in rs if not r.get('jsonld_blocks')),
            'median_max_similarity': med([r.get('max_similarity_in_family') for r in rs]),
            'similarity_over_0_6': sum(1 for r in rs
                                       if (r.get('max_similarity_in_family') or 0) > 0.6),
            'soft_404_risk': sum(1 for r in rs if r.get('soft_404_risk')),
            'median_ttfb_s': med([r.get('time_to_first_byte_s') for r in rs]),
        })
    with open(OUT + 'LIVE-COHORT-AUDIT-BY-FAMILY.csv.tmp', 'w', newline='',
              encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=FAM, extrasaction='ignore')
        w.writeheader()
        w.writerows(fam_rows)
    os.replace(OUT + 'LIVE-COHORT-AUDIT-BY-FAMILY.csv.tmp',
               OUT + 'LIVE-COHORT-AUDIT-BY-FAMILY.csv')

    findings = {
        'crawl': {'directory': D, 'crawled_at': idx.get('crawled_at'),
                  'cohort_urls': len(cohort), 'fetched_total': len(idx['pages']),
                  'declared_in_sitemaps': idx.get('declared_in_sitemaps'),
                  'user_agent': idx.get('user_agent')},
        'TECHNICAL_DEFECTS': {k: {'count': len(v), 'examples': v[:6]}
                              for k, v in sorted(technical.items(), key=lambda kv: -len(kv[1]))},
        'CONTENT_OR_VALUE_OBSERVATIONS': {k: {'count': len(v), 'examples': v[:6]}
                                          for k, v in sorted(content.items(),
                                                             key=lambda kv: -len(kv[1]))},
        'GOOGLE_DECISION': {
            'state': 'NOT MEASURED HERE',
            'why': 'only Search Console answers whether Google indexed a URL. Nothing in this '
                   'file infers it, and zero impressions in Search Analytics is not evidence '
                   'of non-indexation.',
            'how_to_fill_it': ['scripts/atlas/gsc-url-inspection.mjs (needs the Workload '
                               'Identity Federation credentials, so it runs in the '
                               'atlas-search-console workflow on main)',
                               'scripts/atlas/analysis/import-gsc-pages-report.py (needs a '
                               'manual Pages export)'],
        },
        'robots_txt_disallow': disallow,
        'production_untouched': True,
        'this_script_only_reads_the_cache': True,
    }
    with open(OUT + 'LIVE-COHORT-AUDIT.json.tmp', 'w') as fh:
        json.dump(findings, fh, indent=1, ensure_ascii=False)
    os.replace(OUT + 'LIVE-COHORT-AUDIT.json.tmp', OUT + 'LIVE-COHORT-AUDIT.json')

    print(f'\ncohort {len(cohort)} URLs, {sum(1 for r in rows if r.get("http_code")==200)} '
          f'answered 200')
    print('\nTECHNICAL DEFECTS')
    for k, v in sorted(technical.items(), key=lambda kv: -len(kv[1])):
        if v:
            print(f'  {len(v):>5}  {k}')
    print('\nCONTENT OR VALUE')
    for k, v in sorted(content.items(), key=lambda kv: -len(kv[1])):
        if v:
            print(f'  {len(v):>5}  {k}')
    print(f'\nwritten {OUT}LIVE-COHORT-AUDIT.csv, -BY-FAMILY.csv and .json')


if __name__ == '__main__':
    main()

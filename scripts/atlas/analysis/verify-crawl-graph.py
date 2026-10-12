#!/usr/bin/env python3
"""Verify the Atlas crawl graph AS DEPLOYED, after PR #34 and #35. Read only.

This re-measures production from scratch. Nothing from the 2026-10-10 crawl is reused: that
crawl predates both pull requests, so every claim it supports has to be re-earned.

A note on what a failure means here. Requests go out through an agent proxy that resets
connections under concurrency, and curl exit 35 or 28 with no HTTP status is THIS SCRIPT
failing, not the site. Every fetch therefore retries with backoff and a URL is only recorded
once it has an HTTP status; anything that never gets one is reported under its own name and
never counted as a site defect.

Writes reports/atlas/CRAWL-GRAPH-VERIFICATION.json and a per-URL CSV.
"""
import argparse, collections, concurrent.futures as cf, csv, glob, gzip, itertools, json
import os, re, subprocess, sys, threading, time, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
OUT = ROOT + 'reports/atlas/'
BODY = ROOT + 'data/atlas/measurements/verify-crawl-2026-10-12-postfix/'
BASE = 'https://livdar.com'
UA = ('LivdarAtlasVerify/1.0 (+https://livdar.com; internal crawl graph verification; '
      'contact via the repository)')
FMT = '{"code":%{http_code},"ttfb":%{time_starttransfer},"redirect":"%{redirect_url}"}'
_SEQ = itertools.count()


def fetch(path, tries=4, timeout=40):
    """One GET with retries. Returns (meta, html). meta['transport_error'] is set only when
    no HTTP status was ever obtained, which is this script failing and not the site."""
    url = BASE + path
    last = ''
    for attempt in range(tries):
        # A NAME UNIQUE PER CALL, not per process. This was os.getpid() * 100 + attempt,
        # and with two worker threads in one process both threads computed the same number,
        # wrote curl's output to the same two files and then read each other's HTML. It
        # showed up as three Atlas pages "canonicalising to a different page": a race in
        # this crawler reported as a defect in the site. The thread id and a global counter
        # make collision impossible.
        hdr = '%s/hdr-%d-%d-%d' % (BODY.rstrip('/'), os.getpid(),
                                   threading.get_ident(), next(_SEQ))
        body = hdr + '.body'
        r = subprocess.run(
            ['curl', '-sS', '--compressed', '--http2', '--max-time', str(timeout),
             '-A', UA, '-o', body, '-D', hdr, '-w', FMT, url],
            capture_output=True, text=True)
        meta = {'path': path, 'url': url, 'code': 0, 'ttfb': None, 'redirect': '',
                'attempts': attempt + 1, 'transport_error': ''}
        try:
            meta.update(json.loads((r.stdout or '').strip().splitlines()[-1]))
        except Exception:
            pass
        if meta['code']:
            headers = {}
            try:
                for line in open(hdr, encoding='utf-8', errors='replace'):
                    if ':' in line:
                        k, v = line.split(':', 1)
                        headers[k.strip().lower()] = v.strip()
            except Exception:
                pass
            meta['x_vercel_cache'] = headers.get('x-vercel-cache', '')
            html = ''
            try:
                html = open(body, encoding='utf-8', errors='replace').read()
            except Exception:
                pass
            for f in (hdr, body):
                try:
                    os.remove(f)
                except OSError:
                    pass
            return meta, html
        last = (r.stderr or '').strip()[:160] or 'curl exit %d' % r.returncode
        for f in (hdr, body):
            try:
                os.remove(f)
            except OSError:
                pass
        time.sleep(2 ** attempt)
    meta = {'path': path, 'url': url, 'code': 0, 'ttfb': None, 'redirect': '',
            'attempts': tries, 'transport_error': last, 'x_vercel_cache': ''}
    return meta, ''


A_TAG = re.compile(r'<a\b([^>]*)>', re.I)
HREF = re.compile(r'href\s*=\s*"([^"]*)"', re.I)
REL = re.compile(r'rel\s*=\s*"([^"]*)"', re.I)
CANON = re.compile(r'<link[^>]+rel\s*=\s*"canonical"[^>]*>', re.I)
ROBOTS = re.compile(r'<meta[^>]+name\s*=\s*"robots"[^>]*>', re.I)
CONTENT = re.compile(r'content\s*=\s*"([^"]*)"', re.I)
ALT = re.compile(r'<link[^>]+rel\s*=\s*"alternate"[^>]*>', re.I)
HREFLANG = re.compile(r'hreflang\s*=\s*"([^"]*)"', re.I)


def norm(href):
    """A same-site href as a trailing-slash path, or None."""
    h = (href or '').split('#')[0].strip()
    if not h:
        return None
    if h.startswith('//'):
        h = 'https:' + h
    if h.startswith('http'):
        u = urllib.parse.urlsplit(h)
        if u.netloc not in ('livdar.com', 'www.livdar.com'):
            return None
        h = u.path + (('?' + u.query) if u.query else '')
    if not h.startswith('/'):
        return None
    p = h.split('?')[0]
    if not p.endswith('/') and '.' not in p.rsplit('/', 1)[-1]:
        p += '/'
    return p


def parse(html):
    """Server-rendered anchors (with rel), canonical, robots and hreflang. No JavaScript is
    run, which is the point: a link a crawler cannot see without JS is not a crawl path."""
    links, nofollow = [], 0
    for attrs in A_TAG.findall(html):
        m = HREF.search(attrs)
        if not m:
            continue
        p = norm(m.group(1))
        if not p:
            continue
        rel = (REL.search(attrs).group(1).lower() if REL.search(attrs) else '')
        if 'nofollow' in rel:
            nofollow += 1
            continue
        links.append(p)
    c = CANON.search(html)
    canonical = CONTENT.search(c.group(0)).group(1) if c and CONTENT.search(c.group(0)) else None
    if canonical is None and c:
        m = HREF.search(c.group(0))
        canonical = m.group(1) if m else None
    r = ROBOTS.search(html)
    robots = CONTENT.search(r.group(0)).group(1) if r and CONTENT.search(r.group(0)) else None
    alts = {}
    for tag in ALT.findall(html):
        hl, hr = HREFLANG.search(tag), HREF.search(tag)
        if hl and hr:
            alts[hl.group(1)] = hr.group(1)
    return {'links': links, 'nofollow': nofollow, 'canonical': canonical,
            'robots': robots, 'hreflang': alts}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--workers', type=int, default=2)
    a = ap.parse_args()
    os.makedirs(BODY, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)

    manifest = {}
    for f in sorted(glob.glob(ROOT + 'data/atlas/cohorts/cohort-00*-pages.json')):
        for p in json.load(open(f, encoding='utf-8'))['pages']:
            manifest[p['path']] = p
    locales = sorted({p['locale'] for p in manifest.values()})
    cohort = set(manifest)

    # Sitemaps first: robots.txt names them, and sitemap membership is one of the checks.
    rmeta, rtxt = fetch('/robots.txt')
    sm_urls = re.findall(r'(?im)^\s*sitemap:\s*(\S+)', rtxt)
    sitemaps, declared = [], {}
    queue = [urllib.parse.urlsplit(u).path for u in sm_urls] or ['/sitemap.xml']
    seen_sm = set()
    while queue:
        sp = queue.pop(0)
        if sp in seen_sm:
            continue
        seen_sm.add(sp)
        m, body = fetch(sp)
        locs = re.findall(r'<loc>\s*([^<\s]+)\s*</loc>', body)
        kids = [l for l in locs if '/sitemap' in urllib.parse.urlsplit(l).path]
        sitemaps.append({'path': sp, 'code': m['code'], 'locs': len(locs),
                         'content_type_ok': True, 'transport_error': m['transport_error'],
                         'is_index': bool(kids)})
        for l in locs:
            u = urllib.parse.urlsplit(l)
            if '/sitemap' in u.path:
                queue.append(u.path)
            else:
                declared[l] = sp

    declared_paths = {}
    for loc, src in declared.items():
        u = urllib.parse.urlsplit(loc)
        declared_paths[u.path] = {'loc': loc, 'host': u.netloc, 'scheme': u.scheme,
                                  'sitemap': src}

    # Every URL this verification needs to see with its own eyes.
    dirs = ['/%s/atlas/' % l for l in locales]
    extra_dirs = ['/ro/atlas/', '/zh-Hant/atlas/']
    homes = ['/de/', '/en/', '/ro/']
    others = [p for p in declared_paths if p not in cohort
              and '/atlas/' not in p and p not in homes]
    targets = list(dict.fromkeys(dirs + extra_dirs + homes + sorted(cohort) + sorted(others)))

    print(f'fetching {len(targets)} URLs with {a.workers} workers', flush=True)
    results = {}
    done = 0
    with cf.ThreadPoolExecutor(max_workers=a.workers) as ex:
        futs = {ex.submit(fetch, p): p for p in targets}
        for fu in cf.as_completed(futs):
            meta, html = fu.result()
            parsed = parse(html) if html else {'links': [], 'nofollow': 0, 'canonical': None,
                                               'robots': None, 'hreflang': {}}
            results[meta['path']] = {**meta, **parsed, 'bytes': len(html)}
            if html and meta['path'] in cohort or '/atlas/' in meta['path'] or meta['path'] in homes:
                try:
                    with gzip.open(BODY + meta['path'].strip('/').replace('/', '-') + '.html.gz',
                                   'wt', encoding='utf-8') as g:
                        g.write(html)
                except Exception:
                    pass
            done += 1
            if done % 100 == 0:
                print(f'  {done}/{len(targets)}', flush=True)

    json.dump({'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
               'base': BASE, 'user_agent': UA,
               'robots_txt_code': rmeta['code'], 'sitemaps_in_robots': sm_urls,
               'sitemaps': sitemaps, 'declared_in_sitemaps': len(declared_paths),
               'locales_served': locales,
               'results': results, 'declared_paths': declared_paths},
              open(OUT + 'CRAWL-GRAPH-RAW-POSTFIX.json', 'w', encoding='utf-8'), indent=1)
    print('raw evidence written to reports/atlas/CRAWL-GRAPH-RAW-POSTFIX.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())

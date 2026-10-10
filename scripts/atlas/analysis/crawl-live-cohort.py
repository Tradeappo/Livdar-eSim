#!/usr/bin/env python3
"""Fetch the live Atlas cohort and the sitemaps, and cache every byte on disk.

WHY A CACHE AND NOT A STREAM. The audit that follows asks a dozen questions of each page and
the questions keep changing: the first pass asked about canonicals and hreflang, the second
about soft-404 risk and server rendering, the fourth about content similarity. Re-crawling the
production site once per question is rude to the site and gives a different answer each time,
because latency and headers move. So this fetches once, writes the exact bytes and the exact
headers to disk, and every later question is asked of the cache. Re-running it skips what is
already cached, so an interrupted run resumes.

THIS SCRIPT ONLY READS. It makes GET requests to public URLs with a named user agent. It does
not post, it does not touch the API paths robots.txt disallows, and it changes nothing in
production.

curl rather than urllib, for the reason the Wikidata work found the hard way: curl negotiates
HTTP/2 and picks up this environment's proxy and CA bundle without being told, and a fetcher
that silently falls back to HTTP/1.1 measures the wrong thing.

Writes, under data/atlas/measurements/live-crawl-<date>/ :
  pages/<slug>.html.gz    the exact body
  pages/<slug>.hdr        the exact response headers, including the redirect chain
  pages/<slug>.meta.json  curl's own timing, size, status and effective URL
  sitemaps/<name>.xml.gz  every sitemap robots.txt names, plus the index's children
  _crawl-index.json       what was fetched, what failed, and the run's own parameters
"""
import concurrent.futures as cf
import datetime, glob, gzip, json, os, re, shutil, subprocess, sys, tempfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
BASE = 'https://livdar.com'
UA = ('LivdarAtlasAudit/1.0 (+https://livdar.com; internal indexation audit; '
      'contact via the repository)')
DATE = os.environ.get('CRAWL_DATE') or datetime.date.today().isoformat()
OUT = ROOT + f'data/atlas/measurements/live-crawl-{DATE}/'
# Two, not six. Six produced 63 connection resets with no HTTP status; two produced none.
WORKERS = int(os.environ.get('CRAWL_WORKERS', '2'))
TIMEOUT = int(os.environ.get('CRAWL_TIMEOUT', '45'))


def slug_for(path):
    s = re.sub(r'[^0-9a-zA-Z]+', '-', path).strip('-') or 'root'
    return s[:150]


RETRIES = int(os.environ.get('CRAWL_RETRIES', '4'))


def fetch(url, stem, follow=True):
    """One GET, retried on a TRANSPORT failure. Writes body, headers and meta together.

    RETRIES EXIST BECAUSE THE FIRST RUN LIED. Six concurrent connections through this
    environment's proxy produced 63 of 500 pages with curl exit 35, "SSL_connect
    SSL_ERROR_SYSCALL" and "Recv failure: Connection reset by peer", and no HTTP status at all.
    Read as an audit result that says 63 live pages are broken, which would have been a false
    and damaging finding: the same URLs answer 200 when fetched one at a time. A connection
    reset with no status is MY transport failing, not the site's; a 404 or a 500 is the site's
    answer and is never retried here.

    So a missing status is retried with a backoff and the attempt count is recorded, and a meta
    file is only treated as final when it carries an http_code. An audit has to be able to tell
    "the server said no" from "I could not ask".
    """
    body_p, hdr_p, meta_p = stem + '.html.gz', stem + '.hdr', stem + '.meta.json'
    if os.path.exists(meta_p) and os.path.getsize(meta_p) > 2:
        try:
            cached = json.load(open(meta_p))
            if cached.get('http_code'):
                return cached
        except Exception:
            pass
    for attempt in range(1, RETRIES + 1):
        meta = _fetch_once(url, stem, follow)
        meta['attempts'] = attempt
        if meta.get('http_code'):
            break
        if attempt < RETRIES:
            time.sleep(1.5 * attempt)
    with open(meta_p + '.tmp', 'w') as fh:
        json.dump(meta, fh)
    os.replace(meta_p + '.tmp', meta_p)
    return meta


def _fetch_once(url, stem, follow=True):
    body_p, hdr_p, meta_p = stem + '.html.gz', stem + '.hdr', stem + '.meta.json'
    with tempfile.TemporaryDirectory() as td:
        b, h = td + '/b', td + '/h'
        fmt = ('{"http_code":%{http_code},"time_total":%{time_total},'
               '"size_download":%{size_download},"url_effective":"%{url_effective}",'
               '"num_redirects":%{num_redirects},"content_type":"%{content_type}",'
               '"size_header":%{size_header},"speed_download":%{speed_download},'
               '"time_connect":%{time_connect},"time_starttransfer":%{time_starttransfer},'
               '"http_version":"%{http_version}"}')
        cmd = ['curl', '-sS', '--compressed', '--http2', '--max-time', str(TIMEOUT),
               '-A', UA, '-D', h, '-o', b, '-w', fmt]
        if follow:
            cmd += ['-L', '--max-redirs', '10']
        cmd.append(url)
        r = subprocess.run(cmd, capture_output=True, text=True)
        meta = {'url': url, 'curl_exit': r.returncode, 'curl_stderr': (r.stderr or '')[:400]}
        if r.returncode == 0 and r.stdout.strip():
            try:
                meta.update(json.loads(r.stdout.strip().splitlines()[-1]))
            except Exception as e:
                meta['parse_error'] = f'{type(e).__name__}: {r.stdout[-200:]}'
        if os.path.exists(b) and os.path.getsize(b) > 0:
            # mtime=0 so a re-fetch of unchanged bytes gives an identical file. gzip.open
            # has no mtime argument; GzipFile does, and that is the whole difference.
            with open(b, 'rb') as fh, open(body_p + '.tmp', 'wb') as raw:
                with gzip.GzipFile(fileobj=raw, mode='wb', mtime=0) as gz:
                    shutil.copyfileobj(fh, gz)
            os.replace(body_p + '.tmp', body_p)
            meta['body_bytes'] = os.path.getsize(b)
        if os.path.exists(h):
            shutil.copyfile(h, hdr_p)
    return meta


def main():
    os.makedirs(OUT + 'pages', exist_ok=True)
    os.makedirs(OUT + 'sitemaps', exist_ok=True)

    live = json.load(open(ROOT + 'reports/atlas/live-production.json', encoding='utf-8'))
    paths = []
    for r in live.get('rows') or []:
        p = (r.get('path') or '').strip()
        if p:
            paths.append(p if p.endswith('/') else p + '/')
    paths = sorted(set(paths))
    print(f'live cohort: {len(paths):,} paths', file=sys.stderr)

    # robots.txt first, because what it names is the sitemap list and because an audit that
    # asks "is this URL allowed" has to read the file rather than assume the answer.
    rb = fetch(BASE + '/robots.txt', OUT + 'sitemaps/robots')
    robots_txt = ''
    if os.path.exists(OUT + 'sitemaps/robots.html.gz'):
        robots_txt = gzip.open(OUT + 'sitemaps/robots.html.gz', 'rt',
                               encoding='utf-8', errors='replace').read()
    sm = [m.group(1).strip() for m in re.finditer(r'(?im)^\s*Sitemap:\s*(\S+)', robots_txt)]
    print(f'sitemaps named in robots.txt: {len(sm)}', file=sys.stderr)

    # the index may name children robots.txt does not, so both are followed, once each
    seen_sm, queue, fetched_sm = set(), list(sm), []
    while queue:
        u = queue.pop(0)
        if u in seen_sm:
            continue
        seen_sm.add(u)
        stem = OUT + 'sitemaps/' + slug_for(u.replace(BASE, ''))
        meta = fetch(u, stem)
        fetched_sm.append({'url': u, 'http_code': meta.get('http_code'),
                           'bytes': meta.get('body_bytes', 0)})
        if os.path.exists(stem + '.html.gz'):
            xml = gzip.open(stem + '.html.gz', 'rt', encoding='utf-8',
                            errors='replace').read()
            if '<sitemapindex' in xml:
                for m in re.finditer(r'<loc>\s*([^<\s]+)\s*</loc>', xml):
                    if m.group(1) not in seen_sm:
                        queue.append(m.group(1))
    print(f'sitemaps fetched: {len(fetched_sm)}', file=sys.stderr)

    # THE WHOLE DECLARED SITE, not only the cohort. The sitemaps declare 740 URLs, which is
    # small enough to fetch completely, and fetching all of it is the only way to answer two
    # questions the cohort alone cannot: which pages link IN to a cohort page, and therefore
    # which cohort pages are orphans. An orphan count computed from 500 of 740 pages would
    # count a page as unlinked when the link is simply on a page nobody fetched.
    sitemap_urls = set()
    for f in sorted(glob.glob(OUT + 'sitemaps/*.html.gz')):
        try:
            xml = gzip.open(f, 'rt', encoding='utf-8', errors='replace').read()
        except Exception:
            continue
        if '<urlset' not in xml:
            continue
        for m in re.finditer(r'<loc>\s*([^<\s]+)\s*</loc>', xml):
            u = m.group(1)
            if u.startswith(BASE):
                sitemap_urls.add(u[len(BASE):] or '/')
    extra = sorted(u for u in sitemap_urls if u not in set(paths))
    print(f'declared in sitemaps: {len(sitemap_urls):,}, of which outside the cohort: '
          f'{len(extra):,}', file=sys.stderr)
    fetch_paths = paths + extra

    results, done = [], 0
    with cf.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = {ex.submit(fetch, BASE + p, OUT + 'pages/' + slug_for(p)): p
                for p in fetch_paths}
        for f in cf.as_completed(futs):
            p = futs[f]
            try:
                m = f.result()
            except Exception as e:
                m = {'url': BASE + p, 'error': f'{type(e).__name__}: {e}'}
            m['path'] = p
            results.append(m)
            done += 1
            if done % 100 == 0:
                print(f'  {done}/{len(fetch_paths)}', file=sys.stderr)

    idx = {
        'crawled_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'base': BASE, 'user_agent': UA, 'workers': WORKERS, 'timeout_s': TIMEOUT,
        'live_cohort_paths': len(paths),
        'declared_in_sitemaps': len(sitemap_urls),
        'fetched_beyond_the_cohort': len(extra),
        'robots_txt_http_code': rb.get('http_code'),
        'sitemaps_named_in_robots': len(sm),
        'sitemaps_fetched': fetched_sm,
        'pages': sorted(results, key=lambda x: x['path']),
        'pages_ok': sum(1 for r in results if r.get('http_code') == 200),
        'pages_non_200': sorted(r['path'] for r in results if r.get('http_code') != 200),
        'cohort_paths': paths,
        'sitemap_paths': sorted(sitemap_urls),
        'this_script_only_reads': True,
    }
    with open(OUT + '_crawl-index.json.tmp', 'w') as fh:
        json.dump(idx, fh, indent=1)
    os.replace(OUT + '_crawl-index.json.tmp', OUT + '_crawl-index.json')
    print(f"pages 200: {idx['pages_ok']:,} of {len(fetch_paths):,} fetched "
          f"({len(paths):,} of them the live cohort)", file=sys.stderr)
    if idx['pages_non_200']:
        print('NON 200: ' + ', '.join(idx['pages_non_200'][:10]), file=sys.stderr)
    print(f'written {OUT}')


if __name__ == '__main__':
    main()

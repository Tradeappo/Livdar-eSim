#!/usr/bin/env python3
"""Repeated-request reliability probe over the live cohort, for intermittent 5xx.

WHY ONE GET PER URL WAS NOT ENOUGH, and what this can and cannot see.

The 2026-10-10 audit fetched each of the 500 live URLs once, got 200 on every one, and called
the cohort healthy. Vercel's own error cluster said 25,845 server errors over twelve days on
essentially all 500 routes, 910 users affected. Both were true: the pages are prerendered, so
the CDN answers 200 from cache and the origin is never asked, and the 500s happen when ISR
revalidation makes the function render. A cached 200 is not evidence that the origin works.

So this probe is honest about its reach:

  WHAT IT CATCHES  a 5xx that reaches the edge, a timeout, a reset, a slow tail, and any URL
                   whose first hit differs from its warmed hits.
  WHAT IT CANNOT   an origin error hidden behind a cache HIT. x-vercel-cache is recorded on
                   every request precisely so a clean run cannot be mistaken for a healthy
                   origin: a run that is 100 per cent HIT has tested the CDN, not the app.
                   The origin's health is what the Vercel error cluster answers, and the two
                   belong side by side.

Politeness and safety. Requests are spread across URLs rather than hammering one, concurrency
is small and configurable, and a per-URL repeat count of 3 over 500 URLs is 1,500 requests,
which is less traffic than one search engine crawl of the same set. ALL of it is GET on public
URLs with a named user agent, and /api/ is never touched.

Run: python3 scripts/atlas/analysis/reliability-probe.py [--repeats 3] [--workers 4]
Writes: reports/atlas/LIVE-COHORT-RELIABILITY.csv and .json
"""
import argparse, collections, concurrent.futures as cf, csv, json, os, random, statistics
import subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
OUT = ROOT + 'reports/atlas/'
BASE = 'https://livdar.com'
UA = ('LivdarAtlasReliability/1.0 (+https://livdar.com; internal reliability probe; '
      'contact via the repository)')
FMT = ('{"code":%{http_code},"total":%{time_total},"ttfb":%{time_starttransfer},'
       '"bytes":%{size_download}}')


def one(path, attempt, timeout):
    """One GET. Returns status, timings and the Vercel cache verdict."""
    hdr = '/tmp/rel-hdr-%d-%d' % (os.getpid(), attempt)
    cmd = ['curl', '-sS', '--compressed', '--http2', '--max-time', str(timeout),
           '-A', UA, '-o', '/dev/null', '-D', hdr, '-w', FMT, BASE + path]
    r = subprocess.run(cmd, capture_output=True, text=True)
    out = {'path': path, 'attempt': attempt, 'code': 0, 'total': None, 'ttfb': None,
           'bytes': 0, 'cache': '', 'vercel_id': '', 'transport_error': ''}
    if r.returncode != 0:
        # curl exit 35 and friends are MY transport failing, not the site answering. They are
        # recorded under their own name so a proxy reset is never counted as a server error.
        out['transport_error'] = (r.stderr or '').strip()[:160] or f'curl exit {r.returncode}'
    try:
        out.update(json.loads((r.stdout or '').strip().splitlines()[-1]))
    except Exception:
        pass
    try:
        for line in open(hdr, encoding='utf-8', errors='replace'):
            low = line.lower()
            if low.startswith('x-vercel-cache:'):
                out['cache'] = line.split(':', 1)[1].strip()
            elif low.startswith('x-vercel-id:'):
                out['vercel_id'] = line.split(':', 1)[1].strip()
    except OSError:
        pass
    finally:
        if os.path.exists(hdr):
            os.unlink(hdr)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--repeats', type=int, default=3)
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--timeout', type=int, default=40)
    ap.add_argument('--limit', type=int, default=0)
    a = ap.parse_args()

    live = json.load(open(ROOT + 'reports/atlas/live-production.json', encoding='utf-8'))
    meta = {}
    for r in live.get('rows') or []:
        p = (r.get('path') or '').strip()
        if p:
            if not p.endswith('/'):
                p += '/'
            meta[p] = r
    paths = sorted(meta)
    if a.limit:
        paths = paths[:a.limit]

    # INTERLEAVED, not grouped: every URL's first attempt goes out before any URL's second, so
    # the run spreads load and a first-hit difference is visible as attempt 1 against the rest.
    jobs = [(p, n) for n in range(1, a.repeats + 1) for p in paths]
    random.Random(20261010).shuffle(jobs)
    print(f'{len(paths):,} URLs x {a.repeats} = {len(jobs):,} GETs, {a.workers} at a time',
          file=sys.stderr)

    rows, done = [], 0
    with cf.ThreadPoolExecutor(max_workers=a.workers) as ex:
        futs = {ex.submit(one, p, n, a.timeout): (p, n) for p, n in jobs}
        for f in cf.as_completed(futs):
            try:
                rows.append(f.result())
            except Exception as e:
                p, n = futs[f]
                rows.append({'path': p, 'attempt': n, 'code': 0,
                             'transport_error': f'{type(e).__name__}: {e}'})
            done += 1
            if done % 250 == 0:
                print(f'  {done}/{len(jobs)}', file=sys.stderr)

    by = collections.defaultdict(list)
    for r in rows:
        by[r['path']].append(r)

    COLS = ['path', 'family', 'market', 'requests', 'http_5xx', 'http_4xx', 'http_200',
            'transport_failures', 'first_hit_code', 'first_hit_differs',
            'cache_hit_share', 'median_ttfb_s', 'max_total_s', 'codes_seen', 'caches_seen']
    out_rows = []
    for p in paths:
        rs = sorted(by.get(p, []), key=lambda x: x['attempt'])
        answered = [r for r in rs if r['code']]
        codes = [r['code'] for r in answered]
        ttfbs = [r['ttfb'] for r in answered if isinstance(r.get('ttfb'), (int, float))]
        totals = [r['total'] for r in answered if isinstance(r.get('total'), (int, float))]
        caches = [r['cache'] for r in answered if r['cache']]
        first = next((r['code'] for r in rs if r['attempt'] == 1 and r['code']), 0)
        rest = [c for r, c in ((r, r['code']) for r in rs) if r['attempt'] > 1 and c]
        out_rows.append({
            'path': p,
            'family': (meta.get(p, {}).get('family') or ''),
            'market': (meta.get(p, {}).get('locale') or ''),
            'requests': len(rs),
            'http_5xx': sum(1 for c in codes if 500 <= c < 600),
            'http_4xx': sum(1 for c in codes if 400 <= c < 500),
            'http_200': sum(1 for c in codes if c == 200),
            'transport_failures': sum(1 for r in rs if r.get('transport_error')),
            'first_hit_code': first,
            'first_hit_differs': bool(first and rest and any(c != first for c in rest)),
            'cache_hit_share': (round(sum(1 for c in caches if c.upper() == 'HIT')
                                      / len(caches), 3) if caches else ''),
            'median_ttfb_s': round(statistics.median(ttfbs), 3) if ttfbs else '',
            'max_total_s': round(max(totals), 3) if totals else '',
            'codes_seen': '|'.join(str(c) for c in sorted(set(codes))),
            'caches_seen': '|'.join(sorted(set(c.upper() for c in caches))),
        })

    os.makedirs(OUT, exist_ok=True)
    with open(OUT + 'LIVE-COHORT-RELIABILITY.csv.tmp', 'w', newline='',
              encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=COLS, extrasaction='ignore')
        w.writeheader()
        w.writerows(out_rows)
    os.replace(OUT + 'LIVE-COHORT-RELIABILITY.csv.tmp', OUT + 'LIVE-COHORT-RELIABILITY.csv')

    all_caches = [r['cache'].upper() for r in rows if r.get('cache')]
    hit_share = (sum(1 for c in all_caches if c == 'HIT') / len(all_caches)
                 if all_caches else None)
    fam_5xx = collections.Counter(r['family'] for r in out_rows if r['http_5xx'])
    summary = {
        'probed_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'urls': len(paths), 'repeats': a.repeats, 'requests_sent': len(rows),
        'urls_with_a_5xx': sum(1 for r in out_rows if r['http_5xx']),
        'urls_with_a_4xx': sum(1 for r in out_rows if r['http_4xx']),
        'urls_always_200': sum(1 for r in out_rows
                               if r['http_200'] == r['requests'] - r['transport_failures']
                               and r['http_200'] > 0),
        'urls_with_a_first_hit_difference': sum(1 for r in out_rows if r['first_hit_differs']),
        'transport_failures_mine_not_the_site': sum(r['transport_failures'] for r in out_rows),
        'families_with_a_5xx': dict(fam_5xx),
        'cdn_cache_hit_share': round(hit_share, 4) if hit_share is not None else None,
        'what_a_clean_run_does_not_prove': (
            'a HIT share near 1.0 means the CDN answered and the origin function was never '
            'asked. An origin error behind a cache hit is invisible here by construction, and '
            'the Vercel runtime error cluster is what answers that. Read the two together.'),
        'this_probe_only_reads': True,
    }
    with open(OUT + 'LIVE-COHORT-RELIABILITY.json.tmp', 'w') as fh:
        json.dump(summary, fh, indent=1)
    os.replace(OUT + 'LIVE-COHORT-RELIABILITY.json.tmp',
               OUT + 'LIVE-COHORT-RELIABILITY.json')
    for k, v in summary.items():
        if isinstance(v, (int, float, str)) and k != 'what_a_clean_run_does_not_prove':
            print(f'{k:42} {v}')
    print(f'written {OUT}LIVE-COHORT-RELIABILITY.csv and .json')


if __name__ == '__main__':
    main()

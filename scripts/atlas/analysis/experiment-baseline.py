#!/usr/bin/env python3
"""Phase 6 and 7: freeze the pre-request baseline and write the manual submission order.

WHY A MANUAL CHECKLIST AND NOT AN API CALL. Google has no public API for "Request Indexing".
The URL Inspection API this repository already uses is read only. The one write API, the
Indexing API, is scoped to JobPosting and BroadcastEvent markup and using it for ordinary
pages is against its terms, so it is not used here. Request Indexing is therefore a button in
Search Console, pressed by a person, and the useful thing a script can do is decide the order
and record exactly what was true before the first press.

THE ORDER IS NOT ARBITRARY. Search Console rate limits Request Indexing to roughly a dozen
submissions a day, so a 28-URL set takes two or three sittings and may be abandoned halfway.
The order therefore:
  1. puts the one URL Google has ever fetched first, because it is the only one carrying a
     server error and a re-fetch is what clears that state;
  2. then alternates "URL is unknown to Google" with "Discovered - currently not indexed", so
     the two groups the experiment compares stay balanced if the run stops early;
  3. rotates market and family inside each group, for the same reason.

Reads  reports/atlas/INDEXATION-TEST-SET.csv
       reports/atlas/CRAWL-PATHS-BY-URL.csv
       data/atlas/measurements/gsc/url-inspection-2026-10-10.json
Writes reports/atlas/EXPERIMENT-URLS.txt
       reports/atlas/EXPERIMENT-BASELINE-<date>.json
       reports/atlas/REQUEST-INDEXING-CHECKLIST.md
"""
import collections, csv, datetime, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
R = ROOT + 'reports/atlas/'
TODAY = datetime.date.today().isoformat()
INSPECTION = ROOT + 'data/atlas/measurements/gsc/url-inspection-2026-10-10.json'


def group(state):
    s = state.lower()
    if '5xx' in s or 'server error' in s:
        return 'server_error'
    if 'unknown' in s:
        return 'unknown'
    return 'discovered'


def interleave(rows):
    """One from each group in turn, rotating market then family inside a group."""
    buckets = collections.OrderedDict()
    for g in ('server_error', 'unknown', 'discovered'):
        inner = collections.defaultdict(list)
        for r in rows:
            if group(r['google_state_at_baseline']) == g:
                inner[(r['market'], r['family'])].append(r)
        # round robin over (market, family) so neighbours in the output differ on both
        keys, out = sorted(inner), []
        while any(inner[k] for k in keys):
            for k in keys:
                if inner[k]:
                    out.append(inner[k].pop(0))
        buckets[g] = out
    order = list(buckets['server_error'])
    a, b = buckets['unknown'], buckets['discovered']
    for i in range(max(len(a), len(b))):
        if i < len(a):
            order.append(a[i])
        if i < len(b):
            order.append(b[i])
    return order


def main():
    rows = list(csv.DictReader(open(R + 'INDEXATION-TEST-SET.csv', encoding='utf-8')))
    paths = {r['path'] for r in rows}
    crawl = {r['path']: r for r in csv.DictReader(open(R + 'CRAWL-PATHS-BY-URL.csv',
                                                       encoding='utf-8'))}
    insp = json.load(open(INSPECTION, encoding='utf-8'))
    raw = {r['path']: r for r in insp['rows'] if r['path'] in paths}

    ordered = interleave(rows)
    assert len(ordered) == len(rows), 'the ordering dropped or duplicated a URL'

    # Phase 7: the machine-readable baseline, every field as it stood BEFORE any request.
    baseline = {
        'what_this_is': ('the state of the 28-URL accelerated crawl experiment immediately '
                         'before the first Request Indexing submission, so the follow-up at '
                         '24 hours, 72 hours and 7 days has something to diff against'),
        'frozen_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'google_data_from': insp.get('inspected_at') or '2026-10-10',
        'google_evidence_file': 'data/atlas/measurements/gsc/url-inspection-2026-10-10.json',
        'crawl_evidence_file': 'data/atlas/measurements/live-crawl-2026-10-10/_crawl-index.json',
        'how_to_read_zero_impressions': ('zero impressions is not evidence of non-indexation; '
                                         'only coverage_state and last_crawl_time are'),
        'submission_order_rationale': ('server error first, then unknown alternating with '
                                       'discovered, rotating market and family, so a run that '
                                       'stops early is still balanced across the two groups'),
        'urls': [],
    }
    for i, r in enumerate(ordered, 1):
        c = crawl.get(r['path'], {})
        g = raw.get(r['path'], {})
        baseline['urls'].append({
            'submission_order': i,
            'url': r['url'],
            'path': r['path'],
            'family': r['family'],
            'market': r['market'],
            'group': group(r['google_state_at_baseline']),
            'coverage_state_normalised': r['google_state_at_baseline'],
            'coverage_state_raw_from_google': r['coverage_state_raw'],
            'verdict': r['verdict'] or None,
            'indexed': False,          # 0 of 500 were indexed on 2026-10-10
            'last_crawl_time': (r['last_crawl_time'] or None),
            'page_fetch_state': r['page_fetch_state'],
            'robots_txt_state': r['robots_txt_state'],
            'google_canonical': g.get('googleCanonical'),
            'user_canonical': g.get('userCanonical'),
            'sitemap_per_google': g.get('sitemap'),
            'in_sitemap_per_google': r['in_sitemap_per_google'] == 'True',
            'referring_urls_per_google': g.get('referringUrls'),
            'http_status_now': int(r['http_status_now']),
            'ttfb_s': float(r['ttfb_s']) if r['ttfb_s'] else None,
            'word_count': int(r['word_count']) if r['word_count'] else None,
            'inbound_internal_links_total': int(c.get('inbound_total') or 0),
            'inbound_from_non_atlas_pages': int(c.get('inbound_from_non_atlas') or 0),
            'click_depth_from_a_locale_home': c.get('click_depth_from_home') or None,
            'reachable_from_a_non_atlas_page': (c.get('reachable_from_a_non_atlas_page')
                                                == 'True'),
            'reason_for_selection': r['reason_for_selection'],
        })

    out = R + f'EXPERIMENT-BASELINE-{TODAY}.json'
    json.dump(baseline, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    with open(R + 'EXPERIMENT-URLS.txt', 'w', encoding='utf-8') as f:
        f.write('# The 28 URLs of the accelerated crawl experiment, in submission order.\n'
                '# Used by: node scripts/atlas/gsc-url-inspection.mjs --write --only '
                'reports/atlas/EXPERIMENT-URLS.txt --tag experiment-<checkpoint>\n')
        for u in baseline['urls']:
            f.write(u['path'] + '\n')

    counts = collections.Counter(u['group'] for u in baseline['urls'])
    with open(R + 'REQUEST-INDEXING-CHECKLIST.md', 'w', encoding='utf-8') as f:
        f.write(f"""# Request Indexing: the {len(baseline['urls'])} experiment URLs, in order

Frozen {baseline['frozen_at']}. Baseline: `EXPERIMENT-BASELINE-{TODAY}.json`.

## Why this is a manual list

Google has no public API for Request Indexing. The URL Inspection API used elsewhere in this
repository is read only, and the Indexing API, the only write one, is for JobPosting and
BroadcastEvent markup; using it for these pages would be against its terms, so it is not used.
Request Indexing is a button in Search Console and a person has to press it.

## What to do

For each row below, in this order:

1. Open Search Console for `sc-domain:livdar.com`.
2. Paste the URL into the inspection bar at the top.
3. Press **Request Indexing**.
4. Tick the row.

Search Console limits requests to roughly a dozen a day, so this is two or three sittings. The
order already accounts for that: stopping anywhere still leaves both comparison groups covered.

Do NOT submit anything outside this list. The other 472 live URLs are the control, and the
587,284 offline pages are not published.

## Current state per URL, before any request

Groups: {counts['server_error']} server error, {counts['unknown']} unknown to Google, {counts['discovered']} discovered and not indexed.
All {len(baseline['urls'])} return HTTP 200, are in a sitemap, and are not indexed.

| # | done | URL | market | family | Google state now | last crawled |
|--:|:--:|---|---|---|---|---|
""")
        for u in baseline['urls']:
            f.write(f"| {u['submission_order']} | [ ] | `{u['path']}` | {u['market']} | "
                    f"{u['family']} | {u['coverage_state_normalised']} | "
                    f"{u['last_crawl_time'] or 'never'} |\n")
        f.write(f"""
## After the last row

Run the first follow-up checkpoint 24 hours later:

```
GitHub -> Actions -> atlas-experiment-followup -> Run workflow -> checkpoint: 24h
```

Then again at 72h and 7d. Each run re-inspects only these {len(baseline['urls'])} URLs and
writes a diff against the baseline.
""")
    print(f'wrote the baseline, the URL list and the checklist for {len(baseline["urls"])} URLs')
    for g, n in counts.most_common():
        print(f'  {g}: {n}')
    print('  first five in submission order:')
    for u in baseline['urls'][:5]:
        print(f"    {u['submission_order']}. [{u['group']}] {u['path']}")
    return 0


if __name__ == '__main__':
    sys.exit(main())

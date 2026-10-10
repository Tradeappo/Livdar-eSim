#!/usr/bin/env python3
"""Indexation analysis for the LIVE Atlas cohort, per family and overall.

WHAT THIS IS FOR. About 500 Atlas pages are published and are the indexation experiment. The
question they exist to answer is which FAMILIES Google indexes, because that decides whether
the offline inventory scales, holds or needs fixing. This builds the report that answers it.

WHAT THIS DOES NOT DO, and the reason is the whole point. It does not invent a status. Google
Search Console is the only source that knows whether a URL is indexed, and if its data is not
present this script writes the schema, counts the published URLs it can see, and marks every
indexation column UNAVAILABLE with the reason. A report that guessed "probably indexed" would
be worse than no report, because a SCALE decision would then rest on a number nobody measured.

A THIRD SOURCE EXISTS AND THIS SCRIPT MISSED IT ON ITS FIRST RUN. It looked only in
data/atlas/measurements/gsc/ and reported "GSC data present: False", while the repository's own
daily import, .github/workflows/atlas-search-console.yml, has been writing Search Console
Search Analytics to data/atlas/gsc/pages-YYYY-MM-DD.json since 2026-09-22 and succeeded again
on 2026-10-10. Looking in one directory and concluding the data does not exist is the same
mistake as trusting a stale log.

What that import gives and what it does not, in the import's OWN words from the file it
writes: "indexed stays unknown: the Search Analytics API reports impressions, not index state.
The Pages report is a separate import and is not wired yet." So:

  - IMPRESSIONS and CLICKS per URL are measured, and an impression is PROOF of indexation: a
    page Google has never indexed cannot be shown. That gives a hard floor on indexed pages.
  - ZERO impressions is NOT proof of non-indexation. An indexed page that never ranks well
    enough to be seen reports zero. So the not-indexed columns stay UNAVAILABLE, and the
    floor is reported as its own column rather than written into `indexed`.

INPUTS, in order of preference:
  1. data/atlas/measurements/gsc/url-inspection-*.json
     Per-URL results from the GSC URL Inspection API, which is the only source that gives a
     per-URL verdict. Expected shape per row: {"url", "coverageState", "robotsTxtState",
     "indexingState", "lastCrawlTime", "googleCanonical", "userCanonical", "verdict"}.
  2. data/atlas/measurements/gsc/index-coverage-*.csv
     A Search Console coverage export, one row per URL with its state.
  3. data/atlas/gsc/pages-*.json
     The daily Search Analytics import. Per URL: impressions, clicks, ctr, position, plus the
     cohort, surface, family, language and market dimensions the import already resolved.
     Latest window wins per URL.
  4. reports/atlas/live-production.json
     The published URL list. Always read, because the denominator has to come from OUR record
     of what is published rather than from whatever Google happens to have seen - a URL Google
     has never discovered is the single most important row in this report and it is absent from
     every Google export by definition.

THE DECISION STATES are SCALE, HOLD and FIX, and this script assigns them ONLY where real
evidence exists. The thresholds are deliberately left as parameters rather than guessed:
nothing here decides that 60 per cent is good. Where evidence is missing the state is
EVIDENCE_MISSING, which is not a soft HOLD; it means the question has not been asked yet.

Run: python3 scripts/atlas/analysis/indexation-report.py
Writes: reports/atlas/INDEXATION-BY-FAMILY.csv, INDEXATION-SUMMARY.json
"""
import csv, glob, io, json, os, sys, collections, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
GSC = ROOT + 'data/atlas/measurements/gsc/'
SA = ROOT + 'data/atlas/gsc/'
OUT = ROOT + 'reports/atlas/'

# The GSC coverageState strings this report groups. Google's wording has changed before, so
# unknown states are carried through under their own name rather than folded into "other":
# silently bucketing a state we have not seen is how a real signal gets hidden.
INDEXED = {'Submitted and indexed', 'Indexed, not submitted in sitemap', 'Valid'}
DISCOVERED_NOT_INDEXED = {'Discovered - currently not indexed',
                          'Discovered – currently not indexed'}
CRAWLED_NOT_INDEXED = {'Crawled - currently not indexed',
                       'Crawled – currently not indexed'}
DUPLICATE = {'Duplicate without user-selected canonical',
             'Duplicate, Google chose different canonical than user',
             'Duplicate, submitted URL not selected as canonical',
             'Alternate page with proper canonical tag'}

COLUMNS = ['family', 'published_urls', 'indexed', 'not_indexed',
           'discovered_currently_not_indexed', 'crawled_currently_not_indexed',
           'duplicate_or_canonical', 'other_exclusion', 'unknown_state',
           'percent_indexed', 'median_crawl_latency_days', 'median_indexation_latency_days',
           # measured from Search Analytics, which is a different question from index state
           'urls_with_a_search_analytics_row', 'impressions', 'clicks',
           'urls_with_at_least_one_impression', 'indexed_floor_proved_by_impressions',
           'search_visibility_state',
           'representative_indexed_url', 'representative_not_indexed_url',
           'evidence', 'decision_state']


def live_rows():
    """The published cohort, from OUR record. The denominator cannot come from Google."""
    p = ROOT + 'reports/atlas/live-production.json'
    if not os.path.exists(p):
        return [], f'live-production.json not found at {p}'
    d = json.load(open(p, encoding='utf-8'))
    rows = d.get('rows') or []
    out = []
    for r in rows:
        path = (r.get('path') or '').strip()
        if not path:
            continue
        out.append({'path': path if path.endswith('/') else path + '/',
                    'family': (r.get('family') or r.get('page_family') or '').strip()
                              or 'unclassified',
                    'first_published': (r.get('first_published') or r.get('published_at')
                                        or '').strip()})
    return out, None


def gsc_inspection():
    """Per-URL inspection results, if any have been captured."""
    files = sorted(glob.glob(GSC + 'url-inspection-*.json'))
    if not files:
        return {}, None
    by_url = {}
    for f in files:                        # later files win, so a refresh supersedes
        try:
            d = json.load(open(f, encoding='utf-8'))
        except Exception as e:
            print(f'  {os.path.basename(f)}: unreadable, {type(e).__name__}', file=sys.stderr)
            continue
        for r in (d.get('rows') if isinstance(d, dict) else d) or []:
            u = (r.get('url') or '').strip()
            if u:
                by_url[u] = r
    return by_url, (os.path.basename(files[-1]) if files else None)


def gsc_coverage():
    files = sorted(glob.glob(GSC + 'index-coverage-*.csv'))
    if not files:
        return {}, None
    by_url = {}
    for f in files:
        try:
            for r in csv.DictReader(open(f, encoding='utf-8-sig')):
                u = (r.get('URL') or r.get('url') or '').strip()
                st = (r.get('Coverage state') or r.get('coverageState')
                      or r.get('state') or '').strip()
                if u:
                    by_url[u] = {'url': u, 'coverageState': st,
                                 'lastCrawlTime': (r.get('Last crawled')
                                                   or r.get('lastCrawlTime') or '').strip()}
        except Exception as e:
            print(f'  {os.path.basename(f)}: unreadable, {type(e).__name__}', file=sys.stderr)
    return by_url, (os.path.basename(files[-1]) if files else None)


def gsc_search_analytics():
    """Per-URL impressions and clicks from the daily Search Analytics import.

    Keyed on the page PATH, because the import's own key is a path and the live record's is
    too. Later files win per URL, so a refreshed window supersedes an older one, and the
    windows themselves are returned so the report can say what period the zero covers.
    """
    files = sorted(glob.glob(SA + 'pages-*.json'))
    if not files:
        return {}, []
    by_path, windows = {}, []
    for f in files:
        try:
            d = json.load(open(f, encoding='utf-8'))
        except Exception as e:
            print(f'  {os.path.basename(f)}: unreadable, {type(e).__name__}', file=sys.stderr)
            continue
        wnd = d.get('window') or {}
        tot_i = sum(int(r.get('impressions') or 0) for r in (d.get('pages') or []))
        tot_c = sum(int(r.get('clicks') or 0) for r in (d.get('pages') or []))
        windows.append({'file': os.path.basename(f), 'property': d.get('property'),
                        'start': wnd.get('startDate'), 'end': wnd.get('endDate'),
                        'imported_at': d.get('importedAt'),
                        'pages': len(d.get('pages') or []),
                        'impressions': tot_i, 'clicks': tot_c,
                        'note_from_the_import': d.get('note')})
        for r in d.get('pages') or []:
            k = (r.get('key') or '').strip()
            if not k:
                continue
            if not k.endswith('/'):
                k += '/'
            by_path[k] = r
    return by_path, windows


def days_between(a, b):
    for fmt in ('%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%dT%H:%M:%S%z', '%Y-%m-%d'):
        try:
            da = datetime.datetime.strptime(a[:19] if 'T' in a else a, fmt.replace('%z', ''))
            db = datetime.datetime.strptime(b[:19] if 'T' in b else b, fmt.replace('%z', ''))
            return abs((db - da).days)
        except Exception:
            continue
    return None


def median(xs):
    xs = sorted(x for x in xs if x is not None)
    if not xs:
        return None
    n = len(xs)
    return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2


def main():
    os.makedirs(OUT, exist_ok=True)
    rows, live_err = live_rows()
    insp, insp_src = gsc_inspection()
    cov, cov_src = gsc_coverage()
    sa, sa_windows = gsc_search_analytics()
    # have_gsc governs the INDEX STATE columns, and Search Analytics does not answer that
    # question, so it deliberately does not set this flag. It has its own columns.
    have_gsc = bool(insp or cov)
    missing = []
    if live_err:
        missing.append(live_err)
    if not insp:
        missing.append(f'no URL Inspection captures in {GSC}url-inspection-*.json')
    if not cov:
        missing.append(f'no coverage export in {GSC}index-coverage-*.csv')
    if not sa:
        missing.append(f'no Search Analytics import in {SA}pages-*.json')

    per = collections.defaultdict(lambda: collections.Counter())
    rep = collections.defaultdict(dict)
    crawl_lat = collections.defaultdict(list)
    index_lat = collections.defaultdict(list)
    states_seen = collections.Counter()

    for r in rows:
        fam = r['family']
        per[fam]['published_urls'] += 1
        a = sa.get(r['path'])
        if a is not None:
            per[fam]['urls_with_a_search_analytics_row'] += 1
            imp = int(a.get('impressions') or 0)
            per[fam]['impressions'] += imp
            per[fam]['clicks'] += int(a.get('clicks') or 0)
            if imp > 0:
                # An impression cannot happen for a URL Google has not indexed, so this is a
                # measured FLOOR on indexed pages and the only index fact available without
                # the Pages report. It is not written into `indexed`, because that column
                # means "GSC said indexed" and this is an inference from a different report.
                per[fam]['urls_with_at_least_one_impression'] += 1
                rep[fam].setdefault('representative_indexed_url', r['path'])
        g = None
        for base in ('https://livdar.com', 'https://www.livdar.com', ''):
            g = insp.get(base + r['path']) or cov.get(base + r['path']) or g
        if not g:
            continue
        st = (g.get('coverageState') or '').strip()
        states_seen[st] += 1
        if st in INDEXED:
            per[fam]['indexed'] += 1
            rep[fam].setdefault('representative_indexed_url', r['path'])
        else:
            per[fam]['not_indexed'] += 1
            rep[fam].setdefault('representative_not_indexed_url', r['path'])
            if st in DISCOVERED_NOT_INDEXED:
                per[fam]['discovered_currently_not_indexed'] += 1
            elif st in CRAWLED_NOT_INDEXED:
                per[fam]['crawled_currently_not_indexed'] += 1
            elif st in DUPLICATE:
                per[fam]['duplicate_or_canonical'] += 1
            elif st:
                per[fam]['other_exclusion'] += 1
            else:
                per[fam]['unknown_state'] += 1
        lc = (g.get('lastCrawlTime') or '').strip()
        if lc and r['first_published']:
            crawl_lat[fam].append(days_between(r['first_published'], lc))
            if st in INDEXED:
                index_lat[fam].append(days_between(r['first_published'], lc))

    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=COLUMNS, extrasaction='ignore')
    w.writeheader()
    for fam in sorted(per):
        c = per[fam]
        pub = c['published_urls']
        known = c['indexed'] + c['not_indexed']
        row = {'family': fam, 'published_urls': pub}
        for k in ('indexed', 'not_indexed', 'discovered_currently_not_indexed',
                  'crawled_currently_not_indexed', 'duplicate_or_canonical',
                  'other_exclusion', 'unknown_state'):
            row[k] = c[k] if have_gsc else 'UNAVAILABLE'
        row['percent_indexed'] = (round(100.0 * c['indexed'] / known, 1)
                                  if have_gsc and known else 'UNAVAILABLE')
        row['median_crawl_latency_days'] = (median(crawl_lat[fam])
                                            if crawl_lat[fam] else 'UNAVAILABLE')
        row['median_indexation_latency_days'] = (median(index_lat[fam])
                                                 if index_lat[fam] else 'UNAVAILABLE')
        # Search Analytics columns, measured whenever the import has a row for the URL
        row['urls_with_a_search_analytics_row'] = (c['urls_with_a_search_analytics_row']
                                                   if sa else 'UNAVAILABLE')
        row['impressions'] = c['impressions'] if sa else 'UNAVAILABLE'
        row['clicks'] = c['clicks'] if sa else 'UNAVAILABLE'
        row['urls_with_at_least_one_impression'] = (c['urls_with_at_least_one_impression']
                                                    if sa else 'UNAVAILABLE')
        row['indexed_floor_proved_by_impressions'] = (c['urls_with_at_least_one_impression']
                                                      if sa else 'UNAVAILABLE')
        if not sa or not c['urls_with_a_search_analytics_row']:
            row['search_visibility_state'] = 'UNAVAILABLE'
        elif c['impressions'] > 0:
            row['search_visibility_state'] = 'SHOWN_IN_SEARCH'
        else:
            # The honest name. It is not NOT_INDEXED: a page can be indexed and never shown.
            row['search_visibility_state'] = 'NO_IMPRESSION_IN_THE_MEASURED_WINDOW'
        row['representative_indexed_url'] = rep[fam].get('representative_indexed_url', '')
        row['representative_not_indexed_url'] = rep[fam].get('representative_not_indexed_url', '')
        if not have_gsc and c['urls_with_a_search_analytics_row']:
            row['evidence'] = (
                f"PARTIAL: Search Analytics covers "
                f"{c['urls_with_a_search_analytics_row']} of {pub} URLs with "
                f"{c['impressions']} impressions and {c['clicks']} clicks; index state needs "
                f"the Pages report, which the import itself says is not wired yet")
            row['decision_state'] = 'INDEX_STATE_MISSING_VISIBILITY_MEASURED'
        elif not have_gsc:
            row['evidence'] = 'NONE: no GSC data in this environment'
            row['decision_state'] = 'EVIDENCE_MISSING'
        elif known < pub:
            row['evidence'] = f'PARTIAL: {known} of {pub} URLs have a GSC state'
            row['decision_state'] = 'EVIDENCE_MISSING' if known == 0 else 'EVIDENCE_PARTIAL'
        else:
            row['evidence'] = f'COMPLETE: {known} of {pub} URLs have a GSC state'
            # left unclassified on purpose: no threshold here is measured, and the brief says
            # not to classify families without real evidence AND a decided bar
            row['decision_state'] = 'READY_TO_CLASSIFY'
        w.writerow(row)
    with open(OUT + 'INDEXATION-BY-FAMILY.csv.tmp', 'w', newline='') as fh:
        fh.write(buf.getvalue())
    os.replace(OUT + 'INDEXATION-BY-FAMILY.csv.tmp', OUT + 'INDEXATION-BY-FAMILY.csv')

    summary = {
        'generated': datetime.date.today().isoformat(),
        'published_urls_in_our_record': len(rows),
        'families': len(per),
        'gsc_index_state_present': have_gsc,
        'gsc_search_analytics_present': bool(sa),
        'url_inspection_source': insp_src,
        'coverage_export_source': cov_src,
        'search_analytics_imports': sa_windows,
        'urls_with_a_search_analytics_row': sum(
            per[f]['urls_with_a_search_analytics_row'] for f in per),
        'total_impressions': sum(per[f]['impressions'] for f in per),
        'total_clicks': sum(per[f]['clicks'] for f in per),
        'indexed_floor_proved_by_impressions': sum(
            per[f]['urls_with_at_least_one_impression'] for f in per),
        'what_an_impression_proves': (
            'an impression proves the URL was indexed, so the count above is a FLOOR on '
            'indexed pages. Zero impressions proves nothing about index state: an indexed '
            'page that never ranks high enough to be seen reports zero, which is why the '
            'not-indexed columns stay UNAVAILABLE.'),
        'urls_with_a_gsc_state': sum(per[f]['indexed'] + per[f]['not_indexed'] for f in per),
        'coverage_states_seen': dict(states_seen),
        'what_is_missing': missing,
        'how_to_supply_it': [
            'URL Inspection API, one call per URL, 2,000/day/property: write each batch to '
            'data/atlas/measurements/gsc/url-inspection-YYYY-MM-DD.json as {"rows": [...]} '
            'with url, coverageState, lastCrawlTime, googleCanonical, userCanonical, verdict.',
            'Or export Search Console > Indexing > Pages > any row > Export, and save as '
            'data/atlas/measurements/gsc/index-coverage-YYYY-MM-DD.csv with URL and '
            'Coverage state columns.',
            'Crawl and indexation latency need first_published per URL in '
            'reports/atlas/live-production.json; without it the dates have nothing to '
            'subtract from and the two latency columns stay UNAVAILABLE.',
        ],
        'decision_states': {
            'INDEX_STATE_MISSING_VISIBILITY_MEASURED':
                'Search Analytics covers the URLs and index state does not. A family here '
                'has a measured visibility answer and an unmeasured indexation answer.',
            'SCALE': 'assign only on complete evidence and an agreed indexed-share bar',
            'HOLD': 'assign only on complete evidence and an agreed bar',
            'FIX': 'assign only on complete evidence and an agreed bar',
            'EVIDENCE_MISSING': 'no GSC state for any URL in this family',
            'EVIDENCE_PARTIAL': 'some URLs have a state, not all',
            'READY_TO_CLASSIFY': 'every published URL has a state; the bar is a decision, '
                                 'not a measurement, so this script stops here',
        },
        'production_untouched': True,
        'this_script_reads_only': True,
    }
    with open(OUT + 'INDEXATION-SUMMARY.json.tmp', 'w') as fh:
        json.dump(summary, fh, indent=1)
    os.replace(OUT + 'INDEXATION-SUMMARY.json.tmp', OUT + 'INDEXATION-SUMMARY.json')

    print(f'published URLs in our record: {len(rows):,} across {len(per)} families')
    print(f'GSC index-state data present: {have_gsc}')
    print(f'GSC Search Analytics present: {bool(sa)}')
    if sa:
        tot_i = sum(per[f]['impressions'] for f in per)
        tot_c = sum(per[f]['clicks'] for f in per)
        shown = sum(per[f]['urls_with_at_least_one_impression'] for f in per)
        cov_n = sum(per[f]['urls_with_a_search_analytics_row'] for f in per)
        print(f'  Search Analytics rows for {cov_n:,} of {len(rows):,} published URLs')
        for w in sa_windows:
            print(f"  {w['file']}: {w['start']}..{w['end']}  "
                  f"impressions {w['impressions']:,}  clicks {w['clicks']:,}")
        print(f'  TOTAL over the latest window per URL: impressions {tot_i:,}, '
              f'clicks {tot_c:,}, URLs shown at least once {shown:,}')
        print(f'  indexed floor proved by impressions: {shown:,}')
    if missing:
        print('MISSING, so the INDEX STATE columns are UNAVAILABLE '
              '(the Search Analytics columns above are measured):')
        for m in missing:
            print(f'  - {m}')
    print(f'written {OUT}INDEXATION-BY-FAMILY.csv and INDEXATION-SUMMARY.json')


if __name__ == '__main__':
    main()

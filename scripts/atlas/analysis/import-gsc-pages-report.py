#!/usr/bin/env python3
"""Import a Search Console PAGE INDEXING (Pages) export and normalise it for the report.

THE REASON THIS IS AN IMPORTER AND NOT AN API CLIENT. The Search Console API v1 exposes four
things: sites, sitemaps, searchanalytics and urlInspection. There is no endpoint for the Pages
report, so there is no official machine-readable route to it and this project will not invent
one. URL Inspection answers the same question per URL and is scripted in
scripts/atlas/gsc-url-inspection.mjs; the Pages report answers it in bulk with Google's own
reason buckets, and the only way to get it out is the Export button in the UI.

So: a person exports, this normalises. What it writes is
data/atlas/measurements/gsc/index-coverage-<date>.csv with the columns
scripts/atlas/analysis/indexation-report.py already reads, which is why nothing downstream has
to change to pick it up.

WHAT TO EXPORT, exactly.

  1. Open https://search.google.com/search-console and pick the livdar.com property.
  2. Left sidebar: Indexing > Pages.
  3. For the WHOLE-REPORT summary: the Export button at the top right, "Download CSV".
     That gives a zip whose Table.csv has one row per REASON with a page COUNT. Useful for the
     totals and useless for per-URL work, because it carries no URLs. Put it in the directory
     anyway, named summary.csv, and this records the counts to reconcile against.
  4. For the URLS, which is the part that matters: in the table at the bottom of the Pages
     report, click EACH reason row ("Crawled - currently not indexed", "Discovered - currently
     not indexed", "Duplicate without user-selected canonical", "Alternate page with proper
     canonical tag", and so on, including the indexed ones). Each opens a detail view with an
     Export button. Export each as CSV.
  5. Rename each downloaded Table.csv to the reason it came from, keep the .csv extension, and
     put them all in ONE directory:

       data/atlas/measurements/gsc/pages-report-<YYYY-MM-DD>/
         summary.csv
         crawled-currently-not-indexed.csv
         discovered-currently-not-indexed.csv
         duplicate-without-user-selected-canonical.csv
         alternate-page-with-proper-canonical-tag.csv
         submitted-and-indexed.csv
         ...

     The FILENAME is where the reason comes from when a per-reason export has no reason column,
     which is the normal case. Spelling does not have to be exact; the slug is matched against
     Google's own wording and anything unrecognised is carried through under its own name
     rather than folded into "other", because silently bucketing a state nobody has seen is how
     a real signal gets hidden.

  A single combined CSV also works, if one is produced by Looker Studio or a Sheets export:
  this accepts any file that has a URL column AND a reason or coverage-state column, in which
  case the filename is ignored.

LOCALISED HEADERS. The export's header row follows the Search Console interface language. This
matches the English headers and a set of known translations, and when it cannot find a URL
column it says which headers it DID see, so the fix is one line rather than a guess.

Run: python3 scripts/atlas/analysis/import-gsc-pages-report.py [directory]
"""
import csv, glob, io, json, os, re, sys, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
GSC = ROOT + 'data/atlas/measurements/gsc/'

# Google's own wording, kept verbatim as the value written to Coverage state. The keys are
# slugs so a filename matches whatever dash or capitalisation the download used.
REASONS = {
    'submitted-and-indexed': 'Submitted and indexed',
    'indexed-not-submitted-in-sitemap': 'Indexed, not submitted in sitemap',
    'crawled-currently-not-indexed': 'Crawled - currently not indexed',
    'discovered-currently-not-indexed': 'Discovered - currently not indexed',
    'duplicate-without-user-selected-canonical': 'Duplicate without user-selected canonical',
    'duplicate-google-chose-different-canonical-than-user':
        'Duplicate, Google chose different canonical than user',
    'duplicate-submitted-url-not-selected-as-canonical':
        'Duplicate, submitted URL not selected as canonical',
    'alternate-page-with-proper-canonical-tag': 'Alternate page with proper canonical tag',
    'excluded-by-noindex-tag': 'Excluded by ‘noindex’ tag',
    'blocked-by-robots-txt': 'Blocked by robots.txt',
    'blocked-due-to-unauthorized-request-401': 'Blocked due to unauthorized request (401)',
    'blocked-due-to-access-forbidden-403': 'Blocked due to access forbidden (403)',
    'not-found-404': 'Not found (404)',
    'soft-404': 'Soft 404',
    'page-with-redirect': 'Page with redirect',
    'server-error-5xx': 'Server error (5xx)',
    'crawl-anomaly': 'Crawl anomaly',
    'url-blocked-due-to-other-4xx-issue': 'URL blocked due to other 4xx issue',
}

URL_HEADERS = ('url', 'urls', 'page', 'pages', 'address', 'adresse', 'adresse url',
               'url de la page', 'direccion url', 'indirizzo', 'adres url', 'strona',
               'seite', 'url da pagina')
STATE_HEADERS = ('coverage state', 'reason', 'status', 'state', 'motivo', 'raison',
                 'grund', 'powod', 'reden', 'motivazione', 'indexing status')
CRAWL_HEADERS = ('last crawled', 'last crawl', 'last crawl time', 'ultimo rastreo',
                 'derniere exploration', 'zuletzt gecrawlt', 'ostatnie indeksowanie',
                 'ultima scansione')


def norm(h):
    return re.sub(r'[^a-z ]+', '', (h or '').strip().lower()).strip()


def reason_from_name(name):
    s = re.sub(r'[^a-z0-9]+', '-', os.path.basename(name).rsplit('.', 1)[0].lower()).strip('-')
    s = re.sub(r'^table-?', '', s)
    if s in REASONS:
        return REASONS[s], True
    for k, v in REASONS.items():
        if k in s or s in k:
            return v, True
    # not recognised: carry the filename through as the state, flagged, rather than guess
    return os.path.basename(name).rsplit('.', 1)[0], False


def read_rows(path, text):
    """Rows of {url, state, crawled} from one export file, or [] with a reason recorded."""
    try:
        sample = text[:4096]
        delim = csv.Sniffer().sniff(sample, delimiters=',;\t').delimiter
    except Exception:
        delim = ','
    rd = csv.DictReader(io.StringIO(text), delimiter=delim)
    heads = {norm(h): h for h in (rd.fieldnames or [])}
    uk = next((heads[h] for h in URL_HEADERS if h in heads), None)
    sk = next((heads[h] for h in STATE_HEADERS if h in heads), None)
    ck = next((heads[h] for h in CRAWL_HEADERS if h in heads), None)
    if not uk:
        return [], {'file': os.path.basename(path), 'skipped': 'no URL column',
                    'headers_seen': rd.fieldnames or []}
    fallback, known = reason_from_name(path)
    out = []
    for r in rd:
        u = (r.get(uk) or '').strip()
        if not u or not u.lower().startswith('http'):
            continue
        out.append({'url': u,
                    'state': (r.get(sk) or '').strip() if sk else fallback,
                    'crawled': (r.get(ck) or '').strip() if ck else ''})
    return out, {'file': os.path.basename(path), 'rows': len(out),
                 'state_from': 'a column in the file' if sk else 'the filename',
                 'reason_recognised': bool(sk) or known,
                 'headers_seen': rd.fieldnames or []}


def main():
    d = sys.argv[1] if len(sys.argv) > 1 else None
    if not d:
        cands = sorted(glob.glob(GSC + 'pages-report-*'))
        d = cands[-1] if cands else None
    if not d or not os.path.exists(d):
        print(json.dumps({
            'imported': False,
            'why': 'no Pages report export found',
            'expected_directory': GSC + 'pages-report-<YYYY-MM-DD>/',
            'what_to_do': [
                'Search Console > pick the livdar.com property > Indexing > Pages.',
                'Click each reason row in the table at the bottom, then Export > CSV.',
                'Rename each file to its reason, keep .csv, and put them all in the directory '
                'above. Also export the report-level summary as summary.csv.',
                'Then run: python3 scripts/atlas/analysis/import-gsc-pages-report.py',
            ],
            'why_there_is_no_api': 'Search Console API v1 exposes sites, sitemaps, '
                                   'searchanalytics and urlInspection only. The Pages report '
                                   'has no endpoint, so the export is the only route and this '
                                   'project will not invent one.',
        }, indent=1))
        return 0

    files = []
    if d.endswith('.zip'):
        with zipfile.ZipFile(d) as z:
            for n in z.namelist():
                if n.lower().endswith('.csv'):
                    files.append((n, z.read(n).decode('utf-8-sig', 'replace')))
    elif os.path.isdir(d):
        for f in sorted(glob.glob(d.rstrip('/') + '/*.csv')):
            files.append((f, open(f, encoding='utf-8-sig', errors='replace').read()))
        for f in sorted(glob.glob(d.rstrip('/') + '/*.zip')):
            with zipfile.ZipFile(f) as z:
                for n in z.namelist():
                    if n.lower().endswith('.csv'):
                        files.append((f + '!' + n, z.read(n).decode('utf-8-sig', 'replace')))
    else:
        files.append((d, open(d, encoding='utf-8-sig', errors='replace').read()))

    by_url, notes, summary_rows = {}, [], []
    for name, text in files:
        if os.path.basename(name).lower().startswith('summary'):
            # the report-level export: reasons and counts, no URLs. Kept for reconciliation.
            rd = csv.DictReader(io.StringIO(text))
            summary_rows = [dict(r) for r in rd]
            notes.append({'file': os.path.basename(name),
                          'kept_as': 'reason counts for reconciliation, no URLs'})
            continue
        rows, note = read_rows(name, text)
        notes.append(note)
        for r in rows:
            by_url[r['url']] = r          # a later file wins, so a re-export supersedes

    date = re.search(r'(\d{4}-\d{2}-\d{2})', os.path.basename(d.rstrip('/')))
    date = date.group(1) if date else __import__('datetime').date.today().isoformat()
    out = GSC + f'index-coverage-{date}.csv'
    os.makedirs(GSC, exist_ok=True)
    with open(out + '.tmp', 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=['URL', 'Coverage state', 'Last crawled'])
        w.writeheader()
        for u in sorted(by_url):
            r = by_url[u]
            w.writerow({'URL': u, 'Coverage state': r['state'], 'Last crawled': r['crawled']})
    os.replace(out + '.tmp', out)

    import collections
    states = collections.Counter(r['state'] for r in by_url.values())
    rep = {'imported': True, 'source': d, 'files': notes,
           'urls': len(by_url), 'states': dict(states.most_common()),
           'summary_export_rows': summary_rows,
           'written': out,
           'next': 'python3 scripts/atlas/analysis/indexation-report.py'}
    with open(GSC + f'pages-report-import-{date}.json', 'w') as fh:
        json.dump(rep, fh, indent=1, ensure_ascii=False)
    print(json.dumps(rep, indent=1, ensure_ascii=False)[:3000])
    return 0


if __name__ == '__main__':
    sys.exit(main())

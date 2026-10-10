#!/usr/bin/env python3
"""Compare the indexed pages against the not-indexed ones, feature by feature.

WHAT THIS IS FOR. Once Search Console says which of the live URLs are indexed, the useful
question is what separates the two groups, because that is what tells the offline inventory
which pages are worth building. This runs that comparison over every feature the technical and
content audit already measured.

IT WILL NOT RUN ON NOTHING. If no URL has an index state, there are no groups to compare and
this says so and stops. A comparison invented from zero rows would be the worst output in this
whole programme, because it would look like a finding.

THE STATISTICS, and their limits.

  For a NUMERIC feature: the median and mean of each group, the difference, and a two-sided
  permutation test on the difference in medians, 2,000 shuffles. A permutation test is used
  rather than a t test because these distributions are not normal and several are bounded.
  For a BOOLEAN feature: the rate in each group, the difference, and the same permutation test
  on the rate difference.

  CONFIDENCE is reported as a label and the label depends on the smaller group, because with
  eight pages on one side nothing is strong:
    STRONG    smaller group >= 30 and p < 0.01
    MODERATE  smaller group >= 15 and p < 0.05
    WEAK      smaller group >= 5  and p < 0.10
    TOO FEW   otherwise, and the numbers are printed anyway because hiding them is worse

  MULTIPLE COMPARISONS. Around thirty features are tested, so at p < 0.05 roughly one or two
  will look significant by chance. A Holm adjustment is reported beside the raw p so a reader
  can see which findings survive it, and the ranking uses the adjusted value.

  CORRELATION IS NOT CAUSATION, and in this data it specifically is not: the families differ
  from each other in almost every feature at once, so if Google indexed one family and not
  another, EVERY feature of that family will separate the groups whether or not it mattered.
  That is why the per-family breakdown is printed as well, and why a feature that separates
  the groups WITHIN a family is worth more than one that only separates them across families.

Run: python3 scripts/atlas/analysis/compare-indexed-vs-not.py
Reads: reports/atlas/INDEXATION-BY-URL.csv (which joins the audit and the GSC evidence)
Writes: reports/atlas/INDEXED-VS-NOT-COMPARISON.json
"""
import collections, csv, json, os, random, statistics, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))) + '/'
OUT = ROOT + 'reports/atlas/'
SHUFFLES = 2000
random.seed(20261010)

NUMERIC = ['word_count', 'number_count', 'internal_links_in', 'max_similarity_in_family']
BOOLEAN = ['has_noindex', 'canonical_is_self', 'in_any_sitemap', 'is_orphan',
           'hreflang_has_x_default']
# everything else the audit measured, picked up automatically when present
EXTRA_NUMERIC = ['h2_count', 'h3_count', 'tables', 'lists', 'body_bytes', 'time_total_s',
                 'time_to_first_byte_s', 'internal_links_out', 'jsonld_blocks',
                 'hreflang_count', 'title_len', 'meta_description_len', 'next_data_bytes',
                 'mean_similarity_in_family', 'broken_internal_links', 'links_to_redirects']
EXTRA_BOOLEAN = ['server_rendered_h1', 'soft_404_risk', 'title_unique_in_cohort',
                 'h1_unique_in_cohort', 'meta_unique_in_cohort', 'hreflang_has_self',
                 'robots_txt_allowed']


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def boolean(v):
    if v in ('True', 'true', True):
        return 1.0
    if v in ('False', 'false', False):
        return 0.0
    return None


def permutation_p(a, b, stat):
    """Two sided p for stat(a) - stat(b), by relabelling the pooled values."""
    obs = abs(stat(a) - stat(b))
    pool = a + b
    n = len(a)
    hits = 0
    for _ in range(SHUFFLES):
        random.shuffle(pool)
        if abs(stat(pool[:n]) - stat(pool[n:])) >= obs - 1e-12:
            hits += 1
    return (hits + 1) / (SHUFFLES + 1)


def confidence(smaller_n, p):
    if smaller_n >= 30 and p < 0.01:
        return 'STRONG'
    if smaller_n >= 15 and p < 0.05:
        return 'MODERATE'
    if smaller_n >= 5 and p < 0.10:
        return 'WEAK'
    return 'TOO FEW OR NOT SIGNIFICANT'


def holm(ps):
    """Holm adjusted p values, in the original order."""
    order = sorted(range(len(ps)), key=lambda i: ps[i])
    m = len(ps)
    adj = [0.0] * m
    running = 0.0
    for rank, i in enumerate(order):
        v = min(1.0, (m - rank) * ps[i])
        running = max(running, v)
        adj[i] = round(running, 5)
    return adj


def main():
    # An explicit path is accepted so the statistics can be exercised against a fixture
    # instead of being shipped untested, which is the only way to know the permutation test
    # and the Holm adjustment do what the docstring claims before there is real data.
    src = sys.argv[1] if len(sys.argv) > 1 else OUT + 'INDEXATION-BY-URL.csv'
    audit_p = sys.argv[2] if len(sys.argv) > 2 else OUT + 'LIVE-COHORT-AUDIT.csv'
    if not os.path.exists(src):
        print('no INDEXATION-BY-URL.csv: run indexation-report.py first', file=sys.stderr)
        return 1
    rows = list(csv.DictReader(open(src, encoding='utf-8')))
    audit = {}
    if os.path.exists(audit_p):
        for a in csv.DictReader(open(audit_p, encoding='utf-8')):
            audit[a['path']] = a
    for r in rows:
        r.update({k: v for k, v in audit.get(r['path'], {}).items() if k not in r})

    indexed = [r for r in rows if r['google_index_state'] == 'INDEXED']
    notidx = [r for r in rows if r['google_index_state'] == 'NOT_INDEXED']
    unknown = [r for r in rows if r['google_index_state'].startswith('UNKNOWN')]

    head = {
        'urls': len(rows), 'indexed': len(indexed), 'not_indexed': len(notidx),
        'unknown': len(unknown),
        'by_family': {f: dict(collections.Counter(
                        r['google_index_state'] for r in rows if r['family'] == f))
                      for f in sorted({r['family'] for r in rows})},
    }

    if len(indexed) < 1 or len(notidx) < 1:
        out = {**head, 'comparison': None,
               'why_no_comparison': (
                   'a comparison needs at least one URL on each side. '
                   f'{len(indexed)} are indexed and {len(notidx)} are not indexed in the '
                   'evidence on disk, so there is nothing to compare and nothing is invented '
                   'here. Supply index state with scripts/atlas/gsc-url-inspection.mjs or '
                   'scripts/atlas/analysis/import-gsc-pages-report.py and run this again.'),
               'features_ready_to_compare': {
                   'numeric': NUMERIC + [c for c in EXTRA_NUMERIC if c in (rows[0] if rows else {})],
                   'boolean': BOOLEAN + [c for c in EXTRA_BOOLEAN if c in (rows[0] if rows else {})]},
               }
        if len(sys.argv) <= 1:
            with open(OUT + 'INDEXED-VS-NOT-COMPARISON.json', 'w') as fh:
                json.dump(out, fh, indent=1)
        print(json.dumps({k: out[k] for k in
                          ('urls', 'indexed', 'not_indexed', 'unknown',
                           'why_no_comparison')}, indent=1))
        return 0

    tests = []
    cols = ([(c, 'numeric') for c in NUMERIC + EXTRA_NUMERIC if c in rows[0]]
            + [(c, 'boolean') for c in BOOLEAN + EXTRA_BOOLEAN if c in rows[0]])
    for col, kind in cols:
        conv = num if kind == 'numeric' else boolean
        a = [conv(r.get(col)) for r in indexed]
        b = [conv(r.get(col)) for r in notidx]
        a = [x for x in a if x is not None]
        b = [x for x in b if x is not None]
        if len(a) < 2 or len(b) < 2:
            continue
        stat = statistics.median if kind == 'numeric' else statistics.fmean
        p = permutation_p(list(a), list(b), stat)
        tests.append({
            'feature': col, 'kind': kind,
            'indexed_n': len(a), 'not_indexed_n': len(b),
            'indexed_summary': round(stat(a), 4),
            'not_indexed_summary': round(stat(b), 4),
            'summary_is': 'median' if kind == 'numeric' else 'rate',
            'indexed_median': round(statistics.median(a), 4),
            'not_indexed_median': round(statistics.median(b), 4),
            'indexed_mean': round(statistics.fmean(a), 4),
            'not_indexed_mean': round(statistics.fmean(b), 4),
            'difference': round(stat(a) - stat(b), 4),
            'p_raw': round(p, 5),
        })
    adj = holm([t['p_raw'] for t in tests])
    for t, v in zip(tests, adj):
        t['p_holm'] = v
        t['confidence'] = confidence(min(t['indexed_n'], t['not_indexed_n']), v)
    tests.sort(key=lambda t: (t['p_holm'], -abs(t['difference'])))

    # within-family, which is the comparison that is not confounded by family
    within = {}
    for fam in sorted({r['family'] for r in rows}):
        fi = [r for r in indexed if r['family'] == fam]
        fn = [r for r in notidx if r['family'] == fam]
        if len(fi) >= 5 and len(fn) >= 5:
            within[fam] = {'indexed': len(fi), 'not_indexed': len(fn)}
    out = {**head, 'shuffles': SHUFFLES, 'tests': tests,
           'families_with_both_groups_at_5_or_more': within,
           'how_to_read_this': (
               'The families differ from each other in nearly every feature at once, so a '
               'feature that separates the two groups ACROSS families may only be telling you '
               'which families Google indexed. The families listed above are the only ones '
               'where the same comparison can be run inside one family, and those are the '
               'ones worth believing. Correlation here is not causation.'),
           'examples': {
               'indexed': [r['path'] for r in indexed[:8]],
               'not_indexed': [r['path'] for r in notidx[:8]],
           }}
    if len(sys.argv) <= 1:
        with open(OUT + 'INDEXED-VS-NOT-COMPARISON.json', 'w') as fh:
            json.dump(out, fh, indent=1)
    print(f"indexed {len(indexed)}, not indexed {len(notidx)}, unknown {len(unknown)}")
    print(f"{'feature':30} {'stat':>6} {'idx':>9} {'not':>9} {'diff':>9} "
          f"{'p_holm':>8}  confidence")
    for t in tests[:18]:
        print(f"{t['feature'][:30]:30} {t['summary_is']:>6} {t['indexed_summary']:>9} "
              f"{t['not_indexed_summary']:>9} {t['difference']:>9} {t['p_holm']:>8}  "
              f"{t['confidence']}")
    print('\nwritten ' + OUT + 'INDEXED-VS-NOT-COMPARISON.json' if len(sys.argv) <= 1
          else '\nfixture run, nothing written')
    return 0


if __name__ == '__main__':
    sys.exit(main())

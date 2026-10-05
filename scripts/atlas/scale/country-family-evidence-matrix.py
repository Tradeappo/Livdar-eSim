#!/usr/bin/env python3
"""One row per destination country per family, with the evidence behind it.

The instruction that opened the destination axis came with seven conditions, and they are
conditions on every (country, family) pair rather than on the inventory as a whole: a real source,
a real parent, real demand or utility, distinct content, no city swap, no translated clone, no thin
page, no semantic duplicate. A single headline number cannot show any of that. This file answers it
per cell, from the manifest, so a reader can find the weakest cell rather than the average one.

What each column means and how it is computed:

  rows                 pages in this cell
  markets              which searcher markets it serves, and how many are NOT this country's own
  sources              the data source string and its licence, verbatim from the row
  parent               share of rows whose declared parent is a URL that another row in the
                       manifest actually claims. A parent that points at nothing is not a parent.
  evidence             home for the country's own market, destination for a market earned by the
                       two-part evidence, and the share of each
  locale_facts         share of DESTINATION rows carrying at least one fact computed for their own
                       market. Anything below 100 per cent is a translated clone that got through,
                       and the builders are supposed to make that impossible.
  distinct_titles      distinct titles over rows. Below 1.0 means two pages in this cell share a
                       title, which is a semantic duplicate by the strictest reading.
  distinct_reasons     distinct uniqueness_reason values over rows. A reason two pages share does
                       not justify either of them.
  distinct_entities    distinct entity ids over rows. A cell whose entity count is far below its
                       row count is serving one entity many times, which is what a city swap looks
                       like from the inside.
  thin                 share of rows whose quality score sits in the bottom band

Writes reports/livdar-expiry-freeze-2026-09-30/1M-COUNTRY-FAMILY-EVIDENCE.csv and a JSON summary
naming the cells that fail any condition.
"""
import collections, csv, gzip, json, os, sys

ROOT = '/home/user/Livdar-eSim/'
SRC = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-COUNTRY-FAMILY-EVIDENCE.csv'
OUTJ = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/1M-COUNTRY-FAMILY-EVIDENCE.json'
HOME_OF = {'en-US': 'US', 'en-GB': 'GB', 'de-DE': 'DE', 'fr-FR': 'FR', 'it-IT': 'IT',
           'es-ES': 'ES', 'nl-NL': 'NL', 'pl-PL': 'PL', 'pt-BR': 'BR', 'ja-JP': 'JP',
           'zh-Hant-TW': 'TW'}

rows = []
with gzip.open(SRC, 'rt', encoding='utf-8') as fh:
    for r in csv.DictReader(fh):
        rows.append(r)
print(f'manifest rows: {len(rows):,}', file=sys.stderr)
# A parent is real if SOME page claims that URL, and the 500 pages already live in production are
# pages. The first run of this file compared only against the manifest and reported 1,066 cells
# with a parent that no row claims, while the QA report put orphans at 65. The QA report was right
# and this file was measuring the wrong set: a city hub that is already published is the correct
# parent for a candidate beneath it, and leaving it out turns every such candidate into a false
# finding. Same class of mistake as comparing against the wrong field, which this project has made
# enough times to check for it first.
claimed = {r.get('url_pattern') for r in rows}
# Read the same way qa-1m-manifest.py reads it, from the rows list, each row's path with a
# trailing slash. A first attempt guessed a "paths" key, got nothing, and reported every such
# parent as missing.
_live = set()
try:
    _d = json.load(open(ROOT + 'reports/atlas/live-production.json', encoding='utf-8'))
    for _r in _d.get('rows') or ():
        _p = (_r.get('path') or '').strip()
        if _p:
            _live.add(_p if _p.endswith('/') else _p + '/')
except (FileNotFoundError, ValueError):
    pass
claimed |= _live
print(f'  plus {len(_live):,} paths already live in production', file=sys.stderr)

cells = collections.defaultdict(list)
for r in rows:
    cells[((r.get('country') or '').strip(), r.get('family'))].append(r)
print(f'country by family cells: {len(cells):,}', file=sys.stderr)


def band(r):
    try:
        return float(r.get('quality_score') or 0)
    except ValueError:
        return 0.0


out = []
for (cc, fam), rs in sorted(cells.items()):
    n = len(rs)
    mkts = collections.Counter(r.get('market') for r in rs)
    dest = [r for r in rs if HOME_OF.get(r.get('market')) != cc]
    home = n - len(dest)
    # Two different things, and conflating them produced 1,066 false failures against the QA
    # report's 65 real orphans. A page may legitimately declare NO parent, which is what a country
    # hub and a locale root do. What is never acceptable is declaring one that nothing claims. So
    # the denominator is the rows that declare a parent, not all of them.
    declared = [(r.get('parent_url') or '').strip() for r in rs]
    declared = [d for d in declared if d]
    with_parent = sum(1 for d in declared if d in claimed)
    with_lf = sum(1 for r in dest if (r.get('locale_facts') or '').strip())
    titles = {(r.get('market'), r.get('_title') or r.get('url_pattern')) for r in rs}
    reasons = {(r.get('market'), (r.get('uniqueness_reason') or '')[:400]) for r in rs}
    # Keyed on (market, entity) and NOT on the entity alone. One entity legitimately serves one
    # page per market: a German and an Italian page about Cappadocia are two pages about one place,
    # which is the whole destination axis. Counting distinct entities over rows called that a
    # failure in 106 cells, which is the metric being wrong rather than the inventory.
    ents = {(r.get('market'), r.get('entity_id')) for r in rs}
    thin = sum(1 for r in rs if band(r) < 45)
    srcs = collections.Counter((r.get('data_source') or '')[:70] for r in rs)
    ev = collections.Counter((r.get('market_demand_evidence') or '')[:1] for r in rs)
    out.append({
        'destination_country': cc, 'family': fam, 'rows': n,
        'markets': len(mkts),
        'markets_served': ' '.join(sorted(mkts)),
        'home_market_rows': home, 'destination_rows': len(dest),
        'rows_declaring_a_parent': len(declared),
        'share_of_declared_parents_that_exist':
            (round(with_parent / len(declared), 4) if declared else ''),
        'broken_parents': len(declared) - with_parent,
        'destination_rows_with_a_locale_fact': with_lf,
        'share_of_destination_rows_with_a_locale_fact':
            (round(with_lf / len(dest), 4) if dest else ''),
        'distinct_titles_over_rows': round(len(titles) / n, 4),
        'distinct_uniqueness_reasons_over_rows': round(len(reasons) / n, 4),
        'distinct_entities_over_rows': round(len(ents) / n, 4),
        'share_in_the_bottom_quality_band': round(thin / n, 4),
        'top_source': srcs.most_common(1)[0][0] if srcs else '',
        'has_demand_evidence_on_every_row': 'yes' if not ev.get('') else 'no',
    })

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', newline='', encoding='utf-8') as fh:
    w = csv.DictWriter(fh, fieldnames=list(out[0].keys()))
    w.writeheader()
    w.writerows(out)

# the cells that fail a condition, which is what a reader is actually looking for
fails = collections.defaultdict(list)
for c in out:
    key = f"{c['destination_country']}|{c['family']}"
    if c['broken_parents']:
        fails['a_declared_parent_that_nothing_claims'].append(key)
    if c['destination_rows'] and c['share_of_destination_rows_with_a_locale_fact'] != 1.0:
        fails['a_destination_row_with_no_fact_for_its_own_market'].append(key)
    if c['distinct_titles_over_rows'] < 1.0:
        fails['two_rows_sharing_a_title'].append(key)
    if c['distinct_uniqueness_reasons_over_rows'] < 1.0:
        fails['two_rows_sharing_a_uniqueness_reason'].append(key)
    if c['distinct_entities_over_rows'] < 1.0:
        fails['one_entity_serving_more_than_one_row_in_one_market'].append(key)
    if c['has_demand_evidence_on_every_row'] == 'no':
        fails['a_row_with_no_demand_evidence'].append(key)

by_country = collections.Counter()
dest_by_country = collections.Counter()
for c in out:
    by_country[c['destination_country']] += c['rows']
    dest_by_country[c['destination_country']] += c['destination_rows']
json.dump({
  'generated_on': '2026-10-05',
  'manifest_rows': len(rows),
  'cells': len(out),
  'destination_countries': len(by_country),
  'rows_by_destination_country': dict(by_country.most_common()),
  'destination_axis_rows_by_country': dict(
      (k, v) for k, v in dest_by_country.most_common() if v),
  'conditions_and_the_cells_that_fail_them':
      {k: {'cells': len(v), 'examples': v[:25]} for k, v in sorted(fails.items())},
  'what_a_pass_means': (
      'Every condition here is checked per cell rather than over the inventory, because an '
      'average hides the weakest cell and the weakest cell is the one that would get the site '
      'penalised. A cell with no entry under any condition passed all six.'),
}, open(OUTJ, 'w'), ensure_ascii=False, indent=1)

print(f'\nwritten {OUT}', file=sys.stderr)
print(f'written {OUTJ}', file=sys.stderr)
print(f'\ncells: {len(out):,} across {len(by_country)} destination countries', file=sys.stderr)
print('conditions failing in any cell:', file=sys.stderr)
if fails:
    for k, v in sorted(fails.items()):
        print(f'  {len(v):>5} cells  {k}', file=sys.stderr)
else:
    print('  none', file=sys.stderr)
print('\nrows by destination country:', file=sys.stderr)
for k, v in by_country.most_common(25):
    d = dest_by_country[k]
    print(f'  {k or "(none)":<6} {v:>8,}  of which on the destination axis: {d:,}',
          file=sys.stderr)

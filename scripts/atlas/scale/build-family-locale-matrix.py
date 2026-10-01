#!/usr/bin/env python3
"""
The family by locale coverage matrix, and a template similarity score per family and locale.

Two deliverables in one pass because both read the same manifest.

THE MATRIX answers a question the per-family and per-market breakdowns cannot: for each
family, which locales does it actually work in, and where it does not, which of the four
things is missing. No family is forced into every language, and the matrix is what makes
that visible rather than implied.

THE SIMILARITY SCORE answers the brief's template test: if the only difference between two
pages of a family is the entity name and one or two numbers, the family is a template with a
mail-merge, not a set of pages. The score is the share of the rendered surface that is
IDENTICAL across sampled pages of the same family and locale, computed over the simulated
title, meta, H1 and the uniqueness reason, which is the closest thing to page copy that
exists before anything is built.
"""
import csv, gzip, json, collections, os, sys, io, random, difflib

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
LOCALES = ['en-US', 'en-GB', 'de-DE', 'ja-JP', 'zh-Hant-TW', 'it-IT', 'es-ES', 'fr-FR',
           'nl-NL', 'pl-PL', 'pt-BR']

rows = []
with gzip.open(OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz', 'rt', encoding='utf-8',
               newline='') as f:
    rows = list(csv.DictReader(f))
print(f'manifest rows: {len(rows):,}', file=sys.stderr)

rejected_by_cell = collections.Counter()
try:
    with gzip.open(OUT + 'LIVDAR-1M-REJECTED-CANDIDATES.csv.gz', 'rt', encoding='utf-8',
                   newline='') as f:
        for r in csv.DictReader(f):
            rejected_by_cell[(r.get('family', ''), r.get('market', ''))] += 1
except FileNotFoundError:
    pass

# simulated strings, so the similarity score is computed on what would render
titles = {}
try:
    with gzip.open(OUT + '1M-SIMULATED-TITLES.csv.gz', 'rt', encoding='utf-8',
                   newline='') as f:
        for r in csv.DictReader(f):
            titles[r['candidate_id']] = (r.get('title', ''), r.get('meta', ''), r.get('h1', ''))
except FileNotFoundError:
    pass

cells = collections.defaultdict(list)
for r in rows:
    cells[(r['family'], r['market'])].append(r)


def similarity(sample):
    """Share of the rendered surface identical across a family-and-locale sample.

    1.0 means every sampled page would render the same words; 0.0 means nothing is shared.
    A template is expected to share its connecting words, so a high score is not by itself a
    defect: it is a defect when it is high AND the distinct data behind each page is thin,
    which is why n_distinct_data is reported alongside it.
    """
    if len(sample) < 2:
        return None, None
    strings = []
    for r in sample:
        t, m, h = titles.get(r['candidate_id'], ('', '', ''))
        strings.append(' | '.join([t, m, h, r.get('uniqueness_reason', '')]))
    pairs = 0
    ratio = 0.0
    for i in range(len(strings)):
        for j in range(i + 1, len(strings)):
            ratio += difflib.SequenceMatcher(None, strings[i], strings[j]).ratio()
            pairs += 1
    # how many genuinely different data points sit behind the sample
    distinct = len({(r.get('entity_id', ''), r.get('local_keyword', ''),
                     r.get('data_signature', '')) for r in sample})
    return round(ratio / max(1, pairs), 3), distinct


random.seed(7)
matrix = []
flagged = []
for (fam, mkt), rs in sorted(cells.items()):
    sample = random.sample(rs, min(6, len(rs)))
    score, distinct = similarity(sample)
    dem = collections.Counter(r.get('market_demand_evidence', '') for r in rs).most_common(1)[0][0]
    src = collections.Counter(r['source_status'] for r in rs).most_common(1)[0][0]
    feas = collections.Counter(r.get('serp_feasibility', '') for r in rs).most_common(1)[0][0]
    loc = collections.Counter(r.get('localization_class', '') for r in rs).most_common(1)[0][0]
    kw = next((r.get('local_keyword', '') for r in rs if r.get('local_keyword')), '')
    vol = max((int(r.get('local_volume') or 0) for r in rs), default=0)
    complete = round(sum(1 for r in rs if r.get('data_signature')) / max(1, len(rs)), 2)
    matrix.append({
        'family': fam, 'locale': mkt, 'candidates': len(rs),
        'rejected_in_this_cell': rejected_by_cell.get((fam, mkt), 0),
        'demand_evidence': dem, 'local_keyword': kw, 'local_volume': vol,
        'localization_class': loc, 'source_status': src, 'serp_feasibility': feas,
        'data_completeness': complete,
        'template_similarity_score': score if score is not None else '',
        'distinct_data_points_in_sample': distinct if distinct is not None else '',
        'sample_size': len(sample),
    })
    # high similarity AND thin distinct data is the combination that matters
    if score is not None and score >= 0.92 and (distinct or 0) <= 2 and len(rs) >= 50:
        flagged.append({'family': fam, 'locale': mkt, 'candidates': len(rs),
                        'template_similarity_score': score,
                        'distinct_data_points_in_sample': distinct})

cols = list(matrix[0].keys()) if matrix else []
buf = io.StringIO()
w = csv.DictWriter(buf, fieldnames=cols, extrasaction='ignore')
w.writeheader()
for r in matrix:
    w.writerow(r)
open(OUT + '1M-FAMILY-LOCALE-MATRIX.csv', 'w', newline='').write(buf.getvalue())

# which families reach which locales, as a compact grid
grid = collections.defaultdict(dict)
for r in matrix:
    grid[r['family']][r['locale']] = r['candidates']
lines = ['# Family by locale coverage', '',
         'Which families actually reach which locales, and at what size. A blank cell means '
         'the family produced nothing in that locale, which is the expected outcome for most '
         'pairs: no family is forced into every language.', '',
         '| family | ' + ' | '.join(LOCALES) + ' |',
         '| --- | ' + ' | '.join('---' for _ in LOCALES) + ' |']
for fam in sorted(grid, key=lambda f: -sum(grid[f].values())):
    lines.append('| ' + fam + ' | ' +
                 ' | '.join(f"{grid[fam].get(l, ''):,}" if grid[fam].get(l) else ''
                            for l in LOCALES) + ' |')
lines += ['', '## Template similarity', '',
          'The score is the share of the rendered surface identical across sampled pages of '
          'the same family and locale, over simulated title, meta, H1 and uniqueness reason. '
          'A high score alone is not a defect, because a template is supposed to share its '
          'connecting words. It is a defect when the score is high AND the distinct data '
          'behind the pages is thin, so the two are always reported together.', '']
if flagged:
    lines += ['Cells where similarity is 0.92 or above, distinct data points are two or '
              'fewer, and the cell has at least 50 pages:', '',
              '| family | locale | pages | similarity | distinct data points |',
              '| --- | --- | --- | --- | --- |']
    for f in sorted(flagged, key=lambda x: -x['candidates']):
        lines.append(f"| {f['family']} | {f['locale']} | {f['candidates']:,} | "
                     f"{f['template_similarity_score']} | {f['distinct_data_points_in_sample']} |")
else:
    lines.append('No cell combines high similarity with thin distinct data at the '
                 'thresholds above.')
open(OUT + '1M-FAMILY-LOCALE-MATRIX.md', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')

json.dump({'cells': len(matrix),
           'families': len({r['family'] for r in matrix}),
           'locales': len({r['locale'] for r in matrix}),
           'cells_flagged_high_similarity_thin_data': len(flagged),
           'flagged': flagged[:20],
           'similarity_distribution': dict(collections.Counter(
               'n/a' if r['template_similarity_score'] == '' else
               ('0.95+' if r['template_similarity_score'] >= 0.95 else
                '0.90-0.95' if r['template_similarity_score'] >= 0.90 else
                '0.80-0.90' if r['template_similarity_score'] >= 0.80 else 'under 0.80')
               for r in matrix))},
          open(OUT + '1M-TEMPLATE-SIMILARITY.json', 'w'), indent=1)
print(f'matrix cells: {len(matrix):,}  flagged: {len(flagged)}')
print(json.dumps(dict(collections.Counter(
    'n/a' if r['template_similarity_score'] == '' else
    ('0.95+' if r['template_similarity_score'] >= 0.95 else
     '0.90-0.95' if r['template_similarity_score'] >= 0.90 else
     '0.80-0.90' if r['template_similarity_score'] >= 0.80 else 'under 0.80')
    for r in matrix)), indent=1))

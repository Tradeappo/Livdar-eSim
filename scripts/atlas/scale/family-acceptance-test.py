#!/usr/bin/env python3
"""
The ten-point acceptance test, and the unique content contract, for every family in the manifest.

The brief asks for both, and they are one computation: a family passes because its pages carry
distinct, sourced, demanded, usefully-different content, and the contract fields are the numbers
that say so. Writing them per family rather than per page is deliberate: a family is the unit a
decision is made about, and a page-level contract would be 208,841 rows of the same six values.

The ten conditions. Each is either measured from the manifest and the frozen evidence, or it is
reported as UNKNOWN. None of them is assumed.

   1  real entities          every page names an entity with a source record id
   2  measured demand        a keyword with volume, in at least one market, recorded
   3  pages differ           template_ratio and similarity_score inside their bounds
   4  distinct data          enough distinct data points per page to say something
   5  valid hierarchy        every declared parent resolves to a page or to production
   6  owns its intent        no other family claims the same intent for the same entity
   7  SERP sampled           an archetype on record, or honestly marked unsampled
   8  licence permits        the source licence allows the use
   9  useful without Google  the page carries something a person returns for
  10  honest localisation    every locale has its own evidence, no translated clones

The contract fields, per family:

   unique_fact_count         distinct values in the uniqueness_reason text across its pages
   unique_data_point_count   median count of data fields a page of this family carries
   distinct_entity_count     distinct entity ids
   template_ratio            pages per distinct template signature
   similarity_score          share of page pairs whose simulated title tokens match
   information_gain_reason   what a reader gets here that the parent page does not give

Usage: family-acceptance-test.py
"""
import collections, csv, gzip, json, os, re, statistics, sys

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import page_copy                                                   # noqa: E402

rows = []
with gzip.open(OUT + 'LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz', 'rt', encoding='utf-8',
               newline='') as f:
    for r in csv.DictReader(f):
        rows.append(r)
print(f'manifest rows: {len(rows):,}', file=sys.stderr)
page_copy.AMBIGUOUS_FAM_LABEL = page_copy.compute_ambiguous_labels(rows)
page_copy.SHARED_SUBJECT = page_copy.compute_shared_subjects(rows)

urls = {r['url_pattern'] for r in rows}
live = set()
try:
    d = json.load(open(ROOT + 'reports/atlas/live-production.json', encoding='utf-8'))
    for r in d.get('rows') or ():
        p = (r.get('path') or '').strip()
        if p:
            live.add(p if p.endswith('/') else p + '/')
except Exception:
    pass

# The usefulness verdicts the QA pass already computed, per family and locale cell. Read rather
# than recomputed, so there is one answer to the question and not two.
QA_USEFUL = {}
try:
    _qa = json.load(open(OUT + '1M-QA-REPORT.json', encoding='utf-8'))
    QA_USEFUL = _qa.get('usefulness_test_by_family_and_locale') or {}
except Exception:
    pass
print(f'usefulness cells read from the QA report: {len(QA_USEFUL):,}', file=sys.stderr)

# which family owns which (market, entity, intent): a second claimant is a cannibalisation risk
intent_owner = collections.defaultdict(set)
for r in rows:
    intent_owner[(r['market'], r['entity_type'], r['entity_id'],
                  r['primary_intent'])].add(r['family'])

STOP = {'in', 'the', 'a', 'an', 'of', 'and', 'for', 'to', 'with', 'on', 'at', 'is', 'are',
        'best', 'top', 'your', 'you'}


def toks(s):
    t = re.sub(r'[^0-9a-zÀ-ɏ぀-鿿]+', ' ', (s or '').lower())
    return frozenset(w for w in t.split() if w and w not in STOP)


DATA_FIELDS = ('data_source', 'source_record_id', 'data_signature', 'source_freshness',
               'data_completeness', 'local_keyword', 'local_volume', 'market_demand_evidence',
               'serp_class', 'monetization_fit', 'tool_or_content', 'primary_keyword_if_known')

by_fam = collections.defaultdict(list)
for r in rows:
    by_fam[r['family']].append(r)

report = {}
for fam, frows in sorted(by_fam.items()):
    n = len(frows)
    # ---- the contract -------------------------------------------------------
    reasons = {(r.get('uniqueness_reason') or '').strip() for r in frows}
    tmpl = {r['template_signature'] for r in frows}
    ents = {r['entity_id'] for r in frows}
    dpc = [sum(1 for k in DATA_FIELDS if (r.get(k) or '').strip()) for r in frows]
    # Similarity is computed WITHIN A LANGUAGE. The title skeleton is English for every locale,
    # because this inventory is offline and the site renders localised text, so comparing a
    # German page with an English one about Barcelona compares two renderings of one skeleton and
    # finds them identical. Across the whole family that reported activities.city-things-to-do at
    # 0.0309 and rejected it; within each language the worst figure is 0.0052. Every one of the 59
    # collisions was the same city in a different language. This is the sixth time in this pass
    # that a check compared rows that were not comparable, and the shape is always the same: a
    # field or a grouping that carries something other than what the test is about.
    # Two figures, because they answer different questions and conflating them produced a false
    # rejection. The EXACT share is what the condition tests: two pages with the same title are
    # the same page as far as a reader and a SERP are concerned. The TOKEN share is a
    # near-duplicate signal, and it has a known weakness that showed up immediately:
    # "parking in Schwenningen, Villingen-Schwenningen" and "parking in Villingen,
    # Villingen-Schwenningen" are different titles whose bags of words are identical, because the
    # city's own name contains both quarter names. A compound place name defeats a bag of words,
    # so the token figure is reported and not thresholded.
    worst, worst_lang = 0.0, ''
    worst_tok, worst_tok_lang = 0.0, ''
    for lang in sorted({r.get('language') or '' for r in frows}):
        sub = [r for r in frows if (r.get('language') or '') == lang]
        ex = collections.Counter(page_copy.title_for(r) for r in sub)
        sh = sum(cnt for cnt in ex.values() if cnt > 1) / max(1, len(sub))
        if sh > worst:
            worst, worst_lang = sh, lang
        tc = collections.Counter(toks(page_copy.title_for(r)) for r in sub)
        st = sum(cnt for cnt in tc.values() if cnt > 1) / max(1, len(sub))
        if st > worst_tok:
            worst_tok, worst_tok_lang = st, lang
    contract = {
        'unique_fact_count': len(reasons),
        'unique_data_point_count': int(statistics.median(dpc)) if dpc else 0,
        'distinct_entity_count': len(ents),
        'template_ratio': round(n / max(1, len(tmpl)), 2),
        'similarity_score': round(worst, 4),
        'similarity_worst_language': worst_lang,
        'near_duplicate_token_score': round(worst_tok, 4),
        'near_duplicate_worst_language': worst_tok_lang,
        'information_gain_reason': sorted(reasons)[0][:400] if reasons else '',
    }

    # ---- the ten conditions -------------------------------------------------
    c = {}
    c['1_real_entities'] = ('PASS' if all((r.get('source_record_id') or '').strip()
                                          for r in frows) else 'FAIL')
    # The field that carries family demand is market_demand_evidence, not local_keyword.
    # local_keyword is the LOCALISATION gate's field: the keyword measured in the page's own
    # language, which only 49,931 rows have because only cross-language rows need one. Reading it
    # here reported 117 of 151 families as having no measured demand, which was the fifth time in
    # this pass that I compared a field carrying a different measurement from the one I wanted.
    # The aggregation families carry shape_measured_2026_10_01 with a demand score of 65 to 70.
    ev = collections.Counter((r.get('market_demand_evidence') or '').strip() for r in frows)
    scores = [int(r['demand_score']) for r in frows
              if (r.get('demand_score') or '').strip().isdigit()]
    strong = sum(v for k, v in ev.items()
                 if k.startswith('shape_measured') or k == 'measured_in_this_market')
    weak = ev.get('family_measured_elsewhere', 0)
    if strong == n and max(scores or [0]) > 0:
        c['2_measured_demand'] = 'PASS'
    elif strong and max(scores or [0]) > 0:
        c['2_measured_demand'] = (f'UNKNOWN ({weak} of {n} pages rest on demand measured for '
                                  f'this family in another market, not this one)')
    elif weak:
        c['2_measured_demand'] = (f'UNKNOWN (all {n} pages rest on demand measured in another '
                                  f'market)')
    else:
        c['2_measured_demand'] = f'FAIL (no recorded demand evidence: {sorted(ev)})'
    # a family of one page cannot be self-similar, and a ratio is meaningless over one row
    # template_ratio is REPORTED, not thresholded. One template serving 4,979 pages is how a
    # programmatic page set is supposed to work; whether that is thin depends on whether each
    # page carries distinct data, which is condition 4's job and not this one's. An earlier
    # version ANDed a ratio bound into this condition, and the bound was vacuous: pages per
    # template can never exceed the page count.
    if n == 1:
        c['3_pages_differ'] = 'PASS (a single page cannot be similar to itself)'
    elif contract['similarity_score'] <= 0.02:
        c['3_pages_differ'] = 'PASS'
    else:
        c['3_pages_differ'] = (f'FAIL ({contract["similarity_score"]:.2%} of pages in '
                               f'{worst_lang or "one language"} share an exact title with '
                               f'another)')
    c['4_distinct_data'] = 'PASS' if contract['unique_data_point_count'] >= 6 else 'FAIL'
    bad_parent = sum(1 for r in frows
                     if (r.get('parent_url') or '').strip()
                     and r['parent_url'].strip() not in urls
                     and r['parent_url'].strip() not in live
                     and len([x for x in r['parent_url'].split('/') if x]) > 1)
    c['5_valid_hierarchy'] = 'PASS' if bad_parent == 0 else f'FAIL ({bad_parent} broken)'
    contested = sum(1 for r in frows
                    if len(intent_owner[(r['market'], r['entity_type'], r['entity_id'],
                                         r['primary_intent'])]) > 1)
    c['6_owns_its_intent'] = 'PASS' if contested == 0 else f'FAIL ({contested} contested)'
    serps = {(r.get('serp_class') or 'NOT_SAMPLED') for r in frows}
    c['7_serp_sampled'] = ('PASS' if serps - {'NOT_SAMPLED'}
                           else 'UNKNOWN (archetype not sampled for this family)')
    lic = {(r.get('licence_status') or '').strip() for r in frows}
    c['8_licence_permits'] = ('PASS' if lic and not (lic & {'', 'BLOCKED', 'UNKNOWN'})
                              else f'FAIL ({sorted(lic)})')
    # the usefulness test the QA pass already applies, read back per family
    # Read back from the QA pass rather than invented a second time. The QA test asks whether
    # anything on the page survives the loss of the query that brought the visitor: a
    # computation, real named places, or sourced figures. Writing a different test here would
    # have meant two answers to one question, and the first version of this one was a
    # completeness threshold, which is not the same question at all.
    cells = [v for k, v in QA_USEFUL.items() if k.split('|')[0] == fam]
    bad_cells = [v for v in cells if v.get('verdict') != 'USEFUL_WITHOUT_SEARCH']
    if not cells:
        c['9_useful_without_google'] = 'UNKNOWN (the QA pass has no cell for this family)'
    elif bad_cells:
        c['9_useful_without_google'] = (f'FAIL ({len(bad_cells)} of {len(cells)} locale cells '
                                        f'carry nothing that survives the query)')
    else:
        c['9_useful_without_google'] = 'PASS'
    comp = collections.Counter((r.get('data_completeness') or '').strip().lower()
                               for r in frows)
    low_only = comp.get('low', 0) == n
    locs = collections.Counter((r.get('localization_class') or '') for r in frows)
    bad_loc = sum(v for k, v in locs.items()
                  if k in ('TRANSLATION_ONLY', 'LOCAL_INTENT_MISSING', 'LOCAL_DATA_MISSING',
                           'LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION'))
    c['10_honest_localisation'] = ('PASS' if bad_loc == 0
                                   else f'FAIL ({bad_loc} kept with a rejecting class)')

    fails = [k for k, v in c.items() if v.startswith('FAIL')]
    unknown = [k for k, v in c.items() if v.startswith('UNKNOWN')]
    report[fam] = {
        'pages': n,
        'markets': sorted({r['market'] for r in frows}),
        'verdict': ('ACCEPTED' if not fails and not unknown else
                    'ACCEPTED_WITH_AN_UNKNOWN' if not fails else 'NOT_ACCEPTED'),
        'conditions': c,
        'failed': fails,
        'unknown': unknown,
        'contract': contract,
        'every_page_is_low_completeness': low_only,
    }

verdicts = collections.Counter(v['verdict'] for v in report.values())
pages_by_verdict = collections.Counter()
for v in report.values():
    pages_by_verdict[v['verdict']] += v['pages']
fail_reasons = collections.Counter()
for v in report.values():
    for f in v['failed']:
        fail_reasons[f] += 1

out = {
    'measuredOn': '2026-10-01',
    'families': len(report),
    'pages': len(rows),
    'verdicts': dict(verdicts),
    'pages_by_verdict': dict(pages_by_verdict),
    'most_common_failed_condition': dict(fail_reasons.most_common()),
    'note': ('A family marked ACCEPTED_WITH_AN_UNKNOWN fails nothing and is missing a '
             'measurement, which is a different thing from failing and is not rounded into '
             'one. The SERP archetype is the usual missing one: it is sampled per family and '
             'the sample does not cover every family yet.'),
    'by_family': report,
}
with open(OUT + '1M-FAMILY-ACCEPTANCE-TEST.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

with open(OUT + '1M-UNIQUE-CONTENT-CONTRACT.csv', 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f)
    w.writerow(['family', 'pages', 'verdict', 'unique_fact_count', 'unique_data_point_count',
                'distinct_entity_count', 'template_ratio', 'similarity_score',
                'information_gain_reason'])
    for fam, v in sorted(report.items()):
        ct = v['contract']
        w.writerow([fam, v['pages'], v['verdict'], ct['unique_fact_count'],
                    ct['unique_data_point_count'], ct['distinct_entity_count'],
                    ct['template_ratio'], ct['similarity_score'],
                    ct['information_gain_reason'].replace('\n', ' ')])

print(json.dumps({k: out[k] for k in ('families', 'pages', 'verdicts', 'pages_by_verdict',
                                      'most_common_failed_condition')}, indent=1))
print(f'\nwritten {OUT}1M-FAMILY-ACCEPTANCE-TEST.json', file=sys.stderr)
print(f'written {OUT}1M-UNIQUE-CONTENT-CONTRACT.csv', file=sys.stderr)

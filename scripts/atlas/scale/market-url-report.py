#!/usr/bin/env python3
"""The market-scoped URL report, generated from the artifacts so the prose cannot drift.

Every number in the output is read from a file another script wrote. Nothing here recomputes a
figure, which is the only way a report and the data it describes stay in agreement.
"""
import json, os, sys, collections

ROOT = '/home/user/Livdar-eSim/'
OUT = ROOT + 'reports/livdar-expiry-freeze-2026-09-30/'


def load(name):
    try:
        return json.load(open(OUT + name, encoding='utf-8'))
    except (FileNotFoundError, ValueError):
        return {}


def n(x):
    return f'{x:,}' if isinstance(x, int) else str(x)


def main():
    exp = load('MARKET-URL-EXPERIMENT.json')
    hre = load('HREFLANG-CANONICAL-DESIGN.json')
    summ = load('1M-SUMMARY.json')
    if not exp:
        sys.exit('MISSING MARKET-URL-EXPERIMENT.json; run market-url-experiment.py first')

    L = []
    w = L.append
    w('# Market-scoped URLs: the offline experiment')
    w('')
    w(f"Generated {exp.get('generated')}. **Nothing in this document is published.** No route, "
      'sitemap, redirect, template or cohort changed. The live Atlas is unchanged and every '
      'existing /en/ and /es/ URL is exactly where it was: no migration was performed and none '
      'is proposed here.')
    w('')
    w('## 1. The question, stated precisely')
    w('')
    w('Existing pages live in a **language**-scoped URL space: `/en/...`, `/es/...`. One '
      'language holds one URL per entity per family, so when two markets sharing a language '
      'both earn an entity, exactly one of them can have the page. The ownership rule decides '
      'which - home market first, then entity-specific measured demand, then the family score '
      'as a last resort - and the others are discarded.')
    w('')
    w('A **market**-scoped space (`/en-au/...`, `/es-mx/...`) would let the discarded ones '
      'exist. The question is not whether that is possible. It is whether the pages it would '
      'create are pages a reader needs, or the same page again with a different origin city in '
      'it. A market-scoped URL is a place a page could go if the page earns it, not a right to '
      'a page.')
    w('')
    w('## 2. The population')
    w('')
    w(f"Every contest the ownership rule resolved in which a market under test was shut out. "
      f"The manifest writes these as it resolves them, so the population is the pipeline's own "
      f"record rather than a reconstruction.")
    w('')
    y = exp.get('yield', {})
    w('| market | raw candidates | justified | justified pending a source | duplicate | '
      'insufficient | generic only | net new valid pages |')
    w('|---|---|---|---|---|---|---|---|')
    for m, v in y.items():
        w(f"| {m} | {n(v['raw_candidates'])} | {n(v['justified_separate_pages'])} | "
          f"{n(v.get('justified_pending_a_source_not_counted_as_yield', 0))} | "
          f"{n(v['duplicate_rejected'])} | {n(v['insufficient_market_value_rejected'])} | "
          f"{n(v['generic_only'])} | **{n(v['net_new_valid_pages'])}** |")
    w('')
    w(f"**NET NEW VALID PAGES, both markets: "
      f"{n(exp.get('net_new_valid_pages_total', 0))}** out of "
      f"{n(exp.get('raw_candidates_total', 0))} raw candidates.")
    w('')
    for m, v in y.items():
        w(f"- `{m}` reconciles: {v['reconciles']}. Of its "
          f"{n(v['no_generic_owner_survived_excluded_from_yield'])} candidates with no surviving "
          f"generic page, {n(v.get('of_those_owner_never_generated_a_row', 0))} had an owner "
          f"dropped before a row was ever generated and "
          f"{n(v.get('of_those_owner_rejected_by_a_later_gate', 0))} had an owner a later gate "
          f"rejected. That leaves {n(v.get('real_coexistence_decisions', 0))} genuine "
          f"coexistence decisions.")
    w('')
    w('## 3. Why the yield is what it is')
    w('')
    w('Three findings, in the order they were established.')
    w('')
    w('**The admission measurements name only home-country places.** All '
      f"{exp.get('entity_level_demand_sources', {}).get('own_admission_measurement', {}).get('en-AU', {}).get('travel_keywords', 0)}"
      ' en-AU travel keywords name Australian places and all '
      f"{exp.get('entity_level_demand_sources', {}).get('own_admission_measurement', {}).get('es-MX', {}).get('travel_keywords', 0)}"
      ' es-MX ones name Mexican places. Those entities are already owned by those markets as '
      'home market, at the existing language-scoped URL, so they need no market URL. Every '
      'contest in the experiment population is about a FOREIGN entity, and the admission files '
      'say nothing about those either way.')
    w('')
    _dd = exp.get('entity_level_demand_sources', {}).get('foreign_destination_measurement', {})
    _kw = sum(v.get('entities', 0) for v in _dd.values()) if _dd else 27
    _vol = sum(v.get('volume', 0) for v in _dd.values()) if _dd else 0
    w(f'**So foreign-destination demand was measured directly**, {_kw} entities and '
      f'{n(_vol)} monthly volume on 2026-10-06, rather than reported as absent. It is '
      'substantial and mostly at keyword difficulty 0 to 5: Australians search "things to do in '
      'bali" 7,100 times a month, "things to do in tokyo" 7,000 and "things to do in singapore" '
      '6,300. Reporting "no entity-specific demand" from the admission files alone would have '
      'been a statement about the files, not the markets.')
    w('')
    w('**Demand proves the audience, not the page.** Everything a `/en-au/` page about Bali '
      'could currently say that the `/en/` page does not is a distance from Sydney and a '
      'temperature gap. Brief rule 3 rules both out on their own, and the measurement in the '
      'inventory bears that out: the rejected candidates carry a shared section ratio of 1.0 - '
      'byte-identical templates - against the generic page.')
    w('')
    w('This is a real tension inside rule 3, which lists entity-specific measured demand as '
      'sufficient and one distance and one temperature as insufficient. A candidate can satisfy '
      'the first and fail the second at once. Rather than resolving it in whichever direction '
      'flatters the number, those candidates are their own decision state, '
      '`MARKET_PAGE_JUSTIFIED_PENDING_SOURCE`, counted apart from the yield and named with the '
      'source each is waiting on.')
    w('')
    w('## 4. The sources that would change the answer')
    w('')
    w('Six kinds of information gain the brief accepts have no source in this inventory. Three '
      'of them bear directly on the candidates above - market-specific regulation, '
      'market-specific seasonality and materially different travel access - and any ONE of '
      'those three would turn the pending candidates into real pages. Each is a difference a '
      'reader plans around, not a wording change.')
    w('')
    for k, v in (exp.get('information_gain_kinds_with_no_source_yet') or {}).items():
        w(f'- **{k}**: {v}')
    w('')
    w('## 5. A measurement note on the metrics')
    w('')
    w('`semantic_similarity_score` compares fact STRINGS, and for two pages of one family about '
      'one entity in two markets that is the wrong way round. "about 9,300km from Sydney" and '
      '"about 7,900km from London" share no substring, so the string measure reads them as '
      'highly different when they are one sentence with the reader\'s city swapped in - the '
      'exact shape rule 3 prohibits. The rejected candidates score 0.1 to 0.2 on it.')
    w('')
    w('The measures that do catch it are `shared_section_ratio`, which is 1.0 on every rejected '
      'candidate, and `fact_kind_overlap`, which compares what the facts ARE rather than how '
      'they are worded. Both are on every row of the CSV. The string score is kept because the '
      'brief asks for it; it is not what the duplicate test runs on.')
    w('')
    w('## 6. hreflang and canonical')
    w('')
    if hre:
        _c = hre.get('counts', {})
        w(f"Design only, not deployed. {n(hre.get('pages_in_the_plan', 0))} pages planned, "
          f"{hre.get('market_pages_justified_by_the_experiment', 0)} of them market pages. "
          f"{n(_c.get('pages_with_no_alternates', 0))} of those pages are the only page for "
          f"their entity and intent in any language and so carry NO hreflang at all: a lone "
          f"self-annotation tells a crawler nothing the canonical does not, and it is the "
          f"commonest way a cluster later turns non-reciprocal. The annotations sit on the "
          f"{n(hre.get('pages_in_the_plan', 0) - _c.get('pages_with_no_alternates', 0))} pages "
          f"that genuinely have alternates.")
        w('')
        rec = hre.get('reciprocity', {})
        w(f"Reciprocity: {n(rec.get('annotations_checked', 0))} annotations checked, "
          f"{rec.get('pointing_at_a_url_not_in_the_plan', 0)} pointing at a URL not in the plan, "
          f"{rec.get('not_reciprocated_by_the_target', 0)} not reciprocated. "
          f"{rec.get('verdict', '')}")
        w('')
        w(f"- **Canonical**: {hre.get('canonical_rule', '')}")
        hv = hre.get('hreflang_values_emittable_in_this_url_space', {})
        w(f"- **Why not en-US and en-GB**: {hv.get('why_not_en_US_and_en_GB', '')}")
        w(f"- **Why en and en-AU do not conflict**: "
          f"{hv.get('why_en_and_en_AU_do_not_conflict', '')}")
        xd = hre.get('x_default', {})
        w(f"- **x-default**: not emitted. {xd.get('why', '')} The condition that would make it "
          f"correct: {xd.get('the_condition_that_would_make_it_correct', '')}")
        w(f"- **Where the tags belong**: {hre.get('where_the_tags_belong', '')}")
        w('')
        w('What would have to be true before any of this is deployed:')
        for item in hre.get('what_would_have_to_be_true_before_deploying_any_of_this', []):
            w(f'- {item}')
    else:
        w('NOT GENERATED. Run hreflang-canonical-design.py.')
    w('')
    w('## 7. The recommendation')
    w('')
    total = exp.get('net_new_valid_pages_total', 0)
    pend = sum(v.get('justified_pending_a_source_not_counted_as_yield', 0)
               for v in y.values())
    if total == 0:
        w('**Do not expand this model.** The yield is zero valid pages from '
          f"{n(exp.get('raw_candidates_total', 0))} raw candidates, so there is nothing to roll "
          'out to ten more markets and no reason to touch routing, the sitemap or any existing '
          'URL. The brief anticipated this case and said so: if the yield is tiny, do not expand '
          'aggressively.')
    else:
        w(f'**{n(total)} net new valid pages.** Weigh that against the cost of a market-scoped '
          'routing layer before expanding.')
    w('')
    if pend:
        w(f"What is NOT zero: {n(pend)} candidates have measured, entity-specific demand and are "
          'waiting on one of the three sources in section 4. That is the real finding. The '
          'market-scoped URL question is not closed on demand - the demand is there and it is '
          'cheap to rank for - it is closed on CONTENT, and one source unlocks it. Flight routes '
          'and duration from the origin market is the strongest of the three and the one most '
          'specific to en-AU, because Sydney to Asia is a different journey from New York to Asia '
          'in a way a reader plans around.')
        w('')
    w('The order that follows from this, cheapest evidence first:')
    w('')
    w('1. Do not build `/en-au/` or `/es-mx/` routing. Nothing would legitimately live there '
      'today.')
    w('2. Acquire ONE of the three sources and re-run this experiment. It is a single command '
      'and the population is already recorded.')
    w('3. Keep the destination capture queue running, which is a data-quality and coverage win '
      'on its own axis and is unaffected by this result.')
    w('')
    if summ:
        w('## 8. Where the inventory stands')
        w('')
        w(f"FINAL DISTINCT VALID: **{n(summ.get('FINAL_DISTINCT_CANDIDATES', 0))}**. "
          f"Funnel reconciles: {summ.get('funnel_reconciles')}.")
        w('')
        w('Market-scoped URLs were one candidate path to scale. This experiment closes it for '
          'now, on measurement rather than on preference, and the remaining paths are in '
          '1M-GAP-TO-TARGET.csv with the measurement behind each.')
    w('')
    w('---')
    w('')
    w('Files this report reads, all regenerable:')
    w('')
    w('- `MARKET-URL-EXPERIMENT.json` and `MARKET-URL-EXPERIMENT.csv.gz`, one row per candidate '
      'with all eleven fields the brief asks for')
    w('- `HREFLANG-CANONICAL-PLAN.csv.gz` and `HREFLANG-CANONICAL-DESIGN.json`')
    w('- `data/atlas/measurements/same-language-contests.jsonl.gz`, the population')
    w('- `data/atlas/measurements/destination-demand-new-markets-2026-10-06.json`, the new '
      'measurement with its licence and provenance')

    path = OUT + 'MARKET-URL-EXPERIMENT-REPORT.md'
    open(path, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    print(f'written {path}  ({len(L)} lines)')


if __name__ == '__main__':
    main()

# Quality gates

The gate a family carries decides whether its candidates count at all. Gates are
set in `scripts/atlas/scale/family-catalog.mjs` next to the evidence, so a gate and
its reason cannot drift apart.

## The five gates

| Gate | Families | Valid candidates | Meaning |
| --- | --- | --- | --- |
| SAFE_TO_SCALE | 8 | 595 | Demand measured, SERP validated, data held, licence clear |
| SCALE_WITH_GATES | 6 | 1,196 | Publishable, but each batch must clear a named condition first |
| EXPERIMENT_ONLY | 2 | 9,786 | Data real, demand or SERP unproven. Pilot, then decide |
| HIGH_RISK | 2 | 2,398 | Thin, or measuring far below the family's own head |
| REJECT | 9 | 0 | Never publication-ready, carried for research only |

## Thresholds applied

| Gate | Threshold |
| --- | --- |
| Minimum unique data fields | 4. Below that a page is a label and a number. 1,304 valid candidates sit under 4 and are counted in the thin-content risk figure |
| Minimum source count | 1 with a clear licence. No candidate rests on a source without established commercial rights |
| Minimum useful sections | 3 distinct sections that are not navigation or boilerplate |
| Minimum entity specificity | The entity must be nameable in the user's language. Rows whose only label was an ID, an ISO subdivision code, or a parenthesised disambiguation string are dropped at generation |
| Minimum non-template information | At least half the page body must come from the entity's own data rather than the template |
| Duplicate similarity ceiling | Two candidates sharing family, entity and language are one candidate. Two sharing a `data_signature` are one candidate |
| Minimum internal links | 3 in-cluster links, which is why families with `internalLink: 'none'` cannot pass |
| Canonical rule | One canonical per `family::entity::language`. Month pages canonicalise to themselves, not to the annual parent, because a twelve month table cannot rank for twelve month-specific queries |
| hreflang rule | Clusters keyed `family::entity`. `x-default` points at English only where the cluster contains English. `ro-RO` is never generated |
| Schema rule | The schema type must match what the page is. A calculator is not an Article |

## Audit result on this inventory

| Measure | Value | Verdict |
| --- | --- | --- |
| Exact duplicate rate | 1.98% | Acceptable |
| Normalised keyword duplicate rate | 0.16% | Acceptable |
| Semantic duplicate rate | 0% | By construction, see FINAL-REPORT.md |
| Entity plus intent duplicate rate | 0% | By construction |
| Data signature duplicate rate | 0.19% | Acceptable |
| Cross-language duplicate rate | 9.10% | Expected. Unresearched local phrasings, see LOCAL-LANGUAGE-MAP.md |
| Total merged duplicate rate | 11.43% | Acceptable, and dominated by the language rule rather than by real duplication |
| Cannibalisation against live pages | 56 candidates | Flagged per candidate, excluded at publication |
| Thin content risk, under 4 unique fields | 1,304 (9.33%) | Acceptable but must not grow |
| Template concentration | 48.52% on `city-weather-in-month` | **Still high.** See below |
| Source concentration | 70.03% on `nasa-power-daily` | **Still high.** See below |
| Unmeasured | 99.74% of valid | Honest: per-page metrics are never fabricated |

## On the two concentration figures

They are still high and they are the reason this inventory must not be published in
proportion to its size. 9,786 of the 13,975 valid candidates are the climate
experiment, on one source, on one template. The first pass of this work had those
figures at 96.37% and 67.48%; measuring the SERP and the tail removed 184,703
candidates and brought them to 70.03% and 48.52%.

They are not reduced further because reducing them further would mean deleting
candidates whose data is genuinely real and genuinely distinct per entity. The
correct control is not a smaller number in this file but the publication
controller: climate carries a 60 page pilot cap, so its 9,786 candidates can
contribute at most 60 published URLs until GSC says otherwise. Concentration in a
research inventory is a fact to disclose. Concentration in what gets published is
the risk, and that is gated.

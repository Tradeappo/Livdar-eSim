# Reconciliation: the 64 family architecture against the 27 family pass

Date: 2026-09-29. No new research. No Ahrefs units spent. No production change.
Every number here comes from files that already existed before this document.

Sources read: `reports/atlas/product-seo-map.json` (2026-09-24), `reports/atlas/inventory.json`
(2026-09-24), `reports/atlas/source-decisions.md`, `reports/atlas/scale-simulation.json`,
`reports/taxonomy-funnel.json`, `reports/candidate-universe-2026-09-29/`,
and this folder's own `FUNNEL.json` and master inventory.
Machine readable output: `FAMILY-RECONCILIATION.csv`, `RECONCILIATION-SUMMARY.json`.

---

## The short answer

**No. 13,975 is not the Livdar ceiling, and this report withdraws the claim that
1,000,000 is not honestly reachable.**

13,975 is the SEO-validated-and-quality-gated count **within 16 of the 64 known
families, in 9 of the 11 known markets**. It is category C and D of the four
totals the brief asks for, not category A. The previous FINAL-REPORT presented it
as though it bounded the whole programme. That was wrong, and the rest of this
document is the arithmetic.

Three specific errors, stated before the detail:

1. **48 of the 64 known families were never emitted by the new generator.** Of
   those, **11 are NOT_IMPLEMENTED**: their source is held or obtainable and the
   generator simply has no code for them. That is my omission, not a finding about
   the market. They account for **478,088** old candidate combinations.
2. **Two markets were dropped silently.** `en-GB`, which the old architecture lists
   as an **active** market, and `zh-Hant-TW`. The airport measurement in this same
   session proved en-GB matters by 10 to 70 times on the same keyword, which makes
   dropping it the exact error the brief warns about.
3. **Six families were rejected on fewer than 10 keyword samples**, two of them on
   two and three samples respectively, with SERP evidence from three URLs
   extrapolated across 2,951 cities. Those are now marked **UNDER_SAMPLED** and
   their rejections are withdrawn pending real sampling.

---

## 1. What the old universe actually was

| Measure | Value | Source |
| --- | --- | --- |
| Surfaces | 12 | `product-seo-map.json` |
| Verticals | 27 | same |
| Families | **64** (65 in `inventory.json`, generated four hours later) | same |
| Candidate combinations | **2,937,117** (2,939,607 in `inventory.json`) | same |
| Markets enumerable | 11, `ro-RO` excluded | `inventory.json` |
| Blocked candidates | **2,790,097**, 95.0% | `product-seo-map.json` |
| Source ready candidates | 147,020 | same |
| Eligible candidates | **2,600** | same |
| SERP measured | **0** | same, and it says so explicitly |
| Families blocked / eligible / source-ready / research-needed / published | 48 / 3 / 10 / 2 / 1 | same |
| Eligible pages in the registry | 295 across 7 families, SERP measured 19 | `inventory.json` |

The old map's own definition, quoted: *"Candidates are combinations, not pages: a
candidate becomes a page only after the source gate, the measurement gate and the
quality gate."* And `source-decisions.md`, first line: *"Fifty six of sixty four
families cannot produce a page, 2,813,156 candidates of 2,937,117 are blocked, and
almost none of it is for lack of demand."*

So the 2.94M was never a validated opportunity count. It was the taxonomy's
arithmetic capacity, 95% of it blocked on sources, with zero SERP validation. The
brief is right that it is the wrong thing to have quietly discarded; it is also not
1M of proven opportunity.

### The single largest structural fact: 80.8% of the old count is the language axis

| Axis | Candidates | Share |
| --- | --- | --- |
| **language** | **2,372,554** | **80.7%** |
| audience | 244,046 | 8.3% |
| persona | 177,060 | 6.0% |
| time | 118,040 | 4.0% |
| origin | 27,907 | 0.9% |

Per market: en-US 332,598, de-DE 332,598, en-GB 24,723, and 281,211 each for
ja-JP, zh-Hant-TW, it-IT, es-ES, fr-FR, nl-NL, pl-PL, pt-BR.

**The old universe multiplied almost every family by 10 or 11 markets.** A
single-market view of exactly the same architecture is **332,598** combinations.

This matters because the governing brief for the new pass forbade precisely that
multiplication: *"Do NOT multiply every English candidate by every language"*, and
a translated page counts only where the market has real native demand and the
phrasing was researched locally. So a large part of the 2.94M to 13,975 gap is
**definitional**, not a deletion: the new pass was instructed to stop counting the
language axis the way the old one did.

That is an explanation of roughly one order of magnitude. It is not an explanation
of three, and the rest of this report is the other two.

### What "up to 100M" was

`reports/atlas/scale-simulation.json` simulates 300,000 / 1,000,000 / 20,000,000 /
50,000,000 / 100,000,000 pages and reports registry size, sitemap counts, link
edges and similarity cost at each. Its verdicts are infrastructure verdicts: *"no
bottleneck at this size with the current shape"* at 1M, *"link graph above 8 GB, it
must be computed per shard"* at 20M. `reports/taxonomy-funnel.json` carries
`scaleTargets: [300000, 1000000, 5000000, 20000000]`.

**Those were never claims that 100M valid candidates exist.** They are proof the
machinery would not collapse, plus target setting. Nothing in the old artifacts
demonstrates demand or distinct value at those sizes, and the old map's own
`serpMeasured: 0` says no SERP was ever checked. This report neither inherits those
numbers as evidence nor uses their absence as a refutation.

---

## 2. The 64 versus 27 gap, exactly

| | Count | Old candidate combinations |
| --- | --- | --- |
| Families previously known | **64** | 2,937,117 |
| Families covered by the new pass (11 full, 5 partial) | **16** | 875,541 |
| Families absent from the new pass | **48** | 2,061,576 |
| Families in the new catalog | 27 | |
| New families with no old counterpart | **12** | |

The new catalog is not a subset of the old one. It drops 48 and adds 12, and the 12
it adds include the best-performing families in the whole programme, which the old
architecture did not contain at all.

### The 48 absent families, by reason

| Reason | Families | Old candidates | What it means |
| --- | --- | --- | --- |
| **MISSING_DATA** | 25 | 767,935 | No source held. Acquiring one is real work, mostly government publications, one country at a time |
| **NOT_IMPLEMENTED** | **11** | **478,088** | **Source held or obtainable, generator has no code. My omission** |
| **BLOCKED_BY_LICENCE** | 8 | 589,810 | A source exists and may not lawfully be used |
| **NOT_RESEARCHED** | 2 | 193,494 | Old status was `research-needed`, never `blocked` |
| **OUT_OF_SCOPE** | 2 | 32,249 | Connectivity belongs to the eSIM section |

**Not one of the 48 was excluded because research showed no SEO opportunity.** Zero.
Every absence is a source gap, a licence wall, an unwritten generator, or unfinished
research. That is the distinction the brief insists on, and the new report blurred it.

### The 11 NOT_IMPLEMENTED families, named

These are the ones with no excuse. Full rows in `FAMILY-RECONCILIATION.csv`.

| Family | Old candidates | Source state | Why it is not a data problem |
| --- | --- | --- | --- |
| `places.city-category` | 295,100 | ACQUIRABLE_WITH_EFFORT | ODbL. The repo holds `osm-counts-2026-09-25.json`, state PARTIAL, 13 of 44 cities, blocked by the **public Overpass rate limiter**. A self hosted Overpass or a Geofabrik extract finishes it. The largest family in the old architecture |
| `places.neighbourhood-category` | 95,440 | ACQUIRABLE_WITH_EFFORT | Same source |
| `cost-of-living.country-vs-market` | 2,739 | HELD | Old status `source-ready`. Country cost of living is in the repo; the origin market axis is arithmetic |
| `comparisons.country-vs-country` | 26,730 | MISSING_ACQUIRABLE (tax only) | Cost of living half is held; a narrower country pair page is buildable today |
| `rankings.index` | 80 | HELD | Old status `source-ready`, 24 eligible pages, **4 ranking pages are live right now**, and the new generator has no rankings family |
| `destinations.city-hub` | 23,106 | HELD | Old status `source-ready`. Also the natural parent for every city level family the new pass does have |
| `destinations.country-hub` | 498 | HELD | Old status `source-ready` |
| `transport.route-from-market` | 27,907 | HELD | Old status `source-ready` |
| `airports.guide` | 6,488 | HELD | OurAirports is public domain and already in the repo |
| `sport.route` | 0 | ACQUIRABLE_WITH_EFFORT | OSM plus an open forecast source |
| `places.poi` | 0 | ACQUIRABLE_WITH_EFFORT | Same source as places |

Six of these were `source-ready` in the old map, meaning the old pipeline had
already concluded their data exists. The new pass did not evaluate them and did not
reject them. It skipped them.

### By source state, across all 64

| Source state | Families | Old candidates |
| --- | --- | --- |
| ACQUIRABLE_WITH_EFFORT | 6 | 862,700 |
| MISSING_ACQUIRABLE | 28 | 814,338 |
| HELD_PARTIAL | 8 | 606,950 |
| HELD | 16 | 378,080 |
| BLOCKED_COMMERCIAL | 2 | 206,570 |
| OUT_OF_SCOPE | 2 | 32,249 |
| UNKNOWN, never evaluated | 1 | 29,510 |
| BLOCKED_LICENCE | 1 | 6,720 |

**Two figures for the legal wall, and the gap between them is a real ambiguity, not
a rounding error.** By source state, only **213,290** old candidates sit behind
BLOCKED_COMMERCIAL or BLOCKED_LICENCE. By per-family class, **589,810** are
BLOCKED_BY_LICENCE. The difference is `events-verified`, which is **two sources under
one name**: the public-holiday half is held under ODbL and drives the best families
in the programme, while the events half (concerts, festivals, listings) is the one
`source-decisions.md` calls the one that probably cannot be built. The five events
families therefore count as HELD_PARTIAL by source and BLOCKED_BY_LICENCE by family,
and both are true. Take 589,810 as the licence-blocked figure and treat the source
name as needing a split.

Everything outside that is work, money or code rather than law.

---

## 3. The new pass funnel, stage by stage, with attribution

| Stage | Count | Delta | Reason | Families responsible |
| --- | --- | --- | --- | --- |
| Raw combinations | 235,502 | | 24 families emitted of 27 in the catalog | |
| Exact keyword dedupe | 230,832 | -4,670 | Same keyword, same market | `pulse.named-holiday-date` 414, spread across holidays |
| Normalised keyword dedupe | 230,456 | -376 | Case and spacing | mixed |
| Semantic intent dedupe | 230,456 | 0 | Nothing to remove: `intent_cluster_id` is family + entity + language, so a collision means the same page | |
| Entity plus intent dedupe | 230,456 | 0 | Same reason | |
| Data signature dedupe | 230,018 | -438 | Same source, same fields, same key | mixed |
| **Cross language dedupe** | 208,586 | **-21,432** | **Local language variants whose phrasing was never researched.** This is the language rule, not a duplicate finding | `climate.city-month-tail` 24,540 of all merges; ja 6,661, pt 8,439, es 4,542 |
| Source backed | 204,652 | -3,934 | Source not held | `work.city-salary-by-role` 2,845, `transport.airport-to-city` 1,089 |
| **Quality gated** | **13,975** | **-190,677** | **REJECT families** | `climate.city-month-tail` **135,012**, `sport.city-activity-season` **46,212**, `sport.venue-profile` 9,234, `stay.country-rent-trend` 180, `areas.persona-variants` 39 |
| Valid research candidates | 13,975 | 0 | | |

**94.9% of the entire loss is one stage and two families.** `climate.city-month-tail`
and `sport.city-activity-season` account for 181,224 of the 190,677 quality-gate
rejections. Both are now marked UNDER_SAMPLED (section 5). Strip those two
rejections and the same funnel produces roughly **195,000** valid candidates on
identical inputs.

### The old funnel next to it, for shape

| Old stage | Remaining |
| --- | --- |
| Country x intent x vertical x locale | 89,964 |
| Vertical has a product today | 12,852 |
| Intent has a page family | 2,142 |
| Locale is a planned research market | 1,386 |
| Measured demand clears the plan rule | 614 |
| Locale is live (en, de, ro) | 173 |
| Passes every hard gate | **35** |

That funnel, from `taxonomy-funnel.json` for the connectivity vertical, ends at 35.
The old pipeline's own validated output was 35 pages for one vertical and 295
eligible pages across 7 families. The new pass's 1,791 publishable-now is roughly
six times the old eligible count. Neither is a ceiling on the architecture.

---

## 4. Four separate totals, which the previous report collapsed into one

| | Total | Definition | Confidence |
| --- | --- | --- | --- |
| **A. Theoretical distinct universe** | **332,598** single market, **2,937,117** all 11 markets | Combinations the taxonomy allows that could make sense if data and demand exist | Arithmetic is certain; whether each combination deserves a page is untested for 48 of 64 families |
| **B. Source backed universe** | **1,847,730** all markets where the source is held, partial or obtainable with effort; **985,030** where it is held or partial today | Data we can lawfully get | Medium. Rests on `source-decisions.md` verdicts, which are written analysis, not signed licences |
| **C. SEO validated universe** | **13,975**, of which **36 rows MEASURED_DIRECT** and **0 INHERITED** | Demand or SERP evidence sufficient to count it | Low coverage. 287 keywords measured in total, 5 SERPs sampled, across 16 of 64 families and 9 of 11 markets |
| **D. Publishable now** | **1,791** | Publishable today without inventing anything | High. Built from held data in the repo |

The 13,975 figure is C. The previous FINAL-REPORT used it as A. That is the central
error this document corrects.

Note what C actually rests on: **287 measured keywords and 5 sampled SERPs** for a
universe of 235,502 generated rows, and `unmeasured_pct` of 99.74. A category C
number built on a 0.26% measurement rate cannot bound category A.

---

## 5. The big cuts, examined one at a time

Sample sizes come from `FUNNEL.json` `family_samples`. The floor for calling a
rejection evidenced is **10 keyword samples**; below that the decision is
UNDER_SAMPLED and withdrawn.

### A. `climate.city-month` and `climate.city-month-tail`: UNDER_SAMPLED, rejection withdrawn

| | |
| --- | --- |
| Raw potential | 159,552 rows emitted for the tail, 7,380 for tier 1 |
| Real data | NASA POWER, CC BY 4.0, reachable, resolves any coordinate. Genuinely held for 55 cities, acquirable for 31,660 |
| Keyword samples | **2 for tier 1, 2 for the tail** |
| SERP samples | **3**, all measured in `us` only |
| Decision taken | Tier 1 capped at a 60 page pilot; 135,012 tail rows REJECTED, 24,540 merged |
| **Verdict now** | **UNDER_SAMPLED.** Four keyword samples and three SERPs cannot carry a 135,012 row rejection across 11,000 cities |

Two compounding problems. First, `weather in salzburg in july` at 20 and
`weather in reykjavik in june` at 40 are two data points used to characterise 8,602
tier 3 cities plus 2,391 tier 2. Second, **all of it was measured in `us`**, and this
same session proved a `us` read understates a British-English travel phrasing by 10
to 70 times. The climate keywords were never measured in `gb`, `de`, `fr`, `nl` or
`pl`. The tail may well be small; it has not been shown to be small.

### B. `climate.city-day`: REJECT stands

1,077,115 URLs of daily climate normals. No sample needed: nobody searches the
climate normal for 14 March, and the brief names this pattern. Confidence high.
This is the one rejection that needs no evidence beyond the description.

### C. `sport.city-activity-season`: UNDER_SAMPLED, rejection withdrawn

| | |
| --- | --- |
| Raw potential | 46,212 rows emitted, old architecture said 295,100 |
| Real data | NASA POWER climate is held or acquirable; `sport-routes-verified` (OSM) is not held |
| Keyword samples | **3**: running in tokyo 80, cycling in amsterdam 70, hiking in salzburg 20, all in `us` |
| SERP samples | **0** |
| **Verdict now** | **UNDER_SAMPLED.** Three keywords, one market, no SERP, 46,212 rows rejected |

The argument made was that these are the three strongest cases so the tail is zero.
That is a plausible hypothesis measured in the wrong market with no SERP check. The
old architecture also rated this family high priority and blocked it on
`sport-routes-verified`, which is a different and probably more real constraint.

### D. `transport.city-pair-distance`: REJECT stands, but the family was mis-modelled

Rejecting one computed number per page is right. But the old family it stands in for,
`comparisons.city-vs-city`, was a **cost of living** comparison, not a distance, and
that page was never modelled. Marked PARTIAL, and the cost comparison variant is
unevaluated rather than rejected. Old potential 17,620.

### E. `transport.airport-to-city`: correctly blocked, and it is the best thing in the programme

| | |
| --- | --- |
| Keyword samples | **28**, median 600, p75 2,000, median KD 1 |
| SERP samples | **2**, both showing DR 0 to DR 17 winners in the top 8 |
| Decision | BLOCKED on a correct city-centre distance plus fares. 1,089 rows |
| Confidence | **High.** This is the one family with a sample above the floor, and its blocker is a documented data defect, not an SEO judgement |

### F. Holidays: the new pass's genuine contribution

Six pulse families with **no counterpart in the old 64**. Measured demand up to
24,385 for Bayern at KD 2, SERP validated in five markets with a DR 0 page at
position 8 in Poland. 1,288 valid, 595 SAFE_TO_SCALE. Confidence high. The old
architecture's entire pulse surface was events, all five families blocked on a
source `source-decisions.md` calls *"the one that probably cannot be built"*.

### G. Neighbourhood families: HELD_PARTIAL, not rejected

`areas.neighbourhood-profile` 1,403 valid at HIGH_RISK, `areas.city-where-to-stay`
39 valid, `areas.persona-variants` rejected at 39 rows. Old potential across the four
old neighbourhood families: 325,870. The constraint is 39 cities and 4 fields, which
is coverage and depth, not opportunity. `neighbourhoods.city-best-for` was rejected
with **0 keyword samples**, so UNDER_SAMPLED.

### H. Venue and POI families: mixed, and mostly never modelled

`sport.venue-profile` rejected 9,234 rows on a reasoned argument (official sites and
Wikipedia own it) with **0 keyword samples** and **0 SERP samples**. UNDER_SAMPLED by
the same rule, although the reasoning is strong. The POI families,
`places.city-category` at 295,100 and two siblings, were **never modelled at all**
and are NOT_IMPLEMENTED behind a rate limiter.

### I and J. Jobs, work and salary

`work.country-salaries` covered and SAFE_TO_SCALE, 108 valid.
`work.working-time-per-year` covered, 76 valid. `work.city-salary-by-role` blocked,
2,845 rows, correctly: no city salary source is held. `work.city-jobs` and
`work.city-jobs-category` (206,570 old candidates) were **never modelled**, blocked
on `work-rules-verified`, which `source-decisions.md` says to build by hand with
visas. MISSING_DATA, not rejection.

### K. Stay and rent

`stay.country-rent-trend` rejected at 180 rows with **0 keyword samples**:
UNDER_SAMPLED. `rents.city` (115,530) and `rents.neighbourhood` (23,860) never
modelled, MISSING_DATA on city level rent. `stay.city-type` and `stay.near-venue`
(206,570) are the only genuinely commercial wall: affiliate inventory under contract.

### L. Move, visas, tax, health, banking, education

**Thirteen families, 216,354 old candidates, none modelled, none rejected.** All
MISSING_DATA on government publications that `source-decisions.md` says to build
manually in destination order. `visa-rules-verified` alone blocks 7 families.
This whole surface is unexamined rather than examined and found wanting.

### M. Community and events

`community.city-topic` and the five events families: BLOCKED_BY_LICENCE, 383,240 old
candidates. Meetup, Eventbrite, Fever and Ticketmaster are excluded by standing
instruction and `source-decisions.md` found no viable open alternative. **This is the
one large cluster where the wall is real and the verdict should stand.**

### N. Tools and calculators

`tools.calculator` covered, SAFE_TO_SCALE, 70 valid, highest value per page in the
catalog. Three old tool families folded into it. `rankings.index` NOT_IMPLEMENTED
despite 4 ranking pages being live. The new `calendar.*` trio has no old counterpart
and carries the largest measured volumes in the entire programme:
`calendrier 2026` 627,451, `calendar 2026` 611,880, `kalender 2026` 333,644.

### O. Safety

`safety.city` and `safety.country-advice`, 32,249 old candidates, never modelled.
MISSING_DATA. `travel-advice-verified` is government published and citable, so this
is probably one of the cheaper gaps, and it was never costed.

### P. Areas and local discovery

Covered above: the neighbourhood half is HELD_PARTIAL, the places half is
NOT_IMPLEMENTED behind a rate limiter, `activities.city-things-to-do` is the single
family whose source was **never evaluated in writing at all** (UNKNOWN, 29,510).

### The six UNDER_SAMPLED families

`weather.city-month`, `sport.city-activity`, `neighbourhoods.city-best-for`,
`work.city-salaries`, `rents.city`, `comparisons.city-vs-city`. Their rejections are
withdrawn. Restoring them to "unproven" rather than "rejected" returns **181,443**
rejected rows, or **207,047** counting the rows they also lost to merging, to the
unresolved pile.

---

## 6. Over-filtering audit

| Check | Answer | Count affected | Correction needed |
| --- | --- | --- | --- |
| Rejected a family because one keyword measured small? | **YES, in effect** | 6 families | Mark UNDER_SAMPLED. Done in this report and in `FAMILY-RECONCILIATION.csv` |
| Extrapolated 2 to 3 SERP samples across thousands of cities? | **YES** | 3 SERPs to 11,553 cities, 159,552 rows | Withdraw the tail rejection until at least 20 SERPs across tiers and markets |
| Rejected pages because source concentration was high? | **No, but concentration triggered it** | 0 rejected on concentration | None. Concentration prompted the re-examination; the rejection rested on the under-sampled measurement, which is the error above |
| Confused template concentration with duplicate content? | **No** | 0 | Template concentration 48.52% was reported and not acted on |
| Cut markets without local-language research? | **YES** | `en-GB` and `zh-Hant-TW` dropped entirely; 305,934 old candidates | Restore both. en-GB is an **active** market in the old architecture |
| Used the US database for queries that needed GB or local? | **YES, and caught it only for airports** | All 4 climate samples and all 3 sport samples are `us` only | Re-measure climate and sport in gb, de, fr, nl, pl before any verdict |
| Treated a missing API or source as an SEO rejection? | **Partly, in the framing** | 36 families, 1,246,023 old candidates never modelled | The per-family gates said MISSING_DATA correctly; the FINAL-REPORT's "no path exists" language conflated the two. Corrected here |
| Treated lack of held data as impossibility? | **YES, in the conclusion** | The 1M verdict | Withdrawn |
| Excluded languages or markets for lack of a local dataset? | **YES** | 21,432 rows merged; ja 6,661, pt 8,439, es 4,542 | Correct under the language rule as a *counting* decision, wrong if read as a finding about those markets. They are unresearched, not empty |

---

## 7. Market coverage in the new pass

| Market | Valid candidates | Families with a valid row | Keywords measured | Verdict |
| --- | --- | --- | --- | --- |
| en-US | 11,858 | 16 | 10 | Covered, and it carries 84.9% of the valid universe |
| de-DE | 630 | 15 | 23 | Best measured market |
| fr-FR | 537 | 15 | 13 | Reasonable |
| nl-NL | 335 | 13 | 9 | Reasonable |
| pl-PL | 318 | 13 | 2 | Thin measurement |
| it-IT | 144 | 4 | **0** | **Not researched** |
| es-ES | 119 | 5 | **0** | **Not researched** |
| pt-BR | 32 | 4 | **0** | **Not researched** |
| ja-JP | **2** | 1 | **0** | **Effectively absent** |
| **en-GB** | **0** | **0** | 17 | **Dropped from the generator.** The 17 measured keywords are the airport family, whose rows are all blocked |
| **zh-Hant-TW** | **0** | **0** | **0** | **Absent entirely from the new pass** |

Total measured keywords across the programme: 287 (86 de, 48 pl, 41 nl, 38 en-us,
37 fr, 37 in this folder's SAMPLES.tsv).

**Five of eleven markets have zero measured keywords and two have zero candidates.**
Per the brief's own rule, none of these may be used to compute a global ceiling, and
the previous report's ceiling was computed over all of them.

---

## 8. Is 1,000,000 reachable?

**Not demonstrated, and not refuted.** Both claims would need evidence that does
not exist.

What is now established:

- The theoretical universe is 332,598 single market and 2,937,117 across 11 markets,
  from the old architecture's own arithmetic.
- 48 of 64 families were never evaluated by the new pass. None was excluded for lack
  of SEO opportunity.
- 1,847,730 old-style candidates sit on sources that are held, partial or obtainable
  with effort. Only 245,839 sit behind a real legal wall.
- The measurement base for any verdict is 287 keywords and 5 SERPs.

What would have to be true for 1,000,000 to be real, and none of it is known:

1. The language axis would have to be legitimate for most families, meaning
   researched local phrasing and materially different local data in 8 or more
   markets. Today it is researched in 5 and measured in 5.
2. `places-data-verified` would have to be finished, unlocking the 390,540 candidate
   POI cluster, and each page would have to survive the distinct-value test on OSM
   counts alone, which the source file itself warns about (*"Dubai shows 0 coworking
   spaces and 3 bars, which is a fact about the map rather than about Dubai"*).
3. The city level sources (cost of living, rent, salary) would have to exist for
   enough cities to make the city families real rather than country pages with a city
   in the title.
4. The visa, tax and work rules corpus would have to be built by hand for enough
   destinations.

**Defensible interval today**, stated as a range rather than a number:

| Bound | Value | What it means |
| --- | --- | --- |
| Publishable this week | **1,791** | Held data, gates passed, nothing invented |
| Publishable after the three cheap acquisitions | roughly **3,600** | Airport distance fix, airport fares, holidays for US GB CA AU JP |
| Unresolved but source-backed and unrejected | **180,000 to 200,000** | The withdrawn UNDER_SAMPLED rejections plus the cross-language merges, on families already modelled |
| Source-backed across the full 64 family architecture | **0.9M to 1.8M** old-style, market-multiplied | Depends entirely on the language axis question |
| Theoretical | **332,598** single market, **2.94M** all markets | The old architecture's arithmetic |

So the honest sentence is: **Livdar's validated universe is 13,975 today, its
publishable universe is 1,791, and its architectural universe is between 330,000 and
2.9M depending on how the language axis is counted. Whether 1,000,000 of those are
genuinely distinct is unknown, because 48 of 64 families and 5 of 11 markets have
never been measured.**

---

## 9. What has to be researched to answer the 1M question

In leverage order, and none of it needs Ahrefs to start:

1. **Finish `places-data-verified`.** Self hosted Overpass or a Geofabrik extract.
   Unlocks 390,540 old candidates across 3 families. The blocker is a public rate
   limiter, and it is the single largest unexamined block in the architecture.
2. **Restore en-GB and zh-Hant-TW to the generator.** en-GB is an active market and
   the airport measurement showed a 10 to 70 times gap on the same keyword.
3. **Re-measure climate and sport properly**: 20 or more keywords per family across
   tiers, in gb, de, fr, nl and pl, plus 20 SERPs. Decides 181,400 rows.
4. **Implement the 11 NOT_IMPLEMENTED families**, starting with the 6 the old map
   already called `source-ready`. No new data needed. 478,088 old candidates.
5. **Cost the language axis honestly**, family by family: does the local market have
   native demand, and does localisation change the data or only the wording. This one
   question moves the ceiling by a factor of 10.
6. **Measure it, market by market**, in the 5 markets with zero measured keywords.

Until 1 through 6 exist, any statement about 1,000,000 in either direction is a
guess. This document's contribution is to say which guess the evidence currently
supports, which is none.

---

## Files

- `FAMILY-RECONCILIATION.csv`: all 64 old families, one row each, with old potential,
  new rows, class, source state, SEO validation strength and action needed.
- `RECONCILIATION-SUMMARY.json`: every aggregate in this document as data.
- `scripts/atlas/scale/reconcile-old-vs-new.mjs`: regenerates both. It reads only
  existing artifacts and spends nothing.

---

## Final answer, in the requested form

| # | Item | Value |
| --- | --- | --- |
| 1 | **Old theoretical universe** | **2,937,117** across 11 markets; **332,598** single market. 80.7% of the difference is the language axis |
| 2 | **Families previously known** | **64** in `product-seo-map.json`; 65 in `inventory.json` four hours later, a generator drift worth noting |
| 3 | **Families evaluated in the new pass** | **16 of the 64** (11 fully, 5 partially), plus **12 new families with no old counterpart**. 27 in the catalog, 24 actually emitted |
| 4 | **Families missing from the new pass** | **48**. MISSING_DATA 25, NOT_IMPLEMENTED 11, BLOCKED_BY_LICENCE 8, NOT_RESEARCHED 2, OUT_OF_SCOPE 2. **None excluded for lack of SEO opportunity** |
| 5 | **Raw combinations in the new pass** | **235,502** |
| 6 | **Valid after dedupe** | **13,975** |
| 7 | **Source-backed** | **204,652** rows inside the new pass. Across the full 64 family architecture: **985,030** old-style candidates on sources held or partially held, **1,847,730** including obtainable-with-effort |
| 8 | **SEO-validated** | **13,975** passed the quality gate, but only **36 rows are MEASURED_DIRECT** and **0 inherit a family sample**. The whole evidence base is **287 measured keywords and 5 sampled SERPs**. `unmeasured_pct` is 99.74 |
| 9 | **Blocked by missing data** | **3,934** rows inside the new pass. Across the architecture: **767,935** old candidates in 25 MISSING_DATA families, plus **478,088** in 11 NOT_IMPLEMENTED families that are not blocked by anything except missing code |
| 10 | **Rejected with strong evidence** | **39 rows.** Only `areas.persona-variants` survives on a rule the brief itself states. Three further families are structurally rejected and emitted zero rows: `climate.city-day` (1,077,115 theoretical), `transport.city-pair-distance` (502M theoretical), `pulse.city-holidays`. **No rejected family has a keyword sample that meets a 10 sample bar** |
| 11 | **Under-sampled or uncertain** | **212,109 rows**: 181,443 rejected in 6 UNDER_SAMPLED families, 9,234 rejected in `sport.venue-profile` on strong reasoning with zero samples, 21,432 merged for unresearched local phrasing. Plus **48 families never evaluated** |
| 12 | **Publishable now** | **1,791** |

### The direct questions

**Is 13,975 the Livdar ceiling? NO.**

**What is it, exactly?** It is the count of candidates that passed dedupe and the
quality gate **within the 16 of 64 families the new generator modelled, in 9 of the
11 known markets, on an evidence base of 287 keywords and 5 SERPs**. In the brief's
own four-way split it is category C, and a weak C: 99.74% of it is unmeasured. It is
not category A and it was wrong to present it as one.

**Is 1,000,000 demonstrated now? NO.** Nothing in either the old or the new artifacts
shows a million genuinely distinct, source-backed, demand-validated candidates. The
old 2.94M was 95% source-blocked with zero SERP validation; the new 13,975 rests on
287 keywords.

**Is 1,000,000 refuted now? NO, and the previous report's claim that it is not
honestly reachable is withdrawn.** That claim was drawn from a pass that never looked
at 48 of 64 families, dropped an active market, and rejected its two largest blocks
on 2 and 3 keyword samples measured in the wrong country. It was a conclusion about
the generator, stated as a conclusion about the market.

**The defensible interval today:**

- **1,791** publishable this week.
- **roughly 3,600** after the three cheap acquisitions already costed.
- **180,000 to 200,000** unresolved but source-backed and no longer rejected, on
  families already modelled.
- **330,000 single market to 2.9M across markets** as the architectural universe,
  where the spread is one unanswered question: is the language axis legitimate.
- **Unknown** above that, because 48 families and 5 markets have never been measured.

**What has to be researched to know whether 1,000,000 is realistic**, in leverage
order: finish the OpenStreetMap places capture (390,540 candidates behind a rate
limiter); restore en-GB and zh-Hant-TW; re-measure climate and sport with 20 or more
keywords per family across tiers and markets plus 20 SERPs; implement the 11
NOT_IMPLEMENTED families, 6 of which the old map already called source-ready; and
answer the language-axis question family by family, because that single question
moves the ceiling by a factor of ten.

### What I got wrong, listed plainly

1. Presented a category C number as the programme's ceiling.
2. Never reconciled against `reports/atlas/product-seo-map.json`, which was in the
   repo and holds the 64 family architecture.
3. Dropped en-GB, an active market, and zh-Hant-TW, from the generator without
   saying so, after proving in the same session that en-GB changes a keyword's volume
   by up to 70 times.
4. Rejected 181,224 rows on 5 keyword samples and 3 SERPs, all measured in `us`.
5. Wrote "no path exists" about families whose only blocker is a public API rate
   limiter or unwritten code.

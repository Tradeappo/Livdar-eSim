# Publication controller, 500 to 100M

## Status of this document

**Part A below is the existing controller, preserved verbatim** from
`reports/scale-universe-2026-09-29/PUBLICATION-CONTROLLER.md`. It was written in the
scale-universe pass, it is sound, and it is the operative document. It has not been
rewritten. Part B extends it with the steps beyond 1M, the dimensions the freeze brief
asked for that Part A does not carry (source confidence, cannibalisation, per-cohort
rollback identity), and the four per-family caps that round three's measurements
require. Part C records the three places where later measurement changed a Part A
assumption.

Where Part A and Part B disagree, **Part A wins on gates and STOP conditions** — those
were designed against real Google behaviour and nothing since has contradicted them.

---

# PART A — the existing controller, unchanged

# Publication controller

The brief asks for a controller stepping 500, 2k, 5k, 25k, 100k, 250k, 500k, 1M.
Steps beyond 5,000 are written here for completeness, but they are unreachable with
the current inventory: the whole validated universe is 13,975 and the whole
publishable-now set is 1,791. A controller that pretends otherwise would be the
padding the brief forbids, so each unreachable step records what it would need.

## State today

- 500 Atlas pages live. 497 of them began serving on 2026-09-28 after a 404 outage,
  so no GSC window before that date says anything about them.
- Cohort 003 is **not** published, per instruction.
- 1,791 candidates are publishable now, 595 of them SAFE_TO_SCALE.

## Step gates

Every step requires **all** of its row to be true on the **previous** step's pages
before the next step opens.

| Step | Pages | Indexation health | Impressions per page | Crawl stability | Duplicate stability | Canonical stability | GSC query coverage | Removal / deindex ratio | Scaled-content signals |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 500 (live) | baseline only | baseline only | baseline only | baseline only | baseline only | baseline only | baseline only | none present |
| 1 | +500 | >=60% indexed in 28 days | >=3 median | no crawl-rate drop >20% | merged rate <5% | 100% self-canonical or intended | >=40% of pages with >=1 query | <2% | none |
| 2 | +1,500 (to 2k) | >=65% | >=5 median | stable | <5% | 100% | >=50% | <2% | none |
| 3 | +3,000 (to 5k) | >=70% | >=6 median | stable | <4% | 100% | >=55% | <1.5% | none |
| 4 | to 25k | >=70% | >=8 median | stable | <4% | 100% | >=60% | <1.5% | none |
| 5 | to 100k | >=75% | >=10 median | stable | <3% | 100% | >=65% | <1% | none |
| 6 | to 250k | >=75% | >=10 median | stable | <3% | 100% | >=65% | <1% | none |
| 7 | to 500k | >=80% | >=12 median | stable | <3% | 100% | >=70% | <1% | none |
| 8 | to 1M | >=80% | >=12 median | stable | <3% | 100% | >=70% | <1% | none |

## What each step needs that does not exist yet

| Step | Blocker |
| --- | --- |
| 1 (to 1,000) | Nothing. 1,791 publishable candidates exist. This step is available today once a clean GSC window closes |
| 2 (to 2,000) | Needs gaps 1 to 3 in DATA-SOURCE-GAPS.md closed, which yields roughly 3,580 publishable |
| 3 (to 5,000) | Needs the climate pilot to pass, releasing part of the 9,786 experimental block, **or** a source not yet evaluated |
| 4 (to 25,000) | Needs neighbourhood breadth plus city salary data plus a validated climate family. All three |
| 5 to 8 (100k and beyond) | **No path exists with the current or gap-closed source set.** The honest ceiling is roughly 18,600 validated candidates, 25,800 with neighbourhood breadth. These steps are recorded as unreachable, not as planned |

## Per-family caps, which bind regardless of step

| Family | Cap | Why |
| --- | --- | --- |
| `climate.city-month` | 60 pages | SERP sampled three times: AI Overview, knowledge card and question block sit above the first organic result, and 1,400 searches yield roughly 550 organic visits. Pilot, measure, then decide |
| `climate.city-annual` | 0 until the month pilot reports | It is the parent of the pilot and its own head is KD 79 |
| `areas.neighbourhood-profile` | 200 pages | Four fields per page. HIGH_RISK |
| `move.country-cost-of-living` | 0 new | 193 already live and the family's best measured keyword is 2,290 |
| `transport.airport-to-city` | 0 until gaps 1 and 2 close | The distance field is wrong. See DATA-SOURCE-GAPS.md |
| SAFE_TO_SCALE families | uncapped within the step | Measured, validated, licensed |

## Hard STOP conditions

Publication halts immediately, and no further step opens, if any of these appears.
These are not thresholds to weigh. They are stops.

1. A manual action or a scaled-content-abuse notice in Search Console.
2. Indexation on a published batch below 40% at 28 days.
3. More than 10% of a published batch deindexed after having been indexed.
4. Median impressions per page below 1 at 28 days on a batch of 500 or more.
5. Crawl requests down more than 40% week on week without a deployment cause.
6. Canonical drift: Google selecting a different canonical on more than 5% of a batch.
7. Any published page found to carry the wrong `cityKm`-style fact, that is, a
   number presented as a measurement that the source does not actually measure.
8. Any published page missing its required source attribution.
9. `npm run dashcheck` reporting a non-zero count.
10. A Romanian Atlas URL appearing in any sitemap.

## Rollback

Each step's URLs are released as one batch with one identifier, so rollback is
per-batch: remove from sitemap, return 410 for pages with no inbound links,
301 for pages with any. Rollback is the default response to a STOP condition,
not a last resort, and the batch identifier is what makes it a single operation.

---

# PART B — the extension

## B1. Steps beyond 1M

Part A stops at 1M and records steps 5 to 8 as unreachable. Nothing since has made
them reachable. These rows exist so the ladder is complete, and each one states the
condition that would have to be true first — not a plan.

| Step | Pages | Indexation | Impressions/page | Duplicate | GSC query coverage | Deindex ratio | Condition that must hold first |
|---|---|---|---|---|---|---|---|
| 9 | to 3M | >=80% | >=12 median | <3% | >=70% | <1% | source-backed exceeds 3M, which CURRENT does not. **Unreachable** |
| 10 | to 10M | >=85% | >=15 median | <2% | >=75% | <0.5% | exceeds source-obtainable in every scenario. **Unreachable** |
| 11 | to 100M | n/a | n/a | n/a | n/a | n/a | **Never a publication target.** 100M is a candidate-graph capacity, not a page count. See `13-100M-ARCHITECTURE.md` |

## B2. The dimensions Part A does not carry

Part A gates on indexation, impressions, crawl, duplicates, canonicals, query coverage,
deindex ratio and scaled-content signals. Three more belong in the same row, and they
apply from step 1 onward.

**Source confidence.** No URL publishes unless every fact on it comes from a row in
`07-DATA-SOURCES.csv` whose `can_we_publish_and_index` is affirmative and whose
`confidence` is not low. A page whose facts trace to a low-confidence row is a
candidate, not a publishable page, whatever its demand.

| Step | Minimum source confidence | Minimum fields per page from a high-confidence source |
|---|---|---|
| 1 to 3 | no low-confidence rows at all | 6 |
| 4 (25k) | no low-confidence rows | 8 |
| 5+ | no low-confidence rows, and no single-source pages in any family | 10 |

**Cannibalisation.** The Rank Tracker pass established the discipline: 500 LIVE_PRIMARY
keywords, one per live page, **zero cannibalisation groups**. That is the standard to
hold, not an achievement to note.

| Step | Cannibalisation gate |
|---|---|
| every step | zero groups where two URLs in the same market target the same primary keyword |
| every step | no new URL may take a primary keyword already assigned to a live URL |
| 4 (25k) and beyond | no more than 2% of a batch sharing a parent topic with an existing live page, measured before publication, not after |

A batch that fails the cannibalisation check does not get published and trimmed. It
gets re-mapped, because a URL published against a taken keyword damages the page that
already holds it.

**Cohort identity, for rollback.** Part A's rollback is per-batch with one identifier.
That stays, and every batch additionally records: the cohort id, the publication date,
the families in it, the source rows its facts came from, and the gate readings that let
it through. Without those five, a rollback decision six weeks later is guesswork.

## B3. The per-family caps round three requires

These are additions to Part A's cap table, on the same binding basis: they bind
regardless of step.

| Family | Cap | Why |
|---|---|---|
| `stay.wg-student-furnished` | **35 pages, one per measured city** | Round three refuted the 9,000-page estimate. `wg zimmer` has 8 city keywords above 300 volume; all three patterns together reach about 35 cities, all university cities. Publishing beyond the measured cities is publishing against no demand |
| `poi.entity-parking` | **0 new, pending re-scope** | The 3,000-page estimate was refuted on composition: the demand is airport parking and operator brands, not attraction parking. The airport parking demand is real and belongs on the transport node pages instead. Re-scope before publishing anything |
| `property.city-buy` | **350 pages, split 272 `haus kaufen` / 78 `wohnung kaufen`** | Both patterns exhausted their tail in the largest market at those counts |
| `events.*` with a time-window modifier | **0** | `heute`, `morgen`, `wochenende`, `dieses wochenende`, `this weekend`, `aujourd'hui` and equivalents cannot be served by a static page. They are the majority of measured event demand and they are not publishable as durable URLs. This is a permanent exclusion, not a cap |
| `jobs.rules-durable` | **uncapped once breadth is measured; 9 measured heads publishable now** | New family, no feed and no licence needed. `minijob grenze 2026` at 48,000 volume KD 5. Its breadth has not been exhausted, so measure before scaling |
| `rents.rules-durable` | **uncapped once breadth is measured; 8 measured heads publishable now** | New family, zh-Hant-TW. `租屋補助` at 269,000 volume KD 0. Public rules, no licence. Breadth not yet exhausted |
| `atlas.city-family-carried-forward` | **uncapped within the step** | The only large family whose breadth exceeded every limit tested, in six languages. Global destination universe |
| `places.city-category` | **uncapped within the step** | Breadth exhausted at 283 for one category in one market and the micro-geo axis (neighbourhood, near-station) is real. Highest CPC measured |

---

# PART C — where later measurement changed a Part A assumption

Three corrections, each with the evidence. Part A's gates are untouched; these concern
its figures and one cap.

**C1. The universe figures in Part A's preamble are superseded.** Part A says "the whole
validated universe is 13,975 and the whole publishable-now set is 1,791". The 1,791
still stands and is still the publishable-now figure. The 13,975 was reconciled in a
later pass and the current layered figures are in `11-CURRENT-VS-FEED-BACKED.md`:
demand-supported 1,656,362, indexable today 64,416. Part A's conclusion is unaffected —
steps 5 to 8 remain unreachable — but the numbers it cites should not be quoted.

**C2. `transport.airport-to-city` keeps its cap of 0, and the reason to fix it is now
much stronger.** Part A caps it at 0 because the distance field is wrong — a number
presented as a measurement that the source does not measure, which is also STOP
condition 7. That cap is correct and stays. What changed is the value of fixing it:
round three measured about 70 airports above 200 volume and 150+ above 50, with
`hotels near X airport` at KD 0 to 4 carrying 70 to 120 cent CPC, the best monetising
profile in the project. Closing data-source gaps 1 and 2 moved from housekeeping to
the highest-return data task on the list.

**C3. Part A's step 4 blocker list is now partly satisfied.** It requires
"neighbourhood breadth plus city salary data plus a validated climate family, all
three" for 25,000. Neighbourhood breadth is now partly evidenced: the
`places.city-category` micro-geo axis measured about 60 London neighbourhood queries
and about 40 near-station queries for a single category. That is not the same as a
neighbourhood *fact* source — the `areas.neighbourhood-profile` cap of 200 pages on
four-fields-per-page HIGH_RISK grounds still binds — but the demand half of the
requirement is no longer unproven.

## The one thing that has not changed

Part A's ten STOP conditions are the most valuable paragraph in this freeze. Nothing in
three subsequent passes has given any reason to soften one of them, and STOP condition
7 in particular — no number presented as a measurement that the source does not
actually measure — is the rule that keeps a programmatic site publishable at all.

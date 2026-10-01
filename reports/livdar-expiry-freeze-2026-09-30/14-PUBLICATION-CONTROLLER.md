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

Where Part A and Part B disagree, **Part A wins on gates and STOP conditions** - those
were designed against real Google behaviour and nothing since has contradicted them.

---

# PART A - the existing controller, unchanged

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

# PART B - the extension

## B1. Steps beyond 1M

Part A stops at 1M and records steps 5 to 8 as unreachable. Nothing since has made
them reachable. These rows exist so the ladder is complete, and each one states the
condition that would have to be true first - not a plan.

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

# PART C - where later measurement changed a Part A assumption

Three corrections, each with the evidence. Part A's gates are untouched; these concern
its figures and one cap.

**C1. The universe figures in Part A's preamble are superseded.** Part A says "the whole
validated universe is 13,975 and the whole publishable-now set is 1,791". The 1,791
still stands and is still the publishable-now figure. The 13,975 was reconciled in a
later pass and the current layered figures are in `11-CURRENT-VS-FEED-BACKED.md`:
demand-supported 1,656,362, indexable today 64,416. Part A's conclusion is unaffected - 
steps 5 to 8 remain unreachable - but the numbers it cites should not be quoted.

**C2. `transport.airport-to-city` keeps its cap of 0, and the reason to fix it is now
much stronger.** Part A caps it at 0 because the distance field is wrong - a number
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
neighbourhood *fact* source - the `areas.neighbourhood-profile` cap of 200 pages on
four-fields-per-page HIGH_RISK grounds still binds - but the demand half of the
requirement is no longer unproven.

## The one thing that has not changed

Part A's ten STOP conditions are the most valuable paragraph in this freeze. Nothing in
three subsequent passes has given any reason to soften one of them, and STOP condition
7 in particular - no number presented as a measurement that the source does not
actually measure - is the rule that keeps a programmatic site publishable at all.

# PART D - the aggregation shapes, and the two gates Part A cannot express

Part A is unchanged and still governs. This part exists because the quality-first pass
added page shapes that Part A was not written for, and because two of the gates those
shapes need are structural rather than numeric, which is the one thing Part A's cap table
cannot say.

## D1. Per-shape caps, ordered by measured archetype rather than by size

Each cap below comes from the SERP measured for that shape on 2026-10-01, recorded in
`08b-SERP-EVIDENCE-AGGREGATION-SHAPES.csv`. A shape is not capped by how many candidates
exist for it; it is capped by how good its SERP looked.

| shape | archetype | first release | cap until GSC says otherwise |
| --- | --- | --- | --- |
| `city_opening` | OPEN_SPECIALIST_PAGE_WINS | 150 | 2,000 |
| `city_cuisine` | OPEN_LOCAL_PACK_ABOVE_ORGANIC | 300 | 10,000 |
| `area_category` | OPEN_LOCAL_PACK_ABOVE_ORGANIC | 300 | 10,000 |
| `city_category` | OFFICIAL_PLUS_AGGREGATOR_MIXED | 300 | 8,000 |
| `city_areas_hub` and `area_parent` | OFFICIAL_PLUS_AGGREGATOR_MIXED | 150 | 3,000 |
| `city_sport` | OFFICIAL_PLUS_AGGREGATOR_MIXED | 100 | 1,500 |
| `notable_entity` and `wikidata_notable` | ENTITY_OWNED_PLUS_WIKIPEDIA_DIRECTORIES_BELOW | 200 | 5,000 |
| `area_cuisine` | AGGREGATOR_AND_VENUE_OWNED | 100, experiment | 100 until proven |
| `city_attribute`, `area_attribute`, `area_opening` | not measured or no SERP data | 0 | blocked pending a SERP sample |

`city_opening` gets the smallest first release and the clearest path to its cap because
its SERP was the best measured: a DR 35 page holds position 2 above outlets at DR 56 to
81. `area_cuisine` is capped at its experiment size because its SERP had no independent
list in the top eight at all.

## D2. Two structural gates, which no cap can replace

**A page may not publish before its parent.** An area page whose city page is unpublished
is an orphan on a live site, not just in the manifest. The controller must release in
order: city category, then area category, then area modifier. The manifest carries
`parent_url` so this is checkable before release rather than after.

**A proximity-attributed area page may not publish in the same cohort as a
containment-attributed one.** Every area page records in `attribution` whether its POI
were assigned by polygon containment or by documented proximity to a place node. Polygons
are the minority everywhere measured: France 3,714 of 34,614 places, Germany 1,829 of
15,667, Poland 584 of 13,063. Release containment first, compare the two groups in GSC
after 28 days, and if proximity pages underperform materially, stop generating them. Mixing
them in one cohort makes that comparison impossible, and the comparison is the only way to
learn whether the weaker attribution method is worth keeping.

## D3. What is NOT publishable regardless of score

- Any candidate whose `source_status` is BLOCKED, and any whose `status` is MISSING_DATA.
  They are in the inventory because hiding them would lose the research, not because they
  are ready. The final report breaks the total down by source readiness for this reason.
- Any candidate whose `market_demand_evidence` is `none`. A family proven in other markets
  reads `family_measured_elsewhere` and may publish under the caps above; a family with no
  evidence anywhere may not.
- Any shape in the last row of the D1 table, until its SERP has been sampled. Treating
  absence of SERP evidence as a reason to publish is the mirror image of treating it as a
  reason to reject, and this project has already made the second mistake once.

## PART E - what the localisation gate means for publication

Added 2026-10-01, after the gate was made destination-aware and the inventory fell from
233,646 to 198,050.

### E1. The cross-language inventory is 223 pages, and it should be published as 223 pages

Of 198,050 candidates, 197,827 are NATIVE_LOCALE: the page is written in the language of the
country it describes and needs no cross-language justification. Exactly 223 are
VALID_LOCALIZATION, which means a measured keyword for the family in that market AND measured
demand from that market, or that language, for that specific destination.

The controller must not treat those two groups the same way. A native page competes in a
market's own language about its own country, which is the ordinary case the cohort caps were
measured on. A cross-language page competes against that country's own publishers writing in
their own language, plus the searcher market's established travel media. 223 is a small enough
set to publish as one cohort and watch individually in GSC, and that is what it should be: a
single named cohort, not sprinkled through the others, so its performance can be read on its
own. If cross-language pages underperform native pages at the same caps, the gate's threshold
is the thing to revisit, and that comparison is only possible if the two are not mixed.

### E2. LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION is not a publication queue

44,628 rows carry this class. They are kept in the rejected file with a reason naming the
family demand they have and the destination demand they lack. They are NOT a backlog waiting
for capacity, and the controller must never promote one because a cohort has room.

The only thing that moves a row out of this class is a measurement: demand for that
destination, from that market or in that language. That measurement costs Ahrefs units and
the measurement, not the page, is the next step. The reach file is the single place such a
measurement is recorded, and the gate reads it on the next run, so the path from measurement
to published page is one file and one command.

### E3. Two places a cohort can still go wrong on locale

- **Do not publish a cross-language page before its native counterpart.** If a German page
  about Prague and a Czech page about Prague both existed, the Czech one is the primary and
  the German one is the alternate. Czech is not a Livdar market, so for Prague the question
  does not arise, but it will the moment two Livdar markets share a destination: a German page
  about Rome has an Italian counterpart in the inventory, and the Italian one is the primary.
- **Do not let the two English markets both claim a destination page.** en-US and en-GB
  collapse to one `/en/` URL. The manifest dedupes them, but the controller assigns cohorts
  per market, so a naive split would schedule the same URL twice. Cohort assignment must key
  on the URL, not on the market.

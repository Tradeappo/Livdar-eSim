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

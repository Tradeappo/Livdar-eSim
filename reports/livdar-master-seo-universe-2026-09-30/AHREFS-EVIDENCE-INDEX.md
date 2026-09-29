# Ahrefs evidence index, frozen

The subscription ends **8 October 2026**. Everything listed here is
**FROZEN_AFTER_AHREFS_EXPIRY**: these files are the only copy after that date.

Units: 1,200,404 of 2,000,000 used at the start of the first pass. **13,550 spent
on pass one, 19,608 spent on pass two (the three gating measurements), 33,158 in
total. 1,233,562 used, 766,438 remaining.** Reset date 2026-10-08, which is the
expiry.

## Pass two, 2026-09-30: the three gating measurements

| File | Rows | What it holds |
| --- | --- | --- |
| `FAMILY-MARKET-MEASUREMENTS.csv` | **254** | Local discovery across de-DE, fr-FR, nl-NL, pl-PL and en-US, the five markets that had only ever been measured on holidays, calendar, tools, cost of living and salary. 32 families, 140 family x market cells |
| `TIER3-DEMAND-EXPERIMENT.csv` | **284** | The tier-3 experiment: 51 cities of roughly 50,000 to 150,000 people, 6 markets, 14 families, local language throughout |
| `PLACES-EVENTS-SERP-40.csv` | **16** | Full SERP characteristics with the weakest ranking domain, its DR and referring domains, per family and market and city tier |
| `FAMILY-MARKET-CLASSIFICATION.csv` | 140 | One verdict per family x market cell, computed |
| `MEASUREMENT-SUMMARY.json` | | Every statistic and the recomputed ladder |

Cost breakdown for pass two: 11 keyword batches at 1,440 to 1,696 units each
(17,024 total), 9 SERP overviews at 171 to 361 units each (2,584 total).

## This pass, 2026-09-30

| File | Rows | What it holds |
| --- | --- | --- |
| `ahrefs/MEASURED-2026-09-30.tsv` | **269** | Volume, global volume, KD, CPC, clicks and traffic potential for the six markets that had no measurement: it 56, gb 48, ja 45, es 44, br 37, tw 33. Tagged with the family axis each keyword tests |
| `ahrefs/SERP-2026-09-30.tsv` | 7 | Full top 10 characteristics with the weakest ranking domain, its DR and referring domains, for the two new family verdicts plus the five carried forward |

Cost breakdown: 5 keyword batches at 2,508 / 2,408 / 2,193 / 2,064 / 1,763 / 2,107
units, 2 SERP overviews at 260 and 247.

## Earlier in the project, all still on disk

| Folder | What it holds |
| --- | --- |
| `../candidate-universe-2026-09-29/measured/` | 250 keywords in de, en-us, fr, nl, pl with volume, KD, CPC and global volume |
| `../candidate-universe-2026-09-29/MASTER-CANDIDATE-INVENTORY.tsv` | 10,152 candidates, 976 measured, 47 columns |
| `../scale-universe-2026-09-29/measured/SAMPLES.tsv` | 37 keywords: the airport transfer sample of 28 plus climate and sport |
| `../scale-universe-2026-09-29/serp/SERP-SAMPLES.tsv` | 5 SERPs in full |
| `../ahrefs-export-2026-09-28/keywords-explorer/research-2026-09-28.tsv` | 44 keywords with verdicts |
| `../ahrefs-export-2026-09-28/serp/` | 40 SERP rows |
| `../ahrefs-export-2026-09-28/gsc/gsc-x-ahrefs-joined-2026-09-28.tsv` | The 500 live pages joined with Ahrefs and GSC, 21 columns |
| `../ahrefs-export-2026-09-28/backlinks/` | 1,021 all time and 740 live referring domains, anchors, new and lost, 998 disavow candidates |
| `../ahrefs-export-2026-09-28/competitors/` | Per market competitor profiles, the absentify teardown, market leaders |
| `../ahrefs-export-2026-09-28/site-audit/all-179-checks-2026-09-29.json` | The clean crawl: health score 100, zero errors |
| `../ahrefs-export-2026-09-28/site-audit/CLEAN-BASELINE-2026-09-29.md` | Its analysis |
| `../ahrefs-export-2026-09-28/link-opportunities/` | 40 prospect rows |
| `../ahrefs-export-2026-09-28/content-gap/` | Content gap output |
| `../rank-tracker-2026-09-29/` | 705 keywords in four priority tiers, 580 to paste |

Total measured keywords across the project: **519 direct**, plus the 976 measured
rows in the candidate inventory. **54 SERPs** sampled in total.

## What is still unmeasured, and what it would cost

| Gap | Rows needed | Units | Gates which step | Status |
| --- | --- | --- | --- | --- |
| Local discovery in de, fr, nl, pl, us | 254 | 7,936 | Step 5 | **DONE 2026-09-30** |
| Tier 3 city demand | 284 | 9,088 | Step 6 | **DONE 2026-09-30** |
| Places and events SERPs | 11 | 2,584 | Step 3 | **PARTIAL: 11 of the 40 planned** |
| **One more market of tier 3** | 48 | ~1,600 | **Moves 500k from PROBABLE to DEFENSIBLE** | Open, and the cheapest decision left |
| Tier 3 in ja-JP and zh-Hant-TW | ~96 | ~3,200 | Confirms tier 3 outside Europe | Open |
| The remaining 29 SERPs | 29 | ~7,000 | Refines the family x market winnability map | Open |
| Remaining family x market cells | ~1,200 | ~40,000 | Would take 1M from UNPROVEN toward PROBABLE | Open |
| **Total remaining** | | **~52,000 of 766,438** | | |

The three gating measurements are done. What is left is cheap and the priority order
is above: one market of tier 3 first, because it is 1,600 units and it changes a
ladder verdict.

## Methodology notes that must survive the subscription

1. **Measure English travel and local phrasings in `gb`, not `us`.** The same keyword
   reads 20 in us and 900 in gb for Barcelona airport transfer, 10 and 700 for
   Lisbon. A us only read made the best family in the catalog look dead.
2. **Keywords carry diacritics; only URLs are folded.** `brückentage 2026` is 1,712
   and `brueckentage 2026` is 8.
3. **Join keyword to country, never keyword alone.** `kalender 2026` is a German
   keyword worth 333,644 and a Dutch keyword worth 146,979.
4. **Volume and KD are not enough.** `ristoranti milano` is 10,000 at KD 5 and
   aggregator locked; `eventi milano` is 7,600 at KD 0 with a DR 19 winner. Only the
   SERP separates them.
5. **CJK descriptions measure short against Latin thresholds.** 40 of 45 Japanese
   meta descriptions flagged as too short are correct as written.
6. **Global volume differs from market volume by up to 100 times** on calendar and
   holiday terms. Record both.

## Pass two, 2026-09-30: the market-reach correction

18,908 units. Every row is in `TIER3-DEMAND-EXPERIMENT.csv` (711 rows),
`CROSS-LANGUAGE-REACH.csv` (101 rows) or `PLACES-EVENTS-SERP-40.csv` (21 SERPs).
The ladder that reads them is `scripts/atlas/scale/ladder-v5.mjs`, writing
`SCALE-LADDER-V5.json` and `CELL-GATE.csv`.

| batch | tool | market | rows | units | what it decided |
| --- | --- | --- | --- | --- | --- |
| tier 3 fr | keywords-explorer-overview | fr | 48 | 1,536 | rent and health carry the French tail; events do not |
| tier 3 nl | keywords-explorer-overview | nl | 48 | 1,536 | jobs and practical services carry; transport and property do not |
| tier 3 ja | keywords-explorer-overview | jp | 48 | 1,536 | strongest tail measured; events work in Japanese tier 3 unlike Europe |
| tier 3 tw | keywords-explorer-overview | tw | 48 | 1,536 | travel families only; transport, services, property and health all dead |
| tier 3 us | keywords-explorer-overview | us | 47 | 1,504 | weather is the largest tier 3 family by volume; property real |
| new families de | keywords-explorer-overview | de | 48 | 1,536 | transport and property clear the tail gate in German |
| depth gb | keywords-explorer-overview | gb | 48 | 1,536 | category depth does NOT multiply: restaurants 2,700 then pubs 250, cafes 200, museums 70 |
| routes | keywords-explorer-overview | gb | 42 | 1,344 | the route axis has real demand including tier 3 pairs |
| tier 4 de | keywords-explorer-overview | de | 32 | 1,024 | four of five core families clear the gate at about 49,000 population |
| tier 4 gb | keywords-explorer-overview | gb | 32 | 1,024 | three of five clear; and foreign tail cities return 0 in English |
| cross-language en | keywords-explorer-overview | gb | 31 | 992 | **the measurement that overturned the ladder**: foreign tail cities are 0 to 60 in English |
| destinations en | keywords-explorer-overview | gb | 36 | 1,152 | activities and stay DO cross language for destination cities; places does not |
| destinations de | keywords-explorer-overview | de | 35 | 1,120 | confirms crossing in a second market, and proves the exonym rule |
| SERP wetter konstanz | serp-overview | de | 10 | 240 | weather is SERP feature suppressed |
| SERP spokane weather | serp-overview | us | 13 | 247 | weather has no top 10 result under DR 72, the only authority gate found |
| SERP restaurants lincoln | serp-overview | gb | 16 | 304 | places is OPEN at tier 3: DR 13 at position 5 earning 2,148 |
| SERP houses for sale carlisle | serp-overview | gb | 20 | 380 | property is open on authority, blocked on source |
| SERP lincoln to nottingham | serp-overview | gb | 19 | 361 | routes are aggregator locked, nothing under DR 53 |

### The four SERP classes, as used

- OPEN: a winner exists below DR 20. `restaurants lincoln` DR 13 at position 5.
- AGGREGATOR_LOCKED: the top 10 is portals or operators. `jobs lincoln`,
  `lincoln to nottingham`.
- SERP_FEATURE_SUPPRESSED: a Google panel takes the click. `wetter konstanz`
  yields 1,281 organic clicks on 9,200 volume.
- OPEN_BUT_SOURCE_BLOCKED: authority is not the barrier, the feed is.
  `houses for sale carlisle` has a DR 7 winner and every winner serves listings.

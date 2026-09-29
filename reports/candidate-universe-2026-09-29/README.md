# The candidate page universe

Generated 2026-09-29. **10,152 individual candidate pages**, 976 of them measured against
Ahrefs. Nothing here is published, no cohort was selected, and no production change follows from
it.

**FROZEN_AFTER_AHREFS_EXPIRY applies to every volume, KD and CPC figure in this folder.** The
subscription ends 8 October 2026. The structure regenerates any time from the repo; the numbers
do not.

## What this is, and what it is not

It is a shelf. Each row is a page that could exist, with a proposed URL, the data that would fill
it, the licence that data is under, whether anyone searches for it, and what could go wrong if it
were built at scale. A later GSC reading decides which subset is worth building.

It is **not** a plan, a cohort, or a recommendation to publish 10,152 pages. The quality-risk
column exists precisely because combinatorics are not a reason to build anything.

## How it was bounded, which is why it is 10,152 and not 100,000

Every family is capped by its source coverage, read from the source files rather than assumed:

| Family input | Coverage | Source and licence |
| --- | --- | --- |
| Public holidays | **36 countries**, 182 subdivision codes | OpenHolidays, **ODbL 1.0**, share-alike |
| Cost of living | 199 countries | Eurostat + World Bank |
| Salaries | 35 countries | Eurostat |
| Rent | 36 countries | Eurostat |
| Neighbourhood facts | **39 cities** | verified, CC BY 4.0 |
| Climate normals | 55 cities | NASA POWER, CC BY 4.0 |
| Sport venues | 16 countries | Wikidata, CC0 1.0 |

Three filters ran, and their counts are reported rather than hidden:

- **113 subdivision codes dropped** because the source names them only as codes. The Swiss
  municipality codes (`AG-AA`, `FR-LA-GR`) are not subdivisions a page would be about.
- **192 holiday pages dropped** because the source has no name for that holiday in that language.
  Falling back to English would have produced "New Year's Day 2026" as a French keyword.
- **A language-relevance gate**, so nothing generates "Assumption of Mary in Andorra" in Japanese.

## The single most important constraint

**OpenHolidays covers 36 countries and 32 of them are European. There is no US, GB, CA, AU, JP,
BR or TW.**

The Australian and Canadian opportunity the competitor research found is real on demand and
absent on data. Every such candidate carries `status = NEEDS_DATA` and says so in its notes. The
previous inventory implied those were buildable; they are not, without a new source.

## What measurement changed

976 candidates were measured on 2026-09-29. The measured numbers then moved the gates, and they
moved them in both directions.

**Families ranked by their best measured keyword:**

| Family | Candidates | Measured | Best measured volume | Tier |
| --- | --- | --- | --- | --- |
| `calendar.year` | 45 | 21 | **627,451** (`calendrier 2026`) | VERY HIGH |
| `events.school-holidays` | 2 | 2 | **283,339** (`vacances scolaires 2027`) | VERY HIGH, blocked on data |
| `events.today` | 9 | 4 | **137,005** (`is today a holiday`) | VERY HIGH |
| `tools.calculator` | 126 | 5 | **143,332** (`salary calculator`) | VERY HIGH |
| `calendar.week-numbers` | 9 | 5 | 44,785 (`kalenderwoche`) | HIGH |
| `events.named-holiday-date` | 1,889 | 105 | 43,874 (`Ascension 2027`) | HIGH |
| `events.named-holiday-regions` | 261 | 11 | 43,496 (`Fronleichnam feiertag wo`) | HIGH |
| `work.country-salaries` | 315 | 17 | 31,061 (`salaire moyen France`) | HIGH |
| `events.subdivision-holidays` | 621 | 14 | 24,385 (`feiertage Bayern 2026`) | HIGH |
| `work.working-time-per-year` | 630 | 350 | 17,291 (`arbeitstage 2026`) | HIGH |
| `events.country-holidays` | 330 | 29 | 8,683 | MODERATE |
| `neighbourhoods.city-where-to-stay` | 351 | 14 | 5,410 (`where to stay in tokyo`) | MODERATE |
| `events.long-weekends` | 648 | 360 | 3,963 (`brückentage 2027`) | MODERATE |
| `cost-of-living.country` | **1,791** | 23 | **2,290** | MODERATE |
| `calendar.month` | 324 | 14 | 2,027 | MODERATE |
| `rents.country-inflation` | 324 | 4 | **165** | **LOW** |
| `sport.city-season` | 1,980 | 0 | unmeasured | UNMEASURED |
| `weather.country-best-time` | 495 | 0 | rejected earlier on SERP | UNMEASURED |

### The finding that should change a decision

**`cost-of-living.country` is 1,791 candidates and 193 of the 500 live pages, and its best
measured keyword in any market is 2,290.** `calendar.year` is 45 candidates and its best is
627,451.

Worse, in two of Livdar's nine languages the family is effectively dead:
`koszty życia Polska` measures **1**, `kosten van levensonderhoud nederland` measures **1**.
`rents.country-inflation` is the same story: `huurverhoging nederland` measures **1**.

Two things are true at once and both are recorded:

1. **Phrasing was part of it.** `zarobki w niemczech` measures 570 where `średnia pensja Niemcy`
   measures 37, a factor of 15. `gemiddelde huur nederland` measures 68 where
   `huurverhoging nederland` measures 1, a factor of 68. The templates for these families are
   not the best available phrasing, and the inventory says so.
2. **Even at best phrasing the families are one to two orders of magnitude smaller** than the
   calendar and Pulse families in the same markets.

## Files

| File | What it holds |
| --- | --- |
| **`MASTER-CANDIDATE-INVENTORY.tsv`** | All 10,152 candidates, 44 columns. The main artefact. |
| `MASTER-CANDIDATE-INVENTORY.json` | Same rows, for programmatic use. |
| `VALIDATED.tsv` | 757 candidates with data, demand and measurement behind them. |
| `REJECTED-OPPORTUNITIES.tsv` | 495, each with the reason. Kept so they are not rediscovered. |
| `BLOCKED-BY-DATA-OR-LICENCE.tsv` | 1,126 where demand exists and the data does not. |
| `TOOL-OPPORTUNITIES.tsv` | 504 tool candidates, the highest monetization fit in the set. |
| `LOCAL-LANGUAGE-OPPORTUNITIES.tsv` | 322 non-English candidates measuring 500+ a month. |
| `PROGRAMMATIC-QUALITY-GATES-safe-to-scale.tsv` | 2,943 |
| `PROGRAMMATIC-QUALITY-GATES-scale-with-gates.tsv` | 5,457 |
| `PROGRAMMATIC-QUALITY-GATES-high-thin-content-risk.tsv` | 1,255 |
| `AGGREGATES.json` | Every distribution in one file. |
| `aggregates/*.tsv` | 14 cuts: surface, family, language, market, family x language, quality risk, status, feasibility, monetization, demand tier, licensing status, page type, volume bucket, KD bucket. |
| `measured/*.tsv` | **The raw Ahrefs measurements, 250 rows across de, pl, nl, fr and en-us. FROZEN.** |

## The 44 columns

`id`, `proposed_url`, `surface`, `family`, `page_type`, `entity`, `entity_label`, `destination`,
`country`, `subdivision`, `city`, `language`, `search_market`, `primary_keyword`,
`secondary_keywords`, `monthly_volume`, `kd`, `traffic_potential`, `cpc_cents`, `measured`,
`measured_via`, `serp_intent`, `serp_features`, `top_ranking_urls`, `weakest_top10_competitor`,
`weakest_competitor_dr`, `weakest_competitor_ur`, `weakest_competitor_refdomains`,
`competitor_traffic`, `livdar_coverage_now`, `current_live_equivalent`, `source_id`,
`source_data_available`, `source_licence`, `source_licensing_status`,
`programmatic_feasibility`, `uniqueness_potential`, `quality_risk`, `monetization_fit`,
`internal_link_fit`, `gsc_evidence`, `confidence`, `status`, `notes`, plus
`family_demand_tier`, `family_measured_coverage` and `family_best_measured_volume` added by the
merge pass.

**`monthly_volume` is empty unless `measured` is `yes`.** There are no estimated volumes in this
file. 9,176 of 10,152 candidates are unmeasured and say so.

`gsc_evidence` is `out_of_window` on every row, which is the accurate value: no Atlas page has a
measurable Google reading yet. See `../ahrefs-export-2026-09-28/gsc/GSC-X-AHREFS.md`.

## How to regenerate and extend after 8 October

Two scripts, both in the repo, both runnable forever:

```
node scripts/atlas/candidate-universe.mjs        # regenerates all 10,152 from repo data
node scripts/atlas/candidate-merge-measured.mjs  # re-applies measured/*.tsv and the gates
```

The generator reads only repository data, so it keeps working. To add measurements after Ahrefs
expires, drop a TSV into `measured/` with the columns
`keyword, country, volume_monthly, kd, cpc_cents, global_volume` from whatever source you then
have, and re-run the merge. **The merge joins on keyword AND country**, never keyword alone:
`kalender 2026` is a German keyword worth 333,644 and a Dutch keyword worth 146,979, and a
keyword-only join silently gives one of them the other's number. That bug was in this code and is
fixed.

## Six keyword bugs caught by measuring rather than assuming

Recorded because each would have produced a plausible-looking but wrong inventory:

1. **`brueckentage 2026` measures 8; `brückentage 2026` measures 1,712.** ASCII-folding a keyword
   the way a slug is folded destroys its volume. Only URLs get folded.
2. **`kalender january 2026` is not German.** Month names now come from `Intl` per language.
3. **Country names were English regardless of page language**, so `feiertage France` rather than
   `feiertage Frankreich`.
4. **Subdivision keywords were raw ISO codes**, so `feiertage AG-AA 2026`.
5. **Where-to-stay keywords were city IDs**, so `wo wohnen in 290030` rather than `in Doha`.
6. **A URL-encoded `%2C` leaked from the source** into names, keywords and join keys.

## What is deliberately not in here

- **No cohort 003.** Not selected, and selecting one is not this artefact's job.
- **No published pages.** Nothing was generated into `data/atlas/cohorts/`.
- **No estimated volumes.** An unmeasured row is empty, not guessed.
- **No `sport.city-season` measurements.** 1,980 candidates sit unmeasured because
  `lib/atlas/atlas-urls.js` records that a sport page's keyword is the phrase that market actually
  types and that `running-in-new-york` and `trekking-vicino-milano` are not translations of each
  other. A template would have invented them.
- **No scraped data.** Every source is in `data/atlas/sources.json` with its licence.

## The honest coverage statement

| | |
| --- | --- |
| Candidate pages | **10,152** |
| Fully measured (volume and KD) | **976 (9.6%)** |
| Partially measured (volume only) | included in the above |
| Unmeasured | 9,176 (90.4%) |
| Families with at least one measurement | **15 of 20** |
| Markets measured | de, pl, nl, fr, en-us (5 of 9) |
| Markets not measured | es, it, pt, ja (4 of 9) |

The measurement was spent on the head of each family in the markets where SERP evidence already
existed, because that is where it changes a decision. Measuring all 5,348 distinct keyword and
country pairs would have cost roughly 118,000 units of the 841,000 available, so budget was not
the constraint: **the constraint was that measuring the tail of a family whose head is already
known does not change what anyone would do.**

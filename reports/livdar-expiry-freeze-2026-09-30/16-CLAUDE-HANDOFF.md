# Handoff: everything needed to continue Livdar

Written so that an agent or a person with no prior context can resume without losing
anything. Read this file first. Read `01-EXECUTIVE-SUMMARY.md` second.

## 1. Repository and branch

- **Repo**: `https://github.com/Tradeappo/Livdar-eSim`
- **Working branch**: `claude/seo-handoff-partial-data-7rs7zi`
- **Production**: `https://livdar.com`
- All research lives under `reports/`. All build scripts under `scripts/atlas/`.
- The keyword master is built by `scripts/atlas/scale/master-keywords-final.mjs`.
  The rollups by `scripts/atlas/scale/final-rollups.mjs`. This freeze folder by
  `scripts/atlas/scale/build-expiry-freeze.mjs`. All three are idempotent: re-running
  them reproduces the outputs from the source files.

## 2. Production state

- **500 Atlas pages live**, two cohorts of 250 (`001`, `002`). Cohort 003 is **not**
  published, per standing instruction.
- **Site Audit: health score 100, zero errors**, 11 of 179 checks non-zero, all low
  severity. Baseline at `reports/ahrefs-export-2026-09-28/site-audit/CLEAN-BASELINE-2026-09-29.md`.
- GTM, GA4, GSC and Clarity verified in production.
- The 497 Atlas pages that returned 404 were fixed on 2026-09-28. **No GSC window
  before that date says anything valid about them** — this matters for every gate
  reading in the publication controller.
- Every live page carries a contextual CTA, tracked with the full dimension set.
- Sitemaps, robots and indexability have passed a regression check. IndexNow and Bing
  submission are wired.

## 3. Architecture

Nine content axes (`A_poi` through `H_transport` plus tools/durable families), 191
families in the master, 11 markets plus a multi-market eSIM bucket. Surfaces: atlas,
pulse, move, stay, work, jobs, places, poi, areas, transport, events, tools, climate,
sport, services, safety, esim.

- **Entity graph**: `reports/scale-universe-2026-09-29/ENTITY-GRAPH.md` + `entity-graph.jsonl.gz`
- **Family catalog with distinct-value tests**: `reports/scale-universe-2026-09-29/FAMILY-CATALOG.md`
- **Quality gates**: `reports/scale-universe-2026-09-29/QUALITY-GATES.md`
- **Google safety gates**: `reports/scale-universe-2026-09-29/GOOGLE-SAFETY-GATES.md`
- **Candidate architecture to 100M**: `13-100M-ARCHITECTURE.md` in this folder

## 4. The 64 / 76 / 191 family question

These three numbers all appear in the reports and all three are correct in context:

- **64 families** — the original programme scope.
- **76 families** — the 64 plus 12 the 27-family pass added.
  `reports/livdar-master-seo-universe-2026-09-30/FAMILY-MASTER.csv` holds all 76 with
  40 columns each, classified per market.
- **191 families** — the count in the keyword master, because the master also carries
  sub-families and round-three splits (`jobs.rules-durable`, `rents.rules-durable`,
  `jobs.role-city-and-category-city`, and so on). `04-FAMILY-MASTER.csv` is the rollup.

Use 76 when talking about the programme, 191 when querying the master. They are not in
conflict.

## 5. Markets

| Market | Keywords in master |
|---|---|
| en-US | 1,326 |
| de-DE | 1,111 |
| fr-FR | 844 |
| it-IT | 836 |
| es-ES | 747 |
| en-GB | 687 |
| pl-PL | 679 |
| nl-NL | 670 |
| pt-BR | 645 |
| ja-JP | 432 |
| zh-Hant-TW | 148 |
| MULTI_MARKET (eSIM) | 104 |
| **Total unique** | **8,229** |

zh-Hant-TW is the market to look at next: it holds only 148 keywords but carries the
largest single measured head in the entire project (`租屋補助`, 269,000 volume, KD 0) and
its breadth is still not exhausted.

## 6. The keyword master

`02-MASTER-KEYWORDS.csv`. 8,229 unique keywords, 23 columns: keyword, market, language,
surface, family, entity_type, intent_type, status, live_or_future,
primary_or_secondary, page_type, target_url_or_pattern, volume, KD, CPC,
traffic_potential, SERP_class, source_of_keyword, evidence, data_source_required,
indexable, priority, notes.

**Status distribution**: LIVE_PRIMARY 500, LIVE_SECONDARY 249, ESIM 104,
DURABLE_HEAD 807, CANDIDATE_HEAD 443, ENTITY_HEAD 40,
OPPORTUNITY_REQUIRES_FEED 320, PROMISING 5,304, BLOCKED_DATA 72, BLOCKED_LICENCE 2,
EXPERIMENT_ONLY 26, REJECT 322.

**The dedupe ladder** (do not weaken it): exact → normalised (case and whitespace only,
**never diacritics**, because `brueckentage` measures 8 and the umlaut form measures
1,712) → same-market semantic → entity-intent. It never collapses the same intent across
markets, local-language variants, or an exonym against its endonym (`prag` 15,000
against `praha` 20).

**To add research**: a new numbered loader block in `master-keywords-final.mjs` with its
own `source_of_keyword`, then re-run the builder and the rollups. Never a parallel file.

## 7. Validated families — build these

No feed, no licence, demand measured:

| Family | Evidence |
|---|---|
| `atlas.city-family-carried-forward` | breadth exceeded every limit tested, in six languages. Global destination universe. 29,274 pages |
| `places.city-category` | breadth exhausted at 283 for one category in one market. City + neighbourhood + near-station. 150–800 cents CPC. 6,342 pages |
| `jobs.rules-durable` | **new, measured.** Breadth >400 keywords at 500+ in de-DE, limit hit. `minijob grenze 2026` 48,000 KD 5. Rules portion needs no feed; the ~150 `minijob {city}` queries do |
| `rents.rules-durable` | **new, measured.** Breadth >120 keywords at 300+ in zh-Hant-TW, limit hit, nearly all KD 0–13. `租屋補助` 269,000 KD 0. Sub-intent × year × city × audience × landlord questions. Public rules, no feed |
| `transport.node-route-and-hotels` | ~70 airports >200 volume, 150+ >50. `hotels near X airport` KD 0–4 at 70–120 cents. **Blocked by a wrong distance field — see §9** |
| `move.visa-country` | highest CPC measured, 60–350 cents |
| `poi.entity-tickets` | 45 measured entity heads. Select per entity: fails where a reseller owns the query |

## 8. Blocked families — do not build

| Family | Why |
|---|---|
| `stay.city-hotels` | `SERP_FEATURE_SUPPRESSED`. The whole organic top 10 earns single digits on 7,300 volume. Google Hotels takes it |
| `events.venue-event` | `OPEN_BUT_ECONOMICALLY_DEAD`. Everything below position 1 earns 72 clicks on 3,900 volume |
| `route.city-pair` | `AGGREGATOR_LOCKED`. Nothing under DR 53 ranks |
| all `poi.*-entity` / `places.*-entity` | `BRAND_OWNED_PLUS_SOCIAL`. Official site plus knowledge panel plus social. No informational slot |
| `stay.wg-student-furnished` | refuted. ~35 university cities, not 9,000 pages |
| `poi.entity-parking` | refuted on composition. Demand is airports and operator brands |
| any `events.*` with a time window | `heute`/`morgen`/`wochenende`/`this weekend` cannot be a static page. Permanent exclusion |
| `stay.coliving`, `stay.monthly` | demand absent even in local language |

## 9. Feeds and data needed

Ranked by worth, with the full catalogue in `07-DATA-SOURCES.csv` (58 rows) and the
scenarios in `11-CURRENT-VS-FEED-BACKED.md`:

1. **Fix the airport distance field** (data-source gaps 1 and 2). Not a feed purchase —
   a correctness fix. It unblocks the best-monetising measured family and it currently
   trips STOP condition 7. **Highest return of anything on this list.**
2. **Rental listings feed** — for revenue, not page count. German tail at KD 0–3.
3. **Jobs feed** — vertical cuts only, never a general board.
4. **Attraction affiliate** — monetisation only; already counted in CURRENT.
5. **Licensed event feed** — lowest priority.
6. **Student/shared-housing feeds** — do not buy.

## 10. Rank Tracker state — do not change without reason

705 keywords: 500 LIVE_PRIMARY (one per live page), 38 LIVE_SECONDARY, 125 ESIM,
42 CANDIDATE_HEAD (volume floor 1,000). **Zero cannibalisation groups, zero pages
needing a primary-keyword review.** LIVE_PRIMARY volume bands: HEAD 28, STRONG 112,
MODERATE 47, LOW 142, VERY_LOW 171.

Config at `reports/rank-tracker-2026-09-29/` with `PASTE-READY.md` for re-entry into any
tool. **This session did not change it.**

## 11. Bot Analytics, GSC and Site Audit state

- **GSC**: verified, joined with Ahrefs at
  `reports/ahrefs-export-2026-09-28/gsc/gsc-x-ahrefs-joined-2026-09-28.tsv`. After
  expiry this becomes the primary instrument — set up the API export first (`15-...`).
- **Bot Analytics / crawl**: baseline in `reports/ahrefs-export-2026-09-28/production/`
  (`atlas-monitor-*.json`, `internal-links-*.json`, `sitemap-url-status-*.tsv`).
- **Site Audit**: health 100, zero errors. Both full 179-check snapshots retained.

## 12. The next exact tasks

In `18-NEXT-EXECUTION-TASKS.csv`, with gates and dependencies. The first five:

1. Set up the GSC API scheduled export (free, unblocks every controller gate).
2. **Done in this session.** Both rules-durable families were measured before expiry;
   both hit the row limit, so both counts are floors. Next step is to *build* them,
   starting with their calculator intents against the live `tools.calculator` surface.
3. Fix the airport distance field, then lift the `transport.airport-to-city` cap of 0.
4. Publish cohort 003 from the 1,791 publishable candidates **only after** a clean 28-day
   GSC window on the existing 500, per controller step 1.
5. Re-scope `poi.entity-parking` around airports, or drop it.

## 13. What not to do

- Do not restart research. Do not create a parallel keyword master. Do not build another
  independent scale universe.
- Do not publish cohort 003 without the step-1 gate readings.
- Do not weaken the ten STOP conditions in `14-PUBLICATION-CONTROLLER.md`.
- Do not present a number as a measurement when the source does not measure it. That is
  STOP condition 7 and it is the rule that keeps this site publishable.
- Do not believe a page count that has no keyword list under it. Four estimates died
  that way in the last pass.

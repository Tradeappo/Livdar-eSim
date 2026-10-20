# Livdar Atlas: master handoff

Written 2026-10-21 from the repository's own artifacts. Every number is recomputed by a script
in this repo (named beside it) or read from a committed builder output. Nothing is taken from
conversation memory. Where an older document disagrees, it is listed as SUPERSEDED in
`AUTHORITATIVE-STATE.json` with the reason.

---

## 1. What this is

**Livdar** (https://livdar.com) is an eSIM site with a programmatic data section, the **Atlas**:
pages that answer one question about one place from real open data (the weather in Munich month
by month; how to get from Aabenraa to Assens by public transport; a peak in Ostallgäu).

The work has two halves:

- **The offline inventory.** A pipeline that turns open datasets into candidate pages and refuses
  every candidate that cannot name a reason to exist. Current result: **1,002,362 FINAL DISTINCT
  VALID** candidates. Lives on branch `claude/seo-handoff-partial-data-7rs7zi`.
- **Publication.** Small controlled cohorts of those candidates, built by page builders on `main`
  and deployed by Vercel. **1,500 Atlas pages are live**: cohort 001 (250), 002 (250), 003 (1,000
  `weather.city-month`, published 2026-10-20).

## 2. The authoritative number

**FINAL DISTINCT VALID = 1,002,362** (verified 2026-10-21 by
`python3 scripts/atlas/verify-1m-manifest.py`).

- Intact: the four committed parts hold 1,002,362 data rows, SHA-256
  `0f2a32f20559061d90157c51c010afbd80492b61cfb3bf067c9417995e5408f8`, equal to the parts index.
- Distinct: 1,002,362 candidate ids and 1,002,362 URLs.
- Valid: no row carries a `REJECTED_*` status.
- Reconciles: **1,872,381 generated - 870,019 rejected = 1,002,362.** The builder's own
  `funnel_reconciles: false` is a formula defect, fixed on 2026-10-21 (`KNOWN-BUGS-AND-FIXES.md` #14).

"Valid" means *passed every gate*. It does **not** mean *can be served today*: only **26,685**
rows belong to a family with a page builder. The renderer is the binding constraint.

## 3. How it got here

From the git history of the manifest's parts index and commit messages:

| date | FINAL | what happened |
|---|---:|---|
| 2026-10-01 | 233,568 | first fully gated build |
| 2026-10-06 | 401,393 | quality work made the inventory smaller |
| 2026-10-07 | 427,121 | Denmark, Norway, Finland materialised |
| 2026-10-08 | 706,677 → 877,462 | directed transport pairs; 146 intercity GTFS feeds |
| 2026-10-08 | 966,815 | municipal pass (**SUPERSEDED**) |
| 2026-10-10 | 972,910 → **586,511** → 587,284 | **transit unit correction**: 80% of transit pages were stop-to-stop; the family fell 510,592 → 125,652; trail QID gate narrowed (+773) |
| 2026-10-13 | 667,298 | the expired paid tier cap replaced by a free measured signal (Wikimedia clickstream) |
| 2026-10-14 | 678,510 | self-containment defect fixed (2,147 pages said a thing was inside itself) |
| 2026-10-16 | -23,453 | **climate city-name swaps removed** (cities sharing one NASA grid cell) |
| 2026-10-19 | 752,953 → 889,369 | Wikidata landmark (worldwide, 58 classes), settlement, area and register layers |
| 2026-10-19 | 984,726 → 990,241 | class-census tail, containers reserved, NRHP and 27 registers |
| 2026-10-19 | **1,002,362** | **current** |

Two of the largest moves were down. That is why the current number can be trusted.

## 4. What is in the inventory

**By surface:** places 188,234 · landmark 182,329 · transport 147,287 · settlement 130,173 ·
outdoors 88,483 · areas 80,666 · stay 68,002 · heritage 31,242 · climate 26,914 · pulse 24,184 ·
move 17,725 · work 4,971 · area 3,561 · poi 3,062 · tools 1,594 · destinations 1,557 · safety 1,136
· sport 1,016 · travel 226.

**Families:** 2,860 family strings from 91 research families (`FAMILY-REGISTRY.md`). Largest:
`transport.city-pair-transit` 125,652, `activities.city-things-to-do` 61,412, `stay.city-type`
47,545, `settlement.commune-of-france` 30,772, `weather.city-month` 26,665.

**Demand basis** (`scripts/atlas/classify-demand-basis.py`): **DEMAND_PROVEN 285,729** (evidence
naming the entity itself) · **UTILITY_PROVEN 363,447** (one entity, source facts, family pattern
measured) · **AGGREGATION 353,186** (a set or a pair, admitted on its members). Unknown volume is
null, never 0.

**Readiness:** source SOURCE_AVAILABLE 879,054 · LICENCE_REQUIRED 76,291 · READY_NOW 29,886 ·
FEED_REQUIRED 17,131.

## 5. Markets, languages, countries, destinations

17 markets in 14 languages, 220 countries, 823,194 home-market rows and 179,168 destination rows
(`GEOGRAPHY.json`):

| market | rows | countries covered |
|---|---:|---:|
| en-US | 248,865 | 219 |
| de-DE | 159,402 | 116 |
| fr-FR | 150,334 | 139 |
| en-GB | 86,696 | 143 |
| es-ES | 70,480 | 115 |
| ja-JP | 65,533 | 49 |
| pl-PL | 57,033 | 73 |
| it-IT | 52,531 | 105 |
| nl-NL | 36,562 | 86 |
| pt-BR | 33,031 | 101 |
| tr-TR | 13,553 | 12 |
| es-MX | 12,166 | 88 |
| en-AU | 8,445 | 18 |
| da-DK | 3,622 | 1 |
| nb-NO | 2,016 | 1 |
| fi-FI | 1,315 | 1 |
| zh-Hant-TW | 778 | 5 |

Largest countries: US 205,967 · DE 144,972 · FR 137,890 · GB 87,563 · JP 62,599 · ES 57,282 ·
IT 55,263 · PL 52,499 · BR 27,912 · NL 25,034 · TR 16,164 · IN 12,806. A destination earns a page in
a language only where that language shows measured demand for it (`QUALITY-RULES.md`, section 4).
The live Atlas serves nine languages (en, de, fr, es, it, pt, nl, pl, ja).

## 6. The rules

The owner's standing rules are in `RECOVERY-INSTRUCTIONS.md`, section 4: no paid SEO tools; real
demand OR real utility; never fabricate; null not 0; no translation-only pages, no city-name swaps,
no stop-to-stop transport, no weakened gates; the 23,453 climate rows stay out; production only
when asked. The gates themselves, with counts, are `QUALITY-RULES.md`.

## 7. Sources

OpenStreetMap (ODbL), Wikidata and the Wikimedia clickstream (CC0), GeoNames (CC BY 4.0), NASA
POWER climatology, GTFS feeds with a read open licence (115 ALLOW of 1,738), OurAirports (public
domain), OpenFlights, official heritage registers, holiday providers, World Bank, Eurostat and
government sources. Ahrefs and open-SERP measurements are frozen evidence; Ahrefs ended
2026-10-08. Details and attribution duties: `DATA-SOURCES.md`.

## 8. Live production (2026-10-20/21)

- 1,500 Atlas pages, all verified in production after the cohort 003 deploy: 200, self canonical,
  `index, follow`, hreflang equal to the serving cluster, every internal link present, every URL in
  one of 80 child sitemaps (1,749 URLs).
- ISR revalidation verified healthy (475 of 475 regenerations fresh, 0 runtime errors).
- IndexNow accepted the 1,000 new URLs.
- URL Inspection (553 URLs): of the old 500, 430 were inspected: 199 indexed, 189
  discovered-not-indexed, 41 unknown, 1 crawled-not-indexed. 199 of 200 crawled pages were
  indexed. All 123 inspected cohort 003 pages were still unknown, hours after launch.
- `main` holds PR #38 (cohort 003), #39 (live record) and #40 (opt-in sitemap submission in the
  `atlas-search-console` workflow).

## 9. Files that are the truth

| what | file |
|---|---|
| the inventory (in git) | `reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.parts/` |
| the rejections (in git) | `reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-REJECTED-CANDIDATES.parts/` |
| current numbers | `reports/atlas/project-backup/AUTHORITATIVE-STATE.json` |
| builder summary and QA | `1M-SUMMARY.json`, `1M-QA-REPORT.json` (same folder as the parts) |
| the builder | `scripts/atlas/scale/build-1m-candidate-manifest.py` |
| the orchestrators | `scripts/atlas/scale/run-1m-pipeline.sh`, `scripts/atlas/ingest/wikidata-layers-rebuild.sh` |
| verification | `scripts/atlas/verify-1m-manifest.py`, `scripts/atlas/classify-demand-basis.py`, `scripts/atlas/verify-live-atlas.mjs` |
| milestone record | `1M-REACHED-2026-10-19.md` |
| live cohorts | `data/atlas/cohorts/cohort-00{1,2,3}{,-pages}.json` (on `main`) |

**Superseded for counts** (keep as history, do not quote as current): `HANDOFF.md` (2026-09-24),
`00-README.md`, `01-EXECUTIVE-SUMMARY.md`, `16-CLAUDE-HANDOFF.md` (2026-10-01, keyword-universe
sizes, a different metric), `1M-FINAL-DELIVERABLE.md` and `1M-BRIEF-FINAL-REPORT.md` (877,462,
before the transit correction), `INVENTORY-COUNT-RECONCILIATION-2026-10-13.md` (587,284, correct
on that day), `1M-FAMILY-ACCEPTANCE-TEST.json` (measured on the 877,462 run), and the paid-tool
recommendations in `15-AHREFS-REPLACEMENT.md`.

## 10. Where to go next

`NEXT-STEPS.md`. In one line: fix the URL Inspection token expiry, then, when the owner asks,
write the landmark entity builder (182,329 rows, 147,676 DEMAND_PROVEN) and publish through
`main`'s gates in cohorts sized to what Google is crawling.

# Livdar expiry freeze, 2026-09-30

## THIS FOLDER IS THE SOURCE OF TRUTH

**DO NOT restart Livdar research from scratch.**
**DO NOT create a parallel keyword master.**
**DO NOT create another independent scale universe.**
**All future research must merge or version into this freeze.**

Everything in here was built from research already done across eight passes between
2026-09-21 and 2026-09-30. This folder does not re-measure anything and it does not
invent a row. It consolidates, versions and freezes, so the project survives the
Claude and Ahrefs subscriptions ending.

If you are an agent or a person picking this up cold, read `16-CLAUDE-HANDOFF.md`
first. It is written to be the only file you need to resume work.

## What is in here

| File | What it holds |
|---|---|
| `00-README.md` | this file, and the rules above |
| `01-EXECUTIVE-SUMMARY.md` | the whole programme in one read: what is true, what is built, what is blocked |
| `02-MASTER-KEYWORDS.csv` | **the keyword master. 8,229 unique keywords, 23 columns.** The single authoritative keyword file |
| `03-MASTER-KEYWORDS.jsonl.gz` | the same rows, one JSON object per line |
| `04-FAMILY-MASTER.csv` | every family rolled up from the master |
| `05-MARKET-MASTER.csv` | every market rolled up from the master |
| `06-ENTITY-LISTING-UNIVERSE.csv` | the entity and listing universe with the seven layers kept strictly separate |
| `07-DATA-SOURCES.csv` | 58 source rows: provider, class, cost, licence, storage and indexing rights, refresh, blocker, action |
| `08-SERP-EVIDENCE.csv` | 47 sampled SERPs, each with the DR profile and the classification it produced |
| `09-COMPETITOR-EVIDENCE.md` | competitor intelligence index, and where each raw export lives |
| `10-AHREFS-EXPORT-INDEX.md` | every Ahrefs export held on disk, so nothing is lost when the subscription ends |
| `11-CURRENT-VS-FEED-BACKED.md` | the two scenarios and the six thresholds, with the verdict for each |
| `12-SCALE-LADDER.md` | the versioned ladder, v1 to v6, and why each version moved |
| `13-100M-ARCHITECTURE.md` | the architecture that can hold 100M candidates without publishing 100M weak pages |
| `14-PUBLICATION-CONTROLLER.md` | the cohort gates from 500 to 100M, preserved from the existing controller and extended |
| `15-AHREFS-REPLACEMENT.md` | what replaces Ahrefs for each job it did, by cost tier |
| `16-CLAUDE-HANDOFF.md` | **read this first.** Full state so any agent can continue with no lost context |
| `17-NEXT-30-DAYS.md` | the sequenced plan for the first month after expiry |
| `LIVDAR-1M-CANDIDATE-MANIFEST.parquet` | **the candidate inventory. 98,652 distinct candidate pages, 35 columns** |
| `LIVDAR-1M-CANDIDATE-MANIFEST.csv.gz` | the same rows as gzipped CSV |
| `1M-FAMILY-BREAKDOWN.csv` | candidates per family, with source status and average scores |
| `1M-MARKET-BREAKDOWN.csv` | candidates per market and language |
| `1M-SOURCE-BREAKDOWN.csv` | candidates per source status and data source |
| `1M-FEED-REQUIREMENTS.csv` | what each missing feed unlocks, largest first |
| `1M-PUBLICATION-MAPPING.csv` | candidates mapped onto the existing ladder rungs |
| `1M-GAP-TO-TARGET.csv` | **what closes the 901,348 gap to 1M**, with the basis of every number |
| `1M-GAP-SUMMARY.json` | the gap arithmetic in one object |
| `1M-SUMMARY.json` | the full dedupe funnel and every breakdown |
| `1M-GSC-VALIDATION-PLAN.md` | per-family GSC thresholds: expand, success, hold, kill |
| `1M-SOURCE-ACQUISITION-PACK.csv` | **10 sources ranked by candidates unlocked**, each with provider, API, cost, licence, record count, geography, fields, refresh, storage and indexing rights, implementation requirement |
| `1M-WIKIDATA-POI-MEASURED.csv` / `.md` | Wikidata POI per class in the 11 markets, measured live 2026-10-01, and the CC0 finding |
| `1M-TOOLS-COVERAGE.csv` | all 27 tool intents audited: what exists, what was added, what has no measurable demand |
| `1M-READINESS-REPORT.md` | **read this for the 1M status**: what is materialised, what is queued, and the exact command to finish |
| `18-NEXT-EXECUTION-TASKS.csv` | the task backlog, each row with its gate and its dependency |

## How to sum `06-ENTITY-LISTING-UNIVERSE.csv` without double counting

The file carries a `layer_scope` column because the source models count two different
things and a naive column sum silently mixes them. Sum it like this:

| Column | Sum over | Reconciles to |
|---|---|---|
| `raw_universe` | `layer_scope = ENTITY_AND_LISTING_AXES` | **72,567,541** |
| `source_obtainable` | `ENTITY_AND_LISTING_AXES` | **8,948,616** |
| `source_backed` | `ENTITY_AND_LISTING_AXES` | **2,883,978** |
| `demand_supported` | **all rows** | **1,627,088** |
| `indexable_today` | **all rows** | **9,696** |
| `durable_url_potential` | `layer_scope = DURABLE_PARENT_AXES` | 1,624,510 |

The first three sum over the entity and listing axes only; durable parents leave those
columns empty and carry `durable_url_potential` instead. Demand and indexability sum over
every row, because `SCALE-FINAL.json` attributes the durable-parent demand into its own
entity-and-listing total. All six figures above are verified against
`reports/livdar-final-research-freeze-2026-09-30/SCALE-FINAL.json`.

### Two indexable figures, both correct, different vintages

`06-...csv` sums to **9,696** indexable and `11-CURRENT-VS-FEED-BACKED.md` headlines
**64,416**. Both are right and they are not in conflict:

- **9,696** is the v1 entity-scale model, which set indexable to zero for any family
  whose feed was missing. It is a strict floor.
- **64,416** is the v5b model, which separates *rankable today with no new feed* from
  *feed-held*, and adds the durable city-family demand of 29,274 that v1 counted
  separately.

Use **64,416** when asking what Livdar could rank today, and 9,696 when asking what the
strictest model allowed. `12-SCALE-LADDER.md` tracks all six versions.

## Where the raw material still lives

This folder consolidates. It does not delete. The passes it draws on remain in place
and are still the evidence of record:

- `reports/livdar-final-research-freeze-2026-09-30/` — the research freeze: master
  keyword builder, family and market rollups, entity and listing universes, source
  matrix, SERP evidence, and the round-three harvest and breadth measurements
- `reports/livdar-master-seo-universe-2026-09-30/` — the 76-family, 11-market
  classification and scale ladders v2 to v5
- `reports/scale-universe-2026-09-29/` — the entity graph, family catalog,
  publication controller, quality gates, licensing matrix, competitor universe
- `reports/candidate-universe-2026-09-29/` — the candidate inventory and quality gates
- `reports/rank-tracker-2026-09-29/` — the Rank Tracker set as configured
- `reports/ahrefs-export-2026-09-28/` — **every raw Ahrefs export.** Backlinks,
  refdomains, anchors, organic keywords, top pages, competitors, content gap, link
  opportunities, Brand Radar, Rank Tracker, SERPs, Site Audit, GSC join. This is the
  folder that becomes irreplaceable when the subscription lapses

## The candidate inventory, and why it is 98,652 and not 1,000,000

The inventory is generated by `scripts/atlas/scale/build-1m-candidate-manifest.py` from
real entities on disk: 31,715 named cities with country and tier, 249 countries, 3,244
airports, 9,438 venues, 1,403 neighbourhoods, 69 subdivisions and 3,624 holiday
occurrences. It is rebuilt by running the script; it is never hand-edited.

**297,988 distinct candidates** survive all three dedupe passes, of which 161,474 are real OSM POI ingested this pass. Keywords validate
clusters, not pages: keyword clusters from the 8,229-keyword master stand behind those
rows, which is the intended ratio.

Depth per family is driven by **measured tier reach**, not a blanket cap. `CELL-GATE.csv`
records how deep each family x market cell was actually measured: 64 of 150 cells reach
TAIL and 5 explicitly count tier 4. Where a cell was measured deeper than the family's
generic entity spec, the measurement wins — which is why `wohnung mieten cuxhaven` at
2,800 and `praca stargard` at 9,800 are legitimate candidates. 67,210 rows were dropped
for sitting deeper than their own market's measured depth.

Two structural facts cap it, and both are real rather than conservative choices:

1. **The site is language-scoped, not market-scoped.** Live URLs are `/en/`, `/de/`,
   `/it/`. en-US and en-GB share `/en/`, so a page for one entity in one family exists
   once per language. Eleven markets collapse to ten languages.
2. **1,168 city names are shared by 2,833 cities.** Ambiguous names carry their country
   in the slug, or two different cities silently become one URL.

Four kinds of padding were generated and then removed, which is why the number fell
from a first pass of 181,571:

- **pair explosions** — every pair of 60 countries and 200 cities was 29,000 rows of
  mostly absent comparison demand. Capped to the most-compared entities.
- **population mistaken for tourism** — tier is computed from population, so Aba and
  Abidjan counted as tier-2 "destinations" and produced German-language travel pages.
  Cross-language reach is now bounded by measured evidence: the destination cities in
  `CROSS-LANGUAGE-REACH.csv`, cities inside the 11 market countries, and tier-1 cities
  for the two English markets, which round three measured searching globally.
- **expiring listings** — 47,000,000 job, event and property records exist in the raw
  universe. They contribute **zero** durable candidates, because an individual listing
  expires in weeks and the research already requires 410 on expiry. Feeds unlock the
  durable parent pages already in the manifest, not a page per listing.
- **year multiplication** — capped at the two years the calendar families already use.

**The gap to 1M is 846,776, and one acquisition closes it.** OpenStreetMap plus
Wikidata POI ingestion yields 964,920 source-backed POIs; at one validated practical
modifier each (tickets, opening hours, how to get to, parking — all measured
MODIFIER_WORKS) that is 964,920 candidates, a 118,144 surplus over the gap. Bare POI
entity pages must not be generated: they are `BRAND_OWNED_PLUS_SOCIAL` and unrankable.
`1M-GAP-TO-TARGET.csv` carries the basis of every figure, and
`1M-SOURCE-ACQUISITION-PACK.csv` has the ten sources ranked with licence, cost and
implementation requirement for each.

**Wikidata was measured live on 2026-10-01** and is the better of the two POI sources
on licence: **CC0, with no share-alike**, against OSM's ODbL. 86,341 entities across 9
classes in the 11 markets, a floor rather than a total because the endpoint throttles.
But it is **weak on commercial POI** — `cafe` returned only 921 across all eleven
markets — so restaurants, cafes, gyms and coworking still require OSM and its ODbL
obligation. Wikidata covers the durable attraction-shaped POI; OSM covers the dense
commercial tail.

## The one rule for future work

When new research happens, it goes into `02-MASTER-KEYWORDS.csv` through the builder
at `scripts/atlas/scale/master-keywords-final.mjs`, as a new numbered loader block
with its own `source_of_keyword`. That is how round three was added. It keeps the
dedupe ladder, the provenance and the counts intact. A new standalone keyword file
is how a project loses its history.

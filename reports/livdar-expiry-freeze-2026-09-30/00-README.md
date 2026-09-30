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
| `02-MASTER-KEYWORDS.csv` | **the keyword master. 8,189 unique keywords, 23 columns.** The single authoritative keyword file |
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

## The one rule for future work

When new research happens, it goes into `02-MASTER-KEYWORDS.csv` through the builder
at `scripts/atlas/scale/master-keywords-final.mjs`, as a new numbered loader block
with its own `source_of_keyword`. That is how round three was added. It keeps the
dedupe ladder, the provenance and the counts intact. A new standalone keyword file
is how a project loses its history.

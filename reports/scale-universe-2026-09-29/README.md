# Scale universe, 2026-09-29

The 1,000,000 candidate research universe, honestly counted. **Nothing here is
published.** No live page, template, URL or sitemap changed. Cohort 003 is not
published.

**Read `FINAL-REPORT.md` first.** Its headline: 1,000,000 is not honestly reachable
from the sources this project can lawfully hold. The validated universe is 13,975
research candidates, 1,791 publishable now.

## Files

### Start here

| File | What it is |
| --- | --- |
| `FINAL-REPORT.md` | The result, the counting rule, the requested report fields, and what would be required to reach 1M |
| `FUNNEL.json` | Every funnel stage, the split, the buckets, the duplication audit and the per-family sample statistics, as data |
| `AGGREGATES.json` | Totals and the index of the 15 aggregate cuts |

### The inventory

| File | What it is |
| --- | --- |
| `MASTER-CANDIDATE-INVENTORY-1M.jsonl.gz` | 235,502 rows, 42 columns, one per candidate. The authoritative file |
| `MASTER-CANDIDATE-INVENTORY-1M.tsv.gz` | The same rows as TSV, for spreadsheets |
| `_rows.jsonl.gz` | Pre-dedupe generator output. Gitignored: 12 MB of intermediate rows that `generate.mjs` reproduces in seconds |
| `aggregates/*.tsv` | 15 cuts: surface, family, country, city tier, language, market, data source, licence, quality gate, risk level, measured status, monetization fit, template signature, intent modifier, and the measured-direct demand sample |

Every row carries `candidate_status`: `VALID`, `SOURCE_ACQUISITION_CANDIDATE`,
`REJECTED_FAMILY` or `MERGED_DUPLICATE`. Only `VALID` counts toward the universe
size. The buckets are asserted in code to sum to the row count.

### Families, entities, sources

| File | What it is |
| --- | --- |
| `FAMILY-CATALOG.md` | All 27 families with the six distinct-value proofs answered per family. Generated from the catalog so a gate cannot drift from its reason |
| `REJECTED-FAMILIES.md` | The nine REJECT families, 190,677 rows, with reasons. Includes the two routes that would have hit 1,000,000 by padding |
| `BLOCKED-FAMILIES.md` | The three families whose gate passes but whose data is not held |
| `ENTITY-GRAPH.md` and `ENTITY-GRAPH-summary.json` | The reusable entity graph, its availability model, and the field-meaning caveat that moved 3,001 candidates out of the publishable set |
| `entity-graph.jsonl.gz` | Per-entity rows |
| `DATA-SOURCE-CATALOG.md` | 9 sources used, 15 evaluated and not used, with licence, coverage, reachability and cost |
| `DATA-SOURCE-GAPS.md` | The five gaps, ranked by leverage, with candidates and demand unlocked |
| `LICENSING-MATRIX.md` | One row per licence in the inventory with its candidate counts and obligations |

### Measurement

| File | What it is |
| --- | --- |
| `AHREFS-MEASUREMENT-SAMPLES.md` | The sample, the per-family statistics, and the gb-versus-us finding that changed a family verdict |
| `measured/SAMPLES.tsv` | 38 keywords measured this pass with volume, global volume, KD, CPC, clicks and traffic potential |
| `SERP-WEAKNESS-MAP.md` | Five SERPs sampled in full, and the four family verdicts they produced |
| `serp/SERP-SAMPLES.tsv` | The SERP rows |
| `COMPETITOR-UNIVERSE.md` | What this pass added to the competitor picture, plus the low-DR winner pattern |
| `LOCAL-LANGUAGE-MAP.md` | The language rule as implemented, the distribution, and the per-market phrasing findings |

Everything Ahrefs-derived here is **FROZEN_AFTER_AHREFS_EXPIRY**. The subscription
ends 8 October 2026. These files are the only copy after that date.

### Gates and plan

| File | What it is |
| --- | --- |
| `QUALITY-GATES.md` | The five gates, the thresholds, and the duplication audit result including the two concentration figures that are still high |
| `GOOGLE-SAFETY-GATES.md` | Seven hard gates, four soft gates, the standing prohibitions |
| `PUBLICATION-CONTROLLER.md` | The step gates, the per-family caps, ten hard STOP conditions and the rollback model |
| `ROADMAP-10K-TO-1M.md` | The five tracks, each milestone with what it would require, and the sequence I would actually run |

## Regenerating

```
node scripts/atlas/scale/entity-graph.mjs          # entity graph and summary
node scripts/atlas/scale/generate.mjs              # enumerate candidates
node scripts/atlas/scale/dedupe-and-audit.mjs      # funnel, dedupe, audit, inventory
node scripts/atlas/scale/aggregates.mjs            # the 15 cuts
node scripts/atlas/scale/write-catalog-reports.mjs # family, rejected, blocked reports
npm run dashcheck                                  # must report zero
```

Run them in that order. `generate.mjs` reads the entity graph summary, and the
three report writers read the inventory.

## What changed in the repo

Five new scripts under `scripts/atlas/scale/`, plus two annotations in existing
files that fix real defects found while auditing:

- `scripts/atlas/ingest/ourairports.mjs` now documents that `cityKm` is the
  distance to the nearest populated place, not to the served city centre. The value
  is unchanged because other callers depend on it; the meaning is now recorded so
  it cannot be published as something it is not.
- `scripts/atlas/scale/generate.mjs` normalises the city shards' `country` field to
  `iso2`. Reading `iso2` directly returned undefined for all 31,715 cities, which
  silently forced every city family to English only and left the country column
  empty on 141,000 rows.

No live template, page, URL or sitemap was touched.

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
| `LIVDAR-1M-CANDIDATE-MANIFEST.parquet` | **the candidate inventory. See 1M-FINAL-DELIVERABLE.md for the current count, which is generated rather than typed here; 56 columns** |
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

- `reports/livdar-final-research-freeze-2026-09-30/` - the research freeze: master
  keyword builder, family and market rollups, entity and listing universes, source
  matrix, SERP evidence, and the round-three harvest and breadth measurements
- `reports/livdar-master-seo-universe-2026-09-30/` - the 76-family, 11-market
  classification and scale ladders v2 to v5
- `reports/scale-universe-2026-09-29/` - the entity graph, family catalog,
  publication controller, quality gates, licensing matrix, competitor universe
- `reports/candidate-universe-2026-09-29/` - the candidate inventory and quality gates
- `reports/rank-tracker-2026-09-29/` - the Rank Tracker set as configured
- `reports/ahrefs-export-2026-09-28/` - **every raw Ahrefs export.** Backlinks,
  refdomains, anchors, organic keywords, top pages, competitors, content gap, link
  opportunities, Brand Radar, Rank Tracker, SERPs, Site Audit, GSC join. This is the
  folder that becomes irreplaceable when the subscription lapses

## The candidate inventory, and why it is not 1,000,000

**The authoritative number is in `1M-FINAL-DELIVERABLE.md`, which is generated from the
files rather than written by hand, so it cannot drift from the inventory.** Read that
first. The figure as this was last written was **203,623 FINAL DISTINCT** out of 251,611
raw combinations, with every rejection kept visible and carrying a reason, and it moves when
a market finishes ingesting, because the whole chain is one command:
`scripts/atlas/scale/run-1m-pipeline.sh` (add `--from-manifest` to reuse the aggregation and
Wikidata files when only a gate or a report has changed). The step before the report is
`verify-artifacts-agree.py`, which fails the run if the manifest, the summary, the QA report,
the gap summary, the four partition axes and the rejected set do not all carry the same
count.

**The number moved from 233,646 to 203,623 in the pass of 2026-10-01, and the shape of that
move is the main result.** Two opposite corrections happened in the same pass: a gate that
was too loose removed about 44,600 rows, and a URL collision that had been silently
discarding pages gave 5,573 back.

**The loose gate.** The localisation gate was granting a locale on the strength of its
family alone, so one measured German keyword, "hotel prag" at 7,600 a month, was by itself
licensing 8,342 German hotel pages for destinations nobody in Germany was ever measured
searching for. Made destination-aware, and given the 59 outbound measurements that existed in
MARKET-BREADTH-HARVEST.csv but had never reached the reach file, the gate finds that the
cross-language inventory this project can actually evidence is **223 pages, not 35,426**. The
other 44,628 are preserved as LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION, each naming the family
demand it has and the destination demand it lacks. Measured cross-language reach covers about
100 destination and market pairs; it does not cover thousands of cities, and extending it to
them is the geographic form of the city-name swapping this inventory is built to avoid.

**The silent loss.** The cross-artifact check, added in the same pass and run for the first
time, found twelve URLs sitting in both the kept manifest and the rejected file. The cause
was a path built from the surface plus the last segment of the family id, which drops the
part that distinguishes five families: relocation, health, banking, taxes and
cost-of-living all share the surface "move" and the segments "city" and "country". All of
them resolved to the same path, and exact dedupe kept whichever was generated first with no
record of the rest. Fixing it recovered 5,573 pages that are genuinely distinct families
with distinct intents and distinct sources. The same collision was also inflating the
duplicate-title count, which fell from 9,060 to 22 once the titles carried the topic too.

An earlier version of this section said the gap to one million was closed by a single
acquisition: ingest OSM and Wikidata POI, give each POI one practical modifier, and that
is 964,920 candidates. **That plan has been withdrawn and the rows it produced were
deleted.** Three reasons, in order of how much they matter:

1. One page per POI is scaled-content spam. An unknown restaurant with a name and
   nothing else does not deserve a URL, and 161,474 such rows were generated in an
   earlier pass and then removed.
2. The SERP says so. A query for a named venue returns the venue's own site and its
   social profiles. Measured again on 2026-10-01 at neighbourhood level: "indian
   restaurants shoreditch" has no independent list in its top eight at all, only venue
   sites at DR 43 and DR 72, then TripAdvisor at DR 91 and OpenTable at DR 84.
3. What replaces it is smaller and real. 3,000,000-plus named POI now sit behind
   AGGREGATION pages: the cafes in a city, the Indian restaurants in a city, the
   restaurants inside a named neighbourhood, the supermarkets open on Sunday. One page
   per useful list, not one page per venue.

### What actually caps the number

Every cap below was added because a measurement or a SERP showed it, and each is written
down so it can be revisited if a later measurement disagrees.

- **An area must be a NAMED entity.** Requiring a polygon, a population, a Wikidata item
  or a Wikipedia article cut the usable place set from 37,947 to 11,854. The probe that
  validated neighbourhood demand used Kreuzberg, which is famous; it says nothing about
  an unnamed suburb.
- **A POI belongs to exactly one area.** Letting every covering extent claim it produced
  four times as many area pages, and they would have been near-duplicate lists of the
  same venues across adjacent neighbourhoods.
- **Modifier pages are gated on city size**, because every measured keyword for them
  named a large city. Cuisine pages reach further down, to 75,000, because Watford and
  St Albans carry measured cuisine demand.
- **An area page needs its parent city page to exist**, or it is an orphan by
  construction.
- **Individual entity pages only where a third party can rank.** A named hospital,
  university, library or station returns its own site, so those classes feed city lists.
- **A gazetteer "city" inside a much larger city is a quarter of it.** GeoNames lists
  Quinze-Vingts with 26,265 people and feature class PPL; it is the 12th arrondissement
  of Paris. Those are removed from city families and kept as neighbourhood entities.

Two structural facts also cap it, and both are real rather than conservative choices:

1. **The site is language-scoped, not market-scoped.** Live URLs are `/en/`, `/de/`,
   `/it/`. en-US and en-GB share `/en/`, so a page for one entity in one family exists
   once per language. Eleven markets collapse to ten languages.
2. **1,168 city names are shared by 2,833 cities.** Ambiguous names carry their country
   in the slug, or two different cities silently become one URL. Barcelona, Venezuela
   inheriting the measured demand of Barcelona, Spain is what this prevents.

### Files added in the quality-first pass

| file | what it holds |
| --- | --- |
| `1M-FINAL-DELIVERABLE.md` | the authoritative report, generated from the files |
| `1M-QA-REPORT.json` | titles, duplicates, shared uniqueness reasons, orphans, dashes |
| `1M-SIMULATED-TITLES.csv.gz` | the title, meta and H1 every candidate would render |
| `1M-POI-AGGREGATION-GATE.json` | every aggregation gate with its count |
| `1M-WIKIDATA-GATE.json` | the Wikidata gates, including dedupe against OSM |
| `08b-SERP-EVIDENCE-AGGREGATION-SHAPES.csv` | seven SERPs measured for the new shapes |

Outside this folder: `data/atlas/sources/osm-poi/` and `osm-places/` hold the
materialised OSM corpus and the named places with polygons where OSM has them;
`data/atlas/sources/wikidata/` the CC0 entities; `data/atlas/sources/events/
pulse-entities.json` the holidays of every market country normalised from four providers
with provenance per row; `data/atlas/candidates/` the manifest partitioned by market and
by family; and `data/atlas/measurements/ahrefs-aggregation-shape-demand-2026-10-01.json`
the thirteen demand probes with their verdicts, including the ones that came back
negative.

## The one rule for future work

When new research happens, it goes into `02-MASTER-KEYWORDS.csv` through the builder
at `scripts/atlas/scale/master-keywords-final.mjs`, as a new numbered loader block
with its own `source_of_keyword`. That is how round three was added. It keeps the
dedupe ladder, the provenance and the counts intact. A new standalone keyword file
is how a project loses its history.

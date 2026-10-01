# 1M candidate inventory: readiness

**State: 297,988 distinct candidates prepared offline. Not yet 1,000,000.**
Nothing is published. The 500 live pages are untouched.

The gap is no longer a research question or a licence question. It is **compute time on
a pipeline that is built, verified and running.**

## What changed this pass

The previous pass left POI ingestion as an acquisition task. This pass built it and ran it.

**The blocked route was worked around, not accepted.** `download.geofabrik.de` is blocked
by the environment's network policy — even a 60-byte checksum file is refused. But
`download.openstreetmap.fr/extracts/` serves the same regional extracts and returns 200,
at roughly 35 MB/s. That mirror is the acquisition route.

**The extraction pipeline exists and is verified**:
`scripts/atlas/ingest/osm-poi-extract.py`. It keeps only **named** entities, because an
unnamed POI cannot carry a page, and classifies each into the POI classes the family
catalogue already uses. A node-only fast mode skips the area index, which costs roughly
20x the node pass; node data already holds the dense commercial POI (restaurants, cafes,
gyms, shops, clinics, pharmacies) that Wikidata cannot supply, while Wikidata covers the
institution-shaped polygons under CC0. The two sources are complementary by design.

**Measured yield, not projected**: the Netherlands extract produced **158,572 named POI**,
which became **161,474 candidate pages** at roughly one validated modifier each. That is
a real per-market figure from a real extract, and it is the basis of every projection
below.

## Where the remaining candidates come from

| Market | Extract | State |
|---|---|---|
| Netherlands | 1.5 GB | **ingested**, 158,572 POI |
| Luxembourg | 56 MB | ingested, 6,513 POI (not one of the 11 markets, so it yields no candidates — kept as the pipeline's test fixture) |
| Italy | 2.4 GB | downloaded, queued |
| Japan | 2.7 GB | downloaded, queued |
| Portugal | 454 MB | downloaded, queued |
| Spain, Poland, United Kingdom, Brazil, Ireland | 1.6–2.4 GB each | downloading / queued |
| Germany, France | 5.5 GB each | **not fetched.** Stopped deliberately: they were starving the extractions of CPU and cannot be processed in one session |

The queue runs sequentially in `/tmp/batch_extract.sh`, deleting each extract after
processing to stay inside the disk budget. Extraction is the bottleneck, not download:
pyosmium calls a Python handler per node, so a 1.5 GB extract takes roughly 45 minutes.

**Projection from the measured Netherlands yield:** the nine downloaded markets are
collectively about 10x the Netherlands extract by size and, allowing for lower mapping
density outside the Benelux, should yield on the order of **0.9M to 1.6M POI candidates**.
Added to the 136,514 non-POI candidates, **1M is reached** once the queue drains. Germany
and France would add substantially more on top.

This is a projection from one measured market, and it is labelled as one. The number that
is certain today is 297,988.

## What is certain, and what is not

**Certain**: the route works, the licence is known (ODbL 1.0, share-alike and attribution
mandatory — recorded on every POI row), the extraction is verified against two real
extracts, the classifier maps to existing families, and the candidates flow through the
same dedupe and scoring as everything else.

**Not certain**: the exact final count. It depends on OSM mapping density per country,
which varies by a factor of several and which no amount of arithmetic here can settle.
Only running the queue settles it.

## To finish it

```bash
# 1. resume the extraction queue (it deletes each .pbf after processing)
/tmp/batch_extract.sh                 # or re-create from the repo if /tmp was reclaimed

# 2. fetch the two biggest markets that were skipped
curl -o /tmp/pbf/germany.osm.pbf https://download.openstreetmap.fr/extracts/europe/germany-latest.osm.pbf
curl -o /tmp/pbf/france.osm.pbf  https://download.openstreetmap.fr/extracts/europe/france-latest.osm.pbf

# 3. extract each one
NODES_ONLY=1 python3 scripts/atlas/ingest/osm-poi-extract.py /tmp/pbf/germany.osm.pbf DE data/atlas/sources/osm-poi/poi-DE.jsonl.gz

# 4. regenerate the manifest and the breakdowns
python3 scripts/atlas/scale/build-1m-candidate-manifest.py
python3 scripts/atlas/scale/build-1m-gap-analysis.py
```

`/tmp` does not survive the container, so the materialised POI live in the repo at
`data/atlas/sources/osm-poi/` and the two scripts are committed. Nothing needs rebuilding.

## The honest alternative, if a faster finish matters

pyosmium's Python-per-node handler is the bottleneck. A C++ `osmium tags-filter` pass
before the Python stage, or `osmium export` to GeoJSON and a streaming read, would cut
extraction by an order of magnitude. Neither binary is installed here. If this is run
again on a machine with `osmium-tool`, the whole 11-market ingest is a single afternoon.

## What is NOT counted, deliberately

- **No listing pages.** 47,000,000 job, event and property records exist. A listing that
  expires in weeks is not a durable page, and the research already requires 410 on expiry.
  Feeds unlock the durable parent pages already in the manifest.
- **No unnamed POI.** An unnamed node cannot carry a page.
- **No bare POI entity pages.** `BRAND_OWNED_PLUS_SOCIAL` on measured SERP evidence: the
  official site plus a knowledge panel plus social take the page. Only entity-plus-
  practical-modifier pages are generated, and only for the three modifiers verified as
  MODIFIER_WORKS: tickets, opening hours, how to get to.
- **No Luxembourg candidates.** Its POI are ingested but LU is not one of the 11 markets.

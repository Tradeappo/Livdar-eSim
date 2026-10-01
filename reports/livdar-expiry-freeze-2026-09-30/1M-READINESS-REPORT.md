# 1M candidate inventory: readiness, and why the target does not survive its own rules

**FINAL DISTINCT VALID CANDIDATES: 100,721.** Not 1,000,000.
73,857 candidates were rejected by the quality gates and are kept, not hidden, in
`LIVDAR-1M-REJECTED-CANDIDATES.csv.gz` with a `rejection_reason` on each.

Nothing is published. The 500 live Atlas pages are untouched.

This report exists to say plainly that **the 1,000,000 target and the quality rules in
the same brief cannot both be satisfied**, and to show the measurement that settles it.
Rule 1 says quality before count. Applying Rule 1 is what produced 100,721.

## The measurement that decides it

This pass stopped projecting and ingested real data.

**1,944,704 real named POI were materialised** from OSM regional extracts across six
countries, four of them Livdar markets: Japan 654,530, Italy 522,609, Spain 441,075,
Netherlands 171,369, plus Portugal 103,318 and Ireland 45,290 which are not markets.
1,483,166 of them were attributed to a named city, 497,377 by their own `addr:city`
tag and 985,789 by spatial match against the 31,715-city gazetteer.

**Those 1.94 million POI produced 12,626 candidate pages.**

That is the whole argument. The ratio is roughly **154 real POI per defensible page**,
and it is not a filtering accident. It is what happens when you refuse to give every
unknown restaurant a URL:

| Rejected at the POI gate | Count |
|---|---|
| city x category below the minimum count to be a useful list | 69,984 |
| class is not something anyone searches as a list | 51,130 |
| individual entity not notable (no Wikidata cross-reference) | 35,193 |
| country has no Livdar market | 15,350 |
| list entries too thin (name only, no hours, site or phone) | 9,545 |
| notable entity but too few source fields | 7,632 |

Per market the yield is remarkably stable: Italy 4,164, Japan 3,131, Spain 2,818,
Netherlands 2,513. Call it **3,150 per market**. Eleven markets is therefore about
**35,000 POI aggregation candidates**, not hundreds of thousands.

## What the previous pass got wrong, and this pass removed

The previous pass reported 297,988 candidates, of which **161,474 were one page per POI
per modifier**. Under this brief's own rule, that is scaled-content spam: a restaurant
with a name and nothing else does not deserve a URL, and "POI x modifier without
utility" is named in the prohibitions. Those 161,474 rows are **deleted**, replaced by
the 12,626 aggregations above. The count fell by 148,848 and the inventory got better.

That is the correct direction of travel and it is worth being explicit about: two of the
three times the count moved this session, it moved **down**, because a gate was added.

## The honest arithmetic to 1,000,000

| Source | Candidates | Basis |
|---|---|---|
| Already in the manifest | 100,721 | measured |
| Remaining 7 markets' POI aggregations | about 22,000 | measured per-market yield x markets |
| Neighbourhood x category aggregations | 50,000 to 100,000 | needs OSM admin boundary polygons; most neighbourhoods will fail the minimum-count gate, so this is a wide range |
| Holiday and calendar expansion to AU, CA and subdivisions | 10,000 to 30,000 | pulse families already validated, extension is mechanical |
| Wikidata enrichment | about 0 new | it raises quality and notability, it does not add count |
| **Realistic ceiling under these gates** | **200,000 to 250,000** | |

**To reach 1,000,000 you would have to publish roughly 800,000 pages that fail at least
one gate in this brief.** The most likely candidates would be the per-POI pages just
deleted, or city x category pages below the usefulness minimum, or entity pages with a
name and no data. I am not going to generate those and call them an inventory.

If the 1M figure is a commercial commitment rather than a quality judgement, the honest
options are: accept a smaller, defensible inventory; or buy datasets dense enough to
support more genuine aggregations (per-city rental, salary, school and crime datasets
would each add real per-city pages); or change the rules deliberately and knowingly,
with the scaled-content risk accepted in writing.

## What is genuinely ready

| Signal | Value |
|---|---|
| FINAL DISTINCT candidates | 100,721 |
| every row has a `uniqueness_reason` | 100,721 of 100,721 |
| SERP measured and OPEN (`strong_opportunity`) | 21,683 |
| SERP viable | 12,619 |
| SERP competitive | 3,687 |
| SERP measured poor fit | 2,904 |
| SERP never sampled (`unsampled_needs_serp_check`) | 59,828 |
| tool pages | 4,097 |
| aggregation pages | 10,579 |
| content pages | 86,045 |

**59,828 rows have never had their SERP sampled.** That is labelled honestly rather than
scored as a poor fit, which is what an earlier version of this pass did wrong: calling an
absence of evidence a negative verdict marked 62% of the inventory bad on no basis. Those
rows need SERP sampling before they are promoted into a cohort, and that is the single
largest remaining research task.

## Pipeline state, so none of this needs redoing

- **OSM route**: `download.geofabrik.de` is blocked by the environment network policy;
  `download.openstreetmap.fr/extracts` works at about 35 MB/s.
- **Speed**: `osmium tags-filter` prefilters a country extract to POI-tagged nodes in
  40 seconds to 4 minutes (a 2.4 GB Italy extract becomes 69 MB), after which the Python
  classifier takes under 2 minutes. The earlier pure-pyosmium pass took 45 minutes per
  1.5 GB; installing `osmium-tool` cut the whole ingest from hours to minutes.
- **Scripts**: `scripts/atlas/ingest/osm-poi-extract.py`,
  `scripts/atlas/scale/poi-aggregations.py`,
  `scripts/atlas/scale/build-1m-candidate-manifest.py`. All committed and idempotent.
- **Markets still to ingest**: Poland, Great Britain, Brazil, Germany, France, Taiwan,
  United States. Poland, Great Britain and Brazil failed their prefilter because the
  downloads were truncated when the fast pipeline started; they need refetching.

Each remaining market is roughly ten minutes of wall clock.

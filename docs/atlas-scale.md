# Livdar Atlas at scale

This document describes the inventory, the markets and the machinery that
decides what gets published. It is the answer to one question: what does a
number in an Atlas report actually mean.

## What a number means

| Word | What it means | How it is checked |
| --- | --- | --- |
| candidate | The taxonomy allows the combination: one family, one entity, one variant, one market. | `node scripts/atlas/inventory.mjs` recomputes it from the ingested datasets. |
| data_ready | Every source the family requires is present, current and licensed. | The source manifest and its expiry dates. |
| measured | A named provider returned demand for this page in this market. | The measurement carries provider, date, checksum, cost and confidence. |
| qa_passed | The generated model passes every automatic check. | `node scripts/atlas/qa.mjs` |
| approved | Scoring cleared it and a lot claimed it. | The score, its components and the rule are stored on the registry row. |
| published | The registry publishes it, so it routes and enters a sitemap. | `node scripts/atlas/registry.mjs status` |
| live | A request to the production origin returned it and it passed the technical checks. | `node scripts/atlas/monitor.mjs` |
| discovered | Search Console reports the URL as known. | The Search Console import, which is not the indexing request log. |
| indexed | Search Console reports it as indexed. | The same import. Requesting indexing is not indexing. |
| performing | It has impressions, and separately clicks. | The same import, counted as two numbers. |

Candidates are never stored. Three hundred thousand rows of "this might
exist" would drift from the datasets the moment either changed, so the
inventory is recomputed instead of asserted.

## Inventory

The candidate space is entities times useful variants times the markets where
the answer differs. It is not pages times languages.

Run `node scripts/atlas/inventory.mjs` for the current figures. As of the
ingest recorded in `data/atlas/manifest.json`:

- 31,715 cities with a GeoNames identifier, coordinates, population and time zone
- 2,386 districts, which GeoNames marks as sections of a populated place
- 3,244 airports with scheduled service and an IATA code, 3,001 of them joined to a city
- 244 countries with cities, 249 in the airport dataset
- 20 verticals, 31 families, 11 markets, 10 languages
- 889,609 candidates, the largest single vertical holding 37 percent of them

## Markets, not translations

A market is a search market. `lib/atlas/markets.js` records each one with the
file and figure that justify its state. Romanian is `excluded`: the existing
Romanian eSIM pages are untouched and no Romanian Atlas candidate is ever
enumerated, which `tests/atlas-scale.test.mjs` asserts.

Each family declares an axis, which is what a second copy of a page would be:

- `language`: the fact is the same everywhere and only the wording changes, so
  there is one page per language. en-US and en-GB share it unless measurement
  shows the intents diverge.
- `audience`: the answer depends on who is asking. A visa rule, a tax treaty,
  a bank account, a health cover, a move from one country to another. One page
  per market, and those pages are not translations of each other.
- `origin`: the answer depends on where the reader travels from. Routes,
  flight time, connections.

## Sources

Every source is listed in `data/atlas/sources.json` with its URL, licence,
attribution, fields, refresh rule and maximum age. `data/atlas/manifest.json`
records what was actually downloaded: the date, the checksum of the bytes that
were parsed, the row count and the expiry date computed from the maximum age.

Nineteen of the sources the new verticals need do not exist yet. Their
families are enumerated as candidates and held at the data gate, which the
inventory report separates: 25 families and 381,432 candidates are blocked on
a source, and 508,177 candidates sit in families whose sources are in place.
No page in a blocked vertical is published before its source exists with a
licence that allows commercial reuse.

## Demand

`lib/atlas/keywords/` holds four providers behind one interface: Ahrefs,
DataForSEO, an imported CSV and a deterministic mock for tests. Every result
is normalised to one shape carrying provider, date, checksum, cost and
confidence, so the scoring never has to know where a number came from.

`node scripts/atlas/keywords.mjs manifest` builds the deduplicated keyword
list, counts it, and prices it at the provider published rate before anything
is spent. The full manifest is 1,894,992 deduplicated keywords, 1,895 standard
queue tasks, 94.75 USD. The run refuses to start without `DATAFORSEO_LOGIN`,
`DATAFORSEO_PASSWORD` and `DATAFORSEO_COST_CAP_USD`.

Ahrefs is kept for what it is good at: discovering the phrasings people really
use, comparing query variants, SERP overviews, competitor checks and
validating the highest value lots. It is not used to measure hundreds of
thousands of expressions that DataForSEO measures for a hundredth of the cost.

The eSIM research is not repeated. `data/keyword-research.json`,
`data/market-audit.json` and the five expansion files already hold 7,860
measured keywords across 18 markets, and the market states in
`lib/atlas/markets.js` cite them directly.

## Scoring

`lib/atlas/scoring.js` replaces the single volume threshold. Demand still
carries the most weight, but data completeness and uniqueness together carry
more than volume alone, so a genuinely useful page about a smaller place can
clear the bar and a thin page about a large one cannot. Eight vetoes sit in
front of the score, and a page that trips one is not publishable at any score:
no distinct information, translation only, near duplicate, missing required
source, no measured demand, zero crawlable inlinks, cannibalisation, and a
forbidden dash in public text.

## The writing rule

No en dash and no em dash, in any language, in any public element. The rule is
enforced twice: `scripts/atlas/ingest/*` normalises the dashes out of entity
names at ingest and records how many it changed, and `scripts/dash-check.mjs`
scans the repository. `lib/atlas/text.js` carries the check used by the QA
gate, and `tests/atlas-scale.test.mjs` fails the build if either the helper or
the ingested data regresses. A hyphen standing in for punctuation between two
clauses is caught by the same module.

## Serving at scale

Entities are sharded: `data/atlas/entities/cities/NN.json`, bucket
`geonameId % 64`, around five hundred cities per file. A page loads one shard
whatever the total is, and the bucket rule never changes, so an entity never
moves between files.

Routing keeps the existing behaviour: a limited set of paths is generated at
build time, everything else renders on first request and is revalidated,
production serves only published pages, preview also serves approved ones, and
anything else is a 404.

## Internal linking

`lib/atlas/linking.js` builds a deterministic graph from the published set.
Every published page receives at least three crawlable links from other
published pages, and the lot builder either adds the missing hub pages first
or drops the page. The eSIM pages receive links from the relevant Atlas pages
and are never turned into lists of Atlas links in return.

## Workflows

| Workflow | What it does | What it never does |
| --- | --- | --- |
| atlas-ingest | Refreshes the datasets and the manifests, opens a pull request. | Publish. |
| atlas-keywords | Builds the manifest, costs it, measures within the cap. | Spend without credentials and a cap. |
| atlas-generate | Generates models for a lot and runs QA. | Publish a rejected page. |
| atlas-publish | Publishes or retires a lot, updates the registry and sitemaps. | Run while a guard check is failing. |
| atlas-monitor | Checks Atlas and eSIM daily, flags expired data. | Delete in bulk. |
| atlas-search-console | Imports Search Console, separating discovered, indexed, impressions and clicks. | Treat an indexing request as indexing. |
| atlas-reconcile | Finds published pages that no longer pass their gates. | Retire anything that still passes. |

## Prioritisation

The inventory is ranked by what a page is worth, not by how easy it is to
generate. Three mechanisms do that work, and none of them deletes a family.

**Priority per vertical.** `VERTICAL_PRIORITY` in `lib/atlas/verticals.js`
sets high for relocation, visas, work, cost of living, rents, property, taxes,
banking, health, education, connectivity and comparisons; medium for
transport, safety, neighbourhoods, activities and events; low for weather,
airports and the descriptive hubs.

**The market gate.** A high or medium priority family is enumerated in every
researched market, because it is worth measuring there. A low priority family
is enumerated only in the languages of markets that are already active, and it
earns more markets by producing measured demand. That single rule moved
weather from 37 percent of the inventory to 6 percent without removing a
single page or family.

**Scoring version two.** Demand fell from 0.40 to 0.24 of the weight.
Commercial intent, decision value and monetisation now carry 0.34 between
them, which is more than demand, so a page a reader acts on can outrank a page
a reader skims with several times the volume. A family prior cannot claim
commercial intent on its own: where a measured cost per click exists it is
blended in, so the declared judgement is checked against what the market pays.
`legacyScore` is kept so the two versions can be compared on the same inputs.

Two families are selected whatever they score. `destinations.city-hub` and
`destinations.country-hub` are marked `structural`, because every city family
links up to them and dropping them orphans the commercial pages above them.
Any family with pages already published is selected too: live pages are not
retired to improve a distribution table.

**The guardrail** is a signal, not a quota. No percentage is imposed without
data. When one family passes 10 percent of the inventory, a vertical passes 25
percent, a single low priority family passes 8 percent or all low priority
families together pass 20 percent, `node scripts/atlas/prioritise.mjs` names
it with the number. Nothing is cut silently.

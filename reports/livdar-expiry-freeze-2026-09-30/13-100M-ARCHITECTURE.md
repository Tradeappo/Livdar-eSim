# Architecture for 100M candidates

**This document does not argue that Livdar should publish 100M pages, or that 100M
pages could rank.** Every measurement in this freeze says the opposite: the defensible
publication ceiling today is 25,000. See `12-SCALE-LADDER.md`.

What this describes is a **candidate graph** that can hold 100M rows and still only ever
emit the few thousand that earn publication. The point of building for 100M is not to
publish 100M. It is that a system which can score 100M candidates and reject 99.97% of
them is a system that can never accidentally publish a weak page - and that is exactly
the property the ten STOP conditions in `14-PUBLICATION-CONTROLLER.md` are defending.

The raw universe is already 72,567,541 rows (`06-ENTITY-LISTING-UNIVERSE.csv`). The
100M figure is not aspirational; it is roughly what this domain contains once listings
churn. The architecture has to hold it whether or not anyone wants it to.

## The shape

```
                    ┌─────────────────────────────────────────┐
  sources  ────────▶│ 1. INGESTION (per source, idempotent)   │
                    └───────────────────┬─────────────────────┘
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │ 2. ENTITY GRAPH (canonical entities)    │
                    │    dedupe → cluster → canonical select  │
                    └───────────────────┬─────────────────────┘
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │ 3. CANDIDATE GENERATION                 │
                    │    entity × family × market → candidate │
                    └───────────────────┬─────────────────────┘
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │ 4. SCORING (four independent scores)    │
                    │    demand · indexability · quality ·    │
                    │    source confidence                    │
                    └───────────────────┬─────────────────────┘
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │ 5. PUBLICATION CONTROLLER (the gates)   │
                    │    cohort → gate readings → publish     │
                    └───────────────────┬─────────────────────┘
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │ 6. LIFECYCLE (expiry, noindex, archive) │
                    └───────────────────┬─────────────────────┘
                                        ▼
                    ┌─────────────────────────────────────────┐
                    │ 7. FEEDBACK (GSC → scores → next cohort)│
                    └─────────────────────────────────────────┘
```

Stage 5 already exists and is operative. Stage 2 exists as
`reports/scale-universe-2026-09-29/ENTITY-GRAPH.md` plus `entity-graph.jsonl.gz`.
Stages 1, 3, 4, 6 and 7 are partly built; what follows is the target state.

## 1. Ingestion

One adapter per source, each one idempotent and each one recording provenance. The rule
that matters: **an adapter writes the source row and the fetch timestamp alongside every
field it produces.** A field without provenance cannot be published under STOP
condition 8, so provenance is not metadata, it is a publication prerequisite.

| Ingestion type | Volume | Cadence | Notes |
|---|---|---|---|
| POI (OSM + Wikidata) | 25.5M verified | monthly full, weekly delta | ODbL 1.0 share-alike. Attribution is mandatory and is a STOP condition |
| Listings: jobs | ~30M churning | daily | expires 2 to 8 weeks. Requires JobPosting structured data with `validThrough` |
| Listings: events | ~5M | daily | expires on event date |
| Listings: stay (property/rate) | ~8M | continuous | affiliate terms generally forbid caching rates |
| Listings: rentals/rooms | ~4M | daily | expires 2 to 6 weeks |
| Durable facts (holidays, tax, salary, climate, visa rules) | thousands | annual or on change | the cheapest and most durable rows in the system |

Each adapter is a pure function from source payload to graph rows, so it can be re-run
over an archived payload. That is what makes a bad ingestion recoverable without
re-fetching from a source that may by then have changed or gone away.

## 2. Entity graph: dedupe, clustering, canonical selection

The graph holds canonical entities, not source records. Three operations produce it:

**Dedupe** - the same entity arriving from two sources must collapse to one node.
Keyed on geographic proximity plus normalised name plus type, never on name alone
(dozens of `Hauptbahnhof`), never on coordinates alone (a mall and its cinema share
them).

**Semantic clustering** - entities that answer the same query cluster together, so one
page serves the cluster instead of one thin page per member. This is the single most
important defence against thin content at scale, because it converts a
million-entity long tail into a few thousand legitimate pages.

**Canonical selection** - one URL per cluster per market, chosen by demand, not by
alphabet. The keyword master decides: the cluster's canonical is the entity whose
keyword carries the demand. Cross-market, the rule already established in the dedupe
ladder holds - the same intent in two markets is two pages, never one, because
`kalender 2026` is 333,644 in DE and 146,979 in NL and folding them loses both.

## 3. Candidate generation

A candidate is `entity × family × market`. At 25.5M POI entities × 191 families × 11
markets the cross product is astronomically larger than 100M, so candidate generation
is **gated at birth, not filtered later**: a candidate is only created where the family
has a measured keyword pattern for that market in `02-MASTER-KEYWORDS.csv`.

That single rule is what keeps the graph at 100M instead of 50 billion, and it is the
architectural expression of the lesson from `12-SCALE-LADDER.md`: entity arithmetic
generates rows that no query wants.

## 4. Scoring: four scores, never blended into one

Blending is how a weak page sneaks through on a strong average. Each score is computed
and stored independently, and publication requires a floor on **every** one.

**Demand score** - from the keyword master: volume, KD, CPC, traffic potential, SERP
class. A candidate with no measured keyword scores zero and is never publishable,
however complete its data.

**Indexability score** - from the SERP classification in `08-SERP-EVIDENCE.csv`. This is
the score that most often vetoes. `BRAND_OWNED_PLUS_SOCIAL`, `AGGREGATOR_LOCKED`,
`SERP_FEATURE_SUPPRESSED` and `OPEN_BUT_ECONOMICALLY_DEAD` are vetoes regardless of
volume - a family can have enormous demand and still be unrankable, which is the single
most expensive lesson in this project.

**Quality score** - field completeness, field count, whether the page says anything a
competitor page does not. The existing gates are in
`reports/scale-universe-2026-09-29/QUALITY-GATES.md`.

**Source confidence score** - from `07-DATA-SOURCES.csv`: licence permits publication,
storage rights permit caching, refresh cadence matches the field's volatility, and the
row is not low-confidence.

## 5. Publication controller

Already defined, operative, and not restated here. See `14-PUBLICATION-CONTROLLER.md`:
per-step gates, per-family caps, ten STOP conditions, per-batch rollback.

## 6. Lifecycle: expiry, auto-noindex, archive and redirect

The lifecycle rules per axis are already in `06-ENTITY-LISTING-UNIVERSE.csv`. The
system-level requirements:

- **Every candidate carries an expiry policy from birth**, inherited from its family.
  A page whose expiry policy is unknown must not be published.
- **Expired listing**: `410 Gone` plus sitemap removal where there are no inbound
  links, `301` to the durable parent where there are. Never left `200` with stale
  content - that is the failure mode that turns a listing site into a spam signal.
- **Durable parent pages never expire.** The page is the query; its contents refresh
  underneath. This is why durable parents are worth more than listings even at lower
  volume.
- **Auto-noindex triggers**, evaluated continuously and acting without a human:
  field completeness falls below the family floor; the source row's licence or
  publication right changes; zero impressions for 90 days on a page older than 120
  days; the cluster's canonical moves to another URL.
- **Recurring events roll the year** rather than 410 - `konzerte 2026` becomes
  `konzerte 2027` - because the query recurs even though the occurrence does not.

## 7. Sitemap sharding, crawl controls, and the GSC feedback loop

**Sharding**: 50,000 URLs per sitemap, sharded by family then market then cohort, so a
rollback is a shard removal and an indexation reading is per-family without a join.
Sitemap index at the root; `lastmod` honest, because a falsified `lastmod` trains Google
to ignore all of them.

**Crawl controls**: crawl budget follows demand. High-demand durable parents are
linked from the shallowest internal depth; long-tail entity pages sit deeper and are
reached through cluster parents rather than from a flat index. Faceted and parameterised
URLs are `robots.txt`-excluded rather than canonicalised, because at this scale
canonical hints on millions of near-duplicates get ignored.

**The feedback loop, which closes the system**: GSC impressions, positions and
indexation status per URL flow back into the demand and indexability scores of every
*unpublished* candidate in the same family and market. A family that underperforms in
cohort N lowers the score of its whole unpublished tail before cohort N+1 is chosen.

This is what replaces Ahrefs after expiry, and it is strictly better for this purpose:
GSC reports Livdar's own real performance rather than a third-party estimate of it. The
loop needs no paid tool, and `15-AHREFS-REPLACEMENT.md` covers the jobs it does not do.

## What to build first, if this is ever built

1. **The feedback loop (stage 7)** - it needs no new data source, it works from free
   GSC data, and without it every cohort decision is blind.
2. **Scoring as four separate stored scores (stage 4)** - mostly a refactor of what
   already exists in the quality gates, and it is what makes the controller mechanical
   instead of manual.
3. **Lifecycle automation (stage 6)** - before any listing family is published, never
   after. A listing site without automated expiry degrades faster than it grows.
4. Everything else is optimisation.

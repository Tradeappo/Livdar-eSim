# Quality rules

Every rule that decides whether a candidate becomes a page, with the count it removed in the
current run where one exists. Counts come from `LIVDAR-1M-REJECTED-CANDIDATES.parts` (870,019
rows, intact) and `1M-SUMMARY.json`. The code is `scripts/atlas/scale/build-1m-candidate-manifest.py`
unless stated otherwise.

**The standing principle.** A page exists only if it can name why it should: measured demand
for it, or standalone utility from real source data. A gate that would have to be relaxed to
reach a number is not relaxed; the number is reported. Two of the largest moves in the history
of this inventory were DOWN (transit 510,592 → 125,652; climate -23,453), and they are why
the current figure can be trusted.

---

## 1. The rejection file, by reason

| reason (rejected file) | rows | what it refuses |
|---|---:|---|
| `localization` (`REJECTED_LOCALIZATION`) | 464,901 | a page in a language that has no local reason for it (section 4) |
| `REFUSED_MEASURED_CANNIBALISATION` | 103,973 | whole families whose query is absorbed by another family: `climate.city-annual` ("X climate" parent topic points to the city, the month page or best-time), `destinations.city-hub` ("X travel guide" parent topics are things-to-do; dead outside English) |
| `REFUSED_FABRICATED_PRECISION` | 74,434 | `climate.city-day`: a daily figure from MONTHLY normals is precision the source does not carry |
| `REJECTED_QUALITY` | 70,852 | no defensible `uniqueness_reason`, or `indexability_score` < 15 |
| `REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY` | 69,335 | `weather.city-best-time` is admitted one (language, city) pair at a time on measured volume; neither population, POI count nor a sibling family predicts it (Sedona 2,400; Leipzig 0) |
| `REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET` | 32,286 | the family was never measured in this market (per-market family gate) |
| `REJECTED_SAME_CLIMATE_GRID_CELL` | 31,555 | NASA POWER is gridded (~55 km): cities in one cell carry byte-identical normals. One page per (language, family, cell). Net effect on FINAL -23,453. **Permanent.** |
| `REJECTED_SERP` | 12,627 | a measured closed SERP (`serp_class` not winnable) |
| `REJECTED_PARENT_REMOVED` | 4,863 | the page's declared parent did not survive, so it would be an orphan |
| `REJECTED_DUPLICATE` | 3,068 | exact duplicate URL |
| `REJECTED_SAME_WIKIDATA_ITEM` | 1,486 | another row already pages this Wikidata item on this surface |
| `REJECTED_SAME_JOURNEY_BETTER_EVIDENCED` | 399 | the same journey already has a better-evidenced transport page |
| `REJECTED_UNSUPPORTED_SUPERLATIVE` | 179 | a template-invented "best/top/most" with no ranking source |
| `REJECTED_SAME_NAME_IN_CITY` | 59 | two entities of the same name in the same city |
| `REJECTED_SEMANTIC_DUPLICATE` | 2 | same `semantic_cluster_id` (family x market x template) |
| `REJECTED_CROSS_MARKET_CONTENT_DUPLICATE` | 0 | same-language markets (en-US/en-GB/en-AU, es-ES/es-MX) claiming the same (family, entity, intent); 0 because ownership is decided first (section 5) |
| total | **870,019** | 1,872,381 generated - 870,019 = **1,002,362** |

Losses that happen before any row exists, and so are not in the file: the per-market
**tier cap** abandons a combination when the keyword corpus measured that family x market cell
only down to population tier N and the city is below N (`1M-TIER-CAP-DROP.json` instruments
it). Since 2026-10-13 a city below the tier is admitted if the **free measured signal** says it
is looked for (section 3).

## 2. Scores (all 0 to 100)

```
demand_score(fid, market, tier):
    cell measured in this market: top volume >=10000 -> 100, >=3000 -> 85, >=1000 -> 70,
                                  >=300 -> 55, else 40
    family measured only elsewhere -> 30
    no evidence anywhere          -> 0
    minus tier decay {1: 0, 2: 5, 3: 15, 4: 30}

source_score  = {READY_NOW 100, SOURCE_AVAILABLE 55, FEED_REQUIRED 30, LICENCE_REQUIRED 15, BLOCKED 0}
serp_score    = from the measured SERP class of the family (SERP_SCORE table; 40 when not sampled)
quality_score = clamp(min(100, 40 + 8 * required_fields) - RISK_PENALTY[duplicate_risk])
                RISK_PENALTY = {LOW 0, MEDIUM 15, HIGH 35, VERY_HIGH 50, unset 10}
                aggregation rows: 45..50 + 2 * members (capped) + 6 * enriched members
indexability  = min(quality, demand, source, serp)        # a floor on every score, never blended
publication_priority = round(0.55 * indexability + 0.30 * demand + 0.15 * serp, 1)
```

`indexability < 15` is a rejection. `publication_priority` is comparable **inside a market
only**: sorting across markets once put 969 of 1,000 cohort pages in Japanese.

## 3. Demand evidence and admission contracts

**Family x market measurement.** `market_demand_evidence` values: `measured_in_this_market`
(222,625 rows), `shape_measured_2026_10_07_open_serp` (488,262), `shape_measured_2026_10_01`
(285,098), `family_measured_elsewhere` (6,377). These say the family's QUERY PATTERN is searched
in the market. They are **not** per-page demand.

**The free measured signal** (replaced the expired paid tier cap, 2026-10-13,
`1M-FREE-DEMAND-SIGNAL-2026-10-13.md`): Wikimedia **clickstream**, referrer class
`other-search`, counts readers who searched, saw a result and clicked the entity's own
Wikipedia article. CC0. Joined to cities through Wikidata P1566 sitelinks. The admission floor
is **calibrated** by `calibrate-search-demand-floor.py` from the readership of cities the paid
corpus had already admitted, excluding rows admitted by this signal, so the bar cannot walk
downward run after run. `verify-search-demand-admissions.py` checks every admission against its
constraints.

**Landmark contract** (`landmark-candidates.py`): refused when no edition reads ten a month
(the lowest reading that exists), fewer than two printable facts, the class is an
administrative container (the area contract judges it), Wikidata states no containing
administrative area, below both the readership floor and the calibrated substance bar, another
surface already pages the item, or no country / no ISO code. Admitted "on demand" (readership)
or "on utility" (substance bar = 3 printable facts, the 75th percentile of rows admitted on
readership alone).

**Settlement contract** (`settlement-candidates.py`): readership below the calibrated floor for
its language; fewer than 2 facts beyond population, area and elevation AND fewer than 3 Atlas
pages inside it; the city layer already pages the article; another surface already pages the
place; no containing area other than itself; another settlement in the same area states exactly
the same things.

**Area contract** (`area-candidates.py`): an administrative subdivision needs ALL THREE of
readership, five admitted children, and two facts beyond population, area and elevation
("nobody visits a canton"). No generic name/population/area template pages. Classes are routed
to a contract by what they ARE before anything is fetched (`wikidata-class-tail-capture.py`),
and the containers among them are reserved from the landmark contract
(`data/atlas/sources/wikidata/landmark/_area-reserved-qids.json`, 102,207 ids), which is how
3,179 powiats, districts, departments and counties stopped being paged as landmarks on two
facts and a parent (`1M-REACHED-2026-10-19.md`).

**Heritage registers**: listed on an official register (NRHP, Merimee, rejestr zabytkow,
Rijksmonumentenregister, NHLE ...) AND readership.

**Per-page demand basis** (`scripts/atlas/classify-demand-basis.py`, 2026-10-21):

| class | rows | rule |
|---|---:|---|
| DEMAND_PROVEN | 285,729 | evidence that names THIS entity: clickstream readers of its own article, "Admitted on demand", or a measured keyword containing its name |
| UTILITY_PROVEN | 363,447 | a page about one thing, admitted on source facts, with the family pattern measured in its market |
| AGGREGATION | 353,186 | a page about a set or a pair (category, cuisine, city pair, region list), admitted on member count and the family pattern |

Unknown volume is `null`, never `0`. In live cohorts the monitor (`scripts/atlas/atlas-monitor.mjs`)
splits pages into `DEMAND_PROVEN` and `UTILITY_PROVEN`; a page that is neither fails its test.

## 4. Localisation (the largest gate)

Each row is classified before admission (`localization_class`):

| class | admitted? | meaning |
|---|---|---|
| `NATIVE_LOCALE` | yes (828,526) | the page language is the language of the entity's country |
| `VALID_LOCALIZATION` | yes (173,836) | a foreign-language page with measured demand from that language for THIS destination |
| `TRANSLATION_ONLY` | no | the native-language page exists and this one adds no measured local demand |
| `LOCAL_INTENT_MISSING` | no | the family was never measured in this market and the language is not the country's |
| `LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION` | no | the family is proven in the market, but not for this destination ("hotel prag" at 7,600 does not license 8,342 German hotel pages) |
| `LOCAL_DATA_MISSING` | no | cross-language page whose source is blocked, so nothing locale-specific could be on it |

A destination earns a page in a language only where that language shows measured demand for
it. Every destination row must carry at least one locale-specific fact (`locale_facts`); 704
rows still have none and are tracked in QA.

## 5. Same-language markets, ownership and cannibalisation

Which market owns an entity in a shared language, strongest evidence first: (1) the HOME
market (the entity is in the market's own country); (2) entity-specific measured demand;
(3) the rest. The old rule (higher family demand_score wins) let en-AU take 477 Mexican cities
and left es-MX with zero rows. The cross-market content-uniqueness gate then compares exact
content, semantic cluster, section set, data signature, fact set and template signature between
same-language markets; it removes 0 because ownership leaves nothing to contest.

Cannibalisation: one intent owner per (family, entity, intent); `cannibalization_risk` is
recorded per family; whole families whose parent topic belongs to another family are refused
(section 1). QA: `intent_owners_claimed_by_more_than_one_url` = 0,
`urls_sharing_a_cannibalization_key` = 0.

## 6. Anti-thin, anti-duplicate, anti-doorway

- **No stop-to-stop transport.** Transport units are settlements or significant heterogeneous
  nodes (`TRANSPORT-MODEL.md`). A pair needs 3 of 5 class-B signals.
- **No Cartesian pairs.** A transport pair exists only where something real connects its two
  ends: a published timetable (GTFS), a rail edge or an air route in the graph
  (`data/atlas/sources/transport/graph-edges.jsonl.gz`, `rail-edges.jsonl.gz`). The two directions
  of a corridor are one page unless their facts differ.
- **No city-name swaps.** Same climate grid cell → one page. Same settlement facts in the same
  area → refused. Same name in the same city → one page.
- **Thin outdoor entities** (one attribute, no notability) get a line in their parent's list
  instead of a page.
- **Every row must state `uniqueness_reason`**, and QA counts reasons shared verbatim with
  another row (5 left).
- **Fabricated precision** and **unsupported superlatives** are refused; ranking families need
  a documented methodology before publication.
- **Parent survival**: a row whose declared parent was removed is removed (4,863). QA: 2,174
  orphan pages remain flagged in the simulated graph; `declared_parent_is_not_a_valid_parent` = 0.
- **Identity, not names** (`scripts/atlas/scale/entity_identity.py`): `city_key` is unique by
  construction; `city_label` adds the region only where the bare name is ambiguous inside its
  country (Woodstock, Georgia / Woodstock, Illinois); `city_slug` adds the country only where
  the name is shared across countries serving the same language. The gazetteer holds 1,051
  names shared across countries and 640 within one country.
- **Slugs**: one slug function folds Latin diacritics (`ue` for `ü` in German) and keeps CJK;
  QA counts 0 URLs that collide after folding and 0 URLs with a diacritic.
- **No long dashes** anywhere (`npm run dashcheck`: 0 en dash, 0 em dash, repository wide).

## 7. Canonical, hreflang, parent and child

- **URL space is language-scoped**: `/{language}/{surface}/{family}/{entity}/` in the
  inventory; live Atlas pages use a per-language segment (`/de/wetter/muenchen/`).
- **Canonical is self on every page.** A market page never canonicals to a generic page: a
  candidate either exists and self-canonicals, or is not created
  (`HREFLANG-CANONICAL-DESIGN.json`, design only, not deployed).
- **hreflang** is emitted in the HTML head, not the sitemap, so the cluster cannot drift from
  the page. The cluster is `family::entity` across all cohorts (`alternatesFor` in
  `lib/atlas/serve-pages.js`); every member lists the others; **x-default** points at the
  English member and is omitted where the cluster has no English page.
- **Parent and child**: every page declares `parent_url`; the parent must survive the build.
  24,683 parents are valid but not a path prefix (allowed, recorded).

## 8. Cohort gates (on `main`, before anything is published)

`scripts/atlas/cohort-qa.mjs --cohort NNN --ci` rebuilds every page from its model builder and
checks 22 things: builds, unique path / title / description / H1, word floor (family `minWords`,
typically 250 to 300; Japanese 320 characters), canonical, title and description length per
script, H1 present, provenance with a licence, no long dashes, schema, freshness, hreflang self /
resolves / reciprocal, x-default, no orphans, links out, links resolve, and **near duplicate**
(shingle Jaccard at `NEAR_DUPLICATE_AT = 0.8`, `lib/atlas/similarity-scale.js`). Then the test
suite adds, among others:

- the **entity audit** (`scripts/atlas/audit-entities.mjs`): keyword, entityName, H1, title,
  description, slug, first paragraphs and structured data must all name the entity; no two
  pages share a keyword in a market;
- **CTA distinctness**: at least half the pages of a language carry a distinct first call to
  action, and no single first step carries more than a fifteenth of the programme;
- **directory headings** for every section in every language;
- **x-default** present exactly where the cluster has an English page, at most 40% of pages
  without one;
- the **monitor**: every page `DEMAND_PROVEN` or `UTILITY_PROVEN`.

Cohort 003 failed 11 of these on the first attempt (shared family keywords, Latin-script
Japanese names, English exonyms such as "Wetter in Munich", a tool CTA on every page, missing
headings). All were fixed at the source; none was relaxed.

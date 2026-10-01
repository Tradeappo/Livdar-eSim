# Livdar candidate inventory: the final state of this pass

Built 2026-10-01. Every number below is read from a generated file, not retyped, so this report and the inventory cannot disagree.

## 1. The number

- FINAL DISTINCT VALID CANDIDATES: **164,656**
- target: 1,000,000
- shortfall: **835,344** (16.5 per cent of target)
- rejected and kept visible: 71,736

The target was not reached. The rest of this report is about why, which of the gaps are closable and at what cost, and what was built instead. No row was added to move this number: every gate that fired is listed in section 5 with its count.

## 2. The funnel, stage by stage

| stage | count | what happened |
| --- | --- | --- |
| generated before gates | 0 | every family crossed with every entity it has, in every market scoped to it |
| passed the uniqueness and SERP gate | 0 | a candidate with no uniqueness_reason, or in a SERP archetype measured as closed, is rejected here |
| after exact dedupe | 164,656 | same url_pattern |
| after semantic dedupe | 164,656 | same market, family, template signature and entity |
| FINAL DISTINCT | 164,656 | what is in the manifest |

## 3. Where the candidates are

### By market

| market | candidates |
| --- | --- |
| en-GB | 44,927 |
| de-DE | 22,528 |
| fr-FR | 18,102 |
| es-ES | 17,112 |
| it-IT | 15,529 |
| ja-JP | 14,083 |
| nl-NL | 10,874 |
| pt-BR | 9,270 |
| en-US | 9,159 |
| pl-PL | 2,319 |
| zh-Hant-TW | 753 |

### By surface

| surface | candidates |
| --- | --- |
| places | 64,116 |
| stay | 31,445 |
| areas | 22,838 |
| move | 10,627 |
| poi | 9,733 |
| pulse | 7,566 |
| climate | 5,638 |
| tools | 4,097 |
| transport | 3,796 |
| work | 3,681 |
| sport | 578 |
| safety | 541 |

### By readiness

| status | candidates |
| --- | --- |
| POI_AGGREGATION | 76,554 |
| MISSING_DATA | 38,685 |
| BLOCKED_BY_LICENCE | 31,597 |
| NOT_IMPLEMENTED | 9,922 |
| EXPERIMENT_ONLY | 7,059 |
| VALIDATED | 819 |
| PROMISING | 20 |

### By source readiness

| source_status | candidates |
| --- | --- |
| SOURCE_AVAILABLE | 114,159 |
| LICENCE_REQUIRED | 31,597 |
| READY_NOW | 10,908 |
| FEED_REQUIRED | 7,992 |

### By SERP feasibility

| serp_feasibility | candidates |
| --- | --- |
| unsampled_needs_serp_check | 78,008 |
| viable | 31,239 |
| competitive | 22,734 |
| strong_opportunity | 21,683 |
| poor_fit | 10,992 |

### By licence

| licence_status | candidates |
| --- | --- |
| ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED | 69,150 |
| OK | 56,505 |
| LICENCE_REQUIRED | 31,597 |
| CC0_NO_CONDITIONS | 7,404 |

### The twenty largest families

| family | candidates |
| --- | --- |
| activities.city-things-to-do | 15,119 |
| stay.city-type | 12,472 |
| stay.near-venue | 11,559 |
| poi.museum-notable | 9,399 |
| places.area-cuisine | 8,088 |
| places.area-opening | 5,739 |
| places.city-cuisine | 5,664 |
| weather.city-month | 5,638 |
| rents.city | 3,687 |
| events.city-type | 3,494 |
| events.city-calendar | 3,494 |
| places.area-restaurant | 3,143 |
| work.city-salaries | 3,103 |
| relocation.city | 3,103 |
| places.city-category | 3,070 |
| property.city-buy | 2,904 |
| areas.overview | 2,705 |
| comparisons.country-vs-country | 2,700 |
| places.city-restaurant | 2,589 |
| places.area-fast_food | 2,570 |

## 4. What was materialised in this pass

- OSM POI files on disk: 12 (poi-BR.jsonl.gz, poi-ES.jsonl.gz, poi-FR.jsonl.gz, poi-GB.jsonl.gz, poi-IT.jsonl.gz, poi-JP.jsonl.gz, poi-LU.jsonl.gz, poi-NL.jsonl.gz, poi-PL.jsonl.gz, poi-TW-health.jsonl.gz, poi-US-us-midwest.jsonl.gz, poi-US-us-northeast.jsonl.gz)
- OSM place files with geometry: 2 (places-FR.jsonl.gz, places-luxembourg.jsonl.gz)
- POI read: 3,052,380, of which 824,854 carried an addr:city tag and 1,420,517 were attributed spatially against the 31,715-city gazetteer; 807,009 fell outside every city radius and were dropped
- named places loaded: 81,047, of which 11,854 passed the entity gates
- POI assigned to an area by polygon containment: 35,687; by documented proximity to a place node: 749,383
- aggregation candidates: 69,180 ({'city_category': 18513, 'area_category': 24274, 'city_cuisine': 5664, 'area_cuisine': 8092, 'city_attribute': 3, 'city_opening': 1308, 'area_opening': 5742, 'area_parent': 2706, 'notable_entity': 2878})
- Wikidata entities loaded: 40,647, candidates 7,487, deduped against OSM by {'name_and_position': 720, 'qid': 3629}
- Pulse entities normalised from four providers: {'national': 1081, 'regional': 623, 'school': 1502, 'long_weekends': 687, 'bridge_days': 233, 'long_weekends_subdivision': 3539, 'bridge_days_subdivision': 1052, 'bridge_plans': 348}

## 5. Every gate that fired, with its count

Nothing is hidden. A candidate rejected here is in LIVDAR-1M-REJECTED-CANDIDATES.csv.gz with its reason.

### Aggregation gates

| gate | rejected |
| --- | --- |
| entity_not_notable | 3,044,447 |
| below_min_count | 112,168 |
| class_not_a_list_intent | 83,975 |
| cuisine_below_min_count | 76,032 |
| area_cuisine_below_min_count | 44,734 |
| place_no_parent_city | 41,771 |
| area_below_min_count | 39,387 |
| area_class_not_a_list_intent | 34,928 |
| opening_below_min_count | 34,126 |
| place_not_a_named_entity | 26,796 |
| no_market_for_country | 23,902 |
| area_opening_below_min_count | 18,049 |
| entries_too_thin | 12,624 |
| area_entries_too_thin | 8,469 |
| opening_city_below_measured_demand_floor | 5,712 |
| cuisine_city_below_measured_demand_floor | 5,041 |
| notable_but_data_thin | 4,727 |
| area_duplicates_city_list | 4,198 |
| area_parent_too_narrow | 3,928 |
| area_cuisine_duplicates_city_list | 2,574 |
| area_opening_duplicates_city_list | 1,436 |
| area_opening_area_not_a_searched_entity | 567 |
| cuisine_entries_too_thin | 563 |
| place_ambiguous_duplicate_name_in_city | 539 |
| place_no_market_for_country | 87 |
| attr_below_min_count | 35 |
| attr_city_below_measured_demand_floor | 6 |

### Wikidata gates

| gate | rejected |
| --- | --- |
| no_parent_city | 10,849 |
| already_in_osm_corpus | 4,349 |
| list_below_min_count | 4,128 |
| no_official_website_so_page_would_be_thin | 4,065 |
| wikidata_duplicate_qid | 2,795 |
| list_entries_too_thin | 44 |

### Manifest gates

| gate | rejected |
| --- | --- |
| REJECTED_QUALITY: no defensible uniqueness basis | 59,848 |
| REJECTED_SERP: None is not winnable | 11,888 |

## 6. QA at scale

- rows checked: 164,656, distinct URLs 164,656

| check | count |
| --- | --- |
| title_under_15_chars | 61,185 |
| title_over_65_chars | 46,610 |
| meta_over_165_chars | 1,399 |
| long_dash | 232 |
| duplicate_title_exact | 42,805 |
| duplicate_title_same_tokens | 42,829 |
| templates_with_repeated_entities | 0 |
| orphan_pages | 3,870 |

- title length: min 2, max 188, mean 39.1

- stated limitation: the simulated title, meta and H1 skeletons are English. The gate catches structural collisions, which do not depend on the connecting words, but a localised title set still has to be written per market before publication and is NOT done by this script.

## 7. The demand and SERP measurements behind the new shapes

13 probes, 9,400 Ahrefs units. Method: keyword-only select with a volume floor, so each row costs 11 units rather than 22. The question asked of each probe was not 'does this pattern have demand' but 'does the demand carry the MODIFIER the shape needs' - a city name, a neighbourhood name, a cuisine, an attribute. A pattern with large national volume and no city-scoped variants cannot support one page per city.

| shape | market | probe | rows | verdict |
| --- | --- | --- | --- | --- |
| city_opening | en-GB | open on sunday | 195 | PATTERN_REAL_BUT_NOT_CITY_SCOPED |
| city_opening | de-DE | sonntag geöffnet | 41 | CITY_SCOPED_DEMAND_CONFIRMED |
| city_opening | fr-FR | ouvert le dimanche | 35 | PATTERN_REAL_BUT_BARELY_CITY_SCOPED |
| city_cuisine and area_cuisine | en-GB | indian restaurants | 205 | VALIDATED_AT_BOTH_CITY_AND_AREA_LEVEL |
| area_category | de-DE | kreuzberg | 157 | VALIDATED_FOR_NAMED_AREAS |
| city_attribute | en-GB | vegan restaurants | 12 | VALIDATED_FOR_LARGE_CITIES_ONLY |
| pulse.bridge-days-subdivision | de-DE | brückentage | 34 | VALIDATED_AT_SUBDIVISION_AND_YEAR |
| tools.schengen-calculator | de-DE | schengen rechner | 1 | NOT_VALIDATED_IN_THIS_MARKET |
| tools.cost-calculator | en-GB | cost of living calculator | 2 | NOT_VALIDATED |
| tools.cost-calculator | de-DE | lebenshaltungskosten vergleich | 4 | WEAK_BUT_THE_SHAPE_IS_A_PAIR |
| INTENT_TRAP | en-GB | cost of living | 52 | WRONG_INTENT_ENTIRELY |
| activities.city-things-to-do | zh-Hant-TW | 景點 | 70 | VALIDATED_IN_LOCAL_LANGUAGE_NOT_BY_TRANSLATION |
| CROSS_LANGUAGE_REACH | zh-Hant-TW | 景點 | 70 | TAIWAN_IS_AN_OUTBOUND_MARKET |

Rules derived from those measurements, applied as gates:

- `city_category`: unchanged, measured in earlier rounds
- `city_cuisine`: city population >= 75,000, because Watford and St Albans carry measured cuisine demand
- `area_cuisine`: named areas only: the place must carry a polygon, population, Wikidata item or Wikipedia article
- `area_category`: same identity requirement as area_cuisine
- `city_attribute`: city population >= 200,000
- `city_opening`: city population >= 200,000 everywhere, relaxed to 75,000 for de-DE where the measurement shows the query reaching Zwickau and Bayreuth
- `area_attribute and area_opening`: the area must carry a Wikidata item or a Wikipedia article, which is a stricter test than for area_category: a modifier page inside an area needs the area itself to be a searched entity

## 8. How to rebuild this

```
# ingest (each is resumable and idempotent)
scripts/atlas/ingest/osm-finish-remaining.sh        # remaining markets, one at a time
scripts/atlas/ingest/osm-overpass-market.py TW TW   # a market with no downloadable extract
scripts/atlas/ingest/wikidata-materialise.py        # 24 classes x 11 countries
scripts/atlas/ingest/holidays-materialise.py        # four holiday providers

# normalise, generate, dedupe, validate
scripts/atlas/scale/run-1m-pipeline.sh
```

Each ingest writes to a temporary name and renames on success, holds a lock so two workers cannot write one file, and drops a marker so a re-run skips finished work. The pipeline reads only files on disk and calls no paid API: the Ahrefs and SERP measurements are recorded and read, never re-bought.

## 9. The honest verdict on one million

164,656 candidates survive the gates. The target is 1,000,000.

The gap is not a shortage of raw rows. It is the gates, and each one was added for a reason that a measurement or a SERP showed:

- An area page needs the area to be a NAMED entity. Requiring a polygon, a population, a Wikidata item or a Wikipedia article cut the usable place set by about two thirds. The Kreuzberg probe validated neighbourhood demand for a famous area and says nothing about an unnamed suburb.
- A POI belongs to exactly one area. Letting every covering extent claim it produced four times as many area pages, and they would have been near-duplicate lists of the same venues on adjacent neighbourhood pages.
- Modifier pages are gated on city size, because every measured keyword for them named a large city.
- An area page needs its parent city page to exist, or it is an orphan by construction.
- Individual entity pages are allowed only where a third party can rank. The SERP for a named hospital, university or station belongs to that institution.

Raising the number to one million from here would mean removing one of those gates. Each one is written down with the measurement behind it so that decision can be made deliberately rather than by accident, and so it can be reversed if a later measurement disagrees. What this pass will not do is reach the number by generating pages the measurements say nobody searches for.


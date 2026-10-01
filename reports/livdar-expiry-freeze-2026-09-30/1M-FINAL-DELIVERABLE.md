# Livdar candidate inventory: the final state of this pass

Built 2026-10-01. Every number below is read from a generated file, not retyped, so this report and the inventory cannot disagree.

## 1. The number

- FINAL DISTINCT VALID CANDIDATES: **233,646**
- target: 1,000,000
- shortfall: **766,354** (23.4 per cent of target)
- rejected and kept visible: 71,396

The target was not reached. The rest of this report is about why, which of the gaps are closable and at what cost, and what was built instead. No row was added to move this number: every gate that fired is listed in section 5 with its count.

## 2. The funnel, stage by stage

| stage | count | what happened |
| --- | --- | --- |
| generated before gates | 0 | every family crossed with every entity it has, in every market scoped to it |
| passed the uniqueness and SERP gate | 0 | a candidate with no uniqueness_reason, or in a SERP archetype measured as closed, is rejected here |
| after exact dedupe | 233,646 | same url_pattern |
| after semantic dedupe | 233,646 | same market, family, template signature and entity |
| FINAL DISTINCT | 233,646 | what is in the manifest |

## 3. Where the candidates are

### By market

| market | candidates |
| --- | --- |
| en-US | 46,802 |
| de-DE | 40,167 |
| en-GB | 38,044 |
| ja-JP | 22,895 |
| fr-FR | 16,017 |
| es-ES | 15,210 |
| it-IT | 14,748 |
| pt-BR | 14,579 |
| pl-PL | 11,904 |
| nl-NL | 9,537 |
| zh-Hant-TW | 3,743 |

### By surface

| surface | candidates |
| --- | --- |
| places | 138,544 |
| areas | 26,819 |
| stay | 25,586 |
| move | 10,627 |
| pulse | 6,936 |
| poi | 6,809 |
| climate | 5,633 |
| tools | 4,097 |
| transport | 3,795 |
| work | 3,681 |
| sport | 578 |
| safety | 541 |

### By readiness

| status | candidates |
| --- | --- |
| POI_AGGREGATION | 150,140 |
| MISSING_DATA | 40,584 |
| BLOCKED_BY_LICENCE | 25,199 |
| NOT_IMPLEMENTED | 9,830 |
| EXPERIMENT_ONLY | 7,054 |
| VALIDATED | 819 |
| PROMISING | 20 |

### By source readiness

| source_status | candidates |
| --- | --- |
| SOURCE_AVAILABLE | 189,644 |
| LICENCE_REQUIRED | 25,199 |
| READY_NOW | 10,902 |
| FEED_REQUIRED | 7,901 |

### By SERP feasibility

| serp_feasibility | candidates |
| --- | --- |
| unsampled_needs_serp_check | 71,986 |
| viable | 66,903 |
| competitive | 51,659 |
| strong_opportunity | 23,267 |
| poor_fit | 19,831 |

### By licence

| licence_status | candidates |
| --- | --- |
| ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED | 144,463 |
| OK | 58,307 |
| LICENCE_REQUIRED | 25,199 |
| CC0_NO_CONDITIONS | 5,677 |

### By demand evidence for the market the page targets

A family proven in other markets but unmeasured in this one scores 30 rather than zero, because one keyword validates a cluster. That is not the same as measured demand, so the distinction is a field rather than something to infer from a score.

| market_demand_evidence | candidates |
| --- | --- |
| shape_measured_2026_10_01 | 150,140 |
| measured_in_this_market | 78,889 |
| family_measured_elsewhere | 4,617 |

### The twenty largest families

| family | candidates |
| --- | --- |
| activities.city-things-to-do | 17,109 |
| places.area-cuisine | 16,927 |
| places.city-cuisine | 12,345 |
| stay.city-type | 11,394 |
| places.area-opening | 9,356 |
| places.area-restaurant | 7,766 |
| stay.near-venue | 6,869 |
| places.area-attribute | 6,197 |
| places.area-fast_food | 5,960 |
| weather.city-month | 5,633 |
| poi.museum-notable | 4,967 |
| places.city-restaurant | 4,909 |
| places.area-pharmacy | 4,795 |
| places.area-cafe | 4,789 |
| places.area-supermarket | 4,442 |
| areas.overview | 4,270 |
| rents.city | 3,596 |
| places.city-fast_food | 3,546 |
| places.city-opening | 3,472 |
| places.area-clinic | 3,371 |

## 4. What was materialised in this pass

- OSM POI files on disk: 15 (poi-BR.jsonl.gz, poi-DE.jsonl.gz, poi-ES.jsonl.gz, poi-FR.jsonl.gz, poi-GB.jsonl.gz, poi-IT.jsonl.gz, poi-JP.jsonl.gz, poi-LU.jsonl.gz, poi-NL.jsonl.gz, poi-PL.jsonl.gz, poi-TW-health.jsonl.gz, poi-US-us-midwest.jsonl.gz, poi-US-us-northeast.jsonl.gz, poi-US-us-south.jsonl.gz, poi-US-us-west.jsonl.gz)
- OSM place files with geometry: 11 (places-FR.jsonl.gz, places-germany.jsonl.gz, places-italy.jsonl.gz, places-luxembourg.jsonl.gz, places-netherlands.jsonl.gz, places-pl_JP.jsonl.gz, places-poland.jsonl.gz, places-spain.jsonl.gz, places-united_kingdom.jsonl.gz, places-us-south.jsonl.gz, places-us-west.jsonl.gz)
- POI read: 5,012,699, of which 1,570,728 carried an addr:city tag and 2,126,307 were attributed spatially against the 31,715-city gazetteer; 1,314,927 fell outside every city radius and were dropped
- named places loaded: 431,150, of which 42,511 passed the entity gates
- POI assigned to an area by polygon containment: 348,588; by documented proximity to a place node: 1,265,443
- aggregation candidates: 144,820 ({'city_category': 35157, 'area_category': 51091, 'city_cuisine': 12406, 'area_cuisine': 16929, 'city_attribute': 2694, 'area_attribute': 6197, 'city_opening': 3472, 'area_opening': 9358, 'city_sport': 123, 'area_parent': 4271, 'city_areas_hub': 519, 'notable_entity': 2603})
- Wikidata entities loaded: 95,553, candidates 5,909, deduped against OSM by {'qid': 9143, 'name_and_position': 3180}
- Pulse entities normalised from four providers: {'national': 1081, 'regional': 623, 'school': 1502, 'long_weekends': 687, 'bridge_days': 233, 'long_weekends_subdivision': 3539, 'bridge_days_subdivision': 1052, 'bridge_plans': 348}

## 5. Every gate that fired, with its count

Nothing is hidden. A candidate rejected here is in LIVDAR-1M-REJECTED-CANDIDATES.csv.gz with its reason.

### Aggregation gates

| gate | rejected |
| --- | --- |
| entity_not_notable | 5,001,502 |
| place_not_a_named_entity | 245,397 |
| below_min_count | 210,619 |
| class_not_a_list_intent | 154,302 |
| cuisine_below_min_count | 142,406 |
| place_no_parent_city | 140,462 |
| area_cuisine_below_min_count | 97,211 |
| area_class_not_a_list_intent | 85,793 |
| opening_below_min_count | 73,129 |
| attr_below_min_count | 62,293 |
| area_below_min_count | 58,519 |
| area_parent_city_page_not_accepted | 57,877 |
| area_opening_below_min_count | 44,882 |
| area_attr_below_min_count | 37,079 |
| entries_too_thin | 20,096 |
| opening_city_below_measured_demand_floor | 11,980 |
| area_parent_too_narrow | 10,629 |
| area_entries_too_thin | 9,941 |
| cuisine_city_below_measured_demand_floor | 9,321 |
| area_opening_parent_page_not_accepted | 7,884 |
| notable_but_data_thin | 6,464 |
| area_cuisine_parent_page_not_accepted | 6,180 |
| attr_city_below_measured_demand_floor | 5,895 |
| sport_below_min_count | 5,481 |
| area_attr_parent_page_not_accepted | 4,197 |
| notable_entity_has_no_parent_page | 2,110 |
| place_name_not_usable | 1,957 |
| area_duplicates_city_list | 1,591 |
| area_parent_city_has_no_areas_hub | 1,429 |
| no_market_for_country | 1,315 |
| area_opening_area_not_a_searched_entity | 1,101 |
| place_ambiguous_duplicate_name_in_city | 756 |
| cuisine_parent_restaurant_list_not_accepted | 739 |
| area_attr_area_not_a_searched_entity | 601 |
| area_cuisine_duplicates_city_list | 590 |
| cuisine_entries_too_thin | 444 |
| area_opening_parent_area_page_not_accepted | 167 |
| attr_parent_city_page_not_accepted | 155 |
| area_opening_duplicates_city_list | 146 |
| opening_parent_city_page_not_accepted | 119 |
| area_attr_parent_area_page_not_accepted | 82 |
| place_no_market_for_country | 65 |
| area_attr_duplicates_city_list | 52 |
| sport_parent_city_page_not_accepted | 45 |
| attr_not_discriminating | 15 |
| opening_not_discriminating | 4 |
| place_polygon_degenerate | 2 |

### Wikidata gates

| gate | rejected |
| --- | --- |
| no_parent_city | 30,146 |
| no_official_website_so_page_would_be_thin | 18,513 |
| already_in_osm_corpus | 12,323 |
| list_below_min_count | 7,483 |
| wikidata_duplicate_qid | 5,701 |
| no_parent_page_exists_on_the_site | 5,073 |
| list_entries_too_thin | 486 |

### Manifest gates

| gate | rejected |
| --- | --- |
| REJECTED_QUALITY: no defensible uniqueness basis | 59,516 |
| REJECTED_SERP: None is not winnable | 11,880 |

## 6. QA at scale

- rows checked: 233,646, distinct URLs 233,646

| check | count |
| --- | --- |
| title_over_65_chars | 131,018 |
| meta_over_165_chars | 2,006 |
| long_dash_in_source_name_or_derived_text | 47 |
| title_under_15_chars | 363 |
| duplicate_title_exact | 3,487 |
| duplicate_title_same_tokens | 3,530 |
| superlative_from_the_family_own_intent | 20 |
| uniqueness_reason_shared_with_another_candidate | 22 |
| templates_with_repeated_entities | 0 |
| orphan_pages | 45 |

- title length: min 12, max 192, mean 62.1

- stated limitation: the simulated title, meta and H1 skeletons are English. The gate catches structural collisions, which do not depend on the connecting words, but a localised title set still has to be written per market before publication and is NOT done by this script.

## 7. The demand and SERP measurements behind the new shapes

13 probes, 9,906 Ahrefs units. Method: keyword-only select with a volume floor, so each row costs 11 units rather than 22. The question asked of each probe was not 'does this pattern have demand' but 'does the demand carry the MODIFIER the shape needs' - a city name, a neighbourhood name, a cuisine, an attribute. A pattern with large national volume and no city-scoped variants cannot support one page per city.

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

233,646 candidates survive the gates. The target is 1,000,000.

The gap is not a shortage of raw rows. It is the gates, and each one was added for a reason that a measurement or a SERP showed:

- An area page needs the area to be a NAMED entity. Requiring a polygon, a population, a Wikidata item or a Wikipedia article cut the usable place set by about two thirds. The Kreuzberg probe validated neighbourhood demand for a famous area and says nothing about an unnamed suburb.
- A POI belongs to exactly one area. Letting every covering extent claim it produced four times as many area pages, and they would have been near-duplicate lists of the same venues on adjacent neighbourhood pages.
- Modifier pages are gated on city size, because every measured keyword for them named a large city.
- An area page needs its parent city page to exist, or it is an orphan by construction.
- Individual entity pages are allowed only where a third party can rank. The SERP for a named hospital, university or station belongs to that institution.

Raising the number to one million from here would mean removing one of those gates. Each one is written down with the measurement behind it so that decision can be made deliberately rather than by accident, and so it can be reversed if a later measurement disagrees. What this pass will not do is reach the number by generating pages the measurements say nobody searches for.


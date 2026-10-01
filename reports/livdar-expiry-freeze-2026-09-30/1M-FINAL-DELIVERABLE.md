# Livdar candidate inventory: the final state of this pass

Built 2026-10-01. Every number below is read from a generated file, not retyped, so this report and the inventory cannot disagree.

## 1. The number

- FINAL DISTINCT VALID CANDIDATES: **208,876**
- target: 1,000,000
- shortfall: **791,124** (20.9 per cent of target)
- rejected and kept visible: 117,732

The target was not reached. The rest of this report is about why, which of the gaps are closable and at what cost, and what was built instead. No row was added to move this number: every gate that fired is listed in section 5 with its count.

## 2. The funnel, stage by stage

| stage | count | what happened |
| --- | --- | --- |
| generated before gates | 0 | every family crossed with every entity it has, in every market scoped to it |
| passed the uniqueness and SERP gate | 0 | a candidate with no uniqueness_reason, or in a SERP archetype measured as closed, is rejected here |
| after exact dedupe | 255,056 | same url_pattern |
| after semantic dedupe | 255,054 | same market, family, template signature and entity |
| FINAL DISTINCT | 208,876 | what is in the manifest |

## 3. Where the candidates are

### By market

| market | candidates |
| --- | --- |
| en-US | 49,231 |
| de-DE | 28,887 |
| ja-JP | 25,181 |
| en-GB | 23,880 |
| fr-FR | 15,456 |
| pt-BR | 15,301 |
| es-ES | 14,954 |
| it-IT | 14,404 |
| pl-PL | 11,545 |
| nl-NL | 9,240 |
| zh-Hant-TW | 797 |

### By surface

| surface | candidates |
| --- | --- |
| places | 142,465 |
| areas | 14,519 |
| stay | 14,471 |
| move | 11,725 |
| pulse | 7,064 |
| poi | 6,966 |
| work | 3,755 |
| climate | 3,205 |
| transport | 2,941 |
| tools | 634 |
| sport | 584 |
| safety | 547 |

### By readiness

| status | candidates |
| --- | --- |
| POI_AGGREGATION | 154,230 |
| MISSING_DATA | 29,787 |
| BLOCKED_BY_LICENCE | 14,073 |
| NOT_IMPLEMENTED | 6,082 |
| EXPERIMENT_ONLY | 4,634 |
| VALIDATED | 50 |
| PROMISING | 20 |

### By source readiness

| source_status | candidates |
| --- | --- |
| SOURCE_AVAILABLE | 182,877 |
| LICENCE_REQUIRED | 14,073 |
| FEED_REQUIRED | 8,046 |
| READY_NOW | 3,880 |

### By SERP feasibility

| serp_feasibility | candidates |
| --- | --- |
| viable | 70,134 |
| unsampled_needs_serp_check | 55,537 |
| competitive | 51,284 |
| poor_fit | 20,662 |
| strong_opportunity | 11,259 |

### By licence

| licence_status | candidates |
| --- | --- |
| ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED | 148,447 |
| OK | 40,573 |
| LICENCE_REQUIRED | 14,073 |
| CC0_NO_CONDITIONS | 5,783 |

### By demand evidence for the market the page targets

A family proven in other markets but unmeasured in this one scores 30 rather than zero, because one keyword validates a cluster. That is not the same as measured demand, so the distinction is a field rather than something to infer from a score.

| market_demand_evidence | candidates |
| --- | --- |
| shape_measured_2026_10_01 | 154,230 |
| measured_in_this_market | 49,950 |
| family_measured_elsewhere | 4,696 |

### The twenty largest families

| family | candidates |
| --- | --- |
| places.area-cuisine | 17,690 |
| places.city-cuisine | 13,263 |
| places.area-opening | 9,653 |
| places.area-restaurant | 8,012 |
| places.area-attribute | 6,357 |
| places.area-fast_food | 6,125 |
| poi.museum-notable | 5,001 |
| activities.city-things-to-do | 4,979 |
| places.area-pharmacy | 4,964 |
| places.area-cafe | 4,912 |
| stay.near-venue | 4,805 |
| places.city-restaurant | 4,638 |
| places.area-supermarket | 4,562 |
| areas.overview | 4,279 |
| places.city-opening | 3,753 |
| rents.city | 3,665 |
| places.city-fast_food | 3,615 |
| places.area-clinic | 3,494 |
| events.city-type | 3,240 |
| events.city-calendar | 3,240 |

## 3b. The multilingual breakdown

A second language is not free inventory. Every row whose language is not the language of the country it describes has to show its own reason to exist, and the default answer is no. The table below separates what each market kept from what it was refused and why.

| market | raw candidates | final valid | no uniqueness basis | closed SERP | translation only | local intent missing | demand not for this destination | local data missing | other |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| en-US | 57,944 | 49,231 | 7,538 | 881 | 0 | 0 | 247 | 0 | 47 |
| en-GB | 52,714 | 23,880 | 9,881 | 3,916 | 0 | 0 | 15,035 | 0 | 2 |
| de-DE | 51,378 | 28,887 | 6,474 | 3,386 | 0 | 1 | 12,580 | 0 | 50 |
| ja-JP | 31,600 | 25,181 | 4,489 | 1,108 | 0 | 1 | 548 | 248 | 25 |
| zh-Hant-TW | 4,709 | 797 | 690 | 80 | 0 | 1 | 3,140 | 0 | 1 |
| it-IT | 23,167 | 14,404 | 4,643 | 266 | 0 | 1 | 3,838 | 0 | 15 |
| es-ES | 23,825 | 14,954 | 4,735 | 300 | 0 | 1 | 3,823 | 0 | 12 |
| fr-FR | 25,476 | 15,456 | 5,894 | 286 | 0 | 1 | 3,587 | 248 | 4 |
| nl-NL | 14,867 | 9,240 | 4,716 | 114 | 0 | 1 | 796 | 0 | 0 |
| pl-PL | 17,228 | 11,545 | 4,669 | 202 | 0 | 1 | 796 | 0 | 15 |
| pt-BR | 23,700 | 15,301 | 5,793 | 1,354 | 0 | 1 | 1,238 | 0 | 13 |
| **all 11** | **326,608** | **208,876** | | | | | | | |

Romanian is absent from the table on purpose. No Romanian Atlas page was added in this pass, as instructed.

### Localisation class of every row that survived

| localization_class | candidates |
| --- | --- |
| NATIVE_LOCALE | 208,653 |
| VALID_LOCALIZATION | 223 |

- flagged LOCAL_SERP_UNVERIFIED: 55,537. These are kept, not rejected. Absence of SERP evidence is not evidence of a poor fit, and treating it as one already mislabelled 62 per cent of this inventory once.

### Top families per market

| market | strongest families |
| --- | --- |
| en-US | places.city-cuisine (5,019), places.area-cuisine (4,652), places.area-attribute (2,866), places.area-opening (2,583) |
| en-GB | activities.city-things-to-do (3,476), stay.near-venue (2,588), places.area-cuisine (2,038), places.city-cuisine (1,285) |
| de-DE | places.area-attribute (2,673), places.area-opening (2,386), places.area-cuisine (1,602), places.area-restaurant (1,158) |
| ja-JP | places.area-cuisine (3,311), places.city-cuisine (1,814), places.area-opening (1,082), places.area-restaurant (983) |
| zh-Hant-TW | activities.city-things-to-do (51), places.city-category (40), weather.city-month (40), health.city (40) |
| it-IT | places.area-cuisine (1,429), places.area-restaurant (812), poi.museum-notable (796), places.city-cuisine (658) |
| es-ES | places.area-cuisine (1,222), places.area-restaurant (957), places.city-cuisine (791), places.area-supermarket (740) |
| fr-FR | places.area-cuisine (1,581), places.city-cuisine (1,156), places.area-restaurant (499), places.area-opening (482) |
| nl-NL | places.area-cuisine (594), places.area-supermarket (504), places.city-cuisine (498), places.area-fast_food (449) |
| pl-PL | places.area-cuisine (841), places.area-pharmacy (602), places.area-attribute (569), places.area-opening (561) |
| pt-BR | cost-of-living.city (677), relocation.city (677), weather.city-month (677), rents.city (677) |

### Where the measured demand actually is, per market

The strongest local keyword measured for each market, in that market own language. These are the roots the localisation gate reads, and in every non-English market the winning root is a word an English page does not contain, which is the difference between a localisation and a translation.

| market | strongest measured local root | monthly volume | what makes it local |
| --- | --- | --- | --- |
| fr-FR | salaire brut net | 258,000 | the brut to net conversion as the noun; French users do not search a net salary calculator |
| es-ES | calculadora sueldo neto | 91,000 | year-stamped variants carry their own demand because the IRPEF tramos change annually |
| pt-BR | calculo salario liquido | 68,000 | at difficulty 1, against 213,000 traffic potential |
| ja-JP | tedori keisan | 43,000 | take-home, with bonus take-home a separate utility at 10,000 because Japanese pay includes large semi-annual bonuses |
| it-IT | calcolo stipendio netto | 42,000 | at difficulty 12, with RAL-anchored and CCNL contract-level queries beneath it that exist in no other market |
| de-DE | kreditrechner | measured by keyword count, see the measurement file | 34 keywords at or above 500, notably the neutral and ohne anmeldung variants: users looking for a calculator that is not a bank |
| nl-NL | hypotheek berekenen | measured by keyword count, see the measurement file | 60 keywords at or above 300 that are seven-plus different formulas, not phrasings |
| pl-PL | o ile wzrosnie rata | measured by keyword count, see the measurement file | a rate-change calculator that exists because Polish mortgages are variable rate; no English page would have found it |
| zh-Hant-TW | fang dai shi suan | 17,000 | at difficulty 16, with the New Youth Housing government scheme beneath it and amounts counted in units of ten thousand |
| en-GB | things to do in krakow | 11,000 | the English markets were measured searching globally, not only Europe |
| en-US | things to do in nashville | measured by keyword count, see the measurement file | same measurement set as en-GB |

Transliterations are used above for the Japanese and Chinese roots so this table renders in any terminal; the measurement files carry the original script.

## 4. What was materialised in this pass

- OSM POI files on disk: 15 (poi-BR.jsonl.gz, poi-DE.jsonl.gz, poi-ES.jsonl.gz, poi-FR.jsonl.gz, poi-GB.jsonl.gz, poi-IT.jsonl.gz, poi-JP.jsonl.gz, poi-LU.jsonl.gz, poi-NL.jsonl.gz, poi-PL.jsonl.gz, poi-TW-health.jsonl.gz, poi-US-us-midwest.jsonl.gz, poi-US-us-northeast.jsonl.gz, poi-US-us-south.jsonl.gz, poi-US-us-west.jsonl.gz)
- OSM place files with geometry: 11 (places-FR.jsonl.gz, places-germany.jsonl.gz, places-italy.jsonl.gz, places-luxembourg.jsonl.gz, places-netherlands.jsonl.gz, places-pl_JP.jsonl.gz, places-poland.jsonl.gz, places-spain.jsonl.gz, places-united_kingdom.jsonl.gz, places-us-south.jsonl.gz, places-us-west.jsonl.gz)
- POI read: 5,012,699, of which 991,532 carried an addr:city tag and 2,355,190 were attributed spatially against the 31,715-city gazetteer; 1,665,240 fell outside every city radius and were dropped
- named places loaded: 431,150, of which 42,720 passed the entity gates
- POI assigned to an area by polygon containment: 348,742; by documented proximity to a place node: 1,270,357
- aggregation candidates: 148,449 ({'city_category': 34249, 'area_category': 53118, 'city_cuisine': 13263, 'area_cuisine': 17690, 'city_attribute': 2777, 'area_attribute': 6357, 'city_opening': 3753, 'area_opening': 9653, 'city_sport': 133, 'area_parent': 4279, 'city_areas_hub': 520, 'notable_entity': 2657})
- Wikidata entities loaded: 106,049, candidates 6,012, deduped against OSM by {'qid': 9207, 'name_and_position': 3294}
- Pulse entities normalised from four providers: {'national': 1081, 'regional': 623, 'school': 1502, 'long_weekends': 687, 'bridge_days': 233, 'long_weekends_subdivision': 3539, 'bridge_days_subdivision': 1052, 'bridge_plans': 348}

## 5. Every gate that fired, with its count

Nothing is hidden. A candidate rejected here is in LIVDAR-1M-REJECTED-CANDIDATES.csv.gz with its reason.

### Aggregation gates

| gate | rejected |
| --- | --- |
| entity_not_notable | 5,003,128 |
| place_not_a_named_entity | 246,408 |
| place_no_parent_city | 139,224 |
| area_cuisine_below_min_count | 97,842 |
| below_min_count | 96,344 |
| cuisine_below_min_count | 95,291 |
| area_class_not_a_list_intent | 86,041 |
| class_not_a_list_intent | 79,175 |
| area_below_min_count | 61,641 |
| area_parent_city_page_not_accepted | 52,811 |
| area_opening_below_min_count | 45,132 |
| attr_below_min_count | 39,263 |
| opening_below_min_count | 37,873 |
| area_attr_below_min_count | 37,500 |
| entries_too_thin | 18,937 |
| opening_city_below_measured_demand_floor | 11,046 |
| area_entries_too_thin | 10,672 |
| area_parent_too_narrow | 10,667 |
| cuisine_city_below_measured_demand_floor | 8,578 |
| area_opening_parent_page_not_accepted | 7,733 |
| notable_but_data_thin | 6,042 |
| area_cuisine_parent_page_not_accepted | 5,628 |
| attr_city_below_measured_demand_floor | 5,588 |
| sport_below_min_count | 4,903 |
| area_attr_parent_page_not_accepted | 4,171 |
| place_name_not_usable | 1,957 |
| area_parent_city_has_no_areas_hub | 1,454 |
| area_duplicates_city_list | 1,393 |
| area_opening_area_not_a_searched_entity | 1,121 |
| notable_entity_has_no_parent_page | 859 |
| place_ambiguous_duplicate_name_in_city | 773 |
| area_attr_area_not_a_searched_entity | 605 |
| area_cuisine_duplicates_city_list | 483 |
| cuisine_parent_restaurant_list_not_accepted | 449 |
| cuisine_entries_too_thin | 428 |
| no_market_for_country | 247 |
| attr_parent_city_page_not_accepted | 161 |
| area_opening_parent_area_page_not_accepted | 146 |
| opening_parent_city_page_not_accepted | 100 |
| area_opening_duplicates_city_list | 97 |
| area_attr_parent_area_page_not_accepted | 72 |
| place_no_market_for_country | 65 |
| sport_parent_city_page_not_accepted | 44 |
| area_attr_duplicates_city_list | 22 |
| attr_not_discriminating | 20 |
| opening_not_discriminating | 4 |
| place_polygon_degenerate | 3 |

### Wikidata gates

| gate | rejected |
| --- | --- |
| no_parent_city | 36,042 |
| no_official_website_so_page_would_be_thin | 22,430 |
| already_in_osm_corpus | 12,501 |
| list_below_min_count | 7,483 |
| wikidata_duplicate_qid | 5,857 |
| no_parent_page_exists_on_the_site | 5,323 |
| list_entries_too_thin | 485 |

### Manifest gates

| gate | rejected |
| --- | --- |
| REJECTED_QUALITY: no defensible uniqueness basis | 59,522 |
| localization:LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION | 45,628 |
| REJECTED_SERP: SERP_FEATURE_SUPPRESSED is a measured closed SERP, not winnable | 8,722 |
| REJECTED_SERP: AGGREGATOR_LOCKED is a measured closed SERP, not winnable | 3,171 |
| localization:LOCAL_DATA_MISSING | 496 |
| localization:LOCAL_INTENT_MISSING | 9 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-porto-alegre-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-são-paulo-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-fortaleza-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-recife-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-salvador-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity DE-munich-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity FR-lyon-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity IT-milan-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-sapporo-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-nagano-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-yokohama-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-okayama-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-hirosaki-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-fujisawa-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-kurashiki-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-fukuoka-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-amagasaki-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-hakodate-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-machida-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-nagoya-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-wakayama-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-kasugai-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-matsudo-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-tokyo-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-ōita-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-himeji-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity PL-poznań-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity PL-katowice-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity TW-taipei-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-birmingham-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-manchester-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-omaha-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-plano-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-nashville-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-philadelphia-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-atlanta-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-houston-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-dayton-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-portsmouth-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-cincinnati-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-indianapolis-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-fort-wayne-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-the-bronx-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-los-angeles-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-new-york-city-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-denver-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-phoenix-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-taunton-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-minneapolis-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-wichita-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-albuquerque-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-orlando-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-karlsruhe-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-freiburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-berlin-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-stuttgart-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-köln-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-hamburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-schweinfurt-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-bonn-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-erfurt-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-hannover-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-munich-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-mainz-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-braunschweig-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-dortmund-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-würzburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-konstanz-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-flensburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-bochum-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-rostock-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-magdeburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-halle-saale-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-jena-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-nuremberg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-wiesbaden-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-bielefeld-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-göttingen-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-tübingen-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-darmstadt-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-kassel-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-bremen-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-mannheim-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-ingolstadt-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-frankfurt-am-main-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-königswinter-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-münster-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-kiel-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-sankt-augustin-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-düsseldorf-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-essen-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-bamberg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-heilbronn-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-regensburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-augsburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-aschaffenburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-trier-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-esslingen-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-neustadt-an-der-weinstraße-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-santander-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-albacete-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-palma-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-chamartín-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-santiago-de-compostela-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-donostia-san-sebastián-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-mislata-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-ciudad-lineal-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-pozuelo-de-alarcón-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-castelló-de-la-plana-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-a-coruña-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity FR-paris-05-panthéon-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity FR-toulouse-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-glasgow-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-edinburgh-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-turin-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-milan-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-ravenna-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-bologna-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-perugia-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-pordenone-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-catania-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-bergamo-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-cosenza-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-trieste-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-brescia-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity JP-minato-city-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-kraków-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-poznań-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-lublin-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-białystok-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-gdańsk-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-warsaw-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-toruń-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-chicago-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-philadelphia-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-new-york-city-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-phoenix-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-cambridge-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-indianapolis-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-pittsburgh-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-los-angeles-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-providence-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-the-bronx-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-shopping_mall for entity GB-reading-x-shopping_mall, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-shopping_mall for entity GB-manchester-x-shopping_mall, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-stadium for entity GB-birmingham-x-stadium, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-recife-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-são-paulo-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-belo-horizonte-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-porto-alegre-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-fortaleza-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-teresina-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-manaus-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-campos-dos-goytacazes-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity DE-frankfurt-am-main-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity DE-berlin-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity ES-chamartín-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity FR-toulouse-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity IT-turin-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity IT-milan-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity IT-verona-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity JP-sapporo-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity JP-tokyo-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity JP-machida-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity JP-hiroshima-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity JP-nagoya-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity JP-ebetsu-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity PL-łódź-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity PL-śródmieście-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity PL-poznań-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity PL-kraków-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity PL-katowice-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity PL-toruń-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-houston-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-wichita-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-new-york-city-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity GB-manchester-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-chicago-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-colorado-springs-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-indianapolis-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-pittsburgh-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity GB-cambridge-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-phoenix-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-raleigh-x-university, so the two would be the same page | 1 |

## 6. QA at scale

- rows checked: 208,876, distinct URLs 208,876

| check | count |
| --- | --- |
| title_over_65_chars | 135,821 |
| meta_over_165_chars | 3,225 |
| title_under_15_chars | 4 |
| duplicate_title_exact | 1,279 |
| duplicate_title_same_tokens | 1,288 |
| superlative_from_the_family_own_intent | 20 |
| uniqueness_reason_shared_with_another_candidate | 133 |
| templates_with_repeated_entities | 0 |
| orphan_pages | 142 |
| top_level_pages_whose_parent_is_the_locale_home | 0 |
| intent_owners_claimed_by_more_than_one_url | 0 |
| urls_sharing_a_cannibalization_key | 0 |
| locale_mismatch_between_url_and_row | 0 |
| entity_names_needing_a_disambiguator_in_the_title | 1,067 |
| same_entity_id_under_two_names | 0 |
| candidates_with_no_usable_source | 0 |
| kept_rows_with_a_rejecting_localisation_class | 0 |
| family_locale_cells_failing_the_usefulness_test | 0 |

- A per-page target query is not recorded in the manifest, so a query-level competition test cannot be run from it. The three keyword fields it does carry are family-level: they name the measurement that proved the family in a market, not the page target.

- title length: min 13, max 192, mean 67.3

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

208,876 candidates survive the gates. The target is 1,000,000.

The gap is not a shortage of raw rows. It is the gates, and each one was added for a reason that a measurement or a SERP showed:

- An area page needs the area to be a NAMED entity. Requiring a polygon, a population, a Wikidata item or a Wikipedia article cut the usable place set by about two thirds. The Kreuzberg probe validated neighbourhood demand for a famous area and says nothing about an unnamed suburb.
- A POI belongs to exactly one area. Letting every covering extent claim it produced four times as many area pages, and they would have been near-duplicate lists of the same venues on adjacent neighbourhood pages.
- Modifier pages are gated on city size, because every measured keyword for them named a large city.
- An area page needs its parent city page to exist, or it is an orphan by construction.
- Individual entity pages are allowed only where a third party can rank. The SERP for a named hospital, university or station belongs to that institution.

Raising the number to one million from here would mean removing one of those gates. Each one is written down with the measurement behind it so that decision can be made deliberately rather than by accident, and so it can be reversed if a later measurement disagrees. What this pass will not do is reach the number by generating pages the measurements say nobody searches for.


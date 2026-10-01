# Livdar candidate inventory: the final state of this pass

Built 2026-10-01. Every number below is read from a generated file, not retyped, so this report and the inventory cannot disagree.

## 1. The number

- FINAL DISTINCT VALID CANDIDATES: **204,767**
- target: 1,000,000
- shortfall: **795,233** (20.5 per cent of target)
- rejected and kept visible: 118,259

The target was not reached. The rest of this report is about why, which of the gaps are closable and at what cost, and what was built instead. No row was added to move this number: every gate that fired is listed in section 5 with its count.

## 2. The funnel, stage by stage

| stage | count | what happened |
| --- | --- | --- |
| generated before gates | 0 | every family crossed with every entity it has, in every market scoped to it |
| passed the uniqueness and SERP gate | 0 | a candidate with no uniqueness_reason, or in a SERP archetype measured as closed, is rejected here |
| after exact dedupe | 250,863 | same url_pattern |
| after semantic dedupe | 250,863 | same market, family, template signature and entity |
| FINAL DISTINCT | 204,767 | what is in the manifest |

## 3. Where the candidates are

### By market

| market | candidates |
| --- | --- |
| en-US | 48,690 |
| de-DE | 28,390 |
| en-GB | 23,649 |
| ja-JP | 23,404 |
| fr-FR | 15,517 |
| pt-BR | 15,225 |
| es-ES | 14,728 |
| it-IT | 14,234 |
| pl-PL | 11,313 |
| nl-NL | 8,855 |
| zh-Hant-TW | 762 |

### By surface

| surface | candidates |
| --- | --- |
| places | 138,544 |
| areas | 14,503 |
| stay | 14,353 |
| move | 11,725 |
| pulse | 7,064 |
| poi | 6,912 |
| work | 3,755 |
| climate | 3,205 |
| transport | 2,941 |
| tools | 634 |
| sport | 584 |
| safety | 547 |

### By readiness

| status | candidates |
| --- | --- |
| POI_AGGREGATION | 150,243 |
| MISSING_DATA | 29,785 |
| BLOCKED_BY_LICENCE | 13,957 |
| NOT_IMPLEMENTED | 6,080 |
| EXPERIMENT_ONLY | 4,632 |
| VALIDATED | 50 |
| PROMISING | 20 |

### By source readiness

| source_status | candidates |
| --- | --- |
| SOURCE_AVAILABLE | 178,886 |
| LICENCE_REQUIRED | 13,957 |
| FEED_REQUIRED | 8,044 |
| READY_NOW | 3,880 |

### By SERP feasibility

| serp_feasibility | candidates |
| --- | --- |
| viable | 66,903 |
| unsampled_needs_serp_check | 54,875 |
| competitive | 51,831 |
| poor_fit | 19,899 |
| strong_opportunity | 11,259 |

### By licence

| licence_status | candidates |
| --- | --- |
| ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED | 144,463 |
| OK | 40,567 |
| LICENCE_REQUIRED | 13,957 |
| CC0_NO_CONDITIONS | 5,780 |

### By demand evidence for the market the page targets

A family proven in other markets but unmeasured in this one scores 30 rather than zero, because one keyword validates a cluster. That is not the same as measured demand, so the distinction is a field rather than something to infer from a score.

| market_demand_evidence | candidates |
| --- | --- |
| shape_measured_2026_10_01 | 150,243 |
| measured_in_this_market | 49,828 |
| family_measured_elsewhere | 4,696 |

### The twenty largest families

| family | candidates |
| --- | --- |
| places.area-cuisine | 16,927 |
| places.city-cuisine | 12,345 |
| places.area-opening | 9,356 |
| places.area-restaurant | 7,766 |
| places.area-attribute | 6,197 |
| places.area-fast_food | 5,960 |
| activities.city-things-to-do | 4,979 |
| poi.museum-notable | 4,967 |
| places.city-restaurant | 4,909 |
| places.area-pharmacy | 4,795 |
| places.area-cafe | 4,789 |
| stay.near-venue | 4,689 |
| places.area-supermarket | 4,442 |
| areas.overview | 4,270 |
| rents.city | 3,665 |
| places.city-fast_food | 3,546 |
| places.city-opening | 3,472 |
| places.area-clinic | 3,371 |
| events.city-type | 3,240 |
| events.city-calendar | 3,240 |

## 3b. The multilingual breakdown

A second language is not free inventory. Every row whose language is not the language of the country it describes has to show its own reason to exist, and the default answer is no. The table below separates what each market kept from what it was refused and why.

| market | raw candidates | final valid | no uniqueness basis | closed SERP | translation only | local intent missing | demand not for this destination | local data missing | other |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| en-US | 57,750 | 48,690 | 7,538 | 881 | 0 | 0 | 247 | 0 | 394 |
| en-GB | 52,578 | 23,649 | 9,881 | 3,916 | 0 | 0 | 14,998 | 0 | 134 |
| de-DE | 50,895 | 28,390 | 6,474 | 3,386 | 0 | 1 | 12,580 | 0 | 64 |
| ja-JP | 29,825 | 23,404 | 4,489 | 1,108 | 0 | 1 | 548 | 248 | 27 |
| zh-Hant-TW | 4,673 | 762 | 690 | 80 | 0 | 1 | 3,140 | 0 | 0 |
| it-IT | 23,007 | 14,234 | 4,643 | 266 | 0 | 1 | 3,838 | 0 | 25 |
| es-ES | 23,628 | 14,728 | 4,735 | 300 | 0 | 1 | 3,823 | 0 | 41 |
| fr-FR | 25,556 | 15,517 | 5,894 | 286 | 0 | 1 | 3,587 | 248 | 23 |
| nl-NL | 14,487 | 8,855 | 4,716 | 114 | 0 | 1 | 796 | 0 | 5 |
| pl-PL | 17,000 | 11,313 | 4,669 | 202 | 0 | 1 | 796 | 0 | 19 |
| pt-BR | 23,627 | 15,225 | 5,793 | 1,354 | 0 | 1 | 1,238 | 0 | 16 |
| **all 11** | **323,026** | **204,767** | | | | | | | |

Romanian is absent from the table on purpose. No Romanian Atlas page was added in this pass, as instructed.

### Localisation class of every row that survived

| localization_class | candidates |
| --- | --- |
| NATIVE_LOCALE | 204,544 |
| VALID_LOCALIZATION | 223 |

- flagged LOCAL_SERP_UNVERIFIED: 54,875. These are kept, not rejected. Absence of SERP evidence is not evidence of a poor fit, and treating it as one already mislabelled 62 per cent of this inventory once.

### Top families per market

| market | strongest families |
| --- | --- |
| en-US | places.city-cuisine (5,005), places.area-cuisine (4,575), places.area-attribute (2,790), places.area-opening (2,493) |
| en-GB | activities.city-things-to-do (3,476), stay.near-venue (2,509), places.area-cuisine (2,002), places.city-cuisine (1,223) |
| de-DE | places.area-attribute (2,620), places.area-opening (2,359), places.area-cuisine (1,555), places.area-restaurant (1,123) |
| ja-JP | places.area-cuisine (2,911), places.city-cuisine (1,316), places.area-opening (969), places.area-restaurant (902) |
| zh-Hant-TW | activities.city-things-to-do (51), places.city-category (40), weather.city-month (40), health.city (40) |
| it-IT | places.area-cuisine (1,389), places.area-restaurant (807), poi.museum-notable (804), places.area-opening (611) |
| es-ES | places.area-cuisine (1,202), places.area-restaurant (944), places.city-cuisine (752), places.area-supermarket (727) |
| fr-FR | places.area-cuisine (1,574), places.city-cuisine (1,131), places.city-restaurant (508), places.area-restaurant (498) |
| nl-NL | places.area-cuisine (529), places.area-supermarket (478), places.area-fast_food (437), places.city-cuisine (423) |
| pl-PL | places.area-cuisine (790), places.area-pharmacy (599), places.area-opening (560), places.area-attribute (551) |
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
- POI read: 5,012,699, of which 1,570,728 carried an addr:city tag and 2,126,307 were attributed spatially against the 31,715-city gazetteer; 1,314,927 fell outside every city radius and were dropped
- named places loaded: 431,150, of which 42,511 passed the entity gates
- POI assigned to an area by polygon containment: 348,588; by documented proximity to a place node: 1,265,443
- aggregation candidates: 144,820 ({'city_category': 35157, 'area_category': 51091, 'city_cuisine': 12406, 'area_cuisine': 16929, 'city_attribute': 2694, 'area_attribute': 6197, 'city_opening': 3472, 'area_opening': 9358, 'city_sport': 123, 'area_parent': 4271, 'city_areas_hub': 519, 'notable_entity': 2603})
- Wikidata entities loaded: 106,049, candidates 6,012, deduped against OSM by {'qid': 9207, 'name_and_position': 3294}
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
| localization:LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION | 45,591 |
| REJECTED_SERP: SERP_FEATURE_SUPPRESSED is a measured closed SERP, not winnable | 8,722 |
| REJECTED_SERP: AGGREGATOR_LOCKED is a measured closed SERP, not winnable | 3,171 |
| localization:LOCAL_DATA_MISSING | 496 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q383557, so the two would be the same page | 15 |
| localization:LOCAL_INTENT_MISSING | 9 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q2384543, so the two would be the same page | 8 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7596264, so the two would be the same page | 6 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q6815420, so the two would be the same page | 5 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q57262026, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q2237396, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q1486345, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q118948224, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q5848200, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-cambridge-x-library, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q9164294, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q436079, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q317912, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q1273291, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q519613, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q435604, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q98902636, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q1590621, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q49478389, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q124831589, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q885336, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q2082239, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q884191, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q2327241, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q436334, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q124799891, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q14912298, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q56290060, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q2343868, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q570949, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q11662291, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q76161116, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q2336130, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q1856079, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q1594708, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q2390739, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q598070, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q4737442, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q5123443, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity GB-manchester-x-university, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by places.neighbourhood-category for entity 12808662, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.neighbourhood-category for entity 4560691, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by rents.neighbourhood for entity 12808662, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by rents.neighbourhood for entity 4560691, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by neighbourhoods.guide for entity 12808662, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by neighbourhoods.guide for entity 4560691, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q2894736, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q5211810, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q16893455, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q4416300, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q3453774, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7968482, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q1052807, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q14710340, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q936242, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q503319, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q1545870, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q1166157, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q8046702, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7894691, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q870897, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q9035055, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q8021099, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q4976267, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q4737428, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q4737448, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7596915, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q4737430, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q4737439, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q5127221, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q5759571, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q1136463, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q29641619, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q2409690, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q6898026, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q6990513, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q587157, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7100235, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7135370, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7138305, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7238754, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q153824, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7338563, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7338613, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7366501, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7588876, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q3507908, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q7734912, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by stay.near-venue for entity Q49576876, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity ES-lhospitalet-de-llobregat-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity ES-barakaldo-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity ES-lhospitalet-de-llobregat-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity ES-collado-villalba-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity ES-bilbao-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-supermarket for entity ES-lhospitalet-de-llobregat-x-supermarket, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity ES-rivas-vaciamadrid-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity ES-santiago-de-compostela-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity FR-biscarrosse-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity FR-saint-herblain-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-weston-super-mare-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-newcastle-upon-tyne-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-newcastle-upon-tyne-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-newcastle-upon-tyne-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-newcastle-upon-tyne-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-newcastle-upon-tyne-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-jastrzębie-zdrój-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-school for entity GB-birmingham-x-school, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-reading-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-lincoln-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-bedford-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-birmingham-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-manchester-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-stratford-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-school for entity GB-cambridge-x-school, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-york-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-york-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-hastings-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-school for entity GB-manchester-x-school, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-cambridge-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-newark-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-oxford-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-supermarket for entity GB-manchester-x-supermarket, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-birmingham-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-plymouth-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-plymouth-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-plymouth-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-lincoln-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-plymouth-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-rochester-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-rochester-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-rochester-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-brandon-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-hastings-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-hastings-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-york-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-york-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-lincoln-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-portsmouth-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-cambridge-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-bedford-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-washington-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-lincoln-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-lincoln-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pub for entity GB-lincoln-x-pub, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-supermarket for entity GB-lincoln-x-supermarket, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-london-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-richmond-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-manchester-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-manchester-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-department_store for entity GB-birmingham-x-department_store, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-richmond-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-hamilton-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-bedford-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-richmond-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-oxford-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-aberdeen-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-aberdeen-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-aberdeen-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-aberdeen-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-aberdeen-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-brentwood-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-sheffield-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-derby-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-brighton-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-cambridge-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-plymouth-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-bedford-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-bangor-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-oxford-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-department_store for entity GB-oxford-x-department_store, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-kettering-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-manchester-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-middleton-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-chesterfield-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-birmingham-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-birmingham-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-brighton-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-brighton-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-washington-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-portsmouth-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-cambridge-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-cambridge-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-newark-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pub for entity GB-rochester-x-pub, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pub for entity GB-washington-x-pub, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-derby-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-mansfield-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-mansfield-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-kettering-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-cambridge-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-mansfield-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-birmingham-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-birmingham-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-rochester-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-aberdeen-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-portsmouth-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-birmingham-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-birmingham-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-sports_centre for entity GB-manchester-x-sports_centre, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-oxford-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-portsmouth-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-chatham-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-newark-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-bristol-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-mansfield-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-kettering-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-department_store for entity GB-kettering-x-department_store, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-childcare for entity GB-manchester-x-childcare, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-kettering-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-manchester-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-manchester-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-plymouth-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-montrose-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-aberdeen-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-wakefield-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-hamilton-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-brentwood-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-brighton-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-newport-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-supermarket for entity GB-birmingham-x-supermarket, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-birmingham-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-bedford-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-falmouth-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-oxford-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-sports_centre for entity GB-bristol-x-sports_centre, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-oxford-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-oxford-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-oxford-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-portsmouth-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-lancaster-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-bedford-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-lancaster-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-bristol-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-oxford-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-shrewsbury-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-dover-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-lancaster-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-reading-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-lancaster-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-bristol-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-newport-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-brighton-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-manchester-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-carlisle-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-bangor-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-brighton-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-manchester-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-derby-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-worcester-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-manchester-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-lancaster-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-sports_centre for entity GB-cambridge-x-sports_centre, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-school for entity GB-reading-x-school, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-childcare for entity GB-brighton-x-childcare, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-derry-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-cambridge-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-brighton-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-bristol-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-attraction for entity GB-bristol-x-attraction, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-newport-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-norwich-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gallery for entity GB-cambridge-x-gallery, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-sports_centre for entity GB-reading-x-sports_centre, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-worcester-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-supermarket for entity GB-cambridge-x-supermarket, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pub for entity GB-cambridge-x-pub, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-boston-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-worcester-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-weymouth-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-weymouth-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-worcester-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-northampton-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-shrewsbury-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-shrewsbury-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-woodbridge-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-durham-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-newport-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pub for entity GB-worcester-x-pub, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-carlisle-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-lancaster-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pub for entity GB-lancaster-x-pub, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-bar for entity GB-worcester-x-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-chelmsford-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-worcester-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-bristol-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-newport-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-department_store for entity GB-manchester-x-department_store, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-reading-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-derry-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-warwick-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-windsor-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-windsor-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-enfield-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-enfield-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-supermarket for entity GB-york-x-supermarket, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-york-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-dover-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-childcare for entity GB-cambridge-x-childcare, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-winchester-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-durham-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-newmarket-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-market for entity GB-brighton-x-market, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-childcare for entity GB-lancaster-x-childcare, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-acton-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-brighton-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-cambridge-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-reading-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-cambridge-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-reading-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-shrewsbury-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-exeter-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-supermarket for entity GB-reading-x-supermarket, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-department_store for entity GB-reading-x-department_store, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-exeter-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-exeter-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-exeter-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-liverpool-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-bangor-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-norwich-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-norwich-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-chester-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-dover-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-liverpool-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-durham-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-bristol-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-lancaster-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-brighton-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-chester-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-portsmouth-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-warrington-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-gloucester-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-livingston-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-york-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-salisbury-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-chester-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-chester-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-veterinary for entity GB-cambridge-x-veterinary, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cafe for entity GB-woodbridge-x-cafe, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-westbury-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-durham-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-brentwood-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-norwich-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-norwich-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-brandon-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-winchester-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-livingston-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-college for entity GB-manchester-x-college, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-market for entity GB-newport-x-market, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-southport-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cinema for entity GB-oxford-x-cinema, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pharmacy for entity GB-durham-x-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-museum for entity GB-birmingham-x-museum, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-pub for entity GB-richmond-x-pub, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-sports_centre for entity GB-durham-x-sports_centre, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-salisbury-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-dumfries-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-abingdon-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-department_store for entity GB-aberdeen-x-department_store, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-abingdon-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity US-winston-salem-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-restaurant for entity GB-nottingham-x-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-nottingham-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-fast_food for entity GB-nottingham-x-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-nottingham-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity GB-nottingham-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-durham-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-aberdeen-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-gym for entity GB-durham-x-gym, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-clinic for entity US-winston-salem-x-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cinema for entity GB-birmingham-x-cinema, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-dentist for entity GB-salisbury-x-dentist, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-department_store for entity US-oak-ridge-x-department_store, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.area-fast_food for entity FR-lille-bois-blancs-fast_food, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.area-pharmacy for entity FR-lille-bois-blancs-pharmacy, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.area-clinic for entity FR-lille-bois-blancs-clinic, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.area-restaurant for entity FR-lille-bois-blancs-restaurant, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.area-bar for entity FR-lille-bois-blancs-bar, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-plymouth-x-restaurant-pizza, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-plymouth-x-restaurant-sandwich, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-plymouth-x-restaurant-chinese, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-lincoln-x-restaurant-chinese, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-lincoln-x-restaurant-sandwich, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-plymouth-x-restaurant-burger, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-lincoln-x-restaurant-coffee_shop, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-lincoln-x-restaurant-pizza, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-lincoln-x-restaurant-indian, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-lincoln-x-restaurant-burger, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-american, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-burger, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-chicken, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-mexican, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-pizza, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-cambridge-x-restaurant-burger, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-plymouth-x-restaurant-coffee_shop, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-chinese, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-coffee_shop, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-cambridge-x-restaurant-coffee_shop, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-cambridge-x-restaurant-italian, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-portsmouth-x-restaurant-coffee_shop, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-pizza, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-portsmouth-x-restaurant-pizza, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-portsmouth-x-restaurant-italian, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-portsmouth-x-restaurant-american, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-portsmouth-x-restaurant-sandwich, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-sushi, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-italian, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-cambridge-x-restaurant-pizza, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-cambridge-x-restaurant-sandwich, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-portsmouth-x-restaurant-chinese, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-mexican, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-sandwich, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-japanese, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-portsmouth-x-restaurant-chicken, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-reading-x-restaurant-pizza, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-american, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-thai, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-sandwich, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-burger, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-asian, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-coffee_shop, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-breakfast, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-cambridge-x-restaurant-indian, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-cambridge-x-restaurant-chinese, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-cambridge-x-restaurant-thai, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-cambridge-x-restaurant-japanese, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-manchester-x-restaurant-italian, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-worcester-x-restaurant-coffee_shop, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-worcester-x-restaurant-pizza, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-worcester-x-restaurant-chinese, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-worcester-x-restaurant-sandwich, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-reading-x-restaurant-coffee_shop, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-reading-x-restaurant-sandwich, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-reading-x-restaurant-italian, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-reading-x-restaurant-breakfast, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-chicken, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-bakery, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-indian, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-cuisine for entity GB-birmingham-x-restaurant-chinese, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.area-cuisine for entity FR-lille-bois-blancs-restaurant-burger, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.area-cuisine for entity FR-lille-bois-blancs-restaurant-french, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.area-opening for entity FR-lille-bois-blancs-restaurant-late, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.area-opening for entity FR-lille-bois-blancs-restaurant-sunday, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by areas.overview for entity FR-lille-bois-blancs-area_overview, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by areas.city-index for entity GB-brighton-x-areas_index, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by areas.city-index for entity GB-cambridge-x-areas_index, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-porto-alegre-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-são-paulo-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-fortaleza-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-recife-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity BR-salvador-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity ES-madrid-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity ES-toledo-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-newport-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-london-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity IT-rome-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-sapporo-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-nagano-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-chūō-x-hospital, so the two would be the same page | 1 |
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
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-ōta-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-wakayama-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-kasugai-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-matsudo-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-ōita-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity JP-himeji-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity PL-poznań-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity PL-katowice-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-birmingham-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-manchester-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-omaha-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-dallas-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-plano-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-nashville-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-san-antonio-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-philadelphia-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-atlanta-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-houston-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-dayton-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-portsmouth-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-cincinnati-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-indianapolis-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-columbus-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-fort-wayne-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-los-angeles-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-richmond-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-denver-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-lafayette-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-phoenix-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity GB-taunton-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-sacramento-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-minneapolis-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-wichita-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-albuquerque-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-orlando-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-arlington-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-hospital for entity US-syracuse-x-hospital, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-karlsruhe-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-berlin-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-stuttgart-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-köln-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-hamburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-bonn-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-erfurt-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-hannover-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-munich-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-mainz-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-braunschweig-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-dortmund-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-würzburg-x-library, so the two would be the same page | 1 |
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
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-heidelberg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-königswinter-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-münster-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-kiel-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-sankt-augustin-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-düsseldorf-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-essen-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-bamberg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-regensburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-augsburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-aschaffenburg-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-trier-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-esslingen-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity DE-neustadt-an-der-weinstraße-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-granada-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-málaga-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-sevilla-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-zaragoza-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-santander-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-burgos-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-león-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-salamanca-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-valladolid-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-albacete-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-toledo-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-barcelona-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-palma-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-cadiz-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-valencia-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-chamartín-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-santiago-de-compostela-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-oviedo-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-madrid-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-donostia-san-sebastián-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-mislata-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-murcia-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-ciudad-lineal-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-pozuelo-de-alarcón-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-pamplona-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-castelló-de-la-plana-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-cartagena-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-a-coruña-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity ES-córdoba-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity FR-paris-05-panthéon-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity FR-toulouse-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-london-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-oxford-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-glasgow-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity GB-edinburgh-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-rome-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-turin-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-venice-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-milan-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-naples-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-ravenna-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-bologna-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-padua-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-perugia-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-pordenone-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-catania-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-bergamo-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-trieste-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity IT-brescia-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity JP-minato-city-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity JP-chūō-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity NL-amsterdam-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-kraków-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-poznań-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-lublin-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-białystok-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-gdańsk-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-warsaw-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity PL-toruń-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-chicago-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-washington-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-princeton-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-philadelphia-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-portland-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-boston-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-new-york-city-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-phoenix-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-indianapolis-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-manhattan-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-pittsburgh-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-worcester-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-los-angeles-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-library for entity US-providence-x-library, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-shopping_mall for entity GB-reading-x-shopping_mall, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-shopping_mall for entity GB-manchester-x-shopping_mall, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-stadium for entity GB-birmingham-x-stadium, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-recife-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-são-paulo-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-belo-horizonte-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-porto-alegre-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-belém-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-fortaleza-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-teresina-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-manaus-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-viçosa-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity BR-campos-dos-goytacazes-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity DE-frankfurt-am-main-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity DE-berlin-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity ES-madrid-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity ES-chamartín-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity FR-toulouse-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity GB-london-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity GB-birmingham-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity GB-stratford-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-brighton-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity IT-turin-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity IT-rome-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity IT-milan-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity IT-verona-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity IT-florence-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity IT-trento-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity JP-sapporo-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity JP-machida-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity JP-sendai-x-university, so the two would be the same page | 1 |
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
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-san-jose-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-chicago-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-colorado-springs-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-indianapolis-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-portland-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-pittsburgh-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity GB-cambridge-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-washington-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-charleston-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-phoenix-x-university, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by places.city-university for entity US-raleigh-x-university, so the two would be the same page | 1 |

## 6. QA at scale

- rows checked: 204,767, distinct URLs 204,767

| check | count |
| --- | --- |
| title_over_65_chars | 130,531 |
| meta_over_165_chars | 2,004 |
| title_under_15_chars | 4 |
| duplicate_title_exact | 1,166 |
| duplicate_title_same_tokens | 1,185 |
| superlative_from_the_family_own_intent | 20 |
| uniqueness_reason_shared_with_another_candidate | 22 |
| templates_with_repeated_entities | 0 |
| orphan_pages | 59 |
| top_level_pages_whose_parent_is_the_locale_home | 0 |
| intent_owners_claimed_by_more_than_one_url | 0 |
| urls_sharing_a_cannibalization_key | 0 |
| locale_mismatch_between_url_and_row | 0 |
| entity_names_needing_a_disambiguator_in_the_title | 986 |
| same_entity_id_under_two_names | 0 |
| candidates_with_no_usable_source | 0 |
| kept_rows_with_a_rejecting_localisation_class | 0 |
| family_locale_cells_failing_the_usefulness_test | 0 |

- A per-page target query is not recorded in the manifest, so a query-level competition test cannot be run from it. The three keyword fields it does carry are family-level: they name the measurement that proved the family in a market, not the page target.

- title length: min 13, max 192, mean 66.4

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

204,767 candidates survive the gates. The target is 1,000,000.

The gap is not a shortage of raw rows. It is the gates, and each one was added for a reason that a measurement or a SERP showed:

- An area page needs the area to be a NAMED entity. Requiring a polygon, a population, a Wikidata item or a Wikipedia article cut the usable place set by about two thirds. The Kreuzberg probe validated neighbourhood demand for a famous area and says nothing about an unnamed suburb.
- A POI belongs to exactly one area. Letting every covering extent claim it produced four times as many area pages, and they would have been near-duplicate lists of the same venues on adjacent neighbourhood pages.
- Modifier pages are gated on city size, because every measured keyword for them named a large city.
- An area page needs its parent city page to exist, or it is an orphan by construction.
- Individual entity pages are allowed only where a third party can rank. The SERP for a named hospital, university or station belongs to that institution.

Raising the number to one million from here would mean removing one of those gates. Each one is written down with the measurement behind it so that decision can be made deliberately rather than by accident, and so it can be reversed if a later measurement disagrees. What this pass will not do is reach the number by generating pages the measurements say nobody searches for.


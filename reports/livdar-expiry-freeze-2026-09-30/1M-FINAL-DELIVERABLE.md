# Livdar candidate inventory: the final state of this pass

Built 2026-10-06. Every number below is read from a generated file, not retyped, so this report and the inventory cannot disagree.

## 1. The number

- FINAL DISTINCT VALID CANDIDATES: **422,825**
- target: 1,000,000
- shortfall: **577,175** (42.3 per cent of target)
- rejected and kept visible: 259,656

The target was not reached. The rest of this report is about why, which of the gaps are closable and at what cost, and what was built instead. No row was added to move this number: every gate that fired is listed in section 5 with its count.

## 2. The funnel, stage by stage

| stage | count | what happened |
| --- | --- | --- |
| generated before gates | 0 | every family crossed with every entity it has, in every market scoped to it |
| passed the uniqueness and SERP gate | 0 | a candidate with no uniqueness_reason, or in a SERP archetype measured as closed, is rejected here |
| after exact dedupe | 583,566 | same url_pattern |
| after semantic dedupe | 583,566 | same market, family, template signature and entity |
| FINAL DISTINCT | 422,825 | what is in the manifest |

## 3. Where the candidates are

### By market

| market | candidates |
| --- | --- |
| en-US | 103,910 |
| de-DE | 58,544 |
| fr-FR | 49,422 |
| ja-JP | 40,637 |
| es-ES | 31,507 |
| it-IT | 28,276 |
| en-GB | 28,266 |
| pl-PL | 21,197 |
| pt-BR | 18,493 |
| nl-NL | 15,433 |
| tr-TR | 14,684 |
| en-AU | 10,158 |
| es-MX | 1,498 |
| zh-Hant-TW | 800 |

### By surface

| surface | candidates |
| --- | --- |
| places | 189,031 |
| outdoors | 137,402 |
| stay | 23,609 |
| areas | 22,519 |
| pulse | 14,165 |
| move | 12,331 |
| climate | 8,555 |
| work | 3,921 |
| transport | 3,859 |
| poi | 3,731 |
| destinations | 1,556 |
| tools | 802 |
| sport | 690 |
| safety | 654 |

### By readiness

| status | candidates |
| --- | --- |
| POI_AGGREGATION | 335,482 |
| MISSING_DATA | 39,351 |
| BLOCKED_BY_LICENCE | 28,758 |
| EXPERIMENT_ONLY | 9,821 |
| NOT_IMPLEMENTED | 9,343 |
| VALIDATED | 50 |
| PROMISING | 20 |

### By source readiness

| source_status | candidates |
| --- | --- |
| SOURCE_AVAILABLE | 374,614 |
| LICENCE_REQUIRED | 28,758 |
| FEED_REQUIRED | 9,747 |
| READY_NOW | 9,706 |

### By SERP feasibility

| serp_feasibility | candidates |
| --- | --- |
| viable | 247,374 |
| unsampled_needs_serp_check | 72,125 |
| competitive | 54,145 |
| poor_fit | 25,176 |
| strong_opportunity | 24,005 |

### By licence

| licence_status | candidates |
| --- | --- |
| ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED | 332,580 |
| OK | 58,585 |
| LICENCE_REQUIRED | 28,758 |
| CC0_NO_CONDITIONS | 2,902 |

### By demand evidence for the market the page targets

A family proven in other markets but unmeasured in this one scores 30 rather than zero, because one keyword validates a cluster. That is not the same as measured demand, so the distinction is a field rather than something to infer from a score.

| market_demand_evidence | candidates |
| --- | --- |
| shape_measured_2026_10_01 | 335,482 |
| measured_in_this_market | 82,158 |
| family_measured_elsewhere | 5,185 |

### The twenty largest families

| family | candidates |
| --- | --- |
| outdoors.peak | 68,642 |
| outdoors.hiking-trail | 23,494 |
| places.area-cuisine | 22,187 |
| places.area-restaurant | 15,751 |
| places.city-cuisine | 13,814 |
| outdoors.bicycle-trail | 12,195 |
| activities.city-things-to-do | 11,750 |
| places.area-pharmacy | 10,855 |
| places.area-fast_food | 10,741 |
| stay.city-type | 9,807 |
| places.area-cafe | 8,764 |
| places.area-supermarket | 8,662 |
| weather.city-month | 8,306 |
| outdoors.castle | 7,922 |
| places.area-opening | 7,913 |
| events.city-type | 6,680 |
| events.city-calendar | 6,680 |
| places.city-restaurant | 6,097 |
| places.area-clinic | 5,838 |
| places.area-attribute | 5,620 |

## 3b. The multilingual breakdown

A second language is not free inventory. Every row whose language is not the language of the country it describes has to show its own reason to exist, and the default answer is no. The table below separates what each market kept from what it was refused and why.

| market | raw candidates | final valid | no uniqueness basis | closed SERP | translation only | local intent missing | demand not for this destination | local data missing | other |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| en-US | 148,467 | 103,910 | 19,723 | 3,866 | 9,388 | 4,515 | 6,296 | 0 | 769 |
| en-GB | 37,092 | 28,266 | 2,087 | 2,365 | 0 | 0 | 4,098 | 0 | 276 |
| de-DE | 108,721 | 58,544 | 9,619 | 4,140 | 2,527 | 8,842 | 24,112 | 0 | 937 |
| ja-JP | 94,930 | 40,637 | 10,483 | 3,097 | 35,425 | 4,198 | 548 | 248 | 294 |
| zh-Hant-TW | 5,191 | 800 | 690 | 80 | 0 | 1 | 3,620 | 0 | 0 |
| it-IT | 58,260 | 28,276 | 7,354 | 1,162 | 15,285 | 2,087 | 3,549 | 0 | 547 |
| es-ES | 41,074 | 31,507 | 4,790 | 308 | 0 | 0 | 4,060 | 0 | 409 |
| fr-FR | 61,133 | 49,422 | 6,927 | 286 | 0 | 1 | 4,056 | 248 | 193 |
| nl-NL | 21,383 | 15,433 | 4,878 | 114 | 0 | 1 | 796 | 0 | 161 |
| pl-PL | 27,139 | 21,197 | 4,893 | 218 | 0 | 1 | 796 | 0 | 34 |
| pt-BR | 27,189 | 18,493 | 5,881 | 1,354 | 0 | 1 | 1,428 | 0 | 32 |
| **all 11** | **630,579** | **396,485** | | | | | | | |

Romanian is absent from the table on purpose. No Romanian Atlas page was added in this pass, as instructed.

### Localisation class of every row that survived

| localization_class | candidates |
| --- | --- |
| NATIVE_LOCALE | 406,656 |
| VALID_LOCALIZATION | 16,169 |

- flagged LOCAL_SERP_UNVERIFIED: 72,125. These are kept, not rejected. Absence of SERP evidence is not evidence of a poor fit, and treating it as one already mislabelled 62 per cent of this inventory once.

### Top families per market

| market | strongest families |
| --- | --- |
| en-US | outdoors.peak (32,068), places.area-cuisine (5,418), places.city-cuisine (4,914), outdoors.hiking-trail (3,310) |
| en-GB | outdoors.peak (2,319), places.area-cuisine (2,130), places.area-fast_food (1,548), outdoors.hiking-trail (1,442) |
| de-DE | outdoors.peak (12,350), stay.city-type (3,609), places.city-category (2,405), rents.city (2,405) |
| ja-JP | places.area-cuisine (4,089), places.area-restaurant (2,943), activities.city-things-to-do (2,544), weather.city-month (2,544) |
| zh-Hant-TW | activities.city-things-to-do (51), places.city-category (40), weather.city-month (40), health.city (40) |
| it-IT | outdoors.peak (4,917), places.area-cuisine (1,727), places.area-restaurant (1,492), activities.city-things-to-do (1,039) |
| es-ES | outdoors.peak (5,707), outdoors.hiking-trail (4,346), places.area-restaurant (1,486), places.area-cuisine (1,236) |
| fr-FR | outdoors.hiking-trail (9,255), outdoors.castle (3,666), outdoors.bicycle-trail (3,185), outdoors.peak (3,161) |
| nl-NL | outdoors.hiking-trail (2,718), outdoors.windmill (656), places.area-cuisine (628), places.area-supermarket (605) |
| pl-PL | outdoors.peak (2,128), outdoors.bicycle-trail (1,983), outdoors.hiking-trail (1,879), places.area-pharmacy (1,075) |
| pt-BR | cost-of-living.city (699), relocation.city (699), weather.city-month (677), rents.city (677) |

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

- OSM POI files on disk: 34 (poi-AE.jsonl.gz, poi-AT.jsonl.gz, poi-AU.jsonl.gz, poi-BE.jsonl.gz, poi-BR.jsonl.gz, poi-CH.jsonl.gz, poi-DE.jsonl.gz, poi-DK.jsonl.gz, poi-EG.jsonl.gz, poi-ES.jsonl.gz, poi-FR.jsonl.gz, poi-GB.jsonl.gz, poi-ID.jsonl.gz, poi-IE.jsonl.gz, poi-IT.jsonl.gz, poi-JP.jsonl.gz, poi-KH.jsonl.gz, poi-LU.jsonl.gz, poi-MA.jsonl.gz, poi-MX.jsonl.gz, poi-MY.jsonl.gz, poi-NL.jsonl.gz, poi-PH.jsonl.gz, poi-PL.jsonl.gz, poi-PT.jsonl.gz, poi-SE.jsonl.gz, poi-SG.jsonl.gz, poi-TN.jsonl.gz, poi-TR.jsonl.gz, poi-TW-health.jsonl.gz, poi-US-us-midwest.jsonl.gz, poi-US-us-northeast.jsonl.gz, poi-US-us-south.jsonl.gz, poi-US-us-west.jsonl.gz)
- OSM place files with geometry: 33 (places-AE.jsonl.gz, places-AT.jsonl.gz, places-AU.jsonl.gz, places-BE.jsonl.gz, places-BR.jsonl.gz, places-CH.jsonl.gz, places-DE.jsonl.gz, places-DK.jsonl.gz, places-EG.jsonl.gz, places-ES.jsonl.gz, places-FR.jsonl.gz, places-GB.jsonl.gz, places-ID.jsonl.gz, places-IE.jsonl.gz, places-IT.jsonl.gz, places-JP.jsonl.gz, places-KH.jsonl.gz, places-MA.jsonl.gz, places-MX.jsonl.gz, places-MY.jsonl.gz, places-NL.jsonl.gz, places-PH.jsonl.gz, places-PL.jsonl.gz, places-PT.jsonl.gz, places-SE.jsonl.gz, places-SG.jsonl.gz, places-TN.jsonl.gz, places-TR.jsonl.gz, places-US-us-midwest.jsonl.gz, places-US-us-northeast.jsonl.gz, places-US-us-south.jsonl.gz, places-US-us-west.jsonl.gz, places-luxembourg.jsonl.gz)
- POI read: 6,451,416, of which 1,310,843 carried an addr:city tag and 3,588,428 were attributed spatially against the 31,715-city gazetteer; 1,551,408 fell outside every city radius and were dropped
- named places loaded: 559,318, of which 91,665 passed the entity gates
- POI assigned to an area by polygon containment: 497,710; by documented proximity to a place node: 2,290,647
- aggregation candidates: 279,305 ({'city_category': 83203, 'area_category': 93217, 'city_cuisine': 36183, 'area_cuisine': 22859, 'city_attribute': 10101, 'area_attribute': 5691, 'city_opening': 11833, 'area_opening': 8007, 'city_sport': 505, 'area_parent': 4038, 'city_areas_hub': 916, 'notable_entity': 2752})
- Wikidata entities loaded: 195,490, candidates 5,971, deduped against OSM by {'qid': 13919, 'name_and_position': 4980}
- Pulse entities normalised from four providers: {'national': 1081, 'regional': 623, 'school': 1502, 'long_weekends': 687, 'bridge_days': 233, 'long_weekends_subdivision': 3539, 'bridge_days_subdivision': 1052, 'bridge_plans': 348}

## 5. Every gate that fired, with its count

Nothing is hidden. A candidate rejected here is in LIVDAR-1M-REJECTED-CANDIDATES.csv.gz with its reason.

### Aggregation gates

| gate | rejected |
| --- | --- |
| entity_not_notable | 6,437,294 |
| place_not_a_named_entity | 262,774 |
| below_min_count | 200,683 |
| area_cuisine_below_min_count | 192,743 |
| area_class_not_a_list_intent | 179,523 |
| destination_fanout_area_itself_carries_no_mark_in_this_language | 162,181 |
| class_not_a_list_intent | 152,298 |
| cuisine_below_min_count | 151,761 |
| area_parent_city_page_not_accepted | 147,368 |
| place_no_parent_city | 131,878 |
| area_below_min_count | 111,061 |
| area_opening_below_min_count | 90,499 |
| area_attr_below_min_count | 71,886 |
| attr_below_min_count | 69,035 |
| opening_below_min_count | 67,822 |
| place_no_market_for_country_neighbourhood_level_stays_home_market_only | 63,555 |
| no_market_and_no_destination_evidence_for_country | 56,829 |
| entries_too_thin | 27,957 |
| area_parent_too_narrow | 26,455 |
| area_entries_too_thin | 23,705 |
| area_opening_parent_page_not_accepted | 13,973 |
| opening_city_below_measured_demand_floor | 13,366 |
| area_cuisine_parent_page_not_accepted | 10,483 |
| cuisine_city_below_measured_demand_floor | 10,147 |
| destination_fanout_no_city_mark_in_any_language | 9,676 |
| notable_but_data_thin | 8,358 |
| sport_below_min_count | 7,812 |
| attr_city_below_measured_demand_floor | 7,315 |
| area_attr_parent_page_not_accepted | 7,213 |
| place_ambiguous_duplicate_name_in_city | 6,769 |
| area_opening_area_not_a_searched_entity | 6,501 |
| area_parent_entity_too_thin | 4,855 |
| area_attr_area_not_a_searched_entity | 4,074 |
| destination_fanout_entity_itself_carries_no_mark_in_this_language | 3,395 |
| area_parent_city_has_no_areas_hub | 3,272 |
| place_name_not_usable | 2,609 |
| area_duplicates_city_list | 2,509 |
| area_class_measured_at_or_near_zero_in_this_market | 2,052 |
| notable_entity_has_no_parent_page | 1,514 |
| cuisine_parent_restaurant_list_not_accepted | 690 |
| cuisine_entries_too_thin | 588 |
| area_cuisine_duplicates_city_list | 425 |
| attr_parent_city_page_not_accepted | 421 |
| areas_hub_too_few_areas | 290 |
| area_opening_parent_area_page_not_accepted | 186 |
| opening_parent_city_page_not_accepted | 159 |
| area_attr_parent_area_page_not_accepted | 118 |
| sport_parent_city_page_not_accepted | 99 |
| place_polygon_implausibly_large | 65 |
| area_opening_duplicates_city_list | 60 |
| attr_not_discriminating | 23 |
| cuisine_measured_at_or_near_zero_in_this_market | 20 |
| area_attr_duplicates_city_list | 13 |
| opening_not_discriminating | 8 |
| place_polygon_degenerate | 3 |

### Wikidata gates

| gate | rejected |
| --- | --- |
| no_official_website_so_page_would_be_thin | 66,603 |
| no_parent_city | 52,343 |
| already_in_osm_corpus | 18,899 |
| list_below_min_count | 12,296 |
| wikidata_duplicate_qid | 8,408 |
| no_parent_page_exists_on_the_site | 8,119 |
| no_market_for_country | 5,023 |
| list_entries_too_thin | 932 |
| list_already_published_from_the_osm_corpus | 211 |

### Manifest gates

| gate | rejected |
| --- | --- |
| REJECTED_QUALITY: no defensible uniqueness basis | 80,182 |
| localization:TRANSLATION_ONLY | 70,343 |
| localization:LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION | 53,359 |
| localization:LOCAL_INTENT_MISSING | 20,070 |
| REJECTED_SERP: SERP_FEATURE_SUPPRESSED is a measured closed SERP, not winnable | 14,563 |
| REJECTED_SERP: AGGREGATOR_LOCKED is a measured closed SERP, not winnable | 3,615 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-cuisine is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 632 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-restaurant is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 544 |
| localization:LOCAL_DATA_MISSING | 496 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. weather.city-month is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 489 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-cuisine is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 473 |
| REJECTED_QUALITY: indexability floor 10 | 419 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-fast_food is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 272 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-opening is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 261 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-pharmacy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 234 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. weather.city-month is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. health.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.city-getting-around is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. property.city-buy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-calendar is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. relocation.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. rents.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. services.city-practical is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-salaries is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. stay.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 222 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.overview is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 216 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.overview is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 210 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-attribute is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 201 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.route-from-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 199 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. health.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. property.city-buy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. relocation.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. rents.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. services.city-practical is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-salaries is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-cafe is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 148 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-restaurant is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 138 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-clinic is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 136 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-school is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 134 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-dentist is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 120 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.city-index is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 109 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-childcare is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 107 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/berlin-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 96 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-fast_food is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 95 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.route-from-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 93 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-home is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 93 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city-vs-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 93 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-universities is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 93 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. safety.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 93 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-jobs-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 93 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. sport.city-activity is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 93 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-window is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 93 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-department_store is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 82 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.overview is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 80 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-gym is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 80 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-school is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 79 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. places.neighbourhood-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 74 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. rents.neighbourhood is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 74 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. neighbourhoods.guide is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 74 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-clinic is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 71 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-cafe is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 67 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-supermarket is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 65 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-supermarket is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 65 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-pharmacy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-veterinary is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-home is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city-vs-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-universities is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. safety.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-jobs-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. sport.city-activity is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-dentist is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 63 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-bar is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 60 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-opening is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 59 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-attribute is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 58 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-gym is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 52 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-department_store is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 51 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/aachen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 48 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/florence-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 42 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.mtb-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 41 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.foot-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 40 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/rome-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 40 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-childcare is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 36 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-veterinary is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 36 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.archaeological_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 36 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-hospital is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 35 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. weather.city-month is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. health.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.city-getting-around is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. property.city-buy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-calendar is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. relocation.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. rents.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. services.city-practical is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-salaries is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. stay.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 33 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/rome-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 32 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-bar is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 31 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-college is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 30 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/hamburg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 30 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-railway_station is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 29 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.lighthouse is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 27 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/madrid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 27 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-college is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 26 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-arts_centre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 25 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/leipzig/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 25 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-hostel is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 24 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.monument is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 24 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 23 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-hostel is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 22 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.cave is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 22 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/weimar/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 22 |
| REJECTED_UNSUPPORTED_SUPERLATIVE: the family id itself claims ['best'], which appears in the URL segment and in the rendered title, and no methodology document exists for it. Its sources (geonames-cities; neighbourhood-facts-verified; rent-index-ve) support a factual comparison and not a ranking. areas.city-index already lists a city's areas from the same verified facts without ranking them, so this page is that one plus an unearned superlative. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-university is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-park is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.waterfall is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 20 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-hospital is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 20 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/amsterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 20 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-arts_centre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 19 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/potsdam-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 19 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/portland-us-oregon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 19 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-museum is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 18 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-cinema is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 17 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/madrid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 17 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-cinema is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-schools is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/dresden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/barcelona-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/naples-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/kobe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/chicago/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.bicycle-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.route-from-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-home is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city-vs-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-universities is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. safety.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-university is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-jobs-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. sport.city-activity is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-window is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/rome-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 15 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/sapporo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 15 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/dallas-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-railway_station is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 14 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.monument is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 14 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-museum is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 14 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/chicago/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/park/madrid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/amsterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/los-angeles-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/munich/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/new-york-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/san-francisco-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/barcelona-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/hamburg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/frankfurt-am-main/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/chicago/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/koln/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/berlin-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/halle-saale/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/berlin-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/munich/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/regensburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-guest_house is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 12 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.monument is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 12 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-pub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 12 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/amsterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/nagoya/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/new-york-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/milan-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-attraction is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 11 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.city-index is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 11 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-guest_house is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 11 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/new-york-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/london-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/kyoto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/milan-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/kassel/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/los-angeles-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/nuremberg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/edinburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.aqueduct is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 10 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 10 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-schools is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 10 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/philadelphia-us-pennsylvania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/saarbrucken/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/edinburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/dusseldorf/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/san-diego-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.city-index is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 9 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. poi.museum-notable is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 9 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-library is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 9 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/milan-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/malaga-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/atlanta-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/san-francisco-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/barcelona-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/austin-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/munster-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/philadelphia-us-pennsylvania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/portland-us-oregon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-sports_centre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.cave is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.ruins is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-sports_centre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/malaga-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/rotterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/genoa-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/norwich-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/birmingham-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/valencia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/denver/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/essen-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/genoa-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/rostock/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/darmstadt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/siena/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/pamplona-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/munich/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/savannah-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-pub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 7 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.waterfall is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 7 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/chemnitz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/rotterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/stuttgart-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/the-hague/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/bath-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/zaragoza-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/philadelphia-us-pennsylvania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/chamartin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/bremen-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/trieste/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/hamburg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/meersburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/st-louis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/houston-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/magdeburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/minneapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/ciudad-lineal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/sevilla-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/modena/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/palermo-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/naples-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_SAME_NAME_IN_CITY: /pl/poi/attraction/laweczka-chopina-n13293477296/ is already the poi page for an entity named Ławeczka Chopina in Warsaw, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.archaeological_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-sport is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-attraction is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-park is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/bologna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/niigata/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/toledo-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/baltimore/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/zaragoza-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/oviedo-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/frankfurt-am-main/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/dresden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/donostia-san-sebastian/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/murcia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/lecco/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/indianapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/the-hague/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/colorado-springs/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/washington-us-district-of-columbia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/lubeck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bonn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/new-haven-us-connecticut/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/birmingham-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/glasgow-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/detroit/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/bielefeld/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/park/rome-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/mannheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lucca/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/bologna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/braunschweig/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/gijon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/park/san-diego-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/osnabruck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/gasteiz-vitoria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/la-rochelle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/pisa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/dessau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/erlangen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/reutlingen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-gallery is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.tower is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.viewpoint is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.cave is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.lighthouse is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.ruins is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-schools is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-nightclub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-library is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/theatre/fukuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pittsburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/morioka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/liverpool-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/naples-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/celle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/bologna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/sevilla-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/freiburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/granada-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/palma-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/boulder/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/oxford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/hiroshima/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/dortmund/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/mainz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/fukuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/speyer/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/hannover/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/santander/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/vigo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/bristol-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/stuttgart-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/eindhoven/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/bergamo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/augsburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/koln/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/san-antonio-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bamberg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/burgos-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/dallas-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/hagen-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/merano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/aschaffenburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/brescia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/park/san-francisco-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/salamanca-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/park/katsushika/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/new-orleans/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/oxford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lyon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/las-vegas-us-nevada/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/park/seattle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/louisville-us-kentucky/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/los-angeles-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pistoia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/cagliari/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/catania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.mtb-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 4 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.wilderness_hut is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 4 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.tower is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 4 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.fort is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pesaro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/cardiff/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/heidelberg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/sapporo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/trieste/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/osaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/kagoshima/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/syracuse-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/kamakura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/leipzig/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/theatre/minato-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/kyoto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/saint-andrews-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/aberdeen-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/portsmouth-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/london-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/york-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/lille-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/sendai-jp-miyagi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/murcia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/valencia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/hanau-am-main/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/luneburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/memphis-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/komae/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/santiago-de-compostela/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/catanzaro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lorca/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/oklahoma-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/heidelberg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/brooklyn-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/rotterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/maastricht/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/avignon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/park/brooklyn-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/oakland-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/kansas-city-us-missouri/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/stralsund/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/leiden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/rouen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/indianapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/venice-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/nottingham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/brooklyn-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/phoenix/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pueblo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/vigo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/new-orleans/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/berkeley-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/manchester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/paris-18-buttes-montmartre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/the-hague/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/reggio-calabria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/richmond-us-virginia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/richmond-us-virginia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/eisenach/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/alicante-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/chuo-jp-tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/vincennes-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/columbus-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/palermo-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/turin-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/providence-us-rhode-island/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/pittsburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/omaha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/san-jose-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/valladolid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/wichita/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/san-jose-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bernkastel-kues/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_SAME_NAME_IN_CITY: /pl/poi/attraction/laweczka-chopina-n13293479732/ is already the poi page for an entity named Ławeczka Chopina in Praga Północ, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 3 |
| REJECTED_SAME_NAME_IN_CITY: /pl/poi/attraction/laweczka-chopina-n13293462008/ is already the poi page for an entity named Ławeczka Chopina in Śródmieście, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-mall is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-nightclub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-theatre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.caravan_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-gallery is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/bremen-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/dusseldorf/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/salt-lake-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/utrecht-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/genoa-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/altamura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/glasgow-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/marburg-an-der-lahn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/pontevedra-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/kansas-city-us-missouri/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/donostia-san-sebastian/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/nagoya/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/lyon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/arnhem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pescara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/bilbao/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/wurzburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/theatre/nagoya/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/sakai-jp-osaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/belfast-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/dundee-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/nottingham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/winchester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cremona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/kyoto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/kitakyushu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/chiba-jp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/tokushima/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/kamakura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/saint-paul-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/almeria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/sant-adria-de-besos/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/grand-rapids-us-michigan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/badalona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cleveland-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bordeaux/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/maiori/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/ludwigsburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cartagena-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/meiningen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/bilbao/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/alicante-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/padua-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/ilford/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/lecce/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/omaha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/houston-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/seattle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/ravenna-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/baltimore/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/minneapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/utrecht-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/groningen-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/leiden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/toulouse/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/albacete/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/aachen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/bradford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/phoenix/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/como/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/florence-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/charlotte-us-north-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/detroit/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/bolzano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/bautzen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/troyes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/beaumont-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/schwerin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/montpellier/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/haarlem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/bochum-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/halle-saale/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/krefeld/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/utrecht-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/trento-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/fort-worth/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/manchester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pensacola/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/burgos-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/york-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/besancon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/toulouse/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/brescia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/tucson/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/koln/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/le-mans/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/caen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/lleida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bari-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/pisa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/jaen-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/brooklyn-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/santa-fe-us-new-mexico/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/cincinnati/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/terrassa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/girona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/san-francisco-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/coventry-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/saint-paul-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/salerno/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/turin-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/perugia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/verona-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/nashville-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/madrid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/columbus-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/birmingham-us-alabama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/columbus-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/karlsruhe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530747888, so the two would be the same page | 2 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/gagosian-n10859974159/ is already the poi page for an entity named Gagosian in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 2 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/de-doelen-q128795837/ is already the stay page for an entity named De Doelen in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 2 |
| REJECTED_SAME_NAME_IN_CITY: /nl/stay/near-venue/de-doelen-q128795837/ is already the stay page for an entity named De Doelen in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.camp_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.hiking-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.ski-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-garden is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.observatory is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.castle is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.observatory is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-water_park is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-viewpoint is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/esplugues-de-llobregat/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/fujisawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/ayase/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/orlando/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/vercelli/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/belo-horizonte/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/zushi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/maceio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/rijswijk/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/worcester-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/curitiba/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/manaus/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/cunit/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/ipanema-br-rio-de-janeiro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/recife/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/errenteria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/boulogne-billancourt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/garges-les-gonesse/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/limoges/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/paris-11-popincourt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/imperia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/katowice/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/bethesda/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/las-vegas-us-nevada/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/sao-jose-dos-campos/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/perpignan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/kurashiki/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/perugia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/nakano-jp-tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/bradford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/nichelino/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/matsubara-jp-osaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/owariasahi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/hoorn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/fremont-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/toledo-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/brest-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/bristol-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/cambridge-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/dundee-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/swansea-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/treviso/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/diadema/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/sao-joao-de-meriti/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/braunschweig/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/granada-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/bournemouth/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/hove-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/sassari/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/moriguchi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/dordrecht-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/uberlandia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/dortmund/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/karlsruhe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/ourense/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/rodez/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/dudley-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/cagliari/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/akishima/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/higashikurume/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/kumamoto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/nishi-tokyo-shi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/nonoichi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/sayama-jp-osaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/havertown/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/belem-br-para/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/essen-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/kaiserslautern/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/javea/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/toulon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/carshalton/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/enfield-town/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/gateshead/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/hounslow/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/leicester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/arezzo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/bellaria-igea-marina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/hachioji/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/gorzow-wielkopolski/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/billings/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/riverside-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/tampa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/torrance/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/union-city-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/darmstadt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/neuss/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/velbert/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/valladolid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/aberdeen-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/christchurch-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/derby-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/huyton/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/slough/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/torquay-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/reggio-nell-emilia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/swinoujscie/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/cincinnati/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/portland-us-maine/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/hendaye/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/kingston-upon-hull/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/south-shields/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/sunderland/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/wlochy/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/evanston-us-illinois/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/duque-de-caxias/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/torrevieja/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/oldham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/rimini/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/szklarska-poreba/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/dayton-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/dunkirk-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/walsall/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/maltepe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/minato-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/otaru/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/yokohama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/haarlem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/nantes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/zwolle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/passau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cuenca-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/otsu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/faenza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/shoreline/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/stoke-on-trent/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/leipzig/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/derry-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/cheltenham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/yokohama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/castello-de-la-plana/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/shimonoseki/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/kitakyushu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/kawasaki-jp-kanagawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/osaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/niigata/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/nagasaki-jp-nagasaki/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/asahikawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/breda/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/aomori/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/machida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/chuo-jp-tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/shizuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bammental/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lleida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/albacete/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/bad-oeynhausen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/coburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/daytona-beach/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/mantua-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pinerolo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/taranto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lugo-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/monforte-de-lemos/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/a-coruna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/tottenham-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/san-diego-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/florence-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bad-bergzabern/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/aviles/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/cuenca-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/boston-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/mannheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/glendale-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/treviso/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/s-hertogenbosch/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/bremen-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/burbank-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bad-arolsen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/santa-fe-us-new-mexico/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/atlanta-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lorient/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/birmingham-us-alabama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/anaheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lincoln-us-nebraska/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/bayonne-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/maastricht/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/kiel/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/zwickau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/witten/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/digne-les-bains/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/gaillac/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/rovereto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/venice-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/hannover/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/cleveland-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/madison-us-wisconsin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/blois/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/portsmouth-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/halifax-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bilbao/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/newcastle-upon-tyne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/a-coruna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/nantes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/limoges/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/leeuwarden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/wilhelmshaven/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/san-diego-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/galveston/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/jamestown-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/catania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/tampa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/erfurt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pasadena-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/almeria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/munster-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/santa-monica-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/albuquerque/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/ulm/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/brighton-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/evanston-us-illinois/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/rochefort-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/phoenix/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/washington-us-district-of-columbia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/gasteiz-vitoria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/getafe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/denver/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/caen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cordoba-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/theatre/chuo-jp-tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/dresden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/grenoble/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/san-luis-obispo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/mulhouse/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/villeneuve-d-ascq/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/saint-malo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/seattle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/zwolle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/minneapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/villeurbanne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/le-mans/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/madison-us-wisconsin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/livorno/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/bolzano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/zutphen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/padua-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/fermo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/piombino/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/turin-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/varallo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/trieste/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/prato/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/verona-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/alcoy/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/sheffield-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/gorlitz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/kita-jp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/branson/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/memphis-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/glendale-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/boston-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/sheffield-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/knoxville-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/albany-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/milwaukee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/fulham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/charleston-us-south-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/rochester-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/riverside-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pordenone/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lecce/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/acton-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/segovia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/charlotte-us-north-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/kiel/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/leicester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/santa-monica-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/kalamazoo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/newcastle-upon-tyne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/paradise-us-nevada/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/raleigh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/marietta-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/ochsenfurt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/rastatt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/monchengladbach/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/wuppertal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/hildesheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/fresno-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/seattle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/munster-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256042837, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n460855570, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n2299946900, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w131906872, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w177277435, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n26863047, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n246236550, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041659, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041673, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041781, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041847, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041922, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256042733, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256042748, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n259965405, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n267433562, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n285972358, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n285972361, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n291978603, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n310438152, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n310439113, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n319480822, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n319482020, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n323333182, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n323486209, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n323607635, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n324036733, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n330595505, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n381003555, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n418874976, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n441557888, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n454666359, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n454899950, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n454899951, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.waterfall for entity n454925301, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n469641200, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n471168193, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n476276692, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.wilderness_hut for entity n476494311, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n477710706, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n480760326, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530735159, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530742114, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530743910, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530758016, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n531228704, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n531228737, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n531242760, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n535311207, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n537117100, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n650865315, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n658981816, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.cave for entity n795804611, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n913824467, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n913824478, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n913843561, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n913843564, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n914699800, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.cave for entity n923447187, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n953954978, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n954676432, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1041629520, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.ruins for entity n1045687035, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1175453045, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1412836122, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1490464439, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1495173302, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1774677537, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.cave for entity n2078649263, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.waterfall for entity n2492804962, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.waterfall for entity n2492813965, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n2506368453, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n2622035954, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n3479091995, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.ruins for entity n3607868546, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n3777140322, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n3811621742, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n3923636455, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n4224427657, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n4459679614, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n5793904554, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n6035232534, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n9796805128, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_pass for entity n10025075531, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n11286976214, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n11483815963, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n12244460043, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n12262806996, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n12277071185, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n12405480039, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_pass for entity n14024328597, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_pass for entity n14050775515, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w25804487, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w26192938, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w30725037, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w36538401, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w38431259, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.tower for entity w54601431, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.tower for entity w54611173, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w75133409, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w75318759, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w75465648, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w75472593, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.wilderness_hut for entity w87867019, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w98029976, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w100108452, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.wilderness_hut for entity w121940390, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.wilderness_hut for entity w136778436, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w155583950, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w166032559, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w173682244, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w196198667, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n3133612029, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_pass for entity n514123004, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1572677722, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w35941913, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w35944076, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w35945051, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n26864565, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n421008446, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n514556972, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1222009983, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1316231728, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1452762704, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1455340359, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_pass for entity n1626728615, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1827030711, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_pass for entity n2534284082, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n2545662733, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n2808382803, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n3640236069, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w153705216, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w236047957, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n281399025, so the two would be the same page | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/marianne-boesky-gallery-n10859974155/ is already the poi page for an entity named Marianne Boesky Gallery in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/kasmin-gallery-n10860703829/ is already the poi page for an entity named Kasmin Gallery in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/pace-gallery-n10861507198/ is already the poi page for an entity named Pace Gallery in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /ja/poi/museum/東武博物館-n2004025297/ is already the poi page for an entity named 東武博物館 in Katsushika, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/matthew-marks-gallery-n10861543614/ is already the poi page for an entity named Matthew Marks Gallery in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /nl/poi/museum/het-depot-n3014235943/ is already the poi page for an entity named Het Depot in Wageningen, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /it/poi/museum/museo-nazionale-romano-n677476578/ is already the poi page for an entity named Museo Nazionale Romano in Rome, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /fr/poi/theatre/theatre-national-de-bretagne-q108888306/ is already the poi page for an entity named théâtre national de Bretagne in Rennes, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /pt/poi/museum/casa-de-cultura-mario-quintana-n5187236721/ is already the poi page for an entity named Casa de Cultura Mário Quintana in Porto Alegre, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /pt/poi/museum/museu-de-comunicacao-social-hipolito-jose-da-costa-q10333822/ is already the poi page for an entity named Museu de Comunicação Social Hipólito José da Costa in Porto Alegre, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/poi/museum/burgermeister-stroof-haus-q15479860/ is already the poi page for an entity named Bürgermeister-Stroof-Haus in Bonn, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/amusement-park/luna-park-q19864620/ is already the poi page for an entity named Luna Park in Brooklyn, New York, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/energiehal-q133821963/ is already the stay page for an entity named Energiehal in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /nl/stay/near-venue/energiehal-q133821963/ is already the stay page for an entity named Energiehal in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/harmonie-q1783653/ is already the stay page for an entity named Harmonie in Heilbronn, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/harmonie-q1783653/ is already the stay page for an entity named Harmonie in Heilbronn, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/aomori-stadium-q11662291/ is already the stay page for an entity named Aomori Stadium in Aomori, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /ja/stay/near-venue/aomori-stadium-q11662291/ is already the stay page for an entity named Aomori Stadium in Aomori, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/dalziel-park-q5211809/ is already the stay page for an entity named Dalziel Park in Motherwell, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/weimarhalle-q19965560/ is already the stay page for an entity named Weimarhalle in Weimar, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/weimarhalle-q19965560/ is already the stay page for an entity named Weimarhalle in Weimar, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/pfalzbau-q2082239/ is already the stay page for an entity named Pfalzbau in Ludwigshafen am Rhein, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/pfalzbau-q2082239/ is already the stay page for an entity named Pfalzbau in Ludwigshafen am Rhein, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/stadthalle-hagen-q2327241/ is already the stay page for an entity named Stadthalle Hagen in Hagen, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/stadthalle-hagen-q2327241/ is already the stay page for an entity named Stadthalle Hagen in Hagen, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/beethovenhalle-q317912/ is already the stay page for an entity named Beethovenhalle in Bonn, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/beethovenhalle-q317912/ is already the stay page for an entity named Beethovenhalle in Bonn, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/gewandhaus-q519613/ is already the stay page for an entity named Gewandhaus in Leipzig, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/gewandhaus-q519613/ is already the stay page for an entity named Gewandhaus in Leipzig, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/calypso-q109627539/ is already the stay page for an entity named Calypso in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /nl/stay/near-venue/calypso-q109627539/ is already the stay page for an entity named Calypso in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/saalbau-essen-q61435369/ is already the stay page for an entity named Saalbau Essen in Essen, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/saalbau-essen-q61435369/ is already the stay page for an entity named Saalbau Essen in Essen, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/kurhaus-wiesbaden-q16054321/ is already the stay page for an entity named Kurhaus Wiesbaden in Wiesbaden, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/kurhaus-wiesbaden-q16054321/ is already the stay page for an entity named Kurhaus Wiesbaden in Wiesbaden, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/kingston-stadium-q104868005/ is already the stay page for an entity named Kingston Stadium in Cedar Rapids, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/ryan-field-q130238480/ is already the stay page for an entity named Ryan Field in Wilmette, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/john-f-kennedy-stadium-q2390739/ is already the stay page for an entity named John F Kennedy Stadium in Camden, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/clark-field-q5127221/ is already the stay page for an entity named Clark Field in Austin, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/nelson-field-q6990513/ is already the stay page for an entity named Nelson Field in Austin, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-viewpoint is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.foot-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.camp_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.beach_resort is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.running-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. tools.net-pay is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. tools.net-pay is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.waterfall is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-parking is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-nature_reserve is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.camp_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. neighbourhoods.city-where-to-stay is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. destinations.country-hub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. destinations.country-hub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. destinations.country-hub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-beach is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-aquarium is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.windmill is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-golf_course is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-camp_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-theatre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-mall is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/bordeaux/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/aihara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/inagi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/tilburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/orleans-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/aguas-claras/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/bydgoszcz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/ouro-preto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/denia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/oosterhout/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/carcassonne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/palo-alto-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/bassano-del-grappa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/cuneo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/arashiyama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/boulder/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/costa-mesa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/reno/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/san-antonio-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/spring-valley-us-nevada/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/akashi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/nimes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/amagasaki/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/kotari/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/zoliborz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/flagstaff-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/criciuma/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/bayonne-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/paris-12-reuilly/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/bedford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/newport-gb-wales/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/parma-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/osasco/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/paris-14-observatoire/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/quimper/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/kasugai/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/kochi-jp-kochi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/ferrol/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/lucca/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/takamatsu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/bemowo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/charleston-us-south-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/uberaba/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/erfurt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/salamanca-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/courbevoie/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/juan-les-pins/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/milton-keynes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/wigston-magna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/ancona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/bollate/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/higashiosaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/naha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/nara-shi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/otsu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/takaishi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/tokorozawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/yotsukaido/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/youkaichi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/spijkenisse/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/bienczyce/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/tychy/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/alexandria-us-virginia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/leverkusen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/santiago-de-compostela/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/toledo-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/torre-del-mar/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/torrelavega/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/rapallo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/chofu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/fukui-shi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/hamamatsu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/minamirinkan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/lake-forest-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/mainz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/torrent/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/puteaux/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/swindon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/thornton-cleveleys/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/pozzuoli/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/isehara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/narashino/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/narita/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/sakurai/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/wako/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/yao-jp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/kolobrzeg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/konin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/atlantic-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/chula-vista/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/lubeck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/alcobendas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/manresa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/mislata/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/palencia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/segovia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/beauchamp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/clermont-ferrand/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/orange-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/reze/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/great-yarmouth/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/maidstone/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/northampton-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/warrington-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/izumi-jp-osaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/nisshin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/odawara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/tomiya/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/bellingham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/jacksonville-us-florida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/parole/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/benidorm/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/castello-de-la-plana/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/chadderton/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/wallsend/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/eugene/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/raleigh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/salem-us-oregon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/calp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/ibiza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/orihuela/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/worcester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/suita/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/sopot/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/columbia-us-south-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/tacoma/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/tustin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/virginia-beach/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/marne-la-vallee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/musashino/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/nagareyama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/salt-lake-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/mairena-del-aljarafe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/paterna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/lissone/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/rovereto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/matsuyama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/bielsko-biala/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/torun/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/cergy/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/ashford-gb-england-kent/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/paisley/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/sale-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/warabi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /de/areas/potsdam-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/la-rochelle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/areas/tarbes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/irun/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/vicenza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /de/outdoors/peaks/naturschutzgebiet-arnspitze-w1028498229/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/brisbane/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/diyarbakir/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/adelaide-au/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/destinations/region/阿蘇くじゅう国立公園-r9394106/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/sacramento-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/sendai-jp-miyagi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/chiba-jp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/kumamoto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/ulm/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/zutphen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/siracusa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/barletta/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lons-le-saunier/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/chateaubriant/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/breda/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/s-hertogenbosch/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/bergamo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/rimini/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lourdes-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/birkenhead/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/toulon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/pantin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/rennes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/shizuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/alba/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/solvang/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/eindhoven/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/inglewood/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/alcorcon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/carcassonne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/guadalajara-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/essen-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/urbana-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/zeist/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/whitby-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/hamamatsu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/exeter-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/theatre/kawasaki-jp-kanagawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/savona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/derby-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/kingston-upon-hull/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/hereford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/kobe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/ashiya-jp-hyogo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/kita-jp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/barnsley/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/toyonaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/naha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/minato-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/park/fukuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/brest-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/theatre/okayama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/leganes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/aachen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/pavia-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/perpignan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/newport-gb-england-isle-of-wight/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/como/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/berkeley-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/amelia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/ota-jp-tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/bruchsal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/digoin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/little-falls-us-minnesota/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/tomelloso/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/a-coruna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/lelystad/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/siegen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/stratford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/aix-en-provence/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/park/hoboken-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/gotha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bremervorde/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/soja/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/long-beach-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/ann-arbor/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/oakland-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/indianapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/sioux-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/chattanooga/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/new-bedford/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/xanten/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/la-linea-de-la-concepcion/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/nuremberg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/bordeaux/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/giessen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/la-roche-sur-yon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/naples-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/regensburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/siracusa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/monte-sant-angelo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/amiens/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/brescia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/mestre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/limoux/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/birkenhead/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/strasbourg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/freiburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/arlington-us-virginia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/breda/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/portland-us-oregon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/tarragona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/eindhoven/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/lyon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/san-antonio-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/tarragona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/mannheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/rochester-us-minnesota/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/montelimar/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/saint-etienne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bayonne-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/toulon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/tagajo-shi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/draguignan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/fort-lee-us-new-jersey/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/darmstadt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/hannover/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/augsburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/utica/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/le-creusot/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/ales/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/honfleur/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/haarlem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/auxerre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/bielefeld/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/koblenz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/lubeck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/osnabruck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/sevilla-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/tarbes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/swindon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/leeds-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/rovereto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/strasbourg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/ciudad-lineal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/avila/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/arnhem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/trento-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bethlehem-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/trento-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/park/okayama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/mansfield-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/islington/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cambridge-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/paris-18-buttes-montmartre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/santa-monica-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/matera/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/paris-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/park/hamura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/angers/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/nantes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/nice/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/reutlingen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/altenburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/frankfurt-am-main/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/grenoble/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/bonn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cambrai/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/lille-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/okayama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/figeac/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/asnieres-sur-seine/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/rueil-malmaison/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lille-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/albuquerque/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/valencia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/le-havre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/nimes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/fecamp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/chambery/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/boulogne-billancourt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/versailles-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/marcq-en-baroeul/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/angers/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/tours/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/orvieto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/metz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/clermont-ferrand/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/salem-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/versailles-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/caluire-et-cuire/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/kansas-city-us-missouri/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/metz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/comacchio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/verona-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/monza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/toledo-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/gijon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/valladolid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/malaga-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/varese/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/marostica/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/la-spezia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/chioggia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/benevento/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/nuoro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/siena/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/trapani/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/barletta/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/savona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/pistoia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/perugia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/asti/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/bolzano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/siracusa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/la-spezia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/thousand-oaks/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/hiroshima/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/wiesbaden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/aix-en-provence/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/vandoeuvre-les-nancy/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/kanazawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/groningen-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/montelimar/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/worcester-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/pontarlier/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/troyes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/flensburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/magdeburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/areas/okayama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/albany-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/amarillo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/augsburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cincinnati/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/lowell-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/melilla/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/leeuwarden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/boise/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cody/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/buffalo-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/greensboro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/daly-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/charleston-us-south-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/finchley/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/oklahoma-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/springfield-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/sacramento-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/theatre/urayasu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/springfield-us-missouri/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/worcester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/fort-lee-us-new-jersey/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/brookline/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/gorizia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/foligno/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/corleone/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/viterbo-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/imola/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/alessandria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/mondovi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/novara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/prato/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/modica/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/latina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/forli/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/terni/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/spoleto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/poggio-a-caiano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/susa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/ventimiglia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/lawrence-us-kansas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/alcala-de-henares/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/theatre/wabash/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/cartagena-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/padua-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/leon-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/torrejon-de-ardoz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cadiz-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/belfast-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/tsuruga/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/theatre/paderborn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/villejuif/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/tourcoing/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/duluth-us-minnesota/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/dallas-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/hoboken-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/austin-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/baton-rouge/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/plymouth-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/monterey/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/jacksonville-us-florida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/fayetteville-us-north-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/leeds-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/katsushika/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/ventura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/barstow/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/orlando/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/charlottesville/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/union-city-us-new-jersey/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/park/raleigh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/pasadena-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/croydon-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /it/places/museum/matsuyama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/san-jose-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/saratoga-springs-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/buffalo-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/pittsburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/marietta-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/portsmouth-us-new-hampshire/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/miltenberg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/schwabisch-hall/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/frankfurt-oder/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/neubrandenburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/goslar/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/ludwigshafen-am-rhein/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/zittau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/houston-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/portsmouth-us-new-hampshire/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/rochester-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/atsugi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/sioux-falls/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/austin-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/sneek/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/bari-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/newport-gb-wales/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/williamsport/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/sant-adria-de-besos/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/wichita-falls/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/dusseldorf/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/boston-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/palermo-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/zaragoza-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/vicenza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/miami-us-florida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/nashville-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/portoferraio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/s-hertogenbosch/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bayonne-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/la-rochelle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/cambridge-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/santiago-de-compostela/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/springfield-us-illinois/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |

## 6. QA at scale

- rows checked: 422,825, distinct URLs 422,825

| check | count |
| --- | --- |
| title_over_65_chars | 43,202 |
| meta_over_165_chars | 7,622 |
| title_under_15_chars | 41 |
| duplicate_title_exact | 0 |
| duplicate_title_same_tokens | 66 |
| destination_rows | 16,165 |
| destination_rows_with_no_locale_specific_fact | 0 |
| uniqueness_reason_shared_with_another_candidate | 5 |
| templates_with_repeated_entities | 0 |
| orphan_pages | 79 |
| top_level_pages_whose_parent_is_the_locale_home | 0 |
| intent_owners_claimed_by_more_than_one_url | 0 |
| urls_sharing_a_cannibalization_key | 0 |
| locale_mismatch_between_url_and_row | 0 |
| entity_names_needing_a_disambiguator_in_the_title | 6,393 |
| same_entity_id_under_two_names | 0 |
| candidates_with_no_usable_source | 0 |
| kept_rows_with_a_rejecting_localisation_class | 0 |
| urls_that_collide_once_diacritics_are_folded | 0 |
| urls_containing_a_latin_character_with_a_diacritic | 0 |
| duplicate_canonicals | 0 |
| duplicate_meta_within_a_market | 2 |
| duplicate_h1_within_a_market | 2 |
| declared_parent_is_not_a_valid_parent | 0 |
| declared_parent_is_valid_but_not_a_path_prefix | 34,513 |
| family_locale_cells_failing_the_usefulness_test | 0 |

- A per-page target query is not recorded in the manifest, so a query-level competition test cannot be run from it. The three keyword fields it does carry are family-level: they name the measurement that proved the family in a market, not the page target.

- title length: min 12, max 207, mean 44.3

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

422,825 candidates survive the gates. The target is 1,000,000.

The gap is not a shortage of raw rows. It is the gates, and each one was added for a reason that a measurement or a SERP showed:

- An area page needs the area to be a NAMED entity. Requiring a polygon, a population, a Wikidata item or a Wikipedia article cut the usable place set by about two thirds. The Kreuzberg probe validated neighbourhood demand for a famous area and says nothing about an unnamed suburb.
- A POI belongs to exactly one area. Letting every covering extent claim it produced four times as many area pages, and they would have been near-duplicate lists of the same venues on adjacent neighbourhood pages.
- Modifier pages are gated on city size, because every measured keyword for them named a large city.
- An area page needs its parent city page to exist, or it is an orphan by construction.
- Individual entity pages are allowed only where a third party can rank. The SERP for a named hospital, university or station belongs to that institution.

Raising the number to one million from here would mean removing one of those gates. Each one is written down with the measurement behind it so that decision can be made deliberately rather than by accident, and so it can be reversed if a later measurement disagrees. What this pass will not do is reach the number by generating pages the measurements say nobody searches for.


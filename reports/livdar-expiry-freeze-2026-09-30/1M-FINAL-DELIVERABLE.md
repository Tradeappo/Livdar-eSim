# Livdar candidate inventory: the final state of this pass

Built 2026-10-08. Every number below is read from a generated file, not retyped, so this report and the inventory cannot disagree.

## 1. The number

- FINAL DISTINCT VALID CANDIDATES: **877,462**
- target: 1,000,000
- shortfall: **122,538** (87.7 per cent of target)
- rejected and kept visible: 807,221

The target was not reached. The rest of this report is about why, which of the gaps are closable and at what cost, and what was built instead. No row was added to move this number: every gate that fired is listed in section 5 with its count.

## 2. The funnel, stage by stage

| stage | count | what happened |
| --- | --- | --- |
| generated before gates | 0 | every family crossed with every entity it has, in every market scoped to it |
| passed the uniqueness and SERP gate | 0 | a candidate with no uniqueness_reason, or in a SERP archetype measured as closed, is rejected here |
| after exact dedupe | 1,392,582 | same url_pattern |
| after semantic dedupe | 1,392,580 | same market, family, template signature and entity |
| FINAL DISTINCT | 877,462 | what is in the manifest |

## 3. Where the candidates are

### By market

| market | candidates |
| --- | --- |
| en-GB | 298,571 |
| en-US | 116,468 |
| de-DE | 105,331 |
| fr-FR | 88,530 |
| es-ES | 44,631 |
| ja-JP | 39,969 |
| pl-PL | 34,350 |
| nl-NL | 31,020 |
| it-IT | 27,520 |
| pt-BR | 22,201 |
| nb-NO | 15,572 |
| tr-TR | 13,487 |
| es-MX | 12,161 |
| fi-FI | 10,663 |
| en-AU | 8,244 |
| da-DK | 7,944 |
| zh-Hant-TW | 800 |

### By surface

| surface | candidates |
| --- | --- |
| transport | 440,879 |
| places | 186,775 |
| outdoors | 73,116 |
| areas | 53,582 |
| stay | 39,618 |
| climate | 39,219 |
| move | 15,587 |
| pulse | 15,243 |
| work | 4,971 |
| poi | 2,986 |
| tools | 1,594 |
| destinations | 1,557 |
| safety | 1,093 |
| sport | 1,016 |
| travel | 226 |

### By readiness

| status | candidates |
| --- | --- |
| TRANSPORT_PAIR | 436,365 |
| POI_AGGREGATION | 268,433 |
| MISSING_DATA | 71,001 |
| BLOCKED_BY_LICENCE | 45,500 |
| EXPERIMENT_ONLY | 40,811 |
| NOT_IMPLEMENTED | 15,056 |
| VISA_POLICY_CELL | 226 |
| VALIDATED | 50 |
| PROMISING | 20 |

### By source readiness

| source_status | candidates |
| --- | --- |
| SOURCE_AVAILABLE | 780,458 |
| LICENCE_REQUIRED | 45,500 |
| READY_NOW | 40,907 |
| FEED_REQUIRED | 10,597 |

### By SERP feasibility

| serp_feasibility | candidates |
| --- | --- |
| viable | 618,141 |
| unsampled_needs_serp_check | 125,910 |
| strong_opportunity | 55,068 |
| competitive | 52,885 |
| poor_fit | 25,458 |

### By licence

| licence_status | candidates |
| --- | --- |
| MIXED_OPEN_ATTRIBUTION_REQUIRED | 422,155 |
| ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED | 268,880 |
| OK | 126,938 |
| LICENCE_REQUIRED | 45,500 |
| CC0_PLUS_ATTRIBUTION_REQUIRED | 11,222 |
| CC0_NO_CONDITIONS | 2,157 |
| PUBLIC_DOMAIN_PLUS_ATTRIBUTION_REQUIRED | 384 |
| OGL_V3_ATTRIBUTION_REQUIRED | 226 |

### By demand evidence for the market the page targets

A family proven in other markets but unmeasured in this one scores 30 rather than zero, because one keyword validates a cluster. That is not the same as measured demand, so the distinction is a field rather than something to infer from a score.

| market_demand_evidence | candidates |
| --- | --- |
| shape_measured_2026_10_07_open_serp | 436,828 |
| shape_measured_2026_10_01 | 268,196 |
| measured_in_this_market | 166,063 |
| family_measured_elsewhere | 6,375 |

### The twenty largest families

| family | candidates |
| --- | --- |
| transport.city-pair-transit | 422,155 |
| weather.city-month | 38,970 |
| activities.city-things-to-do | 37,637 |
| stay.city-type | 25,695 |
| outdoors.hiking-trail | 23,463 |
| places.area-cuisine | 22,348 |
| places.area-restaurant | 15,751 |
| places.city-cuisine | 13,814 |
| outdoors.bicycle-trail | 12,175 |
| outdoors.peak | 11,848 |
| transport.city-pair-rail | 11,222 |
| places.area-pharmacy | 10,855 |
| places.city-category | 10,751 |
| places.area-fast_food | 10,741 |
| places.area-cafe | 8,764 |
| places.area-opening | 7,787 |
| places.area-supermarket | 7,495 |
| events.city-type | 6,680 |
| events.city-calendar | 6,680 |
| places.city-restaurant | 6,097 |

## 3b. The multilingual breakdown

A second language is not free inventory. Every row whose language is not the language of the country it describes has to show its own reason to exist, and the default answer is no. The table below separates what each market kept from what it was refused and why.

| market | raw candidates | final valid | no uniqueness basis | closed SERP | translation only | local intent missing | demand not for this destination | local data missing | other |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| en-US | 318,940 | 116,468 | 5,567 | 6,058 | 6,732 | 84,826 | 32,210 | 0 | 67,079 |
| en-GB | 325,171 | 298,571 | 1,307 | 240 | 0 | 16,481 | 5,073 | 0 | 3,499 |
| de-DE | 156,516 | 105,331 | 8,248 | 195 | 2,532 | 8,470 | 24,573 | 0 | 7,167 |
| ja-JP | 95,014 | 39,969 | 3,058 | 553 | 34,865 | 4,956 | 547 | 248 | 10,818 |
| zh-Hant-TW | 5,898 | 800 | 570 | 77 | 430 | 48 | 3,812 | 0 | 161 |
| it-IT | 78,032 | 27,520 | 9,433 | 133 | 14,913 | 2,445 | 3,599 | 0 | 19,989 |
| es-ES | 134,629 | 44,631 | 4,976 | 150 | 34,364 | 7,932 | 2,676 | 0 | 39,900 |
| fr-FR | 165,405 | 88,530 | 6,555 | 143 | 41,779 | 10,417 | 2,251 | 248 | 15,482 |
| nl-NL | 100,452 | 31,020 | 4,993 | 57 | 40,966 | 9,747 | 794 | 0 | 12,875 |
| pl-PL | 127,163 | 34,350 | 11,680 | 101 | 40,740 | 6,797 | 796 | 0 | 32,699 |
| pt-BR | 80,492 | 22,201 | 3,993 | 677 | 35,122 | 4,353 | 1,055 | 0 | 13,091 |
| **all 11** | **1,587,712** | **809,391** | | | | | | | |

Romanian is absent from the table on purpose. No Romanian Atlas page was added in this pass, as instructed.

### Localisation class of every row that survived

| localization_class | candidates |
| --- | --- |
| NATIVE_LOCALE | 805,049 |
| VALID_LOCALIZATION | 72,413 |

- flagged LOCAL_SERP_UNVERIFIED: 125,910. These are kept, not rejected. Absence of SERP evidence is not evidence of a poor fit, and treating it as one already mislabelled 62 per cent of this inventory once.

### Top families per market

| market | strongest families |
| --- | --- |
| en-US | transport.city-pair-rail (11,222), activities.city-things-to-do (9,894), weather.city-month (9,894), places.city-category (6,058) |
| en-GB | transport.city-pair-transit (271,805), places.area-cuisine (2,142), places.area-fast_food (1,548), outdoors.hiking-trail (1,442) |
| de-DE | transport.city-pair-transit (56,370), stay.city-type (3,786), outdoors.peak (2,420), places.city-category (2,405) |
| ja-JP | places.area-cuisine (4,123), places.area-restaurant (2,943), activities.city-things-to-do (2,544), weather.city-month (2,544) |
| zh-Hant-TW | activities.city-things-to-do (51), places.city-category (40), weather.city-month (40), health.city (40) |
| it-IT | outdoors.peak (1,945), places.area-cuisine (1,739), places.area-restaurant (1,492), transport.city-pair-transit (1,211) |
| es-ES | weather.city-month (11,936), outdoors.hiking-trail (4,342), transport.city-pair-transit (3,262), stay.city-type (3,207) |
| fr-FR | transport.city-pair-transit (33,007), outdoors.hiking-trail (9,237), activities.city-things-to-do (3,682), weather.city-month (3,680) |
| nl-NL | transport.city-pair-transit (6,685), activities.city-things-to-do (3,029), weather.city-month (3,029), stay.city-type (3,029) |
| pl-PL | transport.city-pair-transit (10,625), weather.city-month (2,765), outdoors.bicycle-trail (1,983), outdoors.hiking-trail (1,879) |
| pt-BR | weather.city-month (3,040), activities.city-things-to-do (931), stay.city-type (922), cost-of-living.city (754) |

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

- OSM POI files on disk: 39 (poi-AE.jsonl.gz, poi-AR.jsonl.gz, poi-AT.jsonl.gz, poi-AU.jsonl.gz, poi-BE.jsonl.gz, poi-BR.jsonl.gz, poi-CH.jsonl.gz, poi-CZ.jsonl.gz, poi-DE.jsonl.gz, poi-DK.jsonl.gz, poi-EG.jsonl.gz, poi-ES.jsonl.gz, poi-FR.jsonl.gz, poi-GB.jsonl.gz, poi-ID.jsonl.gz, poi-IE.jsonl.gz, poi-IN.jsonl.gz, poi-IT.jsonl.gz, poi-JP.jsonl.gz, poi-KH.jsonl.gz, poi-LU.jsonl.gz, poi-MA.jsonl.gz, poi-MX.jsonl.gz, poi-MY.jsonl.gz, poi-NL.jsonl.gz, poi-PH.jsonl.gz, poi-PL.jsonl.gz, poi-PT.jsonl.gz, poi-SE.jsonl.gz, poi-SG.jsonl.gz, poi-TN.jsonl.gz, poi-TR.jsonl.gz, poi-TW-health.jsonl.gz, poi-UA.jsonl.gz, poi-US-us-midwest.jsonl.gz, poi-US-us-northeast.jsonl.gz, poi-US-us-south.jsonl.gz, poi-US-us-west.jsonl.gz, poi-ZA.jsonl.gz)
- OSM place files with geometry: 38 (places-AE.jsonl.gz, places-AR.jsonl.gz, places-AT.jsonl.gz, places-AU.jsonl.gz, places-BE.jsonl.gz, places-BR.jsonl.gz, places-CH.jsonl.gz, places-CZ.jsonl.gz, places-DE.jsonl.gz, places-DK.jsonl.gz, places-EG.jsonl.gz, places-ES.jsonl.gz, places-FR.jsonl.gz, places-GB.jsonl.gz, places-ID.jsonl.gz, places-IE.jsonl.gz, places-IN.jsonl.gz, places-IT.jsonl.gz, places-JP.jsonl.gz, places-KH.jsonl.gz, places-MA.jsonl.gz, places-MX.jsonl.gz, places-MY.jsonl.gz, places-NL.jsonl.gz, places-PH.jsonl.gz, places-PL.jsonl.gz, places-PT.jsonl.gz, places-SE.jsonl.gz, places-SG.jsonl.gz, places-TN.jsonl.gz, places-TR.jsonl.gz, places-UA.jsonl.gz, places-US-us-midwest.jsonl.gz, places-US-us-northeast.jsonl.gz, places-US-us-south.jsonl.gz, places-US-us-west.jsonl.gz, places-ZA.jsonl.gz, places-luxembourg.jsonl.gz)
- POI read: 6,724,773, of which 1,341,404 carried an addr:city tag and 3,768,875 were attributed spatially against the 31,715-city gazetteer; 1,613,757 fell outside every city radius and were dropped
- named places loaded: 579,112, of which 91,665 passed the entity gates
- POI assigned to an area by polygon containment: 497,710; by documented proximity to a place node: 2,290,647
- aggregation candidates: 501,887 ({'city_category': 208496, 'area_category': 93218, 'city_cuisine': 94161, 'area_cuisine': 23030, 'city_attribute': 27576, 'area_attribute': 5691, 'city_opening': 31127, 'area_opening': 8007, 'city_sport': 1457, 'area_parent': 4038, 'city_areas_hub': 2316, 'notable_entity': 2770})
- Wikidata entities loaded: 195,490, candidates 5,971, deduped against OSM by {'qid': 13923, 'name_and_position': 4980}
- Pulse entities normalised from four providers: {'national': 1081, 'regional': 623, 'school': 1502, 'long_weekends': 687, 'bridge_days': 233, 'long_weekends_subdivision': 3539, 'bridge_days_subdivision': 1052, 'bridge_plans': 348}

## 5. Every gate that fired, with its count

Nothing is hidden. A candidate rejected here is in LIVDAR-1M-REJECTED-CANDIDATES.csv.gz with its reason.

### Aggregation gates

| gate | rejected |
| --- | --- |
| entity_not_notable | 6,709,475 |
| destination_fanout_area_itself_carries_no_mark_in_this_language | 619,721 |
| place_not_a_named_entity | 262,774 |
| below_min_count | 208,945 |
| area_cuisine_below_min_count | 192,170 |
| area_class_not_a_list_intent | 179,523 |
| class_not_a_list_intent | 158,334 |
| cuisine_below_min_count | 157,004 |
| area_parent_city_page_not_accepted | 147,368 |
| place_no_parent_city | 131,878 |
| area_below_min_count | 111,061 |
| area_opening_below_min_count | 90,499 |
| place_no_market_for_country_neighbourhood_level_stays_home_market_only | 83,349 |
| attr_below_min_count | 73,818 |
| area_attr_below_min_count | 71,886 |
| opening_below_min_count | 70,521 |
| no_market_and_no_destination_evidence_for_country | 64,733 |
| entries_too_thin | 29,086 |
| area_parent_too_narrow | 26,455 |
| area_entries_too_thin | 23,705 |
| opening_city_below_measured_demand_floor | 14,070 |
| area_opening_parent_page_not_accepted | 13,973 |
| destination_fanout_entity_itself_carries_no_mark_in_this_language | 13,530 |
| destination_fanout_no_city_mark_in_any_language | 11,797 |
| cuisine_city_below_measured_demand_floor | 10,734 |
| area_cuisine_parent_page_not_accepted | 10,557 |
| sport_below_min_count | 8,631 |
| notable_but_data_thin | 8,358 |
| attr_city_below_measured_demand_floor | 7,902 |
| area_attr_parent_page_not_accepted | 7,213 |
| place_ambiguous_duplicate_name_in_city | 6,769 |
| area_opening_area_not_a_searched_entity | 6,501 |
| area_parent_entity_too_thin | 4,855 |
| area_attr_area_not_a_searched_entity | 4,074 |
| area_parent_city_has_no_areas_hub | 3,272 |
| place_name_not_usable | 2,609 |
| area_duplicates_city_list | 2,509 |
| area_class_measured_at_or_near_zero_in_this_market | 2,052 |
| notable_entity_has_no_parent_page | 1,514 |
| cuisine_parent_restaurant_list_not_accepted | 750 |
| cuisine_token_has_no_measured_demand_meat | 719 |
| cuisine_token_has_no_measured_demand_cuban | 705 |
| cuisine_token_has_no_measured_demand_chocolate | 684 |
| cuisine_token_has_no_measured_demand_bar_and_grill | 671 |
| cuisine_token_has_no_measured_demand_pub | 669 |
| cuisine_token_has_no_measured_demand_georgian | 662 |
| cuisine_token_has_no_measured_demand_jamaican | 655 |
| cuisine_token_has_no_measured_demand_syrian | 649 |
| cuisine_token_has_no_measured_demand_empanada | 631 |
| cuisine_token_has_no_measured_demand_southern | 627 |
| cuisine_entries_too_thin | 602 |
| cuisine_token_has_no_measured_demand_shawarma | 583 |
| cuisine_token_has_no_measured_demand_yakiniku | 582 |
| cuisine_token_has_no_measured_demand_afghan | 556 |
| cuisine_token_has_no_measured_demand_hotpot | 547 |
| cuisine_token_has_no_measured_demand_snackbar | 543 |
| cuisine_token_has_no_measured_demand_wine | 537 |
| cuisine_token_has_no_measured_demand_takoyaki | 517 |
| cuisine_token_has_no_measured_demand_yakitori | 506 |
| cuisine_token_has_no_measured_demand_danish | 499 |
| cuisine_token_has_no_measured_demand_colombian | 489 |
| cuisine_token_has_no_measured_demand_teahouse | 485 |
| cuisine_token_has_no_measured_demand_cajun | 469 |
| cuisine_token_has_no_measured_demand_dumplings | 467 |
| cuisine_token_has_no_measured_demand_swedish | 459 |
| cuisine_token_has_no_measured_demand_cantonese | 454 |
| cuisine_token_has_no_measured_demand_okonomiyaki | 452 |
| cuisine_token_has_no_measured_demand_pie | 451 |
| attr_parent_city_page_not_accepted | 449 |
| cuisine_token_has_no_measured_demand_gyros | 448 |
| cuisine_token_has_no_measured_demand_belgian | 443 |
| cuisine_token_has_no_measured_demand_salvadoran | 441 |
| cuisine_token_has_no_measured_demand_russian | 430 |
| area_cuisine_duplicates_city_list | 429 |
| cuisine_token_has_no_measured_demand_croatian | 410 |
| cuisine_token_has_no_measured_demand_couscous | 400 |
| cuisine_token_has_no_measured_demand_pita | 391 |
| cuisine_token_has_no_measured_demand_malay | 390 |
| cuisine_token_has_no_measured_demand_venezuelan | 389 |
| cuisine_token_has_no_measured_demand_surinamese | 334 |
| cuisine_token_has_no_measured_demand_frozen_yogurt | 333 |
| cuisine_token_has_no_measured_demand_teppanyaki | 321 |
| cuisine_token_has_no_measured_demand_beer | 317 |
| cuisine_token_has_no_measured_demand_organic | 310 |
| cuisine_token_has_no_measured_demand_mongolian_grill | 309 |
| cuisine_token_has_no_measured_demand_ukrainian | 306 |
| cuisine_token_has_no_measured_demand_tibetan | 305 |
| cuisine_token_has_no_measured_demand_burrito | 302 |
| cuisine_token_has_no_measured_demand_pastel | 299 |
| cuisine_token_has_no_measured_demand_snacks | 297 |
| cuisine_token_has_no_measured_demand_sri_lankan | 291 |
| areas_hub_too_few_areas | 290 |
| cuisine_token_has_no_measured_demand_drinks | 288 |
| cuisine_token_has_no_measured_demand_basque | 283 |
| cuisine_token_has_no_measured_demand_panini | 276 |
| cuisine_token_has_no_measured_demand_english | 273 |
| cuisine_token_has_no_measured_demand_milkshake | 267 |
| cuisine_token_has_no_measured_demand_hotdog | 266 |
| cuisine_token_has_no_measured_demand_potato | 261 |
| cuisine_token_has_no_measured_demand_health_food | 259 |
| cuisine_token_has_no_measured_demand_catalan | 258 |
| cuisine_token_has_no_measured_demand_egyptian | 255 |
| cuisine_token_has_no_measured_demand_fondue | 250 |
| cuisine_token_has_no_measured_demand_swiss | 248 |
| cuisine_token_has_no_measured_demand_izakaya | 248 |
| cuisine_token_has_no_measured_demand_bar | 248 |
| cuisine_token_has_no_measured_demand_cambodian | 237 |
| cuisine_token_has_no_measured_demand_bread | 230 |
| cuisine_token_has_no_measured_demand_cookie | 229 |
| cuisine_token_has_no_measured_demand_smørrebrød | 228 |
| cuisine_token_has_no_measured_demand_bangladeshi | 225 |
| cuisine_token_has_no_measured_demand_mamak | 215 |
| cuisine_token_has_no_measured_demand_bowl | 212 |
| cuisine_token_has_no_measured_demand_teriyaki | 207 |
| cuisine_token_has_no_measured_demand_dominican | 203 |
| cuisine_token_has_no_measured_demand_australian | 202 |
| cuisine_token_has_no_measured_demand_cookies | 202 |
| cuisine_token_has_no_measured_demand_soul_food | 197 |
| cuisine_token_has_no_measured_demand_lao | 195 |
| cuisine_token_has_no_measured_demand_wrap | 193 |
| cuisine_token_has_no_measured_demand_dim_sum | 192 |
| cuisine_token_has_no_measured_demand_singaporean | 188 |
| cuisine_token_has_no_measured_demand_dutch | 187 |
| area_opening_parent_area_page_not_accepted | 186 |
| cuisine_token_has_no_measured_demand_hot_pot | 180 |
| cuisine_token_has_no_measured_demand_tunisian | 178 |
| cuisine_token_has_no_measured_demand_beef | 174 |
| cuisine_token_has_no_measured_demand_dumpling | 174 |
| cuisine_token_has_no_measured_demand_hungarian | 170 |
| cuisine_token_has_no_measured_demand_cocktails | 167 |
| cuisine_token_has_no_measured_demand_creole | 167 |
| cuisine_token_has_no_measured_demand_galician | 164 |
| cuisine_token_has_no_measured_demand_cafetaria | 163 |
| opening_parent_city_page_not_accepted | 162 |
| cuisine_token_has_no_measured_demand_chips | 161 |
| cuisine_token_has_no_measured_demand_healthy | 161 |
| cuisine_token_has_no_measured_demand_armenian | 158 |
| cuisine_token_has_no_measured_demand_ラーメン | 154 |
| cuisine_token_has_no_measured_demand_schnitzel | 153 |
| cuisine_token_has_no_measured_demand_pierogi | 152 |
| cuisine_token_has_no_measured_demand_bento | 150 |
| cuisine_token_has_no_measured_demand_new_american | 149 |
| cuisine_token_has_no_measured_demand_czech | 146 |
| cuisine_token_has_no_measured_demand_pork | 146 |
| cuisine_token_has_no_measured_demand_unagi | 146 |
| cuisine_token_has_no_measured_demand_jewish | 145 |
| cuisine_token_has_no_measured_demand_mongolian | 143 |
| cuisine_token_has_no_measured_demand_rice | 140 |
| cuisine_token_has_no_measured_demand_pide | 138 |
| cuisine_token_has_no_measured_demand_sardinian | 138 |
| cuisine_token_has_no_measured_demand_お好み焼き | 137 |
| cuisine_token_has_no_measured_demand_eritrean | 136 |
| cuisine_token_has_no_measured_demand_uzbek | 134 |
| cuisine_token_has_no_measured_demand_hamburger | 133 |
| cuisine_token_has_no_measured_demand_ecuadorian | 131 |
| cuisine_token_has_no_measured_demand_tonkatsu | 131 |
| cuisine_token_has_no_measured_demand_south_indian | 129 |
| cuisine_token_has_no_measured_demand_cheese | 126 |
| cuisine_token_has_no_measured_demand_tea_shop | 123 |
| cuisine_token_has_no_measured_demand_toast | 122 |
| cuisine_token_has_no_measured_demand_sicilian | 122 |
| cuisine_token_has_no_measured_demand_puerto_rican | 122 |
| cuisine_token_has_no_measured_demand_smoothies | 121 |
| cuisine_token_has_no_measured_demand_taco | 121 |
| cuisine_token_has_no_measured_demand_popcorn | 121 |
| cuisine_token_has_no_measured_demand_yemeni | 120 |
| cuisine_token_has_no_measured_demand_wok | 120 |
| cuisine_token_has_no_measured_demand_sichuan | 120 |
| area_attr_parent_area_page_not_accepted | 118 |
| cuisine_token_has_no_measured_demand_israeli | 116 |
| cuisine_token_has_no_measured_demand_gourmet | 112 |
| cuisine_token_has_no_measured_demand_crepes | 111 |
| cuisine_token_has_no_measured_demand_rotisserie | 111 |
| cuisine_token_has_no_measured_demand_guatemalan | 109 |
| cuisine_token_has_no_measured_demand_chili | 108 |
| cuisine_token_has_no_measured_demand_burmese | 107 |
| sport_parent_city_page_not_accepted | 105 |
| cuisine_token_has_no_measured_demand_palestinian | 105 |
| cuisine_token_has_no_measured_demand_hibachi | 104 |
| cuisine_token_has_no_measured_demand_nepali | 103 |
| cuisine_token_has_no_measured_demand_javanese | 103 |
| cuisine_token_has_no_measured_demand_jiro | 102 |
| cuisine_token_has_no_measured_demand_eclectic | 101 |
| cuisine_token_has_no_measured_demand_romanian | 99 |
| cuisine_token_has_no_measured_demand_cafeteria | 99 |
| cuisine_token_has_no_measured_demand_calzone | 99 |
| cuisine_token_has_no_measured_demand_padang | 99 |
| cuisine_token_has_no_measured_demand_matcha | 98 |
| cuisine_token_has_no_measured_demand_senegalese | 97 |
| cuisine_token_has_no_measured_demand_gastropub | 96 |
| cuisine_token_has_no_measured_demand_kurdish | 96 |
| cuisine_token_has_no_measured_demand_churrasco | 96 |
| cuisine_token_has_no_measured_demand_とんかつ | 93 |
| cuisine_token_has_no_measured_demand_döner | 92 |
| cuisine_token_has_no_measured_demand_chicken_rice | 92 |
| cuisine_token_has_no_measured_demand_tortas | 92 |
| cuisine_token_has_no_measured_demand_baguette | 91 |
| cuisine_token_has_no_measured_demand_tapioca | 88 |
| cuisine_token_has_no_measured_demand_wraps | 87 |
| cuisine_token_has_no_measured_demand_asian_fusion | 87 |
| cuisine_token_has_no_measured_demand_gelato | 86 |
| cuisine_token_has_no_measured_demand_nigerian | 86 |
| cuisine_token_has_no_measured_demand_tempura | 86 |
| cuisine_token_has_no_measured_demand_pinsa | 84 |
| cuisine_token_has_no_measured_demand_doner | 83 |
| cuisine_token_has_no_measured_demand_uyghur | 82 |
| cuisine_token_has_no_measured_demand_cocktail | 82 |
| cuisine_token_has_no_measured_demand_pancakes | 81 |
| cuisine_token_has_no_measured_demand_たこ焼き | 81 |
| cuisine_token_has_no_measured_demand_dimsum | 80 |
| cuisine_token_has_no_measured_demand_escalope | 79 |
| cuisine_token_has_no_measured_demand_yes | 79 |
| cuisine_token_has_no_measured_demand_pho | 78 |
| cuisine_token_has_no_measured_demand_seasonal | 78 |
| cuisine_token_has_no_measured_demand_paella | 78 |
| cuisine_token_has_no_measured_demand_basque_ciderhouse | 78 |
| cuisine_token_has_no_measured_demand_scottish | 77 |
| cuisine_token_has_no_measured_demand_tarte_flambee | 76 |
| cuisine_token_has_no_measured_demand_bakso | 76 |
| cuisine_token_has_no_measured_demand_arabic | 74 |
| cuisine_token_has_no_measured_demand_dinner | 74 |
| cuisine_token_has_no_measured_demand_mineira | 74 |
| cuisine_token_has_no_measured_demand_カレー | 72 |
| cuisine_token_has_no_measured_demand_alsatian | 71 |
| cuisine_token_has_no_measured_demand_eel | 70 |
| cuisine_token_has_no_measured_demand_philippine | 70 |
| cuisine_token_has_no_measured_demand_scandinavian | 69 |
| cuisine_token_has_no_measured_demand_salgados | 69 |
| cuisine_token_has_no_measured_demand_うどん | 69 |
| cuisine_token_has_no_measured_demand_swabian | 68 |
| cuisine_token_has_no_measured_demand_corsican | 68 |
| cuisine_token_has_no_measured_demand_nordic | 68 |
| cuisine_token_has_no_measured_demand_bowls | 67 |
| cuisine_token_has_no_measured_demand_charcuterie | 67 |
| cuisine_token_has_no_measured_demand_yogurt | 66 |
| cuisine_token_has_no_measured_demand_hong_kong | 66 |
| cuisine_token_has_no_measured_demand_churros | 66 |
| cuisine_token_has_no_measured_demand_pasty | 66 |
| cuisine_token_has_no_measured_demand_うなぎ | 66 |
| place_polygon_implausibly_large | 65 |
| cuisine_token_has_no_measured_demand_canteen | 65 |
| cuisine_token_has_no_measured_demand_oyster | 65 |
| cuisine_token_has_no_measured_demand_honduran | 65 |
| cuisine_token_has_no_measured_demand_milk_tea | 65 |
| cuisine_token_has_no_measured_demand_burritos | 64 |
| cuisine_token_has_no_measured_demand_modern | 63 |
| cuisine_token_has_no_measured_demand_comfort_food | 63 |
| cuisine_token_has_no_measured_demand_zapiekanki | 63 |
| cuisine_token_has_no_measured_demand_porridge | 62 |
| cuisine_token_has_no_measured_demand_waffles | 62 |
| cuisine_token_has_no_measured_demand_café | 62 |
| cuisine_token_has_no_measured_demand_居酒屋 | 62 |
| area_opening_duplicates_city_list | 60 |
| cuisine_token_has_no_measured_demand_focaccia | 60 |
| cuisine_token_has_no_measured_demand_somali | 60 |
| cuisine_token_has_no_measured_demand_algerian | 60 |
| cuisine_token_has_no_measured_demand_daerahregional | 60 |
| cuisine_token_has_no_measured_demand_continental | 59 |
| cuisine_token_has_no_measured_demand_sfiha | 58 |
| cuisine_token_has_no_measured_demand_焼き鳥 | 58 |
| cuisine_token_has_no_measured_demand_ribs | 57 |
| cuisine_token_has_no_measured_demand_lahmacun | 57 |
| cuisine_token_has_no_measured_demand_pie_and_mash | 57 |
| cuisine_token_has_no_measured_demand_onigiri | 56 |
| cuisine_token_has_no_measured_demand_khmer | 56 |
| cuisine_token_has_no_measured_demand_carnitas | 56 |
| cuisine_token_has_no_measured_demand_francesinha | 56 |
| cuisine_token_has_no_measured_demand_shoarma | 55 |
| cuisine_token_has_no_measured_demand_californian | 54 |
| cuisine_token_has_no_measured_demand_new_mexican | 54 |
| cuisine_token_has_no_measured_demand_pastries | 51 |
| cuisine_token_has_no_measured_demand_soda | 51 |
| cuisine_token_has_no_measured_demand_gastronomique | 51 |
| cuisine_token_has_no_measured_demand_breton | 51 |
| cuisine_token_has_no_measured_demand_arepa | 50 |
| cuisine_token_has_no_measured_demand_haitian | 50 |
| cuisine_token_has_no_measured_demand_iraqi | 49 |
| cuisine_token_has_no_measured_demand_wine_bar | 49 |
| cuisine_token_has_no_measured_demand_asturian | 49 |
| cuisine_token_has_no_measured_demand_milkshakes | 48 |
| cuisine_token_has_no_measured_demand_cafe/diner | 48 |
| cuisine_token_has_no_measured_demand_salads | 48 |
| cuisine_token_has_no_measured_demand_alcohol | 48 |
| cuisine_token_has_no_measured_demand_valencian | 48 |
| cuisine_token_has_no_measured_demand_okinawan | 48 |
| cuisine_token_has_no_measured_demand_çiğköfte | 47 |
| cuisine_token_has_no_measured_demand_canadian | 47 |
| cuisine_token_has_no_measured_demand_satay | 47 |
| cuisine_token_has_no_measured_demand_corn_dog | 47 |
| cuisine_token_has_no_measured_demand_flammkuchen | 46 |
| cuisine_token_has_no_measured_demand_columbian | 46 |
| cuisine_token_has_no_measured_demand_tandoori | 46 |
| cuisine_token_has_no_measured_demand_gaucho | 46 |
| cuisine_token_has_no_measured_demand_bbq | 45 |
| cuisine_token_has_no_measured_demand_galette | 45 |
| cuisine_token_has_no_measured_demand_south_american | 45 |
| cuisine_token_has_no_measured_demand_serbian | 44 |
| cuisine_token_has_no_measured_demand_cupcake | 44 |
| cuisine_token_has_no_measured_demand_lanches | 44 |
| cuisine_token_has_no_measured_demand_nachos | 44 |
| cuisine_token_has_no_measured_demand_tuscan | 44 |
| cuisine_token_has_no_measured_demand_sweets | 43 |
| cuisine_token_has_no_measured_demand_pizzeria | 43 |
| cuisine_token_has_no_measured_demand_french_fries | 43 |
| cuisine_token_has_no_measured_demand_espresso | 43 |
| cuisine_token_has_no_measured_demand_cakes | 42 |
| cuisine_token_has_no_measured_demand_hongkong | 42 |
| cuisine_token_has_no_measured_demand_punjabi | 42 |
| cuisine_token_has_no_measured_demand_uruguayan | 42 |
| cuisine_token_has_no_measured_demand_yakisoba | 42 |
| cuisine_token_has_no_measured_demand_nicaraguan | 42 |
| cuisine_token_has_no_measured_demand_baked_potato | 41 |
| cuisine_token_has_no_measured_demand_chilean | 41 |
| cuisine_token_has_no_measured_demand_currywurst | 40 |
| cuisine_token_has_no_measured_demand_curry_rice | 40 |
| cuisine_token_has_no_measured_demand_tamales | 40 |
| cuisine_token_has_no_measured_demand_patisserie | 39 |
| cuisine_token_has_no_measured_demand_croissant | 39 |
| cuisine_token_has_no_measured_demand_small_plates | 39 |
| cuisine_token_has_no_measured_demand_crab | 39 |
| cuisine_token_has_no_measured_demand_takeaway | 38 |
| cuisine_token_has_no_measured_demand_bolivian | 38 |
| cuisine_token_has_no_measured_demand_naan | 38 |
| cuisine_token_has_no_measured_demand_petiscos | 38 |
| cuisine_token_has_no_measured_demand_himalayan | 38 |
| cuisine_token_has_no_measured_demand_rice_noodle | 38 |
| cuisine_token_has_no_measured_demand_cheesesteak | 38 |
| cuisine_token_has_no_measured_demand_5_e_5 | 38 |
| cuisine_token_has_no_measured_demand_steamed_eel_rice | 38 |
| cuisine_token_has_no_measured_demand_shaved_ice | 38 |
| cuisine_token_has_no_measured_demand_milktea | 38 |
| cuisine_token_has_no_measured_demand_bulgarian | 37 |
| cuisine_token_has_no_measured_demand_gyro | 37 |
| cuisine_token_has_no_measured_demand_quesadillas | 37 |
| cuisine_token_has_no_measured_demand_fruit | 37 |
| cuisine_token_has_no_measured_demand_boba | 36 |
| cuisine_token_has_no_measured_demand_karaage | 36 |
| cuisine_token_has_no_measured_demand_bocadillos | 36 |
| cuisine_token_has_no_measured_demand_meatball | 36 |
| cuisine_token_has_no_measured_demand_taqueria | 36 |
| cuisine_token_has_no_measured_demand_malatang | 35 |
| cuisine_token_has_no_measured_demand_sorvete | 35 |
| cuisine_token_has_no_measured_demand_baiana | 35 |
| cuisine_token_has_no_measured_demand_bengali | 35 |
| cuisine_token_has_no_measured_demand_latin | 35 |
| cuisine_token_has_no_measured_demand_tenpura | 35 |
| cuisine_token_has_no_measured_demand_steamboat | 35 |
| cuisine_token_has_no_measured_demand_bosnian | 34 |
| cuisine_token_has_no_measured_demand_neapolitan | 34 |
| cuisine_token_has_no_measured_demand_catering | 34 |
| cuisine_token_has_no_measured_demand_pancit_malabon | 34 |
| cuisine_token_has_no_measured_demand_eastern_european | 33 |
| cuisine_token_has_no_measured_demand_tofu | 33 |
| cuisine_token_has_no_measured_demand_pesce | 33 |
| cuisine_token_has_no_measured_demand_oden | 33 |
| cuisine_token_has_no_measured_demand_sashimi | 32 |
| cuisine_token_has_no_measured_demand_barbeque | 32 |
| cuisine_token_has_no_measured_demand_balinese | 32 |
| cuisine_token_has_no_measured_demand_maghrebi | 32 |
| cuisine_token_has_no_measured_demand_gastronomic | 32 |
| cuisine_token_has_no_measured_demand_west_african | 32 |
| cuisine_token_has_no_measured_demand_world | 32 |
| cuisine_token_has_no_measured_demand_coxinha | 32 |
| cuisine_token_has_no_measured_demand_doces | 32 |
| cuisine_token_has_no_measured_demand_craft_beer | 32 |
| cuisine_token_has_no_measured_demand_reunionese | 32 |
| cuisine_token_has_no_measured_demand_community_centre | 32 |
| cuisine_token_has_no_measured_demand_fried_rice | 32 |
| cuisine_token_has_no_measured_demand_soto | 32 |
| cuisine_token_has_no_measured_demand_tsukemen | 32 |
| cuisine_token_has_no_measured_demand_nasi_kandar | 32 |
| cuisine_token_has_no_measured_demand_kahve | 32 |
| cuisine_token_has_no_measured_demand_modern_australian | 31 |
| cuisine_token_has_no_measured_demand_friterie | 31 |
| cuisine_token_has_no_measured_demand_franconian | 31 |
| cuisine_token_has_no_measured_demand_duck | 31 |
| cuisine_token_has_no_measured_demand_shrimp | 30 |
| cuisine_token_has_no_measured_demand_szechuan | 30 |
| cuisine_token_has_no_measured_demand_quiche | 30 |
| cuisine_token_has_no_measured_demand_pasticceria | 30 |
| cuisine_token_has_no_measured_demand_monja | 30 |
| cuisine_token_has_no_measured_demand_salvadorian | 30 |
| cuisine_token_has_no_measured_demand_poutine | 29 |
| cuisine_token_has_no_measured_demand_omelette | 29 |
| cuisine_token_has_no_measured_demand_spaghetti | 29 |
| cuisine_token_has_no_measured_demand_california | 29 |
| cuisine_token_has_no_measured_demand_panzerotti | 29 |
| cuisine_token_has_no_measured_demand_ハンバーグ | 29 |
| cuisine_token_has_no_measured_demand_mauritian | 28 |
| cuisine_token_has_no_measured_demand_donuts | 28 |
| cuisine_token_has_no_measured_demand_pitta | 28 |
| cuisine_token_has_no_measured_demand_roman | 28 |
| cuisine_token_has_no_measured_demand_porções | 28 |
| cuisine_token_has_no_measured_demand_pastelaria | 28 |
| cuisine_token_has_no_measured_demand_tartare | 28 |
| cuisine_token_has_no_measured_demand_börek | 28 |
| cuisine_token_has_no_measured_demand_sundanese | 28 |
| cuisine_token_has_no_measured_demand_farinata | 28 |
| cuisine_token_has_no_measured_demand_fugu | 28 |
| cuisine_token_has_no_measured_demand_okinawa | 28 |
| cuisine_token_has_no_measured_demand_birria | 28 |
| cuisine_token_has_no_measured_demand_muslim | 28 |
| cuisine_token_has_no_measured_demand_poke_bowl | 27 |
| cuisine_token_has_no_measured_demand_çay | 27 |
| cuisine_token_has_no_measured_demand_specialty_coffee | 26 |
| cuisine_token_has_no_measured_demand_pies | 26 |
| cuisine_token_has_no_measured_demand_tea_room | 26 |
| cuisine_token_has_no_measured_demand_natural | 26 |
| cuisine_token_has_no_measured_demand_albanian | 26 |
| cuisine_token_has_no_measured_demand_coffe_shop | 26 |
| cuisine_token_has_no_measured_demand_köfte | 26 |
| cuisine_token_has_no_measured_demand_guyanese | 26 |
| cuisine_token_has_no_measured_demand_quesadilla | 26 |
| cuisine_token_has_no_measured_demand_tost | 26 |
| cuisine_token_has_no_measured_demand_pork_cutlet | 26 |
| cuisine_token_has_no_measured_demand_peranakan | 26 |
| cuisine_token_has_no_measured_demand_churrasqueira | 26 |
| cuisine_token_has_no_measured_demand_tatlı | 26 |
| cuisine_token_has_no_measured_demand_desserts | 25 |
| cuisine_token_has_no_measured_demand_iranian | 25 |
| cuisine_token_has_no_measured_demand_mixed | 25 |
| cuisine_token_has_no_measured_demand_frites | 25 |
| cuisine_token_has_no_measured_demand_milk | 25 |
| cuisine_token_has_no_measured_demand_nordestina | 25 |
| cuisine_token_has_no_measured_demand_churrascaria | 25 |
| cuisine_token_has_no_measured_demand_beverages | 25 |
| cuisine_token_has_no_measured_demand_napoletana | 25 |
| cuisine_token_has_no_measured_demand_southwestern | 25 |
| cuisine_token_has_no_measured_demand_kava | 25 |
| attr_not_discriminating | 24 |
| cuisine_token_has_no_measured_demand_raclette | 24 |
| cuisine_token_has_no_measured_demand_caucasian | 24 |
| cuisine_token_has_no_measured_demand_tajine | 24 |
| cuisine_token_has_no_measured_demand_carne | 24 |
| cuisine_token_has_no_measured_demand_mariscos | 24 |
| cuisine_token_has_no_measured_demand_candy | 24 |
| cuisine_token_has_no_measured_demand_roti | 24 |
| cuisine_token_has_no_measured_demand_bistronomique | 24 |
| cuisine_token_has_no_measured_demand_corean | 24 |
| cuisine_token_has_no_measured_demand_birra | 24 |
| cuisine_token_has_no_measured_demand_ステーキ | 24 |
| cuisine_token_has_no_measured_demand_stir_fry | 24 |
| cuisine_token_has_no_measured_demand_sallad | 24 |
| cuisine_token_has_no_measured_demand_çorba | 24 |
| cuisine_token_has_no_measured_demand_farm-to-table | 24 |
| cuisine_token_has_no_measured_demand_shisha | 23 |
| cuisine_token_has_no_measured_demand_nepal | 23 |
| cuisine_token_has_no_measured_demand_espetinho | 23 |
| cuisine_token_has_no_measured_demand_brasilian | 23 |
| cuisine_token_has_no_measured_demand_slow_food | 23 |
| cuisine_token_has_no_measured_demand_ceviche | 23 |
| cuisine_token_has_no_measured_demand_sudanese | 23 |
| cuisine_token_has_no_measured_demand_peking | 23 |
| cuisine_token_has_no_measured_demand_mie_ayam | 23 |
| cuisine_token_has_no_measured_demand_polska | 23 |
| cuisine_token_has_no_measured_demand_sports_bar | 23 |
| cuisine_token_has_no_measured_demand_levantine | 22 |
| cuisine_token_has_no_measured_demand_contemporary | 22 |
| cuisine_token_has_no_measured_demand_cheesecake | 22 |
| cuisine_token_has_no_measured_demand_brasileira | 22 |
| cuisine_token_has_no_measured_demand_casserole | 22 |
| cuisine_token_has_no_measured_demand_baked_goods | 22 |
| cuisine_token_has_no_measured_demand_baklava | 22 |
| cuisine_token_has_no_measured_demand_north_african | 22 |
| cuisine_token_has_no_measured_demand_pilav | 22 |
| cuisine_token_has_no_measured_demand_andalusian | 22 |
| cuisine_token_has_no_measured_demand_crousty | 22 |
| cuisine_token_has_no_measured_demand_taiyaki | 22 |
| cuisine_token_has_no_measured_demand_shanghai | 22 |
| cuisine_token_has_no_measured_demand_おでん | 22 |
| cuisine_token_has_no_measured_demand_焼きそば | 22 |
| cuisine_token_has_no_measured_demand_brewery | 21 |
| cuisine_token_has_no_measured_demand_souvlaki | 21 |
| cuisine_token_has_no_measured_demand_roast | 21 |
| cuisine_token_has_no_measured_demand_hunan | 21 |
| cuisine_token_has_no_measured_demand_delivery | 21 |
| cuisine_token_has_no_measured_demand_croque | 21 |
| cuisine_token_has_no_measured_demand_pintxos | 21 |
| cuisine_token_has_no_measured_demand_pastel_de_nata | 21 |
| cuisine_token_has_no_measured_demand_romana | 21 |
| cuisine_token_has_no_measured_demand_天ぷら | 21 |
| cuisine_token_has_no_measured_demand_oaxacan | 21 |
| cuisine_measured_at_or_near_zero_in_this_market | 20 |
| cuisine_token_has_no_measured_demand_srilankan | 20 |
| cuisine_token_has_no_measured_demand_sausages | 20 |
| cuisine_token_has_no_measured_demand_hummus | 20 |
| cuisine_token_has_no_measured_demand_bao | 20 |
| cuisine_token_has_no_measured_demand_take_away | 20 |
| cuisine_token_has_no_measured_demand_shake | 20 |
| cuisine_token_has_no_measured_demand_omakase | 20 |
| cuisine_token_has_no_measured_demand_kumpir | 20 |
| cuisine_token_has_no_measured_demand_oysters | 20 |
| cuisine_token_has_no_measured_demand_vasca | 20 |
| cuisine_token_has_no_measured_demand_brasas | 20 |
| cuisine_token_has_no_measured_demand_jacket_potato | 20 |
| cuisine_token_has_no_measured_demand_east_african | 20 |
| cuisine_token_has_no_measured_demand_soup_curry | 20 |
| cuisine_token_has_no_measured_demand_alitas | 20 |
| cuisine_token_has_no_measured_demand_pichi-pichi | 20 |
| cuisine_token_has_no_measured_demand_kokoreç | 20 |
| cuisine_token_has_no_measured_demand_trinidadian | 20 |
| cuisine_token_has_no_measured_demand_bohemian | 19 |
| cuisine_token_has_no_measured_demand_bagels | 19 |
| cuisine_token_has_no_measured_demand_pub_food | 19 |
| cuisine_token_has_no_measured_demand_durum | 19 |
| cuisine_token_has_no_measured_demand_caseira | 19 |
| cuisine_token_has_no_measured_demand_esfiha | 19 |
| cuisine_token_has_no_measured_demand_bebidas | 19 |
| cuisine_token_has_no_measured_demand_eggs | 19 |
| cuisine_token_has_no_measured_demand_carvery | 19 |
| cuisine_token_has_no_measured_demand_bruschetta | 19 |
| cuisine_token_has_no_measured_demand_afternoon_tea | 19 |
| cuisine_token_has_no_measured_demand_shakes | 19 |
| cuisine_token_has_no_measured_demand_salvadorean | 19 |
| cuisine_token_has_no_measured_demand_唐揚げ | 19 |
| cuisine_token_has_no_measured_demand_pozole | 19 |
| cuisine_token_has_no_measured_demand_hot_chocolate | 18 |
| cuisine_token_has_no_measured_demand_saisonal | 18 |
| cuisine_token_has_no_measured_demand_tiramisu | 18 |
| cuisine_token_has_no_measured_demand_homemade | 18 |
| cuisine_token_has_no_measured_demand_south_african | 18 |
| cuisine_token_has_no_measured_demand_durian | 18 |
| cuisine_token_has_no_measured_demand_carnes | 18 |
| cuisine_token_has_no_measured_demand_sucos | 18 |
| cuisine_token_has_no_measured_demand_comida_caseira | 18 |
| cuisine_token_has_no_measured_demand_padaria | 18 |
| cuisine_token_has_no_measured_demand_drink | 18 |
| cuisine_token_has_no_measured_demand_egg | 18 |
| cuisine_token_has_no_measured_demand_roasted_chicken | 18 |
| cuisine_token_has_no_measured_demand_salon_de_thé | 18 |
| cuisine_token_has_no_measured_demand_bangladesh | 18 |
| cuisine_token_has_no_measured_demand_cornish | 18 |
| cuisine_token_has_no_measured_demand_ghanaian | 18 |
| cuisine_token_has_no_measured_demand_west_indian | 18 |
| cuisine_token_has_no_measured_demand_sunda | 18 |
| cuisine_token_has_no_measured_demand_emilian | 18 |
| cuisine_token_has_no_measured_demand_cutlet | 18 |
| cuisine_token_has_no_measured_demand_鉄板焼き | 18 |
| cuisine_token_has_no_measured_demand_shabushabu | 18 |
| cuisine_token_has_no_measured_demand_串カツ | 18 |
| cuisine_token_has_no_measured_demand_焼き肉 | 18 |
| cuisine_token_has_no_measured_demand_もんじゃ焼き | 18 |
| cuisine_token_has_no_measured_demand_カフェ | 18 |
| cuisine_token_has_no_measured_demand_mexicana | 18 |
| cuisine_token_has_no_measured_demand_chilaquiles | 18 |
| cuisine_token_has_no_measured_demand_lomi | 18 |
| cuisine_token_has_no_measured_demand_kebap | 17 |
| cuisine_token_has_no_measured_demand_croque-monsieur | 17 |
| cuisine_token_has_no_measured_demand_meatballs | 17 |
| cuisine_token_has_no_measured_demand_spare_ribs | 17 |
| cuisine_token_has_no_measured_demand_almoço | 17 |
| cuisine_token_has_no_measured_demand_italiana | 17 |
| cuisine_token_has_no_measured_demand_bolos | 17 |
| cuisine_token_has_no_measured_demand_subs | 17 |
| cuisine_token_has_no_measured_demand_meze | 17 |
| cuisine_token_has_no_measured_demand_imbiss | 17 |
| cuisine_token_has_no_measured_demand_calçotada | 17 |
| cuisine_token_has_no_measured_demand_biryani | 17 |
| cuisine_token_has_no_measured_demand_martabak | 17 |
| cuisine_token_has_no_measured_demand_sukiyaki | 17 |
| cuisine_token_has_no_measured_demand_goat | 17 |
| cuisine_token_has_no_measured_demand_tantuni | 17 |
| cuisine_token_has_no_measured_demand_hmong | 17 |
| cuisine_token_has_no_measured_demand_quick_bite | 17 |
| cuisine_token_has_no_measured_demand_fastfood | 16 |
| cuisine_token_has_no_measured_demand_roasted_chestnut | 16 |
| cuisine_token_has_no_measured_demand_bio | 16 |
| cuisine_token_has_no_measured_demand_cupcakes | 16 |
| cuisine_token_has_no_measured_demand_new_zealand | 16 |
| cuisine_token_has_no_measured_demand_massas | 16 |
| cuisine_token_has_no_measured_demand_acarajé | 16 |
| cuisine_token_has_no_measured_demand_steak_grill | 16 |
| cuisine_token_has_no_measured_demand_burguer | 16 |
| cuisine_token_has_no_measured_demand__burger | 16 |
| cuisine_token_has_no_measured_demand_hamburguer | 16 |
| cuisine_token_has_no_measured_demand_anatolian | 16 |
| cuisine_token_has_no_measured_demand_flammekueche | 16 |
| cuisine_token_has_no_measured_demand_norwegian | 16 |
| cuisine_token_has_no_measured_demand_ligurian | 16 |
| cuisine_token_has_no_measured_demand_postres | 16 |
| cuisine_token_has_no_measured_demand_high_tea | 16 |
| cuisine_token_has_no_measured_demand_soul | 16 |
| cuisine_token_has_no_measured_demand_acehnese | 16 |
| cuisine_token_has_no_measured_demand_minang | 16 |
| cuisine_token_has_no_measured_demand_pugliese | 16 |
| cuisine_token_has_no_measured_demand_piedmontese | 16 |
| cuisine_token_has_no_measured_demand_pollo | 16 |
| cuisine_token_has_no_measured_demand_ristorante | 16 |
| cuisine_token_has_no_measured_demand_串揚げ | 16 |
| cuisine_token_has_no_measured_demand_kushiage | 16 |
| cuisine_token_has_no_measured_demand_ネパール料理 | 16 |
| cuisine_token_has_no_measured_demand_kushikatsu | 16 |
| cuisine_token_has_no_measured_demand_やきとり | 16 |
| cuisine_token_has_no_measured_demand_イタリアン | 16 |
| cuisine_token_has_no_measured_demand_myanmar | 16 |
| cuisine_token_has_no_measured_demand_オムライス | 16 |
| cuisine_token_has_no_measured_demand_kopitiam | 16 |
| cuisine_token_has_no_measured_demand_lunchroom | 16 |
| cuisine_token_has_no_measured_demand_pares | 16 |
| cuisine_token_has_no_measured_demand_husmanskost | 16 |
| cuisine_token_has_no_measured_demand_texan | 16 |
| cuisine_token_has_no_measured_demand_kahvaltı | 16 |
| cuisine_token_has_no_measured_demand_central_american | 16 |
| cuisine_token_has_no_measured_demand_dining_hall | 16 |
| cuisine_token_has_no_measured_demand_kolache | 16 |
| cuisine_token_has_no_measured_demand_juices | 15 |
| cuisine_token_has_no_measured_demand_streetfood | 15 |
| cuisine_token_has_no_measured_demand_burek | 15 |
| cuisine_token_has_no_measured_demand_slavic | 15 |
| cuisine_token_has_no_measured_demand_xis | 15 |
| cuisine_token_has_no_measured_demand_restaurante | 15 |
| cuisine_token_has_no_measured_demand_shellfish | 15 |
| cuisine_token_has_no_measured_demand_vino | 15 |
| cuisine_token_has_no_measured_demand_nasi_goreng | 15 |
| cuisine_token_has_no_measured_demand_tegalan | 15 |
| cuisine_token_has_no_measured_demand_siomai | 15 |
| cuisine_token_has_no_measured_demand_gorditas | 15 |
| cuisine_token_has_no_measured_demand_antojitos | 15 |
| cuisine_token_has_no_measured_demand_modern_european | 14 |
| cuisine_token_has_no_measured_demand_new_orleans | 14 |
| cuisine_token_has_no_measured_demand_antipasti | 14 |
| cuisine_token_has_no_measured_demand_medieval | 14 |
| cuisine_token_has_no_measured_demand__pizza | 14 |
| cuisine_token_has_no_measured_demand_arabian | 14 |
| cuisine_token_has_no_measured_demand_lamb | 14 |
| cuisine_token_has_no_measured_demand_banh_mi | 14 |
| cuisine_token_has_no_measured_demand_tearoom | 14 |
| cuisine_token_has_no_measured_demand_pokebowl | 14 |
| cuisine_token_has_no_measured_demand_trucker | 14 |
| cuisine_token_has_no_measured_demand_peixe | 14 |
| cuisine_token_has_no_measured_demand_japonesa | 14 |
| cuisine_token_has_no_measured_demand_grelhados | 14 |
| cuisine_token_has_no_measured_demand_batata_frita | 14 |
| cuisine_token_has_no_measured_demand_mezze | 14 |
| cuisine_token_has_no_measured_demand_osteria | 14 |
| cuisine_token_has_no_measured_demand_ivorian | 14 |
| cuisine_token_has_no_measured_demand_antillaise | 14 |
| cuisine_token_has_no_measured_demand_peri_peri | 14 |
| cuisine_token_has_no_measured_demand_cider | 14 |
| cuisine_token_has_no_measured_demand_sate | 14 |
| cuisine_token_has_no_measured_demand_tuna | 14 |
| cuisine_token_has_no_measured_demand_chicken_wings | 14 |
| cuisine_token_has_no_measured_demand_scone | 14 |
| cuisine_token_has_no_measured_demand_cinese | 14 |
| cuisine_token_has_no_measured_demand_alcolici | 14 |
| cuisine_token_has_no_measured_demand_arancini | 14 |
| cuisine_token_has_no_measured_demand_omelette_rice | 14 |
| cuisine_token_has_no_measured_demand_カレーライス | 14 |
| cuisine_token_has_no_measured_demand_つけ麺 | 14 |
| cuisine_token_has_no_measured_demand_iekei | 14 |
| cuisine_token_has_no_measured_demand_しゃぶしゃぶ | 14 |
| cuisine_token_has_no_measured_demand_もんじゃ | 14 |
| cuisine_token_has_no_measured_demand_海鮮丼 | 14 |
| cuisine_token_has_no_measured_demand_pollo_asado | 14 |
| cuisine_token_has_no_measured_demand_yucateca | 14 |
| cuisine_token_has_no_measured_demand_pollo_rostizado | 14 |
| cuisine_token_has_no_measured_demand_boneless | 14 |
| cuisine_token_has_no_measured_demand_carne_crugiente | 14 |
| cuisine_token_has_no_measured_demand_lechon | 14 |
| cuisine_token_has_no_measured_demand_roast_beef | 14 |
| cuisine_token_has_no_measured_demand_fujian | 14 |
| cuisine_token_has_no_measured_demand_svensk | 14 |
| cuisine_token_has_no_measured_demand_coney_island | 14 |
| cuisine_token_has_no_measured_demand_hispanic | 14 |
| cuisine_token_has_no_measured_demand_pupusa | 14 |
| area_attr_duplicates_city_list | 13 |
| cuisine_token_has_no_measured_demand_polynesian | 13 |
| cuisine_token_has_no_measured_demand_salat | 13 |
| cuisine_token_has_no_measured_demand_ice | 13 |
| cuisine_token_has_no_measured_demand_cordon_bleu | 13 |
| cuisine_token_has_no_measured_demand_grilled_cheese | 13 |
| cuisine_token_has_no_measured_demand_laotian | 13 |
| cuisine_token_has_no_measured_demand_malagasy | 13 |
| cuisine_token_has_no_measured_demand_self_service | 13 |
| cuisine_token_has_no_measured_demand_coconut | 13 |
| cuisine_token_has_no_measured_demand_caldos | 13 |
| cuisine_token_has_no_measured_demand_cerveja | 13 |
| cuisine_token_has_no_measured_demand_ice_creme | 13 |
| cuisine_token_has_no_measured_demand_tortilla | 13 |
| cuisine_token_has_no_measured_demand_creative | 13 |
| cuisine_token_has_no_measured_demand_pinchos | 13 |
| cuisine_token_has_no_measured_demand_family | 13 |
| cuisine_token_has_no_measured_demand_savoyard | 13 |
| cuisine_token_has_no_measured_demand_trattoria | 13 |
| cuisine_token_has_no_measured_demand_lobster | 13 |
| cuisine_token_has_no_measured_demand_masakan_padang | 13 |
| cuisine_token_has_no_measured_demand_aperitivo | 13 |
| cuisine_token_has_no_measured_demand_frytki | 13 |
| cuisine_token_has_no_measured_demand_ızgara | 13 |
| cuisine_token_has_no_measured_demand_native_american | 13 |
| cuisine_token_has_no_measured_demand_hookah | 12 |
| cuisine_token_has_no_measured_demand_kabab | 12 |
| cuisine_token_has_no_measured_demand_flatbread | 12 |
| cuisine_token_has_no_measured_demand_toasts | 12 |
| cuisine_token_has_no_measured_demand_tyrolean | 12 |
| cuisine_token_has_no_measured_demand_donburi | 12 |
| cuisine_token_has_no_measured_demand_muffin | 12 |
| cuisine_token_has_no_measured_demand_bhutanese | 12 |
| cuisine_token_has_no_measured_demand_latte | 12 |
| cuisine_token_has_no_measured_demand_finger_food | 12 |
| cuisine_token_has_no_measured_demand_dürüm | 12 |
| cuisine_token_has_no_measured_demand_mussels | 12 |
| cuisine_token_has_no_measured_demand_traditionnelle | 12 |
| cuisine_token_has_no_measured_demand_pasteis | 12 |
| cuisine_token_has_no_measured_demand_tradicional | 12 |
| cuisine_token_has_no_measured_demand_vinhos | 12 |
| cuisine_token_has_no_measured_demand_hamburgueria | 12 |
| cuisine_token_has_no_measured_demand_lanchonete | 12 |
| cuisine_token_has_no_measured_demand_confeitaria | 12 |
| cuisine_token_has_no_measured_demand_cervejaria | 12 |
| cuisine_token_has_no_measured_demand_schweiz | 12 |
| cuisine_token_has_no_measured_demand_tamil | 12 |
| cuisine_token_has_no_measured_demand_gaufres | 12 |
| cuisine_token_has_no_measured_demand_beef_noodle | 12 |
| cuisine_token_has_no_measured_demand_bratwurst | 12 |
| cuisine_token_has_no_measured_demand_pan_asian | 12 |
| cuisine_token_has_no_measured_demand_soft_drinks | 12 |
| cuisine_token_has_no_measured_demand_grilled_chicken | 12 |
| cuisine_token_has_no_measured_demand_fried | 12 |
| cuisine_token_has_no_measured_demand_tostadas | 12 |
| cuisine_token_has_no_measured_demand_gallega | 12 |
| cuisine_token_has_no_measured_demand_tapa | 12 |
| cuisine_token_has_no_measured_demand_vin | 12 |
| cuisine_token_has_no_measured_demand_socca | 12 |
| cuisine_token_has_no_measured_demand_moldovan | 12 |
| cuisine_token_has_no_measured_demand_balti | 12 |
| cuisine_token_has_no_measured_demand_jacket_potatoes | 12 |
| cuisine_token_has_no_measured_demand_lithuanian | 12 |
| cuisine_token_has_no_measured_demand_somalian | 12 |
| cuisine_token_has_no_measured_demand_kopi | 12 |
| cuisine_token_has_no_measured_demand_roti_lapissandwich | 12 |
| cuisine_token_has_no_measured_demand_cena | 12 |
| cuisine_token_has_no_measured_demand_hawaian | 12 |
| cuisine_token_has_no_measured_demand_okinawa_ryori | 12 |
| cuisine_token_has_no_measured_demand_スープカレー | 12 |
| cuisine_token_has_no_measured_demand_aburasoba | 12 |
| cuisine_token_has_no_measured_demand_rice_ball | 12 |
| cuisine_token_has_no_measured_demand_barbacoa | 12 |
| cuisine_token_has_no_measured_demand_nyonya | 12 |
| cuisine_token_has_no_measured_demand_halo-halo | 12 |
| cuisine_token_has_no_measured_demand_sisig | 12 |
| cuisine_token_has_no_measured_demand_tapsilog | 12 |
| cuisine_token_has_no_measured_demand_inasal | 12 |
| cuisine_token_has_no_measured_demand_lowcountry | 12 |
| cuisine_token_has_no_measured_demand_jause | 11 |
| cuisine_token_has_no_measured_demand_brotzeit | 11 |
| cuisine_token_has_no_measured_demand_coffe | 11 |
| cuisine_token_has_no_measured_demand_pommes | 11 |
| cuisine_token_has_no_measured_demand_corn | 11 |
| cuisine_token_has_no_measured_demand_pães | 11 |
| cuisine_token_has_no_measured_demand_nuggets | 11 |
| cuisine_token_has_no_measured_demand_caffè | 11 |
| cuisine_token_has_no_measured_demand_lasagna | 11 |
| cuisine_token_has_no_measured_demand_venison | 11 |
| cuisine_token_has_no_measured_demand_casera | 11 |
| cuisine_token_has_no_measured_demand_asturiana | 11 |
| cuisine_token_has_no_measured_demand_snack_bar | 11 |
| cuisine_token_has_no_measured_demand_hamburguesas | 11 |
| cuisine_token_has_no_measured_demand_sichuanese | 11 |
| cuisine_token_has_no_measured_demand_greasy_spoon | 11 |
| cuisine_token_has_no_measured_demand_stew | 11 |
| cuisine_token_has_no_measured_demand_vegetarian | 11 |
| cuisine_token_has_no_measured_demand_ayam_goreng | 11 |
| cuisine_token_has_no_measured_demand_pudding | 11 |
| cuisine_token_has_no_measured_demand_tigella | 11 |
| cuisine_token_has_no_measured_demand_taglieri | 11 |
| cuisine_token_has_no_measured_demand_toscana | 11 |
| cuisine_token_has_no_measured_demand_コーヒー | 11 |
| cuisine_token_has_no_measured_demand_ホルモン | 11 |
| cuisine_token_has_no_measured_demand_elotes | 11 |
| cuisine_token_has_no_measured_demand_silesian | 11 |
| cuisine_token_has_no_measured_demand_gofry | 11 |
| cuisine_token_has_no_measured_demand_kombucha | 11 |
| cuisine_token_has_no_measured_demand_snow_cone | 11 |
| cuisine_token_has_no_measured_demand_all_you_can_eat | 10 |
| cuisine_token_has_no_measured_demand_kerala | 10 |
| cuisine_token_has_no_measured_demand_maroccan | 10 |
| cuisine_token_has_no_measured_demand_hyderabadi | 10 |
| cuisine_token_has_no_measured_demand_sweet | 10 |
| cuisine_token_has_no_measured_demand_tajik | 10 |
| cuisine_token_has_no_measured_demand_healthy_food | 10 |
| cuisine_token_has_no_measured_demand_viennese | 10 |
| cuisine_token_has_no_measured_demand_maltese | 10 |
| cuisine_token_has_no_measured_demand_yum_cha | 10 |
| cuisine_token_has_no_measured_demand_steakhouse | 10 |
| cuisine_token_has_no_measured_demand_doughnut | 10 |
| cuisine_token_has_no_measured_demand_toastie | 10 |
| cuisine_token_has_no_measured_demand_biscuit | 10 |
| cuisine_token_has_no_measured_demand_baguettes | 10 |
| cuisine_token_has_no_measured_demand_ontbijt | 10 |
| cuisine_token_has_no_measured_demand_azerbaijani | 10 |
| cuisine_token_has_no_measured_demand_nikkei | 10 |
| cuisine_token_has_no_measured_demand_congolese | 10 |
| cuisine_token_has_no_measured_demand_pão_de_queijo | 10 |
| cuisine_token_has_no_measured_demand_árabe | 10 |
| cuisine_token_has_no_measured_demand_arroz | 10 |
| cuisine_token_has_no_measured_demand_caldo_de_cana | 10 |
| cuisine_token_has_no_measured_demand_self-service | 10 |
| cuisine_token_has_no_measured_demand_chopp | 10 |
| cuisine_token_has_no_measured_demand_suisse | 10 |
| cuisine_token_has_no_measured_demand_steaks | 10 |
| cuisine_token_has_no_measured_demand_vietnam | 10 |
| cuisine_token_has_no_measured_demand_multi | 10 |
| cuisine_token_has_no_measured_demand_sportsbar | 10 |
| cuisine_token_has_no_measured_demand_equatorian | 10 |
| cuisine_token_has_no_measured_demand_bingsu | 10 |
| cuisine_token_has_no_measured_demand_desayunos | 10 |
| cuisine_token_has_no_measured_demand_yunnan | 10 |
| cuisine_token_has_no_measured_demand_routier | 10 |
| cuisine_token_has_no_measured_demand_tartines | 10 |
| cuisine_token_has_no_measured_demand_senegal | 10 |
| cuisine_token_has_no_measured_demand_japan | 10 |
| cuisine_token_has_no_measured_demand_welsh | 10 |
| cuisine_token_has_no_measured_demand_pan-asian | 10 |
| cuisine_token_has_no_measured_demand_water | 10 |
| cuisine_token_has_no_measured_demand_chai | 10 |
| cuisine_token_has_no_measured_demand_casual | 10 |
| cuisine_token_has_no_measured_demand_apulian | 10 |
| cuisine_token_has_no_measured_demand_pempek | 10 |
| cuisine_token_has_no_measured_demand_meat_ball | 10 |
| cuisine_token_has_no_measured_demand_brownies | 10 |
| cuisine_token_has_no_measured_demand_fruits | 10 |
| cuisine_token_has_no_measured_demand_abruzzese | 10 |
| cuisine_token_has_no_measured_demand_pranzo | 10 |
| cuisine_token_has_no_measured_demand_asporto | 10 |
| cuisine_token_has_no_measured_demand_giapponese | 10 |
| cuisine_token_has_no_measured_demand_rosticceria | 10 |
| cuisine_token_has_no_measured_demand_puccia | 10 |
| cuisine_token_has_no_measured_demand_venetian | 10 |
| cuisine_token_has_no_measured_demand_korean_bbq | 10 |
| cuisine_token_has_no_measured_demand_gyutan | 10 |
| cuisine_token_has_no_measured_demand_gyudon | 10 |
| cuisine_token_has_no_measured_demand_monjayaki | 10 |
| cuisine_token_has_no_measured_demand_もつ鍋 | 10 |
| cuisine_token_has_no_measured_demand_からあげ | 10 |
| cuisine_token_has_no_measured_demand_raumen | 10 |
| cuisine_token_has_no_measured_demand_豚カツ | 10 |
| cuisine_token_has_no_measured_demand_japanese_oden | 10 |
| cuisine_token_has_no_measured_demand_お好み焼 | 10 |
| cuisine_token_has_no_measured_demand_チャーハン | 10 |
| cuisine_token_has_no_measured_demand_tonkatu | 10 |
| cuisine_token_has_no_measured_demand_沖縄料理 | 10 |
| cuisine_token_has_no_measured_demand_タピオカ | 10 |
| cuisine_token_has_no_measured_demand_おにぎり | 10 |
| cuisine_token_has_no_measured_demand_teishoku | 10 |
| cuisine_token_has_no_measured_demand_taquería | 10 |
| cuisine_token_has_no_measured_demand_crepas | 10 |
| cuisine_token_has_no_measured_demand_author's | 10 |
| cuisine_token_has_no_measured_demand_chicharron | 10 |
| cuisine_token_has_no_measured_demand_bak_kut_teh | 10 |
| cuisine_token_has_no_measured_demand_bakuteh | 10 |
| cuisine_token_has_no_measured_demand_pan_mee | 10 |
| cuisine_token_has_no_measured_demand_non_halal | 10 |
| cuisine_token_has_no_measured_demand_bulalo | 10 |
| cuisine_token_has_no_measured_demand_costa_rican | 10 |
| cuisine_token_has_no_measured_demand_louisiana | 10 |
| cuisine_token_has_no_measured_demand_filipino_food | 10 |
| cuisine_token_has_no_measured_demand_zapiekanka | 10 |
| cuisine_token_has_no_measured_demand_makarna | 10 |
| cuisine_token_has_no_measured_demand_brewpub | 10 |
| cuisine_token_has_no_measured_demand_macaroni_and_cheese | 10 |
| cuisine_token_has_no_measured_demand_boba_tea | 10 |
| cuisine_token_has_no_measured_demand_indomie | 9 |
| cuisine_token_has_no_measured_demand_frühstück | 9 |
| cuisine_token_has_no_measured_demand_game | 9 |
| cuisine_token_has_no_measured_demand_sake | 9 |
| cuisine_token_has_no_measured_demand_pâtes | 9 |
| cuisine_token_has_no_measured_demand_gaufre | 9 |
| cuisine_token_has_no_measured_demand_creperie | 9 |
| cuisine_token_has_no_measured_demand_internacional | 9 |
| cuisine_token_has_no_measured_demand_crèpes | 9 |
| cuisine_token_has_no_measured_demand_india | 9 |
| cuisine_token_has_no_measured_demand_asador | 9 |
| cuisine_token_has_no_measured_demand_bretonne | 9 |
| cuisine_token_has_no_measured_demand_créole | 9 |
| cuisine_token_has_no_measured_demand_turque | 9 |
| cuisine_token_has_no_measured_demand_english_breakfast | 9 |
| cuisine_token_has_no_measured_demand_burgers | 9 |
| cuisine_token_has_no_measured_demand_indonesia | 9 |
| cuisine_token_has_no_measured_demand_seafo | 9 |
| cuisine_token_has_no_measured_demand_pecel | 9 |
| cuisine_token_has_no_measured_demand_ayam | 9 |
| cuisine_token_has_no_measured_demand_tavola_calda | 9 |
| cuisine_token_has_no_measured_demand_tramezzini | 9 |
| cuisine_token_has_no_measured_demand_mensa | 9 |
| cuisine_token_has_no_measured_demand_pork_bowl | 9 |
| cuisine_token_has_no_measured_demand_home_style | 9 |
| cuisine_token_has_no_measured_demand_laksa | 9 |
| cuisine_token_has_no_measured_demand_domowa | 9 |
| cuisine_token_has_no_measured_demand_hamburgare | 9 |
| cuisine_token_has_no_measured_demand_tiki_bar | 9 |
| opening_not_discriminating | 8 |
| cuisine_token_has_no_measured_demand_paleo | 8 |
| cuisine_token_has_no_measured_demand_momos | 8 |
| cuisine_token_has_no_measured_demand_bengal | 8 |
| cuisine_token_has_no_measured_demand_confiserie | 8 |
| cuisine_token_has_no_measured_demand_orient | 8 |
| cuisine_token_has_no_measured_demand__international | 8 |
| cuisine_token_has_no_measured_demand_alpine_hut | 8 |
| cuisine_token_has_no_measured_demand_langos | 8 |
| cuisine_token_has_no_measured_demand_fingerfood | 8 |
| cuisine_token_has_no_measured_demand_snails | 8 |
| cuisine_token_has_no_measured_demand_ful | 8 |
| cuisine_token_has_no_measured_demand__kebab | 8 |
| cuisine_token_has_no_measured_demand__coffee | 8 |
| cuisine_token_has_no_measured_demand_rolls | 8 |
| cuisine_token_has_no_measured_demand_jaffle | 8 |
| cuisine_token_has_no_measured_demand_cold_drinks | 8 |
| cuisine_token_has_no_measured_demand_singapore | 8 |
| cuisine_token_has_no_measured_demand_student | 8 |
| cuisine_token_has_no_measured_demand_cameroonian | 8 |
| cuisine_token_has_no_measured_demand_poisson | 8 |
| cuisine_token_has_no_measured_demand_suriname | 8 |
| cuisine_token_has_no_measured_demand_batata | 8 |
| cuisine_token_has_no_measured_demand_pão | 8 |
| cuisine_token_has_no_measured_demand_bolo | 8 |
| cuisine_token_has_no_measured_demand_frango | 8 |
| cuisine_token_has_no_measured_demand_feijão | 8 |
| cuisine_token_has_no_measured_demand_espetinhos | 8 |
| cuisine_token_has_no_measured_demand_frango_assado | 8 |
| cuisine_token_has_no_measured_demand_savory_pancake | 8 |
| cuisine_token_has_no_measured_demand_macaron | 8 |
| cuisine_token_has_no_measured_demand_salgado | 8 |
| cuisine_token_has_no_measured_demand_coxinhas | 8 |
| cuisine_token_has_no_measured_demand_saudável | 8 |
| cuisine_token_has_no_measured_demand_harry_potter | 8 |
| cuisine_token_has_no_measured_demand_sopa | 8 |
| cuisine_token_has_no_measured_demand_the_bakery | 8 |
| cuisine_token_has_no_measured_demand_parrilla | 8 |
| cuisine_token_has_no_measured_demand_doceria | 8 |
| cuisine_token_has_no_measured_demand_milk_shake | 8 |
| cuisine_token_has_no_measured_demand_refrigerante | 8 |
| cuisine_token_has_no_measured_demand_etc | 8 |
| cuisine_token_has_no_measured_demand_brownie | 8 |
| cuisine_token_has_no_measured_demand_espeto | 8 |
| cuisine_token_has_no_measured_demand_risotto | 8 |
| cuisine_token_has_no_measured_demand_jordanian | 8 |
| cuisine_token_has_no_measured_demand_provençale | 8 |
| cuisine_token_has_no_measured_demand_enchiladas | 8 |
| cuisine_token_has_no_measured_demand_raw_food | 8 |
| cuisine_token_has_no_measured_demand_mallorcan | 8 |
| cuisine_token_has_no_measured_demand_paellas | 8 |
| cuisine_token_has_no_measured_demand_raciones | 8 |
| cuisine_token_has_no_measured_demand_chifa | 8 |
| cuisine_token_has_no_measured_demand_jamón | 8 |
| cuisine_token_has_no_measured_demand_ecuatorian | 8 |
| cuisine_token_has_no_measured_demand_market | 8 |
| cuisine_token_has_no_measured_demand_helados | 8 |
| cuisine_token_has_no_measured_demand_panaderia | 8 |
| cuisine_token_has_no_measured_demand_iced_coffee | 8 |
| cuisine_token_has_no_measured_demand_paraguayan | 8 |
| cuisine_token_has_no_measured_demand_smoothie_bowls | 8 |
| cuisine_token_has_no_measured_demand_corse | 8 |
| cuisine_token_has_no_measured_demand_savoyarde | 8 |
| cuisine_token_has_no_measured_demand_skewer | 8 |
| cuisine_token_has_no_measured_demand_pakistanese | 8 |
| cuisine_token_has_no_measured_demand_latino | 8 |
| cuisine_token_has_no_measured_demand_salad_bar | 8 |
| cuisine_token_has_no_measured_demand_berber | 8 |
| cuisine_token_has_no_measured_demand_tagine | 8 |
| cuisine_token_has_no_measured_demand_provencal | 8 |
| cuisine_token_has_no_measured_demand_galettes | 8 |
| cuisine_token_has_no_measured_demand_panuozzo | 8 |
| cuisine_token_has_no_measured_demand_huîtres | 8 |
| cuisine_token_has_no_measured_demand_morrocan | 8 |
| cuisine_token_has_no_measured_demand_tea_house | 8 |
| cuisine_token_has_no_measured_demand_modern_british | 8 |
| cuisine_token_has_no_measured_demand_hog_roast | 8 |
| cuisine_token_has_no_measured_demand_desi | 8 |
| cuisine_token_has_no_measured_demand_cream_tea | 8 |
| cuisine_token_has_no_measured_demand_parmesan | 8 |
| cuisine_token_has_no_measured_demand_donner | 8 |
| cuisine_token_has_no_measured_demand_southeast_asian | 8 |
| cuisine_token_has_no_measured_demand_gluten_free | 8 |
| cuisine_token_has_no_measured_demand_grilled | 8 |
| cuisine_token_has_no_measured_demand_detroit_steel-pan | 8 |
| cuisine_token_has_no_measured_demand_south_asian | 8 |
| cuisine_token_has_no_measured_demand_jerk | 8 |
| cuisine_token_has_no_measured_demand_ayam_geprek | 8 |
| cuisine_token_has_no_measured_demand_lontong | 8 |
| cuisine_token_has_no_measured_demand_soto_ayam | 8 |
| cuisine_token_has_no_measured_demand_chinese_noodle | 8 |
| cuisine_token_has_no_measured_demand_cirebonese | 8 |
| cuisine_token_has_no_measured_demand_nasi_campur | 8 |
| cuisine_token_has_no_measured_demand_takeout | 8 |
| cuisine_token_has_no_measured_demand_piemontese | 8 |
| cuisine_token_has_no_measured_demand_törggelen | 8 |
| cuisine_token_has_no_measured_demand_cibo | 8 |
| cuisine_token_has_no_measured_demand_superalcolici | 8 |
| cuisine_token_has_no_measured_demand_cocktail_bar | 8 |
| cuisine_token_has_no_measured_demand_assaggi | 8 |
| cuisine_token_has_no_measured_demand_piadine | 8 |
| cuisine_token_has_no_measured_demand_fritti | 8 |
| cuisine_token_has_no_measured_demand_kapampangan | 8 |
| cuisine_token_has_no_measured_demand_horumon-yaki | 8 |
| cuisine_token_has_no_measured_demand_kushiyaki | 8 |
| cuisine_token_has_no_measured_demand_鉄板焼 | 8 |
| cuisine_token_has_no_measured_demand_hamburg_steak | 8 |
| cuisine_token_has_no_measured_demand_horumon | 8 |
| cuisine_token_has_no_measured_demand_喫茶店 | 8 |
| cuisine_token_has_no_measured_demand_rice_bowl | 8 |
| cuisine_token_has_no_measured_demand_うなぎ料理 | 8 |
| cuisine_token_has_no_measured_demand_katsudon | 8 |
| cuisine_token_has_no_measured_demand_yoshoku | 8 |
| cuisine_token_has_no_measured_demand_amer | 8 |
| cuisine_token_has_no_measured_demand_fried_dumplings | 8 |
| cuisine_token_has_no_measured_demand_katsu | 8 |
| cuisine_token_has_no_measured_demand_omurice | 8 |
| cuisine_token_has_no_measured_demand_ランチ | 8 |
| cuisine_token_has_no_measured_demand_ちゃんぽん | 8 |
| cuisine_token_has_no_measured_demand_ホルモン焼き | 8 |
| cuisine_token_has_no_measured_demand_soft_serve | 8 |
| cuisine_token_has_no_measured_demand_parfait | 8 |
| cuisine_token_has_no_measured_demand_すき焼き | 8 |
| cuisine_token_has_no_measured_demand_lemonade | 8 |
| cuisine_token_has_no_measured_demand_botanas | 8 |
| cuisine_token_has_no_measured_demand_sopes | 8 |
| cuisine_token_has_no_measured_demand_tacos_y_tortas | 8 |
| cuisine_token_has_no_measured_demand_pollo_frito | 8 |
| cuisine_token_has_no_measured_demand_sub | 8 |
| cuisine_token_has_no_measured_demand_comida_rapida | 8 |
| cuisine_token_has_no_measured_demand_roti_canai | 8 |
| cuisine_token_has_no_measured_demand_indian_muslim | 8 |
| cuisine_token_has_no_measured_demand_patat | 8 |
| cuisine_token_has_no_measured_demand_surinam | 8 |
| cuisine_token_has_no_measured_demand_kenyan | 8 |
| cuisine_token_has_no_measured_demand_ilonggo | 8 |
| cuisine_token_has_no_measured_demand_silog | 8 |
| cuisine_token_has_no_measured_demand_batchoy | 8 |
| cuisine_token_has_no_measured_demand_congee | 8 |
| cuisine_token_has_no_measured_demand_samgyupsal | 8 |
| cuisine_token_has_no_measured_demand_lugaw | 8 |
| cuisine_token_has_no_measured_demand_palabok | 8 |
| cuisine_token_has_no_measured_demand_pansit | 8 |
| cuisine_token_has_no_measured_demand_internationell | 8 |
| cuisine_token_has_no_measured_demand_etli_ekmek | 8 |
| cuisine_token_has_no_measured_demand_ev_yemekleri | 8 |
| cuisine_token_has_no_measured_demand_künefe | 8 |
| cuisine_token_has_no_measured_demand_dondurma | 8 |
| cuisine_token_has_no_measured_demand_türk_yemekleri | 8 |
| cuisine_token_has_no_measured_demand_supper_club | 8 |
| cuisine_token_has_no_measured_demand_jerky | 8 |
| cuisine_token_has_no_measured_demand_mac_and_cheese | 8 |
| cuisine_token_has_no_measured_demand_american_chinese | 8 |
| cuisine_token_has_no_measured_demand_comfort | 8 |
| cuisine_token_has_no_measured_demand_kabob | 8 |
| cuisine_token_has_no_measured_demand_taquitos | 8 |
| cuisine_token_has_no_measured_demand_fruit_juice | 7 |
| cuisine_token_has_no_measured_demand_marisco | 7 |
| cuisine_token_has_no_measured_demand_philippines | 7 |
| cuisine_token_has_no_measured_demand_kaffee | 7 |
| cuisine_token_has_no_measured_demand_österreichisch | 7 |
| cuisine_token_has_no_measured_demand__lanches | 7 |
| cuisine_token_has_no_measured_demand__bar | 7 |
| cuisine_token_has_no_measured_demand_granola | 7 |
| cuisine_token_has_no_measured_demand_wild | 7 |
| cuisine_token_has_no_measured_demand__pasta | 7 |
| cuisine_token_has_no_measured_demand_whiskey | 7 |
| cuisine_token_has_no_measured_demand_slovenian | 7 |
| cuisine_token_has_no_measured_demand_octopus | 7 |
| cuisine_token_has_no_measured_demand_lounge | 7 |
| cuisine_token_has_no_measured_demand_bar_à_vin | 7 |
| cuisine_token_has_no_measured_demand_bistronomie | 7 |
| cuisine_token_has_no_measured_demand_crêpes | 7 |
| cuisine_token_has_no_measured_demand_moules | 7 |
| cuisine_token_has_no_measured_demand_cambodia | 7 |
| cuisine_token_has_no_measured_demand_pain | 7 |
| cuisine_token_has_no_measured_demand_nugget | 7 |
| cuisine_token_has_no_measured_demand_varied | 7 |
| cuisine_token_has_no_measured_demand_sausage_rolls | 7 |
| cuisine_token_has_no_measured_demand_minangkabau | 7 |
| cuisine_token_has_no_measured_demand_seblak | 7 |
| cuisine_token_has_no_measured_demand_mie | 7 |
| cuisine_token_has_no_measured_demand_philippino | 7 |
| cuisine_token_has_no_measured_demand_winery | 7 |
| cuisine_token_has_no_measured_demand_arrosticini | 7 |
| cuisine_token_has_no_measured_demand_romagnola | 7 |
| cuisine_token_has_no_measured_demand_油そば | 7 |
| cuisine_token_has_no_measured_demand_親子丼 | 7 |
| cuisine_token_has_no_measured_demand_khmer_food | 7 |
| cuisine_token_has_no_measured_demand_nasi_lemak | 7 |
| cuisine_token_has_no_measured_demand_frappe | 7 |
| cuisine_token_has_no_measured_demand_fish_fry | 7 |
| cuisine_token_has_no_measured_demand_funnel_cake | 7 |
| cuisine_token_has_no_measured_demand_american-chinese | 7 |
| cuisine_token_has_no_measured_demand_calzones | 7 |
| cuisine_token_has_no_measured_demand_phillipino | 6 |
| cuisine_token_has_no_measured_demand_middle_east | 6 |
| cuisine_token_has_no_measured_demand_spring_rolls | 6 |
| cuisine_token_has_no_measured_demand_bier | 6 |
| cuisine_token_has_no_measured_demand_syrisch | 6 |
| cuisine_token_has_no_measured_demand_slovak | 6 |
| cuisine_token_has_no_measured_demand_baked | 6 |
| cuisine_token_has_no_measured_demand_hong_kong_cafe | 6 |
| cuisine_token_has_no_measured_demand_all_day_breakfast | 6 |
| cuisine_token_has_no_measured_demand_north_indian | 6 |
| cuisine_token_has_no_measured_demand_doughnuts | 6 |
| cuisine_token_has_no_measured_demand_toasted_sandwich | 6 |
| cuisine_token_has_no_measured_demand_toasties | 6 |
| cuisine_token_has_no_measured_demand_panino | 6 |
| cuisine_token_has_no_measured_demand_coffee_roaster | 6 |
| cuisine_token_has_no_measured_demand_croissants | 6 |
| cuisine_token_has_no_measured_demand_artisanal | 6 |
| cuisine_token_has_no_measured_demand_turks | 6 |
| cuisine_token_has_no_measured_demand_dairy | 6 |
| cuisine_token_has_no_measured_demand_gastronomical | 6 |
| cuisine_token_has_no_measured_demand_turc | 6 |
| cuisine_token_has_no_measured_demand_frutos_do_mar | 6 |
| cuisine_token_has_no_measured_demand_variadas | 6 |
| cuisine_token_has_no_measured_demand_cafés | 6 |
| cuisine_token_has_no_measured_demand_japones | 6 |
| cuisine_token_has_no_measured_demand_batatas_fritas | 6 |
| cuisine_token_has_no_measured_demand_lanche | 6 |
| cuisine_token_has_no_measured_demand_sorveteria | 6 |
| cuisine_token_has_no_measured_demand_empada | 6 |
| cuisine_token_has_no_measured_demand_pastrami | 6 |
| cuisine_token_has_no_measured_demand_tequeño | 6 |
| cuisine_token_has_no_measured_demand_kafta | 6 |
| cuisine_token_has_no_measured_demand_cachorro_quente | 6 |
| cuisine_token_has_no_measured_demand_salgadinhos | 6 |
| cuisine_token_has_no_measured_demand_feijoada | 6 |
| cuisine_token_has_no_measured_demand_banana | 6 |
| cuisine_token_has_no_measured_demand_nuts | 6 |
| cuisine_token_has_no_measured_demand_marmitex | 6 |
| cuisine_token_has_no_measured_demand_esfihas | 6 |
| cuisine_token_has_no_measured_demand_barbecu | 6 |
| cuisine_token_has_no_measured_demand_congelados | 6 |
| cuisine_token_has_no_measured_demand_bacon | 6 |
| cuisine_token_has_no_measured_demand_prato_feito | 6 |
| cuisine_token_has_no_measured_demand_sopas | 6 |
| cuisine_token_has_no_measured_demand_petisco | 6 |
| cuisine_token_has_no_measured_demand_marmita | 6 |
| cuisine_token_has_no_measured_demand_macarons | 6 |
| cuisine_token_has_no_measured_demand_asiatica | 6 |
| cuisine_token_has_no_measured_demand_momo | 6 |
| cuisine_token_has_no_measured_demand_malakoff | 6 |
| cuisine_token_has_no_measured_demand_kuchen | 6 |
| cuisine_token_has_no_measured_demand_empanadas | 6 |
| cuisine_token_has_no_measured_demand_erithrean | 6 |
| cuisine_token_has_no_measured_demand_tibetian | 6 |
| cuisine_token_has_no_measured_demand_ravioli | 6 |
| cuisine_token_has_no_measured_demand_westphalian | 6 |
| cuisine_token_has_no_measured_demand_ceylonese | 6 |
| cuisine_token_has_no_measured_demand_baden | 6 |
| cuisine_token_has_no_measured_demand_rodizio | 6 |
| cuisine_token_has_no_measured_demand_konditorei | 6 |
| cuisine_token_has_no_measured_demand_cypriot | 6 |
| cuisine_token_has_no_measured_demand_injera | 6 |
| cuisine_token_has_no_measured_demand_sri_lanka | 6 |
| cuisine_token_has_no_measured_demand_badisch | 6 |
| cuisine_token_has_no_measured_demand_asia | 6 |
| cuisine_token_has_no_measured_demand_raw | 6 |
| cuisine_token_has_no_measured_demand_dansk | 6 |
| cuisine_token_has_no_measured_demand_finnish | 6 |
| cuisine_token_has_no_measured_demand_arroceria | 6 |
| cuisine_token_has_no_measured_demand_autor | 6 |
| cuisine_token_has_no_measured_demand_frankfurt | 6 |
| cuisine_token_has_no_measured_demand_ecuatoriana | 6 |
| cuisine_token_has_no_measured_demand_cachapa | 6 |
| cuisine_token_has_no_measured_demand_cervecería | 6 |
| cuisine_token_has_no_measured_demand_pan | 6 |
| cuisine_token_has_no_measured_demand_bocadillo | 6 |
| cuisine_token_has_no_measured_demand_hondurean | 6 |
| cuisine_token_has_no_measured_demand_happy_hour | 6 |
| cuisine_token_has_no_measured_demand_plant_based | 6 |
| cuisine_token_has_no_measured_demand_spicy | 6 |
| cuisine_token_has_no_measured_demand_panadería | 6 |
| cuisine_token_has_no_measured_demand_milanesa | 6 |
| cuisine_token_has_no_measured_demand_philipino | 6 |
| cuisine_token_has_no_measured_demand_moules-frites | 6 |
| cuisine_token_has_no_measured_demand_cuisine_du_monde | 6 |
| cuisine_token_has_no_measured_demand_boissons | 6 |
| cuisine_token_has_no_measured_demand_maki | 6 |
| cuisine_token_has_no_measured_demand_libanaise | 6 |
| cuisine_token_has_no_measured_demand_kurde | 6 |
| cuisine_token_has_no_measured_demand_china | 6 |
| cuisine_token_has_no_measured_demand_lasagne | 6 |
| cuisine_token_has_no_measured_demand_bistrot | 6 |
| cuisine_token_has_no_measured_demand_cookie_dough | 6 |
| cuisine_token_has_no_measured_demand_congo | 6 |
| cuisine_token_has_no_measured_demand_lyonnaise | 6 |
| cuisine_token_has_no_measured_demand_japonais | 6 |
| cuisine_token_has_no_measured_demand_taiwan | 6 |
| cuisine_token_has_no_measured_demand_goûter | 6 |
| cuisine_token_has_no_measured_demand_indien | 6 |
| cuisine_token_has_no_measured_demand_antilles | 6 |
| cuisine_token_has_no_measured_demand_macrobiotic | 6 |
| cuisine_token_has_no_measured_demand_baozi | 6 |
| cuisine_token_has_no_measured_demand_riz | 6 |
| cuisine_token_has_no_measured_demand_mali | 6 |
| cuisine_token_has_no_measured_demand_nigeria | 6 |
| cuisine_token_has_no_measured_demand_ensaladas | 6 |
| cuisine_token_has_no_measured_demand_tropical | 6 |
| cuisine_token_has_no_measured_demand_grillades | 6 |
| cuisine_token_has_no_measured_demand_algérienne | 6 |
| cuisine_token_has_no_measured_demand_poultry | 6 |
| cuisine_token_has_no_measured_demand_thai_food | 6 |
| cuisine_token_has_no_measured_demand_oriental_fusion | 6 |
| cuisine_token_has_no_measured_demand_mocktails | 6 |
| cuisine_token_has_no_measured_demand_afro_caribbean | 6 |
| cuisine_token_has_no_measured_demand_carribbean | 6 |
| cuisine_token_has_no_measured_demand_egg_roll | 6 |
| cuisine_token_has_no_measured_demand_hot_wings | 6 |
| cuisine_token_has_no_measured_demand__western | 6 |
| cuisine_token_has_no_measured_demand_mushroom | 6 |
| cuisine_token_has_no_measured_demand_tahu_campur | 6 |
| cuisine_token_has_no_measured_demand_nasi | 6 |
| cuisine_token_has_no_measured_demand_family_restaurant | 6 |
| cuisine_token_has_no_measured_demand_noodle_shop | 6 |
| cuisine_token_has_no_measured_demand_ayam_penyet | 6 |
| cuisine_token_has_no_measured_demand_club_sandwich | 6 |
| cuisine_token_has_no_measured_demand_lalapan | 6 |
| cuisine_token_has_no_measured_demand_catfish | 6 |
| cuisine_token_has_no_measured_demand_nasi_padang | 6 |
| cuisine_token_has_no_measured_demand_indo | 6 |
| cuisine_token_has_no_measured_demand_rendang | 6 |
| cuisine_token_has_no_measured_demand_asian_street_food | 6 |
| cuisine_token_has_no_measured_demand_cibo_al_bar | 6 |
| cuisine_token_has_no_measured_demand_aperitivi | 6 |
| cuisine_token_has_no_measured_demand_enoteca | 6 |
| cuisine_token_has_no_measured_demand_cibo_sano | 6 |
| cuisine_token_has_no_measured_demand_pinsa_romana | 6 |
| cuisine_token_has_no_measured_demand_agriturismo | 6 |
| cuisine_token_has_no_measured_demand_caffe | 6 |
| cuisine_token_has_no_measured_demand_gelateria | 6 |
| cuisine_token_has_no_measured_demand_macrobiotica | 6 |
| cuisine_token_has_no_measured_demand_kyrgyz | 6 |
| cuisine_token_has_no_measured_demand_beaf | 6 |
| cuisine_token_has_no_measured_demand_pinoy | 6 |
| cuisine_token_has_no_measured_demand_bruschette | 6 |
| cuisine_token_has_no_measured_demand_horse | 6 |
| cuisine_token_has_no_measured_demand_fried_potatoes | 6 |
| cuisine_token_has_no_measured_demand_fried_skewers | 6 |
| cuisine_token_has_no_measured_demand_italien | 6 |
| cuisine_token_has_no_measured_demand_日本酒 | 6 |
| cuisine_token_has_no_measured_demand_tendon | 6 |
| cuisine_token_has_no_measured_demand_gyouza | 6 |
| cuisine_token_has_no_measured_demand_motsunabe | 6 |
| cuisine_token_has_no_measured_demand_motsuyaki | 6 |
| cuisine_token_has_no_measured_demand_インドカレー | 6 |
| cuisine_token_has_no_measured_demand_ケーキ | 6 |
| cuisine_token_has_no_measured_demand_hamburg | 6 |
| cuisine_token_has_no_measured_demand_たこやき | 6 |
| cuisine_token_has_no_measured_demand_japanese_soba | 6 |
| cuisine_token_has_no_measured_demand_カツ丼 | 6 |
| cuisine_token_has_no_measured_demand_beef_steak | 6 |
| cuisine_token_has_no_measured_demand_ワイン | 6 |
| cuisine_token_has_no_measured_demand_日本料理 | 6 |
| cuisine_token_has_no_measured_demand_confectionary | 6 |
| cuisine_token_has_no_measured_demand_かつ丼 | 6 |
| cuisine_token_has_no_measured_demand_もつ焼き | 6 |
| cuisine_token_has_no_measured_demand_noode | 6 |
| cuisine_token_has_no_measured_demand_トンカツ | 6 |
| cuisine_token_has_no_measured_demand_tonkotsu | 6 |
| cuisine_token_has_no_measured_demand_templa | 6 |
| cuisine_token_has_no_measured_demand_汁なし坦々麺 | 6 |
| cuisine_token_has_no_measured_demand_nabe | 6 |
| cuisine_token_has_no_measured_demand_かき氷 | 6 |
| cuisine_token_has_no_measured_demand_フレンチ | 6 |
| cuisine_token_has_no_measured_demand_kaiseki | 6 |
| cuisine_token_has_no_measured_demand_たい焼き | 6 |
| cuisine_token_has_no_measured_demand_ソフトクリーム | 6 |
| cuisine_token_has_no_measured_demand_ビール | 6 |
| cuisine_token_has_no_measured_demand_家庭料理 | 6 |
| cuisine_token_has_no_measured_demand_レストラン | 6 |
| cuisine_token_has_no_measured_demand_肉料理 | 6 |
| cuisine_token_has_no_measured_demand_tiki | 6 |
| cuisine_token_has_no_measured_demand_charcoal_grill | 6 |
| cuisine_token_has_no_measured_demand_japanese_curry | 6 |
| cuisine_token_has_no_measured_demand_xiaolongbao | 6 |
| cuisine_token_has_no_measured_demand_chicha | 6 |
| cuisine_token_has_no_measured_demand_cortes | 6 |
| cuisine_token_has_no_measured_demand_comida_mexicana | 6 |
| cuisine_token_has_no_measured_demand_comida_china | 6 |
| cuisine_token_has_no_measured_demand_pastor | 6 |
| cuisine_token_has_no_measured_demand_yucatecan | 6 |
| cuisine_token_has_no_measured_demand_comida_corrida | 6 |
| cuisine_token_has_no_measured_demand_papas_fritas | 6 |
| cuisine_token_has_no_measured_demand_costillas | 6 |
| cuisine_token_has_no_measured_demand_saludable | 6 |
| cuisine_token_has_no_measured_demand_esquites | 6 |
| cuisine_token_has_no_measured_demand_kettlecorn | 6 |
| cuisine_token_has_no_measured_demand_coffee_with_fusion_food | 6 |
| cuisine_token_has_no_measured_demand_yemen | 6 |
| cuisine_token_has_no_measured_demand_hainanese | 6 |
| cuisine_token_has_no_measured_demand_thai_cuisine | 6 |
| cuisine_token_has_no_measured_demand_apple_pie | 6 |
| cuisine_token_has_no_measured_demand_soft_drugs | 6 |
| cuisine_token_has_no_measured_demand_surinaams | 6 |
| cuisine_token_has_no_measured_demand_spring_roll | 6 |
| cuisine_token_has_no_measured_demand_cotton_candy | 6 |
| cuisine_token_has_no_measured_demand_pancit | 6 |
| cuisine_token_has_no_measured_demand_halo_halo | 6 |
| cuisine_token_has_no_measured_demand_bachoy | 6 |
| cuisine_token_has_no_measured_demand_filipino_foods | 6 |
| cuisine_token_has_no_measured_demand_carinderia | 6 |
| cuisine_token_has_no_measured_demand_pastil | 6 |
| cuisine_token_has_no_measured_demand_fishball | 6 |
| cuisine_token_has_no_measured_demand_cow | 6 |
| cuisine_token_has_no_measured_demand_negrense | 6 |
| cuisine_token_has_no_measured_demand_cheburek | 6 |
| cuisine_token_has_no_measured_demand_tatar | 6 |
| cuisine_token_has_no_measured_demand_polish_milk_bar | 6 |
| cuisine_token_has_no_measured_demand_lokma | 6 |
| cuisine_token_has_no_measured_demand_portuguesa | 6 |
| cuisine_token_has_no_measured_demand_fusão | 6 |
| cuisine_token_has_no_measured_demand_take-away | 6 |
| cuisine_token_has_no_measured_demand_bakverk | 6 |
| cuisine_token_has_no_measured_demand_fika | 6 |
| cuisine_token_has_no_measured_demand_paj | 6 |
| cuisine_token_has_no_measured_demand_salata | 6 |
| cuisine_token_has_no_measured_demand_mangal | 6 |
| cuisine_token_has_no_measured_demand_kumru | 6 |
| cuisine_token_has_no_measured_demand_poğaça | 6 |
| cuisine_token_has_no_measured_demand_et_döner | 6 |
| cuisine_token_has_no_measured_demand_mantı | 6 |
| cuisine_token_has_no_measured_demand_türk | 6 |
| cuisine_token_has_no_measured_demand_bulgur | 6 |
| cuisine_token_has_no_measured_demand_katmer | 6 |
| cuisine_token_has_no_measured_demand_çiğ_köfte | 6 |
| cuisine_token_has_no_measured_demand_patso | 6 |
| cuisine_token_has_no_measured_demand_equadorian | 6 |
| cuisine_token_has_no_measured_demand_italian_soda | 6 |
| cuisine_token_has_no_measured_demand_enchilada | 6 |
| cuisine_token_has_no_measured_demand_energy_drinks | 6 |
| cuisine_token_has_no_measured_demand_custard | 6 |
| cuisine_token_has_no_measured_demand_tavern | 6 |
| cuisine_token_has_no_measured_demand_global | 6 |
| cuisine_token_has_no_measured_demand_shanghainese | 6 |
| cuisine_token_has_no_measured_demand_uzbeki | 6 |
| cuisine_token_has_no_measured_demand_hoagies | 6 |
| cuisine_token_has_no_measured_demand_protein | 6 |
| cuisine_token_has_no_measured_demand_pot_pie | 6 |
| cuisine_token_has_no_measured_demand_mandarin | 6 |
| cuisine_token_has_no_measured_demand_bánh_cuốn | 6 |
| cuisine_token_has_no_measured_demand_slushy | 6 |
| cuisine_token_has_no_measured_demand_modernist | 5 |
| cuisine_token_has_no_measured_demand_مشاوي | 5 |
| cuisine_token_has_no_measured_demand_snail | 5 |
| cuisine_token_has_no_measured_demand_saison | 5 |
| cuisine_token_has_no_measured_demand_cafe_food | 5 |
| cuisine_token_has_no_measured_demand_liquor | 5 |
| cuisine_token_has_no_measured_demand_scones | 5 |
| cuisine_token_has_no_measured_demand_uygur | 5 |
| cuisine_token_has_no_measured_demand_porchetta | 5 |
| cuisine_token_has_no_measured_demand_pizzaria | 5 |
| cuisine_token_has_no_measured_demand_doces_e_salgados | 5 |
| cuisine_token_has_no_measured_demand_peixes | 5 |
| cuisine_token_has_no_measured_demand_schweizerisch | 5 |
| cuisine_token_has_no_measured_demand_south_tyrolean | 5 |
| cuisine_token_has_no_measured_demand_colombien | 5 |
| cuisine_token_has_no_measured_demand_viennoiserie | 5 |
| cuisine_token_has_no_measured_demand_thuringian | 5 |
| cuisine_token_has_no_measured_demand_confectionery | 5 |
| cuisine_token_has_no_measured_demand_fried_fish | 5 |
| cuisine_token_has_no_measured_demand_hindu | 5 |
| cuisine_token_has_no_measured_demand_rice_dumpling | 5 |
| cuisine_token_has_no_measured_demand_menu | 5 |
| cuisine_token_has_no_measured_demand_roast_chicken | 5 |
| cuisine_token_has_no_measured_demand_glaces | 5 |
| cuisine_token_has_no_measured_demand_french_toast | 5 |
| cuisine_token_has_no_measured_demand_produits_locaux | 5 |
| cuisine_token_has_no_measured_demand_fruit_de_mer | 5 |
| cuisine_token_has_no_measured_demand_poulet | 5 |
| cuisine_token_has_no_measured_demand_locale | 5 |
| cuisine_token_has_no_measured_demand_chinese_and_english | 5 |
| cuisine_token_has_no_measured_demand_light_meals | 5 |
| cuisine_token_has_no_measured_demand_gado-gado | 5 |
| cuisine_token_has_no_measured_demand_mexican_restaurant | 5 |
| cuisine_token_has_no_measured_demand_frit | 5 |
| cuisine_token_has_no_measured_demand_ricebowl | 5 |
| cuisine_token_has_no_measured_demand_sandwhich | 5 |
| cuisine_token_has_no_measured_demand_włoska | 5 |
| cuisine_token_has_no_measured_demand_ligure | 5 |
| cuisine_token_has_no_measured_demand_gnocchi | 5 |
| cuisine_token_has_no_measured_demand_ethnic | 5 |
| cuisine_token_has_no_measured_demand_tigelle | 5 |
| cuisine_token_has_no_measured_demand_roastery | 5 |
| cuisine_token_has_no_measured_demand_揚げ物 | 5 |
| cuisine_token_has_no_measured_demand_jingisukan | 5 |
| cuisine_token_has_no_measured_demand_らーめん | 5 |
| cuisine_token_has_no_measured_demand_クレープ | 5 |
| cuisine_token_has_no_measured_demand__steak | 5 |
| cuisine_token_has_no_measured_demand_ジンギスカン | 5 |
| cuisine_token_has_no_measured_demand_沖縄そば | 5 |
| cuisine_token_has_no_measured_demand_中華そば | 5 |
| cuisine_token_has_no_measured_demand_蕎麦屋 | 5 |
| cuisine_token_has_no_measured_demand_national | 5 |
| cuisine_token_has_no_measured_demand__hamburguesas | 5 |
| cuisine_token_has_no_measured_demand_rojak | 5 |
| cuisine_token_has_no_measured_demand_tosti | 5 |
| cuisine_token_has_no_measured_demand_yugoslavian | 5 |
| cuisine_token_has_no_measured_demand_goto | 5 |
| cuisine_token_has_no_measured_demand_husman | 5 |
| cuisine_token_has_no_measured_demand_kaffe | 5 |
| cuisine_token_has_no_measured_demand_korv | 5 |
| cuisine_token_has_no_measured_demand_gözleme | 5 |
| cuisine_token_has_no_measured_demand_farm_to_table | 5 |
| cuisine_token_has_no_measured_demand_southwest | 5 |
| cuisine_token_has_no_measured_demand_modern_american | 5 |
| cuisine_token_has_no_measured_demand_fried_dough | 5 |
| cuisine_token_has_no_measured_demand_american_restaurant | 5 |
| cuisine_token_has_no_measured_demand_lebanese_grill | 4 |
| cuisine_token_has_no_measured_demand_sheesha | 4 |
| cuisine_token_has_no_measured_demand_gujarati_thali | 4 |
| cuisine_token_has_no_measured_demand_juice_bar | 4 |
| cuisine_token_has_no_measured_demand_british_restaurant | 4 |
| cuisine_token_has_no_measured_demand_pescado | 4 |
| cuisine_token_has_no_measured_demand_chilly | 4 |
| cuisine_token_has_no_measured_demand_francisco | 4 |
| cuisine_token_has_no_measured_demand_flowers | 4 |
| cuisine_token_has_no_measured_demand_chocolates | 4 |
| cuisine_token_has_no_measured_demand_spanish_tapas | 4 |
| cuisine_token_has_no_measured_demand_vegetarisch | 4 |
| cuisine_token_has_no_measured_demand__ice_cream | 4 |
| cuisine_token_has_no_measured_demand_fladen | 4 |
| cuisine_token_has_no_measured_demand_hipster | 4 |
| cuisine_token_has_no_measured_demand_nepalesian | 4 |
| cuisine_token_has_no_measured_demand_uigurisch | 4 |
| cuisine_token_has_no_measured_demand_mediteran | 4 |
| cuisine_token_has_no_measured_demand_schokolade | 4 |
| cuisine_token_has_no_measured_demand_wein | 4 |
| cuisine_token_has_no_measured_demand_azerbaijan | 4 |
| cuisine_token_has_no_measured_demand_usbekisch | 4 |
| cuisine_token_has_no_measured_demand_terrible | 4 |
| cuisine_token_has_no_measured_demand_coffee_house | 4 |
| cuisine_token_has_no_measured_demand_ethopian | 4 |
| cuisine_token_has_no_measured_demand_japanese_fusion | 4 |
| cuisine_token_has_no_measured_demand_superfood | 4 |
| cuisine_token_has_no_measured_demand_croquettes | 4 |
| cuisine_token_has_no_measured_demand_coffee_roastery | 4 |
| cuisine_token_has_no_measured_demand_fruit_tea | 4 |
| cuisine_token_has_no_measured_demand_cajun_seafood | 4 |
| cuisine_token_has_no_measured_demand_hsp | 4 |
| cuisine_token_has_no_measured_demand_shabu_shabu | 4 |
| cuisine_token_has_no_measured_demand_skewers | 4 |
| cuisine_token_has_no_measured_demand_shanghaiese | 4 |
| cuisine_token_has_no_measured_demand_haute_cuisine | 4 |
| cuisine_token_has_no_measured_demand_ale | 4 |
| cuisine_token_has_no_measured_demand_eetccafé | 4 |
| cuisine_token_has_no_measured_demand_rôtisserie | 4 |
| cuisine_token_has_no_measured_demand_pakora | 4 |
| cuisine_token_has_no_measured_demand_fresh | 4 |
| cuisine_token_has_no_measured_demand_libyan | 4 |
| cuisine_token_has_no_measured_demand_ijs | 4 |
| cuisine_token_has_no_measured_demand_flemish | 4 |
| cuisine_token_has_no_measured_demand_indochinese | 4 |
| cuisine_token_has_no_measured_demand_belgische_keuken | 4 |
| cuisine_token_has_no_measured_demand_baquettes | 4 |
| cuisine_token_has_no_measured_demand_winebar | 4 |
| cuisine_token_has_no_measured_demand_wereldkeuken | 4 |
| cuisine_token_has_no_measured_demand_lotto | 4 |
| cuisine_token_has_no_measured_demand_terroir | 4 |
| cuisine_token_has_no_measured_demand_familiale | 4 |
| cuisine_token_has_no_measured_demand_smash_burger | 4 |
| cuisine_token_has_no_measured_demand_bar_food | 4 |
| cuisine_token_has_no_measured_demand_sea_food | 4 |
| cuisine_token_has_no_measured_demand_café_da_manhã | 4 |
| cuisine_token_has_no_measured_demand_arabe | 4 |
| cuisine_token_has_no_measured_demand_gaúcha | 4 |
| cuisine_token_has_no_measured_demand_bauru | 4 |
| cuisine_token_has_no_measured_demand_etc. | 4 |
| cuisine_token_has_no_measured_demand_caldinho | 4 |
| cuisine_token_has_no_measured_demand__açaí | 4 |
| cuisine_token_has_no_measured_demand_empadão | 4 |
| cuisine_token_has_no_measured_demand_massa | 4 |
| cuisine_token_has_no_measured_demand_familiar | 4 |
| cuisine_token_has_no_measured_demand_variados | 4 |
| cuisine_token_has_no_measured_demand_vegetable | 4 |
| cuisine_token_has_no_measured_demand_lanches_em_geral | 4 |
| cuisine_token_has_no_measured_demand_batata_recheada | 4 |
| cuisine_token_has_no_measured_demand_doce | 4 |
| cuisine_token_has_no_measured_demand_comida_mineira | 4 |
| cuisine_token_has_no_measured_demand_caldo | 4 |
| cuisine_token_has_no_measured_demand_refrigerantes | 4 |
| cuisine_token_has_no_measured_demand_sanduiche | 4 |
| cuisine_token_has_no_measured_demand_latina | 4 |
| cuisine_token_has_no_measured_demand_kibe | 4 |
| cuisine_token_has_no_measured_demand_churrascos | 4 |
| cuisine_token_has_no_measured_demand_frutas | 4 |
| cuisine_token_has_no_measured_demand_salada | 4 |
| cuisine_token_has_no_measured_demand_artesanal | 4 |
| cuisine_token_has_no_measured_demand_scoville | 4 |
| cuisine_token_has_no_measured_demand_parmegiana | 4 |
| cuisine_token_has_no_measured_demand_health | 4 |
| cuisine_token_has_no_measured_demand_brasa | 4 |
| cuisine_token_has_no_measured_demand_queijos | 4 |
| cuisine_token_has_no_measured_demand_pastéis | 4 |
| cuisine_token_has_no_measured_demand_queijo | 4 |
| cuisine_token_has_no_measured_demand_cachorro-quente | 4 |
| cuisine_token_has_no_measured_demand_tira-gosto | 4 |
| cuisine_token_has_no_measured_demand_alcoholic_drinks | 4 |
| cuisine_token_has_no_measured_demand_pao_de_queijo | 4 |
| cuisine_token_has_no_measured_demand_bee | 4 |
| cuisine_token_has_no_measured_demand_paes | 4 |
| cuisine_token_has_no_measured_demand_chás | 4 |
| cuisine_token_has_no_measured_demand_comida_brasileira | 4 |
| cuisine_token_has_no_measured_demand_pollo_a_la_brasa | 4 |
| cuisine_token_has_no_measured_demand_cafés_especiais | 4 |
| cuisine_token_has_no_measured_demand_pankcake | 4 |
| cuisine_token_has_no_measured_demand_gastronomia | 4 |
| cuisine_token_has_no_measured_demand_a_la_carte | 4 |
| cuisine_token_has_no_measured_demand_hot_dogs | 4 |
| cuisine_token_has_no_measured_demand_kebab_pizza | 4 |
| cuisine_token_has_no_measured_demand_ticino | 4 |
| cuisine_token_has_no_measured_demand_végétarien | 4 |
| cuisine_token_has_no_measured_demand_ticinese | 4 |
| cuisine_token_has_no_measured_demand_southafrican | 4 |
| cuisine_token_has_no_measured_demand_moules_frites | 4 |
| cuisine_token_has_no_measured_demand_ayran | 4 |
| cuisine_token_has_no_measured_demand_mouhalabieh | 4 |
| cuisine_token_has_no_measured_demand_baklawa | 4 |
| cuisine_token_has_no_measured_demand_gelati | 4 |
| cuisine_token_has_no_measured_demand_tartine | 4 |
| cuisine_token_has_no_measured_demand_eritrea | 4 |
| cuisine_token_has_no_measured_demand_chocolaterie | 4 |
| cuisine_token_has_no_measured_demand_eggs_benedict | 4 |
| cuisine_token_has_no_measured_demand_bäckerei | 4 |
| cuisine_token_has_no_measured_demand_schwäbisch | 4 |
| cuisine_token_has_no_measured_demand_mittagstisch | 4 |
| cuisine_token_has_no_measured_demand_bürgerlich | 4 |
| cuisine_token_has_no_measured_demand_pizza_and_pasta | 4 |
| cuisine_token_has_no_measured_demand_tandoor | 4 |
| cuisine_token_has_no_measured_demand_student_food | 4 |
| cuisine_token_has_no_measured_demand_griechisch | 4 |
| cuisine_token_has_no_measured_demand_milchprodukte | 4 |
| cuisine_token_has_no_measured_demand_suppen | 4 |
| cuisine_token_has_no_measured_demand_netherland | 4 |
| cuisine_token_has_no_measured_demand_eiscreme | 4 |
| cuisine_token_has_no_measured_demand_deutsche_küche | 4 |
| cuisine_token_has_no_measured_demand_crossover | 4 |
| cuisine_token_has_no_measured_demand_ceylon | 4 |
| cuisine_token_has_no_measured_demand_kroatisch | 4 |
| cuisine_token_has_no_measured_demand_lokal | 4 |
| cuisine_token_has_no_measured_demand_eiscafe | 4 |
| cuisine_token_has_no_measured_demand_tarte | 4 |
| cuisine_token_has_no_measured_demand_potatoe | 4 |
| cuisine_token_has_no_measured_demand_surf_and_turf | 4 |
| cuisine_token_has_no_measured_demand_samosa | 4 |
| cuisine_token_has_no_measured_demand_cicchetti | 4 |
| cuisine_token_has_no_measured_demand_dish_of_the_day | 4 |
| cuisine_token_has_no_measured_demand_latin_america | 4 |
| cuisine_token_has_no_measured_demand_fine_din | 4 |
| cuisine_token_has_no_measured_demand_مندي | 4 |
| cuisine_token_has_no_measured_demand_squid | 4 |
| cuisine_token_has_no_measured_demand_ham | 4 |
| cuisine_token_has_no_measured_demand_pintxo | 4 |
| cuisine_token_has_no_measured_demand_sudamericana | 4 |
| cuisine_token_has_no_measured_demand_sagardotegi | 4 |
| cuisine_token_has_no_measured_demand_asado | 4 |
| cuisine_token_has_no_measured_demand_madrileña | 4 |
| cuisine_token_has_no_measured_demand_delicatessen | 4 |
| cuisine_token_has_no_measured_demand_spanish_omelette | 4 |
| cuisine_token_has_no_measured_demand_marisquería | 4 |
| cuisine_token_has_no_measured_demand_brochettes | 4 |
| cuisine_token_has_no_measured_demand_pasteleria | 4 |
| cuisine_token_has_no_measured_demand_riojana | 4 |
| cuisine_token_has_no_measured_demand_automates | 4 |
| cuisine_token_has_no_measured_demand_pastelería | 4 |
| cuisine_token_has_no_measured_demand_sidreria | 4 |
| cuisine_token_has_no_measured_demand_arroces | 4 |
| cuisine_token_has_no_measured_demand_combo | 4 |
| cuisine_token_has_no_measured_demand_campero | 4 |
| cuisine_token_has_no_measured_demand_carne_asada | 4 |
| cuisine_token_has_no_measured_demand_brasileña | 4 |
| cuisine_token_has_no_measured_demand_merienda | 4 |
| cuisine_token_has_no_measured_demand_asados | 4 |
| cuisine_token_has_no_measured_demand_freiduría | 4 |
| cuisine_token_has_no_measured_demand_vegetables | 4 |
| cuisine_token_has_no_measured_demand_venezolan | 4 |
| cuisine_token_has_no_measured_demand_afterwork | 4 |
| cuisine_token_has_no_measured_demand_reposteria | 4 |
| cuisine_token_has_no_measured_demand_ecuadorean | 4 |
| cuisine_token_has_no_measured_demand_peruano | 4 |
| cuisine_token_has_no_measured_demand_colombiana | 4 |
| cuisine_token_has_no_measured_demand_cinnamon_rolls | 4 |
| cuisine_token_has_no_measured_demand_tra | 4 |
| cuisine_token_has_no_measured_demand_churrería | 4 |
| cuisine_token_has_no_measured_demand_cerveza | 4 |
| cuisine_token_has_no_measured_demand_palestina | 4 |
| cuisine_token_has_no_measured_demand_rotisserie_chicken | 4 |
| cuisine_token_has_no_measured_demand_barbecue_restaurant | 4 |
| cuisine_token_has_no_measured_demand_argentine | 4 |
| cuisine_token_has_no_measured_demand_venezolana | 4 |
| cuisine_token_has_no_measured_demand_peru | 4 |
| cuisine_token_has_no_measured_demand_bières | 4 |
| cuisine_token_has_no_measured_demand_shaanxi | 4 |
| cuisine_token_has_no_measured_demand_bière | 4 |
| cuisine_token_has_no_measured_demand_posh | 4 |
| cuisine_token_has_no_measured_demand_bur | 4 |
| cuisine_token_has_no_measured_demand_bacalhau | 4 |
| cuisine_token_has_no_measured_demand_plancha | 4 |
| cuisine_token_has_no_measured_demand_aligot | 4 |
| cuisine_token_has_no_measured_demand_pakistanaise | 4 |
| cuisine_token_has_no_measured_demand_luxembourgish | 4 |
| cuisine_token_has_no_measured_demand_viandes | 4 |
| cuisine_token_has_no_measured_demand_cap_vert | 4 |
| cuisine_token_has_no_measured_demand_savoie | 4 |
| cuisine_token_has_no_measured_demand_italian_restaurant | 4 |
| cuisine_token_has_no_measured_demand_tunisienne | 4 |
| cuisine_token_has_no_measured_demand_népalaise | 4 |
| cuisine_token_has_no_measured_demand_bruschettas | 4 |
| cuisine_token_has_no_measured_demand__french | 4 |
| cuisine_token_has_no_measured_demand_cameroon | 4 |
| cuisine_token_has_no_measured_demand__organic | 4 |
| cuisine_token_has_no_measured_demand_japanese_and_chinese | 4 |
| cuisine_token_has_no_measured_demand_de_saison | 4 |
| cuisine_token_has_no_measured_demand_pannini | 4 |
| cuisine_token_has_no_measured_demand_michelin_starred | 4 |
| cuisine_token_has_no_measured_demand_plats_du_jour | 4 |
| cuisine_token_has_no_measured_demand_fromage | 4 |
| cuisine_token_has_no_measured_demand_restaurant_routier | 4 |
| cuisine_token_has_no_measured_demand_brioche | 4 |
| cuisine_token_has_no_measured_demand_appetizer | 4 |
| cuisine_token_has_no_measured_demand_granite | 4 |
| cuisine_token_has_no_measured_demand_fairtrade | 4 |
| cuisine_token_has_no_measured_demand_quebec | 4 |
| cuisine_token_has_no_measured_demand_auvergnate | 4 |
| cuisine_token_has_no_measured_demand_tart | 4 |
| cuisine_token_has_no_measured_demand_friteries | 4 |
| cuisine_token_has_no_measured_demand_boudin | 4 |
| cuisine_token_has_no_measured_demand_congolaise | 4 |
| cuisine_token_has_no_measured_demand_beignet | 4 |
| cuisine_token_has_no_measured_demand_bouchon | 4 |
| cuisine_token_has_no_measured_demand_boulangerie | 4 |
| cuisine_token_has_no_measured_demand_laos | 4 |
| cuisine_token_has_no_measured_demand_pakistan | 4 |
| cuisine_token_has_no_measured_demand_chocolat_chaud | 4 |
| cuisine_token_has_no_measured_demand_bokit | 4 |
| cuisine_token_has_no_measured_demand_antillais | 4 |
| cuisine_token_has_no_measured_demand_tunisie | 4 |
| cuisine_token_has_no_measured_demand_chongqing | 4 |
| cuisine_token_has_no_measured_demand_moulerie | 4 |
| cuisine_token_has_no_measured_demand_plat_du_jour | 4 |
| cuisine_token_has_no_measured_demand_uruguay | 4 |
| cuisine_token_has_no_measured_demand_hongrois | 4 |
| cuisine_token_has_no_measured_demand_cambodgien | 4 |
| cuisine_token_has_no_measured_demand_provençal | 4 |
| cuisine_token_has_no_measured_demand_bar_à_vins | 4 |
| cuisine_token_has_no_measured_demand_chapati | 4 |
| cuisine_token_has_no_measured_demand_ivoirienne | 4 |
| cuisine_token_has_no_measured_demand_sénégalaise | 4 |
| cuisine_token_has_no_measured_demand_baked_potatoes | 4 |
| cuisine_token_has_no_measured_demand__cake | 4 |
| cuisine_token_has_no_measured_demand_fish_&_chips | 4 |
| cuisine_token_has_no_measured_demand_curries | 4 |
| cuisine_token_has_no_measured_demand_espresso_bar | 4 |
| cuisine_token_has_no_measured_demand_haggis | 4 |
| cuisine_token_has_no_measured_demand_gujarati | 4 |
| cuisine_token_has_no_measured_demand__cakes | 4 |
| cuisine_token_has_no_measured_demand_authentic | 4 |
| cuisine_token_has_no_measured_demand_iberian | 4 |
| cuisine_token_has_no_measured_demand_full_english | 4 |
| cuisine_token_has_no_measured_demand_garlic_bread | 4 |
| cuisine_token_has_no_measured_demand_kashmiri | 4 |
| cuisine_token_has_no_measured_demand_seitan | 4 |
| cuisine_token_has_no_measured_demand_chinese_tea | 4 |
| cuisine_token_has_no_measured_demand_japanese_tea | 4 |
| cuisine_token_has_no_measured_demand_yoghurt | 4 |
| cuisine_token_has_no_measured_demand_kids_meals | 4 |
| cuisine_token_has_no_measured_demand_grills | 4 |
| cuisine_token_has_no_measured_demand_speciality_coffee | 4 |
| cuisine_token_has_no_measured_demand_protein_shakes | 4 |
| cuisine_token_has_no_measured_demand_soft_drink | 4 |
| cuisine_token_has_no_measured_demand_health_foods | 4 |
| cuisine_token_has_no_measured_demand_jamacian | 4 |
| cuisine_token_has_no_measured_demand_napalese | 4 |
| cuisine_token_has_no_measured_demand_beverage | 4 |
| cuisine_token_has_no_measured_demand_african_food | 4 |
| cuisine_token_has_no_measured_demand_omelettes | 4 |
| cuisine_token_has_no_measured_demand_neopolitan | 4 |
| cuisine_token_has_no_measured_demand_desert | 4 |
| cuisine_token_has_no_measured_demand_calabrian | 4 |
| cuisine_token_has_no_measured_demand_traditional_food | 4 |
| cuisine_token_has_no_measured_demand__kopi | 4 |
| cuisine_token_has_no_measured_demand_aceh | 4 |
| cuisine_token_has_no_measured_demand_gorengan | 4 |
| cuisine_token_has_no_measured_demand_sate_kambing | 4 |
| cuisine_token_has_no_measured_demand__soto | 4 |
| cuisine_token_has_no_measured_demand_tahu_goreng | 4 |
| cuisine_token_has_no_measured_demand_kue | 4 |
| cuisine_token_has_no_measured_demand_rujak | 4 |
| cuisine_token_has_no_measured_demand_japanese_restaurant | 4 |
| cuisine_token_has_no_measured_demand_seafood_restaurant | 4 |
| cuisine_token_has_no_measured_demand_cake_shop | 4 |
| cuisine_token_has_no_measured_demand_ramen_restaurant | 4 |
| cuisine_token_has_no_measured_demand_barbec | 4 |
| cuisine_token_has_no_measured_demand_rawon | 4 |
| cuisine_token_has_no_measured_demand_smoothie_bowl | 4 |
| cuisine_token_has_no_measured_demand_chinese_food | 4 |
| cuisine_token_has_no_measured_demand_bakpia | 4 |
| cuisine_token_has_no_measured_demand_tekwan | 4 |
| cuisine_token_has_no_measured_demand_ice_tea | 4 |
| cuisine_token_has_no_measured_demand_croffle | 4 |
| cuisine_token_has_no_measured_demand_nasi_uduk | 4 |
| cuisine_token_has_no_measured_demand_donat | 4 |
| cuisine_token_has_no_measured_demand_nasi_kuning | 4 |
| cuisine_token_has_no_measured_demand_ikan_bakar | 4 |
| cuisine_token_has_no_measured_demand_halal | 4 |
| cuisine_token_has_no_measured_demand_nasi_ayam | 4 |
| cuisine_token_has_no_measured_demand_pig | 4 |
| cuisine_token_has_no_measured_demand_asean | 4 |
| cuisine_token_has_no_measured_demand_sandwiches | 4 |
| cuisine_token_has_no_measured_demand_genoese | 4 |
| cuisine_token_has_no_measured_demand_patatine | 4 |
| cuisine_token_has_no_measured_demand_crocchette | 4 |
| cuisine_token_has_no_measured_demand_pasti_fino_a_tarda_sera | 4 |
| cuisine_token_has_no_measured_demand_tipica | 4 |
| cuisine_token_has_no_measured_demand_5_&_5 | 4 |
| cuisine_token_has_no_measured_demand_birreria | 4 |
| cuisine_token_has_no_measured_demand_pizza_al_metro | 4 |
| cuisine_token_has_no_measured_demand_fine_di | 4 |
| cuisine_token_has_no_measured_demand_tradizionale | 4 |
| cuisine_token_has_no_measured_demand_veneta | 4 |
| cuisine_token_has_no_measured_demand_seaf | 4 |
| cuisine_token_has_no_measured_demand_pizza_al_taglio | 4 |
| cuisine_token_has_no_measured_demand_insalate | 4 |
| cuisine_token_has_no_measured_demand_pasta_fresca | 4 |
| cuisine_token_has_no_measured_demand_fried_pizza | 4 |
| cuisine_token_has_no_measured_demand_chinese_dumplings | 4 |
| cuisine_token_has_no_measured_demand_tobacco | 4 |
| cuisine_token_has_no_measured_demand_frate | 4 |
| cuisine_token_has_no_measured_demand_fish_burger | 4 |
| cuisine_token_has_no_measured_demand_regionale | 4 |
| cuisine_token_has_no_measured_demand_siciliana | 4 |
| cuisine_token_has_no_measured_demand_pannuozzo | 4 |
| cuisine_token_has_no_measured_demand_braceria | 4 |
| cuisine_token_has_no_measured_demand_horse_meat | 4 |
| cuisine_token_has_no_measured_demand_focacce | 4 |
| cuisine_token_has_no_measured_demand_bibite | 4 |
| cuisine_token_has_no_measured_demand_paninoteca | 4 |
| cuisine_token_has_no_measured_demand_stoccafisso | 4 |
| cuisine_token_has_no_measured_demand_horsemeat | 4 |
| cuisine_token_has_no_measured_demand_granita | 4 |
| cuisine_token_has_no_measured_demand_marocchina | 4 |
| cuisine_token_has_no_measured_demand_lampredotto | 4 |
| cuisine_token_has_no_measured_demand_milanese | 4 |
| cuisine_token_has_no_measured_demand_chines | 4 |
| cuisine_token_has_no_measured_demand_merenda | 4 |
| cuisine_token_has_no_measured_demand_umbrian | 4 |
| cuisine_token_has_no_measured_demand_emiliana | 4 |
| cuisine_token_has_no_measured_demand_cibo_per_l'happy_hour | 4 |
| cuisine_token_has_no_measured_demand_drink_per_l'happy_hour | 4 |
| cuisine_token_has_no_measured_demand_carbonara | 4 |
| cuisine_token_has_no_measured_demand_もんじゃ焼 | 4 |
| cuisine_token_has_no_measured_demand_日本食 | 4 |
| cuisine_token_has_no_measured_demand_ドーナツ | 4 |
| cuisine_token_has_no_measured_demand_hokkaido | 4 |
| cuisine_token_has_no_measured_demand_ryukyu | 4 |
| cuisine_token_has_no_measured_demand_pufferfish | 4 |
| cuisine_token_has_no_measured_demand_amami_ryori | 4 |
| cuisine_token_has_no_measured_demand_立ち飲み | 4 |
| cuisine_token_has_no_measured_demand_chanpon | 4 |
| cuisine_token_has_no_measured_demand_jerk_chicken | 4 |
| cuisine_token_has_no_measured_demand_みそかつ | 4 |
| cuisine_token_has_no_measured_demand_tantanmen | 4 |
| cuisine_token_has_no_measured_demand_japanese_tonkatsu | 4 |
| cuisine_token_has_no_measured_demand_teppan | 4 |
| cuisine_token_has_no_measured_demand_創作料理 | 4 |
| cuisine_token_has_no_measured_demand_牛タン | 4 |
| cuisine_token_has_no_measured_demand_イタリア料理 | 4 |
| cuisine_token_has_no_measured_demand_beef_barbecue | 4 |
| cuisine_token_has_no_measured_demand_japanese_ramen | 4 |
| cuisine_token_has_no_measured_demand_まぜそば | 4 |
| cuisine_token_has_no_measured_demand_ステーキハウス | 4 |
| cuisine_token_has_no_measured_demand_tempra | 4 |
| cuisine_token_has_no_measured_demand__cafe | 4 |
| cuisine_token_has_no_measured_demand_jiaozi | 4 |
| cuisine_token_has_no_measured_demand_日本蕎麦 | 4 |
| cuisine_token_has_no_measured_demand_台湾料理 | 4 |
| cuisine_token_has_no_measured_demand_japanese-yakitori | 4 |
| cuisine_token_has_no_measured_demand_タルト | 4 |
| cuisine_token_has_no_measured_demand_インド料理 | 4 |
| cuisine_token_has_no_measured_demand_回転寿司 | 4 |
| cuisine_token_has_no_measured_demand_meet | 4 |
| cuisine_token_has_no_measured_demand_iekei_ramen | 4 |
| cuisine_token_has_no_measured_demand_buckwheat | 4 |
| cuisine_token_has_no_measured_demand_japanese_food | 4 |
| cuisine_token_has_no_measured_demand_okinawa_soba | 4 |
| cuisine_token_has_no_measured_demand_robatayaki | 4 |
| cuisine_token_has_no_measured_demand_garlic | 4 |
| cuisine_token_has_no_measured_demand_広東料理 | 4 |
| cuisine_token_has_no_measured_demand_susi | 4 |
| cuisine_token_has_no_measured_demand_ちゃんこ | 4 |
| cuisine_token_has_no_measured_demand_chanko | 4 |
| cuisine_token_has_no_measured_demand_kappo | 4 |
| cuisine_token_has_no_measured_demand_やきとん | 4 |
| cuisine_token_has_no_measured_demand_champon | 4 |
| cuisine_token_has_no_measured_demand_季節料理 | 4 |
| cuisine_token_has_no_measured_demand_crape | 4 |
| cuisine_token_has_no_measured_demand_mediteranian | 4 |
| cuisine_token_has_no_measured_demand_パンケーキ | 4 |
| cuisine_token_has_no_measured_demand_うどん・そば | 4 |
| cuisine_token_has_no_measured_demand_フランス料理 | 4 |
| cuisine_token_has_no_measured_demand_刀削麺 | 4 |
| cuisine_token_has_no_measured_demand_豚まん | 4 |
| cuisine_token_has_no_measured_demand_general | 4 |
| cuisine_token_has_no_measured_demand_味噌煮込みうどん | 4 |
| cuisine_token_has_no_measured_demand_ハンバーガー | 4 |
| cuisine_token_has_no_measured_demand_japanese_sweets | 4 |
| cuisine_token_has_no_measured_demand_syabusyabu | 4 |
| cuisine_token_has_no_measured_demand_ミルクティー | 4 |
| cuisine_token_has_no_measured_demand_串焼き | 4 |
| cuisine_token_has_no_measured_demand_tapioka | 4 |
| cuisine_token_has_no_measured_demand_丼もの | 4 |
| cuisine_token_has_no_measured_demand_スペイン料理 | 4 |
| cuisine_token_has_no_measured_demand_インド、ネパール | 4 |
| cuisine_token_has_no_measured_demand_炉端焼き | 4 |
| cuisine_token_has_no_measured_demand_sona | 4 |
| cuisine_token_has_no_measured_demand_坦々麺 | 4 |
| cuisine_token_has_no_measured_demand_スパゲッティ | 4 |
| cuisine_token_has_no_measured_demand_きしめん | 4 |
| cuisine_token_has_no_measured_demand_buritto | 4 |
| cuisine_token_has_no_measured_demand_gibier | 4 |
| cuisine_token_has_no_measured_demand_焼き芋 | 4 |
| cuisine_token_has_no_measured_demand_akashiyaki | 4 |
| cuisine_token_has_no_measured_demand_seafood_bowl | 4 |
| cuisine_token_has_no_measured_demand_スリランカ料理 | 4 |
| cuisine_token_has_no_measured_demand_meat_pie | 4 |
| cuisine_token_has_no_measured_demand_tepanyaki | 4 |
| cuisine_token_has_no_measured_demand_串かつ | 4 |
| cuisine_token_has_no_measured_demand_おむすび | 4 |
| cuisine_token_has_no_measured_demand_chazuke | 4 |
| cuisine_token_has_no_measured_demand_パキスタン料理 | 4 |
| cuisine_token_has_no_measured_demand_mazesoba | 4 |
| cuisine_token_has_no_measured_demand_shumai | 4 |
| cuisine_token_has_no_measured_demand_チャンポン | 4 |
| cuisine_token_has_no_measured_demand_パフェ | 4 |
| cuisine_token_has_no_measured_demand_riceballs | 4 |
| cuisine_token_has_no_measured_demand_焼き菓子 | 4 |
| cuisine_token_has_no_measured_demand_五目ごはん | 4 |
| cuisine_token_has_no_measured_demand_ほうとう | 4 |
| cuisine_token_has_no_measured_demand__pâtisserie | 4 |
| cuisine_token_has_no_measured_demand_breakfa | 4 |
| cuisine_token_has_no_measured_demand_chineese | 4 |
| cuisine_token_has_no_measured_demand_cambodian_breakfast | 4 |
| cuisine_token_has_no_measured_demand_waffel | 4 |
| cuisine_token_has_no_measured_demand_fruits_and_juices | 4 |
| cuisine_token_has_no_measured_demand_tamaleria | 4 |
| cuisine_token_has_no_measured_demand_corrida | 4 |
| cuisine_token_has_no_measured_demand_rosticería | 4 |
| cuisine_token_has_no_measured_demand_pancita | 4 |
| cuisine_token_has_no_measured_demand_botana | 4 |
| cuisine_token_has_no_measured_demand_yucatan | 4 |
| cuisine_token_has_no_measured_demand_pulque | 4 |
| cuisine_token_has_no_measured_demand_consome | 4 |
| cuisine_token_has_no_measured_demand_tamalería | 4 |
| cuisine_token_has_no_measured_demand_tlayudas | 4 |
| cuisine_token_has_no_measured_demand_istmeña | 4 |
| cuisine_token_has_no_measured_demand_chorizo | 4 |
| cuisine_token_has_no_measured_demand_tacos_de_mariscos | 4 |
| cuisine_token_has_no_measured_demand_comida_rápida | 4 |
| cuisine_token_has_no_measured_demand_tematica | 4 |
| cuisine_token_has_no_measured_demand_burros | 4 |
| cuisine_token_has_no_measured_demand_torteria_mexicana | 4 |
| cuisine_token_has_no_measured_demand_lomo | 4 |
| cuisine_token_has_no_measured_demand_oaxaca | 4 |
| cuisine_token_has_no_measured_demand_papas | 4 |
| cuisine_token_has_no_measured_demand_tacos_suaves | 4 |
| cuisine_token_has_no_measured_demand_ceviches | 4 |
| cuisine_token_has_no_measured_demand_menudo | 4 |
| cuisine_token_has_no_measured_demand_haiti | 4 |
| cuisine_token_has_no_measured_demand_spicy_buffalo_wings. | 4 |
| cuisine_token_has_no_measured_demand_hakka | 4 |
| cuisine_token_has_no_measured_demand_chinese_cuisine | 4 |
| cuisine_token_has_no_measured_demand_chinese_chicken_rice | 4 |
| cuisine_token_has_no_measured_demand_kaya_toast | 4 |
| cuisine_token_has_no_measured_demand_hawker_center | 4 |
| cuisine_token_has_no_measured_demand_stall | 4 |
| cuisine_token_has_no_measured_demand_mee | 4 |
| cuisine_token_has_no_measured_demand_mille_crepe | 4 |
| cuisine_token_has_no_measured_demand_mee_goreng_mamak | 4 |
| cuisine_token_has_no_measured_demand_hainanese_chicken_rice | 4 |
| cuisine_token_has_no_measured_demand_malay_food | 4 |
| cuisine_token_has_no_measured_demand_modern_malaysian | 4 |
| cuisine_token_has_no_measured_demand_frog | 4 |
| cuisine_token_has_no_measured_demand_penang | 4 |
| cuisine_token_has_no_measured_demand_kedai_kopi | 4 |
| cuisine_token_has_no_measured_demand_rice:noodles | 4 |
| cuisine_token_has_no_measured_demand_soy | 4 |
| cuisine_token_has_no_measured_demand_chinese_restaurant | 4 |
| cuisine_token_has_no_measured_demand_chicken_tenders | 4 |
| cuisine_token_has_no_measured_demand_antillean | 4 |
| cuisine_token_has_no_measured_demand_snac | 4 |
| cuisine_token_has_no_measured_demand_gastrobar | 4 |
| cuisine_token_has_no_measured_demand__lunch | 4 |
| cuisine_token_has_no_measured_demand_kids | 4 |
| cuisine_token_has_no_measured_demand_shared_dining | 4 |
| cuisine_token_has_no_measured_demand_slush | 4 |
| cuisine_token_has_no_measured_demand_tapsilogan | 4 |
| cuisine_token_has_no_measured_demand_mutton | 4 |
| cuisine_token_has_no_measured_demand_american_diner | 4 |
| cuisine_token_has_no_measured_demand_ilocano | 4 |
| cuisine_token_has_no_measured_demand_halohalo | 4 |
| cuisine_token_has_no_measured_demand_bagnet | 4 |
| cuisine_token_has_no_measured_demand_buns | 4 |
| cuisine_token_has_no_measured_demand_liempo | 4 |
| cuisine_token_has_no_measured_demand_balut | 4 |
| cuisine_token_has_no_measured_demand_rice_cakes | 4 |
| cuisine_token_has_no_measured_demand_kakanin | 4 |
| cuisine_token_has_no_measured_demand_mango_shake | 4 |
| cuisine_token_has_no_measured_demand_korean_food | 4 |
| cuisine_token_has_no_measured_demand_wagyu | 4 |
| cuisine_token_has_no_measured_demand_siopao | 4 |
| cuisine_token_has_no_measured_demand_korean_fried_chicken | 4 |
| cuisine_token_has_no_measured_demand_hokkien | 4 |
| cuisine_token_has_no_measured_demand_kuchnia_orientalna | 4 |
| cuisine_token_has_no_measured_demand_europejska | 4 |
| cuisine_token_has_no_measured_demand_ryby | 4 |
| cuisine_token_has_no_measured_demand__fastfood | 4 |
| cuisine_token_has_no_measured_demand_crimean | 4 |
| cuisine_token_has_no_measured_demand_kuchnia_polska | 4 |
| cuisine_token_has_no_measured_demand_wina | 4 |
| cuisine_token_has_no_measured_demand_restauracja | 4 |
| cuisine_token_has_no_measured_demand_naleśniki | 4 |
| cuisine_token_has_no_measured_demand_gruzińska | 4 |
| cuisine_token_has_no_measured_demand_piwo | 4 |
| cuisine_token_has_no_measured_demand_belarusian | 4 |
| cuisine_token_has_no_measured_demand_ramen:asian | 4 |
| cuisine_token_has_no_measured_demand_bifanas | 4 |
| cuisine_token_has_no_measured_demand_bifana | 4 |
| cuisine_token_has_no_measured_demand_vinho | 4 |
| cuisine_token_has_no_measured_demand_frukost | 4 |
| cuisine_token_has_no_measured_demand_kolgrill | 4 |
| cuisine_token_has_no_measured_demand_glass | 4 |
| cuisine_token_has_no_measured_demand_mellanöstern | 4 |
| cuisine_token_has_no_measured_demand_schnizel | 4 |
| cuisine_token_has_no_measured_demand_hainanese_western | 4 |
| cuisine_token_has_no_measured_demand_soup_restaurant | 4 |
| cuisine_token_has_no_measured_demand_events | 4 |
| cuisine_token_has_no_measured_demand_breakf | 4 |
| cuisine_token_has_no_measured_demand_sandviç | 4 |
| cuisine_token_has_no_measured_demand_ayvalık_tostu | 4 |
| cuisine_token_has_no_measured_demand_patates | 4 |
| cuisine_token_has_no_measured_demand_midye | 4 |
| cuisine_token_has_no_measured_demand_kaşarlı_pide | 4 |
| cuisine_token_has_no_measured_demand_kıymalı_pide | 4 |
| cuisine_token_has_no_measured_demand_şırdan | 4 |
| cuisine_token_has_no_measured_demand_ciğer | 4 |
| cuisine_token_has_no_measured_demand_simit | 4 |
| cuisine_token_has_no_measured_demand_çikolata | 4 |
| cuisine_token_has_no_measured_demand_latin_fusion | 4 |
| cuisine_token_has_no_measured_demand_cannabis | 4 |
| cuisine_token_has_no_measured_demand_belizean | 4 |
| cuisine_token_has_no_measured_demand_italian_beef | 4 |
| cuisine_token_has_no_measured_demand_pickles | 4 |
| cuisine_token_has_no_measured_demand_healthy_wraps | 4 |
| cuisine_token_has_no_measured_demand_wheatgrass_shots | 4 |
| cuisine_token_has_no_measured_demand_ginger_shots | 4 |
| cuisine_token_has_no_measured_demand_banquet | 4 |
| cuisine_token_has_no_measured_demand_herbalife | 4 |
| cuisine_token_has_no_measured_demand_french_canadian | 4 |
| cuisine_token_has_no_measured_demand_carribean | 4 |
| cuisine_token_has_no_measured_demand_turkey | 4 |
| cuisine_token_has_no_measured_demand_mediterranean_restaurant | 4 |
| cuisine_token_has_no_measured_demand_el_salvadorian | 4 |
| cuisine_token_has_no_measured_demand_ame | 4 |
| cuisine_token_has_no_measured_demand_central_asian | 4 |
| cuisine_token_has_no_measured_demand_soju | 4 |
| cuisine_token_has_no_measured_demand_bourbon | 4 |
| cuisine_token_has_no_measured_demand_breadsticks | 4 |
| cuisine_token_has_no_measured_demand_chowder | 4 |
| cuisine_token_has_no_measured_demand_gimbap | 4 |
| cuisine_token_has_no_measured_demand_indo-chinese | 4 |
| cuisine_token_has_no_measured_demand_family_style | 4 |
| cuisine_token_has_no_measured_demand_afgan | 4 |
| cuisine_token_has_no_measured_demand_panamanian | 4 |
| cuisine_token_has_no_measured_demand_northern_chinese | 4 |
| cuisine_token_has_no_measured_demand_sandwich_shop | 4 |
| cuisine_token_has_no_measured_demand_cheesesteaks | 4 |
| cuisine_token_has_no_measured_demand_corndog | 4 |
| cuisine_token_has_no_measured_demand_steak_sub | 4 |
| cuisine_token_has_no_measured_demand_coastal | 4 |
| cuisine_token_has_no_measured_demand_chicken_salad | 4 |
| cuisine_token_has_no_measured_demand_hatian | 4 |
| cuisine_token_has_no_measured_demand_chicago | 4 |
| cuisine_token_has_no_measured_demand_shave_ice | 4 |
| cuisine_token_has_no_measured_demand_caffeine | 4 |
| cuisine_token_has_no_measured_demand_energy | 4 |
| cuisine_token_has_no_measured_demand_crawfish | 4 |
| cuisine_token_has_no_measured_demand_scandanavian | 4 |
| cuisine_token_has_no_measured_demand_mexican_food | 4 |
| cuisine_token_has_no_measured_demand_pupusas | 4 |
| cuisine_token_has_no_measured_demand_poki | 4 |
| cuisine_token_has_no_measured_demand_contemporary_american | 4 |
| cuisine_token_has_no_measured_demand_miso | 4 |
| cuisine_token_has_no_measured_demand_chirashi | 4 |
| cuisine_token_has_no_measured_demand_hủ_tiếu | 4 |
| cuisine_token_has_no_measured_demand_guamanian | 4 |
| cuisine_token_has_no_measured_demand_bánh_xèo | 4 |
| cuisine_token_has_no_measured_demand_sonoran | 4 |
| cuisine_token_has_no_measured_demand_chè | 4 |
| place_polygon_degenerate | 3 |
| cuisine_token_has_no_measured_demand_meals | 3 |
| cuisine_token_has_no_measured_demand_home_cooking | 3 |
| cuisine_token_has_no_measured_demand__steak_house | 3 |
| cuisine_token_has_no_measured_demand__haute_cuisine | 3 |
| cuisine_token_has_no_measured_demand_tyrolian | 3 |
| cuisine_token_has_no_measured_demand_roll | 3 |
| cuisine_token_has_no_measured_demand_nudle | 3 |
| cuisine_token_has_no_measured_demand_hausmannskost | 3 |
| cuisine_token_has_no_measured_demand_mittagessen | 3 |
| cuisine_token_has_no_measured_demand_ayurveda | 3 |
| cuisine_token_has_no_measured_demand_hot_food | 3 |
| cuisine_token_has_no_measured_demand_viking | 3 |
| cuisine_token_has_no_measured_demand_cinnamon_bun | 3 |
| cuisine_token_has_no_measured_demand_saudi | 3 |
| cuisine_token_has_no_measured_demand_cevapi | 3 |
| cuisine_token_has_no_measured_demand_table_d'hôtes | 3 |
| cuisine_token_has_no_measured_demand_bourgondisch | 3 |
| cuisine_token_has_no_measured_demand_petite_restauration | 3 |
| cuisine_token_has_no_measured_demand__xis | 3 |
| cuisine_token_has_no_measured_demand__porções | 3 |
| cuisine_token_has_no_measured_demand_française | 3 |
| cuisine_token_has_no_measured_demand_galinha_caipira | 3 |
| cuisine_token_has_no_measured_demand_peixe_frito | 3 |
| cuisine_token_has_no_measured_demand_sobremesas | 3 |
| cuisine_token_has_no_measured_demand_assados | 3 |
| cuisine_token_has_no_measured_demand__drinks | 3 |
| cuisine_token_has_no_measured_demand_cantine_d'entreprise | 3 |
| cuisine_token_has_no_measured_demand_charbonnade | 3 |
| cuisine_token_has_no_measured_demand_gambas | 3 |
| cuisine_token_has_no_measured_demand_petit_déjeuner | 3 |
| cuisine_token_has_no_measured_demand_erythrean | 3 |
| cuisine_token_has_no_measured_demand_schiacciate | 3 |
| cuisine_token_has_no_measured_demand_mediterran | 3 |
| cuisine_token_has_no_measured_demand_philipine | 3 |
| cuisine_token_has_no_measured_demand_perch_fillet | 3 |
| cuisine_token_has_no_measured_demand_malaisienne | 3 |
| cuisine_token_has_no_measured_demand_singapourienne | 3 |
| cuisine_token_has_no_measured_demand_grotto | 3 |
| cuisine_token_has_no_measured_demand_rösti | 3 |
| cuisine_token_has_no_measured_demand_fait_maison | 3 |
| cuisine_token_has_no_measured_demand_focacceria | 3 |
| cuisine_token_has_no_measured_demand_reg | 3 |
| cuisine_token_has_no_measured_demand_deutsch | 3 |
| cuisine_token_has_no_measured_demand_salate | 3 |
| cuisine_token_has_no_measured_demand_taccos | 3 |
| cuisine_token_has_no_measured_demand_softdrinks | 3 |
| cuisine_token_has_no_measured_demand_bagle | 3 |
| cuisine_token_has_no_measured_demand_halloumi | 3 |
| cuisine_token_has_no_measured_demand_schwenkbraten | 3 |
| cuisine_token_has_no_measured_demand_manakish | 3 |
| cuisine_token_has_no_measured_demand_suckling_pig | 3 |
| cuisine_token_has_no_measured_demand_italia | 3 |
| cuisine_token_has_no_measured_demand_loaded_fries | 3 |
| cuisine_token_has_no_measured_demand_intern | 3 |
| cuisine_token_has_no_measured_demand_cocina_de_autor | 3 |
| cuisine_token_has_no_measured_demand_ecológica | 3 |
| cuisine_token_has_no_measured_demand_basca | 3 |
| cuisine_token_has_no_measured_demand_platos_combinados | 3 |
| cuisine_token_has_no_measured_demand_comidas | 3 |
| cuisine_token_has_no_measured_demand_manchega | 3 |
| cuisine_token_has_no_measured_demand_mediterránea | 3 |
| cuisine_token_has_no_measured_demand_sunday_lunch | 3 |
| cuisine_token_has_no_measured_demand_km0 | 3 |
| cuisine_token_has_no_measured_demand_gril | 3 |
| cuisine_token_has_no_measured_demand_bouchon_lyonnais | 3 |
| cuisine_token_has_no_measured_demand_végétarienne | 3 |
| cuisine_token_has_no_measured_demand_polonaise | 3 |
| cuisine_token_has_no_measured_demand_boisson | 3 |
| cuisine_token_has_no_measured_demand_patisseries | 3 |
| cuisine_token_has_no_measured_demand_moderne | 3 |
| cuisine_token_has_no_measured_demand_créative | 3 |
| cuisine_token_has_no_measured_demand_burgundian | 3 |
| cuisine_token_has_no_measured_demand_snacking | 3 |
| cuisine_token_has_no_measured_demand_restauration_rapide | 3 |
| cuisine_token_has_no_measured_demand_tai | 3 |
| cuisine_token_has_no_measured_demand_pates | 3 |
| cuisine_token_has_no_measured_demand_children | 3 |
| cuisine_token_has_no_measured_demand_poké_bowls | 3 |
| cuisine_token_has_no_measured_demand_tartes_flambées | 3 |
| cuisine_token_has_no_measured_demand_gastro | 3 |
| cuisine_token_has_no_measured_demand_cornish_pasty | 3 |
| cuisine_token_has_no_measured_demand_hot_snacks | 3 |
| cuisine_token_has_no_measured_demand_gin | 3 |
| cuisine_token_has_no_measured_demand_batak | 3 |
| cuisine_token_has_no_measured_demand_chicken_noodle | 3 |
| cuisine_token_has_no_measured_demand_tempeh | 3 |
| cuisine_token_has_no_measured_demand_ceker | 3 |
| cuisine_token_has_no_measured_demand_padangnese | 3 |
| cuisine_token_has_no_measured_demand_makanan | 3 |
| cuisine_token_has_no_measured_demand_minuman | 3 |
| cuisine_token_has_no_measured_demand_gule | 3 |
| cuisine_token_has_no_measured_demand_honey | 3 |
| cuisine_token_has_no_measured_demand_wedding_venue | 3 |
| cuisine_token_has_no_measured_demand_int | 3 |
| cuisine_token_has_no_measured_demand_grilled_meat | 3 |
| cuisine_token_has_no_measured_demand_polenta | 3 |
| cuisine_token_has_no_measured_demand_lucana | 3 |
| cuisine_token_has_no_measured_demand_dolci | 3 |
| cuisine_token_has_no_measured_demand_cuoppo | 3 |
| cuisine_token_has_no_measured_demand_mantovana | 3 |
| cuisine_token_has_no_measured_demand_五平餅 | 3 |
| cuisine_token_has_no_measured_demand_ジェラート | 3 |
| cuisine_token_has_no_measured_demand_noodle:ramen | 3 |
| cuisine_token_has_no_measured_demand_coffee_beans | 3 |
| cuisine_token_has_no_measured_demand_西洋料理 | 3 |
| cuisine_token_has_no_measured_demand__dessert | 3 |
| cuisine_token_has_no_measured_demand_western_food | 3 |
| cuisine_token_has_no_measured_demand_タコス | 3 |
| cuisine_token_has_no_measured_demand_shabu-shabu | 3 |
| cuisine_token_has_no_measured_demand_天麩羅 | 3 |
| cuisine_token_has_no_measured_demand_担々麵 | 3 |
| cuisine_token_has_no_measured_demand_el_salvador | 3 |
| cuisine_token_has_no_measured_demand_和菓子 | 3 |
| cuisine_token_has_no_measured_demand__café | 3 |
| cuisine_token_has_no_measured_demand__regional | 3 |
| cuisine_token_has_no_measured_demand__etc | 3 |
| cuisine_token_has_no_measured_demand_tacos_de_barbacoa | 3 |
| cuisine_token_has_no_measured_demand_oaxaqueña | 3 |
| cuisine_token_has_no_measured_demand_buffalo_wings | 3 |
| cuisine_token_has_no_measured_demand_marquesitas | 3 |
| cuisine_token_has_no_measured_demand_tamale | 3 |
| cuisine_token_has_no_measured_demand__etc. | 3 |
| cuisine_token_has_no_measured_demand_indian_food | 3 |
| cuisine_token_has_no_measured_demand_indian_restaurant | 3 |
| cuisine_token_has_no_measured_demand_kedai_makanan | 3 |
| cuisine_token_has_no_measured_demand_abc | 3 |
| cuisine_token_has_no_measured_demand_koffie | 3 |
| cuisine_token_has_no_measured_demand_kapsalon | 3 |
| cuisine_token_has_no_measured_demand_silog_meals | 3 |
| cuisine_token_has_no_measured_demand_kbbq | 3 |
| cuisine_token_has_no_measured_demand_cacao | 3 |
| cuisine_token_has_no_measured_demand_kawa | 3 |
| cuisine_token_has_no_measured_demand_kashubian | 3 |
| cuisine_token_has_no_measured_demand_mercearia | 3 |
| cuisine_token_has_no_measured_demand_alentejana | 3 |
| cuisine_token_has_no_measured_demand_smörgåsar | 3 |
| cuisine_token_has_no_measured_demand__kahve | 3 |
| cuisine_token_has_no_measured_demand_tur | 3 |
| cuisine_token_has_no_measured_demand_izgara | 3 |
| cuisine_token_has_no_measured_demand_karides | 3 |
| cuisine_token_has_no_measured_demand_cheese_curds | 3 |
| cuisine_token_has_no_measured_demand_fudge | 3 |
| cuisine_token_has_no_measured_demand_prime_rib | 3 |
| cuisine_token_has_no_measured_demand_grinders | 3 |
| cuisine_token_has_no_measured_demand_water_ice | 3 |
| cuisine_token_has_no_measured_demand_soda_shop | 3 |
| cuisine_token_has_no_measured_demand_pit_beef | 3 |
| cuisine_token_has_no_measured_demand_tex | 3 |
| cuisine_token_has_no_measured_demand_margarita | 3 |
| cuisine_token_has_no_measured_demand_lebanese_wraps | 2 |
| cuisine_token_has_no_measured_demand_northern_indian | 2 |
| cuisine_token_has_no_measured_demand_lebanese_sweets | 2 |
| cuisine_token_has_no_measured_demand_manaqish | 2 |
| cuisine_token_has_no_measured_demand_satvik | 2 |
| cuisine_token_has_no_measured_demand_beef_tenderloin | 2 |
| cuisine_token_has_no_measured_demand_adana_kebab | 2 |
| cuisine_token_has_no_measured_demand_grilled_meat_balls | 2 |
| cuisine_token_has_no_measured_demand_lamb_shish_kebab | 2 |
| cuisine_token_has_no_measured_demand_lamb_chops | 2 |
| cuisine_token_has_no_measured_demand_chicken_special | 2 |
| cuisine_token_has_no_measured_demand_chicken_cubes | 2 |
| cuisine_token_has_no_measured_demand_beyti_kebab | 2 |
| cuisine_token_has_no_measured_demand_chi | 2 |
| cuisine_token_has_no_measured_demand_breakfast_restaurant | 2 |
| cuisine_token_has_no_measured_demand_leb | 2 |
| cuisine_token_has_no_measured_demand_pakiatani | 2 |
| cuisine_token_has_no_measured_demand_appitizers | 2 |
| cuisine_token_has_no_measured_demand_butter_chicken | 2 |
| cuisine_token_has_no_measured_demand_pork_chops | 2 |
| cuisine_token_has_no_measured_demand_tikka_masala | 2 |
| cuisine_token_has_no_measured_demand_malabar | 2 |
| cuisine_token_has_no_measured_demand_japanese_breads | 2 |
| cuisine_token_has_no_measured_demand_hot_coffee | 2 |
| cuisine_token_has_no_measured_demand_cold_coffee | 2 |
| cuisine_token_has_no_measured_demand_mojito | 2 |
| cuisine_token_has_no_measured_demand_chat | 2 |
| cuisine_token_has_no_measured_demand_uae | 2 |
| cuisine_token_has_no_measured_demand_pad_thai | 2 |
| cuisine_token_has_no_measured_demand_rice_plate | 2 |
| cuisine_token_has_no_measured_demand_porotta | 2 |
| cuisine_token_has_no_measured_demand_mojitos | 2 |
| cuisine_token_has_no_measured_demand_indian/kerala_cafeteria | 2 |
| cuisine_token_has_no_measured_demand_smoked | 2 |
| cuisine_token_has_no_measured_demand__thai | 2 |
| cuisine_token_has_no_measured_demand__noodles | 2 |
| cuisine_token_has_no_measured_demand_lassi | 2 |
| cuisine_token_has_no_measured_demand_gifting | 2 |
| cuisine_token_has_no_measured_demand_broccoli | 2 |
| cuisine_token_has_no_measured_demand_5-elemente | 2 |
| cuisine_token_has_no_measured_demand_rumanian | 2 |
| cuisine_token_has_no_measured_demand_east_asian | 2 |
| cuisine_token_has_no_measured_demand_backery | 2 |
| cuisine_token_has_no_measured_demand_rund_um_die_welt | 2 |
| cuisine_token_has_no_measured_demand_wiener | 2 |
| cuisine_token_has_no_measured_demand_american_burger | 2 |
| cuisine_token_has_no_measured_demand_magyar | 2 |
| cuisine_token_has_no_measured_demand_hallumi | 2 |
| cuisine_token_has_no_measured_demand_calf | 2 |
| cuisine_token_has_no_measured_demand_cake_and_coffee | 2 |
| cuisine_token_has_no_measured_demand_maroni | 2 |
| cuisine_token_has_no_measured_demand_krapfen | 2 |
| cuisine_token_has_no_measured_demand_bosna | 2 |
| cuisine_token_has_no_measured_demand_none | 2 |
| cuisine_token_has_no_measured_demand_freegan_food | 2 |
| cuisine_token_has_no_measured_demand_leberkässemmeln | 2 |
| cuisine_token_has_no_measured_demand_pralinen | 2 |
| cuisine_token_has_no_measured_demand_vienniese | 2 |
| cuisine_token_has_no_measured_demand_flexitarisch | 2 |
| cuisine_token_has_no_measured_demand_suppe | 2 |
| cuisine_token_has_no_measured_demand_bubble_waffle | 2 |
| cuisine_token_has_no_measured_demand_fatteh | 2 |
| cuisine_token_has_no_measured_demand_macaroon | 2 |
| cuisine_token_has_no_measured_demand_poke-bowl | 2 |
| cuisine_token_has_no_measured_demand_latinoamericana | 2 |
| cuisine_token_has_no_measured_demand_lateinamerikanische | 2 |
| cuisine_token_has_no_measured_demand_latina-american | 2 |
| cuisine_token_has_no_measured_demand_cocktailbar | 2 |
| cuisine_token_has_no_measured_demand_leberkäse | 2 |
| cuisine_token_has_no_measured_demand_menü | 2 |
| cuisine_token_has_no_measured_demand_roast_chicken_and_meats | 2 |
| cuisine_token_has_no_measured_demand_charcoal_chicken | 2 |
| cuisine_token_has_no_measured_demand_homestyle | 2 |
| cuisine_token_has_no_measured_demand_mainstream_australian | 2 |
| cuisine_token_has_no_measured_demand_wood_fire_pizza | 2 |
| cuisine_token_has_no_measured_demand_mixed_(indian) | 2 |
| cuisine_token_has_no_measured_demand_meat_grill | 2 |
| cuisine_token_has_no_measured_demand_modern_licenced_cafe | 2 |
| cuisine_token_has_no_measured_demand_modern_greek | 2 |
| cuisine_token_has_no_measured_demand_hot_potatoes | 2 |
| cuisine_token_has_no_measured_demand__coffee_shop | 2 |
| cuisine_token_has_no_measured_demand_chicken_and_chips | 2 |
| cuisine_token_has_no_measured_demand_australian_cafe | 2 |
| cuisine_token_has_no_measured_demand_meat_pies | 2 |
| cuisine_token_has_no_measured_demand_macedonian | 2 |
| cuisine_token_has_no_measured_demand_crayfish | 2 |
| cuisine_token_has_no_measured_demand_chocolat | 2 |
| cuisine_token_has_no_measured_demand_spicy_drinks | 2 |
| cuisine_token_has_no_measured_demand_cheese_platters | 2 |
| cuisine_token_has_no_measured_demand_gourmet_food | 2 |
| cuisine_token_has_no_measured_demand_roaster | 2 |
| cuisine_token_has_no_measured_demand_cana | 2 |
| cuisine_token_has_no_measured_demand_vagan | 2 |
| cuisine_token_has_no_measured_demand_western_australian | 2 |
| cuisine_token_has_no_measured_demand_balinese_fusion | 2 |
| cuisine_token_has_no_measured_demand_chicken_parmigiana | 2 |
| cuisine_token_has_no_measured_demand_manoush | 2 |
| cuisine_token_has_no_measured_demand_plates | 2 |
| cuisine_token_has_no_measured_demand_mozzarella | 2 |
| cuisine_token_has_no_measured_demand_parma | 2 |
| cuisine_token_has_no_measured_demand_gourmet_cookie | 2 |
| cuisine_token_has_no_measured_demand_gourmet_burger | 2 |
| cuisine_token_has_no_measured_demand_guokui | 2 |
| cuisine_token_has_no_measured_demand_whisky | 2 |
| cuisine_token_has_no_measured_demand_rib | 2 |
| cuisine_token_has_no_measured_demand_yiros | 2 |
| cuisine_token_has_no_measured_demand_seasonal_modern | 2 |
| cuisine_token_has_no_measured_demand_norse | 2 |
| cuisine_token_has_no_measured_demand_bánh_mì | 2 |
| cuisine_token_has_no_measured_demand_tang | 2 |
| cuisine_token_has_no_measured_demand_dum | 2 |
| cuisine_token_has_no_measured_demand_gozleme | 2 |
| cuisine_token_has_no_measured_demand_prawn | 2 |
| cuisine_token_has_no_measured_demand_slice | 2 |
| cuisine_token_has_no_measured_demand_indian_street_food | 2 |
| cuisine_token_has_no_measured_demand_south_africa | 2 |
| cuisine_token_has_no_measured_demand_sand | 2 |
| cuisine_token_has_no_measured_demand_cours_de_cuisine | 2 |
| cuisine_token_has_no_measured_demand_cornetpizza | 2 |
| cuisine_token_has_no_measured_demand_softijs | 2 |
| cuisine_token_has_no_measured_demand_apéro | 2 |
| cuisine_token_has_no_measured_demand_restaurant_gastronomique | 2 |
| cuisine_token_has_no_measured_demand_breakfast_and_lunch | 2 |
| cuisine_token_has_no_measured_demand_ribbs | 2 |
| cuisine_token_has_no_measured_demand_boterhammen | 2 |
| cuisine_token_has_no_measured_demand_lunch_&_brunch | 2 |
| cuisine_token_has_no_measured_demand_kazakhe | 2 |
| cuisine_token_has_no_measured_demand_vlaams | 2 |
| cuisine_token_has_no_measured_demand_warm_dishes | 2 |
| cuisine_token_has_no_measured_demand_pizza-kebab | 2 |
| cuisine_token_has_no_measured_demand__wafels | 2 |
| cuisine_token_has_no_measured_demand_coffee_bar | 2 |
| cuisine_token_has_no_measured_demand_frisdranken | 2 |
| cuisine_token_has_no_measured_demand_kaaskroket | 2 |
| cuisine_token_has_no_measured_demand_italiaanse_ijsjes | 2 |
| cuisine_token_has_no_measured_demand_lactose_vrij | 2 |
| cuisine_token_has_no_measured_demand_zoete_lekkernijen | 2 |
| cuisine_token_has_no_measured_demand_varia | 2 |
| cuisine_token_has_no_measured_demand_table_du_terroir | 2 |
| cuisine_token_has_no_measured_demand_frisdrank | 2 |
| cuisine_token_has_no_measured_demand_west_africa | 2 |
| cuisine_token_has_no_measured_demand_taverne_-_restaurant | 2 |
| cuisine_token_has_no_measured_demand_restaurant_social | 2 |
| cuisine_token_has_no_measured_demand_traiteur_à_domicile | 2 |
| cuisine_token_has_no_measured_demand_thee | 2 |
| cuisine_token_has_no_measured_demand_soep | 2 |
| cuisine_token_has_no_measured_demand_kosovar | 2 |
| cuisine_token_has_no_measured_demand_pokebowl_burrito_sushi | 2 |
| cuisine_token_has_no_measured_demand_chocomelk | 2 |
| cuisine_token_has_no_measured_demand_chocolate_milk | 2 |
| cuisine_token_has_no_measured_demand_familiale_de_saison | 2 |
| cuisine_token_has_no_measured_demand_algemene_keuken | 2 |
| cuisine_token_has_no_measured_demand_huiselijk | 2 |
| cuisine_token_has_no_measured_demand_lunch_bar | 2 |
| cuisine_token_has_no_measured_demand_aperitief | 2 |
| cuisine_token_has_no_measured_demand_homemade_dishes | 2 |
| cuisine_token_has_no_measured_demand_allergenenvrij | 2 |
| cuisine_token_has_no_measured_demand_painza | 2 |
| cuisine_token_has_no_measured_demand_seizoen_gerechten | 2 |
| cuisine_token_has_no_measured_demand_culinair_eten | 2 |
| cuisine_token_has_no_measured_demand_mashed_potatoes | 2 |
| cuisine_token_has_no_measured_demand_belgium | 2 |
| cuisine_token_has_no_measured_demand_fançaise | 2 |
| cuisine_token_has_no_measured_demand_gekoelde_dranken | 2 |
| cuisine_token_has_no_measured_demand_brusselse_wafels | 2 |
| cuisine_token_has_no_measured_demand_generic | 2 |
| cuisine_token_has_no_measured_demand_japanese_sushi | 2 |
| cuisine_token_has_no_measured_demand_tunesisch | 2 |
| cuisine_token_has_no_measured_demand_belgisch | 2 |
| cuisine_token_has_no_measured_demand_koude_schotel | 2 |
| cuisine_token_has_no_measured_demand_oriental_food | 2 |
| cuisine_token_has_no_measured_demand_broodjes | 2 |
| cuisine_token_has_no_measured_demand_mineira_and_italiana | 2 |
| cuisine_token_has_no_measured_demand_oriental_e_massas | 2 |
| cuisine_token_has_no_measured_demand_academia | 2 |
| cuisine_token_has_no_measured_demand_poland | 2 |
| cuisine_token_has_no_measured_demand_janta | 2 |
| cuisine_token_has_no_measured_demand__bebidas | 2 |
| cuisine_token_has_no_measured_demand_quitandas | 2 |
| cuisine_token_has_no_measured_demand_natalina | 2 |
| cuisine_token_has_no_measured_demand_rodisio | 2 |
| cuisine_token_has_no_measured_demand_prato_executivo | 2 |
| cuisine_token_has_no_measured_demand_crepioca | 2 |
| cuisine_token_has_no_measured_demand_ovos_mexidos | 2 |
| cuisine_token_has_no_measured_demand__deli_e_padaria | 2 |
| cuisine_token_has_no_measured_demand__all_you_can_eat | 2 |
| cuisine_token_has_no_measured_demand_florianopolitano | 2 |
| cuisine_token_has_no_measured_demand_doces_finos | 2 |
| cuisine_token_has_no_measured_demand__bem_casados_e_cup_cakes | 2 |
| cuisine_token_has_no_measured_demand_pamonharia | 2 |
| cuisine_token_has_no_measured_demand_costela | 2 |
| cuisine_token_has_no_measured_demand_per_kilo | 2 |
| cuisine_token_has_no_measured_demand__refrigerantes | 2 |
| cuisine_token_has_no_measured_demand_pastel_com_refrigerante | 2 |
| cuisine_token_has_no_measured_demand_mineiro | 2 |
| cuisine_token_has_no_measured_demand_galeteria | 2 |
| cuisine_token_has_no_measured_demand_salpicão | 2 |
| cuisine_token_has_no_measured_demand_maionese | 2 |
| cuisine_token_has_no_measured_demand_lasanha | 2 |
| cuisine_token_has_no_measured_demand_churrascaria_gaúcha | 2 |
| cuisine_token_has_no_measured_demand_comida_italiana | 2 |
| cuisine_token_has_no_measured_demand_café_e_lanche | 2 |
| cuisine_token_has_no_measured_demand_sucos_e_lanches | 2 |
| cuisine_token_has_no_measured_demand_pizza_e_bar | 2 |
| cuisine_token_has_no_measured_demand__sucos | 2 |
| cuisine_token_has_no_measured_demand__macarrão | 2 |
| cuisine_token_has_no_measured_demand_pizza_e_churascaria | 2 |
| cuisine_token_has_no_measured_demand_paraense | 2 |
| cuisine_token_has_no_measured_demand_churrasco. | 2 |
| cuisine_token_has_no_measured_demand_esfiharia | 2 |
| cuisine_token_has_no_measured_demand_pizza_delivery | 2 |
| cuisine_token_has_no_measured_demand_peixada | 2 |
| cuisine_token_has_no_measured_demand__italiana. | 2 |
| cuisine_token_has_no_measured_demand_sorvetes | 2 |
| cuisine_token_has_no_measured_demand_amburguer | 2 |
| cuisine_token_has_no_measured_demand__bolos | 2 |
| cuisine_token_has_no_measured_demand__doces | 2 |
| cuisine_token_has_no_measured_demand_fast | 2 |
| cuisine_token_has_no_measured_demand_tira_gotos | 2 |
| cuisine_token_has_no_measured_demand_bebidas_em_geral | 2 |
| cuisine_token_has_no_measured_demand__self-service | 2 |
| cuisine_token_has_no_measured_demand_carne_seca_com_aipim | 2 |
| cuisine_token_has_no_measured_demand__almoço | 2 |
| cuisine_token_has_no_measured_demand__churrasco | 2 |
| cuisine_token_has_no_measured_demand__pizza. | 2 |
| cuisine_token_has_no_measured_demand_chocolate_+_coffee | 2 |
| cuisine_token_has_no_measured_demand_pizzaria_zero_hora | 2 |
| cuisine_token_has_no_measured_demand_massas_e_pastelaria | 2 |
| cuisine_token_has_no_measured_demand_sanduíches | 2 |
| cuisine_token_has_no_measured_demand__sorveteria | 2 |
| cuisine_token_has_no_measured_demand_açaí_e_tapiocas | 2 |
| cuisine_token_has_no_measured_demand_pickle | 2 |
| cuisine_token_has_no_measured_demand_coleslaw | 2 |
| cuisine_token_has_no_measured_demand_lox | 2 |
| cuisine_token_has_no_measured_demand__rodizio | 2 |
| cuisine_token_has_no_measured_demand_espetinhos_e_cia | 2 |
| cuisine_token_has_no_measured_demand_brasilean | 2 |
| cuisine_token_has_no_measured_demand_cone | 2 |
| cuisine_token_has_no_measured_demand_padaria_bar | 2 |
| cuisine_token_has_no_measured_demand_culinária_nordestina | 2 |
| cuisine_token_has_no_measured_demand_savory_pancak | 2 |
| cuisine_token_has_no_measured_demand_teko_cafeteria | 2 |
| cuisine_token_has_no_measured_demand__frios_e_tortas | 2 |
| cuisine_token_has_no_measured_demand_homo | 2 |
| cuisine_token_has_no_measured_demand_aral | 2 |
| cuisine_token_has_no_measured_demand_pizza_e_porções | 2 |
| cuisine_token_has_no_measured_demand__cozinha_italiana | 2 |
| cuisine_token_has_no_measured_demand_paatelaria | 2 |
| cuisine_token_has_no_measured_demand_hun | 2 |
| cuisine_token_has_no_measured_demand_buffet_por_kg_e_livre | 2 |
| cuisine_token_has_no_measured_demand_bread_and_coffee | 2 |
| cuisine_token_has_no_measured_demand_pancho | 2 |
| cuisine_token_has_no_measured_demand_pizza_e_churrascaria | 2 |
| cuisine_token_has_no_measured_demand_empadas | 2 |
| cuisine_token_has_no_measured_demand_fries_potatoes | 2 |
| cuisine_token_has_no_measured_demand_raw_fish | 2 |
| cuisine_token_has_no_measured_demand_steackhouse | 2 |
| cuisine_token_has_no_measured_demand_batata_e_pastel | 2 |
| cuisine_token_has_no_measured_demand_herbashakes | 2 |
| cuisine_token_has_no_measured_demand_coca_gelada | 2 |
| cuisine_token_has_no_measured_demand_simpatia | 2 |
| cuisine_token_has_no_measured_demand_esfira | 2 |
| cuisine_token_has_no_measured_demand_churascaria | 2 |
| cuisine_token_has_no_measured_demand_chivitos | 2 |
| cuisine_token_has_no_measured_demand_culinária_paraense | 2 |
| cuisine_token_has_no_measured_demand_carne_de_sol | 2 |
| cuisine_token_has_no_measured_demand_doces_portugueses | 2 |
| cuisine_token_has_no_measured_demand_culinária_portuguesa | 2 |
| cuisine_token_has_no_measured_demand_beirut | 2 |
| cuisine_token_has_no_measured_demand_mate | 2 |
| cuisine_token_has_no_measured_demand_quibes | 2 |
| cuisine_token_has_no_measured_demand_panc | 2 |
| cuisine_token_has_no_measured_demand_sun_dried_meat | 2 |
| cuisine_token_has_no_measured_demand_temaki | 2 |
| cuisine_token_has_no_measured_demand_coco | 2 |
| cuisine_token_has_no_measured_demand_beiju_de_tapioca | 2 |
| cuisine_token_has_no_measured_demand_marmitex_-_prato_feito | 2 |
| cuisine_token_has_no_measured_demand_música_ao_vivo | 2 |
| cuisine_token_has_no_measured_demand_self | 2 |
| cuisine_token_has_no_measured_demand_sanduiche_artesanal | 2 |
| cuisine_token_has_no_measured_demand_arroz_e_feijão | 2 |
| cuisine_token_has_no_measured_demand_$$_-_$$$ | 2 |
| cuisine_token_has_no_measured_demand_café_colonial | 2 |
| cuisine_token_has_no_measured_demand_hamburgeria | 2 |
| cuisine_token_has_no_measured_demand_salagados | 2 |
| cuisine_token_has_no_measured_demand_fogazza | 2 |
| cuisine_token_has_no_measured_demand_vergana | 2 |
| cuisine_token_has_no_measured_demand_petiscaria | 2 |
| cuisine_token_has_no_measured_demand_peixe_fritos | 2 |
| cuisine_token_has_no_measured_demand_sidão | 2 |
| cuisine_token_has_no_measured_demand_pratinho | 2 |
| cuisine_token_has_no_measured_demand_francesa | 2 |
| cuisine_token_has_no_measured_demand_açaiteria | 2 |
| cuisine_token_has_no_measured_demand_cachorro_qunete | 2 |
| cuisine_token_has_no_measured_demand_farofa | 2 |
| cuisine_token_has_no_measured_demand_petit-déjeuner | 2 |
| cuisine_token_has_no_measured_demand_tematic | 2 |
| cuisine_token_has_no_measured_demand_pollos | 2 |
| cuisine_token_has_no_measured_demand_comida_baiana | 2 |
| cuisine_token_has_no_measured_demand_cuzcuz_com_carne_seca | 2 |
| cuisine_token_has_no_measured_demand_entre_outros | 2 |
| cuisine_token_has_no_measured_demand_ovo | 2 |
| cuisine_token_has_no_measured_demand_miojo | 2 |
| cuisine_token_has_no_measured_demand_macarrão | 2 |
| cuisine_token_has_no_measured_demand_esfirraria | 2 |
| cuisine_token_has_no_measured_demand_picolé | 2 |
| cuisine_token_has_no_measured_demand_popsicles | 2 |
| cuisine_token_has_no_measured_demand_cachorro_quente_prensado | 2 |
| cuisine_token_has_no_measured_demand_hamburguer_artesanal | 2 |
| cuisine_token_has_no_measured_demand_omeletaria | 2 |
| cuisine_token_has_no_measured_demand_caiçara | 2 |
| cuisine_token_has_no_measured_demand_mini_salgados_e_churros | 2 |
| cuisine_token_has_no_measured_demand_saobremesas | 2 |
| cuisine_token_has_no_measured_demand_xis_burger | 2 |
| cuisine_token_has_no_measured_demand_xis_doce | 2 |
| cuisine_token_has_no_measured_demand_porções_&_drink's | 2 |
| cuisine_token_has_no_measured_demand_sucos_naturais | 2 |
| cuisine_token_has_no_measured_demand_cremes | 2 |
| cuisine_token_has_no_measured_demand_refrescos | 2 |
| cuisine_token_has_no_measured_demand_pao | 2 |
| cuisine_token_has_no_measured_demand_cudejoaao | 2 |
| cuisine_token_has_no_measured_demand_mel | 2 |
| cuisine_token_has_no_measured_demand_chopp_artesanal | 2 |
| cuisine_token_has_no_measured_demand_defumado | 2 |
| cuisine_token_has_no_measured_demand_lenha | 2 |
| cuisine_token_has_no_measured_demand_pitsmoker | 2 |
| cuisine_token_has_no_measured_demand_tipicas_da_região | 2 |
| cuisine_token_has_no_measured_demand_espetão | 2 |
| cuisine_token_has_no_measured_demand_carne_seca | 2 |
| cuisine_token_has_no_measured_demand_creme_de_morango | 2 |
| cuisine_token_has_no_measured_demand_salada_de_frutas | 2 |
| cuisine_token_has_no_measured_demand_conveniência | 2 |
| cuisine_token_has_no_measured_demand_água | 2 |
| cuisine_token_has_no_measured_demand_suco | 2 |
| cuisine_token_has_no_measured_demand_sanduiche_natural | 2 |
| cuisine_token_has_no_measured_demand_lachonete | 2 |
| cuisine_token_has_no_measured_demand_churros_salgado | 2 |
| cuisine_token_has_no_measured_demand_smash | 2 |
| cuisine_token_has_no_measured_demand_presentes | 2 |
| cuisine_token_has_no_measured_demand_cestas_café_da_manhã | 2 |
| cuisine_token_has_no_measured_demand_pao_brioche | 2 |
| cuisine_token_has_no_measured_demand_cheddar | 2 |
| cuisine_token_has_no_measured_demand_chocolateria | 2 |
| cuisine_token_has_no_measured_demand_tudo | 2 |
| cuisine_token_has_no_measured_demand_suco_natural | 2 |
| cuisine_token_has_no_measured_demand_x-tudo | 2 |
| cuisine_token_has_no_measured_demand_complexo_gastronomico | 2 |
| cuisine_token_has_no_measured_demand_costelas | 2 |
| cuisine_token_has_no_measured_demand_carnes_assadas | 2 |
| cuisine_token_has_no_measured_demand_aperitivos | 2 |
| cuisine_token_has_no_measured_demand_frango_americano | 2 |
| cuisine_token_has_no_measured_demand_picanharia | 2 |
| cuisine_token_has_no_measured_demand_comida_nordestina | 2 |
| cuisine_token_has_no_measured_demand_strogonoff | 2 |
| cuisine_token_has_no_measured_demand_salmão | 2 |
| cuisine_token_has_no_measured_demand_boliche | 2 |
| cuisine_token_has_no_measured_demand_jantinha | 2 |
| cuisine_token_has_no_measured_demand_artisinal | 2 |
| cuisine_token_has_no_measured_demand_risole | 2 |
| cuisine_token_has_no_measured_demand_búfalo | 2 |
| cuisine_token_has_no_measured_demand_ucraniana | 2 |
| cuisine_token_has_no_measured_demand_castanhas | 2 |
| cuisine_token_has_no_measured_demand_rodízio | 2 |
| cuisine_token_has_no_measured_demand_hambúrguer | 2 |
| cuisine_token_has_no_measured_demand_cachorro-quente/hot_dog | 2 |
| cuisine_token_has_no_measured_demand_nordeste | 2 |
| cuisine_token_has_no_measured_demand_pamonha | 2 |
| cuisine_token_has_no_measured_demand_milho | 2 |
| cuisine_token_has_no_measured_demand_bolo_frito | 2 |
| cuisine_token_has_no_measured_demand_brasileiro | 2 |
| cuisine_token_has_no_measured_demand_churraco | 2 |
| cuisine_token_has_no_measured_demand_brasileira_contemporanea | 2 |
| cuisine_token_has_no_measured_demand_quitutes_brasileiros | 2 |
| cuisine_token_has_no_measured_demand_guaraná_do_amazonas | 2 |
| cuisine_token_has_no_measured_demand_carne_na_brasa | 2 |
| cuisine_token_has_no_measured_demand_mineira_no_fogão_a_lenha | 2 |
| cuisine_token_has_no_measured_demand_picolés | 2 |
| cuisine_token_has_no_measured_demand__self_service | 2 |
| cuisine_token_has_no_measured_demand_galeto | 2 |
| cuisine_token_has_no_measured_demand_cone_trufado | 2 |
| cuisine_token_has_no_measured_demand_cone_recheado | 2 |
| cuisine_token_has_no_measured_demand_arte | 2 |
| cuisine_token_has_no_measured_demand_handmade | 2 |
| cuisine_token_has_no_measured_demand_colonial_products | 2 |
| cuisine_token_has_no_measured_demand_pipocas | 2 |
| cuisine_token_has_no_measured_demand_esfirra | 2 |
| cuisine_token_has_no_measured_demand_sabor_regional | 2 |
| cuisine_token_has_no_measured_demand_churrasco_misto | 2 |
| cuisine_token_has_no_measured_demand_baião | 2 |
| cuisine_token_has_no_measured_demand_farrofa | 2 |
| cuisine_token_has_no_measured_demand_feijão_tropeiro | 2 |
| cuisine_token_has_no_measured_demand_esfiha_aberta | 2 |
| cuisine_token_has_no_measured_demand_gauchesca | 2 |
| cuisine_token_has_no_measured_demand_campeira | 2 |
| cuisine_token_has_no_measured_demand_colonial | 2 |
| cuisine_token_has_no_measured_demand_fritos | 2 |
| cuisine_token_has_no_measured_demand_apenas_encomendas | 2 |
| cuisine_token_has_no_measured_demand_pao_de_alho | 2 |
| cuisine_token_has_no_measured_demand_chop | 2 |
| cuisine_token_has_no_measured_demand_bata_frita | 2 |
| cuisine_token_has_no_measured_demand_prato_executívo | 2 |
| cuisine_token_has_no_measured_demand_bebida | 2 |
| cuisine_token_has_no_measured_demand_almoco_lanches_e_bebidas | 2 |
| cuisine_token_has_no_measured_demand_salgados_e_doces | 2 |
| cuisine_token_has_no_measured_demand_pão_caseiro | 2 |
| cuisine_token_has_no_measured_demand_trab | 2 |
| cuisine_token_has_no_measured_demand_refeição | 2 |
| cuisine_token_has_no_measured_demand_tapiocas | 2 |
| cuisine_token_has_no_measured_demand__almoço_selfservice | 2 |
| cuisine_token_has_no_measured_demand_lanches_e_porções | 2 |
| cuisine_token_has_no_measured_demand_beef_soup | 2 |
| cuisine_token_has_no_measured_demand_regional_do_pará | 2 |
| cuisine_token_has_no_measured_demand_salsicha | 2 |
| cuisine_token_has_no_measured_demand_comida_fit | 2 |
| cuisine_token_has_no_measured_demand__feijoada | 2 |
| cuisine_token_has_no_measured_demand_chipas | 2 |
| cuisine_token_has_no_measured_demand_queijo_coalho | 2 |
| cuisine_token_has_no_measured_demand_tempero_caseiro | 2 |
| cuisine_token_has_no_measured_demand_alimentos_e_bebidas | 2 |
| cuisine_token_has_no_measured_demand_macrobiótica | 2 |
| cuisine_token_has_no_measured_demand_vitaminas | 2 |
| cuisine_token_has_no_measured_demand_pizza_napoletena | 2 |
| cuisine_token_has_no_measured_demand_cachaças | 2 |
| cuisine_token_has_no_measured_demand_doce_de_leite | 2 |
| cuisine_token_has_no_measured_demand_carne_de_rã_in_natura | 2 |
| cuisine_token_has_no_measured_demand_fooding_bar | 2 |
| cuisine_token_has_no_measured_demand_portions | 2 |
| cuisine_token_has_no_measured_demand_empadas. | 2 |
| cuisine_token_has_no_measured_demand_tacaca | 2 |
| cuisine_token_has_no_measured_demand_maniçoba | 2 |
| cuisine_token_has_no_measured_demand_patonotucupi | 2 |
| cuisine_token_has_no_measured_demand_vatapa | 2 |
| cuisine_token_has_no_measured_demand_comidastipicas | 2 |
| cuisine_token_has_no_measured_demand_comidasregionais | 2 |
| cuisine_token_has_no_measured_demand_salgado_de_festa | 2 |
| cuisine_token_has_no_measured_demand_panceta | 2 |
| cuisine_token_has_no_measured_demand_musica_ao_vivo | 2 |
| cuisine_token_has_no_measured_demand_capixaba | 2 |
| cuisine_token_has_no_measured_demand_moqueca_capixaba | 2 |
| cuisine_token_has_no_measured_demand_espetinho_e_jantinha | 2 |
| cuisine_token_has_no_measured_demand_macaxeira | 2 |
| cuisine_token_has_no_measured_demand_cuscuz | 2 |
| cuisine_token_has_no_measured_demand_espetinhos_e_empanadas | 2 |
| cuisine_token_has_no_measured_demand_garapa | 2 |
| cuisine_token_has_no_measured_demand_pão_de_queijo_congelado | 2 |
| cuisine_token_has_no_measured_demand_pizzas | 2 |
| cuisine_token_has_no_measured_demand_cervejas | 2 |
| cuisine_token_has_no_measured_demand_merendaria | 2 |
| cuisine_token_has_no_measured_demand_macarronada | 2 |
| cuisine_token_has_no_measured_demand_bolos_decorados | 2 |
| cuisine_token_has_no_measured_demand_batata_fritas | 2 |
| cuisine_token_has_no_measured_demand_alimentação_saudável | 2 |
| cuisine_token_has_no_measured_demand_fit | 2 |
| cuisine_token_has_no_measured_demand_nutrição_herbalife | 2 |
| cuisine_token_has_no_measured_demand_bebidas_funcionais | 2 |
| cuisine_token_has_no_measured_demand_almoço_saudável | 2 |
| cuisine_token_has_no_measured_demand_lanches_saudáveis | 2 |
| cuisine_token_has_no_measured_demand_porção | 2 |
| cuisine_token_has_no_measured_demand_pasteis_variados | 2 |
| cuisine_token_has_no_measured_demand_xisbruger | 2 |
| cuisine_token_has_no_measured_demand_guaraná | 2 |
| cuisine_token_has_no_measured_demand_espetos | 2 |
| cuisine_token_has_no_measured_demand_venezuelana | 2 |
| cuisine_token_has_no_measured_demand__lanchonete | 2 |
| cuisine_token_has_no_measured_demand_marmita] | 2 |
| cuisine_token_has_no_measured_demand_sugar_cane_juice | 2 |
| cuisine_token_has_no_measured_demand_sheila_refogada | 2 |
| cuisine_token_has_no_measured_demand__carne_assada_de_panela | 2 |
| cuisine_token_has_no_measured_demand_guaraná_da_amazônia | 2 |
| cuisine_token_has_no_measured_demand_bistro_brasserie | 2 |
| cuisine_token_has_no_measured_demand_alp | 2 |
| cuisine_token_has_no_measured_demand_röstis | 2 |
| cuisine_token_has_no_measured_demand_regional
swiss | 2 |
| cuisine_token_has_no_measured_demand_tzatziki | 2 |
| cuisine_token_has_no_measured_demand_pâté_en_croûte | 2 |
| cuisine_token_has_no_measured_demand_crême_brûlée | 2 |
| cuisine_token_has_no_measured_demand_tartelette | 2 |
| cuisine_token_has_no_measured_demand_oliven | 2 |
| cuisine_token_has_no_measured_demand_chocolate_cake | 2 |
| cuisine_token_has_no_measured_demand_profiteroles | 2 |
| cuisine_token_has_no_measured_demand_southern_bbq | 2 |
| cuisine_token_has_no_measured_demand_burger_steak | 2 |
| cuisine_token_has_no_measured_demand_pizza_takeaway | 2 |
| cuisine_token_has_no_measured_demand_mongols | 2 |
| cuisine_token_has_no_measured_demand_pains | 2 |
| cuisine_token_has_no_measured_demand_chocofruits | 2 |
| cuisine_token_has_no_measured_demand_gart | 2 |
| cuisine_token_has_no_measured_demand_chestnut | 2 |
| cuisine_token_has_no_measured_demand_new_york | 2 |
| cuisine_token_has_no_measured_demand_érythrée | 2 |
| cuisine_token_has_no_measured_demand_texas_barbecue | 2 |
| cuisine_token_has_no_measured_demand_boulets_à_la_liégeoise | 2 |
| cuisine_token_has_no_measured_demand_carbonade_flamande | 2 |
| cuisine_token_has_no_measured_demand_waterzooi | 2 |
| cuisine_token_has_no_measured_demand_beefsteak_tartar | 2 |
| cuisine_token_has_no_measured_demand_jellab | 2 |
| cuisine_token_has_no_measured_demand_rose_syrup | 2 |
| cuisine_token_has_no_measured_demand_chiche_tawouk | 2 |
| cuisine_token_has_no_measured_demand_yoghourt | 2 |
| cuisine_token_has_no_measured_demand_nood | 2 |
| cuisine_token_has_no_measured_demand_mauritician | 2 |
| cuisine_token_has_no_measured_demand_roasted_chestnuts | 2 |
| cuisine_token_has_no_measured_demand_soujouk | 2 |
| cuisine_token_has_no_measured_demand_osmalliyah | 2 |
| cuisine_token_has_no_measured_demand_hommos | 2 |
| cuisine_token_has_no_measured_demand_moutabbal | 2 |
| cuisine_token_has_no_measured_demand_labné | 2 |
| cuisine_token_has_no_measured_demand_fatt | 2 |
| cuisine_token_has_no_measured_demand_egg_parfait | 2 |
| cuisine_token_has_no_measured_demand_smoked_trout | 2 |
| cuisine_token_has_no_measured_demand_elk_steak | 2 |
| cuisine_token_has_no_measured_demand_chocolate_souffle | 2 |
| cuisine_token_has_no_measured_demand_palet_breton | 2 |
| cuisine_token_has_no_measured_demand_pavlova | 2 |
| cuisine_token_has_no_measured_demand_prezzel | 2 |
| cuisine_token_has_no_measured_demand_carpaccio | 2 |
| cuisine_token_has_no_measured_demand_cidre | 2 |
| cuisine_token_has_no_measured_demand_soft | 2 |
| cuisine_token_has_no_measured_demand_egg_muffin | 2 |
| cuisine_token_has_no_measured_demand_charcute | 2 |
| cuisine_token_has_no_measured_demand_iran | 2 |
| cuisine_token_has_no_measured_demand_dineology | 2 |
| cuisine_token_has_no_measured_demand_holzofen | 2 |
| cuisine_token_has_no_measured_demand_smoked_salmon | 2 |
| cuisine_token_has_no_measured_demand_caesar_salad | 2 |
| cuisine_token_has_no_measured_demand_chocolate_mousse | 2 |
| cuisine_token_has_no_measured_demand_cocco_ripieno | 2 |
| cuisine_token_has_no_measured_demand_coppa_al_limone | 2 |
| cuisine_token_has_no_measured_demand_cordonbleu | 2 |
| cuisine_token_has_no_measured_demand_protein_bowls | 2 |
| cuisine_token_has_no_measured_demand_nudelgerichte | 2 |
| cuisine_token_has_no_measured_demand_extravagant | 2 |
| cuisine_token_has_no_measured_demand_vollwert | 2 |
| cuisine_token_has_no_measured_demand_steirisch | 2 |
| cuisine_token_has_no_measured_demand_japanes_fusion | 2 |
| cuisine_token_has_no_measured_demand_dalmatian | 2 |
| cuisine_token_has_no_measured_demand__salate | 2 |
| cuisine_token_has_no_measured_demand__schnitzel | 2 |
| cuisine_token_has_no_measured_demand_imbiß | 2 |
| cuisine_token_has_no_measured_demand_trout | 2 |
| cuisine_token_has_no_measured_demand_süßes | 2 |
| cuisine_token_has_no_measured_demand_knoop | 2 |
| cuisine_token_has_no_measured_demand_tibet | 2 |
| cuisine_token_has_no_measured_demand_indochine | 2 |
| cuisine_token_has_no_measured_demand_kochkäs-deener | 2 |
| cuisine_token_has_no_measured_demand_windekäschde_calzöner | 2 |
| cuisine_token_has_no_measured_demand_pork_knuckle | 2 |
| cuisine_token_has_no_measured_demand_waffeln | 2 |
| cuisine_token_has_no_measured_demand_singapurian | 2 |
| cuisine_token_has_no_measured_demand_exceptional | 2 |
| cuisine_token_has_no_measured_demand_hessian | 2 |
| cuisine_token_has_no_measured_demand_hessisch | 2 |
| cuisine_token_has_no_measured_demand_eurasian | 2 |
| cuisine_token_has_no_measured_demand_fränkische | 2 |
| cuisine_token_has_no_measured_demand_kartoffel | 2 |
| cuisine_token_has_no_measured_demand_polnish | 2 |
| cuisine_token_has_no_measured_demand_bayrisch | 2 |
| cuisine_token_has_no_measured_demand__pannekoeken | 2 |
| cuisine_token_has_no_measured_demand_osteuropaeisch | 2 |
| cuisine_token_has_no_measured_demand_daydrinking | 2 |
| cuisine_token_has_no_measured_demand_belegte_brötchen | 2 |
| cuisine_token_has_no_measured_demand_lebkuchen | 2 |
| cuisine_token_has_no_measured_demand_blind | 2 |
| cuisine_token_has_no_measured_demand_mediterrean | 2 |
| cuisine_token_has_no_measured_demand_mongole | 2 |
| cuisine_token_has_no_measured_demand_coffee-to-go | 2 |
| cuisine_token_has_no_measured_demand_pommes_frites | 2 |
| cuisine_token_has_no_measured_demand_indisch/ | 2 |
| cuisine_token_has_no_measured_demand_singapurisch | 2 |
| cuisine_token_has_no_measured_demand_saalbetrieb | 2 |
| cuisine_token_has_no_measured_demand_currys | 2 |
| cuisine_token_has_no_measured_demand_flammkucken | 2 |
| cuisine_token_has_no_measured_demand_spain | 2 |
| cuisine_token_has_no_measured_demand_serbisch | 2 |
| cuisine_token_has_no_measured_demand_steakhaus | 2 |
| cuisine_token_has_no_measured_demand_south_european | 2 |
| cuisine_token_has_no_measured_demand_pakistanian | 2 |
| cuisine_token_has_no_measured_demand_sudanesischer | 2 |
| cuisine_token_has_no_measured_demand_bakery_with_café | 2 |
| cuisine_token_has_no_measured_demand_goulash | 2 |
| cuisine_token_has_no_measured_demand_karpfen | 2 |
| cuisine_token_has_no_measured_demand_asien | 2 |
| cuisine_token_has_no_measured_demand_zwiebelkuchen | 2 |
| cuisine_token_has_no_measured_demand_brasil | 2 |
| cuisine_token_has_no_measured_demand_usbekian | 2 |
| cuisine_token_has_no_measured_demand_chinese-mongolien | 2 |
| cuisine_token_has_no_measured_demand_saxony | 2 |
| cuisine_token_has_no_measured_demand_italoamerican | 2 |
| cuisine_token_has_no_measured_demand_cafe_bar | 2 |
| cuisine_token_has_no_measured_demand_curry-sausage | 2 |
| cuisine_token_has_no_measured_demand_kebab_turkish | 2 |
| cuisine_token_has_no_measured_demand_montenegrin | 2 |
| cuisine_token_has_no_measured_demand_sausage_salad | 2 |
| cuisine_token_has_no_measured_demand_insects | 2 |
| cuisine_token_has_no_measured_demand_feinkost | 2 |
| cuisine_token_has_no_measured_demand_frikadellen_pommes | 2 |
| cuisine_token_has_no_measured_demand_asian_fusion_and_sushi | 2 |
| cuisine_token_has_no_measured_demand_verschieden | 2 |
| cuisine_token_has_no_measured_demand_fleischspieß | 2 |
| cuisine_token_has_no_measured_demand_strudel | 2 |
| cuisine_token_has_no_measured_demand_asia_fusion | 2 |
| cuisine_token_has_no_measured_demand_central_european | 2 |
| cuisine_token_has_no_measured_demand_brasilianisch | 2 |
| cuisine_token_has_no_measured_demand_asian_sushi | 2 |
| cuisine_token_has_no_measured_demand_asparagus | 2 |
| cuisine_token_has_no_measured_demand_giros | 2 |
| cuisine_token_has_no_measured_demand_kneipe_/_restaurant | 2 |
| cuisine_token_has_no_measured_demand_siebträger | 2 |
| cuisine_token_has_no_measured_demand_aktionen | 2 |
| cuisine_token_has_no_measured_demand_flambé_cake | 2 |
| cuisine_token_has_no_measured_demand_bosnisch | 2 |
| cuisine_token_has_no_measured_demand_cross-over | 2 |
| cuisine_token_has_no_measured_demand_coffee_to_go | 2 |
| cuisine_token_has_no_measured_demand_leichte_küche | 2 |
| cuisine_token_has_no_measured_demand_coffee_&_brunch | 2 |
| cuisine_token_has_no_measured_demand_greece | 2 |
| cuisine_token_has_no_measured_demand__catering | 2 |
| cuisine_token_has_no_measured_demand_kneipe | 2 |
| cuisine_token_has_no_measured_demand_mongol | 2 |
| cuisine_token_has_no_measured_demand_msemmen | 2 |
| cuisine_token_has_no_measured_demand_wochenkarte | 2 |
| cuisine_token_has_no_measured_demand_kaiten-sushi | 2 |
| cuisine_token_has_no_measured_demand_north_vietnamese | 2 |
| cuisine_token_has_no_measured_demand_chinese_buffet | 2 |
| cuisine_token_has_no_measured_demand_bornholm | 2 |
| cuisine_token_has_no_measured_demand_cool_climate_kitchen | 2 |
| cuisine_token_has_no_measured_demand_smoked_fish | 2 |
| cuisine_token_has_no_measured_demand_open_face_sandwich | 2 |
| cuisine_token_has_no_measured_demand_regionalt | 2 |
| cuisine_token_has_no_measured_demand_pakistinani | 2 |
| cuisine_token_has_no_measured_demand_toscan | 2 |
| cuisine_token_has_no_measured_demand_pastry_pies | 2 |
| cuisine_token_has_no_measured_demand_champagne | 2 |
| cuisine_token_has_no_measured_demand_turnkish | 2 |
| cuisine_token_has_no_measured_demand_mongolian_bbq | 2 |
| cuisine_token_has_no_measured_demand_caribbian | 2 |
| cuisine_token_has_no_measured_demand_soup_kitchen | 2 |
| cuisine_token_has_no_measured_demand_gin_and_tonic | 2 |
| cuisine_token_has_no_measured_demand_non_european | 2 |
| cuisine_token_has_no_measured_demand_baby_meals | 2 |
| cuisine_token_has_no_measured_demand_porrige | 2 |
| cuisine_token_has_no_measured_demand_icelandic | 2 |
| cuisine_token_has_no_measured_demand_hotwings | 2 |
| cuisine_token_has_no_measured_demand_smoerrebroed | 2 |
| cuisine_token_has_no_measured_demand_fish_of_the_day | 2 |
| cuisine_token_has_no_measured_demand_s'more | 2 |
| cuisine_token_has_no_measured_demand_nikkey | 2 |
| cuisine_token_has_no_measured_demand_crescia | 2 |
| cuisine_token_has_no_measured_demand_korean:_breakfast | 2 |
| cuisine_token_has_no_measured_demand_hot_chokolate | 2 |
| cuisine_token_has_no_measured_demand_sci_lankan | 2 |
| cuisine_token_has_no_measured_demand_orgnanic | 2 |
| cuisine_token_has_no_measured_demand_bons_and_cheece | 2 |
| cuisine_token_has_no_measured_demand_rolex | 2 |
| cuisine_token_has_no_measured_demand_rumænsk | 2 |
| cuisine_token_has_no_measured_demand_macha | 2 |
| cuisine_token_has_no_measured_demand_bahn_mi | 2 |
| cuisine_token_has_no_measured_demand_egyptian_beans | 2 |
| cuisine_token_has_no_measured_demand_قهوة_النخيل | 2 |
| cuisine_token_has_no_measured_demand_الشبراوي | 2 |
| cuisine_token_has_no_measured_demand_piz | 2 |
| cuisine_token_has_no_measured_demand_مطعم_خير | 2 |
| cuisine_token_has_no_measured_demand_فطير | 2 |
| cuisine_token_has_no_measured_demand_shawrma | 2 |
| cuisine_token_has_no_measured_demand_shewarma | 2 |
| cuisine_token_has_no_measured_demand_play_station | 2 |
| cuisine_token_has_no_measured_demand_مظبي | 2 |
| cuisine_token_has_no_measured_demand_معجنات | 2 |
| cuisine_token_has_no_measured_demand_اكل_بدوي | 2 |
| cuisine_token_has_no_measured_demand_بيتزا | 2 |
| cuisine_token_has_no_measured_demand_لحم_مندي | 2 |
| cuisine_token_has_no_measured_demand_دجاج_مسحب | 2 |
| cuisine_token_has_no_measured_demand_بروستدد | 2 |
| cuisine_token_has_no_measured_demand_مشاوي_فراخ | 2 |
| cuisine_token_has_no_measured_demand_طواجن | 2 |
| cuisine_token_has_no_measured_demand_كافيه | 2 |
| cuisine_token_has_no_measured_demand_وجبات_سريعه | 2 |
| cuisine_token_has_no_measured_demand_حلواني | 2 |
| cuisine_token_has_no_measured_demand_tip | 2 |
| cuisine_token_has_no_measured_demand_koshary | 2 |
| cuisine_token_has_no_measured_demand_حواوشي | 2 |
| cuisine_token_has_no_measured_demand_شاي | 2 |
| cuisine_token_has_no_measured_demand_قهوة | 2 |
| cuisine_token_has_no_measured_demand_syrian_food | 2 |
| cuisine_token_has_no_measured_demand_freshly_made_thai_food | 2 |
| cuisine_token_has_no_measured_demand_عصير_قصب | 2 |
| cuisine_token_has_no_measured_demand_fleisch | 2 |
| cuisine_token_has_no_measured_demand_author | 2 |
| cuisine_token_has_no_measured_demand_marroqui | 2 |
| cuisine_token_has_no_measured_demand_vermouth | 2 |
| cuisine_token_has_no_measured_demand_etíope | 2 |
| cuisine_token_has_no_measured_demand_patagonian | 2 |
| cuisine_token_has_no_measured_demand_cocina_de_mercado | 2 |
| cuisine_token_has_no_measured_demand_german_international | 2 |
| cuisine_token_has_no_measured_demand_regional_latino | 2 |
| cuisine_token_has_no_measured_demand_middle_estern | 2 |
| cuisine_token_has_no_measured_demand_crepería | 2 |
| cuisine_token_has_no_measured_demand_multicultural | 2 |
| cuisine_token_has_no_measured_demand_chef | 2 |
| cuisine_token_has_no_measured_demand_arrocería | 2 |
| cuisine_token_has_no_measured_demand_navarra | 2 |
| cuisine_token_has_no_measured_demand_french_vietnamese_fusion | 2 |
| cuisine_token_has_no_measured_demand_pizza_y_más | 2 |
| cuisine_token_has_no_measured_demand_entrep | 2 |
| cuisine_token_has_no_measured_demand_wok_bufet_libre | 2 |
| cuisine_token_has_no_measured_demand_nougat | 2 |
| cuisine_token_has_no_measured_demand_jamonería | 2 |
| cuisine_token_has_no_measured_demand_kebab111 | 2 |
| cuisine_token_has_no_measured_demand_palestine | 2 |
| cuisine_token_has_no_measured_demand_terraza | 2 |
| cuisine_token_has_no_measured_demand_abaceria | 2 |
| cuisine_token_has_no_measured_demand_bocatas | 2 |
| cuisine_token_has_no_measured_demand_cafetería | 2 |
| cuisine_token_has_no_measured_demand_pescado_fresco | 2 |
| cuisine_token_has_no_measured_demand_alta_cocina | 2 |
| cuisine_token_has_no_measured_demand_bollería | 2 |
| cuisine_token_has_no_measured_demand_meriendas | 2 |
| cuisine_token_has_no_measured_demand_bocadillos_y_ensaladas | 2 |
| cuisine_token_has_no_measured_demand_nepalese-indian | 2 |
| cuisine_token_has_no_measured_demand__peruano | 2 |
| cuisine_token_has_no_measured_demand_codornices | 2 |
| cuisine_token_has_no_measured_demand_bufet_libre | 2 |
| cuisine_token_has_no_measured_demand_regional_and_burger | 2 |
| cuisine_token_has_no_measured_demand_vermut_&_tapas | 2 |
| cuisine_token_has_no_measured_demand__vermut_&_tapas | 2 |
| cuisine_token_has_no_measured_demand_fish_and_seafood | 2 |
| cuisine_token_has_no_measured_demand_aragonesa | 2 |
| cuisine_token_has_no_measured_demand_special_ocasions | 2 |
| cuisine_token_has_no_measured_demand_tasting_menu | 2 |
| cuisine_token_has_no_measured_demand_valenciana | 2 |
| cuisine_token_has_no_measured_demand__té | 2 |
| cuisine_token_has_no_measured_demand__panadería | 2 |
| cuisine_token_has_no_measured_demand__almuerzos | 2 |
| cuisine_token_has_no_measured_demand__bocadillos | 2 |
| cuisine_token_has_no_measured_demand_tapas_y_raciones | 2 |
| cuisine_token_has_no_measured_demand_cafeteria_especial | 2 |
| cuisine_token_has_no_measured_demand_pizza_sin_gluten | 2 |
| cuisine_token_has_no_measured_demand_vasq | 2 |
| cuisine_token_has_no_measured_demand_bakery_&_coffee | 2 |
| cuisine_token_has_no_measured_demand_almerian | 2 |
| cuisine_token_has_no_measured_demand_vinoteca | 2 |
| cuisine_token_has_no_measured_demand_sidra | 2 |
| cuisine_token_has_no_measured_demand_patatas_asadas | 2 |
| cuisine_token_has_no_measured_demand_pintxoak | 2 |
| cuisine_token_has_no_measured_demand_combination_plate | 2 |
| cuisine_token_has_no_measured_demand_vinos | 2 |
| cuisine_token_has_no_measured_demand_mini_supermercado | 2 |
| cuisine_token_has_no_measured_demand_l'ast | 2 |
| cuisine_token_has_no_measured_demand_variada | 2 |
| cuisine_token_has_no_measured_demand_fenician | 2 |
| cuisine_token_has_no_measured_demand_murcia | 2 |
| cuisine_token_has_no_measured_demand_chiken_spit | 2 |
| cuisine_token_has_no_measured_demand_cenas | 2 |
| cuisine_token_has_no_measured_demand_buffet_libre | 2 |
| cuisine_token_has_no_measured_demand_pescaito | 2 |
| cuisine_token_has_no_measured_demand_bake | 2 |
| cuisine_token_has_no_measured_demand_take_away_food | 2 |
| cuisine_token_has_no_measured_demand_pastisseria | 2 |
| cuisine_token_has_no_measured_demand_croquette | 2 |
| cuisine_token_has_no_measured_demand_fritter | 2 |
| cuisine_token_has_no_measured_demand_paninos | 2 |
| cuisine_token_has_no_measured_demand_papas_asadas | 2 |
| cuisine_token_has_no_measured_demand_pastelería_francesa | 2 |
| cuisine_token_has_no_measured_demand_soria | 2 |
| cuisine_token_has_no_measured_demand_torreznos | 2 |
| cuisine_token_has_no_measured_demand_andaluz | 2 |
| cuisine_token_has_no_measured_demand_croquetas | 2 |
| cuisine_token_has_no_measured_demand_cereal | 2 |
| cuisine_token_has_no_measured_demand_tapeo | 2 |
| cuisine_token_has_no_measured_demand_braseria | 2 |
| cuisine_token_has_no_measured_demand_irsh | 2 |
| cuisine_token_has_no_measured_demand_carnes_a_la_brasa | 2 |
| cuisine_token_has_no_measured_demand_galician-peruvian | 2 |
| cuisine_token_has_no_measured_demand_batido | 2 |
| cuisine_token_has_no_measured_demand_kip | 2 |
| cuisine_token_has_no_measured_demand_jamoneria | 2 |
| cuisine_token_has_no_measured_demand_cheese_restaurant | 2 |
| cuisine_token_has_no_measured_demand_comida_para_llevar | 2 |
| cuisine_token_has_no_measured_demand_postre | 2 |
| cuisine_token_has_no_measured_demand_charcuteria | 2 |
| cuisine_token_has_no_measured_demand_freiduria | 2 |
| cuisine_token_has_no_measured_demand_copas | 2 |
| cuisine_token_has_no_measured_demand_caracoles | 2 |
| cuisine_token_has_no_measured_demand_sirian | 2 |
| cuisine_token_has_no_measured_demand_empanadillas | 2 |
| cuisine_token_has_no_measured_demand_especialidad_brasas | 2 |
| cuisine_token_has_no_measured_demand_cocidos_y_churrascos | 2 |
| cuisine_token_has_no_measured_demand_shusi | 2 |
| cuisine_token_has_no_measured_demand_petit_four | 2 |
| cuisine_token_has_no_measured_demand_tapes | 2 |
| cuisine_token_has_no_measured_demand_latinamerican | 2 |
| cuisine_token_has_no_measured_demand_abacería | 2 |
| cuisine_token_has_no_measured_demand_vermut | 2 |
| cuisine_token_has_no_measured_demand_desayuno | 2 |
| cuisine_token_has_no_measured_demand_vermuteria | 2 |
| cuisine_token_has_no_measured_demand_pescaito_frito | 2 |
| cuisine_token_has_no_measured_demand_comida_casera | 2 |
| cuisine_token_has_no_measured_demand_taperia | 2 |
| cuisine_token_has_no_measured_demand_menu_of_the_day | 2 |
| cuisine_token_has_no_measured_demand_menu_evening | 2 |
| cuisine_token_has_no_measured_demand_roast_duck | 2 |
| cuisine_token_has_no_measured_demand_plantbased | 2 |
| cuisine_token_has_no_measured_demand_superfoods | 2 |
| cuisine_token_has_no_measured_demand_dominicana | 2 |
| cuisine_token_has_no_measured_demand_venezuelan_empanada | 2 |
| cuisine_token_has_no_measured_demand_cachito | 2 |
| cuisine_token_has_no_measured_demand_mallorquina | 2 |
| cuisine_token_has_no_measured_demand_mediterrània | 2 |
| cuisine_token_has_no_measured_demand_menús | 2 |
| cuisine_token_has_no_measured_demand_serranitos | 2 |
| cuisine_token_has_no_measured_demand_llonguets | 2 |
| cuisine_token_has_no_measured_demand_fusión_vasco-asiántica | 2 |
| cuisine_token_has_no_measured_demand_leonesa | 2 |
| cuisine_token_has_no_measured_demand_churreria | 2 |
| cuisine_token_has_no_measured_demand_chocolate_con_churros | 2 |
| cuisine_token_has_no_measured_demand_churros_con_chocolate | 2 |
| cuisine_token_has_no_measured_demand_ice_crea | 2 |
| cuisine_token_has_no_measured_demand_creperia | 2 |
| cuisine_token_has_no_measured_demand_menún_del_día | 2 |
| cuisine_token_has_no_measured_demand_rumana | 2 |
| cuisine_token_has_no_measured_demand_batidos | 2 |
| cuisine_token_has_no_measured_demand_chesse | 2 |
| cuisine_token_has_no_measured_demand_western_restaurant | 2 |
| cuisine_token_has_no_measured_demand_arrossos | 2 |
| cuisine_token_has_no_measured_demand_plato | 2 |
| cuisine_token_has_no_measured_demand_biere | 2 |
| cuisine_token_has_no_measured_demand_döner_kebab | 2 |
| cuisine_token_has_no_measured_demand_peruvian_cuisine | 2 |
| cuisine_token_has_no_measured_demand_almuerzo | 2 |
| cuisine_token_has_no_measured_demand_vegà | 2 |
| cuisine_token_has_no_measured_demand_menú_do_día | 2 |
| cuisine_token_has_no_measured_demand_maki_sushi | 2 |
| cuisine_token_has_no_measured_demand_española | 2 |
| cuisine_token_has_no_measured_demand_katalanisch | 2 |
| cuisine_token_has_no_measured_demand_camperos | 2 |
| cuisine_token_has_no_measured_demand_vege | 2 |
| cuisine_token_has_no_measured_demand_argentine_grill | 2 |
| cuisine_token_has_no_measured_demand_cachopo | 2 |
| cuisine_token_has_no_measured_demand_roman_pizza | 2 |
| cuisine_token_has_no_measured_demand_açaí_bowl | 2 |
| cuisine_token_has_no_measured_demand_tartes_sucrées | 2 |
| cuisine_token_has_no_measured_demand_tartes_salées | 2 |
| cuisine_token_has_no_measured_demand_fusion_asiatique | 2 |
| cuisine_token_has_no_measured_demand_togolese | 2 |
| cuisine_token_has_no_measured_demand_libre | 2 |
| cuisine_token_has_no_measured_demand_lanzhou | 2 |
| cuisine_token_has_no_measured_demand_bretagne | 2 |
| cuisine_token_has_no_measured_demand_pastilla | 2 |
| cuisine_token_has_no_measured_demand_winstub | 2 |
| cuisine_token_has_no_measured_demand_restaurant_ouvrier | 2 |
| cuisine_token_has_no_measured_demand_spécialités_de_montagne | 2 |
| cuisine_token_has_no_measured_demand_hongroise | 2 |
| cuisine_token_has_no_measured_demand_boa | 2 |
| cuisine_token_has_no_measured_demand_vientnamese | 2 |
| cuisine_token_has_no_measured_demand_bouillon | 2 |
| cuisine_token_has_no_measured_demand_auvergne | 2 |
| cuisine_token_has_no_measured_demand_planches | 2 |
| cuisine_token_has_no_measured_demand_hubei | 2 |
| cuisine_token_has_no_measured_demand_wuhan | 2 |
| cuisine_token_has_no_measured_demand_ecai | 2 |
| cuisine_token_has_no_measured_demand_hangzhou | 2 |
| cuisine_token_has_no_measured_demand_sud-ouest | 2 |
| cuisine_token_has_no_measured_demand_brucheta | 2 |
| cuisine_token_has_no_measured_demand_mascarene | 2 |
| cuisine_token_has_no_measured_demand_shandong | 2 |
| cuisine_token_has_no_measured_demand_thailandaise | 2 |
| cuisine_token_has_no_measured_demand_irakienne | 2 |
| cuisine_token_has_no_measured_demand_marinades | 2 |
| cuisine_token_has_no_measured_demand_babecue | 2 |
| cuisine_token_has_no_measured_demand_cape_verde | 2 |
| cuisine_token_has_no_measured_demand_russe | 2 |
| cuisine_token_has_no_measured_demand_tartines_salées | 2 |
| cuisine_token_has_no_measured_demand_quiches | 2 |
| cuisine_token_has_no_measured_demand__roumain | 2 |
| cuisine_token_has_no_measured_demand__traditionnel | 2 |
| cuisine_token_has_no_measured_demand_sushi-burrito | 2 |
| cuisine_token_has_no_measured_demand_restaurant_lyonnais | 2 |
| cuisine_token_has_no_measured_demand_poulet_grillé | 2 |
| cuisine_token_has_no_measured_demand_gnocci | 2 |
| cuisine_token_has_no_measured_demand_tahitian | 2 |
| cuisine_token_has_no_measured_demand_mountain | 2 |
| cuisine_token_has_no_measured_demand_siamese | 2 |
| cuisine_token_has_no_measured_demand_afro-cuban | 2 |
| cuisine_token_has_no_measured_demand_djiboutian | 2 |
| cuisine_token_has_no_measured_demand_côte_d'ivoire | 2 |
| cuisine_token_has_no_measured_demand_ivoirien | 2 |
| cuisine_token_has_no_measured_demand_vegetale | 2 |
| cuisine_token_has_no_measured_demand_bresilian | 2 |
| cuisine_token_has_no_measured_demand_mésopotamie_et_anatolie | 2 |
| cuisine_token_has_no_measured_demand_burundian | 2 |
| cuisine_token_has_no_measured_demand_iranienne | 2 |
| cuisine_token_has_no_measured_demand_algérie | 2 |
| cuisine_token_has_no_measured_demand_congolian | 2 |
| cuisine_token_has_no_measured_demand_pankake | 2 |
| cuisine_token_has_no_measured_demand_jiangxi | 2 |
| cuisine_token_has_no_measured_demand_cuisine_végétale | 2 |
| cuisine_token_has_no_measured_demand_french_gastronomy | 2 |
| cuisine_token_has_no_measured_demand_italienne) | 2 |
| cuisine_token_has_no_measured_demand_a_volonté | 2 |
| cuisine_token_has_no_measured_demand_cuisine_nissarde | 2 |
| cuisine_token_has_no_measured_demand_hawaii | 2 |
| cuisine_token_has_no_measured_demand_maghreb | 2 |
| cuisine_token_has_no_measured_demand_à_volonté | 2 |
| cuisine_token_has_no_measured_demand_world_food | 2 |
| cuisine_token_has_no_measured_demand_gourmand | 2 |
| cuisine_token_has_no_measured_demand_guadeloupean | 2 |
| cuisine_token_has_no_measured_demand_corsica | 2 |
| cuisine_token_has_no_measured_demand_take | 2 |
| cuisine_token_has_no_measured_demand_bobun | 2 |
| cuisine_token_has_no_measured_demand_moule_frite | 2 |
| cuisine_token_has_no_measured_demand_vacant | 2 |
| cuisine_token_has_no_measured_demand_roast_meat | 2 |
| cuisine_token_has_no_measured_demand_cidrerie | 2 |
| cuisine_token_has_no_measured_demand_scolaire | 2 |
| cuisine_token_has_no_measured_demand_péruvienne_fusion | 2 |
| cuisine_token_has_no_measured_demand_livraison | 2 |
| cuisine_token_has_no_measured_demand_maison | 2 |
| cuisine_token_has_no_measured_demand_bocaux | 2 |
| cuisine_token_has_no_measured_demand_planches_alpines | 2 |
| cuisine_token_has_no_measured_demand_lasagnes | 2 |
| cuisine_token_has_no_measured_demand_pizza_à_emporter | 2 |
| cuisine_token_has_no_measured_demand_erytrea | 2 |
| cuisine_token_has_no_measured_demand_pizza_socca | 2 |
| cuisine_token_has_no_measured_demand_tandori | 2 |
| cuisine_token_has_no_measured_demand_italian_tapas | 2 |
| cuisine_token_has_no_measured_demand_du_monde | 2 |
| cuisine_token_has_no_measured_demand_traditionnelle_du_jardin | 2 |
| cuisine_token_has_no_measured_demand_thehouse | 2 |
| cuisine_token_has_no_measured_demand_napolitan | 2 |
| cuisine_token_has_no_measured_demand_en-cas_chaud | 2 |
| cuisine_token_has_no_measured_demand_traditionnel | 2 |
| cuisine_token_has_no_measured_demand_ottomane | 2 |
| cuisine_token_has_no_measured_demand_cuisine_tibétaine | 2 |
| cuisine_token_has_no_measured_demand_restaurant_régional | 2 |
| cuisine_token_has_no_measured_demand_cuisine_familiale | 2 |
| cuisine_token_has_no_measured_demand_caribean | 2 |
| cuisine_token_has_no_measured_demand_gastromique | 2 |
| cuisine_token_has_no_measured_demand_restaurant_traditionnel | 2 |
| cuisine_token_has_no_measured_demand_galerie_d'art | 2 |
| cuisine_token_has_no_measured_demand_cuisine_provençale | 2 |
| cuisine_token_has_no_measured_demand_waffer | 2 |
| cuisine_token_has_no_measured_demand_=bing | 2 |
| cuisine_token_has_no_measured_demand_guinean | 2 |
| cuisine_token_has_no_measured_demand_guinée | 2 |
| cuisine_token_has_no_measured_demand_belgian_specialities | 2 |
| cuisine_token_has_no_measured_demand_cuisine_variée | 2 |
| cuisine_token_has_no_measured_demand_tacos_kebab | 2 |
| cuisine_token_has_no_measured_demand_cannelloni | 2 |
| cuisine_token_has_no_measured_demand_north-african | 2 |
| cuisine_token_has_no_measured_demand_maroc | 2 |
| cuisine_token_has_no_measured_demand_babka | 2 |
| cuisine_token_has_no_measured_demand_pommes_de_terre | 2 |
| cuisine_token_has_no_measured_demand_guinguette | 2 |
| cuisine_token_has_no_measured_demand_mocktail | 2 |
| cuisine_token_has_no_measured_demand_teah | 2 |
| cuisine_token_has_no_measured_demand_venezuelian | 2 |
| cuisine_token_has_no_measured_demand_panin | 2 |
| cuisine_token_has_no_measured_demand_normandy | 2 |
| cuisine_token_has_no_measured_demand_chichi | 2 |
| cuisine_token_has_no_measured_demand_petit_dejeuner | 2 |
| cuisine_token_has_no_measured_demand_cambojian | 2 |
| cuisine_token_has_no_measured_demand_vins | 2 |
| cuisine_token_has_no_measured_demand_français | 2 |
| cuisine_token_has_no_measured_demand_abyssinienne | 2 |
| cuisine_token_has_no_measured_demand_réunionnais | 2 |
| cuisine_token_has_no_measured_demand_afgane | 2 |
| cuisine_token_has_no_measured_demand_occitana | 2 |
| cuisine_token_has_no_measured_demand_central_africa | 2 |
| cuisine_token_has_no_measured_demand_central-african | 2 |
| cuisine_token_has_no_measured_demand_cream | 2 |
| cuisine_token_has_no_measured_demand_sucrée/salée | 2 |
| cuisine_token_has_no_measured_demand_grec | 2 |
| cuisine_token_has_no_measured_demand_coffeeshop | 2 |
| cuisine_token_has_no_measured_demand_charcuterie_ibérique | 2 |
| cuisine_token_has_no_measured_demand_thé | 2 |
| cuisine_token_has_no_measured_demand_season_food | 2 |
| cuisine_token_has_no_measured_demand_cuisine_de_rue | 2 |
| cuisine_token_has_no_measured_demand_pas_de_cuisine | 2 |
| cuisine_token_has_no_measured_demand_non | 2 |
| cuisine_token_has_no_measured_demand_savoy | 2 |
| cuisine_token_has_no_measured_demand_mâchons | 2 |
| cuisine_token_has_no_measured_demand_naans | 2 |
| cuisine_token_has_no_measured_demand_tortillas | 2 |
| cuisine_token_has_no_measured_demand_népalais | 2 |
| cuisine_token_has_no_measured_demand_french_taco | 2 |
| cuisine_token_has_no_measured_demand_saladerie | 2 |
| cuisine_token_has_no_measured_demand_moule | 2 |
| cuisine_token_has_no_measured_demand_semi_gastronomic | 2 |
| cuisine_token_has_no_measured_demand_cassoulet | 2 |
| cuisine_token_has_no_measured_demand_plateau_repas | 2 |
| cuisine_token_has_no_measured_demand_braise | 2 |
| cuisine_token_has_no_measured_demand_braised | 2 |
| cuisine_token_has_no_measured_demand_sénégal | 2 |
| cuisine_token_has_no_measured_demand_cooked_meat | 2 |
| cuisine_token_has_no_measured_demand_pissaladière | 2 |
| cuisine_token_has_no_measured_demand_en-cas | 2 |
| cuisine_token_has_no_measured_demand_sénégalaises | 2 |
| cuisine_token_has_no_measured_demand_berbère | 2 |
| cuisine_token_has_no_measured_demand_soop | 2 |
| cuisine_token_has_no_measured_demand_cream_puffs_and_tea | 2 |
| cuisine_token_has_no_measured_demand_crousty_crew | 2 |
| cuisine_token_has_no_measured_demand_out_fry | 2 |
| cuisine_token_has_no_measured_demand_pepe_chicken | 2 |
| cuisine_token_has_no_measured_demand_starsmash | 2 |
| cuisine_token_has_no_measured_demand_poffertjes | 2 |
| cuisine_token_has_no_measured_demand_malian | 2 |
| cuisine_token_has_no_measured_demand_stiffle | 2 |
| cuisine_token_has_no_measured_demand_brew_pub | 2 |
| cuisine_token_has_no_measured_demand_tunesian | 2 |
| cuisine_token_has_no_measured_demand_restauration_collective | 2 |
| cuisine_token_has_no_measured_demand_cambodge | 2 |
| cuisine_token_has_no_measured_demand_重庆小面 | 2 |
| cuisine_token_has_no_measured_demand_渝小面 | 2 |
| cuisine_token_has_no_measured_demand_street-food | 2 |
| cuisine_token_has_no_measured_demand_burge | 2 |
| cuisine_token_has_no_measured_demand_commorian | 2 |
| cuisine_token_has_no_measured_demand_patate | 2 |
| cuisine_token_has_no_measured_demand_specialités_algériennes | 2 |
| cuisine_token_has_no_measured_demand_bretonnes | 2 |
| cuisine_token_has_no_measured_demand_éthique | 2 |
| cuisine_token_has_no_measured_demand_pokebole | 2 |
| cuisine_token_has_no_measured_demand_végétale | 2 |
| cuisine_token_has_no_measured_demand_syrienne | 2 |
| cuisine_token_has_no_measured_demand_siberian | 2 |
| cuisine_token_has_no_measured_demand_kenya | 2 |
| cuisine_token_has_no_measured_demand_gambia | 2 |
| cuisine_token_has_no_measured_demand_frite | 2 |
| cuisine_token_has_no_measured_demand_buritos | 2 |
| cuisine_token_has_no_measured_demand_alsace | 2 |
| cuisine_token_has_no_measured_demand_mooncake | 2 |
| cuisine_token_has_no_measured_demand_anatoly | 2 |
| cuisine_token_has_no_measured_demand_cave_à_manger | 2 |
| cuisine_token_has_no_measured_demand_japonnaise | 2 |
| cuisine_token_has_no_measured_demand_scandinave | 2 |
| cuisine_token_has_no_measured_demand_poulet_roti | 2 |
| cuisine_token_has_no_measured_demand_sweden | 2 |
| cuisine_token_has_no_measured_demand_fro | 2 |
| cuisine_token_has_no_measured_demand_bengladesh | 2 |
| cuisine_token_has_no_measured_demand_ecuador | 2 |
| cuisine_token_has_no_measured_demand_kabyle | 2 |
| cuisine_token_has_no_measured_demand_canard | 2 |
| cuisine_token_has_no_measured_demand_générale | 2 |
| cuisine_token_has_no_measured_demand_serbo-croate | 2 |
| cuisine_token_has_no_measured_demand_asturias | 2 |
| cuisine_token_has_no_measured_demand_tempuras | 2 |
| cuisine_token_has_no_measured_demand_makis | 2 |
| cuisine_token_has_no_measured_demand_pied_noir | 2 |
| cuisine_token_has_no_measured_demand_café_à_emporter | 2 |
| cuisine_token_has_no_measured_demand_africain | 2 |
| cuisine_token_has_no_measured_demand_cape_verdean | 2 |
| cuisine_token_has_no_measured_demand_lyon | 2 |
| cuisine_token_has_no_measured_demand_tropical_izakaya | 2 |
| cuisine_token_has_no_measured_demand_comorian | 2 |
| cuisine_token_has_no_measured_demand_engagée | 2 |
| cuisine_token_has_no_measured_demand_chad | 2 |
| cuisine_token_has_no_measured_demand_luxemburgisch | 2 |
| cuisine_token_has_no_measured_demand_options_saines | 2 |
| cuisine_token_has_no_measured_demand_traditionelle | 2 |
| cuisine_token_has_no_measured_demand_indiano-pakistanaise | 2 |
| cuisine_token_has_no_measured_demand_cheese_naan_kebab | 2 |
| cuisine_token_has_no_measured_demand_mexicaine | 2 |
| cuisine_token_has_no_measured_demand_tielle | 2 |
| cuisine_token_has_no_measured_demand_tarte_flambees | 2 |
| cuisine_token_has_no_measured_demand_buffer | 2 |
| cuisine_token_has_no_measured_demand_sudan | 2 |
| cuisine_token_has_no_measured_demand_crep | 2 |
| cuisine_token_has_no_measured_demand_contemporaine | 2 |
| cuisine_token_has_no_measured_demand_bières_artisanales | 2 |
| cuisine_token_has_no_measured_demand_déjeuner | 2 |
| cuisine_token_has_no_measured_demand_gauffres | 2 |
| cuisine_token_has_no_measured_demand_salade | 2 |
| cuisine_token_has_no_measured_demand_paraguay | 2 |
| cuisine_token_has_no_measured_demand_malgache | 2 |
| cuisine_token_has_no_measured_demand_sundae | 2 |
| cuisine_token_has_no_measured_demand_bubbel_tea | 2 |
| cuisine_token_has_no_measured_demand_colombienne | 2 |
| cuisine_token_has_no_measured_demand_fromagerie | 2 |
| cuisine_token_has_no_measured_demand_table_fromagère | 2 |
| cuisine_token_has_no_measured_demand_sri-lankaise | 2 |
| cuisine_token_has_no_measured_demand_bodega | 2 |
| cuisine_token_has_no_measured_demand_epicurienne | 2 |
| cuisine_token_has_no_measured_demand_laotienne | 2 |
| cuisine_token_has_no_measured_demand_glacier | 2 |
| cuisine_token_has_no_measured_demand_southamerican | 2 |
| cuisine_token_has_no_measured_demand_glace | 2 |
| cuisine_token_has_no_measured_demand_chilienne | 2 |
| cuisine_token_has_no_measured_demand_albanese | 2 |
| cuisine_token_has_no_measured_demand_paëlla | 2 |
| cuisine_token_has_no_measured_demand_fresh_bowl | 2 |
| cuisine_token_has_no_measured_demand_matcha_latte | 2 |
| cuisine_token_has_no_measured_demand_ice_white_coffee | 2 |
| cuisine_token_has_no_measured_demand_fresh_juic | 2 |
| cuisine_token_has_no_measured_demand_options_saines_ | 2 |
| cuisine_token_has_no_measured_demand_haïtienne | 2 |
| cuisine_token_has_no_measured_demand_marocaine | 2 |
| cuisine_token_has_no_measured_demand_camerounaise | 2 |
| cuisine_token_has_no_measured_demand_tunisien | 2 |
| cuisine_token_has_no_measured_demand_bretzel | 2 |
| cuisine_token_has_no_measured_demand_french:local | 2 |
| cuisine_token_has_no_measured_demand_jurassienne | 2 |
| cuisine_token_has_no_measured_demand_libanais | 2 |
| cuisine_token_has_no_measured_demand_franco-japonais | 2 |
| cuisine_token_has_no_measured_demand_yea | 2 |
| cuisine_token_has_no_measured_demand_traditional_english | 2 |
| cuisine_token_has_no_measured_demand__cheese_toasties | 2 |
| cuisine_token_has_no_measured_demand__tea._coffee | 2 |
| cuisine_token_has_no_measured_demand__soft_drinks | 2 |
| cuisine_token_has_no_measured_demand_kebab_house | 2 |
| cuisine_token_has_no_measured_demand_macaroons | 2 |
| cuisine_token_has_no_measured_demand_barbecue_grill_bbq | 2 |
| cuisine_token_has_no_measured_demand_qatari | 2 |
| cuisine_token_has_no_measured_demand_chinese_malaysian | 2 |
| cuisine_token_has_no_measured_demand_chinese_dessert | 2 |
| cuisine_token_has_no_measured_demand_afro-carribean | 2 |
| cuisine_token_has_no_measured_demand_at-table_barbeque | 2 |
| cuisine_token_has_no_measured_demand_variants_of | 2 |
| cuisine_token_has_no_measured_demand_beer_garden | 2 |
| cuisine_token_has_no_measured_demand_british_cafe | 2 |
| cuisine_token_has_no_measured_demand_lebonese | 2 |
| cuisine_token_has_no_measured_demand_craft_ale | 2 |
| cuisine_token_has_no_measured_demand_fit_food | 2 |
| cuisine_token_has_no_measured_demand_kebb | 2 |
| cuisine_token_has_no_measured_demand__farmhouse | 2 |
| cuisine_token_has_no_measured_demand_transport_cafe | 2 |
| cuisine_token_has_no_measured_demand_burger_chips | 2 |
| cuisine_token_has_no_measured_demand_seasonal_pub_menu | 2 |
| cuisine_token_has_no_measured_demand__spicy_food | 2 |
| cuisine_token_has_no_measured_demand_live_music_venue | 2 |
| cuisine_token_has_no_measured_demand_chicken_shish | 2 |
| cuisine_token_has_no_measured_demand_hot_and_cold_food | 2 |
| cuisine_token_has_no_measured_demand_eat_in_or_take_away. | 2 |
| cuisine_token_has_no_measured_demand_belgian_fries | 2 |
| cuisine_token_has_no_measured_demand_turkish_and_greek | 2 |
| cuisine_token_has_no_measured_demand_indo-arab | 2 |
| cuisine_token_has_no_measured_demand_coffee_and_cakes | 2 |
| cuisine_token_has_no_measured_demand_sfc | 2 |
| cuisine_token_has_no_measured_demand_deep_fried_mars_bar | 2 |
| cuisine_token_has_no_measured_demand_kebeb | 2 |
| cuisine_token_has_no_measured_demand_pub_grub | 2 |
| cuisine_token_has_no_measured_demand_aegean | 2 |
| cuisine_token_has_no_measured_demand_sharers | 2 |
| cuisine_token_has_no_measured_demand_wholefood | 2 |
| cuisine_token_has_no_measured_demand_yorkshire_pudding_wrap | 2 |
| cuisine_token_has_no_measured_demand_pasties | 2 |
| cuisine_token_has_no_measured_demand__curry | 2 |
| cuisine_token_has_no_measured_demand_shakshuka | 2 |
| cuisine_token_has_no_measured_demand_ethiopean | 2 |
| cuisine_token_has_no_measured_demand_indian_and_bangladeshi | 2 |
| cuisine_token_has_no_measured_demand_peri | 2 |
| cuisine_token_has_no_measured_demand_breakfast_rolls | 2 |
| cuisine_token_has_no_measured_demand_breakfast_deli | 2 |
| cuisine_token_has_no_measured_demand_afro-caribbean | 2 |
| cuisine_token_has_no_measured_demand_hot_drinks_&_sweets | 2 |
| cuisine_token_has_no_measured_demand_hospital | 2 |
| cuisine_token_has_no_measured_demand_non-alcoholic | 2 |
| cuisine_token_has_no_measured_demand_expensive | 2 |
| cuisine_token_has_no_measured_demand_value_cafe-style_food | 2 |
| cuisine_token_has_no_measured_demand__cobs | 2 |
| cuisine_token_has_no_measured_demand__meals | 2 |
| cuisine_token_has_no_measured_demand_chinese_fish_and_chips | 2 |
| cuisine_token_has_no_measured_demand_chinese_and_oriental | 2 |
| cuisine_token_has_no_measured_demand_bubbles | 2 |
| cuisine_token_has_no_measured_demand_tea_masterclass | 2 |
| cuisine_token_has_no_measured_demand_rum_bar | 2 |
| cuisine_token_has_no_measured_demand_piri_piri | 2 |
| cuisine_token_has_no_measured_demand_loose_leaf_tea | 2 |
| cuisine_token_has_no_measured_demand_tea_and_cake | 2 |
| cuisine_token_has_no_measured_demand_pekingese | 2 |
| cuisine_token_has_no_measured_demand_restaurant&bar | 2 |
| cuisine_token_has_no_measured_demand_nigerian_cuisines | 2 |
| cuisine_token_has_no_measured_demand_far_eastern | 2 |
| cuisine_token_has_no_measured_demand_coffee_and_tea | 2 |
| cuisine_token_has_no_measured_demand_sunday_roast | 2 |
| cuisine_token_has_no_measured_demand_nepalees | 2 |
| cuisine_token_has_no_measured_demand_baltic | 2 |
| cuisine_token_has_no_measured_demand_oatcake | 2 |
| cuisine_token_has_no_measured_demand_cooked_breakfast | 2 |
| cuisine_token_has_no_measured_demand_avocado | 2 |
| cuisine_token_has_no_measured_demand_doner_kebab | 2 |
| cuisine_token_has_no_measured_demand_event_space | 2 |
| cuisine_token_has_no_measured_demand_crumble | 2 |
| cuisine_token_has_no_measured_demand_hot_rolls | 2 |
| cuisine_token_has_no_measured_demand_creme_egg_ice_cream | 2 |
| cuisine_token_has_no_measured_demand_ruffle_bar_ice_cream | 2 |
| cuisine_token_has_no_measured_demand_kibbling | 2 |
| cuisine_token_has_no_measured_demand_afghan/persian | 2 |
| cuisine_token_has_no_measured_demand_australasian | 2 |
| cuisine_token_has_no_measured_demand_dor_bo | 2 |
| cuisine_token_has_no_measured_demand_prosecco | 2 |
| cuisine_token_has_no_measured_demand_children's | 2 |
| cuisine_token_has_no_measured_demand_babies | 2 |
| cuisine_token_has_no_measured_demand_kuwaiti | 2 |
| cuisine_token_has_no_measured_demand_lunchboxes | 2 |
| cuisine_token_has_no_measured_demand_restaraunt | 2 |
| cuisine_token_has_no_measured_demand_kiwi | 2 |
| cuisine_token_has_no_measured_demand_alc | 2 |
| cuisine_token_has_no_measured_demand_street | 2 |
| cuisine_token_has_no_measured_demand_east_european | 2 |
| cuisine_token_has_no_measured_demand_toasted_wraps | 2 |
| cuisine_token_has_no_measured_demand_modern-british | 2 |
| cuisine_token_has_no_measured_demand_fry_ups | 2 |
| cuisine_token_has_no_measured_demand_barbequw | 2 |
| cuisine_token_has_no_measured_demand_plant_based_food | 2 |
| cuisine_token_has_no_measured_demand_del | 2 |
| cuisine_token_has_no_measured_demand_mod | 2 |
| cuisine_token_has_no_measured_demand_ground_coffee | 2 |
| cuisine_token_has_no_measured_demand_pacific_fusion | 2 |
| cuisine_token_has_no_measured_demand_車仔麵 | 2 |
| cuisine_token_has_no_measured_demand_organic_stores | 2 |
| cuisine_token_has_no_measured_demand_afrocaribbean | 2 |
| cuisine_token_has_no_measured_demand_gambian | 2 |
| cuisine_token_has_no_measured_demand_savouries | 2 |
| cuisine_token_has_no_measured_demand_kashrut | 2 |
| cuisine_token_has_no_measured_demand_kimchi | 2 |
| cuisine_token_has_no_measured_demand_souffle | 2 |
| cuisine_token_has_no_measured_demand_nepalesi | 2 |
| cuisine_token_has_no_measured_demand_jemmy_twitcher | 2 |
| cuisine_token_has_no_measured_demand_kids_meal | 2 |
| cuisine_token_has_no_measured_demand_cheese_boards | 2 |
| cuisine_token_has_no_measured_demand_soupes | 2 |
| cuisine_token_has_no_measured_demand_part_of_hotel | 2 |
| cuisine_token_has_no_measured_demand_brittish | 2 |
| cuisine_token_has_no_measured_demand_goan | 2 |
| cuisine_token_has_no_measured_demand_monthly_supper_club | 2 |
| cuisine_token_has_no_measured_demand_full_english_breakfast | 2 |
| cuisine_token_has_no_measured_demand_hong_kongese | 2 |
| cuisine_token_has_no_measured_demand_milk_shakes | 2 |
| cuisine_token_has_no_measured_demand_great_british_breakfast | 2 |
| cuisine_token_has_no_measured_demand_naan_wraps | 2 |
| cuisine_token_has_no_measured_demand_temperance | 2 |
| cuisine_token_has_no_measured_demand_jacket_potato_&_bagel | 2 |
| cuisine_token_has_no_measured_demand_oatcakes | 2 |
| cuisine_token_has_no_measured_demand_deserts | 2 |
| cuisine_token_has_no_measured_demand_wholefoods | 2 |
| cuisine_token_has_no_measured_demand_mac'n'cheese | 2 |
| cuisine_token_has_no_measured_demand_flapjacks | 2 |
| cuisine_token_has_no_measured_demand_cycle | 2 |
| cuisine_token_has_no_measured_demand_grvl | 2 |
| cuisine_token_has_no_measured_demand_sandwich:bakery | 2 |
| cuisine_token_has_no_measured_demand_kebab_wraps | 2 |
| cuisine_token_has_no_measured_demand_cheesy_chips | 2 |
| cuisine_token_has_no_measured_demand_seasoned_chips | 2 |
| cuisine_token_has_no_measured_demand_donner_me | 2 |
| cuisine_token_has_no_measured_demand_afghani | 2 |
| cuisine_token_has_no_measured_demand_toasted_sandwiches | 2 |
| cuisine_token_has_no_measured_demand_fries/chips | 2 |
| cuisine_token_has_no_measured_demand_ghanian | 2 |
| cuisine_token_has_no_measured_demand_indonesian_grill_cuisine | 2 |
| cuisine_token_has_no_measured_demand_lombok_cuisine | 2 |
| cuisine_token_has_no_measured_demand_berbagai_masakan | 2 |
| cuisine_token_has_no_measured_demand_local_coffee | 2 |
| cuisine_token_has_no_measured_demand_western_kitchen | 2 |
| cuisine_token_has_no_measured_demand_brongkos_dan_teh_poci | 2 |
| cuisine_token_has_no_measured_demand_ayam_bakar | 2 |
| cuisine_token_has_no_measured_demand__teh | 2 |
| cuisine_token_has_no_measured_demand__juice | 2 |
| cuisine_token_has_no_measured_demand_coklat | 2 |
| cuisine_token_has_no_measured_demand_roti_bakar | 2 |
| cuisine_token_has_no_measured_demand_dll | 2 |
| cuisine_token_has_no_measured_demand__chicken_noodle | 2 |
| cuisine_token_has_no_measured_demand__chinese | 2 |
| cuisine_token_has_no_measured_demand_hot_and_iced_drink | 2 |
| cuisine_token_has_no_measured_demand_coto | 2 |
| cuisine_token_has_no_measured_demand_ketupat | 2 |
| cuisine_token_has_no_measured_demand__teh_telur | 2 |
| cuisine_token_has_no_measured_demand__balinese | 2 |
| cuisine_token_has_no_measured_demand__traditional | 2 |
| cuisine_token_has_no_measured_demand__from_the_garden | 2 |
| cuisine_token_has_no_measured_demand__acehnese | 2 |
| cuisine_token_has_no_measured_demand_bakso_dan_nasi_goreng | 2 |
| cuisine_token_has_no_measured_demand_korea | 2 |
| cuisine_token_has_no_measured_demand_kopi_tubruk | 2 |
| cuisine_token_has_no_measured_demand_kopi_jos | 2 |
| cuisine_token_has_no_measured_demand_nasi_kucing | 2 |
| cuisine_token_has_no_measured_demand_sup | 2 |
| cuisine_token_has_no_measured_demand__telur_dadar | 2 |
| cuisine_token_has_no_measured_demand_tahu_sari_bumi | 2 |
| cuisine_token_has_no_measured_demand__dll | 2 |
| cuisine_token_has_no_measured_demand_warung_sate | 2 |
| cuisine_token_has_no_measured_demand__dan_aneka_masakan_sunda | 2 |
| cuisine_token_has_no_measured_demand_arabica_coffee | 2 |
| cuisine_token_has_no_measured_demand_soto_daging | 2 |
| cuisine_token_has_no_measured_demand_es_ketan | 2 |
| cuisine_token_has_no_measured_demand_tahu_lontong | 2 |
| cuisine_token_has_no_measured_demand_mie_pangsit | 2 |
| cuisine_token_has_no_measured_demand_regional_pizza | 2 |
| cuisine_token_has_no_measured_demand__ikan | 2 |
| cuisine_token_has_no_measured_demand_bakmi | 2 |
| cuisine_token_has_no_measured_demand__nasgor | 2 |
| cuisine_token_has_no_measured_demand__burjo | 2 |
| cuisine_token_has_no_measured_demand__mie_goreng | 2 |
| cuisine_token_has_no_measured_demand_bakso_dan_mie_ayam | 2 |
| cuisine_token_has_no_measured_demand_rumah_makan_padang | 2 |
| cuisine_token_has_no_measured_demand_bakso_mie_ayam | 2 |
| cuisine_token_has_no_measured_demand_lotek_lontong_pical | 2 |
| cuisine_token_has_no_measured_demand_coffie | 2 |
| cuisine_token_has_no_measured_demand_klappertaart | 2 |
| cuisine_token_has_no_measured_demand_glosis | 2 |
| cuisine_token_has_no_measured_demand_indonesian_restaurant | 2 |
| cuisine_token_has_no_measured_demand__mie_ayam | 2 |
| cuisine_token_has_no_measured_demand_restaurant_or_cafe | 2 |
| cuisine_token_has_no_measured_demand_belgian_restaurant | 2 |
| cuisine_token_has_no_measured_demand_makanan_khas_makassar | 2 |
| cuisine_token_has_no_measured_demand_khas_bali | 2 |
| cuisine_token_has_no_measured_demand_bali | 2 |
| cuisine_token_has_no_measured_demand__tahu/tempe | 2 |
| cuisine_token_has_no_measured_demand__terong | 2 |
| cuisine_token_has_no_measured_demand__petai | 2 |
| cuisine_token_has_no_measured_demand_ampera | 2 |
| cuisine_token_has_no_measured_demand_javanese_food | 2 |
| cuisine_token_has_no_measured_demand__fried_food | 2 |
| cuisine_token_has_no_measured_demand_bubur | 2 |
| cuisine_token_has_no_measured_demand_baso | 2 |
| cuisine_token_has_no_measured_demand_chicken_porridge | 2 |
| cuisine_token_has_no_measured_demand_warung_makan | 2 |
| cuisine_token_has_no_measured_demand__soto_daging | 2 |
| cuisine_token_has_no_measured_demand_ayam_bebek_penyet | 2 |
| cuisine_token_has_no_measured_demand_garangasem | 2 |
| cuisine_token_has_no_measured_demand_ikan_gurami_lele_mas_dll | 2 |
| cuisine_token_has_no_measured_demand_food_&_beverage | 2 |
| cuisine_token_has_no_measured_demand_restorant | 2 |
| cuisine_token_has_no_measured_demand_frozen_food | 2 |
| cuisine_token_has_no_measured_demand_ayang_bakar | 2 |
| cuisine_token_has_no_measured_demand_ayam_geprak | 2 |
| cuisine_token_has_no_measured_demand_mie_aayam | 2 |
| cuisine_token_has_no_measured_demand_brrownies | 2 |
| cuisine_token_has_no_measured_demand_klojen | 2 |
| cuisine_token_has_no_measured_demand_citrodiwangsan | 2 |
| cuisine_token_has_no_measured_demand_lumajang | 2 |
| cuisine_token_has_no_measured_demand_katering | 2 |
| cuisine_token_has_no_measured_demand_latansa | 2 |
| cuisine_token_has_no_measured_demand_meatball_soup | 2 |
| cuisine_token_has_no_measured_demand_brealfast | 2 |
| cuisine_token_has_no_measured_demand_turmeric_rice | 2 |
| cuisine_token_has_no_measured_demand_mie_rawit | 2 |
| cuisine_token_has_no_measured_demand_bakwan | 2 |
| cuisine_token_has_no_measured_demand_tahugor | 2 |
| cuisine_token_has_no_measured_demand_temgor | 2 |
| cuisine_token_has_no_measured_demand_aichaliveret | 2 |
| cuisine_token_has_no_measured_demand_internation | 2 |
| cuisine_token_has_no_measured_demand_betutu_fried_chicken | 2 |
| cuisine_token_has_no_measured_demand_betutu_soup_chicken | 2 |
| cuisine_token_has_no_measured_demand_local_breakfast | 2 |
| cuisine_token_has_no_measured_demand_penyet | 2 |
| cuisine_token_has_no_measured_demand_ngikan_sambal_matah | 2 |
| cuisine_token_has_no_measured_demand_ngikan_sambal_mercon | 2 |
| cuisine_token_has_no_measured_demand_ngikan_acar_kuning | 2 |
| cuisine_token_has_no_measured_demand_bird | 2 |
| cuisine_token_has_no_measured_demand_tempe | 2 |
| cuisine_token_has_no_measured_demand_perkedel | 2 |
| cuisine_token_has_no_measured_demand_and_many_more | 2 |
| cuisine_token_has_no_measured_demand_baso_aci | 2 |
| cuisine_token_has_no_measured_demand_boci | 2 |
| cuisine_token_has_no_measured_demand_ciwang88 | 2 |
| cuisine_token_has_no_measured_demand_nugget_pisang | 2 |
| cuisine_token_has_no_measured_demand_pisang_krispi | 2 |
| cuisine_token_has_no_measured_demand_salad_buah | 2 |
| cuisine_token_has_no_measured_demand_puding_vla | 2 |
| cuisine_token_has_no_measured_demand_jaymotrek | 2 |
| cuisine_token_has_no_measured_demand_studiosing | 2 |
| cuisine_token_has_no_measured_demand_photography | 2 |
| cuisine_token_has_no_measured_demand_meat_soup | 2 |
| cuisine_token_has_no_measured_demand_almond_milk | 2 |
| cuisine_token_has_no_measured_demand_padang_food | 2 |
| cuisine_token_has_no_measured_demand_kapau | 2 |
| cuisine_token_has_no_measured_demand_thai_tea | 2 |
| cuisine_token_has_no_measured_demand_bubble_drink | 2 |
| cuisine_token_has_no_measured_demand_onigiri_roll | 2 |
| cuisine_token_has_no_measured_demand_keripik_pangsit_dan_usus | 2 |
| cuisine_token_has_no_measured_demand_baso_seafood | 2 |
| cuisine_token_has_no_measured_demand_kwetiau | 2 |
| cuisine_token_has_no_measured_demand_chicken_geprek | 2 |
| cuisine_token_has_no_measured_demand_getuk | 2 |
| cuisine_token_has_no_measured_demand_wingko | 2 |
| cuisine_token_has_no_measured_demand_cimol | 2 |
| cuisine_token_has_no_measured_demand_warteg | 2 |
| cuisine_token_has_no_measured_demand_risoles | 2 |
| cuisine_token_has_no_measured_demand_mille_durian | 2 |
| cuisine_token_has_no_measured_demand_soto_lamongan | 2 |
| cuisine_token_has_no_measured_demand_pempek_ikan | 2 |
| cuisine_token_has_no_measured_demand_pempek_kapsel | 2 |
| cuisine_token_has_no_measured_demand_pempek_lenggang | 2 |
| cuisine_token_has_no_measured_demand_nasi_jajung_trawas | 2 |
| cuisine_token_has_no_measured_demand_bacem | 2 |
| cuisine_token_has_no_measured_demand_minuman_dingin_dan_panas | 2 |
| cuisine_token_has_no_measured_demand_kwetiaw | 2 |
| cuisine_token_has_no_measured_demand_fresh_milk | 2 |
| cuisine_token_has_no_measured_demand_milk_blend | 2 |
| cuisine_token_has_no_measured_demand_manado | 2 |
| cuisine_token_has_no_measured_demand_non-halal | 2 |
| cuisine_token_has_no_measured_demand_seblak_kobonk | 2 |
| cuisine_token_has_no_measured_demand_mie_gokil | 2 |
| cuisine_token_has_no_measured_demand_ngorong_drink | 2 |
| cuisine_token_has_no_measured_demand_betawi | 2 |
| cuisine_token_has_no_measured_demand_minang_culinary | 2 |
| cuisine_token_has_no_measured_demand_geprek | 2 |
| cuisine_token_has_no_measured_demand_nasi_bakar | 2 |
| cuisine_token_has_no_measured_demand_sop | 2 |
| cuisine_token_has_no_measured_demand_squash | 2 |
| cuisine_token_has_no_measured_demand_sambal_cabe_rawit | 2 |
| cuisine_token_has_no_measured_demand_lele_goreng | 2 |
| cuisine_token_has_no_measured_demand_nila_goreng | 2 |
| cuisine_token_has_no_measured_demand_pangsit_goreng | 2 |
| cuisine_token_has_no_measured_demand_mie_goreng | 2 |
| cuisine_token_has_no_measured_demand_canned_drinks | 2 |
| cuisine_token_has_no_measured_demand_instant_noodles | 2 |
| cuisine_token_has_no_measured_demand_bootled_drinks | 2 |
| cuisine_token_has_no_measured_demand_cocacola | 2 |
| cuisine_token_has_no_measured_demand_chilsung | 2 |
| cuisine_token_has_no_measured_demand_lotte | 2 |
| cuisine_token_has_no_measured_demand_ayam_lalapan | 2 |
| cuisine_token_has_no_measured_demand_cilok | 2 |
| cuisine_token_has_no_measured_demand_east_java | 2 |
| cuisine_token_has_no_measured_demand_mie_bakar | 2 |
| cuisine_token_has_no_measured_demand_risol | 2 |
| cuisine_token_has_no_measured_demand_birthday_cake | 2 |
| cuisine_token_has_no_measured_demand_kue_ulang_tahun | 2 |
| cuisine_token_has_no_measured_demand_garlic_cheese_bread | 2 |
| cuisine_token_has_no_measured_demand_roti_tawar | 2 |
| cuisine_token_has_no_measured_demand_traditional_salad | 2 |
| cuisine_token_has_no_measured_demand_bolu | 2 |
| cuisine_token_has_no_measured_demand_es_teh | 2 |
| cuisine_token_has_no_measured_demand_nasi_liwet | 2 |
| cuisine_token_has_no_measured_demand_coconut_beverage | 2 |
| cuisine_token_has_no_measured_demand_mie_ayam_dan_bakso | 2 |
| cuisine_token_has_no_measured_demand_jap | 2 |
| cuisine_token_has_no_measured_demand_pork_fried_rice | 2 |
| cuisine_token_has_no_measured_demand_wedang | 2 |
| cuisine_token_has_no_measured_demand_lontong_sayur | 2 |
| cuisine_token_has_no_measured_demand_lontong_tunjang | 2 |
| cuisine_token_has_no_measured_demand_ketupat_gulai_paku | 2 |
| cuisine_token_has_no_measured_demand_lontong_pecal | 2 |
| cuisine_token_has_no_measured_demand_friedrice | 2 |
| cuisine_token_has_no_measured_demand_mie_ayam_bakso | 2 |
| cuisine_token_has_no_measured_demand_gado_gado | 2 |
| cuisine_token_has_no_measured_demand_pig_meat | 2 |
| cuisine_token_has_no_measured_demand_chicken_satay | 2 |
| cuisine_token_has_no_measured_demand_nusantara | 2 |
| cuisine_token_has_no_measured_demand_bubur_ayam | 2 |
| cuisine_token_has_no_measured_demand_aussie_pies | 2 |
| cuisine_token_has_no_measured_demand_korean_cuisine_halal | 2 |
| cuisine_token_has_no_measured_demand_panese | 2 |
| cuisine_token_has_no_measured_demand_roti_cokelat | 2 |
| cuisine_token_has_no_measured_demand_gandul | 2 |
| cuisine_token_has_no_measured_demand_empek-empek | 2 |
| cuisine_token_has_no_measured_demand_mie_gomak | 2 |
| cuisine_token_has_no_measured_demand_lumpiya | 2 |
| cuisine_token_has_no_measured_demand_ketupat_kandangan | 2 |
| cuisine_token_has_no_measured_demand_modern_asian | 2 |
| cuisine_token_has_no_measured_demand__cake_&_pastry | 2 |
| cuisine_token_has_no_measured_demand_cofee | 2 |
| cuisine_token_has_no_measured_demand_soto_kerbau | 2 |
| cuisine_token_has_no_measured_demand_bebek | 2 |
| cuisine_token_has_no_measured_demand_kedai_makan | 2 |
| cuisine_token_has_no_measured_demand_fish_n_chips | 2 |
| cuisine_token_has_no_measured_demand_javafood | 2 |
| cuisine_token_has_no_measured_demand_mentai | 2 |
| cuisine_token_has_no_measured_demand_有米饭 | 2 |
| cuisine_token_has_no_measured_demand_kopdai_kopi | 2 |
| cuisine_token_has_no_measured_demand_suamtra_barat | 2 |
| cuisine_token_has_no_measured_demand_lamongan | 2 |
| cuisine_token_has_no_measured_demand_jawa_timur | 2 |
| cuisine_token_has_no_measured_demand_kopi_tiam | 2 |
| cuisine_token_has_no_measured_demand_singaporean_street_food | 2 |
| cuisine_token_has_no_measured_demand_gule_kambing | 2 |
| cuisine_token_has_no_measured_demand_ice_chocolate | 2 |
| cuisine_token_has_no_measured_demand_pourridge | 2 |
| cuisine_token_has_no_measured_demand_satai | 2 |
| cuisine_token_has_no_measured_demand_makanan_ringan | 2 |
| cuisine_token_has_no_measured_demand_sei_sapi | 2 |
| cuisine_token_has_no_measured_demand_sei_lidah | 2 |
| cuisine_token_has_no_measured_demand_sei_ayam | 2 |
| cuisine_token_has_no_measured_demand_nasi_goreng_sei_sapi | 2 |
| cuisine_token_has_no_measured_demand_stmj | 2 |
| cuisine_token_has_no_measured_demand_es_kopi_susu_gula_aren | 2 |
| cuisine_token_has_no_measured_demand_soda_gembira | 2 |
| cuisine_token_has_no_measured_demand_prasmanan | 2 |
| cuisine_token_has_no_measured_demand_fried_duck | 2 |
| cuisine_token_has_no_measured_demand_sambal_madura | 2 |
| cuisine_token_has_no_measured_demand_maincourse | 2 |
| cuisine_token_has_no_measured_demand__pastry_bakery | 2 |
| cuisine_token_has_no_measured_demand_bakso_bakar | 2 |
| cuisine_token_has_no_measured_demand_sikabu | 2 |
| cuisine_token_has_no_measured_demand_sate_padang | 2 |
| cuisine_token_has_no_measured_demand_kofe_kenangan | 2 |
| cuisine_token_has_no_measured_demand_bebek_jerohan_daging | 2 |
| cuisine_token_has_no_measured_demand_jawa | 2 |
| cuisine_token_has_no_measured_demand_wing | 2 |
| cuisine_token_has_no_measured_demand_japanese_cheesecake | 2 |
| cuisine_token_has_no_measured_demand_kue_keju | 2 |
| cuisine_token_has_no_measured_demand_canton | 2 |
| cuisine_token_has_no_measured_demand_billiard | 2 |
| cuisine_token_has_no_measured_demand_clam | 2 |
| cuisine_token_has_no_measured_demand_shells | 2 |
| cuisine_token_has_no_measured_demand_fired_rice | 2 |
| cuisine_token_has_no_measured_demand_fried_noodle | 2 |
| cuisine_token_has_no_measured_demand_cireng | 2 |
| cuisine_token_has_no_measured_demand_cireng_isi_ayam_pedas | 2 |
| cuisine_token_has_no_measured_demand_cireng_isi_keju | 2 |
| cuisine_token_has_no_measured_demand_cireng_isi_ayam_ori | 2 |
| cuisine_token_has_no_measured_demand_gulai | 2 |
| cuisine_token_has_no_measured_demand_sizzler | 2 |
| cuisine_token_has_no_measured_demand_woodfired_food | 2 |
| cuisine_token_has_no_measured_demand_pizza_and_chipshop | 2 |
| cuisine_token_has_no_measured_demand__coffee_and_food | 2 |
| cuisine_token_has_no_measured_demand_west_cork_coffee | 2 |
| cuisine_token_has_no_measured_demand_carvary | 2 |
| cuisine_token_has_no_measured_demand_soda_bread | 2 |
| cuisine_token_has_no_measured_demand_mexian | 2 |
| cuisine_token_has_no_measured_demand_break | 2 |
| cuisine_token_has_no_measured_demand_rissole | 2 |
| cuisine_token_has_no_measured_demand_fry | 2 |
| cuisine_token_has_no_measured_demand_modenese | 2 |
| cuisine_token_has_no_measured_demand_cacciucco | 2 |
| cuisine_token_has_no_measured_demand_zonzelle | 2 |
| cuisine_token_has_no_measured_demand_focaccia_col_formaggio | 2 |
| cuisine_token_has_no_measured_demand_ostaria | 2 |
| cuisine_token_has_no_measured_demand_primi_emiliani | 2 |
| cuisine_token_has_no_measured_demand_deep_fried | 2 |
| cuisine_token_has_no_measured_demand_fry_food | 2 |
| cuisine_token_has_no_measured_demand_ris | 2 |
| cuisine_token_has_no_measured_demand_locale_tipica | 2 |
| cuisine_token_has_no_measured_demand_pizzeria_&_faine | 2 |
| cuisine_token_has_no_measured_demand_panzanelle | 2 |
| cuisine_token_has_no_measured_demand_pollo_arrosto | 2 |
| cuisine_token_has_no_measured_demand_italian/organic | 2 |
| cuisine_token_has_no_measured_demand_sala_da_the | 2 |
| cuisine_token_has_no_measured_demand_posti_a_sedere | 2 |
| cuisine_token_has_no_measured_demand_servizio_al_tavolo | 2 |
| cuisine_token_has_no_measured_demand_pas | 2 |
| cuisine_token_has_no_measured_demand_jewish-italian | 2 |
| cuisine_token_has_no_measured_demand_eugubina | 2 |
| cuisine_token_has_no_measured_demand_cotoletteria | 2 |
| cuisine_token_has_no_measured_demand_tagliere | 2 |
| cuisine_token_has_no_measured_demand_cheese_focaccia | 2 |
| cuisine_token_has_no_measured_demand_cilentan | 2 |
| cuisine_token_has_no_measured_demand_pizza:italian | 2 |
| cuisine_token_has_no_measured_demand_cucina_italiano | 2 |
| cuisine_token_has_no_measured_demand__bruschette | 2 |
| cuisine_token_has_no_measured_demand_ladin | 2 |
| cuisine_token_has_no_measured_demand__ristorante | 2 |
| cuisine_token_has_no_measured_demand_piacentina | 2 |
| cuisine_token_has_no_measured_demand_pizza_d'asporto | 2 |
| cuisine_token_has_no_measured_demand__italian | 2 |
| cuisine_token_has_no_measured_demand__bisteccheria | 2 |
| cuisine_token_has_no_measured_demand_budini | 2 |
| cuisine_token_has_no_measured_demand_baccalà | 2 |
| cuisine_token_has_no_measured_demand_pizzeria_trattoria | 2 |
| cuisine_token_has_no_measured_demand_loca | 2 |
| cuisine_token_has_no_measured_demand_fruit_drinking | 2 |
| cuisine_token_has_no_measured_demand_pizzeria_e_tavola_calda | 2 |
| cuisine_token_has_no_measured_demand_bisteccheria | 2 |
| cuisine_token_has_no_measured_demand_pizza_da_asporto | 2 |
| cuisine_token_has_no_measured_demand__pesce_e_carne | 2 |
| cuisine_token_has_no_measured_demand_light_meal | 2 |
| cuisine_token_has_no_measured_demand_bar_pasticceria | 2 |
| cuisine_token_has_no_measured_demand_cubana | 2 |
| cuisine_token_has_no_measured_demand_dolce_salato | 2 |
| cuisine_token_has_no_measured_demand_pizzeria_a_taglio | 2 |
| cuisine_token_has_no_measured_demand_pedavena | 2 |
| cuisine_token_has_no_measured_demand_painini | 2 |
| cuisine_token_has_no_measured_demand_jamon | 2 |
| cuisine_token_has_no_measured_demand_castagne | 2 |
| cuisine_token_has_no_measured_demand_frutta_secca | 2 |
| cuisine_token_has_no_measured_demand_regional_and_pizzeria | 2 |
| cuisine_token_has_no_measured_demand_ciambelle | 2 |
| cuisine_token_has_no_measured_demand_cornetti | 2 |
| cuisine_token_has_no_measured_demand_pizza_kebab | 2 |
| cuisine_token_has_no_measured_demand__pasticceria | 2 |
| cuisine_token_has_no_measured_demand_italian_regional | 2 |
| cuisine_token_has_no_measured_demand_san | 2 |
| cuisine_token_has_no_measured_demand_italian_coffeeshop | 2 |
| cuisine_token_has_no_measured_demand_caffetteria | 2 |
| cuisine_token_has_no_measured_demand_fainè | 2 |
| cuisine_token_has_no_measured_demand_venezuelean | 2 |
| cuisine_token_has_no_measured_demand_sushi_burrito | 2 |
| cuisine_token_has_no_measured_demand__beer_shop | 2 |
| cuisine_token_has_no_measured_demand__panini | 2 |
| cuisine_token_has_no_measured_demand__rosticceria | 2 |
| cuisine_token_has_no_measured_demand_hamburger_&_panini | 2 |
| cuisine_token_has_no_measured_demand_hot_do | 2 |
| cuisine_token_has_no_measured_demand__trattoria | 2 |
| cuisine_token_has_no_measured_demand_delikatessen | 2 |
| cuisine_token_has_no_measured_demand_tiramisù | 2 |
| cuisine_token_has_no_measured_demand_affettati | 2 |
| cuisine_token_has_no_measured_demand_regional_-_pesce_di_lago | 2 |
| cuisine_token_has_no_measured_demand_ricercata | 2 |
| cuisine_token_has_no_measured_demand__pizzeria_e_rosticceria | 2 |
| cuisine_token_has_no_measured_demand_hemp | 2 |
| cuisine_token_has_no_measured_demand_herbal_tea | 2 |
| cuisine_token_has_no_measured_demand_insalata_di_mare | 2 |
| cuisine_token_has_no_measured_demand_bevande | 2 |
| cuisine_token_has_no_measured_demand_edamame | 2 |
| cuisine_token_has_no_measured_demand_pizza_con_pasta_madre | 2 |
| cuisine_token_has_no_measured_demand_neapolitan_pizza | 2 |
| cuisine_token_has_no_measured_demand_enoteca_con_cucina | 2 |
| cuisine_token_has_no_measured_demand_gelati_e_frullati | 2 |
| cuisine_token_has_no_measured_demand_caviar | 2 |
| cuisine_token_has_no_measured_demand_hamburgher | 2 |
| cuisine_token_has_no_measured_demand_tipica_parmigiana | 2 |
| cuisine_token_has_no_measured_demand_napoletano | 2 |
| cuisine_token_has_no_measured_demand_panuozzi | 2 |
| cuisine_token_has_no_measured_demand_pizza_scadete | 2 |
| cuisine_token_has_no_measured_demand_panigacci | 2 |
| cuisine_token_has_no_measured_demand_italian_street_food | 2 |
| cuisine_token_has_no_measured_demand_napoletanean | 2 |
| cuisine_token_has_no_measured_demand_carne_alla_brace | 2 |
| cuisine_token_has_no_measured_demand_pane | 2 |
| cuisine_token_has_no_measured_demand_japense | 2 |
| cuisine_token_has_no_measured_demand_milza | 2 |
| cuisine_token_has_no_measured_demand_healty_food | 2 |
| cuisine_token_has_no_measured_demand_galletto | 2 |
| cuisine_token_has_no_measured_demand_friggitoria | 2 |
| cuisine_token_has_no_measured_demand_cinghiale | 2 |
| cuisine_token_has_no_measured_demand_tortelli | 2 |
| cuisine_token_has_no_measured_demand_cinque_e_cinque | 2 |
| cuisine_token_has_no_measured_demand_fish-grill | 2 |
| cuisine_token_has_no_measured_demand_pastry_shop | 2 |
| cuisine_token_has_no_measured_demand_aperirivo | 2 |
| cuisine_token_has_no_measured_demand_clean | 2 |
| cuisine_token_has_no_measured_demand_araba | 2 |
| cuisine_token_has_no_measured_demand_tailandese | 2 |
| cuisine_token_has_no_measured_demand_the | 2 |
| cuisine_token_has_no_measured_demand_truffle | 2 |
| cuisine_token_has_no_measured_demand_paposceria | 2 |
| cuisine_token_has_no_measured_demand_pizza_al_piatto | 2 |
| cuisine_token_has_no_measured_demand_paposce | 2 |
| cuisine_token_has_no_measured_demand_pizzeria_al_taglio | 2 |
| cuisine_token_has_no_measured_demand_panini_napoletani | 2 |
| cuisine_token_has_no_measured_demand_tradisionale | 2 |
| cuisine_token_has_no_measured_demand_cbt | 2 |
| cuisine_token_has_no_measured_demand_pizza_taglio | 2 |
| cuisine_token_has_no_measured_demand_fritture | 2 |
| cuisine_token_has_no_measured_demand_gofri | 2 |
| cuisine_token_has_no_measured_demand_pasticcero | 2 |
| cuisine_token_has_no_measured_demand_cruderia | 2 |
| cuisine_token_has_no_measured_demand_bombolone | 2 |
| cuisine_token_has_no_measured_demand_scagliozzi | 2 |
| cuisine_token_has_no_measured_demand_crescioni | 2 |
| cuisine_token_has_no_measured_demand_watermelon | 2 |
| cuisine_token_has_no_measured_demand_melon | 2 |
| cuisine_token_has_no_measured_demand_pugliese_-_siciliana | 2 |
| cuisine_token_has_no_measured_demand_crudite' | 2 |
| cuisine_token_has_no_measured_demand_crudi | 2 |
| cuisine_token_has_no_measured_demand_cerimonie | 2 |
| cuisine_token_has_no_measured_demand_banchetti | 2 |
| cuisine_token_has_no_measured_demand_wedding_day | 2 |
| cuisine_token_has_no_measured_demand_cresime | 2 |
| cuisine_token_has_no_measured_demand_battesimi | 2 |
| cuisine_token_has_no_measured_demand_matrimoni | 2 |
| cuisine_token_has_no_measured_demand_cene_di_lavoro | 2 |
| cuisine_token_has_no_measured_demand_vini_pregiati | 2 |
| cuisine_token_has_no_measured_demand_champag | 2 |
| cuisine_token_has_no_measured_demand_birrificio | 2 |
| cuisine_token_has_no_measured_demand_piatto | 2 |
| cuisine_token_has_no_measured_demand_taglio | 2 |
| cuisine_token_has_no_measured_demand_cucina_italiana | 2 |
| cuisine_token_has_no_measured_demand_hookah_bar | 2 |
| cuisine_token_has_no_measured_demand_trietina | 2 |
| cuisine_token_has_no_measured_demand_caldaia | 2 |
| cuisine_token_has_no_measured_demand_cremeria | 2 |
| cuisine_token_has_no_measured_demand_veronese | 2 |
| cuisine_token_has_no_measured_demand_sicilian_food | 2 |
| cuisine_token_has_no_measured_demand_mixology | 2 |
| cuisine_token_has_no_measured_demand_pane_cunzato | 2 |
| cuisine_token_has_no_measured_demand_scacce | 2 |
| cuisine_token_has_no_measured_demand_cannoli | 2 |
| cuisine_token_has_no_measured_demand_cassone | 2 |
| cuisine_token_has_no_measured_demand_fagottini | 2 |
| cuisine_token_has_no_measured_demand_supplì | 2 |
| cuisine_token_has_no_measured_demand_cheesburger | 2 |
| cuisine_token_has_no_measured_demand_schiaccia | 2 |
| cuisine_token_has_no_measured_demand_pinsa_alla_romana | 2 |
| cuisine_token_has_no_measured_demand_pollo_fritto | 2 |
| cuisine_token_has_no_measured_demand_pollo_allo_spiedo | 2 |
| cuisine_token_has_no_measured_demand_balcan | 2 |
| cuisine_token_has_no_measured_demand_poké_hawaiano | 2 |
| cuisine_token_has_no_measured_demand_romena | 2 |
| cuisine_token_has_no_measured_demand_formaggi | 2 |
| cuisine_token_has_no_measured_demand_tavola_fredda | 2 |
| cuisine_token_has_no_measured_demand_arancino | 2 |
| cuisine_token_has_no_measured_demand_crostoni | 2 |
| cuisine_token_has_no_measured_demand_schiacciatine | 2 |
| cuisine_token_has_no_measured_demand_aperitif | 2 |
| cuisine_token_has_no_measured_demand_tramezzino | 2 |
| cuisine_token_has_no_measured_demand_danese | 2 |
| cuisine_token_has_no_measured_demand_trentina | 2 |
| cuisine_token_has_no_measured_demand_chickpea_flat_bread | 2 |
| cuisine_token_has_no_measured_demand_ristorazione_aziendale | 2 |
| cuisine_token_has_no_measured_demand_drin | 2 |
| cuisine_token_has_no_measured_demand_italiano | 2 |
| cuisine_token_has_no_measured_demand_pinza | 2 |
| cuisine_token_has_no_measured_demand_italiana_contaminata | 2 |
| cuisine_token_has_no_measured_demand_singalese | 2 |
| cuisine_token_has_no_measured_demand_club_sandwitch | 2 |
| cuisine_token_has_no_measured_demand_pani_ca_meusa | 2 |
| cuisine_token_has_no_measured_demand_stea | 2 |
| cuisine_token_has_no_measured_demand_latino_american | 2 |
| cuisine_token_has_no_measured_demand_pizza_a_domicilio | 2 |
| cuisine_token_has_no_measured_demand_piazza | 2 |
| cuisine_token_has_no_measured_demand_cucina_toscana | 2 |
| cuisine_token_has_no_measured_demand_tisane | 2 |
| cuisine_token_has_no_measured_demand_colazione | 2 |
| cuisine_token_has_no_measured_demand_spuntineria | 2 |
| cuisine_token_has_no_measured_demand_mochi | 2 |
| cuisine_token_has_no_measured_demand_marchigiana | 2 |
| cuisine_token_has_no_measured_demand_brunch_domenicale | 2 |
| cuisine_token_has_no_measured_demand_winebar_&_restuarant | 2 |
| cuisine_token_has_no_measured_demand_salentina | 2 |
| cuisine_token_has_no_measured_demand_casereccia | 2 |
| cuisine_token_has_no_measured_demand_marrocan | 2 |
| cuisine_token_has_no_measured_demand_tartufo | 2 |
| cuisine_token_has_no_measured_demand_pasticciotto | 2 |
| cuisine_token_has_no_measured_demand_piza | 2 |
| cuisine_token_has_no_measured_demand_sarda | 2 |
| cuisine_token_has_no_measured_demand_nippo | 2 |
| cuisine_token_has_no_measured_demand_emiliano | 2 |
| cuisine_token_has_no_measured_demand_dinks | 2 |
| cuisine_token_has_no_measured_demand_international_breakfast | 2 |
| cuisine_token_has_no_measured_demand_cotolette | 2 |
| cuisine_token_has_no_measured_demand_bolognese | 2 |
| cuisine_token_has_no_measured_demand_arrancino | 2 |
| cuisine_token_has_no_measured_demand_polpette | 2 |
| cuisine_token_has_no_measured_demand_panigacceria | 2 |
| cuisine_token_has_no_measured_demand_burburella | 2 |
| cuisine_token_has_no_measured_demand_glutin_free | 2 |
| cuisine_token_has_no_measured_demand_teatina | 2 |
| cuisine_token_has_no_measured_demand_torrefazione | 2 |
| cuisine_token_has_no_measured_demand_cibo_al_ba | 2 |
| cuisine_token_has_no_measured_demand_piatti_vegetariani | 2 |
| cuisine_token_has_no_measured_demand_eritran | 2 |
| cuisine_token_has_no_measured_demand_etnica | 2 |
| cuisine_token_has_no_measured_demand_polpetta | 2 |
| cuisine_token_has_no_measured_demand_eargentinian | 2 |
| cuisine_token_has_no_measured_demand_friulana | 2 |
| cuisine_token_has_no_measured_demand_pasto_veloce | 2 |
| cuisine_token_has_no_measured_demand_pasta_fino_a_tarda_sera | 2 |
| cuisine_token_has_no_measured_demand_alpine | 2 |
| cuisine_token_has_no_measured_demand_colomabiana | 2 |
| cuisine_token_has_no_measured_demand_puglise | 2 |
| cuisine_token_has_no_measured_demand_panzerotte | 2 |
| cuisine_token_has_no_measured_demand_pangoccioli | 2 |
| cuisine_token_has_no_measured_demand_rumena | 2 |
| cuisine_token_has_no_measured_demand_crostini | 2 |
| cuisine_token_has_no_measured_demand_chengdu | 2 |
| cuisine_token_has_no_measured_demand_cilentana | 2 |
| cuisine_token_has_no_measured_demand_pinz | 2 |
| cuisine_token_has_no_measured_demand_pizzetta | 2 |
| cuisine_token_has_no_measured_demand_pizzetta_al_taglio | 2 |
| cuisine_token_has_no_measured_demand_aperitivo_sardo | 2 |
| cuisine_token_has_no_measured_demand_ritorante | 2 |
| cuisine_token_has_no_measured_demand_arrosticini_alla_brace | 2 |
| cuisine_token_has_no_measured_demand_bakey | 2 |
| cuisine_token_has_no_measured_demand_パキスタン | 2 |
| cuisine_token_has_no_measured_demand_dan_dan_men | 2 |
| cuisine_token_has_no_measured_demand_中国料理 | 2 |
| cuisine_token_has_no_measured_demand_フレンチ風 | 2 |
| cuisine_token_has_no_measured_demand_うどん_(udon) | 2 |
| cuisine_token_has_no_measured_demand_魚河岸料理 | 2 |
| cuisine_token_has_no_measured_demand_わっぱめし | 2 |
| cuisine_token_has_no_measured_demand_konamon | 2 |
| cuisine_token_has_no_measured_demand_おでん_(oden) | 2 |
| cuisine_token_has_no_measured_demand_和菓子_(japanese_sweets) | 2 |
| cuisine_token_has_no_measured_demand_スパゲティー_(spaghetti) | 2 |
| cuisine_token_has_no_measured_demand_ドーナッツ_(doughnuts) | 2 |
| cuisine_token_has_no_measured_demand_ステーキ_(steak) | 2 |
| cuisine_token_has_no_measured_demand_torno_pizza | 2 |
| cuisine_token_has_no_measured_demand_寿司_(sushi) | 2 |
| cuisine_token_has_no_measured_demand_dojo | 2 |
| cuisine_token_has_no_measured_demand_kushikatu | 2 |
| cuisine_token_has_no_measured_demand_お寿司 | 2 |
| cuisine_token_has_no_measured_demand_okonomi-yaki | 2 |
| cuisine_token_has_no_measured_demand_japanese_potato | 2 |
| cuisine_token_has_no_measured_demand_chin | 2 |
| cuisine_token_has_no_measured_demand_teisyoku | 2 |
| cuisine_token_has_no_measured_demand_reimen | 2 |
| cuisine_token_has_no_measured_demand_standing | 2 |
| cuisine_token_has_no_measured_demand_obanzai | 2 |
| cuisine_token_has_no_measured_demand_nikomi | 2 |
| cuisine_token_has_no_measured_demand_doteyaki | 2 |
| cuisine_token_has_no_measured_demand_yakitori_&_hoppy | 2 |
| cuisine_token_has_no_measured_demand_spaice | 2 |
| cuisine_token_has_no_measured_demand_beijing | 2 |
| cuisine_token_has_no_measured_demand_europian | 2 |
| cuisine_token_has_no_measured_demand_beef_bawl | 2 |
| cuisine_token_has_no_measured_demand_まんじゅう | 2 |
| cuisine_token_has_no_measured_demand_gyukatsu | 2 |
| cuisine_token_has_no_measured_demand_toshomen | 2 |
| cuisine_token_has_no_measured_demand_中華料理屋 | 2 |
| cuisine_token_has_no_measured_demand_そば_(soba) | 2 |
| cuisine_token_has_no_measured_demand_rahmen | 2 |
| cuisine_token_has_no_measured_demand_串天ぷら | 2 |
| cuisine_token_has_no_measured_demand_kamamashi | 2 |
| cuisine_token_has_no_measured_demand_kakiagedon | 2 |
| cuisine_token_has_no_measured_demand_yakiton | 2 |
| cuisine_token_has_no_measured_demand_커피_로스팅 | 2 |
| cuisine_token_has_no_measured_demand_たこ焼 | 2 |
| cuisine_token_has_no_measured_demand_vetnamise | 2 |
| cuisine_token_has_no_measured_demand_eel_bowl | 2 |
| cuisine_token_has_no_measured_demand_ラーメン_甘味 | 2 |
| cuisine_token_has_no_measured_demand_japanese_(soba | 2 |
| cuisine_token_has_no_measured_demand_udon) | 2 |
| cuisine_token_has_no_measured_demand_japanese_udon_tempura | 2 |
| cuisine_token_has_no_measured_demand_curry_and_rice | 2 |
| cuisine_token_has_no_measured_demand_japanese_izakaya | 2 |
| cuisine_token_has_no_measured_demand_大判焼き | 2 |
| cuisine_token_has_no_measured_demand_ステーキ、ハンバーグ | 2 |
| cuisine_token_has_no_measured_demand_japanese　金沢カレー | 2 |
| cuisine_token_has_no_measured_demand_ton-katsu | 2 |
| cuisine_token_has_no_measured_demand_foccaccia | 2 |
| cuisine_token_has_no_measured_demand__sandwich | 2 |
| cuisine_token_has_no_measured_demand_zousui | 2 |
| cuisine_token_has_no_measured_demand_コーヒー_弁当 | 2 |
| cuisine_token_has_no_measured_demand_シアトルスタイルエスプレッソ | 2 |
| cuisine_token_has_no_measured_demand_italian　イタリアン | 2 |
| cuisine_token_has_no_measured_demand_japanese(unagi | 2 |
| cuisine_token_has_no_measured_demand_kaiseki) | 2 |
| cuisine_token_has_no_measured_demand_japanese(sushi | 2 |
| cuisine_token_has_no_measured_demand_banquet(kaiseki_ryori)) | 2 |
| cuisine_token_has_no_measured_demand_宴会・串焼きと創作料理 | 2 |
| cuisine_token_has_no_measured_demand_自然食 | 2 |
| cuisine_token_has_no_measured_demand_窯焼　pizza | 2 |
| cuisine_token_has_no_measured_demand_カレー、自然食 | 2 |
| cuisine_token_has_no_measured_demand_tempura_rice_bowl | 2 |
| cuisine_token_has_no_measured_demand_japanese　chicken | 2 |
| cuisine_token_has_no_measured_demand_noodle-ramen | 2 |
| cuisine_token_has_no_measured_demand_徳島ラーメン | 2 |
| cuisine_token_has_no_measured_demand_yakotori | 2 |
| cuisine_token_has_no_measured_demand_tuna_rice_bowl | 2 |
| cuisine_token_has_no_measured_demand_mackerel_restaurant | 2 |
| cuisine_token_has_no_measured_demand_shisha_cafe | 2 |
| cuisine_token_has_no_measured_demand_fried-pork_(ton-katsu) | 2 |
| cuisine_token_has_no_measured_demand_japanese_-_fusion | 2 |
| cuisine_token_has_no_measured_demand_そば_ラーメン | 2 |
| cuisine_token_has_no_measured_demand_regional_(tonkatsu) | 2 |
| cuisine_token_has_no_measured_demand_motuyaki | 2 |
| cuisine_token_has_no_measured_demand_日本茶 | 2 |
| cuisine_token_has_no_measured_demand_smoke_and_grill | 2 |
| cuisine_token_has_no_measured_demand_魚料理 | 2 |
| cuisine_token_has_no_measured_demand_kyusyu | 2 |
| cuisine_token_has_no_measured_demand_stteak_house | 2 |
| cuisine_token_has_no_measured_demand_esnic | 2 |
| cuisine_token_has_no_measured_demand_kani | 2 |
| cuisine_token_has_no_measured_demand_能登牛専門ステーキ | 2 |
| cuisine_token_has_no_measured_demand_大衆食堂 | 2 |
| cuisine_token_has_no_measured_demand_会席・懐石料理 | 2 |
| cuisine_token_has_no_measured_demand_chicken_sandwich | 2 |
| cuisine_token_has_no_measured_demand_chinese_taiwan | 2 |
| cuisine_token_has_no_measured_demand_barmkuhen | 2 |
| cuisine_token_has_no_measured_demand_curry_soup | 2 |
| cuisine_token_has_no_measured_demand_餃子舗 | 2 |
| cuisine_token_has_no_measured_demand_タイ料理 | 2 |
| cuisine_token_has_no_measured_demand_dining | 2 |
| cuisine_token_has_no_measured_demand_nuddle | 2 |
| cuisine_token_has_no_measured_demand_ステーキ_ハンバーグ | 2 |
| cuisine_token_has_no_measured_demand_soba_sake | 2 |
| cuisine_token_has_no_measured_demand_缶ケーキ | 2 |
| cuisine_token_has_no_measured_demand_カレー焼き | 2 |
| cuisine_token_has_no_measured_demand_練り製品 | 2 |
| cuisine_token_has_no_measured_demand_japanese_eel | 2 |
| cuisine_token_has_no_measured_demand_western-style | 2 |
| cuisine_token_has_no_measured_demand_japanese_curry-udon | 2 |
| cuisine_token_has_no_measured_demand_green_tea | 2 |
| cuisine_token_has_no_measured_demand_british_european | 2 |
| cuisine_token_has_no_measured_demand_たい焼き_どら焼き | 2 |
| cuisine_token_has_no_measured_demand_イタリアン・スペイン料理 | 2 |
| cuisine_token_has_no_measured_demand_オムライス・スパゲッティ | 2 |
| cuisine_token_has_no_measured_demand_spicecurry | 2 |
| cuisine_token_has_no_measured_demand_焼肉、ステーキ、精肉販売 | 2 |
| cuisine_token_has_no_measured_demand_soba(japanese) | 2 |
| cuisine_token_has_no_measured_demand_american-brewery | 2 |
| cuisine_token_has_no_measured_demand_レンタルルーム、レンタルキッチン | 2 |
| cuisine_token_has_no_measured_demand_german_pasta | 2 |
| cuisine_token_has_no_measured_demand_豚骨ラーメン | 2 |
| cuisine_token_has_no_measured_demand_japanese_(chicken) | 2 |
| cuisine_token_has_no_measured_demand_japanese_dessert | 2 |
| cuisine_token_has_no_measured_demand_coffee_&_confectionery | 2 |
| cuisine_token_has_no_measured_demand_たこ焼き　お好み焼き　焼きそば | 2 |
| cuisine_token_has_no_measured_demand_ベーカリーカフェ | 2 |
| cuisine_token_has_no_measured_demand_焼きまんじゅう | 2 |
| cuisine_token_has_no_measured_demand_串焼_(spieße) | 2 |
| cuisine_token_has_no_measured_demand_和・洋・イタリアン・フレンチおばんさい | 2 |
| cuisine_token_has_no_measured_demand_egg_bowl | 2 |
| cuisine_token_has_no_measured_demand_回転ずし | 2 |
| cuisine_token_has_no_measured_demand_うどん屋 | 2 |
| cuisine_token_has_no_measured_demand_roasted_beef_bowl | 2 |
| cuisine_token_has_no_measured_demand_steak_bowl | 2 |
| cuisine_token_has_no_measured_demand_hanburg | 2 |
| cuisine_token_has_no_measured_demand_鉄板、お好み焼き、もんじゃ焼き | 2 |
| cuisine_token_has_no_measured_demand_japanese_soba_noodle | 2 |
| cuisine_token_has_no_measured_demand_poise | 2 |
| cuisine_token_has_no_measured_demand_焼だんご | 2 |
| cuisine_token_has_no_measured_demand_satsuma | 2 |
| cuisine_token_has_no_measured_demand_american-bbq | 2 |
| cuisine_token_has_no_measured_demand_うどん専門店 | 2 |
| cuisine_token_has_no_measured_demand_regional_(kaga_kanazawa) | 2 |
| cuisine_token_has_no_measured_demand_spainbar | 2 |
| cuisine_token_has_no_measured_demand_日本料理_居酒屋 | 2 |
| cuisine_token_has_no_measured_demand_inari | 2 |
| cuisine_token_has_no_measured_demand_やきそば | 2 |
| cuisine_token_has_no_measured_demand_humbrger | 2 |
| cuisine_token_has_no_measured_demand_ギョウザ | 2 |
| cuisine_token_has_no_measured_demand_極上ステーキ | 2 |
| cuisine_token_has_no_measured_demand_tamago-yaki | 2 |
| cuisine_token_has_no_measured_demand_インド・ネパールカレー | 2 |
| cuisine_token_has_no_measured_demand_absinthe | 2 |
| cuisine_token_has_no_measured_demand_うどん、天丼 | 2 |
| cuisine_token_has_no_measured_demand_弁当仕出し | 2 |
| cuisine_token_has_no_measured_demand__ネパール料理 | 2 |
| cuisine_token_has_no_measured_demand_pizza_ピザ | 2 |
| cuisine_token_has_no_measured_demand_humberg | 2 |
| cuisine_token_has_no_measured_demand_仕出し料理 | 2 |
| cuisine_token_has_no_measured_demand_焼肉、ジンギスカン | 2 |
| cuisine_token_has_no_measured_demand_きしめん_そば | 2 |
| cuisine_token_has_no_measured_demand_丼_ランチ_カフェテリア | 2 |
| cuisine_token_has_no_measured_demand_stake | 2 |
| cuisine_token_has_no_measured_demand_domburi | 2 |
| cuisine_token_has_no_measured_demand_xian | 2 |
| cuisine_token_has_no_measured_demand_味噌ラーメン | 2 |
| cuisine_token_has_no_measured_demand_エスニック | 2 |
| cuisine_token_has_no_measured_demand_焼きうどん | 2 |
| cuisine_token_has_no_measured_demand_finger_rib | 2 |
| cuisine_token_has_no_measured_demand_ステーキ丼 | 2 |
| cuisine_token_has_no_measured_demand_sara_udon | 2 |
| cuisine_token_has_no_measured_demand_anmitsu | 2 |
| cuisine_token_has_no_measured_demand_焼肉料理 | 2 |
| cuisine_token_has_no_measured_demand_フライ | 2 |
| cuisine_token_has_no_measured_demand_ameri | 2 |
| cuisine_token_has_no_measured_demand_baniku | 2 |
| cuisine_token_has_no_measured_demand_もつ煮らーめん | 2 |
| cuisine_token_has_no_measured_demand_soupe | 2 |
| cuisine_token_has_no_measured_demand_たこ焼き屋 | 2 |
| cuisine_token_has_no_measured_demand_xinjiang | 2 |
| cuisine_token_has_no_measured_demand_jajapane | 2 |
| cuisine_token_has_no_measured_demand_blowfish | 2 |
| cuisine_token_has_no_measured_demand_teppannyaki | 2 |
| cuisine_token_has_no_measured_demand_susu | 2 |
| cuisine_token_has_no_measured_demand_sour_curry | 2 |
| cuisine_token_has_no_measured_demand_パスタ | 2 |
| cuisine_token_has_no_measured_demand_cuisine | 2 |
| cuisine_token_has_no_measured_demand_set_meal | 2 |
| cuisine_token_has_no_measured_demand_焼き鳥屋さん | 2 |
| cuisine_token_has_no_measured_demand_japanese-noodle | 2 |
| cuisine_token_has_no_measured_demand_さぬきうどん | 2 |
| cuisine_token_has_no_measured_demand_香港料理 | 2 |
| cuisine_token_has_no_measured_demand_berbecue | 2 |
| cuisine_token_has_no_measured_demand_つけめん | 2 |
| cuisine_token_has_no_measured_demand_soba_(buckwheat)_noodles | 2 |
| cuisine_token_has_no_measured_demand_houtou | 2 |
| cuisine_token_has_no_measured_demand_牛たん | 2 |
| cuisine_token_has_no_measured_demand_カフェ_喫茶 | 2 |
| cuisine_token_has_no_measured_demand_kushi-katu | 2 |
| cuisine_token_has_no_measured_demand_abura_soba | 2 |
| cuisine_token_has_no_measured_demand_インド料理屋 | 2 |
| cuisine_token_has_no_measured_demand_蕎麦、うどん | 2 |
| cuisine_token_has_no_measured_demand_ローススタミナ | 2 |
| cuisine_token_has_no_measured_demand_korian | 2 |
| cuisine_token_has_no_measured_demand_ikayaki | 2 |
| cuisine_token_has_no_measured_demand_ベトナムカフェ | 2 |
| cuisine_token_has_no_measured_demand_craft | 2 |
| cuisine_token_has_no_measured_demand_smoothy | 2 |
| cuisine_token_has_no_measured_demand_ラーメン屋 | 2 |
| cuisine_token_has_no_measured_demand_懐石料理 | 2 |
| cuisine_token_has_no_measured_demand_オランダ料理 | 2 |
| cuisine_token_has_no_measured_demand_中華料理 | 2 |
| cuisine_token_has_no_measured_demand_とんこつラーメン | 2 |
| cuisine_token_has_no_measured_demand_家系らーめん | 2 |
| cuisine_token_has_no_measured_demand_たこ焼き_焼きそば | 2 |
| cuisine_token_has_no_measured_demand_hambagu | 2 |
| cuisine_token_has_no_measured_demand_kumamoto | 2 |
| cuisine_token_has_no_measured_demand_広島焼き | 2 |
| cuisine_token_has_no_measured_demand_醤油ラーメン | 2 |
| cuisine_token_has_no_measured_demand_塩ラーメン | 2 |
| cuisine_token_has_no_measured_demand_ドイツ家庭料理 | 2 |
| cuisine_token_has_no_measured_demand_rusk | 2 |
| cuisine_token_has_no_measured_demand_teppan-yaki | 2 |
| cuisine_token_has_no_measured_demand_japajapa | 2 |
| cuisine_token_has_no_measured_demand_lunchbox | 2 |
| cuisine_token_has_no_measured_demand_diet | 2 |
| cuisine_token_has_no_measured_demand_shirashi | 2 |
| cuisine_token_has_no_measured_demand_米粉パンの販売 | 2 |
| cuisine_token_has_no_measured_demand_多肉植物の販売 | 2 |
| cuisine_token_has_no_measured_demand_noodlenoodle | 2 |
| cuisine_token_has_no_measured_demand_hotcake | 2 |
| cuisine_token_has_no_measured_demand_creamsoda | 2 |
| cuisine_token_has_no_measured_demand_kamameshi | 2 |
| cuisine_token_has_no_measured_demand_昆布締め | 2 |
| cuisine_token_has_no_measured_demand_クラフトビール | 2 |
| cuisine_token_has_no_measured_demand_つまみ | 2 |
| cuisine_token_has_no_measured_demand_eel_kabayaki | 2 |
| cuisine_token_has_no_measured_demand_japanese_okonomiyaki | 2 |
| cuisine_token_has_no_measured_demand_瀬戸やきそば | 2 |
| cuisine_token_has_no_measured_demand_beef_rap | 2 |
| cuisine_token_has_no_measured_demand_台湾まぜそば | 2 |
| cuisine_token_has_no_measured_demand_マカロン | 2 |
| cuisine_token_has_no_measured_demand_ドリンク | 2 |
| cuisine_token_has_no_measured_demand_nabemono | 2 |
| cuisine_token_has_no_measured_demand_chankonabe | 2 |
| cuisine_token_has_no_measured_demand_卵かけごはん | 2 |
| cuisine_token_has_no_measured_demand_past | 2 |
| cuisine_token_has_no_measured_demand_マリオ・バーガー | 2 |
| cuisine_token_has_no_measured_demand_ルイージ・バーガー | 2 |
| cuisine_token_has_no_measured_demand_大魔王クッパ・ハンバーグステーキ | 2 |
| cuisine_token_has_no_measured_demand_フィッシュボーン白身魚のムニエル | 2 |
| cuisine_token_has_no_measured_demand_daifuku | 2 |
| cuisine_token_has_no_measured_demand_wagashi | 2 |
| cuisine_token_has_no_measured_demand_noodle:lamen(ja) | 2 |
| cuisine_token_has_no_measured_demand_noodle:lamen | 2 |
| cuisine_token_has_no_measured_demand_たい焼 | 2 |
| cuisine_token_has_no_measured_demand_mixology_bar | 2 |
| cuisine_token_has_no_measured_demand_ベトナム料理 | 2 |
| cuisine_token_has_no_measured_demand_アイスクリーム | 2 |
| cuisine_token_has_no_measured_demand_ggq | 2 |
| cuisine_token_has_no_measured_demand_なまず | 2 |
| cuisine_token_has_no_measured_demand_瀬戸焼きそば | 2 |
| cuisine_token_has_no_measured_demand_お好み焼•鉄板焼 | 2 |
| cuisine_token_has_no_measured_demand_うなぎ、やきとり、釜めし | 2 |
| cuisine_token_has_no_measured_demand_九州料理 | 2 |
| cuisine_token_has_no_measured_demand_そば、うどん | 2 |
| cuisine_token_has_no_measured_demand_plant_milk | 2 |
| cuisine_token_has_no_measured_demand_ddeokbokki | 2 |
| cuisine_token_has_no_measured_demand_広島焼 | 2 |
| cuisine_token_has_no_measured_demand_black_tea | 2 |
| cuisine_token_has_no_measured_demand_たかなずし | 2 |
| cuisine_token_has_no_measured_demand_ローストビーフ | 2 |
| cuisine_token_has_no_measured_demand_わらび餅 | 2 |
| cuisine_token_has_no_measured_demand_ウナギ | 2 |
| cuisine_token_has_no_measured_demand_鯛焼き | 2 |
| cuisine_token_has_no_measured_demand_から揚げ | 2 |
| cuisine_token_has_no_measured_demand_chocolate_food | 2 |
| cuisine_token_has_no_measured_demand_モンブラン | 2 |
| cuisine_token_has_no_measured_demand_サンドイッチ | 2 |
| cuisine_token_has_no_measured_demand_カツサンド | 2 |
| cuisine_token_has_no_measured_demand_土佐料理 | 2 |
| cuisine_token_has_no_measured_demand_イカ焼き | 2 |
| cuisine_token_has_no_measured_demand_ソーセージ | 2 |
| cuisine_token_has_no_measured_demand_クラフトビアレストラン | 2 |
| cuisine_token_has_no_measured_demand_オールデイダイニング | 2 |
| cuisine_token_has_no_measured_demand_フレンチ串揚げ | 2 |
| cuisine_token_has_no_measured_demand_鶏料理 | 2 |
| cuisine_token_has_no_measured_demand_カフェラウンジ | 2 |
| cuisine_token_has_no_measured_demand_カフェテリアラウンジ | 2 |
| cuisine_token_has_no_measured_demand_海鮮・日本酒・居酒屋 | 2 |
| cuisine_token_has_no_measured_demand_itarian | 2 |
| cuisine_token_has_no_measured_demand_仕出し | 2 |
| cuisine_token_has_no_measured_demand_コナモン | 2 |
| cuisine_token_has_no_measured_demand_japanese:chanko | 2 |
| cuisine_token_has_no_measured_demand_taco_rice | 2 |
| cuisine_token_has_no_measured_demand_韓国料理 | 2 |
| cuisine_token_has_no_measured_demand_cafe_and_bar | 2 |
| cuisine_token_has_no_measured_demand_明石焼 | 2 |
| cuisine_token_has_no_measured_demand_karasge | 2 |
| cuisine_token_has_no_measured_demand_sweetfish | 2 |
| cuisine_token_has_no_measured_demand_カフェメニュー | 2 |
| cuisine_token_has_no_measured_demand_jelly | 2 |
| cuisine_token_has_no_measured_demand_シンガポール料理 | 2 |
| cuisine_token_has_no_measured_demand_洋菓子 | 2 |
| cuisine_token_has_no_measured_demand_シュークリーム | 2 |
| cuisine_token_has_no_measured_demand_海鮮料理 | 2 |
| cuisine_token_has_no_measured_demand_monjsyaki | 2 |
| cuisine_token_has_no_measured_demand_冷やし焼き芋 | 2 |
| cuisine_token_has_no_measured_demand_スイートポテト | 2 |
| cuisine_token_has_no_measured_demand_芋チップス | 2 |
| cuisine_token_has_no_measured_demand_鶏そば | 2 |
| cuisine_token_has_no_measured_demand_牛カツ | 2 |
| cuisine_token_has_no_measured_demand_ハイボール | 2 |
| cuisine_token_has_no_measured_demand_dagashi | 2 |
| cuisine_token_has_no_measured_demand_鶏白湯そば | 2 |
| cuisine_token_has_no_measured_demand_チーズ | 2 |
| cuisine_token_has_no_measured_demand_お弁当 | 2 |
| cuisine_token_has_no_measured_demand_定食屋 | 2 |
| cuisine_token_has_no_measured_demand_蕎麦店 | 2 |
| cuisine_token_has_no_measured_demand_イラン料理 | 2 |
| cuisine_token_has_no_measured_demand_rame | 2 |
| cuisine_token_has_no_measured_demand_オムレツ | 2 |
| cuisine_token_has_no_measured_demand_misc | 2 |
| cuisine_token_has_no_measured_demand_makiyaki | 2 |
| cuisine_token_has_no_measured_demand_mizutaki | 2 |
| cuisine_token_has_no_measured_demand_洋食レストラン | 2 |
| cuisine_token_has_no_measured_demand_baumkuchen | 2 |
| cuisine_token_has_no_measured_demand_広島お好み焼き | 2 |
| cuisine_token_has_no_measured_demand_広島つけ麺 | 2 |
| cuisine_token_has_no_measured_demand_もつ煮定食大中 | 2 |
| cuisine_token_has_no_measured_demand_cocoa | 2 |
| cuisine_token_has_no_measured_demand_プロテイン | 2 |
| cuisine_token_has_no_measured_demand_へんこ焼き | 2 |
| cuisine_token_has_no_measured_demand_レモンサワー | 2 |
| cuisine_token_has_no_measured_demand_ｶﾚｰ | 2 |
| cuisine_token_has_no_measured_demand_モーニング | 2 |
| cuisine_token_has_no_measured_demand_トースト | 2 |
| cuisine_token_has_no_measured_demand_カウンター居酒屋 | 2 |
| cuisine_token_has_no_measured_demand_トッポッキ | 2 |
| cuisine_token_has_no_measured_demand_offal | 2 |
| cuisine_token_has_no_measured_demand_タンメン | 2 |
| cuisine_token_has_no_measured_demand_ワッフル | 2 |
| cuisine_token_has_no_measured_demand_fish_bowl | 2 |
| cuisine_token_has_no_measured_demand_motsu | 2 |
| cuisine_token_has_no_measured_demand_フライドチキン | 2 |
| cuisine_token_has_no_measured_demand_roasted_sweet_potato | 2 |
| cuisine_token_has_no_measured_demand_フグ料理 | 2 |
| cuisine_token_has_no_measured_demand_ビーフシチュー | 2 |
| cuisine_token_has_no_measured_demand_ドリア | 2 |
| cuisine_token_has_no_measured_demand_配達弁当 | 2 |
| cuisine_token_has_no_measured_demand_chiffon | 2 |
| cuisine_token_has_no_measured_demand_カツレツ | 2 |
| cuisine_token_has_no_measured_demand_ハヤシオムライス | 2 |
| cuisine_token_has_no_measured_demand_ナポリタン | 2 |
| cuisine_token_has_no_measured_demand_自家製プリン | 2 |
| cuisine_token_has_no_measured_demand_抹茶ラテ | 2 |
| cuisine_token_has_no_measured_demand_放課後プリンパフェ | 2 |
| cuisine_token_has_no_measured_demand_australie | 2 |
| cuisine_token_has_no_measured_demand_たじみそ焼きそば | 2 |
| cuisine_token_has_no_measured_demand_五目ご飯 | 2 |
| cuisine_token_has_no_measured_demand_ワインバー | 2 |
| cuisine_token_has_no_measured_demand_塩唐揚げ | 2 |
| cuisine_token_has_no_measured_demand_サンドウィッチ、ジェラート | 2 |
| cuisine_token_has_no_measured_demand_牛タン料理 | 2 |
| cuisine_token_has_no_measured_demand_京鉄板 | 2 |
| cuisine_token_has_no_measured_demand_京もつ鍋 | 2 |
| cuisine_token_has_no_measured_demand_スイーツ | 2 |
| cuisine_token_has_no_measured_demand_フルーツサンド | 2 |
| cuisine_token_has_no_measured_demand_kabayaki | 2 |
| cuisine_token_has_no_measured_demand_四川料理 | 2 |
| cuisine_token_has_no_measured_demand_粉もん | 2 |
| cuisine_token_has_no_measured_demand_天婦羅 | 2 |
| cuisine_token_has_no_measured_demand_iron-plate_cooking | 2 |
| cuisine_token_has_no_measured_demand_oyaki | 2 |
| cuisine_token_has_no_measured_demand_スパイスカレー | 2 |
| cuisine_token_has_no_measured_demand_ジビエ | 2 |
| cuisine_token_has_no_measured_demand_cuisine:ja=ラーメン | 2 |
| cuisine_token_has_no_measured_demand_よもぎうどん | 2 |
| cuisine_token_has_no_measured_demand_トルコライス | 2 |
| cuisine_token_has_no_measured_demand_アジフライ | 2 |
| cuisine_token_has_no_measured_demand_じゃじゃ麺専門店 | 2 |
| cuisine_token_has_no_measured_demand_豚かつ | 2 |
| cuisine_token_has_no_measured_demand_お好み焼き、鉄板焼 | 2 |
| cuisine_token_has_no_measured_demand_maid_cafe | 2 |
| cuisine_token_has_no_measured_demand_washoku | 2 |
| cuisine_token_has_no_measured_demand_ネパール | 2 |
| cuisine_token_has_no_measured_demand_ふぐ料理 | 2 |
| cuisine_token_has_no_measured_demand_hamburger_steak | 2 |
| cuisine_token_has_no_measured_demand_regional_okinawa | 2 |
| cuisine_token_has_no_measured_demand_多国籍 | 2 |
| cuisine_token_has_no_measured_demand_手羽先 | 2 |
| cuisine_token_has_no_measured_demand_myanmer | 2 |
| cuisine_token_has_no_measured_demand_ポケ丼(ポキ) | 2 |
| cuisine_token_has_no_measured_demand_サラミ | 2 |
| cuisine_token_has_no_measured_demand_生ハム | 2 |
| cuisine_token_has_no_measured_demand_ゼリー寄せ | 2 |
| cuisine_token_has_no_measured_demand_シャルキュトリー | 2 |
| cuisine_token_has_no_measured_demand_beef_tongue | 2 |
| cuisine_token_has_no_measured_demand_あんみつ | 2 |
| cuisine_token_has_no_measured_demand_シシリアンライス | 2 |
| cuisine_token_has_no_measured_demand_ぎょうざ | 2 |
| cuisine_token_has_no_measured_demand_フランクフルト | 2 |
| cuisine_token_has_no_measured_demand_カルビ丼 | 2 |
| cuisine_token_has_no_measured_demand_スンドゥブ | 2 |
| cuisine_token_has_no_measured_demand_ちゃんぽん_ラーメン | 2 |
| cuisine_token_has_no_measured_demand_andhra_pradesh | 2 |
| cuisine_token_has_no_measured_demand_andhra | 2 |
| cuisine_token_has_no_measured_demand_ベビーカステラ | 2 |
| cuisine_token_has_no_measured_demand_キーマカレー | 2 |
| cuisine_token_has_no_measured_demand_クラフトコーラ | 2 |
| cuisine_token_has_no_measured_demand_クラフトレモネード | 2 |
| cuisine_token_has_no_measured_demand_麻辣烫 | 2 |
| cuisine_token_has_no_measured_demand_イスラム | 2 |
| cuisine_token_has_no_measured_demand_gratin | 2 |
| cuisine_token_has_no_measured_demand_grilled_bird | 2 |
| cuisine_token_has_no_measured_demand_カルビ | 2 |
| cuisine_token_has_no_measured_demand_カニ料理 | 2 |
| cuisine_token_has_no_measured_demand_おつまみ | 2 |
| cuisine_token_has_no_measured_demand_douhua | 2 |
| cuisine_token_has_no_measured_demand_indian_curry | 2 |
| cuisine_token_has_no_measured_demand_ホットケーキ | 2 |
| cuisine_token_has_no_measured_demand_フレンチトースト | 2 |
| cuisine_token_has_no_measured_demand_oister | 2 |
| cuisine_token_has_no_measured_demand_ハヤシライス | 2 |
| cuisine_token_has_no_measured_demand_テイクアウトカフェ | 2 |
| cuisine_token_has_no_measured_demand_豆腐料理 | 2 |
| cuisine_token_has_no_measured_demand_cal | 2 |
| cuisine_token_has_no_measured_demand_スコーン | 2 |
| cuisine_token_has_no_measured_demand_郷土料理 | 2 |
| cuisine_token_has_no_measured_demand_dango | 2 |
| cuisine_token_has_no_measured_demand_katsu-don | 2 |
| cuisine_token_has_no_measured_demand_マーラータン | 2 |
| cuisine_token_has_no_measured_demand_ウイグルハラル料理 | 2 |
| cuisine_token_has_no_measured_demand_鳥料理 | 2 |
| cuisine_token_has_no_measured_demand_tappas | 2 |
| cuisine_token_has_no_measured_demand__khmer | 2 |
| cuisine_token_has_no_measured_demand_bbq_and_soup | 2 |
| cuisine_token_has_no_measured_demand_cheese_fondue | 2 |
| cuisine_token_has_no_measured_demand_french_mediteranean | 2 |
| cuisine_token_has_no_measured_demand_cambodian_bbq | 2 |
| cuisine_token_has_no_measured_demand_vietnam_food | 2 |
| cuisine_token_has_no_measured_demand_bugs | 2 |
| cuisine_token_has_no_measured_demand__petit_déjeuner | 2 |
| cuisine_token_has_no_measured_demand__boulangerie | 2 |
| cuisine_token_has_no_measured_demand__thé | 2 |
| cuisine_token_has_no_measured_demand__goûter | 2 |
| cuisine_token_has_no_measured_demand__taiwanese_food | 2 |
| cuisine_token_has_no_measured_demand__asian_food | 2 |
| cuisine_token_has_no_measured_demand__western_food | 2 |
| cuisine_token_has_no_measured_demand_cambidgian | 2 |
| cuisine_token_has_no_measured_demand_dog_meat | 2 |
| cuisine_token_has_no_measured_demand_khmer_soup | 2 |
| cuisine_token_has_no_measured_demand_wholesale_bakery | 2 |
| cuisine_token_has_no_measured_demand_rice_and_pork | 2 |
| cuisine_token_has_no_measured_demand_internationa | 2 |
| cuisine_token_has_no_measured_demand_fusion_food | 2 |
| cuisine_token_has_no_measured_demand_cambodgienne | 2 |
| cuisine_token_has_no_measured_demand_apsara | 2 |
| cuisine_token_has_no_measured_demand_cambodian_cuisine | 2 |
| cuisine_token_has_no_measured_demand_paninis | 2 |
| cuisine_token_has_no_measured_demand_sandwitxh | 2 |
| cuisine_token_has_no_measured_demand_couscous_(le_vendredi) | 2 |
| cuisine_token_has_no_measured_demand_fast_food_&_local_dishes | 2 |
| cuisine_token_has_no_measured_demand__glace | 2 |
| cuisine_token_has_no_measured_demand__plats | 2 |
| cuisine_token_has_no_measured_demand__pâtes | 2 |
| cuisine_token_has_no_measured_demand__tacos | 2 |
| cuisine_token_has_no_measured_demand_casse-croûte | 2 |
| cuisine_token_has_no_measured_demand_savory_p | 2 |
| cuisine_token_has_no_measured_demand_italian_pizz | 2 |
| cuisine_token_has_no_measured_demand_casse-croute | 2 |
| cuisine_token_has_no_measured_demand_the_a_la_menthe | 2 |
| cuisine_token_has_no_measured_demand_birthday | 2 |
| cuisine_token_has_no_measured_demand_chawarma | 2 |
| cuisine_token_has_no_measured_demand_poiss | 2 |
| cuisine_token_has_no_measured_demand_بوظة | 2 |
| cuisine_token_has_no_measured_demand_brunchs | 2 |
| cuisine_token_has_no_measured_demand_rifaine | 2 |
| cuisine_token_has_no_measured_demand_fritures | 2 |
| cuisine_token_has_no_measured_demand_teigwaren | 2 |
| cuisine_token_has_no_measured_demand_marrocaine | 2 |
| cuisine_token_has_no_measured_demand_tacos_de_canasta | 2 |
| cuisine_token_has_no_measured_demand_ostión | 2 |
| cuisine_token_has_no_measured_demand_paleteria | 2 |
| cuisine_token_has_no_measured_demand_tortería | 2 |
| cuisine_token_has_no_measured_demand_cafecito_tun_tun | 2 |
| cuisine_token_has_no_measured_demand_ribs_&_bbq | 2 |
| cuisine_token_has_no_measured_demand_tapatia | 2 |
| cuisine_token_has_no_measured_demand_café_orgánico_de_chiapas | 2 |
| cuisine_token_has_no_measured_demand_asador_argentino | 2 |
| cuisine_token_has_no_measured_demand_mariscos_ | 2 |
| cuisine_token_has_no_measured_demand_mexican_oaxaqueña | 2 |
| cuisine_token_has_no_measured_demand_torteria | 2 |
| cuisine_token_has_no_measured_demand_norteña_mexicana | 2 |
| cuisine_token_has_no_measured_demand__desayunos | 2 |
| cuisine_token_has_no_measured_demand__cenas | 2 |
| cuisine_token_has_no_measured_demand_russian_food | 2 |
| cuisine_token_has_no_measured_demand_spanish_food | 2 |
| cuisine_token_has_no_measured_demand_texas_bbq | 2 |
| cuisine_token_has_no_measured_demand__tea | 2 |
| cuisine_token_has_no_measured_demand__hamburguesa | 2 |
| cuisine_token_has_no_measured_demand__alitas | 2 |
| cuisine_token_has_no_measured_demand_fish_tacos | 2 |
| cuisine_token_has_no_measured_demand__sin_conservadores | 2 |
| cuisine_token_has_no_measured_demand__aguachiles | 2 |
| cuisine_token_has_no_measured_demand__pescado | 2 |
| cuisine_token_has_no_measured_demand__papas_fritas | 2 |
| cuisine_token_has_no_measured_demand_crepas_y_cafe | 2 |
| cuisine_token_has_no_measured_demand_swiss-mexican | 2 |
| cuisine_token_has_no_measured_demand_chamoyadas | 2 |
| cuisine_token_has_no_measured_demand__frappes_&_smoothies | 2 |
| cuisine_token_has_no_measured_demand_aves | 2 |
| cuisine_token_has_no_measured_demand_café_y_galletas | 2 |
| cuisine_token_has_no_measured_demand_seadfood | 2 |
| cuisine_token_has_no_measured_demand_french_&_basque | 2 |
| cuisine_token_has_no_measured_demand_pollos_asados | 2 |
| cuisine_token_has_no_measured_demand__mexican | 2 |
| cuisine_token_has_no_measured_demand__fusion | 2 |
| cuisine_token_has_no_measured_demand_tacos_de_carnitas | 2 |
| cuisine_token_has_no_measured_demand_urbana | 2 |
| cuisine_token_has_no_measured_demand__comida_regional | 2 |
| cuisine_token_has_no_measured_demand_alitas_de_pollo | 2 |
| cuisine_token_has_no_measured_demand_seafood_and_mexican | 2 |
| cuisine_token_has_no_measured_demand_mariscos_/_mexican_food | 2 |
| cuisine_token_has_no_measured_demand_tasting_menus | 2 |
| cuisine_token_has_no_measured_demand_prehispanica | 2 |
| cuisine_token_has_no_measured_demand__exotica | 2 |
| cuisine_token_has_no_measured_demand_tamal | 2 |
| cuisine_token_has_no_measured_demand_baguet | 2 |
| cuisine_token_has_no_measured_demand_panadería_artesanal | 2 |
| cuisine_token_has_no_measured_demand_café_colombianos | 2 |
| cuisine_token_has_no_measured_demand_cocina_urbana | 2 |
| cuisine_token_has_no_measured_demand_restaurant_bar | 2 |
| cuisine_token_has_no_measured_demand_otro | 2 |
| cuisine_token_has_no_measured_demand_especializado_en_pollo | 2 |
| cuisine_token_has_no_measured_demand_restaurant_café | 2 |
| cuisine_token_has_no_measured_demand_desconocido | 2 |
| cuisine_token_has_no_measured_demand_pozolería | 2 |
| cuisine_token_has_no_measured_demand_tacos_de_cesina | 2 |
| cuisine_token_has_no_measured_demand_nutrition | 2 |
| cuisine_token_has_no_measured_demand_tortadas | 2 |
| cuisine_token_has_no_measured_demand_healty | 2 |
| cuisine_token_has_no_measured_demand_vietnamita | 2 |
| cuisine_token_has_no_measured_demand_alternativa | 2 |
| cuisine_token_has_no_measured_demand_pozolerías | 2 |
| cuisine_token_has_no_measured_demand_books | 2 |
| cuisine_token_has_no_measured_demand_soap | 2 |
| cuisine_token_has_no_measured_demand_tortas_y_tacos | 2 |
| cuisine_token_has_no_measured_demand_cabeza | 2 |
| cuisine_token_has_no_measured_demand_ordenes | 2 |
| cuisine_token_has_no_measured_demand_pezcuezos_de_pollo | 2 |
| cuisine_token_has_no_measured_demand_prawns | 2 |
| cuisine_token_has_no_measured_demand_aguachile | 2 |
| cuisine_token_has_no_measured_demand_aguas_frescas | 2 |
| cuisine_token_has_no_measured_demand_champurrado | 2 |
| cuisine_token_has_no_measured_demand_tacos_al_pastor | 2 |
| cuisine_token_has_no_measured_demand_coquis | 2 |
| cuisine_token_has_no_measured_demand_mil_salsas | 2 |
| cuisine_token_has_no_measured_demand_brewing | 2 |
| cuisine_token_has_no_measured_demand_house_beer | 2 |
| cuisine_token_has_no_measured_demand_award-winning_beer | 2 |
| cuisine_token_has_no_measured_demand_varios | 2 |
| cuisine_token_has_no_measured_demand_vlocal | 2 |
| cuisine_token_has_no_measured_demand_tortas_ahogadas | 2 |
| cuisine_token_has_no_measured_demand_huarache | 2 |
| cuisine_token_has_no_measured_demand_wings_&_ribs | 2 |
| cuisine_token_has_no_measured_demand_vietnamese_rolls | 2 |
| cuisine_token_has_no_measured_demand_nieve_en_rollo | 2 |
| cuisine_token_has_no_measured_demand_ensalads | 2 |
| cuisine_token_has_no_measured_demand_restaurante_mexicano | 2 |
| cuisine_token_has_no_measured_demand_repostreria | 2 |
| cuisine_token_has_no_measured_demand_comida_estilo_cantonese | 2 |
| cuisine_token_has_no_measured_demand_tacos_de_pescado | 2 |
| cuisine_token_has_no_measured_demand_comida_tipica_mexicana | 2 |
| cuisine_token_has_no_measured_demand_gorditas_y_tamales | 2 |
| cuisine_token_has_no_measured_demand_dogos | 2 |
| cuisine_token_has_no_measured_demand_de_autor | 2 |
| cuisine_token_has_no_measured_demand_elotería | 2 |
| cuisine_token_has_no_measured_demand_hamburgesas | 2 |
| cuisine_token_has_no_measured_demand_choripan | 2 |
| cuisine_token_has_no_measured_demand_bebidas_preparadas | 2 |
| cuisine_token_has_no_measured_demand_flautas | 2 |
| cuisine_token_has_no_measured_demand_comi | 2 |
| cuisine_token_has_no_measured_demand_brochetas | 2 |
| cuisine_token_has_no_measured_demand_hamburguesa | 2 |
| cuisine_token_has_no_measured_demand_papas_a_la_francesa | 2 |
| cuisine_token_has_no_measured_demand_papa_asada | 2 |
| cuisine_token_has_no_measured_demand_tostada_de_pollo | 2 |
| cuisine_token_has_no_measured_demand_heladería | 2 |
| cuisine_token_has_no_measured_demand_nieve | 2 |
| cuisine_token_has_no_measured_demand_crepa | 2 |
| cuisine_token_has_no_measured_demand_paletas_aresanales | 2 |
| cuisine_token_has_no_measured_demand_mocha | 2 |
| cuisine_token_has_no_measured_demand_minichurro | 2 |
| cuisine_token_has_no_measured_demand_koko_donut | 2 |
| cuisine_token_has_no_measured_demand_almuerzos | 2 |
| cuisine_token_has_no_measured_demand_omelete | 2 |
| cuisine_token_has_no_measured_demand_huevos_al_gusto | 2 |
| cuisine_token_has_no_measured_demand_machacado | 2 |
| cuisine_token_has_no_measured_demand_bagguet | 2 |
| cuisine_token_has_no_measured_demand_cheese_cake | 2 |
| cuisine_token_has_no_measured_demand_antojos | 2 |
| cuisine_token_has_no_measured_demand_cocteles_de_camarón | 2 |
| cuisine_token_has_no_measured_demand_mojarra_frita | 2 |
| cuisine_token_has_no_measured_demand_camarones | 2 |
| cuisine_token_has_no_measured_demand_milanesa_de_pollo | 2 |
| cuisine_token_has_no_measured_demand_carne_ahumada | 2 |
| cuisine_token_has_no_measured_demand_alambres | 2 |
| cuisine_token_has_no_measured_demand_gringas | 2 |
| cuisine_token_has_no_measured_demand_sopa_callejera | 2 |
| cuisine_token_has_no_measured_demand_tacos_de_vapor | 2 |
| cuisine_token_has_no_measured_demand_artesanales | 2 |
| cuisine_token_has_no_measured_demand_parrillada | 2 |
| cuisine_token_has_no_measured_demand_pastas | 2 |
| cuisine_token_has_no_measured_demand_para_niños | 2 |
| cuisine_token_has_no_measured_demand_ahumados | 2 |
| cuisine_token_has_no_measured_demand_texana | 2 |
| cuisine_token_has_no_measured_demand_brisket | 2 |
| cuisine_token_has_no_measured_demand_tacos_de_birria | 2 |
| cuisine_token_has_no_measured_demand_órden_de_birria_de_chivo | 2 |
| cuisine_token_has_no_measured_demand_charolas_de_carne | 2 |
| cuisine_token_has_no_measured_demand_mixiote | 2 |
| cuisine_token_has_no_measured_demand_pateleria | 2 |
| cuisine_token_has_no_measured_demand_yucateco | 2 |
| cuisine_token_has_no_measured_demand_cebadina | 2 |
| cuisine_token_has_no_measured_demand_costilla_bbq | 2 |
| cuisine_token_has_no_measured_demand_lonchería | 2 |
| cuisine_token_has_no_measured_demand_carnes_fritas | 2 |
| cuisine_token_has_no_measured_demand_adobada | 2 |
| cuisine_token_has_no_measured_demand_cycling_cafe | 2 |
| cuisine_token_has_no_measured_demand_cantina | 2 |
| cuisine_token_has_no_measured_demand_malteadas | 2 |
| cuisine_token_has_no_measured_demand_tenders | 2 |
| cuisine_token_has_no_measured_demand_arroz_con_leche | 2 |
| cuisine_token_has_no_measured_demand_cocina_campestre | 2 |
| cuisine_token_has_no_measured_demand_pollos_rostizados | 2 |
| cuisine_token_has_no_measured_demand_fungi | 2 |
| cuisine_token_has_no_measured_demand_quesadillas_y_memelas | 2 |
| cuisine_token_has_no_measured_demand_lonches | 2 |
| cuisine_token_has_no_measured_demand_coctel | 2 |
| cuisine_token_has_no_measured_demand_licuados | 2 |
| cuisine_token_has_no_measured_demand_aguas_de_sabor | 2 |
| cuisine_token_has_no_measured_demand_pastelillos | 2 |
| cuisine_token_has_no_measured_demand_tacos_flautas | 2 |
| cuisine_token_has_no_measured_demand_friend_potatoes | 2 |
| cuisine_token_has_no_measured_demand_torta | 2 |
| cuisine_token_has_no_measured_demand_café_de_tercera_ola | 2 |
| cuisine_token_has_no_measured_demand_café_de_espcialidad | 2 |
| cuisine_token_has_no_measured_demand_salchipapas | 2 |
| cuisine_token_has_no_measured_demand_bebidas_varias | 2 |
| cuisine_token_has_no_measured_demand_jugos | 2 |
| cuisine_token_has_no_measured_demand_mas | 2 |
| cuisine_token_has_no_measured_demand_birtía | 2 |
| cuisine_token_has_no_measured_demand_frappés | 2 |
| cuisine_token_has_no_measured_demand_frappé | 2 |
| cuisine_token_has_no_measured_demand_sincronizadas | 2 |
| cuisine_token_has_no_measured_demand_burritas | 2 |
| cuisine_token_has_no_measured_demand_tortas_cubanas | 2 |
| cuisine_token_has_no_measured_demand_tortas_hawaianas | 2 |
| cuisine_token_has_no_measured_demand_yucatec | 2 |
| cuisine_token_has_no_measured_demand_empanadería | 2 |
| cuisine_token_has_no_measured_demand_picadas | 2 |
| cuisine_token_has_no_measured_demand_cerdo | 2 |
| cuisine_token_has_no_measured_demand_tacos_de_guisado | 2 |
| cuisine_token_has_no_measured_demand_mezcal | 2 |
| cuisine_token_has_no_measured_demand_huevos_rancheros | 2 |
| cuisine_token_has_no_measured_demand_fajitas_de_pollo | 2 |
| cuisine_token_has_no_measured_demand_carne_de_pastor | 2 |
| cuisine_token_has_no_measured_demand_enfrijoladas | 2 |
| cuisine_token_has_no_measured_demand_cocteles | 2 |
| cuisine_token_has_no_measured_demand_pollo_con_mole | 2 |
| cuisine_token_has_no_measured_demand_pollo_adobado | 2 |
| cuisine_token_has_no_measured_demand_bistec_a_la_mexicana | 2 |
| cuisine_token_has_no_measured_demand_albondi | 2 |
| cuisine_token_has_no_measured_demand_tacos_dorados | 2 |
| cuisine_token_has_no_measured_demand_pan_compuesto | 2 |
| cuisine_token_has_no_measured_demand_tacos_dorados_ahogados | 2 |
| cuisine_token_has_no_measured_demand_platanos_fritos | 2 |
| cuisine_token_has_no_measured_demand_pozol | 2 |
| cuisine_token_has_no_measured_demand_tostadores_de_café | 2 |
| cuisine_token_has_no_measured_demand_económica | 2 |
| cuisine_token_has_no_measured_demand_tamalaes | 2 |
| cuisine_token_has_no_measured_demand_garnachas | 2 |
| cuisine_token_has_no_measured_demand_uruguayian | 2 |
| cuisine_token_has_no_measured_demand_cornpop | 2 |
| cuisine_token_has_no_measured_demand_sirloin | 2 |
| cuisine_token_has_no_measured_demand_salchicha_roja | 2 |
| cuisine_token_has_no_measured_demand_cemitas | 2 |
| cuisine_token_has_no_measured_demand_tacos_arabes | 2 |
| cuisine_token_has_no_measured_demand_agua_de_piña | 2 |
| cuisine_token_has_no_measured_demand_agua_de_melon | 2 |
| cuisine_token_has_no_measured_demand_agua_de_sandia | 2 |
| cuisine_token_has_no_measured_demand_agua_de_jamaica | 2 |
| cuisine_token_has_no_measured_demand_agua_de_cebada | 2 |
| cuisine_token_has_no_measured_demand_agua_de_avena | 2 |
| cuisine_token_has_no_measured_demand_agua_de_tamarindo | 2 |
| cuisine_token_has_no_measured_demand_cacahuate | 2 |
| cuisine_token_has_no_measured_demand_urban | 2 |
| cuisine_token_has_no_measured_demand_chicharrón | 2 |
| cuisine_token_has_no_measured_demand_butifarras | 2 |
| cuisine_token_has_no_measured_demand_mole | 2 |
| cuisine_token_has_no_measured_demand_guisos_mexicanos | 2 |
| cuisine_token_has_no_measured_demand_carnitas_y_bebidas | 2 |
| cuisine_token_has_no_measured_demand_pastes | 2 |
| cuisine_token_has_no_measured_demand_malay/indian | 2 |
| cuisine_token_has_no_measured_demand_cendol | 2 |
| cuisine_token_has_no_measured_demand_soup_pedas_kajang | 2 |
| cuisine_token_has_no_measured_demand_regional_snacks | 2 |
| cuisine_token_has_no_measured_demand_lor_mee | 2 |
| cuisine_token_has_no_measured_demand_jemenite | 2 |
| cuisine_token_has_no_measured_demand__relaxed_atmosphere | 2 |
| cuisine_token_has_no_measured_demand__al_fresco | 2 |
| cuisine_token_has_no_measured_demand__and_other. | 2 |
| cuisine_token_has_no_measured_demand_mammak | 2 |
| cuisine_token_has_no_measured_demand_coffee_distributor | 2 |
| cuisine_token_has_no_measured_demand_teh_tarik | 2 |
| cuisine_token_has_no_measured_demand__roti_canai | 2 |
| cuisine_token_has_no_measured_demand__nasi_kampung | 2 |
| cuisine_token_has_no_measured_demand__satay | 2 |
| cuisine_token_has_no_measured_demand__nasi_lemak | 2 |
| cuisine_token_has_no_measured_demand_penang_cuisnes | 2 |
| cuisine_token_has_no_measured_demand__penang_asam_laksa | 2 |
| cuisine_token_has_no_measured_demand__rojak | 2 |
| cuisine_token_has_no_measured_demand__asian_and_western | 2 |
| cuisine_token_has_no_measured_demand_beef_kway_teow | 2 |
| cuisine_token_has_no_measured_demand__mee_pok | 2 |
| cuisine_token_has_no_measured_demand_wanton_mee | 2 |
| cuisine_token_has_no_measured_demand_chicken_chop | 2 |
| cuisine_token_has_no_measured_demand_claypot_chicken_rice | 2 |
| cuisine_token_has_no_measured_demand_seafood_restaurand | 2 |
| cuisine_token_has_no_measured_demand_kueh_tiaw_kia | 2 |
| cuisine_token_has_no_measured_demand__fish | 2 |
| cuisine_token_has_no_measured_demand_mee_celup | 2 |
| cuisine_token_has_no_measured_demand__masakan_panas | 2 |
| cuisine_token_has_no_measured_demand__dll. | 2 |
| cuisine_token_has_no_measured_demand_福建面 | 2 |
| cuisine_token_has_no_measured_demand_ara | 2 |
| cuisine_token_has_no_measured_demand_local_chinese | 2 |
| cuisine_token_has_no_measured_demand_mee_tarik | 2 |
| cuisine_token_has_no_measured_demand_local_food_stall | 2 |
| cuisine_token_has_no_measured_demand_hot | 2 |
| cuisine_token_has_no_measured_demand_currymee | 2 |
| cuisine_token_has_no_measured_demand_curry_mee | 2 |
| cuisine_token_has_no_measured_demand_viele_kaffesorten | 2 |
| cuisine_token_has_no_measured_demand_internationale_küche | 2 |
| cuisine_token_has_no_measured_demand_curry_noodle | 2 |
| cuisine_token_has_no_measured_demand_char_kuey_teow | 2 |
| cuisine_token_has_no_measured_demand_pau | 2 |
| cuisine_token_has_no_measured_demand_mixed_rice | 2 |
| cuisine_token_has_no_measured_demand_sea | 2 |
| cuisine_token_has_no_measured_demand_makan_tengahari_&_malam | 2 |
| cuisine_token_has_no_measured_demand_belgian_waffles | 2 |
| cuisine_token_has_no_measured_demand_tomyam | 2 |
| cuisine_token_has_no_measured_demand_mamak_nasi_kandar | 2 |
| cuisine_token_has_no_measured_demand_minuman_sejuk | 2 |
| cuisine_token_has_no_measured_demand_minuman_panas | 2 |
| cuisine_token_has_no_measured_demand_sarapan | 2 |
| cuisine_token_has_no_measured_demand_white_coffee | 2 |
| cuisine_token_has_no_measured_demand_szechwan | 2 |
| cuisine_token_has_no_measured_demand_nasi_ayam_hainan | 2 |
| cuisine_token_has_no_measured_demand_laksa_nyonya | 2 |
| cuisine_token_has_no_measured_demand_laksa_penang | 2 |
| cuisine_token_has_no_measured_demand_laksa_johor | 2 |
| cuisine_token_has_no_measured_demand_birthdaycake | 2 |
| cuisine_token_has_no_measured_demand_weddingcake | 2 |
| cuisine_token_has_no_measured_demand_baba_nyonya | 2 |
| cuisine_token_has_no_measured_demand_yong_tau_foo | 2 |
| cuisine_token_has_no_measured_demand_ayam_kampung | 2 |
| cuisine_token_has_no_measured_demand_coffee_shop_restaurant | 2 |
| cuisine_token_has_no_measured_demand_asam_laksa | 2 |
| cuisine_token_has_no_measured_demand_steam_rice | 2 |
| cuisine_token_has_no_measured_demand_wan_tan_mee | 2 |
| cuisine_token_has_no_measured_demand_iban | 2 |
| cuisine_token_has_no_measured_demand_kolo_mi | 2 |
| cuisine_token_has_no_measured_demand_tosai | 2 |
| cuisine_token_has_no_measured_demand_capati | 2 |
| cuisine_token_has_no_measured_demand_beriani | 2 |
| cuisine_token_has_no_measured_demand_nasi_kunyit | 2 |
| cuisine_token_has_no_measured_demand_ayer_selasih | 2 |
| cuisine_token_has_no_measured_demand_rendang_cabut | 2 |
| cuisine_token_has_no_measured_demand_sarawakian | 2 |
| cuisine_token_has_no_measured_demand_sides | 2 |
| cuisine_token_has_no_measured_demand_ayam_gunting | 2 |
| cuisine_token_has_no_measured_demand_mee_hailam | 2 |
| cuisine_token_has_no_measured_demand_百样菜杂饭 | 2 |
| cuisine_token_has_no_measured_demand_burger_ramlee | 2 |
| cuisine_token_has_no_measured_demand_indonesia_street_food | 2 |
| cuisine_token_has_no_measured_demand_mookata | 2 |
| cuisine_token_has_no_measured_demand_fun_fries | 2 |
| cuisine_token_has_no_measured_demand_teh_ais | 2 |
| cuisine_token_has_no_measured_demand_milo | 2 |
| cuisine_token_has_no_measured_demand_western_fusion | 2 |
| cuisine_token_has_no_measured_demand_south-western_american | 2 |
| cuisine_token_has_no_measured_demand_italian_biscotti | 2 |
| cuisine_token_has_no_measured_demand_sourdough | 2 |
| cuisine_token_has_no_measured_demand_international_cuisine | 2 |
| cuisine_token_has_no_measured_demand_latin_american_cuisine | 2 |
| cuisine_token_has_no_measured_demand_hong_kong_style | 2 |
| cuisine_token_has_no_measured_demand_shel | 2 |
| cuisine_token_has_no_measured_demand_eclairs | 2 |
| cuisine_token_has_no_measured_demand_kelantanese | 2 |
| cuisine_token_has_no_measured_demand_terengganu | 2 |
| cuisine_token_has_no_measured_demand_perak | 2 |
| cuisine_token_has_no_measured_demand_pantai_timur | 2 |
| cuisine_token_has_no_measured_demand_smoke_bbq | 2 |
| cuisine_token_has_no_measured_demand_deep-fried-food | 2 |
| cuisine_token_has_no_measured_demand_deep_freid_food | 2 |
| cuisine_token_has_no_measured_demand_yakimono | 2 |
| cuisine_token_has_no_measured_demand_sake_bar | 2 |
| cuisine_token_has_no_measured_demand_kelantan | 2 |
| cuisine_token_has_no_measured_demand_nasi_kerabu | 2 |
| cuisine_token_has_no_measured_demand_udang_galah | 2 |
| cuisine_token_has_no_measured_demand_nanyang | 2 |
| cuisine_token_has_no_measured_demand_yougurt | 2 |
| cuisine_token_has_no_measured_demand_salmon_sushi | 2 |
| cuisine_token_has_no_measured_demand_pork_cheese_roll | 2 |
| cuisine_token_has_no_measured_demand_healthy_shake | 2 |
| cuisine_token_has_no_measured_demand_fit_club | 2 |
| cuisine_token_has_no_measured_demand_fruit_rojak | 2 |
| cuisine_token_has_no_measured_demand_braised_duck | 2 |
| cuisine_token_has_no_measured_demand_ais_kepal | 2 |
| cuisine_token_has_no_measured_demand_bah_kut_teh | 2 |
| cuisine_token_has_no_measured_demand_soy_milk | 2 |
| cuisine_token_has_no_measured_demand_toufu | 2 |
| cuisine_token_has_no_measured_demand_borneo_fuision | 2 |
| cuisine_token_has_no_measured_demand_solo_dining | 2 |
| cuisine_token_has_no_measured_demand_halal_food | 2 |
| cuisine_token_has_no_measured_demand_hainan | 2 |
| cuisine_token_has_no_measured_demand_artisan_bakery | 2 |
| cuisine_token_has_no_measured_demand_masakan_panas | 2 |
| cuisine_token_has_no_measured_demand_freshly_baked_cookies | 2 |
| cuisine_token_has_no_measured_demand_sarawak | 2 |
| cuisine_token_has_no_measured_demand_越南咖啡 | 2 |
| cuisine_token_has_no_measured_demand_steam_fish_head | 2 |
| cuisine_token_has_no_measured_demand_kampong_chicken | 2 |
| cuisine_token_has_no_measured_demand_curry_fish_head | 2 |
| cuisine_token_has_no_measured_demand__malay | 2 |
| cuisine_token_has_no_measured_demand_kampua | 2 |
| cuisine_token_has_no_measured_demand_roti_kahwin | 2 |
| cuisine_token_has_no_measured_demand_japanese_isakaya | 2 |
| cuisine_token_has_no_measured_demand_hot_snack | 2 |
| cuisine_token_has_no_measured_demand_starter | 2 |
| cuisine_token_has_no_measured_demand_frans | 2 |
| cuisine_token_has_no_measured_demand_oosters | 2 |
| cuisine_token_has_no_measured_demand_diversen | 2 |
| cuisine_token_has_no_measured_demand_cafatarie | 2 |
| cuisine_token_has_no_measured_demand_steack | 2 |
| cuisine_token_has_no_measured_demand_spareribs | 2 |
| cuisine_token_has_no_measured_demand_latin_barbecue | 2 |
| cuisine_token_has_no_measured_demand_italian_and_greek | 2 |
| cuisine_token_has_no_measured_demand__shoarma | 2 |
| cuisine_token_has_no_measured_demand_turkish/grand_cafe | 2 |
| cuisine_token_has_no_measured_demand_feest_arrangementen | 2 |
| cuisine_token_has_no_measured_demand_arrangementen | 2 |
| cuisine_token_has_no_measured_demand_cambdian | 2 |
| cuisine_token_has_no_measured_demand_lunchroom_italian | 2 |
| cuisine_token_has_no_measured_demand_bibimbap | 2 |
| cuisine_token_has_no_measured_demand_luch | 2 |
| cuisine_token_has_no_measured_demand_experimental | 2 |
| cuisine_token_has_no_measured_demand_irish_pub | 2 |
| cuisine_token_has_no_measured_demand_zuidoost-azië | 2 |
| cuisine_token_has_no_measured_demand_cigkofte | 2 |
| cuisine_token_has_no_measured_demand_whine | 2 |
| cuisine_token_has_no_measured_demand_italian:pasta | 2 |
| cuisine_token_has_no_measured_demand_tapas/koffiebar | 2 |
| cuisine_token_has_no_measured_demand_kazachstani | 2 |
| cuisine_token_has_no_measured_demand_alpenkeuken | 2 |
| cuisine_token_has_no_measured_demand_habesha | 2 |
| cuisine_token_has_no_measured_demand_org | 2 |
| cuisine_token_has_no_measured_demand_nederlands | 2 |
| cuisine_token_has_no_measured_demand_anatolisch | 2 |
| cuisine_token_has_no_measured_demand_wijn | 2 |
| cuisine_token_has_no_measured_demand_turks_mediterraans | 2 |
| cuisine_token_has_no_measured_demand_argetijns | 2 |
| cuisine_token_has_no_measured_demand_zuid-europese | 2 |
| cuisine_token_has_no_measured_demand_eetcafé | 2 |
| cuisine_token_has_no_measured_demand__diner | 2 |
| cuisine_token_has_no_measured_demand_stroopwafel | 2 |
| cuisine_token_has_no_measured_demand_sweet_&_savoury_pancakes | 2 |
| cuisine_token_has_no_measured_demand_croque_monsieur | 2 |
| cuisine_token_has_no_measured_demand_myanmarese | 2 |
| cuisine_token_has_no_measured_demand_lunchcafé | 2 |
| cuisine_token_has_no_measured_demand_wok_restaurant | 2 |
| cuisine_token_has_no_measured_demand_javaans | 2 |
| cuisine_token_has_no_measured_demand_pannenkoeken | 2 |
| cuisine_token_has_no_measured_demand_texaans | 2 |
| cuisine_token_has_no_measured_demand_pakistaans | 2 |
| cuisine_token_has_no_measured_demand_armeens | 2 |
| cuisine_token_has_no_measured_demand_allyoucaneat | 2 |
| cuisine_token_has_no_measured_demand_europe | 2 |
| cuisine_token_has_no_measured_demand_scandinavish | 2 |
| cuisine_token_has_no_measured_demand__italiaans | 2 |
| cuisine_token_has_no_measured_demand_iraans | 2 |
| cuisine_token_has_no_measured_demand_experience | 2 |
| cuisine_token_has_no_measured_demand__pancakes | 2 |
| cuisine_token_has_no_measured_demand_tostie | 2 |
| cuisine_token_has_no_measured_demand_sush | 2 |
| cuisine_token_has_no_measured_demand__fries | 2 |
| cuisine_token_has_no_measured_demand__snacks | 2 |
| cuisine_token_has_no_measured_demand_fushion | 2 |
| cuisine_token_has_no_measured_demand_burger_and_pizza | 2 |
| cuisine_token_has_no_measured_demand_home_made_food | 2 |
| cuisine_token_has_no_measured_demand_taart | 2 |
| cuisine_token_has_no_measured_demand_koffiehuis | 2 |
| cuisine_token_has_no_measured_demand_cat_food | 2 |
| cuisine_token_has_no_measured_demand_camping_de_eenhoorn | 2 |
| cuisine_token_has_no_measured_demand_mexicaans_fastfood | 2 |
| cuisine_token_has_no_measured_demand_borrel | 2 |
| cuisine_token_has_no_measured_demand_chinese_indonesian | 2 |
| cuisine_token_has_no_measured_demand_duurzaam | 2 |
| cuisine_token_has_no_measured_demand_korean_barbecue | 2 |
| cuisine_token_has_no_measured_demand_moluccan | 2 |
| cuisine_token_has_no_measured_demand_high_class | 2 |
| cuisine_token_has_no_measured_demand_antillian | 2 |
| cuisine_token_has_no_measured_demand_wafels | 2 |
| cuisine_token_has_no_measured_demand_shushi | 2 |
| cuisine_token_has_no_measured_demand_slow | 2 |
| cuisine_token_has_no_measured_demand_lunch_drankje_borrelen | 2 |
| cuisine_token_has_no_measured_demand_funk_food | 2 |
| cuisine_token_has_no_measured_demand_pizza_vis_vlees | 2 |
| cuisine_token_has_no_measured_demand__dinner_and_drink | 2 |
| cuisine_token_has_no_measured_demand_sho | 2 |
| cuisine_token_has_no_measured_demand_boodle_fight | 2 |
| cuisine_token_has_no_measured_demand_putos-putos | 2 |
| cuisine_token_has_no_measured_demand_pinutos | 2 |
| cuisine_token_has_no_measured_demand_campampangan | 2 |
| cuisine_token_has_no_measured_demand_philppino | 2 |
| cuisine_token_has_no_measured_demand__"budol-budol" | 2 |
| cuisine_token_has_no_measured_demand_milkteas | 2 |
| cuisine_token_has_no_measured_demand__valenciana | 2 |
| cuisine_token_has_no_measured_demand__local_&_intl._cuisine | 2 |
| cuisine_token_has_no_measured_demand_fried_chicken/_pork | 2 |
| cuisine_token_has_no_measured_demand__butchery | 2 |
| cuisine_token_has_no_measured_demand_lechon_manok_and_liempo | 2 |
| cuisine_token_has_no_measured_demand__ribs | 2 |
| cuisine_token_has_no_measured_demand__booze | 2 |
| cuisine_token_has_no_measured_demand__pancit_lucban | 2 |
| cuisine_token_has_no_measured_demand__longanisang_lucban | 2 |
| cuisine_token_has_no_measured_demand_sizzling_plate | 2 |
| cuisine_token_has_no_measured_demand_regional:tapsilog | 2 |
| cuisine_token_has_no_measured_demand_tapsilugan | 2 |
| cuisine_token_has_no_measured_demand_potato_fries | 2 |
| cuisine_token_has_no_measured_demand__pastries | 2 |
| cuisine_token_has_no_measured_demand_pasta_and_coffee | 2 |
| cuisine_token_has_no_measured_demand_grilled_food | 2 |
| cuisine_token_has_no_measured_demand_rice_porridge | 2 |
| cuisine_token_has_no_measured_demand__dokto | 2 |
| cuisine_token_has_no_measured_demand_kansi | 2 |
| cuisine_token_has_no_measured_demand_tapsi | 2 |
| cuisine_token_has_no_measured_demand_(healthy) | 2 |
| cuisine_token_has_no_measured_demand__pares | 2 |
| cuisine_token_has_no_measured_demand_burger_and_kebab | 2 |
| cuisine_token_has_no_measured_demand_satti | 2 |
| cuisine_token_has_no_measured_demand_back_ribs | 2 |
| cuisine_token_has_no_measured_demand_regional:bulalo | 2 |
| cuisine_token_has_no_measured_demand_regional:lomi | 2 |
| cuisine_token_has_no_measured_demand_filipino_breakfast | 2 |
| cuisine_token_has_no_measured_demand_lechon_baboy | 2 |
| cuisine_token_has_no_measured_demand__chicken | 2 |
| cuisine_token_has_no_measured_demand_sodas_and_juices | 2 |
| cuisine_token_has_no_measured_demand_bihon | 2 |
| cuisine_token_has_no_measured_demand_filiipino | 2 |
| cuisine_token_has_no_measured_demand_chevon | 2 |
| cuisine_token_has_no_measured_demand_pizza_place | 2 |
| cuisine_token_has_no_measured_demand_litson_manok | 2 |
| cuisine_token_has_no_measured_demand_visayan | 2 |
| cuisine_token_has_no_measured_demand_grilled_tuna | 2 |
| cuisine_token_has_no_measured_demand_tinola | 2 |
| cuisine_token_has_no_measured_demand_pata | 2 |
| cuisine_token_has_no_measured_demand_rice_meal | 2 |
| cuisine_token_has_no_measured_demand_home_cooked_meals | 2 |
| cuisine_token_has_no_measured_demand_breakfas | 2 |
| cuisine_token_has_no_measured_demand_all_day_meal | 2 |
| cuisine_token_has_no_measured_demand_rice_congee | 2 |
| cuisine_token_has_no_measured_demand_longaniza | 2 |
| cuisine_token_has_no_measured_demand_panciteria | 2 |
| cuisine_token_has_no_measured_demand_sushi_bar | 2 |
| cuisine_token_has_no_measured_demand_orienta | 2 |
| cuisine_token_has_no_measured_demand_lumpia | 2 |
| cuisine_token_has_no_measured_demand_tokneneng | 2 |
| cuisine_token_has_no_measured_demand_kikiam | 2 |
| cuisine_token_has_no_measured_demand_pan_de_coco | 2 |
| cuisine_token_has_no_measured_demand_white_bread | 2 |
| cuisine_token_has_no_measured_demand_grappa | 2 |
| cuisine_token_has_no_measured_demand_kantonese | 2 |
| cuisine_token_has_no_measured_demand_roasted_coffee_beans | 2 |
| cuisine_token_has_no_measured_demand_paskitani | 2 |
| cuisine_token_has_no_measured_demand_bangaladeshi | 2 |
| cuisine_token_has_no_measured_demand_mango_graham_shake | 2 |
| cuisine_token_has_no_measured_demand_filipino_comfort_food | 2 |
| cuisine_token_has_no_measured_demand_pinakbet | 2 |
| cuisine_token_has_no_measured_demand_ampalaya | 2 |
| cuisine_token_has_no_measured_demand_humba | 2 |
| cuisine_token_has_no_measured_demand_paklay | 2 |
| cuisine_token_has_no_measured_demand_batong | 2 |
| cuisine_token_has_no_measured_demand_adobong_kankong | 2 |
| cuisine_token_has_no_measured_demand_value_meal | 2 |
| cuisine_token_has_no_measured_demand_free_soup | 2 |
| cuisine_token_has_no_measured_demand_kaldereta | 2 |
| cuisine_token_has_no_measured_demand_pochero | 2 |
| cuisine_token_has_no_measured_demand_larang | 2 |
| cuisine_token_has_no_measured_demand_korean_japchae | 2 |
| cuisine_token_has_no_measured_demand_chicken_burger | 2 |
| cuisine_token_has_no_measured_demand_tapsilog_combo | 2 |
| cuisine_token_has_no_measured_demand_chicharon_bulaklak | 2 |
| cuisine_token_has_no_measured_demand_pares_with_rice | 2 |
| cuisine_token_has_no_measured_demand_pancit_pares | 2 |
| cuisine_token_has_no_measured_demand_special_mami | 2 |
| cuisine_token_has_no_measured_demand_silogan | 2 |
| cuisine_token_has_no_measured_demand_kimchi_rice | 2 |
| cuisine_token_has_no_measured_demand_pancakes_burger | 2 |
| cuisine_token_has_no_measured_demand_refresher | 2 |
| cuisine_token_has_no_measured_demand_street_foods | 2 |
| cuisine_token_has_no_measured_demand_milk_tea_shop | 2 |
| cuisine_token_has_no_measured_demand_samgy | 2 |
| cuisine_token_has_no_measured_demand_squidball | 2 |
| cuisine_token_has_no_measured_demand_mami | 2 |
| cuisine_token_has_no_measured_demand_big_boneless_bangus | 2 |
| cuisine_token_has_no_measured_demand_donut:coffee_shop | 2 |
| cuisine_token_has_no_measured_demand_pansit_bato | 2 |
| cuisine_token_has_no_measured_demand_ilongo | 2 |
| cuisine_token_has_no_measured_demand_unlimited | 2 |
| cuisine_token_has_no_measured_demand_korean_unli_samgyupsal | 2 |
| cuisine_token_has_no_measured_demand_hopia | 2 |
| cuisine_token_has_no_measured_demand_ngohiong | 2 |
| cuisine_token_has_no_measured_demand_bakeshop | 2 |
| cuisine_token_has_no_measured_demand_pesto_rice | 2 |
| cuisine_token_has_no_measured_demand_pesto_pasta | 2 |
| cuisine_token_has_no_measured_demand_pinoy_food | 2 |
| cuisine_token_has_no_measured_demand_jamaica | 2 |
| cuisine_token_has_no_measured_demand_silog_meal | 2 |
| cuisine_token_has_no_measured_demand_banana_bread | 2 |
| cuisine_token_has_no_measured_demand_pasta_sauce | 2 |
| cuisine_token_has_no_measured_demand_salad_sauce | 2 |
| cuisine_token_has_no_measured_demand_friedchicken | 2 |
| cuisine_token_has_no_measured_demand_capampangan | 2 |
| cuisine_token_has_no_measured_demand_pancit_molo | 2 |
| cuisine_token_has_no_measured_demand_pater | 2 |
| cuisine_token_has_no_measured_demand_maranao | 2 |
| cuisine_token_has_no_measured_demand_leechon | 2 |
| cuisine_token_has_no_measured_demand_school_supplies | 2 |
| cuisine_token_has_no_measured_demand_avocado_shake | 2 |
| cuisine_token_has_no_measured_demand_fruit_shakes | 2 |
| cuisine_token_has_no_measured_demand_graham_shakes | 2 |
| cuisine_token_has_no_measured_demand_potato_chips | 2 |
| cuisine_token_has_no_measured_demand_brewed_coffee | 2 |
| cuisine_token_has_no_measured_demand_ube_creme_brulee | 2 |
| cuisine_token_has_no_measured_demand_mango_cake | 2 |
| cuisine_token_has_no_measured_demand_#nookbuns | 2 |
| cuisine_token_has_no_measured_demand_#nookbites | 2 |
| cuisine_token_has_no_measured_demand_biscotti | 2 |
| cuisine_token_has_no_measured_demand_banana_loaf | 2 |
| cuisine_token_has_no_measured_demand_cup_cakes | 2 |
| cuisine_token_has_no_measured_demand_milktea_shop | 2 |
| cuisine_token_has_no_measured_demand_everything | 2 |
| cuisine_token_has_no_measured_demand_korean_chicken | 2 |
| cuisine_token_has_no_measured_demand_tea_and_juice | 2 |
| cuisine_token_has_no_measured_demand_vietnamese_chicken | 2 |
| cuisine_token_has_no_measured_demand_the_best_food | 2 |
| cuisine_token_has_no_measured_demand_viral_food_#2025 | 2 |
| cuisine_token_has_no_measured_demand_trending_food | 2 |
| cuisine_token_has_no_measured_demand_antonius_macchiato | 2 |
| cuisine_token_has_no_measured_demand__tocino | 2 |
| cuisine_token_has_no_measured_demand__longganisa | 2 |
| cuisine_token_has_no_measured_demand_chaolong | 2 |
| cuisine_token_has_no_measured_demand_french_bread | 2 |
| cuisine_token_has_no_measured_demand_silken_tofu | 2 |
| cuisine_token_has_no_measured_demand_bibingka | 2 |
| cuisine_token_has_no_measured_demand_pancit_cabagan | 2 |
| cuisine_token_has_no_measured_demand_tocino | 2 |
| cuisine_token_has_no_measured_demand_longganisa | 2 |
| cuisine_token_has_no_measured_demand__lomi | 2 |
| cuisine_token_has_no_measured_demand__arrozcaldo | 2 |
| cuisine_token_has_no_measured_demand_cordillera | 2 |
| cuisine_token_has_no_measured_demand_bulalohan | 2 |
| cuisine_token_has_no_measured_demand_buko_pie | 2 |
| cuisine_token_has_no_measured_demand_buko_juice | 2 |
| cuisine_token_has_no_measured_demand_ube_pie | 2 |
| cuisine_token_has_no_measured_demand_chocolate_pinipig | 2 |
| cuisine_token_has_no_measured_demand_dinuguan | 2 |
| cuisine_token_has_no_measured_demand_chicken_pastil | 2 |
| cuisine_token_has_no_measured_demand_food_delivery | 2 |
| cuisine_token_has_no_measured_demand_dount | 2 |
| cuisine_token_has_no_measured_demand_flavored_fries | 2 |
| cuisine_token_has_no_measured_demand_chicken_poppers | 2 |
| cuisine_token_has_no_measured_demand_ilocos | 2 |
| cuisine_token_has_no_measured_demand_filipino_fusion | 2 |
| cuisine_token_has_no_measured_demand_filipino-japanese_fusion | 2 |
| cuisine_token_has_no_measured_demand_lechon_liempo | 2 |
| cuisine_token_has_no_measured_demand_lechon_manok | 2 |
| cuisine_token_has_no_measured_demand_polsko-włoska | 2 |
| cuisine_token_has_no_measured_demand_koeran | 2 |
| cuisine_token_has_no_measured_demand__fast-food | 2 |
| cuisine_token_has_no_measured_demand__pstrąg | 2 |
| cuisine_token_has_no_measured_demand_tribute | 2 |
| cuisine_token_has_no_measured_demand_knysze | 2 |
| cuisine_token_has_no_measured_demand__okolicznościowa | 2 |
| cuisine_token_has_no_measured_demand_cheap | 2 |
| cuisine_token_has_no_measured_demand_bagiety | 2 |
| cuisine_token_has_no_measured_demand_lodziarnia | 2 |
| cuisine_token_has_no_measured_demand_śródziemnomorska | 2 |
| cuisine_token_has_no_measured_demand_obiad | 2 |
| cuisine_token_has_no_measured_demand_hunguarian | 2 |
| cuisine_token_has_no_measured_demand_szwedzka | 2 |
| cuisine_token_has_no_measured_demand_kuchnia_amerykańska | 2 |
| cuisine_token_has_no_measured_demand_kuchnia_europejska | 2 |
| cuisine_token_has_no_measured_demand__kuchnia_polska | 2 |
| cuisine_token_has_no_measured_demand_regionalne | 2 |
| cuisine_token_has_no_measured_demand_wegetariańska_i_wegańska | 2 |
| cuisine_token_has_no_measured_demand_placek_po_węgiersku | 2 |
| cuisine_token_has_no_measured_demand_spanish_tapas_bar | 2 |
| cuisine_token_has_no_measured_demand_milk_bar | 2 |
| cuisine_token_has_no_measured_demand__salat | 2 |
| cuisine_token_has_no_measured_demand_rolled_ice_cream | 2 |
| cuisine_token_has_no_measured_demand_obiady_domowe | 2 |
| cuisine_token_has_no_measured_demand__sweets | 2 |
| cuisine_token_has_no_measured_demand__chocolate | 2 |
| cuisine_token_has_no_measured_demand_roślinna | 2 |
| cuisine_token_has_no_measured_demand__italian_food | 2 |
| cuisine_token_has_no_measured_demand_czeska | 2 |
| cuisine_token_has_no_measured_demand_litewska | 2 |
| cuisine_token_has_no_measured_demand_midterrean | 2 |
| cuisine_token_has_no_measured_demand_herbaty | 2 |
| cuisine_token_has_no_measured_demand_kawy | 2 |
| cuisine_token_has_no_measured_demand_zdrowe_jedzenie | 2 |
| cuisine_token_has_no_measured_demand_kaszubskie | 2 |
| cuisine_token_has_no_measured_demand_chimney_cake | 2 |
| cuisine_token_has_no_measured_demand_home | 2 |
| cuisine_token_has_no_measured_demand_azeri | 2 |
| cuisine_token_has_no_measured_demand_gastronomy | 2 |
| cuisine_token_has_no_measured_demand_italian_food | 2 |
| cuisine_token_has_no_measured_demand_coctail_bar | 2 |
| cuisine_token_has_no_measured_demand_frytki_belgijskie | 2 |
| cuisine_token_has_no_measured_demand_frytki+sos_serowy+boczek | 2 |
| cuisine_token_has_no_measured_demand_frytki+gulasz | 2 |
| cuisine_token_has_no_measured_demand_ziemniak_na_patyku | 2 |
| cuisine_token_has_no_measured_demand_mexcian | 2 |
| cuisine_token_has_no_measured_demand_kuchnia_włoska | 2 |
| cuisine_token_has_no_measured_demand_śniadania | 2 |
| cuisine_token_has_no_measured_demand_tajska | 2 |
| cuisine_token_has_no_measured_demand_regionalna | 2 |
| cuisine_token_has_no_measured_demand_tor | 2 |
| cuisine_token_has_no_measured_demand_baguett | 2 |
| cuisine_token_has_no_measured_demand_turkmenistani | 2 |
| cuisine_token_has_no_measured_demand_chechen | 2 |
| cuisine_token_has_no_measured_demand_śląska | 2 |
| cuisine_token_has_no_measured_demand_czekolada_do_picia | 2 |
| cuisine_token_has_no_measured_demand_belarussian | 2 |
| cuisine_token_has_no_measured_demand_nowopolska | 2 |
| cuisine_token_has_no_measured_demand_shashlik | 2 |
| cuisine_token_has_no_measured_demand_wschodnia | 2 |
| cuisine_token_has_no_measured_demand_wino | 2 |
| cuisine_token_has_no_measured_demand_ciasta | 2 |
| cuisine_token_has_no_measured_demand_pieczywo | 2 |
| cuisine_token_has_no_measured_demand_nepalska | 2 |
| cuisine_token_has_no_measured_demand_dim_sun | 2 |
| cuisine_token_has_no_measured_demand_jedzenie | 2 |
| cuisine_token_has_no_measured_demand_wynajem_sali | 2 |
| cuisine_token_has_no_measured_demand_imprezy | 2 |
| cuisine_token_has_no_measured_demand_garmaż | 2 |
| cuisine_token_has_no_measured_demand_wine_shop | 2 |
| cuisine_token_has_no_measured_demand_drinki | 2 |
| cuisine_token_has_no_measured_demand_torty | 2 |
| cuisine_token_has_no_measured_demand_kolumbijska | 2 |
| cuisine_token_has_no_measured_demand_posiłki_domowe | 2 |
| cuisine_token_has_no_measured_demand_węgierska | 2 |
| cuisine_token_has_no_measured_demand_białoruska | 2 |
| cuisine_token_has_no_measured_demand_eur | 2 |
| cuisine_token_has_no_measured_demand_precle | 2 |
| cuisine_token_has_no_measured_demand_szaszłyki | 2 |
| cuisine_token_has_no_measured_demand__tapas | 2 |
| cuisine_token_has_no_measured_demand_goosebarnacles | 2 |
| cuisine_token_has_no_measured_demand_frango_frito | 2 |
| cuisine_token_has_no_measured_demand_envoltórios | 2 |
| cuisine_token_has_no_measured_demand_iniciantes | 2 |
| cuisine_token_has_no_measured_demand_tem_serviço_de_mesa | 2 |
| cuisine_token_has_no_measured_demand_francesinhas | 2 |
| cuisine_token_has_no_measured_demand_omeletes | 2 |
| cuisine_token_has_no_measured_demand_prato_do_dia | 2 |
| cuisine_token_has_no_measured_demand__padaria_e_cervejaria | 2 |
| cuisine_token_has_no_measured_demand_gelados | 2 |
| cuisine_token_has_no_measured_demand_contemporâneo | 2 |
| cuisine_token_has_no_measured_demand_leitão | 2 |
| cuisine_token_has_no_measured_demand_fracesinha | 2 |
| cuisine_token_has_no_measured_demand_pastelaria-_padaria | 2 |
| cuisine_token_has_no_measured_demand_custard_tarts | 2 |
| cuisine_token_has_no_measured_demand_fresh_bread | 2 |
| cuisine_token_has_no_measured_demand__caracois_e_entremeadas | 2 |
| cuisine_token_has_no_measured_demand_cafe_-_snack-bar | 2 |
| cuisine_token_has_no_measured_demand_cabo_verdean | 2 |
| cuisine_token_has_no_measured_demand_diversas | 2 |
| cuisine_token_has_no_measured_demand_snack-bar | 2 |
| cuisine_token_has_no_measured_demand_regional_da_zona | 2 |
| cuisine_token_has_no_measured_demand__leitão | 2 |
| cuisine_token_has_no_measured_demand_geral | 2 |
| cuisine_token_has_no_measured_demand_moçambicana | 2 |
| cuisine_token_has_no_measured_demand_espetada | 2 |
| cuisine_token_has_no_measured_demand_wine_&_kitchen | 2 |
| cuisine_token_has_no_measured_demand_café_e_pastelaria | 2 |
| cuisine_token_has_no_measured_demand_inglesa | 2 |
| cuisine_token_has_no_measured_demand_roasted_suckling_pig | 2 |
| cuisine_token_has_no_measured_demand_pão_doce | 2 |
| cuisine_token_has_no_measured_demand_tasco | 2 |
| cuisine_token_has_no_measured_demand_prego | 2 |
| cuisine_token_has_no_measured_demand_ponte_velha | 2 |
| cuisine_token_has_no_measured_demand_bolinhos_de_bacalhau | 2 |
| cuisine_token_has_no_measured_demand_rissóis | 2 |
| cuisine_token_has_no_measured_demand_folhados | 2 |
| cuisine_token_has_no_measured_demand_fis | 2 |
| cuisine_token_has_no_measured_demand_migas | 2 |
| cuisine_token_has_no_measured_demand_bavarian_and_regional | 2 |
| cuisine_token_has_no_measured_demand_peixe_grelhado | 2 |
| cuisine_token_has_no_measured_demand_mariscos_diversos | 2 |
| cuisine_token_has_no_measured_demand_guts | 2 |
| cuisine_token_has_no_measured_demand_pregos | 2 |
| cuisine_token_has_no_measured_demand_comida_saudável | 2 |
| cuisine_token_has_no_measured_demand_sical | 2 |
| cuisine_token_has_no_measured_demand_privado | 2 |
| cuisine_token_has_no_measured_demand_tostaria | 2 |
| cuisine_token_has_no_measured_demand_café/bar | 2 |
| cuisine_token_has_no_measured_demand_nepalesa | 2 |
| cuisine_token_has_no_measured_demand_contemporaneo | 2 |
| cuisine_token_has_no_measured_demand_pão_quente | 2 |
| cuisine_token_has_no_measured_demand_saudavel | 2 |
| cuisine_token_has_no_measured_demand_cachorros | 2 |
| cuisine_token_has_no_measured_demand_gourm | 2 |
| cuisine_token_has_no_measured_demand_serve_refeições | 2 |
| cuisine_token_has_no_measured_demand_sweedish | 2 |
| cuisine_token_has_no_measured_demand_eat_at_a_local's | 2 |
| cuisine_token_has_no_measured_demand_contemporânea | 2 |
| cuisine_token_has_no_measured_demand_roast_pork | 2 |
| cuisine_token_has_no_measured_demand_codfish | 2 |
| cuisine_token_has_no_measured_demand_grelhados_no_carvão | 2 |
| cuisine_token_has_no_measured_demand_panquecas | 2 |
| cuisine_token_has_no_measured_demand_waffles_belgas | 2 |
| cuisine_token_has_no_measured_demand_pratos | 2 |
| cuisine_token_has_no_measured_demand_mini_panquecas | 2 |
| cuisine_token_has_no_measured_demand_fish_and_c | 2 |
| cuisine_token_has_no_measured_demand_chorizo_bread | 2 |
| cuisine_token_has_no_measured_demand_europeia | 2 |
| cuisine_token_has_no_measured_demand_caracóis | 2 |
| cuisine_token_has_no_measured_demand_comida_nepalesa | 2 |
| cuisine_token_has_no_measured_demand_carne_argentina | 2 |
| cuisine_token_has_no_measured_demand_cerveijaria | 2 |
| cuisine_token_has_no_measured_demand_poke_bowls | 2 |
| cuisine_token_has_no_measured_demand_barbacue | 2 |
| cuisine_token_has_no_measured_demand_tosta | 2 |
| cuisine_token_has_no_measured_demand_pacifico_mexicano | 2 |
| cuisine_token_has_no_measured_demand_pastel_brasileiro | 2 |
| cuisine_token_has_no_measured_demand_tradicional_portuguesa | 2 |
| cuisine_token_has_no_measured_demand_tem_pratos_do_dia | 2 |
| cuisine_token_has_no_measured_demand_suaudável | 2 |
| cuisine_token_has_no_measured_demand_angola | 2 |
| cuisine_token_has_no_measured_demand_cosmopolita | 2 |
| cuisine_token_has_no_measured_demand_cod | 2 |
| cuisine_token_has_no_measured_demand_bolo_do_caco | 2 |
| cuisine_token_has_no_measured_demand_smårätter | 2 |
| cuisine_token_has_no_measured_demand_mellanstora_rätter | 2 |
| cuisine_token_has_no_measured_demand_pan-american | 2 |
| cuisine_token_has_no_measured_demand_persisk_mat | 2 |
| cuisine_token_has_no_measured_demand_indian_dishes | 2 |
| cuisine_token_has_no_measured_demand_herring | 2 |
| cuisine_token_has_no_measured_demand__ala_carte | 2 |
| cuisine_token_has_no_measured_demand_peruvan | 2 |
| cuisine_token_has_no_measured_demand_säsongsbaserat | 2 |
| cuisine_token_has_no_measured_demand_sushi:bowls:noodle | 2 |
| cuisine_token_has_no_measured_demand_kurdisk | 2 |
| cuisine_token_has_no_measured_demand_veg | 2 |
| cuisine_token_has_no_measured_demand_pitaburgare | 2 |
| cuisine_token_has_no_measured_demand_vietnamese_wok | 2 |
| cuisine_token_has_no_measured_demand_soppa | 2 |
| cuisine_token_has_no_measured_demand_bageri | 2 |
| cuisine_token_has_no_measured_demand_fishnchips | 2 |
| cuisine_token_has_no_measured_demand_wok:chinese | 2 |
| cuisine_token_has_no_measured_demand_hembakat | 2 |
| cuisine_token_has_no_measured_demand_rendeer_elk_fish | 2 |
| cuisine_token_has_no_measured_demand_komex | 2 |
| cuisine_token_has_no_measured_demand_buffé | 2 |
| cuisine_token_has_no_measured_demand_suishi | 2 |
| cuisine_token_has_no_measured_demand_skagenröra | 2 |
| cuisine_token_has_no_measured_demand_burrata | 2 |
| cuisine_token_has_no_measured_demand_inkokt_päron | 2 |
| cuisine_token_has_no_measured_demand_ostbricka | 2 |
| cuisine_token_has_no_measured_demand_råbiff | 2 |
| cuisine_token_has_no_measured_demand_köttbullar | 2 |
| cuisine_token_has_no_measured_demand_ölglass | 2 |
| cuisine_token_has_no_measured_demand_raggmu | 2 |
| cuisine_token_has_no_measured_demand_avsmakningsmeny | 2 |
| cuisine_token_has_no_measured_demand_våfflor | 2 |
| cuisine_token_has_no_measured_demand_kakor | 2 |
| cuisine_token_has_no_measured_demand_sydindisk | 2 |
| cuisine_token_has_no_measured_demand_bajs | 2 |
| cuisine_token_has_no_measured_demand_acaibowls | 2 |
| cuisine_token_has_no_measured_demand_pirog | 2 |
| cuisine_token_has_no_measured_demand_south_in | 2 |
| cuisine_token_has_no_measured_demand_arab:manakish | 2 |
| cuisine_token_has_no_measured_demand_manaish | 2 |
| cuisine_token_has_no_measured_demand_dagens_rätt | 2 |
| cuisine_token_has_no_measured_demand_ekologisk | 2 |
| cuisine_token_has_no_measured_demand_burger:pizza | 2 |
| cuisine_token_has_no_measured_demand_georgisk | 2 |
| cuisine_token_has_no_measured_demand_light | 2 |
| cuisine_token_has_no_measured_demand_napolitan_pizza | 2 |
| cuisine_token_has_no_measured_demand_plankstek | 2 |
| cuisine_token_has_no_measured_demand_italiensk | 2 |
| cuisine_token_has_no_measured_demand_sallader | 2 |
| cuisine_token_has_no_measured_demand_kött | 2 |
| cuisine_token_has_no_measured_demand_fisk | 2 |
| cuisine_token_has_no_measured_demand_spanskt | 2 |
| cuisine_token_has_no_measured_demand_italienskt | 2 |
| cuisine_token_has_no_measured_demand_turkiskt | 2 |
| cuisine_token_has_no_measured_demand_kroppkakor | 2 |
| cuisine_token_has_no_measured_demand_fair_trade | 2 |
| cuisine_token_has_no_measured_demand_fruktsallad | 2 |
| cuisine_token_has_no_measured_demand_nutella | 2 |
| cuisine_token_has_no_measured_demand_bröd | 2 |
| cuisine_token_has_no_measured_demand_italiensinspirerat | 2 |
| cuisine_token_has_no_measured_demand_bakad_potatis | 2 |
| cuisine_token_has_no_measured_demand_surdegspizza | 2 |
| cuisine_token_has_no_measured_demand_surdegsbullar | 2 |
| cuisine_token_has_no_measured_demand_västafrikansk | 2 |
| cuisine_token_has_no_measured_demand_medelhavsmat | 2 |
| cuisine_token_has_no_measured_demand_svensk_husmanskost | 2 |
| cuisine_token_has_no_measured_demand_kyckling | 2 |
| cuisine_token_has_no_measured_demand_gatukök | 2 |
| cuisine_token_has_no_measured_demand_medeterranian | 2 |
| cuisine_token_has_no_measured_demand_cafferia | 2 |
| cuisine_token_has_no_measured_demand_artgallery | 2 |
| cuisine_token_has_no_measured_demand_surkål | 2 |
| cuisine_token_has_no_measured_demand_oktoberfest | 2 |
| cuisine_token_has_no_measured_demand_pokébowl | 2 |
| cuisine_token_has_no_measured_demand_smash_burgers | 2 |
| cuisine_token_has_no_measured_demand_poké_bowl | 2 |
| cuisine_token_has_no_measured_demand_western/italian | 2 |
| cuisine_token_has_no_measured_demand_curry_puffs | 2 |
| cuisine_token_has_no_measured_demand_cajun_food | 2 |
| cuisine_token_has_no_measured_demand_international_buffet | 2 |
| cuisine_token_has_no_measured_demand_meditteranean | 2 |
| cuisine_token_has_no_measured_demand_muslim_food | 2 |
| cuisine_token_has_no_measured_demand_local_asian | 2 |
| cuisine_token_has_no_measured_demand_tanjong_rhu_pau | 2 |
| cuisine_token_has_no_measured_demand_local_delights | 2 |
| cuisine_token_has_no_measured_demand_hokkien_mee | 2 |
| cuisine_token_has_no_measured_demand_prawn_noodle | 2 |
| cuisine_token_has_no_measured_demand_soymilk | 2 |
| cuisine_token_has_no_measured_demand_salted_egg_chicken | 2 |
| cuisine_token_has_no_measured_demand_thai_seafood | 2 |
| cuisine_token_has_no_measured_demand_teochew | 2 |
| cuisine_token_has_no_measured_demand_mala | 2 |
| cuisine_token_has_no_measured_demand_rosti | 2 |
| cuisine_token_has_no_measured_demand_café_maure | 2 |
| cuisine_token_has_no_measured_demand_pizza_italiana | 2 |
| cuisine_token_has_no_measured_demand_cafe_pizzaria | 2 |
| cuisine_token_has_no_measured_demand_steak_h | 2 |
| cuisine_token_has_no_measured_demand_boissons_gazeuses | 2 |
| cuisine_token_has_no_measured_demand_jwajem | 2 |
| cuisine_token_has_no_measured_demand_salon_de_the | 2 |
| cuisine_token_has_no_measured_demand_tunisian_dishes | 2 |
| cuisine_token_has_no_measured_demand_mlewi | 2 |
| cuisine_token_has_no_measured_demand_beef_&_chicken | 2 |
| cuisine_token_has_no_measured_demand_cheesy_saucy_poutine | 2 |
| cuisine_token_has_no_measured_demand_bakery_and_pastry | 2 |
| cuisine_token_has_no_measured_demand_naturel_foods | 2 |
| cuisine_token_has_no_measured_demand__simit | 2 |
| cuisine_token_has_no_measured_demand__tost | 2 |
| cuisine_token_has_no_measured_demand_ızgara_tavuk | 2 |
| cuisine_token_has_no_measured_demand_ızgara_köfte | 2 |
| cuisine_token_has_no_measured_demand_çıtır_fetuccini | 2 |
| cuisine_token_has_no_measured_demand_european_&_turkish | 2 |
| cuisine_token_has_no_measured_demand_nargile | 2 |
| cuisine_token_has_no_measured_demand_italian_ | 2 |
| cuisine_token_has_no_measured_demand_chicken_doner | 2 |
| cuisine_token_has_no_measured_demand_specialty_coffee_shop | 2 |
| cuisine_token_has_no_measured_demand_steak_hou | 2 |
| cuisine_token_has_no_measured_demand_sulu_yemek | 2 |
| cuisine_token_has_no_measured_demand_beef_liver | 2 |
| cuisine_token_has_no_measured_demand_pideci | 2 |
| cuisine_token_has_no_measured_demand_rodos | 2 |
| cuisine_token_has_no_measured_demand_ciger | 2 |
| cuisine_token_has_no_measured_demand_sokak_lezzetleri | 2 |
| cuisine_token_has_no_measured_demand_ottoman | 2 |
| cuisine_token_has_no_measured_demand_patty | 2 |
| cuisine_token_has_no_measured_demand_restoran | 2 |
| cuisine_token_has_no_measured_demand_ana_öğü | 2 |
| cuisine_token_has_no_measured_demand_homecooking | 2 |
| cuisine_token_has_no_measured_demand_omlet | 2 |
| cuisine_token_has_no_measured_demand_aperatif_yiyecekler | 2 |
| cuisine_token_has_no_measured_demand_black_sea | 2 |
| cuisine_token_has_no_measured_demand_hatay | 2 |
| cuisine_token_has_no_measured_demand_hamurişi | 2 |
| cuisine_token_has_no_measured_demand_tirit | 2 |
| cuisine_token_has_no_measured_demand_kerebiç | 2 |
| cuisine_token_has_no_measured_demand_su_böreği | 2 |
| cuisine_token_has_no_measured_demand_arnavut_ciğeri | 2 |
| cuisine_token_has_no_measured_demand_panasian | 2 |
| cuisine_token_has_no_measured_demand_dese | 2 |
| cuisine_token_has_no_measured_demand_tavada_tavuk | 2 |
| cuisine_token_has_no_measured_demand_çıtır_tavuk_kovası | 2 |
| cuisine_token_has_no_measured_demand_soğuk_içecekler | 2 |
| cuisine_token_has_no_measured_demand_sıcak_içecekler | 2 |
| cuisine_token_has_no_measured_demand_aperatifler | 2 |
| cuisine_token_has_no_measured_demand_liver | 2 |
| cuisine_token_has_no_measured_demand_levrek | 2 |
| cuisine_token_has_no_measured_demand_seabass | 2 |
| cuisine_token_has_no_measured_demand_spagetti | 2 |
| cuisine_token_has_no_measured_demand_tatli | 2 |
| cuisine_token_has_no_measured_demand_tavuk_döner | 2 |
| cuisine_token_has_no_measured_demand_sosisli_sandviç | 2 |
| cuisine_token_has_no_measured_demand_kahve_dükkanı | 2 |
| cuisine_token_has_no_measured_demand_kunefe | 2 |
| cuisine_token_has_no_measured_demand_turkish_kebab | 2 |
| cuisine_token_has_no_measured_demand_karışık_tost | 2 |
| cuisine_token_has_no_measured_demand_kaşarlı_tost | 2 |
| cuisine_token_has_no_measured_demand_sanayi_tostu | 2 |
| cuisine_token_has_no_measured_demand_kaplamalı_ürünler | 2 |
| cuisine_token_has_no_measured_demand_raw_meatballs | 2 |
| cuisine_token_has_no_measured_demand_frenk | 2 |
| cuisine_token_has_no_measured_demand_sourdough_bread | 2 |
| cuisine_token_has_no_measured_demand_ıslakhamburger | 2 |
| cuisine_token_has_no_measured_demand_limonata | 2 |
| cuisine_token_has_no_measured_demand_ice_coffe | 2 |
| cuisine_token_has_no_measured_demand_yengen | 2 |
| cuisine_token_has_no_measured_demand_izmir_lokma | 2 |
| cuisine_token_has_no_measured_demand_iskender | 2 |
| cuisine_token_has_no_measured_demand_fırın | 2 |
| cuisine_token_has_no_measured_demand_sala | 2 |
| cuisine_token_has_no_measured_demand_serpme_kahvalti | 2 |
| cuisine_token_has_no_measured_demand_muhlama | 2 |
| cuisine_token_has_no_measured_demand_saç_kavurma | 2 |
| cuisine_token_has_no_measured_demand_pirzola | 2 |
| cuisine_token_has_no_measured_demand_kokorec | 2 |
| cuisine_token_has_no_measured_demand_alabalık | 2 |
| cuisine_token_has_no_measured_demand_türk_kahvesi | 2 |
| cuisine_token_has_no_measured_demand_türk_mutfağı | 2 |
| cuisine_token_has_no_measured_demand_meyhane | 2 |
| cuisine_token_has_no_measured_demand_karışık_pide | 2 |
| cuisine_token_has_no_measured_demand_bıçak_arası | 2 |
| cuisine_token_has_no_measured_demand_oralet | 2 |
| cuisine_token_has_no_measured_demand_etliekmek | 2 |
| cuisine_token_has_no_measured_demand_mevlana | 2 |
| cuisine_token_has_no_measured_demand_peynirli_börek | 2 |
| cuisine_token_has_no_measured_demand_yağ_somunu | 2 |
| cuisine_token_has_no_measured_demand_ramazan_pidesi | 2 |
| cuisine_token_has_no_measured_demand_ekmek_arası | 2 |
| cuisine_token_has_no_measured_demand_hamsi_tava | 2 |
| cuisine_token_has_no_measured_demand_i̇starvit | 2 |
| cuisine_token_has_no_measured_demand_kahvehane | 2 |
| cuisine_token_has_no_measured_demand_yayık_tereyağ | 2 |
| cuisine_token_has_no_measured_demand_lokma_tatlısi | 2 |
| cuisine_token_has_no_measured_demand_tulumba | 2 |
| cuisine_token_has_no_measured_demand_süzme_yoğurt | 2 |
| cuisine_token_has_no_measured_demand_aparatif | 2 |
| cuisine_token_has_no_measured_demand_mezeler | 2 |
| cuisine_token_has_no_measured_demand_alchol | 2 |
| cuisine_token_has_no_measured_demand_kır_pidesi | 2 |
| cuisine_token_has_no_measured_demand_sucuk | 2 |
| cuisine_token_has_no_measured_demand_kellepaça | 2 |
| cuisine_token_has_no_measured_demand_i̇şkembe | 2 |
| cuisine_token_has_no_measured_demand_sıkma | 2 |
| cuisine_token_has_no_measured_demand_açma | 2 |
| cuisine_token_has_no_measured_demand_unlu_mamü_çeşitleri | 2 |
| cuisine_token_has_no_measured_demand_alkol | 2 |
| cuisine_token_has_no_measured_demand_kasap | 2 |
| cuisine_token_has_no_measured_demand_kebabçı | 2 |
| cuisine_token_has_no_measured_demand_i̇çecek | 2 |
| cuisine_token_has_no_measured_demand_cips | 2 |
| cuisine_token_has_no_measured_demand_burdur_şiş | 2 |
| cuisine_token_has_no_measured_demand_kabak_tatlısı | 2 |
| cuisine_token_has_no_measured_demand_kadayıf | 2 |
| cuisine_token_has_no_measured_demand_kuşbaşılı_pide | 2 |
| cuisine_token_has_no_measured_demand_peynirli_pide | 2 |
| cuisine_token_has_no_measured_demand_kumda_kahve | 2 |
| cuisine_token_has_no_measured_demand_hatay_döner | 2 |
| cuisine_token_has_no_measured_demand_antakya_mezeleri | 2 |
| cuisine_token_has_no_measured_demand_i̇çli_köfte | 2 |
| cuisine_token_has_no_measured_demand_etli_kuru_dolmalar | 2 |
| cuisine_token_has_no_measured_demand_antakya_yöresel_tatlılar | 2 |
| cuisine_token_has_no_measured_demand_etli_yaprak_sarma | 2 |
| cuisine_token_has_no_measured_demand_nata | 2 |
| cuisine_token_has_no_measured_demand_tavuklu | 2 |
| cuisine_token_has_no_measured_demand_kafe | 2 |
| cuisine_token_has_no_measured_demand_catring | 2 |
| cuisine_token_has_no_measured_demand_i̇skender | 2 |
| cuisine_token_has_no_measured_demand_süt_ürünleri | 2 |
| cuisine_token_has_no_measured_demand_turkmen | 2 |
| cuisine_token_has_no_measured_demand_kutu_oyunu | 2 |
| cuisine_token_has_no_measured_demand__mediterranean | 2 |
| cuisine_token_has_no_measured_demand__european | 2 |
| cuisine_token_has_no_measured_demand__turkish | 2 |
| cuisine_token_has_no_measured_demand__barbecue | 2 |
| cuisine_token_has_no_measured_demand_pide_lahmacun | 2 |
| cuisine_token_has_no_measured_demand_serpme_kahvaltı | 2 |
| cuisine_token_has_no_measured_demand_tandır_ekmeği | 2 |
| cuisine_token_has_no_measured_demand_home_style_cooking | 2 |
| cuisine_token_has_no_measured_demand_koöfte | 2 |
| cuisine_token_has_no_measured_demand_mumbar | 2 |
| cuisine_token_has_no_measured_demand_kuzu_şiş | 2 |
| cuisine_token_has_no_measured_demand_küşleme | 2 |
| cuisine_token_has_no_measured_demand_dana_bonfile | 2 |
| cuisine_token_has_no_measured_demand_kuzu_lokum | 2 |
| cuisine_token_has_no_measured_demand_kaburga | 2 |
| cuisine_token_has_no_measured_demand_çöp_şiş | 2 |
| cuisine_token_has_no_measured_demand_lokum | 2 |
| cuisine_token_has_no_measured_demand_antrikot | 2 |
| cuisine_token_has_no_measured_demand_et_tantuni | 2 |
| cuisine_token_has_no_measured_demand_tavuk_tantuni | 2 |
| cuisine_token_has_no_measured_demand_ekmek_arası_köfte | 2 |
| cuisine_token_has_no_measured_demand_ekmek_arası_dana_sucuk | 2 |
| cuisine_token_has_no_measured_demand_çibörek | 2 |
| cuisine_token_has_no_measured_demand_i̇cliköfte | 2 |
| cuisine_token_has_no_measured_demand_rakı | 2 |
| cuisine_token_has_no_measured_demand_su_böreḡi | 2 |
| cuisine_token_has_no_measured_demand_beyran | 2 |
| cuisine_token_has_no_measured_demand_28/b | 2 |
| cuisine_token_has_no_measured_demand_kendin_pişir_kendin_ye | 2 |
| cuisine_token_has_no_measured_demand_tandır | 2 |
| cuisine_token_has_no_measured_demand_world_cuisine | 2 |
| cuisine_token_has_no_measured_demand_kebapçı | 2 |
| cuisine_token_has_no_measured_demand_somun_ekmek | 2 |
| cuisine_token_has_no_measured_demand_çiğ_börek | 2 |
| cuisine_token_has_no_measured_demand_dine | 2 |
| cuisine_token_has_no_measured_demand_mayan | 2 |
| cuisine_token_has_no_measured_demand_soda_mixers | 2 |
| cuisine_token_has_no_measured_demand_malts | 2 |
| cuisine_token_has_no_measured_demand_frozen_custard | 2 |
| cuisine_token_has_no_measured_demand_margaritas | 2 |
| cuisine_token_has_no_measured_demand_yemini | 2 |
| cuisine_token_has_no_measured_demand_deep_dish_pizza | 2 |
| cuisine_token_has_no_measured_demand_borsch | 2 |
| cuisine_token_has_no_measured_demand_local:regional | 2 |
| cuisine_token_has_no_measured_demand_jibaritos | 2 |
| cuisine_token_has_no_measured_demand_north-indian | 2 |
| cuisine_token_has_no_measured_demand_quick_bites | 2 |
| cuisine_token_has_no_measured_demand_cheesy_bread | 2 |
| cuisine_token_has_no_measured_demand_fast_casual | 2 |
| cuisine_token_has_no_measured_demand_indian_fusion | 2 |
| cuisine_token_has_no_measured_demand_curry_goat | 2 |
| cuisine_token_has_no_measured_demand_surf_&_turf | 2 |
| cuisine_token_has_no_measured_demand_indigenous | 2 |
| cuisine_token_has_no_measured_demand_protein_bar | 2 |
| cuisine_token_has_no_measured_demand_fish_boil | 2 |
| cuisine_token_has_no_measured_demand_bean_pie | 2 |
| cuisine_token_has_no_measured_demand_drive-through | 2 |
| cuisine_token_has_no_measured_demand_amish | 2 |
| cuisine_token_has_no_measured_demand_heal | 2 |
| cuisine_token_has_no_measured_demand_corporate_catering | 2 |
| cuisine_token_has_no_measured_demand_healthy_shakes | 2 |
| cuisine_token_has_no_measured_demand__teas_+_more | 2 |
| cuisine_token_has_no_measured_demand_boba_tea_shop_&_cat_cafe | 2 |
| cuisine_token_has_no_measured_demand_chicken_restaurant | 2 |
| cuisine_token_has_no_measured_demand_american_indian | 2 |
| cuisine_token_has_no_measured_demand_gyro_restaurant | 2 |
| cuisine_token_has_no_measured_demand_quality_espresso | 2 |
| cuisine_token_has_no_measured_demand_resident_dining | 2 |
| cuisine_token_has_no_measured_demand_take_'n'_bake | 2 |
| cuisine_token_has_no_measured_demand_soda_pop | 2 |
| cuisine_token_has_no_measured_demand_stir-fry | 2 |
| cuisine_token_has_no_measured_demand_honeybar | 2 |
| cuisine_token_has_no_measured_demand_acai_bowls | 2 |
| cuisine_token_has_no_measured_demand_stree | 2 |
| cuisine_token_has_no_measured_demand_sri-lankan | 2 |
| cuisine_token_has_no_measured_demand_swedish_candy | 2 |
| cuisine_token_has_no_measured_demand_appetizers | 2 |
| cuisine_token_has_no_measured_demand_frozen | 2 |
| cuisine_token_has_no_measured_demand_hawaiian_poke | 2 |
| cuisine_token_has_no_measured_demand_loire_valley | 2 |
| cuisine_token_has_no_measured_demand_zuppe | 2 |
| cuisine_token_has_no_measured_demand_garbage_plate | 2 |
| cuisine_token_has_no_measured_demand_white_table | 2 |
| cuisine_token_has_no_measured_demand_bow | 2 |
| cuisine_token_has_no_measured_demand_sandwicg | 2 |
| cuisine_token_has_no_measured_demand_malvani | 2 |
| cuisine_token_has_no_measured_demand_scrambled_eggs | 2 |
| cuisine_token_has_no_measured_demand_italian-american | 2 |
| cuisine_token_has_no_measured_demand_druze | 2 |
| cuisine_token_has_no_measured_demand_southern_cuisine | 2 |
| cuisine_token_has_no_measured_demand_nuevo_latino | 2 |
| cuisine_token_has_no_measured_demand_seafood_boil | 2 |
| cuisine_token_has_no_measured_demand_bengladeshi | 2 |
| cuisine_token_has_no_measured_demand_sesame_seed_chicken | 2 |
| cuisine_token_has_no_measured_demand_vapor_lounge | 2 |
| cuisine_token_has_no_measured_demand_asian-american | 2 |
| cuisine_token_has_no_measured_demand_al_pastor | 2 |
| cuisine_token_has_no_measured_demand_italian_ice | 2 |
| cuisine_token_has_no_measured_demand_bagel_sandwich | 2 |
| cuisine_token_has_no_measured_demand_chickenfried_rice | 2 |
| cuisine_token_has_no_measured_demand_health_focused | 2 |
| cuisine_token_has_no_measured_demand_cuchifrito | 2 |
| cuisine_token_has_no_measured_demand_hallah | 2 |
| cuisine_token_has_no_measured_demand_fried_egg_burger | 2 |
| cuisine_token_has_no_measured_demand_half_beef_chicken | 2 |
| cuisine_token_has_no_measured_demand_new_hampshire | 2 |
| cuisine_token_has_no_measured_demand_breakfadst | 2 |
| cuisine_token_has_no_measured_demand_bukhari | 2 |
| cuisine_token_has_no_measured_demand_chimaek | 2 |
| cuisine_token_has_no_measured_demand_energizing_teas | 2 |
| cuisine_token_has_no_measured_demand_fuzhou | 2 |
| cuisine_token_has_no_measured_demand_quesdillas | 2 |
| cuisine_token_has_no_measured_demand_cold_press | 2 |
| cuisine_token_has_no_measured_demand_caberet | 2 |
| cuisine_token_has_no_measured_demand_cheeseburger | 2 |
| cuisine_token_has_no_measured_demand_crumpets | 2 |
| cuisine_token_has_no_measured_demand_stromboli | 2 |
| cuisine_token_has_no_measured_demand_spiedie | 2 |
| cuisine_token_has_no_measured_demand_breakfast_&_lunch | 2 |
| cuisine_token_has_no_measured_demand_buddhist | 2 |
| cuisine_token_has_no_measured_demand_shochu | 2 |
| cuisine_token_has_no_measured_demand_breads | 2 |
| cuisine_token_has_no_measured_demand_muffins | 2 |
| cuisine_token_has_no_measured_demand_pierogies | 2 |
| cuisine_token_has_no_measured_demand_phillipine | 2 |
| cuisine_token_has_no_measured_demand_bar_and_comfort | 2 |
| cuisine_token_has_no_measured_demand_pasteries | 2 |
| cuisine_token_has_no_measured_demand_kimbap | 2 |
| cuisine_token_has_no_measured_demand_south_shore_bar_pizza | 2 |
| cuisine_token_has_no_measured_demand_north_shore_roast_beef | 2 |
| cuisine_token_has_no_measured_demand_knishes | 2 |
| cuisine_token_has_no_measured_demand_chicken_parm | 2 |
| cuisine_token_has_no_measured_demand_breakfest | 2 |
| cuisine_token_has_no_measured_demand_tobagonian | 2 |
| cuisine_token_has_no_measured_demand_northern_european | 2 |
| cuisine_token_has_no_measured_demand_playroom | 2 |
| cuisine_token_has_no_measured_demand_tacos_and_pupusas | 2 |
| cuisine_token_has_no_measured_demand_vlach | 2 |
| cuisine_token_has_no_measured_demand_cat_petting | 2 |
| cuisine_token_has_no_measured_demand_pastrino | 2 |
| cuisine_token_has_no_measured_demand_pizza_restaurant | 2 |
| cuisine_token_has_no_measured_demand_sweet_potato | 2 |
| cuisine_token_has_no_measured_demand_buffalo_chicken | 2 |
| cuisine_token_has_no_measured_demand_garlic_knots | 2 |
| cuisine_token_has_no_measured_demand_cuban_sandwich | 2 |
| cuisine_token_has_no_measured_demand_dominican_fusion | 2 |
| cuisine_token_has_no_measured_demand_pupuseria | 2 |
| cuisine_token_has_no_measured_demand_taquero | 2 |
| cuisine_token_has_no_measured_demand_tortilla_chips | 2 |
| cuisine_token_has_no_measured_demand_dining_restaurant | 2 |
| cuisine_token_has_no_measured_demand_ececltic | 2 |
| cuisine_token_has_no_measured_demand_fried_chicken_takeaway | 2 |
| cuisine_token_has_no_measured_demand_crawfish_sandwiches | 2 |
| cuisine_token_has_no_measured_demand_handmade_pizza | 2 |
| cuisine_token_has_no_measured_demand_house-baked_pastries | 2 |
| cuisine_token_has_no_measured_demand_specialty_drinks | 2 |
| cuisine_token_has_no_measured_demand_oatmeal | 2 |
| cuisine_token_has_no_measured_demand_wraps_and_bowels | 2 |
| cuisine_token_has_no_measured_demand_banana_pudding | 2 |
| cuisine_token_has_no_measured_demand_burger_restaurant | 2 |
| cuisine_token_has_no_measured_demand_vegan_only | 2 |
| cuisine_token_has_no_measured_demand_indo_tex_mex | 2 |
| cuisine_token_has_no_measured_demand_eclair | 2 |
| cuisine_token_has_no_measured_demand_argentinian_bistro | 2 |
| cuisine_token_has_no_measured_demand_fitmeals | 2 |
| cuisine_token_has_no_measured_demand_columbia | 2 |
| cuisine_token_has_no_measured_demand_fajita | 2 |
| cuisine_token_has_no_measured_demand_sno-ball | 2 |
| cuisine_token_has_no_measured_demand_seafood_steak_house | 2 |
| cuisine_token_has_no_measured_demand_pulled_pork | 2 |
| cuisine_token_has_no_measured_demand_po_boy | 2 |
| cuisine_token_has_no_measured_demand_hot_chicken | 2 |
| cuisine_token_has_no_measured_demand_shakes_and_smoothies | 2 |
| cuisine_token_has_no_measured_demand_southern_comfort | 2 |
| cuisine_token_has_no_measured_demand_uzbekistan | 2 |
| cuisine_token_has_no_measured_demand_snowballs | 2 |
| cuisine_token_has_no_measured_demand_chicken_fingers | 2 |
| cuisine_token_has_no_measured_demand_hibachi_grill | 2 |
| cuisine_token_has_no_measured_demand_parrilladas | 2 |
| cuisine_token_has_no_measured_demand_fındık | 2 |
| cuisine_token_has_no_measured_demand_open-fire | 2 |
| cuisine_token_has_no_measured_demand_kratom | 2 |
| cuisine_token_has_no_measured_demand_daiquiri | 2 |
| cuisine_token_has_no_measured_demand_french-indonesian | 2 |
| cuisine_token_has_no_measured_demand_marathi | 2 |
| cuisine_token_has_no_measured_demand_maharashtrian | 2 |
| cuisine_token_has_no_measured_demand_thali | 2 |
| cuisine_token_has_no_measured_demand_dried_fruit | 2 |
| cuisine_token_has_no_measured_demand_guacamole | 2 |
| cuisine_token_has_no_measured_demand_grain_bowl | 2 |
| cuisine_token_has_no_measured_demand_farmbowl | 2 |
| cuisine_token_has_no_measured_demand_lobster_roll | 2 |
| cuisine_token_has_no_measured_demand_lake_trout | 2 |
| cuisine_token_has_no_measured_demand_casual_food | 2 |
| cuisine_token_has_no_measured_demand_beignets | 2 |
| cuisine_token_has_no_measured_demand_fitness | 2 |
| cuisine_token_has_no_measured_demand_supplement | 2 |
| cuisine_token_has_no_measured_demand_laoatian | 2 |
| cuisine_token_has_no_measured_demand_paletas | 2 |
| cuisine_token_has_no_measured_demand_snoballs | 2 |
| cuisine_token_has_no_measured_demand_dirty_soda | 2 |
| cuisine_token_has_no_measured_demand_fruit_bowl | 2 |
| cuisine_token_has_no_measured_demand_nepali_cuisine | 2 |
| cuisine_token_has_no_measured_demand_pork_sandwich | 2 |
| cuisine_token_has_no_measured_demand_cheesy_bean_dip | 2 |
| cuisine_token_has_no_measured_demand_chicken_fried_steak | 2 |
| cuisine_token_has_no_measured_demand_plantains | 2 |
| cuisine_token_has_no_measured_demand_mimosa | 2 |
| cuisine_token_has_no_measured_demand_po-boys | 2 |
| cuisine_token_has_no_measured_demand_asian_snacks | 2 |
| cuisine_token_has_no_measured_demand_cajun_creole | 2 |
| cuisine_token_has_no_measured_demand_latin_food | 2 |
| cuisine_token_has_no_measured_demand_tacqueria | 2 |
| cuisine_token_has_no_measured_demand_cold_cut | 2 |
| cuisine_token_has_no_measured_demand_peanuts | 2 |
| cuisine_token_has_no_measured_demand_guatemalen | 2 |
| cuisine_token_has_no_measured_demand_texas | 2 |
| cuisine_token_has_no_measured_demand_deli_sandwich | 2 |
| cuisine_token_has_no_measured_demand_mexican_dishes | 2 |
| cuisine_token_has_no_measured_demand_homemade_ice_cream | 2 |
| cuisine_token_has_no_measured_demand_country | 2 |
| cuisine_token_has_no_measured_demand_korean_corn_dogs | 2 |
| cuisine_token_has_no_measured_demand_mochi_donuts | 2 |
| cuisine_token_has_no_measured_demand_argentinian_food | 2 |
| cuisine_token_has_no_measured_demand_cocktail_menu | 2 |
| cuisine_token_has_no_measured_demand_wines_and_champagnes | 2 |
| cuisine_token_has_no_measured_demand_vietnamese_restaurant | 2 |
| cuisine_token_has_no_measured_demand_ethiopan | 2 |
| cuisine_token_has_no_measured_demand_colombia | 2 |
| cuisine_token_has_no_measured_demand_handcrafted_soda | 2 |
| cuisine_token_has_no_measured_demand_lousiana | 2 |
| cuisine_token_has_no_measured_demand_asian_restaurant | 2 |
| cuisine_token_has_no_measured_demand_disert | 2 |
| cuisine_token_has_no_measured_demand_hondarian | 2 |
| cuisine_token_has_no_measured_demand_cassava_cheese_bread | 2 |
| cuisine_token_has_no_measured_demand_cuban_cocine | 2 |
| cuisine_token_has_no_measured_demand_levant | 2 |
| cuisine_token_has_no_measured_demand__comida_mexicana | 2 |
| cuisine_token_has_no_measured_demand__restaurant_inside_store | 2 |
| cuisine_token_has_no_measured_demand__helotes | 2 |
| cuisine_token_has_no_measured_demand__elotes | 2 |
| cuisine_token_has_no_measured_demand__corn_in_a_cup | 2 |
| cuisine_token_has_no_measured_demand__corn_in_a_cob | 2 |
| cuisine_token_has_no_measured_demand__tamales_de_helote | 2 |
| cuisine_token_has_no_measured_demand_beer_and_wine | 2 |
| cuisine_token_has_no_measured_demand_roadhouse | 2 |
| cuisine_token_has_no_measured_demand_nashville_hot_chicken | 2 |
| cuisine_token_has_no_measured_demand_papusa | 2 |
| cuisine_token_has_no_measured_demand_maiz | 2 |
| cuisine_token_has_no_measured_demand_rice_burger | 2 |
| cuisine_token_has_no_measured_demand_gree | 2 |
| cuisine_token_has_no_measured_demand_lounge_bar | 2 |
| cuisine_token_has_no_measured_demand_mughlai | 2 |
| cuisine_token_has_no_measured_demand_detroit_style_pizza | 2 |
| cuisine_token_has_no_measured_demand_limonade | 2 |
| cuisine_token_has_no_measured_demand_vietnamese_and_thai | 2 |
| cuisine_token_has_no_measured_demand_stirfry | 2 |
| cuisine_token_has_no_measured_demand_dim-sum | 2 |
| cuisine_token_has_no_measured_demand_israel | 2 |
| cuisine_token_has_no_measured_demand_cobbler | 2 |
| cuisine_token_has_no_measured_demand_karaoke | 2 |
| cuisine_token_has_no_measured_demand_mini_cannolis | 2 |
| cuisine_token_has_no_measured_demand_ranch | 2 |
| cuisine_token_has_no_measured_demand_garlic_herb | 2 |
| cuisine_token_has_no_measured_demand_marinara | 2 |
| cuisine_token_has_no_measured_demand_matcha_shop | 2 |
| cuisine_token_has_no_measured_demand_middle_easte | 2 |
| cuisine_token_has_no_measured_demand_mediter | 2 |
| cuisine_token_has_no_measured_demand_uighur | 2 |
| cuisine_token_has_no_measured_demand_chaat | 2 |
| cuisine_token_has_no_measured_demand_vada_pav | 2 |
| cuisine_token_has_no_measured_demand_indo_chinese | 2 |
| cuisine_token_has_no_measured_demand_cat | 2 |
| cuisine_token_has_no_measured_demand_moussaka | 2 |
| cuisine_token_has_no_measured_demand_sushi_restaurant | 2 |
| cuisine_token_has_no_measured_demand_chicken_and_waffles | 2 |
| cuisine_token_has_no_measured_demand_chettinad | 2 |
| cuisine_token_has_no_measured_demand_indo-american | 2 |
| cuisine_token_has_no_measured_demand_scot | 2 |
| cuisine_token_has_no_measured_demand_crumpet | 2 |
| cuisine_token_has_no_measured_demand_south_east_asian | 2 |
| cuisine_token_has_no_measured_demand_japanesefood | 2 |
| cuisine_token_has_no_measured_demand_partyrestaurant | 2 |
| cuisine_token_has_no_measured_demand_grillrestaurant | 2 |
| cuisine_token_has_no_measured_demand_sushirestaurant | 2 |
| cuisine_token_has_no_measured_demand_sushi_and_grill | 2 |
| cuisine_token_has_no_measured_demand_bengalurean | 2 |
| cuisine_token_has_no_measured_demand_bangalorean | 2 |
| cuisine_token_has_no_measured_demand_dehlvi | 2 |
| cuisine_token_has_no_measured_demand_new_delhi | 2 |
| cuisine_token_has_no_measured_demand_karnataka | 2 |
| cuisine_token_has_no_measured_demand_teriaki | 2 |
| cuisine_token_has_no_measured_demand_jewish_deli | 2 |
| cuisine_token_has_no_measured_demand_broken_rice | 2 |
| cuisine_token_has_no_measured_demand_raw_bar | 2 |
| cuisine_token_has_no_measured_demand_chirashi_sushi | 2 |
| cuisine_token_has_no_measured_demand_northern_iranian | 2 |
| cuisine_token_has_no_measured_demand_bún_mắm | 2 |
| cuisine_token_has_no_measured_demand_hủ_tiếu_nam_vang | 2 |
| cuisine_token_has_no_measured_demand_nepaless | 2 |
| cuisine_token_has_no_measured_demand_hyderabad | 2 |
| cuisine_token_has_no_measured_demand_yucatanense | 2 |
| cuisine_token_has_no_measured_demand_banchan | 2 |
| cuisine_token_has_no_measured_demand_noodle_soup | 2 |
| cuisine_token_has_no_measured_demand_northwestern | 2 |
| cuisine_token_has_no_measured_demand_bento_box | 2 |
| cuisine_token_has_no_measured_demand_tha | 2 |
| cuisine_token_has_no_measured_demand_barb | 2 |
| cuisine_token_has_no_measured_demand_bún_bò_giò_huế | 2 |
| cuisine_token_has_no_measured_demand_omikase | 2 |
| cuisine_token_has_no_measured_demand_agua_fresca | 2 |
| cuisine_token_has_no_measured_demand_new_mexico | 2 |
| cuisine_token_has_no_measured_demand_muffuletta | 2 |
| cuisine_token_has_no_measured_demand_chả_cá | 2 |
| cuisine_token_has_no_measured_demand_fried_cheese_sticks | 2 |
| cuisine_token_has_no_measured_demand_jianbing | 2 |
| cuisine_token_has_no_measured_demand_philly_cheesesteaks | 2 |
| cuisine_token_has_no_measured_demand_guinness_stew | 2 |
| cuisine_token_has_no_measured_demand_salsa | 2 |
| cuisine_token_has_no_measured_demand_bò_7_món | 2 |
| cuisine_token_has_no_measured_demand_molecular_gastronomy | 2 |
| cuisine_token_has_no_measured_demand_guros | 2 |
| cuisine_token_has_no_measured_demand_carolina | 2 |
| cuisine_token_has_no_measured_demand_fish_taco | 2 |
| cuisine_token_has_no_measured_demand_breakfast_burrito | 2 |
| cuisine_token_has_no_measured_demand_breakfast_sandwich | 2 |
| cuisine_token_has_no_measured_demand_uyghur_fusion | 2 |
| cuisine_token_has_no_measured_demand_taqu | 2 |
| cuisine_token_has_no_measured_demand_macaroni | 2 |
| cuisine_token_has_no_measured_demand_onion_rings | 2 |
| cuisine_token_has_no_measured_demand_nepalese_-_nepalese | 2 |
| cuisine_token_has_no_measured_demand_tanzanian | 2 |
| cuisine_token_has_no_measured_demand_pitaya_bowls | 2 |
| cuisine_token_has_no_measured_demand_dehydrated_fruit | 2 |
| cuisine_token_has_no_measured_demand_small_breakfasts | 2 |
| cuisine_token_has_no_measured_demand_mongolian_barbecue | 2 |
| cuisine_token_has_no_measured_demand_umami | 2 |
| cuisine_token_has_no_measured_demand_soufflé | 2 |
| cuisine_token_has_no_measured_demand_mex | 2 |
| cuisine_token_has_no_measured_demand_submarine | 2 |
| cuisine_token_has_no_measured_demand_panini’s | 2 |
| cuisine_token_has_no_measured_demand_rajasthani | 2 |
| cuisine_token_has_no_measured_demand_samoan | 2 |
| cuisine_token_has_no_measured_demand_cheese_steak | 2 |
| cuisine_token_has_no_measured_demand_melts | 2 |
| cuisine_token_has_no_measured_demand_beef_jerky | 2 |
| cuisine_token_has_no_measured_demand_south_californian | 2 |
| cuisine_token_has_no_measured_demand_polynesian_kava | 2 |
| cuisine_token_has_no_measured_demand_fiber | 2 |
| cuisine_token_has_no_measured_demand_korean_corn_dog | 2 |
| cuisine_token_has_no_measured_demand_venezualan | 2 |
| cuisine_token_has_no_measured_demand_handroll | 2 |
| cuisine_token_has_no_measured_demand_corn_dogs | 2 |
| cuisine_token_has_no_measured_demand_salvidorian | 2 |
| cuisine_token_has_no_measured_demand_juice_drinks | 2 |
| cuisine_token_has_no_measured_demand_breakfast_items | 2 |
| cuisine_token_has_no_measured_demand_grinder | 2 |
| cuisine_token_has_no_measured_demand_antipasto | 2 |
| cuisine_token_has_no_measured_demand_indegenous | 2 |
| cuisine_token_has_no_measured_demand_ashkenazi_jewish | 2 |
| cuisine_token_has_no_measured_demand_eastern_european_jewish | 2 |
| cuisine_token_has_no_measured_demand_restaurants | 2 |
| cuisine_token_has_no_measured_demand_upscale_local_food | 2 |
| cuisine_token_has_no_measured_demand_kava_bar | 2 |
| cuisine_token_has_no_measured_demand_yogurt_drinks | 2 |
| cuisine_token_has_no_measured_demand_isan | 2 |
| cuisine_token_has_no_measured_demand_baja | 2 |
| cuisine_token_has_no_measured_demand_quesabirria | 2 |
| cuisine_token_has_no_measured_demand_quesatacos | 2 |
| cuisine_token_has_no_measured_demand_asada | 2 |
| cuisine_token_has_no_measured_demand_horchata | 2 |
| cuisine_token_has_no_measured_demand_asian-hawaiian_fusion | 2 |
| cuisine_token_has_no_measured_demand_cainun | 2 |
| cuisine_token_has_no_measured_demand_hindi | 1 |
| cuisine_token_has_no_measured_demand_مشاكيك | 1 |
| cuisine_token_has_no_measured_demand_رقاق | 1 |
| cuisine_token_has_no_measured_demand_لحم_مقلاي | 1 |
| cuisine_token_has_no_measured_demand_شواء | 1 |
| cuisine_token_has_no_measured_demand_apres_ski | 1 |
| cuisine_token_has_no_measured_demand__coffe_shop | 1 |
| cuisine_token_has_no_measured_demand_home_grown | 1 |
| cuisine_token_has_no_measured_demand__wein | 1 |
| cuisine_token_has_no_measured_demand_pizza_and_ice_cream | 1 |
| cuisine_token_has_no_measured_demand_regional_wildbrett | 1 |
| cuisine_token_has_no_measured_demand__gourmet | 1 |
| cuisine_token_has_no_measured_demand_mostheuriger | 1 |
| cuisine_token_has_no_measured_demand_mediterane | 1 |
| cuisine_token_has_no_measured_demand_reginal | 1 |
| cuisine_token_has_no_measured_demand_begels | 1 |
| cuisine_token_has_no_measured_demand_traditionally | 1 |
| cuisine_token_has_no_measured_demand_sweet_dish | 1 |
| cuisine_token_has_no_measured_demand_brote | 1 |
| cuisine_token_has_no_measured_demand_wirtshausstyle | 1 |
| cuisine_token_has_no_measured_demand_horvát | 1 |
| cuisine_token_has_no_measured_demand_heurigenküche | 1 |
| cuisine_token_has_no_measured_demand_wildspezialitäten | 1 |
| cuisine_token_has_no_measured_demand_eigenbau_weine | 1 |
| cuisine_token_has_no_measured_demand_pljeskavica | 1 |
| cuisine_token_has_no_measured_demand_bosner | 1 |
| cuisine_token_has_no_measured_demand_käsekrainer | 1 |
| cuisine_token_has_no_measured_demand_cold | 1 |
| cuisine_token_has_no_measured_demand_alpin-asiatisch | 1 |
| cuisine_token_has_no_measured_demand_3_hauben_&_15_punkte | 1 |
| cuisine_token_has_no_measured_demand_hasábburgonya | 1 |
| cuisine_token_has_no_measured_demand_agritourism | 1 |
| cuisine_token_has_no_measured_demand_burmese_curry | 1 |
| cuisine_token_has_no_measured_demand_jaffles | 1 |
| cuisine_token_has_no_measured_demand_caffee_cakes_lunch | 1 |
| cuisine_token_has_no_measured_demand_cafe_&_restaurant | 1 |
| cuisine_token_has_no_measured_demand__latin_american | 1 |
| cuisine_token_has_no_measured_demand_southern_usa | 1 |
| cuisine_token_has_no_measured_demand__pide | 1 |
| cuisine_token_has_no_measured_demand__vietnamese | 1 |
| cuisine_token_has_no_measured_demand_meat_lasagne | 1 |
| cuisine_token_has_no_measured_demand_abalone | 1 |
| cuisine_token_has_no_measured_demand_rock_lobster | 1 |
| cuisine_token_has_no_measured_demand_eat_local | 1 |
| cuisine_token_has_no_measured_demand_berries | 1 |
| cuisine_token_has_no_measured_demand_baked_deserts | 1 |
| cuisine_token_has_no_measured_demand_european_bistro | 1 |
| cuisine_token_has_no_measured_demand_byo | 1 |
| cuisine_token_has_no_measured_demand_childrens_meals | 1 |
| cuisine_token_has_no_measured_demand_lavendar | 1 |
| cuisine_token_has_no_measured_demand_malta | 1 |
| cuisine_token_has_no_measured_demand_australia | 1 |
| cuisine_token_has_no_measured_demand_slices | 1 |
| cuisine_token_has_no_measured_demand_portugese | 1 |
| cuisine_token_has_no_measured_demand_gâteau_🥧 | 1 |
| cuisine_token_has_no_measured_demand_cake_maison | 1 |
| cuisine_token_has_no_measured_demand_crustacé | 1 |
| cuisine_token_has_no_measured_demand_plats_brasserie | 1 |
| cuisine_token_has_no_measured_demand_taverne | 1 |
| cuisine_token_has_no_measured_demand_peixes_e_lanches. | 1 |
| cuisine_token_has_no_measured_demand__cachorro_quente | 1 |
| cuisine_token_has_no_measured_demand__refrigerante | 1 |
| cuisine_token_has_no_measured_demand__sushi | 1 |
| cuisine_token_has_no_measured_demand__sashimi | 1 |
| cuisine_token_has_no_measured_demand__salmão | 1 |
| cuisine_token_has_no_measured_demand__batas | 1 |
| cuisine_token_has_no_measured_demand__xfamilia | 1 |
| cuisine_token_has_no_measured_demand_bebidas_e_porções | 1 |
| cuisine_token_has_no_measured_demand_lanches_e_sorvetes | 1 |
| cuisine_token_has_no_measured_demand_fogão_à_lenha | 1 |
| cuisine_token_has_no_measured_demand_pesqueiro | 1 |
| cuisine_token_has_no_measured_demand_bebidas_alcoólicas | 1 |
| cuisine_token_has_no_measured_demand__cerveja | 1 |
| cuisine_token_has_no_measured_demand__porções_pequenas | 1 |
| cuisine_token_has_no_measured_demand__cervejas | 1 |
| cuisine_token_has_no_measured_demand__porções_e_lanches | 1 |
| cuisine_token_has_no_measured_demand_roscas | 1 |
| cuisine_token_has_no_measured_demand_forrozinhos | 1 |
| cuisine_token_has_no_measured_demand_biscoito | 1 |
| cuisine_token_has_no_measured_demand_tábua_de_frios | 1 |
| cuisine_token_has_no_measured_demand_quentinha | 1 |
| cuisine_token_has_no_measured_demand_tartares | 1 |
| cuisine_token_has_no_measured_demand_sur_ardoise | 1 |
| cuisine_token_has_no_measured_demand_pizza_&_grill | 1 |
| cuisine_token_has_no_measured_demand_schweizer | 1 |
| cuisine_token_has_no_measured_demand_bootvermietung | 1 |
| cuisine_token_has_no_measured_demand_pedalovermietung | 1 |
| cuisine_token_has_no_measured_demand_top_level | 1 |
| cuisine_token_has_no_measured_demand_traditional_swiss | 1 |
| cuisine_token_has_no_measured_demand_schweizz | 1 |
| cuisine_token_has_no_measured_demand_nordique | 1 |
| cuisine_token_has_no_measured_demand_skibar | 1 |
| cuisine_token_has_no_measured_demand_styrian | 1 |
| cuisine_token_has_no_measured_demand_bölletünne | 1 |
| cuisine_token_has_no_measured_demand_hausgemachtes_brot | 1 |
| cuisine_token_has_no_measured_demand_latvian | 1 |
| cuisine_token_has_no_measured_demand_spätzle | 1 |
| cuisine_token_has_no_measured_demand_kuchen_im_glas | 1 |
| cuisine_token_has_no_measured_demand_giodabrøds | 1 |
| cuisine_token_has_no_measured_demand_plat_valaisan | 1 |
| cuisine_token_has_no_measured_demand_bockwurst | 1 |
| cuisine_token_has_no_measured_demand_kleine_gerichte | 1 |
| cuisine_token_has_no_measured_demand_fränkisch | 1 |
| cuisine_token_has_no_measured_demand_germ | 1 |
| cuisine_token_has_no_measured_demand_gehoben | 1 |
| cuisine_token_has_no_measured_demand_pommersch | 1 |
| cuisine_token_has_no_measured_demand_selbstbedienung | 1 |
| cuisine_token_has_no_measured_demand_celtic | 1 |
| cuisine_token_has_no_measured_demand_vesper | 1 |
| cuisine_token_has_no_measured_demand_sandwish | 1 |
| cuisine_token_has_no_measured_demand_martim | 1 |
| cuisine_token_has_no_measured_demand_ice_cream_+_pizza | 1 |
| cuisine_token_has_no_measured_demand_frisian | 1 |
| cuisine_token_has_no_measured_demand_fangfrischer_fisch | 1 |
| cuisine_token_has_no_measured_demand_orientalisch | 1 |
| cuisine_token_has_no_measured_demand_bisto | 1 |
| cuisine_token_has_no_measured_demand_moldavian | 1 |
| cuisine_token_has_no_measured_demand_fast-food-restaurant | 1 |
| cuisine_token_has_no_measured_demand_auf_absprache | 1 |
| cuisine_token_has_no_measured_demand_breakfirst | 1 |
| cuisine_token_has_no_measured_demand_pfälzisch | 1 |
| cuisine_token_has_no_measured_demand_windbeutel | 1 |
| cuisine_token_has_no_measured_demand_smokes_fish | 1 |
| cuisine_token_has_no_measured_demand_jumpfood | 1 |
| cuisine_token_has_no_measured_demand_slowfood | 1 |
| cuisine_token_has_no_measured_demand_market_fair | 1 |
| cuisine_token_has_no_measured_demand_bruch | 1 |
| cuisine_token_has_no_measured_demand_region | 1 |
| cuisine_token_has_no_measured_demand_figs | 1 |
| cuisine_token_has_no_measured_demand_koshry | 1 |
| cuisine_token_has_no_measured_demand_orienteering | 1 |
| cuisine_token_has_no_measured_demand_كافيه_مصطفى | 1 |
| cuisine_token_has_no_measured_demand_mallorquine | 1 |
| cuisine_token_has_no_measured_demand_paella_valenciana | 1 |
| cuisine_token_has_no_measured_demand_castillan | 1 |
| cuisine_token_has_no_measured_demand_gastronómica | 1 |
| cuisine_token_has_no_measured_demand_bulgaria | 1 |
| cuisine_token_has_no_measured_demand_gastronimic | 1 |
| cuisine_token_has_no_measured_demand_moorish | 1 |
| cuisine_token_has_no_measured_demand_rabbit | 1 |
| cuisine_token_has_no_measured_demand__brasa | 1 |
| cuisine_token_has_no_measured_demand_rabas | 1 |
| cuisine_token_has_no_measured_demand_proximity | 1 |
| cuisine_token_has_no_measured_demand_autóctona | 1 |
| cuisine_token_has_no_measured_demand_galega | 1 |
| cuisine_token_has_no_measured_demand_speiseeis | 1 |
| cuisine_token_has_no_measured_demand_catas | 1 |
| cuisine_token_has_no_measured_demand_fouées | 1 |
| cuisine_token_has_no_measured_demand_normand | 1 |
| cuisine_token_has_no_measured_demand_pierrade | 1 |
| cuisine_token_has_no_measured_demand_montagne | 1 |
| cuisine_token_has_no_measured_demand_madagascar | 1 |
| cuisine_token_has_no_measured_demand_regional_et_pizza | 1 |
| cuisine_token_has_no_measured_demand_viande | 1 |
| cuisine_token_has_no_measured_demand_créatif_gourmand | 1 |
| cuisine_token_has_no_measured_demand_haute | 1 |
| cuisine_token_has_no_measured_demand_poulet_fermier | 1 |
| cuisine_token_has_no_measured_demand__andouille_maison | 1 |
| cuisine_token_has_no_measured_demand_alternative | 1 |
| cuisine_token_has_no_measured_demand_ouvrier | 1 |
| cuisine_token_has_no_measured_demand__moules_frites | 1 |
| cuisine_token_has_no_measured_demand__inspiration_hollandaise | 1 |
| cuisine_token_has_no_measured_demand__food_fusion | 1 |
| cuisine_token_has_no_measured_demand__périgord | 1 |
| cuisine_token_has_no_measured_demand__gastronomie | 1 |
| cuisine_token_has_no_measured_demand_lozerienne | 1 |
| cuisine_token_has_no_measured_demand_biscuits | 1 |
| cuisine_token_has_no_measured_demand_tartiflette | 1 |
| cuisine_token_has_no_measured_demand_cuisine_feu_de_bois | 1 |
| cuisine_token_has_no_measured_demand_pizza_le_mercredi | 1 |
| cuisine_token_has_no_measured_demand_anglaise | 1 |
| cuisine_token_has_no_measured_demand_spécialités_belges | 1 |
| cuisine_token_has_no_measured_demand_surgelée | 1 |
| cuisine_token_has_no_measured_demand_fait-maison | 1 |
| cuisine_token_has_no_measured_demand_rac | 1 |
| cuisine_token_has_no_measured_demand_sandwitch_snack_pizza | 1 |
| cuisine_token_has_no_measured_demand_restaurant_bar_à_vin | 1 |
| cuisine_token_has_no_measured_demand_flamm | 1 |
| cuisine_token_has_no_measured_demand_brasseir | 1 |
| cuisine_token_has_no_measured_demand_beveragws | 1 |
| cuisine_token_has_no_measured_demand_emporter | 1 |
| cuisine_token_has_no_measured_demand_gastronomie | 1 |
| cuisine_token_has_no_measured_demand_huïtres | 1 |
| cuisine_token_has_no_measured_demand_truffes | 1 |
| cuisine_token_has_no_measured_demand_franc-comtoises | 1 |
| cuisine_token_has_no_measured_demand_variée | 1 |
| cuisine_token_has_no_measured_demand_beignets_de_patate | 1 |
| cuisine_token_has_no_measured_demand_spécialités_savoyarde | 1 |
| cuisine_token_has_no_measured_demand_gâteaux | 1 |
| cuisine_token_has_no_measured_demand_frites_maison | 1 |
| cuisine_token_has_no_measured_demand_dessert_maison | 1 |
| cuisine_token_has_no_measured_demand_plats_a_emporter | 1 |
| cuisine_token_has_no_measured_demand_cuisse_de_grenouille | 1 |
| cuisine_token_has_no_measured_demand_westafrican | 1 |
| cuisine_token_has_no_measured_demand_cantine | 1 |
| cuisine_token_has_no_measured_demand_rhumerie | 1 |
| cuisine_token_has_no_measured_demand_terrines | 1 |
| cuisine_token_has_no_measured_demand_mussel | 1 |
| cuisine_token_has_no_measured_demand_pabini | 1 |
| cuisine_token_has_no_measured_demand_plat_chaud | 1 |
| cuisine_token_has_no_measured_demand_pâtisserie | 1 |
| cuisine_token_has_no_measured_demand_aperitive | 1 |
| cuisine_token_has_no_measured_demand_galette_bretonne | 1 |
| cuisine_token_has_no_measured_demand_pain_bagnat | 1 |
| cuisine_token_has_no_measured_demand_pain_rond | 1 |
| cuisine_token_has_no_measured_demand_douceurs | 1 |
| cuisine_token_has_no_measured_demand_3_plats_du_jour | 1 |
| cuisine_token_has_no_measured_demand_plusieurs_desserts | 1 |
| cuisine_token_has_no_measured_demand_3_entrées_du_jour | 1 |
| cuisine_token_has_no_measured_demand_frites_faites_maisons | 1 |
| cuisine_token_has_no_measured_demand_cuisine_traditionnelle | 1 |
| cuisine_token_has_no_measured_demand_plats_faits-maison | 1 |
| cuisine_token_has_no_measured_demand_historical | 1 |
| cuisine_token_has_no_measured_demand_semi-gastronomique | 1 |
| cuisine_token_has_no_measured_demand_ice_creem | 1 |
| cuisine_token_has_no_measured_demand_sud_américaine | 1 |
| cuisine_token_has_no_measured_demand_mauritius | 1 |
| cuisine_token_has_no_measured_demand_cave_à_vin | 1 |
| cuisine_token_has_no_measured_demand_worker | 1 |
| cuisine_token_has_no_measured_demand_régional | 1 |
| cuisine_token_has_no_measured_demand_coktails | 1 |
| cuisine_token_has_no_measured_demand_caviste | 1 |
| cuisine_token_has_no_measured_demand_gratins | 1 |
| cuisine_token_has_no_measured_demand_canelés_de_bordeaux | 1 |
| cuisine_token_has_no_measured_demand_monde | 1 |
| cuisine_token_has_no_measured_demand_bonbons | 1 |
| cuisine_token_has_no_measured_demand_thés | 1 |
| cuisine_token_has_no_measured_demand_bar_à_tapas | 1 |
| cuisine_token_has_no_measured_demand_pokeball | 1 |
| cuisine_token_has_no_measured_demand_alcool | 1 |
| cuisine_token_has_no_measured_demand_djibouti | 1 |
| cuisine_token_has_no_measured_demand_youfka | 1 |
| cuisine_token_has_no_measured_demand_réunionnaises | 1 |
| cuisine_token_has_no_measured_demand_réunionnaise | 1 |
| cuisine_token_has_no_measured_demand_musles | 1 |
| cuisine_token_has_no_measured_demand_cuisine_bistronomique | 1 |
| cuisine_token_has_no_measured_demand_bieres | 1 |
| cuisine_token_has_no_measured_demand_reunion | 1 |
| cuisine_token_has_no_measured_demand_vente | 1 |
| cuisine_token_has_no_measured_demand_salon_de_thé) | 1 |
| cuisine_token_has_no_measured_demand_revisitée | 1 |
| cuisine_token_has_no_measured_demand_restaurant_asiatique | 1 |
| cuisine_token_has_no_measured_demand_queyrassine | 1 |
| cuisine_token_has_no_measured_demand_tourton | 1 |
| cuisine_token_has_no_measured_demand_crustasés | 1 |
| cuisine_token_has_no_measured_demand_mauritus | 1 |
| cuisine_token_has_no_measured_demand_circuit-court | 1 |
| cuisine_token_has_no_measured_demand_transylvanian | 1 |
| cuisine_token_has_no_measured_demand_scottish_pub_food | 1 |
| cuisine_token_has_no_measured_demand_specialty_teas | 1 |
| cuisine_token_has_no_measured_demand__espresso | 1 |
| cuisine_token_has_no_measured_demand__light_snacks | 1 |
| cuisine_token_has_no_measured_demand_chim | 1 |
| cuisine_token_has_no_measured_demand_ploughman | 1 |
| cuisine_token_has_no_measured_demand_baking | 1 |
| cuisine_token_has_no_measured_demand_wood_fired_pizza | 1 |
| cuisine_token_has_no_measured_demand_byo_wine | 1 |
| cuisine_token_has_no_measured_demand_lunches | 1 |
| cuisine_token_has_no_measured_demand_milshakes | 1 |
| cuisine_token_has_no_measured_demand_ice_creams | 1 |
| cuisine_token_has_no_measured_demand_farmshop | 1 |
| cuisine_token_has_no_measured_demand_full_meals | 1 |
| cuisine_token_has_no_measured_demand_porridges | 1 |
| cuisine_token_has_no_measured_demand_water_tap | 1 |
| cuisine_token_has_no_measured_demand_hot_drinks | 1 |
| cuisine_token_has_no_measured_demand_cornish_pasties | 1 |
| cuisine_token_has_no_measured_demand_bacon_roll | 1 |
| cuisine_token_has_no_measured_demand__russian | 1 |
| cuisine_token_has_no_measured_demand_seefood | 1 |
| cuisine_token_has_no_measured_demand_bavar | 1 |
| cuisine_token_has_no_measured_demand_indonesia_food | 1 |
| cuisine_token_has_no_measured_demand_jogja | 1 |
| cuisine_token_has_no_measured_demand_lopek | 1 |
| cuisine_token_has_no_measured_demand__indonesian | 1 |
| cuisine_token_has_no_measured_demand_internati | 1 |
| cuisine_token_has_no_measured_demand_coconuts | 1 |
| cuisine_token_has_no_measured_demand_pork_ribs | 1 |
| cuisine_token_has_no_measured_demand_manggarai_food | 1 |
| cuisine_token_has_no_measured_demand_truck | 1 |
| cuisine_token_has_no_measured_demand_minang_padang | 1 |
| cuisine_token_has_no_measured_demand_ind | 1 |
| cuisine_token_has_no_measured_demand_wifi | 1 |
| cuisine_token_has_no_measured_demand_индонезийская | 1 |
| cuisine_token_has_no_measured_demand_балийская | 1 |
| cuisine_token_has_no_measured_demand_outdoor_seating | 1 |
| cuisine_token_has_no_measured_demand_indon | 1 |
| cuisine_token_has_no_measured_demand_kare_sapi | 1 |
| cuisine_token_has_no_measured_demand_yamienaga | 1 |
| cuisine_token_has_no_measured_demand_kebuli | 1 |
| cuisine_token_has_no_measured_demand_nasi_kebuli | 1 |
| cuisine_token_has_no_measured_demand_grosir_san_ecer_snack | 1 |
| cuisine_token_has_no_measured_demand_tahu_bakso | 1 |
| cuisine_token_has_no_measured_demand_wonton | 1 |
| cuisine_token_has_no_measured_demand_jamu | 1 |
| cuisine_token_has_no_measured_demand_apanese | 1 |
| cuisine_token_has_no_measured_demand_lokal_taste | 1 |
| cuisine_token_has_no_measured_demand_minan | 1 |
| cuisine_token_has_no_measured_demand_saka_ombilin | 1 |
| cuisine_token_has_no_measured_demand_sitapa | 1 |
| cuisine_token_has_no_measured_demand_bakso_tulang | 1 |
| cuisine_token_has_no_measured_demand_kuliner_sikabu | 1 |
| cuisine_token_has_no_measured_demand_coofe | 1 |
| cuisine_token_has_no_measured_demand_sempol | 1 |
| cuisine_token_has_no_measured_demand_tongseng | 1 |
| cuisine_token_has_no_measured_demand_sop_kambing | 1 |
| cuisine_token_has_no_measured_demand_sop_kaki | 1 |
| cuisine_token_has_no_measured_demand_rica-rica_kambing | 1 |
| cuisine_token_has_no_measured_demand_nasi_goreng_kambing | 1 |
| cuisine_token_has_no_measured_demand_lunch_bags_for_picnics | 1 |
| cuisine_token_has_no_measured_demand_chinese_take_away | 1 |
| cuisine_token_has_no_measured_demand_hoagie | 1 |
| cuisine_token_has_no_measured_demand_chip | 1 |
| cuisine_token_has_no_measured_demand_carne_alla_graglia | 1 |
| cuisine_token_has_no_measured_demand_agritur | 1 |
| cuisine_token_has_no_measured_demand_regionale_di_stagione | 1 |
| cuisine_token_has_no_measured_demand_parmigiana | 1 |
| cuisine_token_has_no_measured_demand_focaccette_patate | 1 |
| cuisine_token_has_no_measured_demand_casalinga | 1 |
| cuisine_token_has_no_measured_demand_tipica_maremmana | 1 |
| cuisine_token_has_no_measured_demand_regional_cuisine | 1 |
| cuisine_token_has_no_measured_demand_calabrese | 1 |
| cuisine_token_has_no_measured_demand_wild_meat | 1 |
| cuisine_token_has_no_measured_demand__speck | 1 |
| cuisine_token_has_no_measured_demand_cucina_sabina | 1 |
| cuisine_token_has_no_measured_demand_rifugio | 1 |
| cuisine_token_has_no_measured_demand_okzitanisch | 1 |
| cuisine_token_has_no_measured_demand_tipica_romana | 1 |
| cuisine_token_has_no_measured_demand_self-service_buffet | 1 |
| cuisine_token_has_no_measured_demand_kaiserschmarren | 1 |
| cuisine_token_has_no_measured_demand_kasnockerl | 1 |
| cuisine_token_has_no_measured_demand_spaghetteria | 1 |
| cuisine_token_has_no_measured_demand_local_food | 1 |
| cuisine_token_has_no_measured_demand_pizzeria_pub_bar_vineria | 1 |
| cuisine_token_has_no_measured_demand_aperivif | 1 |
| cuisine_token_has_no_measured_demand_burger_panini_bistecca | 1 |
| cuisine_token_has_no_measured_demand_pizzar | 1 |
| cuisine_token_has_no_measured_demand_biologic | 1 |
| cuisine_token_has_no_measured_demand_aggriturismo | 1 |
| cuisine_token_has_no_measured_demand_toscan_citchen | 1 |
| cuisine_token_has_no_measured_demand__tipica | 1 |
| cuisine_token_has_no_measured_demand_aeolian | 1 |
| cuisine_token_has_no_measured_demand_fiorentina | 1 |
| cuisine_token_has_no_measured_demand_cucina_casalinga | 1 |
| cuisine_token_has_no_measured_demand_pizz | 1 |
| cuisine_token_has_no_measured_demand__fast_food | 1 |
| cuisine_token_has_no_measured_demand_italian_home_cooking | 1 |
| cuisine_token_has_no_measured_demand_produkte_aus_der_region | 1 |
| cuisine_token_has_no_measured_demand_kultur | 1 |
| cuisine_token_has_no_measured_demand_stocco | 1 |
| cuisine_token_has_no_measured_demand_stockfish | 1 |
| cuisine_token_has_no_measured_demand_specialità_tipiche | 1 |
| cuisine_token_has_no_measured_demand_pizzoccheri | 1 |
| cuisine_token_has_no_measured_demand_coc | 1 |
| cuisine_token_has_no_measured_demand_patatine_fritte | 1 |
| cuisine_token_has_no_measured_demand_campana | 1 |
| cuisine_token_has_no_measured_demand_dine_in | 1 |
| cuisine_token_has_no_measured_demand_panini_ripieni | 1 |
| cuisine_token_has_no_measured_demand_vini_e_bibite | 1 |
| cuisine_token_has_no_measured_demand_cremonese | 1 |
| cuisine_token_has_no_measured_demand_romagnolo | 1 |
| cuisine_token_has_no_measured_demand_tipico | 1 |
| cuisine_token_has_no_measured_demand_bike_station | 1 |
| cuisine_token_has_no_measured_demand_noleggio_e-bike | 1 |
| cuisine_token_has_no_measured_demand_genovese | 1 |
| cuisine_token_has_no_measured_demand_regional_(pizza | 1 |
| cuisine_token_has_no_measured_demand_seafruits | 1 |
| cuisine_token_has_no_measured_demand_meat) | 1 |
| cuisine_token_has_no_measured_demand_d'asporto | 1 |
| cuisine_token_has_no_measured_demand_lombard | 1 |
| cuisine_token_has_no_measured_demand_abbruzzese | 1 |
| cuisine_token_has_no_measured_demand_ficattola | 1 |
| cuisine_token_has_no_measured_demand_cantina_vitivinicola | 1 |
| cuisine_token_has_no_measured_demand_pucce | 1 |
| cuisine_token_has_no_measured_demand_チーズ料理 | 1 |
| cuisine_token_has_no_measured_demand_コーヒー・紅茶・モーニング有り | 1 |
| cuisine_token_has_no_measured_demand_コーヒー・紅茶・ランチ有り | 1 |
| cuisine_token_has_no_measured_demand_コーヒー・紅茶・軽食 | 1 |
| cuisine_token_has_no_measured_demand_和カフェ | 1 |
| cuisine_token_has_no_measured_demand_ソフトドリンク | 1 |
| cuisine_token_has_no_measured_demand_ウニ丼_seafood | 1 |
| cuisine_token_has_no_measured_demand_ital_foods | 1 |
| cuisine_token_has_no_measured_demand_ピザ、パスタ | 1 |
| cuisine_token_has_no_measured_demand_定食・そば | 1 |
| cuisine_token_has_no_measured_demand_pastries_&_coffee | 1 |
| cuisine_token_has_no_measured_demand__rice | 1 |
| cuisine_token_has_no_measured_demand_自然農法で栽培された野菜などの軽食 | 1 |
| cuisine_token_has_no_measured_demand_グルテンフリー | 1 |
| cuisine_token_has_no_measured_demand_肉魚ランチ＆ビーガンランチ・デザート | 1 |
| cuisine_token_has_no_measured_demand_ケーキ、ランチ | 1 |
| cuisine_token_has_no_measured_demand_remen | 1 |
| cuisine_token_has_no_measured_demand_パン屋 | 1 |
| cuisine_token_has_no_measured_demand_softcream | 1 |
| cuisine_token_has_no_measured_demand_caffee | 1 |
| cuisine_token_has_no_measured_demand_海鮮海鮮 | 1 |
| cuisine_token_has_no_measured_demand_ra-men | 1 |
| cuisine_token_has_no_measured_demand_タコライス | 1 |
| cuisine_token_has_no_measured_demand_テクスメクス | 1 |
| cuisine_token_has_no_measured_demand_ナチョス | 1 |
| cuisine_token_has_no_measured_demand_揚げパン | 1 |
| cuisine_token_has_no_measured_demand_カレーうどん | 1 |
| cuisine_token_has_no_measured_demand_玉こんにゃく | 1 |
| cuisine_token_has_no_measured_demand_fiji | 1 |
| cuisine_token_has_no_measured_demand_passion_fruit | 1 |
| cuisine_token_has_no_measured_demand_traditional_khmer | 1 |
| cuisine_token_has_no_measured_demand_pinseria | 1 |
| cuisine_token_has_no_measured_demand_smoking | 1 |
| cuisine_token_has_no_measured_demand_contemporary_mexican | 1 |
| cuisine_token_has_no_measured_demand_healthy_drinks | 1 |
| cuisine_token_has_no_measured_demand__típico | 1 |
| cuisine_token_has_no_measured_demand_yucatanese | 1 |
| cuisine_token_has_no_measured_demand_comida_tutunaku | 1 |
| cuisine_token_has_no_measured_demand__hot_dogos | 1 |
| cuisine_token_has_no_measured_demand__malteadas | 1 |
| cuisine_token_has_no_measured_demand__frijoles_charros | 1 |
| cuisine_token_has_no_measured_demand_quesadillas_de_marlin | 1 |
| cuisine_token_has_no_measured_demand_tacos_de_disca_norteña | 1 |
| cuisine_token_has_no_measured_demand_pasteles | 1 |
| cuisine_token_has_no_measured_demand_helado | 1 |
| cuisine_token_has_no_measured_demand_contempora | 1 |
| cuisine_token_has_no_measured_demand_mexicanos | 1 |
| cuisine_token_has_no_measured_demand_mexican_fusion | 1 |
| cuisine_token_has_no_measured_demand_burger... | 1 |
| cuisine_token_has_no_measured_demand__sarapan_pagi | 1 |
| cuisine_token_has_no_measured_demand_nasi_katok | 1 |
| cuisine_token_has_no_measured_demand_foo_chow | 1 |
| cuisine_token_has_no_measured_demand_mee_goreng | 1 |
| cuisine_token_has_no_measured_demand_kuew_tiaw_sup | 1 |
| cuisine_token_has_no_measured_demand_kuew_tiaw_goreng | 1 |
| cuisine_token_has_no_measured_demand_south_indian_food | 1 |
| cuisine_token_has_no_measured_demand_lemang | 1 |
| cuisine_token_has_no_measured_demand_brunei | 1 |
| cuisine_token_has_no_measured_demand_unknown | 1 |
| cuisine_token_has_no_measured_demand_soft_en_schepijs | 1 |
| cuisine_token_has_no_measured_demand_indonesch | 1 |
| cuisine_token_has_no_measured_demand_cafetaira | 1 |
| cuisine_token_has_no_measured_demand_vlaai | 1 |
| cuisine_token_has_no_measured_demand_kleine_kaart | 1 |
| cuisine_token_has_no_measured_demand_tapbieren | 1 |
| cuisine_token_has_no_measured_demand_b&b | 1 |
| cuisine_token_has_no_measured_demand_borrelhapjes | 1 |
| cuisine_token_has_no_measured_demand_geitenkaas | 1 |
| cuisine_token_has_no_measured_demand_blueberry | 1 |
| cuisine_token_has_no_measured_demand_cream_puff | 1 |
| cuisine_token_has_no_measured_demand_kaffee_und_kuchen | 1 |
| cuisine_token_has_no_measured_demand_regional+pizza | 1 |
| cuisine_token_has_no_measured_demand_ifugao_delicacies | 1 |
| cuisine_token_has_no_measured_demand__bulalo | 1 |
| cuisine_token_has_no_measured_demand__salads | 1 |
| cuisine_token_has_no_measured_demand_eatery | 1 |
| cuisine_token_has_no_measured_demand_pancit_canton | 1 |
| cuisine_token_has_no_measured_demand_regi | 1 |
| cuisine_token_has_no_measured_demand_beers | 1 |
| cuisine_token_has_no_measured_demand_beef_pares | 1 |
| cuisine_token_has_no_measured_demand_goto_chicke | 1 |
| cuisine_token_has_no_measured_demand_goto_egg | 1 |
| cuisine_token_has_no_measured_demand_budget_meal | 1 |
| cuisine_token_has_no_measured_demand_smokehouse | 1 |
| cuisine_token_has_no_measured_demand_store | 1 |
| cuisine_token_has_no_measured_demand_moravian | 1 |
| cuisine_token_has_no_measured_demand_regional_kuchnia_polska | 1 |
| cuisine_token_has_no_measured_demand_herbata | 1 |
| cuisine_token_has_no_measured_demand_wietnamska | 1 |
| cuisine_token_has_no_measured_demand_modern_czech | 1 |
| cuisine_token_has_no_measured_demand_kawiarnia | 1 |
| cuisine_token_has_no_measured_demand_cukiernia | 1 |
| cuisine_token_has_no_measured_demand_kebaby | 1 |
| cuisine_token_has_no_measured_demand_wrapy | 1 |
| cuisine_token_has_no_measured_demand_hamburger... | 1 |
| cuisine_token_has_no_measured_demand_vension | 1 |
| cuisine_token_has_no_measured_demand_zupy | 1 |
| cuisine_token_has_no_measured_demand_napoje | 1 |
| cuisine_token_has_no_measured_demand_browar | 1 |
| cuisine_token_has_no_measured_demand_kurczak | 1 |
| cuisine_token_has_no_measured_demand_sałatki | 1 |
| cuisine_token_has_no_measured_demand_makarony | 1 |
| cuisine_token_has_no_measured_demand_бургеры | 1 |
| cuisine_token_has_no_measured_demand_хот-доги | 1 |
| cuisine_token_has_no_measured_demand_закуски | 1 |
| cuisine_token_has_no_measured_demand_chleb | 1 |
| cuisine_token_has_no_measured_demand_karkówka | 1 |
| cuisine_token_has_no_measured_demand_strips | 1 |
| cuisine_token_has_no_measured_demand_regional_(fish) | 1 |
| cuisine_token_has_no_measured_demand_churros_+_sandwich | 1 |
| cuisine_token_has_no_measured_demand_gelataria | 1 |
| cuisine_token_has_no_measured_demand__francesinhas | 1 |
| cuisine_token_has_no_measured_demand__hamburger | 1 |
| cuisine_token_has_no_measured_demand_caldeirada | 1 |
| cuisine_token_has_no_measured_demand_não | 1 |
| cuisine_token_has_no_measured_demand_tintol | 1 |
| cuisine_token_has_no_measured_demand_tasca | 1 |
| cuisine_token_has_no_measured_demand_bagaço | 1 |
| cuisine_token_has_no_measured_demand_madeira | 1 |
| cuisine_token_has_no_measured_demand_espetada_madeira | 1 |
| cuisine_token_has_no_measured_demand_diarias | 1 |
| cuisine_token_has_no_measured_demand_ref_economicas | 1 |
| cuisine_token_has_no_measured_demand_open_only_in_summer | 1 |
| cuisine_token_has_no_measured_demand_tapas_cafe | 1 |
| cuisine_token_has_no_measured_demand_nature | 1 |
| cuisine_token_has_no_measured_demand_thai/chinese | 1 |
| cuisine_token_has_no_measured_demand_sushi_&_wok | 1 |
| cuisine_token_has_no_measured_demand__hamburgare | 1 |
| cuisine_token_has_no_measured_demand_lunchbuffé | 1 |
| cuisine_token_has_no_measured_demand_á_la_carte | 1 |
| cuisine_token_has_no_measured_demand_godis | 1 |
| cuisine_token_has_no_measured_demand_post | 1 |
| cuisine_token_has_no_measured_demand_spel | 1 |
| cuisine_token_has_no_measured_demand_hambugare | 1 |
| cuisine_token_has_no_measured_demand_europeisk | 1 |
| cuisine_token_has_no_measured_demand_kjøttpudding | 1 |
| cuisine_token_has_no_measured_demand_muğla_köfte | 1 |
| cuisine_token_has_no_measured_demand_zeytinyağlılar | 1 |
| cuisine_token_has_no_measured_demand_et_mangal | 1 |
| cuisine_token_has_no_measured_demand_akdeniz_mutfağı | 1 |
| cuisine_token_has_no_measured_demand_lkaradeniz_pidesi | 1 |
| cuisine_token_has_no_measured_demand_ψησταριά | 1 |
| cuisine_token_has_no_measured_demand_ψησταρια | 1 |
| cuisine_token_has_no_measured_demand_karadeniz_pidesi | 1 |
| cuisine_token_has_no_measured_demand_mushrooms | 1 |
| cuisine_token_has_no_measured_demand_ekmek | 1 |
| cuisine_token_has_no_measured_demand_sandwic | 1 |
| cuisine_token_has_no_measured_demand_şiş | 1 |
| cuisine_token_has_no_measured_demand_kalamar | 1 |
| cuisine_token_has_no_measured_demand_ara_sıcak | 1 |
| cuisine_token_has_no_measured_demand_breadstick | 1 |
| cuisine_token_has_no_measured_demand_brat | 1 |
| cuisine_token_has_no_measured_demand_michigan | 1 |
| cuisine_token_has_no_measured_demand_snow_cones | 1 |
| cuisine_token_has_no_measured_demand_grocery | 1 |
| cuisine_token_has_no_measured_demand_creemees | 1 |
| cuisine_token_has_no_measured_demand_soft_serve_ice_cream | 1 |
| cuisine_token_has_no_measured_demand_avant_garde | 1 |
| cuisine_token_has_no_measured_demand_burrito_bowl | 1 |
| cuisine_token_has_no_measured_demand_spirits | 1 |
| cuisine_token_has_no_measured_demand_summer | 1 |
| cuisine_token_has_no_measured_demand_northern_thai | 1 |
| cuisine_token_has_no_measured_demand_upscale | 1 |
| cuisine_token_has_no_measured_demand__cookies | 1 |
| cuisine_token_has_no_measured_demand_diner_food | 1 |
| cuisine_token_has_no_measured_demand_country_club | 1 |
| cuisine_token_has_no_measured_demand_variety_platter | 1 |
| cuisine_token_has_no_measured_demand_new_england | 1 |
| cuisine_token_has_no_measured_demand_oat_snacks | 1 |
| cuisine_token_has_no_measured_demand_ribeye | 1 |
| cuisine_token_has_no_measured_demand_meat_and_three | 1 |
| cuisine_token_has_no_measured_demand_tavern_fare | 1 |
| cuisine_token_has_no_measured_demand_broth | 1 |
| cuisine_token_has_no_measured_demand_clamatos | 1 |
| cuisine_token_has_no_measured_demand_burrito_shop | 1 |
| cuisine_token_has_no_measured_demand_banhmi | 1 |
| cuisine_token_has_no_measured_demand_starbucks | 1 |
| cuisine_token_has_no_measured_demand_zxc | 1 |
| cuisine_token_has_no_measured_demand_dive | 1 |
| cuisine_token_has_no_measured_demand_gas_station_fare | 1 |
| cuisine_token_has_no_measured_demand_central_america | 1 |
| cuisine_token_has_no_measured_demand_gourmet_soda | 1 |
| cuisine_token_has_no_measured_demand_floats | 1 |
| cuisine_token_has_no_measured_demand_hopi | 1 |
| cuisine_token_has_no_measured_demand_après-ski | 1 |
| cuisine_token_has_no_measured_demand_bar&grill | 1 |
| cuisine_token_has_no_measured_demand_salmon | 1 |
| cuisine_token_has_no_measured_demand_haw | 1 |
| cuisine_token_has_no_measured_demand_chile_rellenos | 1 |
| cuisine_token_has_no_measured_demand_norteno | 1 |
| cuisine_token_has_no_measured_demand_jermaican | 1 |

### Wikidata gates

| gate | rejected |
| --- | --- |
| no_official_website_so_page_would_be_thin | 66,603 |
| no_parent_city | 52,340 |
| already_in_osm_corpus | 18,903 |
| list_below_min_count | 12,296 |
| wikidata_duplicate_qid | 8,408 |
| no_parent_page_exists_on_the_site | 8,118 |
| no_market_for_country | 5,023 |
| list_entries_too_thin | 932 |
| list_already_published_from_the_osm_corpus | 211 |

### Manifest gates

| gate | rejected |
| --- | --- |
| localization:TRANSLATION_ONLY | 260,075 |
| localization:LOCAL_INTENT_MISSING | 156,969 |
| localization:LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION | 77,386 |
| REFUSED_FABRICATED_PRECISION: the entity is city-date and the only source is NASA POWER MONTHLY normals. A daily figure derived from a monthly mean is a precision the source does not carry, so no keyword was measured for it: the page could not be honest whatever the volume turned out to be. | 67,175 |
| REFUSED_MEASURED_CANNIBALISATION: "X climate" reads 150 to 2,000 a month, but its parent_topic points elsewhere in eleven of fifteen English readings and in almost every German, French and Italian one: amsterdam climate to "amsterdam", clima roma to "meteo", rom klima to "klimatabelle rom", climat lisbonne to "quand partir a lisbonne". The query is absorbed by the city itself, by weather.city-month which already holds 22,927 pages from the same NASA POWER store, or by the best-time intent. The annual shape belongs as a section on the month pages parent, not as its own URL. | 67,175 |
| REJECTED_QUALITY: no defensible uniqueness basis | 46,218 |
| REFUSED_MEASURED_CANNIBALISATION: "X travel guide" reads 250 to 2,400 in en-US at CPC 20 to 120 cents, the best commercial signal of the three, but its parent topics are "things to do in bangkok", "visiting paris", "what to see in rome", "barcelona travel" and "amsterdam travel", which is the topic activities.city-things-to-do already holds with 30,040 pairs. Outside English it is dead: "X reisefuehrer" reads 10 in German for every city tested and "guida di viaggio X" reads 0 to 30 in Italian. The commercial signal is real and belongs in the things-to-do title and copy, not on a second URL competing with it. | 29,539 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: this city was either measured and read below the floor, or has not been measured. Akron, Tulsa, Konstanz, Leipzig, Rostock, Lille, Marseille and Strasbourg all read zero for this intent while Sedona read 2,400, so the city is admitted on its own reading and on nothing else. | 26,249 |
| REJECTED_QUALITY: indexability floor 10 | 15,353 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: the best-time intent was measured in es and refused at city level (5 of 72 cities clear 50 a month). It is a country question in this language, not a city one. | 12,158 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: the best-time intent was measured in pl and refused at city level (rzym 10, paryz 0, barcelona 0, londyn 0, nowy jork 0). It is a country question in this language, not a city one. | 9,903 |
| REJECTED_SERP: AGGREGATOR_LOCKED is a measured closed SERP, not winnable | 8,879 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: the best-time intent was measured in pt and refused at city level (roma 20, paris 10, nova york 0, lisboa 0, barcelona 0). It is a country question in this language, not a city one. | 3,040 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: no best-time phrasing has been measured in nl beyond a head probe, so no city in it can be admitted yet. The queue is in best-time-keyword-queue-2026-10-06.json. | 3,029 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: no best-time phrasing has been measured in ja beyond a head probe, so no city in it can be admitted yet. The queue is in best-time-keyword-queue-2026-10-06.json. | 2,544 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.route-from-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1,252 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-cuisine is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 639 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-restaurant is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 544 |
| localization:LOCAL_DATA_MISSING | 496 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: the best-time intent was measured in tr and refused at city level (roma 0, barselona 0, istanbul 0, lizbon 0, atina 0). It is a country question in this language, not a city one. | 489 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. weather.city-month is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 489 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-cuisine is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 477 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.route-from-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 326 |
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
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. health.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. property.city-buy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. relocation.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. rents.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. services.city-practical is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-salaries is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 189 |
| REJECTED_UNSUPPORTED_SUPERLATIVE: the family id itself claims ['best'], which appears in the URL segment and in the rendered title, and no methodology document exists for it. Its sources (geonames-cities; nasa-power-daily) support a factual comparison and not a ranking. areas.city-index already lists a city's areas from the same verified facts without ranking them, so this page is that one plus an unearned superlative. | 159 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-cafe is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 148 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-home is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 143 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city-vs-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 143 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-universities is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 143 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. safety.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 143 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-jobs-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 143 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. sport.city-activity is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 143 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-restaurant is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 138 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-clinic is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 136 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-school is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 134 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-dentist is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 120 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-schools is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 120 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.city-index is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 109 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-childcare is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 107 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/berlin-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 96 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-fast_food is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 95 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-home is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 95 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city-vs-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 95 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-universities is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 95 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. safety.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 95 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-jobs-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 95 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. sport.city-activity is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 95 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-window is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 95 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-department_store is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 82 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.overview is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 80 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-gym is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 80 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-school is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 79 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. places.neighbourhood-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 74 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. rents.neighbourhood is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 74 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. neighbourhoods.guide is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 74 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-clinic is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 71 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-cafe is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 67 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. weather.city-month is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 66 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. stay.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 66 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-supermarket is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 65 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-supermarket is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 65 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-pharmacy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-veterinary is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 64 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-dentist is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 63 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-bar is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 60 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-opening is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 59 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-attribute is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 58 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-gym is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 52 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/sao-paulo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 52 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-department_store is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 51 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.route-from-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 49 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/aachen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 48 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/porto-alegre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 44 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/florence-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 42 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.mtb-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 41 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: no best-time phrasing has been measured in zh-Hant beyond a head probe, so no city in it can be admitted yet. The queue is in best-time-keyword-queue-2026-10-06.json. | 40 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.foot-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 40 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rome-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 40 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-childcare is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 36 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-veterinary is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 36 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-hospital is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 35 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/belo-horizonte/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 35 |
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
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/rome-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 33 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 32 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-bar is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 31 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-college is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 30 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/salvador/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 30 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/hamburg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 30 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-railway_station is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 29 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/rio-de-janeiro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 29 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.archaeological_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 27 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/madrid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 27 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-college is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 26 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/krakow/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 26 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-arts_centre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 25 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/leipzig/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 25 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-hostel is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 24 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-schools is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 24 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 23 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-hostel is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 22 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/weimar/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 22 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: no best-time phrasing has been measured in fi beyond a head probe, so no city in it can be admitted yet. The queue is in best-time-keyword-queue-2026-10-06.json. | 21 |
| REJECTED_UNSUPPORTED_SUPERLATIVE: the family id itself claims ['best'], which appears in the URL segment and in the rendered title, and no methodology document exists for it. Its sources (geonames-cities; neighbourhood-facts-verified; rent-index-ve) support a factual comparison and not a ranking. areas.city-index already lists a city's areas from the same verified facts without ranking them, so this page is that one plus an unearned superlative. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-university is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-park is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. activities.city-things-to-do is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. weather.city-month is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. health.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.city-getting-around is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. property.city-buy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-calendar is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. relocation.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. rents.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. services.city-practical is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-salaries is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. stay.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 21 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.lighthouse is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 20 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-hospital is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 20 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/amsterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 20 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-arts_centre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 19 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.waterfall is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 19 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/potsdam-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 19 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/portland-us-oregon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 19 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-museum is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 18 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/curitiba/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 18 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/belem-br-para/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 18 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.cave is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 17 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-cinema is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 17 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/madrid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 17 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/fortaleza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 17 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-cinema is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-home is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city-vs-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-universities is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. safety.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-jobs-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. sport.city-activity is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-window is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 16 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/dresden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/barcelona-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/naples-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/kobe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/chicago/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 16 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: no best-time phrasing has been measured in nb beyond a head probe, so no city in it can be admitted yet. The queue is in best-time-keyword-queue-2026-10-06.json. | 15 |
| REJECTED_NO_MEASURED_DEMAND_FOR_THIS_ENTITY: no best-time phrasing has been measured in da beyond a head probe, so no city in it can be admitted yet. The queue is in best-time-keyword-queue-2026-10-06.json. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.bicycle-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. activities.city-things-to-do is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. activities.city-things-to-do is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. weather.city-month is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. health.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.city-getting-around is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. weather.city-month is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. health.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.city-getting-around is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. property.city-buy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. property.city-buy is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-calendar is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-calendar is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-university is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. relocation.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. relocation.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. rents.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. rents.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. services.city-practical is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-salaries is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. services.city-practical is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-salaries is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. stay.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. stay.city-type is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 15 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/rome-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 15 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/sapporo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 15 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/dallas-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 15 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-railway_station is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 14 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-museum is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 14 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.monument is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/chicago/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/madrid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/amsterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/los-angeles-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/munich/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/new-york-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/san-francisco-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/barcelona-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/hamburg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/frankfurt-am-main/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/chicago/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 14 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/recife/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/manaus/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/koln/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/berlin-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/halle-saale/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/berlin-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/munich/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/regensburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 13 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-guest_house is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 12 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-pub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 12 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/natal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/amsterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/nagoya/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/torun/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/new-york-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/milan-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 12 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.monument is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 11 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-attraction is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 11 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.city-index is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 11 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-guest_house is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 11 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/new-york-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/london-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/kyoto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/milan-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/kassel/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/los-angeles-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/nuremberg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/edinburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 11 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 10 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.city-pair-transit is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 10 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/philadelphia-us-pennsylvania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/saarbrucken/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/sao-paulo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/salvador/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/edinburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/dusseldorf/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/san-diego-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 10 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. areas.city-index is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 9 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. poi.museum-notable is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 9 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-library is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 9 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-schools is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/goiania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/salvador/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/milan-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/malaga-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/atlanta-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/san-francisco-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/barcelona-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /es/places/museum/poznan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/austin-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/munster-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/philadelphia-us-pennsylvania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/portland-us-oregon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 9 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-sports_centre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.route-from-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-home is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city-vs-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-universities is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. safety.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-jobs-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-sports_centre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. sport.city-activity is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-window is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/malaga-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rotterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/genoa-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/warsaw-pl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/norwich-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/birmingham-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/valencia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/bydgoszcz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/denver/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/essen-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/genoa-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/rostock/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/darmstadt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/siena/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/pamplona-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/munich/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/savannah-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 8 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-pub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 7 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 7 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/botafogo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/campinas-br-sao-paulo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/vila-velha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/santos/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/queens/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/chemnitz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/rotterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/stuttgart-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/lodz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/the-hague/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/bath-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/zaragoza-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/philadelphia-us-pennsylvania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/chamartin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bremen-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/trieste/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/hamburg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/meersburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/st-louis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/houston-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/magdeburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/minneapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/ciudad-lineal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/sevilla-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/modena/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/palermo-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/naples-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 7 |
| REJECTED_SAME_NAME_IN_CITY: /pl/poi/attraction/laweczka-chopina-n13293477296/ is already the poi page for an entity named Ławeczka Chopina in Warsaw, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.aqueduct is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.cave is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.archaeological_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.waterfall is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-sport is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-attraction is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-park is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/sao-paulo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bologna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/niigata/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/toledo-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/baltimore/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/zaragoza-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/oviedo-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/czestochowa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/frankfurt-am-main/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/dresden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/donostia-san-sebastian/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/murcia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lecco/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/indianapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/the-hague/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/colorado-springs/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/washington-us-district-of-columbia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lubeck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bonn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/new-haven-us-connecticut/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/birmingham-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/glasgow-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/detroit/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bielefeld/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/rome-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/mannheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lucca/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/bologna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/braunschweig/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/gijon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/san-diego-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/osnabruck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/gasteiz-vitoria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/la-rochelle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pisa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/dessau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/florianopolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/erlangen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/reutlingen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 6 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041922, so the two would be the same page | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-gallery is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.tower is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.route-from-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-home is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city-vs-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-universities is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. safety.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-schools is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-nightclub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-jobs-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. sport.city-activity is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-window is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-library is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/fukuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/santa-teresa-br-rio-de-janeiro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/blumenau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/leblon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pittsburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/morioka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/liverpool-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/naples-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/celle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bologna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/sevilla-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/freiburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/granada-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/palma-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/boulder/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/oxford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/hiroshima/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/dortmund/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/mainz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/fukuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/speyer/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/hannover/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/santander/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/vigo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/bristol-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/stuttgart-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/eindhoven/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bergamo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/augsburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/koln/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/san-antonio-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bamberg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/burgos-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/dallas-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/hagen-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/merano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/aschaffenburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/katowice/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/brescia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/san-francisco-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/salamanca-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/park/katsushika/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/new-orleans/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/oxford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lyon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/las-vegas-us-nevada/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/seattle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/louisville-us-kentucky/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/los-angeles-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pistoia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/cagliari/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/catania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 5 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041781, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n291978603, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n323333182, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530747888, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n913843561, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n913843564, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n11286976214, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w36538401, so the two would be the same page | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n281399025, so the two would be the same page | 4 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.mtb-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 4 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.viewpoint is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 4 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.cave is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 4 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.fort is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 4 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.monument is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pesaro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/florianopolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/cardiff/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/heidelberg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/porto-alegre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/delft/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/sapporo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/trieste/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/osaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/kagoshima/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/syracuse-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/kamakura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/leipzig/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/santo-andre-br/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/gouda/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/ochota/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/theatre/minato-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/kyoto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/saint-andrews-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/aberdeen-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/portsmouth-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/london-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/york-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/lille-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/sendai-jp-miyagi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/murcia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/valencia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/gdansk/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/olsztyn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/bialystok/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/lublin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/vilanova-i-la-geltru/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/hanau-am-main/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/luneburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/memphis-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/komae/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/santiago-de-compostela/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/catanzaro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lorca/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/oklahoma-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/heidelberg-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/brooklyn-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/rotterdam-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/maastricht/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/purmerend/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/bielsko-biala/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/avignon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/brooklyn-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/oakland-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/kansas-city-us-missouri/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/kudowa-zdroj/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/stralsund/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/leiden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rouen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/indianapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/venice-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/nottingham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/brooklyn-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/phoenix/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/pueblo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/vigo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/new-orleans/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/berkeley-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/manchester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/paris-18-buttes-montmartre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/the-hague/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rottweil/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/reggio-calabria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/richmond-us-virginia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/richmond-us-virginia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/eisenach/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/alicante-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/chuo-jp-tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/vincennes-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/columbus-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/palermo-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/turin-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/providence-us-rhode-island/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/pittsburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/omaha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/san-jose-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/valladolid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/wichita/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/san-jose-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bernkastel-kues/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 4 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041659, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041673, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256042733, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256042748, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n323607635, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n324036733, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n454666359, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n454899950, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n471168193, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530735159, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530742114, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n913824478, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1412836122, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n11483815963, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w75133409, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w75318759, so the two would be the same page | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w75472593, so the two would be the same page | 3 |
| REJECTED_SAME_NAME_IN_CITY: /pl/poi/attraction/laweczka-chopina-n13293479732/ is already the poi page for an entity named Ławeczka Chopina in Praga Północ, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 3 |
| REJECTED_SAME_NAME_IN_CITY: /pl/poi/attraction/laweczka-chopina-n13293462008/ is already the poi page for an entity named Ławeczka Chopina in Śródmieście, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.wilderness_hut is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-mall is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.tower is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. transport.route-from-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-nightclub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.ruins is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-theatre is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.ruins is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. comparisons.city-vs-home is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. cost-of-living.city-vs-market is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-universities is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. safety.city is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-schools is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. education.city-schools is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. work.city-jobs-category is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.area-gallery is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. sport.city-activity is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. events.city-window is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bremen-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/dusseldorf/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/salt-lake-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/utrecht-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/genoa-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/altamura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/glasgow-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/marburg-an-der-lahn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/pontevedra-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/kansas-city-us-missouri/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/donostia-san-sebastian/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/nagoya/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/przemysl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/zakopane/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/lyon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/arnhem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/kielce/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pescara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/bilbao/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/wurzburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/nagoya/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/sakai-jp-osaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/theatre/paris-06-luxembourg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/belfast-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/dundee-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/nottingham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/winchester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/cremona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/kyoto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/kitakyushu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/chiba-jp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/walthamstow/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/tokushima/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/kamakura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/saint-paul-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/almeria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/sant-adria-de-besos/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/grand-rapids-us-michigan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/szczecin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/badalona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/cleveland-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bordeaux/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/maiori/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ludwigsburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/cartagena-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/meiningen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bilbao/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/alicante-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/padua-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/ilford/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/lecce/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/omaha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/houston-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/deventer/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/seattle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ravenna-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/baltimore/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/minneapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/utrecht-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/groningen-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/leiden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/toulouse/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/albacete/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/szklarska-poreba/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/aachen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/southend-on-sea/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/bradford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/phoenix/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/como/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/dordrecht-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/rzeszow/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/florence-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/nijmegen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/gliwice/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/charlotte-us-north-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/detroit/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bolzano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bautzen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/troyes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/beaumont-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/schwerin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/montpellier/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/haarlem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bochum-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/halle-saale/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/krefeld/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/utrecht-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/trento-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/fort-worth/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/manchester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pensacola/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/burgos-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/york-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/besancon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/toulouse/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/brescia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/tucson/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/koln/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/le-mans/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/caen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/lleida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/santa-maria-degli-angeli/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bari-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/pisa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/jaen-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/brooklyn-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/santa-fe-us-new-mexico/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/cincinnati/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/terrassa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/girona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/san-francisco-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/coventry-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/saint-paul-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/salerno/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/turin-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/perugia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/verona-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/nashville-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/madrid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/columbus-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/birmingham-us-alabama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/columbus-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/karlsruhe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 3 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256041847, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n267433562, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n319482020, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n454899951, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n469641200, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n480760326, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530743910, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n531228737, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n531242760, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n650865315, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n658981816, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.cave for entity n795804611, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1774677537, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.cave for entity n2078649263, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n2622035954, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n3923636455, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n12262806996, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w25804487, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w26192938, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w38431259, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w98029976, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.archaeological_site for entity w383202875, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w40439371, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n26863008, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n26864262, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n26864263, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n988137856, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n989465054, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1089570448, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1089570452, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n8280351615, so the two would be the same page | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w220270171, so the two would be the same page | 2 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/gagosian-n10859974159/ is already the poi page for an entity named Gagosian in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 2 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/de-doelen-q128795837/ is already the stay page for an entity named De Doelen in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 2 |
| REJECTED_SAME_NAME_IN_CITY: /nl/stay/near-venue/de-doelen-q128795837/ is already the stay page for an entity named De Doelen in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.hiking-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.ski-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-garden is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.observatory is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. pulse.country-holidays is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.caravan_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.castle is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 2 |
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
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/niteroi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/minato-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/otaru/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/yokohama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/haarlem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/nantes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/ferrara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/zwolle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/passau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/cuenca-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/otsu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/olot/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/voorburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/zoetermeer/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/schagen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/esslingen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/kolobrzeg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/faenza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/lemmer/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/shoreline/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/stoke-on-trent/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/leipzig/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/derry-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/cheltenham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/yokohama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/castello-de-la-plana/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /tr/places/museum/shimonoseki/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/kitakyushu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/kawasaki-jp-kanagawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/osaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/niigata/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/nagasaki-jp-nagasaki/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/asahikawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/breda/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/aomori/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/machida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/chuo-jp-tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/shizuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bammental/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/olkusz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/swidnica/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/radom/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lleida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/albacete/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/bad-oeynhausen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/coburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/daytona-beach/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/mantua-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pinerolo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/taranto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lugo-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/monforte-de-lemos/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/a-coruna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/tottenham-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/san-diego-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/florence-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/park/salvador/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/places/museum/ferrara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/helmond/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bad-bergzabern/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/aviles/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/cuenca-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/valmadrera-caserta/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/boston-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/mannheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/glendale-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/heerlen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/treviso/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/voorburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/diemen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/s-hertogenbosch/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/bremen-de/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/burbank-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bad-arolsen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/lublin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/santa-fe-us-new-mexico/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/atlanta-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lorient/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/birmingham-us-alabama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/anaheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lincoln-us-nebraska/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bayonne-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/maastricht/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/kiel/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/zwickau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/cieszyn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/witten/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/digne-les-bains/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/gaillac/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rovereto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/opole/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/venice-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/hannover/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/cleveland-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/madison-us-wisconsin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/blois/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/portsmouth-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/halifax-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/zgorzelec/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bilbao/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/lodz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/newcastle-upon-tyne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/a-coruna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/nantes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/limoges/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/leeuwarden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/tilburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/wilhelmshaven/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/san-diego-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/rio-de-janeiro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/rio-de-janeiro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/barra-da-tijuca/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/galveston/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/nijmegen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/schiedam/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/jamestown-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/catania/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/valkenswaard/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/tampa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/erfurt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/hoorn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pasadena-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/almeria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/munster-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/winschoten/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/aracaju/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/santa-monica-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/albuquerque/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ulm/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/brighton-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/evanston-us-illinois/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/rochefort-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/morden-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/phoenix/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/washington-us-district-of-columbia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/gasteiz-vitoria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/getafe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/denver/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/paris-06-luxembourg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/caen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/cordoba-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/theatre/chuo-jp-tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/wroclaw/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/dresden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/places/theatre/ferrara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/grenoble/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/san-luis-obispo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/mulhouse/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/villeneuve-d-ascq/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/saint-malo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/seattle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/zwolle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/minneapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/villeurbanne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/le-mans/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/madison-us-wisconsin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/livorno/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bolzano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/zutphen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/padua-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/fermo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/arezzo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/piombino/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/turin-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/varallo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/trieste/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/prato/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/verona-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/alcoy/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/sheffield-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/gorlitz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/kita-jp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/branson/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/memphis-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/glendale-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/boston-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/sheffield-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/knoxville-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/albany-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/milwaukee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/fulham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/charleston-us-south-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/rochester-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/riverside-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pordenone/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/feltre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lecce/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/acton-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/steenwijk/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/foz-do-iguacu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /es/places/museum/criciuma/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/segovia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/charlotte-us-north-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/kiel/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/leicester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/santa-monica-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/kalamazoo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/newcastle-upon-tyne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/paradise-us-nevada/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/raleigh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/marietta-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/ochsenfurt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rastatt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/monchengladbach/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/wuppertal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/hildesheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/rendsburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/fresno-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/seattle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/munster-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 2 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n256042837, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n460855570, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w131906872, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w177277435, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n26863047, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n246236550, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n259965405, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n285972358, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n285972361, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n310438152, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n319480822, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n323486209, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n330595505, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n418874976, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n441557888, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.waterfall for entity n454925301, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.wilderness_hut for entity n476494311, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n477710706, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n530758016, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n531228704, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n535311207, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n537117100, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n913824467, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n914699800, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.cave for entity n923447187, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n953954978, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n954676432, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1041629520, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.ruins for entity n1045687035, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1175453045, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1490464439, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.waterfall for entity n2492804962, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.waterfall for entity n2492813965, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n2506368453, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n3479091995, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.ruins for entity n3607868546, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n3811621742, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n4459679614, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n5793904554, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n6035232534, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_pass for entity n10025075531, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n12244460043, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n12277071185, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n12405480039, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_pass for entity n14024328597, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w30725037, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.tower for entity w54601431, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.tower for entity w54611173, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w75465648, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.wilderness_hut for entity w87867019, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w100108452, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.wilderness_hut for entity w121940390, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.wilderness_hut for entity w136778436, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w155583950, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w166032559, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w173682244, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w196198667, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n306394529, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.lighthouse for entity n426618808, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n1876085057, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_pass for entity n2501960454, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n10582022889, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.archaeological_site for entity n12467398443, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.tower for entity w79568492, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w107469505, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.archaeological_site for entity w180320115, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w320594351, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n3133612029, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1572677722, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w35941913, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w35944076, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w35945051, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.monument for entity w301774821, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.cave for entity n2806165147, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n9221931547, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w46969293, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w46976233, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.watermill for entity w54245691, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.watermill for entity w106068148, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w115489539, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w148710308, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.watermill for entity w506285768, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.windmill for entity w715534472, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.watermill for entity w755690134, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.fort for entity w941702623, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n26864565, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1222009983, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w153705216, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w200670273, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w236047957, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n986027125, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n1060153622, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n4357225372, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n7837461243, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity n8986289015, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w72062078, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.castle for entity w188997799, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.wilderness_hut for entity w432400655, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w231866443, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.peak for entity n7164818567, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w78416351, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w97315471, so the two would be the same page | 1 |
| REJECTED_DUPLICATE: this URL is already claimed by outdoors.mountain_hut for entity w148212583, so the two would be the same page | 1 |
| REJECTED_SEMANTIC_DUPLICATE: same market, family, template and entity as /nl/outdoors/trail/streekpad-de-brabantse-wal-4-r8491617/, so the two pages would say the same thing about the same thing | 1 |
| REJECTED_SEMANTIC_DUPLICATE: same market, family, template and entity as /nl/outdoors/trail/brabants-vennenpad-08-r9497283/, so the two pages would say the same thing about the same thing | 1 |
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
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.camp_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.beach_resort is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.running-trail is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. tools.net-pay is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. tools.net-pay is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. tools.net-pay is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. tools.net-pay is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. tools.net-pay is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.waterfall is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-parking is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-nature_reserve is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.lighthouse is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.camp_site is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. outdoors.observatory is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. neighbourhoods.city-where-to-stay is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: en-AU was admitted after the research freeze, so it inherits no family from the markets that share its language. destinations.country-hub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: da-DK was admitted after the research freeze, so it inherits no family from the markets that share its language. destinations.country-hub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: fi-FI was admitted after the research freeze, so it inherits no family from the markets that share its language. destinations.country-hub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. destinations.country-hub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: nb-NO was admitted after the research freeze, so it inherits no family from the markets that share its language. destinations.country-hub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: tr-TR was admitted after the research freeze, so it inherits no family from the markets that share its language. destinations.country-hub is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-beach is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
| REJECTED_FAMILY_NOT_MEASURED_IN_THIS_MARKET: es-MX was admitted after the research freeze, so it inherits no family from the markets that share its language. places.city-aquarium is not covered by any category its own keyword measurement admitted, so there is no evidence this market wants this page type. A shared language is not shared demand. | 1 |
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
| REJECTED_PARENT_REMOVED: this page declares /en/areas/brisbane/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /tr/areas/diyarbakir/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/adelaide-au/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/destinations/region/阿蘇くじゅう国立公園-r9394106/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/sacramento-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/fortaleza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/niteroi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/ribeirao-preto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/sendai-jp-miyagi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/chiba-jp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/kumamoto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/ulm/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/zutphen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/siracusa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/chiavari/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/barletta/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/alkmaar-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/lons-le-saunier/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/places/museum/grossschonau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/chateaubriant/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/breda/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/s-hertogenbosch/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bergamo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rimini/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lourdes-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/birkenhead/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/toulon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/pantin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/rennes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/shizuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/alba/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/solvang/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/eindhoven/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/inglewood/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/alcorcon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/carcassonne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/guadalajara-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lisse/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/enkhuizen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/essen-de-north-rhine-westphalia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/urbana-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/zeist/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/whitby-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/hamamatsu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/zoliborz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/warrington-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/streatham/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/exeter-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/kawasaki-jp-kanagawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/savona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ozieri/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/derby-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/kingston-upon-hull/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/hereford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/kobe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ashiya-jp-hyogo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/kita-jp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/barnsley/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/toyonaka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/naha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/places/museum/minato-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/fukuoka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/brest-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/zabrze/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/okayama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/leganes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/aachen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/pavia-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/perpignan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/newport-gb-england-isle-of-wight/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/como/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/theatre/warsaw-pl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/sant-antioco/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/chantilly-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/berkeley-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/amelia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/ota-jp-tokyo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/bruchsal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/digoin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/little-falls-us-minnesota/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/tomelloso/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/a-coruna/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/wageningen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/lelystad/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/siegen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/bolsward/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/stratford-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/theatre/wroclaw/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/aix-en-provence/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/nijmegen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/hoboken-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/theatre/roosendaal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/gotha/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/culemborg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/hilversum/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/enschede/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/maassluis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/nieuwegein/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/bremervorde/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/zoetermeer/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/soja/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/long-beach-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/ann-arbor/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/oakland-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/indianapolis/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/sioux-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/chattanooga/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/new-bedford/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/xanten/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/la-linea-de-la-concepcion/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/nuremberg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/bordeaux/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/giessen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/la-roche-sur-yon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/grou/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/naples-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/lwowek-slaski/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/regensburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/theatre/katowice/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/siracusa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/monte-sant-angelo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/schio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/amiens/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/brescia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/mestre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/limoux/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/birkenhead/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/strasbourg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/freiburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/hoorn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/arlington-us-virginia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/wolvega/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/breda/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/ustka/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/sao-bernardo-do-campo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/belo-horizonte/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/portland-us-oregon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/krakow/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/tarragona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/eindhoven/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/deventer/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/ijmuiden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/lyon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/san-antonio-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/bedzin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/tarragona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/mannheim/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rochester-us-minnesota/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/montelimar/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/saint-etienne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bayonne-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/park/sao-paulo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/toulon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/lamezia-terme/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/tagajo-shi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/gennep/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/leerdam/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/draguignan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/fort-lee-us-new-jersey/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/darmstadt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/hannover/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/augsburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/utica/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/le-creusot/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/ales/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/honfleur/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/haarlem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/oosterhout/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/auxerre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/bielefeld/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/koblenz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/lubeck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/osnabruck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/santutxu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/ursus/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/sevilla-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/tarbes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/swindon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/leeds-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/rovereto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/strasbourg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ciudad-lineal/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/avila/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/arnhem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/trento-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bethlehem-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/trento-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/okayama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/pozuelo-de-alarcon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/mansfield-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/islington/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/cambridge-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/paris-18-buttes-montmartre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/santa-monica-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ecija/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/matera/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/paris-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/hamura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/angers/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/nantes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/nice/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/reutlingen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/altenburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/frankfurt-am-main/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/grenoble/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bonn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/cambrai/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/lille-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/okayama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/figeac/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/asnieres-sur-seine/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/etaples/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rueil-malmaison/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lille-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/albuquerque/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/valencia-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/le-havre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/nimes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/fecamp/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/cognac/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/chambery/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bergerac/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/boulogne-billancourt/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/vienne/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/versailles-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/marcq-en-baroeul/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/angers/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/tours/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/orvieto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/metz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/clermont-ferrand/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/salem-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/amstelveen/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/dordrecht-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/theatre/krakow/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/versailles-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/caluire-et-cuire/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/saint-quentin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/kansas-city-us-missouri/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/metz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/comacchio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/verona-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/monza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/toledo-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/gijon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/valladolid-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/sant-boi-de-llobregat/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/santa-coloma-de-gramenet/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/malaga-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/varese/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/marostica/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/la-spezia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/chioggia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/benevento/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/nuoro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/siena/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/trapani/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/barletta/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/savona/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/pistoia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/perugia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/asti/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/bolzano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/siracusa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/la-spezia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/thousand-oaks/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/hiroshima/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/wiesbaden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/theatre/lochem/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/aix-en-provence/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/vandoeuvre-les-nancy/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/kanazawa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/groningen-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/szczecin/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ulft/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/gallarate/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/montelimar/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/worcester-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/erkrath/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/pontarlier/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/troyes/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/flensburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/magdeburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/okayama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/albany-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/amarillo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/augsburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/cincinnati/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lowell-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/melilla/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/leeuwarden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/boise/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/cody/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/buffalo-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/greensboro/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/areas/daly-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/charleston-us-south-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/finchley/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/oklahoma-city/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/springfield-us-ohio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/sacramento-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/urayasu/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/springfield-us-missouri/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/places/theatre/poznan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/worcester-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/fort-lee-us-new-jersey/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/brookline/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/reggio-nell-emilia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/lanciano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/theatre/gdansk/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/gorizia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/foligno/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/corleone/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/viterbo-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/imola/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/san-giovanni-rotondo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/alessandria/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/mondovi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/novara/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/prato/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/modica/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/latina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/forli/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ruvo-di-puglia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/terni/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/spoleto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/poggio-a-caiano/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/susa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ventimiglia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/lawrence-us-kansas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/oirschot/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/genemuiden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/besozzo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/alcala-de-henares/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/wabash/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/sao-jose-dos-campos/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/cartagena-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/padua-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/franeker/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/leon-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/segorbe/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/torrejon-de-ardoz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/cadiz-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/san-giovanni-in-persiceto/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/belfast-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/tsuruga/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/fortaleza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/paderborn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/villejuif/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/tourcoing/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/alkmaar-nl/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/duluth-us-minnesota/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/dallas-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/hoboken-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/austin-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/baton-rouge/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/plymouth-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/monterey/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/jacksonville-us-florida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/fayetteville-us-north-carolina/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/theatre/lodz/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/leeds-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /en/areas/katsushika/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/ventura/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/barstow/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/orlando/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/charlottesville/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/union-city-us-new-jersey/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/park/raleigh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/places/theatre/queens/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/pasadena-us-california/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/areas/porto-alegre/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/areas/croydon-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/matsuyama/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/san-jose-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/saratoga-springs-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/buffalo-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/pittsburgh/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/marietta-us-georgia/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/portsmouth-us-new-hampshire/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/museum/miltenberg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/schwabisch-hall/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/frankfurt-oder/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/neubrandenburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/goslar/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/ludwigshafen-am-rhein/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/zittau/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/places/museum/schmalkalden/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/leblon/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/houston-us/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/portsmouth-us-new-hampshire/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/rochester-us-new-york/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/atsugi/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/sioux-falls/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/theatre/joao-pessoa/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/austin-us-texas/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/sneek/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/bari-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/newport-gb-wales/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /ja/places/theatre/williamsport/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/sant-adria-de-besos/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/puck/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/wichita-falls/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/museum/wloclawek/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/casale-monferrato/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/dusseldorf/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/boston-us-massachusetts/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/palermo-it/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /es/areas/poznan/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/zaragoza-es/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/vicenza/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/miami-us-florida/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/areas/nashville-us-tennessee/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/portoferraio/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /nl/places/theatre/tarnow/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/s-hertogenbosch/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/bayonne-fr/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/la-rochelle/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/cambridge-gb/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/doesburg/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /fr/places/museum/groenlo/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pl/places/museum/apeldoorn/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/theatre/santiago-de-compostela/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |
| REJECTED_PARENT_REMOVED: this page declares /pt/places/museum/springfield-us-illinois/ as its parent and that page is not in the final set, so the breadcrumb and the internal link would both point at nothing | 1 |

## 6. QA at scale

- rows checked: 877,462, distinct URLs 877,462

| check | count |
| --- | --- |
| title_over_65_chars | 408,955 |
| meta_over_165_chars | 428,155 |
| title_under_15_chars | 28 |
| duplicate_title_exact | 596 |
| duplicate_title_same_tokens | 1,061 |
| destination_rows | 77,694 |
| destination_rows_with_no_locale_specific_fact | 0 |
| uniqueness_reason_shared_with_another_candidate | 5 |
| templates_with_repeated_entities | 0 |
| orphan_pages | 113 |
| top_level_pages_whose_parent_is_the_locale_home | 0 |
| intent_owners_claimed_by_more_than_one_url | 0 |
| urls_sharing_a_cannibalization_key | 0 |
| locale_mismatch_between_url_and_row | 0 |
| entity_names_needing_a_disambiguator_in_the_title | 938 |
| same_entity_id_under_two_names | 0 |
| candidates_with_no_usable_source | 0 |
| kept_rows_with_a_rejecting_localisation_class | 0 |
| urls_that_collide_once_diacritics_are_folded | 0 |
| urls_containing_a_latin_character_with_a_diacritic | 0 |
| duplicate_canonicals | 0 |
| duplicate_meta_within_a_market | 0 |
| duplicate_h1_within_a_market | 619 |
| declared_parent_is_not_a_valid_parent | 0 |
| declared_parent_is_valid_but_not_a_path_prefix | 23,622 |
| family_locale_cells_failing_the_usefulness_test | 0 |

- A per-page target query is not recorded in the manifest, so a query-level competition test cannot be run from it. The three keyword fields it does carry are family-level: they name the measurement that proved the family in a market, not the page target.

- title length: min 13, max 208, mean 65.7

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

877,462 candidates survive the gates. The target is 1,000,000.

The gap is not a shortage of raw rows. It is the gates, and each one was added for a reason that a measurement or a SERP showed:

- An area page needs the area to be a NAMED entity. Requiring a polygon, a population, a Wikidata item or a Wikipedia article cut the usable place set by about two thirds. The Kreuzberg probe validated neighbourhood demand for a famous area and says nothing about an unnamed suburb.
- A POI belongs to exactly one area. Letting every covering extent claim it produced four times as many area pages, and they would have been near-duplicate lists of the same venues on adjacent neighbourhood pages.
- Modifier pages are gated on city size, because every measured keyword for them named a large city.
- An area page needs its parent city page to exist, or it is an orphan by construction.
- Individual entity pages are allowed only where a third party can rank. The SERP for a named hospital, university or station belongs to that institution.

Raising the number to one million from here would mean removing one of those gates. Each one is written down with the measurement behind it so that decision can be made deliberately rather than by accident, and so it can be reversed if a later measurement disagrees. What this pass will not do is reach the number by generating pages the measurements say nobody searches for.


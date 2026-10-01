# Livdar candidate inventory: the final state of this pass

Built 2026-10-01. Every number below is read from a generated file, not retyped, so this report and the inventory cannot disagree.

## 1. The number

- FINAL DISTINCT VALID CANDIDATES: **208,841**
- target: 1,000,000
- shortfall: **791,159** (20.9 per cent of target)
- rejected and kept visible: 117,593

The target was not reached. The rest of this report is about why, which of the gaps are closable and at what cost, and what was built instead. No row was added to move this number: every gate that fired is listed in section 5 with its count.

## 2. The funnel, stage by stage

| stage | count | what happened |
| --- | --- | --- |
| generated before gates | 0 | every family crossed with every entity it has, in every market scoped to it |
| passed the uniqueness and SERP gate | 0 | a candidate with no uniqueness_reason, or in a SERP archetype measured as closed, is rejected here |
| after exact dedupe | 255,019 | same url_pattern |
| after semantic dedupe | 255,019 | same market, family, template signature and entity |
| FINAL DISTINCT | 208,841 | what is in the manifest |

## 3. Where the candidates are

### By market

| market | candidates |
| --- | --- |
| en-US | 49,129 |
| de-DE | 28,903 |
| ja-JP | 25,175 |
| en-GB | 23,883 |
| fr-FR | 15,465 |
| pt-BR | 15,298 |
| es-ES | 14,960 |
| it-IT | 14,446 |
| pl-PL | 11,539 |
| nl-NL | 9,246 |
| zh-Hant-TW | 797 |

### By surface

| surface | candidates |
| --- | --- |
| places | 142,408 |
| areas | 14,519 |
| stay | 14,452 |
| move | 11,725 |
| pulse | 7,064 |
| poi | 7,007 |
| work | 3,755 |
| climate | 3,205 |
| transport | 2,941 |
| tools | 634 |
| sport | 584 |
| safety | 547 |

### By readiness

| status | candidates |
| --- | --- |
| POI_AGGREGATION | 154,214 |
| MISSING_DATA | 29,787 |
| BLOCKED_BY_LICENCE | 14,054 |
| NOT_IMPLEMENTED | 6,082 |
| EXPERIMENT_ONLY | 4,634 |
| VALIDATED | 50 |
| PROMISING | 20 |

### By source readiness

| source_status | candidates |
| --- | --- |
| SOURCE_AVAILABLE | 182,861 |
| LICENCE_REQUIRED | 14,054 |
| FEED_REQUIRED | 8,046 |
| READY_NOW | 3,880 |

### By SERP feasibility

| serp_feasibility | candidates |
| --- | --- |
| viable | 70,131 |
| unsampled_needs_serp_check | 55,517 |
| competitive | 51,270 |
| poor_fit | 20,664 |
| strong_opportunity | 11,259 |

### By licence

| licence_status | candidates |
| --- | --- |
| ODbL_SHARE_ALIKE_ATTRIBUTION_REQUIRED | 148,427 |
| OK | 40,573 |
| LICENCE_REQUIRED | 14,054 |
| CC0_NO_CONDITIONS | 5,787 |

### By demand evidence for the market the page targets

A family proven in other markets but unmeasured in this one scores 30 rather than zero, because one keyword validates a cluster. That is not the same as measured demand, so the distinction is a field rather than something to infer from a score.

| market_demand_evidence | candidates |
| --- | --- |
| shape_measured_2026_10_01 | 154,214 |
| measured_in_this_market | 49,931 |
| family_measured_elsewhere | 4,696 |

### The twenty largest families

| family | candidates |
| --- | --- |
| places.area-cuisine | 17,692 |
| places.city-cuisine | 13,263 |
| places.area-opening | 9,652 |
| places.area-restaurant | 8,010 |
| places.area-attribute | 6,357 |
| places.area-fast_food | 6,124 |
| poi.museum-notable | 4,989 |
| activities.city-things-to-do | 4,979 |
| places.area-pharmacy | 4,964 |
| places.area-cafe | 4,912 |
| stay.near-venue | 4,786 |
| places.city-restaurant | 4,638 |
| places.area-supermarket | 4,563 |
| areas.overview | 4,279 |
| places.city-opening | 3,753 |
| rents.city | 3,665 |
| places.city-fast_food | 3,616 |
| places.area-clinic | 3,493 |
| events.city-type | 3,240 |
| events.city-calendar | 3,240 |

## 3b. The multilingual breakdown

A second language is not free inventory. Every row whose language is not the language of the country it describes has to show its own reason to exist, and the default answer is no. The table below separates what each market kept from what it was refused and why.

| market | raw candidates | final valid | no uniqueness basis | closed SERP | translation only | local intent missing | demand not for this destination | local data missing | other |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| en-US | 57,801 | 49,129 | 7,538 | 881 | 0 | 0 | 247 | 0 | 6 |
| en-GB | 52,721 | 23,883 | 9,881 | 3,916 | 0 | 0 | 15,022 | 0 | 19 |
| de-DE | 51,354 | 28,903 | 6,474 | 3,386 | 0 | 1 | 12,580 | 0 | 10 |
| ja-JP | 31,571 | 25,175 | 4,489 | 1,108 | 0 | 1 | 548 | 248 | 2 |
| zh-Hant-TW | 4,708 | 797 | 690 | 80 | 0 | 1 | 3,140 | 0 | 0 |
| it-IT | 23,195 | 14,446 | 4,643 | 266 | 0 | 1 | 3,838 | 0 | 1 |
| es-ES | 23,819 | 14,960 | 4,735 | 300 | 0 | 1 | 3,823 | 0 | 0 |
| fr-FR | 25,482 | 15,465 | 5,894 | 286 | 0 | 1 | 3,587 | 248 | 1 |
| nl-NL | 14,878 | 9,246 | 4,716 | 114 | 0 | 1 | 796 | 0 | 5 |
| pl-PL | 17,219 | 11,539 | 4,669 | 202 | 0 | 1 | 796 | 0 | 12 |
| pt-BR | 23,686 | 15,298 | 5,793 | 1,354 | 0 | 1 | 1,238 | 0 | 2 |
| **all 11** | **326,434** | **208,841** | | | | | | | |

Romanian is absent from the table on purpose. No Romanian Atlas page was added in this pass, as instructed.

### Localisation class of every row that survived

| localization_class | candidates |
| --- | --- |
| NATIVE_LOCALE | 208,618 |
| VALID_LOCALIZATION | 223 |

- flagged LOCAL_SERP_UNVERIFIED: 55,517. These are kept, not rejected. Absence of SERP evidence is not evidence of a poor fit, and treating it as one already mislabelled 62 per cent of this inventory once.

### Top families per market

| market | strongest families |
| --- | --- |
| en-US | places.city-cuisine (5,019), places.area-cuisine (4,652), places.area-attribute (2,866), places.area-opening (2,583) |
| en-GB | activities.city-things-to-do (3,476), stay.near-venue (2,582), places.area-cuisine (2,038), places.city-cuisine (1,285) |
| de-DE | places.area-attribute (2,673), places.area-opening (2,386), places.area-cuisine (1,602), places.area-restaurant (1,158) |
| ja-JP | places.area-cuisine (3,311), places.city-cuisine (1,814), places.area-opening (1,082), places.area-restaurant (983) |
| zh-Hant-TW | activities.city-things-to-do (51), places.city-category (40), weather.city-month (40), health.city (40) |
| it-IT | places.area-cuisine (1,429), places.area-restaurant (812), poi.museum-notable (789), places.city-cuisine (658) |
| es-ES | places.area-cuisine (1,222), places.area-restaurant (957), places.city-cuisine (791), places.area-supermarket (740) |
| fr-FR | places.area-cuisine (1,583), places.city-cuisine (1,156), places.area-restaurant (498), places.area-opening (482) |
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
- named places loaded: 431,150, of which 42,713 passed the entity gates
- POI assigned to an area by polygon containment: 348,677; by documented proximity to a place node: 1,270,376
- aggregation candidates: 148,447 ({'city_category': 34249, 'area_category': 53115, 'city_cuisine': 13263, 'area_cuisine': 17692, 'city_attribute': 2777, 'area_attribute': 6357, 'city_opening': 3753, 'area_opening': 9652, 'city_sport': 133, 'area_parent': 4279, 'city_areas_hub': 520, 'notable_entity': 2657})
- Wikidata entities loaded: 127,946, candidates 5,793, deduped against OSM by {'qid': 10841, 'name_and_position': 3661}
- Pulse entities normalised from four providers: {'national': 1081, 'regional': 623, 'school': 1502, 'long_weekends': 687, 'bridge_days': 233, 'long_weekends_subdivision': 3539, 'bridge_days_subdivision': 1052, 'bridge_plans': 348}

## 5. Every gate that fired, with its count

Nothing is hidden. A candidate rejected here is in LIVDAR-1M-REJECTED-CANDIDATES.csv.gz with its reason.

### Aggregation gates

| gate | rejected |
| --- | --- |
| entity_not_notable | 5,003,128 |
| place_not_a_named_entity | 246,408 |
| place_no_parent_city | 139,224 |
| area_cuisine_below_min_count | 97,833 |
| below_min_count | 96,344 |
| cuisine_below_min_count | 95,291 |
| area_class_not_a_list_intent | 86,026 |
| class_not_a_list_intent | 79,175 |
| area_below_min_count | 61,620 |
| area_parent_city_page_not_accepted | 52,806 |
| area_opening_below_min_count | 45,124 |
| attr_below_min_count | 39,263 |
| opening_below_min_count | 37,873 |
| area_attr_below_min_count | 37,498 |
| entries_too_thin | 18,937 |
| opening_city_below_measured_demand_floor | 11,046 |
| area_entries_too_thin | 10,669 |
| area_parent_too_narrow | 10,662 |
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
| place_ambiguous_duplicate_name_in_city | 780 |
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
| no_parent_city | 49,347 |
| no_official_website_so_page_would_be_thin | 27,774 |
| already_in_osm_corpus | 14,502 |
| list_below_min_count | 7,768 |
| wikidata_duplicate_qid | 6,877 |
| no_parent_page_exists_on_the_site | 5,485 |
| list_entries_too_thin | 483 |
| list_already_published_from_the_osm_corpus | 239 |

### Manifest gates

| gate | rejected |
| --- | --- |
| REJECTED_QUALITY: no defensible uniqueness basis | 59,522 |
| localization:LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION | 45,615 |
| REJECTED_SERP: SERP_FEATURE_SUPPRESSED is a measured closed SERP, not winnable | 8,722 |
| REJECTED_SERP: AGGREGATOR_LOCKED is a measured closed SERP, not winnable | 3,171 |
| localization:LOCAL_DATA_MISSING | 496 |
| localization:LOCAL_INTENT_MISSING | 9 |
| REJECTED_SAME_NAME_IN_CITY: /pl/poi/attraction/laweczka-chopina-n13293477296/ is already the poi page for an entity named Ławeczka Chopina in Warsaw, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 6 |
| REJECTED_SAME_NAME_IN_CITY: /pl/poi/attraction/laweczka-chopina-n13293479732/ is already the poi page for an entity named Ławeczka Chopina in Praga Północ, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 3 |
| REJECTED_SAME_NAME_IN_CITY: /pl/poi/attraction/laweczka-chopina-n13293462008/ is already the poi page for an entity named Ławeczka Chopina in Śródmieście, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 3 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/gagosian-n10859974159/ is already the poi page for an entity named Gagosian in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 2 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/de-doelen-q128795837/ is already the stay page for an entity named De Doelen in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 2 |
| REJECTED_SAME_NAME_IN_CITY: /nl/stay/near-venue/de-doelen-q128795837/ is already the stay page for an entity named De Doelen in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 2 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/marianne-boesky-gallery-n10859974155/ is already the poi page for an entity named Marianne Boesky Gallery in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/kasmin-gallery-n10860703829/ is already the poi page for an entity named Kasmin Gallery in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/pace-gallery-n10861507198/ is already the poi page for an entity named Pace Gallery in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /ja/poi/museum/東武博物館-n2004025297/ is already the poi page for an entity named 東武博物館 in Katsushika, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/poi/gallery/matthew-marks-gallery-n10861543614/ is already the poi page for an entity named Matthew Marks Gallery in Hoboken, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /nl/poi/museum/het-depot-n3014235943/ is already the poi page for an entity named Het Depot in Wageningen, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /it/poi/museum/museo-nazionale-romano-n677476578/ is already the poi page for an entity named Museo Nazionale Romano in Rome, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/poi/museum/furstlich-furstenbergische-sammlungen-n1110192382/ is already the poi page for an entity named Fürstlich-Fürstenbergische Sammlungen in Donaueschingen, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /fr/poi/theatre/theatre-national-de-bretagne-q108888306/ is already the poi page for an entity named théâtre national de Bretagne in Rennes, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /pt/poi/museum/casa-de-cultura-mario-quintana-n5187236721/ is already the poi page for an entity named Casa de Cultura Mário Quintana in Porto Alegre, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /pt/poi/museum/museu-de-comunicacao-social-hipolito-jose-da-costa-q10333822/ is already the poi page for an entity named Museu de Comunicação Social Hipólito José da Costa in Porto Alegre, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/poi/museum/burgermeister-stroof-haus-q15479860/ is already the poi page for an entity named Bürgermeister-Stroof-Haus in Bonn, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/energiehal-q133821963/ is already the stay page for an entity named Energiehal in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /nl/stay/near-venue/energiehal-q133821963/ is already the stay page for an entity named Energiehal in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/kingston-stadium-q104868005/ is already the stay page for an entity named Kingston Stadium in Cedar Rapids, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/ryan-field-q130238480/ is already the stay page for an entity named Ryan Field in Wilmette, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/harmonie-q1783653/ is already the stay page for an entity named Harmonie in Heilbronn, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/harmonie-q1783653/ is already the stay page for an entity named Harmonie in Heilbronn, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/aomori-stadium-q11662291/ is already the stay page for an entity named Aomori Stadium in Aomori, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /ja/stay/near-venue/aomori-stadium-q11662291/ is already the stay page for an entity named Aomori Stadium in Aomori, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/john-f-kennedy-stadium-q2390739/ is already the stay page for an entity named John F Kennedy Stadium in Camden, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/clark-field-q5127221/ is already the stay page for an entity named Clark Field in Austin, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
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
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/nelson-field-q6990513/ is already the stay page for an entity named Nelson Field in Austin, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/calypso-q109627539/ is already the stay page for an entity named Calypso in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /nl/stay/near-venue/calypso-q109627539/ is already the stay page for an entity named Calypso in Rotterdam, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/saalbau-essen-q61435369/ is already the stay page for an entity named Saalbau Essen in Essen, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/saalbau-essen-q61435369/ is already the stay page for an entity named Saalbau Essen in Essen, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /de/stay/near-venue/kurhaus-wiesbaden-q16054321/ is already the stay page for an entity named Kurhaus Wiesbaden in Wiesbaden, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |
| REJECTED_SAME_NAME_IN_CITY: /en/stay/near-venue/kurhaus-wiesbaden-q16054321/ is already the stay page for an entity named Kurhaus Wiesbaden in Wiesbaden, and nothing in the data distinguishes the two, so a second page would be headed by the same words about the same place | 1 |

## 6. QA at scale

- rows checked: 208,841, distinct URLs 208,841

| check | count |
| --- | --- |
| meta_over_165_chars | 28,074 |
| title_over_65_chars | 136,232 |
| title_under_15_chars | 4 |
| duplicate_title_exact | 6 |
| duplicate_title_same_tokens | 7 |
| superlative_from_the_family_own_intent | 60 |
| uniqueness_reason_shared_with_another_candidate | 98 |
| templates_with_repeated_entities | 0 |
| orphan_pages | 62 |
| top_level_pages_whose_parent_is_the_locale_home | 0 |
| intent_owners_claimed_by_more_than_one_url | 0 |
| urls_sharing_a_cannibalization_key | 0 |
| locale_mismatch_between_url_and_row | 0 |
| entity_names_needing_a_disambiguator_in_the_title | 130 |
| same_entity_id_under_two_names | 0 |
| candidates_with_no_usable_source | 0 |
| kept_rows_with_a_rejecting_localisation_class | 0 |
| urls_that_collide_once_diacritics_are_folded | 0 |
| urls_containing_a_latin_character_with_a_diacritic | 0 |
| duplicate_canonicals | 0 |
| duplicate_meta_within_a_market | 0 |
| duplicate_h1_within_a_market | 0 |
| declared_parent_is_not_a_valid_parent | 0 |
| declared_parent_is_valid_but_not_a_path_prefix | 20,403 |
| family_locale_cells_failing_the_usefulness_test | 0 |

- A per-page target query is not recorded in the manifest, so a query-level competition test cannot be run from it. The three keyword fields it does carry are family-level: they name the measurement that proved the family in a market, not the page target.

- title length: min 13, max 192, mean 67.8

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

208,841 candidates survive the gates. The target is 1,000,000.

The gap is not a shortage of raw rows. It is the gates, and each one was added for a reason that a measurement or a SERP showed:

- An area page needs the area to be a NAMED entity. Requiring a polygon, a population, a Wikidata item or a Wikipedia article cut the usable place set by about two thirds. The Kreuzberg probe validated neighbourhood demand for a famous area and says nothing about an unnamed suburb.
- A POI belongs to exactly one area. Letting every covering extent claim it produced four times as many area pages, and they would have been near-duplicate lists of the same venues on adjacent neighbourhood pages.
- Modifier pages are gated on city size, because every measured keyword for them named a large city.
- An area page needs its parent city page to exist, or it is an orphan by construction.
- Individual entity pages are allowed only where a third party can rank. The SERP for a named hospital, university or station belongs to that institution.

Raising the number to one million from here would mean removing one of those gates. Each one is written down with the measurement behind it so that decision can be made deliberately rather than by accident, and so it can be reversed if a later measurement disagrees. What this pass will not do is reach the number by generating pages the measurements say nobody searches for.


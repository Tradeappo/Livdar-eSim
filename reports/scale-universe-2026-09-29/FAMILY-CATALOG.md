# Family catalog

Generated from `scripts/atlas/scale/family-catalog.mjs` by
`scripts/atlas/scale/write-catalog-reports.mjs`. Every family carries the six proofs
the brief requires, answered per family rather than asserted once, plus the
measured demand where demand was measured.

| Gate | Families | Valid | Blocked | Rejected |
| --- | --- | --- | --- | --- |
| SAFE_TO_SCALE | 8 | 595 | 0 | 0 |
| SCALE_WITH_GATES | 6 | 1196 | 1089 | 0 |
| EXPERIMENT_ONLY | 2 | 9786 | 0 | 0 |
| HIGH_RISK | 2 | 2398 | 0 | 0 |
| REJECT | 9 | 0 | 2845 | 190677 |

## SAFE_TO_SCALE

### `calendar.week-numbers`

- Surface: tools | Page type: `week-number-lookup` | Entity: market
- Gate: **SAFE_TO_SCALE** | Source: `computed` | Availability: held | Licence: no licence needed
- Language rule: measured | Time rule: none
- Monetization: low | Internal linking: medium
- Unique data fields (3, minimum 3): current week; full year week table; ISO 8601 rule for that locale
- Enumerated: 5 valid, 0 blocked, 0 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured: kalenderwoche 44,785, weeknummer 32,475, numero de semaine 16,023, week number 4,221.
- *Distinct data*: A live answer plus a table.
- *Distinct user value*: A fact people need repeatedly.
- *Distinct SERP justification*: PARTIALLY VALIDATED. One competitor page earns 93,469 from this family with 731 keywords.
- *Distinct canonical purpose*: Yes, one per market.
- *No cannibalisation*: No live equivalent.

**Gate reason**: undefined

### `pulse.country-holidays`

- Surface: pulse | Page type: `country-holiday-calendar` | Entity: country
- Gate: **SAFE_TO_SCALE** | Source: `events-verified` | Availability: held | Licence: ODbL 1.0, share-alike, attribution required
- Language rule: own+en+neighbours | Time rule: none
- Monetization: low | Internal linking: high
- Unique data fields (4, minimum 4): dated holiday list; regional variation; legislated nationally flag; localised names
- Enumerated: 111 valid, 0 blocked, 0 rejected, 5 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured: feiertage Deutschland 3,863, feiertage Frankreich 1,102, jours feries France 1,322.
- *Distinct data*: A different dated list per country, with different regional variation.
- *Distinct user value*: The dates somebody needs.
- *Distinct SERP justification*: VALIDATED in 5 markets. A DR 0 page holds position 8 in Poland, DR 6 holds position 10 in the Netherlands.
- *Distinct canonical purpose*: Yes.
- *No cannibalisation*: 27 already live. New candidates exclude the live set.

**Gate reason**: undefined

### `pulse.long-weekends`

- Surface: pulse | Page type: `long-weekend-and-bridge-day-planner` | Entity: country
- Gate: **SAFE_TO_SCALE** | Source: `events-verified` | Availability: held | Licence: ODbL 1.0, share-alike, attribution required
- Language rule: own | Time rule: year
- Monetization: medium | Internal linking: high
- Unique data fields (4, minimum 4): bridge day combinations; leave days needed; total days off; weekday alignment
- Enumerated: 76 valid, 0 blocked, 0 rejected, 2 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured: brueckentage 2027 3,963 at KD 0, ponts 2027 688, dlugie weekendy 2027 739.
- *Distinct data*: The combinations are specific to the year because weekday alignment changes.
- *Distinct user value*: A calculation, not a lookup. This is the part an AI Overview cannot finish in one line.
- *Distinct SERP justification*: VALIDATED for de.
- *Distinct canonical purpose*: Yes, per country per year.
- *No cannibalisation*: No live equivalent.

**Gate reason**: undefined

### `pulse.subdivision-holidays`

- Surface: pulse | Page type: `subdivision-holiday-calendar` | Entity: subdivision
- Gate: **SAFE_TO_SCALE** | Source: `events-verified` | Availability: held | Licence: ODbL 1.0, share-alike, attribution required
- Language rule: own+en | Time rule: none
- Monetization: low | Internal linking: high
- Unique data fields (3, minimum 3): region-specific dated list; which national days it omits; which days are unique to it
- Enumerated: 144 valid, 0 blocked, 0 rejected, 46 merged as duplicates
- Note: Swiss cantons measured 37 to 86 and are demand-gated out despite having data. German states are the family; Swiss cantons are not.

**The six proofs**

- *Distinct search intent*: Measured and strong: feiertage Bayern 2026 is 24,385, Niedersachsen 11,934, Sachsen 11,065, Berlin 10,012, Hessen 8,626, all KD 0 to 2.
- *Distinct data*: Genuinely different dates. In Germany every public holiday is state law.
- *Distinct user value*: The answer differs from the national page, which is the whole point.
- *Distinct SERP justification*: VALIDATED. absentify holds positions 5 to 9 on these with 0 to 2 referring domains.
- *Distinct canonical purpose*: Yes. Measured: the 16 German state pages out-earn the country index 10.5 to 1 on a competitor.
- *No cannibalisation*: 28 live. Excluded.

**Gate reason**: undefined

### `pulse.today`

- Surface: pulse | Page type: `what-is-today` | Entity: market
- Gate: **SAFE_TO_SCALE** | Source: `events-verified` | Availability: held | Licence: ODbL 1.0, share-alike, attribution required
- Language rule: measured | Time rule: none
- Monetization: low | Internal linking: high
- Unique data fields (4, minimum 3): today holiday status; next holiday; days until; name day where the market has them
- Enumerated: 5 valid, 0 blocked, 0 rejected, 0 merged as duplicates
- Note: One URL per market, nine at most. The temptation to make one per date is the clearest thin-content trap in this catalog and is rejected: /today/2026-09-29/ would be 3,285 near-identical pages a decade.

**The six proofs**

- *Distinct search intent*: Measured and very large: is today a holiday 137,005 at KD 0 in en, jakie jest dzisiaj swieto 9,938 in pl, ist heute ein feiertag 2,531 in de.
- *Distinct data*: The answer changes daily, which no other family here does.
- *Distinct user value*: A single fact somebody needs right now.
- *Distinct SERP justification*: VALIDATED. One competitor URL earns 59,419 with 716 keywords, the highest traffic per page found anywhere in this research.
- *Distinct canonical purpose*: Yes, one per market. Never per day.
- *No cannibalisation*: No live equivalent.

**Gate reason**: undefined

### `tools.calculator`

- Surface: tools | Page type: `interactive-calculator` | Entity: tool
- Gate: **SAFE_TO_SCALE** | Source: `computed` | Availability: held | Licence: computed from held sources
- Language rule: measured | Time rule: none
- Monetization: high | Internal linking: high
- Unique data fields (4, minimum 4): inputs; computation; result explanation; the data it computes against
- Enumerated: 70 valid, 0 blocked, 0 rejected, 0 merged as duplicates
- Note: The one family where 14 tools x 9 markets is 126 candidates and every one of them is defensible. Small, and worth more per page than anything else here.

**The six proofs**

- *Distinct search intent*: Measured and the highest commercial intent in the programme: salary calculator 143,332, rent affordability calculator 3,055 at KD 0, moving cost calculator 2,408 with a 500 cent CPC.
- *Distinct data*: A function, not a table. The output changes with the user input, which no other family here does.
- *Distinct user value*: Highest in the catalog.
- *Distinct SERP justification*: PARTIALLY VALIDATED. salary calculator is KD 69 and contested; rent affordability is KD 0.
- *Distinct canonical purpose*: Yes, one per tool per market.
- *No cannibalisation*: 32 live tool pages. Excluded.

**Gate reason**: undefined

### `work.country-salaries`

- Surface: work | Page type: `country-salary-report` | Entity: country
- Gate: **SAFE_TO_SCALE** | Source: `salary-data-verified` | Availability: held | Licence: Eurostat reuse policy, commercial reuse permitted
- Language rule: own+en+major | Time rule: none
- Monetization: medium | Internal linking: high
- Unique data fields (4, minimum 4): gross monthly; net estimate; by sector where Eurostat has it; purchasing power context
- Enumerated: 108 valid, 0 blocked, 0 rejected, 37 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured and large: salaire moyen France 31,061, durchschnittsgehalt Deutschland 30,741, gemiddeld salaris nederland 9,475.
- *Distinct data*: Different figures per country.
- *Distinct user value*: The number somebody is negotiating against.
- *Distinct SERP justification*: PARTIALLY VALIDATED.
- *Distinct canonical purpose*: Yes.
- *No cannibalisation*: 58 live. Excluded.

**Gate reason**: undefined

### `work.working-time-per-year`

- Surface: work | Page type: `statutory-working-time` | Entity: country-year
- Gate: **SAFE_TO_SCALE** | Source: `events-verified` | Availability: held | Licence: ODbL 1.0 for the holiday input
- Language rule: own | Time rule: year
- Monetization: medium | Internal linking: high
- Unique data fields (4, minimum 4): working days; working hours; public holidays falling on weekdays; by month breakdown
- Enumerated: 76 valid, 0 blocked, 0 rejected, 2 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured: arbeitstage 2026 17,291 at KD 0, godziny pracy 2026 4,976, dni robocze 2027 417.
- *Distinct data*: Computed from the holiday calendar and the year weekday alignment. Changes every year.
- *Distinct user value*: A payroll and planning number.
- *Distinct SERP justification*: PARTIALLY VALIDATED.
- *Distinct canonical purpose*: Yes, per country per year.
- *No cannibalisation*: No live equivalent.

**Gate reason**: undefined

## SCALE_WITH_GATES

### `areas.city-where-to-stay`

- Surface: areas | Page type: `city-where-to-stay` | Entity: city
- Gate: **SCALE_WITH_GATES** | Source: `neighbourhood-facts-verified` | Availability: held | Licence: CC BY 4.0
- Language rule: en | Time rule: none
- Monetization: medium | Internal linking: high
- Unique data fields (4, minimum 4): named districts; distance to centre; population per district; character per district
- Enumerated: 39 valid, 0 blocked, 0 rejected, 0 merged as duplicates
- Note: The language rule bites hardest here. Nine languages would give 351 candidates; the measurement supports English only, which gives 39.

**The six proofs**

- *Distinct search intent*: Measured in English and real: where to stay in tokyo 5,410, amsterdam 3,525, lisbon 2,515, barcelona 2,413, bangkok 1,248, berlin 813.
- *Distinct data*: Named districts with verified facts, different per city.
- *Distinct user value*: High, this is a decision page.
- *Distinct SERP justification*: PARTIALLY VALIDATED.
- *Distinct canonical purpose*: Yes.
- *No cannibalisation*: 40 live. Excluded.

**Gate reason**: Strong in English and dead in the other languages measured: wo wohnen in Berlin 71, waar overnachten in amsterdam 5, ou loger a Paris 53. English only, and only the 39 cities with verified facts.

### `calendar.month`

- Surface: tools | Page type: `month-calendar` | Entity: market-year-month
- Gate: **SCALE_WITH_GATES** | Source: `computed` | Availability: held | Licence: no licence needed
- Language rule: measured | Time rule: month
- Monetization: low | Internal linking: high
- Unique data fields (4, minimum 4): month grid; holidays in that month; week numbers; printable asset
- Enumerated: 180 valid, 0 blocked, 0 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured: calendrier juillet 2027 2,027, kalender juli 2027 784, kalendarz styczen 2027 598.
- *Distinct data*: Different grid, different holidays per month.
- *Distinct user value*: A printable month.
- *Distinct SERP justification*: PARTIALLY VALIDATED. A competitor holds position 1 on calendrier septembre 2026 with zero page refdomains.
- *Distinct canonical purpose*: Yes.
- *No cannibalisation*: Parent is calendar.year. Distinct because the query names the month.

**Gate reason**: Real but an order of magnitude below the year pages. 12 per market per year is the limit; going further back or forward than measured demand is padding.

### `calendar.year`

- Surface: tools | Page type: `year-calendar` | Entity: market-year
- Gate: **SCALE_WITH_GATES** | Source: `computed` | Availability: held | Licence: no licence needed
- Language rule: measured | Time rule: year
- Monetization: low | Internal linking: high
- Unique data fields (4, minimum 4): 365 day grid; that market holidays; week numbers; printable asset
- Enumerated: 25 valid, 0 blocked, 0 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: The largest measured demand in this programme: calendrier 2026 627,451, calendar 2026 611,880, kalender 2026 333,644, kalendarz 2026 211,323.
- *Distinct data*: The grid and the holidays overlaid differ per year and per market.
- *Distinct user value*: A thing people print.
- *Distinct SERP justification*: VALIDATED for de (a DR 10 page holds position 3 on kalender 2027) and REJECTED for pl (a SERP page carries 55,463 backlinks). Market specific.
- *Distinct canonical purpose*: Yes, per market per year. Old years keep earning: a competitor 2019 page still ranks 1 with 7,828 visits.
- *No cannibalisation*: No live equivalent.

**Gate reason**: Enormous demand, but market by market: winnable in de, link-gated in pl. Validate each market SERP before adding it.

### `pulse.named-holiday-date`

- Surface: pulse | Page type: `when-is-this-holiday` | Entity: country-holiday
- Gate: **SCALE_WITH_GATES** | Source: `events-verified` | Availability: held | Licence: ODbL 1.0, share-alike, attribution required
- Language rule: own | Time rule: year
- Monetization: low | Internal linking: high
- Unique data fields (4, minimum 3): the date; which regions observe it; whether it moves; what it commemorates
- Enumerated: 792 valid, 0 blocked, 0 rejected, 414 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured and large for the major feasts: Ascension 2027 43,874, wielkanoc 2027 25,644, pasen 2027 20,647, pinksteren 2027 15,254, Christi Himmelfahrt 2027 8,507.
- *Distinct data*: The date changes every year for moving feasts, which is why the year belongs in the URL here and nowhere else.
- *Distinct user value*: A specific date somebody is planning around.
- *Distinct SERP justification*: VALIDATED for the heads.
- *Distinct canonical purpose*: Yes, per holiday per year, because the answer changes.
- *No cannibalisation*: No live equivalent.

**Gate reason**: The heads are strong and the tail is thin: most of the 551 country-holiday pairs measure under 100. Gate on measured volume per holiday, not on the family.

### `pulse.named-holiday-regions`

- Surface: pulse | Page type: `named-holiday-which-regions` | Entity: country-holiday-regional
- Gate: **SCALE_WITH_GATES** | Source: `events-verified` | Availability: held | Licence: ODbL 1.0, share-alike, attribution required
- Language rule: own | Time rule: none
- Monetization: low | Internal linking: high
- Unique data fields (3, minimum 3): the region list; which regions omit it; municipality level variation
- Enumerated: 160 valid, 0 blocked, 0 rejected, 1 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured: Fronleichnam feiertag wo 43,496 at KD 4, Heilige Drei Koenige 1,184, Allerheiligen 472, Reformationstag 397.
- *Distinct data*: A region list that differs per holiday, pivoted from data already held.
- *Distinct user value*: Answers a genuinely hard question. In Saxony and Thuringia Corpus Christi varies by municipality.
- *Distinct SERP justification*: VALIDATED for Fronleichnam: a competitor page earns 18,330 from it.
- *Distinct canonical purpose*: Yes, this is the inverse axis of the region pages.
- *No cannibalisation*: No live equivalent.

**Gate reason**: One very large page and four moderate ones. Everything else in this family measured 1 to 4. Not a 900 page family; a 5 page family.

### `transport.airport-to-city`

- Surface: getting-around | Page type: `airport-to-city-transfer` | Entity: airport
- Gate: **SCALE_WITH_GATES** | Source: `ourairports` | Availability: missing | Licence: Public Domain
- Language rule: own+en | Time rule: none | Airport types: large_airport
- Monetization: high | Internal linking: medium
- Unique data fields (5, minimum 5): airport code; coordinates; region; nearest populated place; distance to that place (NOT to the city centre)
- Enumerated: 0 valid, 1089 blocked, 0 rejected, 147 merged as duplicates
- Blocked on: an airport to city centre distance that is actually the distance to the served city centre, plus transit-fares-verified and ground-transport-verified, neither of which has a licence established

**The six proofs**

- *Distinct search intent*: High intent and specific: somebody has landed and needs to get out. Not a browse query. MEASURED 2026-09-29 and the strongest demand per page in the catalog outside holidays and tools: dublin airport to city centre 4,400 at KD 0 with 3,599 clicks, krakow 2,700 at KD 0, prague 2,200 at KD 1, budapest 2,000 at KD 2 with a 30 cent CPC, amsterdam 1,300, malaga 1,000, barcelona 900, lisbon 700. Sixteen of twenty airports measured have real volume and none exceeds KD 12.
- *Distinct data*: FAILS ON THE FIELD THAT MATTERS. scripts/atlas/ingest/ourairports.mjs computes cityKm as the distance to the nearest record in the cities dataset, not to the centre of the city the airport serves. Audited 2026-09-29: LHR 4.2 km (London centre is about 23), JFK 5.7 (about 24), IST 10.2 (about 40), CDG 5.4 (about 25). Publishing those numbers would be publishing false facts. The municipality string is also unusable in places: CDG reads "Paris (Roissy-en-France, Val-d'Oise)".
- *Distinct user value*: A different route, a different distance and a different set of options per airport.
- *Distinct SERP justification*: SAMPLED 2026-09-29 AND THE BEST RESULT IN THE PROGRAMME. On "krakow airport to city centre" (2,700) hellocracow.com holds position 7 on DR 10 with 2 referring domains and travellingwithnikki.com holds position 8 on DR 17 with 1, both pulling more traffic than DR 58 Opodo at position 9. On "dublin airport to city centre" (4,400) belfasttransfersandtours.com holds position 6 on DR 0 with 0 referring domains. Not authority gated at all. The pages that win are the ones listing modes, journey times and fares, which is exactly the data this family does not have.
- *Distinct canonical purpose*: Yes, one per airport.
- *No cannibalisation*: Livdar has no getting-around surface live. No cannibalisation.
- *Measurement note*: Measure English travel phrasings in gb, not us. The same keyword reads 20 in us and 900 in gb for Barcelona, 50 and 1,300 for Amsterdam, 10 and 700 for Lisbon. "City centre" is British spelling and a us read understates it by 10 to 65 times. A first pass in us had this family looking dead.

**Gate reason**: The gate stays, because with a correct distance and a fares source this is the strongest unbuilt family in the repo on intent and on monetization. Availability is what changed: it is blocked, not publishable. 3,001 candidates moved out of publishable_now on 2026-09-29.

## EXPERIMENT_ONLY

### `climate.city-annual`

- Surface: climate | Page type: `city-climate-profile` | Entity: city
- Gate: **EXPERIMENT_ONLY** | Source: `nasa-power-daily` | Availability: acquirable | Licence: CC BY 4.0, no restrictions on use
- Language rule: own+en | Time rule: none | City tiers: 1, 2
- Monetization: low | Internal linking: high
- Unique data fields (5, minimum 5): 12 monthly rows; annual range; wettest month; driest month; comfort window
- Enumerated: 3006 valid, 0 blocked, 0 rejected, 454 merged as duplicates

**The six proofs**

- *Distinct search intent*: One page answering "what is the climate like in X" across the year.
- *Distinct data*: Twelve months of seven measures per city.
- *Distinct user value*: A complete annual profile, which the month pages deliberately do not give.
- *Distinct SERP justification*: PARTIALLY SAMPLED 2026-09-29 AND HARDER THAN EXPECTED. "tokyo climate" is 1,900 at KD 79 and "paris climate" 600 at KD 43, against KD 0 for the month-specific head. The annual query is the one the encyclopaedias and the weather incumbents own, so the parent is the contested page and the children are the open ones.
- *Distinct canonical purpose*: Yes, and it is the canonical parent of the month pages.
- *No cannibalisation*: Competes directly with the 24 live weather.country-best-time pages where the country has one dominant city. Flagged.

**Gate reason**: Demoted from SCALE_WITH_GATES on 2026-09-29. It is still the cleanest climate page in the catalog, but "tokyo climate" at KD 79 says the annual query is contested at the head, and the family cannot be published ahead of the month pilot it is meant to parent. Tier 3 dropped for the same reason as the month tail. Revisit once the pilot has a clean GSC window.

### `climate.city-month`

- Surface: climate | Page type: `city-weather-in-month` | Entity: city
- Gate: **EXPERIMENT_ONLY** | Source: `nasa-power-daily` | Availability: acquirable | Licence: CC BY 4.0, no restrictions on use
- Language rule: own+en | Time rule: month | City tiers: 1
- Monetization: low | Internal linking: high | Pilot cap: 60 pages
- Unique data fields (8, minimum 7): tmax; tmin; tmean; precipMm; wetDays; humidity; wind; comfort band
- Enumerated: 6780 valid, 0 blocked, 0 rejected, 600 merged as duplicates

**The six proofs**

- *Distinct search intent*: A month is the query, not a modifier. "weather in Rome in May" and "in October" are different questions with different answers.
- *Distinct data*: Seven measured values change per month per city. Rome in May and Rome in October differ on every one.
- *Distinct user value*: The answer is a different set of numbers and a different verdict on whether to go.
- *Distinct SERP justification*: SAMPLED 2026-09-29 ON THREE KEYWORDS AND IT IS WEAK BUT CAPPED. Google answers the question itself: all three SERPs open with an AI Overview, a knowledge card and a four question block before the first organic result at position 4. Authority is not the barrier (lisbonguru.com DR 30 with 1 referring domain at position 7, 268 traffic) and on "weather in paris in october" nothing relevant ranks at all, the page filling with AccuWeather's Villejuif JULY page, weather.com's Le Touquet-Paris-Plage and weather-and-climate.com's Combleux and Mettray, each pulling 22 to 296. The ceiling is the problem, not the competition: 1,400 searches yield roughly 550 organic visits across seven results because the knowledge card has already answered.
- *Distinct canonical purpose*: Yes. A twelve month table on one URL cannot rank for twelve month-specific queries, which is why competitors run one page per month.
- *No cannibalisation*: Livdar has 24 live weather.country-best-time pages. Those are annual and country level; these are monthly and city level. Overlap is real at the edges and is flagged per candidate.
- *Demand*: MEASURED in us with the global figure alongside, and it collapses with city size. weather in paris in october 1,400 us and 2,600 global at KD 0, weather in rome in may 1,000 and 2,500 at KD 0, weather in reykjavik in june 40 and 80, weather in salzburg in july 20 and 50.

**Gate reason**: Tier 1 only, and still an experiment rather than a family. The data is real and free, the head keyword measures 4,273 at KD 0, and the SERP is winnable on authority but is two thirds UGC and social. Publish a 60 page pilot on the highest volume city-month pairs, wait for a clean GSC window, and let impressions per page decide whether the rest of tier 1 follows.

## HIGH_RISK

### `areas.neighbourhood-profile`

- Surface: areas | Page type: `neighbourhood-profile` | Entity: neighbourhood
- Gate: **HIGH_RISK** | Source: `neighbourhood-facts-verified` | Availability: held | Licence: CC BY 4.0
- Language rule: en | Time rule: none
- Monetization: medium | Internal linking: high
- Unique data fields (4, minimum 4): population; distance to centre; coordinates; parent city context
- Enumerated: 1403 valid, 0 blocked, 0 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: Not measured. A neighbourhood name is a real query but usually navigational or local-pack.
- *Distinct data*: Four fields per neighbourhood, which is thin for a standalone page.
- *Distinct user value*: Low on four fields alone.
- *Distinct SERP justification*: NOT SAMPLED. Likely dominated by the local pack, Google Maps and rental portals.
- *Distinct canonical purpose*: Doubtful. 1,403 neighbourhoods across 39 cities averages 36 per city; a city page listing them serves the same intent better.
- *No cannibalisation*: Would cannibalise areas.city-where-to-stay directly.

**Gate reason**: Four data fields and a name is the definition of thin. The parent city page is the better canonical. Kept in the research universe, excluded from publishable.

### `move.country-cost-of-living`

- Surface: move | Page type: `country-cost-of-living` | Entity: country
- Gate: **HIGH_RISK** | Source: `cost-of-living-verified` | Availability: held | Licence: Eurostat plus CC BY 4.0, commercial reuse permitted
- Language rule: measured | Time rule: none
- Monetization: medium | Internal linking: high
- Unique data fields (3, minimum 3): price level index; category detail where Eurostat covers it; comparison baseline
- Enumerated: 995 valid, 0 blocked, 0 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured and weak. Best in any market is lebenshaltungskosten deutschland 2,290. In pl koszty zycia Polska measures 1, in nl kosten van levensonderhoud nederland measures 1.
- *Distinct data*: A price level per country. Outside the 36 Eurostat countries there is no category detail, so the page is one index number.
- *Distinct user value*: Modest. One index and a comparison.
- *Distinct SERP justification*: NOT VALIDATED as winnable at scale.
- *Distinct canonical purpose*: Arguable. 193 of these are already live.
- *No cannibalisation*: FAILS. 193 live pages already occupy this intent.

**Gate reason**: The largest live surface by page count (38.6%) and among the weakest by measured demand. Expanding it from 193 to 199 countries x 9 languages would add 1,598 pages to the thinnest part of the site. The right move is consolidation, not expansion.

## REJECT

### `areas.persona-variants`

- Surface: areas | Page type: `best-area-for-persona` | Entity: city-persona
- Gate: **REJECT** | Source: `neighbourhood-facts-verified` | Availability: held | Licence: CC BY 4.0
- Language rule: en | Time rule: none
- Monetization: medium | Internal linking: medium
- Unique data fields (1, minimum 1): the same district list, reordered
- Enumerated: 0 valid, 0 blocked, 39 rejected, 234 merged as duplicates

**The six proofs**

- *Distinct search intent*: The personas (students, families, expats, nightlife, remote workers, luxury, budget) are real phrasings.
- *Distinct data*: FAILS. The underlying data is one district list with four fields. Reordering it per persona does not change the data.
- *Distinct user value*: Marginal. The honest version is one richer page that addresses every persona in a section.
- *Distinct SERP justification*: NOT SAMPLED, and the brief is explicit that persona variants need SERP proof before they may be split.
- *Distinct canonical purpose*: No. One page per city serves all personas better.
- *No cannibalisation*: FAILS. Seven personas per city compete with each other and with the city page.

**Gate reason**: 39 cities x 7 personas is 273 pages built from one dataset each. The brief names this pattern specifically. Consolidate into the city page instead.

### `climate.city-day`

- Surface: climate | Page type: `city-weather-on-date` | Entity: city-date
- Gate: **REJECT** | Source: `nasa-power-daily` | Availability: acquirable | Licence: CC BY 4.0
- Language rule: en | Time rule: day
- Monetization: none | Internal linking: none
- Unique data fields (1, minimum 1): daily normals
- Enumerated: 0 valid, 0 blocked, 0 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: Essentially none. Nobody searches the climate normal for 14 March.
- *Distinct data*: Technically different per day, which is exactly the trap.
- *Distinct user value*: None. A day normal is noise; the month normal is the signal.
- *Distinct SERP justification*: No.
- *Distinct canonical purpose*: No.
- *No cannibalisation*: Would bury climate.city-month under 30 near-identical siblings each.

**Gate reason**: 2,951 cities x 365 days is 1,077,115 URLs, which would hit the 1M target on its own. It is the purest example of what the brief forbids: combinatorially available, technically distinct, and worthless. Recorded to show the target was reachable by padding and that padding was refused.

### `climate.city-month-tail`

- Surface: climate | Page type: `city-weather-in-month` | Entity: city
- Gate: **REJECT** | Source: `nasa-power-daily` | Availability: acquirable | Licence: CC BY 4.0, no restrictions on use
- Language rule: own+en | Time rule: month | City tiers: 2, 3
- Monetization: none | Internal linking: none
- Unique data fields (8, minimum 7): tmax; tmin; tmean; precipMm; wetDays; humidity; wind; comfort band
- Enumerated: 0 valid, 0 blocked, 135012 rejected, 24540 merged as duplicates

**The six proofs**

- *Distinct search intent*: Identical in shape to the tier 1 intent, which is what made it tempting.
- *Distinct data*: Real. NASA POWER resolves a coordinate, not a population, so the seven fields are as genuine for Salzburg as for Paris. The data was never the problem.
- *Distinct user value*: Present but unwanted. Nobody is asking.
- *Distinct SERP justification*: Same failing SERP as the tier 1 family, without the volume that made tier 1 worth a pilot.
- *Distinct canonical purpose*: Would be defensible on the data and indefensible on the demand.
- *No cannibalisation*: Would bury the tier 1 pilot under 25 near-identical siblings per city.
- *Demand*: MEASURED AND NEGLIGIBLE. weather in salzburg in july 20 us and 50 global, weather in reykjavik in june 40 and 80, both tier 2 cities better known than most of tier 3.

**Gate reason**: 2,391 tier 2 plus 8,602 tier 3 cities x 12 months x own plus English is 180,288 candidates, which was 90.7% of the first 1M funnel run. Removed on 2026-09-29 because the two measurable questions were measured: the tail volume is 13 to 17 and the SERP is owned by AccuWeather, WeatherSpark, Reddit and Facebook. Keeping it would have been the exact pattern the brief forbids, one dataset multiplied by every entity and every month.

### `pulse.city-holidays`

- Surface: pulse | Page type: `city-holiday-calendar` | Entity: city
- Gate: **REJECT** | Source: `events-verified` | Availability: missing | Licence: ODbL 1.0
- Language rule: own | Time rule: none
- Monetization: low | Internal linking: low
- Unique data fields (0, minimum 3): none
- Enumerated: 0 valid, 0 blocked, 0 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: Plausible for cities with their own patron saint days.
- *Distinct data*: ABSENT. The holiday source resolves to country and subdivision, not city. A city page would repeat its subdivision page exactly.
- *Distinct user value*: None over the subdivision page.
- *Distinct SERP justification*: n/a
- *Distinct canonical purpose*: No. It would be a duplicate of the subdivision page with a different name in the title.
- *No cannibalisation*: FAILS outright against pulse.subdivision-holidays.

**Gate reason**: The data does not resolve to city level, so 31,715 city holiday pages would each be a copy of their region page. This is the duplicate the brief describes as swapping only the city name.

### `sport.city-activity-season`

- Surface: sport | Page type: `city-activity-seasonality` | Entity: city-activity
- Gate: **REJECT** | Source: `nasa-power-daily` | Availability: acquirable | Licence: CC BY 4.0
- Language rule: en | Time rule: none | City tiers: 1, 2, 3
- Monetization: low | Internal linking: medium
- Unique data fields (4, minimum 4): monthly suitability per activity; hard months; best window; the band that decides it
- Enumerated: 0 valid, 0 blocked, 46212 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured 2026-09-29 and the phrasing problem turned out to be secondary to the volume problem.
- *Distinct data*: Genuinely different per city and per activity. Tokyo in July suits swimming and defeats running.
- *Distinct user value*: Real: the answer differs by activity in the same city, which a general climate page cannot express.
- *Distinct SERP justification*: NOT SAMPLED, and there is no longer a reason to spend credits sampling it.
- *Distinct canonical purpose*: Yes, because city and activity together are the entity.
- *No cannibalisation*: 29 live sport pages. Excluded.
- *Demand*: MEASURED AND NEGLIGIBLE. running in tokyo 80, cycling in amsterdam 70, hiking in salzburg 20, all at KD 0 because nobody is competing for them. These are the three best cases in the family: the largest city in the world for running, the city most identified with cycling anywhere, and an alpine city for hiking. If the best cases measure 20 to 80 the tail is zero.

**Gate reason**: Demoted from EXPERIMENT_ONLY on 2026-09-29. The demand was the one thing unmeasured and measuring it ended the family: 80, 70 and 20 searches a month on the three strongest city-activity pairs that exist. The data story remains the best in the catalog, which is precisely the trap the brief describes, a real dataset with no audience.

### `sport.venue-profile`

- Surface: sport | Page type: `venue-profile` | Entity: venue
- Gate: **REJECT** | Source: `wikidata-venues` | Availability: held | Licence: CC0 1.0
- Language rule: own | Time rule: none
- Monetization: low | Internal linking: low
- Unique data fields (4, minimum 4): capacity where present; coordinates; city; venue class
- Enumerated: 0 valid, 0 blocked, 9234 rejected, 204 merged as duplicates

**The six proofs**

- *Distinct search intent*: A stadium name is a real query, usually served by the official site and Wikipedia.
- *Distinct data*: Thin: class, coordinates, sometimes capacity.
- *Distinct user value*: Low. Livdar adds nothing a venue owner or Wikipedia does not.
- *Distinct SERP justification*: NOT SAMPLED. Official sites and Wikipedia will hold it.
- *Distinct canonical purpose*: No good argument.
- *No cannibalisation*: No live equivalent, but no reason to build either.

**Gate reason**: 9,438 venues is the most tempting count in the entity graph and the weakest page in the catalog. Four fields, a competitor with the official website, and nothing Livdar knows that they do not.

### `stay.country-rent-trend`

- Surface: stay | Page type: `country-rent-trend` | Entity: country
- Gate: **REJECT** | Source: `rent-index-verified` | Availability: held | Licence: Eurostat reuse policy
- Language rule: measured | Time rule: none
- Monetization: medium | Internal linking: low
- Unique data fields (3, minimum 3): rent index series; housing cost overburden rate; change over time
- Enumerated: 0 valid, 0 blocked, 180 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: Measured and very weak. huurverhoging nederland 1, mietpreisentwicklung Deutschland 165, rent increase germany 1.
- *Distinct data*: An index series per country.
- *Distinct user value*: Low. An index without a price is hard to act on.
- *Distinct SERP justification*: NOT VALIDATED.
- *Distinct canonical purpose*: Weak.
- *No cannibalisation*: 5 live.

**Gate reason**: Measured demand does not support the family in any language tested. 165 searches a month is the best case.

### `transport.city-pair-distance`

- Surface: getting-around | Page type: `distance-between-two-cities` | Entity: city-pair
- Gate: **REJECT** | Source: `computed-distance` | Availability: held | Licence: computed
- Language rule: en | Time rule: none
- Monetization: none | Internal linking: none
- Unique data fields (1, minimum 1): great circle distance
- Enumerated: 0 valid, 0 blocked, 0 rejected, 0 merged as duplicates

**The six proofs**

- *Distinct search intent*: Real but thin, and served instantly by Google itself.
- *Distinct data*: One number per pair.
- *Distinct user value*: None beyond the number, which the SERP already shows without a click.
- *Distinct SERP justification*: Google answers it in the results.
- *Distinct canonical purpose*: No.
- *No cannibalisation*: n/a

**Gate reason**: 31,715 cities pairwise is 502 million combinations. Even restricted to tier 1 it is 156,520. One computed number per page, answered by Google directly. The second clearest padding route, also refused.

### `work.city-salary-by-role`

- Surface: work | Page type: `city-role-salary` | Entity: city-role
- Gate: **REJECT** | Source: `null` | Availability: missing | Licence: no source held
- Language rule: own+en | Time rule: none | City tiers: 1
- Monetization: high | Internal linking: high
- Unique data fields (4, minimum 4): role median; city adjustment; seniority bands; sample size
- Enumerated: 0 valid, 2845 blocked, 0 rejected, 230 merged as duplicates
- Blocked on: city and role level salary data, proprietary, no open equivalent found

**The six proofs**

- *Distinct search intent*: Plausibly large. Not measured.
- *Distinct data*: Would differ per city and per role, if a source existed.
- *Distinct user value*: High, this is what a job seeker actually wants.
- *Distinct SERP justification*: NOT SAMPLED. Glassdoor, Levels.fyi and StepStone own this space with proprietary data.
- *Distinct canonical purpose*: Yes if built.
- *No cannibalisation*: Would compete with the live country salary pages at the edges.

**Gate reason**: No lawful source for city and role level salary data. The incumbents own it because they collect it themselves. Listed so the gap is quantified, not so it is built.

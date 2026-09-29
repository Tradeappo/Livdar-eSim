# Rejected families

Nine families, 190,677 enumerated rows, none of them counted toward the valid universe and none of them
publication-ready under any condition. They are kept because a rejection with its
reasoning attached is worth more than a deletion, and because two of them are the
routes that would have hit the 1,000,000 target by padding.

| Family | Rows refused | One line reason |
| --- | --- | --- |
| `areas.persona-variants` | 39 | 39 cities x 7 personas is 273 pages built from one dataset each. |
| `climate.city-day` | 0 | 2,951 cities x 365 days is 1,077,115 URLs, which would hit the 1M target on its own. |
| `climate.city-month-tail` | 135,012 | 2,391 tier 2 plus 8,602 tier 3 cities x 12 months x own plus English is 180,288 candidates, which was 90.7% of the first 1M funnel run. |
| `pulse.city-holidays` | 0 | The data does not resolve to city level, so 31,715 city holiday pages would each be a copy of their region page. |
| `sport.city-activity-season` | 46,212 | Demoted from EXPERIMENT_ONLY on 2026-09-29. |
| `sport.venue-profile` | 9,234 | 9,438 venues is the most tempting count in the entity graph and the weakest page in the catalog. |
| `stay.country-rent-trend` | 180 | Measured demand does not support the family in any language tested. |
| `transport.city-pair-distance` | 0 | 31,715 cities pairwise is 502 million combinations. |
| `work.city-salary-by-role` | 0 | No lawful source for city and role level salary data. |

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

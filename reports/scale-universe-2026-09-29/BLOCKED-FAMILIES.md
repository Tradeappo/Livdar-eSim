# Blocked families

Families whose gate would allow publication but whose data is not held and not
freely acquirable. They are the subject of DATA-SOURCE-GAPS.md, which ranks them
by leverage. Their candidates are counted in their own bucket, never as valid and
never as publishable.

| Family | Rows blocked | Gate | Blocked on |
| --- | --- | --- | --- |
| `transport.airport-to-city` | 1,089 | SCALE_WITH_GATES | an airport to city centre distance that is actually the distance to the served city centre, plus transit-fares-verified and ground-transport-verified, neither of which has a licence established |
| `pulse.city-holidays` | 0 | REJECT | no source held |
| `work.city-salary-by-role` | 2,845 | REJECT | city and role level salary data, proprietary, no open equivalent found |

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

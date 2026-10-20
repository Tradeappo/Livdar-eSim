# Transport model

Transport is 147,287 rows of the 1,002,362 (14.7%) in eight families, and it is also where
the inventory's largest correction happened. Read section 2 before changing anything here.

| family | rows | entity | source |
|---|---:|---|---|
| `transport.city-pair-transit` | 125,652 | settlement pair served by public transport | GTFS timetables via the Mobility Database, open licences only |
| `transport.city-pair-rail` | 10,870 | city pair on the rail graph | Wikidata P197 adjacent stations (CC0), plus held national timetables (Renfe) |
| `transport.city-getting-around` | 3,632 | one city | GTFS agencies and modes |
| `transport.route-from-market` | 3,148 | a route from the market's country | |
| `transport.city-pair-air` | 2,623 | city pair with a scheduled air route | OpenFlights routes + OurAirports (public domain) |
| `transport.station-departures` | 964 | a hub station | GTFS stop departures |
| `transport.airport-city-access` | 385 | airport to its city | OurAirports + gazetteer |
| `transport.airport-parking` | 13 | airport | OSM parking + OurAirports |

Builders: `scripts/atlas/scale/gtfs-pair-candidates.py`, `gtfs-hub-candidates.py`,
`rail-pair-candidates.py`, `transport-pair-candidates.py`, `airport-parking-candidates.py`,
`transport-visa-manifest-adapter.py` (air, airport access and visa cells into manifest rows).
Captures: `scripts/atlas/ingest/gtfs-feed-registry.py`, `transport-licence-register.py`,
`gtfs-harvest.py` (city feeds), `gtfs-national-harvest.py` (national feeds),
`wikidata-rail-graph.py`, `transport-graph.py`, `ourairports.mjs`. Data:
`data/atlas/sources/transport/`.

## 1. The unit: settlements, never stops

**Rule from the brief:** "Do not use stop-to-stop transport noise. Transport units must
remain meaningful settlement-to-settlement or significant heterogeneous nodes."

A stop is resolved to a settlement as `stops.txt` is read: the nearest gazetteer city of at
least `MIN_CITY_POP = 1000` within `STOP_TO_CITY_KM = 25`; a stop further than that belongs to
none. Pairs are then aggregated on the SETTLEMENT, so every stop of Colchester folds into
Colchester. Bounds in `gtfs-pair-candidates.py`:

| constant | value | why |
|---|---|---|
| `STOP_TO_CITY_KM` | 25.0 | a stop further from any settlement is attributed to none |
| `MIN_CITY_POP` | 1,000 | below this a gazetteer row is a hamlet, not a destination |
| `MIN_CITY_SEPARATION_KM` | 5.0 | closer, and the "pair" is a city and its own suburb |
| `MIN_DIRECT_TRIPS` | 10 | a handful of trips is a timetable quirk, not a service |
| `MAX_STOPS_PER_TRIP_SETTLEMENTS` (national harvest) | 60 | a trip touching more settlements is a data artefact |

## 2. The correction that defines this model (2026-10-10)

`TRANSIT-UNIT-CORRECTION-2026-10-10.md`. `transport.city-pair-transit` was **510,592 of
972,910** FINAL pages, 52.5% of the inventory, and it was keyed on the wrong unit:
`gtfs-pair-candidates.py` aggregated on `a_id`, which for a major-node stop was `stn:<stop id>`
rather than the settlement. Pages paired one bus stop with fifteen of its neighbours
(`/en/transport/public-transport/bromley-road-colchester-to-walton-road-playing-fields-frinton-on-sea/`).
Of 593,057 candidate rows: 40.2% had both ends a station node, 40.0% one end, 19.8% both
settlements. Corrected, the family went **510,592 → 125,652** and FINAL **972,910 → 586,511**.
No gate was relaxed to recover it.

## 3. Admission: two classes

From `gtfs-pair-candidates.py`, the project's accepted model:

- **A: ENTITY_DEMAND_PROVEN.** This pair's own query was measured with volume.
- **B: FAMILY_INTENT_PROVEN + ENTITY_UTILITY_PROVEN.** The pair FAMILY intent is proven (the
  2026-10-07 open-SERP harvest returned 891 of 1,000 pair rows at keyword difficulty ≤ 10,
  median 0). Each pair must then prove utility on its own facts by clearing **3 of 5** signals:

| signal | threshold |
|---|---|
| named routes | the page can name the services that run it |
| frequent service | `CLASS_B_MIN_TRIPS = 30` direct trips or more |
| multi-mode or multi-feed | corroborated by more than one route type or agency |
| a real distance | `CLASS_B_MIN_KM = 20` km or more apart (intercity, not one conurbation) |
| a substantial journey | `CLASS_B_MIN_DURATION_S = 900` (15 minutes) or more scheduled |

A pair clearing fewer than three is "a template with two place names in it" and is refused.

## 4. Direction and reverse pairs

City feeds are emitted undirected. A national file declaring `pairs_are_directed` is read
directed; otherwise its rows are read on a canonical (sorted) key, because reading an
undirected row as directed would assert a direction the file never stated.

**A directed pair earns its own page only if it says something its reverse does not.** Where
both directions have the same median journey time to the minute, the same number of trips,
the same named routes and the same separation, they are a semantic duplicate: only the
better-evidenced direction survives (more trips; ties broken on the node id so the choice is
stable across runs). Counted as `rejected_direction_is_a_semantic_duplicate_of_its_reverse`.

## 5. Language and cross-border

One page per pair, in one locale, chosen by where the pair is: the pair's own country's
language where both endpoints are in that country and its pair form was measured; English
otherwise. **Domestic only for native locale**: a Copenhagen-Hamburg page has real Danish
demand ("tog fra koebenhavn til hamborg" 300) but is also about a German city, so cross-border
pairs stay in English and face the localisation gate.

**The Netherlands, refused domestically** (`PAIR_DOMESTIC_REFUSED`): the Dutch pair form read at a
floor of 40 found demand is international out of the Netherlands ("trein van amsterdam naar
londen" 400) while the held feed is domestic. Domestic Dutch pairs are refused (7,028 had been
standing against the measurement); cross-border journeys out of NL are kept. Pair viability
tracks country geography, not language: Denmark and Norway are long and thin with real domestic
pair demand.

`REJECTED_SAME_JOURNEY_BETTER_EVIDENCED` (399 rows) keeps one page per journey across sources.

## 6. Rail and air

**Rail** (`rail-pair-candidates.py`): the graph is Wikidata P197 adjacent-station statements
(CC0), and it is PARTIAL (115,459 stations, 95,724 adjacency statements, mean degree 1.66), so
every count is a floor. Bounds: both cities ≥ 50,000 people, straight line 25 to 800 km, at most
12 city hops. A page may state the two cities, the end stations, the straight-line distance, the
hop count and the intermediate cities, and **may not** state departure times, duration, fares,
operators or availability, none of which the source carries.

**Air**: OpenFlights routes and airports, OurAirports (public domain). The transport graph
holds 7,312 nodes (4,133 airports, 3,179 cities) and 21,480 edges.

## 7. Licences: the GTFS register

`reports/livdar-expiry-freeze-2026-09-30/TRANSPORT-SOURCE-REGISTER.csv`, 1,738 Mobility
Database feeds, each with its licence URL, family, share-alike, attribution and commercial
reuse read:

| verdict | feeds | |
|---|---:|---|
| `ALLOW` | 115 | an open licence was read and permits derived, indexed pages |
| `HOLD` | 1,623 | 1,002 state no licence at all; 184 require authentication; others have bespoke or unread terms |

Licence families admitted: UK OGL v3, CC BY 4.0, CC0 1.0 (including Trafiklab), Licence
Ouverte 2.0 (Etalab), Datenlizenz Deutschland Namensnennung 2.0, ODbL 1.0, Licence Quebec.
The licence-clear but key-gated sets are the cheapest growth: Spain NAP (111 feeds, MITRAMS open
data licence) and Trafiklab Sweden (59 feeds), both held only for API key registration.

## 8. Memory

National feeds are large enough to OOM a naive build. `gtfs-national-harvest.py` collapses to
settlements FIRST: the gazetteer is loaded once, every stop resolves as `stops.txt` is read, and
`stop_times` is streamed trip by trip and reduced to a settlement pair dict, which prints its size
every `PAIR_DICT_WARN = 2,000,000` entries so a growing OOM is diagnosable. The earlier
stop-keyed aggregate grew about 600 MB per 100 seconds against a 15 GB cgroup.

## 9. What not to do

- Do not key anything on a stop id.
- Do not generate a pair that nothing connects (no Cartesian products, no "every city to every
  city").
- Do not state times, durations, fares or operators a source does not carry.
- Do not admit a feed whose licence was not read and recorded in the register.
- Do not localise a cross-border pair as native to either country.

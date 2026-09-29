# Entity graph

Regenerate with `node scripts/atlas/scale/entity-graph.mjs`. Rows live in
`entity-graph.jsonl.gz`; counts are in `ENTITY-GRAPH-summary.json`. The graph is
reusable: it is keyed by entity, not by page, so a new family reads it rather than
rebuilding it.

## Availability model

Each entity carries, per data domain, one of three states. The distinction matters
because two of them look identical from a page-count point of view and are wholly
different projects.

- **held**: the data is in the repo now.
- **acquirable**: the source is lawful, reachable and free, and the data has not
  been fetched. A fetch task, not a licensing problem.
- **missing**: no source this project may use covers it.

## Counts

| Entity class | Count | Notes |
| --- | --- | --- |
| Countries | 249 | 36 with holidays held |
| Subdivisions, named | 69 | The German states are the valuable layer |
| Cities | 31,715 | All with coordinates |
| Cities, tier 1 | 560 | Largest. The only tier where climate demand measures above noise |
| Cities, tier 2 | 2,391 | Measured at 20 to 40 searches for city-month weather |
| Cities, tier 3 | 8,602 | Unmeasured, inferred lower |
| Cities, tier 4 | 20,162 | Under roughly 50,000 people. Excluded from every family |
| Cities with climate held | 55 | |
| Cities with climate acquirable | 31,660 | NASA POWER resolves any coordinate |
| Cities with neighbourhoods | 39 | The hard cap on the Areas surface |
| Neighbourhoods | 1,403 | Four fields each |
| Airports | 3,244 | |
| Airports, large | 1,149 | The only class with measured transfer demand |
| Airports with a matched city | 3,001 | See the caveat below |
| Venues | 9,438 across 16 countries | Wikidata, CC0, and rejected on page quality |

## The caveat that matters most

`airports_with_city_distance: 3001` is true and misleading, and the family catalog
now says so where it counts. The `cityKm` field is the distance to the **nearest
record in the cities dataset**, not to the centre of the city the airport serves.
Audited on 2026-09-29: LHR reads 4.2 km where central London is about 23, JFK 5.7
where Manhattan is about 24, IST 10.2 where Istanbul is about 40, CDG 5.4 where
Paris is about 25. The ingest script now carries a note saying so, and the airport
family's availability was changed from `held` to `missing` as a result, moving
3,001 candidates out of the publishable set.

The same class of problem appears in the municipality strings: OurAirports
disambiguates, so CDG's municipality is `Paris (Roissy-en-France, Val-d'Oise)`.
Pasted into a keyword template that produces a phrase no human would type, so the
generator now skips any airport whose municipality contains brackets.

Both are recorded here because an entity graph that reports a field count without
reporting what the field means is how a programmatic project ends up publishing
false facts at scale.

## Entity classes evaluated and not built

Regions beyond the 69 named subdivisions, districts, business districts, transport
nodes, universities, schools, hospitals, stations, beaches, parks, coworking
spaces, gyms, shopping areas, nightlife zones, residential zones and tourist
zones. Every one of them was considered. None has a source this project may
lawfully use at scale, which is recorded per domain in DATA-SOURCE-CATALOG.md.
This is the structural reason the universe does not reach 1,000,000: the entity
classes that would supply the volume are precisely the ones with no usable source.

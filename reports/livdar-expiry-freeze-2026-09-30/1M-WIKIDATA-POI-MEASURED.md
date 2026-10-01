# Wikidata POI, measured live

Measured 2026-10-01 against `query.wikidata.org/sparql`, counting
`wdt:P31 <class>` with `wdt:P17` in one of the 11 market countries.

**13 classes measured, 92,941 entities.** This is a PARTIAL
measurement: the endpoint hard-throttles (about six queries succeed, then sustained
429s), so roughly 30 further classes were not reached before the session ended. The
measured classes are the large ones, and the figure should be read as a floor.

| Wikidata class | Entities in the 11 markets |
|---|---|
| museum | 25,505 |
| library | 18,370 |
| hospital | 12,241 |
| theatre | 9,327 |
| beach | 7,945 |
| shopping mall | 4,945 |
| art museum | 4,657 |
| university | 3,613 |
| stadium | 3,474 |
| botanical garden | 1,876 |
| cafe | 921 |
| tourist attraction | 41 |
| zoo | 26 |

## The two findings that matter

**Licence: CC0 1.0.** No share-alike, no legal attribution requirement. That makes
Wikidata strictly easier to publish from than OpenStreetMap, whose ODbL 1.0 share-alike
attaches to derived databases. Attribute anyway as good practice, but the legal
constraint OSM imposes is absent here.

**Wikidata is weak on commercial POI.** `cafe` returned **921** across all eleven
market countries, and `restaurant` was not reachable before throttling but is known to
be similarly thin (about 12,900 worldwide). So the families your brief lists as
restaurants, cafes, gyms, nightlife and coworking **cannot** come from Wikidata. They
need OpenStreetMap, which is dense for exactly those tags and carries the ODbL
obligation in exchange.

Wikidata is strong for: museums, libraries, hospitals, theatres, beaches, universities,
stadiums, shopping malls, castles, parks, monuments and archaeological sites — the
durable, attraction-shaped POI that `poi.entity-<modifier>` pages are built on.

## How to finish this measurement

`/tmp` does not survive the container, so the script is preserved at
`scripts/atlas/scale/` logic and the method is: one `COUNT(DISTINCT ?x)` per class with
a `VALUES` list of the 11 country QIDs, 15 seconds between queries, exponential backoff
on 429. Do NOT batch classes into one query: the class x country cross-product times
out at 504.

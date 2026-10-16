# Seven candidate page models, measured against the data that is actually on disk

Written 2026-10-16, answering the instruction to change the page model rather than force more
rows through the existing families, and to let REAL UTILITY qualify a page where measured
keyword demand does not exist.

Each model below carries the seven things the brief asked for: raw supply, the user intention,
the source and its licence, a family-specific substance contract, the duplicate protection, the
conservative yield after gates, and a verdict. Every supply number is counted from the files in
this repository, not estimated.

**The headline is in two halves, and the first half is a defect rather than an opportunity.**
Measuring the largest candidate model found that 30,847 rows ALREADY IN the inventory are
duplicates of each other. That is dealt with first, because growing a surface with a known
duplication defect in it is worse than not growing it.

---

## 0. The defect: 22,577 climate pages are city-name swaps

NASA POWER climatology is a GRIDDED product. Its point endpoint answers for the grid cell
containing the coordinate, about half a degree across, roughly 55km. Every city inside a cell
gets byte-identical normals.

Measured over the 64,418 cities captured: **21,260 distinct twelve-month vectors**, and 53,277
cities share theirs with at least one other city. Paris carries the same numbers as 173 other
communes. Shenzhen as 219 other places. Milan as 146.

In the 2026-10-16 manifest, of 50,118 `weather.city-month` rows:

| | |
|---|---|
| rows sharing their whole twelve-month table with another city in the SAME language | **30,847** |
| groups those rows fall into | 8,270 |
| groups where `locale_facts` are ALSO byte-identical, so only the city name differs | **6,260** |
| of those rows labelled `duplicate_risk: LOW` | all 30,847 |
| rows dropped by keeping one city per (language, grid cell) | **22,577** |

Applied, the gate rejected **31,555** candidate rows, which is more than 22,577 because it also
covers `weather.city-best-time` and because it runs before the localisation gate, so it removes
rows that a later gate would have dropped anyway. The net effect on FINAL is **23,453**.

Eighty New Jersey towns had eighty pages with one set of numbers. Seventy-one Paris suburbs had
seventy-one French pages with one set of numbers.

The project's own duplicate detection could not see this, and the reason is worth recording:
`data_signature` includes the city's identity, so every one of the 8,270 groups has a distinct
signature. **A signature that contains the thing being compared cannot detect a duplicate.**

Fixed by `REJECTED_SAME_CLIMATE_GRID_CELL`: one climate page per (language, surface, family,
grid cell), kept for the cell's most populous city, with the surviving page now stating that
its normals are a grid reading covering N named places rather than a station in that town. The
grouping is `data/atlas/sources/climate/city-grid-cells.json`, keyed on a hash of the
twelve-month vector itself, so cities are grouped when their DATA is identical rather than when
their coordinates look close.

This costs about 22,577 rows and it is not optional.

---

## 1. Climate by city, expanded on utility  - REFUSED, and this is why the ceiling did not move

**Raw supply** 64,418 cities with real normals. **Intention** what is the weather in X, and what
does that mean for a trip. **Source** NASA POWER, public domain, attribution requested.
**Substance** a twelve-month table of seven measured parameters.

This looked like the model that changes everything: 64,418 cities against roughly 4,200 city
and market cells built. It is not, because of section 0. The honest supply is **21,260 distinct
measurements**, not 64,418 places, and about 4,200 of those cells are already taken. The
remaining cells are overwhelmingly rural grid squares whose principal city is a village.

**Conservative yield: negative.** The model as it stands is a net reduction.

## 2. Airports  - BUILDABLE, SMALL

**Raw supply** 86,215 OurAirports rows: 42,800 small, 23,237 heliports, 13,562 closed, 4,105
medium, 1,275 seaplane bases, 1,175 large. **With three or more identifying facts and a named
municipality: 16,265. With scheduled service: 4,134.** 9,051 carry an IATA code.

**Intention** which airport serves this city, where is it, what are its codes, how far from the
centre. **Source** OurAirports, public domain, updated daily, already on disk. **Substance**
IATA or ICAO, elevation, the municipality served, scheduled-service status, official site, and
a great-circle distance to the city it serves, labelled as arithmetic.

**What it must NOT say.** No route or duration claims. `FLIGHT-ROUTE-SOURCE-SCOPING-2026-10-06.md`
settled that: OpenFlights routes are a 2014 snapshot, the TU Delft set is 2019, and "there is a
direct flight" is a claim with a shelf life. An out-of-date fact asserted confidently is worse
than no fact.

**Duplicate protection** one page per airport; airports sharing a municipality are separated by
their codes, which are unique by construction.

**Conservative yield after gates: about 4,100**, restricted to scheduled service, because a
closed airfield or a private heliport is not a page a traveller needs.

## 3. Stations and stops  - BUILDABLE, SMALL

**Raw supply** 131,937 OSM transport stops: 53,921 railway stations, 37,411 tram stops, 17,948
halts, 12,468 bus stations, 10,189 ferry terminals. Plus 115,459 Wikidata rail stations, heavily
overlapping. **With two or more service facts: 24,681. Of those, in a home market country:
17,563** (DE 7,088, US 3,317, PL 1,552, IT 1,404, AU 1,107).

**Intention** what this station is, who runs it, which network, whether it is step-free, which
city it serves. **Source** OpenStreetMap, ODbL, already handled by this pipeline; Wikidata CC0
for opening dates. **Substance** two or more of operator, network, reference code, accessibility,
platforms, website, plus a containment parent and the city served.

**Duplicate protection** the existing Wikidata-item dedupe covers the station's own item; tram
stops sharing a name inside one city collapse to the station, not one page per platform. This is
a page per STATION and not a stop-to-stop pair, so it does not reopen the transport pair noise.

**Conservative yield after gates: 12,000 to 15,000.**

## 4. Administrative districts  - BUILDABLE, MEDIUM

**Raw supply** 23,772 county polygons already captured in the parent layer across 34 countries,
about 8,900 of them in home-market countries. **Intention** orienting in a region: its towns,
its area, what is in it. **Source** OpenStreetMap boundaries, ODbL, on disk. **Substance** the
settlements inside the polygon, its area, its parent region, and the POI and outdoor features
already attached to it by containment. **Duplicate protection** containment is exclusive, and the
district must not simply restate its principal city's page.

**Conservative yield: about 20,000**, and it needs a family-level intent decision because the
measured list-intent evidence covers feature lists inside a region, not the region itself.

## 5. Per-POI pages: schools, hospitals, shops, restaurants  - REFUSED

**Raw supply is enormous and that is the trap.** 8,107,950 named POI: 2,765,767 shops, 820,016
restaurants, 329,079 fast food, 232,084 schools, 211,946 pharmacies, 168,844 clinics, 68,850
hospitals. With two or more practical facts: shops 219,737, restaurants 196,428, fast food
141,775, schools 8,360, hospitals 1,291.

This is the single largest supply on disk and it is the one that must stay refused. A page per
unknown restaurant or pharmacy is scaled content, it is what `poi-aggregations.py` was written to
prevent, and the existing aggregation families already harvest this supply properly as city and
area lists. The institution classes carry a second objection the project already measured: the
SERP for a named hospital, school or university is owned by that institution.

**Yield: zero, deliberately.**

## 6. Heritage registers  - PARTLY REFUSED ALREADY

**Raw supply** 379,685 England NHLE entries: 9,341 Grade I, 22,125 Grade II*, 348,219 Grade II.
The register's own provenance already records the decision: individual pages only for Grade I and
II*, because "a page for each of the 348,219 Grade II entries would be thin and would read as a
doorway". **Conservative yield: up to about 31,466 entities**, though their per-entity English
readership has not been measured and that measurement is now free to take.

## 7. First-party product entities  - SMALL BY ARITHMETIC

Device by country, carrier by country, roaming comparison by origin and destination. Each is
real utility for this business, and each is bounded: 17 markets by about 200 destinations is
3,400 cells; carriers per country is roughly 1,000. Device by country would be the large one,
but the honest cell content is the same answer repeated unless band deployment per country is
held per device, and no openly licensed source for that is on disk.

**Conservative yield: low thousands**, worth building for quality rather than for count.

---

## The arithmetic, and what it would actually take to reach a million

```
678,510   FINAL before this pass
 -23,453   climate pages that are city-name swaps   APPLIED: FINAL is now 655,057
 + 4,100   airports with scheduled service
 +13,500   stations and stops with real service facts
 +20,000   administrative districts
~670,000   everything on disk, under gates that are not weakened
```

The gap to 1,000,000 is then about **330,000**, and no source in this repository supplies it.
That is a statement about supply, not about effort: the models above were not rejected for being
hard, they were counted.

Three things would change the ceiling, and all three are acquisitions rather than engineering:

1. **A licensed property or accommodation inventory**, which is the only entity class that is
   simultaneously in the hundreds of thousands, genuinely distinct per entity, and commercially
   aligned. The listing-feed objection recorded earlier applies to individual expiring listings,
   not to durable property or hotel entities.
2. **New markets.** Each market multiplies every city family; en-US alone is 137,770 rows. The
   blocker is that a market is admitted on its own measured keyword cells, and the free
   readership signal answers whether a PLACE is sought in a language but can never answer
   whether a FAMILY has demand in a market.
3. **A current, openly licensed route-level transport source per market**, which exists for
   Australia (BITRE, CC BY 3.0 AU) and nowhere else, per the 2026-10-06 scoping.

Everything above is reported so the choice between those three is made on numbers.

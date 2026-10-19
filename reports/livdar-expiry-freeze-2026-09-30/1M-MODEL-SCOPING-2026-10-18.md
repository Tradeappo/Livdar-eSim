# Twelve model categories, measured against the files

Written 2026-10-18. Every number here comes from running something against data on disk or
from one query to an endpoint, and the command that produced it is named. Nothing in this
document is an estimate unless the line says so.

The brief asked for seven things about each model: raw supply, the user's actual intention,
the free or open source behind it, a family-specific substance contract, duplicate and
cannibalisation protection, a conservative yield after the gates, and then execution of the
ones that pay. The twelve categories are answered in that form below, but the first finding
is about the shape of the list rather than about any one entry on it.

## The finding that reorganises the list

Six of the twelve categories - stations and airports and terminals, hospitals, schools and
universities, outdoor features, buildings, public infrastructure - are not six models. They
are one model asked six times. Each is a named physical thing with coordinates, a class, an
administrative parent and a handful of attributes somebody published, and each was previously
blocked by the same thing: not demand, not utility, but the REACH OF THE SOURCE the family
happened to be built from.

The evidence is in the funnels the previous layers wrote:

| layer | source | largest single rejection | count |
|---|---|---|---|
| outdoor_feature | OpenStreetMap extracts | countries with no extract this container can reach | 34 countries captured of ~200 |
| water and protected | Wikidata, six classes | `no_home_market_and_the_destination_side_has_no_calibrated_floor` | 74,366 |
| heritage listed | one national register | the register is England only | 379,685 entries, one country |

74,366 water entities were refused for sitting outside thirteen countries. Not for being
unread. Not for being fact-poor. For being somewhere the market model did not name. That is a
ceiling of the instruments, which is exactly what the brief said to go after.

So the work went into ONE layer with ONE admission instrument covering all six categories,
rather than six pipelines: `landmark_entity`, built from fifty-eight Wikidata classes
worldwide. Its scoping is section 13 and the categories it absorbs point at it.

## 1. Transport routes, services and origin-destination entities

1. **Raw supply.** 153,932 candidate pairs and nodes from 1,300 licence-gated GTFS feeds,
   already harvested; `data/atlas/sources/transport/_gtfs-pair-candidates.jsonl.gz` and
   `_gtfs-hub-candidates.jsonl.gz`.
2. **Intention.** How long the journey takes, how many direct services run, which modes.
3. **Source.** Mobility Database GTFS, open licences only, plus transport.data.gouv.fr.
4. **Substance contract.** A real scheduled journey time and a real direct-service count read
   out of `stop_times`, attributed to the agency that published it.
5. **Duplication.** One page per unordered settlement pair; the same journey already
   timetabled is refused.
6. **Yield.** 4,217 pairs and 993 hubs are in the manifest. The axis is FULLY HARVESTED: the
   remaining supply is in feeds whose licence does not permit this use.
7. **Executed, and closed.** Route-level data at the level this model wants exists openly for
   exactly one country, Australia (BITRE, CC BY 3.0 AU). Everything else is a licence
   acquisition, not a build.

## 2. Administrative districts and neighbourhood-level utility pages

1. **Raw supply.** 22,771 county-level polygons across the captured parent layers.
2. **Intention.** What a district contains and where it is.
3. **Source.** OpenStreetMap parent polygons (ODbL) joined to the GeoNames gazetteer.
4. **Substance contract.** At least three gazetteer settlements inside the polygon and at
   least eight attached POI, so the page has members rather than a name and an area.
5. **Duplication.** The polygon id is the key; a district is not also a city page.
6. **Yield.** **1,377**, measured by running the builder, not estimated. 20,126 of the 22,771
   counties hold fewer than three gazetteer settlements. An earlier figure of ~20,000 in this
   folder was fourteen times too high and is withdrawn.
7. **Not executed.** 1,377 rows against the cost of a sixth wiring of the manifest. Queued
   behind section 13, which is eighty times larger from the same effort.

## 3. Stations, airports, ports and terminals

Absorbed by section 13: `railway_station` 74,667, `metro_station` 16,254, `airport` 12,566,
`port` 1,894 and `transport_hub` 94 are five of its fifty-eight classes, captured worldwide.
The cannibalisation risk against `transport.station-departures` is handled in the builder by
excluding any station whose country and folded name match a GTFS hub row.

Standalone airport pages were separately measured at ~1,200 home-market airports of the 4,134
with scheduled service in `data/atlas/entities/airports.json`, and are not built separately
for the same reason as section 2.

## 4. Hospitals and healthcare facilities

1. **Raw supply.** 11,162 hospitals worldwide carrying coordinates and an article in one of
   the eleven measurable editions.
2. **Intention.** Which hospital this is, how big it is, who runs it, where it stands.
3. **Source.** Wikidata (CC0), beds P6801, employees P1128, inception, operator.
4. **Substance contract.** Section 13's: two printable facts, a stated parent, a country.
5. **Duplication.** One page per Wikidata item across every surface.
6. **Yield.** Counted inside section 13's total.
7. **Executed inside section 13.** A caution carried from the 2026-10-02 SERP work: the
   institution classes' own sites own their SERPs. These rows score 46, the lowest entity
   score in the manifest, and the family is admitted as reference rather than as a bet.

## 5. Schools and universities

Same treatment: `school` 13,500, `university` 7,798, `school_building` 4,310, `private
university` 388 are four of section 13's classes, with students P2196 as the characteristic
fact. Same SERP caution, same score.

## 6. Companies, employers and job-market entities

1. **Raw supply.** 3,135 Wikidata items of class `business` with coordinates and an article.
2. **Intention.** Who the employer is, how big, where.
3. **Source.** Wikidata. There is no free per-employer wage or vacancy dataset; the paid ones
   are out of scope by instruction.
4. **Substance contract.** Would be employee count plus inception plus headquarters.
5. **Duplication.** n/a.
6. **Yield.** Low thousands at best, and the class is an ORGANISATION rather than a place: a
   page about a company is not a page a connectivity brand has any standing to write.
7. **Refused**, and `business` is in section 13's deliberately-absent list with that reason.

## 7. Beaches, parks, trails, ski areas and other outdoor entities

Already the largest built family (33,836 outdoor_feature rows) and extended twice this month:
the water and protected layer (+7,183 at the time, from 123,887 fact-bearing Wikidata
entities) and now section 13, which adds `beach` 2,818, `park` 11,238, `ski_resort` 1,531,
`glacier` 3,986, `cave` 3,595, `mountain` 47,923, `hill` 6,009 and `summit` 3,745 worldwide.

A separate measurement settles how much headroom the water layer itself still had: of its
123,887 fact-bearing entities, **14,169** clear a readership floor in SOME language, against
7,183 built. So the whole-world, any-language ceiling of that layer was roughly double what
it shipped - about +7,000, not the +70,000 its largest rejection line suggests. Most of the
difference is entities with no article anywhere (85,434) or read under ten a month (24,284).

## 8. Buildings and properties where legally sourced

1. **Raw supply.** `building` 32,820, `skyscraper` 3,920, `castle` 13,816, `church` 96,274,
   `monastery` 5,744, `cathedral` 1,421, `mosque` 3,791, `synagogue` 3,282, `temple` 1,319,
   `tower` 2,714, `lighthouse` 4,404 and more, all in section 13.
2. **Intention.** What the building is, when it was built, who designed it, what it is listed
   as.
3. **Source.** Wikidata plus the national heritage registers.
4. **Substance contract.** Section 13's.
5. **Duplication.** The cross-surface Wikidata-item exclusion; 383 castles would otherwise
   have had both an outdoors page and a heritage page, which is how that hole was found.
6. **Yield.** Inside section 13.
7. **Property LISTINGS - what a flat costs, what is for sale - remain refused.** There is no
   free licensed inventory, and this was already recorded as the single largest acquisition
   that would move the number.

## 9. Events and occurrences where licensed or open

Built and closed: the pulse families (country holidays, subdivision holidays, school
holidays, long weekends, bridge plans) are in the manifest from OpenHolidays (ODbL),
Nager.Date (MIT) and GOV.UK (OGL v3.0). Recurring cultural events have no open register with
per-event dates at a scale worth a pipeline.

## 10. Public infrastructure

`bridge` 8,364, `tunnel` 568, `dam` 5,131, `power_station` 491, `channel` 375, `shipyard` 369
and `water_tower` 1,059, all inside section 13, with height, length and opening year as the
characteristic facts.

## 11. First-party Livdar product entities

1. **Raw supply.** A few thousand handset models; perhaps two to four hundred with measured
   demand.
2. **Intention.** Does my phone take an eSIM, and will it work there.
3. **Source.** Vendor band tables plus Wikipedia's LTE and 5G network lists (CC BY-SA).
4. **Substance contract.** The intersection of a device's bands with a country's deployed
   bands is a computed answer that differs per cell.
5. **Duplication.** Devices collapse into a small number of distinct band sets, and two
   devices with the same band set give the same answer for every country. The dedupe would
   be on the band-set signature, exactly as the climate layer now dedupes on the grid cell.
6. **Yield.** `openserp-device-esim-en.json` already measured this as the highest commercial
   value family in the entire inventory, at a cardinality of a few hundred pages.
7. **High value, low cardinality.** It is worth building for revenue and it is not a path to
   a million. Recorded here so the two are not confused.

## 12. Comparison and decision pages where the data materially differs

The honest test is whether the underlying data differs, and the climate defect found on
2026-10-17 is the cautionary case: 30,847 weather pages differed only in the city name,
because NASA POWER is a GRIDDED product whose point endpoint answers for a cell about 55km
across. 64,418 captured cities collapse to 21,260 distinct twelve-month vectors; Paris shares
its normals with 173 other communes. Those pages are now refused by
`REJECTED_SAME_CLIMATE_GRID_CELL`, at a cost of 23,453 rows.

A comparison family is admitted only where a signature over the COMPARED VALUES, not over the
names of the things compared, is distinct. That rule is now in the manifest and in section
13's row shape.

## 13. The global Wikidata landmark layer

1. **Raw supply.** **626,746** items across fifty-eight classes, each carrying coordinates and
   an article in one of the eleven Wikipedia editions whose clickstream this project holds.
   Every class was counted in a separate single query first and all fifty-eight reconcile
   against that count; `_shortfalls.json` is empty.
2. **Intention.** What this place is and what is known about it, for a reader who has just
   searched its name.
3. **Source.** Wikidata (CC0 1.0), the Wikimedia clickstream (CC0 1.0) for readership,
   GeoNames (CC BY 4.0) for the nearest settlement.
4. **Substance contract.** A row needs a stated containing administrative area, a stated
   country, and at least two PRINTABLE facts, where printable means: a quantity whose unit
   Wikidata states and which matches the one expected for that property, with exactly one
   distinct value; or a dimensionless count with exactly one distinct value; or a year taken
   from a date; or an attribute asked for by label (architect, architectural style, operator,
   material, heritage listing); or exactly one stated official website. The Eiffel Tower
   states three different heights, so its height is not printed.
5. **Duplication.** One page per Wikidata item ACROSS SURFACES, enforced in the builder
   because the manifest's own rule is keyed on (language, surface, item) and never fires
   between a new surface and an old one. One page per entity in ONE language, chosen before
   the facts were fetched so the labels could be fetched in it. A content-only
   `data_signature` that excludes the entity's own name.
6. **Yield.** See the funnel; the rest of this section is the measured result.
7. **Executed.**

### The two admission routes

- **DEMAND**: the article's measured search-referred readership in the page language is at or
  above the floor calibrated on the features this inventory already publishes.
- **UTILITY**: the article is read at or above ten a month - the clickstream's own privacy
  floor, and therefore the lowest reading that EXISTS as a measurement rather than as an
  absence - AND the entity carries at least as many printable facts as the 75th percentile of
  the rows admitted on demand in the same run, with at least one of them a quantity.

The utility bar is computed in a first pass and applied in a second, so it moves with the data
rather than being a number in the source.

### What it produced

| stage | count |
|---|---|
| items captured, 58 classes, worldwide | 626,746 |
| distinct items after folding an item's second class | 611,803 |
| no edition reads ten a month | 283,703 |
| fewer than two printable facts | 134,311 |
| below the floor and below the substance bar | 37,671 |
| another surface already pages this Wikidata item | 34,754 |
| Wikidata states no containing administrative area | 29,503 |
| no country stated, or its item carries no ISO code | 2,071 |
| the GTFS layer already builds a departure board for this station | 32 |
| **entity rows emitted** | **89,758** (87,069 demand, 2,689 utility) |
| index rows emitted, one class inside one area or near one city | 10,229, covering 67,802 members |
| surviving every manifest gate | **92,684** across 215 countries and 10 markets |

The funnel reconciles exactly: 611,803 minus the eight rejections is 89,758.

### What the two routes are each worth

The utility route is **2,689 of 89,758**, three per cent. That is the honest size of the
demand-or-utility change, and it says something worth saying plainly: the ceiling was never
the demand test. Of the 611,803 items captured, 283,703 are read by fewer than ten people a
month in every edition they have, and 134,311 carry fewer than two facts a page could print.
Those are not pages a different admission rule would rescue; they are entities with nothing
to say or nobody asking.

What actually moved the number was SOURCE REACH: fifty-eight classes instead of six, the
whole world instead of thirteen countries, and one page per entity in whichever of eleven
languages reads it most. The rows now span 215 countries where the water layer spanned 13.

Setting the utility bar at the median of the demand-admitted distribution rather than at its
75th percentile would add a further **3,643** rows. That is recorded in the funnel as
`rows_a_median_substance_bar_would_add` and is not applied: a page admitted on what it can
say should say more than the pages admitted on who reads them, not merely as much.

### The gate that had to change, and the one that did not

The localisation gate refused every destination-side row in the first run, 748 of 748 on a
partial build, under `LOCAL_INTENT_MISSING`. It asks whether a cross-language page's
DESTINATION is searched in that language, and the only answer any previous family could give
it was a keyword measured for the family in the market plus a mark on the destination city.

A landmark row answers about itself, and better: a count of people who searched, saw this
entity's article in this language, and clicked it, against a floor calibrated on the entities
already published. So the gate grew a third route that takes that evidence. It needs a floor
to exist for the language, the reading to be in the PAGE's language, and the reading to be at
or above that floor, which is why rows admitted on substance with a sub-floor reading cannot
use it: 3,876 of them are refused by this gate and stay refused.

The per-market family gate was NOT changed and it cost 3,388 rows. en-AU, es-MX and tr-TR are
admitted for the families their own measurements cover and no landmark family is among them.
Those rows were in the build until the market assignment was corrected: mapping every English
page to en-US had put a page about Melbourne in the United States market and called it
home-side. Fixing that cost 2,940 rows off the final count and is still right.

## Where the number stands

| | |
|---|---|
| FINAL before this work | 660,269 |
| FINAL after | **752,953** |
| added | +92,684 |
| short of 1,000,000 | 247,047 |

## What is left, in order of measured promise

1. **The classes nobody listed.** 626,746 items came from a class list written from memory.
   `wikidata-geo-class-census.py` counts the P31 values of every item with coordinates and an
   article, per edition, and subtracts the fifty-eight already captured. If the uncaptured
   remainder is of the same order, a second capture pass is worth roughly what the first was.
   The census times out on the largest editions and the smaller ones answer; it is the next
   thing to finish.
2. **A coarser parent for the index pages.** P131 is whatever the nearest administrative
   level happens to be, which for a German church is a Gemeinde of two thousand people. 46,564
   groups were refused for holding fewer than three members. Walking P131 up one or two levels
   would turn many of those into the page a reader actually wants.
3. **The heritage registers for the Netherlands, Poland and France.** England's 379,685
   entries yielded 5,212 rows, because only 19,561 join to a read article. The same ratio puts
   the other three in the low thousands each.
4. **Property and accommodation inventory.** Still the largest single acquisition that would
   move the number, and still unavailable free.

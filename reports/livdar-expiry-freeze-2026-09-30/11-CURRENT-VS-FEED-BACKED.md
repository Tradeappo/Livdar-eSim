# Current versus feed-backed, at six thresholds

Two scenarios, kept strictly apart. No threshold is forced to a verdict it has not
earned, and where the evidence changed between passes the later measurement wins.

**CURRENT** = what Livdar can do with the data it holds or can lawfully obtain now:
OpenStreetMap, Wikidata, public holiday and calendar data, public tax and salary
sources, climate data, and its own computation.

**FEED-BACKED** = CURRENT plus the feeds, licences and APIs the source research
recommends: a jobs feed, a licensed event feed, rental and property listing feeds,
student and shared-housing feeds, and attraction affiliate inventory.

## The layers, for both scenarios

| Layer | CURRENT | FEED-BACKED |
|---|---|---|
| Raw universe | 72,567,541 | 72,567,541 |
| Source-obtainable | 8,948,616 | 49,883,978 |
| Source-backed | 2,883,978 | 49,883,978 |
| Demand-supported | 1,656,362 | 1,656,362 |
| **Indexable** | **64,416** | **claimed 160,416, not supported - see below** |
| Publishable today | 1,791 | 1,791 |

Demand-supported is identical in both columns, and that is the point: **a feed does not
create demand.** It only unlocks pages against demand that already exists.

## The threshold table

| Threshold | CURRENT | FEED-BACKED | Why |
|---|---|---|---|
| **100,000** | **NO** | **NO** | CURRENT is 64,416, a 35,584 shortfall. The feed-backed YES claimed in round two rested on 96,000 pages from rents, jobs, events, property and WG; round three refuted or cut most of it |
| **250,000** | NO | NO | needs 185,584 more than CURRENT. No family measured has the breadth |
| **500,000** | NO | NO | 435,584 short. The v3 ladder reached 581,471 only via an 11-market multiplier that v5 measured and rejected |
| **1,000,000** | NO | NO | 935,584 short. Withdrawn in an earlier pass and not revived |
| **3,000,000** | NO | NO | exceeds source-backed in CURRENT; demand-supported fails in both |
| **10,000,000** | NO | NO | exceeds even source-obtainable |

**What is defensible: 25,000 pages.** That is the v5 verdict, it survived round three,
and it is 14× the live footprint. 50,000 is probable but unproven.

## Why the feed-backed 100,000 does not hold

Round two's 160,416 was CURRENT 64,416 plus 96,000 of feed-unlocked pages:

| Family | Round 2 | Round 3 measurement | Survives? |
|---|---|---|---|
| jobs.role-city-and-category-city | 40,000 | city tail confirmed at KD 0, breadth never exhausted | demand yes, count unproven |
| rents.city-listings | 26,000 | 223 keywords above 1,000 in de-DE, **tail exhausted** | capped far below |
| events.city-durable-window | 11,000 | breadth 400+ but mostly non-durable time windows | mostly unpublishable |
| property.city-buy | 10,000 | 350 for both patterns in de-DE, **tail exhausted** | overstated |
| stay.wg-student-furnished | 9,000 | 73 keywords, ~35 cities, **tail exhausted** | refuted |

Two of the five are hard-capped by an exhausted tail, one is refuted outright, one is
mostly unpublishable, and only jobs keeps its demand claim - without a measured ceiling.
A number built on that cannot be called YES.

One correction to CURRENT as well: `poi.entity-parking` at 3,000 pages is inside the
64,416 and round three refuted it, so a conservative CURRENT indexable figure is
**61,566**. The 64,416 is kept as the headline because it is the last fully computed
model, with this adjustment recorded rather than silently applied.

## The feeds, ranked by what they are actually worth

Not by page count - by whether the demand behind them is real and winnable.

1. **Rental listings feed - worth it, for revenue not page count.** The German tail
   sits at KD 0 to 3 with 2,300 to 15,000 volume per city, and a DR 43 site already
   takes 20,374 monthly clicks against ImmoScout24 at DR 88. Nothing about ranking
   blocks this. It will not deliver 26,000 pages.
2. **Jobs feed - strong demand, vertical cuts only.** `minijob {city}` at KD 0 with
   6,100 to 21,000 per city, `praca {city}` across Poland at KD 0, `offerte di lavoro
   {city}` across Italy. But the SERP is `LISTING_INVENTORY_REQUIRED_VERTICAL`: it
   works per vertical, not as a general job board, and `olx praca` at 236,000 shows
   what an incumbent aggregator does to a market.
3. **Attraction affiliate - monetisation only.** Already counted inside CURRENT's
   64,416 as 22,000 pages. It monetises the tickets family; it does not make it rank.
4. **Licensed event feed - lowest priority.** The durable share of event demand is
   small and the rest expires. `events.venue-event` was already measured
   `OPEN_BUT_ECONOMICALLY_DEAD`: everything below position 1 earns 72 clicks on 3,900
   volume.
5. **Student and shared-housing feeds - do not buy.** The family is ~35 cities.

## The scenario nobody costed, which may be the best one

Neither column includes the two **rules-durable** families found in the last pass, and
both need no feed at all:

- `jobs.rules-durable` (de-DE): `minijob grenze 2026` at 48,000 volume KD 5, plus
  `minijob grenze` 43,000 KD 0, `minijob 2026` 22,000, `minijob gehalt` 13,000,
  `kündigungsfrist minijob` 6,000 KD 0.
- `rents.rules-durable` (zh-Hant-TW): `租屋補助` at **269,000 volume KD 0**, with
  `查詢` 45,000, `申請` 32,000, `資格` 32,000, `試算` 12,000, `補貼` 11,000.

Both were measured before the subscription ended, and both hit the row limit:

- `jobs.rules-durable` **exceeds 400 keywords** at 500+ volume in de-DE. The rules
  portion needs no feed; roughly 150 `minijob {city}` queries in the same pull do.
- `rents.rules-durable` **exceeds 120 keywords** at 300+ volume in zh-Hant-TW, nearly
  all at KD 0 to 13, spanning sub-intent × year × city × audience × landlord questions.

Combined that is well over 500,000 monthly searches at near-zero difficulty against
public rules nobody needs to licence. **Neither tail is exhausted**, so both counts are
floors, not ceilings - the only two families in this freeze whose next measurement is
likely to revise a number *upward*.

Both also carry a calculator intent (`minijob rechner`, `租屋補助試算`) that maps onto
`tools.calculator`, already live with 133 keywords. This is where to start building.

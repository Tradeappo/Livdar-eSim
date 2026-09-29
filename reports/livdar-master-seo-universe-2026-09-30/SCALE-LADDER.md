# Scale ladder: 100k, 250k, 500k, 1M, 3M, and the 100M question

Every threshold is answered with current evidence, missing evidence, the data
requirement and the research requirement. Page counts are **distinct useful pages**,
not combinations.

Anchors from `NUMBERS.json`: raw architectural 368,474 single market and 4,053,197
across 11 markets; source obtainable 311,923 single market; **source backed today
149,496 single market and 1,644,451 across markets**; publishable now 1,791 pages.

---

## Is 100,000 distinct useful pages defensible? **YES**

- **Current evidence.** Source backed today is 149,496 single market. Within that,
  27 families carry directly measured VALIDATED or STRONG demand. Two families alone
  reach it: `places.city-category` at 26,827 single market with `ristoranti milano`
  10,000 and `restaurants london` 11,000 measured, and the events cluster at 34,229
  single market with `大阪 イベント` 18,000 and `conciertos madrid` 17,000 measured.
  Add `rents.city` 10,503, `work.city-jobs` 16,096 plus 2,683, `stay.city-type`
  18,779 and the single market count passes 100,000 before any market multiplication.
- **Missing evidence.** SERP samples per family. Two exist. `places.city-category`
  is aggregator locked at head level in Milan, which means the 26,827 must be
  re-cut toward the openings (category x neighbourhood, or the long tail cities) and
  not published at head level.
- **Data requirement.** OSM places (free, ODbL, self hosted Overpass), one affiliate
  feed for stay, one jobs feed (EURES free plus one affiliate), city open data for
  events. **No purchase required except revenue share.**
- **Research requirement.** 20 SERPs per large family across entity tiers, and 30 to
  50 more keywords per family per market. Roughly 3,000 to 5,000 keyword rows.
- **Verdict.** Defensible, and the constraint is engineering plus feed integration
  rather than demand.

## Is 250,000 defensible? **YES, with the language axis honestly applied**

- **Current evidence.** 149,496 single market backed today plus the three largest
  obtainable gaps (places 42,923, sport routes 26,827, city cost of living 27,958)
  reaches 247,204 single market on data that is free or government published. Across
  just the five markets with the strongest measurement (en-GB, de-DE, it-IT, es-ES,
  pt-BR) the same set exceeds 250,000 several times over.
- **Missing evidence.** Whether each local market genuinely wants each family. This
  pass answers it for 6 markets and 38 families; it does not answer it for all 836
  family x market cells. **677 of the 836 cells are still UNKNOWN** on local demand,
  138 read YES and 21 read NO.
- **Data requirement.** The five sources above, all free.
- **Research requirement.** Fill the 677 unknown cells with at least 3 keywords each:
  roughly 2,030 keyword rows, about 89,000 Ahrefs units, affordable today.
- **Verdict.** Defensible. This is the honest working target.

## Is 500,000 defensible? **PROBABLY, and not yet proven**

- **Current evidence.** Source obtainable is 311,923 single market. Reaching 500,000
  needs either a second market counted fully (two markets at 250,000 each) or the
  city tier extended from tier 2 (2,951 cities) to tier 3 (11,553).
- **Missing evidence.** The tier 3 question. Every measurement in this project that
  looked at tier 2 and 3 entities found volumes collapsing: `weather in salzburg in
  july` 20, `correre a roma` 30, `台北 跑步` 20. Tier 3 has never been measured for
  places, events, stay or jobs, which are the families that would supply the volume.
- **Data requirement.** The same free sources; OSM and GTFS cover tier 3 as well as
  tier 1.
- **Research requirement.** A dedicated tier 3 measurement: 20 keywords per family
  across 10 tier 3 cities in 3 markets. Roughly 600 rows. **This is the single
  cheapest experiment that would move the ceiling.**
- **Verdict.** Probably defensible, unproven. Do the tier 3 measurement before
  committing.

## Is 1,000,000 defensible? **NOT YET DEMONSTRATED, NOT REFUTED**

- **Current evidence.** 1,644,451 combinations sit on data held today **when all 11
  markets are counted**. So 1M is arithmetically inside the source backed universe
  already. What is not established is that a million of them are distinct and wanted.
- **Missing evidence.** Three things, none of them measured:
  1. **The language axis.** 1M requires most families to be legitimate in 8 or more
     markets. This pass proves 6 new markets have real demand on the head terms; it
     does not prove the local tail is real in each, and 677 of 836 family x market
     cells are still unknown.
  2. **Tier 3 entities**, as above.
  3. **Per family SERP openness at scale.** 7 SERPs exist for 76 families.
- **Data requirement.** Places, events, stay, jobs, transit, schools, safety,
  attractions. Eight sources, seven of them free or revenue share.
- **Research requirement.** Roughly 8,000 to 12,000 keyword rows and 150 SERP samples
  across families, tiers and markets. About 500,000 Ahrefs units, which the current
  balance of 786,046 covers, and which must be spent before 8 October.
- **Verdict.** **Reachable on the arithmetic, unproven on the value.** The previous
  report's claim that it is not honestly reachable is withdrawn and this is the
  replacement: it is an open question with a known, affordable path to an answer.

## Is 3,000,000 defensible? **NO on current evidence**

- **Current evidence.** Raw architectural across markets is 4,053,197, of which
  1,077,115 is the refused daily climate route. Removing it leaves 2,976,082, so 3M
  is at the very edge of the architecture even counting everything.
- **Missing evidence.** Everything above, plus entity classes the architecture does
  not contain.
- **Verdict.** Not defensible from the current 76 families. It would need new entity
  classes, not more combinations of the existing ones.

---

## What could move 1M to 3M to 10M to 100M without thin content

The rule for each: a new **real-world entity class** with its own data, its own
query, and an answer that differs per entity. Not a new adjective, not a new
language, not a new year.

| Step | Entity class that would supply it | Real count | Why each page differs | Source reality |
| --- | --- | --- | --- | --- |
| 1M to 3M | **POI level pages**, not category level: the individual restaurant, gym, park, coworking space | OSM holds tens of millions of tagged POIs globally; roughly 3 to 5M in the 11 markets | Each has its own name, address, hours, category, neighbourhood and accessibility | OSM ODbL, free. **The honest caveat is that OSM POI records often hold only a name and a point, which is thin, so this only works where the tags are rich** |
| 3M to 10M | **Transport stop and route pages** | Roughly 1 to 2M stops in aggregated GTFS across these markets, plus route and stop pairs | A stop has its own lines, times, fares, accessibility and neighbourhood | GTFS via Mobility Database, mostly open |
| 3M to 10M | **Individual job postings** with role x city landing parents | Millions live at any time, but they expire | Each posting is genuinely unique while it exists | Affiliate and EURES feeds. **Expiring content is a lifecycle problem, not a scale win: the durable pages are the parents** |
| 10M to 20M | **Property listings** and **accommodation properties** | Several million | Each property is unique | Affiliate and portal feeds, with no-store terms. **Cannot be published as stored pages under most feed licences** |
| 20M to 50M | **Company pages** and **company x city** | Millions of registered companies with open registers (UK Companies House, EU business registers) | Registered facts differ per company | Open government registers, free |
| 50M to 100M | **Person or profile level entities** | n/a | | **Refused. This is where programmatic SEO becomes a directory of people, and it is neither defensible nor something this project should build** |

**What 100M would actually require**, stated plainly: individual POIs, individual
transport stops, individual properties and individual companies, all with rich
per-entity data and all lawfully storable. Three of those four have licence terms
that forbid storing the content, and the fourth (companies) has no demand evidence at
all in this project.

So: **100M remains an infrastructure ceiling, exactly as `scale-simulation.json`
framed it, and is not claimed as an SEO opportunity.** The defensible ladder stops at
1M pending the research named above, and the honest working target is 250,000.

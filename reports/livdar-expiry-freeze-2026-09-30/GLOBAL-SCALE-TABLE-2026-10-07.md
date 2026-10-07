# Global scale table

CURRENT FINAL = 427,121. Remaining to 1,000,000 = 572,879. Nothing published.
Measured figures are marked; everything else is labelled an estimate.

## The admission correction that changes the table

I had restricted the transport model to the four languages whose pair form was measured
on Ahrefs. That was wrong, and the project's own accepted model says so:

```
A  ENTITY_DEMAND_PROVEN      or
B  FAMILY_INTENT_PROVEN + ENTITY_UTILITY_PROVEN
```

The pair FAMILY intent is proven: the 2026-10-07 open-SERP harvest returned 891 of 1,000
rows at keyword difficulty 10 or below, median 0. That is a family result and does not
need re-proving per language. Each cell still needs ENTITY UTILITY, which GTFS supplies
per pair.

Two mechanical facts make this work with no keyword tool at all:

1. A native-language page about its OWN country is classified **NATIVE_LOCALE** by the
   localisation gate, because `NATIVE_LANG` resolves the country to that language. It
   needs no per-market keyword cell.
2. The aggregation path these rows travel **never calls `demand_score()`**, so there is
   no per-market demand gate on it either.

So de-DE, fr-FR, es-ES, it-IT, pl-PL, nl-NL, pt-BR, es-MX, en-US and en-AU domestic
pairs are admissible as Class B. The 17 countries in `NATIVE_LANG` are the page-eligible
set; a country outside it (Austria, Switzerland, Belgium, Portugal, Czechia, Sweden)
yields graph evidence but not native pages.

**The Class B utility bar**, standing in for the missing keyword evidence. A pair needs
three of five, all facts from the feed: it names its routes; 30 or more direct trips; 
corroborated by more than one mode, feed or operator; 20 km or more apart; 15 minutes or
more of scheduled time. "X to Y plus generic prose" fails it by construction.

**The German caveat is kept, not buried.** The 2026-10-07 German distance and route
probe returned 2 of 500 rows naming two real places against 346 of 500 in English. That
refuted a generic language fan-out of the *air and rail* pair families. It is not
evidence that a German reader planning Hamburg to Hannover is unserved by a page carrying
the real timetable. de-DE is Class B at the strict bar.

## Transport graph, by source

| source | model | raw entities | real connections | utility-qualified | expected FINAL | licence | status | blocker |
|---|---|---|---|---|---|---|---|---|
| **GB BODS** | hetero nodes | **312,801 stops measured, 306,275 resolved (98%)** | pending | pending | **50,000 to 150,000** est | OGL v3.0 | **HARVESTING** | none |
| NL OVapi | settlement | **71,936 stops, 71,421 resolved** | **7,509 pairs measured** | 7,509 | ~7,500 at Class B | CC0 1.0 | harvested, needs node re-run | none |
| NO Entur | settlement | **141,672 stops, 84,107 resolved** | **2,712 pairs measured** | 2,712 | 1,141 in FINAL now | NLOD 2.0 | **IN FINAL** | none |
| DK Rejseplanen | settlement | **36,344 stops, 35,496 resolved** | **2,865 measured** | 2,865 | 1,628 in FINAL now | open terms | **IN FINAL** | none |
| FI Digitransit | settlement | measured | **752 measured** | 752 | 589 in FINAL now | CC BY 4.0 | **IN FINAL** | none |
| IE TFI + Irish Rail | hetero | measured | **1,973 measured** | 1,973 | ~2,000 | CC BY 4.0 | queued | none |
| DE gtfs.de | hetero | 284 MB + 11 MB regional | est 15,000 to 40,000 | Class B strict | **10,000 to 30,000** est | CC BY 4.0 | queued | none |
| FR SNCF TER + IC + TGV | hetero rail | 3 feeds | est 3,000 to 8,000 | Class B strict | **3,000 to 8,000** est | Licence Ouverte | queued | none |
| ES Renfe | hetero rail | 1 feed | est 1,000 to 3,000 | Class B strict | **1,000 to 3,000** est | Renfe terms | queued | none |
| US Amtrak | hetero rail | 18 MB | est 2,000 to 5,000 | Class B | **2,000 to 5,000** est | Amtrak terms | queued | none |
| 102 city feeds | settlement | **3,483,942 stop pairs measured** | **21,384 measured** | 21,384 | 5,120 in FINAL now | 6 open licences | **IN FINAL** | none |
| IT national | hetero | unknown | unknown | unknown | unknown | unknown | **URL not located**; Rome regional 44 MB reachable | source discovery |
| PL national | hetero | unknown | unknown | unknown | unknown | unknown | **URL not located** | source discovery |
| BR, MX, JP, AU national | hetero | unknown | unknown | unknown | unknown | varies | 403/401/404 keyless | **account or NAP discovery** |
| ES NAP (111 feeds) | hetero | 111 feeds | est 8,000 to 25,000 | Class B | **8,000 to 25,000** est | mostly open | **BLOCKED** | **free account** |
| DELFI Germany | hetero | national | est 10,000 to 30,000 | Class B | overlaps gtfs.de | CC BY 4.0 | **BLOCKED** | **free account** |
| Trafiklab Sweden | hetero | 59 feeds | est 3,000 to 8,000 | n/a | **0 as pages** | CC0/NLOD | BLOCKED | account AND SE has no native market |
| AT OeBB 57 MB, CH, BE, PT, CZ | graph only | reachable | est | n/a | **0 as pages** | varies | reachable | **country not in NATIVE_LANG** |

Transport total, measured plus estimated, in page-eligible countries:
**roughly 85,000 to 230,000 FINAL.**

## Model 2, POI enrichment: measured, and it does not reach 100k

Measured across the whole corpus, all 35 country files, not sampled:

```
POI total                                7,388,615
POI BEFORE FACTS, zero utility tags      6,397,467   86.6%
POI with 1 utility tag                     772,590   10.5%
UTILITY-QUALIFIED at the >=2 tag bar       218,558    3.0%
POI carrying a wikidata id                       0
```

218,558 clear the attribute bar. They do **not** become 218,558 pages, and the reason is
visible in the class breakdown:

```
fast_food         97,125 of 312,159
shop_other        40,753 of 2,516,286
cafe              22,645 of 280,759
restaurant        21,527 of 770,032
supermarket       13,737 of 152,572
bank               6,928 of 161,025
```

That is a **business directory**, and two gates already refuse it. The NOTABLE gate is
the stated reason this inventory is not a directory. And the open-SERP measurement
refuted supermarket, nightclub, parking, marina and market in English outright, while
restaurant, cafe and fast-food SERPs are `OPEN_LOCAL_PACK_ABOVE_ORGANIC`, which is Google
serving its own local pack above organic results.

Also measured: **POI carrying a wikidata id is zero.** The extractor never kept it, so
the 52,557 Wikidata-linked entities are in the OUTDOOR layer only. Enriching POI from
Wikidata would need a re-extract plus name-and-coordinate matching, and the enrichment
probe already found Wikidata is thin for exactly the entities OSM is thin for: 0.00 facts
before, 1.04 after, only 19.6 per cent gaining two.

**Verdict: model 2 does not reach 100k legitimate pages.** Honest ceiling is the 7,874
outdoor entities at the two-fact bar, plus aggregation pages over the 218,558, which the
inventory already builds. I am reporting this as a refusal with numbers rather than
carrying a 300k figure that the gates would destroy.

## Model 3, the only 100k+ non-transport candidate found

| dataset | entities | licence | facts per entity | coverage | expected FINAL | effort | blocker |
|---|---|---|---|---|---|---|---|
| **OpenChargeMap EV charging** | ~500,000 points, est 150,000 to 250,000 sites | CC BY-SA 4.0, free API | operator, connector types, power kW, access, pricing model, status | global | **30,000 to 80,000** as per-SITE pages | low | API key, free |
| Companies House UK | 5.4M companies | OGL v3.0, free bulk | name, number, status, incorporation, SIC, officers, filings | UK | high raw, **near zero legitimate** on travel intent | medium | intent, not licence |
| Schools, hospitals, universities | 100k+ per country | varies, often open | name, type, capacity, operator | national | low: these are local-pack SERPs with no travel intent | medium | intent and SERP |
| ORR GB station usage | 2,580 | OGL v3.0 | entries, exits, interchanges, facilities | GB | 0 own pages, **but it enriches model 1** | low | none |

EV charging is the one genuine 100k+ candidate outside transport: real per-entity facts,
travel-adjacent, open licence, and a page per site rather than per socket is defensible.

## Top 3 models and the combined path past 1,000,000

| | model | expected FINAL | confidence |
|---|---|---|---|
| 1 | heterogeneous transport graph, 17 page-eligible countries | 85,000 to 230,000 | GB measured in part, rest estimated |
| 2 | EV charging sites | 30,000 to 80,000 | estimated, needs a free key |
| 3 | POI aggregation over the 218,558 qualified, plus 7,874 outdoor entity pages | 10,000 to 25,000 | measured |

```
FINAL now                        427,121
model 1                     + 85,000 to 230,000
model 2                     + 30,000 to  80,000
model 3                     + 10,000 to  25,000
country capture, saved evidence  bounded
------------------------------------------------
plausible total              552,000 to 762,000
```

**The honest conclusion: these three do not reach 1,000,000, and the shortfall is
structural rather than a matter of effort.** The transport graph is the only model with
genuine six-figure cardinality, and it is bounded by the 17 countries that have a native
language in this inventory. The three biggest remaining multipliers are:

1. **More page-eligible countries.** Adding Austria, Switzerland, Belgium, Portugal,
   Czechia and Sweden to `NATIVE_LANG` (as de-AT, de-CH, fr-BE, nl-BE, pt-PT, cs-CZ,
   sv-SE) would make their reachable national feeds page sources. OeBB Austria at 57 MB
   is already verified reachable. This is a market-registration decision, not a data one,
   and it is the single cheapest multiplier available.
2. **Station-to-station intercity pairs**, currently excluded where both endpoints share
   a settlement. Opening them for genuinely intercity services would multiply GB
   materially, and needs a rule that distinguishes an intercity terminus pair from two
   stops in one city.
3. **The three free GTFS accounts** (Spain NAP, DELFI, Trafiklab), worth 11,000 to 55,000
   and needing only registration.

Implementation continues: GB harvesting, then DE, FR, ES, US, IE in that order.

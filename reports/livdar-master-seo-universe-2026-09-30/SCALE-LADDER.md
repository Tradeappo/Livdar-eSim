# Scale ladder, version 3

Generated 2026-09-30, pass two. Supersedes version 2, kept at
`SCALE-LADDER-v2-superseded-2026-09-30.md`. Nothing has been deleted.

## Read this first: version 2 was wrong, and this version says by how much

Version 2 reported 500,000 as PROBABLE, 6,557 pages short, and said 48 more
keyword rows would settle it. Those 48 rows were measured. So were 663 others.
The result is not that 500,000 closed. It is that the formula behind the 500,000
figure was wrong, and the corrected figure is 29,274.

Versions 1 to 3 of the ladder all computed demand as:

    families that pass x 11,553 cities x 11 markets

The last term was never measured. It assumed a city carries its page set in all
eleven languages. On 2026-09-30 that assumption was measured directly, and it is
false:

| keyword | market | volume | the same intent in the city's own language |
| --- | --- | --- | --- |
| things to do in konstanz | gb | 20 | 400 for `sehenswuerdigkeiten`-class phrasing in de |
| things to do in gottingen | gb | 20 | de rows measure in the hundreds |
| things to do in middelburg | gb | 0 | 1,600 in nl |
| things to do in assen | gb | 0 | 700 in nl |
| restaurants konstanz | gb | 0 | 500 in de |
| gottingen hotels | gb | 0 | de rows measure in the hundreds |
| things to do in spokane | gb | 60 | 4,000 in us |

The last row matters most: same language, different market, 67x apart. So the
effect is the searcher's market and not only the language. A tail city carries
its families in one market, not eleven. The multiplier was inflating the answer
roughly twentyfold.

## What survived the correction

Two families do cross language, and only for destination cities. Measured in two
markets, both of them strongly:

- `activities.city-things-to-do`: gb median about 1,400 (krakow 11,000, rome
  8,900, porto 6,200, malaga 4,800, seville 3,700); de median about 7,000
  (amsterdam 17,000, wien 17,000, prag 15,000, rom 11,000), all at KD 0 to 7.
- `stay.city-type`: gb (rome hotels 3,700, seville 2,000, florence 1,400); de
  (hotel prag 7,600, hotel rom 2,800, hotel lissabon 2,800).

Two findings bound that:

- `places.city-category` does not cross language. `restaurants rome` is 200 in
  gb and 200 in de, `restaurants florence` 100, `restaurants utrecht` 40,
  `restaurants prag` 500. The category page is a local-language page only.
- It fails for non-tourist tier 2 even in the crossing families:
  `things to do in taichung` 70, `things to do in kaohsiung` 70. Asia outside
  Japan is unproven, so it is not counted.

One tail pattern does cross: `<city> <country>` (nagano japan 800, vannes france
700, konstanz germany 300, hualien taiwan 100, middelburg netherlands 100). That
is one orientation page per city, not a family set, and it is counted as one.

## A hard requirement this pass produced

Cross-language pages must use the searcher's exonym, never the city's endonym:

| exonym | volume | endonym | volume | ratio |
| --- | --- | --- | --- | --- |
| prag sehenswuerdigkeiten-class | 15,000 | praha | 20 | 750x |
| rom | 11,000 | roma | 70 | 157x |
| florenz | 7,200 | firenze | 50 | 144x |

Generating the endonym loses about 99 percent of the demand. Mailand not Milano,
Venedig not Venezia, Lissabon not Lisboa, Krakau not Krakow, Tokio not Tokyo.

## The ladder

| target | verdict |
| --- | --- |
| 25,000 | DEFENSIBLE |
| 50,000 | PROBABLE_BUT_UNPROVEN |
| 100,000 | NOT_DEFENSIBLE_ON_DEMAND |
| 250,000 | NOT_DEFENSIBLE_ON_DEMAND |
| 500,000 | NOT_DEFENSIBLE_ON_DEMAND |
| 1,000,000 | NOT_DEFENSIBLE_ON_DEMAND |

The four axes, kept separate:

| axis | pages |
| --- | --- |
| A. source-obtainable | 3,431,138 |
| B. source-backed today | 1,644,451 |
| C. demand-supported, measured | 29,274 |
| C. demand-supported, ceiling | 76,308 |
| D. publishable now | 1,791 |

A and B are counts of URLs the generator could emit from data it has or could
get. Neither was ever a demand claim, and the gap between B and C is the whole
point of this pass: 1,644,451 pages can be built and 29,274 of them have
measured demand Livdar can win.

## Why 1M is not a measurement problem

The binding constraint is entities, not families and not markets. The eleven live
markets can serve 3,171 cities over 50,000 population and 7,644 smaller towns,
10,815 in total. About six families pass per city. That is the ceiling.

Adding every language on earth does not fix it. The cities no live market can
serve number 8,382 at tier 1 to 3, in China (1,282), India (1,110), the Spanish
speaking Americas (830), the Arabic world (661), Russia (396) and elsewhere.
Adding all eighteen language groups that would cover them:

| lever | pages it adds |
| --- | --- |
| city axis, all 11 current markets, 6 families | about 65,000 |
| city axis, every language added (29,266 cities) | about 175,600 total |
| neighbourhoods, 20 per servable tier 1-2 city, 3 families | about 35,000 |
| the three blocked families unblocked | about 32,400 |
| absolute total if all of it were solved | about 243,000 |

So 1,000,000 is not 970,726 pages of missing measurement. It is out of reach on
the city axis by a factor of four even after every language and every blocked
family. Reaching it needs an entity axis an order of magnitude larger than
cities: venues and points of interest at roughly 100,000 entities, which is a
data acquisition project and not a research one. The year and persona axes that
would get there arithmetically are the padding this project already ruled out.

## What is excluded, and why it is not the same reason each time

| family | class | evidence |
| --- | --- | --- |
| work.city-jobs | SERP aggregator locked | `jobs lincoln` top 10 is 100 percent job boards. Highest tail demand measured, 10 of 11 markets pass on volume. |
| weather.city-best-time | SERP feature suppressed | `wetter konstanz` has a knowledge card at 1 and yields 1,281 organic clicks on 9,200 volume. `spokane weather` has no top 10 result under DR 72. Highest volume family at tier 3 and the only authority-gated SERP found in this niche. |
| property.city-buy | source blocked, SERP open | `houses for sale carlisle` has a DR 7 winner at position 3 earning 1,591, so authority is not the barrier. Every winner serves live listings Livdar has no feed for. |
| route.city-pair | SERP aggregator locked | `lincoln to nottingham` has no top 10 result under DR 53, all rail operators and aggregators, AI overview at 1. Demand is real: london to paris 24,000, and tier 3 pairs carry volume too. |

Those four are 32,445 pages of measured demand set aside on evidence, not taste.

## What this pass proved positively

- Tier 3 is alive and was under-sampled before. 96.5 percent of tier 3 rows are
  above zero and the strongest markets are Japanese and French.
- Tier 4 works where probed. In de, four of five core families clear the tail
  gate on towns of about 49,000 people (Ravensburg, Kleve, Hof, Peine, Leonberg,
  Bad Oeynhausen). In gb, three of five. The 50,000 population cut is arbitrary.
- The tier 3 tail is more open than the head, including in the family that was
  locked at the head. `ristoranti milano` had no winner under DR 61.
  `restaurants lincoln` has DR 13 at position 5 earning 2,148, DR 13 at 7 and
  DR 15 at 9, while TripAdvisor at DR 91 takes 337.
- Category depth does not multiply at tier 3. `restaurants lincoln` is 2,700 and
  then `pubs` 250, `cafes` 200, `bars` 150, `museums` 70, `parks` 50. One page
  per family per city was the right model, not a conservative one.
- The city attribute families are dead at tier 3: cost of living 0, is-it-safe
  30 to 40, best time to visit 0, city vs city 0, day trips 30 to 50. The
  anti-padding rule was correct.

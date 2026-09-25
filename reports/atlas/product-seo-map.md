# The product, and the search layer under it

Generated from `reports/atlas/product-seo-map.json`, which is generated from
the taxonomy rather than written by hand. Every number here recomputes with
`node scripts/atlas/product-map.mjs --write`.

Livdar is an urban life system. Until 24 September the taxonomy described two
of its surfaces, relocation and connectivity, and had a weather section left
over from the first build. It now describes twelve, and the shape of the
programme changed as a result rather than just its size.

## The twelve surfaces

Every vertical belongs to exactly one surface and a test fails if one belongs
to two or to none.

| Surface | Stage | Families | Candidates | What is behind it |
| --- | --- | --- | --- | --- |
| Areas | discovery | 9 | 674,084 | stay booking, rental lead, venue booking, promoted listing |
| Move | transaction | 20 | 582,988 | relocation service, insurance, banking, moving service |
| Pulse | discovery | 5 | 376,520 | ticket, stay near venue, restaurant booking |
| Stay | intent | 5 | 375,470 | booking commission, rental lead, property lead |
| Work | intent | 4 | 324,839 | job listing, employer listing, coworking booking |
| Sport | discovery | 2 | 295,100 | rental, lesson, tour, club membership |
| Getting around | intent | 4 | 93,915 | transfer booking, pass, flight |
| Tools | intent | 8 | 77,021 | every other surface, because a tool ends in a decision |
| Climate | discovery | 2 | 65,962 | nothing directly |
| Community | discovery | 1 | 33,600 | event listing, membership |
| SIM and connectivity | transaction | 2 | 32,249 | eSIM, which is the part that already sells |
| Safety | discovery | 2 | 32,249 | insurance |

Read down the stage column and the programme's balance is visible:
1,477,515 candidates in discovery, 871,245 in intent, 615,237 in transaction.
That is the right shape for a product whose job is to be found early and
still be there at the decision, and it is the first time the programme could
be measured that way at all.

Climate is the only surface with nothing behind it. It is kept because it
feeds the others and it is the only surface still leashed to the active
markets, which is what stops it filling the inventory on its own. Its share
of candidates fell from 6 percent to 2.2 percent with this work, not because
anything was deleted but because the rest of the product arrived.

## What state the programme is really in

| Status | Families | Candidates |
| --- | --- | --- |
| blocked on a source | 56 | 2,646,542 |
| research needed | 2 | 193,494 |
| source ready | 5 | 63,073 |
| published | 1 | 60,888 |

One family is published. That is not a disappointing number, it is the
accurate one: 123 pages exist, all of them weather, and everything else in
this table is a combination that has been thought about rather than a page
that exists. The funnel exists precisely so those two things can never be
confused.

## The single biggest lever in the programme

Fourteen families are blocked on one source, `cost-of-living-verified`. Seven
more are blocked on `visa-rules-verified`, five on `events-verified`, four
each on `work-rules-verified`, `neighbourhood-facts-verified` and
`places-data-verified`.

| Source | Families it blocks |
| --- | --- |
| cost-of-living-verified | 14 |
| visa-rules-verified | 7 |
| events-verified | 5 |
| work-rules-verified | 4 |
| neighbourhood-facts-verified | 4 |
| places-data-verified | 4 |
| tax-rules-verified | 3 |
| rent-index-verified | 3 |
| salary-data-verified | 3 |

Nothing in the last two weeks of research changes a single one of those
numbers, and no amount of further keyword work will. The measured demand is
real and the pages cannot be built, which makes the next unit of effort a
data licensing question rather than a research question. That is the most
useful thing this report says.

## Top opportunities

Ranked by the family prior, what the family leads to, whether an answer
engine can quote it, and then discounted by how much is actually known about
it. The last term matters: the first run of this ranking put a family with no
measured demand at all into second place on the strength of its declared
priors, which is exactly the failure the discount exists to prevent.

| Family | Surface | Opportunity | Evidence | Candidates |
| --- | --- | --- | --- | --- |
| tools.calculator | Tools | 0.83 | measured | 80 |
| stay.city-type | Stay | 0.63 | measured | 206,570 |
| stay.near-venue | Stay | 0.62 | measured | 0, venue source missing |
| neighbourhoods.city-best-for | Areas | 0.58 | measured | 177,060 |
| tools.matcher | Tools | 0.56 | measured | 30 |
| connectivity.country-sim-gap | SIM | 0.51 | predates the field | 2,739 |
| places.city-category | Areas | 0.51 | competitor observed | 295,100 |
| work.city-jobs-category | Work | 0.50 | measured | 177,060 |
| events.city-window | Pulse | 0.49 | measured | 118,040 |
| events.recurring | Pulse | 0.46 | competitor observed | 0, event source missing |

The top entry produces eighty candidates. That is the point of ranking this
way: eight calculators across ten languages, one of which carries a five
dollar cost per click, outrank two hundred thousand stay pages that do not
exist yet, and both outrank anything measured only by volume.

## By group

**A. Evergreen.** stay.city-type, stay.near-venue,
neighbourhoods.city-best-for, places.city-category, work.city-jobs-category.

**B. Dynamic and live.** events.city-window, events.recurring,
events.city-type, events.series-city. Only one of the four shapes expires;
see `lib/atlas/lifecycle.js`.

**C. Tools.** tools.calculator, tools.matcher, and the two cost tools added
on 23 September. Eight calculators, three matchers, thirty pages of inventory
and the best measured ratio of demand to difficulty in the programme.

**D. Transactional.** tools.calculator, places.city-category,
services.country-admin. A short list, and that is a finding: most families
lead to a transaction that is not billable yet.

**E. Community.** community.city-topic, alone, indexing hubs only.

**F. Local POI.** sport.route, places.neighbourhood-category, places.poi. All
three gated, two of them at zero candidates until a places source exists.

**G. Relocation, work and stay.** stay.city-type, stay.near-venue,
work.city-jobs-category, health.country, banking.country, property.city-buy.

## What the map is not

It is not a publication plan. Every row is a combination that has passed a
judgement and no row has passed a gate. The ladder in
`docs/atlas-scale-limits.md` still starts at 250 pages, the first cohort
still has to be measured for two weeks, and nothing in the last two days
moves that.

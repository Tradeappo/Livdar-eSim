# What the gap actually costs: the measured ceiling of free data under the existing gates

Written 2026-10-14, after taking the free per-entity demand instrument built on 2026-10-13 and
applying it to every remaining entity supply on disk.

The brief says do not stop at the 332,702 gap and find new high-cardinality models. I did, I
measured each of them, and the honest result is that **they do not sum to 332,702, and the
reason is not supply.** This file is that arithmetic, because a plan built on the belief that
one more dataset closes the gap would waste the next several days.

## The one-line answer

Every free, open or already-captured entity supply left on disk, put through the gates this
project already enforces, is worth about **31,000 rows**, taking the inventory from 667,298 to
roughly **698,000**. Not 1,000,000. The binding constraint is not how many lakes, listed
buildings or districts exist. It is that the gates require, per row, a MEASURED demand signal
plus two independent facts plus a containment parent, and the free instruments attest far fewer
entities than the raw supply suggests.

## Each model, measured rather than estimated

| model | raw supply | past every gate | status |
|---|---|---|---|
| Wikidata water and protected areas, home side | 895,123 captured, 123,887 with two or more facts | see the funnel below | BUILT |
| the same layer, destination side | 74,508 entities | 9,568 (entity, language) rows | BLOCKED: no reference class |
| Finland and Norway water entities | 15,680 | 0 | BLOCKED: no parent layer, no fi or nb clickstream |
| county x outdoor class aggregation | 388,416 POI on county polygons | 6,580 unbuilt cells in home markets at 8 POI | BUILDABLE |
| outdoor entities notable but fact poor | 55,173 | 7,874 measured recoverable | BUILDABLE, measured 2026-10-07 |
| National Heritage List for England, Grade I and II* | 31,466 | unmeasured | MEASURABLE, not yet measured |
| listing feeds (jobs, events, rental, property) | 47,000,000 records | 0 durable | REFUSED, unchanged: a listing expires |

### The water and protected-area funnel, reconciling to the row it started from

```
124,132  fact-bearing entities read
 74,508  no home market, and the destination side has no calibrated floor
 15,680  no parent layer for this country: Finland 13,250, Norway 2,370
 12,895  no article in the language of this page
 12,154  readership below the calibrated entity floor
  7,390  facts carry no stated unit, so they cannot be printed
  1,467  inside no parent polygon
     38  country QID carries no ISO code
```

The two largest rejections are the finding. 74,508 is the destination side, and 15,680 is two
HOME markets with no parent layer. Both are addressable; neither is addressable by finding
another dataset.

## Why the destination side is blocked, and why that is not a gate I may quietly open

The manifest holds 33,836 outdoor_feature rows and **every one of them is home-side**. The
OpenStreetMap builder produced 10,832 destination-side entity rows and the manifest admitted
**none**. So there is no admitted destination entity page anywhere in this inventory, which
means there is no reference class to calibrate a floor against.

A floor chosen without a reference class is a number somebody picked. Measured, the destination
side would yield 9,568 rows under the home floor and 7,131 under the city destination floor, and
either choice would be me deciding what the bar is rather than reading it off what the paid
corpus already let through. That is the one thing the whole free-signal design refuses to do, so
the destination side stays unbuilt and the counterfactual is recorded instead.

## Why Finland and Norway are the cheapest unbuilt thing on the list

fi-FI and nb-NO are live markets, with 1,315 and 2,016 manifest rows. Finland holds 13,250
fact-bearing water entities and Norway 2,370, and on the home side a page about a Finnish lake
in Finnish needs no destination evidence at all. Three things are missing, and all three are
free:

1. no parent layer for FI or NO, because their OpenStreetMap extracts are not in the container
2. no clickstream capture for fi, nb or da, so there is no readership reading in those languages
3. no admitted outdoor_feature row in fi, nb or da, so no floor can be calibrated and the gate
   would be inert even with the first two

Item 3 is the real one, and it is circular: no admitted entity page means no floor means no
admitted entity page. Breaking it needs either a paid keyword measurement for one outdoor family
in one of those markets, or an explicit decision to seed the first floor another way. I am not
making that decision here; it is recorded as the blocker it is.

## The arithmetic the brief should be judged against

```
667,298   FINAL today
  + the water layer, home side, built in this pass
  + 6,580   county x outdoor class cells, buildable now
  + 7,874   fact-poor outdoor entities, measured recoverable
  + 9,568   water layer destination side, IF a reference class is established
~698,000   everything free, open and already captured, under the gates as they stand
```

The remaining 302,000 is reachable only by one of four things, and three of them the brief rules
out:

1. **Relax a gate.** 1M-GAP-TO-TARGET.csv already prices two: dropping
   `place_not_a_named_entity` is 262,774 rows and dropping `area_parent_city_page` is 147,368.
   Both are marked NOT RECOMMENDED there and the brief forbids relaxing any quality gate. Priced
   here only so the size of the temptation is visible.
2. **Add markets.** This is the only lever with 302,000 of genuine headroom, because a market
   multiplies every city family: en-US alone is 137,770 rows. It is blocked on exactly what
   cannot be bought: a new market is admitted on its OWN measured keyword cells, and the free
   readership signal can never supply those. It answers whether a PLACE is sought in a language;
   it cannot answer whether a FAMILY has demand in a market, and search_demand.py says so in
   those words.
3. **Licence a source family.** Priced at 0 durable candidates above, and refused for the stated
   reason.
4. **Accept the measured ceiling** and spend the effort on the quality and indexation of
   roughly 700,000 rows instead of on the last 300,000.

## What I am not claiming

That 1,000,000 is impossible. That no dataset exists which I have not thought of. What I am
claiming is narrower and testable: of the supplies now on disk or reachable free, each has been
measured through the real gates and the totals above are what they give. If a specific source is
proposed, the funnel in `scripts/atlas/scale/water-feature-candidates.py` is the template for
measuring it in an afternoon rather than arguing about it.

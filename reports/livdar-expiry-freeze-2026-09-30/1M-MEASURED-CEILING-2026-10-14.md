# What the gap actually costs: the measured ceiling of free data under the existing gates

Written 2026-10-14, after taking the free per-entity demand instrument built on 2026-10-13 and
applying it to every remaining entity supply on disk.

The brief says do not stop at the 332,702 gap and find new high-cardinality models. I did, I
measured each of them, and the honest result is that **they do not sum to 332,702, and the
reason is not supply.** This file is that arithmetic, because a plan built on the belief that
one more dataset closes the gap would waste the next several days.

## The one-line answer

Every free, open or already-captured entity supply left on disk, put through the gates this
project already enforces, is worth about **21,000 rows**, taking the inventory from 667,298 to
roughly **688,000**. Two of those models are now BUILT and the inventory stands at **678,510**.
Not 1,000,000. The binding constraint is not how many lakes, listed
buildings or districts exist. It is that the gates require, per row, a MEASURED demand signal
plus two independent facts plus a containment parent, and the free instruments attest far fewer
entities than the raw supply suggests.

## Each model, measured rather than estimated

| model | raw supply | past every gate | status |
|---|---|---|---|
| Wikidata water and protected areas, home side | 895,123 captured, 123,887 with two or more facts | 7,183 candidates, 7,156 FINAL rows, +6,798 net | BUILT AND IN THE MANIFEST |
| the same layer, destination side | 74,508 entities | 9,568 (entity, language) rows | BLOCKED: no reference class |
| Finland and Norway water entities | 15,680 | 0 | BLOCKED: no parent layer, no fi or nb clickstream |
| county x outdoor class aggregation | 388,416 POI on county polygons | 0 without a new keyword measurement; 11,049 cells blocked on one | BLOCKED, and my own first figure for this was wrong |
| outdoor entities notable but fact poor | 157,955, not the 55,173 recorded | 43,784 enriched, +4,414 net FINAL | BUILT AND IN THE MANIFEST |
| National Heritage List for England, Grade I and II* | 31,466 | unmeasured | MEASURABLE, not yet measured |
| listing feeds (jobs, events, rental, property) | 47,000,000 records | 0 durable | REFUSED, unchanged: a listing expires |

### The water and protected-area funnel, reconciling to the row it started from

```
124,132  fact-bearing entities read
 74,366  no home market, and the destination side has no calibrated floor
 15,679  no parent layer for this country: Finland 13,250, Norway 2,370
 12,800  no article in the language of this page
 12,016  readership below the calibrated entity floor
  1,458  inside no parent polygon
    341  the only containing parent is the feature itself
    245  a second captured class stated for an item already counted
     38  country QID carries no ISO code
      6  facts carry no stated unit, so they cannot be printed
  7,183  ROWS EMITTED
```

and through the manifest, which is where the number that counts is decided:

```
1,487,968  generated before any gate   (1,480,785 + the 7,183 above)
  813,872  rejected
  674,096  FINAL, against 667,298 before this pass: +6,798 net
```

7,156 of the 7,183 survive as rows in six new families (outdoors.river 3,115,
outdoors.lake 1,877, outdoors.protected_area 993, outdoors.island 602,
outdoors.waterfall 363, outdoors.national_park 206). The net gain is 6,798 rather than
7,156 because the manifest's Wikidata-item dedupe displaced 358 rows that were already
resting on the same item from the OpenStreetMap side: the same lake does not get two
pages, which is the dedupe doing its job rather than a loss.

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
667,298   FINAL before this pass
+   6,798   the water layer, home side, BUILT and verified in the manifest
  674,096   FINAL now, quality gate passed, 404 of 405 tests passing
+   4,414   the outdoor enrichment, BUILT and verified in the manifest
  678,510   FINAL now, quality gate passed, 404 of 405 tests passing
+   9,568   water layer destination side, IF a reference class is established
~688,000   everything free, open and already captured, under the gates as they stand
```

### The outdoor enrichment, built after this file was first written

The task list recorded this as 55,173 entities with 7,874 recoverable. Counted against the
real inputs it is 157,955 notable features carrying fewer than two attributes, and the pass
enriched 43,784 of them from Wikidata; 103,253 have no fact in Wikidata either and are still
refused. It had been stuck at 10,913 of 157,955 because it reached only Wikimedia's hosts,
which answer about two queries from this container and then 429. With the verified mirror in
front, the whole pass took minutes: 2,557 ids in 11.8 seconds at a batch of 1,000.

Outdoor feature candidates went 46,130 to 51,631 and the manifest's outdoor_feature rows went
33,836 to 45,048. The gate was not touched: 35,691 features are still refused as notable with
no fact a reader came for, and 64,429 holding one attribute and no article in the page language
still go to the aggregation layer rather than to a page, 54,304 of them peaks.

### A correction to my own number, because it was the kind that flatters the answer

An earlier draft of this file put the county aggregation axis at 6,580 buildable cells. That
was wrong and it was wrong in the generous direction. I counted (county, POI class) cells with
eight or more POI and subtracted the ones already built, which measures SUPPLY. The family's
gate is not supply: `outdoor-aggregations.py` admits a feature type only in markets where the
LIST keyword was measured, and most of the POI mass on county polygons is in classes that have
no measured list demand at all - memorial 154,130, attraction 62,735, archaeological_site
40,136, ruins 21,843, monument 20,998.

Re-ran the real builder rather than re-estimating. It reproduces 1,954 rows from the current
inputs, byte-identical once decompressed, so the axis has NO headroom as it stands, and its own
rejection counters say why:

```
 6,893  demand_not_measured_in_this_market_peak
 2,090  demand_not_measured_in_this_market_viewpoint
 1,895  demand_not_measured_in_this_market_camp_site
   122  demand_not_measured_in_this_market_castle
    49  demand_not_measured_in_this_market_beach
11,049  cells refused purely for want of a keyword measurement in that market
```

Peak lists are measured in de-DE only, viewpoint lists in de-DE only, camp sites in de-DE and
it-IT. So 11,049 real county cells, each with three or more named features inside a polygon,
are refused because nobody measured "peaks in <county>" in their market. That is the same wall
as adding a market, and it is the wall this brief cannot climb: the free readership signal
answers whether a PLACE is sought in a language and can never answer whether a FAMILY has
demand in a market.

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

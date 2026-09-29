# Next execution plan

Written 2026-09-30, pass two, after the market-reach correction. This replaces
the earlier plan, which was built around reaching 500,000 and then 1,000,000
pages. Those targets are not reachable on demand, so the plan is no longer about
scale. It is about the 29,274 pages that have measured demand and an open SERP.

## What changed, in one line

Demand-supported measured is 29,274 and the ceiling is 76,308, not 574,314 and
not 1,000,000. The universe is roughly twenty times smaller than the ladder said,
because a tail city carries its page set in one market and not in eleven.

## 1. Stop treating scale as the goal

The 1,791 publishable-now pages and the 29,274 demand-supported ones are the
whole opportunity. There is no version of this project that honestly publishes a
million pages against measured demand, and the correct response is to build the
29,274 well rather than to look for another axis to multiply.

## 2. Fix the generator's language model before generating anything else

Two changes, both forced by measurement:

- A tail city page is generated for its own market only. Generating
  `en/things-to-do-in-konstanz` produces a page with 20 searches a month against
  a German page with several hundred. The current generator emits all markets for
  all cities, which is where the 2,372,554 language-axis candidates came from.
- Cross-language pages, which exist only for `activities.city-things-to-do` and
  `stay.city-type` on the 333 destination cities, must use the searcher's
  exonym. `prag` not `praha` (750x), `rom` not `roma` (157x), `florenz` not
  `firenze` (144x), and likewise Mailand, Venedig, Lissabon, Krakau, Tokio. An
  exonym table per market is a prerequisite, not a nicety.

## 3. Probe tier 4 in the nine markets where it is unmeasured

Tier 4 held in de (four of five core families) and gb (three of five) on towns of
about 49,000 people. It is unprobed in fr, nl, it, es, pl, pt, ja, tw and us.
7,644 tier 4 towns sit in the eleven markets' countries, so this is the largest
remaining measurement that can move axis C. Cost is about 32 rows per market,
roughly 9,200 units for all nine.

## 4. Decide the four excluded families deliberately

They are 32,445 pages of measured demand, set aside on evidence. Each needs a
decision rather than a re-measurement:

- `work.city-jobs`: the strongest tail demand measured anywhere and a SERP that
  is 100 percent job boards. A feed project, not a content project. Recommend
  leaving it out.
- `weather.city-best-time`: the largest volumes at tier 3 and the only
  authority-gated SERP in the niche. A forecast page cannot win. A climate
  normals page answers a different question and would have to be measured
  separately, because `best time to visit lincoln` measured 0.
- `property.city-buy`: open on authority, blocked on source. The one angle the
  SERP suggests is price trends rather than listings, and `house prices lincoln`
  measured 150, `house prices carlisle` 100. Weak. Recommend leaving it out.
- `route.city-pair`: real demand, nothing under DR 53, needs timetable data.
  Recommend leaving it out.

## 5. Do not open the year, persona or attribute axes

The city attribute families were measured and are dead at tier 3: cost of living
0, safety 30 to 40, best time to visit 0, city vs city 0, day trips 30 to 50.
Category depth was measured and does not multiply: after `restaurants lincoln`
2,700 come pubs 250, cafes 200, bars 150, museums 70, parks 50. There is no
honest multiplier hiding in these axes.

## 6. Carried over, unchanged and still blocked on a signed-in human

`reports/USER-ACTIONS-REQUIRED.md` has 12 open items. Two expire on 8 October:
item 7, the Rank Tracker keywords to paste, and item 8, Brand Radar. Neither can
be done from here.

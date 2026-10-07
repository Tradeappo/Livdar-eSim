# The 1M capacity ceiling, measured

Written 2026-10-07. Nothing published. No gate relaxed.

## 1. Where the inventory actually stands

`1M-SUMMARY.json` is authoritative and its funnel reconciles:

```
generated before any gate                     946,225
after the uniqueness and SERP gate            788,753   (-157,472)
after exact dedupe                            788,494   (-259)
after semantic dedupe                         788,492   (-2)
after the localisation and cross locale gate  405,580   (-368,902)
after the one page per name per city rule     405,580   (-58 applied earlier)
after the parent survival check               401,393   (-4,187)
FINAL DISTINCT VALID                          401,393
target                                      1,000,000
shortfall                                     598,607
```

One correction to my own earlier reading. The `status` field on candidate rows
(`POI_AGGREGATION`, `MISSING_DATA`, `BLOCKED_BY_LICENCE`, `EXPERIMENT_ONLY`,
`NOT_IMPLEMENTED`) is a SOURCE PROVENANCE label carried into the pipeline, not the
pipeline's verdict. I briefly read it as a verdict and thought 130,710 of the 401,393
were not buildable. They are. `data/atlas/candidates/` is the INPUT inventory; the
manifest is the output; `FINAL_DISTINCT_CANDIDATES` is 401,393 and there are zero
duplicate URLs among them.

## 2. The one gate that stands between 401,393 and roughly 770,000

The localisation gate removes 368,902, more than every other gate combined. It splits:

| class | count | kept | recoverable under demand OR utility |
|---|---|---|---|
| NATIVE_LOCALE | 345,974 | yes | already in |
| VALID_LOCALIZATION | 59,606 | yes | already in |
| TRANSLATION_ONLY | 263,742 | no | **NO** |
| LOCAL_INTENT_MISSING | 54,986 | no | partly, as class B |
| LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION | 49,678 | no | partly, as class B |
| LOCAL_DATA_MISSING | 496 | no | no, there is no data |

`TRANSLATION_ONLY` is 263,742 pages where the same page for the same entity already
exists in the language of that entity's own country, and the variant adds no measured
local demand. The brief's own words: "If only the language changes: REJECT." That is
71 percent of everything the localisation gate removes and it is not available. Taking
it would be the city and language swapping the brief forbids, and it would be the single
largest scaled content spam signal the inventory could carry.

The other two classes total 104,664 and ARE the legitimate class B pool, because the
correction says demand OR utility. A page for a destination this market was never
measured searching for can still be useful to a traveller from this market. But it
only qualifies if it carries something beyond the translation, and that has to be
gated, not assumed.

## 3. Every closure path, with its measured size

| path | size | status | confidence |
|---|---|---|---|
| current FINAL | 401,393 | built | measured |
| country expansion | 90,498 | measured earlier | measured |
| localisation class B recovery | up to 104,664 | needs a hard utility gate | upper bound only |
| outdoor entities meeting the attribute bar but dropped | 91,068 | diagnostic running | upper bound only |
| notable but fact poor, via Wikidata enrichment | 55,173 | not run | upper bound only |
| licence required | 39,284 | needs licences | blocked externally |
| region x year x month holidays | 10,000 to 30,000 | measured demand, largest found | measured |
| feed required | 9,747 | needs feeds | blocked externally |
| outdoor place x class aggregation expansion | 2,166 | computed from inventory | measured |
| **optimistic sum if every path yields 100 percent** | **~824,000** | | |

No path yields 100 percent. Three of the five largest are upper bounds, not forecasts.

## 4. The finding

**One million FINAL DISTINCT VALID pages is not reachable from the sources now on disk
without either removing a quality gate or acquiring new entity supply.** The ceiling is
roughly 824,000 at the most generous reading of every recovery path, and realistically
well below it.

This is not a reason to stop and it is not the brief's "external blocker". It is a
supply statement with a named remedy, and the remedy came out of this session's
competitor measurement rather than from guessing.

## 5. The one acquisition that closes it

Site Explorer on the sites that already operate at this scale:

| site | organic keywords | organic traffic | keywords in positions 1 to 3 |
|---|---|---|---|
| rome2rio.com | 1,850,129 | 8,950,336 | 589,488 |
| timeanddate.com | 637,752 | 23,603,596 | 219,465 |
| alltrails.com | 520,644 | 2,577,233 | 144,352 |
| komoot.com | 505,188 | 3,443,611 | 132,036 |
| wikiloc.com | 276,576 | 1,301,026 | 70,625 |
| numbeo.com | 29,681 | 558,493 | 11,092 |

Only one of these reaches 1.8M keywords, and it does it with an **ordered pair over a
heterogeneous transport node set**. The pair members measured in its top pages are not
cities: they are rail stations (New-York-Penn-Station, Gare-de-Paris-Nord), airports
(Nice-Airport), islands (Norderney, Texel, Isle-of-Arran), stadiums and clubs
(Stade-de-France, Paris-Saint-Germain-Football-Club), bus terminals
(Terminal-Alameda-Turbus), metro stations, malls, universities, regions and countries.
Most of those pages rank for exactly ONE keyword and still pull 2,000 to 71,000 traffic
each, which is the signature of a real long tail rather than of thin content.

It avoids duplication the way a legitimate pair model has to: each page states a
different computed itinerary, because the transport graph between A and B differs from
the graph between A and C.

**Acquiring transport routing data (GTFS feeds, openly licensed for most of Europe and
much of the Americas) adds the pair axis over the 56,317 cities, 3,244 airports and
5,592 venues already on disk.** That is the acquisition that closes the gap to a million
without touching a gate, and it is the only one this research found that does.

## 6. What alltrails settles about the outdoor layer

Brief B item 10 said do not keep tens of thousands of one attribute peak pages, and
prefer one strong aggregation page over a hundred thin ones. The category leader does
exactly that. Its highest traffic non brand pages are place by facet aggregations
(/us/kansas/wichita 31,318 traffic and 335 keywords; /wichita/forest; /wichita/views;
/turkey/antalya/waterfall at position 2 for "best waterfall hikes" at 13,000), and the
only per trail pages that rank are the famous named ones: Angels Landing, Half Dome,
Cathedral Rock, Devils Bridge, Joffre Lakes.

So the brief's instinct was right and is now measured rather than asserted. The
384,962 peaks at 0.84 facts each stay out of the entity layer.

## 7. What I got wrong earlier in this session, corrected

- I claimed the outdoor layer is uniformly too thin for own pages and supports only
  aggregations. **Refuted by measurement.** I had probed English prepositional phrasing
  ("waterfalls in X"), which samples the aggregation intent and cannot see the named
  entity tail at all. The bare noun returned 332 Italian rows and 130 German rows where
  the prepositional probe returned 12 and 6, a factor of 28 and 22. Per entity demand is
  real and dense in German and Italian.
- I briefly read the candidate `status` field as a pipeline verdict. It is source
  provenance. 401,393 stands.
- A suffix probe for German peaks ("spitze") returned lingerie, a slot machine and
  Apple Pencil tips. Recorded as refuted in
  `data/atlas/measurements/entity-tails/refuted-probes-2026-10-07.json` rather than
  dropped.

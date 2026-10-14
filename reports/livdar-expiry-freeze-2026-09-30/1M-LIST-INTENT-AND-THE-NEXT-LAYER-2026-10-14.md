# Family intent, measured for free, and where it points

2026-10-14. Offline only. Production, the live Atlas pages and the 500-URL indexing
experiment are untouched by everything here.

## The blocker this answers

A new page family cannot enter the candidate manifest without family-level intent evidence for
the market it would serve. `demand_score()` returns 0 without a measured keyword cell, a 0 row
is dropped as `dropped_no_demand_evidence`, and the per-market family gate refuses by name
anything a market was not measured for. Those gates are right and the brief forbids relaxing
them. Every family-intent measurement in this repository came from a keyword corpus that
cannot be bought again, so without a free instrument the family set can only shrink.

The per-city search-demand signal built on 2026-10-13 does not answer this, and must not be
asked to. A reader of the German article on a town is evidence about the TOWN. It says nothing
about whether anyone wants its listed-buildings page.

## The instrument

`scripts/atlas/ingest/wikipedia-list-intent.py`. Wikipedia carries list articles - "Liste der
Seen in Bayern", "List of national parks in Chile" - tens of thousands per language, and the
clickstream already captured says how many readers reached each one FROM A SEARCH ENGINE. A
list article about a kind of thing in a place, pulling a measured monthly search readership in
a language, is evidence that speakers of that language search for that list. That is family
intent, measured as a count, in the language the page would be written in, from a file already
on disk. Output: `data/atlas/measurements/findings/wikipedia-list-intent-2026-10-14.json`.

It evidences LIST and AGGREGATION intents only. It says nothing about transactional or tool
intent, nothing about commercial value, and nothing about whether any particular place deserves
a page - that last is the per-city signal's job and the two are kept apart deliberately.

Coverage, and two languages it cannot reach:

| language | list articles | kinds above the 30-article floor |
|---|---|---|
| en | 91,134 | 196 |
| de | 21,757 | 48 |
| fr | 16,391 | 49 |
| pt | 7,731 | 23 |
| tr | 3,698 | 22 |
| nl | 7,013 | 10 |
| ja | 7,870 | 1 |
| pl | 1,585 | 0 |
| zh | 7,861 | 0 |
| **es** | 4 | **not measurable**: Spanish keeps its lists in the `Anexo:` namespace, which the clickstream does not cover |
| **it** | 219 | **not measurable**: Italian Wikipedia does not title its lists this way |

pl, zh and ja report few or no kinds because the title-shape rules for those languages do not
fit yet, not because the intent is absent. That is a gap in the instrument, recorded as one.

## What it measured, and the finding that redirected the plan

English, search-referred readers a month per list article, against the captured entity base:

| list kind | mean | entities on disk | family today | rows today |
|---|---|---|---|---|
| national parks | 1,731 | none | none | 0 |
| mountain peaks | 969 | 413,891 | `outdoors.peak` | 11,844 |
| islands | 906 | none | none | 0 |
| mountains | 488 | (peaks) | `outdoors.peak` | |
| volcanoes | 375 | captured | `outdoors.volcano` | |
| rivers | 352 | none | none | 0 |
| lakes | 349 | none | none | 0 |
| waterfalls | 333 | 20,556 | `outdoors.waterfall` | |
| castles | 200 | 35,980 | `outdoors.castle` | 7,368 |
| beaches | 158 | 25,885 | `outdoors.beach` | 582 |
| lighthouses | 113 | 5,213 | `outdoors.lighthouse` | 1,159 |
| museums | 96 | captured | `poi.museum-notable` | |
| caves | 77 | 39,124 | `outdoors.cave` | 676 |
| monuments | 40 | 32,833 | `outdoors.monument` | 923 |

**The first finding corrects my own earlier one.** I had named the Historic England register, 379,685
listed buildings on disk and feeding nothing, as the biggest unused asset. Measured, German
heritage lists are the WEAKEST intent of anything here: `Liste der Baudenkmale` and
`Liste der Kulturdenkmale` together carry 2,691 articles at 23 to 25 readers a month, against a
German floor of 78 on the destination side. Entity supply was never that family's constraint
and the demand is thin. The register stays unbuilt, now for a measured reason.

**The second finding is where the constraint actually is.** The outdoor families already exist,
their intent is already proven, and their entities are already captured in bulk - and their row
counts are a few hundred against tens of thousands of entities. `outdoors.beach`: 582 rows from
25,885 beaches. `outdoors.cave`: 676 from 39,124. The gate they fail is FACTS PER ENTITY, not
demand and not supply. `wikidata-enrichment-probe-2026-10-07.json` already measured that honestly
on a 372-entity stratified sample: 74.2% gain at least one fact from Wikidata but only 19.6%
gain the two an own page needs, which is 7,874 entities of 40,123. Its own verdict was "REAL BUT
MODEST", and that is still the right word.

## Where the next layer is, sized rather than asserted

The three list kinds with the strongest measured English intent have NO entities on disk, and
the OSM extracts they would come from are no longer in the container. Wikidata holds them, CC0,
and for some classes it holds them with the facts the thin-entity gate wants - area, length,
elevation, depth, inception - which is the gate that throttles the OSM-sourced families above.

**For some classes.** The capture reports its own fact density per class and the spread is the
whole story: national parks arrive with two or more facts 76% of the time, 1,861 of 2,437, while
waterfalls manage 4.2%, 592 of 13,975, which is no better than OSM. So this is not "Wikidata
answers the fact gate". It is a source to be read class by class, and a class that comes back
thin stays unbuilt. `water-and-protected.provenance.json` carries the table.

Counted on QLever, entities carrying a country, coordinates and an English label:

| class | Wikidata entities | measured en list intent |
|---|---|---|
| river (Q4022) | **328,990** | 352 |
| lake (Q23397) | **213,641** | 349 |
| waterfall (Q34038) | 12,468 | 333 |
| island (Q23442) | **149,675** | 906 |
| protected area (Q473972) | **40,217** | (national parks, 1,731) |
| national park (Q46169) | 2,437 | 1,731 |

**734,990 entities** before any gate, in the classes with the strongest free-measured family
intent, from a source already licensed and already queried by this repository. The island and
park counts needed the English-label join dropped to answer inside the service's time limit,
so they count entities with a country and coordinates; the label comes with the capture.

Note the shape of the park row: "national park" proper is only 2,437 entities worldwide, and
the 1,731 reading belongs to the LIST of them in a country, which is an aggregation page per
country rather than a page per park. `protected area` at 40,217 is the entity-level layer under
it. The instrument measured a list intent and the entity count says what shape of page it
supports; conflating the two would have produced 2,437 pages on a 1,731 reading and called the
family validated.

That is the next build, and it is a build rather than a recovery: capture, gate on facts per
entity, aggregate per region, admit the families on a list-intent floor calibrated the same way
the per-city floor was - against the list kinds matching families the paid corpus ALREADY
proved, which puts the floor at 96, the German museum reading. None of it needs a paid tool and
none of it needs a gate relaxed.

## What remains true about the arithmetic

FINAL is 667,298 and the shortfall is 332,702. The repository's own gap analysis, regenerated
against the current manifest, still says the measured closure paths total 47,199. Nothing here
changes that number yet: this pass built the instrument that makes a new family admissible at
all, measured what it admits, and sized the one layer large enough to matter. The rows come
when that layer is captured and run through the funnel.

## The layer, captured, and what a list intent actually buys

`scripts/atlas/ingest/wikidata-water-and-protected.py`, output in
`data/atlas/sources/wikidata/water-and-protected-*.jsonl.gz`. Facts per entity are what decide
whether a class can carry a page, so the capture reports its own density and the spread is the
finding:

| class | entities | with two or more facts | rate |
|---|---|---|---|
| protected area | 40,217 | 33,124 | **82%** |
| national park | 2,437 | 1,861 | 76% |
| lake | 294,363 | 57,514 | 20% |
| island | 149,675 | 7,247 | 4.8% |
| waterfall | 13,975 | 592 | 4.2% |

Islands and waterfalls come back no better than the OSM layer's 3 to 4%, so the claim "Wikidata
answers the fact gate" is false and those two classes stay unbuilt on this evidence. Protected
areas and lakes put **90,638 entities past the two-fact bar**, against an existing outdoor layer
contributing about 55,000 rows across all its families.

### The mapping that stops this being an overclaim

A list intent is demand for a LIST. It maps to the aggregation families the inventory already
has in that shape - `outdoors.beach-in-region`, `outdoors.castle-in-region` - and NOT to a page
per entity. Someone searching a specific lake by name is a different intent, and the instrument
that measures it is per-entity demand, which the paid corpus measured for the outdoor layer and
which this instrument does not replace. Reading a list reading as a licence for entity pages
would be 90,638 pages justified by a measurement of something else.

So the list-intent yield is aggregation cells, and it is small. Country-level cells carrying at
least ten entities, which is the least a list page can be built from:

| class | countries with 10 or more | with 25 or more |
|---|---|---|
| island | 166 | 134 |
| lake | 125 | 99 |
| protected area | 88 | 54 |
| waterfall | 77 | 45 |
| national park | 59 | 22 |

**515 country-level list cells** in total. Times the locales each class's intent was measured in,
that is low thousands of rows, not hundreds of thousands. Region-level lists are more numerous
and would need the spatial join to the admin1 polygons to size, which is the next measurement
rather than a number to assert here.

### So, plainly, against the 332,702

This pass does not close it, and nothing measured here suggests a single free instrument will.
What it did:

  - built the instrument that makes any new family admissible at all, which was the hard
    blocker: without it the family set could only shrink
  - used it to refuse two things on measured grounds, the heritage register and the
    island/waterfall classes, which is worth as much as an admission
  - captured 90,638 fact-bearing entities in the two classes that survive, which feed the
    EXISTING aggregation families and the entity families where per-entity demand is already
    measured, rather than needing new ones

The honest next measurements, in order: the admin1 spatial join to size region-level list cells;
then the per-entity demand already recorded for the outdoor layer against these 90,638, since
tasks #97 and #98 established that population and this adds to it. Neither is a guess that can
be written down today.

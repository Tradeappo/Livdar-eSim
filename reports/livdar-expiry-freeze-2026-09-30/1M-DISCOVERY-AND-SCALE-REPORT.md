# Livdar candidate inventory: the discovery pass, what it found, and the honest arithmetic to one million

Written 2026-10-01. Production untouched. Nothing published. The live Atlas is still 500 pages
and there is no cohort 003.

## Where the count stands

| stage | rows |
| --- | --- |
| generated before any gate | 364,357 |
| removed by the uniqueness and SERP gate | 74,917 |
| removed as exact duplicate URLs | 0 |
| removed as semantic duplicates | 0 |
| removed as the same name in the same city | 57 |
| removed by the localisation and cross-locale gate | 62,911 |
| removed by cannibalisation | 0 |
| removed because the declared parent did not survive | 0 |
| **FINAL DISTINCT VALID** | **226,472** |
| shortfall to one million | 773,528 |

The funnel reconciles: generated minus every recorded removal equals the final count, checked by
a verifier that fails the run rather than by reading the numbers. 152 families across 11 markets.
Every artifact agrees: manifest, summary, QA report, gap summary, four partition axes, the
partition files on disk, and the rejected set. Em dash 0, en dash 0 across 1,901 files including
compressed partitions and filenames.

The count moved from 208,621 to 226,472 in this pass, and every one of those 17,851 pages came
from a measurement rather than from a relaxed gate. Four gates were ADDED in the same pass.

## What this pass changed, and why

### Defects fixed, with the measurement that found each

**748 duplicate aggregation URLs, then the last of them.** Fixed earlier by stable entity
identity; this pass took exact duplicate URLs to 0 and kept them there through a doubling of the
city pool.

**766 pages declaring a parent that does not exist.** The Wikidata builder rebuilt its parent
path from the city NAME while the aggregation builder had moved to resolved slugs, so every city
needing a discriminator got a parent URL that was never served: `/en/areas/london/` against the
real `/en/areas/london-gb/`. It now reads the parent URL out of the aggregation's own output.
A name-only join cannot drift when there is no join.

**23 pairs of URLs one keystroke apart, and 33,619 URLs carrying an unfolded Latin character.**
Four slug functions existed in this pipeline and three of them disagreed. There is one now, in
the module that owns identity, and it folds Latin diacritics while keeping CJK: blanket ASCII
folding would have emptied 1,268 Japanese kanji neighbourhood slugs across 9,874 candidates.
Collisions resolve in the folded space, so Lohne and Löhne get a discriminator rather than two
near-identical paths. Both counts are now 0.

**934 POI sharing a name inside one city**, fifteen Chopin benches in Warsaw among them, two
consecutive OSM nodes both called Kasmin Gallery, two Wikidata items for one Bonn museum. Nothing
in the data distinguishes them and no street address is carried, so there is no honest
disambiguator to add. A gate keeps one per name per surface per city and records the rest.

**31 pairs of cities with identical titles after the gazetteer grew.** Two towns called Ebersbach
sit in Saxony with admin2 empty in GeoNames, so neither region nor county separates them. The
label now falls back to the nearest substantially larger town, which is a real geographic fact
and is how a person actually tells them apart: Ebersbach near Zittau against Ebersbach near
Großenhain. 42 cities worldwide still fall through to an id, none of them in a Livdar market, and
one of those pairs (Red Hill, Horry County, South Carolina, twice, same population) is one place
recorded twice rather than two towns.

**A structural hole in the hierarchy.** Each builder resolved a child's parent against the pages
it had accepted, and nothing then checked whether the parent was still standing after the gates
in the manifest ran. A city list removed by the localisation gate used to leave its neighbourhood
lists pointing at a 404. A parent survival check now runs to a fixed point, because removing a
parent can orphan its own children.

### Six checks that were wrong, and how each was wrong

This is recorded in full because the pattern repeated and the pattern is the lesson: every one of
these compared rows against a field that carries a different measurement from the one the test was
about.

1. **20,107 "invalid hierarchies"** were 19,342 legitimate shapes. The parent of
   `/de/places/food/african/berlin/` is the city restaurant list, which is not a path prefix and
   does not need to be. The test is now existence, acyclicity, non-self and same-language, with
   the non-prefix count reported as information.
2. **5,885 "duplicate slugs"** were pages whose last path segment matches because the cuisine
   earlier in the path is what distinguishes them. The last segment is not the identity of a page.
   The check was replaced with the diacritic-fold collision test, which found something real.
3. **5,260 duplicate H1s** were a stub returning the bare entity name for every family but two,
   so Barcelona's "best for", "category" and "things to do" pages all reported the same H1.
4. **920 more duplicate H1s** after that fix, because the rewritten subject dropped the entity
   name for anything that was not a place: every Berlin venue page read "Berlin, DE: near venue"
   although the entity name already said which venue, and every London comparison read
   "London, GB: city vs city" although the name read "London vs Hanoi".
5. **117 of 151 families read as having no measured demand** because the acceptance test read
   `local_keyword`, which is the localisation gate's field and only 49,931 rows have one. Family
   demand lives in `market_demand_evidence`.
6. **activities.city-things-to-do rejected at 0.0309 similarity**, because similarity was computed
   across the whole family and the title skeleton is English for every locale, so a German and an
   English page about Barcelona compared as identical. Within a language the worst figure is
   0.0052. All 59 collisions were one city in different languages.

A seventh was caught by a printed zero rather than by an empty success: the parent assignment
script parsed the country out of its filename with `basename(f)[4:-10]`, which takes one character
too many and yields `D` for `poi-DE`, so every file was skipped and it reported "outdoor POI
tested: 0". The country was in every record the whole time.

### Three measurements that opened real paths

**NASA POWER answers from this container.** The note on the climate file on disk said the sandbox
had no network route to the host, and the climate families were built on 267 cities out of 31,715
as a result. The host returns HTTP 200 and gives 2001-2020 monthly normals for any coordinate, in
the public domain. Seven parameters by twelve months is 84 distinct numbers per city. 11,757
cities materialised so far and the fetch is running. The limit on the climate surface was never
the data; it was a fetch that had been written off.

Demand for the month grain was then measured before building anything, and it says what to build
and what not to. City-month pages are legitimate where the city is a measured destination and the
month phrase owns its own parent topic: Rome, Barcelona, Lisbon, Tokyo, Prague, Marrakesh and
Amsterdam all carry 100 to 1,600 monthly searches for a city-plus-month phrase at difficulty 0.
Hamburg, Vienna, Bordeaux and Krakow return 10 to 40 with a NULL parent topic, which means the
month phrase owns nothing. It is not 31,715 cities times twelve. The honest range is 25,000 to
60,000 pages across all markets and all months, at three grains, because the demand measurement
also found countries, US states, islands and regions in the same result set.

**The destination harvest.** The localisation gate rejects 62,911 rows for want of destination
evidence, and it is right to, because the evidence file behind it covered roughly 333 destinations
and 59 measured outbound pairs. Asking the demand side directly, one call per language in the
phrase that language actually uses, returned 638 rows that say three things:

- Cross-language destination demand is large and specific. 210 of the 638 rows are a destination
  outside the searcher's country, 91 under the searcher language's own exonym. Italians search
  `cosa vedere a praga` 9,300 and `tirana cosa vedere` 15,000; Germans search `prag` 15,000,
  `kopenhagen` 13,000, `lissabon` 9,700, `danzig` 3,700, `breslau` 2,800. Difficulty 0 to 7.
- Domestic small towns carry volumes population would never predict. 116 rows are a town the old
  gazetteer floor excluded: Szklarska Poręba 6,970 people and 9,300 searches, Wernigerode 32,000
  and 6,900, Taormina 5,790 and 3,900, Gramado and Campos do Jordão 14,000 and 10,000.
- Islands, regions, lakes and mountain areas are entity types the graph does not have, with 52,
  18, 4 and 3 measured rows behind them: Teneriffa 7,400, Kreta 7,400, Umbria 7,800, Cantabria
  8,100, Lago di Como 6,200, Harz 4,000.

**The gazetteer floor was the wrong quantity.** It was cities15000: 31,715 places with a
population floor near 15,000. Two independent measurements said so, the harvest above and the
567,208 POI whose `addr:city` string was not a gazetteer name at all. The gazetteer is cities5000
now, 64,418 places. Nothing is promoted by that on its own: tier is a rank over population, the
tier boundaries stay at the same absolute ranks, zero existing cities changed tier, and every new
city lands in tier 4, which no city family draws from. What changed is measurable:

| | before | after |
| --- | --- | --- |
| POI attributed by tag | 991,532 | 1,169,012 |
| POI attributed spatially | 2,355,190 | 2,665,946 |
| POI attributable to nothing | 1,665,240 | 1,177,004 |
| POI on a city string not in the gazetteer | 567,208 | 388,841 |
| aggregation candidates | 148,447 | 150,896 |

488,236 more POI now belong somewhere. That produced 2,449 more aggregation candidates, because
most of the newly attributed POI land in small towns that do not meet the minimum counts, which is
the gate working. The cities the harvest measured enter the city-family pool whatever their tier,
which added 3,866 pool entries and is the only thing that overrides a tier.

The rows also carry GeoNames alternate names now, and that is the honest exonym table. Prague's
row holds Praga, Prag and Praha; Munich's holds Monaco di Baviera and Monaco's does not. Resolving
the harvest through it took 452 rows to 511 of 638, with 14 unresolved and written to their own
file rather than dropped: Travemünde is a district of Lübeck and belongs in the neighbourhood
layer, and Assisi, Karpacz, San Gimignano and Kazimierz Dolny are below 5,000 even in GeoNames'
count.

## The outdoor path, measured

The brief names outdoor and geography as the principal scale path. The number that decides it is
the share of rural POI that attach to a real geographic parent by containment, and it was
unmeasured until this pass because the parent layer did not exist: the POI ingest reads nodes and
filters amenity-shaped tags, and a protected area is a way or a relation. Germany now has a parent
layer of 131,869 entities, 56,554 of them polygons.

The raw attachment rate is 98.5 per cent and **should not be quoted**, because 73.3 per cent of
those attachments are to a region or a county and every point in Germany is inside a region and a
county by construction. A rate that counts administrative containment is measuring geometry.

The honest numbers:

- 26.7 per cent of attachments are to a real outdoor parent: protected area 6,457, forest 2,860,
  nature reserve 2,812, park 1,195, national park 887, mountain range 707, island 211.
- Restricted to children worth a page, which excludes the 25,968 memorial plaques: 34,767
  features, of which 13,123 or 37.7 per cent sit inside a real outdoor parent.
- That yields 854 outdoor parent-by-class cells with at least three features, 462 at five, over
  3,090 distinct parents, with 144 parents holding two or more qualifying cells.
- And separately 1,395 region-or-county cells at three, 961 at five, over 400 parents. These are
  not administrative noise: the outdoor demand measurement found demand that is region-scoped far
  more often than park-scoped, `seen in bayern` at 8,600 and difficulty 0, `best beaches in
  cornwall` at 1,800. Peaks in Hochsauerlandkreis is the family demand actually asks for.

Germany is large, mountainous and the best-mapped country in OSM, so it is an upper-middle case.
Across eleven markets a multiplier of 6 to 8 puts the outdoor aggregation layer at roughly 13,000
to 18,000 pages. **Outdoor is a real path and it is not the size the brief hoped for.** Reporting
it as several hundred thousand would require counting administrative containment as attribution or
memorial plaques as destinations, and both are refused here.

One named gap keeps that number smaller than it could be: 70,975 trail systems in the German
layer are route relations carrying no geometry in this extract, so hiking routes contribute
nothing to containment yet, and a trail is one of the most demand-rich outdoor parents there is.

### The feature layer, which turned out to be the largest path in the pass

The POI corpus kept no elevation. 246,255 named peaks held an id, a class, a name, a country and a
coordinate, which is a name on a map, and this project had already refused to build pages out of
those. A second pass over the same preserved German extract captured what the ingest had thrown
away, and the result changes the arithmetic more than anything else found here.

171,666 outdoor features for Germany: 32,938 with an elevation, 26,598 with a Wikidata item,
11,768 with a Wikipedia article, 3,440 carrying a local-language name. Berchtesgadener Hochthron
comes back with elevation 1,972m, prominence 1,278m, a summit cross, Q317811, the German Wikipedia
article and, now, monthly climate normals for the nearest city. That is a page.

The gate: a feature carries a page when it is notable and measurable, or notable with practical
detail, or measurable with practical detail. Notable means a Wikidata item or a Wikipedia article.
Measurable means a number a reader came for. Practical means something that governs a visit.
**23,540 of the 100,691 non-route features qualify, 23.4 per cent**: 12,787 peaks, 2,806 camp
sites, 2,688 caravan sites, 1,466 castles, 1,110 towers. 48,215 carry only a name and are counted
rather than quietly included.

The caveat has to travel with the number. Wikipedia presence is a **source-backed proxy for public
interest, not a demand measurement**. Ahrefs cannot measure 23,540 German peaks and no keyword
volume was bought for any one of them. Every other family in this inventory rests on a measured
keyword; this one would rest on a proxy. The proxy is defensible, because an editor wrote an
encyclopedia article about the thing and that is a stronger signal than a population rank, but it
is a different kind of evidence and it is labelled as one rather than averaged in.

## Tools are not a scale path, and here is the arithmetic

A tool is a calculation and is useful only where real per-entity inputs exist, so it scales with
the entities for which this project holds licensed data. Cost of living is country level: 199
countries, 36 with a full basket, **0 cities**, and that zero is recorded rather than estimated
because no openly licensed city consumer price index exists across the priority destinations. Rent
and salary are Eurostat, also country level, also no cities.

Thirty tool families across the seven themes the brief names, against 36 fully-backed countries,
is 1,080 pages. Against all 199 countries it is 5,970, most resting on a single ratio, which
would fail the distinct-data condition of the acceptance test. Tools are worth building for three
reasons that have nothing to do with page count: a working calculation is the strongest possible
answer to the usefulness test, tools are where the commercial intent sits, and a tool page earns
links the aggregation pages do not. One licensed city-level price, rent or wage series would turn
every economic tool family from country-scoped to city-scoped against a pool of 64,418. It does
not exist openly today.

## The ten-point acceptance test and the unique content contract

Both are computed per family, in one script, because they are one computation. 152 families: 118
accepted, 33 accepted with an unknown, none rejected. The unknowns are 32 families whose SERP
archetype has not been sampled and 15 resting partly on demand measured in another market, both of
which are missing measurements rather than failures and are not rounded into one.

The contract records `unique_fact_count`, `unique_data_point_count`, `distinct_entity_count`,
`template_ratio`, `similarity_score` and `information_gain_reason` per family, in
`1M-UNIQUE-CONTENT-CONTRACT.csv`. `template_ratio` is reported and not thresholded: one template
serving 4,979 pages is how a programmatic page set works, and whether that is thin depends on
whether each page carries distinct data, which is a different condition's job.

## QA

| check | result |
| --- | --- |
| distinct URLs | equal to row count |
| duplicate canonicals | 0 |
| URLs colliding once diacritics are folded | 0 |
| URLs with an unfolded Latin diacritic | 0 |
| declared parent is not a valid parent | 0 |
| intent owners claimed by more than one URL | 0 |
| URLs sharing a cannibalisation key | 0 |
| locale mismatch between URL and row | 0 |
| same entity id under two names | 0 |
| candidates with no usable source | 0 |
| kept rows with a rejecting localisation class | 0 |
| family and locale cells failing the usefulness test | 0 |
| templates with repeated entities | 0 |
| exact duplicate titles | 0 |
| duplicate meta within a market | 0 |
| duplicate H1 within a market | 0 |
| orphan pages | 61 |
| em and en dashes | 0 |

Every duplication check reads zero. The last 31 title, meta and H1 duplicates were the same-named
city pairs, and the nearest-larger-town discriminator closed them in the following run. The 61
orphans are pages whose declared parent is valid and whose sibling set is empty, counted rather
than hidden: they are the one number in this table that is not zero and it is not rounded away.

## The arithmetic to one million

| path | measured contribution | basis |
| --- | --- | --- |
| current inventory | 226,472 | built and verified |
| outdoor FEATURE entities | 120,000 to 165,000 | Germany measured at 23,540, extrapolated at 5 to 7x |
| outdoor aggregation, 11 markets | 13,000 to 18,000 | Germany measured at 2,249 cells, 6 to 8x |
| climate at three grains | 25,000 to 60,000 | demand measured per grain, data materialising |
| region and island entity types | 10,000 to 30,000 | demand measured, entities not yet built |
| county level where data exists | 10,000 to 40,000 | data-bound, mostly US |
| tools | about 1,000 | arithmetic above |
| **defensible total** | **405,000 to 540,000** | |

To reach one million from here would require one of three things, and the first two are refused:

1. Relaxing a quality gate. Each gate is in the repository with the measurement that put it there.
2. Translating families across eleven markets without local evidence. The localisation gate exists
   precisely to stop that and it rejected 62,911 rows in this build.
3. A new entity axis of roughly 460,000 real entities carrying distinct data AND measured demand.
   The outdoor feature layer is the only candidate found in this pass and it is now measured
   rather than hypothetical: 23,540 qualifying features in Germany, 120,000 to 165,000 across
   eleven markets. That is a quarter of what would be needed, and it rests on a Wikipedia proxy
   rather than a keyword measurement, so it cannot be stretched by lowering its bar without
   turning 48,215 names on a map into pages.

**The honest conclusion is that one million valid pages is not reachable from the sources
available today without breaking a rule the brief itself sets.** That is stated as a measured
result with the arithmetic attached, not as a refusal to try: this pass added 17,851 pages, four
gates, three new data sources and six corrected checks, found the largest remaining path by
re-reading data an earlier ingest had discarded, and sized every path named in the brief either by
building it or by recording the specific missing input that blocks it.

Between 405,000 and 540,000 is the defensible ceiling with everything measured here built out. If
the target is one million, the gap is a sourcing problem with three named candidates: a licensed
city-level price, rent or wage series, which would turn every economic family from country-scoped
to city-scoped against a pool of 64,418; route member geometry and the other ten parent layers,
which are downloads; and a demand instrument for feature pages better than a Wikipedia proxy. None
of those is a gate to relax.

## What is still running or waiting

- NASA POWER climate normals: 11,757 of 64,418 cities, resumable, about three hours of fetch left.
- Wikidata: 146 files, 14 of 24 classes, restarted after the worker died, under WDQS throttling.
- Outdoor feature extraction for Germany: DONE, 171,666 features, 23,540 of them page-worthy.
  The candidate builder for them is written and not yet run against this layer.
- Parent layers for the other ten markets: downloads rather than questions.
- Route member geometry for 70,975 trail systems: not started, named as the largest gap in the
  outdoor layer.
- A separate technical audit of sitemaps, redirects and Google Search Console, which the brief
  ring-fenced from this pipeline: acknowledged, not started, and deliberately kept apart.

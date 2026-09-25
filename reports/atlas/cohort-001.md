# The first 250 pages, and the number that was wrong by 72 times

24 September 2026. The brief was to build the data layer until at least 250
true eligible high value pages exist. They exist, they are selected into a
cohort, every page builds, and every cohort QA check passes.

**295 eligible pages. 250 in the cohort. 22 checks, 0 failures.**

## The 72 fold correction

The previous report said eligible was 2,600. That number was a family
property, and a family is not a page. `cost-of-living.country` was eligible
because its source existed and a keyword had been measured, and that sentence
is true while only 36 of its 2,490 combinations have both a country the source
covers and a keyword measured in that country's market.

`lib/atlas/eligibility-pages.js` resolves eligibility per page. Four
conditions have to hold at once:

1. every source the family needs is built
2. that source covers this entity, not just the family
3. a keyword for this entity in this market was measured with volume above zero
4. the tool or ranking behind a global scope page can actually be computed

The first run returned 36 pages where the family view had said 2,600.
Everything below is the work of moving that number to 295 honestly.

## Two measurement bugs the resolver found

**Volumes were keyed by keyword alone.** "salary calculator" is 148,000 a
month in the United States and 277,000 in the United Kingdom. A keyword only
index hands one market the other's number, and it had been doing so silently.
The join key is now market and keyword together, and the earliest three
measurement files, which predate the convention and carry only an Ahrefs
country code, have their market derived rather than assumed.

**A tool page inherited its family's source rather than its own.** Every tool
family declares `cost-of-living-verified`, so `rent-affordability` looked
eligible while the rent level it needs does not exist anywhere. Global scope
pages are now checked against the thing itself: the tool must be in the queue
with all its own sources built, or the ranking must reach the population its
title claims. A ranking on the Eurostat index covers 39 countries, 37 of them
European, and as a world list that is a fifth of the population its title
claims, so the world lists sort on the World Bank ratio instead, which reaches
199.

## What was measured

2,288 Ahrefs units, 10 markets, one call each, 99 rows with volume.

| Market | Salary calculator | Cost of living comparison | Moving cost | Where should I live |
| --- | --- | --- | --- | --- |
| en-US | 148,000 | 49,000 | 2,500 | 6,200 |
| en-GB | 277,000 | 1,700 | 150 | 200 |
| de-DE | 88,000 | 100 | 150 | 10 |
| pl-PL | 254,000 | 0 | not returned | 10 |
| ja-JP | 17,000 | 0 | 90 | 40 |
| pt-BR | 9,900 | 0 | 0 | 90 |
| it-IT | 2,200 | 10 | 250 | 40 |
| fr-FR | 300 | 10 | 700 | 150 |
| es-ES | 900 | 0 | 150 | 60 |
| nl-NL | 300 | not returned | 70 | 0 |

The zeros are kept. A measured zero says this shape of page should not be
built in this market, and that is a finding rather than a gap.

## The cohort

250 pages. 7 families, 3 surfaces, 9 languages, 43 entities, 100 percent high
priority, 675,300 measured searches a month behind them.

| Pages | Family | Surface | Measurable on its own |
| --- | --- | --- | --- |
| 158 | cost-of-living.country | move | yes, plus or minus 7.8 points |
| 24 | rankings.index | tools | no, 24 pages |
| 23 | tools.calculator | tools | no, 23 pages |
| 23 | work.country-salaries | work | no, 23 pages |
| 9 | tools.cost-comparison | tools | no, 9 pages |
| 8 | tools.matcher | tools | no, 8 pages |
| 5 | tools.cost-calculator | tools | no, 5 pages |

The concentration is a fact about the data layer rather than a choice. The
allocation rule is equal share first and surplus to whoever has room, which is
the standard fair division rule and not a tuned threshold; six of the seven
families were given everything they had, and the seventh absorbed the rest
because it is the only family with a source that covers 199 countries.

The manifest says which families support a rate and which do not, so that
nobody reads an indexation rate off five pages. That sentence is in the
manifest rather than in this report because the manifest is what the next
person will open.

**Difficulty is recorded and never used to exclude.** 208 pages are winnable
at difficulty 30 or below, 9 contested, 3 long shots, 30 unknown. The Polish
salary calculator at 254,000 a month and difficulty 44 is in the cohort
because it is an eligible page; it is also not going to rank in six weeks, and
a cohort that could not tell the difference would read its own failure as a
finding about indexation.

## The pages

Each page is a model: metadata, facts, paragraphs, a table, questions,
provenance and internal links. The renderer prints the model and QA inspects
the same object, so what QA checked is what ships.

**Sentences are selected by the data.** Whether a country page carries the
basket spread sentence depends on whether twelve categories exist for it;
whether it carries the inflation sentence depends on whether a series covers
it and whether prices rose or fell; the rank sentence knows which half of the
same scale group the country sits in. Two pages in one family therefore differ
by more than their numbers.

**Copy is written per language, not translated.** Nine packs, each written
against the same list of things a page has to say. The German moving
calculator is reached at `umzugskosten-rechner` and the British one at
`removal-costs-calculator`, because those are the phrasings that were
measured, and slugging from the measured keyword makes an identical
translation structurally impossible.

**Grammar is data.** French, Italian and Portuguese put an article in front of
almost every country, so the subject form is stored rather than assembled and
a country missing from the table refuses the page instead of producing "Suisse
a un niveau des prix". Polish writes the locative, which never matches the
nominative in the store, so the heading raises the last token instead.
Japanese pages are counted in characters against their own floor rather than
being declared thin by a rule written for languages with spaces.

## QA, and the two checks that failed first

22 checks over 250 pages. Two of them failed on the first run and both were
right.

**The tool pages were the same page eight times.** Near duplicate detection
put `budget-voyage` and `comparateur-cout-de-la-vie` at 98 percent similar,
because both were the generic description of how a calculator works with the
title changed. Every published tool now has its own copy in all nine
languages, saying what question it answers and, more usefully, which question
it refuses. Similarity fell to zero pairs over threshold.

**The cheapest list and the most expensive list were one page reversed.** 84
percent similar, and again correct: sorting the same measure the other way is
not writing a second page. They now carry different warnings, because they
need different ones. A low price level usually travels with low wages, so
cheap is not good value for somebody earning locally; a high price level
usually travels with high wages, so expensive is not unaffordable.

The other twenty checks passed after three smaller corrections: title and
description bounds are per script rather than per character count, uniqueness
of a title is checked within a language rather than across them, and the
moving cost calculator, which has no statistical office behind it because none
publishes removal prices, now carries provenance for its own model at
confidence `modelled` instead of an empty source list.

| Check | Result |
| --- | --- |
| every page builds | 250 of 250 |
| unique path, title, description, h1 | pass, uniqueness scoped per language |
| word floor | pass, per script |
| canonical self referential | 250 |
| hreflang complete and reciprocal | 250, x-default on every cluster with an English page |
| JSON-LD WebPage, BreadcrumbList, FAQPage | 250 |
| provenance with licence on every source row | 250 |
| no long dashes anywhere | 888 files scanned, 0 found |
| internal links resolve inside the cohort | 250, 0 orphans, minimum 2 inbound |
| near duplicates | 1,540 comparisons, 0 pairs over 0.8 |
| source freshness | 250 publishable |

## Internal linking, and why there were 107 orphans

The first version used a priority order and a cap of eight links. Every
country page spent its eight slots on the same three rankings and five tools,
so 107 country pages linked out and nothing linked back. Links are now
allocated by quota per kind, and siblings are chosen from a ring: each page
links to the ones that follow it in sorted order, wrapping at the end, so
every page in a family receives exactly as many sibling links as it gives.
That makes a family provably free of orphans rather than orphan free by luck.

## Routes and sitemap

33 route folders under `app/[lang]/`, one per segment, with
`dynamicParams = false` so a URL outside the manifest is a 404 rather than an
empty page. None of them collides with a segment the eSIM site already serves,
and a test asserts that the six existing route folders are untouched.

19 sitemap files, split by language and surface rather than by family, because
surface is the unit the cohort metrics are read at. 250 entries, each listed
once, priority scaled by measured demand rather than set to a constant.

## Two bugs found in passing

**The registry migration reported a healthy store as a failed migration.** Its
verification compared entry counts between the flat file and the shards, and
the shards legitimately hold entries the flat file never had. It now checks
that everything in the flat file arrived with the same state, and reports what
is missing or changed instead of a boolean.

**The inventory was reading the flat registry.** The store moved to shards and
the report kept printing the funnel as it was before the shards existed. It
now reads the sharded store when one is present, and carries the per page
eligible count next to the family count so the two can never be confused
again.

## The funnel

| State | Pages |
| --- | --- |
| candidate | 2,939,607 combinations, which are not pages |
| eligible | 295 |
| approved | 373 |
| published | 123, all from the earlier eSIM era families |
| live | 0 of the new cohort |

Approved is the honest state for the 250: the sources exist, the demand was
measured, the pages build, QA passed, and nothing has been deployed.

## Spend

Ahrefs: 2,288 units this step, all of it on tool and ranking demand in ten
markets. 911,217 used of 2,000,000, expiring 8 October. DataForSEO: nothing.
No paid run was started and none is close to the 25 dollar threshold that
requires asking first.

## What is still not built

50 families remain blocked on a source that does not exist. In the order the
brief set: places, neighbourhood facts, visa, work and tax rules, sport
routes, venue data, events, stay inventory, community listings. Nothing in
this cohort depends on any of them, which is the point of having built the
cohort out of what exists rather than out of what is planned.

`next build` could not be run in this environment: the npm registry is not
reachable from the sandbox, so `node_modules` cannot be installed. Everything
that can be checked without a bundler has been, including that every route
file names its own segment and that static params cover the manifest exactly
once.

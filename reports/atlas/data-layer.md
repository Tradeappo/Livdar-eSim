# The data layer, and the first number that moved

24 September 2026. Research stopped. The question was never demand any more;
it was that fifty six of sixty four families could not produce a page because
the sources did not exist, and eligible candidates stood at zero.

**Eligible is now 2,600 across three high priority families**, and the first
cohort has 178 high priority pages of 250 instead of none.

## Cost of living, built

Three datasets, fetched live and stored under
`data/atlas/sources/cost-of-living/`. The sandbox has no network route to
either API, so each was fetched through a browser and reduced in the page
before transfer; the endpoint, the capture method and the provider's own
update timestamp are recorded in every file.

| Source | Dataset | Reach | Licence |
| --- | --- | --- | --- |
| Eurostat | prc_ppp_ind, price level index, EU27 = 100 | 39 countries, 13 baskets, 2024 | reuse including commercial, attribution |
| Eurostat | prc_hicp_aind, annual inflation | 36 countries, 2025 | same |
| World Bank | PA.NUS.PPP over PA.NUS.FCRF | 203 countries, mostly 2025 | CC BY 4.0 |

Eurostat reaches further than expected: Japan, the United Kingdom, the United
States, Switzerland, Norway, Iceland and Turkiye are all in the European
series. The World Bank ratio is derived rather than taken, because the
indicator that used to publish it directly now returns "deleted or archived",
and the derivation is recorded on every value.

**Coverage, counted honestly.** 199 countries: 36 with the full twelve
category basket, 3 with the headline only, 160 with the World Bank ratio
only. All eleven priority destinations are covered. Not one city.

| Priority destination | Coverage | Headline |
| --- | --- | --- |
| Spain | full basket | 90.7 |
| Italy | full basket | 98.1 |
| France | full basket | 107.9 |
| Portugal | full basket | 85.0 |
| Japan | headline only | 89.0 |
| United Kingdom | headline only | 129.1 |
| Canada | ratio only | 0.83 |
| New Zealand | ratio only | 0.86 |
| UAE | ratio only | 0.63 |
| Costa Rica | ratio only | 0.59 |
| Thailand | ratio only | 0.31 |

**City level is absent, not estimated.** No openly licensed city consumer
price index exists across these destinations. Rather than let four city
families quietly inherit a national figure and present it as a city one, the
source was split: `cost-of-living-verified` is built at country level and
`cost-of-living-city-verified` is a named source that does not exist.
`cost-of-living.city`, `cost-of-living.city-vs-market`, `relocation.city` and
`comparisons.city-vs-home` now point at the one that does not exist and stay
blocked. A test asserts they still do.

## The gates caught real errors, twice

**Four impossible values were rejected.** The World Bank capture contains a
price level of 0.0024 for Liberia, 0.0003 for Turkmenistan, 0 for Venezuela
and 3.52 for Iran. None is a price level; they are currency regime artifacts
in a ratio of two series. A programme without the range gate would have
published them. The test that guards this asserts the bad values are still in
the fixture, so it cannot pass by the fixture being cleaned.

**The coverage classifier was wrong and a test caught it.** Its first version
counted measures rather than basket categories, so Japan, which has the
Eurostat headline and the World Bank ratio and none of the twelve categories,
was classified as a full basket country. It is now headline only.

Two provider codes would have silently lost two countries: Eurostat writes EL
for Greece and UK for the United Kingdom against ISO 3166's GR and GB. Both
are mapped and both mappings are tested.

## The framework, which is the durable part

The ingest is small. What outlives it is the five modules underneath.

**Provenance.** Every publishable value carries value, unit, source,
sourceRef, entity, observedAt, validFrom, validTo, ingestedAt, confidence and
licence. A value missing any of them cannot be published. Five confidence
levels rank sources, so Eurostat beats the World Bank in Europe without
either being special cased, and a derived value that does not record its
derivation is refused.

**Freshness, per class rather than per source.** Live data lives a day,
events three, rules ninety with a recheck at thirty, prices five hundred and
fifty, reference five years. The distinction that matters is `staleIsWrong`:
a two year old price index is the newest that exists and publishes with its
date, and a two year old visa rule may be false and does not publish at all.
Inflation is ingested alongside the price levels precisely so drift can be
computed rather than assumed.

**Ten quality gates**, every one able to fail on its own and every one
tested: missing source, stale source, incompatible unit, duplicate record,
country mismatch, locale mismatch, impossible value, missing provenance,
licence absent, failed refresh.

**A reusable adapter.** A source supplies four things, fetch, parse,
mapEntity and describe, and inherits normalisation, provenance, the gates and
the coverage report. The next nine ingests are adapters rather than pipelines.

**A source registry** holding all sixteen sources with provider, dataset,
access, licence class, commercial reuse, storage rights, freshness class,
refresh interval, cost, rate limits, coverage, state, ingest script, store
and the exact families each unlocks. A test refuses a source that unlocks a
family that does not exist, and refuses any source marked built that does not
permit commercial reuse.

## What each remaining source decided

| Source | Decision | Why |
| --- | --- | --- |
| places-data-verified | build, OpenStreetMap | Only candidate with unrestricted commercial reuse. Geofabrik extracts, never Overpass for bulk. Ratings, popularity and price bands do not exist in it and will not be invented. |
| neighbourhood-facts-verified | build after places | Boundaries come from OSM; everything else is a count over the places layer. |
| salary-data-verified | build | Free and open. The hazard is combining incompatible series, so the adapter records gross against net and which occupation classification per country, and refuses comparisons across them. |
| rent-index-verified | build, partially | Coverage defines scope. Marketplace scraping refused: against their terms and a biased sample of asking prices. |
| visa, work and tax | build manually | No API anywhere. Schema built, citations enforced, store empty. |
| events-verified | blocked, partner or drop | No licensed feed exists. Ticketmaster, Eventbrite, Meetup and Fever all refused. The highest volume surface in the programme and the least licensable. |
| stay-inventory-verified | blocked, commercial | Not a technical problem. The measurement is unusually good and what is missing is a contract. |
| sport-routes-verified | build after places | OSM for geometry, open forecasts for conditions, stored separately because conditions are true for hours. Strava refused. |
| venue-data-verified | build, Wikidata | The cheapest unbuilt source in the programme, gating the best measured opportunity. |
| community-listings-verified | first party or nothing | Every platform holding this data forbids redistributing it. |

## Visa, work and tax: the schema is built and the store is empty

That is the accurate state and it is deliberate. `lib/atlas/sources/rules.js`
defines the fields for all three domains and enforces two rules that cannot
be bypassed: every record cites an official government page, and every record
carries the date somebody read it. A record with a source on a non government
domain is rejected. A record with a year instead of a date is rejected. A
record with a field not in the schema is rejected.

Nothing has been entered, because entering it requires reading official
sources, and the one thing that must never happen here is a visa rule written
from memory. Somebody can act on a wrong entry requirement by booking a
flight. The entry queue is derived from the destination tiers, thirty three
items, Spain first.

## The moving cost calculator

Built. The only tool that needed no licensed dataset, and the highest cost
per click measured anywhere at five dollars against 2,500 searches a month.

Six move sizes, five transport modes with their own distance limits, and a
model over volume, distance, crew, packing, storage, insurance and
international handling. Volume beyond one vehicle becomes a second trip,
which a linear model would miss.

It never returns a single number. Every estimate is a range with three
scenarios, each saying what it assumes, plus a full breakdown, the
assumptions in plain words, and a disclaimer that it is not a quote.
International moves carry a wider range than domestic ones because more of
the cost is outside the mover's control. A test asserts the range never
collapses to a point.

Route landing pages are gated on measured route level demand, which does not
exist, so none is enumerated.

## The tools queue, recomputed

Building one source took the buildable count from one to three.

| # | Tool | Volume | Difficulty | CPC | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Moving cost calculator | 2,500 | 41 | $5.00 | buildable |
| 2 | Cost of living comparison | 49,000 | n/a | $0.45 | buildable |
| 3 | Travel budget | 150 | 9 | $0.70 | buildable |
| 4 | Commute calculator | 350 | 9 | $2.00 | needs transit fares |
| 5 | Rent affordability | 3,600 | 31 | $0.30 | needs rent index |

`rent-index-verified` now blocks five tools, more than any other source, and
is the next one to build.

## The inventory

| State | Before | After |
| --- | --- | --- |
| candidate | 2,937,117 | 2,937,117 |
| source ready | 123,961 | 147,020 |
| keyword measured | 692,364 | 1,902,384 |
| SERP measured | 0 | 0 |
| blocked | 2,813,156 | 2,790,097 |
| **eligible** | **0** | **2,600** |
| families blocked | 56 | 48 |
| families eligible | 0 | 3 |

Eligible means both things at once: the sources exist and the demand was
measured. `cost-of-living.country`, `tools.calculator` and `tools.matcher`
are the three, and all three are high priority.

One Ahrefs call of 792 units converted the largest of them. Thirty six
country phrasings, most at difficulty 0 to 8: Japan 3,100, Switzerland 2,300,
Spain 2,200, Ireland 2,000, Portugal 1,900, Italy 1,700. That is a winnable
family with a built source behind it, which is a sentence that could not be
written yesterday.

## The cohort, redesigned

250 pages, 14 families, 5 surfaces.

| Pages | Family | Status | Priority |
| --- | --- | --- | --- |
| 51 | cost-of-living.country | eligible | high |
| 41 | tools.calculator | eligible | high |
| 30 | tools.matcher | eligible | high |
| 12 | cost-of-living.country-vs-market | source ready | high |
| 12 | comparisons.city-vs-city | source ready | high |
| 12 | rankings.index | source ready | high |
| 10 | tools.cost-comparison | source ready | high |
| 10 | tools.cost-calculator | source ready | high |
| 12 | transport.route-from-market | source ready | medium |
| 60 | five climate, airport and hub families | mixed | low |

178 of 250 are high priority against none yesterday. 122 are eligible. It now
answers a sixth question, whether measured demand converts, and it still
says nothing about the nine surfaces whose sources do not exist.

## Spend

Ahrefs: 792 units, one targeted call that converted a family from source
ready to eligible. 908,929 used, 1,091,071 left, expiring 8 October.
DataForSEO: nothing, as instructed. The bulk manifest should be recomputed
after the next two sources are built, because measuring candidates that
cannot become eligible is what the cap was protecting against.

## Next step

Build `rent-index-verified`. It blocks five tools, more than any other
source, including rent affordability at 3,600 searches a month and where
should I live at difficulty 1. Eurostat publishes `prc_hpi_q` and the actual
rentals component of the HICP, both on the same API and the same licence as
the source built today, so the adapter is already written and the ingest is a
second instance of it.

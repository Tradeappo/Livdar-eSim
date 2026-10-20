# Cohort 003: 1,000 pages, prepared and not deployed

Built 2026-10-20. Nothing is live. The live 500 are untouched, the 23,453 climate
city-name-swap rows stay out, and the one line that would publish this cohort is
deliberately not written: see **Not done on purpose** at the end.

    pages                1,000 exactly
    family               weather.city-month, one page per city per language
    languages            9
    markets              10
    countries covered    49
    cohort QA            PASS, 0 failures of 0 checked
    near duplicates      0 pairs over the 0.8 threshold in 53,594 comparisons
    orphans              0, minimum inbound links 3, median 8

---

## 1. What the live experiment contributes, which is less than hoped

The brief asked to favour families and languages that recrawled or indexed better,
using the 500-page cohort as the benchmark. The benchmark does not support that
instruction, and saying so is more useful than inventing a ranking:

| measured on the live 500 | result |
|---|---|
| indexed | **0** |
| URLs with at least one impression | 0 |
| URLs ever crawled | **1**, on 2026-09-29, which landed inside the ISR 500 window |
| "Discovered, currently not indexed" | 420 |
| "URL is unknown to Google" | 79 |
| HTTP 200 on inspection | 500 of 500 |
| noindex present | 0 |
| self-canonical | 500 of 500 |

No family indexed better than another because none indexed at all. The only live
differentiator is **discovery, and it is sitemap membership exactly**: the 79 URLs
Google calls unknown are precisely the 79 it says are not in the sitemap. That is a
publishing defect of ours, not a quality signal about a family, so nothing in this
cohort is weighted by it. All 79 are in the published manifest today, so the gap is
either a stale read on Google's side or a sitemap-serving fault, and **verifying
which is a launch gate** rather than an assumption.

## 2. Why this family, and why not the 1,002,362 inventory

**The renderer is the constraint, not the inventory.** This repository has thirteen
page-model builders and they are exactly the thirteen families already live.
Everything else in the 1,002,362 candidate rows - landmark, settlement, heritage,
places, transport, outdoors - has a URL, a title, facts and provenance, and no way
to be served. Unpublished inventory inside the renderable families: **20 rows.**

So reaching 1,000 meant making one more family renderable. `weather.city-month` was
chosen on four measured grounds:

1. **Demand measured in its own market on every row.** All 26,665 candidate rows
   carry `measured_in_this_market`. No other family of that size does: the next
   largest candidates, transport pairs at 125,652 and the Wikidata landmark layer at
   153,563, carry none.
2. **The source was already captured and merely unwired.** The NASA POWER climatology
   endpoint had been fetched for the whole gazetteer into 246 shards, 64,418 cities,
   and the gate that publishes the store only ever read the 55-city browser capture
   beside them. Wiring the two together, with all six of its checks unchanged, kept
   64,418 cities and rejected none.
3. **The page can clear the word floor honestly.** 250 words, or 320 characters in
   Japanese. Measured over the cohort: minimum 297, median 357, maximum 943.
   The Wikidata entity pages cannot: they carry two to eight facts and would need
   boilerplate to reach the floor, which the near-duplicate gate would then catch.
4. **It is a question with a stable answer.** Monthly normals change when the provider
   republishes them, not when someone edits a page.

## 3. The exact 1,000

Full list: `data/atlas/cohorts/cohort-003.json` (selection record, 1,000 paths) and
`data/atlas/cohorts/cohort-003-pages.json` (10.3 MB, every page as a complete model).

| language | pages | market | pages |
|---|---:|---|---:|
| de | 43 | es-ES | 203 |
| en | 203 | en-US | 197 |
| es | 203 | fr-FR | 146 |
| fr | 146 | nl-NL | 111 |
| it | 42 | pt-BR | 101 |
| ja | 74 | pl-PL | 77 |
| nl | 111 | ja-JP | 74 |
| pl | 77 | de-DE | 43 |
| pt | 101 | it-IT | 42 |
|  |  | en-GB | 6 |

Markets total 1,000. Languages total 1,000. `en` splits across en-US and en-GB by the
market model, which assigns a page to the market whose home country it is in.

**Top countries covered** (49 in all):

| country | pages |
|---|---:|
| IN | 254 |
| CN | 118 |
| TR | 82 |
| US | 74 |
| ID | 68 |
| BR | 62 |
| MX | 44 |
| DE | 33 |
| VN | 30 |
| JP | 27 |
| MA | 19 |
| CO | 16 |

## 4. How the 1,000 were chosen

Nine gates, applied in order, every rejection counted:

| gate | refused |
|---|---:|
| its title is already taken in this language | 956 |
| no copy pack for this language | 18 |
| too similar to a page already taken | 14 |
| title outside its length bounds | 8 |
| no URL could be built for this language | 1 |

From 26,665 candidate rows, **25,682 were eligible** and 1,000 were taken.

**The allocation across languages is deliberate and bounded.** Ranking the whole pool
by the manifest's publication priority put 969 of the first thousand in Japanese,
because that score is comparable inside a market and not across them, and a cohort
like that would measure Japanese indexation and say nothing about the other eight
languages. So each language gets its share of the eligible pool by largest remainder,
with a floor of 40 and a ceiling of 200, and a round robin passes an unfilled quota to
the others:

| language | eligible | quota | taken |
|---|---:|---:|---:|
| de | 855 | 40 | 43 |
| en | 5293 | 200 | 203 |
| es | 6063 | 200 | 203 |
| fr | 3682 | 143 | 146 |
| it | 670 | 40 | 42 |
| ja | 1850 | 72 | 74 |
| nl | 2801 | 109 | 111 |
| pl | 1927 | 75 | 77 |
| pt | 2541 | 99 | 101 |

Within a language the order is the manifest's own publication priority, then the
country with more cities in the pool so the link blocks come out dense, then the path
so a rerun returns the same thousand.

## 5. PSEO completeness

Every one of the 1,000 page models carries all of this, and cohort QA checks each:

| field | how it is set | checked |
|---|---|---|
| final URL | `/{lang}/{segment}/{city}/`, segment from each language's own measured head term | unique path, 1,000 of 1,000 |
| title | per language, from the city and its warmest and coldest month | length bounds per script |
| meta description | the two temperatures and the period | length bounds per script |
| H1 | the city and the page question | present on all |
| canonical | self, absolute | equals site + path on all |
| hreflang | built from the cohort: every page in a cluster lists the others, x-default on the English one | reciprocal and resolving |
| breadcrumbs | home then the page | BreadcrumbList node present |
| schema | `Dataset`, plus WebPage, BreadcrumbList and FAQPage | all four present |
| sitemap | automatic from locale and surface once the cohort is registered | see gate 3 |
| internal links | 8 per page: other cities of the same country first, then the family ring, then a tool and a ranking | 0 orphans, min inbound 3 |
| related / sibling links | the country block is the sibling block | included in the 8 |
| robots | index, follow, from `indexPolicy: always`; robots.txt opens the site only on the production host | no noindex in the set |
| source provenance | NASA POWER, CC BY 4.0, 2001-2020, one grid cell per city with its coordinates printed on the page | every page has a source with a licence |
| orphan check | the link wiring reports inbound counts | 0 orphans |
| locale validation | city names come from the gazetteer in the page language: Rome is `roma` in Italian, `rom` in German, Paris is `paryz` in Polish | 997 of 1,000 slugged from the localised city name, 3 from the provider ASCII name where no localised name exists |
| duplicate and cannibalisation | one page per city per language, unique title per language, and the repo's own 0.8 shingle gate | 0 pairs over threshold in 53,594 comparisons |

## 6. Indexing risk

**MEDIUM, and the risk is the property rather than the pages.**

What makes it not LOW: the site has had one Atlas page crawled in six weeks. Adding
1,000 pages to a property crawling at that rate does not get 1,000 pages indexed, and
the first cohort's result is the evidence. Thin-content risk is low on its own terms,
but crawl budget on a property with no demonstrated Atlas crawl is unproven.

What makes it not HIGH: every page carries measured in-market demand, a 12-row table
of data a reader cannot get from the page it links to, 297 words at minimum, a
self-canonical, 8 internal links, 0 orphans and 0 near duplicates. Nothing here looks
like the doorway pattern that earns a site-wide problem.

Per family there is one family, so the breakdown is the per-language view: no language
is above 203 pages and none below 42, so a per-language indexation rate will be
readable in all nine rather than only in the largest.

## 7. Expected internal-link depth

| from | to | depth |
|---|---|---:|
| the sitemap index | a cohort page | 1 |
| a locale home | the page, via the surface hub when it exists | 3 |
| one cohort page | another in the same country | 1 |
| one cohort page | any other cohort page in the same language | 2, through the family ring |

Each page emits exactly 8 links and receives between 3 and 8, median 8. The links are
not a chain: the first five go to other cities of the same country, which is why the
country distribution above matters, and the ring that follows is what makes orphans
impossible rather than unlikely.

## 8. QA result

`node scripts/atlas/cohort-qa.mjs --cohort 003 --ci` exits 0.

    pages                1,000, expected 1,000
    failures             0
    near duplicates      0 pairs over 0.8 in 53,594 comparisons
    orphans              0
    pages with no outbound links  0
    call to action       1,000 with a primary and a secondary
    word floor           0 below
    title length         0 outside bounds
    description length   0 outside bounds
    canonical            0 wrong
    hreflang             0 unresolved, 0 non reciprocal, 0 missing x-default
    schema               0 missing WebPage, BreadcrumbList or FAQPage
    provenance           0 pages without a licensed source
    forbidden dashes     0

The repository quality gate and the full test suite were run after the change; results
are in the commit.

## 9. Not done on purpose, and what deploy needs

**The cohort is not registered.** `lib/atlas/serve-pages.js` lists `['001', '002']`.
Adding `'003'` is the single line that publishes these 1,000 pages, and it is not
written. Until it is, the seven new route folders generate no parameters and answer
nothing.

Deploy, in order, once you approve:

1. **Gate one, the serving error.** Confirm in production that an Atlas page survives
   ISR revalidation with a 200. The cwd-first manifest lookup that fixes it is in the
   code; the error cluster ran 25,845 times to 2026-10-10 and the fix has not been
   observed working. One crawl of an Atlas URL has happened in this site's life and it
   got a 500.
2. **Gate two, discovery.** Fetch the live sitemap index and its children and confirm
   all 500 current URLs appear, then resubmit. All 79 Google calls unknown are in the
   manifest today, so this is a verification rather than a fix, and it is the one
   thing the live experiment proves matters.
3. Add `'003'` to `MANIFESTS`, build, and confirm the 1,000 paths prerender.
4. Submit the new sitemap children and send the 1,000 URLs to IndexNow for Bing.
5. Re-run URL inspection on a stratified sample after 14 and 28 days, cut by language,
   and compare against cohort 001 at the same age.

## 10. What this cohort cannot tell you

It is one family. If these index and the first 500 did not, the cause could be the
family, the serving fix, the sitemap resubmission or the age of the property, and this
design does not separate them. The one variable it does isolate cleanly is language,
because all nine carry the same template over the same source with no language above
203 pages or below 42.

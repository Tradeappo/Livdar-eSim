# The data layer phase, reported

24 September 2026. The objective was a true 250 page high value eligible
cohort. It exists, it passes every check, and it is approved rather than
published.

## SOURCES

**Built (4).** `cost-of-living-verified` 199 countries. `rent-index-verified`
36 countries, three series kept apart. `salary-data-verified` 35 countries,
27 with both gross and net. `venue-data-verified` 9,438 venues in 3,766
cities across 16 countries.

**Partial, and honest about it.** Rent has an index, an inflation rate and a
housing cost overburden rate, and no rent level in euros, because Eurostat
publishes none that is comparable between countries. The city rent families
therefore stay blocked on a named source that does not exist rather than
inheriting a national figure.

**Blocked by a real external limit (network).** `places-data-verified`,
`neighbourhood-facts-verified` and `sport-routes-verified` all need
OpenStreetMap bulk extracts. Geofabrik, Overpass and the Wikidata endpoint
are all refused by the sandbox proxy with 403 on CONNECT. Wikidata was
reachable through the browser and that is how the venue source was built;
Geofabrik extracts are multi gigabyte binaries and cannot come through a
browser tab at all. This is the one blocker that stopped source execution.

**Blocked by needing a human to read official pages.** `visa-rules-verified`,
`work-rules-verified`, `tax-rules-verified`. The schema is built and enforces
two rules that cannot be bypassed: every record cites a government domain and
every record carries the date somebody read it. The store is empty and stays
empty, because a visa rule written from memory is the one error somebody acts
on by booking a flight.

**Blocked commercially.** `stay-inventory-verified` needs a contract, not
code. `events-verified` has no licensable feed. `community-listings-verified`
is first party or nothing.

**Rejected.** `wikidata-countries` for publication.

25 sources remain not built.

## COVERAGE

199 countries on cost of living, 39 of them on the comparable European index
and 160 on the World Bank ratio. 36 on rent, 35 on salary, 16 on venues. All
eleven priority destinations covered for cost of living. Not one city for
cost of living, which is why four city families stay blocked.

The gap that matters: everything built is country level. Every city, area and
neighbourhood family in the programme is still waiting on a source that needs
network access this environment does not have.

## INVENTORY

| State | Count |
| --- | --- |
| candidate | 2,939,607 |
| eligible pages | 295 |
| SERP measured | 19 |
| approved | 373 |
| published | 123, all from the earlier eSIM era families |
| live from this cohort | 0 |
| families blocked on a missing source | 51 |

Eligible is resolved per page. The previous figure of 2,600 was a family
property, and a family is not a page: the first per page run returned 36.

## ELIGIBLE

295 pages across 7 families, 3 surfaces, 9 languages, 49 destinations. 100
percent high priority.

## TOOLS

**Built (8).** Moving cost, cost of living, cost of living comparison, cost
of living calculator, travel budget, city comparison, salary calculator,
where should I live, relocation budget. Every one of them refuses to mix the
European index with the World Bank ratio, and the relocation budget has no
combined total at all because half of it is measured and half is modelled.

**Buildable and still unbuilt: none.** A test asserts this, so a tool whose
source arrives and is left as a specification fails the build.

**Blocked (12).** commute, rent affordability, relocation checklist, net
salary, income tax, country comparison, neighbourhood matcher, destination
matcher, event trip planner, where should I stay, property affordability,
visa eligibility. Each is blocked on a named source above.

## COHORT

250 pages exactly. 0 shortfall, 0 duplicate paths, 0 pages without a path.

| Family | Pages | Surface |
| --- | --- | --- |
| cost-of-living.country | 158 | move |
| rankings.index | 24 | tools |
| tools.calculator | 23 | tools |
| work.country-salaries | 23 | work |
| tools.cost-comparison | 9 | tools |
| tools.matcher | 8 | tools |
| tools.cost-calculator | 5 | tools |

Markets: en-US 54, de-DE 31, fr-FR 28, ja-JP 28, es-ES 26, pl-PL 26, pt-BR
26, it-IT 23, nl-NL 8. 43 destinations. 100 percent high priority. 208 pages
at difficulty 30 or below, 9 contested, 3 long shots, 30 with no difficulty
returned.

The concentration in one family is not a choice. The allocation rule is equal
share first and surplus to whoever has room; six of seven families were given
everything they had.

## QA

220 tests, 0 failures. 22 cohort checks over 250 pages, 0 failures. 919 files
scanned for long dashes, 0 found.

Two checks failed on their first run and both were right. The tool pages were
one page eight times at 98 percent similarity; every published tool now has
its own copy in all nine languages. The cheapest and most expensive country
lists were one page reversed at 84 percent; they now carry the two different
warnings they need. Near duplicate pairs over threshold: 0.

Provenance: every one of the 250 pages carries at least one source row with a
licence. Freshness: all 250 publishable, none stale in a way that makes it
wrong. Internal links: 0 orphans, minimum 2 inbound per page. hreflang:
complete and reciprocal, x-default on every cluster with an English page.

`next build` could not be run: the npm registry is unreachable from this
sandbox so `node_modules` cannot be installed. Everything checkable without a
bundler has been checked, including that every route file names its own
segment and that static params cover the manifest exactly once.

## SERP

The step that had been at zero since the pipeline was written. 19 keywords,
nine markets, four families.

| Market | Reachable competitors per page | Median entry position |
| --- | --- | --- |
| nl-NL | 6.0 | 3 |
| pl-PL | 4.0 | 4 |
| pt-BR | 2.5 | 7 |
| fr-FR | 2.0 | 3 |
| ja-JP | 2.0 | 6 |
| de-DE | 1.3 | 9 |
| en-US | 1.1 | 8 |

The English result pages are the hardest the programme measured and the Dutch
and Polish ones the easiest, by a factor of four or more. The cohort gives
English its largest share, which was right on measured volume and is wrong on
measured competition. That is the finding for cohort 002.

An AI overview sits above the first organic result on 15 of 19, and a question
block appears on 16 of 19. `wise.com` is the competitor present in five of
nine markets; numbeo is mostly an English problem.

## SPEND

Ahrefs: 6,589 units this phase. 2,288 on tool and ranking demand in ten
markets, 3,641 on the first SERP measurement, 330 on the venue demand probe,
330 earlier on tool terms. 915,518 used of 2,000,000, expiring 8 October.

DataForSEO: nothing. No paid run started, nothing near the 25 dollar
threshold.

## GIT

Base commit `ab161e8`. Two commits added: `33ef214` (cohort) and `527c38e`
(SERP, venues, tools). Working tree clean.

Push is still refused with 403: the proxy will not issue a credential for
`Tradeappo/Livdar-eSim` because it is not in this session's authorised
repository set. The bundle carries the complete history and restores
everything in one operation.

## BLOCKERS THAT GENUINELY NEED YOU

1. **Push.** Add `Tradeappo/Livdar-eSim` to the session's authorised
   repositories, or apply the bundle yourself.
2. **Network.** The sandbox refuses Geofabrik, Overpass and most statistical
   hosts. Places, neighbourhoods and sport routes cannot be built here.
3. **Contracts.** Stay inventory and events need commercial agreements. The
   adapter architecture is ready; the access is not.

## NEXT ACTION

One: `git bundle unbundle` or apply the patch, so the work is on GitHub and
the Vercel preview can build it. Everything else can continue without you.

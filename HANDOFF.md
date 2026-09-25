# Livdar Atlas: handoff to a fresh session

Written 25 September 2026, revised 24 September 2026 by the session that
picked it up. Read this top to bottom before touching anything. It is written
for a session with no memory of the work, and its job is to stop you repeating
it.

**What the revising session changed, in one paragraph.** The push blocker is
gone and the branch is on GitHub with a pull request open. `next build` failed
for a reason unrelated to the Atlas and now passes. The climate source was
wrong in a way that made every best time answer wrong, and is fixed. Best time
demand is measured in all nine markets, the climate surface is built in all
nine languages, and cohort 002 is assembled, QA clean and approved at its
full target of 250. The two remaining steps, places and travel
advice, are blocked by the environment's network policy and no longer by
anything in the code.

---

## 1. What this project is

**Livdar Atlas** is a programmatic SEO system built **inside the existing
`Tradeappo/Livdar-eSim` repository** (the site is livdar.com).

Livdar is an **Urban Life OS**: a lifestyle, relocation and urban integration
platform across 12 product surfaces. It is **not** an eSIM site with
relocation bolted on. The eSIM product (V41 design) is one surface of twelve
and is already live.

### Standing constraints, all still in force

These came from the owner across several sessions. Do not relitigate them.

- **Never create another repo or another Vercel project.** Extend
  `Tradeappo/Livdar-eSim` directly.
- **Never rebuild from scratch. Never modify the V41 eSIM design. Never change
  existing URLs. Never delete existing content, SEO or automation.**
- **Never create Romanian Atlas pages.** `ro-RO` is an excluded market.
- **Never use the em dash or the en dash**, anywhere, including data files and
  source code. Only the plain hyphen. Enforced by `npm run dashcheck`, which
  scans 923 files and must report zero.
- **No unauthorised scraping.** Not Google Maps, not competitor pages, not
  Google results. No Google Indexing API for these pages.
- **Never print or commit secrets**: API keys, passwords, tokens, Base64
  credentials. Not in reports, logs, patches or commits.
- **No identical translations.** Every language is written in its own words
  from the locally measured phrasing.
- **Work autonomously** until a real blocker: access, credentials, payment,
  or an irreversible action.
- **Cost control.** Report before any single spend over 25 USD. DataForSEO
  full run is explicitly NOT authorised (it is about 94.75 USD).

---

## 2. Repository state, exactly

| Thing | Value |
| --- | --- |
| Repo | `Tradeappo/Livdar-eSim` |
| Branch | `claude/seo-handoff-partial-data-7rs7zi` (pushed) |
| Base | `origin/main` = `1a5f1255e03b2c7286e18b7807087b152196be4b` |
| Pull request | open, and it is the delivery mechanism now rather than a bundle |
| Working tree | clean |
| Tests | **260 passing, 0 failing** (`npm test`) |
| Dash check | 1,184 files, 0 violations (`npm run dashcheck`) |
| Build | `next build` compiles, 159 static pages |
| Registry funnel | 123 published, 500 approved |

### The push blocker is gone

The previous session could not push: the git proxy refused the repository and
twenty commits lived only in a bundle. The repository is in the authorised set
now, the history was verified and pushed intact, and CI is green on it. If a
future session hits the same 403 again, it is an environment setting and not
something to retry in a loop: the repository has to be in that session's
authorised set.

### Nothing is merged and nothing is live

The only Atlas pages **live in production** are **123 `city-month` weather
pages** from the earlier eSIM-era taxonomy (`lib/atlas/taxonomy.js`, families
`city-guide` / `city-month` / `airport`). Both cohorts are `approved` and
neither is deployed. Production is READY on `main`; the branch has its own
Preview deployment, which is READY and which every commit before the build fix
failed to produce.

---

## 3. What is built and working

### Cohort 001: 250 pages, approved, QA clean

`data/atlas/cohorts/cohort-001.json` (the manifest) and
`data/atlas/cohorts/cohort-001-pages.json` (the full page models).

- 250 pages, 7 families, 3 surfaces, 9 languages, 43 destinations
- 100 percent high priority
- **22 QA checks, 0 failures** (`node scripts/atlas/cohort-qa.mjs`)
- Registered in the lifecycle store at state `approved` (lot-003)

| Family | Pages | Surface |
| --- | --- | --- |
| cost-of-living.country | 158 | move |
| rankings.index | 24 | tools |
| tools.calculator | 23 | tools |
| work.country-salaries | 23 | work |
| tools.cost-comparison | 9 | tools |
| tools.matcher | 8 | tools |
| tools.cost-calculator | 5 | tools |

**Do not rebuild or modify cohort 001.** It is finished.

### Cohort 002: 250 pages, approved, QA clean

`data/atlas/cohorts/cohort-002.json` and `cohort-002-pages.json`. 72 climate
pages in 9 languages plus 178 cost of living pages across 71 countries. See
section 7.

### The climate surface

`weather.country-best-time`, in all nine cohort languages, with a URL segment
per language that is the phrase that language actually searches:
`best-time-to-visit`, `beste-reisezeit`, `quand-partir`, `quando-andare`,
`mejor-epoca-para-viajar`, `melhor-epoca-para-viajar`, `beste-reistijd`,
`kiedy-jechac`, `best-season`. Route folders exist for all nine.

The page answers from several measured cities, names them, and where they
disagree it reports the disagreement. Japan in January is Naha at 89 and
Sapporo at 4.2, and saying so is the thing no competitor does.

### Sources built (14 usable ids)

`cost-of-living-verified` (199 countries), `rent-index-verified` (36),
`salary-data-verified` (35), `venue-data-verified` (9,438 venues in 3,766
cities across 16 countries), plus the entity and computed sources
(`geonames-cities`, `wikidata-cities`, `wikidata-labels`, `ourairports`,
`nasa-power-daily`, `computed-solar`, `computed-distance`, `iana-tz`,
`ahrefs-keywords`), plus `climate-normals-verified` (55 cities, 23 countries,
registered with per entity coverage rather than as universal, so a country
with no measured cities cannot look eligible).

### Tools built: 8 of 20

`moving-cost`, `cost-of-living-comparison`, `cost-of-living-calculator`,
`travel-budget`, `city-comparison`, `salary-calculator`,
`where-should-i-live`, `relocation-budget`.

A test asserts **zero buildable-but-unbuilt tools**, so a tool whose source
arrives and is left as a specification fails the build. Keep that property.

### Routes and sitemap

33 route folders under `app/[lang]/`, one per language segment, all with
`dynamicParams = false` so a URL outside the manifest is a 404 rather than an
empty page. 19 sitemap files split by language and surface, 250 entries, each
listed once.

---

## 4. Key architecture you must not undo

### Eligibility is resolved PER PAGE, not per family

`lib/atlas/eligibility-pages.js`. This is the single most important module.
The earlier family-level view said 2,600 eligible; the per-page resolver said
36. A page is eligible only when all four hold:

1. every source the family needs is built
2. that source covers **this entity**, not just the family
3. a keyword for **this entity in this market** was measured with volume > 0
4. the tool or ranking behind a global-scope page can actually be computed

**`source-ready` is not `eligible`.** Never conflate them.

### Measurement volumes are keyed by market AND keyword

"salary calculator" is 148,000/month in the US and 277,000 in the UK. A
keyword-only index hands one market the other's number. It did, silently.
Fixed; keep it fixed.

### The two price scales never mix

Eurostat publishes an index against the EU average for 39 countries; the
World Bank publishes a ratio against the US for 199. Every tool and every
ranking **refuses** a cross-scale comparison and says why rather than
converting. A conversion would be a number nobody measured.

### City pages never inherit country data

A city cost-of-living page, a city rent page, a city job market page and a
city-vs-city comparison all wait on named city-level sources
(`cost-of-living-city-verified`, `rent-city-verified`, `salary-city-verified`)
rather than borrowing the national figure. This bug has been fixed **twice**;
do not reintroduce it.

### Confidence is real, not decorative

`venue-data-verified` is Wikidata, community-edited, so every value carries
confidence `declared` (the lowest rank that publishes). The largest venue
query is a capacity figure, and a page whose whole purpose is an
authoritative number **must not** use a `declared` source. The demand probe
found this and the source registry records it.

### Internal links use a ring, not a priority list

Each page links to the siblings that **follow it** in sorted order, wrapping
at the end, so every page receives as many sibling links as it gives. A plain
priority order produced 107 orphans. Quotas per link kind, then the ring.

### Grammar is data

`lib/atlas/content/country-forms.js`. French, Italian and Portuguese put an
article in front of almost every country, so the subject form is **stored**.
A country missing from the table **refuses the page** rather than producing
"Suisse a un niveau des prix". Polish writes the locative, which never
matches the CLDR nominative, so the heading raises the last token instead.

### Per-script rules, not per-character rules

Japanese is counted in characters against its own floor; title and
description bounds are per script. A rule written for languages with spaces
declares good Japanese pages thin.

---

## 5. Bugs already found and fixed. Do not reintroduce.

| Bug | What happened |
| --- | --- |
| `monetisation` key collision | An array field collided with a numeric prior and silently overwrote it. Renamed to `leadsTo`. |
| `measured` key collision | Family findings used the same key as phrasing records. Renamed to `measuredOutcome`. |
| Destination scoring inverted | Additive demand put the Philippines above Japan. Fixed to multiplicative gating. |
| Sitemap index staleness | A new partition did not increment `chunksOpened`, leaving the index stale for every new locale. |
| Coverage classifier counted measures not baskets | Japan was classified full-basket with no categories. Fixed with a regex on basket ids. |
| 4 impossible World Bank values | Liberia 0.0024, Turkmenistan 0.0003, Venezuela 0, Iran 3.52. Rejected by the range gate. A test asserts the bad values remain in the fixture so it cannot pass by cleaning. |
| Volumes keyed by keyword alone | Cross-market contamination. Now keyed by market and keyword. |
| Tool inherited family source | `rent-affordability` looked eligible without a rent level. Global-scope pages now check the tool itself. |
| World ranking on a European measure | The Eurostat index reaches 39 countries, 37 European. That is a European list with two guests. World lists now sort on the World Bank ratio. |
| 107 orphan pages | Priority-ordered links. Fixed with quotas plus a ring. |
| Tool pages 98 percent similar | Eight calculators sharing one description. Every tool now has its own copy in 9 languages. |
| Cheapest vs most expensive lists 84 percent similar | One page reversed. They now carry the two different warnings they need. |
| Registry migration false negative | It compared entry counts; the sharded store legitimately holds more. Now checks that everything in the flat file arrived. |
| Inventory read the flat registry | The store moved to shards and the report kept printing the pre-shard state. |
| Climate extremes scored as typical days | `T2M_MAX` and `T2M_MIN` on the climatology endpoint are the twenty year extremes, not the mean daily maximum and minimum. The comfort model scored them as a typical afternoon and answered that the best time to visit Tokyo was February. It scores the monthly mean now, and the extremes are stored under names that say what they are. |
| Climate family had no link quota | Added to the cohort without an entry in the `WANTS` table, so it fell through to the fill path where every page links to the same first few. Eight English pages were orphans. A test now asserts no family in a cohort is missing a quota. |
| Morocco and Turkey were the same page | 88 percent similar in English, 90 in Polish: same best month, same verdict, only the country name different. The page states the measured numbers behind the verdict now, and their Junes differ by 23mm of rain. |
| Plan and measurements drifted | The plan writer appended rather than replaced, so a regenerated probe left a stale keyword behind. The join is an exact string match, so a page silently stopped being eligible. The family's rows are replaced wholesale now. |
| Multi word country names mis-cased | `Costo della vita in repubblica Ceca`. The heading fallback raises the last token, which cannot case a two word name. Multi word alternates are stored. |
| `new URL('../../', import.meta.url)` | Correct in Node, fatal in webpack, which tries to resolve the literal as a module. It broke `next build` entirely. Use `rootFrom` from `lib/atlas/repo-root.js`. |
| Market gate promise unkept | The comment said a low-priority family "earns further markets by producing measured demand"; the code read only the priority. Now reads `evidenceState` too. |

---

## 6. Environment blockers

Two of the five are resolved. The two that remain are network policy and
nothing else, so do not look for a code workaround.

**Resolved.**

1. **Push works.** See section 2.
2. **`npm install` and `next build` work.** The npm registry is reachable, so
   there is a `node_modules`, and the build passes after the webpack fix in
   section 5. The previous session could not run a build at all, which is why
   that bug survived twenty commits.

**Still blocked, and only the owner can change it.**

3. **The network policy denies every data host.** Not a routing quirk: the
   egress proxy answers 403 to CONNECT. Confirmed denied are
   `power.larc.nasa.gov`, `overpass-api.de`, `overpass.kumi.systems`,
   `api.worldbank.org`, `query.wikidata.org`, `www.gov.uk`,
   `travel.state.gov`, `ec.europa.eu` and `example.com`. Confirmed allowed are
   `api.github.com`, `raw.githubusercontent.com` and the package registries.
   The `WebFetch` tool is behind the same proxy and is refused too, so there
   is no second route. The previous session's browser workaround is not
   available here either.
   **The fix is the environment's Network access setting**, in the cloud
   environment menu in the session title bar, then Edit: either a broader
   access level or those hosts added to the allowed domains.
4. **Geofabrik extracts remain unusable** regardless, being multi gigabyte
   binaries.
5. **MCP servers still disconnect.** Save anything long running to disk as
   soon as it finishes.

What this costs, concretely: places stays `PARTIAL` at 13 cities of 44, so the
Areas surface cannot be built, and travel advice was never attempted, so
Safety cannot be. Both were steps 5 and 6 of the old continuation list and
neither is a code problem.

---

## 7. Cohort 002, as built

**Cohort 002 is done: 250 pages, QA clean, approved, not deployed.**

### The arithmetic, and why it was never the real limit

It first came out at 117, and the reason was worth understanding rather than
reporting. Every unbuilt surface is blocked on a source, which is true, and it
made the wrong conclusion look obvious: that 117 was the whole inventory.

It was not. `cost-of-living-verified` covers **199 countries** and only about
**two hundred country and market pairs had ever been measured**. The binding
constraint on the largest built family was the third eligibility condition,
not the first: a source covering an entity is worthless until a keyword for
that entity in that market has a volume. Measuring the gap took eligible pages
from 367 to 502 for about 12,500 Ahrefs units, and cohort 002 to its target.

The lesson generalises, so check it before concluding a cohort is short:
**source coverage and measured demand are different numbers, and the second
one is the one you can move without new data.**

| Thing | Cohort 001 | Cohort 002 |
| --- | --- | --- |
| Pages | 250 | 250 |
| Lot | lot-003 | lot-004 |
| Surfaces | tools, move, work | climate, move |
| Families | 7 | 2 |
| Entities | 43 | 71 |
| QA | 22 checks, 0 failures | 22 checks, 0 failures |
| Orphans | 0 | 0 |
| English share | 22 percent | 18 percent |

The English share matters: the SERP work found English the hardest of the nine
markets, 1.1 reachable competitors per page against 6.0 in Dutch, and cohort
001 gave it the largest share anyway. Cohort 002 corrects it, and a test
asserts the correction rather than leaving it in a report.

The builder takes `--cohort NNN` and excludes every earlier cohort by page
identity rather than by path, reading the exclusion from the manifests so it
cannot drift from what was selected.

### The climate source, and the thing that was wrong with it

`data/atlas/sources/climate/normals.json`, 55 cities across 23 countries, all
on one period so that cities inside a country can be compared. Built by
`scripts/atlas/ingest/climate-normals.mjs`, which gates a capture rather than
fetching one, so the expensive half never has to be repeated.

**Only `tmean` is a normal.** The provider's `T2M_MAX` and `T2M_MIN` on this
endpoint are the extreme values over the whole twenty year period. They are
stored as `tmaxExtreme` and `tminExtreme` and never scored. No page built on
this source may state a typical daytime high or an overnight low, and
`NOT_SCORED` in `lib/atlas/climate.js` records that.

### Surfaces, and what each one still needs

| Surface | State | Blocking source |
| --- | --- | --- |
| Climate | **Built. 72 pages in cohort 002.** | none |
| Move | 2 families ready and spent | `visa-rules-verified` (7 families) |
| Transport | measured and refused, see below | none, and that is the point |
| Areas | 2 hub families ready, 7 blocked | `places-data-verified` (PARTIAL, network blocked) |
| Tools | 6 ready, spent on cohort 001 | `tax-rules-verified` |
| Work | 1 ready, spent | `work-rules-verified`, `salary-city-verified` |
| Stay | 0 ready | `rent-city-verified`, `stay-inventory-verified` (commercial) |
| Pulse | 0 ready | `events-verified` (no licensable feed exists) |
| Sport | 0 ready | `sport-routes-verified` |
| Safety | 0 ready | `travel-advice-verified` (network blocked) |
| Community | 0 ready | `community-listings-verified` (first party or nothing) |

**Transport was measured and refused, so do not spend units on it again.**
`airports.guide` has real volume and prohibitive difficulty: median 43 over
fifteen airports, Split 93, Dubrovnik 88, Narita 71. The airport's own site
holds its own name. `transport.route-from-market` is the mirror image:
difficulty 0 and 1, and 0 to 150 searches a month. Both keep their entries
with the measurement attached.

**Beware of cannibalisation.** `weather.city-month` and
`destinations.city-hub` overlap the already published `city-month` and the
existing `city-guide` route shape. Do not add them.

---

## 8. Exact order to continue

Everything cheap has been done. What is left is either blocked or is a
decision for the owner.

1. **Ask the owner to widen the network policy** (section 6). Nothing else
   unblocks Areas or Safety, and both are pure environment.
2. **When places is unblocked**, finish the Overpass run over a longer window
   and build Areas. The caution already recorded stands: coworking is badly
   under tagged in OSM, and Dubai showing 0 coworking is a fact about the map.
3. **When the government hosts are unblocked**, try `travel-advice-verified`
   from the UK FCDO and the US State Department. It would unlock Safety
   cheaply and was never attempted.
4. **Both cohorts are full and ready, so the launch is a decision rather than
   a wait.** 500 pages, 250 in each cohort, launching together so the surfaces
   are comparable from the same start date.
5. **The launch package exists** at `data/atlas/cohorts/launch-package.json`,
   500 URLs with cohort, surface, family, language, origin market,
   destination, intent, priority, volume, difficulty, SERP opportunity and
   source type. Rebuild it with `node scripts/atlas/launch-package.mjs
   --write` after any cohort change.
6. **The GSC comparison design exists** in `lib/atlas/gsc-cohort.js`:
   dimensions, the unknown is not zero rule, and a signal score that is
   withheld whenever an input is unknown and always carries its raw metrics.
   It has never had credentials. The one number to argue with once real data
   exists is `IMPRESSION_REFERENCE`.
7. **Ahrefs**: about 995,000 units of 2,000,000 used. **The allowance resets 8
   October 2026.** Spend targeted units only. The cheapest remaining yield is
   more of what this session did: measure demand for entities the built
   sources already cover. `salary-data-verified` covers 35 countries against
   25 measured pairs, and `rent-index-verified` covers 36 and feeds nothing
   yet.

**Do not publish either cohort before both are ready.** They are both ready
now, which makes step 4 the decision that matters.

---

## 9. Measured findings worth keeping

### SERP: the English pages are the hardest, by a factor of four

19 keywords, 9 markets. `lib/atlas/serp.js` computes **entry position**
(the first position held by a competitor a new site could outrank, excluding
platforms) rather than difficulty.

| Market | Reachable competitors per page | Median entry position |
| --- | --- | --- |
| nl-NL | 6.0 | 3 |
| pl-PL | 4.0 | 4 |
| pt-BR | 2.5 | 7 |
| fr-FR | 2.0 | 3 |
| ja-JP | 2.0 | 6 |
| de-DE | 1.3 | 9 |
| en-US | 1.1 | 8 |

Cohort 001 gives English its largest share, which was right on measured volume
and **wrong on measured competition**. Cohort 002 should correct that.

`wise.com` is the cross-market rival, present in 5 of 9 markets. Numbeo is
mostly an English problem. An AI overview sits above the first organic result
on 15 of 19 queries; a question block on 16 of 19.

### Ahrefs budget

About 918,000 units used of 2,000,000. **The allowance expires 8 October
2026.** Spend targeted units only, on converting source-ready candidates into
eligible ones.

---

## 10. Commands that matter

```
npm test                                   # 260 tests, must stay at 0 failures
npm run dashcheck                          # 1,184 files, must stay at 0
npx next build                             # must compile; 159 static pages
node scripts/atlas/cohort-qa.mjs           # 22 checks over cohort 001
node scripts/atlas/cohort-qa.mjs --cohort 002
node scripts/atlas/cohort-pages.mjs        # rebuild the cohort manifest
node scripts/atlas/cohort-pages.mjs --cohort 002 --write
node scripts/atlas/cohort-register.mjs --cohort 002 --write
node scripts/atlas/launch-package.mjs      # 500 URLs with their metadata
node scripts/atlas/measure-cost-of-living.mjs   # probe to plan and measurements
node scripts/atlas/ingest/climate-normals.mjs   # gate the climate capture
node scripts/atlas/measure-best-time.mjs   # probe to plan and measurements
node scripts/atlas/inventory.mjs           # candidates, eligible, funnel
node scripts/atlas/serp-report.mjs         # per-market SERP comparison
node scripts/atlas/ingest/venues.mjs       # venue ingest (Wikidata capture)
```

Key modules: `lib/atlas/eligibility-pages.js`, `lib/atlas/cohort-pages.js`,
`lib/atlas/atlas-model.js`, `lib/atlas/atlas-urls.js`, `lib/atlas/atlas-links.js`,
`lib/atlas/serp.js`, `lib/atlas/climate.js`, `lib/atlas/rankings.js`,
`lib/atlas/gsc-cohort.js`, `lib/atlas/repo-root.js`,
`lib/atlas/content/` (9 language packs, terms, tool copy, ranking copy,
country forms).

Reports worth reading: `reports/atlas/phase-report.md` (the full previous
phase report), `reports/atlas/cohort-001.md`, `reports/atlas/data-layer.md`.

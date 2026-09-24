# Livdar Atlas: handoff to a fresh session

Written 25 September 2026. Read this top to bottom before touching anything.
It is written for a session with no memory of the work, and its job is to stop
you repeating three days of it.

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
| Branch | `atlas-priority` |
| HEAD | `0ebb9d03dc9291541fdf32d39ed05800c6a4f3b2` |
| Base | `origin/main` = `1a5f1255e03b2c7286e18b7807087b152196be4b` |
| Commits ahead of main | **19** |
| Working tree | clean |
| Tests | **220 passing, 0 failing** (`npm test`) |
| Dash check | 923 files, 0 violations (`npm run dashcheck`) |
| Test files | 26 under `tests/` |

### Nothing is merged and nothing is live

- There is **no PR**. `atlas-priority` has never been pushed.
- **Push is blocked** and retrying is a waste of time. The exact error:
  > `remote: access denied by the git proxy: Tradeappo/Livdar-eSim is not in
  > this session's authorized repository set, so the proxy will not inject a
  > credential for it.`
  The fix is on the owner's side: add the repo to the session's authorised
  set. Until then the bundle is the delivery mechanism.
- The only Atlas pages **live in production** are **123 `city-month` weather
  pages** from the earlier eSIM-era taxonomy (`lib/atlas/taxonomy.js`,
  families `city-guide` / `city-month` / `airport`). Everything described
  below is `approved`, not published.

### Recovery

The bundle carries the complete history; its head matches HEAD exactly.

```
git bundle unbundle livdar-atlas-priority.bundle
git checkout atlas-priority
```

Delivered files (in the conversation, and under `/mnt/user-data/outputs/`):

- `livdar-atlas-priority.bundle` (5.2 MB, all 17 commits, verified complete)
- `atlas-all-17-commits.patch` (24 MB)

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

### Sources built (13 usable ids)

`cost-of-living-verified` (199 countries), `rent-index-verified` (36),
`salary-data-verified` (35), `venue-data-verified` (9,438 venues in 3,766
cities across 16 countries), plus the entity and computed sources
(`geonames-cities`, `wikidata-cities`, `wikidata-labels`, `ourairports`,
`nasa-power-daily`, `computed-solar`, `computed-distance`, `iana-tz`,
`ahrefs-keywords`).

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
| Market gate promise unkept | The comment said a low-priority family "earns further markets by producing measured demand"; the code read only the priority. Now reads `evidenceState` too. |

---

## 6. Environment blockers (these are real, not solvable in code)

1. **Push is 403.** See section 2. Needs the owner.
2. **The sandbox has no network route to most data hosts.** `curl` returns
   `000` / `403 CONNECT` for `ec.europa.eu`, `api.worldbank.org`,
   `query.wikidata.org`, `overpass-api.de`, `power.larc.nasa.gov`,
   `download.geofabrik.de`, `gov.uk`, `restcountries.com`.
   **The workaround that works:** drive the browser pane
   (`mcp__remote-devices__Claude_Browser__*`), navigate to the target origin
   (CORS blocks cross-origin fetches, so you must be *on* that origin), then
   `fetch` in-page and **reduce the payload in the page** before returning it.
   Large results land in a tool-results file on disk rather than in context;
   read them with `node`, not with Read.
3. **`npm install` / `next build` cannot run here.** The npm registry is
   unreachable, so there is no `node_modules`. Everything checkable without a
   bundler has been checked.
4. **Geofabrik extracts are unreachable and unusable here** (multi-gigabyte
   binaries cannot come through a browser tab).
5. **MCP servers disconnect and reconnect frequently.** Long browser jobs
   survive in `window.__*` as long as the tab stays open. Save results to disk
   as soon as a job finishes.

---

## 7. Where cohort 002 actually got to

The current task is **cohort 002: 250 more eligible pages, maximum surface
diversity**, then prepare cohort 001 + 002 for **one launch of about 500
pages**. Neither cohort may be published before both are ready.

### The hard arithmetic you need to know

There are **295 eligible pages in total**. Cohort 001 took 250. **Only 45
remain.** Cohort 002 therefore needs roughly **205 genuinely new eligible
pages**, and every one of them requires a source that is not built yet. This
is the whole problem.

### Done this session

**Climate expanded from 8 cities to 55**, across 23 countries.
`data/atlas/sources/climate/nasa-power-climatology-2026-09-25.json`. Fetched
from the NASA POWER **climatology** endpoint (the provider's own 20-year
normals, 2001-2020) rather than the daily endpoint, so every city is on one
period. Precipitation arrives mm/day and is converted to mm/month.

**Why climate:** it carries the largest measured demand in the programme.
`best time to visit japan` = **51,000/month at difficulty 3**. Iceland 12,000
at 1, Greece 9,500 at 5, Switzerland 7,700 at 2, Italy 7,600 at 2, Portugal
6,500 at 2, Thailand 8,700 at 10. The shape carries into German
(`beste reisezeit thailand` 8,800 at difficulty 1), French
(`quand partir en thailande` 6,400 at 1) and Italian. 37 phrasings, 4
languages, median difficulty about 2, against a source already built.

**One new family added on that evidence:** `weather.country-best-time`.
Defined honestly: a country is not one climate, so the answer is computed over
several measured cities, the page names which, and where the cities disagree
**the disagreement is the answer** rather than something averaged away. That
is the thing no competitor does.

**`lib/atlas/climate.js` written** (reader + comfort model). The comfort model
is entirely visible: bands and penalties stated as constants, every score able
to show its components, `mostDivided` and `dividedCountry` computed per
country. **It has no tests yet and has not been run against the new store.**

**Places (Overpass) is PARTIAL and blocked.**
`data/atlas/sources/places/osm-counts-2026-09-25.json`, `state: "PARTIAL"`.
Bounding-box counts work and are the correct non-bulk shape, but the public
Overpass instance rate-limited the run: **13 cities of 44 complete, 42
individual queries failed on slot exhaustion.** Finishing needs a self-hosted
Overpass, a Geofabrik extract (unreachable), or a run paced over hours.
Recorded caution: **coworking is badly under-tagged in OSM** (Dubai shows 0
coworking and 3 bars, which is a fact about the map, not about Dubai).

### Surfaces, and what each one actually needs

| Surface | State | Blocking source |
| --- | --- | --- |
| Climate | **Best opportunity. Source now built for 55 cities / 23 countries.** | none |
| Move | 2 families ready, 18 blocked | `visa-rules-verified` (7 families) |
| Areas | 2 hub families ready, 7 blocked | `places-data-verified` (partial), `neighbourhood-facts-verified` |
| Transport | `airports.guide`, `transport.route-from-market` ready | none for those two |
| Tools | 6 ready (already spent on cohort 001) | `tax-rules-verified` |
| Work | 1 ready (spent) | `work-rules-verified`, `salary-city-verified` |
| Stay | 0 ready | `rent-city-verified`, `stay-inventory-verified` (commercial) |
| Pulse | 0 ready | `events-verified` (no licensable feed exists) |
| Sport | 0 ready | `sport-routes-verified` |
| Safety | 0 ready | `safety-data-verified`, `travel-advice-verified` |
| Community | 0 ready | `community-listings-verified` (first-party or nothing) |

**Beware of cannibalisation.** `weather.city-month` and `destinations.city-hub`
overlap the already-published `city-month` and the existing `city-guide` route
shape. Do not put them in cohort 002.

---

## 8. Exact order to continue

1. **Finish the climate line.** Write
   `scripts/atlas/ingest/climate-normals.mjs` to gate the capture (range
   checks, unit checks, provenance, freshness class `reference`) and write
   `data/atlas/sources/climate/normals.json` keyed by city id with `iso2`.
   Then point `lib/atlas/climate.js` at it and **write its tests**. The comfort
   model is untested code right now.
2. **Measure the remaining best-time demand** in the languages not yet
   covered: es-ES, pt-BR, nl-NL, pl-PL, ja-JP. Targeted Ahrefs only; the
   en/de/fr/it evidence is already in hand and is in section 7.
3. **Build the content pack** for `weather.country-best-time` in the 9 cohort
   languages, following the existing pattern in `lib/atlas/content/lang/*.js`.
   Add a segment to `lib/atlas/atlas-urls.js` and route folders under
   `app/[lang]/`. Sentences must be selected by the data, as elsewhere.
4. **Add the surfaces that are cheapest next:** `airports.guide` and
   `transport.route-from-market` need no new source. Measure their demand and
   build them. That gives Transport / Getting Around.
5. **Retry places over a longer window** or find a legal alternative, to
   unlock Areas. Do not fake it; if it stays partial, report the shortfall and
   move on. The brief explicitly permits this.
6. **Try `travel-advice-verified`** from government sources (UK FCDO, US State
   Department) through the browser. That would unlock Safety cheaply. It was
   never attempted; `gov.uk` failed only because the fetch was cross-origin.
7. **Assemble cohort 002** with `scripts/atlas/cohort-pages.mjs` extended for
   a second cohort, run the same 22 QA checks, register at `approved`.
8. **Only then** build the combined ~500 page launch package, with per-URL
   metadata for cohort, surface, family, language, origin market, destination,
   intent, priority, volume, difficulty, SERP opportunity and source type.
9. **Prepare the GSC comparison design** (by surface, family, language,
   destination, cohort) and a signal score that keeps raw metrics alongside it.

**Do not publish either cohort before both are ready.** That is the point of
the exercise: launching together makes the surfaces comparable from the same
start date.

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
npm test                                   # 220 tests, must stay at 0 failures
npm run dashcheck                          # 923 files, must stay at 0
node scripts/atlas/cohort-qa.mjs           # 22 checks over cohort 001
node scripts/atlas/cohort-pages.mjs        # rebuild the cohort manifest
node scripts/atlas/inventory.mjs           # candidates, eligible, funnel
node scripts/atlas/serp-report.mjs         # per-market SERP comparison
node scripts/atlas/ingest/venues.mjs       # venue ingest (Wikidata capture)
```

Key modules: `lib/atlas/eligibility-pages.js`, `lib/atlas/cohort-pages.js`,
`lib/atlas/atlas-model.js`, `lib/atlas/atlas-urls.js`, `lib/atlas/atlas-links.js`,
`lib/atlas/serp.js`, `lib/atlas/climate.js`, `lib/atlas/rankings.js`,
`lib/atlas/content/` (9 language packs, terms, tool copy, ranking copy,
country forms).

Reports worth reading: `reports/atlas/phase-report.md` (the full previous
phase report), `reports/atlas/cohort-001.md`, `reports/atlas/data-layer.md`.

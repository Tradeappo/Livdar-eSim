# Livdar Atlas, 2026-09-25: cohort 002 rebuilt as a product experiment, and the launch

Two cohorts of 250, eight surfaces, published. What changed since the last
report is the shape of cohort 002 and the reason it has a shape at all.

---

## Cohort 001

250 pages, unchanged. It is the control and it was selected by the rule it was
selected by: value first, no surface floors, no ceilings.

| Surface | Pages | Families |
| --- | --- | --- |
| Move | 100 | `cost-of-living.country` |
| Climate | 48 | `weather.country-best-time` |
| Work | 38 | `work.country-salaries` |
| Tools | 47 | `tools.calculator`, `tools.cost-calculator`, `tools.cost-comparison`, `tools.matcher` |
| Rankings | 17 | `rankings.index` |

---

## Cohort 002

250 pages, 8 surfaces, 12 families, 9 markets, 1.79 million searches a month.

| Surface | Pages | | Surface | Pages |
| --- | --- | --- | --- | --- |
| Pulse | 55 | | Sport | 29 |
| Areas | 40 | | Tools | 27 |
| Work | 35 | | Climate | 24 |
| Move | 35 | | Stay | 5 |

Per family:

| Family | Pages |
| --- | --- |
| `neighbourhoods.city-where-to-stay` | 40 |
| `work.country-salaries` | 35 |
| `cost-of-living.country` | 35 |
| `sport.city-season` | 29 |
| `events.subdivision-holidays` | 28 |
| `events.country-holidays` | 27 |
| `weather.country-best-time` | 24 |
| `tools.matcher` | 16 |
| `tools.calculator` | 9 |
| `rents.country-inflation` | 5 |
| `tools.cost-comparison` | 1 |
| `rankings.index` | 1 |

Against the brief's revised targets:

| Surface | Asked | Got | |
| --- | --- | --- | --- |
| Areas | 30 to 40 | 40 | met |
| Stay | 25 to 40 | 5 | short, blocker below |
| Work | 25 to 35 | 35 | met |
| Move | 25 to 35 | 35 | met |
| Sport | 20 to 35 | 29 | met |
| Pulse | 30 to 45 | 55 | over, deliberately |
| Tools | 20 to 35 | 27 | met |
| Community | 10 to 25 | 0 | blocked |
| Safety | 10 to 20 | 0 | blocked |
| Climate | under 20 to 25 | 24 | met |

Pulse is ten above its range because Climate is capped at 25. Holding Pulse to
45 put Climate back to 46, and Climate is the surface the brief named. That is
the only target deliberately exceeded and it was exceeded to honour another.

---

## Diversity

- 8 surfaces, up from 6 at the last report and 2 at the one before.
- **Diversified core 181**, selected by surface floors.
- **Filler 69**, selected to reach 250. Every page carries which it is.
- **0 pages over a surface ceiling**, against 48 at the last report.
- Climate and Move together are 59 of 250, against 115 at the last report.
- No surface is more than 22 percent of the cohort.

---

## Tools

Researched: all 20 tools in the queue, in 10 markets, on 66 constructed
keywords. Four tools were being held for datasets they do not need.

Built, and now eligible: **rent affordability** (18,000 a month in the United
States, 9,800 in Japan, 800 in Germany), **destination matcher** (1,000 in
Germany at difficulty 0, 900 in Brazil), **where should I stay** (400 in Brazil,
200 in Italy), **country comparison** (German only). With the existing eight
that is 12 built tools and **96 eligible Tools pages**, up from 74.

Two findings:

- Outside German, a country comparison keyword is not about cost. Every market
  returns a parent topic about the true size of countries on a map. Only
  `ländervergleich` carries the comparison intent, so only German was planned.
- The largest Tools demand in the programme is a net pay calculator: **217,000 a
  month in the United Kingdom, 56,000 in the United States**. It needs tax rules
  per country and there is no route to them here.

Still blocked, with the reason: net salary and income tax (tax rules), visa
eligibility and relocation checklist (visa rules), commute (transit fares),
property affordability (property prices), neighbourhood matcher (city rent
level), event trip planner (stay inventory).

---

## Events and Pulse

Researched: 108 keywords across 10 markets, at country and region level, on the
holiday source built yesterday. **97 new pairs planned, 78,610 searches a
month**, taking Pulse from 25 eligible pages to 122.

Sources: the same ODbL public holiday dataset, 36 countries and 82 regions. No
new source was needed; the first pass had asked each market about its own
country and stopped.

What the research found: the region level is where the volume is
(`feiertage niedersachsen 2026` 47,000, `feiertage hamburg 2026` 22,000, twelve
Spanish communities above 500 each), and markets ask about each other far more
than expected (Japan searches German public holidays 1,000 times a month, the
Netherlands searches Spanish ones 500 times).

Four German states keep an identical calendar. They now collapse onto the one
with the most demand, which gave up 28,950 searches a month and stopped four
pages competing for the same query.

Not built: city event calendars, concerts, festivals, fixtures. The football
fixture data at `openfootball` is public domain and reachable, and is the
obvious next Pulse source; it was not built because Pulse already had more
eligible pages than the cohort could take.

---

## Stay

**5 pages.** `rents.country-inflation`, the one rent question Eurostat
publishes: how much rents have moved and where that sits among 36 countries.
The two largest are the markets that cap the annual increase by a published
index, `huurverhoging 2026` at 4,400 a month and `irl 2026` at 4,300.

Blocker for the rest: no accommodation inventory is licensed, Eurostat publishes
no rent level in euros for any country and the housing index that exists instead
bundles rent with water and energy, and every marketplace forbids the scrape
that would produce asking rents. The venue route was measured and refused on
size: `where to stay near yankee stadium` is 30 a month, and the volume is on
`hotels near madison square garden` at 3,000, which is a hotel list this
programme cannot honestly publish.

---

## Sport

**29 pages** across 6 markets, from a source that was already built.
`sport.city-season` answers when an activity is comfortable in a city, on stated
temperature bands, from the NASA POWER monthly normals.

Blocker for the other half: `sport-routes-verified`, the route and trail extract.
The Overpass adapter is written and tested and every host that serves the data
answers 403 at this environment's egress proxy, including the browser route that
reached Overpass earlier in this session.

Three keywords with real demand were refused on intent rather than volume:
`natation paris` and `zwemmen in amsterdam` are 150 a month each and no month in
either city reaches the outdoor band, so both are searches for an indoor pool.

---

## Community

**0 pages.** Measured, not assumed: `expats amsterdam` 150 a month at difficulty
0 and a cost per click of 0.60, `expats berlin` 40, `expat community lisbon` 10,
`digital nomads lisbon` 0, `nomadas digitales madrid` 0.

Two blockers at once. The demand is thin, and `community-listings-verified` has
no candidate source that is both legal and reachable: Meetup forbids the scrape,
and no first-party community data exists yet because the product has no
community feature.

---

## Safety

**0 pages, and the most expensive absence in the programme.**

Measured demand: `is mexico safe` 4,200 a month, `is thailand safe` 3,500,
**`is barcelona safe` 2,200 at difficulty 1**, `crime rate in mexico` 300,
`es seguro viajar a mexico` 200, plus German, Dutch, French and Italian
equivalents. About 11,000 searches a month across 14 measured keywords.

The SERP for `is barcelona safe` is Reddit, Facebook, TikTok, Instagram and
YouTube, with a tour operator at DR 39 in fourth and a personal blog at DR 1 in
tenth. There is no authority on the question. One of the ten results is
`saily.com`, an eSIM brand answering a safety question because nobody else is.

Blocker: `safety-data-verified`. Comparable crime data exists (UNODC via the Our
World in Data chart API, Eurostat `crim_off_cat`, national statistics offices)
and every host that publishes it answers 403 to CONNECT at this environment's
egress proxy. Only `raw.githubusercontent.com` is reachable, and no official
mirror of any of them exists there. **This is an environment setting, not code.**

---

## QA

| Check | Cohort 001 | Cohort 002 |
| --- | --- | --- |
| Checks run | 22 | 22 |
| Failures | 0 | 0 |
| Near duplicates | 0 | 0 |
| Orphans | 0 | 0 |
| Word floor | pass | pass |
| Provenance | pass | pass |

- `npm test`: **293 passing, 0 failing**, up from 284.
- `npm run dashcheck`: 1,520 files, **0 violations**.
- `next build`: exit 0, **696 prerendered routes, all 500 cohort pages present**.
- 404 count across the 500: **0 in the build output**. Production verification
  is in the launch section below.
- Internal links: 0 below floor, 0 orphans, 0 broken.

New: `tests/atlas-route-integration.test.mjs`, 9 tests over the boundary QA never
looked at. A representative page from every surface, every family and every
language is checked for a route folder on disk, generation by the route, service
of the model, metadata with the right canonical and language, at least three
internal links, and presence in a sitemap. It also asserts the reverse: a
segment folder that no language declares, and a sitemap URL that no cohort
contains, both fail.

---

## SERP, one per surface built or grown

| Surface | Keyword | Volume | Weakest reachable | Reading |
| --- | --- | --- | --- | --- |
| Sport | trekking vicino milano | 350 | **DR 1** at 10 | the most open SERP measured anywhere |
| Sport | 東京 ハイキング | 500 | DR 9 at 3 | official Tokyo tourism is only fourth |
| Tools | wohin auswandern | 1,000 | DR 18 at 6 | position 6 is a quiz, which is this tool's shape |
| Tools | how much rent can i afford | 18,000 | DR 34 at 6 | portals above it, all of them calculators |
| Pulse | festivos castilla la mancha 2026 | 3,200 | DR 12 at 9 | incumbents are a PDF, an Instagram post and a union |
| Stay | huurverhoging 2026 | 4,400 | DR 48 at 10 | six of eight results are government; closed |
| Safety | is barcelona safe | 2,200 | DR 1 at 10 | no authority at all, and no page to build |

---

## Node 24

| Where | Value |
| --- | --- |
| Vercel Project Setting | `nodeVersion: "24.x"`, read from the API |
| `package.json` engines | `"24.x"` |
| `.nvmrc` | 24 |
| GitHub Actions, all 7 workflows | 24 |
| Preview runtime | `v24.20.0`, verified 2026-09-24 through `GET /api/runtime` |

Nothing here changed this session. The runtime check could not be repeated today
because the egress policy narrowed: `*.vercel.app` is now refused from this
container, and the Preview is behind Vercel Authentication. `/api/runtime`
remains deployed for the next session that can reach it.

---

## Git

| | |
| --- | --- |
| Branch | `claude/seo-handoff-partial-data-7rs7zi` |
| PR | Tradeappo/Livdar-eSim#18 |
| CI | both `checks` runs green, Vercel Preview READY |
| Mergeable | clean |

---

## Launch

**500 pages are live on livdar.com.** PR #18 merged at 01:01 UTC, PR #19 at
01:09, and production is `bc4515a` on deployment `dpl_GNfhcMQvJs53wrNP2w8RqXxbqZeg`.

### The middleware, which is why there were two merges

The first production deployment served the 500 pages and about 350 of them
answered with the English eSIM home page. `middleware.js` sends a locale that
exists in the infrastructure but has no published eSIM market to the nearest live
market rather than showing a 404. That is right for the eSIM site, which
publishes three markets of seventeen locales, and seven of the nine Atlas
languages are exactly those locales.

This is the same failure as the one this session started by fixing, one layer
further out: that one was the route generating nothing, and a test now asserts
the route generates every manifest path. It does. Nothing asserted that a request
for one arrives.

The fix is in PR #19: the Atlas vocabulary as plain literals small enough to
import at the edge, the decision moved out of `middleware.js` into
`lib/routing.js` so a test can call it, and seven tests holding the boundary from
both sides. Total 300 tests.

### What was verified against the production origin

| Check | Result |
| --- | --- |
| `GET /api/runtime` | `{"node":"v24.20.0","nodeMajor":24,"environment":"production","region":"iad1"}` |
| `GET /robots.txt` | 200, `Allow: /`, 58 Atlas page sitemaps listed |
| `GET /sitemap.xml` | 200, sitemap index lists 58 `atlas-pages` files across nine languages |
| eSIM site | `/en/` and `/en/esim/spain/` both 200 with their own content, no regression |
| Eleven Atlas pages | 200, prerendered, correct canonical, `index, follow`, real tables and internal links |

The eleven cover **all eight surfaces and all nine languages**: Move and Work and
Climate in English, Pulse in German, Areas in Spanish, Sport in Italian and
Japanese, Stay in Dutch and French, Tools in Polish and Portuguese. Every response
is recorded field by field in `data/atlas/launches/evidence-2026-09-25.json`.

The other 489 pages are `published` rather than `live` in the registry. They are
in the same prerender manifest, the same route and the same sitemaps, and no
request has been made for them, so the registry does not claim otherwise. `live`
is a measurement and the script refuses to write it without the response.

Node 24 is now confirmed in the **production** runtime rather than only in a
Preview, which closes that item completely.

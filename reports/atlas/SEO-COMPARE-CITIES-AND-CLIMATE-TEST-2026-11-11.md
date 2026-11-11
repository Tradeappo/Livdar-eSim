# Compare cities fix and climate title test, 2026-11-11

**For review. Nothing here is published until the owner approves.** Atlas pages reach production only through the manual `atlas-cloudflare` workflow (export to R2), and no Worker has a build trigger. Vercel has created no deployment since 2026-11-05.

## 0. What serves production

| item | value |
|---|---|
| zone | `livdar.com` on Cloudflare, active since **2026-11-11 12:38:44 UTC** |
| Atlas URLs | 107 route patterns → Worker `livdar-atlas`, rendering page models from R2 |
| live Atlas version | `x-atlas-version: 20261110T170020Z` |
| everything else | Worker `livdar-origin-fallback`, which proxies Vercel and serves the snapshot when Vercel fails |
| source of the Atlas data | the cohort manifests at `8d6f1e2`, unchanged on `migrate/atlas-cloudflare` |
| publishing tooling | lives only on `migrate/atlas-cloudflare`, not on `main` |
| this branch's base | `migrate/atlas-cloudflare` |

## 1. /en/tools/compare-cities/

### Findings

The live page has the title "Compare cities: built on measured data" and the inputs "first city, second city". Its content is entirely national:
- The table lists countries (Türkiye 46.8 …).
- The worked example is "Switzerland against Türkiye".
- It says "It covers 199 countries".

The source label repeats itself: "Eurostat + World Bank + Eurostat". The intro says "the result is a range rather than a single number", but the page never shows a range.

**There is no city-level price data.**
- `data/atlas/sources/cost-of-living/normalized.json` says: "City level is deliberately absent rather than estimated".
- The sources are Eurostat `prc_ppp_ind` (PLI 2024) and the World Bank price level ratio (2025), both national.
- `rent-city-verified` is blocked in `lib/atlas/sources/blocked.js`.
- The generator already knows this. `tool-spec.js` says: "the only price data that exists is national", and it ships no picker for that reason.

**A country comparison page already exists**: `/en/tools/cost-of-living-comparison/`. It is a working, interactive country comparison with the same table and the same worked example. A rewrite of compare-cities as a country comparison would therefore duplicate it.

**Search Console, 2026-10-12 to 2026-11-08:**

| page | impressions | clicks | position |
|---|---:|---:|---:|
| `/en/tools/compare-cities/` | 81 | 0 | 6.83 |
| `/en/tools/cost-of-living-comparison/` | 0 | 0 | – |

### Change

The URL, canonical, hreflang and links stay as they are. The page now says what the data supports:
- It compares the countries the two cities are in.
- Every figure is labelled as national.
- It states that two cities in the same country cannot be told apart.
- It points to the cost-of-living comparison for a country comparison against your own income.

| field | before | after |
|---|---|---|
| title | Compare cities: built on measured data | Compare cities: national price levels, not city prices |
| description | Compare cities from Livdar, computed against Eurostat + World Bank + Eurostat rather than crowd submitted figures, with every input and assumption shown. | No open city price index exists, so this compares the countries two cities are in, on Eurostat and World Bank price levels for 2024, labelled as national figures. |
| h1 | Compare cities | Compare cities: what national price data can show |
| What it asks for | first city, second city | the countries the two cities are in |
| Source | Eurostat + World Bank + Eurostat | Eurostat + World Bank |
| table caption | Everything a household buys | Price level of everything a household buys, by country (EU27 = 100) |

The body paragraphs and the FAQ are rewritten to match. The exact text is in `data/atlas/copy-corrections/page-copy-2026-11-11.json`.

### Not changed: consequences of the alternatives

**Canonical to `/en/tools/cost-of-living-comparison/`:**
- compare-cities would leave the index, along with its 81 impressions at position 6.8. Those impressions are not likely to move to a page with 0 impressions for a different query.
- Its hreflang cluster (de, es, pt, pl `city-comparison`) would point at a page whose canonical is elsewhere. That is a conflicting signal, so the cluster would have to change too.

**301 redirect:** the same loss, plus a Worker routing change and a sitemap change. It is also hard to undo once Google has processed it.

**noindex:** the impressions are lost and nothing is consolidated.

**Recommendation.** Keep the URL now. Decide on consolidation only after the page's queries are known. The current tooling has no page×query data (see 2.1).

### Same defect elsewhere (reported, not changed)

- `city-comparison` in de, es, pt and pl (`/de/rechner/staedte-vergleich/` …) carries the same city promise over national data.
- `cost-of-living-comparison` (en, de, fr) says "first city, second city, income" in its facts, while it compares countries.
- The repeated source label ("Eurostat + World Bank + Eurostat") appears on several tool pages.

## 2. Climate title and description test

### 2.1 Data and its limits

**Source.** The Search Console report printed by `scripts/gsc-report.mjs` in the scheduled `atlas-search-console` run 109 (2026-11-11 12:52 UTC):
- 28-day window: **2026-10-12 to 2026-11-08**.
- Opportunities filter: impressions ≥ 20, average position 4 to 20.
- The report holds page totals and top queries only. **It has no page×query data.** Ahrefs GSC returned "Insufficient plan".

**Outage.** livdar.com answered HTTP 402 from 2026-11-05 (between 15:30 and 23:52 UTC) until 2026-11-11 12:38 UTC.
- The window contains 24 days before the outage (10-12 to 11-04) and 4 outage days (11-05 to 11-08).
- Search Console data ends on 11-08, so **there is no data at all from after the recovery yet**.
- The split by period needs a dated per-page export. The current tooling cannot produce one without a new script on `main`.

**Query intent.**
- Only two queries pass the filter: `clima mensual` (31 impressions, position 9.5) and an unrelated one.
- The page keywords are of the form `clima <city>`. In Spanish, that is largely a weather-today query, which Google answers with its own weather box.
- These pages hold 2001-2020 monthly averages, not forecasts.
- At an average position of 8 to 12, a CTR near 0% on about 100 impressions is about what position alone predicts. **The title is not shown to be the cause.**

### 2.2 Selection

**Pool:** the 14 Spanish climate pages in the window, all near the first page.

**Excluded:**

| page | reason |
|---|---|
| Medellín | values off the city's real climate (17–18 °C shown, ~22 °C real) |
| Cali | values off the city's real climate (~16 °C shown, ~24–25 °C real) |
| Soacha | values off the city's real climate (~19 °C shown, ~14 °C real) |
| San Salvador de Jujuy | odd page out after pairing |

**Assignment.** The 10 remaining pages are paired by impressions. In each pair, the path with the smaller sha256 is the test page. The fixed list is `data/atlas/measurements/gsc/subsets/climate-ctr-test-2026-11.json`.

**Test group** (388 impressions, 1 click, average position 8.9):

| page | impressions | position | cohort |
|---|---:|---:|---|
| /es/clima/mar-del-plata/ | 132 | 7.5 | 004 |
| /es/clima/lima/ | 104 | 10.8 | 003 |
| /es/clima/manizales/ | 78 | 9.8 | 004 |
| /es/clima/antofagasta/ | 39 | 7.7 | 004 |
| /es/clima/pasto/ | 35 | 8.3 | 004 |

**Control group** (390 impressions, 2 clicks, average position 11.2), unchanged:

| page | impressions | position | cohort |
|---|---:|---:|---|
| /es/clima/santiago-de-chile/ | 163 | 11.8 | 003 |
| /es/clima/guayaquil/ | 95 | 8.8 | 003 |
| /es/clima/austin/ | 58 | 10.9 | 003 |
| /es/clima/zaragoza/ | 38 | 10.9 | 004 |
| /es/clima/tokio/ | 36 | 15.3 | 003 |

The test group sits on better positions on average (8.9 against 11.2). Compare each group with its own baseline, not the groups' absolute CTRs.

### 2.3 Texts

**Title**

- Before: `Clima en {city} mes a mes: medias de veinte años`
- After: `Clima en {city} por meses: temperatura y lluvia media`

**Description**

- Before: `{city} a lo largo del año: {month} promedia N grados, {month} N. Medias de veinte años, los doce meses y su precipitación.`
- After: `Clima de {city}: medias mensuales 2001-2020, no un pronóstico. Más cálido: …; más frío: …; más lluvioso: … (mm).`
- For Lima and Antofagasta, where the wettest month has under 10 mm, the end reads instead: `casi sin lluvia (máximo N mm, en {month})`.

**What the change does:**
- It says the page holds averages, not a forecast, so it promises no forecast.
- It puts the page's own warmest, coldest and wettest month into the snippet.
- Every number is copied from the page's `facts`, and a test checks that.

| page | title after | description after |
|---|---|---|
| mar-del-plata | Clima en Mar del Plata por meses: temperatura y lluvia media | Clima de Mar del Plata: medias mensuales 2001-2020, no un pronóstico. Más cálido: enero (20,4 °C); más frío: julio (8,3 °C); más lluvioso: febrero (125 mm). |
| lima | Clima en Lima por meses: temperatura y lluvia media | Clima de Lima: medias mensuales 2001-2020, no un pronóstico. Más cálido: marzo (20,1 °C); más frío: julio (16,7 °C); casi sin lluvia (máximo 5 mm, en febrero). |
| manizales | Clima en Manizales por meses: temperatura y lluvia media | Clima de Manizales: medias mensuales 2001-2020, no un pronóstico. Más cálido: marzo (16,5 °C); más frío: julio (15,7 °C); más lluvioso: octubre (221 mm). |
| antofagasta | Clima en Antofagasta por meses: temperatura y lluvia media | Clima de Antofagasta: medias mensuales 2001-2020, no un pronóstico. Más cálido: febrero (21,5 °C); más frío: agosto (14,8 °C); casi sin lluvia (máximo 2 mm, en junio). |
| pasto | Clima en Pasto por meses: temperatura y lluvia media | Clima de Pasto: medias mensuales 2001-2020, no un pronóstico. Más cálido: febrero (13,7 °C); más frío: julio (12,2 °C); más lluvioso: noviembre (129 mm). |

### 2.4 Content problems found (reported, not changed)

**Grid-cell bias in Andean cities.** The weather pages take NASA POWER grid-cell normals. In mountain terrain the cell's mean altitude is far from the city's:

| page | shown | real |
|---|---|---|
| Medellín | 17.1–18.1 °C | ~22 °C |
| Cali | 15.9–16.6 °C | ~24–25 °C |
| Soacha | 18.2–19.5 °C | ~14 °C at 2,560 m |

The page does say these are grid-cell averages and not station readings. The numbers still mislead a reader. This needs a data decision (an altitude correction, a different source, or withdrawal) before any optimisation of these pages.

## 3. Implementation

| file | role |
|---|---|
| `data/atlas/copy-corrections/page-copy-2026-11-11.json` | the ledger: path, the exact current value of every changed field (`was`), the new value (`set`) |
| `scripts/atlas/apply-page-copy.mjs` | the applier; refuses rows whose `was` no longer matches; `--check` proves that nothing else changed against the base |
| `tests/atlas-page-copy.test.mjs` | the tests, see below |

The tests check:
- the corrections are applied;
- the climate test has at most 10 pages and changes title and description only;
- no control page is touched;
- the length bounds hold;
- every number in a description is one of the page's facts;
- compare-cities no longer promises city data.

**Not changed:** no template, the generator, no cohort rebuild.
- A cohort 001 rebuild would rewrite 76 pages, including the PR #43 crawl-push links.
- Every other climate page keeps its current title and description.

**Local verification:**
- `apply-page-copy --check`: 19 fields on 6 pages, nothing else.
- `npm test`: 446 passed, 0 failed.
- Atlas QA passes.
- Cohort QA for 001 and 003 passes.
- `export-cloudflare`: 0 failures.
- Worker build passes; Cloudflare tests 17/17.
- `cloudflare/simulate.mjs --env production --host livdar.com`: the 6 pages render the new title, description and og, with self canonical and `index, follow`. The 5 control pages are unchanged. Untouched pages (medellín, santiago-de-chile, cost-of-living-comparison) render identical to production in their main text.

**Tooling gap.** `cloudflare/build.mjs` imports `esbuild`, which is in neither `package.json` nor the `atlas-cloudflare` workflow. The local check installed it with `npm i --no-save`. The workflow's "Build the Worker" step will fail until that is fixed.

## 4. Publication, after approval

1. Merge into `migrate/atlas-cloudflare`.
2. Run `atlas-cloudflare` with `dry_run=true` and check that the report lists exactly 6 changed page objects.
3. Run it with `dry_run=false` and `deploy=none`. The Worker code does not change, only 6 R2 objects.

## 5. Measurement plan

**Unit.** Each group against its own baseline, as a difference in differences between test and control.

**Metrics.** Clicks, impressions, CTR and average position, per page and per group.

**Periods:**

| period | dates |
|---|---|
| baseline | 2026-10-12 to 2026-11-04, before the outage |
| excluded | the outage, 2026-11-05 to 2026-11-11, and the 7 days after the publication |
| measurement | the full days of real exposure after the recrawl |

**Recrawl confirmation.**
- URL Inspection on the 10 URLs, saved in `data/atlas/measurements/gsc/subsets/climate-ctr-test-2026-11.txt`. That is 10 inspections a run.
- Count a test page as exposed only once its `lastCrawlTime` falls after the publication and Google shows the new title.
- The inspection workflow runs only from `main`, so the subset file has to reach `main` first. That is a commit to `main`, and it needs the owner's approval.

**First evaluation.** After 2 to 4 weeks of real exposure.
- With about 400 impressions a group per 28 days, and expected CTR at these positions near 1–2%, the expected clicks are a handful.
- Unless impressions grow, the result will most likely be **inconclusive**, and it will be reported as such.

**Needed to measure properly** (separate approval): a dated per-page and page×query Search Console export (dimensions page, query, date). It would split the outage from the recovery and show whether the queries ask for today's weather or for monthly climate.

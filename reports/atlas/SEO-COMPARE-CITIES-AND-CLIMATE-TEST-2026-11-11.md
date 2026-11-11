# Compare cities fix and climate title test, 2026-11-11

**For review. Nothing here is published.** No merge and no publication until the owner approves. Section 7 explains why opening or updating this PR cannot change production, and section 8 lists the single publication run that would.

## 0. What serves production

| item | value |
|---|---|
| zone | `livdar.com` on Cloudflare (Free), `activated_on` **2026-11-11 12:38:44 UTC** |
| Atlas URLs | 107 route patterns go to Worker `livdar-atlas`, which renders page models from R2 bucket `livdar-atlas-data` |
| live Atlas version | `x-atlas-version: 20261110T170020Z` |
| everything else | `livdar.com/*` goes to Worker `livdar-origin-fallback`: it proxies Vercel and serves a snapshot when Vercel fails. Vercel still answers 402 (`x-livdar-fallback-reason: origin-402-DEPLOYMENT_DISABLED`) |
| source of the Atlas data | the cohort manifests `data/atlas/cohorts/cohort-NNN-pages.json`, data unchanged since `8d6f1e2` |
| publishing tooling | only on `migrate/atlas-cloudflare`, not on `main` |
| this PR | `atlas/seo-compare-cities-climate-test` into `migrate/atlas-cloudflare` |

## 1. Exact before and after, 6 pages

Only the fields below change. The ledger `data/atlas/copy-corrections/page-copy-2026-11-11.json` holds each field's exact old value (`was`) and new value (`set`). `scripts/atlas/apply-page-copy.mjs --check` proves that nothing else in any cohort manifest differs from the base: 19 fields on 6 pages.

### 1.1 /en/tools/compare-cities/ (cohort 001)

URL, canonical (`https://livdar.com/en/tools/compare-cities/`), hreflang, robots and links are unchanged.

| field | before | after |
|---|---|---|
| title | Compare cities: built on measured data | Compare cities: national price levels, not city prices |
| description | Compare cities from Livdar, computed against Eurostat + World Bank + Eurostat rather than crowd submitted figures, with every input and assumption shown. | No open city price index exists, so this compares the countries two cities are in, on Eurostat and World Bank price levels for 2024, labelled as national figures. |
| h1 | Compare cities | Compare cities: what national price data can show |
| fact "What it asks for" | first city, second city | the countries the two cities are in |
| fact "Source" | Eurostat + World Bank + Eurostat | Eurostat + World Bank |
| table caption | Everything a household buys | Price level of everything a household buys, by country (EU27 = 100) |
| sources (label and attribution) | Eurostat + World Bank + Eurostat | Eurostat + World Bank |

**Paragraphs.** The same text is in `sections[0].paragraphs`. The old text of every paragraph is in the ledger under `was.paragraphs`.

1. New: "No openly licensed price index exists for cities, so this page cannot say whether one city is dearer than another. It compares the countries the two cities are in, using the price level indices Eurostat and the World Bank publish, and every figure on it is a national figure."
2. New: "That answers part of the question. For two cities in different countries, the figures show how the two countries compare, not how the two cities do: prices in a capital can sit above the national level and prices in a small town below it, and two cities in the same country cannot be told apart by this data at all. A row that exists for one country and not the other stays visibly empty rather than being filled with the other side's figure."
3. Unchanged: "Worked example: Switzerland against Türkiye. The same standard basket costs about 294 percent more in the first, on the 2024 figures."
4. Unchanged: "It covers 199 countries, which is exactly the set the source measures and no more."
5. New: "The figures behind this page describe 2024 and they change when Eurostat or the World Bank publishes, not when this page is edited. That is why the year appears next to every value rather than in the small print: data that is a year old and says so is more useful than data that looks current and is not."
6. New: "To compare two countries against your own income, use the cost of living comparison tool."

**FAQ**

| question | before | after |
|---|---|---|
| Where do the numbers come from? | old answer, in `was.faq` | From the price level indices Eurostat and the World Bank publish for each country. Every figure carries the institution that published it and the year it describes. |
| Can it compare two cities in the same country? | did not exist | No. The data is national, so two cities in one country get the same figure. No openly licensed city price index exists, and Livdar does not estimate one. |
| Is the result a quote? | unchanged | unchanged |

### 1.2 Five climate test pages: title and description only

| page | title before | title after |
|---|---|---|
| /es/clima/mar-del-plata/ | Clima en Mar del Plata mes a mes: medias de veinte años | Clima en Mar del Plata por meses: temperatura y lluvia media |
| /es/clima/lima/ | Clima en Lima mes a mes: medias de veinte años | Clima en Lima por meses: temperatura y lluvia media |
| /es/clima/manizales/ | Clima en Manizales mes a mes: medias de veinte años | Clima en Manizales por meses: temperatura y lluvia media |
| /es/clima/antofagasta/ | Clima en Antofagasta mes a mes: medias de veinte años | Clima en Antofagasta por meses: temperatura y lluvia media |
| /es/clima/pasto/ | Clima en Pasto mes a mes: medias de veinte años | Clima en Pasto por meses: temperatura y lluvia media |

| page | description before | description after |
|---|---|---|
| mar-del-plata | Mar del Plata a lo largo del año: enero promedia 20,4 grados, julio 8,3. Medias de veinte años, los doce meses y su precipitación. | Clima de Mar del Plata: medias mensuales 2001-2020, no un pronóstico. Temperatura media, lluvia y humedad de cada mes, en una tabla. |
| lima | Lima a lo largo del año: marzo promedia 20,1 grados, julio 16,7. Medias de veinte años, los doce meses y su precipitación. | Clima de Lima: medias mensuales 2001-2020, no un pronóstico. Temperatura media, lluvia y humedad de cada mes, en una tabla. |
| manizales | Manizales a lo largo del año: marzo promedia 16,5 grados, julio 15,7. Medias de veinte años, los doce meses y su precipitación. | Clima de Manizales: medias mensuales 2001-2020, no un pronóstico. Temperatura media, lluvia y humedad de cada mes, en una tabla. |
| antofagasta | Antofagasta a lo largo del año: febrero promedia 21,5 grados, agosto 14,8. Medias de veinte años, los doce meses y su precipitación. | Clima de Antofagasta: medias mensuales 2001-2020, no un pronóstico. Temperatura media, lluvia y humedad de cada mes, en una tabla. |
| pasto | Pasto a lo largo del año: febrero promedia 13,7 grados, julio 12,2. Medias de veinte años, los doce meses y su precipitación. | Clima de Pasto: medias mensuales 2001-2020, no un pronóstico. Temperatura media, lluvia y humedad de cada mes, en una tabla. |

Every claim in the new description is a property of the page itself: the table has the columns Mes, Temperatura media, Precipitación and Humedad, and the data are 2001-2020 normals. The new descriptions carry no figures; section 3 explains why.

The h1, body, table and canonical of these pages stay as they are, and so does every other page. The 5 control pages are not in the ledger, and a test fails if any of them is.

## 2. Compare cities does not duplicate the cost of living comparison

`/en/tools/cost-of-living-comparison/` already compares countries, interactively, against an income. The repo's own near-duplicate metric (`lib/atlas/similarity-scale.js`: 5-word shingles, Jaccard, near-duplicate at 0.8) gives, over the main text of both pages:

| pair | before | after |
|---|---:|---:|
| compare-cities vs cost-of-living-comparison | 0.46 | 0.234 |

**What they still share:** the worked-example paragraph, the sentence "It covers 199 countries", and the price table rows, which are the same national data.

**What differs:**
- compare-cities is not interactive. It now explains what national data can and cannot say about two cities, and it links to the comparison tool for the country-against-income question.
- cost-of-living-comparison is the tool itself.

The change makes the two pages less alike than they were, not more. Its purpose is to stop the page promising city data. It does not turn compare-cities into a second country comparison tool.

**Not done, and why** (each needs a separate decision):
- **Canonical to cost-of-living-comparison:** compare-cities would leave the index with its 81 impressions at position 6.8 (GSC 2026-10-12 to 11-08). Its hreflang cluster (de, es, pt, pl `city-comparison`) would also point at a non-canonical page.
- **301:** the same loss, plus a Worker routing and sitemap change. It is hard to undo.
- **noindex:** the impressions are lost and nothing is consolidated.

**Same defect, reported only:**
- `city-comparison` in de, es, pt and pl;
- "first city, second city, income" in the facts of `cost-of-living-comparison` (en, de, fr);
- the repeated "Eurostat + World Bank + Eurostat" label on several tool pages.

## 3. Climate values: model against independent sources

The weather pages show NASA POWER grid-cell normals for 2001-2020. The table below sets the model's annual mean beside station normals cited by Wikipedia from the national weather services.

**Neither column has been verified here:**
- The station values come from a secondary source. For Medellín, Cali, Lima, Antofagasta and Mar del Plata they were read through a summary, not verbatim.
- The periods and the stations differ from the model's.
- A station at an airport is not the whole city either.

Agreement with the model does not confirm the model, and disagreement does not show which value is closer to the city.

| city | station (elevation) | period | cited source | station annual mean | model annual mean |
|---|---|---|---|---:|---:|
| Medellín | Olaya Herrera (1,490 m) | 1991-2020 | IDEAM | 23.1 °C | about 17.7 °C |
| Cali | 3 stations (954-985 m) | not given | IDEAM | 23.9-25.2 °C | about 16.3 °C |
| Soacha | not named | not given | IDEAM | 11.6 °C | about 18.8 °C |
| Manizales | La Nubia (2,058 m) | 1981-2010 | IDEAM | 17.0 °C | about 16.1 °C |
| Pasto | Obonuco (2,710 m) | 1991-2020 | IDEAM | 13.1 °C | about 13.1 °C |
| Lima | Campo de Marte | not given | SENAMHI | 19.6 °C | about 18.2 °C |
| Antofagasta | not named | 1991-2020 | DMC | 16.7 °C | about 17.6 °C |
| Mar del Plata | not named | 1991-2020 | SMN | 14.0 °C | about 14.2 °C |

For Lima the cited warmest month is February (24.1 °C), and the model's is March (20.1 °C).

**Consequences for this PR:**
- Medellín, Cali and Soacha are excluded from the test. The gap to the cited station values is large enough that their snippets and content may need a data decision first. That is a reason to leave them out, not a finding that the model is wrong.
- The test descriptions carry no model figures, so no snippet states as fact a value that an independent source disputes. The old descriptions did carry them, and they stay on every page outside the test.
- What to do about the values (an altitude correction, another source, or a clearer caveat) is a separate data decision. It is not part of this PR.

## 4. Build in a clean environment

`cloudflare/build.mjs` imports `esbuild`, which the base branch does not declare. This PR declares it in `package.json` as `"devDependencies": { "esbuild": "0.25.10" }`. `package-lock.json` was regenerated by npm and adds only the esbuild packages. Commit `7ea2acf`.

Each column replays the workflow's steps in a fresh worktree with a fresh `npm ci`, with no global or cached esbuild:

| step | base `854e4fa` | this branch |
|---|---|---|
| `npm ci` | ok | ok |
| `qa.mjs --ci` | ok | ok |
| shard manifests | ok | ok |
| `export-cloudflare.mjs` | ok, 0 failures | ok, 0 failures |
| `cloudflare/build.mjs` (Build the Worker) | **fails**: `ERR_MODULE_NOT_FOUND 'esbuild'` | ok |
| Worker tests | not reached | 17/17 |

So the base branch cannot currently complete the `atlas-cloudflare` workflow, and this PR fixes that.

**Other checks on this branch:**
- `npm test`: 446 passed, 0 failed.
- `apply-page-copy --check`: 19 fields on 6 pages, nothing else.

**Export diff, base against branch** (offline, both exports from clean worktrees): 6,889 objects each, **7 differ**:
- the 6 page objects;
- `pages/en/atlas/model.json`. The only change there is the compare-cities row's h1 in the tools list (`sections[3].rows[0].h1`), from "Compare cities" to the new h1.

Manifest counts are equal. An earlier local render with `cloudflare/simulate.mjs` showed untouched pages rendering identically to production.

**Quality gate.** It fails on 25 en and em dashes already in base migration files (`cloudflare/*`, `scripts/atlas/*cloudflare*`), and the base fails identically. This PR adds none. A proposed patch is in a comment on the PR; it is not applied here, to keep the PR narrow.

## 5. Outage, zone activation and the actual recovery

| moment (UTC) | evidence | what it shows |
|---|---|---|
| 2026-11-05, between 15:30 and 23:52 | earlier checks of Vercel | Vercel starts answering 402, and livdar.com is down |
| 2026-11-11 12:38:44 | Cloudflare zone `activated_on` | Cloudflare considers the zone active. That is not yet traffic |
| 2026-11-11 12:40 | Cloudflare zone analytics, per minute | first requests reach the zone: 43 at 12:40, 441 at 12:41, then about 7,000 a minute from 12:42 to 12:49 (a burst from one browser user agent, origin not established) |
| 2026-11-11 12:55 | zone analytics filtered on Googlebot | **first Googlebot request through Cloudflare**: `/sitemap.xml`, 200 |
| 2026-11-11 12:56 to 12:58 | same | Googlebot fetches climate sitemaps and `/en/atlas/`, all 200 |
| 2026-11-11 13:37 | own `curl` | 200 through Cloudflare |
| at writing | own `curl` with a Googlebot user agent | `/robots.txt` 200 from the snapshot, `/en/` 200, `/en/tools/compare-cities/` 200, `/` 307 |

**How to read it:**
- The 402 rows in zone analytics pair with 200 rows on the same path in the same minute. They are the fallback Worker's subrequests to Vercel; the client gets the snapshot (header `x-livdar-origin: snapshot`). Every Googlebot request in the table above was answered 200.
- Cloudflare only sees clients whose resolvers already use the new nameservers. Clients with the old delegation cached kept reaching Vercel and getting 402, invisibly to Cloudflare, for up to the delegation TTL. So 12:40 is the earliest recovery, not the moment every client recovered.
- Zone analytics on the Free plan are sampled, so the counts are approximate. The minute of first appearance is reliable.
- Non-Atlas pages are served from a snapshot, not from a live origin. For them the recovery is a frozen copy.

**For measurement:** the first full day after recovery is **2026-11-12**. The Search Console baseline ends on 2026-11-08, so it contains none of the recovery.

## 6. Test design: positions differ

| group | pages | impressions | clicks | weighted position |
|---|---:|---:|---:|---:|
| test | 5 | 388 | 1 | 8.9 |
| control | 5 | 390 | 2 | 11.2 |

The groups match on impressions but not on position: the test group ranks 2.3 places better. CTR depends strongly on position, so comparing raw CTR between groups, or raw CTR before and after, is not enough. A change in position after the publication would also change CTR without the title having any effect, and the recrawl itself can move rankings.

The pages are paired by impressions. In each pair, the path with the smaller sha256 is the test page.

| pair | test (impressions, position) | control (impressions, position) |
|---|---|---|
| 1 | mar-del-plata (132, 7.5) | santiago-de-chile (163, 11.8) |
| 2 | lima (104, 10.8) | guayaquil (95, 8.8) |
| 3 | manizales (78, 9.8) | austin (58, 10.9) |
| 4 | antofagasta (39, 7.7) | zaragoza (38, 10.9) |
| 5 | pasto (35, 8.3) | tokio (36, 15.3) |

**Excluded:** medellin, cali and soacha (section 3), and san-salvador-de-jujuy (odd page out).

**Source.** `scripts/gsc-report.mjs` in scheduled run 109, window 2026-10-12 to 2026-11-08, filter impressions ≥ 20 and position 4 to 20. The report has page totals only, no page×query data. Ahrefs GSC returned "Insufficient plan".

**Query intent.** The keywords are `clima <city>`. In Spanish that is often a weather-today search, answered by Google's own weather box. These pages hold monthly averages and do not promise a forecast.

## 7. Why this PR cannot deploy anything

Checked mechanism by mechanism, not inferred from the absence of recent deployments.

| mechanism | configuration | effect of opening, updating or merging this PR |
|---|---|---|
| GitHub Actions | only `atlas-ci` runs on push and pull_request. It runs tests, quality gate, qa, funnel, links and reconcile, and has no deploy or upload step. `atlas-cloudflare` is `workflow_dispatch` only, and every other workflow is dispatch or schedule | no deployment |
| Cloudflare Workers | `livdar-atlas`, `livdar-atlas-staging`, `livdar-origin-fallback` and `smspro-cron` have no Workers Builds trigger connected. Their deployments are `source: api`, manual. There are 0 Pages projects | no deployment |
| R2 data | written only by `cloudflare/upload-r2.mjs`, which runs only inside `atlas-cloudflare` with `dry_run=false` | no change |
| Vercel | the Git integration is connected. The ignored-build command lets a production build run only for the production branch (`main`). For `atlas/*` and `claude/*` branches it lets a **preview** build run when there is a PR. For this PR the commit status is "Vercel: failure - Account is blocked" | today nothing builds. If the account were unblocked, a push to this PR would create a **preview** deployment on a vercel.app URL, never production: this PR targets `migrate/atlas-cloudflare`, not `main` |

Even a Vercel production deployment would not reach the Atlas pages. They are served by `livdar-atlas` from R2; Vercel is only the fallback Worker's origin for the other routes.

## 8. One publication, after approval

1. Merge PR #57 into `migrate/atlas-cloudflare`.
2. Run `atlas-cloudflare` on ref `migrate/atlas-cloudflare` with `dry_run=true`, `retire` empty and `deploy=none`.
   - Check that every step through the Worker tests passes; the build step now has esbuild.
   - Check that the exported counts match the base: 6,889 objects.
   - `dry_run=true` exports but does not compare with the bucket, so it cannot show the 7 objects.
3. Run it once more with `dry_run=false`, `retire` empty and `deploy=none`.
   - In the "Sync R2" log, `skippedIdentical` should read about 6,881 and `toUpload` about 7.
   - The manifest is written last, so the version changes only after the 7 objects are in.
   - Worker code does not change.
4. Check that `/__health` shows the new version.
   - The 6 pages should serve the new title and description, with a self canonical and `index, follow`.
   - One control page and one untouched page should be unchanged.
5. To track the recrawl, the 10-URL inspection subset (`data/atlas/measurements/gsc/subsets/climate-ctr-test-2026-11.txt`) has to be on `main`, because the inspection workflow runs only from `main`. That is a separate commit to `main` and needs its own approval.

**Risk in step 3.** If `toUpload` is far above 7, the bucket differs from the base export in ways not seen here, and the run would still upload those objects. If that happens, cancel the run before it writes the manifest and investigate.

## 9. Measurement plan

**Unit.** A paired difference in differences: for each pair, the change in the test page against the change in its control page. Group totals are reported too.

**Position adjustment.**
- For each page and period, compute the expected CTR at its observed position from the site's own CTR-by-position curve (all Spanish climate pages, bucketed by position).
- Use observed clicks divided by expected clicks.
- The effect is the change in that ratio for test minus the change for control.
- Report position changes separately. If a group's position moves by more than about 1, the result is confounded and is reported as such.

**Periods.**

| period | dates |
|---|---|
| baseline | 2026-10-12 to 2026-11-04 |
| excluded | 2026-11-05 to 2026-11-11 (outage), and the publication day plus 7 days |
| measurement | the full days after the publication, once the test page's `lastCrawlTime` is after the publication and Google shows the new title |

**First evaluation:** after 2 to 4 weeks of measurement. At about 400 impressions a group per 28 days and an expected CTR of 1-2% at these positions, the expected clicks are a handful. Unless impressions grow, the result will most likely be inconclusive, and it will be reported that way.

**Needed to measure properly** (separate approval): a dated Search Console export by page, query and date. It would separate outage and recovery days and show whether the queries ask for today's weather or for monthly climate.

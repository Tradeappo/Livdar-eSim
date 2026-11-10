# Livdar Atlas on Cloudflare

This branch (`migrate/atlas-cloudflare`) moves the **serving** of the existing Livdar Atlas
from Next.js on Vercel to a Cloudflare Worker reading page models from R2. It is isolated
from `main`. Production `livdar.com`, its Vercel project, its DNS and its sitemap are
unchanged, and nothing here routes production traffic.

The Atlas itself was not rebuilt. Its taxonomy, templates, source datasets, page models,
URL and slug generation, publication registry, eligibility gates, QA, sitemaps, canonicals,
hreflang, structured data and internal linking are the ones already in this repository.

---

## 1. What exists today (measured, not estimated)

Four distinct things get confused when people say "how many Atlas pages are there", so they
are separated here.

| | count | where it comes from |
|---|---|---|
| Mathematically possible combinations | ~10⁸ | families × entities × locales × months. **Not pages.** |
| Candidates in cohort manifests | 6,500 | `data/atlas/cohorts/cohort-00{1..4}-pages.json` |
| Approved (passed cohort QA, in a manifest) | 6,500 | a page is only written to a manifest after QA |
| Published cohort pages | 6,500 | the manifest **is** the publication statement for this generation |
| Published legacy registry pages | 123 | `data/atlas/registry.json`, state `published` |
| Legacy section hubs | 2 | `/en/cities/`, `/de/staedte/` |
| Country hubs | 178 | derived by `lib/atlas/country-hubs.js` |
| Language directories | 9 | `/{lang}/atlas/` |
| **Total published, serveable Atlas URLs** | **6,812** | exported and verified |
| URLs listed in Atlas sitemaps | 6,812 | exact match, asserted by the export |
| Sitemap files | 77 | 76 children + 1 index |

**There are two Atlas generations live at once**, which the audit found and the migration
preserves:

- **Cohort generation** — 6,500 pages, 14 families, 10 URL groups, 9 locales
  (`de en es fr it ja nl pl pt`). Served by `lib/atlas/serve-pages.js` from prebuilt
  manifests, `dynamicParams = false`.
- **Legacy registry generation** — 123 `city-month` pages in `en` (77) and `de` (46) under
  `/{lang}/cities|staedte/{city}/{month}/`, plus their 2 section hubs. Served by
  `lib/atlas/serve.js` from `data/atlas/registry.json`, models built on request.

Both render through the same `components/atlas/AtlasPage.jsx`, so both migrate through one
renderer.

Pages per family: `weather.city-month` 6,000 · `cost-of-living.country` 193 · `city-month`
(legacy) 123 · `work.country-salaries` 58 · `events.*` 55 · `tools.*` 71 ·
`neighbourhoods.city-where-to-stay` 40 · `sport.city-season` 29 · `rankings.index` 25 ·
`weather.country-best-time` 24 · `rents.country-inflation` 5.

**Google Search Console**: `scripts/atlas/gsc-import.mjs` and the `atlas-search-console`
workflow are wired to GSC but need credentials this session does not hold, so **no
indexed-page count was read**. The sitemap-vs-inventory reconciliation was still done, from
the source side: 6,812 exported URLs = 6,812 sitemap URLs, 0 orphans in either direction.
Comparing that against GSC coverage needs `GSC_CREDENTIALS` and is listed as a blocker.

---

## 2. Architecture

### Two components, deliberately split

**A. Generation and publishing — stays in GitHub Actions, unchanged.** Ingesting NASA
climate normals and running cohort QA over 6,500 models is a batch job with no business in
a 30-second isolate. The existing workflows are untouched:

```
atlas-ingest      refreshes source datasets                 -> pull request
atlas-generate    builds page models for a lot, runs QA      -> pull request
atlas-publish     moves registry states, rebuilds sitemaps   -> pull request
atlas-cloudflare  exports the published set, syncs R2        <- NEW, the last step only
```

Cloudflare is a **publication target, not a second source of truth.** `atlas-cloudflare.yml`
cannot publish anything: the exporter reads the registry and the cohort manifests and
refuses to invent a page.

**B. Serving — the Cloudflare Worker.**

```
request /de/wetter/muenchen/
  │
  ├─ 1. GET atlas/manifest.json        (isolate-cached 60s, edge-cached)
  │      absent  -> 503 for EVERYTHING. Never 404.
  │
  ├─ 2. is /de/ a published locale?    (from the manifest, no R2 read)
  │      no      -> 404 without touching R2
  │
  ├─ 3. edge cache, keyed by dataset VERSION + path
  │      hit     -> return (no R2 read, no CPU)
  │
  ├─ 4. GET atlas/pages/de/wetter/muenchen/model.json
  │      absent  -> 404   (the object's absence IS the 404)
  │      throws  -> 503   (infrastructure, not absence)
  │
  └─ 5. renderToStaticMarkup(<AtlasPage model={...} />) -> HTML, cache, return
```

### Why there is no route manifest

The first version of this Worker kept a `route-manifest.json` listing every published path
and consulted it before fetching. That is a second statement of what is published, it must
be downloaded and parsed on a cold start, and at the target scale it is a 100-million-entry
JSON file inside a 128 MB isolate. **One R2 object per page, keyed by the URL path, makes
the bucket listing the route table**, and a bucket cannot disagree with itself.

### Why dynamic rendering, not HTML snapshots

The first version of the exporter crawled a local Next.js server and saved one HTML file
per URL. That migrates the pages that exist and nothing beyond them: 6,812 files now,
100,000,000 files at the target, a full re-crawl for every template change, and a Worker
that is a file server rather than a renderer.

So **the unit of migration is the page model**, and the Worker renders it with this
repository's own React components via `react-dom/server`. One template, N models. A design
change is a Worker deploy; a content change is a model re-upload; neither is both.

This was possible because the page models are already self-contained — `h1`, `title`,
`description`, `facts`, `sections`, `table`, `faq`, `links`, `sources`, `breadcrumbs`,
`cta`, `labels`, tool spec — and the render chain has **exactly one** filesystem
dependency (`lib/atlas/serve-pages.js`, used only for `languagesServed()`), which is
shimmed. No file in `lib/` or `components/` was modified for Cloudflare.

### R2 layout

```
atlas/manifest.json                             config: version, locales, counts, sitemap ids
atlas/pages/{locale}/{segment}/{slug}/model.json one object per published page (6,812)
atlas/sitemaps/{id}.xml                          76 children + index.xml
build/worker.js                                  the deployed bundle (import bootstrap only)
```

Each `model.json` is one envelope: `{kind, path, locale, family, surface, cohort, lastmod,
head{title, description, canonical, hreflang, og, twitter}, alternatePaths, jsonld, model}`.
Everything SEO-critical is computed at **export** time by `lib/seo.js`, `lib/atlas/schema.js`
and `serve-pages.alternatesFor()` — the same functions the Next.js routes call — so the
Worker cannot derive a canonical or an hreflang cluster differently from production.

### Cache invalidation

The dataset `version` is part of every edge cache key. A re-export changes every key at
once, atomically, with no purge call and no window where half the site is old. The manifest
is uploaded **last**, so the Worker never advertises a partial dataset.

### Fail-closed, by design

A 404 teaches Google the URL is gone. Dropping 6,812 live URLs because a binding was
misconfigured is the one outcome this migration must not produce. So:

| situation | response |
|---|---|
| `ATLAS_R2` binding missing | 503 |
| `atlas/manifest.json` absent | 503 for every path |
| manifest present, page object absent | **404** (the page is genuinely unpublished) |
| page object listed in a sitemap but absent | 503 |
| R2 throws, render throws | 503 + `retry-after: 120` |
| unknown locale prefix | 404, with no R2 read |
| traversal, `//`, backslash, control char, >1024 chars | 404 |

Verified empirically before the import: with the bucket empty, `/__health` and
`/de/wetter/muenchen/` both returned **503**, not 404.

---

## 3. What was deployed and imported

| | |
|---|---|
| Cloudflare account | `6399a10eac8a470f6a2d98a589e767c4` |
| Worker | `livdar-atlas-staging` (reused, not recreated) |
| Staging URL | `https://livdar-atlas-staging.reee4603.workers.dev` |
| R2 bucket | `livdar-atlas-data` (reused), WEUR, Standard |
| Binding | `ATLAS_R2` → `livdar-atlas-data` |
| Bundle | 743 KB, **10 ms startup**, `compatibility_date` 2026-11-01 |
| Observability | enabled, `head_sampling_rate: 1` |
| Objects imported | **6,890** (6,812 models + 77 sitemaps + 1 manifest) |
| Bytes imported | **83,339,009** (79.5 MB) |
| Verification | 0 missing, 0 checksum mismatches, against R2's own listing |
| Dataset version | `20261110T160545Z` |

### How the import got in without new credentials

R2's S3 endpoint needs an access key pair, and minting one is an account-level change with
a credential that then has to live somewhere. The Worker already holds the only thing
required — the `ATLAS_R2` binding — so the import is pushed **through the Worker**:
`cloudflare/upload-r2.mjs` POSTs NDJSON batches to `/__ingest` behind a bearer token kept
as a Worker secret (`ATLAS_INGEST_TOKEN`). No new credentials, and the write path
disappears when the secret does.

`/__ingest` is refused entirely when the secret is unset, compares the token without
leaking its prefix through timing, and accepts only keys under `atlas/`.

**Idempotent and resumable with no local state.** `GET /__ingest` returns every key's R2
etag (the md5 of the body for a single-part put); the uploader hashes what it has and sends
only the difference. Demonstrated: after the `og:type` fix, a re-run **skipped 6,702
identical objects and uploaded 187**.

`DELETE /__ingest` removes named keys, which is how a retired page leaves the edge. There
is no prefix delete — "delete everything under `/en/`" is one typo from unpublishing a
language.

---

## 4. Verification

### SEO parity against the Next.js renderer — the gate that matters

`scripts/atlas/compare-cloudflare.mjs` fetches each sampled URL from both a locally running
Next.js app and the deployed Worker and compares what a crawler consumes: status, title,
meta description, canonical, the **whole** hreflang cluster, the JSON-LD graph (parsed and
deep-compared), `og:*`, `twitter:card`, `<html lang>`, `h1`, every `h2` in order, every
internal link in `<main>`, and the full visible text of `<main>` normalised to words.

**Result: 216 URLs sampled, 216 identical, 0 differences.** Two pages from each of the 123
`(kind, family, locale)` cells — every family, every language, both generations, all three
page kinds.

```
{"sampled": 216, "identical": 216, "differing": 0, "byField": {}}
```

`robots` is the one expected difference and is asserted in both directions: the run fails
if the Cloudflare page is indexable, and it also fails if the Next.js reference is itself
noindex (which would make the comparison prove nothing).

Full report: `reports/atlas-cloudflare-parity.json`.

### The one SEO difference found, and fixed

The first parity run reported 18 differing cells, all on a single field: `og:type`. The
exporter declared `article` for every page, but `app/[lang]/atlas/page.jsx` and
`app/[lang]/atlas/[country]/page.jsx` call `buildMetadata()` with no `type`, and
`lib/seo.js` defaults to `website`. So all 178 country hubs and 9 directories would have
carried the wrong Open Graph type. Fixed in the exporter, re-exported, incrementally
re-imported (187 objects), re-verified: 0 differences.

### Render coverage

All **6,812** exported pages were rendered through the Worker's renderer locally without a
single throw (`node cloudflare/render-sample.mjs .atlas-cloudflare-export --all`), which is
what rules out a family or locale that only fails in production.

### Live behaviour on staging

| check | result |
|---|---|
| data page, hub, directory, legacy page, legacy hub | 200 |
| all 9 locales, all 14 + 4 families | 200 |
| unknown slug under a real segment | 404 |
| unknown locale prefix | 404 |
| path traversal | 404 |
| unknown sitemap id | 404 |
| empty bucket (before import) | 503, never 404 |
| sitemap index + children | 200, `lastmod`/`changefreq`/`priority`/`xhtml:link` intact |
| `x-robots-tag` | `noindex, nofollow, noarchive` on every response |
| `/robots.txt` | `Disallow: /` |
| edge cache | `x-atlas-cache: hit` with `age` on repeat |
| canonical on staging | points at `https://livdar.com/...`, not at workers.dev |

### Measured load and resource use

`scripts/atlas/cloudflare-loadtest.mjs`, 5,100 requests against the deployed Worker from a
single client, every one HTTP 200, no errors at any stage
(`reports/atlas-cloudflare-load.json`):

| stage | req | conc | rps | p50 | p90 | p99 | cache hits |
|---|---|---|---|---|---|---|---|
| cold, unique URLs | 100 | 10 | 23.7 | 344 ms | 747 ms | 891 ms | 0 |
| cold, unique URLs | 500 | 25 | 78.5 | 325 ms | 393 ms | 558 ms | 0.13 |
| cold, unique URLs | 2000 | 50 | 180.2 | 310 ms | 373 ms | 505 ms | 0.20 |
| warm, 20 URLs | 500 | 25 | 362.8 | 44 ms | 77 ms | 321 ms | 0.914 |
| warm, 20 URLs | 2000 | 50 | 476.3 | 43 ms | 57 ms | 128 ms | 0.997 |

Read these as **client-observed** latency from one container through an HTTPS proxy, not as
Worker CPU time. The warm p50 of 43 ms is essentially the network round trip, so the cold
path — one R2 GET plus a full React render — costs roughly **270 ms of added wall time**,
almost all of it the R2 read rather than the render: rendering all 6,812 pages locally takes
275 ms in total, about 0.04 ms each. The 180 rps at 50 connections is a limit of the test
client, not of the Worker.

### CI

`tests/atlas-cloudflare.test.mjs` — 6 tests, 0.5 s, no network and no bucket:
the render chain has no filesystem dependency; the build refuses a Node built-in; path
normalisation rejects everything that could resolve to another key; every
`(kind, family, locale)` cell renders with canonical, title, description, noindex, h1,
footer, its complete hreflang cluster and a JSON-LD graph equal to the exported one; the
export keeps its completeness gates; the Worker never answers a missing dataset with 404.

---

## 5. Scaling to 100 million URLs

Nothing in the request path grows with the catalogue:

| | 6,812 | 100 K | 1 M | 10 M | 100 M |
|---|---|---|---|---|---|
| R2 GETs per cache miss | 1 | 1 | 1 | 1 | 1 |
| Objects parsed per request | 1 | 1 | 1 | 1 | 1 |
| Bytes in the isolate per request | ~12 KB | ~12 KB | ~12 KB | ~12 KB | ~12 KB |
| Manifest size | ~3 KB | ~3 KB | ~3 KB | ~3 KB | ~3 KB |
| R2 objects | 6,890 | ~100 K | ~1 M | ~10 M | ~100 M |
| R2 storage | 79.5 MB | ~1.2 GB | ~12 GB | ~120 GB | ~1.2 TB |

There is no listing, no scan and no index to load. Adding pages adds objects, which R2 does
not limit in count and does not charge per object to hold. The architectural work for 100 M
is therefore **done**, not planned — what remains is quality and eligibility, which is the
publication gate's job, not the infrastructure's.

**Infrastructure capacity for 100 M URLs is not permission to publish 100 M URLs.** The
registry and the cohort QA still decide what exists, and the exporter can only export what
they already approved.

If a single page model ever exceeds a comfortable isolate budget, the envelope splits into
`model.json` + a lazily fetched `tool.json` for the few large tool tables (p50 is 11.8 KB;
the one 507 KB outlier is a tools page carrying a 35-country table).

---

## 6. Cost

Rates read from `developers.cloudflare.com` on 2026-11-10: Workers Paid $5/month minimum;
requests 10 M included then $0.30/M; CPU 30 M CPU-ms included then $0.02/M CPU-ms; R2
Standard storage $0.015/GB-month after 10 GB free; class A $4.50/M after 1 M free; class B
$0.36/M after 10 M free; **egress free at every volume**.

Two billing rules do most of the work and are applied rather than glossed over: a
cache-served request is billed as a request but consumes **no CPU and no R2 read**; and R2
usage rounds **up** to the next billing unit.

`scripts/atlas/cloudflare-cost.mjs` computes the projections from the measured export size
(12,232 bytes per page model) and writes `reports/atlas-cloudflare-cost.json`.

The load test measured a 0.997 warm cache hit ratio, but that is a rotating set of 20 URLs
— what a popular page looks like, not what a 6,812-page long tail looks like under a
crawler. So the planning figures below use a deliberately conservative **0.90**, and the
report also carries the measured ratio as a best case.

**Today's catalogue (6,812 pages, 79.5 MB), planning ratio 0.90:**

| requests/month | total | requests | CPU | R2 reads | storage |
|---|---|---|---|---|---|
| 1 M | **$5.00** | $0 | $0 | $0 | $0 (free tier) |
| 10 M | **$5.00** | $0 | $0 | $0 | $0 (free tier) |
| 100 M | **$33.00** | $27.00 | $1.00 | $0 | $0 |
| 1 B | **$349.82** | $297.00 | $15.40 | $32.42 | $0 |

**At catalogue scale, planning ratio 0.90:**

| pages | requests/month | storage | total/month | one-off full re-import |
|---|---|---|---|---|
| 100 K | 1 M | 1.2 GB | **$5.00** | $0 |
| 1 M | 10 M | 12.2 GB | **$5.05** | $0 |
| 10 M | 100 M | 122 GB | **$34.70** | $40.50 |
| 100 M | 100 M | 1.2 TB | **$51.21** | $445.50 |
| 100 M | 1 B | 1.2 TB | **$368.03** | $445.50 |

So **storing and serving 100 million Atlas URLs is a ~$51/month infrastructure problem**
at 100 M requests/month, and the dominant cost at every volume is Workers requests, not
storage and not R2 reads. Egress — the line that makes this expensive on most clouds — is
$0 at every volume.

The one-off column is the class-A cost of writing every object once; the uploader is
incremental, so a normal month writes only what changed (demonstrated: 187 of 6,890).

The one input it cannot measure from outside the isolate is **CPU per render**. It defaults
to a pessimistic 8 ms and says so in its own output. Read the real p50 from Workers
observability (now enabled on this Worker) and re-run with `ATLAS_CPU_MS=<p50>` before
quoting the CPU line anywhere.

No paid service was enabled. The import, the load test and the staging traffic are inside
the free allowances. **Railway is not part of this architecture** and no technical
dependency calls for it.

### Cost protection

- Unknown locale prefixes are rejected without an R2 read, so a scanner walking random
  paths cannot turn into one class-B operation each.
- `s-maxage=86400` at the edge; pages are annual statistics.
- The stylesheet is one immutable content-addressed asset with a 1-year `max-age`, served
  from the bundle with no R2 read at all.
- The uploader is incremental, so a weekly ingest does not cost 6,889 class-A operations.
- Still to configure in the dashboard, which needs account-level access: a Workers request
  budget alert and an R2 class-A/class-B alert.

---

## 7. Production cutover (NOT executed — needs explicit approval)

Nothing below has been run. The Worker answers only on `workers.dev`.

1. **Pre-flight.** `npm test`; `node scripts/atlas/qa.mjs --ci`;
   `node scripts/atlas/export-cloudflare.mjs`; `node cloudflare/upload-r2.mjs`;
   `/__health` reports `dataReady` with the expected version and counts.
2. **Full parity, not a sample.** `ATLAS_ORIGIN_A=<production> ATLAS_ORIGIN_B=<worker>
   node scripts/atlas/compare-cloudflare.mjs --all` against **real livdar.com**, not a dev
   server. Requires 0 differences on all 6,812 URLs. The sampled run proves the renderer;
   this proves the dataset.
3. **Turn indexability on.** Drop the staging `noindex` (one flag in
   `cloudflare/src/render.jsx` and the `guard()` headers in `cloudflare/src/worker.js`),
   and remove the `robots.txt` `Disallow`. **Not before step 2 passes**, and not before
   somebody has confirmed the canonical on a Worker-served page points at `livdar.com`.
4. **Add the zone route, Atlas paths only.** The Atlas owns a known set of first path
   segments per locale (`ATLAS_SEGMENTS` in `lib/atlas/atlas-urls.js`, plus
   `/{lang}/atlas/*` and the legacy `cities|staedte|orase|airports|flughaefen|aeroporturi`).
   Route **those patterns only**. Never `livdar.com/*`: the eSIM site, the home pages and
   the legal pages must keep reaching Vercel.
5. **Canary.** Enable one segment in one locale (suggest `/nl/huurverhoging/*`, 5 pages).
   Watch for 24 h: status mix, `x-atlas-cache`, Worker errors in observability, GSC crawl
   stats for those URLs.
6. **Widen** one group at a time, smallest first, each with a 24 h watch.
7. **Sitemaps last.** Only after every Atlas path serves from Cloudflare, repoint
   `/sitemap-atlas/*`. Do **not** change the production sitemap before then, and do not
   submit anything to Google: the URLs are unchanged, so nothing needs resubmitting.
8. **Delete the ingest secret** once the pipeline uses its own, so the live Worker carries
   no write path reachable from the internet.

### Rollback

Reversible at every step, in decreasing blast radius:

1. **Remove the Cloudflare route.** Traffic returns to Vercel immediately; Vercel was never
   changed, so there is nothing to restore. This is the whole rollback for steps 4–7.
2. **Roll the dataset back.** Re-export at the previous commit and re-upload; the manifest
   version changes and every edge cache key with it.
3. **Roll the Worker back.** `PUT /workers/scripts/livdar-atlas-staging` with the previous
   bundle, or Cloudflare's own deployment rollback.
4. **Retire a page.** `atlas-publish` with `action: retire`, then `atlas-cloudflare` with
   `retire: /path/` — the object leaves the bucket and the URL starts returning 404.
5. **Stop everything.** Delete the `ATLAS_R2` binding and the Worker answers 503 for every
   Atlas path, which is the safe failure, not a 404 storm. Remove the route as well and
   Vercel serves again.

---

## 8. Remaining blockers and known gaps

1. **Client-side interactivity is not yet served.** The Worker renders the complete
   server HTML — which is all a crawler reads, and the parity run confirms the text,
   links and structured data are identical — but it ships no client bundle, so the
   calculator on the ~96 `tools` pages, the consent banner and the language globe are
   static. Next.js serves those as Vercel build artifacts. **Fix before step 4 of the
   cutover**: bundle `AtlasTool.jsx` and `ConsentBanner.jsx` as client islands with
   esbuild, serve them from the Worker like the stylesheet, and hydrate on mount. The
   component tree is already identical, so this is an addition, not a rewrite.
2. **No Google Search Console comparison.** Needs `GSC_CREDENTIALS`. The sitemap-vs-source
   reconciliation was done; the sitemap-vs-indexed comparison was not.
3. **CPU per render is not measured inside the isolate.** Observability is enabled; read
   the p50 and re-run the cost model with `ATLAS_CPU_MS`.
4. **Load test scale.** A few thousand requests against staging. It produces the
   per-request cost basis; it does **not** demonstrate 100 M requests/month.
5. **Cost alerts not configured** — needs dashboard access (section 6).
6. **The two Atlas generations should converge.** 123 pages and 2 hubs still run on the
   older registry path. Both are migrated and both work, but carrying two publication
   models indefinitely is a cost; folding the legacy 123 into a cohort is a separate piece
   of work, out of scope here.

---

## 9. Commands

```bash
node scripts/atlas/shard-manifests.mjs          # per-group shards the exporter reads
node scripts/atlas/export-cloudflare.mjs        # -> .atlas-cloudflare-export/
node cloudflare/build.mjs                       # -> cloudflare/dist/worker.js + render harness
```

```bash
ATLAS_INGEST_URL=https://livdar-atlas-staging.reee4603.workers.dev \
ATLAS_INGEST_TOKEN=... node cloudflare/upload-r2.mjs
```

```bash
ATLAS_ORIGIN_A=http://localhost:3000 \
ATLAS_ORIGIN_B=https://livdar-atlas-staging.reee4603.workers.dev \
ATLAS_COMPARE_PARALLEL=1 node scripts/atlas/compare-cloudflare.mjs --sample 2
```

Run the parity diff with `ATLAS_COMPARE_PARALLEL=1`. Against a `next dev` reference,
concurrent requests make the dev server return 500s from its own partially written build
manifests — that is the dev server, not the Atlas, and it produced a false 121-of-123
failure on the first attempt.

```bash
ATLAS_ORIGIN=https://livdar-atlas-staging.reee4603.workers.dev \
  node scripts/atlas/cloudflare-loadtest.mjs
node scripts/atlas/cloudflare-cost.mjs
node --test tests/atlas-cloudflare.test.mjs
```

## 10. Safety

- No Vercel project, deployment or setting was touched; nothing was deleted.
- No DNS record was created or changed; `livdar.com` is not reassigned.
- No production route, sitemap or indexing behaviour changed.
- `cartela.credit`, `meniudigital.restaurant`, `smspro.ro`, `ifunciara.ro` untouched.
- No paid service enabled. No new Worker, bucket or account created — the existing ones
  were reused.
- Nothing merged to `main`. No page published: the exporter reads the registry and the
  cohort manifests and cannot add to either.
- Nothing submitted to Google.

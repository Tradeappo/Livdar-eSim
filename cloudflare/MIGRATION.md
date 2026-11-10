# Livdar Atlas on Cloudflare

Branch `migrate/atlas-cloudflare`. Nothing here is merged to `main`, no Vercel project or
deployment was changed or deleted, and no DNS record was touched.

## 0. Status, 2026-11-10

| Component | Status |
|---|---|
| Atlas generation factory | Unchanged, in GitHub Actions. `atlas-cloudflare.yml` added as the last step. |
| R2 dataset | 6,812 page models + 77 sitemaps + manifest in `livdar-atlas-data`, verified by etag against the bucket listing. |
| Staging Worker `livdar-atlas-staging` | Deployed. All 6,812 URLs and 77 sitemaps byte-identical to the tested build. |
| Production Worker `livdar-atlas` | Deployed, **no routes**. Indexable only on `livdar.com`, so noindex on its workers.dev host. |
| Interactive tools | Hydrated client islands. 62/62 tool pages work in a real browser. |
| SEO parity | **6,812/6,812** identical to the Next.js production server, production mode, robots included. |
| Sitemaps | 76/76 children identical to Next's generator (6,812 URLs), served at their original `/sitemap/atlas-*.xml` URLs. |
| Production routing | **Not executed.** `livdar.com` is not on Cloudflare (section 7). |
| Vercel independence for Atlas traffic | Ready, not live: no Atlas request reaches Cloudflare until the routes exist. |
| Cost monitoring | 5 alert policies created, plus the existing $10 budget alert. |
| Rollback readiness | Baseline recorded. **The rollback origin is currently down** (section 7). |

## 1. The two facts that decide the cutover

**Vercel has disabled every deployment of `livdar-esim`.** Every path on `livdar.com`, on
`www.livdar.com` and on each `*.vercel.app` deployment URL returns `HTTP 402`,
`x-vercel-error: DEPLOYMENT_DISABLED`, body "Payment required". The deployments themselves
are `READY` and the project reports `live: false`, so this is an account-level
plan or usage block, not a broken build. The whole site is down, the eSIM site included.
Production has `ATLAS_ONDEMAND=1` (seed 25): every Atlas page past the seed is rendered by
a function on its first request and written to the ISR cache, which on a Hobby team with
crawlers walking 6,500 URLs is a plausible route to the usage limit. Only the account owner
can clear the block. Recorded in `reports/production-baseline-2026-11-10.json`.

Google treats a sustained 4xx as "this URL is gone". Every day of 402s erodes the indexing
the Atlas has earned, on Atlas and eSIM URLs alike.

**`livdar.com` DNS is on Namecheap, not Cloudflare.** The Cloudflare account holds no
zones. A Worker route only sees requests that already pass through a Cloudflare zone, so
the Atlas cannot be served on `livdar.com` from Cloudflare until the domain's nameservers
point at Cloudflare. That is the domain-wide change this migration was told to stop at.

## 2. Inventory

| | count |
|---|---|
| Cohort pages (manifests = approved = published) | 6,500 |
| Legacy registry pages (`published`) + their 2 section hubs | 125 |
| Country hubs | 178 |
| Language directories | 9 |
| **Published Atlas URLs** | **6,812** |
| URLs in Atlas sitemaps | 6,812, 0 orphans either way |
| Atlas sitemap files | 76 children + 1 Atlas index |
| Interactive tool pages | 62, across 10 calculator types |

Two Atlas generations are live at once (cohort manifests; the older publication registry).
Both render through `components/atlas/AtlasPage.jsx` and both are migrated. "Pulse" and
"Events" are Atlas surfaces (the public-holidays pages) and are part of this. "Walking
Tours" has no code in this repository, so no `livdar.com` URL of it can collide with a route.

## 3. Architecture

```
GitHub Actions (unchanged)        Cloudflare
  ingest -> generate -> publish  ->  atlas-cloudflare.yml
                                       export page models -> R2 (incremental, by hash)
                                       retire removed pages -> R2 delete (guarded)

request /de/wetter/muenchen/  ->  Worker
  1. manifest from R2 (isolate 60 s)      absent -> 503 for everything, never 404
  2. locale in the dataset?               no     -> 404, no R2 read
  3. edge cache, key = env + version + build + path
  4. R2 GET atlas/pages/de/wetter/muenchen/model.json
                                          absent -> 404 (the page is not published)
                                          throws -> 503 + retry-after
  5. renderToStaticMarkup(<AtlasPage/>) + four hydrated islands -> HTML
```

- **Models, not HTML snapshots.** The repository's own React components render the page in
  the Worker. One template, N models. Nothing in `lib/` or `components/` was modified for
  Cloudflare.
- **No route table.** One R2 object per page keyed by its path, so the bucket listing is
  the route table and an absent object is the 404. Nothing in the request path grows with
  the catalogue.
- **Client islands.** Only the four `'use client'` components are hydrated (the tool, the
  CTA pair, the language globe, the consent banner), each inside an `<atlas-island>` that
  is `display: contents`. The rest of the page is static HTML. Props that are the page
  model are passed by reference, and the model is printed once.
- **Versioning.** `version` is part of every cache key and ETag, so a re-export
  invalidates atomically with no purge. Every manifest is also kept at
  `atlas/manifests/<version>.json` with its `sourceCommit`.
- **Retirement.** The uploader deletes objects the export no longer contains, after the new
  manifest is live, and refuses if that would delete more than 2% of pages unless told the
  exact number. That guard stops an empty export from turning the Atlas into 404s.
- **Sitemaps.** Served at the original `/sitemap/atlas-*.xml`. A child past 45,000 URLs
  splits into `-p2`, `-p3`... while the first part keeps the original id. The index
  `/sitemap.xml` also lists the eSIM sitemaps, so it stays on the origin, unchanged.

### Staging and production

One bundle, two Workers, separated by configuration:

| | `livdar-atlas-staging` | `livdar-atlas` |
|---|---|---|
| `ATLAS_ENV` | `staging` | `production` |
| Indexable | never | only on `livdar.com` |
| Write path (`/__ingest`) | yes, token secret | **none** |
| GTM | none | `GTM-WKGXHXWC` on `livdar.com` only |
| Routes | workers.dev | none yet; 107 prepared |

A page is indexable only when **both** halves hold. Staging cannot become indexable whatever
host reaches it, and the production Worker is noindex on its own workers.dev URL. On
`livdar.com` it serves `index, follow` and no `X-Robots-Tag`, plus HSTS `max-age=63072000`
and the three security headers from `next.config.mjs`. It refuses to answer
`/robots.txt`, which belongs to the origin. It 308s a missing trailing slash, as
`trailingSlash: true` did, and answers `If-None-Match` with 304.

## 4. Verification (all against real HTTP unless noted)

| check | result |
|---|---|
| Full SEO parity, all 6,812 URLs: Next.js production build (`next build && next start`) vs the Worker in production mode on `livdar.com`. Fields: status, title, description, canonical, full hreflang cluster, JSON-LD (deep), og/twitter, `<html lang>`, h1, every h2, every internal link, full text of `<main>`, robots, X-Robots-Tag | **6,812 / 6,812 identical** |
| Sitemaps: all 76 Atlas children, Next vs Worker, per URL: loc, lastmod, changefreq, priority, hreflang | **76 / 76**, 6,812 URLs |
| Deployed staging sweep: every page and sitemap over HTTPS vs the local render of the same build, sha256 | **6,812 / 6,812 pages, 77 / 77 sitemaps** byte-identical, all 200, 0 false 404s |
| Browser (Chromium), all 62 tool pages + 27 others: change every input and the result changes; comparison tools: doubling the amount doubles the answer | **62 / 62 tools, 16 / 16 doubling**, 0 JS errors, 0 hydration mismatches, 0 failed requests |
| Consent: shown with no cookie, choice writes `livdar_consent`, gone after reload | pass |
| Language globe opens, lists links, closes on Escape | pass |
| CTA pushes `cta_click` before navigating | pass |
| Production gate on the deployed bundle (simulated bindings, `livdar.com` host): indexable, HSTS, GTM, robots.txt refused, ingest absent; staging and workers.dev noindex | pass |
| Empty bucket on the built bundle: every Atlas path 503 | pass |
| Route list: every published URL routed; no eSIM URL, eSIM segment or app route routed | pass |
| Repository tests | see the final report |

**Measured inside the isolate** (Cloudflare analytics, 13,094 staging requests, mostly
cache-miss renders, **0 errors**): CPU p50 **5.6 ms**, p75 7.8 ms, p90 10.0 ms, p99 31.7 ms,
p99.9 62.5 ms; wall p50 271 ms, p99 675 ms. Client-observed cold p50 313 ms, warm p50 43 ms.

## 5. Cost (`reports/atlas-cloudflare-cost.json`)

Rates from developers.cloudflare.com on 2026-11-10. CPU at the measured p90 (10 ms) rather
than the median, and a 0.90 cache hit ratio rather than the measured 0.997, both
deliberately pessimistic.

| | 1 M req | 10 M | 100 M | 1 B |
|---|---|---|---|---|
| Today (6,812 pages, 79.5 MB) | $5.00 | $5.00 | $33.40 | $353.82 |

| catalogue | traffic | storage | total |
|---|---|---|---|
| 1 M pages | 10 M req | 12 GB | $5.05 |
| 10 M pages | 100 M req | 122 GB | $35.10 |
| 100 M pages | 100 M req | 1.2 TB | $51.61 |

The $5 is the Workers Paid minimum. Workers requests dominate at every volume and egress is
$0. These are estimates from measured unit costs; 100 M URLs is an arithmetic projection,
not a load test.

**Alerts** (email to the account owner): Workers requests > 10 M, R2 class B > 10 M, R2
class A > 1 M, R2 storage > 10 GB, Workers observability firing/resolved, and the existing
$10 budget alert. The API accepted every product key, but the alerts cannot be triggered on
demand, so their firing has not been observed.

## 6. 100 M readiness: what is evidence and what is not

Evidence: the request path is O(1) in the catalogue (one manifest read, one object read, one
render), measured CPU is 5.6 ms p50 per render, storage is 12 KB per page, sitemaps split at
45,000 with stable ids, publishing is incremental by hash, retirement is guarded, and every
dataset version is named and reproducible from its commit.

Not evidence: nothing here has served 100 M pages or 100 M requests. Three things change
before that scale. The ingest-through-Worker uploader lists at most 60,000 keys per call
(it refuses to retire past that rather than guess), so at millions of pages the pipeline
should write with R2's S3 API and per-prefix listings. Sitemaps past ~2.2 M URLs need more
than one Atlas index file. And Workers Free's 10 ms CPU limit would bite on the p99 renders
(31.7 ms), so production should run on Workers Paid.

## 7. Production cutover (NOT executed: safety gate)

### Why it stops here

1. **The rollback origin is not functional.** Vercel answers 402 for the whole site. The
   precondition was that the origin and the rollback path be verified first.
2. **It requires moving `livdar.com`'s nameservers** from Namecheap to Cloudflare, which is
   the explicitly gated domain-wide DNS change, and is done at Namecheap, where this
   session has no access.

The alternatives were evaluated and rejected. Cloudflare partial (CNAME) setup needs the
Business plan, a new material cost. Vercel rewrites to the Worker would keep Vercel in
the path of every Atlas request, which defeats the point, and Vercel is down anyway.

### Hazards the nameserver move creates

- **Email.** The MX records are Namecheap Email Forwarding (`eforward1..5`), which only
  works while Namecheap hosts the DNS. Recreate the forwarding with Cloudflare Email
  Routing (free) or inbound mail stops.
- **Search Console.** The `google-site-verification` TXT record must be in the new zone
  before the switch, or the DNS-verified property loses verification.
- **Unknown records.** Namecheap allows no zone transfer, so only apex, `www` and
  `_dmarc` were enumerated. Export the full record list from the Namecheap dashboard.
- **Vercel behind the proxy.** The apex must be proxied (orange) for Worker routes to
  apply. Vercel recommends DNS-only and may show a domain warning; set SSL to Full
  (strict). `www` can stay DNS-only, since the routes name `livdar.com` only.

### Runbook, once approved

1. **Decide Vercel first.** Restore it (plan/billing), or accept that only the Atlas will
   answer while the rest of `livdar.com` stays 402.
2. Export the Namecheap DNS records and the email-forwarding destinations.
3. Add the zone `livdar.com` to Cloudflare account `6399a10e…` on the **Free** plan.
   Recreate every record: apex `A 76.76.21.21` **proxied**, `www CNAME
   cname.vercel-dns.com` DNS-only, the TXT records, and Email Routing in place of the
   Namecheap MX/SPF. SSL/TLS: Full (strict).
4. Switch the nameservers at Namecheap to the two Cloudflare assigns (registrar, owner
   only). Wait until `dig NS livdar.com` returns Cloudflare everywhere. With no routes yet
   this changes nothing about what the site serves.
5. Fill `ATLAS_CLARITY_ID` on `livdar-atlas` from Vercel's `NEXT_PUBLIC_CLARITY_ID`.
6. **Canary.** Add one route, `livdar.com/nl/huurverhoging/*` → `livdar-atlas` (5 pages):
   ```bash
   ATLAS_ORIGIN=https://livdar.com ATLAS_LOCAL=<simulate --env production --serve> \
     node scripts/atlas/sweep-cloudflare.mjs --production
   ```
   Watch Workers observability and the 5 URLs for an hour.
7. **Expand.** Add the remaining routes from `cloudflare/routes.production.json` (107),
   smallest group first. Then run on `https://livdar.com`: the sweep with `--production`,
   `compare-sitemaps.mjs`, `browser-check.mjs`, and a curl of a non-Atlas page to confirm it
   still reaches the origin.
8. Do not resubmit sitemaps. The URLs did not change, and Search Console already fetches
   `/sitemap/atlas-*.xml`.

### Rollback

1. **Delete the Worker routes.** Atlas requests go back to the origin within seconds.
   No rebuild, and nothing in Vercel to restore, because nothing in Vercel was changed.
2. Set the apex record to DNS-only. Cloudflare then stops proxying entirely.
3. Revert the nameservers at Namecheap. This is slow: propagation follows the 1800 s TTL
   and resolver caches.
4. Content rollback: check out `sourceCommit` from `atlas/manifests/<version>.json`,
   export, upload. Only the changed objects move, and the version flip invalidates the
   cache.
5. Worker rollback: redeploy the previous bundle (`atlas/_build/worker.<hash>.js`).

While Vercel is disabled, steps 1–3 return Atlas URLs to a 402. Roll back only for a Worker
fault, not as a precaution.

## 8. Remaining blockers

1. **Vercel 402**: owner action (plan/billing). Affects the whole site today.
2. **Nameserver move to Cloudflare**: owner approval, plus Namecheap access.
3. **Clarity ID**: in Vercel as a sensitive variable; set `ATLAS_CLARITY_ID` before cutover.
4. **Workers plan**: could not be read (the subscriptions API returned 403). p99 CPU is
   31.7 ms, over the Free plan's 10 ms limit; confirm Workers Paid ($5/month) before
   production traffic. Staging showed 0 errors across 13,094 requests.
5. **GSC indexed-URL comparison**: needs Search Console credentials. The Ahrefs GSC tools
   return "Insufficient plan".

## 9. Commands

```bash
node scripts/atlas/shard-manifests.mjs && node scripts/atlas/export-cloudflare.mjs
node cloudflare/build.mjs
node --test tests/atlas-cloudflare.test.mjs tests/atlas-cloudflare-routes.test.mjs
node cloudflare/routes.mjs
```

```bash
ATLAS_INGEST_URL=https://livdar-atlas-staging.reee4603.workers.dev ATLAS_INGEST_TOKEN=... \
  node cloudflare/upload-r2.mjs
```

```bash
node cloudflare/simulate.mjs .atlas-cloudflare-export --env production --host livdar.com --serve 8788
ATLAS_ORIGIN_A=http://127.0.0.1:3000 ATLAS_ORIGIN_B=http://127.0.0.1:8788 \
  node scripts/atlas/compare-cloudflare.mjs --all --expect-indexable
ATLAS_ORIGIN_A=http://127.0.0.1:3000 ATLAS_ORIGIN_B=http://127.0.0.1:8788 \
  node scripts/atlas/compare-sitemaps.mjs
ATLAS_ORIGIN=https://livdar-atlas-staging.reee4603.workers.dev node scripts/atlas/browser-check.mjs
```

```bash
npx wrangler deploy --config cloudflare/wrangler.toml --env staging
```

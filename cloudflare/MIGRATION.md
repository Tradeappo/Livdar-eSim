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
| Production routing | **Staged.** Zone, DNS, email routing and 109 routes configured on a pending zone; live when the nameservers switch (section 7). |
| Vercel independence for Atlas traffic | Ready, not live: no Atlas request reaches Cloudflare until the routes exist. |
| Cost monitoring | 5 alert policies created, plus the existing $10 budget alert. |
| Rollback readiness | Five rollback steps (section 7). While Vercel is down, a verified fallback serves the non-Atlas site. |

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

## 7. Production cutover: staged, waiting on the nameserver switch

Everything Cloudflare needs is configured and verified. Cloudflare will not answer for
`livdar.com` until the domain's nameservers point at it, so none of it affects production
until then. The nameserver switch **is** the cutover.

### What is in place

**Zone** `livdar.com`, id `092a1b27870de49853020ace4c0b0c4b`, Free plan, status `pending`.
Assigned nameservers: `brian.ns.cloudflare.com`, `suzanne.ns.cloudflare.com`.
Settings: SSL Full (strict), Always Use HTTPS on. Email Obfuscation and Automatic HTTPS
Rewrites are **off**, because both rewrite HTML in flight and would break the byte-identity
verified in section 4.

**DNS**, rebuilt from the audit of the Namecheap zone
(`reports/production-baseline-2026-11-10.json`). Certificate Transparency shows no
hostname other than `livdar.com` and `www.livdar.com` has ever had a certificate, and a
random name answers NXDOMAIN, so there is no wildcard:

| record | value | why |
|---|---|---|
| `A livdar.com` | `76.76.21.21`, proxied | Vercel apex, as on Namecheap. Proxied so Worker routes apply |
| `CNAME www` | `cname.vercel-dns.com`, proxied | Vercel. Proxied so the fallback can serve www→apex 308 while Vercel is down |
| `MX livdar.com` | `route1/2/3.mx.cloudflare.net` (90/66/46) | Cloudflare Email Routing, replacing Namecheap Email Forwarding, which stops working off Namecheap DNS |
| `TXT livdar.com` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | SPF for Email Routing, replacing the Namecheap one |
| `TXT cf2024-1._domainkey` | DKIM | Email Routing |
| `TXT livdar.com` | `google-site-verification=whLw9…` | Search Console DNS verification, copied unchanged |

**Email**: a catch-all forwarding rule to the account owner's verified address is created
and enabled, so no message is lost. Namecheap's per-address forwarding rules cannot be read
from outside; add specific rules if they forwarded anywhere else. Cloudflare only allows
Email Routing itself to be switched on for an active zone, so that is the first
post-activation step.

**Routes**: the 109-route table (`cloudflare/routes.production.json`), applied to the
zone. Its sha256 matches the tested table, all routes fail open, and there are no
duplicates.
- 107 Atlas patterns → `livdar-atlas`
- `livdar.com/*` and `www.livdar.com/*` → `livdar-origin-fallback`

Cloudflare runs the most specific matching route, so Atlas URLs reach the Atlas Worker and
everything else reaches the fallback (`tests/atlas-cloudflare-routes.test.mjs`).

**Origin fallback** `livdar-origin-fallback` passes every request to Vercel unchanged and
answers from a snapshot only when Vercel fails (402, 5xx, a platform error, a timeout).
It then skips the origin for 30 s. So it heals itself: when Vercel serves again, so does
livdar.com, with nothing to switch back. The snapshot is the existing production build;
`git diff` against the production commit `8d6f1e2` is empty for every path that shapes
the output.

Verified while Vercel answers 402:
- **377 / 377** URLs identical to `next start` of the same build: 115 eSIM pages and
  their RSC payloads, 117 static assets, 18 route handlers, the redirects, the 404, the
  API 503s.
- **115 / 115** eSIM pages hydrate in Chromium with 0 JS errors, and client navigation
  works.

One request fails, identically on Vercel: `/en/` references
`/mnt/data/livdar_travel_tools_banner.jpg` (`source/livdar-esim-v41.source:6099`), a file
that exists nowhere in the repository.

**Certificates.** Vercel's certificate for `livdar.com` expires on 2026-12-07, and renewal
appears stalled while the deployment is disabled. If it lapses, the origin fetch fails,
the fallback treats that as an outage, and the snapshot keeps serving. Cloudflare issues
its own edge certificate when the zone activates.

### Before the switch: owner actions

1. **Workers Paid** ($5/month) on account `6399a10e…`. The API confirmed the account is
   on Workers Free. The Free plan's 10 ms CPU limit sits at the measured p90 (p99 is
   31.7 ms), and its 100,000 requests/day cap would fail open to the origin, which is a
   402.
2. Optional: restore Vercel (plan/billing). The fallback makes the switch safe without it.
3. Optional: tell me any Namecheap forwarding address that went somewhere other than the
   account owner.

### The switch: owner action

At Namecheap: Domain List → livdar.com → Nameservers → Custom DNS, set
`brian.ns.cloudflare.com` and `suzanne.ns.cloudflare.com`. Nothing at Namecheap is deleted.
Its records stay as they are, and they are the rollback.

### After the switch

1. Wait for the zone to show `active`. Then enable Email Routing:
   `POST /zones/092a1b27870de49853020ace4c0b0c4b/email/routing/enable`.
2. Run the checks, all on `https://livdar.com`:
   ```bash
   ATLAS_ORIGIN=https://livdar.com ATLAS_LOCAL=<simulate --env production --serve> \
     node scripts/atlas/sweep-cloudflare.mjs --production
   ATLAS_ORIGIN_A=<next start> ATLAS_ORIGIN_B=https://livdar.com node scripts/atlas/compare-sitemaps.mjs
   ATLAS_ORIGIN=https://livdar.com node scripts/atlas/browser-check.mjs
   ATLAS_ORIGIN_A=<next start> ATLAS_ORIGIN_B=https://livdar.com node scripts/atlas/verify-fallback.mjs
   ```
   `verify-fallback.mjs` asserts that the snapshot served. Once Vercel is restored, the
   origin will be the one answering instead.
3. Watch Workers observability for 5xx, and check one eSIM page and one Atlas page.

### Rollback, in increasing scope (all reversible, nothing deleted)

| step | effect | time |
|---|---|---|
| Do nothing | The fallback hands traffic back to Vercel by itself once Vercel serves | automatic |
| Remove the two catch-all routes | Non-Atlas traffic goes straight to Vercel | seconds |
| Remove all 109 routes | Cloudflare proxies everything to Vercel, no Worker in the path | seconds |
| Set `A` and `CNAME` to DNS-only | Cloudflare stops proxying; visitors reach Vercel's IPs | ~5 min (TTL) |
| Set the nameservers back to `dns1/dns2.registrar-servers.com` | Namecheap's untouched records answer again. Re-check Namecheap Email Forwarding | hours (propagation) |

## 8. Remaining blockers

1. **Workers Paid**: owner action (section 7).
2. **Nameserver switch**: owner action (section 7).
3. **Vercel 402**: owner action. Not blocking any more, because the fallback covers it.
4. **Clarity ID**: in Vercel as a sensitive variable. Set `ATLAS_CLARITY_ID` if wanted.

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

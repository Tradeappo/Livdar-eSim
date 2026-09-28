# The Atlas was a 404, and this is how it was found

## What was wrong

On 2026-09-28, **497 of the 740 URLs in Livdar's sitemaps returned 404 from
production**. Every single `atlas-pages-*` sitemap was completely dead:
all 57 of them, in all nine languages, across every surface. The eSIM era
pages and the 121 city-month weather pages were untouched and returned 200.

`sitemap-url-status-2026-09-28.tsv` is the full check: sitemap name, HTTP
code, URL, for all 740.

    497  404
    238  200
      5  000   (proxy TLS transients, all 200 on retry)

## How the trail went

Nothing in the repository was wrong, which is why this had gone unnoticed
for three days.

1. **Ahrefs Site Audit, crawl of the 27th, health score 43** against 97 to
   100 for every other site in the account. 473 URLs reported as 404, and
   the same 473 reported as 4XX in a sitemap.
2. **Checking all 740 sitemap URLs directly** put it at 497, higher than
   Ahrefs' 473 because more pages had fallen over in the day between.
3. **The route files exist**, and running `allStaticParamsFor('stadtteile')`
   and `servePage('de','stadtteile',['berlin'])` locally both worked.
4. **The Vercel build log for the live deployment listed the pages as
   prerendered**: `/es/zonas/madrid`, `/it/zone/napoli`,
   `/pl/wynagrodzenia/polska`, all marked SSG with revalidate 1d.
5. **The response headers said `x-nextjs-prerender: 1` on the 404**, so the
   404 was not a routing miss. It had been rendered and cached as a page.
6. **Reading the trace Next.js wrote** for the route,
   `.next/server/app/[lang]/stadtteile/[[...path]]/page.js.nft.json`, found
   137 data files and **zero cohort manifests**.

## The cause

`pages()` in `lib/atlas/serve-pages.js` opens the cohort manifests at
request time, by a path it builds at runtime:

    export const MANIFESTS = ['001', '002'].map((c) => 'data/atlas/cohorts/cohort-' + c + '-pages.json');

Next.js file tracing cannot see a path built like that, so the only thing
that copies those files next to the serverless function is
`outputFileTracingIncludes` in next.config.mjs. The entity store was on that
list. The cohort manifests were not.

Which produced a failure that looked fine from every angle anybody checked:

- `next build` reads the manifests from the checkout, so **all 500 pages
  prerendered correctly** and the deployment served them. The structural
  verification on the 25th passed 500 of 500 because on the 25th every page
  really was correct. Ahrefs crawled them and got 200 at 21:25 that evening.
- `revalidate = 86400` came round a day later. The function went looking for
  a manifest that had never been copied, `existsSync` returned false,
  `pages()` returned an empty array, the path lookup missed, and the route
  called `notFound()`.
- **A 404 is a successful response, so it cached.** One page at a time, as
  each came up for revalidation, the Atlas took itself off the web.

## The fix

PR #29, merged as 16cb27d.

- `next.config.mjs` lists `./data/atlas/cohorts/*-pages.json`. A glob, so
  cohort 003 is covered when it arrives.
- `pages()` now **throws** when a manifest is absent instead of reading it as
  a cohort with no pages in it. This is the part that matters more than the
  configuration line: a missing manifest is a deployment fault and can no
  longer be mistaken for an empty Atlas. Revalidation fails, Next keeps
  serving the last good page, and the error lands where a person can see it
  rather than in the status code of a page nobody is looking at.
- `tests/atlas-function-bundle.test.mjs` asserts both directions: every path
  read at request time is matched by an include pattern, and where a build is
  present, the trace Next.js actually wrote for every Atlas route carries
  every manifest. That second assertion reads the exact file that was wrong.
  `MANIFESTS` is imported rather than restated, so adding a cohort brings the
  test with it.

## Verified

| Check | Result |
| --- | --- |
| Rebuilt trace carries both manifests | yes, for every Atlas route |
| 740 sitemap URLs on the preview deployment | 740 of 740 → 200 |
| 740 sitemap URLs on production after the merge | **740 of 740 → 200** |
| `scripts/atlas/verify-live.mjs` against production | **500 of 500 clean, 0 problems** |
| npm test | 367 pass, 0 fail |
| npm run dashcheck | 1571 files, 0 dash variants |

`sitemap-url-status-2026-09-28.tsv` is the before. The after is in
`production-verification-after-fix-2026-09-28.json`.

## What it cost

Three days, 25 September to 28 September, during which Google was served a
404 for every Atlas URL it tried, including the ones it had already
discovered from the sitemap. Any indexing progress made between the launch
and the 26th was thrown away, and the 497 URLs will need to be rediscovered.

This is also the honest answer to "are there early signals after the 500
page launch". There was nothing to signal. The measurement window has not
started yet. It starts now, from 2026-09-28 12:32 UTC.

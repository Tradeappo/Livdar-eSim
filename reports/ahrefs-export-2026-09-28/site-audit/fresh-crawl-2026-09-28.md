# Site Audit, the crawl of 2026-09-28, and why 60 is not the answer either

A fresh crawl completed at **2026-09-28T12:56:03Z**, 880 URLs.

| | 27 Sep crawl | 28 Sep crawl |
| --- | --- | --- |
| Health score | 43 | **60** |
| URLs with errors | 500 | 355 |
| URLs with warnings | 307 | 609 |
| URLs with notices | 493 | 334 |

**Neither number is the current state.** The 404 fix reached production at
12:32 UTC and this crawl started 24 minutes later, so it caught the site
mid-recovery.

Proven rather than assumed. The crawl reports 157 URLs as `404 page`. Thirty of
them were read out of Page Explorer and fetched from production: **30 of 30
return HTTP 200**. So the remaining 404s, and the 189 `Hreflang to redirect or
broken page` errors that depend on them, are the crawler's memory of a state
that no longer exists.

The next scheduled crawl is the first clean one.

## Errors, separated

| Count | Change | Issue | Verdict |
| --- | --- | --- | --- |
| 189 | +174 | Hreflang to redirect or broken page | **artefact**, downstream of the 404s |
| 157 | -316 | 4XX page in sitemap | **artefact**, 30 of 30 verified 200 live |
| 157 | -316 | 4XX page | **artefact**, same URLs |
| 157 | -316 | 404 page | **artefact**, same URLs |
| 15 | -12 | Page has links to broken page | **artefact**, same cause |

Every other error type is at zero, including the ones that would matter most:
hreflang annotation invalid 0, missing reciprocal hreflang 0, hreflang and HTML
lang mismatch 0, HTML lang attribute invalid 0, canonical points to 4XX 0,
noindex page in sitemap 0, non-canonical page in sitemap 0, sitemap syntax error
0, robots.txt not accessible 0, redirect loop 0, 5XX 0, 500 0.

## Warnings: one is real

| Count | Change | Issue | Verdict |
| --- | --- | --- | --- |
| 583 | +316 | Open Graph tags incomplete | **REAL** |
| 171 | +153 | Page has links to redirect | artefact |
| 101 | +79 | Meta description too long | informational |
| 26 | -14 | 3XX redirect | informational, trailing slash by design |
| 9 | +9 | Title too long | informational |
| 5 | -1 | Meta description too short | informational |

**Open Graph is genuinely incomplete, and it is the one real finding in this
crawl.** Read from a live page, `/de/feiertage/nordrhein-westfalen/` carries six
Open Graph tags, `og:title`, `og:description`, `og:url`, `og:site_name`,
`og:locale` and `og:type`, and **no `og:image`**. Checked on three pages across
two surfaces: none has one.

It affects how every Atlas page appears when shared, and it is the sort of thing
some AI crawlers read. It is a template change on 500 pages rather than a bug in
any one of them, and the brief says to measure opportunities rather than change
templates for them, so it is recorded and not fixed.

The 101 long meta descriptions and 9 long titles are Ahrefs preferring shorter
text, not an error. Nothing was changed for them.

## Notices

| Count | Change | Issue | Verdict |
| --- | --- | --- | --- |
| 324 | -149 | Changed pages not submitted to IndexNow | **stale**: 615 URLs were accepted at 19:12 UTC, after this crawl |
| 107 | +97 | X-default hreflang annotation missing | **correct behaviour**, see below |
| 4 | -469 | Indexable page became non-indexable | artefact of the recovery |
| 4 | 0 | Redirect chain | informational |
| 2 | 0 | HTTP to HTTPS redirect | informational |

The x-default notice is not a defect. A page that exists in one language only,
such as a German Bundesland holiday page, has no default to nominate, and
inventing one would be worse than omitting it. Verified: the NRW page declares
`hrefLang="de"` and nothing else, and its cluster has exactly one member.
Multi-language pages do carry x-default, verified live on
`/en/cost-of-living/germany/` and `/en/tools/salary-calculator/`.

## What this crawl did lead to

Reading it is what surfaced the hreflang bug that Ahrefs could not see: 120 of
the 500 pages were serving an incomplete set of alternates, because
`scripts/atlas/cohort-pages.mjs` computes them over one cohort's rows and the
two cohorts were built in separate runs. Ahrefs reported `missing reciprocal
hreflang: 0` throughout, because the sets it saw were internally consistent;
they were just short. Fixed, and covered by four new tests.

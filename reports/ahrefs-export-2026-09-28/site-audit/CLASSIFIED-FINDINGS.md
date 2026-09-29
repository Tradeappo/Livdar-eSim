# Site Audit, every finding classified

Date: 2026-09-28. Crawl: **2026-09-28T12:56:03Z**, 880 URLs, project `10422446`.
**179 issue types checked, 16 non-zero.** Raw data in
`livdar-site-audit-issues-2026-09-28-crawl.json`.

> ## SUPERSEDED on 2026-09-29 by the clean crawl
>
> The clean crawl ran at **2026-09-29T12:52:33Z**: 916 URLs, status Completed,
> **health score 100, zero errors**, 11 of 179 checks non-zero. Every prediction in
> this file held. Read **[CLEAN-BASELINE-2026-09-29.md](CLEAN-BASELINE-2026-09-29.md)**
> for the current state; raw data in `all-179-checks-2026-09-29.json`.
>
> This file is kept as it was written because it is the record of what was predicted
> before the crawl confirmed it. Two of its conclusions were wrong and are corrected
> in the clean baseline:
>
> - **"Page has links to redirect" is not transitional and does not come from the
>   eSIM section.** All 328 flagged URLs are Atlas pages, and they are exactly the
>   328 Atlas pages in the seven locales with no live eSIM market (es 64, fr 63,
>   it 52, pl 42, ja 40, pt 40, nl 27). Their chrome links into their own locale's
>   eSIM section, which 307s to `/en/` by design. The trailing-slash checks in this
>   file were sound; they were simply testing the wrong hypothesis.
> - **"Meta description too short" rose to 45, and 40 of those are not short.** They
>   are Japanese pages of 49 to 88 characters measured against a Latin-calibrated
>   threshold. Only 5 are real, all of them eSIM hub pages.

## Read this before the Health Score

The score reads **60**. That is not the current state of the site, and neither was the 43 from
the day before.

| | 27 Sep crawl | 28 Sep crawl |
| --- | --- | --- |
| Health score | 43 | 60 |
| URLs with errors | 500 | 355 |
| URLs with warnings | 307 | 609 |
| URLs with notices | 493 | 334 |

The crawl started **24 minutes after** the fix for the 404 outage reached production
(12:32 UTC), so it caught the site mid-recovery. Since then **two more fixes have landed that
this crawl cannot know about**:

| Fix | Reached production | What the crawl still reports |
| --- | --- | --- |
| Cohort manifests traced into the bundle (497 pages stopped 404ing) | 2026-09-28 **12:32** UTC | 471 errors across four types |
| hreflang computed across cohorts | 2026-09-28 **19:11** UTC | part of the 189 hreflang errors |
| `og:image` on every page | 2026-09-28 **21:04** UTC | 583 Open Graph warnings |

**This crawl is three fixes stale.** Its headline number should not be quoted as today's state
in either direction.

### A fresh crawl cannot be triggered from here

The Ahrefs API exposes Site Audit as read-only: `site-audit-projects`, `site-audit-issues`,
`site-audit-page-explorer` and `site-audit-page-content`. There is no endpoint that starts a
crawl. Verified against the tool surface, not assumed.

**To trigger one by hand:** Ahrefs > Site Audit > the **Livdar** project > the **Rerun crawl**
button at the top right of the project overview. It takes roughly 20 to 40 minutes at this
site's size.

Crawls have been landing daily around 12:56 UTC, so **the scheduled crawl of 2026-09-29 will be
the first clean one** and it falls well inside the 7 October deadline. A manual rerun now would
only bring that forward by a few hours.

---

## REAL BUG: three content issues, all in one template

The only genuine defects this crawl found. All three are metadata length, all fixable in one
place.

| Count | Change | Issue | Verified independently |
| --- | --- | --- | --- |
| **101** | +79 | Meta description too long | **Yes.** Measured 399 built pages directly: **96 exceed 160 characters**, median 156, longest **201**. |
| **9** | +9 | Title too long | Yes, present in the built output |
| **5** | -1 | Meta description too short | Yes. 2 of 399 measured fall under 70 characters |

A description over 160 characters is truncated in the results page, so the last clause is
thrown away. That is a real cost to click-through rate rather than a cosmetic warning.

**Not fixed here, deliberately.** The brief is explicit that production is not to be modified
for Ahrefs warnings alone, and this sits close enough to that line that it is the user's call
rather than mine. It is a bounded change: the description is composed in one template, the
overshoot is 1 to 41 characters, and 303 of 399 pages are already within budget. Recommended,
not done.

## STALE-TRANSITIONAL: 471 errors that describe a site that no longer exists

Every one of these is the crawler's memory of the 404 period.

| Count | Change | Issue | Evidence it is stale |
| --- | --- | --- | --- |
| 157 | **-316** | 404 page | 30 of these URLs were read out of Page Explorer and fetched from production: **30 of 30 return HTTP 200** |
| 157 | -316 | 4XX page | Same URLs |
| 157 | -316 | 4XX page in sitemap | Same URLs |
| 189 | +174 | Hreflang to redirect or broken page | Downstream: hreflang sets pointed at URLs that were 404 at crawl time |
| 15 | -12 | Page has links to broken page | Same cause |
| 4 | **-469** | Indexable page became non-indexable | The -469 **is** the recovery |

The large negative changes are the fix landing while the crawl was running. Independent
confirmation beyond the 30 URL sample: `verify-live` passes **500 of 500** against
`alternatesFor(model)`, and 32 of 32 Atlas pages sampled across 9 languages and 4 surfaces
return 200 with correct canonical and metadata.

## FIXED SINCE THIS CRAWL: 907 findings already resolved

| Count | Issue | Status |
| --- | --- | --- |
| **583** | Open Graph tags incomplete | **Fixed.** `og:image` shipped 21:04 UTC. Verified live on 32 of 32 Atlas pages across 9 languages and 4 surfaces, plus the PNG serving 200 at 70,874 bytes. The crawl predates it by 8 hours. |
| **324** | Changed pages not submitted to IndexNow | **Fixed.** 615 URLs accepted with HTTP 200. The crawl predates the submission. |

Ahrefs was right about both. It simply crawled before either was done.

## INFORMATIONAL: correct by design, not defects

| Count | Change | Issue | Why it is correct |
| --- | --- | --- | --- |
| **107** | +97 | X-default hreflang annotation missing | **By design.** x-default is emitted only where a cluster contains an English page. Checking all 500 directly: 386 carry x-default, **114 do not**, and every one of those sits in a cluster with no English sibling. Example: `cost-of-living.country::BG` exists in de, es, fr, it, pl and pt. Pointing x-default at a non-English page would be worse than omitting it. Ahrefs rates this a Notice, its lowest severity, which agrees. |
| 26 | -14 | 3XX redirect | Trailing-slash canonicalisation. `/de/feiertage/bayern` returns **308** to `/de/feiertage/bayern/`, which is the intended behaviour |
| 2 | 0 | HTTP to HTTPS redirect | Correct and required |

The x-default count does surface something worth carrying forward, though it is a content gap
rather than a technical one: **114 pages sit in clusters with no English version**, and English
is the highest-reach language on the site. That belongs in the candidate inventory, not the bug
list.

## WARNING, RESOLVED 2026-09-29: the item that was awaiting the clean crawl

The clean crawl answered this, and the answer was the opposite of the hypothesis
below. See CLEAN-BASELINE-2026-09-29.md. The original text is kept unchanged.

## WARNING, unresolved as written on 2026-09-28: one item awaiting the clean crawl

| Count | Change | Issue | What is known |
| --- | --- | --- | --- |
| 171 | +153 | Page has links to redirect | **Probably transitional, not confirmed.** Two checks say the Atlas does not generate such links: **0 of 500** page canonicals lack a trailing slash, and on a live Atlas page **0** internal hrefs lack one (every one of the 20 distinct internal links sampled ends in `/`). The +153 change tracks the 404 recovery. Remaining candidates are the eSIM section or crawl-time state. **Left open rather than declared fixed**, and the 2026-09-29 crawl resolves it. |
| 4 | 0 | Redirect chain | Four URLs, unchanged across both crawls, so not related to the outage. Small enough to inspect by hand once the crawl is clean. |

---

## Everything the brief asked about that came back clean

**163 of the 179 checked issue types are at zero.** The ones worth naming because they would
matter most:

| Category | Checks at zero |
| --- | --- |
| **hreflang** | hreflang annotation invalid **0**, missing reciprocal hreflang **0**, hreflang and HTML lang mismatch **0**, HTML lang attribute invalid **0** |
| **Canonicals** | canonical points to 4XX **0**, canonical points to redirect **0**, canonical from HTTPS to HTTP **0** |
| **Sitemaps** | sitemap syntax error **0**, noindex page in sitemap **0**, non-canonical page in sitemap **0** |
| **Server** | 5XX **0**, 500 **0**, redirect loop **0** |
| **robots** | robots.txt not accessible **0** |
| **Duplicates and tag integrity** | `Duplicate pages without canonical` **0**, `Multiple title tags` **0**, `Multiple meta description tags` **0**, `Multiple H1 tags` **0** |
| **Missing metadata** | `Title tag missing or empty` **0**, `Meta description tag missing or empty` **0**, `H1 tag missing or empty` **0** |
| **Structured data** | `Structured data has Google rich results validation error` **0**, `Structured data has schema.org validation error` **0** |
| **Orphans and link health** | `Orphan page (has no incoming internal links)` **0** at both severities, `Canonical URL has no incoming internal links` **0**, `Page has no outgoing links` **0**, `Page has only one dofollow incoming internal link` **0**, `Page has nofollow incoming internal links only` **0** |
| **Page weight and rendering** | `Page size exceeds 2 MB crawl limit` **0**, `Slow page` **0**, `Main content requires JavaScript rendering` **0**, `JavaScript broken` **0**, `Page has broken JavaScript` **0** |
| **Images** | `Image broken` **0**, `Image file size too large` **0**, `Missing alt text` **0**, `Page has broken image` **0** |
| **Indexability** | `Noindex page` **0**, `Noindex page in sitemap` **0**, `Noindex page receives organic traffic` **0**, `Robots.txt rules disallow to crawl` **0**, `Indexable page not in sitemap` **0** |
| **Mixed content** | `HTTPS/HTTP mixed content` **0**, `HTTPS page has internal links to HTTP` **0**, `HTTPS page links to HTTP CSS / image / JavaScript` **0** |
| **AI content** | `Similar AI-generated content` **0**, `Pages have high AI content levels` **0** |

Four of those are the expensive kind to get wrong at 500 pages across 9 languages, and all four
are clean:

- **`Orphan page` is 0 at both severities**, and so is `Page has only one dofollow incoming
  internal link`. Every page is reachable and none is reachable by a single thread.
- **`Main content requires JavaScript rendering` is 0.** The pages are statically rendered and
  their content is in the HTML, which is what `dynamicParams = false` and
  `generateStaticParams` were for.
- **`Indexable page not in sitemap` is 0.** Every indexable page is in a sitemap, which is the
  inverse of the 4XX-in-sitemap error and a stronger statement.
- **`Similar AI-generated content` and `Pages have high AI content levels` are both 0.** Worth
  noting for a 500 page programmatic build across 9 languages, given the standing constraint
  against identical translations.

Note on what Ahrefs does **not** check here: there is no cross-page "duplicate title" or
"duplicate meta description" test in the 179. `Multiple title tags` counts two title elements on
one page, which is a different thing. Cross-page duplication across the Atlas was measured
separately by this project's own language and entity audits, not by this crawl, so the zeros
above should not be read as covering it.

One caveat on the hreflang zeros, because it has bitten this project before: "missing reciprocal
hreflang 0" was **also** reported when 120 pages had genuinely incomplete hreflang sets. Ahrefs
could not see it, because the sets were internally consistent, just short. That bug was found by
comparing served hreflang against `alternatesFor(model)` and is fixed. A zero here means "no
contradiction", not "complete". The instrument that catches incompleteness is
`scripts/atlas/verify-live.mjs`, and it passes 500 of 500.

## Summary

| Class | Findings | Count |
| --- | --- | --- |
| **REAL BUG** | meta description too long, title too long, meta description too short | **115** |
| **STALE-TRANSITIONAL** | 404, 4XX, 4XX in sitemap, hreflang to broken page, links to broken page, became non-indexable | **679** |
| **FIXED SINCE CRAWL** | Open Graph incomplete, IndexNow not submitted | **907** |
| **INFORMATIONAL** | x-default absent where no English sibling, 3XX, HTTP to HTTPS | **135** |
| **WARNING, open** | links to redirect, redirect chain | **175** |

**One real defect class, in one template, worth 115 findings.** Everything else is either
already fixed, an artefact of an outage that ended, or correct behaviour.

## What to do

1. Let the **2026-09-29 12:56 UTC** scheduled crawl run, or press **Rerun crawl** in the Ahrefs
   UI to bring it forward. Expect the Health Score to move sharply: 907 warnings and 679
   transitional errors should clear, leaving roughly 115 real findings plus the 135
   informational ones.
2. Decide on the meta description length fix. It is one template and the user's call.
3. Re-check `Page has links to redirect` against the clean crawl before spending time on it.

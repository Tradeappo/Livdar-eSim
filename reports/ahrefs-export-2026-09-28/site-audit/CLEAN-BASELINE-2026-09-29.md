# Clean Site Audit baseline, 2026-09-29

Crawl `2026-09-29T12:52:33Z`, status Completed, 916 URLs.
Compared against `2026-09-28T12:56:03Z`, the crawl taken while 497 Atlas pages
were still returning 404.

## Headline

| | 2026-09-28 | 2026-09-29 | Change |
| --- | --- | --- | --- |
| Health score | not 100 | **100** | clean |
| URLs with errors | 675 | **0** | **all cleared** |
| URLs with warnings | 895 | 576 | 319 cleared |
| URLs with notices | 441 | 278 | 163 cleared |
| Checks with a non-zero count | 16 of 179 | **11 of 179** | 5 cleared |

**Every error is gone.** The 404 family and everything downstream of it cleared
exactly as predicted, and so did the Open Graph warning:

| Check | Importance | Was | Now |
| --- | --- | --- | --- |
| Open Graph tags incomplete | Warning | 583 | **0** |
| Hreflang to redirect or broken page | Error | 189 | **0** |
| 404 page | Error | 157 | **0** |
| 4XX page | Error | 157 | **0** |
| 4XX page in sitemap | Error | 157 | **0** |
| Page has links to broken page | Error | 15 | **0** |
| Indexable page became non-indexable | Notice | 4 | **0** |
| Changed pages not submitted to IndexNow | Notice | 324 | 158 |

That closes the two fixes shipped this week: the og:image work (583 warnings) and
the routing fix for the 497 Atlas pages (all 675 errors).

## What remains, all 11 checks

| Check | Importance | Count | Change | Verdict |
| --- | --- | --- | --- | --- |
| Page has links to redirect | Warning | 328 | +157 | **Real, diagnosed below, fix proposed** |
| Changed pages not submitted to IndexNow | Notice | 158 | -166 | Expected: IndexNow submits on change, so a fresh deploy always leaves a queue |
| Meta description too long | Warning | 134 | +33 | Real, 101 of them already recorded as item 12 for the user |
| X-default hreflang annotation missing | Notice | 114 | +7 | **Correct by design.** No x-default where the cluster has no English sibling |
| 3XX redirect | Warning | 54 | +28 | 49 by design, 5 infrastructure. See below |
| Meta description too short | Warning | 45 | +40 | **40 of 45 are a CJK measurement artefact.** 5 are real |
| Title too long | Warning | 9 | 0 | Real, unchanged, low value |
| Slow page | Warning | 4 | +4 | New. Worth watching, not acting on from one crawl |
| Redirect chain | Notice | 4 | 0 | Infrastructure: www and http variants reaching /en/ in two hops |
| Slow server response for AI crawlers | Warning | 2 | +2 | New. Two URLs |
| HTTP to HTTPS redirect | Notice | 2 | 0 | Correct and required |

The counts that went up did so because the pages could not be measured before.
A 404 page has no meta description to be too short and no links to be redirects.
Comparing content checks across the 404 boundary overstates every increase.

## The open warning, resolved: "Page has links to redirect" (328)

The hypothesis carried into this check was that the Atlas does not generate these
and the source is probably the eSIM section. **That was wrong, and the opposite is
true.** All 328 flagged URLs are Atlas pages, and the count is exact:

| Locale | Atlas pages | eSIM market live | Flagged |
| --- | --- | --- | --- |
| en | 100 | yes | 0 |
| de | 72 | yes | 0 |
| es | 64 | no | 64 |
| fr | 63 | no | 63 |
| it | 52 | no | 52 |
| pl | 42 | no | 42 |
| ja | 40 | no | 40 |
| pt | 40 | no | 40 |
| nl | 27 | no | 27 |
| | **500** | | **328** |

64 + 63 + 52 + 42 + 40 + 40 + 27 = **328**, matching the crawl exactly. Not one
English, German or Romanian page is affected.

### Why

`lib/i18n.js` marks only `en`, `de` and `ro` as live eSIM markets.
`lib/routing.js` then says, correctly and deliberately:

> A locale that exists in the infrastructure but has no published market yet must
> never render a 404. It lands on the nearest live market instead.

So `/es/esim/`, `/fr/guides/`, `/pl/kompatybilnosc/` and their siblings answer
**307 to `https://livdar.com/en/`**. That rule is right: it is what stops those
paths 404ing.

The defect is not the rule. It is that **the Atlas page chrome in those seven
locales links to them anyway**. Every Atlas page in a non-live locale carries
between five and seven header and footer links into its own locale's eSIM
section, each of which immediately bounces to the English home page. A sample of
`/es/dias-festivos/espana/` shows `/es/`, `/es/esim/`, `/es/guias/`,
`/es/guias/esim-vs-roaming/`, `/es/guias/how-esim-works/`,
`/es/compatibilidad/` and `/es/regiones/`, all seven of them 307s.

Roughly 328 pages times 6 links is about **2,000 internal links that redirect**,
and every one of them drops the visitor's language. A Spanish reader clicking the
site logo on a Spanish Atlas page lands on the English eSIM home page.

### The fix, proposed and deliberately not shipped

On an Atlas page whose locale has no live eSIM market, the chrome should link to
destinations that exist in that locale, or to `/en/...` directly if the English
eSIM page is the intended destination. Either removes the hop; the second also
stops pretending the Spanish page exists.

**Not shipped in this pass**, for two reasons stated plainly:

1. The standing instruction is not to rebalance internal linking until the first
   clean GSC baseline arrives. This is a defect fix rather than a rebalance, but it
   still changes the internal link graph of 328 live pages, and the first clean GSC
   window is days away. Changing the graph now destroys the baseline it would be
   measured against.
2. The blast radius is the shared Atlas chrome, so it touches every Atlas page in
   seven languages at once. That deserves a deliberate decision rather than a
   drive-by commit inside a research pass.

Severity is genuinely low: a 307 costs a hop, not an error, which is why the health
score is 100 with this outstanding. It should be fixed in the first change after
the GSC baseline lands, not before.

## "Meta description too short" (45): 40 of them are not short

40 of the 45 are Japanese pages measuring 49 to 88 characters. Ahrefs counts
characters against a threshold calibrated for Latin script, and a Japanese
character carries several times the information of a Latin one, so
`スウェーデンの生活費を、推計ではなく測定値で。2024年の物価水準は 123。品目別の内訳と、数値ごとの出典つき。`
at 57 characters is a complete, well formed description. Flagging it is the tool
being wrong about Japanese, not the page being thin.

**The 5 that are genuinely short** are all eSIM section hub pages, not Atlas pages:

| URL | Length |
| --- | --- |
| `/en/regions/` | 61 |
| `/en/guides/` | 99 |
| `/de/regionen/` | 66 |
| `/ro/regiuni/` | 75 |
| `/ro/regiuni/central-america/` | 94 |

Five hand written descriptions, worth doing whenever the eSIM section is next
touched.

## "3XX redirect" (54): 49 by design, 5 infrastructure

49 are the non-live-locale eSIM paths described above, all 307 to `/en/`, all
intentional. The other 5 are the standard canonical set and are correct:

| URL | Code | To |
| --- | --- | --- |
| `http://livdar.com/` | 308 | `https://livdar.com/` |
| `http://www.livdar.com/` | 308 | `https://www.livdar.com/` |
| `https://www.livdar.com/` | 308 | `https://livdar.com/` |
| `https://livdar.com/` | 307 | `https://livdar.com/en` (content negotiated, correctly not 301) |
| `https://livdar.com/en` | 308 | `https://livdar.com/en/` |

The 4 redirect chains are these same www and http variants reaching `/en/` in two
hops, which is unavoidable for a www plus http entry point and costs nothing.

## Real work remaining, ranked

1. **134 meta descriptions too long.** Already item 12 in `USER-ACTIONS-REQUIRED.md`
   at 101; the number is 134 on the full crawl. Mechanical, safe, low value.
2. **328 pages linking to redirects.** Diagnosed above, fix designed, waiting on the
   GSC baseline.
3. **5 genuinely short meta descriptions** on eSIM hub pages.
4. **9 titles too long.** Unchanged for two crawls, cosmetic.
5. **4 slow pages and 2 slow responses for AI crawlers.** New in this crawl. One
   crawl is not a trend; check on the next one before acting.

Nothing on that list is an error, and nothing on it blocks anything.

## Provenance

Captured from the Ahrefs API on 2026-09-29, after the crawl the user started in
the UI. **This is the last Site Audit this subscription will produce unless another
crawl is run before 8 October.** Everything here is
FROZEN_AFTER_AHREFS_EXPIRY. 300 units spent on this capture.

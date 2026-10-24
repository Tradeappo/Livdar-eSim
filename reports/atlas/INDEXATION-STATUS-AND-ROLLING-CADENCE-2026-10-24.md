# Indexation status and rolling publication rules, 2026-10-24

Source: URL Inspection run 40106659627, all 1,500 live Atlas URLs, 2026-10-24 15:22 to 16:02 UTC, 0 API errors. Production fetch at 16:04 UTC: all 1,749 sitemap URLs and all 1,500 cohort URLs return 200; every cohort URL is self-canonical and indexable. States are language independent: indexed = verdict PASS; crawled-not-indexed = a lastCrawlTime and no PASS; discovered = never crawled, known from a sitemap or a link; unknown = known from nothing; excluded = a different Google canonical, robots or noindex, a failed fetch, or verdict FAIL. Machine-readable: `INDEXATION-STATUS-2026-10-24.json`.

## Cohort 003 against the old 500

| | Cohort 003 | Cohorts 001 + 002 (old 500) |
|---|---:|---:|
| planned | 1,000 | 500 |
| live, HTTP 200 | 1,000 | 500 |
| in live sitemap | 1,000 | 500 |
| known by Google | 893 | 451 |
| unknown | 107 | 49 |
| discovered-not-indexed | 405 | 214 |
| crawled-not-indexed | 1 | 1 |
| indexed | 487 | 236 |
| excluded, other reason | 0 | 0 |
| check | 107+405+1+487 = 1,000 | 49+214+1+236 = 500 |
| crawled (indexed + crawled-not-indexed) | 488 (48.8%) | 237 (47.4%) |
| indexed per crawled | 99.8% | 99.6% |
| age | ~91 h (live 2026-10-20 ~20:30 UTC) | ~29 days (live 2026-09-25; reachable in all languages since 2026-10-12) |

Old 500 split: Cohort 001 = 250 live, 222 known, 28 unknown, 114 discovered, 0 crawled-not-indexed, 108 indexed; Cohort 002 = 250 live, 229 known, 21 unknown, 100 discovered, 1 crawled-not-indexed, 128 indexed.

**Speed.** Cohort 003 crawled pages: 226 at 42 h (2026-10-22 14:30 UTC), 360 at 67 h (10-23 15:00), 488 at 91 h (10-24 15:40): about 130 newly crawled pages a day, and every crawled page but one indexed.

**The old 500 have stalled.** Their last crawls: 198 on 2026-10-18, 24 on 10-19, 5 on 10-20 or later, 263 never. Google is spending its Atlas crawl on Cohort 003 and has not returned to the old pages since 10-19, which is also why none of the 126 PR #43 source pages has been recrawled.

**Language split of Cohort 003** (indexed / discovered / unknown): en 124/62/17, fr 95/41/10 (+1 crawled-not-indexed), es 76/100/27, ja 55/15/2, pt 36/59/6, pl 34/38/5, nl 27/70/14, de 21/20/2, it 19/0/24. Italian has the most unknown pages, and its child sitemap `atlas-pages-it-climate.xml` (43 URLs) is the one Google has not re-read since 2026-10-20 03:58, before the cohort went live.

**Sitemap.** Search Console counts 1,695 of the live 1,749; the missing 54 are exactly `atlas-pages-it-climate.xml` (43) and `ro-regions.xml` (11, never read).

**Crawl push (PR #43).** 0 of 126 source pages recrawled since 2026-10-22 15:15 UTC; 0 of 263 targets exposed; no target crawled or indexed.

## Rolling publication rules

The aim: Cohort N+1 publishes as soon as objective early signals on Cohort N are healthy, without waiting for N to be fully indexed. All signals below are readable within 72 hours.

### Timeline per cohort

1. **Day 0.** Publish Cohort N in its own child sitemaps; submit `sitemap.xml` through the `atlas-search-console` workflow (`submit_sitemap: true`); IndexNow.
2. **Day 0.** Production check: every Cohort N URL and every sitemap URL 200, self-canonical, indexable, in exactly one child sitemap.
3. **Days 1 to 3.** Daily URL Inspection of Cohort N through a paths file (`inspect_paths_file`), plus the GSC sitemap child listing. Quota is a **rolling 24 h window of 2,000**: a cohort up to 1,000 is inspected in full once a day; a larger cohort as a stratified 600 across language and family.
4. **72 h after publication: evaluate the gates.** SCALE: Cohort N+1 may publish on day 3 or 4. HOLD: re-evaluate daily for up to day 10, then treat as STOP. STOP: freeze publishing and fix first.

That gives a cadence of one cohort every 3 to 4 days while the gates stay green, instead of 7 to 14 days.

### Gates, evaluated on Cohort N at 72 h

| signal | measured as | SCALE | HOLD | STOP |
|---|---|---|---|---|
| sitemap discovery | every child sitemap holding Cohort N has `lastDownloaded` after publication and GSC submitted = live for those children; sitemap errors and warnings 0 | all re-read, 0 errors | a child not re-read: resubmit, re-check daily, hold only the languages in that child | sitemap errors > 0, or a child unreadable or non-200 |
| discovery (known) | known by Google / live | >= 70% | 40 to 70% | < 40% with every child sitemap already re-read |
| crawl rate | crawled / live at 72 h, and new crawls per day over the last 48 h | >= 25% crawled, or >= 100 new crawls a day | 10 to 25% | < 10% with sitemaps re-read |
| indexed rate | indexed / crawled | >= 90% | 75 to 90% | < 75% |
| crawled-not-indexed | crawled-not-indexed / crawled | <= 5% | 5 to 15% | > 15% |
| 5xx and errors | production non-200 on cohort or sitemap URLs; Vercel runtime errors on Atlas routes; GSC fetch states SERVER_ERROR, SOFT_404, NOT_FOUND, REDIRECT_ERROR, ACCESS_DENIED | 0 everywhere | a transient error gone on a recheck within 24 h | any error present on two consecutive checks |
| duplicate and canonical | Google canonical different from ours among crawled URLs; near-duplicate titles or bodies within a language | 0 | <= 1% of crawled, one family only | > 1%, or a family-wide cluster |

Overall: **SCALE** only if every row is SCALE; **HOLD** if any row is HOLD and none is STOP; **STOP** if any row is STOP. The rows are also evaluated per language: a language in HOLD or STOP gets no pages in Cohort N+1 even when the cohort as a whole is SCALE.

### Size of Cohort N+1

Size follows Google's measured crawl, not the inventory:

- **T** = new Atlas URLs crawled per day, averaged over the last 48 h (today about 130).
- **B** = uncrawled URLs (unknown + discovered) in cohorts younger than 30 days (today 512, all Cohort 003).
- **Size of N+1 <= 5 x T**, and after publication **B + size <= 10 x T** (backlog never more than ten days of crawl). Today: 5 x 130 = 650 and 10 x 130 - 512 = 788, so the limit is **650**.
- Growth never more than 1.5 x the previous cohort.
- Uncrawled pages in cohorts older than 30 days (today the old 263) are tracked separately and do not consume the budget: they are a crawl-priority problem for those families (see PR #43), not a capacity problem.

### What the rules say today (no action taken)

Cohort 003 at about 91 h: sitemap 8 of 9 language children re-read, 0 errors, `it-climate` not re-read (Italian HOLD, the rest SCALE); known 89.3% (SCALE); crawled 48.8%, about 130 a day (SCALE); indexed/crawled 99.8% (SCALE); crawled-not-indexed 0.2% (SCALE); errors 0 in production, Vercel and GSC (SCALE); canonical mismatches 0 (SCALE).

**Verdict: SCALE for a Cohort 004 of at most 650 pages, excluding Italian until `atlas-pages-it-climate.xml` is re-read.** Not published: Cohort 004 stays unpublished until the owner decides.

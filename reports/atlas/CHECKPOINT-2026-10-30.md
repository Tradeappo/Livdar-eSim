# Atlas crawl recovery: 24 h after the lastmod fix, 2026-10-30

**Decision: Cohort 005 HOLD.**

PR #50 is live and the sitemaps were resubmitted on 2026-10-29 at 19:30 UTC (run 78). Google re-read all 8 Cohort 004 sitemaps within 3 minutes, but in the next 24 h it crawled none of their URLs.

Crawl velocity:
- Cohort 004 sample: 0 a day.
- Older pages (Track A): about 1 to 2 a day.

That is the "still near 0 to 20 a day" case, so the two crawl-allocation fixes are open for review: PR #52 (fix A) and PR #53 (fix B). Neither is merged.

## 1. Cohort 004 fixed sample

Run 81 inspected 601 of 601 URLs on 2026-10-30 at 19:11 UTC, with 0 errors.

| state | 10-29 (run 77) | 10-30 (run 81) |
|---|---:|---:|
| indexed | 184 | 184 |
| crawled-not-indexed | 0 | 0 |
| discovered | 320 | 340 |
| unknown | 97 | 77 |
| excluded | 0 | 0 |

| measure | value |
|---|---:|
| new crawls since run 77 | **0** |
| known (indexed + discovered) | 524 / 601 = 87.2% |
| crawled | 184 / 601 = 30.6% |
| indexed / crawled | 184 / 184 = **100%** |
| crawl velocity, last 24 h | **0** in the sample. With 0 of 417 uncrawled URLs crawled, the 95% upper bound is about 35 crawls a day across the whole cohort. |

Discovered and unknown swapping places is noise. Crawls by date: 10-24 63, 10-25 118, 10-26 3, then none. The last crawl was 2026-10-26 10:34:52 UTC.

**By language:**

| language | indexed | discovered | unknown |
|---|---:|---:|---:|
| en | 38 | 73 | 15 |
| es | 47 | 35 | 8 |
| fr | 19 | 84 | 27 |
| ja | 36 | 39 | 10 |
| pl | 8 | 43 | 5 |
| pt | 22 | 30 | 4 |
| nl | 11 | 25 | 3 |
| de | 3 | 11 | 5 |

## 2. Sitemaps re-read after the PR #50 deploy and resubmission

All 8 Cohort 004 children were re-read after the resubmission at 2026-10-29 19:30:24, each with 0 errors and 0 warnings. `sitemap.xml` was read at 19:32:43.

| child | lastDownloaded (UTC) |
|---|---|
| c004-en | 2026-10-29 19:32:38 |
| c004-de | 19:32:40 |
| c004-es | 19:32:43 |
| c004-ja | 19:32:44 |
| c004-fr | 19:32:45 |
| c004-pt | 19:32:52 |
| c004-pl | 19:32:57 |
| c004-nl | 19:33:01 |

Each served `lastmod` 2026-10-24T19:15:02Z for its 5,000 URLs. The sitemap side now works as intended, and it did not start a crawl.

## 3. Track A and the estimated total

Run 82 inspected 777 of 777 on 2026-10-30 at 19:29 UTC, with 0 errors.

**Old pages, Cohorts 001 + 002 (264):**

| state | 10-28 | 10-30 |
|---|---:|---:|
| indexed | 6 | 6 |
| crawled-not-indexed | 1 | 1 |
| discovered | 231 | 203 |
| unknown | 26 | 54 |

**Cohort 003 (513):**

| state | 10-28 | 10-30 |
|---|---:|---:|
| indexed | 140 | **143** |
| crawled-not-indexed | 2 | 0 |
| discovered | 302 | 297 |
| unknown | 69 | 73 |

**Movement since 10-28:**
- crawled-not-indexed → indexed: 2
- discovered → indexed: 1
- The old pages did not move.

New crawls since the 10-28 run: 2, both after the resubmission. On 10-28 there were 15.

The Cohort 004 links still show no effect. Of the 66 old targets linked from Cohort 004, 4 are indexed, unchanged since 10-27.

**Estimated indexed across the 6,500:**

| cohort | indexed | share |
|---|---:|---:|
| 001 + 002 | 242 / 500 | 48.4% |
| 003 | 630 / 1,000 | 63.0% |
| 004 | ≈ 1,531 / 5,000 | 30.6% (95% CI ≈ 1,346 to 1,716) |
| **total** | **≈ 2,403 / 6,500** | **≈ 37.0%** |

The Cohort 004 estimate is lower than on 10-28 (1,548) only because of the denominator. The same 184 sample pages are indexed. On 10-28, 10 URLs returned errors and were left out; now all 601 count.

**Indexed / crawled:**

| cohort | indexed / crawled |
|---|---:|
| 004 | 100% |
| 003 | 100% |
| 001 + 002 | 242 / 243 |

## 4. Production health

| check | result |
|---|---|
| sample URLs returning HTTP 200 | 601 of 601 |
| self canonical and `index, follow` | all 601 |
| sitemap errors and warnings | 0 |
| Vercel runtime errors, last 24 h | 0 |
| canonical mismatches, fetch failures, FAIL verdicts | 0 in the 1,378 URLs inspected today |

## 5. Decision and the fixes opened

The GO rule is not met: there is no crawl restart and nothing trending toward 100 a day. **Cohort 005 stays on HOLD.** Quality is not the problem: 100% of what Google crawls is indexed.

**PR #52, fix A: eSIM destination pages link to their country's Atlas pages.**
- Each English and German destination page gets up to 8 same-language, same-country links, country pages first and then cities by population. There are 18 English and 11 German blocks.
- It links 177 unique Atlas pages. About 82 of them are not yet crawled: 36 known from inspection, about 46 estimated in Cohort 004.
- The reach is small by construction: eSIM pages exist only in en, de and ro.
- The eSIM route reads a 15 KB file, not a page shard, so the PR #48 function budget holds.

**PR #53, fix B: country hubs.**
- 178 hubs at `/<lang>/atlas/<country>/`, for every language and country with at least 5 city weather pages.
- Each hub compares the country's cities on warmest, coldest and wettest month, copied from each page's own facts, and links the country's other pages.
- The directories link hubs instead of 5,562 city pages. `/en/atlas/` drops from 1,368 to 274 links.
- 5,662 pages are linked from a hub, about 3,590 of the roughly 4,100 uncrawled Atlas pages.
- 0 pages lose reachability. There is no new inventory, and no city page changes.

Both PRs build, and `npm test` shows only the pre-existing `atlas-monitor` failure, which fails on `main` too. Neither is merged.

**Next measurement after a merge:**
- The same 601 sample and Track A, 24 h and 72 h after the deploy.
- Hub crawl state through URL Inspection on a hub subset.
- GO for Cohort 005 needs two consecutive days of at least 100 new Atlas crawls, or at least 25 a day in the sample, with indexed/crawled at or above 90%.

No quality gate was relaxed and no inventory was generated.

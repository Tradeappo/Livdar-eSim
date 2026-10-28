# Atlas crawl and indexation checkpoint, 2026-10-28

**Decision: Cohort 005 HOLD.**
- Quality is fine: indexed/crawled is 99.7 to 100% in every cohort.
- Crawl velocity has not recovered. The fixed Cohort 004 sample got 0 new crawls in the last 24 h and 0 since 2026-10-26 10:34 UTC.
- Across the whole Atlas, Google is crawling about 15 to 20 new URLs a day. On 10-24/25 it was about 130.
- First fix: PR #50 (sitemap lastmod). It is open and waiting for approval.

## 1. Cohort 004 fixed sample (601 URLs)

The sample was inspected by run 73 at 2026-10-28 19:11 UTC, 96 h after launch. 591 URLs were inspected and 10 returned API errors.

| state | pages |
|---|---:|
| indexed | 183 |
| crawled-not-indexed | 0 |
| discovered | 306 |
| unknown | 102 |
| excluded | 0 |

| measure | value |
|---|---:|
| known (indexed + crawled + discovered) | 489 / 591 = **82.7%** |
| crawled | 183 / 591 = **31.0%** |
| indexed / crawled | 183 / 183 = **100%** |
| canonical mismatches | 0 |
| fetch failures | 0 |

**Sample URLs crawled, by date of last crawl:**

| date | URLs |
|---|---:|
| 10-24 | 63 |
| 10-25 | 117 |
| 10-26 | 3 |
| 10-27 | 0 |
| 10-28 | 0 |

The last crawl in the sample was at 2026-10-26 10:34:52 UTC.
- **New crawls since the previous checkpoint (72 h): 0.**
- **Crawl velocity, last 24 h: 0 in the sample.** Extrapolated to 5,000 pages that is about 0. With 0 crawls in 591 URLs, the 95% upper bound is about 25 crawls a day across the cohort.

**Indexed by language:**

| language | indexed |
|---|---:|
| es | 47 |
| en | 37 |
| ja | 36 |
| pt | 22 |
| fr | 19 |
| nl | 11 |
| pl | 8 |
| de | 3 |

**Sitemaps.** All 8 `atlas-pages-c004-*` children have been read in full, with 0 errors and 0 warnings. `c004-de` was re-read on 2026-10-28 at 17:17.

## 2. Older pages: Track A (777 pages not indexed at 2026-10-24)

The Track A set was inspected by run 75 at 2026-10-28 22:42 UTC: 777 URLs, 0 API errors.

**Old pages, Cohorts 001 + 002 (264 in Track A):**

| state | 10-27 | 10-28 |
|---|---:|---:|
| indexed | 6 | 6 |
| crawled-not-indexed | 1 | 1 |
| discovered | 213 | 231 |
| unknown | 44 | 26 |

Unknown and discovered swap places between runs; those flips are noise.

**Cohort 003 (513 in Track A):**

| state | 10-27 | 10-28 |
|---|---:|---:|
| indexed | 123 | **140** |
| crawled-not-indexed | 1 | 2 |
| discovered | 328 | 302 |
| unknown | 61 | 69 |

**Movement since 10-27:**
- discovered → indexed: 15
- unknown → indexed: 2
- discovered → crawled-not-indexed: 1
- The old pages did not move.

**Track A URLs crawled, by date of last crawl:**

| date | URLs |
|---|---:|
| 10-24 | 64 |
| 10-25 | 55 |
| 10-26 | 8 |
| 10-27 | 6 |
| 10-28 | 15 |

That is 18 new crawls since the previous checkpoint, all of them on Cohort 003. This is the only sign of recovery so far.

**Do the Cohort 004 links help? Not yet.** Cohort 004 carries links to 66 old targets:

| | 10-27 | 10-28 |
|---|---:|---:|
| linked targets indexed | 4 | 4 |
| last linked target crawl | 10-25 | 10-25 |
| unlinked old targets indexed (of 197) | — | 2 |

Since 10-25 no linked target has been crawled, and the Cohort 004 source pages themselves have not been recrawled.

## 3. PR #43 source pages (126)

Run 74 inspected them at 2026-10-28 20:05 UTC. They were not re-inspected for this checkpoint, to save quota.
- All 126 still PASS.
- 0 have been recrawled since 2026-10-22.

## 4. Production health

| check | result |
|---|---|
| sitemap URLs returning HTTP 200 | 6,749 of 6,749 |
| cohort pages | all 6,500 clean: 200, self canonical, `index, follow` |
| Vercel runtime errors | 0 in the last 24 h |
| TTFB | median 0.24 s, CDN HIT |
| GSC canonical mismatches | 0 |
| GSC fetch failures | 0 |
| sitemap index (Google count) | 6,734 of 6,749 counted; the 15 missing are in `ro-regions` and `ro-guides`, not Atlas |

**Defect found:** every Atlas URL in the sitemap declares `lastmod` 2026-09-21. That is before Cohorts 003 and 004 existed. The fix is PR #50, which is not merged.

## 5. Estimated indexed pages across the 6,500

| cohort | indexed | share | basis |
|---|---:|---:|---|
| 001 + 002 | 242 / 500 | 48.4% | 236 indexed on 10-24, plus 6 in Track A |
| 003 | 627 / 1,000 | 62.7% | 487 indexed on 10-24, plus 140 in Track A |
| 004 | ≈ 1,548 / 5,000 | 31.0% | sample; 95% CI ≈ 1,365 to 1,733 |
| **total** | **≈ 2,417 / 6,500** | **≈ 37.2%** | range ≈ 34 to 40% |

Every cohort except 004 is a full census.

## 6. Cohort 005 (10,000): HOLD

| gate | value | result |
|---|---|---|
| indexed / crawled | 100% (004), 99.7% (003) | pass |
| crawled-not-indexed | 0% (004) | pass |
| errors and canonical | 0 | pass |
| sitemaps | all read, 0 errors | pass |
| crawl velocity | 004 sample 0 per day since 10-26; whole Atlas about 15 to 20 per day, against a gate of ≥ 100 per day | **fail** |

The backlog alone is not the reason for HOLD. Velocity is the reason: in 4 days Google crawled none of the 591 Cohort 004 sample URLs that were still uncrawled. Adding 10,000 URLs now would split a budget of about 20 crawls a day across about 14,000 uncrawled URLs.

**Next crawl-allocation fixes, in order:**
1. **PR #50: accurate sitemap lastmod** (genuine defect). Merge it, run the production check, and resubmit `sitemap.xml` together with the 8 `c004` children.
2. **Links from crawled eSIM destination pages to their country's weather pages.** For example, `/en/esim/japan/` has only 2 Atlas links today. The eSIM pages are the most frequently crawled pages on the site. The links must be relevant and in the same language. This needs approval because it changes live non-Atlas pages.
3. **Split the directory pages.** `/en/atlas/` holds 1,368 links, 1,251 of them to weather pages. They would be split into per-country hubs. This adds pages and needs approval.
4. **External links and popularity signals.** Crawl demand is the binding limit, not server speed.

**What would change the decision:** a GO needs two consecutive days of ≥ 100 new Atlas crawls a day, or ≥ 25 new crawls a day in the Cohort 004 sample, with indexed/crawled still ≥ 90%.

## 7. 25k → 50k → 100k

**Not supported by the evidence yet.**
- Acceptance supports it: Google indexes nearly everything it crawls.
- Crawl capacity does not: it is about 20 a day today. At that rate the current 4,000+ uncrawled Atlas URLs alone take more than 6 months.

The sequence should resume only after velocity recovers under the fixes above. Quality thresholds stay unchanged.

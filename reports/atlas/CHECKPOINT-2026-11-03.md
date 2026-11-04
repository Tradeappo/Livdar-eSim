# Atlas checkpoint, 2026-11-03

Verification and recommendation only. Nothing was merged or deployed, and Cohort 005 was not published.

**Raw data:** `data/atlas/measurements/gsc/archive/`, on this branch. The workflow branch `atlas/search-console` is reset on every run, so the files are archived here.

**Quota.** Before dispatching, the rolling 24 h window held only run 90 (126 URLs, 2026-11-02 23:31). Scheduled run 91 inspected nothing. This checkpoint used 990 inspections:

| run | subset | URLs |
|---|---|---:|
| 92 | Cohort 004 sample | 601 |
| 93 | crawl-push sources | 126 |
| 94 | crawl-push targets | 263 |

## 1. Cohort 004 sample (run 92, 2026-11-03 23:32 UTC, 601 of 601, 0 errors)

| state | 10-31 | 11-03 |
|---|---:|---:|
| indexed | 184 | 184 |
| crawled-not-indexed | 0 | 2 |
| not indexed, unknown to Google | 417 | 415 |
| excluded | 0 | 0 |

**New crawls since 10-31: 2.** These are the first since 2026-10-26. Both are already indexed:

| page | crawled (UTC) |
|---|---|
| `/en/weather/jinju/` | 2026-11-01 12:03 |
| `/de/wetter/balikpapan/` | 2026-11-02 17:36 |

**Dropped from the index without a recrawl: 2.** Their last crawls are from 10-25:
- `/pt/clima/bilecik/`
- `/en/weather/san-francisco-del-rincon/`

The same happened to sources `/es/clima/colonia/` and `/pt/custo-de-vida/dinamarca/`, which came back within a day.

**Rates:**
- Indexed/crawled is 184 / 186 = 98.9%.
- Crawl velocity is 2 in 3 days in the sample, about 0.7 a day. Extrapolated to the cohort that is about 8 a day, with a very wide range.

**Sitemaps.** The 8 Cohort 004 children and the index were last read on 10-29 at 19:32, with 0 errors. The URL Inspection `sitemap` field is still empty on every sample row.

| language | indexed | not indexed |
|---|---:|---:|
| es | 47 | 43 |
| en | 38 | 88 |
| ja | 36 | 49 |
| pt | 21 | 35 |
| fr | 19 | 111 |
| nl | 11 | 28 |
| pl | 8 | 48 |
| de | 4 | 15 |

## 2. Crawl push PR #43

**Sources (run 93, 126 of 126, 0 errors).**
- `/pt/custo-de-vida/franca/`, which returned a Google API 500 on 11-02, was inspected on the retry: PASS, last crawl 2026-10-18.
- **Recrawled since 2026-10-22 15:15: 1 of 126.** That is `/de/gehaelter/daenemark/`, crawled on 2026-10-30 06:02.
- 123 are indexed. 3 now read "crawled, currently not indexed" with no new crawl:
  - `/de/feiertage/brandenburg/`
  - `/en/cost-of-living/colombia/`
  - `/pt/custo-de-vida/italia/`

**Target of the recrawled source.** Its one PR #43 link, to `/de/rechner/wo-soll-ich-leben/`, is live in production and the target returns 200. Google still reports the target as "unknown". It has seen the source page but has not followed the link yet.

**All 263 targets (run 94, 0 errors):**

| state | pages |
|---|---:|
| indexed | 6 |
| discovered | 97 |
| unknown | 160 |

- All 6 indexed targets were crawled between 10-24 and 10-26: 4 of them linked from Cohort 004, 2 not. No target has been crawled since 10-26.

## 3. Estimate across the 6,500 pages

Track A was not re-run (latest run 82, 2026-10-30). The Cohort 004 figure is extrapolated from the sample.

| cohort | indexed |
|---|---:|
| 001 + 002 | 242 / 500 |
| 003 | 630 / 1,000 |
| 004 | ≈ 1,531 / 5,000 (95% CI ≈ 1,346 to 1,716) |
| **total** | **≈ 2,403 / 6,500 (≈ 37%)** |

## 4. PRs against current main (15e0b92, feature-flagged on-demand ISR)

All three PRs were merged together locally onto `origin/main`:
- No conflicts. The `atlas-monitor` fix commit is in #52, #53 and #54, and the copies merge cleanly.
- `npm test` passes 421 and fails 0.
- quality-gate, qa `--preview --ci`, funnel, links `--ci` and reconcile `--check` all exit 0.
- `npm run build` exits 0 with 6,899 pages prerendered: 6,500 Atlas pages, plus 178 hubs, plus the rest.
- The on-demand ISR codemod on main touches only the routes built with `makeAtlasPageRoute`. That excludes the hubs and the eSIM catch-all, so it does not interact with #52 or #53. Its flag is off by default.

| PR | still needed | why | overlap |
|---|---|---|---|
| #54 | yes, first | `atlas-ci` on main has been red since PR #48 because of this monitor bug, and it was still red on 15e0b92 | its commit is copied into #52 and #53 |
| #53 hubs | yes | the largest crawl exposure: about 3,590 uncrawled pages, in all 9 languages | none apart from the #54 commit |
| #52 eSIM links | yes, smaller | about 82 uncrawled pages, en and de only; low risk | none apart from the #54 commit |

**Recommended order:** #54 → #53 → #52. Then:
1. Check production.
2. Resubmit `sitemap.xml`. The hubs are in `atlas-directory`.
3. Inspect the sample and a hub subset at 24 h and 72 h.

Cohort 005 stays on HOLD.

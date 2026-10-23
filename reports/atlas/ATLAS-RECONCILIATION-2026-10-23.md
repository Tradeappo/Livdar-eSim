# Atlas reconciliation, 2026-10-23

This is the one authoritative count of every Atlas cohort and every live sitemap URL, reconciled URL by URL. It replaces every earlier summary that mixed planned size, live pages, sitemap membership, Search Console discovery, crawl and indexation.

Machine-readable record, including every URL: `ATLAS-RECONCILIATION-2026-10-23.json`.
Regenerate with `scripts/atlas/analysis/atlas-reconciliation.py`.

## Sources and which one wins

| question | authoritative source | why |
|---|---|---|
| planned and generated | `data/atlas/cohorts/cohort-00N.json` (`target`) and `cohort-00N-pages.json` on `main` (at `113cb4f`) | these files are what production serves, through `lib/atlas/serve-pages.js` |
| live, canonical, indexable | a fresh fetch of production at 2026-10-23 15:20 UTC: every cohort URL plus every URL in `sitemap.xml` and its 80 children | it is the current state of production, not a build log |
| sitemap membership | the same fetch of the live sitemap index and all children | |
| Google's view | URL Inspection run 39971035209 (2026-10-23, 14:36 to 15:19 UTC), 1,498 URLs; for each URL the most recent inspection wins | it is the only per-URL index verdict Google gives |
| offline inventory | the FINAL manifest parts, 1,002,362 rows, SHA-256 `0f2a32f2...e5408f8`, matched by family + language + entity id | the manifest stores an internal `url_pattern`, so URLs cannot match; identity can |

The latest run returned a Google API error (`500 INTERNAL`) for 2 URLs. Each falls back to its previous inspection:
- `/es/herramientas/calculadora-de-salario/` (cohort 001): indexed at 2026-10-23 12:38 UTC.
- `/es/clima/rampur/` (cohort 003): discovered at 2026-10-22 14:29 UTC.

So no URL is without a state.

Search Console states are computed from language-independent fields, because Google localises the coverage text:
- **indexed:** verdict PASS.
- **crawled-not-indexed:** a lastCrawlTime but no PASS.
- **discovered-not-indexed:** never crawled, but known from a sitemap or a link.
- **unknown:** known from nothing.
- **excluded for another reason:** a Google-chosen canonical that differs from ours, robots or noindex blocking, a non-success fetch, or verdict FAIL.

## The table

| cohort | planned / generated | served live, HTTP 200 | self-canonical | indexable | in live sitemap | known by GSC | unknown | discovered-not-indexed | crawled-not-indexed | indexed | excluded, other reason | missing from production | missing from sitemap | notes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 001 | 250 / 250 | 250 | 250 | 250 | 250 | 220 | 30 | 112 | 0 | 108 | 0 | 0 | 0 | live since 2026-09-25; 142 of the 263 crawl-push targets |
| 002 | 250 / 250 | 250 | 250 | 250 | 250 | 219 | 31 | 90 | 1 | 128 | 0 | 0 | 0 | live since 2026-09-25; 121 of the 263 targets |
| 003 | 1,000 / 1,000 | 1,000 | 1,000 | 1,000 | 1,000 | 803 | 197 | 443 | 0 | 360 | 0 | 0 | 0 | live since 2026-10-20 ~20:30 UTC, about 67 h at inspection |
| **TOTAL** | **1,500 / 1,500** | **1,500** | **1,500** | **1,500** | **1,500** | **1,242** | **258** | **645** | **1** | **596** | **0** | **0** | **0** | |

Each row adds up exactly:

| cohort | unknown + discovered + crawled + indexed + excluded |
|---|---|
| 001 | 30 + 112 + 0 + 108 + 0 = 250 |
| 002 | 31 + 90 + 1 + 128 + 0 = 250 |
| 003 | 197 + 443 + 0 + 360 + 0 = 1,000 |
| TOTAL | 258 + 645 + 1 + 596 + 0 = 1,500 |

"Known by GSC" is everything except unknown. Separately, Google itself lists a sitemap for 197 (001), 192 (002), 687 (003) and 1,076 (TOTAL) of these URLs.

**Indexed per crawled:**

| cohort | indexed / crawled | rate |
|---|---|---:|
| 001 | 108 / 108 | 100% |
| 002 | 128 / 129 | 99.2% |
| 003 | 360 / 360 | 100% |
| TOTAL | 596 / 597 | 99.8% |

## Answers

**1 to 3. Planned.** Each cohort file states its `target` and holds exactly that many distinct pages: no shortfall, no `withoutPath`, no duplicates.

| cohort | target | pages in file | generated |
|---|---:|---:|---|
| 001 | 250 | 250 | 2026-09-24 |
| 002 | 250 | 250 | 2026-09-24 |
| 003 | 1,000 | 1,000 | 2026-10-20 |

The union of the three is exactly the 1,500 paths in `reports/atlas/live-production.json`. No path is in two cohorts.

**4. Live now.** 001: 250, 002: 250, 003: 1,000. Every one returns HTTP 200 with a self-referencing canonical and `index, follow`, and none has an `X-Robots-Tag`.

**5. In the live sitemap.** 001: 250, 002: 250, 003: 1,000. Each URL appears in exactly one child sitemap.

**6. Known to Google.** 001: 220, 002: 219, 003: 803. Total 1,242 of 1,500.

**7. Indexed.** 001: 108, 002: 128, 003: 360. Total 596.

**8. The other states.**

| cohort | unknown | discovered-not-indexed | crawled-not-indexed | excluded, other reason |
|---|---:|---:|---:|---:|
| 001 | 30 | 112 | 0 | 0 |
| 002 | 31 | 90 | 1 | 0 |
| 003 | 197 | 443 | 0 | 0 |

**9. Planned but not live.** None: 1,500 of 1,500 planned pages are served with HTTP 200.

**10. Live but missing from the sitemap.**
- None of the 1,500 cohort URLs.
- The sitemap also contains 249 URLs that belong to no cohort; all are 200 and self-canonical (see 16).

**11. Sitemap URLs returning non-200.** None. The index, all 80 child sitemaps and all 1,749 URLs return 200.

**12. The 263 old pages.**

| | cohort 001 | cohort 002 | total |
|---|---:|---:|---:|
| discovered-not-indexed (2026-10-22 baseline) | 112 | 92 | 204 |
| unknown (2026-10-22 baseline) | 30 | 29 | 59 |
| **targets** | **142** | **121** | **263** |

Today the 263 are:

| | cohort 001 | cohort 002 | total |
|---|---:|---:|---:|
| discovered-not-indexed | 112 | 90 | 202 |
| unknown | 30 | 31 | 61 |
| crawled or indexed | 0 | 0 | 0 |

Note: 102 targets switched between unknown and discovered since 10-22 (52 one way, 50 the other) without any crawl. The unknown/discovered split moves between inspections and is not progress. Crawled and indexed are the states that measure progress.

**13. The 126 PR #43 source pages.** 68 are in cohort 001, 46 in cohort 002 and 12 in cohort 003. All 126 were indexed on 10-22 and are still indexed now.

**14. Old pages, cohorts 001 + 002 (500), with no remainder.**

| | 2026-10-22 baseline | today |
|---|---:|---:|
| the 263 crawl-push targets | 263 | 202 discovered + 61 unknown = 263 |
| the 237 non-targets | 235 indexed + 1 crawled-not-indexed + 1 not inspected = 237 | 236 indexed + 1 crawled-not-indexed = 237 |
| **total** | **500** | **500** |

- The 1 page not inspected on 10-22 was `/en/best-time-to-visit/japan/` (Google API 500 that day). It is indexed now.
- Today's 236 indexed are 108 from 001 and 128 from 002.
- The 1 crawled-not-indexed is in cohort 002.
- Check: 236 + 1 + 202 + 61 = 500.

**15. Cohort 003 on its own.**
- 1,000 in the file, 1,000 served 200, 1,000 self-canonical and indexable, 1,000 in the sitemap.
- Google: 360 indexed, 443 discovered, 197 unknown, 0 crawled-not-indexed, 0 excluded (360 + 443 + 197 = 1,000).
- Change since 2026-10-22 14:32 UTC:

| | 10-22 | today |
|---|---:|---:|
| indexed | 226 | 360 |
| discovered | 165 | 443 |
| unknown | 609 | 197 |

**16. The 1,749 URLs in the live sitemap.**

| part | URLs | where |
|---|---:|---|
| Atlas cohort 001 | 250 | `atlas-pages-*` children |
| Atlas cohort 002 | 250 | `atlas-pages-*` children |
| Atlas cohort 003 | 1,000 | `atlas-pages-*-climate` children |
| Atlas, no cohort: legacy city-month | 123 | `atlas-en-city-month-1.xml` 77, `atlas-de-city-month-1.xml` 46 |
| Atlas, no cohort: directory | 9 | `/xx/atlas/` in nine languages |
| Atlas, no cohort: hubs | 2 | `/en/cities/`, `/de/staedte/` |
| Main site, core | 21 | en, de, ro core, 7 each |
| Main site, destinations | 45 | |
| Main site, regions | 33 | |
| Main site, guides | 16 | |
| **total** | **1,749** | |

- The 123 legacy city-month URLs cover 13 city and language pairs, for example `/en/cities/tokyo/weather-in-january/`.
- Check: 1,500 + 134 Atlas outside the cohorts + 115 main site = 1,749.

**17. Search Console's sitemap count against the live count.**
- Google counts 1,695 submitted URLs across 79 children. The index was last downloaded 2026-10-22 14:10:27 UTC, with 0 errors and 0 warnings.
- The live sitemap has 1,749 URLs across 80 children. The difference of 54 is exactly two children Google has not re-read:
  - `atlas-pages-it-climate.xml`: counted at 1 of 44, last read 2026-10-20 03:58, before cohort 003 went live (43 URLs).
  - `ro-regions.xml`: 11 URLs, 200 and valid XML, never read by Google so far (11 URLs).
- The other 78 children match exactly.
- This is Google processing the children one at a time, not a defect: since 10-22 the count rose 1,450 → 1,696 → 1,695 as `en-climate` and `de-climate` were re-read, and `ro-core` settled at its live 7.

**18. The old ISR/500 issue.** It affects no URL now:
- Production: 1,749 of 1,749 sitemap URLs and 1,500 of 1,500 cohort URLs return 200.
- Vercel: 0 runtime errors for the production project in the last 7 days.
- Search Console: of the 1,500 latest inspections, 597 have a fetch state, and all 597 are SUCCESSFUL. The other 903 were never fetched by Google. No row has a server error, soft 404, not found or redirect state.
- The only 500s in this audit came from Google's inspection API itself (`INTERNAL`) on 2 requests, not from Livdar.

**19. The PR #43 crawl-push experiment.**
- The 126 source pages were inspected between 14:36 and 15:16 UTC today. **0 of 126 have been recrawled since 2026-10-22 15:15 UTC.**
- **0 of the 263 targets are exposed** to a recrawled source.
- **No target has been crawled or indexed.** The 102 unknown/discovered flips are not progress (see 12).
- The four groups:

| group | targets | today |
|---|---:|---|
| gained links, source recrawled | 0 | |
| gained links, source not yet recrawled | 104 | 81 discovered, 23 unknown |
| no new links | 107 | 83 discovered, 24 unknown |
| the 52 unreachable | 52 | 38 discovered, 14 unknown |

- The experiment has no readable result yet.

**20. What remains unpublished from the FINAL inventory.**
- **FINAL count: 1,002,362** (manifest parts intact; see `project-backup/AUTHORITATIVE-STATE.json`).
- **Published from FINAL: 1,014 rows**, matched by family + language + entity id, each to exactly one FINAL row:
  - 1,000 cohort 003 `weather.city-month` pages;
  - 14 cohort 002 `neighbourhoods.city-where-to-stay` pages.
- **Still unpublished from FINAL: 1,001,348** (1,002,362 minus 1,014). Within the families already being served, what's left is 25,665 `weather.city-month` and 6 `neighbourhoods.city-where-to-stay`.
- **Live Atlas URLs that are not part of FINAL: 620.**
  - 486 cohort pages: all 250 of cohort 001 and 236 of cohort 002. The two old cohorts were built from the earlier cohort universe (country cost of living, salaries, rankings, tools, holidays, best-time, rent inflation, sport season, and 26 where-to-stay pages), not from the 1M pipeline, so their families are not in FINAL under the same names.
  - 134 Atlas URLs outside any cohort: 123 legacy city-month, 9 directory, 2 hubs.
- **Duplicate counting risk:**
  1. Do not subtract 1,500 from 1,002,362. Only 1,014 of the live pages are FINAL rows; the correct remainder is 1,001,348.
  2. 60 live cohort 002 pages cover the same entity, in the same language, as a FINAL row in a different family:
     - 25 `events.subdivision-holidays` overlap `pulse.subdivision-holidays`;
     - 6 `events.country-holidays` overlap `pulse.country-holidays`;
     - 29 `sport.city-season` overlap `sport.city-activity`.
     Publishing those FINAL rows later would create a second page on the same entity, so they must be de-duplicated against the live pages first.
  3. The 123 legacy city-month URLs are per city per month; FINAL `weather.city-month` is per city. Cities that appear in both (Tokyo, Rome and others) would compete with each other if published in the same language.

## Corrections to earlier reports

| earlier figure | current figure | what changed |
|---|---|---|
| cohort 003 at 226 indexed / 609 unknown (2026-10-22) | 360 / 197 | it was correct for that day; Google kept crawling |
| "1,450 submitted" vs 1,749 | 1,695 | Google re-read `en-climate` and `de-climate`; the remaining 54 are `it-climate` and `ro-regions` |
| "the 263 = 204 discovered + 59 unknown" | 202 + 61 | the same 263 URLs; the split moves between inspections without any crawl |
| "the Pacific-day quota of 2,000" | rolling 24 hours | today's 12:37 run was refused after 121 URLs while yesterday's 1,500 were still inside the window |

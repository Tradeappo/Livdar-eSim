# What every file in this folder is

Date: 2026-09-28. **Ahrefs Advanced ends 8 October 2026.**

Read [`FINAL-REPORT.md`](FINAL-REPORT.md) first for the findings. This file is the index: what each
file holds, and critically **which files can never be regenerated** once access ends.

## The three columns that matter

| Marker | Meaning |
| --- | --- |
| **FROZEN** | Came from Ahrefs. **Cannot be recreated after 8 October.** Treat as an archive. |
| **RENEWABLE** | Comes from the repo, production, or GSC. Can be regenerated any time. |
| **PENDING** | Not captured yet. Needs a signed-in human, or a crawl that has not run. |

---

## Start here

| File | Status | What it holds |
| --- | --- | --- |
| [`FINAL-REPORT.md`](FINAL-REPORT.md) | | The entry point. Findings organised as Site Audit, Rank Tracker, Brand Radar, Backlinks, Competitors, Ahrefs, GSC, Candidate Inventory, plus the five things only a signed-in human can do. |
| [`EXPORT-STATUS.md`](EXPORT-STATUS.md) | | Every dataset the brief asked for, with its outcome. Includes the empty ones, because several of those emptinesses are findings. |
| `FILE-INDEX.md` | | This file. |
| [`README.md`](README.md) | | The original snapshot note and plan details. |

## Site Audit

| File | Status | What it holds |
| --- | --- | --- |
| [`site-audit/CLASSIFIED-FINDINGS.md`](site-audit/CLASSIFIED-FINDINGS.md) | FROZEN | **The one to read.** All 179 checks classified REAL BUG / STALE-TRANSITIONAL / FIXED SINCE CRAWL / INFORMATIONAL / WARNING. 16 non-zero. Explains why Health Score 60 is not the current state. |
| `site-audit/all-179-checks-2026-09-28.json` | FROZEN | Raw: every check with its count, severity, category and change. The evidence behind the classification, including the 163 zeros. |
| `site-audit/livdar-site-audit-issues-2026-09-28-crawl.json` | FROZEN | The 2026-09-28 12:56 UTC crawl. |
| `site-audit/livdar-site-audit-issues-2026-09-27-crawl.json` | FROZEN | The day before, kept for the delta that proves which errors are transitional. |
| `site-audit/fresh-crawl-2026-09-28.md` | FROZEN | The first-pass analysis of that crawl. Superseded by CLASSIFIED-FINDINGS but kept as the record. |
| `site-audit/README.md` | | Folder note. |
| **a clean post-fix crawl** | **PENDING** | No API endpoint starts a crawl. Expected 2026-09-29 12:56 UTC, or trigger it by hand. See item 10 in USER-ACTIONS-REQUIRED. |

## Rank Tracker

| File | Status | What it holds |
| --- | --- | --- |
| [`rank-tracker/PASTE-READY.md`](rank-tracker/PASTE-READY.md) | | **The actionable one.** 125 keywords in nine country pastes, then 42 tag lists for bulk tagging. Built this way because per-keyword tagging would mean 82 separate pastes. |
| `rank-tracker/proposed-additions-2026-09-28.tsv` | | The 125 keywords with country, language, volume, KD, tags and target path. The source for PASTE-READY. |
| `rank-tracker/tracked-keywords-2026-09-28.tsv` | FROZEN | What was already being tracked before this work. |
| `rank-tracker/README.md` | | Folder note. |
| **the baseline itself** | **PENDING** | The API cannot create Rank Tracker keywords. **This is the most time-sensitive item in the whole package:** position history starts the day the keywords exist and cannot be backfilled. |

## Brand Radar

| File | Status | What it holds |
| --- | --- | --- |
| [`brand-radar/PASTE-READY.md`](brand-radar/PASTE-READY.md) | | **The actionable one.** 44 prompts in nine reports, plus the engine list to enable and the six tabs to export afterwards. |
| `brand-radar/proposed-prompts-2026-09-28.tsv` | | The 44 prompts with country, language, surface and competitors to track. |
| `brand-radar/livdar-chatgpt-2026-09-28.json` | FROZEN | Current state. This is where the finding that **every engine except ChatGPT is off on all six reports** comes from. |
| `brand-radar/ai-visibility-2026-09-28.md` | FROZEN | Reading of that state. |
| **the baseline itself** | **PENDING** | No create endpoint for reports or prompts. |

## Backlinks

| File | Status | What it holds |
| --- | --- | --- |
| [`backlinks/AUDIT-2026-09-28.md`](backlinks/AUDIT-2026-09-28.md) | FROZEN | **The one to read.** 1,021 all-time referring domains, 1,000 classified. Records two corrections to earlier beliefs: the links turned dofollow in August, and the IP-subnet evidence was inflated by Cloudflare. |
| [`backlinks/disavow-candidates-2026-09-28.txt`](backlinks/disavow-candidates-2026-09-28.txt) | | **998 domains in Google's disavow format. NOT SUBMITTED.** The two class B domains are at the end as inert comments. |
| `backlinks/refdomains-audit-2026-09-28.tsv` | FROZEN | All 1,000 domains with class, DR, traffic, links, dofollow count, lost count, first and last seen, TLD, Ahrefs spam flag, IP, and the reasons each was classified. The full working. |
| `backlinks/refdomains-all-time-2026-09-28.json` | FROZEN | Raw referring-domain rows, merged from two 500-row slices because the API caps a call at 500. |
| `backlinks/all-backlinks-top500-by-dr-2026-09-28.json` | FROZEN | Link-level rows with anchor, target URL, first and last seen. Anchor text had 831 em dashes replaced with hyphens to satisfy the project's dash rule, so anchors are faithful in wording but not byte-identical. |
| `backlinks/growth-timeline-2026-09-28.tsv` | FROZEN | New domains and dofollow links by month, 18 months. Shows the August dofollow switch and the September escalation. |
| `backlinks/anchor-clusters-2026-09-28.tsv` | FROZEN | **The 8 anchor clusters** with referring domains, links, dofollow count, spam flag and first seen. Resolves the 630 dofollow links into three deliberate bursts, the largest 516 links across 258 domains on 2026-09-17, and shows a new 151-domain cluster first seen 2026-09-27. |
| `backlinks/new-and-lost-2026-09-28.md` | FROZEN | New and lost, derived from the audit TSV rather than re-queried. **536 of 1,000 referring domains arrived in the last 30 days**, bringing 580 of the 630 dofollow links. 208 domains lost links, 317 links total, which is churn rather than recovery. |
| `backlinks/dofollow-domains-2026-09-28.csv` | FROZEN | First-pass dofollow list. |
| `backlinks/pbn-audit-2026-09-28.json` | FROZEN | First-pass network audit. |
| `backlinks/link-intersect-2026-09-28.md` | FROZEN | Link intersect against competitors. |
| `backlinks/refdomains-history-2026-07-01-to-2026-09-28.json` | FROZEN | Referring domain count over time. |
| `backlinks/README.md` | | **Carries a SUPERSEDED banner.** Its counts (316 domains, nofollow, no action) were true when written and are now wrong. Kept as the record of what was believed. |

## Competitors

| File | Status | What it holds |
| --- | --- | --- |
| [`competitors/COMPETITOR-INTELLIGENCE.md`](competitors/COMPETITOR-INTELLIGENCE.md) | FROZEN | Nine replicable patterns, starting with the proof across five markets that this niche is not authority-gated (DR 0 at position 8 in Poland, DR 6 at position 10 in the Netherlands). |
| [`competitors/PER-MARKET.md`](competitors/PER-MARKET.md) | FROZEN | **The second pass, and the more useful one.** The eleven families market leaders actually run, six of which need no external data. Contains both SERP-validation corrections and the France school-holidays finding. |
| [`competitors/absentify/TEARDOWN.md`](competitors/absentify/TEARDOWN.md) | FROZEN | absentify's model in ten rules: no year in any URL against 87.4% year-keyword traffic, the region layer out-earning the country index 10.5 to 1, links arriving after traffic rather than before. |
| `competitors/market-leaders-2026-09-28.tsv` | FROZEN | 23 competitors across 8 markets with DR, traffic, keywords, keywords in top 3, pages, family set. |
| `competitors/families-observed-2026-09-28.tsv` | FROZEN | 15 content families with data requirement, best evidence URL, evidence traffic, sample keyword and volume, and feasibility for Livdar. **The most directly actionable table in the folder.** |
| `competitors/german-holiday-competitors-2026-09-28.tsv` | FROZEN | 19 German competitors with traffic per page computed. |
| `competitors/feiertage-deutschland-top-pages-2026-09-28.tsv` | FROZEN | 30 pages of the efficiency leader (1,441 traffic per page), labelled by family. Shows the three-family structure. |
| `competitors/absentify/top-pages-2026-09-28.json` | FROZEN | 150 pages with traffic, keywords, top keyword, position, referring domains. |
| `competitors/absentify/history-2026-09-28.tsv` | FROZEN | 25 months of traffic, cost, pages and refdomains. The evidence that links followed traffic. |
| `competitors/absentify/markets-2026-09-28.tsv` | FROZEN | 17 countries with a column for whether Livdar covers each. |
| `competitors/absentify/crawled-urls-sample-2026-09-28.json` | FROZEN | 500 crawled URLs. The evidence that no URL contains a year. |
| `competitors/absentify-2026-09-28.md` | FROZEN | First-pass note, superseded by TEARDOWN. |
| `competitors/README.md` | | Folder note. |

## Organic, keywords and the candidate inventory

| File | Status | What it holds |
| --- | --- | --- |
| [`organic/CANDIDATE-INVENTORY.md`](organic/CANDIDATE-INVENTORY.md) | FROZEN | **The one to read before any cohort 003 decision.** Two passes. The second adds six families needing no data, and two SERP-validation corrections in opposite directions. |
| `organic/candidate-inventory-FINAL-2026-09-28.tsv` | FROZEN | **35 rows.** surface, family, keyword, market, language, volume, KD, CPC, whether the SERP has an AI Overview, weakest page-one competitor and its backlinks, data feasibility, monetization fit, scalability, current coverage, GSC evidence, notes. |
| `organic/published-page-demand-2026-09-28.tsv` and `.json` | FROZEN | Ahrefs demand for all 500 live pages. The Ahrefs half of the GSC join. |
| `organic/cohort-candidates-2026-09-28.tsv` | FROZEN | Earlier candidate pass. |
| `organic/new-families-2026-09-28.md` | FROZEN | Earlier family exploration. |
| `organic/README.md` | | Folder note. |

## Content gap

| File | Status | What it holds |
| --- | --- | --- |
| [`content-gap/README.md`](content-gap/README.md) | FROZEN | **Why a normal content gap run is impossible here** (Livdar ranks for nothing, so the tool would return "every competitor keyword"), and the inverted method used instead. Carries the headline: of 1,481,400 monthly searches in the Polish leader's top 50, Livdar has a surface for **7.7%**. |
| `content-gap/pl-kalendarzswiat-2026-09-28.tsv` | FROZEN | 50 keywords with volume, KD, CPC, the competitor's traffic and position, its URL path, the family, and whether Livdar has that family. Poland chosen because it is Livdar's third-largest demand market against one of the weakest SERPs measured. |

## Keywords Explorer

| File | Status | What it holds |
| --- | --- | --- |
| [`keywords-explorer/README.md`](keywords-explorer/README.md) | FROZEN | The verdict breakdown, the three rejections with reasons, and the calibration lesson that next-year keywords understate a family roughly fifteenfold. |
| `keywords-explorer/research-2026-09-28.tsv` | FROZEN | **44 keywords** across DE, AU, CA, FR with volume, KD, CPC, global volume, whether the SERP carries an AI Overview, family, and a **verdict**: 25 BUILD, 7 CAUTION, 3 REJECT, 1 PROSPECT, 8 NOTE. The verdict column exists because volume and KD alone have misled this project twice, in both directions. |

## SERP snapshots

| File | Status | What it holds |
| --- | --- | --- |
| `serp/serp-snapshots-2026-09-28.tsv` | FROZEN | **40 rows.** The live first page for one Pulse keyword in DE, NL, PL, IT and JA, with DR, page-level referring domains, URL Rating and page traffic per result. AI Overview and People Also Ask rows are kept deliberately, with null metrics, because in three markets they occupy the top slots. |
| `serp/README.md` | | Why these were captured: KD is not to be trusted without SERP validation, and this dataset is the proof. |

## Livdar's own Ahrefs profile

| File | Status | What it holds |
| --- | --- | --- |
| [`livdar/historical-baseline-2026-09-28.md`](livdar/historical-baseline-2026-09-28.md) | FROZEN | **Ahrefs holds no organic history for livdar.com at all.** Four history endpoints, 0 rows each, against 25 rows each for absentify over the same window. Explains why GSC is the only instrument that will see the Atlas launch. |
| `livdar/site-explorer-2026-09-28.json` | FROZEN | Domain snapshot. |
| `livdar/crawled-pages-2026-09-28.json` | FROZEN | Pages Ahrefs has crawled. |
| `livdar/subscription-2026-09-28.json` | FROZEN | Plan, limits and usage at snapshot time. |

## GSC joined with Ahrefs

| File | Status | What it holds |
| --- | --- | --- |
| [`gsc/GSC-X-AHREFS.md`](gsc/GSC-X-AHREFS.md) | | **The one to read.** Why all 500 pages read `out_of_window` rather than zero, and the internal-link imbalance that needs no Google data to see. |
| `gsc/gsc-x-ahrefs-joined-2026-09-28.tsv` and `.json` | **HYBRID** | **500 rows, 21 columns.** Ahrefs columns are FROZEN; GSC columns are RENEWABLE. Re-running `scripts/atlas/atlas-monitor.mjs` against a newer import refreshes the Google side while the demand side keeps its 2026-09-28 values, so the join stays useful indefinitely. |
| `gsc/README.md` | | Folder note. |

## Production and monitoring

All RENEWABLE: these come from the repo and the live site, not from Ahrefs.

| File | What it holds |
| --- | --- |
| `production/atlas-monitor-2026-09-28.json` | The join output including `atlas_serving_since`, `gsc_window_reaches_serving_pages` and `signal_counts`. Regenerate with `node scripts/atlas/atlas-monitor.mjs`. |
| `production/internal-links-2026-09-28.json` | The internal link graph built from page models rather than from the contaminated crawl. |
| `production/international-2026-09-28.json` | Per-market checks across 11 markets: robots, sitemap index, trailing slash, x-default. |
| `production/production-verification-after-fix-2026-09-28.json` | The 500-URL verification after the 404 fix. |
| `production/sitemap-url-counts-2026-09-28.tsv` | URLs per sitemap. |
| `production/sitemap-url-status-2026-09-28.tsv` | HTTP status per sitemap URL. |
| `production/README.md`, `international-README.md`, `monitoring-README.md` | Folder notes. |

## The other five sites

| File | Status | What it holds |
| --- | --- | --- |
| `other-sites/checkpoint-2026-09-28.json` | FROZEN | Ahrefs checkpoint for all six projects, so the other five have a record too. |
| `other-sites/brand-radar-reports-2026-09-28.json` | FROZEN | Brand Radar report state across projects. |
| `other-sites/README.md` | | Folder note. |

## IndexNow

| File | Status | What it holds |
| --- | --- | --- |
| `indexnow/README.md` | RENEWABLE | The submission record. 615 URLs accepted with HTTP 200 on 2026-09-28. Done, nothing outstanding. |

---

## What to monitor after 8 October

Ahrefs is the only instrument here that sees the backlink graph and competitor traffic. Those go.
What remains is enough if it is used.

| Cadence | Check | Where | Why |
| --- | --- | --- | --- |
| **Weekly** | Atlas impressions, clicks, position by surface and language | GSC via the existing Actions workflow, then `scripts/atlas/atlas-monitor.mjs` | The only instrument that will see the launch. Ahrefs never will. |
| **Monthly** | **Manual actions** | GSC | The signal that decides whether the disavow file gets submitted. Empty means leave it alone. |
| **Monthly** | Links report, total referring domains | GSC | Coarser than Ahrefs, free, and enough to spot further escalation of the spam campaign. |
| **Monthly** | Homepage performance specifically | GSC | The only backlink target: 1,784 links point at two homepage URLs and none at any Atlas page. |
| **Weekly through Q1 2027** | Pulse impressions | GSC | Where the three-month publish-to-peak lag and the seasonal peak both land. |
| **Per deploy** | `npm test`, `npm run dashcheck`, `verify-live`, `international-check` | repo | 394 tests. These caught what Ahrefs could not. |
| **When it exists** | Rank Tracker positions | Ahrefs, while it lasts | Only if the 125 keywords get added before expiry. |

One instrument deserves its own line. Ahrefs reported **"missing reciprocal hreflang: 0"** while 120
pages had genuinely incomplete hreflang sets, because the sets were internally consistent and merely
short. `scripts/atlas/verify-live.mjs` compares served hreflang against `alternatesFor(model)` and
found it. **A zero from Ahrefs means "no contradiction", not "complete".** Keep `verify-live` in the
deploy path after Ahrefs is gone.

## What cannot be recovered after 8 October, in one list

Everything marked FROZEN above. Concretely: competitor traffic and history, competitor top pages,
the referring domain graph with DR and spam flags, SERP snapshots with page-level link counts,
keyword volumes and difficulty, and the Site Audit issue data. If any of it matters later, it
matters as these files, because there will be no way to ask again.

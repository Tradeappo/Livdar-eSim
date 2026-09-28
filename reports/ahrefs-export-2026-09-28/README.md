# Ahrefs export, 2026-09-28

A snapshot taken because the Ahrefs Advanced cycle resets on **2026-10-08**.
No older export was overwritten; this directory did not exist before today,
and it is the first dated snapshot in the repository.

## Plan

| | |
| --- | --- |
| Plan | Advanced, billed monthly |
| Usage resets | 2026-10-08T00:00:00Z |
| Workspace limit | 2,000,000 units |
| Used at the start of this session | 1,035,757 |
| Spent | 35,567 |
| Remaining | 928,676 |
| API key expires | 2036-09-05 |

## What is in here

| Folder | Contents |
| --- | --- |
| `livdar/` | Subscription state, Site Explorer metrics for today and seven days ago, crawled pages |
| `organic/` | Why the organic reports are empty, **and the demand of all 500 published pages**, plus 54 measured cohort candidates |
| `rank-tracker/` | All 125 tracked keywords with position and volume, the surface coverage audit, and 125 proposed additions |
| `competitors/` | Why the competitor reports are empty, and where the comparative data that does exist lives |
| `backlinks/` | Aggregate counts, the weekly referring domain history, and what the 740 domains actually are |
| `site-audit/` | The full 179 issue rows from the crawl of the 27th, and what the health score of 43 turned out to mean |
| `brand-radar/` | Livdar against Airalo and Holafly on ChatGPT, 12 prompts |
| `gsc/` | Exactly which credentials are missing and what is therefore unknown |
| `other-sites/` | Checkpoint for foiauto, certificatconstatator, meniudigital, cartela, numaranglia. No changes made |
| `serp/` | **Six SERPs read, one per surface. Which surfaces face thin programmatic pages and which face Reddit and publishers** |
| `indexnow/` | The submission: 615 URLs accepted with HTTP 200, and the three reasons it had never worked before |
| `production/monitoring-README.md` | **The joined dataset for all 500 pages, the internal link graph, and the finding that 3 per cent of the Atlas can reach the shop** |
| `organic/new-families-2026-09-28.md` | Four candidate families found, and the two that did not survive a SERP check |
| `production/` | **The 404 regression: how it was found, what caused it, and the verification after the fix.** The per market international check |

## The three things worth reading first

**`production/README.md`.** 497 of the 500 Atlas URLs were returning 404 and
had been for most of the week since launch. The cohort manifests were not on
the Next.js file tracing list, so the build prerendered every page correctly
and then each revalidation, a day later, found no manifest and cached a 404 in
its place. Fixed, merged and verified: 740 of 740 sitemap URLs return 200 and
`verify-live.mjs` passes 500 of 500. That is also the answer to whether there
are early signals from the launch. There was nothing to signal.

**`serp/README.md`.** Search difficulty does not tell you which surfaces Livdar
can win. On `feiertage nrw 2026`, 202,000 searches, positions 5 to 8 are held
by pages with 0 or 1 backlinks and URL Rating 0 to 4. On `best time to visit
japan`, 51,000 searches at KD 3, position 2 is Reddit and the rest is Conde
Nast Traveler and travel publishers. Pulse and Work are winnable without links;
Climate is not, despite a mean KD of 1.5. And an AI overview appeared on every
SERP read.

**`organic/published-page-demand-2026-09-28.tsv`.** All 500 published pages
measured against Ahrefs demand, which had never been done. They target
**2,352,000 monthly searches**. Pulse is 11 per cent of the pages and 51 per
cent of the demand; Move is 39 per cent of the pages and 2.8 per cent. Cohort
002 is worth two and a half times cohort 001 on the same page count. The
analysis is in `reports/atlas-cohort-candidates-2026-09-28.md`.

## What is not in here, and why

Everything that needs Google Search Console, Google Analytics, Bing Webmaster
Tools or an authenticated browser. `gsc/README.md` lists each missing
credential by name and says what is therefore unknown rather than reporting it
as zero. Two items in `reports/USER-ACTIONS-REQUIRED.md` would unblock it.

Full referring domain and backlink rows were not pulled. 740 domains at 17
units a row is affordable, but reading the top 40 by Domain Rating and the top
25 by traffic settled the question the export existed to answer: the profile
is nofollow backlink spam from traffic-free domains, and there is nothing in it
to preserve. `backlinks/README.md` says so with the evidence and the exact
calls to reproduce it.

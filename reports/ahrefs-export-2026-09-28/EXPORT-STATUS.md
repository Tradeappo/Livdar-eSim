# Export status: what was captured, what is empty, and why

Date: 2026-09-28. Every item the brief listed under section 6, with its outcome.

## Captured with data

| Dataset | File | Rows |
| --- | --- | --- |
| Referring domains, all time | `backlinks/refdomains-all-time-2026-09-28.json` | **1,000** of 1,021 |
| Referring domains, enriched and classified | `backlinks/refdomains-audit-2026-09-28.tsv` | 1,000 |
| All backlinks, link level | `backlinks/all-backlinks-top500-by-dr-2026-09-28.json` | 500 (API caps a call at 500) |
| Backlink growth timeline | `backlinks/growth-timeline-2026-09-28.tsv` | 18 months |
| Refdomains history | `backlinks/refdomains-history-2026-07-01-to-2026-09-28.json` | |
| Anchors | `backlinks/README.md` and the link-level export | 52 distinct |
| Best pages by links | see below, 2 rows only | 2 |
| Disavow candidates | `backlinks/disavow-candidates-2026-09-28.txt` | 998 |
| Link intersect | `backlinks/link-intersect-2026-09-28.md` | |
| Site Audit, all 179 checks | `site-audit/all-179-checks-2026-09-28.json` | 179 |
| Site Audit issues, two crawls | `site-audit/livdar-site-audit-issues-2026-09-2{7,8}-crawl.json` | |
| Crawled pages | `livdar/crawled-pages-2026-09-28.json` | |
| Site Explorer snapshot | `livdar/site-explorer-2026-09-28.json` | |
| GSC joined with Ahrefs | `gsc/gsc-x-ahrefs-joined-2026-09-28.{tsv,json}` | **500** |
| Published page demand | `organic/published-page-demand-2026-09-28.{tsv,json}` | 500 |
| Candidate inventory | `organic/candidate-inventory-FINAL-2026-09-28.tsv` | 26 |
| SERP snapshots, 5 markets | `serp/serp-snapshots-2026-09-28.tsv` | 40 |
| absentify top pages | `competitors/absentify/top-pages-2026-09-28.json` | 150 |
| absentify crawled URLs | `competitors/absentify/crawled-urls-sample-2026-09-28.json` | 500 |
| absentify history | `competitors/absentify/history-2026-09-28.tsv` | 25 months |
| absentify markets | `competitors/absentify/markets-2026-09-28.tsv` | 17 |
| German holiday competitors | `competitors/german-holiday-competitors-2026-09-28.tsv` | 19 |
| feiertage-deutschland top pages | `competitors/feiertage-deutschland-top-pages-2026-09-28.tsv` | 30 |
| Rank Tracker, tracked keywords | `rank-tracker/tracked-keywords-2026-09-28.tsv` | |
| Rank Tracker, prepared additions | `rank-tracker/proposed-additions-2026-09-28.tsv` | **125** |
| Brand Radar, current state | `brand-radar/livdar-chatgpt-2026-09-28.json` | |
| Brand Radar, prepared prompts | `brand-radar/proposed-prompts-2026-09-28.tsv` | **44** |
| Other five sites checkpoint | `other-sites/checkpoint-2026-09-28.json` | 6 projects |
| Production verification | `production/` | 8 files |

## Empty, and the emptiness is the finding

| Dataset | Rows | Why |
| --- | --- | --- |
| `site-explorer-metrics-history` | **0** | Ahrefs holds no organic history for livdar.com |
| `site-explorer-keywords-history` | **0** | same |
| `site-explorer-pages-history` | **0** | same |
| `site-explorer-domain-rating-history` | **0** | same |
| `site-explorer-broken-backlinks` | **0** | No backlink points at a broken Livdar URL. Genuinely good news. |
| `site-explorer-linked-domains` | **0** | Livdar links out to no external domain that Ahrefs records |
| Organic keywords, top pages, top subfolders, top countries, organic competitors, competing domains | **0** | All downstream of having no organic rankings |
| New and lost keywords, position movements | **0** | same |

The same four history endpoints return 25 monthly rows each for absentify.com over the same
window, so this is the state of the site in Ahrefs' index, not a query mistake. Full reasoning in
`livdar/historical-baseline-2026-09-28.md`.

**The consequence is the important part: Ahrefs will not show the Atlas launch before this
subscription expires, and GSC is the only instrument that will.**

## Best pages by backlinks: the whole result is two rows

| URL | Referring domains | Links | Dofollow | Nofollow | URL Rating | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `https://livdar.com/` | **1,019** | 1,065 | 318 | 747 | **0.0** | 307 |
| `https://www.livdar.com/` | 726 | 747 | 318 | 429 | **0.0** | 308 |

**Two URLs on the entire domain have a single backlink between them, and both are the homepage.
No Atlas page has any.** That is why internal linking is very nearly the only ranking input this
project controls, and why the imbalance in `gsc/GSC-X-AHREFS.md` matters as much as it does.

Both homepage variants carry a URL Rating of **0.0** despite 1,019 referring domains, which is
Ahrefs declining to pass authority through a graph it has flagged as spam 801 times.

## Not captured, and blocked rather than skipped

| Item | Blocker |
| --- | --- |
| **Fresh Site Audit crawl** | No API endpoint starts a crawl. Site Audit is read-only: projects, issues, page-explorer, page-content. UI steps in `site-audit/CLASSIFIED-FINDINGS.md`. Next scheduled crawl 2026-09-29 12:56 UTC. |
| **125 Rank Tracker keywords added** | The Ahrefs API has no endpoint that creates Rank Tracker keywords. Prepared as a TSV for paste-in. |
| **44 Brand Radar prompts added** | Same. No create endpoint for reports or prompts. Prepared as a TSV. |
| **Google AI Overviews enabled in Brand Radar** | UI-only setting. All engines except ChatGPT are `off` on all six reports. |
| Portuguese and forward-year Italian SERPs | Ahrefs returned no data for `feriados 2027` (pt) or `giorni festivi 2027` (it) |

All five are recorded in `../USER-ACTIONS-REQUIRED.md` with the exact steps.

## Credits

Read from `subscription-info-limits-and-usage`, which is free:

| | |
| --- | --- |
| Subscription | Advanced, billed monthly |
| Workspace limit | 2,000,000 units |
| Workspace used | **1,128,843** |
| **Remaining** | **871,157** |
| Usage resets | **2026-10-08** |

The reset date is the day after the subscription ends, so the remaining 871,157 units cannot be
carried forward. Anything that could still change a decision should be spent before 7 October;
after that the allowance and the access both go.

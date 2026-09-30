# Competitor intelligence, frozen

Everything here was pulled from Ahrefs while the subscription was live. Once it
lapses none of it can be regenerated, so this file is an index with the findings
inline, and the raw exports stay where they are.

## The competitor set

Held in `reports/ahrefs-export-2026-09-28/competitors/`:

| File | What it holds |
|---|---|
| `COMPETITOR-INTELLIGENCE.md` | the full teardown: who ranks, on what, and the replicable pattern behind it |
| `PER-MARKET.md` | competitor profile per market, in local language |
| `market-leaders-2026-09-28.tsv` | the leaders by market with their metrics |
| `families-observed-2026-09-28.tsv` | which families competitors actually run, observed rather than assumed |
| `absentify-2026-09-28.md` + `absentify/` | the deepest teardown: a full programmatic model reverse-engineered |
| `german-holiday-competitors-2026-09-28.tsv` | the DE holiday vertical, Livdar's most directly contested space |
| `feiertage-deutschland-top-pages-2026-09-28.tsv` | top pages of the leading DE holiday site, the template to beat |

`reports/scale-universe-2026-09-29/COMPETITOR-UNIVERSE.md` holds the wider universe,
and `SERP-WEAKNESS-MAP.md` in the same folder maps where incumbents are thin.

## Livdar's own profile, as of the freeze

In `reports/ahrefs-export-2026-09-28/livdar/`: `site-explorer-2026-09-28.json`,
`historical-baseline-2026-09-28.md`, `crawled-pages-2026-09-28.json`. The historical
baseline is the one that matters most — after expiry there is no way to reconstruct
what the profile looked like before the scale programme started, and that is the
before-picture for every future comparison.

## Backlinks and referring domains

`reports/ahrefs-export-2026-09-28/backlinks/` is the most irreplaceable folder in the
repository. Ahrefs is the only source here that a free tool substitutes badly for:

- `refdomains-all-time-2026-09-28.json` and `refdomains-audit-2026-09-28.tsv` — the
  full referring-domain set with metrics
- `all-backlinks-top500-by-dr-2026-09-28.json` — the top 500 links by DR
- `anchor-clusters-2026-09-28.tsv` — anchor distribution, which is how an over-
  optimisation problem shows up
- `disavow-candidates-2026-09-28.txt` — the audited disavow list, ready to file
- `pbn-audit-2026-09-28.json` — the PBN and link-scheme audit
- `link-intersect-2026-09-28.md` and `new-and-lost-2026-09-28.md` — the gap analysis
  and the churn
- `growth-timeline-2026-09-28.tsv`, `refdomains-history-*.json` — the trend
- `AUDIT-2026-09-28.md` — the conclusions drawn from all of it

`link-opportunities/prospects-from-competitor-profiles-2026-09-29.tsv` holds the
prospect list, built from real competitor profiles rather than a wishlist.

## Keyword and content gaps

- `content-gap/pl-kalendarzswiat-2026-09-28.tsv` — the PL gap against the leading
  Polish calendar site
- `organic/published-page-demand-2026-09-28.tsv` and `.json` — demand against every
  published page, which is what the LIVE_SECONDARY set was built from
- `organic/candidate-inventory-FINAL-2026-09-28.tsv`, `cohort-candidates-*.tsv`,
  `new-families-2026-09-28.md` — the candidate pipeline as Ahrefs saw it
- `keywords-explorer/research-2026-09-28.tsv` — the Keywords Explorer working set

## Brand and AI visibility

`brand-radar/` holds `ai-visibility-2026-09-28.md`, `livdar-chatgpt-2026-09-28.json`
and `proposed-prompts-2026-09-28.tsv`. Brand Radar has no free substitute at all, so
this snapshot is the entire AI-mention baseline. `PASTE-READY.md` carries the prompt
set as configured.

## Rank Tracker configuration

`rank-tracker/` holds `tracked-keywords-2026-09-28.tsv` (what was tracked),
`proposed-additions-2026-09-28.tsv` and `PASTE-READY.md`. The live configuration as of
the last pass is in `reports/rank-tracker-2026-09-29/`: 705 keywords, 500 LIVE_PRIMARY
covering every live page one-to-one, zero cannibalisation groups.

**Rank Tracker was not changed in this session.** If the subscription lapses the
configuration is reproducible from `PASTE-READY.md` into whatever tool replaces it.

## The SERP snapshots

`serp/` plus the frozen, classified set in `08-SERP-EVIDENCE.csv` (47 SERPs). The
classifications those SERPs produced are what every family verdict rests on, which is
why they are frozen as data and not just as prose.

## What a successor should take from this

The competitor work produced one transferable conclusion: in the families Livdar can
win, the incumbents are beatable on DR. A DR 13 page takes 2,148 monthly clicks at
position 5 for `restaurants lincoln` while TripAdvisor at DR 91 takes 337. A DR 7 page
holds position 3 in property. A DR 33 page with zero referring domains takes 18,104 in
attraction tickets. The families where that is *not* true are the ones already
classified `BRAND_OWNED_PLUS_SOCIAL`, `AGGREGATOR_LOCKED` or `SERP_FEATURE_SUPPRESSED`
in `08-SERP-EVIDENCE.csv`, and those classifications should be treated as settled.

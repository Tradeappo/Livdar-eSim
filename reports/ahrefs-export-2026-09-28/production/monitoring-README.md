# The monitoring system, 2026-09-28

One dataset for the 500 live pages rather than isolated reports:
`atlas-monitor-2026-09-28.json`, built by `scripts/atlas/atlas-monitor.mjs`.

One row per page carrying what it targets, what Ahrefs says that is worth, how
well internally linked it is, and what Google is doing with it.

## Google's side is null, and that is recorded as unknown rather than zero

`gsc_source: "not configured: no Search Console credential in this
environment"`.

Checked directly rather than assumed:

- `npm run gsc:check` → `configured: false`, missing `GSC_PROPERTY` and
  `GOOGLE_APPLICATION_CREDENTIALS`.
- The Ahrefs `gsc-*` endpoints exist on the Advanced plan and would answer
  every question in this section. Queried against project 10422446 for
  2026-09-21 to 28 and again for 2026-06-01 to 28: **"No GSC data available for
  the requested date range"** both times. So the Ahrefs project has no Search
  Console connection, which is made in the Ahrefs interface by a signed in
  account.

So every one of the 500 pages reads `signal: "unknown"` and **none reads
`"none"`**. The distinction is the reason the file exists: "no impressions
recorded" and "we cannot see impressions" lead to opposite decisions, and
collapsing them into a zero would have manufactured a finding.
`tests/atlas-monitor.test.mjs` asserts this cannot drift.

The columns populate the moment a credential exists, with no change to the
script: `node scripts/atlas/atlas-monitor.mjs --gsc <export>`.

## What it can answer today

The priority list, which is the whole set today because Google's numbers are
absent, sorted by demand with nothing to show for it:

| Demand | KD | Internal links in | Page |
| --- | --- | --- | --- |
| 254,000 | 43 | 11 | /pl/kalkulatory/kalkulator-wynagrodzen/ |
| 202,000 | 1 | 9 | /de/feiertage/nordrhein-westfalen/ |
| 181,000 | 0 | 8 | /fr/jours-feries/france/ |
| 149,000 | 2 | 12 | /de/feiertage/bayern/ |
| 148,000 | 69 | 29 | /en/tools/salary-calculator/ |
| 95,000 | 3 | 7 | /nl/feestdagen/nederland/ |
| 90,000 | 12 | 19 | /de/feiertage/deutschland/ |
| 88,000 | 49 | 32 | /de/rechner/gehaltsrechner/ |
| 75,000 | 0 | 12 | /de/feiertage/baden-wuerttemberg/ |
| 70,000 | 0 | 8 | /de/feiertage/hessen/ |

These ten are what to watch first when Search Console is connected. Six of the
ten are German or French holiday pages at difficulty 0 to 2.

## Internal linking: checked, and healthy

`internal-links-2026-09-28.json`, from `scripts/atlas/internal-links.mjs`.

Built from the page models rather than from Ahrefs Site Audit, because the
Site Audit crawl of 2026-09-27 ran while 473 of these pages were answering 404
and its numbers for the Atlas are therefore meaningless.

| | |
| --- | --- |
| Internal links between Atlas pages | **4,454** |
| Orphans, 0 incoming | **0** |
| Pages with 1 or fewer incoming | **0** |
| Fewest incoming on any page | **2** |

Mean incoming by surface: tools 18.32, pulse 7.80, climate 7.38, sport 7.24,
areas 7.22, work 6.78, stay 6.60, move 5.95.

**No internal linking defect.** The thinnest linked pages are all low demand,
and every page in the top 15 by demand has between 4 and 32 incoming links. The
weakest ratio is `/en/tools/cost-of-living-comparison/` at 49,000 demand and 4
incoming, which is a minor opportunity rather than a problem.

## The finding that was not expected: the Atlas cannot reach the shop

**16 of 500 Atlas pages, 3 per cent, link to an eSIM page.** 16 links to 16
distinct eSIM URLs, and those are the only links leaving the Atlas at all.

Broken down by locale:

| Locale | Atlas pages | Linking to an eSIM page |
| --- | --- | --- |
| en | 100 | 10 |
| de | 72 | 6 |
| es | 64 | **0** |
| fr | 63 | **0** |
| it | 52 | **0** |
| pl | 42 | **0** |
| ja | 40 | **0** |
| pt | 40 | **0** |
| nl | 27 | **0** |

This is a coverage constraint, not a bug. The eSIM CTA only fires when a
matching eSIM destination is published in the page's own language, and the eSIM
site publishes **en, de and ro only**. So 328 Atlas pages in seven languages
have no commercial destination to send anyone to, and cannot have one until
either the eSIM site is localised or a different destination exists.

Put against the demand figures, that is **943,400 of the 2,352,000 monthly
searches, 40 per cent, sitting in languages with nothing to convert into.**

Call to action kinds across both slots on all 500 pages: tool 497, sibling 270,
cost 70, salary 46, ranking 38, holidays 34, **esim 16**, areas 12, season 11,
sport 5, rent 1.

Nothing was changed. This is a measurement, and it belongs in the cohort
decision rather than in a patch: a cohort that adds pages in pl, fr, es, nl, it,
ja or pt adds traffic that currently has nowhere to go.

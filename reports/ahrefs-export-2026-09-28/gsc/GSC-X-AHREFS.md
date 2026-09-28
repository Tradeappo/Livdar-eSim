# GSC joined with Ahrefs: what it says, and the one thing to act on

Date: 2026-09-28. Built by `scripts/atlas/atlas-monitor.mjs` from the newest import in
`data/atlas/gsc/`. No service account was recreated, no private key generated, no WIF touched.

Files: `gsc-x-ahrefs-joined-2026-09-28.tsv` and `.json`, 500 rows, 21 columns, one row per
published Atlas page.

## First, the honest answer about Google's numbers: there are none yet

Every one of the 500 pages reads **`out_of_window`**, not zero.

| | |
| --- | --- |
| GSC property | `sc-domain:livdar.com` |
| Window | 2026-08-29 to **2026-09-25** |
| Imported | 2026-09-28 18:53 UTC |
| Atlas published | **2026-09-25**, 20:00 UTC |
| 497 of 500 pages served 404 until | **2026-09-28, 12:32 UTC** |

Two separate reasons the window says nothing, and the second is the one that was nearly
missed:

1. The window **ends on** the publication day, so it contains about four hours of the Atlas,
   and Search Console lags two to three days on top.
2. **For the whole window, 497 of the 500 pages returned 404.** The cohort manifests were not
   traced into the serverless bundle. Google was shown 404s, not pages.

The import file itself attaches the note *"Search Console returned no row for this page in the
window, so it was shown to nobody"* to all 500 rows. **That sentence is true of the window and
false of the pages,** and reading it as a real zero would convert "not measured yet" into "500
pages failed". That is the single most expensive misreading available here, so the monitor now
gates on both dates and a test holds it:

- `atlas_serving_since` is `2026-09-28`, and a window must end strictly after it.
- `gsc_window_reaches_serving_pages` is `false`.
- `signal_counts.none` is **0**. No page is allowed to read as a measured zero.

**The first import that says anything about these pages covers 2026-09-28 onward and lands no
earlier than 2026-10-01.** That is inside the Ahrefs window and can still be captured; the
Ahrefs side of this join cannot be recaptured after 8 October, which is why the Ahrefs columns
are populated in full now.

### Consequently, unanswerable today

The brief asks for six things that need Google data to exist. Stating them as open rather than
answering them with zeroes:

| Question | Status |
| --- | --- |
| Pages with first impressions | **not yet measurable** |
| Pages with first clicks | **not yet measurable** |
| First ranking pages | **not yet measurable.** Ahrefs also shows no ranking for any Livdar URL except the brand term, and holds no organic history for the domain at all (see `../livdar/historical-baseline-2026-09-28.md`) |
| Low demand with good signal | **not yet measurable** |
| Fastest indexing surfaces | **not yet measurable** |
| High demand with zero signal | technically all 500, which makes the ranked list below the useful form |

## The finding that does not need Google: internal links point away from the demand

This is measurable today, entirely within Livdar's control, and it is wrong.

| Surface | Pages | % of pages | Ahrefs demand | % of demand | Internal links in | % of links | **Links per 1,000 demand** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **pulse** | 55 | 11.0% | **1,203,210** | **51.2%** | 429 | 9.7% | **0.36** |
| tools | 96 | 19.2% | 663,800 | 28.2% | 1,759 | 39.6% | 2.65 |
| climate | 24 | 4.8% | 190,600 | 8.1% | 177 | 4.0% | 0.93 |
| work | 58 | 11.6% | 132,700 | 5.6% | 393 | 8.9% | 2.96 |
| areas | 40 | 8.0% | 83,050 | 3.5% | 289 | 6.5% | 3.48 |
| **move** | **193** | **38.6%** | 65,680 | **2.8%** | **1,148** | **25.9%** | **17.48** |
| stay | 5 | 1.0% | 9,250 | 0.4% | 33 | 0.7% | 3.57 |
| **sport** | 29 | 5.8% | 3,710 | **0.2%** | 210 | 4.7% | **56.60** |

Totals: 2,352,000 demand, 4,438 internal links, 500 pages.

Read the last column. **Move receives 49 times more internal link support per unit of demand
than Pulse. Sport receives 157 times more.**

Put the other way: 193 Move pages chase 2.8% of the demand and absorb 25.9% of the internal
links, while 55 Pulse pages chase 51.2% of the demand on 9.7% of the links.

Why this matters more than it looks:

- Livdar has **no page-level backlinks worth anything** (1,784 spam links, all to the
  homepage, none to any Atlas page). Internal linking is not one ranking input among many
  here. It is very nearly the only one the project controls.
- The competitor work established that these SERPs are won without external links: a DR 0 page
  holds position 8 in Poland, and positions 6 and 8 on a 257,000-volume German term are held by
  pages with zero referring domains. Where external links are not the differentiator, internal
  ones carry proportionally more weight.
- Pulse is the strongest surface on three independent lines of evidence (51.2% of demand on 11%
  of pages; SERP weakness; absentify's and feiertage-deutschland.de's whole business model),
  and it is the worst supported.

This is a recommendation, not a change. Nothing was rebalanced, because doing so on the eve of
the first real measurement window would make the first clean GSC reading uninterpretable. The
right order is: capture the 2026-10-01 import as the baseline, then rebalance, then compare.

## Demand by language and market

Identical because each language maps to one market.

| Language | Market | Pages | Ahrefs demand | % | Internal links in |
| --- | --- | --- | --- | --- | --- |
| de | de-DE | 72 | **918,070** | 39.0% | 661 |
| en | en-US | 100 | 489,530 | 20.8% | 898 |
| pl | pl-PL | 42 | **334,670** | 14.2% | 365 |
| fr | fr-FR | 63 | 253,910 | 10.8% | 581 |
| es | es-ES | 64 | 135,570 | 5.8% | 567 |
| nl | nl-NL | 27 | 115,600 | 4.9% | 223 |
| it | it-IT | 52 | 44,480 | 1.9% | 462 |
| ja | ja-JP | 40 | 32,730 | 1.4% | 339 |
| pt | pt-BR | 40 | 27,440 | 1.2% | 342 |

German and English carry 59.8% of demand. **Polish is third at 14.2% on 42 pages**, which is
worth noting against the Polish SERP holding a DR 0 page at position 8: high demand, no
defence, and Livdar is present. Italian has 52 pages for 1.9% of demand, the weakest ratio.

## Demand by family

| Family | Pages | Ahrefs demand | Internal links in |
| --- | --- | --- | --- |
| `events.subdivision-holidays` | 28 | **728,920** | 239 |
| `tools.calculator` | 32 | 557,100 | 617 |
| `events.country-holidays` | 27 | **474,290** | 190 |
| `weather.country-best-time` | 24 | 190,600 | 177 |
| `work.country-salaries` | 58 | 132,700 | 393 |
| `neighbourhoods.city-where-to-stay` | 40 | 83,050 | 289 |
| `cost-of-living.country` | **193** | 65,680 | **1,148** |
| `tools.cost-comparison` | 10 | 51,340 | 175 |
| `tools.cost-calculator` | 5 | 39,380 | 180 |
| `tools.matcher` | 24 | 9,690 | 301 |
| `rents.country-inflation` | 5 | 9,250 | 33 |
| `rankings.index` | 25 | 6,290 | 486 |
| `sport.city-season` | 29 | 3,710 | 210 |

The two holiday families are 55 pages carrying 1,203,210 demand on 429 links. `cost-of-living`
is 193 pages carrying 65,680 on 1,148 links. The single sharpest sentence available from this
dataset: **`events.subdivision-holidays` carries eleven times the demand of
`cost-of-living.country` on a seventh of the pages and a fifth of the internal links.**

## Highest demand with nothing measured yet

The ranked head of the list. Full 500 rows in the TSV.

| Ahrefs volume | KD | Internal links in | Page |
| --- | --- | --- | --- |
| 254,000 | 43 | 11 | `/pl/kalkulatory/kalkulator-wynagrodzen/` |
| 202,000 | **1** | 9 | `/de/feiertage/nordrhein-westfalen/` |
| 181,000 | **0** | 8 | `/fr/jours-feries/france/` |
| 149,000 | **2** | 12 | `/de/feiertage/bayern/` |
| 148,000 | 69 | 29 | `/en/tools/salary-calculator/` |
| 95,000 | **3** | 7 | `/nl/feestdagen/nederland/` |
| 90,000 | 12 | 19 | `/de/feiertage/deutschland/` |
| 88,000 | 49 | 32 | `/de/rechner/gehaltsrechner/` |
| 75,000 | **0** | 12 | `/de/feiertage/baden-wuerttemberg/` |
| 70,000 | **0** | 8 | `/de/feiertage/hessen/` |

Seven of the top ten are Pulse pages at KD 0 to 12, and they carry 7 to 19 internal links each
while `/en/tools/salary-calculator/` at KD 69 carries 29 and `/de/rechner/gehaltsrechner/` at
KD 49 carries 32. **The pages with the easiest keywords and the highest demand have the least
internal support, and the hardest keywords have the most.**

A caution the brief is explicit about and which this table illustrates: those KD values of 0 to
3 are not permission to assume victory. KD is not to be trusted without SERP validation, and
validation has already rejected two families on exactly this basis (year-calendar head terms,
where a SERP page carried 55,463 backlinks at KD 2; and Climate, KD 1.5 with Reddit and Conde
Nast holding the results). What the SERP work **did** confirm is the regional modifier terms,
which is what these ten mostly are. See `../serp/serp-snapshots-2026-09-28.tsv`.

## The 21 columns

`path`, `surface`, `family`, `locale`, `market`, `cohort`, `entity`, `keyword`,
`ahrefs_volume`, `ahrefs_kd`, `ahrefs_cpc_cents`, `ahrefs_traffic_potential`, `ahrefs_ranks`,
`internal_links_in`, `internal_links_out`, `gsc_impressions`, `gsc_clicks`, `gsc_ctr`,
`gsc_position`, `gsc_indexed`, `signal`.

`signal` is one of `out_of_window`, `unknown`, `none`, `impressions`, `clicks`. Today all 500
are `out_of_window`. `gsc_indexed` is null for all 500 and will stay null: the Search Analytics
API reports impressions, not index state, and the Pages report is a separate import that is not
wired up.

## After Ahrefs expires

The Ahrefs columns in this file are a **permanent snapshot**, because they cannot be refreshed
after 8 October. The GSC columns refresh themselves through the existing GitHub Actions
workflow. So the join stays useful indefinitely: run `atlas-monitor.mjs` against a newer import
and the Ahrefs demand columns hold their 2026-09-28 values while the Google columns move.

Two things to do in the window that remains:

1. **Capture the import that covers 2026-09-28 onward**, expected 2026-10-01 or later. That is
   the first genuine baseline for the 500 and the only one that can be joined against live
   Ahrefs data. If it lands before 8 October, re-run this export.
2. Leave `SERVING_SINCE` in `atlas-monitor.mjs` alone. It is what stops a future reader
   mistaking the outage for a verdict.

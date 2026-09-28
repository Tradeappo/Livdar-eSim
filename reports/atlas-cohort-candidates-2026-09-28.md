# Candidate inventory for the next cohort, 2026-09-28

Inventory, not a cohort. Nothing here is built, approved or scheduled. It
exists so that the decision, when it is taken, is taken against measured
demand rather than against the shape of the last cohort.

Everything below was measured through Ahrefs Keywords Explorer on 2026-09-28,
before the plan resets on 8 October. No scraping, no Google, no DataForSEO.

## First, what the 500 published pages are actually worth

This is the measurement that should have existed before the launch and did
not. Every one of the 500 live pages has a target keyword; none of the page
models carried a volume. All 500 were measured, one call per market.

**The 500 published pages target 2,352,000 monthly searches.**

| Surface | Pages | Monthly volume | Mean KD | Pages at KD 5 or under |
| --- | --- | --- | --- | --- |
| **pulse** | 55 | **1,203,210** | 3.3 | 37 |
| tools | 96 | 663,800 | 10.0 | 56 |
| climate | 24 | 190,600 | 1.5 | 22 |
| work | 58 | 132,700 | 2.9 | 49 |
| areas | 40 | 83,050 | 3.4 | 33 |
| **move** | **193** | **65,680** | 1.0 | 161 |
| stay | 5 | 9,250 | 5.8 | 3 |
| sport | 29 | 3,710 | 10.5 | 19 |

Read the first and last rows together. **Pulse is 11 per cent of the pages
and 51 per cent of the demand. Move is 39 per cent of the pages and 2.8 per
cent of the demand.** Cost-of-living country pages are the largest thing the
Atlas has built and close to the smallest thing it has built.

| Market | Pages | Monthly volume |
| --- | --- | --- |
| DE | 72 | 918,070 |
| US | 100 | 489,530 |
| PL | 42 | 334,670 |
| FR | 63 | 253,910 |
| ES | 64 | 135,570 |
| NL | 27 | 115,600 |
| IT | 52 | 44,480 |
| JP | 40 | 32,730 |
| BR | 40 | 27,440 |

| Cohort | Pages | Monthly volume |
| --- | --- | --- |
| 001 | 250 | 675,300 |
| 002 | 250 | **1,676,700** |

Cohort 002 is worth two and a half times cohort 001 on the same page count.
Whatever the selection changed between them, it worked.

Concentration: **28 pages, 5.6 per cent of the set, carry 81 per cent of the
demand.** Another way to put it: 89 pages are both large (2,000 or more) and
easy (KD 10 or under), and they hold 1,525,900 searches between them. There
are no dead pages, though: every one of the 500 targets a keyword with
measurable volume.

The ten largest:

| Volume | KD | Market | Keyword | Page |
| --- | --- | --- | --- | --- |
| 254,000 | 43 | PL | kalkulator wynagrodzeń | /pl/kalkulatory/kalkulator-wynagrodzen/ |
| 202,000 | 1 | DE | feiertage nrw 2026 | /de/feiertage/nordrhein-westfalen/ |
| 181,000 | 0 | FR | jours fériés 2026 | /fr/jours-feries/france/ |
| 149,000 | 2 | DE | feiertage bayern 2026 | /de/feiertage/bayern/ |
| 148,000 | 69 | US | salary calculator | /en/tools/salary-calculator/ |
| 95,000 | 3 | NL | feestdagen 2026 | /nl/feestdagen/nederland/ |
| 90,000 | 12 | DE | feiertage 2026 | /de/feiertage/deutschland/ |
| 88,000 | 49 | DE | gehaltsrechner | /de/rechner/gehaltsrechner/ |
| 75,000 | 0 | DE | feiertage bw 2026 | /de/feiertage/baden-wuerttemberg/ |
| 70,000 | 0 | DE | feiertage hessen 2026 | /de/feiertage/hessen/ |

Six of the ten are German holiday pages at difficulty 0 to 2. Full data:
`reports/ahrefs-export-2026-09-28/organic/published-page-demand-2026-09-28.tsv`.

## Second, the candidates

54 measured candidates, none built. Full table with volume, KD, CPC, intent,
likely surface, likely family, entity and page type:
`reports/ahrefs-export-2026-09-28/organic/cohort-candidates-2026-09-28.tsv`.

| Surface | Candidates | Monthly volume | What the measurement says |
| --- | --- | --- | --- |
| pulse | 9 | 32,050 | The gap nobody noticed. See below. |
| safety | 9 | 25,970 | A surface that does not exist and has demand. |
| climate | 11 | 24,700 | Underbuilt at 24 pages against mean KD 1.5. |
| areas | 13 | 17,220 | City level works, contrary to the earlier finding. |
| sport | 7 | 790 | Confirmed weak. Do not extend. |
| move | 1 | 900 | Relocation intent, not cost-of-living. |
| stay | 1 | 700 | Still thin. |
| community | 3 | 120 | Confirmed empty. Do not build. |

### Pulse: Hamburg is not built and is worth 22,000 a month

`feiertage hamburg 2026`, **22,000 monthly searches at difficulty 0**, and
there is no page for it. So is `feiertage bremen 2026` at 5,500, also KD 0.
The German subdivision set covers eleven Länder and misses five, and two of
the missing five are among the largest single keywords available anywhere in
this inventory. `feiertage rheinland-pfalz 2026` is only 700 itself but
carries a traffic potential of 12,000.

This is the cheapest work in the document: the family is built, the data
pipeline is built, the template is built, and five entities are missing from
a list of sixteen. The same check should be run for Spanish comunidades,
Italian regioni and Polish voivodeships before anything else is considered.

### Safety: a surface with real demand and no pages

`is colombia safe` 5,600 at **KD 0**. `is brazil safe` 3,600 at **KD 0**.
`is south africa safe` 5,800, `is mexico safe` 4,200 with a traffic potential
of **105,000**, `is thailand safe` 3,500, `is egypt safe` 2,400 with a traffic
potential of 23,000. German too: `ist thailand sicher` 500 with a traffic
potential of 21,000.

Nine candidates, 25,970 searches. The earlier decision recorded Safety as
blocked, and it was blocked on sourcing, not on demand: writing a page that
tells somebody whether a country is safe needs a source that can be stood
behind, and that is the open question, not whether anybody is asking.

### Areas: city level is not blocked after all

The project recorded Stay and Areas as blocked at city level. On the demand
side that is wrong. `where to stay in rome` 3,700 at KD 4, `where to stay in
lisbon` 2,900 at KD 9, then Seoul, Athens, Singapore, Berlin, Istanbul, Dubai,
all between 600 and 1,800 and all at KD 0 to 5. German city districts too:
`wien bezirke` 1,500 and `frankfurt stadtteile` 1,300, both KD 0.

What was blocked was the neighbourhood facts for those cities, which is a
sourcing problem with a known shape. Thirteen candidates, 17,220 searches.

### Community: the earlier decision was right

`expat community madrid` returns **volume 0**. `expats in lisbon` is 80 and
`expats in berlin` is 40. Three candidates, 120 searches between them. There
is no Community surface to build, and this is now measured rather than
assumed.

### Sport: the earlier decision was right here too

The best Sport candidate in the set is `hiking near seattle` at 450. The rest
are 30 to 80. The 29 Sport pages already live carry 3,710 searches between
them, the lowest of any surface, at the highest mean difficulty of any
surface except tools. Seven candidates, 790 searches. Do not extend it.

### Taiwan

Taiwan has 15 keywords in the Rank Tracker, among them `esim 日本` at 32,000
and `esim 設定` at 18,000, and the Atlas publishes no `zh` locale at all. A
reader in Taiwan is served nothing. Adding a tenth locale is a larger
decision than adding entities to a family that exists, so it is recorded
here rather than proposed, with the observation that the demand is on the
eSIM side and the Atlas side is unmeasured.

## What this does not say

It does not say to scale. The brief is explicit and so is the data: the 500
pages have been reachable for a matter of hours. They were 404 for three of
the four days since they launched, so nothing has had the chance to rank, and
there is no performance signal to extrapolate from. See
`reports/ahrefs-export-2026-09-28/production/README.md`.

What the data does support, when a decision is taken, is a shape:

1. Finish the families that already work. Five German Länder, then the same
   audit for ES, IT and PL. Highest value per unit of work in the document.
2. Climate before anything new. 24 pages, mean KD 1.5, eleven measured
   candidates.
3. Safety only if a source can be stood behind.
4. Areas at city level only if the neighbourhood facts can be sourced.
5. Nothing more on Move, and nothing on Community.

And the thing worth saying plainly: the next cohort's value depends far more
on which entities are chosen than on how many. Cohort 002 beat cohort 001 by
two and a half times on identical page counts.

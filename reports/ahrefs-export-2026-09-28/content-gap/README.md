# Content gap, done the only way it can be done here

Date: 2026-09-28.

## Why this is not a normal content gap report

Ahrefs' Content Gap tool compares **your** ranking keywords against competitors'. Livdar ranks
for nothing except its brand term, and Ahrefs holds no organic history for the domain at all
(see `../livdar/historical-baseline-2026-09-28.md`). A normal content gap run would return
"every keyword the competitor has", which is true but useless.

So the gap was built the other way round: take a market leader's actual ranking keywords, group
them into families, and mark which families Livdar has a surface for. That answers the real
question, which is not "which keywords are we missing" but **"which whole families are we
missing"**.

## `pl-kalendarzswiat-2026-09-28.tsv`

`kalendarzswiat.pl`, the Polish market leader (DR 47, 446,932 monthly traffic, 6,470 keywords in
the top 3), top 50 keywords by traffic.

Poland was chosen deliberately: it is **Livdar's third-largest demand market** (334,670 monthly
searches across 42 pages) and its SERP is among the weakest measured anywhere, with a **DR 0 page
holding position 8**.

| Family | Keywords | Combined volume | Competitor traffic | Livdar has it |
| --- | --- | --- | --- | --- |
| named-holiday | 12 | 472,900 | 23,790 | **no** |
| year-calendar | 5 | 291,700 | 75,111 | **no** |
| trading-sundays | 3 | 207,700 | 13,616 | **no** |
| public-holidays | 5 | 113,400 | 27,162 | **yes** |
| today-page | 5 | 101,900 | 13,752 | **no** |
| moon-phases | 6 | 96,900 | 18,233 | **no** |
| name-days | 3 | 92,000 | 5,137 | **no** |
| month-calendar | 4 | 33,600 | 13,692 | **no** |
| date-calculator | 1 | 32,000 | 1,489 | **no** |
| working-time-per-year | 3 | 27,000 | 6,418 | **no** |
| school-calendar | 2 | 9,100 | 3,242 | **no** |
| printable-calendar | 1 | 3,200 | 1,339 | **no** |
| **total** | **50** | **1,481,400** | **203,081** | |

**Of 1,481,400 monthly searches in one competitor's top 50, Livdar has a surface for 113,400 of
it. That is 7.7%.**

The other 92.3% is not exotic. It is calendars, "what day is it", moon phases, name days, trading
Sundays and working-time tables: the things a calendar site is for.

## Two honest caveats about this table

**The family classifier is rough.** It assigns families by URL pattern, and the `named-holiday`
bucket is a catch-all that has swallowed things that do not belong there. `zachod slonca`
(sunset, 64,000) and `wrzesien` (September, 43,000) are sunrise/sunset and month-overview
families, not named holidays. So **472,900 overstates named-holiday and understates two others**.
The totals and the 7.7% are sound; the per-family split for `named-holiday` is not. Treat the row
as "miscellaneous calendar queries" rather than as a spec.

**Volume is not opportunity.** Several of the biggest entries here are things Livdar has good
reason not to build. `moon-phases` at 96,900 is off-brand for a cost-of-living site and is
recorded as REJECTED in the candidate inventory for exactly that reason, despite `vollmond` being
the largest KD 0 term found in the whole engagement. A gap is only worth closing if the surface
belongs on the site.

## What this changes

The candidate inventory's first pass had 772,000 monthly searches blocked on a data licence and
68,793 buildable. This table is the evidence that the blocked number was never the ceiling: most
of what the market leaders earn comes from families that need **no licence at all**, mainly
arithmetic over dates.

Detail and per-family feasibility in
`../competitors/families-observed-2026-09-28.tsv` and `../competitors/PER-MARKET.md`.

## Not captured

The equivalent pull for `kalender-365.nl` (NL, 435,239) and `calendario-365.it` (IT, 302,126).
Both would cost roughly 3,400 units each and would very likely show the same shape, since both
run the same `-365` template. Their top pages are already captured in
`../competitors/PER-MARKET.md`, which is where the family evidence came from. Skipped as a
duplicate rather than as an omission, per the brief's instruction to avoid useless duplicates.

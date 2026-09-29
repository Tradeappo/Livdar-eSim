# Livdar final research report

2026-09-30. This folder is the source of truth for Livdar SEO research. Read
`README.md` first for the rule about not restarting.

Nothing was published. Production was not touched. No live URL changed. Rank
Tracker was not changed.

## What this pass was asked to do, and what it found

The brief was to stop forcing a million pages out of city x family and instead
build the real entity and listing universe, on nine axes, and see whether that
produces hundreds of thousands or millions of legitimate pages.

It does produce them on demand. It does not produce them on rankability.

| axis | pages of measured demand | pages Livdar can win |
| --- | --- | --- |
| all nine entity and listing axes | 1,627,088 | 9,696 |
| city x family, carried forward | 29,274 | 29,274 |
| total | **1,656,362** | **38,970** |

The single most important qualification: **1,585,500 of that 1,656,362 is the
jobs axis**, which has no feed and whose SERP is job boards ranking on live
inventory. Ninety six percent of the demand sits in the one place Livdar cannot
compete. Any summary that quotes 1.65M without that sentence is misleading.

## The finding that decided it

Entity pages have far more demand than the durable category pages above them.
`british museum` is 152,000 against `museums in london` at 12,000. `edinburgh
castle` is 85,000 at KD 0. `bondi beach` 86,000, `borough market` 78,000, `o2
arena` 70,000 with traffic potential 104,000. Even one gym branch, `puregym
london`, is 2,300 with traffic potential 10,000. And the obtainable entity count
is 8,948,616 in the eleven live markets, verified tag by tag against the official
OpenStreetMap statistics API. So unlike city x family, the entity axis has both
the volume and the arithmetic to reach a million.

Two SERP samples close it:

- `edinburgh castle`: the castle's own blog at position 1 with 20,929 traffic, a
  knowledge panel at 2, a question block at 3, then TripAdvisor's forum, Facebook,
  YouTube and Instagram. A DR 0 primary school page ranks at position 8 with 669,
  so authority is not the barrier. There is no informational slot to take.
- `alhambra tickets`, the commercial modifier that should have been the way in: an
  AI overview with only official sitelinks, the official ticket shop at 2, official
  pages at 4, 6, 7 and 8, and **Tiqets at DR 83 taking position 9 with 42 clicks**.

**An entity's query belongs to the entity.** That is the rule, and it holds
regardless of how weak the entity's own domain is.

## Why the listing axes fail separately

Not for the same reason, and the distinction matters for what to do next.

| axis | SERP verdict | what is actually missing |
| --- | --- | --- |
| jobs | LISTING_INVENTORY_REQUIRED. `product manager jobs london` is ten job boards, but `builtinlondon.uk` at DR 17 ranks fifth | live vacancies, not authority |
| events | OPEN_BUT_ECONOMICALLY_DEAD. `o2 arena events` has DR 15 at position 3 and DR 0 at 5, but everything below position 1 earns 72 clicks on 3,900 volume | ticketing inventory, and position 1 |
| property | OPEN_BUT_SOURCE_BLOCKED. `houses for sale carlisle` has a DR 7 winner at position 3 earning 1,591 | a listings feed |
| routes | AGGREGATOR_LOCKED. `lincoln to nottingham` has nothing under DR 53 | timetable data and authority both |
| weather | SERP_FEATURE_SUPPRESSED. `spokane weather` has nothing under DR 72 | the click, which the knowledge card takes |

Four different blockers. Calling all of them "missing data" would hide that
events and property are open on authority and jobs is not gated on authority
either, while weather genuinely is.

## What is winnable

38,970 pages. Four blocks, in build order:

1. **6,342** city x category place pages. The only axis with a proven open SERP at
   the tail: `restaurants lincoln` has DR 13 at position 5 earning 2,148 while
   TripAdvisor at DR 91 takes 337. Source is OpenStreetMap, already obtainable.
2. **1,800** Move and relocation pages. `uk spouse visa` 4,800, `portugal golden
   visa` 1,700 at KD 0, `spain digital nomad visa` 1,100 at KD 0, `nie number
   spain` 800 at KD 0. CPC 60 to 350 cents, the highest in this research. Content
   pages, so no feed and no licence problem. The constraint is editorial accuracy
   across about 40 countries.
3. **1,554** node pages. `stansted to london` traffic potential 84,000, `gatwick
   to london` 33,000, `hotels near gatwick airport` 3,200 at KD 0, `student
   accommodation london` 4,800. Unblocked by a one-line fix to data already held,
   described in `DATA-GAPS-FINAL.csv` row 6.
4. **29,274** city x family durable pages, carried forward from the market-reach
   correction earlier the same day.

## The keyword set

`LIVDAR-MASTER-KEYWORDS-FINAL.csv` unifies every keyword researched in every pass
with the entity and listing measurements from this one. 11,590 rows in, 7,306
unique out, across eleven markets plus a multi-market eSIM set.

| | |
| --- | --- |
| total unique keywords | 7,306 |
| measured directly with Ahrefs | 1,470 |
| Rank Tracker worthy | 1,102 |
| entity or listing keywords | 2,257, of which 137 from the nine axes measured this pass |
| blocked | 74 |
| rejected | 273 |

Full breakdowns by market, language, surface, family, entity type and intent type
are in `KEYWORD-COUNTS.json`, and the per-family and per-market rollups are
generated from the master file into `FAMILY-FINAL.csv` and `MARKET-FINAL.csv` so
they cannot drift from the rows beneath them.

## What this pass deliberately did not do

- It did not multiply by language, year, persona or synonym. Those were measured
  and rejected in earlier passes, and the measurements are in the folder.
- It did not restart research. Every earlier keyword is carried forward with its
  source file recorded in `source_of_keyword`.
- It did not scrape anything. POI counts came from the official OpenStreetMap
  statistics API, and no event or competitor site was touched.
- It did not count a page it cannot rank. The difference between 1,656,362 and
  38,970 is the whole point of the exercise.

## Corrections this pass makes to earlier reports

Earlier passes treated the entity axes as "missing data", which was true but
incomplete: it implied that acquiring the data would unlock the pages. It would
not, for POI, places, transport nodes and events entities, because the blocker is
the SERP and not the source. `DATA-GAPS-FINAL.csv` now records the blocker class
per axis, so SOURCE, SOURCE_QUALITY, DEMAND and ACCURACY are no longer conflated.

The one earlier claim reversed outright: `SOURCE-ROADMAP.csv` in the previous
folder ranked the jobs feed as the highest leverage acquisition. On this pass's
evidence it is the lowest, because the feed would buy 1.59M pages that cannot
rank. The recommendation is now explicitly do not start.

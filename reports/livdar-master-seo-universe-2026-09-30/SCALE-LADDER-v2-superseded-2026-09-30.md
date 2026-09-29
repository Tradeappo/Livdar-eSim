# Scale ladder, version 2, recomputed on 2026-09-30 from three new measurements

**Version 1 of this file is superseded.** It rated 500k "probable, unproven" and
1M "reachable on arithmetic, unproven on value", both on an evidence base of 287
keywords. This version rests on **807 measured keywords and 16 sampled SERPs**, and
the tier-3 assumption behind version 1 was wrong.

New evidence: `FAMILY-MARKET-MEASUREMENTS.csv` (254 rows, 5 markets),
`TIER3-DEMAND-EXPERIMENT.csv` (284 rows, 51 cities, 6 markets, 14 families),
`PLACES-EVENTS-SERP-40.csv` (16 SERPs), computed in `MEASUREMENT-SUMMARY.json`.

---

## The one finding that moved the ladder

**Tier-3 cities have real demand.** Version 1 assumed they did not, on four climate
and three sport keywords measuring 9 to 40. Measuring 284 tier-3 keywords across 6
markets, 51 cities and 14 families:

| Threshold | Share of tier-3 samples |
| --- | --- |
| volume > 0 | **96.5%** |
| >= 10 | 96.5% |
| >= 50 | 85.2% |
| >= 100 | 78.5% |
| >= 500 | **48.9%** |
| >= 1,000 | **34.2%** |
| median | **450** |

Version 1's conclusion came from measuring the two families where tier-3 genuinely
collapses, and generalising. The families that carry tier-3 are different ones.

### By family, which is where the answer actually lives

| Family | n | Median | Max | >= 300 | >= 1,000 | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `work.city-jobs` | 48 | **1,700** | 12,000 | 95.8% | 72.9% | Highest demand, **SERP locked** |
| `activities.city-things-to-do` | 43 | **1,100** | 7,600 | 62.8% | 53.5% | **Best combination in the programme** |
| `weather.city-best-time` | 7 | 700 | 21,000 | 71.4% | 42.9% | Strong |
| `health.city` | 6 | 450 | 600 | 50% | 0% | Moderate |
| `rents.city` | 32 | 350 | 4,300 | 62.5% | 21.9% | Strong, partial SERP opening |
| `events.city-window` | 5 | 350 | 800 | 60% | 0% | Moderate |
| `places.city-category` | 81 | 300 | 3,200 | 51.9% | 28.4% | Market dependent |
| `stay.city-type` | 26 | 300 | 1,500 | 50% | 11.5% | Moderate |
| `events.city-type` | 27 | 90 | 1,300 | 25.9% | 7.4% | **Weak in tier 3**, strong in tier 1 |
| `education.city-universities` | 5 | 40 | 10,000 | 40% | 20% | One entity carries it |
| `sport.route`, `safety.city`, `events.recurring`, `cost-of-living.city` | 1 each | 0 to 100 | | 0% | 0% | Negligible |

### By market

| Market | n | Median | Max | >= 300 | >= 1,000 |
| --- | --- | --- | --- | --- | --- |
| en-GB | 48 | **1,000** | 21,000 | 68.8% | 52.1% |
| es-ES | 48 | 900 | 7,600 | 77.1% | 43.8% |
| de-DE | 48 | 800 | 4,300 | 75% | 45.8% |
| it-IT | 48 | 300 | 4,700 | 50% | 22.9% |
| pt-BR | 47 | 250 | 2,400 | 48.9% | 17% |
| pl-PL | 45 | 90 | 12,000 | 33.3% | 22.2% |

Poland is the outlier and it is instructive: its tier-3 median is 90 because
attractions, events, rent and hotels are near zero there, while `praca krosno` is
12,000. **The family and the market interact; neither alone predicts.**

## The SERP finding that constrains it

16 SERPs. **10 of the 16 have a winner at DR 20 or below**, including DR 0, DR 2,
DR 3, DR 4, DR 5 and DR 15. Authority is not the barrier anywhere sampled.

| Winnability | SERPs | Examples |
| --- | --- | --- |
| **OPEN** | 8 | `イベント 東京` 12,000 with **DR 2 earning 6,269**, the highest traffic on the page; `bank holidays 2026` 415,000 with **DR 15 earning 19,925**; `que ver en segovia` 7,600 with **DR 3 earning 1,410**; `things to do in lincoln` 3,700 with **DR 4 earning 311** |
| SERP_FEATURE_SUPPRESSED | 3 | The three climate month SERPs: rankable, but AI Overview and a knowledge card sit above the first organic result |
| **AGGREGATOR_LOCKED** | 2 | `ristoranti milano` (TripAdvisor, Michelin, TheFork, OpenTable, weakest DR 61); `jobs lincoln` (**100% job boards**, no other winner) |
| COMPETITIVE | 1 | `京都 観光` 78,000, every winner DR 70 to 83, official tourism and portals |
| OPEN_OFFICIAL_FAVOURED | 1 | `veranstaltungen bayreuth`, DR 5 at position 5, but the district and university calendars dominate |
| COMPETITIVE_PARTIAL_OPENING | 1 | `wohnung mieten konstanz`, portals own 1 and 2, but **DR 20 takes 1,884 at position 3** |

Two structural rules fall out, and both are the opposite of the naive assumption:

1. **The tail is more open than the head.** `京都 観光` at 78,000 is DR 70+ only;
   `que ver en segovia` at 7,600 has a DR 3 winner. Tier-3 attractions is the
   opening, tier-1 attractions is not.
2. **Jobs has the most tier-3 demand and the least winnable SERP.** Median 1,700,
   95.8% above 300, and a page one that is 100% Indeed, Reed, SimplyHired, Jooble,
   Glassdoor and LinkedIn. Livdar cannot win jobs without being a job board with live
   inventory. It is excluded from the defensible count for that reason, not for lack
   of demand.

## The four totals, kept separate

| | Value | What it is |
| --- | --- | --- |
| **A. Source-obtainable** | **3,431,138** across markets | Data we could lawfully get |
| **B. Source-backed today** | **1,644,451** across markets | Data already in the repository |
| **C. Demand-supported (measured)** | **493,443** | Families with directly measured demand, over their real entities, in the **6 markets actually sampled** |
| **C2. Demand-supported (extrapolated)** | **897,798** | The same if the remaining 5 markets behave like the 6 sampled |
| **D. Publishable now** | **1,791** | Today, held data, nothing invented |

Single-market demand-supported is **100,641**, or **89,088** excluding the SERP
locked jobs family. 8 city families clear the tier-3 median gate, over 11,553 cities
(2,951 tier 1 and 2 plus 8,602 tier 3), plus 8,217 non-city validated candidates.

## The ladder

| Target | Verdict | Pages supported | Families | Markets | Evidence coverage | Missing |
| --- | --- | --- | --- | --- | --- | --- |
| **100,000** | **DEFENSIBLE** | 493,443 measured | 7 city families plus 16 non-city | 6 measured | 807 keywords, 16 SERPs | Nothing for the demand case. Sources for places, stay and events |
| **250,000** | **DEFENSIBLE** | 493,443 measured | as above | 6 measured | as above | Same sources. This is now the conservative target, not the ceiling |
| **500,000** | **PROBABLE_BUT_UNPROVEN** | 493,443 measured, 6,557 short | as above | needs 7 of 11 | 807 keywords | **One more market measured closes it.** fr-FR or nl-NL, 48 tier-3 rows, about 1,600 units |
| **1,000,000** | **UNPROVEN** | 897,798 extrapolated | as above | needs all 11 plus a new family class | Source-obtainable is 3.4M so the data exists | Demand in the 5 unmeasured markets, and either the jobs SERP solved or one new validated family class |
| **3,000,000** | **NOT_DEFENSIBLE** | 897,798 is 3.3x short | | | | No extrapolation from what is measured reaches it. Would need POI level entities, which is a different architecture |

## What changed from version 1

| | Version 1 | Version 2 |
| --- | --- | --- |
| 100k | DEFENSIBLE | DEFENSIBLE, now with 493k measured behind it |
| 250k | DEFENSIBLE, "the honest working target" | **DEFENSIBLE and no longer the ceiling** |
| 500k | PROBABLE, blocked on the tier-3 question | **PROBABLE and 6,557 pages short**, one market from defensible |
| 1M | Reachable on arithmetic, unproven on value | **UNPROVEN, and 90% of the way on extrapolated demand** |
| 3M | NOT_DEFENSIBLE | NOT_DEFENSIBLE, unchanged |
| Tier 3 | Assumed to collapse | **96.5% have demand, median 450, 34.2% above 1,000** |

The single cheapest action that would change a verdict: **48 tier-3 keyword rows in
one more market, about 1,600 units**, which would move 500,000 from PROBABLE to
DEFENSIBLE.

# Round three: the families, measured as keywords instead of multiplied

Every pass before this one sized a family the same way: count the cities, count the
modifiers, multiply. That produces a page count without ever asking whether the
keywords exist. This pass asked. It harvested real keyword sets per validated family
and measured each pattern's **breadth** - how many distinct keywords actually exist
above a volume floor.

The method matters for how much weight each number carries:

- When a pull returned **fewer rows than the limit**, the tail exhausted. The count is
  a hard ceiling: nothing above that floor was left unreturned.
- When a pull **hit the limit**, the count is a floor and the tail was still going.

One integrity check worth recording. `airport to city centre` returned exactly 100 rows
against a 400 limit, and a round number like that usually means a hidden cap. Re-running
the same query at a floor of 50 returned 400, which proves the 100 was real. The counts
below are only trustworthy because that check passed.

Total spend: 34,287 API units.

## What the measurements did to the estimates

| Family | Round 2 pages | Measured breadth | Tail | Verdict |
|---|---|---|---|---|
| stay.wg-student-furnished | 9,000 | **73** (de-DE) | exhausted | refuted |
| poi.entity-parking | 3,000 | composition refutes it | limit hit | refuted |
| property.city-buy | 10,000 | **350** (de-DE) | exhausted | overstated |
| rents.city-listings | 26,000 | **223** (de-DE) | exhausted | demand real, count overstated |
| events.city-durable-window-concerts | 11,000 | **400+** (de-DE) | still going | mostly unpublishable |
| transport.node-route-and-hotels | 2,000 | **100** airports (en-GB) | exhausted | plausible, structure corrected |
| places.city-category | 6,342 | **283** for one category (en-GB) | exhausted | supported |
| atlas.city-family-carried-forward | 29,274 | **450+** (en-GB) | still going | supported |
| jobs.role-city-and-category-city | 40,000 | city tail at KD 0 | still going | demand real, feed-gated |
| **jobs.rules-durable** | **not found** | 9 heads | still going | **new, no feed needed** |
| move.visa-country | 1,800 | 39 (en-GB) | exhausted | demand real, count unproven |

The breadth counts are **not multiplied by eleven markets**. Round two already
established that the 11-market multiplier is invalid for the tail, so every figure here
is per-pattern, per-market, as measured.

## The four findings that change what gets built

**The WG and student family does not exist at scale.** `wg zimmer` has eight city
keywords above 300 volume. All three patterns together reach about 35 cities, every one
a university city, and three of those (Vienna, Innsbruck, Zurich) are outside the
eleven markets. Against a 9,000-page estimate. This is the largest overstatement in the
whole research set.

**Parking was refuted by its own composition, not by its size.** The breadth pull hit
the row limit, which normally supports a family. But reading what came back: the demand
is airport parking, parking-operator brands (Britannia, APCOA, ParkingEye, Purple,
Maple, SABA, RingGo), council parking and parking-rules explainers. Genuine
attraction-entity parking is a short list - Wembley, the O2, Trafford Centre, Legoland,
Battersea Power Station. The airport parking demand is real and should move to the
transport node pages, which is where it belongs and where it monetises.

**A no-feed family was hiding inside a feed-gated axis.** Round two classified the jobs
axis wholesale as requiring a jobs feed, which buried the fact that German minijob
*regulation* demand needs no listing inventory whatever: `minijob grenze 2026` at 48,000
volume and KD 5, `minijob grenze` at 43,000 and KD 0, `minijob 2026` at 22,000,
`minijob gehalt` at 13,000, `kündigungsfrist minijob` at 6,000 and KD 0. Publishable
today, no feed and no licence. This is the only family this pass *added*.

**The rental tail is real and it is genuinely at zero difficulty.** 223 keywords above
1,000 volume in de-DE, and the metric pull showed the entire tier-2 and tier-3 tail
sitting at KD 0 to 3 with 2,300 to 15,000 volume each - Lübeck 9,000, Regensburg 6,100,
Trier 5,800, Kassel 5,200, Bamberg 4,000, Cuxhaven 2,800. Nothing about ranking is
blocking this. Inventory is.

## What this does to the 160,416 verdict

It does not restore it. The feed-backed figure leaned on rents 26,000, jobs 40,000,
events 11,000, property 10,000 and WG 9,000 - that is 96,000 of the 160,416. Measured
breadth refutes WG and property outright, shows the events breadth is mostly
time-window keywords a static page cannot serve, and caps rents at 223 in its strongest
market. **The 100,000 threshold that round two marked YES for the feed-backed case is
not supported by measured keyword breadth.**

The two largest families survive intact, which is the good news and it is not small:
`atlas.city-family-carried-forward` at 29,274 and `places.city-category` at 6,342
together account for 35,616 of the 64,416 currently-rankable pages, and both hold up.
`places.city-category` also revealed *how* it legitimately scales - not city alone but
city, neighbourhood and near-station micro-geo, with one category (coworking space)
exhausting at 283 keywords in a single market at 150 to 800 cents CPC.

## The buildable position

Demand-confirmed and publishable with no feed at all: **atlas**,
**places.city-category**, the **transport airport nodes**, **move.visa-country** and the
new **jobs.rules-durable**. Everything feed-gated is now demand-measured rather than
arithmetic - and three of those five shrank when measured.

## Files

- `FAMILY-KEYWORD-HARVEST.csv` - 282 harvested keywords with volume, KD and CPC, tagged
  by family, pattern and whether a feed is required. Merged into the master.
- `PATTERN-BREADTH-MEASURED.csv` - the eleven breadth measurements, each recording its
  floor, its limit, and whether the tail exhausted.
- `MEASURED-SCALE-ROUND3.json` - per-family estimate against measured breadth, with the
  correction and revised count for each.

The master keyword set moved from 7,459 to 7,713 unique keywords. 282 harvested rows
went in and 28 collapsed against existing rows, which is the dedupe ladder working as
designed. de-DE gained 123 and en-GB gained 131.

# Five new entity models, ranked by what they can legitimately become

Written 2026-10-07. CURRENT FINAL = 427,121. Gap to 1,000,000 = 572,879.
Nothing published. No gate relaxed.

## The constraint that shapes every number below, stated first

The paid Ahrefs subscription is ending and is not being renewed. That does not reduce
what is already measured, and it does not block acquisition. It blocks ADMISSION OF NEW
LANGUAGES, and for the transport model specifically it is decisive:

- the pair axis is MEASURED and ADMITTED in **en, da, nb, fi**
- the pair axis was MEASURED and **REFUTED in German** on 2026-10-07: 2 of 500 German
  distance rows named two real places, against 346 of 500 in English. That is a refusal
  on evidence, and it stands.
- **fr, es, it, pl, nl were never measured on the pair form**, and there is now no tool
  to measure them. Dutch was separately refused at pair level because its demand is
  international while the held feed is domestic.

So German, French, Spanish, Italian and Polish GTFS can be acquired and used as GRAPH
EVIDENCE for pairs whose other end sits in an admitted market, but they cannot become
pages in their own language. Any plan that counts them as pages is counting supply as
demand, which is the error this programme has corrected four times already.

This is why the honest target below is not "200k from fourteen countries". It is the
largest number the admitted markets can legitimately carry.

---

## Model 1. The heterogeneous intercity transport graph  (IMPLEMENTING NOW)

**Why each page exists.** A reader going from one named place to another wants to know
whether it can be done, by what, how long it takes and how often it runs. One page per
origin-destination pair.

**What unique data it holds.** Real scheduled journey time (median and fastest), real
direct-service count, modes, operators, route names, straight-line distance. All read
from `stop_times`, attributed to the publishing agency. Not estimated.

**What source makes it real.** National GTFS, keyless and licence-checked by hand.

**The change that decides its size.** Until now every stop collapsed onto its settlement,
which answers "Oslo to Bergen" and discards the rest. The node set is now
HETEROGENEOUS: a stop stays its own node when the feed calls it a station
(`location_type=1`) or when eight or more distinct routes meet there, otherwise it
collapses to its settlement. This is the category leader's model, and it is also what
the Norwegian measurement found unprompted:

```
tog fra gardermoen til oslo s     300  KD 2   airport -> station
tog fra vaernes til trondheim     300  KD 1   airport -> city
tog fra oslo s til gardermoen     150  KD 0   station -> airport
tog fra trondheim til vaernes     150  KD 0   city    -> airport
```

Station and airport endpoints are MEASURED endpoints, not a speculative widening.

| | |
|---|---|
| source | GB BODS (OGL v3.0, 1.8 GB, 5.5 GB of stop_times), Entur NO (NLOD 2.0), OVapi NL (CC0), TFI IE (CC BY 4.0), Digitransit FI, Rejseplanen DK, plus 102 city feeds |
| entity count | 56,317 settlements + ~3,244 airports + tens of thousands of station nodes |
| data density | 5 to 8 real facts per pair, all sourced |
| expected FINAL | **60,000 to 150,000** in admitted markets, dominated by GB |
| effort | LOW, the harvester exists and the node upgrade is written |
| blocker | language admission outside en, da, nb, fi, permanently |
| time | hours, GB harvesting now |

GB is the single largest item: the whole national bus and rail network, in en-GB, which
is already a full market with NATIVE_LOCALE status.

---

## Model 2. POI utility enrichment at scale

**Why each page exists.** Only where the entity carries facts a reader came for. The
2026-10-07 measurement is unambiguous that most do not, and that is the gate.

**What unique data it holds.** OSM tags already captured plus Wikidata properties.

**What source makes it real.** 7,388,615 POI on disk, 52,557 outdoor features carrying a
Wikidata id, and WDQS answers (HTTP 200 verified; the `wbgetentities` API is rate-limited
at 429, SPARQL is not).

**The honest numbers, measured not assumed.** A 372-entity stratified sample across 30
classes, zero failed batches: **0.00 facts before, 1.04 after**. 74.2 per cent gain at
least one fact, **19.6 per cent gain two or more**, and two is the bar the page basis
states. So:

| bar | share | applied to the 40,123 gate population |
|---|---|---|
| one fact | 74.2% | 29,769 |
| **two facts** | **19.6%** | **7,874** |

| | |
|---|---|
| expected FINAL | **7,874** at the stated bar; 29,769 only by halving the bar, which is relaxing a gate |
| effort | LOW, WDQS is reachable and the property list is already written |
| blocker | none |
| time | hours |

The finding behind it matters for the 300k to 500k target: **Wikidata is thin for exactly
the entities OSM is thin for.** The two sources are correlated, not complementary, so
there is no large hidden reserve of facts behind the notability flag. A 300k
utility-qualified POI count is not reachable by enrichment; it would require a different
source with per-entity facts, which is model 3.

---

## Model 3. High-cardinality official registers

Three candidates with the entity counts to matter. None is acquired yet.

| dataset | entities | licence | facts per entity | coverage | expected FINAL | effort |
|---|---|---|---|---|---|---|
| **Companies House (UK)** | ~5.4M companies, ~8M officers | OGL v3.0, free bulk | name, number, status, incorporation, address, SIC, officers, filings | UK | high raw, but a company page is not travel content and must pass a utility and intent gate it has never been measured against | medium |
| **EV charging (OpenChargeMap)** | ~500k points | CC BY-SA 4.0, free API | operator, connector types, power kW, access, pricing model | global | pages are per SITE not per point; plausibly 30k to 80k | low |
| **GB rail stations + usage (ORR)** | 2,580 stations, annual entries and exits | OGL v3.0 | entries, exits, interchanges, operator, facilities | GB | 2,580, small but very high density and it feeds model 1 | low |

**The honest read.** Only Companies House has 100k+ cardinality in a single register, and
a company page is the furthest thing in this list from the travel intent the whole site
is built on. Recommending it on cardinality alone would be the "arbitrary Cartesian
product" failure in a new costume. EV charging is the best fit of the three: real
per-entity facts, travel-adjacent, open licence, and a page per site is defensible.

---

## Model 4. Ferry network as its own pair axis

**Why each page exists.** A ferry crossing is a journey nobody can infer from a map.

**What source makes it real.** OSM `route=ferry` relations, verified present and
parseable: Denmark alone returned 51 relations, 46 named, 20 with explicit `from`/`to`,
with names that carry the pair (`Frederikshavn => Göteborg`, `Helsingborg-Helsingør`).
Complementary to GTFS rather than duplicative: only 80 of 21,384 GTFS pairs involve a
ferry and those are Bangkok and Hong Kong river commuters.

| | |
|---|---|
| expected FINAL | **hundreds, not thousands**, in admitted markets |
| effort | LOW, the extractor is written |
| blocker | the big ferry networks are Greek, Italian, Croatian and Indonesian, none of them admitted markets |

Listed honestly at its real size rather than promoted.

---

## Model 5. Country capture against saved destination evidence

Source capture is unblocked: five OSM mirrors answer, including the one this project's
own scripts already use. ZA, AR, UA and CZ are capturing now.

**But capture supplies the SOURCE and nothing now supplies the DEMAND.** The 306,725 in
`1M-COUNTRY-PLAN.csv` rests on an 11.72-pages-per-gazetteer-city benchmark, which is an
extrapolation. A new country's cities are mostly tier 3 and tier 4, belong to no market,
and enter as destination pages gated by saved cross-language evidence covering 2,071
cities. Expected FINAL is therefore **bounded by evidence already on disk**, not by how
many countries are captured.

---

## What this adds up to

| model | expected FINAL |
|---|---|
| 1. heterogeneous transport graph | 60,000 to 150,000 |
| 2. POI utility enrichment at the stated bar | 7,874 |
| 3. official registers, EV charging the best fit | 30,000 to 80,000 |
| 4. ferry axis | hundreds |
| 5. country capture | bounded by saved evidence |
| **plausible total** | **~525,000 to 665,000** |

**One million is not reachable from these five models alone**, and the single reason is
not data and not effort: it is that the pair axis, the one model with genuine
six-figure cardinality, is admitted in four languages and refused or unmeasured in the
rest, with no remaining way to measure. Lifting that one constraint is worth more than
every other item on this page combined, and it needs a keyword tool.

The two things that would change this answer:

1. **Any keyword measurement tool** to admit the pair axis in de, fr, es, it, pl, and to
   lift the 94 tier caps specified in `TIER4-DEPTH-PROBE-PLAN.csv` (183,696 cities).
2. **The three free national GTFS accounts** (Spain NAP, DELFI Germany, Trafiklab
   Sweden), which deepen the graph but, without item 1, only in the markets already
   admitted.

Implementation of model 1 has started.

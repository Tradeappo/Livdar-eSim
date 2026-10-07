# What closing the last 578,000 pages actually requires

Written 2026-10-07, after the implementation pass. Nothing published. No gate relaxed.
No cohort 003, no sitemap change, no IndexNow, no Request Indexing.

This report exists because the brief said do not stop at projections, and the
implementation pass has now converted every remaining projection into either a built
page or a named, measured refusal. What is left is one decision that is not mine to
take, and it is stated in section 6.

## 1. The authoritative count, and a correction to the baseline

| | pages |
|---|---|
| committed baseline in `1M-SUMMARY.json` at the start of this pass | 421,764 |
| after pulse and airport parking were wired and gated | 422,001 |
| after the 21,384 GTFS settlement pairs were wired and gated | **423,763** |
| NEW FINAL NET from this pass | **+1,999** |
| gap to 1,000,000 | 576,237 |
| `funnel_reconciles` | **TRUE** |

The brief gives the baseline as 423,363. The authority this project defined is
`1M-SUMMARY.json`, and at HEAD it said 421,764. I am flagging the 1,599 difference
rather than quietly reporting progress against the larger number, because the whole
point of the FINAL definition is that one file decides.

Both increments are fully accounted for and nothing was relaxed to get either.

The +237: `generated_before_any_gate` +276, `after_exact_dedupe` +276, of which the
localisation gate classified 237 NATIVE_LOCALE and 37 LOCAL_INTENT_MISSING, and the
parent check lost none. Every other gate count identical, every other localisation
class unchanged to the row.

The +1,762: 21,384 GTFS pairs went in and 19,622 were rejected by the localisation
gate, which is visible as `LOCAL_INTENT_MISSING` rising from 107,042 to exactly
126,664. `TRANSLATION_ONLY`, `LOCAL_DEMAND_NOT_FOR_THIS_DESTINATION` and
`VALID_LOCALIZATION` did not move at all. The 1,762 that survived are the pairs in
English-speaking countries, and the 19,622 that did not are the Norwegian, Danish,
Finnish, Dutch, French and Polish pairs sitting in English. That is the gate behaving
correctly and it is also, precisely, the cost of the decision in section 6.

## 2. What was built this pass, with its funnel

| family | RAW | REJECTED | FINAL NET | in FINAL |
|---|---|---|---|---|
| pulse.school-holidays | 127 | 17 thin, 2 unnamed | 110 | 110 |
| pulse.subdivision-holidays | 55 | 0 | 55 | 55 |
| pulse.bridge-days-subdivision | 32 | 0 | 32 | 32 |
| pulse.country-holidays | 20 | 1 no rows | 19 | 17 |
| pulse.long-weekends | 10 | 0 | 10 | 10 |
| transport.airport-parking | 86,215 | 86,165 | 50 | 13 |
| transport.city-pair-transit (GTFS) | 3,483,942 | 3,462,558 | 21,384 | 1,762 |

## 3. Three things that were smaller than the briefs projected, and why

**Pulse: 226, not the 9,065 rows in the store.** `ahrefs-holidays-*.json` states the
rule in its own note: an unqualified head term resolves to the market's own country,
and "a region, a month, or a country the source cannot reach is REFUSED". So the 43
countries in the holiday store are SOURCE SUPPLY.
`NEW-FAMILY-SCALE-MATRIX.csv` recorded `entities_with_demand=43` for
pulse.country-holidays; that was the supply figure, and it is corrected here. This is
the same SUPPLY-IS-NOT-DEMAND error the brief named, found in the project's own matrix.

**Airport parking: 50, not 254.** The first version of my own builder accepted any
named car park within 6 km of the airport. Reading its output refuted it: Antwerp came
back with "KBC bank", a doctors' waiting post, "Casa", "Agfa-Gevaert" and
"B-Parking Antwerpen-Centraal" at 3.76 km, which is the car park of Antwerp CENTRAL
STATION. A six kilometre circle around a city airport contains the city, so the radius
was never measuring association with the airport; it was listing the neighbourhood.
Presenting a bank's staff car park as an airport car park is a fabricated relationship.
204 of the original 254 pages rested on it.

**POI Class B: exhausted, measured.** Of 501,887 derived cells, 199,604 are
native-market and 195,592 are already in the manifest. Of the 302,283 cross-language
cells, 22,005 have measured destination evidence and are already admitted; 280,278 do
not, and stay refused as TRANSLATION_ONLY, which the brief forbids recovering. This
contradicts the scoreboard's framing of POI as "the largest single untapped pool".

## 4. The paths that are blocked, and what blocks each

| path | size | blocker | is it mine to fix |
|---|---|---|---|
| country expansion | 90,498 | the countries have ZERO OSM layers on disk (`osm_parents_mb` 0.0 etc.); needs new capture | no, see below |
| localisation class B recovery | up to 157,943 | needs a per-market differentiating FACT, and the only sources that would give one are per-origin flight data (BITRE, en-AU only) and per-nationality visa policy (UK FCDO, one nationality) | no |
| ferry route pairs | unknown | `route=ferry` relations need Overpass; no global mirror is reachable | no |
| ski areas | unknown | `landuse=winter_sports` needs Overpass; same | no |
| parking capacity and fee tags | unknown | the POI extractor discarded them; needs re-extract, which needs Overpass | no |
| outdoor parent-polygon failures | 6,527 | extend the parent layer, which needs Overpass | no |
| Wikidata 2-fact enrichment | 7,874 | buildable, open item #99 | yes |

**Overpass is the common blocker and it is infrastructure, not code.**
`overpass-api.de` resets through the tunnel on every attempt. `overpass.kumi.systems`
returns HTTP 500 intermittently and succeeded once on a Tokyo probe out of six tries.
`overpass.osm.ch` answers reliably and is a **Switzerland-only extract**: Tokyo, New
York and Munich all return zero elements and Zurich returns three. I verified that
before building anything on it, because 161 "global" ferry routes from a Swiss mirror
would have been a silent and very expensive error. `download.geofabrik.de` resets too,
and no raw PBF is retained on disk.

So country expansion, ferry, ski, parking tags and the outdoor parent recovery are all
one acquisition problem wearing five hats, and none of them is a code defect.

## 5. The GTFS acquisition: what it delivered and the one thing it needs

`1M-CAPACITY-CEILING-2026-10-07.md` named transport routing data as the single
acquisition that closes the gap without touching a gate. It is reachable and it is
acquired: 102 of 105 openly licensed Mobility Database feeds, plus five national
aggregates that need no API key, each licence checked by hand. 3,483,942 stop pairs
reduce to **21,384 settlement pairs**.

The collapse of 163 to 1 is the gate working. A stop pair inside one bus network is a
real connection and a worthless page: one small Quebec feed yields 57,181 of them.

These pairs carry what no existing pair family could: a real median and fastest
scheduled journey time and a real direct-service count, read out of `stop_times` and
attributed to the publishing agency. The air pairs rest on a 2014 OpenFlights snapshot
and the rail pairs on a Wikidata adjacency graph, so neither can say how long anything
takes. Fares are still refused.

### The last Ahrefs units answered the question that decides their value

The subscription had 6,088 units left and, it turns out, was at a quota floor rather
than an expiry: `usage_reset_date` is 2026-10-08T00:00:00Z. 5,355 units were spent on
one question, because emitting these pairs in English makes most of them cross-language
pages about non-English-speaking countries, which the localisation gate rejects. The
full result is in
`data/atlas/measurements/ahrefs-expiry/gtfs-pair-local-language-2026-10-07.json`.

| language | pairs held | verdict | decisive evidence |
|---|---|---|---|
| da | 2,865 | **ADMIT** | 50 rows at a floor of 40, KD 0 to 1, limit reached so it is a FLOOR. `tog fra aalborg til kobenhavn` 350, `tog fra frederikshavn til skagen` 200, `tog fra bronderslev til aalborg` 150 |
| no | 2,712 | **ADMIT** | 50 rows at a floor of 40, KD 0 to 2, also a FLOOR. `tog fra bergen til oslo` 350, `tog fra voss til bergen` 100, `tog fra sarpsborg til oslo` 100 |
| fi | 752 | **ADMIT**, with a phrasing correction | `helsinki turku juna` 800 KD 0, `helsinki porvoo bussi` 800 KD 0. Finnish puts the PAIR BEFORE THE MODE and uses no preposition |
| nl | 7,509 | **REFUSE at pair level** | demand is INTERNATIONAL: `trein van amsterdam naar londen` 400, `naar parijs` 300. The held feed is domestic, and domestic Dutch pairs are below the floor |
| en | GB 38 feeds, IE 1,973 | no change needed | GB and IE are English, so already NATIVE_LOCALE |

Two findings worth keeping. First, **pair-axis viability tracks country geography, not
language size**: Dutch has the most pairs on disk and is the one language refused,
because the Netherlands is small, dense and served by a single national journey planner,
so a Dutch reader searches the international pair rather than the domestic one. Denmark
and Norway are long and thin with regional hubs and their domestic pair demand is real
and deep. Second, the Finnish result is the **seventh phrasing correction of the
session**: both directions carry equal volume (800 and 800, 800 and 700), which also
says the Finnish pair is genuinely unordered and should be one page rather than two.

## 6. The decision that is not mine, and it is the only thing in the way

**Danish, Norwegian and Finnish are not Livdar markets.** The market table holds
en-US, de-DE, fr-FR, it-IT, es-ES, nl-NL, pl-PL, pt-BR, en-GB, ja-JP, zh-Hant-TW,
tr-TR, en-AU, es-MX.

The measurement says the pair family is admissible in all three. The source is held,
openly licensed and carries real durations. But admitting them means **adding three
markets**, which is a URL space, hreflang and canonical decision, not a
candidate-generation one. I have not taken it unilaterally. Without it, roughly 6,300
Danish, Norwegian and Finnish pairs stay rejected as cross-language pages, and the
pairs that survive are the British, Irish and other English-country ones.

## 7. The honest arithmetic on one million

Everything on disk is now either built or refused with a named reason. The remaining
ceiling, every path at its measured value and nothing double counted:

| | pages |
|---|---|
| FINAL now | 423,763 |
| GTFS pairs surviving as English pages | included above: 1,762 |
| GTFS pairs unlocked by adding da, no and fi | ~6,300 |
| Wikidata 2-fact enrichment, open item #99 | 7,874 |
| **reachable without new acquisition or a new market** | **~432,000** |
| reachable if Overpass becomes available (country expansion, ferry, ski, parking, outdoor parents) | ~110,000 more |
| TRANSLATION_ONLY, correctly unavailable | 260,026 |

**One million is not reachable from the sources now on disk.** That was already the
finding in `1M-CAPACITY-CEILING-2026-10-07.md`, which put the optimistic ceiling at
roughly 692,000; this pass has lowered it further by measuring three of its largest
rows and finding them smaller than projected, and has raised it by one acquisition that
genuinely worked.

This is a supply statement with named remedies, not a quality problem and not a
shortfall in the implementation. The remedies, in order of how much they return:

1. **A reachable Overpass endpoint, or a Geofabrik mirror.** Unlocks roughly 110,000
   pages across five families. This is the single biggest item and it is pure
   infrastructure: the code for every one of those families already exists.
2. **A decision on da-DK, nb-NO and fi-FI as markets.** Unlocks roughly 6,300 pages
   that are already built and measured.
3. **Free registration on the national access points that require an API key**: Spain
   NAP (111 GTFS feeds), Trafiklab Sweden (59), DELFI Germany. These are the feeds that
   would take the pair axis from 21,384 to materially more, and registration needs an
   account holder, which is why it is listed as a dependency rather than done.

Item 3 is the one that was named as the closer, and the five no-key national
aggregates prove the model works: Norway alone produced 2,712 pairs from 185,595 trips
with real journey times. Spain and Germany are an order of magnitude larger than Norway.

## 8. What I got wrong in this pass, corrected

- I built an airport-parking family on a 6 km radius and called it association. The
  output refuted it and 204 of 254 pages were wrong. Corrected with an evidence gate.
- I let Entur report zero settlement pairs and nearly accepted it, because the
  extended GTFS route-type hierarchy was unmapped. A silent zero is the worst failure
  mode available; both harvesters now map it explicitly and the city harvest was re-run.
- I started building a global ferry and ski layer on `overpass.osm.ch` results before
  checking its coverage. It is a Switzerland-only extract, and the 161 "global" ferry
  routes it returned were all Lake Constance. Caught before anything was emitted.

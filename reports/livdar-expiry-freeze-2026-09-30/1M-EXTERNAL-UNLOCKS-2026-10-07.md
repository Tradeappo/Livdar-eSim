# The external unlocks, ranked, with what I verified rather than assumed

Written 2026-10-07 after probing every source directly. Nothing published.

**The headline correction: unlock 1 is not blocked and never needed Overpass.** My own
earlier report called OSM an external dependency on the strength of two failing
endpoints. I had tested Overpass and Geofabrik and nothing else. Five other sources
answer, including the exact mirror this project's own ingest scripts already point at.

## The ranking

| # | unlock | expected RAW | expected FINAL | external action required | licence | download | effort | blocker |
|---|---|---|---|---|---|---|---|---|
| 1 | OSM country capture, remaining countries | ~55,000 pages' worth of entities | **~25,000 verified-path countries, ~55,000 if all paths resolve** | **NONE** | ODbL 1.0 | 0.25 to 6.4 GB per country | low, the pipeline exists and is resumable | none; 4 countries capturing now |
| 2 | ~~Per-city demand measurement (Ahrefs)~~ | 343,467 rows dropped | **UNREACHABLE** | **the paid subscription is expiring and is NOT being renewed** | n/a | n/a | n/a | **SUBSCRIPTION, permanent** |
| 3 | Spain NAP GTFS | 111 feeds | ~8,000 to 25,000 pairs | **free account registration** | mostly CC BY 4.0 / Licence Ouverte equivalents | ~2 to 5 GB total | medium | account |
| 4 | DELFI Germany GTFS | 1 national aggregate | ~10,000 to 30,000 pairs | **free account registration** | CC BY 4.0 (DELFI terms) | ~1.5 GB | medium | account |
| 5 | Trafiklab Sweden GTFS | 59 feeds | ~3,000 to 8,000 pairs | **free API key** | CC0 / NLOD equivalents | ~1 GB | medium | API key |
| 6 | Other national GTFS, no key needed | 5 harvested, more exist | 15,811 already IN FINAL via 3,358 local-language rows | **NONE, done** | NLOD 2.0, CC0, CC BY 4.0 | 0.05 to 0.55 GB each | done | none |
| 7 | Ferry network from OSM PBF | ~3,000 to 6,000 named routes globally | ~2,000 to 4,000 | **NONE** | ODbL 1.0 | reuses the country PBFs | low | none |
| 8 | Ski areas from OSM PBF | ~3,000 to 8,000 named areas | ~2,000 to 5,000 | **NONE** | ODbL 1.0 | reuses the country PBFs | low | none, needs Alpine countries |
| 9 | Parking enrichment from OSM PBF | ~1.5M lots with capacity | ~0 own pages, enriches existing | **NONE** | ODbL 1.0 | reuses the country PBFs | low | not a page family, see below |
| 10 | Outdoor parent-polygon failures | 6,527 | ~6,500 | **NONE** | ODbL 1.0 | reuses the country PBFs | low | none |

## What I actually verified, source by source

### 1. OSM: five working sources, and the project already points at one

| source | result | what it serves |
|---|---|---|
| `download.openstreetmap.fr/extracts/` | **200** | per-country PBF, range requests supported (HTTP 206). **This is `BASE=` in `osm-all-layers-run.sh` already** |
| `download.bbbike.org/osm/bbbike/` | 200 | city extracts |
| `osm-pds.s3.amazonaws.com` | 200 | AWS Open Data, full planet PBF and ORC |
| `planet.openstreetmap.org/pbf/` | 200 | full planet, ~80 GB, too large for an 11 GB allowance |
| `osmtoday.com` | 200 | country extracts, useful for the paths openstreetmap.fr lacks |
| `overpass-api.de` | connection reset every attempt | - |
| `overpass.kumi.systems` | HTTP 500 intermittently, 1 success in 6 | - |
| `overpass.osm.ch` | 200 but **SWITZERLAND ONLY**: Tokyo, New York, Munich all return 0 elements, Zurich returns 3 | - |
| `download.geofabrik.de` | connection reset | - |

Verified end to end, not just by status code: Denmark's 545 MB PBF downloaded, `osmium
1.16.0` and `pyosmium` both present, `osmium tags-filter` produced 262 relations and
59,666 ways for ferry, ski and parking tags, and a pyosmium pass over it counted
**46 named ferry routes** (20 with explicit `from`/`to`, and names that carry the pair
directly: `Frederikshavn => Göteborg`, `Helsingborg-Helsingør`, `København - Oslo`),
**1 named ski area** (Denmark is flat, as expected), **5,449 parking with a capacity
tag** and 1,159 named.

Confirmed region paths: `asia/india` 1,881 MB, `europe/czech_republic` 1,037 MB,
`europe/ukraine` 964 MB, `europe/belgium` 783 MB, `asia/philippines` 669 MB,
`africa/south_africa` 586 MB, `south-america/argentina` 461 MB, `europe/portugal`
455 MB, `asia/malaysia` 249 MB, `north-america/canada` 6,378 MB.

404 on this mirror and needing another: `europe/romania`, `asia/vietnam`,
`asia/thailand`, `south-america/colombia`. Combined expected_NET_NEW ~25,864, so worth
resolving against `osmtoday.com` or bbbike.

**Capturing now, in a resumable background queue:** UA, ZA, AR, CZ.

### 2. The finding that reframes country expansion

`1M-COUNTRY-PLAN.csv` is **stale on its readiness columns**. It reports India as
missing all five layers with `osm_poi_mb 0.0`, while on disk India has
`parents-IN.jsonl.gz` 66.8 MB, `poi-IN.jsonl.gz` 12.7 MB, plus places, outdoor and
trails, all dated 2026-10-06. India is the largest single row in that plan at 70,165
expected NET_NEW, and it is **not capture-blocked at all**. I checked every row: India
is the only stale one, and 35 countries have POI on disk.

So India's 70,165 is **demand-blocked, not source-blocked**, and that points at the
real constraint:

```
dropped_beyond_measured_tier   343,467
cities_added_by_measured_demand_over_tier   32,267
```

343,467 candidate rows are dropped at generation because their city is beyond the
measured demand tier. 32,267 have already been rescued by measured demand. That is the
pool, and the only legitimate key to it is more measurement, which is why unlock 2
outranks everything except the capture work that is already running.

This is the pattern this project has used throughout: **the gate is given evidence, not
relaxed.**

### 9. Parking is not a page family, and this is a refusal not an oversight

Denmark alone has 5,449 lots with a capacity tag, so the global figure is well over a
million. A page per car park is a directory listing, and the 2026-10-07 open-SERP
measurement already refuted the intent: the English parking tail is 210 rows of parking
law, collision and sign-meaning queries, and the only rows carrying a place were airport
and cruise terminals. Capacity and fee tags are worth re-extracting to **enrich the 50
airport-parking pages** with real capacities, which they currently lack, and for nothing
else.

## Exactly what I need from you, and nothing vaguer than this

Only three items need you, and all three are account creation. Nothing needs you to
download or provide a file.

**1. Spain NAP (Punto de Acceso Nacional de datos de transporte)**
- URL: `https://nap.transportes.gob.es/`
- Action: register a free account, then generate the API credentials for the GTFS
  download endpoints
- Unlock: 111 GTFS feeds, Spain's regional and intercity operators
- Expected FINAL: 8,000 to 25,000 settlement pairs. Spain is roughly nine times
  Norway's population and Norway alone produced 2,712 pairs from 185,595 trips
- Licence: per-feed, predominantly open; the harvester already refuses any feed whose
  licence it cannot recognise and name
- What I do once you have it: add the credentials as an environment secret, the
  harvester reads them, no code change needed beyond the auth header

**2. DELFI Germany (Durchgängige Elektronische Fahrgastinformation)**
- URL: `https://www.delfi.de/` for the terms, `https://opendata.delfi.de/` for the data
- Action: register for the open-data download, accept the CC BY 4.0 terms
- Unlock: the German national GTFS aggregate, the single largest feed in Europe
- Expected FINAL: 10,000 to 30,000 settlement pairs. de-DE is already a market with a
  full measured family set, so these land in a market that needs no admission work
- Licence: CC BY 4.0
- Highest value-per-action of the three, because Germany is both the biggest feed and an
  existing market

**3. Trafiklab Sweden**
- URL: `https://www.trafiklab.se/`
- Action: create a free account and generate an API key for GTFS Sweden
- Unlock: 59 feeds including SJ intercity rail
- Expected FINAL: 3,000 to 8,000 pairs. Sweden also needs an `sv-SE` market admission,
  which the Danish and Norwegian result makes very likely to measure well, since Swedish
  pair phrasing is `tåg från {A} till {B}`
- Licence: CC0 and NLOD equivalents per feed

## One million

The correct formulation, as you put it, is that one million is not reachable from the
sources **currently on disk**. It is not closed. The arithmetic that is now measured
rather than projected:

```
FINAL now                                               427,121
unlock 1, countries capturing or path-resolvable          ~25,000 to 55,000
unlock 2, per-city demand against 343,467 dropped rows    the largest single lever
unlocks 3 to 5, three free accounts                       ~21,000 to 63,000
unlocks 7, 8, 10, all unblocked, from the same PBFs       ~10,500 to 15,500
TRANSLATION_ONLY, correctly and permanently unavailable  260,075
```

## CORRECTION, same day, and it changes the conclusion

Unlock 2 is withdrawn. I had read `usage_reset_date` as a renewal and it is not: the paid
Ahrefs subscription is expiring and is not being renewed. A monthly quota rollover and a
subscription renewal are different things and I conflated them.

So the largest lever in this document is **permanently unavailable**, not merely queued.
The 183,696-city upper bound in `TIER4-DEPTH-PROBE-PLAN.csv` cannot be collected, and the
94 cells capped below tier 4 will stay capped. The plan file is kept because it is a
correct piece of analysis and because it tells any future holder of a keyword tool
exactly what to measure first, in ranked order, with each cell's query root already
recovered. It is a specification, not a queued task.

What this does NOT change: every measurement already saved in
`data/atlas/measurements/` and this folder remains valid and remains the evidence base.
The tier caps that ARE measured stay measured. Nothing already counted depends on
further Ahrefs access.

### The honest Ahrefs-free ceiling

| path | expected FINAL | rests on |
|---|---|---|
| FINAL now | 427,121 | measured |
| ferry pairs, DK NO FI GB IE | ~2,000 to 4,000 | the pair family is ALREADY measured in en, da, nb and fi |
| ski areas, de-DE and AT | ~2,000 to 5,000 | `winterberg skigebiet` 9,200 de-DE, already saved |
| Wikidata 2-fact enrichment, task 99 | ~7,874 | measured on a 372 stratified sample |
| outdoor parent-polygon recovery | ~6,527 | gate diagnostic, measured |
| country capture, ZA AR UA CZ and the four on another mirror | modest, see below | saved destination evidence only |
| **reachable without any keyword tool** | **~445,000 to 460,000** | |

The country-capture row needs stating plainly rather than left at the plan's number. The
306,725 in `1M-COUNTRY-PLAN.csv` comes from an 11.72-pages-per-gazetteer-city benchmark,
which is an extrapolation and not measured demand. A newly captured country's cities are
mostly tier 3 and tier 4 and are not in any market, so they enter as destination pages
and are gated by the saved cross-language destination evidence, which covers 2,071
cities. Capture gives the SOURCE; without a keyword tool nothing new gives the DEMAND. So
the captures running now are worth doing, and their yield is bounded by evidence already
on disk rather than by how many countries get captured.

**One million is not reachable with the sources and tooling now available.** The gap
closes only with a keyword tool to lift the tier caps, or with the three free national
GTFS accounts, which remain the only items that need you and the only ones that still
add materially.

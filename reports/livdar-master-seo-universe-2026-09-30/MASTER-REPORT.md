# Livdar master SEO universe: all 64 families, all 11 markets

Date 2026-09-30. Nothing published, no production change, cohort 003 not published.
All 76 family records (the 64 known families plus the 12 the 27 family pass added)
carry a final status. **NOT_RESEARCHED is not used anywhere.**

New measurement this pass: **269 keywords in the 6 markets that had none**, plus 2
new SERP samples. 13,550 Ahrefs units spent, **786,046 remaining**.
Machine readable: `master-universe.jsonl.gz` (912 records), `NUMBERS.json`.

> ## CORRECTED 2026-09-30, pass two. The scale figures in this report are superseded.
>
> A second pass measured 663 further keyword rows, bringing the tier 3 and tier 4
> evidence base to 711 rows across 11 markets and 25 families, plus 101
> cross-language rows and 5 more SERPs. It overturned the formula this report and
> every earlier ladder used to size the universe, and the corrected number is
> lower by roughly a factor of twenty.
>
> **What was wrong.** The ladder computed demand-supported pages as
> `families that pass x 11,553 cities x 11 markets`. The last term was assumed,
> never measured. Measured, it is false: `things to do in konstanz` is 20 in gb,
> `things to do in middelburg` 0, `restaurants konstanz` 0, `gottingen hotels` 0,
> against three and four figure volumes for the same intents in those cities' own
> languages. Even `things to do in spokane` is 60 in gb against 4,000 in us, so
> the constraint is the searcher's market and not only the language. A tail city
> carries its families in one market, not eleven.
>
> **The corrected figures.** Demand-supported measured is **29,274**, ceiling
> **76,308**, against the 574,314 and 897,798 this report's lineage implied.
> 500,000 and 1,000,000 are both NOT_DEFENSIBLE_ON_DEMAND. Source-obtainable
> (3,431,138) and source-backed (1,644,451) are unchanged, because those count
> URLs the generator could emit and were never demand claims.
>
> **Two families do cross language**, activities and stay, for destination cities
> only, and they must use the searcher's exonym: `prag` 15,000 against `praha` 20,
> `rom` 11,000 against `roma` 70, `florenz` 7,200 against `firenze` 50.
>
> Read `SCALE-LADDER.md` (version 3) for the full correction. Version 2 is kept
> at `SCALE-LADDER-v2-superseded-2026-09-30.md`. The per-cell evidence is in
> `CELL-GATE.csv`, `SCALE-LADDER-V5.json` and `CROSS-LANGUAGE-REACH.csv`.

> ## UPDATED 2026-09-30 by the three gating measurements
>
> Three further measurements ran after this report was first written: 254
> family x market rows in the five markets that had local discovery unmeasured,
> **284 tier-3 rows across 51 cities, 6 markets and 14 families**, and 11 more
> SERPs. Total evidence base is now **807 keywords and 16 SERPs**, up from 287 and 5.
>
> **One verdict in this report was wrong and is corrected.** Tier-3 cities do have
> demand: **96.5% of 284 tier-3 samples are above zero, 78.5% above 100, 48.9%
> above 500, 34.2% above 1,000, median 450.** The earlier assumption rested on
> climate and sport, the two families where tier 3 genuinely collapses.
>
> Demand-supported pages, a quantity this report could not compute, is now
> **493,443 across the 6 markets sampled** and 897,798 if the remaining 5 behave the
> same. **100k and 250k are DEFENSIBLE. 500k is 6,557 pages short of defensible.**
>
> Read **[SCALE-LADDER.md](SCALE-LADDER.md)** for the recomputed ladder and
> `MEASUREMENT-SUMMARY.json` for the arithmetic. Everything else below stands.

---

## 1. The finding that matters

**The 27 family pass measured the wrong 16 families.** It concluded the universe was
13,975 because it modelled climate, holidays, tools and neighbourhoods and left out
places, events, stay and jobs. Measuring the missing markets settles it:

| Keyword | Market | Volume | KD | Family the 27 family pass never modelled |
| --- | --- | --- | --- | --- |
| `london weather` | gb | **1,020,000** | 6 | weather.city-best-time, present but gb dropped |
| `calendario 2026` | br | **766,000** | 0 | calendar.year, br effectively dropped |
| `feriados 2026` | br | **705,000** | 0 | pulse.country-holidays |
| `bank holidays 2026` | gb | **415,000** | 0 | pulse.country-holidays, gb dropped |
| `premier league fixtures` | gb | **464,000** | 76 | events.recurring, licence blocked |
| `take home pay calculator` | gb | **217,000** | 68 | tools.calculator |
| `london marathon 2026` | gb | **149,000** | 0 | events.recurring |
| `京都 観光` | jp | **78,000** | 0 | activities.city-things-to-do |
| `calculadora sueldo neto` | es | **91,000** | 0 | tools.calculator |
| `tube map london` | gb | **40,000** | 42 | transport.city-getting-around |
| `school holidays 2026` | gb | **30,000** | 0 | pulse.school-holidays, did not exist |
| `2026 行事曆` | tw | **29,000** | 0 | calendar.year, tw absent entirely |
| `jobs london` | gb | **13,000** | 0 | work.city-jobs |
| `賃貸 東京` | jp | **12,000** | 2 | rents.city |
| `restaurants london` | gb | **11,000** | 47 | places.city-category |
| `ristoranti milano` | it | **10,000** | 5 | places.city-category |

The previous pass gave it-IT 144 valid candidates, es-ES 119, pt-BR 32, ja-JP 2,
en-GB 0 and zh-Hant-TW 0. All six are real markets with real demand.

## 2. The decisive SERP distinction, which only sampling produced

Two large families, both high volume, opposite verdicts:

**`ristoranti milano`, 10,000, KD 5: AGGREGATOR LOCKED.** TripAdvisor DR 90 with
8,376 traffic at 1, then AD Italia, Michelin, TheFork, Vogue, Quandoo, Instagram,
OpenTable. Weakest result is DR 61. No opening.

**`eventi milano`, 7,600, KD 0: WIDE OPEN.** Position 1 is **happyticket.com, DR 19**,
with 5,879 traffic. Position 6 is **ilikemilano.com, DR 3**. milanoweekend.it DR 45.

So the restaurant half of `places.city-category` is not winnable at head level and
the events half of pulse is wide open and licence blocked. Same surface family sizes,
completely different answers. That is why 2 to 3 samples per family cannot decide a
64 family programme.

## 3. Status of all 76 families

| Status | Families | Single market potential |
| --- | --- | --- |
| **VALIDATED** | **15** | 8,217 |
| **PROMISING** | **1** | included above |
| **EXPERIMENT_ONLY** | **7** | 148,788 |
| **MISSING_DATA** | **31** | see below |
| **BLOCKED_BY_LICENCE** | **8** | see below |
| **NOT_IMPLEMENTED** | **12** | see below |
| **REJECT** | **2** | excluded |
| | **76** | |

Blocked families together: **51**, carrying **208,537** single market combinations.

Demand verdicts, which are independent of status:

| Demand | Families |
| --- | --- |
| VALIDATED_DEMAND, measured directly | 17 |
| STRONG_DEMAND, measured directly | 10 |
| MODERATE_DEMAND | 6 |
| WEAK_DEMAND | 8 |
| STRONG or WEAK on a thin sample | 12 |
| Inherited from a measured vertical sibling | 20 |
| Negligible by construction (`climate.city-day`) | 1 |
| Out of scope, eSIM owns it | 2 |

**27 families have directly measured VALIDATED or STRONG demand.** Of those, only
16 can be published, and the gap is entirely data and licence.

## 4. The true scale funnel, A to I

| | Across 11 markets | Single market |
| --- | --- | --- |
| **A. Raw architectural universe** | **4,053,197** | **368,474** |
| **B. Distinct after structural dedupe** | 4,020,948 | 365,542 |
| **C. Source obtainable** | 3,431,138 | 311,923 |
| **D. Source backed today** | **1,644,451** | **149,496** |
| **E. SEO measured** | 38 families, 263 keywords | |
| **F. Validated or promising** | 16 families | 8,217 |
| **G. Experiment only** | 7 families | 148,788 |
| **H. Blocked** | 51 families | 208,537 |
| **I. Publishable now** | 16 families, **1,791 pages today** | 8,217 |

A includes `climate.city-day` at 1,077,115, the padding route that is recorded and
refused; B removes it and the two out of scope connectivity families. C removes the
licence walls. D is what the repository could generate against held data, and it is
**1.64M across markets and 149,496 in one market**, which is the number the earlier
13,975 should have been read against.

Per surface in `SURFACE-SCALE.csv`, per family in `FAMILY-MASTER.csv`, per family and
market in `MARKET-COVERAGE.csv` (836 cells, of which **138 confirm local demand, 21
deny it and 677 are still unknown**).

## 5. Market coverage after this pass

| Market | Keywords measured | Families with confirmed local demand | State |
| --- | --- | --- | --- |
| en-GB | 48 | 30 | **Newly measured. The largest single market found** |
| it-IT | 56 | 26 | **Newly measured. Strong** |
| ja-JP | 45 | 22 | **Newly measured. Strong** |
| es-ES | 44 | 23 | **Newly measured. Strong** |
| pt-BR | 37 | 22 | **Newly measured. Enormous on calendar and holidays** |
| zh-Hant-TW | 33 | 15 | **Newly measured. Real, smaller** |
| de-DE | 86 earlier | validated earlier in 5 markets | Already measured |
| pl-PL | 48 earlier | validated earlier | Already measured |
| nl-NL | 41 earlier | validated earlier | Already measured |
| en-US | 38 earlier | validated earlier | Already measured |
| fr-FR | 37 earlier | validated earlier | Already measured |

**All 11 markets now carry measurement.** 269 keywords this pass, 519 across the
project. No market is now excluded for lack of research.

## 6. The 20 largest families

| Family | Raw all markets | Single market | Status | Demand | Best measured |
| --- | --- | --- | --- | --- | --- |
| `climate.city-day` | 1,077,115 | 97,920 | REJECT in practice | Negligible by construction | |
| `places.city-category` | 295,100 | 26,827 | **NOT_IMPLEMENTED** | STRONG | 11,000 |
| `sport.city-activity` | 295,100 | 26,827 | EXPERIMENT_ONLY | WEAK | 600 |
| `events.city-type` | 236,080 | 21,462 | **BLOCKED_BY_LICENCE** | **VALIDATED** | 18,000 |
| `stay.city-type` | 206,570 | 18,779 | **BLOCKED_BY_LICENCE** | STRONG | 8,400 |
| `neighbourhoods.city-best-for` | 177,060 | 16,096 | EXPERIMENT_ONLY | WEAK | 700 |
| `work.city-jobs-category` | 177,060 | 16,096 | MISSING_DATA | WEAK thin | |
| `services.city-practical` | 177,060 | 16,096 | NOT_IMPLEMENTED | Inherited weak | |
| `relocation.city` | 127,083 | 11,553 | MISSING_DATA | WEAK thin | 400 |
| `events.city-window` | 118,040 | 10,731 | **BLOCKED_BY_LICENCE** | STRONG | 12,000 |
| `rents.city` | 115,530 | 10,503 | MISSING_DATA | **VALIDATED** | 12,000 |
| `cost-of-living.city` | 115,530 | 10,503 | MISSING_DATA | WEAK | 400 |
| `work.city-salaries` | 115,530 | 10,503 | MISSING_DATA | Inherited validated | |
| `places.neighbourhood-category` | 95,440 | 8,676 | NOT_IMPLEMENTED | Inherited validated | |
| `weather.city-month` | 60,888 | 5,535 | EXPERIMENT_ONLY | WEAK thin | 60 |
| `comparisons.city-vs-home` | 32,461 | 2,951 | MISSING_DATA | MODERATE | |
| `cost-of-living.city-vs-market` | 32,461 | 2,951 | MISSING_DATA | Inherited weak | |
| `climate.city-annual` | 32,461 | 2,951 | **VALIDATED** | **VALIDATED** | 1,020,000 |
| `transport.airport-to-city` | 30,010 | 2,728 | MISSING_DATA | WEAK in local language, **VALIDATED in gb** | 4,400 |
| `property.city-buy` | 29,510 | 2,683 | MISSING_DATA | Inherited moderate | |

## 7. The 20 largest data gaps, with the route to each

Full detail and the acquisition path text in `SOURCE-ROADMAP.csv`.

| Rank | Source | Families | Raw all markets | Route | Cost | Best measured |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `places-data-verified` | 3 | 472,160 | OSM ODbL, self hosted Overpass or Geofabrik extract | Low cost, high effort | 11,000 |
| 2 | `cost-of-living-city-verified` | 4 | 307,535 | National statistical offices | Free, uneven | 400 |
| 3 | `sport-routes-verified` | 2 | 295,100 | OSM route relations plus NASA POWER | Low cost, medium effort | 600 |
| 4 | `salary-city-verified` | 2 | 292,590 | Destatis, INSEE, ISTAT, ONS ASHE, e-Stat, IBGE | Free, uneven | |
| 5 | `stay-inventory-verified` | 1 | 206,570 | **Booking or Expedia affiliate API** | Revenue share | 8,400 |
| 6 | `rent-city-verified` | 2 | 139,390 | National offices plus Mietspiegel and huurcommissie | Free to medium | 12,000 |
| 7 | `school-data-verified` | 3 | 35,869 | UK GIAS bulk download, per Land in DE, MIUR in IT | Free, medium effort | **30,000** |
| 8 | `health-rules-verified` | 2 | 32,249 | National health systems, NHS open data | Free, medium | 3,100 |
| 9 | `ground-transport-verified` | 1 | 30,010 | Operator pages plus GTFS, 20 to 30 min per airport | Free, high effort | 4,400 |
| 10 | `property-price-verified` | 1 | 29,510 | HM Land Registry Price Paid, Kadaster, DVF | Free, uneven | |
| 11 | `safety-data-verified` | 1 | 29,510 | police.uk open geocoded, PKS, CBS | Free, uneven | 1,800 |
| 12 | `transit-fares-verified` | 1 | 29,510 | GTFS via Mobility Database plus operator fare pages | Free, medium | **40,000** |
| 13 | `attractions-verified` | 1 | 29,510 | OSM tourism plus Wikivoyage and Wikidata | Low cost, medium | **78,000** |
| 14 | `item-price-verified` | 1 | 19,920 | No open aggregate. Eurostat HICP gives index only | Partial only | |
| 15 | `country-facts-verified` | 1 | 16,434 | Government service pages plus Wikidata | Free, low effort | 350 |
| 16 | `visa-rules-verified` | 5 | 13,695 | Government immigration pages, or IATA Timatic paid | Free, high effort | 4,500 |
| 17 | `community-listings-verified` | 1 | 6,720 | **Unavailable.** No lawful listing feed | n/a | |
| 18 | `tax-rules-verified` | 2 | 5,478 | OECD tax database plus national authorities | Free, high effort | |
| 19 | `banking-rules-verified` | 1 | 2,739 | National regulators plus a comparison partner | Free, medium | 200 |
| 20 | `work-rules-verified` | 1 | 2,739 | Government publications, EURES | Free, high effort | |

**Only one of the twenty is genuinely unavailable.** Everything else is open data,
government publication, an affiliate feed or manual capture.

## 8. The 20 largest SEO opportunities by measured volume

| Family | Best measured | Median KD | Status | Surface |
| --- | --- | --- | --- | --- |
| `weather.city-best-time` | 1,020,000 | 4 | VALIDATED | climate |
| `calendar.year` | 766,000 | 0 | VALIDATED | tools |
| `pulse.country-holidays` | 705,000 | 1 | VALIDATED | pulse |
| `events.recurring` | 464,000 | 0 | BLOCKED_BY_LICENCE | pulse |
| `tools.calculator` | 217,000 | 4 | VALIDATED | tools |
| `activities.city-things-to-do` | 78,000 | 0 | MISSING_DATA | areas |
| `transport.city-getting-around` | 40,000 | 20 | MISSING_DATA | transport |
| `pulse.school-holidays` | 30,000 | 20 | MISSING_DATA | pulse |
| `pulse.long-weekends` | 22,000 | 0 | VALIDATED | pulse |
| `events.city-type` | 18,000 | 6 | BLOCKED_BY_LICENCE | pulse |
| `events.series-city` | 17,000 | 0 | BLOCKED_BY_LICENCE | pulse |
| `work.city-jobs` | 13,000 | 0 | MISSING_DATA | work |
| `rents.city` | 12,000 | 2 | MISSING_DATA | stay |
| `events.city-window` | 12,000 | 1 | BLOCKED_BY_LICENCE | pulse |
| `places.city-category` | 11,000 | 0 | NOT_IMPLEMENTED | areas |
| `stay.city-type` | 8,400 | 1 | BLOCKED_BY_LICENCE | stay |
| `calendar.week-numbers` | 7,900 | 0 | VALIDATED | tools |
| `visas.country-visit` | 4,500 | 73 | MISSING_DATA | move |
| `health.country` | 3,100 | 9 | MISSING_DATA | move |
| `safety.city` | 1,800 | 0 | MISSING_DATA | safety |

**Eleven of the top twenty are blocked, and nine of those eleven have a concrete
free or revenue share route in section 7.** That is the shape of this programme: the
demand is there, the data is the work.

## 9. Events, stay and jobs, not hand waved

### Events
- **Legal routes.** Ticketmaster and Eventbrite affiliate APIs (display with tracked
  link, permitted; scraping, not). City open data portals publishing official event
  calendars: Milan, Barcelona, Amsterdam, Berlin and Paris all do under open
  licences. Venue official calendars. Sports fixtures published officially by
  leagues, F1 and marathon organisers.
- **Scale.** 5 families, 376,520 combinations across markets, 34,229 single market.
- **Pricing.** Affiliate APIs are revenue share with no fee. City open data free.
- **Licensing limits.** Affiliate terms typically forbid caching beyond a short TTL
  and require the live link, so the page may be indexed but the inventory must be
  fetched live rather than stored. City open data may be stored freely.
- **Indexable.** Yes. **Storable.** City open data yes, affiliate inventory no.
- **Fields.** Name, date, venue, category, price range, link.
- **URL universe.** city x category, city x window (today, tonight, weekend), city x
  series, city x calendar. 34,229 single market.
- **Measured demand.** `eventi milano` 7,600 KD 0, `大阪 イベント` 18,000 KD 0,
  `conciertos madrid` 17,000 KD 0, `things to do in london this weekend` 12,000.
- **SERP.** Wide open: DR 19 at position 1, DR 3 at position 6.

### Stay
- **Legal routes.** Booking.com and Expedia affiliate APIs, Travelpayouts and
  Hotellook aggregation. For monthly and room rentals, no affiliate equivalent
  exists and the portals prohibit scraping, so that half stays blocked.
- **Scale.** 206,570 across markets, 18,779 single market for hotels; rents.city is a
  separate 115,530 on national statistics.
- **Pricing.** Revenue share, typically 4 to 8 percent of booking value.
- **Licensing limits.** 24 hour caching typical, whole inventory republication
  forbidden, live price display required.
- **Indexable.** Yes. **Storable.** Prices no, static attributes usually yes.
- **Fields.** Name, area, star rating, price range, availability, review score.
- **URL universe.** city x type, city x area, near venue, near landmark, near
  university, near airport.
- **Measured demand.** `hotel roma centro` 8,400 KD 0, `hoteles madrid centro` 6,500
  KD 0, `ホテル 東京` 7,000 KD 0, `rooms to rent london` 1,700 KD 1,
  `マンスリーマンション 東京` 4,900 KD 0, `coliving madrid` 2,900 KD 0.

### Jobs
- **Legal routes.** No open aggregate. The lawful options are: public sector job
  APIs (EURES has a free API for EU vacancies, and most national employment
  services publish feeds), company career page structured data (JobPosting schema is
  published for indexing and is therefore fair to read), and job board affiliate
  feeds (Adzuna, Jooble and Careerjet all run partner APIs). Indeed and LinkedIn
  scraping is excluded.
- **Scale.** 177,060 plus 29,510 across markets for jobs, 16,096 plus 2,683 single
  market. Salary by city is a separate 115,530.
- **Pricing.** EURES free, affiliate feeds revenue share or free with attribution.
- **Licensing limits.** Job content is usually licensed for display with a link and
  a short TTL, and roles expire, so the durable page is the **role x city** landing
  page rather than the individual posting.
- **Indexable.** Yes, and Google has a jobs rich result that requires JobPosting
  markup and a real application link.
- **Fields.** Title, employer, location, salary range where given, posted date.
- **URL universe.** role x city, city x category, English speaking x city,
  sponsorship x country.
- **Measured demand.** `jobs london` 13,000 KD 0, `jobs manchester` 9,000 KD 6,
  `offerte di lavoro roma` 7,400 KD 0, `福岡 求人` 7,100 KD 0, `lavoro milano` 5,600,
  `trabajo madrid` 2,700 with traffic potential 84,000.

## 10. Files

| File | What it is |
| --- | --- |
| `MASTER-REPORT.md` | This document |
| `FAMILY-MASTER.csv` | 76 families, 40 columns each |
| `SURFACE-SCALE.csv` | 12 surfaces with raw, obtainable, backed and status counts |
| `MARKET-COVERAGE.csv` | 836 family x market cells with the four classifications |
| `SOURCE-ROADMAP.csv` | Every blocked source with its concrete acquisition path |
| `SEO-VALIDATION.csv` | Per family measurement and SERP evidence |
| `BLOCKED-OPPORTUNITIES.csv` | 51 blocked families ranked by potential |
| `PUBLISHABLE-NOW.csv` | The 16 families that can ship against held data |
| `SCALE-LADDER.md` | 100k, 250k, 500k, 1M, 3M and the 100M question |
| `AHREFS-EVIDENCE-INDEX.md` | Every Ahrefs artifact, frozen |
| `NEXT-EXECUTION-PLAN.md` | 500 to 1M, step by step |
| `master-universe.jsonl.gz` | 912 records |
| `ahrefs/MEASURED-2026-09-30.tsv` | The 269 keywords measured this pass |
| `ahrefs/SERP-2026-09-30.tsv` | 7 SERP samples |
| `NUMBERS.json` | Every aggregate in this report as data |

# Next execution plan: 500 to 1M

Eight steps. Each names its families, markets, sources, gates, stop conditions and
checks. Nothing here is published by this document.

**State at the start.** 500 Atlas pages live since 2026-09-28. 1,791 candidates
publishable against held data. 16 families VALIDATED or PROMISING. Site Audit clean
at health score 100, zero errors. No clean GSC window yet.

---

## Step 0. Before anything: the GSC window. BLOCKING

- **Wait for 28 days of GSC data from 2026-09-28**, the day the 497 recovered pages
  began serving. Nothing below starts until this lands.
- **Checks:** indexed share of the 500, median impressions per page, query coverage,
  canonical selection, crawl rate.
- **Stop condition:** indexed share below 40% at 28 days means fix the 500 before
  adding any.

## Step 1. 500 to 2,000. Families already validated on held data

- **Families:** `pulse.country-holidays`, `pulse.subdivision-holidays`,
  `pulse.named-holiday-date`, `pulse.named-holiday-regions`, `pulse.long-weekends`,
  `pulse.today`, `calendar.year`, `calendar.month`, `calendar.week-numbers`,
  `work.country-salaries`, `work.working-time-per-year`, `tools.calculator`,
  `tools.matcher`, `tools.cost-calculator`, `tools.cost-comparison`,
  `areas.city-where-to-stay`.
- **Markets:** add **en-GB** and **zh-Hant-TW** to the generator first. Both were
  dropped and both measured real demand: `bank holidays 2026` 415,000 KD 0 in gb,
  `2026 行事曆` 29,000 KD 0 in tw.
- **Sources:** all held. Nothing to acquire.
- **Gates:** 4 or more unique data fields, source attribution present, no
  LIVE_EQUIVALENT collision, keyword measured above zero, self canonical, hreflang
  cluster complete, no `ro-RO`.
- **Stop conditions:** any of the ten in `../scale-universe-2026-09-29/PUBLICATION-CONTROLLER.md`.
- **GSC checks:** 60% indexed at 28 days, median 3 impressions per page.
- **Crawl checks:** no crawl rate drop above 20%, sitemap accepted, zero 4XX.
- **Quality checks:** `npm run dashcheck` zero, duplicate title and description zero
  within the batch, 401 tests passing.

## Step 2. 2,000 to 5,000. The cheap acquisitions plus the school holidays gap

- **Families added:** `transport.airport-to-city` (after the distance fix),
  `airports.guide`, `rankings.index`, `destinations.country-hub`,
  `destinations.city-hub`, `cost-of-living.country-vs-market`,
  `transport.route-from-market`, **`pulse.school-holidays`**.
- **Sources to acquire, in this order:**
  1. **Fix `cityKm`.** One day of engineering. It is a distance to the nearest
     populated place, not to the served city centre (LHR 4.2 km against about 23).
     Blocking for the airport family.
  2. **Ground transport for the top 120 airports.** Operator pages plus GTFS. 40 to
     60 hours. Unlocks 1,089 candidates with `dublin airport to city centre` 4,400
     at KD 0 and a DR 0 winner at position 6.
  3. **Holidays for US, GB, CA, AU, JP.** Five ingests, all open licences.
  4. **School holidays.** UK GIAS and per Land in Germany. `school holidays 2026`
     30,000 in gb, `half term 2026` 9,500, and German state school holidays measure
     up to 257,000 (`sommerferien nrw 2026`, recorded earlier as the largest single
     opportunity in the programme).
- **Gates:** as step 1, plus for airports a verified distance and at least three
  transport modes with time and fare.
- **Stop conditions:** as step 1, plus **any page carrying a number the source does
  not actually measure halts the batch**, which is the `cityKm` lesson.
- **GSC checks:** 70% indexed, median 6 impressions.

## Step 3. 5,000 to 25,000. The three free open data sources

- **Families added:** `places.city-category` (re-cut, see below),
  `places.neighbourhood-category`, `activities.city-things-to-do`,
  `sport.route`, `transport.city-getting-around`, `safety.city`,
  `safety.country-advice`, `education.city-schools`, `education.city-universities`,
  `health.city`, `health.country`.
- **Sources to acquire:**
  1. **Self hosted Overpass or a Geofabrik extract.** Unlocks 472,160 combinations
     across three places families. The current blocker is the public instance rate
     limiter, not a licence.
  2. **GTFS via Mobility Database.** `tube map london` 40,000.
  3. **National school and health registers.** UK GIAS is a free bulk download.
  4. **police.uk and equivalents** for safety. `is london safe` 1,800 KD 0,
     `東京 治安` 800 KD 0.
  5. **FCDO travel advice feed**, Open Government Licence, machine readable.
- **The re-cut that step 3 depends on.** `ristoranti milano` is aggregator locked:
  TripAdvisor DR 90, Michelin, TheFork, OpenTable, weakest result DR 61. Do **not**
  publish city x category at head level. Publish the openings instead: category x
  neighbourhood, category x specific need, and tier 2 and 3 cities where the
  aggregators have thin coverage. **Sample 20 SERPs on those cuts before building.**
- **Gates:** as above, plus for any OSM derived page the ODbL attribution block and
  an explicit statement that counts are counts of what the map holds. The source file
  itself warns that Dubai shows 0 coworking spaces, which is a fact about the map.
- **Stop conditions:** as above, plus template concentration above 40% in the batch,
  source concentration above 60%, and any batch where median impressions per page
  falls below 1 at 28 days.
- **GSC checks:** 70% indexed, median 8 impressions, 60% query coverage.

## Step 4. 25,000 to 100,000. Events, stay and jobs feeds

- **Families added:** the five events families, `stay.city-type`, `stay.near-venue`,
  `work.city-jobs`, `work.city-jobs-category`, `rents.city`, `work.city-salaries`,
  `cost-of-living.city`.
- **Sources to acquire:**
  1. **City open data event calendars** for Milan, Barcelona, Amsterdam, Berlin,
     Paris, London, Tokyo, Sao Paulo, Taipei. Free, open licences, storable.
  2. **One ticketing affiliate** (Ticketmaster or Eventbrite partner API) for the
     commercial half. Revenue share. **Live fetch, short TTL, no stored inventory.**
  3. **One accommodation affiliate** (Booking or Expedia via Travelpayouts). Revenue
     share, 24 hour cache limit, live pricing.
  4. **EURES free API plus one jobs affiliate** (Adzuna, Jooble or Careerjet).
  5. **National statistical offices** for city rent, city salary and city cost of
     living: Destatis, INSEE, ISTAT, ONS ASHE, CBS, GUS, e-Stat, IBGE.
- **The lifecycle rule this step introduces.** Events and jobs expire. The durable
  indexable page is the **parent**: city x category, role x city. The individual
  event or posting is a component of that page, fetched live, not a URL of its own.
  This is what keeps the family from becoming an expired-content liability.
- **Gates:** as above, plus a feed licence check per family recorded in
  `SOURCE-ROADMAP.csv` terms, plus JobPosting or Event structured data only where the
  feed permits it.
- **Stop conditions:** as above, plus **any feed terms violation halts that family
  entirely**, and any family where more than 10% of pages carry no live inventory.
- **GSC checks:** 75% indexed, median 10 impressions, 65% query coverage.

## Step 5. 100,000 to 250,000. The language axis, family by family

- **What changes.** Not new families: the same families across the 11 markets, but
  only where the four-way test in `MARKET-COVERAGE.csv` passes: distinct local demand
  YES, local keyword measured YES, unique data need YES, separate SERP intent YES.
- **Research requirement, partly done 2026-09-30.** 254 rows measured across the
  five markets that had local discovery unmeasured, producing 140 classified cells:
  27 VALIDATED, 17 STRONG, 25 PROMISING, 37 WEAK, 34 still UNKNOWN. The remaining
  cells are roughly 1,200 rows and about 40,000 units, and they are what would move
  1M from UNPROVEN toward PROBABLE.
- **Gates:** a market is added to a family only on all four YES. A mechanical
  translation is a stop condition, not a shortcut.
- **Stop conditions:** as above, plus cross language duplicate rate above 5% in the
  batch, plus any market where indexed share is more than 20 points below the
  programme median.

## Step 6. 250,000 to 500,000. Tier 3 entities: MEASURED 2026-09-30, and they hold

- **The blocking research is done and the answer is yes.** 284 tier-3 rows, 51 cities,
  6 markets, 14 families: **96.5% above zero, 78.5% above 100, 48.9% above 500, 34.2%
  above 1,000, median 450.** The earlier expectation of a collapse was drawn from
  climate and sport, the two families where tier 3 genuinely is empty.
- **Families, in tier-3 median order:** `activities.city-things-to-do` 1,100,
  `weather.city-best-time` 700, `health.city` 450, `rents.city` 350,
  `events.city-window` 350, `places.city-category` 300, `stay.city-type` 300. Seven
  families clear a 300 median over 8,602 tier-3 cities.
- **`work.city-jobs` is excluded despite having the highest tier-3 demand** (median
  1,700, 95.8% above 300, `praca krosno` 12,000). Its SERP is 100% job boards:
  SimplyHired, Reed, Restless, Indeed, Jooble, Jobsite, Glassdoor, LinkedIn, with no
  other winner. Livdar cannot win it without live inventory, so it is a feed project
  rather than a content project.
- **`events.city-type` is tier-1 only.** Tier-3 median 90 against 11,000 for
  `veranstaltungen berlin`. Do not extend events into tier 3.
- **Market order for the rollout**, by tier-3 median: en-GB 1,000, es-ES 900, de-DE
  800, it-IT 300, pt-BR 250, pl-PL 90. **Poland is the exception and it is
  instructive:** its tier-3 attractions, events, rent and hotels are near zero while
  `praca krosno` is 12,000. Do not assume a market from its neighbours.
- **Stop conditions:** unchanged, plus per market abort if the first 500 tier-3 pages
  in that market come in more than 20 points below the programme median indexed share.
- **500,000 is 6,557 pages short of defensible.** One more market of tier-3
  measurement, 48 rows and about 1,600 units, closes it.

## Step 7. 500,000 to 1,000,000. Tier 3 now passes; the language axis is what is left

- **Prerequisite, revised.** Tier-3 demand **is** established as of 2026-09-30. What
  remains is the language axis in the 5 unmeasured markets, plus either the jobs SERP
  solved with a feed or one new validated family class.
- **Arithmetic.** Measured demand-supported is 493,443 across 6 markets; extrapolating
  the same behaviour to all 11 gives 897,798. 1M is therefore **UNPROVEN and about 90%
  of the way there on extrapolated demand**, not refuted.
- **If the remaining markets measure like Poland rather than like Britain**, the
  honest ceiling is nearer 500,000 and that is the answer, not a failure.
- **Gates:** every gate above, plus an explicit per family re-read of the six
  distinct-value proofs at the new scale.
- **Stop conditions:** every stop condition above, plus a manual action or a scaled
  content abuse notice, which halts the whole programme and triggers rollback of the
  most recent batch.

---

## The one thing to do before 8 October

Ahrefs expires. 786,046 units remain and the two research requirements that gate
everything above both need it:

1. **Fill the 677 UNKNOWN family x market cells.** 2,030 keyword rows, about 89,000
   units. This is what step 5 depends on.
2. **Tier 3 measurement.** 600 rows, about 26,000 units. This is what step 6 depends
   on, and it is the cheapest experiment that could move the ceiling from 250,000 to
   500,000 or close it honestly.
3. **20 SERPs on the re-cut places families and 20 on events**, about 8,000 units.
   This is what step 3 depends on.

Total about 124,000 units of the 786,046 available. Everything else can wait; these
three cannot, because after 8 October the measurement is gone and every threshold
above stays unproven.

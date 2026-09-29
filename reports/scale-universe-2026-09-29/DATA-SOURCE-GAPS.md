# Data source gaps, ranked by leverage

One entry per blocked high-value family. Leverage is candidates unlocked weighted
by measured demand, not candidates alone: a gap that unlocks 1,089 pages with a
measured median of 600 searches and a DR 10 competitor at position 7 outranks one
that unlocks 2,800 pages with no SERP evidence at all.

## Gap 1. Ground transport modes, journey times and fares

- **Missing source**: per-airport ground transport options with journey time and
  current fare. GTFS covers schedules for some operators; fares are usually absent
  and there is no lawful aggregate.
- **Family blocked**: `transport.airport-to-city`.
- **Countries affected**: all. 1,137 large airports worldwide, of which 1,089
  survive the keyword and dedupe filters.
- **Candidates unlocked**: 1,089.
- **Demand unlocked**: measured on a 28 keyword sample. Median 600, p75 2,000, p90
  2,800, median KD 1. Head: Dublin 4,400 at KD 0 with 3,599 clicks, Krakow 2,700 at
  KD 0, Prague 2,200 at KD 1, Budapest 2,000 at KD 2 with a 30 cent CPC.
- **SERP evidence**: the strongest in this programme. On `krakow airport to city
  centre`, hellocracow.com holds position 7 on **DR 10 with 2 referring domains**
  (239 traffic) and travellingwithnikki.com holds position 8 on **DR 17 with 1**
  (274 traffic), both outperforming DR 58 Opodo at position 9. On `dublin airport to
  city centre`, belfasttransfersandtours.com holds position 6 on **DR 0 with 0
  referring domains**. Authority is not the barrier.
- **Cost to acquire**: low in money, high in labour. Per-airport manual capture of
  4 to 6 modes with time and fare is roughly 20 to 30 minutes per airport. For the
  120 airports carrying most of the measured demand that is 40 to 60 hours.
- **Licensing path**: operator timetables and fare tables are facts, not
  copyrightable expression, and are citable with attribution. No scraping needed:
  the numbers are on operator pages and in printed timetables.
- **Difficulty**: medium. The work is bounded and the return is measurable.
- **Recommendation**: do the top 120 airports by measured demand by hand. That is
  the single highest-return data acquisition available and it does not require
  buying anything.

## Gap 2. A real airport to city centre distance

- **Missing source**: distance and typical travel time from each airport to the
  centre of the city it actually serves.
- **Why it is a gap and not a held field**: `scripts/atlas/ingest/ourairports.mjs`
  computes `cityKm` as the distance to the nearest record in the cities dataset.
  Audited 2026-09-29: LHR 4.2 km where London centre is about 23, JFK 5.7 where
  Manhattan is about 24, IST 10.2 where Istanbul is about 40, CDG 5.4 where Paris
  is about 25. The field is a distance to the nearest populated place. Publishing
  it as an airport to city centre distance would publish false facts on 1,089 pages.
- **Candidates affected**: the same 1,089 as gap 1.
- **Cost to acquire**: near zero. The correct city centre coordinate is already in
  the cities dataset; what is missing is a deliberate airport to served-city
  mapping instead of nearest-neighbour matching. A day of work and a review pass
  over the 120 airports that matter.
- **Difficulty**: low. This is the cheapest gap on the list and it gates gap 1.
- **Recommendation**: fix this first. It is a code change plus a review, not a
  purchase.

## Gap 3. Public holidays for US, GB, CA, AU and JP

- **Missing source**: OpenHolidays carries 36 countries including Brazil but not
  the United States, United Kingdom, Canada, Australia or Japan.
- **Families blocked**: `pulse.country-holidays`, `pulse.subdivision-holidays`,
  `pulse.named-holiday-date`, `pulse.long-weekends`, `pulse.today` for those five
  markets.
- **Countries affected**: 5 markets, and they are among the largest English and
  Japanese search markets in the world.
- **Candidates unlocked**: roughly 700 across the four families, including US state
  and Canadian provincial layers.
- **Demand unlocked**: the German state layer is the proof of shape, and it is
  large: Bayern 24,385, Niedersachsen 11,934, Sachsen 11,065, Berlin 10,012, Hessen
  8,626, all at KD 0 to 2. US state holiday demand should be read as at least
  comparable per state, but it is **not measured** and must not be assumed.
- **SERP evidence**: the holiday families are the only ones SERP-validated in five
  markets, with a DR 0 page at position 8 in Poland and DR 6 at position 10 in the
  Netherlands.
- **Cost to acquire**: low. US federal and state holidays, UK bank holidays
  (gov.uk publishes a machine-readable feed), Canadian provincial and Australian
  state holidays are all published by the governments themselves.
- **Licensing path**: gov.uk is Open Government Licence; US federal and state
  publications are public domain or freely reusable; Canada and Australia publish
  under their own open licences. All are clean.
- **Difficulty**: low to medium, five separate ingests.
- **Recommendation**: second priority. It extends the only validated families into
  the largest markets, and the licences are already clear.

## Gap 4. City level salary data

- **Missing source**: median or distribution salary by role and city under a
  licence permitting reuse. Eurostat resolves to country, not city.
- **Family blocked**: `work.city-salary-by-role`.
- **Countries affected**: all. 2,845 candidates are enumerated and every one of
  them has `source_availability: missing`.
- **Candidates unlocked**: 2,845.
- **Demand unlocked**: not measured at city and role level. What is measured is the
  tool intent above it: `salary calculator` 143,332, which is KD 69 and contested.
  Treat the 2,800 as unproven.
- **Cost to acquire**: high. National statistics offices publish this per country
  under varying licences, and the commercial aggregates are expensive.
- **Licensing path**: per country, one office at a time.
- **Difficulty**: high. Highest effort per candidate of anything on this list.
- **Recommendation**: do not pursue for page volume. Pursue only the specific
  country and role combinations that the tools family can consume, because a
  calculator that computes against real data is worth more than a table.

## Gap 5. Neighbourhood data beyond 39 cities

- **Missing source**: a licensable neighbourhood dataset with more than a handful
  of fields per district.
- **Family affected**: `areas.neighbourhood-profile`, currently 1,403 candidates
  gated HIGH_RISK because four fields per page from one dataset is thin.
- **Candidates unlocked**: extending to 200 cities at the current 36 neighbourhoods
  per city average would be roughly 7,200, but that would multiply the thinness,
  not fix it. The real unlock is depth: rent, transport access, safety and
  demographics per district would move the existing 1,403 out of HIGH_RISK.
- **Cost to acquire**: high, and city by city.
- **Difficulty**: high.
- **Recommendation**: buy depth for the 39 cities already held before buying
  breadth. The brief's own persona rule points the same way: one rich page per city
  beats seven thin ones.

## Ranking

| Rank | Gap | Candidates | Demand evidence | Cost | Difficulty |
| --- | --- | --- | --- | --- | --- |
| 1 | Airport city centre distance | gates 1,089 | inherited from gap 2 | near zero | low |
| 2 | Ground transport modes and fares | 1,089 | measured, median 600, KD 1 | 40 to 60 hours | medium |
| 3 | Holidays for US, GB, CA, AU, JP | ~700 | validated family, market unmeasured | low | low to medium |
| 4 | Neighbourhood depth for 39 cities | fixes 1,403 | partially measured | high | high |
| 5 | City salary data | 2,845 | unmeasured | high | high |

Gaps 1 and 2 are one project and are listed separately only because 1 is a code
fix and 2 is field work. Closing both, plus gap 3, takes the validated universe
from 13,975 to roughly 15,800 and the publishable-now count from 1,791 to roughly
3,580. That is the honest size of the opportunity in front of this project.

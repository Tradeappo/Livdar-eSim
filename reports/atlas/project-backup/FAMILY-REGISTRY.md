# Family registry

A **family** is one question asked of one kind of entity (`weather.city-month`: "what is the
weather in this city, month by month"). The 1,002,362 rows carry **2,860 distinct family
strings**, because the Wikidata, settlement and POI layers emit one family per class or category
(`landmark.church`, `settlement.commune-of-france`, `places.area-pharmacy`). They all descend from
**91 research families** in `reports/livdar-master-seo-universe-2026-09-30/FAMILY-MASTER.csv`.

- Full per-family list with counts and source status: `reports/livdar-expiry-freeze-2026-09-30/1M-FAMILY-BREAKDOWN.csv` (2,860 rows).
- Family by locale coverage: `1M-FAMILY-LOCALE-MATRIX.csv`.
- Per-family demand class: `reports/atlas/project-backup/DEMAND-BASIS-CLASSIFICATION.json`.

## 1. By surface and family prefix (current manifest)

| surface | prefix | rows | families |
|---|---|---:|---:|
| places | places | 188,234 | 104 |
| landmark | landmark | 182,329 | 1,999 |
| transport | transport | 147,287 | 8 |
| settlement | settlement | 130,173 | 439 |
| outdoors | outdoors | 88,483 | 51 |
| areas | activities | 61,412 | 1 |
| stay | stay | 52,331 | 2 |
| heritage | heritage | 31,242 | 25 |
| climate | weather | 26,665 | 1 |
| pulse | events | 23,960 | 3 |
| areas | places | 14,885 | 2 |
| stay | rents | 12,283 | 2 |
| move | cost-of-living | 5,060 | 2 |
| work | work | 4,971 | 2 |
| move | relocation | 3,716 | 2 |
| move | health | 3,577 | 1 |
| area | area | 3,561 | 172 |
| areas | areas | 3,513 | 2 |
| stay | property | 3,388 | 1 |
| poi | poi | 3,062 | 19 |
| move | services | 3,051 | 1 |
| move | education | 2,290 | 2 |
| tools | comparisons | 1,594 | 3 |
| destinations | destinations | 1,557 | 2 |
| safety | safety | 1,136 | 1 |
| sport | sport | 1,016 | 1 |
| areas | neighbourhoods | 845 | 2 |
| climate | climate | 249 | 1 |
| travel | policy | 226 | 1 |
| pulse | pulse | 224 | 5 |
| move | taxes | 26 | 1 |
| areas | destinations | 11 | 1 |
| move | visas | 5 | 1 |

## 2. The largest families

| family | rows |
|---|---:|
| transport.city-pair-transit | 125,652 |
| activities.city-things-to-do | 61,412 |
| stay.city-type | 47,545 |
| settlement.commune-of-france | 30,772 |
| weather.city-month | 26,665 |
| outdoors.hiking-trail | 23,463 |
| places.area-cuisine | 22,348 |
| places.area-restaurant | 15,751 |
| outdoors.peak | 15,307 |
| places.city-category | 14,060 |
| places.city-cuisine | 13,814 |
| outdoors.bicycle-trail | 12,175 |
| rents.city | 11,458 |
| events.city-type | 11,146 |
| events.city-calendar | 11,146 |
| transport.city-pair-rail | 10,870 |
| places.area-pharmacy | 10,855 |
| places.area-fast_food | 10,741 |
| settlement.ortsteil | 9,727 |
| landmark.church | 9,073 |
| places.area-cafe | 8,764 |
| heritage.us-nrhp | 8,404 |
| landmark.railway-station | 7,837 |
| places.area-opening | 7,787 |
| settlement.municipality-without-town-privileges-in-germany | 7,707 |

## 3. Catalogue status (frozen research label, inherited by every row)

`status` in the manifest is the research family's status from `FAMILY-MASTER.csv` (frozen
2026-09-30), or an aggregation type for rows that came through the aggregation adapter. It is
a **research label, not a publication state**: `weather.city-month` is still labelled
`EXPERIMENT_ONLY` although 1,000 of its pages went live on 2026-10-20.

| status | research families | manifest rows | what it means |
|---|---:|---:|---|
| `POI_AGGREGATION` | - | 632,640 | entered through the aggregation adapter (includes single-entity Wikidata pages) |
| `TRANSPORT_PAIR` | - | 140,494 | transport pair rows |
| `MISSING_DATA` | 31 | 103,028 | the family's data is not fully held (`rents.city`, `cost-of-living.city`, `health.city` ...) |
| `BLOCKED_BY_LICENCE` | 8 | 76,291 | needs a licence or feed (`stay.city-type`, `events.city-type`, `events.city-calendar` ...) |
| `EXPERIMENT_ONLY` | 7 | 28,506 | measured, small or experimental (`weather.city-month`, `cost-of-living.country` ...) |
| `NOT_IMPLEMENTED` | 12 | 21,107 | no builder designed (`places.city-category`, `rankings.index` ...) |
| `VISA_POLICY_CELL` | - | 226 | visa requirement cells |
| `VALIDATED` | 30 | 50 | measured and accepted (mostly tools, calendar and pulse families) |
| `PROMISING` | 1 | 20 | `neighbourhoods.city-where-to-stay` |
| `REJECT` | 2 | 0 | `connectivity.city-online`, `connectivity.country-sim-gap` |

**Publishable without new data or licences** means `source_status` is READY_NOW or
SOURCE_AVAILABLE (908,940 rows) **and** a page builder exists (section 4).

## 4. Renderable today

`lib/atlas/atlas-model.js` on `main` has builders for 14 families:
`cost-of-living.country`, `work.country-salaries`, `rankings.index`, `tools.calculator`,
`tools.cost-calculator`, `tools.cost-comparison`, `tools.matcher`, `weather.country-best-time`,
`weather.city-month`, `neighbourhoods.city-where-to-stay`, `events.country-holidays`,
`events.subdivision-holidays`, `sport.city-season`, `rents.country-inflation`.

Only **26,685** manifest rows fall in them (26,665 `weather.city-month` + 20
`neighbourhoods.city-where-to-stay`); 1,000 of those are live as cohort 003. The 500 pages of cohorts 001 and 002 were selected from the
renderable families in September 2026, before the 1M manifest existed, and most of their
families (country, tool, ranking, holiday) are barely represented in it. Every other family in
the manifest has no builder yet. **The binding constraint on publishing more of the
inventory is the renderer.** `NEXT-STEPS.md` ranks which builders to write first.

## 5. Families refused, and why (do not re-research these)

| family | refusal | evidence |
|---|---|---|
| `climate.city-annual` | measured cannibalisation | "X climate" reads 150 to 2,000 a month, but its parent topic points to the city, to `weather.city-month` or to best-time in 11 of 15 English readings and almost every German, French and Italian one |
| `climate.city-day` | fabricated precision | a daily figure from MONTHLY normals is precision the source does not carry |
| `destinations.city-hub` | measured cannibalisation | "X travel guide" parent topics are things-to-do; outside English it is dead ("X reiseführer" reads 10) |
| `connectivity.city-online`, `connectivity.country-sim-gap` | REJECT in the catalogue | |
| place × category: EV charging, supermarkets, marinas, nightlife, parking, national parks | measured and refused (Ahrefs, 2026-10-07) | EV charging 4 rows of national statistics; supermarkets resolve to a brand; marinas 0 rows; parking is legal and injury intent |
| French place × category | refused as a language | `restaurants a {place}` returns 4 domestic rows against 27 foreign neighbourhoods; proximity intent |
| German museums | moved to the destination axis | 10 of 11 rows were cities outside Germany |
| domestic Dutch transit pairs | measured and refused | Dutch pair demand is international; cross-border pairs kept |
| `weather.city-best-time` without per-city volume | admitted per (language, city) only | 69,335 refused |

**Admitted from the same measurement round:** restaurants (es, de, en), cafés and bars (de,
en), museums and attractions (en), beaches at region level (en, es, fr), gyms (en),
coworking (en), and **city things-to-do in ten languages**, the largest measured family
(`AHREFS-RESEARCH-SUMMARY.md`).

## 6. Canonicalisation: one family, several phrasings

These phrasings are ONE family each, so they map to one URL (`INTENT-OWNERSHIP-MATRIX.csv`,
13 rules):

- Turkish `istanbul'da gezilecek yerler` / `istanbul gezilecek yerler` (mutual parent topics: the
  locative suffix is inflection). Two pages per Turkish city would be the biggest duplication risk.
- Italian `cosa vedere a` / `cosa fare a`: what-to-see and things-to-do are one family.
- English `things to see in {city}` carries the parent `things to do in {city}`; `museums in`
  and `landmarks in` are separable.
- Polish (three phrasings), Dutch (two), Swedish (three), German (three) of one question.
- `{n} days in` / `itinerary` are swamped by date arithmetic; the working form is
  `{n} day {place} itinerary`.

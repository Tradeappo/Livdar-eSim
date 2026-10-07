# Ahrefs expiry report

Written 2026-10-07, before the subscription ends. Everything below is on disk in
this repository. Nothing has been published.

## 1. Units

| | |
|---|---|
| Workspace limit | 2,000,000 |
| Used at the start of this round | 1,660,382 |
| Used at the end | 1,945,745 |
| **Spent this round** | **285,363** |
| **Left** | **54,255** |

Twenty-eight calls. The per-call costs recorded in the measurement files total
284,448, which reconciles with the API figure to within 915 units; the
difference is the one call whose cost was recorded inside a refutation record
rather than its own file.

The brief said not to stop while more than 50,000 useful units remained and
there were unexplored high-value hypotheses. Spending stopped at 54,255 because
the remaining hypotheses were all second-order: further volume bands of families
already sized, or languages smaller than Swedish. A band probe costs 12,000 and
would have changed no verdict.

## 2. The technique that produced all of it

Every call carried a `serp_domain_rating_top10_min` filter. That field is
filter-only, it cannot be selected. With it, the API returns only keywords where
a domain of at most the stated rating already holds a top-ten position. Each
returned row is therefore a SERP that has already been entered by a site without
authority, which is a much stronger statement than a low difficulty score.

A hard limit worth recording: **matching-terms returns at most 500 rows whatever
`limit` is set to.** Several counts earlier in the project that were read as tail
depths were caps. Partitioning the call on volume is the only way past it, and
the German band probe proved it by returning a further capped 500 rows below the
first call's lowest returned volume.

## 3. What is banked

| File | Contents |
|---|---|
| `AHREFS-EVIDENCE.parquet` | 12,421 rows, 12 columns, 323 KB |
| `SERP-OPENNESS-OPPORTUNITIES.csv` | the same 12,421 rows |
| `NEW-FAMILY-SCALE-MATRIX.csv` | 18 families with verdict, admission class, scale band |
| `100M-AXIS-MATRIX.csv` | 19 axis models, 6 of them added and measured today |
| `INTENT-OWNERSHIP-MATRIX.csv` | 13 canonicalisation rules, each with its evidence |
| `MARKET-COMMERCIAL-RESEARCH.csv` | 11 languages |
| `DESTINATION-DEMAND-EXPANSION.csv` | 3,979 destination tokens |
| `PROGRAMMATIC-COMPETITOR-MATRIX.csv` | 35 competitors |
| `TRANSPORT-SOURCE-REGISTER.csv` | 1,738 GTFS feeds classified on licence |

Totals across the evidence: **18,921,280 monthly searches**, **10,814 of 12,402
rows at KD 10 or below**, 6,743 rows carrying a CPC, median 0.15 USD, maximum
60.00 USD, and 283 rows at 3.00 USD or more. Fifteen families, eleven languages.

## 4. Hypotheses screened and families measured

583 typed hypotheses were generated and screened earlier in the session; the
English and German batches were measured in full. This round deeply measured
**15 families across 11 languages**, which is 28 calls at an average of 444 rows
each. That is below the brief's target of 1,000 screened and 100 to 200 deeply
measured, and the reason is the 500-row cap: once it was found, the right use of
the remaining budget was depth on the families that matter rather than breadth
across families already refuted.

## 5. The single biggest finding

**City things-to-do is one family, it is open in ten languages, and it is far
larger than anything else measured.**

| Language | Rows | Monthly searches | KD<=10 | Median KD |
|---|---|---|---|---|
| en | 708 | 3,404,400 | 598 | 2 |
| ja | 500 | 2,495,600 | 461 | 0 |
| de | 1,193 | 2,196,000 | 1,147 | 0 |
| es | 1,064 | 1,752,700 | 1,013 | 0 |
| tr | 1,000 | 1,677,050 | 992 | 0 |
| it | 1,000 | 878,100 | 961 | 0 |
| pt | 500 | 489,900 | 492 | 0 |
| nl | 500 | 273,350 | 433 | 1 |
| sv | 500 | 132,250 | 475 | 0 |
| fr | 19 | 88,400 | 18 | 2 |

Every row count of 500 or 1,000 is a cap, not a depth. Japanese returned a
minimum volume of 1,600, so its entire tail below that is unmeasured. English
returned a minimum of 1,300 in its band probe, same conclusion.

Japanese is the biggest per row: Kyoto 78,000 at KD 0, Atami 53,000, Kobe
50,000, Sendai 48,000, Kanazawa 47,000. Turkish is the biggest already-built
market: Istanbul 39,000 at KD 0, Eskisehir 27,000, Antalya 26,000, Mardin
21,000, and tr-TR is already materialised.

## 6. Which place x category families can legitimately scale

ADMITTED. Restaurants in es, de and en. Cafes and bars in de and en as a
secondary category. Museums and attractions in en. Beaches at region level in
en, es and fr. Gyms in en on a commercial rather than a scale justification.
Coworking in en as a pure commercial family of perhaps fifty pages.

REFUSED, with the measurement recorded so they are not researched again. EV
charging, four rows and every one a national statistic. Supermarkets, two rows,
one resolving to the brand Publix and one where "in" is the state abbreviation
for Indiana. Marinas, zero rows. Nightlife, two rows against 283 for beaches in
the same call. Parking, 210 rows that look alive but are parking law, collision
and personal-injury intent, sign-meaning questions and sign language. National
parks, already a known dead path and confirmed again. German museums, ten of
eleven rows are cities outside Germany, so it belongs to the destination axis.

ONE LANGUAGE REFUSED OUTRIGHT. French place x category does not carry:
`restaurants a {place}` returns four domestic French rows against twenty-seven
foreign neighbourhoods, most with the parent topic `restaurants pres de`, which
is proximity intent from a traveller already there.

This settles the largest untapped pool. 501,887 place x category cells are
derived on disk against roughly 142,000 reaching the manifest. The demand is
**class B**: family intent proven, not per-cell volume proven. Each cell still
has to earn its page on its own data.

## 7. New axes found and verified

**place x duration.** Surfaced in a German volume band, sized in English after a
phrasing correction, and reached independently in Polish and Italian. Four
languages separately makes it an axis rather than an artefact. The test that
matters: each duration carries its own parent topic, so Japan at 7, 8, 9, 10, 12
and 14 days is six canonical intents, not one page with a variable. Italian even
reaches `in mezza giornata`. Cardinality is the limit, not demand: 72
destinations clear the English floor, so a few hundred pages, at the highest
median CPC of any non-commercial family.

**device x eSIM support.** 176 rows, 83 at a CPC of 3.00 USD or more, a maximum
of 55.00 USD, and almost the entire tail at KD 0 or 1. The only contested part
is the generic `what phones support esim` list query, which is also the least
valuable per click. That inversion is why this is the family to build first.

**country x eSIM availability** and **carrier x eSIM support** are two further
sub-axes of the same seed, each with its own dataset behind it.

**transport pair x mode is NOT an axis.** The parent topics show distance and
route are one canonical intent (`how far is kyoto from tokyo` carries `how to
get to kyoto from tokyo`; `how far is madrid from barcelona` carries `trains
from barcelona to madrid`). One page per pair answers every mode. Splitting by
mode would manufacture duplicates.

## 8. The transport axis, measured

English carries it: 346 of 500 distance rows and 139 of 500 route rows name two
real places, 891 of 1,000 rows at KD 10 or below, median KD 0. The pair types
with demand are exactly what the built graph covers, airport access (Newark to
Manhattan 1,100, LaGuardia to Manhattan 700, Heathrow to London 600, Rome
airport to city centre 350, Narita to Tokyo 350) and short intercity (Tokyo to
Kyoto 800 at a 0.35 USD CPC, Lisbon to Porto 600, London to Dublin 350, London
to Edinburgh 350, Naples to Praiano 350 at 0.70 USD).

**German refutes it: 2 of 500 rows name two places.** The German tail is
astronomy, darts board distance, a verbatim driving theory exam question and the
bare calculator query. 458 of 500 rows sit at KD 10 or below, so the SERPs are
open; they are simply not about journeys. This matches the earlier phrasing
correction where `von berlin nach` resolved to the parent `flug berlin paris`:
German demand for a city pair is a flight search, a booking intent Livdar cannot
serve.

Consequence: **the projected 74,000 language-scoped transport pages are unproven,
not pending.** Each language needs its own probe before any page is built for it.

## 9. The visa axis, with the cardinality stated honestly

198 rows is the true depth, three quarters United States origin, which confirms
the instruction to prioritise wealthy origin nationalities: that is where the
demand is. Fanning the matrix out gives 40,000 cells; about 200 have measured
demand and 226 have an authoritative source.

The binding constraint is one government dataset per origin nationality. Only
the UK FCDO is ingested. Claiming 40,000 cells would mean fabricating policy for
39,800 of them.

Segment B is now an exclusion rather than a note. United States immigration and
residency-by-investment intents reach into the tail (k1 visa, eb 5, h2b, fiance
visa, Portugal golden visa, work visas for four countries). That is a legal
advice market and the gate must refuse it.

## 10. Canonicalisation rules, each with evidence

Thirteen rules are in `INTENT-OWNERSHIP-MATRIX.csv`. The one with the most at
stake: **Turkish.** `istanbul'da gezilecek yerler` 39,000 and `istanbul
gezilecek yerler` 33,000 are mutual parent topics, and the same mutual pair
appears for Izmir, Eskisehir, Adana, Balikesir, Samsun, Sakarya, Fethiye and
Konya. The locative suffix is inflection, not a different question. Two pages
per Turkish city in the largest already-built market is the single biggest
duplication risk on the board.

Also: Polish has three phrasings of one question, Dutch two that cross-reference
each other both ways, Swedish three, German three, Italian four including `cosa
fare a`, which means what-to-see and things-to-do are ONE family in Italian.
English `things to see in {city}` carries the parent `things to do in {city}` and
is therefore not a separate family, while `museums in` and `landmarks in` are
separable.

## 11. Phrasing corrections

Six this session, the sixth found today. `days in` and `itinerary` are swamped by
date arithmetic (`120 days in months` 5,600), health, film merchandise (`how to
lose a guy in 10 days dress` 7,100) and ten-day weather. The parent topics on
those rows pointed at the working form, `{n} day {place} itinerary`.

## 12. New named-entity collisions

Each is a real trap the gate must catch, not a curiosity.

- **bar is the unit of pressure.** `machine a cafe 19 bars` 150 is an espresso machine.
- **Six-Fours-les-Plages** is a commune whose own name ends in the category word, giving four false rows.
- **`robe de plages`** is a beach dress.
- **`marsh supermarkets muncie in`** uses `in` as the state abbreviation for Indiana.
- **`hotel playas de guardamar`** 3,100 is a hotel trading under a name containing the category.
- **`restaurants in essen`** 700: Essen is a city and also the German word for food.
- **`restaurants neustadt in holstein`**: the place name contains the preposition.
- **Smoking law**, in two languages: `se puede fumar en las terrazas de los bares` 2,500 and `interdiction de fumer sur les plages` 150.
- The gyms tail is 15 per cent collision: equipment, jargon, sign language, B2B software at a 16.00 USD CPC, and adult terms.

## 13. Competitor readings that bear on the plan

`flightsfrom.com` earns 166,621 organic keywords and 543,068 traffic at DR 57 on
only 6,551 referring domains. **The airport route pair model does not need
authority.** `schulferien.org` turns 23,587 keywords into 3,238,276 traffic, 137
per keyword, beating sites with twenty times the keywords. `nomadlist.com` holds
8,877 referring domains and ranks for 2 organic keywords: **authority does not
save a thin city index.**

## 14. Destination demand across languages

3,979 destination tokens were recovered from the measured keywords by stripping
each language's own frame. 382 carry demand in two or more source languages and
171 in three or more. Five carry it in eight: Los Angeles, Amsterdam, Dubai,
Valencia and Bangkok.

This is the rule that replaces blind language fan-out: **a destination earns a
page in a language only where that language shows measured demand for it.** The
recovery is a heuristic on free text and under-counts rather than over-counts, so
these are floors. Japanese is absent from the count because it has no space
between place and category, and Polish contributes only its recorded rows.

## 15. TOP 20 paths to 1,000,000

1. POI place x category class B, the 501,887 cells on disk against roughly 142,000 in the manifest. Now justified by measurement in es, de and en. Largest single pool.
2. City things-to-do in Turkish, already materialised market, at least 1,000 measured cells above 300 searches and 992 of 1,000 at KD 10 or below.
3. City things-to-do in Japanese, the biggest per row, entire tail below 1,600 unmeasured.
4. City things-to-do in German, 1,193 measured cells, the most open market.
5. City things-to-do in Spanish, 1,064 measured cells.
6. City things-to-do in Italian, 1,000 measured cells, reaching tiny places.
7. One-transfer air pairs, 88,044 available from the graph already built.
8. Rail pairs beyond the 46,856 already materialised, as the Wikidata adjacency graph is a floor by construction.
9. Country expansion, 90,498 from the existing plan.
10. Restaurantes en {city} in Spanish, the strongest place x category family measured.
11. City things-to-do in Portuguese, 500 measured cells of small Brazilian towns.
12. Wikidata enrichment recovery, 7,874 outdoor entities the probe demonstrated.
13. The 16,129 density-recovered places.
14. The 6,527 outdoor entities failing only the parent polygon gate.
15. City things-to-do in Dutch, 500 cells covering Belgium as well.
16. Best time to visit, 185 measured cells at 184 of 185 at KD 5 or below, with the NASA POWER normals already on disk to answer them.
17. City things-to-do in Swedish, 500 cells.
18. Museums and landmarks in English, separable from things-to-do, 500 capped rows.
19. Heritage registers for England, the Netherlands, Poland and France, still unbuilt.
20. Beaches at region level, high value and low cardinality, so a few hundred pages rather than thousands.

## 16. TOP 20 paths toward 10,000,000

The honest statement first: **nothing measured today supports 10,000,000 on its
own.** The ten-million architecture is the product of the paths below, and each
multiplier has to be earned per cell, not assumed.

1. Place x category across every admitted language, which is the only pool with the cardinality.
2. Place x category at neighbourhood level, which German and Italian both reach (Friedrichshain, Kreuzberg, Bergedorf, Goslar Altstadt, Wismar am Hafen).
3. Transport pairs as the graph grows with each licence-clear GTFS feed.
4. Spain NAP, 111 feeds, licence-clear and commercially reusable, held only for API key registration.
5. Trafiklab Sweden, 59 feeds, same position.
6. The remaining 1,623 held GTFS feeds, as licences are read one at a time.
7. Place x duration where the itinerary data model exists to support it.
8. Visa, one government dataset per origin nationality.
9. Heritage and protected-site registers per country.
10. Trail and route entities, where the route member geometry layer is already built.
11. Climate and season per place, where NASA POWER normals already cover 31,715 cities.
12. Public holiday pulse per subdivision, where all 16 German Bundeslaender are already present.
13. Airport access pairs for every airport in the register, not just the 2,514 built.
14. Attraction entities from the 4,742 natural and heritage-named OSM features not yet routed into the outdoor families.
15. Destination x source language on the measured two-language rule, 8,000 to 12,000 and growing with each language measured.
16. Museums and landmarks as a separate family per language where the parent topics permit.
17. Beaches and coastal regions per country.
18. Device x eSIM once the capability table exists.
19. Carrier x eSIM per market.
20. Country x eSIM availability, which overlaps the destination pages Livdar already has.

## 17. TOP 20 candidate architectures for 100,000,000

`100M-AXIS-MATRIX.csv` now holds 19 models, six added and measured today. The
finding that matters more than any individual model: **the axes that survive
measurement are the ones where each cell carries a different real fact, and every
axis that failed today failed because the second dimension was a template
variable rather than a fact.** Mode is not an axis because distance and route are
one intent. Duration IS an axis because each duration has its own parent topic.

A hundred million legitimate pages would need roughly fifty axes of the size
measured today, each with its own source. The register of licence-clear sources
is the constraint, not the mathematics. That is the honest architectural answer,
and it is why `TRANSPORT-SOURCE-REGISTER.csv` with 1,738 classified feeds is a
more important asset than any single family measurement.

## 18. What I did not do

- No publication. No cohort 003, no mass publish, no sitemap expansion, no mass indexing.
- No new service account, no private key, no change to the Workload Identity Federation setup.
- Condition B was not declared.
- The 500-row cap means several families are sized at a floor rather than a depth, and each such number says so in its own record.
- Three measurement records are analytic rather than row dumps, because their API response printed inline instead of persisting to disk and only the decisive rows were kept. Each says so in its `capture_policy` field. One record transcribed 299 of 300 rows by hand and says that one row is missing and that I do not know which.

# Ahrefs final hour report

Written 2026-10-07 at the end of the subscription. Everything below is on disk.
Nothing has been published.

## Units

| | |
|---|---|
| At the start of this final hour | 54,255 left (1,945,745 of 2,000,000 used) |
| Spent in the final hour | **38,955** |
| **Left** | **15,300** |
| Spent across the whole day | **324,318** |

Fifteen calls in the final hour. The spend was deliberately cheap per answer: a
high volume floor makes a refutation cost almost nothing, because a category
with no tail returns no rows. French cost **138 units** to refuse all five
categories. German cost **575**. The expensive calls were the ones that found
something.

## Total unique measurements

| | |
|---|---|
| Rows in `AHREFS-EVIDENCE.parquet` | **13,267** |
| Monthly searches they represent | **20,335,030** |
| Rows at KD 10 or below | **11,484 of 13,247** |
| Rows carrying a CPC | 7,188, median 0.15 USD, maximum 60.00 |
| Rows at a CPC of 3.00 USD or more | 287 |
| Families | **19** |
| Languages | **11** |

Every row carries a `serp_domain_rating_top10_min` filter, so each one is a SERP
a low-authority domain already holds.

## POI Class B, measured in every language rather than extrapolated

This was the first priority and it is finished. The five categories refuted in
English were measured in **all nine remaining languages**. The English refusal
covered 2,131 manifest rows; the same classes carry 11,118 rows elsewhere, and
extending an English finding to them would have been exactly the unmeasured
extrapolation the brief forbids. It would also have been **wrong**.

**REFUSED IN ALL TEN LANGUAGES: supermarkets, marinas-as-a-category, markets.**
Supermarkets return 0 rows in German, Polish and Dutch, 1 in Turkish, 2 in
English, pure near-me in Italian, and in Spanish an opening-hours question that
`places.city-opening` already serves. Japanese gives the worst collision
measured anywhere: the katakana prefix for "super" attaches to a bathhouse
chain, a band, Dragon Ball, a motorcycle, the supermoon, the Super Bowl and the
Rolex Submariner.

**ADMITTED, AND THE ENGLISH REFUTATION DOES NOT TRANSFER:**

- **Nightclubs in Spanish, Polish and Portuguese.** Spanish has twelve cities at
  KD 0 to 3 (Madrid 800, Valencia 600, Barcelona 600, Seville 600). Against
  English 2 rows. Refusing these would have been a mistake.
- **Marinas as named entities in Dutch and German.** Seventeen Dutch marinas at
  KD 0, eleven German. Never as a city category list.
- **City parking in Dutch.** Twelve cities at 200 to 450, reaching Belgian and
  German cities too.

## New high-cardinality axes found

**1. Entity x parking.** Parking is not a city category in any language; it is a
family about named entities people drive to. English: `airport parking` 29,000
at KD 0 with a 1.30 USD CPC, Atlanta 20,000, Logan 12,000, San Diego 10,000 at
1.60, Pittsburgh 9,900 at KD 0, Philadelphia 9,600 at 1.90. 275 of 300 rows name
an airport, and the IATA code form is common, which matches the airport register
Livdar already holds. Japanese reaches far past airports into attractions, with
dozens at KD 0: Universal Studios Japan 5,300, Nara Park 4,300, Kiyomizu-dera
3,900, Nagoya Castle 3,800, Kyoto station 4,300, Disney 3,500, Ghibli Park,
Legoland. Corroborated in five further languages.

**2. Ferry pairs, a fourth transport mode.** 219 rows at a floor of 300, nearly
all naming two real places. It is the most commercially valuable of the three
pair modes: Athens to Milos at a 1.10 CPC, Dubrovnik to Hvar at 1.20, Hingham to
Boston at 3.00. Global geography. OSM carries `route=ferry` relations under the
same ODbL licence the POI corpus uses, and the graph builder already knows how
to turn a route relation into nodes and edges. **This is the cheapest new pair
mode to add and it is not built.**

**3. Ski areas as named entities.** 162 rows, only two above KD 40 and both
generic, CPC 0.45 to 1.20 with outliers at 4.00 and 5.00. Global.

## New commercial opportunities

Ranked by CPC against SERP openness, which is what matters after expiry:

1. **Device x eSIM support.** 83 rows at 3.00 USD or more, peaking at 55.00, and almost the whole tail at KD 0. Needs a handset capability table.
2. **Entity x parking.** 155 of 300 English rows at 1.00 or more, median 1.00.
3. **Ferry pairs.** Head at 3.00, consistently above the air and rail pairs.
4. **Ski areas.** 0.45 to 1.20, with 4.00 and 5.00 outliers.
5. **Coworking by city.** Up to 9.00, but only eight cells exist worldwide.
6. **Visa by nationality.** Ghana visa-free at 30.00, Greece at 7.00, Jamaica at 7.00.

## Three refusals made on principle, not on demand

Each has real measured demand and each is refused because building it would mean
fabricating something:

- **Snow reports.** `mammoth snow report` 10,000, `deer valley snow report` 6,400 at a 1.80 CPC. A snow report is live state and a stale one is worse than no page.
- **Regional weekend markets.** 3,200 for the German near-me form alone. Live event data with no licensed source.
- **Visa segment B.** United States immigration and residency-by-investment. A legal-advice market.

## New collisions, each now gated by name

- **Japanese pachinko.** King Kanko is a parlour chain whose trading name contains the sightseeing characters. 7,300 plus two branch variants.
- **Turkish Sunday.** `pazar` means market AND Sunday AND a district name. Sunday weather 24,000, Sunday TV listings 8,300.
- **Portuguese given name.** Marina is a common name; several Brazilian celebrities carry it, with a large amount of adult content attached.
- **Polish singer.** Marina Luczenko-Szczesna, plus a paddleboard brand.
- **Rolex Submariner**, reached from the marina seed in both Japanese and Polish.
- **Spanish parking manoeuvres.** `aparcamiento en bateria` 1,600 is how to park, not where.
- **Italian financial markets**, and **Japanese Rakuten Ichiba**, the largest e-commerce site in Japan.
- **Utah ski resort crossword** 900, a crossword answer.

## Files updated before expiry

| File | State |
|---|---|
| `AHREFS-EVIDENCE.parquet` | 13,267 rows, 352 KB |
| `SERP-OPENNESS-OPPORTUNITIES.csv` | the same 13,267 rows |
| `NEW-FAMILY-SCALE-MATRIX.csv` | **24 families** |
| `100M-AXIS-MATRIX.csv` | **23 axis models** |
| `INTENT-OWNERSHIP-MATRIX.csv` | **17 canonicalisation rules** |
| `MARKET-COMMERCIAL-RESEARCH.csv` | 11 languages |
| `DESTINATION-DEMAND-EXPANSION.csv` | 3,979 destinations |

## TOP immediate paths to 1,000,000

1. POI place x category class B, the 501,887 cells on disk, now justified in Spanish, German and English and with the dead classes refused in all ten languages.
2. City things-to-do in Turkish, already materialised, at least 1,000 cells at KD 10 or below.
3. City things-to-do in Japanese, the biggest per row, tail below 1,600 unmeasured.
4. City things-to-do in German, 1,193 cells, the most open market.
5. City things-to-do in Spanish and Italian, 1,064 and 1,000 cells.
6. Ferry pairs, a new mode from a source already licensed.
7. Entity x parking for the 4,133 airports already in the register.
8. One-transfer air pairs, 88,044 available from the graph.
9. More destination evidence, which is the only lever that admits more of the 47,451 refused transport pairs.
10. Spanish, Polish and Portuguese nightclubs, newly admitted.

## TOP paths toward 10,000,000

Place x category across every admitted language and down to neighbourhood level;
transport pairs across four modes as the graph grows; entity x parking across
every entity class; Spain NAP and Trafiklab, both licence-clear and held only
for an API key; the remaining 1,623 held GTFS feeds; heritage registers; trails;
climate normals already on disk; holiday pulse per subdivision. Each is a
dataset, not a multiplier, which is the point.

## TOP candidate architectures for 100,000,000

`100M-AXIS-MATRIX.csv` holds 23 models. The finding that holds across all of
them: **an axis survives when each cell carries a different real fact, and every
axis refused today was refused because the second dimension was a template
variable rather than a fact.** Mode is not an axis, because distance and route
are one intent. Duration IS an axis, because each duration has its own parent
topic. A hundred million legitimate pages needs roughly fifty axes of the size
measured today, each with its own licensed source. The register of sources is
the constraint, not the arithmetic.

## Why 15,300 units are left rather than zero

The remaining hypotheses were all second-order: further volume bands of families
already sized at a cap, or languages smaller than Swedish. A band probe costs
12,000 and would have changed no verdict. Spending it to reach zero would have
bought a number, not a decision.

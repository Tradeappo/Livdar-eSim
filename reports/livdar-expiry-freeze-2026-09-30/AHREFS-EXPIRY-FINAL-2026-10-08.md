# Ahrefs expiry, final record

2026-10-08. This closes the Ahrefs evidence programme. `AHREFS-EXPIRY-REPORT-2026-10-07.md`
holds the eighteen-section account of what was measured and what it decided; this file records
the expiry itself, the last day's measurements, and what is now permanently unmeasurable.

## 1. Access is gone, and the error says which kind of gone

Two probes, both after the expiry notice:

| Call | Cost | Result |
|---|---|---|
| `subscription-info-limits-and-usage` | free, consumes no units | `{"error": "Insufficient plan"}` |
| `keywords-explorer-overview`, keyword `ahrefs` | unit-free by design | `{"error": "Insufficient plan"}` |

This is not the `CONNECT_TIMEOUT` the MCP server was showing earlier in the day, which was a
transport failure and would have cleared. `Insufficient plan` is the account answering: the
endpoints are reachable and the plan no longer authorises them. The free endpoint being refused
is the decisive part - there is no tier of this API left open, so no amount of waiting or
retrying recovers it.

No measurement was lost to the deadline. Every number read on 2026-10-08 was written to a file
at the moment it was read and committed in the same session, which is why the expiry cost
nothing: there was never a window in which evidence existed only in a session.

## 2. Unit state at the end

| | |
|---|---|
| Units spent this cycle | 18,691 |
| Remaining after the last metered run | 733 |
| Workspace limit | 2,000,000 |
| Workspace used | 1,993,912 |
| Last metered call | `gtfs-pair-local-language-2026-10-07.json`, 5,355 units |
| Largest single spend on one question | 5,500 units |

The subscription did not stop because the quota ran out. `usage_reset_date` was
2026-10-08T00:00:00Z and the workspace had 6,088 units of headroom, so the 733 figure was a
quota floor within a cycle that was about to reset. The plan ended instead.

## 3. The seven deliverables, verified complete

All seven are on disk, tracked, and pushed. Row counts are data rows, header excluded.

| File | Rows | What it carries |
|---|---|---|
| `AHREFS-EVIDENCE.parquet` | **13,361** | every keyword Ahrefs ever returned for this project, twelve columns |
| `SERP-OPENNESS-OPPORTUNITIES.csv` | 13,267 | the same universe scored for how open its SERP is |
| `DESTINATION-DEMAND-EXPANSION.csv` | 3,979 | per-destination demand across languages |
| `NEW-FAMILY-SCALE-MATRIX.csv` | 24 | the new families found, each with its measured ceiling |
| `100M-AXIS-MATRIX.csv` | 23 | candidate architectures at the hundred-million scale |
| `INTENT-OWNERSHIP-MATRIX.csv` | 17 | who owns each intent on the SERP |
| `MARKET-COMMERCIAL-RESEARCH.csv` | 11 | the commercial case per market |

The parquet grew from 13,267 to 13,361 today: `fold-measurements-into-evidence.py` appended the
94 per-keyword rows from the last two measurement files, so the queryable store now ends where
the programme ends rather than at the earlier harvest.

- 30 rows, `transport.station-departures` `[rail_stations]` - the departures form in en-GB and
  de-DE, the measurement that admitted the hub family
- 1 row, `transport.station-departures` `[bus_and_coach_REFUSED]` - victoria coach station
  departures, 1,000 at difficulty 24. A measured REFUSAL is evidence and is stored as such,
  because a store holding only admissions would read as though refusals were never tested
- 63 rows, `candidate.*` `[hundred_k_model_search]` - the rows behind six refusals: road
  distance, schools, healthcare, EV charging, and the climate axis

Re-running the fold is idempotent, and the 13,267 original rows are byte-identical afterwards -
checked, not assumed.

### What was deliberately NOT folded in

`tier4-city-demand-2026-10-08.json` carries DISTRIBUTIONS, not per-keyword rows: 173 cities
measured against the 5 keywords that had set the tier-3 cap, 59.5 per cent clearing volume 50,
median 80, max 2,700. Its `examples_in_the_tier` are "city volume" strings, not keywords.
Flattening that into a keyword table would assert something the measurement never did - that
each city was read as its own keyword with its own difficulty. The JSON stays authoritative for
that cell.

## 4. What the last day measured, and what each reading decided

| Measurement | Verdict |
|---|---|
| Departures form, en-GB and de-DE | ADMITTED the hub family. kings cross departures 9,400 at KD 5, birmingham new street 3,600 at KD 3; berlin hbf abfahrt 700 at KD 2 |
| Coach stations, en-GB | REFUSED. One row, difficulty 24, against rail at 0 to 8 |
| Road distance between settlements | REFUSED. Median about 25 a month across the largest British pairs |
| Schools and education | REFUSED structurally: the cardinality is in the entity and the intent is navigational |
| Healthcare | REFUSED. The entity carrying volume numbers in thousands, not hundreds of thousands |
| EV charging | REFUSED. 50 to 200 a month at difficulty 12 to 22 |
| Climate axis on cities already held | REFUSED as a 100k model, ADMISSIBLE but bounded resort-first |
| Tier-4 city demand | REFUTED the tier-3 cap, on 173 cities against the 5 keywords that set it |

The single most useful line in the whole set remains the Turkish one, because it is the cheapest
mistake it prevents: `trabzon hava durumu` reads 312,000 and is today's weather, which climate
normals cannot answer. The form this project CAN answer, city plus month, reads 10. A 312,000
row that cannot be served is worth less than a 150 row that can.

## 5. What is now permanently unmeasurable, in order of what it costs

**The Japanese settlement-pair form.** 25,364 pairs are harvested, licensed and on disk, and
580 of the 1,300 registry feeds - 45 per cent of the entire licensed registry - are Japanese.
`ja-JP` has zero rows in the pair family because `JP` is absent from `PAIR_LOCALE`. The data is
not the obstacle: the city store carries Japanese names in its `alt` field, so the page can be
written in Japanese rather than romaji. One `matching-terms` call on the Japanese pair form
would have admitted or refused about 25,000 pages. It cannot now be made, and it must not be
guessed: the one language ever measured on this exact question, Dutch, was REFUSED, and Finnish
was admitted only after the measurement corrected the form to put the pair before the mode with
no preposition - a shape no reasoning from Danish would have produced.

**The resort list for the climate month axis.** The axis is admissible and bounded resort-first;
the bound needs the resort list, which the measurement would have returned as its own output.

**The parking form in the nine markets that hold the data.** `parking in york` reads 2,300 at
difficulty 1, and there is no en-GB parking cell in the inventory at all - the market where it
measured is the market with no named car parks in the store. The nine markets that do hold the
data carry a local volume of zero, meaning unmeasured, not refused.

**Per-pair volume for the 589,661 settlement pairs.** It was never claimed and never measured;
the family rests on a family-shape proof plus a per-pair utility bar read from the timetable.
That remains the honest basis and cannot now be upgraded.

## 6. What does not depend on Ahrefs

Everything already decided. The gates, the refusals and the counts rest on measurements already
taken and files already written. The 1M inventory continues on licensed data sources, OpenStreetMap,
GTFS, Wikidata, GeoNames, NASA POWER and the public holiday registers, none of which were ever
Ahrefs-dependent. What ends is the ability to open a NEW family on measured demand, and to settle
the four questions above.

Production remains untouched. Nothing was published.

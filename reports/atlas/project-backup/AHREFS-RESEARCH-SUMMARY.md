# Ahrefs research: what was measured, what it decided

**Status: closed and frozen.** The Ahrefs subscription ended on **2026-10-08**; the API answers
`{"error": "Insufficient plan"}` even on its free endpoint. Every measurement was written to a
file and committed the moment it was read, so nothing was lost. The owner's standing rule now
forbids every paid SEO tool, so **no further Ahrefs, Semrush, DataForSEO, SE Ranking or
Ubersuggest calls may be made**. Use the frozen evidence below; for anything new, use free
sources (Google Search Console for the own site, Wikimedia clickstream for per-entity demand).

Primary records: `reports/livdar-expiry-freeze-2026-09-30/AHREFS-EXPIRY-REPORT-2026-10-07.md`
(18 sections) and `AHREFS-EXPIRY-FINAL-2026-10-08.md`.

## 1. Budget and technique

- Workspace limit 2,000,000 units; 1,993,912 used at the end; 18,691 spent on the last day; the
  final round spent 285,363 units over 28 calls.
- **The technique that produced the evidence:** every call carried a
  `serp_domain_rating_top10_min` filter (filter-only, not selectable). Each returned keyword is
  therefore a SERP a low-authority site already ranks top ten on: a much stronger statement than
  a low difficulty score.
- **`matching-terms` returns at most 500 rows whatever `limit` says.** Earlier "tail depths" of
  500 or 1,000 were caps, not depths. Partitioning by volume band is the only way past it.

## 2. What is banked (all committed)

| file | contents |
|---|---|
| `AHREFS-EVIDENCE.parquet` / `SERP-OPENNESS-OPPORTUNITIES.csv` | 12,421 rows, 12 columns |
| `NEW-FAMILY-SCALE-MATRIX.csv` | 18 families: verdict, admission class, scale band |
| `100M-AXIS-MATRIX.csv` | 19 axis models |
| `INTENT-OWNERSHIP-MATRIX.csv` | 13 canonicalisation rules with evidence |
| `MARKET-COMMERCIAL-RESEARCH.csv` | 11 languages |
| `DESTINATION-DEMAND-EXPANSION.csv` | 3,979 destination tokens |
| `PROGRAMMATIC-COMPETITOR-MATRIX.csv` | 35 competitors |
| `TRANSPORT-SOURCE-REGISTER.csv` | 1,738 GTFS feeds classified on licence |
| `02-MASTER-KEYWORDS.csv`, `03-MASTER-KEYWORDS.jsonl.gz` | the keyword master the builder joins through `FAMILY-MASTER.csv` aliases |
| `reports/ahrefs-export-2026-09-28/` | exports, including published-page demand used by the monitor |

Totals: 18,921,280 monthly searches; 10,814 of 12,402 rows at KD ≤ 10; median CPC 0.15 USD.

## 3. The findings that shape the inventory

1. **City things-to-do is the largest family**, open in ten languages: en 3.4M monthly
   searches, ja 2.5M, de 2.2M, es 1.75M, tr 1.68M, it 0.88M, pt 0.49M, nl 0.27M, sv 0.13M, fr
   0.09M; median KD 0 in most. Japanese is biggest per row (Kyoto 78,000 at KD 0); Turkish is the
   biggest already built (Istanbul 39,000).
2. **Place × category scales only where measured.** Admitted: restaurants (es, de, en), cafés
   and bars (de, en), museums and attractions (en), beaches at region level (en, es, fr), gyms
   (en), coworking (en). Refused: EV charging, supermarkets, marinas, nightlife, parking,
   national parks; French place × category as a whole (proximity intent from travellers already
   there). The demand is **class B**: family intent proven, not per-cell volume, so every cell
   must still earn its page on its own data.
3. **A destination earns a page in a language only where that language shows measured demand
   for it.** 3,979 destination tokens recovered; 382 carry demand in two or more languages, five
   in eight (Los Angeles, Amsterdam, Dubai, Valencia, Bangkok). This replaced blind language
   fan-out and is the root of the localisation gate (`QUALITY-RULES.md`, section 4).
4. **Canonicalisation** (13 rules): Turkish locative forms are one intent; Italian what-to-see =
   things-to-do; English `things to see` is not a separate family; `museums in` and
   `landmarks in` are.
5. **Transport:** English carries the pair axis (891 of 1,000 rows at KD ≤ 10; airport access and
   short intercity are what has demand). **German refutes it** (2 of 500 rows name two places;
   German city-pair demand is a flight booking search). Each language needs its own probe.
   **Pair × mode is not an axis**: distance and route are one canonical intent.
6. **Visa:** the real depth is about 200 rows, three quarters US-origin; one government dataset
   per origin nationality is the constraint (only UK FCDO ingested); US immigration and
   residency-by-investment intents are legal-advice territory and refused.
7. **New axes:** place × duration (each duration has its own parent topic; a few hundred pages);
   device × eSIM support (83 of 176 rows at CPC ≥ 3 USD; build first on the eSIM side); country ×
   eSIM availability; carrier × eSIM.
8. **Competitors:** flightsfrom.com earns 166,621 keywords at DR 57 (the airport route model does
   not need authority); schulferien.org turns 23,587 keywords into 3.2M traffic; nomadlist.com has
   8,877 referring domains and ranks for 2 keywords (authority does not save a thin city index).

## 4. What the measurements are NOT

- The keyword fields on manifest rows (`primary_keyword_if_known`, `local_volume`,
  `market_demand_evidence`) are **family × market** measurements: the example keyword that proved
  the family in that market. They are not per-page volumes. Cohort 003 carried `wetter rom` on
  every German page until main's entity audit refused it (2026-10-20).
- "Shape measured" rows (`shape_measured_2026_10_01`, `shape_measured_2026_10_07_open_serp`) prove
  the query SHAPE is open and searched, not that any one page is.
- Per-entity demand after the expiry comes from the **Wikimedia clickstream** (free, CC0): counts
  of readers who searched and clicked the entity's own article
  (`1M-FREE-DEMAND-SIGNAL-2026-10-13.md`).

## 5. Superseded statements

- `15-AHREFS-REPLACEMENT.md` recommends DataForSEO and SE Ranking as replacements:
  **SUPERSEDED** by the owner's rule against paid tools. GSC (own site) and the Wikimedia
  clickstream (demand) are the replacements actually in use.
- "Ahrefs quota reset is a renewal": corrected on 2026-10-07 (commit c624026); the plan ended.

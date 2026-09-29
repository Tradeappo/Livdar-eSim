# Local language map

Nine languages. `ro-RO` is excluded by standing instruction and is not generated
anywhere in the pipeline.

## The rule applied

The brief's language rule is implemented in code, not asserted. A candidate exists
in a language only when that language passes `langRule` for its entity, and then
survives the cross-language dedupe stage, which merges any row whose language is
outside the five where phrasing was actually researched and whose data signature
matches a sibling. No English candidate is multiplied by nine.

| langRule | Meaning | Families using it |
| --- | --- | --- |
| `own` | The entity's own market language only | venue profile, persona variants |
| `en` | English only, because no other market searches this | sport, city-day, city-pair |
| `own+en` | The entity's market language plus English | climate, airports |
| `own+en+neighbours` | Plus German and French, capped at 4 | country holidays |
| `own+en+major` | Plus the four largest measured markets | named holidays |
| `measured` | Only the five languages with researched phrasing | tools |

## Distribution in the inventory

| Language | Valid | Blocked | Rejected | Merged |
| --- | --- | --- | --- | --- |
| en | 11,858 | 3,817 | 182,925 | 5,398 |
| de | 630 | 53 | 2,532 | 32 |
| fr | 537 | 30 | 2,232 | 34 |
| nl | 335 | 13 | 1,092 | 2 |
| pl | 318 | 15 | 1,236 | 0 |
| it | 144 | 1 | 0 | 1,808 |
| es | 119 | 2 | 228 | 4,542 |
| pt | 32 | 2 | 240 | 8,439 |
| ja | 2 | 1 | 192 | 6,661 |

English dominates because the climate experiment and the rejected families are
English-heavy, not because other markets were skipped. Among **valid non-climate**
candidates the local languages carry 1,911 of 4,189, which is the balance the
research supports.

Japanese has **2** valid candidates out of 6,856 enumerated. That is the correct
answer with the evidence available: 6,661 of its rows merged as cross-language
duplicates because no Japanese keyword phrasing has been researched, and the brief
is explicit that a translated page counts only where the phrasing was researched
locally. The same pattern holds for Portuguese (8,439 merged of 8,713) and Spanish
(4,542 of 4,891). These are research gaps, not coverage gaps, and they are the
cheapest gaps on any list in this folder: the entities, the data and the licences
are already in place, and only the phrasing research is missing.

## Phrasing findings that hold per market

| Market | Finding |
| --- | --- |
| de | Diacritics decide everything. `brückentage 2026` 1,712 against `brueckentage 2026` 8. Keywords carry real diacritics; only URLs are ASCII-folded |
| de | The state layer is where the money is: Bayern 24,385, Niedersachsen 11,934, Sachsen 11,065, Berlin 10,012, Hessen 8,626, all KD 0 to 2 |
| de / nl | `kalender 2026` is a German keyword worth 333,644 **and** a Dutch keyword worth 146,979. Any keyword join must be country-scoped |
| en-GB vs en-US | "City centre" is British. The same airport keyword reads 10 to 70 times higher in gb than in us |
| fr | `jours feries France` 1,322 against `feiertage Frankreich` 1,102: the local phrasing wins in its own market and the German phrasing wins in Germany. Both are valid, separately |
| ch | Swiss cantons measure 37 to 86 against German states at 8,626 to 24,385. The same page shape, a fiftieth of the demand. Federal structure alone does not create demand |
| pl / nl | `cost of living` intent measures 1. Not a translation problem, a market reality: the family is 1 to 2 orders smaller outside English |
| ja | No phrasing researched. Zero valid candidates, correctly |

## Expansion order, if language research continues

1. **en-GB as a distinct market**, not a variant. The airport measurement proves the
   phrasing differs and that a us-only read is wrong by an order of magnitude. This
   is a substitution for existing English candidates in travel families, not an
   addition, so it adds 0 candidates and corrects roughly 1,089.
2. **ja, pt, es**, because the entities, the data and the licences are already
   there and 19,642 rows are waiting on phrasing research alone.
3. **it**, where 1,808 rows merged for want of researched phrasing.
4. CA, AU, NZ, CH, AT, BE, MX, SG, UAE, TH, KR, Nordics, Eastern Europe and LATAM
   were all considered. None of them is a language gap: they are source-coverage
   gaps, and they are recorded in DATA-SOURCE-GAPS.md rather than here, because
   translating a page for a country whose holidays and salaries this project cannot
   source would be exactly the mechanical multiplication the brief forbids.

# Ahrefs measurement samples

Raw rows: `measured/SAMPLES.tsv` (this pass) and
`../candidate-universe-2026-09-29/measured/*.tsv` (earlier passes, 255 keywords).
Per-family statistics are in `FUNNEL.json` under `family_samples`.

## Rule applied

Per-page metrics are never fabricated. A candidate is:

- **MEASURED_DIRECT** only when that exact keyword in that exact country appears in
  a sample file. 74 inventory rows, 36 of them valid.
- **INHERITED_FROM_FAMILY_SAMPLE** only when its family has a sample of at least
  three keywords. Currently 0 rows inherit, because the only family with a
  sufficient sample is the airport family and all of its rows are blocked.
- **UNMEASURED** otherwise. 99.74% of valid candidates.

That last figure is uncomfortable and it is correct. The alternative would be
stamping a family median onto 9,786 climate rows off a two keyword sample, which
is exactly the fabrication the brief forbids.

## Per-family sample statistics

| Family | n | Median volume | p75 | p90 | Median KD | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| `transport.airport-to-city` | 28 | 600 | 2,000 | 2,800 | 1 | medium |
| `sport.city-activity-season` | 3 | 70 | 80 | 80 | 0 | low |
| `climate.city-annual` | 2 | 1,900 | 1,900 | 1,900 | 79 | none |
| `climate.city-month` | 2 | 1,400 | 1,400 | 1,400 | 0 | none |
| `climate.city-month-tail` | 2 | 40 | 40 | 40 | 0 | none |

Confidence is `medium` at 12 samples, `low` at 3, `none` below 3. Nothing inherits
from a `none`.

## The measurement finding that changed a verdict

**Measure English travel phrasings in `gb`, not `us`.** The same keyword:

| Keyword | us | gb | Ratio |
| --- | --- | --- | --- |
| barcelona airport to city centre | 20 | 900 | 45x |
| amsterdam airport to city centre | 50 | 1,300 | 26x |
| lisbon airport to city centre | 10 | 700 | 70x |
| rome airport to city centre | 20 | 250 | 12x |
| munich airport to city centre | 10 | 150 | 15x |

"City centre" is British spelling. A first pass measured in `us` and had the best
family in the catalog looking dead at 10 to 50 searches a month. This is the eighth
distinct keyword-generation or measurement bug found by measuring rather than
assuming in this programme, after the diacritic bug (`brueckentage` 8 vs
`brückentage` 1,712), English month names, unlocalised country names, raw ISO
subdivision codes, city IDs used as keywords, a `%2C` encoding leak, and a
keyword-only join that handed German the Dutch volume for `kalender 2026`.

## Head sample, this pass

| Keyword | Country | Volume | Global | KD | CPC | Clicks | TP |
| --- | --- | --- | --- | --- | --- | --- | --- |
| dublin airport to city centre | gb | 4,400 | 6,600 | 0 | 15c | 3,599 | 2,000 |
| gatwick to london | gb | 2,900 | 10,000 | 10 | 15c | 2,284 | 33,000 |
| stansted to london | gb | 2,800 | 9,200 | 7 | 20c | 2,515 | 84,000 |
| krakow airport to city centre | gb | 2,700 | 4,000 | 0 | 30c | 2,525 | 700 |
| jfk to manhattan | us | 2,400 | 4,700 | 3 | 40c | 1,623 | 5,300 |
| prague airport to city centre | gb | 2,200 | 3,200 | 1 | 10c | 1,711 | 1,900 |
| budapest airport to city centre | gb | 2,000 | 2,900 | 2 | 30c | 1,883 | 900 |
| tokyo climate | us | 1,900 | 3,300 | **79** | 3c | 1,499 | 57,000 |
| narita to tokyo | us | 1,600 | 5,300 | 14 | 6c | 1,006 | 400 |
| weather in paris in october | us | 1,400 | 2,600 | 0 | 2c | 772 | 700 |
| heathrow to london | gb | 1,300 | 5,100 | 0 | 35c | 941 | 1,900 |
| amsterdam airport to city centre | gb | 1,300 | 1,900 | 2 | 5c | 931 | 450 |
| weather in rome in may | us | 1,000 | 2,500 | 0 | 2c | 732 | 500 |
| malaga airport to city centre | gb | 1,000 | 1,300 | 0 | 7c | 948 | 700 |

## Tail sample, this pass

| Keyword | Country | Volume | Global | Verdict |
| --- | --- | --- | --- | --- |
| running in tokyo | us | 80 | 400 | Sport family rejected |
| cycling in amsterdam | us | 70 | 600 | Sport family rejected |
| weather in reykjavik in june | us | 40 | 80 | Climate tail rejected |
| weather in salzburg in july | us | 20 | 50 | Climate tail rejected |
| hiking in salzburg | us | 20 | 100 | Sport family rejected |
| tenerife airport to city centre | gb | 0 | 0 | Template failure: Tenerife is an island |
| fiumicino to rome city centre | us | 0 | 10 | Wrong phrasing for the market |

The tail is the whole argument. Salzburg for hiking and Amsterdam for cycling are
the strongest cases those families will ever have, and they measure 20 and 70. A
family whose best case is 70 has no tail worth enumerating.

## Credits

3,920 units this pass: 1,980 on two keyword batches (45 keywords) and 1,940 on four
SERP overviews. Workspace usage 1,190,048 of 2,000,000, leaving 809,952 before the
8 October reset. All of it is FROZEN_AFTER_AHREFS_EXPIRY: these files are the only
copy after that date.

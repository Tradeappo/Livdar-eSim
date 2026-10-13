# Why 966,815 and 587,284 are both real, and which one is current

2026-10-13. Nothing was regenerated to write this and no gate was touched. Every number below
is read from a committed artefact, and the method is named so it can be checked.

## The answer

**The current authoritative FINAL DISTINCT VALID offline inventory is 587,284.**

966,815 is the same metric, `FINAL_DISTINCT_CANDIDATES`, read from the same file at an earlier
point in its history. It is stale by nine revisions, not branch-specific, not filtered, not
partial and not a different stage. It was current for about seven hours on 2026-10-08 and was
invalidated two days later by the transit unit correction.

## Where each number comes from

| | 966,815 | 587,284 |
|---|---|---|
| metric | `FINAL_DISTINCT_CANDIDATES` | `FINAL_DISTINCT_CANDIDATES` |
| file | `reports/livdar-expiry-freeze-2026-09-30/1M-SUMMARY.json` | the same file |
| commit | `75ac5ad`, 2026-10-08 13:09 | `ebb74c5`, 2026-10-10 12:40 |
| status | superseded 9 times | current, newest commit on this file |

Both are the same field in the same file. The discrepancy is not two competing definitions; it
is two timestamps.

## The history of the field, read from git

```
10-08 09:00   799,126   the directed transit gain
10-08 09:59   877,462   the full 146-feed intercity set
10-08 13:09   966,815   the municipal pass lands        <- the figure in question
10-08 20:41   963,470   manifest pass 1, and the fall is the measurement
10-08 20:59   968,297
10-08 22:11   968,305
10-09 09:45   969,840   the Wikidata pass
10-09 11:30   973,236   Renfe lands
10-10 10:49   972,910
10-10 11:22   972,910   the funnel reconciles again
10-10 12:25   586,511   the transit family was 80 per cent stop-to-stop
10-10 12:40   587,284   the Wikidata gate had over-refused trails          <- current
```

## What happened between them

`TRANSIT-UNIT-CORRECTION-2026-10-10.md` records it. `transport.city-pair-transit` was 510,592
of 972,910 FINAL pages, 52.5 per cent of the inventory, and it was keyed on the wrong unit:
`gtfs-pair-candidates.py` aggregated on `a_id`, which for a major-node stop is `stn:<stop id>`
rather than the settlement, so a bus stop never folded into its town. The result was pages
pairing one bus stop with fifteen of its neighbours. The brief this programme runs under says
transport units must remain settlement-to-settlement or significant heterogeneous nodes, and
the family was not obeying it. Corrected, the family went from 510,592 to 125,652 and FINAL
from 972,910 to 586,511.

Then the Wikidata gate was found to be over-refusing: 1,125 of its 2,465 rejections were
Via Alpina and Mare a Mare stages sharing a parent route's QID. Narrowing it to require QID
AND name for `trail` recovered 773 rows, giving 587,284.

No gate was relaxed in either step. One gate was corrected and one was narrowed, and both
moved the number in the direction the evidence pointed, once down and once up.

## Verified three ways, independently

1. `1M-SUMMARY.json` -> `FINAL_DISTINCT_CANDIDATES` = 587,284
2. `1M-QA-REPORT.json` -> `manifest_rows` = 587,284 and `distinct_urls` = 587,284
3. The manifest itself. `LIVDAR-1M-CANDIDATE-MANIFEST.parts/_parts-index.json` declares
   `total_rows = 587284` with a sha256 over the data rows, and counting the rows of the two
   committed parts with the header excluded once per part gives **587,284** exactly:
   309,660 + 277,624.

The third is the one that settles it: it counts the artefact rather than reading a claim about
the artefact.

## Why the stale figure is still readable, which is the real defect here

Two documents still assert 966,815 and neither was revised when the correction landed:

- `reports/livdar-expiry-freeze-2026-09-30/MARKET-URL-EXPERIMENT-REPORT.md`, section 8:
  "FINAL DISTINCT VALID: **966,815**. Funnel reconciles: True." Generated 2026-10-06, last
  committed 2026-10-08.
- `data/atlas/measurements/cheap-lever-audit-2026-10-08.json`, inside a verdict string:
  "the 16,129 are inside the 966,815 already". 2026-10-08.

Both are accurate as records of what was true on their own date, and both are two days older
than the correction. Anyone reading either one today reads a pre-correction number with no
sign that it is pre-correction, which is how this discrepancy reached a status report. The
figure is not wrong in those files; what is missing is a pointer forward.

## Where these records live

The whole `reports/livdar-expiry-freeze-2026-09-30/` tree, including the manifest and every
figure above, is committed on `claude/seo-handoff-partial-data-7rs7zi` and is **not on
`main`**: `git ls-tree main -- reports/livdar-expiry-freeze-2026-09-30/` returns nothing. That
is deliberate, since none of it is production code, but it means the inventory's own records
are only visible from that branch, and a check run against `main` finds no figure at all
rather than a stale one.

## The inventory remains offline

587,284 candidates, 0 published. The live cohort is 500 pages and unchanged. This document
reads files and asserts nothing about publication.

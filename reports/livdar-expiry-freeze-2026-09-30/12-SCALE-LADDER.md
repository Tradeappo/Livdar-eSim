# The scale ladder, versioned

The page-count estimate moved six times. Each move is recorded, because the pattern in
the corrections is itself the most useful thing here: **every version that went up did
so by multiplying, and every version that came down did so by measuring.**

| Version | Figure | What it claimed | Why it moved |
|---|---|---|---|
| v1 | 1,000,000+ | the original ambition | withdrawn once the entity model separated demand from raw records |
| v2 | superseded | first entity-scale model | replaced by v3; kept at `SCALE-LADDER-v2-superseded-2026-09-30.md` |
| v3 | 581,471 | 11 markets × measured cells | **rejected.** The 11-market multiplier was never measured; v5 measured it and found it invalid for the tail |
| v4 | interim | intermediate | superseded by v5 |
| v5 | 29,274 measured / 76,308 ceiling | 711 keyword rows, 101 cross-language rows, 66 counting cells | the honest floor. 25,000 DEFENSIBLE, 50,000 PROBABLE_BUT_UNPROVEN, 100,000+ NOT_DEFENSIBLE_ON_DEMAND |
| v5b | CURRENT 64,416 / FEED-BACKED 160,416 | separated rankable-today from feed-held | marked feed-backed 100,000 as YES |
| **v6** | **CURRENT 64,416 (61,566 conservative), feed-backed 100,000 NOT supported** | measured keyword breadth per family instead of arithmetic | **current.** Four family estimates refuted or cut, one family found |

Files: v3/v4/v5 at `reports/livdar-master-seo-universe-2026-09-30/SCALE-LADDER-V*.json`,
v5b at `reports/livdar-final-research-freeze-2026-09-30/FEED-BACKED-SCALE.json`,
v6 at `reports/livdar-final-research-freeze-2026-09-30/MEASURED-SCALE-ROUND3.json`.
`SCALE-FINAL.json` in the research freeze holds the layered funnel.

## The ladder as it stands

| Rung | CURRENT | FEED-BACKED | Verdict |
|---|---|---|---|
| 500 | done | done | live, healthy, health score 100 |
| 2,000 | yes | yes | 1,791 pass every gate today; 2,000 needs one more small cohort |
| 5,000 | yes | yes | within measured demand |
| 25,000 | **yes** | yes | **DEFENSIBLE. The target to build toward** |
| 50,000 | probable | probable | PROBABLE_BUT_UNPROVEN. Needs breadth measured in more markets |
| 100,000 | no | **no** | 35,584 short on CURRENT; the feed-backed case was refuted in round three |
| 250,000 | no | no | no family measured has the breadth |
| 500,000 | no | no | only reachable via the rejected multiplier |
| 1,000,000 | no | no | withdrawn |
| 3,000,000 | no | no | exceeds source-backed |
| 10,000,000 | no | no | exceeds source-obtainable |
| 100,000,000 | candidates only | candidates only | see `13-100M-ARCHITECTURE.md`. Never a publication target |

## How breadth was measured in v6

This is the method to reuse, and it does not need Ahrefs specifically — any keyword
tool with a volume filter and a row limit can do it.

1. Take the family's real query pattern, not its entity list.
2. Pull matching terms in phrase mode with a volume floor and a high row limit.
3. **If fewer rows come back than the limit, the tail exhausted and the count is a hard
   ceiling.** If it hits the limit, the count is a floor and the tail continues.
4. Check for a false ceiling: a suspiciously round number needs a re-run at a lower
   floor. `airport to city centre` returned exactly 100 against a 400 limit; re-run at
   floor 50 it returned 400, proving the 100 was real.
5. Read the composition, not just the count. Parking hit the row limit — which normally
   supports a family — but the rows were airport parking and operator brands, so the
   family was refuted by what was in it rather than by how much.

The eleven measurements are in `PATTERN-BREADTH-MEASURED.csv`, each with its floor, its
limit and whether the tail exhausted.

## The rule this ladder exists to enforce

A page count is only as good as the keyword list under it. Cities × modifiers is not
evidence. Before any future version of this ladder goes **up**, the family driving the
increase must have a measured keyword list in `02-MASTER-KEYWORDS.csv` and a breadth
row in `PATTERN-BREADTH-MEASURED.csv`. Without both, the number is arithmetic and it
will come back down the next time somebody checks.

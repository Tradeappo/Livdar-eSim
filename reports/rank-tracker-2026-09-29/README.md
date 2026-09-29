# Rank Tracker, priority ordered, 2026-09-29

Regenerate with `node scripts/atlas/rank-tracker-priority.mjs`. Enforced by
`tests/rank-tracker-priority.test.mjs`, 7 assertions in the 401 test suite.

**This supersedes `../candidate-universe-2026-09-29/rank-tracker/`**, which held the
same keywords sorted by volume across the whole set.

## The change, and why it matters

The earlier set was 571 keywords sorted by measured volume. That is the natural
sort and it is the wrong one here: the instruction to take the first N rows at a
plan limit would have dropped a live page's own keyword in favour of a keyword for
a page that does not exist yet. Position history starts the day a keyword is added
and cannot be backfilled, so a live page that loses its slot loses its baseline
permanently.

The order is now structural, and only the sort inside a tier is by volume.

| Order | Tier | Keywords | Action |
| --- | --- | --- | --- |
| 1 | LIVE_PRIMARY | 500 | Paste |
| 2 | LIVE_SECONDARY | 38 | Paste |
| 3 | ESIM | 125 | Already tracked |
| 4 | CANDIDATE_HEAD | 42 | Paste |
| | **Total** | **705** | **580 to paste** |

Truncate from the bottom of the lowest tier reached. Never from tier 1.

## What the coverage check found

**LIVE_PRIMARY is exactly the 500 live pages, one keyword each, cohort 001 250 and
cohort 002 250.** Every page's keyword carries a measured Ahrefs volume above zero,
so:

- **`NEEDS-PRIMARY-KEYWORD-REVIEW.tsv` is empty.** Not skipped, not defaulted:
  every live page already has a primary keyword that came out of the existing
  research and was measured. Nothing was invented to fill a gap because there was
  no gap. The file and its test exist so that a page arriving without one later
  lands somewhere visible with its reason attached.
- **`CANNIBALIZATION-RISK.json` is empty.** Three tests were run and all three came
  back clean: exact keyword plus market, keyword plus market with diacritics folded
  away, and the structural test of two live pages covering the same family and
  entity in one market. Nothing was auto-merged, auto-dropped or auto-duplicated,
  because there was nothing to merge.

The one thing worth an editor's eye is not coverage but size:

| Band | Monthly volume | Pages |
| --- | --- | --- |
| HEAD | 10 000 and above | 28 |
| STRONG | 1 000 to 9 999 | 112 |
| MODERATE | 500 to 999 | 47 |
| LOW | 100 to 499 | 142 |
| VERY_LOW | under 100 | 171 |

313 of the 500 target a keyword under 500 searches a month, and the median across
all 500 is 200. Those pages have a clear primary keyword that happens to be small,
which is a different finding from having none, so they stay in LIVE_PRIMARY and are
listed on their own in `LOW-VOLUME-PRIMARY.tsv`. Conflating the two would have hidden
a real distribution problem inside a fake coverage problem.

## Files

| File | What it is |
| --- | --- |
| `PASTE-READY.md` | **The one to use.** Four tiers, country blocks, copy-paste lists |
| `RANK-TRACKER-PRIORITY.tsv` | All 705 rows with tier, priority index, market, path, volume, KD, traffic potential |
| `LIVE-PRIMARY-COVERAGE.tsv` | The 500 live pages and their one primary keyword each, with volume band |
| `LOW-VOLUME-PRIMARY.tsv` | The 313 whose primary measures under 500 a month |
| `NEEDS-PRIMARY-KEYWORD-REVIEW.tsv` | Empty by result. Header only |
| `CANNIBALIZATION-RISK.json` | Empty by result. `[]` |
| `SUMMARY.json` | Tier counts, cohort split, volume bands, per-country breakdown |

## Sources

- The 500 live pages and their keywords: `lib/atlas/serve-pages.js`, the same
  manifests production serves, so coverage cannot drift from what is published.
- Volume, KD, CPC and traffic potential: `../ahrefs-export-2026-09-28/gsc/gsc-x-ahrefs-joined-2026-09-28.tsv`.
- LIVE_SECONDARY and CANDIDATE_HEAD: `../candidate-universe-2026-09-29/MASTER-CANDIDATE-INVENTORY.tsv`,
  restricted to rows measured against Ahrefs with `status = VALIDATED`.
- ESIM: `../ahrefs-export-2026-09-28/rank-tracker/tracked-keywords-2026-09-28.tsv`,
  the 125 already in the account.

Every volume and KD figure is **FROZEN_AFTER_AHREFS_EXPIRY**. The subscription ends
8 October 2026.

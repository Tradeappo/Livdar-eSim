# Livdar Atlas project backup

Everything needed to continue the Livdar Atlas inventory (1,002,362 FINAL DISTINCT VALID
candidates) and its publication, from the repository alone, without any conversation history.
Written 2026-10-21. Every number here is recomputed from committed artifacts by a script in
this repo.

## Read in this order

| # | file | what it gives you |
|---|---|---|
| 1 | `RECOVERY-INSTRUCTIONS.md` | **Start here.** Repo, branches, the rules, how to get and verify the FINAL number, how to run safely (no concurrent runs, no OOM), how to resume, how to publish |
| 2 | `AUTHORITATIVE-STATE.json` | Every current number, machine-readable; the history of FINAL; what is SUPERSEDED and why |
| 3 | `MASTER-HANDOFF.md` | The narrative: what this is, how it got here, what is live, which files are the truth |
| 4 | `QUALITY-RULES.md` | Every gate with its count; scores and formulas; localisation; canonical, hreflang, parent/child, identity; cohort gates |
| 5 | `PIPELINE-RUNBOOK.md` | How the inventory is built, re-built, resumed and validated; the cohort publishing checklist |
| 6 | `KNOWN-BUGS-AND-FIXES.md` | 45 defects with cause, fix and commit; open risks |
| 7 | `FAMILY-REGISTRY.md` | Surfaces and families, catalogue status, what is renderable, what was refused and why |
| 8 | `DATA-SOURCES.md` | Every source, licence, file, capture script; attribution duties |
| 9 | `TRANSPORT-MODEL.md` | The transport families, the settlement unit, class-B admission, reverse pairs, cross-border, GTFS licences |
| 10 | `AHREFS-RESEARCH-SUMMARY.md` | What the (now ended) Ahrefs research measured and decided |
| 11 | `NEXT-STEPS.md` | What to do next, which builders to write first, the 10M and 100M paths |

## Generated evidence in this folder

| file | produced by |
|---|---|
| `MANIFEST-VERIFICATION.json` | `python3 scripts/atlas/verify-1m-manifest.py --json ...` |
| `DEMAND-BASIS-CLASSIFICATION.json` | `python3 scripts/atlas/classify-demand-basis.py --json ...` |
| `GEOGRAPHY.json` | a one-off count over the parts, reproducible from the same columns (`country`, `market`, `destination_country`) |
| `BUILDER-PRIORITY.json` | the per-family split of rows with a ready source, by demand class |

## The four facts to know before anything else

1. **FINAL DISTINCT VALID = 1,002,362**, intact (SHA-256 matches), distinct, and reconciling:
   1,872,381 generated - 870,019 rejected = 1,002,362.
2. **Only 26,685 of those rows can be rendered today**; every other family needs a page builder
   on `main` first.
3. **The inventory lives on `claude/seo-handoff-partial-data-7rs7zi`; production is `main`.**
   Never merge the first into the second wholesale.
4. **No paid SEO tools, no fabricated demand (null, never 0), no relaxed gates, no production
   changes unless the owner asks.**

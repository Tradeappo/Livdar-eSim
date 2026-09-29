# Ahrefs evidence index, frozen

The subscription ends **8 October 2026**. Everything listed here is
**FROZEN_AFTER_AHREFS_EXPIRY**: these files are the only copy after that date.

Units: 1,200,404 of 2,000,000 used at the start of this pass, **13,550 spent**,
**786,046 remaining**. Reset date 2026-10-08, which is the expiry.

## This pass, 2026-09-30

| File | Rows | What it holds |
| --- | --- | --- |
| `ahrefs/MEASURED-2026-09-30.tsv` | **269** | Volume, global volume, KD, CPC, clicks and traffic potential for the six markets that had no measurement: it 56, gb 48, ja 45, es 44, br 37, tw 33. Tagged with the family axis each keyword tests |
| `ahrefs/SERP-2026-09-30.tsv` | 7 | Full top 10 characteristics with the weakest ranking domain, its DR and referring domains, for the two new family verdicts plus the five carried forward |

Cost breakdown: 5 keyword batches at 2,508 / 2,408 / 2,193 / 2,064 / 1,763 / 2,107
units, 2 SERP overviews at 260 and 247.

## Earlier in the project, all still on disk

| Folder | What it holds |
| --- | --- |
| `../candidate-universe-2026-09-29/measured/` | 250 keywords in de, en-us, fr, nl, pl with volume, KD, CPC and global volume |
| `../candidate-universe-2026-09-29/MASTER-CANDIDATE-INVENTORY.tsv` | 10,152 candidates, 976 measured, 47 columns |
| `../scale-universe-2026-09-29/measured/SAMPLES.tsv` | 37 keywords: the airport transfer sample of 28 plus climate and sport |
| `../scale-universe-2026-09-29/serp/SERP-SAMPLES.tsv` | 5 SERPs in full |
| `../ahrefs-export-2026-09-28/keywords-explorer/research-2026-09-28.tsv` | 44 keywords with verdicts |
| `../ahrefs-export-2026-09-28/serp/` | 40 SERP rows |
| `../ahrefs-export-2026-09-28/gsc/gsc-x-ahrefs-joined-2026-09-28.tsv` | The 500 live pages joined with Ahrefs and GSC, 21 columns |
| `../ahrefs-export-2026-09-28/backlinks/` | 1,021 all time and 740 live referring domains, anchors, new and lost, 998 disavow candidates |
| `../ahrefs-export-2026-09-28/competitors/` | Per market competitor profiles, the absentify teardown, market leaders |
| `../ahrefs-export-2026-09-28/site-audit/all-179-checks-2026-09-29.json` | The clean crawl: health score 100, zero errors |
| `../ahrefs-export-2026-09-28/site-audit/CLEAN-BASELINE-2026-09-29.md` | Its analysis |
| `../ahrefs-export-2026-09-28/link-opportunities/` | 40 prospect rows |
| `../ahrefs-export-2026-09-28/content-gap/` | Content gap output |
| `../rank-tracker-2026-09-29/` | 705 keywords in four priority tiers, 580 to paste |

Total measured keywords across the project: **519 direct**, plus the 976 measured
rows in the candidate inventory. **54 SERPs** sampled in total.

## What is still unmeasured, and what it would cost

| Gap | Rows needed | Units | Gates which step |
| --- | --- | --- | --- |
| 677 UNKNOWN family x market cells | ~2,030 | ~89,000 | Step 5, 100k to 250k |
| Tier 3 city demand | ~600 | ~26,000 | Step 6, 250k to 500k |
| 20 SERPs on re-cut places, 20 on events | 40 SERPs | ~8,000 | Step 3, 5k to 25k |
| **Total** | | **~124,000 of 786,046** | |

Spend these three before 8 October. Everything else in the programme can be decided
without Ahrefs; these three cannot.

## Methodology notes that must survive the subscription

1. **Measure English travel and local phrasings in `gb`, not `us`.** The same keyword
   reads 20 in us and 900 in gb for Barcelona airport transfer, 10 and 700 for
   Lisbon. A us only read made the best family in the catalog look dead.
2. **Keywords carry diacritics; only URLs are folded.** `brückentage 2026` is 1,712
   and `brueckentage 2026` is 8.
3. **Join keyword to country, never keyword alone.** `kalender 2026` is a German
   keyword worth 333,644 and a Dutch keyword worth 146,979.
4. **Volume and KD are not enough.** `ristoranti milano` is 10,000 at KD 5 and
   aggregator locked; `eventi milano` is 7,600 at KD 0 with a DR 19 winner. Only the
   SERP separates them.
5. **CJK descriptions measure short against Latin thresholds.** 40 of 45 Japanese
   meta descriptions flagged as too short are correct as written.
6. **Global volume differs from market volume by up to 100 times** on calendar and
   holiday terms. Record both.

# Ahrefs export index

Every Ahrefs dataset held on disk, with its size, so that after expiry it is obvious
what exists and what would have to be bought back. All paths are relative to
`reports/ahrefs-export-2026-09-28/` unless stated.

**Nothing in this list can be regenerated once the subscription ends.** The backlink,
referring-domain and Brand Radar folders are the ones with no adequate free substitute.

## backlinks/ — irreplaceable
| File | Size |
|---|---|
| `all-backlinks-top500-by-dr-2026-09-28.json` | 436 KB |
| `refdomains-all-time-2026-09-28.json` | 258 KB |
| `refdomains-audit-2026-09-28.tsv` | 135 KB |
| `pbn-audit-2026-09-28.json` | 85 KB |
| `disavow-candidates-2026-09-28.txt` | 31 KB |
| `dofollow-domains-2026-09-28.csv` | 17 KB |
| `AUDIT-2026-09-28.md` | 10 KB |
| `link-intersect-2026-09-28.md`, `new-and-lost-2026-09-28.md`, `anchor-clusters-2026-09-28.tsv`, `growth-timeline-2026-09-28.tsv`, `refdomains-history-2026-07-01-to-2026-09-28.json` | small |

## organic/ — the demand picture for every published page
| File | Size |
|---|---|
| `published-page-demand-2026-09-28.json` | 147 KB |
| `published-page-demand-2026-09-28.tsv` | 51 KB |
| `CANDIDATE-INVENTORY.md` | 15 KB |
| `candidate-inventory-FINAL-2026-09-28.tsv` | 9 KB |
| `cohort-candidates-2026-09-28.tsv` | 8 KB |
| `new-families-2026-09-28.md` | 7 KB |

## production/ — the live-site monitoring baseline
| File | Size |
|---|---|
| `atlas-monitor-2026-09-28.json` / `-09-29.json` | 286 KB each |
| `internal-links-2026-09-28.json` | 115 KB |
| `sitemap-url-status-2026-09-28.tsv` | 51 KB |
| `international-2026-09-28.json` | 12 KB |
| `sitemap-url-counts-2026-09-28.tsv`, `production-verification-after-fix-2026-09-28.json` | small |

## gsc/ — the GSC join, which survives expiry because GSC itself is free
| File | Size |
|---|---|
| `gsc-x-ahrefs-joined-2026-09-28.json` | 286 KB |
| `gsc-x-ahrefs-joined-2026-09-28.tsv` | 72 KB |
| `GSC-X-AHREFS.md` | 10 KB |

The join is the valuable half: GSC keeps producing impressions and positions for free,
but the Ahrefs side of this join (volume, KD, traffic potential) does not.

## site-audit/ — the clean baseline
Held in `site-audit/`: `CLEAN-BASELINE-2026-09-29.md`, `CLASSIFIED-FINDINGS.md`,
`all-179-checks-2026-09-28.json` and `-09-29.json`, plus two raw issue crawls.
**Health score 100, zero errors, 11 of 179 checks non-zero, all low severity.**

## competitors/, link-opportunities/, content-gap/, brand-radar/, rank-tracker/, keywords-explorer/, serp/, livdar/, other-sites/, indexnow/
Indexed in full in `09-COMPETITOR-EVIDENCE.md`. `other-sites/checkpoint-2026-09-28.json`
holds the checkpoint for the five sibling sites.

## Round-three additions, held in the research freeze
In `reports/livdar-final-research-freeze-2026-09-30/`:

| File | What it holds |
|---|---|
| `FAMILY-KEYWORD-HARVEST.csv` | 282 harvested keywords per validated family, with volume, KD, CPC |
| `MARKET-BREADTH-HARVEST.csv` | 497 local-language keywords across the nine under-measured markets |
| `PATTERN-BREADTH-MEASURED.csv` | 11 breadth measurements with floors, limits and whether the tail exhausted |
| `MEASURED-SCALE-ROUND3.json` | each family's estimate against its measured breadth |
| `ENTITY-MODIFIER-RESEARCH.csv` | 95 entity-plus-modifier measurements |
| `ROUND2-AXIS-MEASUREMENTS.csv` | the round-two axis measurements |
| `ENTITY-AXIS-MEASUREMENTS.csv` | 137 keywords across the nine axes |

## API budget at the freeze
Advanced plan, monthly. **1,335,064 of 2,000,000 units used, 664,936 remaining**,
resetting 2026-10-08. This session spent 48,787: 34,287 on the family harvest and
breadth measurements, 14,500 on the nine-market breadth pass.

The API key itself is valid to 2036-09-05, so if the subscription is ever reinstated
the key does not need replacing — only the plan.

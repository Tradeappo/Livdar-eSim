# Next steps: from 1M offline to published pages, and 1M → 10M → 100M

Nothing here is to be done in production without the owner asking. Offline steps can start
from the committed state (`RECOVERY-INSTRUCTIONS.md`).

---

## 1. Housekeeping that needs no decision

1. **URL Inspection token expiry.** `scripts/atlas/gsc-url-inspection.mjs` mints one access token
   (`scripts/lib/google-search-console.mjs`, `lifetime: '3600s'`) and a run dies with
   `401 UNAUTHENTICATED` at 60 minutes, after about 550 URLs (run 39496309572, 2026-10-20).
   Re-mint the token after about 50 minutes, or once on a 401 and retry that URL. Also order rows
   round-robin by locale inside a family, so a truncated run stays stratified by language (the
   2026-10-20 sample of cohort 003 covered only `de` and `en`). Add a unit test with a fake clock.
2. **Run the builder once** (`run-1m-pipeline.sh --from-manifest`) to refresh `1M-SUMMARY.json`
   with the corrected `funnel_reconciles` formula. FINAL should not move; if it does, the commit
   message must say why.
3. **Port `scripts/atlas/verify-live-atlas.mjs` and `fetch-live-evidence.mjs` to `main`** the next
   time a publish PR is opened, so production checks live next to the code they check.

## 2. When the owner asks for search-engine work (production, no new pages)

- Dispatch `atlas-search-console` on `main` with `submit_sitemap: true` (merged as PR #40) and
  `inspect_urls: true`. Google last downloaded `sitemap.xml` on 2026-10-17 with 739 URLs, before
  cohort 003 existed.
- After the token fix, inspect the 947 URLs the 2026-10-20 run did not reach (70 of the old 500 and
  877 of cohort 003).
- Watch indexation by language: on 2026-10-20 the old 500 stood at fr 71%, es 70%, de 54%, en 48%,
  pt 44%, pl 25%, ja 19%, it 8%, nl 5%; 199 of 200 crawled pages were indexed. **Crawl, not quality,
  is the constraint.** Large new cohorts before crawl demand grows risk diluting it.

## 3. When the owner asks for the next cohort

Rows that can be published with **no new builder**: 25,665 remaining `weather.city-month` and 20
`neighbourhoods.city-where-to-stay`. Prefer DEMAND_PROVEN rows (14,207 of the 26,665 weather rows,
some already published, carry clickstream readership of their own city article) and languages
that index well.
Follow `PIPELINE-RUNBOOK.md`, section 8, end to end; `scripts/atlas/build-cohort-003.mjs` is the
template.

## 4. Page builders to write, in order of what they unlock

Rows with a ready or available source (`source_status` READY_NOW or SOURCE_AVAILABLE), by demand
class (`BUILDER-PRIORITY.json`):

| builder | rows unlocked | DEMAND_PROVEN | UTILITY_PROVEN | AGGREGATION | note |
|---|---:|---:|---:|---:|---|
| **landmark entity** | 182,329 | 147,676 | 5,887 | 28,766 | the strongest evidence in the inventory; one builder across 1,999 classes |
| **settlement** | 130,173 | 0 | 130,173 | 0 | utility only (two facts beyond population/area/elevation, or three pages inside) |
| **transit city pair** | 125,652 | 6,953 | 0 | 118,699 | class B (family intent + 3 of 5 utility signals); must state only timetable facts |
| **city things-to-do** | 61,412 | 36,083 | 25,329 | 0 | the largest measured family (Ahrefs, ten languages); Turkish locative forms are one page |
| **heritage register entry** | 31,242 | 26,030 | 5,212 | 0 | on an official register AND read |
| outdoor peak / trail / castle | 15,307 / 23,463 + 12,175 / 7,533 | small | most | 0 | OSM attributes + Wikidata notability |
| city category / cuisine lists | 14,060 / 13,814 | 3,317 / 330 | 10,743 / 0 | 0 / 13,484 | admitted categories only (restaurants es/de/en, cafés de/en, museums en) |

**Review before building:** area-level POI category lists (`places.area-cuisine` 22,348,
`places.area-restaurant` 15,751, `places.area-pharmacy` 10,855, `places.area-fast_food` 10,741,
`places.area-cafe` 8,764, `places.area-supermarket` 7,495, `places.area-clinic` 5,838) are
AGGREGATION rows with no per-page demand. The Ahrefs round refused supermarkets, parking and
nightlife at city level. Re-check which of these categories are within the admitted list before
writing a builder for them, rather than publishing them on aggregation alone.

Each builder needs: the model in `lib/atlas/atlas-model.js`, copy in nine languages written per
language (not translated), a URL segment per language from that language's own head term, link
and CTA chains, directory headings, and a cohort through `main`'s full gates.

## 5. Inventory work toward 10M (offline)

The honest statement from the research (`AHREFS-EXPIRY-REPORT-2026-10-07.md`, section 16):
**nothing measured supports 10,000,000 on its own.** It is the product of many axes, and each
multiplier has to be earned per cell. The paths, cheapest first:

1. **Key-gated licence-clear GTFS:** Spain NAP (111 feeds) and Trafiklab Sweden (59), held only
   for an API key registration. Then the 1,623 held feeds as licences are read one at a time.
2. **Place × category at neighbourhood level** in the admitted languages (German and Italian
   reach Friedrichshain, Kreuzberg, Goslar Altstadt).
3. **More Wikidata classes and registers:** the class census ranked 4,261 classes; 2,460 hold 25+
   readable items. Heritage registers per country.
4. **Destination × language** on the measured rule (382 destinations carry demand in 2+ languages).
5. **Place × duration** (each duration is its own parent topic; a few hundred pages).
6. **eSIM axes** for the main site: device × eSIM support (CPC up to 55 USD, KD 0-1), country ×
   eSIM availability, carrier × eSIM.
7. **Visa:** one government dataset per origin nationality (only UK FCDO ingested).
8. **Airport access** for every airport in the register; **climate and season** per place within
   the grid-cell rule; **holiday pulse** per subdivision.
9. **New markets** from `COUNTRY-PRIORITY-MATRIX.csv` and `1M-COUNTRY-PLAN.csv`, materialised the
   way tr-TR, da-DK, nb-NO and fi-FI were.

Per-entity demand for any of these can only come from free sources now: the Wikimedia clickstream
(needs an article in a captured edition) and, after publication, Search Console.

## 6. Toward 100M (architecture, not a target)

`reports/livdar-expiry-freeze-2026-09-30/13-100M-ARCHITECTURE.md` and `100M-AXIS-MATRIX.csv`
(19 models). The point is a **candidate graph** that can score 100M candidates and reject
99.97% of them, so a weak page can never be published by accident. The finding that matters:
**axes survive measurement only where each cell carries a different real fact**; every axis that
failed did so because its second dimension was a template variable (pair × mode is not an axis;
duration is). About fifty axes of today's size, each with its own licence-clear source, would be
needed. The register of licence-clear sources (`TRANSPORT-SOURCE-REGISTER.csv`) is a more important
asset than any single family measurement. The publication ceiling is governed by
`14-PUBLICATION-CONTROLLER.md` (ten STOP conditions), not by inventory size.

## 7. Do not

- Do not publish a cohort, dispatch production workflows or merge to `main` unless asked.
- Do not buy or call paid SEO tools.
- Do not relax any gate, restore the 23,453 climate rows, or treat family-level keyword fields as
  per-page demand.

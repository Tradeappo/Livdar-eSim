# The final deliverable, all 17 sections

Updated 2026-09-29. **Ahrefs Advanced ends 8 October 2026.**

The work lives in three folders because it was built in three passes. This index maps the 17 sections
you asked for onto the actual files, so nothing has to be hunted for.

**Start at
[scale-universe-2026-09-29/RECONCILIATION-OLD-VS-NEW.md](scale-universe-2026-09-29/RECONCILIATION-OLD-VS-NEW.md).**

`scale-universe-2026-09-29/` answers the 1,000,000 candidate brief and has its own
17 deliverables. Its first conclusion, that 1,000,000 is not honestly reachable and
the validated universe is 13,975, is **withdrawn**: that pass modelled 16 of the 64
families in `atlas/product-seo-map.json`, in 9 of the 11 known markets, and rejected
its two largest blocks on 5 keyword samples measured in the wrong country. **13,975
is not a ceiling on Livdar.** It is the quality-gated count inside that subset.

The reconciliation sets out four separate totals instead of one: 1,791 publishable
now, roughly 3,600 after three costed acquisitions, 180,000 to 200,000 unresolved and
no longer rejected, and 330,000 single market to 2.9M across markets as the
architectural universe. Whether 1,000,000 of those are genuinely distinct is unknown,
because 48 families and 5 markets have never been measured.

The 10,152 figure in section 1 below is the earlier pass and remains valid on its own
terms. Where the counts disagree, read the reconciliation for why rather than
treating either number as the answer.

| Marker | Meaning |
| --- | --- |
| **FROZEN_AFTER_AHREFS_EXPIRY** | Came from Ahrefs. Cannot be recreated after 8 October. |
| RENEWABLE | Comes from the repo, production or GSC. Regenerates any time. |
| PENDING | Needs a signed-in human, or a crawl that has not run. |

---

## 1. MASTER-CANDIDATE-INVENTORY

**`candidate-universe-2026-09-29/MASTER-CANDIDATE-INVENTORY.tsv`** and `.json`
[README](candidate-universe-2026-09-29/README.md)

**10,152 individual candidate pages**, 44 columns, 976 measured against Ahrefs. Generated from the
repo's own entity and source data, so the structure is RENEWABLE while every volume, KD and CPC
figure is **FROZEN**.

Regenerate with `node scripts/atlas/candidate-universe.mjs`, re-apply measurements and gates with
`node scripts/atlas/candidate-merge-measured.mjs`.

Also: `VALIDATED.tsv` (757), `aggregates/` (14 cuts), `measured/` (250 raw Ahrefs rows, FROZEN).

## 2. AHREFS-RAW-EXPORTS

**`ahrefs-export-2026-09-28/`**, all FROZEN. Backlinks at link and domain level, Site Audit's 179
checks, absentify's 150 top pages and 25 months of history, crawled pages, subscription state.
See [`EXPORT-STATUS.md`](ahrefs-export-2026-09-28/EXPORT-STATUS.md) for every dataset and its
outcome, including the empty ones.

Plus `candidate-universe-2026-09-29/measured/*.tsv`, the 250 keyword measurements from 2026-09-29.

## 3. AHREFS-PROCESSED-INTELLIGENCE

| File | What it holds |
| --- | --- |
| [`ahrefs-export-2026-09-28/FINAL-REPORT.md`](ahrefs-export-2026-09-28/FINAL-REPORT.md) | The findings, organised by section |
| [`ahrefs-export-2026-09-28/FILE-INDEX.md`](ahrefs-export-2026-09-28/FILE-INDEX.md) | Every file in that folder, with FROZEN markers |
| [`ahrefs-export-2026-09-28/livdar/historical-baseline-2026-09-28.md`](ahrefs-export-2026-09-28/livdar/historical-baseline-2026-09-28.md) | Why Ahrefs holds no organic history for livdar.com, and what follows |
| `candidate-universe-2026-09-29/aggregates/` | Candidates by surface, family, language, market, family x language, quality risk, status, feasibility, monetization, demand tier, licensing status, page type, volume bucket, KD bucket |

## 4. COMPETITOR-UNIVERSE

| File | What it holds |
| --- | --- |
| [`ahrefs-export-2026-09-28/competitors/PER-MARKET.md`](ahrefs-export-2026-09-28/competitors/PER-MARKET.md) | The eleven families market leaders actually run, six needing no external data |
| [`ahrefs-export-2026-09-28/competitors/COMPETITOR-INTELLIGENCE.md`](ahrefs-export-2026-09-28/competitors/COMPETITOR-INTELLIGENCE.md) | Nine replicable patterns |
| `competitors/market-leaders-2026-09-28.tsv` | 23 competitors, 8 markets, with DR, traffic, keywords, top-3 count, pages, family set |
| `competitors/families-observed-2026-09-28.tsv` | 15 families with data requirement and feasibility |
| `competitors/absentify/TEARDOWN.md` | absentify's model in ten rules, with 25 months of history |
| `competitors/german-holiday-competitors-2026-09-28.tsv` | 19 German competitors with traffic per page |
| `competitors/feiertage-deutschland-top-pages-2026-09-28.tsv` | The efficiency leader's 30 pages, labelled by family |

**Low-DR winners, which is what was asked for:** `kalender-online.com` DR **10** with 105,485
monthly visits, `ferien-deutschland.com` DR **12** with 49,639, `kwheute.de` DR **17** with 94,290,
`calendrier.best` DR **25** with 58,837, `vacances-scolaires-education.fr` DR **32** with 304,930.

## 5. SERP-WEAKNESS-REPORT

**`ahrefs-export-2026-09-28/serp/serp-snapshots-2026-09-28.tsv`** plus the SERP sections of
`PER-MARKET.md`. FROZEN.

The headline: a **DR 0** page holds position 8 in Poland, a **DR 6** page holds position 10 in the
Netherlands, and on `sommerferien nrw 2026` (257,000 searches) positions 6 and 8 are held by pages
with **zero referring domains**. Page-level referring domains are recorded per result, not just
domain-level DR, because that is the number that decides whether a SERP is contestable.

## 6. LOCAL-LANGUAGE-OPPORTUNITIES

**`candidate-universe-2026-09-29/LOCAL-LANGUAGE-OPPORTUNITIES.tsv`**, 322 non-English candidates
measuring 500 or more a month.

Native phrasing was researched rather than translated, and the difference is measurable: Polish
`zarobki w niemczech` measures 570 where `średnia pensja Niemcy` measures 37, and Dutch
`gemiddelde huur nederland` measures 68 where `huurverhoging nederland` measures 1.

Biggest local-language finds: `niedziele handlowe 2026` (pl) **112,119**, `carnaval 2027` (nl)
**74,541**, `imieniny` (pl) **50,193**, `volle maan` (nl) **41,960**, `ascension 2027` (fr)
**43,874**, `wielkanoc 2027` (pl) **25,644**.

## 7. TOOL-OPPORTUNITIES

**`candidate-universe-2026-09-29/TOOL-OPPORTUNITIES.tsv`**, 504 candidates across 14 tool types and
9 languages.

The highest monetization fit in the whole inventory, and the only family where the page is a
function rather than a table. Measured heads: `salary calculator` **143,332** (KD 69),
`rent affordability calculator` **3,055** (KD 0), `moving cost calculator` **2,408** (KD 41, CPC
500 cents), `travel budget calculator` 143.

`esim-data-estimator` is flagged specifically: it is the one candidate with a direct path to the
eSIM shop, which 484 of the 500 live Atlas pages lack.

## 8. BACKLINK-AUDIT

**`ahrefs-export-2026-09-28/backlinks/AUDIT-2026-09-28.md`**, FROZEN.

1,021 all-time referring domains, 1,000 classified, **998 class A and 2 class B**. The disavow file
is written in Google's format and **NOT submitted**:
`backlinks/disavow-candidates-2026-09-28.txt`.

Two corrections recorded rather than quietly fixed: the links **turned dofollow in August** (630
from 313 domains, 578 in September alone), and the IP-subnet evidence was inflated because 982 of
1,000 domains sit behind Cloudflare. `anchor-clusters-2026-09-28.tsv` resolves the dofollow links
into three deliberate bursts and shows a fourth cluster first seen 2026-09-27.

## 9. LINK-OPPORTUNITIES

**`ahrefs-export-2026-09-28/link-opportunities/`**, FROZEN. Built 2026-09-29, after this index
first flagged the section as thin.

Rather than inventing a wishlist, this reads the referring domains of
`feiertage-deutschland.de`, the most link-efficient competitor found anywhere in this research
(DR 36, 167,105 visits from 116 pages, 1,441 per page against absentify's 128). 40 rows, each a
domain that actually links to it, with DR, traffic, dofollow count and first seen.

**The standout finding: `hamburg.de` (DR 89) sends 2,917 dofollow links.** A city portal that
decides your calendar is the reference it wants to cite links at scale. `berlin.de` (91),
`sachsen.de` (90) and `poznan.pl` (86) follow the same pattern. Universities are the second
pattern: `uni-bremen.de` (83, 12 dofollow), `uni-bonn.de`, `uni-freiburg.de`, `uni-marburg.de`.

11 of the 40 are marked EXCLUDE and listed rather than silently dropped: UGC platforms, metrics
scrapers (`sitelike.org` alone generates 465 worthless links), and four Ahrefs-flagged spam
domains. One of those, `za.com`, is the same domain in Livdar's own class B review list, which
confirms it is a general spammer rather than anything aimed at Livdar.

**Limits stated in the file:** one competitor, one market, no outreach list, nothing acted on. The
equivalent pull for the Polish, Dutch and French leaders costs about 960 units each and was not
run. `backlinks/link-intersect-2026-09-28.md` holds the earlier intersect run.

## 10. SITE-AUDIT-CLEAN

**PENDING.** `ahrefs-export-2026-09-28/site-audit/CLASSIFIED-FINDINGS.md` holds all 179 checks
classified from the 2026-09-28 12:56 UTC crawl, but **that crawl is three fixes stale** and the
clean one has not run. As of 2026-09-29 23:00 UTC the latest crawl is still 2026-09-28 12:56.

There is no API endpoint that starts a crawl. Press **Rerun crawl** in Ahrefs > Site Audit >
Livdar. A self check-in is scheduled to capture it automatically if the scheduled crawl lands.

## 11. RANK-TRACKER-BASELINE

**PENDING, and the most time-sensitive item in the package.**

**`candidate-universe-2026-09-29/rank-tracker/PASTE-READY.md`** holds **571 keywords** in 9 country
batches, sorted by measured volume, with 55 tag lists for bulk tagging. Built from the 500 live
Atlas page keywords, 373 measured candidate heads at 500+ a month, and the earlier 125-keyword
proposal, deduplicated on keyword plus country.

The API cannot create Rank Tracker keywords and `app.ahrefs.com` returns **403 with a Cloudflare
challenge** from this container, so this is manual. Position history starts the day a keyword
exists and cannot be backfilled: a baseline created after 8 October is worth nothing.

## 12. BRAND-RADAR-BASELINE

**PENDING.** `ahrefs-export-2026-09-28/brand-radar/PASTE-READY.md`, 44 prompts in 9 reports with
the engine list.

**Every engine except ChatGPT is `off` on all six existing reports**, including Google AI
Overviews. Given that nearly every German and Australian holiday term Livdar targets carries
`ai_overview` in its SERP features, that is the single most consequential setting currently
disabled.

## 13. GSC-AHREFS-JOIN

**`ahrefs-export-2026-09-28/gsc/GSC-X-AHREFS.md`** and
`gsc/gsc-x-ahrefs-joined-2026-09-28.tsv`. **HYBRID:** Ahrefs columns FROZEN, GSC columns RENEWABLE.

All 500 pages read **`out_of_window`, not zero**. Re-verified 2026-09-29: the newest GSC import
still covers 2026-08-29 to 2026-09-25, which ends before the pages stopped returning 404 at
12:32 UTC on 2026-09-28. `signal_counts.none` is **0** and a test holds it there.

Refresh with `node scripts/atlas/atlas-monitor.mjs` once a newer import lands. The first one that
says anything covers 2026-09-28 onward.

## 14. PROGRAMMATIC-QUALITY-GATES

Three files in `candidate-universe-2026-09-29/`:

| Tier | Candidates |
| --- | --- |
| `PROGRAMMATIC-QUALITY-GATES-safe-to-scale.tsv` | **2,943** |
| `PROGRAMMATIC-QUALITY-GATES-scale-with-gates.tsv` | **5,457** |
| `PROGRAMMATIC-QUALITY-GATES-high-thin-content-risk.tsv` | **1,255** |
| REJECT (in `REJECTED-OPPORTUNITIES.tsv`) | 497 |

Gates are structural first (does the page answer a distinct query, what data varies per page, is
the source good enough, can it avoid near-duplicates, does it support internal links) and then
**moved by measurement**: a family whose best measured keyword cannot reach 100 searches a month in
any market it was measured in is demoted regardless of how clean its data is.

## 15. REJECTED-OPPORTUNITIES

**`candidate-universe-2026-09-29/REJECTED-OPPORTUNITIES.tsv`**, 495 rows, each with its reason.

Kept rather than deleted so the numbers are not rediscovered in six months and mistaken for missed
opportunities. The notable ones:

- **Climate / best time to visit**, 495 candidates. KD 1.5 but Reddit and Conde Nast hold the
  results. 24 pages are live and can stay; it is not an expansion target.
- **`vollmond`, 162,071 at KD 0**, the largest zero-difficulty term found anywhere in this work,
  and pure computation. Rejected as off-brand for a cost-of-living site with no monetization path.
- **`zeitumstellung 2026`, 56,833 at KD 8.** Would pass any difficulty filter; the SERP is chip.de
  (DR 86), hamburg.de (DR 89) and the European Commission (DR 97).
- **`kalendarz 2026` (pl) year-calendar head**, where a SERP page carries 55,463 backlinks. Note
  this rejection is **market-specific**: the German `kalender 2027` was validated separately and is
  winnable, with a DR 10 page at position 3.

## 16. BLOCKED-BY-DATA-OR-LICENCE

**`candidate-universe-2026-09-29/BLOCKED-BY-DATA-OR-LICENCE.tsv`**, 1,126 rows.

The single biggest constraint in the whole programme: **OpenHolidays covers 36 countries and 32 are
European. There is no US, GB, CA, AU, JP, BR or TW.** So AU and CA, worth 30.4% of absentify's
traffic and needing no new language, are blocked on data rather than on SEO.

Also here: German school holidays (**772,000 monthly searches** across four keywords, blocked on 16
state education ministries), French school holidays (**283,339 at KD 0**, a better prospect because
France sets its calendar nationally across 3 zones, but the licence is unverified), city safety
(`safety-data-verified` licence to be established), and monthly stay listings (no lawful
inventory, and fabricating listings is out of the question).

## 17. README, and how to use this after Ahrefs expires

This file, plus [`candidate-universe-2026-09-29/README.md`](candidate-universe-2026-09-29/README.md)
and [`ahrefs-export-2026-09-28/FILE-INDEX.md`](ahrefs-export-2026-09-28/FILE-INDEX.md).

### What keeps working after 8 October

| Cadence | Check | Where |
| --- | --- | --- |
| **Weekly** | Atlas impressions, clicks, position by surface and language | GSC workflow, then `scripts/atlas/atlas-monitor.mjs` |
| **Monthly** | **Manual actions** | GSC. This is what decides whether the disavow file gets submitted. |
| **Monthly** | Links report, referring domain count | GSC. Coarser than Ahrefs but enough to spot further escalation. |
| **Monthly** | Homepage performance specifically | GSC. It is the only backlink target. |
| **Weekly, Q1 2027** | Pulse impressions | GSC. Where the three-month lag and the seasonal peak both land. |
| **Per deploy** | `npm test`, `npm run dashcheck`, `verify-live`, `international-check` | repo. 394 tests. |
| **Any time** | Regenerate the candidate universe | `node scripts/atlas/candidate-universe.mjs` |

### One instrument that earned its place

Ahrefs reported **"missing reciprocal hreflang: 0"** while 120 pages had genuinely incomplete
hreflang sets, because the sets were internally consistent and merely short.
`scripts/atlas/verify-live.mjs` compares served hreflang against `alternatesFor(model)` and found
it. **A zero from Ahrefs means "no contradiction", not "complete".** Keep `verify-live` in the
deploy path.

### The five things only a signed-in human can do

Full steps in [`USER-ACTIONS-REQUIRED.md`](USER-ACTIONS-REQUIRED.md).

1. **Add the Rank Tracker keywords** (571 prepared, 9 pastes). Highest value, hard deadline.
2. **Add the Brand Radar prompts and switch on Google AI Overviews.**
3. **Rerun the Site Audit crawl** before 8 October, so a clean baseline exists.
4. **Decide on the disavow file.** 998 domains, prepared, unsubmitted.
5. **Answer the school-holidays data question.** Is there a lawful, licensable source, for Germany's
   16 states or France's 3 zones? That answer is worth over a million monthly searches and nothing
   else in this package comes close.

# Cohort 004: GO / HOLD

**Decision: GO.** Every quality gate and production gate passed. No gate was relaxed, and Italian is held out.

## What

| | |
|---|---|
| pages | 5,000 |
| family | `weather.city-month` (the only renderable family with unpublished FINAL rows) |
| funnel | 26,665 FINAL rows → 18,094 eligible → 5,000 selected |
| countries | 134 |

**By language and market:**

| language | pages | market |
|---|---:|---|
| fr | 1,082 | fr-FR |
| en | 1,048 | en-US 1,022, en-GB 26 |
| es | 749 | es-ES |
| ja | 710 | ja-JP |
| pl | 466 | pl-PL |
| pt | 465 | pt-BR |
| nl | 322 | nl-NL |
| de | 158 | de-DE |
| it | 0 | held out |

The allocation is each language's eligible pool, weighted by its Cohort 003 crawled share as of 2026-10-24, with a floor of 100 pages per language.

## Gates

**Cohort QA: 22 checks, 0 failures.** It covers:
- builds; unique path, title, description and H1;
- word floor; canonical; title and description length; H1;
- provenance; no long dashes; schema; freshness;
- hreflang self, resolves, reciprocal and x-default;
- orphans; links out; links resolve; near-duplicates.

0 near-duplicate pairs in 1,319,814 comparisons.

**Builder refusals, beyond the Cohort 003 rules:**

| refusal | pages |
|---|---:|
| language held out: Italian | 676 |
| entity audit | 48 |
| too similar to an existing or kept page | 378 |
| title already taken in its language | 365 |
| same path as another city | 5 |
| legacy city-month city | 6 |
| long dash | 2 |

**Tests:** `npm test` passes 414, fails 0.

**Preview** (`dpl_CaDHsEh8sRhjqX6S2XGEgMuzbiPi`, built in 150 s), checked page by page with `verify-live-atlas.mjs`:
- All 6,500 Atlas pages return 200.
- Every page has a self canonical on livdar.com.
- Hreflang equals the cross-cohort cluster on every page.
- Every model link is present in the HTML.
- Every URL is in a child sitemap.
- The only flag is `noindex`, which `lib/indexing.js` sets on every non-production deployment.

## Sitemaps

- Eight new child sitemaps, one per language, named `atlas-pages-c004-<lang>-climate`, with 158 to 1,082 URLs each.
- Every existing child keeps exactly its URLs.
- The index grows from 80 to 88 children and from 1,749 to 6,749 URLs.

## Internal links

- Every page has 8 links. Each page receives at least 3 inbound links within the cohort, with a median of 8, and there are 0 orphans.
- **Crawl push for the old pages:** 478 pages carry one link to a same-country, same-language page from Cohorts 001/002 that was not yet crawled. That reaches 66 of the 263 old targets, with 0 broken and 0 cross-language links.
- **Cohort 003 hreflang:** 283 live Cohort 003 pages gain 735 hreflang alternates, because their city now has another language in Cohort 004. Their content is unchanged.

## Crawl backlog

- Google's current throughput is about 130 newly crawled Atlas URLs per day (Cohort 003: 226 → 360 → 488 crawled over 42 → 67 → 91 hours).
- The uncrawled backlog rises from 512 (Cohort 003) to 5,512. At today's rate that is about 42 days.
- Throughput is treated as a monitoring signal here, not a cap. The gate that matters is acceptance: indexed / crawled is 99.8%.

## Risks

1. **Memory and cold starts.** `cohort-004-pages.json` is 54 MB. Loading all 6,500 pages takes about 0.8 s and about 300 MB per function instance, against about 70 MB before. The pages are prerendered (`generateStaticParams`, `dynamicParams = false`) and revalidated daily, so this cost falls on build and revalidation, not on most requests. **Watch Vercel runtime errors after launch.**
2. **ISR revalidation volume.** 6,500 pages × 1 revalidation a day. The last 7 days show 0 runtime errors.
3. **Crawl dilution.** 5,000 new URLs compete for the same crawl as the old 777. Watch whether the old pages' crawl stops entirely.
4. **Shared cities across languages.** 84% of Cohort 004 pages share their city with another language version, against 76% in Cohort 003. Each language row was admitted by the FINAL localisation gate on that market's demand, and each page carries its own language's copy pack, as in Cohort 003.

## Excluded

- Italian, until `atlas-pages-it-climate.xml` is re-read.
- Nothing else. No family other than `weather.city-month` can be rendered today.

# Livdar SEO scale runbook

Status: SEO foundation merged in main. Verify the current Vercel production commit before treating a change as live.

## Non-negotiable contracts

- V41 remains the visual source of truth. The marketplace source and its CSS/scripts are not redesigned by this work.
- The existing 91 indexable URLs, titles, descriptions, H1s, canonicals and hreflang clusters are regression-protected.
- Preview deployments are `noindex, nofollow` and disallowed in `robots.txt`.
- `generationEnabled` stays `false`. Taxonomy capacity is a model, not a publishing instruction.
- No Product or Offer schema exists until a real supplier, current inventory and a checkout path exist.
- Existing Ahrefs research is the base dataset. New API use is limited to targeted validation.

## Implemented architecture

| Area | Implementation | Guardrail |
|---|---|---|
| Rendering | Next.js static generation for the 91 editorial routes | `dynamicParams = false`; unpublished combinations 404 |
| Crawl control | environment-aware metadata and robots | previews always noindex |
| Canonical and hreflang | generated from the published content registry | no hreflang to missing pages; English x-default |
| Sitemaps | split by locale and family with version-controlled lastmod | only published registry entries |
| Schema | Organization, WebSite, WebPage, Article, BreadcrumbList, CollectionPage, FAQPage | schema describes visible content only |
| AEO/GEO | answer-first intros and visible FAQs plus `/llms.txt` and `/llms-full.txt` | sample prices explicitly excluded from quotable claims |
| Internal links | destination, region and guide grids generated from the same registry | no links to unpublished pages |
| Programmatic SEO | taxonomy, eligibility score, lifecycle and authenticated evaluation API | API evaluates only; it cannot create or publish |
| Operations | DataForSEO, Make and GSC contracts in `data/seo-operations.json` | credentials are environment-only |

## Candidate lifecycle

1. `discovered`: imported into a candidate store, never routed.
2. `qualified`: demand and SERP opportunity validated.
3. `drafted`: unique answer blocks and cited sources exist.
4. `reviewed`: factual, language, duplication and link review complete.
5. `approved`: every hard gate passes; still not live.
6. `published`: a reviewed code change adds the route to the registry.
7. `refresh`: triggered by source age, material fact change or GSC loss.
8. `retired`: removed from discovery and redirected only when a relevant successor exists.

An automation may call `POST /api/programmatic/eligibility` with `Authorization: Bearer $SEO_AUTOMATION_TOKEN`. The response is an evaluation record. The endpoint has no filesystem, GitHub, sitemap or deployment write path.

## DataForSEO and Make flow

1. Make receives a candidate from an approved queue.
2. DataForSEO validates query demand, intent and live SERP composition; it does not replace the accepted Ahrefs base research.
3. The workflow stores source identifiers, timestamps and raw evidence outside the page.
4. Make sends the normalized candidate to the eligibility endpoint.
5. Failing candidates remain `noindex` and outside routing. Passing candidates move to human review, not publication.
6. Publication requires a normal branch, tests, build, preview and explicit approval.

Required secrets: `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, `SEO_AUTOMATION_TOKEN`. Never place them in a generated page or commit.

## Search Console monitoring

Connect a read-only service account through `GOOGLE_SERVICE_ACCOUNT_JSON` and set `GSC_PROPERTY`. Compare 7, 28 and 90-day windows by canonical page, query, country and device. Initial alerts are defined in `data/seo-operations.json`:

- clicks down 30%;
- impressions down 35%;
- CTR down 25%;
- average position worse by 3 or more;
- alerts require at least 100 impressions to reduce noise.

Triage order: indexing/canonical issue, lost template content, intent change, competitor change, stale fact/source, internal-link loss. Do not auto-rewrite a page from an alert.

Run `npm run gsc:report -- --out reports/gsc-latest.json` after the service account has read-only access to the exact GSC property. This script calls the official Search Analytics API with the read-only scope and writes a local report excluded from git. The 7/28/90 day windows compare equal non-overlapping periods, ending three days before execution. The report includes overall alerts and page/query opportunities, plus country and device breakdowns. Search Console may omit some low-volume query rows; totals use separate ungrouped requests rather than summing incomplete rows. Missing credentials cause an explicit error; no traffic values are invented.

## Search engine discovery

The production sitemap index is `https://livdar.com/sitemap.xml`; submit it through Google Search Console after verifying the domain property. The read-only GSC service account used by the report cannot submit a sitemap. IndexNow is a separate notification channel for participating search engines; it does not submit URLs to Google or guarantee indexing.

Generate a unique key in the hosting environment and set `INDEXNOW_KEY` (8-128 allowed characters). Deploy and confirm that `https://livdar.com/indexnow-key.txt` returns exactly this key. `npm run indexnow:dry-run` prints the current 91 published URLs without printing the key. After a real content update, use `--paths` to select only changed canonical paths, for example:

```bash
INDEXNOW_CONFIRM_LIVE=true npm run indexnow:submit -- --paths /en/esim/japan/,/ro/esim/turcia/
```

Live submission also requires `INDEXNOW_CONFIRM_LIVE=true` and checks the key file on the canonical domain before making an IndexNow API request. The script refuses unpublished paths. A successful API status means receipt, not a promise that the page will be indexed.

## Refresh and removal policy

- Destination facts: review within 90 days.
- Guides: review within 180 days or immediately after a platform/process change.
- Future commercial inventory: review within 14 days and suppress as soon as its source becomes unavailable.
- A candidate with no impressions for 180 days is reviewed for consolidation; this is not an automatic deletion rule.
- Update `lib/content-freshness.js` only after a material edit or review. Sitemap lastmod must never be set to every build time.

## Competitor validation

The 2026-09-20 Ahrefs batch used 126 units and compared Livdar with Airalo, Holafly, Nomad, Saily, Maya and MobiMatter. It did not repeat keyword discovery. The evidence is stored in `data/competitor-validation-2026-09-20.json`.

The finding is structural: Livdar has no measured organic visibility yet while established competitors have materially stronger authority and keyword footprints. The next leverage is crawlable quality, entity clarity, internal discovery, source-worthy tools and measured GSC learning, not a bulk page launch.

## Backlink and digital PR priorities

- Publish citeable, versioned travel-connectivity explainers and calculators.
- Build destination data studies only from licensed/current sources with methodology pages.
- Pitch relevant travel, expat, remote-work and consumer-tech publications; do not buy link packages.
- Reclaim genuine unlinked brand mentions after the brand has earned them.
- Track referring-domain relevance and traffic, not raw link count.

## Release checklist

Run:

```bash
npm test
npm run qa
npm run audit:scale
npm run audit:discovery
INDEXING_ENABLED=true npm run regression
npm run build
```

Then inspect the Vercel Preview on desktop and mobile, confirm HTTP status/canonical/hreflang/schema, check `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, and verify the preview is noindex. Verify the deployment quota and the production commit before merging or deploying.

## Publishing a page (since 2026-09-21)

1. Pick the next page from `npm run inventory` (state `eligible`) and `npm run funnel`.
2. Write the content in `lib/content/<locale>/`. Until the registry says otherwise it is a draft: not routed, not in the sitemap, not in hreflang or llms files.
3. Move it through the lifecycle: `node scripts/publication.mjs qualify|draft|review|approve <locale>:<type>:<id>`, then `publish`. `publish` refuses content under the word floor.
4. Run `npm test`, `npm run qa`, `npm run audit:scale`, `npm run audit:discovery`, `INDEXING_ENABLED=true npm run regression`. New URLs and any change to an existing cluster must be declared in `scripts/seo-regression.mjs`.
5. After deploy, add the URL to `data/indexing-requests.json` priority and follow `npm run indexing:queue`.

Rollback: `node scripts/publication.mjs retire <key>` and deploy. The page leaves routing, sitemap and hreflang; the content stays in the repo. Declare the removed URL in the regression allow list.

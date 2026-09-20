# Livdar SEO scale runbook

Status: implementation branch only. Production merge and production deployment remain blocked until explicit approval.

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
INDEXING_ENABLED=true npm run regression
npm run build
```

Then inspect the Vercel Preview on desktop and mobile, confirm HTTP status/canonical/hreflang/schema, check `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, and verify the preview is noindex. Production remains untouched until approval after this evidence is reviewed.

# Livdar eSIM

The first vertical of the Livdar ecosystem: a multi-market travel eSIM site built on
Next.js 15 (App Router), plain JavaScript, plain CSS, and no dependencies beyond
`next`, `react` and `react-dom`.

## Why it is built this way

Every choice here exists to keep the build deterministic and the SEO defensible.

- **No TypeScript, no Tailwind, no UI library.** Fewer moving parts means fewer
  reasons for a deploy to fail, and the only install step is the one the host runs.
- **Every language is a separate market.** Nothing on this site is translated. Each
  market has its own destination set, its own angle, its own section order, its own
  FAQ. That rule is not a convention, it is enforced by `scripts/similarity-check.mjs`
  and the build fails if it is broken.
- **A page exists only if there is authored content behind it.** The content registry
  in `lib/content/index.js` is the publication gate. No content, no route, no sitemap
  entry. That is the whole anti doorway policy in one rule.
- **No supplier is connected and checkout is off.** `lib/providers/` is an abstraction
  with a stub implementation, so a real supplier can be attached later without
  touching a single SEO page. The quality gate refuses to build if checkout is ever
  switched on while the stub is active.

## Commands

    npm install
    npm run dev        # local development
    npm run build      # quality gate, then next build
    npm run qa         # quality gate only
    npm run dashcheck  # dash rule only
    npm run similarity # duplication rule only

`npm run build` runs `scripts/quality-gate.mjs` first. If the gate fails, `next build`
never runs. The gate checks:

1. Locale table and content registry agree.
2. Destination slugs are URL safe, unique per market, and never shadow a path segment.
3. Every generated path resolves, and every resolvable path is generated.
4. Unpublished destinations do not resolve.
5. Hreflang clusters are reciprocal, self referencing, carry x-default, and point only
   at URLs that exist.
6. Canonicals are unique.
7. Checkout is off while the provider is the stub.
8. No `NEXT_PUBLIC_` variable looks like a secret.
9. Zero en dash, zero em dash, zero dash variants in any source file.
10. No duplicate or near duplicate pages: shingle overlap, title and meta template
    reuse, section order reuse, FAQ reuse, opening sentence reuse, editorial weight.

## Environment

Nothing here is required for the site to build or render. Each one switches on a
capability when it is present.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Defaults to `https://livdar.com`. |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container. GA4 is loaded through GTM only, never twice. |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Set to `false` on preview deployments so they cannot compete with production. |
| `LIVDAR_PROVIDER` | Supplier id. Defaults to `stub`, which returns no plans and refuses orders. |

No secret belongs in a `NEXT_PUBLIC_` variable, and the quality gate fails the build if
one appears there.

## Structure

    app/[lang]/layout.jsx        root layout, consent defaults, GTM, Clarity
    app/[lang]/page.jsx          market homepage
    app/[lang]/[...slug]/        every other page, resolved by lib/routes.js
    app/sitemap.js               sitemap index, split by market and cluster
    app/robots.js                robots, closed on preview deployments
    middleware.js                root and unpublished locales to the best live market
    lib/i18n.js                  locales, localized path segments, slugify
    lib/destinations.js          126 destinations, real networks only
    lib/content/<lang>/          editorial content, one directory per market
    lib/providers/               supplier abstraction, stub implementation
    lib/seo.js                   metadata, hreflang clusters, structured data
    lib/analytics.js             consent mode defaults, event names, consent storage
    scripts/                     the quality gate and its two checkers

## Consent and analytics

Consent Mode v2 defaults are written synchronously in `<head>`, before GTM can load, with
everything denied except `functionality_storage` and `security_storage`. The banner
updates them. GTM is the only tag loader; GA4 is never added a second time in the page.

Events are defined in `lib/analytics.js` and fired through `dataLayer`, with
`language`, `market`, `destination`, `region`, `content_cluster` and `plan_type`
attached where they apply. Every call to action on the site is instrumented.

## What is deliberately not here

- No prices, no stock, no coverage promises and no operator claims that are not real.
  Plans render from the provider or they render an honest empty state.
- No paid checkout, because nothing can be delivered yet.
- No Product schema, because there is no product with a price.
- No fabricated review or rating markup.

# Livdar eSIM integration QA

Date: 2026-09-20

## Scope

- Baseline: `main@bac1f03`
- Claude integration: `claude-esim-integration@072a7d6`
- QA branch: `codex-esim-integration-qa`
- No merge to `main`
- No production deployment

## Claude integration retained

- Existing 91 URL publication architecture and 12 sitemap split
- Canonical, reciprocal hreflang and x-default generation
- New marketplace design and labelled demo catalogue
- Supplier abstraction with checkout disabled
- CollectionPage schema on real hub lists
- SEO baseline and regression scripts
- Image slot, licence and asset adoption pipeline
- `/llms.txt` route

## Corrections in this branch

- Upgraded Next.js from 15.5.7 to 15.5.25
- Pinned corrected PostCSS and Sharp transitive versions
- Added a lockfile and reached zero npm audit vulnerabilities
- Made eSIM advisor, travel advice and social travel card functional
- Added PNG download and native share fallback for the travel card
- Added tests for travel calculations and deployment indexability
- Forced Vercel previews to remain noindex even if an allow flag is scoped too broadly
- Kept preview QA strict while excluding only the intentional robots difference
- Removed synthetic sitemap lastmod timestamps that changed on every build
- Updated `/llms.txt` to describe every working Travel Tool accurately

## Verification

- `npm test`: 5 passed, 0 failed
- `npm run qa`: passed
- `npm run regression`: 91 URLs, 15 declared changes, 0 undeclared changes
- `npm run build`: passed, 109 static pages generated
- `npm audit`: 0 vulnerabilities
- Runtime route check: 91 of 91 baseline routes returned 200 locally
- Preview simulation: pages output `noindex, nofollow`, robots disallows `/`, sitemap sends `X-Robots-Tag: noindex, nofollow`
- Production simulation: pages output `index, follow`

## Bundle snapshot

- Home route page payload: 1.43 kB before, 3.20 kB after functional Travel Tools
- Home first load JS: 111 kB before, 114 kB after
- Dynamic content route: 7.21 kB page payload, 118 kB first load JS
- Shared first load JS: 103 kB

These are build bundle figures, not field Core Web Vitals. A Vercel Preview and browser performance trace are still required.

## Remaining blockers

- No authenticated GitHub write access is available in this environment, so the branch cannot be pushed.
- No Vercel credentials or CLI session is available, so a Preview URL cannot be created here.
- The media manifest still contains zero adopted images. Cards use the intentional gradient fallback.
- A real supplier is not connected and checkout remains disabled by design.
- Search Console was not accessible through an authenticated connector in this session.

## Recommendation

NOT READY FOR PRODUCTION until the branch is pushed, a Vercel Preview is created, and the responsive UI plus tracking events are validated in a real browser. The code, SEO regression, build, dependency audit and preview noindex behavior pass locally.

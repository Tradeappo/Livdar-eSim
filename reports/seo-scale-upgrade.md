# Livdar eSIM SEO scale upgrade

Branch: `codex-seo-scale-upgrade`  
Production status: untouched  
Programmatic generation: disabled

## Before and after

| Control | Before | After |
|---|---:|---:|
| Published indexable URLs | 91 | 91 |
| Canonicals | 91 | 91 |
| Hreflang clusters | 91 | 91 |
| Locales | EN, DE, RO | EN, DE, RO |
| Unit tests | 9 passing | 12 passing |
| Largest home HTML | 2,195,824 bytes | 833,488 bytes |
| Largest home RSC | 1,223,784 bytes | 411,818 bytes |
| Product/Offer schema | none | none |
| Automatic page publishing | disabled | disabled |

The V41 CSS and JavaScript were extracted byte-for-byte from the supplied source into versioned, cacheable static assets. This removes their duplication from HTML/RSC while keeping V41 markup, styling and runtime as the visual source of truth. Uncompressed home HTML decreased about 62%.

## Delivery map

1. Baseline captured in `reports/seo-baseline-before-scale.json`.
2. Rendering audited: the 91 editorial pages remain SSG; only the authenticated evaluator is dynamic.
3. Performance improved through versioned V41 CSS/runtime assets.
4. Canonical, robots, hreflang and x-default regression checks retained.
5. Sitemap families retained and given version-controlled lastmod values.
6. Structured data expanded to WebPage and Article entities and the visible home FAQ.
7. No fabricated Product, Offer, price or availability schema added.
8. Existing registry-based internal links retained across destinations, regions and guides.
9. Existing visible intros and FAQs remain the answer-first source; no generic filler was generated.
10. `/llms.txt` retained with commercial disclaimers.
11. `/llms-full.txt` added with the complete 91-URL inventory.
12. Programmatic taxonomy remains infrastructure-only and `generationEnabled: false`.
13. Eligibility now checks source attribution, four quality scores and lifecycle approval.
14. Lifecycle transitions are tested and cannot skip review.
15. An authenticated evaluation-only API was added for Make or another workflow.
16. The API has no create, registry, sitemap, GitHub or deployment write path.
17. DataForSEO credential and refresh contracts were defined without consuming new keyword research.
18. Ahrefs competitor validation used 126 units only; base research was not repeated.
19. Airalo, Holafly, Nomad, Saily, Maya and MobiMatter were compared in one batch.
20. Search Console thresholds and 7/28/90-day comparison windows were defined.
21. Refresh, consolidation and retirement rules were defined.
22. Backlink/digital PR priorities focus on citeable assets and relevant earned domains.
23. Automated scale audit asserts 91 URLs and disabled publishing.
24. Quality, similarity, orthography, schema drift, tests and production build pass locally.
25. Preview browser verification and URL will be recorded after the branch deployment completes.

## Known constraints and next decisions

- The home and shop pages still carry approximately 378 KB of exact V41 markup before compression. Reducing it further requires editing the supplied artifact structure, so it was not done without design approval.
- Supplier data remains a stub and checkout remains disabled. Real commercial schema must wait for current provider data and a working transaction path.
- GSC, DataForSEO and Make execution needs the environment secrets listed in `.env.example`; no credentials were invented or committed.
- New locale/page families remain blocked until evidence and human review pass every gate.

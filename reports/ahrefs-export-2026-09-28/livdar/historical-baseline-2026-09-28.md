# Livdar historical data in Ahrefs: empty, and that is the finding

Date: 2026-09-28. Queried at domain level, `mode=subdomains`, monthly grouping,
2025-09-01 to 2026-09-28.

| Endpoint | Rows returned |
| --- | --- |
| `site-explorer-metrics-history` (organic traffic and cost) | **0** |
| `site-explorer-keywords-history` (ranking keywords) | **0** |
| `site-explorer-pages-history` (pages with traffic) | **0** |
| `site-explorer-domain-rating-history` | **0** |

Not an error and not a query mistake: the same calls against absentify.com over the same
window return 25 monthly rows each. Ahrefs simply holds no organic history for livdar.com.

## Why this matters more than it looks

**Ahrefs will not show the Atlas launch, and it never will before the subscription expires.**
Their index needs a page to be ranking somewhere in the top 100 for a tracked keyword before
it appears in these reports. The Atlas went live in September 2026. Against the absentify
timeline of roughly three months from publish to first meaningful traffic, the earliest
Ahrefs could register anything is December 2026, which is two months after this subscription
ends on 8 October 2026.

Consequences for the handoff:

1. **Google Search Console is the only instrument that will see the Atlas launch.** Not a
   preference, a constraint. GSC reports impressions from position 1 to about 100 and reports
   them within days. Ahrefs reports estimated traffic, which requires rankings that do not
   exist yet.
2. **There is no Ahrefs "before" snapshot to compare against later.** Nothing to regress to.
   The baseline for the Atlas is the GSC import series in `data/atlas/gsc/`, and
   `scripts/atlas/atlas-monitor.mjs` is the thing that reads it.
3. **Do not read these zeroes as a problem with the site.** A four week old set of 500 pages
   with a Domain Rating in single digits and essentially no page-level backlinks is expected
   to be absent from a third party traffic estimator. absentify showed nothing in month one
   either: 405 pages in February 2026 returned 11,599 visits against 157 pages returning
   7,212 in January, which is noise, and the real move came in March.

## What Ahrefs does hold for livdar.com

Backlinks only, and they are not ours in any useful sense: 316 referring domains, of which
314 are classified A (PBN or spam network) and 2 B. See `../backlinks/`. The backlink graph
is the one place Livdar has an Ahrefs history, and it is a history of being spammed.

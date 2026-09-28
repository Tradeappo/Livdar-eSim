# Site Audit, Livdar, crawl of 2026-09-27T12:58:59Z

**Health score 43.** 874 URLs crawled: 500 with errors, 307 with warnings,
493 with notices.

This is the call that found the regression. Every other site in the account
scored 97 to 100 on the same days, so 43 was not a threshold being adjusted,
it was something broken.

## Errors

| Count | Category | Issue |
| --- | --- | --- |
| 473 | Sitemaps | 4XX page in sitemap |
| 473 | Internal pages | 4XX page |
| 473 | Internal pages | 404 page |
| 27 | Links | Page has links to broken page |
| 15 | Localization | Hreflang to redirect or broken page |
| 2 | Links | Orphan page (has no incoming internal links) |

The same 473 URLs counted three ways: they are 404s, they are 404s that the
sitemap advertises, and they are 404s that internal links point at. The 27
pages linking to broken pages and the 15 broken hreflang targets are the
same fault seen from the pages that survived.

Every other error type in the report is at zero, including the ones that
would matter most if this were a configuration problem rather than a
deployment one: hreflang annotation invalid 0, missing reciprocal hreflang
0, hreflang and HTML lang mismatch 0, HTML lang attribute invalid 0,
canonical points to 4XX 0, noindex page in sitemap 0, non-canonical page in
sitemap 0, sitemap syntax error 0, robots.txt not accessible 0, redirect
loop 0, 5XX 0.

So the international setup was correct throughout. The pages were simply not
there.

## Warnings and notices worth a look

| Count | Importance | Issue |
| --- | --- | --- |
| 267 | Warning | Open Graph tags incomplete |
| 40 | Warning | 3XX redirect |
| 22 | Warning | Meta description too long |
| 18 | Warning | Page has links to redirect |
| 6 | Warning | Meta description too short |
| 10 | Notice | X-default hreflang annotation missing |
| 8 | Notice | Page has only one dofollow incoming internal link |

None of these were changed. Three observations for later, in order of how
much they are worth:

- **267 incomplete Open Graph.** Worth fixing, cheap, and it is the largest
  single number in the report now that the 404s are gone.
- **10 missing x-default.** These are the eSIM era pages. The Atlas x-default
  was fixed earlier this week and the fix is verified; this notice is about
  the other surface.
- **28 meta descriptions outside the length Ahrefs prefers.** Cosmetic.

## Not re-crawled

The fix landed on production at 12:32 on the 28th. This report is the crawl
of the 27th and still describes the broken state. The next crawl should
return the health score to something near the rest of the portfolio, and the
473 errors should go to zero. Checking that is the first thing worth doing
after the crawl runs, and it is the check that confirms the fix from
Ahrefs' side rather than from ours.

`livdar-site-audit-issues-2026-09-27-crawl.json` is the full 179 issue rows
as returned.

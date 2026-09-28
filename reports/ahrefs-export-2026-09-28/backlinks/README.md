# Backlinks, 2026-09-28

The headline numbers look like an asset and are not one.

| Metric | Value |
| --- | --- |
| Live backlinks | 1,282 |
| All time backlinks | 1,608 |
| Live referring domains | 740 |
| All time referring domains | 918 |
| Domain Rating | 0.0 |
| Ahrefs Rank | null |

Referring domains since 2026-09-21: **740 to 741, so one new domain in the
week.** The growth happened earlier and is visible in
refdomains-history-2026-07-01-to-2026-09-28.json: 277 on 6 July, 416 by mid
August, then 337 on 7 September jumping to 647 on the 14th and 740 on the
21st. Four hundred domains appearing in a fortnight is not editorial
interest.

## What the domains are

Reading the top 40 by Domain Rating and the top 25 by traffic, ordered two
different ways to avoid reading one cluster twice:

- **0 traffic** on every single domain. Not low traffic. Zero.
- The names are what they are: `buybacklinks.agency`, `pbnseolinks.shop`,
  `ranklinkpro.shop`, `seoexpress-dr-90-group.store`,
  `exclusive-keyword-team-seoexpress.store`,
  `brilliant-edu-link-firm-outrank-hq.store`.
- Ahrefs flags most of them `is_spam: true`. Filtering to `is_spam: false`
  returns the same network under different hostnames, so the flag
  undercounts it rather than separating anything real.

So the profile is unsolicited backlink spam pointed at the domain, from
traffic-free sources. Domain Rating 0.0 alongside 740 referring domains is
consistent with that, not in tension with it.

## Correction, later the same day: a large part of it is dofollow

The first version of this file said the links were nofollow and that
disavowing was not indicated. **The first half of that was wrong**, and it was
wrong because reading referring domains ordered by Domain Rating and by
traffic happened to sample the nofollow clusters. Reading the anchors report
and then the backlinks filtered to `is_dofollow` shows something different.

`site-explorer-anchors`, ordered by referring domains:

| Anchor | Refdomains | Links | Dofollow | First seen |
| --- | --- | --- | --- | --- |
| Honestly, before finding SEOExpress.org, I felt lost with livdar.com's SEO strategy ... | 308 | 362 | 0 | 2026-04-17 |
| **Premium Backlink Services livdar.com for Stronger Google Rankings** | **258** | **516** | **516** | **2026-09-17** |
| **High Quality Dofollow Backlinks DA 50 PA 40 Premium PBN Network Service livdar.com ...** | **46** | **96** | **96** | **2026-08-04** |
| Rank livdar.com higher with premium guest posts, contextual backlinks ... | 44 | 92 | 0 | 2026-06-18 |
| **Trusted Tiered Link Building for livdar.com to Increase Trust Flow ...** | **12** | **24** | **24** | **2026-09-12** |

So at least **636 dofollow links from roughly 300 domains**, with commercial
money anchors naming livdar.com, and the largest cluster arrived on a single
day.

Reading those dofollow sources directly, ordered by source traffic, the top 40
are all one operation: `freedrchecker.site`, `backlinkscheckers.website`,
`drurchecker.site`, `freedadrchecker.space`, `dacheckerforfree.online`,
`dapacheckerpro.store` and thirty more like them, **every one of them serving
the identical path** `/dir/premium-backlink-services-123314`, every one
`is_spam: true`, every one Domain Rating 0.0 to 3.1, every one traffic 0 to
46, and every first_seen between 2026-09-17T18:56 and 2026-09-18T18:42.

That is a single PBN blast of throwaway domains inside about 24 hours.

## What follows from it

Two things change and one does not.

**Still true:** the sources have no traffic and no authority, and Google's spam
systems are built to discount exactly this pattern. It is very unlikely to be
hurting anything, and Livdar ranks for nothing today for reasons that have
nothing to do with links.

**Changed:** there is now a clear enough reason to disavow, which there was not
when the links looked nofollow. Dofollow, commercial anchors that name the
domain, roughly 300 throwaway hosts, deployed in a day: that is the shape of
either a link seller building a footprint or somebody pointing it at Livdar
deliberately. Disavowing the cluster is cheap, reversible and removes a
variable before the Atlas starts ranking. The pattern is trivial to express,
because the whole largest cluster shares one URL path.

It is still not urgent, and it is not a code change. It needs Search Console,
which this session cannot reach.

**Unchanged and worth repeating:** **740 referring domains must not be reported
as progress**, and link acquisition is untouched as a problem, because Livdar
has no earned links at all. The same signature is on three of the other five
sites, and the one site in the portfolio with real rankings has two referring
domains. See ../other-sites/README.md.

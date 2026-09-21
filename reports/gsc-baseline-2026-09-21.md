# Search Console baseline, 2026-09-21

Property: `sc-domain:livdar.com`. Read in the Search Console UI, no API
credentials used. Index data last updated 18.09.2026, performance data about
5.5 hours before reading.

## Sitemap

`https://livdar.com/sitemap.xml`, sitemap index, submitted 16.09.2026, last
read 20.09.2026, status Success, 91 pages discovered. Matches the 91 published
URLs.

## Indexing (Pages report)

| Status | Pages |
| --- | --- |
| Indexed | 30 |
| Not indexed, total | 64 |
| Discovered, currently not indexed | 58 (first detected 19.09.2026) |
| Crawled, currently not indexed | 4 |
| Page with redirect | 1 (`www.livdar.com/`, expected: www redirects to the apex) |
| Duplicate without user-selected canonical | 1 (`www.livdar.com/`, last crawled 06.09.2026, before the domain move) |

Crawled, not indexed: `/en/esim/`, `/en/regions/europe/`,
`/de/regionen/europe/`, `/de/regionen/middle-east/`.

Discovered, not indexed includes 6 of 8 EN destination pages (United Kingdom
and United States are in neither not-indexed list), 7 of 8 DE (United Kingdom
is the exception), 7 of 8 RO (Turkey is the exception), the DE and RO eSIM
hubs, all three guides hubs and most regional pages. `/en/esim/united-kingdom/`
and `/ro/esim/turcia/` were confirmed in the indexed list.

"Crawlable" and "indexed" are different states. All 91 URLs return 200, are
`index, follow`, canonical to themselves and are in the sitemap; only 30 are
indexed.

## Performance

28 days and 90 days give the same totals, because all impressions fall on
18 and 19 September 2026.

| Window | Clicks | Impressions | CTR | Avg. position |
| --- | --- | --- | --- | --- |
| 28 days | 0 | 4 | 0% | 16 |
| 90 days | 0 | 4 | 0% | 16 |

Pages with impressions: `/` (position 1), `/de/regionen/south-america/` (7),
`/de/ratgeber/how-esim-works/` (11), `/ro/ghiduri/airport-connectivity/` (45).
Only one query is shown (the rest are anonymised): "internet in avion", RO,
position 45. Countries: Singapore, United States, Greece, Romania, one
impression each.

## Reading against the existing research

The research in `data/` (cluster-priority.json) puts country pages first
(destination cluster, 63% of the weighted score), then regional pages. Search
Console shows that most of the destination cluster is not indexed yet, so no
query-level comparison is possible: 4 impressions carry no ranking signal. The
first bottleneck is indexing, not titles or CTR.

## What changed in response

See the pull request that adds `lib/internal-links.js`:

- guides link to every published destination and to the other guides;
- destinations link to every published guide, to the other published
  destinations and to their region page;
- the eSIM hub, reported as crawled but not indexed and 53 to 60% identical to
  the home page by 5-word shingles, now groups destinations by region and
  describes each one with its own meta description;
- the regions hub tiles carry each region page's own meta description;
- sitemap `lastmod` for core pages, destinations and guides moves to 2026-09-21.

Re-read this report on or after 2026-10-05 and compare the indexed count.

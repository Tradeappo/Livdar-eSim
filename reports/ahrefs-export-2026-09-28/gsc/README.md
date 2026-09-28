# Search Console and Bing, 2026-09-28: not readable from here

This is the part of the brief that could not be done, stated precisely rather
than skipped or filled in with zeros.

## What was checked

| Credential | State |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | not set |
| `GSC_CLIENT_EMAIL` / `GSC_PRIVATE_KEY` | not set |
| `BING_API_KEY` | not set |
| `INDEXNOW_KEY` | not set on the Vercel project, so https://livdar.com/indexnow-key.txt answers 404 |
| Ahrefs to Search Console connection | none on the Livdar project |
| Authenticated browser session | none. Search Console, Tag Manager, Analytics and Clarity all return sign-in forms at URLs that render only for a signed-in account |

Environment variable names were read; no value was printed, logged or
committed anywhere.

The Ahrefs MCP server does expose `gsc-*` tools, and they would answer every
question in sections 5 and 6 of the brief. They read through the Search
Console connection on an Ahrefs project, and the Livdar project does not have
one. That connection is made in the Ahrefs interface by a signed-in account,
so it cannot be made from here either.

## What that means for the report

Everything in sections 5, 6, 9 and 10 of the brief is unanswerable from this
container:

- sitemap status in Search Console, Pages and Indexing counts,
  Crawled-not-indexed, Discovered-not-indexed, Indexed, duplicate and
  canonical issues, hreflang anomalies, manual actions, security issues
- URL inspection on the representative sample
- 7 day and 28 day performance, impressions, clicks, average position,
  queries, countries, and any of it split by cohort
- Bing Webmaster Tools sitemap state, indexed pages, crawl issues,
  IndexNow reception

These are reported as **unknown**, not as zero. The difference matters this
week in particular: 497 URLs were returning 404 to Google for three days, so
the indexing numbers would have been bad for a reason that is now fixed, and
reading them today would measure the outage rather than the pages.

## What the code does instead

The importers exist and they refuse loudly rather than returning zeros:

- `scripts/gsc-check.mjs` answers `configured`, `authorised` and `granted`
  separately, and prints the service account email, which is an identifier,
  never the key.
- `scripts/atlas/gsc-import.mjs` and `scripts/atlas/ga4-import.mjs` name the
  exact missing credential and exit non zero.
- `.github/workflows/atlas-search-console.yml` runs the preflight first,
  skips the import when nothing is configured, and **fails the job** when
  credentials exist and do not work.

So the moment a credential is added, the data starts arriving and nothing
needs rewriting. Until then no number is invented.

## What is needed

See `reports/USER-ACTIONS-REQUIRED.md`. Two items, both a few minutes:
a Search Console service account with read access to `sc-domain:livdar.com`,
and the `INDEXNOW_KEY` environment variable.

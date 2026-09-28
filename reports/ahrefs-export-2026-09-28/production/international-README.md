# International, eleven markets, 2026-09-28

Measured against production after the fix, with
`scripts/atlas/international-check.mjs`. Full data in
`international-2026-09-28.json`.

## Technical alignment

| Market | Locale | Pages | Clean | html lang | canonical | hreflang | noindex | not in sitemap | non 200 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| United States | en | 100 | 100 | 0 | 0 | 0 | 0 | 0 | 0 |
| United Kingdom | en | 100 | 100 | 0 | 0 | 0 | 0 | 0 | 0 |
| Germany | de | 72 | 72 | 0 | 0 | 0 | 0 | 0 | 0 |
| France | fr | 63 | 63 | 0 | 0 | 0 | 0 | 0 | 0 |
| Spain | es | 64 | 64 | 0 | 0 | 0 | 0 | 0 | 0 |
| Italy | it | 52 | 52 | 0 | 0 | 0 | 0 | 0 | 0 |
| Netherlands | nl | 27 | 27 | 0 | 0 | 0 | 0 | 0 | 0 |
| Poland | pl | 42 | 42 | 0 | 0 | 0 | 0 | 0 | 0 |
| Brazil | pt | 40 | 40 | 0 | 0 | 0 | 0 | 0 | 0 |
| Japan | ja | 40 | 40 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Taiwan** | **none** | **0** | - | - | - | - | - | - | - |

US and GB both read 100 because they share the `en` locale. The 100 English
pages are counted under both, not twice in the total. The total is 500.

Site level:

- `robots.txt` HTTP 200, `Disallow: /api/` and nothing else, sitemap declared.
- Sitemap index HTTP 200, 74 children.
- Trailing slash: 10 of 10 markets redirect the bare form to the slashed form
  with a 308. This is the behaviour that made the outage look like a routing
  bug when it was not.
- x-default: 10 of 10 markets agree between what the model declares and what
  the page carries. The mismatch found earlier this week is fixed and stays
  fixed.

Zero hreflang issues, zero canonical issues, zero wrong-locale redirects,
zero noindex regressions, across all 500 pages in all ten published locales.
Ahrefs Site Audit agrees from its own crawl: hreflang annotation invalid 0,
missing reciprocal hreflang 0, hreflang and HTML lang mismatch 0, HTML lang
attribute invalid 0, page referenced for more than one language 0.

## Taiwan is the one real gap

Taiwan has **15 keywords in the Rank Tracker**, in `zh`, including
`esim 日本` at 32,000 and `esim 設定` at 18,000 monthly searches, and the
Atlas publishes **no `zh` locale at all**. A reader in Taiwan has nothing to
be served.

This is recorded rather than fixed. Adding a locale is a cohort decision, not
a regression, and the brief is explicit that the cohort mix is not to be
changed on assumptions. It is in the candidate inventory
(`../../atlas-cohort-candidates-2026-09-28.md`) with the demand figures
attached, which is where a decision about it belongs.

## What this does not measure

Impressions, clicks and the URL Google actually serves per language. Those
come from Search Console, and Search Console is not readable from here. See
`../gsc/README.md` for exactly what is missing and what it would take.

Ahrefs contributes nothing to the per-market picture either, because Livdar
holds one position in its index for its own brand name. Positions,
impressions and estimated traffic per market are all zero or absent for the
same single reason, and that reason was the 404s, not the markets.

# Livdar Atlas inside livdar-esim

Livdar Atlas ("Livdar mare") is the data driven part of livdar.com: weather by
month, city essentials and airports, in en, de and ro. It lives in this project,
next to the eSIM pages, and shares the domain, the header, the footer, the
sitemap index and the indexing switch. The 115 eSIM URLs are untouched.

## Routes

| Locale | Cities | Airports |
| --- | --- | --- |
| en | /en/cities/ | /en/airports/ |
| de | /de/staedte/ | /de/flughaefen/ |
| ro | /ro/orase/ | /ro/aeroporturi/ |

Six static route folders under `app/[lang]/`. A static segment wins over the
eSIM catch-all `app/[lang]/[...slug]`, and none of the six names is an eSIM
segment in any locale (tests/atlas.test.mjs). A segment in the wrong locale
(`/de/cities/...`) is a 404.

## Serving at scale

- Only pages in state `published` exist in production; anything else is a 404.
- Previews also render `approved` pages, always noindex, so a lot is reviewed on the preview before it is published.
- `generateStaticParams` returns published pages only, capped at 2,000 per segment. Everything else renders on first request (`dynamicParams = true`) and is cached for a day (`revalidate = 86400`). A build never generates the whole taxonomy.
- Data is read through `lib/atlas/data.js` only; when the snapshot outgrows a function bundle it becomes sharded dynamic imports or a KV lookup without touching the pages.

## Stages

possible → data_ready → demand_validated → qa_passed → approved → published.
`npm run atlas:funnel` counts each stage with the reasons pages stop. "Live" is
claimed only after `npm run atlas:monitor` has fetched the page on livdar.com.

## Design handover

`lib/atlas/model.js` builds a page model (content, URL, canonical, hreflang,
links, FAQ, sources). `components/atlas/AtlasPage.jsx` and `app/atlas.css` are
the only presentation. The new design replaces those two files; models, URLs,
canonical, internal links and schema stay the same. Slugs are pinned in
`data/atlas/slugs.json` and never recomputed.

## Commands

    npm run atlas:funnel
    npm run atlas:qa
    npm run atlas:registry -- approve-lot lot-001
    npm run atlas:registry -- publish-lot lot-001
    npm run atlas:registry -- retire <pageKey>      rollback of one page
    npm run atlas:ingest                             GeoNames, OurAirports, Wikidata (network)
    npm run atlas:climate -- --lot lot-001           NASA POWER for one lot (network)
    npm run atlas:monitor                            production check (network)

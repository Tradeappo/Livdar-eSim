# Analytics verified, calls to action shipped, three things that were never connected

2026-09-25. Everything marked verified here was read from the production origin
or from a Google-served file with a headless browser, not from this repository.
Where something is not connected, the exact missing credential is named.

## 1. Google Tag Manager

| Question | Answer |
| --- | --- |
| Connected | **YES** |
| Container ID present in Production | **YES**, `GTM-WKGXHXWC` |
| Container loads on livdar.com | **YES**, `googletagmanager.com/gtm.js?id=GTM-WKGXHXWC`, HTTP 200 |
| Duplicate container | **NO**, one entry in `window.google_tag_manager` |
| Second direct GA4 snippet | **NO**, no `gtag/js` and no `google-analytics.com` script in the served HTML |
| dataLayer exists | **YES** |
| Consent Mode v2 defaults before the container | **YES** |
| Production fire verified | **YES**, in a browser, on an Atlas page and an eSIM page |

Consent gating, read from Google's own internal state rather than from the
dataLayer, because that distinction hid an earlier bug on this site:

| | before consent | after Accept all |
| --- | --- | --- |
| `analytics_storage` | denied | granted |
| `ad_storage` | denied | granted |
| `ad_user_data` | denied | granted |
| `ad_personalization` | denied | granted |
| `functionality_storage` | granted | granted |
| `security_storage` | granted | granted |

Before consent, GA4 receives a cookieless ping with `gcs=G100`. That is the
Consent Mode v2 design and not a leak: no identifier is stored. After Accept all,
hits carry `gcs=G111`.

## 2. Google Analytics 4

| Question | Answer |
| --- | --- |
| Connected | **YES** |
| Measurement ID | **`G-DY02HH34DT`** |
| Configured inside GTM, not as a page snippet | **YES** |
| `page_view` fires | **YES**, verified on `/en/cost-of-living/colombia/` and `/en/esim/spain/` |
| Atlas pages appear with their real URLs | **YES**, `dl` carries the full path, `dt` the title |
| A call to action event reaches GA4 | **YES**, `check_availability` with `cta_label` and `cta_position` observed arriving |
| Custom dimensions for the Atlas configured | **NO**. See below. |

The container was read from the published `gtm.js`, which is the file every
visitor receives. It holds two tags:

| Tag | Fires on | Sends |
| --- | --- | --- |
| Google tag | every page | `send_page_view: true`, `language`, `market` |
| GA4 event | `{{Event}}` matching ten named events | `language`, `market`, `destination`, `region`, `content_cluster`, `plan_type`, `cta_label`, `cta_position`, `search_term`, `from_language`, `to_language` |

So the container is correct for the eSIM site and blind to the Atlas. Two
consequences, both measured rather than assumed:

- **Five Atlas event names are not in its trigger**: `tool_view`, `tool_start`,
  `tool_complete`, `internal_cta_click`, `outbound_click`. `cta_click` and
  `language_change` are, which is why the call to action funnel works today and
  the tool funnel will not until the trigger is extended.
- **Nine dimensions are not in its parameter table**: `cohort`, `surface`,
  `family`, `entity`, `page_path`, `page_language`, `cta_type`,
  `cta_destination`, `cta_kind`. An Atlas `page_view` observed on production
  arrived with **no custom parameters at all**, because the container asks for
  `language` and `market` and the pages did not push them.

The site now pushes all of them. `docs/gtm-changes-needed.md` holds the exact
regex to replace and the nine rows to add. This repository can push a dataLayer
event; it cannot publish a container version.

One naming decision is worth reading. GA4 collects `language` automatically and
silently drops a custom event parameter of that name. Measured: the eSIM pages
push `language` and `market` with the same value, and the hit carries `ep.market`
and no `ep.language`. So the page's own language travels as `page_language`, with
`language` pushed alongside for the container's existing mapping.

## 3. Google Search Console

| Question | Answer |
| --- | --- |
| Property exists and is verified | **YES**, `sc-domain:livdar.com`, read in the UI on 2026-09-21 |
| API connected | **NO** |
| `GSC_PROPERTY` configured | **NO** |
| `GSC_CLIENT_EMAIL` configured | **NO** |
| `GSC_PRIVATE_KEY` configured | **NO** |
| Service account has access to the property | **CANNOT BE TESTED** until the above exist |
| Import works | **NO** |
| Latest successful import | **NONE. There has never been one.** |

The scheduled workflow ran once, at 10:24:24Z today, and GitHub records it as a
**success**. What it actually did:

```
GSC_CLIENT_EMAIL:
GSC_PRIVATE_KEY:
GSC_PROPERTY:
Error: GSC_PROPERTY is required, for example sc-domain:livdar.com.
Search Console credentials are not configured; skipping the import.
```

Three blank lines, because GitHub prints a secret that is set as `***`. The step
ran for 0.03 seconds and was written as `node scripts/gsc-report.mjs || echo ...`,
so the failure could not reach the conclusion. A step that cannot fail cannot
tell you whether the import works.

A second defect would have survived adding the secrets: `scripts/gsc-report.mjs`
read `GOOGLE_SERVICE_ACCOUNT_JSON` while the workflow passed `GSC_CLIENT_EMAIL`
and `GSC_PRIVATE_KEY`. Two things built against two different assumptions, and
the swallow meant neither ever met the other.

Fixed in this branch:

- The library reads either credential shape and unescapes a key whose newlines
  arrive escaped, which they usually do.
- `scripts/gsc-check.mjs` answers **configured**, **authorised** and **granted**
  separately, because the remedies are three different places: a GitHub secret,
  a Google Cloud key, and a user in Search Console. A valid service account with
  no access to the property used to be indistinguishable from every other
  failure; it now reports the 403 and names the account to add.
- The workflow runs the preflight first, skips the import when nothing is
  configured, and **fails the job when credentials exist and do not work**.
- `scripts/atlas/gsc-import.mjs` is the import that did not exist.
  `lib/atlas/gsc-cohort.js` has held the metrics and the six dimensions since
  before the launch with no caller outside the tests, which is why every cohort
  read null for indexation and the gate correctly refused a verdict.

### What is needed, exactly

Three **GitHub repository secrets** on `Tradeappo/Livdar-eSim` (not Vercel: the
import runs in Actions, not in the app):

| Secret | Value |
| --- | --- |
| `GSC_PROPERTY` | `sc-domain:livdar.com` |
| `GSC_CLIENT_EMAIL` | the service account's email, ending `.iam.gserviceaccount.com` |
| `GSC_PRIVATE_KEY` | that account's private key, PEM |

Then, in Search Console, add the address in `GSC_CLIENT_EMAIL` as a user of
`sc-domain:livdar.com`. Then `node scripts/gsc-check.mjs` reports
`"why": "connected"` and the nightly workflow imports.

### What the import will populate, and what it will not

`published`, `impressions`, `clicks`, `ctr` and `position` per page, carrying
cohort, surface, family, language, market, destination and entity, so a report
can be cut by any of them without parsing a URL.

`discovered` and `indexed` stay unknown, and that is deliberate. The Search
Analytics API reports impressions, not index state: a page can be indexed and
never shown, and inferring indexation from an impression is exactly the
optimism the unknown convention exists to stop. The Pages report is a separate
import and is not wired.

## 4. Microsoft Clarity

| Question | Answer |
| --- | --- |
| Connected | **NO** |
| `NEXT_PUBLIC_CLARITY_ID` exists in Vercel Production | **YES**, and its value is **empty** |
| Script loads | **NO** |

Verified twice in a browser: no request to `clarity.ms` in the network log, and
`window.clarity` undefined after load. The loader is already in
`app/[lang]/layout.jsx` and is gated on the value being non-empty, so setting
that variable in the Vercel project and redeploying is the whole fix. No code
change.

## 5. Calls to action

| Question | Answer |
| --- | --- |
| Pages with a call to action | **500 of 500** |
| Pages with a second step | **500 of 500** |
| Positions per page | **2**, after the key facts and before the related pages |
| Broken links | **0** |
| Localisation failures | **0** |
| Pages promising something Livdar cannot do | **0** |

Types by surface, counted from the built page models:

| Surface | Pages | Primary call to action, by kind |
| --- | --- | --- |
| areas | 40 | sibling 35, sport 5 |
| climate | 24 | esim 12, sibling 6, cost 5, ranking 1 |
| move | 193 | sibling 127, salary 45, season 10, holidays 7, esim 4 |
| pulse | 55 | holidays 27, cost 16, sibling 11, season 1 |
| sport | 29 | sibling 17, areas 12 |
| stay | 5 | cost 4, salary 1 |
| tools | 96 | tool 63, sibling 24, ranking 9 |
| work | 58 | cost 45, sibling 12, rent 1 |

Distinct first steps per language, which is the number that says whether these
are contextual or decorative:

| Language | Pages | Distinct primary labels |
| --- | --- | --- |
| en | 100 | 83 |
| de | 72 | 51 |
| es | 64 | 37 |
| fr | 63 | 51 |
| it | 52 | 40 |
| pl | 42 | 35 |
| ja | 40 | 36 |
| pt | 40 | 36 |
| nl | 27 | 23 |

The worst repeat across all five hundred is **14**, and it is the Spanish
regions whose calendars all point at Spain's national one, which is the right
answer for every one of them.

### Two decisions worth stating

**The label is the target page's own heading.** The first version wrote a
sentence per kind per language and interpolated the place name into it, and five
of the nine languages need a case the nominative does not give: `Ce que coute la
vie France`, `Quanto costa vivere Italia`, `Ile kosztuje zycie Polska`. Building
a locative table for five languages and 160 countries, to write a label the
target page already carries correctly inflected, would have been a second place
for the same nine languages to drift apart. What is written per kind per language
is the supporting line, which never names a place and so has no morphology to get
wrong.

**The first step is the one that differs, not the one that converts.** Putting
the relevant calculator first is the obvious product answer and it gave 158
English cost of living pages the identical button. So the first step is the same
country asking a different question, and the tool is the second. `sibling` ends
most chains because it always resolves, always differs, and `the same question
for Thailand` is a real next step; without it, Japanese, where four tool pages
serve forty data pages, put one button on twenty six of them.

### Nothing promises what does not exist

No `book`, because there is no inventory. No `apply`, because there are no
vacancies. No `buy`, because activation is not available yet. A test fails if a
kind by any of those names appears. The eSIM call to action says **check**, which
is what the page it leads to does, and it appears only where that destination is
published in that exact locale: 19 countries in English, 16 in German, none in
the other seven, checked against the publication registry rather than the
destination table.

## 6. Tools

| Question | Answer |
| --- | --- |
| Tool pages | 71 |
| Pages carrying a real interactive tool | **62** |
| Distinct tools made interactive | **10** |
| Tool pages that stay a description | **9**, two tools, each with a stated reason |
| Tool tracking | **YES**, `tool_view`, `tool_start`, `tool_complete` |

Interactive: `cost-of-living-calculator`, `cost-of-living-comparison`,
`country-comparison`, `destination-matcher`, `moving-cost`, `rent-affordability`,
`salary-calculator`, `travel-budget`, `where-should-i-live`,
`where-should-i-stay`. Six modes: `ratio` 16 pages, `filter` 16, `earn` 9,
`move` 8, `stay` 8, `share` 5.

Not interactive, and why:

- **city-comparison** declares two cities as its inputs and the only price data
  that exists is national. A working picker of countries under a heading that
  says cities would be worse than no picker.
- **relocation-budget** composes three other tools and needs a city level rent
  that is not published.

The scale a tool runs on is the one the reader's own country is on. The first
version picked the broader 160-country ratio series for the English and Japanese
markets, on the argument that more countries is better, and that series contains
neither the United States nor Japan: the comparison tool on every American page
opened on Afghanistan against Algeria.

`tool_view` fires when the tool is on screen rather than when the page loads,
because a tool below the fold that nobody scrolled to has not been viewed.
`tool_complete` fired on mount in the first version, before `tool_start`, because
every mode has a valid default state; the completion rate would have read as one.
No event carries what the reader typed: an income travels as a band.

## 7. Entity audit

| Question | Answer |
| --- | --- |
| Pages audited | **500** |
| Pages with a destination entity to check | 404 (a calculator and a ranking have none) |
| Mismatches found | **2** |
| Mismatches fixed | **2** |
| Mismatches remaining | **0** |

`/en/cost-of-living/colombia/` was live with the H1 **Cost of living in
Colorado** above a body about Colombia. It was built for `cost of living in
colorado`, 2,600 a month, because the resolver's stem rule asked for 55 per cent
of the country name and `colo` is four of the eight letters of `colombia`. The
same arithmetic reached `Niederlande` from the `nieder` of `niedersachsen`, so
`feiertage niedersachsen 2026` at 47,000 a month paid for a page about the
Netherlands as well as the correct page about Lower Saxony.

No existing check could see either one. A page is derived from its entity, so the
slug, the title, the H1 and the body all agreed with each other and with the
wrong place, and every uniqueness, length, schema and link check passed.

Four changes: the stem rule now forgives an ending and nothing else; the seven
demonyms it was actually being used for are listed as aliases where the evidence
is a measured keyword; `indiana` joins the per market blocklist because `india`
is a prefix of it and spelling cannot refuse that; and a heading can no longer
take a place name from a keyword that does not name its entity.

Both URLs stay. A misattributed keyword is a measurement error and the repair is
not to unpublish a page whose body was right all along, so
`data/atlas/corrections/keyword-entity-2026-09-25.json` records what was
withdrawn. The cohort no longer claims 49,600 searches a month, 47,000 of which
was being counted twice.

## 8. Production

| Question | Answer |
| --- | --- |
| Final HEAD on main | `dfa1676` |
| Deploy | **READY**, `dpl_FB9qLnkmFu3gqHBxRpVG6iQZjR3y` |
| Node in the production runtime | **v24.20.0**, read from the function itself |
| URLs changed | **0** |
| Atlas URLs in the sitemaps | **500**, none missing, none extra |
| Canonical, hreflang, schema, sources, internal links | unchanged; the call to action work is additive |

### All 500 URLs, one request each

This is the cheap sweep and it covers everything. No browser, so it is what a
crawler receives.

| Check | Result |
| --- | --- |
| HTTP 200 | **500 of 500** |
| Two call to action blocks in the served HTML | **500 of 500** |
| Four call to action links | **500 of 500** |
| `index, follow` | **500 of 500** |
| Canonical points at itself | **500 of 500** |

24 of the 500 returned no response on the first pass, run six at a time through
this container's egress proxy. Re-run one at a time, 23 answered 200 immediately
and the twenty fourth answered 200 on each of three further attempts. The first
pass measured this container's concurrency, not the origin.

### 65 pages in a real browser

One page per surface, family, language and interactive tool mode. Consent
accepted through the banner, then the bottom call to action clicked and the
dataLayer read back through `sessionStorage`, because the navigation destroys the
array.

| Check | Result |
| --- | --- |
| Rendered | 59 of 65 |
| HTTP 200 | 59 of 59 |
| Two call to action pairs | **59 of 59** |
| Canonical points at itself | **59 of 59** |
| `index, follow` | **59 of 59** |
| hreflang includes itself | **59 of 59** |
| At least three internal links | **59 of 59** |
| Schema present | **59 of 59** |
| GTM and GA4 both loaded | 53 of 59 |
| Consent granted after Accept | 53 of 59 |
| `cta_click` reached the dataLayer | 53 of 59 |
| `cta_click` carried all twelve dimensions | **53 of 53** |
| `cta_click` observed on the network reaching GA4 | 41 of 59 |
| Interactive tool rendered with working inputs | 14 of 14 |

Languages: en 11, fr 8, es 7, it 7, nl 7, de 6, pt 6, ja 4, pl 3.
Surfaces: tools 15, pulse 9, areas 8, work 7, move 6, sport 6, stay 5, climate 3.

### The six that did not render, and why they are not a defect

Six of the sixty five browser sessions ended with a blank document: three on an
HTTP 502 and three on a `ChunkLoadError` for a static asset.

Every one of the six was re-opened afterwards in a single browser session and
rendered perfectly: two call to action pairs, both containers, consent flipping
on Accept, `internal_cta_click` and `cta_click` pushed, and `cta_click` observed
arriving at GA4 with `gcs=G111`. The chunks the errors named answered 200 with
the same byte count on retest. `/en/cost-of-living/japan/`, which 502ed twice,
answered 200 on twenty consecutive requests afterwards.

What it probably is: this container's egress under concurrency. A browser opens
around forty parallel connections per page and the sweep ran sixty five of them
back to back; curl, which opens one, got 200 on all 500 URLs. What rules out the
origin: **Vercel logs no runtime error and no error level log for this production
deployment over the last day**, and a 502 generated by Vercel would appear there.

The honest limit: this cannot be proven from inside the container. It is recorded
in `data/atlas/launches/production-verification-2026-09-25.json` rather than
dismissed, and the thing to watch is whether real readers see it. Search
Console's crawl stats would show it, which is one more reason the three secrets
matter.

## 9. Pre-flight

| Check | Result |
| --- | --- |
| `npm test` | 320 pass, 0 fail, up from 309 |
| `npm run dashcheck` | 1,546 files, 0 en dash, 0 em dash, 0 dash variants |
| `npm run qa` | passed |
| Cohort 001 QA | pass, including `cta present` and `cta resolves` |
| Cohort 002 QA | pass |
| `next build` | 698 static pages |
| Route integration tests | pass |
| Entity audit | 0 reported |
| Preview | verified in a browser: Italian page, HTTP 200, two call to action pairs, Italian labels and notes, GTM and GA4 loaded, 8 internal links, no console errors, `noindex` as Preview should be |

## 10. What is still not connected, and who has to do it

1. **Search Console**: three GitHub repository secrets, then add the service
   account as a user of the property. Nothing else is missing; the code path is
   fixed and tested against a stand-in for Google.
2. **Clarity**: set `NEXT_PUBLIC_CLARITY_ID` in the Vercel project and redeploy.
3. **The GTM container**: five event names in the GA4 event tag's trigger and
   nine parameters in its table, then the matching custom dimensions in GA4.
   `docs/gtm-changes-needed.md` has the exact values. Until then the Atlas events
   reach the dataLayer, which is verified, and stop at the container.

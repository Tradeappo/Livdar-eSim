# What has to be measured before the 500 page test means anything

The experiment is two lots of 250 pages across eight surfaces and nine
languages, and the question it exists to answer is not whether they rank. It is
whether a data page can move somebody one step further into Livdar, and whether
that is true of some surfaces and false of others.

This is the measurement plan, and it is written as three groups because they come
from three different places and two of those places are not connected yet. Each
row says where the number comes from and what it is today.

## 1. Search, per surface

Source: Search Console. `scripts/atlas/gsc-import.mjs`, nightly, into
`data/atlas/gsc/`. **Not running:** the three secrets are missing, see
`scripts/gsc-check.mjs`.

| Measure | Where it comes from | Built |
| --- | --- | --- |
| Pages published | the registry | yes |
| Impressions per page | Search Analytics, page level | yes |
| Clicks per page | the same query | yes |
| CTR | the same query | yes |
| Average position | the same query, impression weighted | yes |
| Pages in the top 10, 20, 100 | `positions()` in `lib/atlas/gsc-cohort.js` | yes |
| Pages shown to nobody | a published page the query covered and did not return | yes |
| Indexed rate | **the Pages report, which is a different API and is not wired** | no |

The last row is the one to be careful about. Search Analytics reports
impressions, not index state: a page can be indexed and never shown. Inferring
indexation from an impression would make an unmeasured cohort read as a healthy
one, which is the whole reason `lib/atlas/gsc-cohort.js` treats an absent number
as unknown rather than as zero. Until the Pages report is imported, indexation
stays unknown and the cohort gate correctly refuses a verdict.

Cut by: cohort, surface, family, language, market, destination. Every row carries
all six, so no report has to parse a URL to discover that `zonas` is the Spanish
Areas segment.

## 2. Behaviour, per surface

Source: GA4. **Not available as data yet, for two reasons that are different.**

The events now reach the dataLayer, which is verified in a browser on
production. Five of them do not reach GA4, because the container's GA4 event tag
fires on a regular expression of ten event names and these are not among them:
`tool_view`, `tool_start`, `tool_complete`, `internal_cta_click`,
`outbound_click`. `docs/gtm-changes-needed.md` has the exact change. And once
they arrive, reading them back out needs the GA4 Data API, which has no
credentials in this project; today the numbers are read in the GA4 interface.

| Measure | Definition | Event it comes from |
| --- | --- | --- |
| Sessions | GA4 default | `page_view` |
| Engaged sessions, engagement rate | GA4 default | automatic |
| Average engagement time | GA4 default | `user_engagement` |
| Call to action click rate | `cta_click` sessions over sessions | `cta_click` |
| By position | which of the two placements earns the click | `cta_position` |
| By kind | which chain rule earns the click | `cta_kind` |
| Tool view rate | `tool_view` over sessions on tool pages | `tool_view` |
| Tool start rate | `tool_start` over `tool_view` | `tool_start` |
| Tool completion rate | `tool_complete` over `tool_start` | `tool_complete` |
| Downstream page rate | `internal_cta_click` sessions over sessions | `internal_cta_click` |
| Outbound rate | `outbound_click` over sessions | `outbound_click` |

Two definitions are deliberate rather than conventional.

**Tool start rate is over views, not over sessions.** A tool below the fold that
nobody scrolled to has not been offered, and dividing by sessions would make a
placement problem look like an interest problem. `tool_view` fires on
intersection for exactly this reason.

**Tool completion rate is over starts.** In the first version `tool_complete`
fired on mount, because every mode has a valid default state, and the completion
rate read as one on every page load. It is now gated on a real first input.

Nothing in this group carries what a reader typed. An income travels as a band,
a distance as a band, a country as its ISO code. There is no free text and no
personal data in any event.

## 3. Commercial intent

Source: GA4, the same events the eSIM side already uses. These arrive today,
because they are in the container's trigger.

| Measure | Event | Key event |
| --- | --- | --- |
| Signup intent | `notify_signup` | yes |
| Plan selected | `select_plan` | yes |
| Checkout started | `begin_checkout` | yes |
| Checkout intent, where activation is not available | `checkout_intent` | yes |
| A finished calculation | `tool_complete` | yes |
| Availability checked | `check_availability` | no |
| Outbound partner intent | `outbound_click` | no |

`lib/analytics.js` holds `KEY_EVENTS` and `ORDINARY_EVENTS` as two explicit
lists, and a test fails if a click event appears in the first one. The gap
between `begin_checkout` and `checkout_intent` is the clearest number this site
can produce while no supplier is connected: it is the point at which a real shop
would have taken money.

## What a verdict needs

A surface passes the test when it earns impressions, converts some of them into
clicks, and moves some of those readers one step further. All three, in that
order, because they are a funnel: a page nobody sees cannot earn a click and a
page nobody clicks cannot send anybody anywhere. `signalScore` in
`lib/atlas/gsc-cohort.js` is a product rather than a weighted sum for that
reason, and it is unknown whenever any input is unknown rather than falling back
to the inputs that happen to exist.

So the honest state today: group 3 is measurable now, group 2 needs one container
change, group 1 needs three secrets. None of the three needs code.

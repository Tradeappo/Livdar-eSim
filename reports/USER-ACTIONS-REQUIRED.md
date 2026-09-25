# User actions required

2026-09-25. Everything in this repository that could be done without you is done.
Four items remain and all four need a browser signed in as a human, which this
session does not have: Google Search Console, Tag Manager, Analytics and Microsoft
Clarity all answered with a sign-in form when opened from the container. That is
recorded rather than assumed - the test opened a URL that only renders for a
signed in account, not a marketing page.

Nothing below needs a code change. Every one is a value typed into a settings
screen.

---

## 1. Search Console: three repository secrets

**Service** GitHub, `Tradeappo/Livdar-eSim`

**Screen** `https://github.com/Tradeappo/Livdar-eSim/settings/secrets/actions`

**What to click** New repository secret, three times.

| Name | Value type | Where it comes from |
| --- | --- | --- |
| `GSC_PROPERTY` | text, exactly `sc-domain:livdar.com` | the property already exists and is verified |
| `GSC_CLIENT_EMAIL` | the service account address, ending `.iam.gserviceaccount.com` | Google Cloud, the service account's details page |
| `GSC_PRIVATE_KEY` | the private key from that account's JSON key file, PEM, beginning `-----BEGIN PRIVATE KEY-----` | the JSON key file. Paste the `private_key` value. Escaped newlines are handled; both shapes work |

**Why I could not do it** A secret needs its value. There is no service account key
anywhere in this project or this session, and creating one needs Google Cloud
access.

**If no service account exists yet** Google Cloud console, IAM and admin, Service
accounts, Create service account. No roles and no permissions are needed on the
Cloud side. Then Keys, Add key, Create new key, JSON.

**How to verify it worked**
```
GitHub, Actions, atlas-search-console, Run workflow
```
The preflight step prints
`"configured": true, "authorised": true, "granted": true, "why": "connected"`.
It prints the client email, which is an identifier, and never the key.

---

## 2. Search Console: add that account as a user of the property

**Service** Google Search Console, as the account that owns the property

**Screen** `https://search.google.com/search-console/users?resource_id=sc-domain%3Alivdar.com`

**What to click** Add user. Paste the same address you put in `GSC_CLIENT_EMAIL`.
Permission **Full** or **Restricted**; Restricted is enough to read Search
Analytics.

**Why I could not do it** Search Console asked this container to sign in.

**How to verify it worked** The same workflow run as above. Step 1 without step 2
reports `"authorised": true, "granted": false` and names the 403 - that case is
reported separately on purpose, because a valid key with no access to the property
used to be indistinguishable from every other failure.

After both, the nightly import at 05:30 UTC opens a pull request titled
`Atlas Search Console import` with impressions, clicks, CTR and average position
per page, split by cohort, surface, family, language, market and destination, and
the top 10, 20 and 100 per surface. Indexed rate stays unknown until the Pages
report is wired, which is a separate API and is stated as such rather than
inferred from an impression.

---

## 3. Tag Manager: five event names and nine parameters

**Service** Google Tag Manager, container **GTM-WKGXHXWC**

Read from the published container an hour ago, so this is its current state. The
container is correct for the eSIM site and blind to the Atlas: its GA4 event tag
fires on a fixed list of ten event names and its parameter table has eleven rows.

### 3a. The trigger

**Screen** Triggers, the trigger on the GA4 event tag (the one whose condition is
an `Event` regex)

**Field** Event name matches RegEx

**Current value**
```
^(search|view_destination|view_plan|select_plan|begin_checkout|checkout_intent|check_availability|notify_signup|cta_click|language_change)$
```

**Replace with**
```
^(search|view_destination|view_plan|select_plan|begin_checkout|checkout_intent|check_availability|notify_signup|cta_click|language_change|tool_view|tool_start|tool_complete|internal_cta_click|outbound_click)$
```

`cta_click` and `language_change` are already there, which is why the call to
action funnel works on production today and the tool funnel does not.

### 3b. Nine Data Layer Variables

**Screen** Variables, User-Defined Variables, New, Data Layer Variable

Version 2, no default value. Name each one after its key so the tag table reads
cleanly.

```
cohort   surface   family   entity   page_path   page_language
cta_type   cta_destination   cta_kind
```

`destination`, `cta_label` and `cta_position` already exist and already arrive.

### 3c. Nine rows on the GA4 event tag

**Screen** Tags, the GA4 event tag, Event Parameters

One row per variable above, parameter name identical to the variable name.

**Why `page_language` and not `language`** GA4 collects `language` itself from the
browser and silently drops a custom event parameter of that name. This is measured,
not assumed: the eSIM pages push `language` and `market` with the same value and
the hit that reaches GA4 carries `ep.market` and no `ep.language` at all. The site
pushes both, so the container's existing `language` row keeps working and nothing
has to change at once.

### 3d. Publish

Submit, name the version something like `Atlas events and dimensions`, Publish.

**Why I could not do it** Tag Manager redirected this container to the Google
sign-in page.

**How to verify it worked** No login needed for this check:
```
curl -s "https://www.googletagmanager.com/gtm.js?id=GTM-WKGXHXWC" | grep -o 'tool_complete'
```
The published container is public. A match means the trigger carries the new
names. Then open any Atlas page with the network panel filtered to `/g/collect`
and click a call to action: the hit should read `en=cta_click` with `ep.cohort`,
`ep.surface` and the rest.

`docs/gtm-changes-needed.md` holds the same list with the reasoning per parameter.

---

## 4. GA4: register the parameters as custom dimensions

**Service** Google Analytics 4, property **G-DY02HH34DT**

**Screen** Admin, Data display, Custom definitions, Create custom dimension

**Field** Dimension name free, **Scope: Event**, Event parameter exactly the name
from 3b.

```
cohort   surface   family   entity   page_path   page_language
cta_type   cta_destination   cta_kind   tool_type   tool_id
```

Without this the parameters arrive on the hit and appear in no report. Check the
existing list first; do not create a duplicate.

**Also on that property, Admin, Events, Mark as key event:**

```
tool_complete   notify_signup   select_plan   begin_checkout   checkout_intent
```

**Leave as ordinary events** - this matters more than it looks:

```
page_view   cta_click   internal_cta_click   outbound_click   tool_view   tool_start
language_change   search   view_destination   view_plan   check_availability
```

A call to action click is what the experiment measures, not what it is trying to
achieve. Marking five hundred pages' worth of them as conversions would make the
conversion rate a measure of how many buttons the site has. `lib/analytics.js`
holds both lists as `KEY_EVENTS` and `ORDINARY_EVENTS` and a test fails if a click
event appears in the first one.

**Why I could not do it** Analytics redirected this container to the sign-in page.

**How to verify it worked** Admin, Custom definitions shows eleven event-scoped
dimensions. Then Reports, Realtime, open an Atlas page and click a call to action:
the event appears with its parameters within a minute.

### Optional, and the only one that unlocks a report rather than a number

If you also want the behaviour half of the measurement to run nightly rather than
be read by hand, add a service account with **Viewer** on the GA4 property (Admin,
Property access management) and one more repository secret:

| Name | Value type |
| --- | --- |
| `GA4_PROPERTY_ID` | the numeric property id, from Admin, Property details |

The same `GSC_CLIENT_EMAIL` and `GSC_PRIVATE_KEY` are reused, so nothing else is
needed. `scripts/atlas/ga4-import.mjs` then produces sessions, engaged sessions,
engagement rate, average engagement time, call to action click rate, tool start
rate, tool completion rate, downstream navigation rate and the four commercial
intent counts, per surface.

---

## 5. Clarity: one project id, then one Vercel variable

**Service** Microsoft Clarity

**Screen** `https://clarity.microsoft.com/projects`

**What to click** If a project for livdar.com exists, open it, Settings, Overview,
and copy the **Project ID** (ten characters, lower case letters and digits). If
none exists, New project, name Livdar, website `livdar.com`, and copy the id it
gives you.

Then, **Vercel**, project `livdar-esim`, Settings, Environment Variables:

| Name | Value type | Environments |
| --- | --- | --- |
| `NEXT_PUBLIC_CLARITY_ID` | the project id | Production and Preview |

The variable already exists in both and its value is empty, so edit rather than
create. Then Deployments, the latest production deployment, Redeploy.

**Why I could not do it** Clarity asked this container to sign in, so there is no
id to put in the variable. Setting it to a guess would be worse than leaving it
empty: the loader is gated on the value being non-empty, so an empty variable
renders no script and a wrong one renders a broken tag on all 500 pages.

**How to verify it worked**
```
curl -s https://livdar.com/en/cost-of-living/japan/ | grep -o 'clarity.ms/tag/[a-z0-9]*'
```
One match. In a browser, `window.clarity` is a function and the Clarity dashboard
shows sessions within a few minutes.

No code change is needed. `app/[lang]/layout.jsx` already carries the loader and
already gates it on the value.

---

## What is not on this list, and why

**Nothing about the pages.** All 500 URLs were verified against the production
origin on every field an hour ago: status, title, description, H1, canonical,
robots, html lang, every hreflang including x-default, both call to action blocks,
all four links, the two positions, the internal link count, the structured data,
the sitemap membership, and the presence of a tool exactly where the page model
declares one. 500 of 500 clean.

**Nothing about indexing requests.** The sitemaps are the discovery architecture
and they are correct: 500 URLs across 58 Atlas sitemaps, none missing, none extra,
each with a lastmod, each listed in robots.txt. Asking Search Console to index
five hundred URLs one at a time is not how that queue is meant to be used and
would not make them index faster.

**Nothing about the GTM container beyond items 3 and 4.** The container is
otherwise correct: one container, one GA4 property, no second snippet anywhere in
the served HTML, Consent Mode v2 defaults written before the container loads, and
`page_view` and `cta_click` both verified arriving from an Atlas page in a real
browser.

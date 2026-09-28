# User actions required

Updated 2026-09-28. Everything in this repository that could be done without you is
done. Item 6 is finished. Eight items remain.

Five of them need a browser signed in as a human, which this session does not have:
Google Search Console, Tag Manager, Analytics and Microsoft Clarity all answered
with a sign-in form when opened from the container, and Ahrefs Rank Tracker keywords
cannot be added through the API at all. That is recorded rather than assumed: the
test opened a URL that only renders for a signed in account, not a marketing page.

The other two are a Vercel environment variable, which this session is not permitted
to write, and the Rank Tracker additions.

Nothing below needs a code change. Every one is a value typed into a settings screen
or a file pasted into one.

**Item 6 is done.** IndexNow accepted 615 URLs on 2026-09-28. The 497 Atlas URLs
that were answering 404 to Google for three days were fixed the same day and
have been submitted.

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

## 6. IndexNow: DONE, nothing needed

Completed 2026-09-28. `INDEXNOW_KEY` is set on the Vercel project for
Production and Preview, `https://livdar.com/indexnow-key.txt` returns HTTP 200
with the matching key, and **IndexNow accepted 615 URLs with HTTP 200**: 115
eSIM and 500 Atlas, no duplicates, all verified 200 and `index, follow` and
self canonical before submission.

Left here rather than deleted so the list stays readable against earlier
reports. Full record:
`reports/ahrefs-export-2026-09-28/indexnow/README.md`.

---

## 7. Rank Tracker: 125 keyword additions

**Service** Ahrefs, project `Livdar` (project id 10422446)

**Screen** Rank Tracker, Livdar, Add keywords

**What to click** Add keywords, paste, set location and language per block, add tags.

**The file** `reports/ahrefs-export-2026-09-28/rank-tracker/proposed-additions-2026-09-28.tsv`

125 rows: keyword, country, language, volume, KD, tags, and the live page each one
belongs to. Sorted by volume descending, so if the plan allows fewer than 250
tracked keywords, cut from the bottom.

**Why I could not do it** The Ahrefs API is read-only for Rank Tracker keywords.
`management-project-keywords` lists them; there is no endpoint that adds one.

**Why it matters** All 125 keywords currently tracked are eSIM keywords. Coverage
of Pulse, Areas, Work, Move, Sport, Stay, Tools and Climate is zero, so the Rank
Tracker cannot detect an Atlas signal at all, in any market. The proposed 125 cover
58 surface and market pairs and 80 per cent of the demand the 500 live pages target.

**Do not delete anything.** These are additions.

**How to verify it worked** The project keyword count goes from 125 to 250, and
filtering by the tag `atlas` returns 125 rows.

---

## 8. Brand Radar: prompt sets that touch the Atlas

**Service** Ahrefs, Brand Radar

**Screen** Brand Radar, report `Livdar - AI visibility eSIM`, or a new report

**The file** `reports/ahrefs-export-2026-09-28/brand-radar/proposed-prompts-2026-09-28.tsv`

44 prompts across nine surfaces and eight languages, each with the competitor
set to track against it.

**Why I could not do it** Brand Radar reports and prompts are read-only through
the API. `management-brand-radar-reports` and `management-brand-radar-prompts`
list them and there is no endpoint that creates either.

**Why it matters** All 12 existing prompts are commercial eSIM questions in
English in the United States, so **no prompt touches the Atlas at all**. AI
visibility for the 500 pages is unmeasured, not zero. And an `ai_overview`
block appeared on every single SERP read in this snapshot, including German,
French and Dutch holidays and German salaries, so this is the top of the search
result rather than a side channel.

**Also worth turning on** Every data source except ChatGPT is `off` on all six
reports in the account. **Google AI Overviews** is the one that matters most,
because that is the surface actually appearing on Livdar's SERPs.

**How to verify it worked** `management-brand-radar-prompts` returns more than
12 rows, and the mentions report starts showing non eSIM prompts.

---

## 9. Search Console: disavow the PBN cluster, when convenient

**Service** Google Search Console disavow tool

**Screen** `https://search.google.com/search-console/disavow-links`

**Why this is on the list now and was not this morning** The first reading of
the backlink profile sampled the nofollow clusters and concluded the links were
inert. Reading the anchors report and then filtering backlinks to
`is_dofollow` showed **at least 636 dofollow links from roughly 300 domains**,
with commercial anchors naming livdar.com, the largest cluster arriving inside
about 24 hours on 2026-09-17 and 18. Every source serves the identical path
`/dir/premium-backlink-services-123314`.

**Why I could not do it** Search Console needs an authenticated account.

**Not urgent.** The sources have no traffic and no authority and Google's spam
systems are built to discount this. But it is dofollow, it names the domain in
commercial anchors, and it is cheap to remove as a variable before the Atlas
starts ranking. The evidence and the exact pattern are in
`reports/ahrefs-export-2026-09-28/backlinks/README.md`.

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

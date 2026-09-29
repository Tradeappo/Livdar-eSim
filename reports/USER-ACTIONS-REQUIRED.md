# User actions required

Updated 2026-09-29, third pass. Everything in this repository that could be done
without you is done. Items 6 and **10** are finished. **Twelve items remain, and two
of them expire on 8 October.**

**Item 10 closed itself on 2026-09-29:** the Site Audit crawl ran and the site came
back with health score **100 and zero errors**. The baseline is captured and frozen.

Two new items were added on 2026-09-29 by the 1,000,000 candidate research pass:
**item 13**, the best opportunity in the programme and the only one blocked on
manual labour rather than on a licence, and **item 14**, a one word scope decision
worth roughly 700 pages.

> ## The Ahrefs subscription ends 8 October 2026
>
> Items **7** and **8** are worth far less, or nothing, after that date. Item 10 is
> already done. Item 7 above all: a Rank Tracker baseline started after expiry tracks nothing,
> and one started before it keeps reporting. If you do a single thing from this
> file, do item 7.
>
> **Updated 2026-09-29, second revision: item 7 is now 580 keywords to paste, in
> four priority tiers.** Use
> `reports/rank-tracker-2026-09-29/PASTE-READY.md`. It replaces the 571 keyword
> volume sorted set, which told you to take the first N rows at a plan limit; that
> instruction would have dropped a live page's own keyword in favour of a keyword
> for a page that does not exist yet, and position history cannot be backfilled.
>
> The order is now **LIVE_PRIMARY (500, one per live page, 250 per cohort), then
> LIVE_SECONDARY (38), then ESIM (125, already tracked), then CANDIDATE_HEAD (42)**.
> If your allowance is smaller than the set, cut from the bottom of the lowest tier
> you reach and never from tier 1. Zero pages needed a keyword invented and zero
> cannibalisation was found.
>
> 871,157 of 2,000,000 API units remain and the allowance resets on 8 October,
> the day after access ends, so they cannot be carried forward.

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

## 7. Rank Tracker: 580 keyword additions, in four priority tiers

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

## 9. Search Console: disavow, 998 domains, and it got worse

**Service** Google Search Console disavow tool

**Screen** `https://search.google.com/search-console/disavow-links`

**File to upload**
`reports/ahrefs-export-2026-09-28/backlinks/disavow-candidates-2026-09-28.txt`

**This section replaces what was here this morning, and both numbers changed.**
The earlier entry said roughly 636 dofollow links from about 300 domains. A full
pass over the all-time referring domains (1,000 of 1,021 captured) says:

| | This morning | Now |
| --- | --- | --- |
| Referring domains | ~316 | **1,021 all time, 740 live** |
| Disavow candidates | 314 | **998** |
| Dofollow links | ~636 from ~300 domains | **630 from 313 domains** |

The dofollow count holds up. The domain count tripled, because **535 new referring
domains appeared in September alone**, and **578 of the 630 dofollow links arrived
in September**. Before August 2026 every single link was nofollow. The campaign
changed character and is still accelerating.

**One correction to the earlier evidence.** It cited shared IP subnets as a network
fingerprint. 982 of the 1,000 domains sit behind Cloudflare, which hosts millions of
unrelated sites, so that count was inflated. Excluding shared CDN ranges leaves three
real clusters and 17 domains. The classification now rests on hostname pattern and
TLD, which are much stronger here: 92.8% throwaway TLDs, and hostnames containing
`seo` 294 times, `link` 242, `checker` 230, `rank` 218.

**Still not urgent, and here is the honest case both ways.**

For waiting: Google says disavow is for manual actions or when you believe one is
imminent, and there is no manual action against livdar.com. All 1,784 links point at
two URLs, both the homepage, and **none at any Atlas page**. Ahrefs already assigns
both homepage variants a URL Rating of **0.0** despite 1,019 referring domains, which
is the graph being discounted in front of us.

For acting: 630 dofollow links inside two months from 313 zero-traffic domains whose
hostnames advertise link selling is exactly the pattern a spam classifier is built to
catch, and the rate is still climbing.

**The file is ready either way.** Full reasoning in
`reports/ahrefs-export-2026-09-28/backlinks/AUDIT-2026-09-28.md`.

**After 8 October the check that matters is GSC > Manual actions, monthly.** Empty
means the file stays unsubmitted.

---

## 10. Ahrefs: rerun the Site Audit crawl: DONE 2026-09-29, nothing needed

**The crawl ran and the site came back clean.** 2026-09-29 12:52 UTC, 916 URLs,
status Completed, **health score 100, zero errors**, 11 of 179 checks non-zero.
Captured and frozen in
`reports/ahrefs-export-2026-09-28/site-audit/CLEAN-BASELINE-2026-09-29.md`.

Every prediction below held: Open Graph 583 to 0, hreflang to redirect or broken
page 189 to 0, the whole 404 family to 0. The one warning that was left open is now
diagnosed, and the diagnosis was the opposite of the guess: it is not the eSIM
section and not transitional, it is the 328 Atlas pages in the seven locales with no
live eSIM market, whose header and footer link into eSIM URLs that correctly 307 to
`/en/`. That fix is designed and held back until the first clean GSC baseline exists,
because it changes the internal link graph of 328 live pages.

You only need to touch this again if you want one more crawl before 8 October. The
original note follows.

**Service** Ahrefs Site Audit

**Screen** Ahrefs > Site Audit > the **Livdar** project > **Rerun crawl**, top right
of the project overview

**Why I could not do it** The Ahrefs API exposes Site Audit as read-only. There are
endpoints for projects, issues, page explorer and page content, and none that starts
a crawl. Checked against the tool surface rather than assumed.

**Why it is worth doing** The most recent crawl began at 12:56 UTC on 2026-09-28,
**24 minutes after** the fix for the 404 outage reached production, and two further
fixes landed after it: hreflang across cohorts at 19:11 UTC and `og:image` at 21:04
UTC. The crawl is three fixes stale, and its Health Score of 60 describes a site that
no longer exists.

Expect the score to move sharply: 907 warnings and 679 transitional errors should
clear, leaving roughly 115 real findings and 135 informational ones.

**You may not need to touch it.** Crawls have been landing daily around 12:56 UTC, so
the **2026-09-29** scheduled crawl should be the first clean one on its own. A manual
rerun only brings it forward by a few hours. Either way, capture the result before
8 October, because it is the last Site Audit you will get.

Takes roughly 20 to 40 minutes at this site's size.

---

## 11. A decision only you can make: is there a lawful source for German school holiday dates?

**This is not a settings screen. It is the highest-value open question in the whole
Ahrefs exercise, and I cannot answer it.**

German school holidays are roughly four times the size of German public holidays, and
the incumbents are not defending them:

| Keyword | Monthly searches | Held at | By a page with |
| --- | --- | --- | --- |
| `sommerferien nrw 2026` | **257,000** | position 6 | **0 referring domains** |
| `ferien niedersachsen 2026` | **205,000** | position 12 | **0 referring domains** |
| `sommerferien bayern 2026` | **186,000** | position 15 | 1 referring domain |
| `sommerferien hessen 2026` | **124,000** | position 8 | 1 referring domain |
| | **772,000** | | |

For comparison, the largest German public holiday term, `feiertage nrw 2026`, is
61,000.

**The blocker is not SEO.** The dates are set and published by each of the 16 state
education ministries, and this project forbids scraping. Building the family needs a
licensed or openly published dataset with adequate coverage and a reliable update
cadence, for 16 states across several years.

**What I need from you:** does such a source exist that Livdar may lawfully use? A
licence, an official open data release, a paid feed. If yes, this is the largest
opportunity found anywhere in this work. If no, it stays a measurement and the
candidate inventory drops to 68,793 monthly searches of buildable work.

Recorded in `reports/ahrefs-export-2026-09-28/organic/CANDIDATE-INVENTORY.md` as
BLOCKED so it is neither lost nor mistaken for ready work.

---

## 12. Optional: 134 meta descriptions run past 160 characters

**Not a settings screen, a one template code change, and it is your call rather than
mine.**

The Site Audit flagged 101 pages with a meta description that is too long, and the
clean crawl of 2026-09-29 puts the real figure at **134** now that the 497 recovered
Atlas pages can be measured at all. Verified independently by measuring 399 built
pages: **96 exceed 160 characters**, median 156, longest **201**. Nine titles are
also over.

The clean crawl also flags 45 descriptions as too short, and **40 of those are not**:
they are Japanese pages of 49 to 88 characters measured against a threshold
calibrated for Latin script, where a Japanese character carries several times the
information. Only **5** are genuinely short, all of them eSIM section hub pages:
`/en/regions/`, `/en/guides/`, `/de/regionen/`, `/ro/regiuni/` and
`/ro/regiuni/central-america/`.

Over 160 characters, the description is truncated in the results page and the last
clause is discarded, so this is a real click-through cost rather than a cosmetic
warning.

**Why I did not just fix it.** The brief says not to modify production for Ahrefs
warnings alone, and this sits close enough to that line that it should be your
decision. It is bounded: the description is composed in one template, the overshoot
is 1 to 41 characters, and 303 of 399 pages are already inside budget.

Say the word and it is a single change with a test.

---

## 13. A decision only you can make: pay for airport transfer data with labour?

**Not a settings screen. It is the best opportunity found anywhere in this
programme and it is blocked on data that has to be gathered by hand.**

Airport transfer pages measure like this, and the SERPs are wide open:

| Keyword | Monthly searches (gb) | KD | Clicks | CPC |
| --- | --- | --- | --- | --- |
| `dublin airport to city centre` | **4,400** | **0** | 3,599 | 15c |
| `krakow airport to city centre` | **2,700** | **0** | 2,525 | 30c |
| `prague airport to city centre` | 2,200 | 1 | 1,711 | 10c |
| `budapest airport to city centre` | 2,000 | 2 | 1,883 | 30c |
| `amsterdam airport to city centre` | 1,300 | 2 | 931 | 5c |
| `malaga airport to city centre` | 1,000 | 0 | 948 | 7c |

Sixteen of twenty airports measured have real volume and none exceeds KD 12. On
the Krakow SERP, **hellocracow.com holds position 7 on DR 10 with 2 referring
domains** and **travellingwithnikki.com holds position 8 on DR 17 with 1**, both
out-trafficking DR 58 Opodo below them. On Dublin, a **DR 0 site with zero
referring domains** holds position 6. Authority is not the barrier anywhere here.

**The blocker is the data.** A useful airport transfer page needs the modes, the
journey times and the fares. There is no lawful aggregate: GTFS covers schedules
for some operators, usually without fares, and this project forbids scraping. The
numbers are published on operator sites and in printed timetables, so they are
gatherable, they are facts rather than copyrightable expression, and they are
citable with attribution. What they are not is free of labour: roughly 20 to 30
minutes per airport, so **40 to 60 hours for the 120 airports that carry most of
the measured demand**.

There is a second, much cheaper half to this. The repo's `cityKm` field is not the
distance to the city centre at all: it is the distance to the nearest populated
place, so Heathrow reads 4.2 km where central London is about 23, and JFK 5.7
where Manhattan is about 24. That is a day of engineering, not field work, and
until it is fixed the family cannot be published at all because the headline
number on every page would be false.

**What I need from you:** is 40 to 60 hours of manual data capture something you
want to spend, on your side or paid out? If yes, this becomes 1,089 publishable
pages against the weakest SERPs in the programme. If no, it stays blocked and
recorded, and the publishable set stays at 1,791 pages.

Full analysis in
`reports/scale-universe-2026-09-29/DATA-SOURCE-GAPS.md` (gaps 1 and 2) and
`reports/scale-universe-2026-09-29/SERP-WEAKNESS-MAP.md`.

---

## 14. A smaller decision: public holidays for US, GB, CA, AU and JP

OpenHolidays carries 36 countries, including Brazil, but **not** the United
States, United Kingdom, Canada, Australia or Japan. Those five are missing from
the only page families whose SERPs are validated in five markets.

The German state layer shows the shape of what is missing: Bayern 24,385,
Niedersachsen 11,934, Sachsen 11,065, Berlin 10,012, Hessen 8,626, all at KD 0 to
2. A US state layer and a Canadian provincial layer are the same structure.

Unlike items 11 and 13, **the licences here are already clear**: gov.uk publishes
UK bank holidays under the Open Government Licence, US federal and state holiday
publications are freely reusable, and Canada and Australia publish under their own
open licences. This is five ingest scripts, roughly 700 candidates, and no
permission to obtain.

**What I need from you:** nothing, except a yes. This one I can do; it is listed
here only because it is a scope decision rather than a repair, and the brief says
not to widen scope without asking.

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

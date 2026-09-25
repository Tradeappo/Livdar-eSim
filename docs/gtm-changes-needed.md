# The container changes the Atlas needs, and why the code cannot make them

Read from the published container on 2026-09-25, at
`https://www.googletagmanager.com/gtm.js?id=GTM-WKGXHXWC`, which is the file
every visitor receives. Nothing here is inferred from the repository.

The container is correct for the eSIM site and blind to the Atlas. Two tags:

| Tag | Type | Fires on | Sends |
| --- | --- | --- | --- |
| Google tag | `__googtag` | `{{Event}} equals gtm.js`, so every page | `send_page_view: true`, `language`, `market` |
| GA4 event | `__gaawe` | `{{Event}}` matches `^(search\|view_destination\|view_plan\|select_plan\|begin_checkout\|checkout_intent\|check_availability\|notify_signup\|cta_click\|language_change)$` | `language`, `market`, `destination`, `region`, `content_cluster`, `plan_type`, `cta_label`, `cta_position`, `search_term`, `from_language`, `to_language` |

Measurement ID `G-DY02HH34DT`, one container, one property, no second GA4
snippet anywhere in the served HTML. `page_view` and `cta_click` were both
verified reaching GA4 from a real browser.

This repository can push a dataLayer event and it cannot publish a container
version. So the events and parameters below are pushed correctly by the site and
will be dropped by GTM until somebody with access to the container adds them.
Everything in the list was observed in `window.dataLayer` on a live page.

## 1. Five event names the trigger does not match

The GA4 event tag's trigger is a regular expression over `{{Event}}`. These
events fire on the Atlas pages and match nothing, so GA4 never sees them:

```
tool_view  tool_start  tool_complete  internal_cta_click  outbound_click
```

Change: extend that trigger's pattern to

```
^(search|view_destination|view_plan|select_plan|begin_checkout|checkout_intent|check_availability|notify_signup|cta_click|language_change|tool_view|tool_start|tool_complete|internal_cta_click|outbound_click)$
```

`cta_click` and `language_change` are already in it, which is why the call to
action funnel works today and the tool funnel does not.

## 2. Nine parameters the event tag does not forward

Each needs a Data Layer Variable (version 2, no default value) and a row in the
GA4 event tag's event parameters table. The names are the dataLayer keys:

| Parameter | What it is | Why it is not optional |
| --- | --- | --- |
| `cohort` | `001` or `002` | The experiment compares two lots of 250 pages. Without this there is nothing to compare. |
| `surface` | `move`, `pulse`, `areas`, `work`, `stay`, `sport`, `tools`, `climate` | Every target in the brief is per surface. |
| `family` | e.g. `cost-of-living.country` | The unit a page is actually built as. Also pushed as `content_cluster`, which the container already forwards, so this one is a convenience rather than a blocker. |
| `entity` | `JP`, `DE-NW`, `1850147:hiking`, a tool id | Lets a report join to the registry. |
| `page_path` | `/pl/koszty-zycia/szwajcaria/` | GA4 has the URL, but not parsed. Deriving a surface from `zonas` in a report means teaching the report Spanish. |
| `page_language` | `pl` | See the note below. This one matters more than it looks. |
| `cta_type` | `tools`, `events`, `esim`, `tool`, `sport` | What kind of step the reader took. |
| `cta_destination` | the href | Where they went. |
| `cta_kind` | `cost`, `sibling`, `esim`, `areas`, `tool` | Which rule produced the call to action, so the chains can be compared against each other. |

`destination`, `cta_label` and `cta_position` are already in the table and
already arrive.

### The `page_language` note

GA4 collects `language` automatically from the browser and silently drops a
custom event parameter with the same name. This is not a guess: the eSIM pages
push `language` and `market` with the same value, and the hit that reaches GA4
carries `ep.market` and no `ep.language` at all. So the page's own language
travels as `page_language`. `language` is still pushed alongside it, so the
container's existing mapping keeps working and nothing has to change at once.

## 3. Key events

Mark as key events in GA4: `tool_complete`, `notify_signup`, `select_plan`,
`begin_checkout`, `checkout_intent`.

Leave as ordinary events: `cta_click`, `internal_cta_click`, `outbound_click`,
`tool_view`, `tool_start`, `language_change`, `search`, `view_destination`,
`view_plan`, `check_availability`.

A call to action click is what the experiment measures, not what it is trying to
achieve. Marking five hundred pages' worth of them as conversions would make the
conversion rate a measure of how many buttons the site has. `lib/analytics.js`
holds both lists as `KEY_EVENTS` and `ORDINARY_EVENTS`, and a test fails if a
click event appears in the first one.

## 4. Custom dimensions in GA4

Each parameter above also needs registering in GA4 as a custom dimension, event
scoped, or it will arrive on the hit and not appear in any report. Admin, Custom
definitions, Create custom dimension, event parameter, same name.

## 5. Nothing to do for Clarity in the container

Clarity is not connected at all: `NEXT_PUBLIC_CLARITY_ID` exists as a Vercel
Production variable and its value is empty, so the loader renders no script.
Verified twice in a browser, no request to `clarity.ms` and `window.clarity`
undefined. Setting that variable and redeploying is the whole fix; the loader is
already in `app/[lang]/layout.jsx` and is gated on the value being non-empty.

## How to check the result

```
node -e "1" # nothing here needs the repo
curl -s "https://www.googletagmanager.com/gtm.js?id=GTM-WKGXHXWC" | grep -o '"vtp_eventName"[^,]*'
```

The published container is public. After the change, its `__gaawe` tag's
predicate should carry the five new event names and its event parameter table the
nine new rows. GA4 DebugView, or a browser with the network panel filtered to
`/g/collect`, shows them arriving as `en=tool_complete` with `ep.cohort` and the
rest.

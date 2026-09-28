# Search Console, corrected 2026-09-28

## The correction

An earlier version of this file said Search Console was not readable and
reported everything downstream of it as unknown. **That was wrong**, and the
mistake was mine: I checked this session's own credentials and the Ahrefs
project's connection, found both absent, and never opened
`data/atlas/gsc/`, which the repository has been carrying all along and which
an earlier `du` output in this same session had already shown me at 300K.

Search Console **is** configured and working. `.github/workflows/atlas-search-console.yml`
authenticates through Workload Identity Federation: the job's GitHub OIDC token
is exchanged for a short lived token of the Search Console service account, no
key exists in the repository or in a secret, and the pool trusts only this
repository on main running that workflow file. It commits its result and opens a
pull request.

Nothing about that setup was touched. No service account was created, no private
key was generated, no WIF configuration was changed.

## What is true about this session

Two narrower things, both still true and neither of them "GSC does not exist":

- This container has no Search Console credential of its own, so
  `npm run gsc:check` reports `configured: false`. That is by design: the
  credential lives in CI, which is the point of federation.
- The **Ahrefs** project has no Search Console connection. The Ahrefs `gsc-*`
  endpoints answer `No GSC data available for the requested date range` for
  project 10422446 across both a one week and a four month window. Connecting
  it is done in the Ahrefs interface by a signed in account, so it stays a user
  action, and it is a convenience rather than a necessity: the workflow already
  delivers the same data.

## What the data says, and the trap in it

The workflow was re run today by `workflow_dispatch` on main. It succeeded and
opened its pull request with a fresh import.

| | Previous import | Fresh import |
| --- | --- | --- |
| File | `pages-2026-09-22.json` | `pages-2026-09-25.json` |
| Property | sc-domain:livdar.com | sc-domain:livdar.com |
| Window | 2026-08-26 to 2026-09-22 | 2026-08-29 to **2026-09-25** |
| Rows | 500 | 500 |
| Pages with impressions | 0 | **0** |
| Pages with clicks | 0 | **0** |

Zero, and the zero means nothing yet. **The Atlas was published on 2026-09-25 at
20:00 UTC.** The older window ends three days before that. The newer window ends
on the publication day itself, so it covers about four hours of it, and Search
Console's own reporting lags two to three days on top.

The import is scrupulous about this in one respect and dangerous in another. It
writes, per page, `"source": "Search Console returned no row for this page in the
window, so it was shown to nobody"`. That sentence is true of the window and
false of the page, and read at a glance it says the 500 page launch failed.

So `scripts/atlas/atlas-monitor.mjs` now carries a fourth state,
`out_of_window`, and all 500 pages are in it. It compares the window's end
against the manifests' `generatedAt` and requires the window to end **strictly
after** the publication day, because a window ending on it is a rounding error
rather than coverage. `tests/atlas-monitor.test.mjs` asserts that a window
which predates the pages can never be counted as a real zero, and that once a
window does reach them a zero reads as a zero.

## When the first real reading arrives

A window ending **2026-09-27 or later**. The workflow runs daily at 05:30 UTC,
so the run on 2026-09-30 is the first that will carry a few clear days of the
Atlas being reachable, remembering that it was only reachable from 12:32 UTC on
2026-09-28 after the 404 fix.

Until then the honest answer to "which surfaces are showing signal" is that the
question cannot be answered yet, and Pulse stays a hypothesis with three lines
of Ahrefs evidence behind it and no Google evidence at all.

## Indexed and discovered stay unknown, and the import says so

`"note": "indexed stays unknown: the Search Analytics API reports impressions,
not index state. The Pages report is a separate import and is not wired yet."`

So `discovered` and `indexed` are null for all 500 and will remain null until
the URL Inspection or Index Coverage import is added. Impressions are a proxy
that only works in one direction: a page with impressions is indexed, a page
without impressions may or may not be.

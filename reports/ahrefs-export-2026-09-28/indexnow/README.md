# IndexNow, 2026-09-28: working end to end

Submitted and accepted. This is the first IndexNow submission the project has
ever made.

## What was wrong, and it was three things

1. The guard was `published.length !== 91`. That count was true the day it was
   written; the eSIM site is 115 pages now, so the guard fired on the site's
   own growth and **refused every submission**, including the ones it existed
   to allow.
2. The Atlas was not in the URL list at all. `enumeratePages` resolves the eSIM
   era pages out of the entity dataset and knows nothing about the cohort
   manifests, so **no cohort URL could ever be submitted**.
3. `INDEXNOW_KEY` was not set on the Vercel project, so
   `https://livdar.com/indexnow-key.txt` answered **404** and no submission
   could be verified by any engine.

All three are now fixed. 1 and 2 in code, merged as b58112b. 3 by setting the
environment variable.

## The key

`INDEXNOW_KEY` is set on the Vercel project for Production and Preview, as a
plain variable: 48 hexadecimal characters from `crypto.randomBytes(24)`. It is
**not a secret** and is not treated as one. The site publishes it at
`/indexnow-key.txt`, which is the mechanism by which IndexNow verifies that
whoever submits a URL controls the host. Anyone can read it, which is the
point.

Verified: `https://livdar.com/indexnow-key.txt` returns **HTTP 200** and the
body matches the variable exactly.

## The submission

| Check | Result |
| --- | --- |
| URLs eligible | **615** (115 eSIM, 500 Atlas) |
| Duplicates | **0** |
| Off host | **0** |
| Non canonical form (missing trailing slash) | **0** |
| HTTP status of all 615 | **615 of 615 → 200** |
| `<meta name="robots">` on all 615 | **615 of 615 → index, follow** |
| Self referencing canonical on all 615 | **615 of 615** |
| Endpoint | `https://api.indexnow.org/indexnow` |
| **Response** | **HTTP 200, 615 URLs accepted** |

Every one of the 615 was fetched from production and its status, robots meta
and canonical read before anything was submitted. Nothing was submitted on
trust.

## The first attempt failed, and it was correct that it did

The first submission returned **HTTP 403
`SiteVerificationNotCompleted`**: "Site Verification is not completed. Please
wait for some time for the verification to complete and try again." The key had
been published about four minutes earlier and IndexNow had not fetched it yet.
Retried later and accepted with 200.

Worth recording because it is the expected first-run behaviour and not a fault.

## Why 615 and not a smaller set

The previous brief said not to resubmit all 500 repeatedly. This is not a
repeat: it is the first submission, and 497 of those URLs changed from 404 to
200 earlier today after the cohort manifest fix. A URL that changed state is
exactly what IndexNow is for. Future submissions should be the changed subset,
which is what `--paths` exists for and why the script refuses a live submission
without it.

## Not verified, and cannot be from here

Whether Bing acted on the submission. Bing Webmaster Tools needs an
authenticated account and there is no `BING_API_KEY` and no signed in browser
in this container. The IndexNow 200 confirms the submission was accepted, not
that anything was crawled.

Ahrefs Site Audit does carry `indexnow_status`, `indexnow_reason` and
`indexnow_submitted_at` per page, so the next Site Audit crawl will show what
it makes of this. The crawl of the 27th reported "Changed pages not submitted
to IndexNow" with a change of -473, which was the outage, not this.

## Reproducing it

```
npm run indexnow:dry-run                      # 615 URLs, no request sent
INDEXNOW_KEY=<the key> INDEXNOW_CONFIRM_LIVE=true \
  NODE_USE_ENV_PROXY=1 \
  node scripts/indexnow-submit.mjs --submit --paths <changed paths>
```

`NODE_USE_ENV_PROXY=1` matters in this container: Node's built in fetch ignores
`HTTPS_PROXY` without it and every request comes back 403 from the egress
proxy, which looks exactly like a rejection from IndexNow and is not one.

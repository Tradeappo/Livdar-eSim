// Submit the sitemap index to Google Search Console, then read back what
// Google now holds for it.
//
//   node scripts/atlas/gsc-submit-sitemap.mjs                 dry run, calls nothing
//   node scripts/atlas/gsc-submit-sitemap.mjs --submit        PUT, then GET the status
//
// WHY IT EXISTS. Google finds the sitemap from robots.txt on its own schedule,
// and after a cohort lands that schedule is the slowest part of discovery: the
// first cohort's 79 "unknown to Google" URLs were exactly the 79 its last read
// of the sitemap did not contain. A submission asks for a fresh read now.
//
// THE SAME AUTHENTICATION AS THE OTHER SEARCH CONSOLE STEPS, with one scope
// more. Listing and inspecting need webmasters.readonly; submitting a sitemap is
// a write and needs webmasters. The property role this needs, Owner or Full, is
// the one URL Inspection already requires, so a property that inspects can
// submit. A 403 says the role is missing and stops the run: no retry fixes a
// permission.
import { googleCredentialsFromEnv, getAccessToken } from '../lib/google-search-console.mjs';

const SCOPE = 'https://www.googleapis.com/auth/webmasters';
const FEED = 'https://livdar.com/sitemap.xml';

const property = process.env.GSC_PROPERTY || '';
const cred = googleCredentialsFromEnv();
const missing = [...cred.missing];
if (!property) missing.unshift('GSC_PROPERTY');

if (!process.argv.includes('--submit') || missing.length) {
  console.log(JSON.stringify({
    called: false, feed: FEED, property: property || null,
    why: missing.length ? 'cannot call the API: ' + missing.join('; ') : 'dry run, nothing was called',
  }, null, 1));
  process.exit(missing.length && process.argv.includes('--submit') ? 1 : 0);
}

const token = await getAccessToken(cred.credentials, fetch, SCOPE);
const base = 'https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(property) + '/sitemaps/' + encodeURIComponent(FEED);
const put = await fetch(base, { method: 'PUT', headers: { authorization: 'Bearer ' + token } });
if (!put.ok) {
  const body = await put.text();
  console.log(JSON.stringify({ called: true, submitted: false, status: put.status, error: body.slice(0, 500) }, null, 1));
  process.exit(1);
}
// Read it back, because a 204 says the request was accepted and nothing about
// what Google holds.
const got = await fetch(base, { headers: { authorization: 'Bearer ' + token } });
const s = await got.json().catch(() => ({}));
console.log(JSON.stringify({
  called: true, submitted: true, status: put.status, feed: FEED,
  lastSubmitted: s.lastSubmitted ?? null, lastDownloaded: s.lastDownloaded ?? null,
  isPending: s.isPending ?? null, isSitemapsIndex: s.isSitemapsIndex ?? null,
  warnings: s.warnings ?? null, errors: s.errors ?? null,
}, null, 1));

// Submit the sitemap index to Google Search Console, then read back what
// Google now holds for it.
//
//   node scripts/atlas/gsc-submit-sitemap.mjs                 dry run, calls nothing
//   node scripts/atlas/gsc-submit-sitemap.mjs --submit        PUT, then GET the status
//   node scripts/atlas/gsc-submit-sitemap.mjs --submit --feeds sitemap/atlas-pages-it-climate.xml,sitemap/ro-regions.xml
//                                                             submit these child sitemaps as well
//
// CHILD SITEMAPS. Google re-reads each child of the index on its own schedule, and a child can
// lag days behind the index: on 2026-10-24 atlas-pages-it-climate.xml had not been re-read since
// before cohort 003 went live, and ro-regions.xml had never been read. Submitting a child by its
// own URL asks for that file. Only livdar.com/sitemap.xml and livdar.com/sitemap/*.xml are
// accepted, so a typed input cannot submit anything else.
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
const flagValue = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] || '' : ''; };
const FEEDS = [FEED, ...String(flagValue('--feeds') || process.env.SITEMAP_FEEDS || '').split(',')
  .map((x) => x.trim()).filter(Boolean)
  .map((x) => (x.startsWith('https://') ? x : 'https://livdar.com/' + x.replace(/^\/+/, '')))]
  .filter((x, i, a) => a.indexOf(x) === i);
const bad = FEEDS.filter((x) => !/^https:\/\/livdar\.com\/(sitemap\.xml|sitemap\/[a-z0-9-]+\.xml)$/.test(x));
if (bad.length) { console.log(JSON.stringify({ called: false, refused: bad, why: 'only livdar.com sitemap files can be submitted' })); process.exit(1); }

const property = process.env.GSC_PROPERTY || '';
const cred = googleCredentialsFromEnv();
const missing = [...cred.missing];
if (!property) missing.unshift('GSC_PROPERTY');

if (!process.argv.includes('--submit') || missing.length) {
  console.log(JSON.stringify({
    called: false, feeds: FEEDS, property: property || null,
    why: missing.length ? 'cannot call the API: ' + missing.join('; ') : 'dry run, nothing was called',
  }, null, 1));
  process.exit(missing.length && process.argv.includes('--submit') ? 1 : 0);
}

const token = await getAccessToken(cred.credentials, fetch, SCOPE);
const results = [];
let failed = false;
for (const feed of FEEDS) {
  const base = 'https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(property) + '/sitemaps/' + encodeURIComponent(feed);
  const put = await fetch(base, { method: 'PUT', headers: { authorization: 'Bearer ' + token } });
  if (!put.ok) {
    const body = await put.text();
    results.push({ feed, submitted: false, status: put.status, error: body.slice(0, 500) });
    failed = true;
    continue;
  }
  // Read it back, because a 204 says the request was accepted and nothing about
  // what Google holds.
  const got = await fetch(base, { headers: { authorization: 'Bearer ' + token } });
  const s = await got.json().catch(() => ({}));
  results.push({
    feed, submitted: true, status: put.status,
    lastSubmitted: s.lastSubmitted ?? null, lastDownloaded: s.lastDownloaded ?? null,
    isPending: s.isPending ?? null, isSitemapsIndex: s.isSitemapsIndex ?? null,
    warnings: s.warnings ?? null, errors: s.errors ?? null,
  });
}
console.log(JSON.stringify({ called: true, submitted: !failed, results }, null, 1));
if (failed) process.exit(1);

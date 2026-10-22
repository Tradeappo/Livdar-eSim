// Google Search Console URL Inspection, for the live Atlas cohort.
//
// WHY THIS EXISTS. The daily import reads Search Analytics, which answers "was this page shown
// and clicked" and says nothing about index state. The file it writes says so itself: "indexed
// stays unknown: the Search Analytics API reports impressions, not index state." The cohort has
// 500 live URLs, 0 impressions and 0 clicks over six weeks, and zero impressions is NOT
// evidence of non-indexation: an indexed page that never ranks high enough to be seen reports
// zero too. The only API that gives a per-URL verdict is URL Inspection, and this calls it.
//
// AUTHENTICATION IS THE EXISTING ONE, UNCHANGED. It imports the same
// scripts/lib/google-search-console.mjs the daily import uses, so it takes Application Default
// Credentials of the external_account kind written by google-github-actions/auth through
// Workload Identity Federation, and the same webmasters.readonly scope. No service account is
// created, no private key exists, no pool or binding is modified. Running this outside a
// GitHub Actions job on main fails at the credentials step and says which part is missing,
// which is the correct outcome rather than a fallback: the library refuses static keys on
// purpose.
//
// THE ONE PERMISSION THAT MIGHT STILL BE MISSING, and it is not a scope. Search Analytics can
// be read by a RESTRICTED user of a property; URL Inspection requires an OWNER or a FULL user.
// If the service account was added as Restricted, this returns 403 and the error says so. That
// is a Search Console property permission, changed in Search Console's own Users and
// permissions screen, not in GCP and not in IAM.
//
// QUOTA, which is why the order matters. Google allows 2,000 inspections per property per day
// and 600 per minute. 500 URLs fit inside one day's quota with room to spare, but a run can
// still be cut short by a quota error or a container restart, so:
//   - the URLs are ordered ROUND ROBIN ACROSS COHORT x FAMILY x LANGUAGE, not grouped. A run
//     that dies at 120 URLs then covers every cohort, family and language evenly instead of
//     covering three completely. Family alone was not enough: cohort 003 is 1,000 pages of one
//     family, sorted by path, so the 2026-10-20 run reached only its de and en pages.
//
// THE TOKEN RENEWS ITSELF. An access token lives 60 minutes and the 2026-10-20 run (39496309572)
// died with 401 at exactly that mark. The token is now re-minted after 45 minutes, and a 401
// re-mints once and retries the same URL before the run is stopped.
//
// CONCURRENCY. The API answers in 3 to 7 seconds per URL, so one request at a time cannot
// inspect 1,500 URLs inside the job's 180 minutes. --concurrency runs that many requests at
// once while a shared pacer still holds the total to --qps.
//   - the output is appended per URL and the script skips what is already there, so a second
//     run resumes instead of re-spending quota.
//   - a 429 or a quota 403 stops the run and is recorded. It does not retry in a loop.
//
// RAW LABELS ARE KEPT VERBATIM. Google's coverageState, verdict, robotsTxtState, indexingState
// and pageFetchState strings go to disk exactly as returned, in `raw`, alongside a flattened
// `rows` layer that copies them without translation. Google has reworded these before
// ("Discovered - currently not indexed" has appeared with three different dashes), so nothing
// here maps them to a vocabulary of ours; the reporting layer does that and can be corrected
// without re-spending quota.
//
// Usage, inside the workflow:
//   node scripts/atlas/gsc-url-inspection.mjs --write            all of them, quota permitting
//   node scripts/atlas/gsc-url-inspection.mjs --write --limit 60 a stratified sample
//   node scripts/atlas/gsc-url-inspection.mjs --write --concurrency 4  four requests in flight
//   node scripts/atlas/gsc-url-inspection.mjs --dry-run          prove the plan, call nothing
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { googleCredentialsFromEnv, getAccessToken, createTokenSource } from '../lib/google-search-console.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const OUT_DIR = ROOT + 'data/atlas/measurements/gsc/';
const LIVE = ROOT + 'reports/atlas/live-production.json';
const ENDPOINT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const value = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const DRY = flag('--dry-run') || !flag('--write');
const LIMIT = Number(value('--limit', '0')) || 0;
const QPS = Number(value('--qps', '4')) || 4;        // 240/min, well under the 600 ceiling
const CONCURRENCY = Math.max(1, Number(value('--concurrency', '1')) || 1);
const DATE = value('--date', new Date().toISOString().slice(0, 10));
const OUT = OUT_DIR + `url-inspection-${DATE}.json`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Round robin across cohort x family x language, so a truncated run is still representative of
// every stratum rather than complete for the first few.
export function stratify(rows) {
  const byFamily = new Map();
  for (const r of rows) {
    const f = [r.cohort || '', r.family || 'unclassified', r.locale || ''].join('|');
    if (!byFamily.has(f)) byFamily.set(f, []);
    byFamily.get(f).push(r);
  }
  for (const list of byFamily.values()) list.sort((a, b) => a.path.localeCompare(b.path));
  const families = [...byFamily.keys()].sort();
  const out = [];
  for (let i = 0; out.length < rows.length; i++) {
    let moved = false;
    for (const f of families) {
      const list = byFamily.get(f);
      if (i < list.length) { out.push(list[i]); moved = true; }
    }
    if (!moved) break;
  }
  return out;
}

function liveRows() {
  const d = JSON.parse(readFileSync(LIVE, 'utf8'));
  return (d.rows || []).map((r) => {
    let p = String(r.path || '').trim();
    if (!p) return null;
    if (!p.endsWith('/')) p += '/';
    return {
      path: p,
      family: (r.family || r.page_family || '').trim() || 'unclassified',
      locale: (r.locale || '').trim(),
      surface: (r.surface || '').trim(),
      entity: (r.entity || '').trim(),
      cohort: (r.cohort || r.publication_cohort || '').trim() || 'cohort-001-live-500',
    };
  }).filter(Boolean);
}

// Flatten WITHOUT renaming. Every value is Google's own string or number, or null when the
// field is absent, and `null` means "the API did not return this field" rather than "no".
function flatten(url, meta, result) {
  const i = result?.inspectionResult?.indexStatusResult || {};
  const m = result?.inspectionResult?.mobileUsabilityResult || {};
  const rr = result?.inspectionResult?.richResultsResult || {};
  const amp = result?.inspectionResult?.ampResult || {};
  return {
    url,
    path: meta.path,
    family: meta.family,
    market: meta.locale,
    surface: meta.surface,
    entity: meta.entity,
    cohort: meta.cohort,
    inspected_at: new Date().toISOString(),
    verdict: i.verdict ?? null,
    coverageState: i.coverageState ?? null,
    robotsTxtState: i.robotsTxtState ?? null,
    indexingState: i.indexingState ?? null,
    pageFetchState: i.pageFetchState ?? null,
    lastCrawlTime: i.lastCrawlTime ?? null,
    crawledAs: i.crawledAs ?? null,
    googleCanonical: i.googleCanonical ?? null,
    userCanonical: i.userCanonical ?? null,
    sitemap: Array.isArray(i.sitemap) ? i.sitemap : null,
    referringUrls: Array.isArray(i.referringUrls) ? i.referringUrls : null,
    mobileUsability_verdict: m.verdict ?? null,
    mobileUsability_issues: Array.isArray(m.issues) ? m.issues : null,
    richResults_verdict: rr.verdict ?? null,
    richResults_detectedItems: Array.isArray(rr.detectedItems) ? rr.detectedItems : null,
    amp_verdict: amp.verdict ?? null,
    inspectionResultLink: result?.inspectionResult?.inspectionResultLink ?? null,
  };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const property = process.env.GSC_PROPERTY || '';
  const rows = stratify(liveRows());
  const planned = LIMIT ? rows.slice(0, LIMIT) : rows;

  // resume: whatever a previous run already paid for stays paid for
  let prior = { rows: [], raw: [] };
  if (existsSync(OUT)) {
    try { prior = JSON.parse(readFileSync(OUT, 'utf8')); } catch { /* start clean */ }
  }
  const have = new Set((prior.rows || []).map((r) => r.url));
  const todo = planned.filter((r) => !have.has(property.replace(/^sc-domain:/, 'https://') .replace(/\/$/, '') + r.path)
                                   && !have.has('https://livdar.com' + r.path));

  const byFamily = {};
  for (const r of planned) byFamily[r.family] = (byFamily[r.family] || 0) + 1;

  const plan = {
    property_from_env: property || null,
    endpoint: ENDPOINT,
    scope: SCOPE,
    live_urls: rows.length,
    planned_this_run: planned.length,
    already_on_disk: planned.length - todo.length,
    to_inspect: todo.length,
    order: 'round robin across cohort x family x language, so a truncated run covers every stratum',
    concurrency: CONCURRENCY,
    qps: QPS,
    daily_quota_per_property: 2000,
    per_minute_quota: 600,
    families: byFamily,
    output: OUT,
  };

  const cred = googleCredentialsFromEnv();
  const missing = [...cred.missing];
  if (!property) missing.unshift('GSC_PROPERTY');

  if (DRY || missing.length) {
    const why = missing.length
      ? ('cannot call the API: ' + missing.join('; '))
      : 'dry run, nothing was called';
    console.log(JSON.stringify({ ...plan, called: false, why,
      auth_source: cred.source, principal: cred.principal,
      static_key: cred.ignored.length ? cred.ignored : 'not used' }, null, 1));
    process.exit(missing.length && flag('--write') ? 1 : 0);
  }

  const tokens = createTokenSource(() => getAccessToken(cred.credentials, fetch, SCOPE));
  const token = await tokens.get();
  const site = property;

  // THE SITEMAPS ENDPOINT FIRST, because it is one cheap call and it can answer the question
  // before 500 inspections do. webmasters/v3/sites/{site}/sitemaps returns lastSubmitted,
  // lastDownloaded, isPending, warnings and errors per sitemap. If Google has never DOWNLOADED
  // the sitemaps, no per-URL verdict is going to be a surprise, and the fix is upstream of
  // anything the pages themselves do. contents[].indexed is not read: Google deprecated it and
  // it now reports zero regardless, so reading it would manufacture a false negative.
  const smRes = await fetch(
    'https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(site) + '/sitemaps',
    { headers: { authorization: 'Bearer ' + token } });
  const smBody = await smRes.json().catch(() => ({}));
  const sitemaps = smRes.ok
    ? (smBody.sitemap || []).map((x) => ({
        path: x.path, type: x.type, lastSubmitted: x.lastSubmitted ?? null,
        lastDownloaded: x.lastDownloaded ?? null, isPending: x.isPending ?? null,
        isSitemapsIndex: x.isSitemapsIndex ?? null,
        warnings: x.warnings ?? null, errors: x.errors ?? null,
        submitted_urls: (x.contents || []).reduce(
          (n, c) => n + Number(c.submitted || 0), 0) || null,
      }))
    : { status: smRes.status, error: smBody?.error?.message || 'no message' };
  const out = { ...plan, called: true, inspected_at: new Date().toISOString(),
                sitemaps_in_search_console: sitemaps,
                rows: prior.rows || [], raw: prior.raw || [], errors: [] };
  let stopped = null;

  // One shared pacer: each request takes the next slot 1000/QPS ms after the previous one, so
  // the total rate stays at --qps however many workers are waiting.
  let nextSlot = Date.now();
  const pace = async () => {
    const at = Math.max(Date.now(), nextSlot);
    nextSlot = at + Math.round(1000 / QPS);
    await sleep(at - Date.now());
  };
  const inspect = async (url, meta) => {
    await pace();
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { authorization: 'Bearer ' + (await tokens.get()), 'content-type': 'application/json' },
      body: JSON.stringify({ inspectionUrl: url, siteUrl: site,
                             languageCode: meta.locale || 'en-US' }),
    });
  };
  let cursor = 0;
  let done = 0;
  const worker = async () => {
    while (!stopped && cursor < todo.length) {
      const meta = todo[cursor++];
      const url = 'https://livdar.com' + meta.path;
      let res = await inspect(url, meta);
      // An expired token is the one 401 a retry fixes: re-mint once and ask again.
      if (res.status === 401) {
        await tokens.refresh();
        res = await inspect(url, meta);
      }
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = { url, status: res.status, error: body?.error?.message || 'no message',
                      reason: body?.error?.status || null };
        out.errors.push(err);
        // Quota and permission are the two that must stop the run rather than be retried: one
        // cannot succeed today and the other cannot succeed at all until a person changes a
        // setting. A 401 that survived a fresh token is a permission too. Everything else is
        // recorded and the run continues.
        if (res.status === 429 || res.status === 403 || res.status === 401) stopped = stopped || err;
        continue;
      }
      out.raw.push({ url, response: body });            // verbatim, before anything reads it
      out.rows.push(flatten(url, meta, body));
      if (++done % 25 === 0) {
        writeFileSync(OUT + '.tmp', JSON.stringify(out, null, 1));
        renameSync(OUT + '.tmp', OUT);
        process.stderr.write(`  inspected ${out.rows.length}/${planned.length}, token minted ${tokens.mints}x\n`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, todo.length) }, worker));

  out.stopped_early = stopped;
  out.inspected_total = out.rows.length;
  out.token_mints = tokens.mints;
  writeFileSync(OUT + '.tmp', JSON.stringify(out, null, 1));
  renameSync(OUT + '.tmp', OUT);
  console.log(JSON.stringify({ inspected: out.rows.length, errors: out.errors.length,
                               stopped_early: stopped,
                               sitemaps_in_search_console: sitemaps,
                               output: OUT }, null, 1));
  if (stopped) process.exit(2);
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  main().catch((e) => { console.error(String(e?.stack || e)); process.exit(1); });
}

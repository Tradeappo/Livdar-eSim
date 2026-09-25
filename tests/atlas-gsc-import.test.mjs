// The import that was never wired, proved against a stand-in for Google.
//
// lib/atlas/gsc-cohort.js held the metrics, the six dimensions and the rule that
// an absent number is unknown rather than zero, and nothing outside the tests
// imported it. Every cohort read null for indexation, the gate refused a verdict,
// and that looked exactly like a cohort waiting for data rather than a pipeline
// that did not exist.
//
// Credentials are still missing, and that is reported rather than worked around.
// What can be established without them is everything else: that the query is
// made, that a row matches a published page by path, that the numbers land on
// the right dimensions, that a page Search Console did not return is recorded as
// shown to nobody rather than as unknown, and that indexation is not inferred
// from an impression.

import test from 'node:test';
import assert from 'node:assert/strict';
import { run as gscImport, rowFor } from '../scripts/atlas/gsc-import.mjs';
import { check as gscCheck } from '../scripts/gsc-check.mjs';
import { DIMENSIONS, METRICS, UNKNOWN, positions, POSITION_BUCKETS } from '../lib/atlas/gsc-cohort.js';
import { generateKeyPairSync } from 'node:crypto';

// A throwaway key generated here rather than a placeholder string, so the test
// walks the real signing path. A service account key arrives from the
// environment with its newlines escaped more often than not, so it is escaped
// here too: that unescaping is a line of production code and this is the only
// thing that exercises it.
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
const ESCAPED_KEY = privateKey.replace(/\n/g, '\\n');

const CREDS = {
  GSC_PROPERTY: 'sc-domain:example.test',
  GSC_CLIENT_EMAIL: 'importer@example.iam.gserviceaccount.com',
  GSC_PRIVATE_KEY: ESCAPED_KEY,
};

// A stand-in for Google that answers the token call and one page level query.
function fakeGoogle({ rows = [], siteStatus = 200 } = {}) {
  const calls = [];
  return {
    calls,
    fetch: async (url, opts) => {
      calls.push(String(url));
      if (String(url).includes('oauth2.googleapis.com/token')) {
        return { ok: true, status: 200, json: async () => ({ access_token: 'token-for-the-test' }) };
      }
      if (/webmasters\/v3\/sites\/[^/]+$/.test(String(url))) {
        return { ok: siteStatus === 200, status: siteStatus, json: async () => (siteStatus === 200 ? { permissionLevel: 'siteOwner' } : { error: { message: 'User does not have sufficient permission.' } }) };
      }
      assert.ok(String(url).includes('searchAnalytics/query'), 'unexpected call ' + url);
      const body = JSON.parse(opts.body);
      assert.deepEqual(body.dimensions, ['page'], 'the import has to ask at page level or it cannot match a page');
      return { ok: true, status: 200, json: async () => ({ rows }) };
    },
  };
}

test('without credentials the import refuses and names every missing one', async () => {
  const r = await gscImport({ env: {}, fetchImpl: async () => { throw new Error('the import called Google without credentials'); } });
  assert.equal(r.imported, false);
  assert.ok(r.missing.includes('GSC_PROPERTY'));
  assert.ok(r.missing.includes('GSC_CLIENT_EMAIL'));
  assert.ok(r.missing.includes('GSC_PRIVATE_KEY'));
  // And the rows it did build are unknown rather than zero, which is the rule
  // the whole module exists to protect.
  assert.equal(r.pages, 500);
  for (const c of r.report) {
    assert.equal(c.measurable, false);
    assert.equal(c.indexationRate, UNKNOWN);
    assert.equal(c.impressions, UNKNOWN);
  }
});

test('every page row carries all six dimensions before anything is imported', async () => {
  const r = await gscImport({ env: {}, fetchImpl: async () => { throw new Error('no'); } });
  const sample = r.rows.filter((_, i) => i % 37 === 0);
  assert.ok(sample.length > 8);
  for (const row of sample) {
    for (const d of DIMENSIONS) {
      if (d === 'destination') continue; // a calculator has no destination and says so
      assert.ok(row[d], row.key + ' has no ' + d);
    }
    assert.ok(row.key.startsWith('/'), 'the key is a path so a Search Console row can match it: ' + row.key);
    assert.equal(row.published, 1);
  }
  // The shape is the one the report reads, not an invention of the importer.
  for (const m of METRICS) assert.ok(m in sample[0], 'the row has no ' + m);
});

test('a page level response lands on the right page with every metric', async () => {
  const first = rowFor({ url: 'https://livdar.com/en/cost-of-living/japan/', cohort: '001', surface: 'move', family: 'cost-of-living.country', language: 'en', originMarket: 'en-US', destination: 'JP', keyword: 'cost of living in japan' });
  const g = fakeGoogle({ rows: [
    { keys: [first.url], impressions: 1200, clicks: 84, ctr: 0.07, position: 6.4 },
    { keys: ['https://livdar.com/en/not-a-published-page/'], impressions: 9, clicks: 0, ctr: 0, position: 44 },
  ] });
  const r = await gscImport({ env: CREDS, fetchImpl: g.fetch });
  assert.equal(r.imported, true);
  assert.equal(r.credentialShape, 'GSC_CLIENT_EMAIL and GSC_PRIVATE_KEY');
  assert.equal(r.matched, 1);
  assert.deepEqual(r.unmatchedFromSearchConsole, ['/en/not-a-published-page/']);

  const jp = r.rows.find((x) => x.key === '/en/cost-of-living/japan/');
  assert.equal(jp.impressions, 1200);
  assert.equal(jp.clicks, 84);
  assert.equal(jp.ctr, 0.07);
  assert.equal(jp.position, 6.4);
  assert.ok(jp.source.includes('page level'));

  // A page the window covered and Search Console did not return earned nothing,
  // and that is a measurement rather than a gap.
  const quiet = r.rows.find((x) => x.key !== '/en/cost-of-living/japan/');
  assert.equal(quiet.impressions, 0);
  assert.equal(quiet.clicks, 0);
  assert.equal(quiet.position, UNKNOWN, 'a page with no impressions has no average position');
  assert.ok(quiet.source.includes('shown to nobody'));

  // Indexation is never inferred from an impression: a page can be indexed and
  // never shown, and Search Analytics cannot tell you which.
  for (const row of r.rows) assert.equal(row.indexed, UNKNOWN);
  for (const c of r.report) assert.equal(c.indexationRate, UNKNOWN);
  // Impressions and clicks are known for every page, so those aggregate.
  const cohort001 = r.report.find((c) => c.cohort === '001');
  assert.equal(cohort001.impressions, 1200);
  assert.equal(cohort001.clicks, 84);
});

test('configured, authorised and granted are three answers, not one', async () => {
  const none = await gscCheck({}, async () => { throw new Error('no'); });
  assert.equal(none.configured, false);
  assert.ok(none.why.startsWith('not configured:'));
  assert.equal(none.privateKey, 'absent');

  const refused = await gscCheck(CREDS, fakeGoogle({ siteStatus: 403 }).fetch);
  assert.equal(refused.configured, true);
  assert.equal(refused.authorised, true, 'a valid token and no access is the case that has to be distinguishable');
  assert.equal(refused.granted, false);
  assert.ok(refused.why.includes('403'));
  // The remedy names the account to add and where to add it, because that is a
  // Search Console change and not a Google Cloud one.
  assert.ok(refused.why.includes('importer@example.iam.gserviceaccount.com'));
  assert.ok(refused.why.includes('sc-domain:example.test'));

  const ok = await gscCheck(CREDS, fakeGoogle({}).fetch);
  assert.equal(ok.granted, true);
  assert.equal(ok.permission, 'siteOwner');
  assert.equal(ok.why, 'connected');
  // And never the key itself, in any branch.
  const secret = privateKey.split('\n')[1];
  for (const r of [none, refused, ok]) assert.ok(!JSON.stringify(r).includes(secret), 'the key itself reached the report');
});

test('where the pages rank is three buckets and two kinds of unknown', () => {
  // An average position over two hundred pages hides the only thing worth
  // knowing. Two cohorts can share an average of forty and one of them can have
  // thirty pages on the first page of results while the other has none.
  assert.deepEqual(POSITION_BUCKETS.map((b) => b.key), ['top10', 'top20', 'top100']);
  const p = positions([
    { position: 4, impressions: 900 },
    { position: 10, impressions: 40 },
    { position: 15, impressions: 12 },
    { position: 101, impressions: 1 },
    { position: UNKNOWN, impressions: 0 },
    { position: UNKNOWN, impressions: UNKNOWN },
  ]);
  assert.equal(p.top10, 2, 'position ten is on the first page of results');
  assert.equal(p.top20, 3);
  assert.equal(p.top100, 3);
  assert.equal(p.ranked, 4);
  // The two unknowns are different facts and are never added together. A page
  // Search Console covered and did not return earned nothing; a page nobody
  // imported is not measured at all.
  assert.equal(p.notShown, 1);
  assert.equal(p.unknown, 1);
});

test('the import reports every surface separately', async () => {
  const r = await gscImport({ env: {}, fetchImpl: async () => { throw new Error('no'); } });
  // Without credentials there is no per surface block to report, and that is the
  // point: it is not an empty one.
  assert.equal(r.imported, false);
  assert.equal(r.bySurface, undefined);
});

// ---- the other half of the measurement: behaviour, from GA4 ----------------
//
// Same shape as the Search Console import above and the same rule: no credentials,
// so it refuses and names what is missing rather than returning zeros. What can be
// established without them is the arithmetic, and two of the rates are deliberate
// rather than conventional.

test('without credentials the GA4 import refuses and names what is missing', async () => {
  const { run: ga4 } = await import('../scripts/atlas/ga4-import.mjs');
  const r = await ga4({ env: {}, fetchImpl: async () => { throw new Error('the import called Google without credentials'); } });
  assert.equal(r.imported, false);
  assert.ok(r.missing.includes('GA4_PROPERTY_ID'));
  assert.equal(r.pages, 500);
  assert.equal(r.bySurface, null, 'an unmeasured surface block is worse than none');
  // Every row is unknown rather than zero, which is the rule the whole pipeline
  // rests on.
  for (const row of r.rows.slice(0, 20)) {
    assert.equal(row.sessions, null);
    assert.equal(row.events, null);
    assert.equal(row.source, 'not imported');
    // And the dimensions are attached before anything is imported, so a report
    // never re-derives a surface from a URL.
    for (const k of ['cohort', 'surface', 'family', 'language', 'market']) assert.ok(row[k], row.path + ' has no ' + k);
  }
});

test('the two rates that are not conventional are the ones the brief asks for', async () => {
  const { summarise } = await import('../scripts/atlas/ga4-import.mjs');
  const rows = [{
    path: '/en/tools/x/', surface: 'tools', importedAt: 'now', sessions: 200, users: 150, engagedSessions: 120,
    engagementSeconds: 6000,
    // A hundred readers reached the tool, forty touched it, ten finished.
    events: { page_view: 200, cta_click: 30, internal_cta_click: 18, outbound_click: 4, tool_view: 100, tool_start: 40, tool_complete: 10, notify_signup: 2, select_plan: 0, begin_checkout: 0, checkout_intent: 1 },
  }];
  const s = summarise(rows).tools;
  assert.equal(s.sessions, 200);
  assert.equal(s.engagementRate, 0.6);
  assert.equal(s.averageEngagementSeconds, 30);
  assert.equal(s.ctaClickRate, 0.15);
  assert.equal(s.downstreamRate, 0.09);
  // Over views and not over sessions. A tool below the fold that nobody scrolled
  // to has not been offered, and dividing by sessions would report 0.2 here and
  // turn a placement problem into an interest problem.
  assert.equal(s.toolStartRate, 0.4);
  assert.notEqual(s.toolStartRate, 40 / 200);
  // Over starts, which only means anything because tool_complete stopped firing
  // on mount.
  assert.equal(s.toolCompletionRate, 0.25);
  assert.deepEqual(s.commercialIntent, { notifySignup: 2, selectPlan: 0, beginCheckout: 0, checkoutIntent: 1 });

  // A surface with nothing imported says so rather than reading as a surface that
  // failed.
  const none = summarise([{ path: '/en/a/', surface: 'move', importedAt: null }]).move;
  assert.equal(none.measured, 0);
  assert.ok(none.why.includes('no GA4 data'));
  assert.equal(none.sessions, undefined, 'an unmeasured surface must not report a zero');
});

test('a token is minted for the API it is going to be used against', async () => {
  // Two APIs share the token path now. A token minted for the Search Console
  // scope fails against the Data API with a message that names neither.
  const { createServiceAccountJwt } = await import('../scripts/lib/google-search-console.mjs');
  const claim = (jwt) => JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
  const creds = { client_email: 'a@b.iam.gserviceaccount.com', private_key: privateKey };
  assert.match(claim(createServiceAccountJwt(creds)).scope, /webmasters\.readonly$/);
  assert.match(claim(createServiceAccountJwt(creds, Math.floor(Date.now() / 1000), 'https://www.googleapis.com/auth/analytics.readonly')).scope, /analytics\.readonly$/);
});

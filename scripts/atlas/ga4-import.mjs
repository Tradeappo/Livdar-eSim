// Behaviour, per surface, from GA4.
//
//   node scripts/atlas/ga4-import.mjs
//   node scripts/atlas/ga4-import.mjs --write --days 28
//
// The other half of the measurement the five hundred page test needs. Search
// Console says whether a page was found; this says whether it did anything once
// somebody arrived, which is the half the experiment is actually about: a data
// page that ranks and moves nobody has answered the question with a no.
//
// It is built and it does not run, for one reason that is named rather than
// implied: there are no GA4 credentials in this project. The events reach the
// dataLayer, which is verified in a browser on production, and reading them back
// out needs the Data API, which needs a service account with Viewer on the
// property. Until then this refuses and says which credential is absent, exactly
// as scripts/atlas/gsc-import.mjs does, because a pipeline that returns zeros
// when it cannot read is worse than one that returns nothing.
//
// Two definitions here are deliberate rather than conventional, and both are
// there because the obvious version measures the wrong thing.
//
// The tool start rate is over tool_view and not over sessions. A tool below the
// fold that nobody scrolled to has not been offered, and dividing by sessions
// turns a placement problem into an interest problem. tool_view fires on
// intersection for exactly this reason.
//
// The tool completion rate is over tool_start. That only became meaningful once
// tool_complete stopped firing on mount: every mode has a valid default state, so
// the first version pushed a completion before the reader touched anything and
// the rate read as one.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { build as launchPackage } from './launch-package.mjs';
import { getAccessToken, googleCredentialsFromEnv } from '../lib/google-search-console.mjs';

const ROOT = new URL('../../', import.meta.url);
const API = 'https://analyticsdata.googleapis.com/v1beta';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

// What the report asks GA4 for. Sessions and engagement are GA4's own; the rest
// are the events this site pushes, counted per page path so they can be joined to
// the registry.
export const METRICS = ['sessions', 'totalUsers', 'engagedSessions', 'engagementRate', 'userEngagementDuration', 'eventCount'];
export const EVENTS = ['page_view', 'cta_click', 'internal_cta_click', 'outbound_click', 'tool_view', 'tool_start', 'tool_complete', 'notify_signup', 'select_plan', 'begin_checkout', 'checkout_intent'];

const pathOf = (url) => { try { return new URL(url).pathname; } catch { return url; } };
const rate = (a, b) => (b > 0 ? Math.round((a / b) * 10000) / 10000 : null);

// An empty row, on the same rule the Search Console import follows: an absent
// number is unknown and never zero. A page GA4 returned with no sessions really
// had none, and a page nobody imported is not measured at all.
export const emptyRow = (path) => ({
  path,
  sessions: null,
  users: null,
  engagedSessions: null,
  engagementRate: null,
  engagementSeconds: null,
  events: null,
  importedAt: null,
  source: 'not imported',
});

export async function report({ property, token, days, dimensions, metrics, dimensionFilter = null, fetchImpl = fetch, now = new Date() }) {
  const end = new Date(now.getTime() - 86400000);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  const iso = (d) => d.toISOString().slice(0, 10);
  const r = await fetchImpl(API + '/properties/' + String(property).replace(/^properties\//, '') + ':runReport', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: iso(start), endDate: iso(end) }],
      dimensions: dimensions.map((name) => ({ name })),
      metrics: metrics.map((name) => ({ name })),
      dimensionFilter,
      limit: 100000,
    }),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('GA4 refused the report (' + r.status + '): ' + (body.error?.message || 'no message'));
  return { rows: body.rows || [], range: { startDate: iso(start), endDate: iso(end) } };
}

export async function run({ days = 28, env = process.env, fetchImpl = fetch, now = new Date() } = {}) {
  const pkg = launchPackage();
  const rows = pkg.rows.map((p) => ({
    ...emptyRow(pathOf(p.url)),
    url: p.url, cohort: p.cohort, surface: p.surface, family: p.family,
    language: p.language, market: p.originMarket, destination: p.destination, entity: p.entity ?? null,
  }));
  const byPath = new Map(rows.map((r) => [r.path, r]));

  const property = env.GA4_PROPERTY_ID || null;
  const account = googleCredentialsFromEnv(env);
  if (!property || !account.credentials) {
    const missing = [property ? null : 'GA4_PROPERTY_ID', ...(account.missing || [])].filter(Boolean);
    return {
      imported: false,
      why: 'GA4 is not configured, so nothing was imported: ' + missing.join(', ')
        + '. The events do reach the dataLayer, which is verified on production; reading them back needs a service account with Viewer on the property.',
      missing,
      pages: rows.length,
      rows,
      bySurface: null,
    };
  }

  const token = await getAccessToken(account.credentials, fetchImpl, SCOPE);

  // Sessions and engagement per page.
  const sessions = await report({ property, token, days, dimensions: ['pagePath'], metrics: METRICS.filter((m) => m !== 'eventCount'), fetchImpl, now });
  for (const row of sessions.rows) {
    const r = byPath.get(row.dimensionValues[0].value);
    if (!r) continue;
    const v = row.metricValues.map((x) => Number(x.value));
    r.sessions = v[0]; r.users = v[1]; r.engagedSessions = v[2];
    r.engagementRate = Math.round(v[3] * 10000) / 10000;
    r.engagementSeconds = Math.round(v[4]);
    r.importedAt = new Date().toISOString();
    r.source = 'GA4 runReport, pagePath, ' + sessions.range.startDate + ' to ' + sessions.range.endDate;
  }

  // Event counts per page and event name.
  const events = await report({
    property, token, days, dimensions: ['pagePath', 'eventName'], metrics: ['eventCount'], fetchImpl, now,
    dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: EVENTS } } },
  });
  for (const row of events.rows) {
    const r = byPath.get(row.dimensionValues[0].value);
    if (!r) continue;
    r.events = r.events || {};
    r.events[row.dimensionValues[1].value] = Number(row.metricValues[0].value);
  }
  // A page GA4 returned sessions for and no event of a kind had none of that kind,
  // which is a measurement. A page it returned nothing at all for is unknown.
  for (const r of rows) {
    if (!r.importedAt) continue;
    r.events = r.events || {};
    for (const e of EVENTS) if (r.events[e] == null) r.events[e] = 0;
  }

  return {
    imported: true,
    property,
    credentialShape: account.shape,
    window: sessions.range,
    pages: rows.length,
    measured: rows.filter((r) => r.importedAt).length,
    rows,
    bySurface: summarise(rows),
  };
}

// The rates the brief asks for, per surface, and never over a denominator of zero.
export function summarise(rows) {
  const out = {};
  for (const surface of [...new Set(rows.map((r) => r.surface))].sort()) {
    const mine = rows.filter((r) => r.surface === surface);
    const measured = mine.filter((r) => r.importedAt);
    if (!measured.length) { out[surface] = { pages: mine.length, measured: 0, why: 'no GA4 data imported for any page of this surface' }; continue; }
    const sum = (f) => measured.reduce((t, r) => t + (f(r) || 0), 0);
    const ev = (name) => sum((r) => (r.events || {})[name]);
    const sessions = sum((r) => r.sessions);
    out[surface] = {
      pages: mine.length,
      measured: measured.length,
      sessions,
      users: sum((r) => r.users),
      engagedSessions: sum((r) => r.engagedSessions),
      engagementRate: rate(sum((r) => r.engagedSessions), sessions),
      averageEngagementSeconds: sessions ? Math.round(sum((r) => r.engagementSeconds) / sessions) : null,
      ctaClicks: ev('cta_click'),
      ctaClickRate: rate(ev('cta_click'), sessions),
      downstreamRate: rate(ev('internal_cta_click'), sessions),
      outboundRate: rate(ev('outbound_click'), sessions),
      toolViews: ev('tool_view'),
      // Over views, not sessions: a tool nobody scrolled to has not been offered.
      toolStartRate: rate(ev('tool_start'), ev('tool_view')),
      // Over starts, which only means anything because tool_complete no longer
      // fires on mount.
      toolCompletionRate: rate(ev('tool_complete'), ev('tool_start')),
      commercialIntent: {
        notifySignup: ev('notify_signup'),
        selectPlan: ev('select_plan'),
        beginCheckout: ev('begin_checkout'),
        checkoutIntent: ev('checkout_intent'),
      },
    };
  }
  return out;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const i = process.argv.indexOf('--days');
  const r = await run({ days: i >= 0 ? Number(process.argv[i + 1]) : 28 });
  if (r.imported && process.argv.includes('--write')) {
    mkdirSync(new URL('data/atlas/ga4/', ROOT), { recursive: true });
    const file = 'data/atlas/ga4/pages-' + r.window.endDate + '.json';
    writeFileSync(new URL(file, ROOT), JSON.stringify({ property: r.property, window: r.window, importedAt: new Date().toISOString(), pages: r.rows }, null, 1) + '\n');
    console.log('wrote ' + file);
  }
  console.log(JSON.stringify({ ...r, rows: undefined }, null, 1));
  if (!r.imported && process.argv.includes('--ci')) process.exit(1);
}

// Search Console, per published Atlas page, in the shape the cohort report reads.
//
//   node scripts/atlas/gsc-import.mjs                report only
//   node scripts/atlas/gsc-import.mjs --write        write the measured file
//   node scripts/atlas/gsc-import.mjs --days 28
//
// lib/atlas/gsc-cohort.js has held the metrics, the six dimensions and the rule
// that an absent number is unknown rather than zero since before the launch. It
// had no caller. The launch package built the page rows and the report could
// split them, but nothing ever put a Search Console number into one, so every
// cohort read null for indexation and the gate correctly refused a verdict.
//
// This is the missing half: one query per window at page level, matched to the
// published pages by path, and written with every dimension attached so the
// report can be cut by cohort, surface, family, language, market or destination
// without parsing a URL afterwards.
//
// What it will not do is fill a gap with a zero. Search Console returns rows
// only for pages that had at least one impression, so a published page absent
// from the response has impressions 0 and clicks 0 - that much is a real
// measurement, because the query covered it and it earned nothing. Indexation
// is different: the Search Analytics API cannot say whether a page is indexed,
// only whether it was shown. So `indexed` stays unknown here and is marked as
// coming from a source this import does not have, rather than being inferred
// from an impression. A page can be indexed and never shown.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { build as launchPackage } from './launch-package.mjs';
import { emptyRow, cohortReport, importGaps, DIMENSIONS } from '../../lib/atlas/gsc-cohort.js';
import { dateRange, getAccessToken, querySearchAnalytics, serviceAccountFromEnv } from '../lib/google-search-console.mjs';

const ROOT = new URL('../../', import.meta.url);

const pathOf = (url) => { try { return new URL(url).pathname; } catch { return url; } };

// The dimensions travel with the row so the report never has to re-derive them
// from a URL. Deriving `surface` from a path means knowing that `zonas` is the
// Spanish Areas segment, and the page model already knows.
export function rowFor(page) {
  return {
    ...emptyRow(pathOf(page.url)),
    url: page.url,
    cohort: page.cohort,
    surface: page.surface,
    family: page.family,
    language: page.language,
    market: page.originMarket,
    destination: page.destination,
    entity: page.entity ?? null,
    keyword: page.keyword,
    published: 1,
  };
}

export async function run({ days = 28, env = process.env, fetchImpl = fetch, now = new Date() } = {}) {
  const pkg = launchPackage();
  const rows = pkg.rows.map(rowFor);
  const byPath = new Map(rows.map((r) => [r.key, r]));

  const property = env.GSC_PROPERTY || null;
  const account = serviceAccountFromEnv(env);
  if (!property || !account.credentials) {
    const missing = [property ? null : 'GSC_PROPERTY', ...(account.missing || [])].filter(Boolean);
    // Not an error and not a silent pass. The file is not written, the rows stay
    // unknown, and the reason is named.
    return {
      imported: false,
      why: 'Search Console is not configured, so nothing was imported: ' + missing.join(', ') + '. Run node scripts/gsc-check.mjs for the remedy.',
      missing,
      pages: rows.length,
      rows,
      report: cohortReport(rows),
      gaps: importGaps(rows).slice(0, 8),
    };
  }

  const token = await getAccessToken(account.credentials, fetchImpl);
  const range = dateRange(days, new Date(now.getTime() - 3 * 86400000));
  const gsc = await querySearchAnalytics({
    accessToken: token, property, ...range.current, dimensions: ['page'], fetchImpl,
  });

  let matched = 0;
  const unmatched = [];
  for (const r of gsc) {
    const key = pathOf((r.keys || [])[0] || '');
    const row = byPath.get(key);
    if (!row) { unmatched.push(key); continue; }
    matched++;
    row.impressions = r.impressions ?? 0;
    row.clicks = r.clicks ?? 0;
    row.ctr = r.ctr == null ? null : Math.round(r.ctr * 10000) / 10000;
    row.position = r.position == null ? null : Math.round(r.position * 100) / 100;
    row.importedAt = new Date().toISOString();
    row.source = 'Search Console searchAnalytics, page level, ' + range.current.startDate + ' to ' + range.current.endDate;
  }
  // A published page the query covered and that returned no row earned nothing,
  // which is a measurement. Indexation is not, and stays unknown.
  for (const row of rows) {
    if (row.importedAt) continue;
    row.impressions = 0;
    row.clicks = 0;
    row.ctr = 0;
    row.position = null;
    row.importedAt = new Date().toISOString();
    row.source = 'Search Console returned no row for this page in the window, so it was shown to nobody';
  }

  return {
    imported: true,
    property,
    credentialShape: account.shape,
    window: range.current,
    pages: rows.length,
    matched,
    unmatchedFromSearchConsole: unmatched.slice(0, 20),
    indexedNote: 'indexed stays unknown: the Search Analytics API reports impressions, not index state. The Pages report is a separate import and is not wired yet.',
    rows,
    report: cohortReport(rows),
    gaps: importGaps(rows).slice(0, 8),
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const i = process.argv.indexOf('--days');
  const r = await run({ days: i >= 0 ? Number(process.argv[i + 1]) : 28 });
  if (r.imported && process.argv.includes('--write')) {
    mkdirSync(new URL('data/atlas/gsc/', ROOT), { recursive: true });
    const file = 'data/atlas/gsc/pages-' + r.window.endDate + '.json';
    writeFileSync(new URL(file, ROOT), JSON.stringify({
      property: r.property, window: r.window, importedAt: new Date().toISOString(),
      dimensions: DIMENSIONS, note: r.indexedNote, pages: r.rows,
    }, null, 1) + '\n');
    console.log('wrote ' + file);
  }
  console.log(JSON.stringify({ ...r, rows: undefined }, null, 1));
  if (!r.imported && process.argv.includes('--ci')) process.exit(1);
}

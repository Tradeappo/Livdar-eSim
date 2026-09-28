// One dataset for the 500 live pages, joining everything we can measure.
//
// The brief asks for a single monitoring and intelligence system rather than
// isolated reports. This is that join. One row per published page, carrying
// what it targets, what it is worth, how well linked it is, and what Google is
// doing with it.
//
// Google's side is the part that matters and the part we do not have. Search
// Console is not readable from this container: no service account, and the
// Ahrefs project has no Search Console connection either, so the Ahrefs gsc-*
// endpoints answer "No GSC data available" for every date range. So the GSC
// columns are present and null, and `gsc_source` says why for each row. They
// populate the moment a credential exists, without this file changing.
//
// The point of writing it null rather than omitting it: a page with 202,000
// searches of demand and no impressions is the single most important thing to
// know, and it is invisible unless demand and impressions sit in the same row.
//
//   node scripts/atlas/atlas-monitor.mjs --out reports/.../atlas-monitor.json
//
// With a GSC export present it fills the Google columns from it:
//   node scripts/atlas/atlas-monitor.mjs --gsc data/atlas/gsc/pages-latest.json

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { MANIFESTS } from '../../lib/atlas/serve-pages.js';
import { report as internalLinks } from './internal-links.mjs';

const ROOT = new URL('../../', import.meta.url);
const DEMAND = 'reports/ahrefs-export-2026-09-28/organic/published-page-demand-2026-09-28.tsv';

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : fallback;
};

function demandTable(path) {
  const out = new Map();
  if (!existsSync(new URL(path, ROOT))) return out;
  for (const line of readFileSync(new URL(path, ROOT), 'utf8').trim().split('\n').slice(1)) {
    const f = line.split('\t');
    out.set(f[10], {
      keyword: f[0], country: f[1], volume: Number(f[3]) || 0,
      kd: f[4] === '' ? null : Number(f[4]),
      cpc_cents: f[5] === '' ? null : Number(f[5]),
      traffic_potential: f[6] === '' ? null : Number(f[6]),
    });
  }
  return out;
}

// A Search Console pages export, if one exists. Accepts either the shape
// `{ rows: [{ page, impressions, clicks, ctr, position }] }` that
// scripts/atlas/gsc-import.mjs writes, or the raw API `rows` with `keys`.
function gscTable(path) {
  const out = new Map();
  if (!path) return { table: out, source: 'not configured: no Search Console credential in this environment' };
  if (!existsSync(new URL(path, ROOT))) return { table: out, source: 'not found: ' + path };
  const j = JSON.parse(readFileSync(new URL(path, ROOT), 'utf8'));
  for (const r of j.rows || []) {
    const page = r.page || (r.keys && r.keys[0]);
    if (!page) continue;
    const pathOnly = page.startsWith('http') ? new URL(page).pathname : page;
    out.set(pathOnly, {
      impressions: r.impressions ?? null,
      clicks: r.clicks ?? null,
      ctr: r.ctr ?? null,
      position: r.position ?? null,
    });
  }
  return { table: out, source: path + ', ' + out.size + ' rows' };
}

export function build({ gscPath = null, demandPath = DEMAND } = {}) {
  const pages = MANIFESTS.flatMap((m) => JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages || []);
  const demand = demandTable(demandPath);
  const { table: gsc, source: gscSource } = gscTable(gscPath);
  const links = internalLinks({});
  const linkByPath = new Map(links.rows.map((r) => [r.path, r]));

  const rows = pages.map((p) => {
    const d = demand.get(p.path) || {};
    const g = gsc.get(p.path) || {};
    const l = linkByPath.get(p.path) || {};
    return {
      path: p.path,
      surface: p.surface,
      family: p.family,
      locale: p.locale,
      market: p.market,
      cohort: p.cohort,
      entity: String(p.entity),
      // What it targets, and what Ahrefs says that is worth.
      keyword: d.keyword ?? null,
      ahrefs_volume: d.volume ?? null,
      ahrefs_kd: d.kd ?? null,
      ahrefs_cpc_cents: d.cpc_cents ?? null,
      ahrefs_traffic_potential: d.traffic_potential ?? null,
      // Ahrefs has detected no ranking for any Livdar URL except the brand
      // term, so this is false for all 500 and is here to be watched, not
      // because it is interesting today.
      ahrefs_ranks: false,
      // Internal links, which is the one ranking input this project controls.
      internal_links_in: l.in ?? null,
      internal_links_out: l.out ?? null,
      // Google. Null until a credential exists.
      gsc_impressions: g.impressions ?? null,
      gsc_clicks: g.clicks ?? null,
      gsc_ctr: g.ctr ?? null,
      gsc_position: g.position ?? null,
      gsc_indexed: null,
      // The three states worth counting once Google data arrives.
      signal: g.impressions == null ? 'unknown'
        : g.clicks > 0 ? 'clicks'
        : g.impressions > 0 ? 'impressions'
        : 'none',
    };
  });

  const counts = { unknown: 0, none: 0, impressions: 0, clicks: 0 };
  for (const r of rows) counts[r.signal]++;

  const bySurface = {};
  for (const r of rows) {
    const a = bySurface[r.surface] ||= { pages: 0, volume: 0, impressions: 0, clicks: 0, with_impressions: 0 };
    a.pages++; a.volume += r.ahrefs_volume || 0;
    a.impressions += r.gsc_impressions || 0; a.clicks += r.gsc_clicks || 0;
    if (r.gsc_impressions > 0) a.with_impressions++;
  }

  // Demand with nothing to show for it. Once GSC is connected this is the
  // priority list; today it is the whole set, which is the point.
  const demandNoImpressions = rows
    .filter((r) => (r.ahrefs_volume || 0) >= 5000 && !(r.gsc_impressions > 0))
    .sort((a, b) => b.ahrefs_volume - a.ahrefs_volume);

  return {
    captured: new Date().toISOString().slice(0, 10),
    pages: rows.length,
    gsc_source: gscSource,
    ahrefs_organic_keywords_for_livdar: 0,
    signal_counts: counts,
    by_surface: bySurface,
    high_demand_without_impressions: demandNoImpressions.slice(0, 40).map((r) => ({
      volume: r.ahrefs_volume, kd: r.ahrefs_kd, surface: r.surface, market: r.market,
      internal_links_in: r.internal_links_in, path: r.path,
    })),
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = build({ gscPath: arg('gsc'), demandPath: arg('demand', DEMAND) });
  const out = arg('out');
  if (out) {
    mkdirSync(new URL('.', new URL(out, ROOT)), { recursive: true });
    writeFileSync(new URL(out, ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  console.log('pages: ' + r.pages);
  console.log('Google data: ' + r.gsc_source);
  console.log('');
  console.log('signal      pages');
  for (const [k, v] of Object.entries(r.signal_counts)) console.log('  ' + k.padEnd(12) + String(v).padStart(4));
  console.log('');
  console.log('surface    pages   ahrefs volume   impressions   clicks   pages with impressions');
  for (const [k, a] of Object.entries(r.by_surface).sort((x, y) => y[1].volume - x[1].volume)) {
    console.log('  ' + k.padEnd(9) + String(a.pages).padStart(4) + String(a.volume).padStart(16)
      + String(a.impressions).padStart(14) + String(a.clicks).padStart(9) + String(a.with_impressions).padStart(24));
  }
  console.log('');
  console.log('highest demand with no impressions yet (top 10):');
  for (const x of r.high_demand_without_impressions.slice(0, 10)) {
    console.log('  ' + String(x.volume).padStart(7) + '  kd ' + String(x.kd ?? '-').padStart(2)
      + '  links in ' + String(x.internal_links_in).padStart(2) + '  ' + x.path);
  }
  if (out) console.log('\nwritten: ' + out);
}

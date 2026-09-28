// The international check, market by market.
//
// `verify-live.mjs` already fetches every published URL and compares the
// served HTML to the model, hreflang and canonical and html lang included. It
// reports one number for the whole site, which is the right answer to "did
// anything regress" and the wrong answer to "is Germany correct". This groups
// the same rows by market and adds the checks that are not per page: the
// sitemap index, robots.txt, how a missing trailing slash behaves, and
// whether x-default is declared and carried.
//
// It changes nothing. Run it against production:
//
//   NODE_USE_ENV_PROXY=1 node scripts/atlas/international-check.mjs --base https://livdar.com

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { run, readPage } from './verify-live.mjs';
import { MANIFESTS } from '../../lib/atlas/serve-pages.js';

const ROOT = new URL('../../', import.meta.url);

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : fallback;
};

// The markets the brief names, in the order it names them, with the locale
// each one is served in. Origin market and destination country are different
// questions and this file is only about the first: which locale Livdar
// publishes for a reader in that country.
export const MARKETS = [
  { country: 'United States', iso: 'US', locale: 'en' },
  { country: 'United Kingdom', iso: 'GB', locale: 'en' },
  { country: 'Germany', iso: 'DE', locale: 'de' },
  { country: 'France', iso: 'FR', locale: 'fr' },
  { country: 'Spain', iso: 'ES', locale: 'es' },
  { country: 'Italy', iso: 'IT', locale: 'it' },
  { country: 'Netherlands', iso: 'NL', locale: 'nl' },
  { country: 'Poland', iso: 'PL', locale: 'pl' },
  { country: 'Brazil', iso: 'BR', locale: 'pt' },
  { country: 'Japan', iso: 'JP', locale: 'ja' },
  { country: 'Taiwan', iso: 'TW', locale: null },
];

async function fetchText(url) {
  try {
    const r = await fetch(url, { redirect: 'manual' });
    return { status: r.status, location: r.headers.get('location'), body: r.status < 400 ? await r.text() : '' };
  } catch (err) {
    return { status: 0, error: String(err).slice(0, 120), body: '' };
  }
}

export async function check({ base = 'https://livdar.com' } = {}) {
  const models = [];
  for (const m of MANIFESTS) models.push(...(JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages || []));
  const byPath = new Map(models.map((m) => [m.path, m]));

  const live = await run({ base });

  // Site level, checked once.
  const robots = await fetchText(base + '/robots.txt');
  const index = await fetchText(base + '/sitemap.xml');
  const site = {
    robots_txt: { status: robots.status, disallows: [...robots.body.matchAll(/Disallow:\s*(\S+)/g)].map((m) => m[1]), sitemap_declared: /Sitemap:/i.test(robots.body) },
    sitemap_index: { status: index.status, children: [...index.body.matchAll(/<loc>([^<]+)<\/loc>/g)].length },
  };

  // Trailing slash. The site is configured `trailingSlash: true`, so the bare
  // form has to redirect to the slashed one and the slashed one has to answer.
  // Getting this backwards is what a whole sitemap of 404s looks like.
  const slashProbe = [];
  for (const market of MARKETS.filter((m) => m.locale)) {
    const model = models.find((m) => m.locale === market.locale);
    if (!model) continue;
    const bare = await fetchText(base + model.path.replace(/\/$/, ''));
    slashProbe.push({
      market: market.iso,
      path: model.path,
      bare_status: bare.status,
      bare_location: bare.location,
      redirects_to_slash: bare.status === 308 && bare.location === model.path,
    });
  }

  // x-default: declared by the model, and carried by the served page. These
  // were out of step once already, so both sides are read.
  const xDefault = [];
  for (const market of MARKETS.filter((m) => m.locale)) {
    const model = models.find((m) => m.locale === market.locale);
    if (!model) continue;
    const r = await fetchText(base + model.path);
    const got = readPage(r.body);
    xDefault.push({
      market: market.iso,
      path: model.path,
      model_declares: (model.alternates || []).some((a) => a === 'x-default' || a?.hreflang === 'x-default'),
      page_carries: got.hreflang.some((h) => h.toLowerCase() === 'x-default'),
      hreflang_count: got.hreflang.length,
    });
  }

  const markets = MARKETS.map((market) => {
    if (!market.locale) {
      return {
        ...market, pages: 0, ok: 0, problems: 0, surfaces: [], families: [],
        note: 'No locale is published for this market. Taiwan is tracked in the Rank Tracker in zh and the Atlas publishes no zh pages, so there is nothing to serve a Taiwanese reader.',
      };
    }
    const rows = live.rows.filter((r) => r.locale === market.locale);
    const failed = rows.filter((r) => r.problems.length);
    return {
      ...market,
      pages: rows.length,
      ok: rows.length - failed.length,
      problems: failed.length,
      surfaces: [...new Set(rows.map((r) => r.surface))].sort(),
      families: [...new Set(rows.map((r) => r.family))].sort(),
      lang_mismatch: failed.filter((r) => r.problems.some((p) => p.startsWith('html lang'))).length,
      canonical_wrong: failed.filter((r) => r.problems.some((p) => p.startsWith('canonical'))).length,
      hreflang_wrong: failed.filter((r) => r.problems.some((p) => p.startsWith('hreflang'))).length,
      noindex: failed.filter((r) => r.problems.some((p) => p.startsWith('robots'))).length,
      not_in_sitemap: failed.filter((r) => r.problems.includes('not in any sitemap')).length,
      non_200: failed.filter((r) => r.problems.some((p) => p.startsWith('http '))).length,
      failures: failed.slice(0, 5).map((r) => ({ path: r.path, problems: r.problems })),
    };
  });

  return {
    base,
    captured: new Date().toISOString().slice(0, 10),
    total: { urls: live.urls, ok: live.ok, problems: live.failedCount, byProblem: live.byProblem },
    site,
    trailing_slash: slashProbe,
    x_default: xDefault,
    markets,
    unpublished_paths: [...byPath.keys()].length - live.urls,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const base = arg('base', 'https://livdar.com');
  const report = await check({ base });
  const out = arg('out', null);
  if (out) {
    mkdirSync(new URL('.', new URL(out, ROOT)), { recursive: true });
    writeFileSync(new URL(out, ROOT), JSON.stringify(report, null, 2) + '\n');
  }
  console.log(base + ': ' + report.total.ok + ' of ' + report.total.urls + ' clean');
  console.log('');
  console.log('market  locale  pages  ok  lang  canon  hreflang  noindex  sitemap  non200');
  for (const m of report.markets) {
    console.log([
      m.iso.padEnd(6), String(m.locale || '-').padEnd(6), String(m.pages).padStart(5),
      String(m.ok).padStart(3), String(m.lang_mismatch ?? '-').padStart(5),
      String(m.canonical_wrong ?? '-').padStart(6), String(m.hreflang_wrong ?? '-').padStart(9),
      String(m.noindex ?? '-').padStart(8), String(m.not_in_sitemap ?? '-').padStart(8),
      String(m.non_200 ?? '-').padStart(7),
    ].join(' '));
  }
  console.log('');
  console.log('robots.txt: HTTP ' + report.site.robots_txt.status + ', disallow ' + JSON.stringify(report.site.robots_txt.disallows) + ', sitemap declared ' + report.site.robots_txt.sitemap_declared);
  console.log('sitemap index: HTTP ' + report.site.sitemap_index.status + ', ' + report.site.sitemap_index.children + ' children');
  const slashBad = report.trailing_slash.filter((s) => !s.redirects_to_slash);
  console.log('trailing slash: ' + (report.trailing_slash.length - slashBad.length) + ' of ' + report.trailing_slash.length + ' markets redirect bare to slashed');
  const xdOut = report.x_default.filter((x) => x.model_declares !== x.page_carries);
  console.log('x-default: ' + (report.x_default.length - xdOut.length) + ' of ' + report.x_default.length + ' markets agree between model and page');
  if (out) console.log('written: ' + out);
}

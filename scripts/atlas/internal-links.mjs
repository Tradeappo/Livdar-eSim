// The internal link graph of the Atlas, and where it is thin.
//
// Ahrefs Site Audit reports incoming internal links per page, and its crawl of
// 2026-09-27 is useless for the Atlas because 473 of the pages were answering
// 404 at the time. So this reads the graph out of the page models, which is
// where the links come from in the first place and is accurate now.
//
// What it is looking for is not orphans as such. Every Atlas page is in a
// sitemap and reachable from a hub, so nothing is truly orphaned. It is
// looking for the mismatch that matters: a page carrying large search demand
// that almost nothing on the site links to. Internal links are the one ranking
// input this project fully controls, given the backlink profile is spam and
// there is no authority to distribute from outside.
//
// Reports only. It changes nothing.
//
//   node scripts/atlas/internal-links.mjs
//   node scripts/atlas/internal-links.mjs --demand reports/ahrefs-export-2026-09-28/organic/published-page-demand-2026-09-28.tsv

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MANIFESTS } from '../../lib/atlas/serve-pages.js';

const ROOT = new URL('../../', import.meta.url);

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : fallback;
};

export function graph() {
  const pages = MANIFESTS.flatMap((m) => JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages || []);
  const known = new Map(pages.map((p) => [p.path, p]));

  // Every internal href a page emits, from the related links block and from
  // both call to action slots. An anchor href (#tool) is not a link to a page.
  const outgoing = new Map();
  for (const p of pages) {
    const hrefs = [];
    for (const l of p.links || []) if (l.href && !l.href.startsWith('#')) hrefs.push(l.href);
    for (const slot of ['primary', 'secondary']) {
      const c = p.cta && p.cta[slot];
      if (c && c.href && !c.href.startsWith('#')) hrefs.push(c.href);
    }
    outgoing.set(p.path, [...new Set(hrefs)]);
  }

  const incoming = new Map([...known.keys()].map((k) => [k, []]));
  const offAtlas = new Map();
  for (const [from, hrefs] of outgoing) {
    for (const href of hrefs) {
      if (incoming.has(href)) incoming.get(href).push(from);
      else offAtlas.set(href, (offAtlas.get(href) || 0) + 1);
    }
  }

  return { pages, known, outgoing, incoming, offAtlas };
}

function demandFrom(path) {
  if (!path) return new Map();
  const rows = readFileSync(new URL(path, ROOT), 'utf8').trim().split('\n').slice(1);
  const out = new Map();
  for (const line of rows) {
    const f = line.split('\t');
    out.set(f[10], { keyword: f[0], volume: Number(f[3]) || 0, kd: f[4] === '' ? null : Number(f[4]) });
  }
  return out;
}

export function report({ demandPath = null } = {}) {
  const { pages, outgoing, incoming, offAtlas } = graph();
  const demand = demandFrom(demandPath);

  const rows = pages.map((p) => ({
    path: p.path,
    surface: p.surface,
    family: p.family,
    locale: p.locale,
    market: p.market,
    cohort: p.cohort,
    out: outgoing.get(p.path).length,
    in: incoming.get(p.path).length,
    volume: demand.get(p.path)?.volume ?? null,
    kd: demand.get(p.path)?.kd ?? null,
  }));

  const orphans = rows.filter((r) => r.in === 0);
  const thin = rows.filter((r) => r.in <= 1);
  const withDemand = rows.filter((r) => r.volume != null);

  // The list worth acting on: high demand, few links in.
  const underlinked = withDemand
    .filter((r) => r.volume >= 5000 && r.in <= 3)
    .sort((a, b) => b.volume - a.volume);

  const bySurface = {};
  for (const r of rows) {
    const a = bySurface[r.surface] ||= { pages: 0, in: 0, out: 0, orphans: 0, volume: 0 };
    a.pages++; a.in += r.in; a.out += r.out; a.volume += r.volume || 0;
    if (r.in === 0) a.orphans++;
  }
  for (const a of Object.values(bySurface)) {
    a.mean_in = Number((a.in / a.pages).toFixed(2));
    a.mean_out = Number((a.out / a.pages).toFixed(2));
  }

  return {
    captured: new Date().toISOString().slice(0, 10),
    pages: rows.length,
    total_internal_links: [...outgoing.values()].reduce((n, l) => n + l.length, 0),
    links_leaving_the_atlas: [...offAtlas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
      .map(([href, n]) => ({ href, from_pages: n })),
    orphans: orphans.length,
    pages_with_one_or_fewer_incoming: thin.length,
    incoming_distribution: rows.reduce((d, r) => { d[r.in] = (d[r.in] || 0) + 1; return d; }, {}),
    by_surface: bySurface,
    underlinked_high_demand: underlinked,
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = report({ demandPath: arg('demand') });
  const out = arg('out');
  if (out) {
    mkdirSync(new URL('.', new URL(out, ROOT)), { recursive: true });
    writeFileSync(new URL(out, ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  console.log(r.pages + ' pages, ' + r.total_internal_links + ' internal links between them');
  console.log('orphans (0 incoming): ' + r.orphans);
  console.log('1 or fewer incoming: ' + r.pages_with_one_or_fewer_incoming);
  console.log('');
  console.log('incoming link distribution:');
  for (const [n, count] of Object.entries(r.incoming_distribution).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log('  ' + String(n).padStart(3) + ' incoming: ' + String(count).padStart(4) + ' pages');
  }
  console.log('');
  console.log('surface    pages  mean in  mean out  orphans');
  for (const [k, a] of Object.entries(r.by_surface).sort((x, y) => y[1].volume - x[1].volume)) {
    console.log('  ' + k.padEnd(9) + String(a.pages).padStart(4) + String(a.mean_in).padStart(9) + String(a.mean_out).padStart(10) + String(a.orphans).padStart(9));
  }
  if (r.underlinked_high_demand.length) {
    console.log('');
    console.log('high demand and 3 or fewer incoming links:');
    for (const x of r.underlinked_high_demand.slice(0, 20)) {
      console.log('  ' + String(x.volume).padStart(7) + '  in ' + String(x.in).padStart(2) + '  ' + x.surface.padEnd(8) + ' ' + x.path);
    }
  }
  if (out) console.log('\nwritten: ' + out);
}

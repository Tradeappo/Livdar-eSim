// Internal link audit for the published set.
//
//   node scripts/atlas/links.mjs           report
//   node scripts/atlas/links.mjs --ci      exit non zero when the floor is broken
//
// A page that nothing links to is a sitemap entry, not a crawled page. This
// script builds the real link graph from the page models that are actually
// rendered, counts inbound links per published page, and names every page
// under the floor. It is a gate, not a report: while it fails, a lot does not
// grow, which is exactly the stop condition the programme sets for pages
// without internal links.
//
// The hub pages are counted separately. A section hub with no inbound link
// from anywhere on the site is discoverable only through the sitemap, which
// is a weaker signal than a link and is called out under its own heading
// rather than averaged into the page figures.

import { writeFileSync, mkdirSync } from 'node:fs';
import { loadDataset } from '../../lib/atlas/data.js';
import { publishedPages } from '../../lib/atlas/sitemap.js';
import { pathFor } from '../../lib/atlas/taxonomy.js';
import { buildModel } from '../../lib/atlas/model.js';
import { hubModel } from '../../lib/atlas/hub.js';
import { SEGMENTS, LOCALES } from '../../lib/atlas/i18n.js';
import { MIN_INLINKS } from '../../lib/atlas/linking.js';

export function auditLinks(ds = loadDataset()) {
  const isLive = (k) => ds.registry.entries[k] && ds.registry.entries[k].state === 'published';
  const pages = publishedPages(ds);
  const paths = new Map();
  for (const p of pages) paths.set(pathFor(ds, p.page), { key: p.key, page: p.page, inbound: 0, outbound: 0 });

  const hubs = [];
  for (const l of LOCALES) {
    for (const kind of ['city', 'airport']) {
      const path = '/' + l + '/' + SEGMENTS[kind][l] + '/';
      if (!pages.some((p) => p.page.locale === l && (kind === 'airport' ? p.page.family === 'airport' : p.page.family !== 'airport'))) continue;
      hubs.push({ path, locale: l, kind, inbound: 0, outbound: 0 });
      paths.set(path, { key: 'hub:' + l + ':' + kind, hub: true, inbound: 0, outbound: 0 });
    }
  }

  const count = (from, model) => {
    const targets = new Set();
    for (const link of model.links || []) if (link && link.href) targets.add(link.href);
    for (const b of model.breadcrumbs || []) if (b && b.href) targets.add(b.href);
    for (const row of (model.table && model.table.rows) || []) if (row.href) targets.add(row.href);
    const self = paths.get(from);
    for (const t of targets) {
      if (t === from) continue;
      const rec = paths.get(t);
      if (!rec) continue;
      rec.inbound++;
      if (self) self.outbound++;
    }
  };

  for (const p of pages) count(pathFor(ds, p.page), buildModel(ds, p.page, isLive));
  for (const h of hubs) count(h.path, hubModel(ds, h.locale, h.kind, isLive));

  const rows = [...paths.entries()].map(([path, r]) => ({ path, ...r }));
  const pageRows = rows.filter((r) => !r.hub).sort((a, b) => a.inbound - b.inbound);
  const hubRows = rows.filter((r) => r.hub);
  const below = pageRows.filter((r) => r.inbound < MIN_INLINKS);
  const orphanHubs = hubRows.filter((r) => r.inbound === 0);
  const counts = pageRows.map((r) => r.inbound);
  return {
    checkedAt: new Date().toISOString(),
    floor: MIN_INLINKS,
    publishedPages: pageRows.length,
    hubs: hubRows.length,
    minInbound: counts[0] ?? 0,
    medianInbound: counts[Math.floor(counts.length / 2)] ?? 0,
    maxInbound: counts[counts.length - 1] ?? 0,
    belowFloor: below.length,
    belowFloorPaths: below.map((r) => ({ path: r.path, inbound: r.inbound })),
    hubsWithNoInboundLink: orphanHubs.map((r) => r.path),
    hubNote: 'A section hub with no inbound link is reachable only through the sitemap. Linking to it from the site is what turns it into a crawled entry point.',
    pass: below.length === 0,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const out = auditLinks();
  const dir = new URL('../../reports/atlas/', import.meta.url);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL('links-' + out.checkedAt.slice(0, 10) + '.json', dir), JSON.stringify(out, null, 1) + '\n');
  console.log(JSON.stringify(out, null, 1));
  if (process.argv.includes('--ci') && !out.pass) process.exitCode = 1;
}

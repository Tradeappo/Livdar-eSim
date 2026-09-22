// Sitemaps list published pages only. A page that is approved but not
// published, or retired, never appears. Files are split per locale and family
// and capped well below the 50,000 URL limit.

import { LOCALES, SITE_ORIGIN } from './i18n.js';
import { FAMILIES, pathFor, parseKey } from './taxonomy.js';
import { SEGMENTS } from './i18n.js';

const CAP = 40000;

export function publishedPages(ds) {
  return Object.entries(ds.registry.entries)
    .filter(([, e]) => e.state === 'published')
    .map(([key, e]) => ({ key, page: parseKey(key), lastmod: e.lastmod || e.publishedOn || null }))
    .filter((x) => pathFor(ds, x.page));
}

export function sitemapFiles(ds) {
  const pages = publishedPages(ds);
  const files = [];
  LOCALES.forEach((l) => {
    const hubs = [];
    if (pages.some((p) => p.page.locale === l && p.page.family !== 'airport')) hubs.push({ key: 'hub:' + l + ':city', path: '/' + l + '/' + SEGMENTS.city[l] + '/' });
    if (pages.some((p) => p.page.locale === l && p.page.family === 'airport')) hubs.push({ key: 'hub:' + l + ':airport', path: '/' + l + '/' + SEGMENTS.airport[l] + '/' });
    if (hubs.length) files.push({ id: l + '-hub-1', pages: hubs });
  });
  LOCALES.forEach((l) => Object.keys(FAMILIES).forEach((fam) => {
    const list = pages.filter((p) => p.page.locale === l && p.page.family === fam);
    for (let i = 0; i < list.length; i += CAP) files.push({ id: l + '-' + fam + '-' + (i / CAP + 1), pages: list.slice(i, i + CAP) });
  }));
  return files;
}

const xml = (body) => '<?xml version="1.0" encoding="UTF-8"?>\n' + body + '\n';

export function sitemapIndexXml(ds) {
  const files = sitemapFiles(ds);
  return xml('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + files.map((f) => '  <sitemap><loc>' + SITE_ORIGIN + '/sitemap-atlas/' + f.id + '.xml</loc></sitemap>').join('\n') + '\n</sitemapindex>');
}

export function sitemapXml(ds, id) {
  const file = sitemapFiles(ds).find((f) => f.id === id);
  if (!file) return null;
  return xml('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + file.pages.map((p) => '  <url><loc>' + SITE_ORIGIN + (p.path || pathFor(ds, p.page)) + '</loc>' + (p.lastmod ? '<lastmod>' + p.lastmod + '</lastmod>' : '') + '</url>').join('\n') + '\n</urlset>');
}

// Next.js sitemap adapters. Ids look like "atlas-en-city-month-1" so they can
// never be confused with the eSIM ids ("en-destinations").
export function atlasSitemapIds(ds) {
  return sitemapFiles(ds).map((f) => ({ id: 'atlas-' + f.id }));
}

export function atlasSitemapEntries(ds, id, alternatesFor) {
  const file = sitemapFiles(ds).find((f) => 'atlas-' + f.id === id);
  if (!file) return [];
  return file.pages.map((p) => {
    const path = p.path || pathFor(ds, p.page);
    const languages = p.page && alternatesFor ? alternatesFor(p.key) : undefined;
    return {
      url: SITE_ORIGIN + path,
      lastModified: p.lastmod ? new Date(p.lastmod + 'T00:00:00Z') : undefined,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: languages ? { languages } : undefined,
    };
  });
}

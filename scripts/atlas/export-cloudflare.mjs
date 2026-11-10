// Export the EXISTING, published Atlas as structured page models for Cloudflare R2.
//
// WHAT CHANGED AND WHY. The first version of this script crawled a locally running
// Next.js server and saved one HTML file per URL. That migrates the 6,810 pages that
// exist today and nothing beyond them: it is 6,810 files now and 100,000,000 files at
// the target scale, every template change is a full re-crawl, and the Worker becomes a
// file server that cannot answer a URL nobody pre-rendered. So the unit of migration is
// the page MODEL, not its HTML, and the Worker renders the model with the same React
// components this repository already uses (see cloudflare/src/). One template, N models.
//
// Nothing here generates SEO content or decides what is published. It reads the existing
// sources of truth and copies them:
//   - cohort manifests (data/atlas/cohorts/by-group/*) -> the 6,500 approved data pages
//   - the publication registry (data/atlas/registry.json) -> the 123 published legacy pages
//   - lib/atlas/country-hubs.js -> the 178 country hubs
//   - lib/atlas/serve-pages.js languagesServed() -> the 9 language directories
// Every canonical, hreflang cluster, title, description, JSON-LD graph and lastmod is
// computed HERE by the same library functions the Next.js routes call, so the Worker
// cannot drift from production by re-deriving them differently.
//
// Usage:  node scripts/atlas/export-cloudflare.mjs [--out DIR]
// Output: .atlas-cloudflare-export/  (manifest.json, pages/**/model.json, sitemaps/*.xml)
// No network, no Vercel, no DNS, no production writes.

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';

import { pages as cohortPages, alternatesFor, hreflangMapFor, alternatePathsFor, languagesServed } from '../../lib/atlas/serve-pages.js';
import { atlasSchema } from '../../lib/atlas/schema.js';
import { allHubs, hubsFor, hubAlternates, hubModel, TEXT as HUB_TEXT } from '../../lib/atlas/country-hubs.js';
import { sectionOf, sectionHeading, sectionKeys } from '../../lib/atlas/sections.js';
import { isPublished } from '../../lib/markets.js';
import { getLocale } from '../../lib/i18n.js';
import { SITE_URL } from '../../lib/routes.js';
import { loadDataset } from '../../lib/atlas/data.js';
import { publishedPages as legacyPublished } from '../../lib/atlas/sitemap.js';
import { pathFor as legacyPathFor } from '../../lib/atlas/taxonomy.js';
import { atlasModel as legacyModel, atlasAlternates as legacyAlternates } from '../../lib/atlas/serve.js';
import { SEGMENTS as LEGACY_SEGMENT_NAMES } from '../../lib/atlas/i18n.js';
import { COHORT_LIVE_AT, sitemapIds as pageSitemapIds, sitemapEntries as pageSitemapEntries, isDirectorySitemap, isPagesSitemap, directoryEntries, hubEntries } from '../../lib/atlas/sitemap-pages.js';
import { atlasSitemapIds as legacySitemapIds, atlasSitemapEntries as legacySitemapEntries } from '../../lib/atlas/sitemap.js';

const argOf = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const OUT = argOf('out', '.atlas-cloudflare-export');
const absolute = (path) => SITE_URL + path;
const trail = (p) => (p.endsWith('/') ? p : p + '/');

// The object key for a page. Derived from the URL path so the bucket is readable and a
// key collision is impossible: one path, one object. This is the whole route table —
// the Worker asks R2 for the key and a miss IS the 404, so there is no second list of
// routes that can disagree with what was actually uploaded.
export const keyFor = (path) => 'pages' + trail(path) + 'model.json';

/** Open Graph image, identical to lib/seo.js so the head matches production. */
const OG_IMAGE = {
  url: absolute('/img/og-default.png'),
  width: 1200,
  height: 630,
  alt: 'Livdar: cost of living, salaries, holidays and rent, measured across 9 languages and 11 markets',
};

/**
 * The SEO head of a page, in the shape the Worker prints it. Built from the same inputs
 * lib/seo.js buildMetadata() receives, so the staging head and the production head are
 * the same head with one deliberate exception: `robots`, which the Worker overrides to
 * noindex while it serves on workers.dev (see cloudflare/src/render.jsx).
 */
function head({ title, description, path, locale, hreflang, type = 'article' }) {
  return {
    title,
    description,
    canonical: absolute(path),
    locale,
    hreflang,
    og: { title, description, url: absolute(path), siteName: 'Livdar', locale, type, image: OG_IMAGE },
    twitter: { card: 'summary_large_image', title, description, image: OG_IMAGE.url },
  };
}

const records = [];
const seen = new Map();
function add(record) {
  const path = trail(record.path);
  if (seen.has(path)) throw new Error('export: two pages claim ' + path + ' (' + seen.get(path) + ' and ' + record.kind + ')');
  seen.set(path, record.kind);
  records.push({ ...record, path });
}

// ---------------------------------------------------------------------------
// 1. The 6,500 cohort data pages. The model in the manifest IS the page: it carries
//    its own h1, facts, sections, table, FAQ, links, sources, CTA and tool spec. The
//    hreflang cluster is recomputed by alternatesFor() rather than read from the
//    manifest, for the reason that function documents: a cluster split across cohorts
//    would otherwise declare only its own half.
// ---------------------------------------------------------------------------
const liveAt = (cohort) => (COHORT_LIVE_AT[String(cohort)] || '').slice(0, 10) || null;

for (const model of cohortPages()) {
  const hreflang = Object.fromEntries(
    Object.entries(hreflangMapFor(model)).map(([k, v]) => [k, v.startsWith('http') ? v : absolute(v)]),
  );
  add({
    kind: 'data',
    path: model.path,
    locale: model.locale,
    family: model.family,
    surface: model.surface,
    cohort: String(model.cohort),
    lastmod: liveAt(model.cohort),
    head: head({ title: model.title, description: model.description, path: model.path, locale: model.locale, hreflang }),
    alternatePaths: alternatePathsFor(model),
    jsonld: atlasSchema(model),
    model,
  });
}
const cohortCount = records.length;

// ---------------------------------------------------------------------------
// 2. The 123 published legacy pages (/{lang}/cities|staedte/{city}/{month}/). A second,
//    older Atlas generation that is still live and still in the sitemap index, driven by
//    the publication registry rather than by a cohort manifest. It renders through the
//    same AtlasPage component, so only its model source differs. Only `published` is
//    exported: `approved` renders on previews and must not reach a public Worker.
// ---------------------------------------------------------------------------
const ds = loadDataset();
const PRODUCTION_ENV = { VERCEL_ENV: 'production' };
// The legacy generation runs in three locales and two segment kinds; ro publishes none.
const LEGACY_LOCALES = ['en', 'de', 'ro'];
const LEGACY_SEGMENTS = [...new Set(LEGACY_LOCALES.flatMap((l) => ['city', 'airport'].map((k) => LEGACY_SEGMENT_NAMES[k][l])))];
let legacyCount = 0;
for (const row of legacyPublished(ds)) {
  const path = legacyPathFor(ds, row.page);
  if (!path) continue;
  const parts = path.split('/').filter(Boolean);
  const hit = legacyModel(parts[0], parts[1], parts.slice(2), PRODUCTION_ENV, ds);
  if (!hit || !hit.published) continue;
  const alt = legacyAlternates(ds, hit.model);
  add({
    kind: 'data',
    path,
    locale: hit.model.locale,
    family: row.page.family,
    surface: 'legacy',
    cohort: 'legacy',
    lastmod: row.lastmod || null,
    head: head({ title: hit.model.title, description: hit.model.description, path, locale: hit.model.locale, hreflang: alt.languages }),
    alternatePaths: alt.paths,
    jsonld: atlasSchema(hit.model),
    model: hit.model,
  });
  legacyCount += 1;
}

// 2b. The two legacy section hubs (/en/cities/, /de/staedte/). They are listed in the
//     legacy sitemap index and carry the only crawlable link to many of the 123 pages
//     above, so a migration that dropped them would strand that cluster. Same renderer,
//     model built by lib/atlas/hub.js through the same resolver.
let legacyHubCount = 0;
for (const lang of LEGACY_LOCALES) {
  for (const segment of LEGACY_SEGMENTS) {
    const hit = legacyModel(lang, segment, [], PRODUCTION_ENV, ds);
    if (!hit) continue;
    const alt = legacyAlternates(ds, hit.model);
    add({
      kind: 'data',
      path: hit.model.path,
      locale: lang,
      family: 'hub',
      surface: 'legacy-hub',
      cohort: 'legacy',
      lastmod: null,
      head: head({ title: hit.model.title, description: hit.model.description, path: hit.model.path, locale: lang, hreflang: alt.languages }),
      alternatePaths: alt.paths,
      jsonld: atlasSchema(hit.model),
      model: hit.model,
    });
    legacyHubCount += 1;
  }
}

// ---------------------------------------------------------------------------
// 3. The 178 country hubs. hubModel() is pure and reads the cohort pages, so the hub's
//    numbers stay copies of the published pages they link to.
// ---------------------------------------------------------------------------
let hubCount = 0;
for (const [lang, byIso] of Object.entries(allHubs())) {
  for (const hub of Object.values(byIso)) {
    const m = hubModel(lang, hub);
    const hreflang = Object.fromEntries(Object.entries(hubAlternates(hub.iso2)).map(([l, p]) => [l, absolute(p)]));
    if (hreflang.en) hreflang['x-default'] = hreflang.en;
    add({
      kind: 'hub',
      path: hub.path,
      locale: lang,
      family: 'atlas.country-hub',
      surface: 'hub',
      cohort: 'hub',
      lastmod: null,
      // app/[lang]/atlas/[country]/page.jsx calls buildMetadata() with no `type`, and
      // lib/seo.js defaults to 'website'. Declaring 'article' here, as the data pages do,
      // was the one SEO difference the Vercel/Cloudflare diff found.
      head: head({ title: m.title, description: m.description, path: hub.path, locale: lang, hreflang, type: 'website' }),
      alternatePaths: hubAlternates(hub.iso2),
      jsonld: null,
      model: { ...m, name: hub.name, iso2: hub.iso2, slug: hub.slug, home: isPublished(lang) ? '/' + lang + '/' : null },
    });
    hubCount += 1;
  }
}

// ---------------------------------------------------------------------------
// 4. The 9 language directories (/{lang}/atlas/). The crawl path that makes the seven
//    Atlas-only languages reachable by a link rather than only by hreflang. The grouping
//    is computed here exactly as app/[lang]/atlas/page.jsx computes it, so the Worker
//    ships no copy of the rule.
// ---------------------------------------------------------------------------
const langs = languagesServed();
const allCohort = cohortPages();
let directoryCount = 0;
for (const lang of langs) {
  const mine = allCohort.filter((p) => p.locale === lang);
  if (!mine.length) continue;
  const hubs = hubsFor(lang).slice().sort((a, b) => a.name.localeCompare(b.name, lang));
  const onHub = new Set(hubs.flatMap((h) => h.cities.map((p) => p.path)));
  const bySection = new Map();
  for (const page of mine) {
    if (onHub.has(page.path)) continue;
    const key = sectionOf(page.path);
    if (!key) continue;
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(page);
  }
  const sections = sectionKeys().filter((k) => bySection.has(k)).map((key) => ({
    key,
    heading: sectionHeading(lang, key),
    rows: bySection.get(key).sort((a, b) => a.h1.localeCompare(b.h1, lang)).map((p) => ({ path: p.path, h1: p.h1 })),
  }));
  const path = '/' + lang + '/atlas/';
  const hreflang = Object.fromEntries(langs.map((l) => [l, absolute('/' + l + '/atlas/')]));
  if (hreflang.en) hreflang['x-default'] = hreflang.en;
  add({
    kind: 'directory',
    path,
    locale: lang,
    family: 'atlas.directory',
    surface: 'directory',
    cohort: 'directory',
    lastmod: null,
    // Same as the hub: app/[lang]/atlas/page.jsx passes no `type`, so it is 'website'.
    head: head({ title: 'Livdar Atlas', description: 'Livdar Atlas', path, locale: lang, hreflang, type: 'website' }),
    alternatePaths: Object.fromEntries(langs.map((l) => [l, '/' + l + '/atlas/'])),
    jsonld: null,
    model: {
      hubsHeading: HUB_TEXT[lang]?.directory || null,
      hubs: hubs.map((h) => ({ path: h.path, name: h.name })),
      sections,
      others: langs.filter((l) => l !== lang).map((l) => ({ lang: l, href: '/' + l + '/atlas/', endonym: getLocale(l)?.endonym || l })),
      home: isPublished(lang) ? '/' + lang + '/' : null,
    },
  });
  directoryCount += 1;
}

// ---------------------------------------------------------------------------
// 5. Sitemaps. Serialised from the SAME generators app/sitemap.js uses, so the files on
//    Cloudflare list the same URLs with the same lastmod, priority, changefreq and
//    hreflang as the files Vercel serves today. Next.js names its children
//    /sitemap/{id}.xml; the Worker serves /sitemap-atlas/{id}.xml so the two can run
//    side by side without either claiming the other's URL. The production sitemap is
//    NOT touched by this export.
// ---------------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const iso = (d) => (d instanceof Date ? d.toISOString() : d ? new Date(d).toISOString() : null);

function urlsetXml(entries) {
  const body = entries.map((e) => {
    const parts = ['<url>', '<loc>' + esc(e.url) + '</loc>'];
    const lm = iso(e.lastModified);
    if (lm) parts.push('<lastmod>' + lm + '</lastmod>');
    if (e.changeFrequency) parts.push('<changefreq>' + e.changeFrequency + '</changefreq>');
    if (typeof e.priority === 'number') parts.push('<priority>' + e.priority + '</priority>');
    for (const [hl, href] of Object.entries(e.alternates?.languages || {})) {
      parts.push('<xhtml:link rel="alternate" hreflang="' + esc(hl) + '" href="' + esc(href) + '"/>');
    }
    parts.push('</url>');
    return parts.join('');
  }).join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + body + '\n</urlset>\n';
}

const sitemapDeps = { absolute, lastModified: undefined };
const sitemaps = [];

// THE 50,000 URL LIMIT. The sitemap protocol caps a file at 50,000 URLs and 50 MB. Today's
// largest Atlas child holds 1,082 URLs, so nothing is split and every id is the id
// app/sitemap.js published, which Search Console already knows. A family that grows past
// the cap is split into -p2, -p3 ... while the first file KEEPS the original id, so an
// existing sitemap URL never disappears as the Atlas grows. 45,000 leaves headroom for the
// hreflang links, which count against the 50 MB.
export const SITEMAP_CAP = 45_000;
function pushSitemap(id, entries) {
  if (!entries.length) return;
  for (let i = 0, part = 1; i < entries.length; i += SITEMAP_CAP, part += 1) {
    const chunk = entries.slice(i, i + SITEMAP_CAP);
    const chunkId = part === 1 ? id : id + '-p' + part;
    sitemaps.push({ id: chunkId, xml: urlsetXml(chunk), urls: chunk.length });
  }
}

// 5a. The cohort data pages, the directories and the hubs.
for (const { id } of pageSitemapIds()) {
  let entries;
  if (isDirectorySitemap(id)) entries = [...directoryEntries(sitemapDeps), ...hubEntries(sitemapDeps)];
  else if (isPagesSitemap(id)) entries = pageSitemapEntries(id, sitemapDeps);
  else entries = [];
  pushSitemap(id, entries);
}
// 5b. The legacy registry pages.
const legacyAlt = (key) => {
  const row = legacyPublished(ds).find((p) => p.key === key);
  if (!row) return undefined;
  const parts = (legacyPathFor(ds, row.page) || '').split('/').filter(Boolean);
  if (!parts.length) return undefined;
  const hit = legacyModel(parts[0], parts[1], parts.slice(2), PRODUCTION_ENV, ds);
  return hit ? legacyAlternates(ds, hit.model).languages : undefined;
};
for (const { id } of legacySitemapIds(ds)) {
  pushSitemap(id, legacySitemapEntries(ds, id, legacyAlt));
}

const sitemapIndexXml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  // /sitemap/<id>.xml, where app/sitemap.js has always published the children and where
  // Search Console already fetches them. The Worker answers at that URL in production;
  // /sitemap-atlas/<id>.xml is only its staging alias.
  + sitemaps.map((s) => '<sitemap><loc>' + esc(absolute('/sitemap/' + s.id + '.xml')) + '</loc></sitemap>').join('\n')
  + '\n</sitemapindex>\n';

// ---------------------------------------------------------------------------
// 6. Completeness gates. A page that would render wrong is a failure of the export, not
//    something for the Worker to discover in front of a crawler. Nothing is written
//    until every record passes.
// ---------------------------------------------------------------------------
const failures = [];
for (const r of records) {
  const where = r.kind + ' ' + r.path;
  if (!r.head.title) failures.push(where + ': no title');
  if (!r.head.description) failures.push(where + ': no description');
  if (r.head.canonical !== absolute(r.path)) failures.push(where + ': canonical ' + r.head.canonical + ' != ' + absolute(r.path));
  if (!r.locale) failures.push(where + ': no locale');
  if (r.kind === 'data') {
    const m = r.model;
    if (!m.h1) failures.push(where + ': no h1');
    if (!Array.isArray(m.sections)) failures.push(where + ': no sections');
    if (!Array.isArray(m.breadcrumbs) || !m.breadcrumbs.length) failures.push(where + ': no breadcrumbs');
    if (!r.jsonld || !Array.isArray(r.jsonld['@graph'])) failures.push(where + ': no JSON-LD graph');
    // A cluster must point only at URLs that are in this very export, or hreflang
    // sends a crawler to a page the Worker will 404.
    for (const [hl, href] of Object.entries(r.head.hreflang || {})) {
      if (hl === 'x-default') continue;
      const p = href.replace(SITE_URL, '');
      if (!seen.has(trail(p))) failures.push(where + ': hreflang ' + hl + ' -> ' + p + ' is not in the export');
    }
  }
  if (r.kind === 'hub' && !r.model.rows?.length) failures.push(where + ': hub with no cities');
  if (r.kind === 'directory' && !r.model.sections.length && !r.model.hubs.length) failures.push(where + ': empty directory');
}
// Every URL a sitemap lists has to be a URL the Worker can serve.
const sitemapUrls = new Set();
for (const s of sitemaps) for (const m of s.xml.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(m[1]);
const orphans = [...sitemapUrls].filter((u) => u.startsWith(SITE_URL) && !seen.has(trail(u.replace(SITE_URL, ''))));
for (const u of orphans.slice(0, 20)) failures.push('sitemap lists ' + u + ' which is not in the export');
if (orphans.length > 20) failures.push('... and ' + (orphans.length - 20) + ' more sitemap URLs not in the export');

if (failures.length) {
  console.error(JSON.stringify({ exported: 0, failures: failures.length, examples: failures.slice(0, 25) }, null, 2));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 7. Write. Every object carries its own sha256 so the uploader can skip what R2 already
//    holds, which is what makes the import resumable and idempotent.
// ---------------------------------------------------------------------------
await rm(OUT, { recursive: true, force: true });
const index = {};
let bytes = 0;
for (const r of records) {
  const key = keyFor(r.path);
  const body = JSON.stringify(r);
  const target = join(OUT, key);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, body);
  const sha = createHash('sha256').update(body).digest('hex');
  index[r.path] = { key, sha256: sha, bytes: Buffer.byteLength(body), kind: r.kind, locale: r.locale, family: r.family, lastmod: r.lastmod };
  bytes += Buffer.byteLength(body);
}
for (const s of sitemaps) {
  const key = 'sitemaps/' + s.id + '.xml';
  const target = join(OUT, key);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, s.xml);
  index['sitemap:' + s.id] = { key, sha256: createHash('sha256').update(s.xml).digest('hex'), bytes: Buffer.byteLength(s.xml), kind: 'sitemap' };
  bytes += Buffer.byteLength(s.xml);
}
await writeFile(join(OUT, 'sitemaps', 'index.xml'), sitemapIndexXml);
index['sitemap:index'] = { key: 'sitemaps/index.xml', sha256: createHash('sha256').update(sitemapIndexXml).digest('hex'), bytes: Buffer.byteLength(sitemapIndexXml), kind: 'sitemap' };

// The manifest is CONFIGURATION, not a route table: the Worker reads it for the dataset
// version, the locales and the sitemap list, and resolves a page by asking R2 for the
// page's own key. That is what lets the same Worker serve 6,810 pages or 100,000,000
// without the manifest growing.
// The commit the export ran at. Git is the version history of the Atlas and R2 is a
// projection of one commit of it, so rolling the content back is: check out this field's
// value from an earlier manifest, export, upload. The uploader keeps a copy of every
// manifest under atlas/manifests/ for exactly that.
let sourceCommit = process.env.GITHUB_SHA || null;
if (!sourceCommit) {
  try {
    const { execFileSync } = await import('node:child_process');
    sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain', '--', 'data', 'lib', 'components'], { encoding: 'utf8' }).trim();
    if (dirty) sourceCommit += '-dirty';
  } catch { sourceCommit = null; }
}

const manifest = {
  schema: 2,
  sourceCommit,
  version: process.env.ATLAS_VERSION || new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
  createdAt: new Date().toISOString(),
  origin: SITE_URL,
  counts: { total: records.length, cohort: cohortCount, legacy: legacyCount, legacyHubs: legacyHubCount, hubs: hubCount, directories: directoryCount, sitemaps: sitemaps.length + 1 },
  locales: langs,
  kinds: ['data', 'hub', 'directory'],
  sitemaps: sitemaps.map((s) => ({ id: s.id, urls: s.urls })),
  bytes,
};
await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
await writeFile(join(OUT, 'upload-index.json'), JSON.stringify({ version: manifest.version, objects: index }, null, 1));

console.log(JSON.stringify({ out: OUT, ...manifest, failures: 0 }, null, 1));

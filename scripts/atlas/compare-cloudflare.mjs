// Compare the Atlas as Cloudflare serves it against the Atlas as the Next.js app serves it.
//
// This is the gate that decides whether the migration preserved the SEO, and it exists
// because "the Worker returns 200" and "the Worker returns the same page" are different
// claims. For each sampled URL it fetches both sides and compares the signals a search
// engine actually consumes:
//
//   status, title, meta description, canonical, the whole hreflang cluster, the JSON-LD
//   graph (parsed and deep-compared, not string-compared), h1, every h2 in order, the
//   visible text of <main> normalised to words, and every internal link in <main>.
//
// ROBOTS IS AN EXPECTED DIFFERENCE and the only one: the Worker serves noindex because it
// answers on workers.dev. It is asserted to differ in exactly that direction rather than
// ignored, so a Worker that accidentally became indexable fails the run.
//
// Usage:
//   ATLAS_ORIGIN_A=http://localhost:3000 \
//   ATLAS_ORIGIN_B=https://livdar-atlas-staging.<sub>.workers.dev \
//   node scripts/atlas/compare-cloudflare.mjs [--sample N] [--all] [--out FILE]

import { readFile, writeFile } from 'node:fs/promises';

const A = (process.env.ATLAS_ORIGIN_A || 'http://localhost:3000').replace(/\/$/, '');
const B = (process.env.ATLAS_ORIGIN_B || '').replace(/\/$/, '');
if (!B) throw new Error('ATLAS_ORIGIN_B (the Cloudflare origin) is required');

const argOf = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const DIR = argOf('dir', '.atlas-cloudflare-export');
const OUT = argOf('out', 'reports/atlas-cloudflare-parity.json');
const SAMPLE = Number(argOf('sample', 2));
const ALL = process.argv.includes('--all');
// With --expect-indexable the Cloudflare side is the PRODUCTION configuration, so robots
// is no longer an expected difference: it has to equal the reference exactly, and a
// noindex on either side fails the page.
const EXPECT_INDEXABLE = process.argv.includes('--expect-indexable');

// ---------------------------------------------------------------------------
// Extraction. These templates are generated, not hand-written, so their markup is
// regular enough to read with expressions; the alternative is a DOM dependency in a
// repository that has three.
// ---------------------------------------------------------------------------
const decode = (s) => String(s == null ? '' : s)
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'")
  .replace(/&amp;/g, '&');

const meta = (html, attr, value) => {
  const re = new RegExp('<meta[^>]*' + attr + '=["\']' + value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\'][^>]*>', 'i');
  const tag = html.match(re);
  if (!tag) return null;
  const content = tag[0].match(/content=["']([^"']*)["']/i);
  return content ? decode(content[1]) : null;
};

function extract(html) {
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [, ''])[1];
  const hreflang = {};
  for (const m of html.matchAll(/<link[^>]+rel=["']alternate["'][^>]*>/gi)) {
    const hl = m[0].match(/hreflang=["']([^"']+)["']/i);
    const href = m[0].match(/href=["']([^"']+)["']/i);
    if (hl && href) hreflang[hl[1]] = decode(href[1]);
  }
  const jsonld = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { jsonld.push(JSON.parse(m[1])); } catch { jsonld.push({ unparseable: m[1].slice(0, 200) }); }
  }
  return {
    title: decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [, null])[1]),
    description: meta(html, 'name', 'description'),
    canonical: decode((html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
      || html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) || [, null])[1]),
    robots: meta(html, 'name', 'robots'),
    ogTitle: meta(html, 'property', 'og:title'),
    ogDescription: meta(html, 'property', 'og:description'),
    ogUrl: meta(html, 'property', 'og:url'),
    ogImage: meta(html, 'property', 'og:image'),
    ogType: meta(html, 'property', 'og:type'),
    ogLocale: meta(html, 'property', 'og:locale'),
    twitterCard: meta(html, 'name', 'twitter:card'),
    htmlLang: (html.match(/<html[^>]+lang=["']([^"']+)["']/i) || [, null])[1],
    hreflang,
    jsonld,
    h1: [...main.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => decode(m[1].replace(/<[^>]+>/g, '')).trim()),
    h2: [...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => decode(m[1].replace(/<[^>]+>/g, '')).trim()),
    // Internal links only: an external link is a CTA target and not a crawl signal here.
    links: [...main.matchAll(/<a[^>]+href=["'](\/[^"']*)["']/gi)].map((m) => decode(m[1])),
    // The words a reader sees in the main column. <script> and <style> are stripped
    // first so the JSON-LD graph does not count as prose on one side and not the other.
    text: decode(main.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ').trim(),
  };
}

const sortedJson = (v) => {
  if (Array.isArray(v)) return v.map(sortedJson);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortedJson(v[k])]));
  return v;
};
const same = (a, b) => JSON.stringify(sortedJson(a)) === JSON.stringify(sortedJson(b));

// A truncated, readable rendering of a mismatch, so the report says what differs rather
// than dumping two pages into it.
const show = (v) => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s == null ? null : s.length > 220 ? s.slice(0, 220) + '…(' + s.length + ')' : s;
};

// ---------------------------------------------------------------------------
// The sample. Every page kind, every family and every locale has to appear, because a
// migration that is right for 6,000 weather pages and wrong for the 5 rent pages has
// still broken 5 live URLs. SAMPLE pages are taken per (kind, family, locale) cell.
// ---------------------------------------------------------------------------
const index = JSON.parse(await readFile(DIR + '/upload-index.json', 'utf8'));
const records = Object.entries(index.objects)
  .filter(([k]) => !k.startsWith('sitemap:'))
  .map(([path, o]) => ({ path, ...o }));

let sample;
if (ALL) {
  sample = records.map((r) => r.path);
} else {
  const cells = new Map();
  for (const r of records) {
    const cell = r.kind + '|' + r.family + '|' + r.locale;
    if (!cells.has(cell)) cells.set(cell, []);
    if (cells.get(cell).length < SAMPLE) cells.get(cell).push(r.path);
  }
  sample = [...cells.values()].flat();
}
console.log(JSON.stringify({ sampled: sample.length, of: records.length, cells: ALL ? null : new Set(records.map((r) => r.kind + '|' + r.family + '|' + r.locale)).size }));

// ---------------------------------------------------------------------------
// Compare.
// ---------------------------------------------------------------------------
const FIELDS = ['title', 'description', 'canonical', 'ogTitle', 'ogDescription', 'ogUrl', 'ogImage', 'ogType', 'ogLocale', 'twitterCard', 'htmlLang', 'hreflang', 'jsonld', 'h1', 'h2', 'links', 'text'];

async function get(origin, path) {
  const response = await fetch(origin + path, { redirect: 'manual', headers: { 'user-agent': 'livdar-atlas-parity/1' } });
  return { status: response.status, headers: Object.fromEntries(response.headers.entries()), html: response.status === 200 ? await response.text() : '' };
}

const results = [];
let cursor = 0;
const PARALLEL = Number(process.env.ATLAS_COMPARE_PARALLEL || 4);
async function worker() {
  while (cursor < sample.length) {
    const path = sample[cursor];
    cursor += 1;
    const row = { path, differences: [] };
    try {
      const [a, b] = await Promise.all([get(A, path), get(B, path)]);
      row.status = { vercel: a.status, cloudflare: b.status };
      if (a.status !== 200 || b.status !== 200) {
        row.differences.push({ field: 'status', vercel: a.status, cloudflare: b.status });
        results.push(row);
        continue;
      }
      const ea = extract(a.html);
      const eb = extract(b.html);
      for (const field of FIELDS) {
        if (!same(ea[field], eb[field])) row.differences.push({ field, vercel: show(ea[field]), cloudflare: show(eb[field]) });
      }
      row.robots = { vercel: ea.robots, cloudflare: eb.robots };
      if (/noindex/i.test(ea.robots || '')) row.differences.push({ field: 'robots', problem: 'the Next.js reference render is itself noindex, so this run proves nothing about production indexability', vercel: ea.robots });
      if (EXPECT_INDEXABLE) {
        if (ea.robots !== eb.robots) row.differences.push({ field: 'robots', vercel: ea.robots, cloudflare: eb.robots });
        const xrt = b.headers?.['x-robots-tag'];
        if (xrt) row.differences.push({ field: 'x-robots-tag', problem: 'a production page must not carry X-Robots-Tag', cloudflare: xrt });
      } else if (!/noindex/i.test(eb.robots || '')) {
        // Staging: the one difference that MUST exist.
        row.differences.push({ field: 'robots', problem: 'the Cloudflare page is indexable; staging must be noindex', cloudflare: eb.robots });
      }
      row.bytes = { vercel: a.html.length, cloudflare: b.html.length };
    } catch (error) {
      row.differences.push({ field: 'fetch', error: String(error.message || error) });
    }
    results.push(row);
    if (results.length % 25 === 0) console.log('compared', results.length, 'of', sample.length);
  }
}
await Promise.all(Array.from({ length: Math.max(1, Math.min(PARALLEL, 8)) }, worker));

const failed = results.filter((r) => r.differences.length);
const byField = {};
for (const r of failed) for (const d of r.differences) byField[d.field] = (byField[d.field] || 0) + 1;

const report = {
  comparedAt: new Date().toISOString(),
  origins: { vercel: A, cloudflare: B },
  sampled: sample.length,
  identical: results.length - failed.length,
  differing: failed.length,
  byField,
  failures: failed.slice(0, 40),
};
await writeFile(OUT, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ sampled: report.sampled, identical: report.identical, differing: report.differing, byField, out: OUT }, null, 1));
process.exit(failed.length ? 1 : 0);

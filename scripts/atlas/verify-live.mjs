// Structural validation of every published URL, against a running origin.
//
//   NODE_USE_ENV_PROXY=1 node scripts/atlas/verify-live.mjs --base https://livdar.com
//   node scripts/atlas/verify-live.mjs --base http://127.0.0.1:3323 --json reports/atlas/live.json
//
// The environment variable is not optional against a remote origin. Node's built
// in fetch ignores HTTPS_PROXY unless it is set, and behind an egress proxy that
// means every request comes back 403: five hundred identical failures that look
// exactly like a site that is down.
//
// Not a browser. One request per URL and the served HTML read as a crawler reads
// it, because the questions that matter for five hundred pages are structural and
// a browser costs forty connections a page. What a browser is for is the tool and
// the dataLayer, and those are checked on a sample elsewhere.
//
// Every field is compared against the page model rather than against a pattern, so
// this cannot pass a page that is internally consistent and wrong: the title has
// to be the title the model says, and the model was itself audited for naming the
// right entity.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MANIFESTS } from '../../lib/atlas/serve-pages.js';

const ROOT = new URL('../../', import.meta.url);

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : fallback;
};

const decode = (s) => String(s || '')
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));

const one = (html, re) => { const m = html.match(re); return m ? decode(m[1]).trim() : null; };
const all = (html, re) => [...html.matchAll(re)].map((m) => decode(m[1]).trim());

export function readPage(html) {
  return {
    title: one(html, /<title>([\s\S]*?)<\/title>/),
    description: one(html, /<meta name="description" content="([^"]*)"/),
    h1: one(html, /<h1[^>]*>([\s\S]*?)<\/h1>/),
    canonical: one(html, /rel="canonical" href="([^"]*)"/),
    robots: one(html, /<meta name="robots" content="([^"]*)"/),
    lang: one(html, /<html[^>]*lang="([^"]*)"/),
    hreflang: all(html, /rel="alternate" hrefLang="([^"]*)"/gi),
    ctaPairs: (html.match(/atlas-cta-pair/g) || []).length,
    ctaLinks: all(html, /data-cta="([^"]*)"/g),
    ctaPositions: all(html, /data-cta-position="([^"]*)"/g),
    internalLinks: (html.match(/class="atlas-links"/) ? (html.split('class="atlas-links"')[1] || '').split('</ul>')[0].match(/<a /g) || [] : []).length,
    schemaBlocks: (html.match(/type="application\/ld\+json"/g) || []).length,
    tool: html.includes('class="atlas-tool"'),
    toolControls: (html.match(/<(?:input|select)\b/g) || []).length,
  };
}

async function fetchOne(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { redirect: 'manual' });
      const body = r.status < 400 ? await r.text() : '';
      return { status: r.status, location: r.headers.get('location'), body };
    } catch (err) {
      if (i === tries - 1) return { status: 0, error: String(err).slice(0, 120), body: '' };
      await new Promise((res) => setTimeout(res, 400 * (i + 1)));
    }
  }
  return { status: 0, body: '' };
}

export async function run({ base = 'https://livdar.com', concurrency = 4, only = null } = {}) {
  const models = [];
  for (const m of MANIFESTS) {
    try { models.push(...(JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages || [])); } catch { /* none */ }
  }
  const wanted = only ? models.filter((m) => only.includes(m.path)) : models;

  // Sitemap membership, from the generator, because a URL that answers and is in
  // no sitemap is a page only a link can reach.
  const { generateSitemaps } = await import('../../app/sitemap.js');
  const { default: sitemap } = await import('../../app/sitemap.js');
  const inSitemap = new Set();
  for (const s of await generateSitemaps()) {
    for (const e of await sitemap({ id: s.id })) inSitemap.add(new URL(e.url).pathname);
  }

  const rows = [];
  let at = 0;
  const worker = async () => {
    while (at < wanted.length) {
      const model = wanted[at++];
      const r = await fetchOne(base + model.path);
      const row = { path: model.path, locale: model.locale, surface: model.surface, family: model.family, entity: String(model.entity), status: r.status, problems: [] };
      const bad = (why) => row.problems.push(why);
      if (r.status !== 200) { bad('http ' + r.status + (r.location ? ' to ' + r.location : '') + (r.error ? ' ' + r.error : '')); rows.push(row); continue; }
      const got = readPage(r.body);
      row.read = got;
      if (got.title !== model.title) bad('title is ' + JSON.stringify(got.title) + ' and the model says ' + JSON.stringify(model.title));
      if (got.description !== model.description) bad('description does not match the model');
      if (got.h1 !== model.h1) bad('h1 is ' + JSON.stringify(got.h1) + ' and the model says ' + JSON.stringify(model.h1));
      if (got.canonical !== model.canonical) bad('canonical is ' + got.canonical);
      if (got.robots !== 'index, follow') bad('robots is ' + JSON.stringify(got.robots));
      if (got.lang !== model.locale) bad('html lang is ' + JSON.stringify(got.lang) + ' and the page is ' + model.locale);
      if (!got.hreflang.includes(model.locale)) bad('hreflang does not include its own language');
      if (got.hreflang.length !== (model.alternates || []).length) bad('hreflang has ' + got.hreflang.length + ' entries and the model has ' + (model.alternates || []).length);
      if (got.ctaPairs !== 2) bad('call to action blocks: ' + got.ctaPairs);
      if (got.ctaLinks.length !== 4) bad('call to action links: ' + got.ctaLinks.length);
      if (new Set(got.ctaPositions).size !== 2) bad('call to action positions: ' + [...new Set(got.ctaPositions)].join(','));
      if (got.internalLinks < 3) bad('internal links: ' + got.internalLinks);
      if (got.schemaBlocks < 1) bad('no structured data');
      if (!inSitemap.has(model.path)) bad('not in any sitemap');
      const wantsTool = !!(model.tool && model.tool.interactive);
      if (wantsTool && !got.tool) bad('the model says this page carries a tool and the HTML has none');
      if (wantsTool && got.toolControls < 1) bad('the tool renders no control');
      if (!wantsTool && got.tool) bad('the HTML carries a tool the model does not declare');
      rows.push(row);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));

  const failed = rows.filter((r) => r.problems.length);
  const byProblem = {};
  for (const r of failed) for (const p of r.problems) {
    const key = p.split(' is ')[0].split(':')[0];
    byProblem[key] = (byProblem[key] || 0) + 1;
  }
  return { base, urls: rows.length, ok: rows.length - failed.length, failedCount: failed.length, byProblem, failed: failed.slice(0, 60), rows };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = await run({ base: arg('base', 'https://livdar.com'), concurrency: Number(arg('concurrency', '4')) });
  const out = arg('json');
  if (out) {
    mkdirSync(new URL(out.split('/').slice(0, -1).join('/') + '/', ROOT), { recursive: true });
    writeFileSync(new URL(out, ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  console.log(r.base + ': ' + r.ok + ' of ' + r.urls + ' clean, ' + r.failedCount + ' with a problem');
  console.log(JSON.stringify(r.byProblem, null, 1));
  for (const f of r.failed.slice(0, 25)) console.log('  ' + f.path + ' | ' + f.problems.join(' | ').slice(0, 170));
  if (arg('ci') !== null && r.failedCount) process.exit(1);
}

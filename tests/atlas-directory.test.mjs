// The crawl directory, and the three lists that have to agree for it to work.
//
// The directory exists because the 500 published Atlas pages had no inbound internal link
// from anywhere outside their own cohort: every family root answered 404, seven of the nine
// locale roots redirected, and the only thing that mentioned the pages was an XML sitemap.
// Google had crawled one of them in twelve days.
//
// Three separate lists decide whether it works, and every defect found on 2026-10-12 was two
// of them disagreeing:
//
//   languagesServed()   the languages the cohort manifest publishes in        (nine)
//   contentLocales()    the locales with a complete eSIM site                 (three)
//   ATLAS_LANGUAGES     the edge's copy of the first list                     (nine)
//
// The route generated for the first, the sitemap declared for the second, and the middleware
// matched on the third minus the word 'atlas'. So /ro/atlas/ was in a sitemap and answered
// 404, seven directories were in no sitemap and answered 307, and the footer linked all of
// them from every page regardless. These tests pin each pairing.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pages, languagesServed } from '../lib/atlas/serve-pages.js';
import { sectionOf, sectionHeading, sectionKeys } from '../lib/atlas/sections.js';
import { directoryEntries, sitemapIds, isDirectorySitemap } from '../lib/atlas/sitemap-pages.js';
import { PACKS } from '../lib/atlas/content/lang/index.js';
import { publishedMarkets } from '../lib/markets.js';

// The two dashes the repository forbids, as code points rather than characters.
// scripts/dash-check.mjs scans every file and allows neither anywhere, so a test that spells
// them out fails the gate it exists to enforce. That is exactly what happened on the first
// push of this branch: two findings, both in this file, on the line below.
const FORBIDDEN_DASHES = [[0x2014, 'em dash'], [0x2013, 'en dash']];

const abs = (p) => 'https://livdar.com' + p;
const served = languagesServed();

test('every published page resolves to a URL section', () => {
  const orphans = pages().filter((p) => !sectionOf(p.path));
  assert.deepEqual(orphans.map((p) => p.path), [],
    'these pages would be dropped from their own directory, silently');
});

test('every section a language publishes has a heading written in that language', () => {
  const missing = [];
  for (const p of pages()) {
    const key = sectionOf(p.path);
    if (!sectionHeading(p.locale, key)) missing.push(p.locale + ' ' + key);
  }
  assert.deepEqual([...new Set(missing)].sort(), [],
    'the directory would render a section it cannot name; the bug this replaced printed ' +
    '"Livdar" for all of them');
});

test('no heading is the site name, a slug, or an English string in a non-English pack', () => {
  // breadcrumbs[0].name is 'Livdar' in every language, and familyLabel() read it, so all
  // eleven headings on /en/atlas/ and all twelve on /de/atlas/ said "Livdar". A heading equal
  // to the brand, or carrying a hyphen, means a slug or the site name leaked back in.
  for (const [lang, pack] of Object.entries(PACKS)) {
    for (const [key, label] of Object.entries(pack.sections || {})) {
      assert.notEqual(label, 'Livdar', `${lang}.${key} is the site name, not a section name`);
      assert.ok(!label.includes('-'), `${lang}.${key} looks like a slug: ${label}`);
      assert.ok(label.trim().length > 1, `${lang}.${key} is empty`);
      for (const [code, nm] of FORBIDDEN_DASHES) {
        assert.ok(!label.includes(String.fromCharCode(code)),
          `${lang}.${key} contains an ${nm}`);
      }
    }
  }
});

test('every pack covers every section the vocabulary declares', () => {
  for (const [lang, pack] of Object.entries(PACKS)) {
    const have = Object.keys(pack.sections || {}).sort();
    assert.deepEqual(have, [...sectionKeys()].sort(),
      `${lang} does not name the same sections as atlas-urls.js`);
  }
});

test('the sitemap declares a directory for every language served, and only those', () => {
  const entries = directoryEntries({ absolute: abs, lastModified: new Date(0) });
  assert.deepEqual(entries.map((e) => e.url).sort(), served.map((l) => abs('/' + l + '/atlas/')).sort());
  assert.ok(sitemapIds().some((i) => isDirectorySitemap(i.id)), 'the directory sitemap is not generated');
});

test('no directory is declared for a locale with no Atlas pages', () => {
  // /ro/atlas/ was declared in the ro core sitemap and answered 404, because the entry sat in
  // coreEntries() which runs for the eSIM locales rather than the Atlas ones.
  const declared = directoryEntries({ absolute: abs, lastModified: new Date(0) }).map((e) => e.url);
  for (const m of publishedMarkets().map((x) => x.code)) {
    if (served.includes(m)) continue;
    assert.ok(!declared.includes(abs('/' + m + '/atlas/')),
      `/${m}/atlas/ is declared in a sitemap and that locale publishes no Atlas pages`);
  }
});

test('the hreflang set on the directory covers exactly the languages served', () => {
  for (const e of directoryEntries({ absolute: abs, lastModified: new Date(0) })) {
    const langs = Object.keys(e.alternates.languages).filter((l) => l !== 'x-default').sort();
    assert.deepEqual(langs, [...served].sort(),
      e.url + ' annotates a language whose directory does not exist, which is how ' +
      '/en/atlas/ came to point hreflang at seven URLs that redirected');
  }
});

test('the directory route lists every page of its locale and no page of another', () => {
  const src = readFileSync('app/[lang]/atlas/page.jsx', 'utf8');
  assert.match(src, /pages\(\)\.filter\(\(p\) => p\.locale === lang\)/,
    'the directory no longer scopes its listing to one locale');
  // Every page of every served locale is reachable from exactly one directory.
  for (const lang of served) {
    const mine = pages().filter((p) => p.locale === lang);
    assert.ok(mine.length > 0, lang + ' is served but publishes nothing');
    const sections = new Set(mine.map((p) => sectionOf(p.path)));
    for (const s of sections) assert.ok(sectionHeading(lang, s), `${lang} cannot name ${s}`);
  }
});

test('the chrome links a surface only where that surface is published', () => {
  // The footer pointed at /es/, /es/esim/, /es/regiones/, /es/guias/ and /es/compatibilidad/
  // from all 328 Atlas pages in the seven Atlas-only languages, and at /ro/atlas/ from 32 ro
  // pages. 2,656 link instances, every one a redirect or a 404.
  for (const f of ['components/Footer.jsx', 'components/Header.jsx']) {
    const src = readFileSync(f, 'utf8');
    assert.match(src, /isPublished\(locale\)/, f + ' does not ask whether the eSIM site exists here');
    assert.match(src, /languagesServed\(\)\.includes\(locale\)/,
      f + ' does not ask whether the Atlas exists here');
    assert.ok(!/<a href=\{'\/' \+ locale \+ '\/atlas\/'\}>Atlas<\/a>(?![\s\S]{0,40}: null)/.test(
      src.replace(/\n/g, ' ')) || /atlas \?/.test(src),
      f + ' links the Atlas directory unconditionally');
  }
});

test('the breadcrumb root is a page that exists, and appears once', () => {
  // Two faults in one line. The root was hardcoded as <a href={'/' + l + '/'}>Livdar</a> AND
  // the model's own first crumb is the site name, so every one of the 500 pages rendered
  // "Livdar / Livdar / Page". And /{lang}/ is a 307 for the seven Atlas-only locales, so the
  // first link on 328 of them went to the English home page.
  const src = readFileSync('components/atlas/AtlasPage.jsx', 'utf8');
  assert.ok(!/<a href=\{'\/' \+ l \+ '\/'\}>Livdar<\/a>/.test(src),
    'the breadcrumb root is hardcoded again, which duplicates the model crumb');
  assert.match(src, /isPublished\(l\)/, 'the breadcrumb root does not check what the locale publishes');
  assert.match(src, /'\/' \+ l \+ '\/atlas\/'/, 'an Atlas-only locale has no root to point at');
});

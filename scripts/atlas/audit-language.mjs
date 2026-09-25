// Is the page actually in the language its URL claims?
//
//   node scripts/atlas/audit-language.mjs
//   node scripts/atlas/audit-language.mjs --json reports/atlas/language-audit.json
//
// A page under /de/ is German because a route put it there, and that is the
// weakest possible evidence. What goes wrong in a programme like this is not a
// whole page in the wrong language; it is one string. A template that forgot to
// take its copy from the pack, a fallback that reached English because a key was
// missing, a label that was written once in English and interpolated nine times.
// Each of those is one sentence in the wrong language in the middle of a page
// that is otherwise fine, and nothing else in this suite looks for it.
//
// So this checks every visible string on every page against two things.
//
// The first is a set of English function words. They are the giveaway, because a
// German page can legitimately contain `Berlin` and cannot legitimately contain
// `from thirty years of normals`. The word has to appear at a word boundary and
// not be a word the language shares, which is why the list is short and each
// exclusion is deliberate.
//
// The second is the pack. Every localised string a page carries should be one the
// language's own copy pack could have produced, and the ones this can check
// cheaply are the ones that come from a fixed vocabulary: the UI labels, the call
// to action note, the tool chrome. If a page carries the English version of any
// of those, the pack was bypassed.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MANIFESTS } from '../../lib/atlas/serve-pages.js';
import { PACKS } from '../../lib/atlas/atlas-model.js';
import { CTA_COPY, CTA_KINDS } from '../../lib/atlas/content/cta-copy.js';
import { TOOL_UI, INPUT_TERMS } from '../../lib/atlas/content/terms.js';

const ROOT = new URL('../../', import.meta.url);

// English function words that no other language in this programme uses as a
// word. Each entry earns its place: `in`, `a`, `no`, `van`, `de`, `per`, `con`,
// `sin`, `com`, `die`, `das`, `is`, `als`, `me`, `to` and `at` are all excluded
// because at least one of the nine languages writes them.
export const ENGLISH_MARKERS = [
  'the', 'and', 'with', 'from', 'what', 'which', 'where', 'when', 'that', 'this',
  'these', 'those', 'than', 'then', 'their', 'there', 'they', 'them', 'your',
  'you', 'because', 'about', 'above', 'below', 'between', 'through', 'without',
  'rather', 'enough', 'every', 'each', 'both', 'some', 'most', 'least', 'more',
  'less', 'other', 'another', 'also', 'still', 'already', 'against', 'instead',
  'whether', 'anything', 'nothing', 'something', 'everything', 'would', 'could',
  'should', 'cannot', 'does', 'doesn', 'costs', 'pays', 'month', 'months',
  'year', 'years', 'week', 'weekend', 'people', 'price', 'prices', 'level',
  'average', 'median', 'source', 'sources', 'holidays', 'living', 'earn',
  'earns', 'here', 'only', 'same', 'much', 'many', 'first', 'second', 'third',
];

// `sport` is the same word in seven of the nine, `budget` in five, `index` in
// four. Anything that is a loan word everywhere is not evidence.
const SHARED = new Set(['sport', 'budget', 'index', 'euro', 'euros', 'internet', 'online', 'total', 'no', 'in', 'a', 'de', 'per', 'die', 'das', 'is', 'als', 'me', 'to', 'at', 'van', 'con', 'sin', 'com', 'ok']);

// Which markers are not evidence in a given language, taken from that language's
// own copy pack rather than from a list somebody maintains.
//
// This is the correction that made the audit usable. The first version reported
// forty French paragraphs for the words `pays` and `source`, which are French.
// `pays` is country, `source` is source, `plus` is more, `car` is because. A
// hand written exclusion list would have missed the next one, so the exclusions
// are read out of lib/atlas/content/lang/<language>.js: every word that language's
// own copy is written with is, by definition, a word that language uses.
const packWordCache = {};
export function packWords(language) {
  if (packWordCache[language]) return packWordCache[language];
  const words = new Set();
  // This language's own file whole, and from the files that hold all nine
  // languages side by side, only this language's column. Reading those whole
  // would let the English column excuse an English word in German, which is the
  // thing being looked for.
  for (const file of ['lib/atlas/content/lang/' + language + '.js']) {
    let src;
    try { src = readFileSync(new URL(file, ROOT), 'utf8'); } catch { continue; }
    // Comments first. Every comment in this repository is in English, and an
    // apostrophe inside one opens a spurious string literal that swallows the
    // sentence around it: that is how `from` stopped being evidence in German.
    src = src.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    // Only the string literals, so a JavaScript keyword is not mistaken for copy.
    for (const m of src.matchAll(/'([^'\\]{2,400})'|"([^"\\]{2,400})"/g)) {
      for (const w of fold(m[1] || m[2]).split(' ')) if (w.length > 1) words.add(w);
    }
  }
  for (const file of ['lib/atlas/content/terms.js', 'lib/atlas/content/cta-copy.js', 'lib/atlas/content/tool-copy.js', 'lib/atlas/content/ranking-copy.js']) {
    let src;
    try { src = readFileSync(new URL(file, ROOT), 'utf8'); } catch { continue; }
    src = src.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    // `de: 'Wie sich die Mieten entwickeln'` and nothing from the neighbouring
    // `en:` on the same line. Single quoted only, which is what this repository
    // writes.
    const key = new RegExp("(?:^|[\\s{,(])'?" + language + "'?\\s*:\\s*(?:\\([^)]*\\)\\s*=>\\s*)?'((?:[^'\\\\]|\\\\.)*)'", 'g');
    for (const m of src.matchAll(key)) {
      for (const w of fold(m[1]).split(' ')) if (w.length > 1) words.add(w);
    }
  }
  packWordCache[language] = words;
  return words;
}

export function markersFor(language) {
  const own = packWords(language);
  return ENGLISH_MARKERS.filter((w) => !SHARED.has(w) && !own.has(w));
}

export const fold = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

// Every English marker in a string, at a word boundary, that is not a word this
// language legitimately writes.
export function englishIn(text, language = null) {
  const words = new Set(fold(text).split(' '));
  const markers = language ? markersFor(language) : ENGLISH_MARKERS.filter((w) => !SHARED.has(w));
  return markers.filter((w) => words.has(w));
}

// Strings that belong to a fixed vocabulary, and the English version of each, so
// a page carrying the English one can be named rather than guessed at.
// An English fixture is a leak only where the language's own pack would have
// produced something different. `Livdar` is the brand and is the breadcrumb root
// in all nine; `Sources` and `Questions` are the French words for those as well
// as the English ones. Reporting those was four hundred false positives and the
// brand name was every one of them.
const fixtureCache = {};
function englishFixtures(language) {
  if (fixtureCache[language]) return fixtureCache[language];
  const out = new Map();
  const differs = (en, mine, what) => { if (en && mine && en !== mine) out.set(en, what); };
  for (const k of CTA_KINDS) {
    differs(CTA_COPY.en[k] && CTA_COPY.en[k].note(), CTA_COPY[language] && CTA_COPY[language][k] && CTA_COPY[language][k].note(), 'the English call to action note for ' + k);
  }
  for (const [k, row] of Object.entries(TOOL_UI)) differs(row.en, row[language], 'the English tool label ' + k);
  for (const [k, row] of Object.entries(INPUT_TERMS)) differs(row.en, row[language], 'the English input term ' + k);
  const en = PACKS.en && PACKS.en.ui;
  const mine = PACKS[language] && PACKS[language].ui;
  if (en && mine) for (const [k, v] of Object.entries(en)) if (typeof v === 'string') differs(v, typeof mine[k] === 'string' ? mine[k] : null, 'the English interface label ' + k);
  fixtureCache[language] = out;
  return out;
}

// Every visible string a page carries, with a name for where it came from, so a
// report can say which field is wrong rather than that the page is.
export function visibleStrings(p) {
  const out = [];
  const add = (where, text) => { if (text && typeof text === 'string') out.push({ where, text }); };
  add('h1', p.h1);
  add('title', p.title);
  add('description', p.description);
  for (const [i, f] of (p.facts || []).entries()) { add('facts[' + i + '].label', f.label); add('facts[' + i + '].value', String(f.value)); }
  for (const [i, s] of (p.sections || []).entries()) {
    add('sections[' + i + '].heading', s.heading);
    for (const [j, x] of (s.paragraphs || []).entries()) add('sections[' + i + '].paragraphs[' + j + ']', x);
  }
  for (const [i, q] of (p.faq || []).entries()) { add('faq[' + i + '].q', q.q); add('faq[' + i + '].a', q.a); }
  if (p.table) {
    add('table.caption', p.table.caption);
    for (const [i, h] of (p.table.head || []).entries()) add('table.head[' + i + ']', h);
  }
  for (const [k, v] of Object.entries(p.labels || {})) add('labels.' + k, v);
  for (const [i, l] of (p.links || []).entries()) add('links[' + i + '].text', l.text);
  for (const c of [['cta.primary', p.cta && p.cta.primary], ['cta.secondary', p.cta && p.cta.secondary]]) {
    if (!c[1]) continue;
    add(c[0] + '.label', c[1].label);
    add(c[0] + '.note', c[1].note);
  }
  for (const [i, b] of (p.breadcrumbs || []).entries()) add('breadcrumbs[' + i + '].name', b.name);
  return out;
}

export function run({ manifests = MANIFESTS } = {}) {
  const pages = [];
  for (const m of manifests) {
    try { pages.push(...(JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages || [])); } catch { /* no manifest */ }
  }
  const rows = [];
  const byLanguage = {};
  let strings = 0;
  for (const p of pages) {
    const lang = p.locale;
    byLanguage[lang] = byLanguage[lang] || { pages: 0, strings: 0, problems: 0 };
    byLanguage[lang].pages++;
    if (lang === 'en') { strings += visibleStrings(p).length; byLanguage[lang].strings += visibleStrings(p).length; continue; }
    const fixtures = englishFixtures(lang);
    const problems = [];
    for (const { where, text } of visibleStrings(p)) {
      strings++;
      byLanguage[lang].strings++;
      // An exact English fixture is the strongest signal: the pack was bypassed.
      const fixture = fixtures.get(text.trim());
      if (fixture) problems.push({ where, why: fixture, text: text.slice(0, 90) });
      // A link's anchor is the target page's heading, and a link stays inside the
      // language, so this covers those too.
      const hits = englishIn(text, lang);
      if (hits.length >= 2) problems.push({ where, why: 'English words: ' + hits.slice(0, 6).join(', '), text: text.slice(0, 90) });
    }
    if (problems.length) {
      byLanguage[lang].problems += problems.length;
      rows.push({ path: p.path, locale: lang, family: p.family, surface: p.surface, problems });
    }
  }
  return { pages: pages.length, strings, byLanguage, pagesWithProblems: rows.length, rows };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  const i = process.argv.indexOf('--json');
  if (i >= 0) {
    const out = process.argv[i + 1] || 'reports/atlas/language-audit.json';
    mkdirSync(new URL(out.split('/').slice(0, -1).join('/') + '/', ROOT), { recursive: true });
    writeFileSync(new URL(out, ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  console.log('pages ' + r.pages + '  visible strings ' + r.strings + '  pages with a problem ' + r.pagesWithProblems);
  console.log(JSON.stringify(r.byLanguage, null, 1));
  for (const row of r.rows.slice(0, 40)) {
    for (const pr of row.problems.slice(0, 3)) console.log(row.path + ' | ' + pr.where + ' | ' + pr.why + ' | "' + pr.text + '"');
  }
}

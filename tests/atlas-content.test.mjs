import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build, words, PACKS, headingFromKeyword, languages } from '../lib/atlas/atlas-model.js';
import { slugify, atlasPath, ATLAS_SEGMENTS, FAMILY_SEGMENT, isLatinSlug } from '../lib/atlas/atlas-urls.js';
import { subject, plain } from '../lib/atlas/content/country-forms.js';
import { missingTerms, inputTerm } from '../lib/atlas/content/terms.js';
import { toolCopy, toolsCovered, missingToolCopy } from '../lib/atlas/content/tool-copy.js';
import { rankingCopy, missingRankingCopy } from '../lib/atlas/content/ranking-copy.js';
import { wire } from '../lib/atlas/atlas-links.js';
import { RANKINGS } from '../lib/atlas/rankings.js';
import { FAMILY_SEGMENTS } from '../lib/atlas/segments.js';
import { TOOLS } from '../lib/atlas/tools-queue.js';

const cohort = JSON.parse(readFileSync(new URL('../data/atlas/cohorts/cohort-001.json', import.meta.url), 'utf8'));
const LANGS = languages();

test('no Atlas segment collides with a segment the site already serves', () => {
  const existing = new Set();
  for (const m of Object.values(FAMILY_SEGMENTS)) for (const v of Object.values(m)) existing.add(v);
  for (const [group, byLang] of Object.entries(ATLAS_SEGMENTS)) {
    for (const [lang, seg] of Object.entries(byLang)) {
      assert.ok(!existing.has(seg), group + '/' + lang + ' uses ' + seg + ', which the eSIM site already serves');
      assert.ok(isLatinSlug(seg), group + '/' + lang + ' is not a Latin slug: ' + seg);
    }
  }
  // Every family with a URL has a segment in every cohort language, so a page
  // cannot fail to get a path because somebody added a family and stopped.
  for (const [family, group] of Object.entries(FAMILY_SEGMENT)) {
    for (const l of LANGS) assert.ok(ATLAS_SEGMENTS[group][l], family + ' has no ' + l + ' segment');
  }
});

test('slugs fold rather than strip, and never carry a long dash', () => {
  assert.equal(slugify('Gehälter'), 'gehaelter');
  assert.equal(slugify('kalkulator wynagrodzeń'), 'kalkulator-wynagrodzen');
  assert.equal(slugify('coût de la vie'), 'cout-de-la-vie');
  assert.equal(slugify("pays les moins chers d'europe"), 'pays-les-moins-chers-deurope');
  // A long dash in a keyword becomes the plain one rather than surviving.
  assert.equal(slugify('a' + String.fromCodePoint(0x2013) + 'b'), 'a-b');
  // Japanese has no Latin content, so the fold produces nothing and the
  // caller is told rather than handed an empty slug.
  assert.equal(isLatinSlug(slugify('生活費 計算')), false);
});

test('a country needs a subject form before it can carry a sentence', () => {
  // French, Italian and Portuguese put an article in front of the country, so
  // a country missing from the table is refused rather than written without
  // one. Polish and Japanese use no article and pass the bare name through.
  assert.equal(subject('CH', 'fr'), 'la Suisse');
  assert.equal(subject('US', 'it'), 'gli Stati Uniti');
  assert.equal(subject('CH', 'pl'), 'Szwajcaria');
  assert.equal(subject('ZZ', 'fr'), null);
  assert.equal(subject('MT', 'fr'), 'Malte', 'Malta takes no article in French and must not gain one');
  // The bare form is what a table cell wants, and it is never the subject
  // form in the article languages.
  assert.equal(plain('CH', 'fr'), 'Suisse');
  assert.notEqual(plain('CH', 'fr'), subject('CH', 'fr'));

  for (const p of cohort.pages) {
    if (!/^[A-Z]{2}$/.test(p.entity)) continue;
    assert.ok(subject(p.entity, p.language), p.entity + ' has no subject form in ' + p.language);
  }
});

test('headings survive the languages that inflect the country name', () => {
  // Polish writes the locative, which never matches the nominative in the
  // store, so the last token is raised instead.
  assert.equal(headingFromKeyword('koszty życia w szwajcarii', 'Szwajcaria', 'pl'), 'Koszty życia w Szwajcarii');
  // Where the nominative does appear it is restored to its proper case.
  assert.equal(headingFromKeyword('cost of living in japan', 'Japan', 'en'), 'Cost of living in Japan');
  // English capitalises its first person pronoun wherever it sits.
  assert.equal(headingFromKeyword('where should i live', null, 'en'), 'Where should I live');
  // A common noun at the end is not a place and is left alone.
  assert.equal(headingFromKeyword('gdzie mieszkać', 'Polska', 'pl'), 'Gdzie mieszkać');
});

test('every vocabulary entry exists in every cohort language', () => {
  assert.deepEqual(missingTerms(LANGS), []);
  assert.deepEqual(missingRankingCopy(RANKINGS.map((r) => r.id), LANGS), []);
  // Tool copy is checked for the tools the cohort actually publishes, since
  // the queue holds tools that cannot be built yet.
  const inCohort = [...new Set(cohort.pages.filter((p) => p.family.startsWith('tools.')).map((p) => p.entity))];
  assert.deepEqual(missingToolCopy(inCohort, LANGS), []);
  for (const id of inCohort) assert.ok(toolsCovered().includes(id), id + ' is published and has no copy of its own');
});

test('two tools never say the same thing, and neither do two rankings', () => {
  // The first version of these pages was one page with the title changed,
  // and this is the assertion that stops it coming back.
  for (const l of LANGS) {
    const seen = new Map();
    for (const id of toolsCovered()) {
      const c = toolCopy(id, l);
      // Japanese carries far more in a character, so the floor is per script
      // for the same reason the word floor on a page is.
      assert.ok(c && c.length > (l === 'ja' ? 90 : 200), id + '/' + l + ' has no copy worth the name at ' + (c || '').length + ' characters');
      assert.ok(!seen.has(c), id + ' and ' + seen.get(c) + ' share their copy in ' + l);
      seen.set(c, id);
    }
    const r = new Set();
    for (const x of RANKINGS) {
      const c = rankingCopy(x.id, l);
      assert.ok(!r.has(c), x.id + ' shares its copy with another ranking in ' + l);
      r.add(c);
    }
  }
});

test('the copy packs have the same shape in every language', () => {
  const shape = (p) => ({
    ui: Object.keys(p.ui).sort(),
    units: Object.keys(p.units).sort(),
    basket: Object.keys(p.basket).sort(),
    salary: Object.keys(p.salary).sort(),
    col: Object.keys(p.col).sort(),
    salaryPage: Object.keys(p.salaryPage).sort(),
    ranking: Object.keys(p.ranking).sort(),
    tool: Object.keys(p.tool).sort(),
  });
  const reference = shape(PACKS.en);
  for (const [l, p] of Object.entries(PACKS)) {
    assert.deepEqual(shape(p), reference, l + ' does not have the same keys as English');
    assert.equal(p.language, l);
  }
});

test('every cohort page builds into a model with provenance and a path', () => {
  for (const page of cohort.pages) {
    const m = build(page);
    assert.ok(!m.refused, (page.family + '/' + page.entity + '/' + page.language) + ' refused: ' + m.refused);
    assert.ok(m.h1 && m.title && m.description, m.path + ' is missing metadata');
    assert.ok(m.sources.length, m.path + ' shows numbers and cites nothing');
    for (const s of m.sources) assert.ok(s.source && s.licence, m.path + ' has a source row without a licence');
    assert.equal(m.path, atlasPath(page).path);
    const w = words(m);
    assert.ok(w.count > 0);
  }
});

test('internal links point only at pages in the cohort and leave no orphans', () => {
  const models = cohort.pages.map((p) => build(p)).filter((m) => !m.refused);
  const rev = {};
  for (const l of LANGS) {
    rev[l] = {};
    for (const p of cohort.pages) if (/^[A-Z]{2}$/.test(p.entity)) { const n = plain(p.entity, l); if (n) rev[l][n] = p.entity; }
  }
  const report = wire(models, (n, l) => rev[l]?.[n] || null);
  const known = new Set(models.map((m) => m.path));
  for (const m of models) {
    assert.ok(m.links.length, m.path + ' links nowhere');
    for (const l of m.links) {
      assert.ok(known.has(l.href), m.path + ' links to ' + l.href + ', which is not being published');
      // A link never leaves its language. hreflang already says the
      // alternates exist and a reader is not served by a page they cannot
      // read.
      assert.equal(l.href.split('/')[1], m.locale, m.path + ' links out of its language to ' + l.href);
    }
  }
  assert.deepEqual(report.orphans, [], 'pages nothing links to');
  assert.ok(Math.min(...Object.values(report.inbound)) >= 2, 'a page has fewer than two inbound links');
});

test('a tool page names its inputs in the reader language', () => {
  // The queue declares inputs in English because it is an engineering
  // document. A page that printed those words untranslated would be the one
  // place the machinery shows through, so the model refuses instead.
  assert.equal(inputTerm('role', 'pl'), 'stanowisko');
  assert.equal(inputTerm('not-a-real-input', 'pl'), null);
  for (const page of cohort.pages.filter((p) => p.family.startsWith('tools.'))) {
    const m = build(page);
    const inputs = m.facts.find((f) => f.label === PACKS[page.language].tool.inputs);
    assert.ok(inputs, m.path + ' does not list its inputs');
    // Exact rather than a guess at which words look English. Several French
    // and Italian input words are spelled the same as the English ones, and a
    // pattern match would report correct copy as a fault.
    const tool = TOOLS.find((t) => t.id === page.entity && t.family === page.family);
    assert.equal(inputs.value, tool.inputs.map((i) => inputTerm(i, page.language)).join(', '), m.path + ' does not print its declared inputs');
  }
});

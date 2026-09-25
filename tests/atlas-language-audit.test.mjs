// Is the page in the language its URL claims?
//
// A page under /de/ is German because a route put it there, and that is the
// weakest possible evidence. What goes wrong in a programme with nine language
// packs is not a whole page in the wrong language; it is one string. A template
// that forgot to read its copy from the pack, a fallback that reached English
// because a key was missing, a label written once in English and interpolated
// nine times. Each is one sentence in the wrong language in the middle of a page
// that is otherwise fine, and no other check in this suite looks for it.
//
// The audit earns its keep twice over. It has to catch a leak, and it has to not
// report French for writing `pays` and `source`, which are French words. Both
// halves are asserted here, because a language audit that cries wolf gets turned
// off and one that never fires was never an audit.

import test from 'node:test';
import assert from 'node:assert/strict';
import { run as audit, englishIn, markersFor, packWords, visibleStrings, ENGLISH_MARKERS } from '../scripts/atlas/audit-language.mjs';
import { PACKS } from '../lib/atlas/atlas-model.js';
import { MANIFESTS } from '../lib/atlas/serve-pages.js';
import { readFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const pages = MANIFESTS.flatMap((m) => { try { return JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages; } catch { return []; } });

const LANGS = ['de', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt'];

test('no English string leaks onto a page that is not English', () => {
  const r = audit();
  assert.ok(r.pages >= 400, 'only ' + r.pages + ' pages');
  assert.ok(r.strings > 20000, 'only ' + r.strings + ' visible strings checked');
  const shown = r.rows.slice(0, 6).map((x) => x.path + ' ' + x.problems[0].where + ': ' + x.problems[0].why + ' -> ' + JSON.stringify(x.problems[0].text));
  assert.deepEqual(r.rows.map((x) => x.path), [], r.pagesWithProblems + ' pages carry an English string:\n' + shown.join('\n'));
});

test('the audit would catch a leak if one appeared', () => {
  // The exact sentences that would appear if a template stopped reading its pack.
  assert.ok(englishIn('Month by month, from thirty years of normals, which is what the source says.', 'de').length >= 2);
  assert.ok(englishIn('What people earn there, from the official European earnings series.', 'es').length >= 2);
  assert.ok(englishIn('The same question for Thailand, with the same data and the same method.', 'pl').length >= 2);
  assert.ok(englishIn('Your own numbers, worked out on the page.', 'ja').length >= 2);
});

test('and it does not report a language for writing its own words', () => {
  // The correction that made it usable: the first version reported forty French
  // paragraphs for `pays` and `source`.
  assert.deepEqual(englishIn('Le pays et la source des donnees, mois par mois.', 'fr'), []);
  assert.deepEqual(englishIn('Alle Termine, und welche aufs Wochenende fallen.', 'de'), []);
  assert.deepEqual(englishIn('Mismos datos, mismo metodo, otro lugar.', 'es'), []);
  assert.deepEqual(englishIn('Stessi dati, stesso metodo, altro posto.', 'it'), []);
});

test('the exclusions come from each language pack and not from a hand written list', () => {
  for (const l of LANGS) {
    const own = packWords(l);
    assert.ok(own.size > 200, l + ' contributed only ' + own.size + ' words, so its pack was not read');
    const kept = markersFor(l);
    // Most of the list has to survive, or the audit has excluded itself into
    // silence. Two thirds is the floor.
    assert.ok(kept.length >= ENGLISH_MARKERS.length * 0.66, l + ' keeps only ' + kept.length + ' of ' + ENGLISH_MARKERS.length + ' markers');
  }
  // And the shared files are read one language column at a time, or the English
  // column would excuse an English word in German.
  assert.ok(!packWords('de').has('earnings'), 'the English column of a shared file leaked into the German allow list');
  assert.ok(!packWords('ja').has('costs'), 'the English column of a shared file leaked into the Japanese allow list');
});

test('every visible string on a page is actually looked at', () => {
  // A language audit that only reads the H1 finds nothing, so the field list is
  // asserted rather than trusted.
  const p = pages.find((x) => x.locale === 'de' && x.family === 'events.subdivision-holidays');
  const where = visibleStrings(p).map((x) => x.where.replace(/\[\d+\]/g, '[i]'));
  for (const field of ['h1', 'title', 'description', 'facts[i].label', 'sections[i].paragraphs[i]', 'faq[i].q', 'faq[i].a', 'table.caption', 'labels.sources', 'links[i].text', 'cta.primary.label', 'cta.primary.note', 'breadcrumbs[i].name']) {
    assert.ok(where.includes(field), 'the audit never reads ' + field);
  }
  assert.ok(visibleStrings(p).length > 25, 'only ' + visibleStrings(p).length + ' strings on a page');
});

test('every language has a pack, and the packs are the nine the Atlas publishes in', () => {
  assert.deepEqual(Object.keys(PACKS).sort(), ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt']);
});

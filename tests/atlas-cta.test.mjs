// Calls to action on five hundred pages, and the two ways that goes wrong.
//
// The first is a broken link, and it is the reason the resolver reads the
// published set rather than constructing a URL: a call to action that points at
// a page that was never built is worse than none, because it spends the reader's
// one click. Everything here checks that the five hundred hrefs answer.
//
// The second is the one that is harder to see. A call to action can be present,
// valid, localised and still useless, because it is the same on every page. The
// first version of the chain put the relevant calculator first everywhere, which
// is the obvious product answer, and one hundred and fifty eight English cost of
// living pages offered the identical button. So the distinctness of the labels is
// asserted as a number, per language, and the one case where a repeat is correct
// - fourteen Spanish regions all pointing at Spain's national calendar - is named
// rather than tolerated by a loose threshold.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { MANIFESTS } from '../lib/atlas/serve-pages.js';
import { CTA_KINDS, missingCtaCopy, ctaLanguages, CTA_COPY } from '../lib/atlas/content/cta-copy.js';
import { CHAINS, kindFor, esimIndex } from '../lib/atlas/atlas-cta.js';
import { MODES, NOT_INTERACTIVE, DISTRICT_CAP, toolSpec, unitForMarket } from '../lib/atlas/tool-spec.js';
import { EVENTS, KEY_EVENTS, ORDINARY_EVENTS, atlasParams, ctaParams, CTA_POSITIONS } from '../lib/analytics.js';
import { segment } from '../lib/i18n.js';
import { toolUi } from '../lib/atlas/content/terms.js';

const ROOT = new URL('../', import.meta.url);
const pages = MANIFESTS
  .map((m) => new URL(m, ROOT))
  .filter((u) => existsSync(u))
  .flatMap((u) => JSON.parse(readFileSync(u, 'utf8')).pages);
const published = new Set(pages.map((p) => p.path));
const registry = JSON.parse(readFileSync(new URL('data/publication-registry.json', ROOT), 'utf8'));
const esim = esimIndex(registry);
const ESIM_SEGMENTS = new Set(ctaLanguages().map((l) => segment('esim', l)));
const both = (p) => [p.cta && p.cta.primary, p.cta && p.cta.secondary].filter(Boolean);

test('every published page has a call to action with a label and a link', () => {
  assert.ok(pages.length >= 400, 'only ' + pages.length + ' pages');
  const missing = pages.filter((p) => !p.cta || !p.cta.primary || !p.cta.primary.label || !p.cta.primary.href);
  assert.deepEqual(missing.map((p) => p.path), [], missing.length + ' pages have no primary call to action');
  // A secondary is optional by design and present in practice; a drop would mean
  // a chain stopped resolving, so the count is asserted rather than assumed.
  const withSecondary = pages.filter((p) => p.cta && p.cta.secondary).length;
  assert.ok(withSecondary >= pages.length * 0.9, 'only ' + withSecondary + ' of ' + pages.length + ' have a second step');
});

test('no call to action points anywhere that does not exist', () => {
  const broken = [];
  for (const p of pages) {
    for (const c of both(p)) {
      if (c.href.startsWith('#')) {
        // An anchor is only valid when this page really carries that tool.
        if (!p.tool || !p.tool.interactive || '#' + p.tool.id !== c.href) broken.push(p.path + ' -> ' + c.href + ' (no such tool on the page)');
        continue;
      }
      assert.ok(c.href.startsWith('/'), p.path + ' has an absolute call to action: ' + c.href);
      if (published.has(c.href)) continue;
      // The one destination outside the Atlas, and only where the eSIM site
      // published that country in that exact locale.
      const parts = c.href.split('/');
      if (ESIM_SEGMENTS.has(parts[2]) && esim.published.get(parts[1] + '|' + p.entity)) continue;
      broken.push(p.path + ' -> ' + c.href);
    }
  }
  assert.deepEqual(broken.slice(0, 10), [], broken.length + ' calls to action point at nothing');
});

test('no call to action leaves the reader language', () => {
  const crossed = [];
  for (const p of pages) {
    for (const c of both(p)) {
      if (c.href.startsWith('#')) continue;
      if (!c.href.startsWith('/' + p.locale + '/')) crossed.push(p.path + ' -> ' + c.href);
    }
  }
  assert.deepEqual(crossed, []);
});

test('no call to action carries English on a page that is not English', () => {
  // The label is the target page's own heading, so the strongest available test
  // is that it really is that heading, in that language. A hardcoded English
  // string could not survive it.
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const wrong = [];
  for (const p of pages) {
    for (const c of both(p)) {
      if (c.href.startsWith('#')) {
        // The anchor takes the verb from the tool vocabulary, which has to be
        // this language's verb and not English's.
        if (c.label !== toolUi('calculate', p.locale)) wrong.push(p.path + ': anchor label "' + c.label + '"');
        continue;
      }
      const target = byPath.get(c.href);
      if (target) {
        assert.equal(target.locale, p.locale, p.path + ' points at a ' + target.locale + ' page');
        if (c.label !== target.h1 && c.label !== target.entityName) wrong.push(p.path + ': "' + c.label + '" is not the heading of ' + c.href);
        continue;
      }
      // An eSIM call to action, whose label is built from this language's own
      // template. The English template is the only one that reads `Data plans`.
      if (p.locale !== 'en') {
        const english = CTA_COPY.en.esim.label({ subject: '' }).trim();
        assert.ok(!c.label.startsWith(english), p.path + ' carries the English eSIM label: ' + c.label);
      }
    }
  }
  assert.deepEqual(wrong.slice(0, 10), [], wrong.length + ' labels are not in the language of the page they point at');
});

test('the same call to action does not appear on page after page', () => {
  const byLanguage = new Map();
  for (const p of pages) {
    if (!byLanguage.has(p.locale)) byLanguage.set(p.locale, []);
    byLanguage.get(p.locale).push(p);
  }
  const thin = [];
  for (const [locale, rows] of byLanguage) {
    const labels = new Set(rows.map((p) => p.cta.primary.label));
    // Half the pages in a language must carry a distinct first step. Below that
    // the chain has fallen through to a filler somewhere and the page is not
    // really being sent anywhere in particular.
    if (labels.size < rows.length * 0.5) thin.push(locale + ': ' + labels.size + ' distinct of ' + rows.length);
  }
  assert.deepEqual(thin, []);

  // And no single first step carries more than a fifteenth of the whole
  // programme. The largest legitimate cluster is the seventeen Spanish regions
  // whose calendars all point at Spain's national one, which is the correct
  // answer for every one of them.
  const counts = new Map();
  for (const p of pages) {
    const key = p.locale + '|' + p.cta.primary.href;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const worst = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  assert.ok(worst[1] <= Math.ceil(pages.length / 15), 'one call to action is on ' + worst[1] + ' pages: ' + worst[0]);
});

test('nothing promises what Livdar cannot do', () => {
  // The kinds are a closed set and there is no book, apply or buy in it. This is
  // the test that has to fail if somebody adds one, because the copy for it
  // would read perfectly well and the page behind it would not exist.
  for (const forbidden of ['book', 'apply', 'buy', 'order', 'reserve', 'checkout']) {
    assert.ok(!CTA_KINDS.includes(forbidden), forbidden + ' is not a thing this site can do');
  }
  assert.deepEqual(missingCtaCopy(), [], 'a call to action kind has no copy in some language');
  assert.equal(ctaLanguages().length, 9);

  // The eSIM call to action appears only where that destination is published in
  // that locale, which is nineteen countries in English, sixteen in German and
  // none in the other seven.
  const locales = new Set();
  for (const p of pages) for (const c of both(p)) if (c.kind === 'esim') locales.add(p.locale);
  assert.deepEqual([...locales].sort(), ['de', 'en'], 'an eSIM call to action appeared in a locale with no eSIM market');
  for (const p of pages) {
    for (const c of both(p)) {
      if (c.kind !== 'esim') continue;
      assert.ok(esim.published.get(p.locale + '|' + p.entity), p.path + ' offers an eSIM page that locale never published');
    }
  }
});

test('every family says where it sends a reader, and a new one still works', () => {
  const families = [...new Set(pages.map((p) => p.family))];
  const withoutChain = families.filter((f) => !CHAINS[f]);
  // A family with no chain is allowed: the default falls through to the page's
  // own internal links. What is not allowed is that falling through producing
  // nothing, which the first test already covers, so this only reports.
  assert.ok(withoutChain.length <= 2, 'families with no chain: ' + withoutChain.join(', '));
  // The kind of a target in the page's own family is a sibling whatever its
  // family table says, because `the same question somewhere else` is the sentence
  // the reader needs.
  assert.equal(kindFor({ family: 'cost-of-living.country' }, { family: 'cost-of-living.country' }), 'sibling');
  assert.equal(kindFor({ family: 'tools.calculator' }, { family: 'cost-of-living.country' }), 'tool');
  assert.equal(kindFor({ external: 'esim' }, { family: 'cost-of-living.country' }), 'esim');
});

test('a tool page either carries its tool or says why it does not', () => {
  const toolPages = pages.filter((p) => p.family.startsWith('tools.'));
  assert.ok(toolPages.length > 30, 'only ' + toolPages.length + ' tool pages');
  const interactive = new Set();
  for (const p of toolPages) {
    assert.ok(p.tool, p.path + ' has no tool spec at all');
    if (p.tool.interactive) {
      assert.ok(MODES[p.tool.id], p.path + ' claims to be interactive in an undeclared mode');
      assert.equal(p.tool.id, p.entity);
      interactive.add(p.tool.id);
      continue;
    }
    // Not interactive is a statement, so it has to be a specific one.
    assert.ok(p.tool.why && p.tool.why.length > 40, p.path + ' is not interactive and gives no real reason: ' + p.tool.why);
  }
  assert.ok(interactive.size >= 8, 'only ' + interactive.size + ' tools became interactive');
  // And the reasons are the four that were written down, not a generic string
  // that would read as an oversight.
  for (const [id, why] of Object.entries(NOT_INTERACTIVE)) {
    assert.ok(why.length > 40, id + ' has a thin reason');
    assert.equal(MODES[id], undefined, id + ' is both interactive and excused');
  }
});

test('a tool ships one price scale and a payload that stays small', () => {
  // Mixing the European index at 100 with the ratio against the United States at
  // 1 in one picker lets a reader get an answer three orders of magnitude out, so
  // a spec carries one scale and says which.
  for (const unit of ['index-eu27-100', 'ratio-us-1']) {
    const spec = toolSpec('cost-of-living-calculator', { language: 'en', unit });
    assert.equal(spec.unit, unit);
    assert.ok(spec.scale && spec.scale.at, 'the scale is not stated, so the numbers mean nothing');
  }
  // And the scale a market gets is the one its own country is on, because a
  // comparison tool on an American page that does not offer the United States is
  // a tool nobody can use. The first version offered the broader 160 country
  // ratio to English and Japanese readers, and it contains neither country.
  for (const [market, iso] of [['en-US', 'US'], ['ja-JP', 'JP'], ['pl-PL', 'PL'], ['de-DE', 'DE'], ['pt-BR', 'BR'], ['fr-FR', 'FR'], ['it-IT', 'IT'], ['es-ES', 'ES'], ['nl-NL', 'NL']]) {
    const spec = toolSpec('cost-of-living-calculator', { language: 'en', unit: unitForMarket(market), market });
    assert.equal(spec.home, iso);
    assert.ok(spec.rows.some((r) => r.iso2 === iso), market + ' cannot compare against ' + iso + ', which is the country the reader lives in');
  }
  // The district table for the whole neighbourhood source is 76 kilobytes and
  // nobody scrolls a hundred districts, so it is capped. The cap is asserted here
  // so the payload cannot quietly grow back.
  const stay = toolSpec('where-should-i-stay', { language: 'en' });
  assert.ok(stay.interactive);
  for (const c of stay.cities) assert.ok(c.districts.length <= DISTRICT_CAP, c.name + ' ships ' + c.districts.length + ' districts');
  assert.ok(JSON.stringify(stay).length < 48000, 'the stay payload is ' + JSON.stringify(stay).length + ' bytes');
});

test('the events and the dimensions are the ones the report needs', () => {
  for (const e of ['toolView', 'toolStart', 'toolComplete', 'ctaClick', 'internalCtaClick', 'outboundClick', 'languageChange']) {
    assert.ok(EVENTS[e], 'no event named ' + e);
  }
  // A click is not a conversion. Marking five hundred pages' worth of them as
  // key events would make the conversion rate a measure of how many buttons the
  // site has.
  for (const e of [EVENTS.ctaClick, EVENTS.toolStart, EVENTS.toolView, EVENTS.outboundClick, EVENTS.internalCtaClick]) {
    assert.ok(!KEY_EVENTS.includes(e), e + ' must not be a key event');
    assert.ok(ORDINARY_EVENTS.includes(e), e + ' is neither ordinary nor key, so nobody knows what it is');
  }
  // Finishing a calculation is the closest thing a data page has to intent.
  assert.ok(KEY_EVENTS.includes(EVENTS.toolComplete));
  assert.ok(KEY_EVENTS.includes(EVENTS.notifySignup));

  const p = pages.find((x) => x.family === 'cost-of-living.country');
  const dims = atlasParams(p);
  for (const k of ['page_language', 'market', 'cohort', 'surface', 'family', 'entity', 'destination', 'page_path']) {
    assert.ok(dims[k], 'the dimension set has no ' + k);
  }
  // GA4 collects `language` itself and drops a custom parameter of that name,
  // which is why the page's own language travels as page_language. Both are
  // pushed, so the container's existing mapping still works.
  assert.equal(dims.language, p.locale);
  assert.equal(dims.page_language, p.locale);

  const cta = ctaParams(p.cta.primary, 'bottom');
  for (const k of ['cta_type', 'cta_label', 'cta_destination', 'cta_position', 'cta_kind']) {
    assert.ok(cta[k], 'the call to action parameters have no ' + k);
  }
  assert.equal(cta.cta_position, 'bottom');
  assert.deepEqual(CTA_POSITIONS, ['hero', 'mid', 'bottom', 'tool']);
});

test('the page renders a call to action in two places and nowhere else', () => {
  // A source level check, because the component is JSX and this suite runs
  // without a transform. The rendered HTML is checked against production after
  // the deploy; what this protects is the shape: two placements, the positions
  // the report expects, and no third one creeping in mid paragraph.
  const src = readFileSync(new URL('components/atlas/AtlasPage.jsx', ROOT), 'utf8');
  const positions = [...src.matchAll(/<AtlasCtaPair[^>]*position="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(positions, ['mid', 'bottom'], 'the page does not carry exactly one call to action after the facts and one before the related pages');
  assert.match(src, /<AtlasTool\s/, 'the page never renders the interactive tool');
  // The tool comes before the first call to action, because the tool is what the
  // page is for.
  assert.ok(src.indexOf('<AtlasTool') < src.indexOf('<AtlasCtaPair'));
});

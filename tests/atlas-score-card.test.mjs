// The verdict card, adapted from the affordability card in the V164 reference.
//
// Three things it has to do, and each is the reason the design was worth taking.
//
// The state has to be in the background. A reader landing from a search result
// glances at the block and has the answer before reading a digit, which is the only
// way a calculator on a page like this gets used. So the digits stay white in every
// state and the gradient is what moves.
//
// The thresholds have to be the published rule rather than four bands chosen to
// give four colours. Thirty per cent is the share most landlords and lenders test
// against and thirty five is the ceiling past which the rest of a budget gives way;
// both come from lib/atlas/tools/rent-affordability.js and are asserted against it
// here so the card and the page cannot disagree.
//
// And it must not be forced onto tools it does not suit. The reference card answers
// `how does this number compare to what I can bear`, which the affordability and
// comparison modes ask and the salary, matcher, district and moving modes do not.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { STATES, GRADIENTS, BANDS, stateForShare, stateForRatio, fillForShare, gradientFor } from '../lib/atlas/tool-verdict.js';
import { SHARES, rentBudget } from '../lib/atlas/tools/rent-affordability.js';
import { VERDICTS, CARD_UI, verdictLabel, cardUi } from '../lib/atlas/content/terms.js';
import { MODES, toolSpec } from '../lib/atlas/tool-spec.js';
import { MANIFESTS } from '../lib/atlas/serve-pages.js';

const ROOT = new URL('../', import.meta.url);
const LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt'];
const pages = MANIFESTS
  .map((m) => new URL(m, ROOT))
  .filter((u) => existsSync(u))
  .flatMap((u) => JSON.parse(readFileSync(u, 'utf8')).pages);
// The modes the card is applied to, and the ones it is deliberately not.
const CARD_MODES = ['share', 'ratio'];

test('the bands are the published rule and not four numbers that give four colours', () => {
  assert.deepEqual(STATES, ['comfortable', 'healthy', 'tight', 'unaffordable']);
  // The first two thresholds are the shares the tool module itself publishes.
  assert.deepEqual(SHARES.map((s) => s.share), [0.3, 0.35]);
  assert.equal(BANDS[0].upTo, SHARES[0].share, 'the comfortable band does not end where the 30 per cent rule does');
  assert.equal(BANDS[1].upTo, SHARES[1].share, 'the healthy band does not end where the 35 per cent rule does');
  assert.equal(BANDS[2].upTo, 0.50, 'the tight band should end at half an income');

  assert.equal(stateForShare(0.29), 'comfortable');
  assert.equal(stateForShare(0.30), 'comfortable');
  assert.equal(stateForShare(0.31), 'healthy');
  assert.equal(stateForShare(0.35), 'healthy');
  assert.equal(stateForShare(0.36), 'tight');
  assert.equal(stateForShare(0.50), 'tight');
  assert.equal(stateForShare(0.51), 'unaffordable');

  // An empty input is not a comfortable nought. `null >= 0` is true in JavaScript,
  // which is how a card with nothing in it could have shown a verdict.
  for (const nothing of [null, undefined, '', NaN, -1]) assert.equal(stateForShare(nothing), null, JSON.stringify(nothing) + ' produced a verdict');
  assert.equal(fillForShare(null), 0);
  // And the orb caps, because a rent of twice an income is not a fuller circle
  // than a rent of one and a half.
  assert.equal(fillForShare(1.8), 100);
  assert.equal(fillForShare(0.43), 43);
});

test('the comparison uses the same four states with a wide middle', () => {
  assert.equal(stateForRatio(0.42), 'comfortable');
  assert.equal(stateForRatio(0.85), 'comfortable');
  // A place that costs one per cent more than home has not become a problem. The
  // first version turned orange there.
  assert.equal(stateForRatio(1.01), 'healthy');
  assert.equal(stateForRatio(1.15), 'healthy');
  assert.equal(stateForRatio(1.24), 'tight');
  assert.equal(stateForRatio(2.4), 'unaffordable');
  for (const nothing of [null, 0, -2, NaN]) assert.equal(stateForRatio(nothing), null);
});

test('every state has a gradient and the gradients are all different', () => {
  const seen = new Set();
  for (const s of STATES) {
    const g = gradientFor(s);
    assert.match(g, /^linear-gradient\(/, s + ' has no gradient');
    assert.ok(!seen.has(g), s + ' shares its gradient with another state');
    seen.add(g);
  }
  assert.equal(Object.keys(GRADIENTS).length, STATES.length);
  // An unknown state falls back rather than rendering with no background at all.
  assert.equal(gradientFor('nonsense'), GRADIENTS.comfortable);
});

test('the card is one coloured block with no white strip and nothing behind a button', () => {
  // Comments stripped, because both files explain at length what was removed from
  // the reference and the first version of this test matched its own documentation.
  const strip = (src) => src.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const jsx = strip(readFileSync(new URL('components/atlas/AtlasScoreCard.jsx', ROOT), 'utf8'));
  const css = strip(readFileSync(new URL('app/atlas.css', ROOT), 'utf8'));
  const tool = strip(readFileSync(new URL('components/atlas/AtlasTool.jsx', ROOT), 'utf8'));

  // The reference put its headline figure in a white strip under the coloured
  // block, with an `Adjust budget` button that opened the controls in a modal.
  // Neither survives.
  assert.ok(!/afford-footer|score-footer/.test(jsx + css), 'a footer strip came back');
  assert.ok(!/Adjust|adjust budget/i.test(jsx + tool), 'a button that hides the controls came back');
  assert.ok(!/atlas-score-card[^{]*\{[^}]*background:\s*#fff/.test(css), 'the card has a white area');
  // The headline lives inside the coloured card.
  assert.match(jsx, /atlas-score-headline/);
  const cardBlock = jsx.slice(jsx.indexOf('atlas-score-card'), jsx.indexOf('atlas-score-shell', jsx.indexOf('atlas-score-card')) + 1 || jsx.length);
  assert.ok(cardBlock.includes('atlas-score-headline'), 'the headline is outside the coloured block');

  // The background is what carries the state. A class per state would put the rule
  // in two places, so it is inline from the computed gradient.
  assert.match(jsx, /style=\{gradient \? \{ background: gradient \}/);
  // And the transition is on background only, so no layout moves between states.
  assert.match(css, /\.atlas-score-card \{[^}]*transition: background \./s);
  assert.match(css, /prefers-reduced-motion/);
  // One height in every state, so the controls under it do not move under a thumb.
  assert.match(css, /\.atlas-score-card \{[^}]*min-height:/s);

  // The controls are rendered directly after the card in both modes that use it.
  for (const mode of ['Share', 'Ratio']) {
    const fn = tool.slice(tool.indexOf('function ' + mode + '('), tool.indexOf('function ' + mode + '(') + 6000);
    const card = fn.indexOf('<AtlasScoreCard');
    const controls = fn.indexOf('atlas-tool-controls');
    assert.ok(card > 0 && controls > card, mode + ' does not put its controls directly below the card');
  }
});

test('the card is used where it fits and nowhere else', () => {
  const tool = readFileSync(new URL('components/atlas/AtlasTool.jsx', ROOT), 'utf8');
  // The modes it is applied to.
  for (const mode of CARD_MODES) assert.ok(MODES && Object.values(MODES).includes(mode), mode + ' is not a declared mode');
  // The four it is not. The reference card answers `how does this number compare to
  // what I can bear`; a list of districts and a gross salary figure do not ask that,
  // and forcing the card onto them would be a coloured block with nothing to say.
  for (const mode of ['earn', 'filter', 'stay', 'move']) {
    const fn = tool.slice(tool.indexOf("spec.mode === '" + mode + "'"));
    const body = tool.slice(tool.indexOf('function ' + mode[0].toUpperCase() + mode.slice(1) + '('));
    const decl = body.slice(0, body.indexOf('\n}\n'));
    assert.ok(!decl.includes('<AtlasScoreCard'), mode + ' was given the card and the card has nothing to say there');
    assert.ok(fn.length > 0);
  }
  // And the pages that get it are the ones in those two modes, in every language.
  const withCard = pages.filter((p) => p.tool && p.tool.interactive && CARD_MODES.includes(p.tool.mode));
  assert.ok(withCard.length >= 18, 'only ' + withCard.length + ' pages carry the card');
  assert.ok(new Set(withCard.map((p) => p.locale)).size >= 8, 'the card reaches only ' + new Set(withCard.map((p) => p.locale)).size + ' languages');
  // Each one has a localised heading to put on it, rather than falling back to a verb.
  for (const p of withCard) assert.ok(p.tool.title && p.tool.title.length > 2, p.path + ' has no title for the card');
});

test('every word on the card exists in all nine languages', () => {
  for (const [table, name] of [[VERDICTS, 'verdict'], [CARD_UI, 'card string']]) {
    for (const [key, row] of Object.entries(table)) {
      for (const l of LANGS) assert.ok(row[l], name + ' ' + key + ' is missing in ' + l);
    }
  }
  // The verdict is the one string a reader actually reads off the card, so it says
  // what the state means rather than naming a colour.
  for (const s of STATES) {
    for (const l of LANGS) {
      const label = verdictLabel(s, l);
      assert.ok(label, s + ' has no label in ' + l);
      assert.ok(!/green|red|orange|gruen|rot|vert|rouge|verde|rosso|groen|zielon|czerwon/i.test(label), s + ' in ' + l + ' names a colour: ' + label);
    }
  }
  // And the card holds no vocabulary of its own: every string arrives from the page,
  // which is what lets the language audit see all of them.
  const jsx = readFileSync(new URL('components/atlas/AtlasScoreCard.jsx', ROOT), 'utf8');
  const literals = [...jsx.matchAll(/>([A-Za-z][A-Za-z ']{3,})</g)].map((m) => m[1]);
  assert.deepEqual(literals, [], 'the card has hardcoded copy: ' + literals.join(', '));
  assert.ok(cardUi('at30', 'ja'));
});

test('the card changes nothing about the arithmetic underneath it', () => {
  // The rent budget is still the published rule, untouched by the card that now
  // displays it.
  const r = rentBudget({ income: 3000, household: 2 });
  assert.deepEqual(r.rows.map((x) => x.percent), [30, 35]);
  assert.deepEqual(r.rows.map((x) => x.monthly), [900, 1050]);
  assert.deepEqual(r.rows.map((x) => x.perPerson), [450, 525]);
  // The share the card colours by is the reader's rent over the reader's income and
  // nothing else, so the state and the figures cannot disagree.
  assert.equal(stateForShare(900 / 3000), 'comfortable');
  assert.equal(stateForShare(1050 / 3000), 'healthy');
  // The comparison still ships one scale with the reader's own country on it.
  const spec = toolSpec('cost-of-living-calculator', { language: 'en', market: 'en-US', title: 'Cost of living calculator' });
  assert.equal(spec.title, 'Cost of living calculator');
  assert.ok(spec.rows.some((x) => x.iso2 === spec.home));
});

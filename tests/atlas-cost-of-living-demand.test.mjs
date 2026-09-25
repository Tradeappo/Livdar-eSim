import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { countryOf, stemMatch, run as measure, AMBIGUOUS } from '../scripts/atlas/measure-cost-of-living.mjs';
import { sourceCoverage, resetCaches } from '../lib/atlas/eligibility-pages.js';
import { neighbours, store as colStore } from '../lib/atlas/cost-of-living.js';
import { build, PACKS } from '../lib/atlas/atlas-model.js';
import { plain } from '../lib/atlas/content/country-forms.js';

const LANGS = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ja'];
const isoList = () => { resetCaches(); return [...sourceCoverage()['cost-of-living-verified']]; };

test('the resolver reproduces every mapping that was already in the plan', () => {
  // The safety property that licensed using this at all. A wrong mapping does
  // not produce a thin page, it produces a page about the wrong country, and
  // no amount of coverage is worth one of those.
  const iso = isoList();
  const rows = JSON.parse(readFileSync(new URL('../data/atlas/measurement-plan.json', import.meta.url), 'utf8'))
    .rows.filter((r) => r.family === 'cost-of-living.country' && r.market !== 'en-GB');
  assert.ok(rows.length > 300, 'only ' + rows.length + ' rows to check against');
  const wrong = [];
  for (const r of rows) {
    const res = countryOf(r.q, r.market, iso);
    if (res.iso2 && res.iso2 !== r.entity) wrong.push(r.market + ' "' + r.q + '" resolved ' + res.iso2 + ', plan says ' + r.entity);
  }
  assert.deepEqual(wrong, [], 'the resolver contradicts the plan');
});

test('a place inside a country is not demand for the country', () => {
  const iso = isoList();
  // United States states and cities dominate the English head term, and every
  // one of them would be a page about the wrong thing.
  for (const k of ['cost of living in california', 'cost of living in new york', 'cost of living in texas', 'cost of living in seattle']) {
    assert.equal(countryOf(k, 'en-US', iso).iso2, undefined, k + ' was accepted');
  }
  // Cities and islands in the other markets, including the ones that sit high
  // in their market's list.
  assert.equal(countryOf('custo de vida em sao paulo', 'pt-BR', iso).iso2, undefined);
  assert.equal(countryOf('custo de vida em santa catarina', 'pt-BR', iso).iso2, undefined);
  assert.equal(countryOf('costo della vita a praga', 'it-IT', iso).iso2, undefined);
  assert.equal(countryOf('madeira costo della vita', 'it-IT', iso).iso2, undefined);
  assert.equal(countryOf('coste de vida en barcelona', 'es-ES', iso).iso2, undefined);
  assert.equal(countryOf('koszty życia w warszawie', 'pl-PL', iso).iso2, undefined);
  assert.equal(countryOf('lebenshaltungskosten münchen', 'de-DE', iso).iso2, undefined);
  assert.equal(countryOf('cout de la vie budapest', 'fr-FR', iso).iso2, undefined);
  // Dubai and Bali are the interesting ones: they are how these markets ask
  // about the Emirates and Indonesia, and they are still cities.
  assert.equal(countryOf('cost of living in dubai', 'en-US', iso).iso2, undefined);
  assert.equal(countryOf('bali lebenshaltungskosten', 'de-DE', iso).iso2, undefined);
  // And the head term with nothing after it is not a page.
  assert.equal(countryOf('cost of living', 'en-US', iso).iso2, undefined);
});

test('a name that is a country somewhere and a state here is refused here', () => {
  const iso = isoList();
  // `cost of living in georgia` is 1,400 a month in the United States and is
  // about Atlanta, not Tbilisi. The identical remainder in Italian is the
  // country, so this has to be per market rather than global.
  assert.ok(AMBIGUOUS['en-US'].has('georgia'));
  assert.equal(countryOf('cost of living in georgia', 'en-US', iso).iso2, undefined);
  assert.equal(countryOf('costo della vita in georgia', 'it-IT', iso).iso2, 'GE');
  assert.equal(countryOf('koszty życia w gruzji', 'pl-PL', iso).iso2, 'GE');
});

test('inflection and colloquial names resolve, and a shared first word does not', () => {
  const iso = isoList();
  // Polish only ever appears in the locative.
  assert.equal(countryOf('koszty życia w hiszpanii', 'pl-PL', iso).iso2, 'ES');
  assert.equal(countryOf('koszty życia we włoszech', 'pl-PL', iso).iso2, 'IT');
  assert.equal(countryOf('koszty życia na filipinach', 'pl-PL', iso).iso2, 'PH');
  // What the market calls the place, rather than what CLDR calls it.
  assert.equal(countryOf('lebenshaltungskosten england', 'de-DE', iso).iso2, 'GB');
  assert.equal(countryOf('custo de vida nos eua', 'pt-BR', iso).iso2, 'US');
  assert.equal(countryOf('coste de vida holanda', 'es-ES', iso).iso2, 'NL');

  // The stem rule refuses multi word names, because a shared leading word is
  // not evidence: `santa catarina` is a Brazilian state and it stems happily
  // onto `santa lucia`.
  const rows = [{ iso: 'LC', name: 'santa lucia' }];
  assert.equal(stemMatch('santa catarina', rows), null);
  assert.equal(stemMatch('polsce', [{ iso: 'PL', name: 'polska' }]), 'PL');
  // `austrii` is the Polish locative of Austria and `australii` is the locative
  // of Australia, and the rule now tells them apart: it forgives an ending and
  // not a divergence, so only Austria keeps enough of its name to match.
  assert.equal(stemMatch('austrii', [{ iso: 'AT', name: 'austria' }, { iso: 'AU', name: 'australia' }]), 'AT');
  assert.equal(stemMatch('australii', [{ iso: 'AT', name: 'austria' }, { iso: 'AU', name: 'australia' }]), 'AU');

  // What the rule must never do again. `cost of living in colorado` was two
  // thousand six hundred searches a month and it built a page about Colombia,
  // because four shared letters out of eight cleared a fifty-five per cent bar.
  // `feiertage niedersachsen 2026` was forty-seven thousand and it built a
  // second page about the Netherlands, on the same arithmetic, next to the
  // correct page about Lower Saxony. Neither remainder is an inflection of
  // anything.
  assert.equal(stemMatch('colorado', [{ iso: 'CO', name: 'colombia' }]), null);
  assert.equal(stemMatch('niedersachsen', [{ iso: 'NL', name: 'niederlande' }]), null);
  assert.equal(countryOf('cost of living in colorado', 'en-US', iso).iso2, undefined);
  // And the whole world, not a short list, because a stem match inside a short
  // list is a match against whatever happens to be there.
  assert.equal(countryOf('average salary in indiana', 'en-US', iso).iso2, undefined);
});

test('the measurement only plans pages the source and the language can carry', async () => {
  const r = measure();
  const { subject } = await import('../lib/atlas/content/country-forms.js');
  const covered = sourceCoverage()['cost-of-living-verified'];
  assert.ok(r.pairs > 200, 'only ' + r.pairs + ' pairs resolved');
  const seen = new Set();
  for (const row of r.rows) {
    assert.ok(covered.has(row.entity), row.entity + ' is not covered by the source');
    // French, Italian and Portuguese refuse a page for a country with no
    // stored subject form rather than printing an ungrammatical sentence, so
    // planning one would plan a refusal.
    assert.ok(subject(row.entity, row.language), row.language + ' has no subject form for ' + row.entity);
    const key = row.entity + '|' + row.market;
    assert.ok(!seen.has(key), 'two keywords planned for ' + key);
    seen.add(key);
  }
});

test('every language names the country in its own meta description', () => {
  // Five of the nine packs took the country and never used it: they said
  // `allí`, `viverci`, `lá`, `daar` and `tam`. Two countries with the same
  // price level then shipped byte identical descriptions, which is how
  // Argentina and Brazil collided.
  for (const l of LANGS) {
    const a = PACKS[l].col.description({ c: 'Aaaaland', value: '1,00', year: '2025' });
    const b = PACKS[l].col.description({ c: 'Bbbbland', value: '1,00', year: '2025' });
    assert.notEqual(a, b, l + ' writes the same description for two different countries');
    assert.ok(a.includes('Aaaaland'), l + ' does not name the country in its description');
  }
});

test('the neighbours come from the same scale and bracket the country', () => {
  const s = colStore();
  for (const iso2 of ['BR', 'AR', 'TH', 'VN', 'PL', 'DE']) {
    const n = neighbours(iso2);
    if (!n) continue;
    const own = s.countries[iso2];
    const unit = (own.measures.A01 || own.measures[own.headlineMeasure]).unit;
    // The two scales never mix, so a neighbour from the other one would be a
    // comparison nobody measured.
    assert.equal(n.unit, unit, iso2 + ' borrowed a neighbour from the other scale');
    if (n.cheaper) assert.ok(n.cheaper.value <= n.value, iso2 + ' has a cheaper neighbour that costs more');
    if (n.dearer) assert.ok(n.dearer.value >= n.value, iso2 + ' has a dearer neighbour that costs less');
    assert.ok(n.rankCheapestFirst >= 1 && n.rankCheapestFirst <= n.of);
  }
  // The cheapest country on a scale has no cheaper neighbour, and the page
  // says so rather than printing an empty sentence.
  const all = Object.entries(s.countries)
    .map(([iso2, c]) => ({ iso2, m: c.measures.A01 || c.measures[c.headlineMeasure] }))
    .filter((x) => x.m && x.m.unit === 'ratio-us-1')
    .sort((a, b) => a.m.value - b.m.value);
  assert.equal(neighbours(all[0].iso2).cheaper, null);
  assert.equal(neighbours(all[all.length - 1].iso2).dearer, null);
});

test('two countries at the same price level no longer read as the same page', () => {
  // Argentina and Brazil are both 0.46 against the United States, both carry
  // only the World Bank ratio and neither has an inflation series, so before
  // the neighbours sentence their pages differed by a name and a rank.
  const page = (entity, language, market, keyword) => build({ family: 'cost-of-living.country', surface: 'move', entity, language, market, keyword });
  const br = page('BR', 'pt', 'pt-BR', 'custo de vida no brasil');
  const ar = page('AR', 'pt', 'pt-BR', 'custo de vida na argentina');
  assert.ok(!br.refused && !ar.refused);
  assert.notEqual(br.description, ar.description);
  const brBody = br.paragraphs.join(' ');
  const arBody = ar.paragraphs.join(' ');
  assert.notEqual(brBody, arBody);
  // Each names its own neighbours, which is measured data rather than padding.
  assert.ok(brBody.includes(plain('DJ', 'pt')) || brBody.includes(plain('AR', 'pt')), 'Brazil does not name a neighbour');
  assert.ok(arBody.includes(plain('HN', 'pt')) || arBody.includes(plain('BR', 'pt')), 'Argentina does not name a neighbour');
});

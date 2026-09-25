// The direction the other checks cannot see.
//
// A page carries a keyword, an entity, a slug, a title and an H1, and four of
// those five are derived from the entity. Every existing check compares derived
// fields against each other, so a page built for the wrong entity passes all of
// them: it is perfectly consistent with itself and about the wrong place.
//
// /en/cost-of-living/colombia/ was published for `cost of living in colorado`,
// two thousand six hundred searches a month in the United States, and its H1
// read `Cost of living in Colorado` above a body about Colombia. The stem rule
// that exists to forgive a Polish locative accepted four shared letters out of
// eight and, because no other country begins `colo`, returned a single
// confident hit. The same arithmetic gave `feiertage niedersachsen 2026`,
// forty-seven thousand a month, a second page about the Netherlands next to the
// correct page about Lower Saxony, so one keyword paid for two pages.
//
// So this test asks the one question the derivation cannot: does the keyword
// name the entity the page is about.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run as audit, formsFor, names, distinctive } from '../scripts/atlas/audit-entities.mjs';
import { ledger } from '../scripts/atlas/apply-keyword-corrections.mjs';
import { MANIFESTS } from '../lib/atlas/serve-pages.js';

const ROOT = new URL('../', import.meta.url);

test('every published page is about the entity its keyword names', () => {
  const r = audit();
  assert.ok(r.audited >= 400, 'only ' + r.audited + ' pages audited');
  assert.ok(r.checked >= 350, 'only ' + r.checked + ' pages have a destination entity to check');
  const shown = r.rows.slice(0, 5).map((x) => x.path + ': ' + x.problems.join('; ') + ' (keyword "' + x.keyword + '", entity ' + x.entity + ')');
  assert.deepEqual(r.rows.map((x) => x.path), [], r.mismatches + ' pages do not name their entity:\n' + shown.join('\n'));
});

test('the audit can tell an inflection from a different place', () => {
  // Both halves matter. Refusing every inflected form would report three
  // hundred false mismatches and the two real ones would be invisible in them.
  assert.equal(names('dzielnice nowego jorku', 'Nowy Jork'), true);
  assert.equal(names('koszty zycia w szwajcarii', 'Szwajcaria'), true);
  assert.equal(names('festivos baleares 2026', distinctive('Illes Balears')), true);
  assert.equal(names('feiertage baden wuerttemberg 2026', 'Baden-Wuerttemberg'), true);

  assert.equal(names('cost of living in colorado', 'Colombia'), false);
  assert.equal(names('feiertage niedersachsen 2026', 'Niederlande'), false);
  // A three letter abbreviation is not an inflection of a seven letter name.
  assert.equal(names('irl 2026', 'Irlande'), false);
});

test('a calculator and a ranking are counted rather than skipped in silence', () => {
  const r = audit();
  assert.ok(r.byKind.tool > 0 && r.byKind.ranking > 0);
  assert.equal(r.checked, r.audited - r.byKind.tool - r.byKind.ranking - (r.byKind.none || 0));
  // And the families that do have a destination all reach a form list, because
  // an entity kind this audit cannot describe would pass by being unknown.
  for (const [entity, family, language] of [['CO', 'cost-of-living.country', 'en'], ['ES-IB', 'events.subdivision-holidays', 'es'], ['3173435', 'neighbourhoods.city-where-to-stay', 'it'], ['1850147:hiking', 'sport.city-season', 'ja']]) {
    const f = formsFor(entity, family, language);
    assert.ok(f.forms.length > 0, family + ' gives no forms for ' + entity);
  }
});

test('the corrections the audit found are recorded and applied', () => {
  const rows = ledger();
  assert.ok(rows.length >= 2, 'the ledger holds ' + rows.length + ' corrections');
  const models = MANIFESTS.flatMap((m) => {
    try { return JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages; } catch { return []; }
  });
  const specs = ['001', '002'].flatMap((c) => {
    try { return JSON.parse(readFileSync(new URL('data/atlas/cohorts/cohort-' + c + '.json', ROOT), 'utf8')).pages; } catch { return []; }
  });
  for (const c of rows) {
    // The URL stays. A misattributed keyword is a measurement error and the
    // repair for a measurement error is not to unpublish a page whose body was
    // right all along.
    const model = models.find((m) => m.path === c.path);
    assert.ok(model, c.path + ' is in the corrections ledger and no longer published');
    assert.equal(model.keyword, c.becomes, c.path + ' still carries a keyword the ledger withdrew');
    // And the heading names the entity rather than whatever the keyword named.
    const { forms } = formsFor(model.entity, model.family, model.locale);
    assert.ok(forms.some((f) => names(model.h1, f)), c.path + ' does not name its entity in its H1: ' + model.h1);

    const spec = specs.find((s) => s.path === c.path);
    assert.ok(spec, c.path + ' is not in any cohort manifest');
    assert.equal(spec.volume, 0, c.path + ' still claims the volume the withdrawn keyword carried');
    assert.equal(spec.keywordCorrected.was, c.was);
  }
});

test('no two pages are built from the same keyword in the same market', () => {
  // How the Netherlands page was found. One keyword paying for two pages is
  // either a duplicate or a misattribution, and both are worth a failure.
  const models = MANIFESTS.flatMap((m) => {
    try { return JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')).pages; } catch { return []; }
  });
  const seen = new Map();
  const shared = [];
  for (const p of models) {
    if (!p.keyword) continue;
    const key = p.market + '|' + p.keyword.toLowerCase();
    if (seen.has(key)) shared.push(key + ': ' + seen.get(key) + ' and ' + p.path);
    else seen.set(key, p.path);
  }
  assert.deepEqual(shared, []);
});

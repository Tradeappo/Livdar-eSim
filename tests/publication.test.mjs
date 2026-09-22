import test from 'node:test';
import assert from 'node:assert/strict';
import { gate, publicationState, authoredIds, publishedDestinationIds } from '../lib/content/index.js';
import { checkRegistry, expectedPublishedUrls, loadRegistry } from '../scripts/publication.mjs';
import { nextLifecycleState } from '../lib/programmatic/eligibility.js';

const tables = { en: { morocco: { h1: 'x' }, japan: { h1: 'y' } } };

test('only published registry entries are routed', () => {
  const registry = { entries: { 'en:destination:japan': { state: 'published' }, 'en:destination:morocco': { state: 'approved' } } };
  assert.deepEqual(Object.keys(gate(tables, 'destination', registry).en), ['japan']);
});

test('retiring an entry is a rollback that removes the page without deleting content', () => {
  const registry = { entries: { 'en:destination:japan': { state: 'published' }, 'en:destination:morocco': { state: 'published' } } };
  const next = nextLifecycleState(registry.entries['en:destination:morocco'].state, 'retire');
  assert.equal(next, 'retired');
  registry.entries['en:destination:morocco'].state = next;
  assert.deepEqual(Object.keys(gate(tables, 'destination', registry).en), ['japan']);
  assert.ok(tables.en.morocco, 'content is untouched');
});

test('an authored page with no registry entry is a draft and is not routed', () => {
  assert.equal(publicationState('en', 'destination', 'atlantis', { entries: {} }), 'unregistered');
  assert.deepEqual(Object.keys(gate(tables, 'destination', { entries: {} }).en), []);
});

test('lifecycle refuses to publish straight from a draft', () => {
  assert.equal(nextLifecycleState('drafted', 'publish'), null);
  assert.equal(nextLifecycleState('approved', 'publish'), 'published');
});

test('the committed registry and the authored content agree', () => {
  const result = checkRegistry();
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.unregisteredDrafts, []);
});

test('every live destination is authored and published in the registry', () => {
  const registry = loadRegistry();
  ['en', 'de', 'ro'].forEach((locale) => {
    publishedDestinationIds(locale).forEach((id) => {
      assert.equal(registry.entries[locale + ':destination:' + id].state, 'published');
      assert.ok(authoredIds(locale, 'destination').includes(id));
    });
  });
  assert.equal(expectedPublishedUrls(registry), 115);
});

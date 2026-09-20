import test from 'node:test';
import assert from 'node:assert/strict';
import { eligibleCandidates, evaluateProgrammaticCandidate, taxonomyCapacity, nextLifecycleState } from '../lib/programmatic/eligibility.js';

const family = {
  key: 'city-cost',
  minimumMonthlyVolume: 250,
  minimumUniqueBlocks: 5,
  maximumSourceAgeDays: 45,
};

const valid = {
  key: 'en-miami-cost',
  family: 'city-cost',
  locale: 'en',
  monthlyVolume: 1200,
  queryValidated: true,
  uniqueIntent: true,
  sourceCoverage: 0.92,
  sourceAgeDays: 10,
  uniqueBlocks: 7,
  canonicalOwner: true,
  qualityReviewed: true,
  sourceAttribution: ['dataforseo:keyword:example', 'official:city-statistics'],
  commercialUsefulness: 0.9,
  serpOpportunity: 0.8,
  internalLinkValue: 0.8,
  languageQuality: 0.95,
  lifecycleState: 'approved',
  metadata: { title: 'Cost of living in Miami', description: 'Current costs in Miami.', h1: 'Cost of living in Miami', canonical: '/en/miami/cost-of-living/' },
};

test('a candidate becomes indexable only after every hard gate passes', () => {
  const result = evaluateProgrammaticCandidate(valid, family, ['en', 'de', 'ro']);
  assert.equal(result.indexable, true);
  assert.equal(result.sitemap, true);
  assert.deepEqual(result.reasons, []);
});

test('thin or unvalidated combinations never enter routing outputs', () => {
  const result = evaluateProgrammaticCandidate({ ...valid, monthlyVolume: 20, queryValidated: false, uniqueBlocks: 1 }, family, ['en']);
  assert.equal(result.indexable, false);
  assert.equal(result.sitemap, false);
  assert.match(result.robots, /noindex/);
  assert.deepEqual(result.reasons, ['insufficient-demand', 'unvalidated-demand', 'insufficient-unique-content']);
});

test('unknown families and unpublished locales fail closed', () => {
  assert.equal(eligibleCandidates([{ ...valid, family: 'missing' }], [family], ['en']).length, 0);
  assert.equal(evaluateProgrammaticCandidate({ ...valid, locale: 'fr' }, family, ['en']).eligible, false);
});

test('taxonomy capacity describes combinations without generating pages', () => {
  assert.equal(taxonomyCapacity({ dimensions: { vertical: ['a', 'b'], locale: ['en', 'ro'], intent: ['x', 'y', 'z'] } }), 12);
});

test('publishing lifecycle cannot skip qualification and review', () => {
  assert.equal(nextLifecycleState('discovered', 'publish'), null);
  assert.equal(nextLifecycleState('reviewed', 'approve'), 'approved');
  assert.equal(nextLifecycleState('approved', 'publish'), 'published');
  assert.equal(nextLifecycleState('published', 'stale'), 'refresh');
});

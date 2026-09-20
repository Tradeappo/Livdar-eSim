import test from 'node:test';
import assert from 'node:assert/strict';
import { adviceFor, estimateTrip, recommendData } from '../lib/travel-tools.js';

test('trip estimate uses visitor numbers and optional activities', () => {
  assert.deepEqual(
    estimateTrip({ days: 7, stay: 85, food: 35, transport: 15, esim: 10, activities: true }),
    { days: 7, perDay: 160, total: 1130 }
  );
});

test('data recommendation rounds up to a practical tier', () => {
  assert.equal(recommendData({ days: 7, usage: 'medium', hotspot: false }), 10);
  assert.equal(recommendData({ days: 30, usage: 'heavy', hotspot: true }), 'unlimited');
});

test('advice templates receive the destination', () => {
  assert.deepEqual(adviceFor('Japan', ['Save maps for {destination}.']), ['Save maps for Japan.']);
});

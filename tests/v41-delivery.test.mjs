import test from 'node:test';
import assert from 'node:assert/strict';
import {
  V41_MARKETPLACE_MARKUP,
  enhanceV41Markup,
  enhanceV41RuntimeSource,
} from '../lib/v41-source.js';

test('V41 delivery delegates the main landmark and adds accessible image semantics', () => {
  const delivered = enhanceV41Markup(V41_MARKETPLACE_MARKUP);

  assert.match(delivered, /<div data-v41-main="true">/);
  assert.doesNotMatch(delivered, /<main>/);
  assert.doesNotMatch(delivered, /<article class="region-card"><img\s+src=/);
  assert.match(delivered, /<article class="region-card"><img alt="" aria-hidden="true" decoding="async" loading="lazy"/);
  assert.match(delivered, /<img id="dImg" alt="" aria-hidden="true" decoding="async"/);
  assert.match(delivered, /<h2 id="dTitle">/);
  assert.doesNotMatch(delivered, /<h2 id="dTitle"[^>]*aria-label=/);
});

test('V41 tool controls are connected to their visible labels', () => {
  const delivered = enhanceV41Markup(V41_MARKETPLACE_MARKUP);
  const controlIds = [
    'costDestination', 'costDays', 'costStay', 'costFood', 'costTransport',
    'costEsim', 'costCurrency', 'advisorCountry', 'advisorDays', 'advisorUsage',
    'adviceDestination', 'cardDestination', 'cardDays', 'cardBudget', 'cardData',
  ];

  for (const id of controlIds) {
    assert.match(delivered, new RegExp(`<(?:input|select) aria-label="[^"]+"[^>]*id="${id}"`));
  }
});

test('V41 generated plan images receive stable dimensions and loading priority', () => {
  const source = '<img src="${p.img}" alt="${p.name}">';
  const delivered = enhanceV41RuntimeSource(source);

  assert.match(delivered, /width="700" height="972"/);
  assert.match(delivered, /decoding="async"/);
  assert.match(delivered, /i === 0 \? 'eager' : 'lazy'/);
  assert.match(delivered, /i === 0 \? 'high' : 'low'/);
});

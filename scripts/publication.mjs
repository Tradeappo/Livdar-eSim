// Publication workflow for destination, guide and region pages.
//
//   node scripts/publication.mjs status              counts per state, locale and type
//   node scripts/publication.mjs check               fails when routing and registry disagree
//   node scripts/publication.mjs <action> <key>      move one entry through its lifecycle
//
// Keys look like "en:destination:morocco". Actions follow the lifecycle in
// lib/programmatic/eligibility.js (draft, review, approve, publish, stale,
// retire, reopen, revise, reject). "publish" additionally requires authored
// content above the word floor; "retire" is the rollback. Nothing here writes
// content, deploys, or submits anything to a search engine.

import { readFileSync, writeFileSync } from 'node:fs';
import { nextLifecycleState } from '../lib/programmatic/eligibility.js';
import { authoredContent, authoredIds, contentLocales, editorialWordCount } from '../lib/content/index.js';

const REGISTRY_URL = new URL('../data/publication-registry.json', import.meta.url);
export const GATED_TYPES = ['destination', 'guide', 'region'];
// Pages every live market carries without a registry entry: home, the three
// hubs, compatibility and the two legal pages.
export const STATIC_PAGES_PER_MARKET = 7;
const WORD_FLOOR = 320;

export function loadRegistry() {
  return JSON.parse(readFileSync(REGISTRY_URL, 'utf8'));
}

export function expectedPublishedUrls(registry = loadRegistry()) {
  const live = contentLocales();
  const gated = Object.entries(registry.entries).filter(([key, e]) => e.state === 'published' && live.includes(key.split(':')[0])).length;
  return gated + live.length * STATIC_PAGES_PER_MARKET;
}

export function checkRegistry(registry = loadRegistry()) {
  const failures = [];
  const drafts = [];
  const live = contentLocales();
  live.forEach((locale) => {
    GATED_TYPES.forEach((type) => {
      authoredIds(locale, type).forEach((id) => {
        const key = locale + ':' + type + ':' + id;
        if (!registry.entries[key]) drafts.push(key);
      });
    });
  });
  Object.entries(registry.entries).forEach(([key, entry]) => {
    const [locale, type, id] = key.split(':');
    if (!GATED_TYPES.includes(type)) failures.push(key + ': unknown page type');
    if (!authoredIds(locale, type).includes(id)) {
      if (entry.state === 'published') failures.push(key + ': published without authored content');
    }
  });
  return { failures, unregisteredDrafts: drafts, expectedPublishedUrls: expectedPublishedUrls(registry) };
}

function status(registry) {
  const table = {};
  Object.entries(registry.entries).forEach(([key, e]) => {
    const [locale, type] = key.split(':');
    const row = locale + ' ' + type;
    table[row] = table[row] || {};
    table[row][e.state] = (table[row][e.state] || 0) + 1;
  });
  console.table(table);
  console.log('expected published URLs:', expectedPublishedUrls(registry));
}

function act(registry, action, key) {
  const entry = registry.entries[key] || { state: 'discovered' };
  const next = nextLifecycleState(entry.state, action);
  if (!next) throw new Error('Cannot ' + action + ' ' + key + ' from state ' + entry.state + '.');
  const [locale, type, id] = key.split(':');
  if (!GATED_TYPES.includes(type)) throw new Error('Unknown page type in ' + key + '.');
  if (action === 'publish') {
    const content = authoredContent(locale, type, id);
    if (!content) throw new Error(key + ' has no authored content. Write it before publishing.');
    const words = editorialWordCount(content);
    if (words < WORD_FLOOR) throw new Error(key + ' has ' + words + ' editorial words, below the floor of ' + WORD_FLOOR + '.');
  }
  registry.entries[key] = { ...entry, state: next, [action + 'On']: new Date().toISOString().slice(0, 10) };
  registry.entries = Object.fromEntries(Object.entries(registry.entries).sort());
  writeFileSync(REGISTRY_URL, JSON.stringify(registry, null, 2) + '\n');
  console.log(key + ': ' + entry.state + ' -> ' + next);
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const [command, key] = process.argv.slice(2);
  const registry = loadRegistry();
  if (!command || command === 'status') status(registry);
  else if (command === 'check') {
    const result = checkRegistry(registry);
    console.log(JSON.stringify(result, null, 2));
    if (result.failures.length) process.exitCode = 1;
  } else act(registry, command, key);
}

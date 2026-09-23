// Phrasing verdicts from measured demand.
//
//   node scripts/atlas/verdicts.mjs <measured.json>...
//
// The measurement run asks two questions at once: does this phrasing pattern
// have demand, and does this entity have demand. The first validation batch
// conflated them and looked like a failure. Separating them is what this
// script does: it groups the measured rows by the pattern they came from and
// reports the pattern's median and best volume, so a pattern is judged on its
// best entities rather than on its worst.
//
// A pattern with a zero median and a zero best is dead. A pattern with a zero
// median and a strong best is alive and entity bound, which is a different
// decision: keep the pattern, cut the entity list.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { PHRASINGS } from '../../lib/atlas/keywords/phrasings.js';

// Turn a measured keyword back into the pattern that produced it by removing
// the entity name. The entity list comes from the measured set itself, so
// this needs no lookup table to maintain.
export function patternOf(keyword, entities) {
  let out = keyword.toLowerCase();
  for (const e of entities) {
    const re = new RegExp('\\b' + e.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    if (re.test(out)) return out.replace(re, '{entity}').replace(/\s+/g, ' ').trim();
  }
  return out;
}

export const ENTITIES = [
  'shanghai', 'chongqing', 'chengdu', 'beijing', 'guangzhou', 'shenzhen', 'kinshasa',
  'china', 'india', 'united states', 'brazil', 'japan', 'russia', 'mexico', 'pakistan',
  'indonesia', 'turkey', 'nigeria', 'vietnam', 'philippines', 'united kingdom',
  'portugal', 'spain', 'italy', 'thailand', 'costa rica', 'greece', 'germany', 'singapore',
  'lisbon', 'barcelona', 'mexico city', 'bangkok', 'tokyo', 'madrid', 'berlin', 'amsterdam', 'dubai',
];

const median = (xs) => (xs.length ? xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)] : 0);

export function verdicts(rows) {
  const byPattern = new Map();
  for (const r of rows) {
    const p = patternOf(r.keyword, ENTITIES);
    if (!byPattern.has(p)) byPattern.set(p, []);
    byPattern.get(p).push(r);
  }
  const out = [];
  for (const [pattern, list] of byPattern) {
    const vols = list.map((r) => r.volume || 0);
    const cpcs = list.map((r) => r.cpc).filter((x) => x != null && x > 0);
    const best = Math.max(...vols);
    const med = median(vols);
    const nonZero = vols.filter((v) => v > 0).length;
    let verdict;
    if (best === 0) verdict = 'dead: no entity in the sample has demand for this phrasing';
    else if (med === 0) verdict = 'entity bound: the phrasing works, but only for some entities, so the entity list is what must be cut';
    else if (med >= 100) verdict = 'strong: demand across the sample, not just at the head';
    else verdict = 'thin: real but small, publish only where the entity is strong';
    out.push({
      pattern, measured: list.length, nonZero, medianVolume: med, bestVolume: best,
      medianCpcCents: cpcs.length ? median(cpcs) : null,
      medianDifficulty: median(list.map((r) => r.difficulty).filter((x) => x != null)) || null,
      verdict,
      bestExample: list.slice().sort((a, b) => (b.volume || 0) - (a.volume || 0))[0].keyword,
    });
  }
  return out.sort((a, b) => b.bestVolume - a.bestVolume);
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const files = process.argv.slice(2);
  const rows = [];
  let units = 0;
  for (const f of files) {
    const j = JSON.parse(readFileSync(f, 'utf8'));
    rows.push(...j.keywords);
    units += j.unitsTotal || 0;
  }
  const v = verdicts(rows);
  const dir = new URL('../../reports/atlas/', import.meta.url);
  mkdirSync(dir, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    provider: 'ahrefs',
    market: 'en-US',
    keywordsMeasured: rows.length,
    unitsSpent: units,
    withVolume: rows.filter((r) => (r.volume || 0) > 0).length,
    patterns: v.length,
    counts: {
      strong: v.filter((x) => x.verdict.startsWith('strong')).length,
      thin: v.filter((x) => x.verdict.startsWith('thin')).length,
      entityBound: v.filter((x) => x.verdict.startsWith('entity')).length,
      dead: v.filter((x) => x.verdict.startsWith('dead')).length,
    },
    verdicts: v,
  };
  writeFileSync(new URL('phrasing-verdicts.json', dir), JSON.stringify(report, null, 1) + '\n');
  console.log(JSON.stringify({ ...report, verdicts: v.map((x) => x.pattern + ' | med ' + x.medianVolume + ' | best ' + x.bestVolume + ' | ' + x.verdict.split(':')[0]) }, null, 1));
}

// Applying a recorded keyword correction to a cohort that is already published.
//
//   node scripts/atlas/apply-keyword-corrections.mjs
//   node scripts/atlas/apply-keyword-corrections.mjs --write
//
// A misattributed keyword is a measurement error, and the repair for a
// measurement error is not to withdraw the URL. The page is built from the
// entity, the entity was right, and the URL is published and indexed; what was
// wrong is the demand that justified it and, where the heading was built from
// the keyword, the heading. So this rewrites the cohort manifest entry from the
// ledger in data/atlas/corrections/ and leaves the path exactly where it is.
//
// After it runs, `node scripts/atlas/cohort-qa.mjs --cohort 002 --write`
// rebuilds the page models, and the heading guard in atlas-model.js puts the
// entity back into the heading the keyword had taken.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url);
const DIR = 'data/atlas/corrections/';

export function ledger() {
  const rows = [];
  for (const f of readdirSync(new URL(DIR, ROOT)).filter((x) => x.endsWith('.json')).sort()) {
    const j = JSON.parse(readFileSync(new URL(DIR + f, ROOT), 'utf8'));
    for (const c of j.corrections || []) rows.push({ ...c, recordedOn: j.recordedOn, file: DIR + f });
  }
  return rows;
}

export function run({ cohorts = ['001', '002'] } = {}) {
  const rows = ledger();
  const byPath = new Map(rows.map((c) => [c.path, c]));
  const applied = [];
  const files = {};
  for (const cohort of cohorts) {
    const file = 'data/atlas/cohorts/cohort-' + cohort + '.json';
    let j;
    try { j = JSON.parse(readFileSync(new URL(file, ROOT), 'utf8')); } catch { continue; }
    let touched = false;
    for (const p of j.pages || []) {
      const c = byPath.get(p.path);
      if (!c) continue;
      if (p.entity !== c.entity) { applied.push({ path: p.path, skipped: 'the manifest holds entity ' + p.entity + ' and the ledger names ' + c.entity }); continue; }
      if (p.keyword === c.becomes && p.volume === c.volume) { applied.push({ path: p.path, already: true }); continue; }
      p.keyword = c.becomes;
      p.volume = c.volume;
      p.difficulty = null;
      p.expectedValue = 0;
      // The record travels with the page rather than only in the ledger, so a
      // reader of the manifest can see why one row claims no demand.
      p.keywordCorrected = { was: c.was, wasVolume: c.wasVolume, on: c.recordedOn, why: c.why, keywordMeasured: false };
      touched = true;
      applied.push({ path: p.path, from: c.was, to: c.becomes, volumeWithdrawn: c.wasVolume });
    }
    if (touched) files[file] = j;
  }
  return { corrections: rows.length, applied, files };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (process.argv.includes('--write')) {
    for (const [file, j] of Object.entries(r.files)) writeFileSync(new URL(file, ROOT), JSON.stringify(j, null, 1) + '\n');
  }
  console.log(JSON.stringify({ corrections: r.corrections, applied: r.applied, wrote: process.argv.includes('--write') ? Object.keys(r.files) : [] }, null, 1));
}

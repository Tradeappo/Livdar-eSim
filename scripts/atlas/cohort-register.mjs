// Register the cohort in the lifecycle store.
//
//   node scripts/atlas/cohort-register.mjs
//   node scripts/atlas/cohort-register.mjs --write
//
// The cohort manifest says what would be published. The registry is what the
// programme believes about each page over its life, and until a page is in it
// the funnel counts it as nothing. This walks each page through the states it
// has actually reached and stops at `approved`, because approved is the truth:
// the sources exist, the demand was measured, the page builds and QA passed,
// and nothing has been deployed.
//
// It refuses to run if QA has not passed. A page that failed a check cannot be
// approved, and approving it here and fixing it later is how a broken page
// reaches a publication queue.

import { writeFileSync, mkdirSync } from 'node:fs';
import { run as qa } from './cohort-qa.mjs';
import { getEntry, writeEntries, countByState } from '../../lib/atlas/registry-store.js';
import { canTransition } from '../../lib/atlas/states.js';

const ROOT = new URL('../../', import.meta.url);
const LOT = 'lot-003';

// The states a page in this cohort has genuinely reached, in order. Each one
// is a claim that can be checked: the sources are built, a keyword was
// measured with volume, the model builds, and cohort QA passed on it.
const REACHED = ['candidate', 'data_ready', 'measured', 'qa_passed', 'approved'];

export function run({ now = new Date() } = {}) {
  const report = qa({ now });
  if (!report.pass) {
    return { ok: false, why: 'cohort QA has ' + report.failureCount + ' failures, so nothing can be approved', byCheck: report.byCheck };
  }

  const on = now.toISOString().slice(0, 10);
  const updates = {};
  const refused = [];
  for (const m of report.models) {
    const key = m.path;
    const existing = getEntry(key);
    const from = existing?.state || 'candidate';
    // A page already further along is left alone rather than walked
    // backwards. Registering twice must not undo a publication.
    if (existing && !canTransition(from, 'approved')) { refused.push({ key, from }); continue; }
    const history = existing?.history ? [...existing.history] : [];
    for (const s of REACHED) {
      if (history.some((h) => h.state === s)) continue;
      history.push({ state: s, on });
    }
    updates[key] = {
      ...existing,
      history,
      lot: existing?.lot || LOT,
      state: 'approved',
      family: m.family,
      surface: m.surface,
      locale: m.locale,
      market: m.market,
      entity: m.entity,
      volume: m.page?.volume ?? existing?.volume ?? null,
      band: m.page?.band ?? null,
      approvedOn: on,
      qa: { passed: true, on, checks: report.checks.length },
    };
  }

  return { ok: true, lot: LOT, toRegister: Object.keys(updates).length, refused, updates, report };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  if (!r.ok) { console.log(JSON.stringify(r, null, 1)); process.exit(1); }
  let written = null;
  if (process.argv.includes('--write')) {
    written = writeEntries(r.updates);
    mkdirSync(new URL('data/atlas/lots/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/lots/' + r.lot + '.json', ROOT), JSON.stringify({
      lot: r.lot,
      openedOn: new Date().toISOString().slice(0, 10),
      meaning: 'The first cohort of the Atlas data families. Approved, which means the sources exist, the demand was measured, the pages build and every cohort QA check passed. Nothing here is deployed.',
      pages: Object.keys(r.updates).sort(),
    }, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    ok: r.ok, lot: r.lot, toRegister: r.toRegister, refused: r.refused.length,
    written, funnel: written ? countByState() : undefined,
  }, null, 1));
}

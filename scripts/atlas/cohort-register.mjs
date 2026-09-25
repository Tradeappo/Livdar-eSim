// Register the cohort in the lifecycle store.
//
//   node scripts/atlas/cohort-register.mjs
//   node scripts/atlas/cohort-register.mjs --write
//   node scripts/atlas/cohort-register.mjs --cohort 002 --write
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
import { getEntry, writeEntries, countByState, allEntries, deleteEntries } from '../../lib/atlas/registry-store.js';
import { canTransition } from '../../lib/atlas/states.js';

const ROOT = new URL('../../', import.meta.url);

// One lot per cohort, so the funnel can report them apart. Cohort 001 was
// registered as lot-003 before the cohorts were numbered, and renaming it now
// would rewrite the history of pages that already carry it.
const LOT_OF = { '001': 'lot-003', '002': 'lot-004' };

// The states a page in this cohort has genuinely reached, in order. Each one
// is a claim that can be checked: the sources are built, a keyword was
// measured with volume, the model builds, and cohort QA passed on it.
const REACHED = ['candidate', 'data_ready', 'measured', 'qa_passed', 'approved'];

export function run({ now = new Date(), cohort = '001' } = {}) {
  const LOT = LOT_OF[cohort];
  if (!LOT) return { ok: false, why: 'no lot is defined for cohort ' + cohort };
  const report = qa({ now, cohortFile: 'data/atlas/cohorts/cohort-' + cohort + '.json' });
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

  // A cohort can be rebuilt, and when it is, pages the previous build claimed
  // may no longer be selected. Those entries still carry this lot and still
  // read `approved`, which means a lot claimed them, and none does. They are
  // un-claimed here rather than left to inflate the funnel with pages nothing
  // will publish. Anything that reached `published` is left alone: that has a
  // history worth keeping and `retired` is the state for withdrawing it.
  const selected = new Set(report.models.map((m) => m.path));
  const stale = [];
  for (const [key, entry] of allEntries()) {
    if (entry.lot !== LOT || selected.has(key)) continue;
    if (entry.state === 'approved') stale.push(key);
  }

  return { ok: true, cohort, lot: LOT, toRegister: Object.keys(updates).length, refused, stale, updates, report };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const i = process.argv.indexOf('--cohort');
  const r = run({ cohort: i >= 0 ? process.argv[i + 1] : '001' });
  if (!r.ok) { console.log(JSON.stringify(r, null, 1)); process.exit(1); }
  let written = null;
  if (process.argv.includes('--write')) {
    if (r.stale.length) deleteEntries(r.stale);
    written = writeEntries(r.updates);
    mkdirSync(new URL('data/atlas/lots/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/lots/' + r.lot + '.json', ROOT), JSON.stringify({
      lot: r.lot,
      openedOn: new Date().toISOString().slice(0, 10),
      meaning: 'Cohort ' + r.cohort + ' of the Atlas data families. Approved, which means the sources exist, the demand was measured, the pages build and every cohort QA check passed. Nothing here is deployed.',
      pages: Object.keys(r.updates).sort(),
    }, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    ok: r.ok, cohort: r.cohort, lot: r.lot, toRegister: r.toRegister, refused: r.refused.length,
    unclaimed: r.stale.length, unclaimedPaths: r.stale,
    written, funnel: written ? countByState() : undefined,
  }, null, 1));
}

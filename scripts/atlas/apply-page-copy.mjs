// Applying recorded copy corrections to published page models.
//
//   node scripts/atlas/apply-page-copy.mjs            plan, writes nothing
//   node scripts/atlas/apply-page-copy.mjs --write    rewrite the affected cohort manifests
//   node scripts/atlas/apply-page-copy.mjs --check [base-ref]
//                                                     prove that only the recorded fields of the
//                                                     recorded paths differ from base-ref
//                                                     (default origin/migrate/atlas-cloudflare)
//
// WHY NOT THE GENERATOR. Rebuilding a cohort from lib/atlas regenerates every page in it, and
// the published manifests carry later, deliberate edits the generator does not reproduce: the
// crawl-push link swaps of PR #43 and the cohort 004 crawl push. Rebuilding cohort 001 today
// changes 76 of its 250 pages. A copy correction has to change the pages it names and nothing
// else, so it is recorded in data/atlas/copy-corrections/page-copy-*.json and applied here, the same
// way scripts/atlas/apply-keyword-corrections.mjs applies keyword corrections.
//
// THE GUARD. Each row carries `was`, the exact current value of every field it changes. A row
// whose `was` no longer matches the manifest is refused rather than applied over a page that
// has moved on, and a row already applied is reported as such, so the script is idempotent.
// Field names may be dotted (`table.caption`) to change one value inside an object.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';

const ROOT = new URL('../../', import.meta.url);
const DIR = 'data/atlas/copy-corrections/';
const manifest = (cohort) => 'data/atlas/cohorts/cohort-' + cohort + '-pages.json';

const get = (o, key) => key.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
function put(o, key, value) {
  const parts = key.split('.');
  const last = parts.pop();
  const parent = parts.reduce((a, k) => a[k], o);
  parent[last] = value;
}

export function ledger() {
  const rows = [];
  for (const f of readdirSync(new URL(DIR, ROOT)).filter((x) => /^page-copy-.*\.json$/.test(x)).sort()) {
    const j = JSON.parse(readFileSync(new URL(DIR + f, ROOT), 'utf8'));
    for (const c of j.corrections || []) rows.push({ ...c, recordedOn: j.recordedOn, file: DIR + f });
  }
  return rows;
}

export function run({ rows = ledger(), read = (f) => JSON.parse(readFileSync(new URL(f, ROOT), 'utf8')) } = {}) {
  const docs = {};
  const report = [];
  for (const row of rows) {
    const file = manifest(row.cohort);
    docs[file] ||= read(file);
    const page = docs[file].pages.find((p) => p.path === row.path);
    if (!page) { report.push({ path: row.path, refused: 'not in ' + file }); continue; }
    const keys = Object.keys(row.set);
    if (keys.every((k) => isDeepStrictEqual(get(page, k), row.set[k]))) { report.push({ path: row.path, already: true }); continue; }
    const moved = keys.filter((k) => !isDeepStrictEqual(get(page, k), row.was[k]));
    if (moved.length) { report.push({ path: row.path, refused: 'the manifest no longer holds the recorded value of ' + moved.join(', ') }); continue; }
    for (const k of keys) put(page, k, row.set[k]);
    report.push({ path: row.path, applied: keys });
  }
  return { docs, report, ok: report.every((r) => !r.refused) };
}

// Everything that differs between base-ref and the working tree, field by field, in every
// cohort manifest. A difference that is not a recorded `set` of a recorded path is a failure.
export function check(base = 'origin/migrate/atlas-cloudflare') {
  const rows = ledger();
  const allowed = new Map(rows.map((r) => [r.path, new Set(Object.keys(r.set).map((k) => k.split('.')[0]))]));
  const problems = [];
  let changed = 0;
  for (const f of readdirSync(new URL('data/atlas/cohorts/', ROOT)).filter((x) => /^cohort-\d+-pages\.json$/.test(x))) {
    const rel = 'data/atlas/cohorts/' + f;
    const before = JSON.parse(execFileSync('git', ['show', base + ':' + rel], { cwd: ROOT, maxBuffer: 1 << 30 }).toString());
    const after = JSON.parse(readFileSync(new URL(rel, ROOT), 'utf8'));
    for (const k of Object.keys({ ...before, ...after })) if (k !== 'pages' && !isDeepStrictEqual(before[k], after[k])) problems.push(rel + ': top-level ' + k);
    if (before.pages.length !== after.pages.length) { problems.push(rel + ': page count'); continue; }
    before.pages.forEach((b, i) => {
      const a = after.pages[i];
      if (a.path !== b.path) { problems.push(rel + ': page order at ' + i); return; }
      for (const k of new Set([...Object.keys(b), ...Object.keys(a)])) {
        if (isDeepStrictEqual(b[k], a[k])) continue;
        changed++;
        if (!allowed.get(b.path)?.has(k)) problems.push(b.path + ' field ' + k + ' changed without a recorded correction');
      }
    });
  }
  return { base, fieldsChanged: changed, onlyRecordedFieldsChanged: problems.length === 0, problems: problems.slice(0, 50) };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  if (process.argv.includes('--check')) {
    const i = process.argv.indexOf('--check');
    const r = check(process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : undefined);
    console.log(JSON.stringify(r, null, 1));
    process.exit(r.onlyRecordedFieldsChanged ? 0 : 1);
  }
  const r = run();
  if (process.argv.includes('--write') && r.ok) {
    for (const [file, j] of Object.entries(r.docs)) writeFileSync(new URL(file, ROOT), JSON.stringify(j, null, 1) + '\n');
  }
  console.log(JSON.stringify({ ok: r.ok, report: r.report, wrote: process.argv.includes('--write') && r.ok ? Object.keys(r.docs) : [] }, null, 1));
  if (!r.ok) process.exit(1);
}

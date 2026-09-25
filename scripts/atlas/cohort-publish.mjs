// The step that turns approved into published, and published into live.
//
//   node scripts/atlas/cohort-publish.mjs --cohort 002                 report only
//   node scripts/atlas/cohort-publish.mjs --cohort 002 --write         approved to published
//   node scripts/atlas/cohort-publish.mjs --cohort 002 --live --write  published to live
//
// Two words, two different claims, and the difference is the whole point of
// the state machine.
//
//   published  the registry publishes it, so it routes and enters a sitemap.
//              For this repository that happens when the branch merges, and
//              the record is written in the merge that does it, the same way
//              lot 1 was recorded in the pull request that published it.
//
//   live       a request to the production origin returned it. That is a
//              measurement rather than an intention, so it needs evidence: the
//              production deployment the request went to and the URLs that were
//              actually fetched. Without `--evidence` this refuses.
//
// It will not publish a cohort whose QA does not pass, and it will not move a
// page the registry does not already hold at the state before the one being
// claimed. Both refusals are the reason the funnel can be trusted to count
// three different numbers rather than three names for the same optimism.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { run as qa } from './cohort-qa.mjs';
import { getEntry, writeEntries, countByState } from '../../lib/atlas/registry-store.js';
import { transition, canTransition } from '../../lib/atlas/states.js';

const ROOT = new URL('../../', import.meta.url);
const today = (now) => now.toISOString().slice(0, 10);

export function run({ now = new Date(), cohort = '002', to = 'published', evidence = null } = {}) {
  if (to !== 'published' && to !== 'live') return { ok: false, why: 'this script moves pages to published or to live and nothing else' };
  if (to === 'live' && !evidence) return { ok: false, why: 'live is a measurement: pass --evidence with the production deployment and the URLs that were fetched' };

  const cohortFile = 'data/atlas/cohorts/cohort-' + cohort + '.json';
  if (!existsSync(new URL(cohortFile, ROOT))) return { ok: false, why: 'no manifest for cohort ' + cohort };
  const report = qa({ now, cohortFile });
  if (!report.pass) {
    return { ok: false, why: 'cohort QA has ' + report.failureCount + ' failures, so nothing can be published', byCheck: report.byCheck };
  }

  const on = today(now);
  const updates = {};
  const refused = [];
  const already = [];
  // `live` is claimed per page, from the response that was read for that page.
  // A launch fetches a sample rather than five hundred URLs, so the sample is
  // what goes live and the rest stay published: the registry counting 500 live
  // off 11 responses is exactly the optimism the state machine exists to stop.
  const evidenced = to === 'live' && evidence?.pages
    ? new Set(evidence.pages.map((r) => r.path))
    : null;
  for (const m of report.models) {
    const key = m.path;
    if (evidenced && !evidenced.has(key)) continue;
    const entry = getEntry(key);
    if (!entry) { refused.push({ key, why: 'the registry does not hold this page at all' }); continue; }
    if (entry.state === to) { already.push(key); continue; }
    if (!canTransition(entry.state, to)) { refused.push({ key, why: 'cannot go from ' + entry.state + ' to ' + to }); continue; }
    updates[key] = transition(entry, to, {
      on,
      reason: to === 'published'
        ? 'cohort ' + cohort + ' QA passed with ' + report.checks.length + ' checks and no failures, and the branch carrying it is merging to main'
        : 'a request to the production origin returned this page',
      rule: to === 'published'
        ? 'scripts/atlas/cohort-publish.mjs, which refuses a cohort whose QA does not pass'
        : 'scripts/atlas/cohort-publish.mjs --live, which refuses without fetched evidence',
      evidence: to === 'live'
        ? {
          productionDeployment: evidence.productionDeployment,
          commit: evidence.commit,
          at: evidence.at,
          response: (evidence.pages || []).find((r) => r.path === key) || null,
          file: 'data/atlas/launches/evidence-' + on + '.json',
        }
        : { qa: 'reports/atlas/cohort-' + cohort + '-qa.json', checks: report.checks.length },
    });
    if (to === 'published') updates[key].publishedOn = on;
    if (to === 'live') updates[key].liveOn = on;
  }

  return {
    ok: refused.length === 0,
    cohort,
    to,
    pages: report.models.length,
    toMove: Object.keys(updates).length,
    alreadyThere: already.length,
    refused,
    updates,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const arg = (name) => {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 ? process.argv[i + 1] : null;
  };
  const to = process.argv.includes('--live') ? 'live' : 'published';
  const evidenceFile = arg('evidence');
  const evidence = evidenceFile ? JSON.parse(readFileSync(new URL(evidenceFile, ROOT), 'utf8')) : null;
  const r = run({ cohort: arg('cohort') || '002', to, evidence });
  if (!r.ok) { console.log(JSON.stringify({ ...r, updates: undefined }, null, 1)); process.exit(1); }
  let written = null;
  if (process.argv.includes('--write')) {
    written = writeEntries(r.updates);
    // The launch record. A timestamp in a report is a sentence; a timestamp in
    // the repository is a fact the next session can read.
    mkdirSync(new URL('data/atlas/launches/', ROOT), { recursive: true });
    const file = 'data/atlas/launches/cohort-' + r.cohort + '-' + to + '.json';
    writeFileSync(new URL(file, ROOT), JSON.stringify({
      cohort: r.cohort,
      state: to,
      at: new Date().toISOString(),
      pages: r.pages,
      moved: r.toMove,
      alreadyThere: r.alreadyThere,
      meaning: to === 'published'
        ? 'These pages route and enter a sitemap from the merge that carries this record. Published is not live: live means a request to the production origin returned the page, and that is recorded separately.'
        : 'A request to the production origin returned these pages. The evidence is below.',
      evidence: to === 'live' ? evidence : undefined,
    }, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    ok: r.ok, cohort: r.cohort, to: r.to, pages: r.pages, moved: r.toMove,
    alreadyThere: r.alreadyThere, written, funnel: written ? countByState() : undefined,
  }, null, 1));
}

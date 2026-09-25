// The page state machine.
//
// Every page moves through this machine and nothing skips a step. The point
// of the machine is that each word means one checkable thing, so a report can
// say "published" and "live" and "indexed" and have them be three different
// numbers rather than three names for the same optimism.
//
//   candidate   the taxonomy allows the combination
//   data_ready  every required source is present, current and licensed
//   measured    demand for this page has been measured by a named provider
//   qa_passed   the generated model passes every automatic check
//   approved    scoring cleared it and a lot claimed it
//   published   the registry publishes it, so it routes and enters a sitemap
//   live        a request to the production origin returned it, verified
//   discovered  Search Console reports the URL as known
//   indexed     Search Console reports it as indexed, which is not the same
//               thing as having requested indexing
//   performing  it has impressions, and separately clicks
//
// Alternative states are terminal or holding, never silent.

export const MAIN_STATES = [
  'candidate', 'data_ready', 'measured', 'qa_passed', 'approved',
  'published', 'live', 'discovered', 'indexed', 'performing',
];

export const ALT_STATES = {
  rejected: 'A gate refused it and the refusal is not expected to change on its own.',
  blocked: 'A dependency is missing: a source that does not exist yet, a licence that is unclear, a credential that is absent.',
  retired: 'It was published and has been withdrawn. It stops routing and leaves the sitemap.',
  stale: 'Its data passed its expiry date. It keeps serving while the refresh runs, and is retired if the refresh fails.',
  canonicalized: 'Another page answers the same intent better, so this one points at it instead of competing with it.',
};

export const ALL_STATES = MAIN_STATES.concat(Object.keys(ALT_STATES));

const idx = (s) => MAIN_STATES.indexOf(s);

// Forward one step, or sideways into an alternative state. Nothing jumps.
export function canTransition(from, to) {
  if (!ALL_STATES.includes(to)) return false;
  if (ALT_STATES[to]) return from !== 'retired';
  if (from === undefined || from === null) return to === 'candidate';
  if (ALT_STATES[from]) {
    // A held page rejoins the machine at the step that held it, never ahead of it.
    return from === 'stale' ? to === 'data_ready' : from === 'blocked' ? to === 'data_ready' : from === 'retired' ? to === 'approved' : to === 'candidate';
  }
  return idx(to) === idx(from) + 1;
}

// A transition is only recorded with the rule that caused it. A registry row
// without a reason is a row nobody can audit later.
export function transition(entry, to, { reason, rule, on = new Date().toISOString().slice(0, 10), evidence = null } = {}) {
  const from = entry ? entry.state : null;
  if (!canTransition(from, to)) throw new Error('illegal transition ' + from + ' to ' + to);
  if (!reason || !rule) throw new Error('a transition needs a reason and the rule that produced it');
  const next = { ...(entry || {}), state: to };
  next.history = (entry && entry.history ? entry.history : []).concat([{ from, to, on, reason, rule, evidence }]);
  return next;
}

export const isServable = (state) => state === 'published' || MAIN_STATES.indexOf(state) > MAIN_STATES.indexOf('published');
export const isApprovedOrBetter = (state) => MAIN_STATES.indexOf(state) >= MAIN_STATES.indexOf('approved');

// Funnel counts. Every stage is counted as "reached this stage or beyond", so
// the numbers are monotonic and a reader can see the drop at each gate.
export function funnel(entries) {
  const out = {};
  for (const s of MAIN_STATES) out[s] = 0;
  for (const s of Object.keys(ALT_STATES)) out[s] = 0;
  for (const e of entries) {
    if (ALT_STATES[e.state]) { out[e.state]++; continue; }
    for (let i = 0; i <= idx(e.state); i++) out[MAIN_STATES[i]]++;
  }
  return out;
}

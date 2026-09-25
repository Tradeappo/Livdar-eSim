// The product by SEO map.
//
//   node scripts/atlas/product-map.mjs
//   node scripts/atlas/product-map.mjs --write
//
// One row per family, carrying every column the programme needs to argue
// about: which product surface it belongs to, what it is made of, where the
// data comes from, what it leads to, whether an answer engine can quote it,
// and what state it is really in.
//
// The status is computed, never declared. A family is blocked if a source it
// needs does not exist, whatever anybody hoped; it is eligible only when the
// sources exist and the demand was measured.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { FAMILIES, familyIds, priorityOf, marketGateOf, familyPrior, VERTICALS } from '../../lib/atlas/verticals.js';
import { SURFACES, surfaceOfVertical } from '../../lib/atlas/surfaces.js';
import { familyCount, familyMarkets, entityPools } from '../../lib/atlas/inventory.js';
import { monetisationScore, TRANSACTIONS } from '../../lib/atlas/monetisation.js';
import { quotability } from '../../lib/atlas/aeo.js';
import { nodesWritten } from '../../lib/atlas/graph.js';

const root = new URL('../../', import.meta.url);
const readJson = (rel) => JSON.parse(readFileSync(new URL(rel, root), 'utf8'));

export function sourceStates() {
  const s = readJson('data/atlas/sources.json');
  const out = new Map();
  // The file uses `status` on the sources that predate this script and
  // `state` on the ones added with it. Read both, and treat a source that
  // says neither as built, because the original ingested sources say nothing
  // precisely because they exist.
  for (const x of s.sources) out.set(x.id, x.status || x.state || 'built');
  return out;
}

// Which families already have measured keywords behind them, from the
// measurement store rather than from a claim.
// Two things count as measured and both are real measurement rather than a
// claim. The en-US plan is keyword level: 600 rows naming the family each
// keyword belongs to. The evidence state is family level: a family that says
// `measured` is pointing at an export in data/atlas/probes or
// data/atlas/competitors with the volumes in it, and a test checks that the
// file it names exists.
//
// Reading only the plan undercounted badly, because the plan is en-US only
// and the September research measured families that the plan predates.
export function measuredFamilies() {
  const set = new Set();
  try {
    const plan = readJson('data/atlas/measurement-plan.json');
    for (const row of plan.batches || plan.rows || []) if (row.family) set.add(row.family);
  } catch { /* the plan is optional */ }
  for (const [id, f] of Object.entries(FAMILIES)) {
    if (f.evidenceState === 'measured' && f.evidence && f.evidence.source) set.add(id);
  }
  return set;
}

export function publishedFamilies() {
  const set = new Set();
  try {
    const ds = readJson('data/atlas/registry.json');
    // A registry key is family:lang:entity:variant, and the family part is
    // the slug rather than the dotted id, so it is mapped back rather than
    // read directly.
    for (const key of Object.keys(ds.entries || {})) {
      const slug = String(key).split(':')[0];
      const match = familyIds().find((id) => id.split('.')[1] === slug || id.replace('.', '-') === slug);
      if (match) set.add(match);
    }
  } catch { /* none yet */ }
  return set;
}

export function statusOf(family, { sources, measured, published }) {
  const f = FAMILIES[family];
  const missingSources = (f.requiredSources || []).filter((s) => (sources.get(s) || 'unknown') !== 'built');
  if (published.has(family)) return { status: 'published', missingSources };
  if (f.evidenceState === 'declared-pending-measurement') return { status: 'research-needed', missingSources };
  if (missingSources.length) return { status: 'blocked', missingSources };
  if (measured.has(family)) return { status: 'eligible', missingSources };
  return { status: 'source-ready', missingSources };
}

export function rows(p = entityPools()) {
  const sources = sourceStates();
  const measured = measuredFamilies();
  const published = publishedFamilies();
  return familyIds().map((id) => {
    const f = FAMILIES[id];
    const count = familyCount(id, p);
    const { status, missingSources } = statusOf(id, { sources, measured, published });
    const q = quotability(f);
    return {
      surface: surfaceOfVertical(f.vertical),
      vertical: f.vertical,
      family: id,
      entity: f.scope,
      axis: f.axis,
      variants: f.variants,
      intent: f.intent,
      markets: familyMarkets(id).length,
      marketGate: marketGateOf(id),
      sources: f.requiredSources,
      missingSources,
      leadsTo: f.leadsTo || [],
      monetisationScore: monetisationScore(f.leadsTo || []),
      aeo: f.aeo || [],
      quotability: q.score,
      graphNodes: nodesWritten(f),
      indexPolicy: f.indexPolicy || 'always',
      lifecycleShape: f.lifecycleShape || null,
      evidenceState: f.evidenceState || 'predates the evidence field',
      priority: priorityOf(id),
      prior: familyPrior(id),
      candidates: count.candidates,
      status,
    };
  });
}

export function report(p = entityPools()) {
  const all = rows(p);
  const bySurface = {};
  for (const r of all) {
    const s = (bySurface[r.surface] ||= { surface: r.surface, stage: SURFACES[r.surface].stage, families: 0, candidates: 0, blocked: 0, researchNeeded: 0, verticals: new Set() });
    s.families++;
    s.candidates += r.candidates;
    s.verticals.add(r.vertical);
    if (r.status === 'blocked') s.blocked++;
    if (r.status === 'research-needed') s.researchNeeded++;
  }
  for (const s of Object.values(bySurface)) s.verticals = [...s.verticals].sort();
  const byStatus = {};
  for (const r of all) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  const candidatesByStatus = {};
  for (const r of all) candidatesByStatus[r.status] = (candidatesByStatus[r.status] || 0) + r.candidates;
  const byStage = {};
  for (const r of all) {
    const stage = SURFACES[r.surface].stage;
    byStage[stage] = (byStage[stage] || 0) + r.candidates;
  }
  // The funnel, counted state by state rather than collapsed into a total.
  // The distinction the whole programme rests on is the first line: a
  // candidate is a combination that has been thought about, and a page is a
  // file that answers a request. Nothing here converts one into the other.
  const measured = measuredFamilies();
  const published = publishedFamilies();
  const sum = (fn) => all.filter(fn).reduce((t, r) => t + r.candidates, 0);
  const inventory = {
    candidate: all.reduce((t, r) => t + r.candidates, 0),
    byPriority: {
      high: sum((r) => r.priority === 'high'),
      medium: sum((r) => r.priority === 'medium'),
      low: sum((r) => r.priority === 'low'),
    },
    sourceReady: sum((r) => r.missingSources.length === 0),
    keywordMeasured: sum((r) => measured.has(r.family)),
    serpMeasured: 0,
    blocked: sum((r) => r.missingSources.length > 0),
    eligible: sum((r) => r.missingSources.length === 0 && measured.has(r.family)),
    approved: 0,
    publishReady: sum((r) => r.missingSources.length === 0 && r.evidenceState !== 'declared-pending-measurement'),
    published: sum((r) => published.has(r.family)),
    notes: {
      serpMeasured: 'No SERP measurement has been run. It is zero rather than absent, which is a different claim from unknown.',
      approved: 'Approval is a per page state in the registry and not a family property, so it cannot be summed here. The registry funnel below carries it.',
      publishReady: 'Families whose sources exist and which are not waiting on research. It is an upper bound on what could be generated, not a plan.',
      published: 'Candidates belonging to families that have at least one published page, which is why it is larger than the 123 pages that exist.',
    },
  };
  return {
    generatedAt: new Date().toISOString(),
    meaning: 'One row per family. Status is computed from the source states and the measurement store, never declared. Candidates are combinations, not pages: a candidate becomes a page only after the source gate, the measurement gate and the quality gate.',
    inventory,
    totals: {
      surfaces: Object.keys(bySurface).length,
      verticals: Object.keys(VERTICALS).length,
      families: all.length,
      candidates: all.reduce((t, r) => t + r.candidates, 0),
      transactions: Object.keys(TRANSACTIONS).length - 1,
    },
    byStatus,
    candidatesByStatus,
    byStage,
    bySurface: Object.values(bySurface).sort((a, b) => b.candidates - a.candidates),
    families: all.sort((a, b) => b.prior - a.prior),
  };
}

// How much of a family's score it is allowed to keep, given how much is
// really known about it. Without this the ranking rewards a confident guess
// exactly as much as a measurement, and the first run of this report put a
// family with no measured demand at all into second place on the strength of
// its declared priors alone. A family that has not been measured can still
// rank; it just cannot outrank the evidence.
export const EVIDENCE_WEIGHT = {
  measured: 1,
  'competitor-observed': 0.85,
  'declared-pending-measurement': 0.5,
  'predates the evidence field': 0.9,
};

// The top opportunities the brief asks for, split the way it asks for them.
// The ranking is deliberately not by candidate count: a family that produces
// four pages and earns on every one of them beats a family that produces
// two hundred thousand and is blocked.
export const GROUPS = {
  evergreen: (r) => !r.lifecycleShape && !['tool:global', 'ranking:list'].includes(r.entity) && r.surface !== 'community' && !r.indexPolicy.startsWith('gated'),
  dynamic: (r) => Boolean(r.lifecycleShape),
  tools: (r) => ['tool:global', 'ranking:list'].includes(r.entity),
  transactional: (r) => r.monetisationScore >= 0.5,
  community: (r) => r.surface === 'community',
  localPoi: (r) => r.indexPolicy.startsWith('gated'),
  relocationWorkStay: (r) => ['move', 'work', 'stay'].includes(r.surface),
};

export function opportunities(p = entityPools()) {
  const all = rows(p);
  // Opportunity is the family prior, what it leads to, and whether an answer
  // engine can use it, in that order of weight. Blocked families are ranked
  // too: the blocker is the finding, not a reason to hide them.
  const scored = all.map((r) => ({
    ...r,
    evidenceWeight: EVIDENCE_WEIGHT[r.evidenceState] ?? 0.9,
    opportunity: Math.round((r.prior * 0.5 + r.monetisationScore * 0.35 + r.quotability * 0.15) * (EVIDENCE_WEIGHT[r.evidenceState] ?? 0.9) * 1000) / 1000,
  })).sort((a, b) => b.opportunity - a.opportunity);
  const groups = {};
  for (const [name, fn] of Object.entries(GROUPS)) {
    groups[name] = scored.filter(fn).slice(0, 20).map((r) => ({ family: r.family, surface: r.surface, opportunity: r.opportunity, candidates: r.candidates, status: r.status, leadsTo: r.leadsTo }));
  }
  return { ranked: scored, groups };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const p = entityPools();
  const rep = report(p);
  const opp = opportunities(p);
  if (process.argv.includes('--write')) {
    const dir = new URL('reports/atlas/', root);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('product-seo-map.json', dir), JSON.stringify(rep, null, 1) + '\n');
    writeFileSync(new URL('opportunities.json', dir), JSON.stringify({ generatedAt: rep.generatedAt, meaning: 'Families ranked by prior, what they lead to and whether an answer engine can quote them. Blocked families are ranked too, because the blocker is the finding.', groups: opp.groups, ranked: opp.ranked.map((r) => ({ family: r.family, surface: r.surface, opportunity: r.opportunity, prior: r.prior, monetisationScore: r.monetisationScore, quotability: r.quotability, evidenceState: r.evidenceState, evidenceWeight: r.evidenceWeight, candidates: r.candidates, status: r.status })) }, null, 1) + '\n');
  }
  console.log(JSON.stringify({ totals: rep.totals, byStatus: rep.byStatus, byStage: rep.byStage, bySurface: rep.bySurface, top20: opp.ranked.slice(0, 20).map((r) => ({ family: r.family, surface: r.surface, opportunity: r.opportunity, status: r.status, candidates: r.candidates })) }, null, 1));
}

// The prioritisation report.
//
//   node scripts/atlas/prioritise.mjs
//   node scripts/atlas/prioritise.mjs --write
//
// It answers the questions the programme asks of the inventory: what is the
// distribution now, what would it be after the value ranking, how many
// candidates are commercial, which families would still be selected, whether
// an easy family is quietly dominating, what is blocked on a missing source,
// and what has to be measured before any of it becomes a publication
// decision.

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { selectionReport, distribution, selectFamilies, bandOf, TARGET, GUARDRAIL } from '../../lib/atlas/selection.js';
import { inventory, entityPools, familyCount } from '../../lib/atlas/inventory.js';
import { FAMILIES, familyIds, priorityOf, familyPrior } from '../../lib/atlas/verticals.js';
import { WEIGHTS, LEGACY_WEIGHTS, VALUE_WEIGHT, DEMAND_WEIGHT, score, legacyScore } from '../../lib/atlas/scoring.js';

// Two pages with the same data quality, one commercial and one informational,
// so the change between the two scoring versions is shown rather than claimed.
const WORKED_EXAMPLE = {
  informationalHighVolume: {
    label: 'a weather month page for a big city, 12,000 searches, low commercial intent',
    input: { volume: 12000, cpc: 30, difficulty: 40, familyCommercial: 0.2, decisionValue: 0.55, monetisation: 0.2, dataCompleteness: 0.9, uniqueness: 0.6, tier: 1, funnelContribution: 0.8, marketFit: 0.8, competitiveOpportunity: 0.35, userValue: 0.55, clusterValue: 0.8 },
  },
  commercialLowVolume: {
    label: 'a remote work tax page for one market and one country, 900 searches, high commercial intent',
    input: { volume: 900, cpc: 900, difficulty: 25, familyCommercial: 0.9, decisionValue: 1, monetisation: 0.9, dataCompleteness: 0.9, uniqueness: 0.9, tier: 2, funnelContribution: 0.85, marketFit: 0.8, competitiveOpportunity: 0.85, userValue: 1, clusterValue: 0.85 },
  },
};

export function blockedFamilies() {
  const sources = JSON.parse(readFileSync(new URL('../../data/atlas/sources.json', import.meta.url), 'utf8')).sources;
  const usable = new Set(sources.filter((s) => !s.status || s.status === 'ok').map((s) => s.id));
  const pools = entityPools();
  const out = [];
  for (const [id, f] of Object.entries(FAMILIES)) {
    const missing = f.requiredSources.flat().filter((s) => !usable.has(s));
    if (!missing.length) continue;
    out.push({ family: id, priority: priorityOf(id), band: bandOf(id), candidates: familyCount(id, pools).candidates, missing });
  }
  return out.sort((a, b) => b.candidates - a.candidates);
}

export function report() {
  const sel = selectionReport({ target: TARGET });
  const blocked = blockedFamilies();
  const blockedCandidates = blocked.reduce((t, b) => t + b.candidates, 0);
  const example = {};
  for (const [k, e] of Object.entries(WORKED_EXAMPLE)) {
    example[k] = { label: e.label, old: legacyScore(e.input).total, new: score(e.input).total };
  }
  return {
    ...sel,
    scoring: {
      old: LEGACY_WEIGHTS,
      new: WEIGHTS,
      demandWeight: Math.round(DEMAND_WEIGHT * 100) / 100,
      valueWeight: Math.round(VALUE_WEIGHT * 100) / 100,
      change: 'Demand fell from 0.40 to 0.24 of the weight. Commercial intent, decision value and monetisation now carry 0.34 between them, which is more than demand, so a page a reader acts on can outrank a page a reader skims.',
      workedExample: example,
    },
    guardrail: GUARDRAIL,
    blocked: { families: blocked.length, candidates: blockedCandidates, rows: blocked },
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = report();
  if (process.argv.includes('--write')) {
    const dir = new URL('../../reports/atlas/', import.meta.url);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('prioritisation.json', dir), JSON.stringify(r, null, 1) + '\n');
  }
  console.log(JSON.stringify({
    candidates: r.candidates,
    scoring: { demandWeight: r.scoring.demandWeight, valueWeight: r.scoring.valueWeight, workedExample: r.scoring.workedExample },
    allCandidates: { byPriority: r.distributionAll.byPriority, shares: r.distributionAll.shares, byVertical: r.distributionAll.byVertical },
    selected: { total: r.distributionSelected.total, byPriority: r.distributionSelected.byPriority, shares: r.distributionSelected.shares, byVertical: r.distributionSelected.byVertical },
    warnings: r.distributionAll.warnings,
    top20: r.top20.map((t) => t.family + ' ' + t.prior + ' ' + t.candidates),
    notSelected: r.notSelected.map((n) => n.family + ' ' + n.prior + ' ' + n.candidates),
    blocked: { families: r.blocked.families, candidates: r.blocked.candidates },
  }, null, 1));
}

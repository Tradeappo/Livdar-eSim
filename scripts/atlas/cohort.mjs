// The first cohort.
//
//   node scripts/atlas/cohort.mjs
//   node scripts/atlas/cohort.mjs --write
//
// The brief asked for a 250 page cohort mixed across surfaces so that several
// can be tested separately, and for it to use only families that are
// genuinely eligible. Those two requirements are in tension right now and the
// honest thing is to report the tension rather than resolve it by relaxing
// the second one.
//
// Six families can produce a page today. All six are in the low or medium
// tier, because every high priority family is blocked on a source that does
// not exist. So the cohort that can be built tests the machine and does not
// test the thesis, and this script says which is which rather than presenting
// a weather cohort as a validation of the programme.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { rows as familyRows } from './product-map.mjs';
import { entityPools } from '../../lib/atlas/inventory.js';
import { SURFACES, surfaceOfVertical } from '../../lib/atlas/surfaces.js';
import { priorityOf } from '../../lib/atlas/verticals.js';

const ROOT = new URL('../../', import.meta.url);
export const TARGET = 250;

// What a cohort is for. A cohort that measures nothing is a publication, and
// the ladder exists so that each step answers something the previous one
// could not.
export const QUESTIONS = {
  discovery: 'How long does a new page take to be crawled, and does an incremental sitemap change that',
  indexation: 'What share of published pages are indexed after two weeks, which is the baseline every later cohort is compared against',
  'family-variance': 'Do families differ in indexation rate, or is the rate a property of the site',
  'market-variance': 'Do the non English markets index at the same rate as English',
  'lifecycle': 'Does the sitemap chunk assignment hold across lots without rewriting settled files',
};

export function eligibleFamilies() {
  return familyRows(entityPools())
    .filter((r) => r.status === 'source-ready' || r.status === 'published')
    .map((r) => ({ ...r, surface: surfaceOfVertical(r.vertical), priority: priorityOf(r.family) }));
}

// Spread the cohort across families and markets rather than filling it from
// the top of one list. A 250 page cohort of one family in one market would
// answer one question; this answers three.
export function design(target = TARGET) {
  const eligible = eligibleFamilies();
  const usable = eligible.filter((f) => f.candidates > 0);
  if (!usable.length) return { target, allocations: [], total: 0, note: 'nothing is eligible' };

  // Even allocation, capped by what each family can actually produce, with
  // the remainder going to the families that have room.
  const per = Math.floor(target / usable.length);
  const allocations = usable.map((f) => ({
    family: f.family,
    surface: f.surface,
    priority: f.priority,
    axis: f.axis,
    markets: f.markets,
    candidates: f.candidates,
    pages: Math.min(per, f.candidates),
  }));
  let short = target - allocations.reduce((t, a) => t + a.pages, 0);
  for (const a of allocations) {
    if (short <= 0) break;
    const room = a.candidates - a.pages;
    const add = Math.min(room, short);
    a.pages += add;
    short -= add;
  }

  const total = allocations.reduce((t, a) => t + a.pages, 0);
  const bySurface = {};
  for (const a of allocations) bySurface[a.surface] = (bySurface[a.surface] || 0) + a.pages;
  const byPriority = {};
  for (const a of allocations) byPriority[a.priority] = (byPriority[a.priority] || 0) + a.pages;

  // What this cohort can and cannot answer. The second list is the important
  // one and it is derived rather than written, so it cannot quietly shrink.
  const surfacesPresent = new Set(allocations.map((a) => a.surface));
  const surfacesAbsent = Object.keys(SURFACES).filter((s) => !surfacesPresent.has(s));
  const answers = ['discovery', 'indexation', 'family-variance', 'lifecycle'];
  if (allocations.some((a) => a.markets > 1)) answers.push('market-variance');

  return {
    target,
    total,
    allocations: allocations.sort((a, b) => b.pages - a.pages),
    bySurface,
    byPriority,
    answers: answers.map((k) => ({ question: k, what: QUESTIONS[k] })),
    cannotAnswer: {
      surfaces: surfacesAbsent,
      why: 'Every family on these surfaces is blocked on a source that does not exist, so none of them can produce a page to publish.',
      consequence: 'This cohort measures whether the machine works. It does not measure whether the programme is right, because no high priority family is in it.',
    },
    honestSummary: byPriority.high
      ? 'The cohort contains high priority pages.'
      : 'Not one page in this cohort is from a high priority family. That is not a design choice, it is what the source gate permits today, and it is the strongest argument in the programme for spending the next unit of effort on data licensing rather than on more keyword research.',
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const d = design();
  if (process.argv.includes('--write')) {
    const dir = new URL('reports/atlas/', ROOT);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('cohort-001.json', dir), JSON.stringify({ generatedAt: new Date().toISOString(), ...d }, null, 1) + '\n');
  }
  console.log(JSON.stringify(d, null, 1));
}

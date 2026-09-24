// Tests for the product surfaces added on 2026-09-24.
//
// The brief that produced them asked for one thing above all: do not expand
// blindly, expand on evidence. So most of what is tested here is not that the
// code works, which is easy, but that the taxonomy cannot quietly grow
// without saying why. A family that appears with no evidence, no transaction
// behind it, no answer shape and no index policy should fail a test, not a
// review.

import test from 'node:test';
import assert from 'node:assert/strict';

import { SURFACES, SURFACE_IDS, STAGES, verticalToSurface, surfaceOfVertical } from '../lib/atlas/surfaces.js';
import { SHAPES, DISPOSITIONS, dispositionFor, indexableSet, steadyState, ENDED_GRACE_DAYS } from '../lib/atlas/lifecycle.js';
import { GATE, gateIndividual, cityYield, POI_CATEGORIES } from '../lib/atlas/poi-gate.js';
import { TRANSACTIONS, monetisationScore, byTransaction } from '../lib/atlas/monetisation.js';
import { BLOCKS, quotability, validateBlocks, SCHEMA_FOR } from '../lib/atlas/aeo.js';
import { NODES, EDGES, isAllowed, edgesFrom, PLANNER_PATHS, nodesWritten } from '../lib/atlas/graph.js';
import { FAMILIES, VERTICALS, familyIds, priorityOf } from '../lib/atlas/verticals.js';
import { hasForbiddenDash } from '../lib/atlas/text.js';

// Families that existed before the surfaces work. They are exempt from the
// declaration rules below, because retrofitting a monetisation field onto
// forty five families would be a change nobody reviewed. New families are not
// exempt, which is the point.
const NEW_FAMILIES = familyIds().filter((f) => FAMILIES[f].evidenceState);

test('every vertical belongs to exactly one surface, and every family has one', () => {
  const map = verticalToSurface(); // throws if a vertical is claimed twice
  for (const v of Object.keys(VERTICALS)) {
    assert.ok(map.has(v), 'vertical ' + v + ' belongs to no product surface');
  }
  for (const f of familyIds()) {
    assert.ok(surfaceOfVertical(FAMILIES[f].vertical), f + ' has nowhere to live in the product');
  }
  for (const id of SURFACE_IDS) {
    const s = SURFACES[id];
    assert.ok(STAGES.includes(s.stage), id + ' is not on the discovery to transaction path');
    assert.ok(s.what.length > 30, id + ' does not say what it is for');
    assert.ok(Array.isArray(s.transactionBehind) && s.transactionBehind.length, id + ' does not say what is behind it');
    assert.equal(hasForbiddenDash(s.what), false);
  }
});

test('a new family says why it exists, what it earns, and what gets indexed', () => {
  assert.ok(NEW_FAMILIES.length >= 15, 'only ' + NEW_FAMILIES.length + ' families carry an evidence state');
  for (const f of NEW_FAMILIES) {
    const fam = FAMILIES[f];
    assert.ok(['measured', 'competitor-observed', 'declared-pending-measurement'].includes(fam.evidenceState), f + ' has evidence state ' + fam.evidenceState);
    assert.ok(fam.evidence, f + ' declares no evidence at all');
    // A family claiming measurement has to point at the file that holds it.
    if (fam.evidenceState !== 'declared-pending-measurement') {
      assert.ok(fam.evidence.source && fam.evidence.source.startsWith('data/atlas/'), f + ' claims evidence without naming the export');
    } else {
      assert.equal(fam.evidence.source, null, f + ' is pending measurement but names a source');
      assert.ok(fam.evidence.note.length > 40, f + ' is pending measurement and does not say why it is here anyway');
    }
    assert.ok(Array.isArray(fam.leadsTo) && fam.leadsTo.length, f + ' does not say what it leads to');
    for (const t of fam.leadsTo) assert.ok(TRANSACTIONS[t], f + ' leads to unknown transaction ' + t);
    assert.ok(Array.isArray(fam.aeo) && fam.aeo.length, f + ' declares no answer shape');
    assert.deepEqual(validateBlocks(fam), [], f + ' declares an invalid answer shape');
    assert.ok(fam.indexPolicy && fam.indexPolicy.length > 4, f + ' does not say what gets indexed');
    assert.equal(hasForbiddenDash(JSON.stringify(fam.evidence)), false);
  }
});

test('only one temporal shape expires, and it is the one that should', () => {
  const expiring = Object.entries(SHAPES).filter(([, s]) => s.expires).map(([k]) => k);
  assert.deepEqual(expiring, ['dated-occurrence']);
  // The two biggest Pulse pages in the research are hubs, so hubs must not
  // expire. That is the whole design and it is worth a test rather than a
  // comment.
  assert.equal(SHAPES['temporal-hub'].expires, false);
  assert.equal(SHAPES['event-series'].expires, false);
  assert.equal(SHAPES['recurring-event'].expires, false);
});

test('a dated event is served, then held briefly, then consolidated or archived', () => {
  const now = new Date('2026-09-24T12:00:00Z');
  const at = (endsOn, extra = {}) => dispositionFor({ shape: 'dated-occurrence', endsOn, now, ...extra });

  assert.equal(at('2026-10-01').state, 'upcoming');
  assert.equal(at('2026-09-24').state, 'live');
  assert.equal(at('2026-09-20').state, 'ended');
  assert.equal(at('2026-09-20').indexable, true, 'a page that finished four days ago should still answer');

  const justOutside = at('2026-09-01');
  assert.equal(justOutside.state, 'archived');
  assert.equal(justOutside.indexable, false);

  // A recurring event with a successor points at it instead of becoming a
  // second result competing with the new edition.
  const rec = at('2026-09-01', { recurring: true, successorUrl: '/en/london/notting-hill-carnival/' });
  assert.equal(rec.state, 'consolidated');
  assert.equal(rec.target, '/en/london/notting-hill-carnival/');
  assert.equal(rec.indexable, false);

  // Recurring but with nowhere to point is archived, not consolidated.
  assert.equal(at('2026-09-01', { recurring: true }).state, 'archived');

  // The grace window is a real boundary, not a vague one.
  const boundary = new Date(now.getTime() - ENDED_GRACE_DAYS * 86400000);
  assert.equal(dispositionFor({ shape: 'dated-occurrence', endsOn: boundary, now }).state, 'ended');
});

test('the indexable set stays flat however many events have passed', () => {
  const base = { cities: 2951, windows: 4, seriesPerCity: 3, recurringPerCity: 8, languages: 10 };
  const quiet = steadyState({ ...base, occurrencesPerCityPerYear: 500 });
  const busy = steadyState({ ...base, occurrencesPerCityPerYear: 5000 });
  // Ten times the events does not make ten times the permanent inventory.
  assert.equal(quiet.permanent, busy.permanent);
  // And the rolling window is what grows, by a factor of ten, from a base
  // that is a fraction of the annual total rather than all of it.
  assert.ok(busy.rollingOccurrences > quiet.rollingOccurrences * 9);
  const annual = base.cities * 5000 * base.languages;
  assert.ok(busy.rollingOccurrences < annual * 0.2, 'the rolling window is not rolling: ' + busy.rollingOccurrences + ' of ' + annual);
  // Nothing accumulates: an expired occurrence leaves the set.
  const pages = [
    { shape: 'dated-occurrence', endsOn: '2020-01-01' },
    { shape: 'dated-occurrence', endsOn: '2099-01-01' },
    { shape: 'temporal-hub' },
  ];
  const set = indexableSet(pages, new Date('2026-09-24'));
  assert.equal(set.indexable.length, 2);
  assert.equal(set.noindex.length, 1);
});

test('a place gets its own page only when it is searched, described and licensed', () => {
  const good = { namedVolume: 200, fieldCompleteness: 0.9, distinctFacts: 9, licence: 'ODbL' };
  assert.equal(gateIndividual(good).pass, true);

  // Each failure is reported on its own, so a rejection says what to fix.
  assert.deepEqual(gateIndividual({ ...good, namedVolume: 0 }).reasons.length, 1);
  assert.match(gateIndividual({ ...good, namedVolume: 0 }).reasons[0], /searched/);
  assert.match(gateIndividual({ ...good, fieldCompleteness: 0.2 }).reasons[0], /fields/);
  assert.match(gateIndividual({ ...good, distinctFacts: 2 }).reasons[0], /template/);
  assert.match(gateIndividual({ ...good, licence: null }).reasons[0], /licence/);

  // A failing place falls back to the hub rather than disappearing.
  assert.equal(gateIndividual({ ...good, namedVolume: 0 }).level, 'category-hub');

  // A place in a searched neighbourhood gets partial credit, which is how
  // restaurants in Soho works without every Soho restaurant ranking alone.
  const borderline = { ...good, namedVolume: 10, neighbourhoodVolume: 200 };
  assert.equal(gateIndividual(borderline).pass, true);
  assert.equal(gateIndividual({ ...borderline, neighbourhoodVolume: 0 }).pass, false);

  // The hubs are deterministic and the individuals are earned, which is the
  // difference between a number and a projection.
  const y = cityYield({ categories: 10, neighbourhoods: 12, poisPerCategory: 300, passRate: 0.02 });
  assert.equal(y.categoryHubs, 10);
  assert.equal(y.neighbourhoodHubs, 120);
  assert.equal(y.individuals, 60);
  assert.ok(y.individuals < y.neighbourhoodHubs, 'the gate is letting through more than the hubs, which means it is not a gate');
  assert.ok(POI_CATEGORIES.every((c) => c.evidence && c.evidence.length > 10), 'a POI category with no evidence');
});

test('value is not volume, and the monetisation map is what says so', () => {
  // The case from the research: hotels near a venue is worth more per visit
  // than concerts in a city, and the scores have to agree.
  const stayScore = monetisationScore(['stay-booking']);
  const ticketScore = monetisationScore(['ticket']);
  assert.ok(stayScore > ticketScore, 'a booking scores no better than a ticket');

  // Something billable today beats something billable later at the same anchor.
  assert.ok(monetisationScore(['moving-service']) > monetisationScore(['property-lead']));
  assert.equal(monetisationScore(['none']), 0);
  assert.equal(monetisationScore([]), 0);
  assert.throws(() => monetisationScore(['invented']), /unknown transaction/);

  // A family scores on its best route to money, not its average.
  assert.equal(monetisationScore(['none', 'stay-booking']), stayScore);

  // Every transaction names its evidence, and every one that claims a cost
  // per click anchor says where the anchor came from.
  for (const [id, t] of Object.entries(TRANSACTIONS)) {
    assert.ok(t.evidence && t.evidence.length > 15, id + ' has no evidence');
    assert.equal(hasForbiddenDash(t.evidence), false);
  }

  // And every transaction is reachable from at least one family, or it is a
  // business model with no way in.
  const reach = byTransaction(FAMILIES);
  for (const id of Object.keys(TRANSACTIONS)) {
    if (id === 'none') continue;
    assert.ok(reach[id] && reach[id].length, 'nothing leads to ' + id);
  }
});

test('an answer engine needs a source, and an FAQ needs real questions', () => {
  // The same blocks with and without a verified source behind them.
  const sourced = { aeo: ['direct-answer', 'fact-table'], requiredSources: ['cost-of-living-verified'] };
  const unsourced = { aeo: ['direct-answer', 'fact-table'], requiredSources: [] };
  assert.ok(quotability(sourced).score > quotability(unsourced).score);
  assert.match(quotability(unsourced).reasons.join(' '), /cannot be cited/);

  // FAQ without measured questions is the filler this guards against.
  assert.deepEqual(validateBlocks({ aeo: ['faq'] }), ['faq declared without measured questions']);
  assert.deepEqual(validateBlocks({ aeo: ['faq'], measuredQuestions: ['is lisbon expensive'] }), []);
  assert.deepEqual(validateBlocks({ aeo: ['nonsense'] }), ['unknown block: nonsense']);
  // Declaring everything is the same as deciding nothing.
  assert.ok(validateBlocks({ aeo: Object.keys(BLOCKS) }).some((e) => /nobody chose/.test(e)));

  // Schema is mapped per shape rather than sprayed at every page.
  assert.deepEqual(SCHEMA_FOR['direct-answer'], []);
  assert.ok(SCHEMA_FOR['dated-list'].includes('Event'));
});

test('the planner question can be expressed as a walk through the graph', () => {
  for (const [id, p] of Object.entries(PLANNER_PATHS)) {
    assert.ok(p.question.length > 20, id + ' has no question');
    for (const [from, via, to] of p.path) {
      assert.ok(isAllowed(from, via, to), id + ' walks an edge that does not exist: ' + from + ' ' + via + ' ' + to);
    }
    for (const input of p.inputs) {
      // An input is either a node in the graph or a plain value the reader
      // supplies, and budget is the only one of those.
      assert.ok(NODES[input] || input === 'budget', id + ' takes an input that is not in the model: ' + input);
    }
  }
  // Every edge references nodes that exist.
  for (const [from, , to] of EDGES) {
    assert.ok(NODES[from], 'edge from unknown node ' + from);
    assert.ok(NODES[to], 'edge to unknown node ' + to);
  }
  assert.ok(edgesFrom('city').some((e) => e.to === 'country'));
});

test('a family writes its facts onto a node, or it is a page with nowhere to put them', () => {
  const homeless = [];
  for (const f of familyIds()) {
    const nodes = nodesWritten(FAMILIES[f]);
    // Tools and rankings are computed from the graph rather than writing to
    // it, so they are the allowed exception and the list is checked.
    const computed = FAMILIES[f].scope === 'tool:global' || FAMILIES[f].scope === 'ranking:list';
    if (!nodes.length && !computed) homeless.push(f);
  }
  assert.deepEqual(homeless, [], 'families with nowhere to write: ' + homeless.join(', '));
});

test('the community surface indexes the hub and never the group', () => {
  const c = FAMILIES['community.city-topic'];
  assert.match(c.indexPolicy, /hub only/);
  // And there is no family for an individual user generated group, which is
  // the decision this records.
  assert.equal(familyIds().some((f) => /^community\.(group|meetup|organiser)/.test(f)), false);
});

test('a surface with no transaction behind it is named as such', () => {
  const climate = SURFACES.climate;
  assert.deepEqual(climate.transactionBehind, ['none directly']);
  assert.equal(priorityOf('weather.city-month'), 'low', 'the surface with no transaction is not leashed');
});

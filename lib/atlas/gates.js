// The scale gate.
//
// Every step up the ladder has to be earned. This module answers one question
// for one moment: given what the published cohorts have actually done, should
// the next step be taken, held, or stopped.
//
// Three rules keep it honest.
//
// It never invents a threshold. Until three cohorts have matured there is no
// baseline, and the verdict is HOLD with the reason "not enough evidence
// yet", not GO because nothing looked broken.
//
// It separates a missing measurement from a bad one. A cohort that has not
// been measured cannot pass; it also cannot fail. Both are HOLD, and the
// reason says which.
//
// STOP conditions do not need a baseline. Indexation collapsing, a cohort
// that is mostly dead pages, duplication or errors running away: those are
// bad at any scale, and they short circuit everything above them.

import { cohortMetrics, marginal, baselines, nextStep, MATURITY_DAYS } from './cohorts.js';

export const VERDICTS = ['GO', 'HOLD', 'STOP'];

// The absolute conditions. Each one is a statement about the site being
// damaged, not about a target being missed, which is why they carry numbers
// while the performance rules wait for a baseline.
export const STOP_RULES = [
  { id: 'indexation-collapse', test: (m, b) => b.established && m.rates.indexationRate != null && b.indexationRate > 0 && m.rates.indexationRate < b.indexationRate * 0.3,
    why: 'Indexation of the newest cohort is below a third of the established rate. Google is refusing pages it used to accept.' },
  { id: 'mostly-dead-pages', test: (m) => m.ageDays >= 28 && m.rates.zeroImpressionRate != null && m.rates.zeroImpressionRate > 90,
    why: 'After four weeks, more than nine in ten pages of this cohort have never had an impression.' },
  { id: 'severe-duplication', test: (m) => m.rates.duplicateRate != null && m.rates.duplicateRate > 10,
    why: 'More than one page in ten in this cohort duplicates another.' },
  { id: 'cannibalisation', test: (m) => m.rates.cannibalisationRate != null && m.rates.cannibalisationRate > 15,
    why: 'More than fifteen percent of the cohort competes with our own pages for the same intent.' },
  { id: 'error-rate', test: (m) => m.rates.errorRate != null && m.rates.errorRate > 1,
    why: 'More than one percent of the cohort is returning errors.' },
  { id: 'not-live', test: (m) => m.rates.liveRate != null && m.rates.liveRate < 98,
    why: 'Pages the registry calls published are not answering on the origin.' },
];

// The comparative conditions. They need a baseline, and they are about
// diminishing returns rather than damage.
export const HOLD_RULES = [
  { id: 'marginal-decay', test: (m, b, mg) => mg && mg.comparable && mg.ratios.impressionsPer1k != null && mg.ratios.impressionsPer1k < 0.5,
    why: 'The newest cohort earns less than half the impressions per thousand pages that the previous one did.' },
  { id: 'slow-discovery', test: (m) => m.ageDays >= MATURITY_DAYS && m.rates.discoveryRate != null && m.rates.discoveryRate < 50,
    why: 'After two weeks Google has discovered fewer than half the pages. Crawl is not keeping up with publication.' },
  { id: 'weak-indexation', test: (m, b) => b.established && m.ageDays >= MATURITY_DAYS && m.rates.indexationRate != null && b.indexationRate > 0 && m.rates.indexationRate < b.indexationRate * 0.6,
    why: 'Indexation is well below the established rate, though not collapsed.' },
  { id: 'rising-dead-pages', test: (m, b, mg) => mg && mg.deltas.zeroImpressionRate != null && mg.deltas.zeroImpressionRate > 20,
    why: 'The share of pages with no impressions rose by more than twenty points against the previous cohort.' },
];

export function evaluate(cohorts, { sourceReadyForNextStep = null, totalPublished = null } = {}) {
  const sorted = cohorts.slice().sort((a, b) => String(a.publishedOn || '').localeCompare(String(b.publishedOn || '')));
  const b = baselines(sorted);
  const published = totalPublished != null ? totalPublished : sorted.reduce((t, c) => t + ((c.counts && c.counts.published) || 0), 0);
  const step = nextStep(published);

  if (!sorted.length) {
    return { verdict: 'HOLD', step, published, baseline: b, reasons: ['Nothing has been published yet, so there is no evidence to judge.'], stops: [], holds: [] };
  }

  const latest = cohortMetrics(sorted[sorted.length - 1]);
  const mg = marginal(sorted[sorted.length - 1], sorted[sorted.length - 2]);

  const stops = STOP_RULES.filter((r) => { try { return r.test(latest, b, mg); } catch { return false; } });
  if (stops.length) {
    return { verdict: 'STOP', step, published, baseline: b, latest, marginal: mg, stops: stops.map((r) => ({ id: r.id, why: r.why })), holds: [], reasons: stops.map((r) => r.why) };
  }

  const holds = HOLD_RULES.filter((r) => { try { return r.test(latest, b, mg); } catch { return false; } });
  const reasons = holds.map((r) => r.why);

  // Evidence gates. These come after the damage checks so a broken cohort is
  // never reported as merely unmeasured.
  if (latest.ageDays != null && latest.ageDays < MATURITY_DAYS) {
    reasons.push('The newest cohort is ' + latest.ageDays + ' days old. It needs ' + MATURITY_DAYS + ' before its indexation means anything.');
  }
  if (latest.rates.indexationRate == null) {
    reasons.push('The newest cohort has no Search Console measurement, so its indexation is unknown rather than poor.');
  }
  if (!b.established) reasons.push(b.note);
  if (sourceReadyForNextStep != null && step != null && sourceReadyForNextStep < step) {
    reasons.push('Only ' + sourceReadyForNextStep.toLocaleString() + ' candidates are source ready, which is fewer than the ' + step.toLocaleString() + ' the next step needs.');
  }

  const verdict = reasons.length ? 'HOLD' : 'GO';
  return {
    verdict, step, published, baseline: b, latest, marginal: mg,
    stops: [], holds: holds.map((r) => ({ id: r.id, why: r.why })),
    reasons: reasons.length ? reasons : ['Every check passed and the newest cohort performs in line with the established baseline.'],
  };
}

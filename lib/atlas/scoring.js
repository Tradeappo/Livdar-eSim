// Publication scoring.
//
// A single volume threshold is the wrong instrument at this scale. It
// publishes a thin page about a big city and refuses a genuinely useful page
// about a small one. The score below replaces it: demand still dominates, but
// a page can clear the bar on data completeness and cluster value, and no
// page clears it without distinct information of its own.
//
// Every component is in the range zero to one and carries a weight. The score
// is the weighted sum, and the reasons are kept so a held page can be
// explained without rerunning anything.

export const WEIGHTS = {
  volume: 0.26,          // measured monthly searches for the page primary intent
  trend: 0.06,           // direction over the last twelve months
  commercialValue: 0.06, // cpc as a proxy for what the intent is worth
  winnability: 0.08,     // inverse of difficulty, so an easy term scores higher
  dataCompleteness: 0.18,// how much of what the family promises is actually sourced
  uniqueness: 0.16,      // distance from the nearest sibling page
  entityImportance: 0.08,// population or traffic tier of the entity
  clusterValue: 0.07,    // does it complete a cluster readers navigate
  userValue: 0.05,       // does it answer something a person would act on
};

export const APPROVE_AT = 0.5;

// Hard refusals. These are not scored: a page that trips one of them is not
// publishable at any score.
export const VETOES = {
  noDistinctInformation: 'The page carries nothing the sibling pages do not already carry.',
  translationOnly: 'It differs from an existing page only by language.',
  nearDuplicate: 'Its text is too close to a page that already exists.',
  missingRequiredSource: 'A source the family requires is absent, expired or unlicensed.',
  noMeasuredDemand: 'No provider has measured this intent in this market.',
  zeroCrawlableInlinks: 'No published page links to it.',
  cannibalises: 'It competes with a stronger page of ours for the same intent.',
  forbiddenDash: 'Public text contains an en dash or an em dash.',
};

const clamp01 = (x) => Math.max(0, Math.min(1, x));

// Volume is compressed with a logarithm: the step from 20 to 200 searches
// matters far more than the step from 20,000 to 200,000.
export const volumeScore = (v) => (v > 0 ? clamp01(Math.log10(v + 1) / Math.log10(5001)) : 0);
export const trendScore = (pct) => clamp01(0.5 + (pct || 0) / 100);
export const cpcScore = (cents) => clamp01(Math.log10((cents || 0) / 100 + 1) / Math.log10(11));
export const winnabilityScore = (kd) => (kd == null ? 0.5 : clamp01(1 - kd / 100));
export const tierScore = (tier) => ({ 1: 1, 2: 0.75, 3: 0.5, 4: 0.3 }[tier] || 0.3);

export function score(input) {
  const c = {
    volume: volumeScore(input.volume),
    trend: trendScore(input.trendPct),
    commercialValue: cpcScore(input.cpc),
    winnability: winnabilityScore(input.difficulty),
    dataCompleteness: clamp01(input.dataCompleteness),
    uniqueness: clamp01(input.uniqueness),
    entityImportance: tierScore(input.tier),
    clusterValue: clamp01(input.clusterValue),
    userValue: clamp01(input.userValue),
  };
  let total = 0;
  for (const k of Object.keys(WEIGHTS)) total += WEIGHTS[k] * c[k];
  return { total: Math.round(total * 1000) / 1000, components: c };
}

// The decision. Vetoes first, then the score, then the confidence rule: a
// score built on a low confidence measurement does not approve on its own.
export function decide(input) {
  const vetoes = Object.keys(VETOES).filter((v) => input.vetoes && input.vetoes[v]);
  const s = score(input);
  if (vetoes.length) return { approve: false, score: s.total, components: s.components, vetoes, reason: VETOES[vetoes[0]] };
  if (input.confidence != null && input.confidence < 0.4) {
    return { approve: false, score: s.total, components: s.components, vetoes: [], reason: 'The demand measurement confidence is below the floor, so the score is not trusted yet.' };
  }
  const approve = s.total >= APPROVE_AT;
  return {
    approve,
    score: s.total,
    components: s.components,
    vetoes: [],
    reason: approve
      ? 'Score ' + s.total + ' at or above the publication bar of ' + APPROVE_AT + '.'
      : 'Score ' + s.total + ' below the publication bar of ' + APPROVE_AT + '.',
  };
}

// Data completeness is the share of the fields a family promises that are
// actually present, so a page that would have to say "no data" three times
// scores low and is held rather than published thin.
export function dataCompleteness(promised, present) {
  if (!promised.length) return 0;
  return present.filter((f) => promised.includes(f)).length / promised.length;
}

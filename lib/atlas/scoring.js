// Publication scoring.
//
// Version one weighted demand above everything else. That is the wrong
// instrument for Livdar: it ranks a weather page above a relocation page
// whenever the weather page has more searches, which is most of the time, and
// it would have filled the inventory with the pages that are easiest to
// generate rather than the pages a reader acts on.
//
// Version two keeps demand as the largest single component but puts
// commercial intent, decision value and monetisation next to it, so their
// combined weight exceeds volume. A page a reader makes a decision on can now
// outrank a page a reader skims that has several times the volume. The eight
// vetoes are unchanged: nothing publishes without distinct information.
//
// LEGACY_WEIGHTS is kept so the two versions can be compared on the same
// inputs rather than argued about.

export const LEGACY_WEIGHTS = {
  volume: 0.26,
  trend: 0.06,
  commercialValue: 0.06,
  winnability: 0.08,
  dataCompleteness: 0.18,
  uniqueness: 0.16,
  entityImportance: 0.08,
  clusterValue: 0.07,
  userValue: 0.05,
};

export const WEIGHTS = {
  // demand, 0.24
  volume: 0.18,
  trend: 0.04,
  winnability: 0.02,
  // what the page is worth, 0.34
  commercialIntent: 0.14,
  decisionValue: 0.12,
  monetisation: 0.08,
  // whether the page can be written well, 0.24
  dataCompleteness: 0.13,
  uniqueness: 0.11,
  // where it sits, 0.18
  entityImportance: 0.05,
  funnelContribution: 0.06,
  marketFit: 0.04,
  competitiveOpportunity: 0.03,
};

export const APPROVE_AT = 0.5;

// The share of the weight that answers "is this page worth existing" rather
// than "how many people type it". Asserted by the tests, because it is the
// whole point of the second version.
export const VALUE_WEIGHT = WEIGHTS.commercialIntent + WEIGHTS.decisionValue + WEIGHTS.monetisation;
export const DEMAND_WEIGHT = WEIGHTS.volume + WEIGHTS.trend + WEIGHTS.winnability;

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

// A missing component scores zero rather than poisoning the total. A page
// that did not supply a value does not get the benefit of the doubt, and a
// single absent field never turns the whole score into a non number, which is
// the failure mode that would quietly approve or refuse everything.
const clamp01 = (x) => (Number.isFinite(Number(x)) ? Math.max(0, Math.min(1, Number(x))) : 0);

// Volume is compressed with a logarithm: the step from 20 to 200 searches
// matters far more than the step from 20,000 to 200,000.
export const volumeScore = (v) => (v > 0 ? clamp01(Math.log10(v + 1) / Math.log10(5001)) : 0);
export const trendScore = (pct) => clamp01(0.5 + (pct || 0) / 100);
export const cpcScore = (cents) => clamp01(Math.log10((cents || 0) / 100 + 1) / Math.log10(11));
export const winnabilityScore = (kd) => (kd == null ? 0.5 : clamp01(1 - kd / 100));
export const tierScore = (tier) => ({ 1: 1, 2: 0.75, 3: 0.5, 4: 0.3 }[tier] || 0.3);

// Commercial intent has two sources that agree or disagree: what the family
// is for, and what advertisers pay for the query. When a measured cost per
// click exists it is blended in, so a family prior cannot claim commercial
// intent that the market does not show.
export function commercialIntentScore({ familyCommercial, cpc }) {
  const declared = familyCommercial == null ? 0.5 : clamp01(familyCommercial);
  if (cpc == null) return declared;
  return clamp01(declared * 0.6 + cpcScore(cpc) * 0.4);
}

export function score(input) {
  const c = {
    volume: volumeScore(input.volume),
    trend: trendScore(input.trendPct),
    winnability: winnabilityScore(input.difficulty),
    commercialIntent: commercialIntentScore({ familyCommercial: input.familyCommercial, cpc: input.cpc }),
    decisionValue: clamp01(input.decisionValue == null ? input.userValue : input.decisionValue),
    monetisation: clamp01(input.monetisation == null ? 0.5 : input.monetisation),
    dataCompleteness: clamp01(input.dataCompleteness),
    uniqueness: clamp01(input.uniqueness),
    entityImportance: tierScore(input.tier),
    funnelContribution: clamp01(input.funnelContribution == null ? input.clusterValue : input.funnelContribution),
    marketFit: clamp01(input.marketFit == null ? 0.5 : input.marketFit),
    competitiveOpportunity: clamp01(input.competitiveOpportunity == null ? 0.5 : input.competitiveOpportunity),
  };
  let total = 0;
  for (const k of Object.keys(WEIGHTS)) total += WEIGHTS[k] * (c[k] == null ? 0 : c[k]);
  return { total: Math.round(total * 1000) / 1000, components: c };
}

// The same inputs through the first version, so a report can show what
// changed rather than assert that something did.
export function legacyScore(input) {
  const c = {
    volume: volumeScore(input.volume),
    trend: trendScore(input.trendPct),
    commercialValue: cpcScore(input.cpc),
    winnability: winnabilityScore(input.difficulty),
    dataCompleteness: clamp01(input.dataCompleteness),
    uniqueness: clamp01(input.uniqueness),
    entityImportance: tierScore(input.tier),
    clusterValue: clamp01(input.clusterValue == null ? input.funnelContribution : input.clusterValue),
    userValue: clamp01(input.userValue == null ? input.decisionValue : input.userValue),
  };
  let total = 0;
  for (const k of Object.keys(LEGACY_WEIGHTS)) total += LEGACY_WEIGHTS[k] * (c[k] == null ? 0 : c[k]);
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

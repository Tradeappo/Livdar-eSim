// Eligibility comes before generation.
//
// The master taxonomy may describe millions of combinations, but a combination
// is not a page. It becomes indexable only after every hard gate below passes.
// This keeps low-demand, duplicated, stale or thin combinations out of routing,
// sitemaps and hreflang instead of trying to clean them up after publication.

const REQUIRED_METADATA = ['title', 'description', 'h1', 'canonical'];
const SCORE_FIELDS = ['commercialUsefulness', 'serpOpportunity', 'internalLinkValue', 'languageQuality'];
export const PROGRAMMATIC_STATES = Object.freeze(['discovered', 'qualified', 'drafted', 'reviewed', 'approved', 'published', 'refresh', 'retired']);

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function evaluateProgrammaticCandidate(candidate, family, publishedLocales = []) {
  const reasons = [];
  const volume = number(candidate.monthlyVolume);
  const sourceCoverage = number(candidate.sourceCoverage);
  const uniqueBlocks = number(candidate.uniqueBlocks);
  const sourceAgeDays = number(candidate.sourceAgeDays, Infinity);
  const minimumVolume = number(family.minimumMonthlyVolume, Infinity);
  const minimumBlocks = number(family.minimumUniqueBlocks, Infinity);
  const maximumAge = number(family.maximumSourceAgeDays, -1);
  const minimumScore = number(family.minimumQualityScore, 0.65);
  const scores = Object.fromEntries(SCORE_FIELDS.map((field) => [field, number(candidate[field])]));
  const qualityScore = SCORE_FIELDS.reduce((total, field) => total + scores[field], 0) / SCORE_FIELDS.length;

  if (!publishedLocales.includes(candidate.locale)) reasons.push('unpublished-locale');
  if (volume < minimumVolume) reasons.push('insufficient-demand');
  if (!candidate.queryValidated) reasons.push('unvalidated-demand');
  if (!candidate.uniqueIntent) reasons.push('intent-overlap');
  if (sourceCoverage < 0.8) reasons.push('insufficient-source-coverage');
  if (!Array.isArray(candidate.sourceAttribution) || candidate.sourceAttribution.length === 0) reasons.push('missing-source-attribution');
  if (sourceAgeDays > maximumAge) reasons.push('stale-sources');
  if (uniqueBlocks < minimumBlocks) reasons.push('insufficient-unique-content');
  if (!candidate.canonicalOwner) reasons.push('canonical-conflict');
  if (!candidate.qualityReviewed) reasons.push('quality-review-pending');
  if (qualityScore < minimumScore) reasons.push('insufficient-quality-score');
  if (!['approved', 'published'].includes(candidate.lifecycleState)) reasons.push('lifecycle-not-approved');
  if (REQUIRED_METADATA.some((field) => !candidate.metadata?.[field])) reasons.push('incomplete-metadata');

  const eligible = reasons.length === 0;
  return {
    key: candidate.key,
    family: family.key,
    eligible,
    indexable: eligible,
    sitemap: eligible,
    hreflang: eligible,
    robots: eligible ? 'index, follow' : 'noindex, nofollow',
    reasons,
    qualityScore: Number(qualityScore.toFixed(3)),
    scores,
    lifecycleState: candidate.lifecycleState || 'discovered',
  };
}

export function nextLifecycleState(current, action) {
  const transitions = {
    discovered: { qualify: 'qualified', reject: 'retired' },
    qualified: { draft: 'drafted', reject: 'retired' },
    drafted: { review: 'reviewed', reject: 'retired' },
    reviewed: { approve: 'approved', revise: 'drafted' },
    approved: { publish: 'published', revise: 'drafted' },
    published: { stale: 'refresh', retire: 'retired' },
    refresh: { review: 'reviewed', retire: 'retired' },
    retired: { reopen: 'discovered' },
  };
  return transitions[current]?.[action] || null;
}

export function eligibleCandidates(candidates, families, publishedLocales = []) {
  const familyMap = new Map(families.map((family) => [family.key, family]));
  return candidates
    .map((candidate) => {
      const family = familyMap.get(candidate.family);
      if (!family) {
        return {
          key: candidate.key,
          family: candidate.family,
          eligible: false,
          indexable: false,
          sitemap: false,
          hreflang: false,
          robots: 'noindex, nofollow',
          reasons: ['unknown-family'],
        };
      }
      return evaluateProgrammaticCandidate(candidate, family, publishedLocales);
    })
    .filter((result) => result.eligible);
}

export function taxonomyCapacity(taxonomy) {
  return Object.values(taxonomy.dimensions || {}).reduce((total, values) => total * Math.max(1, values.length), 1);
}

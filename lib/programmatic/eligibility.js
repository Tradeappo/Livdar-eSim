// Eligibility comes before generation.
//
// The master taxonomy may describe millions of combinations, but a combination
// is not a page. It becomes indexable only after every hard gate below passes.
// This keeps low-demand, duplicated, stale or thin combinations out of routing,
// sitemaps and hreflang instead of trying to clean them up after publication.

const REQUIRED_METADATA = ['title', 'description', 'h1', 'canonical'];

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

  if (!publishedLocales.includes(candidate.locale)) reasons.push('unpublished-locale');
  if (volume < minimumVolume) reasons.push('insufficient-demand');
  if (!candidate.queryValidated) reasons.push('unvalidated-demand');
  if (!candidate.uniqueIntent) reasons.push('intent-overlap');
  if (sourceCoverage < 0.8) reasons.push('insufficient-source-coverage');
  if (sourceAgeDays > maximumAge) reasons.push('stale-sources');
  if (uniqueBlocks < minimumBlocks) reasons.push('insufficient-unique-content');
  if (!candidate.canonicalOwner) reasons.push('canonical-conflict');
  if (!candidate.qualityReviewed) reasons.push('quality-review-pending');
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
  };
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

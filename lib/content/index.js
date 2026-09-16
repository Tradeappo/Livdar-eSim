// Content registry and publication gate.
//
// A page exists in the routing tree only if there is authored editorial content
// behind it. No content, no page. That is the whole anti doorway policy in one
// rule, and it is enforced here rather than left to discipline.

import { destinations as enDestinations } from './en/destinations.js';
import { destinations as deDestinations } from './de/destinations.js';
import { destinations as roDestinations } from './ro/destinations.js';
import { guides as enGuides } from './en/guides.js';
import { guides as deGuides } from './de/guides.js';
import { guides as roGuides } from './ro/guides.js';
import { regions as enRegions } from './en/regions.js';
import { regions as deRegions } from './de/regions.js';
import { regions as roRegions } from './ro/regions.js';
import { compatibility as enCompatibility } from './en/compatibility.js';
import { compatibility as deCompatibility } from './de/compatibility.js';
import { compatibility as roCompatibility } from './ro/compatibility.js';
import { legal as enLegal } from './en/legal.js';
import { legal as deLegal } from './de/legal.js';
import { legal as roLegal } from './ro/legal.js';
import { IDENTITY, FORBIDDEN_LEGAL_PATTERNS, NOT_INCORPORATED_MARKERS } from './legal.js';
import { homeContent, hasHomeContent } from './home.js';
import { ui } from './ui.js';

const DESTINATION_CONTENT = {
  en: enDestinations,
  de: deDestinations,
  ro: roDestinations,
};

// Region pages carry authored content per market, exactly like destinations and
// guides. Before this existed the region routes were emitted unconditionally,
// which is how thirty three pages with six words on them reached the sitemap.
const REGION_CONTENT = {
  en: enRegions,
  de: deRegions,
  ro: roRegions,
};

// The compatibility page used to be hardcoded English JSX inside the renderer,
// which is how the German and Romanian markets ended up serving an English page
// with only the breadcrumb translated.
const COMPATIBILITY_CONTENT = {
  en: enCompatibility,
  de: deCompatibility,
  ro: roCompatibility,
};

// Legal pages. Privacy and cookies exist in every published market, because a
// site that runs a consent banner and a tag manager without a policy behind it
// is not merely untidy, it is unlawful in the EU.
const LEGAL_CONTENT = {
  en: enLegal,
  de: deLegal,
  ro: roLegal,
};

export const LEGAL_KINDS = ['privacy', 'cookies'];
export { IDENTITY, FORBIDDEN_LEGAL_PATTERNS, NOT_INCORPORATED_MARKERS };

const GUIDE_CONTENT = {
  en: enGuides,
  de: deGuides,
  ro: roGuides,
};

export { homeContent, ui };

export function destinationContent(locale, destinationId) {
  const table = DESTINATION_CONTENT[locale];
  if (!table) return null;
  return table[destinationId] || null;
}

export function hasDestinationContent(locale, destinationId) {
  return Boolean(destinationContent(locale, destinationId));
}

export function publishedDestinationIds(locale) {
  const table = DESTINATION_CONTENT[locale];
  return table ? Object.keys(table) : [];
}

export function regionContent(locale, regionId) {
  const table = REGION_CONTENT[locale];
  if (!table) return null;
  return table[regionId] || null;
}

export function publishedRegionIds(locale) {
  const table = REGION_CONTENT[locale];
  return table ? Object.keys(table) : [];
}

export function localesWithRegion(regionId) {
  return Object.keys(REGION_CONTENT).filter((locale) => Boolean(REGION_CONTENT[locale][regionId]));
}

export function compatibilityContent(locale) {
  return COMPATIBILITY_CONTENT[locale] || null;
}

export function localesWithCompatibility() {
  return Object.keys(COMPATIBILITY_CONTENT);
}

// A legal page is published only once every placeholder in it has been filled.
// An unfinished policy that names {{LEGAL_ENTITY_NAME}} as the data controller
// is worse than no policy at all, so it has no route, no sitemap entry and no
// footer link until the company details are in. The quality gate turns this
// from a quiet omission into a loud build failure the moment indexing is on.
// A legal page is publishable when it contains no leftover template token, no
// obviously fake legal value, and no claim of incorporation while the project
// is not incorporated. Livdar MVP is a project rather than a company, and the
// policies say so; what they must never do is imply a registered entity.
// Lowercase and strip diacritics, so a required phrase can be compared on what
// it says rather than on how it is accented.
const fold = (s) => String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

export function legalProblems(locale, kind) {
  const table = LEGAL_CONTENT[locale];
  const doc = table && table[kind];
  if (!doc) return ['missing'];
  const text = JSON.stringify(doc);
  const problems = [];

  FORBIDDEN_LEGAL_PATTERNS.forEach(({ name, re }) => {
    const hit = text.match(re);
    if (hit) problems.push(name + ': ' + hit[0]);
  });

  // The privacy policy carries the identity statement and the contact address.
  // The cookie policy is a technical annex and needs neither.
  if (kind === 'privacy') {
    if (!text.includes(IDENTITY.contactEmail)) {
      problems.push('no contact address, a policy with no way to reach anyone is not a policy');
    }
    if (!text.includes(IDENTITY.publicName)) {
      problems.push('does not name the controller (' + IDENTITY.publicName + ')');
    }
    if (!IDENTITY.incorporated) {
      const marker = NOT_INCORPORATED_MARKERS[locale];
      if (!marker) {
        problems.push('no not-incorporated marker defined for locale ' + locale);
      // Compared with diacritics stripped from both sides. The marker is a
      // sentence we require the policy to contain, and requiring it to match
      // accent for accent means that correcting the spelling of that sentence
      // silently unpublishes the market: that is exactly what happened when the
      // Romanian content gained its diacritics and "societate inregistrata"
      // became "societate înregistrată". The statement is what matters here,
      // not how it is accented; the orthography itself is checked separately.
      } else if (!fold(text).includes(fold(marker))) {
        problems.push(
          'must state plainly that Livdar is not a registered company while IDENTITY.incorporated is false, expected wording near: "' + marker + '"'
        );
      }
    }
  }

  return problems;
}

export function legalIsComplete(locale, kind) {
  return legalProblems(locale, kind).length === 0;
}

export function legalContent(locale, kind) {
  return legalIsComplete(locale, kind) ? LEGAL_CONTENT[locale][kind] : null;
}

// The raw document regardless of completeness, for the gate and for tooling.
export function legalDraft(locale, kind) {
  const table = LEGAL_CONTENT[locale];
  if (!table) return null;
  return table[kind] || null;
}

export function localesWithLegal(kind) {
  return Object.keys(LEGAL_CONTENT).filter((locale) => legalIsComplete(locale, kind));
}

export function guideContent(locale, slug) {
  const table = GUIDE_CONTENT[locale];
  if (!table) return null;
  return table[slug] || null;
}

export function publishedGuideSlugs(locale) {
  const table = GUIDE_CONTENT[locale];
  return table ? Object.keys(table) : [];
}

// Which locales carry a given destination. Used for hreflang, so that the
// cluster only ever points at pages that exist.
export function localesWithDestination(destinationId) {
  return Object.keys(DESTINATION_CONTENT).filter((locale) =>
    Boolean(DESTINATION_CONTENT[locale][destinationId])
  );
}

export function localesWithGuide(slug) {
  return Object.keys(GUIDE_CONTENT).filter((locale) => Boolean(GUIDE_CONTENT[locale][slug]));
}

// What a market must have before it is offered anywhere: in the language
// selector, in hreflang, in the sitemap or in the routing tree.
export const REQUIRED_FOR_PUBLICATION = ['home', 'destinations', 'guides', 'regions', 'compatibility', ...LEGAL_KINDS];

export function missingForPublication(locale) {
  const missing = [];
  if (!hasHomeContent(locale)) missing.push('home');
  if (!publishedDestinationIds(locale).length) missing.push('destinations');
  if (!publishedGuideSlugs(locale).length) missing.push('guides');
  if (!publishedRegionIds(locale).length) missing.push('regions');
  if (!compatibilityContent(locale)) missing.push('compatibility');
  LEGAL_KINDS.forEach((kind) => {
    if (!legalContent(locale, kind)) missing.push(kind);
  });
  return missing;
}

// Every locale that has a registry entry of any kind, published or not.
export function knownLocales() {
  return [...new Set([
    ...Object.keys(DESTINATION_CONTENT),
    ...Object.keys(REGION_CONTENT),
    ...Object.keys(GUIDE_CONTENT),
    ...Object.keys(COMPATIBILITY_CONTENT),
    ...Object.keys(LEGAL_CONTENT),
  ])];
}

// The published markets. Everything downstream reads this, so a market cannot
// be half live: either every required page exists for it or it is offered
// nowhere at all.
export function contentLocales() {
  return knownLocales().filter((locale) => missingForPublication(locale).length === 0);
}

// Rough content weight, used by the quality gate. Counts words in the editorial
// body only, never in shared factual blocks, because shared facts are not what
// makes a page worth indexing.
export function editorialWordCount(content) {
  if (!content) return 0;
  const parts = [];
  // The article shape: an intro, ordered sections, a FAQ.
  (content.intro || []).forEach((p) => parts.push(p));
  // The home page shape: a hero and sections made of items rather than prose.
  // Counted here rather than special cased in the audit, so the floor means the
  // same thing on every page type.
  if (content.heroTitle) parts.push(content.heroTitle);
  if (content.heroLead) parts.push(content.heroLead);
  Object.values(content.sections || {}).forEach((s) => {
    if (s.heading) parts.push(s.heading);
    (s.body || []).forEach((p) => parts.push(p));
    (s.items || []).forEach((item) => {
      if (item.title) parts.push(item.title);
      if (item.body) parts.push(item.body);
    });
  });
  (content.faq || []).forEach((f) => {
    parts.push(f.q);
    parts.push(f.a);
  });
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

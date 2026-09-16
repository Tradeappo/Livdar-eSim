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
import { homeContent } from './home.js';
import { ui } from './ui.js';

const DESTINATION_CONTENT = {
  en: enDestinations,
  de: deDestinations,
  ro: roDestinations,
};

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

export function contentLocales() {
  return Object.keys(DESTINATION_CONTENT);
}

// Rough content weight, used by the quality gate. Counts words in the editorial
// body only, never in shared factual blocks, because shared facts are not what
// makes a page worth indexing.
export function editorialWordCount(content) {
  if (!content) return 0;
  const parts = [];
  (content.intro || []).forEach((p) => parts.push(p));
  Object.values(content.sections || {}).forEach((s) => {
    if (s.heading) parts.push(s.heading);
    (s.body || []).forEach((p) => parts.push(p));
  });
  (content.faq || []).forEach((f) => {
    parts.push(f.q);
    parts.push(f.a);
  });
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

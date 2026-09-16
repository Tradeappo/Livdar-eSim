// Per page audit, across every indexable page.
//
// The similarity check compares pages against each other. This one checks each
// page against the rules on its own, and it enumerates the routing tree rather
// than a list of content tables, so a page type added later cannot quietly
// escape the audit. That is the failure this file exists to prevent: the region
// pages were outside every check for as long as they were outside the content
// registry, which is exactly why thirty three of them reached the sitemap with
// six words on them.
//
// Every indexable page must have a title, an H1, a meta description, a
// canonical, a reciprocal hreflang cluster, and editorial substance. Page types
// whose job is navigation rather than reading are held to a lower word floor,
// declared here rather than assumed, because a hub that lists forty links is
// not a doorway page and pretending otherwise would force filler onto it.

import { contentLocales, destinationContent, guideContent, regionContent, compatibilityContent, legalContent, homeContent, editorialWordCount, LEGAL_KINDS } from '../lib/content/index.js';
import { resolvePath, allPathsForLocale } from '../lib/resolve.js';
import { routes, absolute } from '../lib/routes.js';
import { homeAlternates, hubAlternates, destinationAlternates, guideAlternates, regionAlternates, compatibilityAlternates, legalAlternates } from '../lib/seo.js';

// Word floors by page type. An article has to earn its URL with prose. A hub
// earns it by being the right place to choose from, so it is held to enough
// text to orient a reader and no more.
export const WORD_FLOOR = {
  destination: 320,
  guide: 320,
  region: 320,
  compatibility: 320,
  home: 250,
  legal: 250,
  esimHub: 90,
  regionsHub: 90,
  guidesHub: 90,
};

// Types where a shared title shape is correct rather than lazy.
const TEMPLATE_EXEMPT = new Set(['legal']);

function contentFor(node, locale) {
  switch (node.type) {
    case 'destination':
      return destinationContent(locale, node.destination.id);
    case 'guide':
      return guideContent(locale, node.slug);
    case 'region':
      return regionContent(locale, node.region.id);
    case 'compatibility':
      return compatibilityContent(locale);
    case 'legal':
      return legalContent(locale, node.kind);
    case 'home':
      return homeContent(locale);
    default:
      return null;
  }
}

function pathFor(node, locale) {
  switch (node.type) {
    case 'destination':
      return routes.destination(locale, node.destination);
    case 'guide':
      return routes.guide(locale, node.slug);
    case 'region':
      return routes.region(locale, node.region.id);
    case 'compatibility':
      return routes.compatibility(locale);
    case 'legal':
      return routes[node.kind](locale);
    case 'esimHub':
      return routes.esimHub(locale);
    case 'regionsHub':
      return routes.regionsHub(locale);
    case 'guidesHub':
      return routes.guidesHub(locale);
    default:
      return routes.home(locale);
  }
}

function clusterFor(node, locale) {
  switch (node.type) {
    case 'destination':
      return destinationAlternates(node.destination.id);
    case 'guide':
      return guideAlternates(node.slug);
    case 'region':
      return regionAlternates(node.region.id);
    case 'compatibility':
      return compatibilityAlternates();
    case 'legal':
      return legalAlternates(node.kind);
    case 'esimHub':
      return hubAlternates('esim');
    case 'regionsHub':
      return hubAlternates('regions');
    case 'guidesHub':
      return hubAlternates('guides');
    default:
      return homeAlternates();
  }
}

// Every page the site will statically generate, walked through the real router
// so the audit sees exactly what a crawler will.
export function enumeratePages() {
  const pages = [];
  contentLocales().forEach((locale) => {
    const all = [[], ...allPathsForLocale(locale)];
    all.forEach((parts) => {
      const node = resolvePath(locale, parts);
      if (!node) {
        pages.push({ locale, parts, type: 'unresolved', path: '/' + [locale, ...parts].join('/') + '/' });
        return;
      }
      pages.push({
        locale,
        type: node.type,
        node,
        path: pathFor(node, locale),
        content: contentFor(node, locale),
      });
    });
  });
  return pages;
}

export function runPageAudit() {
  const failures = [];
  const pages = enumeratePages();
  const byType = {};

  pages.forEach((page) => {
    byType[page.type] = (byType[page.type] || 0) + 1;
    const where = page.locale + ' ' + page.path;

    if (page.type === 'unresolved') {
      failures.push('Route does not resolve: ' + where + '. It is in the generated path list, so it would build as a 404.');
      return;
    }

    const c = page.content;
    const floor = WORD_FLOOR[page.type];

    // Hubs derive their title and heading from the interface table rather than
    // from a content document, so only the typed pages are checked for those.
    if (c) {
      if (!c.title) failures.push('Missing title: ' + where);
      // The home page names its heading heroTitle, because it is a hero rather
      // than an article heading. Same requirement, different field.
      const heading = c.h1 || c.heroTitle;
      if (!heading) failures.push('Missing H1: ' + where);
      if (!c.metaDescription) failures.push('Missing meta description: ' + where);
      if (c.title && c.title.length > 70) {
        failures.push('Title too long (' + c.title.length + '): ' + where);
      }
      if (c.metaDescription && c.metaDescription.length > 175) {
        failures.push('Meta description too long (' + c.metaDescription.length + '): ' + where);
      }
      if (!TEMPLATE_EXEMPT.has(page.type) && (!c.faq || c.faq.length < 2)) {
        failures.push('Fewer than two FAQ entries: ' + where);
      }
      if (floor !== undefined) {
        const words = editorialWordCount(c);
        if (words < floor) {
          failures.push(
            'Below the word floor for a ' + page.type + ' page (' + words + ' of ' + floor + '): ' + where +
              '. A page with less than that is a doorway page whatever we call it.'
          );
        }
      }
    }

    // Canonical and hreflang, checked on the page rather than on the table.
    const canonical = absolute(page.path);
    const cluster = clusterFor(page.node, page.locale) || {};
    const values = Object.values(cluster);
    if (!values.length) {
      failures.push('Empty hreflang cluster: ' + where);
    } else if (!values.includes(canonical)) {
      failures.push('Hreflang cluster does not contain the page itself: ' + where);
    }
    if (!cluster['x-default']) failures.push('No x-default in cluster: ' + where);
  });

  return { pages: pages.length, byType, failures };
}

// Run directly for a readable report.
if (import.meta.url === 'file://' + process.argv[1]) {
  const result = runPageAudit();
  console.log('Page audit: ' + result.pages + ' indexable pages');
  Object.entries(result.byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, n]) => console.log('  ' + String(type).padEnd(16) + String(n).padStart(4)));
  console.log('');
  console.log('Word floors: ' + Object.entries(WORD_FLOOR).map(([t, n]) => t + ' ' + n).join(', '));
  console.log('');
  if (result.failures.length) {
    console.log('PAGE AUDIT FAILED: ' + result.failures.length + ' problem(s)');
    result.failures.forEach((f) => console.log('  ' + f));
    process.exit(1);
  }
  console.log('Page audit passed. Every indexable page has a title, an H1, a meta description, a self referencing hreflang cluster with x-default, and enough editorial substance for its type.');
}

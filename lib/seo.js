import { getLocale, DEFAULT_LOCALE } from './i18n.js';
import { routes, absolute, SITE_URL } from './routes.js';
import { indexingAllowed } from './indexing.js';
import { localesWithDestination, localesWithGuide, localesWithRegion, localesWithCompatibility, localesWithLegal, contentLocales } from './content/index.js';

// Hreflang is only ever built from pages that exist. A cluster that points at a
// URL which was never published is worse than no cluster at all.
function cluster(pairs) {
  const languages = {};
  pairs.forEach(([locale, path]) => {
    const l = getLocale(locale);
    if (l) languages[l.hreflang] = absolute(path);
  });
  const fallback = pairs.find(([locale]) => locale === DEFAULT_LOCALE) || pairs[0];
  if (fallback) languages['x-default'] = absolute(fallback[1]);
  return languages;
}

// Indexing is opened only when the site runs on its own domain. A preview
// deployment carries a different host, and a preview that gets indexed competes
// with production for the same queries. robots.txt already blocks the crawl;
// this closes the same door at page level, so the two can never disagree.
const INDEXABLE = indexingAllowed();

export function buildMetadata({ title, description, path, locale, alternates, robots, type = 'website' }) {
  const canonical = absolute(path);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: alternates,
    },
    robots: INDEXABLE ? robots || { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Livdar',
      locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function homeAlternates() {
  return cluster(contentLocales().map((l) => [l, routes.home(l)]));
}

export function hubAlternates(kind) {
  const fn = kind === 'guides' ? routes.guidesHub : kind === 'regions' ? routes.regionsHub : routes.esimHub;
  return cluster(contentLocales().map((l) => [l, fn(l)]));
}

export function destinationAlternates(destinationId) {
  const locales = localesWithDestination(destinationId);
  return cluster(locales.map((l) => [l, routes.destination(l, destinationId)]));
}

export function guideAlternates(slug) {
  const locales = localesWithGuide(slug);
  return cluster(locales.map((l) => [l, routes.guide(l, slug)]));
}

export function regionAlternates(regionId) {
  return cluster(localesWithRegion(regionId).map((l) => [l, routes.region(l, regionId)]));
}

// The compatibility page has its own cluster. It used to borrow the eSIM hub's,
// which pointed every market at a page that is not its translation and left the
// page without a self reference.
export function compatibilityAlternates() {
  return cluster(localesWithCompatibility().map((l) => [l, routes.compatibility(l)]));
}

export function legalAlternates(kind) {
  return cluster(localesWithLegal(kind).map((l) => [l, routes[kind](l)]));
}

// Structured data. Only types the page genuinely satisfies. No Product schema
// while there is no product with a price, no FAQPage where the block is not a
// real question and answer list visible on the page.

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Livdar',
    url: SITE_URL,
    description: 'Travel connectivity for over 120 destinations.',
  };
}

export function websiteSchema(locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Livdar',
    url: absolute(routes.home(locale)),
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absolute(routes.esimHub(locale)) + '?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webPageSchema({ name, description, path, locale, pageType = 'WebPage' }) {
  return {
    '@context': 'https://schema.org',
    '@type': pageType,
    name,
    description,
    url: absolute(path),
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', name: 'Livdar', url: SITE_URL },
  };
}

export function articleSchema({ headline, description, path, locale }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: absolute(path),
    mainEntityOfPage: absolute(path),
    inLanguage: locale,
    publisher: { '@type': 'Organization', name: 'Livdar', url: SITE_URL },
  };
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

// A hub is a list of pages, and saying so is the one piece of structured data
// these three pages were missing. Only published URLs go in, so the list is a
// description of what exists rather than a claim about what might.
//
// Deliberately not ItemList with prices attached. There is no Offer anywhere on
// this site while the catalogue is illustrative, and a list that carried prices
// would be exactly the fabrication the sample marker exists to prevent.
export function collectionPageSchema({ name, description, path, locale, items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absolute(path),
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', name: 'Livdar', url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: absolute(item.path),
      })),
    },
  };
}

export function faqSchema(faq) {
  if (!Array.isArray(faq) || faq.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function jsonLd(objects) {
  return objects.filter(Boolean).map((o) => JSON.stringify(o));
}

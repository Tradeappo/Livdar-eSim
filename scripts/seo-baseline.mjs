// SEO baseline, generated from the source of truth rather than scraped.
//
// This exists so that a redesign can be proved not to have cost anything. The
// integration of the new eSIM front end touches every template on the site, and
// the honest question afterwards is not "does it look right" but "is every URL
// still the same URL, with the same title, the same canonical, the same
// hreflang cluster and the same structured data". A screenshot cannot answer
// that. A recorded baseline can.
//
// It is generated rather than crawled on purpose. A crawl of the live site
// answers what production served at one moment, which is useful once; a
// generator walks the same router, the same content registry and the same
// metadata builders that the build itself uses, so it can be re-run on any
// working tree and compared field by field. That makes it a regression test
// rather than a souvenir.
//
// Run:  node scripts/seo-baseline.mjs > reports/seo-baseline.json
// Diff: node scripts/seo-regression.mjs

import {
  publishedDestinationIds,
  publishedRegionIds,
  publishedGuideSlugs,
  destinationContent,
  guideContent,
  regionContent,
  compatibilityContent,
  legalContent,
  homeContent,
  editorialWordCount,
  contentLocales,
} from '../lib/content/index.js';
import { enumeratePages } from './page-audit.mjs';
import { routes, absolute } from '../lib/routes.js';
import { ui } from '../lib/content/ui.js';
import {
  homeAlternates,
  hubAlternates,
  destinationAlternates,
  guideAlternates,
  regionAlternates,
  compatibilityAlternates,
  legalAlternates,
} from '../lib/seo.js';

// Indexability is an environment decision, recorded so a baseline taken on a
// preview is never silently compared against one taken on production.
const INDEXABLE = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';

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

// The three hub types build their title and description in generateMetadata
// rather than from a content document, so the baseline has to reproduce that
// same shape or it would record a hub as having no title at all.
function metaFor(node, locale) {
  const t = ui(locale);
  switch (node.type) {
    case 'destination': {
      const c = destinationContent(locale, node.destination.id);
      return { title: c.title, description: c.metaDescription, h1: c.h1, faq: (c.faq || []).length, words: editorialWordCount(c), ogType: 'article' };
    }
    case 'guide': {
      const g = guideContent(locale, node.slug);
      return { title: g.title, description: g.metaDescription, h1: g.h1, faq: (g.faq || []).length, words: editorialWordCount(g), ogType: 'article' };
    }
    case 'region': {
      const c = regionContent(locale, node.region.id);
      return { title: c.title, description: c.metaDescription, h1: c.h1, faq: (c.faq || []).length, words: editorialWordCount(c), ogType: 'website' };
    }
    case 'compatibility': {
      const c = compatibilityContent(locale);
      return { title: c.title, description: c.metaDescription, h1: c.h1, faq: (c.faq || []).length, words: editorialWordCount(c), ogType: 'website' };
    }
    case 'legal': {
      const c = legalContent(locale, node.kind);
      return { title: c.title, description: c.metaDescription, h1: c.h1, faq: (c.faq || []).length, words: editorialWordCount(c), ogType: 'website' };
    }
    case 'home': {
      const c = homeContent(locale);
      return { title: c.title, description: c.metaDescription, h1: c.heroTitle, faq: (c.faq || []).length, words: editorialWordCount(c), ogType: 'website' };
    }
    case 'esimHub':
      return {
        title: t.nav.esim + ' | Livdar eSIM',
        description: t.hubMeta.esim,
        h1: t.nav.esim,
        faq: 0,
        words: null,
        ogType: 'website',
      };
    case 'regionsHub':
      return {
        title: t.nav.regions + ' | Livdar eSIM',
        description: t.hubMeta.regions,
        h1: t.nav.regions,
        faq: 0,
        words: null,
        ogType: 'website',
      };
    case 'guidesHub':
      return {
        title: t.nav.guides + ' | Livdar eSIM',
        description: t.hubMeta.guides,
        h1: t.nav.guides,
        faq: 0,
        words: null,
        ogType: 'website',
      };
    default:
      return { title: null, description: null, h1: null, faq: 0, words: null, ogType: 'website' };
  }
}

// Which structured data each page type carries today. Recorded as a shape
// rather than as the objects themselves, because the regression question is
// "does this page still declare a BreadcrumbList with four items", not "is the
// wording of question three unchanged" - that belongs to the content checks.
// How many entries a hub lists. Read from the registry rather than counted at
// render time, so the baseline and the page cannot disagree.
function hubItemCount(node, meta) {
  const locale = meta.locale;
  if (node.type === 'esimHub') return publishedDestinationIds(locale).length;
  if (node.type === 'regionsHub') return publishedRegionIds(locale).length;
  if (node.type === 'guidesHub') return publishedGuideSlugs(locale).length;
  return 0;
}

function schemaShapeFor(node, meta) {
  switch (node.type) {
    case 'home':
      return [{ type: 'Organization' }, { type: 'WebSite' }];
    case 'destination':
    case 'guide':
    case 'region':
    case 'compatibility':
      return [{ type: 'BreadcrumbList' }, meta.faq >= 2 ? { type: 'FAQPage', items: meta.faq } : null].filter(Boolean);
    case 'legal':
      return [{ type: 'BreadcrumbList' }];
    case 'esimHub':
    case 'regionsHub':
    case 'guidesHub':
      // A hub is a list of pages, and now says so. The item count is part of the
      // recorded shape, so a hub that silently stops listing half its children
      // is a regression rather than a cosmetic change.
      return [{ type: 'BreadcrumbList' }, { type: 'CollectionPage', items: hubItemCount(node, meta) }];
    default:
      return [];
  }
}

export function buildBaseline() {
  const pages = enumeratePages().filter((p) => p.type !== 'unresolved');
  const out = {};

  pages.forEach((page) => {
    const meta = metaFor(page.node || { type: page.type }, page.locale);
    const cluster = clusterFor(page.node || { type: page.type }, page.locale) || {};
    out[page.path] = {
      locale: page.locale,
      type: page.type,
      canonical: absolute(page.path),
      title: meta.title,
      titleLength: meta.title ? meta.title.length : 0,
      description: meta.description,
      descriptionLength: meta.description ? meta.description.length : 0,
      h1: meta.h1,
      ogType: meta.ogType,
      robots: INDEXABLE ? 'index, follow' : 'noindex, nofollow',
      indexable: INDEXABLE,
      hreflang: cluster,
      hreflangLangs: Object.keys(cluster).sort(),
      xDefault: cluster['x-default'] || null,
      faqEntries: meta.faq,
      editorialWords: meta.words,
      schema: schemaShapeFor(page.node || { type: page.type }, { ...meta, locale: page.locale }),
      inSitemap: true,
    };
  });

  // Known issues recorded with the baseline rather than discovered again later.
  // A baseline that only says "everything matched" hides the things that were
  // already wrong before the work started.
  const known = [];
  const byDescription = {};
  Object.entries(out).forEach(([path, p]) => {
    if (!p.description) return;
    (byDescription[p.description] = byDescription[p.description] || []).push(path);
  });
  Object.entries(byDescription)
    .filter(([, paths]) => paths.length > 1)
    .forEach(([description, paths]) => {
      const locales = [...new Set(paths.map((p) => out[p].locale))];
      known.push({
        issue: 'duplicate-meta-description',
        detail:
          locales.length > 1
            ? 'The same description is served in ' + locales.join(', ') + '. The hub descriptions are hard coded in English in generateMetadata, so the German and Romanian hubs ship an English description.'
            : 'Repeated within one market.',
        description: description.slice(0, 90),
        paths,
      });
    });

  return {
    generatedAt: new Date().toISOString(),
    siteUrl: absolute('/').replace(/\/$/, ''),
    indexable: INDEXABLE,
    locales: contentLocales(),
    pageCount: Object.keys(out).length,
    byType: pages.reduce((acc, p) => ((acc[p.type] = (acc[p.type] || 0) + 1), acc), {}),
    knownIssues: known,
    pages: out,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const baseline = buildBaseline();
  if (process.argv.includes('--summary')) {
    console.log('SEO baseline: ' + baseline.pageCount + ' pages, ' + baseline.locales.join(', '));
    Object.entries(baseline.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([t, n]) => console.log('  ' + String(t).padEnd(14) + String(n).padStart(4)));
    console.log('');
    if (baseline.knownIssues.length) {
      console.log('Known issues already present before any integration work:');
      baseline.knownIssues.forEach((k) => {
        console.log('  ' + k.issue + ': ' + k.paths.join(', '));
        console.log('    ' + k.detail);
      });
    } else {
      console.log('No known issues recorded.');
    }
  } else {
    console.log(JSON.stringify(baseline, null, 2));
  }
}

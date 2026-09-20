// Quality gate.
//
// Runs before every build. If anything here fails, nothing gets deployed. The
// point is that the rules this project claims to follow are enforced by the
// build rather than by memory.

import { readFileSync, readdirSync } from 'node:fs';
import { runDashCheck } from './dash-check.mjs';
import { runSimilarityCheck } from './similarity-check.mjs';
import { marketStatus, REQUIRED_FOR_PUBLICATION } from '../lib/markets.js';
import { runPageAudit } from './page-audit.mjs';
import { runOrthographyCheck } from './orthography-check.mjs';
import { runRegression } from './seo-regression.mjs';
import { manifestProblems, DESTINATION_IMAGES, REGION_IMAGES } from '../lib/media.js';
import { LOCALES, segment } from '../lib/i18n.js';
import { DESTINATIONS, REGIONS, destinationSlug } from '../lib/destinations.js';
import {
  contentLocales,
  publishedDestinationIds,
  publishedGuideSlugs,
  ui,
  publishedRegionIds,
  regionContent,
  localesWithRegion,
  compatibilityContent,
  localesWithCompatibility,
  legalContent,
  legalDraft,
  legalProblems,
  LEGAL_KINDS,
  IDENTITY,
  localesWithDestination,
  localesWithGuide,
} from '../lib/content/index.js';
import { resolvePath, allPathsForLocale } from '../lib/resolve.js';
import { routes, absolute } from '../lib/routes.js';
import { homeAlternates, hubAlternates, destinationAlternates, guideAlternates, regionAlternates, compatibilityAlternates } from '../lib/seo.js';
import { CHECKOUT_ENABLED, activeProviderId } from '../lib/providers/index.js';

const failures = [];
const notes = [];

function fail(message) { failures.push(message); }
function warn(message) { notes.push(message); }

// Indexing on means this build is headed for the real domain rather than a
// preview, which raises the bar for what may ship.
const INDEXABLE = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';

// 1. Locale table and content registry must agree. A locale marked live with no
// content would be a linked market with nothing behind it.
{
  // Market readiness. Publication is computed from content rather than declared,
  // so this prints what is live and what each pending market still needs. A
  // market appears in the selector, in hreflang and in the sitemap only when it
  // clears every requirement.
  const status = marketStatus();
  const live = status.filter((m) => m.published).map((m) => m.code);
  const pending = status.filter((m) => !m.published);
  notes.push('Published markets: ' + live.length + ' of ' + status.length + ' (' + live.join(', ') + ')');
  notes.push('Requirements per market: ' + REQUIRED_FOR_PUBLICATION.join(', '));
  if (!live.length) fail('No market is publishable. Every locale is missing required content.');
  pending.slice(0, 6).forEach((m) => {
    notes.push('  pending ' + m.code + ': needs ' + m.missing.join(', '));
  });
  if (pending.length > 6) notes.push('  and ' + (pending.length - 6) + ' more locales awaiting content');
}

// 2. Every published destination must be a real destination, and slugs must be
// unique inside each market.
contentLocales().forEach((locale) => {
  const seen = new Map();
  publishedDestinationIds(locale).forEach((id) => {
    const dest = DESTINATIONS.find((d) => d.id === id);
    if (!dest) {
      fail('Content exists for destination "' + id + '" in ' + locale + ' but that destination is not in the dataset.');
      return;
    }
    const slug = destinationSlug(dest, locale);
    if (!slug) fail('Destination ' + id + ' has an empty slug in ' + locale + '.');
    if (!/^[a-z0-9-]+$/.test(slug)) fail('Destination slug "' + slug + '" in ' + locale + ' is not URL safe.');
    if (seen.has(slug)) fail('Slug collision in ' + locale + ': "' + slug + '" used by ' + seen.get(slug) + ' and ' + id + '.');
    seen.set(slug, id);
  });
});

// Slug uniqueness across the whole dataset, not only the published subset, so a
// collision cannot appear later when a page is published.
LOCALES.forEach((l) => {
  const seen = new Map();
  DESTINATIONS.forEach((d) => {
    const slug = destinationSlug(d, l.code);
    if (seen.has(slug)) fail('Dataset slug collision in ' + l.code + ': "' + slug + '" (' + seen.get(slug) + ' and ' + d.id + ').');
    seen.set(slug, d.id);
  });
  // A destination slug must never shadow a section segment.
  ['esim', 'guides', 'regions', 'compare', 'compatibility'].forEach((key) => {
    const seg = segment(key, l.code);
    if (seen.has(seg)) fail('Destination slug "' + seg + '" in ' + l.code + ' collides with the "' + key + '" path segment.');
  });
});

// 2b. Guide slugs must be URL safe, and any slug the site chrome hardcodes must
// exist in every published market.
//
// BOTH CHECKS EXIST BECAUSE BOTH FAILED. A diacritics table entry mapping "esim"
// to "eSIM" rewrote three Romanian guide keys into 'how-eSIM-works',
// 'install-eSIM' and 'eSIM-vs-roaming'. Nothing caught it: generation and
// resolution read the same corrupted key, so the routes were self consistent and
// every existing check passed. What actually broke was invisible from inside
// that loop. The footer hardcodes 'how-esim-works' and 'esim-vs-roaming', so
// every Romanian page carried two links to a 404, and Romanian silently left the
// hreflang cluster for all three guides.
{
  contentLocales().forEach((locale) => {
    publishedGuideSlugs(locale).forEach((slug) => {
      if (!/^[a-z0-9-]+$/.test(slug)) {
        fail('Guide slug "' + slug + '" in ' + locale + ' is not URL safe. Slugs are lowercase, digits and hyphens.');
      }
    });
  });

  // Slugs the header and footer link to unconditionally. If one of these is
  // missing from a published market, that market ships a broken link on every
  // page, which is exactly how this was found.
  const CHROME_GUIDE_SLUGS = ['how-esim-works', 'esim-vs-roaming'];
  contentLocales().forEach((locale) => {
    CHROME_GUIDE_SLUGS.forEach((slug) => {
      if (!publishedGuideSlugs(locale).includes(slug)) {
        fail(
          'The footer links to the guide "' + slug + '" on every page, but ' + locale +
            ' does not publish it. That market ships a broken link site wide.'
        );
      }
    });
  });
}

// 3. Every path that will be statically generated must resolve, and every
// resolvable path must be generated. The sitemap reads from the same source, so
// this also proves the sitemap cannot drift.
let pathCount = 0;
contentLocales().forEach((locale) => {
  const paths = allPathsForLocale(locale);
  pathCount += paths.length + 1; // plus the home page
  const seen = new Set();
  paths.forEach((parts) => {
    const joined = parts.join('/');
    if (seen.has(joined)) fail('Duplicate generated path in ' + locale + ': /' + joined + '/');
    seen.add(joined);
    const node = resolvePath(locale, parts);
    if (!node) fail('Path /' + locale + '/' + joined + '/ is generated but does not resolve.');
  });
});

// 4. Paths that must not resolve. An unpublished destination has to 404 rather
// than render an empty page, otherwise the tree fills with thin URLs.
contentLocales().forEach((locale) => {
  const published = publishedDestinationIds(locale);
  const unpublished = DESTINATIONS.find((d) => !published.includes(d.id));
  if (unpublished) {
    const node = resolvePath(locale, [segment('esim', locale), destinationSlug(unpublished, locale)]);
    if (node) fail('Unpublished destination ' + unpublished.id + ' resolves in ' + locale + '. It must not.');
  }
  if (resolvePath(locale, ['definitely-not-a-section'])) fail('Unknown first segment resolves in ' + locale + '.');
  if (resolvePath(locale, [segment('esim', locale), 'nope', 'deeper'])) fail('Over deep eSIM path resolves in ' + locale + '.');
});

// 5. Hreflang must be reciprocal, self referencing, and must only point at URLs
// that exist. A cluster pointing at a page that was never built is a ranking
// problem, not a cosmetic one.
function assertCluster(label, locale, selfPath, languages) {
  const self = absolute(selfPath);
  const values = Object.values(languages);
  if (!values.includes(self)) fail(label + ': cluster for ' + locale + ' does not include its own URL ' + self);
  if (!languages['x-default']) fail(label + ': cluster for ' + locale + ' has no x-default.');
  Object.entries(languages).forEach(([tag, url]) => {
    if (tag === 'x-default') return;
    const path = url.replace(absolute(''), '');
    const parts = path.split('/').filter(Boolean);
    const other = parts.shift();
    if (!contentLocales().includes(other)) {
      fail(label + ': cluster points at ' + url + ' which is not a live market.');
      return;
    }
    const node = resolvePath(other, parts);
    if (!node) fail(label + ': cluster points at ' + url + ' which does not resolve.');
  });
}

contentLocales().forEach((locale) => {
  assertCluster('home', locale, routes.home(locale), homeAlternates());
  assertCluster('esim hub', locale, routes.esimHub(locale), hubAlternates('esim'));
  assertCluster('regions hub', locale, routes.regionsHub(locale), hubAlternates('regions'));
  assertCluster('guides hub', locale, routes.guidesHub(locale), hubAlternates('guides'));

  publishedDestinationIds(locale).forEach((id) => {
    assertCluster('destination ' + id, locale, routes.destination(locale, id), destinationAlternates(id));
    // Reciprocity: every market listed must itself list this market.
    localesWithDestination(id).forEach((other) => {
      if (!localesWithDestination(id).includes(locale)) {
        fail('Destination ' + id + ': ' + other + ' lists ' + locale + ' but not the reverse.');
      }
    });
  });

  publishedGuideSlugs(locale).forEach((slug) => {
    assertCluster('guide ' + slug, locale, routes.guide(locale, slug), guideAlternates(slug));
    if (!localesWithGuide(slug).includes(locale)) fail('Guide ' + slug + ' in ' + locale + ' is missing from its own cluster.');
  });

  // Region pages exist only where content was authored for that market, so the
  // cluster is checked against what is published rather than against the full
  // region table. A region without content has no URL to reference.
  if (compatibilityContent(locale)) {
    assertCluster('compatibility', locale, routes.compatibility(locale), compatibilityAlternates());
    if (!localesWithCompatibility().includes(locale)) fail('Compatibility in ' + locale + ' is missing from its own cluster.');
  }

  publishedRegionIds(locale).forEach((id) => {
    assertCluster('region ' + id, locale, routes.region(locale, id), regionAlternates(id));
    if (!localesWithRegion(id).includes(locale)) fail('Region ' + id + ' in ' + locale + ' is missing from its own cluster.');
  });
});

// 5b. The interface string table crosses into client components, so every value
// in it must be JSON serialisable. A function here does not fail until Next
// tries to prerender a page, and the error message points at the component
// rather than at the table. Catching it in the gate costs nothing.
{
  contentLocales().forEach((locale) => {
    const table = ui(locale);
    const walk = (node, path) => {
      Object.entries(node).forEach(([key, value]) => {
        const where = path ? path + '.' + key : key;
        const type = typeof value;
        if (type === 'function') {
          fail('ui(' + locale + ').' + where + ' is a function. The string table is passed to client components and must stay serialisable. Use a {placeholder} token instead.');
        } else if (value && type === 'object' && !Array.isArray(value)) {
          walk(value, where);
        }
      });
    };
    walk(table, '');
  });
}

// 5c. Legal pages must not go live with invented legal facts.
//
// Livdar is a project rather than a registered company, and the policies say so
// in plain words. That is allowed and it is the honest position. What is not
// allowed is a fabricated registration number, a fake VAT id, a sample address
// or a leftover template token, because each of those tells the reader there is
// a legal entity standing behind the site when there is not.
//
// The check matches shapes rather than topics, so the sentence that denies
// having a company number passes while an actual company number would not. It
// also requires the positive half: the privacy policy has to name the
// controller, give a working contact address, and state that Livdar is not a
// registered company for as long as that is true.
{
  const blocked = [];
  contentLocales().forEach((locale) => {
    LEGAL_KINDS.forEach((kind) => {
      if (!legalDraft(locale, kind)) return;
      legalProblems(locale, kind).forEach((problem) => {
        blocked.push(locale + '/' + kind + ': ' + problem);
      });
    });
  });
  if (blocked.length) {
    // Unlike a missing company registration, these are always failures. A
    // published policy with a fabricated identifier is worse on a preview than
    // no policy at all, so this does not soften when indexing is off.
    blocked.forEach((b) => fail('Legal page rejected, ' + b));
  } else {
    notes.push(
      'Legal: controller ' + IDENTITY.publicName +
        (IDENTITY.incorporated ? ', incorporated' : ', project not incorporated, stated as such') +
        ', contact ' + IDENTITY.contactEmail
    );
  }
}

// 6. Canonicals must be unique. Two pages sharing one canonical means one of
// them is invisible.
{
  const canonicals = new Map();
  contentLocales().forEach((locale) => {
    const all = [[locale], ...allPathsForLocale(locale).map((p) => [locale, ...p])];
    all.forEach((parts) => {
      const url = absolute('/' + parts.join('/') + '/');
      if (canonicals.has(url)) fail('Duplicate canonical ' + url);
      canonicals.set(url, true);
    });
  });
  notes.push('Canonical URLs: ' + canonicals.size);
}

// 7. Commerce safety. Checkout must stay closed while no supplier can actually
// deliver a profile.
{
  const provider = activeProviderId();
  if (provider === 'stub' && CHECKOUT_ENABLED) {
    fail('Checkout is enabled while the active provider is the stub. A paid checkout must never front an undeliverable product.');
  }
  notes.push('Provider: ' + provider + ', checkout ' + (CHECKOUT_ENABLED ? 'ENABLED' : 'disabled'));
}

// 8. No secrets in anything the browser can read.
{
  const clientEnv = Object.keys(process.env).filter((k) => k.startsWith('NEXT_PUBLIC_'));
  clientEnv.forEach((key) => {
    if (/SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY/i.test(key)) {
      fail('Environment variable ' + key + ' is exposed to the browser and looks like a secret.');
    }
  });
}

// 8b. Per page audit across every indexable page.
//
// The rest of this file checks the system. This checks each page on its own,
// and it enumerates the routing tree rather than a list of content tables, so a
// page type added later cannot escape the audit by not being on anyone's list.
// That is the exact failure this exists to prevent: the region pages were
// outside every check for as long as they were outside the content registry,
// which is how thirty three of them reached the sitemap with six words on them.
{
  const audit = runPageAudit();
  notes.push(
    'Page audit: ' + audit.pages + ' indexable pages (' +
      Object.entries(audit.byType).sort((a, b) => b[1] - a[1]).map(([t, n]) => t + ' ' + n).join(', ') + ')'
  );
  audit.failures.forEach((f) => fail(f));
}

// 8c. Orthography, per language.
//
// The gate checked dashes, duplication, word counts and hreflang, and none of
// that noticed that seven hundred German words had lost their umlauts. A reader
// does not see a missing diacritic, they see a broken site, so this is a
// failure rather than a warning.
{
  const orth = runOrthographyCheck();
  notes.push('Orthography: ' + orth.guardedWords + ' German and Romanian spellings guarded across ' + orth.files + ' files');
  orth.failures.forEach((f) => fail(f));
}

// 8d. An event that describes a navigation has to survive it.
//
// This has now cost the project two measured funnel steps. The language
// selector pushed language_change next to a plain link and nothing ever
// arrived. It was fixed, and the identical pattern stayed in the call to
// action component, where six of the seven calls to action carry an href.
// Measured on the live domain: clicking the hero call to action produced two
// page_view hits and no cta_click at all, while the code read correctly and
// the dataLayer read correctly. A report that is silently short is worse than
// one that is obviously missing, because nobody goes looking for it.
//
// The rule the gate can actually check: a client component that pushes an
// event and also drives a navigation must hand the tag an eventCallback, and
// must have a timeout behind it so the link still works when consent is denied
// and the callback never runs.
{
  const clientFiles = readdirSync(new URL('../components/', import.meta.url))
    .filter((f) => f.endsWith('.jsx'));
  let guarded = 0;
  clientFiles.forEach((file) => {
    const source = readFileSync(new URL('../components/' + file, import.meta.url), 'utf8');
    if (!source.includes('pushEvent')) return;
    // A navigation the component performs itself, rather than one the browser
    // performs from an untouched href.
    if (!/window\.location\.href\s*=/.test(source)) return;
    guarded += 1;
    if (!source.includes('eventCallback')) {
      fail(
        'components/' + file + ': pushes an event and navigates, but never passes eventCallback. ' +
          'The page unloads before the tag sends, so the event is lost. See components/Cta.jsx.'
      );
    }
    if (!/eventTimeout/.test(source) || !/setTimeout/.test(source)) {
      fail(
        'components/' + file + ': uses eventCallback without a timeout behind it. ' +
          'With consent denied the callback never runs and the link stops working.'
      );
    }
  });
  notes.push('Navigation events: ' + guarded + ' component(s) that navigate carry eventCallback and a timeout');
}

// 8e. Nothing a crawler can see may move without being declared.
//
// The front end is being replaced. Every template the redesign touches also
// carries the title, the canonical, the hreflang cluster and the structured
// data, which means a purely visual change can quietly cost rankings and look
// like a success in the browser. So the build compares the current tree against
// a recorded baseline and refuses anything that moved without an entry in
// ALLOWED_DRIFT saying which paths, which fields and why.
//
// This is deliberately strict about URLs. A changed title is a regression worth
// arguing about; a URL that disappeared is a 404 for every link already pointing
// at it, and no redesign is worth that.
{
  const reg = runRegression();
  notes.push(
    'SEO regression: ' + reg.checked + ' URL(s) compared against the baseline' +
      (reg.drifted && reg.drifted.length ? ', ' + reg.drifted.length + ' declared change(s)' : ', no declared changes')
  );
  (reg.drifted || []).slice(0, 10).forEach((d) => notes.push('  declared: ' + d));
  (reg.failures || []).forEach((f) => fail('SEO regression: ' + f));
}

// 8f. The sample catalogue may never be presented as a real offer.
//
// The shop carries illustrative prices so that purchase intent can be measured
// before a supplier exists. That is a reasonable thing to do and a dangerous
// thing to do carelessly, because the difference between "a sample" and "a lie"
// is entirely in whether the reader and the search engine are told.
//
// Two halves, both enforced here rather than remembered:
//
//   The machine half. Offer, Product, AggregateOffer, AggregateRating and
//   Review are forbidden in structured data anywhere in the codebase. Emitting
//   a price to Google in schema is telling Google the price is real, and no
//   visible disclaimer undoes that, because the disclaimer is not in the feed.
//
//   The human half. Every component that renders a price must also render the
//   sample marker and the notice. Checked by reading the components rather than
//   by trusting a convention, because a convention is exactly what gets lost
//   when somebody adds a second card three months from now.
{
  const FORBIDDEN_SCHEMA = ['"Offer"', "'Offer'", '"Product"', "'Product'", '"AggregateOffer"', '"AggregateRating"', "'AggregateRating'", '"Review"', "'Review'"];
  const scan = (dir) =>
    readdirSync(new URL('../' + dir + '/', import.meta.url), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? scan(dir + '/' + e.name) : [dir + '/' + e.name]
    );
  const sourceFiles = [...scan('lib'), ...scan('components'), ...scan('app')].filter((f) => /\.(js|jsx|mjs)$/.test(f));

  sourceFiles.forEach((rel) => {
    const source = readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
    // Only look at what is handed to a schema builder or written as JSON-LD.
    if (!/@type|schema\.org|JsonLd|jsonLd/.test(source)) return;
    FORBIDDEN_SCHEMA.forEach((token) => {
      const re = new RegExp("'@type'\\s*:\\s*" + token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '|"@type"\\s*:\\s*' + token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      if (re.test(source)) {
        fail(
          rel + ': declares @type ' + token + ' in structured data. While the catalogue is illustrative there is no ' +
            'Offer, Product or rating to publish, and putting one in schema tells Google the price is real.'
        );
      }
    });
  });

  // The visible half of the same rule.
  const card = readFileSync(new URL('../components/shop/PlanCard.jsx', import.meta.url), 'utf8');
  if (!card.includes('plan-badge-demo')) {
    fail('components/shop/PlanCard.jsx renders a price without the sample marker. The marker is not optional.');
  }
  if (/badge\s*\?\s*.*plan-badge-demo/.test(card)) {
    fail('components/shop/PlanCard.jsx makes the sample marker conditional. It must render on every card.');
  }
  const browser = readFileSync(new URL('../components/shop/ShopBrowser.jsx', import.meta.url), 'utf8');
  ['demoNoticeTitle', 'demoNoticeBody'].forEach((key) => {
    if (!browser.includes(key)) fail('components/shop/ShopBrowser.jsx does not render ' + key + '. The catalogue must say what it is.');
  });

  // And the notice has to exist in every published market, not only in English.
  contentLocales().forEach((locale) => {
    const t = ui(locale);
    if (!t.shop || !t.shop.demoNoticeBody || !t.shop.demoBadge) {
      fail('The sample catalogue notice is missing in ' + locale + '. A disclaimer that only exists in English is not a disclaimer.');
    }
  });

  notes.push('Sample catalogue: no Offer or Product schema, marker on every card, notice in ' + contentLocales().length + ' market(s)');
}

// 8g. Imagery must be attributable.
{
  const problems = manifestProblems();
  problems.forEach((p) => fail('Media manifest: ' + p));
  const counts = Object.keys(DESTINATION_IMAGES).length + Object.keys(REGION_IMAGES).length;
  notes.push('Media manifest: ' + counts + ' image(s), each with a recorded licence and intrinsic size');
}

// 9 and 10. Text rules and duplication.
const dash = await runDashCheck({ quiet: true });
if (dash.hits.length) {
  fail('Dash check: ' + dash.hits.length + ' forbidden dash character(s).');
  dash.hits.slice(0, 25).forEach((h) => failures.push('    ' + h.file + ':' + h.line + ':' + h.column + ' ' + h.name));
}
notes.push('Dash check: ' + dash.files + ' files, 0 en dash, 0 em dash');

const sim = runSimilarityCheck({ quiet: true });
sim.failures.forEach((f) => fail('Similarity: ' + f));
notes.push('Similarity: ' + sim.pages + ' pages compared, ' + sim.warnings.length + ' warning(s)');
sim.warnings.forEach((w) => notes.push('  warning: ' + w));

// Report.
console.log('');
console.log('Livdar quality gate');
console.log('-------------------');
notes.forEach((n) => console.log('  ' + n));
console.log('  Generated paths: ' + pathCount);
console.log('');

if (failures.length) {
  console.error('QUALITY GATE FAILED: ' + failures.length + ' problem(s)');
  failures.forEach((f) => console.error('  ' + f));
  console.error('');
  process.exit(1);
}

console.log('Quality gate passed.');

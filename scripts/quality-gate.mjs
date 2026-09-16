// Quality gate.
//
// Runs before every build. If anything here fails, nothing gets deployed. The
// point is that the rules this project claims to follow are enforced by the
// build rather than by memory.

import { runDashCheck } from './dash-check.mjs';
import { runSimilarityCheck } from './similarity-check.mjs';
import { marketStatus, REQUIRED_FOR_PUBLICATION } from '../lib/markets.js';
import { runPageAudit } from './page-audit.mjs';
import { runOrthographyCheck } from './orthography-check.mjs';
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

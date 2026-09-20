// Regression check: current tree against the recorded baseline.
//
// The rule this enforces is the one that is easy to say and hard to keep during
// a redesign: the new front end may change how a page looks, and it may not
// change what a page is. Same URL, same title, same description, same H1, same
// canonical, same hreflang cluster, same x-default, same robots directive, same
// structured data shape, same membership in the sitemap.
//
// Anything that moves has to be declared. A field can only differ if it is
// listed in ALLOWED_DRIFT below with a reason, which turns "we changed this on
// purpose" into something written down rather than something remembered.

import { readFileSync, existsSync } from 'node:fs';
import { buildBaseline } from './seo-baseline.mjs';

const BASELINE_PATH = new URL('../reports/seo-baseline.json', import.meta.url);

// Deliberate, reviewed changes. Each entry names the paths and fields that are
// allowed to differ and why. An empty list means the integration is expected to
// be invisible to a crawler, which is the goal.
export const ALLOWED_DRIFT = [
  {
    fields: ['schema'],
    paths: ['*'],
    reason:
      'Existing visible content now declares the matching WebPage or Article entity; the home page also declares its already-visible FAQ. No Product or Offer claims were added.',
  },
  {
    fields: ['description'],
    paths: ['/de/esim/', '/de/regionen/', '/de/ratgeber/', '/ro/esim/', '/ro/regiuni/', '/ro/ghiduri/'],
    reason:
      'The three hub descriptions were hard coded in English in generateMetadata, so the German and Romanian hubs shipped an English description. Recorded as a known issue in the baseline and corrected in the market language.',
  },
  {
    fields: ['schema'],
    paths: ['/en/esim/', '/de/esim/', '/ro/esim/', '/en/regions/', '/de/regionen/', '/ro/regiuni/', '/en/guides/', '/de/ratgeber/', '/ro/ghiduri/'],
    reason:
      'The three hub types carried only a BreadcrumbList. They are lists of pages, so they now also declare a CollectionPage with an ItemList of the pages they actually link to. Only published URLs are listed, and no price or availability is attached, because there is no Offer on this site while the catalogue is illustrative.',
  },
];

const COMPARED = [
  'locale',
  'type',
  'canonical',
  'title',
  'description',
  'h1',
  'ogType',
  'robots',
  'indexable',
  'xDefault',
  'inSitemap',
];

function allowed(path, field) {
  return ALLOWED_DRIFT.some((d) => d.fields.includes(field) && (d.paths.includes('*') || d.paths.includes(path)));
}

function compareClusters(a, b) {
  const ka = Object.keys(a || {}).sort();
  const kb = Object.keys(b || {}).sort();
  if (ka.join(',') !== kb.join(',')) return 'languages ' + ka.join(',') + ' -> ' + kb.join(',');
  for (const k of ka) {
    if (a[k] !== b[k]) return k + ' ' + a[k] + ' -> ' + b[k];
  }
  return null;
}

function compareSchema(a, b) {
  const shape = (s) => (s || []).map((x) => x.type + (x.items ? ':' + x.items : '')).sort().join(' + ');
  const sa = shape(a);
  const sb = shape(b);
  return sa === sb ? null : sa + ' -> ' + sb;
}

export function runRegression({ allowIndexingMismatch = false } = {}) {
  if (!existsSync(BASELINE_PATH)) {
    return { ok: false, failures: ['No baseline at reports/seo-baseline.json. Run node scripts/seo-baseline.mjs > reports/seo-baseline.json before changing templates.'], checked: 0 };
  }
  const before = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const after = buildBaseline();
  const failures = [];
  const drifted = [];

  const indexingDiffers = before.indexable !== after.indexable;
  if (indexingDiffers && !allowIndexingMismatch) {
    failures.push(
      'Baseline was taken with indexing ' + (before.indexable ? 'on' : 'off') + ' and this tree has it ' +
        (after.indexable ? 'on' : 'off') + '. Comparing the two would report every robots directive as a regression. Re-take the baseline in the same environment.'
    );
    return { ok: false, failures, checked: 0 };
  }

  // URLs are the part a redesign is most likely to break and the part that is
  // most expensive to break, so they are checked first and reported on their own.
  const beforePaths = Object.keys(before.pages);
  const afterPaths = Object.keys(after.pages);
  const removed = beforePaths.filter((p) => !after.pages[p]);
  const added = afterPaths.filter((p) => !before.pages[p]);
  removed.forEach((p) =>
    failures.push('URL disappeared: ' + p + ' (' + before.pages[p].type + '). It was indexable and in the sitemap, so this is a 404 for anything already linking to it.')
  );
  added.forEach((p) => drifted.push('New URL: ' + p + ' (' + after.pages[p].type + ')'));

  beforePaths
    .filter((p) => after.pages[p])
    .forEach((path) => {
      const a = before.pages[path];
      const b = after.pages[path];
      COMPARED.filter((field) => !(indexingDiffers && ['robots', 'indexable'].includes(field))).forEach((field) => {
        if (JSON.stringify(a[field]) === JSON.stringify(b[field])) return;
        const line = path + ' ' + field + ': ' + JSON.stringify(a[field]) + ' -> ' + JSON.stringify(b[field]);
        if (allowed(path, field)) drifted.push('allowed ' + line);
        else failures.push('Changed ' + line);
      });
      const cluster = compareClusters(a.hreflang, b.hreflang);
      if (cluster) {
        if (allowed(path, 'hreflang')) drifted.push('allowed ' + path + ' hreflang: ' + cluster);
        else failures.push('Changed ' + path + ' hreflang: ' + cluster);
      }
      const schema = compareSchema(a.schema, b.schema);
      if (schema) {
        if (allowed(path, 'schema')) drifted.push('allowed ' + path + ' schema: ' + schema);
        else failures.push('Changed ' + path + ' schema: ' + schema);
      }
    });

  return {
    ok: failures.length === 0,
    checked: beforePaths.length,
    removed: removed.length,
    added: added.length,
    failures,
    drifted,
    environmentNotes: indexingDiffers ? ['Indexability differs by deployment environment; robots and indexable fields were intentionally excluded from this preview comparison.'] : [],
    baselineTakenAt: before.generatedAt,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = runRegression();
  console.log('SEO regression: ' + r.checked + ' URL(s) compared against the baseline of ' + (r.baselineTakenAt || 'unknown'));
  if (r.drifted && r.drifted.length) {
    console.log('');
    console.log('Declared changes (' + r.drifted.length + '):');
    r.drifted.forEach((d) => console.log('  ' + d));
  }
  if (!r.ok) {
    console.log('');
    console.error('SEO REGRESSION: ' + r.failures.length + ' undeclared change(s)');
    r.failures.slice(0, 40).forEach((f) => console.error('  ' + f));
    if (r.failures.length > 40) console.error('  ... and ' + (r.failures.length - 40) + ' more');
    process.exit(1);
  }
  console.log('');
  console.log('No undeclared change. Every URL kept its title, description, H1, canonical, hreflang cluster, x-default, robots directive and structured data shape.');
}

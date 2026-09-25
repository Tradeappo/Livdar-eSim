// Cohort QA. Everything that has to be true before 250 pages are published.
//
//   node scripts/atlas/cohort-qa.mjs
//   node scripts/atlas/cohort-qa.mjs --write
//   node scripts/atlas/cohort-qa.mjs --ci                exit 1 on any failure
//   node scripts/atlas/cohort-qa.mjs --cohort 002        a later cohort
//
// The checks run against the page models, not against a rendered site, which
// means they run before anything is deployed rather than after. A check that
// can only run against production is a check that finds problems for readers
// first.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { build, words, PACKS } from '../../lib/atlas/atlas-model.js';
import { wire } from '../../lib/atlas/atlas-links.js';
import { plain } from '../../lib/atlas/content/country-forms.js';
import { atlasSchema } from '../../lib/atlas/schema.js';
import { findNearDuplicates, NEAR_DUPLICATE_AT } from '../../lib/atlas/similarity-scale.js';
import { FAMILIES } from '../../lib/atlas/verticals.js';
import { wireCta } from '../../lib/atlas/atlas-cta.js';
import { segment } from '../../lib/i18n.js';
import { MANIFESTS } from '../../lib/atlas/serve-pages.js';
import { check as checkFreshness } from '../../lib/atlas/sources/freshness.js';

const ROOT = new URL('../../', import.meta.url);
const SITE = 'https://livdar.com';

// Built from code points so this file can name them without containing them.
const FORBIDDEN_DASHES = [0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2015, 0x2212, 0xfe58, 0xfe63, 0xff0d].map((c) => String.fromCodePoint(c));

// Title and description length, per script. The ceilings are where a search
// result starts truncating; the floors are where a title stops describing the
// page.
const LENGTH_BOUNDS = {
  default: { title: [25, 75], description: [70, 190] },
  ja: { title: [12, 42], description: [40, 110] },
};

const ISO = 'AL AT BA BE BG CA CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT JP LT LU LV MD ME MK MT NL NO PL PT RO RS SE SI SK TH TR UA US'.split(' ');
function reverseNames() {
  const rev = {};
  for (const l of Object.keys(PACKS)) {
    rev[l] = {};
    for (const i of ISO) { const n = plain(i, l); if (n) rev[l][n] = i; }
  }
  return rev;
}

// The word floor. Japanese is counted in characters, so it is compared
// against a floor in characters rather than being declared thin by a rule
// written for languages with spaces.
// The eSIM publication registry, which is the authority on which destination
// pages exist in which locale. A call to action into a locale that never
// published that destination is a link into a redirect.
let registryCache;
function esimRegistry() {
  if (registryCache !== undefined) return registryCache;
  try { registryCache = JSON.parse(readFileSync(new URL('data/publication-registry.json', ROOT), 'utf8')); }
  catch { registryCache = null; }
  return registryCache;
}

// The second path segment of every eSIM destination URL, in every locale the
// Atlas publishes in, so a call to action to one is recognised as leaving the
// Atlas rather than as a broken Atlas link.
const ESIM_SEGMENTS = new Set(['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt'].map((l) => segment('esim', l)));

// Every other cohort's published pages, as the little the call to action
// resolver needs from them. Read from the manifests they were written to, which
// is the same file the routes serve, so a path here is a path that answers.
function otherCohortPages(cohortFile) {
  const mine = String(cohortFile).match(/cohort-(\d+)/);
  const out = [];
  for (const m of MANIFESTS) {
    if (mine && m.includes('cohort-' + mine[1] + '-pages')) continue;
    try {
      const j = JSON.parse(readFileSync(new URL(m, ROOT), 'utf8'));
      for (const p of j.pages || []) out.push({ path: p.path, locale: p.locale, family: p.family, entity: p.entity, h1: p.h1, entityName: p.entityName, surface: p.surface, links: [] });
    } catch { /* a cohort with no manifest yet contributes nothing */ }
  }
  return out;
}

const floorFor = (page, model) => (model.locale === 'ja' ? 320 : FAMILIES[page.family].minWords || 260);

export function run({ cohortFile = 'data/atlas/cohorts/cohort-001.json', now = new Date() } = {}) {
  const cohort = JSON.parse(readFileSync(new URL(cohortFile, ROOT), 'utf8'));
  const failures = [];
  const fail = (check, detail) => failures.push({ check, ...detail });

  // ---- build -------------------------------------------------------------
  const models = [];
  // The cohort id comes from the manifest being read rather than from a field on
  // every row, and it goes onto the model, because every measurement of this
  // experiment is cut by cohort and a report that infers one from a filename will
  // infer it wrong once.
  const cohortId = cohort.cohort || (String(cohortFile).match(/cohort-(\d+)/) || [])[1] || null;
  for (const page of cohort.pages) {
    const m = build({ ...page, cohort: page.cohort || cohortId }, { now });
    if (m.refused) { fail('builds', { path: page.family + '/' + page.entity + '/' + page.language, why: m.refused }); continue; }
    m.page = page;
    models.push(m);
  }

  // ---- internal links ----------------------------------------------------
  const rev = reverseNames();
  const linkReport = wire(models, (n, l) => rev[l]?.[n] || null);

  // ---- calls to action ---------------------------------------------------
  // After the links, because the last resort in the chain is the page's own
  // first internal link, and that is what makes a broken call to action
  // impossible rather than merely unlikely: every target was resolved against
  // this same set of published models.
  const otherPages = otherCohortPages(cohortFile);
  const ctaReport = wireCta(models, { registry: esimRegistry(), alsoPublished: otherPages });
  for (const p of ctaReport.without) fail('cta present', { path: p, why: 'no call to action could be resolved for this page' });
  {
    // Every page the site publishes, not only this cohort's, because a call to
    // action deliberately crosses cohorts while an internal link deliberately
    // does not.
    const known = new Set([...models.map((m) => m.path), ...otherPages.map((m) => m.path)]);
    for (const m of models) {
      for (const c of [m.cta?.primary, m.cta?.secondary]) {
        if (!c) continue;
        if (c.href.startsWith('#')) continue;
        if (c.href.startsWith('/' + m.locale + '/') && !known.has(c.href) && !ESIM_SEGMENTS.has(c.href.split('/')[2])) {
          fail('cta resolves', { path: m.path, why: 'its call to action points at ' + c.href + ', which no cohort publishes' });
        }
        if (!c.href.startsWith('/' + m.locale + '/')) {
          fail('cta language', { path: m.path, why: 'its call to action leaves the language: ' + c.href });
        }
        if (!c.label || !c.label.trim()) fail('cta label', { path: m.path, why: 'the call to action has no label' });
      }
    }
  }
  for (const p of linkReport.orphans) fail('no orphans', { path: p, why: 'nothing in the cohort links to it' });
  for (const p of linkReport.noOutbound) fail('links out', { path: p, why: 'the page links nowhere' });
  const known = new Set(models.map((m) => m.path));
  for (const m of models) {
    for (const l of m.links) if (!known.has(l.href)) fail('links resolve', { path: m.path, why: 'links to ' + l.href + ', which is not in the cohort' });
  }

  // ---- uniqueness --------------------------------------------------------
  // Paths are unique across the whole cohort. Titles, descriptions and
  // headings are unique within a language, which is the scope that matters:
  // two pages in the same language with the same title compete with each
  // other, and two pages in different languages with the same title are a
  // pair of alternates doing exactly what hreflang says they do. Spanish and
  // Portuguese produce the same words often enough that a global check here
  // would report translations as duplicates.
  {
    const seen = new Map();
    for (const m of models) {
      if (seen.has(m.path)) fail('unique path', { path: m.path, why: 'shares its path with ' + seen.get(m.path) });
      else seen.set(m.path, m.path);
    }
  }
  for (const field of ['title', 'description', 'h1']) {
    const seen = new Map();
    for (const m of models) {
      const v = m.locale + '|' + m[field];
      if (seen.has(v)) fail('unique ' + field, { path: m.path, why: 'shares its ' + field + ' with ' + seen.get(v) + ' in the same language' });
      else seen.set(v, m.path);
    }
  }

  // ---- per page ----------------------------------------------------------
  for (const m of models) {
    const w = words(m);
    const floor = floorFor(m.page, m);
    if (w.count < floor) fail('word floor', { path: m.path, why: w.count + ' ' + w.unit + ' against a floor of ' + floor });

    if (m.canonical !== SITE + m.path) fail('canonical', { path: m.path, why: 'canonical is ' + m.canonical });
    // Length bounds are per script, for the same reason the word floor is.
    // Japanese carries far more meaning per character, so a fifteen character
    // Japanese title is a full title and a fifteen character English one is a
    // fragment. One rule applied to both would reject the good page.
    const bounds = LENGTH_BOUNDS[m.locale] || LENGTH_BOUNDS.default;
    if (!m.title || m.title.length < bounds.title[0]) fail('title length', { path: m.path, why: 'title is ' + (m.title || '').length + ' characters, floor ' + bounds.title[0] });
    if (m.title && m.title.length > bounds.title[1]) fail('title length', { path: m.path, why: 'title is ' + m.title.length + ' characters, ceiling ' + bounds.title[1] });
    if (!m.description || m.description.length < bounds.description[0]) fail('description length', { path: m.path, why: 'description is ' + (m.description || '').length + ' characters, floor ' + bounds.description[0] });
    if (m.description && m.description.length > bounds.description[1]) fail('description length', { path: m.path, why: 'description is ' + m.description.length + ' characters, ceiling ' + bounds.description[1] });
    if (!m.h1) fail('h1 present', { path: m.path, why: 'no h1' });

    // Provenance. A page that shows a number and cannot say where it came
    // from is the one thing this whole programme exists not to publish.
    if (!m.sources?.length) fail('provenance', { path: m.path, why: 'no sources' });
    for (const s of m.sources || []) {
      if (!s.source || !s.licence) fail('provenance', { path: m.path, why: 'a source row is missing its name or its licence' });
    }

    // Dashes, in everything a reader sees and in the path.
    const text = [m.title, m.description, m.h1, m.path, ...m.paragraphs, ...(m.faq || []).flatMap((q) => [q.q, q.a]), ...(m.links || []).map((l) => l.text)].join(' ');
    for (const d of FORBIDDEN_DASHES) {
      if (text.includes(d)) fail('no long dashes', { path: m.path, why: 'contains U+' + d.codePointAt(0).toString(16).toUpperCase() });
    }

    // Schema. Generated here rather than asserted by eye, so a model change
    // that breaks the graph fails before it ships.
    const schema = atlasSchema({ ...m, facts: m.facts, sections: m.sections, faq: m.faq, links: m.links, sources: m.sources });
    const types = new Set(schema['@graph'].map((n) => n['@type']));
    if (!types.has('WebPage')) fail('schema', { path: m.path, why: 'no WebPage node' });
    if (!types.has('BreadcrumbList')) fail('schema', { path: m.path, why: 'no BreadcrumbList node' });
    if (m.faq?.length && !types.has('FAQPage')) fail('schema', { path: m.path, why: 'has questions and no FAQPage node' });

    // Freshness. A stale source that is still the newest published value is
    // fine and says its date; a stale source whose staleness makes it wrong
    // is not publishable at all.
    for (const s of m.sources || []) {
      if (!s.observedAt) continue;
      const cls = m.family === 'work.country-salaries' ? 'salary' : 'prices';
      const f = checkFreshness({ observedAt: s.observedAt, ingestedAt: s.ingestedAt }, cls, now);
      if (!f.publishable) fail('freshness', { path: m.path, why: 'the source is stale in a way that makes it wrong: ' + s.attribution });
    }
  }

  // ---- hreflang ----------------------------------------------------------
  const byCanonical = new Map(models.map((m) => [m.canonical, m]));
  for (const m of models) {
    const alts = (m.alternates || []).filter((a) => a.hreflang !== 'x-default');
    if (!alts.some((a) => a.href === m.canonical)) fail('hreflang self', { path: m.path, why: 'the page is not in its own alternate set' });
    for (const a of alts) {
      const target = byCanonical.get(a.href);
      if (!target) { fail('hreflang resolves', { path: m.path, why: a.href + ' is not in the cohort' }); continue; }
      const back = (target.alternates || []).some((b) => b.href === m.canonical);
      if (!back) fail('hreflang reciprocal', { path: m.path, why: target.path + ' does not link back' });
    }
    const xd = (m.alternates || []).find((a) => a.hreflang === 'x-default');
    const english = alts.find((a) => a.hreflang === 'en');
    if (english && !xd) fail('x-default', { path: m.path, why: 'the cluster has an English page and no x-default' });
    if (xd && xd.href !== english?.href) fail('x-default', { path: m.path, why: 'x-default does not point at the English page' });
  }

  // ---- near duplicates ---------------------------------------------------
  const docs = {};
  for (const m of models) docs[m.path] = [m.h1, ...m.paragraphs, ...(m.faq || []).flatMap((q) => [q.q, q.a])].join(' ');
  const dupes = findNearDuplicates(docs);
  for (const d of dupes.duplicates) fail('near duplicate', { path: d.a, why: 'is ' + Math.round(d.similarity * 100) + ' percent similar to ' + d.b });

  const byCheck = {};
  for (const f of failures) byCheck[f.check] = (byCheck[f.check] || 0) + 1;

  return {
    generatedAt: now.toISOString(),
    cohort: cohortFile,
    pages: models.length,
    expected: cohort.pages.length,
    checks: [
      'builds', 'unique path', 'unique title', 'unique description', 'unique h1', 'word floor',
      'canonical', 'title length', 'description length', 'h1 present', 'provenance', 'no long dashes',
      'schema', 'freshness', 'hreflang self', 'hreflang resolves', 'hreflang reciprocal', 'x-default',
      'no orphans', 'links out', 'links resolve', 'near duplicate',
    ],
    nearDuplicateThreshold: NEAR_DUPLICATE_AT,
    cta: { withPrimary: ctaReport.withPrimary, withSecondary: ctaReport.withSecondary, byKind: ctaReport.byKind, byType: ctaReport.byType, without: ctaReport.without.length },
    similarity: { comparisonsMade: dupes.comparisonsMade, pairsOverThreshold: dupes.duplicates.length, maxSimilarity: dupes.duplicates.length ? Math.max(...dupes.duplicates.map((d) => d.similarity)) : null },
    pass: failures.length === 0,
    failures: failures.slice(0, 200),
    failureCount: failures.length,
    byCheck,
    links: {
      orphans: linkReport.orphans.length,
      minInbound: Math.min(...Object.values(linkReport.inbound)),
      medianInbound: Object.values(linkReport.inbound).sort((a, b) => a - b)[Math.floor(models.length / 2)],
    },
    models,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const i = process.argv.indexOf('--cohort');
  const cohort = i >= 0 ? process.argv[i + 1] : '001';
  const r = run({ cohortFile: 'data/atlas/cohorts/cohort-' + cohort + '.json' });
  if (process.argv.includes('--write')) {
    mkdirSync(new URL('reports/atlas/', ROOT), { recursive: true });
    const { models, ...rest } = r;
    writeFileSync(new URL('reports/atlas/cohort-' + cohort + '-qa.json', ROOT), JSON.stringify(rest, null, 1) + '\n');
    mkdirSync(new URL('data/atlas/cohorts/', ROOT), { recursive: true });
    writeFileSync(new URL('data/atlas/cohorts/cohort-' + cohort + '-pages.json', ROOT), JSON.stringify({
      generatedAt: r.generatedAt,
      meaning: 'Every page of cohort ' + cohort + ' as a model: metadata, content, provenance, internal links and alternates. This is what a publication run reads and what QA checked.',
      pages: models.map(({ page, ...m }) => m),
    }, null, 1) + '\n');
  }
  const { models, failures, ...rest } = r;
  console.log(JSON.stringify({ ...rest, failures: failures.slice(0, 15) }, null, 1));
  if (process.argv.includes('--ci') && !r.pass) process.exit(1);
}

// Internal links for the Atlas cohort.
//
// Two rules, and the first one is the reason this module exists at all: a
// link is only ever emitted to a page that is in the set being published. A
// programmatic site that links to what it intends to build produces a
// thousand soft 404s on the day it launches, and nothing about the crawl
// after that is measurable.
//
// The second rule is that the anchor is the target page's own heading. That
// makes the anchor correct in the reader's language without a single string
// of link copy being written, and it makes the anchor describe the page it
// points at rather than the page it sits on.
//
// Links stay inside one language. A reader on the Polish page is not served
// by a link to an English one, hreflang already says the alternates exist,
// and cross language internal links dilute the signal that each language is
// its own site section.

const MAX_LINKS = 8;

// What each family links to, and how many of each. The quota is the part that
// matters. A plain priority order fills the whole block from the first kind
// that has enough pages, which is how a hundred country pages ended up with
// links out and none coming back: every one of them spent its eight slots on
// the same three rankings and five tools.
const WANTS = {
  'cost-of-living.country': [['same-entity-other-family', 1], ['sibling-entities', 4], ['rankings', 2], ['tools', 2]],
  'work.country-salaries': [['same-entity-other-family', 1], ['sibling-entities', 4], ['tools', 2], ['rankings', 1]],
  'rankings.index': [['ranked-entities', 5], ['other-rankings', 2], ['tools', 2]],
  'tools.calculator': [['tools', 3], ['rankings', 2], ['sibling-entities', 3]],
  'tools.cost-calculator': [['tools', 3], ['rankings', 2], ['sibling-entities', 3]],
  'tools.cost-comparison': [['tools', 3], ['rankings', 2], ['sibling-entities', 3]],
  'tools.matcher': [['tools', 3], ['rankings', 2], ['sibling-entities', 3]],
};

// Build an index the resolvers can ask questions of, once per cohort rather
// than once per page.
export function index(models) {
  const byLanguage = new Map();
  for (const m of models) {
    if (!byLanguage.has(m.locale)) byLanguage.set(m.locale, { all: [], byFamily: new Map(), byEntity: new Map() });
    const b = byLanguage.get(m.locale);
    b.all.push(m);
    if (!b.byFamily.has(m.family)) b.byFamily.set(m.family, []);
    b.byFamily.get(m.family).push(m);
    if (!b.byEntity.has(m.entity)) b.byEntity.set(m.entity, []);
    b.byEntity.get(m.entity).push(m);
  }
  return byLanguage;
}

// Sort a candidate list and start it just after the page doing the linking,
// wrapping at the end. Every page then sees a different slice of the same
// order, which is what spreads inbound links evenly instead of piling them
// all onto whichever page happens to sort first.
function ring(list, model) {
  const sorted = list.slice().sort((a, b) => a.path.localeCompare(b.path));
  const i = sorted.findIndex((m) => m.path.localeCompare(model.path) > 0);
  const at = i < 0 ? 0 : i;
  return sorted.slice(at).concat(sorted.slice(0, at)).filter((m) => m.path !== model.path);
}

function resolve(kind, model, bucket, rankedEntities) {
  const notSelf = (m) => m.path !== model.path;
  switch (kind) {
    case 'same-entity-other-family':
      return (bucket.byEntity.get(model.entity) || []).filter(notSelf);
    case 'rankings':
    case 'other-rankings':
      return ring(bucket.byFamily.get('rankings.index') || [], model);
    case 'tools':
      return ring(bucket.all.filter((m) => m.family.startsWith('tools.')), model);
    case 'sibling-entities':
      // Each page links to the siblings that follow it, so every page in a
      // family receives as many sibling links as it gives. That is what makes
      // a family provably free of orphans rather than orphan-free by luck.
      return ring(bucket.byFamily.get(model.family) || [], model);
    case 'ranked-entities': {
      // The countries the ranking actually names, in the order it names them,
      // so the link block reads as the top of the list rather than a random
      // handful of pages that happen to exist.
      const wanted = rankedEntities.get(model.path) || [];
      const out = [];
      for (const iso2 of wanted) {
        for (const m of bucket.byEntity.get(iso2) || []) if (notSelf(m)) out.push(m);
      }
      return out;
    }
    default:
      return [];
  }
}

// Which countries each ranking page names, taken from the rendered table so
// that the links and the list cannot disagree.
export function rankedEntitiesOf(models, isoOf) {
  const map = new Map();
  for (const m of models) {
    if (m.family !== 'rankings.index' || !m.table) continue;
    map.set(m.path, m.table.rows.slice(0, 10).map((r) => isoOf(r.cells[1], m.locale)).filter(Boolean));
  }
  return map;
}

export function linksFor(model, byLanguage, rankedEntities) {
  const bucket = byLanguage.get(model.locale);
  if (!bucket) return [];
  const seen = new Set([model.path]);
  const out = [];
  for (const [kind, quota] of WANTS[model.family] || []) {
    let taken = 0;
    for (const target of resolve(kind, model, bucket, rankedEntities)) {
      if (taken >= quota || out.length >= MAX_LINKS) break;
      if (seen.has(target.path)) continue;
      seen.add(target.path);
      out.push({ href: target.path, text: target.h1, family: target.family, reason: kind });
      taken++;
    }
  }
  // Any slots a kind could not fill go to whatever else exists in the
  // language, so a thin family does not produce a page with two links.
  if (out.length < MAX_LINKS) {
    for (const target of bucket.all) {
      if (out.length >= MAX_LINKS) break;
      if (seen.has(target.path)) continue;
      seen.add(target.path);
      out.push({ href: target.path, text: target.h1, family: target.family, reason: 'fill' });
    }
  }
  return out;
}

// Attach links to every model in one pass, and report the pages that ended up
// with none. An orphan is a real finding rather than a cosmetic one: a page
// nothing links to is a page a crawler reaches only from the sitemap.
export function wire(models, isoOf) {
  const byLanguage = index(models);
  const ranked = rankedEntitiesOf(models, isoOf);
  for (const m of models) m.links = linksFor(m, byLanguage, ranked);
  const inbound = new Map(models.map((m) => [m.path, 0]));
  for (const m of models) for (const l of m.links) inbound.set(l.href, (inbound.get(l.href) || 0) + 1);
  return {
    orphans: [...inbound].filter(([, n]) => n === 0).map(([p]) => p),
    noOutbound: models.filter((m) => !m.links.length).map((m) => m.path),
    inbound: Object.fromEntries(inbound),
  };
}

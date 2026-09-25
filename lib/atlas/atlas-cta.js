// Where a page sends the reader next.
//
// Five hundred pages answer a question and then stop. They are useful and they
// are dead ends, and a dead end is the one thing a page like this must not be:
// the experiment is not whether a data page can rank, it is whether a data page
// can move somebody one step further into the product.
//
// Three rules shape everything here.
//
// The first is that a call to action is derived rather than written. It is a
// function of the surface, the family, the entity and the language, so no two
// pages carry the same one unless they ask the same question of the same place.
// There is no "Get started" in this codebase and there is nowhere to put one.
//
// The second is that it can only point at something that exists. Every target
// is resolved against the same index of published models that the internal links
// use, so a broken call to action is not a thing this can produce: if nothing
// resolves, the chain falls through to the page's own first internal link, which
// was itself resolved the same way. The eSIM pages are the one destination
// outside the Atlas, and they are checked against the publication registry for
// that exact locale, because the eSIM site publishes three markets of seventeen
// and the Atlas publishes nine languages.
//
// The third is that it cannot promise something Livdar does not do. There is no
// `book`, because there is no inventory; no `apply`, because there are no
// vacancies; no `buy`, because activation is not available yet. The eSIM call to
// action says `check`, which is what the page it leads to actually does.

import { CTA_COPY, ctaCopy } from './content/cta-copy.js';
import { subject } from './content/country-forms.js';
import { toolUi } from './content/terms.js';
import { DESTINATIONS } from '../destinations.js';
import { routes } from '../routes.js';

// The copy key for a target, from the family it belongs to. A target in the
// page's own family is a sibling whatever its family says, because the sentence
// the reader needs is `the same question somewhere else`.
const KIND_BY_FAMILY = {
  'cost-of-living.country': 'cost',
  'work.country-salaries': 'salary',
  'weather.country-best-time': 'season',
  'neighbourhoods.city-where-to-stay': 'areas',
  'events.country-holidays': 'holidays',
  'events.subdivision-holidays': 'region',
  'rents.country-inflation': 'rent',
  'sport.city-season': 'sport',
  'rankings.index': 'ranking',
};


export function kindFor(target, model) {
  if (target.external === 'esim') return 'esim';
  if (target.family && target.family.startsWith('tools.')) return 'tool';
  if (target.family === model.family) return 'sibling';
  return KIND_BY_FAMILY[target.family] || 'deeper';
}

// The chains, primary first. Each entry is a resolver, tried in order, and the
// first one that finds a published page wins. A family with no entry falls to
// the default chain, which is the page's own internal links, so a new family
// gets a working call to action before anyone writes a rule for it.
// The chains, primary first. Each entry is a resolver, tried in order, and the
// first one that finds a published page wins. A family with no entry falls to
// the default chain, which is the page's own internal links, so a new family
// gets a working call to action before anyone writes a rule for it.
//
// The order encodes one decision worth stating. The first version put the
// relevant calculator first everywhere, which is the obvious product answer and
// produced one hundred and fifty eight identical calls to action: every English
// cost of living page, whatever country it was about, offered the same button to
// the same tool. The rule the brief asks for is that no two of five hundred
// pages carry the same call to action unless they ask the same question of the
// same place, so the first step is now the one that is different on every page -
// the same country, a different question - and the tool is the second. It also
// reads better: more about this place, then work out your own numbers.
//
// `sibling` sits at the end of most primary chains for the same reason, and it
// earns the place: it always resolves, because a family has more than one page
// by definition; it is different on every page, because the ring rotates; and
// `the same question for Thailand` is a real next step rather than a filler. The
// alternative was `anyTool`, and in Japanese, where four tool pages serve forty
// data pages, that put the same button on twenty six of them.
export const CHAINS = {
  'cost-of-living.country': {
    primary: ['family:work.country-salaries', 'family:weather.country-best-time', 'family:events.country-holidays', 'family:rents.country-inflation', 'esim', 'sibling', 'anyTool'],
    secondary: ['tool:cost-of-living-calculator', 'tool:cost-of-living-comparison', 'ranking', 'anyTool'],
  },
  'work.country-salaries': {
    primary: ['family:cost-of-living.country', 'family:rents.country-inflation', 'esim', 'sibling', 'anyTool'],
    secondary: ['tool:salary-calculator', 'ranking', 'anyTool'],
  },
  // A reader who now knows which months are good is deciding about a trip, so
  // the first step is the one that makes the trip work. In a language with no
  // eSIM market the chain simply skips it and the cost of the place comes first.
  'weather.country-best-time': {
    primary: ['esim', 'family:cost-of-living.country', 'family:events.country-holidays', 'sibling'],
    secondary: ['tool:travel-budget', 'anyTool', 'sibling'],
  },
  'events.country-holidays': {
    primary: ['family:weather.country-best-time', 'family:cost-of-living.country', 'esim', 'sibling'],
    secondary: ['anyTool', 'sibling'],
  },
  // The regions of one country. The country's own calendar explains what all of
  // them share, so it is the first step, and the sibling region is the second:
  // comparing two regions is the reason these pages are read at all.
  'events.subdivision-holidays': {
    primary: ['countryOfSubdivision', 'sibling'],
    secondary: ['sibling', 'anyTool'],
  },
  // Knowing which districts are where is one step from knowing which months
  // suit being outside in that city, and that page exists for fourteen of them.
  'neighbourhoods.city-where-to-stay': {
    primary: ['sportInCity', 'sibling', 'tool:where-should-i-stay', 'anyTool'],
    secondary: ['tool:where-should-i-stay', 'sibling', 'anyTool'],
  },
  'sport.city-season': {
    primary: ['areasOfCity', 'otherActivityInCity', 'sibling', 'anyTool'],
    secondary: ['otherActivityInCity', 'tool:destination-matcher', 'sibling'],
  },
  'rents.country-inflation': {
    primary: ['family:cost-of-living.country', 'family:work.country-salaries', 'sibling', 'anyTool'],
    secondary: ['tool:rent-affordability', 'anyTool', 'sibling'],
  },
  // A ranking's first step is the place at the top of it, which is a different
  // page for every ranking and is the one the reader came for.
  'rankings.index': {
    primary: ['topRanked', 'sibling', 'anyTool'],
    secondary: ['tool:cost-of-living-calculator', 'anyTool', 'sibling'],
  },
  // A tool page's first step is the tool, which is on the page itself, so it is
  // resolved separately and not from the index. The second is the data behind
  // it, because a calculator with no country page to read is a dead end too.
  'tools.calculator': { primary: ['selfTool', 'ranking', 'anyTool'], secondary: ['anyTool', 'ranking'] },
  'tools.cost-calculator': { primary: ['selfTool', 'ranking', 'anyTool'], secondary: ['anyTool', 'ranking'] },
  'tools.cost-comparison': { primary: ['selfTool', 'ranking', 'anyTool'], secondary: ['anyTool', 'ranking'] },
  'tools.matcher': { primary: ['selfTool', 'ranking', 'anyTool'], secondary: ['anyTool', 'ranking'] },
};

const DEFAULT_CHAIN = { primary: ['anyTool', 'ranking', 'sibling'], secondary: ['sibling'] };

// The eSIM destination pages that exist in a given locale. The registry is the
// authority rather than the destination table: 126 destinations are described
// and 19 are published in English, 16 in German and none in the other seven
// Atlas languages, so an eSIM call to action on an Italian page would be a link
// into a redirect.
export function esimIndex(registry, destinations = DESTINATIONS) {
  const byIso = new Map();
  for (const d of destinations) if (d.iso2) byIso.set(d.iso2, d);
  const out = new Map();
  for (const [key, entry] of Object.entries(registry?.entries || {})) {
    const [locale, type, id] = key.split(':');
    if (type !== 'destination' || entry.state !== 'published') continue;
    const d = destinations.find((x) => x.id === id);
    if (!d || !d.iso2) continue;
    out.set(locale + '|' + d.iso2, d);
  }
  return { byIso, published: out };
}

function esimFor(model, esim) {
  if (!esim) return null;
  const d = esim.published.get(model.locale + '|' + model.entity);
  if (!d) return null;
  return {
    href: routes.destination(model.locale, d),
    external: 'esim',
    entityName: (d.names && d.names[model.locale]) || d.name || model.entityName,
    h1: (d.names && d.names[model.locale]) || d.name || model.entityName,
    family: 'esim.destination',
    entity: model.entity,
    surface: 'esim',
  };
}

// The city id out of a sport entity, which is `<geonames id>:<activity>`.
const cityOf = (entity) => String(entity).split(':')[0];

function resolveOne(name, model, bucket, { esim, ranked } = {}) {
  const notSelf = (m) => m.path !== model.path;
  const all = bucket ? bucket.all : [];
  if (name.startsWith('tool:')) {
    const id = name.slice(5);
    return all.find((m) => m.family.startsWith('tools.') && m.entity === id && notSelf(m)) || null;
  }
  if (name.startsWith('family:')) {
    const family = name.slice(7);
    return all.find((m) => m.family === family && m.entity === model.entity && notSelf(m)) || null;
  }
  switch (name) {
    case 'anyTool': {
      // Walk from the page's own path so that five hundred pages do not all
      // point at whichever tool sorts first.
      const tools = all.filter((m) => m.family.startsWith('tools.') && notSelf(m)).sort((a, b) => a.path.localeCompare(b.path));
      if (!tools.length) return null;
      const i = tools.findIndex((m) => m.path.localeCompare(model.path) > 0);
      return tools[i < 0 ? 0 : i];
    }
    case 'ranking': {
      const rankings = all.filter((m) => m.family === 'rankings.index' && notSelf(m)).sort((a, b) => a.path.localeCompare(b.path));
      if (!rankings.length) return null;
      const i = rankings.findIndex((m) => m.path.localeCompare(model.path) > 0);
      return rankings[i < 0 ? 0 : i];
    }
    case 'sibling': {
      const family = all.filter((m) => m.family === model.family && notSelf(m)).sort((a, b) => a.path.localeCompare(b.path));
      if (!family.length) return null;
      const i = family.findIndex((m) => m.path.localeCompare(model.path) > 0);
      return family[i < 0 ? 0 : i];
    }
    case 'esim':
      return esimFor(model, esim);
    case 'countryOfSubdivision': {
      const iso2 = String(model.entity).split('-')[0];
      return all.find((m) => m.family === 'events.country-holidays' && m.entity === iso2) || null;
    }
    case 'areasOfCity': {
      const city = cityOf(model.entity);
      return all.find((m) => m.family === 'neighbourhoods.city-where-to-stay' && m.entity === city) || null;
    }
    case 'sportInCity':
      return all.find((m) => m.family === 'sport.city-season' && cityOf(m.entity) === String(model.entity)) || null;
    case 'otherActivityInCity': {
      const city = cityOf(model.entity);
      return all.find((m) => m.family === 'sport.city-season' && cityOf(m.entity) === city && m.path !== model.path) || null;
    }
    case 'topRanked': {
      for (const iso2 of (ranked && ranked.get(model.path)) || []) {
        const hit = all.find((m) => m.entity === iso2 && notSelf(m));
        if (hit) return hit;
      }
      return null;
    }
    case 'selfTool':
      // The tool lives on this page, so the call to action is an anchor to it
      // rather than a navigation. It is only offered when the page really
      // carries an interactive tool; a page that only describes one falls
      // through to the next resolver, because a button that scrolls to a
      // paragraph is a lie with a nice shadow on it.
      return model.tool && model.tool.interactive
        ? { href: '#' + model.tool.id, external: null, entityName: model.entityName, h1: model.h1, family: model.family, entity: model.entity, surface: model.surface, anchor: true }
        : null;
    default:
      return null;
  }
}

function ctaFrom(target, model, position) {
  const kind = kindFor(target, model);
  const copy = ctaCopy(kind, model.locale);
  // The label is the target page's own heading, which is already in the reader's
  // language and already in the case that language needs. The one exception is
  // the eSIM destination page, whose heading is not an Atlas page model, so its
  // label is built from the country's subject form.
  // The anchor to the tool on this very page is the one call to action whose
  // label cannot be a heading: the heading is this page's own, and a button
  // repeating the title the reader just read says nothing. It takes the verb,
  // which the tool vocabulary already carries in nine languages.
  const label = target.anchor
    ? toolUi('calculate', model.locale)
    : (kind === 'esim'
      ? copy.label({ subject: subject(target.entity, model.locale) || target.entityName || target.h1 })
      : (target.h1 || target.entityName));
  return {
    kind,
    label,
    note: copy.note(),
    href: target.href || target.path,
    position,
    // What the click means, for the report rather than for the reader. The
    // destination entity travels with it so a funnel can be cut by where the
    // reader went as well as by where they were.
    ctaType: target.anchor ? 'tool' : (target.external || (target.family || '').split('.')[0] || 'atlas'),
    destination: target.entity ?? null,
    destinationFamily: target.family || null,
    destinationSurface: target.surface || null,
    anchor: !!target.anchor,
  };
}

// The two calls to action for one page. `bucket` is the per language index the
// links already build, so this costs one pass over a list that is already in
// memory.
export function ctaFor(model, bucket, { esim = null, ranked = null } = {}) {
  const chain = CHAINS[model.family] || DEFAULT_CHAIN;
  const used = new Set([model.path]);
  const pick = (names, position) => {
    for (const n of names) {
      const t = resolveOne(n, model, bucket, { esim, ranked });
      if (!t) continue;
      const href = t.href || t.path;
      if (used.has(href)) continue;
      used.add(href);
      return ctaFrom(t, model, position);
    }
    return null;
  };

  let primary = pick(chain.primary, 'mid');
  // The last resort, and it cannot fail: the page's own first internal link was
  // resolved against the same published set, so it exists by construction.
  if (!primary && model.links && model.links.length) {
    const l = model.links[0];
    primary = ctaFrom({ href: l.href, h1: l.text, entityName: l.text, family: l.family }, model, 'mid');
    used.add(l.href);
  }
  let secondary = pick(chain.secondary, 'mid');
  if (!secondary && model.links) {
    const l = model.links.find((x) => !used.has(x.href));
    if (l) secondary = ctaFrom({ href: l.href, h1: l.text, entityName: l.text, family: l.family }, model, 'mid');
  }
  return { primary, secondary };
}

// Attach to every model in one pass, and report what could not be resolved. A
// page with no primary call to action is a finding, not a cosmetic gap.
//
// `alsoPublished` is the rest of the live site: the pages of every other cohort,
// read from their manifests. Internal links are deliberately kept inside one
// cohort, because a cohort is the unit the experiment compares and a link graph
// that crosses them would blur it. A call to action is the opposite case. The
// reader does not know what a cohort is, and the page that best answers `what do
// people earn in Japan` is the Japanese salary page whichever lot it was
// published in. Without this, a cohort 002 cost page could not reach the cohort
// 001 salary page for the same country and fell back to a calculator, which is
// how a hundred and twenty two pages ended up offering the same tool.
export function wireCta(models, { registry = null, ranked = null, alsoPublished = [] } = {}) {
  const esim = registry ? esimIndex(registry) : null;
  const byLanguage = new Map();
  const add = (m) => {
    if (!byLanguage.has(m.locale)) byLanguage.set(m.locale, { all: [] });
    byLanguage.get(m.locale).all.push(m);
  };
  const own = new Set(models.map((m) => m.path));
  for (const m of models) add(m);
  for (const m of alsoPublished) if (!own.has(m.path)) add(m);
  const without = [];
  const byKind = {};
  const byType = {};
  for (const m of models) {
    const cta = ctaFor(m, byLanguage.get(m.locale), { esim, ranked });
    m.cta = cta;
    if (!cta.primary) without.push(m.path);
    else {
      byKind[cta.primary.kind] = (byKind[cta.primary.kind] || 0) + 1;
      byType[cta.primary.ctaType] = (byType[cta.primary.ctaType] || 0) + 1;
    }
  }
  return {
    pages: models.length,
    withPrimary: models.length - without.length,
    withSecondary: models.filter((m) => m.cta && m.cta.secondary).length,
    without,
    byKind,
    byType,
    languages: [...byLanguage.keys()].sort(),
    copyLanguages: Object.keys(CTA_COPY),
    pool: [...byLanguage.values()].reduce((t, b) => t + b.all.length, 0),
  };
}

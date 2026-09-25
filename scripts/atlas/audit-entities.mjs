// Does the page talk about the entity it says it is about?
//
//   node scripts/atlas/audit-entities.mjs
//   node scripts/atlas/audit-entities.mjs --json reports/atlas/entity-audit.json
//
// Every published page carries a keyword, an entity, a slug, a title and an H1,
// and four of those five are derived from the entity while one of them is not.
// The keyword came from a provider, and the entity came from resolving that
// keyword. When the resolution is wrong the page is perfectly consistent with
// itself and about the wrong place: /en/cost-of-living/colombia/ was built for
// `cost of living in colorado`, because the stem rule that exists to forgive an
// inflection also forgives four shared letters between a US state and a South
// American country.
//
// So this reads the direction the other four cannot check. It takes the entity
// the page claims, collects every form a market could write that entity as, and
// asks whether the keyword contains one of them. A form is accepted when it is
// present outright, when each of its words is present in a close inflection, or
// when the market has a measured alias for it. Anything else is reported, with
// the remainder of the keyword after the head term, so the reader can see what
// the page is really about.
//
// What it deliberately does not do is guess a fix. A mismatch is a measurement
// error and the repair belongs in the family that measured it.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MANIFESTS } from '../../lib/atlas/serve-pages.js';
import { fold, ALIASES, MARKET_LANG, MARKET_COUNTRY, phraseNames, universe } from '../../lib/atlas/keyword-country.js';
import { plain, subject, keywordAliases } from '../../lib/atlas/content/country-forms.js';
import { cityById, cityName } from '../../lib/atlas/cities.js';
import { subdivisions } from '../../lib/atlas/holidays.js';
import { splitEntity as splitSport, ACTIVITIES } from '../../lib/atlas/sport.js';
import { FAMILIES, SCOPES } from '../../lib/atlas/verticals.js';

const ROOT = new URL('../../', import.meta.url);
const ATLAS_LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt', 'zh-Hant'];

// Words that say what kind of thing an administrative region is rather than
// which one it is. A market writing `festivos madrid 2026` has named Comunidad
// de Madrid; a rule that demands every word of the official name would call
// that a mismatch, and the only mismatch would be the rule.
const ADMINISTRATIVE = new Set([
  'comunidad', 'comunitat', 'comunidade', 'autonoma', 'valenciana', 'foral',
  'region', 'regione', 'regiao', 'principado', 'ciudad', 'illes', 'islas',
  'ilhas', 'pais', 'provincia', 'provincie', 'wojewodztwo', 'land', 'freistaat',
  'canton', 'kanton', 'prefecture', 'state', 'de', 'del', 'la', 'las', 'los',
  'el', 'di', 'da', 'do', 'y', 'e', 'and',
]);

// What a market writes instead of the official name. Every entry here was read
// off a measured keyword in that market: the German market searches nrw, bw and
// rlp far more than it searches the names those stand for, and the keyword is
// the evidence for the form.
const MARKET_SHORT = {
  'DE-NW': ['nrw', 'nordrhein westfalen'],
  'DE-BW': ['bw', 'baden wuerttemberg', 'baden wurttemberg'],
  'DE-RP': ['rlp'],
  'DE-NI': ['niedersachsen'],
  'DE-ST': ['sachsen anhalt'],
  'DE-MV': ['mv', 'meck pomm'],
  'DE-SH': ['sh'],
  'ES-CM': ['castilla la mancha'],
  'ES-CL': ['castilla y leon'],
  'ES-PV': ['euskadi', 'pais vasco'],
};

// The name without the words that only say what kind of region it is.
export function distinctive(name) {
  const words = fold(name).split(/[\s-]+/).filter((w) => w && !ADMINISTRATIVE.has(w));
  return words.length ? words.join(' ') : fold(name);
}

// A phrase names a form. Hyphens are word boundaries here, because a market
// writes `baden wuerttemberg` for `Baden-Wuerttemberg` and neither spelling is
// wrong.
export function names(phrase, form) {
  const p = fold(phrase).replace(/-/g, ' ');
  return phraseNames(p, fold(form).replace(/-/g, ' '));
}

// Every form of an entity a market could write, for the kind of entity the
// family's scope declares. An empty list means this audit cannot check the
// family, which is reported rather than passed.
export function formsFor(entity, family, language) {
  const scope = SCOPES[(FAMILIES[family] || {}).scope] || {};
  const kind = scope.entity;
  const out = new Set();
  const add = (s) => { if (s) out.add(fold(s)); };

  if (kind === 'country') {
    add(plain(entity, language));
    add(subject(entity, language));
    for (const [alias, iso] of Object.entries(ALIASES[language] || {})) if (iso === entity) add(alias);
    for (const [alias, name] of keywordAliases(language)) if (fold(name) === fold(plain(entity, language) || '')) add(alias);
    return { kind, forms: [...out] };
  }
  if (kind === 'subdivision') {
    const row = subdivisions().find((s) => s.iso2 + '-' + s.shortName === entity || s.key === entity);
    if (row) {
      add(row.shortName);
      for (const n of Object.values(row.names || {})) { add(n); add(distinctive(n)); }
    }
    for (const short of MARKET_SHORT[entity] || []) add(short);
    return { kind, forms: [...out] };
  }
  if (kind === 'city') {
    for (const l of ATLAS_LANGS) add(cityName(entity, l));
    const c = cityById(entity);
    if (c) { add(c.name); for (const n of Object.values(c.names || {})) add(n); }
    return { kind, forms: [...out] };
  }
  if (kind === 'city-activity') {
    const { cityId } = splitSport(entity);
    for (const l of ATLAS_LANGS) add(cityName(cityId, l));
    const c = cityById(cityId);
    if (c) { add(c.name); for (const n of Object.values(c.names || {})) add(n); }
    return { kind, forms: [...out] };
  }
  // A calculator and a ranking have no destination entity, so there is nothing
  // for a keyword to agree or disagree with.
  return { kind: kind || 'none', forms: [] };
}

// Whether a keyword names some country other than this one, which is what
// decides whether a home market keyword with no destination is implied or
// simply wrong.
let worldForms = null;
export function otherCountryIn(keyword, language, entity) {
  worldForms ||= {};
  if (!worldForms[language]) {
    const rows = [];
    for (const iso of universe()) {
      const forms = [plain(iso, language), subject(iso, language)].filter(Boolean).map(fold);
      for (const [alias, a] of Object.entries(ALIASES[language] || {})) if (a === iso) forms.push(fold(alias));
      rows.push({ iso, forms });
    }
    worldForms[language] = rows;
  }
  for (const r of worldForms[language]) {
    if (r.iso === entity) continue;
    if (r.forms.some((f) => f.length > 3 && names(keyword, f))) return r.iso;
  }
  return null;
}

export function run({ manifests = MANIFESTS } = {}) {
  const pages = [];
  for (const m of manifests) {
    let j;
    try { j = JSON.parse(readFileSync(new URL(m, ROOT), 'utf8')); } catch { continue; }
    for (const p of j.pages || []) pages.push(p);
  }
  const rows = [];
  const byKind = {};
  for (const p of pages) {
    const language = p.locale || p.market && MARKET_LANG[p.market] || 'en';
    const { kind, forms } = formsFor(p.entity, p.family, language);
    byKind[kind] = (byKind[kind] || 0) + 1;
    // A calculator, a matcher and a ranking are about a question rather than a
    // place, so there is no destination entity for a keyword to agree with and
    // nothing here to check. Counted, not silently dropped.
    if (kind === 'none' || kind === 'tool' || kind === 'ranking') continue;
    const keyword = fold(p.keyword || '');
    const problems = [];
    let matched = forms.find((f) => names(keyword, f)) || null;
    // A market asking about its own country does not name it. `feiertage 2026`
    // in Germany, `festivos 2026` in Spain and `huurverhoging 2026` in the
    // Netherlands are each the largest keyword in that market for that family,
    // and each one means here. The resolvers already treat the market as the
    // implied destination; this asks the same question in the other direction,
    // and it only accepts when the keyword names no other country either.
    if (!matched && kind === 'country' && (MARKET_COUNTRY[p.market] || '').toUpperCase() === p.entity) {
      const other = otherCountryIn(keyword, language, p.entity);
      if (!other) matched = 'implied by the market';
      else problems.push('the keyword names ' + other + ' and the page is the market own country');
    }
    // The other four fields are derived from entityName, so they are checked
    // against it rather than against the keyword: a drift there is a template
    // bug and a different failure from a resolution error.
    const en = fold(p.entityName || '');
    const slug = (p.path || '').replace(/\/$/, '').split('/').pop();
    if (!matched) problems.push('keyword does not name the entity');
    if (en && !forms.includes(en) && !forms.some((f) => names(en, f))) problems.push('entityName is not a form of the entity');
    // The H1 carries whatever form the language needs, which in Polish is the
    // locative and in Portuguese takes the article, so this asks the same
    // inflection-tolerant question rather than for the nominative outright.
    const named = (text) => text && (names(fold(text), en) || forms.some((f) => names(fold(text), f)));
    if (en && !named(p.h1) && !named(p.title)) problems.push('neither H1 nor title names the entity');
    if (problems.length) {
      rows.push({
        path: p.path, family: p.family, surface: p.surface, entity: p.entity, kind,
        language, market: p.market, keyword: p.keyword, entityName: p.entityName, slug,
        h1: p.h1, problems, forms: forms.slice(0, 8),
      });
    }
  }
  const skipped = (byKind.none || 0) + (byKind.tool || 0) + (byKind.ranking || 0);
  return { audited: pages.length, checked: pages.length - skipped, byKind, mismatches: rows.length, rows };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const r = run();
  const i = process.argv.indexOf('--json');
  if (i >= 0) {
    const out = process.argv[i + 1] || 'reports/atlas/entity-audit.json';
    mkdirSync(new URL(out.split('/').slice(0, -1).join('/') + '/', ROOT), { recursive: true });
    writeFileSync(new URL(out, ROOT), JSON.stringify(r, null, 1) + '\n');
  }
  console.log('audited ' + r.audited + '  checkable ' + r.checked + '  by entity kind ' + JSON.stringify(r.byKind));
  console.log('reported ' + r.mismatches);
  for (const row of r.rows) {
    console.log([row.path, row.entity + ' (' + row.kind + ')', 'kw "' + row.keyword + '"', 'name "' + row.entityName + '"', row.problems.join('; ')].join(' | '));
  }
}

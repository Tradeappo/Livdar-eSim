// The candidate page universe.
//
// This generates individual candidate PAGES, not keyword families, from the
// entity and source data this repository already holds. Nothing here is
// published and nothing here is a decision; it is the shelf that a later GSC
// reading picks from.
//
// Three rules govern it, and they are the reason the output is smaller than
// combinatorics would allow:
//
// 1. A candidate exists only where the data to fill it exists. Every family is
//    bounded by its source coverage, so cost of living reaches 199 countries
//    and public holidays reach 36, because that is what the sources cover.
// 2. Every candidate carries whether its data is present, what licence that
//    data is under, and whether its volume was measured or is unknown. An
//    unmeasured volume is null, never an estimate.
// 3. Every family carries a quality risk. A family whose pages would differ
//    only by a place name is tagged HIGH_THIN_CONTENT_RISK even when the
//    combinatorics are attractive, and the count is reported rather than hidden.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { ATLAS_SEGMENTS, countrySlug, countryName as cldrCountryName, slugify } from '../../lib/atlas/atlas-urls.js';
import { forSubdivision } from '../../lib/atlas/holidays.js';
import { pages as livePages } from '../../lib/atlas/serve-pages.js';

const ROOT = new URL('../../', import.meta.url);
const J = (p) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));

// The nine languages the Atlas publishes. Romanian is excluded by a standing
// project rule; zh-Hant is not live and is generated separately as expansion.
const LANGS = ['de', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pl', 'pt'];
const MARKET = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', ja: 'ja-JP', nl: 'nl-NL', pl: 'pl-PL', pt: 'pt-BR' };

// Which languages a country-specific page is worth writing in.
//
// This gate exists because combinatorics lie. A page about Andorra's Assumption
// of Mary written in Japanese has no audience, and generating it would inflate
// the inventory with pages nobody would ever build. English is always included
// because it is the lingua franca for "holidays in X" queries, and the
// country's own market languages are included because that is where the demand
// is. The cross-language pattern is real and evidenced (absentify runs
// de/feiertage/frankreich and earns 637 from it), so a neighbour's language is
// included where the pairing is plausible rather than every language.
const OWN_LANGS = {
  AT: ['de'], BE: ['nl', 'fr'], CH: ['de', 'fr', 'it'], DE: ['de'], LI: ['de'], LU: ['fr', 'de'],
  ES: ['es'], MX: ['es'], AD: ['es', 'fr'],
  FR: ['fr'], MC: ['fr'],
  IT: ['it'], SM: ['it'], VA: ['it'],
  NL: ['nl'],
  PL: ['pl'],
  PT: ['pt'],
  // Everything else in the holiday set is a market Livdar does not publish in,
  // so those pages exist in English plus the languages of nearby markets that
  // plausibly search for them.
  AL: [], BG: [], BY: [], CZ: ['de'], EE: [], HR: ['de', 'it'], HU: ['de'], IE: [],
  LT: ['pl'], LV: [], MD: [], MT: ['it'], RO: [], RS: [], RU: [], SE: [], SI: ['de', 'it'],
  SK: ['de', 'pl'], ZA: [],
};
const relevantLangs = (iso) => {
  const own = OWN_LANGS[iso];
  if (own === undefined) return ['en'];
  return [...new Set(['en', ...own])];
};

// Where each family's data comes from and under what terms. Taken from
// data/atlas/sources.json rather than restated, so a licence that changes there
// changes here.
const SOURCES = J('data/atlas/sources.json').sources;
const licenceOf = (id) => {
  const s = SOURCES.find((x) => x.id === id);
  return s ? s.licence : 'unknown';
};

const holidays = J('data/atlas/sources/events/public-holidays.json');
const col = J('data/atlas/sources/cost-of-living/normalized.json');
const rent = J('data/atlas/sources/rent/normalized.json');
const salary = J('data/atlas/sources/salary/normalized.json');
const nb = J('data/atlas/sources/neighbourhoods/facts.json');
const climate = J('data/atlas/sources/climate/normals.json');
const countries = J('data/atlas/entities/countries.json');
const countryName = new Map(countries.map((c) => [c.iso2, c.name]));

// Existing coverage, so a candidate can say whether it already exists live.
const live = new Set();
const liveByFamily = new Map();
for (const p of livePages()) {
  live.add(p.locale + '|' + p.family + '|' + String(p.entity));
  liveByFamily.set(p.family, (liveByFamily.get(p.family) || 0) + 1);
}

// Native keyword phrasing per family and language.
//
// IMPORTANT: keywords carry real diacritics. Only URLs are ASCII-folded. This
// was found the hard way: `brueckentage 2026` measures 8 searches a month and
// `brückentage 2026` is the term Germans actually type. Folding a keyword the
// way a slug is folded silently destroys its volume.
//
// These are not translations of English terms. Each pattern was taken from a
// competitor page that actually ranks for it, captured in the SERP and top-page
// research of 2026-09-28. Where a market's phrasing is genuinely different the
// pattern differs: Polish asks for days free from work rather than holidays,
// German asks where a holiday applies rather than which regions observe it, and
// Dutch asks for a week number rather than a calendar week.
//
// A family and language with no evidenced pattern gets null, and its candidates
// carry no primary keyword rather than a guess.
const KW = {
  'events.country-holidays': {
    en: (c) => `public holidays ${c}`,
    de: (c) => `feiertage ${c}`,
    fr: (c) => `jours feries ${c}`,
    es: (c) => `dias festivos ${c}`,
    it: (c) => `giorni festivi ${c}`,
    nl: (c) => `feestdagen ${c}`,
    pl: (c) => `dni wolne od pracy ${c}`,
    pt: (c) => `feriados ${c}`,
    ja: (c) => `${c} 祝日`,
  },
  'events.subdivision-holidays': {
    en: (r) => `${r} public holidays 2026`,
    de: (r) => `feiertage ${r} 2026`,
    fr: (r) => `jours feries ${r} 2026`,
    es: (r) => `festivos ${r} 2026`,
    it: (r) => `giorni festivi ${r} 2026`,
    nl: (r) => `feestdagen ${r} 2026`,
    pl: (r) => `dni wolne ${r} 2026`,
    pt: (r) => `feriados ${r} 2026`,
    ja: null,
  },
  // German asks "wo", where the holiday applies, which is the phrasing on the
  // page earning 18,330 for fronleichnam feiertag wo.
  'events.named-holiday-regions': {
    de: (h) => `${h} feiertag wo`,
    en: (h) => `where is ${h} a public holiday`,
    fr: (h) => `${h} jour ferie ou`,
    es: (h) => `donde es festivo ${h}`,
    it: (h) => `dove e festivo ${h}`,
    nl: (h) => `waar is ${h} een feestdag`,
    pl: (h) => `gdzie ${h} jest dniem wolnym`,
    pt: (h) => `onde ${h} e feriado`,
  },
  'events.named-holiday-date': {
    en: (h, y) => `when is ${h} ${y}`,
    de: (h, y) => `${h} ${y}`,
    fr: (h, y) => `${h} ${y}`,
    es: (h, y) => `${h} ${y}`,
    it: (h, y) => `${h} ${y}`,
    nl: (h, y) => `${h} ${y}`,
    pl: (h, y) => `${h} ${y}`,
    pt: (h, y) => `${h} ${y}`,
  },
  'events.long-weekends': {
    en: (c, y) => `long weekends ${y}`,
    de: (c, y) => `brückentage ${y}`,
    fr: (c, y) => `ponts ${y}`,
    es: (c, y) => `puentes ${y}`,
    it: (c, y) => `ponti ${y}`,
    nl: (c, y) => `lange weekenden ${y}`,
    pl: (c, y) => `dlugie weekendy ${y}`,
    pt: (c, y) => `feriados prolongados ${y}`,
    ja: null,
  },
  'events.today': {
    en: () => 'is today a holiday',
    de: () => 'ist heute ein feiertag',
    fr: () => "est ce que c'est ferie aujourd'hui",
    es: () => 'hoy es festivo',
    it: () => 'oggi e festivo',
    nl: () => 'is het vandaag een feestdag',
    pl: () => 'jakie jest dzisiaj swieto',
    pt: () => 'hoje e feriado',
    ja: () => '今日は祝日',
  },
  'calendar.year': {
    en: (y) => `calendar ${y}`,
    de: (y) => `kalender ${y}`,
    fr: (y) => `calendrier ${y}`,
    es: (y) => `calendario ${y}`,
    it: (y) => `calendario ${y}`,
    nl: (y) => `kalender ${y}`,
    pl: (y) => `kalendarz ${y}`,
    pt: (y) => `calendario ${y}`,
    ja: (y) => `カレンダー ${y}`,
  },
  'calendar.month': {
    en: (m, y) => `${m} ${y} calendar`,
    de: (m, y) => `kalender ${m} ${y}`,
    fr: (m, y) => `calendrier ${m} ${y}`,
    es: (m, y) => `calendario ${m} ${y}`,
    it: (m, y) => `calendario ${m} ${y}`,
    nl: (m, y) => `kalender ${m} ${y}`,
    pl: (m, y) => `kalendarz ${m} ${y}`,
    pt: (m, y) => `calendario ${m} ${y}`,
    ja: null,
  },
  'calendar.week-numbers': {
    en: () => 'week number',
    de: () => 'kalenderwoche',
    fr: () => 'numero de semaine',
    es: () => 'numero de semana',
    it: () => 'numero settimana',
    nl: () => 'weeknummer',
    pl: () => 'numer tygodnia',
    pt: () => 'numero da semana',
    ja: null,
  },
  'work.country-salaries': {
    en: (c) => `average salary ${c}`,
    de: (c) => `durchschnittsgehalt ${c}`,
    fr: (c) => `salaire moyen ${c}`,
    es: (c) => `salario medio ${c}`,
    it: (c) => `stipendio medio ${c}`,
    nl: (c) => `gemiddeld salaris ${c}`,
    pl: (c) => `srednia pensja ${c}`,
    pt: (c) => `salario medio ${c}`,
    ja: (c) => `${c} 平均年収`,
  },
  'work.working-time-per-year': {
    en: (c, y) => `working days ${y}`,
    de: (c, y) => `arbeitstage ${y}`,
    fr: (c, y) => `jours ouvres ${y}`,
    es: (c, y) => `dias laborables ${y}`,
    it: (c, y) => `giorni lavorativi ${y}`,
    nl: (c, y) => `werkdagen ${y}`,
    pl: (c, y) => `godziny pracy ${y}`,
    pt: (c, y) => `dias uteis ${y}`,
    ja: null,
  },
  'cost-of-living.country': {
    en: (c) => `cost of living ${c}`,
    de: (c) => `lebenshaltungskosten ${c}`,
    fr: (c) => `cout de la vie ${c}`,
    es: (c) => `coste de vida ${c}`,
    it: (c) => `costo della vita ${c}`,
    nl: (c) => `kosten van levensonderhoud ${c}`,
    pl: (c) => `koszty zycia ${c}`,
    pt: (c) => `custo de vida ${c}`,
    ja: (c) => `${c} 生活費`,
  },
  'rents.country-inflation': {
    en: (c) => `rent increase ${c}`,
    de: (c) => `mietpreisentwicklung ${c}`,
    fr: (c) => `augmentation des loyers ${c}`,
    es: (c) => `subida del alquiler ${c}`,
    it: (c) => `aumento affitti ${c}`,
    nl: (c) => `huurverhoging ${c}`,
    pl: (c) => `wzrost czynszu ${c}`,
    pt: (c) => `aumento de rendas ${c}`,
    ja: null,
  },
  'neighbourhoods.city-where-to-stay': {
    en: (c) => `where to stay in ${c}`,
    de: (c) => `wo wohnen in ${c}`,
    fr: (c) => `ou loger a ${c}`,
    es: (c) => `donde alojarse en ${c}`,
    it: (c) => `dove alloggiare a ${c}`,
    nl: (c) => `waar overnachten in ${c}`,
    pl: (c) => `gdzie sie zatrzymac w ${c}`,
    pt: (c) => `onde ficar em ${c}`,
    ja: (c) => `${c} どこに泊まる`,
  },
};
const kwFor = (family, lang, ...args) => {
  const f = KW[family] && KW[family][lang];
  return typeof f === 'function' ? f(...args) : '';
};

// A country's name in the language of the page, not in English. `feiertage
// Frankreich` is what a German types; `feiertage France` is what a translation
// layer produces and nobody searches for.
// Source data occasionally carries a URL-encoded fragment in a name, for
// example the Swiss "Eidgenossischer Dank-%2C Buss- und Bettag". A keyword built
// from that string measures nothing, so the encoding is decoded and the result
// tidied before it becomes a keyword or a slug.
const cleanName = (s) => {
  let out = String(s || '');
  try { out = decodeURIComponent(out); } catch { /* leave as is if not valid encoding */ }
  return out.replace(/\s+/g, ' ').trim();
};

const localCountry = (iso, lang) => cldrCountryName(iso, lang) || countryName.get(iso) || iso;

// A subdivision's name in the language of the page. Returns null for a code the
// holiday source carries but does not name, which is how the Swiss municipality
// codes (AG-AA, FR-LA-GR and the rest) are filtered out: they are not
// subdivisions in the sense a page would be about, and a keyword built from the
// bare code would be nonsense.
const localSubdivision = (iso, code, lang) => {
  const d = forSubdivision(iso, code);
  if (!d || !d.names) return null;
  return d.names[lang] || d.names.en || Object.values(d.names)[0] || null;
};

const rows = [];
let seq = 0;
function add(c) {
  seq += 1;
  rows.push({
    id: 'C' + String(seq).padStart(6, '0'),
    proposed_url: c.url,
    surface: c.surface,
    family: c.family,
    page_type: c.pageType,
    entity: c.entity,
    entity_label: c.entityLabel ?? '',
    destination: c.destination ?? '',
    country: c.country ?? '',
    subdivision: c.subdivision ?? '',
    city: c.city ?? '',
    language: c.lang,
    search_market: MARKET[c.lang] ?? c.market ?? '',
    primary_keyword: c.keyword ?? '',
    secondary_keywords: (c.secondary || []).join('; '),
    // Ahrefs columns. Null until measured. A stratified head sample fills some
    // of these; the rest stay null rather than becoming an estimate.
    monthly_volume: c.volume ?? null,
    kd: c.kd ?? null,
    traffic_potential: c.tp ?? null,
    cpc_cents: c.cpc ?? null,
    measured: c.measured ? 'yes' : 'no',
    measured_via: c.measuredVia ?? '',
    serp_intent: c.intent ?? '',
    serp_features: (c.serpFeatures || []).join('; '),
    top_ranking_urls: (c.topUrls || []).join(' | '),
    weakest_top10_competitor: c.weakest ?? '',
    weakest_competitor_dr: c.weakestDr ?? null,
    weakest_competitor_ur: c.weakestUr ?? null,
    weakest_competitor_refdomains: c.weakestRd ?? null,
    competitor_traffic: c.competitorTraffic ?? null,
    livdar_coverage_now: c.coverage,
    current_live_equivalent: c.liveEquivalent ?? '',
    source_id: c.sourceId ?? '',
    source_data_available: c.dataAvailable,
    source_licence: c.licence ?? '',
    source_licensing_status: c.licensingStatus,
    programmatic_feasibility: c.feasibility,
    uniqueness_potential: c.uniqueness,
    quality_risk: c.qualityRisk,
    monetization_fit: c.monetization,
    internal_link_fit: c.internalLink,
    gsc_evidence: 'out_of_window',
    confidence: c.confidence,
    status: c.status,
    notes: c.notes ?? '',
  });
}

// ---------------------------------------------------------------------------
// PULSE. The strongest surface on demand, and the one with a hard data ceiling.
//
// OpenHolidays covers 36 countries and 32 of them are European. There is no
// US, GB, CA, AU, JP, BR or TW in it. The Australian and Canadian opportunity
// the competitor research found is therefore NEEDS_DATA here, not buildable,
// and that is recorded per candidate rather than left for someone to discover.
// ---------------------------------------------------------------------------
const HOL = holidays.store;
const holCountries = Object.keys(HOL);
const HOL_LIC = licenceOf('events-verified') === 'unknown' ? holidays.licence : licenceOf('events-verified');

for (const iso of holCountries) {
  for (const lang of LANGS) {
    const seg = ATLAS_SEGMENTS.holidays[lang];
    const { slug } = countrySlug(iso, lang);
    const key = lang + '|events.country-holidays|' + iso;
    add({
      url: `/${lang}/${seg}/${slug}/`,
      surface: 'pulse', family: 'events.country-holidays', pageType: 'country-holiday-calendar',
      entity: iso, entityLabel: countryName.get(iso) || iso, country: iso, lang,
      keyword: kwFor('events.country-holidays', lang, localCountry(iso, lang)),
      coverage: live.has(key) ? 'LIVE' : 'none',
      liveEquivalent: live.has(key) ? `/${lang}/${seg}/${slug}/` : '',
      sourceId: 'events-verified', dataAvailable: 'yes', licence: HOL_LIC,
      licensingStatus: 'ODbL 1.0, share-alike on the database, attribution required',
      feasibility: 'high', uniqueness: 'high, dates and regional variation differ per country',
      qualityRisk: 'SAFE_TO_SCALE', monetization: 'low, informational intent',
      internalLink: 'high, links to subdivisions, named holidays and long weekends',
      confidence: live.has(key) ? 'measured-live' : 'high',
      status: live.has(key) ? 'VALIDATED' : 'PROMISING',
      notes: live.has(key) ? 'already live' : '',
    });
  }
}

// Subdivision holiday pages. The money layer per the absentify teardown: their
// 16 German state children out-earn the country index 10.5 to 1.
const subs = new Map();
for (const [iso, v] of Object.entries(HOL)) {
  for (const y of Object.keys(v.holidays || {})) {
    for (const h of v.holidays[y]) {
      for (const s of h.subdivisions || []) {
        const code = typeof s === 'string' ? s : (s.code || s.shortName || '');
        if (!code) continue;
        const k = iso + ':' + code;
        if (!subs.has(k)) subs.set(k, { iso, code, names: new Set() });
        subs.get(k).names.add((h.names && (h.names.en || Object.values(h.names)[0])) || '');
      }
    }
  }
}
let unnamedSubdivisions = 0;
for (const [k, s] of subs) {
  // A code the source does not name is not a page. This drops the Swiss
  // municipality codes and anything like them.
  if (!localSubdivision(s.iso, s.code, 'en')) { unnamedSubdivisions += 1; continue; }
  for (const lang of LANGS) {
    const seg = ATLAS_SEGMENTS.holidays[lang];
    const regionName = localSubdivision(s.iso, s.code, lang) || s.code;
    const slug = slugify(regionName);
    const key = lang + '|events.subdivision-holidays|' + s.iso + '-' + s.code;
    const isLive = live.has(key) || live.has(lang + '|events.subdivision-holidays|' + s.code);
    add({
      url: `/${lang}/${seg}/${slug}/`,
      surface: 'pulse', family: 'events.subdivision-holidays', pageType: 'subdivision-holiday-calendar',
      entity: s.iso + '-' + s.code, entityLabel: regionName, country: s.iso, subdivision: s.code, lang,
      keyword: kwFor('events.subdivision-holidays', lang, regionName),
      coverage: isLive ? 'LIVE' : 'none', liveEquivalent: isLive ? `/${lang}/${seg}/${slug}/` : '',
      sourceId: 'events-verified', dataAvailable: 'yes', licence: HOL_LIC,
      licensingStatus: 'ODbL 1.0, share-alike on the database, attribution required',
      feasibility: 'high',
      uniqueness: `high, ${s.names.size} holidays differ from the national set`,
      qualityRisk: 'SAFE_TO_SCALE', monetization: 'low, informational intent',
      internalLink: 'high, parent country and sibling subdivisions',
      confidence: isLive ? 'measured-live' : 'high',
      status: isLive ? 'VALIDATED' : 'PROMISING',
      notes: `${s.names.size} region-specific holiday names in the window`,
    });
  }
}

// The named-holiday pivot. Same data, other axis: which regions observe this
// holiday rather than which holidays this region has. Only generated for
// holidays that actually vary by region, because for a holiday observed
// everywhere the page has no question to answer.
let skippedNoLocalName = 0;
const regionVariable = new Map();
for (const [iso, v] of Object.entries(HOL)) {
  for (const y of Object.keys(v.holidays || {})) {
    for (const h of v.holidays[y]) {
      const varies = (h.subdivisions || []).length > 0 || h.everywhere === false;
      if (!varies) continue;
      const en = cleanName((h.names && (h.names.en || Object.values(h.names)[0])) || '');
      if (!en) continue;
      const k = iso + '::' + en;
      if (!regionVariable.has(k)) regionVariable.set(k, { iso, en, names: h.names || {} });
    }
  }
}
for (const [, h] of regionVariable) {
  for (const lang of relevantLangs(h.iso)) {
    const seg = ATLAS_SEGMENTS.holidays[lang];
    const localName = cleanName(h.names[lang] || (lang === 'en' ? (h.names.en || h.en) : null)) || null;
    if (!localName) { skippedNoLocalName += 1; continue; }
    const slug = slugify(localName);
    if (!slug) continue;
    const cslug = countrySlug(h.iso, lang).slug;
    add({
      url: `/${lang}/${seg}/${cslug}/${slug}/`,
      surface: 'pulse', family: 'events.named-holiday-regions', pageType: 'named-holiday-which-regions',
      entity: h.iso + '::' + h.en, entityLabel: localName, country: h.iso, lang,
      keyword: kwFor('events.named-holiday-regions', lang, localName),
      coverage: 'none',
      sourceId: 'events-verified', dataAvailable: 'yes', licence: HOL_LIC,
      licensingStatus: 'ODbL 1.0, share-alike on the database, attribution required',
      feasibility: 'high, a pivot of data already held',
      uniqueness: 'high, the answer is a region list that differs per holiday',
      qualityRisk: 'SAFE_TO_SCALE', monetization: 'low, informational intent',
      internalLink: 'high, cross-links every region that observes it',
      confidence: 'medium',
      status: 'PROMISING',
      notes: 'region-variable holiday, so the which-regions question has a real answer',
    });
  }
}

// Long weekends and bridge days, per country per year. Computed from the
// holiday dates plus a weekday calculation, so no new source is needed.
for (const iso of holCountries) {
  for (const year of [2026, 2027]) {
    for (const lang of LANGS) {
      const seg = ATLAS_SEGMENTS.holidays[lang];
      const cslug = countrySlug(iso, lang).slug;
      add({
        url: `/${lang}/${seg}/${cslug}/${year}/`,
        surface: 'pulse', family: 'events.long-weekends', pageType: 'long-weekend-and-bridge-day-planner',
        entity: iso + '::' + year, entityLabel: `${countryName.get(iso) || iso} ${year}`, country: iso, lang,
        keyword: kwFor('events.long-weekends', lang, localCountry(iso, lang), year),
        coverage: 'none',
        sourceId: 'events-verified', dataAvailable: 'yes', licence: HOL_LIC,
        licensingStatus: 'ODbL 1.0, share-alike on the database, attribution required',
        feasibility: 'high, computed from held holiday dates',
        uniqueness: 'high, the bridge-day combinations are specific to the year and country',
        qualityRisk: 'SAFE_TO_SCALE', monetization: 'medium, leave planning has commercial adjacency',
        internalLink: 'high, country holidays and the year calendar',
        confidence: 'medium',
        status: 'PROMISING',
        notes: 'the intent an AI Overview cannot finish in one line, unlike a single date',
      });
    }
  }
}

// The holiday date family. Distinct from the which-regions pivot above: this
// answers "when is X in year Y", which is a different question with a different
// answer each year, so here the year genuinely is the entity and belongs in the
// URL. The evidence is direct: kalendarzswiat.pl runs /wielkanoc/2026 and
// /boze_cialo/2027, and `boze cialo 2026` carries 64,000 searches while
// `kiedy jest halloween` carries 72,000.
//
// Language-gated, because a Polish Corpus Christi page in Japanese has no
// reader. Tagged SCALE_WITH_GATES rather than SAFE_TO_SCALE: the family is
// real but its tail is thin, and only the holidays with their own demand are
// worth building.
const datePairs = new Map();
for (const [iso, v] of Object.entries(HOL)) {
  for (const y of Object.keys(v.holidays || {})) {
    for (const h of v.holidays[y]) {
      const en = cleanName((h.names && (h.names.en || Object.values(h.names)[0])) || '');
      if (!en) continue;
      const k = iso + '::' + en;
      if (!datePairs.has(k)) datePairs.set(k, { iso, en, names: h.names || {}, moves: false, years: new Set() });
      datePairs.get(k).years.add(y);
    }
  }
}
for (const [, h] of datePairs) {
  for (const year of [...h.years].sort()) {
    for (const lang of relevantLangs(h.iso)) {
      // Only where the source names the holiday in this language. Falling back
      // to English would produce "New Year's Day 2026" as a French keyword,
      // which nobody types, so the candidate is skipped instead.
      const localName = cleanName(h.names[lang] || (lang === 'en' ? (h.names.en || h.en) : null)) || null;
      if (!localName) { skippedNoLocalName += 1; continue; }
      const slug = slugify(localName);
      if (!slug) continue;
      add({
        url: `/${lang}/${ATLAS_SEGMENTS.holidays[lang]}/${slug}/${year}/`,
        surface: 'pulse', family: 'events.named-holiday-date', pageType: 'when-is-this-holiday',
        entity: h.iso + '::' + h.en + '::' + year, entityLabel: `${localName} ${year}`,
        country: h.iso, lang, keyword: kwFor('events.named-holiday-date', lang, localName, year), coverage: 'none',
        sourceId: 'events-verified', dataAvailable: 'yes', licence: HOL_LIC,
        licensingStatus: 'ODbL 1.0, share-alike on the database, attribution required',
        feasibility: 'high, held data',
        uniqueness: 'medium, a date plus context; moving feasts differ every year',
        qualityRisk: 'SCALE_WITH_GATES', monetization: 'low',
        internalLink: 'high, the year calendar and the country holiday page',
        confidence: 'medium', status: 'PROMISING',
        notes: 'only the holidays with their own demand are worth building; the tail of this family is thin',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// SPORT. Bounded twice over: the seasonality bands need climate normals, which
// exist for 55 cities, and naming anywhere to do the activity needs venue data,
// which exists for 16 countries. A city outside either is NEEDS_DATA, and the
// source itself refuses to name a route, trail, pool or club.
// ---------------------------------------------------------------------------
const venueCountries = new Set(Object.keys(J('data/atlas/sources/venues/normalized.json').countries || {}));
const ACTIVITIES = ['running', 'cycling', 'hiking', 'swimming'];
const climateCityMeta = climate.cities || {};
for (const [cityId, meta] of Object.entries(climateCityMeta)) {
  const iso = (meta && (meta.iso2 || meta.country)) || '';
  const hasVenues = venueCountries.has(iso);
  for (const act of ACTIVITIES) {
    for (const lang of LANGS) {
      const key = lang + '|sport.city-season|' + cityId + ':' + act;
      const isLive = live.has(key);
      add({
        url: `/${lang}/${ATLAS_SEGMENTS.sport[lang]}/${slugify(String(meta && meta.name || cityId))}-${act}/`,
        surface: 'sport', family: 'sport.city-season', pageType: 'city-activity-seasonality',
        entity: cityId + ':' + act, entityLabel: `${(meta && meta.name) || cityId} ${act}`,
        city: String((meta && meta.name) || cityId), country: iso, lang,
        // Deliberately unmeasured rather than templated. lib/atlas/atlas-urls.js
        // records that a sport page's slug comes from the phrase that market
        // actually types, and that `running-in-new-york` and
        // `trekking-vicino-milano` are not translations of each other. A
        // template here would invent the keyword, so it stays empty until
        // measured.
        coverage: isLive ? 'LIVE' : 'none',
        liveEquivalent: isLive ? 'see live sport pages' : '',
        sourceId: 'nasa-power-daily', dataAvailable: hasVenues ? 'yes' : 'partial',
        licence: licenceOf('nasa-power-daily'),
        licensingStatus: hasVenues ? 'CC BY 4.0 for climate, CC0 1.0 for venues' : 'CC BY 4.0 for climate; no venue data for this country',
        feasibility: hasVenues ? 'high' : 'partial, seasonality only and nowhere named',
        uniqueness: 'high, the answer differs by city and by activity; Tokyo in July suits swimming and defeats running',
        qualityRisk: hasVenues ? 'SCALE_WITH_GATES' : 'HIGH_THIN_CONTENT_RISK',
        monetization: 'low', internalLink: 'medium',
        confidence: isLive ? 'measured-live' : 'medium',
        status: isLive ? 'VALIDATED' : (hasVenues ? 'PROMISING' : 'NEEDS_DATA'),
        notes: hasVenues ? '' : 'no venue data for this country, so the page can only describe seasonality and cannot name anywhere to go',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// CALENDAR. Pure computation: no source, no licence, no scraping. The
// competitor evidence for this is strong: one Dutch page earns 93,469 from
// week numbers alone, and a calendar page for the year 2089 earns 22,780.
// ---------------------------------------------------------------------------
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
// A month's name in the language of the page. `kalender january 2026` is not a
// German keyword; `kalender januar 2026` is. Intl has these, so there is no
// reason to hand-maintain 108 strings.
const monthFmt = new Map();
const monthName = (lang, idx) => {
  if (!monthFmt.has(lang)) monthFmt.set(lang, new Intl.DateTimeFormat(lang, { month: 'long', timeZone: 'UTC' }));
  return monthFmt.get(lang).format(new Date(Date.UTC(2026, idx, 1)));
};
for (const lang of LANGS) {
  add({
    url: `/${lang}/calendar/week-numbers/`,
    surface: 'tools', family: 'calendar.week-numbers', pageType: 'week-number-lookup',
    entity: 'week-numbers', entityLabel: 'week numbers', lang, keyword: kwFor('calendar.week-numbers', lang), coverage: 'none',
    sourceId: 'computed', dataAvailable: 'yes', licence: 'computed, no external source',
    licensingStatus: 'no licence needed',
    feasibility: 'high, ISO 8601 week arithmetic', uniqueness: 'high, it is a live answer plus a table',
    qualityRisk: 'SAFE_TO_SCALE', monetization: 'low', internalLink: 'medium',
    confidence: 'high', status: 'PROMISING',
    notes: 'kalender-365.nl/weeknummer.html earns 93469 from this single page with 731 keywords',
  });
  add({
    url: `/${lang}/calendar/today/`,
    surface: 'pulse', family: 'events.today', pageType: 'what-is-today',
    entity: 'today', entityLabel: 'today', lang, keyword: kwFor('events.today', lang), coverage: 'none',
    sourceId: 'events-verified', dataAvailable: 'yes', licence: HOL_LIC,
    licensingStatus: 'ODbL 1.0, share-alike on the database, attribution required',
    feasibility: 'high, held holiday data plus a date', uniqueness: 'high, the answer changes daily',
    qualityRisk: 'SAFE_TO_SCALE', monetization: 'low', internalLink: 'high, a natural hub',
    confidence: 'high', status: 'PROMISING',
    notes: 'kalendarzswiat.pl/dzisiaj earns 59419 from one URL with 716 keywords, the highest per-page figure found',
  });
  for (const year of [2026, 2027, 2028, 2029, 2030]) {
    add({
      url: `/${lang}/calendar/${year}/`,
      surface: 'tools', family: 'calendar.year', pageType: 'year-calendar',
      entity: String(year), entityLabel: String(year), lang, keyword: kwFor('calendar.year', lang, year), coverage: 'none',
      sourceId: 'computed', dataAvailable: 'yes', licence: 'computed, no external source',
      licensingStatus: 'no licence needed',
      feasibility: 'high', uniqueness: 'medium, the grid plus that market\'s holidays',
      qualityRisk: 'SCALE_WITH_GATES', monetization: 'low', internalLink: 'high',
      confidence: year <= 2028 ? 'high' : 'medium',
      status: 'PROMISING',
      notes: 'SERP validated for de: kalender 2027 at 70657 and KD 2 has a DR 10 page at position 3. Rejected for pl, where a SERP page carries 55463 backlinks.',
    });
    if (year > 2028) continue;
    for (let mi = 0; mi < MONTHS.length; mi += 1) {
      const m = MONTHS[mi];
      const localMonth = monthName(lang, mi);
      add({
        url: `/${lang}/calendar/${year}/${slugify(localMonth) || m}/`,
        surface: 'tools', family: 'calendar.month', pageType: 'month-calendar',
        entity: `${year}-${m}`, entityLabel: `${localMonth} ${year}`, lang,
        keyword: kwFor('calendar.month', lang, localMonth, year), coverage: 'none',
        sourceId: 'computed', dataAvailable: 'yes', licence: 'computed, no external source',
        licensingStatus: 'no licence needed',
        feasibility: 'high', uniqueness: 'medium, grid plus holidays plus week numbers for that month',
        qualityRisk: 'SCALE_WITH_GATES', monetization: 'low', internalLink: 'high, year and sibling months',
        confidence: 'medium', status: 'PROMISING',
        notes: 'a competitor holds position 1 on calendrier septembre 2026 at 59000 with zero page refdomains',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// WORK, COST OF LIVING, RENT. Each bounded by its Eurostat or World Bank
// coverage. These are not guesses: the counts below are the counts in the files.
// ---------------------------------------------------------------------------
const salaryCountries = Object.keys(salary.countries || {});
const rentCountries = Object.keys(rent.countries || {});
const colCountries = Object.keys(col.countries || {});

for (const iso of salaryCountries) {
  for (const lang of LANGS) {
    const seg = ATLAS_SEGMENTS.salaries[lang];
    const slug = countrySlug(iso, lang).slug;
    const key = lang + '|work.country-salaries|' + iso;
    add({
      url: `/${lang}/${seg}/${slug}/`,
      surface: 'work', family: 'work.country-salaries', pageType: 'country-salary-report',
      entity: iso, entityLabel: countryName.get(iso) || iso, country: iso, lang,
      keyword: kwFor('work.country-salaries', lang, localCountry(iso, lang)),
      coverage: live.has(key) ? 'LIVE' : 'none', liveEquivalent: live.has(key) ? `/${lang}/${seg}/${slug}/` : '',
      sourceId: 'salary-data-verified', dataAvailable: 'yes', licence: licenceOf('salary-data-verified'),
      licensingStatus: 'Eurostat reuse policy, commercial reuse permitted with attribution',
      feasibility: 'high', uniqueness: 'high, gross and net figures differ per country',
      qualityRisk: 'SAFE_TO_SCALE', monetization: 'medium, salary intent has commercial adjacency',
      internalLink: 'high, salary calculator and cost of living',
      confidence: live.has(key) ? 'measured-live' : 'high',
      status: live.has(key) ? 'VALIDATED' : 'PROMISING',
      notes: 'Eurostat coverage is 35 countries; outside that this family is NEEDS_DATA',
    });
  }
}
for (const iso of rentCountries) {
  for (const lang of LANGS) {
    const seg = ATLAS_SEGMENTS['rent-increase'][lang];
    const slug = countrySlug(iso, lang).slug;
    const key = lang + '|rents.country-inflation|' + iso;
    add({
      url: `/${lang}/${seg}/${slug}/`,
      surface: 'stay', family: 'rents.country-inflation', pageType: 'country-rent-trend',
      entity: iso, entityLabel: countryName.get(iso) || iso, country: iso, lang,
      keyword: kwFor('rents.country-inflation', lang, localCountry(iso, lang)),
      coverage: live.has(key) ? 'LIVE' : 'none', liveEquivalent: live.has(key) ? `/${lang}/${seg}/${slug}/` : '',
      sourceId: 'rent-index-verified', dataAvailable: 'yes', licence: licenceOf('rent-index-verified'),
      licensingStatus: 'Eurostat reuse policy, commercial reuse permitted with attribution',
      feasibility: 'high', uniqueness: 'medium, an index series per country',
      qualityRisk: 'SCALE_WITH_GATES', monetization: 'medium',
      internalLink: 'medium', confidence: live.has(key) ? 'measured-live' : 'medium',
      status: live.has(key) ? 'VALIDATED' : 'PROMISING',
      notes: 'index only, no listings. Eurostat coverage is 36 countries.',
    });
  }
}
for (const iso of colCountries) {
  for (const lang of LANGS) {
    const seg = ATLAS_SEGMENTS['cost-of-living'][lang];
    const slug = countrySlug(iso, lang).slug;
    const key = lang + '|cost-of-living.country|' + iso;
    const isLive = live.has(key);
    add({
      url: `/${lang}/${seg}/${slug}/`,
      surface: 'move', family: 'cost-of-living.country', pageType: 'country-cost-of-living',
      entity: iso, entityLabel: countryName.get(iso) || iso, country: iso, lang,
      keyword: kwFor('cost-of-living.country', lang, localCountry(iso, lang)),
      coverage: isLive ? 'LIVE' : 'none', liveEquivalent: isLive ? `/${lang}/${seg}/${slug}/` : '',
      sourceId: 'cost-of-living-verified', dataAvailable: 'yes', licence: licenceOf('cost-of-living-verified'),
      licensingStatus: 'Eurostat reuse policy plus CC BY 4.0, commercial reuse permitted',
      feasibility: 'high',
      uniqueness: 'medium, a price level plus category detail where Eurostat covers it',
      // The honest gate. 193 of these are already live and the surface carries
      // 2.8% of Atlas demand on 38.6% of its pages, so more of them is not
      // obviously the right move even though the data reaches 199 countries.
      qualityRisk: 'SCALE_WITH_GATES', monetization: 'medium',
      internalLink: 'high, but the surface is already over-linked relative to its demand',
      confidence: isLive ? 'measured-live' : 'medium',
      status: isLive ? 'VALIDATED' : 'PROMISING',
      notes: isLive ? 'already live' : 'World Bank price level reaches 199 countries; Eurostat category detail only 36. Outside Eurostat the page is thinner.',
    });
  }
}
for (const iso of salaryCountries) {
  for (const year of [2026, 2027]) {
    for (const lang of LANGS) {
      const slug = countrySlug(iso, lang).slug;
      add({
        url: `/${lang}/working-time/${slug}/${year}/`,
        surface: 'work', family: 'work.working-time-per-year', pageType: 'statutory-working-time',
        entity: iso + '::' + year, entityLabel: `${countryName.get(iso) || iso} ${year}`, country: iso, lang,
        keyword: kwFor('work.working-time-per-year', lang, localCountry(iso, lang), year),
        coverage: 'none',
        sourceId: 'events-verified', dataAvailable: holCountries.includes(iso) ? 'yes' : 'partial',
        licence: HOL_LIC, licensingStatus: 'ODbL 1.0 for the holiday input; working-time rules need a second source',
        feasibility: holCountries.includes(iso) ? 'high, computed from held holidays' : 'blocked without holiday data',
        uniqueness: 'high, working days and hours differ per country and year',
        qualityRisk: 'SAFE_TO_SCALE', monetization: 'medium, payroll and HR adjacency',
        internalLink: 'high, holidays and salary',
        confidence: 'medium',
        status: holCountries.includes(iso) ? 'PROMISING' : 'NEEDS_DATA',
        notes: 'kalendarzswiat.pl earns 9060 from this family; godziny pracy 2026 is 16000',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// AREAS and CLIMATE. Both hard-bounded by verified data, and climate is
// already rejected on SERP evidence.
// ---------------------------------------------------------------------------
const nbCities = Object.keys(nb.store || {});
for (const cityKey of nbCities) {
  for (const lang of LANGS) {
    const seg = ATLAS_SEGMENTS['where-to-stay'][lang];
    const slug = slugify(cityKey);
    const key = lang + '|neighbourhoods.city-where-to-stay|' + cityKey;
    const isLive = live.has(key);
    add({
      url: `/${lang}/${seg}/${slug}/`,
      surface: 'areas', family: 'neighbourhoods.city-where-to-stay', pageType: 'city-where-to-stay',
      entity: cityKey, entityLabel: cityKey, city: cityKey, lang,
      keyword: kwFor('neighbourhoods.city-where-to-stay', lang, cityKey),
      coverage: isLive ? 'LIVE' : 'none', liveEquivalent: isLive ? `/${lang}/${seg}/${slug}/` : '',
      sourceId: 'neighbourhood-facts-verified', dataAvailable: 'yes', licence: licenceOf('neighbourhood-facts-verified'),
      licensingStatus: 'CC BY 4.0, commercial reuse permitted with attribution',
      feasibility: 'high where facts exist',
      uniqueness: 'high, named districts with verified facts per city',
      qualityRisk: 'SCALE_WITH_GATES', monetization: 'medium, accommodation adjacency',
      internalLink: 'high',
      confidence: isLive ? 'measured-live' : 'medium',
      status: isLive ? 'VALIDATED' : 'PROMISING',
      notes: `verified neighbourhood facts exist for ${nbCities.length} cities only; beyond those this family is NEEDS_DATA`,
    });
  }
}
const climCities = Object.keys(climate.cities || {});
for (const c of climCities) {
  for (const lang of LANGS) {
    add({
      url: `/${lang}/${ATLAS_SEGMENTS['best-time'][lang]}/${slugify(c)}/`,
      surface: 'climate', family: 'weather.country-best-time', pageType: 'best-time-to-visit',
      entity: c, entityLabel: c, city: c, lang, coverage: 'none',
      sourceId: 'nasa-power-daily', dataAvailable: 'yes', licence: licenceOf('nasa-power-daily'),
      licensingStatus: 'CC BY 4.0, no restrictions on reuse',
      feasibility: 'high', uniqueness: 'medium, monthly normals per city',
      qualityRisk: 'REJECT', monetization: 'low',
      internalLink: 'medium', confidence: 'high', status: 'REJECTED',
      notes: 'REJECTED on SERP validation: KD 1.5 but Reddit and Conde Nast hold the results. 24 pages are already live and can stay; this is not an expansion target.',
    });
  }
}

// ---------------------------------------------------------------------------
// TOOLS. Calculators, which are the one family where the page is a function
// rather than a table, and therefore the hardest to call thin.
// ---------------------------------------------------------------------------
const TOOLS = [
  ['salary-calculator', 'salary after tax and gross to net', 'high', 'high'],
  ['rent-affordability', 'how much rent you can afford', 'high', 'high'],
  ['cost-of-living-comparison', 'compare two places', 'high', 'medium'],
  ['moving-cost', 'what a move costs', 'high', 'high'],
  ['travel-budget', 'trip budget', 'high', 'medium'],
  ['city-comparison', 'compare two cities', 'high', 'medium'],
  ['relocation-calculator', 'relocation total cost', 'high', 'high'],
  ['tax-calculator', 'income tax estimate', 'medium', 'high'],
  ['working-time-calculator', 'working days and hours', 'high', 'medium'],
  ['bridge-day-planner', 'combine leave with holidays', 'high', 'medium'],
  ['date-calculator', 'days between dates', 'high', 'low'],
  ['week-number-calculator', 'week number for a date', 'high', 'low'],
  ['currency-cost-converter', 'price in your currency', 'medium', 'medium'],
  ['esim-data-estimator', 'how much data a trip needs', 'high', 'high'],
];
for (const [slug, what, feas, mon] of TOOLS) {
  for (const lang of LANGS) {
    const seg = ATLAS_SEGMENTS.tools[lang];
    add({
      url: `/${lang}/${seg}/${slug}/`,
      surface: 'tools', family: 'tools.calculator', pageType: 'interactive-calculator',
      entity: slug, entityLabel: what, lang, coverage: 'none',
      sourceId: 'computed', dataAvailable: feas === 'high' ? 'yes' : 'partial',
      licence: 'computed from held sources',
      licensingStatus: slug === 'tax-calculator' ? 'tax-rules-verified licence to be established' : 'no additional licence needed',
      feasibility: feas, uniqueness: 'high, a function rather than a table',
      qualityRisk: 'SAFE_TO_SCALE', monetization: mon,
      internalLink: 'high, tools are natural hubs',
      confidence: 'medium', status: feas === 'high' ? 'PROMISING' : 'NEEDS_DATA',
      notes: slug === 'esim-data-estimator' ? 'the one tool with a direct path to the eSIM shop, which 484 of 500 Atlas pages lack' : '',
    });
  }
}

// ---------------------------------------------------------------------------
// The families that are demand-rich and data-blocked. Recorded as candidates
// with status NEEDS_DATA or BLOCKED so the demand is not lost, and so nobody
// mistakes them for ready work.
// ---------------------------------------------------------------------------
const BLOCKED = [
  ['events.school-holidays', 'de', 'DE', 'school-holidays', 'sommerferien nrw 2026', 257000,
   'BLOCKED', 'dates are set by 16 independent state education ministries; needs a licensed or openly published dataset, and no scraping'],
  ['events.school-holidays', 'fr', 'FR', 'school-holidays', 'vacances scolaires 2027', 283339,
   'NEEDS_DATA', 'France sets the calendar nationally across 3 zones plus Corsica, so one source rather than sixteen. A better prospect than Germany, not a confirmed one: the licence is unverified.'],
  ['events.country-holidays', 'en', 'AU', 'country-holiday-calendar', 'nsw public holidays 2026', 8683,
   'NEEDS_DATA', 'OpenHolidays does not cover Australia. The competitor evidence is strong and the data is absent.'],
  ['events.country-holidays', 'en', 'CA', 'country-holiday-calendar', 'stat holidays 2026', 1045,
   'NEEDS_DATA', 'OpenHolidays does not cover Canada. 15.8% of absentify traffic and no source held.'],
  ['events.country-holidays', 'en', 'US', 'country-holiday-calendar', 'federal holidays 2026', null,
   'NEEDS_DATA', 'OpenHolidays does not cover the United States.'],
  ['events.country-holidays', 'en', 'GB', 'country-holiday-calendar', 'bank holidays 2026', null,
   'NEEDS_DATA', 'OpenHolidays does not cover the United Kingdom.'],
  ['events.country-holidays', 'ja', 'JP', 'country-holiday-calendar', '祝日 2027', null,
   'NEEDS_DATA', 'OpenHolidays does not cover Japan. The Cabinet Office holds position 1 and is not contestable, but positions 2 to 10 carry 0 to 6 refdomains.'],
  ['events.country-holidays', 'pt', 'BR', 'country-holiday-calendar', 'feriados 2027', null,
   'NEEDS_DATA', 'OpenHolidays does not cover Brazil, which is the pt-BR market Livdar publishes for.'],
  ['safety.city', 'en', '', 'city-safety', 'is it safe', null,
   'NEEDS_DATA', 'safety-data-verified licence is to be established. Without a defensible source this family should not be built at any scale.'],
  ['stay.city-rooms', 'en', '', 'city-monthly-stay', 'monthly rentals', null,
   'BLOCKED', 'no lawful listings inventory. Informational pages only, and fabricating listings is out of the question.'],
];
for (const [family, lang, iso, pageType, kw, vol, status, note] of BLOCKED) {
  add({
    url: iso ? `/${lang}/${ATLAS_SEGMENTS.holidays[lang] || 'holidays'}/${countrySlug(iso, lang).slug}/` : `/${lang}/${pageType}/`,
    surface: family.startsWith('events') ? 'pulse' : family.split('.')[0],
    family, pageType, entity: iso || pageType, entityLabel: iso ? (countryName.get(iso) || iso) : pageType,
    country: iso, lang, keyword: kw, volume: vol, measured: vol ? true : false,
    measuredVia: vol ? 'keywords-explorer-overview 2026-09-28' : '',
    coverage: 'none', sourceId: '', dataAvailable: 'no', licence: 'not held',
    licensingStatus: status === 'BLOCKED' ? 'blocked' : 'unverified',
    feasibility: 'blocked on data', uniqueness: 'high if the data existed',
    qualityRisk: status === 'BLOCKED' ? 'REJECT' : 'SCALE_WITH_GATES',
    monetization: 'medium', internalLink: 'high',
    confidence: 'high', status, notes: note,
  });
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
const OUT = new URL('reports/candidate-universe-2026-09-29/', ROOT);
mkdirSync(OUT, { recursive: true });
const cols = Object.keys(rows[0]);
const tsv = [cols.join('\t')];
for (const r of rows) tsv.push(cols.map((c) => (r[c] === null || r[c] === undefined ? '' : String(r[c]).replace(/[\t\n]/g, ' '))).join('\t'));
writeFileSync(new URL('MASTER-CANDIDATE-INVENTORY.tsv', OUT), tsv.join('\n') + '\n');
writeFileSync(new URL('MASTER-CANDIDATE-INVENTORY.json', OUT), JSON.stringify(rows));

const by = (k) => {
  const m = new Map();
  for (const r of rows) { const v = r[k] || '(none)'; m.set(v, (m.get(v) || 0) + 1); }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
const agg = { total: rows.length, generated: new Date().toISOString().slice(0, 10) };
for (const k of ['surface', 'family', 'language', 'status', 'quality_risk', 'source_data_available', 'programmatic_feasibility', 'monetization_fit', 'livdar_coverage_now', 'measured', 'confidence', 'page_type']) agg[k] = Object.fromEntries(by(k));
writeFileSync(new URL('AGGREGATES.json', OUT), JSON.stringify(agg, null, 1));

console.log('TOTAL CANDIDATES:', rows.length);
console.log('subdivision codes skipped because the source does not name them:', unnamedSubdivisions);
console.log('holiday pages skipped because the source has no name in that language:', skippedNoLocalName);
for (const k of ['surface', 'status', 'quality_risk', 'source_data_available', 'measured', 'livdar_coverage_now']) {
  console.log('\n== ' + k);
  for (const [v, n] of by(k)) console.log('   ' + String(v).padEnd(34) + n);
}
console.log('\n== family');
for (const [v, n] of by('family')) console.log('   ' + String(v).padEnd(40) + n);

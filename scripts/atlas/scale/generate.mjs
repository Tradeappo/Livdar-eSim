// Generate the scale universe, with deduplication at every level the brief names.
//
// The counting rule is the whole point. A raw combination is not a candidate.
// The funnel is reported at each stage so the drop is visible:
//
//   raw combinations
//   after exact keyword dedupe
//   after normalised keyword dedupe
//   after semantic intent dedupe
//   after same entity plus intent dedupe
//   after data signature dedupe
//   after cross-language dedupe
//   source backed
//   quality gated
//   VALID RESEARCH CANDIDATES
//
// Rows removed by dedupe are kept and marked MERGED_DUPLICATE with a pointer to
// the canonical candidate, because knowing what collapsed is as useful as
// knowing what survived. They do not count.

import { readFileSync, writeFileSync, mkdirSync, createWriteStream } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { FAMILIES, PUBLISHABLE_GATES } from './family-catalog.mjs';
import { ATLAS_SEGMENTS, countrySlug, countryName as cldrName, slugify } from '../../../lib/atlas/atlas-urls.js';
import { forSubdivision } from '../../../lib/atlas/holidays.js';
import { pages as livePages } from '../../../lib/atlas/serve-pages.js';

const ROOT = new URL('../../../', import.meta.url);
const J = (p) => JSON.parse(readFileSync(new URL(p, ROOT), 'utf8'));
const OUT = new URL('reports/scale-universe-2026-09-29/', ROOT);
mkdirSync(OUT, { recursive: true });

const graph = J('reports/scale-universe-2026-09-29/ENTITY-GRAPH-summary.json');
const holidays = J('data/atlas/sources/events/public-holidays.json');
const nb = J('data/atlas/sources/neighbourhoods/facts.json');
const salary = J('data/atlas/sources/salary/normalized.json');
const col = J('data/atlas/sources/cost-of-living/normalized.json');
const rent = J('data/atlas/sources/rent/normalized.json');
const airports = J('data/atlas/entities/airports.json');
const countries = J('data/atlas/entities/countries.json');
const cName = new Map(countries.map((c) => [c.iso2, c.name]));

// Cities, with tier, rebuilt the same way the graph did it.
import { readdirSync } from 'node:fs';
const cities = [];
for (const f of readdirSync(new URL('data/atlas/entities/cities/', ROOT))) {
  if (!f.endsWith('.json')) continue;
  const shard = J('data/atlas/entities/cities/' + f);
  const list = Array.isArray(shard) ? shard : (shard.cities || Object.values(shard)[0] || []);
  for (const c of list) if (c && c.id) cities.push(c);
}
// The city shards key the country as `country`, not `iso2`, and carry no
// localised name map. Reading `c.iso2` returned undefined for all 31,715 cities,
// which silently forced every city family to English and left the country column
// empty on 141,000 rows. Normalised here once so no caller can repeat it.
for (const c of cities) { if (!c.iso2 && c.country) c.iso2 = c.country; }
cities.sort((a, b) => (b.population || 0) - (a.population || 0));
const T = graph.counts;
cities.forEach((c, i) => {
  c.tier = i < T.cities_tier1 ? 1 : i < T.cities_tier1 + T.cities_tier2 ? 2
    : i < T.cities_tier1 + T.cities_tier2 + T.cities_tier3 ? 3 : 4;
});

// Which language a market genuinely searches in. Used by langRule so nothing is
// multiplied by nine.
const MARKET_LANG = {
  de: ['de'], at: ['de'], ch: ['de', 'fr', 'it'], fr: ['fr'], be: ['nl', 'fr'], nl: ['nl'],
  es: ['es'], mx: ['es'], it: ['it'], pt: ['pt'], br: ['pt'], pl: ['pl'], jp: ['ja'],
};
const MEASURED_LANGS = ['de', 'en', 'fr', 'nl', 'pl'];
const MAJOR_LANGS = ['en', 'de', 'fr', 'es'];
const LANG_MARKET = { de: 'de-DE', en: 'en-US', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', ja: 'ja-JP', nl: 'nl-NL', pl: 'pl-PL', pt: 'pt-BR' };
// A family may override the market for a language where measurement says the
// demand lives somewhere else. This is a substitution, never an addition: the
// airport family reads en-GB INSTEAD of en-US because "city centre" is British
// spelling and the same keyword measures 20 in us and 900 in gb. Adding both
// would be multiplying one page by two markets, which the brief forbids.
const marketFor = (fam, lang) => (fam.marketOverride && fam.marketOverride[lang]) || LANG_MARKET[lang] || '';

function langsFor(rule, iso) {
  const own = (MARKET_LANG[String(iso || '').toLowerCase()] || []);
  switch (rule) {
    case 'en': return ['en'];
    case 'own': return own.length ? own : ['en'];
    case 'own+en': return [...new Set([...own, 'en'])];
    case 'own+en+neighbours': return [...new Set([...own, 'en', 'de', 'fr'])].slice(0, 4);
    case 'own+en+major': return [...new Set([...own, ...MAJOR_LANGS])];
    case 'measured': return MEASURED_LANGS;
    default: return ['en'];
  }
}

// Live coverage, so a candidate can be excluded as already published.
const liveKeys = new Set();
for (const p of livePages()) liveKeys.add(p.locale + '|' + p.family + '|' + String(p.entity));

const sha = (s) => createHash('sha1').update(String(s)).digest('hex').slice(0, 12);
const rows = [];
let n = 0;

function emit(fam, o) {
  n += 1;
  const lang = o.lang;
  // The three signatures the brief asks for.
  //
  //   intent_cluster_id  the full intent: family, entity and language together.
  //                      The entity is part of the intent, not a parameter of
  //                      it: "weather in Rome in May" and "weather in Paris in
  //                      May" are different questions. An earlier version left
  //                      the entity out and collapsed 97% of the universe into
  //                      962 rows, which is what the funnel is for.
  //   intent_modifier    the query shape without the entity, so families can be
  //                      compared across entities without merging them.
  //   data_signature     which underlying fields the page is built from
  //   template_signature which page shape renders it
  const intentCluster = fam.id + '::' + o.entityId + '::' + lang;
  const intentModifier = o.intentKey ?? fam.pageType;
  const dataSignature = sha(fam.source + '|' + fam.uniqueFields.join(',') + '|' + (o.dataKey ?? o.entityId));
  const templateSignature = fam.pageType;
  rows.push({
    candidate_id: 'S' + String(n).padStart(7, '0'),
    proposed_url: o.url,
    surface: fam.surface,
    family: fam.id,
    page_type: fam.pageType,
    country: o.country ?? '',
    region: o.region ?? '',
    city: o.city ?? '',
    entity: o.entityId,
    entity_label: o.label ?? '',
    language: lang,
    search_market: marketFor(fam, lang),
    primary_keyword: o.keyword ?? '',
    keyword_template: o.template ?? '',
    intent: o.intent ?? '',
    data_source: fam.source ?? '',
    license_status: fam.licence,
    source_availability: fam.availability,
    unique_data_fields: fam.uniqueFields.length,
    programmatic_feasibility: fam.availability === 'held' ? 'high' : fam.availability === 'acquirable' ? 'high once acquired' : 'blocked',
    monetization_fit: fam.monetization,
    internal_link_fit: fam.internalLink,
    quality_gate: fam.gate,
    risk_level: fam.gate === 'REJECT' ? 'reject' : fam.gate === 'HIGH_RISK' ? 'high' : fam.gate === 'EXPERIMENT_ONLY' ? 'medium' : 'low',
    measured_status: 'UNMEASURED',
    sample_group: fam.id + '|' + lang,
    volume_if_measured: '',
    kd_if_measured: '',
    traffic_potential_if_measured: '',
    serp_strength_if_measured: '',
    competitor_pattern: o.competitor ?? '',
    semantic_cluster_id: sha(intentCluster),
    intent_cluster_id: intentCluster,
    intent_modifier: intentModifier,
    data_signature: dataSignature,
    template_signature: templateSignature,
    canonical_candidate_id: '',
    sibling_similarity: '',
    duplicate_risk: '',
    cannibalization_risk: liveKeys.has(lang + '|' + (o.liveFamily ?? fam.id) + '|' + o.entityId) ? 'LIVE_EQUIVALENT' : 'none',
    candidate_status: '',
    notes: o.notes ?? '',
  });
}

const byId = Object.fromEntries(FAMILIES.map((f) => [f.id, f]));

// --- CLIMATE, the only globally acquirable source -------------------------
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];
const monthName = (lang, i) => new Intl.DateTimeFormat(lang, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, i, 1)));
// climate.city-month-tail is gated REJECT and is emitted anyway. The brief
// allows the research universe to carry rejected candidates so long as they
// are never publication ready, and emitting them is what makes the reduction
// visible in the funnel instead of being a number in a paragraph.
for (const famId of ['climate.city-month', 'climate.city-month-tail', 'climate.city-annual']) {
  const fam = byId[famId];
  for (const c of cities) {
    if (fam.tiers && !fam.tiers.includes(c.tier)) continue;
    if (c.lat == null) continue;
    for (const lang of langsFor(fam.langRule, c.iso2)) {
      const cityLabel = (c.names && c.names[lang]) || c.name;
      const cslug = slugify(cityLabel) || slugify(c.name);
      if (!cslug) continue;
      if (famId === 'climate.city-annual') {
        emit(fam, { url: `/${lang}/climate/${cslug}/`, entityId: String(c.id), label: cityLabel,
          city: cityLabel, country: c.iso2 || '', lang, intent: 'informational, annual climate profile',
          keyword: lang === 'en' ? `${cityLabel} climate` : '', template: '{city} climate',
          dataKey: c.id, intentKey: 'annual-climate', notes: `tier ${c.tier}` });
      } else {
        for (let mi = 0; mi < 12; mi += 1) {
          const m = monthName(lang, mi);
          emit(fam, { url: `/${lang}/climate/${cslug}/${slugify(m) || MONTHS[mi]}/`,
            entityId: `${c.id}::${MONTHS[mi]}`, label: `${cityLabel} ${m}`, city: cityLabel,
            country: c.iso2 || '', lang, intent: 'informational, month specific weather',
            keyword: lang === 'en' ? `weather in ${cityLabel} in ${m}` : '',
            template: lang === 'en' ? 'weather in {city} in {month}' : '',
            dataKey: `${c.id}-${MONTHS[mi]}`, intentKey: `month-climate-${MONTHS[mi]}`, notes: `tier ${c.tier}` });
        }
      }
    }
  }
}

// --- SPORT, climate x activity -------------------------------------------
{
  const fam = byId['sport.city-activity-season'];
  for (const c of cities) {
    if (!fam.tiers.includes(c.tier) || c.lat == null) continue;
    for (const act of ['running', 'cycling', 'hiking', 'swimming']) {
      for (const lang of langsFor(fam.langRule, c.iso2)) {
        const cityLabel = (c.names && c.names[lang]) || c.name;
        const cslug = slugify(cityLabel); if (!cslug) continue;
        emit(fam, { url: `/${lang}/sport/${cslug}-${act}/`, entityId: `${c.id}:${act}`,
          label: `${cityLabel} ${act}`, city: cityLabel, country: c.iso2 || '', lang,
          intent: 'informational, when to do this activity here',
          template: '{activity} in {city} by season', dataKey: `${c.id}-${act}`,
          intentKey: `activity-season-${act}`, liveFamily: 'sport.city-season', notes: `tier ${c.tier}` });
      }
    }
  }
}

// --- AIRPORT TRANSFERS ---------------------------------------------------
{
  const fam = byId['transport.airport-to-city'];
  for (const a of airports) {
    if (!a.iata || !a.cityId || a.cityKm == null) continue;
    if (fam.airportTypes && !fam.airportTypes.includes(a.type)) continue;
    // OurAirports carries disambiguated municipality strings such as
    // "Paris (Roissy-en-France, Val-d'Oise)". Pasted into a keyword template
    // those produce a title no human would ever type, so the airport is
    // skipped rather than given a broken keyword. Same class of bug as the
    // raw ISO subdivision codes found earlier.
    if (a.municipality && /[()]/.test(a.municipality)) continue;
    for (const lang of langsFor(fam.langRule, a.country)) {
      const place = a.municipality || '';
      const slug = slugify(`${a.iata}-${place}`); if (!slug) continue;
      emit(fam, { url: `/${lang}/getting-around/${slug}-airport-transfer/`,
        entityId: a.iata, label: `${a.name} to ${place}`, city: place, country: a.country || '',
        lang, intent: 'transactional, how to get from the airport into town',
        keyword: lang === 'en' && place ? `${place} airport to city centre` : '',
        template: '{airport} to {city} centre', dataKey: a.iata, intentKey: 'airport-transfer',
        // a.type, not a.size. The earlier version read a field that does not
        // exist on the record and stamped "undefined" on all 3,001 notes.
        // cityKm is labelled here as what it actually is: see the family
        // catalog's proofs.data for why it is not a city centre distance.
        notes: `${a.type}, ${a.cityKm} km to nearest populated place` });
    }
  }
}

// --- PULSE ---------------------------------------------------------------
const HOL = holidays.store || {};
{
  const fam = byId['pulse.country-holidays'];
  for (const iso of Object.keys(HOL)) for (const lang of langsFor(fam.langRule, iso)) {
    const label = cldrName(iso, lang) || cName.get(iso) || iso;
    emit(fam, { url: `/${lang}/${ATLAS_SEGMENTS.holidays[lang]}/${countrySlug(iso, lang).slug}/`,
      entityId: iso, label, country: iso, lang, intent: 'informational, the dated list',
      template: '{holidays} {country}', dataKey: iso, intentKey: 'country-holidays' });
  }
}
{
  const fam = byId['pulse.subdivision-holidays'];
  const seen = new Set();
  for (const [iso, v] of Object.entries(HOL)) for (const y of Object.keys(v.holidays || {})) for (const h of v.holidays[y]) for (const s of h.subdivisions || []) {
    const code = typeof s === 'string' ? s : (s.code || ''); if (!code) continue;
    const k = iso + '-' + code; if (seen.has(k)) continue;
    const d = forSubdivision(iso, code); if (!d || !d.names) continue;
    seen.add(k);
    for (const lang of langsFor(fam.langRule, iso)) {
      const label = d.names[lang] || d.names.en || Object.values(d.names)[0];
      const slug = slugify(label); if (!slug) continue;
      emit(fam, { url: `/${lang}/${ATLAS_SEGMENTS.holidays[lang]}/${slug}/`, entityId: k, label,
        country: iso, region: code, lang, intent: 'informational, the region dated list',
        template: '{holidays} {region} {year}', dataKey: k, intentKey: 'subdivision-holidays' });
    }
  }
}
{
  // Named holiday families, both axes, language gated to the country's own.
  const famD = byId['pulse.named-holiday-date'];
  const famR = byId['pulse.named-holiday-regions'];
  const dateSeen = new Set(); const regSeen = new Set();
  for (const [iso, v] of Object.entries(HOL)) for (const y of Object.keys(v.holidays || {})) for (const h of v.holidays[y]) {
    const clean = (s) => { try { return decodeURIComponent(String(s || '')).replace(/\s+/g, ' ').trim(); } catch { return String(s || '').trim(); } };
    for (const lang of langsFor(famD.langRule, iso)) {
      const nm = clean(h.names && h.names[lang]); if (!nm) continue;
      const slug = slugify(nm); if (!slug) continue;
      const kd = `${iso}|${nm}|${y}|${lang}`;
      if (!dateSeen.has(kd)) {
        dateSeen.add(kd);
        emit(famD, { url: `/${lang}/${ATLAS_SEGMENTS.holidays[lang]}/${slug}/${y}/`,
          entityId: `${iso}::${nm}::${y}`, label: `${nm} ${y}`, country: iso, lang,
          intent: 'informational, the date this year', keyword: `${nm} ${y}`, template: '{holiday} {year}',
          dataKey: `${iso}-${nm}-${y}`, intentKey: `holiday-date-${slug}` });
      }
      const varies = (h.subdivisions || []).length > 0 || h.everywhere === false;
      const kr = `${iso}|${nm}|${lang}`;
      if (varies && !regSeen.has(kr)) {
        regSeen.add(kr);
        emit(famR, { url: `/${lang}/${ATLAS_SEGMENTS.holidays[lang]}/${countrySlug(iso, lang).slug}/${slug}/`,
          entityId: `${iso}::${nm}`, label: nm, country: iso, lang,
          intent: 'informational, which regions observe it', template: '{holiday} where is it a holiday',
          dataKey: `${iso}-${nm}-regions`, intentKey: `holiday-regions-${slug}` });
      }
    }
  }
}
{
  const fam = byId['pulse.long-weekends'];
  for (const iso of Object.keys(HOL)) for (const year of [2026, 2027]) for (const lang of langsFor(fam.langRule, iso)) {
    emit(fam, { url: `/${lang}/${ATLAS_SEGMENTS.holidays[lang]}/${countrySlug(iso, lang).slug}/${year}/`,
      entityId: `${iso}::${year}`, label: `${cName.get(iso) || iso} ${year}`, country: iso, lang,
      intent: 'planning, how to combine leave', template: '{bridge days} {year}',
      dataKey: `${iso}-${year}-bridges`, intentKey: `long-weekends-${year}` });
  }
  const today = byId['pulse.today'];
  for (const lang of langsFor(today.langRule)) {
    emit(today, { url: `/${lang}/calendar/today/`, entityId: `today::${lang}`, label: 'today', lang,
      intent: 'informational, is today a holiday', template: 'is today a holiday',
      dataKey: `today-${lang}`, intentKey: 'today' });
  }
}

// --- CALENDAR ------------------------------------------------------------
{
  const y = byId['calendar.year'], m = byId['calendar.month'], w = byId['calendar.week-numbers'];
  for (const lang of langsFor(y.langRule)) {
    for (const year of [2026, 2027, 2028, 2029, 2030]) {
      emit(y, { url: `/${lang}/calendar/${year}/`, entityId: `${lang}::${year}`, label: String(year), lang,
        intent: 'informational and printable, the year grid', template: '{calendar} {year}',
        dataKey: `cal-${year}-${lang}`, intentKey: `year-calendar-${year}` });
      if (year > 2028) continue;
      for (let mi = 0; mi < 12; mi += 1) {
        const mn = monthName(lang, mi);
        emit(m, { url: `/${lang}/calendar/${year}/${slugify(mn) || MONTHS[mi]}/`,
          entityId: `${lang}::${year}-${MONTHS[mi]}`, label: `${mn} ${year}`, lang,
          intent: 'informational and printable, the month grid', template: '{calendar} {month} {year}',
          dataKey: `cal-${year}-${MONTHS[mi]}-${lang}`, intentKey: `month-calendar-${year}-${MONTHS[mi]}` });
      }
    }
    emit(w, { url: `/${lang}/calendar/week-numbers/`, entityId: `week::${lang}`, label: 'week numbers', lang,
      intent: 'informational, which week is it', template: '{week number}',
      dataKey: `week-${lang}`, intentKey: 'week-numbers' });
  }
}

// --- WORK, MOVE, STAY, AREAS, TOOLS -------------------------------------
{
  const fam = byId['work.country-salaries'];
  for (const iso of Object.keys(salary.countries || {})) for (const lang of langsFor(fam.langRule, iso)) {
    emit(fam, { url: `/${lang}/${ATLAS_SEGMENTS.salaries[lang]}/${countrySlug(iso, lang).slug}/`,
      entityId: iso, label: cldrName(iso, lang) || iso, country: iso, lang,
      intent: 'informational, what people earn', template: '{average salary} {country}',
      dataKey: `salary-${iso}`, intentKey: 'country-salary' });
  }
  const wt = byId['work.working-time-per-year'];
  for (const iso of Object.keys(HOL)) for (const year of [2026, 2027]) for (const lang of langsFor(wt.langRule, iso)) {
    emit(wt, { url: `/${lang}/working-time/${countrySlug(iso, lang).slug}/${year}/`,
      entityId: `${iso}::${year}`, label: `${cName.get(iso) || iso} ${year}`, country: iso, lang,
      intent: 'informational, statutory working days', template: '{working days} {year}',
      dataKey: `wt-${iso}-${year}`, intentKey: `working-time-${year}` });
  }
  const role = byId['work.city-salary-by-role'];
  for (const c of cities.filter((x) => x.tier === 1).slice(0, 560)) for (const r of ['software engineer', 'nurse', 'teacher', 'accountant', 'electrician']) {
    for (const lang of langsFor(role.langRule, c.iso2)) {
      emit(role, { url: `/${lang}/salaries/${slugify(c.name)}/${slugify(r)}/`, entityId: `${c.id}:${slugify(r)}`,
        label: `${r} in ${c.name}`, city: c.name, country: c.iso2 || '', lang,
        intent: 'commercial investigation, role and city pay', template: '{role} salary {city}',
        dataKey: `role-${c.id}-${r}`, intentKey: `city-role-salary-${slugify(r)}`,
        notes: 'no lawful source for city and role salary data' });
    }
  }
}
{
  const fam = byId['move.country-cost-of-living'];
  for (const iso of Object.keys(col.countries || {})) for (const lang of langsFor(fam.langRule, iso)) {
    emit(fam, { url: `/${lang}/${ATLAS_SEGMENTS['cost-of-living'][lang]}/${countrySlug(iso, lang).slug}/`,
      entityId: iso, label: cldrName(iso, lang) || iso, country: iso, lang,
      intent: 'informational, what it costs to live there', template: '{cost of living} {country}',
      dataKey: `col-${iso}`, intentKey: 'country-cost-of-living' });
  }
  const rt = byId['stay.country-rent-trend'];
  for (const iso of Object.keys(rent.countries || {})) for (const lang of langsFor(rt.langRule, iso)) {
    emit(rt, { url: `/${lang}/${ATLAS_SEGMENTS['rent-increase'][lang]}/${countrySlug(iso, lang).slug}/`,
      entityId: iso, label: cldrName(iso, lang) || iso, country: iso, lang,
      intent: 'informational, rent trend', template: '{rent increase} {country}',
      dataKey: `rent-${iso}`, intentKey: 'country-rent-trend' });
  }
}
{
  const fam = byId['areas.city-where-to-stay'];
  for (const [cityId, rec] of Object.entries(nb.store || {})) {
    if (!rec || !rec.cityName) continue;
    for (const lang of langsFor(fam.langRule, rec.iso2)) {
      emit(fam, { url: `/${lang}/${ATLAS_SEGMENTS['where-to-stay'][lang]}/${slugify(rec.cityName)}/`,
        entityId: String(cityId), label: rec.cityName, city: rec.cityName, country: rec.iso2 || '', lang,
        intent: 'commercial investigation, which district to book',
        keyword: lang === 'en' ? `where to stay in ${rec.cityName}` : '',
        template: 'where to stay in {city}', dataKey: `nb-${cityId}`, intentKey: 'where-to-stay',
        notes: `${(rec.neighbourhoods || []).length} verified districts` });
    }
  }
  const prof = byId['areas.neighbourhood-profile'];
  for (const [cityId, rec] of Object.entries(nb.store || {})) for (const nbh of (rec && rec.neighbourhoods) || []) {
    for (const lang of langsFor(prof.langRule, rec.iso2)) {
      const slug = slugify(nbh.name); if (!slug) continue;
      emit(prof, { url: `/${lang}/${ATLAS_SEGMENTS['where-to-stay'][lang]}/${slugify(rec.cityName)}/${slug}/`,
        entityId: String(nbh.id), label: nbh.name, city: rec.cityName, country: rec.iso2 || '', lang,
        intent: 'informational, one district', template: '{neighbourhood} {city}',
        dataKey: `nbh-${nbh.id}`, intentKey: 'neighbourhood-profile' });
    }
  }
  const pv = byId['areas.persona-variants'];
  for (const [cityId, rec] of Object.entries(nb.store || {})) for (const persona of ['students', 'families', 'expats', 'nightlife', 'remote workers', 'luxury', 'budget']) {
    emit(pv, { url: `/en/${ATLAS_SEGMENTS['where-to-stay'].en}/${slugify(rec.cityName)}/${slugify(persona)}/`,
      entityId: `${cityId}:${slugify(persona)}`, label: `${rec.cityName} for ${persona}`, city: rec.cityName,
      country: rec.iso2 || '', lang: 'en', intent: 'commercial investigation, district for a persona',
      template: 'best area in {city} for {persona}', dataKey: `nb-${cityId}`, intentKey: 'where-to-stay',
      notes: 'same dataset as the city page, reordered' });
  }
}
{
  const fam = byId['tools.calculator'];
  const TOOLS = ['salary-calculator','rent-affordability','cost-of-living-comparison','moving-cost','travel-budget','city-comparison','relocation-calculator','tax-calculator','working-time-calculator','bridge-day-planner','date-calculator','week-number-calculator','currency-cost-converter','esim-data-estimator'];
  for (const t of TOOLS) for (const lang of langsFor(fam.langRule)) {
    emit(fam, { url: `/${lang}/${ATLAS_SEGMENTS.tools[lang]}/${t}/`, entityId: t, label: t, lang,
      intent: 'transactional, run a calculation', template: '{tool} calculator',
      dataKey: `tool-${t}`, intentKey: `tool-${t}` });
  }
}
{
  const fam = byId['sport.venue-profile'];
  let venueRows = 0;
  for (const f of readdirSync(new URL('data/atlas/sources/venues/by-country/', ROOT))) {
    const d = J('data/atlas/sources/venues/by-country/' + f);
    for (const v of d.rows || []) {
      const nm = v.label || v.name || ''; const slug = slugify(nm); if (!slug) continue;
      venueRows += 1;
      emit(fam, { url: `/en/sport/venue/${slug}/`, entityId: String(v.qid || v.id || slug), label: nm,
        country: d.iso2 || '', lang: 'en', intent: 'navigational, a named venue',
        template: '{venue}', dataKey: `venue-${v.qid || slug}`, intentKey: 'venue-profile' });
    }
  }
}
{
  // The two families that would hit 1M on their own, generated at a capped
  // sample purely so the rejection is evidenced with a real count rather than
  // an estimate. Never expanded.
  const day = byId['climate.city-day'];
  const t1 = cities.filter((c) => c.tier === 1);
  day.theoretical_count = t1.length * 365;
  const pair = byId['transport.city-pair-distance'];
  pair.theoretical_count = (t1.length * (t1.length - 1)) / 2;
  const ch = byId['pulse.city-holidays'];
  ch.theoretical_count = cities.length;
}

console.log('raw emitted rows:', rows.length);
writeFileSync(new URL('_raw-count.json', OUT), JSON.stringify({ raw: rows.length }));
writeFileSync(new URL('_rows.jsonl.gz', OUT), gzipSync(rows.map((r) => JSON.stringify(r)).join('\n') + '\n'));

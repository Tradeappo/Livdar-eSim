// Cohort 004: up to 5,000 more city weather pages, built by the Cohort 003 rules and checked
// against everything already live.
//
//   node scripts/atlas/build-cohort-004.mjs            report only
//   node scripts/atlas/build-cohort-004.mjs --write    write data/atlas/cohorts/cohort-004.json
//
// WHY THIS FAMILY AGAIN. It is still the only renderable family with unpublished inventory
// (25,665 FINAL rows after Cohort 003), and it is the family Google accepts: on 2026-10-24,
// 487 of the 488 Cohort 003 pages Google had crawled were indexed. Every other FINAL family
// needs a page builder first.
//
// THE RULES ARE COHORT 003'S, UNCHANGED (see scripts/atlas/build-cohort-003.mjs on the
// working branch for the full reasoning): the manifest admitted the row; twelve months of
// normals; the model builds; title and description inside their bounds; the word floor; one
// page per city per language; a unique title per language; the path is not already live; not a
// near duplicate of a kept page. Three rules are added, none of them relaxations:
//
//   10. no Italian: atlas-pages-it-climate.xml has not been re-read by Google since
//       2026-10-20, before Cohort 003 went live, and Italian stays out until it has been
//   11. no city that already has a legacy city-month page in the same language
//       (/en/cities/<city>/weather-in-<month>/, /de/staedte/...): two pages answering the same
//       city's weather in one language would compete
//   12. the near duplicate gate also compares against every LIVE page of the family in the same
//       language (Cohort 003), not only against the pages of this cohort, and a title must be
//       unique against the live titles too
//   13. one city per path: where two cities slug to the same path, the first by priority keeps it
//   14. the entity audit (scripts/atlas/audit-entities.mjs, the same one the test suite runs on
//       every published page) passes on the page before it can be selected
//
// THE ALLOCATION. Up to 5,000, across the eight languages, in proportion to each language's
// eligible pool weighted by how Google treated that language in Cohort 003 (the share of its
// Cohort 003 pages crawled by 2026-10-24), floor 100 so every language returns a readable
// signal, never more than the eligible pool. The weights are measured, written below, and
// change nothing about which page passes the gates.

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { build, words, PACKS } from '../../lib/atlas/atlas-model.js';
import { atlasPath, clusterKey } from '../../lib/atlas/atlas-urls.js';
import { forCity as climateForCity } from '../../lib/atlas/climate.js';
import { FAMILIES } from '../../lib/atlas/verticals.js';
import { pages as publishedPages } from '../../lib/atlas/serve-pages.js';
import { NEAR_DUPLICATE_AT } from '../../lib/atlas/similarity-scale.js';
import { localCityName } from '../../lib/atlas/cities.js';
import { run as auditEntities } from './audit-entities.mjs';
import { tmpdir } from 'node:os';

// THE PAGE'S OWN QUERY, AND WHAT IS AND IS NOT MEASURED ABOUT IT. The candidate
// rows carry one measured keyword per market for the whole family (`wetter rom`
// on every German row, `clima segovia` on every Spanish one), which is evidence
// that the query PATTERN is searched in that market and nothing about any one
// city. Putting that keyword on a thousand pages told the entity audit that the
// Munich page was about Rome, and it was right to fail it. So each page carries
// the query it answers, built in the shape the market's measured example has,
// with no volume: these pages qualify on utility, the measured example is kept
// beside them as pattern evidence, and no number is attributed to a page that
// nobody measured.
const QUERY = {
  en: (c) => c + ' weather', de: (c) => 'wetter ' + c, es: (c) => 'clima ' + c,
  fr: (c) => 'meteo ' + c, it: (c) => 'clima ' + c, nl: (c) => 'weer ' + c,
  pl: (c) => 'klimat ' + c, pt: (c) => 'clima ' + c, ja: (c) => c + ' 天気',
};
const queryFor = (cityId, lang) => {
  const name = localCityName(cityId, lang);
  return name && QUERY[lang] ? QUERY[lang](lang === 'ja' ? name : name.toLowerCase()) : '';
};

const ROOT = new URL('../../', import.meta.url);

// The legacy city-month pages (lib/atlas/model.js), as city slug per language, read from the
// live child sitemaps atlas-en-city-month-1.xml and atlas-de-city-month-1.xml on 2026-10-24:
// 123 URLs over these 13 city and language pairs. They are outside the cohort manifests, so
// they are listed here rather than derived.
const LEGACY_CITY_MONTH = ['de|amsterdam', 'de|athen', 'de|london', 'de|paris', 'de|rom', 'de|tokio',
  'en|amsterdam', 'en|athens', 'en|london', 'en|paris', 'en|prague', 'en|rome', 'en|tokyo'];
const legacyCityMonth = () => LEGACY_CITY_MONTH.map((x) => { const [lang, city] = x.split('|'); return { lang, city }; });
const SITE = 'https://livdar.com';
const FAMILY = 'weather.city-month';
const TARGET = Number((process.argv.find((a) => a.startsWith('--target=')) || '').split('=')[1]) || 5000;
const COHORT = '004';
const EXCLUDED_LANGUAGES = new Set(['it']);
// Share of each language's Cohort 003 pages that Google had crawled by the inspection of
// 2026-10-24 15:22 to 16:02 UTC (run 40106659627): crawled / published.
const COHORT_003_CRAWLED_SHARE = { de: 21 / 43, en: 124 / 203, es: 76 / 203, fr: 96 / 147, ja: 55 / 72, nl: 27 / 111, pl: 34 / 77, pt: 36 / 101 };
const FLOOR = 100;
const LENGTH_BOUNDS = { default: { title: [25, 75], description: [70, 190] }, ja: { title: [12, 42], description: [40, 110] } };
const PARTS = 'reports/livdar-expiry-freeze-2026-09-30/LIVDAR-1M-CANDIDATE-MANIFEST.parts/';

// The candidate rows for this family, out of the sharded manifest.
async function candidates() {
  const dir = new URL(PARTS, ROOT);
  const out = [];
  for (const f of readdirSync(dir).filter((x) => /^part-\d+\.csv\.gz$/.test(x)).sort()) {
    const rl = createInterface({ input: createReadStream(new URL(f, dir)).pipe(createGunzip()), crlfDelay: Infinity });
    let head = null;
    for await (const line of rl) {
      if (!line.trim()) continue;
      const cells = parseCsv(line);
      if (!head) { head = cells; continue; }
      const r = {};
      head.forEach((h, i) => { r[h] = cells[i]; });
      if (r.family === FAMILY) out.push(r);
    }
  }
  return out;
}

// A CSV line, quoted fields included. Small on purpose: the manifest is written
// by this repository and its quoting is the standard one.
function parseCsv(line) {
  const out = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

// Shingle similarity, the same measure cohort QA uses, so a page that would
// fail there is refused here instead of being written and then rejected.
function shingles(text) {
  const w = String(text).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  const s = new Set();
  for (let i = 0; i + 2 < w.length; i++) s.add(w[i] + ' ' + w[i + 1] + ' ' + w[i + 2]);
  return s;
}
function jaccard(a, b) {
  let hit = 0;
  for (const x of a) if (b.has(x)) hit++;
  return hit / (a.size + b.size - hit || 1);
}

export async function run() {
  const rows = await candidates();
  // Cohorts 001 to 003 only: a previous build of this cohort, once registered in serve-pages.js,
  // must not count as live, or every rebuild would exclude the last one and pick a different set.
  const published = publishedPages().filter((p) => String(p.cohort) !== COHORT);
  const live = new Set(published.map((p) => p.path));
  const liveCityLang = new Set(published.filter((p) => p.family === FAMILY).map((p) => p.entity + '|' + p.locale));
  // The legacy city-month pages, by the city name they are built on. They live outside the
  // cohort manifests (lib/atlas/hub.js), so the rule reads their published list.
  const legacyCityLang = new Set(legacyCityMonth().map((x) => x.lang + '|' + x.city.toLowerCase()));
  // Every live page of this family, as a signature per language, so a new page is refused if it
  // is a near duplicate of a page that is already live.
  const liveSigs = published.filter((p) => p.family === FAMILY)
    .map((p) => ({ lang: p.locale, set: shingles([p.title, p.description, ...(p.paragraphs || [])].join(' ')) }));
  const rej = {};
  const bump = (k) => { rej[k] = (rej[k] || 0) + 1; };
  const kept = [];
  const seenCityLang = new Set();
  // Seeded with every live title, so a new page never repeats a title that is already live in
  // its language (two cities of the same name in different countries would otherwise collide).
  const seenTitle = new Set(published.map((p) => p.locale + '|' + p.title));

  for (const r of rows) {
    const lang = r.language;
    if (EXCLUDED_LANGUAGES.has(lang)) { bump('language held out: ' + lang); continue; }
    if (!PACKS[lang]) { bump('no copy pack for this language'); continue; }
    const key = r.entity_id + '|' + lang;
    if (seenCityLang.has(key)) { bump('a second row for the same city in the same language'); continue; }
    const d = climateForCity(r.entity_id);
    if (!d) { bump('no climate normals for this city'); continue; }
    if (!d.months || d.months.length !== 12) { bump('fewer than twelve months of normals'); continue; }
    const page = {
      family: FAMILY, surface: 'climate', vertical: 'weather', entity: r.entity_id,
      market: r.market, language: lang, keyword: queryFor(r.entity_id, lang),
      patternKeyword: r.primary_keyword_if_known || null,
      minWords: FAMILIES[FAMILY].minWords || 250,
    };
    const a = atlasPath(page);
    if (!a) { bump('no URL could be built for this language'); continue; }
    page.path = a.path;
    page.slugFrom = a.from || a.slugFrom || 'city-name';
    if (live.has(a.path)) { bump('already published in a live cohort'); continue; }
    if (liveCityLang.has(r.entity_id + '|' + lang)) { bump('the city already has a live page of this family in this language'); continue; }
    if (legacyCityLang.has(lang + '|' + (localCityName(r.entity_id, lang) || '').toLowerCase())) { bump('a legacy city-month page covers this city in this language'); continue; }
    const m = build(page);
    if (m.refused) { bump('the model refused: ' + m.refused.split(' for ')[0]); continue; }
    const b = LENGTH_BOUNDS[lang] || LENGTH_BOUNDS.default;
    if (m.title.length < b.title[0] || m.title.length > b.title[1]) { bump('title outside its length bounds'); continue; }
    if (m.description.length < b.description[0] || m.description.length > b.description[1]) { bump('description outside its length bounds'); continue; }
    // The repository refuses U+2010 to U+2015 and U+2212 everywhere (cohort QA "no long dashes").
    // A few city names carry one; such a page is refused, never edited.
    if (/[\u2010-\u2015\u2212]/.test(JSON.stringify(m))) { bump('contains a long dash'); continue; }
    const w = words(m);
    const floor = lang === 'ja' ? 320 : (FAMILIES[FAMILY].minWords || 250);
    if (w.count < floor) { bump('below the word floor'); continue; }
    const tkey = lang + '|' + m.title;
    if (seenTitle.has(tkey)) { bump('its title is already taken in this language'); continue; }
    seenCityLang.add(key); seenTitle.add(tkey);
    kept.push({ r, page, m, a, iso2: d.iso2, score: Number(r.publication_priority || 0) });
  }

  // The entity audit, run on every surviving candidate at once. A page whose H1, title, slug,
  // body or structured data does not name its own entity is refused here rather than found by the
  // test suite after it has been written.
  {
    const tmp = tmpdir() + '/cohort-' + COHORT + '-candidates-' + process.pid + '.json';
    writeFileSync(tmp, JSON.stringify({ pages: kept.map((k) => ({ ...k.m, path: k.a.path, canonical: SITE + k.a.path,
      locale: k.page.language, family: FAMILY, entity: k.page.entity, keyword: k.page.keyword, market: k.r.market })) }));
    const bad = new Set(auditEntities({ manifests: [tmp] }).rows.filter((x) => x.problems.length).map((x) => x.path));
    for (let i = kept.length - 1; i >= 0; i--) {
      if (bad.has(kept[i].a.path)) { bump('fails the entity audit'); kept.splice(i, 1); }
    }
  }

  // THE ORDER, AND WHY IT IS NOT ONE GLOBAL RANKING. Sorting the whole pool by
  // the manifest's publication priority put 969 of the first thousand in one
  // language, because that score is comparable within a market and not across
  // them. A cohort like that cannot answer the question the cohort exists to
  // answer: it would measure Japanese indexation and say nothing about the
  // other eight languages the site publishes in.
  //
  // So the thousand is allocated ACROSS languages first and ranked within them
  // second. The share of each language is its share of the eligible pool, by
  // largest remainder, with a floor of forty so a small pool still returns a
  // readable signal and a ceiling of two hundred so a large one cannot take
  // over. Both bounds are stated here rather than tuned quietly.
  const byLang = new Map();
  for (const k of kept) {
    if (!byLang.has(k.page.language)) byLang.set(k.page.language, []);
    byLang.get(k.page.language).push(k);
  }
  const perCountry = new Map();
  for (const k of kept) perCountry.set(k.iso2, (perCountry.get(k.iso2) || 0) + 1);
  // Within a language: the manifest's own priority, then the country with more
  // cities in the pool so the link blocks come out dense rather than every city
  // being the only one of its country, then the path so a run repeats exactly.
  for (const list of byLang.values()) {
    list.sort((x, y) => (y.score - x.score)
      || ((perCountry.get(y.iso2) || 0) - (perCountry.get(x.iso2) || 0))
      || x.a.path.localeCompare(y.a.path));
  }
  const langs = [...byLang.keys()].sort();
  const pool = kept.length;
  const weight = new Map(langs.map((l) => [l, byLang.get(l).length * (COHORT_003_CRAWLED_SHARE[l] || 0)]));
  const wsum = [...weight.values()].reduce((x, y) => x + y, 0) || 1;
  const quota = new Map();
  for (const l of langs) {
    const want = Math.round((weight.get(l) / wsum) * TARGET);
    quota.set(l, Math.min(byLang.get(l).length, Math.max(FLOOR, want)));
  }

  // A COMPLETE HREFLANG CLUSTER FIRST. A page whose city also has an English page
  // in the cohort carries reciprocal alternates and an x-default that points at
  // a real page; a page whose city has none carries neither, because nominating
  // an arbitrary language as the default would be wrong. So inside each other
  // language the cities English also took come first, in their priority order,
  // and the rest follow in theirs. English is ranked on its own and never looks
  // at the others, so this cannot loop, and it reruns to the same thousand.
  const enList = byLang.get('en') || [];
  const enTaken = new Set(enList.slice(0, quota.get('en') || 0).map((k) => k.page.entity));
  for (const l of langs) {
    if (l === 'en') continue;
    const list = byLang.get(l);
    const rank = new Map(list.map((k, i) => [k, i]));
    list.sort((x, y) => (Number(enTaken.has(y.page.entity)) - Number(enTaken.has(x.page.entity))) || (rank.get(x) - rank.get(y)));
  }

  // The near duplicate gate, applied as pages are taken rather than after, so
  // the thousandth page is the thousandth page that passed it. Round robin
  // across the languages, so a language whose quota cannot be filled gives its
  // remainder to the others instead of leaving the cohort short.
  const picked = [];
  const pickedPaths = new Set();
  const sigs = liveSigs.slice();
  const at = new Map(langs.map((l) => [l, 0]));
  const taken = new Map(langs.map((l) => [l, 0]));
  let dupes = 0;
  const tryOne = (l, limit) => {
    const list = byLang.get(l);
    while (at.get(l) < list.length) {
      const k = list[at.get(l)];
      at.set(l, at.get(l) + 1);
      if (taken.get(l) >= limit) return false;
      // Two cities can slug to the same path in one language (Vitoria and Vitória, two
      // Fayettevilles). The first by priority keeps it; the other is refused, never renamed here.
      if (pickedPaths.has(k.a.path)) { bump('its path is already taken by another city'); continue; }
      const sh = shingles([k.m.title, k.m.description, ...(k.m.paragraphs || [])].join(' '));
      // Compared against the pages of the same language only: two languages
      // share no trigrams and comparing them is work that cannot find anything.
      let dup = false;
      for (const s of sigs) {
        if (s.lang !== l) continue;
        if (jaccard(sh, s.set) >= NEAR_DUPLICATE_AT) { dup = true; break; }
      }
      if (dup) { dupes++; bump('too similar to a page already taken'); continue; }
      sigs.push({ lang: l, set: sh });
      taken.set(l, taken.get(l) + 1);
      picked.push(k);
      pickedPaths.add(k.a.path);
      return true;
    }
    return false;
  };
  let progress = true;
  while (picked.length < TARGET && progress) {
    progress = false;
    for (const l of langs) {
      if (picked.length >= TARGET) break;
      if (tryOne(l, quota.get(l))) progress = true;
    }
  }
  // Anything still short is filled by raising every quota, which only happens
  // when a language ran out of pages that are not near duplicates of each other.
  if (picked.length < TARGET) {
    progress = true;
    while (picked.length < TARGET && progress) {
      progress = false;
      for (const l of langs) {
        if (picked.length >= TARGET) break;
        if (tryOne(l, Infinity)) progress = true;
      }
    }
  }

  return {
    rows: rows.length,
    eligible: kept.length,
    picked,
    rejections: rej,
    nearDuplicatesRefused: dupes,
    allocation: Object.fromEntries(langs.map((l) => [l, { eligible: byLang.get(l).length, quota: quota.get(l), taken: taken.get(l) }])),
    allocationRule: 'eligible pool x Cohort 003 crawled share, floor ' + FLOOR + ', capped at the eligible pool, round robin so an unfilled quota passes to the others',
    nearDuplicateThreshold: NEAR_DUPLICATE_AT,
  };
}

const out = await run();
const byLang = {}; const byMarket = {}; const byCountry = {};
for (const k of out.picked) {
  byLang[k.page.language] = (byLang[k.page.language] || 0) + 1;
  byMarket[k.r.market] = (byMarket[k.r.market] || 0) + 1;
  byCountry[k.iso2] = (byCountry[k.iso2] || 0) + 1;
}
const summary = {
  generatedAt: new Date().toISOString(),
  family: FAMILY,
  target: TARGET,
  candidateRows: out.rows,
  eligible: out.eligible,
  selected: out.picked.length,
  shortfall: Math.max(0, TARGET - out.picked.length),
  rejections: out.rejections,
  allocation: out.allocation,
  allocationRule: out.allocationRule,
  nearDuplicateThreshold: out.nearDuplicateThreshold,
  byLanguage: byLang,
  byMarket: byMarket,
  countries: Object.keys(byCountry).length,
  topCountries: Object.fromEntries(Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 20)),
};
console.log(JSON.stringify(summary, null, 1));

if (process.argv.includes('--write')) {
  const dir = new URL('data/atlas/cohorts/', ROOT);
  mkdirSync(dir, { recursive: true });
  // THE ALTERNATE SETS, built from the cohort rather than asserted per page.
  // One page per entity per language is the rule this family publishes under,
  // so most clusters hold exactly one page and its alternate set is itself.
  // Where a cluster does hold more than one language they must list each other,
  // and where it holds an English page it needs an x-default pointing at that
  // page: cohort QA checks both, and the first run of this writer failed 203
  // times on the second because every set was written as self only.
  const byCluster = new Map();
  for (const k of out.picked) {
    const c = clusterKey(k.page);
    if (!byCluster.has(c)) byCluster.set(c, []);
    byCluster.get(c).push(k);
  }
  const altsFor = (k) => {
    const members = byCluster.get(clusterKey(k.page)) || [k];
    const alts = members
      .map((x) => ({ hreflang: x.page.language, href: SITE + x.a.path }))
      .sort((a, b) => a.hreflang.localeCompare(b.hreflang));
    const english = members.find((x) => x.page.language === 'en');
    if (english) alts.push({ hreflang: 'x-default', href: SITE + english.a.path });
    return alts;
  };
  const pages = out.picked.map((k) => ({
    family: FAMILY, surface: 'climate', vertical: 'weather',
    priority: 'high',
    entity: k.page.entity, market: k.r.market, language: k.page.language,
    keyword: k.page.keyword, volume: null,
    demand: {
      basis: 'utility',
      perPageVolume: null,
      patternEvidence: { keyword: k.page.patternKeyword, market: k.r.market, meaning: 'one measured example of this query pattern in this market, not a measurement of this page' },
    },
    sources: ['climate-normals-verified'], dataSources: ['climate-normals-verified'],
    axis: 'language', band: 'utility',
    path: k.a.path, canonical: SITE + k.a.path,
    slugFrom: k.page.slugFrom, cluster: clusterKey(k.page),
    scope: FAMILIES[FAMILY].scope, minWords: FAMILIES[FAMILY].minWords || 250,
    indexPolicy: 'always', aeo: ['direct-answer', 'fact-table'],
    alternates: altsFor(k),
  }));
  writeFileSync(new URL('cohort-' + COHORT + '.json', dir), JSON.stringify({ ...summary, cohort: COHORT, pages }, null, 1) + '\n');
  console.error('wrote data/atlas/cohorts/cohort-' + COHORT + '.json with ' + pages.length + ' pages');
}

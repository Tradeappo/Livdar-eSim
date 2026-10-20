// Cohort 003: exactly 1,000 city weather pages, chosen and then checked.
//
//   node scripts/atlas/build-cohort-003.mjs            report only
//   node scripts/atlas/build-cohort-003.mjs --write    write the cohort files
//
// WHY THIS FAMILY AND NOT A BIGGER ONE. The 1,002,362 row candidate inventory
// is not publishable: there are thirteen page model builders in this repository
// and they are exactly the thirteen families already live, so everything else
// has a URL and no way to be served. Inside the renderable families there were
// twenty unpublished rows. weather.city-month is the family that could be made
// renderable honestly: every one of its 26,665 candidate rows carries keyword
// demand measured IN ITS OWN MARKET, which no other large family does, and its
// source was already captured, 64,418 cities of NASA POWER climatology sitting
// in shards that the gate had never been taught to read.
//
// WHAT THE LIVE EXPERIMENT CONTRIBUTES TO THE CHOICE, which is less than the
// brief hoped. Of the 500 live pages, zero are indexed, one has ever been
// crawled, and that crawl hit the ISR 500. So no family "indexes better" and
// nothing here is weighted by family or by language on live evidence, because
// there is none. The one live finding that does bear on this cohort is that
// discovery equals sitemap membership exactly - all 79 URLs Google calls
// unknown are the 79 it says are not in the sitemap - and that is a publishing
// defect to fix before launch rather than a reason to prefer one page over
// another.
//
// THE SELECTION RULES, in the order they are applied, each one counted:
//
//   1. the candidate manifest admitted the row          measured demand, in market
//   2. the city has twelve months of normals            the page has something to say
//   3. the model builds                                 no refusal
//   4. title and description inside the length bounds   per script, as cohort QA checks
//   5. at or above the word floor                       250, or 320 characters for ja
//   6. one page per city per language                   no cannibalisation inside the cohort
//   7. the title is unique in its language              no unresolved disambiguation
//   8. the path is not already published                the live 500 stay untouched
//   9. not a near duplicate of another kept page        the same gate cohort QA runs
//
// Then the survivors are ordered by a score that is published rather than
// implied, and the first thousand are taken.
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

const ROOT = new URL('../../', import.meta.url);
const SITE = 'https://livdar.com';
const FAMILY = 'weather.city-month';
const TARGET = 1000;
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
  const live = new Set(publishedPages().map((p) => p.path));
  const rej = {};
  const bump = (k) => { rej[k] = (rej[k] || 0) + 1; };
  const kept = [];
  const seenCityLang = new Set();
  const seenTitle = new Set();

  for (const r of rows) {
    const lang = r.language;
    if (!PACKS[lang]) { bump('no copy pack for this language'); continue; }
    const key = r.entity_id + '|' + lang;
    if (seenCityLang.has(key)) { bump('a second row for the same city in the same language'); continue; }
    const d = climateForCity(r.entity_id);
    if (!d) { bump('no climate normals for this city'); continue; }
    if (!d.months || d.months.length !== 12) { bump('fewer than twelve months of normals'); continue; }
    const page = {
      family: FAMILY, surface: 'climate', vertical: 'weather', entity: r.entity_id,
      market: r.market, language: lang, keyword: r.primary_keyword_if_known || '',
      minWords: FAMILIES[FAMILY].minWords || 250,
    };
    const a = atlasPath(page);
    if (!a) { bump('no URL could be built for this language'); continue; }
    page.path = a.path;
    page.slugFrom = a.from || a.slugFrom || 'city-name';
    if (live.has(a.path)) { bump('already published in a live cohort'); continue; }
    const m = build(page);
    if (m.refused) { bump('the model refused: ' + m.refused.split(' for ')[0]); continue; }
    const b = LENGTH_BOUNDS[lang] || LENGTH_BOUNDS.default;
    if (m.title.length < b.title[0] || m.title.length > b.title[1]) { bump('title outside its length bounds'); continue; }
    if (m.description.length < b.description[0] || m.description.length > b.description[1]) { bump('description outside its length bounds'); continue; }
    const w = words(m);
    const floor = lang === 'ja' ? 320 : (FAMILIES[FAMILY].minWords || 250);
    if (w.count < floor) { bump('below the word floor'); continue; }
    const tkey = lang + '|' + m.title;
    if (seenTitle.has(tkey)) { bump('its title is already taken in this language'); continue; }
    seenCityLang.add(key); seenTitle.add(tkey);
    kept.push({ r, page, m, a, iso2: d.iso2, score: Number(r.publication_priority || 0) });
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
  const FLOOR = 40;
  const CEILING = 200;
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
  const quota = new Map();
  for (const l of langs) {
    const want = Math.round((byLang.get(l).length / pool) * TARGET);
    quota.set(l, Math.max(FLOOR, Math.min(CEILING, Math.min(want, byLang.get(l).length))));
  }

  // The near duplicate gate, applied as pages are taken rather than after, so
  // the thousandth page is the thousandth page that passed it. Round robin
  // across the languages, so a language whose quota cannot be filled gives its
  // remainder to the others instead of leaving the cohort short.
  const picked = [];
  const sigs = [];
  const at = new Map(langs.map((l) => [l, 0]));
  const taken = new Map(langs.map((l) => [l, 0]));
  let dupes = 0;
  const tryOne = (l, limit) => {
    const list = byLang.get(l);
    while (at.get(l) < list.length) {
      const k = list[at.get(l)];
      at.set(l, at.get(l) + 1);
      if (taken.get(l) >= limit) return false;
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
    allocationRule: 'share of the eligible pool by largest remainder, floor ' + FLOOR + ', ceiling ' + CEILING + ', round robin so an unfilled quota passes to the others',
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
    keyword: k.page.keyword, volume: Number(k.r.search_volume || 0) || null,
    sources: ['climate-normals-verified'], dataSources: ['climate-normals-verified'],
    axis: 'language', band: 'measured',
    path: k.a.path, canonical: SITE + k.a.path,
    slugFrom: k.page.slugFrom, cluster: clusterKey(k.page),
    scope: FAMILIES[FAMILY].scope, minWords: FAMILIES[FAMILY].minWords || 250,
    indexPolicy: 'always', aeo: ['direct-answer', 'fact-table'],
    alternates: altsFor(k),
  }));
  writeFileSync(new URL('cohort-003.json', dir), JSON.stringify({ ...summary, cohort: '003', pages }, null, 1) + '\n');
  console.error('wrote data/atlas/cohorts/cohort-003.json with ' + pages.length + ' pages');
}

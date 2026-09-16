// The page plan, recomputed from the dataset on every run.
//
// THE FORMULA, in one sentence: a page exists when a single topic in a single
// market has at least PAGE_FLOOR measured searches a month behind it, and the
// market itself is one we publish in.
//
// Nothing here is hardcoded to hit a target number. Change PAGE_FLOOR or change
// a market's status and the total moves. That is the point: the total is an
// output of the research, never an input.
//
//   pages = SUM over published markets M of
//             1                                    home
//           + HUBS                                 structural hubs
//           + destinationPages(M)                  see destinationGetsPage()
//           + regionPages(M)                       see regionGetsPage()
//           + topicPages(M)                        one page per qualifying topic
//
// A topic is Ahrefs' parentTopic where the row carries one, and the keyword
// itself where it does not. Splitting a cluster into more topics can only lower
// the count, never raise it, because every topic must clear PAGE_FLOOR on its
// own. The plan errs towards too few pages, never too many.

import { writeFileSync } from 'node:fs';
import { loadUniverse, norm, sum, group } from './research-core.mjs';
import { DESTINATIONS, REGIONS } from '../lib/destinations.js';
import { contentLocales } from '../lib/content/index.js';
import { allPathsForLocale } from '../lib/resolve.js';
import { LOCALES } from '../lib/i18n.js';

// ---------------------------------------------------------------- constants

// Searches a month a single topic must carry before it earns a URL. One floor,
// applied to every page type, in every market, with no exceptions.
const PAGE_FLOOR = 500;

// Destination tiers, by measured volume summed across every market.
const TIER = { P1: 5000, P2: 1000, P3: 500 };

// Structural hubs every published market gets: esim, regions, guides, compare.
const HUBS = 4;

// Which markets we publish in, and why. Transcribed from the validated market
// research, not recomputed here, because the reasons are editorial and cannot
// be read off a volume column. Every exclusion carries the reason it was made.
const MARKET_POLICY = {
  'en-us': { publish: true, why: 'largest market, measured directly' },
  'en-gb': { publish: true, why: 'clean best esim for X matrix, post Brexit operators pulled the EU out of inclusive zones' },
  'de-de': { publish: true, why: 'EU roaming already inclusive, value sits outside the EU, Switzerland and Turkey carry it' },
  'ro-ro': { publish: true, why: 'smallest published market, confusion between data eSIM and a foreign number is the subject' },
  'ja-jp': { publish: true, why: 'dense trip duration tail, difficulty 0 to 5, easiest large market' },
  // Corrected against the measured rows by scripts/market-audit.mjs. The
  // earlier note here said the vocabulary is wang ka rather than eSIM, which
  // the data does not support: eSIM carries 129,080 a month against 42,560 for
  // wang ka, so eSIM leads roughly three to one. Wang ka is not the word, but
  // it is a real second and the destination pages have to serve it, because
  // 日本網卡 alone is 8,800 a month.
  'zh-Hant-tw': { publish: true, why: 'eSIM leads three to one, wang ka is a 42,560 a month second vocabulary the destination pages must also serve, domestic roaming block excluded' },
  'it-it': { publish: true, why: 'portable wifi is its own cluster here, not a footnote' },
  'es-es': { publish: true, why: 'large volume on north African destinations, Morocco above all' },
  'fr-fr': { publish: true, why: 'Morocco and Tunisia dominate' },
  'nl-nl': { publish: true, why: 'explanation outweighs the product, roaming aan of uit is the entry point' },
  'pl-pl': { publish: true, why: 'strong demand on Albania, Turkey, Egypt, holiday destinations outside the EU' },
  // Confirmed against the measured rows: chip carries 36,630 a month against
  // 20,530 for eSIM, and the single largest term in the market is chip
  // internacional at 12,000, which is not a destination phrase at all. Brazil
  // is entered through the product word, not through the country.
  'pt-br': { publish: true, why: 'the word is chip not eSIM by 36,630 to 20,530, chip internacional alone is 12,000 a month, its own destination set, no other market covers it' },
  'pt-pt': { publish: false, why: 'too small for its own market, served from Brazilian Portuguese' },
  'en-ae': { publish: false, why: 'Gulf searches in English, served from the English pages' },
  'en-sa': { publish: false, why: 'Gulf searches in English, served from the English pages' },
  'ar-ae': { publish: false, why: 'native Arabic phrasing exists but is small and mostly domestic operator promotion' },
  'ar-sa': { publish: false, why: 'native Arabic phrasing exists but is small and mostly domestic operator promotion' },
  'id-id': { publish: false, why: 'relevant volume comes from foreigners researching Bali, not from Indonesians leaving' },
  'tr-tr': { publish: false, why: 'same shape, the volume is inbound tourists, not Turkish outbound' },
  'ko-kr': { publish: false, why: 'native outbound tail close to nonexistent' },
  'ru-ru': { publish: false, why: 'one generic virtual number term, not eSIM' },
  // Foreign language typed inside a country we do not publish in. These rows are
  // real and stay in the dataset, but they describe visitors to that country,
  // not an audience we would write a market for. They are served, if at all, by
  // the pages of the language they were typed in.
  'en-tr': { publish: false, why: 'English typed in Turkey, inbound visitors, served from the English pages' },
  'de-tr': { publish: false, why: 'German typed in Turkey, inbound visitors, served from the German pages' },
  'fr-tr': { publish: false, why: 'French typed in Turkey, inbound visitors, served from the French pages' },
  'it-tr': { publish: false, why: 'Italian typed in Turkey, inbound visitors, served from the Italian pages' },
  'nl-tr': { publish: false, why: 'Dutch typed in Turkey, inbound visitors, served from the Dutch pages' },
  'pl-tr': { publish: false, why: 'Polish typed in Turkey, inbound visitors, served from the Polish pages' },
  'es-tr': { publish: false, why: 'Spanish typed in Turkey, inbound visitors, served from the Spanish pages' },
  'ru-tr': { publish: false, why: 'Russian typed in Turkey, and Russian is not a published market' },
  'en-id': { publish: false, why: 'English typed in Indonesia, the Bali researcher, served from the English pages' },
  'en-kr': { publish: false, why: 'English typed in Korea, inbound visitors, served from the English pages' },
  'ja-kr': { publish: false, why: 'Japanese typed in Korea, inbound visitors, served from the Japanese pages' },
};

// ---------------------------------------------------------------- the universe

const universe = loadUniverse();
const rows = universe.addressable;
const byMarket = {};
rows.forEach((k) => { (byMarket[k.market] = byMarket[k.market] || []).push(k); });

const published = Object.entries(MARKET_POLICY).filter(([, p]) => p.publish).map(([m]) => m);
const withheld = Object.entries(MARKET_POLICY).filter(([, p]) => !p.publish).map(([m, p]) => ({ market: m, why: p.why }));
const unpoliced = Object.keys(byMarket).filter((m) => !MARKET_POLICY[m]);

// ---------------------------------------------------------------- destinations

// A destination's name in any language, plus the exonyms the markets type.
const EXONYMS = {
  'united-states': ['usa', 'amerika', 'america', 'estados unidos', 'stati uniti', 'etats unis', 'アメリカ'],
  'united-kingdom': ['uk', 'england', 'grossbritannien', 'regno unito', 'reino unido', 'angleterre'],
  'united-arab-emirates': ['dubai', 'uae', 'emirate', 'emirati', 'emiratos'],
  'south-korea': ['korea', '韓国', '한국'],
  czechia: ['czech', 'tschechien', 'cehia'],
};

const namesFor = (d) => {
  const set = new Set([d.id.replace(/-/g, ' '), ...Object.values(d.names || {})].filter(Boolean).map(norm));
  (EXONYMS[d.id] || []).forEach((x) => set.add(norm(x)));
  return [...set].filter((n) => n.length > 2);
};

const matches = (kw, names) => { for (const n of names) if (kw.includes(n)) return true; return false; };

// volumeByDestination[id] = { total, byMarket: { 'en-us': v } }
const destVolume = {};
DESTINATIONS.forEach((d) => {
  const names = namesFor(d);
  const rec = { id: d.id, region: d.region, total: 0, keywords: 0, byMarket: {} };
  rows.forEach((k) => {
    if (!matches(norm(k.keyword), names)) return;
    rec.total += k.volume;
    rec.keywords += 1;
    rec.byMarket[k.market] = (rec.byMarket[k.market] || 0) + k.volume;
  });
  destVolume[d.id] = rec;
});

const tierOfDestination = (id) => {
  const v = destVolume[id].total;
  if (v >= TIER.P1) return 'P1';
  if (v >= TIER.P2) return 'P2';
  if (v >= TIER.P3) return 'P3';
  return 'P4';
};

// A destination earns a page in a market when it is a P1 or P2 anywhere, or
// when it is a P3 and that market is one of the markets actually asking for it.
const destinationGetsPage = (id, market) => {
  const t = tierOfDestination(id);
  if (t === 'P1' || t === 'P2') return true;
  if (t === 'P3') return (destVolume[id].byMarket[market] || 0) > 0;
  return false;
};

// ---------------------------------------------------------------- regions

// A region earns a page in a market when regional search exists in that market
// at all, and the region has destination pages there to hold together.
const regionalVolume = {};
rows.filter((k) => k.cluster === 'regional').forEach((k) => {
  regionalVolume[k.market] = (regionalVolume[k.market] || 0) + k.volume;
});

const regionGetsPage = (regionId, market) => {
  if ((regionalVolume[market] || 0) < PAGE_FLOOR) return false;
  return DESTINATIONS.some((d) => d.region === regionId && destinationGetsPage(d.id, market));
};

// ---------------------------------------------------------------- topic pages

// Clusters that produce standalone pages, and the page type each becomes.
// destination and regional are handled above and are not counted twice.
// long_tail and bridge produce no pages of their own by design: the long tail is
// absorbed by existing pages and the bridge cluster is a future product.
const TOPIC_CLUSTERS = {
  comparisons: 'comparison',
  setup: 'setup',
  device: 'compatibility',
  roaming: 'roaming_explainer',
  vs_alternatives: 'vs_alternatives',
  travel_sim: 'travel_sim',
  pocket_wifi: 'pocket_wifi',
  airport: 'airport',
  mobile_data_abroad: 'mobile_data_abroad',
  travel_connectivity: 'travel_connectivity',
  generic: 'travel_connectivity',
  commercial: 'commercial',
};

const NO_PAGES = { long_tail: 'absorbed by the pages that already rank', bridge: 'future product, not a page today', digital_nomad: 'below the floor everywhere' };

const topicKey = (k) => (k.parentTopic ? norm(k.parentTopic) : norm(k.keyword));

// topicPages[market][pageType] = count
const topicPages = {};
const topicDetail = {};
published.forEach((m) => {
  topicPages[m] = {};
  const list = byMarket[m] || [];
  Object.entries(TOPIC_CLUSTERS).forEach(([cluster, pageType]) => {
    const inCluster = list.filter((k) => k.cluster === cluster);
    const topics = {};
    inCluster.forEach((k) => { const t = topicKey(k); topics[t] = (topics[t] || 0) + k.volume; });
    const qualifying = Object.entries(topics).filter(([, v]) => v >= PAGE_FLOOR);
    topicPages[m][pageType] = (topicPages[m][pageType] || 0) + qualifying.length;
    qualifying.forEach(([t, v]) => { (topicDetail[pageType] = topicDetail[pageType] || []).push({ market: m, topic: t, volume: v }); });
  });
});

// ---------------------------------------------------------------- the plan

const plan = { byMarket: {}, byType: {}, total: 0 };
const bump = (type, n) => { plan.byType[type] = (plan.byType[type] || 0) + n; };

published.forEach((m) => {
  const dest = DESTINATIONS.filter((d) => destinationGetsPage(d.id, m)).length;
  const reg = REGIONS.filter((r) => regionGetsPage(r.id, m)).length;
  const topics = Object.values(topicPages[m]).reduce((a, b) => a + b, 0);
  const row = { home: 1, hubs: HUBS, destination: dest, region: reg, ...topicPages[m] };
  row.total = Object.values(row).reduce((a, b) => a + b, 0);
  plan.byMarket[m] = row;
  bump('home', 1); bump('hubs', HUBS); bump('destination', dest); bump('region', reg);
  Object.entries(topicPages[m]).forEach(([t, n]) => bump(t, n));
  plan.total += row.total;
});

// ---------------------------------------------------------------- what is built

const LIVE = contentLocales();
const built = {};
LIVE.forEach((l) => { built[l] = allPathsForLocale(l).length + 1; });
const builtTotal = Object.values(built).reduce((a, b) => a + b, 0);

const tiers = { P1: [], P2: [], P3: [], P4: [] };
DESTINATIONS.forEach((d) => tiers[tierOfDestination(d.id)].push(d.id));
const evidenced = DESTINATIONS.filter((d) => destVolume[d.id].keywords > 0);

const out = {
  generatedAt: new Date().toISOString(),
  formula: {
    statement: 'A page exists when one topic in one published market carries at least PAGE_FLOOR measured searches a month. Total pages is the sum over published markets of home + hubs + destination pages + region pages + topic pages.',
    PAGE_FLOOR,
    TIER,
    HUBS,
    topicDefinition: 'Ahrefs parentTopic when the row carries one, otherwise the keyword itself.',
    clustersWithoutPages: NO_PAGES,
  },
  markets: {
    measured: Object.keys(byMarket).length,
    published: published.length,
    publishedList: published,
    withheld,
    unpoliced,
  },
  destinations: {
    inDataset: DESTINATIONS.length,
    withMeasuredDemand: evidenced.length,
    withoutMeasuredDemand: DESTINATIONS.length - evidenced.length,
    tierCounts: Object.fromEntries(Object.entries(tiers).map(([t, v]) => [t, v.length])),
    top: Object.values(destVolume).filter((d) => d.keywords > 0).sort((a, b) => b.total - a.total).map((d) => ({ id: d.id, volume: d.total, keywords: d.keywords, tier: tierOfDestination(d.id) })),
    rejected: Object.values(destVolume).filter((d) => d.keywords === 0).map((d) => ({ id: d.id, region: d.region })),
  },
  locales: { inInfrastructure: LOCALES.length, live: LIVE, builtPages: built, builtTotal },
  plan,
};

writeFileSync(new URL('../data/plan-report.json', import.meta.url), JSON.stringify(out, null, 2));

const pad = (s, n) => String(s).padEnd(n);
const num = (s, n) => String(s).padStart(n);

console.log('FORMULA');
console.log('  a page needs', PAGE_FLOOR, 'measured searches a month on one topic in one published market');
console.log('  destination tiers: P1 >=', TIER.P1, ' P2 >=', TIER.P2, ' P3 >=', TIER.P3, ' P4 below', TIER.P3, 'gets no page');
console.log('');
console.log('MARKETS');
console.log('  measured ', Object.keys(byMarket).length);
console.log('  published', published.length, '  ' + published.join(', '));
console.log('  withheld ', withheld.length);
withheld.forEach((w) => console.log('    ' + pad(w.market, 12), w.why));
if (unpoliced.length) console.log('  NOT IN POLICY:', unpoliced.join(', '));
console.log('');
console.log('DESTINATIONS');
console.log('  in dataset            ', DESTINATIONS.length);
console.log('  with measured demand  ', evidenced.length);
console.log('  without any demand    ', DESTINATIONS.length - evidenced.length);
Object.entries(tiers).forEach(([t, v]) => console.log('  ' + pad(t, 22), num(v.length, 3)));
console.log('  P1 + P2 + P3          ', tiers.P1.length + tiers.P2.length + tiers.P3.length);
console.log('');
console.log('PAGES BY TYPE');
Object.entries(plan.byType).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => console.log('  ' + pad(t, 22), num(n, 5)));
console.log('  ' + pad('TOTAL PLANNED', 22), num(plan.total, 5));
console.log('');
console.log('PAGES BY MARKET');
Object.entries(plan.byMarket).sort((a, b) => b[1].total - a[1].total).forEach(([m, r]) => console.log('  ' + pad(m, 14), num(r.total, 5), '  dest', num(r.destination, 3), ' region', num(r.region, 3), ' topic', num(r.total - r.destination - r.region - r.home - r.hubs, 4)));
console.log('');
console.log('BUILT NOW ', builtTotal, JSON.stringify(built));
console.log('PLANNED   ', plan.total);
console.log('REMAINING ', plan.total - builtTotal);

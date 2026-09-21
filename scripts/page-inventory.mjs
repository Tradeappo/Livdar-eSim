// Page inventory: where every planned page actually stands.
//
//   node scripts/page-inventory.mjs            prints the table, writes reports/page-inventory.json
//
// The research plan (data/plan-report.json, rebuilt by scripts/plan-report.mjs)
// counts pages per research market. The site publishes per language. The two are
// not the same thing: en-us and en-gb are two research markets but one English
// URL per destination. This script converts the plan into distinct URLs per
// site locale and puts each one in exactly one state:
//
//   live              routed, in the sitemap, published in the registry
//   built_unpublished authored content exists, registry does not publish it
//   eligible          measured demand, a live locale, facts in the dataset; can be written now
//   blocked_market    measured demand, but the locale is not open yet (needs home, hubs, legal)
//   blocked_data      needs data we do not have and must not invent (verified prices)
//   rejected          no page by rule: P4 destinations, zero demand, withheld markets
//
// No number here is estimated. Every count is a set size over committed data.

import { readFileSync, writeFileSync } from 'node:fs';
import { DESTINATIONS, REGIONS } from '../lib/destinations.js';
import { authoredIds, contentLocales, publishedDestinationIds, publishedGuideSlugs, publishedRegionIds } from '../lib/content/index.js';
import { loadRegistry } from './publication.mjs';

const plan = JSON.parse(readFileSync(new URL('../data/plan-report.json', import.meta.url), 'utf8'));

export const MARKET_TO_LOCALE = {
  'en-us': 'en', 'en-gb': 'en', 'de-de': 'de', 'ro-ro': 'ro', 'ja-jp': 'ja', 'zh-Hant-tw': 'zh-Hant',
  'it-it': 'it', 'es-es': 'es', 'fr-fr': 'fr', 'nl-nl': 'nl', 'pl-pl': 'pl', 'pt-br': 'pt',
};
// Topic page types whose content depends on facts we cannot verify today.
const NEEDS_VERIFIED_DATA = { comparison: 'provider prices and conditions must be verified the same day before publication' };

export function buildInventory() {
  const live = contentLocales();
  const registry = loadRegistry();
  const locales = [...new Set(plan.markets.publishedList.map((m) => MARKET_TO_LOCALE[m]))];
  const rows = [];
  const add = (type, locale, key, state, why) => rows.push({ type, locale, key, state, why });

  // Destinations: one URL per destination per locale.
  const byMarket = plan.destinations.byMarket;
  locales.forEach((locale) => {
    const markets = plan.markets.publishedList.filter((m) => MARKET_TO_LOCALE[m] === locale);
    DESTINATIONS.forEach((d) => {
      const rec = byMarket[d.id];
      const planned = rec && rec.pageIn.some((m) => markets.includes(m));
      const isLive = live.includes(locale) && publishedDestinationIds(locale).includes(d.id);
      if (isLive) return add('destination', locale, d.id, 'live');
      if (live.includes(locale) && authoredIds(locale, 'destination').includes(d.id)) return add('destination', locale, d.id, 'built_unpublished', 'registry state ' + (registry.entries[locale + ':destination:' + d.id]?.state || 'unregistered'));
      if (!planned) return add('destination', locale, d.id, 'rejected', rec ? 'tier ' + rec.tier + ', no page in this market by rule' : 'not in plan');
      if (!live.includes(locale)) return add('destination', locale, d.id, 'blocked_market', 'locale not open');
      if (!d.networks?.length || !d.callingCode) return add('destination', locale, d.id, 'blocked_data', 'dataset lacks networks or calling code');
      return add('destination', locale, d.id, 'eligible', 'tier ' + rec.tier);
    });
  });

  // Regions.
  locales.forEach((locale) => {
    const markets = plan.markets.publishedList.filter((m) => MARKET_TO_LOCALE[m] === locale);
    REGIONS.filter((r) => r.id !== 'global').forEach((r) => {
      const planned = (plan.regions[r.id] || []).some((m) => markets.includes(m));
      if (live.includes(locale) && publishedRegionIds(locale).includes(r.id)) return add('region', locale, r.id, 'live');
      if (!planned) return add('region', locale, r.id, 'rejected', 'no regional demand in this market');
      if (!live.includes(locale)) return add('region', locale, r.id, 'blocked_market', 'locale not open');
      return add('region', locale, r.id, 'eligible');
    });
  });

  // Topic pages: one URL per distinct topic per locale. en-us and en-gb topics
  // are merged, so the same English topic is one page, not two.
  Object.entries(plan.topics).forEach(([type, list]) => {
    const seen = new Set();
    list.forEach(({ market, topic }) => {
      const locale = MARKET_TO_LOCALE[market];
      const key = locale + '|' + topic;
      if (seen.has(key)) return;
      seen.add(key);
      if (NEEDS_VERIFIED_DATA[type]) return add(type, locale, topic, 'blocked_data', NEEDS_VERIFIED_DATA[type]);
      if (!live.includes(locale)) return add(type, locale, topic, 'blocked_market', 'locale not open');
      return add(type, locale, topic, 'eligible', 'topic above the 500 a month floor; check whether a live guide already covers it');
    });
  });

  // Structural pages.
  locales.forEach((locale) => {
    const isLive = live.includes(locale);
    add('home', locale, 'home', isLive ? 'live' : 'blocked_market');
    ['esim', 'regions', 'guides'].forEach((h) => add('hub', locale, h, isLive ? 'live' : 'blocked_market'));
    add('hub', locale, 'compare', 'blocked_data', 'the comparisons hub has nothing to list until comparisons exist');
  });
  // Live pages that are not in the research plan's page types.
  live.forEach((locale) => {
    publishedGuideSlugs(locale).forEach((slug) => add('guide (live)', locale, slug, 'live'));
    add('compatibility', locale, 'compatibility', 'live');
    add('legal', locale, 'privacy', 'live');
    add('legal', locale, 'cookies', 'live');
  });

  const summary = {};
  rows.forEach((r) => {
    summary[r.type] = summary[r.type] || {};
    summary[r.type][r.state] = (summary[r.type][r.state] || 0) + 1;
  });
  const byLocale = {};
  rows.forEach((r) => {
    byLocale[r.locale] = byLocale[r.locale] || {};
    byLocale[r.locale][r.state] = (byLocale[r.locale][r.state] || 0) + 1;
  });
  const totals = {};
  rows.forEach((r) => { totals[r.state] = (totals[r.state] || 0) + 1; });

  return {
    generatedAt: new Date().toISOString(),
    reconciliation: {
      handoffDeclared: 1342,
      handoffRowSum: 1331,
      handoffNote: 'The 16 September handoff declared 1,342 but its page plan rows add up to 1,331; its cluster table adds up to 1,334. None of the three is produced by a committed script. The gap of 11 equals one page per market for the 11 markets the handoff counted, the same size as its Homepage row, which points to that row being counted twice. It cannot be proven from the repo because the handoff figures were written by hand.',
      researchPlanNow: plan.plan.total,
      researchPlanNote: 'scripts/plan-report.mjs recomputes the plan from data/ on every run: 1,285 pages over 12 research markets. It counts en-us and en-gb separately.',
      distinctUrls: rows.filter((r) => r.state !== 'rejected').length,
      distinctUrlsNote: 'The inventory converts research markets into site locales. English is one set of URLs, so en-us and en-gb pages that share a destination or a topic collapse into one URL.',
    },
    totals,
    byType: summary,
    byLocale,
    rows,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const inv = buildInventory();
  writeFileSync(new URL('../reports/page-inventory.json', import.meta.url), JSON.stringify(inv, null, 2) + '\n');
  console.log('RECONCILIATION');
  Object.entries(inv.reconciliation).forEach(([k, v]) => console.log('  ' + k + ': ' + v));
  console.log('\nTOTALS');
  console.table(inv.totals);
  console.log('BY TYPE');
  console.table(inv.byType);
  console.log('BY LOCALE');
  console.table(inv.byLocale);
}

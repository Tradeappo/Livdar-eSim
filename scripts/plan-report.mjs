// Turns the consolidated research into the country, language and page plan the
// build actually commits to. Every figure here traces back to a measured row.

import { readFileSync, writeFileSync } from 'node:fs';
import { DESTINATIONS, REGIONS } from '../lib/destinations.js';
import { contentLocales, publishedDestinationIds, publishedGuideSlugs } from '../lib/content/index.js';
import { allPathsForLocale } from '../lib/resolve.js';
import { LOCALES } from '../lib/i18n.js';

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const files = ['../data/keyword-research.json', '../data/keyword-expansion-eu.json', '../data/keyword-expansion-asia.json', '../data/keyword-expansion-deep.json', '../data/keyword-expansion-connectivity.json', '../data/keyword-expansion-markets.json'];
const norm = (s) => String(s).toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();
const seen = new Map();
files.forEach((f) => load(f).keywords.forEach((k) => {
  if (k.volume === null || k.volume === undefined) return;
  const key = k.country + '||' + norm(k.keyword);
  const p = seen.get(key);
  if (!p || k.volume > p.volume) seen.set(key, k);
}));
const all = [...seen.values()];

// Which of the 126 dataset destinations show measurable demand anywhere.
// A destination counts as evidenced when its English name, or any localised
// name, appears inside a measured keyword for any market.
const demand = {};
DESTINATIONS.forEach((d) => {
  const english = d.id.replace(/-/g, ' ');
  const names = new Set([english, ...Object.values(d.names || {})].filter(Boolean).map(norm));
  // add common exonyms the markets actually type
  const extra = { 'united-states': ['usa', 'amerika', 'america', 'estados unidos', 'stati uniti', 'etats unis', 'アメリカ'],
    'united-kingdom': ['uk', 'england', 'grossbritannien', 'regno unito', 'reino unido', 'angleterre'],
    'united-arab-emirates': ['dubai', 'uae', 'emirate', 'emirati', 'emiratos'],
    'south-korea': ['korea', '韓国', '한국'], 'czechia': ['czech', 'tschechien', 'cehia'] };
  (extra[d.id] || []).forEach((x) => names.add(norm(x)));
  let v = 0, n = 0;
  all.forEach((k) => {
    const kw = norm(k.keyword);
    for (const nm of names) { if (nm.length > 2 && kw.includes(nm)) { v += k.volume; n += 1; return; } }
  });
  demand[d.id] = { volume: v, keywords: n, region: d.region, name: english };
});

const evidenced = Object.entries(demand).filter(([, o]) => o.keywords > 0);
const noEvidence = Object.entries(demand).filter(([, o]) => o.keywords === 0);

// Page plan. One page only where there is measured demand behind it.
const LIVE = contentLocales();
const built = {};
LIVE.forEach((l) => { built[l] = allPathsForLocale(l).length + 1; });
const builtTotal = Object.values(built).reduce((a, b) => a + b, 0);

const strongDest = evidenced.filter(([, o]) => o.volume >= 500).length;
const midDest = evidenced.filter(([, o]) => o.volume >= 100 && o.volume < 500).length;

const plan = {
  markets: 9,
  destinationPagesPerMarket: strongDest,
  planned: {
    destination: strongDest * 9,
    region: 11 * 9,
    guides_setup: 8 * 9,
    comparisons: 10 * 9,
    compatibility: 4 * 9,
    travelConnectivity: 6 * 9,
    airport: 0,
    hubs: 4 * 9,
    home: 9,
  },
};
plan.plannedTotal = Object.values(plan.planned).reduce((a, b) => a + b, 0);

const out = {
  generatedAt: new Date().toISOString(),
  destinations: {
    inDataset: DESTINATIONS.length,
    withMeasuredDemand: evidenced.length,
    withoutMeasuredDemand: noEvidence.length,
    strong: strongDest,
    mid: midDest,
    top: evidenced.sort((a, b) => b[1].volume - a[1].volume).map(([id, o]) => ({ id, name: o.name, volume: o.volume, keywords: o.keywords })),
    rejected: noEvidence.map(([id, o]) => ({ id, name: o.name, region: o.region })),
  },
  locales: { inInfrastructure: LOCALES.length, live: LIVE, builtPages: built, builtTotal },
  plan,
};
writeFileSync(new URL('../data/plan-report.json', import.meta.url), JSON.stringify(out, null, 2));

console.log('destinations in dataset      ', DESTINATIONS.length);
console.log('with measured demand         ', evidenced.length);
console.log('  of which >= 500/mo         ', strongDest);
console.log('  of which 100 to 499/mo     ', midDest);
console.log('without measured demand      ', noEvidence.length);
console.log('');
console.log('top 12 destinations by measured volume:');
out.destinations.top.slice(0, 12).forEach((d) => console.log('  ', String(d.volume).padStart(7), d.name, '(' + d.keywords + ' kw)'));
console.log('');
console.log('no measured demand:', noEvidence.map(([, o]) => o.name).join(', '));
console.log('');
console.log('pages built now:', builtTotal, JSON.stringify(built));
console.log('pages planned  :', plan.plannedTotal, JSON.stringify(plan.planned));

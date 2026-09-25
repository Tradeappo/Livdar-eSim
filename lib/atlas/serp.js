// Reading the SERP measurements, and the one question they answer.
//
// Keyword difficulty is a single number that compresses a whole result page
// into an estimate of how many links you would need. It is useful and it is
// not the question a programmatic site actually has. That question is: at
// which position does the authority in this result page fall to something a
// new site can reach, and how much traffic sits at and below that position.
//
// A page with a domain rating of four ranks second for "where should i live"
// at 6,200 searches a month. Difficulty 9 says that is easy; the SERP says
// which competitor is beatable and at which position, which is a different
// and more actionable fact. So this module computes entry point rather than
// difficulty, and keeps difficulty beside it rather than replacing it.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url);
const DIR = new URL('data/atlas/serp/', ROOT);

// Hosts that rank because of what they are rather than what the page is.
// A new site does not compete with a Reddit thread by writing a better
// Reddit thread, and counting these as beatable competitors would make every
// result page look winnable.
export const PLATFORM_HOSTS = new Set([
  'reddit.com', 'quora.com', 'facebook.com', 'instagram.com', 'youtube.com',
  'tiktok.com', 'x.com', 'twitter.com', 'linkedin.com', 'medium.com',
  'en.wikipedia.org', 'wikipedia.org', 'lemon8-app.com', 'pinterest.com',
]);

// An authority a new site can plausibly reach inside a measurement window.
// Not a target and not a promise: the point of the threshold is to split the
// result page into the part that is contestable and the part that is not.
export const REACHABLE_DR = 45;

let cache = null;
export function store() {
  if (cache) return cache;
  const out = [];
  if (existsSync(DIR)) {
    for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
      const j = JSON.parse(readFileSync(new URL(f, DIR), 'utf8'));
      for (const k of j.keywords || []) out.push({ ...k, measuredOn: j.measuredOn, provider: j.provider });
    }
  }
  cache = out;
  return out;
}

export const resetSerpCache = () => { cache = null; };

export const byKeyword = (keyword, market) => store().find((k) => k.keyword === keyword && (!market || k.market === market)) || null;

// What a result page says about entering it. Every number here is counted
// from the measured rows; nothing is modelled.
export function analyse(row) {
  const organic = row.organic || [];
  const independent = organic.filter((o) => !PLATFORM_HOSTS.has(o.host));
  const reachable = independent.filter((o) => (o.domainRating ?? 100) <= REACHABLE_DR);
  const sorted = [...organic].sort((a, b) => a.position - b.position);

  // The first position held by something a new site could outrank. A result
  // page whose first reachable competitor is at position nine is a page you
  // enter at position nine.
  const entry = sorted.find((o) => !PLATFORM_HOSTS.has(o.host) && (o.domainRating ?? 100) <= REACHABLE_DR);

  const drs = independent.map((o) => o.domainRating).filter((d) => typeof d === 'number');
  return {
    keyword: row.keyword,
    market: row.market,
    family: row.family,
    entity: row.entity,
    volume: row.volume,
    difficulty: row.difficulty ?? null,
    organicCount: organic.length,
    platformCount: organic.length - independent.length,
    reachableCount: reachable.length,
    entryPosition: entry ? entry.position : null,
    entryHost: entry ? entry.host : null,
    weakestDomainRating: drs.length ? Math.min(...drs) : null,
    medianDomainRating: drs.length ? drs.slice().sort((a, b) => a - b)[Math.floor(drs.length / 2)] : null,
    features: row.features || [],
    hasAiOverview: (row.features || []).includes('ai_overview'),
    hasQuestions: (row.features || []).includes('question'),
    hasDiscussion: (row.features || []).includes('discussion'),
    measuredOn: row.measuredOn,
  };
}

export const analysed = () => store().map(analyse);

// Per market, because the finding was that the answer differs by market and
// a single number across all of them would hide it.
export function byMarket() {
  const out = {};
  for (const a of analysed()) {
    const m = (out[a.market] ||= { market: a.market, keywords: 0, withReachable: 0, reachableCount: 0, entryPositions: [], weakest: [], aiOverview: 0 });
    m.keywords++;
    m.reachableCount += a.reachableCount;
    if (a.reachableCount) m.withReachable++;
    if (a.entryPosition) m.entryPositions.push(a.entryPosition);
    if (a.weakestDomainRating != null) m.weakest.push(a.weakestDomainRating);
    if (a.hasAiOverview) m.aiOverview++;
  }
  for (const m of Object.values(out)) {
    m.reachablePerPage = Math.round((m.reachableCount / m.keywords) * 10) / 10;
    m.medianEntryPosition = m.entryPositions.length ? m.entryPositions.slice().sort((a, b) => a - b)[Math.floor(m.entryPositions.length / 2)] : null;
    m.medianWeakestDomainRating = m.weakest.length ? m.weakest.slice().sort((a, b) => a - b)[Math.floor(m.weakest.length / 2)] : null;
    delete m.entryPositions;
    delete m.weakest;
  }
  return out;
}

// Which competitors keep appearing, which is what says who the programme is
// actually up against rather than who happened to rank once.
export function competitors({ minAppearances = 2 } = {}) {
  const hosts = new Map();
  for (const row of store()) {
    for (const o of row.organic || []) {
      if (PLATFORM_HOSTS.has(o.host)) continue;
      const h = hosts.get(o.host) || { host: o.host, appearances: 0, markets: new Set(), bestPosition: 99, domainRating: o.domainRating ?? null };
      h.appearances++;
      h.markets.add(row.market);
      h.bestPosition = Math.min(h.bestPosition, o.position);
      if (o.domainRating != null) h.domainRating = Math.max(h.domainRating ?? 0, o.domainRating);
      hosts.set(o.host, h);
    }
  }
  return [...hosts.values()]
    .filter((h) => h.appearances >= minAppearances)
    .map((h) => ({ ...h, markets: [...h.markets].sort() }))
    .sort((a, b) => b.appearances - a.appearances || a.bestPosition - b.bestPosition);
}

// The state a page reaches once its result page has been looked at. This is
// the `SERP-measured` step of the pipeline, and it is a property of a
// keyword in a market rather than of a family.
export function serpMeasuredKeys() {
  return new Set(store().map((k) => [k.family, k.entity, k.market].join('|')));
}

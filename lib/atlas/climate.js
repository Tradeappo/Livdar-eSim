// Reading the climate normals, and answering "when should I go".
//
// This is the largest measured demand in the programme against a source that
// was already built, and it is also the question where the incumbent pages
// are weakest. They answer for a country as though a country had one climate.
// Japan runs from Hokkaido to Okinawa; Spain from Bilbao to the Canaries. A
// single best month for either is not a simplification, it is wrong for half
// the country.
//
// So the country answer here is computed over several measured cities and the
// page says which ones. Where the cities agree, that agreement is the answer
// and it is worth more than the incumbents' because it is shown. Where they
// disagree, the disagreement is the answer, and naming it is the thing no
// competitor does.
//
// The comfort model is deliberately simple and entirely visible. Nothing here
// is tuned to produce a pleasing ranking: the bands are stated, the penalties
// are stated, and every page can show the components that produced its score.

import { readFileSync, existsSync } from 'node:fs';
import { rootFrom } from './repo-root.js';

const ROOT = rootFrom(import.meta.url);

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// The comfort band, in degrees, for the monthly mean temperature.
//
// It scores the monthly mean and not a daytime high, and that is a correction
// rather than a preference. The climatology endpoint publishes T2M as a real
// monthly normal, but its T2M_MAX and T2M_MIN are the extreme values over the
// whole twenty year period rather than the mean daily maximum and minimum.
// London arrives with a January minimum of -8.2 and a July maximum of 34.0.
// An earlier version of this model scored the maximum as though it were a
// typical afternoon, and it answered that the best time to visit Tokyo was
// February, ahead of May, because February's warmest day in twenty years was
// pleasant. Scoring the mean puts Tokyo back on May, November and April.
//
// These are the numbers a reader would argue with, which is why they are here
// rather than inside a formula.
export const COMFORT = {
  idealMeanLow: 15,
  idealMeanHigh: 24,
  coldPenaltyPerDegree: 3.0,
  hotPenaltyPerDegree: 4.5,
  // Rain is penalised per millimetre in the month, capped so that a monsoon
  // and a worse monsoon do not separate a ranking that is already at the
  // bottom.
  rainPenaltyPerMm: 0.18,
  rainPenaltyCap: 30,
  humidityPenaltyAbove: 80,
  humidityPenaltyPerPoint: 0.8,
};

// What this model deliberately does not score, so that a page built on it
// cannot imply otherwise. Overnight temperature is the notable absence: a warm
// night is a real reason a tropical month is unpleasant, and the source has no
// mean daily minimum to measure it with. Claiming one from the period extreme
// would be inventing it.
export const NOT_SCORED = {
  overnight: 'No mean daily minimum exists in this source, so warm nights are not scored and no page may state a typical overnight low.',
  daytimeHigh: 'No mean daily maximum exists in this source, so no page may state a typical daytime high.',
  wind: 'Recorded but not scored. It matters on a coast and hardly anywhere else, and one global weight for it would be wrong in most places.',
  extremes: 'The extreme fields describe the worst the period produced, undated and unweighted by how often they recur, so they never enter a score.',
};

let cache = null;
export function store() {
  if (cache) return cache;
  const u = new URL('data/atlas/sources/climate/normals.json', ROOT);
  if (existsSync(u)) { cache = JSON.parse(readFileSync(u, 'utf8')); return cache; }
  // The older store, kept readable so this module works before the expanded
  // ingest has run.
  const legacy = new URL('data/atlas/entities/climate.json', ROOT);
  cache = existsSync(legacy) ? { cities: JSON.parse(readFileSync(legacy, 'utf8')), period: '2011-2020', legacy: true } : { cities: {} };
  return cache;
}

export const resetClimateCache = () => { cache = null; };

// The provenance record a page carries for every climate figure it shows.
// Built from the store header rather than written into the page, so a page
// cannot show a value whose attribution somebody forgot to update.
export function sourceRecord() {
  const s = store();
  return {
    source: s.provider || 'NASA POWER',
    sourceRef: s.endpoint || s.dataset || null,
    dataset: s.dataset || null,
    licence: s.licence || null,
    observedAt: s.observedAt || (s.period ? String(s.period).slice(-4) : null),
    confidence: s.confidence || 'official-proxy',
    derivation: s.meaning || null,
  };
}

// The score for one month in one place, with every component kept so a page
// can show its working instead of asserting a number.
export function comfort(month) {
  if (!month || month.tmean == null) return null;
  const c = COMFORT;
  let cold = 0;
  let hot = 0;
  if (month.tmean < c.idealMeanLow) cold = (c.idealMeanLow - month.tmean) * c.coldPenaltyPerDegree;
  if (month.tmean > c.idealMeanHigh) hot = (month.tmean - c.idealMeanHigh) * c.hotPenaltyPerDegree;
  const rain = Math.min(c.rainPenaltyCap, (month.precipMm || 0) * c.rainPenaltyPerMm);
  const humid = month.rh != null && month.rh > c.humidityPenaltyAbove ? (month.rh - c.humidityPenaltyAbove) * c.humidityPenaltyPerPoint : 0;
  const penalty = cold + hot + rain + humid;
  const components = [['cold', cold], ['hot', hot], ['rain', rain], ['humidity', humid]];
  const leading = components.slice().sort((a, b) => b[1] - a[1])[0];
  return {
    score: Math.max(0, Math.round((100 - penalty) * 10) / 10),
    penalties: {
      cold: Math.round(cold * 10) / 10,
      hot: Math.round(hot * 10) / 10,
      rain: Math.round(rain * 10) / 10,
      humidity: Math.round(humid * 10) / 10,
    },
    // What actually decided it, so the page can say "too wet" rather than
    // "scored 61".
    leadingReason: leading[1] > 4 ? leading[0] : 'nothing much',
  };
}

export function forCity(cityId) {
  const s = store();
  const row = s.cities[String(cityId)];
  if (!row) return null;
  const months = row.months.map((m, i) => ({
    month: i + 1,
    name: MONTHS[i],
    ...m,
    comfort: comfort(m),
  }));
  const ranked = months.filter((m) => m.comfort).slice().sort((a, b) => b.comfort.score - a.comfort.score);
  return {
    cityId: String(cityId),
    name: row.name || null,
    iso2: row.iso2 || null,
    period: row.period || s.period,
    cell: row.cell,
    months,
    best: ranked.slice(0, 3).map((m) => m.month),
    // Worst first, so a sentence that lists them opens with the month the
    // reader most needs to know about rather than closing with it.
    worst: ranked.slice(-2).reverse().map((m) => m.month),
    ranked: ranked.map((m) => ({ month: m.month, name: m.name, score: m.comfort.score })),
  };
}

export const citiesWithClimate = () => Object.keys(store().cities);

export function citiesOfCountry(iso2) {
  const s = store();
  return Object.entries(s.cities).filter(([, r]) => r.iso2 === iso2).map(([id]) => id);
}

export const countriesWithClimate = () => [...new Set(Object.values(store().cities).map((r) => r.iso2).filter(Boolean))].sort();

// The country answer. Computed across every measured city in the country,
// with the spread reported rather than averaged away.
//
// `agreement` is the share of the country's cities that put a month in their
// own top four. A month every city likes is a safe answer; a month half the
// cities like is the interesting one, because that is where the country
// splits and where a reader is actually deciding something.
export function forCountry(iso2, { minCities = 1 } = {}) {
  const ids = citiesOfCountry(iso2);
  if (ids.length < minCities) return null;
  const cities = ids.map((id) => forCity(id)).filter(Boolean);
  if (!cities.length) return null;

  const months = MONTHS.map((name, i) => {
    const scored = cities.map((c) => ({ city: c, score: c.months[i].comfort?.score })).filter((x) => x.score != null);
    if (!scored.length) return null;
    const scores = scored.map((x) => x.score);
    const mean = scores.reduce((t, x) => t + x, 0) / scores.length;
    const inTopFour = cities.filter((c) => c.ranked.slice(0, 4).some((r) => r.month === i + 1)).length;
    // Which city sits at each end of the spread. A page that reports a
    // disagreement has to be able to name the two places that disagree, or it
    // is asserting a number instead of showing one.
    const warmest = scored.reduce((a, b) => (b.score > a.score ? b : a));
    const coolest = scored.reduce((a, b) => (b.score < a.score ? b : a));
    // Why this month scores as it does, in the country as a whole: the reason
    // most of the measured cities give. Cities can disagree about the reason
    // as well as the score, and where they do the commonest one is reported
    // rather than a blend, because there is no such thing as half cold and
    // half wet.
    const tally = new Map();
    for (const x of scored) {
      const r = x.city.months[i].comfort?.leadingReason || 'nothing much';
      tally.set(r, (tally.get(r) || 0) + 1);
    }
    const leadingReason = [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
    // The measured values behind the score, kept so the page can state them.
    // Two countries can share a best month and a verdict and still be
    // describing different weather: Morocco and Turkey both come out on June,
    // and their Junes are not the same June. Without these numbers the two
    // pages say the same thing, which is the near duplicate the QA catches.
    const temps = scored.map((x) => x.city.months[i].tmean).filter((t) => t != null);
    const rains = scored.map((x) => x.city.months[i].precipMm).filter((t) => t != null);
    const warmestByTemp = scored.reduce((a, b) => ((b.city.months[i].tmean ?? -999) > (a.city.months[i].tmean ?? -999) ? b : a));
    const coolestByTemp = scored.reduce((a, b) => ((b.city.months[i].tmean ?? 999) < (a.city.months[i].tmean ?? 999) ? b : a));
    const avg = (xs) => (xs.length ? Math.round((xs.reduce((t, x) => t + x, 0) / xs.length) * 10) / 10 : null);
    return {
      month: i + 1,
      name,
      meanScore: Math.round(mean * 10) / 10,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      spread: Math.round((Math.max(...scores) - Math.min(...scores)) * 10) / 10,
      agreement: Math.round((inTopFour / cities.length) * 100),
      leadingReason,
      tmean: avg(temps),
      precipMm: avg(rains),
      warmest: { name: warmestByTemp.city.name, tmean: warmestByTemp.city.months[i].tmean },
      coolest: { name: coolestByTemp.city.name, tmean: coolestByTemp.city.months[i].tmean },
      bestCity: { cityId: warmest.city.cityId, name: warmest.city.name, score: warmest.score },
      worstCity: { cityId: coolest.city.cityId, name: coolest.city.name, score: coolest.score },
      cities: cities.length,
    };
  }).filter(Boolean);

  const ranked = [...months].sort((a, b) => b.meanScore - a.meanScore);
  // The month where the country most disagrees with itself. This is the
  // sentence no competitor writes and the reason the page is worth reading.
  const mostDivided = [...months].sort((a, b) => b.spread - a.spread)[0];

  return {
    iso2,
    cities: cities.map((c) => ({ cityId: c.cityId, name: c.name, best: c.best, worst: c.worst })),
    cityCount: cities.length,
    period: cities[0].period,
    months,
    best: ranked.slice(0, 3).map((m) => m.month),
    worst: ranked.slice(-2).reverse().map((m) => m.month),
    ranked: ranked.map((m) => ({ month: m.month, name: m.name, score: m.meanScore, agreement: m.agreement })),
    mostDivided,
    // Whether the country can honestly be answered as one place at all. A
    // country whose cities never agree gets a page that says so.
    unanimous: ranked[0].agreement === 100,
    dividedCountry: mostDivided.spread >= 25,
  };
}

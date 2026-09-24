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

const ROOT = new URL('../../', import.meta.url);

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// The comfort band, in degrees, for a daytime high. Below it you are cold and
// above it you are hot, and the penalty grows with the distance either way.
// These are the numbers a reader would argue with, which is why they are here
// rather than inside a formula.
export const COMFORT = {
  idealHighLow: 18,
  idealHighHigh: 27,
  coldPenaltyPerDegree: 3.2,
  hotPenaltyPerDegree: 4.0,
  // Rain is penalised per millimetre in the month, capped so that a monsoon
  // and a worse monsoon do not separate a ranking that is already at the
  // bottom.
  rainPenaltyPerMm: 0.22,
  rainPenaltyCap: 34,
  // A night that does not cool down is its own problem in the tropics.
  nightPenaltyAbove: 24,
  nightPenaltyPerDegree: 2.0,
  humidityPenaltyAbove: 78,
  humidityPenaltyPerPoint: 0.5,
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

// The score for one month in one place, with every component kept so a page
// can show its working instead of asserting a number.
export function comfort(month) {
  if (!month || month.tmax == null) return null;
  const c = COMFORT;
  let cold = 0;
  let hot = 0;
  if (month.tmax < c.idealHighLow) cold = (c.idealHighLow - month.tmax) * c.coldPenaltyPerDegree;
  if (month.tmax > c.idealHighHigh) hot = (month.tmax - c.idealHighHigh) * c.hotPenaltyPerDegree;
  const rain = Math.min(c.rainPenaltyCap, (month.precipMm || 0) * c.rainPenaltyPerMm);
  const night = month.tmin != null && month.tmin > c.nightPenaltyAbove ? (month.tmin - c.nightPenaltyAbove) * c.nightPenaltyPerDegree : 0;
  const humid = month.rh != null && month.rh > c.humidityPenaltyAbove ? (month.rh - c.humidityPenaltyAbove) * c.humidityPenaltyPerPoint : 0;
  const penalty = cold + hot + rain + night + humid;
  return {
    score: Math.max(0, Math.round((100 - penalty) * 10) / 10),
    penalties: {
      cold: Math.round(cold * 10) / 10,
      hot: Math.round(hot * 10) / 10,
      rain: Math.round(rain * 10) / 10,
      warmNights: Math.round(night * 10) / 10,
      humidity: Math.round(humid * 10) / 10,
    },
    // What actually decided it, so the page can say "too wet" rather than
    // "scored 61".
    leadingReason: [['cold', cold], ['hot', hot], ['rain', rain], ['warmNights', night], ['humidity', humid]]
      .sort((a, b) => b[1] - a[1])[0][1] > 4
      ? [['cold', cold], ['hot', hot], ['rain', rain], ['warmNights', night], ['humidity', humid]].sort((a, b) => b[1] - a[1])[0][0]
      : 'nothing much',
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
    iso2: row.iso2 || null,
    period: row.period || s.period,
    cell: row.cell,
    months,
    best: ranked.slice(0, 3).map((m) => m.month),
    worst: ranked.slice(-2).map((m) => m.month),
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
    const scores = cities.map((c) => c.months[i].comfort?.score).filter((x) => x != null);
    if (!scores.length) return null;
    const mean = scores.reduce((t, x) => t + x, 0) / scores.length;
    const inTopFour = cities.filter((c) => c.ranked.slice(0, 4).some((r) => r.month === i + 1)).length;
    return {
      month: i + 1,
      name,
      meanScore: Math.round(mean * 10) / 10,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      spread: Math.round((Math.max(...scores) - Math.min(...scores)) * 10) / 10,
      agreement: Math.round((inTopFour / cities.length) * 100),
      cities: cities.length,
    };
  }).filter(Boolean);

  const ranked = [...months].sort((a, b) => b.meanScore - a.meanScore);
  // The month where the country most disagrees with itself. This is the
  // sentence no competitor writes and the reason the page is worth reading.
  const mostDivided = [...months].sort((a, b) => b.spread - a.spread)[0];

  return {
    iso2,
    cities: cities.map((c) => ({ cityId: c.cityId, best: c.best, worst: c.worst })),
    cityCount: cities.length,
    period: cities[0].period,
    months,
    best: ranked.slice(0, 3).map((m) => m.month),
    worst: ranked.slice(-2).map((m) => m.month),
    ranked: ranked.map((m) => ({ month: m.month, name: m.name, score: m.meanScore, agreement: m.agreement })),
    mostDivided,
    // Whether the country can honestly be answered as one place at all. A
    // country whose cities never agree gets a page that says so.
    unanimous: ranked[0].agreement === 100,
    dividedCountry: mostDivided.spread >= 25,
  };
}

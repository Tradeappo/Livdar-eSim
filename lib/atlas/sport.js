// When an outdoor activity is comfortable in a city, from the climate normals.
//
// This is half of the Sport surface and it says so on every page it produces.
// The other half is where: the routes, the trails, the pools, the clubs. That
// needs `sport-routes-verified`, the Overpass adapter for it is written and
// tested, and every host that serves the extract is refused by this
// environment's egress policy. So the question this module answers is the one
// the built data can answer honestly, which is when.
//
// That is not a consolation prize. The measured demand says a large share of
// these searches is seasonal: `trekking vicino milano` and `東京 ハイキング`
// both peak in the shoulder months, and the thing a reader needs first is
// whether the month they are thinking of is the wrong one. A page that answers
// that and says plainly that it does not hold the routes is more use than one
// that pads a route list out of nothing.
//
// The bands below are conventions, not measurements, and they are printed on
// the page as conventions. They come from what the activity does to a body
// rather than from any ranking: running generates more heat than walking, so
// its comfortable band sits lower and its hard threshold comes sooner; cycling
// tolerates more heat because of the airflow and is the only one where wind is
// a real cost; swimming outdoors needs air warm enough to get out into, and the
// water temperature that would actually decide it is not in this source.

import { forCity as climateForCity, MONTHS, NOT_SCORED, sourceRecord as climateSource } from './climate.js';
import { cityName } from './cities.js';

// The comfortable band for the monthly mean temperature, in degrees, and the
// point past which the activity stops being comfortable. `windAbove` is a mean
// wind speed in metres per second and is set only where wind changes the
// answer.
export const ACTIVITIES = {
  running: { meanLow: 5, meanHigh: 20, hardAbove: 24, windAbove: null },
  cycling: { meanLow: 8, meanHigh: 24, hardAbove: 28, windAbove: 5.5 },
  hiking: { meanLow: 5, meanHigh: 22, hardAbove: 26, windAbove: null },
  swimming: { meanLow: 21, meanHigh: 32, hardAbove: null, windAbove: null },
};

export const ACTIVITY_IDS = Object.keys(ACTIVITIES);

// What each activity's page may not claim, kept beside the bands rather than
// in the copy, so that a new language cannot quietly drop it.
export const NOT_ANSWERED = {
  where: 'No route, trail, pool, gym or club is named. That is sport-routes-verified and it is not built.',
  water: 'No sea, lake or pool temperature exists in this source. A swimming page is about the air only and says so.',
  surface: 'No gradient, surface or traffic data. A flat month and a flat route are different claims.',
  ...NOT_SCORED,
};

// An entity is a city and an activity together, because the answer is neither
// on its own: Tokyo in July is fine for swimming and hard for running, and one
// page for both would have to average them into something true of neither.
export const entityFor = (cityId, activity) => String(cityId) + ':' + activity;

export function splitEntity(entity) {
  const i = String(entity).indexOf(':');
  if (i < 0) return null;
  const cityId = String(entity).slice(0, i);
  const activity = String(entity).slice(i + 1);
  if (!ACTIVITIES[activity]) return null;
  return { cityId, activity };
}

const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

// One city and one activity, resolved. Returns null rather than a partial
// answer when the city has no normals, so a page cannot be built on a month
// list that does not exist.
export function forCityActivity(entity, { language = 'en' } = {}) {
  const split = splitEntity(entity);
  if (!split) return null;
  const band = ACTIVITIES[split.activity];
  const climate = climateForCity(split.cityId);
  if (!climate || !climate.months.length) return null;

  const months = climate.months.map((m) => {
    const inBand = m.tmean != null && m.tmean >= band.meanLow && m.tmean <= band.meanHigh;
    const tooHot = band.hardAbove != null && m.tmean != null && m.tmean > band.hardAbove;
    const tooCold = m.tmean != null && m.tmean < band.meanLow;
    const windy = band.windAbove != null && m.wind != null && m.wind > band.windAbove;
    return {
      month: m.month,
      name: m.name,
      tmean: m.tmean == null ? null : round(m.tmean),
      precipMm: m.precipMm == null ? null : Math.round(m.precipMm),
      wind: m.wind == null ? null : round(m.wind),
      rh: m.rh == null ? null : round(m.rh),
      inBand,
      windy,
      // Why a month is out, in one word, so a sentence can say it rather than
      // printing a band and leaving the reader to subtract.
      out: inBand ? null : tooHot ? 'hot' : tooCold ? 'cold' : 'warm',
    };
  });

  const good = months.filter((m) => m.inBand && !m.windy);
  const withTemp = months.filter((m) => m.tmean != null);
  const withRain = months.filter((m) => m.precipMm != null);
  const withWind = months.filter((m) => m.wind != null);
  if (!withTemp.length) return null;

  const hottest = withTemp.slice().sort((a, b) => b.tmean - a.tmean)[0];
  const coldest = withTemp.slice().sort((a, b) => a.tmean - b.tmean)[0];
  const wettest = withRain.length ? withRain.slice().sort((a, b) => b.precipMm - a.precipMm)[0] : null;
  const driest = withRain.length ? withRain.slice().sort((a, b) => a.precipMm - b.precipMm)[0] : null;
  const windiest = withWind.length ? withWind.slice().sort((a, b) => b.wind - a.wind)[0] : null;

  // Runs of consecutive comfortable months, wrapping December to January,
  // because a southern hemisphere season crosses the year boundary and a
  // straight month list would report it as two separate halves.
  const runs = [];
  let current = null;
  for (const m of [...months, ...months]) {
    if (m.inBand && !m.windy) {
      if (current && current.at(-1).month === (m.month === 1 ? 12 : m.month - 1)) current.push(m);
      else { current = [m]; runs.push(current); }
    } else current = null;
  }
  // The doubled list makes a run that wraps the year visible, and it also lets
  // a city where every month qualifies produce a run of twenty four. The cap
  // and the deduplication put that back to a year.
  const longest = runs.sort((a, b) => b.length - a.length)[0] || null;
  const season = longest ? [...new Set(longest.map((m) => m.month))].slice(0, 12) : [];

  return {
    entity,
    activity: split.activity,
    cityId: split.cityId,
    cityName: cityName(split.cityId, language) || climate.name,
    iso2: climate.iso2,
    period: climate.period,
    band,
    months,
    good,
    goodCount: good.length,
    // The comfortable stretch, deduplicated back into real months.
    season,
    hottest,
    coldest,
    wettest,
    driest,
    windiest,
    windyMonths: months.filter((m) => m.windy).map((m) => m.month),
    // A city where no month falls in the band is a real answer and not an
    // error: Dubai is outside the running band for eight months of the year.
    noGoodMonth: good.length === 0,
  };
}

export const MONTH_NAMES_EN = MONTHS;

// The provenance row, in the shape the page renderer expects: a named
// provider, the dataset it came from, the licence, when it was observed and how
// much confidence the value carries. The activity bands are not part of the
// provenance because they are not part of the source: they are this
// programme's own convention and the page says so in its own sentence.
export function sourceRecord() {
  const s = climateSource();
  return {
    ...s,
    confidence: s.confidence || 'official-proxy',
    note: 'The comfortable temperature band for each activity is a stated convention rather than a measurement, and it is printed on the page.',
  };
}

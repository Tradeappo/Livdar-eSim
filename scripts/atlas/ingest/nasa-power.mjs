// NASA POWER daily point data, 2011-01-01 to 2020-12-31, reduced to monthly
// normals per city. Only cities in the requested list are fetched; the API is
// free but slow, so the lot being prepared decides what is fetched.
//
//   node scripts/ingest/nasa-power.mjs 2643743 2988507      by GeoNames id
//   node scripts/ingest/nasa-power.mjs --top 50              largest cities

import { fetchWithRetry, readJson, writeJson, recordSource } from './lib.mjs';

const START = '20110101';
const END = '20201231';
const PARAMS = ['T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'RH2M', 'WS2M'];

// Reduces the daily series to twelve months. Missing values (-999) are skipped;
// a month with fewer than 250 valid days over the ten years is rejected.
export function reduceDaily(parameter) {
  const acc = Array.from({ length: 12 }, () => ({ tmax: [], tmin: [], tmean: [], rh: [], wind: [], precipByYear: {}, wetByYear: {}, days: 0 }));
  const dates = Object.keys(parameter.T2M_MAX);
  dates.forEach((d) => {
    const y = d.slice(0, 4);
    const m = Number(d.slice(4, 6)) - 1;
    const a = acc[m];
    const v = (p) => { const x = parameter[p][d]; return x === -999 || x == null ? null : x; };
    if (v('T2M_MAX') == null || v('T2M_MIN') == null) return;
    a.days++;
    a.tmax.push(v('T2M_MAX'));
    a.tmin.push(v('T2M_MIN'));
    if (v('T2M') != null) a.tmean.push(v('T2M'));
    if (v('RH2M') != null) a.rh.push(v('RH2M'));
    if (v('WS2M') != null) a.wind.push(v('WS2M'));
    const p = v('PRECTOTCORR');
    if (p != null) {
      a.precipByYear[y] = (a.precipByYear[y] || 0) + p;
      a.wetByYear[y] = (a.wetByYear[y] || 0) + (p >= 1 ? 1 : 0);
    }
  });
  const mean = (xs) => xs.reduce((t, x) => t + x, 0) / xs.length;
  const r1 = (x) => Math.round(x * 10) / 10;
  return acc.map((a) => {
    if (a.days < 250) return null;
    return {
      tmax: r1(mean(a.tmax)),
      tmin: r1(mean(a.tmin)),
      tmean: r1(mean(a.tmean)),
      precipMm: r1(mean(Object.values(a.precipByYear))),
      wetDays: r1(mean(Object.values(a.wetByYear))),
      rh: r1(mean(a.rh)),
      wind: r1(mean(a.wind)),
    };
  });
}

export async function fetchCity(c) {
  const url = 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=' + PARAMS.join(',') + '&community=RE&longitude=' + c.lon + '&latitude=' + c.lat + '&start=' + START + '&end=' + END + '&format=JSON';
  const j = await (await fetchWithRetry(url)).json();
  const months = reduceDaily(j.properties.parameter);
  if (months.some((m) => m == null)) throw new Error('incomplete series for ' + c.id);
  const [lon, lat] = j.geometry.coordinates;
  return { period: '2011-2020', cell: { lat, lon }, months, fetchedAt: new Date().toISOString() };
}

export async function run(ids) {
  const cities = readJson('entities/cities.json', []);
  const climate = readJson('entities/climate.json', {});
  const want = ids.map(String);
  let ok = 0;
  for (const id of want) {
    const c = cities.find((x) => String(x.id) === id);
    if (!c) continue;
    try {
      climate[id] = await fetchCity(c);
      ok++;
      console.log('climate', id, c.name);
    } catch (e) {
      console.error('climate failed', id, c.name, e.message);
    }
    await new Promise((res) => setTimeout(res, 1500));
  }
  writeJson('entities/climate.json', climate);
  recordSource('nasa-power-daily', { url: 'https://power.larc.nasa.gov/api/temporal/daily/point', rows: Object.keys(climate).length, period: START + '-' + END });
  return ok;
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const args = process.argv.slice(2);
  let ids = args;
  if (args[0] === '--top') ids = readJson('entities/cities.json', []).slice(0, Number(args[1]) || 20).map((c) => c.id);
  if (args[0] === '--lot') ids = readJson('lots/' + args[1] + '.json', { cities: [] }).cities;
  run(ids).then((n) => console.log('climate fetched:', n));
}

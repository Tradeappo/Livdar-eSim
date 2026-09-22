// Derived facts for one entity. Every value carries the source ids it came
// from, so QA can prove that each number printed on a page is traceable.

import { distanceKm, offsetsForYear, formatOffset, utcOffsetMinutes } from './geo.js';
import { sunTimes } from './solar.js';
import { travelAirports } from './taxonomy.js';

const YEAR = 2026;

export function cityFacts(ds, cityId) {
  const c = ds.cityById.get(String(cityId));
  if (!c) return null;
  const country = ds.countries[c.iso2] || null;
  const tz = c.timezone ? offsetsForYear(c.timezone, YEAR) : null;
  const solstices = [
    { key: 'june', ...sunTimes(c.lat, c.lon, YEAR, 5, 21) },
    { key: 'december', ...sunTimes(c.lat, c.lon, YEAR, 11, 21) },
  ];
  const longest = Math.max(...solstices.map((s) => s.dayLengthMinutes));
  const shortest = Math.min(...solstices.map((s) => s.dayLengthMinutes));
  const airports = travelAirports(ds)
    .map((a) => ({ a, km: distanceKm(c, a) }))
    .filter((x) => x.km <= 150)
    .sort((x, y) => x.km - y.km)
    .slice(0, 4);
  const climate = ds.climate[String(cityId)] || null;
  return {
    city: c,
    country,
    tz: tz && { ...tz, janLabel: formatOffset(tz.jan), julLabel: formatOffset(tz.jul), src: ['geonames-cities', 'iana-tz'] },
    daylight: { longest, shortest, src: ['computed-solar'] },
    airports: airports.map((x) => ({ iata: x.a.iata, name: x.a.name, km: x.km, type: x.a.type, src: ['ourairports', 'computed-distance'] })),
    climate,
  };
}

// Twelve months of climate plus daylight on the 15th, local clock time.
export function monthTable(ds, cityId) {
  const c = ds.cityById.get(String(cityId));
  const clim = ds.climate[String(cityId)];
  if (!c || !clim || !Array.isArray(clim.months) || clim.months.length !== 12) return null;
  return clim.months.map((m, i) => {
    const sun = sunTimes(c.lat, c.lon, YEAR, i, 15);
    const offset = c.timezone ? utcOffsetMinutes(c.timezone, new Date(Date.UTC(YEAR, i, 15, 12))) : 0;
    return {
      month: i,
      tmean: m.tmean,
      tmax: m.tmax,
      tmin: m.tmin,
      precipMm: m.precipMm,
      wetDays: m.wetDays,
      rh: m.rh,
      wind: m.wind,
      sun,
      offset,
    };
  });
}

export function rankOf(values, index, direction = 'desc') {
  const sorted = values.map((v, i) => ({ v, i })).sort((a, b) => (direction === 'desc' ? b.v - a.v : a.v - b.v));
  return sorted.findIndex((x) => x.i === index) + 1;
}

// The city an airport serves: the nearest city of the dataset, preferring one
// whose name matches the OurAirports municipality.
export function servedCity(ds, airport) {
  const near = ds.cities
    .map((c) => ({ c, km: distanceKm(c, airport) }))
    .filter((x) => x.km <= 80)
    .sort((a, b) => a.km - b.km);
  if (!near.length) return null;
  const muni = (airport.municipality || '').toLowerCase();
  const named = near.find((x) => x.c.name.toLowerCase() === muni || (x.c.asciiName || '').toLowerCase() === muni);
  const largest = near.slice().sort((a, b) => b.c.population - a.c.population)[0];
  return { match: named || near[0], largest };
}

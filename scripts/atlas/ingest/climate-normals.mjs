// Climate normals, gated and normalised into the published source store.
//
//   node scripts/atlas/ingest/climate-normals.mjs            report only
//   node scripts/atlas/ingest/climate-normals.mjs --write    write the store
//
// The capture this reads came from the NASA POWER climatology endpoint, which
// returns the provider's own twenty year monthly normals rather than ten years
// of daily rows reduced in the client. That matters for a reason worth stating
// once: the older `nasa-power-daily` store reduced 2011-2020 dailies per city,
// so a city added later could silently sit on a different period than its
// neighbours and a country answer computed across them would be comparing two
// climates measured over two decades. The climatology endpoint puts every city
// on 2001-2020, and the period gate below refuses the mixture outright.
//
// The capture was fetched through a browser tab because the sandbox has no
// network route to the host. That is why this script is a gate over a capture
// rather than a fetcher: the fetching and the gating are separated so the
// expensive half never has to be repeated to re-run the cheap half.
//
// Six gates decide what is kept, and each of them can reject a real row:
//
//   a city whose id is not in the entity store has no page to hang from
//   a country code that disagrees with the entity store means the capture and
//     the store are describing two different places under one id
//   a grid cell far from the city is describing somewhere else
//   a month whose minimum exceeds its maximum is not a month
//   a value outside the physical range is a parse error, not a climate
//   a precipitation total that does not match its own daily rate is a unit
//     slip, which is the one error in this data that looks entirely plausible

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { loadCity } from '../../../lib/atlas/store.js';
import { make as makeProvenance, validate as validateProvenance } from '../../../lib/atlas/sources/provenance.js';
import { check as freshnessCheck } from '../../../lib/atlas/sources/freshness.js';

const ROOT = new URL('../../../', import.meta.url);

export const SOURCE_ID = 'climate-normals-verified';
export const LICENCE = "CC BY 4.0; 'There are no restrictions on the use, access, and/or download of data from the NASA POWER Project' (AWS Open Data Registry entry)";
export const ATTRIBUTION = 'NASA Langley Research Center POWER Project, funded through the NASA Earth Science Directorate Applied Science Program';

// The period every city has to be on. A store mixing periods would let a
// country answer compare one city's 2001-2020 against another's 2011-2020,
// and the difference between those two decades is not nothing.
export const PERIOD = '2001-2020';

// What the provider's fields actually mean, which is not what their names
// suggest and is the single most important thing in this file.
//
// The climatology endpoint returns T2M as a genuine monthly mean: Tokyo comes
// back at 26.9 in August against a published normal of 26.4, and Reykjavik at
// 11.1 in July against 11.2. Those are normals and they can be scored.
//
// T2M_MAX and T2M_MIN are not the mean daily maximum and minimum. They are the
// extreme values over the whole twenty year period, which is why London
// arrives with a January minimum of -8.2 and a July maximum of 34.0, and why
// every city in the capture shows a month range above eighteen degrees where a
// real mean diurnal range is closer to eight. A comfort model built on those
// is not describing a typical day, it is describing the worst day in twenty
// years, and it ranked Tokyo in January above Tokyo in May.
//
// So they are stored under names that say what they are, and a capture level
// assertion refuses a capture whose ranges collapse to a mean diurnal spread,
// because that would mean the provider changed the field meaning under us.
//
// That assertion is deliberately not a per city gate. A narrow range is real
// for a maritime cell: Phuket, Jakarta and Denpasar sit in grid cells that are
// mostly ocean, the sea surface barely moves across a year, and their extreme
// ranges are four to twelve degrees while Bangkok in the same capture runs to
// twenty seven. Rejecting those cities individually would throw away three
// correct tropical cities to catch an error that, if it ever happens, will
// show up in every city at once. So the median across the whole capture
// decides, and one narrow city is left alone.
export const EXTREME_MEDIAN_RANGE_C = 12;

// Physical ranges. These are wide on purpose: the job is to catch a parse
// error or a unit slip, not to second guess a climate. The record extremes
// are about -68 and 57 degrees, so anything outside this is not a reading.
export const RANGES = {
  tmaxExtreme: [-70, 60],
  tminExtreme: [-80, 45],
  tmean: [-75, 50],
  // Cherrapunji clears 2,500mm in a single month. The ceiling is set above
  // any city in this capture could reach while still catching a value that
  // arrived as a daily rate multiplied by the wrong number.
  precipMm: [0, 4000],
  rh: [0, 100],
  wind: [0, 60],
};

// How far the model cell may sit from the city it stands for. POWER cells are
// 0.5 by 0.625 degrees, so a correctly matched cell centre lands within a few
// tens of kilometres; this capture holds the city coordinates themselves.
// Eighty kilometres allows the cell centre convention to change without a
// false failure and still refuses a cell for the next city along the coast.
export const MAX_CELL_KM = 80;

// Precipitation arrives from the provider as mm/day and is stored as a monthly
// total. The two have to agree, or one of them was converted twice. The
// tolerance is generous because the daily rate is published rounded to one
// decimal, which on a short month is worth a couple of millimetres.
export const PRECIP_TOLERANCE_MM = 3.5;
export const PRECIP_TOLERANCE_SHARE = 0.06;

export const DAYS_IN_MONTH = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const R = 6371;
const rad = (d) => (d * Math.PI) / 180;
export function distanceKm(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// The newest capture in the climate source directory. Captures are named with
// the date they were taken so the history stays on disk rather than being
// overwritten by the next run.
export function latestCapture(dir = new URL('data/atlas/sources/climate/', ROOT)) {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => /^nasa-power-climatology-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  if (!files.length) return null;
  return { file: files[files.length - 1], json: JSON.parse(readFileSync(new URL(files[files.length - 1], dir), 'utf8')) };
}

// The capture keeps the provider's own field names, because it is a record of
// what was fetched and renaming it would make it a record of what we thought.
// The rename happens here, on the way into the store, so that everything
// downstream reads a name that matches the meaning.
export function normaliseMonth(m) {
  if (!m || typeof m !== 'object') return m;
  const { tmax, tmin, ...rest } = m;
  return {
    ...rest,
    tmaxExtreme: m.tmaxExtreme !== undefined ? m.tmaxExtreme : tmax,
    tminExtreme: m.tminExtreme !== undefined ? m.tminExtreme : tmin,
  };
}

// Every gate that can reject one month, in one place so the reasons a row was
// dropped can be reported rather than inferred from a smaller count.
export function checkMonths(months) {
  const errors = [];
  if (!Array.isArray(months) || months.length !== 12) return ['not twelve months'];
  months.forEach((m, i) => {
    const at = 'month ' + (i + 1);
    if (!m || typeof m !== 'object') { errors.push(at + ': missing'); return; }
    for (const [field, [lo, hi]] of Object.entries(RANGES)) {
      const v = m[field];
      if (v == null) { errors.push(at + ': missing ' + field); continue; }
      if (typeof v !== 'number' || !Number.isFinite(v)) { errors.push(at + ': ' + field + ' is not a number'); continue; }
      if (v < lo || v > hi) errors.push(at + ': ' + field + ' out of range at ' + v);
    }
    const hi = m.tmaxExtreme;
    const lo = m.tminExtreme;
    if (typeof lo === 'number' && typeof hi === 'number' && lo > hi) {
      errors.push(at + ': extreme minimum ' + lo + ' above extreme maximum ' + hi);
    }
    if (typeof m.tmean === 'number' && typeof lo === 'number' && typeof hi === 'number'
      && (m.tmean < lo - 0.05 || m.tmean > hi + 0.05)) {
      errors.push(at + ': mean ' + m.tmean + ' outside its own extremes');
    }
    // The unit check. A monthly total that does not match its own daily rate
    // is the failure this data can produce while looking entirely reasonable.
    if (typeof m.precipMm === 'number' && typeof m.precipMmPerDay === 'number') {
      const expected = m.precipMmPerDay * DAYS_IN_MONTH[i];
      const slack = Math.max(PRECIP_TOLERANCE_MM, expected * PRECIP_TOLERANCE_SHARE);
      if (Math.abs(m.precipMm - expected) > slack) {
        errors.push(at + ': precipitation total ' + m.precipMm + 'mm does not match ' + m.precipMmPerDay + 'mm/day over ' + DAYS_IN_MONTH[i] + ' days');
      }
    }
  });
  return errors;
}

// One city, against the entity store. Returns the row to keep or the reasons
// it cannot be kept.
export function checkCity(id, row, city = loadCity(id)) {
  const errors = [];
  if (!city) return { errors: ['no city ' + id + ' in the entity store'] };
  if (!row.iso2) errors.push('capture carries no country code');
  else if (city.country && city.country !== row.iso2) {
    errors.push('country ' + row.iso2 + ' in the capture, ' + city.country + ' in the entity store');
  }
  if (row.period !== PERIOD) errors.push('period ' + row.period + ', expected ' + PERIOD);
  if (!row.cell || typeof row.cell.lat !== 'number' || typeof row.cell.lon !== 'number') errors.push('no grid cell recorded');
  else {
    const km = distanceKm({ lat: city.lat, lon: city.lon }, row.cell);
    if (km > MAX_CELL_KM) errors.push('grid cell ' + Math.round(km) + 'km from the city');
  }
  const months = Array.isArray(row.months) ? row.months.map(normaliseMonth) : row.months;
  errors.push(...checkMonths(months));
  if (errors.length) return { errors };
  return {
    errors: [],
    kept: {
      cityId: String(id),
      name: city.name,
      iso2: row.iso2,
      period: row.period,
      cell: row.cell,
      cellKm: Math.round(distanceKm({ lat: city.lat, lon: city.lon }, row.cell) * 10) / 10,
      sources: row.sources || null,
      months: months.map((m) => ({
        tmean: m.tmean,
        tmaxExtreme: m.tmaxExtreme,
        tminExtreme: m.tminExtreme,
        precipMm: m.precipMm, precipMmPerDay: m.precipMmPerDay,
        rh: m.rh, wind: m.wind,
      })),
    },
  };
}

// The capture level assertion described above. Returns null when the capture
// looks like extremes, or a reason when it does not.
export function extremeRangeCheck(rows) {
  const ranges = [];
  for (const row of Object.values(rows || {})) {
    for (const raw of row.months || []) {
      const m = normaliseMonth(raw);
      if (typeof m.tmaxExtreme === 'number' && typeof m.tminExtreme === 'number') ranges.push(m.tmaxExtreme - m.tminExtreme);
    }
  }
  if (!ranges.length) return { median: null, reason: 'no temperature ranges in the capture' };
  ranges.sort((a, b) => a - b);
  const median = Math.round(ranges[Math.floor(ranges.length / 2)] * 10) / 10;
  return {
    median,
    reason: median < EXTREME_MEDIAN_RANGE_C
      ? 'median extreme range of ' + median + ' degrees across the capture is too narrow to be a twenty year extreme, so the provider may now be returning mean daily values and the comfort model must be revisited before publishing'
      : null,
  };
}

export function run({ capture = latestCapture(), now = new Date() } = {}) {
  if (!capture) throw new Error('no climatology capture found under data/atlas/sources/climate/');
  const { file, json } = capture;
  const rows = json.rows || {};
  const extremes = extremeRangeCheck(rows);
  if (extremes.reason) throw new Error(extremes.reason);
  const cities = {};
  const rejected = {};
  let seen = 0;

  for (const [id, row] of Object.entries(rows)) {
    seen++;
    const r = checkCity(id, row);
    if (r.errors.length) { rejected[id] = r.errors; continue; }
    cities[String(id)] = r.kept;
  }

  const byCountry = {};
  for (const c of Object.values(cities)) byCountry[c.iso2] = (byCountry[c.iso2] || 0) + 1;

  // The observation date is the end of the normals period, not the day the
  // capture was taken. A twenty year normal observed in 2020 is exactly what
  // it is, and dating it 2026 would claim a currency it does not have.
  const observedAt = PERIOD.slice(-4);
  const provenance = makeProvenance({
    // One representative value so the record can be validated as a whole.
    // Every published figure carries this same shape at the point of use.
    value: Object.keys(cities).length,
    unit: 'cities with twelve month normals',
    source: 'NASA POWER',
    sourceRef: json.endpoint || 'https://power.larc.nasa.gov/api/temporal/climatology/point',
    entity: 'global',
    observedAt,
    confidence: 'official-proxy',
    licence: LICENCE,
    note: 'Modelled values for a 0.5 by 0.625 degree MERRA-2 grid cell. They describe the area around the city rather than a weather station, and a page built on them says so.',
  });

  return {
    source: SOURCE_ID,
    provider: 'NASA POWER',
    dataset: 'Climatology endpoint, twenty year monthly normals',
    capture: file,
    endpoint: json.endpoint || null,
    licence: LICENCE,
    attribution: ATTRIBUTION,
    period: PERIOD,
    observedAt,
    capturedOn: json.capturedOn || null,
    ingestedAt: now.toISOString().slice(0, 10),
    freshnessClass: 'reference',
    freshness: freshnessCheck({ observedAt }, 'reference', now),
    confidence: 'official-proxy',
    provenanceErrors: validateProvenance(provenance),
    units: {
      tmean: 'C, monthly mean',
      tmaxExtreme: 'C, highest value in the twenty year period, not a mean daily maximum',
      tminExtreme: 'C, lowest value in the twenty year period, not a mean daily minimum',
      precipMm: 'mm/month', precipMmPerDay: 'mm/day', rh: '%', wind: 'm/s',
    },
    meaning: 'Monthly climate normals for one model grid cell per city, on a single twenty year period so that cities inside a country can be compared with each other. Only tmean is a normal; the two extreme fields describe the worst the period produced and are never scored as though they were a typical day.',
    extremeRangeMedian: extremes.median,
    seen,
    kept: Object.keys(cities).length,
    rejected,
    countries: Object.keys(byCountry).length,
    byCountry,
    unlocks: ['weather.country-best-time'],
    notCovered: {
      station: 'Not a weather station record. A reader wanting the official station series wants the national meteorological service.',
      meanDailyRange: 'The provider publishes extremes rather than mean daily maxima and minima on this endpoint, so no page here may state a typical daytime high or overnight low. That needs the daily endpoint reduced per city.',
      extremes: 'The extreme fields are the whole period, undated. Nothing here says which year produced them or how often they recur.',
      seaTemperature: 'Not in this capture, and a beach page that needs it needs another source.',
    },
    cities,
  };
}

export function normalizedStore(report) {
  const { cities, rejected, ...summary } = report;
  return {
    ...summary,
    rejectedCount: Object.keys(rejected).length,
    cities,
  };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const report = run();
  if (process.argv.includes('--write')) {
    const dir = new URL('data/atlas/sources/climate/', ROOT);
    mkdirSync(dir, { recursive: true });
    writeFileSync(new URL('normals.json', dir), JSON.stringify(normalizedStore(report), null, 1) + '\n');
  }
  const { cities, ...summary } = report;
  console.log(JSON.stringify(summary, null, 1));
}

// Which part of a city to stay in, ordered by where the parts actually are.
//
// The inventory half of this question is blocked: no accommodation listings are
// licensed here, so nothing in this file knows what a night costs or whether
// anything is free. What is built is the district geography, and that answers
// the half of the question a booking site does not: which area, and how far it
// is from the thing the traveller came for.
//
// The anchor is the useful part. A reader going to a stadium, a station or an
// office does not want the centre, they want the nearest area to that point,
// and ordering by distance from a named district is exactly that query.

import { forCity, CENTRAL_KM, OUTER_KM } from '../neighbourhoods.js';

export const REFUSES = [
  'what a night costs in any district, because no inventory is licensed here',
  'whether a room is available, for the same reason',
  'how safe or how noisy a district is, because no measured source for either exists in this programme',
];

const R = 6371;
const toRad = (d) => (d * Math.PI) / 180;
function km(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

// `anchor` is the id or the name of a district in the same city. Without one the
// order is distance from the city centre, which is the default the data already
// carries.
export function stayAreas(cityId, { anchor = null, limit = 12 } = {}) {
  const city = forCity(cityId);
  if (!city) return { ok: false, why: 'no district data for this city' };
  let from = null;
  if (anchor != null) {
    const key = String(anchor).toLowerCase();
    from = city.byDistance.find((d) => String(d.id) === String(anchor) || d.name.toLowerCase() === key) || null;
    if (!from) return { ok: false, why: 'that district is not one of the ' + city.count + ' this city holds' };
  }
  const rows = city.byDistance
    .filter((d) => !from || d.id !== from.id)
    .map((d) => ({
      id: d.id,
      name: d.name,
      distanceKm: from ? km(from, d) : d.distanceKm,
      compass: from ? null : d.compass,
      population: d.population ?? null,
      // Whether a stay there can be walked out of, on the same two thresholds
      // the Areas pages use, so the tool and the page cannot disagree.
      band: (from ? km(from, d) : d.distanceKm) <= CENTRAL_KM ? 'central' : (from ? km(from, d) : d.distanceKm) <= OUTER_KM ? 'inner' : 'outer',
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
  return {
    ok: true,
    cityId: String(cityId),
    cityName: city.cityName,
    orderedBy: from ? 'distance from ' + from.name : 'distance from the city centre',
    anchor: from ? { id: from.id, name: from.name } : null,
    districts: city.count,
    rows,
    refuses: REFUSES,
    attribution: 'GeoNames populated places below city level, attached to the city by proximity (CC BY 4.0)',
  };
}

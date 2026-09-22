// Great circle distance and time zone offsets. Pure functions, no network.

const R = 6371.0088; // mean Earth radius, km (IUGG)

export function distanceKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Offset of an IANA zone from UTC, in minutes, at a given instant.
export function utcOffsetMinutes(timeZone, date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date);
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - date.getTime()) / 60000);
}

// Winter and summer offsets for a year: taken on 15 January and 15 July, which
// is enough to tell whether a zone observes daylight saving time.
export function offsetsForYear(timeZone, year) {
  const jan = utcOffsetMinutes(timeZone, new Date(Date.UTC(year, 0, 15, 12)));
  const jul = utcOffsetMinutes(timeZone, new Date(Date.UTC(year, 6, 15, 12)));
  return { jan, jul, dst: jan !== jul };
}

export function formatOffset(minutes) {
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return 'UTC' + sign + h + (m ? ':' + String(m).padStart(2, '0') : '');
}

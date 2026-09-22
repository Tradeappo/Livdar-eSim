// Sunrise, sunset and day length from coordinates, using the NOAA solar
// calculator equations (Meeus based). Accuracy is within a minute or two for
// latitudes below the polar circles; above them the function reports polar day
// or polar night instead of inventing a time.

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function solarParams(jd) {
  const t = (jd - 2451545) / 36525;
  const l0 = (280.46646 + t * (36000.76983 + t * 0.0003032)) % 360;
  const m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const c = Math.sin(rad(m)) * (1.914602 - t * (0.004817 + 0.000014 * t)) + Math.sin(rad(2 * m)) * (0.019993 - 0.000101 * t) + Math.sin(rad(3 * m)) * 0.000289;
  const trueLong = l0 + c;
  const omega = 125.04 - 1934.136 * t;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(rad(omega));
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(rad(omega));
  const decl = deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lambda))));
  const y = Math.tan(rad(eps / 2)) ** 2;
  const eqTime = 4 * deg(y * Math.sin(2 * rad(l0)) - 2 * e * Math.sin(rad(m)) + 4 * e * y * Math.sin(rad(m)) * Math.cos(2 * rad(l0)) - 0.5 * y * y * Math.sin(4 * rad(l0)) - 1.25 * e * e * Math.sin(2 * rad(m)));
  return { decl, eqTime };
}

// Returns UTC minutes after midnight for sunrise and sunset on the given UTC
// date, plus day length. zenith 90.833 includes refraction and the solar disc.
export function sunTimes(lat, lon, year, month, day) {
  const noonUtc = new Date(Date.UTC(year, month, day, 12));
  const { decl, eqTime } = solarParams(julianDay(noonUtc));
  const cosH = (Math.cos(rad(90.833)) - Math.sin(rad(lat)) * Math.sin(rad(decl))) / (Math.cos(rad(lat)) * Math.cos(rad(decl)));
  if (cosH > 1) return { polar: 'night', dayLengthMinutes: 0 };
  if (cosH < -1) return { polar: 'day', dayLengthMinutes: 1440 };
  const ha = deg(Math.acos(cosH));
  const solarNoon = 720 - 4 * lon - eqTime;
  return {
    polar: null,
    sunriseUtc: solarNoon - 4 * ha,
    sunsetUtc: solarNoon + 4 * ha,
    dayLengthMinutes: 8 * ha,
  };
}

export function formatClock(utcMinutes, offsetMinutes) {
  let m = Math.round(utcMinutes + offsetMinutes);
  m = ((m % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

// Number and unit formatting per locale. Rounding happens here and only here,
// so the QA traceability check can reproduce every printed number.

const loc = (l) => (l === 'en' ? 'en-GB' : l === 'de' ? 'de-DE' : 'ro-RO');

export function num(n, l, digits = 0) {
  return new Intl.NumberFormat(loc(l), { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
}

export function temp(c, l) {
  const r = Math.round(c);
  const s = num(r, l) + ' °C';
  return l === 'en' ? s + ' (' + num(Math.round((c * 9) / 5 + 32), l) + ' °F)' : s;
}

export function km(d, l) {
  return (d < 10 ? num(d, l, 1) : num(Math.round(d), l)) + ' km';
}

export function mm(v, l) {
  return num(Math.round(v), l) + ' mm';
}

export function duration(minutes, l) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (l === 'de') return h + ' Std. ' + m + ' Min.';
  return h + ' h ' + m + ' min';
}

export function list(items, l) {
  return new Intl.ListFormat(loc(l), { style: 'long', type: 'conjunction' }).format(items);
}

export function population(n, l) {
  // Rounded to two significant figures for prose: census counts are not exact
  // to the person, and the page says "about".
  const p = Math.pow(10, Math.max(0, Math.floor(Math.log10(n)) - 1));
  return num(Math.round(n / p) * p, l);
}

export function feetToMetres(ft) {
  return Math.round(ft * 0.3048);
}

// Romanian puts "de" between a number and its noun when the number's last two
// digits are 00 or 20 to 99: "20 de zile", "3 zile", "105 zile".
export function roDe(n) {
  const r = Math.abs(Math.round(n)) % 100;
  return r === 0 && n !== 0 ? ' de ' : r >= 20 ? ' de ' : ' ';
}

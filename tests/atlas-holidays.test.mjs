import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, parseNames, KEPT_TYPE } from '../scripts/atlas/ingest/public-holidays.mjs';
import { countryOf, run as measureCountries, SELF } from '../scripts/atlas/measure-holidays.mjs';
import { regionOf, run as measureRegions, regionTable } from '../scripts/atlas/measure-subdivision-holidays.mjs';
import { forCountry, forSubdivision, subdivisions, countries, store, weekdayOf, nameOf } from '../lib/atlas/holidays.js';
import { build, words, PACKS } from '../lib/atlas/atlas-model.js';
import { FAMILIES } from '../lib/atlas/verticals.js';

const LANGS = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ja'];
const country = (entity, language) => build({ family: 'events.country-holidays', surface: 'pulse', entity, language, market: 'en-US', keyword: 'x' });
const region = (entity, language) => build({ family: 'events.subdivision-holidays', surface: 'pulse', entity, language, market: 'en-US', keyword: 'x' });

test('the parser reads by header name and keeps only public days', () => {
  // The column order differs between countries: some carry Subdivisions
  // before Name and some after, and Germany carries Tags in the middle.
  // Reading by position worked for Spain and silently mangled Germany.
  const es = parseCsv('Id;Country;StartDate;EndDate;Type;RegionalScope;Subdivisions;Name\n1;ES;2026-01-01;;Public;National;;ES Ano Nuevo,EN New Year');
  const de = parseCsv('Id;Country;StartDate;EndDate;Type;RegionalScope;Tags;Name;Subdivisions\n1;DE;2026-01-06;;Public;Regional;;DE Heilige Drei Koenige,EN Epiphany;BW,BY,ST');
  assert.equal(es[0].Name, 'ES Ano Nuevo,EN New Year');
  assert.equal(de[0].Name, 'DE Heilige Drei Koenige,EN Epiphany');
  assert.equal(de[0].Subdivisions, 'BW,BY,ST');
  assert.equal(KEPT_TYPE, 'Public');

  // A name is one cell holding every language, and splitting on the comma
  // alone breaks any name that contains one.
  const n = parseNames("ES Dia de la Constitucion, Espana,EN Constitution Day,DE Verfassungstag");
  assert.equal(n.es, 'Dia de la Constitucion, Espana');
  assert.equal(n.en, 'Constitution Day');
  assert.equal(n.de, 'Verfassungstag');
});

test('a day everyone gets is told apart from a day the region sets', () => {
  // German public holidays are state law, so the source marks New Year's Day
  // `Regional`. All sixteen states keep it. Reading that field instead of the
  // subdivision list produced a German page with one public holiday on it.
  const de = forCountry('DE');
  assert.equal(de.everywhere.length, 9, 'Germany has ' + de.everywhere.length + ' days that apply everywhere');
  const newYear = de.days.find((h) => h.date.endsWith('-01-01'));
  assert.ok(newYear.everywhere, 'New Year is not marked as applying everywhere');
  assert.equal(newYear.legislatedNationally, false, 'the source does say it is regional law, and that is the trap');
  const epiphany = de.days.find((h) => h.date.endsWith('-01-06'));
  assert.equal(epiphany.everywhere, false);
  assert.deepEqual(epiphany.subdivisions, ['BW', 'BY', 'ST']);

  // Switzerland is the other end of the same rule.
  const ch = forCountry('CH');
  assert.ok(ch.everywhere.length <= 5, 'Switzerland should have almost nothing nationwide, has ' + ch.everywhere.length);
  assert.ok(ch.regional.length > 20);
});

test('a country whose dates stop before this year is left out', () => {
  const s = store();
  // Brazil is in the data set and stops at 2025. `feriados 2026` is 705,000
  // searches a month and publishing last year's dates against it would be
  // worse than publishing nothing.
  assert.ok(s.staleBeforeWindow.some((x) => x.startsWith('BR:')), 'Brazil is not recorded as stale');
  assert.equal(forCountry('BR'), null);
  assert.ok(!countries().includes('BR'));
  for (const iso of countries()) {
    const d = forCountry(iso);
    assert.equal(d.year, s.window[0], iso + ' is not on the current year');
    assert.ok(d.days.length > 0);
  }
});

test('the weekday comes from the date and not from a time zone', () => {
  // Constructing a Date from the string alone puts it at midnight UTC and
  // moves it across a day boundary for half the world.
  assert.equal(weekdayOf('2026-01-01'), 'thursday');
  assert.equal(weekdayOf('2026-10-03'), 'saturday');
  const de = forCountry('DE');
  for (const h of de.days) assert.equal(h.weekday, weekdayOf(h.date));
});

test('a region page is the country list plus its own, and says how many more', () => {
  const by = forSubdivision('DE', 'BY');
  const de = forCountry('DE');
  assert.equal(by.countryDays, de.everywhere.length);
  assert.equal(by.days.length, de.everywhere.length + by.own.length);
  assert.equal(by.moreThanCountry, by.own.length);
  assert.ok(by.own.length >= 4, 'Bavaria should carry its own days, has ' + by.own.length);
  // A day kept in one town inside the region is not a day the region keeps,
  // and putting it on the region page would tell most of Bavaria it has a day
  // off it does not have.
  for (const h of by.days) assert.ok(h.everywhere || h.subdivisions.includes('BY'));
  for (const h of by.insideOnly) assert.ok(!h.subdivisions.includes('BY'));
});

test('both pages build in every language and no two read alike', () => {
  const seen = new Set();
  const countryMin = FAMILIES['events.country-holidays'].minWords;
  const regionMin = FAMILIES['events.subdivision-holidays'].minWords;
  for (const l of LANGS) {
    assert.ok(PACKS[l].holidays, l + ' has no holidays copy');
    for (const iso of ['DE', 'FR', 'NL', 'PL', 'ES', 'IT']) {
      const m = country(iso, l);
      assert.ok(!m.refused, l + '/' + iso + ' refused: ' + m.refused);
      const w = words(m);
      assert.ok(w.count >= countryMin, l + '/' + iso + ' is ' + w.count + ' ' + w.unit);
      const body = m.paragraphs.join(' ');
      assert.ok(!seen.has(body), 'two pages share a body: ' + l + '/' + iso);
      seen.add(body);
    }
    for (const e of ['DE-BY', 'DE-NW', 'ES-MD']) {
      const m = region(e, l);
      assert.ok(!m.refused, l + '/' + e + ' refused: ' + m.refused);
      assert.ok(words(m).count >= regionMin, l + '/' + e + ' is ' + words(m).count);
      const body = m.paragraphs.join(' ');
      assert.ok(!seen.has(body), 'two pages share a body: ' + l + '/' + e);
      seen.add(body);
    }
  }
});

test('the numbers in the sentences agree with the numbers in the table', () => {
  const m = country('DE', 'de');
  const d = forCountry('DE');
  assert.equal(m.table.rows.length, Math.min(60, d.days.length));
  const everywhereRows = m.table.rows.filter((r) => r.cells[3] === PACKS.de.holidays.table.everywhere);
  assert.equal(everywhereRows.length, d.everywhere.length);
  const facts = Object.fromEntries(m.facts.map((f) => [f.label, f.value]));
  assert.equal(facts[PACKS.de.holidays.facts.everywhere], String(d.everywhere.length));
  assert.equal(facts[PACKS.de.holidays.facts.weekend], String(d.lostToWeekend.length));
});

test('Polish counts in three and a count of one is its own sentence', () => {
  const pl = PACKS.pl.holidays;
  // Two, three and four take a plural verb; five and above take a singular
  // one. One template printed `3 wypada` where it has to be `3 wypadaja`.
  assert.match(pl.longWeekend({ n: 3, names: 'A', nForm: pl.nForm }), /3 wypadają/);
  assert.match(pl.longWeekend({ n: 6, names: 'A', nForm: pl.nForm }), /6 wypada/);
  assert.equal(pl.nForm(1, 'a', 'b', 'c'), 'a');
  assert.equal(pl.nForm(12, 'a', 'b', 'c'), 'c', 'twelve is not two');
  assert.equal(pl.nForm(22, 'a', 'b', 'c'), 'b');
  // Switzerland has exactly one nationwide day on a weekend and one that makes
  // a long weekend, which is the case the singular sentences exist for.
  const ch = forCountry('CH');
  assert.equal(ch.lostToWeekend.length, 1);
  for (const l of LANGS) {
    const m = country('CH', l);
    assert.ok(!m.refused, l + '/CH refused: ' + m.refused);
    assert.ok(m.paragraphs.some((p) => p === PACKS[l].holidays.weekendOne({ year: ch.year, everywhere: ch.everywhere.length, names: nameOf(ch.lostToWeekend[0], l) })), l + ' does not use the singular weekend sentence');
  }
});

test('an unqualified head term means the market own country, and a region does not', () => {
  const covered = countries();
  // The largest terms in this family carry no country at all, because the
  // person asking is in the country they are asking about.
  assert.equal(countryOf('feiertage 2026', 'de-DE', covered).iso2, 'DE');
  assert.equal(countryOf('jours fériés 2026', 'fr-FR', covered).iso2, 'FR');
  assert.equal(countryOf('feestdagen 2026', 'nl-NL', covered).iso2, 'NL');
  assert.equal(SELF['de-DE'], 'DE');
  // A named country still wins over the implication.
  assert.equal(countryOf('feestdagen duitsland', 'nl-NL', covered).iso2, 'DE');
  assert.equal(countryOf('dni wolne w niemczech 2026', 'pl-PL', covered).iso2, 'DE');
  // A region is not a country, and a city is neither.
  assert.equal(countryOf('feiertage nrw 2026', 'de-DE', covered).iso2, undefined);
  assert.equal(countryOf('feiertage münchen', 'de-DE', covered).iso2, undefined);
  assert.equal(regionOf('feiertage nrw 2026', 'de-DE').entity, 'DE-NW');
  assert.equal(regionOf('feiertage bayern 2026', 'de-DE').entity, 'DE-BY');
  assert.equal(regionOf('festivos madrid 2026', 'es-ES').entity, 'ES-MD');
  assert.equal(regionOf('feiertage münchen', 'de-DE').entity, undefined, 'a city resolved to a state');
  assert.equal(regionOf('feiertage 2026', 'de-DE').entity, undefined);
  // The region table is built from the source, so it names what the source
  // names and nothing else.
  assert.equal(regionTable('de').get('bayern'), 'DE-BY');
  assert.equal(regionTable('en').get('bavaria'), 'DE-BY');
});

test('the demand the source cannot serve is measured rather than dropped', () => {
  const r = measureCountries();
  assert.ok(r.pairs >= 8, 'only ' + r.pairs + ' country pages');
  // Brazil is the largest measured demand in the programme and none of it can
  // be answered. Counting it as not a country would hide that.
  assert.ok(r.unservedDemand.some((x) => x.startsWith('feriados 2026: 705000')), 'the Brazilian gap is not reported');
  assert.ok(r.unservedVolume > 1000000, 'unserved volume is ' + r.unservedVolume);
  for (const row of r.rows) assert.ok(countries().includes(row.entity), row.entity + ' was planned with no data');

  const rr = measureRegions();
  assert.ok(rr.pairs >= 14, 'only ' + rr.pairs + ' region pages');
  assert.ok(rr.totalVolume > 700000, 'region volume is ' + rr.totalVolume);
  const known = new Set(subdivisions().map((s) => s.entity));
  for (const row of rr.rows) assert.ok(known.has(row.entity), row.entity + ' is not a region the source carries');
});

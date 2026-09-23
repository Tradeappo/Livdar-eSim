// Page models. A model is the whole content of a page as data: title, meta,
// headings, paragraphs, fact rows, FAQ, links and sources. The renderer turns
// it into HTML; a future design renders the same model, so content and URLs do
// not change when the design does.
//
// Sentences are chosen by the data (thresholds, comparisons, presence of a
// value), never at random, and every number comes from lib/facts.mjs.

import { LOCALES, MONTHS, regionName, currencyName, languageName } from './i18n.js';
import { FAMILIES, pathFor, absolute, pageKey } from './taxonomy.js';
import { hubCrumb } from './hub.js';
import { cityFacts, monthTable, rankOf, servedCity } from './facts.js';
import { distanceKm } from './geo.js';
import { formatClock } from './solar.js';
import * as f from './format.js';

const T = {
  en: {
    home: 'Livdar', cities: 'Cities', airports: 'Airports',
    guideTitle: (c) => c + ' travel essentials: time, money, plugs and airports',
    guideH1: (c) => c + ': travel essentials',
    monthTitle: (c, m) => c + ' weather in ' + m + ': temperatures, rain and daylight',
    monthH1: (c, m) => 'Weather in ' + c + ' in ' + m,
    airportTitle: (n, code) => n + ' (' + code + '): location, distance to the city and time zone',
    sources: 'Sources', facts: 'At a glance', faq: 'Questions',
    related: 'Related pages', allMonths: 'Month by month',
  },
  de: {
    home: 'Livdar', cities: 'Städte', airports: 'Flughäfen',
    guideTitle: (c) => c + ' Reiseinfos: Zeit, Geld, Stecker und Flughäfen',
    guideH1: (c) => c + ': Reiseinfos',
    monthTitle: (c, m) => 'Wetter in ' + c + ' im ' + m + ': Temperaturen, Regen, Tageslicht',
    monthH1: (c, m) => 'Wetter in ' + c + ' im ' + m,
    airportTitle: (n, code) => n + ' (' + code + '): Lage, Entfernung zur Stadt, Zeitzone',
    sources: 'Quellen', facts: 'Auf einen Blick', faq: 'Fragen',
    related: 'Weitere Seiten', allMonths: 'Monat für Monat',
  },
  ro: {
    home: 'Livdar', cities: 'Orașe', airports: 'Aeroporturi',
    guideTitle: (c) => c + ': informații de călătorie, oră, bani, prize și aeroporturi',
    guideH1: (c) => c + ': informații de călătorie',
    monthTitle: (c, m) => 'Vremea în ' + c + ' în ' + m + ': temperaturi, ploaie, lumină',
    monthH1: (c, m) => 'Vremea în ' + c + ' în ' + m,
    airportTitle: (n, code) => n + ' (' + code + '): locație, distanța până în oraș, fus orar',
    sources: 'Surse', facts: 'Pe scurt', faq: 'Întrebări',
    related: 'Pagini înrudite', allMonths: 'Lună de lună',
  },
};

const cityName = (c, l) => (c.names && c.names[l]) || c.name;

function cut(text, max) {
  if (text.length <= max) return text;
  const s = text.slice(0, max - 1);
  return s.slice(0, s.lastIndexOf(' ')) + '…';
}

// ---------------------------------------------------------------- city guide

function plugSentence(country, l) {
  const types = country.plugTypes || [];
  if (!types.length) return null;
  const v = country.voltage;
  const has = (t) => types.includes(t);
  const listed = f.list(types.map((t) => (l === 'en' ? 'type ' : l === 'de' ? 'Typ ' : 'tip ') + t), l);
  if (l === 'en') {
    const us = has('A') || has('B') ? 'US plugs fit' : 'US plugs need an adapter';
    const uk = has('G') ? 'UK plugs fit' : 'UK plugs need an adapter';
    return 'Sockets are ' + listed + (v ? ', at ' + v + ' V' : '') + '. ' + us + ' and ' + uk + '.' + (v && Number(v) >= 200 ? ' Devices sold only for 110 to 120 V need a converter, not just an adapter.' : '');
  }
  const home = l === 'de' ? 'aus Deutschland' : 'din România';
  const schuko = has('F') || has('E');
  if (l === 'de') {
    return 'Steckdosen: ' + listed + (v ? ', ' + v + ' V' : '') + '. ' + (schuko ? 'Stecker ' + home + ' passen ohne Adapter.' : has('C') ? 'Flache Eurostecker passen, Schukostecker brauchen einen Adapter.' : 'Stecker ' + home + ' brauchen einen Adapter.');
  }
  return 'Prizele sunt de ' + listed + (v ? ', la ' + v + ' V' : '') + '. ' + (schuko ? 'Ștecherele ' + home + ' se potrivesc fără adaptor.' : has('C') ? 'Ștecherele plate Europlug se potrivesc, cele cu împământare au nevoie de adaptor.' : 'Ștecherele ' + home + ' au nevoie de adaptor.');
}

function drivingSentence(side, l) {
  if (!side) return null;
  const left = side === 'left';
  if (l === 'en') return 'Traffic drives on the ' + side + '.';
  if (l === 'de') return 'Es herrscht ' + (left ? 'Linksverkehr' : 'Rechtsverkehr') + '.';
  return 'Se circulă pe partea ' + (left ? 'stângă' : 'dreaptă') + '.';
}

export function cityGuideModel(ds, page, isLive) {
  const l = page.locale;
  const fx = cityFacts(ds, page.entity);
  if (!fx) return null;
  const { city: c, country } = fx;
  const name = cityName(c, l);
  const land = regionName(c.iso2, l);
  const t = T[l];
  const sections = [];
  const facts = [];

  // Intro
  const pop = f.population(c.population, l);
  const intro = {
    en: name + ' is a city in ' + land + ' with about ' + pop + ' inhabitants' + (c.elevation != null ? ', at ' + f.num(c.elevation, l) + ' m above sea level' : '') + '. This page collects the practical facts a visitor needs before arriving: the local time, money and phone codes, the plugs, and the nearest airports.',
    de: name + ' liegt in ' + land + ' und hat rund ' + pop + ' Einwohner' + (c.elevation != null ? ', auf ' + f.num(c.elevation, l) + ' m über dem Meer' : '') + '. Hier stehen die praktischen Fakten für die Anreise: Ortszeit, Währung und Vorwahl, Steckdosen und die nächsten Flughäfen.',
    ro: name + ' este un oraș din ' + land + ' cu aproximativ ' + pop + ' de locuitori' + (c.elevation != null ? ', la ' + f.num(c.elevation, l) + ' m altitudine' : '') + '. Aici găsești informațiile practice de care ai nevoie înainte să ajungi: ora locală, moneda și prefixul, prizele și cele mai apropiate aeroporturi.',
  }[l];
  sections.push({ id: 'intro', paragraphs: [intro] });
  facts.push({ label: { en: 'Country', de: 'Land', ro: 'Țara' }[l], value: land, src: ['geonames-cities'] });
  facts.push({ label: { en: 'Population', de: 'Einwohner', ro: 'Populație' }[l], value: f.num(c.population, l), src: ['geonames-cities'] });

  // Time
  if (fx.tz) {
    const { janLabel, julLabel, dst } = fx.tz;
    const p = {
      en: name + ' uses the ' + c.timezone + ' time zone, ' + janLabel + (dst ? ' in January and ' + julLabel + ' in July, because clocks change for daylight saving time.' : ' all year, with no daylight saving time.'),
      de: name + ' liegt in der Zeitzone ' + c.timezone + ', ' + janLabel + (dst ? ' im Januar und ' + julLabel + ' im Juli, weil die Uhren auf Sommerzeit umgestellt werden.' : ' das ganze Jahr, ohne Sommerzeit.'),
      ro: name + ' folosește fusul orar ' + c.timezone + ', ' + janLabel + (dst ? ' în ianuarie și ' + julLabel + ' în iulie, pentru că se trece la ora de vară.' : ' tot anul, fără oră de vară.'),
    }[l];
    const d = {
      en: 'Daylight ranges from ' + f.duration(fx.daylight.shortest, l) + ' on the shortest day to ' + f.duration(fx.daylight.longest, l) + ' on the longest.',
      de: 'Das Tageslicht reicht von ' + f.duration(fx.daylight.shortest, l) + ' am kürzesten bis ' + f.duration(fx.daylight.longest, l) + ' am längsten Tag.',
      ro: 'Lumina zilei variază între ' + f.duration(fx.daylight.shortest, l) + ' în cea mai scurtă zi și ' + f.duration(fx.daylight.longest, l) + ' în cea mai lungă.',
    }[l];
    sections.push({ id: 'time', heading: { en: 'Time and daylight', de: 'Zeit und Tageslicht', ro: 'Ora și lumina zilei' }[l], paragraphs: [p, d] });
    facts.push({ label: { en: 'Time zone', de: 'Zeitzone', ro: 'Fus orar' }[l], value: janLabel + (dst ? ' / ' + julLabel : ''), src: fx.tz.src });
  }

  // Money, phone, power, roads
  if (country) {
    const para = [];
    if (country.currency) {
      para.push({
        en: 'The currency is the ' + currencyName(country.currency, l) + ' (' + country.currency + ').',
        de: 'Währung ist ' + currencyName(country.currency, l) + ' (' + country.currency + ').',
        ro: 'Moneda este ' + currencyName(country.currency, l) + ' (' + country.currency + ').',
      }[l]);
      facts.push({ label: { en: 'Currency', de: 'Währung', ro: 'Monedă' }[l], value: country.currency, src: ['wikidata-countries'] });
    }
    if (country.callingCode) {
      para.push({
        en: 'The country calling code is ' + country.callingCode + (country.emergencyNumber ? ' and the emergency number is ' + country.emergencyNumber : '') + '.',
        de: 'Die Landesvorwahl ist ' + country.callingCode + (country.emergencyNumber ? ', die Notrufnummer ' + country.emergencyNumber : '') + '.',
        ro: 'Prefixul țării este ' + country.callingCode + (country.emergencyNumber ? ', iar numărul de urgență este ' + country.emergencyNumber : '') + '.',
      }[l]);
      facts.push({ label: { en: 'Calling code', de: 'Vorwahl', ro: 'Prefix' }[l], value: country.callingCode, src: ['wikidata-countries'] });
    }
    if (country.officialLanguages && country.officialLanguages.length) {
      const langs = f.list(country.officialLanguages.map((x) => languageName(x, l)), l);
      para.push({
        en: 'Official language' + (country.officialLanguages.length > 1 ? 's: ' : ': ') + langs + '.',
        de: 'Amtssprache' + (country.officialLanguages.length > 1 ? 'n: ' : ': ') + langs + '.',
        ro: 'Limb' + (country.officialLanguages.length > 1 ? 'i oficiale: ' : 'ă oficială: ') + langs + '.',
      }[l]);
    }
    if (para.length) sections.push({ id: 'money', heading: { en: 'Money, phone and language', de: 'Geld, Telefon und Sprache', ro: 'Bani, telefon și limbă' }[l], paragraphs: para });
    const plug = plugSentence(country, l);
    const drive = drivingSentence(country.drivingSide, l);
    if (plug || drive) sections.push({ id: 'power', heading: { en: 'Plugs and roads', de: 'Steckdosen und Straßenverkehr', ro: 'Prize și trafic' }[l], paragraphs: [plug, drive].filter(Boolean) });
    if (country.plugTypes && country.plugTypes.length) facts.push({ label: { en: 'Plugs', de: 'Stecker', ro: 'Prize' }[l], value: country.plugTypes.join(', ') + (country.voltage ? ' · ' + country.voltage + ' V' : ''), src: ['wikidata-countries'] });
  }

  // Airports
  const links = [];
  if (fx.airports.length) {
    const items = fx.airports.map((a) => a.name + ' (' + a.iata + '), ' + f.km(a.km, l));
    const p = {
      en: 'Airports with scheduled flights within 150 km, by straight-line distance: ' + f.list(items, l) + '. Road distance is longer.',
      de: 'Flughäfen mit Linienflügen im Umkreis von 150 km, Luftlinie: ' + f.list(items, l) + '. Die Strecke auf der Straße ist länger.',
      ro: 'Aeroporturi cu zboruri regulate pe o rază de 150 km, în linie dreaptă: ' + f.list(items, l) + '. Distanța pe drum este mai mare.',
    }[l];
    sections.push({ id: 'airports', heading: { en: 'Nearest airports', de: 'Nächste Flughäfen', ro: 'Cele mai apropiate aeroporturi' }[l], paragraphs: [p] });
    fx.airports.forEach((a) => {
      const k = pageKey({ family: 'airport', locale: l, entity: a.iata });
      if (isLive(k)) links.push({ href: pathFor(ds, { family: 'airport', locale: l, entity: a.iata }), text: a.name + ' (' + a.iata + ')' });
    });
  } else {
    sections.push({ id: 'airports', heading: { en: 'Nearest airports', de: 'Nächste Flughäfen', ro: 'Cele mai apropiate aeroporturi' }[l], paragraphs: [{ en: 'No airport with scheduled flights lies within 150 km in straight line.', de: 'Im Umkreis von 150 km Luftlinie gibt es keinen Flughafen mit Linienflügen.', ro: 'Pe o rază de 150 km în linie dreaptă nu există niciun aeroport cu zboruri regulate.' }[l]] });
  }

  // Climate summary, when climate data exists
  const months = monthTable(ds, page.entity);
  if (months) {
    const highs = months.map((m) => m.tmax);
    const warm = highs.indexOf(Math.max(...highs));
    const cold = highs.indexOf(Math.min(...highs));
    const wet = months.map((m) => m.precipMm);
    const wettest = wet.indexOf(Math.max(...wet));
    sections.push({
      id: 'climate',
      heading: { en: 'Climate over the year', de: 'Klima im Jahresverlauf', ro: 'Clima de-a lungul anului' }[l],
      paragraphs: [{
        en: 'Average daytime highs peak in ' + MONTHS.en[warm] + ' at ' + f.temp(highs[warm], l) + ' and bottom out in ' + MONTHS.en[cold] + ' at ' + f.temp(highs[cold], l) + '. The wettest month is ' + MONTHS.en[wettest] + ', with about ' + f.mm(wet[wettest], l) + ' of precipitation.',
        de: 'Die mittleren Tageshöchstwerte liegen im ' + MONTHS.de[warm] + ' bei ' + f.temp(highs[warm], l) + ' und im ' + MONTHS.de[cold] + ' bei ' + f.temp(highs[cold], l) + '. Der nasseste Monat ist der ' + MONTHS.de[wettest] + ' mit rund ' + f.mm(wet[wettest], l) + ' Niederschlag.',
        ro: 'Maximele medii ajung la ' + f.temp(highs[warm], l) + ' în ' + MONTHS.ro[warm] + ' și coboară la ' + f.temp(highs[cold], l) + ' în ' + MONTHS.ro[cold] + '. Cea mai ploioasă lună este ' + MONTHS.ro[wettest] + ', cu aproximativ ' + f.mm(wet[wettest], l) + f.roDe(Math.round(wet[wettest])) + 'precipitații.',
      }[l]],
    });
    for (let m = 0; m < 12; m++) {
      const k = pageKey({ family: 'city-month', locale: l, entity: page.entity, month: m });
      if (isLive(k)) links.push({ href: pathFor(ds, { family: 'city-month', locale: l, entity: page.entity, month: m }), text: T[l].monthH1(name, MONTHS[l][m]) });
    }
  }

  const esim = esimLink(ds, c.iso2, l);
  if (esim) links.push(esim);

  const faq = [];
  if (fx.tz) faq.push({ q: { en: 'What time zone is ' + name + ' in?', de: 'In welcher Zeitzone liegt ' + name + '?', ro: 'Ce fus orar are ' + name + '?' }[l], a: { en: c.timezone + ', ' + fx.tz.janLabel + (fx.tz.dst ? ' in winter and ' + fx.tz.julLabel + ' in summer.' : ' all year.'), de: c.timezone + ', ' + fx.tz.janLabel + (fx.tz.dst ? ' im Winter und ' + fx.tz.julLabel + ' im Sommer.' : ' ganzjährig.'), ro: c.timezone + ', ' + fx.tz.janLabel + (fx.tz.dst ? ' iarna și ' + fx.tz.julLabel + ' vara.' : ' tot anul.') }[l] });
  if (country && country.plugTypes && country.plugTypes.length) faq.push({ q: { en: 'Which plugs are used in ' + name + '?', de: 'Welche Steckdosen gibt es in ' + name + '?', ro: 'Ce prize se folosesc în ' + name + '?' }[l], a: plugSentence(country, l) });
  if (fx.airports.length) faq.push({ q: { en: 'Which airport is closest to ' + name + '?', de: 'Welcher Flughafen liegt am nächsten an ' + name + '?', ro: 'Care este cel mai apropiat aeroport de ' + name + '?' }[l], a: fx.airports[0].name + ' (' + fx.airports[0].iata + '), ' + f.km(fx.airports[0].km, l) + ({ en: ' in straight line.', de: ' Luftlinie.', ro: ' în linie dreaptă.' }[l]) });

  const title = t.guideTitle(name);
  return finish(ds, page, {
    title,
    h1: t.guideH1(name),
    description: cut({ en: 'Local time, currency, calling code, plugs and the nearest airports for ' + name + ', ' + land + ', from open data sources.', de: 'Ortszeit, Währung, Vorwahl, Steckdosen und die nächsten Flughäfen für ' + name + ', ' + land + ', aus offenen Datenquellen.', ro: 'Ora locală, moneda, prefixul, prizele și cele mai apropiate aeroporturi pentru ' + name + ', ' + land + ', din surse de date deschise.' }[l], 160),
    breadcrumbs: [hubCrumb(l, 'city'), { name: land }, { name }],
    sections, facts, faq, links,
    sources: sourcesUsed(ds, entitySources(c).concat(['country-facts-verified', 'iana-tz', 'computed-solar', 'ourairports', 'computed-distance']).concat(months ? ['nasa-power-daily'] : [])),
    schemaType: 'City', geo: { lat: c.lat, lon: c.lon }, placeName: name,
  });
}

// ---------------------------------------------------------------- city month

function feel(tmax, tmin, l) {
  const hot = tmax >= 30, warm = tmax >= 22, mild = tmax >= 14, cool = tmax >= 6, frost = tmin <= 0;
  const txt = {
    en: hot ? 'Days are hot; plan outdoor sightseeing for the morning and evening.' : warm ? 'Days are warm enough for light clothing.' : mild ? 'Days are mild; a light jacket covers most of it.' : cool ? 'Days are cool; bring a warm layer.' : 'Days are cold; winter clothing is needed.',
    de: hot ? 'Die Tage sind heiß; Besichtigungen legt man besser auf Morgen und Abend.' : warm ? 'Die Tage sind warm genug für leichte Kleidung.' : mild ? 'Die Tage sind mild; eine leichte Jacke reicht meistens.' : cool ? 'Die Tage sind kühl; eine warme Schicht gehört ins Gepäck.' : 'Die Tage sind kalt; Winterkleidung ist nötig.',
    ro: hot ? 'Zilele sunt fierbinți; plimbările e mai bine să fie dimineața și seara.' : warm ? 'Zilele sunt suficient de calde pentru haine subțiri.' : mild ? 'Zilele sunt blânde; o geacă subțire e de obicei suficientă.' : cool ? 'Zilele sunt răcoroase; ia un strat călduros.' : 'Zilele sunt reci; ai nevoie de haine de iarnă.',
  }[l];
  const night = frost ? { en: ' Nights often drop below freezing.', de: ' Nachts gibt es oft Frost.', ro: ' Noaptea temperatura scade des sub zero.' }[l] : '';
  return txt + night;
}

export function cityMonthModel(ds, page, isLive) {
  const l = page.locale;
  const c = ds.cityById.get(String(page.entity));
  const months = monthTable(ds, page.entity);
  if (!c || !months) return null;
  const clim = ds.climate[String(page.entity)];
  const m = page.month;
  const cur = months[m];
  const prev = months[(m + 11) % 12];
  const next = months[(m + 1) % 12];
  const name = cityName(c, l);
  const mon = MONTHS[l][m];
  const land = regionName(c.iso2, l);
  const t = T[l];
  const sections = [];
  const facts = [];

  const warmRank = rankOf(months.map((x) => x.tmax), m, 'desc');
  const wetRank = rankOf(months.map((x) => x.precipMm), m, 'desc');
  const rankText = (r, kind) => {
    if (r === 1) return { en: kind === 'warm' ? 'the warmest month of the year' : 'the wettest month of the year', de: kind === 'warm' ? 'der wärmste Monat des Jahres' : 'der nasseste Monat des Jahres', ro: kind === 'warm' ? 'cea mai caldă lună a anului' : 'cea mai ploioasă lună a anului' }[l];
    if (r === 12) return { en: kind === 'warm' ? 'the coldest month of the year' : 'the driest month of the year', de: kind === 'warm' ? 'der kälteste Monat des Jahres' : 'der trockenste Monat des Jahres', ro: kind === 'warm' ? 'cea mai rece lună a anului' : 'cea mai uscată lună a anului' }[l];
    return null;
  };

  const period = clim.period || '2011-2020';
  const intro = {
    en: 'In ' + mon + ', the area around ' + name + ' averages daytime highs of ' + f.temp(cur.tmax, l) + ' and night-time lows of ' + f.temp(cur.tmin, l) + '. ' + feel(cur.tmax, cur.tmin, l),
    de: 'Im ' + mon + ' erreicht die Gegend um ' + name + ' im Mittel Tageshöchstwerte von ' + f.temp(cur.tmax, l) + ' und nächtliche Tiefstwerte von ' + f.temp(cur.tmin, l) + '. ' + feel(cur.tmax, cur.tmin, l),
    ro: 'În ' + mon + ', zona din jurul orașului ' + name + ' are în medie maxime de ' + f.temp(cur.tmax, l) + ' ziua și minime de ' + f.temp(cur.tmin, l) + ' noaptea. ' + feel(cur.tmax, cur.tmin, l),
  }[l];
  sections.push({ id: 'intro', paragraphs: [intro] });

  const dPrev = cur.tmax - prev.tmax;
  const dNext = next.tmax - cur.tmax;
  const trend = (d, l2) => (Math.abs(d) < 1 ? { en: 'about as warm', de: 'etwa gleich warm', ro: 'cam la fel de cald' }[l2] : (d > 0 ? { en: 'warmer', de: 'wärmer', ro: 'mai cald' }[l2] : { en: 'cooler', de: 'kühler', ro: 'mai răcoros' }[l2]));
  const tp = [{
    en: 'Compared with ' + MONTHS.en[(m + 11) % 12] + ', ' + mon + ' is ' + trend(dPrev, l) + (Math.abs(dPrev) >= 1 ? ' by ' + f.num(Math.round(Math.abs(dPrev)), l) + ' °C in daytime highs' : '') + ', and ' + MONTHS.en[(m + 1) % 12] + ' is ' + trend(dNext, l) + (Math.abs(dNext) >= 1 ? ' by ' + f.num(Math.round(Math.abs(dNext)), l) + ' °C' : '') + (Math.abs(dNext) < 1 ? ' as ' : ' than ') + mon + '. The daily average is ' + f.temp(cur.tmean, l) + '.',
    de: 'Verglichen mit dem ' + MONTHS.de[(m + 11) % 12] + ' ist der ' + mon + (Math.abs(dPrev) >= 1 ? ' bei den Höchstwerten um ' + f.num(Math.round(Math.abs(dPrev)), l) + ' °C ' : ' ') + trend(dPrev, l) + ', der ' + MONTHS.de[(m + 1) % 12] + ' ist' + (Math.abs(dNext) >= 1 ? ' um ' + f.num(Math.round(Math.abs(dNext)), l) + ' °C ' : ' ') + trend(dNext, l) + (Math.abs(dNext) < 1 ? ' wie der ' : ' als der ') + mon + '. Das Tagesmittel liegt bei ' + f.temp(cur.tmean, l) + '.',
    ro: 'Față de ' + MONTHS.ro[(m + 11) % 12] + ', în ' + mon + ' este ' + trend(dPrev, l) + (Math.abs(dPrev) >= 1 ? ' cu ' + f.num(Math.round(Math.abs(dPrev)), l) + ' °C la maxime' : '') + ', iar în ' + MONTHS.ro[(m + 1) % 12] + ' este ' + trend(dNext, l) + (Math.abs(dNext) >= 1 ? ' cu ' + f.num(Math.round(Math.abs(dNext)), l) + ' °C' : '') + (Math.abs(dNext) < 1 ? ' ca în ' : ' decât în ') + mon + '. Media zilnică este de ' + f.temp(cur.tmean, l) + '.',
  }[l]];
  const wr = rankText(warmRank, 'warm');
  if (wr) tp.push({ en: mon + ' is ' + wr + '.', de: 'Der ' + mon + ' ist ' + wr + '.', ro: 'Luna ' + mon + ' este ' + wr + '.' }[l]);
  sections.push({ id: 'temperature', heading: { en: 'Temperature', de: 'Temperatur', ro: 'Temperatură' }[l], paragraphs: tp });

  const wetWord = cur.precipMm >= 100 ? 'wet' : cur.precipMm >= 40 ? 'moderate' : 'dry';
  const rp = [{
    en: 'Precipitation averages about ' + f.mm(cur.precipMm, l) + ' over the month, with ' + f.num(Math.round(cur.wetDays), l) + ' days of at least 1 mm. ' + (wetWord === 'wet' ? 'That is a wet month: pack a rain jacket.' : wetWord === 'moderate' ? 'Expect some wet days, but not every day.' : 'Precipitation is rare in this month.') + (cur.tmean <= 2 ? ' With a daily average near or below freezing, some of it can fall as snow.' : ''),
    de: 'Im Mittel fallen im Monat rund ' + f.mm(cur.precipMm, l) + ' Niederschlag, an ' + f.num(Math.round(cur.wetDays), l) + ' Tagen mindestens 1 mm. ' + (wetWord === 'wet' ? 'Das ist ein nasser Monat: eine Regenjacke gehört ins Gepäck.' : wetWord === 'moderate' ? 'Mit einigen nassen Tagen ist zu rechnen, aber nicht mit Dauerregen.' : 'Niederschlag ist in diesem Monat selten.') + (cur.tmean <= 2 ? ' Bei einem Tagesmittel um oder unter null kann ein Teil davon als Schnee fallen.' : ''),
    ro: 'În medie cad aproximativ ' + f.mm(cur.precipMm, l) + f.roDe(Math.round(cur.precipMm)) + 'precipitații în lună, cu ' + f.num(Math.round(cur.wetDays), l) + ' zile de cel puțin 1 mm. ' + (wetWord === 'wet' ? 'Este o lună ploioasă: ia o geacă de ploaie.' : wetWord === 'moderate' ? 'Vor fi câteva zile cu precipitații, dar nu zilnic.' : 'Precipitațiile sunt rare în această lună.') + (cur.tmean <= 2 ? ' Cu o medie zilnică în jur de zero sau sub zero, o parte pot cădea sub formă de zăpadă.' : ''),
  }[l]];
  const rr = rankText(wetRank, 'wet');
  if (rr) rp.push({ en: mon + ' is ' + rr + '.', de: 'Der ' + mon + ' ist ' + rr + '.', ro: 'Luna ' + mon + ' este ' + rr + '.' }[l]);
  rp.push({ en: 'Relative humidity averages ' + f.num(Math.round(cur.rh), l) + ' % and wind at 2 m about ' + f.num(cur.wind, l, 1) + ' m/s.', de: 'Die relative Luftfeuchte liegt im Mittel bei ' + f.num(Math.round(cur.rh), l) + ' %, der Wind in 2 m Höhe bei etwa ' + f.num(cur.wind, l, 1) + ' m/s.', ro: 'Umiditatea relativă medie este de ' + f.num(Math.round(cur.rh), l) + ' %, iar vântul la 2 m are în jur de ' + f.num(cur.wind, l, 1) + ' m/s.' }[l]);
  sections.push({ id: 'rain', heading: { en: 'Precipitation, humidity and wind', de: 'Niederschlag, Luftfeuchte und Wind', ro: 'Precipitații, umiditate și vânt' }[l], paragraphs: rp });

  const sun = cur.sun;
  let dp;
  if (sun.polar) {
    dp = sun.polar === 'day' ? { en: 'Around the middle of ' + mon + ' the sun does not set.', de: 'Um die Monatsmitte geht die Sonne nicht unter.', ro: 'La mijlocul lunii soarele nu apune.' }[l] : { en: 'Around the middle of ' + mon + ' the sun does not rise.', de: 'Um die Monatsmitte geht die Sonne nicht auf.', ro: 'La mijlocul lunii soarele nu răsare.' }[l];
  } else {
    const rise = formatClock(sun.sunriseUtc, cur.offset);
    const set = formatClock(sun.sunsetUtc, cur.offset);
    const change = sun.dayLengthMinutes - prev.sun.dayLengthMinutes;
    dp = {
      en: 'On 15 ' + mon + ' the sun rises at ' + rise + ' and sets at ' + set + ' local time, for ' + f.duration(sun.dayLengthMinutes, l) + ' of daylight, ' + f.num(Math.round(Math.abs(change)), l) + ' minutes ' + (change >= 0 ? 'more' : 'less') + ' than a month earlier.',
      de: 'Am 15. ' + mon + ' geht die Sonne um ' + rise + ' Uhr auf und um ' + set + ' Uhr unter (Ortszeit), das sind ' + f.duration(sun.dayLengthMinutes, l) + ' Tageslicht, ' + f.num(Math.round(Math.abs(change)), l) + ' Minuten ' + (change >= 0 ? 'mehr' : 'weniger') + ' als einen Monat zuvor.',
      ro: 'Pe 15 ' + mon + ' soarele răsare la ' + rise + ' și apune la ' + set + ', ora locală, adică ' + f.duration(sun.dayLengthMinutes, l) + ' de lumină, cu ' + f.num(Math.round(Math.abs(change)), l) + ' minute ' + (change >= 0 ? 'mai mult' : 'mai puțin') + ' decât cu o lună înainte.',
    }[l];
    facts.push({ label: { en: 'Daylight on the 15th', de: 'Tageslicht am 15.', ro: 'Lumină pe 15' }[l], value: f.duration(sun.dayLengthMinutes, l), src: ['computed-solar'] });
  }
  sections.push({ id: 'daylight', heading: { en: 'Daylight', de: 'Tageslicht', ro: 'Lumina zilei' }[l], paragraphs: [dp] });

  const method = {
    en: 'The figures are ' + period + ' averages for the grid cell around ' + name + ' from the NASA POWER project, a model based data set. They describe the area rather than one weather station, and a single year can differ.',
    de: 'Die Werte sind Mittelwerte ' + period + ' für die Gitterzelle um ' + name + ' aus dem NASA-POWER-Projekt, einem modellbasierten Datensatz. Sie beschreiben die Umgebung, nicht eine einzelne Wetterstation, und ein einzelnes Jahr kann abweichen.',
    ro: 'Valorile sunt medii ' + period + ' pentru celula de grilă din jurul orașului ' + name + ', din proiectul NASA POWER, un set de date bazat pe model. Descriu zona, nu o stație meteo anume, iar un an anume poate fi diferit.',
  }[l];
  sections.push({ id: 'method', heading: { en: 'About these numbers', de: 'Zu den Zahlen', ro: 'Despre aceste cifre' }[l], paragraphs: [method] });

  facts.push({ label: { en: 'Average high', de: 'Mittleres Maximum', ro: 'Maximă medie' }[l], value: f.temp(cur.tmax, l), src: ['nasa-power-daily'] });
  facts.push({ label: { en: 'Average low', de: 'Mittleres Minimum', ro: 'Minimă medie' }[l], value: f.temp(cur.tmin, l), src: ['nasa-power-daily'] });
  facts.push({ label: { en: 'Precipitation', de: 'Niederschlag', ro: 'Precipitații' }[l], value: f.mm(cur.precipMm, l), src: ['nasa-power-daily'] });

  const table = {
    caption: t.allMonths,
    head: [{ en: 'Month', de: 'Monat', ro: 'Luna' }[l], { en: 'High', de: 'Max.', ro: 'Max.' }[l], { en: 'Low', de: 'Min.', ro: 'Min.' }[l], { en: 'Precipitation', de: 'Niederschlag', ro: 'Precipitații' }[l]],
    rows: months.map((x, i) => {
      const k = pageKey({ family: 'city-month', locale: l, entity: page.entity, month: i });
      const href = i !== m && isLive(k) ? pathFor(ds, { family: 'city-month', locale: l, entity: page.entity, month: i }) : null;
      return { cells: [MONTHS[l][i], f.num(Math.round(x.tmax), l) + ' °C', f.num(Math.round(x.tmin), l) + ' °C', f.mm(x.precipMm, l)], href, current: i === m };
    }),
  };

  const links = [];
  const guideKey = pageKey({ family: 'city-guide', locale: l, entity: page.entity });
  if (isLive(guideKey)) links.push({ href: pathFor(ds, { family: 'city-guide', locale: l, entity: page.entity }), text: T[l].guideH1(name) });
  // The same month in the nearest cities that are published. A reader
  // comparing a month between places is the reason this page exists, and it
  // is also what keeps a city with only one or two published months from
  // sitting below the internal link floor.
  for (const near of nearestPublishedCities(ds, c, l, m, isLive, 3)) {
    links.push({ href: near.href, text: T[l].monthH1(near.name, MONTHS[l][m]) });
  }
  const esim = esimLink(ds, c.iso2, l);
  if (esim) links.push(esim);

  const faq = [
    { q: { en: 'How warm is ' + name + ' in ' + mon + '?', de: 'Wie warm ist es in ' + name + ' im ' + mon + '?', ro: 'Cât de cald este în ' + name + ' în ' + mon + '?' }[l], a: { en: 'Average highs of ' + f.temp(cur.tmax, l) + ' and lows of ' + f.temp(cur.tmin, l) + ' (' + period + ' averages).', de: 'Im Mittel ' + f.temp(cur.tmax, l) + ' am Tag und ' + f.temp(cur.tmin, l) + ' in der Nacht (Mittel ' + period + ').', ro: 'În medie ' + f.temp(cur.tmax, l) + ' ziua și ' + f.temp(cur.tmin, l) + ' noaptea (medii ' + period + ').' }[l] },
    { q: { en: 'Does it rain a lot in ' + name + ' in ' + mon + '?', de: 'Regnet es viel in ' + name + ' im ' + mon + '?', ro: 'Plouă mult în ' + name + ' în ' + mon + '?' }[l], a: { en: 'About ' + f.mm(cur.precipMm, l) + ' over the month, on ' + f.num(Math.round(cur.wetDays), l) + ' days with at least 1 mm.', de: 'Rund ' + f.mm(cur.precipMm, l) + ' im Monat, an ' + f.num(Math.round(cur.wetDays), l) + ' Tagen mit mindestens 1 mm.', ro: 'Aproximativ ' + f.mm(cur.precipMm, l) + ' în lună, în ' + f.num(Math.round(cur.wetDays), l) + ' zile cu cel puțin 1 mm.' }[l] },
  ];

  return finish(ds, page, {
    title: t.monthTitle(name, mon),
    h1: t.monthH1(name, mon),
    description: cut({ en: name + ' in ' + mon + ': average highs of ' + f.temp(cur.tmax, l) + ', lows of ' + f.temp(cur.tmin, l) + ', about ' + f.mm(cur.precipMm, l) + ' of precipitation and the day length, from NASA POWER data.', de: name + ' im ' + mon + ': im Mittel ' + f.temp(cur.tmax, l) + ' am Tag, ' + f.temp(cur.tmin, l) + ' in der Nacht, rund ' + f.mm(cur.precipMm, l) + ' Niederschlag und die Tageslänge, nach NASA-POWER-Daten.', ro: name + ' în ' + mon + ': maxime medii de ' + f.temp(cur.tmax, l) + ', minime de ' + f.temp(cur.tmin, l) + ', circa ' + f.mm(cur.precipMm, l) + f.roDe(Math.round(cur.precipMm)) + 'precipitații și durata zilei, după datele NASA POWER.' }[l], 160),
    breadcrumbs: [hubCrumb(l, 'city'), { name: land }, { name, href: isLive(guideKey) ? pathFor(ds, { family: 'city-guide', locale: l, entity: page.entity }) : null }, { name: mon }],
    sections, facts, faq, links, table,
    sources: sourcesUsed(ds, ['nasa-power-daily', 'computed-solar', 'iana-tz'].concat(entitySources(c))),
    schemaType: null, placeName: name,
  });
}

// ------------------------------------------------------------------- airport

export function airportModel(ds, page, isLive) {
  const l = page.locale;
  const a = ds.airportByIata.get(page.entity);
  if (!a) return null;
  const served = servedCity(ds, a);
  const land = regionName(a.iso2, l);
  const t = T[l];
  const sections = [];
  const facts = [];
  const size = a.type === 'large_airport' ? { en: 'a large airport', de: 'ein großer Flughafen', ro: 'un aeroport mare' }[l] : { en: 'a medium-sized airport', de: 'ein mittelgroßer Flughafen', ro: 'un aeroport mediu' }[l];
  const codes = a.iata + (a.icao ? ' / ' + a.icao : '');
  const elevM = a.elevationFt != null ? f.feetToMetres(a.elevationFt) : null;
  const intro = {
    en: a.name + ' (' + codes + ') is ' + size + ' with scheduled flights in ' + land + (a.municipality ? ', listed for ' + a.municipality : '') + '.' + (elevM != null ? ' The field lies at ' + f.num(a.elevationFt, l) + ' ft (' + f.num(elevM, l) + ' m) above sea level.' : ''),
    de: a.name + ' (' + codes + ') ist ' + size + ' mit Linienverkehr in ' + land + (a.municipality ? ', geführt unter ' + a.municipality : '') + '.' + (elevM != null ? ' Das Flugfeld liegt ' + f.num(a.elevationFt, l) + ' ft (' + f.num(elevM, l) + ' m) über dem Meer.' : ''),
    ro: a.name + ' (' + codes + ') este ' + size + ' cu zboruri regulate din ' + land + (a.municipality ? ', înregistrat la ' + a.municipality : '') + '.' + (elevM != null ? ' Pista se află la ' + f.num(a.elevationFt, l) + ' ft (' + f.num(elevM, l) + ' m) altitudine.' : ''),
  }[l];
  sections.push({ id: 'intro', paragraphs: [intro] });
  facts.push({ label: { en: 'Codes', de: 'Codes', ro: 'Coduri' }[l], value: codes, src: ['ourairports'] });

  const links = [];
  if (served) {
    const sc = served.match.c;
    const scName = cityName(sc, l);
    const p = [{
      en: 'In straight line, the airport is ' + f.km(served.match.km, l) + ' from the centre of ' + scName + '. The drive is longer than that, and the time depends on traffic.',
      de: 'Luftlinie liegt der Flughafen ' + f.km(served.match.km, l) + ' vom Zentrum von ' + scName + ' entfernt. Die Fahrt ist länger, die Dauer hängt vom Verkehr ab.',
      ro: 'În linie dreaptă, aeroportul se află la ' + f.km(served.match.km, l) + ' de centrul orașului ' + scName + '. Drumul este mai lung, iar durata depinde de trafic.',
    }[l]];
    if (served.largest.c.id !== sc.id) {
      p.push({ en: 'The largest city within 80 km is ' + cityName(served.largest.c, l) + ', ' + f.km(served.largest.km, l) + ' away.', de: 'Die größte Stadt im Umkreis von 80 km ist ' + cityName(served.largest.c, l) + ', ' + f.km(served.largest.km, l) + ' entfernt.', ro: 'Cel mai mare oraș pe o rază de 80 km este ' + cityName(served.largest.c, l) + ', la ' + f.km(served.largest.km, l) + '.' }[l]);
    }
    sections.push({ id: 'distance', heading: { en: 'Distance to the city', de: 'Entfernung zur Stadt', ro: 'Distanța până în oraș' }[l], paragraphs: p });
    facts.push({ label: { en: 'To ' + scName, de: 'Bis ' + scName, ro: 'Până la ' + scName }[l], value: f.km(served.match.km, l), src: ['computed-distance'] });
    if (sc.timezone) {
      const fx = cityFacts(ds, sc.id);
      sections.push({ id: 'time', heading: { en: 'Local time', de: 'Ortszeit', ro: 'Ora locală' }[l], paragraphs: [{ en: 'Local time at the airport follows ' + sc.timezone + ': ' + fx.tz.janLabel + (fx.tz.dst ? ' in winter and ' + fx.tz.julLabel + ' in summer.' : ' all year.'), de: 'Die Ortszeit am Flughafen folgt ' + sc.timezone + ': ' + fx.tz.janLabel + (fx.tz.dst ? ' im Winter, ' + fx.tz.julLabel + ' im Sommer.' : ' ganzjährig.'), ro: 'Ora locală la aeroport este cea din ' + sc.timezone + ': ' + fx.tz.janLabel + (fx.tz.dst ? ' iarna și ' + fx.tz.julLabel + ' vara.' : ' tot anul.') }[l]] });
    }
    const gk = pageKey({ family: 'city-guide', locale: l, entity: String(sc.id) });
    if (isLive(gk)) links.push({ href: pathFor(ds, { family: 'city-guide', locale: l, entity: String(sc.id) }), text: T[l].guideH1(scName) });
  }

  const others = ds.airports
    .filter((o) => o.iata && o.iata !== a.iata && o.scheduled && (o.type === 'large_airport' || o.type === 'medium_airport'))
    .map((o) => ({ o, km: distanceKm(a, o) }))
    .filter((x) => x.km <= 150)
    .sort((x, y) => x.km - y.km)
    .slice(0, 3);
  if (others.length) {
    const items = others.map((x) => x.o.name + ' (' + x.o.iata + '), ' + f.km(x.km, l));
    sections.push({ id: 'nearby', heading: { en: 'Other airports nearby', de: 'Andere Flughäfen in der Nähe', ro: 'Alte aeroporturi în apropiere' }[l], paragraphs: [{ en: 'Other airports with scheduled flights within 150 km, straight line: ' + f.list(items, l) + '. Comparing arrival airports can change the transfer time into the city.', de: 'Weitere Flughäfen mit Linienflügen im Umkreis von 150 km, Luftlinie: ' + f.list(items, l) + '. Ein anderer Ankunftsflughafen kann den Weg in die Stadt verändern.', ro: 'Alte aeroporturi cu zboruri regulate pe o rază de 150 km, în linie dreaptă: ' + f.list(items, l) + '. Alt aeroport de sosire poate schimba durata transferului spre oraș.' }[l]] });
    others.forEach((x) => {
      const k = pageKey({ family: 'airport', locale: l, entity: x.o.iata });
      if (isLive(k)) links.push({ href: pathFor(ds, { family: 'airport', locale: l, entity: x.o.iata }), text: x.o.name + ' (' + x.o.iata + ')' });
    });
  } else {
    sections.push({ id: 'nearby', heading: { en: 'Other airports nearby', de: 'Andere Flughäfen in der Nähe', ro: 'Alte aeroporturi în apropiere' }[l], paragraphs: [{ en: 'No other airport with scheduled flights lies within 150 km in straight line.', de: 'Im Umkreis von 150 km Luftlinie gibt es keinen weiteren Flughafen mit Linienflügen.', ro: 'Pe o rază de 150 km în linie dreaptă nu există alt aeroport cu zboruri regulate.' }[l]] });
  }

  sections.push({ id: 'arrival', heading: { en: 'On arrival', de: 'Bei der Ankunft', ro: 'La sosire' }[l], paragraphs: [{ en: 'Airport wifi and mobile coverage vary by terminal. If you want data working as soon as you land, set up a travel data plan before the flight rather than at the gate.', de: 'WLAN und Mobilfunk am Flughafen unterscheiden sich je nach Terminal. Wer direkt nach der Landung Daten braucht, richtet einen Reisetarif vor dem Flug ein, nicht erst am Gate.', ro: 'Wi-Fi-ul și semnalul mobil din aeroport diferă de la un terminal la altul. Dacă vrei internet imediat după aterizare, activează un plan de date de călătorie înainte de zbor, nu la poartă.' }[l]] });
  const esim = esimLink(ds, a.iso2, l);
  if (esim) links.push(esim);

  const faq = [
    { q: { en: 'What is the airport code of ' + a.name + '?', de: 'Welchen Code hat ' + a.name + '?', ro: 'Ce cod are ' + a.name + '?' }[l], a: { en: 'IATA ' + a.iata + (a.icao ? ', ICAO ' + a.icao : '') + '.', de: 'IATA ' + a.iata + (a.icao ? ', ICAO ' + a.icao : '') + '.', ro: 'IATA ' + a.iata + (a.icao ? ', ICAO ' + a.icao : '') + '.' }[l] },
  ];
  if (served) faq.push({ q: { en: 'How far is ' + a.iata + ' from ' + cityName(served.match.c, l) + '?', de: 'Wie weit ist ' + a.iata + ' von ' + cityName(served.match.c, l) + ' entfernt?', ro: 'La ce distanță este ' + a.iata + ' de ' + cityName(served.match.c, l) + '?' }[l], a: { en: f.km(served.match.km, l) + ' in straight line to the city centre; the road is longer.', de: f.km(served.match.km, l) + ' Luftlinie bis ins Zentrum; die Straße ist länger.', ro: f.km(served.match.km, l) + ' în linie dreaptă până în centru; pe drum este mai mult.' }[l] });

  return finish(ds, page, {
    title: t.airportTitle(a.name, a.iata),
    h1: a.name + ' (' + a.iata + ')',
    description: cut({ en: a.name + ' (' + a.iata + '): straight-line distance to the city centre, time zone, elevation and other airports nearby, from open data.', de: a.name + ' (' + a.iata + '): Luftlinie ins Zentrum, Zeitzone, Höhe und andere Flughäfen in der Nähe, aus offenen Daten.', ro: a.name + ' (' + a.iata + '): distanța în linie dreaptă până în centru, fusul orar, altitudinea și alte aeroporturi din apropiere, din date deschise.' }[l], 160),
    breadcrumbs: [hubCrumb(l, 'airport'), { name: a.name }],
    sections, facts, faq, links,
    sources: sourcesUsed(ds, ['ourairports', 'computed-distance', 'iana-tz'].concat(served ? entitySources(served.match.c) : [])),
    schemaType: 'Airport', geo: { lat: a.lat, lon: a.lon }, placeName: a.name, iata: a.iata, icao: a.icao,
  });
}

// ------------------------------------------------------------------- shared

function esimLink(ds, iso2, l) {
  const table = ds.esimLinks && ds.esimLinks[l];
  const path = table && table[iso2];
  if (!path) return null;
  return { href: path, text: { en: 'Travel data for ' + regionName(iso2, l), de: 'Mobile Daten für ' + regionName(iso2, l), ro: 'Date mobile pentru ' + regionName(iso2, l) }[l], esim: true };
}

// The city record says where it came from; the page credits that source only.
function entitySources(c) {
  return c.source === 'wikidata-cities' ? ['wikidata-cities'] : ['geonames-cities', 'wikidata-labels'];
}

function sourcesUsed(ds, ids) {
  const all = ds.sourceList || [];
  const seen = new Set();
  return ids.map((id) => all.find((s) => s.id === id)).filter(Boolean).filter((s) => !seen.has(s.attribution) && seen.add(s.attribution)).map((s) => ({ id: s.id, name: s.name, attribution: s.attribution, retrievedAt: ds.manifest.sources[s.id] ? ds.manifest.sources[s.id].retrievedAt : null }));
}

// The nearest cities, by great circle distance, that have this month published
// in this locale. Deterministic: the same registry always yields the same
// list, in the same order, so the link graph is stable between builds.
function nearestPublishedCities(ds, city, locale, month, isLive, limit) {
  const out = [];
  for (const other of ds.cities) {
    if (String(other.id) === String(city.id)) continue;
    const key = pageKey({ family: 'city-month', locale, entity: String(other.id), month });
    if (!isLive(key)) continue;
    const href = pathFor(ds, { family: 'city-month', locale, entity: String(other.id), month });
    if (!href) continue;
    out.push({ id: other.id, name: cityName(other, locale), href, km: distanceKm(city, other) });
  }
  out.sort((a, b) => a.km - b.km || String(a.id).localeCompare(String(b.id)));
  return out.slice(0, limit);
}

function finish(ds, page, m) {
  const path = pathFor(ds, page);
  const alternates = LOCALES.map((l) => {
    const p = { ...page, locale: l };
    return { locale: l, path: pathFor(ds, p), key: pageKey(p) };
  });
  return { key: pageKey(page), family: page.family, locale: page.locale, path, url: absolute(path), alternates, ...m };
}

export function buildModel(ds, page, isLive = () => false) {
  if (page.family === 'city-guide') return cityGuideModel(ds, page, isLive);
  if (page.family === 'city-month') return cityMonthModel(ds, page, isLive);
  if (page.family === 'airport') return airportModel(ds, page, isLive);
  return null;
}

export { FAMILIES };

// Vocabulary, as opposed to sentences.
//
// The language packs hold sentences, which is where voice lives and where a
// translation would be obvious. This file holds nouns: the name of a ranking,
// the short name of a measure, the words a calculator asks for. They are kept
// apart because they are reused in several sentences and in table headers and
// in titles, and because a noun that appears in three places must be the same
// noun in all three.
//
// Every entry exists in all nine cohort languages. A missing one is a build
// failure rather than a fallback to English, because an English word inside a
// Polish sentence is the most visible possible sign that nobody read the page.

export const RANKING_NAMES = {
  'cheapest-countries': {
    en: 'Cheapest countries to live in', de: 'Die günstigsten Länder zum Leben',
    fr: 'Les pays les moins chers pour vivre', es: 'Los países más baratos para vivir',
    it: 'I paesi più economici in cui vivere', pt: 'Os países mais baratos para viver',
    nl: 'De goedkoopste landen om in te wonen', pl: 'Najtańsze kraje do życia',
    ja: '物価の安い国',
  },
  'most-expensive-countries': {
    en: 'Most expensive countries to live in', de: 'Die teuersten Länder zum Leben',
    fr: 'Les pays les plus chers pour vivre', es: 'Los países más caros para vivir',
    it: 'I paesi più cari in cui vivere', pt: 'Os países mais caros para viver',
    nl: 'De duurste landen om in te wonen', pl: 'Najdroższe kraje świata',
    ja: '物価の高い国',
  },
  'cheapest-countries-europe': {
    en: 'Cheapest countries in Europe', de: 'Die günstigsten Länder Europas',
    fr: "Les pays les moins chers d'Europe", es: 'Los países más baratos de Europa',
    it: "I paesi più economici d'Europa", pt: 'Os países mais baratos da Europa',
    nl: 'De goedkoopste landen van Europa', pl: 'Najtańsze kraje w Europie',
    ja: 'ヨーロッパで物価の安い国',
  },
};

// The short name of a measure, for use inside a sentence. The long basket
// label is right for a table row and wrong in the middle of a clause.
export const MEASURE_SHORT = {
  A01: {
    en: 'the Eurostat household price level index', de: 'der Eurostat-Preisniveauindex für den Haushaltskonsum',
    fr: "l'indice Eurostat du niveau des prix à la consommation", es: 'el índice de nivel de precios de consumo de Eurostat',
    it: 'l\'indice Eurostat del livello dei prezzi al consumo', pt: 'o índice Eurostat do nível de preços no consumo',
    nl: 'de Eurostat-prijspeilindex voor huishoudelijke consumptie', pl: 'indeks poziomu cen konsumpcji gospodarstw domowych Eurostatu',
    ja: 'ユーロスタットの家計消費物価水準指数',
  },
  PRICE_LEVEL: {
    en: 'the World Bank price level ratio', de: 'das Preisniveauverhältnis der Weltbank',
    fr: 'le rapport de niveau des prix de la Banque mondiale', es: 'la proporción de nivel de precios del Banco Mundial',
    it: 'il rapporto sul livello dei prezzi della Banca mondiale', pt: 'a razão de nível de preços do Banco Mundial',
    nl: 'de prijspeilverhouding van de Wereldbank', pl: 'wskaźnik poziomu cen Banku Światowego',
    ja: '世界銀行の物価水準比率',
  },
};

// What a calculator asks the reader for. The tools declare their inputs in
// English because the queue is an engineering document; a page that printed
// those words untranslated would be the one place the machinery shows.
export const INPUT_TERMS = {
  'origin city': { en: 'origin city', de: 'Startstadt', fr: 'ville de départ', es: 'ciudad de origen', it: 'città di partenza', pt: 'cidade de origem', nl: 'vertrekstad', pl: 'miasto początkowe', ja: '出発都市' },
  'destination city': { en: 'destination city', de: 'Zielstadt', fr: "ville d'arrivée", es: 'ciudad de destino', it: 'città di arrivo', pt: 'cidade de destino', nl: 'bestemmingsstad', pl: 'miasto docelowe', ja: '到着都市' },
  'home size': { en: 'home size', de: 'Wohnungsgröße', fr: 'taille du logement', es: 'tamaño de la vivienda', it: "dimensione dell'abitazione", pt: 'tamanho da casa', nl: 'woninggrootte', pl: 'wielkość mieszkania', ja: '住まいの広さ' },
  date: { en: 'date', de: 'Datum', fr: 'date', es: 'fecha', it: 'data', pt: 'data', nl: 'datum', pl: 'data', ja: '日付' },
  budget: { en: 'budget', de: 'Budget', fr: 'budget', es: 'presupuesto', it: 'budget', pt: 'orçamento', nl: 'budget', pl: 'budżet', ja: '予算' },
  climate: { en: 'climate', de: 'Klima', fr: 'climat', es: 'clima', it: 'clima', pt: 'clima', nl: 'klimaat', pl: 'klimat', ja: '気候' },
  language: { en: 'language', de: 'Sprache', fr: 'langue', es: 'idioma', it: 'lingua', pt: 'idioma', nl: 'taal', pl: 'język', ja: '言語' },
  'work situation': { en: 'work situation', de: 'Arbeitssituation', fr: 'situation professionnelle', es: 'situación laboral', it: 'situazione lavorativa', pt: 'situação profissional', nl: 'werksituatie', pl: 'sytuacja zawodowa', ja: '働き方' },
  priorities: { en: 'priorities', de: 'Prioritäten', fr: 'priorités', es: 'prioridades', it: 'priorità', pt: 'prioridades', nl: 'prioriteiten', pl: 'priorytety', ja: '優先すること' },
  'city a': { en: 'first city', de: 'erste Stadt', fr: 'première ville', es: 'primera ciudad', it: 'prima città', pt: 'primeira cidade', nl: 'eerste stad', pl: 'pierwsze miasto', ja: '一つ目の都市' },
  'city b': { en: 'second city', de: 'zweite Stadt', fr: 'deuxième ville', es: 'segunda ciudad', it: 'seconda città', pt: 'segunda cidade', nl: 'tweede stad', pl: 'drugie miasto', ja: '二つ目の都市' },
  income: { en: 'income', de: 'Einkommen', fr: 'revenu', es: 'ingresos', it: 'reddito', pt: 'rendimento', nl: 'inkomen', pl: 'dochód', ja: '収入' },
  origin: { en: 'origin', de: 'Herkunft', fr: 'origine', es: 'origen', it: 'provenienza', pt: 'origem', nl: 'herkomst', pl: 'miejsce wyjazdu', ja: '出発地' },
  destination: { en: 'destination', de: 'Ziel', fr: 'destination', es: 'destino', it: 'destinazione', pt: 'destino', nl: 'bestemming', pl: 'miejsce docelowe', ja: '行き先' },
  household: { en: 'household', de: 'Haushalt', fr: 'foyer', es: 'hogar', it: 'nucleo familiare', pt: 'agregado familiar', nl: 'huishouden', pl: 'gospodarstwo domowe', ja: '世帯' },
  'household size': { en: 'household size', de: 'Haushaltsgröße', fr: 'taille du foyer', es: 'tamaño del hogar', it: 'dimensione del nucleo', pt: 'dimensão do agregado', nl: 'huishoudgrootte', pl: 'wielkość gospodarstwa', ja: '世帯人数' },
  timeline: { en: 'timeline', de: 'Zeitraum', fr: 'calendrier', es: 'plazo', it: 'tempistica', pt: 'prazo', nl: 'tijdlijn', pl: 'termin', ja: '時期' },
  nights: { en: 'number of nights', de: 'Anzahl der Nächte', fr: 'nombre de nuits', es: 'número de noches', it: 'numero di notti', pt: 'número de noites', nl: 'aantal nachten', pl: 'liczba nocy', ja: '宿泊数' },
  style: { en: 'travel style', de: 'Reisestil', fr: 'style de voyage', es: 'estilo de viaje', it: 'stile di viaggio', pt: 'estilo de viagem', nl: 'reisstijl', pl: 'styl podróży', ja: '旅のスタイル' },
  role: { en: 'role', de: 'Beruf', fr: 'poste', es: 'puesto', it: 'ruolo', pt: 'função', nl: 'functie', pl: 'stanowisko', ja: '職種' },
  city: { en: 'city', de: 'Stadt', fr: 'ville', es: 'ciudad', it: 'città', pt: 'cidade', nl: 'stad', pl: 'miasto', ja: '都市' },
  country: { en: 'country', de: 'Land', fr: 'pays', es: 'país', it: 'paese', pt: 'país', nl: 'land', pl: 'kraj', ja: '国' },
  experience: { en: 'years of experience', de: 'Berufsjahre', fr: "années d'expérience", es: 'años de experiencia', it: 'anni di esperienza', pt: 'anos de experiência', nl: 'jaren ervaring', pl: 'lata doświadczenia', ja: '経験年数' },
};

const pick = (table, key, language) => {
  const row = table[key];
  return row ? row[language] || null : null;
};

export const rankingName = (id, language) => pick(RANKING_NAMES, id, language);
export const measureShort = (id, language) => pick(MEASURE_SHORT, id, language);
export const inputTerm = (id, language) => pick(INPUT_TERMS, id, language);

// Every term in every language, checked in one pass. Used by a test so that
// adding a tool with a new input fails the build rather than printing English
// into eight other languages.
export function missingTerms(languages) {
  const gaps = [];
  for (const [table, name] of [[RANKING_NAMES, 'ranking'], [MEASURE_SHORT, 'measure'], [INPUT_TERMS, 'input']]) {
    for (const [key, row] of Object.entries(table)) {
      for (const l of languages) if (!row[l]) gaps.push(name + ' "' + key + '" has no ' + l);
    }
  }
  return gaps;
}

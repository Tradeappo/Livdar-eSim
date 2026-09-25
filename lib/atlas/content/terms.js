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
  'country a': { en: 'first country', de: 'erstes Land', fr: 'premier pays', es: 'primer país', it: 'primo paese', pt: 'primeiro país', nl: 'eerste land', pl: 'pierwszy kraj', ja: '一つ目の国' },
  'country b': { en: 'second country', de: 'zweites Land', fr: 'deuxième pays', es: 'segundo país', it: 'secondo paese', pt: 'segundo país', nl: 'tweede land', pl: 'drugi kraj', ja: '二つ目の国' },
  anchor: { en: 'place to be near', de: 'Ort in der Nähe', fr: 'lieu à proximité', es: 'lugar de referencia', it: 'luogo di riferimento', pt: 'lugar de referência', nl: 'plek in de buurt', pl: 'punkt odniesienia', ja: '基準にする場所' },
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

// Month names, per cohort language.
//
// `MONTH_NAMES` is the bare name, for a table header or a list. `MONTH_IN` is
// the whole phrase a sentence needs, because the preposition is not separable
// from the month in most of these languages and a pack that wrote its own
// would get it wrong in the same way a country without a subject form does.
//
// Italian alternates `a` and `ad` before a vowel, Polish takes the locative
// and changes the preposition to `we` before September, and German contracts
// `in dem` to `im`. None of that can be assembled from the bare name, so the
// phrase is stored. French and Spanish and Dutch take one invariant
// preposition, which is why theirs are derived rather than listed.
export const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  nl: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
  ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

export const MONTH_IN = {
  en: MONTH_NAMES.en.map((m) => 'in ' + m),
  de: MONTH_NAMES.de.map((m) => 'im ' + m),
  fr: MONTH_NAMES.fr.map((m) => 'en ' + m),
  es: MONTH_NAMES.es.map((m) => 'en ' + m),
  it: MONTH_NAMES.it.map((m) => (/^[aeiou]/.test(m) ? 'ad ' + m : 'a ' + m)),
  pt: MONTH_NAMES.pt.map((m) => 'em ' + m),
  nl: MONTH_NAMES.nl.map((m) => 'in ' + m),
  // The locative, which never matches the nominative above, and `we` rather
  // than `w` before the consonant cluster in September.
  pl: ['w styczniu', 'w lutym', 'w marcu', 'w kwietniu', 'w maju', 'w czerwcu', 'w lipcu', 'w sierpniu', 'we wrześniu', 'w październiku', 'w listopadzie', 'w grudniu'],
  ja: MONTH_NAMES.ja.slice(),
};

// Month number (1 to 12) to a name or a phrase. A language missing from the
// table is a build failure rather than a fallback to English.
export const monthName = (m, language) => (MONTH_NAMES[language] || [])[m - 1] || null;
export const monthIn = (m, language) => (MONTH_IN[language] || [])[m - 1] || null;

// A list of months as the language writes a list, because the final
// conjunction differs and a comma separated list reads as machine output.
export const JOIN = {
  en: { sep: ', ', last: ' and ' }, de: { sep: ', ', last: ' und ' },
  fr: { sep: ', ', last: ' et ' }, es: { sep: ', ', last: ' y ' },
  it: { sep: ', ', last: ' e ' }, pt: { sep: ', ', last: ' e ' },
  nl: { sep: ', ', last: ' en ' }, pl: { sep: ', ', last: ' i ' },
  ja: { sep: '、', last: '、' },
};

export function joinList(items, language) {
  const j = JOIN[language] || JOIN.en;
  if (items.length <= 1) return items[0] || '';
  return items.slice(0, -1).join(j.sep) + j.last + items[items.length - 1];
}

const pick = (table, key, language) => {
  const row = table[key];
  return row ? row[language] || null : null;
};

export const rankingName = (id, language) => pick(RANKING_NAMES, id, language);
export const measureShort = (id, language) => pick(MEASURE_SHORT, id, language);
// The chrome an interactive tool needs: the verb on the button, the words around
// a result, and the two or three units a result is expressed in. Small on
// purpose. Everything a tool says about its own subject comes from the tool copy
// and the input terms, which already exist in nine languages; these are the
// words that belong to the widget rather than to the question.
export const TOOL_UI = {
  calculate: { en: 'Work it out', de: 'Berechnen', fr: 'Calculer', es: 'Calcular', it: 'Calcola', pt: 'Calcular', nl: 'Bereken', pl: 'Oblicz', ja: '計算する' },
  result: { en: 'Result', de: 'Ergebnis', fr: 'Résultat', es: 'Resultado', it: 'Risultato', pt: 'Resultado', nl: 'Resultaat', pl: 'Wynik', ja: '結果' },
  perMonth: { en: 'a month', de: 'im Monat', fr: 'par mois', es: 'al mes', it: 'al mese', pt: 'por mês', nl: 'per maand', pl: 'miesięcznie', ja: '月あたり' },
  perPerson: { en: 'per person', de: 'pro Person', fr: 'par personne', es: 'por persona', it: 'a persona', pt: 'por pessoa', nl: 'per persoon', pl: 'na osobę', ja: '一人あたり' },
  amount: { en: 'amount', de: 'Betrag', fr: 'montant', es: 'importe', it: 'importo', pt: 'valor', nl: 'bedrag', pl: 'kwota', ja: '金額' },
  equivalent: { en: 'buys the same as', de: 'entspricht', fr: "équivaut à", es: 'equivale a', it: 'equivale a', pt: 'equivale a', nl: 'komt overeen met', pl: 'odpowiada', ja: 'に相当します' },
  cheaper: { en: 'cheaper', de: 'günstiger', fr: 'moins cher', es: 'más barato', it: 'più economico', pt: 'mais barato', nl: 'goedkoper', pl: 'taniej', ja: '安い' },
  dearer: { en: 'more expensive', de: 'teurer', fr: 'plus cher', es: 'más caro', it: 'più caro', pt: 'mais caro', nl: 'duurder', pl: 'drożej', ja: '高い' },
  same: { en: 'the same', de: 'gleich', fr: 'identique', es: 'igual', it: 'uguale', pt: 'igual', nl: 'gelijk', pl: 'tyle samo', ja: '同じ' },
  gross: { en: 'gross', de: 'brutto', fr: 'brut', es: 'bruto', it: 'lordo', pt: 'bruto', nl: 'bruto', pl: 'brutto', ja: '総額' },
  net: { en: 'net', de: 'netto', fr: 'net', es: 'neto', it: 'netto', pt: 'líquido', nl: 'netto', pl: 'netto', ja: '手取り' },
  comfortableMonths: { en: 'comfortable months', de: 'angenehme Monate', fr: 'mois agréables', es: 'meses agradables', it: 'mesi piacevoli', pt: 'meses agradáveis', nl: 'aangename maanden', pl: 'miesiące z przyjemną pogodą', ja: '快適な月' },
  maxPriceLevel: { en: 'at most this price level', de: 'höchstens dieses Preisniveau', fr: 'niveau de prix maximal', es: 'nivel de precios máximo', it: 'livello dei prezzi massimo', pt: 'nível de preços máximo', nl: 'hoogstens dit prijspeil', pl: 'najwyżej ten poziom cen', ja: '物価水準の上限' },
  matches: { en: 'places that fit', de: 'passende Länder', fr: 'pays qui correspondent', es: 'países que encajan', it: 'paesi che corrispondono', pt: 'países que encaixam', nl: 'landen die passen', pl: 'kraje, które pasują', ja: '条件に合う国' },
  nothingFits: { en: 'Nothing fits those two numbers. Loosen one.', de: 'Dazu passt nichts. Eine Zahl lockern.', fr: 'Rien ne correspond. Assouplissez un critère.', es: 'Nada encaja. Relaja uno de los dos.', it: 'Niente corrisponde. Allenta un criterio.', pt: 'Nada encaixa. Solte um dos dois.', nl: 'Niets past hierbij. Versoepel er een.', pl: 'Nic nie pasuje. Poluzuj jedno z kryteriów.', ja: '条件に合う国がありません。どちらかを緩めてください。' },
  km: { en: 'km from the centre', de: 'km vom Zentrum', fr: 'km du centre', es: 'km del centro', it: 'km dal centro', pt: 'km do centro', nl: 'km van het centrum', pl: 'km od centrum', ja: '中心からの距離' },
  distance: { en: 'distance in kilometres', de: 'Entfernung in Kilometern', fr: 'distance en kilomètres', es: 'distancia en kilómetros', it: 'distanza in chilometri', pt: 'distância em quilómetros', nl: 'afstand in kilometers', pl: 'odległość w kilometrach', ja: '距離（キロメートル）' },
  cannotAnswer: { en: 'What this does not answer', de: 'Was das nicht beantwortet', fr: "Ce que cela ne dit pas", es: 'Lo que esto no responde', it: 'Che cosa non risponde', pt: 'O que isto não responde', nl: 'Wat dit niet beantwoordt', pl: 'Na co to nie odpowiada', ja: 'これで分からないこと' },
};


// The options of the moving cost calculator, which are the only tool inputs whose
// values are a closed list rather than a number or a place. They live here with
// the rest of the vocabulary because the implementation in
// lib/atlas/tools/moving-cost.js carries an English label per option and a select
// of English labels on a French page is the leak the language audit exists to
// catch.
export const MOVE_SIZE_LABELS = {
  room: { en: 'One room', de: 'Ein Zimmer', fr: 'Une piece', es: 'Una habitacion', it: 'Una stanza', pt: 'Um quarto', nl: 'Een kamer', pl: 'Jeden pokoj', ja: '一部屋' },
  studio: { en: 'Studio', de: 'Ein Apartment', fr: 'Un studio', es: 'Un estudio', it: 'Un monolocale', pt: 'Um estudio', nl: 'Een studio', pl: 'Kawalerka', ja: 'ワンルーム' },
  'flat-1br': { en: 'One bedroom', de: 'Zwei Zimmer', fr: 'Deux pieces', es: 'Un dormitorio', it: 'Un bilocale', pt: 'Um quarto e sala', nl: 'Een slaapkamer', pl: 'Dwa pokoje', ja: '1LDK' },
  'flat-2br': { en: 'Two bedrooms', de: 'Drei Zimmer', fr: 'Trois pieces', es: 'Dos dormitorios', it: 'Un trilocale', pt: 'Dois quartos', nl: 'Twee slaapkamers', pl: 'Trzy pokoje', ja: '2LDK' },
  'flat-3br': { en: 'Three bedrooms', de: 'Vier Zimmer', fr: 'Quatre pieces', es: 'Tres dormitorios', it: 'Un quadrilocale', pt: 'Tres quartos', nl: 'Drie slaapkamers', pl: 'Cztery pokoje', ja: '3LDK' },
  'house-4br': { en: 'Four bedroom house', de: 'Haus mit vier Schlafzimmern', fr: 'Maison de cinq pieces', es: 'Casa de cuatro dormitorios', it: 'Villa con quattro camere', pt: 'Casa com quatro quartos', nl: 'Huis met vier slaapkamers', pl: 'Dom z czterema sypialniami', ja: '戸建て（4寝室）' },
};

export const TRANSPORT_LABELS = {
  van: { en: 'Van', de: 'Transporter', fr: 'Camionnette', es: 'Furgoneta', it: 'Furgone', pt: 'Furgao', nl: 'Bestelwagen', pl: 'Bus dostawczy', ja: 'バン' },
  truck: { en: 'Removals truck', de: 'Umzugswagen', fr: 'Camion de demenagement', es: 'Camion de mudanzas', it: 'Camion per traslochi', pt: 'Camiao de mudancas', nl: 'Verhuiswagen', pl: 'Samochod do przeprowadzek', ja: '引越しトラック' },
  'shared-load': { en: 'Shared load', de: 'Beiladung', fr: 'Groupage', es: 'Carga compartida', it: 'Carico condiviso', pt: 'Carga partilhada', nl: 'Gedeelde lading', pl: 'Transport zbiorczy', ja: '混載便' },
  container: { en: 'Sea container', de: 'Seecontainer', fr: 'Conteneur maritime', es: 'Contenedor maritimo', it: 'Container navale', pt: 'Contentor maritimo', nl: 'Zeecontainer', pl: 'Kontener morski', ja: '海上コンテナ' },
  air: { en: 'Air freight', de: 'Luftfracht', fr: 'Fret aerien', es: 'Carga aerea', it: 'Trasporto aereo', pt: 'Carga aerea', nl: 'Luchtvracht', pl: 'Fracht lotniczy', ja: '航空便' },
};

// The verdict card, in nine languages.
//
// Four verdicts and the words around them. The verdict is the one string on the
// card a reader actually reads, so it says what the state means rather than naming
// a colour: `comfortable` and not `green`.
export const VERDICTS = {
  comfortable: { en: 'Comfortable', de: 'Entspannt', fr: 'Confortable', es: 'Holgado', it: 'Tranquillo', pt: 'Confortavel', nl: 'Comfortabel', pl: 'Komfortowo', ja: 'ゆとりあり' },
  healthy: { en: 'Manageable', de: 'Machbar', fr: 'Gerable', es: 'Manejable', it: 'Gestibile', pt: 'Geravel', nl: 'Haalbaar', pl: 'Do udzwigniecia', ja: '無理なく可能' },
  tight: { en: 'Tight', de: 'Knapp', fr: 'Juste', es: 'Ajustado', it: 'Stretto', pt: 'Apertado', nl: 'Krap', pl: 'Na granicy', ja: 'かなり厳しい' },
  unaffordable: { en: 'Out of reach', de: 'Nicht tragbar', fr: 'Hors de portee', es: 'Fuera de alcance', it: 'Fuori portata', pt: 'Fora de alcance', nl: 'Niet haalbaar', pl: 'Poza zasiegiem', ja: '手が届かない' },
};

export const CARD_UI = {
  // The small line above the title. The reference reads LIVE CITY BUDGET; this is
  // the same idea without claiming a city the tool may not be about.
  eyebrow: { en: 'Live budget', de: 'Budget live', fr: 'Budget en direct', es: 'Presupuesto en vivo', it: 'Budget dal vivo', pt: 'Orcamento ao vivo', nl: 'Budget live', pl: 'Budzet na zywo', ja: 'ライブ予算' },
  eyebrowCompare: { en: 'Live comparison', de: 'Vergleich live', fr: 'Comparaison en direct', es: 'Comparacion en vivo', it: 'Confronto dal vivo', pt: 'Comparacao ao vivo', nl: 'Vergelijking live', pl: 'Porownanie na zywo', ja: 'ライブ比較' },
  // The figure the card leads with, which is the one the reference put in its
  // white footer. It is inside the coloured card here, because the card is one
  // block and a white strip under it read as a different component.
  leftAfterRent: { en: 'Left after rent', de: 'Nach Miete uebrig', fr: 'Reste apres le loyer', es: 'Queda tras el alquiler', it: 'Resta dopo affitto', pt: 'Sobra apos a renda', nl: 'Over na huur', pl: 'Zostaje po czynszu', ja: '家賃を払った残り' },
  shareOfIncome: { en: 'Of your income', de: 'Deines Einkommens', fr: 'De votre revenu', es: 'De tus ingresos', it: 'Del tuo reddito', pt: 'Do seu rendimento', nl: 'Van je inkomen', pl: 'Twojego dochodu', ja: '収入に対する割合' },
  at30: { en: 'At 30%', de: 'Bei 30%', fr: 'A 30%', es: 'Al 30%', it: 'Al 30%', pt: 'A 30%', nl: 'Bij 30%', pl: 'Przy 30%', ja: '30%なら' },
  at35: { en: 'At 35%', de: 'Bei 35%', fr: 'A 35%', es: 'Al 35%', it: 'Al 35%', pt: 'A 35%', nl: 'Bij 35%', pl: 'Przy 35%', ja: '35%なら' },
  rentYouPay: { en: 'rent you are looking at', de: 'Miete, die du im Blick hast', fr: 'loyer envisage', es: 'alquiler que estas viendo', it: 'affitto che stai valutando', pt: 'renda que estas a ver', nl: 'huur die je bekijkt', pl: 'czynsz, ktory rozwazasz', ja: '検討中の家賃' },
  priceLevelThere: { en: 'Price level there', de: 'Preisniveau dort', fr: 'Niveau des prix la-bas', es: 'Nivel de precios alli', it: 'Livello prezzi la', pt: 'Nivel de precos la', nl: 'Prijspeil daar', pl: 'Poziom cen tam', ja: '現地の物価水準' },
  priceLevelHere: { en: 'Price level here', de: 'Preisniveau hier', fr: 'Niveau des prix ici', es: 'Nivel de precios aqui', it: 'Livello prezzi qui', pt: 'Nivel de precos aqui', nl: 'Prijspeil hier', pl: 'Poziom cen tutaj', ja: 'こちらの物価水準' },
  buysThere: { en: 'Buys the same there', de: 'Kauft dort dasselbe', fr: 'Achete la meme chose la-bas', es: 'Compra lo mismo alli', it: 'Compra lo stesso la', pt: 'Compra o mesmo la', nl: 'Koopt daar hetzelfde', pl: 'Kupuje tam tyle samo', ja: '現地での同等額' },
  difference: { en: 'Difference', de: 'Unterschied', fr: 'Ecart', es: 'Diferencia', it: 'Differenza', pt: 'Diferenca', nl: 'Verschil', pl: 'Roznica', ja: '差' },
  // How far the rent is under or over the comfortable line. The third tile used to
  // repeat the thirty per cent budget, which a reader had already read one tile to
  // the left.
  underComfortable: { en: 'Under the 30% line', de: 'Unter der 30%-Linie', fr: 'Sous la limite de 30%', es: 'Bajo el limite del 30%', it: 'Sotto la soglia del 30%', pt: 'Abaixo do limite de 30%', nl: 'Onder de 30%-grens', pl: 'Ponizej progu 30%', ja: '30%の線より下' },
  overComfortable: { en: 'Over the 30% line', de: 'Ueber der 30%-Linie', fr: 'Au-dessus de la limite de 30%', es: 'Sobre el limite del 30%', it: 'Sopra la soglia del 30%', pt: 'Acima do limite de 30%', nl: 'Boven de 30%-grens', pl: 'Powyzej progu 30%', ja: '30%の線より上' },
  enterIncome: { en: 'Enter an income to see where you stand.', de: 'Einkommen eingeben, um zu sehen, wo du stehst.', fr: 'Saisissez un revenu pour voir ou vous en etes.', es: 'Introduce unos ingresos para ver como estas.', it: 'Inserisci un reddito per vedere come stai.', pt: 'Introduza um rendimento para ver como esta.', nl: 'Vul een inkomen in om te zien waar je staat.', pl: 'Podaj dochod, aby zobaczyc, jak wypadasz.', ja: '収入を入力すると状況が分かります。' },
};

export const verdictLabel = (state, language) => pick(VERDICTS, state, language);
export const cardUi = (id, language) => pick(CARD_UI, id, language);

export const moveSizeLabel = (id, language) => pick(MOVE_SIZE_LABELS, id, language);
export const transportLabel = (id, language) => pick(TRANSPORT_LABELS, id, language);

export const toolUi = (id, language) => pick(TOOL_UI, id, language);

export const inputTerm = (id, language) => pick(INPUT_TERMS, id, language);

// Every term in every language, checked in one pass. Used by a test so that
// adding a tool with a new input fails the build rather than printing English
// into eight other languages.
export function missingTerms(languages) {
  const gaps = [];
  for (const l of languages) {
    if (!MONTH_NAMES[l] || MONTH_NAMES[l].length !== 12) gaps.push('month names missing for ' + l);
    if (!MONTH_IN[l] || MONTH_IN[l].length !== 12) gaps.push('month phrases missing for ' + l);
    if (!JOIN[l]) gaps.push('list conjunction missing for ' + l);
  }
  for (const [table, name] of [[RANKING_NAMES, 'ranking'], [MEASURE_SHORT, 'measure'], [INPUT_TERMS, 'input']]) {
    for (const [key, row] of Object.entries(table)) {
      for (const l of languages) if (!row[l]) gaps.push(name + ' "' + key + '" has no ' + l);
    }
  }
  return gaps;
}

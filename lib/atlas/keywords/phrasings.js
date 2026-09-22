// Query phrasings, per language, per family.
//
// These are candidate phrasings, not measured facts. Each one carries
// `validated: false` until a provider has returned a volume for it in a real
// market, and the manifest builder refuses to spend bulk budget on a phrasing
// that has never been validated in that language. That is the guard against
// paying to measure three hundred thousand keywords that nobody types.
//
// They are written as the language writes them, not as English translated.
// Where a language does not ask a question the way English does, the slot is
// simply absent rather than filled with a calque.

// Placeholders: {city} {country} {month} {airport} {iata} {neighbourhood}
// {homeCountry} resolve from the entity and the market.

export const PHRASINGS = {
  'weather.city-month': {
    en: ['{city} weather in {month}', 'weather in {city} in {month}', '{city} temperature in {month}', 'is {month} a good time to visit {city}', 'what to wear in {city} in {month}'],
    de: ['wetter {city} {month}', '{city} wetter im {month}', 'temperatur {city} {month}', 'ist {month} eine gute reisezeit für {city}', 'was anziehen in {city} im {month}'],
    ja: ['{city} {month} 天気', '{city} {month} 気温', '{city} {month} 服装', '{city} {month} 旅行'],
    'zh-Hant': ['{city} {month} 天氣', '{city} {month} 氣溫', '{city} {month} 穿著', '{month} 去 {city}'],
    it: ['clima {city} {month}', 'che tempo fa a {city} a {month}', 'temperature {city} {month}', 'come vestirsi a {city} a {month}'],
    es: ['clima en {city} en {month}', 'tiempo en {city} en {month}', 'temperatura {city} {month}', 'qué ropa llevar a {city} en {month}'],
    fr: ['météo {city} {month}', 'climat {city} {month}', 'température {city} {month}', 'que mettre dans sa valise pour {city} en {month}'],
    nl: ['weer {city} {month}', 'temperatuur {city} {month}', 'klimaat {city} {month}', 'wat aantrekken in {city} in {month}'],
    pl: ['pogoda {city} {month}', 'temperatura {city} {month}', 'klimat {city} {month}', 'co zabrać do {city} w {month}'],
    pt: ['clima em {city} em {month}', 'temperatura em {city} em {month}', 'tempo em {city} em {month}', 'o que levar para {city} em {month}'],
  },
  'weather.city-best-time': {
    en: ['best time to visit {city}', 'when to go to {city}', 'best month to visit {city}'],
    de: ['beste reisezeit {city}', 'wann nach {city} reisen'],
    ja: ['{city} ベストシーズン', '{city} 旅行 時期'],
    'zh-Hant': ['{city} 最佳旅遊季節', '{city} 什麼時候去'],
    it: ['quando andare a {city}', 'periodo migliore per visitare {city}'],
    es: ['mejor época para viajar a {city}', 'cuándo ir a {city}'],
    fr: ['quand partir à {city}', 'meilleure période pour visiter {city}'],
    nl: ['beste reistijd {city}', 'wanneer naar {city}'],
    pl: ['kiedy jechać do {city}', 'najlepszy czas na {city}'],
    pt: ['melhor época para viajar para {city}', 'quando ir para {city}'],
  },
  'airports.guide': {
    en: ['{airport} airport', '{iata} airport', '{city} airport'],
    de: ['{airport} flughafen', 'flughafen {iata}', 'flughafen {city}'],
    ja: ['{city} 空港', '{iata} 空港'],
    'zh-Hant': ['{city} 機場', '{iata} 機場'],
    it: ['aeroporto {city}', 'aeroporto {iata}'],
    es: ['aeropuerto de {city}', 'aeropuerto {iata}'],
    fr: ['aéroport {city}', 'aéroport {iata}'],
    nl: ['luchthaven {city}', 'vliegveld {iata}'],
    pl: ['lotnisko {city}', 'lotnisko {iata}'],
    pt: ['aeroporto de {city}', 'aeroporto {iata}'],
  },
  'transport.airport-to-city': {
    en: ['how to get from {airport} to {city}', '{iata} to {city} centre', '{airport} transfer'],
    de: ['vom flughafen {airport} nach {city}', '{iata} nach {city} zentrum', 'transfer flughafen {city}'],
    ja: ['{airport} から {city} 市内', '{iata} 市内 アクセス'],
    'zh-Hant': ['{airport} 到 {city} 市區', '{iata} 市區 交通'],
    it: ['come arrivare da {airport} a {city}', 'dall aeroporto {iata} al centro'],
    es: ['cómo ir del aeropuerto {airport} a {city}', 'del {iata} al centro de {city}'],
    fr: ['aller de {airport} à {city}', 'navette aéroport {city}'],
    nl: ['van {airport} naar {city} centrum', 'vervoer luchthaven {city}'],
    pl: ['z lotniska {airport} do {city}', 'dojazd z lotniska {iata}'],
    pt: ['como ir do aeroporto {airport} para {city}', 'do {iata} ao centro de {city}'],
  },
  'cost-of-living.city': {
    en: ['cost of living in {city}', 'how expensive is {city}', '{city} living costs'],
    de: ['lebenshaltungskosten {city}', 'wie teuer ist {city}'],
    ja: ['{city} 物価', '{city} 生活費'],
    'zh-Hant': ['{city} 物價', '{city} 生活費用'],
    it: ['costo della vita a {city}', 'quanto costa vivere a {city}'],
    es: ['coste de vida en {city}', 'cuánto cuesta vivir en {city}'],
    fr: ['coût de la vie à {city}', 'budget vie {city}'],
    nl: ['kosten van levensonderhoud {city}', 'hoe duur is {city}'],
    pl: ['koszty życia w {city}', 'ile kosztuje życie w {city}'],
    pt: ['custo de vida em {city}', 'quanto custa morar em {city}'],
  },
  'rents.city': {
    en: ['rent in {city}', 'average rent {city}', 'renting an apartment in {city}'],
    de: ['miete {city}', 'durchschnittsmiete {city}', 'wohnung mieten {city}'],
    ja: ['{city} 家賃', '{city} 賃貸 相場'],
    'zh-Hant': ['{city} 租金', '{city} 租屋 行情'],
    it: ['affitti a {city}', 'quanto costa affittare a {city}'],
    es: ['alquiler en {city}', 'precio alquiler {city}'],
    fr: ['loyer à {city}', 'prix location {city}'],
    nl: ['huur {city}', 'huurprijzen {city}'],
    pl: ['wynajem mieszkania {city}', 'ceny najmu {city}'],
    pt: ['aluguel em {city}', 'preço de aluguel {city}'],
  },
  'work.city-salaries': {
    en: ['average salary in {city}', 'salaries in {city}', 'how much do people earn in {city}'],
    de: ['durchschnittsgehalt {city}', 'gehalt {city}'],
    ja: ['{city} 平均年収', '{city} 給料'],
    'zh-Hant': ['{city} 平均薪資', '{city} 薪水'],
    it: ['stipendio medio a {city}', 'quanto si guadagna a {city}'],
    es: ['salario medio en {city}', 'cuánto se gana en {city}'],
    fr: ['salaire moyen à {city}', 'combien gagne on à {city}'],
    nl: ['gemiddeld salaris {city}', 'lonen in {city}'],
    pl: ['średnie zarobki {city}', 'ile się zarabia w {city}'],
    pt: ['salário médio em {city}', 'quanto se ganha em {city}'],
  },
  'visas.country-visit': {
    en: ['do i need a visa for {country}', '{country} visa requirements', '{country} tourist visa'],
    de: ['brauche ich ein visum für {country}', 'einreisebestimmungen {country}'],
    ja: ['{country} ビザ 必要', '{country} 入国 条件'],
    'zh-Hant': ['{country} 簽證', '{country} 入境 規定'],
    it: ['serve il visto per {country}', 'requisiti ingresso {country}'],
    es: ['necesito visado para {country}', 'requisitos de entrada {country}'],
    fr: ['faut il un visa pour {country}', 'conditions entrée {country}'],
    nl: ['visum nodig voor {country}', 'inreisregels {country}'],
    pl: ['czy potrzebna wiza do {country}', 'wjazd do {country} wymagania'],
    pt: ['preciso de visto para {country}', 'requisitos de entrada {country}'],
  },
  'relocation.city': {
    en: ['moving to {city}', 'living in {city} as a foreigner', 'relocating to {city}'],
    de: ['auswandern nach {city}', 'leben in {city}', 'umzug nach {city}'],
    ja: ['{city} 移住', '{city} 海外生活'],
    'zh-Hant': ['{city} 移居', '{city} 生活'],
    it: ['trasferirsi a {city}', 'vivere a {city}'],
    es: ['mudarse a {city}', 'vivir en {city}'],
    fr: ['s installer à {city}', 'vivre à {city}'],
    nl: ['verhuizen naar {city}', 'wonen in {city}'],
    pl: ['przeprowadzka do {city}', 'życie w {city}'],
    pt: ['morar em {city}', 'mudar para {city}'],
  },
  'neighbourhoods.city-where-to-stay': {
    en: ['where to stay in {city}', 'best area to stay in {city}', '{city} neighbourhoods'],
    de: ['wo übernachten in {city}', 'bestes viertel {city}'],
    ja: ['{city} どこに泊まる', '{city} エリア おすすめ'],
    'zh-Hant': ['{city} 住哪裡', '{city} 住宿 區域'],
    it: ['dove alloggiare a {city}', 'quartieri di {city}'],
    es: ['dónde alojarse en {city}', 'mejores barrios de {city}'],
    fr: ['où loger à {city}', 'quartiers de {city}'],
    nl: ['waar overnachten in {city}', 'wijken {city}'],
    pl: ['gdzie mieszkać w {city}', 'dzielnice {city}'],
    pt: ['onde ficar em {city}', 'bairros de {city}'],
  },
  'safety.city': {
    en: ['is {city} safe', '{city} safety', 'crime in {city}'],
    de: ['ist {city} sicher', 'sicherheit {city}'],
    ja: ['{city} 治安'],
    'zh-Hant': ['{city} 治安'],
    it: ['{city} è sicura', 'sicurezza {city}'],
    es: ['es seguro {city}', 'seguridad en {city}'],
    fr: ['{city} est elle sûre', 'sécurité {city}'],
    nl: ['is {city} veilig', 'veiligheid {city}'],
    pl: ['czy {city} jest bezpieczne', 'bezpieczeństwo {city}'],
    pt: ['{city} é segura', 'segurança em {city}'],
  },
  'transport.route-from-market': {
    en: ['flights to {city}', 'how long is the flight to {city}', 'getting to {city}'],
    de: ['flüge nach {city}', 'flugzeit nach {city}'],
    ja: ['{city} 行き 航空券', '{city} 飛行時間'],
    'zh-Hant': ['{city} 機票', '{city} 飛行時間'],
    it: ['voli per {city}', 'quanto dura il volo per {city}'],
    es: ['vuelos a {city}', 'cuánto dura el vuelo a {city}'],
    fr: ['vols pour {city}', 'durée de vol {city}'],
    nl: ['vluchten naar {city}', 'vliegtijd {city}'],
    pl: ['loty do {city}', 'ile trwa lot do {city}'],
    pt: ['voos para {city}', 'quanto tempo de voo para {city}'],
  },
};

export const phrasingsFor = (family, language) => (PHRASINGS[family] && PHRASINGS[family][language]) || [];

// Families whose phrasings have not been written yet are not silently empty:
// the manifest reports them so the gap is visible instead of looking like an
// absence of demand.
export function coverage(families, languages) {
  const missing = [];
  for (const f of families) for (const l of languages) if (!phrasingsFor(f, l).length) missing.push(f + '/' + l);
  return { covered: families.length * languages.length - missing.length, missing };
}

export function expand(template, slots) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (slots[k] == null ? '' : String(slots[k]))).replace(/\s+/g, ' ').trim();
}

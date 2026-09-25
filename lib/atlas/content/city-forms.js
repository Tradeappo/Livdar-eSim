// What each market calls a city.
//
// The entity store holds one name per city, the endonym, because the gazetteer
// behind it carries localised labels for almost nothing below country level.
// That was tolerable while the pages were about countries, where CLDR ships a
// real localisation for every one of them, and it stopped being tolerable the
// moment a city page existed: an Italian page that says Turin instead of
// Torino, or a Polish one that says London instead of Londyn, reads as a
// translation of somebody else's site, which is the one thing this programme
// has refused from the start.
//
// Every form here is evidence rather than a guess. Each is the name that
// appears in the keyword measured in that market: `quartieri torino`,
// `dzielnice londynu`, `barrios de nueva york`, `wijken berlijn`. Where a
// market's keyword gave an inflected form, the nominative is stored, because a
// heading needs the base form and the inflected one is in the keyword already.
//
// A city absent from a language falls back to the stored name, which is
// correct for most of them: Amsterdam, Madrid, Miami and Chicago are the same
// word in all nine languages.
//
// Japanese and Traditional Chinese entries exist for the prose. The slug is
// built separately and falls back to the Latin name, because a percent encoded
// path is unreadable in a sitemap.

export const CITY_FORMS = {
  // London
  2643743: { es: 'Londres', fr: 'Londres', it: 'Londra', nl: 'Londen', pl: 'Londyn', pt: 'Londres', ja: 'ロンドン' },
  // Paris
  2988507: { es: 'París', it: 'Parigi', nl: 'Parijs', pl: 'Paryż', ja: 'パリ' },
  // New York City, which no market calls New York City
  5128581: { en: 'New York', de: 'New York', es: 'Nueva York', fr: 'New York', it: 'New York', nl: 'New York', pl: 'Nowy Jork', pt: 'Nova York', ja: 'ニューヨーク' },
  // Berlin
  2950159: { es: 'Berlín', it: 'Berlino', nl: 'Berlijn', pt: 'Berlim', ja: 'ベルリン' },
  // Tokyo
  1850147: { de: 'Tokio', es: 'Tokio', nl: 'Tokio', pl: 'Tokio', pt: 'Tóquio', ja: '東京' },
  // Osaka and Sapporo, which only have Japanese pages
  1853909: { ja: '大阪' },
  2128295: { ja: '札幌' },
  // Barcelona
  3128760: { fr: 'Barcelone', it: 'Barcellona', ja: 'バルセロナ' },
  // Madrid
  3117735: { ja: 'マドリード' },
  // Rome
  3169070: { de: 'Rom', it: 'Roma', pl: 'Rzym', ja: 'ローマ' },
  // Milan
  3173435: { de: 'Mailand', es: 'Milán', it: 'Milano', nl: 'Milaan', pl: 'Mediolan', pt: 'Milão', ja: 'ミラノ' },
  // Turin and Naples, from the Italian keywords
  3165524: { it: 'Torino', ja: 'トリノ' },
  3172394: { it: 'Napoli', de: 'Neapel', es: 'Nápoles', fr: 'Naples', pl: 'Neapol', ja: 'ナポリ' },
  // Nice
  2990440: { de: 'Nizza', es: 'Niza', it: 'Nizza', ja: 'ニース' },
  // Lyon and Marseille keep their French names everywhere; only Japanese differs
  2996944: { ja: 'リヨン' },
  2995469: { ja: 'マルセイユ' },
  // Cologne, Vienna, Zurich, Prague, Montreal: the English pages are the ones
  // that need a form here, because the store holds the endonym
  2886242: { en: 'Cologne', fr: 'Cologne', it: 'Colonia', es: 'Colonia', nl: 'Keulen', pl: 'Kolonia', pt: 'Colónia', ja: 'ケルン' },
  2761369: { de: 'Wien', es: 'Viena', fr: 'Vienne', it: 'Vienna', nl: 'Wenen', pl: 'Wiedeń', pt: 'Viena', ja: 'ウィーン' },
  2657896: { en: 'Zurich', it: 'Zurigo', fr: 'Zurich', es: 'Zúrich', nl: 'Zürich', pl: 'Zurych', pt: 'Zurique', ja: 'チューリッヒ' },
  3067696: { de: 'Prag', es: 'Praga', fr: 'Prague', it: 'Praga', nl: 'Praag', pl: 'Praga', pt: 'Praga', ja: 'プラハ' },
  6077243: { en: 'Montreal', de: 'Montreal', es: 'Montreal', it: 'Montreal', nl: 'Montreal', pl: 'Montreal', pt: 'Montreal', ja: 'モントリオール' },
  // Hamburg, Amsterdam, Chicago, Miami, San Francisco, Bangkok, Singapore,
  // Wroclaw, Gdansk and Sao Paulo are stored as their markets write them, so
  // only the Japanese forms are added
  2911298: { ja: 'ハンブルク' },
  2759794: { de: 'Amsterdam', pl: 'Amsterdam', ja: 'アムステルダム' },
  4887398: { ja: 'シカゴ' },
  4164138: { ja: 'マイアミ' },
  5391959: { ja: 'サンフランシスコ' },
  1609350: { ja: 'バンコク' },
  1880252: { ja: 'シンガポール' },
  3448439: { ja: 'サンパウロ' },
};

export const cityForm = (cityId, language) => (CITY_FORMS[String(cityId)] || {})[language] || null;

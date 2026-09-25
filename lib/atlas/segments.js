// URL segments and month names for every Atlas language.
//
// The English and German values are frozen: they are the ones already live on
// livdar.com, and a test asserts they still produce exactly the paths that are
// published. Everything else is new and only ever used once its market is
// activated, so adding a language can never move an existing URL.
//
// Segments are ASCII, lower case, and chosen as the language would name the
// section, not as a transliteration of the English word.

export const FAMILY_SEGMENTS = {
  city: { en: 'cities', de: 'staedte', ja: 'toshi', 'zh-Hant': 'chengshi', it: 'citta', es: 'ciudades', fr: 'villes', nl: 'steden', pl: 'miasta', pt: 'cidades' },
  airport: { en: 'airports', de: 'flughaefen', ja: 'kuko', 'zh-Hant': 'jichang', it: 'aeroporti', es: 'aeropuertos', fr: 'aeroports', nl: 'luchthavens', pl: 'lotniska', pt: 'aeroportos' },
  country: { en: 'countries', de: 'laender', ja: 'kuni', 'zh-Hant': 'guojia', it: 'paesi', es: 'paises', fr: 'pays', nl: 'landen', pl: 'kraje', pt: 'paises' },
  neighbourhood: { en: 'neighbourhoods', de: 'viertel', ja: 'chiku', 'zh-Hant': 'quyu', it: 'quartieri', es: 'barrios', fr: 'quartiers', nl: 'wijken', pl: 'dzielnice', pt: 'bairros' },
};

export const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  'zh-Hant': ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  nl: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
  pt: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
};

// The month slug pattern each language uses. Japanese and traditional Chinese
// do not form a readable ASCII slug from the month name, so they carry the
// number, which is also how those markets write a month.
export const MONTH_SLUG_PATTERN = {
  en: (n) => 'weather-in-' + n,
  de: (n) => 'wetter-im-' + n,
  ja: (n, m) => 'tenki-' + (m + 1) + 'gatsu',
  'zh-Hant': (n, m) => 'tianqi-' + (m + 1) + 'yue',
  it: (n) => 'clima-a-' + n,
  es: (n) => 'clima-en-' + n,
  fr: (n) => 'meteo-en-' + n,
  nl: (n) => 'weer-in-' + n,
  pl: (n) => 'pogoda-w-' + n,
  pt: (n) => 'clima-em-' + n,
};

export const atlasLanguages = () => Object.keys(MONTH_NAMES);

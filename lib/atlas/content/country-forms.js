// Country names in subject position, per language.
//
// CLDR gives the bare name and that is not always a sentence. French,
// Italian and Portuguese put an article in front of almost every country,
// English and German and Dutch in front of a few, and Polish and Japanese in
// front of none. A generated sentence that writes "Suisse a un niveau des
// prix" is wrong in a way that no amount of correct data repairs, so the
// subject form is stored rather than assembled.
//
// The table covers every country that any built source can produce a page
// for. A country outside it has no subject form, and the page generator
// refuses the page instead of falling back to the bare name, because a
// silent fallback is how ungrammatical copy reaches production. A test
// asserts every entity in the cohort has an entry in every cohort language.
//
// Languages absent from this file take the CLDR name unchanged, which is the
// correct behaviour for Polish and Japanese rather than an omission.

// Only the countries whose subject form differs from the CLDR name are
// listed. Everything else falls through to the bare name, which is why
// Portuguese and Italian and French have long lists and German a short one.
const OVERRIDES = {
  en: {
    GB: 'the United Kingdom', US: 'the United States', NL: 'the Netherlands',
  },
  de: {
    CH: 'die Schweiz', NL: 'die Niederlande', TR: 'die Türkei', SK: 'die Slowakei',
    GB: 'das Vereinigte Königreich', US: 'die Vereinigten Staaten', UA: 'die Ukraine',
    MD: 'die Republik Moldau', CZ: 'Tschechien',
  },
  nl: {
    GB: 'het Verenigd Koninkrijk', US: 'de Verenigde Staten', UA: 'Oekraïne',
  },
  fr: {
    AL: "l'Albanie", AT: "l'Autriche", BA: 'la Bosnie-Herzégovine', BE: 'la Belgique',
    BG: 'la Bulgarie', CA: 'le Canada', CH: 'la Suisse', CY: 'Chypre', CZ: 'la Tchéquie',
    DE: "l'Allemagne", DK: 'le Danemark', EE: "l'Estonie", ES: "l'Espagne", FI: 'la Finlande',
    FR: 'la France', GB: 'le Royaume-Uni', GR: 'la Grèce', HR: 'la Croatie', HU: 'la Hongrie',
    IE: "l'Irlande", IS: "l'Islande", IT: "l'Italie", JP: 'le Japon', LT: 'la Lituanie',
    LU: 'le Luxembourg', LV: 'la Lettonie', MD: 'la Moldavie', ME: 'le Monténégro',
    MK: 'la Macédoine du Nord', MT: 'Malte', NL: 'les Pays-Bas', NO: 'la Norvège',
    PL: 'la Pologne', PT: 'le Portugal', RO: 'la Roumanie', RS: 'la Serbie', SE: 'la Suède',
    SI: 'la Slovénie', SK: 'la Slovaquie', TH: 'la Thaïlande', TR: 'la Turquie',
    UA: "l'Ukraine", US: 'les États-Unis',
  },
  it: {
    AL: "l'Albania", AT: "l'Austria", BA: 'la Bosnia ed Erzegovina', BE: 'il Belgio',
    BG: 'la Bulgaria', CA: 'il Canada', CH: 'la Svizzera', CY: 'Cipro', CZ: 'la Cechia',
    DE: 'la Germania', DK: 'la Danimarca', EE: "l'Estonia", ES: 'la Spagna', FI: 'la Finlandia',
    FR: 'la Francia', GB: 'il Regno Unito', GR: 'la Grecia', HR: 'la Croazia', HU: "l'Ungheria",
    IE: "l'Irlanda", IS: "l'Islanda", IT: "l'Italia", JP: 'il Giappone', LT: 'la Lituania',
    LU: 'il Lussemburgo', LV: 'la Lettonia', MD: 'la Moldavia', ME: 'il Montenegro',
    MK: 'la Macedonia del Nord', MT: 'Malta', NL: 'i Paesi Bassi', NO: 'la Norvegia',
    PL: 'la Polonia', PT: 'il Portogallo', RO: 'la Romania', RS: 'la Serbia', SE: 'la Svezia',
    SI: 'la Slovenia', SK: 'la Slovacchia', TH: 'la Thailandia', TR: 'la Turchia',
    UA: "l'Ucraina", US: 'gli Stati Uniti',
  },
  es: {
    GB: 'el Reino Unido', NL: 'los Países Bajos', US: 'los Estados Unidos',
    IN: 'la India', SV: 'El Salvador',
  },
  pt: {
    AL: 'a Albânia', AT: 'a Áustria', BA: 'a Bósnia e Herzegovina', BE: 'a Bélgica',
    BG: 'a Bulgária', CA: 'o Canadá', CH: 'a Suíça', CY: 'Chipre', CZ: 'a Tchéquia',
    DE: 'a Alemanha', DK: 'a Dinamarca', EE: 'a Estônia', ES: 'a Espanha', FI: 'a Finlândia',
    FR: 'a França', GB: 'o Reino Unido', GR: 'a Grécia', HR: 'a Croácia', HU: 'a Hungria',
    IE: 'a Irlanda', IS: 'a Islândia', IT: 'a Itália', JP: 'o Japão', LT: 'a Lituânia',
    LU: 'o Luxemburgo', LV: 'a Letônia', MD: 'a Moldávia', ME: 'o Montenegro',
    MK: 'a Macedônia do Norte', MT: 'Malta', NL: 'os Países Baixos', NO: 'a Noruega',
    PL: 'a Polônia', PT: 'Portugal', RO: 'a Romênia', RS: 'a Sérvia', SE: 'a Suécia',
    SI: 'a Eslovênia', SK: 'a Eslováquia', TH: 'a Tailândia', TR: 'a Turquia',
    UA: 'a Ucrânia', US: 'os Estados Unidos',
  },
  // Polish and Japanese use no article, so the CLDR name is already the
  // subject form and an override table would be a table of duplicates.
  pl: {},
  ja: {},
};

// Languages where a country absent from the override list is still correct
// with its bare CLDR name. For French, Italian and Portuguese that is not
// true in general, so those three declare the full set above and a country
// missing from them is a gap rather than a bare-name case.
const ARTICLE_LANGUAGES = new Set(['fr', 'it', 'pt']);

const displayCache = new Map();
function cldr(iso2, language) {
  if (!displayCache.has(language)) displayCache.set(language, new Intl.DisplayNames([language], { type: 'region' }));
  try { return displayCache.get(language).of(iso2) || null; } catch { return null; }
}

// The country as the subject of a sentence, or null when the language needs
// an article and none is recorded. Null is the signal to skip the page, not
// to guess.
export function subject(iso2, language) {
  const over = OVERRIDES[language];
  if (over && over[iso2]) return over[iso2];
  if (ARTICLE_LANGUAGES.has(language)) return null;
  return cldr(iso2, language);
}

// The bare name, for table cells and lists where no sentence is being built
// and an article would be wrong.
export const plain = (iso2, language) => cldr(iso2, language);

export const languagesCovered = () => Object.keys(OVERRIDES);
export const hasSubject = (iso2, language) => subject(iso2, language) !== null;

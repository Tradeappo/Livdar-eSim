// Destination dataset for Livdar eSIM.
//
// Factual fields only. Networks listed are the mobile network operators that
// actually run the radio access network in that country. We do not claim which
// of them a plan roams on until a provider is connected, because that is a
// per-plan fact and it changes.
//
// names: localised country name per market. Where a market writes the country
// the same way English does, the entry is omitted and falls back to English.

import { slugify, LATIN_SLUG_LOCALES, DEFAULT_LOCALE } from './i18n.js';

const D = (id, iso2, region, callingCode, networks, names = {}, tags = []) => ({
  id, iso2, region, callingCode, networks, names, tags,
});

export const REGIONS = [
  { id: 'europe', names: { en: 'Europe', de: 'Europa', ro: 'Europa', fr: 'Europe', it: 'Europa', es: 'Europa', nl: 'Europa', pl: 'Europa', pt: 'Europa' } },
  { id: 'asia', names: { en: 'Asia', de: 'Asien', ro: 'Asia', fr: 'Asie', it: 'Asia', es: 'Asia', nl: 'Azie', pl: 'Azja', pt: 'Asia' } },
  { id: 'southeast-asia', names: { en: 'Southeast Asia', de: 'Suedostasien', ro: 'Asia de Sud-Est', fr: 'Asie du Sud-Est', it: 'Sud-est asiatico', es: 'Sudeste Asiatico', nl: 'Zuidoost-Azie', pl: 'Azja Poludniowo-Wschodnia', pt: 'Sudeste Asiatico' } },
  { id: 'north-america', names: { en: 'North America', de: 'Nordamerika', ro: 'America de Nord', fr: 'Amerique du Nord', it: 'Nord America', es: 'America del Norte', nl: 'Noord-Amerika', pl: 'Ameryka Polnocna', pt: 'America do Norte' } },
  { id: 'south-america', names: { en: 'South America', de: 'Suedamerika', ro: 'America de Sud', fr: 'Amerique du Sud', it: 'Sud America', es: 'America del Sur', nl: 'Zuid-Amerika', pl: 'Ameryka Poludniowa', pt: 'America do Sul' } },
  { id: 'central-america', names: { en: 'Central America', de: 'Mittelamerika', ro: 'America Centrala', fr: 'Amerique centrale', it: 'America centrale', es: 'America Central', nl: 'Midden-Amerika', pl: 'Ameryka Srodkowa', pt: 'America Central' } },
  { id: 'caribbean', names: { en: 'Caribbean', de: 'Karibik', ro: 'Caraibe', fr: 'Caraibes', it: 'Caraibi', es: 'Caribe', nl: 'Caribisch gebied', pl: 'Karaiby', pt: 'Caraibas' } },
  { id: 'middle-east', names: { en: 'Middle East', de: 'Naher Osten', ro: 'Orientul Mijlociu', fr: 'Moyen-Orient', it: 'Medio Oriente', es: 'Oriente Medio', nl: 'Midden-Oosten', pl: 'Bliski Wschod', pt: 'Medio Oriente' } },
  { id: 'africa', names: { en: 'Africa', de: 'Afrika', ro: 'Africa', fr: 'Afrique', it: 'Africa', es: 'Africa', nl: 'Afrika', pl: 'Afryka', pt: 'Africa' } },
  { id: 'oceania', names: { en: 'Oceania', de: 'Ozeanien', ro: 'Oceania', fr: 'Oceanie', it: 'Oceania', es: 'Oceania', nl: 'Oceanie', pl: 'Oceania', pt: 'Oceania' } },
  { id: 'balkans', names: { en: 'Balkans', de: 'Balkan', ro: 'Balcani', fr: 'Balkans', it: 'Balcani', es: 'Balcanes', nl: 'Balkan', pl: 'Balkany', pt: 'Balcas' } },
  { id: 'global', names: { en: 'Global', de: 'Weltweit', ro: 'Global', fr: 'Monde', it: 'Globale', es: 'Global', nl: 'Wereldwijd', pl: 'Swiat', pt: 'Global' } },
];

export const DESTINATIONS = [
  // Europe
  D('turkey', 'TR', 'europe', '+90', ['Turkcell', 'Vodafone Turkiye', 'Turk Telekom'], { de: 'Tuerkei', ro: 'Turcia', fr: 'Turquie', it: 'Turchia', es: 'Turquia', nl: 'Turkije', pl: 'Turcja', pt: 'Turquia' }, ['tourism', 'expensive-roaming', 'non-eu']),
  D('spain', 'ES', 'europe', '+34', ['Movistar', 'Vodafone Espana', 'Orange Espana', 'Yoigo'], { de: 'Spanien', ro: 'Spania', fr: 'Espagne', it: 'Spagna', es: 'Espana', nl: 'Spanje', pl: 'Hiszpania', pt: 'Espanha' }, ['tourism', 'eu']),
  D('italy', 'IT', 'europe', '+39', ['TIM', 'Vodafone Italia', 'WindTre', 'Iliad'], { de: 'Italien', ro: 'Italia', fr: 'Italie', es: 'Italia', nl: 'Italie', pl: 'Wlochy', pt: 'Italia' }, ['tourism', 'eu']),
  D('france', 'FR', 'europe', '+33', ['Orange', 'SFR', 'Bouygues Telecom', 'Free Mobile'], { de: 'Frankreich', ro: 'Franta', fr: 'France', it: 'Francia', es: 'Francia', nl: 'Frankrijk', pl: 'Francja', pt: 'Franca' }, ['tourism', 'eu']),
  D('germany', 'DE', 'europe', '+49', ['Telekom', 'Vodafone', 'O2 Telefonica'], { de: 'Deutschland', ro: 'Germania', fr: 'Allemagne', it: 'Germania', es: 'Alemania', nl: 'Duitsland', pl: 'Niemcy', pt: 'Alemanha' }, ['business', 'eu']),
  D('united-kingdom', 'GB', 'europe', '+44', ['EE', 'Vodafone UK', 'O2', 'Three UK'], { de: 'Grossbritannien', ro: 'Marea Britanie', fr: 'Royaume-Uni', it: 'Regno Unito', es: 'Reino Unido', nl: 'Verenigd Koninkrijk', pl: 'Wielka Brytania', pt: 'Reino Unido' }, ['business', 'tourism', 'non-eu', 'expensive-roaming']),
  D('greece', 'GR', 'europe', '+30', ['Cosmote', 'Vodafone Greece', 'Nova'], { de: 'Griechenland', ro: 'Grecia', fr: 'Grece', it: 'Grecia', es: 'Grecia', nl: 'Griekenland', pl: 'Grecja', pt: 'Grecia' }, ['tourism', 'eu']),
  D('portugal', 'PT', 'europe', '+351', ['MEO', 'Vodafone Portugal', 'NOS'], { de: 'Portugal', ro: 'Portugalia', fr: 'Portugal', pl: 'Portugalia' }, ['tourism', 'nomad', 'eu']),
  D('netherlands', 'NL', 'europe', '+31', ['KPN', 'VodafoneZiggo', 'Odido'], { de: 'Niederlande', ro: 'Olanda', fr: 'Pays-Bas', it: 'Paesi Bassi', es: 'Paises Bajos', nl: 'Nederland', pl: 'Holandia', pt: 'Paises Baixos' }, ['business', 'eu']),
  D('switzerland', 'CH', 'europe', '+41', ['Swisscom', 'Sunrise', 'Salt'], { de: 'Schweiz', ro: 'Elvetia', fr: 'Suisse', it: 'Svizzera', es: 'Suiza', nl: 'Zwitserland', pl: 'Szwajcaria', pt: 'Suica' }, ['expensive-roaming', 'non-eu', 'business']),
  D('austria', 'AT', 'europe', '+43', ['A1', 'Magenta', 'Drei'], { de: 'Oesterreich', ro: 'Austria', fr: 'Autriche', it: 'Austria', es: 'Austria', nl: 'Oostenrijk', pl: 'Austria', pt: 'Austria' }, ['tourism', 'eu']),
  D('poland', 'PL', 'europe', '+48', ['Orange Polska', 'Play', 'Plus', 'T-Mobile Polska'], { de: 'Polen', ro: 'Polonia', fr: 'Pologne', it: 'Polonia', es: 'Polonia', nl: 'Polen', pl: 'Polska', pt: 'Polonia' }, ['eu']),
  D('czechia', 'CZ', 'europe', '+420', ['O2 Czech Republic', 'T-Mobile CZ', 'Vodafone CZ'], { de: 'Tschechien', ro: 'Cehia', fr: 'Republique tcheque', it: 'Repubblica Ceca', es: 'Republica Checa', nl: 'Tsjechie', pl: 'Czechy', pt: 'Republica Checa' }, ['tourism', 'eu']),
  D('hungary', 'HU', 'europe', '+36', ['Magyar Telekom', 'Yettel', 'One'], { de: 'Ungarn', ro: 'Ungaria', fr: 'Hongrie', it: 'Ungheria', es: 'Hungria', nl: 'Hongarije', pl: 'Wegry', pt: 'Hungria' }, ['tourism', 'eu']),
  D('romania', 'RO', 'europe', '+40', ['Orange Romania', 'Vodafone Romania', 'Digi', 'Telekom Romania'], { de: 'Rumaenien', ro: 'Romania', fr: 'Roumanie', it: 'Romania', es: 'Rumania', nl: 'Roemenie', pl: 'Rumunia', pt: 'Romenia' }, ['eu']),
  D('bulgaria', 'BG', 'europe', '+359', ['A1 Bulgaria', 'Yettel', 'Vivacom'], { de: 'Bulgarien', ro: 'Bulgaria', fr: 'Bulgarie', it: 'Bulgaria', es: 'Bulgaria', nl: 'Bulgarije', pl: 'Bulgaria', pt: 'Bulgaria' }, ['tourism', 'eu']),
  D('croatia', 'HR', 'balkans', '+385', ['Hrvatski Telekom', 'A1 Hrvatska', 'Telemach'], { de: 'Kroatien', ro: 'Croatia', fr: 'Croatie', it: 'Croazia', es: 'Croacia', nl: 'Kroatie', pl: 'Chorwacja', pt: 'Croacia' }, ['tourism', 'eu']),
  D('serbia', 'RS', 'balkans', '+381', ['Telekom Srbija', 'A1 Srbija', 'Yettel Srbija'], { de: 'Serbien', ro: 'Serbia', fr: 'Serbie', it: 'Serbia', es: 'Serbia', nl: 'Servie', pl: 'Serbia', pt: 'Servia' }, ['non-eu', 'expensive-roaming']),
  D('albania', 'AL', 'balkans', '+355', ['Vodafone Albania', 'One Albania'], { de: 'Albanien', ro: 'Albania', fr: 'Albanie', it: 'Albania', es: 'Albania', nl: 'Albanie', pl: 'Albania', pt: 'Albania' }, ['tourism', 'non-eu', 'expensive-roaming']),
  D('montenegro', 'ME', 'balkans', '+382', ['Crnogorski Telekom', 'One Montenegro', 'Mtel'], { de: 'Montenegro', ro: 'Muntenegru', fr: 'Montenegro', pl: 'Czarnogora' }, ['tourism', 'non-eu', 'expensive-roaming']),
  D('bosnia-and-herzegovina', 'BA', 'balkans', '+387', ['BH Telecom', 'm:tel', 'HT Eronet'], { de: 'Bosnien und Herzegowina', ro: 'Bosnia si Hertegovina', fr: 'Bosnie-Herzegovine', it: 'Bosnia ed Erzegovina', es: 'Bosnia y Herzegovina', nl: 'Bosnie en Herzegovina', pl: 'Bosnia i Hercegowina', pt: 'Bosnia e Herzegovina' }, ['non-eu', 'expensive-roaming']),
  D('north-macedonia', 'MK', 'balkans', '+389', ['Makedonski Telekom', 'A1 Makedonija'], { de: 'Nordmazedonien', ro: 'Macedonia de Nord', fr: 'Macedoine du Nord', it: 'Macedonia del Nord', es: 'Macedonia del Norte', nl: 'Noord-Macedonie', pl: 'Macedonia Polnocna', pt: 'Macedonia do Norte' }, ['non-eu', 'expensive-roaming']),
  D('ireland', 'IE', 'europe', '+353', ['Vodafone Ireland', 'Eir', 'Three Ireland'], { de: 'Irland', ro: 'Irlanda', fr: 'Irlande', it: 'Irlanda', es: 'Irlanda', nl: 'Ierland', pl: 'Irlandia', pt: 'Irlanda' }, ['eu']),
  D('belgium', 'BE', 'europe', '+32', ['Proximus', 'Orange Belgium', 'BASE'], { de: 'Belgien', ro: 'Belgia', fr: 'Belgique', it: 'Belgio', es: 'Belgica', nl: 'Belgie', pl: 'Belgia', pt: 'Belgica' }, ['business', 'eu']),
  D('denmark', 'DK', 'europe', '+45', ['TDC', 'Telenor', 'Telia', '3'], { de: 'Daenemark', ro: 'Danemarca', fr: 'Danemark', it: 'Danimarca', es: 'Dinamarca', nl: 'Denemarken', pl: 'Dania', pt: 'Dinamarca' }, ['eu']),
  D('sweden', 'SE', 'europe', '+46', ['Telia', 'Tele2', 'Telenor', 'Tre'], { de: 'Schweden', ro: 'Suedia', fr: 'Suede', it: 'Svezia', es: 'Suecia', nl: 'Zweden', pl: 'Szwecja', pt: 'Suecia' }, ['eu']),
  D('norway', 'NO', 'europe', '+47', ['Telenor', 'Telia Norge', 'Ice'], { de: 'Norwegen', ro: 'Norvegia', fr: 'Norvege', it: 'Norvegia', es: 'Noruega', nl: 'Noorwegen', pl: 'Norwegia', pt: 'Noruega' }, ['tourism', 'expensive-roaming']),
  D('finland', 'FI', 'europe', '+358', ['Elisa', 'Telia Finland', 'DNA'], { de: 'Finnland', ro: 'Finlanda', fr: 'Finlande', it: 'Finlandia', es: 'Finlandia', nl: 'Finland', pl: 'Finlandia', pt: 'Finlandia' }, ['eu']),
  D('iceland', 'IS', 'europe', '+354', ['Siminn', 'Vodafone Iceland', 'Nova'], { de: 'Island', ro: 'Islanda', fr: 'Islande', it: 'Islanda', es: 'Islandia', nl: 'IJsland', pl: 'Islandia', pt: 'Islandia' }, ['tourism', 'expensive-roaming']),
  D('cyprus', 'CY', 'europe', '+357', ['Cyta', 'Epic', 'PrimeTel'], { de: 'Zypern', ro: 'Cipru', fr: 'Chypre', it: 'Cipro', es: 'Chipre', nl: 'Cyprus', pl: 'Cypr', pt: 'Chipre' }, ['tourism', 'eu']),
  D('malta', 'MT', 'europe', '+356', ['GO', 'Epic Malta', 'Melita'], { de: 'Malta', ro: 'Malta', fr: 'Malte', pl: 'Malta' }, ['tourism', 'eu']),
  D('iceland-x', 'XX', 'europe', '', [], {}, ['hidden']),

  // Middle East
  D('united-arab-emirates', 'AE', 'middle-east', '+971', ['Etisalat by e&', 'du'], { de: 'Vereinigte Arabische Emirate', ro: 'Emiratele Arabe Unite', fr: 'Emirats arabes unis', it: 'Emirati Arabi Uniti', es: 'Emiratos Arabes Unidos', nl: 'Verenigde Arabische Emiraten', pl: 'Zjednoczone Emiraty Arabskie', pt: 'Emirados Arabes Unidos' }, ['tourism', 'business', 'expensive-roaming']),
  D('saudi-arabia', 'SA', 'middle-east', '+966', ['STC', 'Mobily', 'Zain KSA'], { de: 'Saudi-Arabien', ro: 'Arabia Saudita', fr: 'Arabie saoudite', it: 'Arabia Saudita', es: 'Arabia Saudi', nl: 'Saoedi-Arabie', pl: 'Arabia Saudyjska', pt: 'Arabia Saudita' }, ['business', 'expensive-roaming']),
  D('qatar', 'QA', 'middle-east', '+974', ['Ooredoo', 'Vodafone Qatar'], { de: 'Katar', ro: 'Qatar', fr: 'Qatar', pl: 'Katar' }, ['business', 'expensive-roaming']),
  D('israel', 'IL', 'middle-east', '+972', ['Pelephone', 'Cellcom', 'Partner'], { de: 'Israel', ro: 'Israel', fr: 'Israel', pl: 'Izrael' }, ['expensive-roaming']),
  D('jordan', 'JO', 'middle-east', '+962', ['Zain Jordan', 'Orange Jordan', 'Umniah'], { de: 'Jordanien', ro: 'Iordania', fr: 'Jordanie', it: 'Giordania', es: 'Jordania', nl: 'Jordanie', pl: 'Jordania', pt: 'Jordania' }, ['tourism', 'expensive-roaming']),
  D('oman', 'OM', 'middle-east', '+968', ['Omantel', 'Ooredoo Oman'], { de: 'Oman', ro: 'Oman', fr: 'Oman', pl: 'Oman' }, ['tourism', 'expensive-roaming']),

  // Asia
  D('japan', 'JP', 'asia', '+81', ['NTT Docomo', 'KDDI au', 'SoftBank', 'Rakuten Mobile'], { de: 'Japan', ro: 'Japonia', fr: 'Japon', it: 'Giappone', es: 'Japon', nl: 'Japan', pl: 'Japonia', pt: 'Japao' }, ['tourism', 'business', 'expensive-roaming']),
  D('south-korea', 'KR', 'asia', '+82', ['SK Telecom', 'KT', 'LG Uplus'], { de: 'Suedkorea', ro: 'Coreea de Sud', fr: 'Coree du Sud', it: 'Corea del Sud', es: 'Corea del Sur', nl: 'Zuid-Korea', pl: 'Korea Poludniowa', pt: 'Coreia do Sul' }, ['tourism', 'expensive-roaming']),
  D('china', 'CN', 'asia', '+86', ['China Mobile', 'China Unicom', 'China Telecom'], { de: 'China', ro: 'China', fr: 'Chine', it: 'Cina', es: 'China', nl: 'China', pl: 'Chiny', pt: 'China' }, ['business', 'expensive-roaming', 'restricted-internet']),
  D('hong-kong', 'HK', 'asia', '+852', ['CSL', '3 Hong Kong', 'SmarTone', 'China Mobile HK'], { de: 'Hongkong', ro: 'Hong Kong', fr: 'Hong Kong', pl: 'Hongkong' }, ['business', 'tourism']),
  D('taiwan', 'TW', 'asia', '+886', ['Chunghwa Telecom', 'Taiwan Mobile', 'FarEasTone'], { de: 'Taiwan', ro: 'Taiwan', fr: 'Taiwan', pl: 'Tajwan' }, ['tourism']),
  D('india', 'IN', 'asia', '+91', ['Jio', 'Airtel', 'Vi'], { de: 'Indien', ro: 'India', fr: 'Inde', it: 'India', es: 'India', nl: 'India', pl: 'Indie', pt: 'India' }, ['tourism', 'business', 'expensive-roaming']),
  D('sri-lanka', 'LK', 'asia', '+94', ['Dialog', 'Mobitel', 'Hutch'], { de: 'Sri Lanka', ro: 'Sri Lanka', fr: 'Sri Lanka', pl: 'Sri Lanka' }, ['tourism', 'nomad']),
  D('nepal', 'NP', 'asia', '+977', ['Nepal Telecom', 'Ncell'], { de: 'Nepal', ro: 'Nepal', fr: 'Nepal', pl: 'Nepal' }, ['tourism']),
  D('maldives', 'MV', 'asia', '+960', ['Dhiraagu', 'Ooredoo Maldives'], { de: 'Malediven', ro: 'Maldive', fr: 'Maldives', it: 'Maldive', es: 'Maldivas', nl: 'Malediven', pl: 'Malediwy', pt: 'Maldivas' }, ['tourism', 'expensive-roaming']),
  D('kazakhstan', 'KZ', 'asia', '+7', ['Kcell', 'Beeline KZ', 'Tele2 KZ'], { de: 'Kasachstan', ro: 'Kazahstan', fr: 'Kazakhstan', it: 'Kazakistan', es: 'Kazajistan', nl: 'Kazachstan', pl: 'Kazachstan', pt: 'Cazaquistao' }, ['business']),
  D('georgia', 'GE', 'asia', '+995', ['Magti', 'Silknet', 'Cellfie'], { de: 'Georgien', ro: 'Georgia', fr: 'Georgie', it: 'Georgia', es: 'Georgia', nl: 'Georgie', pl: 'Gruzja', pt: 'Georgia' }, ['nomad', 'tourism']),
  D('armenia', 'AM', 'asia', '+374', ['Team Telecom', 'Viva-MTS', 'Ucom'], { de: 'Armenien', ro: 'Armenia', fr: 'Armenie', it: 'Armenia', es: 'Armenia', nl: 'Armenie', pl: 'Armenia', pt: 'Armenia' }, ['nomad']),
  D('uzbekistan', 'UZ', 'asia', '+998', ['Beeline UZ', 'Ucell', 'Uzmobile'], { de: 'Usbekistan', ro: 'Uzbekistan', fr: 'Ouzbekistan', it: 'Uzbekistan', es: 'Uzbekistan', nl: 'Oezbekistan', pl: 'Uzbekistan', pt: 'Uzbequistao' }, ['tourism']),
  D('azerbaijan', 'AZ', 'asia', '+994', ['Azercell', 'Bakcell', 'Nar'], { de: 'Aserbaidschan', ro: 'Azerbaidjan', fr: 'Azerbaidjan', it: 'Azerbaigian', es: 'Azerbaiyan', nl: 'Azerbeidzjan', pl: 'Azerbejdzan', pt: 'Azerbaijao' }, ['tourism']),

  // Southeast Asia
  D('thailand', 'TH', 'southeast-asia', '+66', ['AIS', 'TrueMove H', 'NT'], { de: 'Thailand', ro: 'Thailanda', fr: 'Thailande', it: 'Thailandia', es: 'Tailandia', nl: 'Thailand', pl: 'Tajlandia', pt: 'Tailandia' }, ['tourism', 'nomad', 'expensive-roaming']),
  D('vietnam', 'VN', 'southeast-asia', '+84', ['Viettel', 'Vinaphone', 'MobiFone'], { de: 'Vietnam', ro: 'Vietnam', fr: 'Vietnam', it: 'Vietnam', es: 'Vietnam', nl: 'Vietnam', pl: 'Wietnam', pt: 'Vietname' }, ['tourism', 'nomad']),
  D('indonesia', 'ID', 'southeast-asia', '+62', ['Telkomsel', 'Indosat Ooredoo Hutchison', 'XL Axiata'], { de: 'Indonesien', ro: 'Indonezia', fr: 'Indonesie', it: 'Indonesia', es: 'Indonesia', nl: 'Indonesie', pl: 'Indonezja', pt: 'Indonesia' }, ['tourism', 'nomad']),
  D('bali', 'ID', 'southeast-asia', '+62', ['Telkomsel', 'Indosat Ooredoo Hutchison', 'XL Axiata'], { de: 'Bali', ro: 'Bali', fr: 'Bali', pl: 'Bali' }, ['tourism', 'nomad', 'island']),
  D('singapore', 'SG', 'southeast-asia', '+65', ['Singtel', 'StarHub', 'M1'], { de: 'Singapur', ro: 'Singapore', fr: 'Singapour', it: 'Singapore', es: 'Singapur', nl: 'Singapore', pl: 'Singapur', pt: 'Singapura' }, ['business', 'tourism']),
  D('malaysia', 'MY', 'southeast-asia', '+60', ['Maxis', 'Celcom Digi', 'U Mobile'], { de: 'Malaysia', ro: 'Malaezia', fr: 'Malaisie', it: 'Malesia', es: 'Malasia', nl: 'Maleisie', pl: 'Malezja', pt: 'Malasia' }, ['tourism']),
  D('philippines', 'PH', 'southeast-asia', '+63', ['Globe', 'Smart', 'DITO'], { de: 'Philippinen', ro: 'Filipine', fr: 'Philippines', it: 'Filippine', es: 'Filipinas', nl: 'Filipijnen', pl: 'Filipiny', pt: 'Filipinas' }, ['tourism', 'nomad']),
  D('cambodia', 'KH', 'southeast-asia', '+855', ['Smart Axiata', 'Cellcard', 'Metfone'], { de: 'Kambodscha', ro: 'Cambodgia', fr: 'Cambodge', it: 'Cambogia', es: 'Camboya', nl: 'Cambodja', pl: 'Kambodza', pt: 'Camboja' }, ['tourism']),
  D('laos', 'LA', 'southeast-asia', '+856', ['Unitel', 'Lao Telecom'], { de: 'Laos', ro: 'Laos', fr: 'Laos', pl: 'Laos' }, ['tourism']),

  // North America
  D('united-states', 'US', 'north-america', '+1', ['AT&T', 'T-Mobile US', 'Verizon'], { de: 'USA', ro: 'Statele Unite', fr: 'Etats-Unis', it: 'Stati Uniti', es: 'Estados Unidos', nl: 'Verenigde Staten', pl: 'Stany Zjednoczone', pt: 'Estados Unidos' }, ['tourism', 'business', 'expensive-roaming']),
  D('canada', 'CA', 'north-america', '+1', ['Rogers', 'Bell', 'Telus'], { de: 'Kanada', ro: 'Canada', fr: 'Canada', it: 'Canada', es: 'Canada', nl: 'Canada', pl: 'Kanada', pt: 'Canada' }, ['tourism', 'expensive-roaming']),
  D('mexico', 'MX', 'north-america', '+52', ['Telcel', 'AT&T Mexico', 'Movistar Mexico'], { de: 'Mexiko', ro: 'Mexic', fr: 'Mexique', it: 'Messico', es: 'Mexico', nl: 'Mexico', pl: 'Meksyk', pt: 'Mexico' }, ['tourism', 'expensive-roaming']),

  // Central America and Caribbean
  D('costa-rica', 'CR', 'central-america', '+506', ['Kolbi', 'Claro', 'Liberty'], { de: 'Costa Rica', ro: 'Costa Rica', fr: 'Costa Rica', pl: 'Kostaryka' }, ['tourism', 'nomad']),
  D('panama', 'PA', 'central-america', '+507', ['Mas Movil', 'Tigo'], { de: 'Panama', ro: 'Panama', fr: 'Panama', pl: 'Panama' }, ['tourism']),
  D('guatemala', 'GT', 'central-america', '+502', ['Tigo', 'Claro'], { de: 'Guatemala', ro: 'Guatemala', fr: 'Guatemala', pl: 'Gwatemala' }, ['tourism']),
  D('dominican-republic', 'DO', 'caribbean', '+1', ['Claro', 'Altice', 'Viva'], { de: 'Dominikanische Republik', ro: 'Republica Dominicana', fr: 'Republique dominicaine', it: 'Repubblica Dominicana', es: 'Republica Dominicana', nl: 'Dominicaanse Republiek', pl: 'Dominikana', pt: 'Republica Dominicana' }, ['tourism', 'expensive-roaming']),
  D('jamaica', 'JM', 'caribbean', '+1', ['Digicel', 'Flow'], { de: 'Jamaika', ro: 'Jamaica', fr: 'Jamaique', it: 'Giamaica', es: 'Jamaica', nl: 'Jamaica', pl: 'Jamajka', pt: 'Jamaica' }, ['tourism']),
  D('cuba', 'CU', 'caribbean', '+53', ['ETECSA'], { de: 'Kuba', ro: 'Cuba', fr: 'Cuba', it: 'Cuba', es: 'Cuba', nl: 'Cuba', pl: 'Kuba', pt: 'Cuba' }, ['tourism', 'restricted-internet']),
  D('barbados', 'BB', 'caribbean', '+1', ['Flow', 'Digicel'], { de: 'Barbados', ro: 'Barbados', fr: 'Barbade', pl: 'Barbados' }, ['tourism']),

  // South America
  D('brazil', 'BR', 'south-america', '+55', ['Vivo', 'Claro', 'TIM Brasil'], { de: 'Brasilien', ro: 'Brazilia', fr: 'Bresil', it: 'Brasile', es: 'Brasil', nl: 'Brazilie', pl: 'Brazylia', pt: 'Brasil' }, ['tourism', 'expensive-roaming']),
  D('argentina', 'AR', 'south-america', '+54', ['Personal', 'Claro', 'Movistar'], { de: 'Argentinien', ro: 'Argentina', fr: 'Argentine', it: 'Argentina', es: 'Argentina', nl: 'Argentinie', pl: 'Argentyna', pt: 'Argentina' }, ['tourism']),
  D('chile', 'CL', 'south-america', '+56', ['Entel', 'Movistar', 'Claro', 'WOM'], { de: 'Chile', ro: 'Chile', fr: 'Chili', it: 'Cile', es: 'Chile', nl: 'Chili', pl: 'Chile', pt: 'Chile' }, ['tourism']),
  D('peru', 'PE', 'south-america', '+51', ['Claro', 'Movistar', 'Entel'], { de: 'Peru', ro: 'Peru', fr: 'Perou', it: 'Peru', es: 'Peru', nl: 'Peru', pl: 'Peru', pt: 'Peru' }, ['tourism']),
  D('colombia', 'CO', 'south-america', '+57', ['Claro', 'Movistar', 'Tigo', 'WOM'], { de: 'Kolumbien', ro: 'Columbia', fr: 'Colombie', it: 'Colombia', es: 'Colombia', nl: 'Colombia', pl: 'Kolumbia', pt: 'Colombia' }, ['nomad', 'tourism']),
  D('uruguay', 'UY', 'south-america', '+598', ['Antel', 'Claro', 'Movistar'], { de: 'Uruguay', ro: 'Uruguay', fr: 'Uruguay', pl: 'Urugwaj' }, ['tourism']),
  D('ecuador', 'EC', 'south-america', '+593', ['Claro', 'Movistar', 'CNT'], { de: 'Ecuador', ro: 'Ecuador', fr: 'Equateur', it: 'Ecuador', es: 'Ecuador', nl: 'Ecuador', pl: 'Ekwador', pt: 'Equador' }, ['tourism']),
  D('bolivia', 'BO', 'south-america', '+591', ['Entel', 'Tigo', 'Viva'], { de: 'Bolivien', ro: 'Bolivia', fr: 'Bolivie', it: 'Bolivia', es: 'Bolivia', nl: 'Bolivia', pl: 'Boliwia', pt: 'Bolivia' }, ['tourism']),

  // Africa
  D('egypt', 'EG', 'africa', '+20', ['Vodafone Egypt', 'Orange Egypt', 'Etisalat Misr', 'WE'], { de: 'Aegypten', ro: 'Egipt', fr: 'Egypte', it: 'Egitto', es: 'Egipto', nl: 'Egypte', pl: 'Egipt', pt: 'Egito' }, ['tourism', 'expensive-roaming']),
  D('morocco', 'MA', 'africa', '+212', ['Maroc Telecom', 'Orange Maroc', 'Inwi'], { de: 'Marokko', ro: 'Maroc', fr: 'Maroc', it: 'Marocco', es: 'Marruecos', nl: 'Marokko', pl: 'Maroko', pt: 'Marrocos' }, ['tourism', 'expensive-roaming']),
  D('tunisia', 'TN', 'africa', '+216', ['Ooredoo Tunisie', 'Tunisie Telecom', 'Orange Tunisie'], { de: 'Tunesien', ro: 'Tunisia', fr: 'Tunisie', it: 'Tunisia', es: 'Tunez', nl: 'Tunesie', pl: 'Tunezja', pt: 'Tunisia' }, ['tourism']),
  D('south-africa', 'ZA', 'africa', '+27', ['Vodacom', 'MTN', 'Cell C', 'Telkom'], { de: 'Suedafrika', ro: 'Africa de Sud', fr: 'Afrique du Sud', it: 'Sudafrica', es: 'Sudafrica', nl: 'Zuid-Afrika', pl: 'Republika Poludniowej Afryki', pt: 'Africa do Sul' }, ['tourism', 'business']),
  D('kenya', 'KE', 'africa', '+254', ['Safaricom', 'Airtel Kenya'], { de: 'Kenia', ro: 'Kenya', fr: 'Kenya', it: 'Kenya', es: 'Kenia', nl: 'Kenia', pl: 'Kenia', pt: 'Quenia' }, ['tourism']),
  D('tanzania', 'TZ', 'africa', '+255', ['Vodacom Tanzania', 'Airtel Tanzania', 'Tigo'], { de: 'Tansania', ro: 'Tanzania', fr: 'Tanzanie', it: 'Tanzania', es: 'Tanzania', nl: 'Tanzania', pl: 'Tanzania', pt: 'Tanzania' }, ['tourism']),
  D('zanzibar', 'TZ', 'africa', '+255', ['Vodacom Tanzania', 'Airtel Tanzania'], { de: 'Sansibar', ro: 'Zanzibar', fr: 'Zanzibar', pl: 'Zanzibar' }, ['tourism', 'island']),
  D('nigeria', 'NG', 'africa', '+234', ['MTN Nigeria', 'Airtel Nigeria', 'Glo', '9mobile'], { de: 'Nigeria', ro: 'Nigeria', fr: 'Nigeria', pl: 'Nigeria' }, ['business']),
  D('ghana', 'GH', 'africa', '+233', ['MTN Ghana', 'Telecel', 'AT Ghana'], { de: 'Ghana', ro: 'Ghana', fr: 'Ghana', pl: 'Ghana' }, ['business']),
  D('cape-verde', 'CV', 'africa', '+238', ['CVMovel', 'Unitel T+'], { de: 'Kap Verde', ro: 'Capul Verde', fr: 'Cap-Vert', it: 'Capo Verde', es: 'Cabo Verde', nl: 'Kaapverdie', pl: 'Republika Zielonego Przyladka', pt: 'Cabo Verde' }, ['tourism']),
  D('mauritius', 'MU', 'africa', '+230', ['my.t', 'Emtel', 'Chili'], { de: 'Mauritius', ro: 'Mauritius', fr: 'Maurice', it: 'Mauritius', es: 'Mauricio', nl: 'Mauritius', pl: 'Mauritius', pt: 'Mauricia' }, ['tourism']),
  D('seychelles', 'SC', 'africa', '+248', ['Cable & Wireless', 'Airtel Seychelles'], { de: 'Seychellen', ro: 'Seychelles', fr: 'Seychelles', it: 'Seychelles', es: 'Seychelles', nl: 'Seychellen', pl: 'Seszele', pt: 'Seicheles' }, ['tourism']),

  // Oceania
  D('australia', 'AU', 'oceania', '+61', ['Telstra', 'Optus', 'Vodafone Australia'], { de: 'Australien', ro: 'Australia', fr: 'Australie', it: 'Australia', es: 'Australia', nl: 'Australie', pl: 'Australia', pt: 'Australia' }, ['tourism', 'expensive-roaming']),
  D('new-zealand', 'NZ', 'oceania', '+64', ['Spark', 'One NZ', '2degrees'], { de: 'Neuseeland', ro: 'Noua Zeelanda', fr: 'Nouvelle-Zelande', it: 'Nuova Zelanda', es: 'Nueva Zelanda', nl: 'Nieuw-Zeeland', pl: 'Nowa Zelandia', pt: 'Nova Zelandia' }, ['tourism', 'expensive-roaming']),
  D('fiji', 'FJ', 'oceania', '+679', ['Vodafone Fiji', 'Digicel Fiji'], { de: 'Fidschi', ro: 'Fiji', fr: 'Fidji', it: 'Figi', es: 'Fiyi', nl: 'Fiji', pl: 'Fidzi', pt: 'Fiji' }, ['tourism']),

  // Europe, second wave
  D('slovenia', 'SI', 'europe', '+386', ['Telekom Slovenije', 'A1 Slovenija', 'Telemach'], { de: 'Slowenien', ro: 'Slovenia', fr: 'Slovenie', it: 'Slovenia', es: 'Eslovenia', nl: 'Slovenie', pl: 'Slowenia', pt: 'Eslovenia' }, ['tourism', 'eu']),
  D('slovakia', 'SK', 'europe', '+421', ['Orange Slovensko', 'Telekom', 'O2 Slovakia'], { de: 'Slowakei', ro: 'Slovacia', fr: 'Slovaquie', it: 'Slovacchia', es: 'Eslovaquia', nl: 'Slowakije', pl: 'Slowacja', pt: 'Eslovaquia' }, ['eu']),
  D('estonia', 'EE', 'europe', '+372', ['Telia Eesti', 'Elisa', 'Tele2'], { de: 'Estland', ro: 'Estonia', fr: 'Estonie', it: 'Estonia', es: 'Estonia', nl: 'Estland', pl: 'Estonia', pt: 'Estonia' }, ['nomad', 'eu']),
  D('latvia', 'LV', 'europe', '+371', ['LMT', 'Tele2', 'Bite'], { de: 'Lettland', ro: 'Letonia', fr: 'Lettonie', it: 'Lettonia', es: 'Letonia', nl: 'Letland', pl: 'Lotwa', pt: 'Letonia' }, ['eu']),
  D('lithuania', 'LT', 'europe', '+370', ['Telia Lietuva', 'Bite', 'Tele2'], { de: 'Litauen', ro: 'Lituania', fr: 'Lituanie', it: 'Lituania', es: 'Lituania', nl: 'Litouwen', pl: 'Litwa', pt: 'Lituania' }, ['eu']),
  D('luxembourg', 'LU', 'europe', '+352', ['POST Luxembourg', 'Orange Luxembourg', 'Tango'], { de: 'Luxemburg', ro: 'Luxemburg', fr: 'Luxembourg', it: 'Lussemburgo', es: 'Luxemburgo', nl: 'Luxemburg', pl: 'Luksemburg', pt: 'Luxemburgo' }, ['business', 'eu']),
  D('moldova', 'MD', 'europe', '+373', ['Orange Moldova', 'Moldcell', 'Moldtelecom'], { de: 'Moldau', ro: 'Republica Moldova', fr: 'Moldavie', it: 'Moldavia', es: 'Moldavia', nl: 'Moldavie', pl: 'Moldawia', pt: 'Moldavia' }, ['non-eu']),
  D('ukraine', 'UA', 'europe', '+380', ['Kyivstar', 'Vodafone Ukraine', 'lifecell'], { de: 'Ukraine', ro: 'Ucraina', fr: 'Ukraine', it: 'Ucraina', es: 'Ucrania', nl: 'Oekraine', pl: 'Ukraina', pt: 'Ucrania' }, ['non-eu']),
  D('andorra', 'AD', 'europe', '+376', ['Andorra Telecom'], { de: 'Andorra', ro: 'Andorra', fr: 'Andorre', it: 'Andorra', es: 'Andorra', nl: 'Andorra', pl: 'Andora', pt: 'Andorra' }, ['tourism', 'non-eu', 'expensive-roaming']),

  // Asia, second wave
  D('pakistan', 'PK', 'asia', '+92', ['Jazz', 'Zong', 'Telenor Pakistan', 'Ufone'], { de: 'Pakistan', ro: 'Pakistan', fr: 'Pakistan', pl: 'Pakistan' }, ['business']),
  D('bangladesh', 'BD', 'asia', '+880', ['Grameenphone', 'Robi', 'Banglalink'], { de: 'Bangladesch', ro: 'Bangladesh', fr: 'Bangladesh', it: 'Bangladesh', es: 'Banglades', nl: 'Bangladesh', pl: 'Bangladesz', pt: 'Bangladeche' }, ['business']),
  D('mongolia', 'MN', 'asia', '+976', ['Mobicom', 'Unitel', 'Skytel'], { de: 'Mongolei', ro: 'Mongolia', fr: 'Mongolie', it: 'Mongolia', es: 'Mongolia', nl: 'Mongolie', pl: 'Mongolia', pt: 'Mongolia' }, ['tourism']),
  D('brunei', 'BN', 'southeast-asia', '+673', ['DST', 'Imagine', 'Progresif'], { de: 'Brunei', ro: 'Brunei', fr: 'Brunei', pl: 'Brunei' }, ['business']),
  D('myanmar', 'MM', 'southeast-asia', '+95', ['MPT', 'Atom', 'Ooredoo Myanmar'], { de: 'Myanmar', ro: 'Myanmar', fr: 'Birmanie', it: 'Myanmar', es: 'Birmania', nl: 'Myanmar', pl: 'Mjanma', pt: 'Myanmar' }, ['tourism']),
  D('kyrgyzstan', 'KG', 'asia', '+996', ['Beeline KG', 'O!', 'MegaCom'], { de: 'Kirgisistan', ro: 'Kargazstan', fr: 'Kirghizistan', it: 'Kirghizistan', es: 'Kirguistan', nl: 'Kirgizie', pl: 'Kirgistan', pt: 'Quirguistao' }, ['tourism']),

  // Middle East, second wave
  D('kuwait', 'KW', 'middle-east', '+965', ['Zain', 'Ooredoo Kuwait', 'STC Kuwait'], { de: 'Kuwait', ro: 'Kuweit', fr: 'Koweit', it: 'Kuwait', es: 'Kuwait', nl: 'Koeweit', pl: 'Kuwejt', pt: 'Kuwait' }, ['business', 'expensive-roaming']),
  D('bahrain', 'BH', 'middle-east', '+973', ['Batelco', 'Zain Bahrain', 'stc Bahrain'], { de: 'Bahrain', ro: 'Bahrain', fr: 'Bahrein', it: 'Bahrein', es: 'Barein', nl: 'Bahrein', pl: 'Bahrajn', pt: 'Barem' }, ['business']),
  D('lebanon', 'LB', 'middle-east', '+961', ['Alfa', 'touch'], { de: 'Libanon', ro: 'Liban', fr: 'Liban', it: 'Libano', es: 'Libano', nl: 'Libanon', pl: 'Liban', pt: 'Libano' }, ['expensive-roaming']),

  // Africa, second wave
  D('senegal', 'SN', 'africa', '+221', ['Orange Senegal', 'Free', 'Expresso'], { de: 'Senegal', ro: 'Senegal', fr: 'Senegal', pl: 'Senegal' }, ['business']),
  D('ethiopia', 'ET', 'africa', '+251', ['Ethio Telecom', 'Safaricom Ethiopia'], { de: 'Aethiopien', ro: 'Etiopia', fr: 'Ethiopie', it: 'Etiopia', es: 'Etiopia', nl: 'Ethiopie', pl: 'Etiopia', pt: 'Etiopia' }, ['business']),
  D('uganda', 'UG', 'africa', '+256', ['MTN Uganda', 'Airtel Uganda'], { de: 'Uganda', ro: 'Uganda', fr: 'Ouganda', it: 'Uganda', es: 'Uganda', nl: 'Oeganda', pl: 'Uganda', pt: 'Uganda' }, ['tourism']),
  D('rwanda', 'RW', 'africa', '+250', ['MTN Rwanda', 'Airtel Rwanda'], { de: 'Ruanda', ro: 'Rwanda', fr: 'Rwanda', it: 'Ruanda', es: 'Ruanda', nl: 'Rwanda', pl: 'Rwanda', pt: 'Ruanda' }, ['tourism']),
  D('namibia', 'NA', 'africa', '+264', ['MTC', 'Telecom Namibia'], { de: 'Namibia', ro: 'Namibia', fr: 'Namibie', it: 'Namibia', es: 'Namibia', nl: 'Namibie', pl: 'Namibia', pt: 'Namibia' }, ['tourism']),
  D('botswana', 'BW', 'africa', '+267', ['Mascom', 'Orange Botswana', 'BTC'], { de: 'Botswana', ro: 'Botswana', fr: 'Botswana', pl: 'Botswana' }, ['tourism']),
  D('algeria', 'DZ', 'africa', '+213', ['Djezzy', 'Mobilis', 'Ooredoo Algerie'], { de: 'Algerien', ro: 'Algeria', fr: 'Algerie', it: 'Algeria', es: 'Argelia', nl: 'Algerije', pl: 'Algieria', pt: 'Argelia' }, ['business']),

  // Americas, second wave
  D('puerto-rico', 'PR', 'caribbean', '+1', ['Claro Puerto Rico', 'Liberty Mobile', 'T-Mobile'], { de: 'Puerto Rico', ro: 'Puerto Rico', fr: 'Porto Rico', it: 'Porto Rico', es: 'Puerto Rico', nl: 'Puerto Rico', pl: 'Portoryko', pt: 'Porto Rico' }, ['tourism']),
  D('bahamas', 'BS', 'caribbean', '+1', ['BTC', 'Aliv'], { de: 'Bahamas', ro: 'Bahamas', fr: 'Bahamas', it: 'Bahamas', es: 'Bahamas', nl: 'Bahamas', pl: 'Bahamy', pt: 'Baamas' }, ['tourism', 'expensive-roaming']),
  D('aruba', 'AW', 'caribbean', '+297', ['Setar', 'Digicel Aruba'], { de: 'Aruba', ro: 'Aruba', fr: 'Aruba', pl: 'Aruba' }, ['tourism']),
  D('curacao', 'CW', 'caribbean', '+599', ['Digicel Curacao', 'Flow'], { de: 'Curacao', ro: 'Curacao', fr: 'Curacao', nl: 'Curacao', pl: 'Curacao' }, ['tourism']),
  D('paraguay', 'PY', 'south-america', '+595', ['Tigo', 'Personal', 'Claro'], { de: 'Paraguay', ro: 'Paraguay', fr: 'Paraguay', pl: 'Paragwaj' }, ['business']),
  D('honduras', 'HN', 'central-america', '+504', ['Tigo', 'Claro'], { de: 'Honduras', ro: 'Honduras', fr: 'Honduras', pl: 'Honduras' }, ['tourism']),
  D('nicaragua', 'NI', 'central-america', '+505', ['Claro', 'Tigo'], { de: 'Nicaragua', ro: 'Nicaragua', fr: 'Nicaragua', pl: 'Nikaragua' }, ['tourism']),
  D('belize', 'BZ', 'central-america', '+501', ['Digi', 'Smart'], { de: 'Belize', ro: 'Belize', fr: 'Belize', pl: 'Belize' }, ['tourism']),
].filter((d) => !d.tags.includes('hidden'));

export function localizedName(destination, locale) {
  if (!destination) return '';
  return destination.names[locale] || destination.names[DEFAULT_LOCALE] || titleFromId(destination.id);
}

function titleFromId(id) {
  return String(id)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function destinationSlug(destination, locale) {
  if (!destination) return '';
  if (!LATIN_SLUG_LOCALES.includes(locale)) return destination.id;
  const name = destination.names[locale];
  if (!name) return destination.id;
  return slugify(name);
}

export function findDestinationBySlug(slug, locale) {
  return (
    DESTINATIONS.find((d) => destinationSlug(d, locale) === slug) ||
    DESTINATIONS.find((d) => d.id === slug) ||
    null
  );
}

export function getDestination(id) {
  return DESTINATIONS.find((d) => d.id === id) || null;
}

export function destinationsInRegion(regionId) {
  return DESTINATIONS.filter((d) => d.region === regionId);
}

export function getRegion(id) {
  return REGIONS.find((r) => r.id === id) || null;
}

export function regionName(region, locale) {
  if (!region) return '';
  return region.names[locale] || region.names[DEFAULT_LOCALE] || region.id;
}

export function destinationsByTag(tag) {
  return DESTINATIONS.filter((d) => d.tags.includes(tag));
}

export const DESTINATION_COUNT = DESTINATIONS.length;

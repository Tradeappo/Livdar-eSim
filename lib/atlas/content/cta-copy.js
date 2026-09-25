// Call to action copy, in nine languages, one entry per kind of next step.
//
// The rule this file exists to enforce is that no two of the five hundred pages
// carry the same call to action unless they are asking the same question of the
// same place. There is no "Get started" here. Every label names the thing it
// leads to: the city, the country, the region, the activity or the tool, in the
// reader's language, taken from the target page's own model rather than written
// twice.
//
// So the label is the target page's own heading, and only the line under it is
// written here.
//
// That is a correction rather than a shortcut. The first version wrote a sentence
// per kind per language and interpolated the place name into it, and five of the
// nine languages need a case the nominative does not give: `Ce que coute la vie
// France`, `Quanto costa vivere Italia`, `Ile kosztuje zycie Polska`. Building a
// locative table for five languages and a hundred and sixty countries to write a
// label that the target page already carries, correctly inflected, in its own
// heading, would have been a second place for the same nine languages to drift
// apart. lib/atlas/atlas-links.js settled the same question the same way for
// anchor text, for the same reason.
//
// The note is what remains, and it is written per kind per language and never
// names a place, so it has no morphology to get wrong. It says what the reader
// gets rather than why they should want it.
//
// One kind keeps a written label. An eSIM destination page is not an Atlas page
// and its heading is not in this repository's page models, so the label is built
// from the country's subject form, which exists for every language precisely
// because it carries the article.
//
// The kinds are the honest ones. There is no `book`, because nothing here has
// inventory to book; there is no `apply`, because there are no jobs; there is no
// `buy`, because activation is not available yet and the eSIM pages say so
// themselves. `esim` leads to a page that checks availability, and the label
// says checks.

// A helper the packs share: most languages put the place name straight into the
// sentence, and the ones that need a preposition carry it in their own string.
export const CTA_COPY = {
  en: {
    tool: { note: () => 'Your own numbers, worked out on the page.' },
    cost: { note: () => 'The price level and the basket behind it.' },
    salary: { note: () => 'Median and average, from the national statistics office.' },
    season: { note: () => 'Month by month, from thirty years of normals.' },
    areas: { note: () => 'The districts, by distance from the centre.' },
    holidays: { note: () => 'Every date, and which of them fall on a weekend.' },
    region: { note: () => 'The days that region keeps and the rest of the country does not.' },
    rent: { note: () => 'The index, and how fast it is climbing.' },
    sport: { note: () => 'The months that suit it, and the ones that do not.' },
    esim: { label: ({ subject }) => 'Data plans for ' + subject, note: () => 'Coverage, networks and what a plan would cost.' },
    ranking: { note: () => 'The full list, in order.' },
    sibling: { note: () => 'Same data, same method, different place.' },
    deeper: { note: () => 'Next on Livdar.' },
  },
  de: {
    tool: { note: () => 'Eigene Zahlen, direkt auf der Seite gerechnet.' },
    cost: { note: () => 'Das Preisniveau und der Warenkorb dahinter.' },
    salary: { note: () => 'Median und Durchschnitt, vom Statistikamt.' },
    season: { note: () => 'Monat für Monat, aus dreißig Jahren Normalwerten.' },
    areas: { note: () => 'Die Stadtteile, nach Entfernung zum Zentrum.' },
    holidays: { note: () => 'Alle Termine, und welche aufs Wochenende fallen.' },
    region: { note: () => 'Die Tage, die dort gelten und im Rest des Landes nicht.' },
    rent: { note: () => 'Der Index, und wie schnell er steigt.' },
    sport: { note: () => 'Die Monate, die dazu passen, und die anderen.' },
    esim: { label: ({ subject }) => 'Datentarife für ' + subject, note: () => 'Netze, Abdeckung und was ein Tarif kostet.' },
    ranking: { note: () => 'Die ganze Liste, der Reihe nach.' },
    sibling: { note: () => 'Gleiche Daten, gleiche Methode, anderer Ort.' },
    deeper: { note: () => 'Weiter auf Livdar.' },
  },
  fr: {
    tool: { note: () => 'Vos propres chiffres, calculés sur la page.' },
    cost: { note: () => 'Le niveau des prix et le panier qui le compose.' },
    salary: { note: () => 'Médiane et moyenne, de l’institut national.' },
    season: { note: () => 'Mois par mois, sur trente ans de normales.' },
    areas: { note: () => 'Les quartiers, par distance du centre.' },
    holidays: { note: () => 'Toutes les dates, et celles qui tombent le week-end.' },
    region: { note: () => 'Les jours propres à cette région.' },
    rent: { note: () => 'L’indice, et à quelle vitesse il monte.' },
    sport: { note: () => 'Les mois qui conviennent, et les autres.' },
    esim: { label: ({ subject }) => 'Forfaits data pour ' + subject, note: () => 'Couverture, réseaux et prix d\u2019un forfait.' },
    ranking: { note: () => 'La liste complète, dans l’ordre.' },
    sibling: { note: () => 'Mêmes données, même méthode, autre endroit.' },
    deeper: { note: () => 'La suite sur Livdar.' },
  },
  es: {
    tool: { note: () => 'Tus propias cifras, calculadas en la página.' },
    cost: { note: () => 'El nivel de precios y la cesta que lo forma.' },
    salary: { note: () => 'Mediana y media, del instituto de estadística.' },
    season: { note: () => 'Mes a mes, con treinta años de normales.' },
    areas: { note: () => 'Los barrios, por distancia al centro.' },
    holidays: { note: () => 'Todas las fechas, y las que caen en fin de semana.' },
    region: { note: () => 'Los días propios de esa comunidad.' },
    rent: { note: () => 'El índice, y a qué velocidad crece.' },
    sport: { note: () => 'Los meses que van bien, y los que no.' },
    esim: { label: ({ subject }) => 'Planes de datos para ' + subject, note: () => 'Cobertura, redes y cuánto costaría un plan.' },
    ranking: { note: () => 'La lista completa, en orden.' },
    sibling: { note: () => 'Mismos datos, mismo método, otro lugar.' },
    deeper: { note: () => 'Sigue en Livdar.' },
  },
  it: {
    tool: { note: () => 'I tuoi numeri, calcolati nella pagina.' },
    cost: { note: () => 'Il livello dei prezzi e il paniere che lo compone.' },
    salary: { note: () => 'Mediana e media, dall’istituto di statistica.' },
    season: { note: () => 'Mese per mese, su trent’anni di normali.' },
    areas: { note: () => 'I quartieri, per distanza dal centro.' },
    holidays: { note: () => 'Tutte le date, e quelle che cadono nel fine settimana.' },
    region: { note: () => 'I giorni propri di quella regione.' },
    rent: { note: () => 'L’indice, e quanto velocemente sale.' },
    sport: { note: () => 'I mesi che vanno bene, e gli altri.' },
    esim: { label: ({ subject }) => 'Piani dati per ' + subject, note: () => 'Copertura, reti e quanto costerebbe un piano.' },
    ranking: { note: () => 'La lista completa, in ordine.' },
    sibling: { note: () => 'Stessi dati, stesso metodo, altro posto.' },
    deeper: { note: () => 'Continua su Livdar.' },
  },
  pt: {
    tool: { note: () => 'Os seus números, calculados na página.' },
    cost: { note: () => 'O nível de preços e o cabaz por trás dele.' },
    salary: { note: () => 'Mediana e média, do instituto de estatística.' },
    season: { note: () => 'Mês a mês, com trinta anos de normais.' },
    areas: { note: () => 'Os bairros, por distância ao centro.' },
    holidays: { note: () => 'Todas as datas, e as que caem no fim de semana.' },
    region: { note: () => 'Os dias próprios dessa região.' },
    rent: { note: () => 'O índice, e a que velocidade sobe.' },
    sport: { note: () => 'Os meses que servem, e os outros.' },
    esim: { label: ({ subject }) => 'Planos de dados para ' + subject, note: () => 'Cobertura, redes e quanto custaria um plano.' },
    ranking: { note: () => 'A lista completa, por ordem.' },
    sibling: { note: () => 'Mesmos dados, mesmo método, outro lugar.' },
    deeper: { note: () => 'Continuar no Livdar.' },
  },
  nl: {
    tool: { note: () => 'Je eigen cijfers, op de pagina uitgerekend.' },
    cost: { note: () => 'Het prijspeil en het mandje eronder.' },
    salary: { note: () => 'Mediaan en gemiddelde, van het statistiekbureau.' },
    season: { note: () => 'Maand per maand, uit dertig jaar normalen.' },
    areas: { note: () => 'De stadsdelen, op afstand van het centrum.' },
    holidays: { note: () => 'Alle data, en welke in het weekend vallen.' },
    region: { note: () => 'De dagen die daar gelden en elders niet.' },
    rent: { note: () => 'De index, en hoe snel hij stijgt.' },
    sport: { note: () => 'De maanden die passen, en de rest.' },
    esim: { label: ({ subject }) => 'Databundels voor ' + subject, note: () => 'Dekking, netwerken en wat een bundel kost.' },
    ranking: { note: () => 'De hele lijst, op volgorde.' },
    sibling: { note: () => 'Zelfde data, zelfde methode, andere plek.' },
    deeper: { note: () => 'Verder op Livdar.' },
  },
  pl: {
    tool: { note: () => 'Twoje własne liczby, przeliczone na stronie.' },
    cost: { note: () => 'Poziom cen i koszyk, który go tworzy.' },
    salary: { note: () => 'Mediana i średnia, z urzędu statystycznego.' },
    season: { note: () => 'Miesiąc po miesiącu, z trzydziestu lat normalnych.' },
    areas: { note: () => 'Dzielnice, według odległości od centrum.' },
    holidays: { note: () => 'Wszystkie daty i te, które wypadają w weekend.' },
    region: { note: () => 'Dni, które obowiązują tam, a w resztę kraju nie.' },
    rent: { note: () => 'Indeks i tempo, w jakim rośnie.' },
    sport: { note: () => 'Miesiące, które pasują, i te, które nie.' },
    esim: { label: ({ subject }) => 'Pakiety danych: ' + subject, note: () => 'Zasięg, sieci i ile kosztowałby pakiet.' },
    ranking: { note: () => 'Cała lista, po kolei.' },
    sibling: { note: () => 'Te same dane, ta sama metoda, inne miejsce.' },
    deeper: { note: () => 'Dalej na Livdar.' },
  },
  ja: {
    tool: { note: () => '自分の数字をページ上で計算します。' },
    cost: { note: () => '物価水準と、その内訳。' },
    salary: { note: () => '中央値と平均、統計局の数字から。' },
    season: { note: () => '三十年の平年値から、月ごとに。' },
    areas: { note: () => '中心からの距離順に見た地区。' },
    holidays: { note: () => 'すべての日付と、週末に重なる日。' },
    region: { note: () => 'その地域だけの休日。' },
    rent: { note: () => '指数と、その上がり方。' },
    sport: { note: () => '向いている月と、そうでない月。' },
    esim: { label: ({ subject }) => subject + 'のデータ通信', note: () => '対応網、カバー範囲、料金の目安。' },
    ranking: { note: () => '順位の全リスト。' },
    sibling: { note: () => '同じデータ、同じ方法、別の場所。' },
    deeper: { note: () => 'Livdar の続き。' },
  },
};

export const CTA_KINDS = Object.keys(CTA_COPY.en);
export const ctaLanguages = () => Object.keys(CTA_COPY);

export function ctaCopy(kind, language) {
  const pack = CTA_COPY[language] || CTA_COPY.en;
  return pack[kind] || pack.deeper;
}

// Every kind in every language, checked in one pass, so adding a kind fails a
// test rather than printing an English note onto eight other languages.
export function missingCtaCopy(languages = ctaLanguages()) {
  const gaps = [];
  for (const l of languages) {
    const pack = CTA_COPY[l];
    if (!pack) { gaps.push('no pack for ' + l); continue; }
    for (const k of CTA_KINDS) {
      if (!pack[k]) { gaps.push(k + ' missing in ' + l); continue; }
      if (typeof pack[k].note !== 'function') gaps.push(k + ' has no note in ' + l);
    }
    if (typeof pack.esim.label !== 'function') gaps.push('esim has no label in ' + l);
  }
  return gaps;
}

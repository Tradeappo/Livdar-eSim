// Country hubs: /en/atlas/japan/, /fr/atlas/japon/ ... one page per country and language that
// has at least MIN_CITIES published city weather pages.
//
// WHY. The crawl directory (/en/atlas/) linked every published page in its language from one
// page: 1,368 links on the English one, 1,251 of them city weather pages. A page that size
// passes very little to each link, and a crawler working through it has no reason to prefer
// one of 1,251 near-identical anchors over another. A hub groups a country's cities on a page
// of its own, the directory links the hubs, and every city stays two links from the footer.
//
// WHAT IS ON A HUB, and why it is not a doorway. The hub is a comparison a reader can use:
// for every city of the country, its warmest, coldest and wettest month, which is the question
// someone choosing between Spanish cities for a March trip is asking. Every value in that table
// is copied from the `facts` of the city's own published page, in that page's language, with
// that page's own labels as the column heads, so the hub states nothing the pages do not and a
// number can never disagree between the two. Then the country's other published pages (best
// time to visit, cost of living, salaries, holidays). A country below MIN_CITIES gets no hub:
// a table of two cities is not a comparison, and its pages stay linked from the directory.
//
// Nothing here creates inventory. A hub lists published pages only and is derived from them.
import { pages, languagesServed } from './serve-pages.js';
import { countryName, countrySlug } from './atlas-urls.js';

export const MIN_CITIES = 5;
const CITY = 'weather.city-month';

// The words of the hub, per language. Everything numeric on the page comes from the city pages.
// No count is written into a sentence, so no language needs plural rules here.
export const TEXT = {
  en: { title: '{c}: weather by city and travel data', h1: '{c}: weather by city', description: '{c} city by city: the warmest, coldest and wettest month of each, from the {y} normals, with a link to all twelve months.', intro: 'For every city, the table gives the warmest, coldest and wettest month from the {y} climate normals, as on the city\'s own page. Each city has a page with all twelve months.', city: 'City', cities: 'Cities', other: '{c}: other pages', directory: 'Weather by country' },
  de: { title: '{c}: Wetter nach Stadt und Reisedaten', h1: '{c}: Wetter nach Stadt', description: '{c} Stadt für Stadt: der wärmste, kälteste und nasseste Monat jeder Stadt nach den Klimamitteln {y}, mit Link zu allen zwölf Monaten.', intro: 'Die Tabelle zeigt für jede Stadt den wärmsten, kältesten und nassesten Monat nach den Klimamitteln {y}, wie auf ihrer eigenen Seite. Jede Stadt hat eine Seite mit allen zwölf Monaten.', city: 'Stadt', cities: 'Städte', other: '{c}: weitere Seiten', directory: 'Wetter nach Land' },
  es: { title: '{c}: el clima por ciudades y datos de viaje', h1: '{c}: el clima por ciudades', description: '{c} ciudad por ciudad: el mes más cálido, el más frío y el más lluvioso de cada una según las normales {y}, con enlace a los doce meses.', intro: 'La tabla muestra, para cada ciudad, el mes más cálido, el más frío y el más lluvioso según las normales climáticas {y}, tal como figuran en su propia página. Cada ciudad tiene una página con los doce meses.', city: 'Ciudad', cities: 'Ciudades', other: '{c}: otras páginas', directory: 'El clima por países' },
  fr: { title: '{c} : météo par ville et données pratiques', h1: '{c} : météo par ville', description: '{c} ville par ville : le mois le plus chaud, le plus froid et le plus pluvieux de chacune selon les normales {y}, avec un lien vers les douze mois.', intro: 'Le tableau donne, pour chaque ville, le mois le plus chaud, le plus froid et le plus pluvieux selon les normales climatiques {y}, comme sur sa propre page. Chaque ville a une page avec les douze mois.', city: 'Ville', cities: 'Villes', other: '{c} : autres pages', directory: 'Météo par pays' },
  it: { title: '{c}: il clima città per città e dati di viaggio', h1: '{c}: il clima città per città', description: '{c} città per città: il mese più caldo, il più freddo e il più piovoso di ognuna secondo le normali {y}, con il link ai dodici mesi.', intro: 'La tabella indica per ogni città il mese più caldo, il più freddo e il più piovoso secondo le normali climatiche {y}, come sulla sua pagina. Ogni città ha una pagina con tutti i dodici mesi.', city: 'Città', cities: 'Città', other: '{c}: altre pagine', directory: 'Il clima per paese' },
  ja: { title: '{c}の都市別の気候と旅行データ', h1: '{c}の都市別の気候', description: '{c}の各都市の最も暖かい月、最も寒い月、最も降水が多い月を{y}年の平年値で比べ、各都市の12か月のページにリンクします。', intro: '表は各都市の最も暖かい月、最も寒い月、最も降水が多い月を、それぞれのページと同じ{y}年の平年値で示します。各都市のページには12か月すべての値があります。', city: '都市', cities: '都市', other: '{c}のその他のページ', directory: '国別の気候' },
  nl: { title: '{c}: het weer per stad en reisgegevens', h1: '{c}: het weer per stad', description: '{c} per stad: de warmste, koudste en natste maand van elke stad volgens de normalen {y}, met een link naar alle twaalf maanden.', intro: 'De tabel geeft per stad de warmste, koudste en natste maand volgens de klimaatnormalen {y}, zoals op de eigen pagina van die stad. Elke stad heeft een pagina met alle twaalf maanden.', city: 'Stad', cities: 'Steden', other: '{c}: andere pagina\'s', directory: 'Het weer per land' },
  pl: { title: '{c}: klimat w miastach i dane praktyczne', h1: '{c}: klimat w miastach', description: '{c} miasto po mieście: najcieplejszy, najchłodniejszy i najbardziej deszczowy miesiąc każdego z nich według norm {y}, z linkiem do wszystkich miesięcy.', intro: 'Tabela podaje dla każdego miasta najcieplejszy, najchłodniejszy i najbardziej deszczowy miesiąc według norm klimatycznych {y}, tak jak na jego własnej stronie. Każde miasto ma stronę ze wszystkimi dwunastoma miesiącami.', city: 'Miasto', cities: 'Miasta', other: '{c}: inne strony', directory: 'Klimat według krajów' },
  pt: { title: '{c}: o clima por cidade e dados de viagem', h1: '{c}: o clima por cidade', description: '{c} cidade a cidade: o mês mais quente, o mais frio e o mais chuvoso de cada uma segundo as normais {y}, com link para os doze meses.', intro: 'A tabela mostra, para cada cidade, o mês mais quente, o mais frio e o mais chuvoso segundo as normais climáticas {y}, como na sua própria página. Cada cidade tem uma página com os doze meses.', city: 'Cidade', cities: 'Cidades', other: '{c}: outras páginas', directory: 'O clima por país' },
};

const fill = (s, c, y) => s.split('{c}').join(c).split('{y}').join(y || '');
export const hubPath = (lang, slug) => '/' + lang + '/atlas/' + slug + '/';
const countryOf = (p) => String(p.iso2 || (/^[A-Z]{2}$/i.test(String(p.entity)) ? p.entity : '') || '').toUpperCase();

let cache = null;
/** Every hub, keyed by language, then by iso2: { iso2, slug, path, name, cities, others }. */
export function allHubs() {
  if (cache) return cache;
  const out = {};
  for (const lang of languagesServed()) {
    if (!TEXT[lang]) continue;
    const mine = pages().filter((p) => p.locale === lang);
    const byCountry = new Map();
    for (const p of mine) {
      const iso = countryOf(p);
      if (!iso) continue;
      if (!byCountry.has(iso)) byCountry.set(iso, { cities: [], others: [] });
      byCountry.get(iso)[p.family === CITY ? 'cities' : 'others'].push(p);
    }
    out[lang] = {};
    const slugs = new Set();
    for (const [iso, g] of [...byCountry].sort((a, b) => a[0].localeCompare(b[0]))) {
      if (g.cities.length < MIN_CITIES) continue;
      const name = countryName(iso, lang);
      const { slug } = countrySlug(iso, lang);
      // Two countries folding to one slug would put one hub over the other; refuse rather than
      // pick one, the same rule as the cohort builder's path collisions.
      if (!name || !slug || slugs.has(slug)) throw new Error('country hub: no unique slug for ' + iso + ' in ' + lang);
      slugs.add(slug);
      out[lang][iso] = {
        iso2: iso, slug, name, path: hubPath(lang, slug),
        cities: g.cities.sort((a, b) => a.entityName.localeCompare(b.entityName, lang)),
        others: g.others.sort((a, b) => a.h1.localeCompare(b.h1, lang)),
      };
    }
  }
  cache = out;
  return out;
}

export const hubsFor = (lang) => Object.values(allHubs()[lang] || {});
export const hubBySlug = (lang, slug) => hubsFor(lang).find((h) => h.slug === slug) || null;

/** The paths of the same country's hub in every language that has one, for hreflang. */
export function hubAlternates(iso2) {
  const out = {};
  for (const [lang, byIso] of Object.entries(allHubs())) if (byIso[iso2]) out[lang] = byIso[iso2].path;
  return out;
}

/** What the hub page renders. Every table cell but the first is a fact of the city's own page. */
export function hubModel(lang, hub) {
  const t = TEXT[lang];
  const first = hub.cities[0];
  const years = first.facts[3]?.value || '';
  return {
    title: fill(t.title, hub.name, years),
    h1: fill(t.h1, hub.name, years),
    description: fill(t.description, hub.name, years),
    intro: fill(t.intro, hub.name, years),
    citiesHeading: t.cities,
    otherHeading: fill(t.other, hub.name, years),
    head: [t.city, ...first.facts.slice(0, 3).map((f) => f.label)],
    rows: hub.cities.map((p) => ({ href: p.path, cells: [p.entityName, ...p.facts.slice(0, 3).map((f) => f.value)] })),
    others: hub.others.map((p) => ({ href: p.path, text: p.h1 })),
  };
}

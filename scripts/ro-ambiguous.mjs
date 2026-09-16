// The Romanian words a lookup table cannot resolve.
//
// Fifteen forms in this corpus mean different things with and without a
// diacritic, and which one is correct depends on the article, the preposition
// or the case. "pe factura" is "on the bill" only when the bill has already
// been mentioned; otherwise it is "pe factură". "o regulă" is indefinite,
// "regula asta" is definite. "analiza" is a verb and "analiză" is a noun, and
// both appear in the cookie policy within two sentences of each other.
//
// So these are not in the word tables. Every occurrence below was read in
// context and decided on its own, and the decision is keyed to the words either
// side of it, so if the surrounding text changes the key stops matching and the
// script reports it rather than silently applying a stale decision. That is the
// point: a wrong diacritic here is not a typo, it is a different word.

import { readFileSync, writeFileSync } from 'node:fs';

const FILES = [
  '../lib/content/ro/compatibility.js',
  '../lib/content/ro/destinations.js',
  '../lib/content/ro/guides.js',
  '../lib/content/ro/legal.js',
  '../lib/content/ro/regions.js',
];

// Words that are always the subjunctive particle in this corpus. Checked
// against all 109 occurrences: there is no possessive "sa" anywhere in the
// Romanian content, every one is "să" before a verb.
const ALWAYS = { sa: 'să', Sa: 'Să' };

// Words that never take a diacritic here. "va" is the future auxiliary in all
// twenty occurrences ("va fi", "va trebui"), never the pronoun "vă". Listed so
// the intent is on the record rather than implied by absence.
const NEVER = new Set(['va', 'Va', 'a', 'Ca', 'Noua', 'Zona', 'Harta', 'Piata', 'Factura', 'Coasta', 'Banca', 'Alta', 'Regula', 'Lista', 'Pagina', 'Vizita', 'Analiza']);

// "ca" defaults to "că" (the conjunction "that", and "pentru că" = because).
// The exceptions are the comparative "ca" ("arată ca o cutie"), the role marker
// ("ca destinație", "ca furnizor"), and the purpose construction
// ("cere ca ... să", "necesar ca ... să"). Keyed on the neighbouring words.
const CA_STAYS = new Set([
  'înainte|managerul', 'arată|o', 'nimeni|și', 'telefoane|reper', 'Turcia|destinație',
  'Nu|în', 'conectează|vizitator', 'ștergerea|definitivă', 'tău|de', 'taxează|extra',
  'înregistrată|societate', 'înregistrat|eveniment', 'Google|furnizor', 'sine|orice',
  'banner|site', 'facturează|trei', 'acoperirea|pe', 'nu|pe', 'broșura|o',
  'subțire|peste', 'vândut|fiind', 'izolate|fiind', 'cere|numerele', 'ajunge|sa',
  'acasa|sa', 'necesar|site', 'Si|peste', 'acasa|peste',
  // The same four keys again, with the neighbouring "sa" in its corrected form.
  // Without these the script is not safe to run twice: the first pass turns
  // "sa" into "să", which would stop the key matching on a second pass and
  // silently flip a correct "ca" into "că".
  'ajunge|să', 'acasa|să', 'acasă|să', 'acasă|peste',
]);

// Everything else, decided one occurrence at a time. Key is "previous|next".
// Where one reading dominates, the default is recorded and only the exceptions
// are listed. "bancă" and "vizită" are indefinite in every single occurrence;
// "zona" is definite in sixteen of seventeen. Listing seventeen identical
// decisions would hide the one that differs.
const DEFAULTS = {
  banca: 'bancă', vizita: 'vizită', analiza: 'analiză', noua: 'nouă',
  zona: 'zona', lista: 'lista', pagina: 'pagina',
  // Second round. "data" is "dată" in all eight occurrences (o dată, nicio
  // dată, de fiecare dată), never the calendar date. "ora" and "luna" are
  // likewise always the indefinite noun here, and "singura" is always the
  // adjective "o singură".
  data: 'dată', luna: 'lună', singura: 'singură', ora: 'oră',
  taxa: 'taxa', socoteala: 'socoteala', limita: 'limita', adresa: 'adresa',
  viteza: 'viteză', varianta: 'varianta', problema: 'problemă', marca: 'marcă',
};

const DECIDED = {
  harta: {
    'de|mesagerie': 'hartă', 'descarcă|înainte': 'harta', 'e|camera': 'harta',
    'avea|și': 'hartă', 'Descarcă|înainte': 'harta', 'pe|Este': 'hartă',
    'ai|mesajele': 'harta', 'Pe|arată': 'hartă', 'Descarcă|salvează': 'harta',
    'dintre|de': 'harta',
  },
  factura: {
    'previne|neplăcută': 'factura', 'pe|La': 'factură', 'fără|mare': 'factură',
    'pe|următoare': 'factura', 'produce|surpriza': 'factura', 'pe|rețelele': 'factură',
    'ține|rămâne': 'factura', 'pe|Continentul': 'factură', 'Pe|sunt': 'factură',
    'strică|Si': 'factura', 'prima|Cum': 'factură', 'Doar|de': 'factura',
  },
  coasta: {
    'aceeasi|sau': 'coastă', 'toată|egeeană': 'coasta', 'pe|eSIM': 'coastă',
    'Pe|Mării': 'coasta', 'de|Când': 'coastă', 'toată|de': 'coasta',
    'pe|și': 'coastă', 'pe|braziliană': 'coasta', 'Capitalele|Pacificului': 'coasta',
    'urmează|și': 'coasta',
  },
  // Always indefinite here: every occurrence is "de la (o) bancă".
  banca: {
    'la|Familii': 'bancă', 'o|turcească': 'bancă', 'la|pe': 'bancă',
    'o|britanică': 'bancă', 'o|sau': 'bancă', 'la|Doar': 'bancă', 'la|vin': 'bancă',
  },
  alta: {
    'din|țară': 'altă', 'sunt|poveste': 'altă', 'este|Unele': 'alta',
    'în|parte': 'altă', 'și|socoteala': 'altă', 'în|țară': 'altă',
    'și|Da': 'alta', 'de|și': 'alta', 'și|relație': 'altă', 'la|rețea': 'altă',
    'insula|rețea': 'altă', 'de|intro': 'alta', 'pe|sau': 'alta', 'și|Pentru': 'alta',
  },
  piata: {
    'de|pe': 'piață', 'pe|A': 'piață', 'din|unica': 'piața', 'singura|mobilă': 'piață',
    'pe|românească': 'piața', 'unde|preplatita': 'piața', 'Ca|Brazilia': 'piață',
    'o|aparte': 'piață', 'singura|de': 'piață',
  },
  regula: {
    'o|a': 'regulă', 'Peste|asta': 'regula', 'o|de': 'regulă', 'unde|se': 'regula',
    'o|proprie': 'regulă', 'o|ca': 'regulă', 'este|nu': 'regula', 'fără|comună': 'regulă',
    'o|comună': 'regulă', 'cu|europeană': 'regula',
  },
  lista: {
    'o|care': 'listă', 'Orice|de': 'listă', 'o|despre': 'listă', 'orice|Ce': 'listă',
    'din|de': 'lista', 'Deschide|de': 'lista', 'Verifică|de': 'lista',
    'în|de': 'lista', 'analiza|viitor': 'lista', 'toată|de': 'lista',
    'și|de': 'lista', 'Citește|de': 'lista', 'toată|Restul': 'lista',
  },
  pagina: {
    'pe|de': 'pagina', 'orice|care': 'pagină', 'face|asta': 'pagina', 'ca|asta': 'pagina',
    'este|de': 'pagina', 'deschizi|de': 'pagina', 'în|înainte': 'pagină',
    'fiecare|Statistica': 'pagină', 'o|nu': 'pagină', 'și|Cum': 'pagina',
    'ul|va': 'pagina', 'pe|țării': 'pagina', 'are|proprie': 'pagina',
    'face|țării': 'pagina', 'pe|Cele': 'pagină',
  },
  // Always indefinite here.
  vizita: {
    'sau|la': 'vizită', 'o|în': 'vizită', 'urmatoarea|Vindeți': 'vizită',
    'o|de': 'vizită', 'fiecare|Câte': 'vizită', 'de|Planifică': 'vizită',
  },
  analiza: {
    'pot|tiparul': 'analiza', 'date|lista': 'analiză', 'pentru|stocarea': 'analiză',
    'pentru|este': 'analiză', 'de|Microsoft': 'analiză', 'pentru|este ': 'analiză',
    'de|dacă': 'analiză', 'de|din': 'analiză', 'de|Valorile': 'analiză',
    'pentru|pe': 'analiză', 'de|iar': 'analiză',
  },
  noua: {
    'cumpărare|southeast': 'nouă', 'cumpărare|sau': 'nouă',
    'Australia|Zeelandă': 'Noua', 'operator|Zeelandă': 'Noua',
  },
  zona: {
    'o|sunt': 'zonă',
  },
  // A daily charge is "o taxă" when introduced and "taxa zilnică" once named.
  taxa: {
    'o|pe': 'taxă', 'o|zilnică': 'taxă',
    'înmulțește|zilnică': 'taxa', 'sau|suplimentar': 'taxa',
    'înmulțește|cu': 'taxa', 'introdus|zilnică': 'taxa',
  },
  socoteala: { 'altă|Peste': 'socoteală' },
  limita: {
    'la|Regula': 'limită', 'la|Când': 'limită', 'la|Pentru': 'limită',
    'depășit|de': 'limita', 'poate|sau': 'limita', 'pot|serviciul': 'limita',
  },
  adresa: {
    'cere|de': 'adresa', 'o|de': 'adresă', 'din|IP': 'adresa', 'cu|Sfatul': 'adresa',
  },
  viteza: { 'de|ci': 'viteză', 'Pentru|în': 'viteză', 'despre|O': 'viteză' },
  varianta: {
    'este|Pentru': 'varianta', 'este|simplă': 'varianta', 'este|Wifi': 'varianta',
    'ce|ai': 'variantă',
  },
  problema: {
    'produs|Modificări': 'problema', 'iar|este': 'problema', 'simți|asta': 'problema',
  },
  marca: { 'aceeași|Merită': 'marcă', 'aceeasi|Merită': 'marcă' },
};

// Occurrences that sit at the end of a sentence inside a string literal, so the
// "next" word is the end of that literal rather than another word.
const AT_LITERAL_EDGE = {
  lista: { 'orice|$': 'listă', '^|$': 'lista' },
  piata: { 'pe|$': 'piață' },
  coasta: { 'pe|$': 'coastă', 'de|$': 'coastă' },
  pagina: { 'că|asta': 'pagina', 'fiecare|$': 'pagină', 'și|$': 'pagina' },
  alta: { 'și|$': 'alta', 'de|$': 'alta' },
  factura: { 'pe|$': 'factură', 'strică|$': 'factura', 'prima|$': 'factură' },
  noua: { '^|Zeelandă': 'Noua' },
};

function rewriteStrings(source, fn) {
  return source.replace(/'(?:[^'\\]|\\.)*'/g, (lit) => "'" + fn(lit.slice(1, -1)) + "'");
}

if (import.meta.url === 'file://' + process.argv[1]) {
  let applied = 0;
  let kept = 0;
  const unmatched = [];

  FILES.forEach((rel) => {
    const url = new URL(rel, import.meta.url);
    const before = readFileSync(url, 'utf8');

    const after = rewriteStrings(before, (text) => {
      const parts = text.split(/(\P{L}+)/u);
      // Word positions only, so "previous" and "next" mean previous and next
      // word rather than previous and next character run.
      const wordIdx = [];
      parts.forEach((p, i) => { if (/^\p{L}+$/u.test(p)) wordIdx.push(i); });

      wordIdx.forEach((pi, k) => {
        const w = parts[pi];
        const prev = k > 0 ? parts[wordIdx[k - 1]] : '^';
        const next = k < wordIdx.length - 1 ? parts[wordIdx[k + 1]] : '$';
        const key = prev + '|' + next;

        if (ALWAYS[w]) { parts[pi] = ALWAYS[w]; applied += 1; return; }
        if (w === 'ca') {
          if (CA_STAYS.has(key)) { kept += 1; return; }
          parts[pi] = 'că'; applied += 1; return;
        }
        if (NEVER.has(w)) { kept += 1; return; }
        const table = DECIDED[w];
        const edge = AT_LITERAL_EDGE[w];
        if (!table && !edge && DEFAULTS[w] === undefined) return;
        let to = (table && table[key]) !== undefined ? table[key] : (edge && edge[key]);
        if (to === undefined) to = DEFAULTS[w];
        if (to === undefined) { unmatched.push(rel.split('/').pop() + ': ' + prev + ' [' + w + '] ' + next); return; }
        if (to === w) { kept += 1; return; }
        parts[pi] = to; applied += 1;
      });

      return parts.join('');
    });

    if (after !== before) writeFileSync(url, after);
  });

  console.log('Romanian context dependent forms');
  console.log('');
  console.log('  ' + applied + ' occurrences changed, ' + kept + ' deliberately left as they were');
  if (unmatched.length) {
    console.log('');
    console.log('  ' + unmatched.length + ' occurrence(s) whose context does not match any recorded decision:');
    unmatched.forEach((u) => console.log('    ' + u));
    console.log('');
    console.log('  Each needs reading and a decision adding to DECIDED. Nothing was guessed.');
    process.exit(1);
  }
  console.log('');
  console.log('  Every occurrence matched a decision made by reading it in context.');
}

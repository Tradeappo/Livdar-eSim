// One time repair: restore German umlauts and eszett in the content files that
// were written without them.
//
// WHY THIS EXISTS. The German destination, guide and home content was written
// with correct orthography. The region, legal, compatibility and interface
// files that came later were not: they carry "fuer" for "für", "Laender" for
// "Länder", "ausserhalb" for "außerhalb" and about two hundred more. To a
// German reader that is not a typo, it is a site that looks broken, and German
// is the second largest market in the research at 340,080 searches a month.
//
// WHY IT IS A TABLE AND NOT A FIND AND REPLACE. The obvious fix, rewriting
// every "ue" as "ü", destroys correct German. "Quellen", "neue", "teuer",
// "Dauer", "aktuelle", "genaue", "Bequemlichkeit" and "nachzuschauen" all
// contain the letters u and e side by side and all of them are spelled
// correctly already. The same trap exists for "ss": "Adresse", "Kommission",
// "Anschlussflug" and "muss" must not become eszett. So every replacement here
// is an explicit word, checked one at a time, and any word not in the table is
// left exactly as it was.
//
// The script is idempotent: the corrected spellings do not match the patterns,
// so running it twice changes nothing the second time.

import { readFileSync, writeFileSync } from 'node:fs';

// Word by word. Left side is what is in the files, right side is German.
export const MAP = {
  // a umlaut
  Abwaegung: 'Abwägung', Auffaellig: 'Auffällig', Balkanlaender: 'Balkanländer',
  Bestaetigungen: 'Bestätigungen', Buchungsbestaetigungen: 'Buchungsbestätigungen',
  Datenhaendler: 'Datenhändler', Datenschutzerklaerung: 'Datenschutzerklärung',
  Einschraenkung: 'Einschränkung', Einschraenkungen: 'Einschränkungen',
  Erklaerung: 'Erklärung', Europaeischen: 'Europäischen', Faehren: 'Fähren',
  Faellen: 'Fällen', Faellt: 'Fällt', Geraet: 'Gerät', Geraete: 'Geräte',
  Geraetefamilien: 'Gerätefamilien', Geraetefrage: 'Gerätefrage',
  Geraetelisten: 'Gerätelisten', Geraeteregistrierung: 'Geräteregistrierung',
  Haefen: 'Häfen', Haeufig: 'Häufig', Haeufige: 'Häufige',
  Hauptstaedte: 'Hauptstädte', Hotelbestaetigungen: 'Hotelbestätigungen',
  Kaeufe: 'Käufe', Klaeren: 'Klären', Kompatibilitaet: 'Kompatibilität',
  Kompatibilitaetsliste: 'Kompatibilitätsliste', Kompatibilitaetsseite: 'Kompatibilitätsseite',
  Kreuzfahrtgaeste: 'Kreuzfahrtgäste', Laender: 'Länder',
  Laenderentscheidung: 'Länderentscheidung', Laenderliste: 'Länderliste',
  Laendern: 'Ländern', Leihgeraete: 'Leihgeräte', Maerkte: 'Märkte',
  Mehrlaenderroute: 'Mehrländerroute', Mobilfunkmaerkte: 'Mobilfunkmärkte',
  Naehe: 'Nähe', Netzschaeden: 'Netzschäden', Oberflaeche: 'Oberfläche',
  Praeferenz: 'Präferenz', Rumaenien: 'Rumänien', Staedte: 'Städte',
  Staedten: 'Städten', Telekommaerkte: 'Telekommärkte', Umstaenden: 'Umständen',
  Verspaetungen: 'Verspätungen', Vertraege: 'Verträge',
  Vertragsgeraeten: 'Vertragsgeräten', Zaehlen: 'Zählen', Zaehlt: 'Zählt',
  Zusaetzlich: 'Zusätzlich',
  aelteren: 'älteren', aendern: 'ändern', aendert: 'ändert', aenderungen: 'änderungen',
  aergerlich: 'ärgerlich', beeintraechtigt: 'beeinträchtigt',
  beschraenken: 'beschränken', bestaetigen: 'bestätigen', bestaetigt: 'bestätigt',
  eingeschraenkt: 'eingeschränkt', empfaenger: 'empfänger', empfaengt: 'empfängt',
  enthaelt: 'enthält', entspraeche: 'entspräche', enttaeuschen: 'enttäuschen',
  enttaeuscht: 'enttäuscht', erfaehrst: 'erfährst', erklaert: 'erklärt',
  europaeisch: 'europäisch', europaeische: 'europäische', europaeischen: 'europäischen',
  faehrt: 'fährt', faellt: 'fällt', funktionsfaehig: 'funktionsfähig',
  geraete: 'geräte', haengt: 'hängt', haeufig: 'häufig', haeufiger: 'häufiger',
  haeufigste: 'häufigste', inlaendische: 'inländische', klaeren: 'klären',
  laedt: 'lädt', laendliche: 'ländliche', laendlichen: 'ländlichen',
  laenger: 'länger', laengere: 'längere', laesst: 'lässt', laeuft: 'läuft',
  leistungsfaehige: 'leistungsfähige', naechsten: 'nächsten', realitaet: 'realität',
  schlaegt: 'schlägt', schraenken: 'schränken', selbstverstaendlich: 'selbstverständlich',
  spaeter: 'später', staedtische: 'städtische', taeuscht: 'täuscht',
  tatsaechlich: 'tatsächlich', thailaendische: 'thailändische',
  unabhaengig: 'unabhängig', unterschaetzen: 'unterschätzen', unveraendert: 'unverändert',
  verhaelt: 'verhält', verlaesslich: 'verlässlich', verlaesslichste: 'verlässlichste',
  verlaesst: 'verlässt', vollstaendig: 'vollständig', vollstaendige: 'vollständige',
  waehlen: 'wählen', waehrend: 'während', waere: 'wäre', zaehlen: 'zählen',
  zaehlt: 'zählt', zunaechst: 'zunächst',

  // o umlaut
  Bevoelkerung: 'Bevölkerung', Datenschutzbehoerde: 'Datenschutzbehörde',
  Funkloecher: 'Funklöcher', Funkloechern: 'Funklöchern', Loeschen: 'Löschen',
  Loeschung: 'Löschung', Noerdlich: 'Nördlich', aufhoert: 'aufhört',
  benoetigt: 'benötigt', dazugehoeren: 'dazugehören', gehoeren: 'gehören',
  gehoert: 'gehört', gehoerte: 'gehörte', gewoehnliche: 'gewöhnliche',
  gewoehnlichen: 'gewöhnlichen', gewoehnliches: 'gewöhnliches', hoert: 'hört',
  koennen: 'können', koennte: 'könnte', loeschen: 'löschen', loesen: 'lösen',
  moeglich: 'möglich', moeglicherweise: 'möglicherweise', noetigen: 'nötigen',
  oeffnen: 'öffnen', oeffnet: 'öffnet', oestlichen: 'östlichen',
  oestliches: 'östliches', voellig: 'völlig', zweiwoechige: 'zweiwöchige',

  // u umlaut
  Darueber: 'Darüber', Datenuebertragbarkeit: 'Datenübertragbarkeit',
  Duenner: 'Dünner', Fluege: 'Flüge', Fuehrt: 'Führt', Fuenfmal: 'Fünfmal',
  Fuer: 'Für', Gebuehr: 'Gebühr', Hurrikanguertel: 'Hurrikangürtel',
  Inlandsfluege: 'Inlandsflüge', Inselhuepfen: 'Inselhüpfen', Kueste: 'Küste',
  Kuesten: 'Küsten', Kuestenorte: 'Küstenorte', Luecken: 'Lücken',
  Muenchen: 'München', Pazifikkueste: 'Pazifikküste', Pruefen: 'Prüfen',
  Pruefung: 'Prüfung', Rueckfahrt: 'Rückfahrt', Spruenge: 'Sprünge',
  Stuermen: 'Stürmen', Suedafrika: 'Südafrika', Suedamerika: 'Südamerika',
  Suedamerikanische: 'Südamerikanische', Suedamerikareisen: 'Südamerikareisen',
  Suedamerikas: 'Südamerikas', Suedkorea: 'Südkorea', Suedliches: 'Südliches',
  Suedostasien: 'Südostasien', Tuerkei: 'Türkei', Unterstuetzt: 'Unterstützt',
  Unterstuetzung: 'Unterstützung', Verfuegbare: 'Verfügbare',
  Verfuegbarkeit: 'Verfügbarkeit', Wueste: 'Wüste', Wuesten: 'Wüsten',
  Wuestengebieten: 'Wüstengebieten', Wuestenstrecken: 'Wüstenstrecken',
  Zurueck: 'Zurück', Zurueckfallen: 'Zurückfallen',
  ausdruecklichen: 'ausdrücklichen', ausfuehrlicher: 'ausführlicher',
  beduerfen: 'bedürfen', beruehren: 'berühren', beruehrt: 'berührt',
  dafuer: 'dafür', darueber: 'darüber', duenn: 'dünn', duenner: 'dünner',
  duennsten: 'dünnsten', duerfen: 'dürfen', durchfuehren: 'durchführen',
  fruehen: 'frühen', fuehrt: 'führt', fuellen: 'füllen', fuenf: 'fünf',
  fuer: 'für', genuegt: 'genügt', gueltiges: 'gültiges', guenstig: 'günstig',
  guenstigen: 'günstigen', guenstiger: 'günstiger', hinzuzufuegen: 'hinzuzufügen',
  huepfen: 'hüpfen', luecken: 'lücken', muessen: 'müssen', nuetzlich: 'nützlich',
  nuetzlichste: 'nützlichste', pruefen: 'prüfen', prueft: 'prüft',
  schuetzen: 'schützen', stuetzen: 'stützen', sueden: 'süden',
  suedamerikanischen: 'südamerikanischen',
  // Already wrong before the umlaut was dropped, so it is corrected rather than
  // merely restored.
  sueldlichen: 'südlichen',
  ueber: 'über', ueberall: 'überall', uebereinstimmen: 'übereinstimmen',
  ueberhaupt: 'überhaupt', uebermittelt: 'übermittelt', uebernimmt: 'übernimmt',
  ueberquert: 'überquert', ueberwiegend: 'überwiegend', ueblich: 'üblich',
  uebliche: 'übliche', unterstuetzen: 'unterstützen', unterstuetzt: 'unterstützt',
  verfuegbar: 'verfügbar', weiterfuehrt: 'weiterführt', zurueckfallen: 'zurückfallen',

  // eszett. Every one of these is a word where German writes eszett rather than
  // a double s. Words like Adresse, Kommission, muss and Anschlussflug are
  // correct with ss and are deliberately absent from this table.
  Ausserhalb: 'Außerhalb', Fernstrassen: 'Fernstraßen',
  Grossbritannien: 'Großbritannien', Grosse: 'Große', Hauptstrassen: 'Hauptstraßen',
  Strasse: 'Straße', Verstosses: 'Verstoßes', abreisst: 'abreißt',
  ausschliesslich: 'ausschließlich', ausser: 'außer', ausserdem: 'außerdem',
  ausserhalb: 'außerhalb', gleichermassen: 'gleichermaßen', gross: 'groß',
  grosse: 'große', grossen: 'großen', grosser: 'großer',
  heisst: 'heißt', mutmasslichen: 'mutmaßlichen', schliessen: 'schließen',
  schliesst: 'schließt', weiss: 'weiß',

  // Both at once.
  Kuestenstaedte: 'Küstenstädte', Kuestenstrasse: 'Küstenstraße',
  Planungsgroesse: 'Planungsgröße', Rechtmaessigkeit: 'Rechtmäßigkeit',
  grosszuegiges: 'großzügiges', groessere: 'größere', groesseren: 'größeren',
  groesste: 'größte', groessten: 'größten',

  // Second pass. Compounds whose stem was in the table but which the word
  // boundary correctly refused to touch, because "Haefen" inside "Flughaefen"
  // is not a word on its own. Each one had to be listed in full.
  Bergstrassen: 'Bergstraßen', Flughaefen: 'Flughäfen',
  Kreuzfahrthaefen: 'Kreuzfahrthäfen', Hauptstrasse: 'Hauptstraße',
  Klippenstrassen: 'Klippenstraßen', Strassentunnel: 'Straßentunnel',
  Kostenluecke: 'Kostenlücke', Netzqualitaet: 'Netzqualität',
  Reisekonnektivitaet: 'Reisekonnektivität', Schnaeppchen: 'Schnäppchen',
  wettbewerbsfaehig: 'wettbewerbsfähig',
  // Half corrected already: the umlaut was there, the eszett was not.
  Grösstenteils: 'Größtenteils', grösser: 'größer', grösste: 'größte',
  grossem: 'großem', regelmässig: 'regelmäßig',
  abschliessen: 'abschließen', einschliesslich: 'einschließlich',
  reissen: 'reißen', reisst: 'reißt', grosszügig: 'großzügig',
};

// Identifiers, not prose. These appear in sectionOrder arrays and as object
// keys, they are never rendered, and renaming them would break the lookup that
// resolves a section to its content. They are listed here so that a later pass
// over this file does not "fix" them: an unrendered key spelled without an
// umlaut is not a reader facing problem, and a renamed one is a broken page.
export const NEVER_TOUCH = new Set([
  'fluege', 'inlandsfluege', 'laenderliste', 'geraeteregister',
]);

const FILES = [
  '../lib/content/de/regions.js',
  '../lib/content/de/legal.js',
  '../lib/content/de/compatibility.js',
  '../lib/content/de/destinations.js',
  '../lib/content/de/guides.js',
  '../lib/content/ui.js',
  '../lib/content/home.js',
];

// Sorted longest first so that a compound is replaced before its stem could
// match part of it. With word boundaries this is belt and braces, but the
// braces are cheap.
const ENTRIES = Object.entries(MAP)
  .filter(([from]) => {
    if (NEVER_TOUCH.has(from)) {
      throw new Error('"' + from + '" is a section identifier, not prose. Remove it from MAP.');
    }
    return true;
  })
  .sort((a, b) => b[0].length - a[0].length);

// Only rewrite files when run directly. The table above is imported by
// scripts/orthography-check.mjs, which must be able to read it without the act
// of reading it changing anything on disk.
if (import.meta.url === 'file://' + process.argv[1]) {
  let totalChanges = 0;
  const perFile = [];

  FILES.forEach((rel) => {
    const url = new URL(rel, import.meta.url);
    let text = readFileSync(url, 'utf8');
    const before = text;
    const counts = {};

    ENTRIES.forEach(([from, to]) => {
      // Word boundaries on both sides, so "fuer" inside a longer token that is
      // not in the table is left alone rather than half translated.
      const re = new RegExp('\\b' + from + '\\b', 'g');
      const hits = text.match(re);
      if (hits) {
        counts[from] = hits.length;
        text = text.replace(re, to);
      }
    });

    const n = Object.values(counts).reduce((a, b) => a + b, 0);
    totalChanges += n;
    if (text !== before) writeFileSync(url, text);
    perFile.push({ file: rel.replace('../', ''), changes: n, words: Object.keys(counts).length });
  });

  console.log('German orthography repair');
  console.log('');
  perFile.forEach((f) => {
    console.log('  ' + f.file.padEnd(34) + String(f.changes).padStart(5) + ' replacements across ' + f.words + ' distinct words');
  });
  console.log('');
  console.log('  total: ' + totalChanges + ' replacements from a table of ' + ENTRIES.length + ' reviewed words');
  console.log('');
  console.log('Words containing ae, oe, ue or ss that were deliberately left alone include');
  console.log('Adresse, Kommission, Anschlussflug, muss, Quellen, neue, teuer, Dauer,');
  console.log('aktuelle, genaue, Bequemlichkeit and nachzuschauen, all of which are already correct.');

}

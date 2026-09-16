// Pagina de compatibilitate, piata romaneasca.
//
// Doua lucruri o deosebesc de celelalte piete. Primul: aici circula in
// continuare multe telefoane cumparate in rate de la operator, deci blocarea
// in retea conteaza. Al doilea, si mai important: confuzia intre eSIM de date
// si cartela cu numar, care in Romania apare in aproape fiecare discutie.
//
// Nu este traducere. Alta piata, alte intrebari.

export const compatibility = {
  angle: 'Verifică pe telefonul tău, nu într-o listă care se învechește',
  h1: 'Telefonul tău suportă eSIM',
  title: 'Compatibilitate eSIM: verifici telefonul în zece secunde',
  metaDescription:
    'Listele de modele se învechesc. Îți arată cum citești răspunsul de pe propriul telefon și ce faci dacă este blocat în rețeaua operatorului.',
  sectionOrder: ['intro', 'verificare', 'blocare', 'număr', 'modele', 'dualsim', 'înainte', 'faq'],
  intro: [
    'Orice listă de compatibilitate de pe internet este puțin greșită, inclusiv cele publicate de cei care vând eSIM-uri. Telefoanele apar în variante regionale, unele piețe primesc același model fără eSIM, iar producătorii schimbă asta între seriile de producție.',
    'Telefonul tău știe deja răspunsul. Verificarea durează zece secunde și este valabilă pentru aparatul tău, nu pentru numele de pe cutie.',
  ],
  sections: {
    verificare: {
      heading: 'Verificarea de zece secunde',
      body: [
        'Pe iPhone: Setări, apoi General, apoi Informații, și derulezi până jos. Dacă vezi SIM disponibil, SIM digital sau un număr EID, telefonul suportă eSIM. Dacă nu există EID, nu există eSIM, indiferent ce spune o listă despre modelul tău.',
        'Pe Android: Setări, apoi Rețea și internet, apoi Cartele SIM. Cauți opțiunea de a adaugă un eSIM sau de a descarcă o cartelă. Dacă opțiunea există, există și componenta.',
        'EID-ul este seria cipului SIM încorporat în telefon. Un aparat fără cip nu are ce afisa, de aceea este testul cel mai sigur.',
      ],
    },
    blocare: {
      heading: 'Telefonul luat în rate de la operator',
      body: [
        'Un telefon cumpărat cu abonament poate fi blocat în rețeaua operatorului chiar dacă partea de eSIM există și funcționează. Un telefon blocat acceptă doar profilurile operatorului propriu și le refuză pe toate celelalte.',
        'Este cel mai frecvent motiv pentru care un profil perfect valid refuză să se instaleze, și se află de obicei în cel mai prost moment, adică în aeroport.',
        'Operatorii românești deblochează telefonul la cerere după ce condițiile contractului sunt îndeplinite. Un apel la serviciul clienți lămurește situația în câteva minute. Fă-l înainte de plecare, nu în timpul călătoriei.',
      ],
    },
    numar: {
      heading: 'eSIM nu înseamnă număr de telefon străin',
      body: [
        'Aceasta este confuzia care apare cel mai des în căutările românești și merită spusă clar, chiar pe pagina de compatibilitate. Un eSIM de călătorie îți da internet în țară în care mergi. Nu îți da un număr de telefon din țară aceea.',
        'Dacă vrei un număr străin, pentru că suni des o firmă din altă țară sau pentru că primești coduri pe el, acela este alt produs. Nu îl rezolvi cu un eSIM de date și nu ar trebui să ți-l vândă nimeni ca și cum l-ar rezolvă.',
        'Invers, dacă ai nevoie doar de hartă, mesagerie, rezervări și banking prin aplicație, eSIM-ul de date acoperă tot. Numărul tău românesc rămâne activ pe cartelă obișnuită și primește în continuare SMS-urile de la bancă.',
      ],
    },
    modele: {
      heading: 'Familii de telefoane, ca reper aproximativ',
      body: [
        'Apple suportă eSIM de la iPhone XS și XR. Modelele vândute în Statele Unite începând cu iPhone 14 nu mai au deloc slot fizic, cele din Europa au. Merg și iPad-urile cu date mobile și Apple Watch cu abonament.',
        'Google Pixel suportă de la Pixel 3. Samsung de la seria Galaxy S20 și pe modelele Fold și Flip, deși unele variante regionale au fost livrate fără eSIM.',
        'Dincolo de acestea, suportul este inegal și depinde de modelul exact și de piață pe care a fost vândut. Exact de asta verificarea pe telefon bate orice listă.',
      ],
    },
    dualsim: {
      heading: 'Ce schimbă de fapt dual SIM',
      body: [
        'Un eSIM nu înlocuiește cartelă ta obișnuită decât dacă vrei tu. Numărul românesc rămâne activ pe SIM-ul fizic și primește în continuare apeluri și mesaje. Profilul de călătorie duce doar datele.',
        'Setarea care contează este care linie folosește datele mobile. O pui pe profilul de călătorie și lași abonamentul românesc doar pentru apeluri și SMS, cu datele în roaming oprite. Combinația asta este cea care previne factura neplăcută.',
        'Mai merită știut că ai două numere, dar celălalt vede doar unul. Ce linie se folosește pentru apelurile pe care le inițiezi este o setare separată de cea pentru date.',
      ],
    },
    inainte: {
      heading: 'Trei lucruri înainte de plecare',
      body: [
        'Fă verificarea și confirmă că există EID. Întreabă operatorul dacă telefonul este blocat în rețea. Instalează profilul cât timp ești încă pe o conexiune în care ai încredere.',
        'Instalarea de acasă, nu la sosire, contează mai mult decât pare. Instalarea în sine are nevoie de internet, iar momentul în care ai cea mai mare nevoie de profil este exact momentul în care nu ai conexiune.',
      ],
    },
  },
  faq: [
    {
      q: 'Cum știu sigur dacă telefonul meu suportă eSIM?',
      a: 'Cauți numărul EID în setări. Pe iPhone la General și apoi Informații, pe Android de obicei la Rețea și internet și apoi Cartele SIM. Dacă există EID, există și componenta.',
    },
    {
      q: 'Telefonul suportă eSIM dar profilul nu se instalează. De ce?',
      a: 'Cel mai probabil este blocat în rețeaua operatorului, mai rar pentru că instalarea s-a încercat fără internet.',
    },
    {
      q: 'Primesc un număr de telefon din țară în care merg?',
      a: 'Nu. Un eSIM de date îți da internet, nu număr local. Numărul tău românesc rămâne pe cartelă obișnuită și primește în continuare SMS-uri.',
    },
    {
      q: 'Pot debloca telefonul luat în rate?',
      a: 'Da, operatorii deblochează la cerere după îndeplinirea condițiilor din contract. Rezolvă asta înainte de plecare.',
    },
    {
      q: 'Merge eSIM pe ceas sau pe tableta?',
      a: 'Pe modelele cu date mobile, da. O tableta doar cu wifi nu are modem și nu are EID.',
    },
  ],
};

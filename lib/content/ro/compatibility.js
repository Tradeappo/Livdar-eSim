// Pagina de compatibilitate, piata romaneasca.
//
// Doua lucruri o deosebesc de celelalte piete. Primul: aici circula in
// continuare multe telefoane cumparate in rate de la operator, deci blocarea
// in retea conteaza. Al doilea, si mai important: confuzia intre eSIM de date
// si cartela cu numar, care in Romania apare in aproape fiecare discutie.
//
// Nu este traducere. Alta piata, alte intrebari.

export const compatibility = {
  angle: 'Verifica pe telefonul tau, nu intr-o lista care se invecheste',
  h1: 'Telefonul tau suporta eSIM',
  title: 'Compatibilitate eSIM: verifici telefonul in zece secunde',
  metaDescription:
    'Listele de modele se invechesc. Iti arata cum citesti raspunsul de pe propriul telefon si ce faci daca este blocat in reteaua operatorului.',
  sectionOrder: ['intro', 'verificare', 'blocare', 'numar', 'modele', 'dualsim', 'inainte', 'faq'],
  intro: [
    'Orice lista de compatibilitate de pe internet este putin gresita, inclusiv cele publicate de cei care vand eSIM-uri. Telefoanele apar in variante regionale, unele piete primesc acelasi model fara eSIM, iar producatorii schimba asta intre seriile de productie.',
    'Telefonul tau stie deja raspunsul. Verificarea dureaza zece secunde si este valabila pentru aparatul tau, nu pentru numele de pe cutie.',
  ],
  sections: {
    verificare: {
      heading: 'Verificarea de zece secunde',
      body: [
        'Pe iPhone: Setari, apoi General, apoi Informatii, si derulezi pana jos. Daca vezi SIM disponibil, SIM digital sau un numar EID, telefonul suporta eSIM. Daca nu exista EID, nu exista eSIM, indiferent ce spune o lista despre modelul tau.',
        'Pe Android: Setari, apoi Retea si internet, apoi Cartele SIM. Cauti optiunea de a adauga un eSIM sau de a descarca o cartela. Daca optiunea exista, exista si componenta.',
        'EID-ul este seria cipului SIM incorporat in telefon. Un aparat fara cip nu are ce afisa, de aceea este testul cel mai sigur.',
      ],
    },
    blocare: {
      heading: 'Telefonul luat in rate de la operator',
      body: [
        'Un telefon cumparat cu abonament poate fi blocat in reteaua operatorului chiar daca partea de eSIM exista si functioneaza. Un telefon blocat accepta doar profilurile operatorului propriu si le refuza pe toate celelalte.',
        'Este cel mai frecvent motiv pentru care un profil perfect valid refuza sa se instaleze, si se afla de obicei in cel mai prost moment, adica in aeroport.',
        'Operatorii romanesti deblocheaza telefonul la cerere dupa ce conditiile contractului sunt indeplinite. Un apel la serviciul clienti lamureste situatia in cateva minute. Fa-l inainte de plecare, nu in timpul calatoriei.',
      ],
    },
    numar: {
      heading: 'eSIM nu inseamna numar de telefon strain',
      body: [
        'Aceasta este confuzia care apare cel mai des in cautarile romanesti si merita spusa clar, chiar pe pagina de compatibilitate. Un eSIM de calatorie iti da internet in tara in care mergi. Nu iti da un numar de telefon din tara aceea.',
        'Daca vrei un numar strain, pentru ca suni des o firma din alta tara sau pentru ca primesti coduri pe el, acela este alt produs. Nu il rezolvi cu un eSIM de date si nu ar trebui sa ti-l vanda nimeni ca si cum l-ar rezolva.',
        'Invers, daca ai nevoie doar de harta, mesagerie, rezervari si banking prin aplicatie, eSIM-ul de date acopera tot. Numarul tau romanesc ramane activ pe cartela obisnuita si primeste in continuare SMS-urile de la banca.',
      ],
    },
    modele: {
      heading: 'Familii de telefoane, ca reper aproximativ',
      body: [
        'Apple suporta eSIM de la iPhone XS si XR. Modelele vandute in Statele Unite incepand cu iPhone 14 nu mai au deloc slot fizic, cele din Europa au. Merg si iPad-urile cu date mobile si Apple Watch cu abonament.',
        'Google Pixel suporta de la Pixel 3. Samsung de la seria Galaxy S20 si pe modelele Fold si Flip, desi unele variante regionale au fost livrate fara eSIM.',
        'Dincolo de acestea, suportul este inegal si depinde de modelul exact si de piata pe care a fost vandut. Exact de asta verificarea pe telefon bate orice lista.',
      ],
    },
    dualsim: {
      heading: 'Ce schimba de fapt dual SIM',
      body: [
        'Un eSIM nu inlocuieste cartela ta obisnuita decat daca vrei tu. Numarul romanesc ramane activ pe SIM-ul fizic si primeste in continuare apeluri si mesaje. Profilul de calatorie duce doar datele.',
        'Setarea care conteaza este care linie foloseste datele mobile. O pui pe profilul de calatorie si lasi abonamentul romanesc doar pentru apeluri si SMS, cu datele in roaming oprite. Combinatia asta este cea care previne factura neplacuta.',
        'Mai merita stiut ca ai doua numere, dar celalalt vede doar unul. Ce linie se foloseste pentru apelurile pe care le initiezi este o setare separata de cea pentru date.',
      ],
    },
    inainte: {
      heading: 'Trei lucruri inainte de plecare',
      body: [
        'Fa verificarea si confirma ca exista EID. Intreaba operatorul daca telefonul este blocat in retea. Instaleaza profilul cat timp esti inca pe o conexiune in care ai incredere.',
        'Instalarea de acasa, nu la sosire, conteaza mai mult decat pare. Instalarea in sine are nevoie de internet, iar momentul in care ai cea mai mare nevoie de profil este exact momentul in care nu ai conexiune.',
      ],
    },
  },
  faq: [
    {
      q: 'Cum stiu sigur daca telefonul meu suporta eSIM?',
      a: 'Cauti numarul EID in setari. Pe iPhone la General si apoi Informatii, pe Android de obicei la Retea si internet si apoi Cartele SIM. Daca exista EID, exista si componenta.',
    },
    {
      q: 'Telefonul suporta eSIM dar profilul nu se instaleaza. De ce?',
      a: 'Cel mai probabil este blocat in reteaua operatorului, mai rar pentru ca instalarea s-a incercat fara internet.',
    },
    {
      q: 'Primesc un numar de telefon din tara in care merg?',
      a: 'Nu. Un eSIM de date iti da internet, nu numar local. Numarul tau romanesc ramane pe cartela obisnuita si primeste in continuare SMS-uri.',
    },
    {
      q: 'Pot debloca telefonul luat in rate?',
      a: 'Da, operatorii deblocheaza la cerere dupa indeplinirea conditiilor din contract. Rezolva asta inainte de plecare.',
    },
    {
      q: 'Merge eSIM pe ceas sau pe tableta?',
      a: 'Pe modelele cu date mobile, da. O tableta doar cu wifi nu are modem si nu are EID.',
    },
  ],
};

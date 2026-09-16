export const guides = {
  'how-esim-works': {
    cluster: 'setup',
    h1: 'Cum funcționează un eSIM',
    title: 'Ce este un eSIM și prin ce diferă de o cartelă obișnuită',
    metaDescription: 'Un eSIM este o cartelă SIM scrisă în telefon, nu introdusă în el. Ce se schimbă, ce nu se schimbă și greșeală pe care o face aproape toată lumea.',
    intro: [
      'O cartelă SIM este un cip securizat care demonstrează unei rețele mobile că ai dreptul să fii acolo. Un eSIM este același lucru fără plastic: cipul este deja în telefon, iar pe el se scrie un profil de rețea.',
      'Restul funcționează identic. Aceleași antene, aceleași rețele, aceleași viteze. Se schimbă doar felul în care ajunge profilul în telefon, și exact acolo apar diferențele practice.',
    ],
    sections: {
      diferenta: {
        heading: 'Ce se schimbă de fapt',
        body: [
          'Poți instala un profil de oriunde ai internet. Asta înseamnă că poți fi într-o rețea străină înainte să ieși din țară.',
          'Poți ține mai multe profiluri și să comuti între ele. De asta dual SIM pe un telefon cu eSIM este mai util decât a fost vreodată dual SIM cu două sertare.',
          'Nu poți scoate profilul și să îl muți în alt telefon. Asta este prețul.',
        ],
      },
      confuzie: {
        heading: 'eSIM de date nu înseamnă număr străin',
        body: [
          'În România confuzia asta este cea mai frecvența, pentru că multă lume caută deopotrivă cartelă cu număr de Anglia și eSIM pentru vacanță.',
          'Un eSIM de călătorie îți da internet în străinătate. Nu îți da un număr local și nu poate primi SMS de la o bancă sau de la o instituție din țară respectivă.',
          'Dacă ai nevoie de un număr real cu prefix străin, ai nevoie de o cartelă cu număr. Sunt două produse diferite pentru două nevoi diferite.',
        ],
      },
      greseala: {
        heading: 'Greșeală pe care o face aproape toată lumea',
        body: [
          'Instalarea unui eSIM are nevoie de internet. Activarea nu.',
          'Pare evident până când stai în sala de sosiri fără date și încerci să scanezi un cod QR dintr-un email pe care nu îl poți deschide. Instalează acasă pe wifi, lasă linia oprită și pornește-o când aterizezi.',
        ],
      },
    },
    faq: [
      { q: 'Pot șterge un eSIM și să îl reinstalez?', a: 'De obicei nu. Majoritatea profilurilor de călătorie se instalează o singură dată. Oprește-l în loc să îl ștergi.' },
      { q: 'Consumă mai multă baterie?', a: 'Două linii active consumă puțin mai mult, pentru că telefonul ține două înregistrări. Oprește linia pe care nu o folosești.' },
      { q: 'Merge pe tableta sau pe ceas?', a: 'Dacă dispozitivul are eSIM și planul permite. Multe planuri de călătorie sunt scrise doar pentru telefoane.' },
    ],
  },

  'install-esim': {
    cluster: 'setup',
    h1: 'Cum instalezi și activezi un eSIM',
    title: 'Instalează eSIM-ul înainte de zbor: ordinea care funcționează',
    metaDescription: 'Instalezi acasă pe wifi, lași linia oprită, o pornești când aterizezi. Toată secvența, inclusiv setarea pe care o uită toată lumea.',
    intro: [
      'Ordinea contează mai mult decât pașii. Aproape orice problemă cu un eSIM în călătorie este aceeași problemă: omul a încercat să îl instaleze exact în momentul în care avea nevoie de el, adică în momentul în care nu avea internet.',
    ],
    sectionOrder: ['acasa', 'aterizare', 'păstrare', 'probleme'],
    sections: {
      acasa: {
        heading: 'Acasă, pe wifi',
        body: [
          'Instalează profilul. Da-i un nume pe care îl recunoști mai târziu, de exemplu numele destinației, nu denumirea implicită.',
          'Lasă linia oprită. Valabilitatea unui plan de călătorie începe de obicei la prima conectare, nu la cumpărare, dar asta este o regulă a planului și merită citită.',
        ],
      },
      aterizare: {
        heading: 'Când aterizezi',
        body: [
          'Pornește linia de călătorie. Pune datele mobile pe ea. Activează roamingul de date pentru acea linie, pentru că un profil de călătorie tehnic face roaming, chiar dacă pare local.',
          'Apoi oprește roamingul de date pe numărul tău românesc. Pasul asta îl sare lumea și exact el produce factura surpriza.',
        ],
      },
      pastrare: {
        heading: 'Se instalează o dată, deci nu îl șterge',
        body: [
          'Codul pe care îl primești la cumpărare nu este un fișier pe care îl ții undeva și îl pui la loc când vrei. La majoritatea planurilor de călătorie el se consumă la prima instalare. Profilul este scris în telefonul acela și rămâne acolo.',
          'Trei gesturi obișnuite îl pierd definitiv. Îl ștergi din lista de rețele mobile pentru că ți se pare că faci curat. Resetezi telefonul la setările din fabrica. Îți iei telefon nou și încerci să muți profilul pe el. În toate trei cazurile profilul dispare și codul inițial nu îl mai aduce înapoi.',
          'Ce faci în loc: oprești linia. O linie oprită nu consumă, nu se înregistrează și nu sta în calea numărului tău românesc, dar profilul rămâne în telefon. Dacă planul mai are valabilitate sau dacă îl reîncarci, îl pornești la urmatoarea călătorie și nu mai ai nimic de instalat.',
          'Iar dacă tot trebuie să schimbi telefonul sau să faci o resetare în mijlocul călătoriei, scrie furnizorului înainte. Unii pot emite un cod nou, alții nu. După ștergere, discuția aia are un singur răspuns.',
        ],
      },
      probleme: {
        heading: 'Dacă nu se conectează',
        body: [
          'Așteaptă două sau trei minute. Înregistrarea într-o rețea străină nu este instantanee.',
          'Pornește și oprește modul avion o dată. Apoi verifică dacă datele mobile sunt pe linia corectă. Este cea mai frecvența greșeală.',
          'Dacă tot nu merge, verifică dacă planul cere un APN introdus manual. Majoritatea nu cer. Unele da, și atunci scrie la furnizor.',
        ],
      },
    },
    faq: [
      { q: 'Când începe să curgă valabilitatea?', a: 'De obicei la prima conectare la rețea, nu la cumpărare. Verifică planul, pentru că unele pornesc la cumpărare.' },
      { q: 'Pot instala în avion?', a: 'Doar cu wifi funcțional la bord. Presupune că nu.' },
      { q: 'Dacă îl șterg din greșeală?', a: 'Majoritatea profilurilor de călătorie nu se pot reinstala. Tratează ștergerea ca definitivă.' },
      { q: 'Îmi schimb telefonul în vacanță. Mut profilul pe cel nou?', a: 'Nu se mută. Profilul rămâne în telefonul în care a fost instalat. Întreabă furnizorul dacă poate emite un cod nou înainte să atingi ceva.' },
    ],
  },

  'esim-vs-roaming': {
    cluster: 'comparison',
    h1: 'eSIM sau roaming',
    title: 'eSIM sau roaming: socoteala care decide pentru vacanță ta',
    metaDescription: 'În Uniunea Europeană roamingul este inclus. În afară ei, socoteala durează două minute și de obicei nu este la limita.',
    intro: [
      'Pentru abonamentele românești răspunsul în Uniunea Europeană este aproape mereu roaming, pentru că nu costă nimic în plus. În afară Uniunii este aproape mereu invers.',
      'Între cele două sunt câteva țări unde merită să te uiți atent.',
    ],
    sectionOrder: ['ue', 'graniță', 'afară', 'rezonabil'],
    sections: {
      ue: {
        heading: 'În Uniunea Europeană nu îți trebuie nimic',
        body: [
          'În Uniunea Europeană și în Spațiul Economic European îți iei volumul cu ține, în condițiile de utilizare rezonabilă din contract.',
          'Pentru Grecia, Spania, Italia sau Bulgaria un eSIM de călătorie este de obicei în plus. Scriem asta pe paginile de țară respective.',
        ],
      },
      granita: {
        heading: 'Unde se termină zona inclusă',
        body: [
          'Zona în care roamingul este inclus nu este Europa de pe hartă. Este Spațiul Economic European: statele membre ale Uniunii, plus Islanda, Norvegia și Liechtenstein. Atât.',
          'Restul continentului este afară, și de obicei nu acolo se uită lumea. Elveția nu este în Spațiul Economic European, deși are graniță numai cu țări care sunt. Marea Britanie a ieșit odată cu Brexitul. Turcia, Serbia, Bosnia, Albania, Macedonia de Nord și Muntenegru nu au fost niciodată înăuntru. Egiptul și toată coasta de sud a Mediteranei sunt alt continent și altă socoteala.',
          'Peste regula asta, fiecare operator își poate adaugă voluntar țări în zona europeană proprie, și exact acolo apar Marea Britanie sau Elveția la unii și nu la alții. Nu se deduce din nimic și nu se generalizează de la un prieten la altul. Lista de țări a opțiunii tale este singurul document care contează, iar ea se mai schimbă.',
          'Mai este o graniță pe care nu o vede nimeni până pe factură: rețelele de la bordul navelor și al avioanelor. Un feribot în larg sau un vapor de croazieră pot fi prinse de o rețea prin satelit taxată separat, chiar dacă pleci dintr-un port din Uniune și ajungi în altul. Acolo nu te acoperă nici roamingul inclus, nici un eSIM de călătorie. Se rezolvă cu datele mobile oprite cât ești pe apă.',
        ],
      },
      afara: {
        heading: 'În afară Uniunii se scumpește repede',
        body: [
          'Turcia, Egipt, Emiratele, Marea Britanie la unii operatori, Statele Unite și Asia sunt toate destinații extra-UE.',
          'Ia prețul pe zi sau pachetul internațional din abonamentul tău, înmulțește cu zilele de călătorie și compară. La un city break de două zile diferență e mică. La două săptămâni aproape niciodată.',
        ],
      },
      rezonabil: {
        heading: 'Regula de utilizare rezonabilă',
        body: [
          'Roamingul inclus este gândit pentru călătorii, nu pentru a trai permanent în altă țară cu un abonament românesc. Operatorii pot analiza tiparul de utilizare pe o perioada de luni și pot cere dovada legăturii cu țară de origine, pot aplică un cost suplimentar sau pot limita serviciul.',
          'Condițiile diferă de la operator la operator, deci este o linie de citit în propriul contract, nu o regulă de generalizat.',
        ],
      },
    },
    faq: [
      { q: 'Roamingul este mereu mai scump?', a: 'Nu. În Uniunea Europeană este inclus, iar unele abonamente acoperă mai multe țări decât crede lumea. Verifică întâi.' },
      { q: 'Pot folosi și una și alta?', a: 'Da, și de obicei asta este configurația bună: numărul românesc pentru apeluri și SMS, eSIM pentru date, roaming de date oprit pe numărul românesc.' },
      { q: 'Dar apelurile primite?', a: 'Vin pe numărul tău ca de obicei. În Uniunea Europeană primirea este inclusă, în afară ei nu automat.' },
      { q: 'Elveția intră în roamingul european?', a: 'Nu de drept. Elveția nu este în Spațiul Economic European. Unii operatori români o trec voluntar în zona lor europeană, alții o taxează ca extra-UE. Se vede numai în lista de țări a opțiunii tale.' },
    ],
  },

  'airport-connectivity': {
    cluster: 'arrival',
    h1: 'Cum ajungi online imediat ce aterizezi',
    title: 'Internet la aeroport: ce faci în primele zece minute',
    metaDescription: 'Wifi de aeroport, ghișeu de cartele și eSIM, comparate pentru sosirea pe care o ai de fapt: obosit, la coadă și cu un transfer de găsit.',
    intro: [
      'Sosirea este cel mai prost moment în care să rezolvi o problemă de conectare și cel mai frecvent moment în care lumea încearcă. Ești obosit, wifi-ul cere o adresă de email, la ghișeul de cartele este coadă, iar stația de taxiuri este dincolo de ea.',
      'Tot ce urmează este despre cum scoți decizii din acele zece minute.',
    ],
    sectionOrder: ['wifi', 'codul', 'ghișeu', 'pregătit'],
    sections: {
      wifi: {
        heading: 'Wifi-ul de aeroport, realist',
        body: [
          'Majoritatea aeroporturilor mari au wifi gratuit și în general funcționează. Ce diferă este pagina de conectare: unele cer email, altele un număr de telefon pe care să trimită un cod, ceea ce este circular dacă nu ai date.',
          'Și se oprește la ușa terminalului. Taxiul, trenul spre oraș și căutarea hotelului se întâmplă în afară lui.',
        ],
      },
      codul: {
        heading: 'Când wifi-ul îți cere un număr de telefon',
        body: [
          'Dintr-un aeroport european nu simți problema asta, pentru că aterizezi cu datele incluse și nu deschizi pagina de conectare niciodată. Începe să doară exact acolo unde abonamentul românesc nu te mai duce: Istanbul, Hurghada, Dubai, Bangkok. Adică fix în aeroporturile în care chiar depinzi de wifi.',
          'Mecanismul este scurt. Formularul cere un număr, trimite pe el un cod prin SMS și deschide accesul abia după ce introduci codul. Este construit pornind de la ideea că ai coborât din avion cu o linie care primește mesaje.',
          'Numărul tău românesc poate să îl primească, dar numai dacă linia s-a înregistrat într-o rețea de acolo. Dacă ai lăsat telefonul în modul avion de la decolare sau ai oprit de tot linia de acasă ca să nu plătești nimic în afară Uniunii, nu s-a înregistrat nicăieri și codul nu are unde să ajungă. Iar chiar înregistrat, multe formulare acceptă doar numere în format local și resping din start unul care începe cu +40.',
          'Ce face capcana serioasă este că nu se vede dinainte. Nu scrie nicăieri ce fel de portal folosește aeroportul în care aterizezi, și poate fi altul în alt terminal al aceluiași aeroport. Descoperi ce variantă ai nimerit după ce ești deja acolo, obosit, cu bagajul lângă ține.',
          'Un profil instalat înainte de plecare nu rezolvă bucla, ci o scoate din discuție. Nu deschizi portalul, nu aștepți niciun cod și nu afli ce versiune rulează aeroportul ăla. Întrebarea pur și simplu nu ți se mai adresează.',
        ],
      },
      ghiseu: {
        heading: 'Ghișeul de cartele',
        body: [
          'Sigur, îți da număr local și are un preț stabilit știind foarte bine că în acel moment nu ai alternativă.',
          'În unele țări implică și înregistrarea pe pașaport, ceea ce transformă cinci minute în douăzeci când aterizează un avion plin deodată.',
        ],
      },
      pregatit: {
        heading: 'Varianta pregătită dinainte',
        body: [
          'Instalezi profilul înainte de zbor, îl lași oprit și îl pornești cât avionul încă rulează pe pista. Când ajungi la control ai harta, mesajele și rezervările.',
          'Funcționează doar dacă ai făcut-o din timp. Un eSIM neinstalat valorează exact cât niciun eSIM.',
        ],
      },
    },
    faq: [
      { q: 'Pot activa eSIM-ul pe wifi-ul aeroportului?', a: 'De obicei da, dar exact de asta vrei să nu ai nevoie. Instalează acasă.' },
      { q: 'Cartelele de la aeroport sunt o teapa?', a: 'Sunt scumpe pentru comoditate, nu necinstite. În Thailanda chiar sunt o afacere bună. În Japonia și în Golf, mai puțin.' },
      { q: 'Dar wifi-ul din avion?', a: 'Dacă funcționează, poți instala acolo. Nu construi planul în jurul lui.' },
    ],
  },
};

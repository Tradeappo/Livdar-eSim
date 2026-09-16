// Piata romaneasca: roamingul in UE este inclus, deci valoarea unui eSIM apare
// aproape numai in afara UE. In plus, aici exista deja o categorie mentala
// puternica: "cartela SIM cu numar de X". Confuzia dintre un eSIM de date si o
// cartela cu numar strain este specifica acestei piete si trebuie lamurita pe
// fiecare pagina, altfel omul cumpara gresit.

export const destinations = {
  turkey: {
    angle: 'Turcia este destinația de vacanță cu cel mai mare decalaj fața de roamingul UE',
    h1: 'eSIM pentru Turcia',
    title: 'eSIM Turcia: internet fără surprize și fără telefon blocat',
    metaDescription: 'Turcia nu este în zona de roaming UE, iar telefonul se blochează după patru luni dacă folosești o cartelă turcească. Un eSIM de călătorie evita ambele.',
    sectionOrder: ['intro', 'costuri', 'imei', 'confuzie', 'acoperire', 'instalare', 'faq'],
    intro: [
      'În Uniunea Europeană îți iei gigabaiții cu ține și nu se schimbă nimic pe factură. La graniță cu Turcia se schimbă tot. Turcia nu este stat membru și nu este în Spațiul Economic European, deci roamingul inclus se oprește acolo.',
      'Acesta este primul motiv pentru un eSIM în Turcia. Al doilea ține de telefonul tău și îl explicăm mai jos, pentru că puțini îl menționează.',
    ],
    sections: {
      costuri: {
        heading: 'Cât costă de fapt roamingul în Turcia',
        body: [
          'Operatorii români tratează Turcia ca destinație extra-UE. În funcție de abonament asta înseamnă o taxă pe zi, un mic pachet de date sau un preț pe megabyte care, la un comportament normal de vacanță, urcă foarte repede.',
          'Verifică întâi propriul abonament. Dacă ai deja o opțiune care include Turcia, nu ai nevoie de noi pentru două săptămâni la Antalya. Dacă nu ai, înmulțește taxa zilnică cu numărul de zile. Rezultatul rareori este la limita.',
        ],
      },
      imei: {
        heading: 'Regula IMEI, pe care agențiile nu o spun',
        body: [
          'Turcia înregistrează telefoanele străine folosite cu o cartelă turcească pe pașaportul persoanei care le înregistrează. Fără înregistrare, telefonul este blocat în rețelele turcești după aproximativ patru luni.',
          'La o vacanță unică de obicei nu te prinde. Pe cine merge în fiecare an pe aceeași coastă sau sta un sezon întreg, îl prinde.',
          'Un eSIM de călătorie rezolvă asta din construcție: ești vizitator în rețea, nu abonat turc. Nu se înregistrează nimic, deci nu expiră nimic.',
        ],
      },
      confuzie: {
        heading: 'eSIM de date sau cartelă cu număr de Turcia',
        body: [
          'Sunt două produse diferite și merită spus clar, pentru că în România se caută des amândouă.',
          'Un eSIM de călătorie îți da internet. Nu îți da un număr cu prefix +90 și nu poate primi SMS-uri de la o bancă turcească, de la o aplicație de livrare sau de la o instituție.',
          'Dacă ai nevoie de un număr turcesc real care primește coduri, îți trebuie o cartelă cu număr, nu un eSIM de date. Îți spunem asta înainte, nu după.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Trei rețele acoperă țară: Turkcell, Vodafone Turkiye și Turk Telekom. Istanbul, Ankara, Izmir, Antalya și toată coasta egeeană și mediteraneană sunt bine acoperite.',
          'Cappadocia, provinciile din est și drumurile de munte sunt altă poveste. Semnalul urmează șoselele principale și localitățile. Dacă pleci la baloane la cinci dimineața, descarcă harta înainte.',
        ],
      },
      instalare: {
        heading: 'Când îl instalezi',
        body: [
          'Acasă, pe wifi, și îl lași oprit. Îl pornești când atinge avionul pista. Instalarea unui eSIM are nevoie de internet, iar momentul în care ai cea mai mare nevoie de internet este exact momentul în care nu ai.',
        ],
      },
    },
    faq: [
      { q: 'Roamingul meu din România merge în Turcia?', a: 'Nu ca în UE. Turcia este extra-UE, deci se aplică opțiunea de roaming internațional din abonamentul tău, care diferă de la operator la operator.' },
      { q: 'Mi se blochează telefonul în Turcia?', a: 'Nu cu un eSIM de călătorie. Regula IMEI se aplică telefoanelor folosite cu o cartelă turcească de abonat.' },
      { q: 'Primesc SMS de la bancă pe eSIM?', a: 'Nu. Un eSIM de date nu are număr propriu. Pentru coduri prin SMS îți trebuie o cartelă cu număr.' },
    ],
  },

  greece: {
    angle: 'Grecia este în UE, deci răspunsul cinstit este că de obicei nu ai nevoie',
    h1: 'eSIM pentru Grecia',
    title: 'eSIM Grecia: când chiar ai nevoie și când nu',
    metaDescription: 'Grecia este în Uniunea Europeană, deci roamingul tău este inclus. Un eSIM are sens doar în câteva situații concrete. Le enumerăm pe toate.',
    sectionOrder: ['intro', 'când', 'verificare', 'acoperire', 'instalare', 'limite', 'faq'],
    intro: [
      'Grecia este în Uniunea Europeană. Asta înseamnă că abonamentul tău românesc funcționează acolo cu gigabaiții incluși, în limitele de utilizare rezonabilă din contract.',
      'Pagina asta ar putea să se oprească aici, și pentru majoritatea oamenilor chiar se oprește. Mai jos sunt singurele situații în care un eSIM chiar aduce ceva.',
    ],
    sections: {
      cand: {
        heading: 'Cele patru situații în care are sens',
        body: [
          'Prima: ai o cartelă preplătită fără opțiune de roaming inclusă, și există încă destule pe piață.',
          'A două: ai depășit limita de utilizare rezonabilă a abonamentului și operatorul a început să taxeze suplimentar. Se întâmplă la sejururi lungi.',
          'A treia: circuit prin Grecia, Turcia și Balcanii în aceeași vacanță. Un plan regional acoperă și partea din afară UE, unde abonamentul tău nu mai ajută.',
          'A patra: vrei să ții traficul de vacanță separat de numărul de serviciu. Motiv valid, chiar dacă nu e despre bani.',
        ],
      },
      verificare: {
        heading: 'Ce cauți în propriul contract',
        body: [
          'Ca să știi dacă ești în vreuna dintre situațiile de mai sus, deschide secțiunea de roaming a abonamentului tău și uită-te după volumul de date pe care îl ai în roaming. Nu după cel de acasă.',
          'Acolo apare surpriza. La abonamentele mari, și mai ales la cele nelimitate, volumul disponibil în roaming este o cifra separată și mai mică. Nu înseamnă că rămâi fără internet la Rodos. Înseamnă că după pragul acela operatorul poate adaugă un cost pe gigabait, plafonat prin reglementarea europeană, și serviciul merge mai departe.',
          'Deci decizia nu este între a avea internet și a nu avea. Este între a plăti acel supliment și a mută consumul mare pe un plan separat. La două săptămâni în care telefonul face navigație prin Creta, căutări de plaje și încărcat poze în fiecare seara, pragul se atinge mai ușor decât pare când îți faci bagajul.',
          'Dacă ai cartelă preplătită, verificarea este alta. Unele au roamingul inclus din oficiu, altele cer activarea unei opțiuni, câteva nu îl oferă deloc. Se lămurește înainte de plecare, nu în sala de sosiri din Atena.',
          'Iar dacă ai abonament obișnuit și pleci o săptămâna într-un hotel din Halkidiki, răspunsul este că nu îți trebuie nimic în plus. Nu avem niciun motiv să pretindem altceva.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Cosmote, Vodafone Greece și Nova acoperă țară. Atena, Salonic și insulele mari sunt bine acoperite, inclusiv majoritatea plajelor organizate.',
          'Insulele mici din Ciclade și Dodecanez, drumurile de munte din Creta și feriboturile între insule au goluri reale pe orice rețea.',
        ],
      },
      instalare: {
        heading: 'Când îl instalezi',
        body: [
          'Pe wifi, înainte de plecare. Aeroporturile grecești au wifi, feriboturile de la șase dimineața nu.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu îți da număr grecesc și nu primește SMS-uri. Pentru rezervări la taverne sau contact cu gazda de la cazare, numărul tău românesc funcționează oricum în UE.',
        ],
      },
    },
    faq: [
      { q: 'Am nevoie de eSIM în Grecia?', a: 'De obicei nu. Grecia este în UE și roamingul tău este inclus. Verifică totuși dacă ai cartelă preplătită fără opțiune de roaming.' },
      { q: 'Ce înseamnă utilizare rezonabilă?', a: 'Operatorul poate limita sau taxa suplimentar dacă folosești abonamentul aproape exclusiv în roaming pe o perioada lungă. Condițiile diferă de la operator la operator.' },
      { q: 'Merge pe insulele mici?', a: 'Pe cele mari da. Pe cele mici și pe feriboturi, cu goluri, indiferent de rețea sau de produs.' },
      { q: 'Un eSIM prinde mai bine pe feribot decât numărul meu?', a: 'Nu. Un eSIM de călătorie intră tot în rețelele grecești, aceleași pe care le prinde și roamingul tău. Unde nu e antena, nu e antena pentru niciunul.' },
    ],
  },

  'united-arab-emirates': {
    angle: 'Dubai este destinație de vacanță și de shopping pentru români, iar blocarea apelurilor VoIP este informația critica',
    h1: 'eSIM pentru Emirate',
    title: 'eSIM Dubai: citește întâi regulile despre apeluri',
    metaDescription: 'În Emirate apelurile prin WhatsApp și FaceTime sunt restricționate. Datele merg rapid. Află ce se aplică planului tău înainte să te bazezi pe el.',
    sectionOrder: ['intro', 'voip', 'costuri', 'acoperire', 'instalare', 'alternative', 'faq'],
    intro: [
      'Să fii online în Emiratele Arabe Unite este simplu. Dubai și Abu Dhabi au printre cele mai rapide rețele mobile din lume.',
      'Ce trebuie să știi înainte de plecare nu ține de viteză, ci de ce ai voie să faci cu conexiunea.',
    ],
    sections: {
      voip: {
        heading: 'Apelurile prin aplicații sunt restricționate',
        body: [
          'Emiratele restricționează apelurile de voce și video prin aplicații precum WhatsApp, FaceTime și Messenger în rețelele locale. Mesajele merg de obicei, apelurile de multe ori nu.',
          'Dacă un anumit eSIM de călătorie este afectat depinde de felul în care planul respectiv rutează traficul și se poate schimbă. Tratează cu rezervă orice pagină care îți promite apeluri WhatsApp nelimitate în Emirate. Inclusiv pe a noastră: scriem ce face un plan când putem verifică și scriem că nu știm când nu știm.',
          'Dacă depinzi de un apel acasă care chiar funcționează, planifică un apel telefonic normal, nu unul prin aplicație.',
        ],
      },
      costuri: {
        heading: 'De ce nu pur și simplu roaming',
        body: [
          'Emiratele sunt în afară oricărei zone de roaming inclusă în abonamentele românești. Pachetele zilnice către Golf sunt printre cele mai scumpe din lista de prețuri a oricărui operator.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Două rețele acoperă țară, Etisalat by e& și du. Ambele acoperă complet orașele, autostrăzile dintre ele, aeroporturile și rutele principale din deșert.',
          'Acoperirea în mall-uri și în metrou este proiectată, nu întâmplătoare, și se vede.',
        ],
      },
      instalare: {
        heading: 'Când îl instalezi',
        body: [
          'Înainte de zbor. Aeroportul din Dubai are wifi gratuit bun și unul dintre cele mai lungi trasee de la poarta până la control din lume. Să fii conectat pe drumul ăla chiar ajută.',
        ],
      },
      alternative: {
        heading: 'eSIM, cartelă de turist sau wifi la hotel',
        body: [
          'Ambii operatori vând pachete pentru vizitatori cu număr local, uneori incluse în anumite bilete de avion. Dacă ești acolo cu treabă și trebuie să fii sunat înapoi, merită coadă de la ghișeu.',
          'Pentru o vacanță în care telefonul e harta, camera foto și chat, un eSIM face treabă fără coadă și fără scanare de pașaport.',
        ],
      },
    },
    faq: [
      { q: 'Pot vorbi pe WhatsApp în Dubai?', a: 'Mesajele, pozele și mesajele vocale merg de obicei. Apelurile de voce și video sunt restricționate în rețelele locale. Nu conta pe ele.' },
      { q: 'Mă ajută un VPN?', a: 'Folosirea VPN în Emirate este sensibilă juridic și nu îți recomandăm să ocolești o reglementare națională. Planifică după regulile așa cum sunt.' },
      { q: 'Îmi ajunge wifi-ul de la hotel?', a: 'La hotel da. În taxi, la Marina, în deșert nu.' },
    ],
  },

  'united-kingdom': {
    angle: 'Pentru România, UK este și destinație de diaspora, nu doar turistică',
    h1: 'eSIM pentru Marea Britanie',
    title: 'eSIM Marea Britanie: ce s-a schimbat după Brexit pentru români',
    metaDescription: 'Marea Britanie nu mai este în zona de roaming UE. Unii operatori români o includ voluntar, alții nu. Verifică întâi, apoi decide.',
    sectionOrder: ['intro', 'verifică', 'confuzie', 'acoperire', 'instalare', 'alternative', 'faq'],
    intro: [
      'După ieșirea din piața unică, Marea Britanie nu mai intră automat în roamingul inclus. Unii operatori români au păstrat-o voluntar în zona lor europeană, alții nu.',
      'Asta face pagina asta scurtă. Primul pas nu este să cumperi, ci să te uiți în abonamentul tău.',
    ],
    sections: {
      verifica: {
        heading: 'Două minute care îți pot economisi produsul',
        body: [
          'Deschide lista de țări a opțiunii tale de roaming și caută Marea Britanie. Dacă este acolo, pentru un weekend la Londra nu îți trebuie nimic în plus.',
          'Dacă nu este, sau dacă operatorul a introdus o taxă zilnică, înmulțește taxa cu numărul zilelor. La patru zile de city break, un plan de date iese de obicei mai ieftin.',
        ],
      },
      confuzie: {
        heading: 'eSIM de date sau număr de Anglia',
        body: [
          'În România se caută mult și cartelă cu număr de Anglia, și are alt rost. Un număr +44 real primește SMS-uri de la bănci britanice, de la angajatori, de la agenții imobiliare și de la instituții.',
          'Un eSIM de călătorie nu face asta. Îți da internet cât ești acolo. Dacă ai nevoie de număr, îți trebuie cartelă cu număr, nu eSIM de date.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'EE, Vodafone UK, O2 și Three UK acoperă țară. Orașele, autostrăzile și liniile feroviare principale sunt bine acoperite. EE are istoric cea mai mare suprafața.',
          'Țara Galilor rurală, Highlands-ul scoțian și părți din sud-vest au zone moarte reale. Trenul Londra spre Edinburgh pierde semnalul de mai multe ori, pe orice rețea.',
        ],
      },
      instalare: {
        heading: 'Când îl instalezi',
        body: [
          'Înainte de plecare. Heathrow, Gatwick și Manchester au wifi gratuit. Stația St Pancras la coborârea din Eurostar și ieșirea de pe feribot, nu.',
        ],
      },
      alternative: {
        heading: 'eSIM, roaming sau cartelă britanică',
        body: [
          'O cartelă preplătită britanică este ieftină, se găsește în orice supermarket și îți da număr real. Pentru cine merge des sau sta săptămâni, aia este varianta.',
          'Pentru o deplasare scurtă cu un telefon care oricum funcționează, eSIM-ul este cel pe care îl pui de pe canapea.',
        ],
      },
    },
    faq: [
      { q: 'Merge roamingul meu în Marea Britanie?', a: 'Depinde de operator. Unii au păstrat-o voluntar în zona europeană, alții au introdus taxa zilnică. Verifică lista de țări a opțiunii tale.' },
      { q: 'Pot primi coduri SMS de la o bancă britanică?', a: 'Nu pe un eSIM de date. Pentru asta îți trebuie un număr +44 real.' },
      { q: 'Cum e semnalul în tren?', a: 'Lacunar pe orice rețea. Londra spre Edinburgh pierde semnalul de mai multe ori. Descarcă înainte ce îți trebuie.' },
    ],
  },

  'united-states': {
    angle: 'Pentru români, SUA înseamnă vacanță lungă sau vizită la familie, deci rețeaua contează mai mult decât gigabaiții',
    h1: 'eSIM pentru Statele Unite',
    title: 'eSIM SUA: contează rețeaua, nu numărul de gigabaiți',
    metaDescription: 'AT&T, T-Mobile și Verizon acoperă Statele Unite foarte diferit odată ce ieși de pe autostrăzi. Întrebarea utilă este pe ce rețea intră planul.',
    sectionOrder: ['intro', 'rețele', 'costuri', 'instalare', 'limite', 'alternative', 'faq'],
    intro: [
      'Statele Unite nu sunt o singură piață mobilă, ci trei rețele cu hărți serios diferite. Un plan impecabil în Manhattan poate fi inutil într-un parc național la patru ore distanță, iar motivul nu este aproape niciodată mărimea planului.',
      'Deci întrebarea utilă despre un eSIM pentru SUA nu este câți gigabaiți primești. Este pe ce rețea intri.',
    ],
    sections: {
      retele: {
        heading: 'Trei rețele, pe scurt și cinstit',
        body: [
          'Verizon și AT&T au cea mai mare acoperire în zonele rurale. T-Mobile US are cel mai bun 5G în orașe și a recuperat mult în rural, dar nu tot.',
          'Dacă traseul este New York, Chicago, Los Angeles și Las Vegas, oricare merge. Dacă este Utah, Montana sau porțiunile lungi și goale, diferența este între a avea hartă și a nu o avea.',
        ],
      },
      costuri: {
        heading: 'De ce nu abonamentul de acasă',
        body: [
          'Unele abonamente românești includ Statele Unite într-o opțiune extra-UE. Multe le includ contra unei taxe zilnice care, pe durata unei vacanțe lungi, depășește prețul unui plan de date.',
          'Verifică tariful zilnic înainte să presupui că roamingul este varianta simplă. La două săptămâni, socoteala nu este de obicei la limita.',
        ],
      },
      instalare: {
        heading: 'Când îl instalezi',
        body: [
          'Acasă, pe wifi, înainte de plecare. Aeroporturile americane au wifi gratuit care cere adresa de email și un portal de conectare. După un zbor transatlantic, este o bariera în plus.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu îți da număr american, iar în Statele Unite asta are o consecință concretă: foarte multe servicii de zi cu zi trimit SMS către un număr local. Aplicații de transport, livrare, liste de așteptare la restaurant, check-în la hotel.',
          'Majoritatea acceptă și numărul tău românesc. Nu toate.',
        ],
      },
      alternative: {
        heading: 'eSIM, roaming sau cartelă americană',
        body: [
          'O cartelă preplătită americană îți da număr real și date multe, dar te costă o vizită în magazin și o oră din prima zi. De la o lună în sus este afacerea mai bună.',
          'Pentru una sau două săptămâni, un eSIM pe care îl activezi pe pista merită diferență de preț.',
        ],
      },
    },
    faq: [
      { q: 'Merge în parcurile naționale?', a: 'La centrul de vizitare și pe drumul principal deseori, pe poteci rar. Nicio rețea nu acoperă zonele sălbatice. Descarcă hărți offline.' },
      { q: 'Contează 5G?', a: 'Pentru viteză în oraș da. Pentru dacă ai semnal în rural nu. Acolo decid benzile vechi, adică rețeaua.' },
      { q: 'Îmi ajunge wifi-ul de la hotel?', a: 'La hotel da. În mașina închiriată, în parc, la benzinăria din mijlocul pustiei nu.' },
    ],
  },

  egypt: {
    angle: 'Egipt este destinație de charter pentru români, cu roaming scump și rețele bune pe coastă',
    h1: 'eSIM pentru Egipt',
    title: 'eSIM Egipt: internet la Hurghada și Sharm fără factură mare',
    metaDescription: 'Egiptul este în afară roamingului UE. Pe coasta Mării Roșii rețelele sunt bune, în deșert nu. Un eSIM de călătorie costă mult mai puțin decât roamingul.',
    sectionOrder: ['intro', 'costuri', 'acoperire', 'instalare', 'limite', 'alternative', 'faq'],
    intro: [
      'Egiptul este una dintre destinațiile de charter clasice pentru turiștii din România și este complet în afară roamingului european. Telefonul funcționează, dar la tarifele de roaming internațional din abonamentul tău.',
      'Pentru un sejur de o săptămâna la Hurghada sau Sharm el-Sheikh, diferență dintre roaming și un plan de date este vizibilă pe factura următoare.',
    ],
    sections: {
      costuri: {
        heading: 'Roaming în Egipt',
        body: [
          'Egiptul intră la destinații extra-UE la toți operatorii români. În funcție de abonament vorbim de o taxă zilnică sau de un preț pe megabyte.',
          'Dacă stai la all inclusive și folosești wifi-ul hotelului, poate nu ai nevoie de nimic. Dacă faci excursii, ai nevoie.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Vodafone Egypt, Orange Egypt, Etisalat Misr și WE acoperă țară. Cairo, Alexandria, Luxor, Hurghada și Sharm el-Sheikh sunt bine acoperite, la fel și drumurile principale dintre ele.',
          'În deșert, pe drumurile către mănăstiri și în zonele de safari cu ATV, semnalul dispare. La fel și pe vapoarele de snorkeling, la distanță de coastă.',
        ],
      },
      instalare: {
        heading: 'Când îl instalezi',
        body: [
          'Pe wifi, acasă, înainte de plecare. Wifi-ul din aeroporturile egiptene există, dar nu te baza pe el când ai un transfer care te așteaptă.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu îți da număr egiptean. Pentru contactul cu ghidul sau cu transferul, numărul tău românesc funcționează normal la apeluri, cu tarifele de roaming aferente.',
        ],
      },
      alternative: {
        heading: 'eSIM, cartelă locală sau wifi la hotel',
        body: [
          'Cartelele locale pentru turiști se vând în aeroport și în stațiuni și sunt ieftine. Cer act de identitate și puțină răbdare.',
          'Wifi-ul din hotelurile mari este suficient pentru mesaje și apeluri video seara. Pentru hărți și traduceri în excursii, nu.',
        ],
      },
    },
    faq: [
      { q: 'Merge roamingul din România în Egipt?', a: 'Merge, dar la tarif extra-UE. Verifică opțiunea de roaming internațional din abonamentul tău înainte de plecare.' },
      { q: 'Am semnal în excursiile în deșert?', a: 'Aproape deloc. Semnalul urmează drumurile și stațiunile. Descarcă harta înainte.' },
      { q: 'Am nevoie de număr egiptean?', a: 'Pentru un sejur normal, nu. Pentru un număr local real ai nevoie de cartelă cu număr, nu de un eSIM de date.' },
    ],
  },

  thailand: {
    angle: 'Aici cartelă locală câștigă des, iar asta trebuie spus',
    h1: 'eSIM pentru Thailanda',
    title: 'eSIM Thailanda: când cartelă locală este mai bună decât noi',
    metaDescription: 'Cartelele de turist din Thailanda sunt ieftine și generoase. Un eSIM are sens în câteva cazuri concrete. Le spunem pe amândouă, cinstit.',
    sectionOrder: ['intro', 'cinstit', 'acoperire', 'instalare', 'limite', 'costuri', 'faq'],
    intro: [
      'Majoritatea paginilor de eSIM îți spun că o cartelă locală este bătaie de cap. În Thailanda asta este doar pe jumătate adevărat. AIS și TrueMove vând în ambele aeroporturi din Bangkok pachete de turist ieftine, cu număr thailandez și cu mai multe date decât consumă un om într-o lună.',
      'Așa că pagina asta începe cu argumentul împotriva noastră.',
    ],
    sections: {
      cinstit: {
        heading: 'Când cartelă thailandeză este mai bună',
        body: [
          'Dacă stai mai mult de două săptămâni, dacă vrei număr thailandez pentru Grab, livrare de mâncare și rezervări, sau dacă ții strâns de buget: ia cartelă locală. Pentru acea călătorie este produsul mai bun.',
          'Un eSIM câștigă când aterizezi târziu, când pleci mai departe în câteva zile, când combini Thailanda cu Vietnam și Cambodgia pe un singur plan, sau când pur și simplu nu vrei să stai prima jumătate de oră de vacanță la ghișeu cu pașaportul în mână.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'AIS și TrueMove H acoperă bine țară, inclusiv insulele care contează: Phuket, Samui, Phi Phi, Krabi. NT este mai subțire.',
          'Pe insulele mici și pe traversările cu barcă semnalul cade. Asta este geografie.',
        ],
      },
      instalare: {
        heading: 'Când îl instalezi',
        body: [
          'Pe wifi, înainte de plecare. Bangkok la unsprezece noaptea, cu coadă la taxi în fața, nu este momentul în care vrei să descoperi că a expirat codul QR.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu îți da număr thailandez. Aici contează mai mult decât de obicei, pentru că Grab, LINE și aproape toate aplicațiile de livrare sunt construite în jurul unui număr local. LINE este în Thailanda ce este WhatsApp în altă parte.',
        ],
      },
      costuri: {
        heading: 'Roaming din România',
        body: [
          'Thailanda este în afară oricărei zone incluse în abonamentele românești. Pachetele zilnice către Asia de Sud-Est sunt scumpe raportat la ce cumperi cu aceiași bani pe loc.',
        ],
      },
    },
    faq: [
      { q: 'Să iau pur și simplu cartelă de la aeroport?', a: 'Dacă stai două săptămâni sau mai mult și vrei număr thailandez, da. Preferăm să îți spunem asta decât să îți vindem produsul greșit.' },
      { q: 'Merge pe insule?', a: 'Pe Phuket, Samui și Krabi da. Pe insulele mici și pe feriboturi, cu goluri.' },
      { q: 'Un singur plan pentru Thailanda, Vietnam și Cambodgia?', a: 'Un plan regional pentru Asia de Sud-Est poate. Exact acolo un eSIM bate clar trei cartele locale.' },
    ],
  },

  bali: {
    angle: 'Pentru români Bali este vacanță lungă plus nomazi digitali',
    h1: 'eSIM pentru Bali',
    title: 'eSIM Bali: online înainte de coadă de la Denpasar',
    metaDescription: 'Cartelele indoneziene se înregistrează pe pașaport, iar ghișeele din Denpasar știu asta. Un eSIM te pune online înainte să ajungi la taxi.',
    sectionOrder: ['intro', 'înregistrare', 'acoperire', 'instalare', 'limite', 'alternative', 'faq'],
    intro: [
      'Bali are acoperire bună și o sosire enervantă. Cartelele preplătite indoneziene trebuie înregistrate pe pașaport, ghișeele din Denpasar știu că nu ai alternativă, iar coadă este exact între control și stația de taxiuri.',
      'Nu este o problemă de semnal. Este o problemă de fricțiune, și exact asta rezolvă un eSIM aici.',
    ],
    sections: {
      inregistrare: {
        heading: 'Ce înseamnă obligația de înregistrare',
        body: [
          'Indonezia cere ca numerele preplătite să fie înregistrate pe un act de identitate. Pentru un vizitator asta înseamnă pașaportul peste tejghea și așteptat până se introduce în sistem.',
          'Nu este periculos și nu este lent în principiu. Este lent la unsprezece noaptea, cu un avion plin înaintea ta.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Telkomsel are cea mai bună acoperire pe toată insula, inclusiv în nord și est. Indosat și XL sunt solide în sud, acolo unde stau majoritatea vizitatorilor.',
          'Canggu, Seminyak, Ubud și Uluwatu sunt bine acoperite. Sidemen, zona Munduk și drumul spre Kintamani nu constant.',
        ],
      },
      instalare: {
        heading: 'Când îl instalezi',
        body: [
          'Pe wifi, înainte de zbor. Wifi-ul din Denpasar funcționează, dar rostul acestui produs este să nu ai nevoie de el.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu îți da număr indonezian, iar asta contează pentru Gojek și Grab. Amândouă mișcă insula și amândouă preferă un număr local pentru contactul cu șoferul.',
        ],
      },
      alternative: {
        heading: 'eSIM, cartelă locală sau wifi la vila',
        body: [
          'Un pachet Telkomsel pentru turiști este ieftin și generos. Dacă stai o lună și lucrezi de acolo, probabil aia este varianta.',
          'Wifi-ul din vile și cafenele în sud este destul de bun încât mulți se descurcă cu el plus un plan mic de date.',
        ],
      },
    },
    faq: [
      { q: 'Trebuie să înregistrez eSIM-ul cu pașaportul?', a: 'Nu. Obligația de înregistrare se aplică numerelor preplătite indoneziene. Un eSIM de călătorie se conectează ca vizitator în rețea.' },
      { q: 'Merge în Ubud și în nord?', a: 'În Ubud da. În nord și pe drumurile de munte orice rețea este mai subțire, Telkomsel cel mai puțin.' },
      { q: 'Îmi ajunge ca să lucrez?', a: 'Pentru apeluri și email da, dacă planul permite hotspot. Pentru încărcări mari, wifi-ul de coworking din Canggu este mai rapid.' },
    ],
  },
};

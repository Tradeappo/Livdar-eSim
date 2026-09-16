// Piata romaneasca: roamingul in UE este inclus, deci valoarea unui eSIM apare
// aproape numai in afara UE. In plus, aici exista deja o categorie mentala
// puternica: "cartela SIM cu numar de X". Confuzia dintre un eSIM de date si o
// cartela cu numar strain este specifica acestei piete si trebuie lamurita pe
// fiecare pagina, altfel omul cumpara gresit.

export const destinations = {
  turkey: {
    angle: 'Turcia este destinatia de vacanta cu cel mai mare decalaj fata de roamingul UE',
    h1: 'eSIM pentru Turcia',
    title: 'eSIM Turcia: internet fara surprize si fara telefon blocat',
    metaDescription: 'Turcia nu este in zona de roaming UE, iar telefonul se blocheaza dupa patru luni daca folosesti o cartela turceasca. Un eSIM de calatorie evita ambele.',
    sectionOrder: ['intro', 'costuri', 'imei', 'confuzie', 'acoperire', 'instalare', 'faq'],
    intro: [
      'In Uniunea Europeana iti iei gigabaitii cu tine si nu se schimba nimic pe factura. La granita cu Turcia se schimba tot. Turcia nu este stat membru si nu este in Spatiul Economic European, deci roamingul inclus se opreste acolo.',
      'Acesta este primul motiv pentru un eSIM in Turcia. Al doilea tine de telefonul tau si il explicam mai jos, pentru ca putini il mentioneaza.',
    ],
    sections: {
      costuri: {
        heading: 'Cat costa de fapt roamingul in Turcia',
        body: [
          'Operatorii romani trateaza Turcia ca destinatie extra-UE. In functie de abonament asta inseamna o taxa pe zi, un mic pachet de date sau un pret pe megabyte care, la un comportament normal de vacanta, urca foarte repede.',
          'Verifica intai propriul abonament. Daca ai deja o optiune care include Turcia, nu ai nevoie de noi pentru doua saptamani la Antalya. Daca nu ai, inmulteste taxa zilnica cu numarul de zile. Rezultatul rareori este la limita.',
        ],
      },
      imei: {
        heading: 'Regula IMEI, pe care agentiile nu o spun',
        body: [
          'Turcia inregistreaza telefoanele straine folosite cu o cartela turceasca pe pasaportul persoanei care le inregistreaza. Fara inregistrare, telefonul este blocat in retelele turcesti dupa aproximativ patru luni.',
          'La o vacanta unica de obicei nu te prinde. Pe cine merge in fiecare an pe aceeasi coasta sau sta un sezon intreg, il prinde.',
          'Un eSIM de calatorie rezolva asta din constructie: esti vizitator in retea, nu abonat turc. Nu se inregistreaza nimic, deci nu expira nimic.',
        ],
      },
      confuzie: {
        heading: 'eSIM de date sau cartela cu numar de Turcia',
        body: [
          'Sunt doua produse diferite si merita spus clar, pentru ca in Romania se cauta des amandoua.',
          'Un eSIM de calatorie iti da internet. Nu iti da un numar cu prefix +90 si nu poate primi SMS-uri de la o banca turceasca, de la o aplicatie de livrare sau de la o institutie.',
          'Daca ai nevoie de un numar turcesc real care primeste coduri, iti trebuie o cartela cu numar, nu un eSIM de date. Iti spunem asta inainte, nu dupa.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Trei retele acopera tara: Turkcell, Vodafone Turkiye si Turk Telekom. Istanbul, Ankara, Izmir, Antalya si toata coasta egeeana si mediteraneana sunt bine acoperite.',
          'Cappadocia, provinciile din est si drumurile de munte sunt alta poveste. Semnalul urmeaza soselele principale si localitatile. Daca pleci la baloane la cinci dimineata, descarca harta inainte.',
        ],
      },
      instalare: {
        heading: 'Cand il instalezi',
        body: [
          'Acasa, pe wifi, si il lasi oprit. Il pornesti cand atinge avionul pista. Instalarea unui eSIM are nevoie de internet, iar momentul in care ai cea mai mare nevoie de internet este exact momentul in care nu ai.',
        ],
      },
    },
    faq: [
      { q: 'Roamingul meu din Romania merge in Turcia?', a: 'Nu ca in UE. Turcia este extra-UE, deci se aplica optiunea de roaming international din abonamentul tau, care difera de la operator la operator.' },
      { q: 'Mi se blocheaza telefonul in Turcia?', a: 'Nu cu un eSIM de calatorie. Regula IMEI se aplica telefoanelor folosite cu o cartela turceasca de abonat.' },
      { q: 'Primesc SMS de la banca pe eSIM?', a: 'Nu. Un eSIM de date nu are numar propriu. Pentru coduri prin SMS iti trebuie o cartela cu numar.' },
    ],
  },

  greece: {
    angle: 'Grecia este in UE, deci raspunsul cinstit este ca de obicei nu ai nevoie',
    h1: 'eSIM pentru Grecia',
    title: 'eSIM Grecia: cand chiar ai nevoie si cand nu',
    metaDescription: 'Grecia este in Uniunea Europeana, deci roamingul tau este inclus. Un eSIM are sens doar in cateva situatii concrete. Le enumeram pe toate.',
    sectionOrder: ['intro', 'cand', 'verificare', 'acoperire', 'instalare', 'limite', 'faq'],
    intro: [
      'Grecia este in Uniunea Europeana. Asta inseamna ca abonamentul tau romanesc functioneaza acolo cu gigabaitii inclusi, in limitele de utilizare rezonabila din contract.',
      'Pagina asta ar putea sa se opreasca aici, si pentru majoritatea oamenilor chiar se opreste. Mai jos sunt singurele situatii in care un eSIM chiar aduce ceva.',
    ],
    sections: {
      cand: {
        heading: 'Cele patru situatii in care are sens',
        body: [
          'Prima: ai o cartela preplatita fara optiune de roaming inclusa, si exista inca destule pe piata.',
          'A doua: ai depasit limita de utilizare rezonabila a abonamentului si operatorul a inceput sa taxeze suplimentar. Se intampla la sejururi lungi.',
          'A treia: circuit prin Grecia, Turcia si Balcani in aceeasi vacanta. Un plan regional acopera si partea din afara UE, unde abonamentul tau nu mai ajuta.',
          'A patra: vrei sa tii traficul de vacanta separat de numarul de serviciu. Motiv valid, chiar daca nu e despre bani.',
        ],
      },
      verificare: {
        heading: 'Ce cauti in propriul contract',
        body: [
          'Ca sa stii daca esti in vreuna dintre situatiile de mai sus, deschide sectiunea de roaming a abonamentului tau si uita-te dupa volumul de date pe care il ai in roaming. Nu dupa cel de acasa.',
          'Acolo apare surpriza. La abonamentele mari, si mai ales la cele nelimitate, volumul disponibil in roaming este o cifra separata si mai mica. Nu inseamna ca ramai fara internet la Rodos. Inseamna ca dupa pragul acela operatorul poate adauga un cost pe gigabait, plafonat prin reglementarea europeana, si serviciul merge mai departe.',
          'Deci decizia nu este intre a avea internet si a nu avea. Este intre a plati acel supliment si a muta consumul mare pe un plan separat. La doua saptamani in care telefonul face navigatie prin Creta, cautari de plaje si incarcat poze in fiecare seara, pragul se atinge mai usor decat pare cand iti faci bagajul.',
          'Daca ai cartela preplatita, verificarea este alta. Unele au roamingul inclus din oficiu, altele cer activarea unei optiuni, cateva nu il ofera deloc. Se lamureste inainte de plecare, nu in sala de sosiri din Atena.',
          'Iar daca ai abonament obisnuit si pleci o saptamana intr-un hotel din Halkidiki, raspunsul este ca nu iti trebuie nimic in plus. Nu avem niciun motiv sa pretindem altceva.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Cosmote, Vodafone Greece si Nova acopera tara. Atena, Salonic si insulele mari sunt bine acoperite, inclusiv majoritatea plajelor organizate.',
          'Insulele mici din Ciclade si Dodecanez, drumurile de munte din Creta si feriboturile intre insule au goluri reale pe orice retea.',
        ],
      },
      instalare: {
        heading: 'Cand il instalezi',
        body: [
          'Pe wifi, inainte de plecare. Aeroporturile grecesti au wifi, feriboturile de la sase dimineata nu.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu iti da numar grecesc si nu primeste SMS-uri. Pentru rezervari la taverne sau contact cu gazda de la cazare, numarul tau romanesc functioneaza oricum in UE.',
        ],
      },
    },
    faq: [
      { q: 'Am nevoie de eSIM in Grecia?', a: 'De obicei nu. Grecia este in UE si roamingul tau este inclus. Verifica totusi daca ai cartela preplatita fara optiune de roaming.' },
      { q: 'Ce inseamna utilizare rezonabila?', a: 'Operatorul poate limita sau taxa suplimentar daca folosesti abonamentul aproape exclusiv in roaming pe o perioada lunga. Conditiile difera de la operator la operator.' },
      { q: 'Merge pe insulele mici?', a: 'Pe cele mari da. Pe cele mici si pe feriboturi, cu goluri, indiferent de retea sau de produs.' },
      { q: 'Un eSIM prinde mai bine pe feribot decat numarul meu?', a: 'Nu. Un eSIM de calatorie intra tot in retelele grecesti, aceleasi pe care le prinde si roamingul tau. Unde nu e antena, nu e antena pentru niciunul.' },
    ],
  },

  'united-arab-emirates': {
    angle: 'Dubai este destinatie de vacanta si de shopping pentru romani, iar blocarea apelurilor VoIP este informatia critica',
    h1: 'eSIM pentru Emirate',
    title: 'eSIM Dubai: citeste intai regulile despre apeluri',
    metaDescription: 'In Emirate apelurile prin WhatsApp si FaceTime sunt restrictionate. Datele merg rapid. Afla ce se aplica planului tau inainte sa te bazezi pe el.',
    sectionOrder: ['intro', 'voip', 'costuri', 'acoperire', 'instalare', 'alternative', 'faq'],
    intro: [
      'Sa fii online in Emiratele Arabe Unite este simplu. Dubai si Abu Dhabi au printre cele mai rapide retele mobile din lume.',
      'Ce trebuie sa stii inainte de plecare nu tine de viteza, ci de ce ai voie sa faci cu conexiunea.',
    ],
    sections: {
      voip: {
        heading: 'Apelurile prin aplicatii sunt restrictionate',
        body: [
          'Emiratele restrictioneaza apelurile de voce si video prin aplicatii precum WhatsApp, FaceTime si Messenger in retelele locale. Mesajele merg de obicei, apelurile de multe ori nu.',
          'Daca un anumit eSIM de calatorie este afectat depinde de felul in care planul respectiv ruteaza traficul si se poate schimba. Trateaza cu rezerva orice pagina care iti promite apeluri WhatsApp nelimitate in Emirate. Inclusiv pe a noastra: scriem ce face un plan cand putem verifica si scriem ca nu stim cand nu stim.',
          'Daca depinzi de un apel acasa care chiar functioneaza, planifica un apel telefonic normal, nu unul prin aplicatie.',
        ],
      },
      costuri: {
        heading: 'De ce nu pur si simplu roaming',
        body: [
          'Emiratele sunt in afara oricarei zone de roaming inclusa in abonamentele romanesti. Pachetele zilnice catre Golf sunt printre cele mai scumpe din lista de preturi a oricarui operator.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Doua retele acopera tara, Etisalat by e& si du. Ambele acopera complet orasele, autostrazile dintre ele, aeroporturile si rutele principale din desert.',
          'Acoperirea in mall-uri si in metrou este proiectata, nu intamplatoare, si se vede.',
        ],
      },
      instalare: {
        heading: 'Cand il instalezi',
        body: [
          'Inainte de zbor. Aeroportul din Dubai are wifi gratuit bun si unul dintre cele mai lungi trasee de la poarta pana la control din lume. Sa fii conectat pe drumul ala chiar ajuta.',
        ],
      },
      alternative: {
        heading: 'eSIM, cartela de turist sau wifi la hotel',
        body: [
          'Ambii operatori vand pachete pentru vizitatori cu numar local, uneori incluse in anumite bilete de avion. Daca esti acolo cu treaba si trebuie sa fii sunat inapoi, merita coada de la ghiseu.',
          'Pentru o vacanta in care telefonul e harta, camera foto si chat, un eSIM face treaba fara coada si fara scanare de pasaport.',
        ],
      },
    },
    faq: [
      { q: 'Pot vorbi pe WhatsApp in Dubai?', a: 'Mesajele, pozele si mesajele vocale merg de obicei. Apelurile de voce si video sunt restrictionate in retelele locale. Nu conta pe ele.' },
      { q: 'Ma ajuta un VPN?', a: 'Folosirea VPN in Emirate este sensibila juridic si nu iti recomandam sa ocolesti o reglementare nationala. Planifica dupa regulile asa cum sunt.' },
      { q: 'Imi ajunge wifi-ul de la hotel?', a: 'La hotel da. In taxi, la Marina, in desert nu.' },
    ],
  },

  'united-kingdom': {
    angle: 'Pentru Romania, UK este si destinatie de diaspora, nu doar turistica',
    h1: 'eSIM pentru Marea Britanie',
    title: 'eSIM Marea Britanie: ce s-a schimbat dupa Brexit pentru romani',
    metaDescription: 'Marea Britanie nu mai este in zona de roaming UE. Unii operatori romani o includ voluntar, altii nu. Verifica intai, apoi decide.',
    sectionOrder: ['intro', 'verifica', 'confuzie', 'acoperire', 'instalare', 'alternative', 'faq'],
    intro: [
      'Dupa iesirea din piata unica, Marea Britanie nu mai intra automat in roamingul inclus. Unii operatori romani au pastrat-o voluntar in zona lor europeana, altii nu.',
      'Asta face pagina asta scurta. Primul pas nu este sa cumperi, ci sa te uiti in abonamentul tau.',
    ],
    sections: {
      verifica: {
        heading: 'Doua minute care iti pot economisi produsul',
        body: [
          'Deschide lista de tari a optiunii tale de roaming si cauta Marea Britanie. Daca este acolo, pentru un weekend la Londra nu iti trebuie nimic in plus.',
          'Daca nu este, sau daca operatorul a introdus o taxa zilnica, inmulteste taxa cu numarul zilelor. La patru zile de city break, un plan de date iese de obicei mai ieftin.',
        ],
      },
      confuzie: {
        heading: 'eSIM de date sau numar de Anglia',
        body: [
          'In Romania se cauta mult si cartela cu numar de Anglia, si are alt rost. Un numar +44 real primeste SMS-uri de la banci britanice, de la angajatori, de la agentii imobiliare si de la institutii.',
          'Un eSIM de calatorie nu face asta. Iti da internet cat esti acolo. Daca ai nevoie de numar, iti trebuie cartela cu numar, nu eSIM de date.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'EE, Vodafone UK, O2 si Three UK acopera tara. Orasele, autostrazile si liniile feroviare principale sunt bine acoperite. EE are istoric cea mai mare suprafata.',
          'Tara Galilor rurala, Highlands-ul scotian si parti din sud-vest au zone moarte reale. Trenul Londra spre Edinburgh pierde semnalul de mai multe ori, pe orice retea.',
        ],
      },
      instalare: {
        heading: 'Cand il instalezi',
        body: [
          'Inainte de plecare. Heathrow, Gatwick si Manchester au wifi gratuit. Statia St Pancras la coborarea din Eurostar si iesirea de pe feribot, nu.',
        ],
      },
      alternative: {
        heading: 'eSIM, roaming sau cartela britanica',
        body: [
          'O cartela preplatita britanica este ieftina, se gaseste in orice supermarket si iti da numar real. Pentru cine merge des sau sta saptamani, aia este varianta.',
          'Pentru o deplasare scurta cu un telefon care oricum functioneaza, eSIM-ul este cel pe care il pui de pe canapea.',
        ],
      },
    },
    faq: [
      { q: 'Merge roamingul meu in Marea Britanie?', a: 'Depinde de operator. Unii au pastrat-o voluntar in zona europeana, altii au introdus taxa zilnica. Verifica lista de tari a optiunii tale.' },
      { q: 'Pot primi coduri SMS de la o banca britanica?', a: 'Nu pe un eSIM de date. Pentru asta iti trebuie un numar +44 real.' },
      { q: 'Cum e semnalul in tren?', a: 'Lacunar pe orice retea. Londra spre Edinburgh pierde semnalul de mai multe ori. Descarca inainte ce iti trebuie.' },
    ],
  },

  'united-states': {
    angle: 'Pentru romani, SUA inseamna vacanta lunga sau vizita la familie, deci reteaua conteaza mai mult decat gigabaitii',
    h1: 'eSIM pentru Statele Unite',
    title: 'eSIM SUA: conteaza reteaua, nu numarul de gigabaiti',
    metaDescription: 'AT&T, T-Mobile si Verizon acopera Statele Unite foarte diferit odata ce iesi de pe autostrazi. Intrebarea utila este pe ce retea intra planul.',
    sectionOrder: ['intro', 'retele', 'costuri', 'instalare', 'limite', 'alternative', 'faq'],
    intro: [
      'Statele Unite nu sunt o singura piata mobila, ci trei retele cu harti serios diferite. Un plan impecabil in Manhattan poate fi inutil intr-un parc national la patru ore distanta, iar motivul nu este aproape niciodata marimea planului.',
      'Deci intrebarea utila despre un eSIM pentru SUA nu este cati gigabaiti primesti. Este pe ce retea intri.',
    ],
    sections: {
      retele: {
        heading: 'Trei retele, pe scurt si cinstit',
        body: [
          'Verizon si AT&T au cea mai mare acoperire in zonele rurale. T-Mobile US are cel mai bun 5G in orase si a recuperat mult in rural, dar nu tot.',
          'Daca traseul este New York, Chicago, Los Angeles si Las Vegas, oricare merge. Daca este Utah, Montana sau portiunile lungi si goale, diferenta este intre a avea harta si a nu o avea.',
        ],
      },
      costuri: {
        heading: 'De ce nu abonamentul de acasa',
        body: [
          'Unele abonamente romanesti includ Statele Unite intr-o optiune extra-UE. Multe le includ contra unei taxe zilnice care, pe durata unei vacante lungi, depaseste pretul unui plan de date.',
          'Verifica tariful zilnic inainte sa presupui ca roamingul este varianta simpla. La doua saptamani, socoteala nu este de obicei la limita.',
        ],
      },
      instalare: {
        heading: 'Cand il instalezi',
        body: [
          'Acasa, pe wifi, inainte de plecare. Aeroporturile americane au wifi gratuit care cere adresa de email si un portal de conectare. Dupa un zbor transatlantic, este o bariera in plus.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu iti da numar american, iar in Statele Unite asta are o consecinta concreta: foarte multe servicii de zi cu zi trimit SMS catre un numar local. Aplicatii de transport, livrare, liste de asteptare la restaurant, check-in la hotel.',
          'Majoritatea accepta si numarul tau romanesc. Nu toate.',
        ],
      },
      alternative: {
        heading: 'eSIM, roaming sau cartela americana',
        body: [
          'O cartela preplatita americana iti da numar real si date multe, dar te costa o vizita in magazin si o ora din prima zi. De la o luna in sus este afacerea mai buna.',
          'Pentru una sau doua saptamani, un eSIM pe care il activezi pe pista merita diferenta de pret.',
        ],
      },
    },
    faq: [
      { q: 'Merge in parcurile nationale?', a: 'La centrul de vizitare si pe drumul principal deseori, pe poteci rar. Nicio retea nu acopera zonele salbatice. Descarca harti offline.' },
      { q: 'Conteaza 5G?', a: 'Pentru viteza in oras da. Pentru daca ai semnal in rural nu. Acolo decid benzile vechi, adica reteaua.' },
      { q: 'Imi ajunge wifi-ul de la hotel?', a: 'La hotel da. In masina inchiriata, in parc, la benzinaria din mijlocul pustiei nu.' },
    ],
  },

  egypt: {
    angle: 'Egipt este destinatie de charter pentru romani, cu roaming scump si retele bune pe coasta',
    h1: 'eSIM pentru Egipt',
    title: 'eSIM Egipt: internet la Hurghada si Sharm fara factura mare',
    metaDescription: 'Egiptul este in afara roamingului UE. Pe coasta Marii Rosii retelele sunt bune, in desert nu. Un eSIM de calatorie costa mult mai putin decat roamingul.',
    sectionOrder: ['intro', 'costuri', 'acoperire', 'instalare', 'limite', 'alternative', 'faq'],
    intro: [
      'Egiptul este una dintre destinatiile de charter clasice pentru turistii din Romania si este complet in afara roamingului european. Telefonul functioneaza, dar la tarifele de roaming international din abonamentul tau.',
      'Pentru un sejur de o saptamana la Hurghada sau Sharm el-Sheikh, diferenta dintre roaming si un plan de date este vizibila pe factura urmatoare.',
    ],
    sections: {
      costuri: {
        heading: 'Roaming in Egipt',
        body: [
          'Egiptul intra la destinatii extra-UE la toti operatorii romani. In functie de abonament vorbim de o taxa zilnica sau de un pret pe megabyte.',
          'Daca stai la all inclusive si folosesti wifi-ul hotelului, poate nu ai nevoie de nimic. Daca faci excursii, ai nevoie.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Vodafone Egypt, Orange Egypt, Etisalat Misr si WE acopera tara. Cairo, Alexandria, Luxor, Hurghada si Sharm el-Sheikh sunt bine acoperite, la fel si drumurile principale dintre ele.',
          'In desert, pe drumurile catre manastiri si in zonele de safari cu ATV, semnalul dispare. La fel si pe vapoarele de snorkeling, la distanta de coasta.',
        ],
      },
      instalare: {
        heading: 'Cand il instalezi',
        body: [
          'Pe wifi, acasa, inainte de plecare. Wifi-ul din aeroporturile egiptene exista, dar nu te baza pe el cand ai un transfer care te asteapta.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu iti da numar egiptean. Pentru contactul cu ghidul sau cu transferul, numarul tau romanesc functioneaza normal la apeluri, cu tarifele de roaming aferente.',
        ],
      },
      alternative: {
        heading: 'eSIM, cartela locala sau wifi la hotel',
        body: [
          'Cartelele locale pentru turisti se vand in aeroport si in statiuni si sunt ieftine. Cer act de identitate si putina rabdare.',
          'Wifi-ul din hotelurile mari este suficient pentru mesaje si apeluri video seara. Pentru harti si traduceri in excursii, nu.',
        ],
      },
    },
    faq: [
      { q: 'Merge roamingul din Romania in Egipt?', a: 'Merge, dar la tarif extra-UE. Verifica optiunea de roaming international din abonamentul tau inainte de plecare.' },
      { q: 'Am semnal in excursiile in desert?', a: 'Aproape deloc. Semnalul urmeaza drumurile si statiunile. Descarca harta inainte.' },
      { q: 'Am nevoie de numar egiptean?', a: 'Pentru un sejur normal, nu. Pentru un numar local real ai nevoie de cartela cu numar, nu de un eSIM de date.' },
    ],
  },

  thailand: {
    angle: 'Aici cartela locala castiga des, iar asta trebuie spus',
    h1: 'eSIM pentru Thailanda',
    title: 'eSIM Thailanda: cand cartela locala este mai buna decat noi',
    metaDescription: 'Cartelele de turist din Thailanda sunt ieftine si generoase. Un eSIM are sens in cateva cazuri concrete. Le spunem pe amandoua, cinstit.',
    sectionOrder: ['intro', 'cinstit', 'acoperire', 'instalare', 'limite', 'costuri', 'faq'],
    intro: [
      'Majoritatea paginilor de eSIM iti spun ca o cartela locala este bataie de cap. In Thailanda asta este doar pe jumatate adevarat. AIS si TrueMove vand in ambele aeroporturi din Bangkok pachete de turist ieftine, cu numar thailandez si cu mai multe date decat consuma un om intr-o luna.',
      'Asa ca pagina asta incepe cu argumentul impotriva noastra.',
    ],
    sections: {
      cinstit: {
        heading: 'Cand cartela thailandeza este mai buna',
        body: [
          'Daca stai mai mult de doua saptamani, daca vrei numar thailandez pentru Grab, livrare de mancare si rezervari, sau daca tii strans de buget: ia cartela locala. Pentru acea calatorie este produsul mai bun.',
          'Un eSIM castiga cand aterizezi tarziu, cand pleci mai departe in cateva zile, cand combini Thailanda cu Vietnam si Cambodgia pe un singur plan, sau cand pur si simplu nu vrei sa stai prima jumatate de ora de vacanta la ghiseu cu pasaportul in mana.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'AIS si TrueMove H acopera bine tara, inclusiv insulele care conteaza: Phuket, Samui, Phi Phi, Krabi. NT este mai subtire.',
          'Pe insulele mici si pe traversarile cu barca semnalul cade. Asta este geografie.',
        ],
      },
      instalare: {
        heading: 'Cand il instalezi',
        body: [
          'Pe wifi, inainte de plecare. Bangkok la unsprezece noaptea, cu coada la taxi in fata, nu este momentul in care vrei sa descoperi ca a expirat codul QR.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu iti da numar thailandez. Aici conteaza mai mult decat de obicei, pentru ca Grab, LINE si aproape toate aplicatiile de livrare sunt construite in jurul unui numar local. LINE este in Thailanda ce este WhatsApp in alta parte.',
        ],
      },
      costuri: {
        heading: 'Roaming din Romania',
        body: [
          'Thailanda este in afara oricarei zone incluse in abonamentele romanesti. Pachetele zilnice catre Asia de Sud-Est sunt scumpe raportat la ce cumperi cu aceiasi bani pe loc.',
        ],
      },
    },
    faq: [
      { q: 'Sa iau pur si simplu cartela de la aeroport?', a: 'Daca stai doua saptamani sau mai mult si vrei numar thailandez, da. Preferam sa iti spunem asta decat sa iti vindem produsul gresit.' },
      { q: 'Merge pe insule?', a: 'Pe Phuket, Samui si Krabi da. Pe insulele mici si pe feriboturi, cu goluri.' },
      { q: 'Un singur plan pentru Thailanda, Vietnam si Cambodgia?', a: 'Un plan regional pentru Asia de Sud-Est poate. Exact acolo un eSIM bate clar trei cartele locale.' },
    ],
  },

  bali: {
    angle: 'Pentru romani Bali este vacanta lunga plus nomazi digitali',
    h1: 'eSIM pentru Bali',
    title: 'eSIM Bali: online inainte de coada de la Denpasar',
    metaDescription: 'Cartelele indoneziene se inregistreaza pe pasaport, iar ghiseele din Denpasar stiu asta. Un eSIM te pune online inainte sa ajungi la taxi.',
    sectionOrder: ['intro', 'inregistrare', 'acoperire', 'instalare', 'limite', 'alternative', 'faq'],
    intro: [
      'Bali are acoperire buna si o sosire enervanta. Cartelele preplatite indoneziene trebuie inregistrate pe pasaport, ghiseele din Denpasar stiu ca nu ai alternativa, iar coada este exact intre control si statia de taxiuri.',
      'Nu este o problema de semnal. Este o problema de frictiune, si exact asta rezolva un eSIM aici.',
    ],
    sections: {
      inregistrare: {
        heading: 'Ce inseamna obligatia de inregistrare',
        body: [
          'Indonezia cere ca numerele preplatite sa fie inregistrate pe un act de identitate. Pentru un vizitator asta inseamna pasaportul peste tejghea si asteptat pana se introduce in sistem.',
          'Nu este periculos si nu este lent in principiu. Este lent la unsprezece noaptea, cu un avion plin inaintea ta.',
        ],
      },
      acoperire: {
        heading: 'Acoperire',
        body: [
          'Telkomsel are cea mai buna acoperire pe toata insula, inclusiv in nord si est. Indosat si XL sunt solide in sud, acolo unde stau majoritatea vizitatorilor.',
          'Canggu, Seminyak, Ubud si Uluwatu sunt bine acoperite. Sidemen, zona Munduk si drumul spre Kintamani nu constant.',
        ],
      },
      instalare: {
        heading: 'Cand il instalezi',
        body: [
          'Pe wifi, inainte de zbor. Wifi-ul din Denpasar functioneaza, dar rostul acestui produs este sa nu ai nevoie de el.',
        ],
      },
      limite: {
        heading: 'Ce nu face un eSIM de date',
        body: [
          'Nu iti da numar indonezian, iar asta conteaza pentru Gojek si Grab. Amandoua misca insula si amandoua prefera un numar local pentru contactul cu soferul.',
        ],
      },
      alternative: {
        heading: 'eSIM, cartela locala sau wifi la vila',
        body: [
          'Un pachet Telkomsel pentru turisti este ieftin si generos. Daca stai o luna si lucrezi de acolo, probabil aia este varianta.',
          'Wifi-ul din vile si cafenele in sud este destul de bun incat multi se descurca cu el plus un plan mic de date.',
        ],
      },
    },
    faq: [
      { q: 'Trebuie sa inregistrez eSIM-ul cu pasaportul?', a: 'Nu. Obligatia de inregistrare se aplica numerelor preplatite indoneziene. Un eSIM de calatorie se conecteaza ca vizitator in retea.' },
      { q: 'Merge in Ubud si in nord?', a: 'In Ubud da. In nord si pe drumurile de munte orice retea este mai subtire, Telkomsel cel mai putin.' },
      { q: 'Imi ajunge ca sa lucrez?', a: 'Pentru apeluri si email da, daca planul permite hotspot. Pentru incarcari mari, wifi-ul de coworking din Canggu este mai rapid.' },
    ],
  },
};

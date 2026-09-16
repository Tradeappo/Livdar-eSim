// Pagini de regiune, piata romaneasca.
//
// Cititorul roman are deja roaming inclus in UE. Confuzia reala, si cea mai
// des cautata, este alta: diferenta dintre un eSIM de date si o cartela cu
// numar strain. Fiecare pagina de aici porneste de la asta, nu de la pretul
// gigabaitilor.
//
// Nu sunt traduceri ale paginilor engleze sau germane. Alta piata, alta intrebare.

export const regions = {
  europe: {
    angle: 'Trei tari din mijlocul Europei unde abonamentul tau se opreste',
    h1: 'eSIM pentru Europa',
    title: 'eSIM Europa: unde se opreste roamingul inclus',
    metaDescription:
      'In Uniunea Europeana nu ai nevoie de nimic. Conteaza unde se opreste abonamentul tau, iar asta se intampla chiar in mijlocul continentului.',
    sectionOrder: ['intro', 'ue', 'goluri', 'numar', 'decizie', 'faq'],
    intro: [
      'Pentru un abonament romanesc, Europa este in mare parte rezolvata. Roamingul la tarif national se aplica in toate statele Uniunii plus Islanda, Liechtenstein si Norvegia. Daca mergi in Grecia sau in Italia, nu ai nevoie sa cumperi nimic de la noi si preferam sa o spunem aici decat sa vindem pe langa.',
      'Interesant devine exact acolo unde regula se opreste. Iar ea nu se opreste la marginea continentului, ci in interiorul lui.',
    ],
    sections: {
      ue: {
        heading: 'Ce acopera deja abonamentul tau',
        body: [
          'Cele douazeci si sapte de state din Uniune, plus Islanda, Liechtenstein si Norvegia. Gigabaitii calatoresc cu tine, factura ramane aceeasi. Nu exista produs de calatorie mai ieftin decat inclus.',
          'Merita spus apasat, pentru ca o parte din cautarile romanesti despre eSIM sunt pentru destinatii unde pur si simplu nu trebuie cumparat nimic.',
        ],
      },
      goluri: {
        heading: 'Golurile care conteaza cu adevarat',
        body: [
          'Turcia este cea mai vizitata dintre ele si prima care apare in datele noastre. Nu este in Uniune, deci roamingul inclus se opreste la granita. Plus ca are o regula proprie de inregistrare a telefonului, despre care scriem separat pe pagina tarii.',
          'Albania, Serbia, Bosnia si Hertegovina, Macedonia de Nord si Muntenegru sunt in aceeasi situatie. Destinatii europene de vacanta, toate in afara zonei de roaming.',
          'Elvetia este cazul care surprinde cel mai des pe cineva care merge cu masina. Este inconjurata de zona de roaming fara sa faca parte din ea.',
          'Marea Britanie este al patrulea caz. Dupa Brexit, roamingul inclus nu mai este un drept, iar ce platesti depinde de operatorul britanic, nu de al tau.',
        ],
      },
      numar: {
        heading: 'Un eSIM de date nu iti da un numar strain',
        body: [
          'Aceasta este confuzia cea mai frecventa pe piata romaneasca si merita lamurita inainte de orice cumparare. Un eSIM de calatorie iti da internet, nu un numar de telefon din tara respectiva.',
          'Daca ai nevoie de un numar local, pentru un cod primit prin SMS sau pentru o firma la care suni des, acela este alt produs si se rezolva altfel. Daca ai nevoie doar de harta, mesagerie si rezervari, eSIM-ul de date este exact ce iti trebuie.',
          'Numarul tau romanesc ramane activ pe SIM-ul obisnuit pentru SMS-uri de la banca. Doar datele trec pe profilul nou.',
        ],
      },
      decizie: {
        heading: 'Cum decizi in mai putin de un minut',
        body: [
          'Nu numara tarile, numara zonele de tarifare de pe traseu. Un drum de la Bucuresti spre Croatia prin Serbia nu este o zona, sunt doua.',
          'Daca tot traseul ramane in Uniune, nu ai nevoie de nimic. Daca o singura tara este in afara, cumperi pentru tara aceea. Daca sunt mai multe, cum se intampla pe o ruta prin Balcani, merita un plan regional.',
        ],
      },
    },
    faq: [
      {
        q: 'Abonamentul meu romanesc merge in Turcia?',
        a: 'Nu la tarif national. Turcia nu face parte din zona de roaming a Uniunii, deci se aplica tarifele de roaming ale operatorului tau.',
      },
      {
        q: 'Am nevoie de ceva in interiorul Uniunii?',
        a: 'De obicei nu. Volumul tau national se aplica in toata Uniunea, plus Islanda, Liechtenstein si Norvegia, la acelasi pret.',
      },
      {
        q: 'Primesc un numar de telefon din tara in care merg?',
        a: 'Nu. Un eSIM de date iti da internet, nu un numar local. Numarul tau romanesc ramane pe cartela obisnuita.',
      },
      {
        q: 'Ce se intampla in Elvetia?',
        a: 'Este in afara zonei de roaming, desi este in mijlocul Europei. Cei care trec cu masina spre Italia observa asta abia pe factura.',
      },
    ],
  },

  asia: {
    angle: 'Continentul unde cartela locala este chiar mai ieftina',
    h1: 'eSIM pentru Asia',
    title: 'eSIM Asia: platesti comoditatea, nu economia',
    metaDescription:
      'Datele preplatite din Asia sunt mai ieftine decat orice produs de calatorie. Un eSIM il cumperi pentru aterizare, nu pentru pret.',
    sectionOrder: ['intro', 'local', 'aterizare', 'granite', 'practic', 'faq'],
    intro: [
      'In Asia raspunsul cinstit este incomod pentru oricine vinde eSIM de calatorie: cartela locala este mai ieftina in aproape toate tarile. In Thailanda, Vietnam sau Indonezia, o luna de internet generos costa mai putin decat o cafea la aeroportul de unde ai cumparat-o.',
      'Deci intrebarea nu este daca economisesti. Nu economisesti. Intrebarea este cat valoreaza prima ora dupa aterizare.',
    ],
    sections: {
      local: {
        heading: 'Ce face mai bine cartela locala',
        body: [
          'Pretul, si numarul. Un numar local conteaza mai mult in Asia decat in Europa, pentru ca aplicatiile de transport, livrarile de mancare si confirmarile de la hoteluri trimit frecvent un cod prin SMS catre o linie din tara.',
          'Daca stai mai mult si oricum ajungi intr-un oras, cartela locala este de obicei alegerea mai buna.',
        ],
      },
      aterizare: {
        heading: 'Ce face mai bine eSIM-ul de calatorie',
        body: [
          'Aterizarea. Instalezi de acasa, cobori din avion, esti conectat si chemi o masina. Fara ghiseu, fara formular, fara pasaport fotocopiat.',
          'Avantajul este cel mai clar in Japonia si Coreea de Sud, unde piata preplatita este facuta pentru rezidenti si pentru inchiriere, nu pentru turistul care vrea sa cumpere repede ceva.',
        ],
      },
      granite: {
        heading: 'Mai multe tari schimba socoteala',
        body: [
          'O cartela locala este un produs national. La granita urmatoare fie se opreste, fie devine scumpa. Cine leaga Bangkok, Siem Reap si Ho Chi Minh intr-o singura vacanta cumpara de trei ori sau o singura data regional.',
          'De la a doua tara incolo, socoteala inclina spre planul regional, nu din cauza pretului, ci din cauza repetarii.',
        ],
      },
      practic: {
        heading: 'Doua lucruri inainte de plecare',
        body: [
          'Verifica daca telefonul este blocat in reteaua operatorului. Un telefon blocat nu accepta alt profil, iar asta se afla mai bine acasa decat noaptea, intr-un aeroport.',
          'Verifica si ce servicii ai nevoie sa ajunga prin SMS pe numarul romanesc. Codurile de la banca vin pe numarul tau, nu pe profilul de date.',
        ],
      },
    },
    faq: [
      {
        q: 'Este eSIM-ul mai ieftin decat cartela locala in Asia?',
        a: 'Aproape niciodata. Datele preplatite locale sunt mai ieftine in majoritatea tarilor din regiune.',
      },
      {
        q: 'Primesc numar de telefon local?',
        a: 'Nu, cu un plan doar de date. Daca ai nevoie de numar pentru aplicatii de transport sau verificari, cumperi la fata locului.',
      },
      {
        q: 'Unde este cel mai greu sa cumperi pe loc?',
        a: 'In Japonia si Coreea de Sud, unde oferta preplatita este orientata spre rezidenti si spre inchiriere.',
      },
      {
        q: 'Merita un plan regional?',
        a: 'De la doua sau trei tari intr-o vacanta, da, altfel fiecare granita inseamna o cumparare noua.',
      },
    ],
  },

  'southeast-asia': {
    angle: 'Singura regiune unde chiar treci cinci granite intr-o vacanta',
    h1: 'eSIM pentru Asia de Sud-Est',
    title: 'eSIM Asia de Sud-Est: pentru trasee cu multe granite',
    metaDescription:
      'Patru sau cinci tari intr-o singura calatorie sunt normale aici. Exact pentru asta exista un plan regional.',
    sectionOrder: ['intro', 'traseu', 'local', 'acoperire', 'decizie', 'faq'],
    intro: [
      'Majoritatea planurilor regionale se vand cu un scenariu care rar se intampla. In Asia de Sud-Est se intampla. Doua luni prin Thailanda, Laos, Vietnam, Cambodgia si Malaezia este un traseu obisnuit aici, nu unul ambitios.',
      'Asta schimba complet socoteala. Cinci cumparari locale inseamna cinci inregistrari, cinci numere pe care nu le stie nimeni si cinci resturi de credit pe care nu le mai foloseste nimeni.',
    ],
    sections: {
      traseu: {
        heading: 'Numara granitele, nu tarile',
        body: [
          'O tara, doua saptamani: cumperi local si profiti de pret. Trei sau mai multe tari intr-o luna: plan regional si nu te mai gandesti.',
          'Cazul de mijloc este cu doua tari. Daca a doua este doar o escapada scurta, local iese mai ieftin. Daca este o saptamana in sine, planul regional castiga de obicei la efort, chiar daca pierde putin la pret.',
        ],
      },
      local: {
        heading: 'Cat costa de fapt local',
        body: [
          'Foarte putin, si asta face parte din adevar. Datele preplatite din Vietnam, Indonezia si Thailanda sunt atat de ieftine incat orice plan de calatorie arata prost pe hartie.',
          'Ce nu apare pe hartie este inregistrarea. Thailanda, Indonezia si Vietnam cer acte de identitate. Este o formalitate simpla cand ai timp si una enervanta cand ai un zbor de legatura.',
        ],
      },
      acoperire: {
        heading: 'Acoperirea nu este uniforma si nu pretindem ca este',
        body: [
          'In orase acoperirea este buna, uneori mai buna decat in mediul rural european. Bangkok, Kuala Lumpur, Singapore si Ho Chi Minh sunt dense si rapide.',
          'Pe insulele mici din Indonezia si Filipine, in parti din Laos si pe traseele montane din nordul Vietnamului este subtire sau inexistenta. Asta este valabil pentru orice profil, nu doar pentru al nostru.',
        ],
      },
      decizie: {
        heading: 'Cum decizi practic',
        body: [
          'Scrie traseul inainte sa te uiti la pret. Daca incape intr-o tara, ai o decizie de tara. Daca trece granite, ai una regionala.',
          'Si verifica blocarea in retea inainte sa zbori. Este cel mai frecvent motiv pentru care un profil perfect valid refuza sa se instaleze.',
        ],
      },
    },
    faq: [
      {
        q: 'De la cate tari merita un plan regional?',
        a: 'De la trei intr-o luna, clar. La doua este discutabil. La una, cumperi pentru tara aceea.',
      },
      {
        q: 'Este buna acoperirea pe insule?',
        a: 'Variabila, si niciun plan nu schimba asta. Insulele mari sunt acoperite, cele mici deseori nu.',
      },
      {
        q: 'Trebuie sa ma inregistrez pentru o cartela locala?',
        a: 'In majoritatea tarilor din regiune, da. Un eSIM de calatorie sare complet peste pasul acesta.',
      },
      {
        q: 'Primesc numar local in fiecare tara?',
        a: 'Nu. Planurile doar de date nu au numar nicaieri.',
      },
    ],
  },

  'north-america': {
    angle: 'Trei tari, trei facturi, fara plasa de siguranta europeana',
    h1: 'eSIM pentru America de Nord',
    title: 'eSIM America de Nord: trei tari, trei facturi',
    metaDescription:
      'Statele Unite, Canada si Mexic arata ca o singura calatorie si se factureaza ca trei. Pentru un abonament romanesc este cea mai scumpa regiune.',
    sectionOrder: ['intro', 'sua', 'granite', 'acoperire', 'viza', 'decizie', 'faq'],
    intro: [
      'America de Nord este regiunea in care roamingul iarta cel mai putin pentru un abonament romanesc. Nu exista o regula ca in Uniune pe care sa te bazezi. Ce platesti este ce a decis operatorul tau pentru alt continent.',
      'Pe harta arata ca o destinatie. Pe factura sunt trei.',
    ],
    sections: {
      sua: {
        heading: 'Statele Unite sunt o decizie separata',
        body: [
          'Retelele sunt dense si rapide, iar pentru vizitatori sunt scumpe. In orase si pe autostrazile interstatale acoperirea este excelenta. In interiorul continentului, in parcurile nationale si pe traseele lungi prin desert este mai subtire decat se asteapta lumea.',
          'Interesant este ca o mare parte din cautarile din regiune nu sunt despre acoperire, ci despre depanare: instalat, dar fara conexiune. Cauza este aproape intotdeauna o setare, nu produsul.',
        ],
      },
      granite: {
        heading: 'Canada si Mexic',
        body: [
          'Un plan pentru Statele Unite nu trece automat granita. Unele contracte americane includ Canada si Mexicul, multe nu.',
          'Daca vii din Europa si vizitezi doua din cele trei tari, esti exact in situatia pentru care exista planul regional.',
        ],
      },
      acoperire: {
        heading: 'La ce sa te astepti',
        body: [
          'Acoperirea din Canada urmeaza populatia, deci banda sudica si autostrazile. Mai la nord exista goluri geografice, nu comerciale.',
          'In Mexic, orasele, statiunile de pe coasta si drumurile principale sunt bine acoperite. Muntii si orasele mici din interior, mai putin.',
        ],
      },
      viza: {
        heading: 'Formalitatile de intrare cer conexiune inainte sa ai una',
        body: [
          'Pentru un pasaport romanesc, intrarea in Statele Unite se face cu autorizatie electronica obtinuta online inainte de plecare, iar Canada cere ceva echivalent pentru zbor. Ambele se rezolva de acasa, deci nu depind de conexiunea de acolo.',
          'Ce depinde este dupa aterizare. Adresa de cazare ceruta la control, confirmarea zborului intern, aplicatia companiei aeriene. Toate presupun ca ai internet inainte sa treci de ghiseu, iar acolo nu exista retea locala cumparata.',
          'Practic, asta inseamna ca profilul se instaleaza si se activeaza inainte de imbarcare, nu dupa. Este singurul moment din toata calatoria in care ordinea chiar conteaza.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'O tara, un plan de tara. Doua sau trei tari, un plan regional, pentru ca exact la granite se strica factura.',
          'Si descarca hartile inainte. In parcuri, offline este regula, nu exceptia.',
        ],
      },
    },
    faq: [
      {
        q: 'Un plan pentru Statele Unite merge si in Canada sau Mexic?',
        a: 'Nu automat. Unele contracte americane le includ, multe nu.',
      },
      {
        q: 'Am semnal in parcurile nationale?',
        a: 'Deseori nu, la niciun operator. Golurile din vestul american sunt geografice.',
      },
      {
        q: 'De ce se cauta atat de mult depanare?',
        a: 'Pentru ca baza instalata este mare, iar problema este de obicei o setare. Datele in roaming oprite sunt cauza cea mai frecventa.',
      },
      {
        q: 'Primesc un numar american?',
        a: 'Nu, cu un plan doar de date.',
      },
    ],
  },

  'south-america': {
    angle: 'Distante mari, granite reale, fara regula comuna',
    h1: 'eSIM pentru America de Sud',
    title: 'eSIM America de Sud: distante mari si granite reale',
    metaDescription:
      'Calatoriile prin America de Sud acopera distante mari si mai multe granite. Intre tari nu exista o regula comuna de roaming.',
    sectionOrder: ['intro', 'distante', 'granite', 'etape', 'decizie', 'faq'],
    intro: [
      'Traseele sud-americane sunt lungi. O luna inseamna aici de obicei trei sau patru tari si cateva zboruri interne, iar intre acoperire buna si lipsa totala de semnal sunt ore, nu minute.',
      'Combinatia dintre trasee lungi si granite reale este motivul pentru care conexiunea se planifica aici, nu se improvizeaza.',
    ],
    sections: {
      distante: {
        heading: 'Acoperirea urmeaza orasele, iar orasele sunt departe',
        body: [
          'Buenos Aires, Santiago, Lima, Bogota si orasele de pe coasta braziliana au acoperire buna. Anzii, bazinul Amazonului, Patagonia si drumurile lungi cu autocarul dintre ele, nu.',
          'Planifica offline. Descarca harta, salveaza biletul, fa captura de ecran cu adresa. Sfatul ramane valabil indiferent ce cumperi si de la cine.',
        ],
      },
      granite: {
        heading: 'Intre tari nu exista nicio intelegere comuna',
        body: [
          'Nu exista nimic echivalent cu regula europeana. Din Argentina in Chile sau din Peru in Bolivia inseamna alt operator si alta relatie comerciala.',
          'Pentru o singura tara, cumpararea locala este ieftina si simpla. Pe traseul clasic cu mai multe tari, cumpararile repetate si creditele ramase nefolosite se aduna mai repede decat sugereaza diferenta de pret.',
        ],
      },
      etape: {
        heading: 'Zboruri interne si autocare de noapte',
        body: [
          'Traseele de aici sunt facute din putine etape lungi, nu din multe scurte. Un autocar de noapte de la Lima la Cusco sau un zbor intern de la Buenos Aires la El Calafate sunt lucruri obisnuite, si ambele se petrec in mare parte in afara acoperirii.',
          'Practic, asta inseamna ca rezervarile, adresele si hartile se salveaza inainte de plecare. Cine se bazeaza ca verifica pe drum ramane fara date fix pe portiunea unde ar avea nevoie.',
          'Pentru cine are multe astfel de etape, intrebarea reala nu este ce plan cumpara, ci cat de bine si-a pregatit partea offline.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'O tara pana in doua saptamani: plan de tara. Doua sau mai multe tari, ori etape lungi pe uscat: plan regional.',
          'Si trateaza acoperirea ca pe o constrangere de planificare, nu ca pe o caracteristica de produs. Golurile sunt aceleasi pentru toata lumea.',
        ],
      },
    },
    faq: [
      {
        q: 'Exista roaming gratuit intre tarile sud-americane?',
        a: 'Nu. Nu exista un echivalent al regulii europene.',
      },
      {
        q: 'Am semnal in Patagonia sau in Amazon?',
        a: 'Frecvent nu, la niciun operator. Planifica ambele zone offline.',
      },
      {
        q: 'Brazilia intra intr-un plan pentru America de Sud?',
        a: 'De obicei da pe hartie. Ca piata, Brazilia se trateaza separat, pentru ca acolo se cauta cu alte cuvinte.',
      },
      {
        q: 'Mai bine cumpar la fata locului?',
        a: 'Pentru o singura tara, foarte probabil da. Pe un traseu cu mai multe tari, rar.',
      },
    ],
  },

  'central-america': {
    angle: 'Distante scurte, multe granite, aproape toate pe sosea',
    h1: 'eSIM pentru America Centrala',
    title: 'eSIM America Centrala: drumuri scurte, multe granite',
    metaDescription:
      'Sapte tari pe o distanta mica. Doua saptamani aici trec usor patru granite, si toate pe sosea.',
    sectionOrder: ['intro', 'geografie', 'uscat', 'acoperire', 'transfer', 'decizie', 'faq'],
    intro: [
      'America Centrala aduna sapte tari pe o distanta pe care o parcurgi cu masina in cateva zile. Doua saptamani ajung pentru Guatemala, Belize, Honduras, Nicaragua si Costa Rica, iar cea mai mare parte din drum se face pe sosea.',
      'Exact granitele terestre fac regiunea diferita. Nu treci printr-un aeroport care sa iti aminteasca faptul ca ai schimbat tara.',
    ],
    sections: {
      geografie: {
        heading: 'Distante mici, multi operatori',
        body: [
          'Pentru ca etapele sunt scurte, calatorii subestimeaza cate retele ating. O singura saptamana poate insemna trei retele nationale, fiecare cu tariful ei pentru vizitatori.',
          'Aici nu este atat despre pret, cat despre a nu te gandi la asta la fiecare bariera.',
        ],
      },
      uscat: {
        heading: 'De ce granitele terestre ies scump',
        body: [
          'O aterizare pe aeroport este un semnal clar ca trebuie sa cumperi ceva. O granita terestra nu este. Autocarul merge mai departe, telefonul se reconecteaza la alta retea, iar tarifarea porneste fara sa apara nimic pe ecran.',
          'Daca strabati regiunea pe sosea, lamureste conexiunea inainte de prima granita, nu dupa prima factura.',
        ],
      },
      acoperire: {
        heading: 'Cum arata acoperirea pe teren',
        body: [
          'Capitalele, coasta Pacificului si drumurile principale sunt bine acoperite. Partea dinspre Caraibe, zonele montane si orasele mici din interior sunt mai subtiri si difera de la operator la operator.',
          'Costa Rica si Panama stau cel mai bine. In zonele rurale din Guatemala, Honduras si Nicaragua e de asteptat sa fii offline pe portiuni.',
        ],
      },
      transfer: {
        heading: 'Transferuri, feriboturi si drumul inapoi spre aeroport',
        body: [
          'Traficul dintre tari se face aici cu microbuze private care leaga hostel de hostel si cu feriboturi mici, de exemplu spre Belize sau spre insulele Bahia. Ambele se confirma de obicei printr-un mesaj, nu printr-un bilet intr-o aplicatie.',
          'Asta face conexiunea permanenta mai utila decat pare intr-o regiune cu distante scurte. Cine confirma transferul seara are nevoie de semnal dimineata.',
          'Drumul inapoi spre aeroport este al doilea punct. San Jose, Panama City si Guatemala City sunt deseori la cateva ore de locul unde se termina vacanta, iar schimbarile de ora apar pe ultima suta de metri.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'O tara: plan de tara. Traseul clasic pe uscat: plan regional, pentru ca exact pentru asta a fost facut.',
          'Si ca peste tot: verifica daca telefonul este blocat in retea inainte sa pleci.',
        ],
      },
    },
    faq: [
      {
        q: 'Am nevoie de plan separat pentru fiecare tara?',
        a: 'Doar daca insisti sa cumperi local. Pe un traseu pe uscat inseamna mai multe cumparari in doua saptamani.',
      },
      {
        q: 'Se tarifeaza roaming la granitele terestre?',
        a: 'Da, si de obicei fara niciun semnal vizibil. Este motivul principal al surprizelor din regiune.',
      },
      {
        q: 'Care tari au cea mai buna acoperire?',
        a: 'Costa Rica si Panama. Cele mai subtiri sunt zonele rurale din Guatemala, Honduras si Nicaragua.',
      },
      {
        q: 'Merita un plan regional pentru o saptamana?',
        a: 'Doar daca saptamana aceea trece granite.',
      },
    ],
  },

  caribbean: {
    angle: 'Fiecare insula este o retea separata',
    h1: 'eSIM pentru Caraibe',
    title: 'eSIM Caraibe: fiecare insula, alta retea',
    metaDescription:
      'Insulele din Caraibe sunt piete de telecomunicatii separate chiar daca sunt la douazeci de minute de zbor una de alta.',
    sectionOrder: ['intro', 'insule', 'croaziera', 'acoperire', 'zboruri', 'decizie', 'faq'],
    intro: [
      'Caraibele arata intr-o brosura ca o singura destinatie si se comporta tehnic ca zeci de piete separate. Insule aflate la douazeci de minute de zbor sunt tari diferite, cu operatori diferiti si tarife diferite pentru vizitatori.',
      'Pentru o saptamana intr-o statiune, asta conteaza putin. Pentru oricine sare de pe o insula pe alta sau navigheaza, este intreaga intrebare.',
    ],
    sections: {
      insule: {
        heading: 'De ce saritul intre insule schimba raspunsul',
        body: [
          'O cartela cumparata in Barbados nu ajuta in Sfanta Lucia. Fiecare insula inseamna o cumparare noua sau o tarifare de roaming, iar salturile sunt suficient de scurte incat multi le fac de mai multe ori intr-o saptamana.',
          'Unii operatori regionali acopera mai multe insule sub aceeasi marca. Merita verificat daca insulele de pe traseul tau se intampla sa fie printre ele.',
        ],
      },
      croaziera: {
        heading: 'Pentru pasagerii de croaziera',
        body: [
          'Pe mare, telefonul se conecteaza la reteaua prin satelit a vasului, nu la vreo retea de pe insule. Niciun eSIM de calatorie nu acopera asta, iar tarifele de acolo sunt cele din povestile de groaza.',
          'Practic: datele oprite pe mare, pornite in port.',
        ],
      },
      acoperire: {
        heading: 'Acoperirea acolo unde chiar vei fi',
        body: [
          'Statiunile, porturile de croaziera si orasele principale de pe insulele mari sunt bine acoperite. Interiorul, insulitele si insulele mai linistite din est sunt variabile.',
          'Vremea conteaza aici mai mult decat oriunde. Infrastructura din zona uraganelor sufera avarii, iar refacerea ia timp.',
        ],
      },
      zboruri: {
        heading: 'Zborurile dintre insule sunt scurte si schimba totul',
        body: [
          'Companiile regionale leaga insulele in douazeci pana la patruzeci de minute. Tehnic, fiecare astfel de zbor este o schimbare de tara, de operator si de tarif, iar la o distanta atat de mica nimeni nu observa.',
          'Intarzierile si reprogramarile sunt frecvente pe rutele astea si se comunica prin mesaj. Exact atunci ai nevoie de semnal, si exact atunci ai aterizat pe o insula a carei retea nu ai cumparat-o.',
          'Cine viziteaza mai mult de doua insule fie cumpara de fiecare data, fie o data regional. Diferenta de pret este mai mica decat diferenta de efort.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'O insula, o saptamana: cumperi pentru insula aceea.',
          'Mai multe insule sau un traseu cu velierul: plan regional, altfel cumperi ceva nou la fiecare cateva zile.',
        ],
      },
    },
    faq: [
      {
        q: 'Un singur plan merge pe toate insulele?',
        a: 'Un plan regional este facut pentru asta. O cartela locala de pe o insula nu merge pe urmatoarea.',
      },
      {
        q: 'Merge eSIM-ul pe vasul de croaziera?',
        a: 'Nu. Pe mare esti in reteaua prin satelit a vasului, care se tarifeaza separat.',
      },
      {
        q: 'Acoperirea este afectata de furtuni?',
        a: 'Da. Este zona uraganelor, iar avariile de retea sunt reale.',
      },
      {
        q: 'Ce se intampla in interiorul insulelor?',
        a: 'Variaza. Statiunile si porturile sunt acoperite, insulitele deseori nu.',
      },
    ],
  },

  'middle-east': {
    angle: 'Retele excelente, dar aplicatiile de apeluri sunt capcana',
    h1: 'eSIM pentru Orientul Mijlociu',
    title: 'eSIM Orientul Mijlociu: datele merg, apelurile nu mereu',
    metaDescription:
      'Retelele din Golf sunt printre cele mai bune din lume. Intrebarea reala este daca aplicatiile tale de apeluri sunt permise acolo.',
    sectionOrder: ['intro', 'apeluri', 'golf', 'acoperire', 'decizie', 'faq'],
    intro: [
      'Orientul Mijlociu este una dintre cele mai bine conectate regiuni din lume. Retelele din Golf sunt rapide, moderne si dense, iar aeroporturile de acolo sunt printre cele mai bine acoperite de oriunde.',
      'Complicatia nu tine de acoperire, ci de servicii. Unele aplicatii pe care le folosesti zilnic acasa sunt restrictionate in anumite retele, iar asta este o chestiune de reglementare, nu una tehnica.',
    ],
    sections: {
      apeluri: {
        heading: 'Apelurile prin internet sunt lucrul de verificat',
        body: [
          'Mai multe tari din regiune restrictioneaza apelurile vocale si video prin internet in retelele locale. Mesageria de obicei functioneaza. Butonul de apel, nu intotdeauna.',
          'Ii prinde nepregatiti pe cei care presupun ca un plan de date inseamna automat ca pot suna acasa ca peste tot. Verifica situatia curenta pentru tara respectiva, pentru ca regulile se schimba si difera intre operatori.',
        ],
      },
      golf: {
        heading: 'Golful este o piata aparte',
        body: [
          'Dubaiul si Emiratele genereaza de departe cea mai mare cerere din regiune, iar cererea aceea este exprimata preponderent in engleza, inclusiv local.',
          'Acoperirea in Emirate, Qatar, Bahrain si Kuweit este excelenta, inclusiv in zonele de desert in care sunt dusi vizitatorii. Nu este o regiune unde sa te astepti sa fii offline.',
        ],
      },
      acoperire: {
        heading: 'Dincolo de Golf',
        body: [
          'Iordania, Israel si Oman au retele solide acolo unde ajung calatorii. In desert si in zonele montane devine mai subtire, ca peste tot.',
          'Turcia are pagina proprie si o regula proprie de inregistrare a telefonului, care nu are legatura cu acoperirea si care ramane cea mai importanta informatie din regiune.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'Pentru un singur oras din Golf, un plan de tara este suficient si reteaua nu te va dezamagi.',
          'Pentru un circuit, planul regional scuteste cumpararile repetate. In ambele cazuri, verifica restrictiile de apeluri inainte sa te bazezi pe ele.',
        ],
      },
    },
    faq: [
      {
        q: 'Pot suna prin WhatsApp sau FaceTime?',
        a: 'Depinde de tara si de retea. Mai multe tari din regiune restrictioneaza apelurile prin internet, lasand mesageria sa functioneze.',
      },
      {
        q: 'Este buna acoperirea in desert?',
        a: 'In Golf, surprinzator de buna, inclusiv pe traseele agentiilor. In afara lui, se subtiaza.',
      },
      {
        q: 'Am nevoie de araba?',
        a: 'Nu. Serviciile pentru vizitatori din Golf functioneaza in engleza.',
      },
      {
        q: 'Turcia intra la Orientul Mijlociu?',
        a: 'Depinde de plan. Regula de inregistrare a telefonului de acolo face pagina tarii utila oricum.',
      },
    ],
  },

  africa: {
    angle: 'Nordul este bine acoperit, restul foarte diferit',
    h1: 'eSIM pentru Africa',
    title: 'eSIM Africa: puternic in nord, inegal in rest',
    metaDescription:
      'Retelele nord-africane sunt bune si intens calatorite. Restul continentului variaza enorm, iar niciun plan nu schimba reteaua de pe teren.',
    sectionOrder: ['intro', 'nord', 'sud', 'realitate', 'viteza', 'decizie', 'faq'],
    intro: [
      'Africa nu este o singura piata de conectivitate, iar cine o trateaza asa ramane dezamagit. Un plan care insira patruzeci de tari iti vorbeste despre intelegeri comerciale, nu despre semnalul tau de la fata locului.',
      'Cererea pe care o masuram este concentrata, nu raspandita. Marocul si Egiptul aduna o parte foarte mare din ea, si vine in principal de la calatori europeni.',
    ],
    sections: {
      nord: {
        heading: 'Nordul Africii este partea la care se gandeste toata lumea',
        body: [
          'Marocul, Egiptul si Tunisia duc cea mai mare parte din traficul de vizitatori si au retelele potrivite. Orasele, zonele de statiuni si traseele turistice principale sunt acoperite solid.',
          'Niciuna dintre aceste tari nu face parte din vreo intelegere europeana de roaming. Exact de aceea exista cererea.',
        ],
      },
      sud: {
        heading: 'Africa de sud si de est',
        body: [
          'Africa de Sud, Kenya si Tanzania au retele urbane competente si piete de date mobile bine dezvoltate. Zonele de safari si parcurile nationale sunt altceva si se planifica offline.',
          'Cartelele preplatite locale sunt ieftine si usor de gasit acolo. Compromisul este cel obisnuit: pret si numar local contra unei aterizari deja conectate.',
        ],
      },
      realitate: {
        heading: 'Citeste lista de tari, nu numele continentului',
        body: [
          'Un plan vandut ca fiind pentru Africa se comporta complet diferit la Marrakech fata de zonele rurale din Zambia. Cinstit se cumpara verificand tarile concrete de pe traseu.',
          'Preferam sa iti spunem ca o tara este slab acoperita decat sa iti vindem un plan care sugereaza altceva.',
        ],
      },
      viteza: {
        heading: 'Lista nu spune nimic despre viteza',
        body: [
          'O enumerare de tari nu iti spune daca ajungi in reteaua moderna sau intr-o tehnologie mai veche. Pentru mesaje ajunge si una, si alta. Pentru navigatie si apeluri video, nu intotdeauna.',
          'Daca traseul tau cuprinde mai multe tari, verifica doua sau trei in care chiar petreci timp, nu toata lista. Restul nu conteaza pentru calatoria ta.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'Pentru Maroc, Egipt sau Tunisia separat, un plan de tara este raspunsul curat si acoperirea tine.',
          'Pentru un circuit, verifica daca fiecare tara care conteaza este cu adevarat acoperita si nu doar enumerata, si planifica etapele izolate ca fiind offline.',
        ],
      },
    },
    faq: [
      {
        q: 'De ce se cauta atat de mult Marocul?',
        a: 'Pentru ca este aproape de Europa, intens vizitat si in afara oricarei intelegeri europene de roaming.',
      },
      {
        q: 'Am semnal in safari?',
        a: 'Deseori nu, si tine de retea, nu de produs. Planifica zilele acelea offline.',
      },
      {
        q: 'Cartela locala este o optiune buna in Africa?',
        a: 'In Kenya, Tanzania si Africa de Sud este ieftina si simpla. Costul este inregistrarea la sosire.',
      },
      {
        q: 'Un plan pentru tot continentul chiar merge peste tot?',
        a: 'Merge unde exista intelegeri, ceea ce nu inseamna peste tot.',
      },
    ],
  },

  oceania: {
    angle: 'Distante uriase si foarte putini operatori',
    h1: 'eSIM pentru Oceania',
    title: 'eSIM Oceania: distante mari, putine retele, goluri reale',
    metaDescription:
      'Australia si Noua Zeelanda au retele urbane bune si portiuni lungi fara niciun semnal. Conteaza mai mult unde esti decat ce plan ai.',
    sectionOrder: ['intro', 'australia', 'noua-zeelanda', 'insule', 'decizie', 'faq'],
    intro: [
      'In Oceania, diferenta dintre harta de acoperire si traseul real este cea mai mare. Retelele din Australia si Noua Zeelanda sunt moderne si rapide acolo unde exista, si complet absente pe distante care se parcurg in ore.',
      'Sunt si foarte putini operatori. Asta inseamna mai putina concurenta de pret decat in Europa si inseamna ca diferentele dintre produse sunt mai mici decat diferentele dintre locuri.',
    ],
    sections: {
      australia: {
        heading: 'Australia este intai o problema de acoperire',
        body: [
          'Acoperirea urmeaza coasta si populatia. Sydney, Melbourne, Brisbane, Perth si coridoarele dintre ele sunt bine acoperite. Interiorul nu, iar diferenta nu este mica.',
          'Daca traseul include outback, etape lungi pe autostrada sau partile mai putin vizitate din Australia de Vest si Teritoriul de Nord, asteapta-te la perioade lungi fara semnal la orice operator.',
        ],
      },
      'noua-zeelanda': {
        heading: 'Noua Zeelanda',
        body: [
          'Proportional mai bine decat Australia, pentru ca tara este mai mica, dar tiparul este acelasi. Orasele si drumurile principale sunt acoperite, zonele alpine si Fiordland nu.',
          'Traseele de drumetie se planifica integral offline. Descarca hartile si spune-i cuiva pe unde mergi.',
        ],
      },
      insule: {
        heading: 'Insulele din Pacific',
        body: [
          'Fiji, Samoa, Tonga si statele insulare mai mici au retele limitate si intelegeri de roaming limitate. Un plan care spune Oceania s-ar putea sa le includa doar pe hartie.',
          'Daca traseul tau trece pe acolo, verifica-le individual. Aici afirmatiile generale despre acoperire sunt cel mai putin de incredere.',
          'Se adauga si faptul ca distantele dintre insule sunt mari, iar legaturile rare. De la Fiji la Samoa poti fi pe drum o zi intreaga, deseori cu escala, iar confirmarile vin pe ultima suta de metri.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'Australia si Noua Zeelanda impreuna este traseul obisnuit si cazul in care un plan regional este clar util, pentru ca cele doua tari au retele separate.',
          'O singura tara inseamna plan de tara. Si in ambele cazuri, golurile de acoperire intra in planificare, nu in alegerea produsului.',
        ],
      },
    },
    faq: [
      {
        q: 'Am semnal in outback-ul australian?',
        a: 'De obicei nu. Golurile sunt geografice si privesc orice operator.',
      },
      {
        q: 'Un plan acopera si Australia, si Noua Zeelanda?',
        a: 'Un plan regional este facut pentru asta. Unul de tara nu te urmeaza peste granita.',
      },
      {
        q: 'Insulele din Pacific sunt incluse?',
        a: 'Deseori doar formal. Verifica Fiji, Samoa si Tonga separat.',
      },
      {
        q: 'Cartela locala este mai ieftina?',
        a: 'In Australia si Noua Zeelanda este competitiva si usor de cumparat.',
      },
    ],
  },

  balkans: {
    angle: 'Partea din Europa unde se opreste zona de roaming, la doi pasi de casa',
    h1: 'eSIM pentru Balcani',
    title: 'eSIM Balcani: in Europa, in afara zonei de roaming',
    metaDescription:
      'Serbia, Albania, Bosnia, Macedonia de Nord si Muntenegru sunt in Europa si in afara roamingului inclus. De aici vine toata cererea.',
    sectionOrder: ['intro', 'linia', 'rute', 'acoperire', 'decizie', 'faq'],
    intro: [
      'Balcanii sunt exemplul cel mai clar de regiune europeana geografic si separata comercial. Croatia, Slovenia, Grecia si Bulgaria sunt in zona de roaming. Albania, Serbia, Bosnia si Hertegovina, Macedonia de Nord si Muntenegru nu sunt.',
      'Pentru un roman, asta conteaza mai mult decat pentru aproape oricine altcineva, pentru ca Serbia incepe la o ora de Timisoara si pentru ca drumul spre mare trece deseori prin ea.',
    ],
    sections: {
      linia: {
        heading: 'Cine pe ce parte este',
        body: [
          'In zona, deci gratuit pe un abonament romanesc: Croatia, Slovenia, Grecia, Bulgaria si Ungaria. In afara, deci tarifat: Albania, Serbia, Bosnia si Hertegovina, Macedonia de Nord si Muntenegru.',
          'Aceasta este informatia cea mai utila de pe pagina. Cele mai multe trasee prin Balcani ating ambele parti.',
        ],
      },
      rute: {
        heading: 'Rutele pe care chiar te costa',
        body: [
          'Drumul spre Grecia prin Serbia si Macedonia de Nord trece linia de doua ori. La fel si vacantele pe litoralul din Muntenegru sau Albania, ambele ajunse destinatii obisnuite de vara pentru romani.',
          'Cine merge cu masina observa cel mai greu, pentru ca nu exista niciun moment care sa semnaleze schimbarea. Doar factura de la intoarcere.',
        ],
      },
      acoperire: {
        heading: 'Acoperirea este mai buna decat reputatia',
        body: [
          'Retelele din regiune sunt moderne, iar orasele sunt bine acoperite. Coasta albaneza, Belgradul, Sarajevo, Skopje si Podgorica nu te lasa descoperit.',
          'Se subtiaza in munti, iar muntii sunt un motiv important de calatorie aici. Planifica zilele de drumetie offline.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'Daca traseul ramane in partea din Uniune, nu ai nevoie de nimic. Daca intra in Serbia, Albania, Bosnia, Macedonia de Nord sau Muntenegru, etapa aceea trebuie acoperita.',
          'Daca linia se trece de mai multe ori, un plan regional scuteste cumpararea la fiecare granita. Pentru o singura tara din afara zonei, un plan de tara este mai ieftin.',
        ],
      },
    },
    faq: [
      {
        q: 'Ce tari din Balcani intra in roamingul inclus?',
        a: 'Croatia, Slovenia, Grecia, Bulgaria si Ungaria. Albania, Serbia, Bosnia si Hertegovina, Macedonia de Nord si Muntenegru nu.',
      },
      {
        q: 'Merge abonamentul meu in Serbia?',
        a: 'Nu la tarif national. Serbia este in afara zonei, desi este tara vecina.',
      },
      {
        q: 'Dar pe drumul spre Grecia?',
        a: 'Grecia este in zona, dar daca ajungi acolo prin Serbia si Macedonia de Nord, treci de doua ori prin afara ei.',
      },
      {
        q: 'Acoperirea este sigura in munti?',
        a: 'Mai putin, iar muntii sunt un motiv principal de vizita. Planifica drumetiile offline.',
      },
    ],
  },
};

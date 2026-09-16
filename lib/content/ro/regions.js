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
    angle: 'Trei țări din mijlocul Europei unde abonamentul tău se oprește',
    h1: 'eSIM pentru Europa',
    title: 'eSIM Europa: unde se oprește roamingul inclus',
    metaDescription:
      'În Uniunea Europeană nu ai nevoie de nimic. Contează unde se oprește abonamentul tău, iar asta se întâmplă chiar în mijlocul continentului.',
    sectionOrder: ['intro', 'ue', 'goluri', 'număr', 'decizie', 'faq'],
    intro: [
      'Pentru un abonament românesc, Europa este în mare parte rezolvată. Roamingul la tarif național se aplică în toate statele Uniunii plus Islanda, Liechtenstein și Norvegia. Dacă mergi în Grecia sau în Italia, nu ai nevoie să cumperi nimic de la noi și preferăm să o spunem aici decât să vindem pe lângă.',
      'Interesant devine exact acolo unde regula se oprește. Iar ea nu se oprește la marginea continentului, ci în interiorul lui.',
    ],
    sections: {
      ue: {
        heading: 'Ce acoperă deja abonamentul tău',
        body: [
          'Cele douăzeci și șapte de state din Uniune, plus Islanda, Liechtenstein și Norvegia. Gigabaiții călătoresc cu ține, factura rămâne aceeași. Nu există produs de călătorie mai ieftin decât inclus.',
          'Merită spus apăsat, pentru că o parte din căutările românești despre eSIM sunt pentru destinații unde pur și simplu nu trebuie cumpărat nimic.',
        ],
      },
      goluri: {
        heading: 'Golurile care contează cu adevărat',
        body: [
          'Turcia este cea mai vizitată dintre ele și prima care apare în datele noastre. Nu este în Uniune, deci roamingul inclus se oprește la graniță. Plus că are o regulă proprie de înregistrare a telefonului, despre care scriem separat pe pagina țării.',
          'Albania, Serbia, Bosnia și Herțegovina, Macedonia de Nord și Muntenegru sunt în aceeași situație. Destinații europene de vacanță, toate în afară zonei de roaming.',
          'Elveția este cazul care surprinde cel mai des pe cineva care merge cu mașina. Este înconjurată de zona de roaming fără să facă parte din ea.',
          'Marea Britanie este al patrulea caz. După Brexit, roamingul inclus nu mai este un drept, iar ce plătești depinde de operatorul britanic, nu de al tău.',
        ],
      },
      numar: {
        heading: 'Un eSIM de date nu îți da un număr străin',
        body: [
          'Aceasta este confuzia cea mai frecvența pe piața românească și merită lămurită înainte de orice cumpărare. Un eSIM de călătorie îți da internet, nu un număr de telefon din țară respectivă.',
          'Dacă ai nevoie de un număr local, pentru un cod primit prin SMS sau pentru o firmă la care suni des, acela este alt produs și se rezolvă altfel. Dacă ai nevoie doar de hartă, mesagerie și rezervări, eSIM-ul de date este exact ce îți trebuie.',
          'Numărul tău românesc rămâne activ pe SIM-ul obișnuit pentru SMS-uri de la bancă. Doar datele trec pe profilul nou.',
        ],
      },
      decizie: {
        heading: 'Cum decizi în mai puțin de un minut',
        body: [
          'Nu numără țările, numără zonele de tarifare de pe traseu. Un drum de la Bucuresti spre Croația prin Serbia nu este o zonă, sunt două.',
          'Dacă tot traseul rămâne în Uniune, nu ai nevoie de nimic. Dacă o singură țară este în afară, cumperi pentru țară aceea. Dacă sunt mai multe, cum se întâmplă pe o ruta prin Balcanii, merită un plan regional.',
        ],
      },
    },
    faq: [
      {
        q: 'Abonamentul meu românesc merge în Turcia?',
        a: 'Nu la tarif național. Turcia nu face parte din zona de roaming a Uniunii, deci se aplică tarifele de roaming ale operatorului tău.',
      },
      {
        q: 'Am nevoie de ceva în interiorul Uniunii?',
        a: 'De obicei nu. Volumul tău național se aplică în toată Uniunea, plus Islanda, Liechtenstein și Norvegia, la același preț.',
      },
      {
        q: 'Primesc un număr de telefon din țară în care merg?',
        a: 'Nu. Un eSIM de date îți da internet, nu un număr local. Numărul tău românesc rămâne pe cartelă obișnuită.',
      },
      {
        q: 'Ce se întâmplă în Elveția?',
        a: 'Este în afară zonei de roaming, deși este în mijlocul Europei. Cei care trec cu mașina spre Italia observă asta abia pe factură.',
      },
    ],
  },

  asia: {
    angle: 'Continentul unde cartelă locală este chiar mai ieftină',
    h1: 'eSIM pentru Asia',
    title: 'eSIM Asia: plătești comoditatea, nu economia',
    metaDescription:
      'Datele preplătite din Asia sunt mai ieftine decât orice produs de călătorie. Un eSIM îl cumperi pentru aterizare, nu pentru preț.',
    sectionOrder: ['intro', 'local', 'aterizare', 'granițe', 'practic', 'faq'],
    intro: [
      'În Asia răspunsul cinstit este incomod pentru oricine vinde eSIM de călătorie: cartelă locală este mai ieftină în aproape toate țările. În Thailanda, Vietnam sau Indonezia, o lună de internet generos costă mai puțin decât o cafea la aeroportul de unde ai cumpărat-o.',
      'Deci întrebarea nu este dacă economisești. Nu economisești. Întrebarea este cât valorează prima oră după aterizare.',
    ],
    sections: {
      local: {
        heading: 'Ce face mai bine cartelă locală',
        body: [
          'Prețul, și numărul. Un număr local contează mai mult în Asia decât în Europa, pentru că aplicațiile de transport, livrările de mâncare și confirmările de la hoteluri trimit frecvent un cod prin SMS către o linie din țară.',
          'Dacă stai mai mult și oricum ajungi într-un oraș, cartelă locală este de obicei alegerea mai bună.',
        ],
      },
      aterizare: {
        heading: 'Ce face mai bine eSIM-ul de călătorie',
        body: [
          'Aterizarea. Instalezi de acasă, cobori din avion, ești conectat și chemi o mașina. Fără ghișeu, fără formular, fără pașaport fotocopiat.',
          'Avantajul este cel mai clar în Japonia și Coreea de Sud, unde piața preplătită este făcută pentru rezidenți și pentru închiriere, nu pentru turistul care vrea să cumpere repede ceva.',
        ],
      },
      granite: {
        heading: 'Mai multe țări schimbă socoteala',
        body: [
          'O cartelă locală este un produs național. La graniță următoare fie se oprește, fie devine scumpă. Cine leagă Bangkok, Siem Reap și Ho Chi Minh într-o singură vacanță cumpără de trei ori sau o singură dată regional.',
          'De la a două țară încolo, socoteala înclină spre planul regional, nu din cauza prețului, ci din cauza repetării.',
        ],
      },
      practic: {
        heading: 'Două lucruri înainte de plecare',
        body: [
          'Verifică dacă telefonul este blocat în rețeaua operatorului. Un telefon blocat nu acceptă alt profil, iar asta se află mai bine acasă decât noaptea, într-un aeroport.',
          'Verifică și ce servicii ai nevoie să ajungă prin SMS pe numărul românesc. Codurile de la bancă vin pe numărul tău, nu pe profilul de date.',
        ],
      },
    },
    faq: [
      {
        q: 'Este eSIM-ul mai ieftin decât cartelă locală în Asia?',
        a: 'Aproape niciodată. Datele preplătite locale sunt mai ieftine în majoritatea țărilor din regiune.',
      },
      {
        q: 'Primesc număr de telefon local?',
        a: 'Nu, cu un plan doar de date. Dacă ai nevoie de număr pentru aplicații de transport sau verificări, cumperi la fața locului.',
      },
      {
        q: 'Unde este cel mai greu să cumperi pe loc?',
        a: 'În Japonia și Coreea de Sud, unde oferta preplătită este orientată spre rezidenți și spre închiriere.',
      },
      {
        q: 'Merită un plan regional?',
        a: 'De la două sau trei țări într-o vacanță, da, altfel fiecare graniță înseamnă o cumpărare nouă.',
      },
    ],
  },

  'southeast-asia': {
    angle: 'Singura regiune unde chiar treci cinci granițe într-o vacanță',
    h1: 'eSIM pentru Asia de Sud-Est',
    title: 'eSIM Asia de Sud-Est: pentru trasee cu multe granițe',
    metaDescription:
      'Patru sau cinci țări într-o singură călătorie sunt normale aici. Exact pentru asta există un plan regional.',
    sectionOrder: ['intro', 'traseu', 'local', 'acoperire', 'decizie', 'faq'],
    intro: [
      'Majoritatea planurilor regionale se vând cu un scenariu care rar se întâmplă. În Asia de Sud-Est se întâmplă. Două luni prin Thailanda, Laos, Vietnam, Cambodgia și Malaezia este un traseu obișnuit aici, nu unul ambitios.',
      'Asta schimbă complet socoteala. Cinci cumpărări locale înseamnă cinci înregistrări, cinci numere pe care nu le știe nimeni și cinci resturi de credit pe care nu le mai folosește nimeni.',
    ],
    sections: {
      traseu: {
        heading: 'Numără granițele, nu țările',
        body: [
          'O țară, două săptămâni: cumperi local și profiți de preț. Trei sau mai multe țări într-o lună: plan regional și nu te mai gândești.',
          'Cazul de mijloc este cu două țări. Dacă a două este doar o escapada scurtă, local iese mai ieftin. Dacă este o săptămâna în sine, planul regional câștigă de obicei la efort, chiar dacă pierde puțin la preț.',
        ],
      },
      local: {
        heading: 'Cât costă de fapt local',
        body: [
          'Foarte puțin, și asta face parte din adevăr. Datele preplătite din Vietnam, Indonezia și Thailanda sunt atât de ieftine încât orice plan de călătorie arată prost pe hârtie.',
          'Ce nu apare pe hârtie este înregistrarea. Thailanda, Indonezia și Vietnam cer acte de identitate. Este o formalitate simplă când ai timp și una enervantă când ai un zbor de legătura.',
        ],
      },
      acoperire: {
        heading: 'Acoperirea nu este uniformă și nu pretindem că este',
        body: [
          'În orașe acoperirea este bună, uneori mai bună decât în mediul rural european. Bangkok, Kuala Lumpur, Singapore și Ho Chi Minh sunt dense și rapide.',
          'Pe insulele mici din Indonezia și Filipine, în părți din Laos și pe traseele montane din nordul Vietnamului este subțire sau inexistentă. Asta este valabil pentru orice profil, nu doar pentru al nostru.',
        ],
      },
      decizie: {
        heading: 'Cum decizi practic',
        body: [
          'Scrie traseul înainte să te uiți la preț. Dacă încape într-o țară, ai o decizie de țară. Dacă trece granițe, ai una regională.',
          'Și verifică blocarea în rețea înainte să zbori. Este cel mai frecvent motiv pentru care un profil perfect valid refuză să se instaleze.',
        ],
      },
    },
    faq: [
      {
        q: 'De la câte țări merită un plan regional?',
        a: 'De la trei într-o lună, clar. La două este discutabil. La una, cumperi pentru țară aceea.',
      },
      {
        q: 'Este bună acoperirea pe insule?',
        a: 'Variabila, și niciun plan nu schimbă asta. Insulele mari sunt acoperite, cele mici deseori nu.',
      },
      {
        q: 'Trebuie să mă înregistrez pentru o cartelă locală?',
        a: 'În majoritatea țărilor din regiune, da. Un eSIM de călătorie sare complet peste pasul acesta.',
      },
      {
        q: 'Primesc număr local în fiecare țară?',
        a: 'Nu. Planurile doar de date nu au număr nicăieri.',
      },
    ],
  },

  'north-america': {
    angle: 'Trei țări, trei facturi, fără plasa de siguranță europeană',
    h1: 'eSIM pentru America de Nord',
    title: 'eSIM America de Nord: trei țări, trei facturi',
    metaDescription:
      'Statele Unite, Canada și Mexic arată ca o singură călătorie și se facturează ca trei. Pentru un abonament românesc este cea mai scumpă regiune.',
    sectionOrder: ['intro', 'sua', 'granițe', 'acoperire', 'viza', 'decizie', 'faq'],
    intro: [
      'America de Nord este regiunea în care roamingul iartă cel mai puțin pentru un abonament românesc. Nu există o regulă că în Uniune pe care să te bazezi. Ce plătești este ce a decis operatorul tău pentru alt continent.',
      'Pe hartă arată ca o destinație. Pe factură sunt trei.',
    ],
    sections: {
      sua: {
        heading: 'Statele Unite sunt o decizie separată',
        body: [
          'Rețelele sunt dense și rapide, iar pentru vizitatori sunt scumpe. În orașe și pe autostrăzile interstatale acoperirea este excelentă. În interiorul continentului, în parcurile naționale și pe traseele lungi prin deșert este mai subțire decât se așteaptă lumea.',
          'Interesant este că o mare parte din căutările din regiune nu sunt despre acoperire, ci despre depanare: instalat, dar fără conexiune. Cauza este aproape întotdeauna o setare, nu produsul.',
        ],
      },
      granite: {
        heading: 'Canada și Mexic',
        body: [
          'Un plan pentru Statele Unite nu trece automat graniță. Unele contracte americane includ Canada și Mexicul, multe nu.',
          'Dacă vii din Europa și vizitezi două din cele trei țări, ești exact în situația pentru care există planul regional.',
        ],
      },
      acoperire: {
        heading: 'La ce să te aștepți',
        body: [
          'Acoperirea din Canada urmează populația, deci banda sudică și autostrăzile. Mai la nord există goluri geografice, nu comerciale.',
          'În Mexic, orașele, stațiunile de pe coastă și drumurile principale sunt bine acoperite. Munții și orașele mici din interior, mai puțin.',
        ],
      },
      viza: {
        heading: 'Formalitățile de intrare cer conexiune înainte să ai una',
        body: [
          'Pentru un pașaport românesc, intrarea în Statele Unite se face cu autorizație electronică obținută online înainte de plecare, iar Canada cere ceva echivalent pentru zbor. Ambele se rezolvă de acasă, deci nu depind de conexiunea de acolo.',
          'Ce depinde este după aterizare. Adresa de cazare cerută la control, confirmarea zborului intern, aplicația companiei aeriene. Toate presupun că ai internet înainte să treci de ghișeu, iar acolo nu există rețea locală cumpărată.',
          'Practic, asta înseamnă că profilul se instalează și se activează înainte de îmbarcare, nu după. Este singurul moment din toată calatoria în care ordinea chiar contează.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'O țară, un plan de țară. Două sau trei țări, un plan regional, pentru că exact la granițe se strică factura.',
          'Și descarcă hărțile înainte. În parcuri, offline este regula, nu excepția.',
        ],
      },
    },
    faq: [
      {
        q: 'Un plan pentru Statele Unite merge și în Canada sau Mexic?',
        a: 'Nu automat. Unele contracte americane le includ, multe nu.',
      },
      {
        q: 'Am semnal în parcurile naționale?',
        a: 'Deseori nu, la niciun operator. Golurile din vestul american sunt geografice.',
      },
      {
        q: 'De ce se caută atât de mult depanare?',
        a: 'Pentru că baza instalată este mare, iar problema este de obicei o setare. Datele în roaming oprite sunt cauza cea mai frecvența.',
      },
      {
        q: 'Primesc un număr american?',
        a: 'Nu, cu un plan doar de date.',
      },
    ],
  },

  'south-america': {
    angle: 'Distanțe mari, granițe reale, fără regulă comună',
    h1: 'eSIM pentru America de Sud',
    title: 'eSIM America de Sud: distanțe mari și granițe reale',
    metaDescription:
      'Călătoriile prin America de Sud acoperă distanțe mari și mai multe granițe. Între țări nu există o regulă comună de roaming.',
    sectionOrder: ['intro', 'distanțe', 'granițe', 'etape', 'decizie', 'faq'],
    intro: [
      'Traseele sud-americane sunt lungi. O lună înseamnă aici de obicei trei sau patru țări și câteva zboruri interne, iar între acoperire bună și lipsa totală de semnal sunt ore, nu minute.',
      'Combinația dintre trasee lungi și granițe reale este motivul pentru care conexiunea se planifică aici, nu se improvizeaza.',
    ],
    sections: {
      distante: {
        heading: 'Acoperirea urmează orașele, iar orașele sunt departe',
        body: [
          'Buenos Aires, Santiago, Lima, Bogota și orașele de pe coasta braziliană au acoperire bună. Anzii, bazinul Amazonului, Patagonia și drumurile lungi cu autocarul dintre ele, nu.',
          'Planifică offline. Descarcă harta, salvează biletul, fă captura de ecran cu adresa. Sfatul rămâne valabil indiferent ce cumperi și de la cine.',
        ],
      },
      granite: {
        heading: 'Între țări nu există nicio înțelegere comună',
        body: [
          'Nu există nimic echivalent cu regula europeană. Din Argentina în Chile sau din Peru în Bolivia înseamnă alt operator și altă relație comercială.',
          'Pentru o singură țară, cumpărarea locală este ieftină și simplă. Pe traseul clasic cu mai multe țări, cumpărările repetate și creditele rămase nefolosite se adună mai repede decât sugerează diferență de preț.',
        ],
      },
      etape: {
        heading: 'Zboruri interne și autocare de noapte',
        body: [
          'Traseele de aici sunt făcute din puține etape lungi, nu din multe scurte. Un autocar de noapte de la Lima la Cusco sau un zbor intern de la Buenos Aires la El Calafate sunt lucruri obișnuite, și ambele se petrec în mare parte în afară acoperirii.',
          'Practic, asta înseamnă că rezervările, adresele și hărțile se salvează înainte de plecare. Cine se bazează că verifică pe drum rămâne fără date fix pe porțiunea unde ar avea nevoie.',
          'Pentru cine are multe astfel de etape, întrebarea reală nu este ce plan cumpără, ci cât de bine și-a pregătit partea offline.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'O țară până în două săptămâni: plan de țară. Două sau mai multe țări, ori etape lungi pe uscat: plan regional.',
          'Și tratează acoperirea ca pe o constrângere de planificare, nu ca pe o caracteristica de produs. Golurile sunt aceleași pentru toată lumea.',
        ],
      },
    },
    faq: [
      {
        q: 'Există roaming gratuit între țările sud-americane?',
        a: 'Nu. Nu există un echivalent al regulii europene.',
      },
      {
        q: 'Am semnal în Patagonia sau în Amazon?',
        a: 'Frecvent nu, la niciun operator. Planifică ambele zone offline.',
      },
      {
        q: 'Brazilia intră într-un plan pentru America de Sud?',
        a: 'De obicei da pe hârtie. Ca piață, Brazilia se tratează separat, pentru că acolo se caută cu alte cuvinte.',
      },
      {
        q: 'Mai bine cumpăr la fața locului?',
        a: 'Pentru o singură țară, foarte probabil da. Pe un traseu cu mai multe țări, rar.',
      },
    ],
  },

  'central-america': {
    angle: 'Distanțe scurte, multe granițe, aproape toate pe sosea',
    h1: 'eSIM pentru America Centrală',
    title: 'eSIM America Centrală: drumuri scurte, multe granițe',
    metaDescription:
      'Șapte țări pe o distanță mică. Două săptămâni aici trec ușor patru granițe, și toate pe sosea.',
    sectionOrder: ['intro', 'geografie', 'uscat', 'acoperire', 'transfer', 'decizie', 'faq'],
    intro: [
      'America Centrală adună șapte țări pe o distanță pe care o parcurgi cu mașina în câteva zile. Două săptămâni ajung pentru Guatemala, Belize, Honduras, Nicaragua și Costa Rica, iar cea mai mare parte din drum se face pe sosea.',
      'Exact granițele terestre fac regiunea diferită. Nu treci printr-un aeroport care să îți amintească faptul că ai schimbat țară.',
    ],
    sections: {
      geografie: {
        heading: 'Distanțe mici, mulți operatori',
        body: [
          'Pentru că etapele sunt scurte, călătorii subestimează câte rețele ating. O singură săptămâna poate însemna trei rețele naționale, fiecare cu tariful ei pentru vizitatori.',
          'Aici nu este atât despre preț, cât despre a nu te gândi la asta la fiecare bariera.',
        ],
      },
      uscat: {
        heading: 'De ce granițele terestre ies scump',
        body: [
          'O aterizare pe aeroport este un semnal clar că trebuie să cumperi ceva. O graniță terestră nu este. Autocarul merge mai departe, telefonul se reconectează la altă rețea, iar tarifarea pornește fără să apară nimic pe ecran.',
          'Dacă străbați regiunea pe sosea, lămurește conexiunea înainte de prima graniță, nu după prima factură.',
        ],
      },
      acoperire: {
        heading: 'Cum arată acoperirea pe teren',
        body: [
          'Capitalele, coasta Pacificului și drumurile principale sunt bine acoperite. Partea dinspre Caraibe, zonele montane și orașele mici din interior sunt mai subțiri și diferă de la operator la operator.',
          'Costa Rica și Panama stau cel mai bine. În zonele rurale din Guatemala, Honduras și Nicaragua e de așteptat să fii offline pe porțiuni.',
        ],
      },
      transfer: {
        heading: 'Transferuri, feriboturi și drumul înapoi spre aeroport',
        body: [
          'Traficul dintre țări se face aici cu microbuze private care leagă hostel de hostel și cu feriboturi mici, de exemplu spre Belize sau spre insulele Bahia. Ambele se confirmă de obicei printr-un mesaj, nu printr-un bilet într-o aplicație.',
          'Asta face conexiunea permanentă mai utilă decât pare într-o regiune cu distanțe scurte. Cine confirmă transferul seara are nevoie de semnal dimineața.',
          'Drumul înapoi spre aeroport este al doilea punct. San Jose, Panama City și Guatemala City sunt deseori la câteva ore de locul unde se termină vacanță, iar schimbările de oră apar pe ultima sută de metri.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'O țară: plan de țară. Traseul clasic pe uscat: plan regional, pentru că exact pentru asta a fost făcut.',
          'Și că peste tot: verifică dacă telefonul este blocat în rețea înainte să pleci.',
        ],
      },
    },
    faq: [
      {
        q: 'Am nevoie de plan separat pentru fiecare țară?',
        a: 'Doar dacă insiști să cumperi local. Pe un traseu pe uscat înseamnă mai multe cumpărări în două săptămâni.',
      },
      {
        q: 'Se tarifează roaming la granițele terestre?',
        a: 'Da, și de obicei fără niciun semnal vizibil. Este motivul principal al surprizelor din regiune.',
      },
      {
        q: 'Care țări au cea mai bună acoperire?',
        a: 'Costa Rica și Panama. Cele mai subțiri sunt zonele rurale din Guatemala, Honduras și Nicaragua.',
      },
      {
        q: 'Merită un plan regional pentru o săptămâna?',
        a: 'Doar dacă săptămâna aceea trece granițe.',
      },
    ],
  },

  caribbean: {
    angle: 'Fiecare insula este o rețea separată',
    h1: 'eSIM pentru Caraibe',
    title: 'eSIM Caraibe: fiecare insula, altă rețea',
    metaDescription:
      'Insulele din Caraibe sunt piețe de telecomunicații separate chiar dacă sunt la douăzeci de minute de zbor una de alta.',
    sectionOrder: ['intro', 'insule', 'croazieră', 'acoperire', 'zboruri', 'decizie', 'faq'],
    intro: [
      'Caraibele arată într-o broșura ca o singură destinație și se comportă tehnic că zeci de piețe separate. Insule aflate la douăzeci de minute de zbor sunt țări diferite, cu operatori diferiți și tarife diferite pentru vizitatori.',
      'Pentru o săptămâna într-o stațiune, asta contează puțin. Pentru oricine sare de pe o insula pe alta sau navighează, este întreaga întrebare.',
    ],
    sections: {
      insule: {
        heading: 'De ce săritul între insule schimbă răspunsul',
        body: [
          'O cartelă cumpărată în Barbados nu ajută în Sfânta Lucia. Fiecare insula înseamnă o cumpărare nouă sau o tarifare de roaming, iar salturile sunt suficient de scurte încât mulți le fac de mai multe ori într-o săptămâna.',
          'Unii operatori regionali acoperă mai multe insule sub aceeași marcă. Merită verificat dacă insulele de pe traseul tău se întâmplă să fie printre ele.',
        ],
      },
      croaziera: {
        heading: 'Pentru pasagerii de croazieră',
        body: [
          'Pe mare, telefonul se conectează la rețeaua prin satelit a vasului, nu la vreo rețea de pe insule. Niciun eSIM de călătorie nu acoperă asta, iar tarifele de acolo sunt cele din poveștile de groază.',
          'Practic: datele oprite pe mare, pornite în port.',
        ],
      },
      acoperire: {
        heading: 'Acoperirea acolo unde chiar vei fi',
        body: [
          'Stațiunile, porturile de croazieră și orașele principale de pe insulele mari sunt bine acoperite. Interiorul, insulițele și insulele mai liniștite din est sunt variabile.',
          'Vremea contează aici mai mult decât oriunde. Infrastructura din zona uraganelor suferă avarii, iar refacerea ia timp.',
        ],
      },
      zboruri: {
        heading: 'Zborurile dintre insule sunt scurte și schimbă totul',
        body: [
          'Companiile regionale leagă insulele în douăzeci până la patruzeci de minute. Tehnic, fiecare astfel de zbor este o schimbare de țară, de operator și de tarif, iar la o distanță atât de mică nimeni nu observă.',
          'Întârzierile și reprogramările sunt frecvente pe rutele astea și se comunică prin mesaj. Exact atunci ai nevoie de semnal, și exact atunci ai aterizat pe o insula a cărei rețea nu ai cumpărat-o.',
          'Cine vizitează mai mult de două insule fie cumpără de fiecare dată, fie o dată regional. Diferența de preț este mai mică decât diferență de efort.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'O insula, o săptămâna: cumperi pentru insula aceea.',
          'Mai multe insule sau un traseu cu velierul: plan regional, altfel cumperi ceva nou la fiecare câteva zile.',
        ],
      },
    },
    faq: [
      {
        q: 'Un singur plan merge pe toate insulele?',
        a: 'Un plan regional este făcut pentru asta. O cartelă locală de pe o insula nu merge pe urmatoarea.',
      },
      {
        q: 'Merge eSIM-ul pe vasul de croazieră?',
        a: 'Nu. Pe mare ești în rețeaua prin satelit a vasului, care se tarifează separat.',
      },
      {
        q: 'Acoperirea este afectată de furtuni?',
        a: 'Da. Este zona uraganelor, iar avariile de rețea sunt reale.',
      },
      {
        q: 'Ce se întâmplă în interiorul insulelor?',
        a: 'Variază. Stațiunile și porturile sunt acoperite, insulițele deseori nu.',
      },
    ],
  },

  'middle-east': {
    angle: 'Rețele excelente, dar aplicațiile de apeluri sunt capcana',
    h1: 'eSIM pentru Orientul Mijlociu',
    title: 'eSIM Orientul Mijlociu: datele merg, apelurile nu mereu',
    metaDescription:
      'Rețelele din Golf sunt printre cele mai bune din lume. Întrebarea reală este dacă aplicațiile tale de apeluri sunt permise acolo.',
    sectionOrder: ['intro', 'apeluri', 'golf', 'acoperire', 'decizie', 'faq'],
    intro: [
      'Orientul Mijlociu este una dintre cele mai bine conectate regiuni din lume. Rețelele din Golf sunt rapide, moderne și dense, iar aeroporturile de acolo sunt printre cele mai bine acoperite de oriunde.',
      'Complicația nu ține de acoperire, ci de servicii. Unele aplicații pe care le folosești zilnic acasă sunt restricționate în anumite rețele, iar asta este o chestiune de reglementare, nu una tehnica.',
    ],
    sections: {
      apeluri: {
        heading: 'Apelurile prin internet sunt lucrul de verificat',
        body: [
          'Mai multe țări din regiune restricționează apelurile vocale și video prin internet în rețelele locale. Mesageria de obicei funcționează. Butonul de apel, nu întotdeauna.',
          'Îi prinde nepregătiți pe cei care presupun că un plan de date înseamnă automat că pot suna acasă ca peste tot. Verifică situația curentă pentru țară respectivă, pentru că regulile se schimbă și diferă între operatori.',
        ],
      },
      golf: {
        heading: 'Golful este o piață aparte',
        body: [
          'Dubaiul și Emiratele generează de departe cea mai mare cerere din regiune, iar cererea aceea este exprimată preponderent în engleză, inclusiv local.',
          'Acoperirea în Emirate, Qatar, Bahrain și Kuweit este excelentă, inclusiv în zonele de deșert în care sunt duși vizitatorii. Nu este o regiune unde să te aștepți să fii offline.',
        ],
      },
      acoperire: {
        heading: 'Dincolo de Golf',
        body: [
          'Iordania, Israel și Oman au rețele solide acolo unde ajung călătorii. În deșert și în zonele montane devine mai subțire, ca peste tot.',
          'Turcia are pagina proprie și o regulă proprie de înregistrare a telefonului, care nu are legătura cu acoperirea și care rămâne cea mai importanța informație din regiune.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'Pentru un singur oraș din Golf, un plan de țară este suficient și rețeaua nu te va dezamăgi.',
          'Pentru un circuit, planul regional scutește cumpărările repetate. În ambele cazuri, verifică restricțiile de apeluri înainte să te bazezi pe ele.',
        ],
      },
    },
    faq: [
      {
        q: 'Pot suna prin WhatsApp sau FaceTime?',
        a: 'Depinde de țară și de rețea. Mai multe țări din regiune restricționează apelurile prin internet, lăsând mesageria să funcționeze.',
      },
      {
        q: 'Este bună acoperirea în deșert?',
        a: 'În Golf, surprinzător de bună, inclusiv pe traseele agențiilor. În afară lui, se subțiază.',
      },
      {
        q: 'Am nevoie de arabă?',
        a: 'Nu. Serviciile pentru vizitatori din Golf funcționează în engleză.',
      },
      {
        q: 'Turcia intră la Orientul Mijlociu?',
        a: 'Depinde de plan. Regula de înregistrare a telefonului de acolo face pagina țării utilă oricum.',
      },
    ],
  },

  africa: {
    angle: 'Nordul este bine acoperit, restul foarte diferit',
    h1: 'eSIM pentru Africa',
    title: 'eSIM Africa: puternic în nord, inegal în rest',
    metaDescription:
      'Rețelele nord-africane sunt bune și intens călătorite. Restul continentului variază enorm, iar niciun plan nu schimbă rețeaua de pe teren.',
    sectionOrder: ['intro', 'nord', 'sud', 'realitate', 'viteză', 'decizie', 'faq'],
    intro: [
      'Africa nu este o singură piață de conectivitate, iar cine o tratează așa rămâne dezamăgit. Un plan care înșira patruzeci de țări îți vorbește despre înțelegeri comerciale, nu despre semnalul tău de la fața locului.',
      'Cererea pe care o măsurăm este concentrată, nu răspândită. Marocul și Egiptul adună o parte foarte mare din ea, și vine în principal de la călători europeni.',
    ],
    sections: {
      nord: {
        heading: 'Nordul Africii este partea la care se gândește toată lumea',
        body: [
          'Marocul, Egiptul și Tunisia duc cea mai mare parte din traficul de vizitatori și au rețelele potrivite. Orașele, zonele de stațiuni și traseele turistice principale sunt acoperite solid.',
          'Niciuna dintre aceste țări nu face parte din vreo înțelegere europeană de roaming. Exact de aceea există cererea.',
        ],
      },
      sud: {
        heading: 'Africa de sud și de est',
        body: [
          'Africa de Sud, Kenya și Tanzania au rețele urbane competente și piețe de date mobile bine dezvoltate. Zonele de safari și parcurile naționale sunt altceva și se planifică offline.',
          'Cartelele preplătite locale sunt ieftine și ușor de găsit acolo. Compromisul este cel obișnuit: preț și număr local contra unei aterizări deja conectate.',
        ],
      },
      realitate: {
        heading: 'Citește lista de țări, nu numele continentului',
        body: [
          'Un plan vândut ca fiind pentru Africa se comportă complet diferit la Marrakech fața de zonele rurale din Zambia. Cinstit se cumpără verificând țările concrete de pe traseu.',
          'Preferăm să îți spunem că o țară este slab acoperită decât să îți vindem un plan care sugerează altceva.',
        ],
      },
      viteza: {
        heading: 'Lista nu spune nimic despre viteză',
        body: [
          'O enumerare de țări nu îți spune dacă ajungi în rețeaua modernă sau într-o tehnologie mai veche. Pentru mesaje ajunge și una, și alta. Pentru navigație și apeluri video, nu întotdeauna.',
          'Dacă traseul tău cuprinde mai multe țări, verifică două sau trei în care chiar petreci timp, nu toată lista. Restul nu contează pentru calatoria ta.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'Pentru Maroc, Egipt sau Tunisia separat, un plan de țară este răspunsul curat și acoperirea ține.',
          'Pentru un circuit, verifică dacă fiecare țară care contează este cu adevărat acoperită și nu doar enumerată, și planifică etapele izolate ca fiind offline.',
        ],
      },
    },
    faq: [
      {
        q: 'De ce se caută atât de mult Marocul?',
        a: 'Pentru că este aproape de Europa, intens vizitat și în afară oricărei înțelegeri europene de roaming.',
      },
      {
        q: 'Am semnal în safari?',
        a: 'Deseori nu, și ține de rețea, nu de produs. Planifică zilele acelea offline.',
      },
      {
        q: 'Cartelă locală este o opțiune bună în Africa?',
        a: 'În Kenya, Tanzania și Africa de Sud este ieftină și simplă. Costul este înregistrarea la sosire.',
      },
      {
        q: 'Un plan pentru tot continentul chiar merge peste tot?',
        a: 'Merge unde există înțelegeri, ceea ce nu înseamnă peste tot.',
      },
    ],
  },

  oceania: {
    angle: 'Distanțe uriașe și foarte puțini operatori',
    h1: 'eSIM pentru Oceania',
    title: 'eSIM Oceania: distanțe mari, puține rețele, goluri reale',
    metaDescription:
      'Australia și Noua Zeelandă au rețele urbane bune și porțiuni lungi fără niciun semnal. Contează mai mult unde ești decât ce plan ai.',
    sectionOrder: ['intro', 'Australia', 'Noua-Zeelandă', 'insule', 'decizie', 'faq'],
    intro: [
      'În Oceania, diferență dintre harta de acoperire și traseul real este cea mai mare. Rețelele din Australia și Noua Zeelandă sunt moderne și rapide acolo unde există, și complet absente pe distanțe care se parcurg în ore.',
      'Sunt și foarte puțini operatori. Asta înseamnă mai puțină concurența de preț decât în Europa și înseamnă că diferențele dintre produse sunt mai mici decât diferențele dintre locuri.',
    ],
    sections: {
      australia: {
        heading: 'Australia este întâi o problemă de acoperire',
        body: [
          'Acoperirea urmează coasta și populația. Sydney, Melbourne, Brisbane, Perth și coridoarele dintre ele sunt bine acoperite. Interiorul nu, iar diferență nu este mică.',
          'Dacă traseul include outback, etape lungi pe autostrada sau părțile mai puțin vizitate din Australia de Vest și Teritoriul de Nord, așteaptă-te la perioade lungi fără semnal la orice operator.',
        ],
      },
      'Noua-Zeelandă': {
        heading: 'Noua Zeelandă',
        body: [
          'Proporțional mai bine decât Australia, pentru că țară este mai mică, dar tiparul este același. Orașele și drumurile principale sunt acoperite, zonele alpine și Fiordland nu.',
          'Traseele de drumeție se planifică integral offline. Descarcă hărțile și spune-i cuiva pe unde mergi.',
        ],
      },
      insule: {
        heading: 'Insulele din Pacific',
        body: [
          'Fiji, Samoa, Tonga și statele insulare mai mici au rețele limitate și înțelegeri de roaming limitate. Un plan care spune Oceania s-ar putea să le includă doar pe hârtie.',
          'Dacă traseul tău trece pe acolo, verifică-le individual. Aici afirmațiile generale despre acoperire sunt cel mai puțin de încredere.',
          'Se adaugă și faptul că distanțele dintre insule sunt mari, iar legăturile rare. De la Fiji la Samoa poți fi pe drum o zi întreaga, deseori cu escală, iar confirmările vin pe ultima sută de metri.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'Australia și Noua Zeelandă împreună este traseul obișnuit și cazul în care un plan regional este clar util, pentru că cele două țări au rețele separate.',
          'O singură țară înseamnă plan de țară. Și în ambele cazuri, golurile de acoperire intră în planificare, nu în alegerea produsului.',
        ],
      },
    },
    faq: [
      {
        q: 'Am semnal în outback-ul australian?',
        a: 'De obicei nu. Golurile sunt geografice și privesc orice operator.',
      },
      {
        q: 'Un plan acoperă și Australia, și Noua Zeelandă?',
        a: 'Un plan regional este făcut pentru asta. Unul de țară nu te urmează peste graniță.',
      },
      {
        q: 'Insulele din Pacific sunt incluse?',
        a: 'Deseori doar formal. Verifică Fiji, Samoa și Tonga separat.',
      },
      {
        q: 'Cartelă locală este mai ieftină?',
        a: 'În Australia și Noua Zeelandă este competitivă și ușor de cumpărat.',
      },
    ],
  },

  balkans: {
    angle: 'Partea din Europa unde se oprește zona de roaming, la doi pași de casa',
    h1: 'eSIM pentru Balcanii',
    title: 'eSIM Balcanii: în Europa, în afară zonei de roaming',
    metaDescription:
      'Serbia, Albania, Bosnia, Macedonia de Nord și Muntenegru sunt în Europa și în afară roamingului inclus. De aici vine toată cererea.',
    sectionOrder: ['intro', 'linia', 'rute', 'acoperire', 'decizie', 'faq'],
    intro: [
      'Balcanii sunt exemplul cel mai clar de regiune europeană geografic și separată comercial. Croația, Slovenia, Grecia și Bulgaria sunt în zona de roaming. Albania, Serbia, Bosnia și Herțegovina, Macedonia de Nord și Muntenegru nu sunt.',
      'Pentru un român, asta contează mai mult decât pentru aproape oricine altcineva, pentru că Serbia începe la o oră de Timisoara și pentru că drumul spre mare trece deseori prin ea.',
    ],
    sections: {
      linia: {
        heading: 'Cine pe ce parte este',
        body: [
          'În zona, deci gratuit pe un abonament românesc: Croația, Slovenia, Grecia, Bulgaria și Ungaria. În afară, deci tarifat: Albania, Serbia, Bosnia și Herțegovina, Macedonia de Nord și Muntenegru.',
          'Aceasta este informația cea mai utilă de pe pagină. Cele mai multe trasee prin Balcanii ating ambele părți.',
        ],
      },
      rute: {
        heading: 'Rutele pe care chiar te costă',
        body: [
          'Drumul spre Grecia prin Serbia și Macedonia de Nord trece linia de două ori. La fel și vacanțele pe litoralul din Muntenegru sau Albania, ambele ajunse destinații obișnuite de vara pentru români.',
          'Cine merge cu mașina observă cel mai greu, pentru că nu există niciun moment care să semnaleze schimbarea. Doar factura de la întoarcere.',
        ],
      },
      acoperire: {
        heading: 'Acoperirea este mai bună decât reputația',
        body: [
          'Rețelele din regiune sunt moderne, iar orașele sunt bine acoperite. Coasta albaneză, Belgradul, Sarajevo, Skopje și Podgorica nu te lasă descoperit.',
          'Se subțiază în munți, iar munții sunt un motiv important de călătorie aici. Planifică zilele de drumeție offline.',
        ],
      },
      decizie: {
        heading: 'Cum decizi',
        body: [
          'Dacă traseul rămâne în partea din Uniune, nu ai nevoie de nimic. Dacă intră în Serbia, Albania, Bosnia, Macedonia de Nord sau Muntenegru, etapa aceea trebuie acoperită.',
          'Dacă linia se trece de mai multe ori, un plan regional scutește cumpărarea la fiecare graniță. Pentru o singură țară din afară zonei, un plan de țară este mai ieftin.',
        ],
      },
    },
    faq: [
      {
        q: 'Ce țări din Balcanii intră în roamingul inclus?',
        a: 'Croația, Slovenia, Grecia, Bulgaria și Ungaria. Albania, Serbia, Bosnia și Herțegovina, Macedonia de Nord și Muntenegru nu.',
      },
      {
        q: 'Merge abonamentul meu în Serbia?',
        a: 'Nu la tarif național. Serbia este în afară zonei, deși este țară vecină.',
      },
      {
        q: 'Dar pe drumul spre Grecia?',
        a: 'Grecia este în zona, dar dacă ajungi acolo prin Serbia și Macedonia de Nord, treci de două ori prin afară ei.',
      },
      {
        q: 'Acoperirea este sigură în munți?',
        a: 'Mai puțin, iar munții sunt un motiv principal de vizită. Planifică drumețiile offline.',
      },
    ],
  },
};

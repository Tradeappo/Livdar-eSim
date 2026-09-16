export const guides = {
  'how-esim-works': {
    cluster: 'setup',
    h1: 'Cum functioneaza un eSIM',
    title: 'Ce este un eSIM si prin ce difera de o cartela obisnuita',
    metaDescription: 'Un eSIM este o cartela SIM scrisa in telefon, nu introdusa in el. Ce se schimba, ce nu se schimba si greseala pe care o face aproape toata lumea.',
    intro: [
      'O cartela SIM este un cip securizat care demonstreaza unei retele mobile ca ai dreptul sa fii acolo. Un eSIM este acelasi lucru fara plastic: cipul este deja in telefon, iar pe el se scrie un profil de retea.',
      'Restul functioneaza identic. Aceleasi antene, aceleasi retele, aceleasi viteze. Se schimba doar felul in care ajunge profilul in telefon, si exact acolo apar diferentele practice.',
    ],
    sections: {
      diferenta: {
        heading: 'Ce se schimba de fapt',
        body: [
          'Poti instala un profil de oriunde ai internet. Asta inseamna ca poti fi intr-o retea straina inainte sa iesi din tara.',
          'Poti tine mai multe profiluri si sa comuti intre ele. De asta dual SIM pe un telefon cu eSIM este mai util decat a fost vreodata dual SIM cu doua sertare.',
          'Nu poti scoate profilul si sa il muti in alt telefon. Asta este pretul.',
        ],
      },
      confuzie: {
        heading: 'eSIM de date nu inseamna numar strain',
        body: [
          'In Romania confuzia asta este cea mai frecventa, pentru ca multa lume cauta deopotriva cartela cu numar de Anglia si eSIM pentru vacanta.',
          'Un eSIM de calatorie iti da internet in strainatate. Nu iti da un numar local si nu poate primi SMS de la o banca sau de la o institutie din tara respectiva.',
          'Daca ai nevoie de un numar real cu prefix strain, ai nevoie de o cartela cu numar. Sunt doua produse diferite pentru doua nevoi diferite.',
        ],
      },
      greseala: {
        heading: 'Greseala pe care o face aproape toata lumea',
        body: [
          'Instalarea unui eSIM are nevoie de internet. Activarea nu.',
          'Pare evident pana cand stai in sala de sosiri fara date si incerci sa scanezi un cod QR dintr-un email pe care nu il poti deschide. Instaleaza acasa pe wifi, lasa linia oprita si pornestre-o cand aterizezi.',
        ],
      },
    },
    faq: [
      { q: 'Pot sterge un eSIM si sa il reinstalez?', a: 'De obicei nu. Majoritatea profilurilor de calatorie se instaleaza o singura data. Opreste-l in loc sa il stergi.' },
      { q: 'Consuma mai multa baterie?', a: 'Doua linii active consuma putin mai mult, pentru ca telefonul tine doua inregistrari. Opreste linia pe care nu o folosesti.' },
      { q: 'Merge pe tableta sau pe ceas?', a: 'Daca dispozitivul are eSIM si planul permite. Multe planuri de calatorie sunt scrise doar pentru telefoane.' },
    ],
  },

  'install-esim': {
    cluster: 'setup',
    h1: 'Cum instalezi si activezi un eSIM',
    title: 'Instaleaza eSIM-ul inainte de zbor: ordinea care functioneaza',
    metaDescription: 'Instalezi acasa pe wifi, lasi linia oprita, o pornesti cand aterizezi. Toata secventa, inclusiv setarea pe care o uita toata lumea.',
    intro: [
      'Ordinea conteaza mai mult decat pasii. Aproape orice problema cu un eSIM in calatorie este aceeasi problema: omul a incercat sa il instaleze exact in momentul in care avea nevoie de el, adica in momentul in care nu avea internet.',
    ],
    sectionOrder: ['acasa', 'aterizare', 'pastrare', 'probleme'],
    sections: {
      acasa: {
        heading: 'Acasa, pe wifi',
        body: [
          'Instaleaza profilul. Da-i un nume pe care il recunosti mai tarziu, de exemplu numele destinatiei, nu denumirea implicita.',
          'Lasa linia oprita. Valabilitatea unui plan de calatorie incepe de obicei la prima conectare, nu la cumparare, dar asta este o regula a planului si merita citita.',
        ],
      },
      aterizare: {
        heading: 'Cand aterizezi',
        body: [
          'Porneste linia de calatorie. Pune datele mobile pe ea. Activeaza roamingul de date pentru acea linie, pentru ca un profil de calatorie tehnic face roaming, chiar daca pare local.',
          'Apoi opreste roamingul de date pe numarul tau romanesc. Pasul asta il sare lumea si exact el produce factura surpriza.',
        ],
      },
      pastrare: {
        heading: 'Se instaleaza o data, deci nu il sterge',
        body: [
          'Codul pe care il primesti la cumparare nu este un fisier pe care il tii undeva si il pui la loc cand vrei. La majoritatea planurilor de calatorie el se consuma la prima instalare. Profilul este scris in telefonul acela si ramane acolo.',
          'Trei gesturi obisnuite il pierd definitiv. Il stergi din lista de retele mobile pentru ca ti se pare ca faci curat. Resetezi telefonul la setarile din fabrica. Iti iei telefon nou si incerci sa muti profilul pe el. In toate trei cazurile profilul dispare si codul initial nu il mai aduce inapoi.',
          'Ce faci in loc: opresti linia. O linie oprita nu consuma, nu se inregistreaza si nu sta in calea numarului tau romanesc, dar profilul ramane in telefon. Daca planul mai are valabilitate sau daca il reincarci, il pornesti la urmatoarea calatorie si nu mai ai nimic de instalat.',
          'Iar daca tot trebuie sa schimbi telefonul sau sa faci o resetare in mijlocul calatoriei, scrie furnizorului inainte. Unii pot emite un cod nou, altii nu. Dupa stergere, discutia aia are un singur raspuns.',
        ],
      },
      probleme: {
        heading: 'Daca nu se conecteaza',
        body: [
          'Asteapta doua sau trei minute. Inregistrarea intr-o retea straina nu este instantanee.',
          'Porneste si opreste modul avion o data. Apoi verifica daca datele mobile sunt pe linia corecta. Este cea mai frecventa greseala.',
          'Daca tot nu merge, verifica daca planul cere un APN introdus manual. Majoritatea nu cer. Unele da, si atunci scrie la furnizor.',
        ],
      },
    },
    faq: [
      { q: 'Cand incepe sa curga valabilitatea?', a: 'De obicei la prima conectare la retea, nu la cumparare. Verifica planul, pentru ca unele pornesc la cumparare.' },
      { q: 'Pot instala in avion?', a: 'Doar cu wifi functional la bord. Presupune ca nu.' },
      { q: 'Daca il sterg din greseala?', a: 'Majoritatea profilurilor de calatorie nu se pot reinstala. Trateaza stergerea ca definitiva.' },
      { q: 'Imi schimb telefonul in vacanta. Mut profilul pe cel nou?', a: 'Nu se muta. Profilul ramane in telefonul in care a fost instalat. Intreaba furnizorul daca poate emite un cod nou inainte sa atingi ceva.' },
    ],
  },

  'esim-vs-roaming': {
    cluster: 'comparison',
    h1: 'eSIM sau roaming',
    title: 'eSIM sau roaming: socoteala care decide pentru vacanta ta',
    metaDescription: 'In Uniunea Europeana roamingul este inclus. In afara ei, socoteala dureaza doua minute si de obicei nu este la limita.',
    intro: [
      'Pentru abonamentele romanesti raspunsul in Uniunea Europeana este aproape mereu roaming, pentru ca nu costa nimic in plus. In afara Uniunii este aproape mereu invers.',
      'Intre cele doua sunt cateva tari unde merita sa te uiti atent.',
    ],
    sectionOrder: ['ue', 'granita', 'afara', 'rezonabil'],
    sections: {
      ue: {
        heading: 'In Uniunea Europeana nu iti trebuie nimic',
        body: [
          'In Uniunea Europeana si in Spatiul Economic European iti iei volumul cu tine, in conditiile de utilizare rezonabila din contract.',
          'Pentru Grecia, Spania, Italia sau Bulgaria un eSIM de calatorie este de obicei in plus. Scriem asta pe paginile de tara respective.',
        ],
      },
      granita: {
        heading: 'Unde se termina zona inclusa',
        body: [
          'Zona in care roamingul este inclus nu este Europa de pe harta. Este Spatiul Economic European: statele membre ale Uniunii, plus Islanda, Norvegia si Liechtenstein. Atat.',
          'Restul continentului este afara, si de obicei nu acolo se uita lumea. Elvetia nu este in Spatiul Economic European, desi are granita numai cu tari care sunt. Marea Britanie a iesit odata cu Brexitul. Turcia, Serbia, Bosnia, Albania, Macedonia de Nord si Muntenegru nu au fost niciodata inauntru. Egiptul si toata coasta de sud a Mediteranei sunt alt continent si alta socoteala.',
          'Peste regula asta, fiecare operator isi poate adauga voluntar tari in zona europeana proprie, si exact acolo apar Marea Britanie sau Elvetia la unii si nu la altii. Nu se deduce din nimic si nu se generalizeaza de la un prieten la altul. Lista de tari a optiunii tale este singurul document care conteaza, iar ea se mai schimba.',
          'Mai este o granita pe care nu o vede nimeni pana pe factura: retelele de la bordul navelor si al avioanelor. Un feribot in larg sau un vapor de croaziera pot fi prinse de o retea prin satelit taxata separat, chiar daca pleci dintr-un port din Uniune si ajungi in altul. Acolo nu te acopera nici roamingul inclus, nici un eSIM de calatorie. Se rezolva cu datele mobile oprite cat esti pe apa.',
        ],
      },
      afara: {
        heading: 'In afara Uniunii se scumpeste repede',
        body: [
          'Turcia, Egipt, Emiratele, Marea Britanie la unii operatori, Statele Unite si Asia sunt toate destinatii extra-UE.',
          'Ia pretul pe zi sau pachetul international din abonamentul tau, inmulteste cu zilele de calatorie si compara. La un city break de doua zile diferenta e mica. La doua saptamani aproape niciodata.',
        ],
      },
      rezonabil: {
        heading: 'Regula de utilizare rezonabila',
        body: [
          'Roamingul inclus este gandit pentru calatorii, nu pentru a trai permanent in alta tara cu un abonament romanesc. Operatorii pot analiza tiparul de utilizare pe o perioada de luni si pot cere dovada legaturii cu tara de origine, pot aplica un cost suplimentar sau pot limita serviciul.',
          'Conditiile difera de la operator la operator, deci este o linie de citit in propriul contract, nu o regula de generalizat.',
        ],
      },
    },
    faq: [
      { q: 'Roamingul este mereu mai scump?', a: 'Nu. In Uniunea Europeana este inclus, iar unele abonamente acopera mai multe tari decat crede lumea. Verifica intai.' },
      { q: 'Pot folosi si una si alta?', a: 'Da, si de obicei asta este configuratia buna: numarul romanesc pentru apeluri si SMS, eSIM pentru date, roaming de date oprit pe numarul romanesc.' },
      { q: 'Dar apelurile primite?', a: 'Vin pe numarul tau ca de obicei. In Uniunea Europeana primirea este inclusa, in afara ei nu automat.' },
      { q: 'Elvetia intra in roamingul european?', a: 'Nu de drept. Elvetia nu este in Spatiul Economic European. Unii operatori romani o trec voluntar in zona lor europeana, altii o taxeaza ca extra-UE. Se vede numai in lista de tari a optiunii tale.' },
    ],
  },

  'airport-connectivity': {
    cluster: 'arrival',
    h1: 'Cum ajungi online imediat ce aterizezi',
    title: 'Internet la aeroport: ce faci in primele zece minute',
    metaDescription: 'Wifi de aeroport, ghiseu de cartele si eSIM, comparate pentru sosirea pe care o ai de fapt: obosit, la coada si cu un transfer de gasit.',
    intro: [
      'Sosirea este cel mai prost moment in care sa rezolvi o problema de conectare si cel mai frecvent moment in care lumea incearca. Esti obosit, wifi-ul cere o adresa de email, la ghiseul de cartele este coada, iar statia de taxiuri este dincolo de ea.',
      'Tot ce urmeaza este despre cum scoti decizii din acele zece minute.',
    ],
    sectionOrder: ['wifi', 'codul', 'ghiseu', 'pregatit'],
    sections: {
      wifi: {
        heading: 'Wifi-ul de aeroport, realist',
        body: [
          'Majoritatea aeroporturilor mari au wifi gratuit si in general functioneaza. Ce difera este pagina de conectare: unele cer email, altele un numar de telefon pe care sa trimita un cod, ceea ce este circular daca nu ai date.',
          'Si se opreste la usa terminalului. Taxiul, trenul spre oras si cautarea hotelului se intampla in afara lui.',
        ],
      },
      codul: {
        heading: 'Cand wifi-ul iti cere un numar de telefon',
        body: [
          'Dintr-un aeroport european nu simti problema asta, pentru ca aterizezi cu datele incluse si nu deschizi pagina de conectare niciodata. Incepe sa doara exact acolo unde abonamentul romanesc nu te mai duce: Istanbul, Hurghada, Dubai, Bangkok. Adica fix in aeroporturile in care chiar depinzi de wifi.',
          'Mecanismul este scurt. Formularul cere un numar, trimite pe el un cod prin SMS si deschide accesul abia dupa ce introduci codul. Este construit pornind de la ideea ca ai coborat din avion cu o linie care primeste mesaje.',
          'Numarul tau romanesc poate sa il primeasca, dar numai daca linia s-a inregistrat intr-o retea de acolo. Daca ai lasat telefonul in modul avion de la decolare sau ai oprit de tot linia de acasa ca sa nu platesti nimic in afara Uniunii, nu s-a inregistrat nicaieri si codul nu are unde sa ajunga. Iar chiar inregistrat, multe formulare accepta doar numere in format local si resping din start unul care incepe cu +40.',
          'Ce face capcana serioasa este ca nu se vede dinainte. Nu scrie nicaieri ce fel de portal foloseste aeroportul in care aterizezi, si poate fi altul in alt terminal al aceluiasi aeroport. Descoperi ce varianta ai nimerit dupa ce esti deja acolo, obosit, cu bagajul langa tine.',
          'Un profil instalat inainte de plecare nu rezolva bucla, ci o scoate din discutie. Nu deschizi portalul, nu astepti niciun cod si nu afli ce versiune ruleaza aeroportul ala. Intrebarea pur si simplu nu ti se mai adreseaza.',
        ],
      },
      ghiseu: {
        heading: 'Ghiseul de cartele',
        body: [
          'Sigur, iti da numar local si are un pret stabilit stiind foarte bine ca in acel moment nu ai alternativa.',
          'In unele tari implica si inregistrarea pe pasaport, ceea ce transforma cinci minute in douazeci cand aterizeaza un avion plin deodata.',
        ],
      },
      pregatit: {
        heading: 'Varianta pregatita dinainte',
        body: [
          'Instalezi profilul inainte de zbor, il lasi oprit si il pornesti cat avionul inca ruleaza pe pista. Cand ajungi la control ai harta, mesajele si rezervarile.',
          'Functioneaza doar daca ai facut-o din timp. Un eSIM neinstalat valoreaza exact cat niciun eSIM.',
        ],
      },
    },
    faq: [
      { q: 'Pot activa eSIM-ul pe wifi-ul aeroportului?', a: 'De obicei da, dar exact de asta vrei sa nu ai nevoie. Instaleaza acasa.' },
      { q: 'Cartelele de la aeroport sunt o teapa?', a: 'Sunt scumpe pentru comoditate, nu necinstite. In Thailanda chiar sunt o afacere buna. In Japonia si in Golf, mai putin.' },
      { q: 'Dar wifi-ul din avion?', a: 'Daca functioneaza, poti instala acolo. Nu construi planul in jurul lui.' },
    ],
  },
};

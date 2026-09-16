// Confidentialitate si cookie-uri, piata romaneasca.
//
// Textele juridice descriu aceeasi realitate pe fiecare piata. Spre deosebire
// de paginile editoriale, ele au voie sa coincida ca fond. Formularea insa este
// scrisa pentru cititorul roman, cu termenii folositi aici.

export const legal = {
  privacy: {
    angle: 'Ce colecteaza site-ul azi, si este mai putin decat de obicei',
    h1: 'Politica de confidentialitate',
    title: 'Politica de confidentialitate | Livdar',
    metaDescription:
      'Ce colecteaza Livdar, de ce, cat timp pastreaza si ce drepturi ai. Scrisa dupa ce face efectiv site-ul, nu dupa un sablon.',
    sectionOrder: ['intro', 'operator', 'date', 'analiza', 'lista', 'viitor', 'destinatari', 'durata', 'drepturi', 'modificari', 'faq'],
    intro: [
      'Livdar este un site de conectivitate pentru calatorii aflat intr-o faza incipienta. Nu se vand planuri, nu se incaseaza plati si nu este conectat niciun furnizor, deci politica aceasta descrie mult mai putina prelucrare decat un magazin comparabil.',
      'Preferam o politica scurta si adevarata acum, pe care o extindem cand incepem sa vindem, decat una lunga care descrie lucruri pe care nu le facem.',
    ],
    sections: {
      operator: {
        heading: 'Cine raspunde',
        body: [
          'Operatorul pentru putinele date descrise mai jos este Livdar MVP. Tinem sa fim exacti in privinta a ce inseamna asta: Livdar MVP este un proiect aflat intr-o faza incipienta, nu o societate inregistrata. Nu exista un numar de inmatriculare de citat, nu exista cod fiscal si nu exista sediu social, pentru ca niciunul nu exista inca.',
          'O spunem direct, in loc sa completam campurile acelea cu ceva care suna credibil. O politica ce sugereaza o persoana juridica acolo unde nu exista una induce in eroare exact omul pe care ar trebui sa il protejeze.',
          'Pentru orice intrebare despre politica aceasta sau despre datele tale, scrie la livdarlive@gmail.com. Adresa este citita de oamenii care duc proiectul.',
          'Cand Livdar va fi inregistrata ca societate, sectiunea aceasta va numi firma, inregistrarea si sediul, si va fi actualizata inainte sa se vanda ceva pe site.',
        ],
      },
      date: {
        heading: 'Ce colectam',
        body: [
          'Un cookie numit livdar_consent, care pastreaza doar alegerea ta privind statisticile si marketingul. Nu contine niciun identificator, se scrie doar dupa ce raspunzi la banner si dureaza 180 de zile. Este necesar ca site-ul sa iti respecte alegerea, deci nu are nevoie el insusi de consimtamant.',
          'Date de masurare prin Google Analytics 4, si doar daca permiti cookie-urile de statistica. Includ paginile vizitate, o localizare aproximativa dedusa din adresa IP, tipul de dispozitiv si de browser, limba paginii si actiunile de pe ea, cum ar fi o cautare de destinatie.',
          'Jurnalele de server pastrate de furnizorul de gazduire pentru securitate si disponibilitate, care contin adrese IP pentru o perioada scurta.',
          'Asta este toata lista de azi. Nu avem conturi, nu avem newsletter, nu rulam pixeli de publicitate si nu vindem date catre brokeri.',
        ],
      },
      analiza: {
        heading: 'Analiza si Consent Mode',
        body: [
          'Analiza ruleaza prin Google Tag Manager, container GTM-WKGXHXWC, care incarca Google Analytics 4 pe proprietatea G-DY02HH34DT. Contul Google din spatele lor apartine Livdar si nu este partajat cu niciun alt proiect.',
          'Google Consent Mode v2 este implementat. Inainte sa raspunzi la banner, stocarea pentru analiza, stocarea publicitara, datele publicitare si personalizarea publicitara sunt toate pe refuzat, iar aceste valori implicite sunt scrise in pagina inainte ca managerul de etichete sa aiba voie sa se incarce. Nimic legat de masurare nu ruleaza inaintea alegerii tale.',
          'Daca accepti statisticile, stocarea pentru analiza este permisa si Google Analytics isi seteaza propriile cookie-uri. Daca refuzi, ramane refuzata si nu se scrie niciun cookie de analiza.',
          'Microsoft Clarity este pregatit in cod, dar inactiv. Se incarca doar daca este configurat un identificator de proiect si va fi supus aceleiasi conditii de consimtamant. Politica va fi actualizata in ziua in care se intampla asta.',
          'Temeiul legal pentru analiza este consimtamantul tau, conform articolului 6 alineatul 1 litera a din Regulamentul general privind protectia datelor. Il poti retrage oricand.',
        ],
      },
      lista: {
        heading: 'Anuntare si lista de asteptare',
        body: [
          'Interfata iti ofera sa te anunte cand apar planuri pentru o destinatie. Cat timp niciun furnizor nu este conectat, acesta este doar un semnal de interes: clicul este inregistrat ca eveniment anonim de analiza, daca ai consimtit, si nu se colecteaza si nu se stocheaza nicio data de contact.',
          'Daca si cand vom colecta o adresa de email pentru asta, se va face pe baza consimtamantului tau explicit si va fi folosita doar pentru acea unica notificare. Sectiunea aceasta o va spune inainte sa apara vreun formular.',
        ],
      },
      viitor: {
        heading: 'Ce se schimba cand incepem sa vindem',
        body: [
          'Cand un furnizor de eSIM va fi conectat, va trebui sa transmitem catre el informatiile necesare activarii unui profil. Furnizorul va fi numit aici inainte sa fie posibila orice comanda.',
          'Cand platile vor fi activate, un procesator de plati va gestiona tranzactia. Livdar nu va stoca in niciun moment numere de card complete. Si acest procesator va fi numit aici inainte sa se deschida checkout-ul.',
          'Niciunul dintre aceste lucruri nu este posibil azi pe site. Checkout-ul este dezactivat in cod, iar build-ul pica daca cineva incearca sa il porneasca fara furnizor conectat.',
        ],
      },
      destinatari: {
        heading: 'Cine mai vede datele',
        body: [
          'Google, ca furnizor de Analytics si Tag Manager, doar pentru datele descrise mai sus si doar cu consimtamantul tau.',
          'Furnizorul nostru de gazduire, care serveste paginile si pastreaza jurnale de server de scurta durata.',
          'Nimeni altcineva. Nu exista retele de publicitate, nu exista trackere de afiliere si nu exista instrumente terte de chat sau de harti de caldura active pe acest site.',
          'Google poate prelucra date in afara Spatiului Economic European. Aceste transferuri se bazeaza pe decizia de adecvare a Comisiei Europene pentru Statele Unite si, acolo unde nu se aplica, pe clauze contractuale standard.',
        ],
      },
      durata: {
        heading: 'Cat timp pastram',
        body: [
          'Cookie-ul de consimtamant: 180 de zile sau pana il stergi tu.',
          'Datele de analiza din Google Analytics: 14 luni de la colectare, dupa care sunt sterse automat de setarea de retentie a proprietatii.',
          'Jurnalele de server: o perioada scurta stabilita de furnizorul de gazduire, masurata in zile, nu in luni.',
        ],
      },
      drepturi: {
        heading: 'Drepturile tale',
        body: [
          'Conform Regulamentului general privind protectia datelor ai dreptul de acces, de rectificare, de stergere, de restrictionare a prelucrarii, de opozitie si de portabilitate. Acolo unde prelucrarea se bazeaza pe consimtamant, il poti retrage oricand, fara sa afectezi legalitatea prelucrarii de dinainte.',
          'Pentru ca site-ul nu are conturi, de obicei nu te putem identifica din datele pe care le detinem. Este intentionat, nu o scuza. Daca iti exerciti un drept, este posibil sa iti cerem informatii care ne permit sa gasim inregistrarile relevante, iar daca sincer nu te putem identifica, o vom spune in loc sa ghicim.',
          'Scrie la livdarlive@gmail.com. Daca nu esti multumit de raspuns, Regulamentul general privind protectia datelor iti permite sa depui plangere la autoritatea de protectie a datelor din tara in care locuiesti, in care lucrezi sau in care consideri ca s-a produs problema.',
        ],
      },
      modificari: {
        heading: 'Modificari ale politicii',
        body: [
          'Politica se schimba cand se schimba site-ul, concret la conectarea unui furnizor, la deschiderea platilor si daca se activeaza Clarity. Fiecare dintre ele este o schimbare reala a ce se intampla cu datele tale si fiecare va fi reflectata aici inainte sa intre in functiune, nu dupa.',
        ],
      },
    },
    faq: [
      {
        q: 'Colectati ceva inainte sa raspund la banner?',
        a: 'Nimic de analiza. Valorile implicite din Consent Mode sunt pe refuzat inainte ca managerul de etichete sa se incarce. Jurnalul serverului inregistreaza cererea in sine, ca orice server web.',
      },
      {
        q: 'Pot folosi site-ul daca refuz tot?',
        a: 'Da, complet. Refuzul opreste doar masurarea. Toate paginile, cautarea de destinatii si schimbarea limbii functioneaza identic.',
      },
      {
        q: 'Cum imi retrag consimtamantul?',
        a: 'Sterge cookie-ul livdar_consent din setarile browserului. Bannerul va intreba din nou la urmatoarea vizita.',
      },
      {
        q: 'Vindeti datele mele?',
        a: 'Nu. Nu exista retele de publicitate, brokeri de date sau trackere de afiliere pe acest site.',
      },
    ],
  },

  cookies: {
    angle: 'Doua surse de cookie-uri, iar una dintre ele este optionala',
    h1: 'Politica de cookie-uri',
    title: 'Politica de cookie-uri | Livdar',
    metaDescription:
      'Fiecare cookie pe care il poate seta site-ul, ce face si cat dureaza. Unul este necesar, restul exista doar daca accepti statisticile.',
    sectionOrder: ['intro', 'necesare', 'statistica', 'marketing', 'control', 'faq'],
    intro: [
      'Pagina aceasta enumera cookie-urile pe care site-ul le poate seta cu adevarat. Este scurta, pentru ca site-ul face foarte putin: fara conturi, fara publicitate si fara continut tert incorporat.',
      'Cookie-urile sunt grupate exact cum le grupeaza bannerul, deci ce alegi acolo corespunde unu la unu cu ce este descris aici.',
    ],
    sections: {
      necesare: {
        heading: 'Necesare',
        body: [
          'livdar_consent. Pastreaza raspunsul tau la banner, ca site-ul sa il respecte si sa nu mai intrebe. Contine doua valori de tip adevarat sau fals, una pentru statistica si una pentru marketing, plus un numar de versiune si o data. Nu contine niciun identificator si nimic care sa te descrie. Dureaza 180 de zile si este pus de Livdar, nu de un tert.',
          'Este singurul cookie setat fara acordul tau prealabil, si este setat tocmai pentru ca ai facut o alegere. Cookie-urile necesare nu cer consimtamant, pentru ca fara acesta bannerul ar reaparea pe fiecare pagina.',
        ],
      },
      statistica: {
        heading: 'Statistica, doar daca le accepti',
        body: [
          'Google Analytics 4, incarcat prin Tag Manager, seteaza cookie-uri din familia _ga. Ele deosebesc o vizita de alta si un browser care revine de unul nou, ca sa stim cati oameni citesc o pagina, nu de cate ori a fost incarcata.',
          'Se seteaza doar dupa ce accepti statisticile. Daca refuzi, Consent Mode tine stocarea pentru analiza pe refuzat si nu se scrie nimic.',
          'Microsoft Clarity ar intra tot in grupa aceasta. Este pregatit in cod, dar inactiv, deci momentan nu seteaza nimic.',
        ],
      },
      marketing: {
        heading: 'Marketing',
        body: [
          'Niciunul azi. Bannerul ofera alegerea pentru ca infrastructura de consimtamant si containerul sunt deja construite pentru ea, si pentru ca a porni publicitate mai tarziu fara sa intrebam ar fi ordinea gresita.',
          'Cat timp sectiunea aceasta spune niciunul, acceptarea marketingului nu are efect practic dincolo de inregistrarea preferintei tale. Daca se schimba, se schimba si pagina.',
        ],
      },
      control: {
        heading: 'Cum le controlezi',
        body: [
          'Din banner. Accepta tot, Refuza, sau Preferinte daca vrei sa alegi separat statistica si marketingul.',
          'Ca sa te razgandesti mai tarziu, sterge cookie-ul livdar_consent din setarile browserului si reincarca site-ul. Bannerul va intreba din nou.',
          'Orice browser important iti permite si sa blochezi sau sa stergi cookie-urile complet. Site-ul functioneaza si asa, doar ca te va intreba la fiecare vizita.',
        ],
      },
    },
    faq: [
      {
        q: 'Cate cookie-uri pune Livdar de la sine?',
        a: 'Unul singur, livdar_consent, si doar dupa ce raspunzi la banner.',
      },
      {
        q: 'Ce se intampla daca apas Refuza?',
        a: 'Nu se scrie niciun cookie de analiza, iar Consent Mode ramane pe refuzat. Se pastreaza doar cookie-ul de consimtamant.',
      },
      {
        q: 'Exista cookie-uri de publicitate?',
        a: 'Niciunul in acest moment. Categoria exista pentru ca infrastructura o suporta, nu pentru ca o foloseste ceva.',
      },
      {
        q: 'Folositi cookie-uri pentru cos?',
        a: 'Nu exista inca un cos. Cand se construieste checkout-ul, pagina va enumera ce are nevoie inainte sa intre in functiune.',
      },
    ],
  },
};

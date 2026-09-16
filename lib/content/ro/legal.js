// Confidentialitate si cookie-uri, piata romaneasca.
//
// Textele juridice descriu aceeasi realitate pe fiecare piata. Spre deosebire
// de paginile editoriale, ele au voie sa coincida ca fond. Formularea insa este
// scrisa pentru cititorul roman, cu termenii folositi aici.

export const legal = {
  privacy: {
    angle: 'Ce colectează site-ul azi, și este mai puțin decât de obicei',
    h1: 'Politica de confidențialitate',
    title: 'Politica de confidențialitate | Livdar',
    metaDescription:
      'Ce colectează Livdar, de ce, cât timp păstrează și ce drepturi ai. Scrisă după ce face efectiv site-ul, nu după un șablon.',
    sectionOrder: ['intro', 'operator', 'date', 'analiză', 'lista', 'viitor', 'destinatari', 'durata', 'drepturi', 'modificări', 'faq'],
    intro: [
      'Livdar este un site de conectivitate pentru călătorii aflat într-o fază incipientă. Nu se vând planuri, nu se încasează plăți și nu este conectat niciun furnizor, deci politica aceasta descrie mult mai puțină prelucrare decât un magazin comparabil.',
      'Preferăm o politica scurtă și adevărată acum, pe care o extindem când începem să vindem, decât una lungă care descrie lucruri pe care nu le facem.',
    ],
    sections: {
      operator: {
        heading: 'Cine răspunde',
        body: [
          'Operatorul pentru puținele date descrise mai jos este Livdar MVP. Ținem să fim exacți în privința a ce înseamnă asta: Livdar MVP este un proiect aflat într-o fază incipientă, nu o societate înregistrată. Nu există un număr de înmatriculare de citat, nu există cod fiscal și nu există sediu social, pentru că niciunul nu există încă.',
          'O spunem direct, în loc să completăm câmpurile acelea cu ceva care suna credibil. O politica ce sugerează o persoana juridică acolo unde nu există una induce în eroare exact omul pe care ar trebui să îl protejeze.',
          'Pentru orice întrebare despre politica aceasta sau despre datele tale, scrie la livdarlive@gmail.com. Adresa este citită de oamenii care duc proiectul.',
          'Când Livdar va fi înregistrată ca societate, secțiunea aceasta va numi firma, înregistrarea și sediul, și va fi actualizată înainte să se vândă ceva pe site.',
        ],
      },
      date: {
        heading: 'Ce colectăm',
        body: [
          'Un cookie numit livdar_consent, care păstrează doar alegerea ta privind statisticile și marketingul. Nu conține niciun identificator, se scrie doar după ce răspunzi la banner și durează 180 de zile. Este necesar ca site-ul să îți respecte alegerea, deci nu are nevoie el însuși de consimțământ.',
          'Date de măsurare prin Google Analytics 4, și doar dacă permiți cookie-urile de statistica. Includ paginile vizitate, o localizare aproximativă dedusă din adresa IP, tipul de dispozitiv și de browser, limba paginii și acțiunile de pe ea, cum ar fi o căutare de destinație.',
          'Jurnalele de server păstrate de furnizorul de găzduire pentru securitate și disponibilitate, care conțin adrese IP pentru o perioada scurtă.',
          'Asta este toată lista de azi. Nu avem conturi, nu avem newsletter, nu rulăm pixeli de publicitate și nu vindem date către brokeri.',
        ],
      },
      analiza: {
        heading: 'Analiza și Consent Mode',
        body: [
          'Analiza rulează prin Google Tag Manager, container GTM-WKGXHXWC, care încarcă Google Analytics 4 pe proprietatea G-DY02HH34DT. Contul Google din spatele lor aparține Livdar și nu este partajat cu niciun alt proiect.',
          'Google Consent Mode v2 este implementat. Înainte să răspunzi la banner, stocarea pentru analiză, stocarea publicitară, datele publicitare și personalizarea publicitară sunt toate pe refuzat, iar aceste valori implicite sunt scrise în pagină înainte ca managerul de etichete să aibă voie să se încarce. Nimic legat de măsurare nu rulează înaintea alegerii tale.',
          'Dacă accepți statisticile, stocarea pentru analiză este permisă și Google Analytics își setează propriile cookie-uri. Dacă refuzi, rămâne refuzată și nu se scrie niciun cookie de analiză.',
          'Microsoft Clarity este pregătit în cod, dar inactiv. Se încarcă doar dacă este configurat un identificator de proiect și va fi supus aceleiași condiții de consimțământ. Politica va fi actualizată în ziua în care se întâmplă asta.',
          'Temeiul legal pentru analiză este consimtamantul tău, conform articolului 6 alineatul 1 litera a din Regulamentul general privind protecția datelor. Îl poți retrage oricând.',
        ],
      },
      lista: {
        heading: 'Anunțare și lista de așteptare',
        body: [
          'Interfața îți oferă să te anunțe când apar planuri pentru o destinație. Cât timp niciun furnizor nu este conectat, acesta este doar un semnal de interes: clicul este înregistrat ca eveniment anonim de analiză, dacă ai consimțit, și nu se colectează și nu se stochează nicio dată de contact.',
          'Dacă și când vom colecta o adresă de email pentru asta, se va face pe baza consimțământului tău explicit și va fi folosită doar pentru acea unică notificare. Secțiunea aceasta o va spune înainte să apară vreun formular.',
        ],
      },
      viitor: {
        heading: 'Ce se schimbă când începem să vindem',
        body: [
          'Când un furnizor de eSIM va fi conectat, va trebui să transmitem către el informațiile necesare activării unui profil. Furnizorul va fi numit aici înainte să fie posibilă orice comanda.',
          'Când plățile vor fi activate, un procesator de plăți va gestiona tranzacția. Livdar nu va stoca în niciun moment numere de card complete. Și acest procesator va fi numit aici înainte să se deschidă checkout-ul.',
          'Niciunul dintre aceste lucruri nu este posibil azi pe site. Checkout-ul este dezactivat în cod, iar build-ul pică dacă cineva încearcă să îl pornească fără furnizor conectat.',
        ],
      },
      destinatari: {
        heading: 'Cine mai vede datele',
        body: [
          'Google, ca furnizor de Analytics și Tag Manager, doar pentru datele descrise mai sus și doar cu consimtamantul tău.',
          'Furnizorul nostru de găzduire, care servește paginile și păstrează jurnale de server de scurtă durata.',
          'Nimeni altcineva. Nu există rețele de publicitate, nu există trackere de afiliere și nu există instrumente terțe de chat sau de hărți de căldura active pe acest site.',
          'Google poate prelucra date în afară Spațiului Economic European. Aceste transferuri se bazează pe decizia de adecvare a Comisiei Europene pentru Statele Unite și, acolo unde nu se aplică, pe clauze contractuale standard.',
        ],
      },
      durata: {
        heading: 'Cât timp păstrăm',
        body: [
          'Cookie-ul de consimțământ: 180 de zile sau până îl ștergi tu.',
          'Datele de analiză din Google Analytics: 14 luni de la colectare, după care sunt șterse automat de setarea de retenție a proprietății.',
          'Jurnalele de server: o perioada scurtă stabilită de furnizorul de găzduire, măsurată în zile, nu în luni.',
        ],
      },
      drepturi: {
        heading: 'Drepturile tale',
        body: [
          'Conform Regulamentului general privind protecția datelor ai dreptul de acces, de rectificare, de ștergere, de restricționare a prelucrării, de opoziție și de portabilitate. Acolo unde prelucrarea se bazează pe consimțământ, îl poți retrage oricând, fără să afectezi legalitatea prelucrării de dinainte.',
          'Pentru că site-ul nu are conturi, de obicei nu te putem identifică din datele pe care le deținem. Este intenționat, nu o scuza. Dacă îți exerciți un drept, este posibil să îți cerem informații care ne permit să găsim înregistrările relevante, iar dacă sincer nu te putem identifică, o vom spune în loc să ghicim.',
          'Scrie la livdarlive@gmail.com. Dacă nu ești mulțumit de răspuns, Regulamentul general privind protecția datelor îți permite să depui plângere la autoritatea de protecție a datelor din țară în care locuiești, în care lucrezi sau în care consideri că s-a produs problemă.',
        ],
      },
      modificari: {
        heading: 'Modificări ale politicii',
        body: [
          'Politica se schimbă când se schimbă site-ul, concret la conectarea unui furnizor, la deschiderea plăților și dacă se activează Clarity. Fiecare dintre ele este o schimbare reală a ce se întâmplă cu datele tale și fiecare va fi reflectată aici înainte să între în funcțiune, nu după.',
        ],
      },
    },
    faq: [
      {
        q: 'Colectați ceva înainte să răspund la banner?',
        a: 'Nimic de analiză. Valorile implicite din Consent Mode sunt pe refuzat înainte ca managerul de etichete să se încarce. Jurnalul serverului înregistrează cererea în sine, ca orice server web.',
      },
      {
        q: 'Pot folosi site-ul dacă refuz tot?',
        a: 'Da, complet. Refuzul oprește doar măsurarea. Toate paginile, căutarea de destinații și schimbarea limbii funcționează identic.',
      },
      {
        q: 'Cum îmi retrag consimtamantul?',
        a: 'Șterge cookie-ul livdar_consent din setările browserului. Bannerul va întreba din nou la urmatoarea vizită.',
      },
      {
        q: 'Vindeți datele mele?',
        a: 'Nu. Nu există rețele de publicitate, brokeri de date sau trackere de afiliere pe acest site.',
      },
    ],
  },

  cookies: {
    angle: 'Două surse de cookie-uri, iar una dintre ele este opțională',
    h1: 'Politica de cookie-uri',
    title: 'Politica de cookie-uri | Livdar',
    metaDescription:
      'Fiecare cookie pe care îl poate seta site-ul, ce face și cât durează. Unul este necesar, restul există doar dacă accepți statisticile.',
    sectionOrder: ['intro', 'necesare', 'statistica', 'marketing', 'control', 'faq'],
    intro: [
      'Pagina aceasta enumeră cookie-urile pe care site-ul le poate seta cu adevărat. Este scurtă, pentru că site-ul face foarte puțin: fără conturi, fără publicitate și fără conținut terț încorporat.',
      'Cookie-urile sunt grupate exact cum le grupează bannerul, deci ce alegi acolo corespunde unu la unu cu ce este descris aici.',
    ],
    sections: {
      necesare: {
        heading: 'Necesare',
        body: [
          'livdar_consent. Păstrează răspunsul tău la banner, ca site-ul să îl respecte și să nu mai întrebe. Conține două valori de tip adevărat sau fals, una pentru statistica și una pentru marketing, plus un număr de versiune și o dată. Nu conține niciun identificator și nimic care să te descrie. Durează 180 de zile și este pus de Livdar, nu de un terț.',
          'Este singurul cookie setat fără acordul tău prealabil, și este setat tocmai pentru că ai făcut o alegere. Cookie-urile necesare nu cer consimțământ, pentru că fără acesta bannerul ar reaparea pe fiecare pagină.',
        ],
      },
      statistica: {
        heading: 'Statistica, doar dacă le accepți',
        body: [
          'Google Analytics 4, încărcat prin Tag Manager, setează cookie-uri din familia _ga. Ele deosebesc o vizită de alta și un browser care revine de unul nou, că să știm câți oameni citesc o pagină, nu de câte ori a fost încărcată.',
          'Se setează doar după ce accepți statisticile. Dacă refuzi, Consent Mode ține stocarea pentru analiză pe refuzat și nu se scrie nimic.',
          'Microsoft Clarity ar intră tot în grupa aceasta. Este pregătit în cod, dar inactiv, deci momentan nu setează nimic.',
        ],
      },
      marketing: {
        heading: 'Marketing',
        body: [
          'Niciunul azi. Bannerul oferă alegerea pentru că infrastructura de consimțământ și containerul sunt deja construite pentru ea, și pentru că a porni publicitate mai târziu fără să întrebăm ar fi ordinea greșită.',
          'Cât timp secțiunea aceasta spune niciunul, acceptarea marketingului nu are efect practic dincolo de înregistrarea preferinței tale. Dacă se schimbă, se schimbă și pagina.',
        ],
      },
      control: {
        heading: 'Cum le controlezi',
        body: [
          'Din banner. Acceptă tot, Refuză, sau Preferințe dacă vrei să alegi separat statistica și marketingul.',
          'Ca să te răzgândești mai târziu, șterge cookie-ul livdar_consent din setările browserului și reîncarcă site-ul. Bannerul va întreba din nou.',
          'Orice browser important îți permite și să blochezi sau să ștergi cookie-urile complet. Site-ul funcționează și așa, doar că te va întreba la fiecare vizită.',
        ],
      },
    },
    faq: [
      {
        q: 'Câte cookie-uri pune Livdar de la sine?',
        a: 'Unul singur, livdar_consent, și doar după ce răspunzi la banner.',
      },
      {
        q: 'Ce se întâmplă dacă apăs Refuză?',
        a: 'Nu se scrie niciun cookie de analiză, iar Consent Mode rămâne pe refuzat. Se păstrează doar cookie-ul de consimțământ.',
      },
      {
        q: 'Există cookie-uri de publicitate?',
        a: 'Niciunul în acest moment. Categoria există pentru că infrastructura o suportă, nu pentru că o folosește ceva.',
      },
      {
        q: 'Folosiți cookie-uri pentru coș?',
        a: 'Nu există încă un coș. Când se construiește checkout-ul, pagina va enumeră ce are nevoie înainte să între în funcțiune.',
      },
    ],
  },
};

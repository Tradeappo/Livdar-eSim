// Regionenseiten, deutscher Markt.
//
// Der deutsche Leser hat EU Roaming bereits inklusive. Das ist der Ausgangspunkt
// jeder Seite hier: die Frage lautet nie "brauche ich Daten", sondern "wo hoert
// mein Tarif auf zu gelten". Deshalb stehen die Schweiz, die Tuerkei und der
// Balkan im Mittelpunkt und nicht Frankreich oder Italien.
//
// Keine Uebersetzung der englischen Seiten. Anderer Markt, andere Frage.

export const regions = {
  europe: {
    angle: 'Drei Laender mitten in Europa, in denen Ihr Tarif nicht gilt',
    h1: 'eSIM fuer Europa',
    title: 'Europa eSIM: wo EU Roaming endet',
    metaDescription:
      'Innerhalb der EU brauchen Sie nichts. Entscheidend ist, wo Ihr Tarif aufhoert zu gelten, und das passiert mitten auf dem Kontinent.',
    sectionOrder: ['intro', 'eu', 'luecken', 'fairuse', 'entscheiden', 'faq'],
    intro: [
      'Fuer einen deutschen Tarif ist Europa zum groessten Teil erledigt. Roam like at home gilt in allen EU Staaten sowie in Island, Liechtenstein und Norwegen, und zwar zum Inlandspreis. Wer nach Mallorca oder nach Rom faehrt, braucht von uns nichts.',
      'Interessant wird es genau dort, wo diese Regelung aufhoert. Und sie hoert nicht am Rand des Kontinents auf, sondern mittendrin.',
    ],
    sections: {
      eu: {
        heading: 'Was Ihr Tarif ohnehin abdeckt',
        body: [
          'Die siebenundzwanzig EU Staaten plus Island, Liechtenstein und Norwegen. Ihr Datenvolumen reist mit, die Abrechnung bleibt die gleiche. Es gibt kein Reiseprodukt, das guenstiger ist als inklusive.',
          'Wir sagen das deutlich, weil ein grosser Teil der Suchanfragen aus Deutschland zu Reise eSIMs Reiseziele betrifft, fuer die man schlicht nichts kaufen muss.',
        ],
      },
      luecken: {
        heading: 'Die Luecken, die wirklich zaehlen',
        body: [
          'Die Schweiz liegt in der Mitte Europas und ausserhalb der Regelung. Wer mit dem Auto nach Italien faehrt und den Gotthard nimmt, verlaesst auf halber Strecke seinen Tarif. Das ist die haeufigste teure Ueberraschung im deutschsprachigen Raum.',
          'Dazu kommen die Tuerkei, Albanien, Serbien, Bosnien und Herzegowina, Nordmazedonien und Montenegro. Alles europaeische Reiseziele, alles ausserhalb der Roaming Zone.',
          'Grossbritannien ist der vierte Fall. Seit dem Brexit ist EU Roaming dort kein Rechtsanspruch mehr, und die Abrechnung haengt vom jeweiligen Anbieter ab.',
        ],
      },
      fairuse: {
        heading: 'Fair Use, der Punkt fuer laengere Aufenthalte',
        body: [
          'Roam like at home ist fuer Reisen gedacht, nicht fuer das dauerhafte Leben im Ausland. Anbieter duerfen bei unbegrenzten Inlandstarifen ein Volumenlimit fuer das Roaming setzen und duerfen nachfragen, wenn jemand ueber vier Monate mehr Zeit im Ausland als zu Hause verbringt.',
          'Fuer zwei Wochen Urlaub ist das irrelevant. Fuer einen Winter in Spanien oder ein Semester in Portugal lohnt sich ein Blick in den eigenen Vertrag, bevor man sich darauf verlaesst.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie in einer Minute entscheiden',
        body: [
          'Zaehlen Sie nicht die Laender, sondern die Tarifzonen auf Ihrer Route. Eine Reise von Muenchen nach Zagreb ueber die Schweiz ist nicht eine Zone, sondern zwei.',
          'Bleibt alles innerhalb der EU, brauchen Sie nichts. Ist genau ein Land ausserhalb, kaufen Sie fuer dieses Land. Sind mehrere ausserhalb, etwa auf einer Balkanroute, lohnt ein regionaler Tarif.',
        ],
      },
    },
    faq: [
      {
        q: 'Gilt mein deutscher Tarif in der Schweiz?',
        a: 'Nein. Die Schweiz ist nicht Teil der EU Roaming Regelung, obwohl sie mitten in Europa liegt. Das ist der haeufigste Grund fuer unerwartet hohe Rechnungen.',
      },
      {
        q: 'Brauche ich innerhalb der EU ueberhaupt etwas?',
        a: 'Normalerweise nicht. Ihr Inlandsvolumen gilt in der gesamten EU sowie in Island, Liechtenstein und Norwegen zum gleichen Preis.',
      },
      {
        q: 'Was gilt fuer die Tuerkei?',
        a: 'Die Tuerkei liegt ausserhalb der Roaming Zone. Zusaetzlich gibt es dort eine Registrierungspflicht fuer Geraete, die bei einer lokalen SIM Karte relevant wird.',
      },
      {
        q: 'Was ist mit Grossbritannien nach dem Brexit?',
        a: 'Inklusives EU Roaming ist dort kein Rechtsanspruch mehr. Ob Ihr Anbieter es freiwillig weiterfuehrt, steht in Ihrem Tarif.',
      },
    ],
  },

  asia: {
    angle: 'Der Kontinent, auf dem die lokale Karte fast immer guenstiger ist',
    h1: 'eSIM fuer Asien',
    title: 'Asien eSIM: Bequemlichkeit statt Ersparnis',
    metaDescription:
      'Prepaid Daten in Asien sind guenstiger als jedes Reiseprodukt. Eine Reise eSIM kaufen Sie fuer die Ankunft, nicht fuer den Preis.',
    sectionOrder: ['intro', 'preis', 'ankunft', 'grenzen', 'praktisch', 'faq'],
    intro: [
      'In Asien ist die ehrliche Antwort unbequem fuer jeden Anbieter von Reise eSIMs: die lokale Prepaid Karte ist in den meisten Laendern deutlich guenstiger. In Vietnam, Indonesien oder Thailand kostet ein Monat grosszuegiges Datenvolumen weniger als ein Kaffee am Flughafen.',
      'Die Frage lautet hier also nicht, ob Sie Geld sparen. Das tun Sie nicht. Die Frage ist, was Ihnen die erste Stunde nach der Landung wert ist.',
    ],
    sections: {
      preis: {
        heading: 'Was die lokale Karte besser kann',
        body: [
          'Den Preis, und die Rufnummer. Eine lokale Nummer ist in Asien praktischer als in Europa, weil Fahrdienste, Lieferdienste und Hotelbestaetigungen haeufig eine SMS an eine inlaendische Nummer schicken.',
          'Wer laenger bleibt und ohnehin in einer Stadt ankommt, faehrt mit der lokalen Karte in der Regel besser.',
        ],
      },
      ankunft: {
        heading: 'Was die Reise eSIM besser kann',
        body: [
          'Die Ankunft. Sie installieren zu Hause, landen, sind verbunden und bestellen ein Taxi. Kein Schalter, kein Formular, kein Pass, der kopiert wird.',
          'Besonders deutlich ist der Vorteil in Japan und Suedkorea. Dort ist der Prepaid Markt auf Einwohner und auf Leihgeraete ausgerichtet, nicht auf Touristen, die kurz etwas kaufen wollen.',
        ],
      },
      grenzen: {
        heading: 'Mehrere Laender aendern die Rechnung',
        body: [
          'Eine lokale SIM ist ein nationales Produkt. An der naechsten Grenze hoert sie auf oder wird teuer. Wer Bangkok, Siem Reap und Ho Chi Minh Stadt in einer Reise verbindet, kauft dreimal oder einmal regional.',
          'Ab dem zweiten Land kippt die Rechnung haeufig zugunsten des regionalen Tarifs, nicht wegen des Preises, sondern wegen der Wiederholung.',
        ],
      },
      praktisch: {
        heading: 'Zwei Dinge vor dem Abflug',
        body: [
          'Pruefen Sie, ob Ihr Geraet einen SIM Lock hat. Ein gesperrtes Handy nimmt kein fremdes Profil an, und das merkt man besser zu Hause als nachts am Flughafen.',
          'Pruefen Sie ausserdem, ob Sie eine SMS an Ihre deutsche Nummer brauchen, etwa fuer das Banking. Ein reiner Datentarif liefert keine Rufnummer, weder hier noch anderswo.',
        ],
      },
    },
    faq: [
      {
        q: 'Ist eine Reise eSIM in Asien guenstiger als eine lokale Karte?',
        a: 'In aller Regel nicht. Lokale Prepaid Daten sind in den meisten asiatischen Laendern guenstiger als jedes Reiseprodukt.',
      },
      {
        q: 'Bekomme ich eine Rufnummer?',
        a: 'Bei einem reinen Datentarif nicht. Wer eine lokale Nummer fuer Fahrdienste oder Verifizierungen braucht, kauft vor Ort.',
      },
      {
        q: 'Wo ist der Kauf vor Ort besonders unbequem?',
        a: 'In Japan und Suedkorea. Der dortige Prepaid Markt richtet sich an Einwohner und an Leihgeraete, nicht an durchreisende Touristen.',
      },
      {
        q: 'Lohnt ein regionaler Tarif?',
        a: 'Ab zwei bis drei Laendern in einer Reise ja, weil sonst jede Grenze einen neuen Kauf bedeutet.',
      },
    ],
  },

  'southeast-asia': {
    angle: 'Die Region, in der Rucksackrouten wirklich fuenf Grenzen kreuzen',
    h1: 'eSIM fuer Suedostasien',
    title: 'Suedostasien eSIM: fuer Routen ueber mehrere Grenzen',
    metaDescription:
      'Vier oder fuenf Laender in einer Reise sind in Suedostasien normal. Genau dafuer ist ein regionaler Tarif gedacht.',
    sectionOrder: ['intro', 'route', 'lokal', 'abdeckung', 'entscheiden', 'faq'],
    intro: [
      'Die meisten regionalen Tarife werden mit einem Szenario verkauft, das selten eintritt. In Suedostasien tritt es ein. Zwei Monate durch Thailand, Laos, Vietnam, Kambodscha und Malaysia sind hier eine gewoehnliche Reise.',
      'Damit aendert sich die Rechnung. Fuenfmal lokal kaufen heisst fuenf Registrierungen, fuenf Nummern und fuenf Restguthaben, die niemand mehr verbraucht.',
    ],
    sections: {
      route: {
        heading: 'Zaehlen Sie die Grenzen',
        body: [
          'Ein Land, zwei Wochen: lokal kaufen und den guenstigen Preis mitnehmen. Drei oder mehr Laender in einem Monat: regionaler Tarif, und das Thema ist erledigt.',
          'Zwei Laender sind der Grenzfall. Ist das zweite nur ein Abstecher, lohnt sich lokal. Ist es eine eigene Woche, gewinnt meist der regionale Tarif ueber die Bequemlichkeit.',
        ],
      },
      lokal: {
        heading: 'Was lokal wirklich kostet',
        body: [
          'Sehr wenig, und das gehoert zur Wahrheit dazu. Vietnamesische, indonesische und thailaendische Prepaid Daten sind so guenstig, dass jeder Reisetarif auf dem Papier schlecht aussieht.',
          'Was auf dem Papier fehlt, ist die Registrierungspflicht. Thailand, Indonesien und Vietnam verlangen Ausweisdokumente. Das ist in Ruhe machbar und bei einem Anschlussflug aergerlich.',
        ],
      },
      abdeckung: {
        heading: 'Abdeckung ist nicht ueberall gleich',
        body: [
          'In den Staedten ist die Abdeckung gut, teilweise besser als im laendlichen Europa. Bangkok, Kuala Lumpur, Singapur und Ho Chi Minh Stadt sind dicht versorgt.',
          'Auf kleinen indonesischen und philippinischen Inseln, in Teilen von Laos und in den Bergen Nordvietnams ist sie duenn oder gar nicht vorhanden. Das gilt fuer jedes Profil gleichermassen.',
        ],
      },
      entscheiden: {
        heading: 'Praktische Entscheidung',
        body: [
          'Schreiben Sie zuerst die Route auf, dann den Preis. Bleibt alles in einem Land, ist es eine Laenderentscheidung. Kreuzt die Route Grenzen, ist es eine regionale.',
          'Und pruefen Sie den SIM Lock, bevor Sie fliegen. Es ist der haeufigste Grund, warum ein einwandfreies Profil sich nicht installieren laesst.',
        ],
      },
    },
    faq: [
      {
        q: 'Ab wie vielen Laendern lohnt ein regionaler Tarif?',
        a: 'Ab drei Laendern in einem Monat eindeutig. Bei zwei ist es Abwaegung, bei einem kaufen Sie fuer das Land.',
      },
      {
        q: 'Ist die Abdeckung auf den Inseln gut?',
        a: 'Unterschiedlich, und kein Tarif aendert daran etwas. Grosse Inseln sind versorgt, kleine haeufig nicht.',
      },
      {
        q: 'Muss ich mich fuer eine lokale Karte ausweisen?',
        a: 'In den meisten Laendern der Region ja. Eine Reise eSIM umgeht diesen Schritt.',
      },
      {
        q: 'Bekomme ich in jedem Land eine Nummer?',
        a: 'Nein. Reine Datentarife haben nirgends eine Rufnummer.',
      },
    ],
  },

  'north-america': {
    angle: 'Drei Laender, drei Tarifzonen, kein EU Netz zum Zurueckfallen',
    h1: 'eSIM fuer Nordamerika',
    title: 'Nordamerika eSIM: drei Laender, drei Abrechnungen',
    metaDescription:
      'USA, Kanada und Mexiko sehen nach einer Reise aus und rechnen wie drei. Fuer deutsche Tarife ist das die teuerste Region ueberhaupt.',
    sectionOrder: ['intro', 'usa', 'grenzen', 'abdeckung', 'entscheiden', 'faq'],
    intro: [
      'Nordamerika ist fuer deutsche Reisende die Region, in der Roaming am wenigsten verzeiht. Es gibt keine Regelung wie in der EU, auf die man zurueckfallen koennte. Was Sie zahlen, hat Ihr Anbieter fuer einen anderen Kontinent festgelegt.',
      'Auf der Karte sieht es aus wie ein Reiseziel. Auf der Rechnung sind es drei.',
    ],
    sections: {
      usa: {
        heading: 'Die USA sind eine eigene Entscheidung',
        body: [
          'Die Netze sind dicht, schnell und fuer Besucher teuer. In den Staedten und entlang der Interstates ist die Abdeckung hervorragend. Im Landesinneren, in den Nationalparks und auf langen Wuestenstrecken ist sie duenner, als die meisten erwarten.',
          'Auffaellig ist, dass ein grosser Teil der Suchanfragen in dieser Region gar nicht die Abdeckung betrifft, sondern die Fehlersuche: installiert, aber keine Verbindung. Die Ursache ist fast immer eine Einstellung, nicht das Produkt.',
        ],
      },
      grenzen: {
        heading: 'Kanada und Mexiko',
        body: [
          'Ein Tarif fuer die USA gilt an der Grenze nicht automatisch weiter. Manche amerikanischen Vertraege schliessen Kanada und Mexiko ein, viele nicht.',
          'Wer aus Europa anreist und zwei der drei Laender besucht, ist genau in dem Fall, fuer den ein regionaler Tarif gedacht ist.',
        ],
      },
      abdeckung: {
        heading: 'Was Sie erwarten koennen',
        body: [
          'Kanadas Abdeckung folgt der Bevoelkerung, also dem sueldlichen Band und den Fernstrassen. Noerdlich davon gibt es geografische Luecken, keine kommerziellen.',
          'In Mexiko sind Staedte, Kuestenorte und Hauptstrassen gut versorgt, die Berge und kleinere Orte im Landesinneren weniger.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Ein Land, ein Landertarif. Zwei oder drei Laender, ein regionaler Tarif, weil genau an den Grenzen die Rechnung entgleist.',
          'Und laden Sie Karten vorher herunter. In den Parks ist Offline der Normalfall, nicht die Ausnahme.',
        ],
      },
    },
    faq: [
      {
        q: 'Gilt ein US Tarif auch in Kanada und Mexiko?',
        a: 'Nicht automatisch. Manche amerikanischen Vertraege schliessen beide ein, viele nicht.',
      },
      {
        q: 'Habe ich in Nationalparks Empfang?',
        a: 'Oft nicht, bei keinem Anbieter. Die Luecken im amerikanischen Westen sind geografisch und betreffen alle gleich.',
      },
      {
        q: 'Warum wird so oft nach Fehlersuche gesucht?',
        a: 'Weil die installierte Basis gross ist und der Fehler meist eine Einstellung ist. Ausgeschaltetes Datenroaming ist die haeufigste einzelne Ursache.',
      },
      {
        q: 'Bekomme ich eine amerikanische Rufnummer?',
        a: 'Bei einem reinen Datentarif nicht.',
      },
    ],
  },

  'south-america': {
    angle: 'Weite Strecken, echte Grenzen, keine gemeinsame Regelung',
    h1: 'eSIM fuer Suedamerika',
    title: 'Suedamerika eSIM: weite Wege und echte Grenzen',
    metaDescription:
      'Suedamerikareisen decken grosse Entfernungen und mehrere Grenzen ab. Zwischen den Laendern gibt es keine gemeinsame Roaming Regelung.',
    sectionOrder: ['intro', 'entfernungen', 'grenzen', 'brasilien', 'inlandsfluege', 'entscheiden', 'faq'],
    intro: [
      'Suedamerikanische Reisen sind lang. Ein Monat bedeutet hier haeufig drei oder vier Laender und mehrere Inlandsfluege, und zwischen guter und gar keiner Abdeckung liegen Stunden statt Minuten.',
      'Lange Routen und echte Grenzen sind der Grund, warum man Verbindung hier planen sollte statt zu improvisieren.',
    ],
    sections: {
      entfernungen: {
        heading: 'Die Abdeckung folgt den Staedten',
        body: [
          'Buenos Aires, Santiago, Lima, Bogota und die brasilianischen Kuestenstaedte sind gut versorgt. Die Anden, das Amazonasbecken, Patagonien und die langen Busstrecken dazwischen nicht.',
          'Planen Sie offline. Karte herunterladen, Ticket speichern, Adresse als Screenshot. Dieser Rat gilt unabhaengig davon, was Sie kaufen.',
        ],
      },
      grenzen: {
        heading: 'Zwischen den Laendern gibt es keine Regelung',
        body: [
          'Es existiert nichts, was der europaeischen Regelung entspraeche. Von Argentinien nach Chile oder von Peru nach Bolivien bedeutet ein neuer Anbieter und ein neuer Tarif.',
          'Fuer ein Land ist der lokale Kauf guenstig und einfach. Auf der klassischen Mehrlaenderroute summieren sich Kaeufe und Restguthaben schneller, als der Preisunterschied vermuten laesst.',
        ],
      },
      brasilien: {
        heading: 'Brasilien ist ein eigener Markt',
        body: [
          'Brasilien ist gross genug und anders genug, um nicht als Teil Suedamerikas behandelt zu werden. Andere Sprache, anderes Suchvokabular, andere Reiseziele.',
          'Fuer deutsche Reisende bleibt Brasilien in dieser Region. Fuer brasilianische Leser ist es ein eigener Markt mit eigenen Seiten.',
        ],
      },
      inlandsfluege: {
        heading: 'Inlandsfluege und Nachtbusse',
        body: [
          'Suedamerikanische Routen bestehen aus wenigen langen Etappen statt vielen kurzen. Ein Nachtbus von Lima nach Cusco oder ein Inlandsflug von Buenos Aires nach El Calafate sind normale Bestandteile einer Reise, und beide finden weitgehend ausserhalb der Netzabdeckung statt.',
          'Praktisch heisst das: Buchungsbestaetigungen, Adressen und Karten vor der Abfahrt speichern. Wer sich darauf verlaesst, unterwegs nachzuschauen, steht in Patagonien oder auf der Altiplano Strecke ohne Daten da, unabhaengig vom gekauften Tarif.',
          'Fuer Reisende, die viele solcher Etappen haben, ist die eigentliche Frage nicht der Tarif, sondern die Offline Vorbereitung. Ein regionaler Tarif nimmt Ihnen das Kaufen an Grenzen ab, nicht das Planen.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Ein Land bis zwei Wochen: Landertarif. Zwei oder mehr Laender oder lange Ueberlandetappen: regionaler Tarif.',
          'Und behandeln Sie die Abdeckung als Planungsgroesse, nicht als Produktmerkmal. Die Luecken sind fuer alle gleich.',
        ],
      },
    },
    faq: [
      {
        q: 'Gibt es freies Roaming zwischen suedamerikanischen Laendern?',
        a: 'Nein. Eine Regelung wie in Europa existiert dort nicht.',
      },
      {
        q: 'Habe ich in Patagonien oder am Amazonas Empfang?',
        a: 'Haeufig nicht, bei keinem Anbieter. Planen Sie beide Regionen offline.',
      },
      {
        q: 'Ist Brasilien in einem Suedamerika Tarif enthalten?',
        a: 'Meist ja. Als Markt behandeln wir Brasilien dennoch getrennt, weil dort anders gesucht wird.',
      },
      {
        q: 'Soll ich lieber vor Ort kaufen?',
        a: 'Fuer ein Land sehr wahrscheinlich. Auf einer Mehrlaenderroute selten.',
      },
    ],
  },

  'central-america': {
    angle: 'Kurze Wege, viele Grenzen, meist mit dem Bus',
    h1: 'eSIM fuer Mittelamerika',
    title: 'Mittelamerika eSIM: kurze Wege, viele Grenzen',
    metaDescription:
      'Sieben Laender auf kurzer Distanz. Eine zweiwoechige Reise kreuzt hier leicht vier Grenzen, und zwar auf der Strasse.',
    sectionOrder: ['intro', 'geografie', 'landweg', 'abdeckung', 'shuttles', 'entscheiden', 'faq'],
    intro: [
      'Mittelamerika bringt sieben Laender auf einer Strecke unter, die man in wenigen Tagen durchfahren kann. Vierzehn Tage reichen fuer Guatemala, Belize, Honduras, Nicaragua und Costa Rica, und das meiste davon passiert auf der Strasse.',
      'Genau diese Landgrenzen machen die Region besonders. Es gibt keinen Flughafen, der einen daran erinnert, dass man das Land gewechselt hat.',
    ],
    sections: {
      geografie: {
        heading: 'Kurze Strecken, viele Anbieter',
        body: [
          'Weil die Etappen kurz sind, unterschaetzen Reisende, wie viele Netze sie beruehren. Eine Woche kann drei nationale Netze mit drei eigenen Besuchertarifen umfassen.',
          'Hier geht es weniger um den Preis als darum, an jedem Schlagbaum nicht nachdenken zu muessen.',
        ],
      },
      landweg: {
        heading: 'Warum Landgrenzen teuer werden',
        body: [
          'Eine Ankunft am Flughafen ist ein klares Signal, etwas zu kaufen. Eine Landgrenze ist es nicht. Der Bus faehrt weiter, das Telefon bucht sich in ein anderes Netz ein, und die Abrechnung beginnt ohne Hinweis.',
          'Wer die Region auf der Strasse bereist, sollte die Verbindung vor der ersten Grenze klaeren, nicht nach der ersten Rechnung.',
        ],
      },
      abdeckung: {
        heading: 'Abdeckung vor Ort',
        body: [
          'Hauptstaedte, die Pazifikkueste und die Hauptstrassen sind gut versorgt. Die Karibikseite, das Hochland und kleinere Orte im Landesinneren sind duenner und je nach Anbieter unterschiedlich.',
          'Costa Rica und Panama stehen am besten da. Im laendlichen Guatemala, Honduras und Nicaragua sollten Sie mit Funkloechern rechnen.',
        ],
      },
      shuttles: {
        heading: 'Shuttles, Faehren und die Rueckfahrt zum Flughafen',
        body: [
          'Der Verkehr zwischen den Laendern laeuft hier ueber private Shuttles, die von Hostel zu Hostel fahren, und ueber kleine Faehren, etwa nach Belize oder zu den Bahia Inseln. Beides wird meist per Nachricht bestaetigt, nicht per Ticket in einer App.',
          'Das macht durchgehende Verbindung praktischer, als es in einer Region mit kurzen Strecken zunaechst klingt. Wer den Shuttle am Vorabend per Nachricht bestaetigt, braucht am Morgen Empfang.',
          'Die Rueckfahrt zum Flughafen ist der zweite Punkt. San Jose, Panama Stadt und Guatemala Stadt liegen haeufig mehrere Stunden von dem Ort entfernt, an dem die Reise endet, und Umbuchungen passieren kurzfristig.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Ein Land: Landertarif. Die klassische Ueberlandroute: regionaler Tarif, weil er genau dafuer gebaut ist.',
          'Und wie ueberall: SIM Lock vor dem Abflug pruefen.',
        ],
      },
    },
    faq: [
      {
        q: 'Brauche ich fuer jedes Land einen eigenen Tarif?',
        a: 'Nur wenn Sie lokal kaufen wollen. Auf einer Ueberlandroute sind das mehrere Kaeufe in zwei Wochen.',
      },
      {
        q: 'Faellt an Landgrenzen Roaming an?',
        a: 'Ja, und meist ohne sichtbaren Hinweis. Das ist der Hauptgrund fuer Ueberraschungen in dieser Region.',
      },
      {
        q: 'Welche Laender haben die beste Abdeckung?',
        a: 'Costa Rica und Panama. Am duennsten sind laendliche Gebiete in Guatemala, Honduras und Nicaragua.',
      },
      {
        q: 'Lohnt ein regionaler Tarif fuer eine Woche?',
        a: 'Nur wenn diese Woche Grenzen kreuzt.',
      },
    ],
  },

  caribbean: {
    angle: 'Jede Insel ist ein eigenes Netz',
    h1: 'eSIM fuer die Karibik',
    title: 'Karibik eSIM: jede Insel ein eigenes Netz',
    metaDescription:
      'Karibische Inseln sind eigene Telekommaerkte, auch wenn sie zwanzig Flugminuten auseinander liegen. Beim Inselhuepfen zaehlt das.',
    sectionOrder: ['intro', 'inseln', 'kreuzfahrt', 'abdeckung', 'fluege', 'entscheiden', 'faq'],
    intro: [
      'Die Karibik sieht im Prospekt nach einem Reiseziel aus und verhaelt sich technisch wie dutzende getrennte Maerkte. Inseln, die zwanzig Flugminuten auseinanderliegen, sind unterschiedliche Laender mit unterschiedlichen Anbietern.',
      'Fuer eine Woche im Resort spielt das kaum eine Rolle. Fuer alle, die huepfen oder segeln, ist es die ganze Frage.',
    ],
    sections: {
      inseln: {
        heading: 'Warum Inselhuepfen die Antwort aendert',
        body: [
          'Eine auf Barbados gekaufte Karte hilft auf St. Lucia nicht. Jede Insel ist ein neuer Kauf oder eine neue Roaming Gebuehr, und die Spruenge sind kurz genug, dass man mehrere pro Woche macht.',
          'Einige regionale Anbieter decken mehrere Inseln unter einer Marke ab. Es lohnt zu pruefen, ob die Inseln Ihrer Route dazugehoeren.',
        ],
      },
      kreuzfahrt: {
        heading: 'Fuer Kreuzfahrtgaeste',
        body: [
          'Auf See verbindet sich Ihr Telefon mit dem Satellitennetz des Schiffs, nicht mit einem Inselnetz. Keine Reise eSIM deckt das ab, und die Tarife dort sind die, von denen die Schauergeschichten handeln.',
          'Praktisch heisst das: Daten auf See aus, im Hafen an.',
        ],
      },
      abdeckung: {
        heading: 'Abdeckung dort, wo Sie wirklich sind',
        body: [
          'Resorts, Kreuzfahrthaefen und Hauptorte der groesseren Inseln sind gut versorgt. Das Landesinnere, kleine Cays und die ruhigeren oestlichen Inseln sind unterschiedlich.',
          'Wetter spielt hier eine Rolle wie kaum anderswo. Im Hurrikanguertel nimmt Infrastruktur Schaden, und der Wiederaufbau braucht Zeit.',
        ],
      },
      fluege: {
        heading: 'Fluege zwischen den Inseln sind kurz und aendern trotzdem alles',
        body: [
          'Die regionalen Fluggesellschaften verbinden die Inseln in zwanzig bis vierzig Minuten. Technisch ist jeder dieser Fluege ein Wechsel des Landes, des Anbieters und des Tarifs, und das faellt bei einer so kurzen Strecke niemandem auf.',
          'Verspaetungen und Umbuchungen sind auf diesen Strecken haeufig und werden per Nachricht kommuniziert. Genau dann brauchen Sie Empfang, und genau dann sind Sie gerade auf einer Insel gelandet, deren Netz Sie nicht gekauft haben.',
          'Wer mehr als zwei Inseln besucht, kauft entweder jedes Mal neu oder einmal regional. Der Preisunterschied ist kleiner als der Unterschied im Aufwand.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Eine Insel, eine Woche: fuer diese Insel kaufen.',
          'Mehrere Inseln oder eine Segelroute: regionaler Tarif, sonst kaufen Sie alle paar Tage neu.',
        ],
      },
    },
    faq: [
      {
        q: 'Gilt ein Tarif auf allen Inseln?',
        a: 'Ein regionaler Tarif ist dafuer gemacht. Eine lokale Karte einer Insel gilt auf der naechsten nicht.',
      },
      {
        q: 'Funktioniert die eSIM auf dem Kreuzfahrtschiff?',
        a: 'Nein. Auf See sind Sie im Satellitennetz des Schiffs, das getrennt abgerechnet wird.',
      },
      {
        q: 'Ist die Abdeckung nach Stuermen beeintraechtigt?',
        a: 'Ja. Das ist der Hurrikanguertel, und Netzschaeden sind real.',
      },
      {
        q: 'Was ist mit dem Landesinneren?',
        a: 'Unterschiedlich. Resorts und Haefen sind versorgt, kleinere Cays haeufig nicht.',
      },
    ],
  },

  'middle-east': {
    angle: 'Ausgezeichnete Netze, aber die Telefonie Apps sind der Haken',
    h1: 'eSIM fuer den Nahen Osten',
    title: 'Naher Osten eSIM: Daten sind einfach, Anrufe nicht immer',
    metaDescription:
      'Die Netze am Golf gehoeren zu den besten der Welt. Ob Ihre gewohnten Telefonie Apps erlaubt sind, ist die eigentliche Frage.',
    sectionOrder: ['intro', 'voip', 'golf', 'abdeckung', 'entscheiden', 'faq'],
    intro: [
      'Der Nahe Osten gehoert zu den am besten versorgten Regionen ueberhaupt. Die Netze am Golf sind schnell, modern und dicht, und die Flughaefen dort sind hervorragend angebunden.',
      'Der Haken liegt nicht bei der Abdeckung, sondern bei den Diensten. Manche Anwendungen, die Sie zu Hause selbstverstaendlich nutzen, sind in einigen Netzen eingeschraenkt. Das ist eine regulatorische Frage, keine technische.',
    ],
    sections: {
      voip: {
        heading: 'Anrufe ueber das Internet',
        body: [
          'Mehrere Laender der Region beschraenken Sprach und Videoanrufe ueber Internetdienste in lokalen Netzen. Nachrichten funktionieren meist, der Anrufknopf nicht immer.',
          'Das trifft Reisende unvorbereitet, die annehmen, ein Datentarif bedeute automatisch Telefonate nach Hause. Pruefen Sie die aktuelle Lage fuer das konkrete Land, denn die Regeln aendern sich.',
        ],
      },
      golf: {
        heading: 'Der Golf ist ein eigener Markt',
        body: [
          'Dubai und die Emirate erzeugen mit Abstand die groesste Besuchernachfrage der Region, und diese Nachfrage wird ueberwiegend auf Englisch formuliert, auch vor Ort.',
          'Die Abdeckung in den Emiraten, Katar, Bahrain und Kuwait ist ausgezeichnet, auch in den Wuestengebieten, in die Besucher gefahren werden.',
        ],
      },
      abdeckung: {
        heading: 'Ausserhalb des Golfs',
        body: [
          'Jordanien, Israel und Oman haben solide Netze dort, wo Reisende sich aufhalten. In Wuesten und Bergregionen wird es duenner, wie ueberall.',
          'Die Tuerkei hat eine eigene Seite und eine eigene Regel zur Geraeteregistrierung, die mit Abdeckung nichts zu tun hat und trotzdem die wichtigste Information der Region ist.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Fuer eine einzelne Golfstadt genuegt ein Landertarif, und das Netz wird Sie nicht enttaeuschen.',
          'Fuer eine Rundreise lohnt der regionale Tarif. In beiden Faellen gilt: Einschraenkungen bei Anrufen vorher pruefen.',
        ],
      },
    },
    faq: [
      {
        q: 'Kann ich ueber WhatsApp oder FaceTime telefonieren?',
        a: 'Das haengt vom Land und vom Netz ab. Mehrere Laender der Region schraenken Internettelefonie ein, waehrend Nachrichten weiter funktionieren.',
      },
      {
        q: 'Ist die Abdeckung in der Wueste gut?',
        a: 'Am Golf erstaunlich gut, auch auf den Routen der Veranstalter. Ausserhalb wird sie duenner.',
      },
      {
        q: 'Brauche ich Arabisch?',
        a: 'Nein. Besucherbezogene Angebote am Golf laufen auf Englisch.',
      },
      {
        q: 'Zaehlt die Tuerkei zum Nahen Osten?',
        a: 'Je nach Tarif unterschiedlich. Die Registrierungsregel dort macht die eigene Seite in jedem Fall lesenswert.',
      },
    ],
  },

  africa: {
    angle: 'Nordafrika ist gut versorgt, der Rest sehr unterschiedlich',
    h1: 'eSIM fuer Afrika',
    title: 'Afrika eSIM: stark im Norden, uneinheitlich sonst',
    metaDescription:
      'Nordafrikanische Netze sind gut und stark bereist. Der Rest des Kontinents ist sehr unterschiedlich, und kein Tarif aendert das Netz vor Ort.',
    sectionOrder: ['intro', 'norden', 'sueden', 'realitaet', 'entscheiden', 'faq'],
    intro: [
      'Afrika ist kein einheitlicher Markt, und wer ihn so behandelt, wird enttaeuscht. Ein Tarif, der vierzig Laender auflistet, beschreibt kommerzielle Vereinbarungen, nicht Ihren Empfang vor Ort.',
      'Die messbare Nachfrage ist konzentriert statt verteilt. Marokko und Aegypten machen einen sehr grossen Teil davon aus, getragen vor allem von europaeischen Reisenden.',
    ],
    sections: {
      norden: {
        heading: 'Nordafrika ist gemeint, wenn Reisende Afrika sagen',
        body: [
          'Marokko, Aegypten und Tunesien tragen den groessten Teil des Besucherverkehrs und haben die Netze dafuer. Staedte, Badeorte und die touristischen Hauptrouten sind solide versorgt.',
          'Keines dieser Laender gehoert zu einer europaeischen Roaming Regelung. Genau deshalb entsteht die Nachfrage.',
        ],
      },
      sueden: {
        heading: 'Suedliches und oestliches Afrika',
        body: [
          'Suedafrika, Kenia und Tansania haben leistungsfaehige staedtische Netze und weit entwickelte Mobilfunkmaerkte. Safarigebiete und Nationalparks sind etwas anderes und sollten offline geplant werden.',
          'Lokale Prepaid Angebote sind dort guenstig und leicht verfuegbar. Der Abwaegung bleibt die uebliche: Preis und Rufnummer gegen eine verbundene Ankunft.',
        ],
      },
      realitaet: {
        heading: 'Lesen Sie die Laenderliste, nicht den Kontinentnamen',
        body: [
          'Ein als Afrika verkaufter Tarif verhaelt sich in Marrakesch voellig anders als im laendlichen Sambia. Ehrlich kauft man hier, indem man die konkreten Laender der Route prueft.',
          'Uns ist lieber, Ihnen zu sagen, dass ein Land duenn versorgt ist, als Ihnen einen Tarif zu verkaufen, der etwas anderes suggeriert.',
          'Ein zweiter Punkt betrifft die Geschwindigkeit. Eine Liste sagt nichts darueber, ob Sie im jeweiligen Land im modernen Netz oder in einer aelteren Technik landen. Fuer Nachrichten reicht beides, fuer Navigation und Videoanrufe nicht immer.',
          'Wenn Ihre Route mehrere Laender umfasst, pruefen Sie die zwei oder drei, in denen Sie wirklich Zeit verbringen, statt die gesamte Liste. Der Rest ist fuer Ihre Reise nicht entscheidend.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Fuer Marokko, Aegypten oder Tunesien allein ist ein Landertarif die saubere Antwort.',
          'Fuer eine Rundreise pruefen Sie, ob jedes relevante Land wirklich versorgt und nicht nur aufgelistet ist, und planen Sie die abgelegenen Etappen offline.',
        ],
      },
    },
    faq: [
      {
        q: 'Warum wird Marokko so haeufig gesucht?',
        a: 'Weil es nah an Europa liegt, stark bereist wird und ausserhalb jeder europaeischen Roaming Regelung steht.',
      },
      {
        q: 'Habe ich auf Safari Empfang?',
        a: 'Oft nicht. Das liegt am Netz, nicht am Produkt. Planen Sie diese Tage offline.',
      },
      {
        q: 'Ist lokales Prepaid eine gute Option?',
        a: 'In Kenia, Tansania und Suedafrika ja, guenstig und einfach. Der Preis ist die Registrierung bei der Ankunft.',
      },
      {
        q: 'Funktioniert ein kontinentweiter Tarif ueberall?',
        a: 'Er funktioniert dort, wo Vereinbarungen bestehen, und das ist nicht ueberall.',
      },
    ],
  },

  oceania: {
    angle: 'Riesige Entfernungen und sehr wenige Anbieter',
    h1: 'eSIM fuer Ozeanien',
    title: 'Ozeanien eSIM: weite Wege, wenige Netze, echte Luecken',
    metaDescription:
      'Australien und Neuseeland haben gute staedtische Netze und lange Strecken ohne jeden Empfang. Zu wissen wo, zaehlt mehr als der Tarif.',
    sectionOrder: ['intro', 'australien', 'neuseeland', 'inseln', 'entscheiden', 'faq'],
    intro: [
      'In Ozeanien klafft der Unterschied zwischen Abdeckungskarte und Fahrtroute am weitesten. Die Netze in Australien und Neuseeland sind modern und schnell, wo es sie gibt, und ueber Entfernungen hinweg schlicht nicht vorhanden.',
      'Dazu kommen sehr wenige Anbieter. Das bedeutet weniger Preiswettbewerb als in Europa, und es bedeutet, dass die Unterschiede zwischen Produkten kleiner sind als die Unterschiede zwischen Standorten.',
    ],
    sections: {
      australien: {
        heading: 'Australien ist zuerst eine Abdeckungsfrage',
        body: [
          'Die Abdeckung folgt der Kueste und der Bevoelkerung. Sydney, Melbourne, Brisbane, Perth und die Korridore dazwischen sind gut versorgt. Das Landesinnere nicht, und der Unterschied ist nicht klein.',
          'Wer ins Outback faehrt, lange Highwayetappen plant oder Westaustralien und das Northern Territory abseits der Staedte bereist, muss mit langen Strecken ohne Empfang rechnen.',
        ],
      },
      neuseeland: {
        heading: 'Neuseeland',
        body: [
          'Anteilig besser als Australien, weil das Land kleiner ist, aber das Muster ist dasselbe. Staedte und Hauptstrassen sind versorgt, Fiordland und die Alpenregionen nicht.',
          'Wanderrouten sollten vollstaendig offline geplant werden. Karten herunterladen und jemandem die Route sagen.',
        ],
      },
      inseln: {
        heading: 'Die pazifischen Inseln',
        body: [
          'Fidschi, Samoa, Tonga und die kleineren Inselstaaten haben begrenzte Netze und begrenzte Roaming Vereinbarungen. Ein Tarif, der Ozeanien nennt, schliesst sie moeglicherweise nur nominell ein.',
          'Wenn Ihre Route ueber die Inseln fuehrt, pruefen Sie sie einzeln. Hier sind pauschale Abdeckungsangaben am wenigsten verlaesslich.',
          'Hinzu kommt, dass die Wege zwischen den Inseln lang sind und die Verbindungen selten. Wer von Fidschi nach Samoa fliegt, ist unter Umstaenden einen ganzen Tag unterwegs, oft mit einem Zwischenstopp, und die Bestaetigungen kommen kurzfristig.',
          'Fuer eine reine Australien und Neuseeland Reise ist das irrelevant. Sobald die Inseln dazukommen, gehoert die Abdeckung dort in die Planung und nicht in die Produktbeschreibung.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Australien und Neuseeland zusammen ist die uebliche Reise und der Fall, in dem ein regionaler Tarif klar nuetzlich ist, weil beide Laender getrennte Netze haben.',
          'Ein Land allein ist ein Landertarif. Und in beiden Faellen gehoeren die Funkloecher in die Planung, nicht in die Produktauswahl.',
        ],
      },
    },
    faq: [
      {
        q: 'Habe ich im australischen Outback Empfang?',
        a: 'Meist nicht. Die Luecken sind geografisch und betreffen jeden Anbieter.',
      },
      {
        q: 'Deckt ein Tarif Australien und Neuseeland ab?',
        a: 'Ein regionaler Tarif ist dafuer gemacht. Ein Landertarif folgt Ihnen nicht ueber die Grenze.',
      },
      {
        q: 'Sind die pazifischen Inseln enthalten?',
        a: 'Oft nur nominell. Pruefen Sie Fidschi, Samoa und Tonga einzeln.',
      },
      {
        q: 'Ist lokales Prepaid guenstiger?',
        a: 'In Australien und Neuseeland ist es wettbewerbsfaehig und leicht zu kaufen.',
      },
    ],
  },

  balkans: {
    angle: 'Der Teil Europas, in dem die Roaming Zone aufhoert',
    h1: 'eSIM fuer den Balkan',
    title: 'Balkan eSIM: in Europa, ausserhalb der Roaming Zone',
    metaDescription:
      'Albanien, Serbien, Bosnien, Nordmazedonien und Montenegro liegen in Europa und ausserhalb des EU Roamings. Das erklaert die gesamte Nachfrage.',
    sectionOrder: ['intro', 'linie', 'routen', 'abdeckung', 'entscheiden', 'faq'],
    intro: [
      'Der Balkan ist das deutlichste Beispiel fuer eine Region, die geografisch europaeisch und kommerziell getrennt ist. Kroatien, Slowenien, Griechenland und Bulgarien liegen in der Roaming Zone. Albanien, Serbien, Bosnien und Herzegowina, Nordmazedonien und Montenegro nicht.',
      'Diese Linie ist vor Ort unsichtbar. Man ueberquert sie auf einer Kuestenstrasse oder einem Pass, und das Einzige, was darauf hinweist, ist spaeter die Rechnung.',
    ],
    sections: {
      linie: {
        heading: 'Wer auf welcher Seite liegt',
        body: [
          'Innerhalb der Zone und damit auf einem deutschen Tarif kostenlos: Kroatien, Slowenien, Griechenland, Bulgarien und Rumaenien. Ausserhalb und damit kostenpflichtig: Albanien, Serbien, Bosnien und Herzegowina, Nordmazedonien und Montenegro.',
          'Das ist die nuetzlichste Information auf dieser Seite. Die meisten Balkanrouten beruehren beide Seiten.',
        ],
      },
      routen: {
        heading: 'Die Routen, auf denen es teuer wird',
        body: [
          'Die Adriafahrt von Kroatien ueber Montenegro nach Albanien ueberquert die Linie zweimal. Ebenso jede Reise, die Griechenland mit Nordmazedonien oder Bulgarien mit Serbien verbindet.',
          'Albanien erzeugt besonders starke Nachfrage, weil es sich zu einem gewoehnlichen Badeziel entwickelt hat und trotzdem ausserhalb der Regelung liegt.',
        ],
      },
      abdeckung: {
        heading: 'Die Abdeckung ist besser als der Ruf',
        body: [
          'Die Netze der Region sind modern und die Staedte gut versorgt. Die albanische Kueste, Belgrad, Sarajevo, Skopje und Podgorica lassen Sie nicht im Stich.',
          'Duenner wird es in den Bergen, und die Berge sind ein grosser Teil des Reisegrunds. Planen Sie Wandertage offline.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Bleibt die Reise im EU Teil, brauchen Sie nichts. Fuehrt sie nach Albanien, Serbien, Bosnien, Nordmazedonien oder Montenegro, braucht diese Etappe Abdeckung.',
          'Wird die Linie mehrfach ueberquert, erspart ein regionaler Tarif das Kaufen an jeder Grenze. Fuer ein einzelnes Land ausserhalb der Zone ist ein Landertarif guenstiger.',
        ],
      },
    },
    faq: [
      {
        q: 'Welche Balkanlaender deckt EU Roaming ab?',
        a: 'Kroatien, Slowenien, Griechenland, Bulgarien und Rumaenien. Albanien, Serbien, Bosnien und Herzegowina, Nordmazedonien und Montenegro nicht.',
      },
      {
        q: 'Warum taucht Albanien so haeufig auf?',
        a: 'Weil es ein gewoehnliches Sommerziel geworden ist und trotzdem ausserhalb der Roaming Regelung liegt.',
      },
      {
        q: 'Ist die Abdeckung in den Bergen verlaesslich?',
        a: 'Weniger, und die Berge sind ein Hauptgrund fuer die Reise. Planen Sie Wandertage offline.',
      },
      {
        q: 'Brauche ich etwas fuer Kroatien allein?',
        a: 'Nein. Kroatien liegt innerhalb der Roaming Zone.',
      },
    ],
  },
};

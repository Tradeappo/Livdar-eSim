// Regionenseiten, deutscher Markt.
//
// Der deutsche Leser hat EU Roaming bereits inklusive. Das ist der Ausgangspunkt
// jeder Seite hier: die Frage lautet nie "brauche ich Daten", sondern "wo hört
// mein Tarif auf zu gelten". Deshalb stehen die Schweiz, die Türkei und der
// Balkan im Mittelpunkt und nicht Frankreich oder Italien.
//
// Keine Uebersetzung der englischen Seiten. Anderer Markt, andere Frage.

export const regions = {
  europe: {
    angle: 'Drei Länder mitten in Europa, in denen Ihr Tarif nicht gilt',
    h1: 'eSIM für Europa',
    title: 'Europa eSIM: wo EU Roaming endet',
    metaDescription:
      'Innerhalb der EU brauchen Sie nichts. Entscheidend ist, wo Ihr Tarif aufhört zu gelten, und das passiert mitten auf dem Kontinent.',
    sectionOrder: ['intro', 'eu', 'lücken', 'fairuse', 'entscheiden', 'faq'],
    intro: [
      'Für einen deutschen Tarif ist Europa zum größten Teil erledigt. Roam like at home gilt in allen EU Staaten sowie in Island, Liechtenstein und Norwegen, und zwar zum Inlandspreis. Wer nach Mallorca oder nach Rom fährt, braucht von uns nichts.',
      'Interessant wird es genau dort, wo diese Regelung aufhört. Und sie hört nicht am Rand des Kontinents auf, sondern mittendrin.',
    ],
    sections: {
      eu: {
        heading: 'Was Ihr Tarif ohnehin abdeckt',
        body: [
          'Die siebenundzwanzig EU Staaten plus Island, Liechtenstein und Norwegen. Ihr Datenvolumen reist mit, die Abrechnung bleibt die gleiche. Es gibt kein Reiseprodukt, das günstiger ist als inklusive.',
          'Wir sagen das deutlich, weil ein großer Teil der Suchanfragen aus Deutschland zu Reise eSIMs Reiseziele betrifft, für die man schlicht nichts kaufen muss.',
        ],
      },
      lücken: {
        heading: 'Die Lücken, die wirklich zählen',
        body: [
          'Die Schweiz liegt in der Mitte Europas und außerhalb der Regelung. Wer mit dem Auto nach Italien fährt und den Gotthard nimmt, verlässt auf halber Strecke seinen Tarif. Das ist die häufigste teure Ueberraschung im deutschsprachigen Raum.',
          'Dazu kommen die Türkei, Albanien, Serbien, Bosnien und Herzegowina, Nordmazedonien und Montenegro. Alles europäische Reiseziele, alles außerhalb der Roaming Zone.',
          'Großbritannien ist der vierte Fall. Seit dem Brexit ist EU Roaming dort kein Rechtsanspruch mehr, und die Abrechnung hängt vom jeweiligen Anbieter ab.',
        ],
      },
      fairuse: {
        heading: 'Fair Use, der Punkt für längere Aufenthalte',
        body: [
          'Roam like at home ist für Reisen gedacht, nicht für das dauerhafte Leben im Ausland. Anbieter dürfen bei unbegrenzten Inlandstarifen ein Volumenlimit für das Roaming setzen und dürfen nachfragen, wenn jemand über vier Monate mehr Zeit im Ausland als zu Hause verbringt.',
          'Für zwei Wochen Urlaub ist das irrelevant. Für einen Winter in Spanien oder ein Semester in Portugal lohnt sich ein Blick in den eigenen Vertrag, bevor man sich darauf verlässt.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie in einer Minute entscheiden',
        body: [
          'Zählen Sie nicht die Länder, sondern die Tarifzonen auf Ihrer Route. Eine Reise von München nach Zagreb über die Schweiz ist nicht eine Zone, sondern zwei.',
          'Bleibt alles innerhalb der EU, brauchen Sie nichts. Ist genau ein Land außerhalb, kaufen Sie für dieses Land. Sind mehrere außerhalb, etwa auf einer Balkanroute, lohnt ein regionaler Tarif.',
        ],
      },
    },
    faq: [
      {
        q: 'Gilt mein deutscher Tarif in der Schweiz?',
        a: 'Nein. Die Schweiz ist nicht Teil der EU Roaming Regelung, obwohl sie mitten in Europa liegt. Das ist der häufigste Grund für unerwartet hohe Rechnungen.',
      },
      {
        q: 'Brauche ich innerhalb der EU überhaupt etwas?',
        a: 'Normalerweise nicht. Ihr Inlandsvolumen gilt in der gesamten EU sowie in Island, Liechtenstein und Norwegen zum gleichen Preis.',
      },
      {
        q: 'Was gilt für die Türkei?',
        a: 'Die Türkei liegt außerhalb der Roaming Zone. Zusätzlich gibt es dort eine Registrierungspflicht für Geräte, die bei einer lokalen SIM Karte relevant wird.',
      },
      {
        q: 'Was ist mit Großbritannien nach dem Brexit?',
        a: 'Inklusives EU Roaming ist dort kein Rechtsanspruch mehr. Ob Ihr Anbieter es freiwillig weiterführt, steht in Ihrem Tarif.',
      },
    ],
  },

  asia: {
    angle: 'Der Kontinent, auf dem die lokale Karte fast immer günstiger ist',
    h1: 'eSIM für Asien',
    title: 'Asien eSIM: Bequemlichkeit statt Ersparnis',
    metaDescription:
      'Prepaid Daten in Asien sind günstiger als jedes Reiseprodukt. Eine Reise eSIM kaufen Sie für die Ankunft, nicht für den Preis.',
    sectionOrder: ['intro', 'preis', 'ankunft', 'grenzen', 'praktisch', 'faq'],
    intro: [
      'In Asien ist die ehrliche Antwort unbequem für jeden Anbieter von Reise eSIMs: die lokale Prepaid Karte ist in den meisten Ländern deutlich günstiger. In Vietnam, Indonesien oder Thailand kostet ein Monat großzügiges Datenvolumen weniger als ein Kaffee am Flughafen.',
      'Die Frage lautet hier also nicht, ob Sie Geld sparen. Das tun Sie nicht. Die Frage ist, was Ihnen die erste Stunde nach der Landung wert ist.',
    ],
    sections: {
      preis: {
        heading: 'Was die lokale Karte besser kann',
        body: [
          'Den Preis, und die Rufnummer. Eine lokale Nummer ist in Asien praktischer als in Europa, weil Fahrdienste, Lieferdienste und Hotelbestätigungen häufig eine SMS an eine inländische Nummer schicken.',
          'Wer länger bleibt und ohnehin in einer Stadt ankommt, fährt mit der lokalen Karte in der Regel besser.',
        ],
      },
      ankunft: {
        heading: 'Was die Reise eSIM besser kann',
        body: [
          'Die Ankunft. Sie installieren zu Hause, landen, sind verbunden und bestellen ein Taxi. Kein Schalter, kein Formular, kein Pass, der kopiert wird.',
          'Besonders deutlich ist der Vorteil in Japan und Südkorea. Dort ist der Prepaid Markt auf Einwohner und auf Leihgeräte ausgerichtet, nicht auf Touristen, die kurz etwas kaufen wollen.',
        ],
      },
      grenzen: {
        heading: 'Mehrere Länder ändern die Rechnung',
        body: [
          'Eine lokale SIM ist ein nationales Produkt. An der nächsten Grenze hört sie auf oder wird teuer. Wer Bangkok, Siem Reap und Ho Chi Minh Stadt in einer Reise verbindet, kauft dreimal oder einmal regional.',
          'Ab dem zweiten Land kippt die Rechnung häufig zugunsten des regionalen Tarifs, nicht wegen des Preises, sondern wegen der Wiederholung.',
        ],
      },
      praktisch: {
        heading: 'Zwei Dinge vor dem Abflug',
        body: [
          'Prüfen Sie, ob Ihr Gerät einen SIM Lock hat. Ein gesperrtes Handy nimmt kein fremdes Profil an, und das merkt man besser zu Hause als nachts am Flughafen.',
          'Prüfen Sie außerdem, ob Sie eine SMS an Ihre deutsche Nummer brauchen, etwa für das Banking. Ein reiner Datentarif liefert keine Rufnummer, weder hier noch anderswo.',
        ],
      },
    },
    faq: [
      {
        q: 'Ist eine Reise eSIM in Asien günstiger als eine lokale Karte?',
        a: 'In aller Regel nicht. Lokale Prepaid Daten sind in den meisten asiatischen Ländern günstiger als jedes Reiseprodukt.',
      },
      {
        q: 'Bekomme ich eine Rufnummer?',
        a: 'Bei einem reinen Datentarif nicht. Wer eine lokale Nummer für Fahrdienste oder Verifizierungen braucht, kauft vor Ort.',
      },
      {
        q: 'Wo ist der Kauf vor Ort besonders unbequem?',
        a: 'In Japan und Südkorea. Der dortige Prepaid Markt richtet sich an Einwohner und an Leihgeräte, nicht an durchreisende Touristen.',
      },
      {
        q: 'Lohnt ein regionaler Tarif?',
        a: 'Ab zwei bis drei Ländern in einer Reise ja, weil sonst jede Grenze einen neuen Kauf bedeutet.',
      },
    ],
  },

  'southeast-asia': {
    angle: 'Die Region, in der Rucksackrouten wirklich fünf Grenzen kreuzen',
    h1: 'eSIM für Südostasien',
    title: 'Südostasien eSIM: für Routen über mehrere Grenzen',
    metaDescription:
      'Vier oder fünf Länder in einer Reise sind in Südostasien normal. Genau dafür ist ein regionaler Tarif gedacht.',
    sectionOrder: ['intro', 'route', 'lokal', 'abdeckung', 'entscheiden', 'faq'],
    intro: [
      'Die meisten regionalen Tarife werden mit einem Szenario verkauft, das selten eintritt. In Südostasien tritt es ein. Zwei Monate durch Thailand, Laos, Vietnam, Kambodscha und Malaysia sind hier eine gewöhnliche Reise.',
      'Damit ändert sich die Rechnung. Fünfmal lokal kaufen heißt fünf Registrierungen, fünf Nummern und fünf Restguthaben, die niemand mehr verbraucht.',
    ],
    sections: {
      route: {
        heading: 'Zählen Sie die Grenzen',
        body: [
          'Ein Land, zwei Wochen: lokal kaufen und den günstigen Preis mitnehmen. Drei oder mehr Länder in einem Monat: regionaler Tarif, und das Thema ist erledigt.',
          'Zwei Länder sind der Grenzfall. Ist das zweite nur ein Abstecher, lohnt sich lokal. Ist es eine eigene Woche, gewinnt meist der regionale Tarif über die Bequemlichkeit.',
        ],
      },
      lokal: {
        heading: 'Was lokal wirklich kostet',
        body: [
          'Sehr wenig, und das gehört zur Wahrheit dazu. Vietnamesische, indonesische und thailändische Prepaid Daten sind so günstig, dass jeder Reisetarif auf dem Papier schlecht aussieht.',
          'Was auf dem Papier fehlt, ist die Registrierungspflicht. Thailand, Indonesien und Vietnam verlangen Ausweisdokumente. Das ist in Ruhe machbar und bei einem Anschlussflug ärgerlich.',
        ],
      },
      abdeckung: {
        heading: 'Abdeckung ist nicht überall gleich',
        body: [
          'In den Städten ist die Abdeckung gut, teilweise besser als im ländlichen Europa. Bangkok, Kuala Lumpur, Singapur und Ho Chi Minh Stadt sind dicht versorgt.',
          'Auf kleinen indonesischen und philippinischen Inseln, in Teilen von Laos und in den Bergen Nordvietnams ist sie dünn oder gar nicht vorhanden. Das gilt für jedes Profil gleichermaßen.',
        ],
      },
      entscheiden: {
        heading: 'Praktische Entscheidung',
        body: [
          'Schreiben Sie zuerst die Route auf, dann den Preis. Bleibt alles in einem Land, ist es eine Länderentscheidung. Kreuzt die Route Grenzen, ist es eine regionale.',
          'Und prüfen Sie den SIM Lock, bevor Sie fliegen. Es ist der häufigste Grund, warum ein einwandfreies Profil sich nicht installieren lässt.',
        ],
      },
    },
    faq: [
      {
        q: 'Ab wie vielen Ländern lohnt ein regionaler Tarif?',
        a: 'Ab drei Ländern in einem Monat eindeutig. Bei zwei ist es Abwägung, bei einem kaufen Sie für das Land.',
      },
      {
        q: 'Ist die Abdeckung auf den Inseln gut?',
        a: 'Unterschiedlich, und kein Tarif ändert daran etwas. Große Inseln sind versorgt, kleine häufig nicht.',
      },
      {
        q: 'Muss ich mich für eine lokale Karte ausweisen?',
        a: 'In den meisten Ländern der Region ja. Eine Reise eSIM umgeht diesen Schritt.',
      },
      {
        q: 'Bekomme ich in jedem Land eine Nummer?',
        a: 'Nein. Reine Datentarife haben nirgends eine Rufnummer.',
      },
    ],
  },

  'north-america': {
    angle: 'Drei Länder, drei Tarifzonen, kein EU Netz zum Zurückfallen',
    h1: 'eSIM für Nordamerika',
    title: 'Nordamerika eSIM: drei Länder, drei Abrechnungen',
    metaDescription:
      'USA, Kanada und Mexiko sehen nach einer Reise aus und rechnen wie drei. Für deutsche Tarife ist das die teuerste Region überhaupt.',
    sectionOrder: ['intro', 'usa', 'grenzen', 'abdeckung', 'entscheiden', 'faq'],
    intro: [
      'Nordamerika ist für deutsche Reisende die Region, in der Roaming am wenigsten verzeiht. Es gibt keine Regelung wie in der EU, auf die man zurückfallen könnte. Was Sie zahlen, hat Ihr Anbieter für einen anderen Kontinent festgelegt.',
      'Auf der Karte sieht es aus wie ein Reiseziel. Auf der Rechnung sind es drei.',
    ],
    sections: {
      usa: {
        heading: 'Die USA sind eine eigene Entscheidung',
        body: [
          'Die Netze sind dicht, schnell und für Besucher teuer. In den Städten und entlang der Interstates ist die Abdeckung hervorragend. Im Landesinneren, in den Nationalparks und auf langen Wüstenstrecken ist sie dünner, als die meisten erwarten.',
          'Auffällig ist, dass ein großer Teil der Suchanfragen in dieser Region gar nicht die Abdeckung betrifft, sondern die Fehlersuche: installiert, aber keine Verbindung. Die Ursache ist fast immer eine Einstellung, nicht das Produkt.',
        ],
      },
      grenzen: {
        heading: 'Kanada und Mexiko',
        body: [
          'Ein Tarif für die USA gilt an der Grenze nicht automatisch weiter. Manche amerikanischen Verträge schließen Kanada und Mexiko ein, viele nicht.',
          'Wer aus Europa anreist und zwei der drei Länder besucht, ist genau in dem Fall, für den ein regionaler Tarif gedacht ist.',
        ],
      },
      abdeckung: {
        heading: 'Was Sie erwarten können',
        body: [
          'Kanadas Abdeckung folgt der Bevölkerung, also dem südlichen Band und den Fernstraßen. Nördlich davon gibt es geografische Lücken, keine kommerziellen.',
          'In Mexiko sind Städte, Küstenorte und Hauptstraßen gut versorgt, die Berge und kleinere Orte im Landesinneren weniger.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Ein Land, ein Landertarif. Zwei oder drei Länder, ein regionaler Tarif, weil genau an den Grenzen die Rechnung entgleist.',
          'Und laden Sie Karten vorher herunter. In den Parks ist Offline der Normalfall, nicht die Ausnahme.',
        ],
      },
    },
    faq: [
      {
        q: 'Gilt ein US Tarif auch in Kanada und Mexiko?',
        a: 'Nicht automatisch. Manche amerikanischen Verträge schließen beide ein, viele nicht.',
      },
      {
        q: 'Habe ich in Nationalparks Empfang?',
        a: 'Oft nicht, bei keinem Anbieter. Die Lücken im amerikanischen Westen sind geografisch und betreffen alle gleich.',
      },
      {
        q: 'Warum wird so oft nach Fehlersuche gesucht?',
        a: 'Weil die installierte Basis groß ist und der Fehler meist eine Einstellung ist. Ausgeschaltetes Datenroaming ist die häufigste einzelne Ursache.',
      },
      {
        q: 'Bekomme ich eine amerikanische Rufnummer?',
        a: 'Bei einem reinen Datentarif nicht.',
      },
    ],
  },

  'south-america': {
    angle: 'Weite Strecken, echte Grenzen, keine gemeinsame Regelung',
    h1: 'eSIM für Südamerika',
    title: 'Südamerika eSIM: weite Wege und echte Grenzen',
    metaDescription:
      'Südamerikareisen decken große Entfernungen und mehrere Grenzen ab. Zwischen den Ländern gibt es keine gemeinsame Roaming Regelung.',
    sectionOrder: ['intro', 'entfernungen', 'grenzen', 'brasilien', 'inlandsfluege', 'entscheiden', 'faq'],
    intro: [
      'Südamerikanische Reisen sind lang. Ein Monat bedeutet hier häufig drei oder vier Länder und mehrere Inlandsflüge, und zwischen guter und gar keiner Abdeckung liegen Stunden statt Minuten.',
      'Lange Routen und echte Grenzen sind der Grund, warum man Verbindung hier planen sollte statt zu improvisieren.',
    ],
    sections: {
      entfernungen: {
        heading: 'Die Abdeckung folgt den Städten',
        body: [
          'Buenos Aires, Santiago, Lima, Bogota und die brasilianischen Küstenstädte sind gut versorgt. Die Anden, das Amazonasbecken, Patagonien und die langen Busstrecken dazwischen nicht.',
          'Planen Sie offline. Karte herunterladen, Ticket speichern, Adresse als Screenshot. Dieser Rat gilt unabhängig davon, was Sie kaufen.',
        ],
      },
      grenzen: {
        heading: 'Zwischen den Ländern gibt es keine Regelung',
        body: [
          'Es existiert nichts, was der europäischen Regelung entspräche. Von Argentinien nach Chile oder von Peru nach Bolivien bedeutet ein neuer Anbieter und ein neuer Tarif.',
          'Für ein Land ist der lokale Kauf günstig und einfach. Auf der klassischen Mehrländerroute summieren sich Käufe und Restguthaben schneller, als der Preisunterschied vermuten lässt.',
        ],
      },
      brasilien: {
        heading: 'Brasilien ist ein eigener Markt',
        body: [
          'Brasilien ist groß genug und anders genug, um nicht als Teil Südamerikas behandelt zu werden. Andere Sprache, anderes Suchvokabular, andere Reiseziele.',
          'Für deutsche Reisende bleibt Brasilien in dieser Region. Für brasilianische Leser ist es ein eigener Markt mit eigenen Seiten.',
        ],
      },
      inlandsfluege: {
        heading: 'Inlandsflüge und Nachtbusse',
        body: [
          'Südamerikanische Routen bestehen aus wenigen langen Etappen statt vielen kurzen. Ein Nachtbus von Lima nach Cusco oder ein Inlandsflug von Buenos Aires nach El Calafate sind normale Bestandteile einer Reise, und beide finden weitgehend außerhalb der Netzabdeckung statt.',
          'Praktisch heißt das: Buchungsbestätigungen, Adressen und Karten vor der Abfahrt speichern. Wer sich darauf verlässt, unterwegs nachzuschauen, steht in Patagonien oder auf der Altiplano Strecke ohne Daten da, unabhängig vom gekauften Tarif.',
          'Für Reisende, die viele solcher Etappen haben, ist die eigentliche Frage nicht der Tarif, sondern die Offline Vorbereitung. Ein regionaler Tarif nimmt Ihnen das Kaufen an Grenzen ab, nicht das Planen.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Ein Land bis zwei Wochen: Landertarif. Zwei oder mehr Länder oder lange Ueberlandetappen: regionaler Tarif.',
          'Und behandeln Sie die Abdeckung als Planungsgröße, nicht als Produktmerkmal. Die Lücken sind für alle gleich.',
        ],
      },
    },
    faq: [
      {
        q: 'Gibt es freies Roaming zwischen südamerikanischen Ländern?',
        a: 'Nein. Eine Regelung wie in Europa existiert dort nicht.',
      },
      {
        q: 'Habe ich in Patagonien oder am Amazonas Empfang?',
        a: 'Häufig nicht, bei keinem Anbieter. Planen Sie beide Regionen offline.',
      },
      {
        q: 'Ist Brasilien in einem Südamerika Tarif enthalten?',
        a: 'Meist ja. Als Markt behandeln wir Brasilien dennoch getrennt, weil dort anders gesucht wird.',
      },
      {
        q: 'Soll ich lieber vor Ort kaufen?',
        a: 'Für ein Land sehr wahrscheinlich. Auf einer Mehrländerroute selten.',
      },
    ],
  },

  'central-america': {
    angle: 'Kurze Wege, viele Grenzen, meist mit dem Bus',
    h1: 'eSIM für Mittelamerika',
    title: 'Mittelamerika eSIM: kurze Wege, viele Grenzen',
    metaDescription:
      'Sieben Länder auf kurzer Distanz. Eine zweiwöchige Reise kreuzt hier leicht vier Grenzen, und zwar auf der Straße.',
    sectionOrder: ['intro', 'geografie', 'landweg', 'abdeckung', 'shuttles', 'entscheiden', 'faq'],
    intro: [
      'Mittelamerika bringt sieben Länder auf einer Strecke unter, die man in wenigen Tagen durchfahren kann. Vierzehn Tage reichen für Guatemala, Belize, Honduras, Nicaragua und Costa Rica, und das meiste davon passiert auf der Straße.',
      'Genau diese Landgrenzen machen die Region besonders. Es gibt keinen Flughafen, der einen daran erinnert, dass man das Land gewechselt hat.',
    ],
    sections: {
      geografie: {
        heading: 'Kurze Strecken, viele Anbieter',
        body: [
          'Weil die Etappen kurz sind, unterschätzen Reisende, wie viele Netze sie berühren. Eine Woche kann drei nationale Netze mit drei eigenen Besuchertarifen umfassen.',
          'Hier geht es weniger um den Preis als darum, an jedem Schlagbaum nicht nachdenken zu müssen.',
        ],
      },
      landweg: {
        heading: 'Warum Landgrenzen teuer werden',
        body: [
          'Eine Ankunft am Flughafen ist ein klares Signal, etwas zu kaufen. Eine Landgrenze ist es nicht. Der Bus fährt weiter, das Telefon bucht sich in ein anderes Netz ein, und die Abrechnung beginnt ohne Hinweis.',
          'Wer die Region auf der Straße bereist, sollte die Verbindung vor der ersten Grenze klären, nicht nach der ersten Rechnung.',
        ],
      },
      abdeckung: {
        heading: 'Abdeckung vor Ort',
        body: [
          'Hauptstädte, die Pazifikküste und die Hauptstraßen sind gut versorgt. Die Karibikseite, das Hochland und kleinere Orte im Landesinneren sind dünner und je nach Anbieter unterschiedlich.',
          'Costa Rica und Panama stehen am besten da. Im ländlichen Guatemala, Honduras und Nicaragua sollten Sie mit Funklöchern rechnen.',
        ],
      },
      shuttles: {
        heading: 'Shuttles, Fähren und die Rückfahrt zum Flughafen',
        body: [
          'Der Verkehr zwischen den Ländern läuft hier über private Shuttles, die von Hostel zu Hostel fahren, und über kleine Fähren, etwa nach Belize oder zu den Bahia Inseln. Beides wird meist per Nachricht bestätigt, nicht per Ticket in einer App.',
          'Das macht durchgehende Verbindung praktischer, als es in einer Region mit kurzen Strecken zunächst klingt. Wer den Shuttle am Vorabend per Nachricht bestätigt, braucht am Morgen Empfang.',
          'Die Rückfahrt zum Flughafen ist der zweite Punkt. San Jose, Panama Stadt und Guatemala Stadt liegen häufig mehrere Stunden von dem Ort entfernt, an dem die Reise endet, und Umbuchungen passieren kurzfristig.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Ein Land: Landertarif. Die klassische Ueberlandroute: regionaler Tarif, weil er genau dafür gebaut ist.',
          'Und wie überall: SIM Lock vor dem Abflug prüfen.',
        ],
      },
    },
    faq: [
      {
        q: 'Brauche ich für jedes Land einen eigenen Tarif?',
        a: 'Nur wenn Sie lokal kaufen wollen. Auf einer Ueberlandroute sind das mehrere Käufe in zwei Wochen.',
      },
      {
        q: 'Fällt an Landgrenzen Roaming an?',
        a: 'Ja, und meist ohne sichtbaren Hinweis. Das ist der Hauptgrund für Ueberraschungen in dieser Region.',
      },
      {
        q: 'Welche Länder haben die beste Abdeckung?',
        a: 'Costa Rica und Panama. Am dünnsten sind ländliche Gebiete in Guatemala, Honduras und Nicaragua.',
      },
      {
        q: 'Lohnt ein regionaler Tarif für eine Woche?',
        a: 'Nur wenn diese Woche Grenzen kreuzt.',
      },
    ],
  },

  caribbean: {
    angle: 'Jede Insel ist ein eigenes Netz',
    h1: 'eSIM für die Karibik',
    title: 'Karibik eSIM: jede Insel ein eigenes Netz',
    metaDescription:
      'Karibische Inseln sind eigene Telekommärkte, auch wenn sie zwanzig Flugminuten auseinander liegen. Beim Inselhüpfen zählt das.',
    sectionOrder: ['intro', 'inseln', 'kreuzfahrt', 'abdeckung', 'fluege', 'entscheiden', 'faq'],
    intro: [
      'Die Karibik sieht im Prospekt nach einem Reiseziel aus und verhält sich technisch wie dutzende getrennte Märkte. Inseln, die zwanzig Flugminuten auseinanderliegen, sind unterschiedliche Länder mit unterschiedlichen Anbietern.',
      'Für eine Woche im Resort spielt das kaum eine Rolle. Für alle, die hüpfen oder segeln, ist es die ganze Frage.',
    ],
    sections: {
      inseln: {
        heading: 'Warum Inselhüpfen die Antwort ändert',
        body: [
          'Eine auf Barbados gekaufte Karte hilft auf St. Lucia nicht. Jede Insel ist ein neuer Kauf oder eine neue Roaming Gebühr, und die Sprünge sind kurz genug, dass man mehrere pro Woche macht.',
          'Einige regionale Anbieter decken mehrere Inseln unter einer Marke ab. Es lohnt zu prüfen, ob die Inseln Ihrer Route dazugehören.',
        ],
      },
      kreuzfahrt: {
        heading: 'Für Kreuzfahrtgäste',
        body: [
          'Auf See verbindet sich Ihr Telefon mit dem Satellitennetz des Schiffs, nicht mit einem Inselnetz. Keine Reise eSIM deckt das ab, und die Tarife dort sind die, von denen die Schauergeschichten handeln.',
          'Praktisch heißt das: Daten auf See aus, im Hafen an.',
        ],
      },
      abdeckung: {
        heading: 'Abdeckung dort, wo Sie wirklich sind',
        body: [
          'Resorts, Kreuzfahrthäfen und Hauptorte der größeren Inseln sind gut versorgt. Das Landesinnere, kleine Cays und die ruhigeren östlichen Inseln sind unterschiedlich.',
          'Wetter spielt hier eine Rolle wie kaum anderswo. Im Hurrikangürtel nimmt Infrastruktur Schaden, und der Wiederaufbau braucht Zeit.',
        ],
      },
      fluege: {
        heading: 'Flüge zwischen den Inseln sind kurz und ändern trotzdem alles',
        body: [
          'Die regionalen Fluggesellschaften verbinden die Inseln in zwanzig bis vierzig Minuten. Technisch ist jeder dieser Flüge ein Wechsel des Landes, des Anbieters und des Tarifs, und das fällt bei einer so kurzen Strecke niemandem auf.',
          'Verspätungen und Umbuchungen sind auf diesen Strecken häufig und werden per Nachricht kommuniziert. Genau dann brauchen Sie Empfang, und genau dann sind Sie gerade auf einer Insel gelandet, deren Netz Sie nicht gekauft haben.',
          'Wer mehr als zwei Inseln besucht, kauft entweder jedes Mal neu oder einmal regional. Der Preisunterschied ist kleiner als der Unterschied im Aufwand.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Eine Insel, eine Woche: für diese Insel kaufen.',
          'Mehrere Inseln oder eine Segelroute: regionaler Tarif, sonst kaufen Sie alle paar Tage neu.',
        ],
      },
    },
    faq: [
      {
        q: 'Gilt ein Tarif auf allen Inseln?',
        a: 'Ein regionaler Tarif ist dafür gemacht. Eine lokale Karte einer Insel gilt auf der nächsten nicht.',
      },
      {
        q: 'Funktioniert die eSIM auf dem Kreuzfahrtschiff?',
        a: 'Nein. Auf See sind Sie im Satellitennetz des Schiffs, das getrennt abgerechnet wird.',
      },
      {
        q: 'Ist die Abdeckung nach Stürmen beeinträchtigt?',
        a: 'Ja. Das ist der Hurrikangürtel, und Netzschäden sind real.',
      },
      {
        q: 'Was ist mit dem Landesinneren?',
        a: 'Unterschiedlich. Resorts und Häfen sind versorgt, kleinere Cays häufig nicht.',
      },
    ],
  },

  'middle-east': {
    angle: 'Ausgezeichnete Netze, aber die Telefonie Apps sind der Haken',
    h1: 'eSIM für den Nahen Osten',
    title: 'Naher Osten eSIM: Daten sind einfach, Anrufe nicht immer',
    metaDescription:
      'Die Netze am Golf gehören zu den besten der Welt. Ob Ihre gewohnten Telefonie Apps erlaubt sind, ist die eigentliche Frage.',
    sectionOrder: ['intro', 'voip', 'golf', 'abdeckung', 'entscheiden', 'faq'],
    intro: [
      'Der Nahe Osten gehört zu den am besten versorgten Regionen überhaupt. Die Netze am Golf sind schnell, modern und dicht, und die Flughäfen dort sind hervorragend angebunden.',
      'Der Haken liegt nicht bei der Abdeckung, sondern bei den Diensten. Manche Anwendungen, die Sie zu Hause selbstverständlich nutzen, sind in einigen Netzen eingeschränkt. Das ist eine regulatorische Frage, keine technische.',
    ],
    sections: {
      voip: {
        heading: 'Anrufe über das Internet',
        body: [
          'Mehrere Länder der Region beschränken Sprach und Videoanrufe über Internetdienste in lokalen Netzen. Nachrichten funktionieren meist, der Anrufknopf nicht immer.',
          'Das trifft Reisende unvorbereitet, die annehmen, ein Datentarif bedeute automatisch Telefonate nach Hause. Prüfen Sie die aktuelle Lage für das konkrete Land, denn die Regeln ändern sich.',
        ],
      },
      golf: {
        heading: 'Der Golf ist ein eigener Markt',
        body: [
          'Dubai und die Emirate erzeugen mit Abstand die größte Besuchernachfrage der Region, und diese Nachfrage wird überwiegend auf Englisch formuliert, auch vor Ort.',
          'Die Abdeckung in den Emiraten, Katar, Bahrain und Kuwait ist ausgezeichnet, auch in den Wüstengebieten, in die Besucher gefahren werden.',
        ],
      },
      abdeckung: {
        heading: 'Außerhalb des Golfs',
        body: [
          'Jordanien, Israel und Oman haben solide Netze dort, wo Reisende sich aufhalten. In Wüsten und Bergregionen wird es dünner, wie überall.',
          'Die Türkei hat eine eigene Seite und eine eigene Regel zur Geräteregistrierung, die mit Abdeckung nichts zu tun hat und trotzdem die wichtigste Information der Region ist.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Für eine einzelne Golfstadt genügt ein Landertarif, und das Netz wird Sie nicht enttäuschen.',
          'Für eine Rundreise lohnt der regionale Tarif. In beiden Fällen gilt: Einschränkungen bei Anrufen vorher prüfen.',
        ],
      },
    },
    faq: [
      {
        q: 'Kann ich über WhatsApp oder FaceTime telefonieren?',
        a: 'Das hängt vom Land und vom Netz ab. Mehrere Länder der Region schränken Internettelefonie ein, während Nachrichten weiter funktionieren.',
      },
      {
        q: 'Ist die Abdeckung in der Wüste gut?',
        a: 'Am Golf erstaunlich gut, auch auf den Routen der Veranstalter. Außerhalb wird sie dünner.',
      },
      {
        q: 'Brauche ich Arabisch?',
        a: 'Nein. Besucherbezogene Angebote am Golf laufen auf Englisch.',
      },
      {
        q: 'Zählt die Türkei zum Nahen Osten?',
        a: 'Je nach Tarif unterschiedlich. Die Registrierungsregel dort macht die eigene Seite in jedem Fall lesenswert.',
      },
    ],
  },

  africa: {
    angle: 'Nordafrika ist gut versorgt, der Rest sehr unterschiedlich',
    h1: 'eSIM für Afrika',
    title: 'Afrika eSIM: stark im Norden, uneinheitlich sonst',
    metaDescription:
      'Nordafrikanische Netze sind gut und stark bereist. Der Rest des Kontinents ist sehr unterschiedlich, und kein Tarif ändert das Netz vor Ort.',
    sectionOrder: ['intro', 'norden', 'süden', 'realität', 'entscheiden', 'faq'],
    intro: [
      'Afrika ist kein einheitlicher Markt, und wer ihn so behandelt, wird enttäuscht. Ein Tarif, der vierzig Länder auflistet, beschreibt kommerzielle Vereinbarungen, nicht Ihren Empfang vor Ort.',
      'Die messbare Nachfrage ist konzentriert statt verteilt. Marokko und Ägypten machen einen sehr großen Teil davon aus, getragen vor allem von europäischen Reisenden.',
    ],
    sections: {
      norden: {
        heading: 'Nordafrika ist gemeint, wenn Reisende Afrika sagen',
        body: [
          'Marokko, Ägypten und Tunesien tragen den größten Teil des Besucherverkehrs und haben die Netze dafür. Städte, Badeorte und die touristischen Hauptrouten sind solide versorgt.',
          'Keines dieser Länder gehört zu einer europäischen Roaming Regelung. Genau deshalb entsteht die Nachfrage.',
        ],
      },
      süden: {
        heading: 'Südliches und östliches Afrika',
        body: [
          'Südafrika, Kenia und Tansania haben leistungsfähige städtische Netze und weit entwickelte Mobilfunkmärkte. Safarigebiete und Nationalparks sind etwas anderes und sollten offline geplant werden.',
          'Lokale Prepaid Angebote sind dort günstig und leicht verfügbar. Der Abwägung bleibt die übliche: Preis und Rufnummer gegen eine verbundene Ankunft.',
        ],
      },
      realität: {
        heading: 'Lesen Sie die Länderliste, nicht den Kontinentnamen',
        body: [
          'Ein als Afrika verkaufter Tarif verhält sich in Marrakesch völlig anders als im ländlichen Sambia. Ehrlich kauft man hier, indem man die konkreten Länder der Route prüft.',
          'Uns ist lieber, Ihnen zu sagen, dass ein Land dünn versorgt ist, als Ihnen einen Tarif zu verkaufen, der etwas anderes suggeriert.',
          'Ein zweiter Punkt betrifft die Geschwindigkeit. Eine Liste sagt nichts darüber, ob Sie im jeweiligen Land im modernen Netz oder in einer älteren Technik landen. Für Nachrichten reicht beides, für Navigation und Videoanrufe nicht immer.',
          'Wenn Ihre Route mehrere Länder umfasst, prüfen Sie die zwei oder drei, in denen Sie wirklich Zeit verbringen, statt die gesamte Liste. Der Rest ist für Ihre Reise nicht entscheidend.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Für Marokko, Ägypten oder Tunesien allein ist ein Landertarif die saubere Antwort.',
          'Für eine Rundreise prüfen Sie, ob jedes relevante Land wirklich versorgt und nicht nur aufgelistet ist, und planen Sie die abgelegenen Etappen offline.',
        ],
      },
    },
    faq: [
      {
        q: 'Warum wird Marokko so häufig gesucht?',
        a: 'Weil es nah an Europa liegt, stark bereist wird und außerhalb jeder europäischen Roaming Regelung steht.',
      },
      {
        q: 'Habe ich auf Safari Empfang?',
        a: 'Oft nicht. Das liegt am Netz, nicht am Produkt. Planen Sie diese Tage offline.',
      },
      {
        q: 'Ist lokales Prepaid eine gute Option?',
        a: 'In Kenia, Tansania und Südafrika ja, günstig und einfach. Der Preis ist die Registrierung bei der Ankunft.',
      },
      {
        q: 'Funktioniert ein kontinentweiter Tarif überall?',
        a: 'Er funktioniert dort, wo Vereinbarungen bestehen, und das ist nicht überall.',
      },
    ],
  },

  oceania: {
    angle: 'Riesige Entfernungen und sehr wenige Anbieter',
    h1: 'eSIM für Ozeanien',
    title: 'Ozeanien eSIM: weite Wege, wenige Netze, echte Lücken',
    metaDescription:
      'Australien und Neuseeland haben gute städtische Netze und lange Strecken ohne jeden Empfang. Zu wissen wo, zählt mehr als der Tarif.',
    sectionOrder: ['intro', 'australien', 'neuseeland', 'inseln', 'entscheiden', 'faq'],
    intro: [
      'In Ozeanien klafft der Unterschied zwischen Abdeckungskarte und Fahrtroute am weitesten. Die Netze in Australien und Neuseeland sind modern und schnell, wo es sie gibt, und über Entfernungen hinweg schlicht nicht vorhanden.',
      'Dazu kommen sehr wenige Anbieter. Das bedeutet weniger Preiswettbewerb als in Europa, und es bedeutet, dass die Unterschiede zwischen Produkten kleiner sind als die Unterschiede zwischen Standorten.',
    ],
    sections: {
      australien: {
        heading: 'Australien ist zuerst eine Abdeckungsfrage',
        body: [
          'Die Abdeckung folgt der Küste und der Bevölkerung. Sydney, Melbourne, Brisbane, Perth und die Korridore dazwischen sind gut versorgt. Das Landesinnere nicht, und der Unterschied ist nicht klein.',
          'Wer ins Outback fährt, lange Highwayetappen plant oder Westaustralien und das Northern Territory abseits der Städte bereist, muss mit langen Strecken ohne Empfang rechnen.',
        ],
      },
      neuseeland: {
        heading: 'Neuseeland',
        body: [
          'Anteilig besser als Australien, weil das Land kleiner ist, aber das Muster ist dasselbe. Städte und Hauptstraßen sind versorgt, Fiordland und die Alpenregionen nicht.',
          'Wanderrouten sollten vollständig offline geplant werden. Karten herunterladen und jemandem die Route sagen.',
        ],
      },
      inseln: {
        heading: 'Die pazifischen Inseln',
        body: [
          'Fidschi, Samoa, Tonga und die kleineren Inselstaaten haben begrenzte Netze und begrenzte Roaming Vereinbarungen. Ein Tarif, der Ozeanien nennt, schließt sie möglicherweise nur nominell ein.',
          'Wenn Ihre Route über die Inseln führt, prüfen Sie sie einzeln. Hier sind pauschale Abdeckungsangaben am wenigsten verlässlich.',
          'Hinzu kommt, dass die Wege zwischen den Inseln lang sind und die Verbindungen selten. Wer von Fidschi nach Samoa fliegt, ist unter Umständen einen ganzen Tag unterwegs, oft mit einem Zwischenstopp, und die Bestätigungen kommen kurzfristig.',
          'Für eine reine Australien und Neuseeland Reise ist das irrelevant. Sobald die Inseln dazukommen, gehört die Abdeckung dort in die Planung und nicht in die Produktbeschreibung.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Australien und Neuseeland zusammen ist die übliche Reise und der Fall, in dem ein regionaler Tarif klar nützlich ist, weil beide Länder getrennte Netze haben.',
          'Ein Land allein ist ein Landertarif. Und in beiden Fällen gehören die Funklöcher in die Planung, nicht in die Produktauswahl.',
        ],
      },
    },
    faq: [
      {
        q: 'Habe ich im australischen Outback Empfang?',
        a: 'Meist nicht. Die Lücken sind geografisch und betreffen jeden Anbieter.',
      },
      {
        q: 'Deckt ein Tarif Australien und Neuseeland ab?',
        a: 'Ein regionaler Tarif ist dafür gemacht. Ein Landertarif folgt Ihnen nicht über die Grenze.',
      },
      {
        q: 'Sind die pazifischen Inseln enthalten?',
        a: 'Oft nur nominell. Prüfen Sie Fidschi, Samoa und Tonga einzeln.',
      },
      {
        q: 'Ist lokales Prepaid günstiger?',
        a: 'In Australien und Neuseeland ist es wettbewerbsfähig und leicht zu kaufen.',
      },
    ],
  },

  balkans: {
    angle: 'Der Teil Europas, in dem die Roaming Zone aufhört',
    h1: 'eSIM für den Balkan',
    title: 'Balkan eSIM: in Europa, außerhalb der Roaming Zone',
    metaDescription:
      'Albanien, Serbien, Bosnien, Nordmazedonien und Montenegro liegen in Europa und außerhalb des EU Roamings. Das erklärt die gesamte Nachfrage.',
    sectionOrder: ['intro', 'linie', 'routen', 'abdeckung', 'entscheiden', 'faq'],
    intro: [
      'Der Balkan ist das deutlichste Beispiel für eine Region, die geografisch europäisch und kommerziell getrennt ist. Kroatien, Slowenien, Griechenland und Bulgarien liegen in der Roaming Zone. Albanien, Serbien, Bosnien und Herzegowina, Nordmazedonien und Montenegro nicht.',
      'Diese Linie ist vor Ort unsichtbar. Man überquert sie auf einer Küstenstraße oder einem Pass, und das Einzige, was darauf hinweist, ist später die Rechnung.',
    ],
    sections: {
      linie: {
        heading: 'Wer auf welcher Seite liegt',
        body: [
          'Innerhalb der Zone und damit auf einem deutschen Tarif kostenlos: Kroatien, Slowenien, Griechenland, Bulgarien und Rumänien. Außerhalb und damit kostenpflichtig: Albanien, Serbien, Bosnien und Herzegowina, Nordmazedonien und Montenegro.',
          'Das ist die nützlichste Information auf dieser Seite. Die meisten Balkanrouten berühren beide Seiten.',
        ],
      },
      routen: {
        heading: 'Die Routen, auf denen es teuer wird',
        body: [
          'Die Adriafahrt von Kroatien über Montenegro nach Albanien überquert die Linie zweimal. Ebenso jede Reise, die Griechenland mit Nordmazedonien oder Bulgarien mit Serbien verbindet.',
          'Albanien erzeugt besonders starke Nachfrage, weil es sich zu einem gewöhnlichen Badeziel entwickelt hat und trotzdem außerhalb der Regelung liegt.',
        ],
      },
      abdeckung: {
        heading: 'Die Abdeckung ist besser als der Ruf',
        body: [
          'Die Netze der Region sind modern und die Städte gut versorgt. Die albanische Küste, Belgrad, Sarajevo, Skopje und Podgorica lassen Sie nicht im Stich.',
          'Dünner wird es in den Bergen, und die Berge sind ein großer Teil des Reisegrunds. Planen Sie Wandertage offline.',
        ],
      },
      entscheiden: {
        heading: 'Wie Sie entscheiden',
        body: [
          'Bleibt die Reise im EU Teil, brauchen Sie nichts. Führt sie nach Albanien, Serbien, Bosnien, Nordmazedonien oder Montenegro, braucht diese Etappe Abdeckung.',
          'Wird die Linie mehrfach überquert, erspart ein regionaler Tarif das Kaufen an jeder Grenze. Für ein einzelnes Land außerhalb der Zone ist ein Landertarif günstiger.',
        ],
      },
    },
    faq: [
      {
        q: 'Welche Balkanländer deckt EU Roaming ab?',
        a: 'Kroatien, Slowenien, Griechenland, Bulgarien und Rumänien. Albanien, Serbien, Bosnien und Herzegowina, Nordmazedonien und Montenegro nicht.',
      },
      {
        q: 'Warum taucht Albanien so häufig auf?',
        a: 'Weil es ein gewöhnliches Sommerziel geworden ist und trotzdem außerhalb der Roaming Regelung liegt.',
      },
      {
        q: 'Ist die Abdeckung in den Bergen verlässlich?',
        a: 'Weniger, und die Berge sind ein Hauptgrund für die Reise. Planen Sie Wandertage offline.',
      },
      {
        q: 'Brauche ich etwas für Kroatien allein?',
        a: 'Nein. Kroatien liegt innerhalb der Roaming Zone.',
      },
    ],
  },
};

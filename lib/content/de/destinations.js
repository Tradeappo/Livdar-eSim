// Deutscher Markt: EU-Roaming ist im Tarif enthalten, also entsteht der Nutzen
// eines Reise-eSIM fast ausschließlich außerhalb der EU. Wer hier so tut, als
// wäre ein eSIM für Spanien ein Schnäppchen, verliert den Leser sofort.
// Deshalb steht auf jeder Seite zuerst die Frage: brauchst du das überhaupt.

export const destinations = {
  turkey: {
    angle: 'Kostenlücke außerhalb der EU plus IMEI-Registrierung',
    h1: 'eSIM für die Türkei',
    title: 'eSIM Türkei: die Lücke, die dein EU-Tarif nicht abdeckt',
    metaDescription: 'Die Türkei gehört nicht zur EU-Roaming-Zone. Dazu kommt die IMEI-Registrierung, die Handys nach rund vier Monaten sperrt. Beides umgeht ein Reise-eSIM.',
    sectionOrder: ['intro', 'kosten', 'imei', 'netz', 'installation', 'grenzen', 'faq'],
    intro: [
      'Innerhalb der EU nimmst du dein Datenvolumen einfach mit. An der türkischen Grenze hört das auf. Die Türkei ist kein EU-Land und kein EWR-Land, das enthaltene Roaming endet dort, und was danach gilt, steht im Kleingedruckten deines Tarifs.',
      'Das ist der eine Grund für ein Reise-eSIM in der Türkei. Der zweite steht weiter unten und betrifft dein Handy selbst.',
    ],
    sections: {
      kosten: {
        heading: 'Was Roaming in der Türkei wirklich kostet',
        body: [
          'Deutsche Anbieter behandeln die Türkei als Nicht-EU-Ziel. Je nach Tarif bedeutet das eine Tagespauschale, ein kleines Zusatzpaket oder einen Preis pro Megabyte, der bei normalem Urlaubsverhalten schnell dreistellig wird.',
          'Prüf deinen eigenen Tarif, bevor du irgendetwas kaufst. Steht die Türkei in deiner Auslandsoption drin, brauchst du uns für zwei Wochen Antalya nicht. Steht sie nicht drin, rechne die Tagespauschale mal der Anzahl deiner Urlaubstage. Diese Rechnung fällt selten knapp aus.',
        ],
      },
      imei: {
        heading: 'Die IMEI-Registrierung, die kaum jemand erwähnt',
        body: [
          'Die Türkei registriert ausländische Handys, die mit einer türkischen SIM benutzt werden, gegen den Pass der Person, die sie anmeldet. Ohne Anmeldung wird das Gerät im türkischen Netz nach etwa vier Monaten gesperrt.',
          'Für einen einmaligen Urlaub trifft dich das meistens nicht. Wer jedes Jahr an dieselbe Küste fährt oder eine Saison bleibt, merkt es irgendwann sehr deutlich.',
          'Ein Reise-eSIM löst das strukturell: du bist Gast im Netz, kein türkischer Vertragskunde. Es wird nichts registriert, also läuft auch nichts ab.',
        ],
      },
      netz: {
        heading: 'Netzabdeckung',
        body: [
          'Drei Netze teilen sich das Land: Turkcell, Vodafone Türkiye und Türk Telekom. Istanbul, Ankara, Izmir, Antalya und die gesamte Ägäis- und Mittelmeerküste sind dicht versorgt.',
          'Kappadokien, der Osten und die Bergstraßen sind eine andere Geschichte. Das Netz folgt den Hauptstraßen und den Orten. Wer morgens um fünf zu den Ballons fährt, lädt die Karte besser vorher herunter.',
        ],
      },
      installation: {
        heading: 'Wann installieren',
        body: [
          'Zu Hause im WLAN installieren, ausgeschaltet lassen, nach der Landung aktivieren. Die Installation eines eSIM braucht eine funktionierende Internetverbindung, und genau die fehlt dir in dem Moment, in dem du sie am dringendsten brauchst.',
        ],
      },
      grenzen: {
        heading: 'Was ein Daten-eSIM nicht kann',
        body: [
          'Es liefert Daten. Es liefert keine türkische Rufnummer. Wenn dir eine türkische Bank, eine Lieferapp oder eine Behörde eine SMS mit Bestätigungscode schicken will, kommt die nirgends an.',
          'Wer eine echte +90 Nummer braucht, braucht ein anderes Produkt. Das sagen wir lieber vorher als hinterher.',
        ],
      },
    },
    faq: [
      { q: 'Gilt mein EU-Roaming in der Türkei?', a: 'Nein. Die Türkei ist weder EU noch EWR. Was dort gilt, steht in der Auslandsoption deines Tarifs, und die ist bei jedem Anbieter anders.' },
      { q: 'Wird mein Handy in der Türkei gesperrt?', a: 'Nicht mit einem Reise-eSIM. Die IMEI-Regel betrifft Geräte, die mit einer türkischen Vertragsnummer benutzt werden.' },
      { q: 'Kann ich meine deutsche Nummer parallel behalten?', a: 'Ja, bei Dual-SIM-Geräten. Deutsche Nummer für Anrufe aktiv lassen, Datenroaming darauf ausschalten, mobile Daten auf das eSIM legen.' },
    ],
  },

  japan: {
    angle: 'Fernreise, sehr gute Netze, keine Chance auf eine lokale Nummer',
    h1: 'eSIM für Japan',
    title: 'eSIM Japan: schnelles Netz, null Behördengang',
    metaDescription: 'Japan hat hervorragende Netze und praktisch keinen Weg für Touristen zu einer japanischen Nummer. Ein Reise-eSIM überspringt den Schalter am Flughafen.',
    sectionOrder: ['intro', 'netz', 'warum', 'installation', 'grenzen', 'alternativen', 'faq'],
    intro: [
      'Japan ist technisch das einfachste Land, in dem man online sein kann, und bürokratisch eines der schwierigsten, um an eine Leitung zu kommen. Ein Vertrag verlangt eine Aufenthaltskarte und ein japanisches Bankkonto.',
      'Für Reisende bleiben Touristen-SIMs am Flughafenschalter, Pocket-WLAN zum Mieten oder ein Reise-eSIM. Der Unterschied ist vor allem, wie viel von deinem ersten Tag draufgeht.',
    ],
    sections: {
      netz: {
        heading: 'Netzabdeckung',
        body: [
          'NTT Docomo, KDDI au, SoftBank und Rakuten Mobile tragen das Land. Die ersten drei decken es umfassend ab, inklusive Shinkansen-Strecken und großem Teil der U-Bahn. Rakuten ist außerhalb der Städte deutlich dünner.',
          'In welchem dieser Netze ein bestimmter Tarif läuft, ist die einzige wirklich wichtige Frage zu einem Japan-eSIM. Das ist eine Eigenschaft des Tarifs, nicht des Landes.',
        ],
      },
      warum: {
        heading: 'Warum Verbindung in Japan mehr zählt als anderswo',
        body: [
          'Weil fast alles über das Handy läuft. Umsteigen in Tokio ist ohne Routing-App ehrlich schwierig. Speisekarten ohne englische Version, Ticketautomaten, die letzte Bahn: alles Daten.',
          'Kostenloses WLAN gibt es, es ist besser geworden, aber es ist lückenhaft unterwegs und nutzlos unter der Erde. Unter der Erde verbringst du in Tokio viel Zeit.',
        ],
      },
      installation: {
        heading: 'Wann installieren',
        body: [
          'Vor dem Abflug, im WLAN. Narita und Haneda haben kostenloses WLAN, aber der Weg durch Einreise und Gepäckhalle ist nicht der Ort, an dem du einen QR-Code debuggen willst.',
        ],
      },
      grenzen: {
        heading: 'Was ein Daten-eSIM nicht kann',
        body: [
          'Keine japanische Nummer. Das wiegt in Japan schwerer als anderswo, weil manche Restaurantplattformen, Ticketseiten und fast alle Lieferdienste ohne inländische Nummer keine Buchung abschließen.',
          'Wenn deine Reise von einer Tischreservierung abhängt, die nur telefonisch funktioniert, plane das getrennt.',
        ],
      },
      alternativen: {
        heading: 'eSIM, Pocket-WLAN oder Flughafen-SIM',
        body: [
          'Pocket-WLAN ist die klassische japanische Antwort und für Gruppen weiterhin sinnvoll, weil ein Gerät alle versorgt. Es ist auch ein weiteres Gerät zum Laden und ein weiteres Gerät, das vor dem Rückflug zurückgegeben werden muss.',
          'Roaming aus Deutschland nach Japan ist bei allen drei Netzbetreibern ein Nicht-EU-Ziel mit entsprechender Preisliste.',
        ],
      },
    },
    faq: [
      { q: 'Reicht kostenloses WLAN in Japan?', a: 'Für einen Nachmittag im Café ja. Für Umsteigen in Tokio mit Anschluss-Shinkansen nein. Die Lücken liegen genau dort, wo du es brauchst.' },
      { q: 'In welchem Netz bin ich?', a: 'Das hängt vom Tarif ab, nicht vom Land. Frag vor dem Kauf nach, der Unterschied zwischen Docomo und Rakuten ist außerhalb der Städte real.' },
      { q: 'Kann ich meinen Laptop tethern?', a: 'Nur wenn der Tarif Hotspot erlaubt. Manche Reisetarife sperren das. Wer aus Japan arbeitet, prüft genau diese Zeile.' },
    ],
  },

  'united-states': {
    angle: 'Deutsche Tagespauschalen für die USA sind der konkrete Vergleichspunkt',
    h1: 'eSIM für die USA',
    title: 'eSIM USA: rechne die Tagespauschale deines Anbieters durch',
    metaDescription: 'Deutsche Anbieter verkaufen die USA als Tagespauschale. Über zwei Wochen ergibt das eine klare Rechnung. Dazu: welches Netz abseits der Interstates trägt.',
    sectionOrder: ['intro', 'rechnung', 'netz', 'installation', 'grenzen', 'alternativen', 'faq'],
    intro: [
      'Die USA sind für deutsche Mobilfunkkunden ein klassisches Zusatzoptionsziel. Die großen Anbieter verkaufen Tagespässe oder Auslandspakete, und die sind je nach Tarif zwischen erträglich und teuer.',
      'Die zweite Frage stellt fast niemand, und sie ist die wichtigere: in welchem der drei amerikanischen Netze landest du eigentlich.',
    ],
    sections: {
      rechnung: {
        heading: 'Die Rechnung, die du vor dem Kauf machst',
        body: [
          'Schau in deinen Tarif, finde den Tagespreis oder das Auslandspaket für Nordamerika und multipliziere ihn mit der Zahl deiner Reisetage. Dann vergleiche.',
          'Bei drei Tagen New York lohnt sich der Aufwand oft nicht. Bei zwei Wochen Roadtrip fast immer.',
        ],
      },
      netz: {
        heading: 'Drei Netze, drei sehr verschiedene Karten',
        body: [
          'Verizon und AT&T haben die größte Reichweite im ländlichen Raum. T-Mobile US hat das stärkste 5G in den Städten und hat viel aufgeholt, aber nicht alles.',
          'New York, Chicago, Los Angeles, Las Vegas: alle drei funktionieren. Utah, Montana, die Dakotas, die langen leeren Abschnitte: dort entscheidet das Netz darüber, ob du eine Karte hast oder nicht.',
        ],
      },
      installation: {
        heading: 'Wann installieren',
        body: [
          'Zu Hause im WLAN. Amerikanische Flughäfen haben kostenloses WLAN, das meistens eine E-Mail-Adresse und ein Anmeldeportal verlangt. Nach einem Langstreckenflug ist das eine Hürde zu viel.',
        ],
      },
      grenzen: {
        heading: 'Was ein Daten-eSIM nicht kann',
        body: [
          'Keine US-Nummer. In den USA hat das eine konkrete Folge: sehr viele Alltagsdienste schicken SMS an eine inländische Nummer. Fahrdienste, Lieferung, Wartelisten im Restaurant, Hotel-Check-in.',
          'Die meisten akzeptieren auch deine deutsche Nummer. Nicht alle. Gut zu wissen, bevor du vor dem Restaurant stehst.',
        ],
      },
      alternativen: {
        heading: 'eSIM, Roaming oder US-Prepaid',
        body: [
          'Eine amerikanische Prepaid-SIM aus einem Carrier-Store gibt dir eine echte Nummer und viel Datenvolumen, kostet aber einen Ladenbesuch und eine Stunde deines ersten Tages. Ab einem Monat ist das der bessere Deal.',
          'Für ein bis zwei Wochen ist ein eSIM, das du auf der Landebahn aktivierst, den Preisunterschied wert.',
        ],
      },
    },
    faq: [
      { q: 'Funktioniert das in den Nationalparks?', a: 'Am Besucherzentrum und an der Hauptstraße oft, auf den Trails selten. Kein Netz deckt das Hinterland ab. Offline-Karten laden.' },
      { q: 'Brauche ich 5G?', a: 'Für Geschwindigkeit in der Stadt ja. Dafür, ob du auf dem Land überhaupt Empfang hast, nein. Das entscheiden die alten Frequenzbänder und damit das Netz.' },
      { q: 'Reicht Hotel-WLAN?', a: 'Im Hotel ja. Im Mietwagen, im Park, an der Tankstelle im Nirgendwo nicht.' },
    ],
  },

  'united-arab-emirates': {
    angle: 'VoIP-Sperre ist für deutsche Reisende die entscheidende Information',
    h1: 'eSIM für die VAE',
    title: 'eSIM Dubai und VAE: erst die Telefonieregeln lesen',
    metaDescription: 'In den Emiraten sind Anrufe über WhatsApp und FaceTime eingeschränkt. Daten sind schnell und problemlos. Beides solltest du vor der Reise wissen.',
    sectionOrder: ['intro', 'voip', 'netz', 'kosten', 'installation', 'alternativen', 'faq'],
    intro: [
      'Online sein ist in den Vereinigten Arabischen Emiraten einfach. Dubai und Abu Dhabi haben einige der schnellsten Mobilfunknetze überhaupt.',
      'Das, was du vor der Reise wissen solltest, betrifft nicht die Geschwindigkeit, sondern was du mit der Verbindung machen darfst.',
    ],
    sections: {
      voip: {
        heading: 'Anrufe über Apps sind eingeschränkt',
        body: [
          'Die VAE beschränken Sprach- und Videoanrufe über Dienste wie WhatsApp, FaceTime und Messenger in den lokalen Netzen. Nachrichten funktionieren in der Regel, Anrufe häufig nicht.',
          'Ob ein bestimmtes Reise-eSIM davon betroffen ist, hängt davon ab, wie dieser Tarif den Verkehr führt, und es kann sich ändern. Jede Seite, die dir uneingeschränkte WhatsApp-Anrufe in den VAE verspricht, solltest du skeptisch lesen. Auch unsere: wir schreiben, was ein Tarif tut, sobald wir es prüfen können, und schreiben, dass wir es nicht wissen, wenn wir es nicht wissen.',
          'Wenn ein funktionierendes Telefonat nach Hause wichtig ist, plane ein normales Telefonat ein, keinen App-Anruf.',
        ],
      },
      netz: {
        heading: 'Netzabdeckung',
        body: [
          'Zwei Betreiber versorgen das Land, Etisalat by e& und du. Beide decken Städte, Autobahnen, Flughäfen und die wichtigsten Wüstenrouten vollständig ab.',
          'Die Versorgung in den großen Malls und in der Metro ist geplant und nicht zufällig, und das merkt man.',
        ],
      },
      kosten: {
        heading: 'Warum nicht einfach roamen',
        body: [
          'Die Emirate liegen außerhalb jeder Roaming-Regelung, von der europäische Reisende profitieren. Tagespässe in die Golfregion gehören bei deutschen Anbietern zu den teuersten Posten der Preisliste.',
        ],
      },
      installation: {
        heading: 'Wann installieren',
        body: [
          'Vor dem Abflug. Dubai International hat gutes kostenloses WLAN und einen der längsten Wege vom Gate zur Einreise weltweit. Auf diesem Weg verbunden zu sein ist überraschend nützlich.',
        ],
      },
      alternativen: {
        heading: 'eSIM, Touristen-SIM oder Hotel-WLAN',
        body: [
          'Beide Betreiber verkaufen Besucherpakete mit lokaler Nummer, teilweise als Zugabe zu bestimmten Flugtickets. Wer geschäftlich dort ist und zurückgerufen werden muss, für den lohnt die Schlange am Schalter.',
          'Für einen Urlaub, in dem das Handy Karte, Kamera und Chat ist, reicht ein Reise-eSIM ohne Passkontrolle und ohne Warten.',
        ],
      },
    },
    faq: [
      { q: 'Kann ich in Dubai mit WhatsApp telefonieren?', a: 'Nachrichten, Fotos und Sprachnachrichten funktionieren meistens. Sprach- und Videoanrufe sind in den lokalen Netzen eingeschränkt. Plane nicht damit.' },
      { q: 'Hilft ein VPN?', a: 'VPN-Nutzung ist in den VAE rechtlich heikel, und wir raten dir nicht dazu, eine nationale Regelung zu umgehen. Plane mit den Regeln, wie sie sind.' },
      { q: 'Reicht Hotel-WLAN?', a: 'Im Hotel ja. Im Taxi, an der Marina, in der Wüste nicht.' },
    ],
  },

  thailand: {
    angle: 'Hier gewinnt die lokale SIM oft, und das sagen wir auch',
    h1: 'eSIM für Thailand',
    title: 'eSIM Thailand: wann sich die lokale SIM mehr lohnt',
    metaDescription: 'Thailändische Touristen-SIMs sind billig und großzügig. Ein Reise-eSIM lohnt sich trotzdem in bestimmten Fällen. Hier steht, in welchen.',
    sectionOrder: ['intro', 'ehrlich', 'netz', 'installation', 'grenzen', 'kosten', 'faq'],
    intro: [
      'Die meisten eSIM-Seiten erzählen dir, eine lokale SIM sei umständlich. In Thailand stimmt das nur halb. AIS und TrueMove verkaufen an beiden Bangkoker Flughäfen Touristenpakete, die günstig sind, eine thailändische Nummer enthalten und mehr Daten haben, als die meisten in einem Monat verbrauchen.',
      'Diese Seite fängt deshalb mit dem Argument gegen uns an.',
    ],
    sections: {
      ehrlich: {
        heading: 'Wann die thailändische SIM besser ist',
        body: [
          'Wenn du länger als etwa zwei Wochen bleibst, wenn du eine thailändische Nummer für Grab, Essenslieferung und Hotelbuchungen willst, oder wenn du knapp kalkulierst: kauf die lokale SIM. Sie ist für diese Reise das bessere Produkt.',
          'Ein Reise-eSIM gewinnt, wenn du spät landest, innerhalb weniger Tage weiterziehst, Thailand mit Vietnam und Kambodscha auf einem Tarif kombinierst, oder schlicht nicht die erste halbe Stunde des Urlaubs mit dem Pass in der Hand an einem Schalter stehen willst.',
        ],
      },
      netz: {
        heading: 'Netzabdeckung',
        body: [
          'AIS und TrueMove H decken das Land gut ab, einschließlich der Inseln, auf die es ankommt: Phuket, Samui, Phi Phi, Krabi. NT ist dünner.',
          'Auf kleineren Inseln und auf den Bootsverbindungen dazwischen bricht der Empfang weg. Das ist Geografie, kein Tarifproblem.',
        ],
      },
      installation: {
        heading: 'Wann installieren',
        body: [
          'Im WLAN vor dem Abflug. Bangkok um elf Uhr nachts mit einer Taxischlange vor dir ist nicht der Moment, in dem ein abgelaufener QR-Code auffallen soll.',
        ],
      },
      grenzen: {
        heading: 'Was ein Daten-eSIM nicht kann',
        body: [
          'Keine thailändische Nummer. Das wiegt hier schwerer als sonst, weil Grab, LINE und die meisten Lieferdienste um eine lokale Nummer herum gebaut sind. LINE ist in Thailand das, was anderswo WhatsApp ist.',
        ],
      },
      kosten: {
        heading: 'Roaming aus Deutschland',
        body: [
          'Thailand liegt außerhalb jeder für deutsche Tarife inkludierten Zone. Tagespässe nach Südostasien sind gemessen daran, was dasselbe Geld vor Ort kauft, teuer.',
        ],
      },
    },
    faq: [
      { q: 'Soll ich einfach am Flughafen eine SIM kaufen?', a: 'Wenn du zwei Wochen oder länger bleibst und eine thailändische Nummer willst: ja. Das sagen wir dir lieber, als dir das falsche Produkt zu verkaufen.' },
      { q: 'Funktioniert das auf den Inseln?', a: 'Auf Phuket, Samui und Krabi ja. Auf kleinen Inseln und Fähren mit Lücken.' },
      { q: 'Ein Tarif für Thailand, Vietnam und Kambodscha?', a: 'Ein Südostasien-Regionaltarif kann das. Genau dort schlägt ein eSIM drei lokale SIM-Karten klar.' },
    ],
  },

  'united-kingdom': {
    angle: 'Für deutsche Tarife ist UK oft weiterhin inklusive, also erst prüfen',
    h1: 'eSIM für Großbritannien',
    title: 'eSIM Großbritannien: prüfe zuerst, ob dein Tarif es schon enthält',
    metaDescription: 'Viele deutsche Anbieter führen Großbritannien weiterhin in der EU-Zone. Prüfe das zuerst. Wenn nicht, ist ein Reise-eSIM die günstigere Lösung.',
    sectionOrder: ['intro', 'prüfen', 'tarifstand', 'netz', 'installation', 'grenzen', 'alternativen', 'faq'],
    intro: [
      'Großbritannien ist seit dem Austritt aus dem Binnenmarkt formal kein EU-Roaming-Land mehr. Praktisch haben viele deutsche Anbieter das Vereinigte Königreich freiwillig in ihrer EU-Zone gelassen.',
      'Das macht diese Seite kürzer als die meisten. Der erste Schritt ist nicht kaufen, sondern nachsehen.',
    ],
    sections: {
      prüfen: {
        heading: 'Zwei Minuten, die dir das Produkt ersparen können',
        body: [
          'Öffne die Tarifübersicht deines Anbieters und such nach der Länderliste deiner EU-Option. Steht Großbritannien darin, brauchst du für ein Wochenende in London nichts weiter.',
          'Steht es nicht darin, oder hat dein Anbieter nachträglich eine Tagesgebühr eingeführt, rechne diese Gebühr mal deine Reisetage. Bei vier Tagen Städtetrip ist ein Datentarif in der Regel günstiger.',
        ],
      },
      tarifstand: {
        heading: 'Warum die Antwort von Vertrag zu Vertrag abweicht',
        body: [
          'Mit dem Austritt aus dem Binnenmarkt ist die gesetzliche Pflicht entfallen, das Vereinigte Königreich wie ein EU-Land zu behandeln. Seitdem entscheidet jeder Anbieter selbst. Einige haben das Land in ihrer Inklusivzone gelassen, andere haben es herausgenommen und eine Gebühr dafür eingeführt.',
          'Entscheidend ist, dass ein Anbieter diese Änderung meist nicht für alle Kunden gleichzeitig macht. Üblich ist, sie nur für neu abgeschlossene Tarife anzuwenden und laufende Verträge zunächst unangetastet zu lassen. Zwei Leute beim selben Anbieter bekommen deshalb verschiedene Antworten, je nachdem, wann sie unterschrieben haben. Der Tipp eines Kollegen und ein Forenbeitrag von vorletztem Jahr helfen dir hier nicht.',
          'Verlässlich ist nur das Dokument, das an deinem eigenen Vertrag hängt: die Leistungsbeschreibung oder das Preisblatt im Kundenkonto, unter deinem Tarif, nicht unter dem aktuellen Angebot. In der App liegt derselbe Stand meist im Bereich Ausland oder Roaming. Taucht dort ein Stichtag auf, lies das Datum mit und vergleiche es mit dem Datum deines Vertrags.',
        ],
      },
      netz: {
        heading: 'Netzabdeckung',
        body: [
          'EE, Vodafone UK, O2 und Three UK tragen das Land. Städte, Autobahnen und die großen Bahnstrecken sind gut versorgt. EE hat historisch die größte Fläche.',
          'Ländliches Wales, die schottischen Highlands und Teile des Südwestens haben echte Funklöcher. Die Strecke London nach Edinburgh reißt auf jedem Netz mehrfach ab.',
        ],
      },
      installation: {
        heading: 'Wann installieren',
        body: [
          'Vor der Reise. Heathrow, Gatwick und Manchester haben kostenloses WLAN. Die Ankunft mit dem Eurostar in St Pancras und die Ausfahrt von der Fähre haben keines.',
        ],
      },
      grenzen: {
        heading: 'Was ein Daten-eSIM nicht kann',
        body: [
          'Keine britische Nummer. Wer eine +44 Nummer für Bestätigungscodes braucht, für eine Bank, einen Vermieter oder einen Arbeitgeber, braucht eine britische SIM. Datenvolumen ändert daran nichts.',
        ],
      },
      alternativen: {
        heading: 'eSIM, Roaming oder britische Prepaid-SIM',
        body: [
          'Britische Prepaid-Karten sind billig, in jedem Supermarkt erhältlich und geben dir eine echte Nummer. Wer regelmäßig dort ist oder wochenlang bleibt, nimmt die.',
          'Für eine Kurzreise mit einem Handy, das ohnehin funktioniert, ist ein eSIM das, was du vom Sofa aus einrichtest.',
        ],
      },
    },
    faq: [
      { q: 'Gilt mein EU-Roaming in Großbritannien?', a: 'Bei vielen deutschen Anbietern ja, freiwillig. Verlass dich nicht darauf, sondern schau in die Länderliste deiner Option.' },
      { q: 'Wie ist das Netz im Zug?', a: 'Auf jedem Netz lückenhaft. London nach Edinburgh reißt mehrfach ab. Lade vorher herunter, was du brauchst.' },
      { q: 'Bekomme ich damit eine britische Nummer?', a: 'Nein. Dafür brauchst du eine britische SIM-Karte.' },
    ],
  },

  switzerland: {
    angle: 'Für Deutschland das wichtigste Ziel überhaupt, wegen der Grenzlage',
    h1: 'eSIM für die Schweiz',
    title: 'eSIM Schweiz: das Nachbarland, das dein EU-Tarif nicht kennt',
    metaDescription: 'Die Schweiz gehört nicht zur EU-Roaming-Zone. Schweizer Netze funken über die Grenze, deshalb kostet sie manchmal schon in Konstanz. So verhinderst du das.',
    sectionOrder: ['intro', 'grenze', 'netz', 'installation', 'grenzen', 'alternativen', 'faq'],
    intro: [
      'Die Schweiz ist von der EU umgeben und gehört nicht zu ihren Roaming-Regeln. Aus diesem einen Satz entstehen mehr überraschende Handyrechnungen als aus jedem anderen Reiseziel in Europa, weil sich die Grenze nach nichts anfühlt.',
      'Für deutsche Reisende ist das nicht nur ein Urlaubsthema. Es ist ein Wochenendthema, ein Tagesausflugthema und in Grenznähe ein Alltagsthema.',
    ],
    sections: {
      grenze: {
        heading: 'Das Grenzproblem ist größer, als es klingt',
        body: [
          'Schweizer Netze funken über die Grenze. In Konstanz, in Lörrach, im Allgäu oder auf der Autobahn bei Basel kann sich dein Handy in eine Schweizer Zelle einbuchen, ohne dass du irgendwo hinfährst.',
          'Wenn dein Tarif die Schweiz berechnet, ist das eine Roaming-Gebühr, die du im Inland ausgelöst hast. Datenroaming auf der deutschen Nummer abschalten und Daten auf ein Reise-eSIM legen beseitigt den Fehlermodus vollständig.',
        ],
      },
      netz: {
        heading: 'Netzabdeckung',
        body: [
          'Swisscom, Sunrise und Salt versorgen das Land auf einem Niveau, das im europäischen Vergleich ungewöhnlich ist, inklusive der meisten Alpentäler, der Bergbahnen und der Straßentunnel.',
          'Swisscom hat in den Bergen die größte Tiefe. Wer wandert statt Städte anzusehen, für den ist dieser Unterschied die Nachfrage wert.',
        ],
      },
      installation: {
        heading: 'Wann installieren',
        body: [
          'Vor der Grenze, also vor der Abfahrt, nicht nach der Ankunft. Bei keinem anderen Ziel ist es so wichtig, bereits verbunden anzukommen.',
        ],
      },
      grenzen: {
        heading: 'Was ein Daten-eSIM nicht kann',
        body: [
          'Keine Schweizer Nummer. Die Schweiz verlangt für eine lokale Teilnehmernummer eine Identitätsprüfung, deshalb kann ein Besucher sie nicht einfach online kaufen und sich ins Ausland schicken lassen.',
        ],
      },
      alternativen: {
        heading: 'eSIM, Roaming oder Schweizer SIM',
        body: [
          'Eine Schweizer Prepaid-Karte verlangt eine Identitätsprüfung vor Ort oder eine Schweizer Lieferadresse. Für die meisten Besucher ist sie vor der Anreise keine Option.',
          'Roaming ist die teure Voreinstellung. Ein Reise-eSIM ist die Variante ohne Papierkram und ohne Entscheidung an der Grenze.',
        ],
      },
    },
    faq: [
      { q: 'Gilt EU-Roaming in der Schweiz?', a: 'Nein. Die Schweiz ist weder EU noch EWR-Roaming-Zone. Manche deutschen Tarife schließen sie freiwillig ein, viele nicht.' },
      { q: 'Warum wurde mir Roaming berechnet, obwohl ich in Deutschland war?', a: 'Schweizer Zellen funken über die Grenze. In Grenznähe bucht sich dein Handy dort ein. Datenroaming auf der Hauptnummer abschalten verhindert es.' },
      { q: 'Funktioniert es auf den Bergbahnen?', a: 'Größtenteils ja, die Schweizer Abdeckung in den Alpen ist ungewöhnlich gut. Tunnel und hohe Täler reißen trotzdem ab.' },
    ],
  },

  bali: {
    angle: 'Ankunftsreibung, nicht Netzqualität',
    h1: 'eSIM für Bali',
    title: 'eSIM Bali: am Schalter in Denpasar vorbei',
    metaDescription: 'Indonesische SIM-Karten müssen gegen den Pass registriert werden. Der Schalter in Denpasar weiß das. Ein Reise-eSIM bringt dich vorher online.',
    sectionOrder: ['intro', 'registrierung', 'geraeteregister', 'netz', 'installation', 'grenzen', 'alternativen', 'faq'],
    intro: [
      'Bali hat ordentliche Netzabdeckung und eine ausgesprochen lästige Ankunft. Indonesische Prepaid-Karten müssen gegen einen Pass registriert werden, die Schalter in Denpasar wissen, dass du keine Alternative hast, und die Schlange liegt genau zwischen Einreise und Taxistand.',
      'Das ist kein Netzproblem. Es ist ein Reibungsproblem, und genau das löst ein Reise-eSIM hier.',
    ],
    sections: {
      registrierung: {
        heading: 'Was die Registrierungspflicht bedeutet',
        body: [
          'Indonesien verlangt, dass Prepaid-Nummern gegen ein Ausweisdokument registriert werden. Für Besucher heißt das: Pass über den Tresen, warten, bis eingetippt ist.',
          'Das ist weder gefährlich noch grundsätzlich langsam. Es ist langsam um elf Uhr nachts mit einem vollen Flug vor dir.',
        ],
      },
      geraeteregister: {
        heading: 'Das zweite Register, und dieses betrifft dein Handy',
        body: [
          'Indonesien erfasst nicht nur die Rufnummer, sondern auch das Gerät. Jedes Telefon trägt eine IMEI, eine feste Kennung der Hardware, und die indonesischen Netze gleichen sie gegen ein nationales Verzeichnis ab. Ein Handy, das du von zu Hause mitbringst, steht dort nicht drin.',
          'Wer es mit einer indonesischen Karte betreiben will, muss es beim Zoll anmelden. Unterbleibt das, verliert das Gerät nach kurzer Zeit den Zugang zu den lokalen Netzen, und du stehst mit einem Telefon da, das im WLAN funktioniert und sonst nirgends. Fristen, Freigrenzen und Abgaben ändern sich, also lies vor dem Abflug den aktuellen Stand der Zollbehörde und nicht einen zwei Jahre alten Reiseblog.',
          'Mit einem Reise-eSIM stellt sich die Frage gar nicht erst. Du buchst dich über einen ausländischen Betreiber als Besucher ein statt als indonesischer Teilnehmer, und die Geräteanmeldung hängt an der lokalen Karte. Für zwei Wochen Urlaub ist das der Unterschied zwischen einem Behördengang und keinem.',
        ],
      },
      netz: {
        heading: 'Netzabdeckung',
        body: [
          'Telkomsel hat die stärkste Abdeckung auf der ganzen Insel, auch im Norden und Osten. Indosat und XL sind im Süden solide, dort, wo die meisten Besucher tatsächlich wohnen.',
          'Canggu, Seminyak, Ubud und Uluwatu sind gut versorgt. Sidemen, die Gegend um Munduk und die Straße nach Kintamani nicht durchgängig.',
        ],
      },
      installation: {
        heading: 'Wann installieren',
        body: [
          'Im WLAN vor dem Abflug. Das WLAN in Denpasar funktioniert, aber der Sinn dieses Produkts ist, es nicht zu brauchen.',
        ],
      },
      grenzen: {
        heading: 'Was ein Daten-eSIM nicht kann',
        body: [
          'Keine indonesische Nummer, und das zählt für Gojek und Grab. Beide bewegen Bali, und beide bevorzugen eine lokale Nummer für den Fahrerkontakt.',
        ],
      },
      alternativen: {
        heading: 'eSIM, lokale SIM oder Villen-WLAN',
        body: [
          'Ein Telkomsel-Touristenpaket ist billig und großzügig. Wer einen Monat in Bali arbeitet, fährt damit vermutlich besser.',
          'Das WLAN in Villen und Cafés im Süden ist gut genug, dass viele damit plus einem kleinen Datentarif auskommen.',
        ],
      },
    },
    faq: [
      { q: 'Muss ich ein eSIM mit dem Pass registrieren?', a: 'Nein. Die Registrierungspflicht gilt für indonesische Prepaid-Teilnehmernummern. Ein Reise-eSIM verbindet sich als Gast im Netz.' },
      { q: 'Funktioniert es in Ubud und im Norden?', a: 'In Ubud ja. Im Norden und auf den Bergstraßen ist jedes Netz dünner, Telkomsel am wenigsten.' },
      { q: 'Reicht es zum Arbeiten?', a: 'Für Anrufe und E-Mail ja, wenn der Tarif Hotspot erlaubt. Für große Uploads ist das Coworking-WLAN in Canggu schneller.' },
      { q: 'Wie sieht es auf Nusa Penida oder den Gilis aus?', a: 'Schwächer als auf der Südhalbinsel. In den Hauptorten und an den Anlegern hast du Empfang, auf den Klippenstraßen und während der Überfahrt nicht durchgängig. Lade Karte und Buchungen vor dem Ablegen herunter.' },
    ],
  },
};

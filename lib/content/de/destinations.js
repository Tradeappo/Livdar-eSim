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
      { q: 'Ist Großbritannien seit dem Brexit noch in meinem EU-Roaming enthalten?', a: 'Bei vielen deutschen Anbietern ja, freiwillig. Verlass dich nicht darauf, sondern schau in die Länderliste deiner Option.' },
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

  morocco: {
    angle: 'Andalusien plus Marokko, und die Roamingfalle liegt auf der spanischen Seite',
    h1: 'eSIM für Marokko',
    title: 'eSIM Marokko: Medina, Atlas und die Falle an der Meerenge',
    metaDescription: 'Marokko liegt außerhalb der EU-Roaming-Zone. Schon an der spanischen Küste bei Tarifa bucht sich das Handy oft ins marokkanische Netz ein. So planst du die Daten.',
    sectionOrder: ['intro', 'meerenge', 'kosten', 'rundreise', 'netz', 'grenzen', 'faq'],
    intro: [
      'Für deutsche Reisende ist Marokko oft der zweite Teil einer Andalusienreise oder eine Rundreise ab Marrakesch. In beiden Fällen gilt: Dein EU-Tarif hört an der Grenze auf. Marokko gehört weder zur EU noch zum EWR.',
      'Die erste Überraschung kommt aber häufig schon vorher, auf spanischem Boden. Dazu gleich mehr.',
    ],
    sections: {
      meerenge: {
        heading: 'Roaming in Marokko, obwohl du in Spanien bist',
        body: [
          'An der Küste um Tarifa und Algeciras reichen marokkanische Funkmasten über die Straße von Gibraltar. Wählt dein Handy automatisch das stärkste Netz, landest du im marokkanischen Roaming, während du noch am spanischen Strand liegst.',
          'Stell auf diesem Küstenabschnitt die Netzwahl deiner deutschen SIM auf manuell und wähle ein spanisches Netz. Das Marokko-eSIM schaltest du erst auf der Fähre oder nach der Landung in Tanger ein.',
        ],
      },
      kosten: {
        heading: 'Was dein deutscher Tarif in Marokko kostet',
        body: [
          'Die großen deutschen Anbieter führen Marokko in einer teuren Weltzone. Je nach Vertrag ist das ein Tagespass, ein kleines Datenpaket oder ein Preis pro Megabyte. Schau in deine Auslandsoption, bevor du fliegst, und rechne die Tage durch. Hast du bereits ein Paket, das Marokko einschließt, brauchst du uns nicht.',
        ],
      },
      rundreise: {
        heading: 'Rundreise: Städte, Pässe, Wüste',
        body: [
          'In Marrakesch, Fès, Casablanca, Rabat und Agadir ist das Netz gut. In der Medina von Fès hilft es trotzdem nur bedingt, weil die Gassen schmal und die Mauern hoch sind. Das GPS springt, eine Karte mit Live-Standort ist dort mehr wert als jede Wegbeschreibung.',
          'Über den Hohen Atlas, in der Todra- und der Dades-Schlucht und in den Wüstencamps bei Merzouga wird es dünn. Im Camp selbst gibt es oft gar keinen Empfang. Lade Karten und Buchungen vorher herunter.',
        ],
      },
      netz: {
        heading: 'Die Netze',
        body: [
          'Drei Anbieter teilen sich das Land: Maroc Telecom, Orange Maroc und Inwi. Welches Netz ein Reisetarif nutzt, hängt vom Tarif ab. Frag vor dem Kauf nach, wenn du viel im Süden unterwegs bist.',
        ],
      },
      grenzen: {
        heading: 'Was ein Daten-eSIM nicht kann',
        body: [
          'Es gibt dir keine marokkanische Nummer mit +212. Riads und Fahrer schreiben meist per WhatsApp, das funktioniert über jede Datenverbindung. Für SMS-Codes lokaler Dienste brauchst du eine marokkanische SIM mit Nummer, die es am Flughafen gegen Vorlage des Passes gibt.',
        ],
      },
    },
    faq: [
      { q: 'Gilt mein EU-Roaming in Marokko?', a: 'Nein. Marokko ist weder EU noch EWR. Es gelten die Preise deiner Auslandsoption, sofern du eine gebucht hast.' },
      { q: 'Warum zeigt mein Handy in Tarifa ein marokkanisches Netz?', a: 'Weil marokkanische Masten über die Meerenge funken. Stell an der Küste die Netzwahl auf manuell und wähle ein spanisches Netz.' },
      { q: 'Habe ich im Wüstencamp Empfang?', a: 'Selten. Manchmal auf einer Düne in Campnähe, im Zelt kaum. Plane die Nacht in der Wüste offline.' },
    ],
  },

  egypt: {
    angle: 'Pauschalurlaub am Roten Meer, und das Hotel-WLAN endet am Pool',
    h1: 'eSIM für Ägypten',
    title: 'eSIM Ägypten: Hurghada, Tauchboot und Nilkreuzfahrt',
    metaDescription: 'Ägypten liegt außerhalb der EU-Roaming-Zone. Am Roten Meer ist das Netz gut, auf dem Nil und in der Wüste lückenhaft. Wann sich ein Reise-eSIM lohnt und wann nicht.',
    sectionOrder: ['intro', 'pauschal', 'ausfluege', 'nil', 'netz', 'grenzen', 'faq'],
    intro: [
      'Die meisten deutschen Ägyptenurlaube beginnen mit einem Charterflug nach Hurghada, Marsa Alam oder Sharm el-Sheikh. Ägypten ist kein EU-Land, deine Flatrate zu Hause gilt dort nicht, und mobile Daten kosten über die Auslandsoption schnell mehr als erwartet.',
      'Ob du ein eSIM brauchst, hängt stark davon ab, wie viel du das Hotel verlässt.',
    ],
    sections: {
      pauschal: {
        heading: 'All inclusive und nur am Strand',
        body: [
          'Wer eine Woche im Resort bleibt und abends im WLAN der Lobby Nachrichten schreibt, kommt oft ohne mobile Daten aus. Das ist die ehrliche Antwort, und sie spart dir Geld.',
          'Sobald du Ausflüge buchst, Taxis bestellst oder in Hurghada selbst unterwegs bist, reicht das Hotel-WLAN nicht mehr. Es endet meist am Pool.',
        ],
      },
      ausfluege: {
        heading: 'Ausflüge nach Luxor und Kairo',
        body: [
          'Die Tagestouren von der Küste nach Luxor fahren mehrere Stunden durch die Wüste. Unterwegs gibt es streckenweise keinen Empfang, in Luxor selbst ist das Netz gut. In Kairo und Gizeh ist die Abdeckung dicht, dort hilft Datenverbindung bei Fahrdiensten und beim Übersetzen am meisten.',
        ],
      },
      nil: {
        heading: 'Auf dem Nil und auf dem Tauchboot',
        body: [
          'Auf Nilkreuzfahrten zwischen Luxor und Assuan gibt es Netz an den Anlegestellen und nahe den Orten, dazwischen immer wieder Lücken. Das Schiffs-WLAN ist langsam und abends überlastet.',
          'Auf Tauchsafaris und Schnorchelbooten verschwindet das Signal mit dem Abstand zur Küste. Das betrifft jedes Netz und jede SIM.',
        ],
      },
      netz: {
        heading: 'Die Netze',
        body: [
          'Vodafone Egypt, Orange Egypt, Etisalat Misr und WE versorgen das Land. In den Badeorten am Roten Meer sind alle gut vertreten.',
        ],
      },
      grenzen: {
        heading: 'Keine ägyptische Nummer',
        body: [
          'Ein Daten-eSIM gibt dir keine Nummer mit +20. Für den Transfer oder den Reiseleiter bleibt deine deutsche Nummer erreichbar, zu den Roamingpreisen deines Tarifs. Eine lokale SIM mit Nummer gibt es am Flughafen gegen Vorlage des Passes.',
        ],
      },
    },
    faq: [
      { q: 'Lohnt sich ein eSIM im All-inclusive-Urlaub?', a: 'Wenn du das Resort kaum verlässt, oft nicht. Bei Ausflügen, Taxifahrten und Tauchbooten schon.' },
      { q: 'Habe ich auf der Tour von Hurghada nach Luxor Empfang?', a: 'In den Orten ja, auf der Wüstenstraße dazwischen immer wieder nicht. Lade Karten und Tickets vorher herunter.' },
      { q: 'Muss der Transferfahrer mich anrufen können?', a: 'Er erreicht deine deutsche Nummer, solange sie aktiv ist. Lass sie für Anrufe eingeschaltet und nutze das eSIM nur für Daten.' },
    ],
  },

  albania: {
    angle: 'Beliebtes Sommerziel außerhalb der EU, mit einer Roamingfalle auf Korfu',
    h1: 'eSIM für Albanien',
    title: 'eSIM Albanien: Riviera, Alpen und die Korfu-Falle',
    metaDescription: 'Albanien gehört nicht zur EU-Roaming-Zone. Auf Korfu buchen sich deutsche Handys oft ins albanische Netz ein. Was ein Reise-eSIM für Albanien und die Balkanroute bringt.',
    sectionOrder: ['intro', 'korfu', 'kosten', 'riviera', 'balkanroute', 'grenzen', 'faq'],
    intro: [
      'Albanien fühlt sich an wie ein europäisches Urlaubsland, und genau deshalb erwischt es viele. Das Land ist kein EU-Mitglied, Roaming wie zu Hause gilt dort nicht. Wer mit dem Mietwagen die Riviera abfährt, zahlt die Preise der Auslandsoption.',
      'Dazu kommt ein Effekt, der gar nicht in Albanien passiert, sondern auf einer griechischen Insel.',
    ],
    sections: {
      korfu: {
        heading: 'Die Korfu-Falle',
        body: [
          'Die Nordostküste von Korfu liegt Albanien direkt gegenüber. Handys verbinden sich dort häufig mit albanischen Netzen, und die Rechnung zeigt dann Roaming in Albanien, obwohl du in Griechenland warst.',
          'Stell auf Korfu die Netzwahl auf manuell und wähle ein griechisches Netz. Wenn du mit der Fähre nach Saranda übersetzt, ist das der Moment, das Albanien-eSIM einzuschalten.',
        ],
      },
      kosten: {
        heading: 'Was dein Tarif sagt',
        body: [
          'Deutsche Anbieter führen Albanien in einer Länderzone außerhalb der EU. Manche bieten Tages- oder Wochenpakete für den Westbalkan an. Prüf das vor der Abreise. Wenn dein Paket Albanien bereits einschließt, ist ein zusätzliches eSIM überflüssig.',
        ],
      },
      riviera: {
        heading: 'Riviera und Berge',
        body: [
          'Vodafone Albania und One Albania decken Saranda, Ksamil, Himara, Vlora und Tirana gut ab. Am Llogara-Pass reißt das Signal kurz ab.',
          'In den Albanischen Alpen, auf der Wanderung zwischen Valbona und Theth, bist du großteils offline. Die Gästehäuser haben meist WLAN, der Weg nicht. Route vorher herunterladen.',
        ],
      },
      balkanroute: {
        heading: 'Die Balkanroute mit dem Auto',
        body: [
          'Viele fahren über Kroatien, Montenegro und Albanien weiter nach Nordmazedonien. Kroatien ist EU, die anderen drei nicht. Für so eine Route ist ein regionaler Balkantarif praktischer als ein eSIM pro Land.',
          'An jeder Grenze wechselt das Handy das Netz. Mit einem Regionaltarif bleibt es derselbe Tarif, und du musst nicht an jedem Übergang neu kaufen oder aufladen.',
        ],
      },
      grenzen: {
        heading: 'Keine albanische Nummer',
        body: [
          'Ein Daten-eSIM gibt dir keine Nummer mit +355. Braucht der Vermieter eine lokale Nummer für SMS, hilft nur eine albanische SIM mit Nummer.',
        ],
      },
    },
    faq: [
      { q: 'Ist Albanien Teil der EU-Roaming-Zone?', a: 'Nein. Albanien ist Beitrittskandidat, aber kein Mitglied. Roaming wie zu Hause gilt dort nicht.' },
      { q: 'Warum habe ich auf Korfu albanisches Roaming bezahlt?', a: 'Albanische Masten reichen bis an die Nordostküste der Insel. Wähl dort manuell ein griechisches Netz.' },
      { q: 'Ein Tarif für Montenegro und Albanien?', a: 'Ein Balkan-Regionaltarif kann beide abdecken. Prüf vor dem Kauf, welche Länder genau enthalten sind.' },
    ],
  },

  canada: {
    angle: 'Kanada liegt in der teuren Weltzone deutscher Tarife, und das Netz hört dort auf, wo die Straße einsam wird',
    h1: 'eSIM für Kanada',
    title: 'eSIM Kanada: Rockies, Roadtrip und die Funklöcher dazwischen',
    metaDescription: 'Kanada gehört für deutsche Tarife zur teuren Weltzone. In Städten ist das Netz sehr gut, auf dem Icefields Parkway und in Nationalparks oft gar nicht. So planst du.',
    sectionOrder: ['intro', 'weltzone', 'wohnmobil', 'netzabdeckung', 'anbieter', 'grenzen', 'faq'],
    intro: [
      'Kanada ist für viele Deutsche das Wohnmobil- und Roadtrip-Land schlechthin: Vancouver, die Rockies, Banff und Jasper, oder Ostkanada mit Toronto, Montreal und Quebec. Drei Wochen sind typisch, und genau über diesen Zeitraum wird Roaming teuer.',
      'Kanada gehört weder zur EU noch zum EWR. Die meisten deutschen Verträge führen es in einer Weltzone mit Tages- oder Wochenpaketen zu Fernreisepreisen.',
    ],
    sections: {
      weltzone: {
        heading: 'Was dein deutscher Tarif in Kanada kostet',
        body: [
          'Schau vor der Abreise in die Auslandsoption deines Anbieters. Viele Tarife haben für Kanada nur kleine Datenpakete, die bei Navigation und Fotos schnell aufgebraucht sind. Rechne die Tage deiner Reise durch, bevor du entscheidest.',
        ],
      },
      wohnmobil: {
        heading: 'Mit dem Wohnmobil durch die Rockies',
        body: [
          'Auf dem Icefields Parkway zwischen Lake Louise und Jasper gibt es über lange Strecken kein Netz, bei keinem Anbieter. Das Gleiche gilt für viele Campingplätze in den Nationalparks.',
          'Lade Offline-Karten für die ganze Route herunter und sag jemandem, wann du ankommen willst. Die Besucherzentren und viele Lodges haben WLAN, dort holt man sich Wetter und Wegzustand.',
        ],
      },
      netzabdeckung: {
        heading: 'Städte und Osten',
        body: [
          'In Vancouver, Calgary, Toronto, Montreal und Quebec ist die Abdeckung so gut wie in deutschen Großstädten. Zwischen den Städten, etwa am Nordufer des Lake Superior, wird es auch im Osten dünn.',
        ],
      },
      anbieter: {
        heading: 'Die Netze',
        body: [
          'Rogers, Bell und Telus betreiben die drei landesweiten Netze, Freedom Mobile und Videotron sind regional stark. Auf dem Land entscheidet das Netz hinter deinem Tarif über den Empfang. Frag vor dem Kauf nach, wenn du viel außerhalb der Städte fährst.',
        ],
      },
      grenzen: {
        heading: 'Keine kanadische Nummer',
        body: [
          'Ein Daten-eSIM gibt dir keine kanadische Nummer mit +1. Für Anrufe bei Campingplätzen und Vermietern bleibt deine deutsche Nummer erreichbar, zu Roamingpreisen, oder du nutzt Messenger über Daten.',
        ],
      },
    },
    faq: [
      { q: 'Gilt mein EU-Roaming in Kanada?', a: 'Nein. Kanada ist weder EU noch EWR. Es gelten die Preise deiner Auslandsoption.' },
      { q: 'Habe ich auf dem Icefields Parkway Empfang?', a: 'Nur auf kurzen Abschnitten bei Lake Louise, Saskatchewan Crossing und Jasper. Plane die Strecke offline.' },
      { q: 'Lohnt sich ein eSIM für drei Wochen Wohnmobil?', a: 'Meistens ja, wenn dein Tarif Kanada nur mit kleinen Paketen abdeckt. Für die Funklöcher hilft es nicht, dafür sind Offline-Karten da.' },
    ],
  },

  vietnam: {
    angle: 'Rundreise von Nord nach Süd, oft mit Kambodscha, und eine lokale SIM, die günstig ist',
    h1: 'eSIM für Vietnam',
    title: 'eSIM Vietnam: Rundreise von Hanoi bis Saigon',
    metaDescription: 'Die vietnamesischen Netze sind schnell, lokale SIM-Karten günstig. Ein Reise-eSIM lohnt sich bei kurzen Reisen, direkt bei der Ankunft und auf Routen mit Kambodscha oder Laos.',
    sectionOrder: ['intro', 'rundreise', 'lokalsim', 'ankunft', 'nachbarn', 'grenzen', 'faq'],
    intro: [
      'Die klassische deutsche Vietnamreise geht von Hanoi über die Halong-Bucht, Hue und Hoi An nach Ho-Chi-Minh-Stadt, zwei bis drei Wochen, oft mit Verlängerung nach Kambodscha. Vietnam liegt für deutsche Tarife in einer Fernreisezone, Roaming ist dort teuer.',
      'Gleichzeitig sind vietnamesische SIM-Karten günstig. Deshalb die ehrliche Frage vorweg: wie lange und wohin genau?',
    ],
    sections: {
      rundreise: {
        heading: 'Unterwegs im Land',
        body: [
          'In Hanoi, Hue, Da Nang, Hoi An und Saigon ist das 4G-Netz schnell. Auf der Halong- und der Lan-Ha-Bucht wechselt der Empfang zwischen den Karstfelsen. In den Bergen um Sapa und Ha Giang gibt es auf den Hauptstraßen Netz, auf den Pässen Lücken.',
        ],
      },
      lokalsim: {
        heading: 'Wann die lokale SIM besser ist',
        body: [
          'Wer länger als einen Monat nur in Vietnam bleibt, fährt mit einer lokalen SIM von Viettel, Vinaphone oder MobiFone meist günstiger. Sie gibt es am Flughafen gegen Vorlage des Passes. Das sagen wir so, auch wenn es gegen ein eSIM spricht.',
        ],
      },
      ankunft: {
        heading: 'Die erste Stunde',
        body: [
          'Vom Flughafen in die Stadt nehmen die meisten Grab. Die App braucht Daten. Mit einem vorher installierten eSIM bist du bei der Landung online und musst am Taxistand nicht verhandeln.',
        ],
      },
      nachbarn: {
        heading: 'Mit Kambodscha oder Laos',
        body: [
          'Wer über die Grenze nach Kambodscha oder Laos fährt, braucht dort wieder eine neue SIM. Ein Regionaltarif für Südostasien deckt mehrere Länder mit einem eSIM ab.',
          'Viele Rundreisen enden mit ein paar Tagen in Angkor oder einem Abstecher nach Luang Prabang. An jeder Grenze wechselt das Handy das Netz, mit einem Regionaltarif bleibt es derselbe Tarif, und du musst an keinem Übergang einen neuen Shop suchen.',
        ],
      },
      grenzen: {
        heading: 'Keine vietnamesische Nummer',
        body: [
          'Das eSIM gibt dir keine Nummer mit +84. Grab funktioniert ohne, manche lokalen Dienste verlangen aber eine vietnamesische Nummer für SMS-Codes.',
        ],
      },
    },
    faq: [
      { q: 'Brauche ich in Vietnam überhaupt ein eSIM?', a: 'Bei kurzen Reisen und Rundreisen mit Nachbarländern ist es bequem. Bei langen Aufenthalten nur in Vietnam ist die lokale SIM oft günstiger.' },
      { q: 'Funktioniert Grab mit einem Reise-eSIM?', a: 'Ja. Grab braucht Daten und ein Konto, keine vietnamesische Nummer.' },
      { q: 'Habe ich auf der Halong-Bucht Empfang?', a: 'Zeitweise. Zwischen den Felsen bricht das Signal immer wieder ab.' },
    ],
  },

  mexico: {
    angle: 'Für Deutsche ist Mexiko Fernreisezone, und seit 2026 müssen mexikanische Nummern registriert werden',
    h1: 'eSIM für Mexiko',
    title: 'eSIM Mexiko: Yucatán, Mexiko-Stadt und die neue Registrierungspflicht',
    metaDescription: 'Mexiko liegt für deutsche Tarife in der teuren Weltzone. Mexikanische SIM-Karten müssen seit 2026 mit dem Pass registriert werden. Ein Reise-eSIM roamt stattdessen im Land.',
    sectionOrder: ['intro', 'zone', 'register', 'yucatan', 'hochland', 'grenzen', 'faq'],
    intro: [
      'Mexiko ist für deutsche Reisende vor allem Yucatán: Cancún, Playa del Carmen, Tulum, die Cenoten und Maya-Ruinen. Dazu kommen Mexiko-Stadt und Oaxaca. Für deutsche Tarife liegt Mexiko in der Weltzone, mobile Daten sind dort teuer.',
      'Seit 2026 gibt es außerdem eine neue Regel für mexikanische Mobilfunknummern, die den Kauf einer lokalen SIM etwas umständlicher macht.',
    ],
    sections: {
      zone: {
        heading: 'Was dein Tarif sagt',
        body: [
          'Prüf die Auslandsoption deines Anbieters. Viele deutsche Verträge bieten für Mexiko nur teure Tages- oder Wochenpakete. Wenn du zwei Wochen mit Mietwagen unterwegs bist, summiert sich das.',
        ],
      },
      register: {
        heading: 'Die Registrierungspflicht für mexikanische Nummern',
        body: [
          'Neue mexikanische Mobilfunknummern müssen seit Januar 2026 bei der Aktivierung ihrem Nutzer zugeordnet werden, Ausländer registrieren sich mit dem Reisepass. Nicht registrierte Nummern werden auf Notrufe beschränkt.',
          'Ausländische Roaming-Anschlüsse waren von der ersten Phase ausgenommen, die Behörde will ihre Behandlung später festlegen. Vor einem langen Aufenthalt lohnt sich ein aktueller Blick.',
        ],
      },
      yucatan: {
        heading: 'Yucatán mit dem Mietwagen',
        body: [
          'In Cancún, Playa del Carmen, Tulum und Valladolid ist das Netz gut. An abgelegenen Cenoten und bei Ausgrabungsstätten wie Calakmul wird es schwach oder verschwindet. Karten und Tickets vorher laden.',
        ],
      },
      hochland: {
        heading: 'Mexiko-Stadt und Oaxaca',
        body: [
          'Mexiko-Stadt ist sehr gut abgedeckt. Auf den Bergstraßen in Oaxaca und Chiapas gibt es zwischen den Orten Lücken. Telcel hat das größte Netz, AT&T Mexico folgt, Movistar nutzt weitgehend das AT&T-Netz.',
        ],
      },
      grenzen: {
        heading: 'Keine mexikanische Nummer',
        body: [
          'Ein Daten-eSIM gibt dir keine Nummer mit +52. Unterkünfte und Touranbieter schreiben meist über WhatsApp, das über Daten funktioniert.',
          'Für den Mietwagenschalter und Rückfragen der Unterkunft bleibt deine deutsche Nummer erreichbar, wenn du sie für Anrufe eingeschaltet lässt und nur die mobilen Daten auf das eSIM legst. Datenroaming auf der deutschen Karte schaltest du dabei aus.',
        ],
      },
    },
    faq: [
      { q: 'Muss ich ein Reise-eSIM in Mexiko registrieren?', a: 'Die Registrierungspflicht von 2026 gilt für mexikanische Nummern. Ausländische Roaming-Anschlüsse waren zunächst ausgenommen.' },
      { q: 'Habe ich an den Cenoten Empfang?', a: 'In Ortsnähe meist ja, an abgelegenen Cenoten oft nicht.' },
      { q: 'Welches Netz ist in Mexiko am besten?', a: 'Telcel hat die größte Abdeckung, vor allem auf dem Land. In den Städten sind alle Netze brauchbar.' },
    ],
  },

  india: {
    angle: 'Geschäftsreise oder Rundreise: die lokale SIM ist billig, aber der Weg dorthin kostet einen halben Tag',
    h1: 'eSIM für Indien',
    title: 'eSIM Indien: online ab der Landung, ohne SIM-Formulare',
    metaDescription: 'Eine indische SIM verlangt Pass, Visum, Foto und eine lokale Adresse, die Aktivierung kann bis zu einem Tag dauern. Ein Reise-eSIM ist bei der Landung aktiv.',
    sectionOrder: ['intro', 'formalitaeten', 'geschaeft', 'rundreise', 'berge', 'grenzen', 'faq'],
    intro: [
      'Nach Indien reisen viele Deutsche beruflich, nach Bangalore, Pune, Chennai oder Mumbai, oder für eine Rundreise durch Rajasthan und Kerala. Beide Gruppen stoßen auf dasselbe: Mobile Daten sind in Indien sehr günstig, aber eine indische SIM zu bekommen ist aufwendig.',
      'Und über die deutsche Auslandsoption ist Indien teuer. Ein Reise-eSIM liegt dazwischen.',
    ],
    sections: {
      formalitaeten: {
        heading: 'Was eine indische SIM verlangt',
        body: [
          'Für eine SIM brauchst du als Ausländer Pass und Visum, ein Passfoto und eine Adresse in Indien, manchmal auch eine lokale Kontaktperson. Die Aktivierung dauert oft einige Stunden, manchmal bis zum nächsten Tag.',
          'Die offiziellen Shops von Jio und Airtel erledigen das routiniert. Wer mehrere Wochen bleibt, sollte den Aufwand in Kauf nehmen.',
        ],
      },
      geschaeft: {
        heading: 'Auf Geschäftsreise',
        body: [
          'Wer am Montagmorgen landet und am Nachmittag Termine hat, verbringt den Tag ungern im Handyladen. Mit einem vorher installierten eSIM funktionieren Fahrdienst, Karten und Teams-Anrufe ab dem Flughafen. Prüf, ob der Tarif Hotspot erlaubt, wenn du den Laptop verbinden willst.',
        ],
      },
      rundreise: {
        heading: 'Rundreise Rajasthan und Kerala',
        body: [
          'Delhi, Agra, Jaipur, Udaipur und Jodhpur sind gut versorgt, ebenso die Küstenorte in Kerala und Goa. In der Wüste um Jaisalmer und in den Backwaters wird das Netz schwächer. Jio und Airtel haben die größte Abdeckung.',
        ],
      },
      berge: {
        heading: 'Himalaya',
        body: [
          'In Ladakh, Spiti und Teilen des Nordostens ist die Abdeckung lückenhaft, und für manche Regionen gelten eigene Regeln für Mobilfunkanschlüsse. Informiere dich für deine Route vorher und plane Offline-Phasen ein.',
        ],
      },
      grenzen: {
        heading: 'Keine indische Nummer',
        body: [
          'Manche indischen Zahlungs- und Buchungsdienste senden Einmalcodes nur an indische Nummern. Das kann ein Daten-eSIM nicht ersetzen.',
          'Wer für Zugtickets oder Zahlungen im Land auf solche Dienste angewiesen ist, fährt mit einer lokalen SIM besser. Für Karten, Fahrdienste, Mails und Videocalls reicht das eSIM.',
        ],
      },
    },
    faq: [
      { q: 'Wie lange dauert es, eine indische SIM zu aktivieren?', a: 'Meist einige Stunden, manchmal bis zu einem Tag, nach Prüfung von Pass, Visum und Adresse.' },
      { q: 'Kann ich mit dem eSIM den Laptop verbinden?', a: 'Nur wenn der Tarif Hotspot erlaubt. Frag vor dem Kauf nach, wenn du unterwegs arbeitest.' },
      { q: 'Funktioniert das in Ladakh?', a: 'Die Abdeckung ist dort in jedem Netz begrenzt. Informiere dich vorab und plane ohne Netz.' },
    ],
  },

  indonesia: {
    angle: 'Indonesien jenseits von Bali: Java, Lombok, Komodo und eine 90-Tage-Regel für lokale SIM-Karten',
    h1: 'eSIM für Indonesien',
    title: 'eSIM Indonesien: Java, Lombok und Komodo statt nur Bali',
    metaDescription: 'Außerhalb Balis schwankt das Netz von Insel zu Insel. Lokale SIM-Karten verlangen nach 90 Tagen eine IMEI-Registrierung. Was ein Reise-eSIM auf Java, Lombok und Flores bringt.',
    sectionOrder: ['intro', 'inseln', 'neunzigtage', 'java', 'flores', 'grenzen', 'faq'],
    intro: [
      'Viele deutsche Indonesienreisen beginnen auf Java, mit Yogyakarta, Borobudur und dem Bromo, und enden auf Bali oder Lombok. Andere fahren nach Flores und in den Komodo-Nationalpark. Indonesien liegt für deutsche Tarife in einer Fernreisezone.',
      'Wer nur auf Bali bleibt, findet auf unserer Bali-Seite die passendere Antwort. Hier geht es um den Rest des Landes.',
    ],
    sections: {
      inseln: {
        heading: 'Welches Netz auf den Inseln trägt',
        body: [
          'Telkomsel hat außerhalb von Java und Bali die weiteste Abdeckung. Indosat Ooredoo Hutchison und XL, heute Teil von XLSmart, sind auf Java und in den Städten stark. Auf einer Inselreise zählt das Netz hinter dem Tarif mehr als die Datenmenge.',
        ],
      },
      neunzigtage: {
        heading: 'Die 90-Tage-Regel für ausländische Handys',
        body: [
          'Indonesien registriert die IMEI ausländischer Handys, die mit indonesischen SIM-Karten genutzt werden. Touristen dürfen eine lokale SIM bis zu 90 Tage ohne Registrierung nutzen, danach wird das Gerät im lokalen Netz gesperrt.',
          'Ein Reise-eSIM läuft als ausländischer Anschluss im Roaming, die lokale IMEI-Registrierung betrifft es nicht. Für einen normalen Urlaub reichen die 90 Tage ohnehin.',
        ],
      },
      java: {
        heading: 'Java über Land',
        body: [
          'Auf der Strecke Yogyakarta, Borobudur, Prambanan und Bromo gibt es entlang der Straßen Netz. Am Bromo-Aussichtspunkt vor Sonnenaufgang und am Ijen-Krater ist der Empfang schwach. Tickets und Karten im Hotel laden.',
        ],
      },
      flores: {
        heading: 'Flores, Komodo und Lombok',
        body: [
          'In Labuan Bajo ist das Netz gut, auf den Bootstouren im Komodo-Nationalpark und zwischen den Gili-Inseln und Lombok gibt es Empfang nahe der Inseln und dazwischen kaum. Auf Tauchbooten ist WLAN selten brauchbar.',
        ],
      },
      grenzen: {
        heading: 'Keine indonesische Nummer',
        body: [
          'Ein Daten-eSIM gibt dir keine Nummer mit +62. Gojek und Grab funktionieren über Daten, manche lokalen Dienste wollen eine indonesische Nummer für SMS-Codes.',
        ],
      },
    },
    faq: [
      { q: 'Muss ich mein Handy in Indonesien registrieren?', a: 'Nur wenn du es länger als 90 Tage mit einer indonesischen SIM nutzt. Ein Reise-eSIM ist davon nicht betroffen.' },
      { q: 'Habe ich auf einer Komodo-Bootstour Empfang?', a: 'In der Nähe der Inseln und in Labuan Bajo oft, auf offener See kaum.' },
      { q: 'Reicht ein Tarif für Java, Bali und Lombok?', a: 'Ja, ein Indonesien-Tarif gilt im ganzen Land. Die Qualität hängt von der Insel ab.' },
    ],
  },
};

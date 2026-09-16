// Kompatibilitaetsseite, deutscher Markt.
//
// Der deutsche Leser kauft sein Geraet haeufiger im Netzbetreibervertrag als
// der englische, und genau daraus entsteht das Problem, das diese Seite loesen
// muss: der SIM Lock. Deshalb steht er hier weiter oben und ausfuehrlicher als
// in der englischen Fassung. Keine Uebersetzung.

export const compatibility = {
  angle: 'Der SIM Lock ist haeufiger das Problem als das Geraet',
  h1: 'Unterstuetzt Ihr Handy eSIM',
  title: 'eSIM Kompatibilitaet: Geraet und SIM Lock pruefen',
  metaDescription:
    'Geraetelisten veralten. Pruefen Sie Ihr eigenes Handy in zehn Sekunden und klaeren Sie vorher den SIM Lock, der bei Vertragsgeraeten haeufig ist.',
  sectionOrder: ['intro', 'pruefen', 'simlock', 'geraete', 'dualsim', 'vorher', 'faq'],
  intro: [
    'Jede Kompatibilitaetsliste im Netz ist ein wenig falsch, auch die von Anbietern, die eSIMs verkaufen. Geraete erscheinen in regionalen Varianten, manche Maerkte bekommen dasselbe Modell ohne eSIM, und Hersteller aendern das zwischen Produktionsserien.',
    'Ihr Geraet kennt die Antwort bereits. Die Abfrage dauert etwa zehn Sekunden und gilt fuer genau Ihr Handy, nicht fuer den Modellnamen auf der Verpackung.',
    'Wichtiger als die Geraetefrage ist im deutschsprachigen Raum allerdings eine zweite: ob Ihr Handy noch an einen Netzbetreiber gebunden ist.',
  ],
  sections: {
    pruefen: {
      heading: 'Die Pruefung in zehn Sekunden',
      body: [
        'Auf dem iPhone: Einstellungen, dann Allgemein, dann Info, und ganz nach unten scrollen. Steht dort Verfuegbare SIM, Digitale SIM oder eine EID Nummer, ist eSIM vorhanden. Keine EID bedeutet kein eSIM, unabhaengig davon, was eine Liste ueber Ihr Modell behauptet.',
        'Auf Android: Einstellungen, dann Netzwerk und Internet, dann SIM Karten. Suchen Sie nach einer Option, eine eSIM hinzuzufuegen oder eine SIM herunterzuladen. Existiert die Option, existiert auch die Hardware.',
        'Die EID ist die Seriennummer des fest verbauten SIM Chips. Ein Geraet ohne Chip hat nichts anzuzeigen, deshalb ist das der verlaesslichste Test.',
      ],
    },
    simlock: {
      heading: 'Der SIM Lock, das eigentliche Hindernis',
      body: [
        'Ein Handy, das mit einem Vertrag gekauft wurde, kann an den Netzbetreiber gebunden sein, auch wenn die eSIM Hardware vorhanden und funktionsfaehig ist. Ein gesperrtes Geraet nimmt nur Profile des eigenen Anbieters an und weist alle anderen ab.',
        'Das ist der mit Abstand haeufigste Grund, warum ein gueltiges Profil sich nicht installieren laesst. Und es ist besonders aergerlich, weil man es meist erst am Flughafen bemerkt.',
        'Nach deutschem Recht muss die Netzsperre nach Ablauf der Vertragsbindung auf Verlangen entfernt werden, bei vielen Anbietern kostenlos. Der Anruf dauert wenige Minuten und sollte vor der Reise stattfinden, nicht waehrend.',
        'Geraete, die frei gekauft wurden, direkt beim Hersteller oder gebraucht von privat, sind in der Regel nicht gesperrt. In der Regel ist nicht immer, also nachfragen statt annehmen.',
      ],
    },
    geraete: {
      heading: 'Geraetefamilien als grobe Orientierung',
      body: [
        'Apple unterstuetzt eSIM seit iPhone XS und XR. In den Vereinigten Staaten verkaufte Modelle ab iPhone 14 haben gar keinen SIM Schacht mehr, in Europa schon. Auch iPads mit Mobilfunk und die Apple Watch mit Datentarif unterstuetzen es.',
        'Google Pixel unterstuetzt es seit dem Pixel 3. Samsung ab der Galaxy S20 Reihe und bei den Fold und Flip Modellen, wobei einige regionale Varianten ohne eSIM ausgeliefert wurden.',
        'Darueber hinaus ist die Unterstuetzung uneinheitlich und haengt vom konkreten Modell und vom Verkaufsmarkt ab. Genau deshalb schlaegt die Pruefung am Geraet jede Liste.',
      ],
    },
    dualsim: {
      heading: 'Was Dual SIM wirklich aendert',
      body: [
        'Eine eSIM ersetzt Ihre normale Karte nicht, ausser Sie wollen das. Ihre deutsche Nummer bleibt auf der physischen SIM aktiv und empfaengt weiterhin Anrufe und SMS, auch die TAN Ihrer Bank. Das Reiseprofil uebernimmt nur die Daten.',
        'Entscheidend ist die Einstellung, welche Leitung fuer mobile Daten verwendet wird. Stellen Sie sie auf das Reiseprofil und schalten Sie beim deutschen Vertrag das Datenroaming aus. Diese Kombination verhindert die unerwartete Rechnung.',
        'Zu beachten ist ausserdem: Sie haben zwei Nummern, aber nur eine davon sieht der Angerufene. Welche Leitung fuer ausgehende Anrufe genutzt wird, ist eine eigene Einstellung und nicht dieselbe wie die fuer Daten.',
      ],
    },
    vorher: {
      heading: 'Drei Dinge vor dem Abflug',
      body: [
        'Pruefung durchfuehren und EID bestaetigen. Beim Anbieter klaeren, ob das Geraet gesperrt ist. Das Reiseprofil installieren, solange Sie noch in einem Netz sind, dem Sie vertrauen.',
        'Die Installation zu Hause statt bei der Ankunft ist wichtiger, als viele denken. Die Installation selbst braucht Internet, und der Moment, in dem Sie das Profil am dringendsten brauchen, ist der Moment ohne Verbindung.',
      ],
    },
  },
  faq: [
    {
      q: 'Woher weiss ich sicher, ob mein Handy eSIM kann?',
      a: 'Suchen Sie die EID Nummer in den Einstellungen. Auf dem iPhone unter Allgemein und dann Info, auf Android meist unter Netzwerk und Internet und dann SIM Karten. Gibt es eine EID, ist die Hardware vorhanden.',
    },
    {
      q: 'Mein Handy kann eSIM, das Profil laesst sich trotzdem nicht installieren.',
      a: 'Meist liegt es am SIM Lock, seltener daran, dass bei der Installation keine Internetverbindung bestand. Ein gesperrtes Geraet weist fremde Profile ab.',
    },
    {
      q: 'Kann ich den SIM Lock entfernen lassen?',
      a: 'Nach Ablauf der Vertragsbindung muss Ihr Anbieter die Sperre auf Verlangen entfernen, bei vielen Anbietern ohne Gebuehr. Klaeren Sie das vor der Reise.',
    },
    {
      q: 'Verliere ich meine deutsche Nummer?',
      a: 'Nein. Das Reiseprofil liegt neben Ihrer normalen SIM. Ihre Nummer bleibt fuer Anrufe und SMS aktiv.',
    },
    {
      q: 'Funktioniert eSIM auf Smartwatch oder Tablet?',
      a: 'Bei Modellen mit Mobilfunk ja. Ein reines WLAN Tablet hat kein Modem und keine EID.',
    },
  ],
};

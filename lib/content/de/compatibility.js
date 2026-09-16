// Kompatibilitätsseite, deutscher Markt.
//
// Der deutsche Leser kauft sein Gerät häufiger im Netzbetreibervertrag als
// der englische, und genau daraus entsteht das Problem, das diese Seite lösen
// muss: der SIM Lock. Deshalb steht er hier weiter oben und ausführlicher als
// in der englischen Fassung. Keine Uebersetzung.

export const compatibility = {
  angle: 'Der SIM Lock ist häufiger das Problem als das Gerät',
  h1: 'Unterstützt Ihr Handy eSIM',
  title: 'eSIM Kompatibilität: Gerät und SIM Lock prüfen',
  metaDescription:
    'Gerätelisten veralten. Prüfen Sie Ihr eigenes Handy in zehn Sekunden und klären Sie vorher den SIM Lock, der bei Vertragsgeräten häufig ist.',
  sectionOrder: ['intro', 'prüfen', 'simlock', 'geräte', 'dualsim', 'vorher', 'faq'],
  intro: [
    'Jede Kompatibilitätsliste im Netz ist ein wenig falsch, auch die von Anbietern, die eSIMs verkaufen. Geräte erscheinen in regionalen Varianten, manche Märkte bekommen dasselbe Modell ohne eSIM, und Hersteller ändern das zwischen Produktionsserien.',
    'Ihr Gerät kennt die Antwort bereits. Die Abfrage dauert etwa zehn Sekunden und gilt für genau Ihr Handy, nicht für den Modellnamen auf der Verpackung.',
    'Wichtiger als die Gerätefrage ist im deutschsprachigen Raum allerdings eine zweite: ob Ihr Handy noch an einen Netzbetreiber gebunden ist.',
  ],
  sections: {
    prüfen: {
      heading: 'Die Prüfung in zehn Sekunden',
      body: [
        'Auf dem iPhone: Einstellungen, dann Allgemein, dann Info, und ganz nach unten scrollen. Steht dort Verfügbare SIM, Digitale SIM oder eine EID Nummer, ist eSIM vorhanden. Keine EID bedeutet kein eSIM, unabhängig davon, was eine Liste über Ihr Modell behauptet.',
        'Auf Android: Einstellungen, dann Netzwerk und Internet, dann SIM Karten. Suchen Sie nach einer Option, eine eSIM hinzuzufügen oder eine SIM herunterzuladen. Existiert die Option, existiert auch die Hardware.',
        'Die EID ist die Seriennummer des fest verbauten SIM Chips. Ein Gerät ohne Chip hat nichts anzuzeigen, deshalb ist das der verlässlichste Test.',
      ],
    },
    simlock: {
      heading: 'Der SIM Lock, das eigentliche Hindernis',
      body: [
        'Ein Handy, das mit einem Vertrag gekauft wurde, kann an den Netzbetreiber gebunden sein, auch wenn die eSIM Hardware vorhanden und funktionsfähig ist. Ein gesperrtes Gerät nimmt nur Profile des eigenen Anbieters an und weist alle anderen ab.',
        'Das ist der mit Abstand häufigste Grund, warum ein gültiges Profil sich nicht installieren lässt. Und es ist besonders ärgerlich, weil man es meist erst am Flughafen bemerkt.',
        'Nach deutschem Recht muss die Netzsperre nach Ablauf der Vertragsbindung auf Verlangen entfernt werden, bei vielen Anbietern kostenlos. Der Anruf dauert wenige Minuten und sollte vor der Reise stattfinden, nicht während.',
        'Geräte, die frei gekauft wurden, direkt beim Hersteller oder gebraucht von privat, sind in der Regel nicht gesperrt. In der Regel ist nicht immer, also nachfragen statt annehmen.',
      ],
    },
    geräte: {
      heading: 'Gerätefamilien als grobe Orientierung',
      body: [
        'Apple unterstützt eSIM seit iPhone XS und XR. In den Vereinigten Staaten verkaufte Modelle ab iPhone 14 haben gar keinen SIM Schacht mehr, in Europa schon. Auch iPads mit Mobilfunk und die Apple Watch mit Datentarif unterstützen es.',
        'Google Pixel unterstützt es seit dem Pixel 3. Samsung ab der Galaxy S20 Reihe und bei den Fold und Flip Modellen, wobei einige regionale Varianten ohne eSIM ausgeliefert wurden.',
        'Darüber hinaus ist die Unterstützung uneinheitlich und hängt vom konkreten Modell und vom Verkaufsmarkt ab. Genau deshalb schlägt die Prüfung am Gerät jede Liste.',
      ],
    },
    dualsim: {
      heading: 'Was Dual SIM wirklich ändert',
      body: [
        'Eine eSIM ersetzt Ihre normale Karte nicht, außer Sie wollen das. Ihre deutsche Nummer bleibt auf der physischen SIM aktiv und empfängt weiterhin Anrufe und SMS, auch die TAN Ihrer Bank. Das Reiseprofil übernimmt nur die Daten.',
        'Entscheidend ist die Einstellung, welche Leitung für mobile Daten verwendet wird. Stellen Sie sie auf das Reiseprofil und schalten Sie beim deutschen Vertrag das Datenroaming aus. Diese Kombination verhindert die unerwartete Rechnung.',
        'Zu beachten ist außerdem: Sie haben zwei Nummern, aber nur eine davon sieht der Angerufene. Welche Leitung für ausgehende Anrufe genutzt wird, ist eine eigene Einstellung und nicht dieselbe wie die für Daten.',
      ],
    },
    vorher: {
      heading: 'Drei Dinge vor dem Abflug',
      body: [
        'Prüfung durchführen und EID bestätigen. Beim Anbieter klären, ob das Gerät gesperrt ist. Das Reiseprofil installieren, solange Sie noch in einem Netz sind, dem Sie vertrauen.',
        'Die Installation zu Hause statt bei der Ankunft ist wichtiger, als viele denken. Die Installation selbst braucht Internet, und der Moment, in dem Sie das Profil am dringendsten brauchen, ist der Moment ohne Verbindung.',
      ],
    },
  },
  faq: [
    {
      q: 'Woher weiß ich sicher, ob mein Handy eSIM kann?',
      a: 'Suchen Sie die EID Nummer in den Einstellungen. Auf dem iPhone unter Allgemein und dann Info, auf Android meist unter Netzwerk und Internet und dann SIM Karten. Gibt es eine EID, ist die Hardware vorhanden.',
    },
    {
      q: 'Mein Handy kann eSIM, das Profil lässt sich trotzdem nicht installieren.',
      a: 'Meist liegt es am SIM Lock, seltener daran, dass bei der Installation keine Internetverbindung bestand. Ein gesperrtes Gerät weist fremde Profile ab.',
    },
    {
      q: 'Kann ich den SIM Lock entfernen lassen?',
      a: 'Nach Ablauf der Vertragsbindung muss Ihr Anbieter die Sperre auf Verlangen entfernen, bei vielen Anbietern ohne Gebühr. Klären Sie das vor der Reise.',
    },
    {
      q: 'Verliere ich meine deutsche Nummer?',
      a: 'Nein. Das Reiseprofil liegt neben Ihrer normalen SIM. Ihre Nummer bleibt für Anrufe und SMS aktiv.',
    },
    {
      q: 'Funktioniert eSIM auf Smartwatch oder Tablet?',
      a: 'Bei Modellen mit Mobilfunk ja. Ein reines WLAN Tablet hat kein Modem und keine EID.',
    },
  ],
};

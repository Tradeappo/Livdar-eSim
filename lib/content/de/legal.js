// Datenschutz und Cookies, deutscher Markt.
//
// Rechtstexte beschreiben denselben Sachverhalt in jedem Markt. Anders als die
// redaktionellen Seiten dürfen sie inhaltlich übereinstimmen, formuliert sind
// sie aber für deutsche Leser und mit den Begriffen, die hier gelten.

export const legal = {
  privacy: {
    angle: 'Was diese Seite heute erhebt, und das ist weniger als üblich',
    h1: 'Datenschutzerklärung',
    title: 'Datenschutzerklärung | Livdar',
    metaDescription:
      'Was Livdar erhebt, warum, wie lange und welche Rechte Sie haben. Geschrieben nach dem, was die Seite tatsächlich tut.',
    sectionOrder: ['intro', 'verantwortlicher', 'daten', 'analyse', 'warteliste', 'zukunft', 'empfänger', 'speicherdauer', 'rechte', 'änderungen', 'faq'],
    intro: [
      'Livdar ist eine Seite für Reisekonnektivität in einer frühen Phase. Es werden keine Tarife verkauft, keine Zahlungen angenommen und es ist kein Anbieter angebunden. Diese Erklärung beschreibt deshalb deutlich weniger Verarbeitung als ein vergleichbarer Shop.',
      'Uns ist eine kurze, zutreffende Erklärung lieber als eine lange, die Dinge beschreibt, die wir nicht tun.',
    ],
    sections: {
      verantwortlicher: {
        heading: 'Verantwortlicher',
        body: [
          'Verantwortlich für die unten beschriebene, sehr begrenzte Verarbeitung ist Livdar MVP. Dazu gehört eine genaue Angabe: Livdar MVP ist ein Projekt in einer frühen Phase und kein eingetragenes Unternehmen. Es gibt keine Handelsregisterangabe, keine Umsatzsteuerangabe und keinen eingetragenen Sitz, weil beides bisher nicht existiert.',
          'Wir schreiben das so, statt diese Felder mit etwas plausibel Klingendem zu füllen. Eine Erklärung, die eine juristische Person suggeriert, wo keine ist, täuscht genau die Person, die sie schützen soll.',
          'Bei Fragen zu dieser Erklärung oder zu Ihren Daten schreiben Sie an livdarlive@gmail.com. Diese Adresse wird von den Menschen gelesen, die das Projekt betreiben.',
          'Sobald Livdar als Unternehmen eingetragen ist, nennt dieser Abschnitt Firma, Eintragung und Sitz, und er wird aktualisiert, bevor auf der Seite irgendetwas verkauft wird.',
        ],
      },
      daten: {
        heading: 'Welche Daten erhoben werden',
        body: [
          'Ein Cookie namens livdar_consent, das ausschließlich Ihre Entscheidung zu Statistik und Marketing speichert. Es enthält keine Kennung, wird erst nach Ihrer Antwort auf den Banner gesetzt und läuft nach 180 Tagen ab. Es ist erforderlich, damit die Seite Ihre Wahl beachten kann, und benötigt deshalb selbst keine Einwilligung.',
          'Messdaten über Google Analytics 4, und nur wenn Sie Statistik erlauben. Dazu gehören aufgerufene Seiten, ein grober Standort aus Ihrer IP Adresse, Geräte und Browsertyp, die Sprache der Seite sowie Aktionen wie eine Suche nach einem Reiseziel.',
          'Serverprotokolle unseres Hosters zu Sicherheit und Verfügbarkeit, die IP Adressen für kurze Zeit enthalten.',
          'Mehr ist es nicht. Es gibt keine Konten, keinen Newsletter, keine Werbepixel und keine Weitergabe an Datenhändler.',
        ],
      },
      analyse: {
        heading: 'Analyse und Consent Mode',
        body: [
          'Die Analyse läuft über den Google Tag Manager, Container GTM-WKGXHXWC, der Google Analytics 4 mit der Property G-DY02HH34DT lädt. Das Google Konto dahinter gehört Livdar und wird mit keinem anderen Projekt geteilt.',
          'Google Consent Mode v2 ist implementiert. Bevor Sie den Banner beantworten, stehen Analyse Speicherung, Werbespeicherung, Werbedaten und Werbepersonalisierung auf abgelehnt, und diese Voreinstellungen werden in die Seite geschrieben, bevor der Container überhaupt geladen wird. Vor Ihrer Entscheidung läuft nichts.',
          'Wenn Sie Statistik akzeptieren, wird die Analyse Speicherung erlaubt und Google Analytics setzt eigene Cookies. Lehnen Sie ab, bleibt sie abgelehnt und es werden keine Analyse Cookies gesetzt.',
          'Microsoft Clarity ist im Code vorbereitet, aber nicht aktiv. Es lädt nur, wenn eine Projekt Kennung hinterlegt ist, und unterliegt dann derselben Einwilligung. Diese Erklärung wird an dem Tag angepasst, an dem das geschieht.',
          'Rechtsgrundlage der Analyse ist Ihre Einwilligung nach Artikel 6 Absatz 1 Buchstabe a der Datenschutz Grundverordnung. Sie können sie jederzeit widerrufen.',
        ],
      },
      warteliste: {
        heading: 'Benachrichtigung und Warteliste',
        body: [
          'Die Oberfläche bietet an, Sie zu informieren, sobald Tarife für ein Reiseziel verfügbar sind. Solange kein Anbieter angebunden ist, ist das ausschließlich ein Interessensignal: der Klick wird als anonymes Analyse Ereignis erfasst, sofern Sie eingewilligt haben, und es werden keine Kontaktdaten erhoben oder gespeichert.',
          'Sobald dafür eine E Mail Adresse erhoben wird, geschieht das auf Grundlage Ihrer ausdrücklichen Einwilligung und ausschließlich für diese eine Benachrichtigung. Dieser Abschnitt wird das sagen, bevor ein Formular erscheint.',
        ],
      },
      zukunft: {
        heading: 'Was sich mit dem Verkaufsstart ändert',
        body: [
          'Sobald ein eSIM Anbieter angebunden ist, müssen die zur Bereitstellung eines Profils nötigen Angaben an diesen Anbieter übermittelt werden. Der Anbieter wird hier benannt, bevor eine Bestellung möglich ist.',
          'Sobald Zahlungen möglich sind, verarbeitet ein Zahlungsdienstleister die Transaktion. Livdar speichert zu keinem Zeitpunkt vollständige Kartendaten. Auch dieser Dienstleister wird hier benannt, bevor der Checkout öffnet.',
          'Beides ist auf dieser Seite heute nicht möglich. Der Checkout ist im Code deaktiviert, und der Build schlägt fehl, wenn jemand versucht, ihn ohne angebundenen Anbieter zu aktivieren.',
        ],
      },
      empfänger: {
        heading: 'Wer die Daten sonst sieht',
        body: [
          'Google als Anbieter von Analytics und Tag Manager, nur für die oben beschriebenen Daten und nur mit Ihrer Einwilligung.',
          'Unser Hosting Anbieter, der die Seiten ausliefert und kurzlebige Serverprotokolle führt.',
          'Sonst niemand. Es sind keine Werbenetzwerke, keine Affiliate Tracker und keine fremden Chat oder Heatmap Werkzeuge eingebunden.',
          'Google kann Daten außerhalb des Europäischen Wirtschaftsraums verarbeiten. Diese Uebermittlungen stützen sich auf den Angemessenheitsbeschluss der Europäischen Kommission für die Vereinigten Staaten und, wo dieser nicht greift, auf Standardvertragsklauseln.',
        ],
      },
      speicherdauer: {
        heading: 'Speicherdauer',
        body: [
          'Das Einwilligungs Cookie: 180 Tage oder bis Sie es löschen.',
          'Analysedaten in Google Analytics: 14 Monate ab Erhebung, danach automatische Löschung durch die Einstellung der Property.',
          'Serverprotokolle: ein kurzer, vom Hoster gesetzter Zeitraum, in Tagen und nicht in Monaten gemessen.',
        ],
      },
      rechte: {
        heading: 'Ihre Rechte',
        body: [
          'Nach der Datenschutz Grundverordnung haben Sie das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und Datenübertragbarkeit. Beruht eine Verarbeitung auf Einwilligung, können Sie diese jederzeit widerrufen, ohne dass die Rechtmäßigkeit der bisherigen Verarbeitung berührt wird.',
          'Da es auf dieser Seite keine Konten gibt, können wir Sie aus den vorhandenen Daten in der Regel nicht identifizieren. Das ist Absicht und keine Ausrede. Wenn Sie ein Recht geltend machen, fragen wir gegebenenfalls nach Angaben, mit denen sich die betreffenden Daten auffinden lassen.',
          'Schreiben Sie an livdarlive@gmail.com. Sind Sie mit unserer Antwort nicht einverstanden, können Sie nach der Datenschutz Grundverordnung Beschwerde bei der Datenschutzbehörde Ihres Wohnsitzes, Ihres Arbeitsorts oder des mutmaßlichen Verstoßes einlegen.',
        ],
      },
      änderungen: {
        heading: 'Aenderungen',
        body: [
          'Diese Erklärung ändert sich, wenn sich die Seite ändert, konkret bei Anbindung eines Anbieters, bei Oeffnung der Zahlungen und bei Aktivierung von Clarity. Jede dieser Aenderungen wird hier abgebildet, bevor sie live geht, nicht danach.',
        ],
      },
    },
    faq: [
      {
        q: 'Wird etwas erhoben, bevor ich den Banner beantworte?',
        a: 'Keine Analyse. Die Consent Mode Voreinstellungen stehen auf abgelehnt, bevor der Tag Manager geladen wird. Das Serverprotokoll erfasst die Anfrage selbst, wie bei jedem Webserver.',
      },
      {
        q: 'Kann ich die Seite nutzen, wenn ich alles ablehne?',
        a: 'Ja, vollständig. Die Ablehnung stoppt nur die Messung. Alle Seiten, die Zielsuche und der Sprachwechsel funktionieren unverändert.',
      },
      {
        q: 'Wie widerrufe ich meine Einwilligung?',
        a: 'Löschen Sie das Cookie livdar_consent in den Browsereinstellungen. Der Banner fragt beim nächsten Besuch erneut.',
      },
      {
        q: 'Verkaufen Sie meine Daten?',
        a: 'Nein. Es gibt keine Werbenetzwerke, keine Datenhändler und keine Affiliate Tracker auf dieser Seite.',
      },
    ],
  },

  cookies: {
    angle: 'Zwei Quellen für Cookies, und eine davon ist freiwillig',
    h1: 'Cookie Richtlinie',
    title: 'Cookie Richtlinie | Livdar',
    metaDescription:
      'Jedes Cookie, das diese Seite setzen kann, wozu es dient und wie lange es gilt. Eines ist notwendig, der Rest nur mit Ihrer Zustimmung.',
    sectionOrder: ['intro', 'notwendig', 'statistik', 'marketing', 'steuerung', 'faq'],
    intro: [
      'Diese Seite listet die Cookies auf, die tatsächlich gesetzt werden können. Sie ist kurz, weil die Seite wenig tut: keine Konten, keine Werbung, keine eingebetteten Fremdinhalte.',
      'Die Gruppierung entspricht genau der des Banners, sodass Ihre Auswahl dort eins zu eins dem entspricht, was hier beschrieben ist.',
    ],
    sections: {
      notwendig: {
        heading: 'Notwendig',
        body: [
          'livdar_consent. Speichert Ihre Antwort auf den Banner, damit die Seite sie beachten und nicht erneut fragen muss. Es enthält zwei Wahrheitswerte, einen für Statistik und einen für Marketing, dazu eine Versionsnummer und einen Zeitstempel. Keine Kennung, nichts, was Sie beschreibt. Laufzeit 180 Tage, gesetzt von Livdar selbst.',
          'Es ist das einzige Cookie, das ohne Ihre Zustimmung gesetzt wird, und es wird gesetzt, weil Sie eine Wahl getroffen haben. Notwendige Cookies bedürfen keiner Einwilligung, denn ohne dieses erschiene der Banner auf jeder Seite erneut.',
        ],
      },
      statistik: {
        heading: 'Statistik, nur mit Ihrer Zustimmung',
        body: [
          'Google Analytics 4, geladen über den Tag Manager, setzt Cookies der Familie _ga. Sie unterscheiden einen Besuch vom nächsten und einen wiederkehrenden Browser von einem neuen, damit wir sehen, wie viele Menschen eine Seite lesen und nicht nur, wie oft sie geladen wurde.',
          'Diese werden erst gesetzt, nachdem Sie Statistik akzeptiert haben. Lehnen Sie ab, bleibt die Analyse Speicherung im Consent Mode abgelehnt und es wird nichts geschrieben.',
          'Microsoft Clarity gehörte ebenfalls in diese Gruppe. Es ist vorbereitet, aber nicht aktiv, und setzt derzeit nichts.',
        ],
      },
      marketing: {
        heading: 'Marketing',
        body: [
          'Derzeit keine. Der Banner bietet die Wahl an, weil der Einwilligungsrahmen und der Container bereits dafür gebaut sind, und weil es die falsche Reihenfolge wäre, Werbung später ohne Nachfrage zu aktivieren.',
          'Solange hier keine stehen, hat eine Zustimmung zu Marketing keine praktische Wirkung außer der Speicherung Ihrer Präferenz. Aendert sich das, ändert sich diese Seite mit.',
        ],
      },
      steuerung: {
        heading: 'Wie Sie das steuern',
        body: [
          'Ueber den Banner. Alle akzeptieren, Ablehnen, oder Einstellungen, wenn Sie Statistik und Marketing getrennt wählen wollen.',
          'Um Ihre Wahl später zu ändern, löschen Sie das Cookie livdar_consent in den Browsereinstellungen und laden die Seite neu.',
          'Jeder größere Browser erlaubt außerdem, Cookies vollständig zu blockieren. Die Seite funktioniert auch dann, sie fragt nur bei jedem Besuch erneut.',
        ],
      },
    },
    faq: [
      {
        q: 'Wie viele Cookies setzt Livdar selbst?',
        a: 'Eines, livdar_consent, und erst nachdem Sie den Banner beantwortet haben.',
      },
      {
        q: 'Was passiert bei Ablehnen?',
        a: 'Es werden keine Analyse Cookies geschrieben und der Consent Mode bleibt abgelehnt. Gespeichert wird nur das Einwilligungs Cookie selbst.',
      },
      {
        q: 'Gibt es Werbecookies?',
        a: 'Derzeit keine. Die Kategorie existiert, weil der Rahmen sie unterstützt, nicht weil etwas sie nutzt.',
      },
      {
        q: 'Nutzen Sie Cookies für einen Warenkorb?',
        a: 'Es gibt noch keinen Warenkorb. Wenn der Checkout gebaut wird, steht hier vorher, was er benötigt.',
      },
    ],
  },
};

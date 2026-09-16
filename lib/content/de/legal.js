// Datenschutz und Cookies, deutscher Markt.
//
// Rechtstexte beschreiben denselben Sachverhalt in jedem Markt. Anders als die
// redaktionellen Seiten duerfen sie inhaltlich uebereinstimmen, formuliert sind
// sie aber fuer deutsche Leser und mit den Begriffen, die hier gelten.

export const legal = {
  privacy: {
    angle: 'Was diese Seite heute erhebt, und das ist weniger als ueblich',
    h1: 'Datenschutzerklaerung',
    title: 'Datenschutzerklaerung | Livdar',
    metaDescription:
      'Was Livdar erhebt, warum, wie lange und welche Rechte Sie haben. Geschrieben nach dem, was die Seite tatsaechlich tut.',
    sectionOrder: ['intro', 'verantwortlicher', 'daten', 'analyse', 'warteliste', 'zukunft', 'empfaenger', 'speicherdauer', 'rechte', 'aenderungen', 'faq'],
    intro: [
      'Livdar ist eine Seite fuer Reisekonnektivitaet in einer fruehen Phase. Es werden keine Tarife verkauft, keine Zahlungen angenommen und es ist kein Anbieter angebunden. Diese Erklaerung beschreibt deshalb deutlich weniger Verarbeitung als ein vergleichbarer Shop.',
      'Uns ist eine kurze, zutreffende Erklaerung lieber als eine lange, die Dinge beschreibt, die wir nicht tun.',
    ],
    sections: {
      verantwortlicher: {
        heading: 'Verantwortlicher',
        body: [
          'Verantwortlich fuer die unten beschriebene, sehr begrenzte Verarbeitung ist Livdar MVP. Dazu gehoert eine genaue Angabe: Livdar MVP ist ein Projekt in einer fruehen Phase und kein eingetragenes Unternehmen. Es gibt keine Handelsregisterangabe, keine Umsatzsteuerangabe und keinen eingetragenen Sitz, weil beides bisher nicht existiert.',
          'Wir schreiben das so, statt diese Felder mit etwas plausibel Klingendem zu fuellen. Eine Erklaerung, die eine juristische Person suggeriert, wo keine ist, taeuscht genau die Person, die sie schuetzen soll.',
          'Bei Fragen zu dieser Erklaerung oder zu Ihren Daten schreiben Sie an livdarlive@gmail.com. Diese Adresse wird von den Menschen gelesen, die das Projekt betreiben.',
          'Sobald Livdar als Unternehmen eingetragen ist, nennt dieser Abschnitt Firma, Eintragung und Sitz, und er wird aktualisiert, bevor auf der Seite irgendetwas verkauft wird.',
        ],
      },
      daten: {
        heading: 'Welche Daten erhoben werden',
        body: [
          'Ein Cookie namens livdar_consent, das ausschliesslich Ihre Entscheidung zu Statistik und Marketing speichert. Es enthaelt keine Kennung, wird erst nach Ihrer Antwort auf den Banner gesetzt und laeuft nach 180 Tagen ab. Es ist erforderlich, damit die Seite Ihre Wahl beachten kann, und benoetigt deshalb selbst keine Einwilligung.',
          'Messdaten ueber Google Analytics 4, und nur wenn Sie Statistik erlauben. Dazu gehoeren aufgerufene Seiten, ein grober Standort aus Ihrer IP Adresse, Geraete und Browsertyp, die Sprache der Seite sowie Aktionen wie eine Suche nach einem Reiseziel.',
          'Serverprotokolle unseres Hosters zu Sicherheit und Verfuegbarkeit, die IP Adressen fuer kurze Zeit enthalten.',
          'Mehr ist es nicht. Es gibt keine Konten, keinen Newsletter, keine Werbepixel und keine Weitergabe an Datenhaendler.',
        ],
      },
      analyse: {
        heading: 'Analyse und Consent Mode',
        body: [
          'Die Analyse laeuft ueber den Google Tag Manager, Container GTM-WKGXHXWC, der Google Analytics 4 mit der Property G-DY02HH34DT laedt. Das Google Konto dahinter gehoert Livdar und wird mit keinem anderen Projekt geteilt.',
          'Google Consent Mode v2 ist implementiert. Bevor Sie den Banner beantworten, stehen Analyse Speicherung, Werbespeicherung, Werbedaten und Werbepersonalisierung auf abgelehnt, und diese Voreinstellungen werden in die Seite geschrieben, bevor der Container ueberhaupt geladen wird. Vor Ihrer Entscheidung laeuft nichts.',
          'Wenn Sie Statistik akzeptieren, wird die Analyse Speicherung erlaubt und Google Analytics setzt eigene Cookies. Lehnen Sie ab, bleibt sie abgelehnt und es werden keine Analyse Cookies gesetzt.',
          'Microsoft Clarity ist im Code vorbereitet, aber nicht aktiv. Es laedt nur, wenn eine Projekt Kennung hinterlegt ist, und unterliegt dann derselben Einwilligung. Diese Erklaerung wird an dem Tag angepasst, an dem das geschieht.',
          'Rechtsgrundlage der Analyse ist Ihre Einwilligung nach Artikel 6 Absatz 1 Buchstabe a der Datenschutz Grundverordnung. Sie koennen sie jederzeit widerrufen.',
        ],
      },
      warteliste: {
        heading: 'Benachrichtigung und Warteliste',
        body: [
          'Die Oberflaeche bietet an, Sie zu informieren, sobald Tarife fuer ein Reiseziel verfuegbar sind. Solange kein Anbieter angebunden ist, ist das ausschliesslich ein Interessensignal: der Klick wird als anonymes Analyse Ereignis erfasst, sofern Sie eingewilligt haben, und es werden keine Kontaktdaten erhoben oder gespeichert.',
          'Sobald dafuer eine E Mail Adresse erhoben wird, geschieht das auf Grundlage Ihrer ausdruecklichen Einwilligung und ausschliesslich fuer diese eine Benachrichtigung. Dieser Abschnitt wird das sagen, bevor ein Formular erscheint.',
        ],
      },
      zukunft: {
        heading: 'Was sich mit dem Verkaufsstart aendert',
        body: [
          'Sobald ein eSIM Anbieter angebunden ist, muessen die zur Bereitstellung eines Profils noetigen Angaben an diesen Anbieter uebermittelt werden. Der Anbieter wird hier benannt, bevor eine Bestellung moeglich ist.',
          'Sobald Zahlungen moeglich sind, verarbeitet ein Zahlungsdienstleister die Transaktion. Livdar speichert zu keinem Zeitpunkt vollstaendige Kartendaten. Auch dieser Dienstleister wird hier benannt, bevor der Checkout oeffnet.',
          'Beides ist auf dieser Seite heute nicht moeglich. Der Checkout ist im Code deaktiviert, und der Build schlaegt fehl, wenn jemand versucht, ihn ohne angebundenen Anbieter zu aktivieren.',
        ],
      },
      empfaenger: {
        heading: 'Wer die Daten sonst sieht',
        body: [
          'Google als Anbieter von Analytics und Tag Manager, nur fuer die oben beschriebenen Daten und nur mit Ihrer Einwilligung.',
          'Unser Hosting Anbieter, der die Seiten ausliefert und kurzlebige Serverprotokolle fuehrt.',
          'Sonst niemand. Es sind keine Werbenetzwerke, keine Affiliate Tracker und keine fremden Chat oder Heatmap Werkzeuge eingebunden.',
          'Google kann Daten ausserhalb des Europaeischen Wirtschaftsraums verarbeiten. Diese Uebermittlungen stuetzen sich auf den Angemessenheitsbeschluss der Europaeischen Kommission fuer die Vereinigten Staaten und, wo dieser nicht greift, auf Standardvertragsklauseln.',
        ],
      },
      speicherdauer: {
        heading: 'Speicherdauer',
        body: [
          'Das Einwilligungs Cookie: 180 Tage oder bis Sie es loeschen.',
          'Analysedaten in Google Analytics: 14 Monate ab Erhebung, danach automatische Loeschung durch die Einstellung der Property.',
          'Serverprotokolle: ein kurzer, vom Hoster gesetzter Zeitraum, in Tagen und nicht in Monaten gemessen.',
        ],
      },
      rechte: {
        heading: 'Ihre Rechte',
        body: [
          'Nach der Datenschutz Grundverordnung haben Sie das Recht auf Auskunft, Berichtigung, Loeschung, Einschraenkung der Verarbeitung, Widerspruch und Datenuebertragbarkeit. Beruht eine Verarbeitung auf Einwilligung, koennen Sie diese jederzeit widerrufen, ohne dass die Rechtmaessigkeit der bisherigen Verarbeitung beruehrt wird.',
          'Da es auf dieser Seite keine Konten gibt, koennen wir Sie aus den vorhandenen Daten in der Regel nicht identifizieren. Das ist Absicht und keine Ausrede. Wenn Sie ein Recht geltend machen, fragen wir gegebenenfalls nach Angaben, mit denen sich die betreffenden Daten auffinden lassen.',
          'Schreiben Sie an livdarlive@gmail.com. Sind Sie mit unserer Antwort nicht einverstanden, koennen Sie nach der Datenschutz Grundverordnung Beschwerde bei der Datenschutzbehoerde Ihres Wohnsitzes, Ihres Arbeitsorts oder des mutmasslichen Verstosses einlegen.',
        ],
      },
      aenderungen: {
        heading: 'Aenderungen',
        body: [
          'Diese Erklaerung aendert sich, wenn sich die Seite aendert, konkret bei Anbindung eines Anbieters, bei Oeffnung der Zahlungen und bei Aktivierung von Clarity. Jede dieser Aenderungen wird hier abgebildet, bevor sie live geht, nicht danach.',
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
        a: 'Ja, vollstaendig. Die Ablehnung stoppt nur die Messung. Alle Seiten, die Zielsuche und der Sprachwechsel funktionieren unveraendert.',
      },
      {
        q: 'Wie widerrufe ich meine Einwilligung?',
        a: 'Loeschen Sie das Cookie livdar_consent in den Browsereinstellungen. Der Banner fragt beim naechsten Besuch erneut.',
      },
      {
        q: 'Verkaufen Sie meine Daten?',
        a: 'Nein. Es gibt keine Werbenetzwerke, keine Datenhaendler und keine Affiliate Tracker auf dieser Seite.',
      },
    ],
  },

  cookies: {
    angle: 'Zwei Quellen fuer Cookies, und eine davon ist freiwillig',
    h1: 'Cookie Richtlinie',
    title: 'Cookie Richtlinie | Livdar',
    metaDescription:
      'Jedes Cookie, das diese Seite setzen kann, wozu es dient und wie lange es gilt. Eines ist notwendig, der Rest nur mit Ihrer Zustimmung.',
    sectionOrder: ['intro', 'notwendig', 'statistik', 'marketing', 'steuerung', 'faq'],
    intro: [
      'Diese Seite listet die Cookies auf, die tatsaechlich gesetzt werden koennen. Sie ist kurz, weil die Seite wenig tut: keine Konten, keine Werbung, keine eingebetteten Fremdinhalte.',
      'Die Gruppierung entspricht genau der des Banners, sodass Ihre Auswahl dort eins zu eins dem entspricht, was hier beschrieben ist.',
    ],
    sections: {
      notwendig: {
        heading: 'Notwendig',
        body: [
          'livdar_consent. Speichert Ihre Antwort auf den Banner, damit die Seite sie beachten und nicht erneut fragen muss. Es enthaelt zwei Wahrheitswerte, einen fuer Statistik und einen fuer Marketing, dazu eine Versionsnummer und einen Zeitstempel. Keine Kennung, nichts, was Sie beschreibt. Laufzeit 180 Tage, gesetzt von Livdar selbst.',
          'Es ist das einzige Cookie, das ohne Ihre Zustimmung gesetzt wird, und es wird gesetzt, weil Sie eine Wahl getroffen haben. Notwendige Cookies beduerfen keiner Einwilligung, denn ohne dieses erschiene der Banner auf jeder Seite erneut.',
        ],
      },
      statistik: {
        heading: 'Statistik, nur mit Ihrer Zustimmung',
        body: [
          'Google Analytics 4, geladen ueber den Tag Manager, setzt Cookies der Familie _ga. Sie unterscheiden einen Besuch vom naechsten und einen wiederkehrenden Browser von einem neuen, damit wir sehen, wie viele Menschen eine Seite lesen und nicht nur, wie oft sie geladen wurde.',
          'Diese werden erst gesetzt, nachdem Sie Statistik akzeptiert haben. Lehnen Sie ab, bleibt die Analyse Speicherung im Consent Mode abgelehnt und es wird nichts geschrieben.',
          'Microsoft Clarity gehoerte ebenfalls in diese Gruppe. Es ist vorbereitet, aber nicht aktiv, und setzt derzeit nichts.',
        ],
      },
      marketing: {
        heading: 'Marketing',
        body: [
          'Derzeit keine. Der Banner bietet die Wahl an, weil der Einwilligungsrahmen und der Container bereits dafuer gebaut sind, und weil es die falsche Reihenfolge waere, Werbung spaeter ohne Nachfrage zu aktivieren.',
          'Solange hier keine stehen, hat eine Zustimmung zu Marketing keine praktische Wirkung ausser der Speicherung Ihrer Praeferenz. Aendert sich das, aendert sich diese Seite mit.',
        ],
      },
      steuerung: {
        heading: 'Wie Sie das steuern',
        body: [
          'Ueber den Banner. Alle akzeptieren, Ablehnen, oder Einstellungen, wenn Sie Statistik und Marketing getrennt waehlen wollen.',
          'Um Ihre Wahl spaeter zu aendern, loeschen Sie das Cookie livdar_consent in den Browsereinstellungen und laden die Seite neu.',
          'Jeder groessere Browser erlaubt ausserdem, Cookies vollstaendig zu blockieren. Die Seite funktioniert auch dann, sie fragt nur bei jedem Besuch erneut.',
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
        a: 'Derzeit keine. Die Kategorie existiert, weil der Rahmen sie unterstuetzt, nicht weil etwas sie nutzt.',
      },
      {
        q: 'Nutzen Sie Cookies fuer einen Warenkorb?',
        a: 'Es gibt noch keinen Warenkorb. Wenn der Checkout gebaut wird, steht hier vorher, was er benoetigt.',
      },
    ],
  },
};

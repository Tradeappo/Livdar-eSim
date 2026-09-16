export const guides = {
  'how-esim-works': {
    cluster: 'setup',
    h1: 'Wie ein eSIM funktioniert',
    title: 'eSIM erklärt: was sich ändert und was nicht',
    metaDescription: 'Ein eSIM ist eine SIM-Karte, die ins Handy geschrieben statt hineingesteckt wird. Was das praktisch bedeutet und welcher Fehler am häufigsten passiert.',
    intro: [
      'Eine SIM-Karte ist ein kleiner sicherer Chip, der einem Mobilfunknetz beweist, dass du dort sein darfst. Ein eSIM ist dasselbe ohne Plastik: der Chip steckt schon im Gerät, und ein Netzprofil wird darauf geschrieben.',
      'Alles andere am Mobilfunk bleibt gleich. Gleiche Funkzellen, gleiche Netze, gleiche Geschwindigkeit. Anders ist nur, wie das Profil auf das Handy kommt, und genau dort liegen die praktischen Unterschiede.',
    ],
    sections: {
      unterschied: {
        heading: 'Was sich wirklich ändert',
        body: [
          'Du kannst ein Profil von überall installieren, wo Internet ist. Das heißt, du bist in einem fremden Netz, bevor du dein eigenes Land verlässt.',
          'Du kannst mehrere Profile gleichzeitig halten und umschalten. Deshalb ist Dual-SIM auf einem eSIM-Gerät nützlicher, als es mit zwei Kartenschächten je war.',
          'Du kannst das Profil nicht herausnehmen und in ein anderes Handy stecken. Das ist der Preis.',
        ],
      },
      fehler: {
        heading: 'Der Fehler, der fast allen passiert',
        body: [
          'Die Installation eines eSIM braucht Internet. Die Aktivierung nicht.',
          'Das klingt selbstverständlich, bis du in einer Ankunftshalle ohne Daten stehst und einen QR-Code scannen willst, der in einer E-Mail liegt, die du nicht öffnen kannst. Zu Hause im WLAN installieren, Leitung ausgeschaltet lassen, nach der Landung einschalten.',
        ],
      },
      leitungen: {
        heading: 'Profile, Leitungen und wie dein Handy sie nennt',
        body: [
          'Jeder Hersteller nennt dasselbe anders. Apple spricht von Mobilfunktarifen mit Bezeichnung, Android meist einfach von SIMs. Gemeint ist immer dasselbe: ein gespeichertes Profil, das du an- und ausschalten und dem du Aufgaben zuweisen kannst.',
          'Wichtig sind drei Aufgaben: welche Leitung telefoniert, welche schreibt SMS und welche trägt die mobilen Daten. Auf Reisen willst du meistens Anrufe auf der deutschen Nummer und Daten auf dem Reiseprofil.',
        ],
      },
    },
    faq: [
      { q: 'Kann ich ein eSIM löschen und später neu installieren?', a: 'Meistens nicht. Die meisten Reiseprofile lassen sich nur einmal installieren. Ausschalten statt löschen.' },
      { q: 'Verbraucht ein eSIM mehr Akku?', a: 'Zwei aktive Leitungen etwas mehr, weil das Gerät zwei Registrierungen hält. Die ungenutzte Leitung ausschalten löst das.' },
      { q: 'Funktioniert das auch im Tablet oder in der Uhr?', a: 'Wenn das Gerät ein eSIM hat und der Tarif es erlaubt. Viele Reisetarife sind nur für Telefone geschrieben.' },
    ],
  },

  'install-esim': {
    cluster: 'setup',
    h1: 'eSIM installieren und aktivieren',
    title: 'eSIM richtig einrichten: die Reihenfolge, die funktioniert',
    metaDescription: 'Zu Hause im WLAN installieren, Leitung aus lassen, nach der Landung einschalten. Die komplette Reihenfolge inklusive der Einstellung, die alle vergessen.',
    intro: [
      'Die Reihenfolge ist wichtiger als die Schritte. Fast jedes eSIM-Problem auf Reisen ist dasselbe Problem: installiert wurde in dem Moment, in dem man es brauchte, also in dem Moment ohne Internet.',
    ],
    sections: {
      vorher: {
        heading: 'Zu Hause im WLAN',
        body: [
          'Profil installieren. Gib ihm einen Namen, den du später wiedererkennst, zum Beispiel das Reiseziel statt der Voreinstellung.',
          'Leitung ausgeschaltet lassen. Die Laufzeit eines Reisetarifs beginnt üblicherweise bei der ersten Verbindung, nicht beim Kauf. Das ist aber eine Tarifregel und gehört nachgelesen.',
        ],
      },
      ankunft: {
        heading: 'Nach der Landung',
        body: [
          'Reiseleitung einschalten. Mobile Daten darauf legen. Datenroaming für diese Leitung aktivieren, denn ein Reiseprofil roamt technisch, auch wenn es sich lokal anfühlt.',
          'Dann Datenroaming auf der deutschen Leitung ausschalten. Diesen Schritt überspringen viele, und genau er erzeugt die überraschende Rechnung.',
        ],
      },
      problem: {
        heading: 'Wenn keine Verbindung kommt',
        body: [
          'Zwei bis drei Minuten warten. Die Registrierung in einem fremden Netz ist nicht sofort.',
          'Flugmodus einmal an und aus. Dann prüfen, ob die mobilen Daten wirklich auf der richtigen Leitung liegen. Das ist der häufigste Fehler.',
          'Wenn immer noch nichts kommt, prüfen, ob der Tarif einen APN von Hand verlangt. Die meisten nicht. Manche schon, und dann steht es beim Anbieter.',
        ],
      },
      einmalig: {
        heading: 'Das Profil ist ein Einwegvorgang',
        body: [
          'Hinter jedem QR-Code steht ein Aktivierungscode, den der Server genau einmal ausgibt. Sobald das Profil auf deinem Telefon liegt, ist dieser Code bei den meisten Anbietern verbraucht, und das Profil hängt damit an genau diesem Gerät.',
          'Drei Handgriffe zerstören es. Die Leitung in den Einstellungen entfernen. Das Gerät auf Werkseinstellungen zurücksetzen, weil dabei alle gespeicherten Profile mitgehen. Und der Versuch, denselben Code auf einem zweiten Telefon zu scannen, etwa weil das erste gerade keine Verbindung bekommt.',
          'Halte dich deshalb an eine einzige Regel: ausschalten, nie entfernen. Eine ausgeschaltete Leitung verbraucht nichts, stört nichts und steht in zwei Sekunden wieder bereit. Das gilt auch für die Wochen nach der Reise, in denen du im Menü aufräumst.',
          'Wenn du das Gerät wirklich zurücksetzen oder tauschen musst, frag vorher beim Anbieter, ob er dir das Profil neu ausstellt. Manche tun das einmal aus Kulanz. Nach dem Löschen führst du dasselbe Gespräch aus einer deutlich schlechteren Position.',
        ],
      },
    },
    faq: [
      { q: 'Wann beginnt die Laufzeit?', a: 'Normalerweise bei der ersten Netzverbindung, nicht beim Kauf. Nachlesen lohnt, weil einige Tarife beim Kauf starten.' },
      { q: 'Kann ich im Flugzeug installieren?', a: 'Nur mit funktionierendem Bord-WLAN. Geh davon aus, dass es nicht klappt.' },
      { q: 'Was, wenn ich es aus Versehen lösche?', a: 'Die meisten Reiseprofile lassen sich nicht neu installieren. Löschen ist endgültig.' },
    ],
  },

  'esim-vs-roaming': {
    cluster: 'comparison',
    h1: 'eSIM oder Roaming',
    title: 'eSIM oder Roaming: die Rechnung, die es entscheidet',
    metaDescription: 'In der EU ist Roaming enthalten. Außerhalb entscheidet eine Rechnung, die zwei Minuten dauert. So geht sie.',
    intro: [
      'Für deutsche Tarife ist die Antwort in der EU fast immer Roaming, weil es nichts kostet. Außerhalb der EU ist sie fast immer das Gegenteil.',
      'Dazwischen liegen ein paar Länder, bei denen es sich lohnt, genau hinzusehen.',
    ],
    sections: {
      eu: {
        heading: 'Innerhalb der EU brauchst du nichts',
        body: [
          'In der EU und im erweiterten EWR-Roamingraum nimmst du dein Inlandsvolumen mit, unter den Bedingungen der angemessenen Nutzung in deinem Vertrag.',
          'Für Spanien, Italien, Griechenland oder Kroatien ist ein Reise-eSIM in der Regel überflüssig. Das schreiben wir auch auf die jeweiligen Länderseiten.',
        ],
      },
      laenderliste: {
        heading: 'Die Länderliste deines Tarifs ist die eigentliche Antwort',
        body: [
          'Die gesetzliche Regelung deckt die EU-Staaten ab, dazu Norwegen, Island und Liechtenstein. Alles darüber hinaus ist eine freiwillige Entscheidung deines Anbieters, und die fällt bei jedem anders aus.',
          'Deshalb bringt dich kein allgemeiner Text ans Ziel, dieser eingeschlossen. Was zählt, ist die Länderübersicht zu deinem eigenen Tarif. Sie steht in der Preisliste für Auslandsverbindungen, nicht auf der Werbeseite, über die du den Vertrag abgeschlossen hast. Anbieter sortieren Länder in Zonen mit eigenen Namen, und aus einem Zonennamen kannst du nicht ableiten, was darin liegt.',
          'Geh die Länder deiner Route in dieser Übersicht durch. Liegen sie alle in der inklusiven Zone, ist das Thema für dich erledigt. Liegt auch nur eines in einer bezahlten Zone, hast du eine Lücke, und erst ab hier lohnt sich das Weiterrechnen.',
        ],
      },
      außerhalb: {
        heading: 'Außerhalb wird es schnell teuer',
        body: [
          'Die Türkei, die Schweiz, Großbritannien bei manchen Anbietern, die Golfregion, Asien und Nordamerika sind alle Zusatzoptionsziele.',
          'Nimm den Tagespreis oder das Auslandspaket aus deinem Tarif, multipliziere mit den Reisetagen und vergleiche. Bei kurzen Städtetrips ist der Unterschied oft klein. Bei zwei Wochen fast nie.',
        ],
      },
      fairuse: {
        heading: 'Die Regel zur angemessenen Nutzung',
        body: [
          'Inklusives Roaming ist für Reisen gedacht, nicht dafür, dauerhaft im Ausland mit einem deutschen Tarif zu leben. Anbieter dürfen das Nutzungsverhalten über Monate beobachten und dann einen Nachweis der Inlandsbindung verlangen, einen Aufschlag berechnen oder den Dienst begrenzen.',
          'Die Bedingungen unterscheiden sich je Anbieter. Das gehört in den eigenen Vertrag nachgelesen und nicht verallgemeinert.',
        ],
      },
    },
    faq: [
      { q: 'Ist Roaming immer teurer?', a: 'Nein. In der EU ist es enthalten, und manche Tarife schließen deutlich mehr Länder ein, als die Leute denken. Erst nachsehen.' },
      { q: 'Kann ich beides nutzen?', a: 'Ja, und das ist meist die beste Einrichtung: deutsche Nummer für Anrufe und SMS, Reise-eSIM für Daten, Datenroaming auf der deutschen Leitung aus.' },
      { q: 'Was ist mit eingehenden Anrufen?', a: 'Die kommen wie gewohnt auf deiner deutschen Nummer an. In der EU ist das Annehmen enthalten, außerhalb nicht automatisch.' },
    ],
  },

  'esim-vs-physical-sim': {
    cluster: 'comparison',
    h1: 'eSIM oder lokale SIM-Karte',
    title: 'eSIM oder lokale SIM: der ehrliche Vergleich',
    metaDescription: 'Eine lokale SIM ist billiger pro Gigabyte und gibt eine lokale Nummer. Ein Reise-eSIM kostet keine Zeit. Was mehr zählt, hängt von der Reise ab.',
    intro: [
      'Die beiden Produkte lösen verschiedene Probleme, und das Marketing auf beiden Seiten tut so, als wäre es dasselbe.',
      'Eine lokale SIM ist ein Vertrag im Reiseland. Ein Reise-eSIM ist eine Roaming-Vereinbarung, die praktisch verpackt ist. Aus diesem Unterschied folgt alles andere.',
    ],
    sections: {
      lokal: {
        heading: 'Was eine lokale SIM bringt',
        body: [
          'Eine lokale Nummer, und die zählt mehr, als die meisten erwarten. Fahrdienste, Lieferung, Restaurantbuchungen, Paketstationen und Bankbestätigungen laufen in vielen Ländern über eine inländische Nummer.',
          'Mehr Datenvolumen für dasselbe Geld, meist deutlich mehr.',
          'Sie kostet dich einen Schalter, einen Pass, manchmal eine Registrierungspflicht und die erste Stunde deiner Reise.',
        ],
      },
      reise: {
        heading: 'Was ein Reise-eSIM bringt',
        body: [
          'Online sein in der Sekunde der Landung, ohne Schlange und ohne Dokument.',
          'Ein Tarif über mehrere Länder. Genau dort gewinnt es klar: drei Länder auf einem Profil statt drei lokaler Karten.',
          'Keine lokale Nummer, dafür in einigen Ländern keine Registrierungspflicht, weil du dort kein Vertragskunde bist.',
        ],
      },
      plastik: {
        heading: 'Wo die Plastikkarte weiterhin gewinnt',
        body: [
          'Eine Karte kannst du herausnehmen. Das klingt banal, bis das Telefon am zweiten Tag ins Wasser fällt oder aus einer Jackentasche verschwindet. Die Karte wandert in ein Ersatzgerät oder in ein geliehenes Handy und die Leitung läuft weiter. Ein digitales Profil bleibt in dem Gerät, das gerade weg ist.',
          'Sie stellt außerdem keine Bedingungen an die Hardware. Ältere Modelle, günstige Zweitgeräte und ein Teil der über Netzbetreiber verkauften Telefone können entweder gar kein eSIM oder haben die Funktion gesperrt. Kläre das vor dem Kauf eines Tarifs, nicht danach, und kläre beides: kann das Gerät es, und darf es fremde Profile annehmen.',
          'Und in manchen Ländern gibt es für Besucher schlicht keine digitale Variante zu kaufen. Wo der örtliche Anbieter Prepaid nur als Karte über den Tresen verkauft, ist der Tresen der einzige Weg, und daran ändert die beste eSIM-Unterstützung deines Handys nichts.',
        ],
      },
      wahl: {
        heading: 'Entscheiden ohne lange zu überlegen',
        body: [
          'Länger als zwei Wochen in einem Land und du willst eine lokale Nummer: lokal kaufen.',
          'Mehrere Länder, späte Ankunft oder Kurzreise: Reise-eSIM.',
          'Du brauchst Bestätigungscodes auf einer lokalen Nummer: keines von beiden. Dann brauchst du eine richtige lokale Leitung.',
        ],
      },
    },
    faq: [
      { q: 'Kann ich beides haben?', a: 'Ja. Viele fahren die deutsche Nummer für Identität, ein Reise-eSIM für die ersten Tage und kaufen lokal nach, wenn es länger wird.' },
      { q: 'Braucht jede lokale SIM eine Registrierung?', a: 'Nicht jede, aber jedes Jahr mehr. Indonesien, die Türkei und weite Teile des Golfs verlangen sie.' },
      { q: 'Was ist schneller?', a: 'Systematisch keines von beiden. Geschwindigkeit ist das Netz, und beide landen auf denselben Masten.' },
    ],
  },
};

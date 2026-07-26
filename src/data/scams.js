// ---------------------------------------------------------------------------
// Scam-Szenarien
// ---------------------------------------------------------------------------
// Zu jeder betrugsnahen Bedrohung ein realistisch formuliertes Beispiel. Der
// Zweck ist Wiedererkennung: Eine abstrakte Warnung ("Vorsicht vor Phishing")
// verändert nachweislich wenig, ein konkreter Text, den man später wiedererkennt,
// deutlich mehr.
//
// Die Beispiele sind bewusst gut gemacht. Ein offensichtlich schlechter
// Beispieltext erzeugt genau die falsche Sicherheit ("so plump falle ich nie
// darauf rein") — echte Angriffe sehen heute so aus wie diese hier.
// ---------------------------------------------------------------------------

export const SCAMS = {
  'phishing-credentials': {
    channel: 'E-Mail',
    from: 'service@paypal-sicherheit-de.com',
    subject: 'Ungewöhnliche Aktivität — Ihr Konto wurde vorübergehend eingeschränkt',
    body: `Guten Tag,

wir haben eine Anmeldung aus einem uns unbekannten Netzwerk festgestellt
(Warschau, PL — 03:14 Uhr).

Zu Ihrer Sicherheit haben wir Ihr Konto vorübergehend eingeschränkt.
Bitte bestätigen Sie innerhalb von 24 Stunden Ihre Identität, andernfalls
wird das Konto dauerhaft gesperrt.

    → Identität jetzt bestätigen

Mit freundlichen Grüßen
Ihr Sicherheitsteam`,
    hook: (p) =>
      p.clicksLinks
        ? 'Du hast angegeben, dass du Links öffnest, wenn die Nachricht gerade plausibel wirkt. Genau darauf ist diese Mail gebaut: Sie behauptet nichts, was du prüfen könntest, sondern erzeugt Sorge und eine Frist.'
        : 'Die Mail kommt nicht zufällig — sie kommt zu hunderttausenden. Sie funktioniert bei dem kleinen Anteil, der gerade abgelenkt oder in Eile ist.',
    redFlags: [
      'Die Absenderdomain ist nicht paypal.de, sondern eine ähnlich aussehende Fremddomain.',
      'Zeitdruck mit konkreter Frist — das Standardwerkzeug, um Nachdenken zu verhindern.',
      'Eine angebliche Einschränkung, die du in der echten App nirgends bestätigt findest.',
      'Anrede ohne deinen Namen, obwohl der Anbieter ihn kennt.',
    ],
    correct:
      'Nicht klicken. Die App öffnen oder paypal.de selbst eintippen. Steht dort keine Einschränkung, war die Mail falsch — löschen, fertig.',
  },

  smishing: {
    channel: 'SMS',
    from: '+49 152 ••••••',
    subject: 'Paketbenachrichtigung',
    body: `DHL: Ihre Sendung 4Z8811 konnte nicht zugestellt werden.
Zollgebühr von 2,99 EUR ausstehend.

Sendung freigeben: dhl-zustellung-de.info/4Z8811`,
    hook: (p) =>
      p.hasKids || p.isYoung
        ? 'Die Masche funktioniert über schiere Häufigkeit: Wer regelmäßig bestellt, erwartet fast immer irgendein Paket. Der Kleinstbetrag ist Absicht — 2,99 € prüft niemand nach, es geht um deine Kartendaten.'
        : 'Der Betrag ist so niedrig gewählt, dass eine Prüfung unverhältnismäßig wirkt. Bezahlt wird nicht die Gebühr, sondern die Eingabe deiner Kartendaten.',
    redFlags: [
      'Zusteller erheben keine Zollgebühren per SMS-Link.',
      'Die Domain endet nicht auf dhl.de.',
      'Eine Sendungsnummer, die du keiner Bestellung zuordnen kannst.',
      'Die Nachricht kommt von einer privaten Mobilnummer.',
    ],
    correct:
      'Sendungsnummer in der offiziellen App oder auf der Website des Zustellers prüfen. Gibt es die Sendung nicht, war es ein Betrugsversuch.',
  },

  'support-scam': {
    channel: 'Telefon',
    from: '"Microsoft Support" — angezeigte Nummer: +49 30 ••••',
    subject: 'Angeblicher technischer Support',
    body: `"Guten Tag, mein Name ist Herr Berger vom Microsoft
Sicherheitsteam. Wir haben festgestellt, dass Ihr Computer
seit mehreren Tagen Schadsoftware an unser Netzwerk sendet.

Bitte erschrecken Sie nicht — wir können das gemeinsam
beheben. Sitzen Sie gerade am Rechner? Ich zeige Ihnen kurz,
wo Sie das selbst sehen können …"`,
    hook: (p) =>
      p.isSenior || p.isNovice
        ? 'Der Anrufer arbeitet mit Fachbegriffen und einem ruhigen, hilfsbereiten Ton. Er baut keine Drohkulisse auf, sondern bietet Hilfe an — das ist deutlich wirksamer. Danach zeigt er dir harmlose Systemmeldungen als "Beweis".'
        : 'Auch technisch versierte Menschen fallen darauf herein, wenn der Anruf zufällig zu einem echten Problem passt. Der Anrufer hat Zeit und ruft viele Menschen an.',
    redFlags: [
      'Microsoft, Apple und Internetanbieter rufen niemals unaufgefordert an.',
      'Die angezeigte Rufnummer ist frei fälschbar und beweist nichts.',
      'Die Aufforderung, ein Fernwartungsprogramm zu installieren.',
      'Die Ereignisanzeige von Windows enthält immer Warnungen — sie ist kein Beweis für irgendetwas.',
    ],
    correct:
      'Auflegen. Ohne Erklärung. Bei Unsicherheit selbst über eine offizielle Nummer zurückrufen — nie über eine genannte Nummer.',
  },

  'shock-call': {
    channel: 'Telefon oder Messenger',
    from: 'Unbekannte Nummer',
    subject: 'Angehöriger in Not',
    body: `"Mama? … Ich bin's. Mir ist was passiert.
Ich hatte einen Unfall, mein Handy ist kaputt,
das hier ist die Nummer von einer Beamtin …

Bitte sag jetzt nichts den anderen, ich schäme mich so.
Es geht um eine Kaution, sonst muss ich hierbleiben."`,
    hook: (p) =>
      p.supportsElderly
        ? 'Diese Variante trifft nicht dich, sondern deine Angehörigen — und du bist die Person, die im Skript als Ausrede dient ("sag es niemandem"). Für eine überzeugende Stimmkopie genügen heute wenige Sekunden aus einer Sprachnachricht.'
        : 'Der emotionale Ausnahmezustand ist das eigentliche Werkzeug. Unter Schock prüft niemand Rufnummern — und die Stimme lässt sich inzwischen aus wenigen Sekunden Material nachbilden.',
    redFlags: [
      'Die Bitte, mit niemandem darüber zu sprechen.',
      'Eine geänderte Rufnummer als Einstieg in die Geschichte.',
      'Bargeldübergabe oder Sofortüberweisung.',
      'Behörden und Krankenhäuser fordern niemals telefonisch Geld.',
    ],
    correct:
      'Auflegen und die betroffene Person selbst unter der gespeicherten Nummer anrufen. Vorher vereinbartes Codewort abfragen. Auch wenn die Stimme stimmt.',
  },

  'investment-scam': {
    channel: 'Social Media und anschließend WhatsApp',
    from: '"Anlage-Community DE" — Gruppe mit 340 Mitgliedern',
    subject: 'Angebliche Anlagegelegenheit',
    body: `"Guten Morgen zusammen ☀️

Position von gestern +14,3 % geschlossen.
Screenshot im Anhang für alle, die gefragt haben.

@du — du hattest nach dem Einstieg gefragt: Mit 250 €
kannst du das System risikofrei testen. Unsere Analystin
begleitet dich beim ersten Trade persönlich."`,
    hook: (p) =>
      p.hasCrypto
        ? 'Deine Krypto-Affinität ist das Einstiegssignal. Die Plattform sieht professionell aus, die Zahlen steigen — und kleine Auszahlungen funktionieren am Anfang tatsächlich. Genau das ist der Teil, der überzeugt.'
        : 'Die Gruppe ist vollständig inszeniert: Alle "Mitglieder" außer dir gehören zur selben Organisation. Die Gewinne sind Zahlen auf einer Website, die den Tätern gehört.',
    redFlags: [
      'Kontaktaufnahme über Werbung, Gruppenchat oder eine neue Bekanntschaft.',
      'Anbieter steht nicht in der Unternehmensdatenbank der BaFin.',
      'Gewinne sind sichtbar, Auszahlungen scheitern an Gebühren oder "Steuern".',
      'Persönliche Betreuung und Zeitdruck bei der ersten Einzahlung.',
    ],
    correct:
      'Anbieter in der BaFin-Datenbank und der BaFin-Warnliste prüfen. Steht er nicht drin, ist die Sache beendet. Nachzahlen macht es nie besser.',
  },

  'romance-scam': {
    channel: 'Dating-App, später Messenger',
    from: 'Ein Kontakt seit sieben Wochen',
    subject: 'Beziehungsbetrug',
    body: `"Ich weiß, das kommt jetzt komisch — ich rede sonst nie
über Geld. Aber die Anlage, von der ich dir erzählt habe,
läuft gerade wirklich gut.

Ich will dich zu nichts drängen. Ich hätte nur ein
schlechtes Gewissen, wenn ich es dir nicht sage und du
später fragst, warum ich nichts gesagt habe."`,
    hook: (p) =>
      p.livesAlone
        ? 'Diese Masche läuft über Wochen und oft ohne jede Geldforderung — genau das macht sie so wirksam. Bis das Thema kommt, ist eine echte Bindung entstanden, und der Zweifel fühlt sich wie ein Vertrauensbruch an.'
        : 'Der Aufbau dauert Wochen bis Monate. Das Geldthema kommt erst, wenn Vertrauen existiert — und wird nie gefordert, sondern angeboten.',
    redFlags: [
      'Ein Videotelefonat kommt nie zustande oder bricht immer sofort ab.',
      'Die Beziehung entwickelt sich auffällig schnell und intensiv.',
      'Irgendwann geht es um eine Anlage, einen Notfall oder einen Zoll.',
      'Zahlung in Kryptowährung oder über einen unbekannten Anbieter.',
    ],
    correct:
      'Rückwärts-Bildersuche mit den Profilfotos. Mit einer Person aus dem echten Umfeld darüber sprechen. Kein Geld an jemanden, den du nie persönlich getroffen hast.',
  },

  'fake-shop': {
    channel: 'Kleinanzeigen-Chat',
    from: 'Käufer oder Verkäufer',
    subject: 'Gefälschter Käuferschutz',
    body: `"Super, ich nehme es!

Ich mache das über den Käuferschutz, dann sind wir beide
abgesichert. Du bekommst gleich einen Link, da bestätigst
du nur kurz den Empfang und trägst deine Bankdaten ein,
damit das Geld ankommt.

Ich bin auf Montage, Abholung geht leider nicht."`,
    hook: (p) =>
      p.isYoung
        ? 'Der Trick ist die Umkehrung: Du verkaufst — deshalb rechnest du nicht damit, dass du derjenige bist, der bezahlt. Der Link führt in Wahrheit auf eine Zahlungsfreigabe, nicht auf einen Geldeingang.'
        : 'Ein Link, über den du "Geld empfängst", existiert bei keiner echten Plattform. Was du dort bestätigst, ist immer eine Zahlung von deinem Konto weg.',
    redFlags: [
      'Der Handel soll die Plattform verlassen.',
      'Ein Link, über den angeblich Geld zu dir fließt.',
      'Eingabe von Bank- oder Kartendaten, um Geld zu *empfangen*.',
      'Abholung ist plötzlich unmöglich, Eile ist geboten.',
    ],
    correct:
      'Zahlungen ausschließlich innerhalb der Plattform. Niemals "an Freunde und Familie" zahlen. Keine Links aus dem Chat öffnen.',
  },

  sextortion: {
    channel: 'E-Mail',
    from: 'Eine zufällige Adresse, oft deine eigene als Absender gefälscht',
    subject: 'Ich habe Zugriff auf Ihr Gerät',
    body: `Ihr Passwort lautet: Sommer2019!

Ich habe vor einigen Monaten Zugriff auf Ihr Gerät erlangt
und Ihre Kamera aktiviert, während Sie bestimmte Seiten
besucht haben.

Sie haben 48 Stunden, um 850 EUR in Bitcoin an folgende
Adresse zu senden. Andernfalls geht das Material an alle
Ihre Kontakte.`,
    hook: () =>
      'Das Passwort ist echt — es stammt aus einem alten Datenleck und ist genau deshalb enthalten: Es soll die restliche Behauptung glaubwürdig machen. Zugriff auf dein Gerät hat der Absender in aller Regel nicht.',
    redFlags: [
      'Ein altes Passwort als einziger "Beweis" — mehr wird nie geliefert.',
      'Keine tatsächliche Aufnahme, kein konkretes Detail über dich.',
      'Zahlungsfrist und Kryptowährung.',
      'Der Text ist in Massen versendet und wirkt allgemein.',
    ],
    correct:
      'Nicht zahlen, nicht antworten. Das genannte Passwort überall ändern, wo es noch im Einsatz ist. Anzeige erstatten. Bei echtem Material nicht allein bleiben und Hilfe holen.',
  },

  'gaming-takeover': {
    channel: 'Discord-Direktnachricht',
    from: 'Ein Kontakt aus deiner Freundesliste',
    subject: 'Bitte um einen Gefallen',
    body: `"hey, kurze frage — mein team ist bei nem kleinen turnier
dabei und wir brauchen noch stimmen 🙏

dauert 10 sekunden, einfach mit steam einloggen und
abstimmen. würde mir echt helfen"`,
    hook: (p) =>
      p.tradesItems
        ? 'Du handelst mit Items — dein Inventarwert ist öffentlich einsehbar, du wirst gezielt ausgesucht. Die Anmeldeseite ist perfekt nachgebaut, und abgegriffen wird nicht dein Passwort, sondern dein Sitzungs-Token. Der überlebt Passwortänderung und zweiten Faktor.'
        : 'Der Absender ist ein echter Freund — sein Konto wurde vorher übernommen. Deshalb fehlt hier jedes Misstrauen, und deshalb funktioniert die Masche so zuverlässig.',
    redFlags: [
      'Eine Anmeldung über Steam, Discord oder Google auf einer fremden Website.',
      'Zeitdruck und ein kleiner Gefallen als Einstieg.',
      'Untypischer Schreibstil des vermeintlichen Freundes.',
      'Die Seite öffnet ein Anmeldefenster, dessen Adresse sich nicht prüfen lässt.',
    ],
    correct:
      'Niemals über einen Link anmelden. Beim Freund über einen anderen Kanal nachfragen. Nach einem Fehler: alle Sitzungen beenden und den zweiten Faktor neu einrichten.',
  },

  'banking-fraud': {
    channel: 'Telefon, nach einer vorbereitenden SMS',
    from: '"Betrugsabteilung Ihrer Bank" — Nummer stimmt mit der echten überein',
    subject: 'Angebliche Rückbuchung',
    body: `"Frau Meyer, wir haben einen Abbuchungsversuch über
1.480 EUR aus den Niederlanden gestoppt.

Um die Rückbuchung abzuschließen, müssen Sie den Vorgang
einmal in Ihrer App bestätigen. Sie sehen dort gleich eine
Freigabe — das ist die Stornierung. Bitte bestätigen Sie."`,
    hook: (p) =>
      p.tanSameDevice
        ? 'Der entscheidende Punkt: Die Freigabe, die du bestätigen sollst, ist die Überweisung selbst — es gibt keine Freigabe für eine Rückbuchung. Da bei dir Banking und Freigabe auf demselben Gerät laufen, fehlt der zweite Blick von außen.'
        : 'Die Anruferin kennt oft die letzten Umsätze — aus einer vorherigen Phishing-Seite. Das erzeugt Glaubwürdigkeit. Bestätigt wird am Ende immer eine echte Zahlung von dir weg.',
    redFlags: [
      'Jede Freigabe bewegt Geld von dir weg. Es gibt keine Freigabe für einen Eingang.',
      'Die angezeigte Rufnummer stimmt — sie ist trotzdem gefälscht.',
      'Die Aufforderung, während des Gesprächs in der App zu handeln.',
      'Zeitdruck und die Bitte, nicht aufzulegen.',
    ],
    correct:
      'Auflegen. Über die Nummer auf der Rückseite deiner Bankkarte zurückrufen. Niemals eine Freigabe erteilen, während jemand am Telefon ist.',
  },
}

/** Die Szenarien, die zu den Bedrohungen mit dem höchsten Risiko gehören. */
export function pickScams(threats, profile, limit = 3) {
  return threats
    .filter((t) => SCAMS[t.id])
    .slice(0, limit)
    .map((t) => {
      const s = SCAMS[t.id]
      return {
        threatId: t.id,
        threatName: t.short,
        risk: t.risk,
        likelihood: t.likelihood,
        ...s,
        hook: typeof s.hook === 'function' ? s.hook(profile) : s.hook,
      }
    })
}

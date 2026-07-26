// ---------------------------------------------------------------------------
// Maßnahmen — Teil 1: Konten, Passwörter, Zweiter Faktor
// ---------------------------------------------------------------------------
// Der Katalog ist auf drei Dateien verteilt (actions-core / actions-devices /
// actions-life) und wird in actions.js zusammengeführt. Grund ist reine
// Lesbarkeit — inhaltlich sind es gleichwertige Einträge.
//
// Schema je Maßnahme:
//   effort      Minuten für die einmalige Umsetzung
//   recurring   null | Text, falls sie wiederkehrt
//   cost        € pro Jahr (0 = kostenlos), für Sortierung und Filter
//   difficulty  1 = jeder schafft das, 3 = etwas Einarbeitung nötig
//   reduces     { bedrohungsId: Wirkungsgrad 0..1 }
//   appliesIf   greift die Maßnahme bei diesem Profil überhaupt?
//   doneIf      bereits umgesetzt → erscheint als bestätigt statt als Aufgabe
//   why         string | (profile) => string — die persönliche Begründung
//   steps       [{ t: Schritt, d: Detail }]
//   watchout    der Fehler, den fast alle dabei machen
// ---------------------------------------------------------------------------

export const ACTIONS_CORE = [
  {
    id: 'password-manager',
    title: 'Einen echten Passwortmanager einrichten',
    oneLiner: 'Die einzige Maßnahme, die gleichzeitig deine Sicherheit erhöht und deinen Alltag bequemer macht.',
    category: 'accounts',
    effort: 45,
    cost: 0,
    costLabel: 'Kostenlos (Bitwarden)',
    difficulty: 1,
    reduces: {
      'credential-stuffing': 0.75,
      'phishing-credentials': 0.35,
      'email-takeover': 0.4,
      'gaming-takeover': 0.4,
      'cloud-takeover': 0.35,
      infostealer: 0.2,
    },
    appliesIf: (p) => !p.hasRealManager,
    doneIf: (p) => p.hasRealManager,
    why: (p) =>
      p.noManager
        ? 'Du merkst dir Passwörter oder schreibst sie auf. Beides führt zwangsläufig dazu, dass du sie wiederverwendest — mehr Passwörter kann sich kein Mensch merken. Der Manager löst nicht das Merken, er löst das Wiederverwenden.'
        : 'Der Browser-Speicher ist bequem, aber genau das Ziel von Infostealer-Malware und an ein einzelnes Ökosystem gebunden. Ein eigener Tresor ist besser geschützt und funktioniert überall.',
    steps: [
      { t: 'Bitwarden installieren', d: 'Konto anlegen, Browser-Erweiterung und Handy-App einrichten. Die kostenlose Version reicht vollständig.' },
      {
        t: 'Ein starkes Master-Passwort wählen',
        d: 'Vier bis fünf zufällige Wörter, die du dir als Bild vorstellen kannst — etwa "Kaktus-Fahrrad-Nebel-Trommel". Dieses eine Passwort musst du dir merken, und nur dieses.',
      },
      { t: 'Master-Passwort einmal aufschreiben', d: 'Auf Papier, an einen Ort, den du kennst und der nicht am Rechner klebt. Ein vergessener Tresor ist ein Totalverlust.' },
      { t: 'Bestehende Passwörter importieren', d: 'Aus dem Browser exportieren, in Bitwarden importieren, danach den Browser-Speicher leeren und die Speicherfunktion abschalten.' },
      { t: 'Nicht alles auf einmal umstellen', d: 'Ab jetzt gilt: bei jeder Anmeldung, die du ohnehin machst, das Passwort neu generieren lassen. Nach zwei Monaten ist der Großteil erledigt.' },
    ],
    products: ['bitwarden', 'onepassword', 'protonpass', 'keepassxc'],
    watchout:
      'Nicht das Master-Passwort woanders wiederverwenden — es ist das einzige, das wirklich einzigartig sein muss.',
  },

  {
    id: 'unique-passwords',
    title: 'Die zwölf wichtigsten Passwörter einzeln neu setzen',
    oneLiner: 'Nicht alle 80 Konten — nur die, an denen der Rest hängt.',
    category: 'accounts',
    effort: 60,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: {
      'credential-stuffing': 0.6,
      'email-takeover': 0.35,
      'cloud-takeover': 0.3,
      'gaming-takeover': 0.35,
    },
    appliesIf: (p) => p.reusesPasswords || p.pwStrength < 60,
    why: (p) =>
      p.heavyReuse
        ? 'Du hast im Grunde zwei, drei Passwörter für alles. Das heißt: ein einziger geknackter Dienst — irgendein Forum von 2016 — öffnet potenziell dein Postfach und dein Bankkonto. Diese eine Änderung entfernt den größten Einzelfaktor in deinem Profil.'
        : 'Wiederverwendete Passwörter sind der Weg, über den die meisten privaten Konten tatsächlich übernommen werden — nicht Malware, nicht gezielte Angriffe.',
    steps: [
      {
        t: 'Die Liste festlegen',
        d: 'Haupt-E-Mail, Apple- oder Google-Konto, Bank, PayPal, Amazon, Passwortmanager, Mobilfunkanbieter, die zwei wichtigsten sozialen Netzwerke, Gaming-Plattform, Cloud-Speicher, Arbeitszugang.',
      },
      { t: 'Mit der E-Mail beginnen', d: 'Immer zuerst. Solange das Postfach kompromittierbar ist, sind alle anderen Änderungen wirkungslos.' },
      { t: 'Passwörter generieren lassen', d: 'Mindestens 20 Zeichen, direkt aus dem Manager. Du wirst sie nie tippen müssen.' },
      { t: 'Aktive Sitzungen beenden', d: 'Nach jeder Änderung in den Sicherheitseinstellungen "von allen Geräten abmelden" wählen — sonst bleibt ein Angreifer eingeloggt.' },
    ],
    products: ['bitwarden'],
    watchout:
      'Variationen wie "Sommer2024!" → "Sommer2025!" zählen nicht. Angreifer probieren solche Muster automatisch mit durch.',
  },

  {
    id: 'mfa-critical',
    title: 'Zwei-Faktor auf den kritischen Konten aktivieren',
    oneLiner: 'Ein gestohlenes Passwort ist dann nur noch die Hälfte der Miete.',
    category: 'accounts',
    effort: 40,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 2,
    reduces: {
      'credential-stuffing': 0.55,
      'email-takeover': 0.6,
      'cloud-takeover': 0.6,
      'phishing-credentials': 0.25,
      'gaming-takeover': 0.45,
      'crypto-theft': 0.25,
    },
    appliesIf: (p) => p.mfaStrength < 75,
    doneIf: (p) => p.mfaBreadth >= 90 && (p.hasAppMfa || p.hasPhishResistantMfa),
    why: (p) =>
      p.noMfa
        ? 'Aktuell reicht bei dir ein einziges erbeutetes Passwort für den vollen Zugriff. Zwei-Faktor ist der Unterschied zwischen "Passwort weg" und "Konto weg".'
        : 'Du nutzt Zwei-Faktor bereits teilweise. Die Lücke sind die Konten, über die sich alle anderen zurücksetzen lassen — dort muss es lückenlos sein.',
    steps: [
      {
        t: 'Eine Authenticator-App installieren',
        d: 'Ente Auth oder Aegis. Wichtig: eine App mit Backup-Funktion — sonst ist ein verlorenes Handy ein echtes Problem.',
      },
      { t: 'Reihenfolge einhalten', d: 'E-Mail zuerst, dann Apple/Google, dann Passwortmanager, dann Bank und Bezahldienste, dann der Rest.' },
      { t: 'Wiederherstellungscodes sofort sichern', d: 'Jeder Dienst zeigt sie genau einmal an. Ausdrucken oder in den Passwortmanager legen — nicht als Screenshot in der Galerie.' },
      { t: 'SMS nur als Notnagel', d: 'Wo die App angeboten wird, SMS anschließend deaktivieren. Sonst bleibt der schwächste Weg offen.' },
    ],
    products: ['enteauth', 'aegis', 'twofas'],
    watchout:
      'Die Authenticator-App nicht ausschließlich auf demselben Handy haben, mit dem du dich anmeldest — und niemals ohne gesichertes Backup.',
  },

  {
    id: 'passkeys',
    title: 'Passkeys nutzen, wo sie angeboten werden',
    oneLiner: 'Der einzige Anmeldeweg, der sich auf einer gefälschten Seite technisch nicht abgreifen lässt.',
    category: 'accounts',
    effort: 25,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 2,
    reduces: {
      'phishing-credentials': 0.8,
      'credential-stuffing': 0.5,
      'email-takeover': 0.5,
      'cloud-takeover': 0.45,
      'gaming-takeover': 0.3,
    },
    appliesIf: (p) => !p.hasPhishResistantMfa,
    doneIf: (p) => p.hasPhishResistantMfa,
    why: 'Ein Passkey ist an die echte Domain gebunden. Auf "paypa1-sicherheit.de" funktioniert er schlicht nicht — er weiß, dass er dort nicht hingehört. Genau deshalb ist er gegen Phishing wirksam, während ein SMS-Code es nie sein kann.',
    steps: [
      { t: 'Bei Google, Apple und Microsoft beginnen', d: 'Alle drei bieten Passkeys prominent in den Sicherheitseinstellungen an.' },
      { t: 'Passkey im Passwortmanager speichern', d: 'Bitwarden und 1Password können Passkeys geräteübergreifend verwalten — sonst hängst du an einem einzelnen Handy.' },
      { t: 'Passwort und zweiten Faktor aktiv lassen', d: 'Passkeys sind noch nicht überall unterstützt. Sie ergänzen den bisherigen Weg, sie ersetzen ihn vorerst nicht.' },
    ],
    products: ['bitwarden', 'onepassword'],
    watchout: 'Ein Passkey, der nur auf einem Gerät liegt, wird bei Verlust zum Problem. Immer synchronisieren oder einen zweiten hinterlegen.',
  },

  {
    id: 'hardware-key',
    title: 'Zwei Hardware-Sicherheitsschlüssel anschaffen',
    oneLiner: 'Die stärkste verfügbare Absicherung für die Konten, an denen wirklich alles hängt.',
    category: 'accounts',
    effort: 50,
    cost: 110,
    costLabel: 'ca. 100 – 120 € einmalig',
    difficulty: 3,
    reduces: {
      'phishing-credentials': 0.85,
      'email-takeover': 0.7,
      'sim-swap': 0.6,
      'cloud-takeover': 0.6,
      'crypto-theft': 0.3,
    },
    appliesIf: (p) => p.moneyValue > 60 || p.isTargeted || p.cryptoSignificant || p.workCritical,
    why: (p) =>
      p.cryptoSignificant
        ? 'Bei selbstverwahrten Kryptowerten gibt es keine Rückbuchung und keine Hotline. Hier lohnt sich die stärkste verfügbare Absicherung.'
        : 'Dein Profil zeigt entweder hohe erreichbare Werte oder eine exponierte Rolle. Ab diesem Punkt rechnet sich der zusätzliche Aufwand gegenüber einer App.',
    steps: [
      { t: 'Zwei Schlüssel kaufen', d: 'Einer am Schlüsselbund, einer als Ersatz an einem sicheren Ort. Ein einzelner Schlüssel ist ein Aussperr-Risiko.' },
      { t: 'Beide bei jedem Dienst registrieren', d: 'Immer beide — sonst nützt der Ersatz nichts.' },
      { t: 'Anschlussart prüfen', d: 'USB-C und NFC deckt heute Laptop und Handy ab.' },
      { t: 'Schwächere Verfahren abschalten', d: 'Nach der Einrichtung SMS als zweiten Faktor entfernen, sonst bleibt die schwache Tür offen.' },
    ],
    products: ['yubikey', 'nitrokey'],
    watchout: 'Erst beide Schlüssel registrieren, dann die alten Verfahren abschalten. Nicht umgekehrt.',
  },

  {
    id: 'drop-sms-mfa',
    title: 'SMS als zweiten Faktor ersetzen',
    oneLiner: 'SMS ist besser als nichts — und schwächer als alles andere.',
    category: 'accounts',
    effort: 30,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 2,
    reduces: {
      'sim-swap': 0.7,
      'phishing-credentials': 0.2,
      'mobile-malware': 0.25,
      'crypto-theft': 0.2,
    },
    appliesIf: (p) => p.usesSmsMfa || p.smsOnlyMfa,
    why: 'Ein SMS-Code lässt sich auf drei Wegen abgreifen: durch Übernahme deiner Rufnummer beim Anbieter, durch eine Schadsoftware, die Nachrichten mitliest, und durch eine Phishing-Seite, die den Code in Echtzeit weiterreicht. Eine Authenticator-App schließt die ersten beiden Wege vollständig.',
    steps: [
      { t: 'Konten durchgehen, die SMS nutzen', d: 'Typisch: Bank, PayPal, Amazon, Mobilfunkanbieter, Krypto-Börse.' },
      { t: 'Auf App oder Passkey umstellen', d: 'In den Sicherheitseinstellungen die Authenticator-App hinzufügen.' },
      { t: 'SMS anschließend deaktivieren', d: 'Erst wenn die neue Methode nachweislich funktioniert und die Wiederherstellungscodes gesichert sind.' },
    ],
    products: ['enteauth', 'aegis'],
    watchout: 'Manche Banken bieten nichts anderes an. Dann bleibt SMS — sichere dafür zusätzlich dein Mobilfunkkonto ab.',
  },

  {
    id: 'mobile-account-pin',
    title: 'Dein Mobilfunkkonto gegen Rufnummern-Übernahme sichern',
    oneLiner: 'Fünf Minuten gegen eine der unangenehmsten Angriffsarten überhaupt.',
    category: 'accounts',
    effort: 15,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: { 'sim-swap': 0.65 },
    appliesIf: (p) => p.usesSmsMfa || p.recoveryViaPhone || p.moneyValue > 60 || p.hasCrypto,
    why: 'Bei einem SIM-Swap ruft jemand deinen Anbieter an, gibt sich mit öffentlich auffindbaren Daten als du aus und lässt eine Ersatzkarte schicken. Ab dann laufen alle SMS-Codes bei ihm auf — und dein Handy hat plötzlich kein Netz mehr.',
    steps: [
      { t: 'Kundenkennwort setzen', d: 'Im Kundenportal oder telefonisch ein Kennwort hinterlegen, ohne das keine Änderungen möglich sind.' },
      { t: 'SIM-Tausch sperren lassen', d: 'Viele Anbieter bieten eine zusätzliche Sperre für Ersatzkarten und Portierungen an — ausdrücklich danach fragen.' },
      { t: 'PIN der SIM-Karte aktiv lassen', d: 'Verhindert, dass die Karte in einem fremden Gerät sofort funktioniert.' },
      { t: 'Warnsignal kennen', d: 'Plötzlich kein Netz ohne erkennbaren Grund: sofort über ein anderes Gerät den Anbieter kontaktieren und die wichtigsten Konten prüfen.' },
    ],
    products: [],
    watchout: 'Das Kundenkennwort nicht aus Daten bauen, die auf deinen Social-Media-Profilen stehen.',
  },

  {
    id: 'recovery-codes',
    title: 'Wiederherstellungscodes anlegen und offline sichern',
    oneLiner: 'Die Frage ist nicht, ob du dich mal aussperrst, sondern wann.',
    category: 'accounts',
    effort: 30,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: {
      'email-takeover': 0.3,
      'account-recovery-abuse': 0.55,
      'cloud-takeover': 0.3,
      'sim-swap': 0.35,
    },
    appliesIf: (p) => !p.hasRecoveryCodes,
    doneIf: (p) => p.hasRecoveryCodes,
    why: (p) =>
      p.noRecoveryPlan
        ? 'Du hast angegeben, dass es keinen Plan gibt. Damit ist ein verlorenes oder gestohlenes Handy nicht nur ärgerlich, sondern potenziell der dauerhafte Verlust deines E-Mail-Kontos — und damit aller daran hängenden Konten.'
        : 'Handynummer und Zweitadresse sind selbst angreifbar. Offline-Codes sind der einzige Weg, der unabhängig von allem anderen funktioniert.',
    steps: [
      { t: 'Bei den fünf wichtigsten Konten beginnen', d: 'E-Mail, Apple/Google, Passwortmanager, Bank, Mobilfunkanbieter.' },
      { t: 'Codes erzeugen und ausdrucken', d: 'In den Sicherheitseinstellungen unter "Wiederherstellungscodes" oder "Backup-Codes".' },
      { t: 'Physisch verwahren', d: 'Ordner, Safe oder bei einer Vertrauensperson. Ein Umschlag mit Datum reicht völlig.' },
      { t: 'Zweites vertrauenswürdiges Gerät hinterlegen', d: 'Ein altes Tablet zu Hause, das angemeldet bleibt, ist ein hervorragender zweiter Weg zurück.' },
    ],
    products: [],
    watchout: 'Nicht als Screenshot in der Galerie oder als Notiz in der Cloud — beides hängt genau an dem Konto, aus dem du ausgesperrt bist.',
  },

  {
    id: 'breach-check',
    title: 'Prüfen, was von dir schon geleakt ist — und Warnungen einrichten',
    oneLiner: 'Zwanzig Minuten, die dir zeigen, wo du tatsächlich stehst.',
    category: 'accounts',
    effort: 20,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: {
      'credential-stuffing': 0.3,
      sextortion: 0.3,
      'identity-theft': 0.2,
    },
    appliesIf: (p) => !p.breachAware || p.knownBreachIgnored,
    doneIf: (p) => p.breachAware && !p.knownBreachIgnored,
    why: (p) =>
      p.knownBreachIgnored
        ? 'Du weißt von einem Leak und hast das Passwort nicht geändert. Diese Zugangsdaten werden aktuell irgendwo automatisiert durchprobiert — das ist kein hypothetisches Risiko, sondern ein laufender Vorgang.'
        : 'Fast jede Adresse, die älter als ein paar Jahre ist, steht in mindestens einem Leak. Solange du nicht weißt, in welchen, kannst du nicht entscheiden, was dringend ist.',
    steps: [
      { t: 'Alle deine Adressen prüfen', d: 'Auf haveibeenpwned.com jede E-Mail-Adresse einzeln eingeben — auch alte.' },
      { t: 'Benachrichtigung aktivieren', d: 'Über "Notify me" bekommst du künftig automatisch Bescheid, wenn deine Adresse in einem neuen Leak auftaucht.' },
      { t: 'Betroffene Passwörter ändern', d: 'Alle Dienste aus der Trefferliste — und alle anderen Konten, bei denen dasselbe Passwort lief.' },
      { t: 'Zusätzlich den HPI-Checker nutzen', d: 'Deckt teilweise andere Datensätze ab; das Ergebnis kommt per E-Mail.' },
    ],
    products: ['hibp', 'hpi'],
    watchout:
      'Ein Treffer bedeutet nicht, dass "du gehackt wurdest" — sondern dass ein Anbieter es wurde. Relevant ist nur, ob du das Passwort noch irgendwo nutzt.',
  },

  {
    id: 'email-separation',
    title: 'E-Mail-Adressen nach Zweck trennen',
    oneLiner: 'Damit ein Leak beim Online-Shop nicht dein Bankkonto betrifft.',
    category: 'accounts',
    effort: 60,
    recurring: 'einmalig aufsetzen, dann laufend',
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 2,
    reduces: {
      'credential-stuffing': 0.25,
      'phishing-credentials': 0.2,
      'email-takeover': 0.2,
      'identity-theft': 0.2,
    },
    appliesIf: (p) => p.emailOneForAll || !p.usesAliases,
    doneIf: (p) => p.usesAliases,
    why: (p) =>
      p.emailOneForAll
        ? 'Eine Adresse für alles heißt: Diese Adresse steht in jedem Leak der letzten zehn Jahre, und jeder Angreifer kennt den Benutzernamen für alle deine Konten. Er muss nur noch das Passwort raten.'
        : 'Getrennte Adressen begrenzen, was ein einzelner Datenabfluss über dich verrät.',
    steps: [
      {
        t: 'Drei Ebenen festlegen',
        d: 'Eine geheime Adresse nur für Bank, Behörden und den Passwortmanager. Eine für alltägliche Dienste. Eine für Newsletter und alles Einmalige.',
      },
      { t: 'Die geheime Adresse nirgends öffentlich verwenden', d: 'Sie steht in keinem Impressum, in keinem Shop, auf keinem Formular.' },
      { t: 'Aliase pro Dienst nutzen', d: 'Mit SimpleLogin oder Apples "E-Mail verbergen" bekommt jeder Dienst eine eigene Adresse. Kommt dort Spam an, weißt du sofort, wer deine Daten weitergegeben hat — und schaltest genau diese Adresse ab.' },
      { t: 'Schrittweise umziehen', d: 'Nur die kritischen Konten sofort umstellen, den Rest über die Zeit.' },
    ],
    products: ['simplelogin', 'addy', 'hidemyemail', 'protonmail', 'tuta'],
    watchout: 'Vor dem Umzug sicherstellen, dass du die neue Adresse dauerhaft behältst — ein späterer Wechsel ist deutlich aufwendiger.',
  },

  {
    id: 'email-aliases',
    title: 'Wegwerf-Aliase für neue Anmeldungen einführen',
    oneLiner: 'Ab jetzt bekommt jeder neue Dienst eine eigene Adresse.',
    category: 'accounts',
    effort: 20,
    cost: 0,
    costLabel: 'Kostenlos bis ca. 30 €/Jahr',
    difficulty: 1,
    reduces: { 'phishing-credentials': 0.15, 'credential-stuffing': 0.15, doxxing: 0.15 },
    appliesIf: (p) => !p.usesAliases,
    doneIf: (p) => p.usesAliases,
    why: 'Der Aufwand entsteht nur einmal bei der Einrichtung. Danach ist es exakt ein Klick mehr pro Anmeldung — und du kannst Spam an der Quelle abschalten, statt ihn zu filtern.',
    steps: [
      { t: 'Dienst einrichten', d: 'SimpleLogin, addy.io oder Apples "E-Mail-Adresse verbergen", falls du iCloud+ hast.' },
      { t: 'Browser-Erweiterung installieren', d: 'Damit erzeugst du den Alias direkt im Anmeldeformular.' },
      { t: 'Regel für dich festlegen', d: 'Alles, was kein Bankkonto und keine Behörde ist, bekommt einen Alias.' },
    ],
    products: ['simplelogin', 'addy', 'hidemyemail'],
    watchout: 'Für Konten, die du dauerhaft brauchst, keinen kostenlosen Wegwerf-Dienst nutzen, der irgendwann abgeschaltet wird.',
  },

  {
    id: 'fake-security-answers',
    title: 'Sicherheitsfragen wie Passwörter behandeln',
    oneLiner: 'Der Mädchenname deiner Mutter steht auf Facebook.',
    category: 'accounts',
    effort: 15,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: { 'account-recovery-abuse': 0.5 },
    appliesIf: (p) => p.onlineExposure > 35 || p.hasAdversary,
    why: 'Sicherheitsfragen sind eine Hintertür mit ausgesprochen schwachem Schloss. Ihre Antworten sind entweder öffentlich recherchierbar oder jeder Person aus deinem Umfeld bekannt.',
    steps: [
      { t: 'Antworten zufällig erfinden', d: 'Geburtsort: "Kaffeetasse47". Die Frage muss nicht zur Antwort passen.' },
      { t: 'Im Passwortmanager als Notiz speichern', d: 'Sonst stehst du im Ernstfall selbst davor und weißt es nicht mehr.' },
      { t: 'Dort ändern, wo es zählt', d: 'Bank, E-Mail, Mobilfunkanbieter — also überall, wo die Frage tatsächlich zum Zurücksetzen genutzt werden kann.' },
    ],
    products: ['bitwarden'],
    watchout: 'Bei Banken kann die Antwort telefonisch abgefragt werden — dann sollte sie aussprechbar sein.',
  },

  {
    id: 'session-cleanup',
    title: 'Aktive Anmeldesitzungen und verbundene Apps aufräumen',
    oneLiner: 'Ein Passwortwechsel wirft niemanden hinaus, der bereits eingeloggt ist.',
    category: 'accounts',
    effort: 30,
    recurring: 'halbjährlich',
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: { infostealer: 0.3, 'gaming-takeover': 0.35, 'email-takeover': 0.2, 'cloud-takeover': 0.2 },
    appliesIf: () => true,
    why: 'Moderne Angriffe stehlen nicht dein Passwort, sondern deinen Sitzungs-Token — den Nachweis, dass du bereits angemeldet bist. Der überlebt eine Passwortänderung und umgeht den zweiten Faktor vollständig. Nur ein aktives Abmelden aller Geräte beendet ihn.',
    steps: [
      { t: 'Geräteliste prüfen', d: 'Bei Google, Apple, Microsoft, Steam, Discord und deinen sozialen Netzwerken die angemeldeten Geräte durchgehen.' },
      { t: 'Alles Unbekannte und Alte abmelden', d: 'Im Zweifel alles abmelden und dich neu anmelden — das kostet fünf Minuten.' },
      { t: 'Verbundene Apps durchsehen', d: 'Drittanbieter mit Zugriff auf dein Konto: alles entfernen, was du nicht aktiv nutzt.' },
      { t: 'Als Termin eintragen', d: 'Zweimal im Jahr, zusammen mit der Zeitumstellung.' },
    ],
    products: [],
    watchout: 'Nach einem Verdacht auf Schadsoftware immer zuerst das Gerät bereinigen — sonst wird die neue Sitzung sofort wieder mitgelesen.',
  },

  {
    id: 'digital-declutter',
    title: 'Alte Konten schließen',
    oneLiner: 'Was es nicht gibt, kann nicht geleakt werden.',
    category: 'accounts',
    effort: 90,
    recurring: 'jährlich',
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 2,
    reduces: { 'credential-stuffing': 0.2, 'account-recovery-abuse': 0.25, 'identity-theft': 0.15 },
    appliesIf: (p) => p.manyOldAccounts || p.accountCount > 60,
    why: (p) =>
      p.manyOldAccounts
        ? 'Du hast viele Konten, die du nicht mehr nutzt. Genau die sind gefährlich: schwache alte Passwörter, kein zweiter Faktor, kein Blick darauf — und trotzdem hängt deine Adresse und oft deine Anschrift daran.'
        : 'Bei über 60 Konten verlierst du zwangsläufig den Überblick. Ausmisten reduziert die Angriffsfläche dauerhaft.',
    steps: [
      { t: 'Postfach als Inventar nutzen', d: 'Nach "Willkommen", "Registrierung" und "Bestätige deine E-Mail" suchen — das ist deine tatsächliche Kontenliste.' },
      { t: 'Löschen statt liegenlassen', d: 'Die Löschfunktion findet sich meist unter Konto → Datenschutz. justdeleteme.xyz zeigt den direkten Weg je Anbieter.' },
      { t: 'Was nicht löschbar ist, entwerten', d: 'Daten durch Platzhalter ersetzen, Zahlungsmittel entfernen, neues Zufallspasswort setzen.' },
      { t: 'In Etappen arbeiten', d: 'Zehn Konten pro Sitzung. Das wird sonst nie fertig.' },
    ],
    products: [],
    watchout: 'Vor dem Löschen prüfen, ob an dem Konto Käufe, Lizenzen oder Garantien hängen.',
  },
]

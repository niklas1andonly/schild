// ---------------------------------------------------------------------------
// Bedrohungskatalog
// ---------------------------------------------------------------------------
// Jede Bedrohung liefert Faktoren statt fertiger Zahlen: `likelihood(p)` und
// `impact(p)` geben Listen von { label, delta } zurück. Die Engine summiert
// sie auf den Basiswert — und der Report kann jede Zahl aufschlüsseln
// ("+18, weil du Passwörter mehrfach verwendest"). Diese Nachvollziehbarkeit
// ist der eigentliche Punkt: ein Score ohne Begründung hilft niemandem.
//
// base / baseImpact:  Ausgangswert für eine durchschnittliche Privatperson.
// mitigations:        IDs aus actions.js, die dieses Risiko senken.
// ---------------------------------------------------------------------------

/** Faktor nur erzeugen, wenn die Bedingung zutrifft. */
const f = (cond, delta, label) => (cond ? { label, delta } : null)

export const CATEGORIES = {
  accounts: { label: 'Konten', icon: 'key' },
  malware: { label: 'Schadsoftware', icon: 'virus' },
  scam: { label: 'Betrug', icon: 'mask' },
  money: { label: 'Geld', icon: 'card' },
  network: { label: 'Netzwerk', icon: 'antenna' },
  physical: { label: 'Physisch', icon: 'phone' },
  data: { label: 'Daten', icon: 'folder' },
  privacy: { label: 'Privatsphäre', icon: 'eye' },
  family: { label: 'Familie', icon: 'family' },
}

export const THREATS = [
  // ----------------------------------------------------------- KONTEN ------
  {
    id: 'credential-stuffing',
    name: 'Kontoübernahme durch ein wiederverwendetes Passwort',
    short: 'Passwort-Wiederverwendung',
    category: 'accounts',
    base: 42,
    baseImpact: 55,
    oneLiner:
      'Ein Dienst, bei dem du registriert bist, wird gehackt. Dein Passwort landet in einer Liste. Automatisierte Systeme probieren es überall sonst durch.',
    likelihood: (p) =>
      [
        f(p.heavyReuse, 34, 'Du nutzt im Grunde dieselben zwei, drei Passwörter überall'),
        f(p.reusesPasswords && !p.heavyReuse, 22, 'Du verwendest Passwörter bei vielen Diensten mehrfach'),
        f(p.noReuse, -25, 'Jedes Konto hat ein eigenes Passwort'),
        f(p.pwStrength <= 30, 12, 'Deine Passwörter sind kurz und erratbar'),
        f(p.hasRealManager, -18, 'Du nutzt einen echten Passwortmanager'),
        f(p.accountCount > 60, 10, 'Du hast sehr viele Konten — mindestens eines davon wird geleakt'),
        f(p.manyOldAccounts, 8, 'Viele alte Konten, die du nicht mehr kontrollierst'),
        f(p.neverCheckedBreach, 9, 'Du weißt nicht, ob deine Daten bereits in Leaks stehen'),
        f(p.knownBreachIgnored, 20, 'Du weißt von einem Leak und hast nichts geändert'),
        f(p.mfaBreadth >= 70, -16, 'Zwei-Faktor stoppt einen großen Teil dieser Versuche'),
        f(p.hasPhishResistantMfa, -8, 'Passkeys oder Hardware-Schlüssel im Einsatz'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.emailOneForAll, 14, 'Eine Adresse für alles — ein Treffer öffnet alles Weitere'),
        f(p.moneyValue > 60, 12, 'Über deine Konten sind größere Beträge erreichbar'),
        f(p.hasPaypal || p.cardsStored, 8, 'Bezahldienste hängen an denselben Zugängen'),
        f(p.usesAliases, -10, 'Aliase begrenzen, was ein einzelner Leak verrät'),
        f(p.hasRecoveryCodes, -8, 'Du kommst im Ernstfall wieder rein'),
        f(p.noRecoveryPlan, 10, 'Kein Wiederherstellungsplan — Aussperrung wäre dauerhaft'),
      ].filter(Boolean),
    mitigations: ['password-manager', 'unique-passwords', 'mfa-critical', 'breach-check', 'passkeys'],
  },

  {
    id: 'phishing-credentials',
    name: 'Phishing: du gibst deine Zugangsdaten auf einer nachgebauten Seite ein',
    short: 'Phishing',
    category: 'scam',
    base: 45,
    baseImpact: 60,
    scam: true,
    oneLiner:
      'Eine Mail oder SMS erzeugt Zeitdruck. Der Link führt auf eine perfekte Kopie der echten Seite. Du merkst es erst danach — oder nie.',
    likelihood: (p) =>
      [
        f(p.clickRisk >= 60, 24, 'Du klickst Links, wenn die Geschichte gerade plausibel wirkt'),
        f(p.clickRisk <= 20, -20, 'Du klickst grundsätzlich keine Links aus Nachrichten'),
        f(p.onlineExposure > 55, 14, 'Über dich ist online viel bekannt — Angreifer können sehr gezielt formulieren'),
        f(p.isTargeted, 12, 'Du bist ein lohnenderes Ziel als der Durchschnitt'),
        f(p.wasPhished, 16, 'Du bist schon einmal darauf hereingefallen — Adressen landen auf Wiedervorlage'),
        f(p.hasPhishResistantMfa, -22, 'Passkeys lassen sich auf einer gefälschten Seite nicht abgreifen'),
        f(p.hasRealManager, -14, 'Ein Passwortmanager füllt auf der falschen Domain schlicht nichts aus'),
        f(p.smsOnlyMfa, 10, 'SMS-Codes lassen sich in Echtzeit mit abfragen'),
        f(p.isNovice, 10, 'Weniger technische Routine im Erkennen von Fälschungen'),
        f(p.isTechie, -10, 'Du erkennst technische Ungereimtheiten schneller'),
        f(p.emailOneForAll, 6, 'Deine Adresse ist überall bekannt und entsprechend häufig im Umlauf'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.reusesPasswords, 16, 'Das erbeutete Passwort passt auch anderswo'),
        f(p.mfaStrength >= 70, -18, 'Selbst mit dem Passwort kommt niemand einfach hinein'),
        f(p.noMfa, 14, 'Ohne zweiten Faktor ist das Konto sofort offen'),
        f(p.moneyValue > 60, 10, 'Es geht um relevante Beträge'),
        f(p.workSensitive, 10, 'Beruflicher Zugang könnte mit betroffen sein'),
      ].filter(Boolean),
    mitigations: ['passkeys', 'password-manager', 'mfa-critical', 'phishing-drill', 'email-aliases'],
  },

  {
    id: 'email-takeover',
    name: 'Übernahme deines E-Mail-Kontos — der Generalschlüssel',
    short: 'Mailkonto als Generalschlüssel',
    category: 'accounts',
    base: 26,
    baseImpact: 92,
    oneLiner:
      'Wer dein Postfach hat, braucht deine anderen Passwörter nicht. Er klickt bei jedem Dienst auf "Passwort vergessen".',
    likelihood: (p) =>
      [
        f(p.noMfa, 28, 'Auf dem wichtigsten Konto überhaupt fehlt der zweite Faktor'),
        f(p.mfaBreadth >= 70 && !p.hasPhishResistantMfa, -14, 'Zweiter Faktor ist aktiv'),
        f(p.hasPhishResistantMfa, -24, 'Phishing-resistenter Faktor auf dem Hauptkonto'),
        f(p.reusesPasswords, 18, 'Das Mailpasswort ist vermutlich nicht einzigartig'),
        f(p.emailIsFreemail, 8, 'Freemail-Konten werden besonders häufig automatisiert angegriffen'),
        f(p.recoveryViaPhone && !p.hasRecoveryCodes, 8, 'Wiederherstellung hängt an deiner Handynummer'),
        f(p.clickRisk >= 60, 10, 'Phishing ist der übliche Weg in ein Postfach'),
        f(p.usesCracks, 12, 'Software aus dubiosen Quellen greift gespeicherte Zugänge ab'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.emailOneForAll, 8, 'An dieser einen Adresse hängt wirklich alles'),
        f(p.moneyValue > 60, 6, 'Finanzkonten hängen an dieser Adresse'),
        f(p.hasIdScans, 5, 'Ausweisdokumente liegen im Postfach greifbar'),
        f(p.hasRecoveryCodes, -10, 'Du kannst dir den Zugang zurückholen'),
        f(p.noRecoveryPlan, 8, 'Ohne Wiederherstellungscodes wäre der Verlust endgültig'),
      ].filter(Boolean),
    mitigations: ['mfa-critical', 'recovery-codes', 'password-manager', 'email-separation', 'passkeys'],
  },

  {
    id: 'cloud-takeover',
    name: 'Übernahme deines Apple- oder Google-Kontos',
    short: 'Cloud-Konto',
    category: 'accounts',
    base: 20,
    baseImpact: 85,
    oneLiner:
      'Fotos, Standortverlauf, Backups, Notizen, gespeicherte Passwörter, die Möglichkeit deine Geräte zu sperren — alles an einem Zugang.',
    likelihood: (p) =>
      [
        f(p.noMfa, 26, 'Kein zweiter Faktor auf dem Konto, das deine Geräte kontrolliert'),
        f(p.hasPhishResistantMfa, -18, 'Starker zweiter Faktor vorhanden'),
        f(p.reusesPasswords, 14, 'Passwort vermutlich mehrfach verwendet'),
        f(p.hasEcosystemManager, 8, 'Deine Passwörter liegen im selben Konto — ein Zugang, alles offen'),
        f(p.hasAdversary, 14, 'Es gibt Personen mit Motiv und oft auch mit Vorwissen über dich'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.photosIrreplaceable, 8, 'Deine Fotos sind unersetzlich'),
        f(p.hasEcosystemManager, 10, 'Der Passwortspeicher hängt mit drin'),
        f(p.hasIntimatePhotos, 10, 'Intime Aufnahmen wären mit betroffen'),
        f(p.cloudOnlyBackup, 8, 'Die Cloud ist gleichzeitig dein einziges Backup'),
      ].filter(Boolean),
    mitigations: ['mfa-critical', 'recovery-codes', 'apple-google-hardening', 'backup-offline'],
  },

  {
    id: 'sim-swap',
    name: 'SIM-Swapping: jemand übernimmt deine Rufnummer',
    short: 'SIM-Swapping',
    category: 'accounts',
    base: 8,
    baseImpact: 78,
    oneLiner:
      'Mit deinen öffentlich auffindbaren Daten wird beim Mobilfunkanbieter eine Ersatz-SIM bestellt. Ab dann laufen alle SMS-Codes beim Angreifer auf.',
    likelihood: (p) =>
      [
        f(p.usesSmsMfa, 16, 'Du nutzt SMS als zweiten Faktor — das macht deine Nummer wertvoll'),
        f(p.recoveryViaPhone, 12, 'Kontowiederherstellung läuft über deine Nummer'),
        f(p.moneyValue > 70, 14, 'Der Aufwand lohnt sich nur bei entsprechendem Ertrag — bei dir schon'),
        f(p.cryptoSelfCustody || p.cryptoSignificant, 18, 'Krypto ist das klassische Ziel dieser Masche'),
        f(p.sharesPhone, 10, 'Deine Nummer ist öffentlich auffindbar'),
        f(p.onlineExposure > 60, 8, 'Genug öffentliche Daten für eine überzeugende Identitätsprüfung'),
        f(p.isTargeted, 10, 'Du bist ein ausgesuchtes und kein zufälliges Ziel'),
        f(p.hasPhishResistantMfa, -14, 'Deine wichtigen Konten hängen nicht an SMS'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.smsOnlyMfa, 14, 'SMS ist dein einziger zweiter Faktor'),
        f(p.tanSms, 12, 'Auch Bankfreigaben laufen über SMS'),
        f(p.hasRecoveryCodes, -12, 'Offline-Codes machen dich unabhängig von der Nummer'),
      ].filter(Boolean),
    mitigations: ['drop-sms-mfa', 'mobile-account-pin', 'recovery-codes', 'hardware-key'],
  },

  {
    id: 'account-recovery-abuse',
    name: 'Missbrauch der Kontowiederherstellung',
    short: 'Wiederherstellung als Hintertür',
    category: 'accounts',
    base: 14,
    baseImpact: 70,
    oneLiner:
      'Der Angreifer braucht dein Passwort nicht. Er nimmt den Weg, den der Anbieter für Vergessliche gebaut hat — Sicherheitsfragen, zweite Adresse, Support-Chat.',
    likelihood: (p) =>
      [
        f(p.onlineExposure > 55, 18, 'Geburtsdatum, Haustier, Geburtsort — deine "Sicherheitsfragen" stehen online'),
        f(p.hasAdversary, 22, 'Eine Person aus deinem Umfeld kennt diese Antworten sowieso'),
        f(p.manyOldAccounts, 8, 'Alte, vergessene Zweitadressen sind ein beliebter Einstieg'),
        f(p.noRecoveryPlan, 10, 'Du weißt selbst nicht, welche Wege bei dir offenstehen'),
        f(p.hasRecoveryCodes, -14, 'Du hast den Wiederherstellungsweg aktiv festgelegt'),
      ].filter(Boolean),
    impact: () => [],
    mitigations: ['recovery-codes', 'fake-security-answers', 'digital-declutter'],
  },

  // ---------------------------------------------------------- SCHADSOFTWARE -
  {
    id: 'infostealer',
    name: 'Infostealer: Malware räumt Passwörter und Sitzungen ab',
    short: 'Infostealer',
    category: 'malware',
    base: 22,
    baseImpact: 82,
    oneLiner:
      'Ein Programm läuft einmal kurz — und kopiert alle im Browser gespeicherten Passwörter und aktiven Anmeldesitzungen. Zwei-Faktor hilft dann nicht mehr, denn du warst ja schon angemeldet.',
    likelihood: (p) =>
      [
        f(p.usesCracks, 40, 'Cracks, Keygens und Mods sind der Hauptverbreitungsweg dieser Schadsoftware'),
        f(p.downloadsAnywhere && !p.usesCracks, 20, 'Downloads aus Suchergebnissen und Portalen'),
        f(p.gamesPc, 12, 'Gaming-Umfeld: gefälschte Cheats, Mods und Launcher sind Standard'),
        f(p.hasDiscord, 8, 'Über Discord werden solche Dateien besonders oft verteilt'),
        f(p.isWindows, 8, 'Windows ist das Hauptziel dieser Familie'),
        f(p.dailyAdmin, 10, 'Dein Alltagskonto hat Administratorrechte'),
        f(p.updatesBad, 8, 'Aufgeschobene Updates halten bekannte Lücken offen'),
        f(p.isMac && !p.isWindows, -8, 'Mac ist seltener betroffen, aber längst nicht ausgenommen'),
        f(p.clickRisk >= 60, 8, 'Anhänge und Links werden schnell geöffnet'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.pwManager === 'browser', 16, 'Genau der Browser-Speicher ist das erste Ziel'),
        f(p.hasRealManager, -10, 'Ein getrennter, gesperrter Tresor ist deutlich schwerer abzugreifen'),
        f(p.cryptoSelfCustody, 14, 'Wallet-Dateien werden gezielt mitgenommen'),
        f(p.workOnPrivateDevice, 12, 'Berufliche Zugänge liegen auf demselben Gerät'),
        f(p.gamingInvested, 8, 'Wertvolle Spiele-Accounts hängen an gespeicherten Sitzungen'),
      ].filter(Boolean),
    mitigations: ['no-cracks', 'password-manager', 'standard-user-account', 'updates-auto', 'session-cleanup'],
  },

  {
    id: 'ransomware',
    name: 'Verschlüsselung deiner Daten mit Lösegeldforderung',
    short: 'Ransomware',
    category: 'malware',
    base: 12,
    baseImpact: 75,
    oneLiner:
      'Alle Dateien werden verschlüsselt, inklusive der angeschlossenen Backup-Festplatte und der synchronisierten Cloud.',
    likelihood: (p) =>
      [
        f(p.usesCracks, 22, 'Raubkopien sind ein klassischer Einstiegsweg'),
        f(p.downloadsAnywhere && !p.usesCracks, 12, 'Ungeprüfte Downloadquellen'),
        f(p.updatesBad, 12, 'Offene, längst geschlossene Lücken'),
        f(p.exposedToInternet, 14, 'Aus dem Internet erreichbare Dienste bei dir zu Hause'),
        f(p.dailyAdmin, 8, 'Administratorrechte im Alltag erleichtern die Ausbreitung'),
        f(p.veryOldWindows, 14, 'Ein System ohne Sicherheitsupdates'),
        f(p.selfemployed, 6, 'Selbstständige sind ein attraktiveres Ziel als Privathaushalte'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.backupMaturity >= 80, -40, 'Ein getestetes, getrenntes Backup macht Erpressung wirkungslos'),
        f(p.backupMaturity < 30, 18, 'Praktisch kein Backup — die Daten wären weg'),
        f(p.cloudOnlyBackup, 12, 'Synchronisation ist kein Backup: die Verschlüsselung wird mitsynchronisiert'),
        f(p.photosIrreplaceable, 10, 'Unersetzliche Fotos'),
        f(p.selfemployed, 10, 'Betriebliche Unterlagen hängen mit dran'),
      ].filter(Boolean),
    mitigations: ['backup-offline', 'backup-test', 'updates-auto', 'no-cracks', 'standard-user-account'],
  },

  {
    id: 'mobile-malware',
    name: 'Schadsoftware oder missbrauchte Berechtigungen auf dem Smartphone',
    short: 'Handy-Schadsoftware',
    category: 'malware',
    base: 14,
    baseImpact: 70,
    oneLiner:
      'Eine App verlangt Bedienungshilfen-Zugriff und liest damit alles mit — auch die Banking-App und die SMS mit dem Freigabecode.',
    likelihood: (p) =>
      [
        f(p.isAndroid && p.downloadsAnywhere, 26, 'Android plus Installationen außerhalb des Play Stores'),
        f(p.isAndroid && !p.downloadsAnywhere, 6, 'Android ist offener — mit Store-Disziplin aber überschaubar'),
        f(p.isIos && !p.isAndroid, -10, 'iOS lässt fremde Installationsquellen kaum zu'),
        f(p.oldPhone, 16, 'Ein Gerät ohne Sicherheitsupdates'),
        f(p.updatesBad, 8, 'Updates werden aufgeschoben'),
        f(p.isMinor || p.hasTeens, 6, 'Spiele- und Mod-Apps aus zweifelhaften Quellen'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.tanSameDevice, 20, 'Banking und Freigabe laufen auf demselben Gerät — beides zugleich kompromittiert'),
        f(p.usesSmsMfa, 12, 'SMS-Codes werden direkt mitgelesen'),
        f(p.tanStrong, -14, 'Deine Freigabe läuft über ein separates Gerät'),
      ].filter(Boolean),
    mitigations: ['app-store-only', 'banking-second-device', 'updates-auto', 'app-permissions-review'],
  },

  // ------------------------------------------------------------- BETRUG ----
  {
    id: 'smishing',
    name: 'Betrugsnachricht per SMS oder Messenger',
    short: 'SMS-/Messenger-Betrug',
    category: 'scam',
    base: 55,
    baseImpact: 40,
    scam: true,
    oneLiner:
      'Paketzustellung, Zollgebühr, "Hallo Mama, das ist meine neue Nummer" — kurze Nachrichten, hohe Trefferquote.',
    likelihood: (p) =>
      [
        f(p.sharesPhone, 14, 'Deine Nummer ist öffentlich auffindbar'),
        f(p.clickRisk >= 60, 20, 'Du klickst, wenn die Nachricht gerade zu deinem Alltag passt'),
        f(p.clickRisk <= 20, -22, 'Du reagierst grundsätzlich nicht auf solche Nachrichten'),
        f(p.isOlder, 10, '"Hallo Mama"-Varianten zielen genau auf diese Altersgruppe'),
        f(p.hasKids, 8, 'Familienkontext macht die Masche glaubwürdiger'),
        f(p.isNovice, 8, 'Weniger Routine im Erkennen gefälschter Absender'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.hasPaypal || p.cardsStored, 8, 'Bezahldaten sind schnell eingegeben'),
        f(p.moneyValue > 60, 8, 'Es steht mehr auf dem Spiel'),
        f(p.isNovice, 6, 'Weniger Sicherheit darin, den Schaden schnell zu begrenzen'),
      ].filter(Boolean),
    mitigations: ['phishing-drill', 'family-codeword', 'app-check-habit'],
  },

  {
    id: 'support-scam',
    name: 'Falscher Support: Fernwartung und Kontrolle über deinen Rechner',
    short: 'Falscher Support',
    category: 'scam',
    base: 22,
    baseImpact: 78,
    scam: true,
    oneLiner:
      'Ein Anruf oder ein Warnfenster: angeblich Microsoft, dein Internetanbieter oder deine Bank. Am Ende installierst du selbst die Fernwartungssoftware.',
    likelihood: (p) =>
      [
        f(p.isSenior, 26, 'Diese Masche zielt gezielt auf ältere Menschen'),
        f(p.isOlder && !p.isSenior, 12, 'Die Altersgruppe wird bevorzugt angerufen'),
        f(p.answersUnknownCalls, 18, 'Du gehst bei unbekannten Nummern ran'),
        f(p.callsBackSafely, -18, 'Du rufst im Zweifel über die offizielle Nummer zurück'),
        f(p.isNovice, 16, 'Technische Drohkulissen wirken stärker, wenn man sie nicht einordnen kann'),
        f(p.isTechie, -18, 'Du durchschaust die Masche vermutlich in den ersten Sekunden'),
        f(p.supportsElderly, 8, 'Auch als Helfer:in bist du damit konfrontiert'),
        f(p.sharesPhone, 6, 'Deine Nummer liegt in Adressbeständen'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.banksOnline, 14, 'Der Rechner mit Bankzugang steht offen'),
        f(p.banksInBrowser, 8, 'Banking im Browser auf genau diesem Gerät'),
        f(p.tanStrong, -12, 'Ohne dein separates TAN-Gerät kommt niemand an eine Überweisung'),
      ].filter(Boolean),
    mitigations: ['callback-rule', 'remote-tools-off', 'banking-second-device', 'trusted-helper'],
  },

  {
    id: 'shock-call',
    name: 'Schockanruf und Enkeltrick — inzwischen mit geklonter Stimme',
    short: 'Schockanruf',
    category: 'scam',
    base: 18,
    baseImpact: 72,
    scam: true,
    oneLiner:
      'Ein Angehöriger in Not, Zeitdruck, eine dringende Zahlung. Wenige Sekunden Sprachaufnahme aus dem Netz reichen heute für eine überzeugende Stimme.',
    likelihood: (p) =>
      [
        f(p.isSenior, 28, 'Die primäre Zielgruppe dieser Masche'),
        f(p.isOlder && !p.isSenior, 12, 'Zunehmend auch diese Altersgruppe'),
        f(p.supportsElderly, 16, 'Deine Angehörigen sind gefährdet — und du bist die Person im Skript'),
        f(p.hasKids, 8, 'Familienkonstellation liefert die Geschichte'),
        f(p.socialPublic, 12, 'Öffentliche Familienbezüge und Sprachaufnahmen sind auffindbar'),
        f(p.answersUnknownCalls, 10, 'Du nimmst unbekannte Anrufe an'),
        f(p.overshare >= 3, 8, 'Namen und Beziehungen sind online nachlesbar'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.moneyValue > 50, 10, 'Es sind größere Beträge kurzfristig verfügbar'),
        f(p.isSenior, 8, 'Verluste treffen im Ruhestand besonders hart'),
      ].filter(Boolean),
    mitigations: ['family-codeword', 'callback-rule', 'trusted-helper'],
  },

  {
    id: 'investment-scam',
    name: 'Anlagebetrug über gefälschte Plattformen',
    short: 'Anlagebetrug',
    category: 'scam',
    base: 16,
    baseImpact: 85,
    scam: true,
    oneLiner:
      'Eine Werbeanzeige, ein Chat, eine Plattform mit steigenden Zahlen. Auszahlen lässt sich am Ende nichts — das ist die ganze Konstruktion.',
    likelihood: (p) =>
      [
        f(p.hasCrypto, 20, 'Krypto-Interesse ist das häufigste Einstiegssignal'),
        f(p.cryptoSignificant, 12, 'Erkennbar aktive Anlagebereitschaft'),
        f(p.hasBroker, 10, 'Du investierst ohnehin — die Ansprache passt zu dir'),
        f(p.isYoung, 8, 'Diese Altersgruppe wird über Social Ads sehr breit bespielt'),
        f(p.isSenior, 10, 'Auch gezielt angesprochen, oft telefonisch'),
        f(p.socialCount >= 3, 8, 'Viel Werbekontakt auf Social Media'),
        f(p.lostMoney, 20, '"Recovery-Scams" zielen gezielt auf frühere Opfer'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.moneyValue > 70, 12, 'Die Verlusthöhe skaliert mit dem verfügbaren Vermögen'),
        f(p.cryptoSignificant, 8, 'Krypto-Zahlungen sind praktisch nicht rückholbar'),
      ].filter(Boolean),
    mitigations: ['investment-rules', 'cooldown-rule'],
  },

  {
    id: 'romance-scam',
    name: 'Beziehungsbetrug (Love- und Pig-Butchering-Scam)',
    short: 'Beziehungsbetrug',
    category: 'scam',
    base: 10,
    baseImpact: 88,
    scam: true,
    oneLiner:
      'Über Wochen entsteht Vertrauen, oft ganz ohne Geldthema. Dann kommt die Investitionsgelegenheit oder der Notfall.',
    likelihood: (p) =>
      [
        f(p.livesAlone, 14, 'Alleinlebende werden gezielter und ausdauernder angesprochen'),
        f(p.isSenior, 12, 'Häufiges Ziel dieser langfristig angelegten Masche'),
        f(p.socialPublic, 10, 'Öffentliche Profile machen die Ansprache einfach'),
        f(p.hasCrypto, 10, 'Krypto ist der übliche Auszahlungsweg dieser Masche'),
        f(p.isYoung, 6, 'Über Dating-Apps ebenfalls stark betroffen'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.moneyValue > 60, 12, 'Die Beträge steigen mit dem, was verfügbar ist'),
        f(p.livesAlone, 6, 'Weniger Umfeld, das früh gegensteuert'),
      ].filter(Boolean),
    mitigations: ['cooldown-rule', 'trusted-helper', 'investment-rules'],
  },

  {
    id: 'fake-shop',
    name: 'Fake-Shops und Betrug auf Kleinanzeigen-Plattformen',
    short: 'Fake-Shop',
    category: 'scam',
    base: 40,
    baseImpact: 32,
    scam: true,
    oneLiner:
      'Ein Angebot deutlich unter Marktpreis, Zahlung per Überweisung oder "Käuferschutz-Link", der in Wahrheit dein Konto abräumt.',
    likelihood: (p) =>
      [
        f(p.isYoung, 12, 'Kleinanzeigen und Social-Shopping werden intensiv genutzt'),
        f(p.clickRisk >= 60, 14, 'Zahlungslinks werden schnell geöffnet'),
        f(p.socialCount >= 3, 8, 'Viel Kontakt mit Shopping-Anzeigen'),
        f(p.hasKids, 6, 'Anlassbezogene Einkäufe erhöhen die Kontaktfläche'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.hasPaypal, -8, 'Käuferschutz federt einen Teil ab — wenn du ihn nicht umgehst'),
        f(p.cardsStored, 6, 'Kartendaten sind schnell eingegeben'),
      ].filter(Boolean),
    mitigations: ['payment-rules', 'virtual-cards', 'app-check-habit'],
  },

  {
    id: 'sextortion',
    name: 'Erpressung mit angeblichem oder echtem intimem Material',
    short: 'Sextortion',
    category: 'privacy',
    base: 26,
    baseImpact: 45,
    scam: true,
    oneLiner:
      'Meist eine reine Bluff-Mail mit einem alten geleakten Passwort als "Beweis". Manchmal aber auch echt — dann ist es sehr ernst.',
    likelihood: (p) =>
      [
        f(p.neverCheckedBreach, 10, 'Alte Leak-Passwörter machen die Drohung glaubwürdig'),
        f(p.isYoung, 14, 'Junge Erwachsene und Jugendliche sind die Hauptzielgruppe der echten Variante'),
        f(p.hasTeens, 12, 'Auch Jugendliche im Haushalt sind betroffen'),
        f(p.hasIntimatePhotos, 16, 'Es existiert Material, das tatsächlich abfließen könnte'),
        f(p.socialPublic, 8, 'Offene Profile erleichtern die Kontaktaufnahme'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.hasIntimatePhotos, 30, 'Es geht nicht um einen Bluff, sondern um reales Material'),
        f(p.isTargeted, 10, 'Öffentliche Rolle erhöht den Druck erheblich'),
        f(p.hasTeens, 12, 'Für Jugendliche ist die psychische Belastung massiv'),
      ].filter(Boolean),
    mitigations: ['sextortion-response', 'sensitive-data-cleanup', 'family-talk'],
  },

  // ---------------------------------------------------------------- GELD ---
  {
    id: 'banking-fraud',
    name: 'Betrug beim Online-Banking durch erschlichene Freigabe',
    short: 'Banking-Betrug',
    category: 'money',
    base: 20,
    baseImpact: 80,
    oneLiner:
      'Nicht die Bank wird gehackt, sondern du wirst überredet, eine Zahlung selbst freizugeben — am Telefon, in Echtzeit, mit erstaunlich guten Argumenten.',
    likelihood: (p) =>
      [
        f(p.tanSameDevice, 16, 'Freigabe und Banking laufen auf einem einzigen Gerät'),
        f(p.tanSms, 14, 'SMS-TAN ist das schwächste noch verbreitete Verfahren'),
        f(p.tanStrong, -22, 'Dein Freigabeverfahren ist getrennt und deutlich robuster'),
        f(p.answersUnknownCalls, 14, 'Der Einstieg ist fast immer ein Anruf'),
        f(p.clickRisk >= 60, 12, 'Bank-Phishing als Vorstufe'),
        f(p.isSenior, 12, 'Bevorzugte Zielgruppe'),
        f(p.isNovice, 8, 'Die Legende klingt technisch plausibel'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.moneyValue > 70, 14, 'Hohe verfügbare Beträge'),
        f(p.moneyValue < 30, -12, 'Es ist schlicht wenig zu holen'),
      ].filter(Boolean),
    mitigations: ['banking-second-device', 'callback-rule', 'transfer-limits', 'banking-alerts'],
  },

  {
    id: 'card-fraud',
    name: 'Missbrauch von Karten- und Zahlungsdaten',
    short: 'Kartenmissbrauch',
    category: 'money',
    base: 38,
    baseImpact: 28,
    oneLiner:
      'Deine Kartendaten liegen bei Dutzenden Händlern. Einer davon wird kompromittiert — und du merkst es erst auf der Abrechnung.',
    likelihood: (p) =>
      [
        f(p.cardsStored, 22, 'Kartendaten sind in vielen Shops gespeichert'),
        f(p.paymentServices >= 3, 10, 'Viele Bezahldienste, viele Angriffsflächen'),
        f(p.lostMoney, 12, 'Es ist dir bereits passiert'),
        f(p.accountCount > 60, 8, 'Sehr viele Händlerkonten'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.isNovice, 6, 'Reklamation und Rückbuchung kosten Nerven'),
        f(p.moneyValue > 70, 5, 'Höhere Limits, höhere mögliche Beträge'),
      ].filter(Boolean),
    mitigations: ['virtual-cards', 'banking-alerts', 'payment-rules', 'transfer-limits'],
  },

  {
    id: 'crypto-theft',
    name: 'Diebstahl von Kryptowährungen',
    short: 'Krypto-Diebstahl',
    category: 'money',
    base: 6,
    baseImpact: 90,
    oneLiner:
      'Eine gefälschte Wallet-App, eine bösartige Signatur, eine abfotografierte Seed-Phrase. Es gibt keine Rückbuchung und keine Hotline.',
    condition: (p) => p.hasCrypto,
    likelihood: (p) =>
      [
        f(p.seedExposed, 34, 'Deine Seed-Phrase liegt digital erreichbar'),
        f(p.seedSafe, -22, 'Seed offline und getrennt verwahrt'),
        f(p.crypto === 'hot', 18, 'Hot Wallet auf einem alltäglich genutzten Gerät'),
        f(p.crypto === 'hardware' || p.cryptoSignificant, -10, 'Hardware-Wallet trennt den Schlüssel vom Gerät'),
        f(p.crypto === 'exchange', -6, 'Auf einer Börse — dafür trägst du das Anbieterrisiko'),
        f(p.usesCracks, 20, 'Infostealer suchen gezielt nach Wallet-Dateien'),
        f(p.clickRisk >= 60, 14, 'Drainer-Seiten arbeiten fast ausschließlich über Links'),
        f(p.usesSmsMfa, 10, 'SMS-Faktor auf der Börse ist SIM-Swapping-anfällig'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.cryptoSignificant, 10, 'Ein relevanter Teil deines Vermögens'),
        f(p.crypto === 'exchange', -12, 'Börsen können in Einzelfällen eingreifen — verlassen solltest du dich nicht darauf'),
      ].filter(Boolean),
    mitigations: ['seed-offline', 'hardware-wallet', 'crypto-hygiene', 'drop-sms-mfa'],
  },

  // ------------------------------------------------------------ NETZWERK ---
  {
    id: 'iot-exposure',
    name: 'Angreifbare Smart-Home-Geräte und Kameras',
    short: 'Smart Home',
    category: 'network',
    base: 14,
    baseImpact: 55,
    condition: (p) => p.smartHomeCount > 0 || p.hasNas,
    oneLiner:
      'Billige Kameras, alte Geräte, Standardpasswörter — und plötzlich schaut jemand in deine Wohnung oder nutzt dein Gerät für andere Angriffe.',
    likelihood: (p) =>
      [
        f(p.smartHomeCount >= 5, 16, 'Viele vernetzte Geräte, viele Hersteller, viele Update-Zyklen'),
        f(p.hasCameras, 14, 'Kameras sind das lohnendste und am häufigsten angegriffene Ziel'),
        f(p.exposedToInternet, 24, 'Etwas bei dir ist direkt aus dem Internet erreichbar'),
        f(p.routerDefault, 12, 'Router im Auslieferungszustand'),
        f(p.routerNeverUpdated, 12, 'Der Router bekommt keine Updates'),
        f(p.guestWifi, -12, 'Getrenntes Netz für Gäste und Geräte'),
        f(p.nasRemote, 14, 'Netzwerkspeicher von außen erreichbar'),
        f(p.reusesPasswords, 8, 'Auch Geräte-Konten hängen an denselben Passwörtern'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.hasIndoorCam, 24, 'Eine Kamera in deiner Wohnung — das ist ein Privatsphäre-Totalschaden'),
        f(p.hasSmartLock, 20, 'Ein smartes Türschloss verbindet digitales mit physischem Risiko'),
        f(p.hasKids, 10, 'Kinder sind mit im Bild'),
        f(p.hasNas, 12, 'Auf dem Netzwerkspeicher liegen deine Daten'),
      ].filter(Boolean),
    mitigations: ['iot-segment', 'router-hardening', 'close-remote-access', 'iot-passwords'],
  },

  {
    id: 'router-compromise',
    name: 'Kompromittierung deines Routers',
    short: 'Router',
    category: 'network',
    base: 10,
    baseImpact: 68,
    oneLiner:
      'Der Router sieht jede Verbindung im Haushalt. Wer ihn kontrolliert, kann Datenverkehr umleiten — ohne dass ein einziges deiner Geräte infiziert sein muss.',
    likelihood: (p) =>
      [
        f(p.routerDefault, 20, 'Standardkonfiguration und ursprüngliches Passwort'),
        f(p.routerNeverUpdated, 22, 'Nie aktualisiert — Router-Lücken bleiben jahrelang offen'),
        f(p.routerManaged, -18, 'Du pflegst das Gerät aktiv'),
        f(p.exposedToInternet, 14, 'Fernzugriff oder Portfreigaben aktiv'),
        f(p.sharedWifi, 10, 'Weitere Personen im selben Netz'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.banksInBrowser, 10, 'Banking läuft über genau dieses Netz'),
        f(p.homeoffice, 12, 'Auch die Arbeit läuft durch diesen Router'),
        f(p.smartHomeCount >= 4, 8, 'Alle vernetzten Geräte hängen dahinter'),
      ].filter(Boolean),
    mitigations: ['router-hardening', 'close-remote-access', 'iot-segment'],
  },

  {
    id: 'public-network',
    name: 'Angriffe in fremden Netzen und über bösartige Hotspots',
    short: 'Öffentliches WLAN',
    category: 'network',
    base: 12,
    baseImpact: 38,
    oneLiner:
      'Das Risiko ist heute geringer als sein Ruf — fast alles ist verschlüsselt. Was bleibt: gefälschte Anmeldeseiten, Umleitungen und der Blick über deine Schulter.',
    likelihood: (p) =>
      [
        f(p.publicWifiScore >= 70, 20, 'Du nutzt öffentliche Netze regelmäßig'),
        f(p.travelsOften, 14, 'Viel unterwegs, viele fremde Netze'),
        f(p.publicWifiScore <= 20, -12, 'Du nutzt praktisch nur mobile Daten'),
        f(p.hasVpn, -14, 'Ein VPN nimmt dem fremden Netz die Einsicht'),
        f(p.freeVpn, 12, 'Ein kostenloses VPN verlagert das Vertrauen nur zu einem schlechteren Anbieter'),
        f(p.updatesBad, 8, 'Ungepatchte Geräte in fremden Netzen'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.workSensitive, 12, 'Berufliche Daten unterwegs'),
        f(p.banksInBrowser && p.travelsOften, 8, 'Banking auch von unterwegs'),
      ].filter(Boolean),
    mitigations: ['tethering-habit', 'vpn-when-traveling', 'privacy-screen'],
  },

  // ------------------------------------------------------------ PHYSISCH ---
  {
    id: 'device-theft',
    name: 'Verlust oder Diebstahl eines Geräts mit Datenzugriff',
    short: 'Geräteverlust',
    category: 'physical',
    base: 24,
    baseImpact: 60,
    oneLiner:
      'Der teure Teil ist nicht das Gerät. Der teure Teil ist ein unverschlüsselter Rechner oder ein Handy, das jemand beim Entsperren beobachtet hat.',
    likelihood: (p) =>
      [
        f(p.travelsOften, 20, 'Viel unterwegs — Bahn, Hotel, Flughafen, Café'),
        f(p.travelScore <= 15, -12, 'Du bist selten unterwegs'),
        f(p.lostDevice, 16, 'Ist dir schon einmal passiert'),
        f(p.deviceCount >= 9, 8, 'Viele Geräte, mehr Gelegenheiten'),
        f(p.isYoung, 6, 'Mehr Zeit in öffentlichen Räumen'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.noLock, 30, 'Dein Handy ist überhaupt nicht gesperrt'),
        f(p.lockScore >= 90, -18, 'Starke Sperre plus Biometrie'),
        f(p.notEncrypted, 22, 'Die Festplatte ist unverschlüsselt — die Anmeldung ist dann nur Dekoration'),
        f(p.encrypted, -14, 'Verschlüsselte Festplatte'),
        f(p.hasPasswordNote, 20, 'Eine Passwortliste liegt auf dem Gerät'),
        f(p.tanSameDevice, 12, 'Banking und Freigabe auf demselben Gerät'),
        f(p.backupMaturity < 30, 10, 'Ohne Backup ist mit dem Gerät auch der Inhalt weg'),
      ].filter(Boolean),
    mitigations: ['device-encryption', 'strong-lockscreen', 'find-my-device', 'backup-offline'],
  },

  // --------------------------------------------------------------- DATEN ---
  {
    id: 'data-loss',
    name: 'Datenverlust ganz ohne Angreifer',
    short: 'Datenverlust',
    category: 'data',
    base: 35,
    baseImpact: 55,
    oneLiner:
      'Festplatte defekt, Handy im Wasser, versehentlich gelöscht, Konto gesperrt. Der häufigste digitale Totalschaden hat gar keinen Täter.',
    likelihood: (p) =>
      [
        f(p.backupMaturity < 25, 26, 'Es existiert praktisch kein Backup'),
        f(p.backupMaturity >= 80, -26, 'Mehrere Kopien, davon eine getrennt'),
        f(p.cloudOnlyBackup, 12, 'Synchronisation ersetzt kein Backup — gelöscht ist überall gelöscht'),
        f(p.backupUntested, 10, 'Das Backup wurde nie auf Rückspielbarkeit geprüft'),
        f(p.deviceCount >= 9, 6, 'Viele Geräte, verteilte Daten'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.photosIrreplaceable, 24, 'Deine Fotos sind unersetzlich'),
        f(p.hasFinancialDocs, 10, 'Wichtige Unterlagen liegen nur digital vor'),
        f(p.selfemployed, 12, 'Geschäftsunterlagen hängen mit dran'),
      ].filter(Boolean),
    mitigations: ['backup-offline', 'backup-test', 'photo-archive'],
  },

  {
    id: 'identity-theft',
    name: 'Identitätsdiebstahl — Bestellungen und Verträge in deinem Namen',
    short: 'Identitätsdiebstahl',
    category: 'data',
    base: 16,
    baseImpact: 72,
    oneLiner:
      'Mit Name, Geburtsdatum, Adresse und einer Ausweiskopie lassen sich Konten eröffnen und Waren bestellen. Aufräumen dauert Monate.',
    likelihood: (p) =>
      [
        f(p.hasIdScans, 22, 'Ausweiskopien liegen digital greifbar'),
        f(p.onlineExposure > 55, 14, 'Name, Geburtsdatum und Adresse sind öffentlich zusammenführbar'),
        f(p.sharesAddress, 10, 'Deine Adresse ist auffindbar'),
        f(p.neverCheckedBreach, 8, 'Unbekannt, welche Daten bereits kursieren'),
        f(p.incidents?.includes('identity'), 22, 'Ist dir bereits passiert'),
        f(p.usesAliases, -8, 'Getrennte Adressen erschweren die Profilbildung'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.hasIdScans, 10, 'Mit echter Ausweiskopie wird es deutlich ernster'),
        f(p.selfemployed, 8, 'Auch geschäftliche Bonität betroffen'),
      ].filter(Boolean),
    mitigations: ['sensitive-data-cleanup', 'schufa-check', 'breach-check', 'data-broker-optout'],
  },

  {
    id: 'doxxing',
    name: 'Zusammenführung deiner Daten, Doxxing und Belästigung',
    short: 'Doxxing',
    category: 'privacy',
    base: 12,
    baseImpact: 58,
    oneLiner:
      'Einzeln ist jede Information harmlos. Zusammengesetzt ergibt sich Wohnort, Tagesablauf, Arbeitgeber und Familie.',
    likelihood: (p) =>
      [
        f(p.socialReach, 22, 'Öffentliche Reichweite zieht Konflikte an'),
        f(p.hasAdversary, 30, 'Es gibt konkret Personen mit Motiv'),
        f(p.wasHarassed, 24, 'Du warst bereits betroffen'),
        f(p.overshare >= 4, 16, 'Viele einzelne Details, die sich verknüpfen lassen'),
        f(p.sharesAddress, 12, 'Wohnort öffentlich'),
        f(p.socialPublic, 10, 'Klarname öffentlich'),
        f(p.job === 'creator' || p.job === 'public', 10, 'Beruflich exponiert'),
        f(p.usesAliases, -8, 'Getrennte Identitäten erschweren die Verknüpfung'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.hasKids, 14, 'Auch die Familie wäre betroffen'),
        f(p.hasAdversary, 16, 'Reales Eskalationspotenzial bis in die physische Welt'),
        f(p.isTargeted, 8, 'Öffentliche Rolle verstärkt die Folgen'),
      ].filter(Boolean),
    mitigations: ['osint-selfcheck', 'social-lockdown', 'data-broker-optout', 'address-hygiene'],
  },

  // -------------------------------------------------------------- GAMING ---
  {
    id: 'gaming-takeover',
    name: 'Übernahme deiner Gaming- und Community-Konten',
    short: 'Gaming-Account',
    category: 'accounts',
    base: 25,
    baseImpact: 45,
    condition: (p) => p.games,
    oneLiner:
      'Ein Freund schreibt dir auf Discord, du sollst für sein Turnier abstimmen. Der Link stiehlt deinen Sitzungs-Token — kein Passwort, kein zweiter Faktor nötig.',
    likelihood: (p) =>
      [
        f(p.hasDiscord, 20, 'Discord ist der zentrale Verbreitungsweg dieser Masche'),
        f(p.hasSteam, 14, 'Steam-Konten haben einen etablierten Schwarzmarkt'),
        f(p.tradesItems, 22, 'Du handelst — damit bist du ein ausgesuchtes Ziel'),
        f(p.gamingInvested, 16, 'Ein wertvoller Account lohnt gezielten Aufwand'),
        f(p.usesCracks, 20, 'Cheats und Cracks liefern Sitzungsdaten frei Haus'),
        f(p.isYoung || p.isMinor, 10, 'Die Ansprache ist genau auf diese Gruppe zugeschnitten'),
        f(p.reusesPasswords, 12, 'Wiederverwendete Passwörter im Spiele-Umfeld'),
        f(p.hasPhishResistantMfa, -14, 'Starker zweiter Faktor auf den Plattformen'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.gamingInvested, 20, 'Jahre an Fortschritt und Käufen'),
        f(p.tradesItems, 14, 'Handelbare Werte im Inventar'),
        f(p.cardsStored, 10, 'Hinterlegte Zahlungsmittel auf der Plattform'),
        f(p.reusesPasswords, 12, 'Von hier führt der Weg zu deinen wichtigeren Konten'),
      ].filter(Boolean),
    mitigations: ['gaming-hardening', 'session-cleanup', 'unique-passwords', 'no-cracks'],
  },

  // -------------------------------------------------------------- ARBEIT ---
  {
    id: 'work-bleed',
    name: 'Dein privates Gerät wird zum Einfallstor bei deinem Arbeitgeber',
    short: 'Arbeit & Privat vermischt',
    category: 'data',
    base: 14,
    baseImpact: 70,
    condition: (p) => p.homeoffice || p.mixesWork,
    oneLiner:
      'Der Angriff trifft dich privat — die Folgen treffen deinen Arbeitgeber. Und arbeitsrechtlich dann wieder dich.',
    likelihood: (p) =>
      [
        f(p.workOnPrivateDevice, 24, 'Du arbeitest auf einem privaten Gerät'),
        f(p.mixesWork, 12, 'Arbeit und Privates vermischen sich'),
        f(p.fullyRemote, 10, 'Vollständig remote — das Heimnetz ist die Arbeitsumgebung'),
        f(p.workCritical, 16, 'Du hast Zugriff auf kritische Systeme oder Daten'),
        f(p.leaksToAi, 10, 'Berufliche Inhalte landen in externen KI-Diensten'),
        f(p.routerDefault, 8, 'Das Heimnetz ist nicht abgesichert'),
        f(p.usesCracks, 12, 'Software aus zweifelhaften Quellen auf demselben Gerät'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.workCritical, 20, 'Zugriff auf kritische Systeme'),
        f(p.workSensitive, 10, 'Personenbezogene Daten Dritter'),
        f(p.job === 'it', 10, 'Erhöhte Rechte machen dich zum lohnenden Zwischenziel'),
      ].filter(Boolean),
    mitigations: ['work-separation', 'ai-data-rules', 'router-hardening', 'report-early'],
  },

  // -------------------------------------------------------------- FAMILIE --
  {
    id: 'child-risk',
    name: 'Risiken für die Kinder im Haushalt',
    short: 'Kinder',
    category: 'family',
    base: 30,
    baseImpact: 65,
    condition: (p) => p.hasKids,
    oneLiner:
      'Kontaktanbahnung in Spielechats, Betrug mit Ingame-Währung, Mobbing, ungewollte Käufe — und Geräte, die im selben Netz hängen wie deine.',
    likelihood: (p) =>
      [
        f(p.kidsUnmanaged, 24, 'Eigene Geräte ohne eingerichtete Schutzeinstellungen'),
        f(p.hasTeens, 16, 'Jugendliche bewegen sich weitgehend unbeobachtet online'),
        f(p.hasSmallKids, 10, 'Kleine Kinder mit Zugang zu Spielen und Videoplattformen'),
        f(p.sharesKids, 14, 'Fotos deiner Kinder sind öffentlich auffindbar'),
        f(p.socialPublic, 8, 'Familienbezüge sind öffentlich'),
      ].filter(Boolean),
    impact: (p) =>
      [
        f(p.hasTeens, 10, 'Belastung und Folgen sind in dem Alter erheblich'),
        f(p.cardsStored, 8, 'Hinterlegte Zahlungsmittel auf gemeinsam genutzten Geräten'),
      ].filter(Boolean),
    mitigations: ['family-setup', 'family-talk', 'family-codeword', 'kids-accounts'],
  },
]

/** Bedrohungen, die für dieses Profil überhaupt zutreffen. */
export function applicableThreats(profile) {
  return THREATS.filter((t) => !t.condition || t.condition(profile))
}

export const THREAT_BY_ID = Object.fromEntries(THREATS.map((t) => [t.id, t]))

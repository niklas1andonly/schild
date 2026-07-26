// ---------------------------------------------------------------------------
// Security Twin — digitaler Zwilling und Angriffskettensimulation
// ---------------------------------------------------------------------------
// Aus den Antworten wird ein Modell der Person gebaut: welche Werte existieren,
// wie gut sie verteidigt sind, und welche Übergänge zwischen ihnen möglich
// sind. Anschließend wird gesucht, welcher Weg für einen Angreifer am
// wahrscheinlichsten zum Ziel führt.
//
// Das entspricht dem Vorgehen bei einem Penetrationstest: Einstiegspunkt →
// Ausweitung → Ziel. Nur eben für eine Privatperson statt für ein Netzwerk.
//
// Alle Wahrscheinlichkeiten sind Modellwerte, keine Messwerte. Sie sind so
// kalibriert, dass die *Reihenfolge* der Wege belastbar ist — nicht, damit
// jemand die absoluten Prozentzahlen für bare Münze nimmt.
// ---------------------------------------------------------------------------

const clamp01 = (n) => Math.max(0.02, Math.min(0.97, n))

// --- Werte (Knoten im Graph) ----------------------------------------------
// value:   Was ist der Zugriff für einen Angreifer wert? (0..100)
// present: Existiert dieser Wert bei dieser Person überhaupt?
const ASSETS = [
  {
    id: 'email',
    label: 'E-Mail-Konto',
    icon: 'mail',
    role: 'Generalschlüssel',
    present: () => true,
    value: (p) => 92 + (p.emailOneForAll ? 6 : 0),
    note: 'Über "Passwort vergessen" führt von hier ein Weg zu fast jedem anderen Konto.',
  },
  {
    id: 'vault',
    label: 'Passwort-Speicher',
    icon: 'lock',
    role: 'Generalschlüssel',
    present: (p) => p.hasAnyManager,
    value: () => 95,
    note: 'Enthält per Definition den Zugang zu allem anderen.',
  },
  {
    id: 'phone',
    label: 'Smartphone',
    icon: 'phone',
    role: 'Gerät',
    present: (p) => p.phoneOs !== 'none',
    value: (p) => 78 + (p.tanSameDevice ? 12 : 0),
    note: 'Zweiter Faktor, Banking-Freigabe und Postfach in einem Gehäuse.',
  },
  {
    id: 'computer',
    label: 'Computer',
    icon: 'laptop',
    role: 'Gerät',
    present: (p) => p.hasComputer,
    value: () => 80,
    note: 'Gespeicherte Sitzungen und Passwörter, oft ohne weitere Rückfrage nutzbar.',
  },
  {
    id: 'sim',
    label: 'Rufnummer',
    icon: 'wifi',
    role: 'Identität',
    present: (p) => p.phoneOs !== 'none',
    value: (p) => 45 + (p.usesSmsMfa ? 25 : 0) + (p.recoveryViaPhone ? 15 : 0),
    note: 'Wird von vielen Diensten immer noch als Identitätsnachweis behandelt.',
  },
  {
    id: 'cloud',
    label: 'Apple- / Google-Konto',
    icon: 'cloud',
    role: 'Generalschlüssel',
    present: () => true,
    value: (p) => 85 + (p.hasEcosystemManager ? 10 : 0),
    note: 'Fotos, Backups, Standort, Gerätesteuerung — und häufig der Passwortspeicher.',
  },
  {
    id: 'bank',
    label: 'Bankkonto',
    icon: 'bank',
    role: 'Ziel',
    present: (p) => p.banksOnline,
    value: (p) => Math.min(98, 55 + p.moneyValue * 0.45),
    note: 'Das übliche Endziel finanziell motivierter Angriffe.',
  },
  {
    id: 'payment',
    label: 'Bezahldienste',
    icon: 'card',
    role: 'Ziel',
    present: (p) => p.paymentServices > 0,
    value: (p) => 55 + (p.cardsStored ? 15 : 0),
    note: 'Schneller monetarisierbar als ein Bankkonto und oft schwächer geschützt.',
  },
  {
    id: 'crypto',
    label: 'Krypto-Bestand',
    icon: 'bitcoin',
    role: 'Ziel',
    present: (p) => p.hasCrypto,
    value: (p) => (p.cryptoSignificant ? 96 : 70),
    note: 'Unwiderruflich und ohne Beschwerdestelle — das attraktivste Ziel überhaupt.',
  },
  {
    id: 'gaming',
    label: 'Gaming-Konten',
    icon: 'gamepad',
    role: 'Ziel',
    present: (p) => p.games,
    value: (p) => (p.gamingInvested ? 68 : 42) + (p.tradesItems ? 12 : 0),
    note: 'Direkt handelbar. Oft auch der bequemste Einstieg in alles Übrige.',
  },
  {
    id: 'chat',
    label: 'Messenger & Discord',
    icon: 'chat',
    role: 'Brücke',
    present: (p) => p.hasDiscord || p.socialCount > 0,
    value: () => 48,
    note: 'Vertrauenswürdiger Absender für den nächsten Schritt — bei dir und bei deinen Kontakten.',
  },
  {
    id: 'social',
    label: 'Social-Media-Konten',
    icon: 'camera',
    role: 'Ziel',
    present: (p) => p.socialCount > 0,
    value: (p) => 45 + (p.socialReach ? 25 : 0),
    note: 'Reichweite, Vertrauen und ein vollständiges Bild deines Umfelds.',
  },
  {
    id: 'identity',
    label: 'Ausweisdaten & Dokumente',
    icon: 'id',
    role: 'Ziel',
    present: (p) => p.sensitiveDocs > 0,
    value: (p) => 55 + (p.hasIdScans ? 25 : 0),
    note: 'Grundlage für Verträge und Konten in deinem Namen.',
  },
  {
    id: 'work',
    label: 'Beruflicher Zugang',
    icon: 'building',
    role: 'Ziel',
    present: (p) => p.homeoffice || p.mixesWork,
    value: (p) => (p.workCritical ? 95 : p.workSensitive ? 75 : 50),
    note: 'Für einen Angreifer der wertvollste Sprung — und für dich der mit den größten Folgen.',
  },
  {
    id: 'home',
    label: 'Heimnetz & smarte Geräte',
    icon: 'home',
    role: 'Gerät',
    present: (p) => p.smartHomeCount > 0 || p.hasNas,
    value: (p) => 40 + (p.hasIndoorCam ? 25 : 0) + (p.hasNas ? 15 : 0),
    note: 'Kaum überwacht, selten aktualisiert, dauerhaft online.',
  },
]

// --- Einstiegspunkte -------------------------------------------------------
// Wie beginnt der Angriff realistisch? p = Wahrscheinlichkeit, dass dieser
// Einstieg bei dieser Person innerhalb eines überschaubaren Zeitraums gelingt.
const ENTRIES = [
  {
    id: 'entry-stuffing',
    label: 'Automatisierter Anmeldeversuch mit geleakten Zugangsdaten',
    target: 'email',
    icon: 'robot',
    detail:
      'Kein Mensch sucht sich dich aus. Ein Skript probiert Zugangsdaten aus alten Leaks gegen tausende Dienste durch — deine sind darunter.',
    p: (p) =>
      clamp01(
        0.1 +
          (p.heavyReuse ? 0.42 : p.reusesPasswords ? 0.28 : 0) +
          (p.knownBreachIgnored ? 0.15 : 0) +
          (p.pwStrength < 40 ? 0.1 : 0) -
          (p.mfaBreadth >= 70 ? 0.22 : 0) -
          (p.hasRealManager ? 0.1 : 0),
      ),
    stoppedBy: ['unique-passwords', 'password-manager', 'mfa-critical'],
  },
  {
    id: 'entry-phishing',
    label: 'Phishing-Mail mit nachgebauter Anmeldeseite',
    target: 'email',
    icon: 'hook',
    detail:
      'Eine Nachricht mit Zeitdruck, ein Link, eine perfekte Kopie der echten Seite. Der Code aus der SMS wird gleich mit abgefragt und in Echtzeit weitergereicht.',
    p: (p) =>
      clamp01(
        0.12 +
          (p.clickRisk >= 60 ? 0.3 : p.clickRisk >= 40 ? 0.16 : 0) +
          (p.onlineExposure > 55 ? 0.1 : 0) +
          (p.wasPhished ? 0.12 : 0) -
          (p.hasPhishResistantMfa ? 0.3 : 0) -
          (p.hasRealManager ? 0.08 : 0) -
          (p.clickRisk <= 20 ? 0.12 : 0),
      ),
    stoppedBy: ['passkeys', 'phishing-drill', 'password-manager'],
  },
  {
    id: 'entry-stealer',
    label: 'Infostealer über einen Download',
    target: 'computer',
    icon: 'virus',
    detail:
      'Ein Programm läuft einmal kurz und kopiert alle gespeicherten Passwörter und aktiven Anmeldesitzungen. Danach ist der zweite Faktor wirkungslos, weil du ja bereits angemeldet warst.',
    p: (p) =>
      clamp01(
        0.05 +
          (p.usesCracks ? 0.45 : 0) +
          (p.downloadsAnywhere && !p.usesCracks ? 0.18 : 0) +
          (p.gamesPc ? 0.08 : 0) +
          (p.dailyAdmin ? 0.06 : 0) -
          (p.downloadRisk <= 10 ? 0.06 : 0),
      ),
    requires: (p) => p.hasComputer,
    stoppedBy: ['no-cracks', 'standard-user-account', 'password-manager'],
  },
  {
    id: 'entry-chat',
    label: 'Nachricht von einem bereits übernommenen Kontakt',
    target: 'chat',
    icon: 'chat',
    detail:
      'Ein Freund schreibt dir — sein Konto gehört längst jemand anderem. Die Bitte klingt harmlos: abstimmen, kurz reinschauen, etwas bestätigen.',
    p: (p) =>
      clamp01(
        0.08 + (p.hasDiscord ? 0.24 : 0) + (p.games ? 0.1 : 0) + (p.isYoung ? 0.08 : 0) + (p.clickRisk >= 60 ? 0.12 : 0),
      ),
    requires: (p) => p.hasDiscord || p.socialCount > 0,
    stoppedBy: ['gaming-hardening', 'phishing-drill', 'session-cleanup'],
  },
  {
    id: 'entry-call',
    label: 'Anruf mit gefälschter Rufnummer',
    target: 'computer',
    icon: 'call',
    detail:
      'Angeblich die Bank, der Support oder ein Angehöriger in Not. Die angezeigte Nummer stimmt sogar — sie ist frei fälschbar.',
    p: (p) =>
      clamp01(
        0.05 +
          (p.answersUnknownCalls ? 0.2 : 0) +
          (p.isSenior ? 0.22 : p.isOlder ? 0.1 : 0) +
          (p.isNovice ? 0.12 : 0) -
          (p.callsBackSafely ? 0.18 : 0) -
          (p.isTechie ? 0.1 : 0),
      ),
    stoppedBy: ['callback-rule', 'remote-tools-off', 'trusted-helper'],
  },
  {
    id: 'entry-sim',
    label: 'Übernahme deiner Rufnummer beim Mobilfunkanbieter',
    target: 'sim',
    icon: 'wifi',
    detail:
      'Mit öffentlich auffindbaren Daten wird eine Ersatzkarte bestellt. Danach laufen alle SMS-Codes beim Angreifer auf — und dein Handy hat kein Netz mehr.',
    p: (p) =>
      clamp01(
        0.02 +
          (p.usesSmsMfa ? 0.1 : 0) +
          (p.moneyValue > 70 ? 0.08 : 0) +
          (p.cryptoSelfCustody ? 0.12 : 0) +
          (p.onlineExposure > 60 ? 0.05 : 0) +
          (p.isTargeted ? 0.06 : 0),
      ),
    stoppedBy: ['mobile-account-pin', 'drop-sms-mfa'],
  },
  {
    id: 'entry-device',
    label: 'Verlust oder Diebstahl eines Geräts',
    target: 'phone',
    icon: 'backpack',
    detail:
      'Kein gezielter Angriff — eine Gelegenheit. Entscheidend ist allein, was jemand danach damit anfangen kann.',
    p: (p) =>
      clamp01(
        0.06 + (p.travelsOften ? 0.12 : 0) + (p.lostDevice ? 0.1 : 0) + (p.noLock ? 0.12 : 0) - (p.lockScore >= 90 ? 0.05 : 0),
      ),
    stoppedBy: ['strong-lockscreen', 'device-encryption', 'find-my-device'],
  },
  {
    id: 'entry-iot',
    label: 'Angriff auf ein erreichbares Gerät im Heimnetz',
    target: 'home',
    icon: 'antenna',
    detail:
      'Das gesamte Internet wird permanent nach erreichbaren Geräten abgesucht. Gefunden wirst du nicht, weil dich jemand sucht, sondern weil du erreichbar bist.',
    p: (p) =>
      clamp01(
        0.03 + (p.exposedToInternet ? 0.25 : 0) + (p.routerNeverUpdated ? 0.1 : 0) + (p.hasCameras ? 0.06 : 0) + (p.smartHomeCount >= 5 ? 0.05 : 0),
      ),
    requires: (p) => p.smartHomeCount > 0 || p.hasNas,
    stoppedBy: ['close-remote-access', 'router-hardening', 'iot-segment'],
  },
]

// --- Übergänge zwischen Werten --------------------------------------------
// Jede Kante: "wenn A kompromittiert ist, wie leicht folgt B?"
const EDGES = [
  {
    from: 'computer',
    to: 'vault',
    method: 'Gespeicherte Passwörter aus dem Browser auslesen',
    why: 'Genau darauf ist Infostealer-Schadsoftware ausgelegt.',
    p: (p) => clamp01((p.pwManager === 'browser' ? 0.85 : p.hasRealManager ? 0.25 : 0.5) - (p.hasRealManager ? 0.1 : 0)),
    stoppedBy: ['password-manager'],
  },
  {
    from: 'computer',
    to: 'email',
    method: 'Aktive Anmeldesitzung des Postfachs übernehmen',
    why: 'Der gestohlene Sitzungs-Token macht Passwort und zweiten Faktor irrelevant.',
    p: () => 0.8,
    stoppedBy: ['session-cleanup'],
  },
  {
    from: 'computer',
    to: 'crypto',
    method: 'Wallet-Dateien und Zwischenablage abgreifen',
    why: 'Wallet-Dateien und Seed-Phrasen werden gezielt gesucht.',
    p: (p) => clamp01(p.seedExposed ? 0.75 : p.crypto === 'hot' ? 0.5 : 0.15),
    stoppedBy: ['seed-offline', 'hardware-wallet'],
  },
  {
    from: 'computer',
    to: 'work',
    method: 'Berufliche Zugänge vom selben Gerät mitnehmen',
    why: 'Arbeit und Privates laufen über dasselbe System.',
    p: (p) => clamp01(p.workOnPrivateDevice ? 0.7 : p.mixesWork ? 0.4 : 0.12),
    stoppedBy: ['work-separation'],
  },
  {
    from: 'vault',
    to: 'email',
    method: 'Zugangsdaten aus dem Speicher verwenden',
    why: 'Der Passwortspeicher enthält den Zugang zu allem.',
    p: () => 0.92,
    stoppedBy: ['mfa-critical'],
  },
  {
    from: 'vault',
    to: 'bank',
    method: 'Bankzugang aus dem Speicher verwenden',
    why: 'Auch Bankzugänge liegen dort.',
    p: (p) => clamp01(0.7 - (p.tanStrong ? 0.4 : 0)),
    stoppedBy: ['banking-second-device'],
  },
  {
    from: 'email',
    to: 'bank',
    method: 'Passwort über "Passwort vergessen" zurücksetzen',
    why: 'Die Bestätigungsmail landet im übernommenen Postfach.',
    p: (p) => clamp01(0.62 - (p.tanStrong ? 0.3 : 0) - (p.mfaBreadth >= 70 ? 0.12 : 0)),
    stoppedBy: ['mfa-critical', 'banking-second-device'],
  },
  {
    from: 'email',
    to: 'payment',
    method: 'Bezahldienst über die Wiederherstellung übernehmen',
    why: 'PayPal, Klarna und Händlerkonten hängen an derselben Adresse.',
    p: (p) => clamp01(0.72 - (p.mfaBreadth >= 70 ? 0.2 : 0)),
    stoppedBy: ['mfa-critical'],
  },
  {
    from: 'email',
    to: 'social',
    method: 'Soziale Konten zurücksetzen',
    why: 'Auch hier führt der Weg über die hinterlegte Adresse.',
    p: (p) => clamp01(0.78 - (p.mfaBreadth >= 70 ? 0.22 : 0)),
    stoppedBy: ['mfa-critical'],
  },
  {
    from: 'email',
    to: 'cloud',
    method: 'Apple- oder Google-Konto zurücksetzen',
    why: 'Die Wiederherstellung läuft über die hinterlegte Adresse.',
    p: (p) => clamp01(0.55 - (p.hasPhishResistantMfa ? 0.3 : p.mfaBreadth >= 70 ? 0.18 : 0)),
    stoppedBy: ['apple-google-hardening', 'mfa-critical'],
  },
  {
    from: 'email',
    to: 'identity',
    method: 'Dokumente aus dem Postfach durchsuchen',
    why: 'Ausweiskopien und Verträge liegen als alte Anhänge im Postfach.',
    p: (p) => clamp01(p.hasIdScans ? 0.85 : p.sensitiveDocs > 0 ? 0.6 : 0.2),
    stoppedBy: ['sensitive-data-cleanup'],
  },
  {
    from: 'email',
    to: 'crypto',
    method: 'Börsenkonto über die Wiederherstellung übernehmen',
    why: 'Auch die Krypto-Börse hängt an dieser Adresse.',
    p: (p) => clamp01(p.crypto === 'exchange' ? 0.5 : 0.2),
    stoppedBy: ['mfa-critical', 'hardware-key'],
  },
  {
    from: 'email',
    to: 'work',
    method: 'Beruflichen Zugang über die private Adresse zurücksetzen',
    why: 'Berufliche Dienste sind an die private Adresse gebunden.',
    p: (p) => clamp01(p.mixesWork ? 0.45 : 0.15),
    stoppedBy: ['work-separation'],
  },
  {
    from: 'sim',
    to: 'email',
    method: 'Postfach über die Rufnummer zurücksetzen',
    why: 'Die Rufnummer ist als Wiederherstellungsweg hinterlegt.',
    p: (p) => clamp01((p.recoveryViaPhone ? 0.65 : 0.35) + (p.usesSmsMfa ? 0.15 : 0) - (p.hasRecoveryCodes ? 0.15 : 0)),
    stoppedBy: ['recovery-codes', 'drop-sms-mfa'],
  },
  {
    from: 'sim',
    to: 'bank',
    method: 'SMS-TAN abfangen',
    why: 'Freigaben laufen über SMS an diese Nummer.',
    p: (p) => clamp01(p.tanSms ? 0.7 : 0.12),
    stoppedBy: ['banking-second-device'],
  },
  {
    from: 'phone',
    to: 'email',
    method: 'Auf dem entsperrten Gerät ist das Postfach bereits offen',
    why: 'Ein entsperrtes Handy ist ein angemeldetes Postfach.',
    p: (p) => clamp01(0.9 - (p.lockScore >= 90 ? 0.25 : 0)),
    stoppedBy: ['strong-lockscreen'],
  },
  {
    from: 'phone',
    to: 'bank',
    method: 'Banking-App und Freigabe auf demselben Gerät nutzen',
    why: 'Beide Schritte liegen auf einem Gerät.',
    p: (p) => clamp01(p.tanSameDevice ? 0.6 : 0.2),
    stoppedBy: ['banking-second-device', 'strong-lockscreen'],
  },
  {
    from: 'phone',
    to: 'cloud',
    method: 'Angemeldetes Konto auf dem Gerät übernehmen',
    why: 'Das Gerät ist dauerhaft am Konto angemeldet.',
    p: (p) => clamp01(0.7 - (p.lockScore >= 90 ? 0.2 : 0)),
    stoppedBy: ['strong-lockscreen', 'apple-google-hardening'],
  },
  {
    from: 'cloud',
    to: 'vault',
    method: 'Gespeicherte Passwörter aus dem Ökosystem auslesen',
    why: 'Der Passwortspeicher hängt am selben Konto.',
    p: (p) => clamp01(p.hasEcosystemManager ? 0.85 : 0.3),
    stoppedBy: ['password-manager', 'apple-google-hardening'],
  },
  {
    from: 'cloud',
    to: 'identity',
    method: 'Fotos und Dokumente aus dem Speicher durchsehen',
    why: 'Ausweisfotos und Dokumente liegen in der Galerie oder im Cloud-Speicher.',
    p: (p) => clamp01(p.sensitiveDocs > 0 ? 0.75 : 0.3),
    stoppedBy: ['sensitive-data-cleanup'],
  },
  {
    from: 'chat',
    to: 'gaming',
    method: 'Sitzungs-Token über einen Link stehlen',
    why: 'Die Standardmasche in Gaming-Communitys.',
    p: (p) => clamp01(0.55 + (p.tradesItems ? 0.15 : 0) - (p.hasPhishResistantMfa ? 0.15 : 0)),
    stoppedBy: ['gaming-hardening', 'session-cleanup'],
  },
  {
    from: 'chat',
    to: 'social',
    method: 'Weitere Konten über denselben Weg übernehmen',
    why: 'Derselbe Angriff funktioniert bei den übrigen Plattformen.',
    p: () => 0.45,
    stoppedBy: ['mfa-critical'],
  },
  {
    from: 'gaming',
    to: 'payment',
    method: 'Hinterlegtes Zahlungsmittel nutzen',
    why: 'Auf der Plattform ist eine Zahlungsart gespeichert.',
    p: (p) => clamp01(p.cardsStored ? 0.55 : 0.3),
    stoppedBy: ['virtual-cards'],
  },
  {
    from: 'gaming',
    to: 'email',
    method: 'Dasselbe Passwort beim Postfach probieren',
    why: 'Das Passwort wird auch anderswo verwendet.',
    p: (p) => clamp01(p.heavyReuse ? 0.62 : p.reusesPasswords ? 0.4 : 0.08),
    stoppedBy: ['unique-passwords', 'password-manager'],
  },
  {
    from: 'social',
    to: 'chat',
    method: 'Kontakte im Namen des Opfers anschreiben',
    why: 'Von einem echten Konto aus wirkt jede Bitte glaubwürdig.',
    p: () => 0.7,
    stoppedBy: ['mfa-critical'],
  },
  {
    from: 'home',
    to: 'computer',
    method: 'Vom übernommenen Gerät aus weiter ins Netz vordringen',
    why: 'Alle Geräte hängen im selben Netz.',
    p: (p) => clamp01(p.guestWifi ? 0.2 : 0.5),
    stoppedBy: ['iot-segment'],
  },
  {
    from: 'home',
    to: 'identity',
    method: 'Daten vom Netzwerkspeicher kopieren',
    why: 'Auf dem Speicher liegen Dokumente und Fotos.',
    p: (p) => clamp01(p.hasNas ? 0.65 : 0.15),
    stoppedBy: ['close-remote-access', 'iot-segment'],
  },
]

const ASSET_BY_ID = Object.fromEntries(ASSETS.map((a) => [a.id, a]))

/** Werte, die bei dieser Person existieren — mit Wert und Verteidigungsgrad. */
export function buildAssets(profile) {
  return ASSETS.filter((a) => a.present(profile)).map((a) => ({
    id: a.id,
    label: a.label,
    icon: a.icon,
    role: a.role,
    note: a.note,
    value: Math.round(Math.min(100, a.value(profile))),
    // Beide Größen sind Prozentwerte und werden als Balken gezeichnet. `defenseOf`
    // addiert Ab- und Zuschläge frei, ein Profil ohne 2FA mit schwachen Passwörtern
    // und Software aus zweifelhaften Quellen landet dabei unter null.
    defense: Math.round(Math.max(0, Math.min(100, defenseOf(a.id, profile)))),
  }))
}

/** Wie gut ist ein einzelner Wert bei dieser Person geschützt? (0..100) */
function defenseOf(assetId, p) {
  switch (assetId) {
    case 'email':
      return p.emailDefense
    case 'vault':
      return p.hasRealManager ? Math.min(95, 55 + p.mfaStrength * 0.4) : 40 + p.mfaStrength * 0.2
    case 'phone':
      return 0.6 * p.lockScore + 0.4 * p.deviceHygiene
    case 'computer':
      return 0.5 * p.deviceHygiene + 0.3 * (100 - p.downloadRisk) + 0.2 * (p.encrypted ? 90 : 30)
    case 'sim':
      return p.usesSmsMfa ? 30 : 55
    case 'cloud':
      return 0.7 * p.mfaStrength + 0.3 * p.passwordHygiene
    case 'bank':
      return p.tanStrong ? 88 : p.tanSameDevice ? 45 : p.tanSms ? 38 : 62
    case 'payment':
      return 0.6 * p.mfaStrength + (p.cardsStored ? 10 : 30)
    case 'crypto':
      return p.seedSafe ? 85 : p.crypto === 'hardware' ? 70 : p.seedExposed ? 22 : 45
    case 'gaming':
      return 0.5 * p.mfaStrength + 0.3 * p.passwordHygiene + (p.usesCracks ? -15 : 10)
    case 'chat':
      return 0.5 * p.mfaStrength + 0.5 * (100 - p.clickRisk)
    case 'social':
      return 0.6 * p.mfaStrength + 0.4 * (p.socialPublic ? 40 : 70)
    case 'identity':
      return p.sensitiveDocs >= 3 ? 25 : p.sensitiveDocs > 0 ? 45 : 75
    case 'work':
      return p.workOnPrivateDevice ? 35 : p.mixesWork ? 55 : 75
    case 'home':
      return 0.7 * p.networkHygiene + (p.exposedToInternet ? -15 : 10)
    default:
      return 50
  }
}

/**
 * Alle plausiblen Angriffsketten aufzählen und nach Wahrscheinlichkeit ×
 * Zielwert bewerten. Der Graph ist klein genug, dass eine vollständige
 * Tiefensuche bis Länge 4 ohne Weiteres möglich ist — das ist deutlich besser
 * nachvollziehbar als eine Heuristik.
 */
export function buildChains(profile, { maxDepth = 4, limit = 3 } = {}) {
  const present = new Set(buildAssets(profile).map((a) => a.id))
  const edges = EDGES.filter((e) => present.has(e.from) && present.has(e.to))
  const chains = []

  for (const entry of ENTRIES) {
    if (entry.requires && !entry.requires(profile)) continue
    if (!present.has(entry.target)) continue

    const entryP = entry.p(profile)
    if (entryP < 0.05) continue

    const start = {
      steps: [
        {
          kind: 'entry',
          to: entry.target,
          toLabel: ASSET_BY_ID[entry.target].label,
          method: entry.label,
          why: entry.detail,
          p: entryP,
          stoppedBy: entry.stoppedBy,
          icon: entry.icon,
        },
      ],
      visited: new Set([entry.target]),
      p: entryP,
    }

    const walk = (state) => {
      // Jeder Zwischenstand ist selbst ein gültiges Ergebnis — ein Angriff
      // muss nicht bis zum wertvollsten Ziel laufen, um Schaden anzurichten.
      const last = state.steps[state.steps.length - 1]
      const goal = ASSET_BY_ID[last.to]
      chains.push({
        id: `${entry.id}:${state.steps.map((s) => s.to).join('>')}`,
        entry,
        steps: state.steps,
        probability: state.p,
        goal,
        goalValue: Math.min(100, goal.value(profile)),
        expected: state.p * Math.min(100, goal.value(profile)),
      })

      if (state.steps.length >= maxDepth) return

      for (const edge of edges) {
        if (edge.from !== last.to || state.visited.has(edge.to)) continue
        const ep = edge.p(profile)
        if (ep < 0.12) continue
        const next = state.p * ep
        if (next < 0.02) continue

        walk({
          steps: [
            ...state.steps,
            {
              kind: 'pivot',
              from: edge.from,
              fromLabel: ASSET_BY_ID[edge.from].label,
              to: edge.to,
              toLabel: ASSET_BY_ID[edge.to].label,
              method: edge.method,
              why: edge.why,
              p: ep,
              stoppedBy: edge.stoppedBy,
            },
          ],
          visited: new Set([...state.visited, edge.to]),
          p: next,
        })
      }
    }

    walk(start)
  }

  // Beste Kette je Einstiegspunkt, damit nicht dreimal derselbe Weg erscheint.
  const bestPerEntry = new Map()
  for (const c of chains) {
    const current = bestPerEntry.get(c.entry.id)
    if (!current || c.expected > current.expected) bestPerEntry.set(c.entry.id, c)
  }

  return [...bestPerEntry.values()]
    .sort((a, b) => b.expected - a.expected)
    .slice(0, limit)
    .map((c, i) => ({
      ...c,
      rank: i + 1,
      // Die eine Maßnahme, die diese Kette am frühesten unterbricht.
      breakPoint: c.steps[0].stoppedBy?.[0] ?? c.steps[1]?.stoppedBy?.[0] ?? null,
      likelihoodLabel: labelFor(c.probability),
    }))
}

function labelFor(p) {
  if (p >= 0.35) return 'sehr wahrscheinlich'
  if (p >= 0.18) return 'wahrscheinlich'
  if (p >= 0.08) return 'realistisch'
  return 'möglich, aber unwahrscheinlich'
}

export function buildTwin(profile) {
  const assets = buildAssets(profile)
  const chains = buildChains(profile)

  const crownJewels = [...assets].sort((a, b) => b.value - a.value).slice(0, 3)
  const weakest = [...assets]
    .filter((a) => a.value >= 40)
    .sort((a, b) => a.defense - b.defense)
    .slice(0, 3)

  return { assets, chains, crownJewels, weakest }
}

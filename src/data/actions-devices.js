// ---------------------------------------------------------------------------
// Maßnahmen — Teil 2: Geräte, Software, Heimnetz, unterwegs
// ---------------------------------------------------------------------------
// Schema siehe actions-core.js.
// ---------------------------------------------------------------------------

export const ACTIONS_DEVICES = [
  {
    id: 'updates-auto',
    title: 'Automatische Updates überall einschalten',
    oneLiner: 'Die langweiligste Maßnahme im Katalog und trotzdem eine der wirksamsten.',
    category: 'devices',
    effort: 25,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: {
      infostealer: 0.3,
      ransomware: 0.35,
      'mobile-malware': 0.35,
      'public-network': 0.25,
      'iot-exposure': 0.2,
    },
    appliesIf: (p) => p.updateScore < 85,
    doneIf: (p) => p.updateScore >= 90,
    why: (p) =>
      p.updatesBad
        ? 'Du schiebst Updates auf. Das Problem daran: Sobald eine Lücke geschlossen wird, ist sie öffentlich bekannt — und wird innerhalb weniger Tage automatisiert gegen alle ausgenutzt, die noch nicht aktualisiert haben. Du bist danach nicht "gleich sicher wie vorher", sondern messbar unsicherer.'
        : 'Automatisch heißt: du triffst diese Entscheidung nie wieder und vergisst sie auch nie.',
    steps: [
      { t: 'Betriebssystem', d: 'Windows Update bzw. macOS-Softwareupdate auf automatisch inklusive Neustart in der Nacht stellen.' },
      { t: 'Smartphone', d: 'Automatische System- und App-Updates aktivieren, inklusive Installation über Nacht.' },
      { t: 'Browser', d: 'Der wichtigste Einzelfall — er ist deine Kontaktfläche zum Internet. Regelmäßig komplett schließen, sonst wird das Update nicht aktiv.' },
      { t: 'Alles andere', d: 'Router, Fernseher, Konsole, Drucker, smarte Geräte: einmal durchgehen, automatische Updates aktivieren.' },
    ],
    products: [],
    watchout:
      'Ein Gerät, das keine Updates mehr bekommt, wird durch Einstellungen nicht sicherer. Das ist ein Austausch-Thema, kein Konfigurations-Thema.',
  },

  {
    id: 'device-encryption',
    title: 'Festplattenverschlüsselung aktivieren',
    oneLiner: 'Ohne sie ist dein Anmeldepasswort reine Dekoration.',
    category: 'devices',
    effort: 20,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 2,
    reduces: { 'device-theft': 0.7, 'identity-theft': 0.15 },
    appliesIf: (p) => p.hasComputer && !p.encrypted,
    doneIf: (p) => p.encrypted,
    why: 'Ein unverschlüsselter Rechner gibt alle Daten preis, sobald jemand die Festplatte ausbaut oder von einem USB-Stick startet. Das Windows- oder Mac-Passwort schützt davor überhaupt nicht — es fragt nur beim normalen Hochfahren.',
    steps: [
      { t: 'Mac: FileVault', d: 'Systemeinstellungen → Datenschutz & Sicherheit → FileVault einschalten.' },
      {
        t: 'Windows: BitLocker oder Geräteverschlüsselung',
        d: 'Einstellungen → Datenschutz und Sicherheit → Geräteverschlüsselung. In der Home-Edition heißt es "Geräteverschlüsselung" und setzt ein Microsoft-Konto voraus.',
      },
      { t: 'Wiederherstellungsschlüssel sichern', d: 'Ausdrucken und getrennt vom Gerät aufbewahren. Ohne ihn sind die Daten nach einem Defekt endgültig verloren.' },
      { t: 'Handy prüfen', d: 'iPhone und aktuelle Android-Geräte verschlüsseln automatisch, sobald eine Bildschirmsperre gesetzt ist.' },
    ],
    products: [],
    watchout: 'Vor dem Einschalten ein Backup machen. Der Vorgang ist zuverlässig, aber ein Stromausfall mittendrin ist unschön.',
  },

  {
    id: 'strong-lockscreen',
    title: 'Bildschirmsperre verstärken',
    oneLiner: 'Sechs Ziffern statt vier — und niemand schaut dir beim Tippen zu.',
    category: 'devices',
    effort: 10,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: { 'device-theft': 0.45 },
    appliesIf: (p) => p.lockScore < 85,
    doneIf: (p) => p.lockScore >= 90,
    why: (p) =>
      p.noLock
        ? 'Dein Handy ist nicht gesperrt. Damit ist jeder Diebstahl und jede unbeaufsichtigte Minute ein vollständiger Zugriff auf Mail, Banking, Fotos und alle Konten, die sich darüber zurücksetzen lassen.'
        : 'Eine vierstellige PIN hat 10.000 Kombinationen und wird beim Entsperren in der Öffentlichkeit regelmäßig mitgelesen. Sechs oder mehr Stellen kosten dich nichts, weil du ohnehin per Gesicht oder Fingerabdruck entsperrst.',
    steps: [
      { t: 'Code auf mindestens sechs Stellen umstellen', d: 'iPhone: Face ID & Code → Code ändern → Optionen → sechsstelliger Code. Android analog unter Sicherheit.' },
      { t: 'Biometrie aktivieren', d: 'Damit du den langen Code fast nie eingeben musst — genau deshalb darf er lang sein.' },
      { t: 'Sperrbildschirm entschlacken', d: 'Nachrichteninhalte und Codes nicht im gesperrten Zustand anzeigen lassen. Sonst ist der zweite Faktor von außen lesbar.' },
      { t: 'Kurze Sperrzeit setzen', d: '30 Sekunden bis eine Minute.' },
    ],
    products: [],
    watchout: 'Wischmuster sind die schwächste Variante — sie hinterlassen sichtbare Spuren auf dem Display und werden leicht abgeschaut.',
  },

  {
    id: 'find-my-device',
    title: 'Geräte-Ortung und Fernlöschung einrichten',
    oneLiner: 'Damit ein verlorenes Gerät nur ein finanzielles Problem ist.',
    category: 'devices',
    effort: 15,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: { 'device-theft': 0.35 },
    appliesIf: () => true,
    why: 'Ohne eingerichtete Ortung hast du nach einem Verlust keine Möglichkeit, das Gerät zu sperren oder die Daten zu löschen. Hinterher lässt sich das nicht mehr aktivieren.',
    steps: [
      { t: 'Aktivieren', d: '"Wo ist?" bei Apple, "Mein Gerät finden" bei Google, "Mein Gerät suchen" bei Microsoft.' },
      { t: 'Diebstahlschutz einschalten', d: 'Neuere iPhones und Android-Geräte bieten einen Modus, der auch bei bekannter PIN sensible Änderungen sperrt. Aktivieren.' },
      { t: 'Zugriff testen', d: 'Einmal von einem anderen Gerät anmelden und prüfen, ob dein Gerät angezeigt wird.' },
      { t: 'Notfallplan notieren', d: 'Was zuerst? Gerät sperren, Mobilfunkanbieter anrufen, Passwörter der Hauptkonten ändern, Bank informieren.' },
    ],
    products: [],
    watchout: 'Die Ortung hängt an deinem Apple- oder Google-Konto. Ist dieses Konto kompromittiert, kann ein Angreifer damit auch deine Geräte sperren.',
  },

  {
    id: 'standard-user-account',
    title: 'Im Alltag ohne Administratorrechte arbeiten',
    oneLiner: 'Begrenzt den Schaden, wenn doch einmal etwas Falsches startet.',
    category: 'devices',
    effort: 30,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 3,
    reduces: { infostealer: 0.25, ransomware: 0.3 },
    appliesIf: (p) => p.dailyAdmin && p.tech >= 3,
    why: 'Startet Schadsoftware unter einem Administratorkonto, kann sie sich systemweit einnisten und Schutzmechanismen abschalten. Unter einem Standardkonto bleibt sie in deinem Benutzerprofil — unangenehm, aber deutlich besser beherrschbar.',
    steps: [
      { t: 'Zweites Konto anlegen', d: 'Ein separates Administratorkonto mit eigenem starkem Passwort erstellen.' },
      { t: 'Eigenes Konto herabstufen', d: 'Dein Alltagskonto auf "Standardbenutzer" umstellen.' },
      { t: 'Installationen bestätigen', d: 'Wenn etwas Administratorrechte will, gibst du die Zugangsdaten des zweiten Kontos ein. Genau diese Unterbrechung ist der Sinn der Übung.' },
    ],
    products: [],
    watchout: 'Vorher sicherstellen, dass du das Administratorpasswort im Passwortmanager hast — sonst sperrst du dich aus.',
  },

  {
    id: 'no-cracks',
    title: 'Auf Cracks, Keygens und inoffizielle Downloads verzichten',
    oneLiner: 'Der mit Abstand größte einzelne Risikofaktor auf privaten Rechnern.',
    category: 'devices',
    effort: 30,
    cost: 0,
    costLabel: 'Kostenlos bis moderat',
    difficulty: 2,
    reduces: {
      infostealer: 0.65,
      ransomware: 0.45,
      'gaming-takeover': 0.4,
      'crypto-theft': 0.3,
      'work-bleed': 0.3,
    },
    appliesIf: (p) => p.downloadsAnywhere,
    why: (p) =>
      p.usesCracks
        ? 'Das ist in deinem Profil der stärkste Einzelfaktor. Der Grund ist nicht Moral, sondern Ökonomie: Wer kostenlos Software verteilt, verdient sein Geld mit dem, was mitgeliefert wird. Infostealer werden heute fast ausschließlich so verbreitet — und sie nehmen Passwörter, Sitzungen und Wallet-Dateien in einem Rutsch mit.'
        : 'Downloads aus Suchergebnissen führen überdurchschnittlich oft auf nachgebaute Seiten mit manipulierten Installationsdateien. Gekaufte Anzeigen auf den Suchbegriff sind ein Standardweg dafür.',
    steps: [
      { t: 'Nur Herstellerseite oder offizieller Store', d: 'Und zwar über ein Lesezeichen oder die eingetippte Adresse, nicht über das erste Suchergebnis.' },
      { t: 'Legale Alternativen prüfen', d: 'Für die meisten teuren Programme gibt es kostenlose Gegenstücke, die für privaten Gebrauch vollkommen ausreichen.' },
      { t: 'Bei Spielen: keine Cheats und Mods aus fremden Quellen', d: 'Das ist der Hauptverbreitungsweg im Gaming-Umfeld.' },
      { t: 'Bereits installiertes prüfen', d: 'Nach einer solchen Installation gehst du davon aus, dass Zugangsdaten abgeflossen sind: Passwörter ändern und alle Sitzungen beenden.' },
    ],
    products: [],
    watchout:
      'Ein Virenscanner erkennt diese Dateien meist nicht — sie werden gezielt so lange verändert, bis sie durchgehen.',
  },

  {
    id: 'app-store-only',
    title: 'Apps nur aus den offiziellen Stores installieren',
    oneLiner: 'Auf dem Handy ist das der praktisch gesamte Schutz.',
    category: 'devices',
    effort: 15,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: { 'mobile-malware': 0.6 },
    appliesIf: (p) => p.isAndroid || p.downloadsAnywhere,
    why: 'Die überwiegende Mehrheit der Schadsoftware auf Android kommt über Installationsdateien aus Chats, Werbebannern und Downloadseiten. Wer ausschließlich im Play Store bleibt, entfernt diesen Weg fast vollständig.',
    steps: [
      { t: 'Installation aus unbekannten Quellen deaktivieren', d: 'Einstellungen → Apps → Spezieller Zugriff → Unbekannte Apps installieren: für alle Apps abschalten.' },
      { t: 'Play Protect aktiv lassen', d: 'Im Play Store unter Profil → Play Protect prüfen.' },
      { t: 'Vor der Installation kurz prüfen', d: 'Entwicklername, Bewertungszahl und Installationszahl. Eine neue App mit 200 Downloads und perfekten Bewertungen ist ein Warnsignal.' },
    ],
    products: [],
    watchout: 'Besonders kritisch sind Apps, die "Bedienungshilfen" verlangen. Diese Berechtigung erlaubt das Mitlesen und Steuern aller anderen Apps.',
  },

  {
    id: 'app-permissions-review',
    title: 'App-Berechtigungen einmal komplett durchgehen',
    oneLiner: 'Vor allem eine Berechtigung ist gefährlich — und die kennen die wenigsten.',
    category: 'devices',
    effort: 25,
    recurring: 'halbjährlich',
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: { 'mobile-malware': 0.35, doxxing: 0.15 },
    appliesIf: () => true,
    why: 'Eine App mit Zugriff auf die Bedienungshilfen kann alles lesen, was auf dem Bildschirm steht, und selbst tippen — auch in deiner Banking-App. Genau darüber funktionieren die aktuellen Banking-Trojaner.',
    steps: [
      { t: 'Bedienungshilfen prüfen', d: 'Einstellungen → Bedienungshilfen. Alles entfernen, was nicht ausdrücklich eine Hilfstechnologie ist.' },
      { t: 'Standort, Mikrofon, Kamera', d: 'Auf "Beim Verwenden der App" oder "Nur einmal" umstellen. Dauerhaften Zugriff braucht fast nichts.' },
      { t: 'Benachrichtigungszugriff prüfen', d: 'Apps mit diesem Recht lesen deine SMS-Codes und Freigabemeldungen mit.' },
      { t: 'Unbenutzte Apps löschen', d: 'Was du ein Jahr nicht geöffnet hast, kommt runter.' },
    ],
    products: [],
    watchout: 'Auch harmlos wirkende Taschenlampen-, Tastatur- und Wetter-Apps stehen regelmäßig in Datenskandalen.',
  },

  // ---------------------------------------------------------- HEIMNETZ -----
  {
    id: 'router-hardening',
    title: 'Den Router absichern',
    oneLiner: 'Das Gerät, das jede Verbindung im Haushalt sieht — und an das niemand denkt.',
    category: 'network',
    effort: 40,
    recurring: 'jährlich prüfen',
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 2,
    reduces: { 'router-compromise': 0.65, 'iot-exposure': 0.3, 'work-bleed': 0.2 },
    appliesIf: (p) => p.routerDefault || p.routerNeverUpdated,
    doneIf: (p) => p.routerManaged && !p.routerNeverUpdated,
    why: (p) =>
      p.routerNeverUpdated
        ? 'Dein Router wurde nie aktualisiert. Router-Sicherheitslücken werden regelmäßig veröffentlicht und danach automatisiert im großen Stil ausgenutzt — und ein kompromittierter Router betrifft jedes Gerät im Haushalt gleichzeitig, ohne dass eines davon infiziert sein muss.'
        : 'Standardkonfiguration bedeutet fast immer: bekanntes Standardpasswort für die Oberfläche und aktivierte Komfortfunktionen, die man nicht braucht.',
    steps: [
      { t: 'Oberfläche öffnen', d: 'Meist fritz.box oder 192.168.0.1 im Browser. Das Zugangspasswort steht auf der Geräterückseite.' },
      { t: 'Geräte-Passwort ändern', d: 'Ein neues, zufälliges Passwort aus dem Manager. Das Aufkleber-Passwort kennt jeder, der schon mal in deiner Wohnung war.' },
      { t: 'Automatische Firmware-Updates aktivieren', d: 'Der wichtigste einzelne Schalter in dieser Liste.' },
      { t: 'Fernzugriff und WPS abschalten', d: 'Zugriff aus dem Internet auf die Router-Oberfläche brauchst du nicht. UPnP ebenfalls deaktivieren, sofern nichts Konkretes davon abhängt.' },
      { t: 'WLAN auf WPA3 oder WPA2 stellen', d: 'Und ein langes WLAN-Passwort setzen. WEP und offene Netze gehören ausgeschaltet.' },
    ],
    products: ['fritzbox'],
    watchout: 'Ein Router, den der Hersteller nicht mehr unterstützt, gehört ersetzt. Fünf Jahre sind hier eine realistische Grenze.',
  },

  {
    id: 'iot-segment',
    title: 'Smarte Geräte in ein eigenes Netz stellen',
    oneLiner: 'Damit die günstige Kamera nicht neben deinem Arbeitslaptop hängt.',
    category: 'network',
    effort: 45,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 3,
    reduces: { 'iot-exposure': 0.55, 'router-compromise': 0.25, 'work-bleed': 0.2 },
    appliesIf: (p) => p.smartHomeCount >= 3 || p.hasCameras || p.hasNas,
    why: (p) =>
      p.hasCameras
        ? 'Kameras sind das lohnendste Ziel im Heimnetz und werden von günstigen Herstellern oft jahrelang nicht aktualisiert. In einem getrennten Netz kann ein übernommenes Gerät wenigstens nicht auf deine Rechner und Datenspeicher zugreifen.'
        : 'Smarte Geräte bekommen selten Updates und lassen sich nicht absichern. Trennen ist die einzige wirksame Antwort darauf.',
    steps: [
      { t: 'Gastnetz aktivieren', d: 'Jeder aktuelle Router kann das. Es ist vom Hauptnetz getrennt.' },
      { t: 'Smarte Geräte dorthin umziehen', d: 'Lampen, Steckdosen, Saugroboter, Fernseher, Kameras, Lautsprecher.' },
      { t: 'Rechner, Handys und Datenspeicher im Hauptnetz lassen', d: 'Dort bleibt nur, was du selbst pflegst und aktuell hältst.' },
      { t: 'Prüfen, was danach nicht mehr geht', d: 'Manche Steuerung per App funktioniert netzübergreifend nicht. Das ist der Preis — meist verschmerzbar.' },
    ],
    products: ['fritzbox'],
    watchout: 'Chromecast, AirPlay und Drucker brauchen oft dasselbe Netz wie das steuernde Gerät. Vorher überlegen, was wohin gehört.',
  },

  {
    id: 'iot-passwords',
    title: 'Standardpasswörter smarter Geräte ersetzen',
    oneLiner: 'Suchmaschinen für vernetzte Geräte finden genau diese.',
    category: 'network',
    effort: 30,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 2,
    reduces: { 'iot-exposure': 0.4 },
    appliesIf: (p) => p.smartHomeCount > 0 || p.hasNas,
    why: 'Es existieren öffentliche Suchmaschinen, die aus dem Internet erreichbare Geräte auflisten. Wer weiß, welches Modell welches Standardpasswort hat, kommt ohne jede technische Fähigkeit rein.',
    steps: [
      { t: 'Inventar machen', d: 'In der Router-Oberfläche siehst du alle verbundenen Geräte. Erfahrungsgemäß sind es mehr, als man denkt.' },
      { t: 'Passwörter je Gerät ändern', d: 'Jedes eigene Passwort, alle im Manager ablegen.' },
      { t: 'Zweiten Faktor aktivieren, wo möglich', d: 'Kamera- und Alarm-Apps bieten das inzwischen fast durchgängig an.' },
      { t: 'Nicht genutzte Geräte vom Netz nehmen', d: 'Das alte Babyphone im Schrank braucht keine Verbindung mehr.' },
    ],
    products: [],
    watchout: 'Geräte, deren Hersteller es nicht mehr gibt, bekommen nie wieder ein Update. Die gehören ersetzt oder offline.',
  },

  {
    id: 'close-remote-access',
    title: 'Fernzugriffe von außen schließen',
    oneLiner: 'Jede Portfreigabe ist eine Tür, die dauerhaft offen steht.',
    category: 'network',
    effort: 35,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 3,
    reduces: { 'iot-exposure': 0.6, ransomware: 0.3, 'router-compromise': 0.35 },
    appliesIf: (p) => p.exposedToInternet,
    why: 'Was aus dem Internet erreichbar ist, wird gefunden — nicht weil dich jemand sucht, sondern weil das gesamte Netz permanent automatisiert abgescannt wird. Eine Freigabe von vor drei Jahren ist rund um die Uhr in Reichweite.',
    steps: [
      { t: 'Freigaben auflisten', d: 'Router-Oberfläche → Portfreigaben bzw. Portweiterleitung. Alles notieren, was dort steht.' },
      { t: 'Alles abschalten, was du nicht begründen kannst', d: 'Wenn du nicht weißt, wofür eine Freigabe war, brauchst du sie nicht.' },
      { t: 'Fernzugriff über VPN statt direkt', d: 'Für den Zugriff auf den Netzwerkspeicher von unterwegs das WireGuard-VPN des Routers nutzen, nicht eine offene Freigabe.' },
      { t: 'Cloud-Zugang des Herstellers bevorzugen', d: 'Bei Kameras ist der Hersteller-Zugang meist sicherer als eine selbst eingerichtete Freigabe.' },
    ],
    products: ['fritzbox'],
    watchout: 'UPnP kann Freigaben automatisch anlegen, ohne dass du davon erfährst. Ausschalten und danach die Liste erneut prüfen.',
  },

  // ------------------------------------------------------------ UNTERWEGS --
  {
    id: 'tethering-habit',
    title: 'Im Zweifel den eigenen Hotspot statt fremdes WLAN nutzen',
    oneLiner: 'Der einfachste Weg, das Thema öffentliches WLAN vollständig zu erledigen.',
    category: 'network',
    effort: 5,
    cost: 0,
    costLabel: 'Kostenlos',
    difficulty: 1,
    reduces: { 'public-network': 0.6 },
    appliesIf: (p) => p.usesPublicWifi,
    why: 'Mobile Daten sind heute für die meisten Tarife ausreichend. Der eigene Hotspot ist bequemer als jede Anmeldeseite und nimmt dir eine ganze Risikokategorie ab, ohne dass du irgendetwas konfigurieren musst.',
    steps: [
      { t: 'Hotspot einrichten', d: 'Persönlicher Hotspot mit langem Passwort, einmalig eingerichtet.' },
      { t: 'Automatische WLAN-Verbindung abschalten', d: 'Sonst verbindet sich dein Handy selbstständig mit Netzen, die nur so heißen wie ein bekanntes.' },
      { t: 'Regel für sensible Dinge', d: 'Banking, Behörden und Arbeit nie über ein fremdes Netz — auch nicht über das Hotel-WLAN.' },
    ],
    products: [],
    watchout: 'Bekannte Netznamen wie "Telekom" oder "FreeWifi" lassen sich trivial fälschen. Deshalb die automatische Verbindung abschalten.',
  },

  {
    id: 'vpn-when-traveling',
    title: 'Ein VPN gezielt für fremde Netze nutzen',
    oneLiner: 'Sinnvoll, aber deutlich weniger wichtig, als die Werbung nahelegt.',
    category: 'network',
    effort: 20,
    cost: 50,
    costLabel: 'ca. 40 – 60 €/Jahr',
    difficulty: 1,
    reduces: { 'public-network': 0.5 },
    appliesIf: (p) => (p.travelsOften || p.usesPublicWifi) && !p.vpnAlways,
    why: 'Ein VPN schützt gegen Mitlesen im fremden Netz. Es schützt nicht gegen Phishing, nicht gegen Schadsoftware, nicht gegen schwache Passwörter — also nicht gegen das, was dich tatsächlich mit hoher Wahrscheinlichkeit trifft. Als Ergänzung für unterwegs ist es sinnvoll, als Grundschutz ist es Marketing.',
    steps: [
      { t: 'Bezahlten Anbieter mit geprüfter Protokollfreiheit wählen', d: 'Mullvad oder Proton VPN sind belastbare Optionen.' },
      { t: 'Auf allen mobilen Geräten einrichten', d: 'Mit automatischer Aktivierung in unbekannten Netzen.' },
      { t: 'Kein kostenloses VPN', d: 'Der Betrieb kostet Geld. Wer nichts verlangt, verdient anders — meist an deinen Daten.' },
    ],
    products: ['freevpn'],
    watchout:
      'Wenn du dich zwischen VPN-Abo und Passwortmanager entscheiden musst: immer der Passwortmanager. Das ist kein knapper Fall.',
  },

  {
    id: 'privacy-screen',
    title: 'Blickschutzfolie für unterwegs',
    oneLiner: 'Analoge Maßnahme gegen ein sehr reales Problem.',
    category: 'network',
    effort: 10,
    cost: 30,
    costLabel: 'ca. 20 – 40 € einmalig',
    difficulty: 1,
    reduces: { 'public-network': 0.2, 'device-theft': 0.1 },
    appliesIf: (p) => p.travelsOften && (p.workSensitive || p.isTargeted),
    why: 'Im Zug und im Flugzeug liest der Sitznachbar Passwörter, Nachrichten und Dokumente einfach mit. Für sensible berufliche Inhalte ist das die wahrscheinlichste Form des Datenabflusses unterwegs.',
    steps: [
      { t: 'Folie passend zum Gerät kaufen', d: 'Für Laptop und gegebenenfalls Handy.' },
      { t: 'Sitzplatz mitdenken', d: 'Rücken zur Wand ist die wirksamste Variante und kostet nichts.' },
    ],
    products: ['privacyfilter'],
    watchout: 'Auch beim Entsperren des Handys in der Öffentlichkeit wird mitgeschaut — Biometrie statt getippter PIN nutzen.',
  },
]

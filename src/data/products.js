// ---------------------------------------------------------------------------
// Produktempfehlungen
// ---------------------------------------------------------------------------
// Bewusst kurz gehalten und auf Optionen beschränkt, die in Deutschland
// verfügbar sind. Keine Affiliate-Logik, keine Vollständigkeit — für jede
// Kategorie eine solide Standardempfehlung und eine Alternative.
//
// tier: 'pick'  = Standardempfehlung
//       'alt'   = gute Alternative
//       'avoid' = ausdrücklich nicht empfohlen (mit Begründung)
// ---------------------------------------------------------------------------

export const PRODUCTS = {
  // --- Passwortmanager ---
  bitwarden: {
    name: 'Bitwarden',
    kind: 'Passwortmanager',
    price: 'Kostenlos, Premium ca. 10 €/Jahr',
    tier: 'pick',
    note: 'Kostenlose Version reicht für die allermeisten Menschen vollständig aus. Quelloffen, regelmäßig extern geprüft, läuft auf allem.',
    url: 'https://bitwarden.com',
  },
  onepassword: {
    name: '1Password',
    kind: 'Passwortmanager',
    price: 'ca. 3 €/Monat, Familie ca. 5 €/Monat',
    tier: 'alt',
    note: 'Die angenehmste Bedienung am Markt. Der Familientarif für bis zu 5 Personen ist der eigentliche Kaufgrund.',
    url: 'https://1password.com',
  },
  keepassxc: {
    name: 'KeePassXC',
    kind: 'Passwortmanager',
    price: 'Kostenlos',
    tier: 'alt',
    note: 'Rein lokal, keine Cloud, volle Kontrolle. Dafür musst du die Synchronisation selbst lösen — nur sinnvoll, wenn dich das reizt.',
    url: 'https://keepassxc.org',
  },
  protonpass: {
    name: 'Proton Pass',
    kind: 'Passwortmanager',
    price: 'Kostenlos, Plus ca. 2 €/Monat',
    tier: 'alt',
    note: 'Schweizer Anbieter, integrierte E-Mail-Aliase. Sinnvoll, wenn du ohnehin im Proton-Ökosystem bist.',
    url: 'https://proton.me/pass',
  },

  // --- Zweiter Faktor ---
  yubikey: {
    name: 'YubiKey 5 (zwei Stück)',
    kind: 'Hardware-Sicherheitsschlüssel',
    price: 'ca. 100 – 120 € für zwei',
    tier: 'pick',
    note: 'Immer zwei kaufen: einer am Schlüsselbund, einer im Schrank als Ersatz. Ein einzelner Schlüssel ist ein Aussperr-Risiko.',
    url: 'https://www.yubico.com',
  },
  nitrokey: {
    name: 'Nitrokey 3',
    kind: 'Hardware-Sicherheitsschlüssel',
    price: 'ca. 50 – 90 €',
    tier: 'alt',
    note: 'Deutscher Hersteller, quelloffene Firmware.',
    url: 'https://www.nitrokey.com',
  },
  aegis: {
    name: 'Aegis Authenticator',
    kind: 'Authenticator-App (Android)',
    price: 'Kostenlos',
    tier: 'pick',
    note: 'Verschlüsselt, mit exportierbarem Backup — genau das fehlt der Google-Variante.',
    url: 'https://getaegis.app',
  },
  enteauth: {
    name: 'Ente Auth',
    kind: 'Authenticator-App (iOS & Android)',
    price: 'Kostenlos',
    tier: 'pick',
    note: 'Quelloffen, verschlüsselte Synchronisation über mehrere Geräte.',
    url: 'https://ente.io/auth',
  },
  twofas: {
    name: '2FAS',
    kind: 'Authenticator-App',
    price: 'Kostenlos',
    tier: 'alt',
    note: 'Einfach, quelloffen, mit Backup-Funktion.',
    url: 'https://2fas.com',
  },

  // --- E-Mail & Aliase ---
  protonmail: {
    name: 'Proton Mail',
    kind: 'E-Mail-Anbieter',
    price: 'Kostenlos, Plus ca. 4 €/Monat',
    tier: 'pick',
    note: 'Sinnvoll als sauberes neues Hauptkonto, wenn deine jetzige Adresse überall verstreut ist.',
    url: 'https://proton.me',
  },
  tuta: {
    name: 'Tuta',
    kind: 'E-Mail-Anbieter',
    price: 'Kostenlos, Premium ca. 3 €/Monat',
    tier: 'alt',
    note: 'Deutscher Anbieter, Server in Deutschland.',
    url: 'https://tuta.com',
  },
  simplelogin: {
    name: 'SimpleLogin',
    kind: 'E-Mail-Aliase',
    price: 'Kostenlos (10 Aliase), Premium ca. 30 €/Jahr',
    tier: 'pick',
    note: 'Pro Dienst eine eigene Adresse. Spam lässt sich damit an der Quelle abschalten — und du siehst, wer deine Daten weitergibt.',
    url: 'https://simplelogin.io',
  },
  addy: {
    name: 'addy.io',
    kind: 'E-Mail-Aliase',
    price: 'Kostenlos, Pro ca. 12 €/Jahr',
    tier: 'alt',
    note: 'Gleiches Prinzip, großzügige Gratisstufe.',
    url: 'https://addy.io',
  },
  hidemyemail: {
    name: '"E-Mail-Adresse verbergen" (Apple)',
    kind: 'E-Mail-Aliase',
    price: 'In iCloud+ enthalten',
    tier: 'alt',
    note: 'Wenn du ohnehin iCloud+ zahlst, brauchst du keinen zusätzlichen Dienst.',
    url: 'https://support.apple.com/de-de/105546',
  },

  // --- Backup ---
  externalssd: {
    name: 'Externe SSD oder HDD (2 TB)',
    kind: 'Backup-Medium',
    price: 'ca. 70 – 130 €',
    tier: 'pick',
    note: 'Zwei Stück kaufen und abwechselnd nutzen, eine davon außerhalb der Wohnung lagern. Das ist der ganze Trick.',
  },
  backblaze: {
    name: 'Backblaze Personal Backup',
    kind: 'Cloud-Backup',
    price: 'ca. 9 $/Monat',
    tier: 'pick',
    note: 'Unbegrenztes, automatisches Backup im Hintergrund. Die Variante für alle, die eine externe Platte nie anstecken würden.',
    url: 'https://www.backblaze.com',
  },
  timemachine: {
    name: 'Time Machine',
    kind: 'Backup-Software (Mac)',
    price: 'Im System enthalten',
    tier: 'pick',
    note: 'Platte anstecken, einmal bestätigen, fertig. Es gibt keinen Grund, das nicht zu tun.',
  },
  veeam: {
    name: 'Veeam Agent for Windows (Free)',
    kind: 'Backup-Software (Windows)',
    price: 'Kostenlos',
    tier: 'pick',
    note: 'Vollständiges Systemabbild inklusive Wiederherstellungsmedium. Die Windows-Bordmittel sind hier deutlich schwächer.',
    url: 'https://www.veeam.com/de/products/free/windows.html',
  },
  ente: {
    name: 'Ente Photos',
    kind: 'Foto-Backup',
    price: 'ca. 3 €/Monat',
    tier: 'alt',
    note: 'Ende-zu-Ende-verschlüsselte Alternative zu Google Fotos und iCloud.',
    url: 'https://ente.io',
  },

  // --- Krypto ---
  ledger: {
    name: 'Ledger / Trezor Hardware-Wallet',
    kind: 'Hardware-Wallet',
    price: 'ca. 80 – 180 €',
    tier: 'pick',
    note: 'Nur direkt beim Hersteller kaufen — nie gebraucht, nie über Marktplätze.',
  },
  steelplate: {
    name: 'Stahlplatte für die Seed-Phrase',
    kind: 'Seed-Sicherung',
    price: 'ca. 30 – 80 €',
    tier: 'pick',
    note: 'Papier überlebt weder Wasser noch Feuer. Bei relevanten Beträgen ist das keine Spielerei.',
  },

  // --- Netzwerk & Geräte ---
  fritzbox: {
    name: 'FRITZ!Box (eigener Router)',
    kind: 'Router',
    price: 'ca. 100 – 250 €',
    tier: 'pick',
    note: 'Lange Update-Versorgung, Gastnetz und Kindersicherung ab Werk, deutschsprachige Oberfläche.',
  },
  privacyfilter: {
    name: 'Blickschutzfolie',
    kind: 'Zubehör',
    price: 'ca. 20 – 40 €',
    tier: 'pick',
    note: 'Die günstigste Sicherheitsmaßnahme überhaupt, wenn du viel im Zug oder Flugzeug arbeitest.',
  },

  // --- Prüfdienste & Anlaufstellen ---
  hibp: {
    name: 'Have I Been Pwned',
    kind: 'Leak-Prüfung',
    price: 'Kostenlos',
    tier: 'pick',
    note: 'Der Standard. Richte zusätzlich die Benachrichtigung für deine Adressen ein.',
    url: 'https://haveibeenpwned.com',
  },
  hpi: {
    name: 'HPI Identity Leak Checker',
    kind: 'Leak-Prüfung',
    price: 'Kostenlos',
    tier: 'alt',
    note: 'Hasso-Plattner-Institut, Ergebnis kommt per E-Mail. Deutsche Alternative.',
    url: 'https://sec.hpi.de/ilc/',
  },
  schufa: {
    name: 'SCHUFA-Datenkopie (Art. 15 DSGVO)',
    kind: 'Bonitätsauskunft',
    price: 'Kostenlos, einmal jährlich',
    tier: 'pick',
    note: 'Deckt auf, ob jemand in deinem Namen Verträge abgeschlossen hat.',
    url: 'https://www.schufa.de',
  },
  verbraucherzentrale: {
    name: 'Verbraucherzentrale — Phishing-Radar',
    kind: 'Anlaufstelle',
    price: 'Kostenlos',
    tier: 'pick',
    note: 'Aktuelle Betrugswellen auf Deutsch, gut verständlich. Auch für Angehörige geeignet.',
    url: 'https://www.verbraucherzentrale.de/phishing',
  },
  bsi: {
    name: 'BSI für Bürger',
    kind: 'Anlaufstelle',
    price: 'Kostenlos',
    tier: 'pick',
    note: 'Offizielle, herstellerneutrale Anleitungen des Bundesamts für Sicherheit in der Informationstechnik.',
    url: 'https://www.bsi.bund.de/dok/buerger',
  },
  polizei: {
    name: 'Onlinewache der Polizei',
    kind: 'Anlaufstelle',
    price: 'Kostenlos',
    tier: 'pick',
    note: 'Anzeige online möglich. Bei Betrug und Erpressung immer sinnvoll — auch wenn die Aufklärungschance gering ist.',
    url: 'https://www.polizei.de',
  },
  klicksafe: {
    name: 'klicksafe',
    kind: 'Anlaufstelle Familie',
    price: 'Kostenlos',
    tier: 'pick',
    note: 'Material für Gespräche mit Kindern und Jugendlichen, nach Altersgruppen sortiert.',
    url: 'https://www.klicksafe.de',
  },

  // --- Ausdrücklich nicht empfohlen ---
  avsuite: {
    name: 'Gekaufte Antivirus-Suiten',
    kind: 'Schutzsoftware',
    price: '40 – 80 €/Jahr',
    tier: 'avoid',
    note: 'Der eingebaute Schutz von Windows und macOS ist heute gleichwertig. Das Geld ist in einem Passwortmanager und einem Backup deutlich besser angelegt.',
  },
  freevpn: {
    name: 'Kostenlose VPN-Apps',
    kind: 'VPN',
    price: 'Kostenlos',
    tier: 'avoid',
    note: 'Du verlagerst damit nur, wer deinen Datenverkehr sieht — an einen Anbieter, der irgendwie Geld verdienen muss.',
  },
}

export const productList = (ids = []) => ids.map((id) => PRODUCTS[id]).filter(Boolean)

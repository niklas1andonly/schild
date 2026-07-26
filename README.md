<div align="center">

# 🛡️ SCHILD

### Kein Score. Ein Plan.

Digitales Sicherheitsaudit für Privatpersonen — mit vollem Rechenweg,
simulierten Angriffsketten und einer Prioritätenliste,<br>
die nach Wirkung pro Aufwand sortiert ist statt nach Bauchgefühl.

**[→ Audit starten](https://niklas1andonly.github.io/schild/)**

[![CI](https://github.com/niklas1andonly/schild/actions/workflows/ci.yml/badge.svg)](https://github.com/niklas1andonly/schild/actions/workflows/ci.yml)
[![Lizenz: MIT](https://img.shields.io/badge/Lizenz-MIT-blue)](LICENSE)
![Backend: keins](https://img.shields.io/badge/Backend-keins-2ea44f)
![Tests: 166](https://img.shields.io/badge/Tests-166-2ea44f)

</div>

---

## Was dabei herauskommt

Kein Ampelbalken, sondern ein Befund, den man nachrechnen kann. Das Beispiel
stammt aus der Testsuite — eine 68-Jährige im Ruhestand, Passwörter im Kopf,
TAN per SMS:

```text
GESAMTBILD                                            21 / 100 · Kritisch

DEINE GRÖSSTEN RISIKEN                Risiko = Wahrscheinlichkeit × Schaden ÷ 100
   77 = 88 × 87   Passwort-Wiederverwendung
   73 = 89 × 82   Phishing
   70 = 80 × 87   Falscher Support
   64 = 76 × 84   Schockanruf

WARUM AUSGERECHNET 77?                                       Basiswert 42
  +34   Du nutzt im Grunde dieselben zwei, drei Passwörter überall
  +12   Deine Passwörter sind kurz und erratbar
   +9   Du weißt nicht, ob deine Daten bereits in Leaks stehen
   +8   Viele alte Konten, die du nicht mehr kontrollierst

DER WAHRSCHEINLICHSTE ANGRIFF                                       62 %
  Automatisierter Anmeldeversuch mit geleakten Zugangsdaten
    └→ E-Mail-Konto
  Unterbrochen durch:  Eindeutige Passwörter

DEIN PLAN — DIESE WOCHE
  −102    10 Min.   Die Rückruf-Regel für Anrufe
   −56     5 Min.   Immer in der echten App gegenprüfen
   −52     5 Min.   Die 24-Stunden-Regel für Geldentscheidungen
  −120    45 Min.   Einen echten Passwortmanager einrichten
   −62    25 Min.   Automatische Updates überall einschalten
```

Jede dieser Zahlen lässt sich bis auf die Antwort zurückverfolgen, die sie
erzeugt hat. Das ist der eigentliche Punkt: Ein Sicherheitsbericht, dem man
widersprechen kann, ist mehr wert als einer, den man glauben muss.

Reines Frontend (Vite + React + Tailwind), **kein Backend**. Alle Berechnungen
laufen im Browser, Antworten liegen ausschließlich im `localStorage`. Das ist
hier keine Sparmaßnahme: Ein Sicherheitsaudit funktioniert nur, wenn jemand
ehrlich antwortet.

Quelloffen unter der [MIT-Lizenz](LICENSE) — forken, prüfen und selbst
betreiben ist ausdrücklich erwünscht.

---

## Datenschutz — und warum man ihn nachprüfen kann

Es gibt keine Datenverarbeitung: kein Konto, kein Server, keine Cookies, keine
Analysewerkzeuge, keine Einbindungen Dritter. Antworten liegen unter genau
einem Schlüssel (`schild.v1`) im lokalen Speicher des Browsers.

Damit das nicht bloß eine Zusage bleibt, setzt der Build eine
Content-Security-Policy in `index.html` (siehe `vite.config.js`):

```
default-src 'self'; connect-src 'none'; script-src 'self'; img-src 'self' data:;
base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'
```

`connect-src 'none'` ist der entscheidende Teil: Der Browser blockiert damit
**jede** Netzwerkanfrage aus dem Anwendungscode — auch eine, die durch einen
Fehler oder eine kompromittierte Abhängigkeit hineingeriete. Nachprüfbar in den
DevTools unter „Netzwerk": beim Laden erscheinen genau vier Anfragen an den
eigenen Host, danach keine mehr.

Die Richtlinie wird nur beim `build` eingefügt — der Dev-Server braucht
WebSockets für Hot Reload. Beim Selbsthosten gehören die Header zusätzlich
serverseitig gesetzt, siehe [SECURITY.md](SECURITY.md).

Es gibt außerdem keine externen Schriften, Bilder oder Skripte: Das Favicon ist
eine Data-URI, die Icons sind Inline-SVG, die Schrift ist der System-Font-Stack.
Auch ohne CSP entstünde also keine Anfrage nach draußen.

---

## (a) Lokal starten

Voraussetzung: **Node.js 18+** (getestet mit Node 22).

```bash
npm install
```

```bash
npm run dev
```

Danach die angezeigte Adresse öffnen (in diesem Projekt **http://localhost:5174**).

Weitere Befehle:

```bash
npm run build
```

```bash
npm run preview
```

```bash
npm test
```

Die Testsuite liegt in `tests/` und läuft ohne DOM gegen die Engine (eigene
`vitest.config.js`, damit der Lauf nicht das React-Plugin lädt):

- **`catalog.test.js`** — alle Verweise zwischen Bedrohungen, Maßnahmen,
  Produkten und dem Twin. Die Konsistenzprüfung aus `actions.js` lief bisher
  nur als `console.warn` im Entwicklungsmodus; hier ist sie verbindlich, und
  Produkte und Twin sind mit abgedeckt (`productList` filtert unbekannte IDs
  sonst kommentarlos heraus).
- **`engine.test.js`** — Invarianten über neun Profile: Wertebereiche,
  Sortierung, jeder Faktor beschriftet, Abhängigkeiten vor ihrer Maßnahme,
  Plan deckungsgleich mit der Rangfolge, kreuzungsfreie Angriffsketten,
  Determinismus, keine Mutation der Antworten.
- **`report.test.js`** — Golden-Snapshots als lesbarer Auszug (Risiko mit
  Rechenweg, Planreihenfolge, Angriffsketten). Anleitungstexte stehen
  bewusst nicht drin, sonst schlüge jede Formulierungskorrektur aus.

Das ist der Schutz beim Erweitern des Inhalts: Weil `priorities.js` nach jeder
gewählten Maßnahme neu rechnet, verschiebt eine neue Maßnahme die Reihenfolge
**aller** anderen. Ein ausgeschlagener Snapshot ist deshalb keine Panne,
sondern eine Frage — war das beabsichtigt? Wenn ja: `npm run test:update`.

Der Build ist mit `base: './'` konfiguriert — `dist/index.html` lässt sich auch
direkt aus dem Dateisystem öffnen. Routing läuft über `HashRouter`, es ist also
kein Server-Rewrite nötig.

---

## (b) Was die Anwendung ausgibt

Der Bericht hat sechs Reiter:

| Reiter | Inhalt |
| --- | --- |
| **Profil** | Gesamteinschätzung, Archetyp und die Kernbefunde — inklusive der Aussagen, die widersprechen ("Du zahlst für eine Security-Suite, X bringt dir 6-mal mehr"). |
| **Risiken** | Alle zutreffenden Bedrohungen nach Risiko sortiert. Jeder Eintrag ist aufklappbar und zeigt **jeden einzelnen Faktor mit Vorzeichen** sowie den vollständigen Rechenweg. |
| **Security Twin** | Der digitale Zwilling: welche Werte existieren, wie gut sie abgesichert sind, und die wahrscheinlichsten Angriffsketten von Einstieg über Ausweitung bis Ziel. |
| **Scam-Simulation** | Die zum Profil passenden Betrugsmaschen im Wortlaut, mit Erkennungsmerkmalen und richtiger Reaktion. |
| **Dein Plan** | Nach Wirkung pro Aufwand sortiert, gestaffelt in diese Woche / diesen Monat / dieses Quartal. Mit Schritt-für-Schritt-Anleitung, typischem Fehler und Produktempfehlung je Maßnahme. Abhakbar. |
| **Produkte** | Nur was zum Plan gehört — plus Anlaufstellen für den Ernstfall und die Kategorien, die man sich ausdrücklich sparen kann. |

Export als Markdown-Datei und als Druckansicht (alle Reiter auf einmal).

---

## (c) Wie gerechnet wird

Vier Schritte, alle in `src/lib/engine/`:

**1. Profil** (`profile.js`) — Rohantworten werden zu Merkmalen verdichtet:
`passwordHygiene`, `mfaStrength`, `onlineExposure`, `emailDefense`,
`backupMaturity`, `targetedScore` usw. Ab hier liest **nichts** mehr die
Antworten direkt. Das hält die Bewertungslogik an einer Stelle.

**2. Risiko** (`risk.js`) — Jede Bedrohung in `data/threats.js` liefert Faktoren
statt fertiger Zahlen:

```js
likelihood: (p) => [
  f(p.heavyReuse, 34, 'Du nutzt im Grunde dieselben zwei, drei Passwörter überall'),
  f(p.hasRealManager, -18, 'Du nutzt einen echten Passwortmanager'),
]
```

`Risiko = Wahrscheinlichkeit × Schadenshöhe ÷ 100`. Die Faktorliste wandert
unverändert in den Bericht — das ist der Kern: Jede Zahl lässt sich bis auf die
Antwort zurückverfolgen.

Weil Faktoren addiert werden, laufen ausgeprägte Profile über 100 hinaus.
Oberhalb von 75 (und unterhalb von 25) greift deshalb eine **weiche Sättigung**
statt eines harten Schnitts — sonst lägen mehrere Bedrohungen auf demselben
Maximalwert und die Rangfolge wäre zufällig.

**3. Priorisierung** (`priorities.js`) — Greedy mit **marginalem** Neuberechnen:
Der Plan endet bei vier Phasen à höchstens fünf Punkten. Was danach kommt,
verschwindet nicht, wird aber getrennt ausgewiesen — bei ausgeprägten Profilen
sind das dreißig Maßnahmen aus dem flachen Ende der Rangfolge, und eine
Aufgabenliste mit fünfzig Punkten arbeitet niemand ab.

Nach jeder gewählten Maßnahme wird das Restrisiko aktualisiert, bevor die
nächste bewertet wird. Ohne das würden sich überlappende Maßnahmen gegenseitig
hochschaukeln und der Plan wäre voller Redundanz.

Zwei Korrekturen auf die reine Effizienz-Sortierung:

- Ein Bonus auf den **größten Einzelbeitrag** — sonst verdrängen billige
  Maßnahmen mit breiter, flacher Wirkung die eine Maßnahme, die das Hauptrisiko
  adressiert.
- **Abhängigkeiten** (`REQUIRES`): Passkeys ohne Passwortmanager hängen an einem
  einzelnen Gerät, ein Backup-Test ohne Backup ist gegenstandslos. Solche
  Maßnahmen bleiben gesperrt, bis die Voraussetzung im Plan steht.

**4. Security Twin** (`twin.js`) — Ein Graph: Knoten sind Werte (Postfach,
Gerät, Bankkonto …), Kanten sind Übergänge mit profilabhängiger
Erfolgswahrscheinlichkeit. Alle Wege bis Länge 4 werden per Tiefensuche
aufgezählt und nach *Wahrscheinlichkeit × Zielwert* bewertet; angezeigt wird der
beste Weg je Einstiegspunkt. Der Graph ist klein genug für vollständige
Aufzählung — das ist deutlich nachvollziehbarer als eine Heuristik.

> **Zur Belastbarkeit:** Die Zahlen sind Modellwerte, keine Messwerte. Belastbar
> ist die *Reihenfolge* (bei dir ist A dringender als B), nicht die absolute
> Höhe. "37 Risikopunkte" bedeutet keine 37-prozentige Wahrscheinlichkeit.

---

## (d) Inhalt erweitern

Der gesamte Inhalt liegt in `src/data/` und ist von der Logik getrennt.

**Neue Frage** → `questions.js`. Die `id` ist der Schlüssel, über den die Engine
darauf zugreift — nicht umbenennen, ohne `profile.js` mitzuziehen.

```js
{
  id: 'neue_frage', section: 'devices', core: false, type: 'single',
  q: 'Frage?', help: 'Optionaler Hinweis.',
  showIf: (a) => has(a, 'computer_os', 'windows'),  // optionale Folgefrage
  options: [{ v: 'ja', label: 'Ja' }, { v: 'nein', label: 'Nein' }],
}
```

Danach in `profile.js` ein Merkmal daraus ableiten und in `threats.js`
verwenden.

**Neue Bedrohung** → `threats.js`. Braucht `base`, `baseImpact`, `likelihood`,
`impact`, `mitigations` und optional `condition` (trifft sie auf dieses Profil
überhaupt zu?).

**Neue Maßnahme** → `actions-core.js`, `actions-devices.js` oder
`actions-life.js` (nur nach Lesbarkeit aufgeteilt, inhaltlich gleichwertig).
Braucht `reduces` (Wirkungsgrad je Bedrohung), `effort`, `cost`, `difficulty`,
`appliesIf`, `steps` und `watchout`.

**Konsistenzprüfung:** Im Entwicklungsmodus prüft `actions.js` beim Start alle
Verweise zwischen Bedrohungen und Maßnahmen in beide Richtungen und meldet
Tippfehler in der Browser-Konsole. Ohne das äußern sich falsche IDs als still
fehlende Empfehlungen.

---

## (e) Aufbau

```
src/
  data/              Inhalt — ohne Logik
    questions.js       Fragenkatalog (7 Abschnitte, Folgefragen, Kurz-/Voll-Modus)
    threats.js         Bedrohungen mit Faktorfunktionen
    actions-*.js       Maßnahmen mit Anleitungen
    actions.js         Zusammenführung + Konsistenzprüfung
    products.js        Produkte und Anlaufstellen (inkl. "nicht empfohlen")
    scams.js           Betrugsszenarien im Wortlaut
    model-stats.js     Umfangszahlen als Konstanten (+ Abgleich im Dev-Modus)
  lib/
    engine/            Berechnung — ohne Seiteneffekte
      profile.js         Antworten → Merkmale
      risk.js            Bedrohungsbewertung + Sättigung
      priorities.js      Greedy-Priorisierung + Zeitplan
      twin.js            Asset-Graph + Angriffsketten
      insights.js        Kernbefunde ("das kannst du dir sparen")
      archetype.js       Risikoprofil-Muster
      index.js           runAudit(answers) → vollständiger Bericht
    storage.js         localStorage
    export.js          Markdown-Export
  hooks/
    useAudit.jsx       Zustand: Antworten, Modus, Fortschritt
    useReport.js       runAudit(answers), memoisiert — nur auf der Berichtsseite
  components/
    Icon.jsx           Inline-SVG-Icons (ersetzt Emoji, ein Stil auf jedem OS)
    Meter.jsx          Balken, Chips, Kennwerte, Score-Ring
    Layout.jsx         Kopf, Fuß, globaler Löschen-Knopf
    report/            Die sechs Reiter
  pages/               Start, Audit, Bericht, Methodik
```

Der Einstiegspunkt ist `runAudit(answers)` — Antworten rein, vollständiger
Bericht raus, deterministisch und ohne Seiteneffekte.

**Zum Ladeverhalten:** Nur die Startseite liegt im Erstbündel (~78 kB gzip).
Fragebogen, Methodik und Bericht werden per `React.lazy` nachgeladen; der
Bericht zieht dabei Engine *und* Inhaltskataloge (~74 kB gzip) nach. Deshalb
entsteht der Bericht in `useReport()` auf der Berichtsseite und nicht im
`AuditProvider` — sonst hinge jede Seite am gesamten Datensatz. Aus demselben
Grund stehen die Umfangszahlen in `model-stats.js` als Konstanten und werden
nur im Entwicklungsmodus gegen die Kataloge geprüft.

---

## (f) Grenzen

- Gebaut für **Privatpersonen**. Für Unternehmen und Vereine fehlen
  Auftragsverarbeitung, Meldepflichten und Absicherung von Beschäftigten.
- Bei **konkreter Gefährdung** (Stalking, häusliche Gewalt) ist ein
  automatisierter Bericht das falsche Werkzeug — die Anwendung verweist an
  dieser Stelle auf persönliche Beratung.
- Alles beruht auf **Selbstauskunft**. Es gibt keine technische Prüfung der
  Geräte — und genau deshalb auch kein Datenschutzproblem.
- Produktempfehlungen sind auf in Deutschland verfügbare Optionen ausgerichtet,
  ohne Affiliate-Links und ohne Anspruch auf Vollständigkeit.

## (g) Stand

Derzeit **67 Fragen** (davon 25 im Kurz-Audit) in 7 Abschnitten, **29
Bedrohungsszenarien**, **63 Maßnahmen**, **12 Archetypen** und **10
Betrugsszenarien**.

Naheliegende nächste Schritte:

- Wiederholungslauf mit Vergleich zum letzten Bericht (Fortschritt über Zeit)
- Haushaltsmodus: mehrere Profile unter einem Dach
- Kalibrierung der Basiswerte gegen aktuelle Lagebilder (BSI, Verbraucherzentrale)
- Inter als selbst gehostete `woff2` mitliefern (derzeit nur im Font-Stack
  benannt, geladen wird sie nicht — es greift die Systemschrift)

## (h) Lizenz

[MIT](LICENSE). Sicherheitshinweise bitte nicht als öffentliches Issue, sondern
wie in [SECURITY.md](SECURITY.md) beschrieben melden.

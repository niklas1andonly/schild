# Sicherheit

## Was diese Anwendung verspricht

SCHILD ist eine rein statische Seite ohne Backend. Es gibt keine Konten, keine
Server-Kommunikation, keine Analysewerkzeuge und keine Einbindungen Dritter.
Antworten liegen ausschließlich im `localStorage` des Browsers.

Das ist nicht nur eine Zusage, sondern durchgesetzt: `index.html` enthält eine
Content-Security-Policy mit `connect-src 'none'`. Damit blockiert der Browser
jede Netzwerkanfrage aus dem Anwendungscode — auch eine, die durch einen Fehler
oder eine kompromittierte Abhängigkeit hineingelangen würde.

## Selbst nachprüfen

1. DevTools öffnen (F12) → Reiter **Netzwerk** → Seite neu laden.
   Es dürfen ausschließlich Anfragen an den eigenen Host erscheinen.
2. Reiter **Anwendung** → **Lokaler Speicher**: dort steht genau ein Schlüssel,
   `schild.v1`, mit den eigenen Antworten. Der Knopf „Daten löschen" im Fuß der
   Seite entfernt ihn.
3. Die CSP steht als `<meta http-equiv="Content-Security-Policy">` im Kopf von
   `index.html` und lässt sich dort direkt lesen.

## Schwachstelle melden

Bitte keine öffentlichen Issues für Sicherheitsprobleme. Nutze stattdessen
**[GitHubs privaten Meldeweg](https://github.com/niklas1andonly/schild/security/advisories/new)**
— der Bericht ist nur für dich und mich sichtbar, bis er behoben ist.

Beschreibe möglichst:

- betroffene Datei oder Route,
- Schritte zur Reproduktion,
- die Auswirkung, die du siehst.

Ich melde mich innerhalb weniger Tage zurück. Da die Anwendung keine Daten
verarbeitet und keinen Server hat, sind die realistischen Angriffsflächen
begrenzt — besonders willkommen sind deshalb Hinweise auf:

- alles, was die CSP aushebelt oder eine Netzwerkanfrage ermöglicht,
- Wege, über die Antworten die Seite verlassen könnten,
- kompromittierte oder auffällige Abhängigkeiten in `package-lock.json`.

## Beim Selbsthosten

Setze die Header serverseitig zusätzlich zum `<meta>`-Tag — Header haben
Vorrang und decken Fälle ab, die ein Meta-Tag nicht erreicht:

```
Content-Security-Policy: default-src 'self'; connect-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
Permissions-Policy: geolocation=(), camera=(), microphone=(), interest-cohort=()
```

Die Seite braucht kein Server-Rewrite (Routing läuft über `HashRouter`) und
funktioniert auch direkt aus dem Dateisystem.

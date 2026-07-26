import { Link } from 'react-router-dom'
import { QUESTIONS } from '../data/questions.js'
import { MODEL_STATS } from '../data/model-stats.js'

function Block({ title, children, id }) {
  return (
    <section id={id} className="card scroll-mt-24 p-6">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <div className="prose-sec mt-3 space-y-3">{children}</div>
    </section>
  )
}

export default function Method() {
  const nThreats = MODEL_STATS.threats
  const nActions = MODEL_STATS.actions

  return (
    <div className="animate-fade max-w-3xl">
      <p className="label">Transparenz</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text">Wie gerechnet wird — und was das Modell nicht kann</h1>
      <p className="mt-4 text-muted">
        Ein Sicherheitsbericht, dessen Zahlen man nicht nachvollziehen kann, ist ein Orakel. Deshalb steht hier,
        wie die Werte entstehen und wo ihre Grenzen liegen.
      </p>

      <div className="mt-8 grid gap-4">
        <Block title="Der Rechenweg">
          <p>
            Aus deinen {QUESTIONS.length} möglichen Antworten wird zunächst ein verdichtetes Merkmalsprofil
            gebildet — etwa „Passwort-Hygiene 34 von 100“ oder „öffentliche Datenspur 61 von 100“.
          </p>
          <p>
            Gegen dieses Profil werden {nThreats} Bedrohungsszenarien geprüft. Jedes hat einen
            Ausgangswert für Eintrittswahrscheinlichkeit und Schadenshöhe, wie er für eine durchschnittliche
            Privatperson plausibel ist. Deine Antworten verschieben diese Werte über benannte Faktoren nach
            oben oder unten. <strong>Risiko = Wahrscheinlichkeit × Schadenshöhe ÷ 100.</strong>
          </p>
          <p>
            Weil die Faktoren addiert werden, laufen ausgeprägte Profile rechnerisch über 100 hinaus. Statt
            solche Werte hart abzuschneiden, werden sie oberhalb von 75 zunehmend gestaucht und nähern sich
            der Obergrenze an. Sonst lägen mehrere Bedrohungen auf demselben Maximalwert — und genau die
            Rangfolge, um die es hier geht, wäre zufällig.
          </p>
          <p>
            Anschließend werden {nActions} Maßnahmen bewertet: Jede hat einen hinterlegten Wirkungsgrad
            je Bedrohung sowie Aufwand, Kosten und Schwierigkeit. Ausgewählt wird schrittweise die Maßnahme mit
            dem besten Verhältnis aus entferntem Risiko zu Aufwand — und nach jeder Auswahl wird das
            verbleibende Risiko neu berechnet. Dadurch enthält der Plan keine sich überlappenden Doppelungen.
          </p>
        </Block>

        <Block title="Die Angriffsketten">
          <p>
            Für den Security Twin wird aus deinen Antworten ein Graph gebaut: Knoten sind Werte (Postfach,
            Gerät, Bankkonto …), Kanten sind mögliche Übergänge zwischen ihnen. Jeder Einstiegspunkt und jede
            Kante trägt eine Erfolgswahrscheinlichkeit, die von deinen Antworten abhängt.
          </p>
          <p>
            Anschließend werden alle Wege bis zu einer Länge von vier Schritten aufgezählt und nach
            <em> Wahrscheinlichkeit × Zielwert</em> bewertet. Angezeigt wird der jeweils beste Weg je
            Einstiegspunkt.
          </p>
        </Block>

        <Block title="Was die Zahlen nicht sind">
          <p>
            <strong>Sie sind keine Messwerte.</strong> Die Ausgangswerte beruhen auf Lagebildern, Berichten von
            Verbraucherzentralen und Polizei sowie auf der Erfahrung aus der Praxis — nicht auf einer
            statistischen Erhebung über deine Person.
          </p>
          <p>
            Belastbar ist die <strong>Reihenfolge</strong>: dass bei dir A dringender ist als B. Nicht
            belastbar ist die absolute Höhe: „37 Risikopunkte“ bedeutet keine 37-prozentige Wahrscheinlichkeit
            für irgendetwas.
          </p>
          <p>
            Das gesamte Modell beruht außerdem auf <strong>Selbstauskunft</strong>. Wer eine Frage optimistisch
            beantwortet, bekommt ein optimistisches Ergebnis. Es gibt keine technische Prüfung deiner Geräte —
            und genau deshalb auch kein Datenschutzproblem.
          </p>
        </Block>

        <Block title="Wo dieses Audit an seine Grenzen kommt">
          <p>
            Es ist für <strong>Privatpersonen</strong> gebaut. Für Unternehmen, Vereine mit Mitgliederdaten oder
            Selbstständige mit Kundendaten fehlen die relevanten Themen: Auftragsverarbeitung, Meldepflichten,
            Absicherung von Beschäftigten.
          </p>
          <p>
            Bei <strong>konkreter Gefährdung</strong> — Stalking, häusliche Gewalt, aktive Bedrohung — ist ein
            automatisierter Bericht das falsche Werkzeug. Dann brauchst du persönliche Beratung: über
            Fachberatungsstellen, das Hilfetelefon Gewalt gegen Frauen (116 016) oder die Polizei.
          </p>
          <p>
            Es ersetzt keine Rechtsberatung und keine individuelle Finanzberatung. Bei laufendem Schaden gilt
            immer zuerst: Konten sperren (116 116), dann Anzeige, dann aufräumen.
          </p>
        </Block>

        <Block title="Datenverarbeitung" id="datenverarbeitung">
          <p>
            Es gibt keine. Die Anwendung ist eine statische Seite; alle Berechnungen laufen in deinem Browser.
            Es werden keine Antworten übertragen, es gibt kein Konto, keine Cookies, keine Analysewerkzeuge
            und keine Einbindungen von Dritten.
          </p>
          <p>
            Deine Antworten liegen ausschließlich im lokalen Speicher deines Browsers und lassen sich unten
            auf jeder Seite mit einem Klick löschen. Wenn du dieses Audit auf einem geteilten Gerät machst,
            lösche sie danach.
          </p>
          <p>
            <strong>Das musst du mir nicht glauben.</strong> Die Seite verbietet sich per
            Content-Security-Policy selbst jede Netzwerkverbindung —{' '}
            <code className="rounded bg-panel2 px-1.5 py-0.5 font-mono text-xs text-accent">
              connect-src 'none'
            </code>
            . Selbst wenn irgendwo im Code oder in einer Abhängigkeit ein Aufruf nach draußen stünde, würde
            der Browser ihn blockieren.
          </p>
          <p>In drei Schritten selbst nachgeprüft:</p>
          <ol className="ml-5 list-decimal space-y-1.5">
            <li>
              <strong>F12</strong> drücken, Reiter <em>Netzwerk</em> öffnen, Seite neu laden. Es erscheinen
              ausschließlich Anfragen an diese Seite selbst.
            </li>
            <li>
              Reiter <em>Anwendung</em> → <em>Lokaler Speicher</em>: dort steht genau ein Eintrag,{' '}
              <code className="rounded bg-panel2 px-1.5 py-0.5 font-mono text-xs">schild.v1</code>, mit
              deinen eigenen Antworten.
            </li>
            <li>
              Rechtsklick → <em>Seitenquelltext anzeigen</em>: die Richtlinie steht im Kopf der Seite, lesbar
              im Klartext.
            </li>
          </ol>
          <p>
            Der gesamte Quellcode steht unter MIT-Lizenz. Wer möchte, kann die Anwendung herunterladen,
            prüfen und selbst betreiben — sie funktioniert auch ohne Server, direkt aus dem Dateisystem.
          </p>
        </Block>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/audit" className="btn btn-primary">
          Audit starten
        </Link>
        <Link to="/" className="btn">
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  )
}

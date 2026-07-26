import { Link, useNavigate } from 'react-router-dom'
import { useAudit } from '../hooks/useAudit.jsx'
import { MODEL_STATS } from '../data/model-stats.js'
import { QUESTIONS } from '../data/questions.js'
import Icon from '../components/Icon.jsx'

const coreCount = QUESTIONS.filter((q) => q.core).length

function Feature({ icon, title, children }) {
  return (
    <div className="card p-5 transition hover:border-line2">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent/25 bg-accent/[0.08] text-accent">
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <h3 className="mt-3.5 text-base font-semibold text-text">{title}</h3>
      <p className="prose-sec mt-2">{children}</p>
    </div>
  )
}

export default function Home() {
  const { hasStarted, answered, total, setMode, reset } = useAudit()
  const navigate = useNavigate()

  const start = (mode) => {
    setMode(mode)
    navigate('/audit')
  }

  return (
    <div className="animate-fade">
      {/* --- Aufmacher --- */}
      <section className="max-w-3xl">
        <p className="label">Digitales Sicherheitsaudit für Privatpersonen</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-text md:text-5xl">
          Du bekommst keinen Score.
          <br />
          <span className="text-accent">Du bekommst einen Plan.</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Die meisten Ratschläge zur IT-Sicherheit sind für alle gleich — und deshalb für niemanden
          richtig. Dieses Audit rechnet stattdessen mit deiner Situation: Was dich am ehesten trifft,
          über welchen Weg, und welche zwei Maßnahmen daran am meisten ändern.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" onClick={() => start('full')}>
            Vollständiges Audit starten
            <span className="text-xs font-normal opacity-70">· ca. 12 Min.</span>
          </button>
          <button className="btn" onClick={() => start('quick')}>
            Kurz-Audit
            <span className="text-xs font-normal opacity-60">· {coreCount} Fragen</span>
          </button>
        </div>

        {hasStarted && (
          <div className="card mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm">
            <span className="text-muted">
              Du hast bereits <strong className="text-text">{answered}</strong> von {total} Fragen beantwortet.
            </span>
            <Link to="/audit" className="font-semibold text-accent hover:underline">
              Fortsetzen
            </Link>
            <Link to="/bericht" className="font-semibold text-accent hover:underline">
              Zum Bericht
            </Link>
            <button
              className="ml-auto inline-flex items-center gap-1.5 text-xs text-faint underline underline-offset-4 hover:text-sev-critical"
              onClick={() => {
                if (confirm('Alle Antworten in diesem Browser löschen? Das lässt sich nicht rückgängig machen.')) {
                  reset()
                }
              }}
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
              Antworten löschen
            </button>
          </div>
        )}
      </section>

      {/* --- Was dabei herauskommt --- */}
      <section className="mt-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">Was du am Ende bekommst</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon="compass" title="Ein persönliches Risikoprofil">
            Kein Punktestand, sondern ein Muster: Wie du angreifbar bist und was dein Fall von dem deines
            Nachbarn unterscheidet.
          </Feature>
          <Feature icon="trend" title="Deine größten Risiken — mit Begründung">
            Jede Zahl lässt sich aufklappen. Du siehst genau, welche deiner Antworten sie nach oben und
            welche sie nach unten getrieben hat.
          </Feature>
          <Feature icon="graph" title="Security Twin & Angriffskette">
            Eine Simulation aus Angreifersicht: Wo würde jemand anfangen, wohin würde er sich bewegen — und
            an welcher Stelle bricht die Kette am günstigsten.
          </Feature>
          <Feature icon="mask" title="Welcher Betrug dich erwischt">
            Die Masche, die statistisch zu dir passt — im Wortlaut, mit den Merkmalen, an denen du sie
            erkennst.
          </Feature>
          <Feature icon="check" title="Eine echte Prioritätenliste">
            Nach Wirkung pro Aufwand sortiert, aufgeteilt in diese Woche, diesen Monat, dieses Quartal. Mit
            Schritt-für-Schritt-Anleitungen.
          </Feature>
          <Feature icon="cart" title="Konkrete Produktempfehlungen">
            Inklusive der Dinge, die du dir sparen kannst. Keine Partnerlinks, keine Provision.
          </Feature>
        </div>
      </section>

      {/* --- Haltung --- */}
      <section className="mt-16 grid gap-4 md:grid-cols-3">
        <div className="card p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-text">Warum dieses Audit unbequem sein darf</h2>
          <div className="prose-sec mt-3 space-y-3">
            <p>
              Sicherheitsberatung scheitert selten am Wissen. Sie scheitert daran, dass alle dasselbe hören:
              starke Passwörter, Virenscanner, Vorsicht im Internet. Das ist nicht falsch — es ist nur nicht
              nach Wirkung sortiert.
            </p>
            <p>
              Für die meisten Privatpersonen ist der wahrscheinlichste Vorfall keine Schadsoftware, sondern
              ein wiederverwendetes Passwort aus einem Datenleck von vor sechs Jahren. Und der häufigste
              Totalschaden hat gar keinen Täter, sondern eine defekte Festplatte.
            </p>
            <p>
              Dieses Audit sagt dir deshalb auch, <strong>was du weglassen kannst</strong>. Das ist der Teil,
              der bei kostenpflichtigen Sicherheitspaketen naturgemäß fehlt.
            </p>
          </div>
        </div>

        <div className="card border-accent/20 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
            <Icon name="lock" className="h-[18px] w-[18px] text-accent" />
            Deine Daten
          </h2>
          <ul className="prose-sec mt-3 space-y-2.5">
            <li>Alles läuft in deinem Browser.</li>
            <li>Kein Konto, kein Login, kein Server.</li>
            <li>Keine Cookies, keine Analyse, keine Einbindungen Dritter.</li>
            <li>Antworten liegen nur im lokalen Speicher und lassen sich jederzeit löschen.</li>
          </ul>
          <p className="mt-4 text-xs text-faint">
            Das ist keine Zusage auf Treu und Glauben: Die Seite untersagt sich per
            Content-Security-Policy jede Netzwerkverbindung.{' '}
            <Link to="/methodik" className="underline underline-offset-4 hover:text-muted">
              So prüfst du das selbst
            </Link>
            .
          </p>
        </div>
      </section>

      <p className="mt-10 text-xs text-faint">
        Das Modell umfasst derzeit {MODEL_STATS.threats} Bedrohungsszenarien, {MODEL_STATS.actions} Maßnahmen
        und {QUESTIONS.length} Fragen.{' '}
        <Link to="/methodik" className="underline underline-offset-4 hover:text-muted">
          Wie gerechnet wird
        </Link>
        .
      </p>
    </div>
  )
}

import { Link, useSearchParams } from 'react-router-dom'
import { useAudit } from '../hooks/useAudit.jsx'
import { useReport } from '../hooks/useReport.js'
import { downloadReport, downloadAnswers } from '../lib/export.js'
import Icon from '../components/Icon.jsx'
import Overview from '../components/report/Overview.jsx'
import Risks from '../components/report/Risks.jsx'
import Twin from '../components/report/Twin.jsx'
import Scams from '../components/report/Scams.jsx'
import Plan from '../components/report/Plan.jsx'
import Products from '../components/report/Products.jsx'

const TABS = [
  { id: 'overview', label: 'Profil', icon: 'compass', Component: Overview },
  { id: 'risks', label: 'Risiken', icon: 'trend', Component: Risks },
  { id: 'twin', label: 'Security Twin', icon: 'graph', Component: Twin },
  { id: 'scams', label: 'Scam-Simulation', icon: 'mask', Component: Scams },
  { id: 'plan', label: 'Dein Plan', icon: 'check', Component: Plan },
  { id: 'products', label: 'Produkte', icon: 'cart', Component: Products },
]

export default function Report() {
  const { hasStarted, isComplete, answered, total } = useAudit()
  const report = useReport()

  // Der Reiter steht in der URL statt im Komponentenzustand: Neuladen,
  // Zurück-Taste und ein weitergegebener Link führen dadurch an dieselbe
  // Stelle. Bei sechs Reitern ist das kein Luxus.
  const [params, setParams] = useSearchParams()
  const requested = params.get('reiter')
  const tab = TABS.some((t) => t.id === requested) ? requested : 'overview'
  const setTab = (id) => setParams(id === 'overview' ? {} : { reiter: id }, { replace: true })

  if (!hasStarted) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <h1 className="text-xl font-bold text-text">Noch keine Antworten</h1>
        <p className="prose-sec mt-2">
          Der Bericht entsteht ausschließlich aus deinen Angaben. Ohne sie gibt es nichts zu berechnen.
        </p>
        <Link to="/audit" className="btn btn-primary mt-5">
          Audit starten
        </Link>
      </div>
    )
  }

  const Active = TABS.find((t) => t.id === tab)?.Component ?? Overview

  return (
    <div className="animate-fade">
      {/* --- Kopf --- */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label">Dein Sicherheitsaudit</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-text md:text-3xl">
            {report.archetype.primary.name}
          </h1>
          <p className="mt-1.5 text-muted">{report.archetype.primary.tagline}</p>
        </div>
        <div className="no-print flex gap-2">
          <button className="btn btn-sm" onClick={() => downloadReport(report)}>
            <Icon name="download" className="h-3.5 w-3.5" />
            Als Markdown
          </button>
          <button className="btn btn-sm" onClick={() => window.print()}>
            <Icon name="printer" className="h-3.5 w-3.5" />
            Drucken
          </button>
        </div>
      </header>

      {!isComplete && (
        <div className="no-print mt-5 rounded-xl border border-sev-medium/40 bg-sev-medium/10 px-4 py-3 text-sm text-sev-medium">
          <strong>Zwischenstand.</strong>{' '}
          <span className="text-muted">
            Erst {answered} von {total} Fragen sind beantwortet — einzelne Risiken werden dadurch systematisch
            zu niedrig eingeschätzt.{' '}
            <Link to="/audit" className="font-semibold text-sev-medium underline underline-offset-4">
              Audit fortsetzen
            </Link>
          </span>
        </div>
      )}

      {/* --- Reiter --- */}
      <div className="no-print mt-6 -mx-5 overflow-x-auto border-b border-line px-5 pb-3">
        <nav className="flex min-w-max gap-1.5" aria-label="Abschnitte des Berichts">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                tab === t.id ? 'bg-panel2 font-semibold text-white' : 'text-muted hover:text-text'
              }`}
            >
              <Icon name={t.icon} className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        <Active report={report} />
      </div>

      {/* --- Beim Drucken alle Abschnitte ausgeben --- */}
      <div className="hidden print:block">
        {TABS.filter((t) => t.id !== tab).map((t) => (
          <div key={t.id} className="mt-10">
            <t.Component report={report} />
          </div>
        ))}
      </div>

      <footer className="no-print mt-14 border-t border-line pt-6 text-xs text-faint">
        <p>
          Erstellt am{' '}
          {new Date(report.generatedAt).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
          . Dieser Bericht beruht auf einem Modell und auf Selbstauskunft — beides kann danebenliegen. Er
          ersetzt keine individuelle Beratung.{' '}
          <Link to="/methodik" className="underline underline-offset-4 hover:text-muted">
            Methodik und Grenzen
          </Link>
          .
        </p>
        <button
          className="mt-3 inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-muted"
          onClick={() => downloadAnswers(report.answers)}
        >
          <Icon name="download" className="h-3.5 w-3.5" />
          Antworten als JSON sichern
        </button>
      </footer>
    </div>
  )
}

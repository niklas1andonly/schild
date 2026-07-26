import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAudit } from '../hooks/useAudit.jsx'
import Icon from './Icon.jsx'

function Tab({ to, children, disabled }) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed px-3 py-1.5 text-sm text-faint/60" title="Erst nach dem Audit verfügbar">
        {children}
      </span>
    )
  }
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-1.5 text-sm transition ${
          isActive ? 'bg-panel2 text-white' : 'text-muted hover:text-text'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const { hasStarted, reset } = useAudit()
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sprungmarke für Tastatur- und Screenreader-Nutzung: die Kopfzeile steht
          auf jeder Seite davor, der Fragebogen ist lang. */}
      <a
        href="#inhalt"
        className="no-print sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-accent/50 focus:bg-panel focus:px-4 focus:py-2 focus:text-sm focus:text-accent"
      >
        Zum Inhalt springen
      </a>

      <header className="no-print sticky top-0 z-20 h-[var(--header-h)] border-b border-line bg-base/85 backdrop-blur">
        <div className="mx-auto flex h-full max-w-5xl items-center gap-4 px-5">
          <Link to="/" className="group flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-lg border border-accent/40 bg-accent/10 text-accent"
            >
              <Icon name="shield" className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold tracking-[0.22em] text-text group-hover:text-white">SCHILD</span>
          </Link>

          <nav className="ml-auto flex items-center gap-1" aria-label="Hauptnavigation">
            <Tab to="/">Start</Tab>
            <Tab to="/audit">Audit</Tab>
            <Tab to="/bericht" disabled={!hasStarted}>
              Bericht
            </Tab>
            <Tab to="/methodik">Methodik</Tab>
          </nav>
        </div>
      </header>

      <main id="inhalt" className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:py-12">
        {children}
      </main>

      <footer className="no-print border-t border-line px-5 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Icon name="lock" className="h-3.5 w-3.5 text-accent" />
            Alle Antworten bleiben in deinem Browser. Kein Konto, kein Server, keine Auswertung durch Dritte.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Bewusst auf jeder Seite, nicht nur auf der Startseite: Wer das
                Audit auf einem geteilten Rechner macht, sucht den Ausgang dort,
                wo er gerade ist. */}
            {hasStarted && (
              <button
                className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-sev-critical"
                onClick={() => {
                  if (confirm('Alle Antworten in diesem Browser löschen? Das lässt sich nicht rückgängig machen.')) {
                    reset()
                  }
                }}
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
                Daten löschen
              </button>
            )}
            {pathname !== '/methodik' && (
              <Link to="/methodik" className="underline underline-offset-4 hover:text-muted">
                Methodik & Grenzen
              </Link>
            )}
            <span>Quelloffen · MIT-Lizenz</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

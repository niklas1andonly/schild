import { useState } from 'react'
import { Bar, SeverityChip } from '../Meter.jsx'
import Icon from '../Icon.jsx'
import { CATEGORIES } from '../../data/threats.js'
import { ACTION_BY_ID } from '../../data/actions.js'

/** Faktorliste — der Grund, warum eine Zahl so ist, wie sie ist. */
function Factors({ title, items, sign }) {
  if (!items.length) return null
  return (
    <div>
      <p className="label">{title}</p>
      <ul className="mt-2 grid gap-1.5">
        {items.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span
              className={`tabnums mt-px w-9 shrink-0 text-right text-xs font-bold ${
                sign > 0 ? 'text-sev-high' : 'text-sev-low'
              }`}
            >
              {f.delta > 0 ? '+' : ''}
              {f.delta}
            </span>
            <span className="text-muted">{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ThreatCard({ threat, rank }) {
  const [open, setOpen] = useState(rank <= 2)
  const cat = CATEGORIES[threat.category]

  return (
    <article className="card overflow-hidden">
      <button
        className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-panel2/40"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="tabnums mt-1 w-6 shrink-0 text-sm font-bold text-faint">{rank}</span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">
              <Icon name={cat.icon} className="h-3.5 w-3.5" />
              {cat.label}
            </span>
            <SeverityChip severity={threat.severity} />
          </div>

          <h3 className="mt-2.5 text-base font-semibold leading-snug text-text md:text-lg">{threat.name}</h3>
          <p className="prose-sec mt-1.5">{threat.oneLiner}</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div>
              <p className="label">Risiko</p>
              <Bar value={threat.risk} severity={threat.severity} className="mt-1" />
            </div>
            <div>
              <p className="label">Wahrscheinlichkeit</p>
              <Bar value={threat.likelihood} severity="info" className="mt-1" />
            </div>
            <div>
              <p className="label">Schadenshöhe</p>
              <Bar value={threat.impact} severity="info" className="mt-1" />
            </div>
          </div>
        </div>

        <span className={`mt-1 shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`}>
          <Icon name="chevron" className="h-4 w-4" />
        </span>
      </button>

      {open && (
        <div className="grid gap-5 border-t border-line bg-panel2/30 p-5 md:grid-cols-2">
          <Factors title="Was dieses Risiko bei dir erhöht" items={threat.likelihoodFactors.filter((f) => f.delta > 0)} sign={1} />
          <Factors title="Was dich hier bereits schützt" items={threat.likelihoodFactors.filter((f) => f.delta < 0)} sign={-1} />
          <Factors title="Was den Schaden vergrößert" items={threat.impactFactors.filter((f) => f.delta > 0)} sign={1} />
          <Factors title="Was den Schaden begrenzt" items={threat.impactFactors.filter((f) => f.delta < 0)} sign={-1} />

          {threat.mitigations.length > 0 && (
            <div className="md:col-span-2">
              <p className="label">Was dagegen hilft</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {threat.mitigations
                  .map((id) => ACTION_BY_ID[id])
                  .filter(Boolean)
                  .map((a) => (
                    <li key={a.id} className="chip border-accent/30 text-accent">
                      {a.title}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <p className="text-xs leading-relaxed text-faint md:col-span-2">
            <span className="label">Rechenweg</span>
            <br />
            Wahrscheinlichkeit: Ausgangswert {threat.base} + Faktoren = {Math.round(threat.rawLikelihood)}
            {threat.rawLikelihood > 75 || threat.rawLikelihood < 25 ? ` → ${threat.likelihood} nach Sättigung` : ''}.
            {' '}Schadenshöhe: Ausgangswert {threat.baseImpact} + Faktoren = {Math.round(threat.rawImpact)}
            {threat.rawImpact > 75 || threat.rawImpact < 25 ? ` → ${threat.impact} nach Sättigung` : ''}.
            {' '}Risiko = {threat.likelihood} × {threat.impact} ÷ 100 = <strong>{threat.risk}</strong>.
            {(threat.rawLikelihood > 75 || threat.rawImpact > 75) && (
              <>
                {' '}
                Werte über 75 werden zunehmend gestaucht, damit sie sich der Obergrenze annähern, statt an ihr
                abgeschnitten zu werden — die Rangfolge bleibt dadurch auch im Extrembereich aussagekräftig.
              </>
            )}
          </p>
        </div>
      )}
    </article>
  )
}

export default function Risks({ report }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? report.threats : report.threats.slice(0, 8)

  return (
    <div>
      <header className="max-w-2xl">
        <h2 className="text-xl font-bold text-text">Deine Risiken, nach Relevanz sortiert</h2>
        <p className="prose-sec mt-2">
          Risiko heißt hier: Eintrittswahrscheinlichkeit × Schadenshöhe. Beide Werte starten bei einem
          Durchschnittswert und werden durch deine Antworten verschoben. Klapp einen Eintrag auf, um zu sehen,
          welche Antwort welchen Anteil hat — jede Zahl lässt sich zurückverfolgen.
        </p>
      </header>

      <div className="mt-6 grid gap-4">
        {visible.map((t, i) => (
          <ThreatCard key={t.id} threat={t} rank={i + 1} />
        ))}
      </div>

      {report.threats.length > 8 && (
        <button className="btn mt-6" onClick={() => setShowAll((s) => !s)}>
          {showAll ? 'Weniger anzeigen' : `Alle ${report.threats.length} Bedrohungen anzeigen`}
        </button>
      )}
    </div>
  )
}

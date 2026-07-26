import { ScoreRing, Stat, Bar, SeverityChip } from '../Meter.jsx'
import { INSIGHT_KINDS } from '../../lib/engine/insights.js'

const KIND_STYLE = {
  headline: 'border-accent/40 bg-accent/[0.07]',
  myth: 'border-sev-medium/35 bg-sev-medium/[0.06]',
  blindspot: 'border-sev-high/35 bg-sev-high/[0.06]',
  win: 'border-sev-low/35 bg-sev-low/[0.06]',
}

const KIND_TEXT = {
  headline: 'text-accent',
  myth: 'text-sev-medium',
  blindspot: 'text-sev-high',
  win: 'text-sev-low',
}

export default function Overview({ report }) {
  const { posture, breakdown, archetype, insights, threats, ranked, effortTotal } = report
  const top3 = threats.slice(0, 3)

  return (
    <div className="grid gap-6">
      {/* --- Einordnung --- */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <ScoreRing score={posture.score} label={posture.label} />
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Kritisch" value={breakdown.critical} tone="critical" />
            <Stat label="Hoch" value={breakdown.high} tone="high" />
            <Stat label="Mittel" value={breakdown.medium} tone="medium" />
            <Stat label="Niedrig" value={breakdown.low} tone="low" />
          </div>
        </div>
        <p className="prose-sec mt-5 border-t border-line pt-4">{posture.note}</p>
      </section>

      {/* --- Archetyp --- */}
      <section className="card p-6">
        <p className="label">Dein Muster</p>
        <h2 className="mt-2 text-xl font-bold text-text">{archetype.primary.name}</h2>
        <p className="mt-1 text-accent">{archetype.primary.tagline}</p>
        <p className="prose-sec mt-3">{archetype.primary.body}</p>
        {archetype.secondary && (
          <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
            <span className="label mr-2">Zusätzlich</span>
            <strong className="text-text">{archetype.secondary.name}</strong> — {archetype.secondary.tagline}
          </p>
        )}
      </section>

      {/* --- Kernbefunde --- */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">Kernbefunde</h2>
        <div className="mt-4 grid gap-4">
          {insights.map((i) => (
            <article key={i.id} className={`rounded-2xl border p-5 md:p-6 ${KIND_STYLE[i.kind]}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${KIND_TEXT[i.kind]}`}>
                {INSIGHT_KINDS[i.kind].label}
              </p>
              <h3 className="mt-2 text-lg font-bold leading-snug text-text md:text-xl">{i.title}</h3>
              <p className="prose-sec mt-3">{i.body}</p>
              {i.evidence?.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {i.evidence.map((e, n) => (
                    <li key={n} className="chip">
                      {e}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* --- Kurzfassung --- */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-text">Deine drei größten Risiken</h2>
          <ul className="mt-4 grid gap-4">
            {top3.map((t, i) => (
              <li key={t.id}>
                <div className="flex items-center gap-2">
                  <span className="tabnums text-xs text-faint">{i + 1}</span>
                  <span className="flex-1 text-sm font-semibold text-text">{t.short}</span>
                  <SeverityChip severity={t.severity} />
                </div>
                <Bar value={t.risk} severity={t.severity} className="mt-2" />
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-text">Die drei wirksamsten nächsten Schritte</h2>
          <ol className="mt-4 grid gap-3">
            {ranked.slice(0, 3).map((a, i) => (
              <li key={a.id} className="flex gap-3">
                <span className="tabnums mt-0.5 text-xs text-faint">{i + 1}</span>
                <div>
                  <div className="text-sm font-semibold text-text">{a.title}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {a.costLabel} · senkt ca. <span className="tabnums font-semibold text-accent">{a.gain}</span>{' '}
                    Risikopunkte
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-line pt-3 text-xs text-faint">
            Gesamter Plan: {ranked.length} Maßnahmen, zusammen etwa {Math.round(effortTotal / 60)} Stunden.
          </p>
        </div>
      </section>
    </div>
  )
}

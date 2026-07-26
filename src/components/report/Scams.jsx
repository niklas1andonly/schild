import { Bar } from '../Meter.jsx'
import Icon from '../Icon.jsx'

export default function Scams({ report }) {
  const { scams } = report

  if (!scams.length) {
    return <p className="prose-sec">Für dein Profil liegt kein passendes Betrugsszenario vor.</p>
  }

  return (
    <div className="grid gap-8">
      <header className="max-w-2xl">
        <h2 className="text-xl font-bold text-text">Welcher Betrug dich am ehesten erwischt</h2>
        <p className="prose-sec mt-2">
          Diese Beispiele sind bewusst gut gemacht. Ein plumpes Beispiel erzeugt genau die falsche Sicherheit
          — echte Angriffe sehen heute so aus wie diese hier. Lies sie einmal aufmerksam; Wiedererkennung
          wirkt deutlich besser als jede allgemeine Warnung.
        </p>
      </header>

      {scams.map((s, i) => (
        <article key={s.threatId} className="card overflow-hidden">
          <div className="border-b border-line p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="tabnums text-sm font-bold text-faint">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-bold text-text">{s.threatName}</h3>
                  <p className="text-xs text-faint">Kanal: {s.channel}</p>
                </div>
              </div>
              <div className="min-w-[9rem]">
                <p className="label">Risiko bei dir</p>
                <Bar value={s.risk} severity={s.risk >= 48 ? 'critical' : s.risk >= 32 ? 'high' : 'medium'} className="mt-1" />
              </div>
            </div>
          </div>

          {/* --- Nachbildung der Nachricht --- */}
          <div className="bg-panel2/50 p-5 md:p-6">
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-sev-high/40 bg-sev-high/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sev-high">
              <Icon name="alert" className="h-3.5 w-3.5" />
              Simulation — keine echte Nachricht
            </p>
            <div className="card-inset overflow-hidden">
              <div className="border-b border-line px-4 py-2.5 text-xs">
                <p className="text-faint">
                  Von: <span className="text-muted">{s.from}</span>
                </p>
                <p className="mt-0.5 text-faint">
                  Betreff: <span className="text-muted">{s.subject}</span>
                </p>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-4 font-mono text-[13px] leading-relaxed text-text">
                {s.body}
              </pre>
            </div>
          </div>

          {/* --- Auswertung --- */}
          <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
            <div className="md:col-span-2">
              <p className="label">Warum das ausgerechnet bei dir funktioniert</p>
              <p className="prose-sec mt-2">{s.hook}</p>
            </div>

            <div>
              <p className="label">Woran du es erkennst</p>
              <ul className="mt-2 grid gap-2">
                {s.redFlags.map((f, n) => (
                  <li key={n} className="flex gap-2.5 text-sm text-muted">
                    <span className="mt-0.5 text-sev-high">
                      <Icon name="chevron" className="h-4 w-4 -rotate-90" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="label">Die richtige Reaktion</p>
              <p className="prose-sec mt-2 rounded-xl border border-sev-low/30 bg-sev-low/[0.07] p-3">{s.correct}</p>
            </div>
          </div>
        </article>
      ))}

      <p className="text-xs text-faint">
        Wenn dir etwas davon zugestoßen ist: Das ist keine Frage von Dummheit. Diese Maschen sind
        professionell gemacht und darauf ausgelegt, in einem unaufmerksamen Moment zu funktionieren. Wichtig
        ist nur, schnell zu reagieren und es nicht zu verschweigen.
      </p>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAudit } from '../hooks/useAudit.jsx'
import Icon from '../components/Icon.jsx'

// ---------------------------------------------------------------------------
// Die Antwortoptionen sind echte <input type="radio"/"checkbox">, nur optisch
// ersetzt. Das ist der Unterschied zwischen "sieht aus wie eine Auswahl" und
// "ist eine": Screenreader sagen Gruppe und Position an ("3 von 5"), die
// Pfeiltasten springen innerhalb der Gruppe, und der Zustand stimmt auch dann,
// wenn jemand die Seite per Tastatur bedient.
// ---------------------------------------------------------------------------

const CHOICE_BASE =
  'choice relative cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/60 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-base'

/** Der Punkt bzw. das Kästchen links neben der Beschriftung. */
function Marker({ multi, selected }) {
  return (
    <span
      aria-hidden
      className={`grid h-4 w-4 shrink-0 place-items-center border transition ${
        multi ? 'rounded' : 'rounded-full'
      } ${selected ? 'border-accent bg-accent/20' : 'border-line2'}`}
    >
      {selected && <span className={`h-1.5 w-1.5 bg-accent ${multi ? 'rounded-[1px]' : 'rounded-full'}`} />}
    </span>
  )
}

/** Einzelne Frage — Darstellung richtet sich nach dem Antworttyp. */
function Question({ q, value, onSingle, onMulti }) {
  const answered = Array.isArray(value) ? value.length > 0 : value != null
  const multi = q.type === 'multi'
  const titleId = `${q.id}-titel`
  const helpId = q.help ? `${q.id}-help` : undefined

  // Bewusst `role="group"` statt <fieldset>/<legend>: Ein <legend> muss
  // direktes Kind des Fieldsets sein und lässt sich deshalb nicht in das
  // Layout mit Statuspunkt einbetten, ohne ungültiges Markup zu erzeugen.
  return (
    <div role="group" aria-labelledby={titleId} className="card p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition ${answered ? 'bg-accent' : 'bg-line2'}`}
        />
        <div className="min-w-0 flex-1">
          <h3 id={titleId} className="text-base font-semibold leading-snug text-text md:text-lg">
            {q.q}
          </h3>
          {q.help && (
            <p id={helpId} className="mt-1.5 text-sm leading-relaxed text-faint">
              {q.help}
            </p>
          )}

          {q.type === 'scale' ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-5">
              {q.scale.map((s) => (
                <label key={s.v} className={`${CHOICE_BASE} text-center ${value === s.v ? 'choice-active' : ''}`}>
                  <input
                    type="radio"
                    name={q.id}
                    value={s.v}
                    checked={value === s.v}
                    onChange={() => onSingle(q.id, s.v)}
                    aria-describedby={helpId}
                    className="sr-only"
                  />
                  <span className="tabnums block text-lg font-bold">{s.v}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-muted">{s.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid gap-2">
              {q.options.map((o) => {
                const selected = Array.isArray(value) ? value.includes(o.v) : value === o.v
                return (
                  <label
                    key={o.v}
                    className={`${CHOICE_BASE} flex items-center gap-3 ${selected ? 'choice-active' : ''}`}
                  >
                    <input
                      type={multi ? 'checkbox' : 'radio'}
                      name={q.id}
                      value={o.v}
                      checked={selected}
                      onChange={() => (multi ? onMulti(q.id, o.v, o.exclusive) : onSingle(q.id, o.v))}
                      aria-describedby={helpId}
                      className="sr-only"
                    />
                    <Marker multi={multi} selected={selected} />
                    <span className="min-w-0">{o.label}</span>
                  </label>
                )
              })}
            </div>
          )}

          {multi && (
            <p className="mt-2.5 text-xs text-faint">Mehrfachauswahl — auch keine Auswahl ist eine Antwort.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Assessment() {
  const { sections, answers, setAnswer, toggleMulti, mode, setMode, answered, total, progress } = useAudit()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)

  // Sichtbare Sektionen ändern sich durch Folgefragen — Index muss im Rahmen bleiben.
  const safeIndex = Math.min(index, Math.max(0, sections.length - 1))
  const section = sections[safeIndex]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [safeIndex])

  const sectionAnswered = useMemo(() => {
    if (!section) return 0
    return section.questions.filter((q) => {
      const v = answers[q.id]
      return Array.isArray(v) ? v.length > 0 : v != null
    }).length
  }, [section, answers])

  if (!section) return null

  const isLast = safeIndex === sections.length - 1
  const pct = Math.round(progress * 100)

  return (
    <div className="animate-fade">
      {/* --- Fortschritt --- */}
      <div className="sticky top-[var(--header-h)] z-10 -mx-5 mb-8 border-b border-line bg-base/90 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-4">
          <div
            className="h-1 flex-1 overflow-hidden rounded-full bg-line"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Fortschritt im Audit"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(1.5, pct)}%` }}
            />
          </div>
          <span className="tabnums shrink-0 text-xs text-faint">
            {answered} / {total}
          </span>
        </div>

        <nav className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Abschnitte">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-current={i === safeIndex ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition ${
                i === safeIndex ? 'bg-panel2 text-white' : 'text-faint hover:text-muted'
              }`}
            >
              <Icon name={s.icon} className="h-3.5 w-3.5" />
              {s.title}
            </button>
          ))}
        </nav>
      </div>

      {/* --- Sektionskopf --- */}
      <header className="mb-6">
        <p className="label">
          Abschnitt {safeIndex + 1} von {sections.length} · {sectionAnswered}/{section.questions.length} beantwortet
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold tracking-tight text-text md:text-3xl">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/25 bg-accent/[0.08] text-accent">
            <Icon name={section.icon} className="h-[18px] w-[18px]" />
          </span>
          {section.title}
        </h1>
        <p className="mt-2 text-muted">{section.lead}</p>
      </header>

      {/* --- Fragen --- */}
      <div className="grid gap-4">
        {section.questions.map((q) => (
          <Question key={q.id} q={q} value={answers[q.id]} onSingle={setAnswer} onMulti={toggleMulti} />
        ))}
      </div>

      {/* --- Navigation --- */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button className="btn" disabled={safeIndex === 0} onClick={() => setIndex(safeIndex - 1)}>
          ← Zurück
        </button>

        {isLast ? (
          <button className="btn btn-primary" onClick={() => navigate('/bericht')}>
            Bericht erstellen →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setIndex(safeIndex + 1)}>
            Weiter →
          </button>
        )}

        <button className="btn btn-ghost btn-sm ml-auto" onClick={() => navigate('/bericht')}>
          Zwischenstand ansehen
        </button>
      </div>

      {/* --- Modus --- */}
      <div className="mt-8 border-t border-line pt-5 text-xs text-faint">
        {mode === 'quick' ? (
          <p>
            Du bist im Kurz-Audit. Es liefert eine belastbare Ersteinschätzung, aber ohne die Details für
            Angriffsketten und Feinabstimmung.{' '}
            <button className="underline underline-offset-4 hover:text-muted" onClick={() => setMode('full')}>
              Auf vollständiges Audit wechseln
            </button>{' '}
            — deine bisherigen Antworten bleiben erhalten.
          </p>
        ) : (
          <p>
            Unsichere Angaben sind kein Problem: Wähle im Zweifel „Weiß ich nicht“. Das ist selbst eine
            Information und fließt entsprechend in die Bewertung ein.
          </p>
        )}
      </div>
    </div>
  )
}

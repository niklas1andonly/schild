import { useState } from 'react'
import { useAudit } from '../../hooks/useAudit.jsx'
import Icon from '../Icon.jsx'
import { effortLabel, DIFFICULTY_LABEL, ACTION_CATEGORIES } from '../../data/actions.js'
import { PRODUCTS } from '../../data/products.js'
import { totalEffort } from '../../lib/engine/priorities.js'

function ActionCard({ action, profile, index }) {
  const { doneActions, toggleDone } = useAudit()
  const [open, setOpen] = useState(false)
  const done = (doneActions ?? []).includes(action.id)
  const cat = ACTION_CATEGORIES[action.category]
  const why = typeof action.why === 'function' ? action.why(profile) : action.why

  return (
    <article className={`card overflow-hidden transition ${done ? 'opacity-55' : ''}`}>
      <div className="flex items-start gap-4 p-5">
        <button
          onClick={() => toggleDone(action.id)}
          className={`no-print mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition ${
            done ? 'border-accent bg-accent/20 text-accent' : 'border-line2 text-transparent hover:border-accent/50'
          }`}
          aria-label={done ? 'Als offen markieren' : 'Als erledigt markieren'}
          aria-pressed={done}
        >
          <Icon name="tick" className="h-3.5 w-3.5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">
              <Icon name={cat?.icon} className="h-3.5 w-3.5" />
              {cat?.label}
            </span>
            <span className="chip">{effortLabel(action.effort)}</span>
            <span className="chip">{action.costLabel}</span>
            <span className="chip">{DIFFICULTY_LABEL[action.difficulty]}</span>
            {action.recurring && <span className="chip">wiederkehrend: {action.recurring}</span>}
          </div>

          <h3 className={`mt-3 text-base font-semibold leading-snug md:text-lg ${done ? 'text-muted line-through' : 'text-text'}`}>
            <span className="tabnums mr-2 text-faint">{index}.</span>
            {action.title}
          </h3>
          <p className="prose-sec mt-1.5">{action.oneLiner}</p>

          {/* --- Wirkung --- */}
          <div className="mt-4 rounded-xl border border-line bg-panel2/40 p-3.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="label">Wirkung</span>
              <span className="tabnums font-bold text-accent" title="Summe über alle Bedrohungen, die diese Maßnahme senkt">
                −{action.gain} Risikopunkte
              </span>
              {action.affects.slice(0, 3).map((a) => (
                <span key={a.threatId} className="text-faint">
                  {a.threat?.short} <span className="tabnums text-accent">−{a.removes}</span>
                </span>
              ))}
            </div>
          </div>

          <button
            className="no-print mt-4 text-sm font-semibold text-accent hover:underline"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? 'Anleitung schließen' : 'Warum und wie — Anleitung öffnen'}
          </button>
        </div>
      </div>

      {(open || false) && (
        <div className="grid gap-5 border-t border-line bg-panel2/30 p-5">
          <div>
            <p className="label">Warum das bei dir zählt</p>
            <p className="prose-sec mt-2">{why}</p>
          </div>

          <div>
            <p className="label">Schritt für Schritt</p>
            <ol className="mt-3 grid gap-3">
              {(action.steps ?? []).map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    aria-hidden
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line2 bg-panel text-xs font-bold text-muted"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text">{s.t}</div>
                    <p className="prose-sec mt-0.5">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {action.watchout && (
            <div className="rounded-xl border border-sev-medium/30 bg-sev-medium/[0.07] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sev-medium">
                Der Fehler, den fast alle machen
              </p>
              <p className="prose-sec mt-1.5">{action.watchout}</p>
            </div>
          )}

          {action.products?.length > 0 && (
            <div>
              <p className="label">Womit</p>
              <ul className="mt-2 grid gap-2">
                {action.products
                  .map((id) => PRODUCTS[id])
                  .filter(Boolean)
                  .map((p) => (
                    <li
                      key={p.name}
                      className={`card-inset p-3 ${p.tier === 'avoid' ? 'border-sev-critical/30' : ''}`}
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-semibold text-text">{p.name}</span>
                        <span className="text-xs text-faint">{p.price}</span>
                        {p.tier === 'pick' && (
                          <span className="rounded border border-accent/40 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                            Empfehlung
                          </span>
                        )}
                        {p.tier === 'avoid' && (
                          <span className="rounded border border-sev-critical/40 px-1.5 py-0.5 text-[10px] font-semibold text-sev-critical">
                            Nicht empfohlen
                          </span>
                        )}
                      </div>
                      <p className="prose-sec mt-1">{p.note}</p>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-1.5 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          {p.url.replace(/^https?:\/\//, '')}
                          <Icon name="external" className="h-3 w-3" />
                        </a>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default function Plan({ report }) {
  const { doneActions } = useAudit()
  const { plan, ranked, alreadyDone, profile, costTotal } = report
  const doneCount = ranked.filter((a) => (doneActions ?? []).includes(a.id)).length

  let counter = 0

  return (
    <div className="grid gap-8">
      <header className="max-w-2xl">
        <h2 className="text-xl font-bold text-text">Dein Plan</h2>
        <p className="prose-sec mt-2">
          Die Reihenfolge ist berechnet, nicht redaktionell gesetzt: Jede Maßnahme wurde danach bewertet,
          wie viel Risiko sie <em>in deinem konkreten Bild</em> pro investierter Stunde entfernt. Nach jeder
          Auswahl wurde neu gerechnet — deshalb steht hier nichts doppelt.
        </p>
        <p className="prose-sec mt-3">
          <strong>Wichtig:</strong> Arbeite von oben nach unten und hör auf, wenn du keine Lust mehr hast. Die
          ersten drei Punkte tragen den Großteil der Wirkung.
        </p>
        <p className="mt-3 text-xs text-faint">
          Die Angabe „−x Risikopunkte“ ist die Summe über alle Bedrohungen, die eine Maßnahme senkt. Sie kann
          deshalb über 100 liegen und ist nicht mit dem Risikowert einer einzelnen Bedrohung vergleichbar.
        </p>
      </header>

      {/* --- Übersicht --- */}
      <div className="card flex flex-wrap gap-x-8 gap-y-4 p-5">
        <div>
          <p className="label">Maßnahmen</p>
          <p className="tabnums mt-1 text-xl font-bold text-text">
            {doneCount} <span className="text-sm font-medium text-faint">/ {ranked.length} erledigt</span>
          </p>
        </div>
        <div>
          <p className="label">Zeitaufwand gesamt</p>
          <p className="tabnums mt-1 text-xl font-bold text-text">
            {Math.round(totalEffort(ranked) / 60)} <span className="text-sm font-medium text-faint">Stunden</span>
          </p>
        </div>
        <div>
          <p className="label">Kosten gesamt</p>
          <p className="tabnums mt-1 text-xl font-bold text-text">
            {costTotal === 0 ? 'Keine' : `bis ${costTotal} €`}
          </p>
        </div>
        <div className="min-w-[12rem] flex-1">
          <p className="label">Anteil kostenloser Maßnahmen</p>
          <p className="mt-1 text-sm text-muted">
            {ranked.filter((a) => (a.cost ?? 0) === 0).length} von {ranked.length} Maßnahmen kosten nichts
            außer Zeit.
          </p>
        </div>
      </div>

      {/* --- Phasen --- */}
      {plan.map((phase) => (
        <section key={phase.id}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-text">{phase.title}</h3>
            <span className="text-xs text-faint">
              {phase.items.length} Punkte · {effortLabel(totalEffort(phase.items))}
            </span>
          </div>
          <p className="prose-sec mt-1">{phase.lead}</p>

          {/* Der Überhang bekommt bewusst keine Karten: Er soll nachschlagbar
              sein, aber nicht wie eine Aufgabenliste aussehen. */}
          {phase.collapsed ? (
            <details className="card mt-4 p-5">
              <summary className="cursor-pointer text-sm font-semibold text-accent">
                {phase.items.length} Maßnahmen anzeigen
              </summary>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {phase.items.map((a) => {
                  counter += 1
                  return (
                    <li key={a.id} className="card-inset p-3">
                      <div className="text-sm font-semibold text-text">
                        <span className="tabnums mr-2 text-faint">{counter}.</span>
                        {a.title}
                      </div>
                      <p className="tabnums mt-0.5 text-xs text-faint">
                        {effortLabel(a.effort)} · −{a.gain} Risikopunkte
                      </p>
                    </li>
                  )
                })}
              </ul>
            </details>
          ) : (
            <div className="mt-4 grid gap-4">
              {phase.items.map((a) => {
                counter += 1
                return <ActionCard key={a.id} action={a} profile={profile} index={counter} />
              })}
            </div>
          )}
        </section>
      ))}

      {/* --- Bereits erledigt --- */}
      {alreadyDone.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">
            Das hast du laut deinen Angaben bereits
          </h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {alreadyDone.map((a) => (
              <li key={a.id} className="card-inset flex items-start gap-2.5 p-3">
                <span className="mt-0.5 text-sev-low">
                  <Icon name="tick" className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-text">{a.title}</div>
                  <p className="mt-0.5 text-xs text-faint">{a.oneLiner}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

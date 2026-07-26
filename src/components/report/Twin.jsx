import { Bar, SEV_TEXT } from '../Meter.jsx'
import Icon from '../Icon.jsx'
import { ACTION_BY_ID } from '../../data/actions.js'

const ROLE_STYLE = {
  Generalschlüssel: 'border-sev-critical/40 text-sev-critical',
  Ziel: 'border-sev-high/40 text-sev-high',
  Gerät: 'border-sev-info/40 text-sev-info',
  Brücke: 'border-sev-medium/40 text-sev-medium',
  Identität: 'border-sev-medium/40 text-sev-medium',
}

function defenseTone(d) {
  if (d >= 70) return 'low'
  if (d >= 50) return 'medium'
  if (d >= 30) return 'high'
  return 'critical'
}

function AssetCard({ asset }) {
  return (
    <div className="card-inset p-4">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-muted">
          <Icon name={asset.icon} className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-text">{asset.label}</h4>
            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${ROLE_STYLE[asset.role] ?? 'border-line2 text-faint'}`}>
              {asset.role}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-faint">{asset.note}</p>

          <div className="mt-3 grid gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-faint">Wert für Angreifer</span>
              <Bar value={asset.value} severity="high" className="flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-faint">Abgesichert</span>
              <Bar value={asset.defense} severity={defenseTone(asset.defense)} className="flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chain({ chain }) {
  const breakAction = chain.breakPoint ? ACTION_BY_ID[chain.breakPoint] : null

  return (
    <article className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label">Angriffsweg {chain.rank}</p>
          <h3 className="mt-2 text-lg font-bold leading-snug text-text">
            {chain.entry.label} <span className="text-faint">→</span> {chain.goal.label}
          </h3>
        </div>
        <div className="text-right">
          <div className="tabnums text-2xl font-bold text-sev-high">{Math.round(chain.probability * 100)}%</div>
          <div className="text-[11px] text-faint">{chain.likelihoodLabel}</div>
        </div>
      </div>

      {/* --- Schritte --- */}
      <ol className="mt-6 grid gap-0">
        {chain.steps.map((s, i) => (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Verbindungslinie */}
            {i < chain.steps.length - 1 && (
              <span aria-hidden className="absolute left-[15px] top-8 h-full w-px bg-line" />
            )}

            <span
              aria-hidden
              className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                i === 0 ? 'border-sev-critical/50 bg-sev-critical/15 text-sev-critical' : 'border-line2 bg-panel2 text-muted'
              }`}
            >
              {i + 1}
            </span>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <h4 className="text-sm font-semibold text-text">{s.method}</h4>
                <span className="tabnums text-xs text-faint">{Math.round(s.p * 100)}% Erfolgsaussicht</span>
              </div>
              <p className="prose-sec mt-1">{s.why}</p>
              <p className="mt-1.5 text-xs text-faint">
                Ergebnis: Zugriff auf <span className="font-semibold text-muted">{s.toLabel}</span>
              </p>

              {s.stoppedBy?.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {s.stoppedBy
                    .map((id) => ACTION_BY_ID[id])
                    .filter(Boolean)
                    .map((a) => (
                      <li key={a.id} className="chip border-accent/30 text-accent">
                        <Icon name="shield" className="h-3.5 w-3.5" />
                        {a.title}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      {breakAction && (
        <div className="mt-5 rounded-xl border border-accent/30 bg-accent/[0.07] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            Der günstigste Abbruchpunkt
          </p>
          <p className="prose-sec mt-2">
            Diese Kette bricht am frühesten durch <strong>{breakAction.title}</strong>. Am ersten Schritt
            einzugreifen ist am wirksamsten — gelingt der Einstieg nicht, wird alles Nachfolgende
            gegenstandslos.
          </p>
        </div>
      )}
    </article>
  )
}

export default function Twin({ report }) {
  const { twin } = report

  return (
    <div className="grid gap-8">
      <header className="max-w-2xl">
        <h2 className="text-xl font-bold text-text">Dein digitaler Zwilling</h2>
        <p className="prose-sec mt-2">
          Aus deinen Antworten entsteht ein Modell: welche Werte bei dir existieren, wie gut sie abgesichert
          sind und welche Übergänge zwischen ihnen möglich sind. Darauf läuft dann dieselbe Frage, die ein
          Angreifer stellen würde — <strong>wo fange ich an und wohin komme ich von dort?</strong>
        </p>
      </header>

      {/* --- Kronjuwelen und Schwachstellen --- */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-base font-semibold text-text">Deine Kronjuwelen</h3>
          <p className="prose-sec mt-1">Das, was ein Angreifer eigentlich will.</p>
          <ul className="mt-4 grid gap-2.5">
            {twin.crownJewels.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <Icon name={a.icon} className="h-4 w-4 text-faint" />
                <span className="flex-1 text-sm text-text">{a.label}</span>
                <span className="tabnums text-xs font-bold text-sev-high">{a.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-text">Die schwächsten wertvollen Punkte</h3>
          <p className="prose-sec mt-1">Hoher Wert, geringe Absicherung — hier setzt ein Angriff an.</p>
          <ul className="mt-4 grid gap-2.5">
            {twin.weakest.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <Icon name={a.icon} className="h-4 w-4 text-faint" />
                <span className="flex-1 text-sm text-text">{a.label}</span>
                <span className={`tabnums text-xs font-bold ${SEV_TEXT[defenseTone(a.defense)]}`}>
                  {a.defense}% abgesichert
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Angriffsketten --- */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">
          Die wahrscheinlichsten Angriffsketten
        </h3>
        <div className="mt-4 grid gap-5">
          {twin.chains.map((c) => (
            <Chain key={c.id} chain={c} />
          ))}
        </div>
        <p className="mt-4 text-xs text-faint">
          Die Prozentwerte sind Modellwerte und dienen der Einordnung der Reihenfolge — nicht der Vorhersage
          von Einzelfällen. Belastbar ist die Aussage, welcher Weg bei dir <em>verhältnismäßig</em> am
          leichtesten gangbar ist.
        </p>
      </section>

      {/* --- Vollständige Karte --- */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">Alle erfassten Werte</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {twin.assets
            .slice()
            .sort((a, b) => b.value - a.value)
            .map((a) => (
              <AssetCard key={a.id} asset={a} />
            ))}
        </div>
      </section>
    </div>
  )
}

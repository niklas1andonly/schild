// Kleine, wiederverwendbare Darstellungsbausteine für Zahlenwerte.
// Farben folgen durchgängig der Schweregrad-Skala aus risk.js.

const SEV_BAR = {
  critical: 'bg-sev-critical',
  high: 'bg-sev-high',
  medium: 'bg-sev-medium',
  low: 'bg-sev-low',
  info: 'bg-sev-info',
  accent: 'bg-accent',
}

const SEV_TEXT = {
  critical: 'text-sev-critical',
  high: 'text-sev-high',
  medium: 'text-sev-medium',
  low: 'text-sev-low',
  info: 'text-sev-info',
  accent: 'text-accent',
}

const SEV_LABEL = {
  critical: 'Kritisch',
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
}

export { SEV_BAR, SEV_TEXT, SEV_LABEL }

/** Waagerechter Balken mit Wert von 0 bis 100. */
export function Bar({ value, severity = 'accent', className = '', label }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full origin-left rounded-full ${SEV_BAR[severity]} animate-grow`}
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
      {label !== false && (
        <span className={`tabnums w-9 text-right text-xs font-semibold ${SEV_TEXT[severity]}`}>{Math.round(value)}</span>
      )}
    </div>
  )
}

/** Farbige Einordnung als Chip. */
export function SeverityChip({ severity }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${SEV_TEXT[severity]}`}
      style={{ borderColor: 'currentColor', opacity: 0.95 }}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${SEV_BAR[severity]}`} />
      {SEV_LABEL[severity]}
    </span>
  )
}

/** Großer Kennwert für die Übersicht. */
export function Stat({ label, value, suffix, tone = 'text' }) {
  const toneClass = SEV_TEXT[tone] ?? 'text-text'
  return (
    <div className="card-inset px-4 py-3">
      <div className="label">{label}</div>
      <div className={`tabnums mt-1 text-2xl font-bold ${toneClass}`}>
        {value}
        {suffix && <span className="ml-1 text-sm font-medium text-faint">{suffix}</span>}
      </div>
    </div>
  )
}

/** Kreisförmige Gesamteinschätzung. */
export function ScoreRing({ score, label }) {
  const r = 46
  const c = 2 * Math.PI * r
  const tone = score >= 75 ? 'low' : score >= 55 ? 'medium' : score >= 35 ? 'high' : 'critical'
  const stroke = { low: '#4ade80', medium: '#ffd23f', high: '#ff9f43', critical: '#ff5c5c' }[tone]

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
          <circle cx="56" cy="56" r={r} fill="none" stroke="#222c3a" strokeWidth="9" />
          <circle
            cx="56"
            cy="56"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * score) / 100}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="tabnums text-2xl font-bold text-text">{score}</div>
            <div className="text-[10px] uppercase tracking-widest text-faint">von 100</div>
          </div>
        </div>
      </div>
      <div>
        <div className="label">Gesamteinschätzung</div>
        <div className="mt-1 text-xl font-bold text-text">{label}</div>
      </div>
    </div>
  )
}

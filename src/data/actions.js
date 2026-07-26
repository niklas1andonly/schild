// ---------------------------------------------------------------------------
// Maßnahmenkatalog — Zusammenführung
// ---------------------------------------------------------------------------

import { ACTIONS_CORE } from './actions-core.js'
import { ACTIONS_DEVICES } from './actions-devices.js'
import { ACTIONS_LIFE } from './actions-life.js'
import { THREAT_BY_ID } from './threats.js'

export const ACTIONS = [...ACTIONS_CORE, ...ACTIONS_DEVICES, ...ACTIONS_LIFE]

export const ACTION_BY_ID = Object.fromEntries(ACTIONS.map((a) => [a.id, a]))

export const ACTION_CATEGORIES = {
  accounts: { label: 'Konten & Zugänge', icon: 'key' },
  devices: { label: 'Geräte & Software', icon: 'laptop' },
  network: { label: 'Netzwerk & unterwegs', icon: 'antenna' },
  money: { label: 'Geld & Werte', icon: 'card' },
  data: { label: 'Daten & Arbeit', icon: 'folder' },
  behavior: { label: 'Verhalten & Routinen', icon: 'brain' },
  privacy: { label: 'Privatsphäre', icon: 'eye' },
  family: { label: 'Familie', icon: 'family' },
}

/** Aufwand in eine lesbare Angabe übersetzen. */
export function effortLabel(minutes) {
  if (minutes <= 10) return 'ca. 10 Min.'
  if (minutes < 60) return `ca. ${minutes} Min.`
  const h = minutes / 60
  return h === 1 ? 'ca. 1 Std.' : `ca. ${h % 1 === 0 ? h : h.toFixed(1)} Std.`
}

export const DIFFICULTY_LABEL = {
  1: 'Einfach',
  2: 'Etwas Aufwand',
  3: 'Für Fortgeschrittene',
}

// --- Konsistenzprüfung (nur im Entwicklungsmodus) --------------------------
// Fängt Tippfehler in den Verweisen zwischen Bedrohungen und Maßnahmen ab,
// bevor sie sich als still fehlende Empfehlungen im Report äußern.
if (import.meta.env?.DEV) {
  const problems = []

  const ids = new Set()
  for (const a of ACTIONS) {
    if (ids.has(a.id)) problems.push(`Doppelte Maßnahmen-ID: ${a.id}`)
    ids.add(a.id)
    for (const tid of Object.keys(a.reduces ?? {})) {
      if (!THREAT_BY_ID[tid]) problems.push(`Maßnahme "${a.id}" verweist auf unbekannte Bedrohung "${tid}"`)
    }
  }

  for (const t of Object.values(THREAT_BY_ID)) {
    for (const aid of t.mitigations ?? []) {
      if (!ids.has(aid)) problems.push(`Bedrohung "${t.id}" verweist auf unbekannte Maßnahme "${aid}"`)
    }
  }

  if (problems.length) {
    console.warn(`[SCHILD] ${problems.length} Katalog-Inkonsistenz(en):\n` + problems.join('\n'))
  }
}

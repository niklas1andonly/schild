// ---------------------------------------------------------------------------
// Speicherung
// ---------------------------------------------------------------------------
// Ausschließlich localStorage. Es gibt kein Backend, keine Analyse, keinen
// Netzwerkaufruf — das ist bei einem Sicherheitsaudit keine Sparmaßnahme,
// sondern die Voraussetzung dafür, dass jemand ehrlich antwortet.
// ---------------------------------------------------------------------------

const KEY = 'schild.v1'

const empty = () => ({ answers: {}, mode: 'full', doneActions: [], updatedAt: null })

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    return { ...empty(), ...parsed }
  } catch {
    // Beschädigter Eintrag darf die App nicht blockieren.
    return empty()
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }))
  } catch {
    // Speicher voll oder gesperrt (privater Modus) — das Audit läuft trotzdem,
    // es überlebt dann nur kein Neuladen.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nichts zu tun */
  }
}

/** Anzahl beantworteter Fragen — für "fortsetzen"-Hinweise auf der Startseite. */
export function answeredCount(answers = {}) {
  return Object.values(answers).filter((v) => (Array.isArray(v) ? v.length > 0 : v != null)).length
}

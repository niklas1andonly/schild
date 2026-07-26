import { useMemo } from 'react'
import { useAudit } from './useAudit.jsx'
import { runAudit } from '../lib/engine/index.js'

/**
 * Der vollständige Bericht zu den aktuellen Antworten.
 *
 * Bewusst hier und nicht im Provider: Dieser Import zieht die Rechen-Engine und
 * den gesamten Inhaltsdatensatz nach sich. Weil ihn nur die (nachgeladene)
 * Berichtsseite verwendet, landet beides in einem eigenen Bündel und fehlt beim
 * ersten Aufruf der Startseite.
 *
 * `runAudit` ist rein und deterministisch — memoisieren reicht.
 */
export function useReport() {
  const { answers } = useAudit()
  return useMemo(() => runAudit(answers), [answers])
}

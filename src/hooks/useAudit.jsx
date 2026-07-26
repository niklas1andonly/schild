import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadState, saveState, clearState, answeredCount } from '../lib/storage.js'
import { visibleQuestions, visibleSections } from '../data/questions.js'

// ---------------------------------------------------------------------------
// Zentraler Zustand: Antworten, Modus, Fortschritt.
//
// Der Bericht entsteht bewusst *nicht* hier, sondern in `useReport()` auf der
// Berichtsseite. Sonst hinge der Provider — und damit jede Seite, auch die
// Startseite — an der Rechen-Engine und am gesamten Inhaltsdatensatz.
// ---------------------------------------------------------------------------

const AuditContext = createContext(null)

export function AuditProvider({ children }) {
  const [state, setState] = useState(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const setAnswer = useCallback((id, value) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: value } }))
  }, [])

  const toggleMulti = useCallback((id, value, exclusive = false) => {
    setState((s) => {
      const current = Array.isArray(s.answers[id]) ? s.answers[id] : []
      let next
      if (exclusive) {
        // "Nichts davon" schließt alles andere aus — und umgekehrt.
        next = current.includes(value) ? [] : [value]
      } else {
        next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      }
      return { ...s, answers: { ...s.answers, [id]: next } }
    })
  }, [])

  const setMode = useCallback((mode) => setState((s) => ({ ...s, mode })), [])

  const toggleDone = useCallback((actionId) => {
    setState((s) => {
      const done = s.doneActions ?? []
      return {
        ...s,
        doneActions: done.includes(actionId) ? done.filter((x) => x !== actionId) : [...done, actionId],
      }
    })
  }, [])

  const reset = useCallback(() => {
    clearState()
    setState(loadState())
  }, [])

  const questions = useMemo(() => visibleQuestions(state.answers, state.mode), [state.answers, state.mode])
  const sections = useMemo(() => visibleSections(state.answers, state.mode), [state.answers, state.mode])

  const answered = useMemo(
    () => questions.filter((q) => {
      const v = state.answers[q.id]
      return Array.isArray(v) ? v.length > 0 : v != null
    }).length,
    [questions, state.answers],
  )

  const value = {
    ...state,
    setAnswer,
    toggleMulti,
    setMode,
    toggleDone,
    reset,
    questions,
    sections,
    answered,
    total: questions.length,
    progress: questions.length ? answered / questions.length : 0,
    hasStarted: answeredCount(state.answers) > 0,
    // Ein Bericht ist erst dann aussagekräftig, wenn die Kernfragen beantwortet sind.
    isComplete: answered >= Math.max(8, Math.round(questions.length * 0.75)),
  }

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
}

export function useAudit() {
  const ctx = useContext(AuditContext)
  if (!ctx) throw new Error('useAudit muss innerhalb von <AuditProvider> verwendet werden')
  return ctx
}

// ---------------------------------------------------------------------------
// Golden-Snapshots
// ---------------------------------------------------------------------------
// Der eigentliche Schutz beim Erweitern des Inhalts: Eine neue Maßnahme ändert
// über das marginale Neuberechnen die Reihenfolge *aller* anderen. Ohne
// Snapshot merkt man das nicht.
//
// Festgehalten wird bewusst nicht der ganze Bericht, sondern ein Auszug: die
// Zahlen und Reihenfolgen, deren Änderung eine Aussage ist. Anleitungstexte und
// Produktbeschreibungen gehören nicht dazu — sie würden den Diff zumüllen und
// bei jeder Formulierungskorrektur ausschlagen.
//
// Ein ausgeschlagener Snapshot ist kein Fehler, sondern eine Frage: Wolltest du
// das? Wenn ja: `npm run test:update`.
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest'

import { runAudit } from '../src/lib/engine/index.js'
import { PERSONAS, quickOnly } from './fixtures/personas.js'

const digest = (report) => ({
  gesamtbild: {
    score: report.posture.score,
    label: report.posture.label,
    verteilung: report.breakdown,
    aufwandMinuten: report.effortTotal,
    kostenProJahr: report.costTotal,
  },
  archetyp: [report.archetype.primary.id, report.archetype.secondary?.id ?? null],
  // Rechenweg je Bedrohung — hier fällt jede Verschiebung eines Basiswerts auf.
  bedrohungen: report.threats.map(
    (t) => `${t.risk.toString().padStart(2)} = ${t.likelihood}×${t.impact}  ${t.severity.padEnd(8)} ${t.id}`,
  ),
  kernbefunde: report.insights.map((i) => `${i.kind}: ${i.title}`),
  plan: report.plan.map((p) => ({
    phase: p.id,
    punkte: p.items.map((i) => `${i.id} (−${i.gain}, ${i.effort} Min.)`),
  })),
  bereitsErledigt: report.alreadyDone.map((a) => a.id).sort(),
  angriffsketten: report.twin.chains.map(
    (c) =>
      `${(c.probability * 100).toFixed(1)} %  ${c.entry.id} ⇒ ${c.steps.map((s) => s.to).join(' → ')}  [stoppt: ${c.breakPoint ?? '—'}]`,
  ),
  kronjuwelen: report.twin.crownJewels.map((a) => `${a.id} (Wert ${a.value}, Schutz ${a.defense})`),
  schwachstellen: report.twin.weakest.map((a) => `${a.id} (Wert ${a.value}, Schutz ${a.defense})`),
  scams: report.scams.map((s) => s.threatId),
  produkte: report.products.map((p) => p.name),
})

describe('Bericht je Profil', () => {
  it.each(Object.entries(PERSONAS))('%s', (_name, answers) => {
    expect(digest(runAudit(answers))).toMatchSnapshot()
  })

  it('Kurz-Audit (nur Kernfragen)', () => {
    expect(digest(runAudit(quickOnly))).toMatchSnapshot()
  })
})

describe('Kurz-Audit gegen Voll-Audit', () => {
  // Beide Läufe beschreiben dieselbe Person — einmal über 67 Fragen, einmal
  // über die 25 Kernfragen. Wie weit die Einschätzungen auseinanderliegen
  // dürfen, ist eine Kalibrierungsfrage, keine Rechenfrage. Hier steht der
  // gemessene Stand, damit eine Verschiebung sichtbar wird.
  const full = runAudit(PERSONAS.exposed)
  const quick = runAudit(quickOnly)

  it('benennt im Kern dieselben Bedrohungen', () => {
    const topFull = full.threats.slice(0, 5).map((t) => t.id)
    const topQuick = quick.threats.slice(0, 5).map((t) => t.id)
    const overlap = topFull.filter((id) => topQuick.includes(id)).length
    expect(overlap, `Top-5 überschneiden sich nur in ${overlap} Punkten`).toBeGreaterThanOrEqual(3)
  })

  it('schätzt das Kurz-Audit systematisch harmloser ein', () => {
    // Fehlende Antworten wirken wie unauffällige Antworten: Das Kurz-Audit
    // vergibt für dasselbe Profil 43 statt 21 Punkte und landet damit zwei
    // Stufen höher ("Ausbaufähig" statt "Kritisch"). Das ist der wichtigste
    // Kandidat für die Kalibrierung.
    expect(quick.posture.score).toBeGreaterThan(full.posture.score)
    expect(quick.posture.score - full.posture.score).toBeLessThanOrEqual(30)
  })
})

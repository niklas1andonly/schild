// ---------------------------------------------------------------------------
// Invarianten der Engine
// ---------------------------------------------------------------------------
// Diese Tests prüfen keine konkreten Zahlen — das machen die Snapshots. Hier
// steht, was für *jedes* Profil gelten muss, egal wie der Inhalt sich noch
// entwickelt. Wenn eine dieser Zusagen bricht, ist der Bericht in sich falsch,
// nicht nur anders.
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest'

import { runAudit } from '../src/lib/engine/index.js'
import { buildProfile } from '../src/lib/engine/profile.js'
import { assessThreats, severityOf } from '../src/lib/engine/risk.js'
import { prioritize, totalEffort, totalCost } from '../src/lib/engine/priorities.js'
import { buildTwin } from '../src/lib/engine/twin.js'
import { ACTION_BY_ID } from '../src/data/actions.js'
import { ALL_PROFILES } from './fixtures/personas.js'

const cases = Object.entries(ALL_PROFILES)
const each = (name, fn) => describe(name, () => it.each(cases)('%s', (_n, answers) => fn(answers)))

// --- Bewertung --------------------------------------------------------------

each('Bedrohungen bleiben im gültigen Bereich', (answers) => {
  for (const t of assessThreats(buildProfile(answers))) {
    // Die weiche Sättigung nähert sich 1 bzw. 99 an, erreicht sie aber nie.
    expect(t.likelihood, `${t.id}.likelihood`).toBeGreaterThanOrEqual(1)
    expect(t.likelihood, `${t.id}.likelihood`).toBeLessThanOrEqual(99)
    expect(t.impact, `${t.id}.impact`).toBeGreaterThanOrEqual(1)
    expect(t.impact, `${t.id}.impact`).toBeLessThanOrEqual(99)
    expect(t.risk, `${t.id}.risk`).toBe(Math.round((t.likelihood * t.impact) / 100))
    expect(t.severity, `${t.id}.severity`).toBe(severityOf(t.risk))
  }
})

each('Bedrohungen sind absteigend nach Risiko sortiert', (answers) => {
  const risks = assessThreats(buildProfile(answers)).map((t) => t.risk)
  expect(risks).toEqual([...risks].sort((a, b) => b - a))
})

each('jeder Faktor ist beschriftet und wirkt tatsächlich', (answers) => {
  for (const t of assessThreats(buildProfile(answers))) {
    for (const f of [...t.likelihoodFactors, ...t.impactFactors]) {
      // Ein Faktor ohne Begründung wäre genau die Zahl, die der Bericht nicht
      // erklären kann — der Kern des ganzen Ansatzes.
      expect(typeof f.label, `${t.id}: ${JSON.stringify(f)}`).toBe('string')
      expect(f.label.length).toBeGreaterThan(0)
      expect(Number.isFinite(f.delta)).toBe(true)
      expect(f.delta).not.toBe(0)
    }
    expect(t.drivers.every((d) => d.delta > 0)).toBe(true)
    expect(t.protectors.every((p) => p.delta < 0)).toBe(true)
  }
})

each('Gesamtbild und Verteilung passen zu den Bedrohungen', (answers) => {
  const report = runAudit(answers)
  expect(report.posture.score).toBeGreaterThanOrEqual(0)
  expect(report.posture.score).toBeLessThanOrEqual(100)
  expect(report.posture.label).toBeTruthy()

  const counted = Object.values(report.breakdown).reduce((a, b) => a + b, 0)
  expect(counted).toBe(report.threats.length)
})

// --- Priorisierung ----------------------------------------------------------

each('der Plan enthält keine Maßnahme doppelt oder unbegründet', (answers) => {
  const profile = buildProfile(answers)
  const { ranked, alreadyDone } = prioritize(assessThreats(profile), profile)

  const ids = ranked.map((r) => r.id)
  expect(new Set(ids).size, 'doppelte Maßnahme im Plan').toBe(ids.length)

  const done = new Set(alreadyDone.map((a) => a.id))
  expect(ids.filter((id) => done.has(id)), 'bereits erledigt und trotzdem im Plan').toEqual([])

  for (const r of ranked) {
    // Alles unterhalb der Schwelle gehört nicht in eine Liste, die jemand
    // abarbeiten soll — und was der Report nicht begründen kann, erst recht nicht.
    expect(r.gain, `${r.id}.gain`).toBeGreaterThanOrEqual(1)
    expect(r.affects.length, `${r.id} ohne benennbare Wirkung`).toBeGreaterThan(0)
    expect(r.headline, `${r.id}.headline`).toBeTruthy()
  }
})

each('Abhängigkeiten stehen vor der Maßnahme, die sie braucht', (answers) => {
  const profile = buildProfile(answers)
  const { ranked } = prioritize(assessThreats(profile), profile)
  const position = new Map(ranked.map((r, i) => [r.id, i]))

  // Gespiegelt aus priorities.js — eine Änderung dort muss hier bewusst
  // nachgezogen werden.
  const REQUIRES = {
    passkeys: ['password-manager'],
    'unique-passwords': ['password-manager'],
    'hardware-key': ['mfa-critical'],
    'backup-test': ['backup-offline'],
    'crypto-hygiene': ['seed-offline'],
  }

  for (const [id, needs] of Object.entries(REQUIRES)) {
    const at = position.get(id)
    if (at == null) continue
    for (const dep of needs) {
      const depAt = position.get(dep)
      const action = ACTION_BY_ID[dep]
      const satisfiedOutside =
        action?.doneIf?.(profile) || (action?.appliesIf && !action.appliesIf(profile))
      expect(
        (depAt != null && depAt < at) || satisfiedOutside,
        `${id} steht auf Platz ${at + 1}, Voraussetzung "${dep}" ist weder davor noch erfüllt`,
      ).toBeTruthy()
    }
  }
})

each('der Zeitplan bildet die Rangfolge vollständig ab', (answers) => {
  const report = runAudit(answers)
  const flat = report.plan.flatMap((p) => p.items.map((i) => i.id))

  expect(flat, 'Plan und Rangfolge weichen ab').toEqual(report.ranked.map((r) => r.id))
  for (const phase of report.plan) {
    expect(phase.items.length).toBeGreaterThan(0)
    // Der Überhang ist ausdrücklich als solcher markiert und keine Phase, die
    // jemand abarbeiten soll — nur für ihn gilt der Deckel nicht.
    if (!phase.collapsed) {
      expect(phase.items.length, `${phase.id}: zu viele Punkte`).toBeLessThanOrEqual(5)
    }
  }

  const asPlan = report.plan.filter((p) => !p.collapsed)
  expect(asPlan.length, 'ein Plan ohne echte Phase').toBeGreaterThan(0)
  expect(asPlan.length, 'mehr als vier Phasen als Vorhaben').toBeLessThanOrEqual(4)
  expect(report.plan.filter((p) => p.collapsed).length, 'mehr als ein Überhang').toBeLessThanOrEqual(1)
})

each('Summen entsprechen den Einzelwerten', (answers) => {
  const report = runAudit(answers)
  expect(report.effortTotal).toBe(totalEffort(report.ranked))
  expect(report.costTotal).toBe(totalCost(report.ranked))
  expect(report.costTotal).toBeGreaterThanOrEqual(0)
})

each('empfohlene Produkte lassen sich alle auflösen', (answers) => {
  const report = runAudit(answers)
  // productList() filtert unbekannte IDs still heraus — hier fällt das auf.
  const referenced = new Set(report.ranked.flatMap((r) => r.products ?? []))
  expect(report.products.length).toBe(referenced.size)
  expect(report.products.every((p) => p?.name)).toBe(true)
})

// --- Security Twin ----------------------------------------------------------

each('Werte des Zwillings sind plausibel skaliert', (answers) => {
  const { assets } = buildTwin(buildProfile(answers))
  for (const a of assets) {
    expect(a.value, `${a.id}.value`).toBeGreaterThanOrEqual(0)
    expect(a.value, `${a.id}.value`).toBeLessThanOrEqual(100)
    expect(a.defense, `${a.id}.defense`).toBeGreaterThanOrEqual(0)
    expect(a.defense, `${a.id}.defense`).toBeLessThanOrEqual(100)
  }
})

each('Angriffsketten sind wohlgeformt', (answers) => {
  const { chains, assets } = buildTwin(buildProfile(answers))
  const present = new Set(assets.map((a) => a.id))

  chains.forEach((c, i) => {
    expect(c.rank).toBe(i + 1)
    expect(c.steps.length, `${c.id}: zu lang`).toBeLessThanOrEqual(4)
    expect(c.steps.length).toBeGreaterThan(0)
    expect(c.probability).toBeGreaterThan(0)
    expect(c.probability).toBeLessThanOrEqual(1)
    expect(c.expected).toBeCloseTo(c.probability * c.goalValue, 6)
    expect(c.steps[0].kind).toBe('entry')

    for (const s of c.steps) {
      expect(present.has(s.to), `${c.id}: Ziel "${s.to}" existiert bei diesem Profil nicht`).toBe(true)
      expect(s.p).toBeGreaterThan(0)
      expect(s.p).toBeLessThanOrEqual(1)
    }
    // Der Weg darf sich nicht selbst kreuzen, sonst zählt man Wahrscheinlichkeiten doppelt.
    const visited = c.steps.map((s) => s.to)
    expect(new Set(visited).size).toBe(visited.length)

    if (c.breakPoint) expect(ACTION_BY_ID[c.breakPoint], `unbekannte Maßnahme ${c.breakPoint}`).toBeTruthy()
  })

  const expected = chains.map((c) => c.expected)
  expect(expected).toEqual([...expected].sort((a, b) => b - a))
})

// --- Bericht als Ganzes -----------------------------------------------------

each('Scam-Szenarien gehören zu den bewerteten Bedrohungen', (answers) => {
  const report = runAudit(answers)
  const known = new Set(report.threats.map((t) => t.id))
  expect(report.scams.length).toBeLessThanOrEqual(3)
  for (const s of report.scams) {
    expect(known.has(s.threatId)).toBe(true)
    expect(typeof s.hook).toBe('string')
  }
})

each('derselbe Antwortstand ergibt denselben Bericht', (answers) => {
  const strip = (r) => JSON.stringify({ ...r, generatedAt: null })
  expect(strip(runAudit(answers))).toBe(strip(runAudit(answers)))
})

each('runAudit verändert die Antworten nicht', (answers) => {
  const before = JSON.stringify(answers)
  runAudit(answers)
  expect(JSON.stringify(answers)).toBe(before)
})

describe('Randfälle', () => {
  it('ein leerer Antwortstand ergibt trotzdem einen vollständigen Bericht', () => {
    const report = runAudit({})
    expect(report.threats.length).toBeGreaterThan(0)
    expect(report.archetype.primary.id).toBeTruthy()
    expect(report.insights.length).toBeGreaterThan(0)
  })

  it('unbekannte Antwortschlüssel werden ignoriert statt zu stören', () => {
    expect(() => runAudit({ gibt_es_nicht: 'egal', age: '30-49' })).not.toThrow()
  })

  it('das abgesicherte Profil hat einen kürzeren Plan als das exponierte', () => {
    const hardened = runAudit(ALL_PROFILES.hardened)
    const exposed = runAudit(ALL_PROFILES.exposed)
    expect(hardened.ranked.length).toBeLessThan(exposed.ranked.length)
    expect(hardened.posture.score).toBeGreaterThan(exposed.posture.score)
  })
})

describe('Der Überhang', () => {
  it('enthält nur, was hinter die vier Phasen fällt — und bleibt begründet', () => {
    const report = runAudit(ALL_PROFILES.visible)
    const rest = report.plan.find((p) => p.collapsed)

    expect(rest, 'Profil mit 40 Maßnahmen ohne Überhang').toBeTruthy()
    expect(rest.lead, 'der Überhang muss sagen, warum er einer ist').toBeTruthy()

    // Er steht am Schluss und enthält das flache Ende der Rangfolge.
    expect(report.plan.at(-1).id).toBe('rest')
    const phasesBefore = report.plan.filter((p) => !p.collapsed)
    const lastRegular = phasesBefore.at(-1).items.at(-1)
    expect(rest.items[0].efficiency).toBeLessThanOrEqual(lastRegular.efficiency)
  })

  it('bleibt beim gut abgesicherten Profil ganz aus', () => {
    // 20 Punkte passen in die Phasen — wer wenig zu tun hat, sieht keinen Rest.
    expect(runAudit(ALL_PROFILES.hardened).plan.some((p) => p.collapsed)).toBe(false)
  })
})

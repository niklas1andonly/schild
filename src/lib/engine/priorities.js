// ---------------------------------------------------------------------------
// Priorisierung
// ---------------------------------------------------------------------------
// Die Reihenfolge entsteht nicht aus einer festen Liste, sondern aus dem
// tatsächlichen Nutzen pro Aufwand — berechnet gegen das konkrete Risikobild.
//
// Wichtig ist das *marginale* Vorgehen: nach jeder ausgewählten Maßnahme wird
// das Restrisiko neu berechnet, bevor die nächste bewertet wird. Sonst würden
// sich überlappende Maßnahmen (Passwortmanager und eindeutige Passwörter
// wirken beide auf dieselbe Bedrohung) gegenseitig nach oben schaukeln und den
// Plan mit Redundanz füllen.
// ---------------------------------------------------------------------------

import { ACTIONS, ACTION_BY_ID } from '../../data/actions.js'

/**
 * Aufwandsgewicht: Zeit ist der dominierende Faktor, Schwierigkeit und Kosten
 * wirken dämpfend. Der Sockel von 20 verhindert, dass Zehn-Minuten-Maßnahmen
 * mit minimalem Nutzen die Liste anführen.
 */
function effortWeight(action) {
  const time = action.effort ?? 30
  const difficulty = 1 + ((action.difficulty ?? 1) - 1) * 0.35
  const money = 1 + Math.min((action.cost ?? 0) / 200, 0.6)
  return (20 + time) * difficulty * money
}

/**
 * Wie viel Risiko nimmt diese Maßnahme im aktuellen Restrisiko-Bild weg?
 * Neben der Summe wird der größte Einzelbeitrag zurückgegeben — eine Maßnahme,
 * die das Top-Risiko halbiert, ist für einen Plan mehr wert als eine, die drei
 * Nebenrisiken leicht senkt, auch wenn beide dieselbe Summe ergeben.
 */
function gainOf(action, residual) {
  let total = 0
  let max = 0
  for (const [threatId, effectiveness] of Object.entries(action.reduces ?? {})) {
    const current = residual[threatId]
    if (current == null) continue // Bedrohung trifft auf dieses Profil nicht zu
    const removed = current * effectiveness
    total += removed
    if (removed > max) max = removed
  }
  return { total, max }
}

/**
 * Manche Maßnahmen ergeben erst nach einer anderen Sinn: Passkeys ohne
 * Passwortmanager hängen an einem einzelnen Gerät, ein Backup-Test ohne Backup
 * ist gegenstandslos. Solche Maßnahmen bleiben gesperrt, bis die Voraussetzung
 * im Plan steht oder laut Profil bereits erfüllt ist.
 */
const REQUIRES = {
  passkeys: ['password-manager'],
  'unique-passwords': ['password-manager'],
  'hardware-key': ['mfa-critical'],
  'backup-test': ['backup-offline'],
  'crypto-hygiene': ['seed-offline'],
}

function requirementsMet(action, chosen, profile) {
  const needed = REQUIRES[action.id]
  if (!needed) return true
  return needed.every((id) => {
    if (chosen.has(id)) return true
    const dep = ACTION_BY_ID[id]
    if (!dep) return true
    // Bereits umgesetzt oder für dieses Profil ohnehin nicht relevant.
    return dep.doneIf?.(profile) || (dep.appliesIf && !dep.appliesIf(profile))
  })
}

/**
 * Erzeugt die geordnete Maßnahmenliste.
 * @returns {{ ranked: Array, alreadyDone: Array, notRelevant: Array }}
 */
export function prioritize(threats, profile) {
  const riskById = Object.fromEntries(threats.map((t) => [t.id, t.risk]))
  const threatById = Object.fromEntries(threats.map((t) => [t.id, t]))

  const alreadyDone = []
  const candidates = []

  for (const action of ACTIONS) {
    if (action.doneIf?.(profile)) {
      alreadyDone.push(action)
      continue
    }
    if (action.appliesIf && !action.appliesIf(profile)) continue
    // Maßnahmen ohne Bezug zu einer hier zutreffenden Bedrohung fallen raus.
    const touches = Object.keys(action.reduces ?? {}).some((id) => riskById[id] != null)
    if (touches) candidates.push(action)
  }

  const residual = { ...riskById }
  const ranked = []
  const chosen = new Set()
  const pool = [...candidates]

  while (pool.length) {
    let best = null
    let bestScore = 0
    let bestGain = 0

    for (const action of pool) {
      if (!requirementsMet(action, chosen, profile)) continue
      const { total, max } = gainOf(action, residual)
      // Der Bonus auf den größten Einzelbeitrag verhindert, dass billige
      // Maßnahmen mit breiter, aber flacher Wirkung die eine Maßnahme
      // verdrängen, die das Hauptrisiko adressiert.
      const score = (total + max * 0.8) / effortWeight(action)
      if (score > bestScore) {
        best = action
        bestScore = score
        bestGain = total
      }
    }

    if (!best) break

    // Betroffene Bedrohungen mit ihren Anteilen festhalten, solange das
    // Restrisiko noch den Stand *vor* dieser Maßnahme hat.
    const affects = Object.entries(best.reduces ?? {})
      .filter(([id]) => residual[id] != null)
      .map(([id, eff]) => ({
        threatId: id,
        threat: threatById[id],
        removes: Math.round(residual[id] * eff),
      }))
      .filter((x) => x.removes >= 1)
      .sort((a, b) => b.removes - a.removes)

    // Alles, was praktisch nichts mehr bringt, gehört nicht in einen Plan.
    // Maßgeblich ist dabei `affects` und nicht die Summe: Eine Maßnahme, die
    // auf keine einzelne Bedrohung einen ganzen Risikopunkt abträgt, kann der
    // Report nicht begründen — `headline` bliebe leer und die Wirkungszeile im
    // Plan zeigte nichts an. Was danach kommt, bringt noch weniger.
    if (!affects.length || bestGain < 0.6) break

    for (const [id, eff] of Object.entries(best.reduces ?? {})) {
      if (residual[id] != null) residual[id] = residual[id] * (1 - eff)
    }

    ranked.push({
      ...best,
      gain: Math.round(bestGain),
      efficiency: bestScore,
      affects,
      // Die Bedrohung, wegen der diese Maßnahme hier steht.
      headline: affects[0]?.threat ?? null,
    })

    chosen.add(best.id)
    pool.splice(pool.indexOf(best), 1)
  }

  const notRelevant = ACTIONS.filter(
    (a) =>
      !ranked.some((r) => r.id === a.id) &&
      !alreadyDone.includes(a) &&
      a.appliesIf &&
      !a.appliesIf(profile),
  )

  return { ranked, alreadyDone, notRelevant, residual }
}

/** Höchstens so viele Punkte je Phase — darüber wird jede Liste ignoriert. */
const PER_PHASE = 5

/**
 * Aus der Rangliste einen Zeitplan bauen. Die Aufteilung folgt dem
 * Zeitbudget, nicht der Menge — drei erledigte Punkte sind mehr wert als
 * eine Liste mit zwanzig.
 *
 * Was hinter die letzte Phase fällt, verschwindet nicht, wird aber auch nicht
 * als Vorhaben ausgegeben: Bei ausgeprägten Profilen sind das dreißig und mehr
 * Maßnahmen aus dem flachen Ende der Rangfolge. Sie stehen gesammelt am Schluss
 * und tragen die Begründung, warum sie dort stehen.
 */
export function buildPlan(ranked) {
  const phases = [
    {
      id: 'now',
      title: 'Diese Woche',
      lead: 'Der größte Hebel bei kleinstem Aufwand. Wenn du nur das hier machst, hat sich das Audit gelohnt.',
      budget: 150,
      items: [],
    },
    {
      id: 'month',
      title: 'Diesen Monat',
      lead: 'Die Maßnahmen, die etwas mehr Zeit brauchen — aber keinen Aufschub verdienen.',
      budget: 260,
      items: [],
    },
    {
      id: 'quarter',
      title: 'Im nächsten Quartal',
      lead: 'Sinnvoll, aber nicht dringend. Räum dir dafür bewusst einen Nachmittag frei.',
      budget: 400,
      items: [],
    },
    {
      id: 'later',
      title: 'Später oder optional',
      lead: 'Feinschliff. Erst relevant, wenn alles darüber erledigt ist.',
      budget: Infinity,
      items: [],
    },
  ]

  let index = 0
  let spent = 0
  const rest = []

  for (const action of ranked) {
    if (index >= phases.length) {
      rest.push(action)
      continue
    }

    const phase = phases[index]
    phase.items.push(action)
    spent += action.effort ?? 30

    if (spent >= phase.budget || phase.items.length >= PER_PHASE) {
      index += 1
      spent = 0
    }
  }

  const out = phases.filter((p) => p.items.length > 0)

  if (rest.length) {
    out.push({
      id: 'rest',
      title: 'Der lange Rest',
      lead: 'Ab hier wird der Plan länger, als ihn jemand tatsächlich abarbeitet. Diese Maßnahmen wirken durchaus noch — sie stehen nur hinter zwanzig anderen, die pro investierter Stunde mehr bringen. Zum Nachschlagen, wenn alles darüber erledigt ist.',
      budget: Infinity,
      collapsed: true,
      items: rest,
    })
  }

  return out
}

/** Gesamtaufwand einer Liste in Minuten. */
export const totalEffort = (items) => items.reduce((sum, a) => sum + (a.effort ?? 0), 0)

/** Gesamtkosten pro Jahr. */
export const totalCost = (items) => items.reduce((sum, a) => sum + (a.cost ?? 0), 0)

/** Alle Produkte, die im Plan vorkommen — für die Produktübersicht. */
export function productsInPlan(ranked) {
  const ids = []
  for (const action of ranked) {
    for (const p of action.products ?? []) if (!ids.includes(p)) ids.push(p)
  }
  return ids
}

export { ACTION_BY_ID }

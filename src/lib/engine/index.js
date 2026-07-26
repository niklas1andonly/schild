// ---------------------------------------------------------------------------
// Audit-Lauf
// ---------------------------------------------------------------------------
// Ein einziger Einstiegspunkt: Antworten rein, vollständiger Bericht raus.
// Der gesamte Vorgang ist rein rechnerisch und ohne Seiteneffekte — dieselben
// Antworten ergeben immer denselben Bericht, und nichts davon verlässt das
// Gerät.
// ---------------------------------------------------------------------------

import { buildProfile } from './profile.js'
import { assessThreats, overallPosture, severityBreakdown } from './risk.js'
import { prioritize, buildPlan, productsInPlan, totalEffort, totalCost } from './priorities.js'
import { buildInsights } from './insights.js'
import { pickArchetype } from './archetype.js'
import { buildTwin } from './twin.js'
import { pickScams } from '../../data/scams.js'
import { productList } from '../../data/products.js'

export function runAudit(answers) {
  const profile = buildProfile(answers)
  const threats = assessThreats(profile)
  const posture = overallPosture(threats)
  const { ranked, alreadyDone } = prioritize(threats, profile)
  const plan = buildPlan(ranked)

  return {
    generatedAt: new Date().toISOString(),
    answers,
    profile,
    threats,
    posture,
    breakdown: severityBreakdown(threats),
    archetype: pickArchetype(profile),
    insights: buildInsights({ profile, threats, ranked }),
    twin: buildTwin(profile),
    scams: pickScams(threats, profile),
    ranked,
    alreadyDone,
    plan,
    products: productList(productsInPlan(ranked)),
    effortTotal: totalEffort(ranked),
    costTotal: totalCost(ranked),
  }
}

export { buildProfile, assessThreats, overallPosture }

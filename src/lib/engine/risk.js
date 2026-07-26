// ---------------------------------------------------------------------------
// Risikoberechnung
// ---------------------------------------------------------------------------
// Risiko = Eintrittswahrscheinlichkeit × Schadenshöhe. Beide Größen entstehen
// aus einem Basiswert plus den Faktoren, die die jeweilige Bedrohung für
// dieses Profil liefert. Die Faktorliste wandert unverändert in den Report —
// jede Zahl muss sich bis auf die Antwort zurückverfolgen lassen.
// ---------------------------------------------------------------------------

import { applicableThreats } from '../../data/threats.js'

const sum = (list) => list.reduce((acc, x) => acc + x.delta, 0)

/**
 * Weiche Sättigung statt hartem Abschneiden.
 *
 * Die Faktoren sind additiv, deshalb laufen ausgeprägte Profile schnell über
 * 100 hinaus (ein Wert von 116 ist keine Seltenheit). Ein harter Schnitt bei
 * 99 würde mehrere Bedrohungen auf denselben Wert legen und die Rangfolge
 * damit zufällig machen — genau die Aussage, die dieser Bericht treffen soll.
 *
 * Oberhalb von 75 und unterhalb von 25 werden Zuwächse deshalb zunehmend
 * gestaucht: Der Wert nähert sich 99 bzw. 1 asymptotisch an, bleibt aber
 * streng monoton. Unterschiede bleiben so auch im Extrembereich erhalten.
 */
function saturate(raw) {
  const K = 26 // Härte der Stauchung; kleiner = früher flach
  if (raw > 75) return 75 + (24 * (raw - 75)) / (raw - 75 + K)
  if (raw < 25) return 25 - (24 * (25 - raw)) / (25 - raw + K)
  return raw
}

export const SEVERITY = {
  critical: { label: 'Kritisch', color: 'sev-critical', rank: 4 },
  high: { label: 'Hoch', color: 'sev-high', rank: 3 },
  medium: { label: 'Mittel', color: 'sev-medium', rank: 2 },
  low: { label: 'Niedrig', color: 'sev-low', rank: 1 },
}

export function severityOf(risk) {
  if (risk >= 48) return 'critical'
  if (risk >= 32) return 'high'
  if (risk >= 18) return 'medium'
  return 'low'
}

/** Alle zutreffenden Bedrohungen bewerten, absteigend nach Risiko. */
export function assessThreats(profile) {
  return applicableThreats(profile)
    .map((t) => {
      const likelihoodFactors = (t.likelihood?.(profile) ?? []).filter((x) => x.delta !== 0)
      const impactFactors = (t.impact?.(profile) ?? []).filter((x) => x.delta !== 0)

      const rawLikelihood = t.base + sum(likelihoodFactors)
      const rawImpact = t.baseImpact + sum(impactFactors)
      const likelihood = Math.round(saturate(rawLikelihood))
      const impact = Math.round(saturate(rawImpact))
      const risk = Math.round((likelihood * impact) / 100)

      return {
        id: t.id,
        name: t.name,
        short: t.short,
        category: t.category,
        oneLiner: t.oneLiner,
        scam: !!t.scam,
        mitigations: t.mitigations ?? [],
        base: t.base,
        baseImpact: t.baseImpact,
        rawLikelihood,
        rawImpact,
        likelihood,
        impact,
        risk,
        severity: severityOf(risk),
        likelihoodFactors: [...likelihoodFactors].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
        impactFactors: [...impactFactors].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
        // Die Faktoren, die das Risiko erhöhen — das ist die eigentliche Antwort
        // auf "warum ausgerechnet ich?".
        drivers: [...likelihoodFactors, ...impactFactors]
          .filter((x) => x.delta > 0)
          .sort((a, b) => b.delta - a.delta)
          .slice(0, 4),
        protectors: [...likelihoodFactors, ...impactFactors]
          .filter((x) => x.delta < 0)
          .sort((a, b) => a.delta - b.delta)
          .slice(0, 3),
      }
    })
    .sort((a, b) => b.risk - a.risk)
}

/**
 * Gesamtbild als eine Zahl — bewusst zurückhaltend eingesetzt.
 * Ein Score allein hilft niemandem; er dient hier nur als Einordnung und als
 * Fortschrittsanzeige, wenn jemand das Audit später erneut durchläuft.
 */
export function overallPosture(threats) {
  if (!threats.length) return { score: 50, label: 'Unklar', note: '' }

  // Die größten Risiken dominieren bewusst: eine offene kritische Lücke wird
  // nicht durch zehn gut abgesicherte Nebenbereiche ausgeglichen.
  const sorted = [...threats].sort((a, b) => b.risk - a.risk)
  const weights = sorted.map((_, i) => 1 / (i + 1.6))
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const weighted = sorted.reduce((acc, t, i) => acc + t.risk * weights[i], 0) / weightSum

  const score = Math.round(Math.max(0, Math.min(100, 100 - weighted * 1.35)))

  let label, note
  if (score >= 80) {
    label = 'Gut aufgestellt'
    note = 'Die Grundlagen sitzen. Was bleibt, ist Feinschliff und Vorsorge für den Ernstfall.'
  } else if (score >= 62) {
    label = 'Solide mit Lücken'
    note = 'Vieles ist in Ordnung, aber es gibt einzelne Stellen, die den Rest untergraben.'
  } else if (score >= 42) {
    label = 'Ausbaufähig'
    note = 'Mehrere gängige Angriffswege stehen bei dir offen. Die gute Nachricht: die wirksamsten Gegenmaßnahmen sind kostenlos.'
  } else if (score >= 24) {
    label = 'Deutlich exponiert'
    note = 'An mehreren Stellen fehlt die Grundabsicherung. Fang bei den ersten drei Punkten des Plans an, nicht bei allen gleichzeitig.'
  } else {
    label = 'Kritisch'
    note = 'Es ist gerade nicht die Frage, ob etwas passiert, sondern was zuerst. Die ersten beiden Maßnahmen sind wichtiger als alles andere in diesem Bericht.'
  }

  return { score, label, note }
}

/** Verteilung nach Schweregrad — für die Übersicht im Report. */
export function severityBreakdown(threats) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const t of threats) counts[t.severity] += 1
  return counts
}

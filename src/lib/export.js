// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
// Der Bericht ist erst dann nützlich, wenn er die Seite verlassen kann —
// als Datei auf dem eigenen Rechner, nicht über einen Server.
// ---------------------------------------------------------------------------

import { effortLabel, DIFFICULTY_LABEL } from '../data/actions.js'
import { answerLabel, QUESTION_BY_ID } from '../data/questions.js'

const line = (s = '') => `${s}\n`

export function reportToMarkdown(report) {
  const d = new Date(report.generatedAt)
  const date = d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
  let md = ''

  md += line('# Digitales Sicherheitsaudit')
  md += line()
  md += line(`Erstellt am ${date} mit SCHILD. Alle Angaben beruhen auf deinen eigenen Antworten.`)
  md += line()
  md += line('---')
  md += line()

  // -- Profil ---------------------------------------------------------------
  md += line(`## Dein Risikoprofil: ${report.archetype.primary.name}`)
  md += line()
  md += line(`*${report.archetype.primary.tagline}*`)
  md += line()
  md += line(report.archetype.primary.body)
  md += line()
  if (report.archetype.secondary) {
    md += line(`Zusätzlich erkennbar: **${report.archetype.secondary.name}** — ${report.archetype.secondary.tagline}`)
    md += line()
  }
  md += line(`**Gesamteinschätzung:** ${report.posture.label} (${report.posture.score}/100)`)
  md += line()
  md += line(report.posture.note)
  md += line()

  // -- Erkenntnisse ---------------------------------------------------------
  md += line('## Kernbefunde')
  md += line()
  for (const i of report.insights) {
    md += line(`### ${i.title}`)
    md += line()
    md += line(i.body)
    md += line()
    for (const e of i.evidence ?? []) md += line(`- ${e}`)
    if (i.evidence?.length) md += line()
  }

  // -- Risiken --------------------------------------------------------------
  md += line('## Deine größten Risiken')
  md += line()
  report.threats.slice(0, 8).forEach((t, i) => {
    md += line(`### ${i + 1}. ${t.name}`)
    md += line()
    md += line(`**Risiko ${t.risk}/100** · Eintrittswahrscheinlichkeit ${t.likelihood} · Schadenshöhe ${t.impact}`)
    md += line()
    md += line(t.oneLiner)
    md += line()
    if (t.drivers.length) {
      md += line('**Warum ausgerechnet bei dir:**')
      md += line()
      for (const dr of t.drivers) md += line(`- ${dr.label} (+${dr.delta})`)
      md += line()
    }
    if (t.protectors.length) {
      md += line('**Was dich hier bereits schützt:**')
      md += line()
      for (const pr of t.protectors) md += line(`- ${pr.label} (${pr.delta})`)
      md += line()
    }
  })

  // -- Angriffsketten -------------------------------------------------------
  md += line('## Wahrscheinlichste Angriffsketten')
  md += line()
  md += line(
    'Simulation aus Sicht eines Angreifers: Einstieg, Ausweitung, Ziel. Die Prozentangaben sind Modellwerte zur Einordnung der Reihenfolge, keine Messwerte.',
  )
  md += line()
  for (const c of report.twin.chains) {
    md += line(`### Weg ${c.rank}: ${c.entry.label} → ${c.goal.label}`)
    md += line()
    md += line(`Einschätzung: **${c.likelihoodLabel}** (${Math.round(c.probability * 100)} %)`)
    md += line()
    c.steps.forEach((s, i) => {
      md += line(`${i + 1}. **${s.method}** → ${s.toLabel} *(${Math.round(s.p * 100)} %)*`)
      md += line(`   ${s.why}`)
    })
    md += line()
  }

  // -- Scams ----------------------------------------------------------------
  md += line('## Welcher Betrug dich am ehesten erwischt')
  md += line()
  for (const s of report.scams) {
    md += line(`### ${s.threatName} — ${s.channel}`)
    md += line()
    md += line('```')
    md += line(`Von: ${s.from}`)
    md += line(`Betreff: ${s.subject}`)
    md += line()
    md += line(s.body)
    md += line('```')
    md += line()
    md += line(`**Warum das bei dir funktioniert:** ${s.hook}`)
    md += line()
    md += line('**Woran du es erkennst:**')
    md += line()
    for (const f of s.redFlags) md += line(`- ${f}`)
    md += line()
    md += line(`**Richtige Reaktion:** ${s.correct}`)
    md += line()
  }

  // -- Plan -----------------------------------------------------------------
  md += line('## Dein Plan')
  md += line()
  for (const phase of report.plan) {
    md += line(`### ${phase.title}`)
    md += line()
    md += line(`*${phase.lead}*`)
    md += line()
    for (const a of phase.items) {
      md += line(`#### ${a.title}`)
      md += line()
      md += line(`${effortLabel(a.effort)} · ${a.costLabel} · ${DIFFICULTY_LABEL[a.difficulty]} · senkt ca. ${a.gain} Risikopunkte`)
      md += line()
      md += line(typeof a.why === 'function' ? a.why(report.profile) : a.why)
      md += line()
      for (const [i, step] of (a.steps ?? []).entries()) {
        md += line(`${i + 1}. **${step.t}** — ${step.d}`)
      }
      md += line()
      if (a.watchout) {
        md += line(`> **Typischer Fehler:** ${a.watchout}`)
        md += line()
      }
      if (a.products?.length) {
        md += line(`Empfehlungen: ${a.products.join(', ')}`)
        md += line()
      }
    }
  }

  // -- Produkte -------------------------------------------------------------
  if (report.products.length) {
    md += line('## Produktempfehlungen')
    md += line()
    for (const p of report.products) {
      const tag = p.tier === 'avoid' ? ' — **nicht empfohlen**' : p.tier === 'pick' ? ' — Standardempfehlung' : ''
      md += line(`- **${p.name}** (${p.kind}, ${p.price})${tag}: ${p.note}`)
    }
    md += line()
  }

  // -- Antworten ------------------------------------------------------------
  md += line('## Deine Antworten')
  md += line()
  for (const [qid, value] of Object.entries(report.answers)) {
    const q = QUESTION_BY_ID[qid]
    if (!q) continue
    const label = answerLabel(qid, value)
    if (label) md += line(`- **${q.q}** ${label}`)
  }
  md += line()
  md += line('---')
  md += line()
  md += line(
    'Dieser Bericht ersetzt keine individuelle Beratung. Er beruht auf einem Modell und auf Selbstauskunft — beides kann danebenliegen.',
  )

  return md
}

/** Datei im Browser herunterladen, ohne Serverbeteiligung. */
export function downloadText(filename, text, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadReport(report) {
  const stamp = new Date(report.generatedAt).toISOString().slice(0, 10)
  downloadText(`sicherheitsaudit-${stamp}.md`, reportToMarkdown(report))
}

export function downloadAnswers(answers) {
  const stamp = new Date().toISOString().slice(0, 10)
  downloadText(
    `sicherheitsaudit-antworten-${stamp}.json`,
    JSON.stringify(answers, null, 2),
    'application/json',
  )
}

// ---------------------------------------------------------------------------
// Katalogprüfung
// ---------------------------------------------------------------------------
// Der Inhalt in `src/data/` ist über IDs miteinander verknüpft: Maßnahmen
// verweisen auf Bedrohungen, Bedrohungen auf Maßnahmen, der Twin auf
// Maßnahmen, Maßnahmen auf Produkte. Kein Verweis wird zur Laufzeit geprüft —
// eine falsche ID äußert sich als still fehlende Empfehlung im Report, nicht
// als Fehler.
//
// `actions.js` und `model-stats.js` fangen einen Teil davon bereits ab, aber
// nur als `console.warn` im Entwicklungsmodus, also nur wenn jemand zufällig
// die Konsole offen hat. Hier stehen dieselben Prüfungen als echte Tests, plus
// die, die dort fehlen (Produkte, Twin, Abhängigkeiten, Wirkungsgrade).
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest'

import { QUESTIONS, QUESTION_BY_ID, SECTIONS, visibleQuestions } from '../src/data/questions.js'
import { THREATS, THREAT_BY_ID } from '../src/data/threats.js'
import { ACTIONS, ACTION_BY_ID } from '../src/data/actions.js'
import { PRODUCTS } from '../src/data/products.js'
import { SCAMS } from '../src/data/scams.js'
import { MODEL_STATS } from '../src/data/model-stats.js'
import { ALL_PROFILES, optionValues } from './fixtures/personas.js'

const duplicates = (ids) => {
  const seen = new Set()
  return [...new Set(ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false))))]
}

describe('IDs sind eindeutig', () => {
  it.each([
    ['Fragen', QUESTIONS],
    ['Bedrohungen', THREATS],
    ['Maßnahmen', ACTIONS],
  ])('%s', (_label, items) => {
    expect(duplicates(items.map((x) => x.id))).toEqual([])
  })
})

describe('Verweise zwischen Bedrohungen und Maßnahmen', () => {
  it('jede Maßnahme wirkt nur auf bekannte Bedrohungen', () => {
    const broken = ACTIONS.flatMap((a) =>
      Object.keys(a.reduces ?? {})
        .filter((tid) => !THREAT_BY_ID[tid])
        .map((tid) => `${a.id} → ${tid}`),
    )
    expect(broken).toEqual([])
  })

  it('jede Bedrohung nennt nur bekannte Gegenmaßnahmen', () => {
    const broken = THREATS.flatMap((t) =>
      (t.mitigations ?? []).filter((aid) => !ACTION_BY_ID[aid]).map((aid) => `${t.id} → ${aid}`),
    )
    expect(broken).toEqual([])
  })

  it('jede Bedrohung ist durch mindestens eine Maßnahme adressierbar', () => {
    const covered = new Set(ACTIONS.flatMap((a) => Object.keys(a.reduces ?? {})))
    expect(THREATS.filter((t) => !covered.has(t.id)).map((t) => t.id)).toEqual([])
  })

  it('jede Maßnahme wirkt auf mindestens eine Bedrohung', () => {
    expect(ACTIONS.filter((a) => !Object.keys(a.reduces ?? {}).length).map((a) => a.id)).toEqual([])
  })

  it('Wirkungsgrade liegen zwischen 0 und 1', () => {
    const off = ACTIONS.flatMap((a) =>
      Object.entries(a.reduces ?? {})
        .filter(([, eff]) => !(typeof eff === 'number' && eff > 0 && eff <= 1))
        .map(([tid, eff]) => `${a.id} → ${tid}: ${eff}`),
    )
    expect(off).toEqual([])
  })
})

describe('Produkte', () => {
  it('jede Maßnahme verweist nur auf bekannte Produkte', () => {
    // `productList` filtert unbekannte IDs kommentarlos heraus — ein Tippfehler
    // führt hier zu einer Empfehlung, die im Report einfach fehlt.
    const broken = ACTIONS.flatMap((a) =>
      (a.products ?? []).filter((p) => !PRODUCTS[p]).map((p) => `${a.id} → ${p}`),
    )
    expect(broken).toEqual([])
  })

  it('jedes Produkt hat Name, Kategorie und gültige Einstufung', () => {
    const off = Object.entries(PRODUCTS)
      .filter(([, p]) => !p.name || !p.kind || !['pick', 'alt', 'avoid'].includes(p.tier))
      .map(([id]) => id)
    expect(off).toEqual([])
  })
})

describe('Scam-Szenarien', () => {
  it('hängen an einer bekannten Bedrohung', () => {
    expect(Object.keys(SCAMS).filter((id) => !THREAT_BY_ID[id])).toEqual([])
  })

  it('haben Kanal, Wortlaut, Erkennungsmerkmale und richtige Reaktion', () => {
    const off = Object.entries(SCAMS)
      .filter(([, s]) => !s.channel || !s.body || !s.redFlags?.length || !s.correct || !s.hook)
      .map(([id]) => id)
    expect(off).toEqual([])
  })
})

describe('Fragenkatalog', () => {
  it('jede Frage hat Optionen bzw. eine Skala', () => {
    const off = QUESTIONS.filter((q) =>
      q.type === 'scale' ? !q.scale?.length : !q.options?.length,
    ).map((q) => q.id)
    expect(off).toEqual([])
  })

  it('Optionswerte sind je Frage eindeutig', () => {
    const off = QUESTIONS.filter((q) => duplicates(optionValues(q)).length).map((q) => q.id)
    expect(off).toEqual([])
  })

  it('jede Frage gehört zu einem bekannten Abschnitt', () => {
    const known = new Set(SECTIONS.map((s) => s.id))
    expect(QUESTIONS.filter((q) => !known.has(q.section)).map((q) => q.id)).toEqual([])
  })

  it('das Kurz-Audit ist deutlich kürzer als das volle', () => {
    const core = QUESTIONS.filter((q) => q.core).length
    expect(core).toBeGreaterThan(10)
    expect(core).toBeLessThan(QUESTIONS.length * 0.6)
  })
})

describe('Abhängigkeiten der Priorisierung', () => {
  it('REQUIRES verweist nur auf bekannte Maßnahmen', async () => {
    // Nicht exportiert — bewusst über den Quelltext geprüft, damit eine
    // umbenannte Maßnahme nicht still eine tote Abhängigkeit hinterlässt.
    const { readFileSync } = await import('node:fs')
    const src = readFileSync(new URL('../src/lib/engine/priorities.js', import.meta.url), 'utf8')
    const block = src.match(/const REQUIRES = \{([\s\S]*?)\n\}/)?.[1] ?? ''
    const ids = [...block.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1])

    expect(ids.length).toBeGreaterThan(0)
    expect(ids.filter((id) => !ACTION_BY_ID[id])).toEqual([])
  })
})

describe('Security Twin', () => {
  it('stoppedBy verweist nur auf bekannte Maßnahmen', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync(new URL('../src/lib/engine/twin.js', import.meta.url), 'utf8')
    const ids = [...src.matchAll(/stoppedBy:\s*\[([^\]]*)\]/g)].flatMap((m) =>
      [...m[1].matchAll(/'([a-z0-9-]+)'/g)].map((x) => x[1]),
    )

    expect(ids.length).toBeGreaterThan(0)
    expect([...new Set(ids.filter((id) => !ACTION_BY_ID[id]))]).toEqual([])
  })
})

describe('MODEL_STATS', () => {
  it('entspricht dem tatsächlichen Umfang', () => {
    // Start- und Methodikseite nennen diese Zahlen. Bisher fiel eine Abweichung
    // nur als console.warn im Dev-Modus auf.
    expect({
      questions: QUESTIONS.length,
      threats: THREATS.length,
      actions: ACTIONS.length,
      scams: Object.keys(SCAMS).length,
    }).toEqual(MODEL_STATS)
  })
})

describe('Testprofile selbst', () => {
  it.each(Object.entries(ALL_PROFILES))('%s ist gegen den Katalog gültig', (_name, answers) => {
    const visible = new Set(visibleQuestions(answers).map((q) => q.id))
    const problems = []

    for (const [qid, value] of Object.entries(answers)) {
      const q = QUESTION_BY_ID[qid]
      if (!q) {
        problems.push(`unbekannte Frage: ${qid}`)
        continue
      }
      // Eine Antwort auf eine Frage, die bei diesem Stand gar nicht gestellt
      // würde, macht das Profil unrealistisch — und den Snapshot wertlos.
      if (!visible.has(qid)) problems.push(`${qid} wird bei diesem Stand nicht gefragt`)

      const allowed = optionValues(q)
      const given = Array.isArray(value) ? value : [value]
      if (q.type === 'multi' && !Array.isArray(value)) problems.push(`${qid}: erwartet eine Liste`)
      for (const v of given) {
        if (!allowed.includes(v)) problems.push(`${qid}: unbekannter Wert "${v}"`)
      }
    }

    expect(problems).toEqual([])
  })
})

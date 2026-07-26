// ---------------------------------------------------------------------------
// Kennzahlen des Modells
// ---------------------------------------------------------------------------
// Start- und Methodikseite nennen den Umfang des Modells ("29 Bedrohungs-
// szenarien"). Würden sie die Zahlen aus den Katalogen ableiten, hinge die
// Startseite am gesamten Inhaltsdatensatz — rund 44 kB gzip für vier Zahlen.
//
// Deshalb stehen die Werte hier als Konstanten. Damit sie nicht auseinander-
// laufen, prüft der Block darunter sie im Entwicklungsmodus gegen die echten
// Kataloge. `import.meta.env.DEV` ersetzt Vite beim Bauen durch `false`, der
// gesamte Block samt der dynamischen Importe fällt dabei heraus.
// ---------------------------------------------------------------------------

export const MODEL_STATS = {
  questions: 67,
  threats: 29,
  actions: 63,
  scams: 10,
}

if (import.meta.env.DEV) {
  Promise.all([import('./questions.js'), import('./threats.js'), import('./actions.js'), import('./scams.js')]).then(
    ([q, t, a, s]) => {
      const actual = {
        questions: q.QUESTIONS.length,
        threats: t.THREATS.length,
        actions: a.ACTIONS.length,
        scams: Object.keys(s.SCAMS).length,
      }
      const drift = Object.entries(actual).filter(([k, v]) => MODEL_STATS[k] !== v)
      if (drift.length) {
        console.warn(
          '[SCHILD] MODEL_STATS ist veraltet — bitte in src/data/model-stats.js anpassen:\n' +
            drift.map(([k, v]) => `  ${k}: ${MODEL_STATS[k]} → ${v}`).join('\n'),
        )
      }
    },
  )
}

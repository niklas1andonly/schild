import { defineConfig } from 'vitest/config'

// ---------------------------------------------------------------------------
// Testlauf
// ---------------------------------------------------------------------------
// Bewusst eine eigene Datei statt eines `test`-Blocks in vite.config.js: die
// Tests prüfen die Engine, und die ist reine Rechnung ohne DOM und ohne JSX.
// Ohne das React-Plugin und die CSP-Transformation läuft der Lauf schneller
// und ohne Warnungen, die nichts mit den Tests zu tun haben.
// ---------------------------------------------------------------------------

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})

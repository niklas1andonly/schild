import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ---------------------------------------------------------------------------
// Content-Security-Policy
// ---------------------------------------------------------------------------
// `connect-src 'none'` ist hier der eigentliche Punkt: Der Browser blockiert
// damit jede Netzwerkanfrage aus dem Anwendungscode — auch eine, die durch
// einen Fehler oder eine kompromittierte Abhängigkeit hineingeriete. Das
// Datenschutzversprechen ist dadurch nicht nur eine Zusage, sondern in den
// DevTools in zehn Sekunden nachprüfbar.
//
// Nur im Build: der Dev-Server braucht WebSockets für HMR.
// ---------------------------------------------------------------------------
const CSP = [
  "default-src 'self'",
  "connect-src 'none'",
  "script-src 'self'",
  // Inline-Styles, weil React Balkenbreiten und Fortschritt per style-Attribut setzt.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join('; ')

const cspPlugin = () => ({
  name: 'schild-csp',
  apply: 'build',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html.replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      ),
  },
})

export default defineConfig({
  plugins: [react(), cspPlugin()],
  // Relative Pfade: der Build läuft auch, wenn man dist/index.html direkt öffnet.
  base: './',
  build: {
    // Der Inhaltsteil (Bedrohungen, Maßnahmen, Scams, Produkte) ist größer als
    // React selbst. Er gehört nicht in den ersten Ladevorgang — die Startseite
    // braucht ihn nicht.
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})

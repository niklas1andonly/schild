/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        // Dossier-Look: sehr dunkles Blaugrau, ruhige Flächen, wenig Neon.
        base: '#0a0c10',
        panel: '#111620',
        panel2: '#161d29',
        line: '#222c3a',
        line2: '#2e3b4d',
        // Drei Textstufen mit bewusst geprüftem Kontrast auf `base` (WCAG AA
        // verlangt 4,5:1 für normalen Text — die alten Werte lagen bei 3,6:1
        // bzw. 3,1:1 auf Panels und trafen ausgerechnet die kleinen Labels).
        text: '#dde5ef', // 14,6:1
        muted: '#96a5b8', // 7,8:1
        faint: '#7c8b9e', // 5,6:1 — auch auf panel2 noch 4,9:1
        accent: '#3ddc9a',
        // Schweregrade — auch in Grafiken und Balken verwendet.
        sev: {
          critical: '#ff5c5c',
          high: '#ff9f43',
          medium: '#ffd23f',
          low: '#4ade80',
          info: '#5aa9ff',
        },
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        grow: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        pulseline: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        rise: 'rise 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        fade: 'fade 400ms ease-out both',
        grow: 'grow 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        pulseline: 'pulseline 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

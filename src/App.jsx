import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuditProvider } from './hooks/useAudit.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'

// Die Startseite kommt sofort. Alles andere wird nachgeladen: Der Fragebogen
// und vor allem der Bericht hängen an Datensätzen, die zusammen größer sind als
// React selbst — die gehören nicht in den ersten Ladevorgang.
const Assessment = lazy(() => import('./pages/Assessment.jsx'))
const Report = lazy(() => import('./pages/Report.jsx'))
const Method = lazy(() => import('./pages/Method.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

/** Platzhalter beim Nachladen — bewusst ruhig, er ist meist nur Millisekunden zu sehen. */
function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <span className="text-sm text-faint">Wird geladen …</span>
    </div>
  )
}

export default function App() {
  return (
    <AuditProvider>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/audit" element={<Assessment />} />
            <Route path="/bericht" element={<Report />} />
            <Route path="/methodik" element={<Method />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </AuditProvider>
  )
}

import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <p className="label">404</p>
      <h1 className="mt-3 text-xl font-bold text-text">Diese Seite gibt es nicht</h1>
      <p className="prose-sec mt-2">Vermutlich ein alter Link oder ein Tippfehler in der Adresse.</p>
      <Link to="/" className="btn btn-primary mt-5">
        Zur Startseite
      </Link>
    </div>
  )
}

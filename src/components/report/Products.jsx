import { PRODUCTS } from '../../data/products.js'
import Icon from '../Icon.jsx'

const TIER_ORDER = { pick: 0, alt: 1, avoid: 2 }

function ProductCard({ p }) {
  const avoid = p.tier === 'avoid'
  return (
    <li className={`card p-5 ${avoid ? 'border-sev-critical/30' : ''}`}>
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="text-base font-semibold text-text">{p.name}</h3>
        {p.tier === 'pick' && (
          <span className="rounded border border-accent/40 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
            Standardempfehlung
          </span>
        )}
        {p.tier === 'alt' && (
          <span className="rounded border border-line2 px-1.5 py-0.5 text-[10px] font-semibold text-faint">
            Alternative
          </span>
        )}
        {avoid && (
          <span className="rounded border border-sev-critical/40 px-1.5 py-0.5 text-[10px] font-semibold text-sev-critical">
            Bewusst nicht empfohlen
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-faint">
        {p.kind} · {p.price}
      </p>
      <p className="prose-sec mt-2.5">{p.note}</p>
      {p.url && (
        <a
          href={p.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          {p.url.replace(/^https?:\/\//, '')}
          <Icon name="external" className="h-3 w-3" />
        </a>
      )}
    </li>
  )
}

export default function Products({ report }) {
  const inPlan = report.products
  const inPlanNames = new Set(inPlan.map((p) => p.name))

  // Was ausdrücklich nicht empfohlen wird, gehört immer in die Übersicht —
  // auch wenn keine Maßnahme des Plans darauf verweist.
  const avoid = Object.values(PRODUCTS).filter((p) => p.tier === 'avoid' && !inPlanNames.has(p.name))
  const resources = Object.values(PRODUCTS).filter(
    (p) => p.kind.startsWith('Anlaufstelle') && !inPlanNames.has(p.name),
  )

  const sorted = [...inPlan].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier])

  return (
    <div className="grid gap-8">
      <header className="max-w-2xl">
        <h2 className="text-xl font-bold text-text">Produktempfehlungen</h2>
        <p className="prose-sec mt-2">
          Nur was zu deinem Plan gehört, dazu die Anlaufstellen für den Ernstfall. Keine Partnerlinks, keine
          Provision, keine Vollständigkeit — für jede Kategorie eine solide Standardempfehlung und eine
          Alternative.
        </p>
      </header>

      {sorted.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">Für deinen Plan</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {sorted.map((p) => (
              <ProductCard key={p.name} p={p} />
            ))}
          </ul>
        </section>
      )}

      {resources.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">
            Anlaufstellen, wenn etwas passiert ist
          </h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {resources.map((p) => (
              <ProductCard key={p.name} p={p} />
            ))}
          </ul>
          <div className="card mt-4 p-5">
            <h4 className="text-sm font-semibold text-text">Sperr-Notruf: 116 116</h4>
            <p className="prose-sec mt-1.5">
              Sperrt Karten und Online-Banking-Zugänge, rund um die Uhr, kostenlos aus dem Inland. Aus dem
              Ausland: +49 116 116. Speichere die Nummer jetzt — im Ernstfall willst du nicht danach suchen.
            </p>
          </div>
        </section>
      )}

      {avoid.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-faint">
            Das kannst du dir sparen
          </h3>
          <p className="prose-sec mt-2 max-w-2xl">
            Diese Kategorien werden stark beworben und lösen für die meisten Privatpersonen ein Problem, das
            weit unten auf der Liste steht. Das Geld ist in einem Backup-Medium oder einem Hardware-Schlüssel
            wirksamer angelegt.
          </p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {avoid.map((p) => (
              <ProductCard key={p.name} p={p} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

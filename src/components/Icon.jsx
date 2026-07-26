// ---------------------------------------------------------------------------
// Icon-Set
// ---------------------------------------------------------------------------
// Emoji wären der kürzere Weg, sehen aber auf jedem Betriebssystem anders aus:
// bunt und rund auf Apple, flach und eckig auf Windows, teils gar nicht auf
// Linux. Für eine Anwendung, die wie ein nüchternes Dossier wirken soll, ist
// das der auffälligste Stilbruch — deshalb ein eigener Satz aus einem Guss.
//
// Alle Pfade: 24×24, Konturen statt Flächen, `currentColor`. Dadurch erben die
// Icons Farbe und Zustand vom umgebenden Text und brauchen keine eigene
// Farbverwaltung.
// ---------------------------------------------------------------------------

const P = {
  // -- Abschnitte des Fragebogens ------------------------------------------
  user: <><circle cx="12" cy="8" r="3.8" /><path d="M4.5 20.5c0-3.6 3.4-5.8 7.5-5.8s7.5 2.2 7.5 5.8" /></>,
  laptop: <><rect x="4" y="4.5" width="16" height="11" rx="2" /><path d="M2 19.5h20" /></>,
  key: <><circle cx="7.5" cy="15.5" r="4.3" /><path d="M10.7 12.4 20 3.2" /><path d="m16.2 4.2 3 3" /><path d="m13.9 6.5 2.6 2.6" /></>,
  card: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /><path d="M6 14.5h3.5" /></>,
  pin: <><path d="M12 21.2c4.3-4.5 6.5-8 6.5-10.7a6.5 6.5 0 1 0-13 0c0 2.7 2.2 6.2 6.5 10.7Z" /><circle cx="12" cy="10.2" r="2.4" /></>,
  home: <><path d="m3 10.6 9-7.4 9 7.4" /><path d="M5.6 9.5V20.5h12.8V9.5" /><path d="M9.8 20.5v-5h4.4v5" /></>,
  folder: <><path d="M3 6.8a2 2 0 0 1 2-2h3.6l2.1 2.6H19a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></>,

  // -- Kategorien -----------------------------------------------------------
  antenna: <><path d="M5.4 18.6a9.3 9.3 0 0 1 0-13.2" /><path d="M18.6 5.4a9.3 9.3 0 0 1 0 13.2" /><path d="M8.5 15.5a4.9 4.9 0 0 1 0-7" /><path d="M15.5 8.5a4.9 4.9 0 0 1 0 7" /><circle cx="12" cy="12" r="1.6" /></>,
  brain: <><path d="M12 5.4A3.1 3.1 0 0 0 6.3 3.9 2.9 2.9 0 0 0 4 8.7a3.1 3.1 0 0 0 .7 4.7A3.1 3.1 0 0 0 7.6 19 3 3 0 0 0 12 17.6Z" /><path d="M12 5.4a3.1 3.1 0 0 1 5.7-1.5A2.9 2.9 0 0 1 20 8.7a3.1 3.1 0 0 1-.7 4.7A3.1 3.1 0 0 1 16.4 19 3 3 0 0 1 12 17.6Z" /><path d="M12 5.4v12.2" /></>,
  eye: <><path d="M2.2 12S6 6.2 12 6.2 21.8 12 21.8 12 18 17.8 12 17.8 2.2 12 2.2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  family: <><circle cx="8.6" cy="8.8" r="3.1" /><path d="M2.8 19.6c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2" /><circle cx="17.4" cy="7.6" r="2.4" /><path d="M16.4 13.4c2.9 0 5 1.9 5 4.8" /></>,
  virus: <><circle cx="12" cy="12" r="5.4" /><path d="M12 2.2v2.4M12 19.4v2.4M2.2 12h2.4M19.4 12h2.4" /><path d="m5.1 5.1 1.7 1.7M17.2 17.2l1.7 1.7M18.9 5.1l-1.7 1.7M6.8 17.2l-1.7 1.7" /></>,
  mask: <><path d="M2.4 9.3c3-1 5.9-1.5 9.6-1.5s6.6.5 9.6 1.5c.4 3.7-1.4 6.9-4.4 6.9-2 0-3.5-1.1-4.3-2.6a1.1 1.1 0 0 0-1.8 0c-.8 1.5-2.3 2.6-4.3 2.6-3 0-4.8-3.2-4.4-6.9Z" /></>,
  phone: <><rect x="6.4" y="2.4" width="11.2" height="19.2" rx="2.6" /><path d="M10.4 18.4h3.2" /></>,

  // -- Werte im Security Twin ----------------------------------------------
  mail: <><rect x="2.5" y="5" width="19" height="14" rx="2.2" /><path d="m3.2 7 8.1 5.5a1.3 1.3 0 0 0 1.4 0L20.8 7" /></>,
  lock: <><rect x="4.2" y="10" width="15.6" height="11" rx="2.4" /><path d="M8 10V7.2a4 4 0 0 1 8 0V10" /><path d="M12 14.4v2.6" /></>,
  cloud: <><path d="M7.2 18.6a4.6 4.6 0 0 1-.7-9.1 5.6 5.6 0 0 1 10.8.5 4.3 4.3 0 0 1-.4 8.6Z" /></>,
  bank: <><path d="m3 9.6 9-5.6 9 5.6" /><path d="M5.4 9.6v8.6M9.8 9.6v8.6M14.2 9.6v8.6M18.6 9.6v8.6" /><path d="M3 21h18" /></>,
  bitcoin: <><circle cx="12" cy="12" r="9" /><path d="M9.4 7.4v9.2" /><path d="M11.6 5.8v1.6M11.6 16.6v1.6" /><path d="M9.4 7.4h3.9a2.3 2.3 0 0 1 0 4.6H9.4h4.3a2.3 2.3 0 0 1 0 4.6H9.4" /></>,
  gamepad: <><rect x="2.4" y="7.4" width="19.2" height="9.2" rx="4.6" /><path d="M7 10.6v3M5.5 12.1h3" /><path d="M15.4 11.2h.02M17.8 13.4h.02" /></>,
  chat: <><path d="M4 4.8h16a1.6 1.6 0 0 1 1.6 1.6v8.2a1.6 1.6 0 0 1-1.6 1.6H9.2L4.6 20v-3.8H4a1.6 1.6 0 0 1-1.6-1.6V6.4A1.6 1.6 0 0 1 4 4.8Z" /></>,
  camera: <><path d="M3.2 7.8h2.9l1.5-2.6h8.8l1.5 2.6h2.9a1.6 1.6 0 0 1 1.6 1.6v8.2a1.6 1.6 0 0 1-1.6 1.6H3.2a1.6 1.6 0 0 1-1.6-1.6V9.4a1.6 1.6 0 0 1 1.6-1.6Z" /><circle cx="12" cy="13" r="3.4" /></>,
  id: <><rect x="2.4" y="5" width="19.2" height="14" rx="2.2" /><circle cx="8.6" cy="10.8" r="2.1" /><path d="M5.2 16.2c.6-1.4 1.9-2.2 3.4-2.2s2.8.8 3.4 2.2" /><path d="M15 10h4.2M15 13.4h4.2" /></>,
  building: <><rect x="4.4" y="3" width="15.2" height="18" rx="1.6" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" /><path d="M10 21v-3.2h4V21" /></>,
  robot: <><rect x="4" y="8" width="16" height="12" rx="3.2" /><path d="M12 8V5.2" /><circle cx="12" cy="3.8" r="1.4" /><path d="M9.6 13.4h.02M14.4 13.4h.02M9.6 17h4.8" /></>,
  hook: <><path d="M16.2 3.4v9.4a5.4 5.4 0 0 1-10.8 0v-1.2" /><path d="m13.2 6.4 3-3 3 3" /></>,
  call: <><path d="M6.4 3.4h3.1l1.5 4.5-2.1 1.5a12.2 12.2 0 0 0 5.7 5.7l1.5-2.1 4.5 1.5v3.1a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.4 5.6a2 2 0 0 1 2-2.2Z" /></>,
  backpack: <><path d="M6.2 21V10.2a5.8 5.8 0 0 1 11.6 0V21Z" /><path d="M9.2 6.6V5a2.8 2.8 0 0 1 5.6 0v1.6" /><path d="M9.4 14.2h5.2" /></>,
  wifi: <><path d="M2.6 8.8a14.2 14.2 0 0 1 18.8 0" /><path d="M6 12.4a9.1 9.1 0 0 1 12 0" /><path d="M9.4 16a4.1 4.1 0 0 1 5.2 0" /><circle cx="12" cy="19.4" r="1.3" /></>,

  // -- Bericht und Navigation ----------------------------------------------
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1Z" /></>,
  trend: <><path d="m3 6.8 6.2 6.5 3.8-3.4 8 7.6" /><path d="M15 17.5h6v-6" /></>,
  graph: <><circle cx="5.8" cy="12" r="2.6" /><circle cx="18.2" cy="6" r="2.6" /><circle cx="18.2" cy="18" r="2.6" /><path d="m8.2 10.9 7.6-3.6M8.2 13.1l7.6 3.6" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12.2 2.8 2.8L16 9.6" /></>,
  cart: <><circle cx="9.6" cy="19.8" r="1.4" /><circle cx="17.8" cy="19.8" r="1.4" /><path d="M2.6 4h2.7l2.4 11.4h11l1.9-8.2H6.2" /></>,
  printer: <><path d="M7 9.2V3.6h10v5.6" /><rect x="3.2" y="9.2" width="17.6" height="7.4" rx="2.2" /><path d="M7 13.8h10v6.6H7Z" /></>,
  download: <><path d="M12 3.4v11.2" /><path d="m7.6 10.4 4.4 4.4 4.4-4.4" /><path d="M4 19.8h16" /></>,
  shield: <><path d="M12 3 19 6v5.5c0 4.2-2.9 7.9-7 9-4.1-1.1-7-4.8-7-9V6Z" /></>,
  trash: <><path d="M4 6.4h16" /><path d="M9.2 6.4V3.8h5.6v2.6" /><path d="M6.4 6.4 7.4 20.4h9.2l1-14" /></>,
  tick: <><path d="m5 12.6 4.6 4.6L19 7.4" /></>,
  alert: <><path d="M12 3.8 21.4 19.8a1 1 0 0 1-.9 1.4H3.5a1 1 0 0 1-.9-1.4Z" /><path d="M12 9.6v4.4" /><path d="M12 17.6h.02" /></>,
  chevron: <><path d="m6.4 9.6 5.6 5.6 5.6-5.6" /></>,
  external: <><path d="M7 17 17 7" /><path d="M8.6 7H17v8.4" /></>,
}

/**
 * @param {string} name  Schlüssel aus dem Satz oben.
 * @param {string} className  Größe und Farbe kommen von außen (Tailwind).
 */
export default function Icon({ name, className = 'h-4 w-4' }) {
  const paths = P[name]
  if (!paths) return null
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  )
}

/** Für Stellen, die nur wissen wollen, ob ein Name gültig ist. */
export const hasIcon = (name) => Boolean(P[name])

// ---------------------------------------------------------------------------
// Risikoprofil-Archetyp
// ---------------------------------------------------------------------------
// Ein Archetyp fasst zusammen, *wie* jemand angreifbar ist — nicht wie stark.
// Er hilft beim Einordnen ("aha, so sieht mein Muster aus") und rahmt den
// restlichen Report. Die Auswahl läuft über Punktzahlen, damit sich mehrere
// zutreffende Muster gegeneinander abwägen lassen.
// ---------------------------------------------------------------------------

const ARCHETYPES = [
  {
    id: 'gamer',
    name: 'Das lohnende Gaming-Ziel',
    tagline: 'Dein Account ist Geld wert — und die Szene weiß das.',
    body: 'Angriffe auf dich sind selten technisch anspruchsvoll und fast immer sozial: ein Link von einem Freund, dessen Konto bereits übernommen wurde. Der Angreifer will keine Passwörter, er will deine aktive Sitzung — und die überlebt sowohl eine Passwortänderung als auch den zweiten Faktor.',
    score: (p) =>
      (p.gamingInvested ? 40 : 0) + (p.gamesPc ? 20 : 0) + (p.tradesItems ? 25 : 0) + (p.hasDiscord ? 12 : 0) + (p.usesCracks ? 15 : 0),
  },
  {
    id: 'family-hub',
    name: 'Die Familien-Schaltzentrale',
    tagline: 'Du bist nicht nur für dich verantwortlich, sondern für vier weitere Menschen.',
    body: 'Dein Risiko ist verteilt: Es hängt an Geräten, die du nicht selbst bedienst, und an Entscheidungen, die andere treffen. Gleichzeitig läuft alles bei dir zusammen — deine Konten, deine Zahlungsmittel, dein Netz. Die wirksamsten Maßnahmen sind hier nicht technisch, sondern organisatorisch.',
    score: (p) => (p.hasKids ? 35 : 0) + (p.kidsUnmanaged ? 20 : 0) + (p.supportsElderly ? 25 : 0) + (p.hasTeens ? 15 : 0),
  },
  {
    id: 'exposed',
    name: 'Die exponierte Person',
    tagline: 'Du bist ein ausgesuchtes Ziel, kein zufälliges.',
    body: 'Der entscheidende Unterschied: Bei dir lohnt sich Aufwand. Angreifer recherchieren vorher, formulieren gezielt und probieren mehrfach. Breitenmaßnahmen reichen dafür nicht — du brauchst phishing-resistente Anmeldung und eine bewusst reduzierte öffentliche Datenspur.',
    score: (p) => p.targetedScore * 0.9 + (p.hasAdversary ? 30 : 0) + (p.socialReach ? 15 : 0),
  },
  {
    id: 'valuable',
    name: 'Das finanziell lohnende Ziel',
    tagline: 'Bei dir rechnet sich für einen Angreifer auch aufwendigeres Vorgehen.',
    body: 'Ab einer bestimmten erreichbaren Summe verschiebt sich das Angreiferprofil: weg von automatisierten Massenangriffen, hin zu SIM-Swapping, gezieltem Phishing und Telefonbetrug. Dagegen hilft vor allem, die schwächsten Wege in deine Konten aktiv zu schließen.',
    score: (p) => (p.moneyValue > 70 ? 35 : p.moneyValue > 55 ? 18 : 0) + (p.cryptoSignificant ? 30 : 0) + (p.hasBroker ? 10 : 0),
  },
  {
    id: 'crypto',
    name: 'Der Selbstverwahrer',
    tagline: 'Bei dir gibt es keine Rückbuchung und keine Hotline.',
    body: 'Selbstverwahrung heißt, dass du die Rolle der Bank übernommen hast — inklusive Haftung. Es gibt genau einen kritischen Punkt: die Seed-Phrase. Alles andere ist nachrangig, solange dieser Punkt nicht sauber gelöst ist.',
    score: (p) => (p.cryptoSelfCustody ? 35 : 0) + (p.cryptoSignificant ? 25 : 0) + (p.seedExposed ? 25 : 0),
  },
  {
    id: 'remote-worker',
    name: 'Der Grenzgänger zwischen Arbeit und Privat',
    tagline: 'Ein privater Vorfall wird bei dir zu einem beruflichen.',
    body: 'Deine Angriffsfläche ist doppelt belegt: Was privat passiert, betrifft deinen Arbeitgeber — und was beruflich passiert, betrifft dein Privatgerät. Das Unangenehme daran ist nicht der technische Schaden, sondern die Rechenschaftspflicht danach.',
    score: (p) => (p.workOnPrivateDevice ? 30 : 0) + (p.mixesWork ? 15 : 0) + (p.workCritical ? 25 : 0) + (p.fullyRemote ? 12 : 0),
  },
  {
    id: 'traveler',
    name: 'Der Dauerreisende',
    tagline: 'Dein Risiko wandert mit dir.',
    body: 'Fremde Netze, wechselnde Geräteumgebungen, Bildschirme in der Öffentlichkeit und deutlich höhere Verlustwahrscheinlichkeit. Das meiste davon löst du nicht mit Software, sondern mit Verschlüsselung, starker Gerätesperre und der Gewohnheit, den eigenen Hotspot zu nutzen.',
    score: (p) => (p.travelsOften ? 30 : 0) + (p.usesPublicWifi ? 20 : 0) + (p.lostDevice ? 15 : 0),
  },
  {
    id: 'connected-home',
    name: 'Das vernetzte Zuhause',
    tagline: 'Du hast mehr Computer in der Wohnung, als dir bewusst ist.',
    body: 'Jedes smarte Gerät ist ein kleiner Rechner mit eigener Software und eigenem Update-Zyklus — meist einem sehr kurzen. Das Risiko liegt weniger im einzelnen Gerät als darin, dass alle im selben Netz hängen wie dein Rechner und dein Datenspeicher.',
    score: (p) => (p.smartHomeCount >= 5 ? 28 : p.smartHomeCount >= 3 ? 15 : 0) + (p.hasCameras ? 20 : 0) + (p.exposedToInternet ? 25 : 0) + (p.hasNas ? 12 : 0),
  },
  {
    id: 'trusting',
    name: 'Der ansprechbare Typ',
    tagline: 'Deine Angriffsfläche ist nicht technisch, sondern kommunikativ.',
    body: 'Bei dir führt der wahrscheinlichste Weg über ein Gespräch oder eine Nachricht, nicht über eine Sicherheitslücke. Das ist keine Schwäche — es ist der mit Abstand häufigste Weg überhaupt. Wirksam sind hier feste Regeln, die auch dann greifen, wenn du gerade abgelenkt bist.',
    score: (p) =>
      (p.clicksLinks ? 25 : 0) + (p.answersUnknownCalls ? 20 : 0) + (p.isNovice ? 20 : 0) + (p.isSenior ? 20 : 0) + (p.wasPhished ? 15 : 0),
  },
  {
    id: 'sprawl',
    name: 'Der gewachsene Datenberg',
    tagline: 'Dein Problem ist nicht ein Loch, sondern die schiere Fläche.',
    body: 'Über die Jahre haben sich Konten, Geräte und Dienste angesammelt, die niemand mehr überblickt — und genau dort sitzen die alten, schwachen Passwörter ohne zweiten Faktor. Aufräumen wirkt hier stärker als jede zusätzliche Schutzmaßnahme.',
    score: (p) => (p.accountCount > 90 ? 25 : 0) + (p.manyOldAccounts ? 25 : 0) + (p.deviceCount >= 9 ? 15 : 0) + (p.emailOneForAll ? 15 : 0) + (p.unsupportedDevicesOnline ? 15 : 0),
  },
  {
    id: 'minimalist',
    name: 'Der digitale Minimalist',
    tagline: 'Wenig Fläche — dafür hängt viel an wenigen Punkten.',
    body: 'Du nutzt wenige Dienste und wenige Geräte. Das senkt dein Risiko spürbar, konzentriert es aber auch: Fällt dein eines Konto oder dein eines Gerät aus, fällt alles gleichzeitig aus. Die richtige Antwort darauf ist nicht mehr Schutz, sondern mehr Redundanz.',
    score: (p) =>
      (p.deviceCount <= 3 ? 20 : 0) + (p.socialCount <= 1 ? 15 : 0) + (p.accountCount < 25 ? 15 : 0) + (p.smartHomeCount === 0 ? 10 : 0) + (p.noRecoveryPlan ? 12 : 0),
  },
  {
    id: 'solid',
    name: 'Die belastbare Grundlage',
    tagline: 'Die Basis sitzt. Jetzt geht es um den Ernstfall.',
    body: 'Passwörter, zweiter Faktor und Gerätehygiene sind bei dir in Ordnung — damit bist du weiter als die große Mehrheit. Was jetzt zählt, ist die Frage, was passiert, wenn doch etwas schiefgeht: Wiederherstellung, Backup, Notfallplan. Das ist der Teil, den auch technisch versierte Menschen regelmäßig auslassen.',
    score: (p) =>
      (p.hasRealManager ? 20 : 0) + (p.mfaStrength >= 70 ? 20 : 0) + (p.noReuse ? 15 : 0) + (p.deviceHygiene >= 70 ? 12 : 0) + (p.clickRisk <= 25 ? 10 : 0),
  },
]

/** Den am besten passenden Archetyp bestimmen, plus knapp verfehlte Muster. */
export function pickArchetype(profile) {
  const scored = ARCHETYPES.map((a) => ({ ...a, value: a.score(profile) })).sort((a, b) => b.value - a.value)

  const primary = scored[0]
  const secondary = scored[1]?.value >= Math.max(20, primary.value * 0.55) ? scored[1] : null

  return {
    primary: { id: primary.id, name: primary.name, tagline: primary.tagline, body: primary.body },
    secondary: secondary ? { id: secondary.id, name: secondary.name, tagline: secondary.tagline } : null,
  }
}

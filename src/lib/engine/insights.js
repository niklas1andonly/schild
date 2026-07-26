// ---------------------------------------------------------------------------
// Erkenntnisse
// ---------------------------------------------------------------------------
// Der Teil des Reports, der widerspricht. Ein Risikoranking allein ändert
// selten etwas — wirksam wird es erst, wenn es die Annahme benennt, unter der
// jemand bisher gehandelt hat ("ich habe doch einen Virenscanner").
//
// Jede Erkenntnis muss aus den berechneten Zahlen belegbar sein. Keine
// Erkenntnis wird ausgegeben, nur weil sie gut klingt.
// ---------------------------------------------------------------------------

const KIND = {
  headline: { label: 'Der Kernbefund', tone: 'accent' },
  myth: { label: 'Das kannst du dir sparen', tone: 'medium' },
  blindspot: { label: 'Blinder Fleck', tone: 'high' },
  win: { label: 'Das machst du richtig', tone: 'low' },
}

export { KIND as INSIGHT_KINDS }

const pct = (n) => `${Math.round(n)}`

export function buildInsights({ profile: p, threats, ranked }) {
  const out = []
  const top = threats[0]
  const byId = Object.fromEntries(threats.map((t) => [t.id, t]))
  const riskOf = (id) => byId[id]?.risk ?? 0
  const rankOf = (id) => {
    const i = threats.findIndex((t) => t.id === id)
    return i === -1 ? null : i + 1
  }
  const topAction = ranked[0]

  // --- Kernbefund: das erwartete Risiko gegen das tatsächliche -------------
  if (top) {
    const malwareRisk = Math.max(riskOf('infostealer'), riskOf('ransomware'), riskOf('mobile-malware'))
    const expectsMalware = top.category !== 'malware' && malwareRisk < top.risk

    out.push({
      id: 'headline',
      kind: 'headline',
      title: expectsMalware
        ? `Dein größtes Risiko ist nicht Schadsoftware. Es ist ${top.short}.`
        : `Dein größtes Risiko ist ${top.short}.`,
      body: expectsMalware
        ? `Die meisten Menschen denken bei digitaler Sicherheit zuerst an Viren. In deinem Profil liegt "${top.short}" mit ${top.risk} von 100 Risikopunkten deutlich vor allem, was mit Schadsoftware zu tun hat (${malwareRisk}). Ausschlaggebend ist: ${top.drivers[0]?.label ?? 'die Kombination deiner Antworten'}.`
        : `${top.oneLiner} Ausschlaggebend ist bei dir vor allem zweierlei — ${top.drivers
            .slice(0, 2)
            .map((d) => d.label)
            .join(' · ')}.`,
      evidence: top.drivers.map((d) => d.label),
    })
  }

  // --- Bezahlte Schutzsoftware gegen kostenlose Grundlagen -----------------
  if (p.paidAntivirus && topAction) {
    const avCoverage = Math.round(
      0.2 * (riskOf('infostealer') + riskOf('ransomware') + riskOf('mobile-malware')),
    )
    if (topAction.gain > avCoverage * 1.5) {
      const factor = Math.max(2, Math.round(topAction.gain / Math.max(avCoverage, 1)))
      out.push({
        id: 'antivirus',
        kind: 'myth',
        title: `Du zahlst für eine Security-Suite. "${topAction.title}" bringt dir rechnerisch etwa ${factor}-mal mehr — und kostet ${(topAction.cost ?? 0) === 0 ? 'nichts' : 'weniger'}.`,
        body: `Der in Windows und macOS eingebaute Schutz erkennt heute im Wesentlichen dasselbe wie eine gekaufte Suite. Gegen die Angriffswege, die in deinem Profil oben stehen, hilft er ohnehin nicht: Ein Virenscanner verhindert kein wiederverwendetes Passwort und keine erschlichene Freigabe. Das Abo-Geld ist in einem Backup-Medium oder einem Hardware-Schlüssel besser angelegt.`,
        evidence: [
          `Zusätzliche Schutzsoftware entfernt bestenfalls ~${avCoverage} Risikopunkte`,
          `"${topAction.title}" entfernt ~${topAction.gain} Risikopunkte`,
          'Summiert über alle betroffenen Bedrohungen',
        ],
      })
    }
  }

  // --- VPN als vermeintlicher Grundschutz ---------------------------------
  if ((p.vpnAlways || p.freeVpn) && (p.reusesPasswords || p.noMfa || p.backupMaturity < 40)) {
    const wifiRank = rankOf('public-network')
    out.push({
      id: 'vpn',
      kind: 'myth',
      title: p.freeVpn
        ? 'Dein kostenloses VPN verlagert das Problem, statt es zu lösen.'
        : `Dein VPN adressiert ein Risiko, das bei dir auf Platz ${wifiRank ?? '—'} steht.`,
      body: p.freeVpn
        ? 'Ein VPN-Betrieb kostet Geld. Wer nichts verlangt, finanziert sich anders — üblicherweise über die Daten, die durch den Tunnel laufen. Damit hast du nicht weniger Mitleser, sondern nur andere. Gleichzeitig stehen bei dir Grundlagen offen, die messbar mehr Risiko tragen.'
        : `Ein VPN schützt gegen Mitlesen in fremden Netzen. Das ist real, aber begrenzt: Es hilft nicht gegen Phishing, nicht gegen schwache Passwörter, nicht gegen fehlende Backups — also nicht gegen das, was in deinem Profil oben steht. Behalte es ruhig. Aber erledige zuerst die Punkte darüber.`,
      evidence: [`"Öffentliches WLAN": ${riskOf('public-network')} Risikopunkte`, top ? `"${top.short}": ${top.risk} Risikopunkte` : ''].filter(Boolean),
    })
  }

  // --- Synchronisation ist kein Backup -------------------------------------
  if (p.cloudOnlyBackup) {
    out.push({
      id: 'cloud-backup',
      kind: 'blindspot',
      title: 'Deine Cloud ist kein Backup. Sie ist eine Spiegelung.',
      body: 'Ein Backup zeichnet Zustände auf und ist zeitweise getrennt. Eine Synchronisation überträgt jede Änderung sofort überall hin — auch das Löschen und auch die Verschlüsselung durch Ransomware. Und ein gesperrtes Konto nimmt alle Geräte gleichzeitig mit. Das ist kein theoretischer Fall: automatisierte Kontosperren passieren regelmäßig und ohne Vorwarnung.',
      evidence: [`"Datenverlust": ${riskOf('data-loss')} Risikopunkte`, `"Ransomware": ${riskOf('ransomware')} Risikopunkte`],
    })
  }

  // --- Zwei Faktoren auf einem Gerät ---------------------------------------
  if (p.tanSameDevice && p.banksOnline) {
    out.push({
      id: 'tan-same-device',
      kind: 'blindspot',
      title: 'Deine Zwei-Faktor-Absicherung beim Banking ist faktisch einer.',
      body: 'Überweisung und Freigabe laufen bei dir auf demselben Handy. Der Sinn des Verfahrens ist aber genau die Trennung: Wer ein Gerät kontrolliert, soll nicht beide Schritte kontrollieren. Auf einem Gerät gibt es diese Trennung nicht mehr — eine einzige Schadsoftware genügt.',
      evidence: [`"Banking-Betrug": ${riskOf('banking-fraud')} Risikopunkte`, `"Handy-Schadsoftware": ${riskOf('mobile-malware')} Risikopunkte`],
    })
  }

  // --- Zweiter Faktor vorhanden, aber der schwächste ----------------------
  if (p.smsOnlyMfa) {
    out.push({
      id: 'sms-mfa',
      kind: 'blindspot',
      title: 'Du hast Zwei-Faktor aktiviert — in der schwächsten verfügbaren Form.',
      body: 'SMS ist besser als nichts, aber der einzige zweite Faktor, der sich gleich auf drei Wegen abgreifen lässt: durch Übernahme deiner Rufnummer, durch eine App, die Nachrichten mitliest, und durch eine Phishing-Seite, die den Code in Echtzeit weiterreicht. Der Wechsel auf eine Authenticator-App kostet zwanzig Minuten und schließt die ersten beiden Wege vollständig.',
      evidence: [`"SIM-Swapping": ${riskOf('sim-swap')} Risikopunkte`],
    })
  }

  // --- Technische Souveränität, aber ohne Vorsorge -------------------------
  if (p.isTechie && p.backupMaturity < 45) {
    out.push({
      id: 'techie-no-backup',
      kind: 'blindspot',
      title: 'Du bist technisch souverän — und hast trotzdem kein belastbares Backup.',
      body: 'Das ist erstaunlich verbreitet: Wer sich auskennt, sichert sich gegen Angreifer ab und unterschätzt den Defekt. Der wahrscheinlichste digitale Totalschaden hat aber gar keinen Täter — Hardwareausfall, Fehlbedienung, Diebstahl. Und es ist der einzige Schaden, der ohne Vorbereitung endgültig ist.',
      evidence: [`"Datenverlust": ${riskOf('data-loss')} Risikopunkte`],
    })
  }

  // --- Bekanntes Leak, keine Reaktion --------------------------------------
  if (p.knownBreachIgnored) {
    out.push({
      id: 'known-breach',
      kind: 'blindspot',
      title: 'Du weißt von einem Leak und hast nichts geändert.',
      body: 'Das ist kein hypothetisches Risiko, sondern ein laufender Vorgang: Geleakte Zugangsdaten werden dauerhaft und automatisiert gegen andere Dienste durchprobiert. Solange dieses Passwort irgendwo im Einsatz ist, ist die Frage nur, welcher Dienst zuerst trifft.',
      evidence: [`"Passwort-Wiederverwendung": ${riskOf('credential-stuffing')} Risikopunkte`],
    })
  }

  // --- Öffentliche Spur trifft schwache Wiederherstellung ------------------
  if (p.onlineExposure > 55 && !p.hasRecoveryCodes) {
    out.push({
      id: 'exposure-recovery',
      kind: 'blindspot',
      title: 'Über dich ist genug öffentlich, dass sich jemand am Telefon als du ausgeben kann.',
      body: `Geburtsdatum, Wohnort, Arbeitgeber, Familiennamen — einzeln harmlos, zusammen reicht es, um eine telefonische Identitätsprüfung zu bestehen oder eine Sicherheitsfrage zu beantworten. Der Angreifer braucht dein Passwort dann nicht mehr: Er nimmt den Weg, der für Vergessliche gebaut wurde.`,
      evidence: [
        `Öffentliche Datenspur: ${pct(p.onlineExposure)} von 100`,
        `"Wiederherstellung als Hintertür": ${riskOf('account-recovery-abuse')} Risikopunkte`,
      ],
    })
  }

  // --- Was tatsächlich gut läuft -------------------------------------------
  const wins = []
  if (p.hasRealManager) wins.push('ein echter Passwortmanager')
  if (p.hasPhishResistantMfa) wins.push('phishing-resistente Anmeldung (Passkeys oder Hardware-Schlüssel)')
  if (p.noReuse) wins.push('keine wiederverwendeten Passwörter')
  if (p.backupMaturity >= 80) wins.push('ein getestetes Backup mit getrennter Kopie')
  if (p.tanStrong) wins.push('ein getrenntes Freigabeverfahren beim Banking')
  if (p.clickRisk <= 20) wins.push('eine belastbare Routine im Umgang mit Links')
  if (p.routerManaged) wins.push('ein gepflegter eigener Router')
  if (p.hasRecoveryCodes) wins.push('gesicherte Wiederherstellungscodes')
  if (p.usesAliases) wins.push('getrennte Adressen und Aliase')
  if (p.seedSafe) wins.push('eine offline verwahrte Seed-Phrase')

  if (wins.length >= 2) {
    out.push({
      id: 'wins',
      kind: 'win',
      title:
        wins.length >= 4
          ? 'Du bist bei den Grundlagen weiter als die allermeisten.'
          : 'Das steht bei dir bereits.',
      body: `Konkret: ${wins.join(', ')}. Das ist kein Nebensatz — genau diese Punkte verhindern die häufigsten Vorfälle. Der Rest dieses Berichts baut darauf auf, statt bei null anzufangen.`,
      evidence: [],
    })
  }

  return out
}

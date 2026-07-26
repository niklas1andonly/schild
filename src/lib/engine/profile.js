// ---------------------------------------------------------------------------
// Profil-Ableitung
// ---------------------------------------------------------------------------
// Übersetzt die Rohantworten in ein verdichtetes Merkmalsprofil. Alles, was
// danach kommt (Bedrohungen, Angriffsketten, Maßnahmen), liest ausschließlich
// aus diesem Profil — nicht mehr aus den Antworten direkt. Das hält die
// Bewertungslogik an einer Stelle und macht sie testbar.
//
// Konvention für Kennzahlen: 0 = schlecht/ungeschützt, 100 = gut/geschützt.
// Ausnahme sind Felder mit "…Risk"/"…Exposure" im Namen — dort ist 100 schlecht.
// ---------------------------------------------------------------------------

import { has, hasAny } from '../../data/questions.js'

/** Wert aus einer Zuordnung lesen, mit Rückfallwert. */
const map = (value, table, fallback = 0) =>
  value != null && Object.prototype.hasOwnProperty.call(table, value) ? table[value] : fallback

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))

/** Anzahl gesetzter Werte einer Mehrfachauswahl, ohne "nichts davon". */
const countMulti = (v, exclude = ['none', 'nothing']) =>
  Array.isArray(v) ? v.filter((x) => !exclude.includes(x)).length : 0

export function buildProfile(answers = {}) {
  const a = answers
  const p = {}

  // -- Wer ist die Person ---------------------------------------------------
  p.age = a.age ?? null
  p.isMinor = a.age === 'u18'
  p.isYoung = hasAny(a, 'age', ['u18', '18-29'])
  p.isSenior = hasAny(a, 'age', ['65plus'])
  p.isOlder = hasAny(a, 'age', ['50-64', '65plus'])
  p.job = a.job ?? null
  p.selfemployed = a.job === 'selfemployed'
  p.tech = a.techlevel ?? 3
  p.isTechie = p.tech >= 4 || a.job === 'it'
  p.isNovice = p.tech <= 2

  p.hasKids = has(a, 'household', 'kids')
  p.hasSmallKids = hasAny(a, 'kids_age', ['u6', '6-12'])
  p.hasTeens = has(a, 'kids_age', '13-17')
  p.kidsUnmanaged = has(a, 'kids_devices', 'own-unmanaged')
  p.livesAlone = has(a, 'household', 'alone')
  p.supportsElderly = has(a, 'household', 'elderly')

  // Wie sehr ist die Person ein *ausgesuchtes* statt zufälliges Ziel?
  p.targetedScore = clamp(
    (has(a, 'public_role', 'local-public') ? 10 : 0) +
      (has(a, 'public_role', 'creator') ? 20 : 0) +
      (has(a, 'public_role', 'job-exposed') ? 18 : 0) +
      (has(a, 'public_role', 'wealth') ? 22 : 0) +
      (has(a, 'public_role', 'access') ? 20 : 0) +
      (has(a, 'public_role', 'conflict') ? 25 : 0) +
      (a.job === 'selfemployed' ? 8 : 0) +
      (a.job === 'finance-legal' ? 8 : 0) +
      (has(a, 'social_visibility', 'public-reach') ? 12 : 0),
  )
  p.isTargeted = p.targetedScore >= 25
  p.hasAdversary = has(a, 'public_role', 'conflict')

  // -- Geräte ---------------------------------------------------------------
  p.phoneOs = a.phone_os ?? null
  p.isIos = hasAny(a, 'phone_os', ['ios', 'both'])
  p.isAndroid = hasAny(a, 'phone_os', ['android', 'both'])
  p.hasComputer = !has(a, 'computer_os', 'none') && !!a.computer_os
  p.isWindows = hasAny(a, 'computer_os', ['windows', 'mixed'])
  p.isMac = hasAny(a, 'computer_os', ['mac', 'mixed'])
  p.oldWindows = hasAny(a, 'windows_version', ['win10', 'older'])
  p.veryOldWindows = has(a, 'windows_version', 'older')
  p.oldPhone = hasAny(a, 'phone_age', ['o4'])

  p.deviceCount = map(a.device_count, { '1-3': 2, '4-6': 5, '7-12': 9, '12plus': 16 }, 4)

  p.updateScore = map(
    a.updates,
    { auto: 95, days: 80, weeks: 40, rarely: 12, unknown: 35 },
    50,
  )
  p.updatesBad = hasAny(a, 'updates', ['weeks', 'rarely'])

  p.lockScore = map(
    a.screenlock,
    { 'bio-long': 95, 'bio-4': 70, 'pin-only': 60, pattern: 40, none: 0 },
    60,
  )
  p.noLock = has(a, 'screenlock', 'none')
  p.encrypted = has(a, 'disk_encryption', 'yes')
  p.notEncrypted = hasAny(a, 'disk_encryption', ['no', 'unknown'])
  p.paidAntivirus = has(a, 'antivirus', 'paid')
  p.noAntivirus = has(a, 'antivirus', 'none')
  p.dailyAdmin = has(a, 'admin_account', 'admin')
  p.unsupportedDevicesOnline = has(a, 'old_devices', 'yes-online')

  p.deviceHygiene = clamp(
    0.4 * p.updateScore +
      0.25 * p.lockScore +
      0.2 * (p.encrypted ? 100 : p.notEncrypted ? 20 : 50) +
      0.15 * (p.dailyAdmin ? 30 : 85) -
      (p.unsupportedDevicesOnline ? 10 : 0) -
      (p.veryOldWindows ? 15 : 0),
  )

  // -- Konten & Passwörter --------------------------------------------------
  p.pwManager = a.password_manager ?? null
  p.hasRealManager = has(a, 'password_manager', 'dedicated')
  p.hasEcosystemManager = has(a, 'password_manager', 'ecosystem')
  p.hasAnyManager = hasAny(a, 'password_manager', ['dedicated', 'ecosystem', 'browser'])
  p.noManager = hasAny(a, 'password_manager', ['memory', 'notes'])

  p.reuseScore = map(
    a.password_reuse,
    { never: 0, few: 30, many: 70, mostly: 100 },
    60,
  ) // 100 = schlimmste Wiederverwendung
  p.reusesPasswords = hasAny(a, 'password_reuse', ['many', 'mostly'])
  p.heavyReuse = has(a, 'password_reuse', 'mostly')
  p.noReuse = has(a, 'password_reuse', 'never')

  p.pwStrength = map(
    a.password_strength,
    { random: 95, passphrase: 80, mixed: 45, simple: 15 },
    50,
  )

  p.mfaBreadth = map(
    a.mfa_usage,
    { everywhere: 95, important: 70, some: 40, forced: 20, none: 0, unknown: 5 },
    35,
  )
  p.hasPhishResistantMfa = hasAny(a, 'mfa_type', ['passkey', 'hardware'])
  p.hasAppMfa = hasAny(a, 'mfa_type', ['totp', 'push'])
  p.smsOnlyMfa =
    hasAny(a, 'mfa_type', ['sms', 'email']) && !p.hasAppMfa && !p.hasPhishResistantMfa
  p.usesSmsMfa = hasAny(a, 'mfa_type', ['sms'])
  p.noMfa = hasAny(a, 'mfa_usage', ['none', 'unknown'])

  // Qualität des zweiten Faktors, nicht nur die Verbreitung.
  const mfaQuality = p.hasPhishResistantMfa ? 100 : p.hasAppMfa ? 70 : p.smsOnlyMfa ? 35 : 0
  p.mfaStrength = clamp(0.55 * p.mfaBreadth + 0.45 * mfaQuality)

  p.emailProvider = a.email_provider ?? null
  p.emailIsFreemail = hasAny(a, 'email_provider', ['de-freemail', 'isp', 'other'])
  p.emailOneForAll = has(a, 'email_separation', 'one')
  p.usesAliases = has(a, 'email_separation', 'aliases')

  p.breachAware = hasAny(a, 'breach_check', ['recent'])
  p.neverCheckedBreach = hasAny(a, 'breach_check', ['never', 'heard'])
  p.knownBreachIgnored = has(a, 'known_breach', 'yes-nothing')

  p.hasRecoveryCodes = has(a, 'recovery_setup', 'codes')
  p.noRecoveryPlan = has(a, 'recovery_setup', 'nothing')
  p.recoveryViaPhone = has(a, 'recovery_setup', 'phone')
  p.accountCount = map(
    a.account_count,
    { u20: 15, '20-50': 35, '50-100': 75, '100plus': 150, unknown: 60 },
    45,
  )
  p.manyOldAccounts = has(a, 'old_accounts', 'many')

  // Kern-Kennzahl: Passwort-Hygiene.
  p.passwordHygiene = clamp(
    0.45 * (100 - p.reuseScore) +
      0.3 * (p.hasRealManager ? 100 : p.hasEcosystemManager ? 75 : p.hasAnyManager ? 55 : 10) +
      0.25 * p.pwStrength,
  )

  // Der wichtigste Einzelwert überhaupt: wie gut ist das Mailkonto geschützt?
  p.emailDefense = clamp(
    0.5 * p.mfaStrength +
      0.3 * p.passwordHygiene +
      0.2 * (p.hasRecoveryCodes ? 100 : p.noRecoveryPlan ? 15 : 55),
  )

  // -- Geld -----------------------------------------------------------------
  p.banksOnline = !has(a, 'online_banking', 'branch') && !!a.online_banking
  p.banksInBrowser = hasAny(a, 'online_banking', ['browser', 'both'])
  p.tanSameDevice = has(a, 'banking_tan', 'same-device')
  p.tanStrong = hasAny(a, 'banking_tan', ['chiptan', 'phototan', 'other-device'])
  p.tanSms = has(a, 'banking_tan', 'sms')

  p.paymentServices = countMulti(a.payment_services)
  p.hasPaypal = has(a, 'payment_services', 'paypal')
  p.cardsStored = has(a, 'payment_services', 'card-stored')

  p.crypto = a.crypto ?? 'none'
  p.hasCrypto = !hasAny(a, 'crypto', ['none']) && !!a.crypto
  p.cryptoSelfCustody = hasAny(a, 'crypto', ['hot', 'hardware', 'significant'])
  p.cryptoSignificant = has(a, 'crypto', 'significant')
  p.seedExposed = hasAny(a, 'crypto_seed', ['cloud', 'manager', 'none'])
  p.seedSafe = has(a, 'crypto_seed', 'steel')
  p.hasBroker = hasAny(a, 'broker', ['significant', 'small'])

  p.moneyValue = clamp(
    map(a.financial_exposure, { u1k: 15, '1-10k': 40, '10-100k': 70, o100k: 95, skip: 50 }, 45) +
      (p.cryptoSignificant ? 15 : p.hasCrypto ? 6 : 0) +
      (has(a, 'broker', 'significant') ? 10 : 0),
  )

  // -- Verhalten ------------------------------------------------------------
  p.homeoffice = hasAny(a, 'homeoffice', ['hybrid', 'remote'])
  p.fullyRemote = has(a, 'homeoffice', 'remote')
  p.mixesWork = hasAny(a, 'work_mixing', ['private-on-work', 'work-on-private', 'both'])
  p.workOnPrivateDevice = hasAny(a, 'work_mixing', ['work-on-private', 'both'])
  p.workSensitive = hasAny(a, 'work_sensitivity', ['critical', 'personal'])
  p.workCritical = has(a, 'work_sensitivity', 'critical')

  p.travelScore = map(a.travel, { rarely: 10, few: 35, monthly: 65, constant: 95 }, 30)
  p.travelsOften = hasAny(a, 'travel', ['monthly', 'constant'])
  p.publicWifiScore = map(
    a.public_wifi,
    { never: 0, rarely: 30, regularly: 70, always: 95 },
    35,
  )
  p.usesPublicWifi = hasAny(a, 'public_wifi', ['regularly', 'always'])
  p.hasVpn = hasAny(a, 'vpn', ['always', 'sometimes'])
  p.vpnAlways = has(a, 'vpn', 'always')
  p.freeVpn = has(a, 'vpn', 'free')

  p.socialCount = countMulti(a.social_media)
  p.usesSocial = p.socialCount > 0
  p.socialPublic = hasAny(a, 'social_visibility', ['public-name', 'public-reach'])
  p.socialReach = has(a, 'social_visibility', 'public-reach')

  p.overshare = countMulti(a.oversharing)
  p.sharesTravel = has(a, 'oversharing', 'travel-live')
  p.sharesKids = has(a, 'oversharing', 'kids-photos')
  p.sharesAddress = has(a, 'oversharing', 'address')
  p.sharesPhone = has(a, 'oversharing', 'phone')
  p.sharesEmployer = has(a, 'oversharing', 'employer')

  // Öffentliche Datenspur — Rohstoff für gezielte Angriffe. 100 = viel Spur.
  p.onlineExposure = clamp(
    p.overshare * 9 +
      (p.socialPublic ? 20 : 0) +
      (p.socialReach ? 15 : 0) +
      p.socialCount * 3 +
      (p.usesAliases ? -10 : 0),
  )

  p.clickRisk = map(
    a.link_behavior,
    { ignore: 8, 'app-check': 15, inspect: 30, plausible: 62, click: 90 },
    45,
  )
  p.clicksLinks = hasAny(a, 'link_behavior', ['plausible', 'click'])
  p.answersUnknownCalls = has(a, 'unknown_calls', 'answer')
  p.callsBackSafely = has(a, 'unknown_calls', 'callback')

  p.downloadRisk = map(
    a.downloads,
    { stores: 8, 'official-sites': 22, anywhere: 65, cracks: 95 },
    30,
  )
  p.usesCracks = has(a, 'downloads', 'cracks')
  p.downloadsAnywhere = hasAny(a, 'downloads', ['anywhere', 'cracks'])

  p.games = !has(a, 'gaming', 'none') && !!a.gaming
  p.gamesPc = hasAny(a, 'gaming', ['pc', 'invested'])
  p.gamingInvested = has(a, 'gaming', 'invested')
  p.gamingPlatforms = Array.isArray(a.gaming_platforms) ? a.gaming_platforms : []
  p.hasSteam = p.gamingPlatforms.includes('steam')
  p.hasDiscord = p.gamingPlatforms.includes('discord')
  p.tradesItems = hasAny(a, 'gaming_trade', ['yes', 'sometimes'])
  p.leaksToAi = hasAny(a, 'ai_tools', ['often', 'sometimes'])

  // -- Zuhause & Netzwerk ---------------------------------------------------
  p.routerDefault = hasAny(a, 'router', ['default', 'unknown'])
  p.routerManaged = has(a, 'router', 'own')
  p.routerNeverUpdated = hasAny(a, 'router_updates', ['never', 'unknown'])
  p.guestWifi = has(a, 'wifi_sharing', 'guests')
  p.sharedWifi = hasAny(a, 'wifi_sharing', ['shared', 'guests-main'])

  p.smartHomeCount = countMulti(a.smart_home)
  p.hasCameras = hasAny(a, 'smart_home', ['cam-in', 'cam-out'])
  p.hasIndoorCam = has(a, 'smart_home', 'cam-in')
  p.hasSmartLock = has(a, 'smart_home', 'lock')
  p.hasVoiceAssistant = has(a, 'smart_home', 'speaker')
  p.hasAlarm = has(a, 'smart_home', 'alarm')

  p.hasNas = !has(a, 'nas', 'none') && !!a.nas
  p.nasRemote = hasAny(a, 'nas', ['remote', 'unknown'])
  p.exposedToInternet = hasAny(a, 'port_forwarding', ['yes', 'unknown']) || p.nasRemote

  p.networkHygiene = clamp(
    0.35 * (p.routerManaged ? 90 : p.routerDefault ? 25 : 60) +
      0.25 * (p.routerNeverUpdated ? 20 : 85) +
      0.2 * (p.guestWifi ? 90 : p.sharedWifi ? 30 : 60) +
      0.2 * (p.exposedToInternet ? 20 : 85) -
      (p.smartHomeCount >= 5 && p.routerDefault ? 8 : 0),
  )

  // -- Daten & Vorsorge -----------------------------------------------------
  p.backupScore = map(
    a.backup,
    { '321': 95, external: 70, cloud: 40, manual: 25, none: 0 },
    30,
  )
  p.noBackup = hasAny(a, 'backup', ['none', 'manual'])
  p.cloudOnlyBackup = has(a, 'backup', 'cloud')
  p.backupTested = has(a, 'backup_tested', 'yes')
  p.backupUntested = hasAny(a, 'backup_tested', ['no', 'never-thought'])
  p.backupMaturity = clamp(p.backupScore * (p.backupTested ? 1 : 0.75))

  p.cloudCount = countMulti(a.cloud_storage)
  p.sensitiveDocs = countMulti(a.sensitive_docs)
  p.hasIdScans = has(a, 'sensitive_docs', 'id-scan')
  p.hasIntimatePhotos = has(a, 'sensitive_docs', 'intimate')
  p.hasPasswordNote = has(a, 'sensitive_docs', 'passwords-note')
  p.hasFinancialDocs = hasAny(a, 'sensitive_docs', ['banking-docs', 'contracts'])
  p.photosIrreplaceable = has(a, 'photos_value', 'catastrophic')
  p.legacyPlanned = has(a, 'digital_legacy', 'yes')

  p.incidents = Array.isArray(a.past_incident)
    ? a.past_incident.filter((x) => x !== 'none')
    : []
  p.hadIncident = p.incidents.length > 0
  p.wasPhished = p.incidents.includes('phishing') || p.incidents.includes('account-hacked')
  p.lostMoney = p.incidents.includes('scam-money') || p.incidents.includes('card-fraud')
  p.wasHarassed = p.incidents.includes('harassment')
  p.lostDevice = p.incidents.includes('device-lost')

  p.worries = Array.isArray(a.worry) ? a.worry.filter((x) => x !== 'nothing') : []

  // -- Zusammenfassende Kennzahlen -----------------------------------------
  p.identityValue = clamp(
    40 + p.sensitiveDocs * 8 + (p.hasIdScans ? 15 : 0) + (p.onlineExposure > 50 ? 10 : 0),
  )

  // Wie viel Angriffsfläche existiert überhaupt?
  p.surface = clamp(
    p.deviceCount * 3 +
      p.socialCount * 3 +
      p.smartHomeCount * 3 +
      p.cloudCount * 4 +
      p.paymentServices * 3 +
      (p.accountCount > 60 ? 12 : 6) +
      (p.games ? 6 : 0) +
      (p.hasNas ? 6 : 0),
  )

  return p
}

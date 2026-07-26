// ---------------------------------------------------------------------------
// Testprofile
// ---------------------------------------------------------------------------
// Zwei Sorten, mit Absicht:
//
// `GENERATED` entsteht aus dem Fragenkatalog selbst — dadurch sind die Werte
// per Konstruktion gültig und die Profile wachsen automatisch mit, wenn Fragen
// dazukommen. Sie decken die Ränder ab (alles erste/letzte Option, maximale
// Fläche) und sind der Stresstest für die Invarianten.
//
// `PERSONAS` sind von Hand geschrieben und lesbar — sie sind die Grundlage der
// Golden-Snapshots. Ändert sich ein Snapshot, muss man sehen können, *wessen*
// Bericht sich geändert hat. "Rentnerin ohne Passwortmanager" leistet das,
// "allFirst" nicht.
//
// `tests/catalog.test.js` prüft beide gegen den Katalog: unbekannte Frage-IDs,
// ungültige Optionswerte und Antworten auf Fragen, die bei diesem Stand gar
// nicht gestellt würden, schlagen dort fehl.
// ---------------------------------------------------------------------------

import { QUESTIONS } from '../../src/data/questions.js'

export const optionValues = (q) =>
  q.type === 'scale' ? q.scale.map((s) => s.v) : (q.options ?? []).map((o) => o.v)

/**
 * Baut ein vollständiges Antwortset, indem es den Katalog einmal durchläuft
 * und `pick` je Frage entscheiden lässt. `showIf` wird dabei gegen den bereits
 * gefüllten Stand ausgewertet — genau wie im Fragebogen.
 */
function generate(pick) {
  const answers = {}
  for (const q of QUESTIONS) {
    if (q.showIf && !q.showIf(answers)) continue
    const value = pick(q)
    if (value != null) answers[q.id] = value
  }
  return answers
}

const first = (q) => {
  const v = optionValues(q)
  return q.type === 'multi' ? [v[0]] : v[0]
}

const last = (q) => {
  const v = optionValues(q)
  return q.type === 'multi' ? [v[v.length - 1]] : v[v.length - 1]
}

/** Maximale Angriffsfläche: bei Mehrfachauswahl alles außer den Ausschlussoptionen. */
const broad = (q) => {
  if (q.type !== 'multi') return last(q)
  const inclusive = q.options.filter((o) => !o.exclusive).map((o) => o.v)
  return inclusive.length ? inclusive : [q.options[0].v]
}

export const GENERATED = {
  allFirst: generate(first),
  allLast: generate(last),
  maxSurface: generate(broad),
}

// --- Von Hand: vier Menschen ------------------------------------------------

/** 68, Ruhestand, Passwörter im Kopf, SMS-TAN. Das Profil mit der größten Lücke. */
const exposed = {
  age: '65plus',
  job: 'retired',
  techlevel: 1,
  household: ['partner'],
  public_role: ['none'],
  phone_os: 'android',
  phone_age: 'o4',
  computer_os: 'windows',
  windows_version: 'win10',
  device_count: '1-3',
  updates: 'rarely',
  screenlock: 'pin-only',
  disk_encryption: 'unknown',
  antivirus: 'paid',
  admin_account: 'admin',
  old_devices: 'yes-online',
  password_manager: 'memory',
  password_reuse: 'mostly',
  password_strength: 'simple',
  mfa_usage: 'forced',
  mfa_type: ['sms'],
  email_provider: 'de-freemail',
  email_separation: 'one',
  breach_check: 'never',
  known_breach: 'unknown',
  recovery_setup: ['nothing'],
  account_count: '20-50',
  old_accounts: 'many',
  online_banking: 'browser',
  banking_tan: 'sms',
  payment_services: ['paypal', 'card-stored'],
  crypto: 'none',
  broker: 'small',
  financial_exposure: '10-100k',
  homeoffice: 'na',
  travel: 'few',
  public_wifi: 'regularly',
  vpn: 'none',
  social_media: ['facebook'],
  social_visibility: 'public-name',
  oversharing: ['birthday', 'address', 'family'],
  link_behavior: 'plausible',
  unknown_calls: 'answer',
  downloads: 'anywhere',
  gaming: 'none',
  ai_tools: 'never',
  router: 'default',
  router_updates: 'never',
  wifi_sharing: 'shared',
  smart_home: ['speaker', 'tv'],
  nas: 'none',
  port_forwarding: 'unknown',
  backup: 'none',
  cloud_storage: ['none'],
  sensitive_docs: ['id-scan', 'banking-docs', 'passwords-note'],
  photos_value: 'catastrophic',
  digital_legacy: 'no',
  past_incident: ['phishing', 'card-fraud'],
  worry: ['money', 'dataloss'],
}

/** IT-Beruf, macht praktisch alles richtig. Prüft, dass der Plan dann kurz wird. */
const hardened = {
  age: '30-49',
  job: 'it',
  techlevel: 5,
  household: ['partner'],
  public_role: ['none'],
  phone_os: 'ios',
  phone_age: 'u2',
  computer_os: 'mac',
  device_count: '4-6',
  updates: 'auto',
  screenlock: 'bio-long',
  disk_encryption: 'yes',
  antivirus: 'builtin',
  admin_account: 'standard',
  old_devices: 'no',
  password_manager: 'dedicated',
  password_reuse: 'never',
  password_strength: 'random',
  mfa_usage: 'everywhere',
  mfa_type: ['passkey', 'hardware', 'totp'],
  email_provider: 'own-domain',
  email_separation: 'aliases',
  breach_check: 'recent',
  known_breach: 'yes-changed',
  recovery_setup: ['codes', 'second-device', 'second-email'],
  account_count: '100plus',
  old_accounts: 'no',
  online_banking: 'app',
  banking_tan: 'other-device',
  payment_services: ['paypal'],
  crypto: 'hardware',
  crypto_seed: 'steel',
  broker: 'small',
  financial_exposure: '10-100k',
  homeoffice: 'remote',
  work_mixing: 'strict',
  work_sensitivity: 'internal',
  travel: 'monthly',
  public_wifi: 'rarely',
  vpn: 'always',
  social_media: ['linkedin'],
  social_visibility: 'semi',
  oversharing: ['nothing'],
  link_behavior: 'inspect',
  unknown_calls: 'never',
  downloads: 'stores',
  gaming: 'pc',
  gaming_platforms: ['steam', 'discord'],
  gaming_trade: 'no',
  ai_tools: 'careful',
  router: 'own',
  router_updates: 'auto',
  wifi_sharing: 'guests',
  smart_home: ['none'],
  nas: 'local',
  port_forwarding: 'no',
  backup: '321',
  backup_tested: 'yes',
  cloud_storage: ['icloud'],
  sensitive_docs: ['nothing'],
  photos_value: 'bad',
  digital_legacy: 'yes',
  past_incident: ['none'],
  worry: ['privacy'],
}

/** Familie mit Schulkind, Smart Home, Banking-App und TAN auf demselben Gerät. */
const family = {
  age: '30-49',
  job: 'office',
  techlevel: 3,
  household: ['partner', 'kids'],
  kids_age: ['6-12'],
  kids_devices: 'own-unmanaged',
  public_role: ['none'],
  phone_os: 'both',
  phone_age: '2-4',
  computer_os: 'windows',
  windows_version: 'win11',
  device_count: '7-12',
  updates: 'weeks',
  screenlock: 'bio-4',
  disk_encryption: 'unknown',
  antivirus: 'free-third',
  admin_account: 'admin',
  old_devices: 'yes-offline',
  password_manager: 'browser',
  password_reuse: 'few',
  password_strength: 'mixed',
  mfa_usage: 'important',
  mfa_type: ['push', 'sms'],
  email_provider: 'gmail',
  email_separation: 'two-three',
  breach_check: 'long-ago',
  known_breach: 'yes-nothing',
  recovery_setup: ['phone', 'second-email'],
  account_count: '50-100',
  old_accounts: 'some',
  online_banking: 'app',
  banking_tan: 'same-device',
  payment_services: ['paypal', 'klarna', 'amazon', 'card-stored'],
  crypto: 'none',
  broker: 'no',
  financial_exposure: '1-10k',
  homeoffice: 'hybrid',
  work_mixing: 'both',
  work_sensitivity: 'personal',
  travel: 'few',
  public_wifi: 'rarely',
  vpn: 'none',
  social_media: ['instagram', 'facebook'],
  social_visibility: 'semi',
  oversharing: ['birthday', 'family', 'kids-photos', 'travel-live'],
  link_behavior: 'app-check',
  unknown_calls: 'callback',
  downloads: 'official-sites',
  gaming: 'console',
  gaming_platforms: ['psn-xbox', 'roblox'],
  gaming_trade: 'no',
  ai_tools: 'sometimes',
  router: 'changed',
  router_updates: 'manual',
  wifi_sharing: 'guests-main',
  smart_home: ['speaker', 'cam-in', 'tv', 'vacuum'],
  nas: 'none',
  port_forwarding: 'unknown',
  backup: 'cloud',
  backup_tested: 'never-thought',
  cloud_storage: ['google', 'icloud'],
  sensitive_docs: ['id-scan', 'contracts', 'health'],
  photos_value: 'catastrophic',
  digital_legacy: 'no',
  past_incident: ['card-fraud'],
  worry: ['kids', 'money', 'dataloss'],
}

/** Öffentlich sichtbar, Krypto, Seed in der Cloud. Das Profil mit dem größten Zielwert. */
const visible = {
  age: '18-29',
  job: 'creator',
  techlevel: 4,
  household: ['alone'],
  public_role: ['creator', 'wealth'],
  phone_os: 'ios',
  phone_age: 'u2',
  computer_os: 'mac',
  device_count: '4-6',
  updates: 'days',
  screenlock: 'bio-long',
  disk_encryption: 'yes',
  antivirus: 'builtin',
  admin_account: 'admin',
  old_devices: 'no',
  password_manager: 'ecosystem',
  password_reuse: 'few',
  password_strength: 'mixed',
  mfa_usage: 'important',
  mfa_type: ['totp', 'sms'],
  email_provider: 'gmail',
  email_separation: 'two-three',
  breach_check: 'heard',
  known_breach: 'no',
  recovery_setup: ['phone'],
  account_count: '100plus',
  old_accounts: 'some',
  online_banking: 'app',
  banking_tan: 'same-device',
  payment_services: ['paypal', 'wallet', 'card-stored'],
  crypto: 'significant',
  crypto_seed: 'cloud',
  broker: 'significant',
  financial_exposure: 'o100k',
  homeoffice: 'remote',
  work_mixing: 'both',
  work_sensitivity: 'none',
  travel: 'monthly',
  public_wifi: 'regularly',
  vpn: 'sometimes',
  social_media: ['instagram', 'tiktok', 'x', 'youtube'],
  social_visibility: 'public-reach',
  oversharing: ['birthday', 'employer', 'travel-live', 'pets'],
  link_behavior: 'plausible',
  unknown_calls: 'answer',
  downloads: 'anywhere',
  gaming: 'mobile',
  gaming_platforms: ['mobile'],
  ai_tools: 'often',
  router: 'changed',
  router_updates: 'never',
  wifi_sharing: 'household',
  smart_home: ['speaker', 'cam-in', 'lights'],
  nas: 'none',
  port_forwarding: 'no',
  backup: 'manual',
  backup_tested: 'no',
  cloud_storage: ['icloud', 'dropbox'],
  sensitive_docs: ['id-scan', 'contracts', 'intimate'],
  photos_value: 'catastrophic',
  digital_legacy: 'no',
  past_incident: ['account-hacked', 'harassment'],
  worry: ['reputation', 'money', 'privacy'],
}

export const PERSONAS = { exposed, hardened, family, visible }

/**
 * Der Weg von `exposed` durch das Kurz-Audit — Schritt für Schritt, damit
 * `showIf` denselben Stand sieht wie im echten Fragebogen (eine Folgefrage,
 * deren Auslöser nicht zum Kurz-Audit gehört, taucht hier also nicht auf).
 */
export const quickOnly = (() => {
  const answers = {}
  for (const q of QUESTIONS) {
    if (!q.core) continue
    if (q.showIf && !q.showIf(answers)) continue
    if (exposed[q.id] !== undefined) answers[q.id] = exposed[q.id]
  }
  return answers
})()

/** Alles zusammen — inklusive des leeren Stands, den die Startseite erzeugt. */
export const ALL_PROFILES = {
  empty: {},
  quickOnly,
  ...GENERATED,
  ...PERSONAS,
}

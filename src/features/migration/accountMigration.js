// Migração dos dados locais para a conta no login (KD-37, ARQUITETURA §5.1). Etapas idempotentes e
// marcadas por usuário em `kd:v1:migration`: uma rodada interrompida retoma só o que faltou.
import { loadCosmeticsService } from '../../services/cosmeticsLoader.js'
import { loadScoreService } from '../../services/scoreLoader.js'
import { FAILURE_KINDS } from '../../services/scoreFailure.js'
import { OUTBOX_KEY, backoffDelay } from '../../services/scoreOutbox.js'
import { loadSettingsService } from '../../services/settingsLoader.js'
import { storage } from '../../services/storage.js'
import { mergeUnlockedCosmetics } from '../cosmetics/cosmeticsStore.js'
import { pullAccountCosmetics, pushEquipped } from '../cosmetics/cosmeticsSync.js'
import { loadProgress, removePending } from '../progress/progressStore.js'
import { pullAccountSettings } from '../settings/settingsSync.js'

export const MIGRATION_KEY = 'migration'
export const MIGRATION_VERSION = 1
// Limite do submit_score (KD-31): 10 envios por 60 s por usuário
export const BATCH_SIZE = 10
export const WINDOW_MS = 60 * 1000
export const MAX_RETRIES = 3

const STEPS = ['scores', 'cosmetics', 'settings']

function emptyMarker() {
  return { version: MIGRATION_VERSION, steps: {}, sent: 0, discarded: 0 }
}

function readAll(store) {
  const raw = store.get(MIGRATION_KEY, {})
  return typeof raw === 'object' && raw !== null ? raw : {}
}

function readMarker(userId, store) {
  const marker = readAll(store)[userId]
  return marker?.version === MIGRATION_VERSION && typeof marker.steps === 'object' ? marker : emptyMarker()
}

function writeMarker(userId, marker, store) {
  store.set(MIGRATION_KEY, { ...readAll(store), [userId]: marker })
}

export function isMigrationDone(userId, store = storage) {
  const { steps } = readMarker(userId, store)
  return STEPS.every((step) => steps[step] === true)
}

// Partidas da outbox já pertencem a uma conta (KD-35); o resto do pending foi jogado como visitante
export function listGuestEntries(store = storage) {
  const outbox = store.get(OUTBOX_KEY, null)
  const owned = new Set(Array.isArray(outbox?.items) ? outbox.items.map((item) => item.matchId) : [])
  return loadProgress(store).pending.filter((entry) => !owned.has(entry.matchId))
}

async function submitWithRetry(service, entry, deps) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return { kind: 'sent', result: await service.submitScore(entry, { origin: 'local' }) }
    } catch (error) {
      const kind = error?.kind ?? FAILURE_KINDS.RETRY
      if (kind !== FAILURE_KINDS.RETRY || attempt >= deps.maxRetries) return { kind }
      await deps.sleep(backoffDelay(attempt, deps.rng, { baseDelayMs: WINDOW_MS / BATCH_SIZE }))
    }
  }
}

async function migrateScores(marker, deps) {
  const service = await deps.loadScoreService()
  if (!service) return false
  const entries = listGuestEntries(deps.store)
  const total = entries.length
  let calls = 0
  let done = 0
  deps.onProgress({ phase: 'scores', done, total })

  for (const entry of entries) {
    // Espaça os lotes para não cair no 54000 (cada chamada conta na janela do servidor)
    if (calls > 0 && calls % BATCH_SIZE === 0) await deps.sleep(WINDOW_MS)
    calls += 1
    const outcome = await submitWithRetry(service, entry, deps)
    if (outcome.kind === 'sent') {
      mergeUnlockedCosmetics(outcome.result?.unlockedCosmetics, deps.store)
      marker.sent += 1
    } else if (outcome.kind === FAILURE_KINDS.DISCARD) {
      marker.discarded += 1
    } else {
      return false
    }
    // Sai do local logo após a resposta definitiva: uma rodada interrompida não reenvia
    removePending([entry.matchId], deps.store)
    done += 1
    deps.onProgress({ phase: 'scores', done, total })
  }
  return true
}

async function migrateCosmetics(user, deps) {
  const state = await deps.pullCosmetics(user.id)
  if (!state) return false
  return deps.pushEquipped(user)
}

function migrateSettings(user, deps) {
  return pullAccountSettings(user.id, { loadService: deps.loadSettingsService, store: deps.store })
}

function defaults(overrides) {
  const store = overrides.store ?? storage
  const cosmetics = { store, loadService: overrides.loadCosmeticsService ?? loadCosmeticsService }
  return {
    store,
    loadScoreService,
    loadSettingsService,
    pullCosmetics: (userId) => pullAccountCosmetics(userId, cosmetics),
    pushEquipped: (user) => pushEquipped(user, cosmetics),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    rng: Math.random,
    maxRetries: MAX_RETRIES,
    onProgress: () => {},
    ...overrides,
  }
}

/**
 * Executa (ou retoma) a migração de um usuário neste dispositivo.
 * @returns {Promise<{ status: 'done'|'partial'|'skipped', sent: number, discarded: number }>}
 */
export async function runAccountMigration(user, overrides = {}) {
  const deps = defaults(overrides)
  if (!user?.id) return { status: 'skipped', sent: 0, discarded: 0 }
  const marker = readMarker(user.id, deps.store)
  const summary = () => ({ sent: marker.sent, discarded: marker.discarded })
  if (isMigrationDone(user.id, deps.store)) return { status: 'skipped', ...summary() }

  const runners = {
    scores: () => migrateScores(marker, deps),
    cosmetics: () => migrateCosmetics(user, deps),
    settings: () => migrateSettings(user, deps),
  }
  for (const step of STEPS) {
    if (marker.steps[step]) continue
    const ok = await runners[step]()
    writeMarker(user.id, marker, deps.store)
    // Cosméticos dependem das partidas (o servidor libera itens ao revalidá-las): para na primeira falha
    if (!ok) return { status: 'partial', ...summary() }
    marker.steps[step] = true
    writeMarker(user.id, marker, deps.store)
  }
  return { status: 'done', ...summary() }
}

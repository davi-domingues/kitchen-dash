// Outbox de pontuação (SYSTEM_DESIGN §7.1). O payload mora em `kd:v1:progress.pending` (KD-22);
// aqui fica só o controle de reenvio por partida, em `kd:v1:outbox`.
import { FAILURE_KINDS } from './scoreFailure.js'

export const OUTBOX_KEY = 'outbox'
export const MAX_ATTEMPTS = 8
// rejected: a RPC recusou (permanente); expired: esgotou as tentativas transitórias
export const DISCARD_REASONS = Object.freeze({ REJECTED: 'rejected', EXPIRED: 'expired' })
export const BASE_DELAY_MS = 2000
export const MAX_DELAY_MS = 5 * 60 * 1000

// Equal jitter: metade fixa evita reenvio imediato, metade aleatória espalha clientes que caíram juntos
export function backoffDelay(attempts, rng, { baseDelayMs = BASE_DELAY_MS, maxDelayMs = MAX_DELAY_MS } = {}) {
  const exp = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempts - 1))
  return Math.round(exp * (0.5 + 0.5 * rng()))
}

function isItem(item) {
  return (
    typeof item?.matchId === 'string' &&
    typeof item.userId === 'string' &&
    Number.isInteger(item.attempts) &&
    Number.isFinite(item.nextAt)
  )
}

/**
 * @param {object} deps
 * @param {{ get: Function, set: Function }} deps.store storage versionado
 * @param {() => Promise<{ submitScore: Function } | null>} deps.loadService
 * @param {() => object[]} deps.listPending pendentes da KD-22
 * @param {(matchIds: string[]) => void} deps.removePending
 * @param {(entry: object, result: object) => void} [deps.onSubmitted] recebe o retorno do submit_score
 * @param {(entry: object, info: { reason: string, attempts: number }) => void} [deps.onDiscarded]
 *   partida que saiu da fila sem ser aceita (#71)
 */
export function createScoreOutbox({
  store,
  loadService,
  listPending,
  removePending,
  onSubmitted = () => {},
  onDiscarded = () => {},
  now = () => Date.now(),
  rng = Math.random,
  setTimer = (fn, ms) => setTimeout(fn, ms),
  clearTimer = (id) => clearTimeout(id),
  maxAttempts = MAX_ATTEMPTS,
  baseDelayMs = BASE_DELAY_MS,
  maxDelayMs = MAX_DELAY_MS,
}) {
  let running = null
  let timer = null
  let currentUser = null

  const read = () => {
    const raw = store.get(OUTBOX_KEY, null)
    return Array.isArray(raw?.items) ? raw.items.filter(isItem) : []
  }
  const write = (items) => store.set(OUTBOX_KEY, { items })

  function enqueue(matchId, userId) {
    const items = read()
    if (items.some((item) => item.matchId === matchId)) return
    write([...items, { matchId, userId, attempts: 0, nextAt: now() }])
  }

  function schedule(items) {
    if (timer !== null) clearTimer(timer)
    timer = null
    const mine = items.filter((item) => item.userId === currentUser)
    if (!mine.length) return
    const wait = Math.max(0, Math.min(...mine.map((item) => item.nextAt)) - now())
    timer = setTimer(() => {
      timer = null
      flush(currentUser)
    }, wait)
  }

  async function run(userId) {
    const summary = { sent: 0, discarded: 0, retrying: 0 }
    const pending = new Map(listPending().map((entry) => [entry.matchId, entry]))
    // Pendente que saiu da KD-22 (limite de 50 ou "apagar progresso") não tem mais o que enviar
    let items = read().filter((item) => pending.has(item.matchId))
    const service = await loadService()
    if (!service) {
      write(items)
      return summary
    }

    const done = []
    for (const item of items) {
      if (item.userId !== userId || item.nextAt > now()) continue
      try {
        const entry = pending.get(item.matchId)
        const result = await service.submitScore(entry, { origin: 'online' })
        onSubmitted(entry, result)
        done.push(item.matchId)
        summary.sent += 1
      } catch (error) {
        const kind = error?.kind ?? FAILURE_KINDS.RETRY
        if (kind === FAILURE_KINDS.AUTH) break
        const attempts = item.attempts + 1
        if (kind === FAILURE_KINDS.DISCARD || attempts >= maxAttempts) {
          done.push(item.matchId)
          summary.discarded += 1
          const reason = kind === FAILURE_KINDS.DISCARD ? DISCARD_REASONS.REJECTED : DISCARD_REASONS.EXPIRED
          onDiscarded(pending.get(item.matchId), { reason, attempts })
        } else {
          item.attempts = attempts
          item.nextAt = now() + backoffDelay(attempts, rng, { baseDelayMs, maxDelayMs })
          summary.retrying += 1
        }
      }
    }

    // Relê a fila: um enqueue feito durante o envio não pode ser sobrescrito
    const updated = new Map(items.map((item) => [item.matchId, item]))
    const stillPending = new Set(listPending().map((e) => e.matchId))
    items = read()
      .filter((item) => stillPending.has(item.matchId) && !done.includes(item.matchId))
      .map((item) => updated.get(item.matchId) ?? item)
    write(items)
    if (done.length) removePending(done)
    schedule(items)
    return summary
  }

  // Uma rodada por vez: login, fim de partida e evento online podem disparar juntos
  function flush(userId) {
    currentUser = userId ?? null
    if (!currentUser) {
      schedule([])
      return Promise.resolve({ sent: 0, discarded: 0, retrying: 0 })
    }
    if (!running) {
      running = run(currentUser).finally(() => {
        running = null
      })
    }
    return running
  }

  function dispose() {
    currentUser = null
    schedule([])
  }

  return { enqueue, flush, dispose, items: read }
}

// Reenvio do equipado para a conta (débito #74). O equipado é estado, não evento: a fila guarda só
// uma pendência por vez e o envio lê o equipado local do momento, então a última escolha vence.
import { BASE_DELAY_MS, MAX_ATTEMPTS, MAX_DELAY_MS, backoffDelay } from './scoreOutbox.js'

export const EQUIPPED_OUTBOX_KEY = 'equippedOutbox'

function isPendingItem(item) {
  return (
    typeof item?.userId === 'string' &&
    Number.isInteger(item.rev) &&
    Number.isInteger(item.attempts) &&
    Number.isFinite(item.nextAt)
  )
}

/**
 * @param {object} deps
 * @param {{ get: Function, set: Function, remove: Function }} deps.store storage versionado
 * @param {(userId: string) => Promise<boolean>} deps.send grava o equipado local; true = gravou
 */
export function createEquippedOutbox({
  store,
  send,
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

  const read = () => {
    const item = store.get(EQUIPPED_OUTBOX_KEY, null)
    return isPendingItem(item) ? item : null
  }
  const write = (item) => (item ? store.set(EQUIPPED_OUTBOX_KEY, item) : store.remove(EQUIPPED_OUTBOX_KEY))

  function cancelTimer() {
    if (timer !== null) clearTimer(timer)
    timer = null
  }

  function schedule(userId) {
    cancelTimer()
    const item = read()
    if (!item || item.userId !== userId) return
    timer = setTimer(
      () => {
        timer = null
        return flush(userId)
      },
      Math.max(0, item.nextAt - now()),
    )
  }

  async function run(userId) {
    const item = read()
    if (!item || item.userId !== userId || item.nextAt > now()) return schedule(userId)
    const ok = await send(userId)
    // Uma troca feita durante o envio recria a pendência: só a apaga se ainda for a mesma
    const current = read()
    const unchanged = current?.rev === item.rev
    if (ok) {
      if (unchanged) write(null)
    } else if (unchanged) {
      const attempts = item.attempts + 1
      write(
        attempts >= maxAttempts
          ? null
          : { ...item, attempts, nextAt: now() + backoffDelay(attempts, rng, { baseDelayMs, maxDelayMs }) },
      )
    }
    schedule(userId)
  }

  // Uma rodada por vez: equipar, login e volta da rede podem disparar juntos
  function flush(userId) {
    if (!userId) {
      cancelTimer()
      return Promise.resolve()
    }
    if (!running) running = run(userId).finally(() => (running = null))
    return running
  }

  /** Registra a pendência (substitui a anterior) e tenta enviar na hora. */
  function request(userId) {
    write({ userId, attempts: 0, nextAt: now(), rev: (read()?.rev ?? 0) + 1 })
    // Com um envio em andamento, espera ele terminar: ele pode ter lido o equipado anterior
    return running ? running.then(() => flush(userId)) : flush(userId)
  }

  return { request, flush, dispose: cancelTimer, isPending: (userId) => read()?.userId === userId }
}

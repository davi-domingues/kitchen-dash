import { describe, expect, it, vi } from 'vitest'
import { EQUIPPED_OUTBOX_KEY, createEquippedOutbox } from './equippedOutbox.js'
import { BASE_DELAY_MS, MAX_ATTEMPTS } from './scoreOutbox.js'
import { createStorage } from './storage.js'

const USER = 'user-a'

function memoryStore() {
  const map = new Map()
  return createStorage({
    backend: {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
    },
  })
}

// Relógio e timers falsos: `advance` move o tempo e dispara o que venceu
function fakeClock() {
  let time = 1_000_000
  let timers = []
  return {
    now: () => time,
    setTimer: (fn, ms) => {
      const id = Symbol('timer')
      timers.push({ id, at: time + ms, fn })
      return id
    },
    clearTimer: (id) => {
      timers = timers.filter((t) => t.id !== id)
    },
    pending: () => timers.length,
    async advance(ms) {
      time += ms
      const due = timers.filter((t) => t.at <= time)
      timers = timers.filter((t) => t.at > time)
      for (const t of due) await t.fn()
      await Promise.resolve()
    },
  }
}

function setup(results) {
  const store = memoryStore()
  const clock = fakeClock()
  const send = vi.fn(async () => results.shift() ?? true)
  const outbox = createEquippedOutbox({ store, send, rng: () => 0.5, ...clock })
  return { store, clock, send, outbox }
}

describe('createEquippedOutbox', () => {
  it('envio ok na hora não deixa pendência', async () => {
    const { store, send, outbox, clock } = setup([true])

    await outbox.request(USER)

    expect(send).toHaveBeenCalledWith(USER)
    expect(outbox.isPending(USER)).toBe(false)
    expect(store.get(EQUIPPED_OUTBOX_KEY, null)).toBeNull()
    expect(clock.pending()).toBe(0)
  })

  it('falha fica pendente e é reenviada após o backoff', async () => {
    const { send, outbox, clock } = setup([false, true])

    await outbox.request(USER)
    expect(outbox.isPending(USER)).toBe(true)
    // backoffDelay(1) com rng 0.5 = 75% da base
    await clock.advance(BASE_DELAY_MS * 0.75 - 1)
    expect(send).toHaveBeenCalledTimes(1)
    await clock.advance(1)

    expect(send).toHaveBeenCalledTimes(2)
    expect(outbox.isPending(USER)).toBe(false)
  })

  it('a espera cresce a cada falha', async () => {
    const { store, outbox, clock } = setup([false, false])

    await outbox.request(USER)
    const first = store.get(EQUIPPED_OUTBOX_KEY).nextAt - clock.now()
    await clock.advance(first)
    const second = store.get(EQUIPPED_OUTBOX_KEY).nextAt - clock.now()

    expect(second).toBe(first * 2)
  })

  it(`desiste após ${MAX_ATTEMPTS} tentativas`, async () => {
    const { send, outbox, clock } = setup(Array(MAX_ATTEMPTS + 1).fill(false))

    await outbox.request(USER)
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) await clock.advance(10 * 60 * 1000)

    expect(send).toHaveBeenCalledTimes(MAX_ATTEMPTS)
    expect(outbox.isPending(USER)).toBe(false)
    expect(clock.pending()).toBe(0)
  })

  it('pendência persiste e outra instância a envia (recarga da página)', async () => {
    const { store, outbox, clock } = setup([false])
    await outbox.request(USER)
    outbox.dispose()

    const send = vi.fn(async () => true)
    const reloaded = createEquippedOutbox({ store, send, rng: () => 0.5, ...clock })
    await clock.advance(BASE_DELAY_MS)
    await reloaded.flush(USER)

    expect(send).toHaveBeenCalledWith(USER)
    expect(reloaded.isPending(USER)).toBe(false)
  })

  it('não envia a pendência de outro usuário', async () => {
    const { send, outbox } = setup([false])
    await outbox.request(USER)

    await outbox.flush('user-b')

    expect(send).toHaveBeenCalledTimes(1)
    expect(outbox.isPending(USER)).toBe(true)
  })

  it('troca feita durante um envio que falhou continua pendente e sem espera', async () => {
    const store = memoryStore()
    const clock = fakeClock()
    let release
    const send = vi
      .fn()
      .mockImplementationOnce(() => new Promise((resolve) => (release = () => resolve(false))))
      .mockResolvedValue(true)
    const outbox = createEquippedOutbox({ store, send, rng: () => 0.5, ...clock })

    const first = outbox.request(USER)
    const second = outbox.request(USER)
    release()
    await first
    await second

    expect(send).toHaveBeenCalledTimes(2)
    expect(outbox.isPending(USER)).toBe(false)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { FAILURE_KINDS, ScoreFailure } from './scoreFailure.js'
import { DISCARD_REASONS, MAX_ATTEMPTS, backoffDelay, createScoreOutbox } from './scoreOutbox.js'
import { createStorage } from './storage.js'

const USER = 'user-a'
const MATCH = '00000000-0000-4000-8000-000000000001'
const entry = (matchId = MATCH) => ({ matchId, mode: 'classic', players: 1, score: 100 })

function memoryBackend() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  }
}

function setup({
  submit = vi.fn().mockResolvedValue({}),
  pending = [entry()],
  service,
  onSubmitted,
  onDiscarded,
} = {}) {
  let clock = 1000
  const timers = []
  let list = [...pending]
  const removePending = vi.fn((ids) => {
    list = list.filter((e) => !ids.includes(e.matchId))
  })
  const outbox = createScoreOutbox({
    store: createStorage({ backend: memoryBackend() }),
    loadService: async () => (service === undefined ? { submitScore: submit } : service),
    listPending: () => list,
    removePending,
    onSubmitted,
    onDiscarded,
    now: () => clock,
    rng: () => 0.5,
    setTimer: (fn, ms) => timers.push({ fn, ms }) - 1,
    clearTimer: vi.fn(),
  })
  return {
    outbox,
    submit,
    removePending,
    timers,
    advance: (ms) => {
      clock += ms
    },
  }
}

describe('backoffDelay', () => {
  it('dobra a espera a cada tentativa com jitter entre 50% e 100%', () => {
    expect(backoffDelay(1, () => 0)).toBe(1000)
    expect(backoffDelay(1, () => 1)).toBe(2000)
    expect(backoffDelay(3, () => 1)).toBe(8000)
  })

  it('respeita o teto de espera', () => {
    expect(backoffDelay(20, () => 1, { maxDelayMs: 300000 })).toBe(300000)
  })
})

describe('createScoreOutbox', () => {
  it('envia a partida como online e remove o pendente aceito', async () => {
    const { outbox, submit, removePending } = setup()
    outbox.enqueue(MATCH, USER)

    const summary = await outbox.flush(USER)

    expect(submit).toHaveBeenCalledWith(entry(), { origin: 'online' })
    expect(removePending).toHaveBeenCalledWith([MATCH])
    expect(summary).toEqual({ sent: 1, discarded: 0, retrying: 0 })
    expect(outbox.items()).toEqual([])
  })

  it('repassa o retorno do envio aceito para onSubmitted', async () => {
    const result = { unlockedCosmetics: ['hat_navy'] }
    const onSubmitted = vi.fn()
    const { outbox } = setup({ submit: vi.fn().mockResolvedValue(result), onSubmitted })
    outbox.enqueue(MATCH, USER)

    await outbox.flush(USER)

    expect(onSubmitted).toHaveBeenCalledWith(entry(), result)
  })

  it('não duplica a mesma partida na fila', () => {
    const { outbox } = setup()
    outbox.enqueue(MATCH, USER)
    outbox.enqueue(MATCH, USER)

    expect(outbox.items()).toHaveLength(1)
  })

  it('nunca envia partida de outro usuário', async () => {
    const { outbox, submit } = setup()
    outbox.enqueue(MATCH, USER)

    await outbox.flush('user-b')

    expect(submit).not.toHaveBeenCalled()
    expect(outbox.items()).toHaveLength(1)
  })

  it('sem usuário não envia nada', async () => {
    const { outbox, submit } = setup()
    outbox.enqueue(MATCH, USER)

    await outbox.flush(null)

    expect(submit).not.toHaveBeenCalled()
  })

  it('tira da fila a partida que saiu dos pendentes', async () => {
    const { outbox, submit } = setup({ pending: [] })
    outbox.enqueue(MATCH, USER)

    await outbox.flush(USER)

    expect(submit).not.toHaveBeenCalled()
    expect(outbox.items()).toEqual([])
  })

  it('não roda dois envios em paralelo', async () => {
    const { outbox, submit } = setup()
    outbox.enqueue(MATCH, USER)

    await Promise.all([outbox.flush(USER), outbox.flush(USER)])

    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('sem backend mantém a fila', async () => {
    const { outbox } = setup({ service: null })
    outbox.enqueue(MATCH, USER)

    await outbox.flush(USER)

    expect(outbox.items()).toHaveLength(1)
  })

  it('falha transitória reagenda com backoff e reenvia no timer', async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new ScoreFailure(FAILURE_KINDS.RETRY))
      .mockResolvedValueOnce({})
    const { outbox, timers, advance, removePending } = setup({ submit })
    outbox.enqueue(MATCH, USER)

    const first = await outbox.flush(USER)
    expect(first.retrying).toBe(1)
    expect(outbox.items()[0]).toMatchObject({ attempts: 1, nextAt: 1000 + 1500 })
    expect(timers.at(-1).ms).toBe(1500)

    advance(1500)
    timers.at(-1).fn()
    await outbox.flush(USER)

    expect(submit).toHaveBeenCalledTimes(2)
    expect(removePending).toHaveBeenCalledWith([MATCH])
  })

  it('não reenvia antes do horário agendado', async () => {
    const submit = vi.fn().mockRejectedValue(new ScoreFailure(FAILURE_KINDS.RETRY))
    const { outbox } = setup({ submit })
    outbox.enqueue(MATCH, USER)
    await outbox.flush(USER)

    await outbox.flush(USER)

    expect(submit).toHaveBeenCalledTimes(1)
  })

  it(`descarta depois de ${MAX_ATTEMPTS} tentativas`, async () => {
    const submit = vi.fn().mockRejectedValue(new Error('offline'))
    const { outbox, advance, removePending } = setup({ submit })
    outbox.enqueue(MATCH, USER)

    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      await outbox.flush(USER)
      advance(10 * 60 * 1000)
    }

    expect(submit).toHaveBeenCalledTimes(MAX_ATTEMPTS)
    expect(removePending).toHaveBeenCalledWith([MATCH])
    expect(outbox.items()).toEqual([])
  })

  it('erro permanente descarta na primeira tentativa', async () => {
    const submit = vi.fn().mockRejectedValue(new ScoreFailure(FAILURE_KINDS.DISCARD))
    const { outbox, removePending } = setup({ submit })
    outbox.enqueue(MATCH, USER)

    const summary = await outbox.flush(USER)

    expect(summary.discarded).toBe(1)
    expect(removePending).toHaveBeenCalledWith([MATCH])
  })

  it('avisa o descarte por rejeição com a partida e as tentativas', async () => {
    const onDiscarded = vi.fn()
    const submit = vi.fn().mockRejectedValue(new ScoreFailure(FAILURE_KINDS.DISCARD))
    const { outbox } = setup({ submit, onDiscarded })
    outbox.enqueue(MATCH, USER)

    await outbox.flush(USER)

    expect(onDiscarded).toHaveBeenCalledWith(entry(), { reason: DISCARD_REASONS.REJECTED, attempts: 1 })
  })

  it('avisa o descarte por tentativas esgotadas uma única vez', async () => {
    const onDiscarded = vi.fn()
    const submit = vi.fn().mockRejectedValue(new Error('offline'))
    const { outbox, advance } = setup({ submit, onDiscarded })
    outbox.enqueue(MATCH, USER)

    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      await outbox.flush(USER)
      advance(10 * 60 * 1000)
    }

    expect(onDiscarded).toHaveBeenCalledTimes(1)
    expect(onDiscarded).toHaveBeenCalledWith(entry(), {
      reason: DISCARD_REASONS.EXPIRED,
      attempts: MAX_ATTEMPTS,
    })
  })

  it('não avisa descarte em falha transitória', async () => {
    const onDiscarded = vi.fn()
    const { outbox } = setup({ submit: vi.fn().mockRejectedValue(new Error('offline')), onDiscarded })
    outbox.enqueue(MATCH, USER)

    await outbox.flush(USER)

    expect(onDiscarded).not.toHaveBeenCalled()
  })

  it('sem sessão para o envio e mantém a partida', async () => {
    const submit = vi.fn().mockRejectedValue(new ScoreFailure(FAILURE_KINDS.AUTH))
    const { outbox, removePending } = setup({ submit, pending: [entry(), entry('m2')] })
    outbox.enqueue(MATCH, USER)
    outbox.enqueue('m2', USER)

    await outbox.flush(USER)

    expect(submit).toHaveBeenCalledTimes(1)
    expect(removePending).not.toHaveBeenCalled()
    expect(outbox.items()).toHaveLength(2)
    expect(outbox.items()[0].attempts).toBe(0)
  })

  it('preserva partida enfileirada durante um envio', async () => {
    let release
    const submit = vi.fn(() => new Promise((resolve) => (release = resolve)))
    const { outbox } = setup({ submit, pending: [entry(), entry('m2')] })
    outbox.enqueue(MATCH, USER)

    const running = outbox.flush(USER)
    await vi.waitFor(() => expect(submit).toHaveBeenCalled())
    outbox.enqueue('m2', USER)
    release({})
    await running

    expect(outbox.items().map((i) => i.matchId)).toEqual(['m2'])
  })

  it('dispose cancela o timer agendado', async () => {
    const submit = vi.fn().mockRejectedValue(new ScoreFailure(FAILURE_KINDS.RETRY))
    const { outbox, timers } = setup({ submit })
    outbox.enqueue(MATCH, USER)
    await outbox.flush(USER)

    outbox.dispose()
    timers.at(-1).fn()

    expect(submit).toHaveBeenCalledTimes(1)
  })
})

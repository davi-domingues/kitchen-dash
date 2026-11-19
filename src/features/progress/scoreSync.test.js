import { describe, expect, it, vi } from 'vitest'
import { createStorage } from '../../services/storage.js'
import { loadCosmetics } from '../cosmetics/cosmeticsStore.js'
import { recordMatchResult, loadProgress } from './progressStore.js'
import { createAppOutbox, submitMatch } from './scoreSync.js'

const RESULT = {
  matchId: '00000000-0000-4000-8000-000000000001',
  mode: 'classic',
  players: 1,
  seed: 7,
  contentVersion: '7691008a',
  score: 200,
  ordersCompleted: 2,
  ordersFailed: 0,
  durationMs: 180000,
}
const USER = { id: 'user-a', email: 'chef@example.com' }

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

describe('submitMatch', () => {
  it('envia a partida do jogador conectado e limpa o pendente local', async () => {
    const store = memoryStore()
    recordMatchResult(RESULT, { store, now: new Date('2026-11-18T12:00:00Z') })
    const submitScore = vi.fn().mockResolvedValue({})
    const outbox = createAppOutbox({ store, loadService: async () => ({ submitScore }) })

    await submitMatch(outbox, RESULT.matchId, USER)

    expect(submitScore).toHaveBeenCalledWith(expect.objectContaining({ matchId: RESULT.matchId }), {
      origin: 'online',
    })
    expect(loadProgress(store).pending).toEqual([])
    expect(loadProgress(store).board).toHaveLength(1)
  })

  it('aplica nos cosméticos locais o que o servidor liberou', async () => {
    const store = memoryStore()
    recordMatchResult(RESULT, { store, now: new Date('2026-11-18T12:00:00Z') })
    const submitScore = vi.fn().mockResolvedValue({ unlockedCosmetics: ['hat_navy'] })
    const outbox = createAppOutbox({ store, loadService: async () => ({ submitScore }) })

    await submitMatch(outbox, RESULT.matchId, USER)

    expect(loadCosmetics(store).unlocked).toContain('hat_navy')
  })

  it('visitante não enfileira nem envia', async () => {
    const store = memoryStore()
    recordMatchResult(RESULT, { store, now: new Date('2026-11-18T12:00:00Z') })
    const submitScore = vi.fn()
    const outbox = createAppOutbox({ store, loadService: async () => ({ submitScore }) })

    await submitMatch(outbox, RESULT.matchId, null)

    expect(submitScore).not.toHaveBeenCalled()
    expect(outbox.items()).toEqual([])
    expect(loadProgress(store).pending).toHaveLength(1)
  })
})

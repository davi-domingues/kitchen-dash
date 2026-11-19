import { describe, expect, it } from 'vitest'
import { createStorage } from '../../services/storage.js'
import { clearProgress, loadProgress, recordMatchResult, removePending } from './progressStore.js'

function memoryBackend() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    map,
  }
}

const NOW = new Date('2026-11-18T12:00:00.000Z')
const result = (matchId, score) => ({
  matchId,
  mode: 'classic',
  players: 1,
  seed: 1,
  contentVersion: 'v-test',
  score,
  ordersCompleted: 1,
  ordersFailed: 0,
  durationMs: 1000,
})
const ID_A = '00000000-0000-4000-8000-00000000000a'
const ID_B = '00000000-0000-4000-8000-00000000000b'

describe('progressStore', () => {
  it('sem nada salvo devolve progresso vazio', () => {
    expect(loadProgress(createStorage({ backend: memoryBackend() })).board).toEqual([])
  })

  it('grava em kd:v1:progress e sobrevive a um novo storage no mesmo backend', () => {
    const backend = memoryBackend()

    const out = recordMatchResult(result(ID_A, 50), { store: createStorage({ backend }), now: NOW })

    expect(out.isNewRecord).toBe(true)
    expect(backend.map.has('kd:v1:progress')).toBe(true)
    expect(loadProgress(createStorage({ backend })).board[0].matchId).toBe(ID_A)
  })

  it('dado corrompido não quebra a leitura', () => {
    const backend = memoryBackend()
    backend.setItem('kd:v1:progress', '{quebrado')

    expect(loadProgress(createStorage({ backend })).stats.matchesPlayed).toBe(0)
  })

  it('removePending e clearProgress', () => {
    const store = createStorage({ backend: memoryBackend() })
    recordMatchResult(result(ID_A, 1), { store, now: NOW })
    recordMatchResult(result(ID_B, 2), { store, now: NOW })

    removePending([ID_A], store)
    expect(loadProgress(store).pending.map((e) => e.matchId)).toEqual([ID_B])

    clearProgress(store)
    expect(loadProgress(store).board).toEqual([])
  })
})

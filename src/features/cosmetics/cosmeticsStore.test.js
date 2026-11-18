import { describe, expect, it } from 'vitest'
import { createStorage } from '../../services/storage.js'
import {
  COSMETICS_KEY,
  clearCosmetics,
  equipCosmetic,
  loadCosmeticLook,
  loadCosmetics,
  mergeUnlockedCosmetics,
  recordScore,
} from './cosmeticsStore.js'

function memoryStore() {
  const map = new Map()
  const backend = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  }
  return { store: createStorage({ backend }), map }
}

describe('cosmeticsStore', () => {
  it('grava em kd:v1:cosmetics e lê de volta', () => {
    const { store, map } = memoryStore()

    const { newlyUnlocked } = recordScore(320, store)

    expect(newlyUnlocked).toEqual(['hat_bordeaux', 'apron_herbs'])
    expect(map.has('kd:v1:cosmetics')).toBe(true)
    expect(loadCosmetics(store).bestScore).toBe(320)
  })

  it('a mesma pontuação de novo não avisa de novo', () => {
    const { store } = memoryStore()
    recordScore(320, store)

    expect(recordScore(320, store).newlyUnlocked).toEqual([])
  })

  it('equipa, une itens da conta e devolve as cores', () => {
    const { store } = memoryStore()
    mergeUnlockedCosmetics(['theme_provence'], store)

    equipCosmetic('theme_provence', store)

    expect(loadCosmeticLook(store).theme).toBe('#8a7fc0')
  })

  it('dado corrompido volta ao padrão e apagar limpa a chave', () => {
    const { store, map } = memoryStore()
    store.set(COSMETICS_KEY, { bestScore: 'x', unlocked: 'y' })

    expect(loadCosmetics(store).equipped.hat).toBe('hat_classic')
    clearCosmetics(store)
    expect(map.has('kd:v1:cosmetics')).toBe(false)
  })
})

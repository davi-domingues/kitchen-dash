import { describe, expect, it } from 'vitest'
import { DEFAULT_KEY_BINDINGS, remapKey } from '../game/input/keyBindings.js'
import { loadKeyBindings, saveKeyBindings } from './settings.js'
import { createStorage } from './storage.js'

function memoryStore() {
  const map = new Map()
  const backend = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    removeItem: (k) => map.delete(k),
  }
  return createStorage({ backend })
}

describe('settings: teclas', () => {
  it('sem nada salvo, carrega o padrão', () => {
    expect(loadKeyBindings(memoryStore())).toEqual(DEFAULT_KEY_BINDINGS)
  })

  it('salva e recarrega um remapeamento, preservando outras preferências', () => {
    const store = memoryStore()
    store.set('settings', { reduceEffects: true })
    const remapped = remapKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'action' }, 'KeyL')

    saveKeyBindings(remapped, store)

    expect(loadKeyBindings(store).p1.action).toBe('KeyL')
    expect(store.get('settings').reduceEffects).toBe(true)
  })
})

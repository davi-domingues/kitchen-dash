import { describe, expect, it } from 'vitest'
import { DEFAULT_KEY_BINDINGS, remapKey } from '../game/input/keyBindings.js'
import {
  loadKeyBindings,
  loadReduceEffects,
  loadSettings,
  saveKeyBindings,
  saveReduceEffects,
  saveSettings,
} from './settings.js'
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

describe('settings: efeitos', () => {
  it('usa a preferência do sistema quando não há valor válido salvo', () => {
    const store = memoryStore()
    expect(loadReduceEffects(store)).toBeNull()
    store.set('settings', { reduceEffects: 'true' })
    expect(loadReduceEffects(store)).toBeNull()
  })

  it('salva as duas escolhas sem perder as teclas', () => {
    const store = memoryStore()
    saveKeyBindings(DEFAULT_KEY_BINDINGS, store)
    saveReduceEffects(true, store)
    expect(loadReduceEffects(store)).toBe(true)
    saveReduceEffects(false, store)
    expect(loadReduceEffects(store)).toBe(false)
    expect(loadKeyBindings(store)).toEqual(DEFAULT_KEY_BINDINGS)
  })

  it('mantém a escolha na sessão quando o armazenamento falha', () => {
    const store = createStorage({
      backend: {
        getItem: () => {
          throw new Error('indisponível')
        },
      },
    })
    saveReduceEffects(true, store)
    expect(loadReduceEffects(store)).toBe(true)
    expect(store.isPersistent).toBe(false)
  })
})

describe('settings: objeto completo', () => {
  it('lê vazio quando o valor salvo não é objeto', () => {
    const store = memoryStore()
    store.set('settings', ['x'])

    expect(loadSettings(store)).toEqual({})
  })

  it('grava e relê o objeto inteiro', () => {
    const store = memoryStore()

    saveSettings({ reduceEffects: true }, store)

    expect(loadSettings(store)).toEqual({ reduceEffects: true })
  })
})

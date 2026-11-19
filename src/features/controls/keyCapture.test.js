import { describe, expect, it } from 'vitest'
import { DEFAULT_KEY_BINDINGS } from '../../game/input/keyBindings.js'
import { createInputMap, INPUT_EVENTS } from '../../game/input/inputMap.js'
import { loadKeyBindings, saveKeyBindings } from '../../services/settings.js'
import { createStorage } from '../../services/storage.js'
import { assignKey, isAssignableKey } from './keyCapture.js'

describe('captura de teclas', () => {
  it('aceita teclas de jogo sem interceptar atalhos e navegação', () => {
    expect(isAssignableKey({ code: 'KeyQ' })).toBe(true)
    expect(isAssignableKey({ code: 'ArrowUp' })).toBe(true)
    expect(isAssignableKey({ code: 'Tab' })).toBe(false)
    expect(isAssignableKey({ code: 'Escape' })).toBe(false)
    expect(isAssignableKey({ code: 'KeyQ', ctrlKey: true })).toBe(false)
  })

  it('troca a atribuição existente e identifica a ação afetada', () => {
    const result = assignKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'up' }, 'KeyW')
    expect(result.bindings.p1.up).toBe('KeyW')
    expect(result.bindings.p2.up).toBe('ArrowUp')
    expect(result.swapped).toEqual({ player: 'p2', control: 'up' })
    expect(DEFAULT_KEY_BINDINGS.p1.up).toBe('ArrowUp')
  })

  it('não anuncia troca quando a tecla é livre ou já pertence à ação', () => {
    expect(assignKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'up' }, 'KeyQ').swapped).toBeNull()
    expect(assignKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'up' }, 'ArrowUp').swapped).toBeNull()
  })

  it('usa a tecla alterada na próxima partida após salvar e recarregar', () => {
    const values = new Map()
    const store = createStorage({
      backend: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key),
      },
    })
    const next = assignKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'action' }, 'KeyQ').bindings
    saveKeyBindings(next, store)
    const input = createInputMap({ bindings: loadKeyBindings(store) })

    input.keyDown('KeyQ', 0)
    expect(input.keyUp('KeyQ')).toEqual([{ type: INPUT_EVENTS.TAP, player: 'p1' }])
  })
})

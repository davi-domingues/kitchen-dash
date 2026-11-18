import { describe, expect, it } from 'vitest'
import { DEFAULT_KEY_BINDINGS, remapKey, sanitizeKeyBindings } from './keyBindings.js'

describe('keyBindings', () => {
  it('padrão: P1 setas + Enter, P2 WASD + Espaço, P pausa', () => {
    expect(DEFAULT_KEY_BINDINGS.p1).toEqual({
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
      action: 'Enter',
    })
    expect(DEFAULT_KEY_BINDINGS.p2).toEqual({
      up: 'KeyW',
      down: 'KeyS',
      left: 'KeyA',
      right: 'KeyD',
      action: 'Space',
    })
    expect(DEFAULT_KEY_BINDINGS.pause).toBe('KeyP')
  })

  it('remapKey atribui a tecla sem alterar o original', () => {
    const next = remapKey(DEFAULT_KEY_BINDINGS, { player: 'p2', control: 'action' }, 'KeyE')
    expect(next.p2.action).toBe('KeyE')
    expect(DEFAULT_KEY_BINDINGS.p2.action).toBe('Space')
  })

  it('remapKey troca as teclas quando a nova já está em uso', () => {
    const next = remapKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'action' }, 'KeyP')
    expect(next.p1.action).toBe('KeyP')
    expect(next.pause).toBe('Enter')
  })

  it('remapKey aceita a pausa como alvo', () => {
    expect(remapKey(DEFAULT_KEY_BINDINGS, {}, 'Escape').pause).toBe('Escape')
  })

  it('remapKey rejeita tecla ou controle inválidos', () => {
    expect(() => remapKey(DEFAULT_KEY_BINDINGS, {}, '')).toThrow()
    expect(() => remapKey(DEFAULT_KEY_BINDINGS, { player: 'p3', control: 'up' }, 'KeyQ')).toThrow()
    expect(() => remapKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'jump' }, 'KeyQ')).toThrow()
  })

  it('sanitizeKeyBindings volta ao padrão com lixo ou teclas repetidas', () => {
    expect(sanitizeKeyBindings(null)).toEqual(DEFAULT_KEY_BINDINGS)
    expect(sanitizeKeyBindings('x')).toEqual(DEFAULT_KEY_BINDINGS)
    expect(sanitizeKeyBindings({ p1: { action: 'Space' } })).toEqual(DEFAULT_KEY_BINDINGS)
  })

  it('sanitizeKeyBindings completa campos ausentes com o padrão', () => {
    const result = sanitizeKeyBindings({ p1: { action: 'KeyL', up: 42 } })
    expect(result.p1.action).toBe('KeyL')
    expect(result.p1.up).toBe('ArrowUp')
    expect(result.pause).toBe('KeyP')
  })
})

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_KEY_BINDINGS,
  isDefaultKeyBindings,
  keyOwner,
  remapKey,
  sanitizeKeyBindings,
} from './keyBindings.js'

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

  it('remapKey troca entre jogadores diferentes sem repetir tecla', () => {
    const next = remapKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'action' }, 'KeyW')
    expect(next.p1.action).toBe('KeyW')
    expect(next.p2.up).toBe('Enter')

    const codes = [...Object.values(next.p1), ...Object.values(next.p2), next.pause]
    expect(new Set(codes).size).toBe(11)
    expect(DEFAULT_KEY_BINDINGS.p2.up).toBe('KeyW')
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

describe('keyOwner', () => {
  it('encontra o dono de um jogador', () => {
    expect(keyOwner(DEFAULT_KEY_BINDINGS, 'ArrowUp')).toEqual({ player: 'p1', control: 'up' })
    expect(keyOwner(DEFAULT_KEY_BINDINGS, 'KeyW')).toEqual({ player: 'p2', control: 'up' })
  })

  it('representa a pausa como slot vazio', () => {
    expect(keyOwner(DEFAULT_KEY_BINDINGS, 'KeyP')).toEqual({})
  })

  it('devolve null para tecla livre, vazia ou entrada inválida', () => {
    expect(keyOwner(DEFAULT_KEY_BINDINGS, 'KeyQ')).toBeNull()
    expect(keyOwner(DEFAULT_KEY_BINDINGS, '')).toBeNull()
    expect(keyOwner(null, 'KeyP')).toBeNull()
  })
})

describe('isDefaultKeyBindings', () => {
  it('reconhece o padrão', () => {
    expect(isDefaultKeyBindings(DEFAULT_KEY_BINDINGS)).toBe(true)
    expect(isDefaultKeyBindings(sanitizeKeyBindings(null))).toBe(true)
  })

  it('recusa conjunto personalizado', () => {
    const custom = remapKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'up' }, 'KeyI')
    expect(isDefaultKeyBindings(custom)).toBe(false)
  })

  it('recusa entrada inválida ou incompleta', () => {
    expect(isDefaultKeyBindings(null)).toBe(false)
    expect(isDefaultKeyBindings('x')).toBe(false)
    expect(isDefaultKeyBindings({ p1: {} })).toBe(false)
  })
})

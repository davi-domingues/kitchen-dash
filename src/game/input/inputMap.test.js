import { describe, expect, it } from 'vitest'
import { createInputMap, INPUT_EVENTS, TAP_THRESHOLD_MS } from './inputMap.js'
import { DEFAULT_KEY_BINDINGS, remapKey } from './keyBindings.js'

describe('inputMap: movimento', () => {
  it('2 jogadores: setas movem P1 e WASD move P2', () => {
    const input = createInputMap({ playerCount: 2 })
    input.keyDown('ArrowRight', 0)
    input.keyDown('KeyW', 0)

    expect(input.getMove('p1')).toEqual({ x: 1, y: 0 })
    expect(input.getMove('p2')).toEqual({ x: 0, y: -1 })
  })

  it('1 jogador: os dois conjuntos controlam o mesmo chef', () => {
    const input = createInputMap({ playerCount: 1 })
    input.keyDown('KeyD', 0)
    input.keyDown('ArrowDown', 0)

    expect(input.getMove('p1')).toEqual({ x: 1, y: 1 })
    expect(input.getMove('p2')).toEqual({ x: 0, y: 0 })
  })

  it('teclas opostas se anulam e soltar para o chef', () => {
    const input = createInputMap()
    input.keyDown('ArrowLeft', 0)
    input.keyDown('ArrowRight', 0)
    expect(input.getMove('p1')).toEqual({ x: 0, y: 0 })

    input.keyUp('ArrowRight')
    expect(input.getMove('p1')).toEqual({ x: -1, y: 0 })
    input.keyUp('ArrowLeft')
    expect(input.getMove('p1')).toEqual({ x: 0, y: 0 })
  })

  it('ignora teclas sem mapeamento', () => {
    const input = createInputMap()
    expect(input.keyDown('KeyZ', 0)).toEqual([])
    expect(input.keyUp('KeyZ')).toEqual([])
  })

  it('usa as teclas remapeadas', () => {
    const bindings = remapKey(DEFAULT_KEY_BINDINGS, { player: 'p1', control: 'up' }, 'KeyI')
    const input = createInputMap({ bindings })
    input.keyDown('KeyI', 0)
    expect(input.getMove('p1')).toEqual({ x: 0, y: -1 })
  })

  it('releaseAll solta tudo sem emitir eventos', () => {
    const input = createInputMap()
    input.keyDown('ArrowUp', 0)
    input.keyDown('Enter', 0)
    input.update(500)

    input.releaseAll()

    expect(input.getMove('p1')).toEqual({ x: 0, y: 0 })
    expect(input.isHolding('p1')).toBe(false)
    expect(input.keyUp('Enter')).toEqual([])
  })

  it('rejeita playerCount inválido', () => {
    expect(() => createInputMap({ playerCount: 3 })).toThrow()
  })
})

describe('inputMap: toque rápido x segurar', () => {
  it('soltar antes do limite emite toque', () => {
    const input = createInputMap()
    input.keyDown('Enter', 1000)
    expect(input.update(1000 + TAP_THRESHOLD_MS - 1)).toEqual([])

    expect(input.keyUp('Enter')).toEqual([{ type: INPUT_EVENTS.TAP, player: 'p1' }])
  })

  it('segurar até o limite emite início uma vez e fim ao soltar', () => {
    const input = createInputMap()
    input.keyDown('Space', 0)

    expect(input.update(TAP_THRESHOLD_MS)).toEqual([{ type: INPUT_EVENTS.HOLD_START, player: 'p2' }])
    expect(input.update(TAP_THRESHOLD_MS + 100)).toEqual([])
    expect(input.isHolding('p2')).toBe(true)
    expect(input.keyUp('Space')).toEqual([{ type: INPUT_EVENTS.HOLD_END, player: 'p2' }])
    expect(input.isHolding('p2')).toBe(false)
  })

  it('repetição automática do keydown não reinicia o tempo', () => {
    const input = createInputMap()
    input.keyDown('Enter', 0)
    input.keyDown('Enter', 200)
    expect(input.update(TAP_THRESHOLD_MS)).toHaveLength(1)
  })

  it('1 jogador: Enter e Espaço juntos contam como um só botão', () => {
    const input = createInputMap({ playerCount: 1 })
    input.keyDown('Enter', 0)
    input.keyDown('Space', 50)

    expect(input.keyUp('Enter')).toEqual([])
    expect(input.keyUp('Space')).toEqual([{ type: INPUT_EVENTS.TAP, player: 'p1' }])
  })

  it('aceita limite customizado', () => {
    const input = createInputMap({ tapThresholdMs: 100 })
    input.keyDown('Enter', 0)
    expect(input.update(100)).toEqual([{ type: INPUT_EVENTS.HOLD_START, player: 'p1' }])
  })
})

describe('inputMap: pausa', () => {
  it('P emite pausa só no primeiro keydown', () => {
    const input = createInputMap()
    expect(input.keyDown('KeyP', 0)).toEqual([{ type: INPUT_EVENTS.PAUSE }])
    expect(input.keyDown('KeyP', 30)).toEqual([])
    expect(input.keyUp('KeyP')).toEqual([])
  })
})

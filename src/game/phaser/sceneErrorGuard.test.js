import { describe, expect, it, vi } from 'vitest'
import { GAME_EVENTS } from './events.js'
import { guardScene } from './sceneErrorGuard.js'

function createScene(update) {
  return { init: vi.fn(), create: vi.fn(), update }
}

describe('guardScene', () => {
  it('repassa argumentos e retorno quando não há erro', () => {
    const emit = vi.fn()
    const scene = createScene(vi.fn((time) => time * 2))
    guardScene(scene, 'kitchen', emit)

    expect(scene.update(21)).toBe(42)
    expect(emit).not.toHaveBeenCalled()
  })

  it('emite game:crashed uma única vez e para de executar a cena', () => {
    const emit = vi.fn()
    const error = new Error('boom')
    const update = vi.fn(() => {
      throw error
    })
    const scene = createScene(update)
    guardScene(scene, 'kitchen', emit)

    scene.update(1)
    scene.update(2)
    scene.create()

    expect(emit).toHaveBeenCalledTimes(1)
    expect(emit).toHaveBeenCalledWith(GAME_EVENTS.GAME_CRASHED, { error, sceneKey: 'kitchen' })
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('captura falha no create preservando o this da cena', () => {
    const emit = vi.fn()
    const scene = {
      value: 1,
      create() {
        if (this.value === 1) throw new Error('create')
      },
    }
    guardScene(scene, 'boot', emit)

    scene.create()

    expect(emit).toHaveBeenCalledWith(GAME_EVENTS.GAME_CRASHED, expect.objectContaining({ sceneKey: 'boot' }))
  })
})

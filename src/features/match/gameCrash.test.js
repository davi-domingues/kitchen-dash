import { EventEmitter } from 'node:events'
import { describe, expect, it, vi } from 'vitest'
import { GAME_EVENTS } from '../../game/phaser/events.js'
import { subscribeGameCrash } from './gameCrash.js'

describe('subscribeGameCrash', () => {
  it('reporta o erro com a cena e volta ao menu', () => {
    const bus = new EventEmitter()
    const report = vi.fn()
    const onCrash = vi.fn()
    subscribeGameCrash(bus, { report, onCrash })
    const error = new Error('boom')

    bus.emit(GAME_EVENTS.GAME_CRASHED, { error, sceneKey: 'kitchen' })

    expect(report).toHaveBeenCalledWith(error, { sceneKey: 'kitchen' })
    expect(onCrash).toHaveBeenCalledTimes(1)
  })

  it('para de ouvir após cancelar a assinatura', () => {
    const bus = new EventEmitter()
    const report = vi.fn()
    const unsubscribe = subscribeGameCrash(bus, { report, onCrash: vi.fn() })

    unsubscribe()
    bus.emit(GAME_EVENTS.GAME_CRASHED, { error: new Error('x'), sceneKey: 'kitchen' })

    expect(report).not.toHaveBeenCalled()
  })
})

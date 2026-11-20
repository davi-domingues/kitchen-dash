import { describe, expect, it } from 'vitest'
import { GAME_EVENTS } from './events.js'

describe('contrato do EventBus', () => {
  it('expõe os eventos da partida com os nomes documentados', () => {
    expect(GAME_EVENTS).toEqual({
      SCENE_READY: 'scene:ready',
      MATCH_ENDED: 'match:ended',
      MATCH_PAUSED: 'match:paused',
      MATCH_RESUMED: 'match:resumed',
      MATCH_END_REQUESTED: 'match:endRequested',
      GAME_CRASHED: 'game:crashed',
    })
  })

  it('não repete nomes de evento', () => {
    const names = Object.values(GAME_EVENTS)
    expect(new Set(names).size).toBe(names.length)
  })

  it('é imutável', () => {
    expect(Object.isFrozen(GAME_EVENTS)).toBe(true)
  })
})

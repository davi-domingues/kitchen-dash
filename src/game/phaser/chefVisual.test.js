import { describe, expect, it } from 'vitest'
import { chefPose } from './chefVisual.js'

describe('chefPose', () => {
  it('olha para a direção do chef e, sem direção, para baixo', () => {
    expect(chefPose({ facing: 'left' }, { elapsedMs: 0, playerCount: 1 })).toMatchObject({ fx: -1, fy: 0 })
    expect(chefPose({}, { elapsedMs: 0, playerCount: 1 })).toMatchObject({ fx: 0, fy: 1 })
  })

  it('balança só enquanto anda', () => {
    const context = { elapsedMs: 60, playerCount: 1 }

    expect(chefPose({ facing: 'up', stepCooldownMs: 100 }, context).bob).toBeCloseTo(2)
    expect(chefPose({ facing: 'up', stepCooldownMs: 0 }, context).bob).toBe(0)
  })

  it('mostra anel e rótulo do jogador só no 2P', () => {
    expect(chefPose({}, { elapsedMs: 0, playerCount: 1 }).showPlayer).toBe(false)
    expect(chefPose({}, { elapsedMs: 0, playerCount: 2 }).showPlayer).toBe(true)
  })
})

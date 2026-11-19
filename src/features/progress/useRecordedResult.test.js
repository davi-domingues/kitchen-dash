import { describe, expect, it, vi } from 'vitest'
import { recordOnce } from './useRecordedResult.js'

describe('recordOnce', () => {
  it('grava uma vez por matchId e repete o selo da 1ª gravação', () => {
    const record = vi.fn(() => ({ isNewRecord: true, record: { score: 9 }, duplicate: false }))
    const unlock = vi.fn(() => ({ newlyUnlocked: ['hat_bordeaux'] }))
    const result = { matchId: 'a', score: 320 }

    const first = recordOnce(result, record, unlock)
    const second = recordOnce(result, record, unlock)

    expect(record).toHaveBeenCalledTimes(1)
    expect(unlock).toHaveBeenCalledWith(320)
    expect(second).toBe(first)
    expect(first).toEqual({ isNewRecord: true, record: { score: 9 }, unlocked: ['hat_bordeaux'] })
  })

  it('partida duplicada no storage não registra pontuação nem avisa', () => {
    const record = vi.fn(() => ({ isNewRecord: false, record: null, duplicate: true }))
    const unlock = vi.fn()

    const outcome = recordOnce({ matchId: 'b', score: 999 }, record, unlock)

    expect(unlock).not.toHaveBeenCalled()
    expect(outcome.unlocked).toEqual([])
  })
})

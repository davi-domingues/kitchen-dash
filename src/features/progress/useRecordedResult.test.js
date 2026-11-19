import { describe, expect, it, vi } from 'vitest'
import { recordOnce } from './useRecordedResult.js'

describe('recordOnce', () => {
  it('grava uma vez por matchId e repete o selo da 1ª gravação', () => {
    const record = vi.fn(() => ({ isNewRecord: true, record: { score: 9 }, duplicate: false }))
    const result = { matchId: 'a' }

    const first = recordOnce(result, record)
    const second = recordOnce(result, record)

    expect(record).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
    expect(first).toEqual({ isNewRecord: true, record: { score: 9 } })
  })
})

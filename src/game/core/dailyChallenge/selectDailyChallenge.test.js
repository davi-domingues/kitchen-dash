import { describe, expect, it } from 'vitest'
import { selectDailyChallenge } from './selectDailyChallenge.js'

describe('selectDailyChallenge', () => {
  const catalog = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

  it('returns deterministic challenge for the same date', () => {
    const first = selectDailyChallenge({ dateUtc: '2026-11-19', catalog })
    const second = selectDailyChallenge({ dateUtc: '2026-11-19', catalog })

    expect(first).toEqual(second)
  })

  it('varies with different dates', () => {
    const first = selectDailyChallenge({ dateUtc: '2026-11-19', catalog })
    const second = selectDailyChallenge({ dateUtc: '2026-11-20', catalog })

    expect(first).not.toEqual(second)
  })

  it('throws when catalog is empty', () => {
    expect(() => selectDailyChallenge({ dateUtc: '2026-11-19', catalog: [] })).toThrow()
  })
})

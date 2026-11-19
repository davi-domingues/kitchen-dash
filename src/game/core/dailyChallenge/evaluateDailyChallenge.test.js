import { describe, expect, it } from 'vitest'
import { evaluateDailyChallenge } from './evaluateDailyChallenge.js'

describe('evaluateDailyChallenge', () => {
  const summary = {
    mode: 'classic',
    score: 720,
    missedOrders: 0,
    deliveredByRecipe: { ratatouille: 3 },
  }

  it('checks recipe delivery count', () => {
    expect(
      evaluateDailyChallenge(
        {
          type: 'deliver-recipe-count',
          recipeId: 'ratatouille',
          count: 3,
        },
        summary,
      ),
    ).toBe(true)
  })

  it('checks no missed orders', () => {
    expect(evaluateDailyChallenge({ type: 'no-missed-orders' }, summary)).toBe(true)
  })

  it('checks score thresholds', () => {
    expect(evaluateDailyChallenge({ type: 'score-at-least', score: 600 }, summary)).toBe(true)
  })
})

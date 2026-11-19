export function evaluateDailyChallenge(criteria, summary) {
  if (!criteria || typeof criteria.type !== 'string') {
    throw new Error('criteria type is required')
  }

  if (!summary || typeof summary !== 'object') {
    throw new Error('summary is required to evaluate daily challenge')
  }

  switch (criteria.type) {
    case 'deliver-recipe-count': {
      const delivered = summary.deliveredByRecipe?.[criteria.recipeId] ?? 0
      return delivered >= criteria.count
    }
    case 'no-missed-orders': {
      return (summary.missedOrders ?? 0) === 0
    }
    case 'score-at-least': {
      return (summary.score ?? 0) >= criteria.score
    }
    default:
      throw new Error(`unknown daily challenge criteria: ${criteria.type}`)
  }
}

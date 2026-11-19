import rawChallenges from '../../../content/dailyChallenges.json'

function ensureArray(value, message) {
  if (!Array.isArray(value)) {
    throw new Error(message)
  }
}

function ensureNonEmptyArray(value, message) {
  ensureArray(value, message)
  if (value.length === 0) {
    throw new Error(message)
  }
}

export function validateDailyChallengeCatalog(challenges) {
  ensureNonEmptyArray(challenges, 'daily challenges catalog is empty')

  const ids = new Set()

  for (const challenge of challenges) {
    if (!challenge || typeof challenge !== 'object') {
      throw new Error('daily challenge must be an object')
    }

    if (typeof challenge.id !== 'string' || challenge.id.trim() === '') {
      throw new Error('daily challenge id is required')
    }

    if (ids.has(challenge.id)) {
      throw new Error(`duplicate daily challenge id: ${challenge.id}`)
    }

    ids.add(challenge.id)

    if (typeof challenge.titleKey !== 'string' || typeof challenge.descriptionKey !== 'string') {
      throw new Error(`daily challenge ${challenge.id} missing i18n keys`)
    }

    ensureNonEmptyArray(challenge.applicableModes, `daily challenge ${challenge.id} must define modes`)

    if (!challenge.criteria || typeof challenge.criteria.type !== 'string') {
      throw new Error(`daily challenge ${challenge.id} missing criteria type`)
    }
  }

  return challenges
}

export function getDailyChallengeCatalog() {
  return validateDailyChallengeCatalog(rawChallenges)
}

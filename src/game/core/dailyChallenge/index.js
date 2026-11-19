import { toUtcDateKey } from '../dateUtc.js'
import { getDailyChallengeCatalog } from './catalog.js'
import { evaluateDailyChallenge } from './evaluateDailyChallenge.js'
import { selectDailyChallenge } from './selectDailyChallenge.js'

export function getDailyChallenge({ dateUtc, date, catalog } = {}) {
  const dateKey = dateUtc ?? toUtcDateKey(date ?? new Date())
  const source = catalog ?? getDailyChallengeCatalog()
  const challenge = selectDailyChallenge({ dateUtc: dateKey, catalog: source })

  return { dateUtc: dateKey, challenge }
}

export function getDailyChallengeResult({ summary, dateUtc, date, catalog } = {}) {
  if (!summary) {
    throw new Error('summary is required to build daily challenge result')
  }

  const { dateUtc: dateKey, challenge } = getDailyChallenge({ dateUtc, date, catalog })
  const applicable = Array.isArray(challenge.applicableModes)
    ? challenge.applicableModes.includes(summary.mode)
    : true

  const completed = applicable ? evaluateDailyChallenge(challenge.criteria, summary) : false

  return {
    dateUtc: dateKey,
    challengeId: challenge.id,
    completed,
  }
}

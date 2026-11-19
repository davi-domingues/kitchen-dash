import { toUtcDateKey } from '../game/core/dateUtc.js'
import { storage } from './storage.js'

const STORAGE_KEY = 'dailyChallengeCompletion'

function readAll() {
  return storage.get(STORAGE_KEY, {})
}

export function getDailyChallengeCompletion(dateUtc = toUtcDateKey(new Date())) {
  const all = readAll()
  return all[dateUtc] ?? null
}

export function setDailyChallengeCompletion({ dateUtc, challengeId, completedAt } = {}) {
  if (!dateUtc || !challengeId) {
    throw new Error('dateUtc and challengeId are required')
  }

  const all = readAll()

  if (all[dateUtc]) {
    return all[dateUtc]
  }

  const entry = {
    dateUtc,
    challengeId,
    completedAt: completedAt ?? new Date().toISOString(),
  }

  storage.set(STORAGE_KEY, { ...all, [dateUtc]: entry })
  return entry
}

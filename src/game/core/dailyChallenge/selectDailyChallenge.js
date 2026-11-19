import { utcDateKeyToNumber } from '../dateUtc.js'

export function selectDailyChallenge({ dateUtc, catalog }) {
  if (!dateUtc) {
    throw new Error('dateUtc is required to select daily challenge')
  }

  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error('catalog must be a non-empty array')
  }

  const dateNumber = utcDateKeyToNumber(dateUtc)
  const index = Math.abs(dateNumber) % catalog.length

  return catalog[index]
}

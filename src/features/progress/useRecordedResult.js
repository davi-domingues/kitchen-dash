import { useMemo } from 'react'
import { recordMatchResult } from './progressStore.js'

// O storage já ignora matchId repetido; este cache guarda o selo da 1ª gravação, que o StrictMode
// (render duplo) ou uma remontagem perderiam, porque a 2ª chamada volta como duplicata.
let last = { matchId: null, outcome: null }

export function recordOnce(result, record = recordMatchResult) {
  if (last.matchId !== result.matchId) {
    const { isNewRecord, record: current } = record(result)
    last = { matchId: result.matchId, outcome: { isNewRecord, record: current } }
  }
  return last.outcome
}

export function useRecordedResult(result) {
  return useMemo(() => (result ? recordOnce(result) : null), [result])
}

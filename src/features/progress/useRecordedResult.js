import { useMemo } from 'react'
import { recordScore } from '../cosmetics/cosmeticsStore.js'
import { recordMatchResult } from './progressStore.js'

// O storage já ignora matchId repetido; este cache guarda o selo da 1ª gravação, que o StrictMode
// (render duplo) ou uma remontagem perderiam, porque a 2ª chamada volta como duplicata.
let last = { matchId: null, outcome: null }

// A pontuação também alimenta os cosméticos (KD-23); `unlocked` lista o que esta partida liberou.
export function recordOnce(result, record = recordMatchResult, unlock = recordScore) {
  if (last.matchId !== result.matchId) {
    const { isNewRecord, record: current, duplicate } = record(result)
    const unlocked = duplicate ? [] : unlock(result.score).newlyUnlocked
    last = { matchId: result.matchId, outcome: { isNewRecord, record: current, unlocked } }
  }
  return last.outcome
}

export function useRecordedResult(result) {
  return useMemo(() => (result ? recordOnce(result) : null), [result])
}

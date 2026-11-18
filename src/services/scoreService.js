// Envio de pontuação pela RPC `submit_score` (KD-31). Importe só via scoreLoader.js (supabase-js fora do JS inicial).
import { FAILURE_KINDS, ScoreFailure, classifyScoreError } from './scoreFailure.js'
import { supabase } from './supabase.js'

// Um placar por modo e nº de jogadores, ex.: classic_1p (regex do banco ^[a-z0-9_-]{1,40}$)
export function toBoard(mode, players) {
  return `${mode}_${players}p`
}

export function createScoreService(client) {
  return {
    async submitScore(entry, { origin = 'online' } = {}) {
      let result
      try {
        result = await client.rpc('submit_score', {
          p_match_id: entry.matchId,
          p_board: toBoard(entry.mode, entry.players),
          p_score: entry.score,
          p_duration_ms: entry.durationMs,
          p_seed: entry.seed,
          p_content_version: entry.contentVersion,
          p_origin: origin,
          p_orders_completed: entry.ordersCompleted,
        })
      } catch (error) {
        throw new ScoreFailure(FAILURE_KINDS.RETRY, error)
      }
      if (result.error) throw new ScoreFailure(classifyScoreError(result.error), result.error)
      const { data } = result
      return {
        matchId: data.match_id,
        isNewBest: data.is_new_best,
        bestScore: data.best_score,
        unlockedCosmetics: data.unlocked_cosmetics ?? [],
      }
    },
  }
}

export const scoreService = supabase ? createScoreService(supabase) : null

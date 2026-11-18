import { describe, expect, it, vi } from 'vitest'
import { FAILURE_KINDS, classifyScoreError } from './scoreFailure.js'
import { createScoreService, toBoard } from './scoreService.js'

const ENTRY = {
  matchId: '00000000-0000-4000-8000-000000000001',
  mode: 'classic',
  players: 1,
  seed: 42,
  contentVersion: '7691008a',
  score: 300,
  ordersCompleted: 3,
  ordersFailed: 1,
  durationMs: 180000,
}

describe('toBoard', () => {
  it('monta o placar por modo e jogadores dentro do formato do banco', () => {
    expect(toBoard('classic', 1)).toBe('classic_1p')
    expect(toBoard('challenge', 2)).toMatch(/^[a-z0-9_-]{1,40}$/)
  })
})

describe('classifyScoreError', () => {
  it.each([
    ['54000', FAILURE_KINDS.RETRY],
    ['22023', FAILURE_KINDS.DISCARD],
    ['23505', FAILURE_KINDS.DISCARD],
    ['28000', FAILURE_KINDS.AUTH],
    ['42501', FAILURE_KINDS.AUTH],
    [undefined, FAILURE_KINDS.RETRY],
  ])('código %s → %s', (code, kind) => {
    expect(classifyScoreError({ code })).toBe(kind)
  })
})

describe('createScoreService', () => {
  it('chama submit_score com os parâmetros do contrato e normaliza o retorno', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { match_id: ENTRY.matchId, is_new_best: true, best_score: 300, unlocked_cosmetics: ['hat_gold'] },
      error: null,
    })

    const result = await createScoreService({ rpc }).submitScore(ENTRY)

    expect(rpc).toHaveBeenCalledWith('submit_score', {
      p_match_id: ENTRY.matchId,
      p_board: 'classic_1p',
      p_score: 300,
      p_duration_ms: 180000,
      p_seed: 42,
      p_content_version: '7691008a',
      p_origin: 'online',
      p_orders_completed: 3,
    })
    expect(result).toEqual({
      matchId: ENTRY.matchId,
      isNewBest: true,
      bestScore: 300,
      unlockedCosmetics: ['hat_gold'],
    })
  })

  it('converte erro da RPC em ScoreFailure classificada', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValue({ data: null, error: { code: '22023', message: 'implausible_score' } })

    await expect(createScoreService({ rpc }).submitScore(ENTRY)).rejects.toMatchObject({
      kind: FAILURE_KINDS.DISCARD,
    })
  })

  it('falha de rede vira tentativa nova', async () => {
    const rpc = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(createScoreService({ rpc }).submitScore(ENTRY)).rejects.toMatchObject({
      kind: FAILURE_KINDS.RETRY,
    })
  })
})

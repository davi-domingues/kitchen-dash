import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCurrentUserId, fetchRankingPage, RANKING_BOARDS } from './rankingService.js'
import { getSupabase } from '../../services/supabase.js'

vi.mock('../../services/supabase.js', () => ({
  getSupabase: vi.fn(),
}))

const BOARD_IDS = ['classic_1p', 'classic_2p', 'free_1p', 'free_2p', 'challenge_1p', 'challenge_2p']

function createBuilder(result) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue(result),
    in: vi.fn().mockResolvedValue(result),
  }
}

function createClient({
  scores = { data: [], error: null },
  profiles = { data: [], error: null },
  session,
} = {}) {
  const scoreQuery = createBuilder(scores)
  const profileQuery = createBuilder(profiles)
  const client = {
    from: vi.fn((table) => (table === 'best_scores' ? scoreQuery : profileQuery)),
    auth: { getSession: vi.fn().mockResolvedValue(session ?? { data: { session: null }, error: null }) },
  }

  return { client, scoreQuery, profileQuery }
}

describe('ranking service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('define exatamente os seis quadros aceitos', () => {
    expect(RANKING_BOARDS).toEqual(BOARD_IDS)
  })

  it.each(BOARD_IDS)('filtra a consulta pelo quadro %s', async (board) => {
    const { client } = createClient()
    getSupabase.mockReturnValue(client)

    await fetchRankingPage(board, 0)

    expect(client.from).toHaveBeenCalledWith('best_scores')
    expect(client.from('best_scores').eq).toHaveBeenCalledWith('board', board)
  })

  it('retorna 20 posições, consulta nomes públicos e detecta a próxima página', async () => {
    const scores = Array.from({ length: 21 }, (_, index) => ({
      board: 'classic_1p',
      user_id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
      score: 1000 - index,
      achieved_at: `2026-11-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
    }))
    const profiles = scores.slice(0, 20).map(({ user_id }, index) => ({
      id: user_id,
      display_name: `chef_${index}`,
    }))
    const { client, scoreQuery, profileQuery } = createClient({
      scores: { data: scores, error: null },
      profiles: { data: profiles, error: null },
    })
    getSupabase.mockReturnValue(client)

    const result = await fetchRankingPage('classic_1p', 1)

    expect(scoreQuery.select).toHaveBeenCalledWith('board,user_id,score,achieved_at')
    expect(scoreQuery.order.mock.calls).toEqual([
      ['score', { ascending: false }],
      ['achieved_at', { ascending: true }],
      ['user_id', { ascending: true }],
    ])
    expect(scoreQuery.range).toHaveBeenCalledWith(20, 40)
    expect(profileQuery.select).toHaveBeenCalledWith('id,display_name')
    expect(profileQuery.in).toHaveBeenCalledWith(
      'id',
      scores.slice(0, 20).map(({ user_id }) => user_id),
    )
    expect(result.entries).toHaveLength(20)
    expect(result.entries[0]).toEqual({
      userId: scores[0].user_id,
      displayName: 'chef_0',
      score: 1000,
      achievedAt: scores[0].achieved_at,
      position: 21,
    })
    expect(result.hasNextPage).toBe(true)
  })

  it('não consulta perfis quando o quadro está vazio', async () => {
    const { client } = createClient()
    getSupabase.mockReturnValue(client)

    await expect(fetchRankingPage('free_2p', 0)).resolves.toEqual({
      entries: [],
      hasNextPage: false,
    })
    expect(client.from).toHaveBeenCalledTimes(1)
  })

  it('omite um recorde sem perfil público correspondente', async () => {
    const scores = [
      {
        board: 'challenge_1p',
        user_id: '00000000-0000-0000-0000-000000000001',
        score: 40,
        achieved_at: '2026-11-18T00:00:00Z',
      },
    ]
    const { client } = createClient({ scores: { data: scores, error: null } })
    getSupabase.mockReturnValue(client)

    await expect(fetchRankingPage('challenge_1p', 0)).resolves.toEqual({
      entries: [],
      hasNextPage: false,
    })
  })

  it('propaga erros de pontuação e de perfil público', async () => {
    const scoreError = new Error('score read failed')
    const scoreClient = createClient({ scores: { data: null, error: scoreError } })
    getSupabase.mockReturnValue(scoreClient.client)
    await expect(fetchRankingPage('classic_1p', 0)).rejects.toBe(scoreError)

    const profileError = new Error('profile read failed')
    const profileClient = createClient({
      scores: {
        data: [
          {
            board: 'classic_1p',
            user_id: '00000000-0000-0000-0000-000000000001',
            score: 10,
            achieved_at: '2026-11-18T00:00:00Z',
          },
        ],
        error: null,
      },
      profiles: { data: null, error: profileError },
    })
    getSupabase.mockReturnValue(profileClient.client)
    await expect(fetchRankingPage('classic_1p', 0)).rejects.toBe(profileError)
  })

  it('rejeita quadro ou página inválidos antes de consultar o backend', async () => {
    const { client } = createClient()
    getSupabase.mockReturnValue(client)

    await expect(fetchRankingPage('unknown', 0)).rejects.toThrow(/quadro/i)
    await expect(fetchRankingPage('classic_1p', -1)).rejects.toThrow(/página/i)
    await expect(fetchRankingPage('classic_1p', 0.5)).rejects.toThrow(/página/i)
    expect(client.from).not.toHaveBeenCalled()
  })

  it('retorna o id da sessão autenticada e propaga erro de sessão', async () => {
    const sessionClient = createClient({
      session: {
        data: { session: { user: { id: '00000000-0000-0000-0000-000000000001' } } },
        error: null,
      },
    })
    getSupabase.mockReturnValue(sessionClient.client)
    await expect(fetchCurrentUserId()).resolves.toBe('00000000-0000-0000-0000-000000000001')

    const error = new Error('session failed')
    const errorClient = createClient({ session: { data: { session: null }, error } })
    getSupabase.mockReturnValue(errorClient.client)
    await expect(fetchCurrentUserId()).rejects.toBe(error)
  })
})

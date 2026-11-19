import { getSupabase } from '../../services/supabase.js'

export const RANKING_PAGE_SIZE = 20
export const RANKING_BOARDS = Object.freeze([
  'classic_1p',
  'classic_2p',
  'free_1p',
  'free_2p',
  'challenge_1p',
  'challenge_2p',
])

const BOARD_SET = new Set(RANKING_BOARDS)

function validatePage(board, page) {
  if (!BOARD_SET.has(board)) {
    throw new TypeError('Quadro de ranking inválido.')
  }
  if (!Number.isSafeInteger(page) || page < 0) {
    throw new TypeError('Página de ranking inválida.')
  }

  const start = page * RANKING_PAGE_SIZE
  const end = start + RANKING_PAGE_SIZE
  if (!Number.isSafeInteger(end)) {
    throw new RangeError('Página de ranking fora do intervalo permitido.')
  }

  return { start, end }
}

export async function fetchRankingPage(board, page) {
  const { start, end } = validatePage(board, page)
  const supabase = getSupabase()
  const { data: scores, error: scoresError } = await supabase
    .from('best_scores')
    .select('board,user_id,score,achieved_at')
    .eq('board', board)
    .order('score', { ascending: false })
    .order('achieved_at', { ascending: true })
    .order('user_id', { ascending: true })
    .range(start, end)

  if (scoresError) {
    throw scoresError
  }

  const rows = scores ?? []
  const visibleScores = rows.slice(0, RANKING_PAGE_SIZE)
  if (visibleScores.length === 0) {
    return { entries: [], hasNextPage: rows.length > RANKING_PAGE_SIZE }
  }

  const userIds = visibleScores.map(({ user_id }) => user_id)
  const { data: profiles, error: profilesError } = await supabase
    .from('public_profiles')
    .select('id,display_name')
    .in('id', userIds)

  if (profilesError) {
    throw profilesError
  }

  const displayNames = new Map((profiles ?? []).map(({ id, display_name }) => [id, display_name]))
  const entries = visibleScores.flatMap((score, index) => {
    const displayName = displayNames.get(score.user_id)
    if (!displayName) {
      return []
    }

    return [
      {
        userId: score.user_id,
        displayName,
        score: score.score,
        achievedAt: score.achieved_at,
        position: start + index + 1,
      },
    ]
  })

  return {
    entries,
    hasNextPage: rows.length > RANKING_PAGE_SIZE,
  }
}

export async function fetchCurrentUserId() {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) {
    throw error
  }

  return data.session?.user?.id ?? null
}

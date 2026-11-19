import { describe, expect, it } from 'vitest'
import { CHALLENGE_LENGTH } from '../../game/core/matchModes.js'
import {
  BOARD_LIMIT_PER_GROUP,
  PENDING_LIMIT,
  applyMatchResult,
  createEmptyProgress,
  getBoard,
  getRecord,
  isBetter,
  removePendingEntries,
  sanitizeProgress,
} from './progress.js'

const NOW = new Date('2026-11-18T12:00:00.000Z')
let counter = 0
const uuid = () => `00000000-0000-4000-8000-${String((counter += 1)).padStart(12, '0')}`

const result = (extra = {}) => ({
  matchId: uuid(),
  mode: 'classic',
  players: 1,
  seed: 7,
  contentVersion: 'v-test',
  score: 100,
  ordersCompleted: 3,
  ordersFailed: 1,
  durationMs: 180000,
  ...extra,
})
const challenge = (extra = {}) =>
  result({ mode: 'challenge', ordersCompleted: CHALLENGE_LENGTH, ordersFailed: 0, ...extra })

function play(progress, ...results) {
  return results.reduce(
    (p, r, i) => applyMatchResult(p, r, { now: new Date(NOW.getTime() + i) }).progress,
    progress,
  )
}

describe('applyMatchResult: recordes', () => {
  it('a primeira partida do modo é novo recorde e grava endedAt', () => {
    const r = result({ score: 120 })

    const out = applyMatchResult(createEmptyProgress(), r, { now: NOW })

    expect(out.isNewRecord).toBe(true)
    expect(out.record).toEqual({ ...r, endedAt: NOW.toISOString() })
  })

  it('Clássico: menos pontos não bate o recorde e devolve o recorde atual', () => {
    const progress = play(createEmptyProgress(), result({ score: 300 }))

    const out = applyMatchResult(progress, result({ score: 200 }), { now: NOW })

    expect(out.isNewRecord).toBe(false)
    expect(out.record.score).toBe(300)
  })

  it('empate não é novo recorde', () => {
    const progress = play(createEmptyProgress(), result({ score: 300 }))

    expect(applyMatchResult(progress, result({ score: 300 }), { now: NOW }).isNewRecord).toBe(false)
  })

  it('Desafio: menor tempo é recorde, separado por nº de jogadores', () => {
    const progress = play(
      createEmptyProgress(),
      challenge({ players: 2, durationMs: 240000 }),
      challenge({ durationMs: 100000 }),
    )

    const out = applyMatchResult(progress, challenge({ players: 2, durationMs: 210000 }), { now: NOW })

    expect(out.isNewRecord).toBe(true)
    expect(getRecord(out.progress, 'challenge', 1).durationMs).toBe(100000)
    expect(getRecord(out.progress, 'challenge', 2).durationMs).toBe(210000)
  })

  it('Desafio incompleto não vira recorde nem entra no placar, mas conta nas estatísticas e pendentes', () => {
    const out = applyMatchResult(createEmptyProgress(), challenge({ ordersCompleted: 5, durationMs: 1000 }), {
      now: NOW,
    })

    expect(out.isNewRecord).toBe(false)
    expect(out.record).toBeNull()
    expect(out.progress.board).toEqual([])
    expect(out.progress.stats.matchesPlayed).toBe(1)
    expect(out.progress.pending).toHaveLength(1)
  })

  it('Livre usa a regra de pontos', () => {
    const progress = play(createEmptyProgress(), result({ mode: 'free', score: 50 }))

    expect(applyMatchResult(progress, result({ mode: 'free', score: 80 }), { now: NOW }).isNewRecord).toBe(
      true,
    )
  })
})

describe('applyMatchResult: placar, estatísticas e pendentes', () => {
  it('acumula as estatísticas', () => {
    const progress = play(
      createEmptyProgress(),
      result(),
      result({ ordersCompleted: 2, ordersFailed: 0, durationMs: 1000 }),
    )

    expect(progress.stats).toEqual({
      matchesPlayed: 2,
      ordersCompleted: 5,
      ordersFailed: 1,
      playTimeMs: 181000,
    })
  })

  it('guarda só as melhores por modo e nº de jogadores, ordenadas', () => {
    const scores = Array.from({ length: BOARD_LIMIT_PER_GROUP + 2 }, (_, i) => result({ score: i * 10 }))
    const progress = play(createEmptyProgress(), ...scores, result({ players: 2, score: 1 }))

    const board = getBoard(progress, 'classic', 1)
    expect(board).toHaveLength(BOARD_LIMIT_PER_GROUP)
    expect(board[0].score).toBe((BOARD_LIMIT_PER_GROUP + 1) * 10)
    expect(board.at(-1).score).toBe(20)
    expect(getBoard(progress, 'classic', 2)).toHaveLength(1)
  })

  it('pendentes ficam com as mais recentes até o limite, com seed e contentVersion', () => {
    const many = Array.from({ length: PENDING_LIMIT + 3 }, () => result())
    const progress = play(createEmptyProgress(), ...many)

    expect(progress.pending).toHaveLength(PENDING_LIMIT)
    expect(progress.pending.at(-1).matchId).toBe(many.at(-1).matchId)
    expect(progress.pending[0]).toMatchObject({ seed: 7, contentVersion: 'v-test' })
  })

  it('o mesmo matchId não conta duas vezes', () => {
    const r = result()
    const once = play(createEmptyProgress(), r)

    const out = applyMatchResult(once, r, { now: NOW })

    expect(out.duplicate).toBe(true)
    expect(out.isNewRecord).toBe(false)
    expect(out.progress).toBe(once)
  })

  it('removePendingEntries tira só os ids enviados', () => {
    const [a, b] = [result(), result()]
    const progress = play(createEmptyProgress(), a, b)

    expect(removePendingEntries(progress, [a.matchId]).pending.map((e) => e.matchId)).toEqual([b.matchId])
  })
})

describe('isBetter', () => {
  const at = (iso, extra) => ({ ...result(extra), endedAt: iso })

  it('no empate a mais antiga fica na frente', () => {
    expect(isBetter(at('2026-01-01T00:00:00Z'), at('2026-01-02T00:00:00Z'))).toBe(true)
    expect(isBetter(at('2026-01-02T00:00:00Z'), at('2026-01-01T00:00:00Z'))).toBe(false)
  })
})

describe('sanitizeProgress', () => {
  it('valor ausente ou de tipo errado vira progresso vazio', () => {
    expect(sanitizeProgress(null)).toEqual(createEmptyProgress())
    expect(sanitizeProgress('x')).toEqual(createEmptyProgress())
  })

  it('descarta entradas inválidas, reordena o placar e zera estatísticas inválidas', () => {
    const good = { ...result({ score: 10 }), endedAt: NOW.toISOString() }
    const better = { ...result({ score: 90 }), endedAt: NOW.toISOString() }
    const raw = {
      board: [
        good,
        { ...good, matchId: 'x' },
        better,
        { ...challenge({ ordersCompleted: 1 }), endedAt: NOW.toISOString() },
      ],
      stats: { matchesPlayed: 3, ordersCompleted: -1, ordersFailed: 'a' },
      pending: [good, { ...good, endedAt: 'ontem' }],
    }

    const progress = sanitizeProgress(raw)

    expect(progress.board.map((e) => e.score)).toEqual([90, 10])
    expect(progress.stats).toEqual({ matchesPlayed: 3, ordersCompleted: 0, ordersFailed: 0, playTimeMs: 0 })
    expect(progress.pending).toEqual([good])
  })
})

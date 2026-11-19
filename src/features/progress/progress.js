// Progresso local do visitante (KD-22): regras puras, sem storage nem React.
// O recorde é a 1ª entrada do placar do modo + nº de jogadores, então não há dado duplicado.
import { CHALLENGE_LENGTH, MATCH_MODES } from '../../game/core/matchModes.js'
import { parseMatchEnded } from '../match/matchEnded.js'

export const BOARD_LIMIT_PER_GROUP = 10
// A KD-35 esvazia a lista ao enviar; o teto evita crescer sem fim para quem nunca entra na conta
export const PENDING_LIMIT = 50

const EMPTY_STATS = Object.freeze({ matchesPlayed: 0, ordersCompleted: 0, ordersFailed: 0, playTimeMs: 0 })

export function createEmptyProgress() {
  return { board: [], stats: { ...EMPTY_STATS }, pending: [] }
}

function parseEntry(raw) {
  const result = parseMatchEnded(raw)
  if (!result || typeof raw.endedAt !== 'string' || Number.isNaN(Date.parse(raw.endedAt))) return null
  return { ...result, endedAt: raw.endedAt }
}

const isRankable = (entry) =>
  entry.mode !== MATCH_MODES.CHALLENGE || entry.ordersCompleted >= CHALLENGE_LENGTH

// true quando `a` fica acima de `b` no placar; empate mantém a mais antiga na frente
export function isBetter(a, b) {
  if (a.mode === MATCH_MODES.CHALLENGE) {
    if (a.durationMs !== b.durationMs) return a.durationMs < b.durationMs
  } else if (a.score !== b.score) {
    return a.score > b.score
  }
  return a.endedAt < b.endedAt
}

const sameGroup = (mode, players) => (entry) => entry.mode === mode && entry.players === players

export function getBoard(progress, mode, players) {
  return progress.board.filter(sameGroup(mode, players))
}

export function getRecord(progress, mode, players) {
  return getBoard(progress, mode, players)[0] ?? null
}

function insertIntoBoard(board, entry) {
  const inGroup = sameGroup(entry.mode, entry.players)
  const group = [...board.filter(inGroup), entry]
    .sort((a, b) => (isBetter(a, b) ? -1 : isBetter(b, a) ? 1 : 0))
    .slice(0, BOARD_LIMIT_PER_GROUP)
  return [...board.filter((e) => !inGroup(e)), ...group]
}

const nonNegative = (value) => (Number.isInteger(value) && value >= 0 ? value : 0)

// Dado vindo do localStorage é não confiável: normaliza o que dá e descarta o resto
export function sanitizeProgress(raw) {
  if (!raw || typeof raw !== 'object') return createEmptyProgress()
  const entries = (list) => (Array.isArray(list) ? list.map(parseEntry).filter(Boolean) : [])
  const board = entries(raw.board).filter(isRankable).reduce(insertIntoBoard, [])
  const stats = Object.fromEntries(
    Object.keys(EMPTY_STATS).map((key) => [key, nonNegative(raw.stats?.[key])]),
  )
  return { board, stats, pending: entries(raw.pending).slice(-PENDING_LIMIT) }
}

/**
 * Registra o fim de uma partida já validado por parseMatchEnded.
 * @returns {{ progress, isNewRecord: boolean, record: object|null, duplicate: boolean }}
 */
export function applyMatchResult(progress, result, { now }) {
  const known = (e) => e.matchId === result.matchId
  if (progress.pending.some(known) || progress.board.some(known)) {
    return {
      progress,
      isNewRecord: false,
      record: getRecord(progress, result.mode, result.players),
      duplicate: true,
    }
  }

  const entry = { ...result, endedAt: now.toISOString() }
  const previous = getRecord(progress, result.mode, result.players)
  const isNewRecord = isRankable(entry) && (!previous || isBetter(entry, previous))
  const board = isRankable(entry) ? insertIntoBoard(progress.board, entry) : progress.board
  const { stats } = progress
  const next = {
    board,
    stats: {
      matchesPlayed: stats.matchesPlayed + 1,
      ordersCompleted: stats.ordersCompleted + result.ordersCompleted,
      ordersFailed: stats.ordersFailed + result.ordersFailed,
      playTimeMs: stats.playTimeMs + result.durationMs,
    },
    pending: [...progress.pending, entry].slice(-PENDING_LIMIT),
  }
  return {
    progress: next,
    isNewRecord,
    record: getRecord(next, result.mode, result.players),
    duplicate: false,
  }
}

export function removePendingEntries(progress, matchIds) {
  const ids = new Set(matchIds)
  return { ...progress, pending: progress.pending.filter((e) => !ids.has(e.matchId)) }
}

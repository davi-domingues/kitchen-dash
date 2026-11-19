import { isMatchMode, isPlayerCount } from '../../game/core/matchModes.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const UINT32_MAX = 0xffffffff

const isCount = (value) => Number.isInteger(value) && value >= 0

// O payload vem da cena e depois vira submit_score: validar aqui evita mostrar ou enfileirar lixo
export function parseMatchEnded(payload) {
  if (!payload || typeof payload !== 'object') return null
  const { matchId, mode, players, seed, contentVersion, score, ordersCompleted, ordersFailed, durationMs } =
    payload
  const valid =
    typeof matchId === 'string' &&
    UUID.test(matchId) &&
    isMatchMode(mode) &&
    isPlayerCount(players) &&
    Number.isInteger(seed) &&
    seed >= 0 &&
    seed <= UINT32_MAX &&
    typeof contentVersion === 'string' &&
    contentVersion.length > 0 &&
    isCount(score) &&
    isCount(ordersCompleted) &&
    isCount(ordersFailed) &&
    Number.isInteger(durationMs) &&
    durationMs > 0
  if (!valid) return null
  return { matchId, mode, players, seed, contentVersion, score, ordersCompleted, ordersFailed, durationMs }
}

export function formatDuration(durationMs) {
  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

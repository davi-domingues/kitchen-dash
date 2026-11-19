// Derivação pura do HUD a partir do MatchState: a cena só desenha o que sai daqui.
import { MATCH_MODES } from '../core/matchModes.js'

export const PATIENCE_BANDS = Object.freeze({ OK: 'ok', WARN: 'warn', DANGER: 'danger' })

// PRD cita só as três cores; os limites são suposição da spec da KD-20
const WARN_BELOW = 0.5
const DANGER_BELOW = 0.25

export function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function patienceBand(fraction) {
  if (fraction === null) return null
  if (fraction > WARN_BELOW) return PATIENCE_BANDS.OK
  if (fraction > DANGER_BELOW) return PATIENCE_BANDS.WARN
  return PATIENCE_BANDS.DANGER
}

function orderCard({ id, number, recipeId, patienceMs, remainingMs }) {
  const fraction = patienceMs ? Math.min(1, Math.max(0, remainingMs / patienceMs)) : null
  return { id, number, recipeId, fraction, band: patienceBand(fraction) }
}

export function buildHudModel(state) {
  const countdown = state.durationMs !== null
  return {
    score: state.score,
    clock: {
      kind: countdown ? 'remaining' : 'elapsed',
      text: formatClock(countdown ? state.durationMs - state.elapsedMs : state.elapsedMs),
    },
    orders: state.orders.map(orderCard),
    queued: state.orderQueue?.pending.length ?? 0,
    canEnd: state.mode === MATCH_MODES.FREE,
  }
}

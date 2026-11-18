// Pontuação (KD-14): transforma os eventos de pedido da KD-13 em alterações de `state.score`.
import { CORE_EVENTS, createEvent } from './coreEvents.js'

// Os números vêm do PRD ("Pontuação"); o teto de plausibilidade é derivado deles (ESTUDOS_E_DECISOES).
export const SCORING_RULES = Object.freeze({
  maxTip: 40,
  comboBonus: 10,
  wrongPenalty: 20,
  expiredPenalty: 30,
  maxPointsPerSecond: 15,
  plausibilityAllowance: 180,
})

export function withScoreTracking(state) {
  return { ...state, scoring: { combo: 0 } }
}

export function tipFor(patienceMs, remainingMs) {
  if (patienceMs === null || remainingMs === null) return 0
  const ratio = Math.min(1, Math.max(0, remainingMs / patienceMs))
  return Math.round(SCORING_RULES.maxTip * ratio)
}

const penalty = (reason, points) => ({
  reason,
  raw: -points,
  base: 0,
  tip: 0,
  comboBonus: 0,
  combo: 0,
})

function scoreEvent(event, combo) {
  const { payload } = event
  switch (event.type) {
    case CORE_EVENTS.ORDER_DELIVERED: {
      const nextCombo = combo + 1
      const base = payload.points
      const tip = tipFor(payload.patienceMs, payload.remainingMs)
      const comboBonus = nextCombo > 1 ? SCORING_RULES.comboBonus : 0
      return {
        reason: 'delivered',
        raw: base + tip + comboBonus,
        base,
        tip,
        comboBonus,
        combo: nextCombo,
      }
    }
    case CORE_EVENTS.ORDER_WRONG:
      return penalty('wrong', SCORING_RULES.wrongPenalty)
    case CORE_EVENTS.ORDER_EXPIRED:
      return penalty('expired', SCORING_RULES.expiredPenalty)
    default:
      return null
  }
}

export function applyScoreEvents(state, events) {
  if (!state.scoring) return { state, events: [] }
  let { score } = state
  let { combo } = state.scoring
  const changes = []
  for (const event of events) {
    const result = scoreEvent(event, combo)
    if (!result) continue
    const { raw, ...detail } = result
    const nextScore = Math.max(0, score + raw)
    combo = detail.combo
    changes.push(
      createEvent(CORE_EVENTS.SCORE_CHANGED, {
        ...detail,
        delta: nextScore - score,
        score: nextScore,
        orderId: event.payload.orderId ?? null,
        elapsedMs: event.payload.elapsedMs,
      }),
    )
    score = nextScore
  }
  if (changes.length === 0) return { state, events: [] }
  return { state: { ...state, score, scoring: { ...state.scoring, combo } }, events: changes }
}

// O contrato da KD-11 não repassa eventos entre sistemas; envolver o sistema de pedidos evita mudar o `update`.
export function withScoring(system) {
  return function scoredSystem(state, context) {
    const result = system(state, context)
    const scored = applyScoreEvents(result.state, result.events)
    return { state: scored.state, events: [...result.events, ...scored.events] }
  }
}

export function maxPlausibleScore(durationMs) {
  const seconds = Math.ceil(durationMs / 1000)
  return SCORING_RULES.plausibilityAllowance + seconds * SCORING_RULES.maxPointsPerSecond
}

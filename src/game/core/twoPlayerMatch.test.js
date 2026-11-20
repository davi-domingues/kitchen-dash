// QA do MVP (KD-46): partida completa com 2 jogadores no mesmo teclado, em cada modo, até o fim.
import { describe, expect, it } from 'vitest'
import { CORE_EVENTS } from './coreEvents.js'
import { getDailyChallengeResult } from './dailyChallenge/index.js'
import { CHALLENGE_LENGTH, createMatch, endMatch } from './match.js'
import { MATCH_MODES } from './matchModes.js'
import { MATCH_STATUS } from './matchState.js'
import { MOVE_ACTION } from './movementSystem.js'

const STEP_MS = 100
const DAILY_DATE = '2026-11-20'

const twoPlayers = (mode) => createMatch({ mode, players: 2, seed: 11, contentVersion: 'v-test' })

// Os dois chefs andam no mesmo frame e se revezam servindo o primeiro pedido no passe.
function play(match, maxMs) {
  let { state } = match
  const events = []
  let turn = 0
  for (let elapsed = 0; elapsed < maxMs && state.status === MATCH_STATUS.RUNNING; elapsed += STEP_MS) {
    const chefId = turn % 2 === 0 ? 'p1' : 'p2'
    const order = state.orders[0]
    if (order) turn += 1
    state = { ...state, deliveries: order ? [{ chefId, recipeId: order.recipeId }] : [] }
    const moves = [
      { chefId: 'p1', action: MOVE_ACTION, x: 1, y: 0 },
      { chefId: 'p2', action: MOVE_ACTION, x: -1, y: 0 },
    ]
    const result = match.update(state, moves, STEP_MS)
    state = result.state
    events.push(...result.events)
  }
  return { state, events }
}

const ofType = (events, type) => events.filter((event) => event.type === type)

function dailySummary(payload, events) {
  const deliveredByRecipe = {}
  for (const { payload: delivered } of ofType(events, CORE_EVENTS.ORDER_DELIVERED)) {
    deliveredByRecipe[delivered.recipeId] = (deliveredByRecipe[delivered.recipeId] ?? 0) + 1
  }
  return { mode: payload.mode, score: payload.score, missedOrders: payload.ordersFailed, deliveredByRecipe }
}

describe('partida completa com 2 jogadores', () => {
  it('Clássico termina aos 180 s com os dois chefs e um único match:ended', () => {
    const { state, events } = play(twoPlayers(MATCH_MODES.CLASSIC), 200000)

    const ended = ofType(events, CORE_EVENTS.MATCH_ENDED)
    expect(state.status).toBe(MATCH_STATUS.ENDED)
    expect(state.chefs.map((chef) => chef.id)).toEqual(['p1', 'p2'])
    expect(ended).toHaveLength(1)
    expect(ended[0].payload).toMatchObject({ mode: 'classic', players: 2, durationMs: 180000 })
    expect(ended[0].payload.ordersCompleted).toBeGreaterThan(0)
  })

  it('Livre segue sem fim automático e encerra pelo botão com 2 jogadores', () => {
    const { state, events } = play(twoPlayers(MATCH_MODES.FREE), 240000)
    expect(state.status).toBe(MATCH_STATUS.RUNNING)

    const result = endMatch(state)

    const [ended] = ofType(result.events, CORE_EVENTS.MATCH_ENDED)
    expect(result.state.status).toBe(MATCH_STATUS.ENDED)
    expect(ended.payload).toMatchObject({ mode: 'free', players: 2, ordersFailed: 0 })
    expect(ended.payload.ordersCompleted).toBe(ofType(events, CORE_EVENTS.ORDER_DELIVERED).length)
  })

  it('Desafio termina ao entregar o 12º pedido com 2 jogadores', () => {
    const { state, events } = play(twoPlayers(MATCH_MODES.CHALLENGE), 600000)

    const ended = ofType(events, CORE_EVENTS.MATCH_ENDED)
    expect(state.status).toBe(MATCH_STATUS.ENDED)
    expect(ended).toHaveLength(1)
    expect(ended[0].payload).toMatchObject({
      mode: 'challenge',
      players: 2,
      ordersCompleted: CHALLENGE_LENGTH,
      ordersFailed: 0,
    })
  })

  it.each([MATCH_MODES.CLASSIC, MATCH_MODES.CHALLENGE])(
    'Desafio do dia avalia o resumo da partida de 2 jogadores no modo %s',
    (mode) => {
      const { events } = play(twoPlayers(mode), 600000)
      const [ended] = ofType(events, CORE_EVENTS.MATCH_ENDED)

      const result = getDailyChallengeResult({
        summary: dailySummary(ended.payload, events),
        dateUtc: DAILY_DATE,
      })

      expect(result.dateUtc).toBe(DAILY_DATE)
      expect(typeof result.challengeId).toBe('string')
      expect(typeof result.completed).toBe('boolean')
    },
  )
})

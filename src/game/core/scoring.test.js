import { describe, expect, it } from 'vitest'
import { CORE_EVENTS, createEvent } from './coreEvents.js'
import { createMatchState } from './matchState.js'
import { createOrdersSystem, deliverDish, withOrderQueue } from './orders.js'
import {
  SCORING_RULES,
  applyScoreEvents,
  maxPlausibleScore,
  tipFor,
  withScoreTracking,
  withScoring,
} from './scoring.js'
import { createUpdate } from './update.js'

const RECIPES = [{ id: 'salad', points: 60, unlockAtMs: 0 }]

const newState = (score = 0) => ({
  ...withScoreTracking(createMatchState({ seed: 7, mode: 'classic', contentVersion: 'test' })),
  score,
})

const outcome = (overrides) => ({
  orderId: 'order-1',
  number: 1,
  recipeId: 'salad',
  points: 60,
  patienceMs: 60000,
  remainingMs: 30000,
  elapsedMs: 1000,
  ...overrides,
})
const delivered = (overrides = {}) => createEvent(CORE_EVENTS.ORDER_DELIVERED, outcome(overrides))
const expired = () =>
  createEvent(
    CORE_EVENTS.ORDER_EXPIRED,
    outcome({ orderId: 'order-2', number: 2, remainingMs: 0, elapsedMs: 3000 }),
  )
const wrong = () => createEvent(CORE_EVENTS.ORDER_WRONG, { recipeId: 'soup', elapsedMs: 2000 })

describe('tipFor', () => {
  it.each([
    [60000, 60000, 40],
    [60000, 30000, 20],
    [60000, 0, 0],
    [60000, 1000, 1],
    [60000, 90000, 40],
    [60000, -5, 0],
    [null, null, 0],
    [60000, null, 0],
  ])('paciência %s, restante %s ⇒ %s', (patienceMs, remainingMs, tip) => {
    expect(tipFor(patienceMs, remainingMs)).toBe(tip)
  })
})

describe('applyScoreEvents: entrega (US1)', () => {
  it('soma base mais gorjeta proporcional', () => {
    const { state, events } = applyScoreEvents(newState(), [delivered()])

    expect(state.score).toBe(80)
    expect(events).toEqual([
      {
        type: CORE_EVENTS.SCORE_CHANGED,
        payload: {
          reason: 'delivered',
          delta: 80,
          base: 60,
          tip: 20,
          comboBonus: 0,
          combo: 1,
          score: 80,
          orderId: 'order-1',
          elapsedMs: 1000,
        },
      },
    ])
  })

  it('sem paciência soma só a base', () => {
    const event = delivered({ patienceMs: null, remainingMs: null })

    const { state } = applyScoreEvents(newState(), [event])

    expect(state.score).toBe(60)
  })
})

describe('applyScoreEvents: combo (US2)', () => {
  it('dá +10 fixo a partir da segunda entrega seguida', () => {
    const { state, events } = applyScoreEvents(newState(), [delivered(), delivered(), delivered()])

    expect(events.map((e) => e.payload.comboBonus)).toEqual([0, 10, 10])
    expect(state.scoring.combo).toBe(3)
    expect(state.score).toBe(80 + 90 + 90)
  })

  it.each([
    ['prato errado', wrong],
    ['cliente perdido', expired],
  ])('%s zera o combo', (_, breaker) => {
    const { state, events } = applyScoreEvents(newState(), [delivered(), breaker(), delivered()])

    expect(events.map((e) => e.payload.comboBonus)).toEqual([0, 0, 0])
    expect(state.scoring.combo).toBe(1)
  })

  it('mantém o combo entre chamadas', () => {
    const first = applyScoreEvents(newState(), [delivered()])

    const { events } = applyScoreEvents(first.state, [delivered()])

    expect(events[0].payload.comboBonus).toBe(SCORING_RULES.comboBonus)
  })
})

describe('applyScoreEvents: penalidades e piso (US3)', () => {
  it('prato errado tira 20', () => {
    const { state, events } = applyScoreEvents(newState(100), [wrong()])

    expect(state.score).toBe(80)
    expect(events[0].payload).toMatchObject({
      reason: 'wrong',
      delta: -20,
      orderId: null,
      elapsedMs: 2000,
    })
  })

  it('cliente que vai embora tira 30', () => {
    const { state, events } = applyScoreEvents(newState(100), [expired()])

    expect(state.score).toBe(70)
    expect(events[0].payload).toMatchObject({ reason: 'expired', delta: -30, orderId: 'order-2' })
  })

  it('não deixa o placar abaixo de zero e informa a variação efetiva', () => {
    const { state, events } = applyScoreEvents(newState(10), [wrong(), expired()])

    expect(state.score).toBe(0)
    expect(events.map((e) => e.payload.delta)).toEqual([-10, 0])
  })

  it('ignora eventos que não são de pedido', () => {
    const initial = newState(50)
    const other = createEvent(CORE_EVENTS.ORDER_CREATED, { orderId: 'x', visible: true })

    const result = applyScoreEvents(initial, [other])

    expect(result.state).toBe(initial)
    expect(result.events).toEqual([])
  })

  it('sem rastreio de pontuação devolve o estado intacto', () => {
    const initial = createMatchState({ seed: 1, mode: 'classic', contentVersion: 'test' })

    const result = applyScoreEvents(initial, [delivered()])

    expect(result.state).toBe(initial)
    expect(result.events).toEqual([])
  })
})

describe('integração com update e pedidos', () => {
  const newMatch = (seed = 42) =>
    withScoreTracking(
      withOrderQueue(createMatchState({ seed, mode: 'classic', contentVersion: 'test' }), {
        patienceMs: 1000,
        spawnIntervalMs: { min: 13000, max: 13000 },
      }),
    )
  const update = createUpdate([withScoring(createOrdersSystem({ recipes: RECIPES }))])
  const advance = (state, steps) => {
    let current = state
    for (let i = 0; i < steps; i += 1) current = update(current, [], 250).state
    return current
  }

  it('pontua a entrega via deliverDish e penaliza a expiração no update', () => {
    const first = update(newMatch(), [], 0).state
    const delivery = deliverDish(first, 'salad')
    const afterDelivery = applyScoreEvents(delivery.state, delivery.events).state

    const afterExpiry = advance(afterDelivery, 13000 / 250 + 4)

    expect(afterDelivery.score).toBe(100)
    expect(afterExpiry.score).toBe(70)
    expect(afterExpiry.scoring.combo).toBe(0)
  })

  it('preserva os eventos do sistema envolvido antes dos de placar', () => {
    const { events } = update(newMatch(), [], 0)

    expect(events.map((e) => e.type)).toEqual([CORE_EVENTS.ORDER_CREATED])
  })

  it('é determinístico com a mesma seed e os mesmos passos', () => {
    const play = () => advance(newMatch(99), 200)

    expect(play()).toEqual(play())
  })
})

describe('maxPlausibleScore', () => {
  it('soma a folga ao teto por segundo, arredondando o tempo para cima', () => {
    expect(maxPlausibleScore(0)).toBe(180)
    expect(maxPlausibleScore(1500)).toBe(180 + 2 * 15)
    expect(maxPlausibleScore(180000)).toBe(180 + 180 * 15)
  })

  it('cobre uma partida perfeita do Clássico', () => {
    // Uma chegada no início e depois uma a cada 13 s (intervalo mínimo), todas com gorjeta e combo máximos.
    const deliveries = 1 + Math.floor(180 / 13)
    const perfect = deliveries * (130 + SCORING_RULES.maxTip + SCORING_RULES.comboBonus)

    expect(perfect).toBeLessThanOrEqual(maxPlausibleScore(180000))
  })
})

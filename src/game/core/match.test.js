import { describe, expect, it } from 'vitest'
import { RECIPES } from '../../content/index.js'
import { CORE_EVENTS } from './coreEvents.js'
import {
  CHALLENGE_LENGTH,
  CHALLENGE_SEED,
  MODE_RULES,
  challengeSequence,
  createMatch,
  createModeSystems,
  endMatch,
} from './match.js'
import { MATCH_MODES } from './matchModes.js'
import { MATCH_STATUS } from './matchState.js'

const config = (mode, extra = {}) => ({ mode, players: 1, seed: 7, contentVersion: 'v-test', ...extra })

// Avança em passos de 100 ms; `serve` decide os pratos postos no passe antes de cada passo.
function run(match, ms, serve = () => []) {
  let { state } = match
  const events = []
  for (let elapsed = 0; elapsed < ms && state.status === MATCH_STATUS.RUNNING; elapsed += 100) {
    state = { ...state, deliveries: serve(state) }
    const result = match.update(state, [], 100)
    state = result.state
    events.push(...result.events)
  }
  return { state, events }
}

const ofType = (events, type) => events.filter((e) => e.type === type)
const serveFirst = (state) => (state.orders[0] ? [{ chefId: 'p1', recipeId: state.orders[0].recipeId }] : [])

describe('createMatch: Clássico', () => {
  it('monta 3 minutos com paciência de 60 s e 4 comandas', () => {
    const { state } = createMatch(config('classic', { players: 2 }))

    expect(state.durationMs).toBe(180000)
    expect(state.orderQueue.config).toMatchObject({ maxVisible: 4, maxQueued: 20, patienceMs: 60000 })
    expect(state.chefs.map((c) => c.id)).toEqual(['p1', 'p2'])
    expect(state.stations.length).toBeGreaterThan(0)
  })

  it('encerra aos 180 s com o resumo completo em match:ended', () => {
    const { state, events } = run(createMatch(config('classic')), 200000)

    const [ended] = ofType(events, CORE_EVENTS.MATCH_ENDED)
    expect(state.status).toBe(MATCH_STATUS.ENDED)
    expect(ended.payload).toEqual({
      mode: 'classic',
      players: 1,
      seed: 7,
      contentVersion: 'v-test',
      score: state.score,
      ordersCompleted: 0,
      ordersFailed: ofType(events, CORE_EVENTS.ORDER_EXPIRED).length,
      durationMs: 180000,
    })
    expect(ended.payload.ordersFailed).toBeGreaterThan(0)
  })

  it('entrega o prato do passe, pontua, conta e esvazia o passe', () => {
    const { state, events } = run(createMatch(config('classic')), 30000, serveFirst)

    const delivered = ofType(events, CORE_EVENTS.ORDER_DELIVERED)
    expect(delivered.length).toBeGreaterThan(0)
    expect(state.stats.ordersCompleted).toBe(delivered.length)
    expect(state.score).toBeGreaterThan(0)
    expect(ofType(events, CORE_EVENTS.SCORE_CHANGED)).toHaveLength(delivered.length)
    expect(state.deliveries).toEqual([])
  })

  it('consome prato sem comanda com penalidade, sem contar como entrega', () => {
    const match = createMatch(config('classic'))
    const wrong = () => [{ chefId: 'p1', recipeId: 'nao-pedido' }]

    const { state, events } = run(match, 100, wrong)

    expect(ofType(events, CORE_EVENTS.ORDER_WRONG)).toHaveLength(1)
    expect(state.deliveries).toEqual([])
    expect(state.stats).toEqual({ ordersCompleted: 0, ordersFailed: 0 })
  })
})

describe('createMatch: Livre', () => {
  it('não termina sozinho nem expira comandas, com até 6 visíveis', () => {
    const { state, events } = run(createMatch(config('free')), 600000)

    expect(state.status).toBe(MATCH_STATUS.RUNNING)
    expect(state.durationMs).toBeNull()
    expect(state.orders).toHaveLength(6)
    expect(state.orderQueue.pending.length).toBeGreaterThan(0)
    expect(ofType(events, CORE_EVENTS.ORDER_EXPIRED)).toEqual([])
    expect(MODE_RULES.free.orders.patienceMs).toBeNull()
  })

  it('endMatch encerra com a duração decorrida e só uma vez', () => {
    const { state } = run(createMatch(config('free')), 5000)

    const first = endMatch(state)
    const second = endMatch(first.state)

    expect(first.state.status).toBe(MATCH_STATUS.ENDED)
    expect(first.events).toHaveLength(1)
    expect(first.events[0].payload).toMatchObject({ mode: 'free', durationMs: 5000 })
    expect(second.events).toEqual([])
  })
})

describe('createMatch: Desafio', () => {
  it('usa a seed fixa e a mesma sequência de 12 receitas qualquer que seja a seed de entrada', () => {
    const a = createMatch(config('challenge', { seed: 1 })).state
    const b = createMatch(config('challenge', { seed: 999 })).state

    expect(a.seed).toBe(CHALLENGE_SEED)
    expect(b.seed).toBe(CHALLENGE_SEED)
    expect(a.orderQueue.config.sequence).toHaveLength(CHALLENGE_LENGTH)
    expect(a.orderQueue.config.sequence).toEqual(b.orderQueue.config.sequence)
    expect(a.orderQueue.config).toMatchObject({ maxVisible: 3, patienceMs: null })
  })

  it('sorteia a sequência entre todas as receitas do conteúdo', () => {
    const ids = RECIPES.map((r) => r.id)

    expect(challengeSequence(RECIPES).every((id) => ids.includes(id))).toBe(true)
  })

  it('encerra ao entregar o 12º pedido, com a duração igual ao tempo decorrido', () => {
    const { state, events } = run(createMatch(config('challenge')), 600000, serveFirst)

    const ended = ofType(events, CORE_EVENTS.MATCH_ENDED)
    expect(ended).toHaveLength(1)
    expect(state.status).toBe(MATCH_STATUS.ENDED)
    expect(ended[0].payload).toMatchObject({
      mode: 'challenge',
      seed: CHALLENGE_SEED,
      ordersCompleted: CHALLENGE_LENGTH,
      ordersFailed: 0,
      durationMs: state.elapsedMs,
    })
  })
})

describe('createModeSystems', () => {
  it('devolve seed, duração, setup e sistemas para a cena compor com os dela', () => {
    const mode = createModeSystems({ mode: 'free', players: 2, seed: 5 })
    const state = mode.setup({ seed: 5, score: 0, orders: [] })

    expect(mode).toMatchObject({ seed: 5, durationMs: null })
    expect(mode.systems).toHaveLength(1)
    expect(state.players).toBe(2)
    expect(state.orderQueue.config.maxVisible).toBe(6)
    expect(state.scoring).toEqual({ combo: 0 })
  })

  it('no Desafio troca a seed pela fixa e acrescenta o sistema de fim', () => {
    const mode = createModeSystems({ mode: 'challenge', players: 1, seed: 5 })

    expect(mode.seed).toBe(CHALLENGE_SEED)
    expect(mode.systems).toHaveLength(2)
  })
})

describe('createMatch: validação', () => {
  it('tem regras para exatamente os modos de MATCH_MODES', () => {
    expect(Object.keys(MODE_RULES).sort()).toEqual(Object.values(MATCH_MODES).sort())
  })

  it('rejeita modo desconhecido', () => {
    expect(() => createMatch(config('turbo'))).toThrow(RangeError)
  })

  it('rejeita número de jogadores fora de 1 e 2', () => {
    expect(() => createMatch(config('classic', { players: 3 }))).toThrow(RangeError)
  })
})

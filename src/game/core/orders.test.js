import { describe, expect, it } from 'vitest'
import { CORE_EVENTS } from './coreEvents.js'
import { MATCH_STATUS, createMatchState, pauseMatch } from './matchState.js'
import {
  ORDER_DEFAULTS,
  createOrdersSystem,
  deliverDish,
  isSequenceComplete,
  withOrderQueue,
} from './orders.js'
import { createUpdate } from './update.js'

const RECIPES = [
  { id: 'salad', points: 60, unlockAtMs: 0 },
  { id: 'tartine', points: 60, unlockAtMs: 20000 },
  { id: 'soup', points: 90, unlockAtMs: 45000 },
]

const newMatch = (config, seed = 42) =>
  withOrderQueue(createMatchState({ seed, mode: 'classic', contentVersion: 'test' }), config)

const update = createUpdate([createOrdersSystem({ recipes: RECIPES })])

// Avança em passos de 250 ms e acumula os eventos.
function run(state, totalMs, stepMs = 250) {
  const events = []
  let current = state
  for (let t = 0; t < totalMs; t += stepMs) {
    const result = update(current, [], stepMs)
    current = result.state
    events.push(...result.events)
  }
  return { state: current, events }
}

const ofType = (events, type) => events.filter((e) => e.type === type)

describe('withOrderQueue', () => {
  it('instala a fila com os padrões e sem comandas', () => {
    const state = newMatch()

    expect(state.orders).toEqual([])
    expect(state.orderQueue).toMatchObject({
      config: ORDER_DEFAULTS,
      pending: [],
      nextNumber: 1,
      nextSpawnAtMs: 0,
    })
  })

  it.each([
    [{ maxVisible: 0 }],
    [{ maxQueued: -1 }],
    [{ patienceMs: 0 }],
    [{ spawnIntervalMs: { min: 5, max: 1 } }],
  ])('rejeita configuração inválida %o', (config) => {
    expect(() => newMatch(config)).toThrow(RangeError)
  })
})

describe('chegada de pedidos', () => {
  it('o primeiro pedido chega no primeiro passo e é de Salada', () => {
    const { state, events } = update(newMatch(), [], 16)

    expect(state.orders).toHaveLength(1)
    expect(state.orders[0]).toMatchObject({
      id: 'order-1',
      number: 1,
      recipeId: 'salad',
      points: 60,
      remainingMs: 60000,
    })
    expect(events).toEqual([
      {
        type: CORE_EVENTS.ORDER_CREATED,
        payload: { orderId: 'order-1', number: 1, recipeId: 'salad', visible: true },
      },
    ])
  })

  it('agenda a próxima chegada dentro do intervalo configurado', () => {
    const { state } = update(newMatch(), [], 16)

    expect(state.orderQueue.nextSpawnAtMs).toBeGreaterThanOrEqual(13000)
    expect(state.orderQueue.nextSpawnAtMs).toBeLessThanOrEqual(17000)
  })

  it('só sorteia receitas já liberadas no tempo decorrido', () => {
    const { state } = run(newMatch({ maxVisible: 50, patienceMs: null }, 7), 120000)

    expect(state.orders.length).toBeGreaterThan(5)
    for (const order of state.orders) {
      const recipe = RECIPES.find((r) => r.id === order.recipeId)
      expect(recipe.unlockAtMs).toBeLessThanOrEqual(order.createdAtMs)
    }
    expect(new Set(state.orders.map((o) => o.recipeId)).size).toBeGreaterThan(1)
  })

  it('é determinístico: mesma seed gera a mesma sequência; outra seed difere', () => {
    const a = run(newMatch({ maxVisible: 50, patienceMs: null }, 1), 120000).events
    const b = run(newMatch({ maxVisible: 50, patienceMs: null }, 1), 120000).events
    const c = run(newMatch({ maxVisible: 50, patienceMs: null }, 2), 120000).events

    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
  })

  it('não faz nada sem fila instalada', () => {
    const state = createMatchState({ seed: 1, mode: 'classic', contentVersion: 'test' })
    const { state: next, events } = update(state, [], 16)

    expect(next.orders).toEqual([])
    expect(events).toEqual([])
  })
})

describe('comandas visíveis e fila', () => {
  const config = { maxVisible: 1, maxQueued: 1, spawnIntervalMs: { min: 1000, max: 1000 }, patienceMs: null }

  it('excedente entra na fila e o descartado não ganha número', () => {
    const { state, events } = run(newMatch(config), 2250)
    const created = ofType(events, CORE_EVENTS.ORDER_CREATED).map((e) => e.payload)

    expect(created.map((p) => [p.number, p.visible])).toEqual([
      [1, true],
      [2, false],
    ])
    expect(state.orders.map((o) => o.number)).toEqual([1])
    expect(state.orderQueue.pending.map((o) => o.number)).toEqual([2])
    expect(state.orderQueue.nextNumber).toBe(3)
  })

  it('a entrega promove o mais antigo da fila com paciência cheia', () => {
    const { state } = run(newMatch({ ...config, patienceMs: 60000, maxQueued: 5 }), 1250)
    const { state: next } = deliverDish(state, 'salad')

    expect(next.orders.map((o) => o.number)).toEqual([2])
    expect(next.orders[0].remainingMs).toBe(60000)
    expect(next.orderQueue.pending).toEqual([])
  })
})

describe('paciência', () => {
  it('a comanda expira ao zerar a paciência, com os dados para a penalidade', () => {
    const state = newMatch({ patienceMs: 1000, spawnIntervalMs: { min: 60000, max: 60000 } })
    const { state: next, events } = run(state, 1250)
    const expired = ofType(events, CORE_EVENTS.ORDER_EXPIRED)

    expect(next.orders).toEqual([])
    expect(expired).toHaveLength(1)
    expect(expired[0].payload).toMatchObject({
      orderId: 'order-1',
      recipeId: 'salad',
      points: 60,
      patienceMs: 1000,
      remainingMs: 0,
    })
  })

  it('pedido na fila não perde paciência; a expiração promove o próximo', () => {
    const config = { maxVisible: 1, patienceMs: 2000, spawnIntervalMs: { min: 500, max: 500 } }
    const { state } = run(newMatch(config), 2250)

    expect(state.orders[0].number).toBe(2)
    expect(state.orders[0].remainingMs).toBeGreaterThan(1500)
    expect(state.orderQueue.pending.every((o) => o.remainingMs === null)).toBe(true)
  })

  it('sem paciência (Livre) nenhuma comanda expira', () => {
    const { state, events } = run(newMatch({ patienceMs: null }), 120000)

    expect(ofType(events, CORE_EVENTS.ORDER_EXPIRED)).toEqual([])
    expect(state.orders[0].remainingMs).toBeNull()
  })
})

describe('deliverDish', () => {
  const ready = () => update(newMatch(), [], 500).state

  it('fecha a comanda e emite order:delivered com a paciência restante', () => {
    const state = ready()
    const { state: next, events, delivered } = deliverDish(state, 'salad')

    expect(delivered).toBe(true)
    expect(next.orders).toEqual([])
    expect(next.orderQueue.deliveredCount).toBe(1)
    expect(events).toEqual([
      {
        type: CORE_EVENTS.ORDER_DELIVERED,
        payload: {
          orderId: 'order-1',
          number: 1,
          recipeId: 'salad',
          points: 60,
          patienceMs: 60000,
          remainingMs: 60000,
          elapsedMs: 250,
        },
      },
    ])
  })

  it('atende a comanda mais antiga da receita', () => {
    const config = { maxVisible: 3, spawnIntervalMs: { min: 1000, max: 1000 } }
    const { state } = run(newMatch(config), 1250)
    const { state: next } = deliverDish(state, 'salad')

    expect(next.orders.map((o) => o.number)).toEqual([2])
  })

  it('prato sem comanda emite order:wrong e não altera o estado', () => {
    const state = ready()
    const result = deliverDish(state, 'tartine')

    expect(result.delivered).toBe(false)
    expect(result.state).toBe(state)
    expect(result.events).toEqual([
      { type: CORE_EVENTS.ORDER_WRONG, payload: { recipeId: 'tartine', elapsedMs: 250 } },
    ])
  })

  it('receita desconhecida conta como prato errado', () => {
    const state = ready()
    const result = deliverDish(state, 'unknown_dish')

    expect(result.delivered).toBe(false)
    expect(result.state).toBe(state)
    expect(result.events).toEqual([
      { type: CORE_EVENTS.ORDER_WRONG, payload: { recipeId: 'unknown_dish', elapsedMs: 250 } },
    ])
  })

  it('não muta o estado recebido', () => {
    const state = ready()
    const snapshot = structuredClone(state)
    deliverDish(state, 'salad')

    expect(state).toEqual(snapshot)
  })

  it('é ignorada fora de running ou sem fila', () => {
    const paused = pauseMatch(ready())
    const bare = createMatchState({ seed: 1, mode: 'classic', contentVersion: 'test' })

    expect(paused.status).toBe(MATCH_STATUS.PAUSED)
    expect(deliverDish(paused, 'salad')).toEqual({ state: paused, events: [], delivered: false })
    expect(deliverDish(bare, 'salad')).toEqual({ state: bare, events: [], delivered: false })
  })
})

describe('sequência fixa', () => {
  const config = {
    sequence: ['soup', 'salad', 'tartine'],
    maxVisible: 3,
    patienceMs: null,
    spawnIntervalMs: { min: 1000, max: 1000 },
  }

  it('cria exatamente a sequência, na ordem, ignorando o desbloqueio', () => {
    const { state, events } = run(newMatch(config), 10000)
    const recipes = ofType(events, CORE_EVENTS.ORDER_CREATED).map((e) => e.payload.recipeId)

    expect(recipes).toEqual(['soup', 'salad', 'tartine'])
    expect(state.orderQueue.nextSpawnAtMs).toBeNull()
  })

  it('conclui quando todos os pedidos são entregues', () => {
    let { state } = run(newMatch(config), 3000)
    expect(isSequenceComplete(state)).toBe(false)

    for (const recipeId of ['salad', 'soup', 'tartine']) state = deliverDish(state, recipeId).state

    expect(isSequenceComplete(state)).toBe(true)
    expect(isSequenceComplete(newMatch())).toBe(false)
  })

  it('com a fila cheia, o mesmo item da sequência volta na próxima chegada', () => {
    const tight = { ...config, maxVisible: 1, maxQueued: 0 }
    const { state, events } = run(newMatch(tight), 2250)
    const first = ofType(events, CORE_EVENTS.ORDER_CREATED).map((e) => e.payload.recipeId)
    const after = run(deliverDish(state, 'soup').state, 1000).events

    expect(first).toEqual(['soup'])
    expect(ofType(after, CORE_EVENTS.ORDER_CREATED)[0].payload.recipeId).toBe('salad')
  })
})

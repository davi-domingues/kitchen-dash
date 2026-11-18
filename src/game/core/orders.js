// Pedidos e paciência (KD-13): chegada, comandas visíveis, fila, expiração e entrega de pratos.
import { RECIPES } from '../../content/index.js'
import { CORE_EVENTS, createEvent } from './coreEvents.js'
import { MATCH_STATUS } from './matchState.js'
import { pickInt } from './rng.js'

// O PRD só fixa os números do Livre; estes são os do Clássico, e a KD-15 os ajusta por modo.
export const ORDER_DEFAULTS = Object.freeze({
  maxVisible: 4,
  maxQueued: 20,
  spawnIntervalMs: Object.freeze({ min: 13000, max: 17000 }),
  patienceMs: 60000,
  sequence: null,
})

export function withOrderQueue(state, config = {}) {
  const merged = { ...ORDER_DEFAULTS, ...config }
  if (!(Number.isInteger(merged.maxVisible) && merged.maxVisible >= 1)) {
    throw new RangeError('maxVisible deve ser um inteiro ≥ 1')
  }
  if (!(Number.isInteger(merged.maxQueued) && merged.maxQueued >= 0)) {
    throw new RangeError('maxQueued deve ser um inteiro ≥ 0')
  }
  if (merged.patienceMs !== null && !(merged.patienceMs > 0)) {
    throw new RangeError('patienceMs deve ser positivo ou null')
  }
  const { min, max } = merged.spawnIntervalMs
  if (!(Number.isInteger(min) && Number.isInteger(max) && min > 0 && min <= max)) {
    throw new RangeError('spawnIntervalMs deve ter inteiros 0 < min ≤ max')
  }
  return {
    ...state,
    orders: [],
    orderQueue: {
      config: merged,
      pending: [],
      nextNumber: 1,
      nextSpawnAtMs: 0,
      deliveredCount: 0,
    },
  }
}

const outcome = (order, elapsedMs) => ({
  orderId: order.id,
  number: order.number,
  recipeId: order.recipeId,
  points: order.points,
  patienceMs: order.patienceMs,
  remainingMs: order.remainingMs,
  elapsedMs,
})

// A paciência só começa quando o pedido vira comanda visível: a fila é espera da cozinha, não do cliente.
const show = (order, patienceMs) => ({ ...order, patienceMs, remainingMs: patienceMs })

function promote(orders, queue) {
  const { maxVisible, patienceMs } = queue.config
  const free = Math.max(0, maxVisible - orders.length)
  if (free === 0 || queue.pending.length === 0) return { orders, queue }
  const moved = queue.pending.slice(0, free).map((order) => show(order, patienceMs))
  return { orders: [...orders, ...moved], queue: { ...queue, pending: queue.pending.slice(free) } }
}

function pickRecipe(queue, elapsedMs, recipes, rng) {
  const { sequence } = queue.config
  if (sequence) return recipes.find((r) => r.id === sequence[queue.nextNumber - 1])
  const unlocked = recipes.filter((r) => r.unlockAtMs <= elapsedMs)
  return unlocked[pickInt(rng, 0, unlocked.length - 1)]
}

function spawn(state, recipes, rng) {
  let { orders, orderQueue: queue } = state
  const { elapsedMs } = state
  const { config } = queue
  const recipe = pickRecipe(queue, elapsedMs, recipes, rng)
  const order = {
    id: `order-${queue.nextNumber}`,
    number: queue.nextNumber,
    recipeId: recipe.id,
    points: recipe.points,
    createdAtMs: elapsedMs,
    patienceMs: null,
    remainingMs: null,
  }
  const delay = pickInt(rng, config.spawnIntervalMs.min, config.spawnIntervalMs.max)
  queue = { ...queue, nextSpawnAtMs: queue.nextSpawnAtMs + delay }

  const visible = orders.length < config.maxVisible
  if (!visible && queue.pending.length >= config.maxQueued) {
    // Fila cheia: o cliente não entra; numa sequência fixa, o mesmo pedido volta na próxima chegada.
    return { orders, queue, events: [] }
  }
  const isLast = config.sequence !== null && queue.nextNumber >= config.sequence.length
  queue = { ...queue, nextNumber: queue.nextNumber + 1, nextSpawnAtMs: isLast ? null : queue.nextSpawnAtMs }
  if (visible) orders = [...orders, show(order, config.patienceMs)]
  else queue = { ...queue, pending: [...queue.pending, order] }
  const event = createEvent(CORE_EVENTS.ORDER_CREATED, {
    orderId: order.id,
    number: order.number,
    recipeId: order.recipeId,
    visible,
  })
  return { orders, queue, events: [event] }
}

export function createOrdersSystem({ recipes = RECIPES } = {}) {
  return function ordersSystem(state, { dtMs, rng }) {
    if (!state.orderQueue) return { state, events: [] }
    const events = []
    let orders = state.orders
    let queue = state.orderQueue

    if (queue.config.patienceMs !== null) {
      const kept = []
      for (const order of orders) {
        const remainingMs = Math.max(0, order.remainingMs - dtMs)
        if (remainingMs === 0) {
          events.push(
            createEvent(CORE_EVENTS.ORDER_EXPIRED, outcome({ ...order, remainingMs }, state.elapsedMs)),
          )
        } else {
          kept.push({ ...order, remainingMs })
        }
      }
      ;({ orders, queue } = promote(kept, queue))
    }

    let next = { ...state, orders, orderQueue: queue }
    if (queue.nextSpawnAtMs !== null && state.elapsedMs >= queue.nextSpawnAtMs) {
      const spawned = spawn(next, recipes, rng)
      next = { ...next, orders: spawned.orders, orderQueue: spawned.queue }
      events.push(...spawned.events)
    }
    return { state: next, events }
  }
}

// Chamada pela cena/estações quando um prato chega ao passe (KD-12/KD-18). Pura: não consome rng.
export function deliverDish(state, recipeId) {
  if (!state.orderQueue || state.status !== MATCH_STATUS.RUNNING) {
    return { state, events: [], delivered: false }
  }
  const index = state.orders.findIndex((order) => order.recipeId === recipeId)
  if (index === -1) {
    const event = createEvent(CORE_EVENTS.ORDER_WRONG, { recipeId, elapsedMs: state.elapsedMs })
    return { state, events: [event], delivered: false }
  }
  const order = state.orders[index]
  const remaining = state.orders.filter((_, i) => i !== index)
  const { orders, queue } = promote(remaining, {
    ...state.orderQueue,
    deliveredCount: state.orderQueue.deliveredCount + 1,
  })
  const event = createEvent(CORE_EVENTS.ORDER_DELIVERED, outcome(order, state.elapsedMs))
  return { state: { ...state, orders, orderQueue: queue }, events: [event], delivered: true }
}

export function isSequenceComplete(state) {
  const sequence = state.orderQueue?.config.sequence
  return Boolean(sequence) && state.orderQueue.deliveredCount >= sequence.length
}

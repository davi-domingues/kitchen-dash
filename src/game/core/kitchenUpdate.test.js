import { describe, expect, it } from 'vitest'
import { INGREDIENTS, KITCHENS, RECIPES } from '../../content/index.js'
import { CORE_EVENTS } from './coreEvents.js'
import { consumeAutoActions, selectAutoActions } from './idleSystem.js'
import { createKitchenMatch, createKitchenUpdate, toStationInputs } from './kitchenUpdate.js'
import { MOVE_ACTION } from './movementSystem.js'

const KITCHEN = KITCHENS[0]
const CONTENT = { recipes: RECIPES, ingredients: INGREDIENTS, stoveBurnAfterMs: KITCHEN.stoveBurnAfterMs }
const update = createKitchenUpdate({ kitchen: KITCHEN, content: CONTENT })

const start = (playerCount = 1) =>
  createKitchenMatch({ kitchen: KITCHEN, playerCount, seed: 7, mode: 'free', contentVersion: 'test' })

const chef = (state) => state.chefs[0]
const withChef = (state, overrides) => ({ ...state, chefs: [{ ...chef(state), ...overrides }] })

// Simula a cena: resolve o alvo e roda o update em passos de 100 ms
function play(state, actions = [], ms = 100) {
  let next = update(state, toStationInputs(state, actions), 100).state
  for (let elapsed = 100; elapsed < ms; elapsed += 100) next = update(next, [], 100).state
  return next
}

describe('createKitchenMatch', () => {
  it('cria a partida com chefs nos spawns e estações do mapa', () => {
    const state = start(2)
    expect(state.chefs.map((c) => c.id)).toEqual(['p1', 'p2'])
    expect(state.stations.length).toBeGreaterThan(0)
    expect(state.durationMs).toBeNull()
    expect(state.players).toBe(2)
  })
})

describe('toStationInputs', () => {
  it('resolve a estação à frente e descarta toque no vazio', () => {
    const facingCrate = withChef(start(), { x: 1, y: 2, facing: 'up' })
    expect(toStationInputs(facingCrate, [{ chefId: 'p1', action: 'tap' }])).toEqual([
      { chefId: 'p1', action: 'tap', stationId: 'crate-1-1' },
    ])
    expect(toStationInputs(start(), [{ chefId: 'p1', action: 'holdStart' }])).toEqual([])
  })

  it('mantém holdEnd sem estação', () => {
    expect(toStationInputs(start(), [{ chefId: 'p1', action: 'holdEnd' }])).toEqual([
      { chefId: 'p1', action: 'holdEnd' },
    ])
  })
})

describe('createKitchenUpdate', () => {
  it('move o chef e aplica a ação na mesma partida', () => {
    let state = update(start(), [{ chefId: 'p1', action: MOVE_ACTION, x: -1, y: 0 }], 16).state
    expect(chef(state)).toMatchObject({ x: 2, y: 2 })
    state = withChef(state, { x: 1, y: 2, facing: 'up' })
    state = play(state, [{ chefId: 'p1', action: 'tap' }])
    expect(chef(state).holding).toMatchObject({ type: 'ingredient', ingredientId: 'tomato' })
  })

  it('pega e pica só com toques e segurar', () => {
    let state = withChef(start(), { x: 1, y: 2, facing: 'up' })
    state = play(state, [{ chefId: 'p1', action: 'tap' }])
    state = withChef(state, { x: 2, y: 3, facing: 'left' })
    state = play(state, [{ chefId: 'p1', action: 'tap' }])
    state = play(state, [{ chefId: 'p1', action: 'holdStart' }], 5000)
    state = play(state, [{ chefId: 'p1', action: 'holdEnd' }])
    const board = state.stations.find((s) => s.id === 'cutting-1-3')
    expect(board.item).toMatchObject({ ingredientId: 'tomato', chopped: true })
  })

  it('repassa os eventos do sistema de estações', () => {
    const { events } = update(start(), [{ chefId: 'p1', action: 'tap', stationId: 'pass-5-7' }], 16)
    expect(events.map((e) => e.type)).toEqual([CORE_EVENTS.ACTION_REJECTED])
  })
})

// A cena envia as decisões do core em cada passo; aqui se reproduz esse ciclo sem Phaser
function playAuto(state, ms = 500) {
  let next = state
  const events = []
  for (let elapsed = 0; elapsed < ms; elapsed += 100) {
    const autoActions = selectAutoActions(next)
    const result = update(consumeAutoActions(next, autoActions), autoActions, 100)
    next = result.state
    events.push(...result.events)
  }
  return { state: next, events }
}

const inFrontOf = (state, stationId) => {
  const target = state.stations.find((s) => s.id === stationId)
  return { x: target.x + 1, y: target.y, facing: 'left' }
}

describe('createKitchenUpdate: auto-uso', () => {
  it('pica sozinho com ingrediente cru na tábua', () => {
    let state = start()
    const board = state.stations.find((s) => s.kind === 'cutting')
    state = withChef(state, inFrontOf(state, board.id))
    state = {
      ...state,
      stations: state.stations.map((s) =>
        s.id === board.id
          ? { ...s, item: { type: 'ingredient', ingredientId: 'tomato', chopped: false, chopProgressMs: 0 } }
          : s,
      ),
    }

    const { state: next } = playAuto(state, 2000)

    expect(next.stations.find((s) => s.id === board.id).item.chopped).toBe(true)
    expect(next.chefs[0].workingAt).toBe(board.id)
  })

  it('entrega uma vez no passe, sem aviso de recusa', () => {
    let state = start()
    const pass = state.stations.find((s) => s.kind === 'pass')
    state = withChef(state, {
      ...inFrontOf(state, pass.id),
      holding: { type: 'plate', ingredients: ['tomato'], recipeId: 'salad' },
    })

    const { state: next, events } = playAuto(state, 500)

    expect(next.deliveries).toHaveLength(1)
    expect(events.filter((e) => e.type === CORE_EVENTS.DISH_SERVED)).toHaveLength(1)
    expect(events.filter((e) => e.type === CORE_EVENTS.ACTION_REJECTED)).toHaveLength(0)
  })

  it('não transforma recusa automática em aviso', () => {
    const state = start()
    const pass = state.stations.find((s) => s.kind === 'pass')

    const { events } = update(state, [{ chefId: 'p1', action: 'tap', stationId: pass.id, auto: true }], 100)

    expect(events).toEqual([])
  })

  it('mantém o aviso da ação manual recusada', () => {
    const state = start()
    const pass = state.stations.find((s) => s.kind === 'pass')

    const { events } = update(state, [{ chefId: 'p1', action: 'tap', stationId: pass.id }], 100)

    expect(events.map((e) => e.type)).toEqual([CORE_EVENTS.ACTION_REJECTED])
  })
})

describe('createKitchenUpdate: extraSystems', () => {
  it('roda os sistemas extras depois das estações, na ordem dada', () => {
    const calls = []
    const spy = (name) => (state) => {
      calls.push(name)
      return { state, events: [] }
    }
    const step = createKitchenUpdate({
      kitchen: KITCHEN,
      content: CONTENT,
      extraSystems: [spy('a'), spy('b')],
    })

    step(start(), [], 100)

    expect(calls).toEqual(['a', 'b'])
  })

  it('o sistema extra enxerga as entregas que as estações gravaram no mesmo passo', () => {
    let seen = null
    const probe = (state) => {
      seen = state.deliveries
      return { state, events: [] }
    }
    const step = createKitchenUpdate({ kitchen: KITCHEN, content: CONTENT, extraSystems: [probe] })
    const state = { ...start(), deliveries: [{ chefId: 'p1', recipeId: 'salad' }] }

    step(state, [], 100)

    expect(seen).toEqual([{ chefId: 'p1', recipeId: 'salad' }])
  })
})

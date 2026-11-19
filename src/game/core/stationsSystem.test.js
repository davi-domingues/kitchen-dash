import { describe, expect, it } from 'vitest'
import { INGREDIENTS, KITCHENS, RECIPES } from '../../content/index.js'
import { CORE_EVENTS } from './coreEvents.js'
import { createMatchState } from './matchState.js'
import { createChef, createStations } from './stations.js'
import { createStationsSystem } from './stationsSystem.js'
import { createUpdate } from './update.js'

const KITCHEN = KITCHENS[0]
const CONTENT = { recipes: RECIPES, ingredients: INGREDIENTS, stoveBurnAfterMs: KITCHEN.stoveBurnAfterMs }

function start() {
  const state = createMatchState({
    seed: 7,
    mode: 'free',
    contentVersion: 'test',
    chefs: [createChef('p1'), createChef('p2')],
    stations: createStations(KITCHEN),
  })
  return { state, update: createUpdate([createStationsSystem(CONTENT)]) }
}

const stationId = (state, kind, ingredientId) =>
  state.stations.find((s) => s.kind === kind && (!ingredientId || s.ingredientId === ingredientId)).id

// Avança em passos de 100 ms (abaixo do MAX_DT_MS) acumulando os eventos
function run(update, state, ms, inputs = []) {
  let next = state
  const events = []
  for (let elapsed = 0; elapsed < ms; elapsed += 100) {
    const result = update(next, elapsed === 0 ? inputs : [], 100)
    next = result.state
    events.push(...result.events)
  }
  return { state: next, events }
}

const tap = (stationIdValue, chefId = 'p1') => ({ chefId, action: 'tap', stationId: stationIdValue })

function chop(update, state, ingredientId) {
  const cutting = stationId(state, 'cutting')
  let { state: next } = run(update, state, 100, [
    tap(stationId(state, 'crate', ingredientId)),
    tap(cutting),
    { chefId: 'p1', action: 'holdStart', stationId: cutting },
  ])
  const chopMs = INGREDIENTS.find((i) => i.id === ingredientId).chopMs
  next = run(update, next, chopMs).state
  return run(update, next, 100, [tap(cutting), { chefId: 'p1', action: 'holdEnd' }]).state
}

describe('stationsSystem', () => {
  it('pica só enquanto o chef segura, retomando o progresso', () => {
    const { state, update } = start()
    const cutting = stationId(state, 'cutting')
    let result = run(update, state, 500, [
      tap(stationId(state, 'crate', 'tomato')),
      tap(cutting),
      { chefId: 'p1', action: 'holdStart', stationId: cutting },
    ])
    result = run(update, result.state, 1000, [{ chefId: 'p1', action: 'holdEnd' }])
    const item = result.state.stations.find((s) => s.id === cutting).item
    expect(item).toMatchObject({ chopped: false, chopProgressMs: 500 })

    result = run(update, result.state, 1000, [{ chefId: 'p1', action: 'holdStart', stationId: cutting }])
    expect(result.events).toEqual([
      { type: CORE_EVENTS.INGREDIENT_CHOPPED, payload: { stationId: cutting, ingredientId: 'tomato' } },
    ])
  })

  it('segurar fora da tábua equivale a um toque', () => {
    const { state, update } = start()
    const crate = stationId(state, 'crate', 'bread')
    const { state: next } = update(state, [{ chefId: 'p1', action: 'holdStart', stationId: crate }], 16)
    expect(next.chefs[0].holding.ingredientId).toBe('bread')
  })

  it('cozinha e depois queima a panela', () => {
    let { state, update } = start()
    const stove = stationId(state, 'stove')
    for (let i = 0; i < 3; i += 1) {
      state = chop(update, state, 'tomato')
      state = run(update, state, 100, [tap(stove)]).state
    }
    let result = run(update, state, 6000)
    expect(result.events.map((e) => e.type)).toEqual([CORE_EVENTS.POT_COOKED])
    result = run(update, result.state, 6000)
    expect(result.events).toEqual([{ type: CORE_EVENTS.POT_BURNT, payload: { stationId: stove } }])
  })

  it('ação desconhecida é erro de programação', () => {
    const { state, update } = start()
    expect(() => update(state, [{ chefId: 'p1', action: 'jump' }], 16)).toThrow('ação desconhecida')
    expect(() => update(state, [{ chefId: 'p9', action: 'holdEnd' }], 16)).toThrow('chef desconhecido')
  })

  it.each(RECIPES.map((r) => [r.id, r]))('prepara e entrega %s com o conteúdo real', (id, recipe) => {
    let { state, update } = start()
    const counter = stationId(state, 'counter')
    const stove = stationId(state, 'stove')
    if (recipe.container === 'plate') {
      state = run(update, state, 100, [tap(stationId(state, 'plates')), tap(counter)]).state
      for (const ingredient of recipe.ingredients) {
        state = chop(update, state, ingredient)
        state = run(update, state, 100, [tap(counter)]).state
      }
      state = run(update, state, 100, [tap(counter)]).state
    } else {
      for (const ingredient of recipe.ingredients) {
        state = chop(update, state, ingredient)
        state = run(update, state, 100, [tap(stove)]).state
      }
      state = run(update, state, recipe.cookMs).state
      state = run(update, state, 100, [tap(stationId(state, 'plates')), tap(stove)]).state
    }
    const { state: done, events } = run(update, state, 100, [tap(stationId(state, 'pass'))])
    expect(done.deliveries).toEqual([{ chefId: 'p1', recipeId: id }])
    expect(events).toContainEqual({ type: CORE_EVENTS.DISH_SERVED, payload: { chefId: 'p1', recipeId: id } })
  })

  it('é determinístico para as mesmas entradas', () => {
    const a = chop(start().update, start().state, 'cheese')
    const b = chop(start().update, start().state, 'cheese')
    expect(a).toEqual(b)
  })
})

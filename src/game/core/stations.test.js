import { describe, expect, it } from 'vitest'
import { CORE_EVENTS } from './coreEvents.js'
import { createIngredient, createPlate } from './items.js'
import { createMatchState } from './matchState.js'
import { POT_STATUS, STATION_KINDS, canInteract, createChef, createStations, interact } from './stations.js'

const KITCHEN = {
  tiles: ['#TKSAPXH.'],
  legend: {
    '#': { kind: 'wall' },
    '.': { kind: 'floor' },
    T: { kind: 'crate', ingredient: 'tomato' },
    K: { kind: 'cutting' },
    S: { kind: 'stove' },
    A: { kind: 'counter' },
    P: { kind: 'plates' },
    X: { kind: 'trash' },
    H: { kind: 'pass' },
  },
}
const CONTENT = {
  recipes: [
    { id: 'salad', container: 'plate', ingredients: ['lettuce', 'tomato'], cookMs: 0 },
    { id: 'soup', container: 'pot', ingredients: ['tomato', 'tomato', 'tomato'], cookMs: 100 },
  ],
}
const ID = {
  crate: 'crate-1-0',
  cutting: 'cutting-2-0',
  stove: 'stove-3-0',
  counter: 'counter-4-0',
  plates: 'plates-5-0',
  trash: 'trash-6-0',
  pass: 'pass-7-0',
}

const chopped = (id) => ({ ...createIngredient(id), chopped: true })

function setup({ holding = null, station = {} } = {}) {
  const state = createMatchState({
    seed: 1,
    mode: 'classic',
    contentVersion: 'test',
    chefs: [{ ...createChef('p1'), holding }, createChef('p2')],
    stations: createStations(KITCHEN),
  })
  const stations = state.stations.map((s) => (station[s.id] ? { ...s, ...station[s.id] } : s))
  return { ...state, stations }
}

const tap = (state, stationId) => interact(state, CONTENT, 'p1', stationId)
const chefOf = (state) => state.chefs[0]
const stationOf = (state, id) => state.stations.find((s) => s.id === id)

describe('createStations', () => {
  it('cria só estações, com caixa e panela, a partir do mapa', () => {
    const stations = createStations(KITCHEN)
    expect(stations.map((s) => s.kind)).toEqual(Object.values(STATION_KINDS))
    expect(stations[0]).toMatchObject({ id: ID.crate, ingredientId: 'tomato', x: 1, y: 0 })
    expect(stations[2].pot).toEqual({ ingredients: [], status: 'empty', timerMs: 0, recipeId: null })
  })
})

describe('interact', () => {
  it('caixa e pilha entregam itens só de mãos vazias', () => {
    expect(chefOf(tap(setup(), ID.crate).state).holding).toEqual(createIngredient('tomato'))
    expect(chefOf(tap(setup(), ID.plates).state).holding).toEqual(createPlate())
    const full = setup({ holding: createPlate() })
    expect(tap(full, ID.crate).state).toBe(full)
    expect(tap(full, ID.plates).events[0].type).toBe(CORE_EVENTS.ACTION_REJECTED)
  })

  it('tábua aceita só cru e devolve o item ao pegar, parando quem picava', () => {
    const placed = tap(setup({ holding: createIngredient('tomato') }), ID.cutting).state
    expect(stationOf(placed, ID.cutting).item).toEqual(createIngredient('tomato'))
    const working = {
      ...placed,
      chefs: placed.chefs.map((c) => (c.id === 'p2' ? { ...c, workingAt: ID.cutting } : c)),
    }
    const picked = tap(working, ID.cutting).state
    expect(chefOf(picked).holding.ingredientId).toBe('tomato')
    expect(picked.chefs[1].workingAt).toBeNull()
    expect(tap(setup({ holding: chopped('tomato') }), ID.cutting).events).toHaveLength(1)
  })

  it('balcão guarda, devolve e monta prato nos dois sentidos', () => {
    const placed = tap(setup({ holding: createPlate() }), ID.counter).state
    expect(chefOf(tap(placed, ID.counter).state).holding).toEqual(createPlate())

    const onPlate = tap(
      setup({ holding: chopped('lettuce'), station: { [ID.counter]: { item: createPlate() } } }),
      ID.counter,
    ).state
    expect(stationOf(onPlate, ID.counter).item.ingredients).toEqual(['lettuce'])

    const inHand = tap(
      setup({
        holding: { ...createPlate(), ingredients: ['lettuce'] },
        station: { [ID.counter]: { item: chopped('tomato') } },
      }),
      ID.counter,
    ).state
    expect(chefOf(inHand).holding).toMatchObject({ recipeId: 'salad' })
    expect(stationOf(inHand, ID.counter).item).toBeNull()
  })

  it('balcão recusa combinação sem receita', () => {
    const state = setup({
      holding: chopped('tomato'),
      station: { [ID.counter]: { item: chopped('lettuce') } },
    })
    expect(tap(state, ID.counter).events[0].type).toBe(CORE_EVENTS.ACTION_REJECTED)
    const raw = setup({
      holding: createIngredient('tomato'),
      station: { [ID.counter]: { item: createPlate() } },
    })
    expect(tap(raw, ID.counter).state).toBe(raw)
  })

  it('panela enche, começa a cozinhar com a receita completa e recusa o resto', () => {
    let state = setup({
      station: {
        [ID.stove]: {
          pot: { ingredients: ['tomato', 'tomato'], status: POT_STATUS.FILLING, timerMs: 0, recipeId: null },
        },
      },
    })
    state = { ...state, chefs: [{ ...createChef('p1'), holding: chopped('tomato') }, createChef('p2')] }
    const cooking = tap(state, ID.stove).state
    expect(stationOf(cooking, ID.stove).pot).toMatchObject({ status: 'cooking', recipeId: 'soup' })
    expect(tap(setup({ holding: chopped('lettuce') }), ID.stove).events).toHaveLength(1)
  })

  it('serve panela pronta num prato vazio e limpa panela queimada', () => {
    const done = {
      ingredients: ['tomato', 'tomato', 'tomato'],
      status: POT_STATUS.DONE,
      timerMs: 0,
      recipeId: 'soup',
    }
    const served = tap(
      setup({ holding: createPlate(), station: { [ID.stove]: { pot: done } } }),
      ID.stove,
    ).state
    expect(chefOf(served).holding).toMatchObject({ recipeId: 'soup' })
    expect(stationOf(served, ID.stove).pot.status).toBe('empty')

    const burnt = { ...done, status: POT_STATUS.BURNT, recipeId: null, ingredients: [] }
    const cleaned = tap(setup({ station: { [ID.stove]: { pot: burnt } } }), ID.stove).state
    expect(stationOf(cleaned, ID.stove).pot.status).toBe('empty')
  })

  it('lixeira descarta ingrediente e esvazia prato', () => {
    expect(chefOf(tap(setup({ holding: chopped('tomato') }), ID.trash).state).holding).toBeNull()
    const plate = { ...createPlate(), ingredients: ['tomato'] }
    expect(chefOf(tap(setup({ holding: plate }), ID.trash).state).holding).toEqual(createPlate())
    expect(tap(setup({ holding: createPlate() }), ID.trash).events).toHaveLength(1)
  })

  it('passe aceita só prato pronto e registra a entrega', () => {
    const ready = { type: 'plate', ingredients: ['lettuce', 'tomato'], recipeId: 'salad' }
    const { state, events } = tap(setup({ holding: ready }), ID.pass)
    expect(chefOf(state).holding).toBeNull()
    expect(state.deliveries).toEqual([{ chefId: 'p1', recipeId: 'salad' }])
    expect(events).toEqual([{ type: CORE_EVENTS.DISH_SERVED, payload: { chefId: 'p1', recipeId: 'salad' } }])
    expect(tap(setup({ holding: createPlate() }), ID.pass).events[0].type).toBe(CORE_EVENTS.ACTION_REJECTED)
  })

  it('canInteract antecipa o resultado e ids desconhecidos lançam erro', () => {
    expect(canInteract(setup(), CONTENT, 'p1', ID.crate)).toBe(true)
    expect(canInteract(setup(), CONTENT, 'p1', ID.pass)).toBe(false)
    expect(() => tap(setup(), 'nope')).toThrow('station desconhecido')
    expect(() => interact(setup(), CONTENT, 'p9', ID.crate)).toThrow('chef desconhecido')
  })
})

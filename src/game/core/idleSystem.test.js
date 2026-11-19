import { describe, expect, it } from 'vitest'
import { RECIPES } from '../../content/index.js'
import { POT_STATUS, STATION_KINDS } from './stations.js'
import {
  IDLE_AUTO_MS,
  consumeAutoActions,
  createIdleSystem,
  filterManualDuplicates,
  selectAutoActions,
  setIdleBlocked,
} from './idleSystem.js'
import { MOVE_ACTION } from './movementSystem.js'

const CONTENT = { recipes: RECIPES }
const system = createIdleSystem(CONTENT)

const chef = (overrides = {}) => ({
  id: 'p1',
  holding: null,
  workingAt: null,
  x: 0,
  y: 0,
  facing: 'right',
  stepCooldownMs: 0,
  idleMs: 0,
  idleKey: null,
  autoAction: null,
  autoFired: null,
  ...overrides,
})

const station = (id, kind, overrides = {}) => ({ id, kind, x: 1, y: 0, item: null, ...overrides })

const makeState = (chefs, stations, extra = {}) => ({ chefs, stations, idleBlocked: false, ...extra })

const step = (state, dtMs = 100, inputs = []) => system(state, { dtMs, inputs }).state

const advance = (state, frames, dtMs = 100, inputs = []) => {
  let next = state
  for (let index = 0; index < frames; index += 1) next = step(next, dtMs, inputs)
  return next
}

const rawTomato = () => ({ type: 'ingredient', ingredientId: 'tomato', chopped: false, chopProgressMs: 0 })
const emptyPlate = () => ({ type: 'plate', ingredients: [], recipeId: null })
const readyPlate = () => ({ type: 'plate', ingredients: ['tomato'], recipeId: 'salad' })

describe('tempo parado', () => {
  it('acumula apenas passos em que o chef não move nem age', () => {
    const state = makeState([chef()], [station('crate-1-0', STATION_KINDS.CRATE)])

    expect(advance(state, 2).chefs[0].idleMs).toBe(200)
    expect(step(state, 100, [{ chefId: 'p1', action: MOVE_ACTION, x: 1, y: 0 }]).chefs[0].idleMs).toBe(0)
    expect(step(state, 100, [{ chefId: 'p1', action: 'tap' }]).chefs[0].idleMs).toBe(0)
  })

  it('reinicia quando o alvo muda sem sair do lugar', () => {
    const stations = [
      station('crate-1-0', STATION_KINDS.CRATE),
      station('crate-0--1', STATION_KINDS.CRATE, { x: 0, y: -1 }),
    ]
    const settled = advance(makeState([chef()], stations), 2)
    expect(settled.chefs[0].idleMs).toBe(200)

    const turned = { ...settled, chefs: [{ ...settled.chefs[0], facing: 'up' }] }
    expect(step(turned, 100).chefs[0].idleMs).toBe(0)
  })

  it('não dispara antes do limiar de 250 ms', () => {
    expect(IDLE_AUTO_MS).toBe(250)
    const state = makeState([chef()], [station('cutting-1-0', STATION_KINDS.CUTTING, { item: rawTomato() })])

    expect(selectAutoActions(advance(state, 2))).toEqual([])
  })
})

describe('auto-uso na tábua', () => {
  it('envia holdStart contínuo com item cru e para quando o chef move', () => {
    const board = station('cutting-1-0', STATION_KINDS.CUTTING, { item: rawTomato() })
    const ready = advance(makeState([chef()], [board]), 3)

    expect(selectAutoActions(ready)).toEqual([
      { chefId: 'p1', action: 'holdStart', stationId: 'cutting-1-0', auto: true },
    ])

    const moving = step(ready, 100, [{ chefId: 'p1', action: MOVE_ACTION, x: 1, y: 0 }])
    expect(selectAutoActions(moving)).toEqual([])
  })

  it('não envia holdStart com tábua vazia, item picado ou chef segurando algo', () => {
    const boards = [
      station('cutting-1-0', STATION_KINDS.CUTTING),
      station('cutting-1-0', STATION_KINDS.CUTTING, { item: { ...rawTomato(), chopped: true } }),
    ]
    boards.forEach((board) => {
      expect(selectAutoActions(advance(makeState([chef()], [board]), 3))).toEqual([])
    })

    const holding = chef({ holding: rawTomato() })
    expect(
      selectAutoActions(advance(makeState([holding], [station('cutting-1-0', STATION_KINDS.CUTTING)]), 3)),
    ).toEqual([])
  })
})

describe('auto-uso no fogão e no passe', () => {
  it('envia um único tap quando a ação daria certo', () => {
    const cases = [
      {
        cook: chef({ holding: readyPlate() }),
        target: station('pass-1-0', STATION_KINDS.PASS),
      },
      {
        cook: chef({ holding: emptyPlate() }),
        target: station('stove-1-0', STATION_KINDS.STOVE, {
          pot: { ingredients: ['tomato'], status: POT_STATUS.DONE, timerMs: 0, recipeId: 'salad' },
        }),
      },
    ]

    cases.forEach(({ cook, target }) => {
      const ready = advance(makeState([cook], [target]), 3)
      expect(selectAutoActions(ready)).toEqual([
        { chefId: 'p1', action: 'tap', stationId: target.id, auto: true },
      ])
      expect(selectAutoActions(step(ready))).toEqual([])
    })
  })

  it('não envia tap nem aviso quando a ação não daria certo', () => {
    const state = makeState(
      [chef()],
      [station('pass-1-0', STATION_KINDS.PASS), station('stove-0--1', STATION_KINDS.STOVE, { x: 0, y: -1 })],
    )

    const result = advance(state, 10)
    expect(selectAutoActions(result)).toEqual([])
    expect(result.chefs[0].autoFired).toBeNull()
  })

  it('permite novo tap quando a estação muda de estado', () => {
    const pot = { ingredients: ['tomato'], status: POT_STATUS.DONE, timerMs: 0, recipeId: 'salad' }
    const target = station('stove-1-0', STATION_KINDS.STOVE, { pot })
    const state = makeState([chef({ holding: emptyPlate() })], [target])
    const fired = advance(state, 3)
    expect(selectAutoActions(fired)).toHaveLength(1)

    const emptied = { ...fired, stations: [{ ...target, pot: { ...pot, status: POT_STATUS.EMPTY } }] }
    const cleared = step(emptied)
    expect(selectAutoActions(cleared)).toEqual([])

    const restored = { ...cleared, stations: [{ ...target, pot }] }
    expect(selectAutoActions(step(restored))).toEqual([
      { chefId: 'p1', action: 'tap', stationId: 'stove-1-0', auto: true },
    ])
  })
})

describe('prevalência do botão', () => {
  it('remove o toque manual duplicado na estação já disparada', () => {
    const fired = advance(
      makeState([chef({ holding: readyPlate() })], [station('pass-1-0', STATION_KINDS.PASS)]),
      3,
    )

    expect(filterManualDuplicates(fired, [{ chefId: 'p1', action: 'tap' }])).toEqual([])
    expect(filterManualDuplicates(fired, [{ chefId: 'p2', action: 'tap' }])).toEqual([
      { chefId: 'p2', action: 'tap' },
    ])
  })

  it('libera o botão quando o estado da estação muda', () => {
    const fired = advance(
      makeState([chef({ holding: readyPlate() })], [station('pass-1-0', STATION_KINDS.PASS)]),
      3,
    )
    const tap = [{ chefId: 'p1', action: 'tap' }]
    expect(filterManualDuplicates(fired, tap)).toEqual([])

    const changed = {
      ...fired,
      stations: [
        { ...fired.stations[0], item: { type: 'plate', ingredients: ['tomato'], recipeId: 'salad' } },
      ],
    }
    expect(filterManualDuplicates(changed, tap)).toEqual(tap)
  })

  it('consome a decisão para não reenviar a mesma ação', () => {
    const fired = advance(
      makeState([chef({ holding: readyPlate() })], [station('pass-1-0', STATION_KINDS.PASS)]),
      3,
    )
    const actions = selectAutoActions(fired)
    expect(actions).toHaveLength(1)

    const consumed = consumeAutoActions(fired, actions)
    expect(selectAutoActions(consumed)).toEqual([])
    expect(selectAutoActions(step(consumed))).toEqual([])
  })

  it('não envia auto-uso no mesmo frame em que há ação manual', () => {
    const state = makeState(
      [chef(), chef({ id: 'p2', x: 5, y: 5 })],
      [station('cutting-1-0', STATION_KINDS.CUTTING, { item: rawTomato() })],
    )
    const ready = advance(state, 3)

    expect(selectAutoActions(ready, [{ chefId: 'p1', action: 'tap' }])).toEqual([])
    expect(selectAutoActions(ready, [{ chefId: 'p2', action: 'tap' }])).toHaveLength(1)
  })
})

describe('determinismo e bloqueio', () => {
  it('mantém chefs independentes e reproduz a mesma decisão', () => {
    const state = makeState(
      [chef(), chef({ id: 'p2', x: 5, y: 5 })],
      [
        station('cutting-1-0', STATION_KINDS.CUTTING, { item: rawTomato() }),
        station('cutting-6-5', STATION_KINDS.CUTTING, { x: 6, y: 5, item: rawTomato() }),
      ],
    )

    const first = advance(state, 3)
    const second = advance(state, 3)

    expect(first).toEqual(second)
    expect(selectAutoActions(first).map((action) => action.chefId)).toEqual(['p1', 'p2'])
  })

  it('congela a regra enquanto bloqueado e retoma sem ação herdada', () => {
    const state = makeState([chef()], [station('cutting-1-0', STATION_KINDS.CUTTING, { item: rawTomato() })])
    const blocked = setIdleBlocked(state, true)
    const afterBlocked = advance(blocked, 5)

    expect(afterBlocked.chefs[0].idleMs).toBe(0)
    expect(selectAutoActions(afterBlocked)).toEqual([])

    const resumed = setIdleBlocked(afterBlocked, false)
    expect(selectAutoActions(resumed)).toEqual([])
    expect(selectAutoActions(advance(resumed, 3))).toHaveLength(1)
  })
})

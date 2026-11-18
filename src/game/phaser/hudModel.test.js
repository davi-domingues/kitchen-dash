import { describe, expect, it } from 'vitest'
import { createMatch } from '../core/match.js'
import { PATIENCE_BANDS, buildHudModel, formatClock, patienceBand } from './hudModel.js'

const order = (overrides) => ({
  id: 'o1',
  number: 1,
  recipeId: 'salad',
  patienceMs: 60000,
  remainingMs: 60000,
  ...overrides,
})
const state = (overrides = {}) => ({
  mode: 'classic',
  score: 0,
  durationMs: 180000,
  elapsedMs: 0,
  orders: [],
  orderQueue: { pending: [] },
  ...overrides,
})

describe('formatClock', () => {
  it.each([
    [0, '0:00'],
    [999, '0:01'],
    [1000, '0:01'],
    [59001, '1:00'],
    [180000, '3:00'],
    [605000, '10:05'],
    [-500, '0:00'],
  ])('%i ms → %s', (ms, text) => {
    expect(formatClock(ms)).toBe(text)
  })
})

describe('patienceBand', () => {
  it.each([
    [1, PATIENCE_BANDS.OK],
    [0.51, PATIENCE_BANDS.OK],
    [0.5, PATIENCE_BANDS.WARN],
    [0.26, PATIENCE_BANDS.WARN],
    [0.25, PATIENCE_BANDS.DANGER],
    [0, PATIENCE_BANDS.DANGER],
    [null, null],
  ])('%s → %s', (fraction, band) => {
    expect(patienceBand(fraction)).toBe(band)
  })
})

describe('buildHudModel', () => {
  it('no Clássico mostra o tempo restante', () => {
    expect(buildHudModel(state({ elapsedMs: 60000 })).clock).toEqual({ kind: 'remaining', text: '2:00' })
  })

  it('sem duração mostra o tempo decorrido', () => {
    expect(buildHudModel(state({ durationMs: null, elapsedMs: 65000 })).clock).toEqual({
      kind: 'elapsed',
      text: '1:05',
    })
  })

  it('converte comandas com fração e faixa de paciência', () => {
    const model = buildHudModel(state({ orders: [order({ remainingMs: 15000 })] }))
    expect(model.orders).toEqual([{ id: 'o1', number: 1, recipeId: 'salad', fraction: 0.25, band: 'danger' }])
  })

  it('comanda sem paciência fica sem barra', () => {
    const model = buildHudModel(state({ orders: [order({ patienceMs: null, remainingMs: null })] }))
    expect(model.orders[0]).toMatchObject({ fraction: null, band: null })
  })

  it('limita a fração entre 0 e 1', () => {
    const model = buildHudModel(
      state({ orders: [order({ remainingMs: -10 }), order({ remainingMs: 90000 })] }),
    )
    expect(model.orders.map((o) => o.fraction)).toEqual([0, 1])
  })

  it('expõe placar, fila e o Encerrar só no Livre', () => {
    const classic = buildHudModel(state({ score: 120, orderQueue: { pending: [{}, {}] } }))
    const free = buildHudModel(state({ mode: 'free', durationMs: null }))
    expect(classic).toMatchObject({ score: 120, queued: 2, canEnd: false })
    expect(free).toMatchObject({ queued: 0, canEnd: true })
  })

  it('funciona sobre o estado real montado pelo createMatch', () => {
    const { state: real } = createMatch({ mode: 'challenge', players: 1, seed: 1, contentVersion: 'v-test' })
    expect(buildHudModel(real)).toMatchObject({
      score: 0,
      clock: { kind: 'elapsed', text: '0:00' },
      canEnd: false,
    })
  })
})

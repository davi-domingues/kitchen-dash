import { describe, expect, it } from 'vitest'
import { createIngredient, createPlate } from '../core/items.js'
import { POT_STATUS, STATION_KINDS, createPot } from '../core/stations.js'
import {
  BURNT_ICON,
  ITEM_SHAPES,
  burnDanger,
  chopFraction,
  dashSegments,
  itemVisual,
  stationIcon,
  stoveVisual,
} from './stationVisual.js'

const station = (kind, extra = {}) => ({ id: `${kind}-0-0`, kind, x: 0, y: 0, item: null, ...extra })

describe('stationIcon', () => {
  it('nunca devolve "undefined" para balcão nem para tipo sem ícone (regressão)', () => {
    expect(stationIcon(station(STATION_KINDS.COUNTER))).toBe('')
    expect(stationIcon(station(STATION_KINDS.COUNTER, { item: createIngredient('tomato') }))).toBe('')
    expect(stationIcon(station(STATION_KINDS.STOVE))).toBe('')
    expect(stationIcon(station('desconhecido'))).toBe('')
  })

  it('mostra o ingrediente do caixote e a faca só com a tábua vazia', () => {
    expect(stationIcon(station(STATION_KINDS.CRATE, { ingredientId: 'tomato' }))).toBe('🍅')
    expect(stationIcon(station(STATION_KINDS.CUTTING))).toBe('🔪')
    expect(stationIcon(station(STATION_KINDS.CUTTING, { item: createIngredient('tomato') }))).toBe('')
  })
})

describe('itemVisual', () => {
  it('distingue inteiro, picado e prato', () => {
    const chopped = { ...createIngredient('cheese'), chopped: true }
    const plate = { ...createPlate(), ingredients: ['tomato', 'lettuce'] }

    expect(itemVisual(null)).toEqual({ shape: ITEM_SHAPES.NONE, emojis: [] })
    expect(itemVisual(createIngredient('cheese'))).toEqual({ shape: ITEM_SHAPES.WHOLE, emojis: ['🧀'] })
    expect(itemVisual(chopped)).toEqual({ shape: ITEM_SHAPES.CHOPPED, emojis: ['🧀', '🧀'] })
    expect(itemVisual(plate)).toEqual({ shape: ITEM_SHAPES.PLATE, emojis: ['🍅', '🥬'] })
  })
})

describe('chopFraction', () => {
  it('só tem barra enquanto pica', () => {
    expect(chopFraction(createIngredient('tomato'))).toBeNull()
    expect(chopFraction({ ...createIngredient('tomato'), chopProgressMs: 750 })).toBe(0.5)
    expect(chopFraction({ ...createIngredient('tomato'), chopped: true, chopProgressMs: 1500 })).toBeNull()
  })
})

describe('stoveVisual', () => {
  const timing = { burnAfterMs: 6000, elapsedMs: 0 }
  const cooking = { ingredients: ['tomato', 'tomato', 'tomato'], recipeId: 'tomato_soup' }

  it('panela vazia: boca apagada e sem barras', () => {
    expect(stoveVisual(createPot(), timing)).toEqual({
      lit: false,
      emojis: [],
      cookFraction: null,
      burnFraction: null,
      warning: false,
    })
  })

  it('cozinhando: boca acesa e barra de progresso', () => {
    const view = stoveVisual({ ...cooking, status: POT_STATUS.COOKING, timerMs: 0 }, timing)

    expect(view.lit).toBe(true)
    expect(view.cookFraction).toBe(0)
    expect(view.emojis).toHaveLength(3)
  })

  it('pronta: barra de queima esvazia e o aviso pisca no último terço', () => {
    const done = { ...cooking, status: POT_STATUS.DONE }

    const early = stoveVisual({ ...done, timerMs: 1000 }, { burnAfterMs: 6000, elapsedMs: 200 })
    const lateOn = stoveVisual({ ...done, timerMs: 4500 }, { burnAfterMs: 6000, elapsedMs: 200 })
    const lateOff = stoveVisual({ ...done, timerMs: 4500 }, { burnAfterMs: 6000, elapsedMs: 0 })

    expect(early.burnFraction).toBeCloseTo(5 / 6)
    expect(early.warning).toBe(false)
    expect(burnDanger(early.burnFraction)).toBe(false)
    expect(lateOn.warning).toBe(true)
    expect(lateOff.warning).toBe(false)
    expect(burnDanger(lateOn.burnFraction)).toBe(true)
  })

  it('queimada mostra fogo', () => {
    expect(stoveVisual({ ...createPot(), status: POT_STATUS.BURNT }, timing).emojis).toEqual([BURNT_ICON])
  })
})

describe('dashSegments', () => {
  it('percorre as 4 bordas sem passar dos cantos', () => {
    const segments = dashSegments({ x: 0, y: 0, width: 20, height: 20, radius: 5, dash: 4, gap: 2 })

    expect(segments[0]).toEqual([5, 0, 9, 0])
    expect(segments).toHaveLength(8)
    segments.flat().forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(20)
    })
  })
})

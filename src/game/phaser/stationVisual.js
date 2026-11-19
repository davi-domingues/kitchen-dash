// O que cada estação e item mostra, em funções puras: a cena só desenha o resultado (KD-19).
import { getIngredient, getRecipe } from '../../content/index.js'
import { POT_STATUS, STATION_KINDS } from '../core/stations.js'

// Ícone fixo da estação; balcão, fogão e pratos são desenhados, então não têm emoji
const STATION_ICONS = Object.freeze({
  [STATION_KINDS.CUTTING]: '🔪',
  [STATION_KINDS.TRASH]: '🗑️',
  [STATION_KINDS.PASS]: '🛎️',
})

export const BURNT_ICON = '🔥'
export const WARNING_ICON = '⚠️'
// O aviso de queima acende no último terço do tempo, como no protótipo (8 s de 12 s)
const WARNING_FROM = 2 / 3
const BLINK_HZ = 3

/** Emoji fixo da estação; estação sem ícone devolve '' (nunca "undefined"). */
export function stationIcon(station) {
  if (station.kind === STATION_KINDS.CRATE) return getIngredient(station.ingredientId).emoji
  // A faca some quando há algo na tábua, para o item ficar legível
  if (station.kind === STATION_KINDS.CUTTING && station.item) return ''
  return STATION_ICONS[station.kind] ?? ''
}

export const ITEM_SHAPES = Object.freeze({
  NONE: 'none',
  WHOLE: 'whole',
  CHOPPED: 'chopped',
  PLATE: 'plate',
})

/** Forma de fundo e emojis de um item: inteiro, picado (pratinho com 2 emojis) ou prato. */
export function itemVisual(item) {
  if (!item) return { shape: ITEM_SHAPES.NONE, emojis: [] }
  if (item.type === 'ingredient') {
    const { emoji } = getIngredient(item.ingredientId)
    return item.chopped
      ? { shape: ITEM_SHAPES.CHOPPED, emojis: [emoji, emoji] }
      : { shape: ITEM_SHAPES.WHOLE, emojis: [emoji] }
  }
  if (item.recipeId) return { shape: ITEM_SHAPES.PLATE, emojis: [getRecipe(item.recipeId).emoji] }
  return { shape: ITEM_SHAPES.PLATE, emojis: item.ingredients.map((id) => getIngredient(id).emoji) }
}

/** Fração picada de um ingrediente na tábua, ou null quando não há barra a mostrar. */
export function chopFraction(item) {
  if (item?.type !== 'ingredient' || item.chopped || item.chopProgressMs <= 0) return null
  return Math.min(1, item.chopProgressMs / getIngredient(item.ingredientId).chopMs)
}

const blinkOn = (elapsedMs) => Math.floor((elapsedMs / 1000) * BLINK_HZ * 2) % 2 === 1

/**
 * Estado visual do fogão.
 * @param {object} pot panela do core
 * @param {{ burnAfterMs: number, elapsedMs: number }} timing
 */
export function stoveVisual(pot, { burnAfterMs, elapsedMs }) {
  const ingredients = pot.ingredients.map((id) => getIngredient(id).emoji)
  if (pot.status === POT_STATUS.COOKING) {
    const cookFraction = Math.min(1, pot.timerMs / getRecipe(pot.recipeId).cookMs)
    return { lit: true, emojis: ingredients, cookFraction, burnFraction: null, warning: false }
  }
  if (pot.status === POT_STATUS.DONE) {
    const burnt = pot.timerMs / burnAfterMs
    return {
      lit: false,
      emojis: [getRecipe(pot.recipeId).emoji],
      cookFraction: null,
      burnFraction: Math.max(0, 1 - burnt),
      warning: burnt >= WARNING_FROM && blinkOn(elapsedMs),
    }
  }
  const emojis = pot.status === POT_STATUS.BURNT ? [BURNT_ICON] : ingredients
  return { lit: false, emojis, cookFraction: null, burnFraction: null, warning: false }
}

/** Barra de queima fica vermelha a partir do aviso; antes, dourada. */
export const burnDanger = (burnFraction) => burnFraction !== null && burnFraction <= 1 - WARNING_FROM

/**
 * Segmentos tracejados de um retângulo (Phaser 3 não tem line dash).
 * Os cantos ficam livres (raio `radius`) para a cena fechar com arcos.
 * @returns {[number, number, number, number][]} [x1, y1, x2, y2]
 */
export function dashSegments({ x, y, width, height, radius = 0, dash = 6, gap = 4 }) {
  const edges = [
    [x + radius, y, 1, 0, width - 2 * radius],
    [x + width, y + radius, 0, 1, height - 2 * radius],
    [x + width - radius, y + height, -1, 0, width - 2 * radius],
    [x, y + height - radius, 0, -1, height - 2 * radius],
  ]
  return edges.flatMap(([sx, sy, dx, dy, length]) => {
    const segments = []
    for (let start = 0; start < length; start += dash + gap) {
      const end = Math.min(length, start + dash)
      segments.push([sx + dx * start, sy + dy * start, sx + dx * end, sy + dy * end])
    }
    return segments
  })
}

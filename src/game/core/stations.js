// Estações da cozinha e o toque rápido do chef. Puro: devolve cópias, nunca muta o estado.
import { CORE_EVENTS, createEvent } from './coreEvents.js'
import { createIngredient, createPlate, fitsSomeRecipe, matchRecipe } from './items.js'

export const STATION_KINDS = Object.freeze({
  CRATE: 'crate',
  CUTTING: 'cutting',
  STOVE: 'stove',
  COUNTER: 'counter',
  PLATES: 'plates',
  TRASH: 'trash',
  PASS: 'pass',
})

export const POT_STATUS = Object.freeze({
  EMPTY: 'empty',
  FILLING: 'filling',
  COOKING: 'cooking',
  DONE: 'done',
  BURNT: 'burnt',
})

const STATION_KIND_SET = new Set(Object.values(STATION_KINDS))

export const createPot = () => ({
  ingredients: [],
  status: POT_STATUS.EMPTY,
  timerMs: 0,
  recipeId: null,
})

export function createStations(kitchen) {
  const stations = []
  kitchen.tiles.forEach((row, y) => {
    ;[...row].forEach((symbol, x) => {
      const { kind, ingredient } = kitchen.legend[symbol]
      if (!STATION_KIND_SET.has(kind)) return
      const station = { id: `${kind}-${x}-${y}`, kind, x, y, item: null }
      if (kind === STATION_KINDS.CRATE) station.ingredientId = ingredient
      if (kind === STATION_KINDS.STOVE) station.pot = createPot()
      stations.push(station)
    })
  })
  return stations
}

export function createChef(id) {
  return { id, holding: null, workingAt: null }
}

const findOrThrow = (list, id, type) => {
  const found = list.find((entry) => entry.id === id)
  if (!found) throw new Error(`${type} desconhecido: "${id}"`)
  return found
}

const isChopped = (item) => item?.type === 'ingredient' && item.chopped
const isRaw = (item) => item?.type === 'ingredient' && !item.chopped
const isEmptyPlate = (item) => item?.type === 'plate' && item.ingredients.length === 0

// Prato + ingrediente picado compatível → prato atualizado; senão null
function addToPlate(recipes, plate, ingredient) {
  if (plate?.type !== 'plate' || !isChopped(ingredient) || plate.recipeId) return null
  const ingredients = [...plate.ingredients, ingredient.ingredientId]
  if (!fitsSomeRecipe(recipes, 'plate', ingredients)) return null
  return { ...plate, ingredients, recipeId: matchRecipe(recipes, 'plate', ingredients)?.id ?? null }
}

function addToPot(recipes, pot, ingredient) {
  const accepting = pot.status === POT_STATUS.EMPTY || pot.status === POT_STATUS.FILLING
  if (!accepting || !isChopped(ingredient)) return null
  const ingredients = [...pot.ingredients, ingredient.ingredientId]
  if (!fitsSomeRecipe(recipes, 'pot', ingredients)) return null
  const recipe = matchRecipe(recipes, 'pot', ingredients)
  return recipe
    ? { ingredients, status: POT_STATUS.COOKING, timerMs: 0, recipeId: recipe.id }
    : { ...pot, ingredients, status: POT_STATUS.FILLING }
}

// Resolve o toque: `{ holding, station, delivery }` do resultado, ou null se a ação não daria certo
function resolveTap(recipes, holding, station) {
  switch (station.kind) {
    case STATION_KINDS.CRATE:
      return holding ? null : { holding: createIngredient(station.ingredientId), station }
    case STATION_KINDS.PLATES:
      return holding ? null : { holding: createPlate(), station }
    case STATION_KINDS.CUTTING:
      if (!holding && station.item) return { holding: station.item, station: { ...station, item: null } }
      if (isRaw(holding) && !station.item) return { holding: null, station: { ...station, item: holding } }
      return null
    case STATION_KINDS.COUNTER: {
      if (!holding && station.item) return { holding: station.item, station: { ...station, item: null } }
      if (holding && !station.item) return { holding: null, station: { ...station, item: holding } }
      const onCounter = addToPlate(recipes, station.item, holding)
      if (onCounter) return { holding: null, station: { ...station, item: onCounter } }
      const inHand = addToPlate(recipes, holding, station.item)
      return inHand ? { holding: inHand, station: { ...station, item: null } } : null
    }
    case STATION_KINDS.STOVE: {
      const { pot } = station
      if (!holding && pot.status === POT_STATUS.BURNT)
        return { holding, station: { ...station, pot: createPot() } }
      if (isEmptyPlate(holding) && pot.status === POT_STATUS.DONE) {
        const plate = { ...holding, ingredients: pot.ingredients, recipeId: pot.recipeId }
        return { holding: plate, station: { ...station, pot: createPot() } }
      }
      const nextPot = addToPot(recipes, pot, holding)
      return nextPot ? { holding: null, station: { ...station, pot: nextPot } } : null
    }
    case STATION_KINDS.TRASH:
      if (holding?.type === 'ingredient') return { holding: null, station }
      if (holding?.type === 'plate' && !isEmptyPlate(holding)) return { holding: createPlate(), station }
      return null
    case STATION_KINDS.PASS:
      return holding?.type === 'plate' && holding.recipeId
        ? { holding: null, station, delivery: holding.recipeId }
        : null
    default:
      return null
  }
}

export function canInteract(state, content, chefId, stationId) {
  const chef = findOrThrow(state.chefs, chefId, 'chef')
  const station = findOrThrow(state.stations, stationId, 'station')
  return resolveTap(content.recipes, chef.holding, station) !== null
}

export function interact(state, content, chefId, stationId) {
  const chef = findOrThrow(state.chefs, chefId, 'chef')
  const station = findOrThrow(state.stations, stationId, 'station')
  const result = resolveTap(content.recipes, chef.holding, station)
  if (!result) {
    return { state, events: [createEvent(CORE_EVENTS.ACTION_REJECTED, { chefId, stationId })] }
  }
  const leftCutting = station.kind === STATION_KINDS.CUTTING && !result.station.item
  const chefs = state.chefs.map((c) => {
    if (c.id === chefId) return { ...c, holding: result.holding }
    // Tirar o ingrediente da tábua interrompe quem estava picando nela
    return leftCutting && c.workingAt === stationId ? { ...c, workingAt: null } : c
  })
  const stations = state.stations.map((s) => (s.id === stationId ? result.station : s))
  const next = { ...state, chefs, stations }
  if (!result.delivery) return { state: next, events: [] }
  const delivery = { chefId, recipeId: result.delivery }
  return {
    state: { ...next, deliveries: [...state.deliveries, delivery] },
    events: [createEvent(CORE_EVENTS.DISH_SERVED, delivery)],
  }
}

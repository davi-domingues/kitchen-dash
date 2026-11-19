// Sistema de estações (contrato do KD-11): aplica as ações dos chefs e avança corte e fogão.
import { CORE_EVENTS, createEvent } from './coreEvents.js'
import { POT_STATUS, STATION_KINDS, createPot, interact } from './stations.js'

export const STATION_ACTIONS = Object.freeze({
  TAP: 'tap',
  HOLD_START: 'holdStart',
  HOLD_END: 'holdEnd',
})

function setWorkingAt(state, chefId, stationId) {
  if (!state.chefs.some((c) => c.id === chefId)) throw new Error(`chef desconhecido: "${chefId}"`)
  const chefs = state.chefs.map((c) => (c.id === chefId ? { ...c, workingAt: stationId } : c))
  return { ...state, chefs }
}

function applyInput(state, content, { chefId, action, stationId }) {
  switch (action) {
    case STATION_ACTIONS.TAP:
      return interact(state, content, chefId, stationId)
    case STATION_ACTIONS.HOLD_START: {
      const station = state.stations.find((s) => s.id === stationId)
      // Segurar só tem efeito na tábua; em outra estação equivale a um toque (PRD: ação única)
      if (station?.kind !== STATION_KINDS.CUTTING) return interact(state, content, chefId, stationId)
      return { state: setWorkingAt(state, chefId, stationId), events: [] }
    }
    case STATION_ACTIONS.HOLD_END:
      return { state: setWorkingAt(state, chefId, null), events: [] }
    default:
      throw new Error(`ação desconhecida: "${action}"`)
  }
}

function advanceCutting(station, chefs, chopMsOf, dtMs) {
  const { item } = station
  const working = chefs.some((c) => c.workingAt === station.id && c.holding === null)
  if (!working || item?.type !== 'ingredient' || item.chopped) return { station, events: [] }
  const chopMs = chopMsOf(item.ingredientId)
  const progress = item.chopProgressMs + dtMs
  if (progress < chopMs) {
    return { station: { ...station, item: { ...item, chopProgressMs: progress } }, events: [] }
  }
  return {
    station: { ...station, item: { ...item, chopped: true, chopProgressMs: chopMs } },
    events: [
      createEvent(CORE_EVENTS.INGREDIENT_CHOPPED, {
        stationId: station.id,
        ingredientId: item.ingredientId,
      }),
    ],
  }
}

function advanceStove(station, cookMsOf, burnAfterMs, dtMs) {
  const { pot } = station
  const timerMs = pot.timerMs + dtMs
  if (pot.status === POT_STATUS.COOKING) {
    const cookMs = cookMsOf(pot.recipeId)
    if (timerMs < cookMs) return { station: { ...station, pot: { ...pot, timerMs } }, events: [] }
    return {
      station: { ...station, pot: { ...pot, status: POT_STATUS.DONE, timerMs: timerMs - cookMs } },
      events: [createEvent(CORE_EVENTS.POT_COOKED, { stationId: station.id, recipeId: pot.recipeId })],
    }
  }
  if (pot.status === POT_STATUS.DONE) {
    if (timerMs < burnAfterMs) return { station: { ...station, pot: { ...pot, timerMs } }, events: [] }
    return {
      station: { ...station, pot: { ...createPot(), status: POT_STATUS.BURNT } },
      events: [createEvent(CORE_EVENTS.POT_BURNT, { stationId: station.id })],
    }
  }
  return { station, events: [] }
}

// content = { recipes, ingredients, stoveBurnAfterMs }, injetado para o core não depender do loader
export function createStationsSystem(content) {
  const chopMs = new Map(content.ingredients.map((i) => [i.id, i.chopMs]))
  const cookMs = new Map(content.recipes.map((r) => [r.id, r.cookMs]))
  const chopMsOf = (id) => chopMs.get(id)
  const cookMsOf = (id) => cookMs.get(id)

  return function stationsSystem(state, { dtMs, inputs = [] }) {
    let next = state
    const events = []
    for (const input of inputs) {
      const result = applyInput(next, content, input)
      next = result.state
      events.push(...result.events)
    }

    const stations = next.stations.map((station) => {
      let result = { station, events: [] }
      if (station.kind === STATION_KINDS.CUTTING) {
        result = advanceCutting(station, next.chefs, chopMsOf, dtMs)
      } else if (station.kind === STATION_KINDS.STOVE) {
        result = advanceStove(station, cookMsOf, content.stoveBurnAfterMs, dtMs)
      }
      events.push(...result.events)
      return result.station
    })
    return { state: { ...next, stations }, events }
  }
}

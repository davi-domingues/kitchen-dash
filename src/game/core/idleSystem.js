// Auto-uso de estações (issue #89): tempo parado e decisão derivada só do estado e do dtMs.
// A cena consome `selectAutoActions`; nenhum timer, relógio real ou evento vive aqui.
import { findTargetStation } from './kitchenMap.js'
import { MOVE_ACTION } from './movementSystem.js'
import { canInteract, STATION_KINDS } from './stations.js'
import { STATION_ACTIONS } from './stationsSystem.js'

export const IDLE_AUTO_MS = 250

const STATION_MANUAL_ACTIONS = new Set([
  STATION_ACTIONS.TAP,
  STATION_ACTIONS.HOLD_START,
  STATION_ACTIONS.HOLD_END,
])

const isMove = (input) => input?.action === MOVE_ACTION && (input.x !== 0 || input.y !== 0)
const isManual = (input) => !input?.auto && (isMove(input) || STATION_MANUAL_ACTIONS.has(input?.action))

const idleKeyOf = (chef, station) =>
  `${chef.x},${chef.y},${chef.facing},${station?.id ?? ''},${JSON.stringify(chef.holding)}`

const signatureOf = (chef, station) =>
  JSON.stringify({ holding: chef.holding, item: station.item, pot: station.pot })

const resetChef = (chef) => ({ ...chef, idleMs: 0, idleKey: null, autoAction: null, autoFired: null })

export function setIdleBlocked(state, blocked) {
  return { ...state, idleBlocked: blocked, chefs: state.chefs.map(resetChef) }
}

export function selectAutoActions(state, busyActions = []) {
  const busy = new Set(busyActions.map((action) => action.chefId))
  return state.chefs.map((chef) => chef.autoAction).filter((action) => action && !busy.has(action.chefId))
}

// A cena consome a decisão antes do step: sem isso, a mesma entrada pendente seria reenviada
export function consumeAutoActions(state, actions = []) {
  if (actions.length === 0) return state
  const consumed = new Set(actions.map((action) => action.chefId))
  return {
    ...state,
    chefs: state.chefs.map((chef) => (consumed.has(chef.id) ? { ...chef, autoAction: null } : chef)),
  }
}

export function filterManualDuplicates(state, actions) {
  return actions.filter((action) => {
    if (action.action !== STATION_ACTIONS.TAP && action.action !== STATION_ACTIONS.HOLD_START) return true
    const chef = state.chefs.find((c) => c.id === action.chefId)
    if (!chef?.autoFired) return true
    const target = findTargetStation(state, action.chefId)
    if (target?.id !== chef.autoFired.stationId) return true
    return signatureOf(chef, target) !== chef.autoFired.signature
  })
}

function decide(chef, station, state, content) {
  if (!station) return null

  if (station.kind === STATION_KINDS.CUTTING) {
    const raw = station.item?.type === 'ingredient' && !station.item.chopped
    return chef.holding === null && raw
      ? { chefId: chef.id, action: STATION_ACTIONS.HOLD_START, stationId: station.id, auto: true }
      : null
  }

  if (station.kind === STATION_KINDS.STOVE || station.kind === STATION_KINDS.PASS) {
    return canInteract(state, content, chef.id, station.id)
      ? { chefId: chef.id, action: STATION_ACTIONS.TAP, stationId: station.id, auto: true }
      : null
  }

  return null
}

export function createIdleSystem(content) {
  return function idleSystem(state, { dtMs, inputs = [] }) {
    if (state.idleBlocked) return { state: setIdleBlocked(state, true), events: [] }

    const chefs = state.chefs.map((chef) => {
      const station = findTargetStation(state, chef.id)
      const key = idleKeyOf(chef, station)
      const changed = chef.idleKey != null && chef.idleKey !== key
      const manual = inputs.some((input) => input.chefId === chef.id && isManual(input))
      const restarted = changed || manual

      const idleMs = restarted ? 0 : chef.idleMs + dtMs
      let autoFired = restarted ? null : chef.autoFired
      if (
        autoFired &&
        (autoFired.stationId !== station?.id || autoFired.signature !== signatureOf(chef, station))
      ) {
        autoFired = null
      }

      const autoAction =
        !restarted && idleMs >= IDLE_AUTO_MS && !autoFired ? decide(chef, station, state, content) : null
      if (autoAction) autoFired = { stationId: autoAction.stationId, signature: signatureOf(chef, station) }

      return { ...chef, idleMs, idleKey: key, autoAction, autoFired }
    })

    return { state: { ...state, chefs }, events: [] }
  }
}

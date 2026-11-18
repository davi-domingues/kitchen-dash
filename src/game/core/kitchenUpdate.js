// Monta a partida da cozinha: chefs nos spawns, estações do mapa e o update com movimento +
// estações. Pedidos e pontuação entram como sistemas novos no KD-15.
import { createKitchenChefs, findTargetStation } from './kitchenMap.js'
import { createMatchState } from './matchState.js'
import { MOVE_ACTION, createMovementSystem } from './movementSystem.js'
import { createStations } from './stations.js'
import { STATION_ACTIONS, createStationsSystem } from './stationsSystem.js'
import { createUpdate } from './update.js'

export function createKitchenMatch({ kitchen, playerCount, seed, mode, contentVersion, durationMs = null }) {
  return createMatchState({
    seed,
    mode,
    contentVersion,
    durationMs,
    chefs: createKitchenChefs(kitchen, playerCount),
    stations: createStations(kitchen),
  })
}

export function createKitchenUpdate({ kitchen, content }) {
  const stationsSystem = createStationsSystem(content)
  // O sistema de estações rejeita ação desconhecida, então só recebe as ações dele
  const stationsOnly = (state, context) =>
    stationsSystem(state, { ...context, inputs: context.inputs.filter((i) => i.action !== MOVE_ACTION) })
  return createUpdate([createMovementSystem(kitchen), stationsOnly])
}

/**
 * Resolve a estação alvo de cada ação. `tap`/`holdStart` sem estação à frente são descartados;
 * `holdEnd` segue sem estação (contrato do KD-12).
 * @param {object} state MatchState
 * @param {{chefId: string, action: 'tap'|'holdStart'|'holdEnd'}[]} actions
 */
export function toStationInputs(state, actions) {
  return actions.flatMap(({ chefId, action }) => {
    if (action === STATION_ACTIONS.HOLD_END) return [{ chefId, action }]
    const target = findTargetStation(state, chefId)
    return target ? [{ chefId, action, stationId: target.id }] : []
  })
}

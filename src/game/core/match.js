// Modos de jogo (KD-15): ponto único em que a cena monta a partida (estado + sistemas) por modo.
import { INGREDIENTS, KITCHENS, RECIPES } from '../../content/index.js'
import { CORE_EVENTS, createEvent } from './coreEvents.js'
import { MATCH_STATUS, createMatchState, matchEndedPayload } from './matchState.js'
import { createOrdersSystem, deliverDish, isSequenceComplete, withOrderQueue } from './orders.js'
import { createRng, pickInt } from './rng.js'
import { withScoreTracking, withScoring } from './scoring.js'
import { createChef, createStations } from './stations.js'
import { createStationsSystem } from './stationsSystem.js'
import { createUpdate } from './update.js'

// Mesmos ids de MATCH_MODES/PLAYER_COUNTS da KD-21 (matchModes.js); a KD-22 unifica as constantes.
const PLAYER_COUNTS = [1, 2]

export const CHALLENGE_LENGTH = 12
// Seed fixa: "Tentar de novo" repete a mesma sequência e os mesmos intervalos de chegada.
export const CHALLENGE_SEED = 20260115

// O intervalo de chegada (13–17 s) é o padrão da KD-13 nos três modos, então o teto da KD-14 vale.
export const MODE_RULES = Object.freeze({
  classic: Object.freeze({
    durationMs: 180000,
    orders: Object.freeze({ maxVisible: 4, maxQueued: 20, patienceMs: 60000 }),
  }),
  free: Object.freeze({
    durationMs: null,
    orders: Object.freeze({ maxVisible: 6, maxQueued: 20, patienceMs: null }),
  }),
  // Sem paciência: um cliente perdido tornaria a sequência impossível de completar.
  challenge: Object.freeze({
    durationMs: null,
    orders: Object.freeze({ maxVisible: 3, maxQueued: 20, patienceMs: null }),
  }),
})

// Sorteada com a seed fixa sobre todas as receitas: o Desafio ignora o desbloqueio por tempo (PRD).
export function challengeSequence(recipes) {
  const rng = createRng(CHALLENGE_SEED)
  return Array.from({ length: CHALLENGE_LENGTH }, () => recipes[pickInt(rng, 0, recipes.length - 1)].id)
}

function countOutcomes(stats, events) {
  let { ordersCompleted, ordersFailed } = stats
  for (const event of events) {
    if (event.type === CORE_EVENTS.ORDER_DELIVERED) ordersCompleted += 1
    else if (event.type === CORE_EVENTS.ORDER_EXPIRED) ordersFailed += 1
  }
  return { ordersCompleted, ordersFailed }
}

// Pedidos + pratos que as estações deixaram no passe, numa só etapa pontuada.
function createServiceSystem(recipes) {
  const ordersSystem = createOrdersSystem({ recipes })
  const scored = withScoring(function serviceSystem(state, context) {
    let { state: next, events } = ordersSystem(state, context)
    for (const { recipeId } of next.deliveries) {
      const result = deliverDish(next, recipeId)
      next = result.state
      events = [...events, ...result.events]
    }
    return { state: { ...next, deliveries: [] }, events }
  })
  return function countedSystem(state, context) {
    const result = scored(state, context)
    const stats = countOutcomes(result.state.stats, result.events)
    return { state: { ...result.state, stats }, events: result.events }
  }
}

function finish(state) {
  const ended = { ...state, status: MATCH_STATUS.ENDED }
  return { state: ended, events: [createEvent(CORE_EVENTS.MATCH_ENDED, matchEndedPayload(ended))] }
}

function challengeEndSystem(state) {
  if (!isSequenceComplete(state)) return { state, events: [] }
  return finish(state)
}

// Parte do modo que independe do mapa: a cena da cozinha (KD-18/KD-20) a compõe com o próprio
// estado e os próprios sistemas (movimento + estações), sem duplicar pedidos, pontuação e fim.
export function createModeSystems({ mode, players, seed, recipes = RECIPES }) {
  const rules = MODE_RULES[mode]
  if (!rules) throw new RangeError(`modo desconhecido: "${mode}"`)
  if (!PLAYER_COUNTS.includes(players)) throw new RangeError('players deve ser 1 ou 2')
  const isChallenge = mode === 'challenge'
  const sequence = isChallenge ? challengeSequence(recipes) : null
  const systems = [createServiceSystem(recipes)]
  if (isChallenge) systems.push(challengeEndSystem)
  return {
    seed: isChallenge ? CHALLENGE_SEED : seed,
    durationMs: rules.durationMs,
    setup: (state) => withScoreTracking(withOrderQueue({ ...state, players }, { ...rules.orders, sequence })),
    systems,
  }
}

export function createMatch({
  mode,
  players,
  seed,
  contentVersion,
  content = { recipes: RECIPES, ingredients: INGREDIENTS, kitchen: KITCHENS[0] },
}) {
  const { recipes, ingredients, kitchen } = content
  const modeSystems = createModeSystems({ mode, players, seed, recipes })
  const base = createMatchState({
    seed: modeSystems.seed,
    mode,
    contentVersion,
    durationMs: modeSystems.durationMs,
    players,
    chefs: Array.from({ length: players }, (_, i) => createChef(`p${i + 1}`)),
    stations: createStations(kitchen),
  })
  const stationsSystem = createStationsSystem({
    recipes,
    ingredients,
    stoveBurnAfterMs: kitchen.stoveBurnAfterMs,
  })
  return {
    state: modeSystems.setup(base),
    update: createUpdate([stationsSystem, ...modeSystems.systems]),
  }
}

// Botão "Encerrar" (Livre) ou saída antecipada em qualquer modo.
export function endMatch(state) {
  if (state.status === MATCH_STATUS.ENDED) return { state, events: [] }
  return finish(state)
}

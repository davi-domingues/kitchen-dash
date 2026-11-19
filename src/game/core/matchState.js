// Estado de uma partida: dado puro e serializável. Os sistemas (KD-12 a KD-15) o leem e devolvem cópias.
export const MATCH_STATUS = Object.freeze({
  RUNNING: 'running',
  PAUSED: 'paused',
  ENDED: 'ended',
})

export function createMatchState({
  seed,
  mode,
  contentVersion,
  durationMs = null,
  players = 1,
  chefs = [],
  stations = [],
}) {
  if (!Number.isInteger(seed)) {
    throw new TypeError('seed deve ser um inteiro')
  }
  if (durationMs !== null && !(durationMs > 0)) {
    throw new RangeError('durationMs deve ser positivo ou null')
  }
  return {
    seed,
    rngState: seed >>> 0,
    mode,
    contentVersion,
    status: MATCH_STATUS.RUNNING,
    tick: 0,
    elapsedMs: 0,
    durationMs,
    players,
    score: 0,
    // Contadores do resumo final (KD-15), alimentados pelos eventos de pedido
    stats: { ordersCompleted: 0, ordersFailed: 0 },
    chefs,
    stations,
    // Bloqueio do auto-uso durante pausa ou perda de foco (issue #89)
    idleBlocked: false,
    items: [],
    orders: [],
    // Entregas no passe ainda não consumidas pelo sistema de pedidos (KD-13)
    deliveries: [],
  }
}

// Campos de `match:ended` que o core conhece; o `matchId` é atribuído pela cena.
export function matchEndedPayload(state) {
  return {
    mode: state.mode,
    players: state.players,
    seed: state.seed,
    contentVersion: state.contentVersion,
    score: state.score,
    ordersCompleted: state.stats.ordersCompleted,
    ordersFailed: state.stats.ordersFailed,
    durationMs: state.elapsedMs,
  }
}

export function pauseMatch(state) {
  if (state.status !== MATCH_STATUS.RUNNING) return state
  return { ...state, status: MATCH_STATUS.PAUSED }
}

export function resumeMatch(state) {
  if (state.status !== MATCH_STATUS.PAUSED) return state
  return { ...state, status: MATCH_STATUS.RUNNING }
}

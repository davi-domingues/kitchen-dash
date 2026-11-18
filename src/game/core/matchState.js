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
    score: 0,
    chefs,
    stations,
    items: [],
    orders: [],
    // Entregas no passe ainda não consumidas pelo sistema de pedidos (KD-13)
    deliveries: [],
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

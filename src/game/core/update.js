import { CORE_EVENTS, createEvent } from './coreEvents.js'
import { MATCH_STATUS, matchEndedPayload } from './matchState.js'
import { createRng } from './rng.js'

// Um frame travado (aba em segundo plano) não pode avançar a partida de uma vez só.
export const MAX_DT_MS = 250

// Sistema: `(state, { dtMs, inputs, rng }) => { state, events }`. Puro, exceto por consumir o rng.
export function createUpdate(systems = []) {
  return function update(state, inputs, dtMs) {
    if (state.status !== MATCH_STATUS.RUNNING) {
      return { state, events: [] }
    }
    if (!Number.isFinite(dtMs) || dtMs < 0) {
      throw new RangeError('dtMs deve ser um número finito e não negativo')
    }
    const step = Math.min(dtMs, MAX_DT_MS)
    const rng = createRng(state.rngState)
    let next = { ...state, tick: state.tick + 1, elapsedMs: state.elapsedMs + step }
    const events = []

    for (const system of systems) {
      const result = system(next, { dtMs: step, inputs, rng })
      next = result.state
      events.push(...result.events)
    }

    next = { ...next, rngState: rng.getState() }
    if (next.durationMs !== null && next.elapsedMs >= next.durationMs) {
      next = { ...next, status: MATCH_STATUS.ENDED, elapsedMs: next.durationMs }
      events.push(createEvent(CORE_EVENTS.MATCH_ENDED, matchEndedPayload(next)))
    }
    return { state: next, events }
  }
}

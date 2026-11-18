// O fim pode aparecer em mais de um caminho (tempo, sequência, Encerrar): match:ended sai uma vez só.
import { CORE_EVENTS } from '../core/coreEvents.js'

/**
 * @param {string} matchId UUID da partida, somado ao payload do core
 * @returns {(events: {type: string, payload?: object}[]) => object|null} payload na 1ª vez, senão null
 */
export function createMatchEndGuard(matchId) {
  let done = false
  return function takeMatchEnded(events) {
    if (done) return null
    const ended = events.find((event) => event.type === CORE_EVENTS.MATCH_ENDED)
    if (!ended) return null
    done = true
    return { matchId, ...ended.payload }
  }
}

import { DEFAULT_MATCH_CONFIG, isMatchConfig } from '../../game/core/matchModes.js'
import { parseMatchEnded } from './matchEnded.js'

// Fases da página de jogo; o React só troca de fase em eventos, nunca a cada frame
export const PLAY_PHASES = Object.freeze({
  SETUP: 'setup',
  PLAYING: 'playing',
  PAUSED: 'paused',
  RESULT: 'result',
  ERROR: 'error',
})

export const initialPlayState = Object.freeze({
  phase: PLAY_PHASES.SETUP,
  config: DEFAULT_MATCH_CONFIG,
  // Muda a cada partida para o React montar uma nova instância do Phaser
  run: 0,
  result: null,
})

export function playFlowReducer(state, action) {
  switch (action.type) {
    case 'start':
      if (!isMatchConfig(action.config)) return state
      return { ...state, phase: PLAY_PHASES.PLAYING, config: action.config, run: state.run + 1, result: null }
    case 'replay':
      if (state.phase !== PLAY_PHASES.RESULT) return state
      return { ...state, phase: PLAY_PHASES.PLAYING, run: state.run + 1, result: null }
    case 'paused':
      return state.phase === PLAY_PHASES.PLAYING ? { ...state, phase: PLAY_PHASES.PAUSED } : state
    case 'resumed':
      return state.phase === PLAY_PHASES.PAUSED ? { ...state, phase: PLAY_PHASES.PLAYING } : state
    case 'ended': {
      if (state.phase !== PLAY_PHASES.PLAYING && state.phase !== PLAY_PHASES.PAUSED) return state
      const result = parseMatchEnded(action.payload)
      return result
        ? { ...state, phase: PLAY_PHASES.RESULT, result }
        : { ...state, phase: PLAY_PHASES.ERROR, result: null }
    }
    case 'setup':
      return { ...state, phase: PLAY_PHASES.SETUP, result: null }
    default:
      return state
  }
}

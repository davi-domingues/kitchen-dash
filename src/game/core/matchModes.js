// Modos e número de jogadores do PRD ("Modos de jogo"); os valores viajam no payload de match:ended
export const MATCH_MODES = Object.freeze({
  CLASSIC: 'classic',
  FREE: 'free',
  CHALLENGE: 'challenge',
})

export const PLAYER_COUNTS = Object.freeze([1, 2])

// Pedidos fixos do Desafio (PRD); aqui e não em match.js para o React não puxar o core inteiro
export const CHALLENGE_LENGTH = 12

export const DEFAULT_MATCH_CONFIG = Object.freeze({ mode: MATCH_MODES.CLASSIC, players: 1 })

const MODE_VALUES = Object.values(MATCH_MODES)

export function isMatchMode(value) {
  return MODE_VALUES.includes(value)
}

export function isPlayerCount(value) {
  return PLAYER_COUNTS.includes(value)
}

export function isMatchConfig(config) {
  return Boolean(config) && isMatchMode(config.mode) && isPlayerCount(config.players)
}

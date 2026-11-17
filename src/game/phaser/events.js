// Contrato do EventBus entre Phaser e React (ARQUITETURA §3.2). Nome = `área:ação`.
export const GAME_EVENTS = Object.freeze({
  // Payload: a cena ativa. Emitido quando a cena terminou o `create`.
  SCENE_READY: 'scene:ready',
  // Payload: `{ matchId, mode, score, durationMs }`. O React mostra o resultado e envia ao backend.
  MATCH_ENDED: 'match:ended',
  // Sem payload. O React abre o menu de pausa.
  MATCH_PAUSED: 'match:paused',
  // Sem payload. O React fechou a pausa e a cena retoma.
  MATCH_RESUMED: 'match:resumed',
})

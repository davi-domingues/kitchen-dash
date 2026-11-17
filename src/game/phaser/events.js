// Contrato do EventBus entre Phaser e React (ARQUITETURA §3.2). Nome = `área:ação`.
export const GAME_EVENTS = Object.freeze({
  // Payload: a cena ativa. Emitido quando a cena terminou o `create`.
  SCENE_READY: 'scene:ready',
  // Payload: `{ matchId, mode, seed, contentVersion, score, durationMs }`. O React mostra o
  // resultado e envia ao backend; `board` e `origin` do submit_score são decididos pelo React.
  // Proposta: revisar e validar na KD-21 (#20) e na KD-31 (#25) antes de emitir.
  MATCH_ENDED: 'match:ended',
  // Sem payload. O React abre o menu de pausa.
  MATCH_PAUSED: 'match:paused',
  // Sem payload. O React fechou a pausa e a cena retoma.
  MATCH_RESUMED: 'match:resumed',
})

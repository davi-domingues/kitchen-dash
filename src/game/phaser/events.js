// Contrato do EventBus entre Phaser e React (ARQUITETURA §3.2). Nome = `área:ação`.
export const GAME_EVENTS = Object.freeze({
  // Payload: a cena ativa. Emitido quando a cena terminou o `create`.
  SCENE_READY: 'scene:ready',
  // Payload (contrato fechado na KD-21, ESTUDOS_E_DECISOES §7): `{ matchId, mode, players, seed,
  // contentVersion, score, ordersCompleted, ordersFailed, durationMs, dailyChallengeResult }`.
  // dailyChallengeResult: `{ dateUtc, challengeId, completed }`.
  // `matchId` é UUID gerado pela cena no início da partida (idempotência do submit_score);
  // `board` e `origin` são do React. Validado por features/match/matchEnded.js.
  MATCH_ENDED: 'match:ended',
  // Sem payload. O React abre o menu de pausa.
  MATCH_PAUSED: 'match:paused',
  // Sem payload. O React fechou a pausa e a cena retoma.
  MATCH_RESUMED: 'match:resumed',
  // Sem payload. O React pediu o fim do turno ("Encerrar" do Livre); a cena responde com match:ended.
  MATCH_END_REQUESTED: 'match:endRequested',
})

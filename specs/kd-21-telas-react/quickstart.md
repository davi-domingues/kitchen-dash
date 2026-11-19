# Quickstart — validação da KD-21

1. `npm ci` e `npm test`: `matchModes`, `matchEnded` e `playFlow` passam.
2. `npm run dev` e abrir `/`.
3. Só com teclado: Tab até "Jogar", Enter, escolher 2 jogadores e Desafio, "Começar".
4. No console do dev, com o módulo `EventBus` (via `import('/src/game/phaser/EventBus.js')`):
   - `EventBus.emit('match:paused')`: o menu abre com foco em "Continuar"; Esc retoma.
   - `EventBus.emit('match:ended', { matchId: crypto.randomUUID(), mode: 'challenge', players: 2, seed: 1, contentVersion: '1', score: 120, ordersCompleted: 3, ordersFailed: 1, durationMs: 95000 })`: o resultado mostra 120, 3, "Perdidos: 1" e 1:35.
   - "Jogar de novo" remonta o jogo com a mesma configuração.
   - `EventBus.emit('match:ended', {})` durante a partida: aparece o alerta de erro.
5. Abrir `/ranking`, `/perfil`, `/privacidade` e `/xyz`.

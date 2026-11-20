# Contrato: `game:crashed`

- Emissor: `game/phaser/sceneErrorGuard.js`, no máximo uma vez por cena.
- Payload: `{ error: Error, sceneKey: string }`. Sem dados do jogador.
- Consumidor: `features/match/gameCrash.js` → `captureError(error, { sceneKey })` e `onCrash()`.

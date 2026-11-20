# Research: erro no Phaser

- **Decision**: envolver os métodos de ciclo de vida da cena (init/create/update) num try/catch por instância.
  **Rationale**: o Phaser chama `scene.update`/`scene.create` dinamicamente; o `ErrorBoundary` do React não vê o loop.
  **Alternatives**: `window.onerror` (pega erros de terceiros e de fora do jogo; ruído), patch do `Game.step` (API interna).
- **Decision**: após a falha, os métodos viram no-op até o React desmontar o jogo.
  **Rationale**: evita um relato por quadro; o `game.destroy(true)` já dispara o `shutdown` e o `cleanup` dos listeners.
- **Decision**: o relato sai do React (`features/match/gameCrash.js`) via `captureError`.
  **Rationale**: §4 proíbe `game/phaser` importar `services/`.

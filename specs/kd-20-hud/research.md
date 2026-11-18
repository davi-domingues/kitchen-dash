# Research: KD-20

- **Composição modo × cozinha** — Decision: `createMatch({ mode, players, seed, contentVersion, content })` monta `createModeSystems` + `createKitchenMatch` + `createKitchenUpdate({ extraSystems })`, com os sistemas do modo depois das estações. Rationale: um só ponto monta estado e sistemas; elimina a duplicação entre `match.js` e `kitchenUpdate.js`. Alternatives: manter dois construtores (duplicação).
- **Teclas até a cena** — Decision: `PlayPage` lê `loadKeyBindings()` e o `PhaserGame` grava no registry (`KEY_BINDINGS_KEY`). Rationale: as cenas iniciam em cadeia por `scene.start` sem dados; o registry já transporta a config. Alternatives: dados de `init` (exige repassar por Boot/Preload).
- **Pausa** — Decision: evento `pause` do InputMap → `pauseMatch`, `releaseAll`, emite `match:paused`; `match:resumed` → `resumeMatch`. O core já ignora `update` fora de `running`. Rationale: tempo e paciência param juntos sem lógica extra.
- **Encerrar (Livre)** — Decision: novo evento `match:endRequested` (React → cena) e botão clicável no HUD; a cena chama `endMatch`. Rationale: acessível por teclado no `<dialog>` e visível no HUD como o PRD pede.
- **HUD** — Decision: Phaser Text/Graphics placeholder numa faixa superior; modelo puro `buildHudModel(state)`. Rationale: sem re-render React por frame.
- **Faixas de paciência** — verde > 0,5; amarela > 0,25; vermelha ≤ 0,25.

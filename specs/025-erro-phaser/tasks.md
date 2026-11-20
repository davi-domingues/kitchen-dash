# Tasks: Erro no jogo volta ao menu e é reportado

## Phase 2: Foundational

- [X] T001 Adicionar `GAME_CRASHED: 'game:crashed'` com o contrato em src/game/phaser/events.js
- [X] T002 [P] Criar `guardScene(scene, emit)` com teste em src/game/phaser/sceneErrorGuard.js e src/game/phaser/sceneErrorGuard.test.js

## Phase 3: User Story 2 — equipe recebe o erro (P1)

- [X] T003 [US2] Criar `subscribeGameCrash(bus, { report, onCrash })` com teste (monitoramento mockado) em src/features/match/gameCrash.js e src/features/match/gameCrash.test.js

## Phase 4: User Story 1 — volta ao menu (P1)

- [X] T004 [US1] Ação `crashed` (fase setup + `crashed: true`; `start` limpa) com teste em src/features/match/playFlow.js e src/features/match/playFlow.test.js
- [X] T005 [US1] Aplicar `guardScene` nas cenas em src/game/phaser/scenes/BootScene.js, PreloadScene.js e KitchenScene.js
- [X] T006 [US1] Assinar o evento e mostrar `role="alert"` com `play.crash.notice` em src/app/PlayPage.jsx e src/i18n/pt-BR.json

## Phase 5: Polish

- [X] T007 Registrar a decisão em docs/ESTUDOS_E_DECISOES.md e rodar os gates

Dependências: T001 → T002, T003 → T005, T006. T004 independente.

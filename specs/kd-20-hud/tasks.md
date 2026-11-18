# Tasks: HUD e jogo jogável (KD-20)

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/events.md

## Phase 1: Setup

- [x] T001 Branch `feat/kd-20-hud` de `feat/kd-15-core-modos` com merge de `feat/kd-18-cena-kitchen` e `feat/kd-21-telas-react`

## Phase 2: Foundational (composição do core)

- [x] T002 Teste: `extraSystems` rodam depois das estações e `createKitchenMatch` recebe `players` em src/game/core/kitchenUpdate.test.js
- [x] T003 `createKitchenUpdate({ kitchen, content, extraSystems = [] })` e `players` em `createKitchenMatch` em src/game/core/kitchenUpdate.js
- [x] T004 `createMatch` passa a montar `createKitchenMatch` + `createKitchenUpdate` com os sistemas do modo (sem duplicação), com `content.kitchen` em src/game/core/match.js; manter src/game/core/match.test.js verde

## Phase 3: US1 — Jogar uma partida completa (P1)

**Independent Test**: os 3 modos chegam ao resumo no navegador.

- [x] T005 [US1] `KEY_BINDINGS_KEY` em src/game/phaser/registryKeys.js; PhaserGame grava `keyBindings` no registry; PlayPage passa `loadKeyBindings()` em src/game/phaser/PhaserGame.jsx e src/app/PlayPage.jsx
- [x] T006 [US1] KitchenScene lê config/teclas do registry, monta `createMatch`, gera `matchId` com `crypto.randomUUID()` e emite `match:ended` uma única vez com `{ matchId, ...matchEndedPayload }` em src/game/phaser/scenes/KitchenScene.js
- [x] T007 [US1] Área da cozinha abaixo do HUD em src/game/phaser/kitchenView.js

## Phase 4: US2 — HUD (P1)

**Independent Test**: `hudModel.test.js`; barras mudam de cor no Clássico.

- [x] T008 [P] [US2] Testes de `formatClock`, `patienceBand` (verde > 0,5; amarela > 0,25; vermelha ≤ 0,25) e `buildHudModel` (relógio `remaining` quando `durationMs` ≠ null, `queued`, `canEnd` no Livre) em src/game/phaser/hudModel.test.js
- [x] T009 [US2] Implementar src/game/phaser/hudModel.js
- [x] T010 [US2] Desenho em src/game/phaser/hudView.js com chaves `game.hud.*` em src/i18n/pt-BR.json

## Phase 5: US3 — Pausa e Encerrar (P2)

- [x] T011 [US3] `MATCH_END_REQUESTED` em src/game/phaser/events.js (+ events.test.js)
- [x] T012 [US3] Cena: `pause` do InputMap → `pauseMatch` + `releaseAll` + `match:paused`; `match:resumed` → `resumeMatch`; `match:endRequested`/botão do HUD → `endMatch`; listeners do EventBus removidos no shutdown em src/game/phaser/scenes/KitchenScene.js
- [x] T013 [US3] "Encerrar" no PauseDialog só no Livre em src/features/match/PauseDialog.jsx e src/app/PlayPage.jsx

- [x] T016 [US1] Guard puro `createMatchEndGuard(matchId)` (um único `match:ended`) com teste em src/game/phaser/matchEndGuard.js e matchEndGuard.test.js

## Phase 6: Polish

- [x] T014 Registrar decisões em docs/ESTUDOS_E_DECISOES.md
- [x] T015 Gates: format:check, lint, test, build, check-size

## Dependencies

T002–T004 → US1 → US2/US3. T008 paralelo a T005–T007.

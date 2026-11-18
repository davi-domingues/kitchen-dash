# Tasks: InputMap — controles de teclado

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/input-api.md](./contracts/input-api.md), [quickstart.md](./quickstart.md)

**Tests**: obrigatórios (critério de pronto da issue #16 e AGENTS.md §5).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

Sem tarefas: estrutura, Vitest e `services/storage.js` já existem.

## Phase 2: Foundational

- [x] T001 Criar `DEFAULT_KEY_BINDINGS` (P1 `ArrowUp/ArrowDown/ArrowLeft/ArrowRight` + `Enter`; P2 `KeyW/KeyS/KeyA/KeyD` + `Space`; pausa `KeyP`), `remapKey` (troca em conflito) e `sanitizeKeyBindings` ("11 teclas, strings não vazias e distintas; senão, padrão") em `src/game/input/keyBindings.js`
- [x] T002 [P] Testes de padrão, remapeamento, troca e validação em `src/game/input/keyBindings.test.js`

## Phase 3: User Story 1 - Dois jogadores (P1) 🎯 MVP

**Independent Test**: setas e WASD juntos movem cada um só o seu chef.

- [x] T003 [US1] Testes de movimento por jogador, teclas opostas e tecla sem mapeamento em `src/game/input/inputMap.test.js`
- [x] T004 [US1] `createInputMap` com `keyDown(code, now)`, `keyUp(code)` e `getMove(player)` (eixos em -1, 0, 1) em `src/game/input/inputMap.js`

## Phase 4: User Story 2 - Toque × segurar (P1)

**Independent Test**: aperto < 220 ms gera `interact:tap`; ≥ 220 ms gera `interact:holdStart` e, ao soltar, `interact:holdEnd`.

- [x] T005 [US2] Testes de toque, segurar (limite inclusivo), repetição automática e `tapThresholdMs` customizado em `src/game/input/inputMap.test.js`
- [x] T006 [US2] `update(now)`, `isHolding(player)`, `INPUT_EVENTS` e `TAP_THRESHOLD_MS = 220` em `src/game/input/inputMap.js`

## Phase 5: User Story 3 - Um jogador (P2)

**Independent Test**: em 1 jogador, D + ↓ movem `p1` na diagonal.

- [x] T007 [US3] Testes: os dois conjuntos controlam `p1`; Enter + Espaço contam como um botão, em `src/game/input/inputMap.test.js`
- [x] T008 [US3] Tabela de teclas por `playerCount` (1 ou 2, erro caso contrário) em `src/game/input/inputMap.js`

## Phase 6: User Story 4 - Pausa (P2)

- [x] T009 [US4] Evento `pause` só no primeiro keydown, com teste, em `src/game/input/inputMap.js` e `src/game/input/inputMap.test.js`

## Phase 7: User Story 5 - Remapear (P3)

**Independent Test**: remapear, salvar, recarregar e obter a tecla nova.

- [x] T010 [US5] Teste: InputMap usa teclas remapeadas em `src/game/input/inputMap.test.js`
- [x] T011 [P] [US5] `loadKeyBindings`/`saveKeyBindings` em `kd:v1:settings.keyBindings`, preservando outras preferências, em `src/services/settings.js` e `src/services/settings.test.js`

## Phase N: Polish

- [x] T012 `releaseAll()` para perda de foco, com teste, em `src/game/input/inputMap.js`
- [x] T013 Alinhar `docs/SYSTEM_DESIGN.md` §3/§8.1 e `AGENTS.md` §4 ao PRD; registrar em `docs/ESTUDOS_E_DECISOES.md`
- [x] T014 Rodar os gates e o [quickstart](./quickstart.md): `npm run format:check`, `lint`, `test`, `build`, `check-size`

## Dependencies & Execution Order

- T001 bloqueia todas as histórias. US1 → US2 → US3 (mesmo arquivo). US4 e US5 dependem só de US1.

## Parallel Example

T002 e T011 rodam em paralelo (arquivos diferentes, sem dependência pendente).

## Implementation Strategy

MVP = US1 + US2. US3–US5 incrementais na mesma branch.

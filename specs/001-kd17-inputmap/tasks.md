# Tasks: InputMap — controles de teclado

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md), [contracts/input-api.md](./contracts/input-api.md)

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

Sem setup: estrutura e dependências já existem.

## Phase 2: Foundational

- [x] T001 Teclas padrão, `remapKey` e `sanitizeKeyBindings` em `src/game/input/keyBindings.js`
- [x] T002 [P] Testes em `src/game/input/keyBindings.test.js`

## Phase 3: User Story 1 - Dois jogadores (P1) 🎯 MVP

- [x] T003 [US1] Teste: setas movem P1 e WASD move P2 em `src/game/input/inputMap.test.js`
- [x] T004 [US1] `createInputMap` com `keyDown/keyUp/getMove` em `src/game/input/inputMap.js`

## Phase 4: User Story 2 - Toque × segurar (P1)

- [x] T005 [US2] Testes de toque, segurar, repetição automática e limite customizado
- [x] T006 [US2] `update(now)`, `isHolding` e eventos `interact:*`

## Phase 5: User Story 3 - Um jogador (P2)

- [x] T007 [US3] Testes: os dois conjuntos controlam `p1`; Enter + Espaço são um botão
- [x] T008 [US3] Tabela de teclas por `playerCount`

## Phase 6: User Story 4 - Pausa (P2)

- [x] T009 [US4] Teste e evento `pause` só no primeiro keydown

## Phase 7: User Story 5 - Remapear (P3)

- [x] T010 [US5] Teste: InputMap usa teclas remapeadas
- [x] T011 [P] [US5] `loadKeyBindings`/`saveKeyBindings` em `src/services/settings.js` com testes

## Phase N: Polish

- [x] T012 `releaseAll` para perda de foco + teste
- [x] T013 Alinhar SYSTEM_DESIGN §3/§8.1 ao PRD e registrar em ESTUDOS_E_DECISOES
- [x] T014 Gates: format:check, lint, test, build, check-size

## Dependencies & Execution Order

- T001 → todas as fases. US1 → US2 → US3. US4 e US5 independem entre si após US1.

## Implementation Strategy

MVP = US1 + US2. US3–US5 incrementais na mesma branch.

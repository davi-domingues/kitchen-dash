# Tasks: Telas de partida (KD-21)

**Input**: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md), [contracts/match-ended.md](contracts/match-ended.md)

Testes: pedidos pelo AGENTS §5 para lógica nova (módulos puros); componentes têm verificação manual ([quickstart.md](quickstart.md)).

## Phase 1: Setup

- [x] T001 Criar a pasta da feature em src/features/match/

## Phase 2: Foundational

- [x] T002 [P] Criar `MATCH_MODES`, `PLAYER_COUNTS`, `DEFAULT_MATCH_CONFIG` e `isMatchConfig` ("mode: 'classic' | 'free' | 'challenge'", "players: 1 | 2") em src/game/core/matchModes.js
- [x] T003 [P] Testar os modos em src/game/core/matchModes.test.js
- [x] T004 Documentar o payload final em src/game/phaser/events.js, docs/SYSTEM_DESIGN.md §7.1 e docs/ESTUDOS_E_DECISOES.md §7
- [x] T005 Implementar `parseMatchEnded` ("seed inteiro 0..2^32-1", "score/ordersCompleted/ordersFailed inteiros ≥ 0", "durationMs inteiro > 0", matchId UUID) e `formatDuration` em src/features/match/matchEnded.js
- [x] T006 [P] Testar validação e formatação em src/features/match/matchEnded.test.js
- [x] T007 Implementar o reducer com as transições do data-model em src/features/match/playFlow.js
- [x] T008 [P] Testar as transições em src/features/match/playFlow.test.js
- [x] T009 Gravar `matchConfig` no registry via `preBoot` em src/game/phaser/PhaserGame.jsx e src/game/phaser/registryKeys.js

## Phase 3: User Story 1 — Iniciar partida (P1)

**Independent Test**: home → Jogar → 2 jogadores + Desafio → Começar, só com teclado.

- [x] T010 [US1] Apresentação, instruções e navegação em src/app/HomePage.jsx
- [x] T011 [US1] Formulário de escolha de partida em src/features/match/MatchSetup.jsx
- [x] T012 [US1] Ligar setup e jogo no reducer em src/app/PlayPage.jsx

## Phase 4: User Story 2 — Resultado e jogar de novo (P1)

**Independent Test**: emitir `match:ended` válido e inválido (quickstart passo 4).

- [x] T013 [US2] Tela de resultado com estado vazio e foco no título em src/features/match/MatchResult.jsx
- [x] T014 [US2] Ouvir `match:ended` e mostrar resultado/erro em src/app/PlayPage.jsx

## Phase 5: User Story 3 — Pausa (P2)

**Independent Test**: emitir `match:paused`, retomar com Esc.

- [x] T015 [US3] Diálogo de pausa com `<dialog>` nativo em src/features/match/PauseDialog.jsx
- [x] T016 [US3] Ouvir `match:paused` e emitir `match:resumed` em src/app/PlayPage.jsx

## Phase 6: User Story 4 — Rotas (P3)

**Independent Test**: abrir /ranking, /perfil, /privacidade e /xyz.

- [x] T017 [P] [US4] Casca comum em src/app/PlaceholderPage.jsx
- [x] T018 [P] [US4] Páginas em src/app/RankingPage.jsx, src/app/ProfilePage.jsx, src/app/PrivacyPage.jsx, src/app/NotFoundPage.jsx
- [x] T019 [US4] Registrar as rotas em src/app/App.jsx

## Phase 7: Polish

- [x] T020 Textos em src/i18n/pt-BR.json (i18n.test.js sem chave faltante ou sem uso)
- [x] T021 Gates: format:check, lint, test, build, check-size

## Dependencies

Phase 2 bloqueia todas as histórias. US1 → US2 (precisa de partida iniciada); US3 depende de US1; US4 é independente. MVP: US1 + US2.

## Parallel

T002/T003, T006, T008 em paralelo após os módulos; T017/T018 em paralelo.

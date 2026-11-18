# Tasks: Progresso local do visitante

Testes obrigatórios (AGENTS.md §5: lógica nova vem com teste).

## Phase 1: Setup

- [ ] T001 Unificar modos: `match.js` importa `MATCH_MODES`/`PLAYER_COUNTS` de src/game/core/matchModes.js; teste de que as chaves de `MODE_RULES` são exatamente os modos em src/game/core/match.test.js (FR-009)

## Phase 2: Foundational

- [ ] T002 Regras puras `createEmptyProgress`, `sanitizeProgress`, `isBetter`, `getBoard`, `getRecord`, `applyMatchResult` em src/features/progress/progress.js ("≤ 10 por (mode, players)", "pending ≤ 50", Desafio só com `ordersCompleted >= CHALLENGE_LENGTH`, idempotência por `matchId`)
- [ ] T003 Testes de T002 em src/features/progress/progress.test.js (FR-001, FR-003–FR-006, edge cases)
- [ ] T004 Repositório `loadProgress`, `recordMatchResult`, `removePending`, `clearProgress` em src/features/progress/progressStore.js com testes em src/features/progress/progressStore.test.js

## Phase 3: US1 — novo recorde no resultado (P1)

- [ ] T005 [US1] Hook `useRecordedResult` registra o resultado uma vez por `matchId` em src/features/progress/useRecordedResult.js e é usado em src/app/PlayPage.jsx
- [ ] T006 [US1] Badge "Novo recorde!" e recorde atual em src/features/match/MatchResult.jsx + chaves em src/i18n/pt-BR.json (FR-002)

## Phase 4: US2 — perfil local (P2)

- [ ] T007 [US2] Tela src/features/progress/LocalProgress.jsx (recordes, placar, estatísticas, vazio, aviso de armazenamento temporário) usada em src/app/ProfilePage.jsx (FR-007)

## Phase 5: US3 — apagar progresso (P3)

- [ ] T008 [US3] Botão com diálogo de confirmação em src/features/progress/LocalProgress.jsx (FR-008)

## Phase 6: Polish

- [ ] T009 Registrar decisões em docs/ESTUDOS_E_DECISOES.md; rodar gates

## Dependencies

T001 → T002 → T003/T004 → US1 → US2 → US3 → T009. MVP: até US1.

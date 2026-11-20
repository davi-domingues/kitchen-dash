# Tasks: Estado de envio ao ranking no resultado

**Input**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md)

## Phase 1: Foundational

- [X] T001 Incluir `outcomes[matchId] ∈ {'sent','discarded','retrying'}` no resumo de `run`/`flush` em src/services/scoreOutbox.js, com teste em src/services/scoreOutbox.test.js

## Phase 2: User Story 1 - Jogador conectado vê o estado (P1)

**Independent Test**: testes de `submitStatus`/`submitMatch`; manual logado online/offline.

- [X] T002 [US1] Criar `SUBMIT_STATUS` (`sending | sent | pending | failed | guest`) e `submitStatus(summary, matchId)` em src/features/progress/scoreSync.js; `submitMatch` devolve o estado (`failed` se a rodada lançar), testes em src/features/progress/scoreSync.test.js
- [X] T003 [US1] `useSubmitMatch` devolve o estado (`sending` enquanto sessão carrega ou envio corre) em src/features/progress/useScoreSync.js
- [X] T004 [P] [US1] Chaves `play.result.sync.{sending,sent,pending,failed,guest}` em src/i18n/pt-BR.json
- [X] T005 [US1] Mostrar o estado em `role="status"` (aria-live polite) em src/features/match/MatchResult.jsx e passar a prop em src/app/PlayPage.jsx

## Phase 3: User Story 2 - Visitante (P2)

- [X] T006 [US2] Visitante/`disabled` → `guest` sem enfileirar, coberto por teste em src/features/progress/scoreSync.test.js

## Phase 4: Polish

- [X] T007 Registrar a decisão em docs/ESTUDOS_E_DECISOES.md
- [X] T008 Rodar gates (`format:check`, `lint`, `test`, `build`, `check-size`)

## Dependencies

T001 → T002 → T003 → T005; T004 independente; T006 depende de T002.

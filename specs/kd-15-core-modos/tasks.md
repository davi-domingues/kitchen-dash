# Tasks: Core dos modos de jogo

## Phase 1: Foundational

- [x] T001 Adicionar `players`, `stats` e `matchEndedPayload(state)` em src/game/core/matchState.js, com testes em src/game/core/matchState.test.js
- [x] T002 Usar `matchEndedPayload` no fim por tempo em src/game/core/update.js e atualizar src/game/core/update.test.js
- [x] T003 Criar `MODE_RULES`, validação da config e `createMatch` (estações → pedidos + entregas com pontuação e contadores) em src/game/core/match.js

## Phase 2: User Story 1 — Clássico (P1)

- [x] T004 [US1] Testar fim em 180 s com payload completo e entrega do passe pontuada em src/game/core/match.test.js

## Phase 3: User Story 2 — Livre (P1)

- [x] T005 [US2] Implementar `endMatch(state)` em src/game/core/match.js
- [x] T006 [US2] Testar Livre sem tempo, sem expiração, 6 comandas e `endMatch` idempotente em src/game/core/match.test.js

## Phase 4: User Story 3 — Desafio (P1)

- [x] T007 [US3] Implementar `CHALLENGE_SEED`, `challengeSequence(recipes)` e sistema de fim ao completar em src/game/core/match.js
- [x] T008 [US3] Testar seed fixa, sequência de 12 determinística, 3 visíveis e fim no 12º pedido em src/game/core/match.test.js

## Phase 5: Polish

- [x] T009 Testar validação (modo/jogadores inválidos) e prato errado consumido em src/game/core/match.test.js
- [x] T010 Registrar decisões em docs/ESTUDOS_E_DECISOES.md

## Dependencies

T001 → T002 → T003 → US1/US2/US3 (independentes entre si) → Polish.

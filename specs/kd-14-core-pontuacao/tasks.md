# Tasks: Core de pontuação

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/scoring-api.md
**Tests**: obrigatórios (AGENTS.md §4: 100% das regras de pontuação testadas).

## Phase 1: Setup

- [X] T001 Instalar dependências com `npm ci` e confirmar `npm test` verde antes de mudar código

## Phase 2: Foundational

- [X] T002 Adicionar `SCORE_CHANGED: 'score:changed'` com o payload ScoreChange documentado em src/game/core/coreEvents.js
- [X] T003 Criar `SCORING_RULES` e `withScoreTracking(state)` (`scoring = { combo: 0 }`) em src/game/core/scoring.js

## Phase 3: User Story 1 - Entrega rende base e gorjeta (P1)

**Independent Test**: Salada (60) com metade da paciência ⇒ +80.

- [X] T004 [US1] Testes de `tipFor` (cheia, metade, zero, null, arredondamento, limites) e de entrega em src/game/core/scoring.test.js
- [X] T005 [US1] Implementar `tipFor` e o caso `order:delivered` de `applyScoreEvents` em src/game/core/scoring.js

## Phase 4: User Story 2 - Combo (P1)

- [X] T006 [US2] Testes: 1ª entrega sem bônus, 2ª e 3ª com +10 fixo, combo zera após errado/expirado, em src/game/core/scoring.test.js
- [X] T007 [US2] Implementar contagem do combo em `applyScoreEvents` em src/game/core/scoring.js

## Phase 5: User Story 3 - Penalidades e piso zero (P1)

- [X] T008 [US3] Testes: −20 errado, −30 expirado, piso zero com `delta` efetivo, eventos não relacionados ignorados, sem `scoring` ⇒ intacto, em src/game/core/scoring.test.js
- [X] T009 [US3] Implementar penalidades e piso em src/game/core/scoring.js

## Phase 6: Integração e plausibilidade

- [X] T010 Testes e implementação de `withScoring(system)` integrado ao `createUpdate` com `createOrdersSystem` (expiração real pontua), e de `maxPlausibleScore`, em src/game/core/scoring.js e src/game/core/scoring.test.js
- [X] T011 Teste de determinismo: mesma seed e mesmos passos ⇒ mesmo placar, em src/game/core/scoring.test.js

## Phase 7: Polish

- [X] T012 [P] Registrar decisões (combo fixo, gorjeta linear, teto 15 pts/s + 180) em docs/ESTUDOS_E_DECISOES.md
- [X] T013 Rodar os gates: `npm run format:check && npm run lint && npm test && npm run build && npm run check-size`

## Dependencies

T001 → T002/T003 → US1 → US2 → US3 → T010/T011 → T012/T013. Stories mexem no mesmo arquivo, por isso são sequenciais. MVP: US1.

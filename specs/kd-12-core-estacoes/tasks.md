# Tasks: Estações e ingredientes (KD-12)

**Input**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md), [contracts/stations-api.md](contracts/stations-api.md)
**Tests**: obrigatórios (AGENTS.md §5: 100% das regras do core testadas).

## Phase 1: Setup

- [ ] T001 Registrar os eventos de estação em `CORE_EVENTS` em src/game/core/coreEvents.js

## Phase 2: Foundational

- [ ] T002 [P] Criar `createIngredient`, `createPlate`, `matchRecipe`, `fitsSomeRecipe` ("sub-multiconjunto de alguma receita do mesmo `container`") em src/game/core/items.js com testes em src/game/core/items.test.js
- [ ] T003 Criar `STATION_KINDS`, `POT_STATUS`, `createStations(kitchen)` e `createChef(id)` em src/game/core/stations.js com testes em src/game/core/stations.test.js

## Phase 3: User Story 1 - Preparar ingredientes (P1) 🎯 MVP

**Independent Test**: caixa → tábua → segurar `chopMs` → pegar picado.

- [ ] T004 [US1] Implementar `interact` para caixa, tábua (pegar/soltar) e balcão em src/game/core/stations.js com testes
- [ ] T005 [US1] Criar `createStationsSystem(content)` com `tap`/`holdStart`/`holdEnd` e o avanço do corte em src/game/core/stationsSystem.js com testes em src/game/core/stationsSystem.test.js

## Phase 4: User Story 2 - Cozinhar e montar (P1)

- [ ] T006 [US2] Implementar pratos, combinação no balcão e panela (adicionar, servir, limpar) em src/game/core/stations.js com testes
- [ ] T007 [US2] Avançar cozimento (`cookMs`) e queima (`stoveBurnAfterMs`) em src/game/core/stationsSystem.js com testes

## Phase 5: User Story 3 - Descartar e entregar (P1)

- [ ] T008 [US3] Implementar lixeira, passe (`state.deliveries` + `dish:served`) e `canInteract` em src/game/core/stations.js com testes

## Phase 6: Polish

- [ ] T009 Teste de ponta a ponta das 4 receitas do conteúdo real em src/game/core/stationsSystem.test.js
- [ ] T010 Registrar decisões (panela fixa, conteúdo injetado, deliveries) em docs/ESTUDOS_E_DECISOES.md
- [ ] T011 Rodar os gates (`format:check`, `lint`, `test`, `build`, `check-size`)

## Dependencies

T001 → T002 → T003 → US1 → US2 → US3 → Polish. Mesmo arquivo nas fases 3–5: sem paralelismo além de T002.

## Implementation Strategy

MVP = US1 (corte). US2 e US3 completam o fluxo até a entrega, pré-requisito de KD-13/KD-18.

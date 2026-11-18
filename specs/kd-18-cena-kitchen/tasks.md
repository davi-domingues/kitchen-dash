# Tasks: Cena Kitchen (KD-18)

**Input**: spec.md, plan.md, research.md, data-model.md, contracts/kitchen-api.md
**Tests**: pedidos pelo AGENTS.md (toda lógica nova do core com teste).

## Phase 1: Setup

- [X] T001 Criar a branch `feat/kd-18-cena-kitchen` a partir de `feat/kd-12-core-estacoes` e fazer merge de `feat/kd-17-inputmap`

## Phase 2: Foundational

- [X] T002 Implementar `DIRECTIONS`, `tileKind`, `isWalkable` e `createKitchenChefs` em src/game/core/kitchenMap.js com testes em src/game/core/kitchenMap.test.js

## Phase 3: User Story 1 - Andar pela cozinha (P1)

**Independent Test**: testes do movementSystem.

- [X] T003 [US1] Implementar `createMovementSystem` e `CHEF_STEP_MS` (passo de 150 ms, horizontal tem prioridade, bloqueio por parede/estação/chef) em src/game/core/movementSystem.js com testes em src/game/core/movementSystem.test.js

## Phase 4: User Story 2 - Interagir com a estação alvo (P1)

- [X] T004 [US2] Implementar `findTargetStation` em src/game/core/kitchenMap.js com testes
- [X] T005 [US2] Implementar `createKitchenMatch`, `createKitchenUpdate` e `toStationInputs` em src/game/core/kitchenUpdate.js com testes em src/game/core/kitchenUpdate.test.js (fluxo pegar → picar → cozinhar → servir)
- [X] T006 [US2] Desenho placeholder em src/game/phaser/kitchenView.js e cena em src/game/phaser/scenes/KitchenScene.js (InputMap, update, destaque forte/fraco, cleanup no shutdown, `releaseAll` no blur); chaves novas em src/i18n/pt-BR.json

## Phase 5: User Story 3 - Cozinha jogável garantida (P2)

- [X] T007 [US3] Implementar `checkReachability` em src/game/core/kitchenMap.js com teste sobre todas as `KITCHENS` e um mapa com estação isolada

## Phase 6: Polish

- [X] T008 Registrar a decisão de movimento em grade em docs/ESTUDOS_E_DECISOES.md
- [X] T009 Rodar os gates (`format:check`, `lint`, `test`, `build`, `check-size`)

## Dependencies

T002 → T003, T004, T007; T003 + T004 → T005 → T006. T007 é paralela a T003–T006.

## Implementation Strategy

MVP = US1 + US2 (andar e interagir). US3 protege o conteúdo.

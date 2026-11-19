# Tasks: Core de pedidos e paciência (KD-13)

**Input**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md), [contracts/orders-api.md](contracts/orders-api.md)
**Tests**: obrigatórios (AGENTS.md §5: toda lógica do core vem com teste).

## Phase 1: Setup

- [x] T001 Confirmar que `src/game/core/orders.js` cai nas regras de fronteira de `eslint.config.js`

## Phase 2: Foundational

- [x] T002 Declarar `ORDER_CREATED`, `ORDER_EXPIRED`, `ORDER_WRONG` e documentar o payload de `ORDER_DELIVERED` em `src/game/core/coreEvents.js`
- [x] T003 Implementar `ORDER_DEFAULTS` e `withOrderQueue(state, config)` em `src/game/core/orders.js` ("maxVisible: inteiro ≥ 1", "patienceMs: inteiro > 0 | null", "nextSpawnAtMs: 0" na instalação)

## Phase 3: US1 - Chegada com desbloqueio por tempo (P1) 🎯 MVP

- [x] T004 [US1] Implementar `createOrdersSystem({ recipes })`: chegada em `nextSpawnAtMs`, receita por `pickInt` entre `unlockAtMs <= elapsedMs`, próximo intervalo por `pickInt(min, max)`, evento `order:created`, em `src/game/core/orders.js`
- [x] T005 [US1] Testes de primeira chegada, desbloqueio e determinismo em `src/game/core/orders.test.js`

## Phase 4: US2 - Comandas visíveis e fila (P1)

- [x] T006 [US2] Chegada vai para a fila se `orders.length >= maxVisible`; descartada se `pending.length >= maxQueued`; promoção FIFO ao abrir vaga, em `src/game/core/orders.js`
- [x] T007 [US2] Testes de fila, descarte e promoção em `src/game/core/orders.test.js`

## Phase 5: US3 - Paciência e expiração (P1)

- [x] T008 [US3] Decrementar `remainingMs` só das visíveis; ao chegar a 0, remover e emitir `order:expired` (OrderOutcome); `patienceMs: null` não expira, em `src/game/core/orders.js`
- [x] T009 [US3] Testes de expiração e de paciência desligada em `src/game/core/orders.test.js`

## Phase 6: US4 - Entrega de prato (P1)

- [x] T010 [US4] Implementar `deliverDish(state, recipeId)`: comanda visível mais antiga da receita → `order:delivered`; senão `order:wrong`; ignora se não `running`, em `src/game/core/orders.js`
- [x] T011 [US4] Testes de entrega certa, errada, duplicada e fora de `running` em `src/game/core/orders.test.js`

## Phase 7: US5 - Sequência fixa (P2)

- [x] T012 [US5] `config.sequence`: receitas na ordem, sem sorteio de receita, `nextSpawnAtMs = null` ao esgotar; `isSequenceComplete(state)`, em `src/game/core/orders.js`
- [x] T013 [US5] Testes da sequência em `src/game/core/orders.test.js`

## Phase 8: Polish

- [x] T014 Registrar as decisões (padrões do Clássico, paciência só nas visíveis, payload dos eventos) em `docs/ESTUDOS_E_DECISOES.md`
- [x] T015 Rodar os gates (`format:check`, `lint`, `test`, `build`, `check-size`)

## Dependencies

T002–T003 → US1 → US2/US3 (mesmo arquivo, sequenciais) → US4 → US5 → Polish. Paralelismo limitado: tudo em `orders.js`.

## Implementation Strategy

MVP = US1 + US4 (chegada e entrega); fila, paciência e sequência entram em seguida, cada uma com seus testes.

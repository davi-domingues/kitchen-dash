# Tasks: Reenvio do equipado para a conta

**Input**: specs/011-retry-equipado (spec, plan, research, data-model)
**Tests**: obrigatórios (lógica nova em `services/`, AGENTS.md §5; a issue pede relógio falso)

## Phase 1: Setup

Nada: sem dependência nova.

## Phase 2: Foundational

- [X] T001 Testes da fila com relógio e timers falsos: pendência persistida, backoff, último vence, teto de 8, outro usuário ignorado, em src/services/equippedOutbox.test.js
- [X] T002 `createEquippedOutbox` com `request`, `flush`, `isPending`, `dispose`, usando `backoffDelay`, `MAX_ATTEMPTS`, `BASE_DELAY_MS` e `MAX_DELAY_MS` de src/services/scoreOutbox.js, em src/services/equippedOutbox.js

## Phase 3: User Story 1 - O equipado chega à conta quando a rede volta (Priority: P1)

**Goal**: falha ao equipar vira reenvio automático.
**Independent Test**: falha + avanço do relógio falso → `saveEquipped` chamado de novo com o último equipado.

- [X] T003 [US1] Teste: `equipAndSync` com falha agenda o reenvio e grava depois, em src/features/cosmetics/cosmeticsSync.test.js
- [X] T004 [US1] `equipAndSync` passa pela fila; `equippedOutboxFor(deps)` cria uma fila por conjunto de dependências, em src/features/cosmetics/cosmeticsSync.js
- [X] T005 [US1] `useCosmeticsSync` faz flush no login e no `online`, lê a conta só sem pendência e descarta o timer ao sair, em src/features/cosmetics/useCosmeticsSync.js

## Phase 4: Polish

- [X] T006 Registrar a decisão em docs/ESTUDOS_E_DECISOES.md
- [X] T007 Rodar os gates (`format:check`, `lint`, `test`, `build`, `check-size`)

## Dependencies & Execution Order

T001 → T002 → T003 → T004 → T005 → T006/T007. T006 pode correr em paralelo com T005.

## Implementation Strategy

MVP = Phase 2 + US1 (é o débito inteiro).

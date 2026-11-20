# Tasks: Reportar partidas descartadas

## Phase 2: Foundational

- [X] T001 [P] Adicionar `captureEvent` com teste em src/services/monitoring.js e src/services/monitoring.test.js

## Phase 3: User Story 1 (P1)

- [X] T002 [US1] Adicionar `DISCARD_REASONS` e `onDiscarded` com testes (rejeitada, expirada uma vez, transitória sem aviso) em src/services/scoreOutbox.js e src/services/scoreOutbox.test.js
- [X] T003 [US1] Criar `reportDiscarded` sem PII e ligar na outbox do app, com teste, em src/features/progress/scoreSync.js e src/features/progress/scoreSync.test.js

## Phase 4: Polish

- [X] T004 Registrar a decisão em docs/ESTUDOS_E_DECISOES.md e rodar os gates

Dependências: T001 → T003; T002 → T003.

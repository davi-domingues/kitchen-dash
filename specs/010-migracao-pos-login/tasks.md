# Tasks: Migração de partidas de visitante pós-login

**Input**: specs/010-migracao-pos-login (spec, plan, research, data-model)
**Tests**: obrigatórios (regressão de bug, AGENTS.md §5)

## Phase 1: Setup

Nada a configurar: sem dependência nova.

## Phase 2: Foundational

Nenhuma.

## Phase 3: User Story 1 - Partidas novas de visitante migram no próximo login (Priority: P1)

**Goal**: partidas de visitante jogadas após a migração concluída sobem no login seguinte.
**Independent Test**: migração concluída + partidas novas → nova rodada envia só as novas.

### Tests for User Story 1

- [X] T001 [US1] Teste de regressão: concluída + 2 partidas novas → `done` com `sent: 2`, envio uma vez por matchId e `pending` vazio, em src/features/migration/accountMigration.test.js
- [X] T002 [US1] Teste: `isMigrationDone` fica `false` com partida de visitante pendente e a etapa de configurações não roda de novo, em src/features/migration/accountMigration.test.js

### Implementation for User Story 1

- [X] T003 [US1] `isMigrationDone` considera partidas de visitante pendentes, em src/features/migration/accountMigration.js
- [X] T004 [US1] `runAccountMigration` reabre `scores` e `cosmetics` e zera `sent`/`discarded` quando há partidas novas após a conclusão, em src/features/migration/accountMigration.js

## Phase 4: Polish

- [X] T005 Rodar os gates (`format:check`, `lint`, `test`, `build`, `check-size`)

## Dependencies & Execution Order

T001–T002 antes de T003–T004 (o teste falha primeiro); T005 por último. Sem paralelismo útil: um arquivo de código e um de teste.

## Implementation Strategy

MVP = US1 inteira (é o débito todo).

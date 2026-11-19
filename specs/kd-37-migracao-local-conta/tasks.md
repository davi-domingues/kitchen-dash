# Tasks: Migração local → conta (KD-37)

## Phase 1: Setup

- [x] T001 Spec, plano e contrato em specs/kd-37-migracao-local-conta/

## Phase 2: Foundational

- [x] T002 [P] `createSettingsService(client)` com `fetchSettings`/`saveSettings` e testes em src/services/settingsService.js e src/services/settingsService.test.js
- [x] T003 [P] `loadSettingsService()` dinâmico e teste em src/services/settingsLoader.js e src/services/settingsLoader.test.js
- [x] T004 [P] `loadSettings`/`saveSettings` do objeto local completo em src/services/settings.js (+ teste)

## Phase 3: US1 — recordes de visitante (P1)

**Independent test**: partidas de visitante enviadas uma vez com `origin: 'local'`, em lotes de 10/60 s.

- [x] T005 [US1] Marcador `kd:v1:migration` (`version` 1, `steps.scores|cosmetics|settings`, `sent`, `discarded`) e etapa de partidas em src/features/migration/accountMigration.js
- [x] T006 [US1] Testes: só visitante (exclui outbox), lote de 10 + espera de 60 s, retry com backoff, discard remove e conta, auth interrompe, retomada sem duplicar em src/features/migration/accountMigration.test.js

## Phase 4: US2 — cosméticos e configurações (P2)

- [x] T007 [P] [US2] `mergeSettings(local, account)` (conta vence por campo) e testes em src/features/migration/settingsMerge.js e .test.js
- [x] T008 [US2] Etapas de cosméticos (pull + pushEquipped) e configurações no orquestrador, com testes de falha que não marcam a etapa em src/features/migration/accountMigration.js

## Phase 5: US3 — aviso (P3)

- [x] T009 [US3] Hook `useAccountMigration` e `MigrationNotice.jsx` (`role="status"`, botão fechar) em src/features/migration/ e montagem em src/app/App.jsx
- [x] T010 [US3] Chaves `migration.notice.*` em src/i18n/pt-BR.json

## Phase 6: Polish

- [x] T011 Decisão de conflito e marcador em docs/ESTUDOS_E_DECISOES.md
- [x] T012 Gates: format:check, lint, test, build, check-size

## Dependencies

T002–T004 → T005–T008 → T009–T010 → T011–T012. MVP: US1.

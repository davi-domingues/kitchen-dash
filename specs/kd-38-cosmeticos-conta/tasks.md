# Tasks: Cosméticos vinculados à conta (KD-38)

## Phase 1: Foundational

- [x] T001 Migration `set_equipped` (security definer, `search_path = ''`, revoga anon e `update(equipped)` direto; slots `hat|apron|theme`, id `^[a-z0-9_]{1,40}$`, posse por `user_cosmetics` ou gratuito) em supabase/migrations/*_set_equipped.sql
- [x] T002 pgTAP de permissões, posse, gratuito, formato e update direto bloqueado em supabase/tests/set_equipped_test.sql
- [x] T003 [P] `createCosmeticsService` (fetchAccountCosmetics, saveEquipped) + teste com cliente falso em src/services/cosmeticsService.js
- [x] T004 [P] `loadCosmeticsService` lazy + teste em src/services/cosmeticsLoader.js

## Phase 2: US1 — itens da conta no login

- [x] T005 [US1] Regra pura `applyAccountEquipped` + testes em src/features/cosmetics/cosmetics.js
- [x] T006 [US1] `applyAccountCosmetics` em src/features/cosmetics/cosmeticsStore.js
- [x] T007 [US1] `pullAccountCosmetics` + testes em src/features/cosmetics/cosmeticsSync.js
- [x] T008 [US1] `useCosmeticsSync` ligado no App em src/features/cosmetics/useCosmeticsSync.js e src/app/App.jsx

## Phase 3: US2 — desbloqueio do submit_score

- [x] T009 [US2] `onSubmitted` na outbox + teste em src/services/scoreOutbox.js
- [x] T010 [US2] App outbox chama `mergeUnlockedCosmetics` + teste em src/features/progress/scoreSync.js

## Phase 4: US3 — equipado na conta

- [x] T011 [US3] `equipAndSync`/`pushEquipped` + testes em src/features/cosmetics/cosmeticsSync.js
- [x] T012 [US3] Picker usa `equipAndSync` com `useAuth()` em src/features/cosmetics/CosmeticsPicker.jsx

## Phase 5: Polish

- [x] T013 Decisões em docs/ESTUDOS_E_DECISOES.md e §6.1 em docs/SYSTEM_DESIGN.md
- [x] T014 Gates e db:reset/db:test/lint

Dependências: T001→T002; T003→T004→T007/T011; T005→T006→T007; US1 e US2 independentes.

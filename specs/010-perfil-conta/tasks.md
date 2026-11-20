# Tasks: Perfil da conta

**Input**: [plan.md](plan.md), [spec.md](spec.md), [contracts/](contracts/)
**Tests**: obrigatórios em `services/` e lógica de feature (AGENTS §5).

## Phase 1: Setup

- [X] T001 Confirmar que nenhuma migration é necessária (grants de `display_name` e RPC `delete_my_account` em supabase/migrations/)

## Phase 2: Foundational

- [X] T002 [P] Criar `createProfileService` com `fetchDisplayName`, `updateDisplayName` e `deleteAccount` em src/services/profileService.js
- [X] T003 [P] Testar o serviço com cliente falso (23505 → taken, 23514 → invalid, rede → generic; RPC + signOut local) em src/services/profileService.test.js
- [X] T004 [P] Criar `loadProfileService` e teste em src/services/profileLoader.js e src/services/profileLoader.test.js

## Phase 3: User Story 1 - Trocar o nome (P1)

**Independent Test**: salvar `Chef_Ana` e ver o nome novo; `ab` dá erro de formato.

- [X] T005 [P] [US1] Criar `normalizeDisplayName`/`validateDisplayName` (regex `^[A-Za-z0-9_]{3,20}$`, trim, "unchanged") em src/features/profile/displayName.js
- [X] T006 [P] [US1] Testar a validação em src/features/profile/displayName.test.js
- [X] T007 [US1] Criar o formulário com estados loading/erro/sucesso em src/features/profile/DisplayNameForm.jsx
- [X] T008 [US1] Criar a seção de conta (só com sessão) e montá-la em src/features/profile/AccountSection.jsx e src/app/ProfilePage.jsx

## Phase 4: User Story 3 - Excluir a conta (P1)

**Independent Test**: confirmar no diálogo e voltar ao início como visitante.

- [X] T009 [US3] Criar o diálogo de confirmação e a chamada de exclusão em src/features/profile/DeleteAccountSection.jsx
- [X] T010 [US3] Incluir a seção em src/features/profile/AccountSection.jsx

## Phase 5: User Story 2 - Configurações na conta (P2)

**Independent Test**: mudar uma tecla com sessão e ver `saveSettings` chamado.

- [X] T011 [P] [US2] Criar `pullAccountSettings`/`pushAccountSettings` em src/features/settings/settingsSync.js
- [X] T012 [P] [US2] Testar o sync com serviço falso em src/features/settings/settingsSync.test.js
- [X] T013 [US2] Criar `useSettingsSync` e chamar no App; enviar ao mudar em src/features/settings/useSettingsSync.js, src/app/App.jsx, src/app/SettingsPage.jsx

## Phase 6: Polish

- [X] T014 Adicionar as chaves `profile.account.*` em src/i18n/pt-BR.json
- [X] T015 Registrar as decisões em docs/ESTUDOS_E_DECISOES.md
- [X] T016 Rodar os gates (`format:check`, `lint`, `test`, `build`, `check-size`)

## Dependencies

Phase 2 → US1, US3, US2 (independentes entre si); Polish no fim. T005/T006 e T011/T012 em paralelo.

## Implementation Strategy

MVP = US1 + US3 (escopo obrigatório da issue); US2 em seguida no mesmo PR.

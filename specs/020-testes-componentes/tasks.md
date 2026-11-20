# Tasks: Testes de componente das telas principais

## Phase 1: Setup

- [x] T001 Instalar `happy-dom` e `@testing-library/react@16.3.3` com `--save-exact` em package.json e package-lock.json
- [x] T002 Registrar a escolha do happy-dom em docs/ESTUDOS_E_DECISOES.md

## Phase 2: Foundational

- [x] T003 Criar helper de render com i18n, router, query e auth em src/test/renderWithProviders.jsx
- [x] T004 Excluir `*.test.jsx` da varredura de fontes em src/i18n/i18n.test.js

## Phase 3: User Story 1 — Telas protegidas contra regressão (P1)

**Independent test**: `npx vitest run src/app src/features` verde.

- [x] T005 [P] [US1] Home (título, Jogar, navegação, desafio, conta) em src/app/HomePage.test.jsx
- [x] T006 [P] [US1] Resultado, novo recorde e botões em src/features/match/MatchResult.test.jsx
- [x] T007 [P] [US1] Perfil com estado vazio em src/app/ProfilePage.test.jsx
- [x] T008 [P] [US1] Placar vazio, erro com retry e jogador atual em src/features/ranking/RankingPageContent.test.jsx
- [x] T009 [P] [US1] Aviso de migração (vazio, progresso, descartes, dispensar) em src/features/migration/MigrationNotice.test.jsx
- [x] T010 [P] [US1] Configurações e restaurar padrão em src/app/SettingsPage.test.jsx

## Phase 4: Polish

- [x] T011 Rodar format:check, lint, test, build e check-size conforme specs/020-testes-componentes/quickstart.md

## Dependencies

T001 → T003 → T005–T010 (paralelas) → T011.

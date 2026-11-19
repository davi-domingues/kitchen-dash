# Tasks: Versão de conteúdo no CI

## Phase 1: Setup

- [X] T001 Criar testes com fixtures para o check em `scripts/check-content-version.test.js`

## Phase 2: User Story 1 - Proteger envio após mudança de conteúdo (P1)

**Independent Test**: o check passa para a migration atual e falha para uma lista sem a versão atual.

- [X] T002 [US1] Implementar hash e inspeção da última migration relevante em `scripts/check-content-version.js`
- [X] T003 [US1] Cobrir versão presente, ausente e migration posterior irrelevante em `scripts/check-content-version.test.js`
- [X] T004 [US1] Executar o check no job Qualidade em `.github/workflows/ci.yml`

## Phase 3: Polish

- [X] T005 Documentar a exigência de migration de versão em `docs/SYSTEM_DESIGN.md`
- [X] T006 Rodar os gates de qualidade e o check diretamente

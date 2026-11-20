# Tasks: Migration automática de versão de conteúdo

## Phase 1: User Story 1 (P1)

- [x] T001 [US1] Testes de geração (cria migration, mantém versões antigas, idempotente, nome com timestamp) em `scripts/check-content-version.test.js`
- [x] T002 [US1] `writeAcceptedVersionsMigration` e flag `--write` em `scripts/check-content-version.js`
- [x] T003 [US1] Script `db:content-version` em `package.json`

## Phase 2: User Story 2 (P2)

- [x] T004 [US2] Teste e mensagem de falha citando `npm run db:content-version`

## Phase 3: Polish

- [x] T005 Registrar decisão em `docs/ESTUDOS_E_DECISOES.md`
- [x] T006 Gates locais (`format:check`, `lint`, `test`, `build`, `check-size`)

## Analyze

Cobertura: FR-001→T002 (reusa `readContentVersion`); FR-002/003/004→T001/T002; FR-005→T004; FR-006→sem mudança no workflow. Sem lacunas.

## Dependencies

T001 → T002 → T003 (US1, mesmo arquivo, sequenciais) → T004 (US2) → T005/T006. MVP = US1.

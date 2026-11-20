# Tasks: QA final e release do MVP

**Input**: `specs/030-qa-release/` (spec, plan, research, data-model, quickstart)
**Tests**: pedidos pela issue (US2: automatizar o que der sem dependência nova).

## Phase 1: Setup

- [x] T001 Criar a branch `docs/kd-46-qa-release` a partir de `origin/main` e rodar `npm ci`

## Phase 2: Foundational

- [x] T002 Levantar os PRs mergeados e abertos com `gh pr list` para as notas e o checklist

## Phase 3: User Story 1 — Checklist de lançamento (P1)

**Independent Test**: cada ponto da ARQUITETURA §9 e cada tema da issue tem `- [ ]` e o como verificar.

- [x] T003 [US1] Escrever `docs/RELEASE_CHECKLIST.md` com escopo §9, Turnstile, OTP, CSP, Sentry, banco/backups, PWA, LGPD, acessibilidade, riscos e versão
- [x] T004 [US1] Registrar no `docs/RELEASE_CHECKLIST.md` que a evidência vai na issue #39 e que falha vira issue (FR-008, FR-009)

## Phase 4: User Story 2 — 2 jogadores em todos os modos (P1)

**Independent Test**: `npx vitest run src/game/core/twoPlayerMatch.test.js` passa.

- [x] T005 [P] [US2] Teste `src/game/core/twoPlayerMatch.test.js`: Clássico até 180 s, Livre até `endMatch`, Desafio até o 12º pedido, Desafio do dia
- [x] T006 [P] [US2] Roteiro `docs/QA_MANUAL_v1.0.0.md`: teclado real, Chrome e Firefox, larguras 360/768/1280

## Phase 5: User Story 3 — Notas e versão (P2)

**Independent Test**: notas listam mergeados e previstos (#94–#106); `package.json` em 1.0.0.

- [x] T007 [P] [US3] Escrever `docs/RELEASE_NOTES_v1.0.0.md`
- [x] T008 [P] [US3] Registrar a política de versão em `docs/ESTUDOS_E_DECISOES.md` §13.9
- [x] T009 [US3] Subir `package.json` e `package-lock.json` para 1.0.0 com `npm version 1.0.0 --no-git-tag-version`

## Phase 6: Polish

- [x] T010 Rodar os gates locais (`format:check`, `lint`, `test`, `build`, `check-size`)
- [ ] T011 Verificar em produção e criar a tag `v1.0.0` (pessoa, após os merges)

## Dependencies

Setup → Foundational → US1, US2 e US3 em paralelo → Polish. T011 depende dos merges #94–#106.

## Parallel Example

T005 e T006 (US2) e T007 e T008 (US3) tocam arquivos diferentes.

## Implementation Strategy

MVP = US1 + US2 (checklist e prova de jogo de 2 jogadores); US3 fecha a comunicação da versão.

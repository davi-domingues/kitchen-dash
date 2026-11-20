# Tasks: Teste concorrente do envio de pontuação

## Phase 1: Setup

- [x] T001 Adicionar o script `db:test:concurrency` em `package.json`

## Phase 2: User Story 1 (P1) - Idempotência sob envios simultâneos

**Independent test**: `npm run db:test:concurrency` com o banco local no ar imprime `OK`.

- [x] T002 [US1] Ler URL e chave publicável de `npx supabase status -o env` em `scripts/submit-score-concurrency.js`
- [x] T003 [US1] Recusar host que não seja `127.0.0.1`/`localhost` em `scripts/submit-score-concurrency.js` (FR-004)
- [x] T004 [US1] Criar jogador `concurrency-<uuid>@example.com` em `scripts/submit-score-concurrency.js` (FR-001)
- [x] T005 [US1] Disparar 8 `submit_score` simultâneos com o mesmo `match_id` em `scripts/submit-score-concurrency.js` (FR-002)
- [x] T006 [US1] Exigir 1 linha em `scores` e `matches_played = 1`, com saída 0/1 em `scripts/submit-score-concurrency.js` (FR-003)

## Phase 3: Polish

- [x] T007 Registrar a decisão em `docs/ESTUDOS_E_DECISOES.md` (FR-005)
- [ ] T008 Rodar `npm run db:start && npm run db:reset && npm run db:test:concurrency` (manual; Docker indisponível nesta sessão)

## Dependencies

T001 → T002..T006 (mesmo arquivo, sequenciais) → T007/T008. Sem paralelismo útil.

## Strategy

MVP = US1 completa; a única história.

# Tasks: Envio de pontuação (KD-35)

## Phase 1: Foundational

- [x] T001 [P] `toBoard`, `classifyScoreError`, `createScoreService` com testes (board `^[a-z0-9_-]{1,40}$`; 54000/rede → retry, 22023/23505 → discard, 28000/42501 → auth) em src/services/scoreService.js e src/services/scoreService.test.js
- [x] T002 [P] `loadScoreService()` lazy com teste em src/services/scoreLoader.js e src/services/scoreLoader.test.js

## Phase 2: US1 + US2 (P1) — fila, envio e retry

- [x] T003 [US1] `createScoreOutbox` (`enqueue`, `flush`, `dispose`; itens `{ matchId, userId, attempts, nextAt }` em `kd:v1:outbox`) em src/services/scoreOutbox.js
- [x] T004 [US1] Testes: sucesso remove pendente; reenvio idempotente; usuário diferente não envia; pendente sumido sai da fila; sem paralelismo, em src/services/scoreOutbox.test.js
- [x] T005 [US2] Testes: backoff exponencial com jitter (rng fixo, relógio falso), timer reagendado, teto de 8 tentativas descarta, em src/services/scoreOutbox.test.js

## Phase 3: US3 (P2) — rejeições

- [x] T006 [US3] Testes: erro permanente descarta na 1ª tentativa; sem sessão para e mantém, em src/services/scoreOutbox.test.js

## Phase 4: Integração

- [x] T007 Instância do app ligando outbox a `loadProgress`/`removePending` em src/features/progress/scoreSync.js
- [x] T008 Hook `useScoreSync` (flush no login/abertura/evento `online`; enqueue+flush no fim de partida autenticada) em src/features/progress/useScoreSync.js, usado em src/app/PlayPage.jsx e src/main.jsx (via componente ScoreSync)
- [x] T009 Decisões em docs/ESTUDOS_E_DECISOES.md

## Dependências

T001,T002 → T003 → T004–T006 → T007 → T008. MVP: Phases 1–2.

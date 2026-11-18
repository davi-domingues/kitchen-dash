# Tasks: Core da partida (KD-11)

**Input**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md), [contracts/core-api.md](contracts/core-api.md)
**Tests**: obrigatórios (AGENTS.md §5: toda lógica do core vem com teste).

## Phase 1: Setup

- [x] T001 Confirmar que `src/game/core/` é coberto pelas regras de `no-restricted-imports` em `eslint.config.js`

## Phase 2: Foundational

- [x] T002 Expor `next.getState()` em `src/game/core/rng.js` (estado uint32 para retomar a sequência)
- [x] T003 Teste de retomada da sequência por `getState()` em `src/game/core/rng.test.js`
- [x] T004 [P] Declarar `CORE_EVENTS` (`order:delivered`, `match:ended`) e `createEvent(type, payload)` em `src/game/core/coreEvents.js`
- [x] T005 [P] Implementar `MATCH_STATUS` e `createMatchState` em `src/game/core/matchState.js` ("seed: inteiro; não inteiro → TypeError", "durationMs: número > 0 | null; ≤ 0 → RangeError", `rngState = seed >>> 0`, `items`/`orders` vazios)
- [x] T006 [P] Testes de criação e validação em `src/game/core/matchState.test.js`

## Phase 3: User Story 1 - Partida reproduzível (P1) 🎯 MVP

**Independent Test**: mesma seed + mesmas ações ⇒ mesmo estado e eventos.

- [x] T007 [US1] Implementar `createUpdate(systems)` em `src/game/core/update.js`: recria o RNG de `state.rngState`, avança `tick`, grava `rngState` ao fim, sem mutar o estado recebido
- [x] T008 [US1] Testes de determinismo (mesma seed igual, seeds diferentes distintas) em `src/game/core/update.test.js`

## Phase 4: User Story 2 - Relógio, pausa e fim por tempo (P1)

**Independent Test**: avançar, pausar, retomar e esgotar o tempo.

- [x] T009 [US2] Implementar `pauseMatch`/`resumeMatch` em `src/game/core/matchState.js` (só `running → paused` e `paused → running`)
- [x] T010 [US2] Em `src/game/core/update.js`: ignorar estados não `running`; rejeitar dt negativo/NaN/infinito com `RangeError`; limitar a `MAX_DT_MS = 250`; ao `elapsedMs >= durationMs` ir para `ended`, fixar `elapsedMs = durationMs` e emitir `match:ended` `{ seed, contentVersion, mode, score, durationMs }`
- [x] T011 [P] [US2] Testes de pausa/retomada em `src/game/core/matchState.test.js`
- [x] T012 [US2] Testes de relógio, teto de dt, dt inválido, pausa, fim único e partida sem limite em `src/game/core/update.test.js`

## Phase 5: User Story 3 - Sistemas plugáveis (P2)

**Independent Test**: sistemas rodam em ordem com o mesmo dt e inputs; eventos agregados.

- [x] T013 [US3] Executar sistemas `(state, { dtMs, inputs, rng }) => { state, events }` em ordem e agregar eventos em `src/game/core/update.js`
- [x] T014 [US3] Teste de ordem e argumentos dos sistemas em `src/game/core/update.test.js`

## Phase 6: Polish

- [x] T015 Rodar `npm run format:check && npm run lint && npm test && npm run build && npm run check-size`
- [x] T016 Registrar as decisões técnicas (rngState no estado, `MAX_DT_MS`, `match:ended` sem `matchId`) em `docs/ESTUDOS_E_DECISOES.md`

## Dependencies

Phase 2 → US1 → US2 → US3 (US2 e US3 tocam `update.js`, então são sequenciais). T004, T005 e T006 podem rodar em paralelo.

## Implementation Strategy

MVP = US1 (determinismo, critério de pronto da issue). US2 destrava o modo Clássico; US3 destrava KD-12 a KD-15.

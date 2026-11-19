---

description: "Task list for implementing Desafio do dia"
---

# Tasks: Desafio do dia

**Input**: Design documents from `specs/001-daily-challenge/`

**Prerequisites**: `specs/001-daily-challenge/plan.md`, `specs/001-daily-challenge/spec.md`, `specs/001-daily-challenge/research.md`, `specs/001-daily-challenge/data-model.md`, `specs/001-daily-challenge/contracts/match-ended.md`

**Tests**: Incluir testes no core conforme constituicao (regras deterministicas devem ter Vitest).

**Organization**: Tasks agrupadas por user story para entrega independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos distintos, sem dependencia)
- **[Story]**: US1, US2, US3 conforme spec

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Base de conteudo e i18n para o desafio do dia

- [x] T001 Criar catalogo de desafios diarios em `src/content/dailyChallenges.json` com campos `id`, `titleKey`, `descriptionKey`, `criteria`, `applicableModes`
- [x] T002 [P] Adicionar chaves e textos pt-BR para desafios diarios em `src/i18n/pt-BR.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilitarios deterministas para data UTC e selecao diaria

- [x] T003 Criar helper de data UTC (YYYY-MM-DD) em `src/game/core/dateUtc.js`
- [x] T004 Implementar selecao deterministica por data em `src/game/core/dailyChallenge/selectDailyChallenge.js`
- [x] T005 [P] Criar testes de determinismo em `src/game/core/dailyChallenge/selectDailyChallenge.test.js`

**Checkpoint**: Selecionar desafio por data UTC de forma deterministica

---

## Phase 3: User Story 1 - Jogar o desafio do dia (Priority: P1) ?? MVP

**Goal**: Garantir que o desafio do dia seja o mesmo para todos no mesmo dia

**Independent Test**: Duas execucoes no mesmo dia retornam o mesmo desafio e dias diferentes retornam desafios diferentes

### Implementation for User Story 1

- [x] T006 [P] [US1] Implementar parser do catalogo em `src/game/core/dailyChallenge/catalog.js` validando `id` unico e `applicableModes` nao vazio
- [x] T007 [US1] Expor API `getDailyChallenge` em `src/game/core/dailyChallenge/index.js` usando data UTC
- [x] T008 [US1] Exibir desafio do dia na home em `src/app/HomePage.jsx` usando i18n e API do core

**Checkpoint**: Desafio do dia visivel na home e consistente por data

---

## Phase 4: User Story 2 - Verificacao no fim da partida (Priority: P2)

**Goal**: Avaliar o desafio do dia ao encerrar a partida e incluir no resultado

**Independent Test**: Uma partida com criterios atendidos marca `completed = true` no resultado

### Implementation for User Story 2

- [x] T009 [P] [US2] Implementar avaliador em `src/game/core/dailyChallenge/evaluateDailyChallenge.js` usando `criteria` definidos em `src/content/dailyChallenges.json`
- [x] T010 [P] [US2] Criar testes do avaliador em `src/game/core/dailyChallenge/evaluateDailyChallenge.test.js`
- [x] T011 [US2] Incluir `dailyChallengeResult` no payload de encerramento em `src/game/phaser/scenes/KitchenScene.js`
- [x] T012 [US2] Atualizar contrato do EventBus em `src/game/phaser/events.js` com `dailyChallengeResult`

**Checkpoint**: Payload `match:ended` inclui resultado do desafio do dia

---

## Phase 5: User Story 3 - Conclusao diaria registrada (Priority: P3)

**Goal**: Persistir conclusao localmente e refletir status ao reabrir o jogo

**Independent Test**: Concluir desafio registra status e ele permanece visivel no mesmo dia

### Implementation for User Story 3

- [x] T013 [P] [US3] Implementar persistencia local em `src/services/dailyChallengeProgress.js` (regra: apenas uma conclusao por `dateUtc`)
- [x] T014 [US3] Registrar conclusao ao receber `match:ended` em `src/app/PlayPage.jsx`
- [x] T015 [US3] Exibir status de conclusao do dia em `src/app/HomePage.jsx` usando `src/services/dailyChallengeProgress.js`

**Checkpoint**: Status de conclusao permanece no mesmo dia

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T016 [P] Revisar textos e acessibilidade do desafio do dia em `src/app/HomePage.jsx`
- [ ] T017 Executar validacao do quickstart em `specs/001-daily-challenge/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependencias
- **Foundational (Phase 2)**: Depende de Setup
- **User Stories (Phase 3+)**: Dependem de Foundational
- **Polish (Phase 6)**: Depende das historias desejadas

### User Story Dependencies

- **US1 (P1)**: Comeca apos Phase 2
- **US2 (P2)**: Depende de US1 (usa selecao diaria)
- **US3 (P3)**: Depende de US2 (usa resultado no match end)

### Parallel Opportunities

- T002 pode rodar em paralelo com T001
- T005 pode rodar em paralelo com T004
- T009 e T010 podem rodar em paralelo
- T013 pode rodar em paralelo com T011/T012

---

## Parallel Example: User Story 2

```bash
Task: "Implementar avaliador em src/game/core/dailyChallenge/evaluateDailyChallenge.js"
Task: "Criar testes do avaliador em src/game/core/dailyChallenge/evaluateDailyChallenge.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1
4. Validar consistencia diaria

### Incremental Delivery

1. US1 -> desafio do dia consistente
2. US2 -> verificacao ao fim da partida
3. US3 -> registro local e status persistente

---

## Notes

- Tasks do core exigem testes em Vitest.
- Nenhuma dependencia nova deve ser adicionada.
- Todo texto exibido ao jogador deve usar i18n.

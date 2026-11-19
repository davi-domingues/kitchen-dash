# Tasks: Auto-uso de estações ao ficar parado (issue #89)

**Input**: documentos de design em `/specs/005-auto-uso-estacoes/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/auto-use-api.md`

**Tests**: solicitados na spec (critério de pronto: regra de tempo parado no core com teste)

**Organization**: tarefas agrupadas por user story para permitir implementação e teste independentes.

## Formato: `[ID] [P?] [Story] Descrição`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: user story atendida (US1 a US4)
- Caminhos exatos nos arquivos tocados

## Phase 1: Setup (infraestrutura compartilhada)

**Purpose**: criar o módulo de core e o arcabouço de testes determinísticos.

- [ ] T001 [P] Criar `src/game/core/idleSystem.js` com `IDLE_AUTO_MS = 250` e as assinaturas de `createIdleSystem(content)`, `selectAutoActions(state)`, `filterManualDuplicates(state, actions)` e `setIdleBlocked(state, blocked)`, conforme `specs/005-auto-uso-estacoes/contracts/auto-use-api.md`
- [ ] T002 [P] Criar `src/game/core/idleSystem.test.js` com helper de avanço de tempo em passos fixos de `dtMs` e seed determinística, sem relógio real

---

## Phase 2: Foundational (pré-requisitos bloqueantes)

**Purpose**: estado e composição de sistemas necessários para todas as histórias.

**CRÍTICO**: nenhuma user story começa antes desta fase.

- [ ] T003 Adicionar `idleMs`, `idleKey`, `autoAction` e `autoFired` ao chef em `src/game/core/stations.js` (`createChef`) e manter `x`, `y` e `facing` de `src/game/core/kitchenMap.js`; adicionar `idleBlocked` em `src/game/core/matchState.js` (`createMatchState`)
- [ ] T004 Registrar `createIdleSystem(content)` em `src/game/core/kitchenUpdate.js` (`createKitchenUpdate`), depois do movimento e antes do sistema de estações
- [ ] T005 Implementar em `src/game/core/idleSystem.js` a acumulação de `idleMs` por `dtMs`, o reinício quando há movimento, ação manual ou mudança de `idleKey`, e o bloqueio por `state.idleBlocked`
- [ ] T006 Escrever em `src/game/core/idleSystem.test.js` os testes de acumulação, reinício e bloqueio da regra de tempo parado

**Checkpoint**: fundação pronta — as histórias podem começar.

---

## Phase 3: User Story 1 - Picar sem apertar o botão (Priority: P1) — MVP

**Goal**: parar diante da tábua com ingrediente cru faz o chef picar sozinho, continuamente, até ele se mover ou o item deixar de estar cru.

**Independent Test**: em `src/game/core/idleSystem.test.js`, avançar passos até 250 ms com tábua cru e chef parado; verificar `holdStart` contínuo e que mover encerra a ação.

### Testes da User Story 1

- [ ] T007 [US1] Testar em `src/game/core/idleSystem.test.js`: nenhuma ação antes de 250 ms; `holdStart` na tábua depois do limiar; fim do corte ao mover ou ao item ficar picado

### Implementação da User Story 1

- [ ] T008 [US1] Implementar em `src/game/core/idleSystem.js` o gatilho da tábua: `holdStart` contínuo quando há item cru na estação e o chef está de mãos vazias, sem gerar eventos próprios
- [ ] T009 [US1] Implementar `selectAutoActions(state)` em `src/game/core/idleSystem.js`, devolvendo entradas com `auto: true` já com `stationId` resolvido
- [ ] T010 [US1] Consumir `selectAutoActions` em `src/game/phaser/scenes/KitchenScene.js` (`update`) e enviar as entradas ao `step`, sem timers nem EventBus novos
- [ ] T011 [US1] Adicionar em `src/game/core/kitchenUpdate.test.js` teste de integração: com item cru na tábua e chef parado, o corte avança sem entrada manual e para ao mover

**Checkpoint**: US1 funcional e testável isoladamente.

---

## Phase 4: User Story 2 - Usar fogão e passe só quando dá certo (Priority: P1)

**Goal**: ao ficar parado diante de fogão ou passe, agir uma única vez somente se a ação daria certo, sem avisos repetidos.

**Independent Test**: em `src/game/core/idleSystem.test.js`, manter o chef parado diante de estação inválida por vários passos (zero ações e zero recusas) e diante de estação válida (um `tap`).

### Testes da User Story 2

- [ ] T012 [US2] Testar em `src/game/core/idleSystem.test.js`: estação inválida por vários passos não gera `tap` nem `action:rejected`; estação válida gera um `tap` por mudança de estado/alvo

### Implementação da User Story 2

- [ ] T013 [US2] Implementar em `src/game/core/idleSystem.js` o gatilho one-shot do fogão e do passe usando `canInteract` e a assinatura do estado da estação em `autoFired`
- [ ] T014 [US2] Filtrar em `src/game/core/kitchenUpdate.js` os eventos `action:rejected` cuja entrada correspondente tenha `auto: true`, sem alterar `interact` nem o contrato KD-12
- [ ] T015 [US2] Adicionar em `src/game/core/kitchenUpdate.test.js` teste de integração: entrega automática gera um `dish:served` e nenhum `action:rejected`, inclusive quando outra chef muda a estação antes da aplicação

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Botão do jogador continua no controle (Priority: P1)

**Goal**: o botão prevalece sobre o auto-uso e não produz ação duplicada na mesma estação.

**Independent Test**: em `src/game/core/idleSystem.test.js`, apertar a ação antes do limiar cancela o auto pendente; após o auto ter disparado, um toque manual na mesma estação é removido.

### Testes da User Story 3

- [ ] T016 [US3] Testar em `src/game/core/idleSystem.test.js`: ação manual reinicia `idleMs` e cancela `autoAction`; `filterManualDuplicates` remove só o toque manual na estação já disparada e libera o botão ao mudar alvo ou estado

### Implementação da User Story 3

- [ ] T017 [US3] Implementar `filterManualDuplicates(state, actions)` em `src/game/core/idleSystem.js`, resolvendo a estação alvo com `findTargetStation` e preservando ações manuais em outras estações
- [ ] T018 [US3] Aplicar `filterManualDuplicates` a `pendingActions` em `src/game/phaser/scenes/KitchenScene.js` (`update`), antes de `toStationInputs`, mantendo o comportamento manual atual fora desses casos

**Checkpoint**: US1, US2 e US3 funcionam juntas e isoladamente.

---

## Phase 6: User Story 4 - Regra determinística e independente por chef (Priority: P2)

**Goal**: tempo parado determinístico, independente por chef e bloqueado durante pausa, blur e fim de partida.

**Independent Test**: em `src/game/core/idleSystem.test.js`, executar a mesma sequência de passos duas vezes e comparar decisões; verificar que um chef não afeta o outro e que `setIdleBlocked` congela a regra.

### Testes da User Story 4

- [ ] T019 [US4] Testar em `src/game/core/idleSystem.test.js`: dois chefs com tempos distintos produzem decisões independentes e a mesma sequência de passos reproduz as mesmas decisões
- [ ] T020 [US4] Testar em `src/game/core/idleSystem.test.js`: `setIdleBlocked(state, true)` zera contadores e impede ações e acúmulo; `false` retoma sem ação herdada

### Implementação da User Story 4

- [ ] T021 [US4] Implementar `setIdleBlocked(state, blocked)` em `src/game/core/idleSystem.js`, preservando imutabilidade do `MatchState`
- [ ] T022 [US4] Conectar blur, foco, `pause()` e `resume()` em `src/game/phaser/scenes/KitchenScene.js` a `setIdleBlocked`, registrando e removendo o listener de foco no `cleanup()` junto dos existentes

**Checkpoint**: todas as histórias funcionam de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: documentação, gates e revisão final.

- [ ] T023 Registrar em `docs/ESTUDOS_E_DECISOES.md` a decisão do limiar de 250 ms, o silêncio do auto-uso e a política de prevalência do botão, com o motivo e a data (2026-11-19)
- [ ] T024 Rodar em sequência `npm run lint`, `npm run format:check`, `npm test`, `npm run build` e `npm run check-size` e validar os cenários de `specs/005-auto-uso-estacoes/quickstart.md`
- [ ] T025 [P] Revisar o diff inteiro: sem código morto, comentários de depuração, `TODO` sem issue, texto visível novo fora do i18n ou dependência nova

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup; bloqueia todas as histórias
- **User Stories (Phases 3-6)**: dependem da Phase 2; US1 a US3 são P1 e US4 é P2
- **Polish (Phase 7)**: depende da conclusão das histórias desejadas

### User Story Dependencies

- **US1 (P1)**: começa após a Phase 2; não depende das outras histórias
- **US2 (P1)**: começa após a Phase 2; usa o mesmo sistema, mas testável isoladamente
- **US3 (P1)**: começa após a Phase 2; integra com as entradas manuais, sem depender de US1/US2 para ser testada
- **US4 (P2)**: começa após a Phase 2; amplia o sistema sem alterar a regra das histórias P1

### Within Each User Story

- Testes primeiro, verificando que falham antes da implementação
- Estado e helpers puros antes da integração na cena
- Core antes de Phaser
- Nenhuma tarefa de uma história altera arquivos de outra história já concluída

### Parallel Opportunities

- T001 e T002 (arquivos diferentes)
- Testes de histórias diferentes, se houver mais de uma pessoa (arquivos de teste distintos, exceto `idleSystem.test.js`, compartilhado)
- T025 pode rodar em paralelo à revisão final das demais tarefas

---

## Parallel Example: User Story 1

```bash
# Teste e implementação do core (sequência dentro do mesmo arquivo de teste):
Task: "T007 testar gatilho da tábua em src/game/core/idleSystem.test.js"
Task: "T008 implementar gatilho em src/game/core/idleSystem.js"
Task: "T009 implementar selectAutoActions em src/game/core/idleSystem.js"
# Integração e teste de integração (arquivos diferentes, paralelizáveis):
Task: "T010 consumir a decisão na KitchenScene"
Task: "T011 teste de integração em src/game/core/kitchenUpdate.test.js"
```

---

## Implementation Strategy

### MVP First (US1)

1. Concluir Phase 1 e Phase 2
2. Concluir Phase 3 (US1)
3. **PARAR E VALIDAR** com `npx vitest run src/game/core/idleSystem.test.js` e o cenário manual da tábua
4. Entregar o incremento antes de seguir

### Incremental Delivery

1. Setup + Foundational → base pronta
2. US1 → teste isolado → demo da tábua
3. US2 → teste isolado → demo de fogão/passe sem avisos
4. US3 → teste isolado → demo do botão sem duplicidade
5. US4 → teste isolado → demo com dois chefs e pausa

### Parallel Team Strategy

Com mais de uma pessoa, após a Phase 2: uma pessoa em US1/US2 (core de gatilhos) e outra em US3/US4 (dedupe, bloqueio e cena), com integração combinada antes da Phase 7.

---

## Notes

- `[P]` = arquivos diferentes, sem dependências entre si
- `[Story]` rastreia a origem de cada tarefa na spec
- Cada história deve ficar completa e testável antes de avançar
- Tests devem falhar antes da implementação correspondente
- Commits pequenos, em português, seguindo o AGENTS.md; gates locais antes de cada commit
- Evitar tarefas vagas, conflito no mesmo arquivo e dependências cruzadas entre histórias

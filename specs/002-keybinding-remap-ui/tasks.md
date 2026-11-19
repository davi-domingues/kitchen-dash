# Tasks: Tela de remapeamento de teclas

**Input**: Design documents from `/specs/002-keybinding-remap-ui/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/key-bindings-ui.md](./contracts/key-bindings-ui.md), [quickstart.md](./quickstart.md)

**Tests**: incluídos porque os gates do projeto exigem teste para toda lógica nova (`AGENTS.md` §5) e porque o Vitest roda sem DOM (issue #70). Os testes dos módulos puros vêm antes da integração de UI que os consome.

**Organização**: por história de usuário, para permitir entrega incremental. Cada fase termina em um incremento verificável.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: história da [spec](./spec.md) — US1, US2, US3, US4
- Todo caminho de arquivo é relativo à raiz do repositório

## Path Conventions

Projeto único: `src/`, sem pasta `tests/` separada — os testes ficam ao lado do módulo (`*.test.js`), como já ocorre em `src/game/input/` e `src/services/`.

---

## Phase 1: Setup

**Purpose**: preparar a base antes de tocar os arquivos compartilhados.

- [ ] T001 Sincronizar a branch `feat/remapear-teclas` com `git merge origin/main` e resolver os conflitos em `src/app/App.jsx` e `src/app/HomePage.jsx` antes de qualquer edição (mitigação de conflito com PRs abertos; sem rebase de branch publicada e sem force push) — **executada manualmente pela pessoa**, não pelo agente

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: rota, casca da tela e módulos puros que todas as histórias usam.

**⚠️ CRITICAL**: nenhuma história começa antes desta fase.

- [X] T002 [P] Acrescentar `nav.settings`, `settings.title`, `settings.intro` e `settings.storageWarning` em `src/i18n/pt-BR.json` — `nav.settings` é usado em T004 e as demais em T003, então as chaves entram no mesmo commit dessas tarefas (rodar o teste de i18n só ao fim do grupo)
- [X] T003 Criar `src/app/SettingsPage.jsx`: `<main>` com `<h1>` (`settings.title`) e `<p>` com `settings.intro`, cujo texto MUST citar P1, P2 e que, em partida de 1 jogador, os dois conjuntos controlam o mesmo chef (FR-014); link de volta para `/` no padrão de `PlayPage`, estado `useState(loadKeyBindings)`, leitura única de `storage.isPersistent` e o aviso `role="status"` com `settings.storageWarning` quando `false` (FR-016)
- [X] T004 [P] Adicionar o link `nav.settings` na `<nav aria-label={t('nav.label')}>` de `src/app/HomePage.jsx`, no mesmo padrão visual dos links de ranking e perfil
- [X] T005 Registrar a rota `/configuracoes` apontando para `SettingsPage` em `src/app/App.jsx`, sem `lazy` (a tela não importa Phaser); depende do esqueleto criado em T003
- [X] T006 [P] Acrescentar `keyOwner(bindings, code)` e `isDefaultKeyBindings(bindings)` em `src/game/input/keyBindings.js`, sem alterar `remapKey`/`sanitizeKeyBindings`: `keyOwner` devolve `{ player, control }`, `{}` para a pausa ou `null`; `isDefaultKeyBindings` compara os onze valores com `DEFAULT_KEY_BINDINGS` e devolve `false` para entrada inválida
- [X] T007 Acrescentar casos de `keyOwner` (jogador, pausa e tecla livre) e `isDefaultKeyBindings` (padrão, personalizado e inválido) em `src/game/input/keyBindings.test.js`
- [X] T008 [P] Criar `src/features/settings/captureKey.js` com `classifyCaptureKey({ code, repeat = false })` e `isModifierCode(code)`: `Escape`/`Tab` → `'cancel'`, `repeat: true` → `'ignore'`, `ShiftLeft/Right`, `ControlLeft/Right`, `AltLeft/Right`, `MetaLeft/Right` → `'ignore'`, `code` vazio → `'ignore'`, resto → `'bind'` (inclui `Enter` e `Space`)
- [X] T009 Criar `src/features/settings/captureKey.test.js` cobrindo Esc, Tab, **evento repetido (`repeat: true`)**, os quatro modificadores, `Enter`, `Space`, tecla comum e `code` vazio; o caso de repetição afirma `'ignore'` (tecla segurada não regrava nem encerra a captura)
- [X] T010 [P] Criar `src/features/settings/keyLabels.js` com `keyLabel(code)` devolvendo **somente o `labelId`** (`'arrowUp'`, `'enter'`, `'a'`, `'1'`, `'numpad1'`, `'unknown'`), sem receber `t` e sem importar i18n; nunca devolve string vazia
- [X] T011 Criar `src/features/settings/keyLabels.test.js` cobrindo seta, Enter, letra, dígito, numpad e desconhecido; nenhuma asserção de texto traduzido
- [X] T012 [P] Criar `src/features/settings/statusMessage.js` com `boundMessage`, `swappedMessage`, `sameMessage`, `cancelledMessage`, `restoredMessage`, `alreadyDefaultMessage` e `modifierMessage`, devolvendo apenas `{ kind, params }` com `kind` de conjunto fechado
- [X] T013 Criar `src/features/settings/statusMessage.test.js` cobrindo cada `kind` e o formato dos `params`

**Checkpoint**: rota acessível, casca com aviso de storage e módulos puros verdes.

---

## Phase 3: User Story 1 — Trocar a tecla de um controle (Priority: P1) 🎯

**Goal**: listar os onze controles e permitir trocar qualquer tecla, salvando na hora.

**Independent Test**: abrir `/configuracoes`, trocar a ação de P1 para `L`, recarregar e jogar com `L`.

### Implementation for User Story 1

- [X] T014 [US1] Criar `src/features/settings/KeyBindingsPanel.jsx` com três `<section>` e `<h2>`: `settings.players.p1`, `settings.players.p2` e `settings.players.pause`; ordem fixa `up`, `down`, `left`, `right`, `action` (pausa é item único); declarar nele a **única** região `<p role="status" aria-live="polite">` que recebe a mensagem de estado vinda de `SettingsPage`, sem outra região viva para as ações; incluir as chaves em `src/i18n/pt-BR.json`
- [X] T015 [US1] Criar `src/features/settings/KeyBindingRow.jsx` como `<button type="button">` com `aria-label={t('settings.change', { control })}`, nome do controle (`settings.controls.*`), tecla atual (`settings.current`) e instrução (`settings.capture.hint`); incluir as chaves no dicionário
- [X] T016 [US1] Traduzir o `labelId` de T010 em `src/features/settings/KeyBindingRow.jsx` com um `switch` de chamadas literais `t('settings.keys.arrowUp')`, …, `t('settings.keys.unknown', { code })`; letras e dígitos são exibidos como caractere derivado do `code`; incluir exatamente as chaves usadas
- [X] T017 [US1] Implementar a captura em `src/features/settings/KeyBindingRow.jsx`: armar no clique/ativação, ignorar `event.repeat` e o keydown que armou a linha, chamar `classifyCaptureKey` e, para `'bind'`, aplicar `remapKey(bindings, slot, code)` sem nunca escrever tecla repetida (invariante dos onze `code` distintos)
- [X] T018 [US1] Persistir cada troca em `src/app/SettingsPage.jsx` chamando `saveKeyBindings(next)` antes de atualizar o estado, e publicar a mensagem de `statusMessage` (`settings.status.bound` / `settings.status.same`) na única região `<p role="status" aria-live="polite">` declarada no `KeyBindingsPanel` (T014); acrescentar `settings.status.bound` e `settings.status.same` em `src/i18n/pt-BR.json` no mesmo commit das chamadas literais (FR-003, FR-010, FR-015)
- [X] T019 [US1] Verificar que `src/app/PlayPage.jsx` continua lendo `loadKeyBindings()` na montagem e que a próxima partida usa as teclas novas, sem alterar o arquivo (FR-003)

**Checkpoint**: troca de tecla livre e persistência funcionando; US1 testável sozinha.

---

## Phase 4: User Story 2 — Operar a tela só com o teclado (Priority: P1)

**Goal**: percorrer, trocar e cancelar apenas com teclado, com foco visível e resultado anunciado.

**Independent Test**: com mouse desligado do fluxo, percorrer com `Tab`/`Shift+Tab`, trocar uma tecla, cancelar com `Esc` e com `Tab`.

### Implementation for User Story 2

- [X] T020 [US2] Tratar `'cancel'` em `src/features/settings/KeyBindingRow.jsx`: `Escape` encerra a captura com `preventDefault()` e anúncio `settings.status.cancelled`; `Tab` encerra **sem** `preventDefault()`, deixando o foco avançar (FR-006, FR-009); acrescentar `settings.status.cancelled` em `src/i18n/pt-BR.json` no mesmo commit da chamada literal
- [X] T021 [US2] Cancelar a captura em `blur` da linha e na desmontagem do componente, sem gravar nada, em `src/features/settings/KeyBindingRow.jsx`; manter o foco no botão quando a saída for causada pelo próprio `Esc` (FR-006, FR-009)
- [X] T022 [US2] Em `src/features/settings/KeyBindingsPanel.jsx`, ajustar apenas os atributos da única `<p role="status" aria-live="polite">` criada em T014 — sem criar uma segunda região viva —, ligar `aria-describedby` à instrução de captura e não usar `tabIndex` positivo; critério explícito: foco visível em todo elemento focável (anel de foco do tema) e ordem de foco coerente com a ordem DOM, P1 → P2 → pausa → restaurar (FR-009, FR-010, FR-015)
- [X] T023 [US2] Garantir recusa com orientação para modificador isolado (`settings.status.modifier`) mantendo a captura ativa em `src/features/settings/KeyBindingRow.jsx`, e retorno de foco ao controle após cancelar (`src/features/settings/KeyBindingRow.jsx` e `src/app/SettingsPage.jsx`) (FR-007, FR-009); acrescentar `settings.status.modifier` em `src/i18n/pt-BR.json` no mesmo commit da chamada literal

**Checkpoint**: fluxo completo sem mouse, com anúncios; US1 continua funcionando.

---

## Phase 5: User Story 3 — Resolver conflito entre duas funções (Priority: P2)

**Goal**: ao escolher tecla de outro controle, trocar as duas teclas e informar quais trocaram.

**Independent Test**: definir a ação de P1 como `KeyW` (cima de P2) e conferir que "Cima" de P2 recebeu a tecla antiga da ação de P1, sem repetição.

### Implementation for User Story 3

- [X] T024 [US3] Em `src/features/settings/KeyBindingRow.jsx`, consultar `keyOwner(bindings, code)` **antes** de `remapKey` e usar o slot retornado para compor `swappedMessage` com os dois controles e as duas teclas
- [X] T025 [US3] Acrescentar `settings.status.swapped` em `src/i18n/pt-BR.json` com parâmetros para controle, tecla, outro controle e tecla anterior; exibir somente a última mensagem, sem acumular
- [X] T026 [US3] Acrescentar em `src/game/input/keyBindings.test.js` um caso de conflito entre jogadores diferentes (`p1.action` recebendo tecla de `p2`) garantindo que a troca mantém os onze `code` distintos

**Checkpoint**: conflito resolvido por troca e comunicado; nenhuma tecla com duas funções.

---

## Phase 6: User Story 4 — Restaurar o padrão (Priority: P3)

**Goal**: devolver os onze controles ao padrão com confirmação e aviso quando já estão no padrão.

**Independent Test**: trocar duas teclas, restaurar, recarregar; repetir já no padrão e conferir o aviso.

### Implementation for User Story 4

- [X] T027 [US4] Criar `src/features/settings/RestoreDefaultsDialog.jsx` no padrão de `src/features/match/PauseDialog.jsx`: `<dialog className="modal">` aberto com `showModal()` em `useEffect`, fechado no cleanup, `aria-labelledby`, ação principal com `autoFocus`, `onCancel` com `preventDefault()` e fechamento; incluir `settings.restore.title/body/confirm/cancel` em `src/i18n/pt-BR.json` no mesmo commit das chamadas literais
- [X] T028 [US4] Ligar o botão `settings.restore.button` em `src/app/SettingsPage.jsx`: abrir o diálogo, aplicar `sanitizeKeyBindings(null)` ao confirmar, salvar com `saveKeyBindings` e anunciar `settings.status.restored`; devolver o foco ao botão ao fechar; acrescentar `settings.restore.button` e `settings.status.restored` em `src/i18n/pt-BR.json` no mesmo commit das chamadas literais
- [X] T029 [US4] Em `src/app/SettingsPage.jsx`, quando `isDefaultKeyBindings(bindings)` for `true`, confirmar sem alterar nada e anunciar `settings.status.alreadyDefault`, mantendo o botão habilitado (sem `disabled`); acrescentar `settings.status.alreadyDefault` em `src/i18n/pt-BR.json` no mesmo commit da chamada literal

**Checkpoint**: restauração com confirmação acessível e aviso do caso "já no padrão".

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T030 [P] Rodar `npm test` em todo o repositório e conferir que `src/i18n/i18n.test.js` passa sem chave faltante nem chave sem uso
- [X] T031 [P] Rodar `npm run lint` e `npm run format:check` em todo o repositório e corrigir o que aparecer nos arquivos tocados
- [X] T032 [P] Rodar `npm run build` e `npm run check-size` e confirmar que o JS inicial segue ≤ 250 KB gzip (`dist/`)
- [X] T033 Confirmar que `package.json` e `package-lock.json` não mudaram (`git diff -- package.json package-lock.json` vazio)
- [ ] T034 Executar os cenários M1–M15 de [quickstart.md](./quickstart.md) e registrar o resultado para o corpo do PR, incluindo foco preso, `Esc`, retorno de foco, foco visível e ordem de foco (T022), `aria-live`, o aviso de armazenamento indisponível (M12) e as preferências corrompidas caindo no padrão sem aviso (M15, FR-004)
- [ ] T035 Preparar o texto do PR com `Closes #75`, listando as exceções e o débito das dicas fixas da home (`home.howTo.*`); abrir o PR é ação da pessoa, e o merge também

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)**: sem dependências; bloqueia as edições em `App.jsx`/`HomePage.jsx`
- **Foundational (T002–T013)**: depende de T001; bloqueia todas as histórias
- **US1 (T014–T019)**: depende de T002–T013
- **US2 (T020–T023)**: depende de US1 (mesmos componentes)
- **US3 (T024–T026)**: depende de US1; pode rodar em paralelo com US2 se a pessoa aceitar conflito em `KeyBindingRow.jsx`
- **US4 (T027–T029)**: depende de T003 e T006; independente de US2/US3
- **Polish (T030–T035)**: depende das histórias que entrarão no PR

### User Story Dependencies

- **US1 (P1)**: base de todas as outras
- **US2 (P1)**: mesma tela de US1, acrescenta teclado/anúncios
- **US3 (P2)**: acrescenta a mensagem de troca; não quebra US1/US2
- **US4 (P3)**: isolada, usa apenas `SettingsPage` e `keyBindings`

### Parallel Opportunities

- T003 e T004 (arquivos diferentes, ambos depois de T002)
- T006, T008, T010, T012 (módulos puros diferentes)
- T007, T009, T011, T013 (testes correspondentes, cada um depende do seu módulo)
- T030, T031, T032 (gates independentes)
- US3 e US4 podem ser tocadas por pessoas diferentes se `KeyBindingRow.jsx` e `RestoreDefaultsDialog.jsx` forem arquivos separados no momento

---

## Parallel Example: Foundational

```bash
# Módulos puros, arquivos diferentes:
Task: "Implementar keyOwner/isDefaultKeyBindings em src/game/input/keyBindings.js"
Task: "Implementar classifyCaptureKey em src/features/settings/captureKey.js"
Task: "Implementar keyLabel em src/features/settings/keyLabels.js"
Task: "Implementar statusMessage em src/features/settings/statusMessage.js"

# Depois, os testes de cada um:
Task: "Testar keyOwner/isDefaultKeyBindings em src/game/input/keyBindings.test.js"
Task: "Testar repeat/Esc/Tab em src/features/settings/captureKey.test.js"
Task: "Testar labelIds em src/features/settings/keyLabels.test.js"
Task: "Testar kinds em src/features/settings/statusMessage.test.js"
```

---

## Implementation Strategy

### MVP First

1. T001 (merge) → T002–T013 (foundational)
2. T014–T019 (US1): já entrega troca de tecla com persistência
3. T020–T023 (US2): completa o requisito de acessibilidade por teclado, também P1
4. **STOP and VALIDATE**: rodar quickstart M1–M8 e M13–M14
5. US3 (conflito) e US4 (restaurar) em incrementos separados

### Incremental Delivery

1. Foundational → rota e helpers puros
2. US1 → troca + persistência (MVP funcional)
3. US2 → teclado e anúncios (MVP completo, por serem duas histórias P1)
4. US3 → conflito por troca
5. US4 → restauração com confirmação
6. Polish → gates, quickstart e PR

### Parallel Team Strategy

- Pessoa A: US1 e depois US2 (mesmos arquivos)
- Pessoa B: US3 depois de US1 (mensagem de troca em `KeyBindingRow.jsx`)
- Pessoa C: US4 em paralelo (`RestoreDefaultsDialog.jsx` + `SettingsPage.jsx`)

---

## Notes

- Testes automatizados só para módulos puros; foco, `<dialog>` e `aria-live` ficam manuais (issue #70).
- Toda chave nova de i18n entra junto com a chamada literal que a usa, senão `i18n.test.js` falha por chave sem uso.
- Nenhuma dependência nova: `package.json` e o lockfile não podem mudar.
- Commits pequenos por tarefa ou grupo lógico, em Conventional Commits PT-BR; sem push, PR ou merge sem aprovação da pessoa.

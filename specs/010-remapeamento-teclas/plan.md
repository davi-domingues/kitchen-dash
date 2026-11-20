# Implementation Plan: Tela de remapeamento de teclas

**Branch**: `feat/remapear-teclas` | **Date**: 2026-11-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-remapeamento-teclas/spec.md`

## Summary

Entregar a tela de configuração de teclas que falta para o remapeamento já existente. A tela lista os onze controles (P1, P2 e pausa), captura a nova tecla, salva na hora em `settings`, resolve conflito por troca, restaura o padrão com confirmação em `<dialog>` nativo e avisa quando o armazenamento não é persistente.

A lógica de remapear e restaurar fica em funções puras testadas no Vitest (`remapKey` já existe; entram `keyOwner`, `isDefaultKeyBindings`, `classifyCaptureKey` e `keyLabel`). Como não há ambiente de teste de DOM (issue #70), foco preso, Esc e retorno de foco são verificados manualmente e descritos no [quickstart](./quickstart.md). Nenhuma dependência nova.

## Technical Context

**Language/Version**: JavaScript ES2024, ESM, sem TypeScript; Node >= 24 (build e testes)

**Primary Dependencies**: React 19.3.1, react-router 8.5.1, react-i18next 18.0.1, i18next 27.1.1, daisyUI 5.8.0, Tailwind 4.3.5, lucide-react 1.72.0. **Nenhuma dependência nova.**

**Storage**: `localStorage` somente via `services/storage.js` (chave versionada `kd:v1:settings`), com fallback em memória quando indisponível (`storage.isPersistent`)

**Testing**: Vitest 5.1 em modo `run`, sem ambiente DOM (issue #70). Só módulos puros têm teste automatizado; acessibilidade e interação são validadas no quickstart.

**Target Platform**: navegador desktop com teclado físico; SPA servida estática, pt-BR no MVP

**Project Type**: web app SPA, projeto único

**Performance Goals**: nenhuma meta própria de runtime; a rota não pode carregar Phaser e o JS inicial da home deve continuar ≤ 250 KB gzip (SYSTEM_DESIGN §8.5)

**Constraints**: sem dependência nova; todo texto visível em `i18n/pt-BR.json` com chave literal em cada `t('…')` (o `i18n.test.js` só reconhece chaves literais); `<dialog>` nativo no lugar de lib de modal; nada de backend nem rede

**Scale/Scope**: uma rota nova, uma tela, onze controles, três componentes de UI e três módulos puros

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação | Como o plano atende |
|---|---|---|
| I. O jogo funciona sem rede | Passa | A tela lê e grava só preferências locais; nenhuma chamada de rede no fluxo |
| II. O cliente não é confiável | Passa (n/a) | Nada vai ao servidor; ranking e progresso não são tocados |
| III. Regras separadas de renderização | Passa | `remapKey`/`sanitizeKeyBindings` seguem em `game/input` (puro); helpers novos também são puros e testados; componentes só renderizam |
| IV. Conteúdo é dado | Passa | Todas as strings em `i18n/pt-BR.json`; nenhuma string literal na tela |
| V. Fornecedores atrás de interfaces | Passa | `localStorage` só por `services/storage.js`; sem fornecedor novo |
| VI. Caber no plano gratuito | Passa | Rota pequena, sem asset novo; `check-size` no CI |
| Restrições técnicas | Passa | Sem TypeScript, sem dependência nova, acessibilidade básica do §8.2, sem PII |

Sem violações: a seção de Complexidade fica vazia.

## Project Structure

### Documentation (this feature)

```text
specs/010-remapeamento-teclas/
├── plan.md              # Este arquivo
├── research.md          # Phase 0: decisões e alternativas
├── data-model.md        # Phase 1: entidades, validação e transições
├── quickstart.md        # Phase 1: validação manual e gates
├── contracts/
│   └── key-bindings-ui.md   # API dos módulos puros + contrato de DOM, a11y e i18n
├── checklists/
│   └── requirements.md
├── spec.md
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── App.jsx                 # + rota /configuracoes
│   ├── HomePage.jsx            # + link "Configurações" na navegação principal
│   └── SettingsPage.jsx        # novo: casca da tela, estado e persistência
├── features/
│   └── settings/               # nova fatia vertical
│       ├── KeyBindingsPanel.jsx    # lista P1, P2 e pausa + aviso de armazenamento
│       ├── KeyBindingRow.jsx       # um controle: exibe a tecla e captura a nova
│       ├── RestoreDefaultsDialog.jsx # <dialog> nativo, padrão do PauseDialog
│       ├── captureKey.js           # puro: classifica o keydown da captura
│       ├── captureKey.test.js
│       ├── keyLabels.js            # puro: devolve o labelId a partir do code (sem i18n)
│       ├── keyLabels.test.js       # só labelIds; não traduz
│       ├── statusMessage.js        # puro: resultado da ação → chave de i18n
│       └── statusMessage.test.js
├── game/input/
│   ├── keyBindings.js          # + keyOwner() e isDefaultKeyBindings()
│   └── keyBindings.test.js     # + casos dos dois helpers
├── i18n/pt-BR.json             # + namespace `settings.*` e `nav.settings`
└── services/
    ├── settings.js             # reutilizado (load/save)
    └── storage.js              # reutilizado (isPersistent)
```

**Structure Decision**: projeto único. Páginas seguem em `src/app/` (como `PlayPage` e `HomePage`); a fatia `src/features/settings/` guarda componentes e helpers da tela, sem lógica de jogo. As regras de teclas continuam em `src/game/input/keyBindings.js`, que já concentra o modelo dos onze controles, e recebem apenas dois helpers de leitura. `src/services/` não muda, porque `loadKeyBindings`, `saveKeyBindings` e `storage.isPersistent` já cobrem a persistência.

## Phase 1 — Design

### Fluxo da tela

1. `SettingsPage` carrega `loadKeyBindings()` uma vez e lê `storage.isPersistent` para o aviso do FR-016.
2. `KeyBindingsPanel` renderiza três grupos: *Jogador 1*, *Jogador 2* e *Pausa*, cada um com seus controles em ordem fixa (`up`, `down`, `left`, `right`, `action`).
3. Cada `KeyBindingRow` é um `<button>` que mostra o rótulo do controle, a tecla atual e, quando em captura, a instrução "pressione a tecla".
4. Ao acionar o botão, a linha entra em captura e mantém o foco. O `onKeyDown` da linha classifica a tecla:

   | Entrada | Resultado |
   |---|---|
   | `Escape` | cancela a captura, `preventDefault()`, sem mudar nada |
   | `Tab` | cancela a captura e **não** faz `preventDefault()`, para o foco seguir |
   | evento repetido do sistema (`event.repeat`) | ignorado: não regrava, não encerra a captura nem gera mensagem |
   | a própria tecla que ativou o botão | não conta: a captura só considera keydowns posteriores ao que a armou |
   | modificador isolado (`ShiftLeft/Right`, `ControlLeft/Right`, `AltLeft/Right`, `MetaLeft/Right`) | recusa, mantém a captura, anuncia a orientação |
   | tecla já usada pelo próprio controle | encerra a captura e anuncia "já é a tecla atual" |
   | tecla de outro controle | `remapKey` troca as duas e anuncia a troca |
   | qualquer outra tecla (inclui `Enter` e `Space`) | `preventDefault()` e vira a nova tecla |

5. Toda ação chama `saveKeyBindings(next)` antes de atualizar o estado. O resultado vira `{ kind, params }` em `statusMessage.js` e é renderizado na única `<p role="status" aria-live="polite">` do `KeyBindingsPanel`.
6. "Restaurar padrão" abre `RestoreDefaultsDialog` (`<dialog>` + `showModal()`), com foco preso pelo navegador e cancelável por Esc. Confirmar aplica `DEFAULT_KEY_BINDINGS` (via `sanitizeKeyBindings(null)`) e salva; se `isDefaultKeyBindings()` já for verdadeiro, só anuncia que está no padrão. Ao fechar, o foco volta ao botão que abriu.
7. `App.jsx` ganha `path="/configuracoes"`; `HomePage` ganha o link `nav.settings` na navegação principal, e `src/features/match/MatchSetup.jsx` ganha um link para `/configuracoes` (entrada adicionada pelo PR #85, ver FR-001).

### Contrato de captura e acessibilidade

- A captura acontece no próprio botão, com `aria-describedby` apontando para a instrução e `aria-live` para o resultado; não há armadilha de foco fora do `<dialog>`.
- A linha só passa a aceitar a captura **depois** do evento que a armou: o keydown de `Enter`/`Space` que ativou o botão não pode virar binding. Na prática, o handler só classifica keydowns com a captura já armada, e `event.repeat` é descartado antes da classificação.
- `Enter`/`Space` durante a captura usam `preventDefault()` para não reativar o botão; por isso voltar a ação de P1 para `Enter` e a de P2 para `Space` funciona (decisão da clarificação).
- O aviso do FR-016 é um `role="status"` fixo no topo do painel, exibido só quando `storage.isPersistent` é `false`.
- O `<dialog>` usa `aria-labelledby`, `autoFocus` na ação principal e o mesmo par `onCancel` + `showModal()` do `PauseDialog`.

### i18n

Chaves novas, todas referenciadas literalmente no ponto de uso:

O `keyLabels.js` **não traduz**: devolve apenas o `labelId`, um identificador estável do rótulo (`arrowUp`, `enter`, `digit7`, `unknown`). A tradução fica no componente, em um `switch` com chamadas literais `t('settings.keys.arrowUp')`, `t('settings.keys.enter')`, `t('settings.keys.unknown', { code })` e assim por diante. Essa separação mantém o módulo puro testável sem React e preserva a detecção literal do `i18n.test.js`.

| Chave | Uso |
|---|---|
| `nav.settings` | link na home |
| `settings.title`, `settings.intro` | cabeçalho da tela e explicação de P1/P2/1 jogador (FR-014) |
| `settings.players.p1`, `settings.players.p2`, `settings.players.pause` | títulos dos grupos |
| `settings.controls.up/down/left/right/action` | nome do controle |
| `settings.change` (com `{{control}}`) | `aria-label` do botão de cada controle |
| `settings.capture.hint` | instrução durante a captura |
| `settings.current` (com `{{key}}`) | tecla atual anunciada |
| `settings.restore.button/title/body/confirm/cancel` | botão e modal |
| `settings.status.bound/swapped/same/cancelled/restored/alreadyDefault/modifier` | mensagens de estado |
| `settings.storageWarning` | aviso de armazenamento indisponível |
| `settings.keys.arrowUp/arrowDown/arrowLeft/arrowRight/enter/space/escape/tab/backspace/delete/home/end/pageUp/pageDown/insert` | rótulos de teclas nomeadas, traduzidos pelo `switch` literal do componente |
| `settings.keys.unknown` (com `{{code}}`) | fallback para teclas sem nome conhecido |

Letras e números (`KeyA`…`KeyZ`, `Digit0`…`Digit9`, `Numpad*`) exibem o caractere derivado do `code`, tratado como dado e não como texto traduzível (mesma regra de números de pontuação no HUD).

### Persistência

- Nenhuma alteração em `services/settings.js`: `saveKeyBindings` já sanitiza e preserva as outras preferências de `settings`.
- `remapKey` já garante o conjunto completo e sem repetição; a tela nunca escreve fora dele.
- A partida seguinte lê as teclas de novo porque `PlayPage` monta `loadKeyBindings()` por visita (FR-003).

### Testes

- `captureKey.test.js`: `Escape`, `Tab`, **evento repetido (`repeat: true`)**, os quatro modificadores, `Enter`, `Space`, tecla comum e `code` vazio. O caso de repetição garante que segurar a tecla não regrave o binding nem encerre a captura.
- `keyLabels.test.js`: só labelIds — seta, `Enter`, letra, dígito, numpad e desconhecido. Nenhuma asserção de texto traduzido.
- `statusMessage.test.js`: cada `kind` e o formato dos `params`.
- `keyBindings.test.js`: casos novos de `keyOwner` e `isDefaultKeyBindings`.
- Foco, `<dialog>` e `aria-live` não têm teste automatizado (issue #70); ficam no quickstart.

### Risco de integração com PRs abertos

`src/app/App.jsx` e `src/app/HomePage.jsx` são pontos de passagem de quase toda feature (lista de `<Route>` e `<nav>` principal). PRs abertos que mexam neles tornam o conflito de merge provável.

- **Mitigação obrigatória**: antes de implementar, sincronizar a branch com `git merge origin/main` (sem rebase de branch publicada e sem force push), resolver os conflitos nessa base e só então acrescentar a rota e o link.
- Repetir o merge antes de abrir o PR e rodar os gates **depois** do merge, não antes.
- Manter as mudanças em `App.jsx`/`HomePage.jsx` em um commit pequeno e isolado, para que a resolução de conflito seja trivial.

### Débito conhecido (fora de escopo)

- As dicas fixas da home (`home.howTo.move`, `home.howTo.pause`) continuam citando setas/WASD/P mesmo depois de um remapeamento. A spec não pede atualizá-las; registrar como issue `débito` se a pessoa quiser tratamento.

## Complexity Tracking

Sem violações da constituição; nada a justificar.

## Constitution Check — reavaliação pós-design

Depois de fechar componentes, módulos puros, contrato e quickstart, os seis princípios continuam atendidos:

- Nenhum módulo novo toca `localStorage` fora de `services/`; a tela não importa fornecedor.
- Os helpers novos são funções puras em `game/input` e `features/settings`, sem DOM, mantendo a regra separada da renderização.
- Nenhuma string visível fora do dicionário; as chaves são literais em cada `t()`.
- Nenhuma dependência adicionada e nenhuma chamada de rede.
- A verificação de foco, Esc e `aria-live` fica documentada como manual no quickstart, coerente com a issue #70.

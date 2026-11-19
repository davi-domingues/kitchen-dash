# Research — Tela de remapeamento de teclas

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-19

Todas as incógnitas do Technical Context foram resolvidas por leitura do código existente, dos docs e das decisões da pessoa na sessão. Nenhum `NEEDS CLARIFICATION` permanece.

---

## R1. Onde a tela vive

- **Decision**: rota nova `/configuracoes` em `src/app/SettingsPage.jsx`, com link na navegação principal da home, e componentes em `src/features/settings/`.
- **Rationale**: segue o padrão do projeto — páginas de rota em `src/app/` (`HomePage`, `PlayPage`, `RankingPage`) e componentes por fatia em `src/features/`. `App.jsx` já concentra as rotas e a home já tem a `<nav>` principal com `nav.label`.
- **Alternatives considered**:
  - Modal na home: esconderia a tela da navegação e dificultaria deep-link.
  - Seção dentro de `/perfil`: `ProfilePage` ainda é placeholder e o SYSTEM_DESIGN reserva `profile/` para conta e sincronização (KD-34/KD-37); misturar agora criaria conflito futuro.

## R2. Textos e i18n com chave literal

- **Decision**: cada chave é referenciada por uma chamada literal `t('settings.…')` no ponto de uso. `keyLabels.js` apenas devolve um identificador estável do rótulo (`arrowUp`, `enter`, `unknown`); a tradução acontece no componente, em um `switch` de `t()` literais. Sem construção de chave em runtime.
- **Rationale**: `src/i18n/i18n.test.js` descobre chaves usadas com a regex `\bt\(\s*['"]([\w.]+)['"]`, e a segunda regra falha com **qualquer** chave do dicionário sem uso. Chave dinâmica (`t(`settings.keys.${code}`)`) apareceria como não usada e quebraria o CI. O padrão já é usado em `MatchSetup` (`playerLabels`, `modeLabels`), que monta objetos com `t()` literal.
- **Alternatives considered**:
  - Registrar as chaves de teclas em `usedKeys` como `contentKey` faz com o conteúdo: exigiria alterar o teste e criaria exceção permanente.
  - Um rótulo único por `code` gerado do dicionário: mesma quebra da regra "sem chave sem uso".

## R3. Lógica pura e limite de teste

- **Decision**: `remapKey` e `sanitizeKeyBindings` continuam em `src/game/input/keyBindings.js`; entram lá `keyOwner(bindings, code)` e `isDefaultKeyBindings(bindings)`. A classificação da captura (`classifyCaptureKey`), o rótulo (`keyLabel`) e a mensagem (`statusMessage`) ficam em módulos puros dentro de `src/features/settings/`, com testes Vitest próprios.
- **Rationale**: a issue #70 registra que não existe ambiente de teste de DOM; portanto nada que dependa de `document`, foco ou `<dialog>` pode ser testado automaticamente no MVP. Isolar as decisões em funções que recebem objetos simples (`{ code, repeat, shiftKey }`, `bindings`, `slot`) permite cobrir 100% da regra de captura, troca, restauração e mensagens sem DOM. `keyBindings.js` é o dono natural do modelo dos onze controles e já tem testes.
- **Alternatives considered**:
  - jsdom + Testing Library: dependência nova e proibida sem aprovação; contraria "sem dependência nova".
  - Testar componentes com `react-dom/server`: renderiza HTML sem interação, não cobre captura nem foco — valor baixo para o custo.

## R4. Confirmação de restauração

- **Decision**: `<dialog>` nativo com `showModal()`, no mesmo formato de `src/features/match/PauseDialog.jsx` (efeito que abre, `onCancel` com `preventDefault()` e fechamento no cleanup).
- **Rationale**: `showModal()` entrega foco preso, fundo inerte, Esc e retorno de foco ao elemento anterior sem código extra, que é exatamente o que o FR-008 e o SC-002 pedem. Já está em uso no projeto, com o comentário que referencia o SYSTEM_DESIGN §8.2.
- **Alternatives considered**:
  - Modal do daisyUI controlado por `hidden`/`open`: exigiria reimplementar foco preso e Esc.
  - `window.confirm`: não é estilizável, não aceita i18n dos botões e destoa do resto da UI.

## R5. Aviso de armazenamento (FR-016)

- **Decision**: a tela lê `storage.isPersistent` uma vez e exibe `settings.storageWarning` quando for `false`.
- **Rationale**: `src/services/storage.js` já detecta `localStorage` inacessível (`detectBackend`), troca para memória e expõe `isPersistent`; é o único módulo autorizado a tocar `localStorage`. Nada novo em `services/`.
- **Alternatives considered**:
  - Nova função em `settings.js`: duplicaria a informação que o storage já expõe.
  - Tentar gravar e capturar erro na tela: `storage.set` engole a exceção de propósito (`safely`), então a tela não saberia do fallback.

## R6. Semântica da captura

- **Decision**: captura no `onKeyDown` do próprio botão; `Escape` cancela com `preventDefault()`, `Tab` cancela sem `preventDefault()`, modificadores isolados são recusados, `event.repeat` é descartado e o keydown que armou a linha não é classificado (a tecla de ativação não vira binding). Todas as demais teclas — inclusive `Enter` e `Space` — fazem `preventDefault()` e viram binding.
- **Rationale**: `Enter` e `Space` são os padrões de ação de P1 e P2 (PRD, "Plataforma e controles"); bloqueá-los impediria desfazer uma troca. O `preventDefault()` no `keydown` evita a ativação do botão (Enter dispara no keydown e Space no keyup), então a captura não se rearma sozinha. `Tab` precisa seguir o fluxo normal de foco, que é o requisito de acessibilidade da História 2.
- **Alternatives considered**:
  - Capturar em `window`/`document`: exigiria cleanup de listener e poderia interceptar atalhos fora da tela.
  - Um campo de texto para digitar a tecla: não produz um `KeyboardEvent.code` confiável e piora a acessibilidade.

## R7. Rótulos de teclas

- **Decision**: `keyLabel(code)` devolve só um identificador (`'arrowUp'`, `'enter'`, `'a'`, `'1'`, `'unknown'`). O componente traduz por um `switch` de chamadas literais `t('settings.keys.arrowUp')` etc., com letras e dígitos exibidos como caractere derivado do `code`.
- **Rationale**: `KeyboardEvent.code` identifica a posição física e independe de layout (ABNT2/US), como o comentário de `keyBindings.js` já registra. A especificação pede "nome legível ou o identificador" para teclas sem rótulo conhecido (FR-011 e caso limite). Manter o módulo sem i18n o deixa puro e testável sem React, e a tradução literal no componente preserva a detecção do `i18n.test.js`.
- **Alternatives considered**:
  - Usar `event.key`: muda com Shift, layout e acentuação, e quebraria a promessa de tecla por posição física.
  - Traduzir todas as ~100 teclas: custo alto e sem uso real no jogo.

## R8. Atualização da partida seguinte

- **Decision**: nenhum estado global novo; a tela grava em `settings` e `PlayPage` continua lendo com `useState(loadKeyBindings)` ao montar.
- **Rationale**: a navegação da SPA desmonta `PlayPage` ao ir para `/configuracoes`, então voltar para `/jogar` relê as teclas e o FR-003 é atendido sem Context, store ou event bus.
- **Alternatives considered**:
  - Context de sessão para teclas: mais uma camada para um valor que muda raramente.
  - Evento no `EventBus`: o barramento é o contrato do Phaser com o React, não entre páginas.

## R9. Orçamento de build

- **Decision**: rota carregada de forma estática (sem `lazy`), sem asset novo; validar com `npm run check-size`.
- **Rationale**: a tela é pequena e não importa Phaser; deixá-la fora do `lazy` mantém a navegação instantânea, e o orçamento de JS inicial (250 KB gzip) continua sendo medido pelo `scripts/check-size.js` no CI.
- **Alternatives considered**: `lazy` na rota: adiaria poucos KB e criaria mais um estado de loading para cobrir.

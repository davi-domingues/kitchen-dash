# Contrato: tela de remapeamento de teclas

Consumido por `SettingsPage` (rota `/configuracoes`) e pelos componentes de `src/features/settings/`.

---

## 1. Módulos puros

### `src/game/input/keyBindings.js` (acréscimos ao contrato do KD-17)

- `keyOwner(bindings, code): Slot | null`
  - Devolve o slot dono de `code`: `{ player: 'p1'|'p2', control }` ou `{}` para a pausa.
  - `null` quando a tecla não está em uso.
  - Não lança para `code` desconhecido; devolve `null`.
- `isDefaultKeyBindings(bindings): boolean`
  - `true` somente se os onze valores forem iguais a `DEFAULT_KEY_BINDINGS`.
  - Não sanitiza; entradas inválidas resultam em `false`.

O contrato existente (`DEFAULT_KEY_BINDINGS`, `PLAYER_IDS`, `PLAYER_CONTROLS`, `remapKey`, `sanitizeKeyBindings`) não muda.

### `src/features/settings/captureKey.js`

```js
classifyCaptureKey({ code, repeat = false }) : 'cancel' | 'ignore' | 'bind'
```

| Entrada | Retorno | Observação |
|---|---|---|
| `'Escape'` | `'cancel'` | o chamador faz `preventDefault()` |
| `'Tab'` | `'cancel'` | o chamador **não** faz `preventDefault()` |
| `repeat: true` | `'ignore'` | repetição do SO não regrava, não encerra a captura e não gera mensagem |
| modificador isolado | `'ignore'` | `ShiftLeft/Right`, `ControlLeft/Right`, `AltLeft/Right`, `MetaLeft/Right` |
| qualquer outro `code` não vazio | `'bind'` | inclui `Enter` e `Space` |
| `code` vazio/ausente | `'ignore'` | defensivo |

A primeira tecla só conta depois que a captura começou: o keydown que ativa o botão (`Enter`/`Space` ou o clique) **não** é classificado nem vira binding. O contrato é que `classifyCaptureKey` só é chamado para keydowns posteriores ao que armou a linha; o componente descarta o evento de ativação antes de passar adiante.

`isModifierCode(code): boolean` é exportado junto, para o teste e para a mensagem `settings.status.modifier`.

### `src/features/settings/keyLabels.js`

```js
keyLabel(code): string   // identificador, nunca texto traduzido
```

- Devolve só um **identificador estável** de rótulo; não recebe `t` e não importa i18n.
- Teclas nomeadas → `'arrowUp'`, `'arrowDown'`, `'arrowLeft'`, `'arrowRight'`, `'enter'`, `'space'`, `'escape'`, `'tab'`, `'backspace'`, `'delete'`, `'home'`, `'end'`, `'pageUp'`, `'pageDown'`, `'insert'`.
- `KeyA`–`KeyZ`, `Digit0`–`Digit9`, `Numpad0`–`Numpad9` → identificador do caractere: `'a'`, `'1'`, `'numpad1'`. O componente decide exibir o caractere diretamente para letras e dígitos (dado, não texto traduzível) ou usar a chave de i18n.
- Qualquer outro `code` → `'unknown'`.
- Nunca devolve string vazia (caso limite da spec).
- Coberto por teste sem React: entrada `code`, saída identificador.

A tradução acontece no componente, em um `switch` de chamadas literais: `t('settings.keys.arrowUp')`, `t('settings.keys.enter')`, …, e `t('settings.keys.unknown', { code })` no fallback. Nenhuma chave é montada em runtime.

### `src/features/settings/statusMessage.js`

```js
boundMessage(controlKey, key)            // { kind: 'bound', params }
swappedMessage(...)                      // { kind: 'swapped', params }
sameMessage(...)                         // { kind: 'same', params }
cancelledMessage()                       // { kind: 'cancelled' }
restoredMessage()                        // { kind: 'restored' }
alreadyDefaultMessage()                  // { kind: 'alreadyDefault' }
modifierMessage(key)                     // { kind: 'modifier', params }
```

- Devolvem apenas dados (`kind` + `params`), nunca texto traduzido.
- `kind` é um conjunto fechado; string fora dele é erro de programação.

## 2. Contrato de DOM e acessibilidade

`SettingsPage`:

- `<main>` com `<h1>` (`settings.title`) e `<p>` (`settings.intro`) ligados por `aria-labelledby`/texto.
- Aviso de armazenamento: `role="status"` acima da lista, presente só quando `storage.isPersistent === false`.
- Mensagem de ação: `<p role="status" aria-live="polite">` único; o texto é substituído a cada ação (FR-015).

`KeyBindingsPanel`:

- Três `<section>` com `<h2>`: `settings.players.p1`, `settings.players.p2`, `settings.players.pause`.
- Ordem fixa dos controles: `up`, `down`, `left`, `right`, `action` (pausa é um único item).
- Nenhum contêiner com `tabIndex` positivo.

`KeyBindingRow`:

- `<button type="button">` com `aria-label={t('settings.change', { control })}`, texto visível do controle e a tecla atual (`settings.current`).
- O rótulo da tecla vem de `keyLabel(code)` (identificador) e é traduzido aqui por um `switch` de `t()` literais; letras e dígitos são exibidos como caractere.
- Em captura: `aria-describedby` aponta para o parágrafo com `settings.capture.hint`; `aria-pressed` não é usado (não é toggle).
- `onKeyDown` só trata a captura quando a linha está armada, e descarta `event.repeat`; o keydown que armou a linha não é classificado. `Escape`/`Tab` seguem as regras do §1.
- O foco nunca sai da linha durante a captura, exceto por `Tab` (intencional).

`RestoreDefaultsDialog`:

- `<dialog className="modal" aria-labelledby="restore-title">` aberto com `showModal()` em `useEffect`, fechado no cleanup.
- Ação principal com `autoFocus`; ação de cancelar fecha o diálogo.
- `onCancel` faz `preventDefault()` e fecha (Esc não vaza para a página).
- Ao fechar, o foco volta ao botão "Restaurar padrão" (comportamento nativo do `showModal`).

## 3. Contrato de persistência

- Carregar: `loadKeyBindings()` uma vez na montagem.
- Gravar: `saveKeyBindings(next)` a cada troca ou restauração confirmada, antes de atualizar o estado visual.
- Nunca gravar na abertura da tela, no cancelamento, na recusa do modal ou em tecla recusada.
- Nenhuma chamada de rede, nenhuma escrita no Supabase.

## 4. Contrato de i18n

- Toda chave visível vive em `src/i18n/pt-BR.json` sob `nav.settings` e `settings.*`.
- Toda referência é `t('chave.literal')`; proibido `t(`settings.${x}`)` ou concatenação.
- Chaves de rótulo de tecla só podem ser adicionadas junto com a chamada literal que as usa, porque `i18n.test.js` falha para chave sem uso.

## 5. Contrato de testes

| Módulo | Teste | Cobertura mínima |
|---|---|---|
| `keyBindings.js` | `keyBindings.test.js` | `keyOwner` para jogador, pausa e tecla livre; `isDefaultKeyBindings` para padrão, personalizado e inválido |
| `captureKey.js` | `captureKey.test.js` | Esc, Tab, **evento repetido (`repeat: true`)**, os quatro modificadores, Enter, Space, tecla comum, `code` vazio; o caso de repetição confirma que a tecla segurada devolve `'ignore'` e não altera o binding |
| `keyLabels.js` | `keyLabels.test.js` | identificador de seta, Enter, letra, dígito, numpad e `'unknown'`; nenhuma asserção de texto traduzido |
| `statusMessage.js` | `statusMessage.test.js` | cada `kind` e o formato dos `params` |

Sem teste automatizado para foco, `<dialog>` ou `aria-live` (issue #70). Esses itens entram no [quickstart](../quickstart.md) como verificação manual.

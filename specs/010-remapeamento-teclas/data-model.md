# Data Model — Tela de remapeamento de teclas

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-11-19

Nada é persistido no servidor. O modelo abaixo é o da preferência local (`settings.keyBindings`) e o da tela.

---

## 1. Preferência de teclas (`KeyBindings`)

Estrutura já existente em `src/game/input/keyBindings.js`, gravada em `kd:v1:settings` pelo `services/settings.js`.

```js
{
  p1: { up, down, left, right, action },   // KeyboardEvent.code
  p2: { up, down, left, right, action },
  pause: string
}
```

| Regra | Origem |
|---|---|
| Sempre os onze campos preenchidos | `sanitizeKeyBindings` completa com o padrão |
| Nenhum `code` repetido entre os onze | `sanitizeKeyBindings` volta ao padrão se houver repetição; `remapKey` troca em conflito |
| Cada valor é `KeyboardEvent.code` não vazio | validação `isCode` |
| Dado inválido ou corrompido → padrão, sem aviso | FR-004 (clarificado) |
| Outras preferências de `settings` são preservadas | `saveKeyBindings` faz merge |
| Identificação por posição física, independente do layout | `keyBindings.js` (ABNT2/US) |

**Invariante central**: `new Set(todosOsCodes).size === 11`. É o que o SC-004 verifica.

## 2. Função de controle (`Slot`)

```js
{ player: 'p1' | 'p2', control: 'up' | 'down' | 'left' | 'right' | 'action' }  // jogador
{}                                                                             // pausa
```

- Ordem canônica de exibição: `p1.up, p1.down, p1.left, p1.right, p1.action, p2.up, …, p2.action, pause`.
- `keyOwner(bindings, code)` devolve o `Slot` dono de um `code` ou `null`. A pausa é `{ player: null }` normalizada para `{}` na API existente do `remapKey`.

## 3. Linha da tela (`KeyBindingRowView`)

Derivada da `KeyBindings` para a renderização; não é persistida.

| Campo | Tipo | Regra |
|---|---|---|
| `id` | `'p1.up' … 'p2.action'`, `'pause'` | Estável, usado como `key` do React e em `aria-describedby` |
| `slot` | `Slot` | Ver acima |
| `controlLabelKey` | `string` | Chave de i18n do controle (literal no componente) |
| `code` | `string` | Tecla atual |
| `labelId` | `string` | Identificador do rótulo derivado de `code` por `keyLabel()`; a tradução acontece no componente |
| `isCapturing` | `boolean` | `true` só na linha em captura |

## 4. Sessão de captura (`CaptureState`)

```js
null | { slot: Slot, focusReturn: boolean }
```

- `null` = nenhuma captura ativa.
- A captura é exclusiva: armar outra linha descarta a anterior.
- `focusReturn` documenta que o foco permanece no botão da linha; não há foco a restaurar fora do modal.

### Transições

| De | Evento | Para | Efeito colateral |
|---|---|---|---|
| `null` | clique/Enter/Space no controle | `capturing` | anuncia `settings.capture.hint` |
| `capturing` | `Escape` | `null` | `preventDefault`, mensagem `cancelled`, nada muda |
| `capturing` | `Tab` | `null` | sem `preventDefault`, foco avança, mensagem `cancelled` |
| `capturing` | modificador isolado | `capturing` | mensagem `modifier`, nenhuma gravação |
| `capturing` | tecla do próprio controle | `null` | mensagem `same`, nenhuma gravação |
| `capturing` | tecla de outro controle | `null` | `remapKey` troca, `saveKeyBindings`, mensagem `swapped` |
| `capturing` | tecla livre | `null` | `remapKey` grava, `saveKeyBindings`, mensagem `bound` |
| `capturing` | clique fora / desmontar | `null` | nenhuma gravação (FR-006 "saindo do controle") |
| qualquer | "Restaurar padrão" | modal aberto | nada muda até confirmar |
| modal aberto | confirmar, já no padrão | modal fechado | mensagem `alreadyDefault`, nenhuma gravação |
| modal aberto | confirmar, personalizado | modal fechado | `DEFAULT_KEY_BINDINGS`, `saveKeyBindings`, mensagem `restored` |
| modal aberto | cancelar/Esc | modal fechado | nada muda, foco volta ao botão |

## 5. Mensagem de estado (`StatusMessage`)

```js
{ kind: 'bound' | 'swapped' | 'same' | 'cancelled' | 'restored' | 'alreadyDefault' | 'modifier', params?: object }
```

| `kind` | Parâmetros | Chave de i18n |
|---|---|---|
| `bound` | `{ control, key }` | `settings.status.bound` |
| `swapped` | `{ control, key, otherControl, otherKey }` | `settings.status.swapped` |
| `same` | `{ control, key }` | `settings.status.same` |
| `cancelled` | — | `settings.status.cancelled` |
| `restored` | — | `settings.status.restored` |
| `alreadyDefault` | — | `settings.status.alreadyDefault` |
| `modifier` | `{ key }` | `settings.status.modifier` |

Regras:
- Só a última mensagem é exibida (FR-015); não há fila nem histórico.
- Renderizada em `role="status"` com `aria-live="polite"`.
- `statusMessage.js` só devolve o `kind`/`params`; a tradução acontece com `t()` literal no componente.

## 6. Disponibilidade de armazenamento

| Campo | Origem | Uso |
|---|---|---|
| `storage.isPersistent` | `src/services/storage.js` | Quando `false`, exibe `settings.storageWarning` e mantém a tela funcionando na sessão (FR-016) |

Não é persistido; é lido uma vez na montagem de `SettingsPage`.

## 7. Dados fora do modelo

- Nenhum dado pessoal, e-mail, conta ou identificador de jogador.
- Nenhuma telemetria, `log` de tecla ou de sessão.
- Nenhuma tabela do Supabase é lida ou escrita.

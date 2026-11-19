# Data Model: Auto-uso de estações ao ficar parado

## Estado adicionado ao `MatchState`

| Campo | Tipo | Valor inicial | Regra |
|---|---|---|---|
| `idleBlocked` | `boolean` | `false` | Quando `true`, nenhum chef acumula tempo parado nem dispara auto-uso |
| `chefs[].idleMs` | `number` | `0` | Soma de `dtMs` enquanto o chef está parado; nunca negativo; zera ao mover, agir manualmente, mudar alvo ou bloquear |
| `chefs[].idleKey` | `string \| null` | `null` | Assinatura de `x,y,facing,stationId,holding` do frame anterior; mudança reinicia `idleMs` e `autoFired` |
| `chefs[].autoAction` | `AutoAction \| null` | `null` | Decisão do frame atual; sempre recalculada, nunca persistida entre frames |
| `chefs[].autoFired` | `{ stationId, signature } \| null` | `null` | Travamento de uma ação automática já realizada no fogão/passe |

## `AutoAction`

| Campo | Tipo | Descrição |
|---|---|---|
| `chefId` | `string` | `p1` ou `p2` |
| `action` | `'holdStart' \| 'tap'` | `holdStart` na tábua; `tap` no fogão/passe |
| `stationId` | `string` | Estação alvo já resolvida por `findTargetStation` |
| `auto` | `true` | Marca a entrada como automática para suprimir `action:rejected` |

## Entrada de estação (extensão compatível)

As entradas mantêm o formato do contrato KD-12 (`{ chefId, action, stationId }`) e aceitam o campo opcional `auto: true`. Entradas manuais não precisam do campo.

## Transições

```text
parado (idleMs < 250) ──+dtMs──> parado
        │ mover / agir / mudar alvo / bloquear
        └──────────────> idleMs = 0, autoFired = null

parado (idleMs >= 250, tábua com cru) ──> autoAction = holdStart (enquanto durar)
parado (idleMs >= 250, fogão/passe e canInteract) ──> autoAction = tap (uma vez)
        │ assinatura da estação muda
        └──────────────> autoFired liberado para novo tap

autoAction ──> cena envia entrada com auto: true ──> sistema de estações aplica
```

## Regras de validação

- `canInteract` continua sendo a única checagem de "a ação daria certo" para fogão e passe.
- Na tábua, o gatilho é "item cru na estação e chef sem item na mão"; `canInteract` é verdadeiro nesse caso, mas a ação enviada é `holdStart`, nunca `tap`.
- Um toque manual na estação já disparada pelo auto é descartado pela cena; qualquer outro toque manual zera `idleMs` e `autoFired`.
- O auto-uso nunca cria eventos próprios; quando a ação é válida, os eventos são os normais (`ingredient:chopped`, `dish:served`, etc.).
- `action:rejected` gerado por uma entrada com `auto: true` é descartado pelo wrapper de estações.
- A imutabilidade do `MatchState` é preservada: cada sistema devolve um novo estado.

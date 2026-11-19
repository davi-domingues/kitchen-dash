# Contrato: auto-uso de estações (issue #89)

Extensão do [contrato de estações (KD-12)](../../../specs/kd-12-core-estacoes/contracts/stations-api.md). Não substitui nem altera as assinaturas existentes.

## `src/game/core/idleSystem.js`

```js
IDLE_AUTO_MS // 250
createIdleSystem(content) // content = { recipes, ... } para canInteract
  // => system(state, { dtMs, inputs }) => { state, events: [] }
selectAutoActions(state) // => [{ chefId, action: 'holdStart'|'tap', stationId, auto: true }]
filterManualDuplicates(state, actions) // => actions sem o toque manual duplicado
setIdleBlocked(state, blocked) // => state com idleBlocked e contadores zerados
```

`createIdleSystem` usa somente `dtMs`, o estado e `content`; não usa relógio real, DOM, Phaser nem aleatoriedade. É registrado em `createKitchenUpdate` depois do movimento e antes do sistema de estações.

## Uso na `KitchenScene`

1. Montar `moves` e as ações manuais pendentes normalmente.
2. Aplicar `filterManualDuplicates(this.match, pendingActions)`.
3. Resolver as estações alvo com `toStationInputs`, acrescentar `selectAutoActions(this.match)` e passar tudo ao `step`.
4. Em `onBlur` e `pause()`, chamar `setIdleBlocked(this.match, true)`; em foco e `resume()`, `setIdleBlocked(..., false)`.
5. Não criar timers, listeners de teclado novos nem eventos de EventBus para esta feature.

## Eventos

Nenhum evento novo. `action:rejected` de entradas com `auto: true` é suprimido; eventos de entradas manuais permanecem idênticos ao KD-12.

## Critérios observáveis

- `holdStart` automático na tábua enquanto houver item cru e o chef estiver parado de mãos vazias.
- `tap` automático no fogão/passe somente com `canInteract === true`, no máximo uma vez por mudança de estado/alvo.
- Ação manual não duplica efeito de ação automática já realizada.
- Nenhuma ação automática quando bloqueado, pausado ou com a partida encerrada.

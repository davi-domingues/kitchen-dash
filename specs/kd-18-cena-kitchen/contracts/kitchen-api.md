# Contrato: Cena Kitchen (KD-18)

```js
// kitchenMap.js
DIRECTIONS // { up: { x: 0, y: -1 }, down, left, right }
tileKind(kitchen, x, y) // kind da legenda; 'wall' fora do mapa
isWalkable(kitchen, x, y)
createKitchenChefs(kitchen, playerCount) // => Chef[] nos spawns, facing 'down'
findTargetStation(state, chefId) // => Station | null
checkReachability(kitchen) // => { ok, unreachable: stationId[] }

// movementSystem.js
CHEF_STEP_MS // 150
MOVE_ACTION // 'move'
createMovementSystem(kitchen) // system(state, { dtMs, inputs }) => { state, events: [] }

// kitchenUpdate.js
createKitchenMatch({ kitchen, playerCount, seed, mode, contentVersion, durationMs }) // => MatchState
createKitchenUpdate({ kitchen, content }) // => update(state, inputs, dtMs) (createUpdate do KD-11)
toStationInputs(state, inputEvents) // eventos do InputMap => tap/holdStart/holdEnd com stationId
```

A cena (`SCENE_KEYS.KITCHEN`) aceita `init({ kitchenId, playerCount, seed, mode })`, todos opcionais.
Pedidos, HUD e `match:ended` entram no KD-15/KD-20.

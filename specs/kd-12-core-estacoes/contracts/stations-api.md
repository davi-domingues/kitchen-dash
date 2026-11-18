# Contrato: estações (KD-12)

```js
// items.js
createIngredient(ingredientId) // => { type: 'ingredient', ingredientId, chopped: false, chopProgressMs: 0 }
createPlate() // => { type: 'plate', ingredients: [], recipeId: null }
matchRecipe(recipes, container, ingredientIds) // => recipe | null (exata)
fitsSomeRecipe(recipes, container, ingredientIds) // => boolean (sub-multiconjunto)

// stations.js
STATION_KINDS // { CRATE, CUTTING, STOVE, COUNTER, PLATES, TRASH, PASS }
POT_STATUS // { EMPTY, FILLING, COOKING, DONE, BURNT }
createStations(kitchen) // => Station[] (tiles + legend do conteúdo)
createChef(id) // => { id, holding: null, workingAt: null }
interact(state, content, chefId, stationId) // toque rápido => { state, events }
canInteract(state, content, chefId, stationId) // => boolean (para "parado" e destaque)

// stationsSystem.js
createStationsSystem(content) // content = { recipes, ingredients, stoveBurnAfterMs }
// => system(state, { dtMs, inputs }) => { state, events }
```

## Entrada (`inputs`)

Array de `{ chefId, action: 'tap' | 'holdStart' | 'holdEnd', stationId }`, já com a estação
alvo resolvida pela cena. Mapeia 1:1 de `interact:tap` / `interact:holdStart` / `interact:holdEnd`
do InputMap (KD-17). `holdStart` numa tábua inicia o corte; `holdEnd` (sem `stationId`) o encerra.
Ficar parado = a cena envia `holdStart` na tábua, ou `tap` no fogão/passe se `canInteract`.

## Eventos (em `CORE_EVENTS`)

| Tipo | Payload |
|---|---|
| `ingredient:chopped` | `{ stationId, ingredientId }` |
| `pot:cooked` | `{ stationId, recipeId }` |
| `pot:burnt` | `{ stationId }` |
| `dish:served` | `{ chefId, recipeId }` (também em `state.deliveries`, consumido pelo KD-13) |
| `action:rejected` | `{ chefId, stationId }` |

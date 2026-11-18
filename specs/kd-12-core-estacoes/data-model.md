# Data Model: KD-12

- **Chef** `{ id: 'p1'|'p2', holding: Item|null, workingAt: stationId|null }`
- **Ingredient** `{ type: 'ingredient', ingredientId, chopped: boolean, chopProgressMs }`
- **Plate** `{ type: 'plate', ingredients: ingredientId[], recipeId: string|null }`
- **Station** `{ id: '<kind>-<x>-<y>', kind, x, y, item: Item|null, ingredientId?, pot? }`
  - kinds: `crate`, `cutting`, `stove`, `counter`, `plates`, `trash`, `pass`
  - `item` só em `cutting` e `counter`
- **Pot** (só `stove`) `{ ingredients: ingredientId[], status, timerMs, recipeId }`
  - `empty → filling → cooking → (cookMs) → done → (stoveBurnAfterMs) → burnt → (limpar) → empty`
  - servir em `done` volta para `empty`
- **Delivery** `{ chefId, recipeId }` em `state.deliveries`

Validação: ingrediente picado só entra em prato/panela se as listas resultantes ainda forem
sub-multiconjunto de alguma receita do mesmo `container`.

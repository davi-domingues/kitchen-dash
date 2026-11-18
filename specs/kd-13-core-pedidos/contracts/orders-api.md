# Contrato: API de pedidos (KD-13)

```js
// orders.js
ORDER_DEFAULTS // { maxVisible: 4, maxQueued: 20, spawnIntervalMs: { min: 13000, max: 17000 }, patienceMs: 60000, sequence: null }
withOrderQueue(state, config = {}) // => state com orderQueue e orders = []
createOrdersSystem({ recipes = RECIPES } = {}) // => system(state, { dtMs, rng }) => { state, events }
deliverDish(state, recipeId) // => { state, events, delivered: boolean }
isSequenceComplete(state) // => true quando a sequência fixa foi toda entregue

// coreEvents.js
CORE_EVENTS.ORDER_CREATED // 'order:created'  { orderId, number, recipeId, visible }
CORE_EVENTS.ORDER_DELIVERED // 'order:delivered' OrderOutcome
CORE_EVENTS.ORDER_EXPIRED // 'order:expired'   OrderOutcome
CORE_EVENTS.ORDER_WRONG // 'order:wrong'     { recipeId, elapsedMs }
```

`OrderOutcome = { orderId, number, recipeId, points, patienceMs, remainingMs, elapsedMs }`
(`patienceMs`/`remainingMs` são `null` sem paciência).

- O sistema roda só se `state.orderQueue` existir; sem fila, devolve o estado intacto.
- `deliverDish` não age (sem eventos) se a partida não está `running` ou não há fila; prato sem comanda visível ⇒ `order:wrong`.
- A pontuação (KD-14) é calculada a partir desses eventos; este módulo não altera `state.score`.

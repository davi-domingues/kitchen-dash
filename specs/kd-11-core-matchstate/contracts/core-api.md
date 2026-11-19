# Contrato: API pública do core (KD-11)

```js
// rng.js
createRng(seed) // => next(): número em [0, 1); next.getState(): uint32
pickInt(rng, min, max) // => inteiro em [min, max]

// matchState.js
MATCH_STATUS // { RUNNING, PAUSED, ENDED }
createMatchState({ seed, mode, contentVersion, durationMs = null, chefs = [], stations = [] })
pauseMatch(state) // running → paused; senão devolve o mesmo objeto
resumeMatch(state) // paused → running; senão devolve o mesmo objeto

// coreEvents.js
CORE_EVENTS // { ORDER_DELIVERED: 'order:delivered', MATCH_ENDED: 'match:ended' }
createEvent(type, payload) // => { type, payload }

// update.js
MAX_DT_MS // 250
createUpdate(systems) // => update(state, inputs, dtMs) => { state, events }
```

## Contrato de sistema (KD-12 a KD-15)

```js
system(state, { dtMs, inputs, rng }) => { state, events }
```

- Não muta `state`; consome aleatoriedade só pelo `rng` recebido.
- Roda depois de o relógio avançar, na ordem de registro.
- O fim por tempo é avaliado depois de todos os sistemas.

## `match:ended` (payload)

`{ seed, contentVersion, mode, score, durationMs }`. O `matchId` é atribuído fora do core.

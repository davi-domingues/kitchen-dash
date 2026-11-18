# Plano — KD-11

## Módulos (`src/game/core/`)

| Arquivo | Exporta |
|---|---|
| `rng.js` | `createRng(seed)` → `next()` com `next.getState()`; `pickInt(rng, min, max)` |
| `matchState.js` | `MATCH_STATUS`, `createMatchState({ seed, mode, contentVersion, durationMs?, chefs?, stations? })`, `pauseMatch(state)`, `resumeMatch(state)` |
| `coreEvents.js` | `CORE_EVENTS` (`order:delivered`, `match:ended`), `createEvent(type, payload)` |
| `update.js` | `MAX_DT_MS`, `createUpdate(systems)` → `update(state, inputs, dtMs)` → `{ state, events }` |

## Contrato de sistema

```js
// system(state, { dtMs, inputs, rng }) => { state, events }
```

- Roda em ordem dentro de `update`, depois de o relógio avançar.
- Não muta `state`; consome aleatoriedade só via `rng`.
- O fim por tempo é checado depois de todos os sistemas.

## Testes

`rng.test.js`, `matchState.test.js`, `update.test.js` cobrem R1–R6. R7 é imposto pelo ESLint.

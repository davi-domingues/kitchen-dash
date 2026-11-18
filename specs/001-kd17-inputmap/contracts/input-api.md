# Contrato: API do InputMap (consumida pelo KD-18)

## `src/game/input/inputMap.js`

- `createInputMap({ bindings = DEFAULT_KEY_BINDINGS, playerCount = 2, tapThresholdMs = 220 })`
  - `keyDown(code, nowMs): InputEvent[]`
  - `keyUp(code): InputEvent[]`
  - `update(nowMs): InputEvent[]`: chamar a cada frame
  - `getMove(player): { x: -1|0|1, y: -1|0|1 }`
  - `isHolding(player): boolean`
  - `releaseAll(): void`: chamar no `blur` da janela
- `INPUT_EVENTS`, `TAP_THRESHOLD_MS`

## `src/game/input/keyBindings.js`

- `DEFAULT_KEY_BINDINGS`, `PLAYER_IDS`, `PLAYER_CONTROLS`
- `remapKey(bindings, { player, control } | {}, code)`: `{}` é a pausa; troca em conflito
- `sanitizeKeyBindings(raw)`

## `src/services/settings.js`

- `loadKeyBindings(store?)`, `saveKeyBindings(bindings, store?)`

## Uso na cena

```js
const input = createInputMap({ bindings: loadKeyBindings(), playerCount })
this.input.keyboard.on('keydown', (e) => emit(input.keyDown(e.code, this.time.now)))
this.input.keyboard.on('keyup', (e) => emit(input.keyUp(e.code)))
// update(): emit(input.update(time)); mover chefs com input.getMove('p1' | 'p2')
```

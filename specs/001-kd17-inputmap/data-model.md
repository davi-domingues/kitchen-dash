# Data Model: InputMap

## KeyBindings

```js
{
  p1: { up, down, left, right, action }, // KeyboardEvent.code
  p2: { up, down, left, right, action },
  pause,
}
```

- Validação: todas as 11 teclas são strings não vazias e distintas; senão, volta ao padrão.
- Padrão: P1 `ArrowUp/ArrowDown/ArrowLeft/ArrowRight` + `Enter`; P2 `KeyW/KeyS/KeyA/KeyD` + `Space`; pausa `KeyP`.
- Persistido em `kd:v1:settings` → `{ ...outrasPreferencias, keyBindings }`.

## InputEvent

| type | Campos | Quando |
|---|---|---|
| `interact:tap` | `player` | Ação solta antes de 220 ms |
| `interact:holdStart` | `player` | Ação mantida até 220 ms (uma vez) |
| `interact:holdEnd` | `player` | Ação solta depois do holdStart |
| `pause` | — | Primeiro keydown da pausa |

## Estado do botão de ação (por jogador)

`idle` → keydown → `pressed(since)` → update ≥ 220 ms → `holding` → keyup → `idle` (holdEnd).
`pressed` → keyup → `idle` (tap). Em 1 jogador, várias teclas de ação contam como um botão.

# Data Model: KD-11

## MatchState

| Campo | Tipo | Regra |
|---|---|---|
| `seed` | inteiro | obrigatório; não inteiro → `TypeError` |
| `rngState` | inteiro uint32 | inicia em `seed >>> 0`; atualizado a cada passo |
| `mode` | string | definido pela KD-15 |
| `contentVersion` | string | vai no `match:ended` |
| `status` | `running` \| `paused` \| `ended` | ver transições |
| `tick` | inteiro ≥ 0 | +1 por passo em `running` |
| `elapsedMs` | número ≥ 0 | soma dos passos limitados; não passa de `durationMs` |
| `durationMs` | número > 0 \| `null` | `null` = sem limite; ≤ 0 → `RangeError` |
| `score` | número | escrito pela KD-14 |
| `chefs`, `stations` | arrays | iniciais vindos da cozinha (KD-12/KD-18) |
| `items`, `orders` | arrays | começam vazios (KD-12/KD-13) |

## Transições de status

```text
running --pauseMatch--> paused --resumeMatch--> running
running --elapsedMs >= durationMs--> ended (terminal; emite match:ended uma vez)
```

## Evento

`{ type: 'área:ação', payload: object }`. Tipos do core: `order:delivered`, `match:ended`.

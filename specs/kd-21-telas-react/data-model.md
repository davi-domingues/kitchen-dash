# Data Model — KD-21

## MatchConfig
| Campo | Tipo | Regra |
|---|---|---|
| `mode` | `'classic' \| 'free' \| 'challenge'` | `isMatchMode` |
| `players` | `1 \| 2` | `isPlayerCount` |

Padrão: `{ mode: 'classic', players: 1 }`.

## MatchResult
Ver [contracts/match-ended.md](contracts/match-ended.md). Validado por `parseMatchEnded`; campos extras são descartados.

## PlayState (reducer)
`{ phase, config, run, result }`

```text
setup --start(config válida)--> playing
playing --paused--> paused --resumed--> playing
playing|paused --ended(válido)--> result
playing|paused --ended(inválido)--> error
result --replay--> playing (run+1, mesma config)
qualquer --setup--> setup (mantém config)
```

Ações fora dessas transições não mudam o estado.

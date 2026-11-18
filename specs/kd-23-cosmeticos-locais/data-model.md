# Data Model: KD-23

## CosmeticsState (`kd:v1:cosmetics`)

| Campo | Tipo | Regra |
|---|---|---|
| bestScore | inteiro ≥ 0 | máximo visto; inválido → 0 |
| unlocked | id[] | só ids do catálogo; sempre inclui os de custo 0; ordenado pelo catálogo |
| equipped | `{hat, apron, theme}` | id desbloqueado do slot; inválido → padrão (custo 0) do slot |

Transições: `applyScore(state, score)` → `{ state, newlyUnlocked }`; `equip(state, id)` → state (ignora bloqueado); `mergeUnlocked(state, ids)`.

# Data Model: KD-23

## CosmeticsState (`kd:v1:cosmetics`)

| Campo | Tipo | Regra |
|---|---|---|
| bestScore | inteiro ≥ 0 | máximo visto; inválido → 0 |
| unlocked | id[] | só ids do catálogo; sempre inclui os de custo 0; ordenado pelo catálogo |
| equipped | `{hat, apron, theme}` | P1 (e tema da cozinha); id desbloqueado do slot; inválido → padrão (custo 0) do slot |
| equippedP2 | `{hat, apron}` | P2, só local; mesmos itens desbloqueados; ausente (formato antigo) → copia chapéu e avental do P1 |

Transições: `applyScore(state, score)` → `{ state, newlyUnlocked }`; `equip(state, id)` → state (ignora bloqueado); `equipP2(state, id)` → state (ignora bloqueado e tema); `mergeUnlocked(state, ids)`.

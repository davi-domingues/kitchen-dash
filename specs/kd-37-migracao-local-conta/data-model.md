# Data Model: KD-37

## Marcador local `kd:v1:migration`

| Campo | Tipo | Regra |
|---|---|---|
| `[userId].version` | number | `MIGRATION_VERSION` (1); outra versão = migração refeita |
| `[userId].steps.scores` | boolean | true quando não restam partidas de visitante |
| `[userId].steps.cosmetics` | boolean | true após pull + push do equipado |
| `[userId].steps.settings` | boolean | true após conciliar `user_settings` |
| `[userId].sent` / `discarded` | number | acumulados entre rodadas |

Estado: `pendente → (parcial) → concluída`. Concluída = as três etapas true.

## `user_settings.settings` (KD-30, sem mudança)

jsonb `{ keyBindings?: { p1, p2, pause } }`. Leitura e update só da própria linha.

## `kd:v1:settings` (local)

`{ keyBindings }`, já sanitizado por `sanitizeKeyBindings`.

# Data Model: KD-20

**HudModel** (derivado do MatchState, sem estado próprio)
- `score: number`
- `clock: { kind: 'remaining'|'elapsed', text: 'm:ss' }` — `remaining` quando `durationMs` ≠ null.
- `orders: { id, number, recipeId, fraction: number|null, band: 'ok'|'warn'|'danger'|null }[]`
- `queued: number` — pedidos na fila (`orderQueue.pending.length`).
- `canEnd: boolean` — true no Livre.

**MatchEnded** (inalterado, KD-21): `{ matchId, mode, players, seed, contentVersion, score, ordersCompleted, ordersFailed, durationMs }`.

**EventBus** (contracts/events.md): `match:paused`, `match:resumed`, `match:endRequested`, `match:ended`.

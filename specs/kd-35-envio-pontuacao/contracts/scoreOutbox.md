# Contrato: `services/scoreOutbox.js` e `services/scoreService.js`

- `toBoard(mode, players)` → `"classic_1p"` etc.
- `createScoreService(client)` → `{ submitScore(entry, { origin }) }`; resolve `{ matchId, isNewBest, bestScore, unlockedCosmetics }` ou lança `ScoreFailure` com `kind` ∈ `retry | discard | auth`.
- `loadScoreService()` → `Promise<service|null>` (lazy, null sem backend).
- `createScoreOutbox({ store, loadService, listPending, removePending, now, rng, setTimer, clearTimer, maxAttempts=8, baseDelayMs=2000, maxDelayMs=300000 })` →
  - `enqueue(matchId, userId)`
  - `flush(userId)` → `Promise<{ sent, discarded, retrying }>`; nunca em paralelo
  - `dispose()`

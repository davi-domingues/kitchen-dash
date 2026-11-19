# Data Model: KD-22

Chave `kd:v1:progress`:

```js
{
  board: [Entry],      // ≤ 10 por (mode, players), ordenado pela regra do modo
  stats: { matchesPlayed, ordersCompleted, ordersFailed, playTimeMs },
  pending: [Entry],    // ≤ 50, mais recentes; consumido pela KD-35/KD-37
}
Entry = { matchId, mode, players, seed, contentVersion, score, ordersCompleted, ordersFailed, durationMs, endedAt }
```

- `endedAt`: ISO 8601 do relógio injetado.
- Validação: cada entrada passa por `parseMatchEnded` + `endedAt` string; inválidas são descartadas por `sanitizeProgress`.
- Entrada de Desafio só vai ao placar com `ordersCompleted >= CHALLENGE_LENGTH`.

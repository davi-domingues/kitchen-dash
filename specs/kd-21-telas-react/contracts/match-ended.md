# Contrato — EventBus `match:ended`

Emitido pela cena (Phaser) uma vez por partida. Consumido pela `PlayPage` e, na KD-35, pelo outbox de pontuação.

```js
{
  matchId: string,         // UUID gerado pela cena no início; idempotência do submit_score
  mode: 'classic' | 'free' | 'challenge',
  players: 1 | 2,
  seed: number,            // inteiro 0..2^32-1, o mesmo do rng
  contentVersion: string,  // não vazio
  score: number,           // inteiro ≥ 0
  ordersCompleted: number, // inteiro ≥ 0
  ordersFailed: number,    // inteiro ≥ 0
  durationMs: number,      // inteiro > 0
}
```

Mapeamento para `submit_score(match_id, board, score, duration_ms, seed, content_version, origin)`: `board` e `origin` são decididos pelo React a partir de `mode`, `players` e da sessão.

Eventos relacionados: `match:paused` (sem payload, cena → React) e `match:resumed` (sem payload, React → cena).

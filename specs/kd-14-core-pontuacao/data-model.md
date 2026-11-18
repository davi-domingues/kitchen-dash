# Data Model: Core de pontuação

- **MatchState.score** (int ≥ 0): já existe (KD-11); só este módulo o altera.
- **MatchState.scoring** `{ combo: int ≥ 0 }`: criado por `withScoreTracking(state)`; ausente ⇒ pontuação inativa.
- **ScoreChange** (payload de `score:changed`): `{ reason: 'delivered'|'wrong'|'expired', delta, base, tip, comboBonus, combo, score, orderId|null, elapsedMs }`. `delta` é a variação efetiva (após o piso).

Transições do combo: entrega ⇒ combo + 1; errado/expirado ⇒ 0.

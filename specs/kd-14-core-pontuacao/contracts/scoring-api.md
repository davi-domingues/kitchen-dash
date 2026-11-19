# Contrato: API de pontuação (KD-14)

```js
// scoring.js
SCORING_RULES // { maxTip: 40, comboBonus: 10, wrongPenalty: 20, expiredPenalty: 30, maxPointsPerSecond: 15, plausibilityAllowance: 180 }
withScoreTracking(state)          // => state com scoring = { combo: 0 }
tipFor(patienceMs, remainingMs)   // => int 0..40 (0 se patienceMs for null)
applyScoreEvents(state, events)   // => { state, events: ScoreChange[] } (eventos de score:changed)
withScoring(system)               // => system(state, ctx) => { state, events: [...doSistema, ...score:changed] }
maxPlausibleScore(durationMs)     // => allowance + ceil(durationMs/1000) * maxPointsPerSecond

// coreEvents.js
CORE_EVENTS.SCORE_CHANGED // 'score:changed' ScoreChange
```

- Sem `state.scoring`, `applyScoreEvents` devolve o estado intacto e nenhum evento.
- Eventos que não são de pedido são ignorados; a ordem dos eventos é respeitada.
- Uso: `createUpdate([withScoring(createOrdersSystem())])`; após `deliverDish`, chame `applyScoreEvents(result.state, result.events)`.
- Servidor (`game_rules.max_points_per_second`): **15**, com a folga de 180 pontos na checagem `score ≤ 180 + duration_s × 15`.

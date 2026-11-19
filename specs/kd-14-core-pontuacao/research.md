# Research: Core de pontuação

## R1. Como o sistema recebe os eventos de pedido
- **Decision**: decorador `withScoring(system)` que roda o sistema e aplica a pontuação aos eventos dele; `applyScoreEvents(state, events)` para eventos gerados fora do `update` (`deliverDish`).
- **Rationale**: o contrato da KD-11 não repassa eventos entre sistemas; envolver mantém a assinatura `(state, ctx) => { state, events }` e não muda `update.js`.
- **Alternatives**: mudar `createUpdate` para passar eventos acumulados (mexe no contrato da KD-11); fazer `orders.js` pontuar (viola o contrato da KD-13).

## R2. Combo
- **Decision**: bônus fixo de +10 a partir da 2ª entrega consecutiva; zera em `order:wrong` e `order:expired`.
- **Rationale**: leitura literal do PRD; bônus limitado deixa o teto de plausibilidade calculável.
- **Alternatives**: +10 × (sequência − 1), cumulativo (teto ilimitado).

## R3. Gorjeta
- **Decision**: `Math.round(40 × remainingMs / patienceMs)`, limitada a [0, 40]; 0 com paciência `null`.
- **Alternatives**: degraus (mais difícil de ler no HUD).

## R4. Teto de plausibilidade (`max_points_per_second`)
- **Decision**: 15 pontos/s + folga de 180 pontos. Entrega máxima = 130 + 40 + 10 = 180; o intervalo mínimo entre chegadas é 13 s, então em regime ≈ 13,8 pontos/s. Exportados como `SCORING_RULES.maxPointsPerSecond` e `plausibilityAllowance`, com `maxPlausibleScore(durationMs)`.
- **Rationale**: a folga fixa cobre partidas curtas, em que uma única entrega máxima já passa da taxa por segundo; a KD-30 usa 10 provisório, que reprovaria partidas legítimas curtas.

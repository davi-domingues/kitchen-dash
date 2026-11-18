// Eventos que o core devolve a cada update. A cena Phaser os repassa ao EventBus (ARQUITETURA §3.2).
export const CORE_EVENTS = Object.freeze({
  // Payload: `{ orderId, number, recipeId, visible }`.
  ORDER_CREATED: 'order:created',
  // Payload (OrderOutcome): `{ orderId, number, recipeId, points, patienceMs, remainingMs, elapsedMs }`.
  // A pontuação (KD-14) tira a gorjeta de `remainingMs / patienceMs`; ambos são null sem paciência.
  ORDER_DELIVERED: 'order:delivered',
  // Payload: OrderOutcome, com `remainingMs = 0`.
  ORDER_EXPIRED: 'order:expired',
  // Payload: `{ recipeId, elapsedMs }`. Prato entregue sem comanda visível da receita.
  ORDER_WRONG: 'order:wrong',
  // Payload (ScoreChange): `{ reason, delta, base, tip, comboBonus, combo, score, orderId, elapsedMs }`.
  // `delta` é a variação efetiva, já com o piso zero (KD-14).
  SCORE_CHANGED: 'score:changed',
  // Eventos das estações (KD-12). Payloads em specs/kd-12-core-estacoes/contracts/stations-api.md.
  INGREDIENT_CHOPPED: 'ingredient:chopped',
  POT_COOKED: 'pot:cooked',
  POT_BURNT: 'pot:burnt',
  DISH_SERVED: 'dish:served',
  ACTION_REJECTED: 'action:rejected',
  // Payload: `{ seed, contentVersion, mode, score, durationMs }`.
  MATCH_ENDED: 'match:ended',
})

export function createEvent(type, payload) {
  return { type, payload }
}

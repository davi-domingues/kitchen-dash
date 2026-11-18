// Eventos que o core devolve a cada update. A cena Phaser os repassa ao EventBus (ARQUITETURA §3.2).
export const CORE_EVENTS = Object.freeze({
  // Payload: `{ orderId, recipeId, points }`. Emitido pelo sistema de pedidos (KD-13).
  ORDER_DELIVERED: 'order:delivered',
  // Payload: `{ seed, contentVersion, mode, score, durationMs }`.
  MATCH_ENDED: 'match:ended',
})

export function createEvent(type, payload) {
  return { type, payload }
}

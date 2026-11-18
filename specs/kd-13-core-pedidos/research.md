# Research: KD-13

## R1. Onde fica a configuração da fila
- **Decision**: em `state.orderQueue.config`, instalada por `withOrderQueue(state, config)`.
- **Rationale**: o estado continua serializável e a KD-15 configura por modo sem alterar o `createMatchState` da KD-11.
- **Alternatives**: configuração só no fechamento do sistema (perde-se ao serializar/retomar).

## R2. Receitas no sistema
- **Decision**: `createOrdersSystem({ recipes = RECIPES })`; desbloqueio por `recipe.unlockAtMs <= elapsedMs` (mesma regra de `getUnlockedRecipes`).
- **Rationale**: testes com receitas fictícias e conteúdo continua sendo dado (constituição IV).

## R3. Pontos no pedido
- **Decision**: o pedido guarda `points` da receita ao ser criado; `deliverDish` não precisa do conteúdo.
- **Rationale**: entrega pura com assinatura simples `(state, recipeId)`.

## R4. Dados para a pontuação (KD-14)
- **Decision**: `order:delivered` e `order:expired` levam `{ orderId, number, recipeId, points, patienceMs, remainingMs, elapsedMs }`; `order:wrong` leva `{ recipeId, elapsedMs }`.
- **Rationale**: gorjeta = f(`remainingMs / patienceMs`); combo depende da ordem dos eventos; penalidades de expiração (−30) e prato errado (−20) são distinguidas pelo tipo. `patienceMs`/`remainingMs` são `null` sem paciência (Livre).

## R5. Sorteio
- **Decision**: ordem fixa de consumo do rng por chegada: 1) receita (`pickInt` sobre as liberadas, se não houver sequência), 2) próximo intervalo (`pickInt(min, max)`).
- **Rationale**: determinismo documentado e estável.

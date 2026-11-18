# Implementation Plan: Core de pedidos e paciência (KD-13)

**Branch**: `feat/kd-13-core-pedidos` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Um módulo puro `src/game/core/orders.js` com: `withOrderQueue(state, config)` (instala a fila no `MatchState`),
`createOrdersSystem({ recipes })` (sistema do ciclo da KD-11: chegada, fila, paciência, expiração),
`deliverDish(state, recipeId)` (entrega pura chamada pela KD-12/KD-18) e `isSequenceComplete(state)` (KD-15).
Os eventos trazem os dados de que a KD-14 precisa para base, gorjeta, combo e penalidades.

## Technical Context

**Language/Version**: JavaScript ESM (sem TypeScript)
**Primary Dependencies**: nenhuma nova; usa `rng`/`pickInt` e `coreEvents` da KD-11 e `RECIPES` da KD-10
**Testing**: Vitest, seed fixa, sem rede
**Target Platform**: navegador (core é JS puro)
**Project Type**: jogo web; camada `game/core`
**Performance Goals**: O(comandas) por passo; ≤ 24 pedidos vivos (4 visíveis + 20 na fila)
**Constraints**: determinístico, sem `Math.random`/`Date.now`, sem mutar o estado
**Scale/Scope**: 1 módulo + testes

## Constitution Check

- **III. Regras separadas de renderização**: tudo em `game/core`, sem Phaser/React. ✅
- **IV. Conteúdo é dado**: receitas, pontos e desbloqueio vêm de `content/recipes.json`; o sistema recebe `recipes` por injeção. ✅
- **I, II, V, VI**: não se aplicam (sem rede, sem backend). ✅

Re-checagem pós-design: sem violações.

## Project Structure

```text
specs/kd-13-core-pedidos/   # spec, plan, research, data-model, contracts, quickstart, tasks
src/game/core/
├── coreEvents.js           # + ORDER_CREATED, ORDER_EXPIRED, ORDER_WRONG
├── orders.js               # novo
└── orders.test.js          # novo
```

**Structure Decision**: um módulo de domínio (`orders.js`) ao lado dos da KD-11, seguindo SYSTEM_DESIGN §3 (OrderQueue/Patience no core).

## Complexity Tracking

Sem violações a justificar.

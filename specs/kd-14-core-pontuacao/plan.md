# Implementation Plan: Core de pontuação

**Branch**: `feat/kd-14-core-pontuacao` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Módulo puro `src/game/core/scoring.js` que transforma os eventos de pedido da KD-13 (`order:delivered`, `order:expired`, `order:wrong`) em alterações de `state.score`, com combo em `state.scoring` e eventos `score:changed` para o HUD. Integra-se ao `update` da KD-11 envolvendo um sistema (`withScoring(system)`) e, fora do loop, via `applyScoreEvents(state, events)` (para `deliverDish`).

## Technical Context

**Language/Version**: JavaScript ESM (sem TypeScript)
**Primary Dependencies**: nenhuma nova
**Storage**: N/A (estado em memória, serializável)
**Testing**: Vitest, determinístico
**Target Platform**: navegador (core puro, roda também em Node)
**Project Type**: jogo web (core de regras)
**Performance Goals**: O(n) nos eventos do passo; nenhuma alocação por frame sem eventos
**Constraints**: `game/core` sem Phaser/React/DOM/`Math.random`
**Scale/Scope**: 1 módulo + testes + 1 constante de evento

## Constitution Check

- Core puro e determinístico: ✅ (sem rng, sem relógio).
- Regras 100% testadas: ✅ (cada FR tem teste).
- Conteúdo é dado: ✅ os pontos base vêm do evento (originado em `content/recipes`); as constantes de regra ficam em `SCORING_RULES`, como o `ORDER_DEFAULTS` da KD-13.
- Sem dependência nova: ✅.

Pós-design: sem violações.

## Project Structure

```text
src/game/core/
├── coreEvents.js     # + SCORE_CHANGED
├── scoring.js        # novo
└── scoring.test.js   # novo
specs/kd-14-core-pontuacao/  # spec, plan, research, data-model, contracts, quickstart, tasks
docs/ESTUDOS_E_DECISOES.md   # decisão de combo fixo e teto de plausibilidade
```

**Structure Decision**: um módulo no core, sem tocar `orders.js` (o contrato da KD-13 diz que ele não altera `score`).

## Complexity Tracking

Sem violações.

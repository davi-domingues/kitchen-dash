# Implementation Plan: Core da partida (KD-11)

**Branch**: `feat/kd-11-core-matchstate` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Estado de partida puro e serializável (`MatchState`) com RNG semeado embutido, e um ciclo
`update(state, inputs, dtMs) → { state, events }` que avança o relógio, executa sistemas
plugáveis em ordem e encerra a partida por tempo emitindo `match:ended`.

## Technical Context

**Language/Version**: JavaScript ESM (Node ≥ 24), sem TypeScript
**Primary Dependencies**: nenhuma (core puro)
**Storage**: N/A (estado em memória, serializável)
**Testing**: Vitest, seed fixa, sem relógio real
**Target Platform**: navegador (consumido pela cena Phaser) e Node (testes)
**Project Type**: módulo de biblioteca interna em `src/game/core/`
**Performance Goals**: um `update` por quadro (60 fps) sem alocação além de cópias rasas
**Constraints**: determinístico; sem Phaser, React, DOM, `Math.random` (ESLint)
**Scale/Scope**: 4 módulos, ~100 linhas de produção

## Constitution Check

| Princípio | Status |
|---|---|
| I. Funciona sem rede | OK: core não toca rede |
| II. Cliente não é confiável | OK: seed + `contentVersion` no estado habilitam replay no servidor (ROADMAP) |
| III. Regras separadas de renderização | OK: core puro, fronteira imposta pelo ESLint |
| IV. Conteúdo é dado | OK: nenhum conteúdo hardcoded |
| V. Fornecedores atrás de interfaces | N/A |
| VI. Plano gratuito | N/A |

Sem violações. Reavaliado após o design: sem mudanças.

## Project Structure

```text
specs/kd-11-core-matchstate/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md
├── contracts/core-api.md
└── checklists/requirements.md

src/game/core/
├── rng.js / rng.test.js              # createRng(seed) com getState(), pickInt
├── matchState.js / matchState.test.js # MATCH_STATUS, createMatchState, pauseMatch, resumeMatch
├── coreEvents.js                      # CORE_EVENTS, createEvent
└── update.js / update.test.js         # MAX_DT_MS, createUpdate(systems)
```

**Structure Decision**: tudo em `src/game/core/` (SYSTEM_DESIGN §3), testes ao lado do módulo.

## Complexity Tracking

Nenhuma.

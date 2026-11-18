# Implementation Plan: Core dos modos de jogo

**Branch**: `feat/kd-15-core-modos` | **Spec**: [spec.md](spec.md)

## Summary

Novo módulo `src/game/core/match.js` com `MODE_RULES` por modo, `createMatch(config)` que monta estado + sistemas (estações → pedidos/entregas com pontuação → fim do Desafio) e `endMatch(state)` para o encerramento manual. O payload de `match:ended` passa a sair de `matchEndedPayload(state)` em `matchState.js`, usado tanto pelo `update` (fim por tempo) quanto pelo Desafio e pelo `endMatch`.

## Technical Context

- JavaScript ESM, Vitest; sem dependência nova.
- Core puro: rng com seed, sem Math.random, sem Phaser/React/DOM.
- Reusa KD-11 (`createMatchState`, `createUpdate`), KD-12 (`createStations`, `createChef`, `createStationsSystem`), KD-13 (`withOrderQueue`, `createOrdersSystem`, `deliverDish`, `isSequenceComplete`) e KD-14 (`withScoreTracking`, `withScoring`).

## Constitution Check

- Core puro e determinístico: OK.
- 100% das regras testadas: `match.test.js` cobre cada modo, entregas, fim e validação.
- Conteúdo é dado: a sequência do Desafio é derivada das receitas do conteúdo com seed fixa, sem lista hardcoded e sem tocar no JSON.
- Sem texto visível ao jogador: não há i18n a mudar.

## Project Structure

```text
src/game/core/match.js         # MODE_RULES, CHALLENGE_SEED, createMatch, endMatch, challengeSequence
src/game/core/match.test.js
src/game/core/matchState.js    # + players, stats e matchEndedPayload
src/game/core/update.js        # usa matchEndedPayload
```

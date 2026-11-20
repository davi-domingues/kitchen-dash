# Implementation Plan: Reportar partidas descartadas

**Branch**: `feat/debito-71-sentry-descartadas` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

A outbox (`services/scoreOutbox.js`) ganha o callback `onDiscarded(entry, { reason, attempts })`, chamado uma vez por partida descartada. `features/progress/scoreSync.js` liga o callback a `reportDiscarded`, que monta o evento `score.discarded` só com campos da partida e chama `captureEvent` (novo em `services/monitoring.js`, `captureMessage` nível `warning`).

## Technical Context

JavaScript ESM, Vitest, Sentry carregado sob demanda (sem impacto no JS inicial). Sem dependência nova, sem banco.

## Constitution Check

- `services/` isola o Sentry; a outbox não conhece o monitoramento (injeção por callback). OK.
- Sem PII: lista explícita de campos, `sendDefaultPii: false` e `scrubPii` mantidos. OK.
- Testes determinísticos com monitoramento mockado. OK.

## Project Structure

- `src/services/monitoring.js` (+ teste): `captureEvent`.
- `src/services/scoreOutbox.js` (+ teste): `DISCARD_REASONS`, `onDiscarded`.
- `src/features/progress/scoreSync.js` (+ teste): `reportDiscarded`.

Ver [research.md](research.md), [contracts/score-discarded.md](contracts/score-discarded.md), [quickstart.md](quickstart.md). Sem entidades persistidas.

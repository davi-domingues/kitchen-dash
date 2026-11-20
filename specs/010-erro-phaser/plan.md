# Implementation Plan: Erro no jogo volta ao menu e é reportado

**Branch**: `fix/debito-90-erro-phaser` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

Um guarda envolve `init`, `create` e `update` das cenas; na primeira exceção marca a cena como quebrada
(métodos viram no-op) e emite `game:crashed` no EventBus. A `PlayPage` assina o evento por um módulo de
`features/match`, chama `captureError` de `services/monitoring.js` e despacha `crashed` no `playFlowReducer`,
que volta à fase `setup` com `crashed: true` para mostrar um `role="alert"` traduzido.

## Technical Context

JavaScript ESM, React 19, Phaser 3, Vitest. Sem dependência nova. Sem banco.

## Constitution Check

- Fronteiras §4: `game/phaser` só emite evento; `services/` é chamado pelo React. OK.
- i18n: texto novo em `play.crash.notice`. OK.
- Testes determinísticos, monitoramento mockado. OK.
- Sem PII: payload só com `error` e `sceneKey`. OK.

## Project Structure

- `src/game/phaser/events.js` — `GAME_CRASHED`.
- `src/game/phaser/sceneErrorGuard.js` (+ teste) — `guardScene(scene, emit)`.
- `src/game/phaser/scenes/*.js` — aplicam o guarda no construtor.
- `src/features/match/gameCrash.js` (+ teste) — `subscribeGameCrash(bus, { report, onCrash })`.
- `src/features/match/playFlow.js` (+ teste) — ação `crashed`.
- `src/app/PlayPage.jsx`, `src/i18n/pt-BR.json`.

Ver [research.md](research.md), [contracts/game-crashed.md](contracts/game-crashed.md), [quickstart.md](quickstart.md).
Sem entidades persistidas: data-model não se aplica.

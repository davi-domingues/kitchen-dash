# Implementation Plan: Progresso local do visitante

**Branch**: `feat/kd-22-progresso-local` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Regras puras de progresso (`applyMatchResult`, `sanitizeProgress`, `getRecord`) em `src/features/progress/progress.js`, persistidas na chave `progress` via `services/storage.js` por um repositório fino (`progressStore.js`). A página de jogo registra o resultado ao entrar na fase de resultado e passa "novo recorde" ao `MatchResult`. O perfil vira a tela do progresso local. `match.js` passa a usar `MATCH_MODES`/`PLAYER_COUNTS` de `matchModes.js`.

## Technical Context

**Language/Version**: JavaScript ESM, React 19, Vite
**Primary Dependencies**: react-i18next, react-router, daisyUI (já aprovadas); nenhuma nova
**Storage**: `localStorage` só via `services/storage.js` (`kd:v1:progress`)
**Testing**: Vitest, relógio injetado (`now`), backend de memória
**Target Platform**: navegador desktop
**Project Type**: web app (SPA)
**Performance Goals**: gravação única por fim de partida; nada por frame
**Constraints**: core puro; textos via i18n; orçamento de tamanho (perfil no bundle inicial, código pequeno)
**Scale/Scope**: 3 modos × 2 jogadores × 10 entradas; 50 pendentes

## Constitution Check

- Core puro/determinístico: `match.js` só troca a origem das constantes. ✅
- Lógica fora de componentes: regras em módulo puro com testes. ✅
- `localStorage` só via `storage.js`. ✅
- i18n e estados vazio/erro/teclado nas telas. ✅
- Sem dependência nova; sem banco. ✅

## Project Structure

```text
src/game/core/match.js, matchModes.js        # unificação
src/features/progress/progress.js(+test)      # regras puras
src/features/progress/progressStore.js(+test) # leitura/gravação via storage
src/features/progress/LocalProgress.jsx       # tela do perfil
src/features/match/MatchResult.jsx            # badge de novo recorde
src/app/PlayPage.jsx, ProfilePage.jsx
src/i18n/pt-BR.json
```

**Structure Decision**: feature `progress` nova; sem `services/settings.js` (KD-17).

## Complexity Tracking

Nenhuma violação.

# Implementation Plan: Estado de envio ao ranking no resultado

**Branch**: `feat/debito-72-estado-envio-ranking` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

A outbox (KD-35) passa a devolver, na rodada de envio, o desfecho por partida (`outcomes`). `submitMatch` traduz isso em um estado de envio por uma função pura (`submitStatus`). `useSubmitMatch` guarda o estado e o `MatchResult` o mostra num `role="status"` (aria-live polite) com textos i18n.

## Technical Context

**Language/Version**: JavaScript ESM, React 19
**Primary Dependencies**: react-i18next, daisyUI 5 (nenhuma nova)
**Testing**: Vitest (ambiente node, sem DOM): lógica testada em funções puras e na outbox
**Target Platform**: navegador (SPA/PWA)
**Constraints**: JS inicial ≤250 KiB; Supabase só via `loadScoreService` (lazy)

## Constitution Check

- Core puro: não tocado. ✅
- Supabase só por `services/`: o estado vem da outbox em `services/`. ✅
- i18n: cinco chaves novas `play.result.sync.*`. ✅
- Acessibilidade: `role="status"` + `aria-live="polite"`, foco continua no título. ✅
- Sem dependência nova. ✅

## Project Structure

```text
src/services/scoreOutbox.js        # summary ganha outcomes por matchId
src/features/progress/scoreSync.js # submitStatus + submitMatch devolve estado
src/features/progress/useScoreSync.js # useSubmitMatch devolve estado
src/features/match/MatchResult.jsx # SubmitStatus na tela
src/i18n/pt-BR.json                # play.result.sync.*
```

## Complexity Tracking

Nenhuma violação.

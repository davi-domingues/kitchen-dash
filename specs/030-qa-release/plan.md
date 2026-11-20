# Implementation Plan: QA final e release do MVP

**Spec**: [spec.md](spec.md) · **Stack**: Vitest (core puro), Markdown em `docs/`.

## Constitution Check
- Core puro e determinístico: o teste usa só `game/core` com seed fixa. OK.
- Sem dependência nova. OK.
- Decisão nova registrada em ESTUDOS_E_DECISOES §13.9. OK.

## Estrutura
- `src/game/core/twoPlayerMatch.test.js` — partida completa com 2 jogadores por modo.
- `docs/RELEASE_CHECKLIST.md`, `docs/QA_MANUAL_v1.0.0.md`, `docs/RELEASE_NOTES_v1.0.0.md`.
- `package.json`/`package-lock.json` → 1.0.0 (`npm version --no-git-tag-version`).

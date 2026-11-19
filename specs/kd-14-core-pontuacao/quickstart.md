# Quickstart: Core de pontuação

1. `npm ci`
2. `npx vitest run src/game/core/scoring.test.js` — todos os cenários da spec passam.
3. `npx vitest run --coverage src/game/core` (se o provider de coverage estiver instalado) — `scoring.js` com 100% de linhas e ramos.
4. Gates: `npm run format:check && npm run lint && npm test && npm run build && npm run check-size`.

API: ver [contracts/scoring-api.md](contracts/scoring-api.md).

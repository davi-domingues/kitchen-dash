# Quickstart: validar a KD-46

1. `npm ci`
2. `npx vitest run src/game/core/twoPlayerMatch.test.js`: 5 testes passam (Clássico, Livre, Desafio e Desafio do dia em 2 modos).
3. `npm run format:check && npm run lint && npm test && npm run build && npm run check-size`: tudo verde.
4. `node -p "require('./package.json').version"` imprime `1.0.0`.
5. Após os merges: executar `docs/RELEASE_CHECKLIST.md` e `docs/QA_MANUAL_v1.0.0.md` em produção; a pessoa cria a tag.

# Quickstart: validar a KD-11

Pré-requisito: `npm ci`.

| Cenário | Comando | Esperado |
|---|---|---|
| Determinismo (US1, SC-001) | `npx vitest run src/game/core/update.test.js` | "mesmo seed e mesmos inputs..." passa |
| Relógio, pausa e fim (US2) | idem + `src/game/core/matchState.test.js` | testes de pausa, fim e limite passam |
| Sistemas plugáveis (US3) | `src/game/core/update.test.js` | "passa o dt limitado e as entradas aos sistemas, em ordem" passa |
| Fronteiras (FR-011) | `npm run lint` | sem erros de `no-restricted-imports` |

Contrato: [contracts/core-api.md](contracts/core-api.md). Modelo: [data-model.md](data-model.md).

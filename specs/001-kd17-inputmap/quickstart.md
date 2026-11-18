# Quickstart: validar o InputMap

## Pré-requisitos

`npm ci` com Node ≥ 24.

## Testes automatizados

```sh
npx vitest run src/game/input src/services/settings.test.js
```

Esperado: todos os testes passam. Eles cobrem as histórias da [spec](./spec.md):

| História | Arquivo |
|---|---|
| US1 dois jogadores, US3 um jogador, US4 pausa | `src/game/input/inputMap.test.js` |
| US2 toque × segurar | `src/game/input/inputMap.test.js` |
| US5 remapear e persistir | `src/game/input/keyBindings.test.js`, `src/services/settings.test.js` |

## Verificação manual (após o KD-18 ligar o InputMap à cena)

1. `npm run dev`, abrir uma partida de 2 jogadores.
2. Mover P1 com setas e P2 com WASD ao mesmo tempo: cada chef anda só com as suas teclas.
3. Toque rápido em Enter pega/solta; segurar Enter na tábua pica.
4. `P` pausa uma vez por aperto.

API: [contracts/input-api.md](./contracts/input-api.md).

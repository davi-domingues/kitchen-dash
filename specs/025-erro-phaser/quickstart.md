# Quickstart

1. `npm test` — `sceneErrorGuard.test.js`, `gameCrash.test.js` e `playFlow.test.js` cobrem o fluxo com monitoramento mockado.
2. Manual: lance localmente um erro temporário no `update` da `KitchenScene`, rode `npm run dev` e inicie uma partida. Esperado: volta à configuração da partida com o aviso "A partida foi interrompida por um erro".

# Quickstart: KD-13

```bash
npm ci
npx vitest run src/game/core/orders.test.js
```

Esperado: todos os testes passam, cobrindo chegada/desbloqueio, fila, paciência, entrega, sequência fixa e determinismo.
API em [contracts/orders-api.md](contracts/orders-api.md); dados em [data-model.md](data-model.md).

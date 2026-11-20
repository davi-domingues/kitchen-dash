# Quickstart: validar os testes de componente

1. `npm ci`
2. `npx vitest run src/app src/features` — os `*.test.jsx` rodam em happy-dom e passam.
3. `npm test` — a suíte inteira passa; os testes do core continuam no ambiente Node.
4. `npm run build && npm run check-size` — o bundle de produção não muda.

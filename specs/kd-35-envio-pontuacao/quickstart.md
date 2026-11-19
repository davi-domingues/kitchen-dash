# Quickstart — KD-35

1. `npm test` (testes da fila e do serviço com cliente fake e relógio falso).
2. Manual (Docker): `npm run db:start && npm run db:reset`, `npm run dev`, entrar por OTP (Inbucket), jogar uma partida, conferir linha em `public.scores` e `kd:v1:progress.pending` vazio.
3. Offline: DevTools → Offline, terminar partida, voltar online → envio acontece e o pendente some.

# Quickstart

1. `npm test` — `scoreOutbox.test.js`, `scoreSync.test.js` e `monitoring.test.js` cobrem descarte, ausência de relato em falha transitória e ausência de PII.
2. Manual (ambiente com DSN): logado, enviar uma partida que a RPC rejeite e conferir no Sentry o evento `score.discarded` com `reason=rejected` e sem usuário.

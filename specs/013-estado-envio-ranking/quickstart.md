# Quickstart: validar o estado de envio

1. `npm test` — testes de `scoreOutbox`, `scoreSync` e `i18n` verdes.
2. `npm run dev`, entrar com uma conta de teste (`@example.com`), jogar uma partida: o resultado mostra "Enviando…" e depois "enviada ao ranking".
3. DevTools → Network → Offline, jogar outra: mostra "pendente". Voltar online: a fila reenvia (ranking atualiza).
4. Sair da conta e jogar: mostra a mensagem de visitante.
5. Com leitor de tela (NVDA), confirmar que o estado é anunciado sem tirar o foco do título.

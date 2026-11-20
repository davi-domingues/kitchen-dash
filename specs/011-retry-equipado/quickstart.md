# Quickstart

1. `npx vitest run src/services/equippedOutbox.test.js src/features/cosmetics`: os testes com relógio falso passam.
2. Manual: com sessão, ativar "Offline" no DevTools, equipar um item, voltar a ficar online e conferir a chamada `set_equipped` na aba Network; abrir em outro navegador e ver o item equipado.

# Quickstart: KD-37

1. `npm test -- migration settings` → testes do orquestrador, da regra de conflito e do serviço.
2. Manual (com `npm run db:start` e `.env.local` apontando para o local):
   - Como visitante, jogue 2 partidas e mude uma tecla no perfil.
   - Entre com `chef@example.com` (Inbucket). O aviso "Enviando 2 partidas…" e depois "Dados deste navegador salvos na conta" aparece.
   - No Studio local: `scores` com `origin = 'local'`; `user_settings.settings.keyBindings` preenchido.
   - Recarregue: a migração não roda de novo.

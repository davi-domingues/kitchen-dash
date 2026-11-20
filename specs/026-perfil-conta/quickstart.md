# Quickstart: Perfil da conta

1. `npm test` — cobre validação de nome, mapeamento de erros, exclusão e sync de configurações.
2. Manual com `supabase start` + `npm run dev`, logado com um e-mail `@example.com` (Inbucket):
   - `/perfil`: trocar o nome para `Chef_Teste`; tentar `ab` (erro de formato) e um nome já usado (erro "em uso").
   - `/configuracoes`: mudar uma tecla; conferir `user_settings` no Studio local.
   - `/perfil`: excluir conta → cancelar (nada muda) → confirmar (volta ao início como visitante; o nome some do ranking).

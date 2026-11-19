# Quickstart: KD-33

1. `npm test` — reducer do fluxo e serviço com cliente falso.
2. Fluxo completo local: exporte `SUPABASE_AUTH_CAPTCHA_SECRET=1x0000000000000000000000000000000AA`, mude `[auth.captcha] enabled = true` e rode `npm run db:start`. Nas variáveis do Vite use a URL e a chave publicável do `supabase status` e `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA` (ver `.env.example`); `npm run dev`.
3. Abra `/entrar`, peça o código para `jogador@example.com`, leia-o no Mailpit (`http://127.0.0.1:54324`), digite e confira o e-mail na home. Recarregue (continua logado) e ative "Sair".
4. Sem `VITE_SUPABASE_*`: `/entrar` mostra "login indisponível" e o jogo segue funcionando.

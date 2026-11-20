# Quickstart: validar KD-45

1. Local sem token: `npm run build && npm run check-size` → build normal, nenhum upload, `dist/` sem `.map`.
2. `npm test` → testes de `scripts/sentry-build.test.js` e `scripts/check-size.test.js`.
3. Após o merge: aba *Actions → Deploy produção* mostra a execução no environment `production` com `supabase db push` verde.
4. Build de produção na Cloudflare: log mostra o upload do Sentry; `curl -sI https://kitchen-dash-015.pages.dev/assets/<arquivo>.js.map` retorna a SPA/404, não o mapa.
5. Disparar um erro em produção e conferir no Sentry stack com nomes de arquivo originais e release = SHA.

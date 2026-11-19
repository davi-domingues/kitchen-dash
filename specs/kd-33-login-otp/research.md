# Research: KD-33

- **Código em vez de link** — Decision: template "Magic Link" com `{{ .Token }}` e `verifyOtp({ type: 'email' })`. Rationale: `signInWithOtp` envia link por padrão (ESTUDOS_E_DECISOES). Alternatives: link mágico (quebra no PWA e em outro dispositivo).
- **Anti-bot** — Decision: Turnstile via `@marsidev/react-turnstile`, token em `options.captchaToken`; `[auth.captcha]` local com `secret = env(SUPABASE_AUTH_CAPTCHA_SECRET)`. Rationale: D9. Alternatives: script oficial manual (mais código), hCaptcha.
- **Chaves de teste** — Decision: site key de teste `1x00000000000000000000AA` (sempre aprova) no `.env.example`; a secret de teste correspondente só no ambiente do shell. Rationale: docs da Cloudflare.
- **Captcha local desligado por padrão** — Decision: `enabled = false` no config local para `supabase start` funcionar sem a variável; quem testa o fluxo completo liga com a secret de teste. Rationale: não quebrar o ambiente de quem não usa login.
- **Erros** — Decision: mapear `error.code` do Auth (`otp_expired`, `over_email_send_rate_limit`, `captcha_failed`, `validation_failed`, falha de rede) para chaves i18n. Alternatives: mostrar `error.message` cru (inglês, vaza detalhes).
- **Sessão** — Decision: `getUser` no mount + `onAuthStateChange`; sem TanStack Query (não é dado remoto em cache). Rationale: Context para a sessão (AGENTS §5).

# Tasks: Login por código no e-mail (KD-33)

**Input**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md), [contracts/auth-service.md](contracts/auth-service.md)

**Tests**: obrigatórios para `services/` e lógica pura (AGENTS §5).

## Phase 1: Setup

- [x] T001 Instalar `@marsidev/react-turnstile@1.6.3` (exata) em package.json e package-lock.json
- [x] T002 [P] Configurar `[auth.captcha]` turnstile (desligado no local, `secret = env(SUPABASE_AUTH_CAPTCHA_SECRET)`) e templates `magic_link`/`confirmation` em supabase/config.toml
- [x] T003 [P] Criar o e-mail com `{{ .Token }}` em supabase/templates/otp_code.html
- [x] T004 [P] Documentar `VITE_TURNSTILE_SITE_KEY` (chave de teste pública) em .env.example

## Phase 2: Foundational

- [x] T005 Extrair a leitura da config sem o SDK para src/services/supabaseConfig.js (`readSupabaseConfig`, `isBackendConfigured`) e reexportar em src/services/supabase.js
- [x] T006 Serviço `createAuthService(client)` e `toAuthFailure` (`reason`: invalidCode | rateLimit | captcha | invalidEmail | network | generic) em src/services/auth.js, com testes em src/services/auth.test.js
- [x] T007 `loadAuthService()` por import() dinâmico (null sem backend) em src/services/authLoader.js, com testes em src/services/authLoader.test.js
- [x] T008 Contexto `useAuth()` → `{ status: 'loading' | 'guest' | 'authenticated' | 'disabled', user, signOut }` em src/features/auth/AuthContext.js

## Phase 3: User Story 1 — Entrar com o código (P1)

**Independent test**: pedir o código para `jogador@example.com` no backend local, ler no Mailpit e entrar.

- [x] T009 [P] [US1] Reducer `loginReducer` (`step: 'email' | 'code'`, captcha zerado após falha no passo do e-mail) e validações (código "6 dígitos") em src/features/auth/loginFlow.js, com testes em src/features/auth/loginFlow.test.js
- [x] T010 [US1] Tela com Turnstile e passo do código em src/features/auth/LoginPage.jsx
- [x] T011 [US1] Rota `/entrar` carregada por `lazy()` em src/app/App.jsx
- [x] T012 [P] [US1] Textos `auth.login.*` e `auth.error.*` em src/i18n/pt-BR.json

## Phase 4: User Story 2 — Sessão e sair (P1)

**Independent test**: entrar, recarregar (continua logado), sair (vira visitante).

- [x] T013 [US2] `AuthProvider` carregando o serviço de forma lazy, `getUser` + `onUserChange`, em src/features/auth/AuthProvider.jsx; envolver o app em src/main.jsx
- [x] T014 [US2] Área de conta (carregando / entrar / e-mail + sair, erro ao sair) em src/features/auth/AccountStatus.jsx e src/app/HomePage.jsx; textos `auth.account.*` em src/i18n/pt-BR.json

## Phase 5: User Story 3 — Sem backend (P2)

**Independent test**: sem `VITE_SUPABASE_*`, abrir `/entrar` e a home.

- [x] T015 [US3] Status `disabled` no src/features/auth/AuthProvider.jsx, aviso `auth.login.unavailable` em src/features/auth/LoginPage.jsx e área de conta oculta em src/features/auth/AccountStatus.jsx

## Phase 6: Polish

- [x] T016 Registrar as decisões em docs/ESTUDOS_E_DECISOES.md
- [x] T017 Rodar os gates e conferir JS inicial ≤ 250 KiB gzip sem supabase-js/Turnstile (scripts/check-size.js, SYSTEM_DESIGN §8.5)

## Dependencies

Setup → Foundational (T005 → T006 → T007; T008) → US1 e US2 (paralelos entre si; T009 → T010 → T011) → US3 → Polish.

## Parallel

- T002, T003, T004 juntos.
- T009 e T012 enquanto o serviço (T006) é feito.

## Implementation Strategy

MVP = US1 + US2 (login e sessão são P1 e destravam KD-34/35/38). US3 é incremento de robustez offline.

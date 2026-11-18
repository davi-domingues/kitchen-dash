# Tasks: Login por código no e-mail (KD-33)

**Input**: [plan.md](plan.md), [spec.md](spec.md), [contracts/auth-service.md](contracts/auth-service.md)

## Phase 1: Setup

- [x] T001 Instalar `@marsidev/react-turnstile@1.6.3` (exata) em package.json
- [x] T002 [P] Configurar `[auth.captcha]`, OTP de 6 dígitos/600 s e template em supabase/config.toml e supabase/templates/magic_link.html
- [x] T003 [P] Documentar `VITE_TURNSTILE_SITE_KEY` (chave de teste) em .env.example

## Phase 2: Foundational

- [x] T004 Serviço `createAuthService` + mapeamento de erros em src/services/auth.js, com testes em src/services/auth.test.js
- [x] T005 Contexto de sessão em src/features/auth/AuthContext.js e src/features/auth/AuthProvider.jsx; envolver o app em src/main.jsx

## Phase 3: User Story 1 — Entrar com o código (P1)

- [x] T006 Reducer e validações em src/features/auth/loginFlow.js, com testes em src/features/auth/loginFlow.test.js
- [x] T007 Tela src/features/auth/LoginPage.jsx e rota `/entrar` em src/app/App.jsx
- [x] T008 Textos em src/i18n/pt-BR.json

## Phase 4: User Story 2 — Sessão e sair (P1)

- [x] T009 src/features/auth/AccountStatus.jsx na home (carregando / entrar / e-mail + sair) em src/app/HomePage.jsx

## Phase 5: User Story 3 — Sem backend (P2)

- [x] T010 Estado `disabled` no provider e aviso na LoginPage

## Phase 6: Polish

- [x] T011 Registrar decisões em docs/ESTUDOS_E_DECISOES.md
- [x] T012 Rodar os gates (format, lint, test, build, check-size)

## Dependencies

T001 → T007; T004 → T005 → T007/T009; T006 → T007.

## Parallel

T002, T003, T006 em paralelo.

# Tasks: Pipeline de produção (KD-45)

## Phase 1: Setup

- [X] T001 Instalar `@sentry/vite-plugin@11.16.0` com `--save-exact` em package.json e package-lock.json

## Phase 2: User Story 1 - Migrations no merge (P1)

- [X] T002 [US1] Criar .github/workflows/deploy.yml: push na main, environment production, concurrency sem cancelamento, permissions mínimas, actions por SHA, `supabase link` + `supabase db push`

## Phase 3: User Story 2 - Stack legível (P2)

- [X] T003 [P] [US2] Teste e implementação de `sentryRelease`/`sentryPluginOptions` em scripts/sentry-build.js e scripts/sentry-build.test.js
- [X] T004 [US2] Ligar plugin condicional, `sourcemap: 'hidden'` e define da release em vite.config.js
- [X] T005 [P] [US2] Ignorar `.map` em scripts/check-size.js com teste em scripts/check-size.test.js

## Phase 4: Polish

- [X] T006 Atualizar docs/DEPLOY.md, docs/SYSTEM_DESIGN.md §10, docs/ESTUDOS_E_DECISOES.md §15 e .env.example
- [X] T007 Rodar gates (format, lint, test, build, check-size)

## Dependencies

T001 → T003/T004; T002 independente; T006–T007 por último.

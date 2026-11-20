# Research: KD-45

## Onde roda o upload dos source maps
- **Decision**: no build da Cloudflare Pages, com `SENTRY_AUTH_TOKEN` (secret) no ambiente Production.
- **Rationale**: o site publicado vem desse build; os mapas precisam corresponder exatamente aos bundles servidos. Um job no CI geraria outro build, com hashes possivelmente diferentes.
- **Alternatives**: job no GitHub Actions publicando via `wrangler pages deploy` (troca a integração Git, fora de escopo); upload em CI de um build paralelo (mapas podem divergir).

## Release
- **Decision**: SHA do commit: `CF_PAGES_COMMIT_SHA` → `GITHUB_SHA` → sem release. Injetado em `import.meta.env.VITE_SENTRY_RELEASE` (se não definido explicitamente) e no `release.name` do plugin.
- **Rationale**: identifica o deploy sem passo manual e casa evento com mapas.

## Migrations
- **Decision**: workflow separado `deploy.yml`, `on: push: branches: [main]`, `environment: production`, `concurrency: { group: deploy-production, cancel-in-progress: false }`, `supabase link` + `supabase db push`.
- **Rationale**: isola segredos de produção dos checks de PR; environment permite aprovação manual.

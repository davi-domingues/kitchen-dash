# Implementation Plan: Pipeline de produção (KD-45)

**Branch**: `ci/kd-45-deploy-migrations-sourcemaps` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

Workflow `deploy.yml` (push na `main`, environment `production`, `concurrency` sem cancelamento) aplica migrations com `supabase db push`. O `vite.config.js` liga o `@sentry/vite-plugin` só quando há `SENTRY_AUTH_TOKEN`, com `build.sourcemap: 'hidden'`, release = SHA (`CF_PAGES_COMMIT_SHA` ou `GITHUB_SHA`) injetada também em `VITE_SENTRY_RELEASE`, e apaga os `.map` depois do upload. `check-size` ignora `.map`.

## Technical Context

- JavaScript ESM, Node 24, Vite 8, `@sentry/vite-plugin@11.16.0` (aprovada, SYSTEM_DESIGN §11), Supabase CLI via `supabase/setup-cli@v3.2.0` (SHA fixado).
- Testes: Vitest para a lógica pura (`scripts/sentry-build.js`) e para o filtro de `.map` do `check-size`.
- Plataforma: GitHub Actions + Cloudflare Pages (integração Git).

## Constitution Check

- Segredos só em secrets/variáveis de ambiente, nunca `VITE_*` (§6): ✅ o token não usa prefixo `VITE_`.
- Actions por SHA, `permissions` mínimas (§7): ✅ `contents: read`.
- Produção só pelo pipeline (§6): ✅ é o próprio pipeline; nenhuma execução manual pelo agente.
- Dependência aprovada com versão exata e lockfile: ✅.

## Project Structure

```text
.github/workflows/deploy.yml     # novo: migrations em produção
scripts/sentry-build.js(+test)   # release e opções do plugin (puro)
scripts/check-size.js(+test)     # ignora .map
vite.config.js                   # plugin condicional + sourcemap hidden
docs/DEPLOY.md, SYSTEM_DESIGN §10, ESTUDOS_E_DECISOES §15
```

## Post-design check

Sem violações.

# Implementation Plan: Migration automática de versão de conteúdo

**Branch**: `ci/debito-56-versao-conteudo` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

## Summary

Estender `scripts/check-content-version.js` (#87) com a função `writeAcceptedVersionsMigration` e a flag `--write`, exposta como `npm run db:content-version`. A falha do check passa a citar o comando.

## Technical Context

- Node 24, ESM, sem dependência nova (`node:fs`, `node:path`).
- Testes: Vitest com diretórios temporários e relógio injetado (`now`), sem Supabase.
- Saída: `supabase/migrations/<YYYYMMDDHHmmss>_accept_content_version_<versão>.sql` com um `update public.game_rules ... where key = 'accepted_content_versions'`, no mesmo formato que o regex do check reconhece.

## Constitution Check

- Schema só por migration: a migration é gerada como arquivo e revisada no PR; nenhum acesso ao banco. OK.
- Sem rede nem Supabase nos testes. OK.
- CI sem permissão de escrita: continua só verificando. OK.

## Project Structure

- `scripts/check-content-version.js` (alterado)
- `scripts/check-content-version.test.js` (novos casos)
- `package.json` (script `db:content-version`)
- `docs/ESTUDOS_E_DECISOES.md` (decisão)

## Decisões

- Gerar localmente, não no CI: um bot que commita migrations exigiria `contents: write` e contornaria a revisão.
- Manter versões antigas: clientes PWA em cache ainda enviam a versão anterior.
- Timestamp em UTC, como o Supabase CLI.

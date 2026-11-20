# Implementation Plan: Teste concorrente do envio de pontuação

**Branch**: `test/debito-76-submit-score-concorrente` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

## Summary

Script Node `scripts/submit-score-concurrency.js`, exposto como `npm run db:test:concurrency`, que usa o `supabase-js` (dependência existente) contra o Supabase local para disparar 8 chamadas simultâneas de `submit_score` com o mesmo `match_id` e conferir `scores` e `player_stats`.

## Technical Context

- Node 24, ESM; sem dependência nova.
- URL e chave publicável vêm de `npx supabase status -o env` (stack local), sem ler `.env*`.
- Não entra no Vitest nem no CI.

## Constitution Check

- Testes do Vitest sem Supabase real: o script fica fora do `npm test`. OK.
- Dados fictícios `@example.com`. OK.
- Nunca escreve em produção: recusa host que não seja `127.0.0.1`/`localhost`. OK.
- Sem mudança de schema. OK.

## Research (Phase 0)

- **Decisão:** script Node com `Promise.all` de chamadas RPC reais (conexões HTTP distintas no PostgREST).
- **Motivo:** pgTAP roda numa transação e não gera concorrência real; `dblink` não está habilitado e habilitá-lo só para teste seria mudança de schema.
- **Alternativas:** `dblink` com transações assíncronas (exige extensão); `pgbench` com script (exige ferramenta extra e JWT manual).

## Design (Phase 1)

- Sem entidades novas; lê `scores` (RLS: próprias linhas) e `player_stats` (própria linha).
- Contrato do comando: sai com código 0 e `OK: 8 envios simultâneos gravaram 1 linha.`; caso contrário código 1 e `FALHOU: <motivo>`.
- Quickstart: `npm run db:start && npm run db:reset && npm run db:test:concurrency`.

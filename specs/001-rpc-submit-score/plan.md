# Implementation Plan: Envio validado de pontuação (submit_score)

**Branch**: `feat/kd-31-rpc-submit-score` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Uma migration cria `public.submit_score` (plpgsql, `security definer`, `set search_path = ''`, `execute` só para `authenticated`) e adiciona a regra `cosmetic_unlocks` em `game_rules`. Testes pgTAP em `supabase/tests/submit_score_test.sql`.

## Technical Context

- **Language/Version**: SQL/PL/pgSQL (Postgres 17 do Supabase local)
- **Primary Dependencies**: Supabase CLI, pgTAP (já usados na KD-30)
- **Storage**: tabelas da KD-30 (`scores`, `best_scores`, `player_stats`, `user_cosmetics`, `game_rules`)
- **Testing**: `npm run db:reset` + `npm run db:test`; `supabase db lint`
- **Constraints**: escrita só pela RPC; nada novo no cliente nesta task

## Constitution Check

- Backend seguro (AGENTS §6): RLS intacta, RPC `security definer` + `search_path = ''` + `revoke` de `public`/`anon` — OK.
- Regras configuráveis em `game_rules` (SYSTEM_DESIGN §6.2) — OK.
- Testes determinísticos sem dados reais (`@example.com`) — OK.
- Sem dependência nova — OK.

## Research (Phase 0)

- **Erros**: `raise exception` com mensagem estável (`not_authenticated`, `invalid_input`, `match_conflict`, `rate_limited`, `implausible_duration`, `implausible_score`, `unknown_content_version`) e SQLSTATE dedicado (`28000` para auth, `22023` para entrada/plausibilidade, `23505` para conflito, `54000` para rate limit). O cliente distingue "reenviar depois" (rate limit) de "descartar" (inválido). Alternativa rejeitada: retorno `{ ok:false }`, que esconderia falhas do supabase-js.
- **Idempotência**: `insert ... on conflict (match_id) do nothing returning`. Sem linha → replay: se o dono for o mesmo, devolve o estado atual (`is_new_best` = recorde aponta para esta partida; `unlocked` vazio); se for outro, `match_conflict`. O replay é checado antes do rate limit.
- **Concorrência**: `pg_advisory_xact_lock` por usuário serializa o rate limit e o upsert do recorde.
- **Rate limit**: contagem em `scores` do usuário nos últimos 60 s (índice `(user_id, created_at desc)` já existe). Sem tabela extra.
- **Desbloqueio**: `game_rules.cosmetic_unlocks` = `{ "<id>": limiar }` com os valores do PRD; libera todo item com limiar ≤ maior `best_scores.score` do usuário, `on conflict do nothing`.
- **Assinatura × `match:ended`**: `matchId→p_match_id`, `score→p_score`, `durationMs→p_duration_ms`, `seed→p_seed` (bigint, 0..2³²−1), `contentVersion→p_content_version`, `ordersCompleted→p_orders_completed`; `board`/`origin` vêm do React. `mode`, `players` e `ordersFailed` não são enviados (o `board` os codifica; o schema não guarda).

## Design (Phase 1)

- Data model: sem tabela nova; `game_rules` ganha a chave `cosmetic_unlocks`.
- Contrato: [contracts/submit_score.md](contracts/submit_score.md).
- Quickstart: `npm run db:start`, `npm run db:reset`, `npm run db:test`, `npx supabase db lint --level warning`.

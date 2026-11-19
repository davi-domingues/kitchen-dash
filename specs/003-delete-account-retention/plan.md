# Implementation Plan: Exclusão de conta e retenção

**Branch**: `feat/kd-32-exclusao-conta-retencao` | **Date**: 2026-11-19 | **Spec**: [spec.md](spec.md)

## Summary

Uma migration adiciona a RPC autenticada `delete_my_account`, que exclui a identidade do usuário e, por cascata, seus dados de jogo. A mesma migration agenda a exclusão diária, às 03:00 UTC, de pontuações com mais de 90 dias. Testes pgTAP verificam permissões, exclusão integral e a fronteira de retenção.

## Technical Context

- **Language/Version**: SQL/PL/pgSQL (Postgres 17 no Supabase local)
- **Primary Dependencies**: Supabase CLI, pgTAP e pg_cron já incluídos na plataforma
- **Storage**: `auth.users` e tabelas públicas de perfil e progresso existentes
- **Testing**: `npm run db:reset`, `npm run db:test` e lint de banco do Supabase
- **Target Platform**: banco Supabase local e hospedado
- **Project Type**: migration de banco para aplicação web
- **Performance Goals**: limpeza diária indexada por `scores.created_at`; uma exclusão remove somente os dados de um usuário
- **Constraints**: RLS intacta; a RPC é `security definer`, fixa `search_path` vazio e não pode ser chamada por `anon`; sem dependências novas
- **Scale/Scope**: histórico de partidas de usuários autenticados, com retenção de 90 dias

## Constitution Check

- Privacidade: a exclusão integral de conta atende ao princípio de privacidade — OK.
- Segurança: a escrita privilegiada usa RPC autenticada, sem abrir escrita direta ou expor segredo — OK.
- Banco: a mudança é uma migration versionada, com testes locais e dados fictícios — OK.
- Custo: a retenção diária usa o índice temporal existente e preserva o limite do plano gratuito — OK.
- Sem dependências novas — OK.

## Project Structure

### Documentation

```text
specs/003-delete-account-retention/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/delete_my_account.md
└── tasks.md
```

### Source Code

```text
supabase/
├── migrations/
│   └── 20261119122306_delete_my_account_and_score_retention.sql
└── tests/
    └── delete_my_account_test.sql

docs/
└── SYSTEM_DESIGN.md
```

**Structure Decision**: a frente é exclusivamente de banco; a migration, o teste pgTAP e a documentação técnica ficam nos diretórios existentes acima.

## Complexity Tracking

Nenhuma violação de constituição ou complexidade adicional é necessária.

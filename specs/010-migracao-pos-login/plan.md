# Implementation Plan: Migração de partidas de visitante pós-login

**Branch**: `fix/debito-73-migracao-pos-login` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

`runAccountMigration` (KD-37) devolve `skipped` quando as três etapas já estão marcadas, então partidas de visitante novas ficam presas no `pending`. A correção torna a migração pendente enquanto houver partida de visitante e, nesse caso, reabre as etapas `scores` e `cosmetics` com os contadores zerados.

## Technical Context

**Language/Version**: JavaScript ESM (Vite)
**Primary Dependencies**: nenhuma nova
**Storage**: `kd:v1:migration` e `kd:v1:progress` via `services/storage.js`
**Testing**: Vitest, storage em memória, dependências remotas falsas
**Target Platform**: navegador
**Project Type**: SPA
**Constraints**: idempotência por matchId; sem chamada remota quando não há o que migrar

## Constitution Check

- I (sem rede): as partidas ficam no local até a resposta definitiva. OK
- II (cliente não confiável): o envio continua pelo `submit_score` com origem `local`. OK
- III, IV, VI: sem impacto. V: só `features/migration`, sem tocar fornecedores. OK

## Project Structure

```text
specs/010-migracao-pos-login/   # spec, plan, research, data-model, quickstart, tasks
src/features/migration/accountMigration.js       # isMigrationDone e reabertura de etapas
src/features/migration/accountMigration.test.js  # regressão #73
```

Sem `contracts/`: nenhuma interface externa muda.

## Complexity Tracking

Sem violações.

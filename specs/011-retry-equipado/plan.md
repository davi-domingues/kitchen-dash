# Implementation Plan: Reenvio do equipado para a conta

**Branch**: `feat/debito-74-retry-equipado` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

Hoje `equipAndSync` chama `pushEquipped` uma vez e ignora a falha. Uma fila de um item por usuário (`services/equippedOutbox.js`) guarda a pendência, reenvia com o mesmo backoff da outbox de pontuação (`backoffDelay` e constantes importados de `scoreOutbox.js`, sem copiar) e é disparada ao equipar, no login e no evento `online`. O login só lê os cosméticos da conta quando não resta pendência.

## Technical Context

**Language/Version**: JavaScript ESM
**Primary Dependencies**: nenhuma nova
**Storage**: chave nova `kd:v1:equippedOutbox` via `services/storage.js`
**Testing**: Vitest com relógio e timers falsos injetados (`now`, `setTimer`, `clearTimer`, `rng`)
**Target Platform**: navegador
**Constraints**: offline primeiro; o JS inicial não importa o SDK (o envio usa `loadCosmeticsService`)

## Constitution Check

- I (sem rede): o local muda na hora; a fila só tenta a conta. OK
- II: a gravação continua pela RPC `set_equipped`. OK
- V (fornecedores atrás de interfaces): a fila fica em `services/` e recebe `send` injetado; `features/` não vê o Supabase. OK
- III, IV, VI: sem impacto.

## Project Structure

```text
src/services/equippedOutbox.js           # fila de um item com backoff
src/services/equippedOutbox.test.js
src/features/cosmetics/cosmeticsSync.js  # equipAndSync usa a fila; equippedOutboxFor(deps)
src/features/cosmetics/cosmeticsSync.test.js
src/features/cosmetics/useCosmeticsSync.js  # flush no login e no online; pull só sem pendência
```

Sem `contracts/`: nenhuma interface externa muda.

## Complexity Tracking

Sem violações.

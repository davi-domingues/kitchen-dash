# Implementation Plan: Envio de pontuação (KD-35)

**Branch**: `feat/kd-35-envio-pontuacao` | **Spec**: [spec.md](spec.md)

## Technical Context

JS ESM, React 19, Vitest. Sem dependência nova (TanStack Query avaliada e não usada, ver research). Armazenamento via `services/storage.js` (`kd:v1:outbox`). RPC `submit_score` (KD-31) via supabase-js carregado por `import()`.

## Constitution Check

- Offline first (princípio I): sem backend ou sem rede o jogo segue; fila persiste. OK
- Fronteiras §4: `services/scoreOutbox.js` e `services/scoreService.js` isolam o fornecedor; `features/progress` só chama a fila. Sem Supabase no Phaser/core. OK
- Bundle: `scoreLoader.js` faz `import('./scoreService.js')`; nada de import estático do SDK. OK
- Testes determinísticos: relógio, timer e rng injetáveis; cliente fake. OK
- Segurança: só chave publicável; RPC já protegida por RLS/sessão. OK

## Estrutura

```text
src/services/scoreService.js      # createScoreService(client), toBoard, classifyScoreError
src/services/scoreLoader.js       # loadScoreService() lazy
src/services/scoreOutbox.js       # createScoreOutbox({...}) fila + backoff
src/features/progress/scoreSync.js         # instância do app ligando outbox ↔ progressStore
src/features/progress/useScoreSync.js      # hook: flush no login/abertura/online, enqueue no fim
```

Pós-design: Constitution Check mantida.

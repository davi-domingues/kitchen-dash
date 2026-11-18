# Implementation Plan: InputMap — controles de teclado

**Branch**: `feat/kd-17-inputmap` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

## Summary

Módulo puro em `src/game/input/` que recebe `keydown`/`keyup` com o tempo e devolve eventos abstratos e vetores de movimento por jogador. A persistência das teclas fica em `src/services/settings.js` sobre o `storage.js` versionado. A cena Phaser (KD-18) só repassa eventos de teclado.

## Technical Context

**Language/Version**: JavaScript ESM (Node ≥ 24, Vite)
**Primary Dependencies**: nenhuma nova
**Storage**: `localStorage` via `services/storage.js`, chave `kd:v1:settings` campo `keyBindings`
**Testing**: Vitest, tempo como parâmetro (sem relógio real)
**Target Platform**: desktop com teclado
**Project Type**: web (jogo)
**Performance Goals**: O(teclas pressionadas) por frame; sem alocação relevante
**Constraints**: sem Phaser/DOM em `game/input`; teclas por `KeyboardEvent.code`
**Scale/Scope**: 2 jogadores, 11 teclas

## Constitution Check

- **I. Sem rede**: só armazenamento local. ✅
- **III. Regras separadas de renderização**: input não importa Phaser; regras de estação ficam no core. ✅
- **V. Fornecedores atrás de interfaces**: `localStorage` só via `services/storage.js`. ✅
- Demais princípios não se aplicam. Sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/001-kd17-inputmap/
├── spec.md
├── plan.md
├── data-model.md
├── contracts/input-api.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/game/input/
├── keyBindings.js        # padrão, remapKey, sanitizeKeyBindings
├── keyBindings.test.js
├── inputMap.js           # createInputMap, INPUT_EVENTS, TAP_THRESHOLD_MS
└── inputMap.test.js
src/services/
├── settings.js           # loadKeyBindings, saveKeyBindings
└── settings.test.js
```

**Structure Decision**: projeto único existente; `game/input` puro e `services/` para persistência.

## Complexity Tracking

Sem violações a justificar.

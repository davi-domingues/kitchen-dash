# Implementation Plan: Estações e ingredientes (KD-12)

**Branch**: `feat/kd-12-core-estacoes` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Estações montadas a partir do mapa da cozinha, itens (ingrediente, prato) e a panela fixa de
cada fogão, com um sistema `createStationsSystem(content)` no contrato do KD-11 que aplica as
ações dos chefs (`tap`, `holdStart`, `holdEnd`) e avança corte e cozimento pelo `dtMs`.

## Technical Context

**Language/Version**: JavaScript ESM, sem TypeScript
**Primary Dependencies**: nenhuma; o conteúdo (receitas, ingredientes, cozinha) é injetado
**Storage**: N/A (estado serializável no `MatchState`)
**Testing**: Vitest, sem relógio real
**Target Platform**: navegador (cena KD-18) e Node (testes)
**Project Type**: módulos em `src/game/core/`
**Constraints**: puro e determinístico; sem Phaser, React, DOM, `Math.random`
**Scale/Scope**: 3 módulos, ~250 linhas de produção

## Constitution Check

| Princípio | Status |
|---|---|
| I. Funciona sem rede | OK |
| II. Cliente não é confiável | OK: regras determinísticas, reproduzíveis por replay |
| III. Regras separadas de renderização | OK: tudo no core; a cena só envia ações |
| IV. Conteúdo é dado | OK: receitas, `chopMs`, `cookMs` e mapa vêm do conteúdo injetado |
| V. Fornecedores atrás de interfaces | N/A |
| VI. Plano gratuito | N/A |

Sem violações. Reavaliado após o design: sem mudanças.

## Project Structure

```text
specs/kd-12-core-estacoes/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md
├── contracts/stations-api.md
└── checklists/requirements.md

src/game/core/
├── items.js / items.test.js         # ingrediente, prato, encaixe em receitas
├── stations.js / stations.test.js   # createStations, createChef, interact, canInteract
├── stationsSystem.js / .test.js     # createStationsSystem: ações + corte + fogão
└── coreEvents.js                    # novos eventos de estação
```

**Structure Decision**: módulos separados por responsabilidade para evitar um god module.

## Complexity Tracking

Nenhuma.

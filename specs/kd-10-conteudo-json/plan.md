# Implementation Plan: Conteúdo do jogo em dados com schema (KD-10)

**Branch**: `feat/kd-10-conteudo-json` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/kd-10-conteudo-json/spec.md`

## Summary

O conteúdo fica em três JSON dentro de `src/content/`, cada um com seu JSON Schema. Um plugin do Vite valida tudo no `buildStart`, usando ajv mais checagens de referência e de mapa, e derruba o build e o dev server quando algo está errado. Um loader sem dependências expõe os dados congelados, consultas por id e por desbloqueio, a chave i18n e o `CONTENT_VERSION` (FNV-1a de 32 bits).

## Technical Context

**Language/Version**: JavaScript ESM, Node ≥ 24

**Primary Dependencies**: ajv 8.20.0 (dev, aprovada) e Vite 8 (plugin)

**Storage**: arquivos JSON versionados no repositório

**Testing**: Vitest (determinístico, sem rede)

**Target Platform**: navegador (o loader) e Node no build (o validador)

**Project Type**: web app (SPA React + Phaser)

**Performance Goals**: loader com custo desprezível (3 JSON pequenos, um único hash na carga)

**Constraints**: o ajv não pode entrar no bundle; o `game/core` pode importar o loader

**Scale/Scope**: 6 ingredientes, 4 receitas, 1 cozinha, 11 cosméticos

## Constitution Check

| Princípio | Status |
|---|---|
| I. Funciona sem rede | ✔ O conteúdo vai no bundle |
| II. Cliente não confiável | ✔ `content_version` é só um identificador; a validação da lista aceita fica no servidor (KD-31) |
| III. Regras separadas de renderização | ✔ O loader é JS puro, sem Phaser ou React |
| IV. Conteúdo é dado | ✔ É o objetivo da task |
| V. Fornecedores atrás de interfaces | ✔ Não há fornecedor envolvido |
| VI. Plano gratuito | ✔ Não se aplica |

Sem violações, pré e pós-design.

## Project Structure

### Documentation (this feature)

```text
specs/kd-10-conteudo-json/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/content-api.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/content/
├── recipes.json · kitchens.json · cosmetics.json
├── schemas/{recipes,kitchens,cosmetics}.schema.json
├── index.js            # loader (contrato em contracts/content-api.md)
└── content.test.js
scripts/
├── validate-content.js # validateContent, readContent, contentPlugin
└── validate-content.test.js
vite.config.js          # registra contentPlugin()
src/i18n/pt-BR.json     # chaves <tipo>.<id>.name
src/i18n/i18n.test.js   # passa a contar as chaves derivadas do conteúdo
```

**Structure Decision**: segue o SYSTEM_DESIGN §3 (`src/content/`). O validador fica em `scripts/` porque roda só no Node.

## Complexity Tracking

Sem desvios.

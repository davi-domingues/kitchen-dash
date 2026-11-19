# Implementation Plan: Desafio do dia

**Branch**: `001-daily-challenge` | **Date**: 2026-11-19 | **Spec**: `specs/001-daily-challenge/spec.md`

**Input**: Feature specification from `specs/001-daily-challenge/spec.md`

## Summary

Implementar o desafio do dia com seleção determinística por data UTC, validação ao fim da partida e registro local de conclusão, garantindo consistência entre jogadores e suporte offline. A lógica fica no core (determinística e testável), o resultado entra no resumo de partida e o status é persistido no progresso local.

## Technical Context

**Language/Version**: JavaScript (ESM), Node 24 para tooling

**Primary Dependencies**: React, Phaser 3.90, Vite, Vitest

**Storage**: localStorage via `src/services/storage.js`

**Testing**: Vitest

**Target Platform**: Navegadores desktop (MVP)

**Project Type**: Web app com jogo em canvas

**Performance Goals**: Manter 60 fps no jogo

**Constraints**: Offline-first, regras determinísticas no `game/core`, sem novas dependências, todo texto via i18n

**Scale/Scope**: MVP com partidas locais 1-2 jogadores, sem backend para o desafio diário

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- O desafio do dia deve funcionar offline e sem rede.
- Regras no `game/core`, determinísticas e testáveis (Vitest).
- Conteúdo como dado versionado (desafios definidos em JSON).
- Sem dependências novas.
- Texto visível ao jogador via i18n.

Status: **PASSA** (sem violações conhecidas).

## Project Structure

### Documentation (this feature)

```text
specs/001-daily-challenge/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
├── content/
├── features/
├── game/
│   ├── core/
│   └── phaser/
├── i18n/
└── services/
```

**Structure Decision**: Projeto único em `src/` com separação por camadas (core, phaser, features, services, content).

## Constitution Check (post-design)

Reavaliado após pesquisa e contratos. Sem violações adicionais.

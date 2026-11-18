# Implementation Plan: Telas de partida (KD-21)

**Branch**: `feat/kd-21-telas-react` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Telas React de home, escolha de partida, pausa e resultado, mais as rotas do app. A lógica de fluxo fica num reducer puro e a validação do resultado num módulo puro, ambos testados; os componentes só renderizam. O contrato `match:ended` é fechado aqui ([contracts/match-ended.md](contracts/match-ended.md)).

## Technical Context

**Language/Version**: JavaScript ESM, React 19, Node ≥ 24
**Primary Dependencies**: react-router 8, react-i18next, daisyUI 5 + Tailwind v4, Phaser 3 (só o `EventBus` e o `registry`)
**Storage**: nenhum nesta task
**Testing**: Vitest em ambiente node (sem jsdom aprovado)
**Target Platform**: navegador desktop
**Project Type**: SPA web
**Performance Goals**: JS inicial ≤ 250 KB gzip (Phaser fica no chunk lazy de `/jogar`)
**Constraints**: sem estado global, textos via i18n, acessível por teclado
**Scale/Scope**: 4 telas + 4 cascas de rota

## Constitution Check

| Princípio | Situação |
|---|---|
| I. Funciona sem rede | ✔ Nada depende de rede |
| II. Cliente não é confiável | ✔ Payload validado; o envio real fica na RPC (KD-31) |
| III. Regras separadas da renderização | ✔ Modos no `game/core`; fluxo em reducer puro; React não renderiza por frame |
| IV. Conteúdo é dado | ✔ Textos no dicionário i18n |
| V. Fornecedores atrás de interfaces | ✔ Sem Supabase nesta task |
| VI. Plano gratuito | ✔ Sem custo |

Reavaliado após o design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/kd-21-telas-react/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md
├── contracts/match-ended.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/game/core/matchModes.js          # modos, nº de jogadores, validação da configuração
src/game/phaser/events.js            # documenta o payload de match:ended
src/game/phaser/registryKeys.js      # MATCH_CONFIG_KEY
src/game/phaser/PhaserGame.jsx       # recebe matchConfig e grava no registry
src/features/match/matchEnded.js     # parseMatchEnded, formatDuration
src/features/match/playFlow.js       # reducer da página de jogo
src/features/match/{MatchSetup,PauseDialog,MatchResult}.jsx
src/app/{App,HomePage,PlayPage,PlaceholderPage,RankingPage,ProfilePage,PrivacyPage,NotFoundPage}.jsx
```

**Structure Decision**: segue SYSTEM_DESIGN §3 (`app/` rotas, `features/` telas, `game/` jogo).

## Complexity Tracking

Sem violações a justificar.

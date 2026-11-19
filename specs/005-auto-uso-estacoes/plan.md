# Implementation Plan: Auto-uso de estações ao ficar parado

**Branch**: `feat/kd-18-auto-uso-estacoes` | **Date**: 2026-11-19 | **Spec**: [spec.md](spec.md)

**Input**: especificação da issue #89 (lacuna da KD-18/KD-12).

## Summary

A regra de "ficar parado" passa a viver no core como um sistema puro e determinístico: cada chef acumula tempo parado em passos de `dtMs`, reinicia ao mover, mudar de alvo ou agir manualmente, e expõe uma decisão de auto-uso. A `KitchenScene` consome essa decisão e envia `holdStart` na tábua ou `tap` no fogão/passe, com o mesmo vocabulário do contrato KD-12; ações automáticas são marcadas para não gerarem avisos de recusa nem duplicarem o botão.

## Technical Context

**Language/Version**: JavaScript ESM, sem TypeScript (Node 24 no desenvolvimento)

**Primary Dependencies**: Phaser 3.90 e Vitest 5 (já instalados); nenhuma dependência nova

**Storage**: N/A — estado em memória no `MatchState`; nada é gravado em `localStorage`

**Testing**: Vitest com laços de `dtMs` fixo, seed determinística e sem relógio real

**Target Platform**: navegador (desktop e PWA mobile), mesma cena KD-18

**Project Type**: módulo puro em `src/game/core` + integração em `src/game/phaser`

**Performance Goals**: regra O(número de chefs) por frame; sem timers do Phaser e sem alocações por frame além dos arrays de ações já existentes

**Constraints**: core sem Phaser, React, DOM, `Date.now` ou `Math.random`; cena sem Supabase; `cleanup()` remove listeners; nenhum texto novo visível (sem impacto em i18n)

**Scale/Scope**: até 2 chefs, 3 tipos de estação com auto-uso, 1 módulo novo de core + ajustes pontuais na composição e na cena

## Constitution Check

*Gate avaliado antes do design e reavaliado ao final do Phase 1.*

| Princípio | Status | Justificativa |
|---|---|---|
| I. Jogo funciona sem rede | OK | Toda a regra é local; nenhuma chamada de rede |
| II. Cliente não é confiável | OK | Não há gravação de progresso nem pontuação nesta feature |
| III. Regras separadas da renderização | OK | Tempo parado, elegibilidade e dedupe ficam em `game/core` puro e testado; a cena só traduz decisão em entrada |
| IV. Conteúdo é dado | OK | Nenhum valor de balanceamento novo em cena; limiar é constante do core, registrada em ESTUDOS_E_DECISOES |
| V. Fornecedores atrás de interfaces | OK | Nenhum fornecedor envolvido; EventBus continua intacto |
| VI. Plano gratuito | N/A | Sem impacto de custo ou tamanho relevante |

Sem violações. Reavaliado após o design: sem mudanças, portanto sem entradas em Complexity Tracking.

## Project Structure

```text
specs/005-auto-uso-estacoes/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/auto-use-api.md
├── checklists/requirements.md
└── tasks.md                         # gerado por /speckit-tasks

src/game/core/
├── idleSystem.js                    # novo: tempo parado, decisão, dedupe, bloqueio
├── idleSystem.test.js               # novo: testes determinísticos da regra
├── kitchenUpdate.js                 # ajuste: registrar sistema e filtrar recusa automática
├── kitchenUpdate.test.js            # ajuste: integração movimento + auto-uso + estações
└── kitchenMap.js / stations.js      # sem mudança de contrato; reutilização de findTargetStation/canInteract

src/game/phaser/scenes/KitchenScene.js  # ajuste: usar seletores do core; blur/foco/pausa
docs/ESTUDOS_E_DECISOES.md              # registro do limiar e da política de dedupe
```

**Structure Decision**: mantém a divisão atual do repositório (`game/core` puro, `game/phaser` para render/input). Nenhum diretório novo em `src/`.

## Design Decisions (Fase 1)

1. **Tempo no core, decisão consumida pela cena**: `createIdleSystem(content)` atualiza `chef.idleMs` e grava `chef.autoAction`; `selectAutoActions(state)` devolve as entradas já resolvidas. A cena não acumula tempo nem cria timers.
2. **Tábua ≠ toque**: `holdStart` contínuo enquanto houver ingrediente cru **na tábua** e o chef estiver de mãos vazias. `canInteract` é verdadeiro nesse estado (resolveTap permite pegar o item), mas `tap` seria usado para pegá-lo — por isso o auto nunca usa `tap` na tábua. Colocar o ingrediente vindo da mão continua manual.
3. **Fogão/passe one-shot**: `tap` automático somente com `canInteract` verdadeiro, travado por uma assinatura do estado da estação alvo; disparo único até o chef mudar de posição/alvo ou a estação mudar.
4. **Silêncio e dedupe**: entradas automáticas levam `auto: true`; o wrapper de estações descarta `action:rejected` dessas entradas (cobre corrida com outro chef). A cena remove o toque manual duplicado antes de resolver a estação alvo; o botão, quando não duplicado, cancela o auto pendente.
5. **Pausa, blur e fim**: `update` já é no-op fora de `RUNNING`; `setIdleBlocked(state, true)` zera contadores e impede acumulação durante blur/pausa, e é desfeito ao recuperar o foco/retomar.

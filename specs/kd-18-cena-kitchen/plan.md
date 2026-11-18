# Implementation Plan: Cena Kitchen (KD-18)

**Branch**: `feat/kd-18-cena-kitchen` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Regras de grade em `game/core/kitchenMap.js` (grade, spawns, alcançabilidade, estação alvo),
movimento em `game/core/movementSystem.js` (sistema no contrato do KD-11) e a composição
`createKitchenUpdate` em `game/core/kitchenUpdate.js` (movimento + estações). A `KitchenScene`
só traduz o InputMap (KD-17) em entradas, chama o update e desenha placeholders.

## Technical Context

**Language/Version**: JavaScript ESM, sem TypeScript
**Primary Dependencies**: Phaser 3.90 (já instalado); nenhuma nova
**Storage**: N/A
**Testing**: Vitest (core); a cena é verificada manualmente
**Target Platform**: navegador
**Project Type**: `src/game/core`, `src/game/phaser`
**Constraints**: core puro; cena sem Supabase; cleanup no shutdown; textos via i18n
**Scale/Scope**: 3 módulos de core + cena, ~400 linhas de produção

## Constitution Check

| Princípio | Status |
|---|---|
| I. Sem rede | OK: cena local |
| II. Cliente não confiável | OK: posições no `MatchState`, reproduzíveis |
| III. Regras separadas | OK: colisão, alvo, alcançabilidade e passo no core |
| IV. Conteúdo é dado | OK: mapa e spawns do `kitchens.json`; passo do chef é regra do core (research) |
| V. Fornecedores | OK: cena usa EventBus e `services/settings` só via InputMap |
| VI. Plano gratuito | N/A |

Sem violações. Reavaliado após o design: sem mudanças.

## Project Structure

```text
specs/kd-18-cena-kitchen/  spec, plan, research, data-model, quickstart, tasks, contracts/
src/game/core/kitchenMap.js (+ test)
src/game/core/movementSystem.js (+ test)
src/game/core/kitchenUpdate.js (+ test)
src/game/phaser/kitchenView.js        # desenho placeholder
src/game/phaser/scenes/KitchenScene.js
src/i18n/pt-BR.json
```

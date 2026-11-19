# Implementation Plan: HUD e jogo jogável (KD-20)

**Branch**: `feat/kd-20-hud` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Compor modos (KD-15) com a cozinha (KD-18) num só ponto do core, ligar a cena à config e às teclas vindas do React (KD-21), desenhar o HUD no Phaser a partir de um modelo puro (`buildHudModel`) e fechar o ciclo pausa/retomada/encerrar/`match:ended` com `matchId`.

## Technical Context

**Language/Version**: JavaScript ESM (Vite) · **Primary Dependencies**: Phaser 3, React 19, react-i18next (sem dependência nova)
**Testing**: Vitest (puro, determinístico) · **Target Platform**: navegador desktop
**Constraints**: React não re-renderiza por frame; `game/phaser` não importa `services/`; texto via i18n; orçamento de tamanho (SYSTEM_DESIGN §8.5).

## Constitution Check

- Core puro e determinístico: composição nova em `game/core` sem Phaser/DOM; `crypto.randomUUID` fica na cena. ✅
- Fronteiras §4: teclas chegam pelo registry, preenchido pelo React com `loadKeyBindings()`. ✅
- i18n: textos do HUD em `game.hud.*`. ✅
- Testes: `hudModel` e composição do core com testes. ✅
- Sem dependência nova, sem banco. ✅

## Project Structure

```text
src/game/core/kitchenUpdate.js   # extraSystems; createKitchenMatch com players
src/game/core/match.js           # createMatch passa a montar a cozinha (sem duplicação)
src/game/phaser/hudModel.js      # puro: formatClock, patienceBand, buildHudModel
src/game/phaser/hudView.js       # desenho do HUD (Phaser Text/Graphics)
src/game/phaser/kitchenView.js   # aceita a área disponível abaixo do HUD
src/game/phaser/scenes/KitchenScene.js  # config, pausa, encerrar, match:ended com matchId
src/game/phaser/registryKeys.js  # KEY_BINDINGS_KEY
src/game/phaser/events.js        # MATCH_END_REQUESTED
src/features/match/PauseDialog.jsx, src/app/PlayPage.jsx  # "Encerrar" no Livre; teclas no registry
```

## Complexity Tracking

Nenhuma violação.

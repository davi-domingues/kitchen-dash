# Implementation Plan: Cosméticos locais (KD-23)

**Branch**: `feat/kd-23-cosmeticos-locais` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

As regras puras dos cosméticos ficam em `features/cosmetics/cosmetics.js`: desbloqueio por maior pontuação, equipar, sanitizar e unir com a conta. A persistência fica em `cosmeticsStore.js`, numa chave nova `kd:v1:cosmetics` gravada via `services/storage.js`, então `kd:v1:progress` não muda. `useRecordedResult` passa a registrar a pontuação e devolve `unlocked`, que o `MatchResult` mostra. O React lê o visual equipado e o entrega ao Phaser por `registry` (`COSMETICS_KEY`). O `kitchenView` desenha chapéu e avental sobre cada chefe e usa o tema nas paredes. O `/perfil` ganha o `CosmeticsPicker`.

## Technical Context

**Language/Version**: JavaScript ESM, React 19, Phaser 3.
**Storage**: localStorage via `services/storage.js`.
**Testing**: Vitest + @testing-library/react.
**Constraints**: sem mudar `content/*.json` (`CONTENT_VERSION`); `game/phaser` não importa `services`.

## Constitution Check

- Fronteiras §4: regra fora de componente e de cena ✅; cena recebe dados pelo registry ✅.
- i18n: nomes via `contentKey('cosmetic', id)`, textos novos em `profile.cosmetics.*` e `play.result.*` ✅.
- Sem dependência nova ✅. Sem banco ✅.

## Project Structure

```text
src/features/cosmetics/cosmetics.js(+test)       regras puras
src/features/cosmetics/cosmeticsStore.js(+test)  persistência
src/features/cosmetics/CosmeticsPicker.jsx(+test) UI do /perfil
src/features/progress/useRecordedResult.js       registra pontuação e devolve unlocked
src/features/match/MatchResult.jsx               aviso
src/game/phaser/registryKeys.js, PhaserGame.jsx, scenes/KitchenScene.js, kitchenView.js
src/app/PlayPage.jsx, ProfilePage.jsx; LocalProgress (apagar também limpa cosméticos)
```

Pós-design: Constitution Check mantido ✅.

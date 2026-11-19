# Implementation Plan: Visual do protótipo (KD-19 parte 1)

**Branch**: `feat/kd-19-visual-prototipo` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

## Summary

Portar o render procedural do protótipo (canvas 2D) para Phaser `Graphics`/`Text`. Todo cálculo (paleta por tema, ícone/rótulo de estação, estado do fogão, layout do chef, cores do HUD) vai para módulos puros testados em `src/game/phaser/`; `kitchenView.js` e `hudView.js` só desenham. Corrige o "undefined" dos balcões.

## Technical Context

**Language/Version**: JavaScript ESM (sem TS) · **Primary Dependencies**: Phaser 3, React 19, Tailwind v4 + daisyUI 5 (já aprovadas) · **Storage**: N/A · **Testing**: Vitest · **Target Platform**: navegador desktop · **Performance Goals**: 60 fps; redesenho dos Graphics só do que muda por quadro (estático desenhado uma vez) · **Constraints**: JS inicial ≤ 250 KiB gzip; sem dependências nem fontes externas (CSP) · **Scale/Scope**: 1 cozinha, 7 tipos de estação, 2 chefs.

## Constitution Check

`.specify/memory/constitution.md` + AGENTS.md:
- Core intocado (só leitura do estado) — OK.
- Lógica fora da cena: módulos puros `cosmeticLook.js`, `stationVisual.js`, `chefVisual.js` com testes — OK.
- Textos via i18n (`game.kitchen.pass`, `game.kitchen.chef.*`) — OK.
- Sem dependência nova — OK. Shutdown: objetos pertencem à cena (destruídos no shutdown); nenhum timer/tween novo — OK.

## Project Structure

```text
src/game/phaser/
├── cosmeticLook.js(+test)  # paletas por tema, cores de jogador, resolveLook estendido
├── stationVisual.js(+test) # ícone/rótulo, estado do fogão (barras, aviso), itens
├── chefVisual.js(+test)    # offsets de olhos/indicador/item, balanço
├── kitchenView.js          # só desenha
└── hudView.js              # só desenha (fichas de papel)
src/features/cosmetics/cosmetics.js  # getLook passa themeId
src/index.css                        # tokens bistrô + pilhas de fonte
```

**Structure Decision**: estender `cosmeticLook.js` (resolveLook) com `themeId`→paleta em vez de novo canal no registry.

## Complexity Tracking

Nenhuma violação.

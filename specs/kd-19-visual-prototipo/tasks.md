# Tasks: Visual do protótipo (KD-19 parte 1)

**Input**: spec.md, plan.md, research.md, data-model.md

## Phase 1: Setup

- [X] T001 Adicionar chave i18n `game.kitchen.pass` ("PASSE") em src/i18n/pt-BR.json

## Phase 2: Foundational

- [X] T002 Estender `resolveLook` com `themeId` → `palette` (floor[2], wall, counter, top; desconhecido → bistro) e cor de jogador por chef (P1 #7a1f2b, P2 #2f6fb0), com testes em src/game/phaser/cosmeticLook.js e src/game/phaser/cosmeticLook.test.js
- [X] T003 Passar `themeId` em `getLook` em src/features/cosmetics/cosmetics.js e ajustar src/features/cosmetics/cosmetics.test.js

## Phase 3: US1 — Cozinha (P1)

- [X] T004 [US1] Criar src/game/phaser/stationVisual.js (+test): `stationIcon` (sem "undefined" para counter — teste de regressão), `itemVisual`, `stoveVisual` (aceso, frações de cozimento/queima, aviso nos últimos 1/3 piscando), `dashSegments`
- [X] T005 [US1] Reescrever o desenho de piso/parede/balcão/estações/fogão em src/game/phaser/kitchenView.js usando T002/T004

## Phase 4: US2 — Chefs e itens (P2)

- [X] T006 [US2] Criar src/game/phaser/chefVisual.js (+test): offsets de olhos/indicador/item por `facing`, balanço ao andar, rótulo/anel só no 2P
- [X] T007 [US2] Desenhar chefs, itens e alvo tracejado em src/game/phaser/kitchenView.js

## Phase 5: US3 — HUD (P3)

- [X] T008 [US3] Fichas de papel, caixas de pontos/tempo e paleta em src/game/phaser/hudView.js (cores por banda via mapa puro em src/game/phaser/hudModel.js se necessário)

## Phase 6: Polish

- [X] T009 [P] Tokens bistrô e pilhas de fonte em src/index.css
- [X] T010 Rodar gates (format:check, lint, test, build, check-size) e escrever rascunho do PR

## Dependencies

T001–T003 → US1 → US2 (mesmo arquivo kitchenView) → US3 independente → Polish.

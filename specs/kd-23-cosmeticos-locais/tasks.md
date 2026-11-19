# Tasks: Cosméticos locais (KD-23)

## Phase 1: Setup

- [X] T001 Spec Kit em specs/kd-23-cosmeticos-locais/

## Phase 2: Foundational

- [X] T002 Regras puras e testes (`bestScore` inteiro ≥ 0; `unlocked` só com ids do catálogo; `equipped` inválido → padrão do slot) em src/features/cosmetics/cosmetics.js e cosmetics.test.js
- [X] T003 Store `kd:v1:cosmetics` e testes em src/features/cosmetics/cosmeticsStore.js e cosmeticsStore.test.js

## Phase 3: US1 desbloqueio e aviso

- [X] T004 [US1] `recordOnce` registra a pontuação e devolve `unlocked` em src/features/progress/useRecordedResult.js (+ teste)
- [X] T005 [US1] Aviso dos itens desbloqueados em src/features/match/MatchResult.jsx (+ i18n `play.result.unlocked`)

## Phase 4: US2 personalização

- [X] T006 [US2] CosmeticsPicker (radio por slot, teclado, aviso de não persistente, erro) em src/features/cosmetics/CosmeticsPicker.jsx (+ teste)
- [X] T007 [US2] Montar o picker em src/app/ProfilePage.jsx; "Apagar progresso" também limpa cosméticos em src/features/progress/LocalProgress.jsx

## Phase 5: US3 cena

- [X] T008 [US3] `COSMETICS_KEY` em src/game/phaser/registryKeys.js; PhaserGame grava; PlayPage lê `loadCosmeticLook`
- [X] T009 [US3] kitchenView desenha chapéu/avental e tema; KitchenScene passa o visual

## Phase 6: Polish

- [X] T010 Registrar decisões em docs/ESTUDOS_E_DECISOES.md; gates

## Phase 7: Cosmético por jogador (decisão da pessoa)

- [X] T011 `equippedP2`, `equipP2`, migração do formato antigo e `getLook` por chef em src/features/cosmetics/cosmetics.js (+ teste)
- [X] T012 `equipCosmeticP2` em src/features/cosmetics/cosmeticsStore.js (+ teste de migração)
- [X] T013 `resolveLook` por chef e kitchenView com chapéu/avental do chef (+ teste)
- [X] T014 Seção do Jogador 2 no CosmeticsPicker com textos no i18n
- [X] T015 Atualizar spec, data-model, contrato e ESTUDOS_E_DECISOES

## Dependencies

T002 → T003 → (T004, T006, T008). US1/US2/US3 são independentes depois da Phase 2.

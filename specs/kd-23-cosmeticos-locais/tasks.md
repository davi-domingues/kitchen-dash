# Tasks: Cosméticos locais (KD-23)

## Phase 1: Setup

- [X] T001 Spec Kit em specs/kd-23-cosmeticos-locais/

## Phase 2: Foundational

- [ ] T002 Regras puras e testes (`bestScore` inteiro ≥ 0; `unlocked` só com ids do catálogo; `equipped` inválido → padrão do slot) em src/features/cosmetics/cosmetics.js e cosmetics.test.js
- [ ] T003 Store `kd:v1:cosmetics` e testes em src/features/cosmetics/cosmeticsStore.js e cosmeticsStore.test.js

## Phase 3: US1 desbloqueio e aviso

- [ ] T004 [US1] `recordOnce` registra a pontuação e devolve `unlocked` em src/features/progress/useRecordedResult.js (+ teste)
- [ ] T005 [US1] Aviso dos itens desbloqueados em src/features/match/MatchResult.jsx (+ i18n `play.result.unlocked`)

## Phase 4: US2 personalização

- [ ] T006 [US2] CosmeticsPicker (radio por slot, teclado, aviso de não persistente, erro) em src/features/cosmetics/CosmeticsPicker.jsx (+ teste)
- [ ] T007 [US2] Montar o picker em src/app/ProfilePage.jsx; "Apagar progresso" também limpa cosméticos em src/features/progress/LocalProgress.jsx

## Phase 5: US3 cena

- [ ] T008 [US3] `COSMETICS_KEY` em src/game/phaser/registryKeys.js; PhaserGame grava; PlayPage lê `loadCosmeticLook`
- [ ] T009 [US3] kitchenView desenha chapéu/avental e tema; KitchenScene passa o visual

## Phase 6: Polish

- [ ] T010 Registrar decisões em docs/ESTUDOS_E_DECISOES.md; gates

## Dependencies

T002 → T003 → (T004, T006, T008). US1/US2/US3 são independentes depois da Phase 2.
